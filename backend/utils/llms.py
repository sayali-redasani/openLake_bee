import os
from langchain_cohere import ChatCohere
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from a .env file
load_dotenv()

# Retrieve API keys from environment variables
cohere_api_key = os.getenv('COHERE_API_KEY')
google_api_key = os.getenv('GOOGLE_API_KEY')

def get_cohere_llm() -> Optional[ChatCohere]:
    """
    Initialize and return the Cohere LLM model.

    Returns:
        Optional[ChatCohere]: The Cohere LLM model or None if an error occurs.
    """
    try:
        if not cohere_api_key:
            raise ValueError("Cohere API key not found.")
        model = ChatCohere(model="command-r-plus", cohere_api_key=cohere_api_key,streaming=True)
        return model
    except Exception as e:
        print(f"Error initializing Cohere model: {e}")
        return None

