import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Plus, FileText, BarChart3 } from 'lucide-react';
import './Pages.css';

function Dashboard({ token, userId, dbName, onDbSelect }) {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDbName, setNewDbName] = useState('');
  const [stats, setStats] = useState(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiDetails, setApiDetails] = useState(null);

  useEffect(() => {
    loadDatabases();
  }, [token]);

  const loadDatabases = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/db', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatabases(res.data.databases || []);
    } catch (err) {
      console.error('Failed to load databases:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDatabase = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/db', { name: newDbName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Show API details modal
      setApiDetails({
        dbName: newDbName,
        apiEndpoint: res.data.apiEndpoint,
        apiKey: res.data.apiKey,
        warning: res.data.warning
      });
      setShowApiModal(true);
      
      setNewDbName('');
      loadDatabases();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create database');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const selectDatabase = async (db) => {
    onDbSelect(db.dbName);
    localStorage.setItem('dbName', db.dbName);
    try {
      const res = await axios.get(`http://localhost:5000/db/${db.dbName}/graph/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      setStats(null);
    }
  };

  return (
    <div className="page">
      {showApiModal && apiDetails && (
        <div className="modal-overlay" onClick={() => setShowApiModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ Database Created Successfully!</h2>
              <button className="modal-close" onClick={() => setShowApiModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="api-info-section">
                <div className="warning-box">
                  <strong>⚠️ {apiDetails.warning}</strong>
                </div>
                
                <div className="api-field">
                  <label>Database Name:</label>
                  <div className="api-value">
                    <code>{apiDetails.dbName}</code>
                  </div>
                </div>

                <div className="api-field">
                  <label>API Endpoint:</label>
                  <div className="api-value">
                    <code>{apiDetails.apiEndpoint}</code>
                    <button className="btn-copy" onClick={() => copyToClipboard(apiDetails.apiEndpoint)}>Copy</button>
                  </div>
                </div>

                <div className="api-field">
                  <label>API Key:</label>
                  <div className="api-value">
                    <code className="api-key">{apiDetails.apiKey}</code>
                    <button className="btn-copy" onClick={() => copyToClipboard(apiDetails.apiKey)}>Copy</button>
                  </div>
                </div>

                <div className="usage-example">
                  <label>Example Usage:</label>
                  <pre><code>{`curl -X POST ${apiDetails.apiEndpoint}/collection \\\n  -H "Authorization: Bearer ${apiDetails.apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "example"}'`}</code></pre>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowApiModal(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
      
      <h1>Dashboard</h1>
      
      <div className="section">
        <h2>Create New Database</h2>
        <form onSubmit={createDatabase} className="form-inline">
          <input
            type="text"
            className="form-input"
            placeholder="Database name (no spaces)"
            value={newDbName}
            onChange={(e) => setNewDbName(e.target.value)}
            pattern="[a-zA-Z0-9_-]+"
            required
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> Create
          </button>
        </form>
      </div>

      <div className="section">
        <h2>Your Databases</h2>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : databases.length === 0 ? (
          <p className="empty-state">No databases yet. Create one above!</p>
        ) : (
          <div className="grid grid-2">
            {databases.map((db) => (
              <div key={db.dbId} className="db-card" onClick={() => selectDatabase(db)}>
                <div className="db-header">
                  <Database size={24} />
                  <h3>{db.dbName}</h3>
                </div>
                <p className="db-created">Created {new Date(db.createdAt).toLocaleDateString()}</p>
                <div className="db-actions">
                  <span className="badge badge-info">Ready</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dbName && stats && (
        <div className="section">
          <h2>Quick Stats for {dbName}</h2>
          <div className="grid grid-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <FileText size={24} color="#3b82f6" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Entities</div>
                <div className="stat-value">{stats.nodeCount || 0}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <BarChart3 size={24} color="#8b5cf6" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Relationships</div>
                <div className="stat-value">{stats.edgeCount || 0}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <Database size={24} color="#10b981" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Density</div>
                <div className="stat-value">{(stats.density || 0).toFixed(3)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
