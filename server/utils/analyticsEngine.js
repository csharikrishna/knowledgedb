/**
 * Analytics Engine — groupBy, sum, avg, min, max, timeSeries
 */

function groupBy(documents, field) {
  const groups = {};
  documents.forEach(doc => {
    const val = doc[field];
    if (val !== undefined && val !== null) {
      const key = String(val);
      groups[key] = (groups[key] || 0) + 1;
    }
  });
  return groups;
}

function sum(documents, field) {
  return documents.reduce((acc, doc) => {
    const val = parseFloat(doc[field]);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}

function avg(documents, field) {
  const validDocs = documents.filter(doc => typeof doc[field] === 'number' || !isNaN(parseFloat(doc[field])));
  if (validDocs.length === 0) return 0;
  return sum(validDocs, field) / validDocs.length;
}

function min(documents, field) {
  const vals = documents.map(d => parseFloat(d[field])).filter(v => !isNaN(v));
  return vals.length > 0 ? Math.min(...vals) : null;
}

function max(documents, field) {
  const vals = documents.map(d => parseFloat(d[field])).filter(v => !isNaN(v));
  return vals.length > 0 ? Math.max(...vals) : null;
}

function timeSeries(documents, options = {}) {
  const { field = '_createdAt', interval = 'day', last = 30 } = options;

  const now = new Date();
  const buckets = {};

  // Initialize buckets
  for (let i = last - 1; i >= 0; i--) {
    const d = new Date(now);
    if (interval === 'day') d.setDate(d.getDate() - i);
    else if (interval === 'week') d.setDate(d.getDate() - i * 7);
    else if (interval === 'month') d.setMonth(d.getMonth() - i);

    const key = formatDate(d, interval);
    buckets[key] = 0;
  }

  // Count documents into buckets
  documents.forEach(doc => {
    const dateStr = doc[field];
    if (!dateStr) return;
    const docDate = new Date(dateStr);
    if (isNaN(docDate.getTime())) return;
    const key = formatDate(docDate, interval);
    if (buckets.hasOwnProperty(key)) {
      buckets[key]++;
    }
  });

  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}

function formatDate(d, interval) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  if (interval === 'month') return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

function computeAnalytics(documents, config) {
  const result = {};

  if (config.groupBy) {
    result.groupBy = groupBy(documents, config.groupBy);
  }

  if (config.count) {
    result.count = documents.length;
  }

  if (config.sum) {
    result[`sum_${config.sum}`] = Math.round(sum(documents, config.sum) * 100) / 100;
  }

  if (config.avg) {
    result[`avg_${config.avg}`] = Math.round(avg(documents, config.avg) * 100) / 100;
  }

  if (config.min) {
    result[`min_${config.min}`] = min(documents, config.min);
  }

  if (config.max) {
    result[`max_${config.max}`] = max(documents, config.max);
  }

  if (config.timeSeries) {
    result.timeSeries = timeSeries(documents, config.timeSeries);
  }

  return result;
}

module.exports = { groupBy, sum, avg, min, max, timeSeries, computeAnalytics };
