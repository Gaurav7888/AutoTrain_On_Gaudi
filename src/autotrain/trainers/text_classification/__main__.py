    
import argparse
import json
import torch
from accelerate.state import PartialState
from datasets import load_dataset, load_from_disk
from huggingface_hub import HfApi
from dataclasses import dataclass, field
from torch.utils.tensorboard import SummaryWriter
from transformers import (
    AutoConfig,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    TrainerCallback,
    
    EarlyStoppingCallback,
    Trainer,
    TrainingArguments,
)
from transformers.trainer_callback import PrinterCallback
from transformers.integrations import TensorBoardCallback
import habana_frameworks.torch.hpu as hthpu
from autotrain import logger
from autotrain.trainers.common import (
    ALLOW_REMOTE_CODE,
    LossLoggingCallback,
    TrainStartCallback,
    UploadLogs,
    monitor,
    pause_space,
    remove_autotrain_data,
    save_training_params,
)
from autotrain.trainers.text_classification import utils
from autotrain.trainers.text_classification.dataset import TextClassificationDataset
from autotrain.trainers.text_classification.params import TextClassificationParams

from optimum.habana import GaudiConfig, GaudiTrainer, GaudiTrainingArguments
from optimum.habana.utils import set_seed
from typing import Optional

import logging
import os
import random
import sys
from dataclasses import dataclass, field
from typing import Optional

import datasets
import evaluate
import numpy as np
import transformers
from datasets import load_dataset
from transformers import (
    AutoConfig,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    EvalPrediction,
    HfArgumentParser,
    PretrainedConfig,
    default_data_collator,
)
from transformers.trainer_utils import get_last_checkpoint
from transformers.utils import check_min_version, send_example_telemetry
from transformers.utils.versions import require_version

from optimum.habana import GaudiConfig, GaudiTrainer, GaudiTrainingArguments
from optimum.habana.utils import set_seed

task_to_keys = {
    "cola": ("sentence", None),
    "mnli": ("premise", "hypothesis"),
    "mrpc": ("sentence1", "sentence2"),
    "qnli": ("question", "sentence"),
    "qqp": ("question1", "question2"),
    "rte": ("sentence1", "sentence2"),
    "sst2": ("sentence", None),
    "stsb": ("sentence1", "sentence2"),
    "wnli": ("sentence1", "sentence2"),
}

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--training_config", type=str, required=True)
    return parser.parse_args()

@dataclass
class DataTrainingArguments:
    """
    Arguments pertaining to what data we are going to input our model for training and eval.

    Using `HfArgumentParser` we can turn this class
    into argparse arguments to be able to specify them on
    the command line.
    """

    project_name: Optional[str] = field(
        default="None",
        metadata={},
    )

    task_name: Optional[str] = field(
        default=None,
        metadata={},
    )
    dataset_name: Optional[str] = field(
        default=None, metadata={"help": "The name of the dataset to use (via the datasets library)."}
    )
    dataset_config_name: Optional[str] = field(
        default=None, metadata={"help": "The configuration name of the dataset to use (via the datasets library)."}
    )
    max_seq_length: int = field(
        default=128,
        metadata={
            "help": (
                "The maximum total input sequence length after tokenization. Sequences longer "
                "than this will be truncated, sequences shorter will be padded."
            )
        },
    )
    overwrite_cache: bool = field(
        default=False, metadata={"help": "Overwrite the cached preprocessed datasets or not."}
    )
    pad_to_max_length: bool = field(
        default=True,
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
    max_predict_samples: Optional[int] = field(
        default=None,
        metadata={
            "help": (
                "For debugging purposes or quicker training, truncate the number of prediction examples to this "
                "value if set."
            )
        },
    )
    train_file: Optional[str] = field(
        default=None, metadata={"help": "A csv or a json file containing the training data."}
    )
    validation_file: Optional[str] = field(
        default=None, metadata={"help": "A csv or a json file containing the validation data."}
    )
    problem_type: Optional[str] = field(
        default="single_label_classification",
        metadata={"help": "Problem type, such as single_label_classification or multi_label_classification"},
    )
    test_file: Optional[str] = field(default=None, metadata={"help": "A csv or a json file containing the test data."})
    column_mapping_target_column: Optional[str] = field(
        default="label",
        metadata={"help": "The name of the target column in the dataset."},
    )
    column_mapping_text_column: Optional[str] = field(
        default="text",
        metadata={"help": "The name of the text column in the dataset."},
    )
    train_split: Optional[str] = field(
        default="train",
        metadata={"help": "The name of the training split in the dataset."},
    )
    valid_split: Optional[str] = field(
        default="validation",
        metadata={"help": "The name of the validation split in the dataset."},
    )
    backend: Optional[str] = field(
        default="datasets",
        metadata={"help": "The backend to use for loading the dataset."},
    )
    username: Optional[str] = field(
        default="datasets",
        metadata={"help": "Username of Hf Acount"},
    )

    
    def __post_init__(self):
        if self.task_name is not None:
            self.task_name = self.task_name.lower()
            if self.task_name not in task_to_keys.keys():
                raise ValueError("Unknown task, you should pick one in " + ",".join(task_to_keys.keys()))
        elif self.dataset_name is not None:
            pass
        elif self.train_file is None or self.validation_file is None:
            raise ValueError("Need either a GLUE task, a training/validation file or a dataset name.")
        else:
            train_extension = self.train_file.split(".")[-1]
            assert train_extension in ["csv", "json"], "`train_file` should be a csv or a json file."
            validation_extension = self.validation_file.split(".")[-1]
            assert (
                validation_extension == train_extension
            ), "`validation_file` should have the same extension (csv or json) as `train_file`."


@dataclass
class ModelArguments:
    """
    Arguments pertaining to which model/config/tokenizer we are going to fine-tune from.
    """

    model_name_or_path: str = field(
        metadata={"help": "Path to pretrained model or model identifier from huggingface.co/models"}
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
    ignore_mismatched_sizes: bool = field(
        default=False,
        metadata={"help": "Will enable to load a pretrained model whose head dimensions are different."},
    )
    add_pad_token: bool = field(
        default=False,
        metadata={"help": "Will add `pad_token` to tokenizer and model's config as `eos_token` if it's not defined."},
    )
    mixed_precision: Optional[str] = field(
        default=False,
        metadata={"help": "Will add mixed precision."},
    ) 

import mlflow
import mlflow.pytorch

script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)
root_path = os.path.abspath(os.path.join(parent_dir, "..", "..", ".."))


ml_path = os.path.join(root_path,"mlruns")
mlflow.set_tracking_uri(ml_path)
mlflow.set_experiment("text classification")

# @monitor
def train(config):
    with mlflow.start_run() as run:
        parser = HfArgumentParser((ModelArguments, DataTrainingArguments, GaudiTrainingArguments))
        model_args, data_args, gaudi_training_args = parser.parse_json_file(json_file=os.path.abspath(sys.argv[2]))
        #model_args, data_args, gaudi_training_args = parser.parse_json_file(json_file='/root/kubernetes_files/varshit/AutoTrain_On_Gaudi/src/autotrain/trainers/text_classification/gaudi_training_config.json')
        # print("model_args", model_args)
        # print("data_args", data_args)
        print("training_args", gaudi_training_args)
        print(hthpu.is_available())
        device = torch.device("hpu")
        
        mlflow.log_params(model_args.__dict__)
        mlflow.log_params(data_args.__dict__)
        mlflow.log_params(gaudi_training_args.__dict__)
        # if isinstance(config, dict):
        #     config = TextClassificationParams(**config)
        train_data = None
        valid_data = None
        # check if config.train_split.csv exists in config.data_path
        
        if data_args.train_split is not None:
            if data_args.dataset_name == f"autotrain-data":
                logger.info("loading dataset from disk")
                ## we have to add data_path in data_args to enable local data path loading
                train_data = load_from_disk(config.data_path)[config.train_split]
            else:
                if ":" in data_args.train_split:
                    dataset_config_name, split = data_args.train_split.split(":")
                    train_data = load_dataset(
                        data_args.dataset_name,
                        name=dataset_config_name,
                        split=split,
                        token=model_args.token,
                    )
                else:
                    train_data = load_dataset(
                        data_args.dataset_name,
                        split=data_args.train_split,
                        token=model_args.token,
                    )
        if data_args.valid_split is not None:
            if data_args.dataset_name == f"autotrain-data":
                logger.info("loading dataset from disk")
                valid_data = load_from_disk(data_args.dataset_name)[data_args.valid_split]
            else:
                if ":" in data_args.valid_split:
                    dataset_config_name, split = data_args.valid_split.split(":")
                    valid_data = load_dataset(
                        data_args.dataset_name,
                        name=dataset_config_name,
                        split=split,
                        token=model_args.token,
                    )
                else:
                    valid_data = load_dataset(
                        data_args.dataset_name,
                        split=data_args.valid_split,
                        token=model_args.token,
                    )

        # padding = "max_length" if data_args.pad_to_max_length else False

        # if model.config.pad_token_id is None and tokenizer.pad_token is None:
        #     tokenizer.pad_token = tokenizer.eos_token
        #     model.config.pad_token_id = tokenizer.eos_token_id

        #print("train data", train_data)
        classes = train_data.features[data_args.column_mapping_target_column].names
        label2id = {c: i for i, c in enumerate(classes)}
        num_classes = len(classes)
        if num_classes < 2:
            raise ValueError("Invalid number of classes. Must be greater than 1.")

        if data_args.valid_split is not None:
            num_classes_valid = len(valid_data.unique(data_args.column_mapping_target_column))
            if num_classes_valid != num_classes:
                raise ValueError(
                    f"Number of classes in train and valid are not the same. Training has {num_classes} and valid has {num_classes_valid}"
                )
        model_config = AutoConfig.from_pretrained(model_args.model_name_or_path, num_labels=num_classes)
        model_config._num_labels = len(label2id)
        model_config.label2id = label2id
        model_config.id2label = {v: k for k, v in label2id.items()}
        
        try:
            model = AutoModelForSequenceClassification.from_pretrained(
                model_args.model_name_or_path,
                config=model_config,
                trust_remote_code=ALLOW_REMOTE_CODE,
                token=model_args.token,
                ignore_mismatched_sizes=True,
            )
        except OSError:
            model = AutoModelForSequenceClassification.from_pretrained(
                model_args.model_name_or_path,
                config=model_config,
                from_tf=True,
                trust_remote_code=ALLOW_REMOTE_CODE,
                token=model_args.token,
                ignore_mismatched_sizes=True,
            )
        model = model.to(device)

        tokenizer = AutoTokenizer.from_pretrained(model_args.model_name_or_path, token=model_args.token, trust_remote_code=ALLOW_REMOTE_CODE)  
        #tokenizer = tokenizer.to(device)
        train_data = TextClassificationDataset(data=train_data, tokenizer=tokenizer, config=data_args, device = device)
        if data_args.valid_split is not None:
            valid_data = TextClassificationDataset(data=valid_data, tokenizer=tokenizer, config=data_args, device = device)

        # if config.logging_steps == -1:
        #     if config.valid_split is not None:
        #         logging_steps = int(0.2 * len(valid_data) / config.batch_size)
        #     else:
        #         logging_steps = int(0.2 * len(train_data) / config.batch_size)
        #     if logging_steps == 0:
        #         logging_steps = 1
        #     if logging_steps > 25:
        #         logging_steps = 25
        #     config.logging_steps = logging_steps
        # else:
        #     logging_steps = config.logging_steps

        #logger.info(f"Logging steps: {logging_steps}")


        # training_args = dict(
        #     output_dir=config.project_name,
        #     per_device_train_batch_size=config.batch_size,
        #     per_device_eval_batch_size=2 * config.batch_size,
        #     learning_rate=config.lr,
        #     num_train_epochs=config.epochs,
        #     #eval_strategy=config.eval_strategy if config.valid_split is not None else "no",
        #     logging_steps=logging_steps,
        #     save_total_limit=config.save_total_limit,
        #     save_strategy=config.eval_strategy if config.valid_split is not None else "no",
        #     gradient_accumulation_steps=config.gradient_accumulation,
        #     report_to=config.log,
        #     auto_find_batch_size=config.auto_find_batch_size,
        #     lr_scheduler_type=config.scheduler,
        #     optim=config.optimizer,
        #     warmup_ratio=config.warmup_ratio,
        #     weight_decay=config.weight_decay,
        #     max_grad_norm=config.max_grad_norm,
        #     push_to_hub=False,
        #     load_best_model_at_end=True if config.valid_split is not None else False,
        #     ddp_find_unused_parameters=False,
        # )

        # if model_args.mixed_precision == "fp16":
        #     training_args["fp16"] = True
        # if model_args.mixed_precision == "bf16":
        #     training_args["bf16"] = True

        # if data_args.valid_split is not None:
        #     early_stop = EarlyStoppingCallback(
        #         early_stopping_patience=config.early_stopping_patience,
        #         early_stopping_threshold=config.early_stopping_threshold,
        #     )
        #     callbacks_to_use = [early_stop]
        # else:
        #     callbacks_to_use = []

        # callbacks_to_use.extend([UploadLogs(config=gaudi_training_args), LossLoggingCallback(), TrainStartCallback()])

        #print("training_args", training_args)
        
        #args = TrainingArguments(**training_args)
        # trainer_args = dict(
        #     args=args,
        #     model=model,
        #     callbacks=callbacks_to_use,
        #     compute_metrics=(
        #         utils._binary_classification_metrics if num_classes == 2 else utils._multi_class_classification_metrics
        #     ),
        # )
        # del training_args['output_dir']
        # del training_args['per_device_train_batch_size']
        # del training_args['per_device_eval_batch_size']
        
        # args = TrainingArguments(**training_args)
        # trainer_args = dict(
        #     args=args,
        #     model=model,
        #     callbacks=callbacks_to_use,
        #     compute_metrics=(
        #         utils._binary_classification_metrics if num_classes == 2 else utils._multi_class_classification_metrics
        #     ),
        # )
    
        gaudi_config = GaudiConfig.from_pretrained(
            "Habana/bert-large-uncased-whole-word-masking",
            cache_dir=None,
            revision="main",
            token=None,
        )
        #print("gaudi_training_args",gaudi_training_args)
        trainer = GaudiTrainer(
            model=model,
            gaudi_config=gaudi_config,
            args=gaudi_training_args,
            train_dataset=train_data,
            eval_dataset=valid_data,
            #compute_metrics=compute_metrics,
            tokenizer=tokenizer,
            #data_collator=data_collator,
            
            
        )
        # tb_writer = SummaryWriter()
        # trainer.add_callback(CustomCallback(trainer))
        # trainer.add_callback(TensorBoardCallback())
        # trainer.add_callback(MLflowCallback(trainer))
        # trainer.add_callback(LoguruCustomCallback(trainer))
        trainer.add_callback(UnifiedLoggingCallback(trainer))

        # trainer = Trainer(
        #     **trainer_args,
        #     train_dataset=train_data,
        #     eval_dataset=valid_data,
        # )

        trainer.remove_callback(PrinterCallback)
        trainer_result = trainer.train()
        # for metric_name,metric_value in trainer_result.metrics.items():
        #     if metric_name == 'memory_allocated (GB)':
        #         mlflow.log_metric('memory_allocated_GB', metric_value)
        #         continue
        #     if metric_name == 'total_memory_available (GB)':
        #         mlflow.log_metric('total_memory_available_GB', metric_value)
        #         continue
        #     if metric_name == 'max_memory_allocated (GB)':
        #         mlflow.log_metric('max_memory_allocated_GB', metric_value)
        #         continue
            
            # mlflow.log_metric(metric_name,metric_value)
            
        mlflow.pytorch.log_model(model,"model")
        # mlflow.log_artifact("mlflow_dir")
        print("Finished training, saving model...")
        #logger.info("Finished training, saving model...")
        # project_name = "trial"
        # trainer.save_model(project_name)
        # trainer.log_metrics("train", trainer_result.metrics)
        # trainer.save_metrics("train", trainer_result.metrics)
        # tokenizer.save_pretrained(project_name)
        # trainer.save_state()

        # model_card = utils.create_model_card(config, trainer, num_classes)

        # # save model card to output directory as README.md
        # with open(f"{config.project_name}/README.md", "w") as f:
        #     f.write(model_card)
        push_to_hub = False
        if push_to_hub:
            if PartialState().process_index == 0:
                remove_autotrain_data(config)
                save_training_params(config)
                #logger.info("Pushing model to hub...")
                api = HfApi(token=config.token)
                api.create_repo(
                    repo_id=f"{config.username}/{config.project_name}", repo_type="model", private=True, exist_ok=True
                )
                api.upload_folder(
                    folder_path=config.project_name,
                    repo_id=f"{config.username}/{config.project_name}",
                    repo_type="model",
                )

        if PartialState().process_index == 0:
            pause_space(config)


#adding a custom call back
from copy import deepcopy
class CustomCallback(TrainerCallback):
    
    def __init__(self, trainer) -> None:
        super().__init__()
        self._trainer = trainer
        
    def on_train_begin(self, args, state, control, **kwargs):
        print(f"Batch size used: {args.per_device_train_batch_size}")
    
    def on_epoch_end(self, args, state, control, **kwargs):
        if control.should_evaluate:
            control_copy = deepcopy(control)
            self._trainer.evaluate(eval_dataset=self._trainer.train_dataset, metric_key_prefix="train")
            print(f"Batch size used after epoch: {args.per_device_train_batch_size}")
            return control_copy
        
#custom tensorboard call back 
class CustomTensorBoardCallback(TrainerCallback):
    
    def __init__(self, trainer) -> None:
        super().__init__()
        self._trainer = trainer
        self.writer = SummaryWriter()  # Initialize the SummaryWriter
    
    def on_epoch_end(self, args, state, control, **kwargs):
        if control.should_evaluate:
            control_copy = deepcopy(control)
            
            # Evaluate on the training dataset
            train_metrics = self._trainer.evaluate(eval_dataset=self._trainer.train_dataset, metric_key_prefix="train")
            
            # Evaluate on the evaluation dataset
            eval_metrics = self._trainer.evaluate(eval_dataset=self._trainer.eval_dataset, metric_key_prefix="eval")

            # Log training metrics to TensorBoard
            for key, value in train_metrics.items():
                self.writer.add_scalar(f"Train/{key}", value, state.epoch)

            # Log evaluation metrics to TensorBoard
            for key, value in eval_metrics.items():
                self.writer.add_scalar(f"Eval/{key}", value, state.epoch)

            print(f"Metrics logged for epoch {state.epoch}")
            return control_copy

# mlflow call back
class MLflowCallback(TrainerCallback):
    
    def __init__(self, trainer) -> None:
        super().__init__()
        self._trainer = trainer
        
    
    def on_log(self, args, state, control, logs=None, **kwargs):
        if logs is not None:
            for key, value in logs.items():
                
                           
                
                if key == 'memory_allocated (GB)':
                    key='memory_allocated_GB'
                    
                if key == 'total_memory_available (GB)':
                    key = 'total_memory_available_GB'
                    
                if key == 'max_memory_allocated (GB)': 
                    key = 'max_memory_allocated_GB'
                key = 'log_'+key
                mlflow.log_metric(key, value, step=state.global_step)
    
    def on_epoch_end(self, args, state, control, **kwargs):
        if control.should_evaluate:
            control_copy = deepcopy(control)
            # Evaluate on the training dataset
            metrics = self._trainer.evaluate(eval_dataset=self._trainer.train_dataset, metric_key_prefix="train")
            print(f"Batch size used after epoch: {args.per_device_train_batch_size}")
            
            # Log each metric to MLflow
            for key, value in metrics.items():
                
                if key == 'memory_allocated (GB)':
                    key='memory_allocated_GB'
                    
                if key == 'total_memory_available (GB)':
                    key = 'total_memory_available_GB'
                    
                if key == 'max_memory_allocated (GB)': 
                    key = 'max_memory_allocated_GB'
                    
                mlflow.log_metric(key, value, step=state.global_step)
                
            metrics = self._trainer.evaluate(eval_dataset=self._trainer.eval_dataset, metric_key_prefix="eval")
            print(f"Batch size used after epoch: {args.per_device_train_batch_size}")
            
            # Log each metric to MLflow
            for key, value in metrics.items():
                
                if key == 'memory_allocated (GB)':
                    key='memory_allocated_GB'
                    
                if key == 'total_memory_available (GB)':
                    key = 'total_memory_available_GB'
                    
                if key == 'max_memory_allocated (GB)': 
                    key = 'max_memory_allocated_GB'
                    
                mlflow.log_metric(key, value, step=state.global_step)
                
                
                
            
            return control_copy
#logging call back
class LoguruCustomCallback(TrainerCallback):
    
    def __init__(self, trainer) -> None:
        super().__init__()
        self._trainer = trainer
        # Add a single log file with fixed name
        # logger.add("training_log.log", format="{time} {level} {message}", level="INFO")
        logger.add("training_log.log", format="{time} | {level} | {message}", level="INFO")
        
         
    def on_log(self, args, state, control, logs=None, **kwargs):
        # Update latest log metrics
        if logs is not None:
            if 'loss' in logs and 'grad_norm' in logs and 'learning_rate' in logs:
                latest_log_metrics = {
                    "loss": logs.get("loss", "N/A"),
                    "grad_norm": logs.get("grad_norm", "N/A"),
                    "learning_rate": logs.get("learning_rate", "N/A"),
                }
                logger.info(f"{latest_log_metrics}")  


    def on_epoch_end(self, args, state, control, **kwargs):
        if control.should_evaluate:
            control_copy = deepcopy(control)
            
            # Evaluate on the training dataset
            train_metrics = self._trainer.evaluate(eval_dataset=self._trainer.train_dataset, metric_key_prefix="train")
            eval_metrics = self._trainer.evaluate(eval_dataset=self._trainer.eval_dataset, metric_key_prefix="eval")
            
            # Extract relevant metrics
            train_metrics_filtered = {
                
                "train_loss": train_metrics.get("train_loss", "N/A"),
                "train_runtime": train_metrics.get("train_runtime", "N/A"),
                "train_samples_per_second": train_metrics.get("train_samples_per_second", "N/A"),
                "train_steps_per_second": train_metrics.get("train_steps_per_second", "N/A"),
                "max_memory_allocated (GB)": train_metrics.get("max_memory_allocated (GB)", "N/A"),
            }
            
            eval_metrics_filtered = {
                "eval_loss": eval_metrics.get("eval_loss", "N/A"),
                "eval_runtime": eval_metrics.get("eval_runtime", "N/A"),
                "eval_samples_per_second": eval_metrics.get("eval_samples_per_second", "N/A"),
                "eval_steps_per_second": eval_metrics.get("eval_steps_per_second", "N/A"),
                "max_memory_allocated (GB)": eval_metrics.get("max_memory_allocated (GB)", "N/A"),
            }
            
            
            # Combine metrics into a single log message
            combined_metrics = {
                "epoch": state.epoch,
                **train_metrics_filtered,
                **eval_metrics_filtered,
                
                "batch_size": args.per_device_train_batch_size
            }
            
            logger.info(f"{combined_metrics}")
            return control_copy
        else:
            logger.info(f"Epoch {state.epoch} ended without evaluation.")
    
#unified call back
class UnifiedLoggingCallback(TrainerCallback):
    
    def __init__(self, trainer) -> None:
        super().__init__()
        self._trainer = trainer
        # script_dir = os.path.dirname(os.path.abspath(__file__))
        # parent_dir = os.path.dirname(script_dir)
        # root_path = os.path.abspath(os.path.join(parent_dir, "..", "..", ".."))
        path = os.path.join(root_path,'model_metrics.log')
        logger.add(path, format="{time} | {level} | {message}", level="INFO")
        
    def on_log(self, args, state, control, logs=None, **kwargs):
        if logs is not None:
            if 'loss' in logs and 'grad_norm' in logs and 'learning_rate' in logs:
            # Log to Loguru
                loguru_metrics = {
                    "epoch":logs.get("epoch","N/A"),
                    "loss": logs.get("loss", "N/A"),
                    "grad_norm": logs.get("grad_norm", "N/A"),
                    "learning_rate": logs.get("learning_rate", "N/A"),
                }
                logger.info(f"{loguru_metrics}")
            
            # Log to MLflow
                for key, value in loguru_metrics.items():
                    
                    mlflow.log_metric(f"{key}", value, step=state.global_step)
    
    def on_epoch_end(self, args, state, control, **kwargs):
        if control.should_evaluate:
            control_copy = deepcopy(control)
            
            # Evaluate on the training dataset
            train_metrics = self._trainer.evaluate(eval_dataset=self._trainer.train_dataset, metric_key_prefix="train")
            # Evaluate on the evaluation dataset
            eval_metrics = self._trainer.evaluate(eval_dataset=self._trainer.eval_dataset, metric_key_prefix="eval")
            
            # Combine and log metrics to Loguru
            combined_metrics = {
                "epoch": state.epoch,
                "train_loss": train_metrics.get("train_loss", "N/A"),
                "train_runtime": train_metrics.get("train_runtime", "N/A"),
                "train_samples_per_second": train_metrics.get("train_samples_per_second", "N/A"),
                "train_steps_per_second": train_metrics.get("train_steps_per_second", "N/A"),
                "eval_loss": eval_metrics.get("eval_loss", "N/A"),
                "eval_runtime": eval_metrics.get("eval_runtime", "N/A"),
                "eval_samples_per_second": eval_metrics.get("eval_samples_per_second", "N/A"),
                "eval_steps_per_second": eval_metrics.get("eval_steps_per_second", "N/A"),
                "batch_size": args.per_device_train_batch_size,
                "max_memory_allocated_GB": train_metrics.get("max_memory_allocated (GB)", "N/A"),
            }
            logger.info(f"{combined_metrics}")
            
            # Log metrics to MLflow
            for key, value in train_metrics.items():
                if key == 'memory_allocated (GB)':
                    continue
                elif key == 'total_memory_available (GB)':
                    continue
                elif key == 'max_memory_allocated (GB)': 
                    key = 'max_memory_allocated_GB'
                mlflow.log_metric(f"{key}", value, step=state.global_step)
                
            for key, value in eval_metrics.items():
                if key == 'memory_allocated (GB)':
                    continue
                elif key == 'total_memory_available (GB)':
                    continue
                elif key == 'max_memory_allocated (GB)': 
                    continue
                mlflow.log_metric(f"{key}", value, step=state.global_step)
                
            return control_copy
        else:
            logger.info(f"Epoch {state.epoch} ended without evaluation.")




if __name__ == "__main__":
    args = parse_args()
    training_config = json.load(open(args.training_config))
    #training_config = json.load(open('/root/kubernetes_files/varshit/AutoTrain_On_Gaudi/src/autotrain/trainers/text_classification/gaudi_training_config.json'))
    train(training_config)
    
