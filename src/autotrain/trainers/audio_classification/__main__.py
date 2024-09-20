import logging
from autotrain import logger
import argparse
import os
import sys
from dataclasses import dataclass, field
from random import randint
from typing import Optional
import json
import datasets
import evaluate
import numpy as np
import transformers
from datasets import DatasetDict, load_dataset
from transformers import AutoConfig, AutoFeatureExtractor, AutoModelForAudioClassification, HfArgumentParser,TrainerCallback
from transformers.trainer_utils import get_last_checkpoint
from transformers.utils import check_min_version, send_example_telemetry
from transformers.utils.versions import require_version

from optimum.habana import GaudiConfig, GaudiTrainer, GaudiTrainingArguments
from optimum.habana.utils import set_seed
from utils import random_subsample

def parase_args():
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

    dataset_name: Optional[str] = field(default=None, metadata={"help": "Name of a dataset from the datasets package"})
    dataset_config_name: Optional[str] = field(
        default=None, metadata={"help": "The configuration name of the dataset to use (via the datasets library)."}
    )
    train_file: Optional[str] = field(
        default=None, metadata={"help": "A file containing the training audio paths and labels."}
    )
    eval_file: Optional[str] = field(
        default=None, metadata={"help": "A file containing the validation audio paths and labels."}
    )
    train_split_name: str = field(
        default="train",
        metadata={
            "help": "The name of the training data set split to use (via the datasets library). Defaults to 'train'"
        },
    )
    eval_split_name: str = field(
        default="validation",
        metadata={
            "help": (
                "The name of the training data set split to use (via the datasets library). Defaults to 'validation'"
            )
        },
    )
    audio_column_name: str = field(
        default="audio",
        metadata={"help": "The name of the dataset column containing the audio data. Defaults to 'audio'"},
    )
    label_column_name: str = field(
        default="label", metadata={"help": "The name of the dataset column containing the labels. Defaults to 'label'"}
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
    max_length_seconds: float = field(
        default=20,
        metadata={"help": "Audio clips will be randomly cut to this length during training if the value is set."},
    )


@dataclass
class ModelArguments:
    """
    Arguments pertaining to which model/config/tokenizer we are going to fine-tune from.
    """

    model_name_or_path: str = field(
        default="facebook/wav2vec2-base",
        metadata={"help": "Path to pretrained model or model identifier from huggingface.co/models"},
    )
    config_name: Optional[str] = field(
        default=None, metadata={"help": "Pretrained config name or path if not the same as model_name"}
    )
    cache_dir: Optional[str] = field(
        default=None, metadata={"help": "Where do you want to store the pretrained models downloaded from the Hub"}
    )
    model_revision: str = field(
        default="main",
        metadata={"help": "The specific model version to use (can be a branch name, tag name or commit id)."},
    )
    feature_extractor_name: Optional[str] = field(
        default=None, metadata={"help": "Name or path of preprocessor config."}
    )
    freeze_feature_encoder: bool = field(
        default=True, metadata={"help": "Whether to freeze the feature encoder layers of the model."}
    )
    attention_mask: bool = field(
        default=True, metadata={"help": "Whether to generate an attention mask in the feature extractor."}
    )
    username: str = field(
        default="gosshh", metadata={"help": "Whether to generate an attention mask in the feature extractor."}
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
        default=True,
        metadata={
            "help": (
                "Whether to trust the execution of code from datasets/models defined on the Hub."
                " This option should only be set to `True` for repositories you trust and in which you have read the"
                " code, as it will execute code present on the Hub on your local machine."
            )
        },
    )
    ignore_mismatched_sizes: bool = field(
        default=False,
        metadata={"help": "Will enable to load a pretrained model whose head dimensions are different."},
    )
    mixed_precision: bool = field(
        default=True,
        metadata={"help": "Way to use autocast in gaudi"},
    )
import mlflow
import mlflow.pytorch

script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)
root_path = os.path.abspath(os.path.join(parent_dir, "..", "..", ".."))


ml_path = os.path.join(root_path,"mlruns")
mlflow.set_tracking_uri(ml_path)
mlflow.set_experiment("audio classification")

def train(training_config):
    with mlflow.start_run() as run:
        parser = HfArgumentParser((ModelArguments, DataTrainingArguments, GaudiTrainingArguments))
        model_args, data_args, training_args = parser.parse_json_file(json_file=os.path.abspath(sys.argv[2]))
        print("training_args", training_args)
        mlflow.log_params(model_args.__dict__)
        mlflow.log_params(data_args.__dict__)
        mlflow.log_params(training_args.__dict__)

        gaudi_config = GaudiConfig.from_pretrained(
            training_args.gaudi_config_name,
            cache_dir=model_args.cache_dir,
            revision=model_args.model_revision,
            token=model_args.token,
        )

        mixed_precision = training_args.bf16 or gaudi_config.use_torch_autocast
        set_seed(training_args.seed)

        # Detecting last checkpoint.
        last_checkpoint = None
        if os.path.isdir(training_args.output_dir) and training_args.do_train and not training_args.overwrite_output_dir:
            last_checkpoint = get_last_checkpoint(training_args.output_dir)
            if last_checkpoint is None and len(os.listdir(training_args.output_dir)) > 0:
                raise ValueError(
                    f"Output directory ({training_args.output_dir}) already exists and is not empty. "
                    "Use --overwrite_output_dir to train from scratch."
                )
            elif last_checkpoint is not None and training_args.resume_from_checkpoint is None:
                print(
                    f"Checkpoint detected, resuming training at {last_checkpoint}. To avoid this behavior, change "
                    "the `--output_dir` or add `--overwrite_output_dir` to train from scratch."
                )

        raw_datasets = DatasetDict()
        raw_datasets["train"] = load_dataset(
            data_args.dataset_name,
            data_args.dataset_config_name,
            split=data_args.train_split_name,
            token=model_args.token,
            trust_remote_code=True,
        )
        raw_datasets["eval"] = load_dataset(
            data_args.dataset_name,
            data_args.dataset_config_name,
            split=data_args.eval_split_name,
            token=model_args.token,
            trust_remote_code=True,
        )

        if data_args.audio_column_name not in raw_datasets["train"].column_names:
            raise ValueError(
                f"--audio_column_name {data_args.audio_column_name} not found in dataset '{data_args.dataset_name}'. "
                "Make sure to set `--audio_column_name` to the correct audio column - one of "
                f"{', '.join(raw_datasets['train'].column_names)}."
            )

        if data_args.label_column_name not in raw_datasets["train"].column_names:
            raise ValueError(
                f"--label_column_name {data_args.label_column_name} not found in dataset '{data_args.dataset_name}'. "
                "Make sure to set `--label_column_name` to the correct text column - one of "
                f"{', '.join(raw_datasets['train'].column_names)}."
            )

        feature_extractor = AutoFeatureExtractor.from_pretrained(
            model_args.feature_extractor_name or model_args.model_name_or_path,
            return_attention_mask=model_args.attention_mask,
            cache_dir=model_args.cache_dir,
            revision=model_args.model_revision,
            token=model_args.token,
            trust_remote_code=model_args.trust_remote_code,
        )

        # `datasets` takes care of automatically loading and resampling the audio,
        # so we just need to set the correct target sampling rate.
        raw_datasets = raw_datasets.cast_column(
            data_args.audio_column_name, datasets.features.Audio(sampling_rate=feature_extractor.sampling_rate)
        )

        # Max input length
        max_length = int(round(feature_extractor.sampling_rate * data_args.max_length_seconds))

        model_input_name = feature_extractor.model_input_names[0]

        def train_transforms(batch):
            """Apply train_transforms across a batch."""
            subsampled_wavs = []

            #print("batch", batch)
            for audio in batch[data_args.audio_column_name]:
                wav = random_subsample(
                    audio["array"], max_length=data_args.max_length_seconds, sample_rate=feature_extractor.sampling_rate
                )
                subsampled_wavs.append(wav)
            inputs = feature_extractor(
                subsampled_wavs,
                max_length=max_length,
                sampling_rate=feature_extractor.sampling_rate,
                padding="max_length",
                truncation=True,
            )
            output_batch = {model_input_name: inputs.get(model_input_name)}
            output_batch["labels"] = list(batch[data_args.label_column_name])

            return output_batch

        def val_transforms(batch):
            """Apply val_transforms across a batch."""
            wavs = [audio["array"] for audio in batch["audio"]]
            inputs = feature_extractor(
                wavs,
                max_length=max_length,
                sampling_rate=feature_extractor.sampling_rate,
                padding="max_length",
                truncation=True,
            )
            output_batch = {model_input_name: inputs.get(model_input_name)}
            output_batch["labels"] = batch["label"]

            return output_batch

        # Prepare label mappings.
        # We'll include these in the model's config to get human readable labels in the Inference API.
        labels = raw_datasets["train"].features[data_args.label_column_name].names
        label2id, id2label = {}, {}
        for i, label in enumerate(labels):
            label2id[label] = str(i)
            id2label[str(i)] = label

        #Load the accuracy metric from the datasets package
        metric = evaluate.load("accuracy", cache_dir=model_args.cache_dir)

        #Define our compute_metrics function. It takes an `EvalPrediction` object (a namedtuple with
        #`predictions` and `label_ids` fields) and has to return a dictionary string to float.
        def compute_metrics(eval_pred):
            """Computes accuracy on a batch of predictions"""
            predictions = np.argmax(eval_pred.predictions, axis=1)
            return metric.compute(predictions=predictions, references=eval_pred.label_ids)

        config = AutoConfig.from_pretrained(
            model_args.config_name or model_args.model_name_or_path,
            num_labels=len(labels),
            label2id=label2id,
            id2label=id2label,
            finetuning_task="audio-classification",
            cache_dir=model_args.cache_dir,
            revision=model_args.model_revision,
            token=model_args.token,
            trust_remote_code=model_args.trust_remote_code,
        )
        model = AutoModelForAudioClassification.from_pretrained(
            model_args.model_name_or_path,
            from_tf=bool(".ckpt" in model_args.model_name_or_path),
            config=config,
            cache_dir=model_args.cache_dir,
            revision=model_args.model_revision,
            token=model_args.token,
            trust_remote_code=model_args.trust_remote_code,
            ignore_mismatched_sizes=model_args.ignore_mismatched_sizes,
        )

        # freeze the convolutional waveform encoder if supported by model
        if hasattr(model, "freeze_feature_encoder") and model_args.freeze_feature_encoder:
            model.freeze_feature_encoder()

        if training_args.do_train:
            if data_args.max_train_samples is not None:
                raw_datasets["train"] = (
                    raw_datasets["train"].shuffle(seed=training_args.seed).select(range(data_args.max_train_samples))
                )
            # Set the training transforms
            raw_datasets["train"].set_transform(train_transforms, output_all_columns=False)

        if training_args.do_eval:
            if data_args.max_eval_samples is not None:
                raw_datasets["eval"] = (
                    raw_datasets["eval"].shuffle(seed=training_args.seed).select(range(data_args.max_eval_samples))
                )
            # Set the validation transforms
            raw_datasets["eval"].set_transform(val_transforms, output_all_columns=False)

        # Initialize our trainer
        trainer = GaudiTrainer(
            model=model,
            gaudi_config=gaudi_config,
            args=training_args,
            train_dataset=raw_datasets["train"] if training_args.do_train else None,
            eval_dataset=raw_datasets["eval"] if training_args.do_eval else None,
            compute_metrics=compute_metrics,
            tokenizer=feature_extractor,
        )
        # tb_writer = SummaryWriter()
        # trainer.add_callback(CustomCallback(trainer))
        # trainer.add_callback(TensorBoardCallback())
        # trainer.add_callback(MLflowCallback(trainer))
        # trainer.add_callback(LoguruCustomCallback(trainer))
        trainer.add_callback(UnifiedLoggingCallback(trainer))

        # Training
        if training_args.do_train:
            checkpoint = None
            if training_args.resume_from_checkpoint is not None:
                checkpoint = training_args.resume_from_checkpoint
            elif last_checkpoint is not None:
                checkpoint = last_checkpoint
            train_result = trainer.train(resume_from_checkpoint=checkpoint)
        trainer.save_model()
        trainer.log_metrics("train", train_result.metrics)
        trainer.save_metrics("train", train_result.metrics)
        trainer.save_state()

        # Evaluation
        # if training_args.do_eval:
        #     metrics = trainer.evaluate()
        #     #trainer.log_metrics("eval", metrics)
        #     trainer.save_metrics("eval", metrics)

        # Write model card and (optionally) push to hub
        kwargs = {
            "finetuned_from": model_args.model_name_or_path,
            "tasks": "audio-classification",
            "dataset": data_args.dataset_name,
            "tags": ["audio-classification"],
        }
        if training_args.push_to_hub:
            trainer.push_to_hub(**kwargs)
        else:
            trainer.create_model_card(**kwargs)
from copy import deepcopy
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
    args = parase_args()
    training_config = json.load(open(args.training_config))
    print("training_config", training_config)
    train(training_config)
