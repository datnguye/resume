+++
title = "Context Engineering: How RAG, agents, and memory make LLMs actually useful"
description = "When your LLM needs more than just a good prompt? Context Engineering is the answer. Let's explore how RAG, agents, memory systems, and action tools work together to create truly intelligent applications."
date = 2025-08-05
template = "blog_page.html"

[extra]
author = "Dat Nguyen"
tags = ["ContextEngineering", "RAG", "LLM", "Agents", "MCP", "VectorDB"]
read_time = "9 min read"
featured_image = "/blog/context-engineering-modern-llm-ecosystem/hero.png"
# toc = true
show_ads = true
+++
![Context Engineering diagram showing the interconnected components of RAG, Agents, Memory Systems, and Action Tools working together to enhance LLM capabilities](/blog/context-engineering-modern-llm-ecosystem/hero.png)

## Context Engineering, why should we care?

You've built your first LLM application, and it works great... until it doesn't. When users ask about last week's data? When they need real-time information? When the model needs to remember previous conversations? That's when you realize — prompting alone isn't enough.

Context Engineering is how we solve these problems. It's the art of orchestrating multiple components — RAG, agents, memory systems, and action tools — to give LLMs the context they need to be truly useful.

The graph below illustrates the essential components and the relationships between them:

- [[1](#1-user-intent-prompting-the-starting-point-yellow-circle)] User Intent & Prompting 🟡
- [[2](#2-agents-reasoning-the-decision-makers-red-circle)] Agents & Reasoning 🔴
- [[3](#3-rag-the-knowledge-base-blue-circle)] RAG 🔵
- [[4](#4-action-tools-getting-things-done-red-circle)] Action Tools 🔴
- [[5](#5-memory-systems-short-term-vs-long-term-purple-circle)] Memory Systems 🟣

<link rel="stylesheet" href="/blog/context-engineering-modern-llm-ecosystem/diagram.css">
<link rel="stylesheet" href="/blog/context-engineering-modern-llm-ecosystem/stacked-bar-chart.css">
<div id="context-engineering-diagram" style="width: 100%; height: 700px; margin: 40px 0;" role="img" aria-label="Interactive diagram showing the relationships between Context Engineering components: User Intent & Prompting, Agents & Reasoning, RAG, Action Tools, and Memory Systems">
  <noscript>
    <p><strong>Diagram Description:</strong> This interactive diagram illustrates how Context Engineering components work together. At the center is the Context node, which connects to five key components: (1) User Intent & Prompting provides the initial query, (2) Agents & Reasoning orchestrates the decision-making process, (3) RAG retrieves relevant knowledge from your data, (4) Action Tools enable external interactions, and (5) Memory Systems maintain conversation state and user preferences. All components feed back into the central Context, creating a feedback loop that enriches the LLM's understanding.</p>
  </noscript>
</div>
<script src="https://unpkg.com/neo4j-driver@5.15.0/lib/browser/neo4j-web.min.js"></script>
<script src="https://unpkg.com/neovis.js@2.1.0/dist/neovis.min.js"></script>
<script src="https://unpkg.com/vis-network@9.1.9/standalone/umd/vis-network.min.js"></script>
<script src="/blog/context-engineering-modern-llm-ecosystem/diagram.js"></script>
<script src="/blog/context-engineering-modern-llm-ecosystem/stacked-bar-chart.js"></script>

## Breaking down the Context Engineering Stack

When we zoom into the **Context** node type, we see that it’s essentially the **Prompt**.
A prompt is typically structured as follows, whether we observe it directly or build it programmatically:


<div id="basic-prompt-chart" data-stacked-chart='{"items": [
  {"label": "System Message", "emoji": "🟡", "color": "#3d3319", "textColor": "#fbbf24"},
  {"label": "Context", "emoji": "💚", "color": "#1a3a2e", "textColor": "#34d399"},
  {"label": "Intent", "emoji": "🟡", "color": "#3d3319", "textColor": "#fbbf24"}
]}' data-chart-options='{"height": 300, "captionText": "Basic Prompt Structure"}'></div>


In a fresh inference, let's suppose a user asks, _"Show me the top 5 products by revenue last quarter."_

* **System Message** 🟡 → sets the overall behavior or rules.
    > "You are a data analytics assistant. Always provide SQL queries and clear explanations."
* **Intent** 🟡 → captures the user's goal or request, this is actually the User Question in the natural language, possibly plus some [Prompt Engineering](https://www.promptingguide.ai/) stuff.
    > "Retrieve top 5 products by revenue for the last quarter."
* **Context** 💚 → the dynamic part, enriched through augmentation and/or reasoning.
    > (assuming empty at the first place)

Unlike the static [System Message] and [Intent], the [Context] is designed to evolve across multiple (probably hidden) inference steps.

Behind the scenes, the full prompt often looks more detailed:

<div id="context-engineered-chart" data-stacked-chart='{"items": [
  {"label": "System Message", "emoji": "🟡", "color": "#3d3319", "textColor": "#fbbf24"},
  {"label": "Tool Feedback", "emoji": "🔴 → 💚", "color": "#1a3a2e", "textColor": "#34d399"},
  {"label": "RAG Retrieved Context", "emoji": "🔵 → 💚", "color": "#1a3a2e", "textColor": "#34d399"},
  {"label": "User Artifacts", "emoji": "🔴 → 💚", "color": "#1a3a2e", "textColor": "#34d399"},
  {"label": "Chat History", "emoji": "🟣 → 💚", "color": "#1a3a2e", "textColor": "#34d399"},
  {"label": "Intent", "emoji": "🟡", "color": "#3d3319", "textColor": "#fbbf24"}
]}' data-chart-options='{"height": 360, "captionText": "The arrows (→ 💚) indicate components that dynamically enrich the Context"}'></div>

All of the elements above are orchestrated and delivered through the core discipline of Context Engineering introduced earlier.

Let's dive into each component and see how they work together. No fluff, just practical implementation.

⚠️ **Important**: The code examples below are simplified pseudo-code to illustrate concepts. They demonstrate the architecture and flow, not production-ready implementations. Always refer to official documentation for actual usage.

### 1. User Intent & Prompting — the starting point 🟡

This is where everything begins. But modern prompting goes beyond simple text input:

```python
# Traditional approach - limited
response = llm.generate("What's our Q4 revenue?")

# Context-engineered approach
class ContextualPrompt:
    def __init__(self, intent, user_info):
        self.intent = intent
        self.user_info = user_info

    def enhance(self):
        # Add temporal context
        prompt = f"Current date: {datetime.now()}\n"
        # Add user context
        prompt += f"User role: {self.user_info.role}\n"
        # Append actual user intent
        prompt += f"\nUser question: {self.intent}"
        return prompt
```

Let's break this down:

- **Temporal Context**: Adding timestamps helps the LLM understand time-sensitive queries ("last quarter" vs "this month")
- **User Context**: Role-based information enables personalized responses — a data analyst gets SQL queries, while executives get summaries

The prompt evolves based on available context, not just static templates. This approach transforms a simple question into a context-rich query that leads to more accurate, relevant responses.

**Popular tools (verified August 2025):**
- [LangChain](https://python.langchain.com/docs/concepts/prompt_templates/) — Industry-leading framework with 90k+ GitHub stars, powers production systems at major enterprises
- [LMQL](https://lmql.ai/docs/) — Query language for LLMs with constraint guarantees, actively maintained with Apache 2.0 license
- [Guidance](https://github.com/guidance-ai/guidance) — Tool for structured generation, 20k+ stars, proven acceleration for local models
- [LangSmith](https://docs.smith.langchain.com/) — Paid-tool of Production monitoring for prompt versioning and evaluation

### 2. Agents & Reasoning — the decision makers 🔴

Agents don't just respond — they reason, plan, and act. Here's a practical example using [LangGraph](https://langchain-ai.github.io/langgraph/concepts/why-langgraph/):

```python
from langgraph.graph import Graph, Node
from langchain.agents import Tool

# Define agent decision flow
class ContextAgent:
    def __init__(self, tools):
        self.tools = tools

    def decide_action(self, query):
        # Analyze query intent
        if "calculate" in query.lower():
            return self.tools['calculator']
        elif "search" in query.lower():
            return self.tools['web_search']
        elif "database" in query.lower():
            return self.tools['sql_executor']
        else:
            return self.tools['rag_search']

    def execute(self, query):
        tool = self.decide_action(query)
        # Execute with reasoning loop
        result = tool.run(query)

        # Self-check: Is this answer complete?
        if self.needs_more_context(result):
            additional = self.tools['rag_search'].run(query)
            result = self.combine_results(result, additional)

        return result
```

Here's what makes this agent intelligent:

- **Intent Analysis**: The agent doesn't just pattern match — it understands what the user is trying to achieve
- **Keyword-based Tool Selection**: Based on the query type, it automatically routes to the right tool (calculator for math, SQL for database queries)
- **Self-Reflection**: The `needs_more_context` check ensures completeness — if the first answer isn't sufficient, it augments with additional searches

Multiple tool outputs are intelligently merged, not just concatenated. This creates a reasoning loop that mimics how a human expert would approach the problem — assess, act, verify, and enhance if needed.

Nowadays, we have lots of reasoning LLM models like OpenAI's o3, Anthropic's Claude 4 Sonnet, and Google's Gemini 2.5 that excel at multi-step reasoning — but even these advanced models benefit from structured agent frameworks to handle complex, real-world tasks reliably.

**Popular frameworks (verified August 2025):**
- [LangGraph](https://langchain-ai.github.io/langgraph/) — LangChain's graph-based agent framework, excels at complex state management with visual debugging via LangSmith
- [CrewAI](https://docs.crewai.com/) — 700+ integrations, easiest to learn, used by companies building role-based agent teams
- [AutoGen](https://microsoft.github.io/autogen/) — Microsoft Research framework with 30k+ stars, best for conversational multi-agent systems
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) — Latest addition with native MCP support, rapidly growing adoption in production

### 3. RAG — the knowledge base 🔵

When your LLM needs to know about YOUR data, RAG is the answer. Here's a pseudo example with Milvus:

```python
from pymilvus import Collection, connections
import openai

class RAGPipeline:
    def __init__(self, collection_name="company_docs"):
        # Connect to Milvus
        connections.connect(host='localhost', port='19530')
        self.collection = Collection(collection_name)

    def search_context(self, query, top_k=5):
        # Convert query to embedding
        query_embedding = openai.Embedding.create(
            input=query,
            model="text-embedding-3-small"
        )['data'][0]['embedding']

        # Search in vector database
        search_params = {"metric_type": "IP", "params": {"nprobe": 10}}
        results = self.collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["content", "metadata"]
        )

        # Format context for LLM
        context = "\n---\n".join([
            f"Source: {hit.entity.get('metadata')}\n{hit.entity.get('content')}"
            for hit in results[0]
        ])

        return context

    def generate_answer(self, query, context):
        prompt = f"""Based on the following context, answer the question.

Context:
{context}

Question: {query}

Answer:"""

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content
```

The magic happens in three steps:

- **Embedding Generation**: Your query becomes a mathematical representation that captures semantic meaning
- **Similarity Search**: The vector database finds documents with similar meaning, not just keyword matches
- **Context Formatting**: Retrieved chunks are structured to give the LLM maximum context without overwhelming it

Unlike traditional search, RAG understands that "Q4 revenue" and "fourth quarter earnings" mean the same thing. It's semantic search meets intelligent retrieval.

Additionally, **Graph-based RAG** comes into the picture when **Relationships Matter**. Traditional RAG treats documents as isolated chunks. Graph RAG understands connections and perfectly support multi-hop reasoning questions, see [LightRAG](https://github.com/HKUDS/LightRAG) or [RAG Anything](https://github.com/HKUDS/RAG-Anything) for more details and sample codes. Besides, [LangChain Graph Transformers](https://python.langchain.com/docs/tutorials/graph/), [Microsoft GraphRAG](https://github.com/microsoft/graphrag) and [Neo4j GraphRAG](https://github.com/neo4j/neo4j-graphrag-python) are similar frameworks to implement the Knowledge Graph and Traversal Queries.

**Popular vector databases (claims backed in August 2025):**
- [Milvus](https://milvus.io/docs) — 25k+ stars, fastest indexing speed, GPU acceleration, managed via Zilliz Cloud
- [Qdrant](https://qdrant.tech/documentation/) — Rust-based, achieves highest RPS in benchmarks, 9k+ GitHub stars, complex filtering capabilities
- [Pinecone](https://docs.pinecone.io/) — Fully managed SaaS, handles billions of vectors in production, trusted by Fortune 500
- [ChromaDB](https://docs.trychroma.com/) — 6k+ stars, developer favorite for RAG prototypes, simple API

**Graph databases for Graph RAG (claims backed in August 2025):**
- [Neo4j](https://neo4j.com/docs/) — Market leader with 15+ years maturity, specialized graph algorithms
- [Amazon Neptune](https://docs.aws.amazon.com/neptune/) — Fully managed, scales to billions of relationships

### 4. Action Tools — getting things done 🔴

LLMs can't just talk — they need to act. Here's how to give them superpowers using the Model Context Protocol (MCP):

```python
from mcp import MCPClient

class FileSystemMCP:
    def __init__(self):
        self.client = MCPClient()
        self.fs_server = None
        
    async def connect(self):
        """Connect to filesystem MCP server with safety constraints"""
        self.fs_server = await self.client.connect_to_server(
            "mcp-filesystem",
            allowed_directories=["/project", "/data"]  # Sandboxed access
        )
        
    async def discover_tools(self):
        """See what file operations are available"""
        tools = await self.fs_server.list_tools()
        for tool in tools:
            print(f"Tool: {tool.name}")
            print(f"  Description: {tool.description}")
            print(f"  Parameters: {tool.input_schema}")
        
    async def use_filesystem(self, user_query):
        """Example: LLM using filesystem tools based on user intent"""
        if "read" in user_query:
            # MCP validates path is within allowed directories
            content = await self.fs_server.call_tool(
                "read_file",
                {"path": "/project/README.md"}
            )
            return content
            
        elif "analyze project structure" in user_query:
            # Chain multiple tool calls
            files = await self.fs_server.call_tool(
                "list_directory", 
                {"path": "/project", "recursive": True}
            )
            
            # Read key files for context
            important_files = ["README.md", "package.json", "requirements.txt"]
            file_contents = {}
            
            for filename in important_files:
                if filename in files:
                    content = await self.fs_server.call_tool(
                        "read_file",
                        {"path": f"/project/{filename}"}
                    )
                    file_contents[filename] = content
                    
            return {
                "structure": files,
                "key_files": file_contents
            }

# Simple usage
fs_mcp = FileSystemMCP()
await fs_mcp.connect()

# LLM can now safely read/write files within sandboxed directories
result = await fs_mcp.use_filesystem("analyze project structure")
```

What's happening here? The `FileSystemMCP` class demonstrates how MCP transforms your LLM from a text generator into an orchestration engine. This is just one example — MCP can connect to databases, APIs, cloud services, and more. Your LLM becomes an intelligent orchestrator that can interact with your entire tech stack.

**Popular MCP servers and tools (ecosystem status August 2025):**
- [MCP Protocol](https://www.anthropic.com/news/model-context-protocol) — Universal standard by Anthropic, OpenAI joined steering committee
- [MCP Server](https://github.com/modelcontextprotocol/servers) — Available MCP servers
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) — Native OpenAI integration, works alongside MCP

### 5. Memory Systems — Short-term vs Long-term 🟣

Memory makes the difference between a chatbot and an intelligent assistant:

```python
class MemoryManager:
    def __init__(self, redis_client, vector_store):
        self.short_term = redis_client  # Fast, temporary
        self.long_term = vector_store   # Persistent, searchable

    def store_interaction(self, session_id, message, response):
        # Short-term: Current conversation
        self.short_term.lpush(
            f"session:{session_id}",
            json.dumps({
                "timestamp": datetime.now().isoformat(),
                "message": message,
                "response": response
            })
        )
        self.short_term.expire(f"session:{session_id}", 3600)  # 1 hour

        # Long-term: Important patterns
        if self.is_important(message, response):
            embedding = self.create_embedding(f"{message} {response}")
            self.long_term.add_documents(
                texts=[f"Q: {message}\nA: {response}"],
                embeddings=[embedding],
                metadatas=[{"session": session_id, "type": "qa_pair"}]
            )

    def recall_context(self, query, session_id):
        # Get recent conversation
        recent = self.short_term.lrange(f"session:{session_id}", 0, 5)

        # Search similar past interactions
        similar = self.long_term.similarity_search(query, k=3)

        return {
            "recent": [json.loads(r) for r in recent],
            "similar": similar
        }
```

This dual-memory approach mirrors human cognition:

- **Short-term Memory (Redis)**: Like working memory, it holds the current conversation context. Fast access, automatic expiration
- **Long-term Memory (Vector Store)**: Persistent knowledge that grows over time. Important patterns and learnings are embedded and searchable
- **Importance Detection**: Not everything needs long-term storage — the system learns what's worth remembering
- **Contextual Recall**: Combines recent interactions with similar past experiences for richer context

The result? Your LLM remembers that the user prefers visualizations in dark mode, always wants SQL queries explained, and tends to ask about revenue metrics on Mondays.

**Popular solutions (production deployments August 2025):**
- [Redis](https://redis.io/docs/latest/develop/get-started/) — Sub-millisecond latency for session storage, battle-tested at scale
- [Milvus](https://milvus.io/docs)/[Pinecone](https://docs.pinecone.io/) — Leading vector stores for semantic long-term memory
- [LangGraph Persistence](https://langchain-ai.github.io/langgraph/concepts/persistence/) — Next gen of the [LangChain Memory](https://python.langchain.com/docs/how_to/chatbots_memory/)

## Putting It All Together — A Real Implementation

Here's how these components work in harmony with modern async patterns:

```python
import asyncio
from typing import Dict, Any

class ContextEngineeredAssistant:
    def __init__(self):
        self.rag = RAGPipeline()
        self.agent = ContextAgent()
        self.memory = MemoryManager()
        self.actions = ActionToolkit()
        self.mcp_client = MCPClient()

    async def process_query(self, user_input: str, session_id: str) -> Dict[str, Any]:
        # 1. Parallel context gathering for speed
        context_tasks = asyncio.gather(
            self.memory.recall_context(user_input, session_id),
            self.rag.search_context(user_input, top_k=3),
            self.mcp_client.get_available_tools()
        )
        memory_context, rag_context, available_tools = await context_tasks

        # 2. Build rich context
        full_context = {
            "user_input": user_input,
            "conversation_history": memory_context["recent"],
            "relevant_knowledge": rag_context,
            "similar_past_queries": memory_context["similar"],
            "available_actions": available_tools
        }

        # 3. Agent reasoning with context
        plan = await self.agent.create_execution_plan(full_context)
        
        # 4. Execute plan steps
        results = []
        for step in plan.steps:
            if step.type == "rag_search":
                result = await self._execute_rag_search(step, full_context)
            elif step.type == "mcp_action":
                result = await self._execute_mcp_action(step)
            elif step.type == "memory_update":
                result = await self._update_memory(step, session_id)
            
            results.append(result)
            # Update context with intermediate results
            full_context[f"step_{step.id}_result"] = result

        # 5. Generate final response
        final_response = await self._synthesize_response(results, full_context)
        
        # 6. Async memory storage (non-blocking)
        asyncio.create_task(
            self.memory.store_interaction(session_id, user_input, final_response)
        )

        return {
            "response": final_response,
            "execution_plan": plan.to_dict(),
            "context_used": self._summarize_context(full_context)
        }

    async def _execute_mcp_action(self, step):
        """Execute MCP tools with proper error handling"""
        try:
            tool = await self.mcp_client.get_tool(step.tool_name)
            result = await tool.execute(step.parameters)
            return {"success": True, "data": result}
        except Exception as e:
            # Graceful degradation
            fallback = await self._get_fallback_response(step)
            return {"success": False, "error": str(e), "fallback": fallback}
```

## Ready to Engineer Some Context?

Context Engineering isn't just another buzzword — it's how we make LLMs actually useful in the real world. The tools are here, the patterns are proven, and the only limit is your imagination.

Start small:

- Add RAG to your existing LLM app
- Implement basic conversation memory
- Connect one external tool
- Watch your users' wow 🚀

**Bonus**, [this article](https://blog.langchain.com/context-engineering-for-agents/) inpires me a lot on how we frame the parts of Context Engineering.

*Remember: The best context is the one your users never notice — it just works.*