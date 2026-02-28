const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function generateApiKey() {
  const key = 'kdb_' + crypto.randomBytes(32).toString('hex');
  return key;
}

async function hashApiKey(key) {
  return bcrypt.hash(key, 12);
}

async function verifyApiKey(key, hash) {
  return bcrypt.compare(key, hash);
}

function generateKeyId() {
  return 'key_' + crypto.randomBytes(6).toString('hex');
}

module.exports = { generateApiKey, hashApiKey, verifyApiKey, generateKeyId };
