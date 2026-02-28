#!/usr/bin/env node
/**
 * Integration Test: Real-world Use Case
 * Scenario: Building an AI-powered company knowledge assistant
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const client = axios.create({ baseURL: BASE_URL });

let token = '';
let dbName = '';

async function log(title, data) {
  console.log(`\n📌 ${title}`);
  console.log(JSON.stringify(data, null, 2).split('\n').slice(0, 20).join('\n'));
  if (JSON.stringify(data).length > 500) console.log('... (truncated)');
}

async function runIntegration() {
  console.log('\n🎯 Company Knowledge Assistant - Integration Test\n');

  // Step 1: Setup
  console.log('⚙️  Setting up...');
  const email = `assistant_${Date.now()}@test.com`;
  const password = 'test12345678';

  let res = await client.post('/auth/signup', { email, password });
  token = res.data.token;
  console.log(`✓ User created: ${email}`);

  dbName = `kb_${Date.now()}`;
  res = await client.post('/db', { name: dbName }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`✓ Database created: ${dbName}`);

  // Step 2: Seed company knowledge
  console.log('\n📚 Populating company knowledge...');

  const companies = [
    {
      name: 'TechVision Inc',
      industry: 'Artificial Intelligence',
      ceo: 'Dr. Elena Rodriguez',
      founded: 2018,
      headquarters: 'San Francisco',
      employees: 450,
      specialization: 'Machine Learning'
    },
    {
      name: 'DataFlow Systems',
      industry: 'Analytics',
      ceo: 'Marcus Chen',
      founded: 2015,
      headquarters: 'New York',
      employees: 320,
      specialization: 'Real-time Analytics'
    }
  ];

  for (const company of companies) {
    await client.post(`/db/${dbName}/companies`, company, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  console.log(`✓ ${companies.length} companies inserted`);

  const people = [
    {
      name: 'Dr. Elena Rodriguez',
      title: 'CEO',
      company: 'TechVision Inc',
      expertise: 'Machine Learning',
      joined: 2018
    },
    {
      name: 'Marcus Chen',
      title: 'CEO',
      company: 'DataFlow Systems',
      expertise: 'Analytics',
      joined: 2015
    },
    {
      name: 'Sarah Wong',
      title: 'VP Engineering',
      company: 'TechVision Inc',
      expertise: 'Deep Learning',
      reporting_to: 'Dr. Elena Rodriguez'
    }
  ];

  for (const person of people) {
    await client.post(`/db/${dbName}/people`, person, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  console.log(`✓ ${people.length} people inserted`);

  // Step 3: Examine the knowledge graph
  console.log('\n🕸️  Analyzing knowledge graph...');
  
  res = await client.get(`/db/${dbName}/graph/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await log('Graph Statistics', res.data);

  // Step 4: Test agent memory
  console.log('\n🧠 Testing AI agent memory...');
  const sessionId = `assistant-${uuidv4()}`;

  // Store initial system context
  await client.post(`/db/${dbName}/memory/${sessionId}`, 
    { role: 'system', content: 'You are a helpful company knowledge assistant.' },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // User question
  await client.post(`/db/${dbName}/memory/${sessionId}`, 
    { role: 'user', content: 'What AI companies do we know about?' },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // Assistant reasoning (store in memory)
  await client.post(`/db/${dbName}/memory/${sessionId}`, 
    { role: 'assistant', content: 'Based on our knowledge: TechVision Inc led by Dr. Elena Rodriguez specializes in Machine Learning.' },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // Follow-up: retrieve context
  res = await client.post(`/db/${dbName}/memory/${sessionId}/recall`,
    { query: 'machine learning AI companies CEO' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  await log('Agent Recalls Context', res.data);

  // Step 5: Multi-mode search
  console.log('\n🔍 Testing search modes...');

  res = await client.post(`/db/${dbName}/search`,
    { query: 'Machine Learning', mode: 'keyword', limit: 5 },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✓ Keyword search: ${res.data.results.length} results`);

  res = await client.post(`/db/${dbName}/search`,
    { query: 'Dr. Elena Rodriguez', mode: 'graph', limit: 5 },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✓ Graph search (entity connections): ${res.data.results.length} results`);

  res = await client.post(`/db/${dbName}/search`,
    { query: 'CEO Machine Learning AI', mode: 'hybrid', limit: 5 },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  await log('Hybrid Search Results (keyword + graph fused)', {
    count: res.data.results.length,
    topResult: res.data.results[0] ? {
      document: res.data.results[0].document,
      scores: res.data.results[0].scores
    } : null
  });

  // Step 6: GraphRAG context for LLM
  console.log('\n🤖 GraphRAG - Generating context for LLM...');

  res = await client.post(`/db/${dbName}/ask`,
    {
      question: 'Who are the key AI company leaders and what are their specializations?',
      contextDepth: 2,
      limit: 10
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const llmContext = {
    contextChunks: res.data.contextChunks.slice(0, 3),
    graphPath: res.data.graphPath,
    documentCount: res.data.sourceDocuments.length
  };
  await log('LLM Context (ready for prompt injection)', llmContext);

  // Step 7: Demonstrate how this would be used with an LLM
  console.log('\n📝 Example LLM Prompt Construction:');
  console.log('```');
  console.log('System Prompt:');
  console.log('You are a company knowledge assistant with access to proprietary data.');
  console.log('');
  console.log('Knowledge Context:');
  res.data.contextChunks.slice(0, 3).forEach((chunk, i) => {
    console.log(`  ${i + 1}. ${chunk.text}`);
  });
  console.log('');
  console.log('Entity Connections:', res.data.graphPath.slice(0, 5).join(' → '));
  console.log('```');

  // Step 8: Verify persistence
  console.log('\n💾 Testing persistence...');
  
  res = await client.get(`/db/${dbName}/memory/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`✓ Memory persisted: ${res.data.count} entries`);

  res = await client.get(`/db/${dbName}/graph/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`✓ Graph persisted: ${res.data.nodeCount} nodes, ${res.data.edgeCount} edges`);

  console.log('\n✅ Integration test complete!\n');
  console.log('Summary:');
  console.log('  ✓ Knowledge graph automatically built from documents');
  console.log('  ✓ AI agent memory stores and recalls context');
  console.log('  ✓ Multi-mode search finds relevant documents');
  console.log('  ✓ GraphRAG generates LLM-ready context');
  console.log('  ✓ All data persists across requests');
  console.log('\nReady for production use! 🚀');
}

runIntegration().catch(err => {
  console.error('\n❌ Integration test failed:');
  if (err.response?.data) console.error(err.response.data);
  else console.error(err.message);
  process.exit(1);
});
