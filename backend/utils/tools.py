from langchain_pinecone import PineconeVectorStore
from langchain_cohere import CohereEmbeddings
import os
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

def get_pinecone_vectorstore(index_name: str) -> PineconeVectorStore:
    embedding_model = CohereEmbeddings(model="embed-english-v2.0", cohere_api_key=COHERE_API_KEY)
    return PineconeVectorStore(
        pinecone_api_key=PINECONE_API_KEY,
        index_name=index_name,
        embedding=embedding_model
    )

def get_dialogues_summary(docs):
    retrieved_docs = [doc for doc, _ in docs]
    summary = [doc.metadata.get("summary", "No summary available") for doc in retrieved_docs]
    summary = '\n\n'.join(summary)
    # print(f"Summary: {summary}")
    dialogues = {f"scene_{i+1}": doc.page_content for i, doc in enumerate(retrieved_docs)}
    # print(dialogues)
    return dialogues, summary

def retriever(prompt:str):
    vectorstore = get_pinecone_vectorstore(index_name="bee-script")
    docs = vectorstore.similarity_search_with_score(prompt, k=3)
    dialogues, summary = get_dialogues_summary(docs)
    return dialogues, summary
