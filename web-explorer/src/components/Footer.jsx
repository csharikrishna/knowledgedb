import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, Linkedin, Twitter, Mail, Heart, 
  ExternalLink, Zap, Code
} from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', path: '/features' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Documentation', path: '/documentation' },
        { label: 'API Reference', path: '/api-reference' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Getting Started', path: '/getting-started' },
        { label: 'Support', path: '/support' },
        { label: 'Status Page', path: 'https://status.knowledgedb.com', external: true },
        { label: 'GitHub', path: 'https://github.com/knowledgedb', external: true }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '#about' },
        { label: 'Blog', path: '#blog' },
        { label: 'Careers', path: '#careers' },
        { label: 'Contact', path: 'mailto:hello@knowledgedb.com' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'License (MIT)', path: '/license' },
        { label: 'Security', path: 'mailto:security@knowledgedb.com' }
      ]
    }
  ];

  const socialLinks = [
    { icon: <Github size={20} />, url: 'https://github.com/knowledgedb', label: 'GitHub' },
    { icon: <Twitter size={20} />, url: 'https://twitter.com/knowledgedb', label: 'Twitter' },
    { icon: <Linkedin size={20} />, url: 'https://linkedin.com/company/knowledgedb', label: 'LinkedIn' },
    { icon: <Mail size={20} />, url: 'mailto:hello@knowledgedb.com', label: 'Email' }
  ];

  return (
    <footer className="footer">
      {/* Top CTA Section */}
      <div className="footer-cta-section">
        <div className="footer-container">
          <div className="footer-cta-content">
            <div className="cta-text">
              <h3>Ready to Build Something Great?</h3>
              <p>Start your free account today and transform your knowledge management</p>
            </div>
            <Link to="/getting-started" className="cta-button">
              <Zap size={18} />
              Get Started Now
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-content-wrapper">
        <div className="footer-container">
          {/* Brand & Newsletter Section */}
          <div className="footer-brand-section">
            <div className="footer-brand">
              <div className="brand-logo">
                <Code size={28} />
                <span>KnowledgeDB</span>
              </div>
              <p className="brand-desc">
                The modern platform for knowledge management and AI-powered applications
              </p>
              
              {/* Stats */}
              <div className="footer-stats">
                <div className="stat">
                  <span className="stat-number">22+</span>
                  <span className="stat-label">APIs</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Open Source</span>
                </div>
                <div className="stat">
                  <span className="stat-number">&lt;50ms</span>
                  <span className="stat-label">Response Time</span>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <p>Subscribe to our newsletter for updates and tips</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="your@email.com" required />
                <button type="submit">Subscribe</button>
              </form>
              <p className="newsletter-note">No spam, unsubscribe anytime</p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="footer-links-grid">
            {footerSections.map((section, index) => (
              <div key={index} className="footer-section">
                <h4>{section.title}</h4>
                <ul>
                  {section.links.map((link, i) => (
                    <li key={i}>
                      {link.external ? (
                        <a href={link.path} target="_blank" rel="noopener noreferrer">
                          {link.label}
                          <ExternalLink size={14} />
                        </a>
                      ) : link.path.startsWith('mailto:') || link.path.startsWith('#') ? (
                        <a href={link.path}>{link.label}</a>
                      ) : (
                        <Link to={link.path}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <div className="footer-bottom-left">
              <p className="copyright">
                &copy; {currentYear} KnowledgeDB Inc. All rights reserved.
              </p>
              <p className="license">
                Released under <Link to="/license">MIT License</Link>
              </p>
            </div>

            {/* Social Links */}
            <div className="footer-social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title={social.label}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <div className="footer-bottom-right">
              <p className="made-with">
                Made with <Heart size={14} /> by the KnowledgeDB team
              </p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="footer-status-bar">
            <div className="status-item">
              <span className="status-indicator online"></span>
              <span>API Operational</span>
            </div>
            <div className="status-item">
              <span className="status-indicator online"></span>
              <span>All Systems Green</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
