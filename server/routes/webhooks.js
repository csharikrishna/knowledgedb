const router = require('express').Router();
const whCtrl = require('../controllers/webhookController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const { validate } = require('../middleware/validator');
const { readJSON, getDatabasesPath } = require('../utils/fileHandler');

// Middleware to resolve userId from JWT
function resolveUserDb(req, res, next) {
  const { dbName } = req.params;
  const userId = req.user.userId;
  const databases = readJSON(getDatabasesPath()) || [];
  const db = databases.find(d => d.userId === userId && d.dbName === dbName);
  if (!db) return res.status(404).json({ error: 'Database not found' });
  req.params.userId = userId;
  next();
}

// Simple JWT routes (POST /db/:dbName/webhooks with body)
router.post('/:dbName/webhooks', jwtMiddleware, resolveUserDb, whCtrl.createWebhook);
router.get('/:dbName/webhooks', jwtMiddleware, resolveUserDb, whCtrl.listWebhooks);
router.delete('/:dbName/webhooks/:webhookId', jwtMiddleware, resolveUserDb, whCtrl.deleteWebhook);

// Legacy paths
router.post('/:dbName/webhooks/create', jwtMiddleware, resolveUserDb, validate('createWebhook'), whCtrl.createWebhook);
router.get('/:dbName/webhooks/list', jwtMiddleware, resolveUserDb, whCtrl.listWebhooks);
router.get('/:dbName/webhooks/:webhookId/logs', jwtMiddleware, resolveUserDb, whCtrl.webhookLogs);

// SSE live stream (API key authenticated)
router.get('/:userId/:dbName/:collection/live', apiKeyMiddleware('read'), whCtrl.liveStream);

// SSE event stream (JWT)
router.get('/:dbName/events', jwtMiddleware, (req, res, next) => {
  req.params.userId = req.user.userId;
  next();
}, whCtrl.liveStreamAll);

module.exports = router;
