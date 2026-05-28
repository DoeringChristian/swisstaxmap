import { useEffect, useMemo, useState } from 'react';
import { loadData } from './data/loader.js';
import { computeTaxes, marginalRate, formatCHF } from './utils/taxCalculations.js';
import SwissMap from './components/SwissMap.jsx';
import Controls from './components/Controls.jsx';
import Breakdown from './components/Breakdown.jsx';
import TaxChart from './components/TaxChart.jsx';
import RateChart from './components/RateChart.jsx';
import ComparisonPanel from './components/ComparisonPanel.jsx';
import './App.css';

const DEFAULT_BFS = 261; // City of Zürich

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [state, setState] = useState({
    income: 100000,
    incomeMode: 'gross',          // 'gross' | 'taxable'
    married: false,
    partnerIncome: 0,
    children: 0,
    confession: 'none',
    // Deduction inputs (gross mode)
    pillar2: 0,                   // BVG / Pillar 2 contribution
    partnerPillar2: 0,
    pillar3a: 0,                  // Pillar 3a
    travelExpenses: 0,            // Fahrkosten (commute)
    mealCosts: 0,                 // Verpflegungskosten
    sideExpenses: 0,              // Berufsauslagen Nebenerwerb
    insurance: 4560,              // Versicherungsprämien (per adult)
    insuranceKids: 1400,          // Versicherungsprämien per child
    savingsInterest: 0,           // Sparzinsen (VD allows separately)
    rent: 0,                      // Mietzinsabzug (VD, ZG)
    childcareCosts: 0,            // Fremdbetreuungskosten
    debtInterest: 0,              // Schuldzinsen (mortgage etc.)
    maintenanceCostsRealEstate: 0, // Liegenschaftsunterhalt
    otherDeductions: 0,           // Übrige Abzüge
  });
  const [selectedBfsId, setSelectedBfsId] = useState(DEFAULT_BFS);
  const [comparedBfsIds, setComparedBfsIds] = useState([]);
  const [referenceBfsId, setReferenceBfsId] = useState(null);
  const [maxIncome, setMaxIncome] = useState(250000);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState('effective'); // | 'source-delta'

  function toggleCompare(bfsId) {
    setComparedBfsIds((cur) => {
      if (cur.includes(bfsId)) {
        const next = cur.filter((b) => b !== bfsId);
        // If we removed the reference, fall back to the first remaining (if any).
        setReferenceBfsId((ref) => ref === bfsId ? (next[0] ?? null) : ref);
        return next;
      }
      // First commune added becomes the reference by default.
      setReferenceBfsId((ref) => ref == null ? bfsId : ref);
      return [...cur, bfsId];
    });
  }
  function removeFromCompare(bfsId) {
    toggleCompare(bfsId);
  }
  function setCompareReference(bfsId) {
    if (comparedBfsIds.includes(bfsId)) setReferenceBfsId(bfsId);
  }

  useEffect(() => {
    loadData().then(setData).catch(setError);
  }, []);

  const set = (patch) => setState(s => ({ ...s, ...patch }));

  const commune = data && data.communes[selectedBfsId];
  const cantonTariff = commune ? data.cantons[commune.c] : null;

  const computeArgs = useMemo(() => commune && {
    ...state,
    commune, cantonTariff, federal: data.federal,
    deductionsData: data.deductions,
  }, [commune, cantonTariff, data, state]);

  const result = useMemo(
    () => computeArgs ? computeTaxes(computeArgs) : null,
    [computeArgs],
  );
  const m = useMemo(
    () => computeArgs ? marginalRate(computeArgs) : 0,
    [computeArgs],
  );

  // Pre-compute totals for every compared commune (used by the sidebar's
  // compare-list AND the comparison panel — keeps both in sync).
  const compareTotals = useMemo(() => {
    if (!data) return [];
    return comparedBfsIds.map((bfs) => {
      const c = data.communes[bfs];
      if (!c) return null;
      const r = computeTaxes({
        ...state,
        commune: c,
        cantonTariff: data.cantons[c.c],
        federal: data.federal,
        deductionsData: data.deductions,
      });
      return { bfs, commune: c, total: r.total };
    }).filter(Boolean);
  }, [comparedBfsIds, data, state]);

  // Effective reference: explicit state, falling back to first in list.
  const effectiveReferenceBfsId = referenceBfsId ?? comparedBfsIds[0] ?? null;

  if (error) {
    return <div className="loader error">Failed to load data: {String(error)}</div>;
  }
  if (!data) {
    return <div className="loader">Loading Swiss tax data…</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">CH<span>tax</span></div>
        <div className="title">
          <h1>Swiss Tax Map</h1>
          <p>
            Federal · Cantonal · Communal · Church — real ESTV data for {data.year},
            all {Object.keys(data.communes).length.toLocaleString('de-CH')} communes
          </p>
        </div>
        {commune && (
          <div className="canton-badge">
            <div className="badge-code">{commune.c}</div>
            <div className="badge-name">{commune.n}</div>
          </div>
        )}
      </header>

      <main className="grid">
        <section className="left">
          <Controls
            state={state} set={set}
            maxIncome={maxIncome} setMaxIncome={setMaxIncome}
            communes={data.communes}
            selectedBfsId={selectedBfsId}
            onSelect={setSelectedBfsId}
            onCompare={toggleCompare}
            onSetReference={setCompareReference}
            comparedBfsIds={comparedBfsIds}
            referenceBfsId={effectiveReferenceBfsId}
            compareTotals={compareTotals}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
          />
        </section>

        <section className="right">
          <SwissMap
            data={data}
            params={state}
            selectedBfsId={selectedBfsId}
            onSelect={setSelectedBfsId}
            comparedBfsIds={comparedBfsIds}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
          {comparedBfsIds.length > 0 && (
            <ComparisonPanel
              comparedBfsIds={comparedBfsIds}
              referenceBfsId={effectiveReferenceBfsId}
              data={data}
              state={state}
              onRemove={removeFromCompare}
              onSetReference={setCompareReference}
              onSelect={setSelectedBfsId}
            />
          )}
          <Breakdown result={result} marginal={m} commune={commune} />
          {commune && (
            <TaxChart
              params={state}
              commune={commune}
              cantonTariff={cantonTariff}
              federal={data.federal}
              deductionsData={data.deductions}
              maxIncome={maxIncome}
            />
          )}
          {commune && (
            <RateChart
              params={state}
              commune={commune}
              cantonTariff={cantonTariff}
              federal={data.federal}
              deductionsData={data.deductions}
              maxIncome={maxIncome}
            />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          <strong>Verify against the official source:</strong>{' '}
          <a href="https://swisstaxcalculator.estv.admin.ch" target="_blank" rel="noreferrer">
            swisstaxcalculator.estv.admin.ch
          </a>
          {' '}— the Federal Tax Administration's own calculator, with the same underlying ESTV data
          this app uses. Enter the same gross/deduction figures there for a binding cross-check.
        </p>
        <p>
          Tariffs, multipliers and deduction tables sourced from{' '}
          <a href="https://github.com/devbrains-com/swisstaxcalculator" target="_blank" rel="noreferrer">devbrains-com/swisstaxcalculator</a>{' '}
          (parsed from ESTV, tax year {data.year}).
          Topojson from <a href="https://github.com/interactivethings/swiss-maps" target="_blank" rel="noreferrer">interactivethings/swiss-maps</a>.
        </p>
      </footer>
    </div>
  );
}
