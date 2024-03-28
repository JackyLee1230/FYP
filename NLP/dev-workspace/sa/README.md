# Sentiment Analysis (SA) development

The folder for training SA models, testing them, and evaluating them. Where the results of different SA models are analyzed.

We tested three SA models with different fundamental architecture behind

- Term-frequency Inverse-document-frequency (TFIDF) + Random Forest (RF)  
It uses TFIDF (a bag-of-word approach) as word embedding, then applying RF to train a sentiment classifier on reviews.
- Global Vectors for Word Representation (GloVe) + CNN  
It uses GloVe (contextual embedding approach) as word embedding, then applying CNN to train a sentiment classifier on reviews
- BERT  
BERT adopted attention block allowing itself to look at any part of the sentence (i.e. a kernel with size = length of the sentence). Its embedding carries both symantic and syntatic infomation of a word.

## Folder structure

Listing folders that matters. Unlisted folders are obsolete or have little to no use in actual development.

The three folders begin with "demo_*" contain pre-development scripts to explore the feasibility of these approaches.

|Folder|Details|
|---|---|
|bert_2023-12-13|Storing scripts for fine-tuning BERT models|
|eda_graphs|Containing graphs from EDA on the pre-processed dataset|
|eval_graphs|Interim evaluation result for interim report|
|eval_graphs_2024|Final evaluation results for final report|
|glove-cnn_2023-12-12|Scripts for training GloVe + CNN model|
|tfidf-rf_2023-12-16|Scripts for training TFIDF + RF model|

Scripts

|Files|Details|
|---|---|
|datacleaning_test.ipynb|Testing various combination of data-cleaning functions. Not useful in training and evaluation.|
|dataset_loader.py|Functions to load the training dataset for models training|
|eda.ipynb|Scripts for EDA on the pre-processed dataset|
|eval_inference_time_all.ipynb|After measuring the inference time on different devices, run this script to produce graphs|
|evaluation_all.ipynb|Create evaluation results after training all 3 kinds of model, each on 6 kinds of dataset.|
|evaluation_functions.py|Helper functions to create graphs in evaluation_all.ipynb|
|sentiment-analysis.ipynb|A sample notebook that uses VADER to train a three-class sentiment classifier to classify reviews into [positive, neutral, negative]|
|str_cleaning_functions.py|Shared functions to pre-process the reviews before passing them to the models during training & evaluation.|

## Training procedure

To fine-tune any models, prepare the dataset first by running the corresponding scripts under _../dataset/sa_ folder

Assume u have every packages installed.

### _bert_2023-12-13_

1. Run _bert_finetune_script.py_ to fine-tune a BERT model on a specific dataset provided in arguments.  
    OR  
    Run the _training_bashscript.sh_ in a WSL environemnt to fine-tune BERT models on all 6 datasets.

    The __bert_finetune_script.ipynb_ is a jupyter notebook version of the _bert_finetune_script.py_ which is first developed before having a script version. Running a .py script is more stable and avoiding OOM error while running in a jupyter kernel.

2. To evaluate the models on unseen evaluation dataset, run _evaluation_notebook.ipynb_ or _evaluation_script.py_ (Recommending _evaluation_notebook.ipynb_, as the graphs produced with _evaluation_script.py_ has some error on the lines on the graph). Results will be saved under the folder of the model

3. To convert the trained model to ONNX, run _convert_to_onnx.ipynb_.  
Note that mapping layer of mapping words to the fine-tuned word vector embedding cannot be converted to ONNX, yet this is part of the model.

The resulting folder structure of a model will be like

```
|-- bert-finetune_480k_bal_2024-01-18
|   |-- bert-finetune_480k_bal_2024-01-18_model
|   |-- bert-finetune_480k_bal_2024-01-18_model_onnx
|   |-- bert-finetune_480k_bal_2024-01-18_pipeline
|   |-- eval_metrics
|   |   |-- test            (evaluation results on seen testing dataset)
|   |   |-- valid_bal       (results on unseen balanced validation set)
|   |   |-- valid_imbal     (results on unseen imbalanced validation set)
|   |-- inference_times_<device_name>
```

### _glove-cnn_2023-12-12_

1. Run _glove_cnn_training_script.ipynb_ (just run it from first cell to last cell) to train a GloVe + CNN model for sentiment classification on a dataset. Repeat this step to train a GloVE + CNN model on different sizes and data distribution datasets.

2. Run _evaluation_script.ipynb_ to evaluate the trained GloVe+CNN models on unseen evaluation datasets.

3. To convert the trained models to ONNX, run _convert_to_onnx.ipynb_

Resulting folder structure of a model

```
|-- glove-cnn-20000_480k_bal_2024-02-26
|   |-- glove-cnn-20000_480k_bal_2024-02-26_end2end.keras
|   |-- glove-cnn-20000_480k_bal_2024-02-26_model.keras
|   |-- glove-cnn-20000_480k_bal_2024-02-26_modelonly.onnx
|   |-- glove-cnn-20000_480k_bal_2024-02-26_textvectorizer.pkl
|   |-- train_history_glove-cnn-20000_480k_bal_2024-02-26_2024-02-26_trainingmetrics.png
|   |-- train-history_glove-cnn-20000_480k_bal_2024-02-26_2024-02-26
|   |-- eval_metrics
|   |   |-- test            (evaluation results on seen testing dataset)
|   |   |-- valid_bal       (results on unseen balanced validation set)
|   |   |-- valid_imbal     (results on unseen imbalanced validation set)
|   |-- inference_times_<device_name>
```

### _tfidf-rf_2023-12-16_

1. Run _tfidf-rf_training_script.py_ to train different TFIDF-RF models on different datasets (balanced or imbalanced, different number of reviews).

2. Evaluate the models by running _evaluation_script.ipynb_ to evaluate trained TFIDF-RF models on unseen evaluation datasets.

3. To convert the trained models to ONNX, run _convert_to_onnx.ipynb_.

Loading an existing model requires the count-vectorizer, the RF model itself, and the _TfidfVectorizer_ from sklearn

Resulting folder structure of a model

```
|-- tfidf-rf-20000_480k_bal_2024-02-26
|   |-- tfidf-rf-20000_480k_bal_2024-02-26_count_vectorizer.pkl
|   |-- tfidf-rf-20000_480k_bal_2024-02-26_model.sav
|   |-- tfidf-rf-20000_480k_bal_2024-02-26_pipeline.onnx
|   |-- tfidf-rf-20000_480k_bal_2024-02-26_tfidf.pkl
|   |-- eval_metrics
|   |   |-- test            (evaluation results on seen testing dataset)
|   |   |-- valid_bal       (results on unseen balanced validation set)
|   |   |-- valid_imbal     (results on unseen imbalanced validation set)
|   |-- inference_times_<device_name>
```

## Evaluation

To create acc graphs (and other metrics) of each kind of model on both balanced and imbalanced dataset, run _evaluation_all.ipynb_. Graphs will be produced and saved to _eval_results_ folder (or any folder with path specified in the _evaluation_all.ipynb_)

To create graphs about evaluation time, run _eval_inference_time_all.ipynb_ after collecting inference time measurement data of both the vanilla model and ONNX model.