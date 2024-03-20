#!/bin/bash

source ~/miniforge3/bin/activate fyp-test2-wsl

echo -e "\n\n"
echo "BERT fine-tuning bash script starts"
echo -e "\n\n"

python bert_finetune_script.py 120 True
echo -e "\n\n"

python bert_finetune_script.py 120 False
echo -e "\n\n"


python bert_finetune_script.py 240 True
echo -e "\n\n"

python bert_finetune_script.py 240 False
echo -e "\n\n"

python bert_finetune_script.py 480 True
echo -e "\n\n"

python bert_finetune_script.py 480 False
echo -e "\n\n"

echo -e "\n\n"
echo "BERT fine-tuning bash script completes"