import React from 'react';
import Header from '../components/Header';
import { FileText } from 'lucide-react';
import './Pages.css';

export default function TermsOfService() {
  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="Terms of Service"
        subtitle="Last updated: February 28, 2026. Please read these terms carefully before using KnowledgeDB"
        showCTA={false}
        height="auto"
      />

      {/* Content */}
      <section className="section">
        <div className="container">
          <div className="legal-content">
            <section className="policy-section">
              <h2>1. Agreement to Terms</h2>
              <p>By accessing and using the KnowledgeDB website and service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section className="policy-section">
              <h2>2. Use Restrictions</h2>
              <p>You agree not to use the KnowledgeDB service:</p>
              <ul className="policy-list">
                <li>To transmit any unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable material</li>
                <li>To upload any viruses or malicious code</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                <li>To engage in any conduct that violates any applicable laws or regulations</li>
                <li>To attempt to gain unauthorized access to protected portions of the Service</li>
                <li>To use the Service for commercial purposes without explicit permission</li>
                <li>To resell or redistribute the Service without permission</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>3. Free Trial & Paid Services</h2>
              <h3>3.1 Free Trial</h3>
              <p>We may offer a free trial of the Service. Your access to the Service is limited to 1,000 API calls per month. You may be required to enter valid payment information to sign up for a free trial.</p>
              
              <h3>3.2 Paid Services</h3>
              <p>If you choose to upgrade to a paid plan, you will be charged according to your selected plan. All charges are exclusive of applicable taxes. Payment is required in advance.</p>
              
              <h3>3.3 Billing & Cancellation</h3>
              <p>You may cancel your paid subscription at any time. Cancellation is effective at the end of your billing cycle. We do not provide refunds for partial months.</p>
            </section>

            <section className="policy-section">
              <h2>4. Intellectual Property Rights</h2>
              <p>The Service contains material which is owned by or licensed to KnowledgeDB. This material includes, but is not limited to, the design, layout, appearance and graphics.</p>
              <p>Reproduction is prohibited, unless otherwise stated. Intellectual Property contained on this Service is protected by law, including but not limited to, in the United States and abroad.</p>
              <p>You retain all intellectual property rights to data you upload to KnowledgeDB. We have the right to use your data solely to provide the Service.</p>
            </section>

            <section className="policy-section">
              <h2>5. Links to Third Party Websites</h2>
              <p>The Service may contain links to third party websites. KnowledgeDB is not responsible for the content of linked third-party sites and does not make any representations about such external sites. Your use of third-party websites is at your own risk and subject to the terms and conditions of use for such websites.</p>
            </section>

            <section className="policy-section">
              <h2>6. Limitation of Liability</h2>
              <p>The Service is provided on an "as is" and "as available" basis. We make no warranty or representation with respect to the completeness, security, validity, reliability, quality, accuracy or availability of the Service.</p>
              <p>To the fullest extent permitted by law, we disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.</p>
              <p>In no event shall KnowledgeDB be liable for any damages arising from your use of or inability to use the Service, including but not limited to direct, indirect, incidental, special, consequential or punitive damages.</p>
            </section>

            <section className="policy-section">
              <h2>7. Indemnification</h2>
              <p>You agree to indemnify and hold harmless KnowledgeDB, its officers, directors, employees, and agents from any and all claims, damages, losses, liabilities, costs and expenses (including reasonable attorneys' fees) arising out of or related to:</p>
              <ul className="policy-list">
                <li>Your use of the Service</li>
                <li>Violation of these Terms of Service</li>
                <li>Violation of any third-party rights</li>
                <li>Content you upload or share</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>8. Termination</h2>
              <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach the Terms of Service.</p>
              <p>Upon termination, your right to use the Service will immediately cease. We will not be liable to you for damages of any kind as a result of termination.</p>
            </section>

            <section className="policy-section">
              <h2>9. Changes to Terms</h2>
              <p>KnowledgeDB reserves the right to make changes to these Terms of Service at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. Your continued use of the Service following the posting of revised Terms of Service means that you accept and agree to the changes.</p>
            </section>

            <section className="policy-section">
              <h2>10. Governing Law</h2>
              <p>These Terms of Service and all related policies are governed by and construed in accordance with the laws of California, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
            </section>

            <section className="policy-section">
              <h2>11. Contact Information</h2>
              <p>If you have questions about these Terms of Service, please contact us at:</p>
              <ul className="policy-list">
                <li>Email: legal@knowledgedb.com</li>
                <li>Website: https://www.knowledgedb.com/contact</li>
                <li>Mailing Address: KnowledgeDB Inc., 123 Tech Street, San Francisco, CA 94105</li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
