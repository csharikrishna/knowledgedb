/**
 * SSE (Server-Sent Events) Manager
 * Registry: key = "userId/dbName/collection", value = Set of response objects
 */

const clients = new Map();

function subscribe(userId, dbName, collection, res) {
  const key = `${userId}/${dbName}/${collection}`;
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Remove on disconnect
  res.on('close', () => {
    clients.get(key)?.delete(res);
    if (clients.get(key)?.size === 0) clients.delete(key);
  });
}

function broadcast(userId, dbName, collection, eventType, document) {
  const key = `${userId}/${dbName}/${collection}`;
  const payload = JSON.stringify({
    type: eventType,
    document,
    timestamp: new Date().toISOString()
  });
  clients.get(key)?.forEach(res => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (err) {
      // Client disconnected
    }
  });
}

function getClientCount(userId, dbName, collection) {
  const key = `${userId}/${dbName}/${collection}`;
  return clients.get(key)?.size || 0;
}

function getTotalClients() {
  let total = 0;
  clients.forEach(set => { total += set.size; });
  return total;
}

module.exports = { subscribe, broadcast, getClientCount, getTotalClients };
