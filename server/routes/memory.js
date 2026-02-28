const router = require('express').Router();
const memCtrl = require('../controllers/memoryController');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { validate } = require('../middleware/validator');

const injectUser = (req, res, next) => {
  if (!req.params.userId && req.user) req.params.userId = req.user.userId;
  next();
};

// JWT-based routes (dashboard + seed script)
router.post('/:dbName/memory/:sessionId', jwtMiddleware, injectUser, memCtrl.rememberSimple);
router.get('/:dbName/memory/:sessionId', jwtMiddleware, injectUser, memCtrl.getSession);
router.post('/:dbName/memory/:sessionId/recall', jwtMiddleware, injectUser, memCtrl.recallSimple);
router.delete('/:dbName/memory/:sessionId', jwtMiddleware, injectUser, memCtrl.forgetSession);

// API-key-based routes (SDKs)
router.post('/:userId/:dbName/memory/remember', apiKeyMiddleware('memory'), validate('remember'), memCtrl.remember);
router.post('/:userId/:dbName/memory/recall', apiKeyMiddleware('memory'), validate('recall'), memCtrl.recall);
router.delete('/:userId/:dbName/memory/forget', apiKeyMiddleware('memory'), memCtrl.forget);
router.get('/:userId/:dbName/memory/list', apiKeyMiddleware('memory'), memCtrl.listMemories);

module.exports = router;
