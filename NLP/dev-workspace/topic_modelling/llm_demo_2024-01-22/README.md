# Topic model with Ollama

Connecting with Ollama through Langchain to use LLMs with ease

A short tutorial to setup with ollama docker (some notes), and langchain (to send prompt & receive result)

https://github.com/langchain-ai/langchain

https://github.com/jmorganca/ollama

## Ollama

Follow Ollama github to install a docker version of ollama: [Github](https://github.com/jmorganca/ollama)

Then launch the container. The default port of the docker is 11434, which is same as the port for ollama.

Official API (seems those can also be used in Langchain, by passing value as parameters)  
https://github.com/jmorganca/ollama/blob/main/docs/api.md

## Langchain

Install langchain by following the instruction in [Github](https://github.com/langchain-ai/langchain)

Tutorial from Ollama about how to interact with langchain with python  
https://github.com/jmorganca/ollama/blob/main/docs/tutorials/langchainpy.md

## Chroma

A light-weight vector DB for quick deployment and ease to use. With integration with Ollama.

For using Chroma with Docker, and hook it to Langchain, check the introduction in Langchain: [LangChain](https://python.langchain.com/docs/integrations/vectorstores/chroma)

## Setup

Follow the official documentations to install Ollama, Langchain and Chroma. Just install the latest right now. The impact of version difference shd be little to none.
