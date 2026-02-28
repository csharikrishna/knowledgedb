import React, { useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { 
  FileText, Code, AlertCircle, CheckCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import './Pages.css';

export default function GettingStarted() {
  const [expandedStep, setExpandedStep] = useState(0);

  const steps = [
    {
      title: '1. Installation',
      description: 'Set up KnowledgeDB in your project',
      code: `npm install knowledgedb\n# or\npip install knowledgedb`,
      details: 'Install the client library for your language. Supports JavaScript, Python, and Go.'
    },
    {
      title: '2. Initialize Client',
      description: 'Connect to your KnowledgeDB instance',
      code: `const KnowledgeDB = require('knowledgedb');\nconst db = new KnowledgeDB({\n  apiKey: 'your-api-key',\n  apiEndpoint: 'https://api.knowledgedb.com'\n});`,
      details: 'Create a new client instance with your API credentials.'
    },
    {
      title: '3. Create Collection',
      description: 'Create a collection to store your documents',
      code: `const docs = [\n  { id: '1', text: 'KnowledgeDB is fast', metadata: { source: 'blog' } },\n  { id: '2', text: 'Vector search is powerful', metadata: { source: 'docs' } }\n];\n\nconst result = await db.collection('articles').insert(docs);`,
      details: 'Collections organize your data into logical groups for easier management.'
    },
    {
      title: '4. Search Documents',
      description: 'Perform semantic search on your documents',
      code: `const results = await db.collection('articles')\n  .search('fast vector search', {\n    limit: 10,\n    filters: { source: 'blog' }\n  });\n\nconsole.log(results);`,
      details: 'Search returns results ranked by semantic similarity with metadata.'
    },
    {
      title: '5. Ask Questions',
      description: 'Get AI-powered answers about your knowledge base',
      code: `const answer = await db.collection('articles')\n  .ask('Is KnowledgeDB fast?', {\n    citations: true,\n    context_limit: 5\n  });\n\nconsole.log(answer.response);`,
      details: 'Get contextual answers with source citations from your documents.'
    }
  ];

  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="Getting Started"
        subtitle="Set up KnowledgeDB in 5 minutes and start building intelligent applications"
        showCTA={true}
        ctaText="Try it Now"
        ctaLink="/login"
        height="auto"
      />

      {/* Prerequisites */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Prerequisites</h2>
          </div>
          <div className="prerequisites-grid">
            <div className="prereq-card">
              <CheckCircle size={32} color="#10b981" />
              <h3>Node.js or Python</h3>
              <p>JavaScript SDK requires Node.js 16+, Python SDK requires Python 3.8+</p>
            </div>
            <div className="prereq-card">
              <CheckCircle size={32} color="#10b981" />
              <h3>API Key</h3>
              <p>Get your free API key from the dashboard after signing up</p>
            </div>
            <div className="prereq-card">
              <CheckCircle size={32} color="#10b981" />
              <h3>Network Access</h3>
              <p>Ensure your application can reach api.knowledgedb.com (HTTPS)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section className="section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2>Step-by-Step Guide</h2>
          </div>

          <div className="steps-accordion">
            {steps.map((step, index) => (
              <div key={index} className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() => setExpandedStep(expandedStep === index ? -1 : index)}
                >
                  <span>{step.title}</span>
                  <span className="accordion-icon">
                    {expandedStep === index ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </span>
                </button>
                {expandedStep === index && (
                  <div className="accordion-content">
                    <p className="step-description">{step.description}</p>
                    <div className="code-block">
                      <pre><code>{step.code}</code></pre>
                    </div>
                    <p className="step-details">{step.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Patterns */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Common Patterns</h2>
            <p>Learn popular use cases and best practices</p>
          </div>

          <div className="patterns-grid">
            <div className="pattern-card">
              <FileText size={32} color="#3b82f6" />
              <h3>Document Management</h3>
              <p>Upload, index, and search through large document collections</p>
              <Link to="/api-reference" className="learn-more">Learn more →</Link>
            </div>
            <div className="pattern-card">
              <Code size={32} color="#8b5cf6" />
              <h3>Chat Interface</h3>
              <p>Build chatbots that answer questions from your knowledge base</p>
              <Link to="/api-reference" className="learn-more">Learn more →</Link>
            </div>
            <div className="pattern-card">
              <AlertCircle size={32} color="#10b981" />
              <h3>Semantic Search UI</h3>
              <p>Implement powerful search with faceted filtering and ranking</p>
              <Link to="/api-reference" className="learn-more">Learn more →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2>Troubleshooting</h2>
          </div>

          <div className="faq-list">
            <details className="faq-item">
              <summary>How do I get my API key?</summary>
              <p>Sign up for a free account, navigate to Settings → API Keys, and generate a new key. Keep it secure!</p>
            </details>
            <details className="faq-item">
              <summary>What's the rate limit?</summary>
              <p>Free tier: 1,000 requests/month. Pro tier: 100,000 requests/month. Custom limits available on Enterprise.</p>
            </details>
            <details className="faq-item">
              <summary>Can I self-host KnowledgeDB?</summary>
              <p>Yes! KnowledgeDB is open source (MIT License). You can self-host using Docker. See documentation for details.</p>
            </details>
            <details className="faq-item">
              <summary>Which languages are supported?</summary>
              <p>Currently JavaScript (Node.js), Python, and Go. More languages coming soon.</p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to build?</h2>
            <p>Start with our free tier, no credit card required</p>
            <Link to="/dashboard" className="btn btn-primary">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
