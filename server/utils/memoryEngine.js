/**
 * Memory Engine — keyword overlap similarity for AI agent memory recall
 */

function tokenize(text) {
  return text.toLowerCase().split(/\W+/).filter(t => t.length > 2);
}

/**
 * Compute keyword overlap similarity between query and memory content
 * Returns a score between 0 and 1
 */
function keywordSimilarity(query, content, keywords = []) {
  const queryTokens = new Set(tokenize(query));
  const contentTokens = new Set(tokenize(content));
  const keywordTokens = new Set(keywords.map(k => k.toLowerCase()));

  if (queryTokens.size === 0) return 0;

  let matches = 0;
  let total = queryTokens.size;

  for (const token of queryTokens) {
    if (contentTokens.has(token)) matches += 1;
    if (keywordTokens.has(token)) matches += 0.5; // bonus for tag match
  }

  return Math.min(matches / total, 1);
}

/**
 * Score and rank memories against a query
 */
function scoreMemories(query, memories, limit = 5, type = null) {
  let filtered = memories;
  if (type) {
    filtered = filtered.filter(m => m.type === type);
  }

  return filtered
    .map(m => ({
      ...m,
      relevance: Math.round(keywordSimilarity(query, m.content, m.keywords || m.tags || []) * 100) / 100
    }))
    .filter(m => m.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

module.exports = { keywordSimilarity, scoreMemories };
