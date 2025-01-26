from typing import TypedDict, Dict, Any, Annotated
import operator
from .prompts import get_supervisor_prompt, query_response_prompt, sentiment_analysis_prompt
from .tools import retriever
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    task_completed: bool
    current_agent: str
    script_context: Dict[str, Any]

class MultiAgentWorkflow:
    def __init__(self, 
                 openai_api_key: str, 
                 model: str = "gpt-4o",
                 verbose: bool = False):
        """
        Initialize multi-agent workflow with configurable parameters
        
        Args:
            openai_api_key: OpenAI API key
            model: Language model to use
            verbose: Enable detailed logging
        """
        self.verbose = verbose
        self.llm = ChatOpenAI(
            model=model, 
            api_key=openai_api_key,
            temperature=0.3  # More deterministic responses
        )
        
        self.workflow = self._create_workflow()
    
    def _log(self, message: str):
        """Conditional logging"""
        if self.verbose:
            print(f"[WORKFLOW LOG] {message}")
    
    def supervisor_router(self, state: AgentState):
        """
        Intelligent routing based on context and query
        
        Returns:
            Dict with selected agent and updated context
        """
        messages = state['messages']
        query = messages[-1].content
        
        # Retrieve script context for routing
        
        
        # Enhanced routing with LLM-based decision
        routing_response = self.llm.invoke([
            SystemMessage(content=get_supervisor_prompt()),
            HumanMessage(content=f"Query: {query}")
        ])
        
        self._log(f"Supervisor Routing: {routing_response.content}")
        
        # Parsing routing decision
        route_map = {
            "sentiment": "sentiment_agent",
            "query": "query_agent"
        }
        
        selected_agent = next(
            (route_map.get(key) for key in route_map if key in routing_response.content.lower()), 
            "query_agent"
        )
        
        return {
            "current_agent": selected_agent
        }
    
    def sentiment_agent(self, state: AgentState):
        """Sentiment analysis with rich context"""
        # messages = state['messages']
        # context = state.get('script_context', {})
        # print(f"thisis {state['messages'][-1].content}")
        dialogues, summary = retriever(state['messages'][-1].content)
        sentiment_response = self.llm.invoke([
            SystemMessage(content=sentiment_analysis_prompt()),
            HumanMessage(content=state['messages'][-1].content),
            SystemMessage(content=f"Dialogues:\n{dialogues}")
        ])
        
        self._log("Sentiment Agent Processed")
        
        return {
            "messages": [sentiment_response],
            "task_completed": True
        }
    
    def query_agent(self, state: AgentState):
        """Enhanced query response with retrieval"""
        messages = state['messages']
        context = state.get('script_context', {})
        dialogues, summary = retriever(state['messages'][-1].content)
        query_response = self.llm.invoke([
            SystemMessage(content=query_response_prompt()),
            HumanMessage(content=messages[-1].content),
            SystemMessage(content=f"Summary:\n{summary}\n\nDialogues:\n{dialogues}")
        ])
        
        self._log("Query Agent Processed")
        
        return {
            "messages": [query_response],
            "task_completed": True
        }
    
    def _create_workflow(self):
        """
        Create workflow with robust error handling
        
        Returns:
            Compiled workflow graph
        """
        workflow = StateGraph(AgentState)
        
        # Define nodes
        workflow.add_node("supervisor", self.supervisor_router)
        workflow.add_node("sentiment_agent", self.sentiment_agent)
        workflow.add_node("query_agent", self.query_agent)
        
        # Configure workflow routing
        workflow.add_edge(START, "supervisor")
        workflow.add_conditional_edges(
            "supervisor",
            lambda x: x['current_agent'],
            {
                "sentiment_agent": "sentiment_agent",
                "query_agent": "query_agent"
            }
        )
        
        # Termination states
        workflow.add_edge("sentiment_agent", END)
        workflow.add_edge("query_agent", END)
        
        return workflow.compile()
    
    def run(self, query: str):
        """
        Execute workflow with initial query
        
        Args:
            query: User's input query
        
        Returns:
            Workflow execution result
        """
        inputs = {
            "messages": [HumanMessage(content=query)],
            "task_completed": False,
            "current_agent": None,
            "script_context": {}
        }
        
        return self.workflow.invoke(inputs)
