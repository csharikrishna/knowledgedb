import React, { useState } from 'react';
import axios from 'axios';
import { Send, Copy, Check } from 'lucide-react';
import './Pages.css';

function GraphRAGTester({ token, userId, dbName }) {
  const [question, setQuestion] = useState('');
  const [contextDepth, setContextDepth] = useState(2);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:5000/db/${dbName}/ask`,
        { question, contextDepth, limit: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data);
    } catch (err) {
      console.error('Ask failed:', err.message);
      alert(err.response?.data?.error || 'Failed to generate context');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (results?.contextChunks) {
      const text = results.contextChunks.map((c, i) => `${i + 1}. ${c.text}`).join('\n\n');
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!dbName) {
    return <div className="page"><p className="empty-state">Please select a database first</p></div>;
  }

  return (
    <div className="page">
      <h1>GraphRAG - Context Generator</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Ask a question and get LLM-ready context chunks extracted from your knowledge base.
      </p>

      <div className="section">
        <form onSubmit={askQuestion}>
          <div className="form-group">
            <label className="form-label">Your Question</label>
            <input
              type="text"
              className="form-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask any question about your knowledge..."
            />
          </div>

          <div className="grid grid-2" style={{ marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label">Context Depth</label>
              <input
                type="number"
                className="form-input"
                value={contextDepth}
                onChange={(e) => setContextDepth(parseInt(e.target.value))}
                min="1"
                max="5"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            <Send size={18} /> {loading ? 'Generating...' : 'Ask Question'}
          </button>
        </form>
      </div>

      {results && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Context Chunks ({results.contextChunks.length})</h2>
            <button className="btn btn-sm btn-secondary" onClick={copyToClipboard}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            💡 These chunks are formatted for LLM system prompts. Copy and use as context for your AI model.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {results.contextChunks.map((chunk, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-tertiary)',
                padding: '15px',
                borderRadius: '8px',
                borderLeft: '4px solid var(--primary)'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--primary)',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Relevance: {(chunk.relevance * 100).toFixed(0)}%
                </div>
                <div style={{ lineHeight: '1.6' }}>{chunk.text}</div>
              </div>
            ))}
          </div>

          {results.graphPath && results.graphPath.length > 0 && (
            <div className="section">
              <h3>Entity Connection Path</h3>
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '15px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                overflow: 'auto'
              }}>
                {results.graphPath.join(' → ')}
              </div>
            </div>
          )}

          {results.sourceDocuments && results.sourceDocuments.length > 0 && (
            <div className="section">
              <h3>Source Documents ({results.sourceDocuments.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.sourceDocuments.slice(0, 3).map((doc, idx) => (
                  <div key={idx} style={{
                    background: 'var(--bg-tertiary)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}>
                    <div style={{ marginBottom: '6px', color: 'var(--primary)' }}>
                      📄 {doc._id}
                    </div>
                    <pre style={{ margin: 0, fontSize: '11px', overflow: 'auto', maxHeight: '100px' }}>
                      {JSON.stringify(doc, null, 2).substring(0, 200)}...
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GraphRAGTester;
