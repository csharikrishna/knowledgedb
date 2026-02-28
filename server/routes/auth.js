const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, validate('signup'), authCtrl.signup);
router.post('/register', authLimiter, validate('signup'), authCtrl.register);
router.post('/login', authLimiter, validate('login'), authCtrl.login);
router.get('/profile', jwtMiddleware, authCtrl.profile);
router.post('/change-password', jwtMiddleware, validate('changePassword'), authCtrl.changePassword);
router.put('/password', jwtMiddleware, authCtrl.changePassword);

// Password reset (no auth required)
router.post('/forgot-password', authLimiter, authCtrl.forgotPassword);
router.post('/reset-password', authLimiter, authCtrl.resetPassword);

// API Key management
router.post('/api-keys', jwtMiddleware, authCtrl.createApiKey);
router.get('/api-keys', jwtMiddleware, authCtrl.listApiKeys);
router.delete('/api-keys/:keyId', jwtMiddleware, authCtrl.revokeApiKey);

// Account deletion
router.delete('/account', jwtMiddleware, authCtrl.deleteAccount);

module.exports = router;
