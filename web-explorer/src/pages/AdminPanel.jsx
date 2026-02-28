import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, Database, Clock } from 'lucide-react';
import './Pages.css';

function AdminPanel({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [token]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Admin Panel</h1>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : stats ? (
        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <Users size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
              <Database size={24} color="#8b5cf6" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Databases</div>
              <div className="stat-value">{stats.totalDatabases || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <BarChart3 size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Documents</div>
              <div className="stat-value">{stats.totalDocuments || 0}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="section">
          <p className="empty-state">Failed to load admin stats</p>
        </div>
      )}

      <div className="section">
        <h2>System Status</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '6px'
          }}>
            <span>API Server</span>
            <span className="badge badge-success">Online</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '6px'
          }}>
            <span>Data Storage</span>
            <span className="badge badge-success">Accessible</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '6px'
          }}>
            <span>Graph Engine</span>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
