const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON, getMemoryPath } = require('../utils/fileHandler');
const { scoreMemories } = require('../utils/memoryEngine');

exports.remember = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { agentId, type, content, tags = [] } = req.body;

    const memPath = getMemoryPath(userId, dbName);
    const memories = readJSON(memPath) || [];

    const maxItems = parseInt(process.env.MAX_MEMORY_ITEMS_PER_AGENT) || 1000;
    const agentMemories = memories.filter(m => m.agentId === agentId);
    if (agentMemories.length >= maxItems) {
      return res.status(400).json({ error: `Agent has reached maximum ${maxItems} memory items` });
    }

    const memoryId = 'mem_' + uuidv4().replace(/-/g, '').substring(0, 12);
    const now = new Date().toISOString();

    // Generate keywords from content
    const keywords = content.toLowerCase().split(/\W+/).filter(t => t.length > 3);

    memories.push({
      _id: memoryId,
      agentId,
      type,
      content,
      tags,
      keywords: [...new Set([...keywords, ...tags.map(t => t.toLowerCase())])],
      createdAt: now,
      lastAccessedAt: now
    });

    writeJSON(memPath, memories);

    res.status(201).json({ memoryId, stored: true });
  } catch (err) {
    res.status(500).json({ error: 'Remember failed', details: err.message });
  }
};

exports.recall = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { agentId, query, limit = 5, type } = req.body;

    const memPath = getMemoryPath(userId, dbName);
    const memories = readJSON(memPath) || [];
    const agentMemories = memories.filter(m => m.agentId === agentId);

    const scored = scoreMemories(query, agentMemories, limit, type);

    // Update lastAccessedAt for recalled memories
    const now = new Date().toISOString();
    for (const mem of scored) {
      const idx = memories.findIndex(m => m._id === mem._id);
      if (idx !== -1) memories[idx].lastAccessedAt = now;
    }
    writeJSON(memPath, memories);

    const result = scored.map(m => ({
      memoryId: m._id,
      content: m.content,
      type: m.type,
      relevance: m.relevance,
      createdAt: m.createdAt
    }));

    res.json({ memories: result });
  } catch (err) {
    res.status(500).json({ error: 'Recall failed', details: err.message });
  }
};

exports.forget = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { agentId, olderThan, type } = req.body;

    const memPath = getMemoryPath(userId, dbName);
    const memories = readJSON(memPath) || [];

    let deletedCount = 0;
    const remaining = memories.filter(m => {
      if (m.agentId !== agentId) return true;

      let shouldDelete = true;

      if (type && m.type !== type) shouldDelete = false;

      if (olderThan && shouldDelete) {
        const days = parseInt(olderThan);
        if (!isNaN(days)) {
          const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          if (new Date(m.createdAt) > cutoff) shouldDelete = false;
        }
      }

      if (shouldDelete) {
        deletedCount++;
        return false;
      }
      return true;
    });

    writeJSON(memPath, remaining);

    res.json({ deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Forget failed', details: err.message });
  }
};

exports.listMemories = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { agentId, type, limit = 20, skip = 0 } = req.query;

    const memPath = getMemoryPath(userId, dbName);
    let memories = readJSON(memPath) || [];

    if (agentId) memories = memories.filter(m => m.agentId === agentId);
    if (type) memories = memories.filter(m => m.type === type);

    const total = memories.length;
    memories = memories.slice(parseInt(skip) || 0, (parseInt(skip) || 0) + (parseInt(limit) || 20));

    res.json({ count: total, memories });
  } catch (err) {
    res.status(500).json({ error: 'List memories failed', details: err.message });
  }
};

// ===== Simple session-based memory endpoints =====

exports.rememberSimple = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, sessionId } = req.params;
    const { role, content } = req.body;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    const memPath = getMemoryPath(userId, dbName);
    const memories = readJSON(memPath) || [];

    const memoryId = 'mem_' + uuidv4().replace(/-/g, '').substring(0, 12);
    const now = new Date().toISOString();
    const keywords = content.toLowerCase().split(/\W+/).filter(t => t.length > 3);

    memories.push({
      _id: memoryId,
      agentId: sessionId,
      sessionId,
      type: 'conversation',
      role: role || 'user',
      content,
      tags: [],
      keywords: [...new Set(keywords)],
      createdAt: now,
      lastAccessedAt: now
    });

    writeJSON(memPath, memories);
    res.status(201).json({ memoryId, stored: true });
  } catch (err) {
    res.status(500).json({ error: 'Store memory failed', details: err.message });
  }
};

exports.getSession = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, sessionId } = req.params;

    const memPath = getMemoryPath(userId, dbName);
    const memories = readJSON(memPath) || [];
    const sessionMems = memories.filter(m => m.agentId === sessionId || m.sessionId === sessionId);

    res.json({ sessionId, count: sessionMems.length, messages: sessionMems });
  } catch (err) {
    res.status(500).json({ error: 'Get session failed', details: err.message });
  }
};

exports.recallSimple = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, sessionId } = req.params;
    const { query, limit = 5 } = req.body;

    const memPath = getMemoryPath(userId, dbName);
    const memories = readJSON(memPath) || [];
    const sessionMems = memories.filter(m => m.agentId === sessionId || m.sessionId === sessionId);

    if (!query) return res.json({ memories: sessionMems.slice(-limit) });

    const scored = scoreMemories(query, sessionMems, limit);
    res.json({ memories: scored });
  } catch (err) {
    res.status(500).json({ error: 'Recall failed', details: err.message });
  }
};

exports.forgetSession = (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const { dbName, sessionId } = req.params;

    const memPath = getMemoryPath(userId, dbName);
    const memories = readJSON(memPath) || [];
    const remaining = memories.filter(m => m.agentId !== sessionId && m.sessionId !== sessionId);
    const deleted = memories.length - remaining.length;

    writeJSON(memPath, remaining);
    res.json({ deletedCount: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Forget session failed', details: err.message });
  }
};
