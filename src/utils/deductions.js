// Port of devbrains-com/swisstaxcalculator's deduction engine.
// Computes federal and cantonal taxable income from gross income + user inputs.
//
// Each canton publishes a deduction table (`deductions.json/cantons/<code>`)
// with items keyed by ID and one of four formats:
//   MAXIMUM                      — capped at item.max
//   PERCENT                      — input × item.percent / 100
//   PERCENT,MINIMUM,MAXIMUM      — clamp(input × percent, min, max)
//   PERCENT,MAXIMUM              — min(input × percent, max)
//   STANDARDIZED                 — fixed item.amount

export const MAX_NBU_ALV = 148200; // BVG/ALV/NBU contribution cap (2026)

export function calcGrossToNet({ gross, pkDeduction = 0 }) {
  if (gross <= 0) return { net: 0, ahvIvEo: 0, alv: 0, nbu: 0, pk: 0 };
  const cap = Math.min(gross, MAX_NBU_ALV);
  const ahvIvEo = Math.round(gross * 0.053);
  const alv = Math.round(cap * 0.011);
  const nbu = Math.round(cap * 0.004);
  const pk  = Math.max(0, Math.round(pkDeduction));
  const net = gross - ahvIvEo - alv - nbu - pk;
  return { net, ahvIvEo, alv, nbu, pk };
}

function calcByFormat(item, amount) {
  if (!item) return 0;
  const a = Math.max(0, amount || 0);
  const max = item.max || 0;
  const min = item.min || 0;
  const pct = item.percent || 0;
  switch (item.format) {
    case 'MAXIMUM':                 return Math.min(a, max);
    case 'PERCENT':                 return a * pct / 100;
    case 'PERCENT,MINIMUM,MAXIMUM': return Math.min(Math.max(a * pct / 100, min), max);
    case 'PERCENT,MAXIMUM':         return Math.min(a * pct / 100, max);
    case 'STANDARDIZED':            return item.amount || 0;
    default:                        return 0;
  }
}

function applyInputAdjust(amount, input) {
  let a = amount;
  if (input.multiplier !== undefined) a *= input.multiplier;
  if (input.min !== undefined)        a = Math.max(a, input.min);
  return a;
}

// Look up a deduction item by id, trying alternative ids in priority order.
function findItem(table, ids) {
  if (!Array.isArray(ids)) return null;
  for (const id of ids) {
    const f = table.find(it => it.id === id);
    if (f) return f;
  }
  return null;
}

// "Has pension savings" => use the *MitBVGS3a* (lower-cap) insurance variant,
// otherwise the *OhneBVGS3a* (higher-cap) one. Matches ESTV's logic where the
// insurance deduction ceiling depends on whether the taxpayer also contributes
// to pillar 2 / pillar 3a.
function hasPensionSavings(t) {
  return (t.pillar2 || 0) > 0 || (t.partnerPillar2 || 0) > 0 || (t.pillar3a || 0) > 0;
}

// Deduction definitions.
// Each entry: { ids, rule, input, label, perChildAge? }
// `ids` is an ordered list — first match in the canton table wins.
// `input` returns { amount?, multiplier?, min? } from the user's tax input.
const DEDUCTIONS = [
  {
    label: 'Berufsauslagen (Pauschal)',
    ids: ['HauptErw_EK'],
    rule: () => true,
    input: (t) => ({ amount: t.netIncome }),
  },
  {
    label: 'Fahrkosten',
    ids: ['Fahrkosten_EK'],
    rule: (t) => (t.travelExpenses || 0) > 0,
    input: (t) => ({ amount: t.travelExpenses }),
  },
  {
    label: 'Verpflegungs­kosten',
    ids: ['VerpflMitVerb_EK', 'VerpflOhneVerb_EK', 'Custom_Meal_EK'],
    rule: (t) => (t.mealCosts || 0) > 0,
    input: (t) => ({ amount: t.mealCosts }),
  },
  {
    label: 'Berufsauslagen Nebenerwerb',
    ids: ['NebenErw_EK'],
    rule: (t) => (t.sideExpenses || 0) > 0,
    input: (t) => ({ amount: 0, min: t.sideExpenses }),
  },
  {
    label: 'Säule 3a',
    ids: ['S3aMax_mitVorsorge_EK', 'S3a_EK'],
    rule: () => true,
    input: (t) => ({ amount: t.pillar3a || 0 }),
  },
  {
    label: 'Versicherungsprämien (single)',
    // Most cantons use "KKSpar…" (DE/CH); VD/GE-style cantons use "KKPrivVers…".
    // Variant priority depends on whether the taxpayer has BVG/3a savings.
    ids: (t) => hasPensionSavings(t)
      ? ['KKSparLedigMitBVGS3a_EK', 'KKSparLedigOhneBVGS3a_EK', 'KKPrivVersLedig_EK']
      : ['KKSparLedigOhneBVGS3a_EK', 'KKSparLedigMitBVGS3a_EK', 'KKPrivVersLedig_EK'],
    rule: (t) => !t.married,
    input: (t) => ({ amount: t.insurance ?? 4560 }),
  },
  {
    label: 'Versicherungsprämien (married)',
    ids: (t) => hasPensionSavings(t)
      ? ['KKSparzVerhMitBVGS3a_EK', 'KKSparVerhOhneBVGS3a_EK', 'KKPrivVersVerheiratet_EK']
      : ['KKSparVerhOhneBVGS3a_EK', 'KKSparzVerhMitBVGS3a_EK', 'KKPrivVersVerheiratet_EK'],
    rule: (t) => t.married,
    input: (t) => ({ amount: (t.insurance ?? 4560) * 2 }),
  },
  {
    label: 'Versicherungsprämien Kinder',
    ids: ['KKSparProKind_EK', 'KKPrivVersProKind_EK'],
    rule: (t) => t.children > 0,
    input: (t) => ({ amount: t.insuranceKids ?? 1400, multiplier: t.children }),
  },
  {
    label: 'Sparzinsen (single)',
    ids: ['SparzinsenLedig_EK'],
    rule: (t) => !t.married,
    input: (t) => ({ amount: t.savingsInterest ?? 0 }),
  },
  {
    label: 'Sparzinsen (married)',
    ids: ['SparzinsenVerheiratet_EK'],
    rule: (t) => t.married,
    input: (t) => ({ amount: (t.savingsInterest ?? 0) * 2 }),
  },
  {
    label: 'Sparzinsen Kinder',
    ids: ['SparzinsenProKind_EK'],
    rule: (t) => t.children > 0,
    input: (t) => ({ amount: t.savingsInterestKids ?? 0, multiplier: t.children }),
  },
  {
    label: 'Mietzinsabzug (Pauschal, single)',
    ids: ['AbzMietePauschalLedig_EK'],
    rule: (t) => !t.married,
    input: (t) => ({ amount: t.rent ?? 0 }),
  },
  {
    label: 'Mietzinsabzug (Pauschal, married)',
    ids: ['AbzMietePauschalVerheiratet_EK'],
    rule: (t) => t.married,
    input: (t) => ({ amount: t.rent ?? 0 }),
  },
  {
    label: 'Mietzinsabzug Kinder',
    ids: ['AbzMietePauschalKind_EK'],
    rule: (t) => t.children > 0,
    input: (t) => ({ amount: (t.rent ?? 0) / Math.max(1, t.children), multiplier: t.children }),
  },
  {
    label: 'Sozialabzug Verheiratet',
    ids: ['SozVerheiratet_EK'],
    rule: (t) => t.married,
    input: () => ({}),
  },
  {
    label: 'Zweitverdienerabzug',
    ids: ['ZweitVerdiener_EK'],
    rule: (t) => t.married && (t.lowerGross || 0) > 0,
    input: (t) => ({ amount: t.lowerGross }),
  },
  {
    label: 'Sozialabzug Ledig',
    ids: ['SozLedig_EK'],
    rule: (t) => !t.married,
    input: (t) => ({ amount: t.netIncome }),
  },
  {
    label: 'Sozialabzug Alleinerziehend',
    ids: ['SozAlleinerzieher_EK'],
    rule: (t) => !t.married && t.children > 0,
    input: (t) => ({ amount: t.netIncome }),
  },
  {
    label: 'Sozialabzug pro Kind',
    // canton may have either a flat SozKind_EK, or age-banded variants;
    // for canton-agnostic computation we pick the 7–16 age band where present.
    ids: ['SozKind_EK', 'SozKinderAlterZwischen7und16_EK', 'SozvolljKinder_EK',
          'SozKinderAlterUnter7_EK', 'SozKinderAltervon17Jahren_EK'],
    rule: (t) => t.children > 0,
    input: (t) => ({ multiplier: t.children }),
  },
  {
    label: 'Eigenbetreuungs­abzug',
    ids: ['EigenBetr_EK'],
    rule: (t) => t.children > 0,
    input: () => ({}),
  },
  {
    label: 'Fremdbetreuung Kinder',
    ids: ['FremdBetr_EK'],
    rule: (t) => t.children > 0 && (t.childcareCosts || 0) > 0,
    input: (t) => ({ amount: (t.childcareCosts || 0) / t.children, multiplier: t.children }),
  },
  {
    label: 'Schuldzinsen',
    ids: ['Custom_DeptInterest_EK'],
    rule: (t) => (t.debtInterest || 0) > 0,
    input: (t) => ({ amount: Math.min(t.debtInterest, 50000) }),
    applyAlways: true, // doesn't need a canton item to apply (applies directly)
  },
  {
    label: 'Unterhalts­kosten Liegenschaft',
    ids: ['Custom_MaintenanceCostsRealEstate_EK'],
    rule: (t) => (t.maintenanceCostsRealEstate || 0) > 0,
    input: (t) => ({ amount: t.maintenanceCostsRealEstate }),
    applyAlways: true,
  },
  {
    label: 'Übrige Abzüge',
    ids: ['Custom_OtherDeductions_General_EK'],
    rule: (t) => (t.otherDeductions || 0) > 0,
    input: (t) => ({ amount: t.otherDeductions }),
    applyAlways: true,
  },
];

export function computeDeductions(taxInput, cantonTable, federalTable) {
  const net = taxInput.netIncome;
  const ctx = { ...taxInput, netIncome: net };
  let totalCanton = 0;
  let totalFederal = 0;
  const items = [];

  for (const def of DEDUCTIONS) {
    if (def.rule && !def.rule(ctx)) continue;
    const inputObj = def.input(ctx);
    // `ids` may be a static list or a function that returns one based on input.
    const ids = typeof def.ids === 'function' ? def.ids(ctx) : def.ids;

    const cantonItem  = findItem(cantonTable,  ids);
    const federalItem = findItem(federalTable, ids);
    if (!cantonItem && !federalItem && !def.applyAlways) continue;

    let amtCanton, amtFederal;
    if (def.applyAlways) {
      const direct = Math.max(0, inputObj.amount || 0);
      amtCanton  = cantonItem  ? calcByFormat(cantonItem,  inputObj.amount) : direct;
      amtFederal = federalItem ? calcByFormat(federalItem, inputObj.amount) : direct;
    } else {
      amtCanton  = cantonItem  ? calcByFormat(cantonItem,  inputObj.amount) : 0;
      amtFederal = federalItem ? calcByFormat(federalItem, inputObj.amount) : 0;
    }
    amtCanton  = applyInputAdjust(amtCanton,  inputObj);
    amtFederal = applyInputAdjust(amtFederal, inputObj);

    if (amtCanton > 0 || amtFederal > 0) {
      items.push({
        id: ids[0],
        label: def.label,
        canton: amtCanton,
        federal: amtFederal,
      });
      totalCanton  += amtCanton;
      totalFederal += amtFederal;
    }
  }

  return { totalCanton, totalFederal, items };
}

// Top-level entry: gross → taxable (federal + cantonal).
// When `married` is true, sums own + partner income/contributions for the joint return.
// Lower earner's gross is used as the Zweitverdiener basis.
export function grossToTaxable(input, cantonTable, federalTable) {
  const ownGN = calcGrossToNet({
    gross: input.gross,
    pkDeduction: input.pillar2 || 0,
  });
  const hasPartner = input.married && (input.partnerIncome || 0) > 0;
  const partnerGN = hasPartner ? calcGrossToNet({
    gross: input.partnerIncome || 0,
    pkDeduction: input.partnerPillar2 || 0,
  }) : null;

  const jointGross = (input.gross || 0) + (input.partnerIncome || 0);
  const jointNet   = ownGN.net + (partnerGN?.net || 0);
  const lowerGross = hasPartner
    ? Math.min(input.gross || 0, input.partnerIncome || 0)
    : 0;

  // Combine per-person social contributions for display.
  const grossNet = {
    net:      jointNet,
    ahvIvEo:  ownGN.ahvIvEo + (partnerGN?.ahvIvEo || 0),
    alv:      ownGN.alv     + (partnerGN?.alv     || 0),
    nbu:      ownGN.nbu     + (partnerGN?.nbu     || 0),
    pk:       ownGN.pk      + (partnerGN?.pk      || 0),
  };

  const taxCtx = {
    ...input,
    netIncome: jointNet,
    // For Zweitverdienerabzug: input is the lower earner's gross.
    lowerGross,
  };
  const deductions = computeDeductions(taxCtx, cantonTable || [], federalTable || []);

  const taxableCantonal = Math.max(0, Math.round(jointNet - deductions.totalCanton));
  const taxableFederal  = Math.max(0, Math.round(jointNet - deductions.totalFederal));

  return {
    gross: jointGross,
    grossNet,
    deductions,
    taxableCantonal,
    taxableFederal,
  };
}
