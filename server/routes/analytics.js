const router = require('express').Router();
const analyticsCtrl = require('../controllers/analyticsController');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const { validate } = require('../middleware/validator');

router.post('/:userId/:dbName/:collection/analytics', apiKeyMiddleware('read'), validate('analytics'), analyticsCtrl.runAnalytics);

module.exports = router;
