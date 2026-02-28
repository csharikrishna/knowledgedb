import React, { useState } from 'react';
import axios from 'axios';
import { Search, Send } from 'lucide-react';
import './Pages.css';

function SearchInterface({ token, userId, dbName }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('hybrid');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const performSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:5000/db/${dbName}/search`,
        { query, mode, limit: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Search failed:', err.message);
      alert(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (!dbName) {
    return <div className="page"><p className="empty-state">Please select a database first</p></div>;
  }

  return (
    <div className="page">
      <h1>Search</h1>

      <div className="section">
        <form onSubmit={performSearch}>
          <div style={{ marginBottom: '15px' }}>
            <label className="form-label">Search Query</label>
            <input
              type="text"
              className="form-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your knowledge base..."
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label className="form-label">Search Mode</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['keyword', 'graph', 'hybrid'].map((m) => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value={m}
                    checked={mode === m}
                    onChange={(e) => setMode(e.target.value)}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{m}</span>
                </label>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              <strong>Keyword:</strong> Traditional BM25 search • 
              <strong> Graph:</strong> Entity relationships • 
              <strong> Hybrid:</strong> Both combined
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            <Search size={18} /> {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="section">
          <h2>Results ({results.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((result, idx) => (
              <div key={idx} className="result-card">
                <div className="result-header" onClick={() => setExpanded(expanded === idx ? null : idx)}>
                  <h4 style={{ margin: 0 }}>{result.document?.name || result.document?._id}</h4>
                  <div className="score-badges">
                    <span className="badge badge-info">Hybrid: {(result.scores.hybrid * 100).toFixed(0)}%</span>
                  </div>
                </div>
                {expanded === idx && (
                  <div className="result-details">
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Scores:</strong>
                      <div style={{ fontSize: '12px', marginTop: '6px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <div>Keyword: {(result.scores.keyword * 100).toFixed(1)}%</div>
                        <div>Graph: {(result.scores.graph * 100).toFixed(1)}%</div>
                        <div>Hybrid: {(result.scores.hybrid * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <strong>Content:</strong>
                    <pre style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
                      {JSON.stringify(result.document, null, 2).substring(0, 300)}...
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="section">
          <p className="empty-state">No results found for "{query}"</p>
        </div>
      )}

      <style>{`
        .result-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .result-header {
          padding: 15px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
        }

        .result-header:hover {
          background: var(--bg-secondary);
        }

        .score-badges {
          display: flex;
          gap: 8px;
        }

        .result-details {
          padding: 15px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
}

export default SearchInterface;
