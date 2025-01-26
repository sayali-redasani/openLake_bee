import json
import os
import urllib.parse
from pymongo import MongoClient
from langchain_pinecone import PineconeVectorStore
from langchain.schema import Document
from langchain_cohere import CohereEmbeddings
from dotenv import load_dotenv
import re
from typing import List, Any
# Load environment variables from .env file
load_dotenv()

# Configuration Constants
USERNAME = os.getenv("MONGO_USERNAME")
# PASSWORD = os.getenv("MONGO_PASSWORD")
# MONGO_URI = os.getenv("MONGO_URI")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "bee-script"

# # MongoDB Client Initialization
# client = MongoClient(MONGO_URI)
# db = client["bee"]
# collection = db["bee_data"]
# print(collection)

# def split_text() -> List[str]:
#     with open("Scene_chunk.md", "r", encoding="utf-8") as file:
#         content = file.read()
#         scenes = re.split(r"## Scene (\d+):", content)[1:]
#         scene_data = []
#         for i in range(0, len(scenes), 2):
#             scene_number = int(scenes[i].strip())  # Scene number
#             scene_text = scenes[i + 1].strip()  # Scene content
#             scene_dict = {
#                 "scene": scene_number,
#                 "dialogue": scene_text
#             }
#             scene_data.append(scene_dict)
#     return scene_data

# def merge_scene_data():
#     # Read scene data from markdown
#     scene_data = split_text()
    
#     # Create a dictionary for quick scene lookup
#     scene_dict = {scene['scene']: scene['dialogue'] for scene in scene_data}
    
#     # Read and update JSONL file
#     updated_docs = []
#     with open('summaryfinal.jsonl', 'r', encoding='utf-8') as file:
#         for line in file:
#             doc = json.loads(line)
            
#             # Check if scene number exists in scene_dict
#             if doc.get('scene') in scene_dict:
#                 # Add dialogue to the document
#                 doc['dialogue'] = scene_dict[doc['scene']]
            
#             updated_docs.append(doc)
    
#     # Write updated documents back to JSONL
#     with open('summaryfinal_updated.jsonl', 'w', encoding='utf-8') as file:
#         for doc in updated_docs:
#             file.write(json.dumps(doc) + '\n')

#     print(f"Updated {len(updated_docs)} documents with scene dialogues.")

# Call the function to merge and update
# merge_scene_data()

# def read_summary() -> None:
#     vectorstore = get_pinecone_vectorstore(INDEX_NAME)
#     docs = []
#     scene_data = split_text()
#     with open('summaryfinal.jsonl', 'r', encoding='utf-8') as file:
#         for line in file:
#             doc = json.loads(line)
#             docs.append(doc)

def convert_to_document(doc: dict) -> Document:
    print(doc.keys())
    return Document(
        page_content=doc["dialogue"],
        metadata={
            "connections": doc.get("connections", ""),
            "scene": doc.get("scene", ""),
            "summary": doc.get("summary", "")
        }
    )

def get_pinecone_vectorstore(index_name: str) -> PineconeVectorStore:
    embedding_model = CohereEmbeddings(model="embed-english-v2.0", cohere_api_key=COHERE_API_KEY)
    return PineconeVectorStore(
        pinecone_api_key=PINECONE_API_KEY,
        index_name=index_name,
        embedding=embedding_model
    )

def read_summary() -> None:
    vectorstore = get_pinecone_vectorstore(INDEX_NAME)
    docs = []
    count=0
    with open('summaryfinal_updated.jsonl', 'r', encoding='utf-8') as file:
        for line in file:
            count=count+1
            print(count)
            data = json.loads(line.strip())
            docs.append(convert_to_document(data))

    vectorstore.add_documents(docs)

# Execute the read_summary function
if __name__ == "__main__":
    read_summary()

  



# mongo_uri = "rmongodb+srv://sayaliredasani:Sayali@98@cluster0.mnbs1.mongodb.net/"