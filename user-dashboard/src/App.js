import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyDatabases from './pages/MyDatabases';
import DatabaseDetail from './pages/DatabaseDetail';
import APIKeys from './pages/APIKeys';
import UsageStats from './pages/UsageStats';
import Settings from './pages/Settings';

const isLoggedIn = () => !!localStorage.getItem('kdb_token');

function Sidebar() {
  const nav = useNavigate();
  const links = [
    { to: '/', label: 'Databases' },
    { to: '/api-keys', label: 'API Keys' },
    { to: '/usage', label: 'Usage Stats' },
    { to: '/settings', label: 'Settings' },
  ];
  return (
    <div style={{ width: 220, background: '#1e293b', padding: '20px 0', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #334155', marginBottom: 16 }}>
        <h2 style={{ color: '#38bdf8', fontSize: 18, fontWeight: 700 }}>KnowledgeDB</h2>
        <p style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>Developer Console</p>
      </div>
      {links.map(l => (
        <Link key={l.to} to={l.to} style={{ color: '#cbd5e1', textDecoration: 'none', padding: '10px 20px', fontSize: 14, display: 'block' }}>
          {l.label}
        </Link>
      ))}
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid #334155' }}>
        <button onClick={() => { localStorage.removeItem('kdb_token'); nav('/login'); }}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>
          Logout
        </button>
      </div>
    </div>
  );
}

function ProtectedLayout({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedLayout><MyDatabases /></ProtectedLayout>} />
        <Route path="/db/:dbName" element={<ProtectedLayout><DatabaseDetail /></ProtectedLayout>} />
        <Route path="/api-keys" element={<ProtectedLayout><APIKeys /></ProtectedLayout>} />
        <Route path="/usage" element={<ProtectedLayout><UsageStats /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
