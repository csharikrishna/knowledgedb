const router = require('express').Router();
const trigCtrl = require('../controllers/triggerController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { validate } = require('../middleware/validator');
const { readJSON, getDatabasesPath } = require('../utils/fileHandler');

function resolveUserDb(req, res, next) {
  const { dbName } = req.params;
  const userId = req.user.userId;
  const databases = readJSON(getDatabasesPath()) || [];
  const db = databases.find(d => d.userId === userId && d.dbName === dbName);
  if (!db) return res.status(404).json({ error: 'Database not found' });
  req.params.userId = userId;
  next();
}

router.post('/:dbName/triggers/create', jwtMiddleware, resolveUserDb, validate('createTrigger'), trigCtrl.createTrigger);
router.get('/:dbName/triggers/list', jwtMiddleware, resolveUserDb, trigCtrl.listTriggers);
router.put('/:dbName/triggers/:triggerId', jwtMiddleware, resolveUserDb, trigCtrl.updateTrigger);
router.delete('/:dbName/triggers/:triggerId', jwtMiddleware, resolveUserDb, trigCtrl.deleteTrigger);

module.exports = router;
