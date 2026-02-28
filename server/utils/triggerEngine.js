/**
 * Trigger Engine — evaluate conditions and execute actions on data changes
 */

const { matchDocument, applyUpdate } = require('./queryEngine');
const { readJSON, writeJSON, getCollectionPath } = require('./fileHandler');

/**
 * Execute an action on a document
 */
async function executeAction(action, document, userId, dbName, collection, allWebhooks) {
  switch (action.type) {
    case 'update_field': {
      // Apply the $set to the matching document
      const collPath = getCollectionPath(userId, dbName, collection);
      const docs = readJSON(collPath) || [];
      const idx = docs.findIndex(d => d._id === document._id);
      if (idx !== -1) {
        const update = { $set: action.set || {} };
        docs[idx] = applyUpdate(docs[idx], update);
        writeJSON(collPath, docs);
      }
      return { executed: 'update_field', docId: document._id };
    }

    case 'copy_to_collection': {
      const targetPath = getCollectionPath(userId, dbName, action.targetCollection);
      const targetDocs = readJSON(targetPath) || [];
      const copy = { ...document, _copiedAt: new Date().toISOString(), _sourceCollection: collection };
      targetDocs.push(copy);
      writeJSON(targetPath, targetDocs);
      return { executed: 'copy_to_collection', target: action.targetCollection };
    }

    case 'webhook': {
      // Fire webhook via dispatcher (lazy import to avoid circular)
      const { dispatch } = require('./webhookDispatcher');
      if (action.url) {
        await dispatch({ webhookId: 'trigger', url: action.url, secret: action.secret || '' }, 'trigger.fired', document);
      }
      return { executed: 'webhook', url: action.url };
    }

    case 'graph_link': {
      const { readJSON: read, writeJSON: write, getGraphPath } = require('./fileHandler');
      const graphPath = getGraphPath(userId, dbName);
      const graph = read(graphPath) || { nodes: [], edges: [] };
      const { v4: uuidv4 } = require('uuid');
      graph.edges.push({
        id: 'edge_' + uuidv4().replace(/-/g, '').substring(0, 12),
        from: action.fromLabel,
        to: action.toLabel,
        relation: action.relation || 'trigger_link',
        weight: 1,
        auto: false,
        createdAt: new Date().toISOString()
      });
      write(graphPath, graph);
      return { executed: 'graph_link' };
    }

    default:
      return { executed: null, error: 'Unknown action type' };
  }
}

/**
 * Evaluate and execute all matching triggers for an event
 */
async function evaluateTriggers(triggers, eventType, collection, document, userId, dbName) {
  const results = [];
  const matching = triggers.filter(t => {
    if (!t.active) return false;
    if (t.on !== eventType) return false;
    if (t.collection && t.collection !== collection) return false;
    if (t.condition && !matchDocument(document, t.condition)) return false;
    return true;
  });

  for (const trigger of matching) {
    try {
      const result = await executeAction(trigger.action, document, userId, dbName, collection);
      results.push({ triggerId: trigger.triggerId, ...result });
    } catch (err) {
      results.push({ triggerId: trigger.triggerId, error: err.message });
    }
  }

  return results;
}

module.exports = { evaluateTriggers, executeAction };
