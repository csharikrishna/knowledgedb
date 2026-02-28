import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Databases() {
  const { userId } = useParams();
  const [dbs, setDbs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/admin/databases/${userId}`).then(r => setDbs(r.data.databases));
  }, [userId]);

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 24 }}>Databases for {userId}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {dbs.map(db => (
          <div key={db.dbName} style={{
            background: '#1e293b', borderRadius: 12, padding: 20,
            border: '1px solid #334155'
          }}>
            <h3 style={{ color: '#38bdf8', marginBottom: 8 }}>{db.dbName}</h3>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Storage: {db.storageMB} MB</p>
            <p style={{ color: '#64748b', fontSize: 12 }}>Created: {new Date(db.createdAt).toLocaleDateString()}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => navigate(`/databases/${userId}/${db.dbName}`)}
                style={{ background: '#334155', color: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                Browse
              </button>
              <button onClick={() => navigate(`/graph/${userId}/${db.dbName}`)}
                style={{ background: '#334155', color: '#a78bfa', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                Graph
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
