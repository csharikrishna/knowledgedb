const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON, getWebhooksPath } = require('../utils/fileHandler');
const { getDeliveryLogs } = require('../utils/webhookDispatcher');
const { subscribe } = require('../utils/sseManager');

exports.createWebhook = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { event, collection, filter, url, secret } = req.body;

    const whPath = getWebhooksPath(userId, dbName);
    const webhooks = readJSON(whPath) || [];

    const webhookId = 'wh_' + uuidv4().replace(/-/g, '').substring(0, 12);

    webhooks.push({
      webhookId,
      event,
      collection: collection || null,
      filter: filter || null,
      url,
      secret: secret || '',
      active: true,
      createdAt: new Date().toISOString()
    });

    writeJSON(whPath, webhooks);

    res.status(201).json({ webhookId, event, url, active: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create webhook', details: err.message });
  }
};

exports.listWebhooks = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const webhooks = readJSON(getWebhooksPath(userId, dbName)) || [];
    res.json({ webhooks: webhooks.map(w => ({ ...w, secret: undefined })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list webhooks', details: err.message });
  }
};

exports.deleteWebhook = (req, res) => {
  try {
    const { userId, dbName, webhookId } = req.params;
    const whPath = getWebhooksPath(userId, dbName);
    const webhooks = readJSON(whPath) || [];

    const idx = webhooks.findIndex(w => w.webhookId === webhookId);
    if (idx === -1) return res.status(404).json({ error: 'Webhook not found' });

    webhooks.splice(idx, 1);
    writeJSON(whPath, webhooks);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete webhook', details: err.message });
  }
};

exports.webhookLogs = (req, res) => {
  try {
    const { webhookId } = req.params;
    const logs = getDeliveryLogs(webhookId || null);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get logs', details: err.message });
  }
};

exports.liveStream = (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    subscribe(userId, dbName, collection, res);
  } catch (err) {
    res.status(500).json({ error: 'SSE connection failed', details: err.message });
  }
};

exports.liveStreamAll = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    subscribe(userId, dbName, '*', res);
  } catch (err) {
    res.status(500).json({ error: 'SSE connection failed', details: err.message });
  }
};
