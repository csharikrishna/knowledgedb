const bcrypt = require('bcryptjs');
const os = require('os');
const {
  readJSON, writeJSON, getUsersPath, getDatabasesPath,
  getDbDir, getCollectionPath, getGraphPath, listFiles,
  getDirSize, deleteDir
} = require('../utils/fileHandler');
const { signAdminToken } = require('../utils/jwtHelper');
const { getDeliveryLogs } = require('../utils/webhookDispatcher');
const { getTotalClients } = require('../utils/sseManager');

const startTime = Date.now();

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = signAdminToken({ isAdmin: true, username });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed', details: err.message });
  }
};

exports.systemStats = (req, res) => {
  try {
    const users = readJSON(getUsersPath()) || [];
    const databases = readJSON(getDatabasesPath()) || [];

    let totalDocuments = 0;
    let totalNodes = 0;
    let totalEdges = 0;

    for (const db of databases) {
      const dbDir = getDbDir(db.userId, db.dbName);
      const files = listFiles(dbDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const docs = readJSON(getCollectionPath(db.userId, db.dbName, file.replace('.json', ''))) || [];
        totalDocuments += docs.length;
      }
      const graph = readJSON(getGraphPath(db.userId, db.dbName)) || { nodes: [], edges: [] };
      totalNodes += graph.nodes.length;
      totalEdges += graph.edges.length;
    }

    const uptimeMs = Date.now() - startTime;
    const uptimeHours = Math.round(uptimeMs / (1000 * 60 * 60) * 10) / 10;

    res.json({
      totalUsers: users.length,
      totalDatabases: databases.length,
      totalDocuments,
      totalNodes,
      totalEdges,
      uptime: `${uptimeHours}h`,
      sseClients: getTotalClients(),
      memory: {
        usedMB: Math.round(process.memoryUsage().heapUsed / (1024 * 1024) * 10) / 10,
        totalMB: Math.round(os.totalmem() / (1024 * 1024))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats', details: err.message });
  }
};

exports.listUsers = (req, res) => {
  try {
    const users = readJSON(getUsersPath()) || [];
    res.json({
      users: users.map(u => ({
        userId: u.userId,
        username: u.username,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list users', details: err.message });
  }
};

exports.getUser = (req, res) => {
  try {
    const { userId } = req.params;
    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.userId === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const databases = readJSON(getDatabasesPath()) || [];
    const userDbs = databases.filter(d => d.userId === userId);

    res.json({
      userId: user.userId,
      username: user.username,
      createdAt: user.createdAt,
      databases: userDbs.map(d => ({ dbName: d.dbName, createdAt: d.createdAt }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user', details: err.message });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const { userId } = req.params;
    const users = readJSON(getUsersPath()) || [];
    const idx = users.findIndex(u => u.userId === userId);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    users.splice(idx, 1);
    writeJSON(getUsersPath(), users);

    // Delete all databases for this user
    const databases = readJSON(getDatabasesPath()) || [];
    const remaining = databases.filter(d => d.userId !== userId);
    const deleted = databases.filter(d => d.userId === userId);
    writeJSON(getDatabasesPath(), remaining);

    for (const db of deleted) {
      deleteDir(getDbDir(db.userId, db.dbName));
    }

    res.json({ success: true, deletedDatabases: deleted.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
};

exports.getUserDatabases = (req, res) => {
  try {
    const { userId } = req.params;
    const databases = readJSON(getDatabasesPath()) || [];
    const userDbs = databases.filter(d => d.userId === userId);

    const result = userDbs.map(db => {
      const dbDir = getDbDir(db.userId, db.dbName);
      const storageMB = Math.round(getDirSize(dbDir) / (1024 * 1024) * 100) / 100;
      return {
        dbName: db.dbName,
        apiEndpoint: db.apiEndpoint,
        storageMB,
        createdAt: db.createdAt
      };
    });

    res.json({ databases: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get databases', details: err.message });
  }
};

exports.getDatabaseDetail = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const databases = readJSON(getDatabasesPath()) || [];
    const db = databases.find(d => d.userId === userId && d.dbName === dbName);
    if (!db) return res.status(404).json({ error: 'Database not found' });

    const dbDir = getDbDir(userId, dbName);
    const files = listFiles(dbDir).filter(f => f.endsWith('.json'));
    const collections = {};
    for (const file of files) {
      const coll = file.replace('.json', '');
      const docs = readJSON(getCollectionPath(userId, dbName, coll)) || [];
      collections[coll] = docs.length;
    }

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };

    res.json({
      dbName: db.dbName,
      apiEndpoint: db.apiEndpoint,
      collections,
      graph: { nodes: graph.nodes.length, edges: graph.edges.length },
      createdAt: db.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get database detail', details: err.message });
  }
};

exports.adminDeleteDatabase = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const databases = readJSON(getDatabasesPath()) || [];
    const idx = databases.findIndex(d => d.userId === userId && d.dbName === dbName);
    if (idx === -1) return res.status(404).json({ error: 'Database not found' });

    databases.splice(idx, 1);
    writeJSON(getDatabasesPath(), databases);
    deleteDir(getDbDir(userId, dbName));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete database', details: err.message });
  }
};

exports.getGraphData = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get graph', details: err.message });
  }
};

exports.getWebhookLogs = (req, res) => {
  try {
    const logs = getDeliveryLogs();
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get webhook logs', details: err.message });
  }
};

exports.health = (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.round((Date.now() - startTime) / 1000),
    memoryMB: Math.round(process.memoryUsage().heapUsed / (1024 * 1024) * 10) / 10,
    timestamp: new Date().toISOString()
  });
};
