import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/admin/login', { username, password });
      localStorage.setItem('admin_token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f172a'
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#1e293b', borderRadius: 12, padding: 32,
        border: '1px solid #334155', width: 360
      }}>
        <h1 style={{ color: '#38bdf8', marginBottom: 8, fontSize: 24 }}>🧠 KnowledgeDB</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Admin Login</p>
        {error && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: 13 }}>{error}</p>}
        <input
          value={username} onChange={e => setUsername(e.target.value)}
          placeholder="Username" required
          style={{
            width: '100%', padding: 12, marginBottom: 12, borderRadius: 8,
            border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0'
          }}
        />
        <input
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password" type="password" required
          style={{
            width: '100%', padding: 12, marginBottom: 20, borderRadius: 8,
            border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0'
          }}
        />
        <button type="submit" style={{
          width: '100%', padding: 12, borderRadius: 8, background: '#38bdf8',
          color: '#0f172a', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 15
        }}>Login</button>
      </form>
    </div>
  );
}
