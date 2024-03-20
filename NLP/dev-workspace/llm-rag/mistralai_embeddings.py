####################
# Copy from: https://github.com/langchain-ai/langchain/blob/master/libs/partners/mistralai/langchain_mistralai/embeddings.py
####################


import asyncio
from collections import deque
import logging
from typing import Dict, Iterable, List, Optional

from langchain_core.embeddings import Embeddings
from langchain_core.pydantic_v1 import (
    BaseModel,
    Extra,
    Field,
    SecretStr,
    root_validator,
)
from langchain_core.utils import convert_to_secret_str, get_from_dict_or_env
from mistralai.async_client import MistralAsyncClient
from mistralai.client import MistralClient
from mistralai.constants import (
    ENDPOINT as DEFAULT_MISTRAL_ENDPOINT,
)
from mistralai.exceptions import MistralException
from tokenizers import Tokenizer  # type: ignore

from copy import deepcopy

logger = logging.getLogger(__name__)

MAX_TOKENS = 16_000


class CustomMistralAIEmbeddings(BaseModel, Embeddings):
    """MistralAI embedding models.

    To use, set the environment variable `MISTRAL_API_KEY` is set with your API key or
    pass it as a named parameter to the constructor.

    Example:
        .. code-block:: python

            from langchain_mistralai import MistralAIEmbeddings
            mistral = MistralAIEmbeddings(
                model="mistral-embed",
                mistral_api_key="my-api-key"
            )
    """

    def __init__(self, embedding_stats_deque: deque, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.embedding_stats_deque = embedding_stats_deque

    client: MistralClient = Field(default=None)  #: :meta private:
    async_client: MistralAsyncClient = Field(default=None)  #: :meta private:
    mistral_api_key: Optional[SecretStr] = None
    endpoint: str = DEFAULT_MISTRAL_ENDPOINT
    max_retries: int = 5
    timeout: int = 120
    max_concurrent_requests: int = 64
    tokenizer: Tokenizer = Field(default=None)

    model: str = "mistral-embed"

    class Config:
        extra = Extra.allow             # allow new fields to be added to the model
        arbitrary_types_allowed = True

    @root_validator()
    def validate_environment(cls, values: Dict) -> Dict:
        """Validate configuration."""

        values["mistral_api_key"] = convert_to_secret_str(
            get_from_dict_or_env(
                values, "mistral_api_key", "MISTRAL_API_KEY", default=""
            )
        )
        values["client"] = MistralClient(
            api_key=values["mistral_api_key"].get_secret_value(),
            endpoint=values["endpoint"],
            max_retries=values["max_retries"],
            timeout=values["timeout"],
        )
        values["async_client"] = MistralAsyncClient(
            api_key=values["mistral_api_key"].get_secret_value(),
            endpoint=values["endpoint"],
            max_retries=values["max_retries"],
            timeout=values["timeout"],
            max_concurrent_requests=values["max_concurrent_requests"],
        )
        if values["tokenizer"] is None:
            values["tokenizer"] = Tokenizer.from_pretrained(
                "mistralai/Mixtral-8x7B-v0.1"
            )
        return values

    def _get_batches(self, texts: List[str]) -> Iterable[List[str]]:
        """Split a list of texts into batches of less than 16k tokens
        for Mistral API."""
        batch: List[str] = []
        batch_tokens = 0

        text_token_lengths = [
            len(encoded) for encoded in self.tokenizer.encode_batch(texts)
        ]

        for text, text_tokens in zip(texts, text_token_lengths):
            if batch_tokens + text_tokens > MAX_TOKENS:
                yield batch
                batch = [text]
                batch_tokens = text_tokens
            else:
                batch.append(text)
                batch_tokens += text_tokens
        if batch:
            yield batch

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of document texts.

        Args:
            texts: The list of texts to embed.

        Returns:
            List of embeddings, one for each text.
        """
        try:
            batch_responses = (
                self.client.embeddings(
                    model=self.model,
                    input=batch,
                )
                for batch in self._get_batches(texts)
            )

            batch_responses = list(batch_responses)

            # print('batch_responses @embed_documents():', batch_responses)
            b_resp = deepcopy(list(batch_responses))        # deep copy as batch_responses is a generator
            b_resp_usage_list = [response.usage for response in b_resp]
            # add to the deque
            self.embedding_stats_deque.append(b_resp_usage_list)

            # debug use
            # for response in b_resp:
            #     print('response:', response)
            #     print('response.data:', response.data)
            #     for d in response.data:
            #         print('d:', d)
            #         print('d.embedding:', d.embedding)
            #         print('d.embedding type:', type(d.embedding))
            #         print('d.embedding length:', len(d.embedding))
            #     print('response.model:', response.model, '; type:', type(response.model))
            #     print('response.usage:', response.usage, '; type:', type(response.usage))
            
            return [
                list(map(float, embedding_obj.embedding))
                for response in batch_responses
                for embedding_obj in response.data
            ]
        except MistralException as e:
            logger.error(f"An error occurred with MistralAI: {e}")
            raise

    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of document texts.

        Args:
            texts: The list of texts to embed.

        Returns:
            List of embeddings, one for each text.
        """
        try:
            batch_responses = await asyncio.gather(
                *[
                    self.async_client.embeddings(
                        model=self.model,
                        input=batch,
                    )
                    for batch in self._get_batches(texts)
                ]
            )

            print('batch_responses @aembed_documents():', batch_responses)

            # do the same thing as in embed_documents()
            b_resp = deepcopy(list(batch_responses))        # deep copy as batch_responses is a generator
            b_resp_usage_list = [response.usage for response in b_resp]
            # add to the deque
            self.embedding_stats_deque.append(b_resp_usage_list)

            return [
                list(map(float, embedding_obj.embedding))
                for response in batch_responses
                for embedding_obj in response.data
            ]
        except MistralException as e:
            logger.error(f"An error occurred with MistralAI: {e}")
            raise

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query text.

        Args:
            text: The text to embed.

        Returns:
            Embedding for the text.
        """
        return self.embed_documents([text])[0]

    async def aembed_query(self, text: str) -> List[float]:
        """Embed a single query text.

        Args:
            text: The text to embed.

        Returns:
            Embedding for the text.
        """
        return (await self.aembed_documents([text]))[0]