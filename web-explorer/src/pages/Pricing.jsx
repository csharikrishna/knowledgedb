import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import './Pages.css';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'Forever',
      description: 'Perfect for learning and prototyping',
      features: [
        '1,000 API calls/month',
        'Single database',
        'Basic search (vector only)',
        'Community support',
        'Public data only',
        'No audit logs'
      ],
      cta: 'Start for Free',
      ctaLink: '/dashboard',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      description: 'For production applications',
      features: [
        '100,000 API calls/month',
        'Unlimited databases',
        'Hybrid search (BM25 + Vector)',
        'GraphRAG + Q&A',
        'Priority email support',
        'Audit logs',
        'Private data support',
        'Custom metadata fields',
        'API rate limit: 1,000 req/min',
        'Web UI dashboard'
      ],
      cta: 'Upgrade to Pro',
      ctaLink: '/dashboard',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large-scale deployments',
      features: [
        'Unlimited API calls',
        'Unlimited databases',
        'All Pro features',
        '24/7 phone & email support',
        'Dedicated account manager',
        'Custom SLAs',
        'SSO / SAML',
        'Custom deployment options',
        'Data residency guarantees',
        'Advanced security features'
      ],
      cta: 'Contact Sales',
      ctaLink: 'mailto:sales@knowledgedb.com',
      highlighted: false
    }
  ];

  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="Simple, Transparent Pricing"
        subtitle="Choose the plan that's right for your project. No credit card required to start."
        showCTA={true}
        ctaText="Start for Free"
        ctaLink="/login"
        height="auto"
      />

      {/* Pricing Toggle */}
      <section className="section">
        <div className="container">
          <div className="pricing-container">
            <div className="pricing-grid">
              {plans.map((plan, index) => (
                <div key={index} className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}>
                  {plan.highlighted && (
                    <div className="badge">
                      <Star size={16} /> Most Popular
                    </div>
                  )}
                  <h3>{plan.name}</h3>
                  <div className="price-section">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  
                  <Link to={plan.ctaLink} className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                    {plan.cta}
                  </Link>

                  <div className="features-list">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="feature-item">
                        <Check size={20} color="#10b981" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            <details className="faq-item">
              <summary>Can I upgrade or downgrade anytime?</summary>
              <p>Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades are applied at the next billing cycle.</p>
            </details>
            <details className="faq-item">
              <summary>What happens when I exceed my API call limit?</summary>
              <p>We'll notify you when you're approaching your limit. You can upgrade anytime. Your service won't be interrupted; we'll charge you per additional call at the overage rate.</p>
            </details>
            <details className="faq-item">
              <summary>Is there a setup fee?</summary>
              <p>No! There are no setup fees, hidden charges, or long-term contracts required. You only pay for what you use.</p>
            </details>
            <details className="faq-item">
              <summary>Do you offer annual billing discounts?</summary>
              <p>Yes! Annual billing comes with a 20% discount. Contact sales@knowledgedb.com for more details.</p>
            </details>
            <details className="faq-item">
              <summary>Can I self-host KnowledgeDB?</summary>
              <p>Absolutely! KnowledgeDB is open source under the MIT License. You can self-host it for free. We also offer managed hosting with additional features.</p>
            </details>
            <details className="faq-item">
              <summary>What payment methods do you accept?</summary>
              <p>We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and wire transfers for Enterprise customers.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Detailed Feature Comparison</h2>
          </div>

          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Starter</th>
                  <th>Pro</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>API Calls/Month</td>
                  <td>1,000</td>
                  <td>100,000</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Databases</td>
                  <td>1</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Vector Search</td>
                  <td className="yes">✓</td>
                  <td className="yes">✓</td>
                  <td className="yes">✓</td>
                </tr>
                <tr>
                  <td>Hybrid Search</td>
                  <td className="no">✗</td>
                  <td className="yes">✓</td>
                  <td className="yes">✓</td>
                </tr>
                <tr>
                  <td>GraphRAG + Q&A</td>
                  <td className="no">✗</td>
                  <td className="yes">✓</td>
                  <td className="yes">✓</td>
                </tr>
                <tr>
                  <td>Audit Logs</td>
                  <td className="no">✗</td>
                  <td className="yes">✓</td>
                  <td className="yes">✓</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td>Community</td>
                  <td>Email (24h)</td>
                  <td>Phone + Email (24/7)</td>
                </tr>
                <tr>
                  <td>SLA</td>
                  <td className="no">None</td>
                  <td>99.5%</td>
                  <td>99.9%+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to get started?</h2>
            <p>Create your free account and start building in minutes</p>
            <Link to="/dashboard" className="btn btn-primary">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
