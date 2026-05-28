#!/usr/bin/env node
// Build script: downloads ESTV-derived data (via devbrains-com/swisstaxcalculator)
// and a swiss-maps topojson, writes optimized JSON files to public/data/.
//
// We preserve the raw tariff `table`, `tableType`, `splitting`, and the matched
// `group` — the runtime needs all of these to faithfully reproduce ESTV math
// across the 5 table types: FLATTAX, ZUERICH (width-bracket), BUND (threshold),
// FREIBURG (interpolation), FORMEL (formula).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const YEAR = 2026;
const REPO = 'devbrains-com/swisstaxcalculator';
const BRANCH = 'master';
const TOPO_URL = 'https://unpkg.com/swiss-maps@4/2021/ch-combined.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'data');

const raw = (p) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${p}`;

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

const ELIGIBLE_GROUPS = ['VERHEIRATET', 'LEDIG_MIT_KINDER', 'LEDIG_ALLEINE', 'LEDIG_KONKUBINAT'];

function pickIncomeTariff(tariffs, mode) {
  // mode: 'single' | 'married'
  // Returns { tariff, group } where `group` is the chosen ELIGIBLE_GROUPS key.
  const income = tariffs.filter(t => t.taxType === 'EINKOMMENSSTEUER');
  const has = (t, frag) => t.group?.split(',').some(g => g === frag);

  const tryGroup = (g) => {
    const t = income.find(x => has(x, g));
    return t ? { tariff: t, group: g } : null;
  };

  if (mode === 'married') {
    return tryGroup('VERHEIRATET')
        || tryGroup('LEDIG_MIT_KINDER')
        || tryGroup('LEDIG_ALLEINE')
        || { tariff: income.find(x => x.group === 'ALLE') || income[0], group: 'ALLE' };
  }
  return tryGroup('LEDIG_ALLEINE')
      || tryGroup('LEDIG_KONKUBINAT')
      || { tariff: income.find(x => x.group === 'ALLE') || income[0], group: 'ALLE' };
}

// Repack a tariff for the runtime. Keep tableType, splitting, group, and only
// the relevant row fields (`amount`, `taxes`, `percent`, `formula`).
function packTariff({ tariff, group }) {
  if (!tariff) return null;
  return {
    type: tariff.tableType,
    group,
    splitting: tariff.splitting || 0,
    table: tariff.table.map(r => ({
      a: r.amount,
      t: r.taxes,
      p: r.percent,
      ...(r.formula ? { f: r.formula } : {}),
    })),
  };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  console.log('Fetching locations...');
  const locations = await fetchJSON(raw(`data/parsed/${YEAR}/locations.json`));
  console.log(`  → ${locations.length} communes`);

  const cantonIds = [...new Set(locations.map(l => l.CantonID))].sort((a, b) => a - b);
  console.log(`  → ${cantonIds.length} cantons:`, cantonIds.join(','));

  console.log('Fetching federal tariff (tarifs/0.json)...');
  const federalRaw = await fetchJSON(raw(`data/parsed/${YEAR}/tarifs/0.json`));

  const federal = {
    single:  packTariff(pickIncomeTariff(federalRaw, 'single')),
    married: packTariff(pickIncomeTariff(federalRaw, 'married')),
  };

  console.log('Fetching cantonal tariffs, factors and deductions in parallel...');
  const cantonResults = await Promise.all(cantonIds.map(async (cid) => {
    const [tarifRaw, factorsRaw, deductionsRaw] = await Promise.all([
      fetchJSON(raw(`data/parsed/${YEAR}/tarifs/${cid}.json`)),
      fetchJSON(raw(`data/parsed/${YEAR}/factors/${cid}.json`)),
      fetchJSON(raw(`data/parsed/${YEAR}/deductions/${cid}.json`)),
    ]);
    return { cid, tarifRaw, factorsRaw, deductionsRaw };
  }));
  console.log('Fetching federal deductions...');
  const federalDeductionsRaw = await fetchJSON(raw(`data/parsed/${YEAR}/deductions/0.json`));

  const idToCode = {};
  for (const loc of locations) idToCode[loc.CantonID] = loc.Canton;

  const codeNames = {
    ZH:'Zürich', BE:'Bern', LU:'Luzern', UR:'Uri', SZ:'Schwyz',
    OW:'Obwalden', NW:'Nidwalden', GL:'Glarus', ZG:'Zug', FR:'Fribourg',
    SO:'Solothurn', BS:'Basel-Stadt', BL:'Basel-Landschaft',
    SH:'Schaffhausen', AR:'Appenzell A.Rh.', AI:'Appenzell I.Rh.',
    SG:'St. Gallen', GR:'Graubünden', AG:'Aargau', TG:'Thurgau',
    TI:'Ticino', VD:'Vaud', VS:'Valais', NE:'Neuchâtel',
    GE:'Genève', JU:'Jura',
  };

  // Pack a deduction items list (EINKOMMENSSTEUER only) — keep only fields we need.
  function packDeductions(rawTables) {
    const incomeTable = rawTables.find(t => t.type === 'EINKOMMENSSTEUER');
    if (!incomeTable) return [];
    return incomeTable.items.map(it => {
      const out = { id: it.id, format: it.format };
      if (it.amount)  out.amount  = it.amount;
      if (it.percent) out.percent = it.percent;
      if (it.minimum) out.min     = it.minimum;
      if (it.maximum) out.max     = it.maximum;
      return out;
    });
  }

  const cantons = {};
  const factorsByCanton = {};
  const deductionsByCanton = {};
  for (const { cid, tarifRaw, factorsRaw, deductionsRaw } of cantonResults) {
    const code = idToCode[cid];
    cantons[code] = {
      cid, code, name: codeNames[code] ?? code,
      single:  packTariff(pickIncomeTariff(tarifRaw, 'single')),
      married: packTariff(pickIncomeTariff(tarifRaw, 'married')),
    };
    factorsByCanton[cid] = factorsRaw;
    deductionsByCanton[code] = packDeductions(deductionsRaw);
  }
  const federalDeductions = packDeductions(federalDeductionsRaw);

  const communes = {};
  for (const loc of locations) {
    const cantonFactors = factorsByCanton[loc.CantonID] || [];
    const f = cantonFactors.find(x => x.Location?.BfsID === loc.BfsID);
    if (!f) continue;
    communes[loc.BfsID] = {
      n: loc.BfsName,
      c: loc.Canton,
      tid: loc.TaxLocationID,
      ca: Math.round(f.IncomeRateCanton * 100) / 100,
      co: Math.round(f.IncomeRateCity   * 100) / 100,
      kP: Math.round((f.IncomeRateProtestant ?? 0) * 100) / 100,
      kR: Math.round((f.IncomeRateRoman      ?? 0) * 100) / 100,
      kC: Math.round((f.IncomeRateChrist     ?? 0) * 100) / 100,
    };
  }
  console.log(`  → ${Object.keys(communes).length} communes have factors`);

  await fs.writeFile(path.join(OUT, 'federal.json'),
    JSON.stringify({ year: YEAR, federal }));
  await fs.writeFile(path.join(OUT, 'cantons.json'),
    JSON.stringify({ year: YEAR, cantons }));
  await fs.writeFile(path.join(OUT, 'communes.json'),
    JSON.stringify({ year: YEAR, communes }));
  await fs.writeFile(path.join(OUT, 'deductions.json'),
    JSON.stringify({ year: YEAR, federal: federalDeductions, cantons: deductionsByCanton }));

  console.log('Fetching Swiss topojson...');
  const topoRes = await fetch(TOPO_URL);
  if (!topoRes.ok) throw new Error(`Topojson HTTP ${topoRes.status}`);
  const topo = await topoRes.json();
  await fs.writeFile(path.join(OUT, 'swiss-topo.json'), JSON.stringify(topo));

  for (const f of ['federal.json', 'cantons.json', 'communes.json', 'deductions.json', 'swiss-topo.json']) {
    const s = await fs.stat(path.join(OUT, f));
    console.log(`  ${f}: ${(s.size / 1024).toFixed(1)} KB`);
  }
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
