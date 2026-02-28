const { v4: uuidv4 } = require('uuid');
const {
  readJSON, writeJSON, getDatabasesPath, getDbDir,
  ensureDir, deleteDir, getDirSize, getGraphPath,
  getCollectionPath, listFiles, getWebhooksPath,
  getTriggersPath, getMemoryPath, getIndexPath
} = require('../utils/fileHandler');
const { generateApiKey, hashApiKey, generateKeyId } = require('../utils/apiKeyGenerator');

exports.createDatabase = async (req, res) => {
  try {
    const dbName = req.body.dbName || req.body.name;
    const userId = req.user.userId;
    const databases = readJSON(getDatabasesPath()) || [];

    // Check limit
    const userDbs = databases.filter(d => d.userId === userId);
    const maxDbs = parseInt(process.env.MAX_DATABASES_PER_USER) || 10;
    if (userDbs.length >= maxDbs) {
      return res.status(400).json({ error: `Maximum ${maxDbs} databases per user` });
    }

    // Check duplicate name
    if (userDbs.find(d => d.dbName === dbName)) {
      return res.status(409).json({ error: `Database '${dbName}' already exists` });
    }

    // Generate API key
    const rawKey = generateApiKey();
    const keyHash = await hashApiKey(rawKey);
    const keyId = generateKeyId();

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const apiEndpoint = `${baseUrl}/db/${userId}/${dbName}`;

    const dbRecord = {
      dbId: 'db_' + uuidv4().replace(/-/g, '').substring(0, 8),
      userId,
      dbName,
      apiEndpoint,
      keys: [{
        keyId,
        name: 'default',
        keyHash,
        scopes: ['read', 'write', 'delete', 'graph', 'memory'],
        collections: null,
        expiresAt: null,
        createdAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    };

    databases.push(dbRecord);
    writeJSON(getDatabasesPath(), databases);

    // Create database directory structure
    const dbDir = getDbDir(userId, dbName);
    ensureDir(dbDir);
    writeJSON(getGraphPath(userId, dbName), { nodes: [], edges: [] });
    writeJSON(getMemoryPath(userId, dbName), []);
    writeJSON(getWebhooksPath(userId, dbName), []);
    writeJSON(getTriggersPath(userId, dbName), []);
    writeJSON(getIndexPath(userId, dbName), {});

    res.status(201).json({
      apiEndpoint,
      apiKey: rawKey,
      warning: 'Save this API key now — it will not be shown again.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create database', details: err.message });
  }
};

exports.listDatabases = (req, res) => {
  try {
    const userId = req.user.userId;
    const databases = readJSON(getDatabasesPath()) || [];
    const userDbs = databases.filter(d => d.userId === userId);

    const result = userDbs.map(db => {
      const dbDir = getDbDir(userId, db.dbName);
      const collections = listFiles(dbDir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
      let totalDocs = 0;
      for (const coll of collections) {
        const docs = readJSON(getCollectionPath(userId, db.dbName, coll)) || [];
        totalDocs += docs.length;
      }
      const graph = readJSON(getGraphPath(userId, db.dbName)) || { nodes: [], edges: [] };

      return {
        dbName: db.dbName,
        apiEndpoint: db.apiEndpoint,
        createdAt: db.createdAt,
        stats: {
          collections: collections.length,
          documents: totalDocs,
          nodes: graph.nodes.length,
          edges: graph.edges.length
        }
      };
    });

    res.json({ databases: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list databases', details: err.message });
  }
};

exports.deleteDatabase = (req, res) => {
  try {
    const userId = req.user.userId;
    const { dbName } = req.params;
    const databases = readJSON(getDatabasesPath()) || [];
    const idx = databases.findIndex(d => d.userId === userId && d.dbName === dbName);

    if (idx === -1) return res.status(404).json({ error: 'Database not found' });

    databases.splice(idx, 1);
    writeJSON(getDatabasesPath(), databases);

    // Delete all files
    deleteDir(getDbDir(userId, dbName));

    res.json({ success: true, deleted: dbName });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete database', details: err.message });
  }
};

exports.rotateKey = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dbName } = req.params;
    const databases = readJSON(getDatabasesPath()) || [];
    const db = databases.find(d => d.userId === userId && d.dbName === dbName);

    if (!db) return res.status(404).json({ error: 'Database not found' });

    // Find and replace default key
    const defaultKeyIdx = db.keys.findIndex(k => k.name === 'default');
    const rawKey = generateApiKey();
    const keyHash = await hashApiKey(rawKey);

    if (defaultKeyIdx !== -1) {
      db.keys[defaultKeyIdx].keyHash = keyHash;
      db.keys[defaultKeyIdx].createdAt = new Date().toISOString();
    } else {
      db.keys.push({
        keyId: generateKeyId(),
        name: 'default',
        keyHash,
        scopes: ['read', 'write', 'delete', 'graph', 'memory'],
        collections: null,
        expiresAt: null,
        createdAt: new Date().toISOString()
      });
    }

    writeJSON(getDatabasesPath(), databases);

    res.json({
      newApiKey: rawKey,
      warning: 'Save this API key now — it will not be shown again. Old key is now invalid.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rotate key', details: err.message });
  }
};

exports.getStats = (req, res) => {
  try {
    const userId = req.user.userId;
    const { dbName } = req.params;
    const databases = readJSON(getDatabasesPath()) || [];
    const db = databases.find(d => d.userId === userId && d.dbName === dbName);

    if (!db) return res.status(404).json({ error: 'Database not found' });

    const dbDir = getDbDir(userId, dbName);
    const collections = listFiles(dbDir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    let totalDocs = 0;
    for (const coll of collections) {
      const docs = readJSON(getCollectionPath(userId, dbName, coll)) || [];
      totalDocs += docs.length;
    }
    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    const storageMB = Math.round(getDirSize(dbDir) / (1024 * 1024) * 100) / 100;

    res.json({
      collections: collections.length,
      documents: totalDocs,
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      storageMB
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats', details: err.message });
  }
};

exports.createScopedKey = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dbName } = req.params;
    const { name, scopes, collections, expiresIn } = req.body;

    const databases = readJSON(getDatabasesPath()) || [];
    const db = databases.find(d => d.userId === userId && d.dbName === dbName);
    if (!db) return res.status(404).json({ error: 'Database not found' });

    const rawKey = generateApiKey();
    const keyHash = await hashApiKey(rawKey);
    const keyId = generateKeyId();

    let expiresAt = null;
    if (expiresIn && expiresIn !== 'never') {
      const days = parseInt(expiresIn);
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    db.keys.push({
      keyId,
      name,
      keyHash,
      scopes,
      collections: collections || null,
      expiresAt,
      createdAt: new Date().toISOString()
    });

    writeJSON(getDatabasesPath(), databases);

    res.status(201).json({
      keyId,
      apiKey: rawKey,
      name,
      scopes,
      expiresAt,
      warning: 'Save this API key now — it will not be shown again.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create key', details: err.message });
  }
};

exports.deleteScopedKey = (req, res) => {
  try {
    const userId = req.user.userId;
    const { dbName, keyId } = req.params;

    const databases = readJSON(getDatabasesPath()) || [];
    const db = databases.find(d => d.userId === userId && d.dbName === dbName);
    if (!db) return res.status(404).json({ error: 'Database not found' });

    const keyIdx = db.keys.findIndex(k => k.keyId === keyId);
    if (keyIdx === -1) return res.status(404).json({ error: 'Key not found' });

    db.keys.splice(keyIdx, 1);
    writeJSON(getDatabasesPath(), databases);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete key', details: err.message });
  }
};
