/**
 * KnowledgeDB Seed Script
 * Creates demo user, database, collections, and sample documents
 * 
 * Usage: node scripts/seed.js
 */

const http = require('http');

const BASE = 'http://localhost:5000';

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };
    const req = http.request(opts, (res) => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); }
        catch { resolve(chunks); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function seed() {
  console.log('🌱 Seeding KnowledgeDB...\n');

  // 1. Register demo user
  console.log('1. Creating demo user...');
  let res = await request('POST', '/auth/register', {
    email: 'demo@knowledgedb.io',
    password: 'demo12345678'
  });
  const token = res.token;
  if (!token) {
    // Try logging in if user already exists
    res = await request('POST', '/auth/login', {
      email: 'demo@knowledgedb.io',
      password: 'demo12345678'
    });
  }
  const userToken = res.token || token;
  console.log('   ✓ Demo user ready');

  // 2. Create database
  console.log('2. Creating "company_wiki" database...');
  await request('POST', '/db', { name: 'company_wiki' }, userToken);
  console.log('   ✓ Database created');

  // 3. Insert employees
  console.log('3. Inserting employee documents...');
  const employees = [
    { name: 'Alice Chen', title: 'CTO', department: 'Engineering', email: 'alice@acme.io', skills: ['architecture', 'rust', 'kubernetes'] },
    { name: 'Bob Martinez', title: 'Lead Engineer', department: 'Engineering', email: 'bob@acme.io', skills: ['react', 'typescript', 'graphql'], reportsTo: 'Alice Chen' },
    { name: 'Carol Williams', title: 'Data Scientist', department: 'Engineering', email: 'carol@acme.io', skills: ['python', 'ml', 'pytorch'], reportsTo: 'Alice Chen' },
    { name: 'David Kim', title: 'VP Sales', department: 'Sales', email: 'david@acme.io', skills: ['strategy', 'negotiation'] },
    { name: 'Eve Johnson', title: 'Account Executive', department: 'Sales', email: 'eve@acme.io', skills: ['enterprise', 'saas'], reportsTo: 'David Kim' },
    { name: 'Frank Brown', title: 'Head of Design', department: 'Design', email: 'frank@acme.io', skills: ['figma', 'ux', 'branding'] },
    { name: 'Grace Lee', title: 'Product Manager', department: 'Product', email: 'grace@acme.io', skills: ['roadmapping', 'analytics', 'user-research'] },
    { name: 'Henry Patel', title: 'DevOps Engineer', department: 'Engineering', email: 'henry@acme.io', skills: ['aws', 'terraform', 'docker'], reportsTo: 'Alice Chen' }
  ];
  for (const emp of employees) {
    await request('POST', '/db/company_wiki/employees', emp, userToken);
  }
  console.log(`   ✓ ${employees.length} employees inserted`);

  // 4. Insert projects
  console.log('4. Inserting project documents...');
  const projects = [
    { name: 'Project Atlas', status: 'active', lead: 'Alice Chen', team: ['Bob Martinez', 'Henry Patel'], description: 'Cloud infrastructure migration to Kubernetes' },
    { name: 'Project Nova', status: 'active', lead: 'Grace Lee', team: ['Bob Martinez', 'Frank Brown'], description: 'New customer portal redesign with AI features' },
    { name: 'Project Titan', status: 'planning', lead: 'Carol Williams', team: ['Carol Williams'], description: 'ML-powered sales forecasting pipeline' },
    { name: 'Q4 Sales Push', status: 'active', lead: 'David Kim', team: ['Eve Johnson'], description: 'Enterprise expansion into APAC market' }
  ];
  for (const proj of projects) {
    await request('POST', '/db/company_wiki/projects', proj, userToken);
  }
  console.log(`   ✓ ${projects.length} projects inserted`);

  // 5. Insert knowledge articles
  console.log('5. Inserting knowledge articles...');
  const articles = [
    { title: 'Kubernetes Best Practices', author: 'Alice Chen', category: 'infrastructure', content: 'Use namespaces for isolation, set resource limits, use HPA for autoscaling.' },
    { title: 'React Performance Guide', author: 'Bob Martinez', category: 'frontend', content: 'Memoize expensive computations with useMemo, virtualize long lists, lazy load routes.' },
    { title: 'ML Model Deployment', author: 'Carol Williams', category: 'data-science', content: 'Use ONNX for portable models, monitor drift with statistical tests, A/B test in production.' },
    { title: 'Sales Playbook 2024', author: 'David Kim', category: 'sales', content: 'Focus on value selling, multi-threading in enterprise accounts, POC-driven approach.' },
    { title: 'Brand Guidelines v3', author: 'Frank Brown', category: 'design', content: 'Primary blue #38bdf8, secondary purple #a78bfa, minimum logo clearance 24px.' },
    { title: 'Onboarding Checklist', author: 'Grace Lee', category: 'operations', content: 'Day 1: Setup accounts. Week 1: Team intros. Month 1: First deliverable. Month 3: Review.' }
  ];
  for (const art of articles) {
    await request('POST', '/db/company_wiki/articles', art, userToken);
  }
  console.log(`   ✓ ${articles.length} articles inserted`);

  // 6. Store some AI agent memories
  console.log('6. Storing AI agent memory threads...');
  const memories = [
    { sessionId: 'onboarding-bot-001', role: 'user', content: 'How do I set up my development environment?' },
    { sessionId: 'onboarding-bot-001', role: 'assistant', content: 'Clone the monorepo, run docker-compose up, then npm install in the frontend directory.' },
    { sessionId: 'onboarding-bot-001', role: 'user', content: 'What Kubernetes namespace should I use?' },
    { sessionId: 'onboarding-bot-001', role: 'assistant', content: 'Use the dev-<your-name> namespace. Alice Chen can grant access via kubectl RBAC.' },
    { sessionId: 'sales-assistant-042', role: 'user', content: 'What is our pricing for enterprise?' },
    { sessionId: 'sales-assistant-042', role: 'assistant', content: 'Enterprise tier starts at $50k/yr. Contact David Kim for custom pricing and POC setup.' }
  ];
  for (const mem of memories) {
    await request('POST', `/db/company_wiki/memory/${mem.sessionId}`, { role: mem.role, content: mem.content }, userToken);
  }
  console.log(`   ✓ ${memories.length} memory entries stored`);

  // 7. Register a webhook
  console.log('7. Registering sample webhook...');
  await request('POST', '/db/company_wiki/webhooks', {
    url: 'https://httpbin.org/post',
    events: ['document.created', 'document.updated'],
    secret: 'demo-webhook-secret'
  }, userToken);
  console.log('   ✓ Webhook registered');

  // 8. Check graph stats
  console.log('8. Checking knowledge graph...');
  const graphStats = await request('GET', '/db/company_wiki/graph/stats', null, userToken);
  console.log(`   ✓ Graph: ${graphStats.nodes || 0} nodes, ${graphStats.edges || 0} edges`);

  // 9. Test search
  console.log('9. Testing hybrid search...');
  const searchRes = await request('POST', '/db/company_wiki/search', { q: 'kubernetes deployment', collection: 'articles' }, userToken);
  console.log(`   ✓ Search returned ${(searchRes.results || []).length} results`);

  console.log('\n✅ Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  Email:    demo@knowledgedb.io');
  console.log('  Password: demo12345678');
  console.log('  Database: company_wiki');
  console.log('\nCollections: employees, projects, articles');
  console.log('Memory sessions: onboarding-bot-001, sales-assistant-042');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
