const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON, getTriggersPath } = require('../utils/fileHandler');

exports.createTrigger = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { name, on, collection, condition, action } = req.body;

    const trPath = getTriggersPath(userId, dbName);
    const triggers = readJSON(trPath) || [];

    const triggerId = 'tr_' + uuidv4().replace(/-/g, '').substring(0, 12);

    triggers.push({
      triggerId,
      name,
      on,
      collection,
      condition: condition || null,
      action,
      active: true,
      createdAt: new Date().toISOString()
    });

    writeJSON(trPath, triggers);

    res.status(201).json({ triggerId, name, active: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create trigger', details: err.message });
  }
};

exports.listTriggers = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const triggers = readJSON(getTriggersPath(userId, dbName)) || [];
    res.json({ triggers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list triggers', details: err.message });
  }
};

exports.updateTrigger = (req, res) => {
  try {
    const { userId, dbName, triggerId } = req.params;
    const trPath = getTriggersPath(userId, dbName);
    const triggers = readJSON(trPath) || [];

    const trigger = triggers.find(t => t.triggerId === triggerId);
    if (!trigger) return res.status(404).json({ error: 'Trigger not found' });

    // Allow updating active, condition, action, name
    if (req.body.active !== undefined) trigger.active = req.body.active;
    if (req.body.condition) trigger.condition = req.body.condition;
    if (req.body.action) trigger.action = req.body.action;
    if (req.body.name) trigger.name = req.body.name;

    writeJSON(trPath, triggers);

    res.json({ success: true, updated: trigger });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trigger', details: err.message });
  }
};

exports.deleteTrigger = (req, res) => {
  try {
    const { userId, dbName, triggerId } = req.params;
    const trPath = getTriggersPath(userId, dbName);
    const triggers = readJSON(trPath) || [];

    const idx = triggers.findIndex(t => t.triggerId === triggerId);
    if (idx === -1) return res.status(404).json({ error: 'Trigger not found' });

    triggers.splice(idx, 1);
    writeJSON(trPath, triggers);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trigger', details: err.message });
  }
};
