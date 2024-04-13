# NLP ML Dev Folder

This is the messy development folder which stores all the development code from dataset creation, model development, to model evaluations and proof of concept LLM prompts.

## Development environment

Both mac and linux conda package lists can be found under folder `conda_env_list`

For detailed packages used, please refer to the list below. Best effort was made to exhausively list out all packages used for development.

Package used

|Dependency|version|Reason (if any)|
|---|---|---|
|python|3.9.18|picking 3.9 for max compatability across different packages|
|pandas|2.1.0|to ensure pickle readability, the pandas version has to be this exact version as we create the pickle files. However, older versions of pandas can read pickles created with newer versions (tested in 1.5.x, as cuml latest supported ver of pandas is 1.5.x)|
|numpy|1.26.0|Suggested version. The exact version can be higher/ (slightly) lower than that.|
|scipy|1.11.4|for softmax|
|scikit-learn|1.3.0||
|imbalanced-learn|0.11.0||
|nltk|3.8.1||
|tensorflow (or Keras) (with GPU)|2.15.0|It fixed model loading problem across WSL and macOS, allowing us to train on macOS platform and deploy it on WSL/linux, or vice versa.|
|pytorch (w/ GPU)|2.1.0|Main stable version at setup|

Huggingface related

|Dependency|version|Reason (if any)|
|---|---|---|
|transformers|4.35.0|Main stable version at setup|
|datasets|2.14.6|The package for creating Dataset object for training|
|evaluate|0.4.1|The package for create metrics objects for training|
|accelerate|0.24.1|The package for using Trainer object in training and model evaluation with PyTorch as backend, and restrict to inference on CPU only (for measuring inference time)|

RabbitMQ related
|Dependency|version|Reason (if any)|
|---|---|---|
|pika|1.3.1||

ONNX related
|Dependency|version|Reason (if any)|
|---|---|---|
|onnx|1.14.1|tf2onnx suggests not above 1.14.1 as tf2onnx 1.15.1 is not that fully supporting onnx 1.15.0 <= (even though it shd be fine)|
|onnxruntime|1.16.3|The latest version at writing.|
|skl2onnx|1.16.0|Remarks: the package 'protobuf' has conflict with tensorflow. Reinstall the original version of protobuf after installing it.|
|tf2onnx|1.15.1|Remarks: the package 'protobuf' has conflict with tensorflow. Reinstall the original version of protobuf after installing it.|
|onnxruntime-extensions|0.9.0|for tf2onnx|
|optimum|1.16.1|for converting huggingface model to ONNX|

Non-critical packages
|Dependency|version|Reason (if any)|
|---|---|---|
|seaborn|0.13.0||
|matplotlib|3.7.3||

Tentative packages for topic modelling
|Dependency|version|Reason (if any)|
|---|---|---|
|spacy|3.7.2|Installation instructions: https://spacy.io/usage|
|gensim|4.3.2|The latest at setup. Add memory-independent w.r.t. corpus size algorithms. And multicore LDA for faster building time. [Release Notes](https://pypi.org/project/gensim/4.3.0/)|
|pyLDAvis|3.4.1||
|sentence-transformers|2.2.2|the latest right now|
|bertopic|0.16.0|the latest right now. Notes: for setting-up with Docker env, one shd manually install hdbscan with channel conda-forge to avoid deployment problems.|
|contextualized-topic-models|2.5.0|latest at development.|

LLM related
|Dependency|version|Reason (if any)|
|langchain|0.1.12|latest at development. Newer version shd be supported unless ground-breaking refactoring of the project.|
|chromadb|0.4.22|latest at development.|
|langchain-mistralai|0.0.5|latest at development. Install it if using MistralAI api. Newer version shd be supported unless ground-breaking refactoring of the project.|
|mistralai|0.1.6|latest at development. Install it if using MistralAI api. Newer version shd be supported unless ground-breaking refactoring of the project.|

LLM component uses Ollama. For windows/linux/wsl, the official docker package can be used as it supports CUDA acceleration. For m1≤ macs, plz install it using brew to leverage metal acceleration. (Ollama official docker image does not support metal accel).

## Folder structure

Only relevant folders are listed

```
|-- conda_env_list          (storing conda env packages list for development)
|-- dataset                 (folder for creating datasets for training/evaluation)
|-- llm_rag                 (folder for developing Keyword Extraction with LLM prompting)
|-- sa                      (folder for developing Sentiment Analysis)
|-- topic_modelling         (folder for developing Topic Modeling)
```

## Feedback after interim presentation on Sentiment Analysis (late 2024 Jan)

- Cross Validation on models (k-fold). Typical value of k will be 3, 5, 7, 10.  
Reference: https://scikit-learn.org/stable/modules/cross_validation.html

    Particularly Stratified k-fold can be used on both balanced and imbalanced training set.

    However, we have quite large datasets compared to previous researches, and two large validation sets. The result proves the versality of the models.

    Also, we have limited computational power which fine-tuning BERT_base on a 120K training data set costs 3-4 hours on a RTX4090.

- Ensemble learning of multiple models. We trained three models. Ensemble learning typically yields better performance.

    However, a decent performance was recorded on the fine-tuned BERT model. Therefore, we have little intension to apply ensemble learning on the task SA.

- Applying LLMs / other more sophisicated models on our tasks.

    We have little plan to use LLMs on sentiment analysis, unless more in-depth inference/analysis is required (like analyzing the sarcasm in the reviews).

    However, we plan to use LLMs (like Llama2) in topic modeling to generate human-friendly / interpretable topic names. Also generating a short summary of the general impression based on the sentiment analysis / topic modeling results.

## Future Works

Ignore the [positive, neutral, negative] output (even okay with [positive, negative]) first. Utlimately we may use chatgpt-3.5 // chatgpt-4 to generate [positive, neutral, negative] label from reviews.
