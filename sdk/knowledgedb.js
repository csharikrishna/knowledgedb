/**
 * KnowledgeDB JavaScript/Node.js SDK
 * 
 * Usage:
 *   const KnowledgeDB = require('./knowledgedb');
 *   const db = new KnowledgeDB('http://localhost:5000/db/usr_abc/myapp', 'kdb_...');
 *   await db.insert('users', { name: 'Alice', age: 25 });
 */

class KnowledgeDB {
  constructor(endpoint, apiKey) {
    this.endpoint = endpoint.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.graph = new GraphAPI(this);
    this.memory = new MemoryAPI(this);
  }

  async _request(method, path, body = null) {
    const url = `${this.endpoint}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  }

  // ---- CRUD ----

  async insert(collection, documents) {
    const body = Array.isArray(documents)
      ? { documents }
      : { document: documents };
    return this._request('POST', `/${collection}/insert`, body);
  }

  async find(collection, query = {}, options = {}) {
    return this._request('POST', `/${collection}/find`, { query, options });
  }

  async update(collection, query, update, multi = false) {
    return this._request('PUT', `/${collection}/update`, { query, update, multi });
  }

  async delete(collection, query, multi = false) {
    return this._request('DELETE', `/${collection}/delete`, { query, multi });
  }

  async count(collection, query = {}) {
    return this._request('POST', `/${collection}/count`, { query });
  }

  async collections() {
    return this._request('GET', '/collections');
  }

  async history(collection, docId) {
    return this._request('GET', `/${collection}/${docId}/history`);
  }

  async rollback(collection, docId, version) {
    return this._request('POST', `/${collection}/${docId}/rollback`, { version });
  }

  // ---- Search ----

  async search(query, options = {}) {
    return this._request('POST', '/search', {
      query,
      mode: options.mode || 'hybrid',
      collections: options.collections,
      graphDepth: options.graphDepth || 2,
      limit: options.limit || 10
    });
  }

  // ---- GraphRAG ----

  async ask(question, options = {}) {
    return this._request('POST', '/ask', {
      question,
      contextDepth: options.depth || 3,
      collections: options.collections,
      limit: options.limit || 10
    });
  }

  // ---- Analytics ----

  async analytics(collection, config) {
    return this._request('POST', `/${collection}/analytics`, config);
  }

  // ---- Export ----

  async exportCollection(collection, format = 'json') {
    return this._request('GET', `/${collection}/export?format=${format}`);
  }

  // ---- SSE ----

  subscribe(collection, callback) {
    if (typeof EventSource === 'undefined') {
      throw new Error('EventSource is not available. Use a browser or install eventsource package.');
    }
    const url = `${this.endpoint}/${collection}/live?apikey=${this.apiKey}`;
    const es = new EventSource(url);
    es.onmessage = (event) => {
      try {
        callback(JSON.parse(event.data));
      } catch (err) {
        callback({ error: err.message, raw: event.data });
      }
    };
    es.onerror = () => { /* reconnect automatically */ };
    return es; // caller can close with es.close()
  }
}

class GraphAPI {
  constructor(db) { this.db = db; }

  async nodes() { return this.db._request('GET', '/graph/nodes'); }
  async edges() { return this.db._request('GET', '/graph/edges'); }
  async stats() { return this.db._request('GET', '/graph/stats'); }

  async node(entityId) {
    return this.db._request('GET', `/graph/node/${entityId}`);
  }

  async search(query) {
    return this.db._request('GET', `/graph/search?q=${encodeURIComponent(query)}`);
  }

  async traverse(startNode, depth = 2) {
    return this.db._request('POST', '/graph/traverse', { startNode, depth });
  }

  async path(from, to) {
    return this.db._request('POST', '/graph/path', { from, to });
  }

  async link(fromLabel, toLabel, relation) {
    return this.db._request('POST', '/graph/link', { fromLabel, toLabel, relation });
  }

  async deleteLink(edgeId) {
    return this.db._request('DELETE', `/graph/link/${edgeId}`);
  }
}

class MemoryAPI {
  constructor(db) { this.db = db; }

  async remember(agentId, type, content, tags = []) {
    return this.db._request('POST', '/memory/remember', { agentId, type, content, tags });
  }

  async recall(agentId, query, options = {}) {
    return this.db._request('POST', '/memory/recall', {
      agentId,
      query,
      limit: options.limit || 5,
      type: options.type
    });
  }

  async forget(agentId, options = {}) {
    return this.db._request('DELETE', '/memory/forget', {
      agentId,
      olderThan: options.olderThan,
      type: options.type
    });
  }

  async list(agentId, options = {}) {
    const params = new URLSearchParams({ agentId });
    if (options.type) params.set('type', options.type);
    if (options.limit) params.set('limit', options.limit);
    if (options.skip) params.set('skip', options.skip);
    return this.db._request('GET', `/memory/list?${params.toString()}`);
  }
}

// Support both CommonJS and ESM
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KnowledgeDB;
}
