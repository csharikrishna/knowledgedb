#!/usr/bin/env node

/**
 * Vector Embeddings Examples
 * Complete examples showing how to use the vector search and indexing APIs
 */

const API_BASE = 'http://localhost:5000';
const API_KEY = 'your-api-key';
const JWT_TOKEN = 'your-jwt-token';

// ============================================================================
// 1. SEMANTIC SEARCH EXAMPLE
// ============================================================================

async function semanticSearch() {
  console.log('\n=== SEMANTIC SEARCH ===');
  
  const response = await fetch(`${API_BASE}/db/mydb/vector/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'machine learning artificial intelligence',
      collections: ['articles', 'papers'],
      limit: 10
    })
  });

  const results = await response.json();
  console.log('Search Results:', JSON.stringify(results, null, 2));

  return results;
}

// ============================================================================
// 2. ENHANCED HYBRID SEARCH WITH CUSTOM WEIGHTS
// ============================================================================

async function enhancedHybridSearch() {
  console.log('\n=== ENHANCED HYBRID SEARCH ===');
  
  const response = await fetch(`${API_BASE}/db/mydb/hybrid/enhanced`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'neural networks deep learning',
      // Adjust weights based on your preferences
      weightKeyword: 0.25,  // Exact matches
      weightGraph: 0.25,    // Relationship-based
      weightVector: 0.50,   // Semantic similarity
      limit: 15,
      collections: ['papers']
    })
  });

  const results = await response.json();
  console.log('Hybrid Results:', JSON.stringify(results, null, 2));

  // Analyze the breakdown
  console.log('\nSearch Weight Breakdown:');
  console.log(`- Keyword:  ${results.breakdown.keyword}%`);
  console.log(`- Graph:    ${results.breakdown.graph}%`);  
  console.log(`- Vector:   ${results.breakdown.vector}%`);

  return results;
}

// ============================================================================
// 3. FIND SIMILAR DOCUMENTS
// ============================================================================

async function findSimilarDocuments() {
  console.log('\n=== FIND SIMILAR DOCUMENTS ===');
  
  const targetDocId = 'article-123'; // Replace with real doc ID
  
  const response = await fetch(`${API_BASE}/db/mydb/articles/similar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      docId: targetDocId,
      limit: 5
    })
  });

  const results = await response.json();
  console.log(`Similar to "${targetDocId}":`, JSON.stringify(results, null, 2));

  return results;
}

// ============================================================================
// 4. BUILD VECTOR INDEX
// ============================================================================

async function buildVectorIndex() {
  console.log('\n=== BUILD VECTOR INDEX ===');
  
  const response = await fetch(`${API_BASE}/db/mydb/articles/index/build`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();
  console.log('Index Build Result:', JSON.stringify(result, null, 2));

  return result;
}

// ============================================================================
// 5. GET INDEX STATISTICS
// ============================================================================

async function getIndexStats() {
  console.log('\n=== INDEX STATISTICS ===');
  
  const response = await fetch(`${API_BASE}/db/mydb/articles/index/stats`, {
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`
    }
  });

  const stats = await response.json();
  console.log('Index Stats:', JSON.stringify(stats, null, 2));

  // Interpret stats
  if (stats.indexes.vector) {
    console.log('\nVector Index Analysis:');
    console.log(`Documents indexed: ${stats.indexes.vector.stats.count}`);
    console.log(`Vocabulary size: ${stats.indexes.vector.stats.vocabularySize} terms`);
    console.log(`Avg magnitude: ${stats.indexes.vector.stats.avgMagnitude.toFixed(3)}`);
    console.log(`Avg tokens/doc: ${stats.indexes.vector.stats.avgTokensPerDoc.toFixed(0)}`);
  }

  return stats;
}

// ============================================================================
// 6. EXPORT EMBEDDINGS FOR ML/VISUALIZATION
// ============================================================================

async function exportEmbeddings() {
  console.log('\n=== EXPORT EMBEDDINGS ===');
  
  // Export as JSON
  let response = await fetch(
    `${API_BASE}/db/mydb/articles/embeddings/export?format=json`,
    {
      headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }
    }
  );
  
  const jsonEmbeddings = await response.json();
  console.log(`Exported ${jsonEmbeddings.documentCount} embeddings in JSON format`);
  console.log(`Vector dimension: ${jsonEmbeddings.vectorDimension}`);
  console.log(`First embedding:`, JSON.stringify(jsonEmbeddings.embeddings[0], null, 2));

  // Export as CSV
  response = await fetch(
    `${API_BASE}/db/mydb/articles/embeddings/export?format=csv`,
    {
      headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }
    }
  );
  
  const csvData = await response.text();
  console.log('\nCSV Export (first 3 lines):');
  console.log(csvData.split('\n').slice(0, 3).join('\n'));

  return jsonEmbeddings;
}

// ============================================================================
// 7. LLM CONTEXT RETRIEVAL (RAG PIPELINE)
// ============================================================================

async function retrieveForLLM() {
  console.log('\n=== RETRIEVE FOR LLM (RAG) ===');
  
  const userQuestion = 'What are the benefits of using vector embeddings in semantic search?';
  
  const response = await fetch(`${API_BASE}/db/mydb/retrieve-for-llm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: userQuestion,
      contextLimit: 10
    })
  });

  const ragResults = await response.json();
  console.log('RAG Retrieval Results:', JSON.stringify(ragResults, null, 2));

  console.log('\n--- LLM PROMPT CONTEXT (ready to use) ---');
  console.log(ragResults.llmPromptContext);

  return ragResults;
}

// ============================================================================
// 8. PYTHON EXAMPLE: Using with OpenAI API
// ============================================================================

const pythonRAGExample = `
import requests
import openai

API_BASE = 'http://localhost:5000'
JWT_TOKEN = 'your-jwt-token'
openai.api_key = 'your-openai-key'

def answer_question_with_rag(user_question):
    '''Answer a question using KnowledgeDB RAG + OpenAI GPT'''
    
    # Step 1: Retrieve context from KnowledgeDB
    response = requests.post(
        f'{API_BASE}/db/mydb/retrieve-for-llm',
        headers={'Authorization': f'Bearer {JWT_TOKEN}'},
        json={
            'query': user_question,
            'contextLimit': 10
        }
    )
    
    rag_result = response.json()
    llm_context = rag_result['llmPromptContext']
    
    # Step 2: Use context with OpenAI GPT
    messages = [
        {
            'role': 'system',
            'content': f'You are a helpful assistant. Use the following knowledge base to answer questions:\\n\\n{llm_context}'
        },
        {
            'role': 'user',
            'content': user_question
        }
    ]
    
    response = openai.ChatCompletion.create(
        model='gpt-4',
        messages=messages,
        temperature=0.7
    )
    
    answer = response.choices[0].message.content
    
    return {
        'question': user_question,
        'context_chunks': rag_result['chunkCount'],
        'answer': answer,
        'sources': [c['source'] for c in rag_result['contextChunks']]
    }

# Usage
result = answer_question_with_rag('How do vector embeddings work?')
print(f"Q: {result['question']}")
print(f"A: {result['answer']}")
print(f"Sources: {result['sources']}")
`;

// ============================================================================
// 9. CURL EXAMPLES
// ============================================================================

const curlExamples = `
# Semantic Vector Search
curl -X POST http://localhost:5000/db/mydb/vector/search \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "machine learning",
    "limit": 10
  }'

# Enhanced Hybrid Search
curl -X POST http://localhost:5000/db/mydb/hybrid/enhanced \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "AI neural networks",
    "weightVector": 0.5,
    "weightKeyword": 0.25,
    "weightGraph": 0.25,
    "limit": 20
  }'

# Find Similar Documents
curl -X POST http://localhost:5000/db/mydb/articles/similar \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"docId": "doc-123", "limit": 5}'

# Build Vector Index
curl -X POST http://localhost:5000/db/mydb/articles/index/build \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get Index Statistics
curl http://localhost:5000/db/mydb/articles/index/stats \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Export Embeddings
curl http://localhost:5000/db/mydb/articles/embeddings/export?format=json \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# LLM Context Retrieval (RAG)
curl -X POST http://localhost:5000/db/mydb/retrieve-for-llm \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What are the latest AI advances?",
    "contextLimit": 10
  }'

# Using API Key instead of JWT
curl -X POST http://localhost:5000/db/USER_ID/mydb/vector/search \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "semantic search", "limit": 10}'
`;

// ============================================================================
// 10. SEARCH WEIGHT TUNING GUIDE
// ============================================================================

const tuningGuide = `
HYBRID SEARCH WEIGHT TUNING GUIDE
===================================

Scenario: E-commerce Product Search
------------------------------------
Goal: Find products matching user intent with both exact specs and semantic similarity

Recommended weights:
{
  "weightKeyword": 0.40,  // Important for product specs (size, color, brand)
  "weightGraph": 0.10,    // Less important, but useful for related products
  "weightVector": 0.50    // High for semantic understanding (comfortable, durable, etc.)
}


Scenario: Legal Document Discovery
-----------------------------------
Goal: Find relevant case law and statutes with precise matching

Recommended weights:
{
  "weightKeyword": 0.60,  // Critical for legal citations and exact phrases
  "weightGraph": 0.20,    // Moderate for legal relationships
  "weightVector": 0.20    // Lower for semantic, maintain precision
}


Scenario: Educational Content Discovery
----------------------------------------
Goal: Find learning resources across different topics with fuzzy matching

Recommended weights:
{
  "weightKeyword": 0.25,  // Lower, allow flexibility
  "weightGraph": 0.35,    // High for learning paths and prerequisites
  "weightVector": 0.40    // High for conceptual understanding
}


Scenario: Medical Literature Search
-----------------------------------
Goal: Find relevant medical papers with semantic precision

Recommended weights:
{
  "weightKeyword": 0.30,  // Medical terminology important
  "weightGraph": 0.15,    // Disease/treatment relationships
  "weightVector": 0.55    // High for semantic medical concepts
}
`;

// ============================================================================
// RUN EXAMPLES
// ============================================================================

async function runAllExamples() {
  console.log('KnowledgeDB Vector Embeddings Examples');
  console.log('======================================');

  try {
    // Uncomment examples to run:
    // await semanticSearch();
    // await enhancedHybridSearch();
    // await findSimilarDocuments();
    // await buildVectorIndex();
    // await getIndexStats();
    // await exportEmbeddings();
    // await retrieveForLLM();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    semanticSearch,
    enhancedHybridSearch,
    findSimilarDocuments,
    buildVectorIndex,
    getIndexStats,
    exportEmbeddings,
    retrieveForLLM,
    pythonRAGExample,
    curlExamples,
    tuningGuide,
    runAllExamples
  };
}

// Run if executed directly
runAllExamples();
