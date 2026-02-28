# KnowledgeDB Quick Start - Advanced Features

## Five Minute Tutorial

### 1. Create a Database
```bash
curl -X POST http://localhost:5000/db \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my_app_knowledge"}'
```

Response:
```json
{
  "apiEndpoint": "http://localhost:5000/db/user123/my_app_knowledge",
  "apiKey": "kdb_xxx...",
  "warning": "Save api key now"
}
```

### 2. Insert Documents (Graph Builds Automatically!)
```bash
curl -X POST http://localhost:5000/db/my_app_knowledge/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp",
    "industry": "Software", 
    "ceo": "Sarah Johnson",
    "founded": 2015,
    "employees": 250
  }'
```

Behind the scenes:
- ✅ Document inserted into `companies` collection
- ✅ 4 nodes automatically extracted: TechCorp, Software, Sarah Johnson, 2015
- ✅ Edges created between all pairs
- ✅ Graph updated in milliseconds

### 3. Check What Was Learned
```bash
curl -X GET "http://localhost:5000/db/my_app_knowledge/graph/stats" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

Response:
```json
{
  "nodeCount": 4,
  "edgeCount": 6,
  "density": 1.0,
  "topConnected": [
    { "nodeId": "node_123", "label": "TechCorp", "connections": 3 }
  ]
}
```

### 4. AI Agent Remembers Conversation
```bash
# Agent stores a fact
curl -X POST "http://localhost:5000/db/my_app_knowledge/memory/agent-session-1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"system","content":"User is interested in enterprise software companies"}'

# Agent stores user question
curl -X POST "http://localhost:5000/db/my_app_knowledge/memory/agent-session-1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"user","content":"Tell me about TechCorp"}'

# Agent recalls relevant context
curl -X POST "http://localhost:5000/db/my_app_knowledge/memory/agent-session-1/recall" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"TechCorp enterprise software"}'
```

Response:
```json
{
  "memories": [
    {
      "memoryId": "mem_abc",
      "content": "Tell me about TechCorp",
      "type": "conversation",
      "relevance": 0.98,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 5. Search: Three Ways

**Keyword Search** (traditional database search):
```bash
curl -X POST "http://localhost:5000/db/my_app_knowledge/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"enterprise software","mode":"keyword"}'
```

**Graph Search** (find related entities):
```bash
curl -X POST "http://localhost:5000/db/my_app_knowledge/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"TechCorp","mode":"graph"}'
```

**Hybrid Search** (best of both):
```bash
curl -X POST "http://localhost:5000/db/my_app_knowledge/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"TechCorp enterprise software","mode":"hybrid"}'
```

Response:
```json
{
  "results": [
    {
      "document": {
        "_id": "doc_456",
        "name": "TechCorp",
        "industry": "Software"
      },
      "collection": "companies",
      "scores": {
        "keyword": 0.92,
        "graph": 0.87,
        "hybrid": 0.89
      }
    }
  ],
  "total": 1
}
```

### 6. Generate LLM Context (GraphRAG)
```bash
curl -X POST "http://localhost:5000/db/my_app_knowledge/ask" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"Who founded TechCorp and when?","contextDepth":2,"limit":5}'
```

Response:
```json
{
  "contextChunks": [
    {
      "text": "name: TechCorp, industry: Software, ceo: Sarah Johnson, founded: 2015",
      "relevance": 0.98,
      "sourceDocId": "doc_456"
    },
    {
      "text": "TechCorp (companies) → name_matches_name → TechCorp (companies)",
      "relevance": 0.95
    }
  ],
  "graphPath": ["TechCorp", "Sarah Johnson", "Software", "2015"],
  "sourceDocuments": [...],
  "usage": "Paste contextChunks as system prompt context for your LLM"
}
```

Use in your LLM:
```python
system_prompt = f"""You are a helpful assistant with access to company knowledge.

Context:
{''.join([c['text'] for c in context['contextChunks']])}

Answer the user's question based on this context."""

response = openai.ChatCompletion.create(
    model="gpt-4",
    system_prompt=system_prompt,
    messages=[{"role": "user", "content": "Who founded TechCorp?"}]
)
```

---

## Common Patterns

### Pattern 1: Build a Company Directory Knowledge Graph
```javascript
const companies = [
  { name: "TechCorp", ceo: "Sarah Johnson", industry: "Software", employees: 250 },
  { name: "DataCorp", ceo: "John Smith", industry: "Analytics", employees: 150 },
  { name: "CloudSys", ceo: "Sarah Johnson", industry: "Cloud", employees: 300 }
];

for (const company of companies) {
  await fetch(`/db/mydb/companies`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(company)
  });
}

// Graph now shows: Sarah Johnson connects TechCorp and CloudSys
// Shared industry connections emerge automatically
```

### Pattern 2: Stateful Multi-Turn Chatbot
```javascript
const sessionId = "user-123-session-456";

// User: "What's our revenue?"
await fetch(`/db/mydb/memory/${sessionId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ role: 'user', content: 'What\\'s our revenue?' })
});

// Agent recalls context
const memories = await fetch(`/db/mydb/memory/${sessionId}/recall`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ query: 'revenue financial results' })
});

// Agent remembers answer and conversation
await fetch(`/db/mydb/memory/${sessionId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ role: 'assistant', content: '2024 revenue is $50M' })
});

// Next message, agent automatically has context!
```

### Pattern 3: Semantic Search + LLM RAG
```javascript
// User asks a question
const response = await fetch(`/db/mydb/ask`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    question: 'What technologies does Sarah Johnson's companies use?',
    contextDepth: 3,
    limit: 10
  })
});

const { contextChunks, sourceDocuments } = await response.json();

// Build system prompt
const systemPrompt = `Context:\n${contextChunks.map(c => c.text).join('\n\n')}\n\nAnswer based on this context.`;

// Send to LLM for RAG
const answer = await openai.chat.completions.create({
  model: 'gpt-4',
  system: systemPrompt,
  messages: [{
    role: 'user',
    content: 'What technologies does Sarah Johnson\\'s companies use?'
  }]
});

// Optionally, cite sources
console.log('Sources:', sourceDocuments.map(d => d._id));
```

---

## Command Reference

| **Feature** | **Endpoint** | **Method** | **Body** |
|-----------|----------|--------|------|
| **Graph Stats** | `/db/:db/graph/stats` | GET | - |
| **Search Nodes** | `/db/:db/graph/search?q=term` | GET | - |
| **Traverse Graph** | `/db/:db/graph/traverse` | POST | `{startNode, depth}` |
| **Shortest Path** | `/db/:db/graph/path` | POST | `{from, to}` |
| **Store Memory** | `/db/:db/memory/:session` | POST | `{role, content}` |
| **Recall Memory** | `/db/:db/memory/:session/recall` | POST | `{query, limit}` |
| **Get Session** | `/db/:db/memory/:session` | GET | - |
| **Forget Session** | `/db/:db/memory/:session` | DELETE | - |
| **Keyword Search** | `/db/:db/search` | POST | `{query, mode: "keyword"}` |
| **Graph Search** | `/db/:db/search` | POST | `{query, mode: "graph"}` |
| **Hybrid Search** | `/db/:db/search` | POST | `{query, mode: "hybrid"}` |
| **GraphRAG Ask** | `/db/:db/ask` | POST | `{question, contextDepth, limit}` |

---

## Troubleshooting

**Q: Why is the graph empty after inserting documents?**
A: Check that field names match entity hints (name, title, company, email, team, project, owner, etc.). Add more fields to trigger extraction.

**Q: Memory recall returns no results?**
A: Make sure query tokens (>3 chars) appear in memory content. Try simpler queries. Check tokens: `"content".toLowerCase().split(/\W+/).filter(t => t.length > 3)`

**Q: Search returns results but with score 0?**
A: You might be in "graph" mode but entities aren't connected. Try "keyword" mode or add more documents to build relationships.

**Q: How do I clear a graph or memory?**
A: Delete and recreate the database:
```bash
curl -X POST http://localhost:5000/db/delete \
  -d '{"dbName":"old_db"}' \
  -H "Authorization: Bearer ..."
```

---

**For complete documentation, see [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)**
