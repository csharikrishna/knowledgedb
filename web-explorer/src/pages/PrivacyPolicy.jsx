import React from 'react';
import Header from '../components/Header';
import { Lock } from 'lucide-react';
import './Pages.css';

export default function PrivacyPolicy() {
  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="Privacy Policy"
        subtitle="Last updated: February 28, 2026. How we collect, use, and protect your data"
        showCTA={false}
        height="auto"
      />

      {/* Content */}
      <section className="section">
        <div className="container">
          <div className="legal-content">
            <section className="policy-section">
              <h2>1. Introduction</h2>
              <p>KnowledgeDB ("Company", "we", "our", "us") operates the KnowledgeDB service ("Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.</p>
              <p>We use your data to provide and improve our services. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this privacy policy, terms used in this privacy policy have the same meanings as in our Terms of Service.</p>
            </section>

            <section className="policy-section">
              <h2>2. Information Collection and Use</h2>
              <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
              
              <h3>2.1 Types of Data Collected</h3>
              <ul className="policy-list">
                <li><strong>Personal Data:</strong> Email address, first and last name, phone number, address, cookies and usage data</li>
                <li><strong>Usage Data:</strong> Pages visited, time and date of visit, time spent on pages, device information, browser type</li>
                <li><strong>Location Data:</strong> We may request access to your location with your permission</li>
                <li><strong>Knowledge Base Data:</strong> Documents, text, metadata you upload to KnowledgeDB</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>3. Use of Data</h2>
              <p>KnowledgeDB uses the collected data for various purposes:</p>
              <ul className="policy-list">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To allow you to participate in interactive features when you choose to</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor usage of our service</li>
                <li>To detect, prevent and address technical and security issues</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>4. Security of Data</h2>
              <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.</p>
              <ul className="policy-list">
                <li>End-to-end encryption for stored data</li>
                <li>TLS/SSL encryption for data in transit</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and role-based permissions</li>
                <li>Audit logs for all data access</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>5. Changes to This Privacy Policy</h2>
              <p>We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "effective date" at the top of this privacy policy.</p>
              <p>You are advised to review this privacy policy periodically for any changes. Changes to this privacy policy are effective when they are posted on this page.</p>
            </section>

            <section className="policy-section">
              <h2>6. Contact Us</h2>
              <p>If you have any questions about this privacy policy, please contact us at:</p>
              <ul className="policy-list">
                <li>Email: privacy@knowledgedb.com</li>
                <li>Website: https://www.knowledgedb.com/contact</li>
                <li>Mailing Address: KnowledgeDB Inc., 123 Tech Street, San Francisco, CA 94105</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>7. GDPR & Data Subject Rights</h2>
              <p>If you are located in the EU, you have the following rights under GDPR:</p>
              <ul className="policy-list">
                <li>Right to access your personal data</li>
                <li>Right to rectify inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
              <p>To exercise these rights, please contact our Data Protection Officer at dpo@knowledgedb.com.</p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
