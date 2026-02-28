const router = require('express').Router();
const searchCtrl = require('../controllers/searchController');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { validate } = require('../middleware/validator');

const injectUser = (req, res, next) => {
  if (!req.params.userId && req.user) req.params.userId = req.user.userId;
  next();
};

// JWT-based routes
router.post('/:dbName/search', jwtMiddleware, injectUser, searchCtrl.hybridSearch);
router.post('/:dbName/ask', jwtMiddleware, injectUser, searchCtrl.ask);

// API-key-based routes
router.post('/:userId/:dbName/search', apiKeyMiddleware('read'), validate('search'), searchCtrl.hybridSearch);
router.post('/:userId/:dbName/ask', apiKeyMiddleware('read'), validate('ask'), searchCtrl.ask);

module.exports = router;
