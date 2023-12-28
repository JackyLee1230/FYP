# FROM condaforge/miniforge3

# if there's a local image with the same name, it will be used instead of pulling from docker hub
FROM condaforge/mambaforge

# Change default shell to bash. This is effective only in the Dockerfile.
SHELL ["/bin/bash", "-i", "-c"]

# Copy all files under this directory to the container with the path as in github
# contining the models, conda env information, python script to run inference
COPY . /NLP/sa/

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
    mamba env create -f sa/docker_setup_files/docker_conda_env_list.yml &&\
    conda clean -afy &&\
    conda activate fyp-nlp-sa-production

# RUN pip install /NLP/docker_setup_files/tensorflow-2.14.0-cp39-cp39-manylinux_2_17_x86_64.manylinux2014_x86_64.whl

# RUN pip install /NLP/docker_setup_files/torch-2.1.0-cp39-cp39-manylinux1_x86_64.whl


# run
ENTRYPOINT [ "conda", "run", "--no-capture-output", "-n", "fyp-nlp-sa-production", "python", "-u", "sa/sa_main.py" ]