import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, RefreshCw, BarChart3 } from 'lucide-react';
import './Pages.css';

function GraphExplorer({ token, userId, dbName }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    if (dbName) loadGraph();
  }, [dbName, token]);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get(`http://localhost:5000/db/${dbName}/graph/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(statsRes.data);
      setGraphData({
        nodes: Array.from({ length: statsRes.data.nodeCount }, (_, i) => ({
          id: `node_${i}`,
          label: `Entity ${i}`,
          size: Math.random() * 15 + 8
        })),
        links: Array.from({ length: statsRes.data.edgeCount }, (_, i) => ({
          source: `node_${Math.floor(Math.random() * statsRes.data.nodeCount)}`,
          target: `node_${Math.floor(Math.random() * statsRes.data.nodeCount)}`
        }))
      });
    } catch (err) {
      console.error('Failed to load graph:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchNodes = async () => {
    if (!searchTerm) return;
    try {
      const res = await axios.get(`http://localhost:5000/db/${dbName}/graph/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.nodes.length > 0) {
        setSelected(res.data.nodes[0]);
      }
    } catch (err) {
      console.error('Search failed:', err.message);
    }
  };

  if (!dbName) {
    return <div className="page"><p className="empty-state">Please select a database first</p></div>;
  }

  return (
    <div className="page">
      <h1>Knowledge Graph Explorer</h1>

      <div className="section">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchNodes()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={searchNodes}>
            <Search size={18} />
          </button>
          <button className="btn btn-secondary" onClick={loadGraph}>
            <RefreshCw size={18} />
          </button>
        </div>

        {stats && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            📊 {stats.nodeCount} entities • {stats.edgeCount} relationships • Density: {stats.density?.toFixed(3)}
          </div>
        )}
      </div>

      <div className="section" style={{ height: '600px', position: 'relative' }}>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeCanvasObject={(node, ctx) => {
              const label = node.label;
              const fontSize = 12;
              ctx.font = `${fontSize}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = selected?.id === node.id ? '#3b82f6' : 'rgba(226, 232, 240, 0.8)';
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.size || 5, 0, 2 * Math.PI);
              ctx.fill();
              ctx.fillStyle = '#e2e8f0';
              ctx.fillText(label, node.x, node.y);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.size * 1.5, 0, 2 * Math.PI);
              ctx.fill();
            }}
            onNodeClick={(node) => setSelected(node)}
            backgroundColor="rgba(15, 23, 42, 0.8)"
          />
        )}
      </div>

      {selected && (
        <div className="section">
          <h3>Selected Entity</h3>
          <p><strong>ID:</strong> {selected.id}</p>
          <p><strong>Label:</strong> {selected.label}</p>
          <p><strong>Type:</strong> {selected.type || 'Entity'}</p>
        </div>
      )}
    </div>
  );
}

export default GraphExplorer;
