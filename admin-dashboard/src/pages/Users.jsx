import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const load = () => api.get('/admin/users').then(r => setUsers(r.data.users));
  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    await api.delete(`/admin/users/${deleteTarget.userId}`);
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 24 }}>Users</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155' }}>
            {['User ID', 'Username', 'Created', 'Actions'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: 12, color: '#94a3b8', fontSize: 13 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId} style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#e2e8f0', fontSize: 13 }}>{u.userId}</td>
              <td style={{ padding: 12, color: '#38bdf8', cursor: 'pointer' }}
                  onClick={() => navigate(`/users/${u.userId}`)}>{u.username}</td>
              <td style={{ padding: 12, color: '#94a3b8', fontSize: 13 }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: 12 }}>
                <button onClick={() => navigate(`/databases/${u.userId}`)}
                  style={{ background: '#334155', color: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', marginRight: 8, fontSize: 12 }}>
                  Databases
                </button>
                <button onClick={() => setDeleteTarget(u)}
                  style={{ background: '#334155', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {deleteTarget && (
        <ConfirmModal
          message={`Delete user "${deleteTarget.username}" and all their databases?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
