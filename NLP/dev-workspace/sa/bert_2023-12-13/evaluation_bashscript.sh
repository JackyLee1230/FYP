#!/bin/bash

source ~/miniforge3/bin/activate fyp-test2-wsl

echo -e "\n\n"
echo "evaluation bash script starts"
echo -e "\n\n"

python evaluation_script.py 120 True 2024 01 18
echo -e "\n\n"

python evaluation_script.py 120 False 2024 01 18
echo -e "\n\n"

python evaluation_script.py 240 True 2024 01 18
echo -e "\n\n"

python evaluation_script.py 240 False 2024 01 18
echo -e "\n\n"


python evaluation_script.py 480 True 2024 01 18
echo -e "\n\n"

python evaluation_script.py 480 False 2024 01 18
echo -e "\n\n"

echo -e "\n\n"
echo "evaluation bash script complete"
echo -e "\n\n"