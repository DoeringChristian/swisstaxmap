#!/usr/bin/env node
import fs from 'node:fs';
import { computeTaxes } from '../src/utils/taxCalculations.js';

const federal   = JSON.parse(fs.readFileSync('public/data/federal.json')).federal;
const cantons   = JSON.parse(fs.readFileSync('public/data/cantons.json')).cantons;
const communes  = JSON.parse(fs.readFileSync('public/data/communes.json')).communes;
const deductions = JSON.parse(fs.readFileSync('public/data/deductions.json'));

const fmt = (v) => Math.round(v).toLocaleString('de-CH').padStart(9);
const pct = (v) => (v*100).toFixed(2).padStart(6) + '%';

function run(income, bfsId, opts) {
  const commune = communes[bfsId];
  if (!commune) return null;
  return computeTaxes({
    income, incomeMode: opts.incomeMode || 'gross',
    commune, cantonTariff: cantons[commune.c], federal,
    deductionsData: deductions,
    married: opts.married || false,
    children: opts.children || 0,
    confession: opts.confession || 'none',
    pillar2: opts.pillar2 ?? 5000,
    pillar3a: opts.pillar3a || 0,
    travelExpenses: opts.travelExpenses || 0,
  });
}

const lookup = (name) => {
  for (const [bfs, c] of Object.entries(communes)) if (c.n === name) return +bfs;
  return null;
};
const benchmarks = [
  ['Zürich',         lookup('Zürich')],
  ['Bern',           lookup('Bern')],
  ['Zug',            lookup('Zug')],
  ['Basel',          lookup('Basel')],
  ['Lausanne',       lookup('Lausanne')],
  ['Genève',         lookup('Genève')],
  ['Lugano',         lookup('Lugano')],
  ['Obergoms (VS)',  lookup('Obergoms')],
  ['Sion',           lookup('Sion')],
];

function printCases(title, opts) {
  console.log(`\n=== ${title} ===`);
  console.log('Commune'.padEnd(18) + 'Fed-Tax'.padStart(10) + 'Can-Tax'.padStart(10) +
              ' | Federal'.padStart(10) + 'Cantonal'.padStart(10) +
              ' Commune'.padStart(10) + '  Church'.padStart(9) +
              '   TOTAL'.padStart(11) + '   eff');
  console.log('-'.repeat(105));
  for (const [name, bfs] of benchmarks) {
    const r = run(100000, bfs, opts);
    if (!r) { console.log(name.padEnd(18), 'MISSING'); continue; }
    console.log(
      name.padEnd(18) +
      fmt(r.taxableFederal) + fmt(r.taxableCantonal) + ' |' +
      fmt(r.federal) + fmt(r.cantonal) +
      fmt(r.commune) + fmt(r.church) +
      fmt(r.total) + '  ' + pct(r.effectiveRate)
    );
  }
}

printCases('CHF 100k GROSS · single · pillar2=5000', { incomeMode: 'gross' });
printCases('CHF 100k GROSS · single · pillar2=7000 · 3a=7258 · travel=2000',
  { incomeMode: 'gross', pillar2: 7000, pillar3a: 7258, travelExpenses: 2000 });

console.log('\nReference (swisstaxmap.ch, Obergoms VS, age 30, single, no kids, 100k gross):');
console.log('  federal 1813   cantonal 6967   commune 7664   total 16444 (16.44%)');
