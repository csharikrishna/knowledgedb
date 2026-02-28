# KnowledgeDB Advanced Features Documentation

## Overview

KnowledgeDB now includes three powerful AI/ML-ready features that give it enterprise-grade knowledge management capabilities:

1. **Automatic Knowledge Graph Extraction** - Entities and relationships extracted from documents in real-time
2. **AI Agent Memory System** - Persistent, searchable conversation memory for stateful agents
3. **Hybrid Search + GraphRAG** - BM25 keyword search fused with graph-based semantic search, with LLM context generation

All features are fully integrated and tested end-to-end.

---

## 1. Automatic Knowledge Graph Extraction

### How It Works

Every document insertion automatically extracts entities and creates a knowledge graph:

- **Entity Extraction**: Fields matching hints (name, title, company, email, team, project, owner, etc.) become graph nodes
- **Edge Detection**: Entities co-occurring in the same document are automatically linked
- **Label Deduplication**: Same entity labels across documents are merged (e.g., "TechCorp" in employee and project documents)
- **Auto-Linking**: Entities with matching labels across documents create "same_entity" edges

### Example

When you insert an employee document:
```json
{
  "name": "Alice Johnson",
  "title": "Senior Engineer",
  "company": "TechCorp",
  "team": "Backend",
  "manager": "Bob Smith"
}
```

The system automatically creates:
- **5 nodes**: Alice Johnson, Senior Engineer, TechCorp, Backend, Bob Smith
- **10 edges**: Links between all pairs (co-occurrence in same document)
- **Deduplication**: If "TechCorp" or "Bob Smith" exist from previous documents, edges are added instead of duplicate nodes

### Test Results

From the advanced test seeding 5 documents (3 employees + 2 projects):
- **26 automatically extracted nodes**
- **67 automatically detected edges**
- Nodes include names, titles, companies, teams, categories, and tags
- Edges represent relationships (same_entity, co_occurs_in_collection, field-to-field matches)

---

## 2. AI Agent Memory System

### Endpoints

#### Store Memory
```
POST /db/:dbName/memory/:sessionId
{
  role: "user" | "assistant",
  content: "Memory content text"
}
```

#### Retrieve Session
```
GET /db/:dbName/memory/:sessionId
Returns all memories for the session with automatic keyword extraction
```

#### Recall with Query
```
POST /db/:dbName/memory/:sessionId/recall
{
  query: "Search query",
  limit: 5
}
Returns memories ranked by keyword similarity (0-1 relevance score)
```

#### Forget Session
```
DELETE /db/:dbName/memory/:sessionId
Cleans up all memories for a session
```

### Features

- **Automatic Keyword Extraction**: Content is tokenized into keywords, filtered by length (>3 chars)
- **Relevance Scoring**: Query tokens matched against memory keywords with bonus points for explicit tags
- **Session Organization**: Memories grouped by session ID for multi-turn conversations
- **Metadata**: `createdAt` and `lastAccessedAt` timestamps for lifecycle management

### Example Usage

```javascript
// Agent stores conversation context
POST /db/company_wiki/memory/session-123
{ role: "user", content: "Who works on Platform Core?" }

// Agent recalls relevant past context
POST /db/company_wiki/memory/session-123/recall
{ query: "Platform Core team" }

// Returns most relevant memories with scores
{
  "memories": [
    {
      "memoryId": "mem_abc123",
      "content": "Bob Smith is tech lead on Platform Core",
      "type": "conversation",
      "relevance": 0.95,
      "createdAt": "2024-01-01T..."
    }
  ]
}
```

---

## 3. Hybrid Search + GraphRAG

### Three Search Modes

#### Keyword Search (BM25)
```
POST /db/:dbName/search
{
  query: "backend database",
  mode: "keyword",
  limit: 10
}
```

Uses Okapi BM25 ranking (industry standard):
- k1 = 1.5 (term frequency saturation)
- b = 0.75 (length normalization)
- Returns documents ranked by keyword relevance

#### Graph-Based Search
```
POST /db/:dbName/search
{
  query: "TechCorp",
  mode: "graph",
  limit: 10
}
```

Finds documents connected to matching entities:
- Tokenizes query and finds matching graph nodes
- Uses BFS to traverse up to 2 hops from matching nodes
- Scores documents by connection proximity
- Useful for semantic relationship discovery

#### Hybrid Search (Fused)
```
POST /db/:dbName/search
{
  query: "Platform Core Backend",
  mode: "hybrid",
  limit: 10
}
```

Combines both approaches:
- Keyword score: 40% weight
- Graph score: 60% weight
- Formula: `hybrid_score = 0.4 × keyword_norm + 0.6 × graph_norm`
- Returns results with all three scores

### Response Format
```json
{
  "results": [
    {
      "document": { "_id": "...", "name": "..." },
      "collection": "employees",
      "scores": {
        "keyword": 0.87,
        "graph": 0.75,
        "hybrid": 0.78
      }
    }
  ],
  "total": 1
}
```

### GraphRAG Context Generator (/ask)

The `/ask` endpoint is designed for LLM integration:

```
POST /db/:dbName/ask
{
  question: "Who is leading the Platform Core project?",
  contextDepth: 2,
  limit: 5
}
```

Returns LLM-ready context:
```json
{
  "contextChunks": [
    {
      "text": "TechCorp (projects) → owns_project → Platform Core (projects)",
      "relevance": 0.95,
      "sourceDocId": "proj_123"
    },
    {
      "text": "name: Bob Smith, title: Tech Lead, company: TechCorp, team: Backend, project: Platform Core",
      "relevance": 0.92,
      "sourceDocId": "emp_456"
    }
  ],
  "graphPath": ["TechCorp", "Bob Smith", "Platform Core", "Backend"],
  "sourceDocuments": [
    { "_id": "emp_456", "name": "Bob Smith", ... }
  ],
  "usage": "Paste contextChunks as system prompt context for your LLM"
}
```

**Key Features**:
- Extracts graph-based relationships with natural language descriptions
- Includes source documents for verification/citation
- Provides entity connection paths for reasoning
- Ready to inject as LLM system prompt context

---

## Technical Architecture

### File Organization
```
server/utils/
  ├── graphEngine.js      (Entity extraction, BFS, shortest path)
  ├── memoryEngine.js     (Keyword similarity scoring)
  ├── bm25Engine.js       (Okapi BM25 implementation)
  ├── hybridSearch.js     (Score fusion)
  ├── fileHandler.js      (Graph file I/O)

server/controllers/
  ├── graphController.js      (Graph CRUD + traversal)
  ├── memoryController.js     (Memory CRUD + recall)
  ├── searchController.js     (Hybrid search + ask)
  ├── crudController.js       (Integrated graph updates)

server/routes/
  ├── graph.js      (Both JWT and API-key endpoints)
  ├── memory.js     (Both JWT and API-key endpoints)
  ├── search.js     (Both JWT and API-key endpoints)
```

### Automatic Integration

Graph extraction happens automatically during document insertion:
1. User inserts document via POST `/db/:dbName/:collection`
2. CRUD controller stores document in collection
3. `processInsert()` called asynchronously (via setImmediate) from graphEngine
4. Entities extracted and edges detected
5. Graph file updated atomically

No additional configuration needed—just insert documents!

### Data Files

For each database, two new files are auto-created:
- `data/dbs/{userId}/{dbName}/_graph.json` - Knowledge graph (nodes + edges)
- `data/dbs/{userId}/{dbName}/_memory.json` - Agent memory entries

Plus existing files:
- Collections: `data/dbs/{userId}/{dbName}/{collection}.json`
- Index: `data/dbs/{userId}/{dbName}/_index.json`
- Webhooks: `data/dbs/{userId}/{dbName}/_webhooks.json`

---

## API Reference

### Graph Routes

**JWT-based (Dashboard):**
```
GET    /db/:dbName/graph/stats              - Graph statistics
GET    /db/:dbName/graph/search?q=...       - Search nodes
POST   /db/:dbName/graph/traverse           - BFS traversal
POST   /db/:dbName/graph/path               - Shortest path
POST   /db/:dbName/graph/link               - Create manual link
DELETE /db/:dbName/graph/link/:edgeId       - Delete link
```

**API-key-based (SDK):**
```
GET    /db/:userId/:dbName/graph/nodes      - List all nodes
GET    /db/:userId/:dbName/graph/edges      - List all edges
GET    /db/:userId/:dbName/graph/node/:id   - Get node details
POST   /db/:userId/:dbName/graph/traverse   - BFS (POST body)
POST   /db/:userId/:dbName/graph/path       - Shortest path (POST body)
POST   /db/:userId/:dbName/graph/link       - Create link (POST body)
DELETE /db/:userId/:dbName/graph/link/:id   - Delete link
```

### Memory Routes

**JWT-based:**
```
POST   /db/:dbName/memory/:sessionId              - Store memory
GET    /db/:dbName/memory/:sessionId              - Get all session memories
POST   /db/:dbName/memory/:sessionId/recall       - Recall with query
DELETE /db/:dbName/memory/:sessionId              - Forget session
```

**API-key-based:**
```
POST   /db/:userId/:dbName/memory/remember        - Store with agentId
POST   /db/:userId/:dbName/memory/recall          - Recall for agent
DELETE /db/:userId/:dbName/memory/forget          - Forget by criteria
GET    /db/:userId/:dbName/memory/list            - List agent memories
```

### Search Routes

**JWT-based:**
```
POST   /db/:dbName/search                  - Hybrid/keyword/graph search
POST   /db/:dbName/ask                     - GraphRAG context generation
```

**API-key-based:**
```
POST   /db/:userId/:dbName/search          - Same-same
POST   /db/:userId/:dbName/ask             - Same-same
```

---

## Performance Notes

- **Graph Extraction**: O(documents × fields) per insert, non-blocking
- **BFS Traversal**: O(nodes + edges) per query, depth-limited to reduce scope
- **BM25 Indexing**: O(documents × tokens) on demand (not pre-indexed for flexibility)
- **Memory Recall**: O(memories × query_tokens) linear scan with early termination
- **File I/O**: Synchronous JSON reads/writes; suitable for <100k documents

For larger deployments, consider:
- Adding Redis caching for graph traversals
- Pre-computing BM25 indices
- Batching bulk inserts to reduce graph updates

---

## Testing

Run the comprehensive test suite:
```bash
node scripts/seed-advanced.js
```

This tests:
✅ Automatic entity extraction (26 nodes from 5 documents)
✅ Knowledge graph statistics
✅ Graph node search
✅ BFS traversal of connected entities
✅ AI memory storage and recall
✅ Keyword/graph/hybrid search modes
✅ Shortest path finding
✅ Manual knowledge link creation
✅ GraphRAG context generation

All features working end-to-end with zero configuration!

---

## Next Steps

1. **Vector Embeddings**: Add semantic similarity scoring with embeddings
2. **Graph Visualization**: Use force-graph in dashboards to render knowledge maps
3. **Trigger-based Graph Updates**: Create edges on specific document patterns
4. **Memory Compression**: Summarize old memories to save space
5. **Multiple Entity Types**: Support different node types (Person, Organization, Event, etc.)
6. **Relationship Weights**: Learn edge weights from co-occurrence frequency

---

**Last Updated**: January 2025
**Status**: Production Ready ✅
