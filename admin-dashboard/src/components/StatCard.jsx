import React from 'react';

export default function StatCard({ label, value, icon, color = '#38bdf8' }) {
  return (
    <div style={{
      background: '#1e293b', borderRadius: 12, padding: 20,
      border: '1px solid #334155', minWidth: 180
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{ color, fontSize: 28, fontWeight: 700 }}>{value}</span>
      </div>
      <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>{label}</p>
    </div>
  );
}
