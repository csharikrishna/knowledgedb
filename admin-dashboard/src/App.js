import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Databases from './pages/Databases';
import CollectionViewer from './pages/CollectionViewer';
import GraphView from './pages/GraphView';
import WebhookLogs from './pages/WebhookLogs';
import SystemHealth from './pages/SystemHealth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const isLoggedIn = () => !!localStorage.getItem('admin_token');

function ProtectedLayout({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/users" element={<ProtectedLayout><Users /></ProtectedLayout>} />
        <Route path="/users/:userId" element={<ProtectedLayout><UserDetail /></ProtectedLayout>} />
        <Route path="/databases/:userId" element={<ProtectedLayout><Databases /></ProtectedLayout>} />
        <Route path="/databases/:userId/:dbName" element={<ProtectedLayout><CollectionViewer /></ProtectedLayout>} />
        <Route path="/graph/:userId/:dbName" element={<ProtectedLayout><GraphView /></ProtectedLayout>} />
        <Route path="/webhooks" element={<ProtectedLayout><WebhookLogs /></ProtectedLayout>} />
        <Route path="/health" element={<ProtectedLayout><SystemHealth /></ProtectedLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
