// Loads ESTV-derived JSON datasets (built by scripts/build-data.mjs).
// Returns a Promise<{federal, cantons, communes, topo}> with caching.

const BASE = import.meta.env.BASE_URL || '/';

let _cache = null;
let _inflight = null;

async function fetchJSON(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
  return r.json();
}

export function loadData() {
  if (_cache) return Promise.resolve(_cache);
  if (_inflight) return _inflight;
  _inflight = (async () => {
    const [federal, cantons, communes, deductions, topo] = await Promise.all([
      fetchJSON('data/federal.json'),
      fetchJSON('data/cantons.json'),
      fetchJSON('data/communes.json'),
      fetchJSON('data/deductions.json'),
      fetchJSON('data/swiss-topo.json'),
    ]);
    _cache = {
      federal: federal.federal,
      cantons: cantons.cantons,
      communes: communes.communes,
      deductions: deductions,
      topo,
      year: federal.year,
    };
    return _cache;
  })();
  return _inflight;
}
