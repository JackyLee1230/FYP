# Topic Modeling (TM) development

Where experiments on different topic models over different corpus are conducted.

Recommend to run on a PC with high-end NVIDIA graphic card (idk, maybe 4060 is the recommended??)

Have to install cumf to the environment to accelerate BERTopic training: [Installation](https://docs.rapids.ai/install#selector)  
Only select cuDF, cuML. The installation will downgrade the pandas version to 1.5.x, and numpy version. We have tested that the .pkl dataframes created with pandas 2.1.x can still be read during training.

We experimented with three topic models that represent different approahces in topic modeling

- Latent Dirichlet Allocation (LDA): the classic topic model which assumes each document is a distribution of all topics. Then it assigns a doc to the topic with the highest probability based on the words frequencies. A bag-of-word approach.

- BERTopic: A clustering apporach. SBERT embedding of documents are first created, then dimension reduction of doc vector embeddings is applied and clustering is performed to group reduced vectors. Finally weights the topics based on custom class-TFIDF scheme. A pure contextual embedding approach.

- Contextualized Topic Model (CTM): A mix between contextual  embedding and bag-of-words approach. It uses a Variational Autoencoder (VAE), improving from LDA, to estimate the topics given both contextual embedding of documents, and a bag-of-word.

## Folder structure

Unlisted folders are negligable.

Major folders

|Folders|Details|
|---|---|
|bertopic_dev|Training BERTopic model on different datasets.|
|ctm_dev|Training CTM on different datasets|
|eval_results|Evaluation results of trained topic models on the dataset they have trained.|
|eval_results_external|Evaluation results on the trained topic models on the reviews which are not present in the dataset.|
|lda_dev|Training LDA on different datasets|
|tm_external_test|Testing trained topic models on reviews from games that are no present in the dataset. (reviews from games launched later than the review, such as Cyberpunk 2077)|

Miscellenous

|Folders|Details|
|---|---|
|cumf_test|Contains a script to test whether cudf, cuml installation is successful.|
|demo_2024-01-07|Pre-dev of LDA|
|demo_2024-01-08|Pre-dev of BERTopic|
|demo_2024-01-09|Pre-dev of CTM|
|llm_demo_2024-01-22|An early feasibility check on LLM+RAG feature. Future development is moved to folder _../llm-rag_

## How to run?

Assume datasets are created in _../dataset/topic_modelling_ by running the corresponding scripts (_data_creation.ipynb_) under that directory.

A sample of datasets with directory structure under _../dataset/topic_modelling_

```
|-- top_10_games
|   |-- 00_Terraria.pkl
|   |-- 01_PAYDAY 2.pkl
|   |-- ...
|-- top_10_games_unique_[app_id,review_text]
|   |-- 00_Terraria.pkl
|   |-- 01_PAYDAY 2.pkl
|   |-- ...
|-- top_10_games_unique_[review_text]
|   |-- 00_Terraria.pkl
|   |-- 01_PAYDAY 2.pkl
|   |-- ...
|-- top_11_genres
|   |-- 00_action.pkl
|   |-- 01_indie.pkl
|   |-- 02_adventure.pkl
|-- top_11_genres_unique_[app_id,review_text]
|   |-- 00_action.pkl
|   |-- 01_indie.pkl
|   |-- 02_adventure.pkl
|-- top_11_genres_unique_[review_text]
|   |-- 00_action.pkl
|   |-- 01_indie.pkl
|   |-- 02_adventure.pkl
```

The result of all three training script shares a similar common file structure

```
<model>_<search_behaviour>_<datetime>
|-- <model>_<param1>_<val_1>_<param2>_<val_2>_...       (trained model 1)
|-- <model>_<param1>_<val_1>_<param2>_<val_2>_...       (trained model 2)
|-- <model>_<param1>_<val_1>_<param2>_<val_2>_...       (trained model 3)
|-- ...
|-- config.json
|-- result.json
|-- (additional files like the embedding, corpus)
```

The _config.json_ stores the config of this experiment, like parameter search grid, common default parameters for all models, metrics to be measured after each training.

The _result.json_ stores the evaluation metrics results after each hyperparameter search, and what is the best model based on a user-specified metric before training, and the hyperparameter of each trained model.

To understand the messy training scripts, I recommend to start with LDA first to understand how to manage a hyperparameter search on a dataset and how to modify the variables. Training scripts of all three models followed the same building logic.

Then can move on to the BERTopic script to experiment with BERTopic model training and hyperparameter search.

The hyperparameter management is inspired from huggingface training directory design, and 
[OCTIS](https://github.com/MIND-Lab/OCTIS/tree/master) hyperparameter search managament (using parameter dictionary).
### _lda_dev_

Detailed instruction on how to run/train?

1. Similar in BERTopic and CTM, go to the cell which loads the dataset. Change the _genre_ and _unique_list_ to load from different dataset. (The _unique_list_ controls dataframe duplicate detection when in creating the dataset, as different games may have the same comment text.)

    ```python
    # load the dataset

    %autoreload 2
    from dataset_loader import GENRES, load_dataset

    genre = GENRES.ACTION
    unique_list = ['review_text']
    dataset_folder = Path(f'../../dataset/topic_modelling/top_11_genres_unique_[{",".join(unique_list)}]')
    dataset, dataset_path = load_dataset(genre, dataset_folder)

    # genre = -1
    # unique_list = ['review_text']
    # dataset_folder = Path(f'../../dataset/topic_modelling/00_dataset_filtered_all_4045065.pkl').resolve()
    # dataset, dataset_path = pd.read_pickle(dataset_folder), dataset_folder
    # dataset_folder = dataset_path.parent
    print(dataset_folder)

    dataset.info(verbose=True)
    ```

2. Then go to the cell with "#grid search / random search" and change the hyperparameters search space, and the type of the search (grid search or random search).

    Change the func arguments next to _countvect_params_ to initiate the counter vectorizer, with the same arguments as the sklearn count vectorizer. Similarily for LDA model.

    Then create a search space with a dictionary, specifying what parameters to be looped. They will be overwriting the params passed in the _init***_params_ functions. Finally, change the _search_behaviour_ variable to switch between grid search and random search. Then training can be started.

    To continue from an existing training, set the same parameters in the _init***params_ functions, same _search_behaviour_, and same _training_datetime_ to continue the hyperparameter search.

    ```python
    # grid search / random search

    countvect_params = _init_count_vectorizer_params(n_frequency=70, ngram_range=[1, 1])

    # corpus and id2word will be generated on the fly
    lda_params = _init_LdaMulticore_params(
        corpus=None, num_topics=20, id2word=None, 
        workers=3, chunksize=2024, random_state=42, passes=10)

    # create search_space dict
    search_space = {
        'lda_params': {
            'num_topics': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]     # do parameter search on number of topics only
            # 'decay':[0.7, 0.8, 0.9],
            # 'offset':[16, 64, 128]
        }
    }

    dataset_path_config = dataset_path.relative_to(dataset_path.parent.parent.parent.parent)

    search_behaviour = SEARCH_BEHAVIOUR.GRID_SEARCH
    # search_behaviour = SEARCH_BEHAVIOUR.RANDOM_SEARCH


    training_datetime = datetime.now()
    # training_datetime = datetime(2024, 2, 7, 18, 59, 39)
    if type(genre) == GENRES and genre.value >= 0:
        training_folder_p = Path(f'category_{str(genre)}_unique_review_text')
        training_folder = Path(f'lda_multicore_genre_{str(genre)}_{search_behaviour.value}_{training_datetime.strftime("%Y%m%d_%H%M%S")}')
    elif genre < 0:
        training_folder_p = Path(f'category_all_unique_review_text')
        training_folder = Path(f'lda_multicore_{search_behaviour.value}_{training_datetime.strftime("%Y%m%d_%H%M%S")}')
    training_folder = training_folder_p.joinpath(training_folder)
    ```

3. Simply run from the beginning to end will train the model on the hyperparameter grid specified.

4. Continue running the script to evaluate the model with graphs using pyLDAvis, and some numeric metrics.

5. For more detailed evaluation, run _lda_eval_vis.ipynb_ and _lda_eval_quali.ipynb_ for quantitative evaluation, graphs (quantitative eval) and qualitative evaluation.

#### Sub-folder structure

|File|Details|
|---|---|
|lda_eval_quali.ipynb|Qualitative analysis on trained LDA models with the same training text|
|lda_eval_vis.ipynb|Quantitative analysis on trained LDA models with the same training text|
|lda_training.ipynb|Main training script|


### _ctm_dev_

Detailed instruction on how to train/run

1. Open the _ctm_training_script_ver.py_  
Go to the section as below, modify like in bertopic

    ```python
    genre = GENRES.ACTION
    unique_list = ['review_text']
    dataset_folder = Path(f'../../dataset/topic_modelling/top_11_genres_unique_[{",".join(unique_list)}]')
    dataset, dataset_path = load_dataset(genre, dataset_folder)

    # genre = -1
    # unique_list = ['review_text']
    # dataset_folder = Path(f'../../dataset/topic_modelling/00_dataset_filtered_all_4045065.pkl').resolve()
    # dataset, dataset_path = pd.read_pickle(dataset_folder), dataset_folder
    # dataset_folder = dataset_path.parent

    dataset.info(verbose=True)
    ```

2. Then go to the section as below to modify the sentence transformer model used to create the embedding.  
Modify the _split_sentences_ variable to set whether splitting the sentence by token length of the sbert model.  
Modify the _sbert_model_name_ to change the sbert model used for building the dataset.  
Note that the _sbert_model_name_ has to be the same as the hyperparameter in the training initiation. (i.e. no hyperparameter search on sbert model)

    ```python
    # ATTENTION !!!!!
    # define the sbert model (SHOULD BE THE SAME AS TRAINING)
    # also define whether we want to split the tokens or not

    split_sentences = True
    sbert_model_name = 'all-MiniLM-L6-v2'

    # load the sbert model
    from sentence_transformers import SentenceTransformer
    sbert = SentenceTransformer(sbert_model_name, device=device)



    X = dataset['review_text'].values
    X = list(X)
    X_preprocessed = dataset['review_text_bow'].values

    X_contextual, X_bow, X = split_X_contextual_X_bow(
        X, X_preprocessed, X, 
        sbert, 
        split=split_sentences)


    print(len(X))
    ```

3. Then go to the section like below to modify the hyperparameter search grid and the search behaviour. Change the _search_behaviour_ to choose between grid search or random search, same as in BERTopic.

    ```python
    # grid search / random search

    # hyperparameters
    sbert_params = _init_sbert_params(model_name_or_path=sbert_model_name)              # should not be in search space !!!
    countvect_params = _init_count_vectorizer_params(max_features=2000, ngram_range=[1,1])
    ctm_params = _init_ctm_params(
        n_components=10, 
        hidden_sizes=[100, 100], 
        dropout=0.2, lr=2e-3, momentum=0.99, solver="adam", 
        num_epochs=25       # original default value is 100 (in LDAProd), some tested with 50
    )

    search_space_dict = {
        # 'countvect_params': {
        #     'max_features' : [1500, 2000, 2500],
        #     'ngram_range': [[1, 1], [1, 2]]     # datatype is list as json does not support tuple
        # },
        'ctm_params':{
            'n_components': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            # 'hidden_sizes': [(100, 100), (200, 200), (100, 100, 100), (200, 200, 200)],
            # 'num_epochs':[50]
        }
    }

    dataset_path_config = dataset_path.relative_to(dataset_path.parent.parent.parent.parent)

    search_behaviour = SEARCH_BEHAVIOUR.GRID_SEARCH
    # search_behaviour = SEARCH_BEHAVIOUR.RANDOM_SEARCH
    ```

4. After a search, run _ctm_eval_vis.ipynb_ to evaluate the model with graphps (quantitatively). Run _ctm_eval_quali.ipynb_ to evaluate the model qualitatively with the training set.

#### Sub-folder structure

|File|Details|
|---|---|
|ctm_dataset_creation.py|Helper functions to create CTM specific dataset object for training.|
|ctm_eval_quali.ipynb|Qualitative analysis on trained CTM models with the same training text|
|ctm_eval_vis.ipynb|Quantitative analysis on trained CTM models with the same training text|
|ctm_training_script_ver.ipynb|Main training script, adopted from _ctm_training.ipynb_|
|ctm_training.ipynb|Main training script|
|ctm_utils.py|Utilities function for training CTM models|

### _bertopic_dev_

Detailed instructions in how to train

1. Open _bert_training.ipynb_  

    Go to the 4th cell with the following content
    ```python
    genre = GENRES.ACTION
    unique_list = ['review_text']
    dataset_folder = Path(f'../../dataset/topic_modelling/top_11_genres_unique_[{",".join(unique_list)}]')
    dataset, dataset_path = load_dataset(genre, dataset_folder)

    # genre = -1
    # unique_list = ['review_text']
    # dataset_folder = Path(f'../../dataset/topic_modelling/00_dataset_filtered_all_4045065.pkl').resolve()
    # dataset, dataset_path = pd.read_pickle(dataset_folder), dataset_folder
    # dataset_folder = dataset_path.parent
    print(dataset_folder)

    dataset.info(verbose=True)
    ```

    The first part is for training with genre-based datasets. Modify the _GENRES_ enum to load different reviews dataset by different genres. (The top 11 genres). If training for all reviews regardless of genres, uncomment the commented section to set _genre = -1_ and load the corresponding dataset.

2. Run from the first cell until the cell with the following content as beginning

    ```python
    # grid search / random search

    min_cluster_size = max(len(X) // 1000, 100)       # 0.1% of the dataset size, or at least 100
    n_neighbors = np.median([20, len(X) // 1000 // 10, 100])      # larger n_neighbors will result in a more global view of the embedding structure

    print(f'min_cluster_size: {min_cluster_size}')
    print(f'n_neighbors: {n_neighbors}')
    print('\n\n')
    ...
    ```

    Look for the part

    ```python
    dataset_path_config = dataset_path.relative_to(dataset_path.parent.parent.parent.parent)

    search_behaviour = SEARCH_BEHAVIOUR.GRID_SEARCH
    split_sentence = True
    ```

    Change _search_behaviour_ to switch between grid search and random search. Change _split_sentence_ to enable splitting reviews by maximum token length of sentence transformers. Note that switching _split_sentence = true_ **may** break the hyperparameter selection on the model of sentence transformers (cannot be solved unless rebuild the training script which is a massive work...)

3. Then continue runnning and u can see the training results printing from the output of the cell.  
The expected runtime for ~1M corpus [10, 20, 30, ..., 100] topics required 1.5-2Hr on a RTX4090, with cudf and cuml installed. For 4M corpus is around 4Hr with the same list of number of topics.

4. After training, u may continue running the _bertopic_training.ipynb_ to show some graphs for quick quanlative evaluation by producing some graphs  
OR  
 open _bert_eval_vis.ipynb_ to evaluate the trained model to produce some graphs, and open _bert_eval_quali.ipynb_ to evaluate the trained model qualitatively.

#### Sub-folder structure

|File|Details|
|---|---|
|bertopic_embedding_imp.ipynb|Script testing splitting the sentence based on the embedding maximum context length|
|bertopic_eval_quali.ipynb|Qualitative analysis on trained bertopic model with the same training text|
|bertopic_eval_vis.ipynb|Quantitative and visualization analysis on trained bertopic model with the same training text|
|bertopic_get_llm_topicname.ipynb|Generate topic name with LLM|
|bertopic_training.ipynb|Main training script|
|bertopic_utils.py|Utilities script supporting training script|
|filter_highratio_punct_comments.ipynb|Testing script in further filtering b4 training|