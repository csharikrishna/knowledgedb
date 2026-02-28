import React, { useState } from 'react';
import api from '../services/api';

export default function Settings() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState({ text: '', ok: false });
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();
    setMsg({ text: '', ok: false });
    if (newPw !== confirmPw) {
      setMsg({ text: 'Passwords do not match', ok: false });
      return;
    }
    if (newPw.length < 8) {
      setMsg({ text: 'Password must be at least 8 characters', ok: false });
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: currentPw, newPassword: newPw });
      setMsg({ text: 'Password updated successfully', ok: true });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Failed to update password', ok: false });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', outline: 'none', fontSize: 13 };
  const labelStyle = { color: '#94a3b8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 };

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 24 }}>Settings</h2>

      <div style={{ background: '#1e293b', borderRadius: 8, padding: 24, border: '1px solid #334155', maxWidth: 480 }}>
        <h3 style={{ color: '#e2e8f0', marginBottom: 16, fontSize: 15 }}>Change Password</h3>

        {msg.text && (
          <div style={{
            background: msg.ok ? '#22c55e20' : '#ef444420',
            color: msg.ok ? '#22c55e' : '#ef4444',
            padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 16
          }}>{msg.text}</div>
        )}

        <form onSubmit={handleChange}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Current Password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required style={inputStyle} />
          </div>
          <button type="submit" disabled={loading}
            style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 24px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div style={{ background: '#1e293b', borderRadius: 8, padding: 24, border: '1px solid #334155', maxWidth: 480, marginTop: 24 }}>
        <h3 style={{ color: '#ef4444', marginBottom: 8, fontSize: 15 }}>Danger Zone</h3>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Deleting your account will permanently remove all your databases and data.</p>
        <button onClick={() => {
          if (window.confirm('Are you absolutely sure? This will delete your account and ALL data permanently.')) {
            api.delete('/auth/account').then(() => {
              localStorage.removeItem('kdb_token');
              window.location.href = '/login';
            }).catch(() => alert('Failed to delete account'));
          }
        }} style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
