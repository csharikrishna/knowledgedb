import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function WebhookLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/webhooks/logs')
      .then(r => setLogs(r.data.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (code) => {
    if (code >= 200 && code < 300) return '#22c55e';
    if (code >= 400) return '#ef4444';
    return '#f59e0b';
  };

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 24 }}>Webhook Delivery Logs</h2>

      {logs.length === 0 ? (
        <p style={{ color: '#64748b' }}>No webhook deliveries yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Time', 'URL', 'Event', 'Status', 'Duration'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 100).map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', fontSize: 13 }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#38bdf8', fontSize: 13, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.url}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#cbd5e1', fontSize: 13 }}>
                    {log.event}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>
                    <span style={{
                      background: statusColor(log.statusCode) + '20',
                      color: statusColor(log.statusCode),
                      padding: '2px 8px', borderRadius: 4, fontSize: 12
                    }}>
                      {log.statusCode || (log.success ? '200' : 'ERR')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 13 }}>
                    {log.duration ? `${log.duration}ms` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
