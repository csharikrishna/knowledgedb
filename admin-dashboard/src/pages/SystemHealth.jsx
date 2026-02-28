import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = () => {
      api.get('/admin/health')
        .then(r => setHealth(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading...</p>;
  if (!health) return <p style={{ color: '#ef4444' }}>Failed to load health data.</p>;

  const memUsed = health.memory ? Math.round(health.memory.heapUsed / 1024 / 1024) : 0;
  const memTotal = health.memory ? Math.round(health.memory.heapTotal / 1024 / 1024) : 0;
  const memPercent = memTotal > 0 ? Math.round((memUsed / memTotal) * 100) : 0;

  const uptimeHours = health.uptime ? Math.round(health.uptime / 3600) : 0;
  const uptimeMins = health.uptime ? Math.round((health.uptime % 3600) / 60) : 0;

  const memoryHistory = (health.memoryHistory || []).map((m, i) => ({
    time: i,
    heap: Math.round(m / 1024 / 1024)
  }));

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 24 }}>System Health</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Status" value={health.status || 'OK'} color="#22c55e" />
        <StatCard label="Uptime" value={`${uptimeHours}h ${uptimeMins}m`} color="#38bdf8" />
        <StatCard label="Heap Used" value={`${memUsed} MB`} color="#a78bfa" />
        <StatCard label="Heap Usage" value={`${memPercent}%`} color={memPercent > 80 ? '#ef4444' : '#22c55e'} />
        <StatCard label="Node Version" value={health.nodeVersion || process.version} color="#94a3b8" />
        <StatCard label="Platform" value={health.platform || '—'} color="#94a3b8" />
      </div>

      {memoryHistory.length > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, border: '1px solid #334155' }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: 16, fontSize: 15 }}>Memory Usage (Heap MB)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={memoryHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Line type="monotone" dataKey="heap" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ marginTop: 24, background: '#1e293b', borderRadius: 8, padding: 20, border: '1px solid #334155' }}>
        <h3 style={{ color: '#e2e8f0', marginBottom: 12, fontSize: 15 }}>Process Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
          {[
            ['PID', health.pid],
            ['RSS', health.memory ? `${Math.round(health.memory.rss / 1024 / 1024)} MB` : '—'],
            ['External', health.memory ? `${Math.round(health.memory.external / 1024 / 1024)} MB` : '—'],
            ['Data Dir Size', health.dataDirSize || '—']
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ color: '#94a3b8' }}>{k}</span>
              <span style={{ color: '#e2e8f0' }}>{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
