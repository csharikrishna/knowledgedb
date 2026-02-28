const BM25Engine = require('../utils/bm25Engine');
const { fuseScores } = require('../utils/hybridSearch');
const { graphScore, bfsTraverse } = require('../utils/graphEngine');
const { readJSON, getCollectionPath, getGraphPath, listFiles, getDbDir } = require('../utils/fileHandler');

const bm25 = new BM25Engine();

exports.hybridSearch = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const query = req.body.query || req.body.q;
    const mode = req.body.mode || 'hybrid';
    const targetCollections = req.body.collections || (req.body.collection ? [req.body.collection] : null);
    const graphDepth = req.body.graphDepth || 2;
    const limit = req.body.limit || 10;

    if (!query) return res.status(400).json({ error: 'Query is required (pass "query" or "q" in body)' });

    const dbDir = getDbDir(userId, dbName);
    const allFiles = listFiles(dbDir).filter(f => f.endsWith('.json'));
    const collectionNames = targetCollections ||
      allFiles.map(f => f.replace('.json', ''));

    // Gather all documents across collections
    const allDocs = [];
    for (const coll of collectionNames) {
      const docs = readJSON(getCollectionPath(userId, dbName, coll)) || [];
      docs.forEach(doc => allDocs.push({ ...doc, _collection: coll }));
    }

    if (allDocs.length === 0) {
      return res.json({ results: [], total: 0 });
    }

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };

    let results;

    if (mode === 'keyword') {
      const kwResults = bm25.score(query, allDocs);
      results = kwResults.slice(0, limit).map(r => ({
        document: r.doc,
        collection: r.doc._collection,
        scores: { keyword: Math.round(r.score * 100) / 100, graph: 0, hybrid: Math.round(r.score * 100) / 100 }
      }));
    } else if (mode === 'graph') {
      const grResults = graphScore(query, graph, allDocs);
      results = grResults.slice(0, limit).map(r => ({
        document: r.doc,
        collection: r.doc._collection,
        scores: { keyword: 0, graph: Math.round(r.score * 100) / 100, hybrid: Math.round(r.score * 100) / 100 }
      }));
    } else {
      // hybrid
      const kwResults = bm25.score(query, allDocs).map(r => ({
        ...r,
        collection: r.doc._collection
      }));
      const grResults = graphScore(query, graph, allDocs).map(r => ({
        ...r,
        collection: r.doc._collection
      }));
      results = fuseScores(kwResults, grResults).slice(0, limit);
    }

    // Clean _collection from output
    results.forEach(r => {
      if (r.document) delete r.document._collection;
    });

    res.json({ results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
};

exports.ask = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { question, contextDepth = 3, collections: targetCollections, limit = 10 } = req.body;

    const dbDir = getDbDir(userId, dbName);
    const allFiles = listFiles(dbDir).filter(f => f.endsWith('.json'));
    const collectionNames = targetCollections ||
      allFiles.map(f => f.replace('.json', ''));

    // Gather documents
    const allDocs = [];
    for (const coll of collectionNames) {
      const docs = readJSON(getCollectionPath(userId, dbName, coll)) || [];
      docs.forEach(doc => allDocs.push({ ...doc, _collection: coll }));
    }

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };

    // BM25 search
    const kwResults = bm25.score(question, allDocs).map(r => ({ ...r, collection: r.doc._collection }));
    const grResults = graphScore(question, graph, allDocs).map(r => ({ ...r, collection: r.doc._collection }));
    const fusedResults = fuseScores(kwResults, grResults).slice(0, limit);

    // Build context chunks from graph paths
    const queryTokens = question.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    const matchingNodes = graph.nodes.filter(n =>
      queryTokens.some(t => n.label.toLowerCase().includes(t))
    );

    const contextChunks = [];
    const graphPaths = [];

    for (const node of matchingNodes.slice(0, 5)) {
      const subgraph = bfsTraverse(node.label, graph, contextDepth);
      const pathLabels = subgraph.nodes.map(n => n.label);
      graphPaths.push(...pathLabels);

      // Build text description from subgraph
      for (const edge of subgraph.edges) {
        const fromNode = subgraph.nodes.find(n => n.id === edge.from);
        const toNode = subgraph.nodes.find(n => n.id === edge.to);
        if (fromNode && toNode) {
          contextChunks.push({
            text: `${fromNode.label} (${fromNode.collection}) → ${edge.relation} → ${toNode.label} (${toNode.collection})`,
            relevance: 0.9,
            sourceDocId: fromNode.docId || toNode.docId
          });
        }
      }
    }

    // Add document-based chunks
    for (const result of fusedResults.slice(0, 5)) {
      const doc = result.document;
      const text = Object.entries(doc)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      contextChunks.push({
        text,
        relevance: result.scores.hybrid,
        sourceDocId: doc._id
      });
    }

    // Deduplicate and sort
    const uniqueChunks = contextChunks
      .filter((c, i, arr) => arr.findIndex(x => x.text === c.text) === i)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    const sourceDocuments = fusedResults.map(r => {
      const doc = { ...r.document };
      delete doc._collection;
      return doc;
    });

    res.json({
      contextChunks: uniqueChunks,
      graphPath: [...new Set(graphPaths)],
      sourceDocuments,
      usage: 'Paste contextChunks as system prompt context for your LLM'
    });
  } catch (err) {
    res.status(500).json({ error: 'Ask failed', details: err.message });
  }
};
