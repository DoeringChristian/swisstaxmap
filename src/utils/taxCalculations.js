// Tax computation using real ESTV-derived tariffs and per-commune multipliers.
// Implements the 5 ESTV table types (FLATTAX, ZUERICH, BUND, FREIBURG, FORMEL),
// ported from devbrains-com/swisstaxcalculator.

// ---------- deductions ----------
// Federal + cantonal use DIFFERENT taxable income bases. We use the full ESTV
// deduction engine (see deductions.js) when in gross mode.

import { grossToTaxable, MAX_NBU_ALV } from './deductions.js';

export { MAX_NBU_ALV };

// AHV+IV+EO + ALV displayed as "social contributions".
// (NBU is excluded — see comment in deductions.js calcGrossToNet.)
export function socialContribDisplay(gross) {
  if (gross <= 0) return 0;
  const cap = Math.min(gross, MAX_NBU_ALV);
  return gross * 0.053 + cap * 0.011;
}

// ---------- splitting helper ----------
function eligibleForSplitting(group) {
  return group === 'VERHEIRATET' || group === 'LEDIG_MIT_KINDER';
}

// ---------- table type implementations ----------

function calcFlattax(income, table) {
  return income * (table[0]?.p || 0) / 100;
}

function calcZurich(income, table) {
  // Width-based: walk widths until income consumed.
  let tax = 0, remaining = income;
  for (const row of table) {
    const band = row.a;
    if (band <= 0) continue;
    const used = Math.min(remaining, band);
    tax += used * (row.p || 0) / 100;
    remaining -= used;
    if (remaining <= 0) return tax;
  }
  return tax;
}

function calcBund(income, table) {
  // Threshold-based: last row where row.a <= income.
  let last = null;
  for (const row of table) {
    if (row.a <= income) last = row;
    else break;
  }
  if (!last) return 0;
  return (last.t || 0) + (income - last.a) * (last.p || 0) / 100;
}

function calcFreiburg(income, table) {
  // Interpolation: find bracket where row.a >= income; interpolate percent from prev to this row.
  let lastRow = null;
  for (const row of table) {
    if (row.a >= income) {
      if (!lastRow || lastRow.a === 0) {
        // Below first non-zero threshold — return 0
        // (matches devbrains-com behavior for the implicit free amount)
        if (!lastRow) return 0;
        // FR/VS: when last is the zero anchor and current row covers income
      }
      const lastAmt = lastRow ? lastRow.a : 0;
      const lastPct = lastRow ? (lastRow.p || 0) : 0;
      const partCount = row.a - lastAmt;
      if (partCount === 0) return income * lastPct / 100;
      const partPercentage = ((row.p || 0) - lastPct) / partCount;
      const partDiff = income - lastAmt;
      const finalPct = partDiff * partPercentage + lastPct;
      return income * finalPct / 100;
    }
    lastRow = row;
  }
  // Income exceeds top anchor — use the last row's percent as a flat rate on income.
  if (lastRow) return income * (lastRow.p || 0) / 100;
  return 0;
}

// ---------- FORMEL: formula parser & evaluator ----------
function tokenizeFormula(formula, wert) {
  const tokens = [];
  let i = 0;
  while (i < formula.length) {
    const ch = formula[i];
    if (ch === ' ' || ch === '\t') { i++; continue; }
    if (ch === '$') {
      const end = formula.indexOf('$', i + 1);
      if (end === -1) throw new Error('Unterminated $var$ in formula');
      const name = formula.slice(i + 1, end);
      if (name !== 'wert') throw new Error(`Unknown var: ${name}`);
      tokens.push(String(wert));
      i = end + 1;
    } else if (formula.slice(i, i + 3) === 'log') {
      tokens.push('log');
      i += 3;
    } else if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i++;
    } else if (/[\d.]/.test(ch)) {
      let num = '';
      while (i < formula.length && /[\d.]/.test(formula[i])) { num += formula[i]; i++; }
      tokens.push(num);
    } else {
      throw new Error(`Unexpected '${ch}' in formula`);
    }
  }
  return tokens;
}

function parseExpr(tokens, ctx) {
  let left = parseTerm(tokens, ctx);
  while (ctx.pos < tokens.length && (tokens[ctx.pos] === '+' || tokens[ctx.pos] === '-')) {
    const op = tokens[ctx.pos++];
    const right = parseTerm(tokens, ctx);
    left = op === '+' ? left + right : left - right;
  }
  return left;
}
function parseTerm(tokens, ctx) {
  let left = parseUnary(tokens, ctx);
  while (ctx.pos < tokens.length && (tokens[ctx.pos] === '*' || tokens[ctx.pos] === '/')) {
    const op = tokens[ctx.pos++];
    const right = parseUnary(tokens, ctx);
    left = op === '*' ? left * right : left / right;
  }
  return left;
}
function parseUnary(tokens, ctx) {
  if (tokens[ctx.pos] === '-') { ctx.pos++; return -parsePrim(tokens, ctx); }
  return parsePrim(tokens, ctx);
}
function parsePrim(tokens, ctx) {
  const t = tokens[ctx.pos];
  if (t === 'log') { ctx.pos++; return Math.log(parsePrim(tokens, ctx)); }
  if (t === '(') {
    ctx.pos++;
    const v = parseExpr(tokens, ctx);
    if (tokens[ctx.pos] !== ')') throw new Error('Missing )');
    ctx.pos++;
    return v;
  }
  const n = parseFloat(t);
  if (isNaN(n)) throw new Error(`Expected number, got '${t}'`);
  ctx.pos++;
  return n;
}
function evaluateFormula(formula, wert) {
  if (!formula || !formula.trim()) return 0;
  const tokens = tokenizeFormula(formula, wert);
  const ctx = { pos: 0 };
  const r = parseExpr(tokens, ctx);
  if (ctx.pos !== tokens.length) throw new Error('Extra tokens');
  return r;
}

function calcFormel(income, table) {
  // BUND-style row lookup, then evaluate the formula at `income`.
  let last = null;
  for (const row of table) {
    if (row.a <= income) last = row;
    else break;
  }
  if (!last) return 0;
  if (!last.f || !last.f.trim()) return 0;
  try {
    const v = evaluateFormula(last.f, income);
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, v);
  } catch {
    return 0;
  }
}

// ---------- main tariff dispatch ----------
function round100Down(n) { return Math.floor(n / 100) * 100; }

export function tariffTax(tariff, income) {
  if (!tariff || income <= 0) return 0;
  const { type, table, splitting, group } = tariff;

  const applyFactor = (splitting > 0 && eligibleForSplitting(group)) ? splitting : 1;
  let working = income / applyFactor;

  // ZUERICH-but-actually-BUND workaround (rare; if any taxes > 0 it's threshold).
  let effectiveType = type;
  if (type === 'ZUERICH' && table.some(r => (r.t || 0) > 0)) effectiveType = 'BUND';

  if (effectiveType !== 'FORMEL') working = round100Down(working);

  let tax;
  switch (effectiveType) {
    case 'FLATTAX':  tax = calcFlattax(working, table); break;
    case 'ZUERICH':  tax = calcZurich(working, table); break;
    case 'BUND':     tax = calcBund(working, table); break;
    case 'FREIBURG': tax = calcFreiburg(working, table); break;
    case 'FORMEL':   tax = calcFormel(working, table); break;
    default:         throw new Error(`Unknown table type: ${effectiveType}`);
  }
  return tax * applyFactor;
}

// ---------- public API ----------
function churchMultiplier(commune, confession) {
  if (!commune) return 0;
  switch (confession) {
    case 'protestant':          return commune.kP || 0;
    case 'catholic-roman':      return commune.kR || 0;
    case 'catholic-christian':  return commune.kC || 0;
    default: return 0;
  }
}

export function computeTaxes({
  income, incomeMode = 'gross',   // 'gross' or 'taxable'
  commune, cantonTariff, federal, deductionsData,
  married, partnerIncome = 0, confession = 'none', children = 0,
  // Detailed deduction inputs (gross mode only)
  pillar2 = 0, partnerPillar2 = 0, pillar3a = 0,
  travelExpenses = 0, mealCosts = 0, sideExpenses = 0,
  insurance, insuranceKids, savingsInterest = 0, rent = 0,
  childcareCosts = 0,
  debtInterest = 0, maintenanceCostsRealEstate = 0,
  otherDeductions = 0,
  overrideCantonRate, overrideCommuneRate, overrideChurchRate,
}) {
  let taxableFed, taxableCan, gross, deductionBreakdown = null, grossNet = null;
  if (incomeMode === 'taxable') {
    // In taxable mode `income` is already the (joint) taxable amount.
    taxableFed = taxableCan = income;
    gross = income;
  } else {
    const cantonTable  = deductionsData?.cantons?.[commune?.c] ?? [];
    const federalTable = deductionsData?.federal ?? [];
    const result = grossToTaxable({
      gross: income,
      partnerIncome: married ? partnerIncome : 0,
      married, children, pillar2, partnerPillar2, pillar3a,
      travelExpenses, mealCosts, sideExpenses,
      insurance, insuranceKids, savingsInterest, rent,
      childcareCosts,
      debtInterest, maintenanceCostsRealEstate, otherDeductions,
    }, cantonTable, federalTable);
    taxableFed = result.taxableFederal;
    taxableCan = result.taxableCantonal;
    grossNet = result.grossNet;
    deductionBreakdown = result.deductions;
    gross = result.gross; // joint gross for married
  }

  const fedTariff = married ? federal.married : federal.single;
  const canTariff = married ? cantonTariff.married : cantonTariff.single;

  const federalTax = tariffTax(fedTariff, taxableFed);
  const simple = tariffTax(canTariff, taxableCan);

  const cantonRate = overrideCantonRate ?? (commune?.ca || 0);
  const communeRate = overrideCommuneRate ?? (commune?.co || 0);
  const churchRate = overrideChurchRate ?? churchMultiplier(commune, confession);

  const cantonal = simple * (cantonRate / 100);
  const communal = simple * (communeRate / 100);
  const church   = simple * (churchRate / 100);

  const total = federalTax + cantonal + communal + church;
  const social = incomeMode === 'gross' ? socialContribDisplay(gross) : 0;
  const net = gross - total - social - (grossNet?.pk ?? 0);

  return {
    grossIncome: gross,
    taxableFederal: taxableFed,
    taxableCantonal: taxableCan,
    socialContributions: social,
    bvg: grossNet?.pk ?? 0,
    federal: federalTax, simple,
    cantonal, commune: communal, church,
    total, net,
    effectiveRate: gross > 0 ? total / gross : 0,
    averageRate: taxableCan > 0 ? total / taxableCan : 0,
    cantonRate, communeRate, churchRate,
    incomeMode,
    deductionBreakdown,
    grossNet,
  };
}

export function marginalRate(args) {
  const d = 1000;
  const inc = args.income ?? args.grossIncome;
  const a = computeTaxes(args);
  const b = computeTaxes({ ...args, income: inc + d });
  return (b.total - a.total) / d;
}

export function formatCHF(value) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency', currency: 'CHF', maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatPct(value, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function fastEffectiveRate({
  income, incomeMode = 'gross',
  commune, cantonTariff, federal, deductionsData,
  married, partnerIncome = 0, confession = 'none', children = 0,
  pillar2 = 0, partnerPillar2 = 0, pillar3a = 0,
  travelExpenses = 0, mealCosts = 0, sideExpenses = 0,
  insurance, insuranceKids, savingsInterest = 0, rent = 0, childcareCosts = 0,
  debtInterest = 0, maintenanceCostsRealEstate = 0, otherDeductions = 0,
}) {
  if (!commune || !cantonTariff || income <= 0) return null;
  let taxFed, taxCan, denom = income;
  if (incomeMode === 'taxable') {
    taxFed = taxCan = income;
  } else {
    const cantonTable  = deductionsData?.cantons?.[commune.c] ?? [];
    const federalTable = deductionsData?.federal ?? [];
    const r = grossToTaxable({
      gross: income, partnerIncome: married ? partnerIncome : 0,
      married, children, pillar2, partnerPillar2, pillar3a,
      travelExpenses, mealCosts, sideExpenses,
      insurance, insuranceKids, savingsInterest, rent, childcareCosts,
      debtInterest, maintenanceCostsRealEstate, otherDeductions,
    }, cantonTable, federalTable);
    taxFed = r.taxableFederal; taxCan = r.taxableCantonal;
    denom = r.gross;
  }
  const fedTariff = married ? federal.married : federal.single;
  const canTariff = married ? cantonTariff.married : cantonTariff.single;
  const federalTax = tariffTax(fedTariff, taxFed);
  const simple = tariffTax(canTariff, taxCan);
  const churchRate = churchMultiplier(commune, confession);
  const total = federalTax + simple * ((commune.ca + commune.co + churchRate) / 100);
  return total / denom;
}
