const Joi = require('joi');

const schemas = {
  signup: Joi.object({
    email: Joi.string().max(100).optional(),
    username: Joi.string().max(100).optional(),
    password: Joi.string().min(6).max(128).required()
  }).or('email', 'username'),

  login: Joi.object({
    email: Joi.string().optional(),
    username: Joi.string().optional(),
    password: Joi.string().required()
  }).or('email', 'username'),

  changePassword: Joi.object({
    oldPassword: Joi.string().optional(),
    currentPassword: Joi.string().optional(),
    newPassword: Joi.string().min(6).max(128).required()
  }),

  createDatabase: Joi.object({
    name: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(2).max(50).optional(),
    dbName: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(2).max(50).optional()
  }).or('name', 'dbName'),

  createKey: Joi.object({
    name: Joi.string().max(50).required(),
    scopes: Joi.array().items(Joi.string().valid('read', 'write', 'delete', 'graph', 'memory', 'admin')).min(1).required(),
    collections: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())).optional().allow(null),
    expiresIn: Joi.string().valid('7d', '30d', '90d', 'never').optional()
  }),

  insertDocuments: Joi.object({
    document: Joi.object().optional(),
    documents: Joi.array().items(Joi.object()).optional()
  }).or('document', 'documents'),

  findDocuments: Joi.object({
    query: Joi.object().optional().default({}),
    options: Joi.object({
      limit: Joi.number().integer().min(1).max(1000).optional(),
      skip: Joi.number().integer().min(0).optional(),
      sort: Joi.object().optional(),
      fields: Joi.array().items(Joi.string()).optional()
    }).optional().default({})
  }),

  updateDocuments: Joi.object({
    query: Joi.object().required(),
    update: Joi.object().required(),
    multi: Joi.boolean().optional().default(false)
  }),

  deleteDocuments: Joi.object({
    query: Joi.object().required(),
    multi: Joi.boolean().optional().default(false)
  }),

  traverse: Joi.object({
    startNode: Joi.string().required(),
    depth: Joi.number().integer().min(1).max(5).optional().default(2)
  }),

  path: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required()
  }),

  link: Joi.object({
    fromLabel: Joi.string().required(),
    toLabel: Joi.string().required(),
    relation: Joi.string().required()
  }),

  search: Joi.object({
    query: Joi.string().required(),
    mode: Joi.string().valid('keyword', 'graph', 'hybrid').optional().default('hybrid'),
    collections: Joi.array().items(Joi.string()).optional(),
    graphDepth: Joi.number().integer().min(1).max(5).optional().default(2),
    limit: Joi.number().integer().min(1).max(100).optional().default(10)
  }),

  remember: Joi.object({
    agentId: Joi.string().required(),
    type: Joi.string().valid('semantic', 'episodic', 'procedural').required(),
    content: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  recall: Joi.object({
    agentId: Joi.string().required(),
    query: Joi.string().required(),
    limit: Joi.number().integer().min(1).max(50).optional().default(5),
    type: Joi.string().valid('semantic', 'episodic', 'procedural').optional()
  }),

  forget: Joi.object({
    agentId: Joi.string().required(),
    olderThan: Joi.string().optional(),
    type: Joi.string().valid('semantic', 'episodic', 'procedural').optional()
  }),

  ask: Joi.object({
    question: Joi.string().required(),
    contextDepth: Joi.number().integer().min(1).max(5).optional().default(3),
    collections: Joi.array().items(Joi.string()).optional(),
    limit: Joi.number().integer().min(1).max(50).optional().default(10)
  }),

  createWebhook: Joi.object({
    event: Joi.string().valid('document.inserted', 'document.updated', 'document.deleted', 'graph.node_linked', 'collection.threshold').required(),
    collection: Joi.string().optional(),
    filter: Joi.object().optional(),
    url: Joi.string().uri().required(),
    secret: Joi.string().optional()
  }),

  createTrigger: Joi.object({
    name: Joi.string().max(100).required(),
    on: Joi.string().valid('document.inserted', 'document.updated', 'document.deleted').required(),
    collection: Joi.string().required(),
    condition: Joi.object().optional(),
    action: Joi.object({
      type: Joi.string().valid('update_field', 'copy_to_collection', 'webhook', 'graph_link').required()
    }).required().unknown(true)
  }),

  analytics: Joi.object({
    groupBy: Joi.string().optional(),
    count: Joi.boolean().optional(),
    sum: Joi.string().optional(),
    avg: Joi.string().optional(),
    min: Joi.string().optional(),
    max: Joi.string().optional(),
    timeSeries: Joi.object({
      field: Joi.string().optional().default('_createdAt'),
      interval: Joi.string().valid('day', 'week', 'month').optional().default('day'),
      last: Joi.number().integer().min(1).max(365).optional().default(30)
    }).optional()
  }),

  publish: Joi.object({
    fields: Joi.array().items(Joi.string()).min(1).required()
  }),

  rollback: Joi.object({
    version: Joi.number().integer().min(0).required()
  }),

  adminLogin: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
};

function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
    if (error) {
      const details = error.details.map(d => d.message);
      return res.status(400).json({ error: 'Validation failed', details });
    }

    req.body = value;
    next();
  };
}

module.exports = { validate, schemas };
