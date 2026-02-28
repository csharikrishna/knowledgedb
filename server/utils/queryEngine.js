/**
 * Query Engine — evaluates documents against MongoDB-like query expressions.
 * Supports: $gt, $gte, $lt, $lte, $ne, $in, $nin, $exists, $regex
 */

function matchValue(docValue, condition) {
  if (condition === null || condition === undefined) {
    return docValue === condition;
  }

  if (typeof condition !== 'object' || condition instanceof RegExp || Array.isArray(condition)) {
    return docValue === condition;
  }

  // Condition is an object with operators
  for (const [op, val] of Object.entries(condition)) {
    switch (op) {
      case '$gt':
        if (!(docValue > val)) return false;
        break;
      case '$gte':
        if (!(docValue >= val)) return false;
        break;
      case '$lt':
        if (!(docValue < val)) return false;
        break;
      case '$lte':
        if (!(docValue <= val)) return false;
        break;
      case '$ne':
        if (docValue === val) return false;
        break;
      case '$in':
        if (!Array.isArray(val) || !val.includes(docValue)) return false;
        break;
      case '$nin':
        if (!Array.isArray(val) || val.includes(docValue)) return false;
        break;
      case '$exists':
        if (val && docValue === undefined) return false;
        if (!val && docValue !== undefined) return false;
        break;
      case '$regex': {
        if (typeof docValue !== 'string') return false;
        try {
          const regex = new RegExp(val, 'i');
          if (!regex.test(docValue)) return false;
        } catch {
          return false;
        }
        break;
      }
      default:
        // Unknown operator — treat as exact match on nested field
        if (typeof docValue === 'object' && docValue !== null) {
          if (!matchDocument(docValue, { [op]: val })) return false;
        } else {
          return false;
        }
    }
  }
  return true;
}

function matchDocument(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [field, condition] of Object.entries(query)) {
    const docValue = getNestedValue(doc, field);
    if (!matchValue(docValue, condition)) return false;
  }
  return true;
}

function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

function applySort(documents, sort) {
  if (!sort || Object.keys(sort).length === 0) return documents;

  return [...documents].sort((a, b) => {
    for (const [field, direction] of Object.entries(sort)) {
      const aVal = getNestedValue(a, field);
      const bVal = getNestedValue(b, field);
      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
    }
    return 0;
  });
}

function applyProjection(documents, fields) {
  if (!fields || !Array.isArray(fields) || fields.length === 0) return documents;

  return documents.map(doc => {
    const projected = {};
    // Always include _id
    projected._id = doc._id;
    for (const field of fields) {
      if (doc.hasOwnProperty(field)) {
        projected[field] = doc[field];
      }
    }
    return projected;
  });
}

function queryDocuments(documents, query = {}, options = {}) {
  let results = documents.filter(doc => matchDocument(doc, query));

  if (options.sort) {
    results = applySort(results, options.sort);
  }

  const total = results.length;

  if (options.skip) {
    results = results.slice(options.skip);
  }

  if (options.limit) {
    results = results.slice(0, options.limit);
  }

  if (options.fields) {
    results = applyProjection(results, options.fields);
  }

  return { results, total };
}

function applyUpdate(doc, update) {
  const modified = { ...doc };

  if (update.$set) {
    for (const [key, val] of Object.entries(update.$set)) {
      modified[key] = val;
    }
  }

  if (update.$inc) {
    for (const [key, val] of Object.entries(update.$inc)) {
      modified[key] = (modified[key] || 0) + val;
    }
  }

  if (update.$unset) {
    for (const key of Object.keys(update.$unset)) {
      delete modified[key];
    }
  }

  modified._updatedAt = new Date().toISOString();
  modified._version = (modified._version || 0) + 1;

  return modified;
}

module.exports = { matchDocument, queryDocuments, applyUpdate, applySort, applyProjection, getNestedValue };
