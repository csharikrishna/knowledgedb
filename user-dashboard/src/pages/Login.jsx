import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('kdb_token', res.data.token);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1e293b', padding: 32, borderRadius: 12, width: 380, border: '1px solid #334155' }}>
        <h1 style={{ color: '#38bdf8', fontSize: 22, marginBottom: 4, textAlign: 'center' }}>KnowledgeDB</h1>
        <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>Sign in to your account</p>

        {error && <div style={{ background: '#ef444420', color: '#ef4444', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', marginBottom: 16, outline: 'none' }} />

        <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
          style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', marginBottom: 24, outline: 'none' }} />

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '10px 0', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
          Don't have an account? <Link to="/signup" style={{ color: '#38bdf8', textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
