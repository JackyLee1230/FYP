# FROM condaforge/miniforge3
FROM condaforge/mambaforge

# Change default shell to bash. This is effective only in the Dockerfile.
SHELL ["/bin/bash", "-i", "-c"]

# COPY . /NLP/

COPY docker_conda_env_list.yml /NLP/

# Copy necessary files for inference
COPY NLP.py /NLP/

# the models
COPY steam-games-reviews-analysis-sentiment-analysis_count_vectorizer_12-09-2023.pkl /NLP/
COPY steam-games-reviews-analysis-sentiment-analysis_model_12-09-2023.sav /NLP/
COPY steam-games-reviews-analysis-sentiment-analysis_tfidf_12-09-2023.pkl /NLP/

# packages related files (pre-downloaded large files)
# COPY /docker_setup_files/ /NLP/docker_setup_files/

WORKDIR /NLP

ENV PATH /root/miniforge3/bin:$PATH


# RUN conda init bash &&\
#     conda env create -f fyp-test-wsl-cpu.yml &&\
#     conda activate fyp-test-wsl-cpu &&\
#     pip install /NLP/docker_setup_files/tensorflow-2.14.0-cp39-cp39-manylinux_2_17_x86_64.manylinux2014_x86_64.whl &&\
#     pip install /NLP/docker_setup_files/torch-2.1.0-cp39-cp39-ma/nylinux1_x86_64.whl &&\
#     python3 -c "import tensorflow as tf; print(tf.reduce_sum(tf.random.normal([1000, 1000])))" &&\
#     python3 -c "import torch; x = torch.rand(5, 3); print(x)"

# create conda env and test activating it
RUN mamba init bash &&\
    # conda create -n fyp-nlp-production python=3.9.18 pika=1.3.1 scikit-learn=1.3.0 nltk=3.8.1 &&\
    mamba env create -f docker_conda_env_list.yml &&\
    conda clean -afy &&\
    conda activate fyp-nlp-production &&\
    # download necessary files for nltk
    python3 -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"



# RUN pip install /NLP/docker_setup_files/tensorflow-2.14.0-cp39-cp39-manylinux_2_17_x86_64.manylinux2014_x86_64.whl

# RUN pip install /NLP/docker_setup_files/torch-2.1.0-cp39-cp39-manylinux1_x86_64.whl


# run
ENTRYPOINT [ "conda", "run", "--no-capture-output", "-n", "fyp-nlp-production", "python", "-u" "NLP.py" ]

