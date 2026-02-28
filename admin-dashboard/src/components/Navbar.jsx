import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div style={{
      height: 56, background: '#1e293b', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: '1px solid #334155'
    }}>
      <span style={{ color: '#94a3b8', fontSize: 14 }}>KnowledgeDB Admin Dashboard</span>
      <button onClick={logout} style={{
        background: '#ef4444', color: '#fff', border: 'none',
        padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13
      }}>
        Logout
      </button>
    </div>
  );
}
