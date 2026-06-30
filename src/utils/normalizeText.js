export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function distance(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length];
}

function closeEnough(term, word) {
  if (word.includes(term) || term.includes(word)) return true;
  if (term.length < 4 || word.length < 4) return false;
  return distance(term, word) <= Math.max(1, Math.floor(term.length * 0.28));
}

export function fuzzyIncludes(value = "", query = "") {
  const normalizedQuery = normalizeText(query);
  const normalizedValue = normalizeText(value);
  if (!normalizedQuery) return true;
  if (normalizedValue.includes(normalizedQuery)) return true;
  const words = normalizedValue.split(/\s+/).filter(Boolean);
  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => words.some((word) => closeEnough(term, word)));
}
