/**
 * BM25 Keyword Search Engine
 * Implements Okapi BM25 ranking — the gold standard for keyword search.
 * Pure JavaScript, zero external dependencies.
 */

class BM25Engine {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1; // term frequency saturation (1.2–2.0)
    this.b = b;    // length normalization (0 = none, 1 = full)
  }

  /**
   * Extract all text content from a document into lowercase tokens
   */
  tokenize(doc) {
    return Object.values(doc)
      .filter(v => typeof v === 'string')
      .join(' ')
      .toLowerCase()
      .split(/\W+/)
      .filter(t => t.length > 2);
  }

  /**
   * Build an inverted index from a collection of documents
   */
  buildIndex(documents) {
    const index = {};
    const docLengths = [];
    let totalLength = 0;

    documents.forEach((doc, i) => {
      const tokens = this.tokenize(doc);
      docLengths[i] = tokens.length;
      totalLength += tokens.length;
      const freq = {};
      tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
      Object.entries(freq).forEach(([term, count]) => {
        if (!index[term]) index[term] = [];
        index[term].push({ docIndex: i, freq: count });
      });
    });

    return {
      index,
      docLengths,
      avgLength: documents.length > 0 ? totalLength / documents.length : 0
    };
  }

  /**
   * Score all documents against a query string
   */
  score(query, documents) {
    if (!documents || documents.length === 0) return [];

    const { index, docLengths, avgLength } = this.buildIndex(documents);
    const queryTokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    const N = documents.length;
    const scores = new Array(N).fill(0);

    queryTokens.forEach(term => {
      if (!index[term]) return;
      const df = index[term].length;
      const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);

      index[term].forEach(({ docIndex, freq }) => {
        const dl = docLengths[docIndex];
        const tf = (freq * (this.k1 + 1)) /
                   (freq + this.k1 * (1 - this.b + this.b * dl / (avgLength || 1)));
        scores[docIndex] += idf * tf;
      });
    });

    return documents
      .map((doc, i) => ({ doc, score: scores[i] }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }
}

module.exports = BM25Engine;
