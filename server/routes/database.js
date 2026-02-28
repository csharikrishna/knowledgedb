const router = require('express').Router();
const dbCtrl = require('../controllers/databaseController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { validate } = require('../middleware/validator');

// Primary routes (used by dashboards and SDKs)
router.post('/', jwtMiddleware, validate('createDatabase'), dbCtrl.createDatabase);
router.get('/', jwtMiddleware, dbCtrl.listDatabases);

// Legacy aliases
router.post('/create', jwtMiddleware, validate('createDatabase'), dbCtrl.createDatabase);
router.get('/list', jwtMiddleware, dbCtrl.listDatabases);

router.get('/:dbName', jwtMiddleware, dbCtrl.getStats);
router.delete('/:dbName', jwtMiddleware, dbCtrl.deleteDatabase);
router.post('/:dbName/rotate-key', jwtMiddleware, dbCtrl.rotateKey);
router.post('/:dbName/keys/create', jwtMiddleware, validate('createKey'), dbCtrl.createScopedKey);
router.delete('/:dbName/keys/:keyId', jwtMiddleware, dbCtrl.deleteScopedKey);

module.exports = router;
