# LLM with RAG development

LLM: Large Language Model  
RAG: Retrieval-Augmented Generation

Where LLM + RAG feature is developed.

## Folder Structure

|Folder|Details|
|---|---|
|aspects_response_logs|Terminal outputs when running llm_rag/llm_main.py|
|chromadb_storage|The chromadb database used in main branch|
|previous_tests|Containing testing scripts of the feasibility of the LLM prompting.|
|llm_summary_project|Folder where per-game TLDR is developed|

Scripts

|Files|Details|
|---|---|
|_aspects_responses.py|Storing sample aspects response to test with keyword extraction and sentiment analysis per aspect|
|_prompts.py|Prompts for LLM|
|_sample_reviews.py|Storing sample reviews to test with aspects extraction, keyword extraction from aspects, and TLDR generation with LLM + RAG|
|llm_rag_comparison_02.ipynb|Testing different numbers of aspects in each prompt during aspects extraction with RAG|
|llm_rag_comparison.ipynb|Testing the performance on Spam detection, content extraction with RAG (i.e. aspects extraction), and Keyword generation of local LLMs with Ollama.|
|methods_from_main_branch.py|LLM output parsing functions|
|mistralai_embeddings.py|Modified MistralAI Embedding API caller, originally from langchain|

Critic reviews

|Folder|Details|
|---|---|
|counter-strike_2|Critic reviews of the game Counter Strike 2|
|cyberpunk_2077|Critic reviews of the game Cyberpunk 2077|
|cyberpunk_2077_phantom_liberty|Critic reviews of the game Cyberpunk 2077 Phantom Liberty|
|dota2|Critic reviews of the game Dota 2|
|monster_hunter_world|Critic reviews of the game Monster Hunter World|
|monster_hunter_world_iceborne|Critic reviews of the game Monster Hunter World Iceborne|
|starfield|Critic reviews of the game Starfield|

Miscellenous

|Files|Details|
|---|---|
|chromadb_docker_note.md|Tutorial abt to mount volume/persistent directory to docker container.|

### _llm_summary_project_

Files under the folder. This folder is more important then _previous_tests_ as the lateset development strategy is in these scripts, which is valuable to reference with the workflow of developing a LLM (MistralAI) + RAG (Langchain) workflow.

Files are ordered with their stage of development (or running sequence).

|Files|Details|
|---|---|
|review_user_profile_creation.ipynb|Part 1 of creating LLM summary project. It creates fake user profile with [faker](https://github.com/joke2k/faker) from the steam user profile.|
|review_analysis_generation.ipynb|Part 2. It loads all the scrapped reviews from a steam game. Then passes all the reviews to a SA model and trained BERTopic model (according to the genre of the game) to generate the results of SA analysis and topic modelling (on unseen context).|
|review_analysis_processing.ipynb|Part 3. It creates dataframes of SA analysis and TM result like in our platform's API|
|reviews_analysis_critic_reviews_prompting.ipynb|Part 3.5. It creates chromadb vector database with the critic reviews of the game using MistralAI embedding API. (The script can be treated as a tutorial of interacting MistralAI API with Langchain.)|
|review_analysis_prompting.ipynb|Part 4. It creates prompts and prompts the Mixtral8x7B LLM model through MistralAI API (integrated with Langcahin) to get the per-game TLDR. The reference in how the prompts are constructed.|

### _previous_tests_

Scripts under _previous_tests_ and their usage/description.

|Files|Details|
|---|---|
|ollama_get_token_usage_example.ipynb|A minimum workable example of tracking token usage with Ollama. Used to ans [Discussion](https://github.com/langchain-ai/langchain/discussions/19422)|
|rag_bot.ipynb|An unfinished attempt to build a chatbot with RAG (like chatPDF)|
|rag_critic_reviews_mistralai_api.ipynb|Testing RAG with chromadb and mistral api|
|rag_critic_reviews.ipynb|Testing RAG with chromadb, langchain and local ollama models|
|rag_game_comments.ipynb|First test with LLM+RAG on per-review spam detection, and aspects extraction (sentence). Using Llama2|
|rag_game_comments_gemma_2b.ipynb|First test with LLM+RAG on per-review spam detection, and aspects extraction (sentence). Using gemma-2b|
|rag_game_comments_opt.ipynb|Experimenting with different numbers of aspects in each prompt to perform aspects extraction. Using gemma-2b|
|rag_game_comments_opt copy.ipynb|Same as _rag_game_comments_opt.ipynb_, using llama2-7b-chat|
|rag_game_comments_opt copy 2.ipynb|Same as _rag_game_comments_opt.ipynb_, using mistral-7b-instruct-v0.2|
|rag_game_comments_opt copy 3.ipynb|Same as _rag_game_comments_opt.ipynb_, using gemma-7b-instruct|
|rag_game_comments_opt_v2.ipynb|Based on different _rag_game_comments_opt*.ipynb_, we used a mix of models for different tasks: mistral7b as spam detection, gemma-2b as aspects extraction. Use small models for faster cpu inference (but still not fast enough)...|
|rag_game_comments_opt_v3_mistral7b.ipynb|Added output format example to the aspects extraction, keyword generation (anything that requires a JSON ontput), resulting in better generation quality. Testing with local mistral7b-instruct hosted with local Ollama|
|rag_game_comments_opt_v3_mixtral8x7b.ipynb|Same as _rag_game_comments_opt_v3_mistral7b_, using local mixtral8x7b-instruct hosted with local Ollama|
|rag_mistralapi_test.ipynb|Testing to interact with mistralapi through langchain|
