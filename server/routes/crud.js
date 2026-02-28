const router = require('express').Router();
const crudCtrl = require('../controllers/crudController');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { validate } = require('../middleware/validator');

// Helper middleware: inject userId from JWT into params if not present
const injectUser = (req, res, next) => {
  if (!req.params.userId && req.user) {
    req.params.userId = req.user.userId;
  }
  next();
};

// ==== JWT-based routes (used by dashboards) ====

// Insert document (POST /db/:dbName/:collection body = document)
router.post('/:dbName/:collection', jwtMiddleware, injectUser, crudCtrl.insertDocumentSimple);

// Query documents (POST /db/:dbName/:collection/query body = { filter })
router.post('/:dbName/:collection/query', jwtMiddleware, injectUser, crudCtrl.queryDocumentsSimple);

// Get document by ID
router.get('/:dbName/:collection/:docId', jwtMiddleware, injectUser, crudCtrl.getDocumentById);

// Replace document
router.put('/:dbName/:collection/:docId', jwtMiddleware, injectUser, crudCtrl.replaceDocument);

// Partial update
router.patch('/:dbName/:collection/:docId', jwtMiddleware, injectUser, crudCtrl.patchDocument);

// Delete document
router.delete('/:dbName/:collection/:docId', jwtMiddleware, injectUser, crudCtrl.deleteDocumentById);

// Document version history
router.get('/:dbName/:collection/:docId/history', jwtMiddleware, injectUser, crudCtrl.getDocHistorySimple);

// ==== API-Key-based routes (used by SDKs) ====

// List collections
router.get('/:userId/:dbName/collections', apiKeyMiddleware('read'), crudCtrl.listCollections);

// Insert documents
router.post('/:userId/:dbName/:collection/insert', apiKeyMiddleware('write'), validate('insertDocuments'), crudCtrl.insertDocuments);

// Find documents
router.get('/:userId/:dbName/:collection/find', apiKeyMiddleware('read'), crudCtrl.findDocuments);
router.post('/:userId/:dbName/:collection/find', apiKeyMiddleware('read'), crudCtrl.findDocuments);

// Update documents
router.put('/:userId/:dbName/:collection/update', apiKeyMiddleware('write'), validate('updateDocuments'), crudCtrl.updateDocuments);

// Delete documents
router.delete('/:userId/:dbName/:collection/delete', apiKeyMiddleware('delete'), crudCtrl.deleteDocuments);

// Count documents
router.get('/:userId/:dbName/:collection/count', apiKeyMiddleware('read'), crudCtrl.countDocuments);
router.post('/:userId/:dbName/:collection/count', apiKeyMiddleware('read'), crudCtrl.countDocuments);

// Document version history
router.get('/:userId/:dbName/:collection/:docId/history', apiKeyMiddleware('read'), crudCtrl.getDocHistory);

// Rollback document
router.post('/:userId/:dbName/:collection/:docId/rollback', apiKeyMiddleware('write'), validate('rollback'), crudCtrl.rollbackDocument);

module.exports = router;
