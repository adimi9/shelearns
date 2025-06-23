import numpy as np
from typing import List, Tuple

class RetrievalSystem:
    def __init__(self, chunks: List[str], embeddings: List[np.ndarray]):
        self.chunks = chunks
        self.embeddings = embeddings

    def find_similar_chunks(self, query_embedding: np.ndarray) -> List[Tuple[str, float]]:
        """
        Finds chunks most similar to a given query embedding using cosine similarity.
        This method is currently not directly used in the RAGSystem's answer_question method
        but is included as part of the original code provided.
        """
        similarities = []
        # Ensure that query_embedding and embeddings are valid numpy arrays
        if not isinstance(query_embedding, np.ndarray) or query_embedding.ndim == 0:
            raise ValueError("Query embedding must be a non-empty numpy array.")
        if not all(isinstance(e, np.ndarray) and e.ndim > 0 for e in self.embeddings):
            raise ValueError("All embeddings must be non-empty numpy arrays.")

        query_norm = np.linalg.norm(query_embedding)
        if query_norm == 0:
            print("Warning: Query embedding has zero norm. Cannot calculate similarity.")
            return []

        for i, embedding in enumerate(self.embeddings):
            embedding_norm = np.linalg.norm(embedding)
            if embedding_norm == 0:
                similarity = 0.0 # Or handle as an error if appropriate
                print(f"Warning: Embedding at index {i} has zero norm.")
            else:
                similarity = np.dot(query_embedding, embedding) / (query_norm * embedding_norm)
            similarities.append((self.chunks[i], similarity))

        return sorted(similarities, key=lambda x: x[1], reverse=True)