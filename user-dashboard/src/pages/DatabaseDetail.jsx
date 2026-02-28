import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function DatabaseDetail() {
  const { dbName } = useParams();
  const [collections, setCollections] = useState([]);
  const [graphStats, setGraphStats] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newColl, setNewColl] = useState('');
  const [selectedColl, setSelectedColl] = useState(null);
  const [docs, setDocs] = useState([]);
  const [insertJson, setInsertJson] = useState('');
  const [error, setError] = useState('');

  const loadCollections = async () => {
    try {
      const r = await api.get(`/db/${dbName}`);
      setCollections(r.data.collections || []);
    } catch {}
  };

  const loadGraph = async () => {
    try {
      const r = await api.get(`/db/${dbName}/graph/stats`);
      setGraphStats(r.data);
    } catch {}
  };

  const loadDocs = async (coll) => {
    setSelectedColl(coll);
    try {
      const r = await api.post(`/db/${dbName}/${coll}/query`, { filter: {} });
      setDocs(r.data.documents || []);
    } catch {}
  };

  useEffect(() => { loadCollections(); loadGraph(); }, [dbName]);

  const handleCreateColl = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/db/${dbName}/${newColl}`, {});
      setNewColl('');
      setShowCreate(false);
      loadCollections();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    }
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const doc = JSON.parse(insertJson);
      await api.post(`/db/${dbName}/${selectedColl}`, doc);
      setInsertJson('');
      loadDocs(selectedColl);
      loadGraph();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid JSON or insert failed');
    }
  };

  const handleDeleteDoc = async (id) => {
    await api.delete(`/db/${dbName}/${selectedColl}/${id}`);
    loadDocs(selectedColl);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>&larr; Back</Link>
        <h2 style={{ color: '#f1f5f9' }}>{dbName}</h2>
      </div>

      {graphStats && (
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
          Graph: {graphStats.nodes || 0} nodes, {graphStats.edges || 0} edges
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h3 style={{ color: '#e2e8f0', fontSize: 15 }}>Collections</h3>
        <button onClick={() => setShowCreate(!showCreate)}
          style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          + Add
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateColl} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={newColl} onChange={e => setNewColl(e.target.value)} placeholder="collection_name"
            style={{ padding: '6px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', outline: 'none' }} />
          <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Create</button>
        </form>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {collections.map(c => (
          <button key={c.name || c} onClick={() => loadDocs(c.name || c)}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #334155', cursor: 'pointer', fontSize: 13, fontWeight: selectedColl === (c.name || c) ? 600 : 400,
              background: selectedColl === (c.name || c) ? '#334155' : '#1e293b', color: selectedColl === (c.name || c) ? '#38bdf8' : '#cbd5e1' }}>
            {c.name || c} ({c.count ?? '?'})
          </button>
        ))}
      </div>

      {error && <div style={{ background: '#ef444420', color: '#ef4444', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {selectedColl && (
        <>
          <form onSubmit={handleInsert} style={{ marginBottom: 20 }}>
            <textarea value={insertJson} onChange={e => setInsertJson(e.target.value)} rows={3}
              placeholder='{"name": "Alice", "role": "engineer"}'
              style={{ width: '100%', padding: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13, outline: 'none', resize: 'vertical' }} />
            <button type="submit" style={{ marginTop: 8, background: '#38bdf8', color: '#0f172a', border: 'none', padding: '6px 16px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              Insert Document
            </button>
          </form>

          <h4 style={{ color: '#e2e8f0', marginBottom: 12, fontSize: 14 }}>Documents ({docs.length})</h4>
          {docs.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>No documents in this collection.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.map(doc => (
                <div key={doc._id} style={{ background: '#1e293b', borderRadius: 6, padding: 12, border: '1px solid #334155', position: 'relative' }}>
                  <button onClick={() => handleDeleteDoc(doc._id)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 11 }}>DEL</button>
                  <pre style={{ color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(doc, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
