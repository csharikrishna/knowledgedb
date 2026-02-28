/**
 * Hybrid Search — fuses BM25 keyword scores with Graph traversal scores.
 * score = (KEYWORD_WEIGHT × BM25_normalized) + (GRAPH_WEIGHT × graph_normalized)
 */

const KEYWORD_WEIGHT = 0.4;
const GRAPH_WEIGHT = 0.6;

function fuseScores(keywordResults, graphResults) {
  const scoreMap = {};

  // Normalize keyword scores to 0–1
  const maxKW = Math.max(...keywordResults.map(r => r.score), 1);
  keywordResults.forEach(r => {
    const id = r.doc._id;
    if (!scoreMap[id]) scoreMap[id] = { doc: r.doc, keyword: 0, graph: 0, collection: r.collection || '' };
    scoreMap[id].keyword = r.score / maxKW;
  });

  // Normalize graph scores to 0–1
  const maxGR = Math.max(...graphResults.map(r => r.score), 1);
  graphResults.forEach(r => {
    const id = r.doc._id;
    if (!scoreMap[id]) scoreMap[id] = { doc: r.doc, keyword: 0, graph: 0, collection: r.collection || '' };
    scoreMap[id].graph = r.score / maxGR;
    if (r.collection) scoreMap[id].collection = r.collection;
  });

  return Object.values(scoreMap)
    .map(r => ({
      document: r.doc,
      collection: r.collection,
      scores: {
        keyword: Math.round(r.keyword * 100) / 100,
        graph: Math.round(r.graph * 100) / 100,
        hybrid: Math.round((KEYWORD_WEIGHT * r.keyword + GRAPH_WEIGHT * r.graph) * 100) / 100
      }
    }))
    .sort((a, b) => b.scores.hybrid - a.scores.hybrid);
}

module.exports = { fuseScores, KEYWORD_WEIGHT, GRAPH_WEIGHT };
