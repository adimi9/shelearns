from typing import List

class TextProcessor:
    def __init__(self, chunk_size: int = 1000):
        self.chunk_size = chunk_size

    def split_into_chunks(self, text: str) -> List[str]:
        """
        Splits a given text into chunks of a specified size (in characters).
        This method is currently not directly used in the RAGSystem's answer_question method
        but is included as part of the original code provided.
        """
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0

        for word in words:
            # Check if adding the next word (plus a space) exceeds the chunk size
            if current_size + len(word) + (1 if current_chunk else 0) > self.chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_size = len(word)
            else:
                current_chunk.append(word)
                current_size += len(word) + 1 # +1 for the space

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks
