import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function APIKeys() {
  const [keys, setKeys] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', database: '', scopes: 'read,write', collections: '' });
  const [newKey, setNewKey] = useState(null);
  const [error, setError] = useState('');
  const [databases, setDatabases] = useState([]);

  const load = () => {
    api.get('/auth/api-keys').then(r => setKeys(r.data.apiKeys || []));
    api.get('/db').then(r => setDatabases(r.data.databases || []));
  };

  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = {
        name: form.name,
        database: form.database,
        scopes: form.scopes.split(',').map(s => s.trim()),
        collections: form.collections ? form.collections.split(',').map(s => s.trim()) : []
      };
      const res = await api.post('/auth/api-keys', body);
      setNewKey(res.data.apiKey);
      setShowCreate(false);
      setForm({ name: '', database: '', scopes: 'read,write', collections: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create key');
    }
  };

  const handleRevoke = async (keyId) => {
    if (!window.confirm('Revoke this API key?')) return;
    await api.delete(`/auth/api-keys/${keyId}`);
    load();
  };

  const inputStyle = { padding: '8px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', outline: 'none', fontSize: 13, width: '100%' };
  const labelStyle = { color: '#94a3b8', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 3 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9' }}>API Keys</h2>
        <button onClick={() => setShowCreate(!showCreate)}
          style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
          + Create Key
        </button>
      </div>

      {newKey && (
        <div style={{ background: '#22c55e20', border: '1px solid #22c55e', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <p style={{ color: '#22c55e', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>API Key Created — Save it now!</p>
          <code style={{ color: '#e2e8f0', fontSize: 13, wordBreak: 'break-all', background: '#0f172a', padding: '8px 12px', borderRadius: 4, display: 'block' }}>{newKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(newKey); }} style={{ marginTop: 8, background: '#334155', color: '#cbd5e1', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Copy</button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: '#1e293b', padding: 20, borderRadius: 8, border: '1px solid #334155', marginBottom: 20 }}>
          {error && <div style={{ background: '#ef444420', color: '#ef4444', padding: '6px 10px', borderRadius: 4, fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={labelStyle}>Key Name</label><input value={form.name} onChange={set('name')} required style={inputStyle} placeholder="My API Key" /></div>
            <div><label style={labelStyle}>Database</label>
              <select value={form.database} onChange={set('database')} required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select...</option>
                {databases.map(db => <option key={db.name} value={db.name}>{db.name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Scopes (comma-sep)</label><input value={form.scopes} onChange={set('scopes')} style={inputStyle} placeholder="read,write,delete" /></div>
            <div><label style={labelStyle}>Collections (empty = all)</label><input value={form.collections} onChange={set('collections')} style={inputStyle} placeholder="users,posts" /></div>
          </div>
          <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Generate Key</button>
        </form>
      )}

      {keys.length === 0 ? (
        <p style={{ color: '#64748b' }}>No API keys created yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Name', 'Database', 'Scopes', 'Created', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.keyId} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 12px', color: '#e2e8f0', fontSize: 13 }}>{k.name}</td>
                  <td style={{ padding: '10px 12px', color: '#38bdf8', fontSize: 13 }}>{k.database}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>{(k.scopes || []).join(', ')}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => handleRevoke(k.keyId)}
                      style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
