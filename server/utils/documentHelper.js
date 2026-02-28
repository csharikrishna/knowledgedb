const { v4: uuidv4 } = require('uuid');

function generateId(prefix = 'doc') {
  return `${prefix}_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
}

function addMetadata(doc) {
  const now = new Date().toISOString();
  return {
    _id: generateId('doc'),
    ...doc,
    _createdAt: now,
    _updatedAt: now,
    _version: 1
  };
}

function validateDoc(doc) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return { valid: false, error: 'Document must be a non-null object' };
  }
  // Prevent overwriting system fields
  const reserved = ['_id', '_createdAt', '_updatedAt', '_version'];
  for (const key of reserved) {
    if (doc.hasOwnProperty(key)) {
      delete doc[key];
    }
  }
  return { valid: true };
}

function buildIndex(documents) {
  const index = {};
  documents.forEach((doc, i) => {
    if (doc._id) {
      index[doc._id] = i;
    }
  });
  return index;
}

module.exports = { generateId, addMetadata, validateDoc, buildIndex };
