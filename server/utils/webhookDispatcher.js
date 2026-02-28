/**
 * Webhook Dispatcher — HMAC-SHA256 signed delivery with retry logic
 */

const crypto = require('crypto');
const { readJSON, writeJSON } = require('./fileHandler');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getWebhookLogsPath() {
  return path.join(DATA_DIR, '_webhook_logs.json');
}

function logDelivery(webhookId, entry) {
  const logsPath = getWebhookLogsPath();
  const logs = readJSON(logsPath) || [];
  logs.push({
    webhookId,
    ...entry,
    deliveredAt: new Date().toISOString()
  });
  // Keep last 1000 logs
  if (logs.length > 1000) logs.splice(0, logs.length - 1000);
  writeJSON(logsPath, logs);
}

async function dispatch(webhook, eventType, document) {
  const payload = JSON.stringify({
    event: eventType,
    document,
    webhookId: webhook.webhookId,
    timestamp: new Date().toISOString()
  });

  // HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', webhook.secret || 'default_secret')
    .update(payload)
    .digest('hex');

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), parseInt(process.env.WEBHOOK_TIMEOUT_MS) || 5000);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KnowledgeDB-Signature': `sha256=${signature}`,
          'X-KnowledgeDB-Event': eventType,
          'X-Attempt': String(attempt)
        },
        body: payload,
        signal: controller.signal
      });

      clearTimeout(timeout);

      logDelivery(webhook.webhookId, {
        attempt,
        status: 'success',
        responseCode: response.status,
        event: eventType
      });
      return;
    } catch (err) {
      const delay = attempt * 2000;
      if (attempt < maxAttempts) {
        await sleep(delay);
      } else {
        logDelivery(webhook.webhookId, {
          attempt,
          status: 'failed',
          error: err.message,
          event: eventType
        });
      }
    }
  }
}

/**
 * Fire all matching webhooks for an event
 */
async function fireWebhooks(webhooks, eventType, collection, document) {
  const matching = webhooks.filter(wh => {
    if (!wh.active) return false;
    if (wh.event !== eventType) return false;
    if (wh.collection && wh.collection !== collection) return false;
    return true;
  });

  // Fire all matching webhooks in parallel (non-blocking)
  for (const wh of matching) {
    dispatch(wh, eventType, document).catch(() => {});
  }
}

function getDeliveryLogs(webhookId = null) {
  const logs = readJSON(getWebhookLogsPath()) || [];
  if (webhookId) return logs.filter(l => l.webhookId === webhookId);
  return logs;
}

module.exports = { dispatch, fireWebhooks, logDelivery, getDeliveryLogs };
