import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { 
  Database, Network, Search, Brain, Zap, Shield, Lock, Rocket, 
  TrendingUp, Users, Clock, BarChart3, GitBranch, Code
} from 'lucide-react';
import './Pages.css';

export default function Features() {
  const features = [
    {
      icon: <Database size={48} />,
      title: 'Vector Storage',
      description: 'Store and manage embeddings with advanced indexing for ultra-fast semantic search',
      color: '#3b82f6',
      details: ['Approximate nearest neighbor search', 'Multiple distance metrics', 'Batch indexing', 'Real-time updates']
    },
    {
      icon: <Network size={48} />,
      title: 'Knowledge Graph',
      description: 'Automatically extract and visualize relationships between your data',
      color: '#8b5cf6',
      details: ['Auto-relationship extraction', 'Graph traversal', 'Entity linking', 'Pattern detection']
    },
    {
      icon: <Search size={48} />,
      title: 'Hybrid Search',
      description: 'Combine BM25 keyword search with semantic vector search for best results',
      color: '#10b981',
      details: ['BM25 full-text search', 'Vector similarity', 'Result fusion', 'Ranking algorithms']
    },
    {
      icon: <Brain size={48} />,
      title: 'AI-Powered Q&A',
      description: 'Ask natural language questions and get contextual answers with sources',
      color: '#f59e0b',
      details: ['GraphRAG implementation', 'Context awareness', 'Source attribution', 'Multi-hop reasoning']
    },
    {
      icon: <Shield size={48} />,
      title: 'Enterprise Security',
      description: 'Role-based access control, encryption, and audit logs for compliance',
      color: '#ef4444',
      details: ['RBAC permissions', 'End-to-end encryption', 'Audit logs', 'SSO integration']
    },
    {
      icon: <Clock size={48} />,
      title: 'Real-time Sync',
      description: 'WebSocket support for live updates across all connected clients',
      color: '#06b6d4',
      details: ['WebSocket events', 'Live collaboration', 'Change streams', 'Instant notifications']
    },
    {
      icon: <Zap size={48} />,
      title: 'Lightning Fast',
      description: 'Sub-50ms response times with optimized indexing and caching layers',
      color: '#ec4899',
      details: ['<50ms P95 latency', 'Automatic caching', 'Query optimization', 'Load balancing']
    },
    {
      icon: <Code size={48} />,
      title: 'REST & SDK APIs',
      description: 'Simple HTTP APIs with SDKs for Python, JavaScript, and Go',
      color: '#14b8a6',
      details: ['RESTful endpoints', 'OpenAPI spec', 'Type-safe SDKs', 'Webhook support']
    },
    {
      icon: <Users size={48} />,
      title: 'Multi-tenancy',
      description: 'Isolate data and users with built-in multi-tenant architecture',
      color: '#f97316',
      details: ['Data isolation', 'User namespaces', 'Resource quotas', 'Custom domains']
    },
    {
      icon: <GitBranch size={48} />,
      title: 'Versioning',
      description: 'Track changes, create snapshots, and rollback to previous versions',
      color: '#a855f7',
      details: ['Snapshot history', 'Rollback capability', 'Change tracking', 'Version comparison']
    },
    {
      icon: <BarChart3 size={48} />,
      title: 'Analytics & Monitoring',
      description: 'Built-in metrics, dashboards, and alerting for full observability',
      color: '#0ea5e9',
      details: ['Query metrics', 'Performance dashboards', 'Custom alerts', 'Export reports']
    },
    {
      icon: <TrendingUp size={48} />,
      title: 'Scalability',
      description: 'Horizontal scaling from MB to TB of data without downtime',
      color: '#16a34a',
      details: ['Sharding support', 'Replication', 'Cluster management', 'Auto-scaling']
    }
  ];

  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="Powerful Features"
        subtitle="Everything you need to build intelligent applications with your knowledge base"
        showCTA={true}
        ctaText="Get Started"
        ctaLink="/getting-started"
        height="auto"
      />

      {/* Features Grid */}
      <section className="section">
        <div className="container">
          <div className="features-showcase-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-showcase-card">
                <div 
                  className="feature-icon-large"
                  style={{ backgroundColor: feature.color + '20', color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-details">
                  {feature.details.map((detail, i) => (
                    <li key={i}>
                      <span className="checkmark">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2>Feature Categories</h2>
            <p>Explore our capabilities by category</p>
          </div>

          <div className="feature-categories">
            <div className="category-card">
              <Rocket size={40} color="#3b82f6" />
              <h3>Performance</h3>
              <p>Sub-50ms queries, automatic caching, and query optimization</p>
            </div>
            <div className="category-card">
              <Lock size={40} color="#ef4444" />
              <h3>Security</h3>
              <p>End-to-end encryption, RBAC, audit logs, and compliance ready</p>
            </div>
            <div className="category-card">
              <TrendingUp size={40} color="#10b981" />
              <h3>Scalability</h3>
              <p>Handle TB of data with horizontal scaling and replication</p>
            </div>
            <div className="category-card">
              <Code size={40} color="#8b5cf6" />
              <h3>Developer Experience</h3>
              <p>Clean APIs, SDKs, comprehensive documentation, and samples</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to explore these features?</h2>
            <p>Start building with KnowledgeDB today</p>
            <div className="cta-buttons">
              <Link to="/getting-started" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/api-reference" className="btn btn-secondary">
                API Reference
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
