const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON, getGraphPath } = require('../utils/fileHandler');
const {
  bfsTraverse, shortestPath, searchNodes, graphStats, processInsert
} = require('../utils/graphEngine');

exports.getNodes = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    res.json({ count: graph.nodes.length, nodes: graph.nodes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get nodes', details: err.message });
  }
};

exports.getEdges = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    res.json({ count: graph.edges.length, edges: graph.edges });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get edges', details: err.message });
  }
};

exports.getStats = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    res.json(graphStats(graph));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get graph stats', details: err.message });
  }
};

exports.getNode = (req, res) => {
  try {
    const { userId, dbName, entityId } = req.params;
    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };

    const node = graph.nodes.find(n => n.id === entityId);
    if (!node) return res.status(404).json({ error: 'Node not found' });

    const connectedEdges = graph.edges.filter(e => e.from === entityId || e.to === entityId);
    const connectedNodeIds = connectedEdges.map(e => e.from === entityId ? e.to : e.from);
    const connectedNodes = graph.nodes.filter(n => connectedNodeIds.includes(n.id));

    res.json({ node, connectedNodes, edges: connectedEdges });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get node', details: err.message });
  }
};

exports.searchGraph = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    const nodes = searchNodes(q, graph);

    res.json({ nodes: nodes.map(n => ({ id: n.id, label: n.label, type: n.type, collection: n.collection })) });
  } catch (err) {
    res.status(500).json({ error: 'Graph search failed', details: err.message });
  }
};

exports.traverse = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { startNode, depth = 2 } = req.body;

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    const subgraph = bfsTraverse(startNode, graph, depth);

    res.json({ subgraph: { nodes: subgraph.nodes, edges: subgraph.edges }, visitedCount: subgraph.visitedCount });
  } catch (err) {
    res.status(500).json({ error: 'Traversal failed', details: err.message });
  }
};

exports.findPath = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { from, to } = req.body;

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    const result = shortestPath(from, to, graph);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Path finding failed', details: err.message });
  }
};

exports.createLink = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { fromLabel, toLabel, relation } = req.body;

    const graphPath = getGraphPath(userId, dbName);
    const graph = readJSON(graphPath) || { nodes: [], edges: [] };

    // Find or create from node
    let fromNode = graph.nodes.find(n => n.label.toLowerCase() === fromLabel.toLowerCase());
    if (!fromNode) {
      fromNode = {
        id: 'node_' + uuidv4().replace(/-/g, '').substring(0, 12),
        label: fromLabel,
        type: 'ENTITY',
        field: 'manual',
        collection: 'manual',
        docId: null,
        properties: {},
        createdAt: new Date().toISOString()
      };
      graph.nodes.push(fromNode);
    }

    // Find or create to node
    let toNode = graph.nodes.find(n => n.label.toLowerCase() === toLabel.toLowerCase());
    if (!toNode) {
      toNode = {
        id: 'node_' + uuidv4().replace(/-/g, '').substring(0, 12),
        label: toLabel,
        type: 'ENTITY',
        field: 'manual',
        collection: 'manual',
        docId: null,
        properties: {},
        createdAt: new Date().toISOString()
      };
      graph.nodes.push(toNode);
    }

    const edgeId = 'edge_' + uuidv4().replace(/-/g, '').substring(0, 12);
    graph.edges.push({
      id: edgeId,
      from: fromNode.id,
      to: toNode.id,
      relation,
      weight: 1,
      auto: false,
      createdAt: new Date().toISOString()
    });

    writeJSON(graphPath, graph);

    res.status(201).json({ edgeId, from: fromLabel, to: toLabel, relation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create link', details: err.message });
  }
};

exports.deleteLink = (req, res) => {
  try {
    const { userId, dbName, edgeId } = req.params;
    const graphPath = getGraphPath(userId, dbName);
    const graph = readJSON(graphPath) || { nodes: [], edges: [] };

    const idx = graph.edges.findIndex(e => e.id === edgeId);
    if (idx === -1) return res.status(404).json({ error: 'Edge not found' });

    graph.edges.splice(idx, 1);
    writeJSON(graphPath, graph);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete link', details: err.message });
  }
};

// JWT-based convenience methods

exports.traverseByNodeId = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, nodeId } = req.params;
    const depth = parseInt(req.query.depth) || 2;

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    const subgraph = bfsTraverse(nodeId, graph, depth);

    res.json({ subgraph: { nodes: subgraph.nodes, edges: subgraph.edges }, visitedCount: subgraph.visitedCount });
  } catch (err) {
    res.status(500).json({ error: 'Traversal failed', details: err.message });
  }
};

exports.findPathByParams = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName } = req.params;
    const { from, to } = req.params;

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    const result = shortestPath(from, to, graph);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Path finding failed', details: err.message });
  }
};
