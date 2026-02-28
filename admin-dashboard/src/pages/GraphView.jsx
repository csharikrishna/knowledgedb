import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../services/api';

export default function GraphView() {
  const { userId, dbName } = useParams();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    api.get(`/admin/databases/${userId}/${dbName}`)
      .then(r => {
        const raw = r.data.rawGraph;
        if (raw && raw.nodes) {
          const nodes = raw.nodes.map(n => ({
            id: n.id,
            label: n.label || n.id,
            type: n.type || 'entity',
            color: n.type === 'document' ? '#38bdf8' : '#a78bfa'
          }));
          const links = (raw.edges || []).map(e => ({
            source: e.source,
            target: e.target,
            label: e.relation || ''
          }));
          setGraphData({ nodes, links });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, dbName]);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.label || node.id;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.fillStyle = node.color || '#38bdf8';

    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, node.x, node.y + 7);
  }, []);

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading graph...</p>;

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: 8 }}>Knowledge Graph: {dbName}</h2>
      <p style={{ color: '#94a3b8', marginBottom: 16 }}>
        {graphData.nodes.length} nodes, {graphData.links.length} edges
      </p>

      {hoveredNode && (
        <div style={{
          background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
          padding: 12, marginBottom: 12, color: '#e2e8f0', fontSize: 13
        }}>
          <strong>{hoveredNode.label}</strong> — Type: {hoveredNode.type}, ID: {hoveredNode.id}
        </div>
      )}

      <div style={{
        background: '#0f172a', borderRadius: 8, border: '1px solid #334155',
        overflow: 'hidden', height: 'calc(100vh - 260px)'
      }}>
        {graphData.nodes.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ color: '#64748b' }}>No graph data. Insert documents to build the graph.</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeCanvasObject={nodeCanvasObject}
            linkColor={() => '#475569'}
            linkWidth={1}
            backgroundColor="#0f172a"
            onNodeHover={setHoveredNode}
            cooldownTicks={100}
            onEngineStop={() => fgRef.current?.zoomToFit(400)}
          />
        )}
      </div>
    </div>
  );
}
