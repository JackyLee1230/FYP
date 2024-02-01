from pathlib import Path
from contextualized_topic_models.models.ctm import CombinedTM

def _load_ctm_model(model_checkpoint:Path, ctm_params:dict):

    model_path = [p for p in model_checkpoint.iterdir() if p.is_dir()][-1]        # get the last dir (since there 's only one dir inside) -> get the only dir

    # get the first file in the dir
    epoch_file = [p for p in model_path.iterdir() if p.is_file()][0]
    epoch_num = int(epoch_file.stem.split('_')[-1])

    if 'hidden_sizes' in ctm_params:
        ctm_params['hidden_sizes'] = tuple(ctm_params['hidden_sizes'])

    ctm = CombinedTM(**ctm_params)

    ctm.load(model_path, epoch_num)

    return ctm

##########
# Evaluation functions
##########

def _get_topics(ctm, k=10):
    return ctm.get_topic_lists(k)

def _get_topic_word_metrix(ctm):
    return ctm.get_topic_word_distribution()

# ref: https://contextualized-topic-models.readthedocs.io/en/latest/readme.html (go to the section: Mono-Lingual Topic Modeling)
# testing_dataset = qt.transform(text_for_contextual=testing_text_for_contextual, text_for_bow=testing_text_for_bow)
# # n_sample how many times to sample the distribution (see the doc)
# ctm.get_doc_topic_distribution(testing_dataset, n_samples=20) # returns a (n_documents, n_topics) matrix with the topic distribution of each document
def _get_topic_document_metrix(ctm, dataset, n_samples=20):
    return ctm.get_doc_topic_distribution(dataset, n_samples=n_samples).T