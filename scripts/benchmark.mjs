#!/usr/bin/env node
// Cross-canton benchmark. Runs the calculator at standard income points
// for the capital (or major city) of every canton, so the numbers can be
// spot-checked against swisstaxmap.ch / ESTV.

import fs from 'node:fs';
import { computeTaxes } from '../src/utils/taxCalculations.js';

const federal   = JSON.parse(fs.readFileSync('public/data/federal.json')).federal;
const cantons   = JSON.parse(fs.readFileSync('public/data/cantons.json')).cantons;
const communes  = JSON.parse(fs.readFileSync('public/data/communes.json')).communes;
const deductions = JSON.parse(fs.readFileSync('public/data/deductions.json'));

const fmt = (v) => Math.round(v).toLocaleString('de-CH').padStart(7);
const pct = (v) => (v * 100).toFixed(2).padStart(6) + '%';

const lookup = (name, canton) => {
  // Try exact match; then try "Name (CANTON)" suffix that several communes have
  // when names collide between cantons (e.g. "Altdorf (UR)", "Ecublens (VD)").
  for (const [bfs, c] of Object.entries(communes))
    if (c.n === name && (!canton || c.c === canton)) return +bfs;
  const suffixed = `${name} (${canton})`;
  for (const [bfs, c] of Object.entries(communes))
    if (c.n === suffixed && c.c === canton) return +bfs;
  return null;
};

// Canonical commune per canton — usually the capital, sometimes the biggest city.
const ROSTER = [
  ['ZH', lookup('Zürich', 'ZH'),   'Zürich (capital)'],
  ['BE', lookup('Bern', 'BE'),     'Bern (capital)'],
  ['LU', lookup('Luzern', 'LU'),   'Luzern (capital)'],
  ['UR', lookup('Altdorf', 'UR'),  'Altdorf (capital)'],
  ['SZ', lookup('Schwyz', 'SZ'),   'Schwyz (capital)'],
  ['OW', lookup('Sarnen', 'OW'),   'Sarnen (capital)'],
  ['NW', lookup('Stans', 'NW'),    'Stans (capital)'],
  ['GL', lookup('Glarus', 'GL'),   'Glarus (capital)'],
  ['ZG', lookup('Zug', 'ZG'),      'Zug (capital, low-tax)'],
  ['FR', lookup('Fribourg', 'FR'), 'Fribourg (capital)'],
  ['SO', lookup('Solothurn', 'SO'), 'Solothurn (capital)'],
  ['BS', lookup('Basel', 'BS'),    'Basel (capital)'],
  ['BL', lookup('Liestal', 'BL'),  'Liestal (capital)'],
  ['SH', lookup('Schaffhausen', 'SH'), 'Schaffhausen (capital)'],
  ['AR', lookup('Herisau', 'AR'),  'Herisau (capital)'],
  ['AI', lookup('Appenzell', 'AI'), 'Appenzell (capital)'],
  ['SG', lookup('St. Gallen', 'SG'), 'St. Gallen (capital)'],
  ['GR', lookup('Chur', 'GR'),     'Chur (capital)'],
  ['AG', lookup('Aarau', 'AG'),    'Aarau (capital)'],
  ['TG', lookup('Frauenfeld', 'TG'), 'Frauenfeld (capital)'],
  ['TI', lookup('Bellinzona', 'TI'), 'Bellinzona (capital)'],
  ['VD', lookup('Lausanne', 'VD'), 'Lausanne (capital)'],
  ['VS', lookup('Sion', 'VS'),     'Sion (capital)'],
  ['NE', lookup('Neuchâtel', 'NE'), 'Neuchâtel (capital)'],
  ['GE', lookup('Genève', 'GE'),   'Genève (capital)'],
  ['JU', lookup('Delémont', 'JU'), 'Delémont (capital)'],
];

function run(income, bfsId, opts = {}) {
  const commune = communes[bfsId];
  if (!commune) return null;
  return computeTaxes({
    income, incomeMode: opts.incomeMode || 'gross',
    commune, cantonTariff: cantons[commune.c], federal,
    deductionsData: deductions,
    married: opts.married || false, children: opts.children || 0,
    confession: opts.confession || 'none',
    pillar2: opts.pillar2 ?? 0,
    pillar3a: opts.pillar3a ?? 0,
    travelExpenses: opts.travelExpenses ?? 0,
    rent: opts.rent ?? 0,
    savingsInterest: opts.savingsInterest ?? 0,
  });
}

function printTable(title, income, opts) {
  console.log(`\n${'='.repeat(86)}`);
  console.log(`  ${title} — gross CHF ${income.toLocaleString('de-CH')}`);
  console.log('='.repeat(86));
  console.log(
    'Canton'.padEnd(5) +
    'Commune'.padEnd(28) +
    'Federal'.padStart(8) +
    ' Cantonal'.padStart(9) +
    '  Commune'.padStart(9) +
    '   TOTAL'.padStart(10) +
    '   eff'.padStart(9)
  );
  console.log('-'.repeat(86));
  for (const [code, bfs, label] of ROSTER) {
    if (!bfs) { console.log(`${code.padEnd(5)}${label.padEnd(28)}  (commune lookup failed)`); continue; }
    const r = run(income, bfs, opts);
    if (!r) { console.log(`${code.padEnd(5)}${label.padEnd(28)}  ERR`); continue; }
    console.log(
      code.padEnd(5) +
      label.padEnd(28) +
      fmt(r.federal) + ' ' +
      fmt(r.cantonal) + ' ' +
      fmt(r.commune) + ' ' +
      fmt(r.total) + '  ' +
      pct(r.effectiveRate)
    );
  }
}

const cases = [
  [50000,  { married: false }, 'Single, no kids, no church, BVG=0'],
  [80000,  { married: false }, 'Single, no kids, no church, BVG=0'],
  [100000, { married: false }, 'Single, no kids, no church, BVG=0'],
  [150000, { married: true, children: 2 }, 'Married + 2 kids, no church, BVG=0'],
  [200000, { married: false }, 'Single, no kids, no church, BVG=0'],
];

console.log('\nAll figures are GROSS income → tax model with default deductions');
console.log('(BVG=0, no rent, no Sparzinsen). Real per-canton match needs ');
console.log('canton-specific inputs (especially rent for VD/ZG, BVG for everyone).');

for (const [income, opts, label] of cases) {
  printTable(label, income, opts);
}

console.log('\nReference single-line spot-checks (you-vs-swisstaxmap):');
console.log('  Ecublens VD 50k, BVG=0:');
const r = run(50000, lookup('Ecublens (VD)', 'VD'), {});
console.log(`    mine: federal ${r.federal.toFixed(0)}, cantonal ${r.cantonal.toFixed(0)}, commune ${r.commune.toFixed(0)}`);
console.log(`    swisstaxmap reference: federal 217, cantonal 2619, commune 1056`);
