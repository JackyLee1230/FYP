# NLP ML Dev Folder

Package used (tentative, not full list)

(Check README in NLP folder)

## Feedback after interim presentation on Sentiment Analysis

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

## TODO

Ignore the [positive, neutral, negative] output (even okay with [positive, negative]) first. Utlimately we may use chatgpt-3.5 // chatgpt-4 to generate [positive, neutral, negative] label from reviews.
