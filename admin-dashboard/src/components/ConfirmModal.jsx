import React from 'react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 12, padding: 24,
        border: '1px solid #334155', maxWidth: 400, width: '90%'
      }}>
        <p style={{ color: '#f1f5f9', marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            background: '#334155', color: '#94a3b8', border: 'none',
            padding: '8px 16px', borderRadius: 6, cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            background: '#ef4444', color: '#fff', border: 'none',
            padding: '8px 16px', borderRadius: 6, cursor: 'pointer'
          }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
