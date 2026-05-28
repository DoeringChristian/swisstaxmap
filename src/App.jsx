import { useEffect, useMemo, useState } from 'react';
import { loadData } from './data/loader.js';
import { computeTaxes, marginalRate } from './utils/taxCalculations.js';
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
    pillar2: 2500,                // BVG / Pillar 2 contribution (typical for age 30)
    partnerPillar2: 0,
    pillar3a: 0,                  // Pillar 3a
    travelExpenses: 0,
    mealCosts: 0,
    childcareCosts: 0,
    otherDeductions: 0,
  });
  const [selectedBfsId, setSelectedBfsId] = useState(DEFAULT_BFS);
  const [comparedBfsIds, setComparedBfsIds] = useState([]);
  const [maxIncome, setMaxIncome] = useState(250000);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function toggleCompare(bfsId) {
    setComparedBfsIds((cur) =>
      cur.includes(bfsId) ? cur.filter((b) => b !== bfsId) : [...cur, bfsId]
    );
  }
  function removeFromCompare(bfsId) {
    setComparedBfsIds((cur) => cur.filter((b) => b !== bfsId));
  }
  function setCompareReference(bfsId) {
    setComparedBfsIds((cur) => {
      if (!cur.includes(bfsId)) return cur;
      return [bfsId, ...cur.filter((b) => b !== bfsId)];
    });
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
            comparedBfsIds={comparedBfsIds}
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
          />
          {comparedBfsIds.length > 0 && (
            <ComparisonPanel
              comparedBfsIds={comparedBfsIds}
              data={data}
              state={state}
              onRemove={removeFromCompare}
              onSetReference={setCompareReference}
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
          Tariffs, multipliers and deductions sourced from{' '}
          <a href="https://github.com/devbrains-com/swisstaxcalculator" target="_blank" rel="noreferrer">devbrains-com/swisstaxcalculator</a>{' '}
          (parsed from <a href="https://swisstaxcalculator.estv.admin.ch" target="_blank" rel="noreferrer">ESTV</a>, tax year {data.year}).
          Topojson from <a href="https://github.com/interactivethings/swiss-maps" target="_blank" rel="noreferrer">interactivethings/swiss-maps</a>.
          This estimate uses the full ESTV deduction engine — see Breakdown for the exact deductions applied.
          For binding figures consult the <a href="https://swisstaxcalculator.estv.admin.ch" target="_blank" rel="noreferrer">official cantonal calculator</a>.
        </p>
      </footer>
    </div>
  );
}
