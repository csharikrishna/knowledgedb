const { v4: uuidv4 } = require('uuid');

// Fields that signal entity candidates
const ENTITY_FIELD_HINTS = [
  'name', 'title', 'company', 'email', 'author', 'user',
  'owner', 'tag', 'category', 'manager', 'team', 'project',
  'assignee', 'creator', 'department', 'role', 'organization',
  'client', 'vendor', 'partner', 'supervisor', 'lead'
];

function generateNodeId() {
  return 'node_' + uuidv4().replace(/-/g, '').substring(0, 12);
}

function generateEdgeId() {
  return 'edge_' + uuidv4().replace(/-/g, '').substring(0, 12);
}

/**
 * Extract entity nodes from a document based on field name hints
 */
function extractEntities(document, collection) {
  const entities = [];
  for (const [field, value] of Object.entries(document)) {
    if (field.startsWith('_')) continue; // skip metadata
    if (typeof value === 'string') {
      if (value.length < 2 || value.length > 100) continue;
      const isHinted = ENTITY_FIELD_HINTS.some(h => field.toLowerCase().includes(h));
      if (isHinted) {
        entities.push({
          id: generateNodeId(),
          label: value,
          type: 'ENTITY',
          field,
          collection,
          docId: document._id,
          properties: {},
          createdAt: new Date().toISOString()
        });
      }
    }
    // Handle arrays of strings (e.g., tags: ["react", "node"])
    if (Array.isArray(value)) {
      const isHinted = ENTITY_FIELD_HINTS.some(h => field.toLowerCase().includes(h));
      if (isHinted) {
        value.filter(v => typeof v === 'string' && v.length >= 2 && v.length <= 100).forEach(v => {
          entities.push({
            id: generateNodeId(),
            label: v,
            type: 'ENTITY',
            field,
            collection,
            docId: document._id,
            properties: {},
            createdAt: new Date().toISOString()
          });
        });
      }
    }
  }
  return entities;
}

/**
 * Detect edges between new nodes and existing nodes by matching labels
 */
function detectEdges(newNodes, existingNodes) {
  const edges = [];
  for (const newNode of newNodes) {
    for (const existing of existingNodes) {
      if (newNode.id === existing.id) continue;
      if (newNode.docId === existing.docId && newNode.field === existing.field) continue;
      if (newNode.label.toLowerCase() === existing.label.toLowerCase()) {
        // Check if this edge already exists
        edges.push({
          id: generateEdgeId(),
          from: existing.id,
          to: newNode.id,
          relation: `${newNode.field}_matches_${existing.field}`,
          weight: 1,
          auto: true,
          createdAt: new Date().toISOString()
        });
      }
    }
  }
  return edges;
}

/**
 * Create edges between nodes within the same document
 */
function createIntraDocumentEdges(nodes) {
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].docId === nodes[j].docId) {
        edges.push({
          id: generateEdgeId(),
          from: nodes[i].id,
          to: nodes[j].id,
          relation: `${nodes[i].field}_in_${nodes[j].field}`,
          weight: 1,
          auto: true,
          createdAt: new Date().toISOString()
        });
      }
    }
  }
  return edges;
}

/**
 * Process a document insert — extract entities, detect edges, update graph
 */
function processInsert(document, collection, graph) {
  const newNodes = extractEntities(document, collection);
  if (newNodes.length === 0) return graph;

  // Deduplicate: if a node with same label+field+collection exists, reuse
  const actualNewNodes = [];
  for (const node of newNodes) {
    const existing = graph.nodes.find(
      n => n.label.toLowerCase() === node.label.toLowerCase() &&
           n.field === node.field &&
           n.collection === node.collection
    );
    if (!existing) {
      actualNewNodes.push(node);
    }
  }

  // Detect cross-document edges (label matching)
  const crossEdges = detectEdges(newNodes, graph.nodes);

  // Create intra-document edges
  const intraEdges = createIntraDocumentEdges([...actualNewNodes, ...graph.nodes.filter(n => n.docId === document._id)]);

  graph.nodes.push(...actualNewNodes);
  graph.edges.push(...crossEdges, ...intraEdges);

  return graph;
}

/**
 * Process a document delete — remove related nodes and edges
 */
function processDelete(docId, graph) {
  const nodeIds = graph.nodes.filter(n => n.docId === docId).map(n => n.id);
  graph.edges = graph.edges.filter(e => !nodeIds.includes(e.from) && !nodeIds.includes(e.to));
  graph.nodes = graph.nodes.filter(n => n.docId !== docId);
  return graph;
}

/**
 * BFS traversal from a starting label up to maxDepth hops
 */
function bfsTraverse(startLabel, graph, maxDepth = 2) {
  const startNode = graph.nodes.find(n =>
    n.label.toLowerCase() === startLabel.toLowerCase()
  );
  if (!startNode) return { nodes: [], edges: [], visitedCount: 0 };

  const visited = new Set([startNode.id]);
  const resultNodes = [startNode];
  const resultEdges = [];
  let frontier = [startNode.id];

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextFrontier = [];
    for (const nodeId of frontier) {
      const connectedEdges = graph.edges.filter(
        e => e.from === nodeId || e.to === nodeId
      );
      for (const edge of connectedEdges) {
        const neighborId = edge.from === nodeId ? edge.to : edge.from;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          nextFrontier.push(neighborId);
          resultEdges.push(edge);
          const neighborNode = graph.nodes.find(n => n.id === neighborId);
          if (neighborNode) resultNodes.push(neighborNode);
        }
      }
    }
    frontier = nextFrontier;
    if (frontier.length === 0) break;
  }

  return { nodes: resultNodes, edges: resultEdges, visitedCount: visited.size };
}

/**
 * Shortest path between two labels using BFS
 */
function shortestPath(fromLabel, toLabel, graph) {
  const fromNode = graph.nodes.find(n => n.label.toLowerCase() === fromLabel.toLowerCase());
  const toNode = graph.nodes.find(n => n.label.toLowerCase() === toLabel.toLowerCase());

  if (!fromNode || !toNode) return { path: [], length: 0, found: false };
  if (fromNode.id === toNode.id) return { path: [fromNode.label], length: 0, found: true };

  const visited = new Set([fromNode.id]);
  const queue = [[fromNode.id, [fromNode.label]]];

  // Build adjacency info
  while (queue.length > 0) {
    const [currentId, pathSoFar] = queue.shift();

    const connectedEdges = graph.edges.filter(
      e => e.from === currentId || e.to === currentId
    );

    for (const edge of connectedEdges) {
      const neighborId = edge.from === currentId ? edge.to : edge.from;
      if (visited.has(neighborId)) continue;

      visited.add(neighborId);
      const neighborNode = graph.nodes.find(n => n.id === neighborId);
      if (!neighborNode) continue;

      const newPath = [...pathSoFar, edge.relation, neighborNode.label];

      if (neighborId === toNode.id) {
        return { path: newPath, length: Math.floor(newPath.length / 2), found: true };
      }

      queue.push([neighborId, newPath]);
    }
  }

  return { path: [], length: 0, found: false };
}

/**
 * Search nodes by label substring
 */
function searchNodes(query, graph) {
  const q = query.toLowerCase();
  return graph.nodes.filter(n => n.label.toLowerCase().includes(q));
}

/**
 * Graph statistics
 */
function graphStats(graph) {
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;
  const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2;
  const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;

  // Find most connected nodes
  const connectionCount = {};
  graph.edges.forEach(e => {
    connectionCount[e.from] = (connectionCount[e.from] || 0) + 1;
    connectionCount[e.to] = (connectionCount[e.to] || 0) + 1;
  });

  const topConnected = Object.entries(connectionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nodeId, count]) => {
      const node = graph.nodes.find(n => n.id === nodeId);
      return { nodeId, label: node?.label || 'Unknown', connections: count };
    });

  return { nodeCount, edgeCount, density: Math.round(density * 1000) / 1000, topConnected };
}

/**
 * Graph-based scoring for search — gives score based on connection proximity
 */
function graphScore(query, graph, documents) {
  const queryTokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const matchingNodes = graph.nodes.filter(n =>
    queryTokens.some(t => n.label.toLowerCase().includes(t))
  );

  if (matchingNodes.length === 0) return [];

  // Collect all docIds connected within 2 hops of matching nodes
  const docScores = {};
  for (const node of matchingNodes) {
    const subgraph = bfsTraverse(node.label, graph, 2);
    for (const n of subgraph.nodes) {
      if (n.docId) {
        docScores[n.docId] = (docScores[n.docId] || 0) + 1;
      }
    }
  }

  return documents
    .filter(doc => docScores[doc._id])
    .map(doc => ({ doc, score: docScores[doc._id] }))
    .sort((a, b) => b.score - a.score);
}

module.exports = {
  extractEntities,
  detectEdges,
  createIntraDocumentEdges,
  processInsert,
  processDelete,
  bfsTraverse,
  shortestPath,
  searchNodes,
  graphStats,
  graphScore
};
