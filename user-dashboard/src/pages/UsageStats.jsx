import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function UsageStats() {
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/db').then(r => {
      const dbs = r.data.databases || [];
      setDatabases(dbs);
      if (dbs.length > 0) setSelectedDb(dbs[0].name);
    });
  }, []);

  useEffect(() => {
    if (!selectedDb) return;
    api.get(`/db/${selectedDb}`).then(r => setStats(r.data)).catch(() => {});
  }, [selectedDb]);

  const chartData = stats && stats.collections
    ? (Array.isArray(stats.collections) ? stats.collections : Object.entries(stats.collections).map(([name, count]) => ({ name, count })))
    : [];

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 24 }}>Usage Statistics</h2>

      <div style={{ marginBottom: 24 }}>
        <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginRight: 8 }}>Database:</label>
        <select value={selectedDb} onChange={e => setSelectedDb(e.target.value)}
          style={{ padding: '6px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', cursor: 'pointer', outline: 'none' }}>
          {databases.map(db => <option key={db.name} value={db.name}>{db.name}</option>)}
        </select>
      </div>

      {stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Collections', value: Array.isArray(stats.collections) ? stats.collections.length : Object.keys(stats.collections || {}).length, color: '#38bdf8' },
              { label: 'Graph Nodes', value: stats.graph?.nodes || 0, color: '#a78bfa' },
              { label: 'Graph Edges', value: stats.graph?.edges || 0, color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ background: '#1e293b', borderRadius: 8, padding: 20, border: '1px solid #334155' }}>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: 28, fontWeight: 700 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, border: '1px solid #334155' }}>
              <h3 style={{ color: '#e2e8f0', marginBottom: 16, fontSize: 15 }}>Documents per Collection</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
