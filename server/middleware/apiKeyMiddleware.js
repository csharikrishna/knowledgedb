const { readJSON, getDatabasesPath } = require('../utils/fileHandler');
const { verifyApiKey } = require('../utils/apiKeyGenerator');

/**
 * API Key middleware — verifies the API key and checks scopes
 * Expects: x-api-key header or apikey query parameter
 * Sets: req.dbMeta, req.apiKeyInfo
 */
function apiKeyMiddleware(requiredScope = null) {
  return async (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apikey;
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required. Provide x-api-key header or apikey query parameter.' });
    }

    const userId = req.params.userId;
    const dbName = req.params.dbName;

    if (!userId || !dbName) {
      return res.status(400).json({ error: 'userId and dbName are required in the URL path' });
    }

    const databases = readJSON(getDatabasesPath()) || [];
    const db = databases.find(d => d.userId === userId && d.dbName === dbName);

    if (!db) {
      return res.status(404).json({ error: 'Database not found' });
    }

    // Check each key
    let matchedKey = null;
    for (const key of db.keys) {
      // Check expiry
      if (key.expiresAt && new Date(key.expiresAt) < new Date()) continue;

      const isValid = await verifyApiKey(apiKey, key.keyHash);
      if (isValid) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check scope
    if (requiredScope && !matchedKey.scopes.includes(requiredScope) && !matchedKey.scopes.includes('admin')) {
      return res.status(403).json({ error: `API key does not have '${requiredScope}' scope` });
    }

    // Check per-collection access
    const collection = req.params.collection;
    if (collection && matchedKey.collections) {
      const collPerms = matchedKey.collections[collection];
      if (!collPerms) {
        return res.status(403).json({ error: `API key does not have access to collection '${collection}'` });
      }
      if (requiredScope && !collPerms.includes(requiredScope) && !collPerms.includes('admin')) {
        return res.status(403).json({ error: `API key does not have '${requiredScope}' scope on collection '${collection}'` });
      }
    }

    req.dbMeta = db;
    req.apiKeyInfo = matchedKey;
    next();
  };
}

module.exports = apiKeyMiddleware;
