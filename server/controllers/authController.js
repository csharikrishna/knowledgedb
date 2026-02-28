const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON, getUsersPath } = require('../utils/fileHandler');
const { signToken } = require('../utils/jwtHelper');
const { generateApiKey, hashApiKey, generateKeyId } = require('../utils/apiKeyGenerator');

exports.signup = async (req, res) => {
  try {
    const email = req.body.email || req.body.username;
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const users = readJSON(getUsersPath()) || [];

    if (users.find(u => u.email === email || u.username === email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = 'usr_' + uuidv4().replace(/-/g, '').substring(0, 8);
    const now = new Date().toISOString();

    const user = { userId, email, username: email, passwordHash, apiKeys: [], createdAt: now, updatedAt: now };
    users.push(user);
    writeJSON(getUsersPath(), users);

    const token = signToken({ userId, email });
    res.status(201).json({ success: true, token, userId, email, expiresIn: '7d' });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
};

exports.register = exports.signup; // alias

exports.login = async (req, res) => {
  try {
    const email = req.body.email || req.body.username;
    const { password } = req.body;
    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.email === email || u.username === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.userId, email: user.email || user.username });
    res.json({ token, userId: user.userId, email: user.email || user.username, expiresIn: '7d' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

exports.profile = (req, res) => {
  try {
    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.userId === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ userId: user.userId, email: user.email || user.username, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile', details: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const oldPassword = req.body.oldPassword || req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.userId === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.updatedAt = new Date().toISOString();
    writeJSON(getUsersPath(), users);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Password change failed', details: err.message });
  }
};

// --- API Key Management ---

exports.createApiKey = async (req, res) => {
  try {
    const { name, database, scopes, collections } = req.body;
    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.userId === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const rawKey = generateApiKey();
    const keyId = generateKeyId();
    const hashedKey = hashApiKey(rawKey);
    const now = new Date().toISOString();

    const keyEntry = {
      keyId,
      name: name || 'Unnamed Key',
      hash: hashedKey,
      database: database || '*',
      scopes: scopes || ['read', 'write'],
      collections: collections || [],
      createdAt: now
    };

    if (!user.apiKeys) user.apiKeys = [];
    user.apiKeys.push(keyEntry);
    writeJSON(getUsersPath(), users);

    res.status(201).json({ success: true, apiKey: rawKey, keyId, name: keyEntry.name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create API key', details: err.message });
  }
};

exports.listApiKeys = (req, res) => {
  try {
    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.userId === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const apiKeys = (user.apiKeys || []).map(k => ({
      keyId: k.keyId,
      name: k.name,
      database: k.database,
      scopes: k.scopes,
      collections: k.collections,
      createdAt: k.createdAt
    }));

    res.json({ apiKeys });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list API keys', details: err.message });
  }
};

exports.revokeApiKey = (req, res) => {
  try {
    const { keyId } = req.params;
    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.userId === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const idx = (user.apiKeys || []).findIndex(k => k.keyId === keyId);
    if (idx === -1) return res.status(404).json({ error: 'API key not found' });

    user.apiKeys.splice(idx, 1);
    writeJSON(getUsersPath(), users);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke API key', details: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const users = readJSON(getUsersPath()) || [];
    const filtered = users.filter(u => u.userId !== req.user.userId);
    writeJSON(getUsersPath(), filtered);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account', details: err.message });
  }
};

// --- Password Reset ---

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email || req.body.username;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.email === email || u.username === email);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset code has been sent' });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    user.resetCode = resetCode;
    user.resetToken = resetToken;
    user.resetExpiry = resetExpiry;
    writeJSON(getUsersPath(), users);

    // In production, send email here. For now, return code in development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      res.json({ success: true, message: 'Reset code generated', resetCode, resetToken });
    } else {
      res.json({ success: true, message: 'If the email exists, a reset code has been sent' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Password reset request failed', details: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, resetToken, newPassword } = req.body;
    if (!email || !newPassword || (!resetCode && !resetToken)) {
      return res.status(400).json({ error: 'Email, reset code/token, and new password required' });
    }

    const users = readJSON(getUsersPath()) || [];
    const user = users.find(u => u.email === email || u.username === email);

    if (!user || !user.resetCode || !user.resetExpiry) {
      return res.status(400).json({ error: 'Invalid or expired reset request' });
    }

    // Check expiry
    if (new Date() > new Date(user.resetExpiry)) {
      delete user.resetCode;
      delete user.resetToken;
      delete user.resetExpiry;
      writeJSON(getUsersPath(), users);
      return res.status(400).json({ error: 'Reset code expired. Please request a new one' });
    }

    // Verify code or token
    const validCode = resetCode && user.resetCode === resetCode;
    const validToken = resetToken && user.resetToken === resetToken;

    if (!validCode && !validToken) {
      return res.status(400).json({ error: 'Invalid reset code or token' });
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.updatedAt = new Date().toISOString();
    delete user.resetCode;
    delete user.resetToken;
    delete user.resetExpiry;
    writeJSON(getUsersPath(), users);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed', details: err.message });
  }
};
