
import logging
import os
import sys
from dataclasses import dataclass, field
from random import randint
from typing import Optional

import datasets
import evaluate
import numpy as np
import transformers
from datasets import DatasetDict, load_dataset
from transformers import AutoConfig, AutoFeatureExtractor, AutoModelForAudioClassification, HfArgumentParser
from transformers.trainer_utils import get_last_checkpoint
from transformers.utils import check_min_version, send_example_telemetry
from transformers.utils.versions import require_version

from optimum.habana import GaudiConfig, GaudiTrainer, GaudiTrainingArguments
from optimum.habana.utils import set_seed

def random_subsample(wav: np.ndarray, max_length: float, sample_rate: int = 16000):
    """Randomly sample chunks of `max_length` seconds from the input audio"""
    sample_length = int(round(sample_rate * max_length))
    if len(wav) <= sample_length:
        return wav
    random_offset = randint(0, len(wav) - sample_length - 1)
    return wav[random_offset : random_offset + sample_length]