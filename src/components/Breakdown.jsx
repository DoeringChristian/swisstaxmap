import { useState } from 'react';
import { formatCHF, formatPct } from '../utils/taxCalculations.js';

function YM({ value }) {
  return (
    <div className="ym">
      <div className="amount">{formatCHF(value)}</div>
      <div className="amount-m">{formatCHF(value / 12)} / mo</div>
    </div>
  );
}

function Row({ color, label, value, sub }) {
  return (
    <div className="row">
      <div className="row-left">
        {color && <span className="dot" style={{ background: color }} />}
        <div>
          <div>{label}</div>
          {sub && <div className="sub">{sub}</div>}
        </div>
      </div>
      <YM value={value} />
    </div>
  );
}

export default function Breakdown({ result, marginal, commune }) {
  const [showDeductions, setShowDeductions] = useState(false);

  if (!result) {
    return (
      <div className="breakdown-card">
        <div className="muted">Select a commune on the map to see the breakdown.</div>
      </div>
    );
  }

  const { federal, cantonal, commune: communal, church, total, net,
          grossIncome, taxableFederal, taxableCantonal,
          socialContributions, bvg, effectiveRate,
          cantonRate, communeRate, churchRate, incomeMode,
          deductionBreakdown, grossNet } = result;

  return (
    <div className="breakdown-card">
      <div className="breakdown-title">
        <span className="muted">Selected:</span>{' '}
        <strong>{commune?.n || '—'}</strong>
        <span className="canton-chip">{commune?.c}</span>
      </div>

      <div className="totals">
        <div>
          <div className="totals-label">Total taxes</div>
          <div className="totals-value">{formatCHF(total)}</div>
          <div className="totals-sub">
            {formatCHF(total / 12)} / month · {formatPct(effectiveRate)} of {incomeMode === 'gross' ? 'gross' : 'taxable'}
          </div>
        </div>
        <div>
          <div className="totals-label">
            {incomeMode === 'gross' ? 'Net (after taxes & social)' : 'After taxes'}
          </div>
          <div className="totals-value">{formatCHF(net)}</div>
          <div className="totals-sub">{formatCHF(net / 12)} / month</div>
        </div>
        <div>
          <div className="totals-label">Marginal rate</div>
          <div className="totals-value">{formatPct(marginal)}</div>
          <div className="totals-sub">On the next CHF 1'000</div>
        </div>
      </div>

      <div className="divider" />

      <div className="ym-header">
        <span>Tax line</span>
        <div className="ym"><span>yearly</span><span className="amount-m">monthly</span></div>
      </div>

      <Row color="#dc2626" label="Federal tax"  value={federal}
           sub={`Direkte Bundessteuer · on ${formatCHF(taxableFederal)}`} />
      <Row color="#2563eb" label="Cantonal tax" value={cantonal}
           sub={`× ${cantonRate}% · on ${formatCHF(taxableCantonal)}`} />
      <Row color="#16a34a" label="Commune tax"  value={communal}
           sub={`× ${communeRate}%`} />
      <Row color="#a855f7" label="Church tax"   value={church}
           sub={churchRate > 0 ? `× ${churchRate}%` : 'Not a church member'} />

      {incomeMode === 'gross' && (
        <>
          <div className="divider" />
          <Row color="#64748b" label="AHV / IV / EO + ALV"
               value={socialContributions} sub="Mandatory social contributions (≈ 6.4%)" />
          {bvg > 0 && (
            <Row color="#94a3b8" label="Pillar 2 (BVG)" value={bvg}
                 sub="Employee contribution" />
          )}
        </>
      )}

      <div className="divider" />

      {incomeMode === 'gross' && grossIncome > 0 && (
        <div className="row faint">
          <div>Gross income</div>
          <YM value={grossIncome} />
        </div>
      )}
      <div className="row faint">
        <div>Taxable (federal)</div>
        <YM value={taxableFederal} />
      </div>
      <div className="row faint">
        <div>Taxable (cantonal)</div>
        <YM value={taxableCantonal} />
      </div>

      {incomeMode === 'gross' && deductionBreakdown && deductionBreakdown.items.length > 0 && (
        <>
          <div className="divider" />
          <button className="deductions-toggle"
            onClick={() => setShowDeductions(!showDeductions)}>
            {showDeductions ? '− Hide' : '+ Show'} {deductionBreakdown.items.length} applied deductions
          </button>
          {showDeductions && (
            <div className="deduction-list">
              <div className="ded-header">
                <span>Deduction</span>
                <span>Federal</span>
                <span>Cantonal</span>
              </div>
              {deductionBreakdown.items.map(it => (
                <div key={it.id} className="ded-row">
                  <span>{it.label}</span>
                  <span>{formatCHF(it.federal)}</span>
                  <span>{formatCHF(it.canton)}</span>
                </div>
              ))}
              <div className="ded-total">
                <span>Total deductions</span>
                <span>{formatCHF(deductionBreakdown.totalFederal)}</span>
                <span>{formatCHF(deductionBreakdown.totalCanton)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
