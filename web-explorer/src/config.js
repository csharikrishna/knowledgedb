/**
 * API Configuration for KnowledgeDB Web Explorer
 * 
 * Change the API_URL if your backend is hosted elsewhere
 */

const API_CONFIG = {
  // Backend API URL
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Storage keys
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER_ID: 'userId',
    DB_NAME: 'dbName',
    SESSION_ID: 'sessionId',
  },

  // Default values
  DEFAULTS: {
    CONTEXT_DEPTH: 2,
    SEARCH_LIMIT: 10,
    MEMORY_ROLE_DEFAULT: 'user',
  },

  // Feature flags
  FEATURES: {
    GRAPH_VISUALIZATION: true,
    MEMORY_SYSTEM: true,
    GRAPHRAG: true,
    ADMIN_PANEL: true,
  },
};

export default API_CONFIG;
