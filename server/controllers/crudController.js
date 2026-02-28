const {
  readJSON, writeJSON, getCollectionPath, getGraphPath,
  getWebhooksPath, getTriggersPath, getIndexPath,
  getHistoryDir, getDocHistoryPath, ensureDir, listFiles, getDbDir
} = require('../utils/fileHandler');
const { addMetadata, validateDoc, buildIndex } = require('../utils/documentHelper');
const { queryDocuments, applyUpdate, matchDocument } = require('../utils/queryEngine');
const { processInsert, processDelete } = require('../utils/graphEngine');
const { broadcast } = require('../utils/sseManager');
const { fireWebhooks } = require('../utils/webhookDispatcher');
const { evaluateTriggers } = require('../utils/triggerEngine');
const IndexManager = require('../utils/indexManager');

exports.insertDocuments = async (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    let docs = req.body.documents || (req.body.document ? [req.body.document] : []);

    if (docs.length === 0) {
      return res.status(400).json({ error: 'No documents provided' });
    }

    const collPath = getCollectionPath(userId, dbName, collection);
    const existing = readJSON(collPath) || [];

    const insertedIds = [];
    const processedDocs = [];

    for (const doc of docs) {
      const { valid, error } = validateDoc(doc);
      if (!valid) return res.status(400).json({ error });

      const withMeta = addMetadata(doc);
      processedDocs.push(withMeta);
      insertedIds.push(withMeta._id);
    }

    existing.push(...processedDocs);
    writeJSON(collPath, existing);

    // Update index
    const indexPath = getIndexPath(userId, dbName);
    const index = readJSON(indexPath) || {};
    index[collection] = buildIndex(existing);
    writeJSON(indexPath, index);

    // Update knowledge graph
    const graphPath = getGraphPath(userId, dbName);
    let graph = readJSON(graphPath) || { nodes: [], edges: [] };
    for (const doc of processedDocs) {
      graph = processInsert(doc, collection, graph);
    }
    writeJSON(graphPath, graph);

    // Build vector indexes for semantic search
    const indexManager = new IndexManager();
    try {
      indexManager.createVectorIndex(userId, dbName, collection, existing);
      indexManager.createFieldIndex(userId, dbName, collection, existing);
    } catch (err) {
      console.error('Vector indexing failed:', err.message);
      // Don't fail the insert if indexing fails, just log it
    }

    // Initialize history directory
    const histDir = getHistoryDir(userId, dbName);
    ensureDir(histDir);

    // Fire webhooks
    const webhooks = readJSON(getWebhooksPath(userId, dbName)) || [];
    for (const doc of processedDocs) {
      fireWebhooks(webhooks, 'document.inserted', collection, doc);
      broadcast(userId, dbName, collection, 'insert', doc);
    }

    // Evaluate triggers
    const triggers = readJSON(getTriggersPath(userId, dbName)) || [];
    for (const doc of processedDocs) {
      await evaluateTriggers(triggers, 'document.inserted', collection, doc, userId, dbName);
    }

    res.status(201).json({ insertedCount: processedDocs.length, insertedIds });
  } catch (err) {
    res.status(500).json({ error: 'Insert failed', details: err.message });
  }
};

exports.findDocuments = (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const { query = {}, options = {} } = req.body;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    const { results, total } = queryDocuments(documents, query, options);

    res.json({ count: results.length, total, documents: results });
  } catch (err) {
    res.status(500).json({ error: 'Find failed', details: err.message });
  }
};

exports.updateDocuments = async (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const { query, update, multi = false } = req.body;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    let matchedCount = 0;
    let modifiedCount = 0;
    const histDir = getHistoryDir(userId, dbName);
    ensureDir(histDir);

    for (let i = 0; i < documents.length; i++) {
      if (matchDocument(documents[i], query)) {
        matchedCount++;

        // Save history snapshot
        const histPath = getDocHistoryPath(userId, dbName, documents[i]._id);
        const history = readJSON(histPath) || [];
        history.push({
          version: documents[i]._version || 0,
          snapshot: { ...documents[i] },
          changedAt: new Date().toISOString()
        });
        // Keep last 50 versions
        if (history.length > 50) history.splice(0, history.length - 50);
        writeJSON(histPath, history);

        // Apply update
        documents[i] = applyUpdate(documents[i], update);
        modifiedCount++;

        // Broadcast & webhooks
        broadcast(userId, dbName, collection, 'update', documents[i]);
        const webhooks = readJSON(getWebhooksPath(userId, dbName)) || [];
        fireWebhooks(webhooks, 'document.updated', collection, documents[i]);

        // Triggers
        const triggers = readJSON(getTriggersPath(userId, dbName)) || [];
        await evaluateTriggers(triggers, 'document.updated', collection, documents[i], userId, dbName);

        if (!multi) break;
      }
    }

    writeJSON(collPath, documents);

    // Rebuild index
    const indexPath = getIndexPath(userId, dbName);
    const index = readJSON(indexPath) || {};
    index[collection] = buildIndex(documents);
    writeJSON(indexPath, index);

    res.json({ matchedCount, modifiedCount });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

exports.deleteDocuments = async (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const { query, multi = false } = req.body;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    let deletedCount = 0;
    const remaining = [];
    const graphPath = getGraphPath(userId, dbName);
    let graph = readJSON(graphPath) || { nodes: [], edges: [] };
    const webhooks = readJSON(getWebhooksPath(userId, dbName)) || [];
    const triggers = readJSON(getTriggersPath(userId, dbName)) || [];

    for (const doc of documents) {
      if (matchDocument(doc, query) && (multi || deletedCount === 0)) {
        deletedCount++;
        graph = processDelete(doc._id, graph);
        fireWebhooks(webhooks, 'document.deleted', collection, doc);
        broadcast(userId, dbName, collection, 'delete', doc);
        await evaluateTriggers(triggers, 'document.deleted', collection, doc, userId, dbName);
      } else {
        remaining.push(doc);
      }
    }

    writeJSON(collPath, remaining);
    writeJSON(graphPath, graph);

    // Rebuild index
    const indexPath = getIndexPath(userId, dbName);
    const index = readJSON(indexPath) || {};
    index[collection] = buildIndex(remaining);
    writeJSON(indexPath, index);

    res.json({ deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
};

exports.countDocuments = (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const query = req.body.query || {};

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];
    const count = documents.filter(doc => matchDocument(doc, query)).length;

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Count failed', details: err.message });
  }
};

exports.listCollections = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const dbDir = getDbDir(userId, dbName);
    const files = listFiles(dbDir).filter(f => f.endsWith('.json'));
    const collections = files.map(f => f.replace('.json', ''));

    res.json({ collections });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list collections', details: err.message });
  }
};

exports.getDocHistory = (req, res) => {
  try {
    const { userId, dbName, collection, docId } = req.params;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];
    const doc = documents.find(d => d._id === docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const histPath = getDocHistoryPath(userId, dbName, docId);
    const history = readJSON(histPath) || [];

    res.json({ docId, currentVersion: doc._version || 1, history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get history', details: err.message });
  }
};

exports.rollbackDocument = (req, res) => {
  try {
    const { userId, dbName, collection, docId } = req.params;
    const { version } = req.body;

    const histPath = getDocHistoryPath(userId, dbName, docId);
    const history = readJSON(histPath) || [];
    const snapshot = history.find(h => h.version === version);

    if (!snapshot) return res.status(404).json({ error: `Version ${version} not found in history` });

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];
    const idx = documents.findIndex(d => d._id === docId);
    if (idx === -1) return res.status(404).json({ error: 'Document not found' });

    // Save current state to history first
    history.push({
      version: documents[idx]._version || 0,
      snapshot: { ...documents[idx] },
      changedAt: new Date().toISOString()
    });
    writeJSON(histPath, history);

    // Restore
    documents[idx] = {
      ...snapshot.snapshot,
      _updatedAt: new Date().toISOString(),
      _version: (documents[idx]._version || 0) + 1
    };

    writeJSON(collPath, documents);

    res.json({ success: true, restoredDocument: documents[idx] });
  } catch (err) {
    res.status(500).json({ error: 'Rollback failed', details: err.message });
  }
};

// ===== Simple JWT-based endpoints (userId from token) =====

exports.insertDocumentSimple = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, collection } = req.params;
    const doc = req.body;

    if (!doc || typeof doc !== 'object' || Object.keys(doc).length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty JSON object' });
    }

    // Reuse by simulating params
    req.params.userId = userId;
    req.body = { documents: [doc] };
    return exports.insertDocuments(req, res);
  } catch (err) {
    res.status(500).json({ error: 'Insert failed', details: err.message });
  }
};

exports.queryDocumentsSimple = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, collection } = req.params;
    const filter = req.body.filter || req.body.query || {};

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    const results = queryDocuments(documents, filter);

    res.json({ documents: results, count: results.length });
  } catch (err) {
    res.status(500).json({ error: 'Query failed', details: err.message });
  }
};

exports.getDocumentById = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, collection, docId } = req.params;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];
    const doc = documents.find(d => d._id === docId);

    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Get document failed', details: err.message });
  }
};

exports.replaceDocument = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, collection, docId } = req.params;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];
    const idx = documents.findIndex(d => d._id === docId);

    if (idx === -1) return res.status(404).json({ error: 'Document not found' });

    // Save history
    const histPath = getDocHistoryPath(userId, dbName, docId);
    const history = readJSON(histPath) || [];
    history.push({ version: documents[idx]._version || 0, snapshot: { ...documents[idx] }, changedAt: new Date().toISOString() });
    writeJSON(histPath, history);

    const newDoc = { ...req.body, _id: docId, _version: (documents[idx]._version || 0) + 1, _createdAt: documents[idx]._createdAt, _updatedAt: new Date().toISOString() };
    documents[idx] = newDoc;
    writeJSON(collPath, documents);

    // Fire events
    const webhooks = readJSON(getWebhooksPath(userId, dbName)) || [];
    fireWebhooks(webhooks, 'document.updated', collection, newDoc);
    broadcast(userId, dbName, collection, 'update', newDoc);

    res.json({ success: true, document: newDoc });
  } catch (err) {
    res.status(500).json({ error: 'Replace failed', details: err.message });
  }
};

exports.patchDocument = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, collection, docId } = req.params;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];
    const idx = documents.findIndex(d => d._id === docId);

    if (idx === -1) return res.status(404).json({ error: 'Document not found' });

    // Save history
    const histPath = getDocHistoryPath(userId, dbName, docId);
    const history = readJSON(histPath) || [];
    history.push({ version: documents[idx]._version || 0, snapshot: { ...documents[idx] }, changedAt: new Date().toISOString() });
    writeJSON(histPath, history);

    const updated = { ...documents[idx], ...req.body, _id: docId, _version: (documents[idx]._version || 0) + 1, _updatedAt: new Date().toISOString() };
    documents[idx] = updated;
    writeJSON(collPath, documents);

    // Fire events
    const webhooks = readJSON(getWebhooksPath(userId, dbName)) || [];
    fireWebhooks(webhooks, 'document.updated', collection, updated);
    broadcast(userId, dbName, collection, 'update', updated);

    res.json({ success: true, document: updated });
  } catch (err) {
    res.status(500).json({ error: 'Patch failed', details: err.message });
  }
};

exports.deleteDocumentById = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, collection, docId } = req.params;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];
    const idx = documents.findIndex(d => d._id === docId);

    if (idx === -1) return res.status(404).json({ error: 'Document not found' });

    const deleted = documents.splice(idx, 1)[0];
    writeJSON(collPath, documents);

    // Update graph
    const graphPath = getGraphPath(userId, dbName);
    let graph = readJSON(graphPath) || { nodes: [], edges: [] };
    graph = processDelete(deleted, graph);
    writeJSON(graphPath, graph);

    // Fire events
    const webhooks = readJSON(getWebhooksPath(userId, dbName)) || [];
    fireWebhooks(webhooks, 'document.deleted', collection, deleted);
    broadcast(userId, dbName, collection, 'delete', deleted);

    res.json({ success: true, deletedId: docId });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
};

exports.getDocHistorySimple = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, collection, docId } = req.params;

    const histPath = getDocHistoryPath(userId, dbName, docId);
    const history = readJSON(histPath) || [];

    res.json({ docId, versions: history.length, history });
  } catch (err) {
    res.status(500).json({ error: 'History failed', details: err.message });
  }
};
