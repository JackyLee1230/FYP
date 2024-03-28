# Sentiment Analysis Dataset Creation

## How to use?

To create datasets for training sentiment analysis models

1. Run _dataset_creation_master_20240116.ipynb_ to filter rows with no comments, or repeated comments.

2. Run _dataset_creation_sa_20240116.ipynb_ to create balanced or imbalanced datasets with different sizes (120K, 240K, 480K).

The created datasets will have file structure as below (the name may not be exact)

```
|-- eval_inference                          (the 3K dataset for measuring evaluation time)
|   |-- dataset_heartless_20240116_3k_eval.pkl
|-- sampled_120k_<yyyy-mm-dd>
|   |-- dataset_bal_sampled_120k.pkl
|   |-- dataset_imbal_sampled_120k.pkl
|-- sampled_240k_<yyyy-mm-dd>
|   |-- dataset_bal_sampled_240k.pkl
|   |-- dataset_imbal_sampled_240k.pkl
|-- sampled_480k_<yyyy-mm-dd>
|   |-- dataset_bal_sampled_480k.pkl
|   |-- dataset_imbal_sampled_480k.pkl
|-- sampled_valid_<yyyy-mm-dd>
|   |-- validation_balanced.pkl
|   |-- validation_imbalanced.pkl
```

## File structure

scripts only

|File|Details|
|---|---|
|dataset_creation_master_20240116.ipynb|(explained above)|
|dataset_creation_sa_20240116.ipynb|(explained above)|
|dataset_creation.ipynb|Template script that do not need to be executed.|
|eval_inference_dataset_creation.ipynb|Create a 3K dataset for evaluating inference speed between vanilla model and ONNX model, which optimized for CPU inference.|
