const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

function writeJSON(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function deleteDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function getDirSize(dirPath) {
  let totalSize = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const file of files) {
    const fp = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      totalSize += getDirSize(fp);
    } else {
      totalSize += fs.statSync(fp).size;
    }
  }
  return totalSize;
}

function listFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath).filter(f => !f.startsWith('_'));
}

// Paths
function getUsersPath() {
  return path.join(DATA_DIR, 'users.json');
}

function getDatabasesPath() {
  return path.join(DATA_DIR, 'databases.json');
}

function getDbDir(userId, dbName) {
  return path.join(DATA_DIR, 'dbs', userId, dbName);
}

function getCollectionPath(userId, dbName, collection) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, `${collection}.json`);
}

function getGraphPath(userId, dbName) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_graph.json');
}

function getMemoryPath(userId, dbName) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_memory.json');
}

function getWebhooksPath(userId, dbName) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_webhooks.json');
}

function getTriggersPath(userId, dbName) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_triggers.json');
}

function getIndexPath(userId, dbName) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_index.json');
}

function getVectorIndexPath(userId, dbName, collection) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_vectors', `${collection}_vectors.json`);
}

function getFieldIndexPath(userId, dbName, collection) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_indexes', `${collection}_fields.json`);
}

function getHistoryDir(userId, dbName) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_history');
}

function getDocHistoryPath(userId, dbName, docId) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_history', `${docId}.json`);
}

function getPublicPath(userId, dbName) {
  return path.join(DATA_DIR, 'dbs', userId, dbName, '_public.json');
}

// Initialize data files if they don't exist
function initDataFiles() {
  ensureDir(DATA_DIR);
  ensureDir(path.join(DATA_DIR, 'dbs'));
  if (!fileExists(getUsersPath())) writeJSON(getUsersPath(), []);
  if (!fileExists(getDatabasesPath())) writeJSON(getDatabasesPath(), []);
}

module.exports = {
  DATA_DIR,
  ensureDir,
  readJSON,
  writeJSON,
  fileExists,
  deleteFile,
  deleteDir,
  getDirSize,
  listFiles,
  getUsersPath,
  getDatabasesPath,
  getDbDir,
  getCollectionPath,
  getGraphPath,
  getMemoryPath,
  getWebhooksPath,
  getTriggersPath,
  getIndexPath,
  getVectorIndexPath,
  getFieldIndexPath,
  getHistoryDir,
  getDocHistoryPath,
  getPublicPath,
  initDataFiles
};
