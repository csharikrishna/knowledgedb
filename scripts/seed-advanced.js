#!/usr/bin/env node
/**
 * Advanced seed script testing Knowledge Graph, Memory, Hybrid Search & GraphRAG features
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const client = axios.create({ baseURL: BASE_URL });

let testUserId = '';
let jwtToken = '';

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    if (err.response?.data) console.error('  Error:', err.response.data);
    else console.error('  Error:', err.message);
    process.exit(1);
  }
}

async function runSuite() {
  console.log('\n🧪 Advanced KnowledgeDB Test Suite\n');

  // Step 1: Authentication
  console.log('📋 1. Authentication');
  
  const email = `testuser_${Date.now()}@test.com`;
  const password = 'test12345678';

  await test('Signup new user', async () => {
    const res = await client.post('/auth/signup', { email, password });
    jwtToken = res.data.token;
    testUserId = res.data.userId;
    if (!jwtToken || !testUserId) throw new Error('Missing token or userId');
  });

  // Step 2: Create database
  console.log('\n🗂️  2. Database');

  const dbName = `testdb_${Date.now()}`;
  
  await test('Create database', async () => {
    const res = await client.post(
      '/db',
      { name: dbName },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.apiEndpoint) throw new Error('Missing apiEndpoint');
  });

  // Step 3: Insert documents with rich entity data
  console.log('\n📚 3. Document Insertion (Graph Auto-Extraction)');

  await test('Insert Alice Johnson', async () => {
    const res = await client.post(
      `/db/${dbName}/employees`,
      {
        name: 'Alice Johnson',
        title: 'Senior Engineer',
        company: 'TechCorp',
        email: 'alice@techcorp.com',
        team: 'Backend',
        manager: 'Bob Smith'
      },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  await test('Insert Bob Smith', async () => {
    const res = await client.post(
      `/db/${dbName}/employees`,
      {
        name: 'Bob Smith',
        title: 'Tech Lead',
        company: 'TechCorp',
        email: 'bob@techcorp.com',
        team: 'Backend',
        project: 'Platform Core'
      },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  await test('Insert Carol Davis', async () => {
    const res = await client.post(
      `/db/${dbName}/employees`,
      {
        name: 'Carol Davis',
        title: 'Product Manager',
        company: 'TechCorp',
        email: 'carol@techcorp.com',
        team: 'Product',
        project: 'Platform Core'
      },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  await test('Insert Platform Core project', async () => {
    const res = await client.post(
      `/db/${dbName}/projects`,
      {
        name: 'Platform Core',
        category: 'Infrastructure',
        tags: ['backend', 'database', 'kubernetes'],
        status: 'active',
        owner: 'Bob Smith'
      },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  await test('Insert Frontend UI project', async () => {
    const res = await client.post(
      `/db/${dbName}/projects`,
      {
        name: 'Frontend UI',
        category: 'Frontend',
        tags: ['react', 'typescript', 'responsive'],
        status: 'active',
        owner: 'Carol Davis'
      },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  // Step 4: Check Knowledge Graph
  console.log('\n🕸️  4. Knowledge Graph');

  await test('Get graph statistics', async () => {
    const res = await client.get(
      `/db/${dbName}/graph/stats`,
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.nodeCount || res.data.nodeCount === 0) {
      throw new Error(`Expected nodes > 0, got ${res.data.nodeCount}`);
    }
    console.log(`   Found ${res.data.nodeCount} nodes and ${res.data.edgeCount} edges`);
  });

  await test('Search graph nodes', async () => {
    const res = await client.get(
      `/db/${dbName}/graph/search?q=TechCorp`,
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.nodes || res.data.nodes.length === 0) {
      throw new Error('Expected to find TechCorp node');
    }
  });

  await test('Traverse from entity', async () => {
    const res = await client.post(
      `/db/${dbName}/graph/traverse`,
      { startNode: 'TechCorp', depth: 2 },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.subgraph || res.data.subgraph.nodes.length === 0) {
      throw new Error('Expected to traverse connected entities');
    }
  });

  // Step 5: AI Memory
  console.log('\n🧠 5. AI Agent Memory');

  const sessionId = `session_${uuidv4()}`;

  await test('Store memory: User greeting', async () => {
    const res = await client.post(
      `/db/${dbName}/memory/${sessionId}`,
      { role: 'user', content: 'Who is working on the Platform Core project?' },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  await test('Store memory: Assistant response', async () => {
    const res = await client.post(
      `/db/${dbName}/memory/${sessionId}`,
      { role: 'assistant', content: 'Bob Smith is the tech lead. Carol Davis is the product manager.' },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  await test('Recall session memories', async () => {
    const res = await client.get(
      `/db/${dbName}/memory/${sessionId}`,
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.messages || res.data.messages.length < 2) {
      throw new Error('Expected to have at least 2 memory messages');
    }
  });

  await test('Recall with query', async () => {
    const res = await client.post(
      `/db/${dbName}/memory/${sessionId}/recall`,
      { query: 'Platform Core' },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.memories || res.data.memories.length === 0) {
      throw new Error('Expected to find relevant memories');
    }
  });

  // Step 6: Hybrid Search
  console.log('\n🔍 6. Hybrid Search (Keyword + Graph)');

  await test('Keyword search', async () => {
    const res = await client.post(
      `/db/${dbName}/search`,
      { query: 'Backend', mode: 'keyword', limit: 5 },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.results || res.data.results.length === 0) {
      throw new Error('Expected keyword search results');
    }
  });

  await test('Graph-based search', async () => {
    const res = await client.post(
      `/db/${dbName}/search`,
      { query: 'TechCorp', mode: 'graph', limit: 5 },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.results || res.data.results.length === 0) {
      throw new Error('Expected graph search results');
    }
  });

  await test('Hybrid search', async () => {
    const res = await client.post(
      `/db/${dbName}/search`,
      { query: 'Platform Core Backend', mode: 'hybrid', limit: 5 },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.results || res.data.results.length === 0) {
      throw new Error('Expected hybrid search results');
    }
    // Verify it has both keyword and graph scores
    const result = res.data.results[0];
    if (result.scores.keyword === undefined || result.scores.graph === undefined || result.scores.hybrid === undefined) {
      throw new Error('Expected keyword, graph, and hybrid scores');
    }
  });

  // Step 7: GraphRAG /ask endpoint
  console.log('\n🤖 7. GraphRAG Context Engine (/ask)');

  await test('Ask question with GraphRAG context', async () => {
    const res = await client.post(
      `/db/${dbName}/ask`,
      { question: 'Who is leading the Platform Core project and what team are they in?', contextDepth: 2, limit: 5 },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.contextChunks || res.data.contextChunks.length === 0) {
      throw new Error('Expected contextChunks');
    }
    if (!res.data.graphPath) throw new Error('Expected graphPath');
    if (!res.data.sourceDocuments) throw new Error('Expected sourceDocuments');
    console.log(`   Generated ${res.data.contextChunks.length} context chunks`);
  });

  // Step 8: Advanced features
  console.log('\n⚙️  8. Advanced Features');

  await test('Find shortest path between entities', async () => {
    const res = await client.post(
      `/db/${dbName}/graph/path`,
      { from: 'Alice Johnson', to: 'Platform Core' },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.path) throw new Error('Expected path');
    if (res.data.found) {
      console.log(`   Path found: ${res.data.path.join(' -> ')}`);
    }
  });

  await test('Create manual knowledge link', async () => {
    const res = await client.post(
      `/db/${dbName}/graph/link`,
      { 
        fromLabel: 'TechCorp',
        toLabel: 'Platform Core',
        relation: 'owns_project'
      },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.edgeId) throw new Error('Expected edgeId');
  });

  await test('Forget session', async () => {
    const res = await client.delete(
      `/db/${dbName}/memory/${sessionId}`,
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (!res.data.deletedCount) throw new Error('Expected deletedCount');
  });

  console.log('\n✅ All tests passed!\n');
  console.log('Summary:');
  console.log(`  Database: ${testUserId}/${dbName}`);
  console.log(`  Access token: ${jwtToken.substring(0, 20)}...`);
  console.log('  Features tested: Graph extraction, Memory, Hybrid Search, GraphRAG');
}

runSuite().catch(err => {
  console.error('\n❌ Test suite failed:', err.message);
  process.exit(1);
});
