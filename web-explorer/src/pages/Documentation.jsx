import React, { useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Code, Zap, Database, Shield, Search, Brain, ChevronRight 
} from 'lucide-react';
import './Pages.css';

export default function Documentation() {
  const [expandedSection, setExpandedSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap size={24} />,
      subsections: [
        { title: 'Introduction', link: '/getting-started' },
        { title: 'Installation', link: '/getting-started' },
        { title: 'Quick Start', link: '/getting-started' },
        { title: 'Configuration', link: '/getting-started' }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: <Code size={24} />,
      subsections: [
        { title: 'REST API', link: '/api-reference' },
        { title: 'Authentication', link: '/api-reference' },
        { title: 'Endpoints', link: '/api-reference' },
        { title: 'Error Handling', link: '/api-reference' }
      ]
    },
    {
      id: 'features',
      title: 'Core Features',
      icon: <Zap size={24} />,
      subsections: [
        { title: 'Vector Search', link: '/features' },
        { title: 'Knowledge Graph', link: '/features' },
        { title: 'Hybrid Search', link: '/features' },
        { title: 'GraphRAG Q&A', link: '/features' }
      ]
    },
    {
      id: 'guides',
      title: 'How-To Guides',
      icon: <BookOpen size={24} />,
      subsections: [
        { title: 'Build a Chatbot', link: '#' },
        { title: 'Document Management', link: '#' },
        { title: 'Custom Embeddings', link: '#' },
        { title: 'Performance Optimization', link: '#' }
      ]
    },
    {
      id: 'deployment',
      title: 'Deployment',
      icon: <Database size={24} />,
      subsections: [
        { title: 'Cloud Deployment', link: '#' },
        { title: 'Self-Hosting', link: '#' },
        { title: 'Docker Setup', link: '#' },
        { title: 'Scaling & Monitoring', link: '#' }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield size={24} />,
      subsections: [
        { title: 'Access Control', link: '#' },
        { title: 'Encryption', link: '#' },
        { title: 'Audit Logs', link: '#' },
        { title: 'Compliance', link: '#' }
      ]
    }
  ];

  const tutorials = [
    {
      title: 'Build Your First App',
      description: 'Learn the basics by building a simple search application',
      difficulty: 'Beginner',
      duration: '15 min',
      icon: <Code size={32} />
    },
    {
      title: 'Create an AI Chatbot',
      description: 'Build an intelligent chatbot using GraphRAG Q&A',
      difficulty: 'Intermediate',
      duration: '45 min',
      icon: <Brain size={32} />
    },
    {
      title: 'Document Upload & Search',
      description: 'Implement a complete document management system',
      difficulty: 'Intermediate',
      duration: '30 min',
      icon: <Database size={32} />
    },
    {
      title: 'Advanced Search Patterns',
      description: 'Master hybrid search, filters, and ranking',
      difficulty: 'Advanced',
      duration: '60 min',
      icon: <Search size={32} />
    }
  ];

  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="Documentation"
        subtitle="Complete guides, tutorials, and API reference for KnowledgeDB"
        showCTA={true}
        ctaText="Explore Docs"
        ctaLink="/getting-started"
        height="auto"
      />

      {/* Quick Links */}
      <section className="section">
        <div className="container">
          <div className="quick-links-grid">
            <Link to="/getting-started" className="quick-link-card">
              <Zap size={40} color="#3b82f6" />
              <h3>Get Started</h3>
              <p>5-minute setup guide</p>
              <ChevronRight size={20} />
            </Link>
            <Link to="/api-reference" className="quick-link-card">
              <Code size={40} color="#8b5cf6" />
              <h3>API Reference</h3>
              <p>Complete API documentation</p>
              <ChevronRight size={20} />
            </Link>
            <Link to="/features" className="quick-link-card">
              <Zap size={40} color="#10b981" />
              <h3>Features</h3>
              <p>Explore all capabilities</p>
              <ChevronRight size={20} />
            </Link>
            <a href="https://github.com/knowledgedb" target="_blank" rel="noopener noreferrer" className="quick-link-card">
              <Code size={40} color="#f59e0b" />
              <h3>GitHub</h3>
              <p>Source code & examples</p>
              <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Documentation Structure */}
      <section className="section bg-alt">
        <div className="container">
          <div className="doc-structure">
            <div className="doc-sidebar">
              <h3>Documentation</h3>
              {sections.map(section => (
                <div key={section.id} className="doc-section">
                  <button
                    className={`doc-section-title ${expandedSection === section.id ? 'active' : ''}`}
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </button>
                  {expandedSection === section.id && (
                    <div className="doc-subsections">
                      {section.subsections.map((sub, i) => (
                        <Link key={i} to={sub.link} className="doc-subsection">
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="doc-content">
              <div className="doc-welcome">
                <h2>Welcome to KnowledgeDB Documentation</h2>
                <p>Learn how to build powerful AI applications with KnowledgeDB.</p>
                
                <div className="getting-started-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>Install KnowledgeDB</h3>
                      <p>Add KnowledgeDB to your project with npm, pip, or go get</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Get Your API Key</h3>
                      <p>Sign up for free and get your API credentials instantly</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Load Your Data</h3>
                      <p>Upload documents, PDFs, or text to create your knowledge base</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h3>Build Your App</h3>
                      <p>Use our APIs to search, ask questions, and get insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Tutorials</h2>
            <p>Step-by-step guides to accomplish common tasks</p>
          </div>

          <div className="tutorials-grid">
            {tutorials.map((tutorial, index) => (
              <div key={index} className="tutorial-card">
                <div className="tutorial-icon">
                  {tutorial.icon}
                </div>
                <h3>{tutorial.title}</h3>
                <p>{tutorial.description}</p>
                <div className="tutorial-meta">
                  <span className={`difficulty difficulty-${tutorial.difficulty.toLowerCase().replace(' ', '-')}`}>
                    {tutorial.difficulty}
                  </span>
                  <span className="duration">{tutorial.duration}</span>
                </div>
                <button className="btn btn-secondary btn-small">Start Tutorial</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2>Code Examples</h2>
            <p>Learn by example with ready-to-use code snippets</p>
          </div>

          <div className="examples-grid">
            <div className="example-card">
              <h3>JavaScript</h3>
              <div className="code-block">
                <pre><code>{`const KnowledgeDB = require('knowledgedb');
const db = new KnowledgeDB({ apiKey: '...' });

const results = await db.search('your query');
console.log(results);`}</code></pre>
              </div>
              <a href="https://github.com/knowledgedb/examples" className="link">View more examples →</a>
            </div>
            <div className="example-card">
              <h3>Python</h3>
              <div className="code-block">
                <pre><code>{`from knowledgedb import KnowledgeDB

db = KnowledgeDB(api_key='...')
results = db.search('your query')
print(results)`}</code></pre>
              </div>
              <a href="https://github.com/knowledgedb/examples" className="link">View more examples →</a>
            </div>
            <div className="example-card">
              <h3>cURL</h3>
              <div className="code-block">
                <pre><code>{`curl -X POST https://api.knowledgedb.com/search \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -d '{"query":"hello"}'`}</code></pre>
              </div>
              <a href="https://github.com/knowledgedb/examples" className="link">View more examples →</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to build?</h2>
            <p>Start with our Getting Started guide</p>
            <Link to="/getting-started" className="btn btn-primary">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
