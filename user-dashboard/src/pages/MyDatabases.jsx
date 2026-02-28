import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function MyDatabases() {
  const [databases, setDatabases] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/db').then(r => setDatabases(r.data.databases || []));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/db', { name: newName });
      setNewName('');
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create database');
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete database "${name}"? This cannot be undone.`)) return;
    await api.delete(`/db/${name}`);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9' }}>My Databases</h2>
        <button onClick={() => setShowCreate(!showCreate)}
          style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
          + New Database
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: '#1e293b', padding: 16, borderRadius: 8, border: '1px solid #334155', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="database_name"
            style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', outline: 'none' }} />
          <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Create</button>
          <button type="button" onClick={() => setShowCreate(false)} style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          {error && <span style={{ color: '#ef4444', fontSize: 13 }}>{error}</span>}
        </form>
      )}

      {databases.length === 0 ? (
        <div style={{ background: '#1e293b', borderRadius: 8, padding: 48, textAlign: 'center', border: '1px solid #334155' }}>
          <p style={{ color: '#64748b', marginBottom: 8 }}>No databases yet.</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Create your first database to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {databases.map(db => (
            <div key={db.name} style={{ background: '#1e293b', borderRadius: 8, padding: 20, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Link to={`/db/${db.name}`} style={{ color: '#38bdf8', fontSize: 17, fontWeight: 600, textDecoration: 'none' }}>
                  {db.name}
                </Link>
                <button onClick={() => handleDelete(db.name)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>Delete</button>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>
                {db.collections || 0} collections &middot; Created {new Date(db.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
