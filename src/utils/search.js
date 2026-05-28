// Fuzzy search for Swiss communes.
// Goals:
//   - Multi-token, order-independent ("ecublens vd" == "vd ecublens")
//   - Tokens match against commune name, canton code, OR canton long name
//   - Diacritic-insensitive + handles non-German keyboards
//     ("Zurich" or "Zuerich" both match "Zürich")
//   - Ranks prefix/exact matches above mid-string substring matches

const ASCII_MAP = {
  ä: 'a', ö: 'o', ü: 'u', Ä: 'a', Ö: 'o', Ü: 'u',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  à: 'a', â: 'a', á: 'a',
  î: 'i', ï: 'i', í: 'i',
  ô: 'o', ó: 'o',
  û: 'u', ù: 'u', ú: 'u',
  ç: 'c', ñ: 'n', ß: 'ss',
};
const GERMAN_MAP = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'ae', Ö: 'oe', Ü: 'ue', ß: 'ss' };

function fold(s, map) {
  if (!s) return '';
  let out = '';
  for (const ch of s) out += map[ch] ?? ch;
  return out.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
export const ascii  = (s) => fold(s, ASCII_MAP);
export const german = (s) => fold(s, GERMAN_MAP);

// Canton long names (DE/FR/IT variants).
const CANTON_NAMES = {
  ZH: ['Zürich'],
  BE: ['Bern', 'Berne'],
  LU: ['Luzern', 'Lucerne'],
  UR: ['Uri'],
  SZ: ['Schwyz'],
  OW: ['Obwalden'],
  NW: ['Nidwalden'],
  GL: ['Glarus'],
  ZG: ['Zug'],
  FR: ['Fribourg', 'Freiburg'],
  SO: ['Solothurn', 'Soleure'],
  BS: ['Basel-Stadt', 'Basel'],
  BL: ['Basel-Landschaft', 'Baselland'],
  SH: ['Schaffhausen'],
  AR: ['Appenzell Ausserrhoden'],
  AI: ['Appenzell Innerrhoden'],
  SG: ['St. Gallen', 'Saint-Gall', 'San Gallo'],
  GR: ['Graubünden', 'Grisons', 'Grigioni'],
  AG: ['Aargau', 'Argovie'],
  TG: ['Thurgau', 'Thurgovie'],
  TI: ['Ticino', 'Tessin'],
  VD: ['Vaud', 'Waadt'],
  VS: ['Valais', 'Wallis'],
  NE: ['Neuchâtel', 'Neuenburg'],
  GE: ['Genève', 'Geneva', 'Genf', 'Ginevra'],
  JU: ['Jura'],
};

// Pre-fold every searchable token for each canton — used to test tokens.
function buildCantonHaystack(code) {
  const variants = [code, ...(CANTON_NAMES[code] || [])];
  return variants.flatMap((v) => [ascii(v), german(v)]);
}
const CANTON_HAYSTACK = Object.fromEntries(
  Object.keys(CANTON_NAMES).map((c) => [c, buildCantonHaystack(c)]),
);

// Try every fold of every haystack for a single query token and pick the best
// substring score we can find.
function bestTokenScore(token, haystacks) {
  let best = 0;
  for (const h of haystacks) {
    if (!h) continue;
    if (h === token)            return 1000;
    if (h.startsWith(token))    { best = Math.max(best, 800); continue; }
    if (h.includes(token))      best = Math.max(best, 400);
  }
  return best;
}

function buildCommuneHaystacks(commune) {
  // Commune name folds + canton variants + the code itself.
  const nameFolds = [ascii(commune.n), german(commune.n)];
  const cantonFolds = CANTON_HAYSTACK[commune.c] || [];
  return { nameFolds, cantonFolds };
}

// Score a commune. Every query token must hit *something*; otherwise 0.
function score(commune, tokens) {
  const { nameFolds, cantonFolds } = buildCommuneHaystacks(commune);
  const all = [...nameFolds, ...cantonFolds];
  let total = 0;
  let nameMatches = 0;
  for (const tok of tokens) {
    if (!tok) continue;
    const s = bestTokenScore(tok, all);
    if (s === 0) return 0;
    total += s;
    // Track whether the token actually hit the commune *name* (not just canton)
    // so that "vd" alone doesn't out-rank "ecublens".
    if (bestTokenScore(tok, nameFolds) > 0) nameMatches++;
  }
  // Boost when more tokens hit the name (rather than just the canton).
  total += nameMatches * 50;
  // Tiny bonus: shorter names rank above longer ones with the same score
  total -= commune.n.length * 0.01;
  return total;
}

export function searchCommunes(query, communes, limit = 8) {
  if (!query || !query.trim()) return [];
  // Tokenize on whitespace AND commas (so "Ecublens, VD" still works).
  const tokens = query
    .split(/[\s,]+/)
    .map((t) => ascii(t))
    .filter(Boolean);
  if (tokens.length === 0) return [];

  const out = [];
  for (const [bfs, c] of Object.entries(communes)) {
    const s = score(c, tokens);
    if (s > 0) out.push({ bfs, c, score: s });
  }
  out.sort((a, b) => b.score - a.score || a.c.n.localeCompare(b.c.n, 'de-CH'));
  return out.slice(0, limit);
}
