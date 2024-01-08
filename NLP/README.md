# NLP

Folder for NLP and Data Analysis related stuff

## Development environment

Use miniforge to create a virtual environment to install them

We only highlight the most critical packages that affect the code.

|Dependency|version|Reason (if any)|
|---|---|---|
|python|3.9.18|picking 3.9 for max compatability across different packages|
|pandas|2.1.0|to ensure pickle readability, the pandas version has to be this exact version as we create the pickle files|
|numpy|1.26.0|Suggested version. The exact version can be higher than that.|
|scipy|1.11.4|for softmax|
|scikit-learn|1.3.0|
|imbalanced-learn|0.11.0|
|nltk|3.8.1|
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
|pika|1.3.1|

ONNX related
|Dependency|version|Reason (if any)|
|---|---|---|
|onnx|1.14.1|tf2onnx suggests not above 1.14.1 as tf2onnx 1.15.1 is not that fully supporting onnx 1.15.0 <= (even though it shd be fine)
|onnxruntime|1.16.3|The latest version at writing.|
|skl2onnx|1.16.0|Remarks: the package 'protobuf' has conflict with tensorflow. Reinstall the original version of protobuf after installing it.|
|tf2onnx|1.15.1|Remarks: the package 'protobuf' has conflict with tensorflow. Reinstall the original version of protobuf after installing it.|
|onnxruntime-extensions|0.9.0|for tf2onnx|
|optimum|1.16.1|for converting huggingface model to ONNX|

Non-critical packages
|Dependency|version|Reason (if any)|
|---|---|---|
|seaborn|0.13.0|
|matplotlib|3.7.3|

Tentative packages for topic modelling
|Dependency|version|Reason (if any)|
|---|---|---|
|spacy|3.7.2|Installation instructions: https://spacy.io/usage|
|gensim|4.3.2|The latest at setup. Add memory-independent w.r.t. corpus size algorithms. And multicore LDA for faster building time. [Release Notes](https://pypi.org/project/gensim/4.3.0/)|
|pyLDAvis|3.4.1||
|octis|1.13.1|IMPORTANT: it will overwrite exitsing packages to the version of stated in the requirements.txt. It's safe to install newer versions of the packages above, as right now only the implementation of evaluation functions will be used (maybe use the optimization function as well, but definietly not the implementation of the models).|
|sentence-transformers|2.2.2|the latest right now|
|bertopic|0.16.0|the latest right now|

## WSL2

According to offical documentation of tensorflow, WSL is required to use latest version of tensorflow with or without GPU.

Hence, here is the guideline of setting up WSL environment for gpu-enabled ML training.

1. Install NVIDIA Driver for GPU Support

    Install NVIDIA GeForce Game Ready or NVIDIA RTX Quadro Windows 11 display driver on your system with a compatible GeForce or NVIDIA RTX/Quadro card from https://www.nvidia.com/Download/index.aspx. Refer to the system requirements in the Appendix.  

    **This is the only driver you need to install. Do not install any Linux display driver in WSL.**

2. Run cmd. Install wsl in windows. Currently the default version is Ubuntu-22.04 (the default one might change).

    ```Powershell
    wsl --install

    # specify version

    wsl --install -d <DistroName>
    ```

    Then setup the wsl, and run the wsl to load into the linux subsystem

    (Ref: https://learn.microsoft.com/en-us/windows/wsl/install)

    Optional: you may move the wsl whole system to a separate drive after setup (the whole subsystem is just like a file in windows file explorer. [Video](https://youtu.be/Fim4rwyjYrs) or [Text](https://github.com/LpCodes/Moving-WSL-Distribution-to-Another-Drive))

3. Install git lfs for fetching large files (like model weights or other)

    ```terminal
    sudo apt install git-lfs
    ```

    or follow official instructions in the website [Git-Lfs](https://github.com/git-lfs/git-lfs/blob/main/INSTALLING.md)

4. Install CUDA by following the instructions in Step 3 of Nvidia CUDA installation instruction [Link](https://docs.nvidia.com/cuda/wsl-user-guide/index.html#step-3-set-up-a-linux-development-environment). Downloading the wsl distribution of CUDA toolkit, and follow the instruction to install. (Ref: https://hackmd.io/@Kailyn/HkSTXL9xK

    Note that select the version that is at/above the requirement of pytorch and tensorflow. For pytorch, can directly refer to the requirement of the latest version. For tensorflow, can refer to the version  build table [Link](https://www.tensorflow.org/install/source) (Tested build configuration)

    For pytorch, the max cuda version is CUDA 12.1, while for tensorflow, the version 2.14.0 supports CUDA 11.8 (or above ?)

5. Then install cuDNN by following the steps in [Installing cuDNN On Linux](https://docs.nvidia.com/deeplearning/cudnn/install-guide/index.html). 

    For pytorch, it seems no cuDNN is required. For tensorflow, the cuDNN version is 8.7 (or above). Checking the release date, I picked cuDNN 8.9.0 (for 12.x). Download the "Local Installer for Linux x86_64(Tar)"

    There may be some bug in unziping the downloaded file if you follow the steps on the webstie. To unzip the .tar.xz file

    ```
    $ xz -v -d filename.tar.xz
    ```

    Then unzip the tar file
    ```
    tar xvf filename.tar
    ```

    Then copy the files into CUDA toolkit directory, as the website states.

    To ensure both CUDA and cuDNN are installed, run the following commands

    ```
    nvidia-smi

    nvcc -V
    ```
    For the first one, it can detect the NVIDIA card, but there's error for the second command that it cannot find nvcc program. The fix is as below.

    Modify the _.bashrc_ file

    ```
    vim ~/.bashrc
    ```

    add the following two lines at the end of the file
    ```
    export PATH=/usr/local/cuda/bin:$PATH
    export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
    ```

    Then save the file and exit. Run the following command

    ```
    source ~/.bashrc
    ```

    Then re-run the command "nvcc -V" and it should detect the nvidia graphic card.
    

    footnote: if you cd to /usr/local/ you can only find "cuda-<cuda_version>" folder. However, the system will create folder namely "cuda" as a alt link to the folder 

    ```
    xxx@xxx:/usr/local# ls -l
    total 36
    drwxr-xr-x  2 root root 4096 Oct 29 13:16 bin
    lrwxrwxrwx  1 root root   22 Oct 29 13:16 cuda -> /etc/alternatives/cuda
    lrwxrwxrwx  1 root root   25 Oct 29 13:16 cuda-12 -> /etc/alternatives/cuda-12
    drwxr-xr-x 15 root root 4096 Oct 29 13:16 cuda-12.1
    drwxr-xr-x  2 root root 4096 May  2 05:34 etc
    drwxr-xr-x  2 root root 4096 May  2 05:34 games
    drwxr-xr-x  2 root root 4096 May  2 05:34 include
    drwxr-xr-x  3 root root 4096 May  2 05:35 lib
    lrwxrwxrwx  1 root root    9 May  2 05:34 man -> share/man
    drwxr-xr-x  2 root root 4096 May  2 05:34 sbin
    drwxr-xr-x  5 root root 4096 Oct 29 13:16 share
    drwxr-xr-x  2 root root 4096 May  2 05:34 src
    ```

6. Install [miniforge](https://github.com/conda-forge/miniforge) from their Github. Right and copy the link for the distribution "Linux x86_64 (amd64)". Then run the following command and install.

    ```
    wget <the_link_you_copied>
    ```

7. Environment setup

    I prepared the wsl environment with python=3.9.18, and the latest tf and pytorch (with gpu support) at our development. (pytorch=2.1, tensorflow=2.14.0). Can directly import the .yml file and an environment is created. (name of the file: _fyp-test-wsl_pytorch_tf.yml_) (Note that seaborn and other web-scraping tools are not installed.)

    Or you can create a new one as below. (just for documentation purpose)
    
    Create a new virtual environment in miniforge (e.g. fyp-test-wsl)

    ```
    conda create --name fyp-test-wsl python=3.9.18 pandas=2.1.0 numpy scikit-learn=1.3.0 nltk=3.8.3 seaborn matplotlib 

    conda activate fyp-test-wsl
    ```

    Install [pytorch](https://pytorch.org/). Note that in OS, select "Linux". Can select either "Conda" or "Pip" in row "Package". Select "CUDA 12.1" or the version of CUDA you are interested. Currently the latest one is 2.1.0. May have to look at previous versions of PyTorch if 2.1.0 is not that latest.

    ```
    conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia
    ```

    Verify the installation by running in python (Ref: [Stackoverflow](https://stackoverflow.com/questions/48152674/how-do-i-check-if-pytorch-is-using-the-gpu))
    ```
    >>> import torch

    >>> torch.cuda.is_available()
    True

    >>> torch.cuda.device_count()
    1

    >>> torch.cuda.current_device()
    0

    >>> torch.cuda.device(0)
    <torch.cuda.device at 0x7efce0b03be0>

    >>> torch.cuda.get_device_name(0)
    'GeForce GTX 950M'
    ```

    Install tensorflow (only the latest version, as the command has sooo many hidden packages that cannot be installed one-by-one, unless build from source) [Tensorflow WSL2](https://www.tensorflow.org/install/pip#windows-wsl2)   
    For build from source: [Tensorflow Build from source](https://www.tensorflow.org/install/source)

    ```
    python3 -m pip install tensorflow[and-cuda]
    # Verify the installation:
    python3 -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
    ```

    Then you can continue installing other packages for huggingface, and ONNX convertion.

8. Setup VSCode to have access to WSL environment. [Setup](https://code.visualstudio.com/docs/remote/wsl). Follow the process in "Installation". Quote as below

    Installation
    To get started, you need to:

    1. Install the Windows Subsystem for Linux along with your preferred Linux distribution.

        Note: WSL 1 does have some known limitations for certain types of development. Also, extensions installed in Alpine Linux may not work due to glibc dependencies in native source code inside the extension. See the Remote Development and Linux article for details.

    2. Install Visual Studio Code on the Windows side (not in WSL).

        Note: When prompted to Select Additional Tasks during installation, be sure to check the Add to PATH option so you can easily open a folder in WSL using the code command.

    3. Install the WSL extension (in VSCode). If you plan to work with other remote extensions in VS Code, you may choose to install the Remote Development extension pack.

    Then follow the section "Open a remote folder or workspace" to use WSL as an environment in the VSCode command line, and have access to folders in WSL.


### WSL commands

Shutdown all wsl

```terminal
wsl --shutdown
```

Show running wsl

```terminal
wsl --list --running

wsl --l --running
```

Change ram allocation for wsl: [tutorial](https://learn.microsoft.com/en-us/answers/questions/1296124/how-to-increase-memory-and-cpu-limits-for-wsl2-win)

Optimizing wsl environment from time to time (like freeing space or ram optimization): [YouTube](https://youtu.be/4PwClrUCqJM)

Additional config for wsl: [Microsoft](https://learn.microsoft.com/en-us/windows/wsl/wsl-config#wslconfig)

## Docker env creation

create a conda environment with following commands for merely running NLP.py

```
conda create --name fyp-nlp-production python=3.9.18 pika=1.3.1 scikit-learn=1.3.0 nltk=3.8.1 
```

Then export the env as a yml file with only packages specified

```
conda env export --from-history > docker_conda_env_list.yml
```

## Steam API

API to grab comments

Ofiicial documentation: [Documentation](https://partner.steamgames.com/doc/store/getreviews)

Supported Langauges: [Documentation](https://partner.steamgames.com/doc/store/localization/languages) (Look for the column 'API language code')

A sample API call is on Postman, under folder Steamworks API.

Scraping is safe, as long as not too frequent, quote  
"as long as you dont do it from 150 servers with 10k requests per second, they dont care a flip flop.
but due to respect of the service and webrequest limiters that will ban your ip, you might wanna throttle your query limit to about 10-15 per minute."
[Link](https://steamcommunity.com/discussions/forum/7/2254559285364750447/)

__steam-review-scraper by Zhihan-Zhu__

A small project to scrap steam reviews. Can confirm that the code is working as it matches with the documentation above. [Github](https://github.com/Zhihan-Zhu/steam-review-scraper) [Code](https://github.com/Zhihan-Zhu/steam-review-scraper/blob/master/steam_review_scraper/scraper.py)

## TODO

Write scraper according to the github code above.

* Scrap latest posted games review like a paper said, to provide accurate gameplay time.
* Scrap all comments of majority of games (top 50 (?) games per category), regardless of playtime
