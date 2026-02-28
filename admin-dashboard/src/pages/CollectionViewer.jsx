import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function CollectionViewer() {
  const { userId, dbName } = useParams();
  const [dbDetail, setDbDetail] = useState(null);
  const [selectedColl, setSelectedColl] = useState(null);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    api.get(`/admin/databases/${userId}/${dbName}`).then(r => setDbDetail(r.data));
  }, [userId, dbName]);

  const loadDocs = async (coll) => {
    setSelectedColl(coll);
    // Use admin graph endpoint to view docs (we read from the admin API indirectly)
    // For now, show collection info. Full doc browsing would need additional admin endpoints.
    setDocs([]);
  };

  if (!dbDetail) return <p style={{ color: '#94a3b8' }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 8 }}>{dbName}</h2>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>
        Graph: {dbDetail.graph?.nodes || 0} nodes, {dbDetail.graph?.edges || 0} edges
      </p>

      <h3 style={{ color: '#e2e8f0', marginBottom: 16 }}>Collections</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {Object.entries(dbDetail.collections || {}).map(([name, count]) => (
          <div key={name} onClick={() => loadDocs(name)} style={{
            background: selectedColl === name ? '#334155' : '#1e293b',
            borderRadius: 8, padding: 16, border: '1px solid #334155', cursor: 'pointer'
          }}>
            <h4 style={{ color: '#38bdf8' }}>{name}</h4>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>{count} documents</p>
          </div>
        ))}
      </div>

      {selectedColl && (
        <div style={{ marginTop: 24, background: '#1e293b', borderRadius: 8, padding: 16, border: '1px solid #334155' }}>
          <h4 style={{ color: '#e2e8f0', marginBottom: 8 }}>Collection: {selectedColl}</h4>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            {dbDetail.collections[selectedColl]} documents stored.
            Use the API or SDK to query documents.
          </p>
        </div>
      )}
    </div>
  );
}
