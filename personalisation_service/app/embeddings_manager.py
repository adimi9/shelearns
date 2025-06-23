from typing import List
from fastapi import HTTPException
import openai
import numpy as np
import asyncio # For potential future async usage, though openai's client handles it

class EmbeddingsManager:
    def __init__(self, api_key: str):
        # Initialize the asynchronous OpenAI client
        # It's important to use the AsyncOpenAI client for FastAPI's async endpoints
        self.client = openai.AsyncOpenAI(api_key=api_key)

    async def create_embeddings(self, texts: List[str]) -> List[np.ndarray]:
        """
        Creates embeddings for a list of texts using OpenAI's embedding model.
        This method is now asynchronous.
        """
        embeddings = []
        for text in texts:
            try:
                # Use await for the asynchronous API call
                response = await self.client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=text
                )
                embeddings.append(np.array(response.data[0].embedding))
            except openai.APIErrors.APIConnectionError as e:
                print(f"OpenAI API Connection Error: {e}")
                # Handle specific API connection errors, e.g., retry or inform
                raise HTTPException(status_code=503, detail="Could not connect to OpenAI API.")
            except openai.APIErrors.RateLimitError as e:
                print(f"OpenAI API Rate Limit Exceeded: {e}")
                raise HTTPException(status_code=429, detail="OpenAI API rate limit exceeded. Please try again later.")
            except openai.APIErrors.AuthenticationError as e:
                print(f"OpenAI API Authentication Error: {e}")
                raise HTTPException(status_code=401, detail="Invalid OpenAI API key.")
            except openai.APIErrors.OpenAIError as e:
                print(f"OpenAI API Error: {e}")
                raise HTTPException(status_code=500, detail=f"An error occurred with the OpenAI API: {e.args[0]}")
            except Exception as e:
                print(f"An unexpected error occurred during embedding creation: {e}")
                raise HTTPException(status_code=500, detail=f"An unexpected error occurred during embedding creation: {e}")
        return embeddings