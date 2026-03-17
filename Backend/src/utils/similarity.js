const stopWords = new Set([
  'a', 'an', 'the', 'is', 'are', 'to', 'of', 'in', 'on', 'for', 'with',
  'and', 'or', 'how', 'what', 'why', 'when', 'where', 'i', 'me', 'my', 'we',
  'our', 'you', 'your', 'this', 'that',
]);

const normalize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text = '') =>
  normalize(text)
    .split(' ')
    .filter((token) => token && !stopWords.has(token));

const jaccard = (left, right) => {
  if (!left.size || !right.size) return 0;

  let intersect = 0;
  left.forEach((token) => {
    if (right.has(token)) {
      intersect += 1;
    }
  });

  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersect / union;
};

// Placeholder similarity function. Can be replaced with OpenAI comparison.
export const areDoubtsSimilar = (leftText = '', rightText = '') => {
  const leftNorm = normalize(leftText);
  const rightNorm = normalize(rightText);

  if (!leftNorm || !rightNorm) return false;
  if (leftNorm === rightNorm) return true;
  if (leftNorm.includes(rightNorm) || rightNorm.includes(leftNorm)) return true;

  const leftTokens = new Set(tokenize(leftNorm));
  const rightTokens = new Set(tokenize(rightNorm));

  return jaccard(leftTokens, rightTokens) >= 0.45;
};
