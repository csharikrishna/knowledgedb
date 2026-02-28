const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const {
  readJSON, writeJSON, getCollectionPath, getPublicPath, getDatabasesPath
} = require('../utils/fileHandler');
const { addMetadata, validateDoc, buildIndex } = require('../utils/documentHelper');
const { processInsert } = require('../utils/graphEngine');
const { getGraphPath, getIndexPath } = require('../utils/fileHandler');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');

// Multer config for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

function resolveUserDb(req, res, next) {
  const { dbName } = req.params;
  const userId = req.user.userId;
  const databases = readJSON(getDatabasesPath()) || [];
  const db = databases.find(d => d.userId === userId && d.dbName === dbName);
  if (!db) return res.status(404).json({ error: 'Database not found' });
  req.params.userId = userId;
  next();
}

// Import — POST /db/:userId/:dbName/:collection/import
router.post('/:userId/:dbName/:collection/import', jwtMiddleware, upload.single('file'), (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const content = req.file.buffer.toString('utf-8');
    let importedDocs = [];
    const errors = [];

    if (req.file.originalname.endsWith('.csv')) {
      // Parse CSV
      const lines = content.split('\n').filter(l => l.trim());
      if (lines.length < 2) return res.status(400).json({ error: 'CSV must have header + data rows' });
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const doc = {};
          headers.forEach((h, idx) => {
            const val = values[idx];
            doc[h] = isNaN(val) || val === '' ? val : parseFloat(val);
          });
          importedDocs.push(doc);
        } catch (err) {
          errors.push({ line: i + 1, error: err.message });
        }
      }
    } else {
      // Parse JSON
      try {
        const parsed = JSON.parse(content);
        importedDocs = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON file' });
      }
    }

    // Validate and add metadata
    const collPath = getCollectionPath(userId, dbName, collection);
    const existing = readJSON(collPath) || [];
    const graphPath = getGraphPath(userId, dbName);
    let graph = readJSON(graphPath) || { nodes: [], edges: [] };

    let importedCount = 0;
    for (const doc of importedDocs) {
      const { valid, error } = validateDoc(doc);
      if (!valid) {
        errors.push({ doc, error });
        continue;
      }
      const withMeta = addMetadata(doc);
      existing.push(withMeta);
      graph = processInsert(withMeta, collection, graph);
      importedCount++;
    }

    writeJSON(collPath, existing);
    writeJSON(graphPath, graph);

    // Rebuild index
    const indexPath = getIndexPath(userId, dbName);
    const index = readJSON(indexPath) || {};
    index[collection] = buildIndex(existing);
    writeJSON(indexPath, index);

    res.json({ importedCount, errors: errors.length > 0 ? errors : undefined });
  } catch (err) {
    res.status(500).json({ error: 'Import failed', details: err.message });
  }
});

// Export — GET /db/:userId/:dbName/:collection/export
router.get('/:userId/:dbName/:collection/export', apiKeyMiddleware('read'), (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const format = req.query.format || 'json';

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    if (format === 'csv') {
      if (documents.length === 0) return res.send('');
      const headers = Object.keys(documents[0]);
      const csvLines = [headers.join(',')];
      for (const doc of documents) {
        const values = headers.map(h => {
          const val = doc[h];
          if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
          return val !== undefined && val !== null ? String(val) : '';
        });
        csvLines.push(values.join(','));
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${collection}.csv"`);
      res.send(csvLines.join('\n'));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${collection}.json"`);
      res.json(documents);
    }
  } catch (err) {
    res.status(500).json({ error: 'Export failed', details: err.message });
  }
});

// Publish collection — POST /db/:dbName/:collection/publish
router.post('/:dbName/:collection/publish', jwtMiddleware, resolveUserDb, (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const { fields } = req.body;
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: 'fields array is required' });
    }

    const publicPath = getPublicPath(userId, dbName);
    const publicConfig = readJSON(publicPath) || {};
    publicConfig[collection] = { fields, publishedAt: new Date().toISOString() };
    writeJSON(publicPath, publicConfig);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const publicUrl = `${baseUrl}/public/${userId}/${dbName}/${collection}`;

    res.json({ publicUrl });
  } catch (err) {
    res.status(500).json({ error: 'Publish failed', details: err.message });
  }
});

// Unpublish collection — DELETE /db/:dbName/:collection/unpublish
router.delete('/:dbName/:collection/unpublish', jwtMiddleware, resolveUserDb, (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const publicPath = getPublicPath(userId, dbName);
    const publicConfig = readJSON(publicPath) || {};
    delete publicConfig[collection];
    writeJSON(publicPath, publicConfig);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Unpublish failed', details: err.message });
  }
});

// Public read — GET /public/:userId/:dbName/:collection
router.get('/public/:userId/:dbName/:collection', (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const publicPath = getPublicPath(userId, dbName);
    const publicConfig = readJSON(publicPath) || {};

    if (!publicConfig[collection]) {
      return res.status(404).json({ error: 'This collection is not publicly accessible' });
    }

    const { fields } = publicConfig[collection];
    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    // Project only allowed fields
    const projected = documents.map(doc => {
      const result = {};
      for (const field of fields) {
        if (doc.hasOwnProperty(field)) result[field] = doc[field];
      }
      return result;
    });

    res.json({ documents: projected });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get public data', details: err.message });
  }
});

module.exports = router;
