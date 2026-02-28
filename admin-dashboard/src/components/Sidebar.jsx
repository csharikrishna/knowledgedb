import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/webhooks', label: 'Webhook Logs', icon: '🔔' },
  { path: '/health', label: 'System Health', icon: '💚' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      width: 220, background: '#1e293b', padding: '20px 0',
      borderRight: '1px solid #334155', flexShrink: 0
    }}>
      <div style={{ padding: '0 20px', marginBottom: 30 }}>
        <h2 style={{ color: '#38bdf8', fontSize: 18 }}>🧠 KnowledgeDB</h2>
        <p style={{ color: '#64748b', fontSize: 12 }}>Admin Panel</p>
      </div>
      {menuItems.map(item => (
        <div
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            padding: '12px 20px', cursor: 'pointer',
            background: location.pathname === item.path ? '#334155' : 'transparent',
            borderLeft: location.pathname === item.path ? '3px solid #38bdf8' : '3px solid transparent',
            color: location.pathname === item.path ? '#f1f5f9' : '#94a3b8',
            fontSize: 14, display: 'flex', alignItems: 'center', gap: 10
          }}
        >
          <span>{item.icon}</span> {item.label}
        </div>
      ))}
    </div>
  );
}
