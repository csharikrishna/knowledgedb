import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import './Pages.css';

function MemoryBrowser({ token, userId, dbName }) {
  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [role, setRole] = useState('user');
  const [recallQuery, setRecallQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (sessionId) loadMemories();
  }, [sessionId, token, dbName]);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/db/${dbName}/memory/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemories(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load memories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const storeMemory = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/db/${dbName}/memory/${sessionId}`,
        { role, content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewContent('');
      loadMemories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to store memory');
    }
  };

  const recallMemories = async (e) => {
    e.preventDefault();
    if (!recallQuery.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/db/${dbName}/memory/${sessionId}/recall`,
        { query: recallQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(res.data.memories || []);
    } catch (err) {
      console.error('Recall failed:', err.message);
    }
  };

  const deleteSession = async () => {
    if (window.confirm('Delete all memories in this session?')) {
      try {
        await axios.delete(
          `http://localhost:5000/db/${dbName}/memory/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMemories([]);
        setSessionId(`session-${Date.now()}`);
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete session');
      }
    }
  };

  if (!dbName) {
    return <div className="page"><p className="empty-state">Please select a database first</p></div>;
  }

  return (
    <div className="page">
      <h1>Memory Browser</h1>

      <div className="section">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Session ID</label>
            <input
              type="text"
              className="form-input"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={loadMemories}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-danger" onClick={deleteSession}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        <div>
          <div className="section">
            <h2>Store Memory</h2>
            <form onSubmit={storeMemory}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="assistant">Assistant</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-textarea"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="What should the agent remember?"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={18} /> Store
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="section">
            <h2>Recall Memories</h2>
            <form onSubmit={recallMemories}>
              <div className="form-group">
                <label className="form-label">Search Query</label>
                <input
                  type="text"
                  className="form-input"
                  value={recallQuery}
                  onChange={(e) => setRecallQuery(e.target.value)}
                  placeholder="What do you want to remember?"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Search Memories
              </button>
            </form>
            {searchResults.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <strong>Results ({searchResults.length})</strong>
                {searchResults.map((mem, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '10px',
                      borderRadius: '4px',
                      marginTop: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ color: 'var(--primary)', marginBottom: '4px' }}>
                      Relevance: {(mem.relevance * 100).toFixed(0)}%
                    </div>
                    <div>{mem.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Session Memories ({memories.length})</h2>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : memories.length === 0 ? (
          <p className="empty-state">No memories yet. Start storing them above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {memories.map((mem, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${mem.role === 'user' ? '#3b82f6' : '#10b981'}`
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <strong>{mem.role?.toUpperCase()}</strong> • {new Date(mem.createdAt).toLocaleString()}
                </div>
                <p style={{ margin: 0 }}>{mem.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemoryBrowser;
