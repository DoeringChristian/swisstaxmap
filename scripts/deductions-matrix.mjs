#!/usr/bin/env node
// Writes a matrix of every tax-deduction category (rows) × canton (columns),
// showing whether the canton allows that deduction and its cap / parameter.
// Output: DEDUCTIONS.md at the repo root.
//
// Data source: public/data/deductions.json (per-canton tables parsed from
// ESTV by devbrains-com/swisstaxcalculator).

import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('public/data/deductions.json'));
const out = [];
const log = (s = '') => out.push(s);

const CANTON_ORDER = [
  'ZH','BE','LU','UR','SZ','OW','NW','GL','ZG','FR',
  'SO','BS','BL','SH','AR','AI','SG','GR','AG','TG',
  'TI','VD','VS','NE','GE','JU',
];

// Friendly labels for the (German-language) deduction IDs we know about.
const LABELS = {
  // Berufsauslagen
  HauptErw_EK:                            'Pauschalabzug Berufsauslagen',
  Fahrkosten_EK:                          'Fahrkosten (commute)',
  NebenErw_EK:                            'Berufsauslagen Nebenerwerb',
  VerpflMitVerb_EK:                       'Verpflegungskosten (with discount)',
  VerpflOhneVerb_EK:                      'Verpflegungskosten (full)',
  // Pillars
  S3a_EK:                                 'Säule 3a (canton-specific cap)',
  S3aMax_mitVorsorge_EK:                  'Säule 3a (with BVG, max 7\'258)',
  S3aMax_ohneVorsorge_EK:                 'Säule 3a (no BVG, max 36\'288)',
  // Versicherung
  KKSparLedigMitBVGS3a_EK:                'Versicherungsprämien (single, with BVG/3a)',
  KKSparLedigOhneBVGS3a_EK:               'Versicherungsprämien (single, no BVG/3a)',
  KKSparzVerhMitBVGS3a_EK:                'Versicherungsprämien (married, with BVG/3a)',
  KKSparVerhOhneBVGS3a_EK:                'Versicherungsprämien (married, no BVG/3a)',
  KKSparProKind_EK:                       'Versicherungsprämien Kinder',
  KKPrivVersLedig_EK:                     'Krankenkasse + Privatvers. (single, VD/GE)',
  KKPrivVersVerheiratet_EK:               'Krankenkasse + Privatvers. (married, VD/GE)',
  KKPrivVersProKind_EK:                   'Krankenkasse + Privatvers. Kinder (VD/GE)',
  SparzinsenLedig_EK:                     'Sparzinsen (single, VD-style)',
  SparzinsenVerheiratet_EK:               'Sparzinsen (married, VD-style)',
  SparzinsenProKind_EK:                   'Sparzinsen Kinder (VD-style)',
  // Sozialabzüge — adults
  SozLedig_EK:                            'Sozialabzug Ledig',
  SozVerheiratet_EK:                      'Sozialabzug Verheiratet',
  SozAlleinerzieher_EK:                   'Sozialabzug Alleinerziehend',
  // Sozialabzüge — kids
  SozKind_EK:                             'Sozialabzug pro Kind',
  SozKindAlleinerzieher_EK:               'Soz. Kind, Alleinerziehend',
  SozKinderAlterUnter7_EK:                'Soz. Kind (< 7 J., VS)',
  SozKinderAlterZwischen7und16_EK:        'Soz. Kind (7–16 J., VS)',
  SozKinderAltervon17Jahren_EK:           'Soz. Kind (17+ J., VS)',
  SozKinderAuswAusbildung_EK:             'Soz. Kind in Ausbildung (VS)',
  SozvolljKinder_EK:                      'Soz. volljährige Kinder',
  SozZusKinderabzugAbAnzahl3_EK:          'Zus. Kinderabzug ab 3. Kind (VS)',
  SozBeschEKledig_EK:                     'Soz. bescheidenes Einkommen (single, VD)',
  SozBeschEKverheiratet_EK:               'Soz. bescheidenes Einkommen (married, VD)',
  SozBeschEKKind_EK:                      'Soz. bescheidenes Einkommen / Kind (VD)',
  SozBeschEKAlleinerzMitK_EK:             'Soz. besch. Eink. Alleinerz. mit Kind (VD)',
  SozFamAbzugSchwellwertAus1_EK:          'Schwellwert Soz.-Abz. familie 1 (VD)',
  SozFamAbzugSchwellwertAus2_EK:          'Schwellwert Soz.-Abz. familie 2 (VD)',
  SozminderjKinder_EK:                    'Soz. minderjährige Kinder (VD)',
  // Family / partner
  ZweitVerdiener_EK:                      'Zweitverdienerabzug',
  EigenBetr_EK:                           'Eigenbetreuungsabzug',
  FremdBetr_EK:                           'Fremdbetreuung (childcare)',
  // Real estate
  ImmoUnterhaltUnter11Jahre_EK:           'Immo-Unterhalt < 11 J. (Pauschal %)',
  ImmoUnterhaltUeber10Jahre_EK:           'Immo-Unterhalt > 10 J. (Pauschal %)',
  ImmoUnterhaltSelbsbewBIS20Jahre_EK:     'Immo-Unterhalt selbstbewohnt ≤ 20 J.',
  ImmoUnterhaltSelbsbewUeber20Jahre_EK:   'Immo-Unterhalt selbstbewohnt > 20 J.',
  ImmoUnterhaltVermietetBIS20Jahre_EK:    'Immo-Unterhalt vermietet ≤ 20 J.',
  ImmoUnterhaltVermietetUeber20Jahre_EK:  'Immo-Unterhalt vermietet > 20 J.',
  AbzEigenmietwert_EK:                    'Abzug Eigenmietwert',
  // Rent
  AbzMietePauschalLedig_EK:               'Mietzinsabzug Pauschal (single, VD)',
  AbzMietePauschalVerheiratet_EK:         'Mietzinsabzug Pauschal (married, VD)',
  AbzMietePauschalKind_EK:                'Mietzinsabzug Pauschal / Kind (VD)',
  MaxAbzMiete_EK:                         'Max Mietzinsabzug',
  // Other
  VMVerwaltungsKosten_EK:                 'Vermögens­verwaltungskosten',
  MaxTechnZinssatzEE_CHF_FINMA1000_EK:    'Technischer Zinssatz Eigenkapital (FINMA)',
};

function categoryOf(id) {
  if (/Fahr|HauptErw|NebenErw|Verpfleg/.test(id))    return '1. Berufsauslagen';
  if (/S3a/.test(id))                                return '2. Säule 3a';
  if (/KKSpar|KKPrivVers|Sparzinsen/.test(id))       return '3. Versicherung / Sparen';
  if (/SozBeschEK|SozFamAbzugSchwellwert/.test(id))  return '4. Soz. bescheid. Einkommen';
  if (/SozKind|SozvolljKinder|SozminderjKinder|SozZusKinderabzug/.test(id)) return '5. Sozial — Kinder';
  if (/Soz/.test(id))                                return '6. Sozial — Erwachsene';
  if (/ZweitVerdiener|EigenBetr|FremdBetr/.test(id)) return '7. Familie / Partner';
  if (/Immo|Eigenmietwert/.test(id))                 return '8. Liegenschaft';
  if (/Miete|MaxAbz/.test(id))                       return '9. Mietzinsabzug';
  return 'Z. Sonstige';
}

// Build the matrix.
// rows: id → label
// cols: BUND + 26 cantons
const allIds = new Set();
(d.federal || []).forEach((it) => allIds.add(it.id));
for (const code of Object.keys(d.cantons)) {
  d.cantons[code].forEach((it) => allIds.add(it.id));
}

// Index per canton: id → item
function index(items) {
  const m = new Map();
  for (const it of items) m.set(it.id, it);
  return m;
}
const idx = {
  BUND: index(d.federal || []),
};
for (const code of Object.keys(d.cantons)) idx[code] = index(d.cantons[code]);

function compactValue(it) {
  if (!it) return '';
  // Show the most informative value for the format.
  switch (it.format) {
    case 'MAXIMUM':                  return `max ${it.max}`;
    case 'PERCENT':                  return `${it.percent}%`;
    case 'PERCENT,MINIMUM,MAXIMUM':  return `${it.percent}% [${it.min ?? 0}…${it.max ?? '∞'}]`;
    case 'PERCENT,MAXIMUM':          return `${it.percent}% ≤${it.max}`;
    case 'STANDARDIZED':             return `${it.amount}`;
    default:                         return it.format;
  }
}

// Group rows by category for readability.
const rows = [...allIds]
  .map((id) => ({ id, label: LABELS[id] || id, cat: categoryOf(id) }))
  .sort((a, b) => a.cat.localeCompare(b.cat) || a.id.localeCompare(b.id));

log('# Swiss tax-deduction matrix (income tax)\n');
log(`Data source: ESTV ${d.year} via devbrains-com/swisstaxcalculator.\n`);
log(`Columns: **BUND** = federal direct tax, then 26 cantons in alphabetical order.\n`);
log(`Cell legend:`);
log(`- **✓** = canton's deduction table includes this ID`);
log(`- **✗** = not in canton's table (deduction not allowed at canton level, or canton uses a different ID)`);
log(`- The inline value shows the cap / percent / fixed amount where applicable.\n`);
log(`Format codes:`);
log(`- \`max N\`: capped at N CHF (user-input amount, taken up to N)`);
log(`- \`P%\`: simple percentage of input`);
log(`- \`P% [min…max]\`: percent of input, clamped`);
log(`- \`N\` (no prefix): fixed amount applied unconditionally (STANDARDIZED)\n`);
log(`---\n`);

let lastCat = null;
const head = ['Deduction', 'BUND', ...CANTON_ORDER];
log('| ' + head.join(' | ') + ' |');
log('|' + head.map(() => '---').join('|') + '|');

for (const r of rows) {
  if (r.cat !== lastCat) {
    const bar = `| **${r.cat}** ` + head.slice(1).map(() => '|  ').join('') + '|';
    log(bar);
    lastCat = r.cat;
  }
  const cells = [`\`${r.id}\`<br/>${r.label}`];
  const bundIt = idx.BUND.get(r.id);
  cells.push(bundIt ? `✓ ${compactValue(bundIt)}` : '✗');
  for (const c of CANTON_ORDER) {
    const it = idx[c]?.get(r.id);
    cells.push(it ? `✓ ${compactValue(it)}` : '✗');
  }
  log('| ' + cells.join(' | ') + ' |');
}

log(`\n_${rows.length} distinct deduction IDs across BUND + 26 cantons._\n`);
const coverage = {};
for (const c of ['BUND', ...CANTON_ORDER]) coverage[c] = idx[c].size;
log('### Deduction-richness per jurisdiction\n');
log('| ' + Object.keys(coverage).join(' | ') + ' |');
log('|' + Object.keys(coverage).map(() => '---').join('|') + '|');
log('| ' + Object.values(coverage).join(' | ') + ' |');

const path = 'DEDUCTIONS.md';
fs.writeFileSync(path, out.join('\n'));

// Compact summary printed to stdout
console.log(`✓ Wrote ${out.length} lines to ${path}`);
console.log(`  ${rows.length} deduction categories`);
console.log(`  Coverage: federal ${coverage.BUND}, min ${Math.min(...Object.values(coverage))}, max ${Math.max(...Object.values(coverage))}`);
console.log('\nCantons with the most distinct deductions (top 8):');
const sorted = Object.entries(coverage).sort((a,b) => b[1] - a[1]);
sorted.slice(0, 8).forEach(([c, n]) => console.log(`  ${c.padEnd(5)} ${n}`));
console.log('\nCantons with the fewest:');
sorted.slice(-5).forEach(([c, n]) => console.log(`  ${c.padEnd(5)} ${n}`));
