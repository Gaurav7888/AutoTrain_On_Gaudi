from functools import partial
from datasets import load_dataset, load_from_disk
import argparse
import json

import torch
from datasets import Dataset
from peft.tuners.lora import LoraLayer
from transformers import Trainer, TrainingArguments, default_data_collator
from transformers.trainer_callback import PrinterCallback

from autotrain import logger
from autotrain.trainers.clm import utils
from autotrain.trainers.clm.params import LLMTrainingParams

from optimum.habana import GaudiConfig, GaudiTrainer, GaudiTrainingArguments
from transformers import HfArgumentParser, AutoConfig

from dataclasses import dataclass, field
from typing import Optional
import os
import sys

@dataclass
class ModelArguments:
    """
    Arguments pertaining to which model/config/tokenizer we are going to fine-tune, or train from scratch.
    """

    model_name_or_path: Optional[str] = field(
        default=None,
        metadata={
            "help": (
                "The model checkpoint for weights initialization. Don't set if you want to train a model from scratch."
            )
        },
    )
    model_type: Optional[str] = field(
        default=None
    )
    config_overrides: Optional[str] = field(
        default=None,
        metadata={
            "help": (
                "Override some existing default config settings when a model is trained from scratch. Example: "
                "n_embd=10,resid_pdrop=0.2,scale_attn_weights=false,summary_type=cls_index"
            )
        },
    )
    config_name: Optional[str] = field(
        default=None, metadata={"help": "Pretrained config name or path if not the same as model_name"}
    )
    tokenizer_name: Optional[str] = field(
        default=None, metadata={"help": "Pretrained tokenizer name or path if not the same as model_name"}
    )
    cache_dir: Optional[str] = field(
        default=None,
        metadata={"help": "Where do you want to store the pretrained models downloaded from huggingface.co"},
    )
    use_fast_tokenizer: bool = field(
        default=True,
        metadata={"help": "Whether to use one of the fast tokenizer (backed by the tokenizers library) or not."},
    )
    model_revision: str = field(
        default="main",
        metadata={"help": "The specific model version to use (can be a branch name, tag name or commit id)."},
    )
    token: str = field(
        default=None,
        metadata={
            "help": (
                "The token to use as HTTP bearer authorization for remote files. If not specified, will use the token "
                "generated when running `huggingface-cli login` (stored in `~/.huggingface`)."
            )
        },
    )
    trust_remote_code: bool = field(
        default=False,
        metadata={
            "help": (
                "Whether or not to allow for custom models defined on the Hub in their own modeling files. This option "
                "should only be set to `True` for repositories you trust and in which you have read the code, as it will "
                "execute code present on the Hub on your local machine."
            )
        },
    )
    torch_dtype: Optional[str] = field(
        default=None,
        metadata={
            "help": (
                "Override the default `torch.dtype` and load the model under this dtype. If `auto` is passed, the "
                "dtype will be automatically derived from the model's weights."
            ),
            "choices": ["auto", "bfloat16", "float32"],
        },
    )
    low_cpu_mem_usage: bool = field(
        default=False,
        metadata={
            "help": (
                "It is an option to create the model as an empty shell, then only materialize its parameters when the pretrained weights are loaded. "
                "Setting it to True will benefit LLM loading time and RAM consumption."
            )
        },
    )

    def __post_init__(self):
        if self.config_overrides is not None and (self.config_name is not None or self.model_name_or_path is not None):
            raise ValueError(
                "--config_overrides can't be used in combination with --config_name or --model_name_or_path"
            )


@dataclass
class DataTrainingArguments:
    """
    Arguments pertaining to what data we are going to input our model for training and eval.
    """

    dataset_name: Optional[str] = field(
        default=None, metadata={"help": "The name of the dataset to use (via the datasets library)."}
    )
    block_size: Optional[int] = field(
        default=None,
        metadata={
            "help": (
                "Optional input sequence length after tokenization. "
                "The training dataset will be truncated in block of this size for training. "
                "Default to the model max input length for single sentence inputs (take into account special tokens)."
            )
        },
    )
    data_config: Optional[str] = field(default=None)
    data_path: Optional[str] = field(default=None)
    dataset_config_name: Optional[str] = field(
        default=None, metadata={"help": "The configuration name of the dataset to use (via the datasets library)."}
    )
    train_file: Optional[str] = field(default=None, metadata={"help": "The input training data file (a text file)."})
    validation_file: Optional[str] = field(
        default=None,
        metadata={"help": "An optional input evaluation data file to evaluate the perplexity on (a text file)."},
    )
    overwrite_cache: bool = field(
        default=False, metadata={"help": "Overwrite the cached training and evaluation sets"}
    )
    validation_split_percentage: Optional[int] = field(
        default=5,
        metadata={
            "help": "The percentage of the train set used as validation set in case there's no validation split"
        },
    )
    max_seq_length: Optional[int] = field(
        default=None,
        metadata={
            "help": (
                "The maximum total input sequence length after tokenization. Sequences longer "
                "than this will be truncated."
            )
        },
    )
    preprocessing_num_workers: Optional[int] = field(
        default=None,
        metadata={"help": "The number of processes to use for the preprocessing."},
    )
    mlm_probability: float = field(
        default=0.15, metadata={"help": "Ratio of tokens to mask for masked language modeling loss"}
    )
    line_by_line: bool = field(
        default=False,
        metadata={"help": "Whether distinct lines of text in the dataset are to be handled as distinct sequences."},
    )
    pad_to_max_length: bool = field(
        default=False,
        metadata={
            "help": (
                "Whether to pad all samples to `max_seq_length`. "
                "If False, will pad the samples dynamically when batching to the maximum length in the batch."
            )
        },
    )
    max_train_samples: Optional[int] = field(
        default=None,
        metadata={
            "help": (
                "For debugging purposes or quicker training, truncate the number of training examples to this "
                "value if set."
            )
        },
    )
    max_eval_samples: Optional[int] = field(
        default=None,
        metadata={
            "help": (
                "For debugging purposes or quicker training, truncate the number of evaluation examples to this "
                "value if set."
            )
        },
    )
    streaming: bool = field(default=False, metadata={"help": "Enable streaming mode."})

def process_data(data, tokenizer, config):
    data = data.to_pandas()
    data = data.fillna("")

    data = data[[config.text_column]]
    if config.add_eos_token:
        data[config.text_column] = data[config.text_column] + tokenizer.eos_token
    data = Dataset.from_pandas(data)
    return data

def parse_args():
    # get training_config.json from the end user
    parser = argparse.ArgumentParser()
    parser.add_argument("--training_config", type=str, required=True)
    return parser.parse_args()

def train(config):
    print(f"======================== CONFIG: {config} {type(config)}=================")
    parser = HfArgumentParser((ModelArguments, DataTrainingArguments, GaudiTrainingArguments))
    model_args, data_args, gaudi_training_args = parser.parse_json_file(json_file=os.path.abspath(sys.argv[2]))

    print(f"============ Gaudi Training Args: {gaudi_training_args}")
    logger.info("Starting default/generic CLM training...")
    print(f"============ Data Args: {data_args}")
    logger.info("Starting default/generic CLM training...")
    print(f"============ Model Args: {model_args}")
    logger.info("Starting default/generic CLM training...")
    # if isinstance(config, dict):
    #     config = LLMTrainingParams(**config)
    print("CONFIG: ", config)

    if data_args.dataset_name is not None:
        # Downloading and loading a dataset from the hub.
        raw_datasets = load_dataset(
            data_args.dataset_name,
            data_args.data_config,
            cache_dir=model_args.cache_dir,
            token=model_args.token,
            streaming=data_args.streaming,
        )
        if "validation" not in raw_datasets.keys():
            raw_datasets["validation"] = load_dataset(
                data_args.dataset_name,
                data_args.data_config,
                split=f"train[:{data_args.validation_split_percentage}%]",
                cache_dir=model_args.cache_dir,
                token=model_args.token,
                streaming=data_args.streaming,
            )
            raw_datasets["train"] = load_dataset(
                data_args.dataset_name,
                data_args.data_config,
                split=f"train[{data_args.validation_split_percentage}%:]",
                cache_dir=model_args.cache_dir,
                token=model_args.token,
                streaming=data_args.streaming,
            )

    config_kwargs = {
        "cache_dir": model_args.cache_dir,
        "revision": model_args.model_revision,
        "token": model_args.token,
        "trust_remote_code": model_args.trust_remote_code,
    }
    if model_args.config_name:
        config = AutoConfig.from_pretrained(model_args.config_name, **config_kwargs)
    elif model_args.model_name_or_path:
        config = AutoConfig.from_pretrained(model_args.model_name_or_path, **config_kwargs)
    # else:
    #     config = CONFIG_MAPPING[model_args.model_type]()
    #     logger.warning("You are instantiating a new config instance from scratch.")
    #     if model_args.config_overrides is not None:
    #         logger.info(f"Overriding config: {model_args.config_overrides}")
    #         config.update_from_string(model_args.config_overrides)
    #         logger.info(f"New config: {config}")

    tokenizer_kwargs = {
        "cache_dir": model_args.cache_dir,
        "use_fast": model_args.use_fast_tokenizer,
        "revision": model_args.model_revision,
        "token": model_args.token,
        "trust_remote_code": model_args.trust_remote_code,
    }
    from transformers import AutoTokenizer
    if model_args.tokenizer_name:
        tokenizer = AutoTokenizer.from_pretrained(model_args.tokenizer_name, **tokenizer_kwargs)
    elif model_args.model_name_or_path:
        tokenizer = AutoTokenizer.from_pretrained(model_args.model_name_or_path, **tokenizer_kwargs)
    else:
        raise ValueError(
            "You are instantiating a new tokenizer from scratch. This is not supported by this script. "
            "You can do it from another script, save it, and load it from here, using --tokenizer_name."
        )
    from transformers import AutoModelForCausalLM
    if model_args.model_name_or_path:
        torch_dtype = (
            model_args.torch_dtype
            if model_args.torch_dtype in ["auto", None]
            else getattr(torch, model_args.torch_dtype)
        )
        model = AutoModelForCausalLM.from_pretrained(
            model_args.model_name_or_path,
            from_tf=bool(".ckpt" in model_args.model_name_or_path),
            config=config,
            cache_dir=model_args.cache_dir,
            revision=model_args.model_revision,
            token=model_args.token,
            trust_remote_code=model_args.trust_remote_code,
            torch_dtype=torch_dtype,
            low_cpu_mem_usage=model_args.low_cpu_mem_usage,
        )
    else:
        model = AutoModelForCausalLM.from_config(config, trust_remote_code=model_args.trust_remote_code)
        n_params = sum({p.data_ptr(): p.numel() for p in model.parameters()}.values())

    # We resize the embeddings only when necessary to avoid index errors. If you are creating a model from scratch
    # on a small vocab and want a smaller embedding size, remove this test.
    embedding_size = model.get_input_embeddings().weight.shape[0]
    if len(tokenizer) > embedding_size:
        model.resize_token_embeddings(len(tokenizer))

    # Preprocessing the datasets.
    # First we tokenize all the texts.
    if gaudi_training_args.do_train:
        column_names = list(raw_datasets["train"].features)
    else:
        column_names = list(raw_datasets["validation"].features)
    text_column_name = "text" if "text" in column_names else column_names[0]

    # since this will be pickled to avoid _LazyModule error in Hasher force logger loading before tokenize_function
    from transformers.testing_utils import CaptureLogger
    import transformers

    tok_logger = transformers.utils.logging.get_logger("transformers.tokenization_utils_base")

    def tokenize_function(examples):
        with CaptureLogger(tok_logger) as cl:
            output = tokenizer(examples[text_column_name])
        # clm input could be much much longer than block_size
        if "Token indices sequence length is longer than the" in cl.out:
            tok_logger.warning(
                "^^^^^^^^^^^^^^^^ Please ignore the warning above - this long input will be chunked into smaller bits"
                " before being passed to the model."
            )
        return output

    with gaudi_training_args.main_process_first(desc="dataset map tokenization"):
        if not data_args.streaming:
            tokenized_datasets = raw_datasets.map(
                tokenize_function,
                batched=True,
                num_proc=data_args.preprocessing_num_workers,
                remove_columns=column_names,
                load_from_cache_file=not data_args.overwrite_cache,
                desc="Running tokenizer on dataset",
            )
        else:
            tokenized_datasets = raw_datasets.map(
                tokenize_function,
                batched=True,
                remove_columns=column_names,
            )

    if hasattr(config, "max_position_embeddings"):
        max_pos_embeddings = config.max_position_embeddings
    else:
        # Define a default value if the attribute is missing in the config.
        max_pos_embeddings = 1024

    if data_args.block_size is None:
        block_size = tokenizer.model_max_length
        if block_size > max_pos_embeddings:
            logger.warning(
                f"The tokenizer picked seems to have a very large `model_max_length` ({tokenizer.model_max_length}). "
                f"Using block_size={min(1024, max_pos_embeddings)} instead. You can change that default value by passing --block_size xxx."
            )
            if max_pos_embeddings > 0:
                block_size = min(1024, max_pos_embeddings)
            else:
                block_size = 1024
    else:
        if data_args.block_size > tokenizer.model_max_length:
            logger.warning(
                f"The block_size passed ({data_args.block_size}) is larger than the maximum length for the model "
                f"({tokenizer.model_max_length}). Using block_size={tokenizer.model_max_length}."
            )
        block_size = min(data_args.block_size, tokenizer.model_max_length)

    # Main data processing function that will concatenate all texts from our dataset and generate chunks of block_size.
    from itertools import chain

    def group_texts(examples):
        # Concatenate all texts.
        concatenated_examples = {k: list(chain(*examples[k])) for k in examples.keys()}
        total_length = len(concatenated_examples[list(examples.keys())[0]])
        # We drop the small remainder, and if the total_length < block_size  we exclude this batch and return an empty dict.
        # We could add padding if the model supported it instead of this drop, you can customize this part to your needs.
        total_length = (total_length // block_size) * block_size
        # Split by chunks of max_len.
        result = {
            k: [t[i : i + block_size] for i in range(0, total_length, block_size)]
            for k, t in concatenated_examples.items()
        }
        result["labels"] = result["input_ids"].copy()
        return result

    # Note that with `batched=True`, this map processes 1,000 texts together, so group_texts throws away a remainder
    # for each of those groups of 1,000 texts. You can adjust that batch_size here but a higher value might be slower
    # to preprocess.
    #
    # To speed up this part, we use multiprocessing. See the documentation of the map method for more information:
    # https://huggingface.co/docs/datasets/process#map

    with gaudi_training_args.main_process_first(desc="grouping texts together"):
        if not data_args.streaming:
            lm_datasets = tokenized_datasets.map(
                group_texts,
                batched=True,
                num_proc=data_args.preprocessing_num_workers,
                load_from_cache_file=not data_args.overwrite_cache,
                desc=f"Grouping texts in chunks of {block_size}",
            )
        else:
            lm_datasets = tokenized_datasets.map(
                group_texts,
                batched=True,
            )

    if gaudi_training_args.do_train:

        def tensor_mapper(x):
            return {i: torch.tensor(x[i], dtype=torch.int32) for i in x}

        if "train" not in tokenized_datasets:
            raise ValueError("--do_train requires a train dataset")
        train_dataset = lm_datasets["train"]
        if gaudi_training_args.resume_from_checkpoint is not None and gaudi_training_args.resume_from_checkpoint != "":
            train_dataset = train_dataset.map(tensor_mapper)
        if data_args.max_train_samples is not None:
            max_train_samples = min(len(train_dataset), data_args.max_train_samples)
            train_dataset = train_dataset.select(range(max_train_samples))

    # if training_args.do_eval:
    #     if "validation" not in tokenized_datasets:
    #         raise ValueError("--do_eval requires a validation dataset")
    #     eval_dataset = lm_datasets["validation"]
    #     if data_args.max_eval_samples is not None:
    #         max_eval_samples = min(len(eval_dataset), data_args.max_eval_samples)
    #         eval_dataset = eval_dataset.select(range(max_eval_samples))

    #     def preprocess_logits_for_metrics(logits, labels):
    #         if isinstance(logits, tuple):
    #             # Depending on the model and config, logits may contain extra tensors,
    #             # like past_key_values, but logits always come first
    #             logits = logits[0]
    #         return logits.argmax(dim=-1)

    #     metric = evaluate.load("accuracy", cache_dir=model_args.cache_dir)

        def compute_metrics(eval_preds):
            preds, labels = eval_preds
            # preds have the same shape as the labels, after the argmax(-1) has been calculated
            # by preprocess_logits_for_metrics but we need to shift the labels
            labels = labels[:, 1:].reshape(-1)
            preds = preds[:, :-1].reshape(-1)
            return metric.compute(predictions=preds, references=labels)

    gaudi_config = GaudiConfig.from_pretrained(
        gaudi_training_args.gaudi_config_name,
        # cache_dir=model_args.cache_dir,
        # revision=model_args.model_revision,
        token=model_args.token,
    )
    tokenizer.add_special_tokens({'pad_token': '[PAD]'})
    # Initialize our Trainer
    trainer = GaudiTrainer(
        model=model,
        gaudi_config=gaudi_config,
        args=gaudi_training_args,
        train_dataset=train_dataset if gaudi_training_args.do_train else None,
        # eval_dataset=eval_dataset if gaudi_training_args.do_eval else None,
        tokenizer=tokenizer,
        # Data collator will default to DataCollatorWithPadding, so we change it.
        # data_collator=default_data_collator,
        # compute_metrics=compute_metrics if gaudi_training_args.do_eval else None,
        # preprocess_logits_for_metrics=preprocess_logits_for_metrics if gaudi_training_args.do_eval else None,
    )

    # train_data, valid_data = utils.process_input_data(config)
    # tokenizer = utils.get_tokenizer(config)
    # train_data, valid_data = utils.process_data_with_chat_template(config, tokenizer, train_data, valid_data)

    # train_data = process_data(
    #     data=train_data,
    #     tokenizer=tokenizer,
    #     config=config,
    # )
    # if config.valid_split is not None:
    #     valid_data = process_data(
    #         data=valid_data,
    #         tokenizer=tokenizer,
    #         config=config,
    #     )

        # logging_steps = utils.configure_logging_steps(config, train_data, valid_data)
        # training_args = utils.configure_training_args(config, logging_steps)
        # config = utils.configure_block_size(config, tokenizer)
        # args = TrainingArguments(**training_args)

    # model = utils.get_model(config, tokenizer)

    # tokenize_fn = partial(utils.tokenize, tokenizer=tokenizer, config=config)
    # group_texts_fn = partial(utils.group_texts, config=config)

    # train_data = train_data.map(
    #     tokenize_fn,
    #     batched=True,
    #     num_proc=1,
    #     remove_columns=list(train_data.features),
    #     desc="Running tokenizer on train dataset",
    # )

    # if config.valid_split is not None:
    #     valid_data = valid_data.map(
    #         tokenize_fn,
    #         batched=True,
    #         num_proc=1,
    #         remove_columns=list(valid_data.features),
    #         desc="Running tokenizer on validation dataset",
    #     )

    # train_data = train_data.map(
    #     group_texts_fn,
    #     batched=True,
    #     num_proc=4,
    #     desc=f"Grouping texts in chunks of {config.block_size}",
    # )

    # if config.valid_split is not None:
    #     valid_data = valid_data.map(
    #         group_texts_fn,
    #         batched=True,
    #         num_proc=4,
    #         desc=f"Grouping texts in chunks of {config.block_size}",
    #     )

    # logger.info("creating trainer")
    # callbacks = utils.get_callbacks(config)
    # trainer_args = dict(
    #     args=args,
    #     model=model,
    #     callbacks=callbacks,
    # )
    # trainer = Trainer(
    #     **trainer_args,
    #     train_dataset=train_data,
    #     eval_dataset=valid_data if config.valid_split is not None else None,
    #     tokenizer=tokenizer,
    #     data_collator=default_data_collator,
    # )

    # gaudi_config = GaudiConfig.from_pretrained(
    #     "Habana/gpt2",
    #     # cache_dir=model_args.cache_dir,
    #     # revision=model_args.model_revision,
    #     token=config.token,
    # )

    # print("GAUDI CONFIG: ", gaudi_config)
    
    # Initialize our Trainer
    # trainer = GaudiTrainer(
    #     model=model,
    #     gaudi_config=gaudi_config,
    #     args=gaudi_training_args,
    #     train_dataset=train_data,
    #     eval_dataset=eval_dataset,
    #     tokenizer=tokenizer,
    #     # data_collator=data_collator,
    #     # compute_metrics=compute_metrics if training_args.do_eval else None,
    #     # preprocess_logits_for_metrics=preprocess_logits_for_metrics if training_args.do_eval else None,
    # )

    # print("GAUDI TRAINER: ", trainer)

    # for name, module in trainer.model.named_modules():
    #     if isinstance(module, LoraLayer):
    #         if config.mixed_precision == "bf16":
    #             module = module.to(torch.bfloat16)
    #     if "norm" in name:
    #         module = module.to(torch.float32)
    #     if any(x in name for x in ["lm_head", "embed_tokens", "wte", "wpe"]):
    #         if hasattr(module, "weight"):
    #             if config.mixed_precision == "bf16" and module.weight.dtype == torch.float32:
    #                 module = module.to(torch.bfloat16)

    # trainer.remove_callback(PrinterCallback)
    trainer.train()
    # utils.post_training_steps(config, trainer)
<<<<<<< .merge_file_T9zmwu
    
args = parse_args()
training_config = json.load(open(args.training_config))
train(training_config)
=======
>>>>>>> .merge_file_9ckaLD
