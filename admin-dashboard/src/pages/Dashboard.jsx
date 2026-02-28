import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <p style={{ color: '#94a3b8' }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 24 }}>System Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard label="Total Databases" value={stats.totalDatabases} icon="🗄️" />
        <StatCard label="Total Documents" value={stats.totalDocuments} icon="📄" />
        <StatCard label="Graph Nodes" value={stats.totalNodes} icon="🔵" color="#a78bfa" />
        <StatCard label="Graph Edges" value={stats.totalEdges} icon="🔗" color="#a78bfa" />
        <StatCard label="SSE Clients" value={stats.sseClients} icon="⚡" color="#fbbf24" />
        <StatCard label="Uptime" value={stats.uptime} icon="⏱️" color="#34d399" />
        <StatCard label="Memory Usage" value={`${stats.memory?.usedMB || 0} MB`} icon="💾" color="#fb923c" />
      </div>
    </div>
  );
}
