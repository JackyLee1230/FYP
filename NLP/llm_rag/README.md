# LLM Analysis

The folder storing the LLM analysis functions to generate different results with LLM.

Langchain is used as the major backend.

## Folder structure

|Folder|Details|
|---|---|
|chromadb_storage|A persistent storage for ChromaDB. The database stored critic reviews for larger titles, and the embeddings of those reviews|
|Mixtral-8x7B-Instruct-v0.1_tokenizer|Tokenizer for Mixtral-8x7B-Instruct-v0.1 to create embeddings|

|File|Details|
|---|---|
|_llm_rag_utils.py|Utility functions to process output from Mixtral8x7B, and calculating token usage.|
|_llm_sample_reviews.py|A list of sample reviews for testing.|
|_pergame_tldr.py|Prompts for generating per-game TLDR, and functions for requesting sentiment analysis and topic modeling data from the platform.|
|_prompts.py|Prompts for generating per-review analysis|
|mistralai_embeddings.py|The class for calling/receiving embedding result from MistralAI API, with modification to return the token usage statistics of each call.|
|llm_main.py|The main program of storing all LLM related services.|

## Remarks

Although Mistral AI API is used for deploying, our prompts work with local small to medium sized LLM models, such as LLAMA2-7B, Gemma-7B, Mistral7B and Mixtral8x7B, using Ollama. By modifying the used llm model in llm_main.py, the service can be hosted with local LLM models without using Mistral AI API. More code has to be modified/implemented to support [tracking token usage with Ollama in Langchain](https://github.com/langchain-ai/langchain/discussions/19422).

In fact, Mixtral8x7B is used for LLM content generation and embedding instead of larger models such as mistral-large-latest by MistralAI and GPT-4 by OpenAI, as our generation task is not complicated. Mixtral8x7B balances the cost and performance the best. Therefore, the result can be replicated by using Mixtral8x7B in Ollama.

Regarding the embedding function for ChromaDB, Mistral AI embedding API was used to provide a unified LLM RAG (Retrieval-Augmented Generation) experience. However, the model behind Mistral AI embedding API is a close-source embedding moddel. Instead, sentence transformer embedding (such as all-MiniLM-L6-v2) can be used as the embedding function. The database has to be re-created, and replace all content in the folder _chromadb_storage_.
