import collections
from pprint import pprint

from huggingface_hub import list_models


def get_sorted_models(hub_models):
    hub_models = [{"id": m.modelId, "downloads": m.downloads} for m in hub_models if m.private is False]
    hub_models = sorted(hub_models, key=lambda x: x["downloads"], reverse=True)
    hub_models = [m["id"] for m in hub_models]
    return hub_models


def _fetch_text_classification_models():
    # hub_models1 = list(
    #     list_models(
    #         task="fill-mask",
    #         library="transformers",
    #         sort="downloads",
    #         direction=-1,
    #         limit=100,
    #         full=False,
    #     )
    # )
    # hub_models2 = list(
    #     list_models(
    #         task="text-classification",
    #         library="transformers",
    #         sort="downloads",
    #         direction=-1,
    #         limit=100,
    #         full=False,
    #     )
    # )
    # hub_models = list(hub_models1) + list(hub_models2)
    # hub_models = get_sorted_models(hub_models)

    # trending_models = list(
    #     list_models(
    #         task="fill-mask",
    #         library="transformers",
    #         sort="likes7d",
    #         direction=-1,
    #         limit=30,
    #         full=False,
    #     )
    # )
    # if len(trending_models) > 0:
    #     trending_models = get_sorted_models(trending_models)
    #     hub_models = [m for m in hub_models if m not in trending_models]
    #     hub_models = trending_models + hub_models

    hub_models = ['meta-llama/LlamaGuard-7b', 'bert-large-uncased-whole-word-masking', 'google-bert/bert-base-uncased']
    return hub_models


def _fetch_llm_models():
    # hub_models = list(
    #     list_models(
    #         task="text-generation",
    #         library="transformers",
    #         sort="downloads",
    #         direction=-1,
    #         limit=100,
    #         full=False,
    #     )
    # )
    # hub_models = get_sorted_models(hub_models)
    # trending_models = list(
    #     list_models(
    #         task="text-generation",
    #         library="transformers",
    #         sort="likes7d",
    #         direction=-1,
    #         limit=30,
    #         full=False,
    #     )
    # )
    # if len(trending_models) > 0:
    #     trending_models = get_sorted_models(trending_models)
    #     hub_models = [m for m in hub_models if m not in trending_models]
    #     hub_models = trending_models + hub_models
    hub_models = [
        'gpt2', 'bigscience/bloom', 'meta-llama/Llama-2-70b-hf', 'tiiuae/falcon-7b',
        'tiiuae/falcon-40b', 'bigcode/starcoder', 'mistralai/Mixtral-8x7B-v0.1',
        'tiiuae/falcon-180B', 'microsoft/phi-2'
    ]
    return hub_models


def _fetch_image_classification_models():
    hub_models = list(
        list_models(
            task="image-classification",
            library="transformers",
            sort="downloads",
            direction=-1,
            limit=100,
            full=False,
        )
    )
    hub_models = get_sorted_models(hub_models)

    trending_models = list(
        list_models(
            task="image-classification",
            library="transformers",
            sort="likes7d",
            direction=-1,
            limit=30,
            full=False,
        )
    )
    if len(trending_models) > 0:
        trending_models = get_sorted_models(trending_models)
        hub_models = [m for m in hub_models if m not in trending_models]
        hub_models = trending_models + hub_models

    return hub_models


def _fetch_image_object_detection_models():
    hub_models = list(
        list_models(
            task="object-detection",
            library="transformers",
            sort="downloads",
            direction=-1,
            limit=100,
            full=False,
            pipeline_tag="object-detection",
        )
    )
    hub_models = get_sorted_models(hub_models)

    trending_models = list(
        list_models(
            task="object-detection",
            library="transformers",
            sort="likes7d",
            direction=-1,
            limit=30,
            full=False,
            pipeline_tag="object-detection",
        )
    )
    if len(trending_models) > 0:
        trending_models = get_sorted_models(trending_models)
        hub_models = [m for m in hub_models if m not in trending_models]
        hub_models = trending_models + hub_models

    return hub_models


def _fetch_dreambooth_models():
    # hub_models1 = list(
    #     list_models(
    #         task="text-to-image",
    #         sort="downloads",
    #         direction=-1,
    #         limit=100,
    #         full=False,
    #         filter=["diffusers:StableDiffusionXLPipeline"],
    #     )
    # )
    # hub_models2 = list(
    #     list_models(
    #         task="text-to-image",
    #         sort="downloads",
    #         direction=-1,
    #         limit=100,
    #         full=False,
    #         filter=["diffusers:StableDiffusionPipeline"],
    #     )
    # )
    # hub_models = list(hub_models1) + list(hub_models2)
    # hub_models = get_sorted_models(hub_models)

    # trending_models1 = list(
    #     list_models(
    #         task="text-to-image",
    #         sort="likes7d",
    #         direction=-1,
    #         limit=30,
    #         full=False,
    #         filter=["diffusers:StableDiffusionXLPipeline"],
    #     )
    # )
    # trending_models2 = list(
    #     list_models(
    #         task="text-to-image",
    #         sort="likes7d",
    #         direction=-1,
    #         limit=30,
    #         full=False,
    #         filter=["diffusers:StableDiffusionPipeline"],
    #     )
    # )
    # trending_models = list(trending_models1) + list(trending_models2)
    # if len(trending_models) > 0:
    #     trending_models = get_sorted_models(trending_models)
    #     hub_models = [m for m in hub_models if m not in trending_models]
    #     hub_models = trending_models + hub_models

    hub_models = ['CompVis/stable-diffusion-v1-4', 'stabilityai/stable-diffusion-2-1', 'stabilityai/stable-diffusion-2-1-base'
        'Intel/ldm3d-4c', 'stabilityai/stable-diffusion-xl-base-1.0', 'stabilityai/sdxl-turbo', 'stabilityai/stable-diffusion-3-medium-diffusers'
        'stabilityai/stable-diffusion-2-inpainting', 'diffusers/stable-diffusion-xl-1.0-inpainting-0.1', 'timbrooks/instruct-pix2pix',
        'stabilityai/stable-diffusion-xl-refiner-1.0', 'lambdalabs/sd-image-variations-diffusers', 'stabilityai/stable-diffusion-2-depth',
        'google/ddpm-ema-celebahq-256', 'stabilityai/stable-video-diffusion-img2vid-xt', 'stabilityai/stable-video-diffusion-img2vid-xt'
    ]
    return hub_models


def _fetch_seq2seq_models():
    hub_models = list(
        list_models(
            task="text2text-generation",
            library="transformers",
            sort="downloads",
            direction=-1,
            limit=100,
            full=False,
        )
    )
    hub_models = get_sorted_models(hub_models)
    trending_models = list(
        list_models(
            task="text2text-generation",
            library="transformers",
            sort="likes7d",
            direction=-1,
            limit=30,
            full=False,
        )
    )
    if len(trending_models) > 0:
        trending_models = get_sorted_models(trending_models)
        hub_models = [m for m in hub_models if m not in trending_models]
        hub_models = trending_models + hub_models
    return hub_models


def _fetch_token_classification_models():
    hub_models1 = list(
        list_models(
            task="fill-mask",
            library="transformers",
            sort="downloads",
            direction=-1,
            limit=100,
            full=False,
        )
    )
    hub_models2 = list(
        list_models(
            task="token-classification",
            library="transformers",
            sort="downloads",
            direction=-1,
            limit=100,
            full=False,
        )
    )
    hub_models = list(hub_models1) + list(hub_models2)
    hub_models = get_sorted_models(hub_models)

    trending_models = list(
        list_models(
            task="fill-mask",
            library="transformers",
            sort="likes7d",
            direction=-1,
            limit=30,
            full=False,
        )
    )
    if len(trending_models) > 0:
        trending_models = get_sorted_models(trending_models)
        hub_models = [m for m in hub_models if m not in trending_models]
        hub_models = trending_models + hub_models

    return hub_models


def _fetch_st_models():
    hub_models1 = list(
        list_models(
            task="sentence-similarity",
            library="sentence-transformers",
            sort="downloads",
            direction=-1,
            limit=30,
            full=False,
        )
    )
    hub_models2 = list(
        list_models(
            task="fill-mask",
            library="transformers",
            sort="downloads",
            direction=-1,
            limit=30,
            full=False,
        )
    )

    hub_models = list(hub_models1) + list(hub_models2)
    hub_models = get_sorted_models(hub_models)

    trending_models = list(
        list_models(
            task="sentence-similarity",
            library="sentence-transformers",
            sort="likes7d",
            direction=-1,
            limit=30,
            full=False,
        )
    )
    if len(trending_models) > 0:
        trending_models = get_sorted_models(trending_models)
        hub_models = [m for m in hub_models if m not in trending_models]
        hub_models = trending_models + hub_models
    return hub_models


def _fetch_audio_classification_models():
    hub_models = [
        'CompVis/stable-diffusion-v1-4', 'stabilityai/stable-diffusion-2-1', 'stabilityai/stable-diffusion-2-1-base'
        'Intel/ldm3d-4c', 'stabilityai/stable-diffusion-xl-base-1.0', 'stabilityai/sdxl-turbo', 'stabilityai/stable-diffusion-3-medium-diffusers'
        'stabilityai/stable-diffusion-2-inpainting', 'diffusers/stable-diffusion-xl-1.0-inpainting-0.1', 'timbrooks/instruct-pix2pix',
        'stabilityai/stable-diffusion-xl-refiner-1.0', 'lambdalabs/sd-image-variations-diffusers', 'stabilityai/stable-diffusion-2-depth',
        'google/ddpm-ema-celebahq-256', 'stabilityai/stable-video-diffusion-img2vid-xt', 'stabilityai/stable-video-diffusion-img2vid-xt'
    ]
    return hub_models

def fetch_models():
    _mc = collections.defaultdict(list)
    _mc["text-classification"] = _fetch_text_classification_models()
    _mc["llm"] = _fetch_llm_models()
    _mc["image-classification"] = _fetch_image_classification_models()
    _mc["image-regression"] = _fetch_image_classification_models()
    _mc["dreambooth"] = _fetch_dreambooth_models()
    _mc["seq2seq"] = _fetch_seq2seq_models()
    _mc["token-classification"] = _fetch_token_classification_models()
    _mc["text-regression"] = _fetch_text_classification_models()
    _mc["image-object-detection"] = _fetch_image_object_detection_models()
    _mc["sentence-transformers"] = _fetch_st_models()
    _mc["audio-classification"] = _fetch_audio_classification_models()

    # tabular-classification
    _mc["tabular-classification"] = [
        "xgboost",
        "random_forest",
        "ridge",
        "logistic_regression",
        "svm",
        "extra_trees",
        "adaboost",
        "decision_tree",
        "knn",
    ]

    # tabular-regression
    _mc["tabular-regression"] = [
        "xgboost",
        "random_forest",
        "ridge",
        "svm",
        "extra_trees",
        "adaboost",
        "decision_tree",
        "knn",
    ]
    return _mc
