#!/bin/bash

source ~/miniforge3/bin/activate fyp-test-wsl

echo -e "\n\n"
echo "evaluation bash script starts"
echo -e "\n\n"

python evaluation_script.py 240 False 2023 12 18
echo -e "\n\n"

# python evaluation_script.py 480 True 2023 12 20

python evaluation_script.py 480 False 2023 12 20
echo -e "\n\n"

echo -e "\n\n"
echo "evaluation bash script complete"
echo -e "\n\n"