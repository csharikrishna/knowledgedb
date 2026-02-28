import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Database, Network, Search, Brain, Zap, Shield, 
  ChevronRight, Code, Rocket, CheckCircle,
  Users
} from 'lucide-react';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setStatsAnimated(true);
        }
      });
    }, { threshold: 0.2 });

    const statsSection = document.querySelector('.welcome-stats');
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Database size={40} />,
      title: 'NoSQL Document Store',
      description: 'MongoDB-like CRUD operations with flexible schemas and automatic indexing',
      color: '#3b82f6'
    },
    {
      icon: <Network size={40} />,
      title: 'Knowledge Graph',
      description: 'Automatic entity extraction and relationship mapping from your documents',
      color: '#8b5cf6'
    },
    {
      icon: <Search size={40} />,
      title: 'Hybrid Search',
      description: 'BM25 keyword search combined with graph traversal for intelligent results',
      color: '#10b981'
    },
    {
      icon: <Brain size={40} />,
      title: 'AI Memory System',
      description: 'Contextual memory storage and recall for intelligent agent conversations',
      color: '#f59e0b'
    },
    {
      icon: <Zap size={40} />,
      title: 'GraphRAG',
      description: 'Graph-Augmented Retrieval for enhanced question answering with context',
      color: '#ef4444'
    },
    {
      icon: <Shield size={40} />,
      title: 'Enterprise Security',
      description: 'JWT authentication, API keys, rate limiting, and production-ready architecture',
      color: '#06b6d4'
    }
  ];

  return (
    <div className="welcome-container">
      {/* Innovative Header Component */}
      <Header 
        title="The Knowledge Platform Built for AI Era"
        subtitle="Transform your data into actionable intelligence with auto-knowledge graphs, hybrid search, and AI-powered retrieval"
        showCTA={true}
        ctaText="Start Building Free"
        ctaLink="/login"
        height="full"
      />

      {/* Features Showcase */}
      <div className="welcome-features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need in One Platform</h2>
            <p className="section-description">
              Powerful features that work together seamlessly to transform how you manage knowledge
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card-modern" key={index}>
                <div className="feature-icon-wrapper" style={{ background: `${feature.color}15` }}>
                  <div style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-link">
                  Learn more <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="welcome-how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple to Start, Powerful to Scale</h2>
            <p className="section-description">
              From zero to production in minutes
            </p>
          </div>
          
          <div className="steps-timeline">
            <div className="step-modern">
              <div className="step-number-modern">01</div>
              <div className="step-content-modern">
                <h3>Create Account</h3>
                <p>Sign up in seconds with just an email and password. No credit card required.</p>
                <div className="step-icon">
                  <Users size={24} />
                </div>
              </div>
            </div>
            
            <div className="step-connector"></div>
            
            <div className="step-modern">
              <div className="step-number-modern">02</div>
              <div className="step-content-modern">
                <h3>Create Database</h3>
                <p>Get instant API access with endpoint and key. Start adding documents immediately.</p>
                <div className="step-icon">
                  <Database size={24} />
                </div>
              </div>
            </div>
            
            <div className="step-connector"></div>
            
            <div className="step-modern">
              <div className="step-number-modern">03</div>
              <div className="step-content-modern">
                <h3>Build Knowledge Graph</h3>
                <p>Watch as entities and relationships are automatically extracted from your data.</p>
                <div className="step-icon">
                  <Network size={24} />
                </div>
              </div>
            </div>
            
            <div className="step-connector"></div>
            
            <div className="step-modern">
              <div className="step-number-modern">04</div>
              <div className="step-content-modern">
                <h3>Query Intelligently</h3>
                <p>Use hybrid search and GraphRAG to get AI-powered answers from your knowledge base.</p>
                <div className="step-icon">
                  <Brain size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="welcome-code-section">
        <div className="container">
          <div className="code-showcase">
            <div className="code-info">
              <h2>Simple API, Powerful Results</h2>
              <p>
                Start inserting documents and querying your knowledge graph with just a few lines of code.
                No complicated setup or configuration required.
              </p>
              
              <div className="code-features-list">
                <div className="code-feature">
                  <CheckCircle size={20} color="#10b981" />
                  <span>RESTful API design</span>
                </div>
                <div className="code-feature">
                  <CheckCircle size={20} color="#10b981" />
                  <span>JavaScript & Python SDKs</span>
                </div>
                <div className="code-feature">
                  <CheckCircle size={20} color="#10b981" />
                  <span>Comprehensive documentation</span>
                </div>
                <div className="code-feature">
                  <CheckCircle size={20} color="#10b981" />
                  <span>Real-time events via SSE</span>
                </div>
              </div>
            </div>
            
            <div className="code-window">
              <div className="code-window-header">
                <div className="code-window-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="code-window-title">example.js</span>
              </div>
              <pre className="code-content"><code>{`// Insert a document
await db.insert('mydb', 'users', {
  name: 'Alice Johnson',
  role: 'Data Scientist',
  skills: ['Python', 'ML', 'GraphRAG']
});

// Hybrid search with graph context
const results = await db.search('mydb', 
  'find data scientists with Python',
  { mode: 'hybrid', limit: 10 }
);

// Ask intelligent questions
const answer = await db.ask('mydb',
  'What are Alice\\'s key skills?'
);`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="welcome-stats">
        <div className="container">
          <div className="stats-grid-modern">
            <div className={`stat-card-modern ${statsAnimated ? 'animate' : ''}`}>
              <div className="stat-icon-modern">
                <Code size={32} />
              </div>
              <div className="stat-number">22+</div>
              <div className="stat-label">API Endpoints</div>
              <div className="stat-description">Complete CRUD, Graph, Search, Memory & More</div>
            </div>
            
            <div className={`stat-card-modern ${statsAnimated ? 'animate' : ''}`} style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon-modern">
                <Zap size={32} />
              </div>
              <div className="stat-number">&lt;50ms</div>
              <div className="stat-label">Avg Response Time</div>
              <div className="stat-description">Optimized for speed & performance</div>
            </div>
            
            <div className={`stat-card-modern ${statsAnimated ? 'animate' : ''}`} style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon-modern">
                <Database size={32} />
              </div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Production Ready</div>
              <div className="stat-description">Zero errors, fully tested & documented</div>
            </div>
            
            <div className={`stat-card-modern ${statsAnimated ? 'animate' : ''}`} style={{ animationDelay: '0.3s' }}>
              <div className="stat-icon-modern">
                <Shield size={32} />
              </div>
              <div className="stat-number">Enterprise</div>
              <div className="stat-label">Security Ready</div>
              <div className="stat-description">JWT, API keys, rate limiting & encryption</div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="welcome-use-cases">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Built for Modern Applications</h2>
            <p className="section-description">
              From AI agents to enterprise knowledge management
            </p>
          </div>
          
          <div className="use-cases-grid-modern">
            <div className="use-case-modern">
              <div className="use-case-emoji">🤖</div>
              <h3>AI Chatbots & Agents</h3>
              <p>Perfect memory backend for conversational AI with intelligent context recall and knowledge retrieval</p>
              <ul className="use-case-features">
                <li>Session-based memory storage</li>
                <li>Context-aware retrieval</li>
                <li>Real-time event streaming</li>
              </ul>
            </div>
            
            <div className="use-case-modern">
              <div className="use-case-emoji">📚</div>
              <h3>Smart Documentation</h3>
              <p>Transform static docs into intelligent knowledge bases with automatic entity extraction and semantic search</p>
              <ul className="use-case-features">
                <li>Auto-linking related content</li>
                <li>Semantic search</li>
                <li>Version history tracking</li>
              </ul>
            </div>
            
            <div className="use-case-modern">
              <div className="use-case-emoji">🔬</div>
              <h3>Research & Analysis</h3>
              <p>Connect ideas and discover hidden relationships in your research data with graph algorithms</p>
              <ul className="use-case-features">
                <li>Entity relationship mapping</li>
                <li>Graph traversal & pathfinding</li>
                <li>Clustering & analytics</li>
              </ul>
            </div>
            
            <div className="use-case-modern">
              <div className="use-case-emoji">💼</div>
              <h3>Enterprise Knowledge</h3>
              <p>Centralize organizational knowledge with secure multi-tenant architecture and access control</p>
              <ul className="use-case-features">
                <li>Role-based access control</li>
                <li>API key management</li>
                <li>Audit logging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="welcome-cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Transform Your Knowledge Management?</h2>
              <p className="cta-description">
                Join developers building the future of AI-powered applications with KnowledgeDB
              </p>
              <button 
                className="btn btn-primary btn-large btn-gradient"
                onClick={() => navigate('/login')}
              >
                <Rocket size={20} />
                Get Started Free
                <ChevronRight size={20} />
              </button>
              <p className="cta-note">No credit card required • Self-hosted • Open source MIT license</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default Welcome;
