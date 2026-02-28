import React from 'react';
import Header from '../components/Header';
import { Code } from 'lucide-react';
import './Pages.css';

export default function License() {
  return (
    <div className="page-container">
      {/* Innovative Header */}
      <Header 
        title="MIT License"
        subtitle="Open source and free to use, modify, and distribute"
        showCTA={true}
        ctaText="View on GitHub"
        ctaLink="https://github.com/knowledgedb/knowledgedb"
        height="auto"
      />

      {/* Content */}
      <section className="section">
        <div className="container">
          <div className="license-content">
            <div className="license-box">
              <pre><code>{`MIT License

Copyright (c) 2024-2025 KnowledgeDB Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}</code></pre>
            </div>

            <section className="license-section">
              <h2>What This License Means</h2>
              <p>The MIT License is one of the most permissive open source licenses available. Here's what you can do:</p>
              
              <div className="license-grid">
                <div className="license-item">
                  <h3>✓ Use Commercially</h3>
                  <p>You can use KnowledgeDB in commercial products and services</p>
                </div>
                <div className="license-item">
                  <h3>✓ Modify</h3>
                  <p>You can change the code and make improvements</p>
                </div>
                <div className="license-item">
                  <h3>✓ Distribute</h3>
                  <p>You can share and distribute the software</p>
                </div>
                <div className="license-item">
                  <h3>✓ Private Use</h3>
                  <p>You can use it for private projects</p>
                </div>
                <div className="license-item">
                  <h3>✗ Liability</h3>
                  <p>We provide no warranty or liability for the software</p>
                </div>
                <div className="license-item">
                  <h3>✓ Attribution</h3>
                  <p>Include the license and copyright notice in your project</p>
                </div>
              </div>
            </section>

            <section className="license-section">
              <h2>Contributing to KnowledgeDB</h2>
              <p>We welcome contributions from the community! Here's how to get started:</p>
              <ul className="license-list">
                <li><strong>Fork the repository:</strong> Create your own copy on GitHub</li>
                <li><strong>Create a branch:</strong> Make your changes in a feature branch</li>
                <li><strong>Commit changes:</strong> Write clear, descriptive commit messages</li>
                <li><strong>Submit a pull request:</strong> We'll review and merge your contribution</li>
              </ul>
              <p><a href="https://github.com/knowledgedb/knowledgedb" target="_blank" rel="noopener noreferrer" className="link">
                View on GitHub →
              </a></p>
            </section>

            <section className="license-section">
              <h2>Third-Party Licenses</h2>
              <p>KnowledgeDB uses several open source libraries. Here are key dependencies:</p>
              <div className="dependencies-table">
                <table>
                  <thead>
                    <tr>
                      <th>Library</th>
                      <th>License</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Express</td>
                      <td>MIT</td>
                      <td>Web framework</td>
                    </tr>
                    <tr>
                      <td>React</td>
                      <td>MIT</td>
                      <td>Frontend framework</td>
                    </tr>
                    <tr>
                      <td>MongoDB</td>
                      <td>SSPL</td>
                      <td>Database</td>
                    </tr>
                    <tr>
                      <td>LangChain</td>
                      <td>MIT</td>
                      <td>LLM orchestration</td>
                    </tr>
                    <tr>
                      <td>Axios</td>
                      <td>MIT</td>
                      <td>HTTP client</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="license-section">
              <h2>Questions About The License?</h2>
              <p>If you have questions about the MIT License or how it applies to your use case, please contact us:</p>
              <ul className="license-list">
                <li>Email: legal@knowledgedb.com</li>
                <li>GitHub Issues: https://github.com/knowledgedb/knowledgedb/issues</li>
                <li>Discord Community: https://discord.gg/knowledgedb</li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
