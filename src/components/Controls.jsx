import { useMemo, useState, useRef, useEffect } from 'react';
import { formatCHF } from '../utils/taxCalculations.js';
import { searchCommunes } from '../utils/search.js';

const CONFESSIONS = [
  { id: 'none',              label: 'None' },
  { id: 'protestant',        label: 'Reformed' },
  { id: 'catholic-roman',    label: 'Catholic' },
  { id: 'catholic-christian',label: 'Christ-Cath.' },
];

function NumberField({ label, value, onChange, hint, step = 100, disabled }) {
  return (
    <div className="num-field">
      <label>{label}</label>
      <input type="number" min={0} step={step}
        value={value} disabled={disabled}
        onChange={(e) => onChange(Math.max(0, +e.target.value || 0))}
      />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export default function Controls({
  state, set, maxIncome, setMaxIncome, communes, selectedBfsId, onSelect,
  onCompare, onSetReference, comparedBfsIds = [], referenceBfsId = null,
  compareTotals = [],
  showAdvanced, setShowAdvanced,
}) {
  const [search, setSearch] = useState('');
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeDraft, setIncomeDraft] = useState('');
  const incomeInputRef = useRef(null);

  const selectedCommune = selectedBfsId ? communes[selectedBfsId] : null;
  const gross = state.incomeMode === 'gross';
  const isInCompare = comparedBfsIds.includes(selectedBfsId);

  const matches = useMemo(
    () => searchCommunes(search, communes),
    [search, communes],
  );

  function commitIncome() {
    const v = +incomeDraft.replace(/[^\d]/g, '');
    if (!isNaN(v) && v >= 0) set({ income: Math.min(v, maxIncome) });
    setEditingIncome(false);
  }
  function startEditIncome() {
    setIncomeDraft(String(state.income));
    setEditingIncome(true);
    setTimeout(() => incomeInputRef.current?.select(), 0);
  }

  return (
    <div className="controls-card">
      <div className="control-block">
        <div className="control-header">
          <label htmlFor="income">{gross ? 'Gross income' : 'Taxable income'}</label>
          {editingIncome ? (
            <input
              ref={incomeInputRef}
              type="text" inputMode="numeric"
              className="income-input"
              value={incomeDraft}
              onChange={(e) => setIncomeDraft(e.target.value)}
              onBlur={commitIncome}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitIncome();
                if (e.key === 'Escape') setEditingIncome(false);
              }}
              autoFocus
            />
          ) : (
            <button className="income-value" onClick={startEditIncome}
                    title="Click to type a value">
              {formatCHF(state.income)}
            </button>
          )}
        </div>
        <input
          id="income"
          type="range" min={0} max={maxIncome} step={1000}
          value={state.income}
          onChange={(e) => set({ income: +e.target.value })}
        />
        <div className="hints">
          <span>0</span>
          <span>{formatCHF(maxIncome)}</span>
        </div>
        <div className="mode-row">
          <div className="mode-toggle">
            <button
              className={`pill ${gross ? 'active' : ''}`}
              onClick={() => set({ incomeMode: 'gross' })}
              title="Apply ESTV deduction engine">
              Gross
            </button>
            <button
              className={`pill ${!gross ? 'active' : ''}`}
              onClick={() => set({ incomeMode: 'taxable' })}
              title="Use directly — matches ESTV calculator exactly">
              Taxable
            </button>
          </div>
          <div className="max-income-row">
            <select value={maxIncome} onChange={(e) => setMaxIncome(+e.target.value)}>
              <option value={120000}>max 120k</option>
              <option value={250000}>max 250k</option>
              <option value={500000}>max 500k</option>
              <option value={1000000}>max 1M</option>
            </select>
          </div>
        </div>
      </div>

      <div className="control-block">
        <label>Commune</label>
        <input
          type="text"
          placeholder='Search "Ecublens, VD" · "Zürich" · "Zuerich"…'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {matches.length > 0 && (
          <>
            <div className="search-count">{matches.length} match{matches.length === 1 ? '' : 'es'}</div>
            <div className="search-results scrollable">
              {matches.map(({ bfs, c }) => (
                <button
                  key={bfs}
                  className="search-row"
                  onClick={() => { onSelect(+bfs); setSearch(''); }}
                >
                  <span>{c.n}</span>
                  <span className="canton-chip">{c.c}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {search && matches.length === 0 && (
          <div className="search-count muted">No commune matches</div>
        )}
        <div className="selected-commune">
          {selectedCommune
            ? <>
                <strong>{selectedCommune.n}</strong>
                <span className="canton-chip">{selectedCommune.c}</span>
                {onCompare && (
                  <button
                    className={`compare-btn ${isInCompare ? 'in-compare' : ''}`}
                    onClick={() => onCompare(selectedBfsId)}
                    title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
                  >{isInCompare ? '−' : '+'} compare</button>
                )}
              </>
            : <span className="muted">Click on the map to select</span>}
        </div>
      </div>

      {comparedBfsIds.length > 0 && (
        <div className="control-block">
          <label>In comparison ({comparedBfsIds.length})</label>
          <div className="compare-list">
            {compareTotals.map((row) => {
              const refTotal = compareTotals.find(r => r.bfs === referenceBfsId)?.total
                              ?? compareTotals[0]?.total ?? 0;
              const diff = row.total - refTotal;
              const isRef = row.bfs === referenceBfsId;
              const diffCls = diff < 0 ? 'savings-good' : diff > 0 ? 'savings-bad' : 'savings-zero';
              return (
                <div key={row.bfs} className={`compare-row ${isRef ? 'is-ref' : ''}`}>
                  <button className={`ref-toggle ${isRef ? 'is-active' : ''}`}
                          onClick={() => onSetReference && onSetReference(row.bfs)}
                          title={isRef ? 'Reference for savings calculation' : 'Make this the reference'}>
                    {isRef ? '★' : '☆'}
                  </button>
                  <button className="compare-row-pick"
                          onClick={() => onSelect(row.bfs)}
                          title="Show on map">
                    <div className="cmp-row-name-line">
                      <span className="cmp-row-name">{row.commune.n}</span>
                      <span className="canton-chip">{row.commune.c}</span>
                    </div>
                    <div className={`compare-row-diff ${isRef ? '' : diffCls}`}>
                      {isRef ? (
                        <span className="muted">reference</span>
                      ) : (
                        <>
                          <span className="cmp-row-amt">
                            {diff > 0 ? '+' : diff < 0 ? '−' : ''}
                            {formatCHF(Math.abs(diff))} / yr
                          </span>
                          <span className="cmp-row-mo">
                            {diff > 0 ? '+' : diff < 0 ? '−' : ''}
                            {formatCHF(Math.abs(diff) / 12)} / mo
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                  <button className="compare-row-x"
                          onClick={() => onCompare && onCompare(row.bfs)}
                          title="Remove from comparison">×</button>
                </div>
              );
            })}
          </div>
          <div className="hint">★ sets the reference · click the name to focus on the map</div>
        </div>
      )}

      <div className="control-block toggles">
        <label className="toggle">
          <input type="checkbox" checked={state.married}
            onChange={(e) => set({ married: e.target.checked })}/>
          <span>Married / civil partnership</span>
        </label>
      </div>

      {state.married && (
        <div className="control-block">
          <div className="control-header">
            <label htmlFor="partner-income">Partner gross income</label>
            <div className="income-value secondary">{formatCHF(state.partnerIncome)}</div>
          </div>
          <input
            id="partner-income"
            type="range" min={0} max={maxIncome} step={1000}
            value={state.partnerIncome}
            onChange={(e) => set({ partnerIncome: +e.target.value })}
          />
          <div className="hint">
            Total joint income: <strong>{formatCHF(state.income + state.partnerIncome)}</strong>
            {state.partnerIncome > 0 && ' · Zweitverdienerabzug applied on lower earner'}
          </div>
        </div>
      )}

      <div className="control-block">
        <label>Children</label>
        <div className="mult-row">
          <input type="range" min={0} max={6} step={1}
            value={state.children}
            onChange={(e) => set({ children: +e.target.value })}
          />
          <span>{state.children}</span>
        </div>
      </div>

      <div className="control-block">
        <label>Confession (church tax)</label>
        <div className="confession-row">
          {CONFESSIONS.map(c => (
            <button
              key={c.id}
              className={`pill ${state.confession === c.id ? 'active' : ''}`}
              onClick={() => set({ confession: c.id })}
            >{c.label}</button>
          ))}
        </div>
        {selectedCommune && state.confession !== 'none' && (
          <div className="hint">
            Multiplier here: {
              state.confession === 'protestant'        ? `${selectedCommune.kP}%` :
              state.confession === 'catholic-roman'    ? `${selectedCommune.kR}%` :
              `${selectedCommune.kC}%`
            }
          </div>
        )}
      </div>

      {gross && (
        <div className="control-block">
          <button
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? '− Hide' : '+ Show'} deduction inputs
          </button>
          {showAdvanced && (
            <div className="deductions-grid">
              <NumberField
                label="Pillar 2 (BVG) contribution"
                value={state.pillar2}
                onChange={(v) => set({ pillar2: v })}
                hint="Annual employee BVG contribution (typ. 5–10% of gross)"
                step={500}
              />
              <NumberField
                label="Pillar 3a contribution"
                value={state.pillar3a}
                onChange={(v) => set({ pillar3a: v })}
                hint={`Max 2026: CHF 7'258 with BVG`}
                step={100}
              />
              <NumberField
                label="Travel expenses (Fahrkosten)"
                value={state.travelExpenses}
                onChange={(v) => set({ travelExpenses: v })}
                hint="Annual commute costs"
                step={100}
              />
              <NumberField
                label="Meal costs (Verpflegung)"
                value={state.mealCosts}
                onChange={(v) => set({ mealCosts: v })}
                hint="Annual workplace meal costs"
                step={100}
              />
              <NumberField
                label="Rent (Mietzins)"
                value={state.rent}
                onChange={(v) => set({ rent: v })}
                hint="Annual rent — applied via Mietzinsabzug (VD, ZG, …)"
                step={500}
              />
              <NumberField
                label="Savings interest"
                value={state.savingsInterest}
                onChange={(v) => set({ savingsInterest: v })}
                hint="Annual savings interest income (Sparzinsen-Abzug, VD …)"
                step={100}
              />
              {state.children > 0 && (
                <NumberField
                  label="Childcare (Fremdbetreuung)"
                  value={state.childcareCosts}
                  onChange={(v) => set({ childcareCosts: v })}
                  hint="Total external childcare expenses"
                  step={500}
                />
              )}
              <NumberField
                label="Other deductions"
                value={state.otherDeductions}
                onChange={(v) => set({ otherDeductions: v })}
                hint="Schuldzinsen, Liegenschaftsunterhalt, etc."
                step={500}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
