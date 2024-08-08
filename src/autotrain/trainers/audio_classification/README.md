---
license: apache-2.0
base_model: facebook/wav2vec2-base
tags:
- audio-classification
- generated_from_trainer
model-index:
- name: facebook/wav2vec2-base
  results: []
---

<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->

# facebook/wav2vec2-base

This model is a fine-tuned version of [facebook/wav2vec2-base](https://huggingface.co/facebook/wav2vec2-base) on the superb dataset.

## Model description

More information needed

## Intended uses & limitations

More information needed

## Training and evaluation data

More information needed

## Training procedure

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 2e-05
- train_batch_size: 64
- eval_batch_size: 8
- seed: 42
- optimizer: Adam with betas=(0.9,0.999) and epsilon=1e-06
- lr_scheduler_type: reduce_lr_on_plateau
- num_epochs: 50

### Framework versions

- Transformers 4.40.2
- Pytorch 2.2.2a0+gitb5d0b9b
- Datasets 2.19.1
- Tokenizers 0.19.1
