import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/admin/users/${userId}`).then(r => setUser(r.data));
  }, [userId]);

  if (!user) return <p style={{ color: '#94a3b8' }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 8 }}>User: {user.username}</h2>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>ID: {user.userId} | Created: {new Date(user.createdAt).toLocaleDateString()}</p>

      <h3 style={{ color: '#e2e8f0', marginBottom: 16 }}>Databases ({user.databases?.length || 0})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
        {user.databases?.map(db => (
          <div key={db.dbName} style={{
            background: '#1e293b', borderRadius: 8, padding: 16,
            border: '1px solid #334155', cursor: 'pointer'
          }} onClick={() => navigate(`/databases/${userId}/${db.dbName}`)}>
            <h4 style={{ color: '#38bdf8' }}>{db.dbName}</h4>
            <p style={{ color: '#64748b', fontSize: 12 }}>Created: {new Date(db.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
