const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default_admin_secret';

function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function signAdminToken(payload) {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: '12h' });
}

function verifyAdminToken(token) {
  return jwt.verify(token, ADMIN_SECRET);
}

module.exports = { signToken, verifyToken, signAdminToken, verifyAdminToken };
