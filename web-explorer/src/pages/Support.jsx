import React, { useState } from 'react';
import Header from '../components/Header';
import { 
  Mail, MessageCircle, Phone, FileText, BookOpen, Github, HelpCircle, Zap 
} from 'lucide-react';
import './Pages.css';

export default function Support() {
  const [selectedCategory, setSelectedCategory] = useState('general');

  const resources = [
    {
      icon: <FileText size={32} />,
      title: 'Documentation',
      description: 'Comprehensive guides and API documentation',
      link: '/getting-started',
      color: '#3b82f6'
    },
    {
      icon: <HelpCircle size={32} />,
      title: 'FAQ',
      description: 'Frequently asked questions and troubleshooting',
      link: '#faq',
      color: '#8b5cf6'
    },
    {
      icon: <Github size={32} />,
      title: 'GitHub Issues',
      description: 'Report bugs and suggest features',
      link: 'https://github.com/knowledgedb/knowledgedb/issues',
      color: '#10b981'
    },
    {
      icon: <Zap size={32} />,
      title: 'Status Page',
      description: 'Check service status and incidents',
      link: 'https://status.knowledgedb.com',
      color: '#f59e0b'
    }
  ];

  const contactMethods = [
    {
      icon: <Mail size={32} />,
      title: 'Email Support',
      description: 'support@knowledgedb.com',
      response: 'Response time: 24 hours',
      cta: 'Send Email',
      ctaLink: 'mailto:support@knowledgedb.com'
    },
    {
      icon: <MessageCircle size={32} />,
      title: 'Discord Community',
      description: 'Join our community chat',
      response: 'Response time: 2-4 hours',
      cta: 'Join Discord',
      ctaLink: 'https://discord.gg/knowledgedb'
    },
    {
      icon: <Phone size={32} />,
      title: 'Phone Support',
      description: 'Enterprise customers only',
      response: '24/7 support available',
      cta: 'Contact Sales',
      ctaLink: 'mailto:sales@knowledgedb.com'
    },
    {
      icon: <BookOpen size={32} />,
      title: 'Knowledge Base',
      description: 'searchable documentation & tutorials',
      response: 'Always available',
      cta: 'Browse Articles',
      ctaLink: '/getting-started'
    }
  ];

  const faqItems = [
    {
      category: 'general',
      question: 'What is KnowledgeDB?',
      answer: 'KnowledgeDB is a vector database designed for modern AI applications. It combines semantic search, knowledge graphs, and AI-powered Q&A to help you build intelligent applications with your knowledge.'
    },
    {
      category: 'general',
      question: 'How is KnowledgeDB different from other databases?',
      answer: 'KnowledgeDB specializes in vector/semantic search with built-in GraphRAG capabilities. Unlike traditional databases or basic vector stores, we provide a complete platform for knowledge management.'
    },
    {
      category: 'technical',
      question: 'What APIs does KnowledgeDB support?',
      answer: 'We support REST APIs, WebSocket connections, and SDKs for JavaScript, Python, and Go. Full OpenAPI documentation is available in our API reference.'
    },
    {
      category: 'technical',
      question: 'How do I migrate data from another database?',
      answer: 'We provide migration tools and guides for common databases. See the migration guide in our documentation, or contact support@knowledgedb.com for assistance.'
    },
    {
      category: 'billing',
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee on paid plans. Contact our support team within 30 days of purchase for a full refund.'
    },
    {
      category: 'billing',
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes! Non-profits and educational institutions get 50% off all plans. Contact sales@knowledgedb.com with proof of status.'
    }
  ];

  const filteredFAQ = selectedCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory);

  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="Support & Resources"
        subtitle="We're here to help! Choose your preferred way to get support"
        showCTA={true}
        ctaText="Contact Us"
        ctaLink="mailto:support@knowledgedb.com"
        height="auto"
      />

      {/* Contact Methods */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Get Help</h2>
            <p>Multiple ways to reach us</p>
          </div>

          <div className="contact-grid">
            {contactMethods.map((method, index) => (
              <div key={index} className="contact-card">
                <div className="contact-icon">
                  {method.icon}
                </div>
                <h3>{method.title}</h3>
                <p className="contact-description">{method.description}</p>
                <p className="response-time">{method.response}</p>
                <a href={method.ctaLink} target="_blank" rel="noopener noreferrer" className="btn btn-small btn-primary">
                  {method.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2>Resources</h2>
            <p>Learn at your own pace</p>
          </div>

          <div className="resources-grid">
            {resources.map((resource, index) => (
              <a key={index} href={resource.link} className="resource-card">
                <div className="resource-icon" style={{ color: resource.color }}>
                  {resource.icon}
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <span className="arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>FAQ</h2>
            <p>Quick answers to common questions</p>
          </div>

          <div className="faq-filters">
            <button 
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${selectedCategory === 'general' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('general')}
            >
              General
            </button>
            <button 
              className={`filter-btn ${selectedCategory === 'technical' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('technical')}
            >
              Technical
            </button>
            <button 
              className={`filter-btn ${selectedCategory === 'billing' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('billing')}
            >
              Billing
            </button>
          </div>

          <div className="faq-list">
            {filteredFAQ.map((item, index) => (
              <details key={index} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Can't find what you're looking for?</h2>
            <p>Our support team is ready to help</p>
            <div className="cta-buttons">
              <a href="mailto:support@knowledgedb.com" className="btn btn-primary">
                Email Support
              </a>
              <a href="https://discord.gg/knowledgedb" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
