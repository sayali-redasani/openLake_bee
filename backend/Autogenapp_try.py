from flask import Flask, request
from flask_cors import CORS
from utils.prompts import sentiment_analysis_prompt, query_response_prompt, get_supervisor_prompt
from utils.tools import retriever_rag, retriever_sentiment
import logging
from langchain_pinecone import PineconeVectorStore
from langchain_cohere import CohereEmbeddings
import os
import time
from typing import List, Any
from langchain_core.messages import HumanMessage
from langchain_core.prompts import PromptTemplate
from langchain_cohere import ChatCohere
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import Swarm
from autogen_agentchat.teams import SelectorGroupChat
import asyncio
from autogen_agentchat.ui import Console

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY")
)

SupervisorAgent = AssistantAgent(
    "supervisor_agent",
    model_client=model_client,
    system_message=get_supervisor_prompt(),
)

sentiment_agent  = AssistantAgent(
    "sentiment_agent",
    model_client=model_client,
    tools=[retriever_sentiment],
    system_message=sentiment_analysis_prompt(),
    # max_consecutive_auto_reply=2
)

query_response_agent = AssistantAgent(
    "query_response_agent",
    model_client = model_client,
    tools=[retriever_rag],
    system_message=query_response_prompt()
)

text_mention_termination = TextMentionTermination("ANSWERED")
max_messages_termination = MaxMessageTermination(max_messages=3)
termination = text_mention_termination | max_messages_termination

team = SelectorGroupChat(
    [SupervisorAgent, sentiment_agent, query_response_agent],
    model_client=OpenAIChatCompletionClient(model="gpt-4o-mini", api_key=os.getenv("OPENAI_API_KEY")), termination_condition=termination,
)

prompt = "How does Barry feel when he says, 'We demand an end to the glorification of the bear as nothing more than a vicious, smelly, ill-tempered, big-headed stink machine'?"
prompt1 = "What happens after the plaintiff lawyer says ‘LAWYER: ‘What are we gonna do?’ ‘He's playing the species card."
prompt2 = "How does Vanessa appear to feel in Barry’s dream?"
async def main():
    await Console(team.run_stream(task=prompt2))
asyncio.run(main())


# Autogen leads to never ending loop.