const router = require('express').Router();
const graphCtrl = require('../controllers/graphController');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { validate } = require('../middleware/validator');

// Helper: inject userId from JWT
const injectUser = (req, res, next) => {
  if (!req.params.userId && req.user) req.params.userId = req.user.userId;
  next();
};

// JWT-based routes (dashboards)
router.get('/:dbName/graph/stats', jwtMiddleware, injectUser, graphCtrl.getStats);
router.get('/:dbName/graph/traverse/:nodeId', jwtMiddleware, injectUser, graphCtrl.traverseByNodeId);
router.post('/:dbName/graph/traverse', jwtMiddleware, injectUser, graphCtrl.traverse);
router.get('/:dbName/graph/path/:from/:to', jwtMiddleware, injectUser, graphCtrl.findPathByParams);
router.post('/:dbName/graph/path', jwtMiddleware, injectUser, graphCtrl.findPath);
router.get('/:dbName/graph/search', jwtMiddleware, injectUser, graphCtrl.searchGraph);
router.post('/:dbName/graph/link', jwtMiddleware, injectUser, graphCtrl.createLink);
router.delete('/:dbName/graph/link/:edgeId', jwtMiddleware, injectUser, graphCtrl.deleteLink);

// API-key-based routes (SDKs)
router.get('/:userId/:dbName/graph/nodes', apiKeyMiddleware('graph'), graphCtrl.getNodes);
router.get('/:userId/:dbName/graph/edges', apiKeyMiddleware('graph'), graphCtrl.getEdges);
router.get('/:userId/:dbName/graph/stats', apiKeyMiddleware('graph'), graphCtrl.getStats);
router.get('/:userId/:dbName/graph/node/:entityId', apiKeyMiddleware('graph'), graphCtrl.getNode);
router.get('/:userId/:dbName/graph/search', apiKeyMiddleware('graph'), graphCtrl.searchGraph);
router.post('/:userId/:dbName/graph/traverse', apiKeyMiddleware('graph'), validate('traverse'), graphCtrl.traverse);
router.post('/:userId/:dbName/graph/path', apiKeyMiddleware('graph'), validate('path'), graphCtrl.findPath);
router.post('/:userId/:dbName/graph/link', apiKeyMiddleware('graph'), validate('link'), graphCtrl.createLink);
router.delete('/:userId/:dbName/graph/link/:edgeId', apiKeyMiddleware('graph'), graphCtrl.deleteLink);

module.exports = router;
