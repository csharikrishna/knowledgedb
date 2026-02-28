const router = require('express').Router();
const adminCtrl = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, validate('adminLogin'), adminCtrl.adminLogin);
router.get('/stats', adminMiddleware, adminCtrl.systemStats);
router.get('/users', adminMiddleware, adminCtrl.listUsers);
router.get('/users/:userId', adminMiddleware, adminCtrl.getUser);
router.delete('/users/:userId', adminMiddleware, adminCtrl.deleteUser);
router.get('/databases/:userId', adminMiddleware, adminCtrl.getUserDatabases);
router.get('/databases/:userId/:dbName', adminMiddleware, adminCtrl.getDatabaseDetail);
router.delete('/databases/:userId/:dbName', adminMiddleware, adminCtrl.adminDeleteDatabase);
router.get('/graph/:userId/:dbName', adminMiddleware, adminCtrl.getGraphData);
router.get('/webhooks/logs', adminMiddleware, adminCtrl.getWebhookLogs);
router.get('/health', adminMiddleware, adminCtrl.health);

module.exports = router;
