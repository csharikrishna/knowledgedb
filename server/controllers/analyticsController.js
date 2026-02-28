const { readJSON, getCollectionPath } = require('../utils/fileHandler');
const { matchDocument } = require('../utils/queryEngine');
const { computeAnalytics } = require('../utils/analyticsEngine');

exports.runAnalytics = (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const config = req.body;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    const result = computeAnalytics(documents, config);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Analytics failed', details: err.message });
  }
};
