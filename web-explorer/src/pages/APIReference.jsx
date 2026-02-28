import React, { useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import './Pages.css';

export default function APIReference() {
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/db',
      description: 'Create a new database',
      body: '{ "name": "my_knowledge_base" }',
      response: '{ "dbId": "...", "apiKey": "...", "apiEndpoint": "..." }',
      example: `curl -X POST https://api.knowledgedb.com/db \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my_db"}'`
    },
    {
      method: 'POST',
      path: '/db/:db/collection',
      description: 'Create or switch to a collection',
      body: '{ "name": "documents", "schema": {...} }',
      response: '{ "collectionId": "...", "schema": {...} }',
      example: `curl -X POST https://api.knowledgedb.com/db/my_db/collection \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"name": "documents"}'`
    },
    {
      method: 'POST',
      path: '/db/:db/:collection/insert',
      description: 'Insert documents into a collection',
      body: '[{ "id": "1", "text": "...", "metadata": {...} }]',
      response: '{ "inserted": 1, "ids": ["1"] }',
      example: `curl -X POST https://api.knowledgedb.com/db/my_db/documents/insert \\
  -d '[{"id":"1","text":"Hello world"}]'`
    },
    {
      method: 'POST',
      path: '/db/:db/:collection/search',
      description: 'Hybrid search (BM25 + vector)',
      body: '{ "query": "...", "limit": 10, "filters": {...} }',
      response: '[{ "id": "1", "score": 0.95, "text": "...", "metadata": {...} }]',
      example: `curl -X POST https://api.knowledgedb.com/db/my_db/documents/search \\
  -d '{"query":"fast search","limit":10}'`
    },
    {
      method: 'POST',
      path: '/db/:db/:collection/ask',
      description: 'Ask natural language questions',
      body: '{ "question": "...", "citations": true }',
      response: '{ "response": "...", "sources": [...], "confidence": 0.92 }',
      example: `curl -X POST https://api.knowledgedb.com/db/my_db/documents/ask \\
  -d '{"question":"What is KnowledgeDB?","citations":true}'`
    },
    {
      method: 'GET',
      path: '/db/:db/graph/stats',
      description: 'Get knowledge graph statistics',
      body: 'N/A',
      response: '{ "nodes": 1500, "edges": 3200, "clusters": 45 }',
      example: `curl https://api.knowledgedb.com/db/my_db/graph/stats \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: 'POST',
      path: '/db/:db/graph/traverse',
      description: 'Traverse knowledge graph relationships',
      body: '{ "nodeId": "...", "depth": 2, "limit": 50 }',
      response: '{ "paths": [...], "nodes": [...], "edges": [...] }',
      example: `curl -X POST https://api.knowledgedb.com/db/my_db/graph/traverse \\
  -d '{"nodeId":"node1","depth":2}'`
    },
    {
      method: 'POST',
      path: '/db/:db/:collection/delete',
      description: 'Delete documents by ID or query',
      body: '{ "ids": ["1", "2"] } or { "query": "metadata.source=blog" }',
      response: '{ "deleted": 2 }',
      example: `curl -X POST https://api.knowledgedb.com/db/my_db/documents/delete \\
  -d '{"ids":["1","2"]}'`
    }
  ];

  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="API Reference"
        subtitle="Complete documentation of all KnowledgeDB API endpoints"
        showCTA={true}
        ctaText="Get API Key"
        ctaLink="/login"
        height="auto"
      />

      {/* Base URL Info */}
      <section className="section">
        <div className="container">
          <div className="api-info-box">
            <h2>Base URL</h2>
            <div className="code-block">
              <pre><code>https://api.knowledgedb.com/v1</code></pre>
            </div>
            <p className="info-text">All API requests must include an Authorization header with your API key:</p>
            <div className="code-block">
              <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="section bg-alt">
        <div className="container">
          <h2>Authentication</h2>
          <div className="auth-section">
            <div className="auth-method">
              <h3>Bearer Token</h3>
              <p>Include your API key in the Authorization header:</p>
              <div className="code-block">
                <pre><code>Authorization: Bearer kdb_live_xxxxxxxxxxxx</code></pre>
              </div>
            </div>
            <div className="auth-method">
              <h3>Getting Your API Key</h3>
              <p>1. Log in to your dashboard</p>
              <p>2. Go to Settings → API Keys</p>
              <p>3. Click "Generate New Key"</p>
              <p>4. Copy and store securely (never commit to version control)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="section">
        <div className="container">
          <h2>Endpoints</h2>
          <div className="endpoints-list">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="endpoint-card">
                <div className="endpoint-header">
                  <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                    {endpoint.method}
                  </span>
                  <code className="endpoint-path">{endpoint.path}</code>
                </div>
                <p className="endpoint-description">{endpoint.description}</p>
                
                <div className="endpoint-details">
                  <div className="detail-column">
                    <h4>Request Body</h4>
                    <div className="code-block">
                      <pre><code>{endpoint.body}</code></pre>
                    </div>
                  </div>
                  <div className="detail-column">
                    <h4>Response</h4>
                    <div className="code-block">
                      <pre><code>{endpoint.response}</code></pre>
                    </div>
                  </div>
                </div>

                <div className="example-section">
                  <h4>Example Request</h4>
                  <div className="code-block with-copy">
                    <pre><code>{endpoint.example}</code></pre>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(endpoint.example, index)}
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="section bg-alt">
        <div className="container">
          <h2>Error Codes</h2>
          <div className="error-table">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Message</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>400</td>
                  <td>Bad Request</td>
                  <td>Invalid request parameters or body format</td>
                </tr>
                <tr>
                  <td>401</td>
                  <td>Unauthorized</td>
                  <td>Missing or invalid API key</td>
                </tr>
                <tr>
                  <td>403</td>
                  <td>Forbidden</td>
                  <td>You don't have permission for this resource</td>
                </tr>
                <tr>
                  <td>404</td>
                  <td>Not Found</td>
                  <td>Resource does not exist</td>
                </tr>
                <tr>
                  <td>429</td>
                  <td>Too Many Requests</td>
                  <td>Rate limit exceeded. Please retry after delay</td>
                </tr>
                <tr>
                  <td>500</td>
                  <td>Internal Server Error</td>
                  <td>Server error. Please try again later</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="section">
        <div className="container">
          <h2>Rate Limiting</h2>
          <div className="rate-limits-grid">
            <div className="limit-card">
              <h3>Free Tier</h3>
              <p className="limit-value">1,000<span>/month</span></p>
              <p>Perfect for development and testing</p>
            </div>
            <div className="limit-card">
              <h3>Pro Tier</h3>
              <p className="limit-value">100,000<span>/month</span></p>
              <p>For production applications</p>
            </div>
            <div className="limit-card">
              <h3>Enterprise</h3>
              <p className="limit-value">Custom</p>
              <p>Dedicated support and custom limits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Need help?</h2>
            <p>Check our documentation or contact support</p>
            <div className="cta-buttons">
              <Link to="/getting-started" className="btn btn-primary">
                Getting Started Guide
              </Link>
              <a href="mailto:support@knowledgedb.com" className="btn btn-secondary">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
