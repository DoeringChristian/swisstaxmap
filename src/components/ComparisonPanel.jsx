import { useMemo } from 'react';
import { computeTaxes, marginalRate, formatCHF, formatPct } from '../utils/taxCalculations.js';

export default function ComparisonPanel({
  comparedBfsIds, data, state, onRemove, onSetReference, onSelect,
}) {
  const rows = useMemo(() => {
    return comparedBfsIds.map((bfs) => {
      const commune = data.communes[bfs];
      if (!commune) return null;
      const cantonTariff = data.cantons[commune.c];
      const args = {
        ...state,
        commune, cantonTariff,
        federal: data.federal, deductionsData: data.deductions,
      };
      const r = computeTaxes(args);
      const mr = marginalRate(args);
      return { bfs, commune, result: r, marginal: mr };
    }).filter(Boolean);
  }, [comparedBfsIds, data, state]);

  if (rows.length === 0) return null;

  // Reference for savings = first entry (lowest tax burden visually highlighted too)
  const reference = rows[0];

  // Find the absolute lowest total for the green highlight
  const minTotal = Math.min(...rows.map(r => r.result.total));

  return (
    <div className="comparison-card">
      <div className="comparison-header">
        <h3>Comparison ({rows.length} commune{rows.length === 1 ? '' : 's'})</h3>
        <span className="muted">Savings vs. <strong>{reference.commune.n}</strong></span>
      </div>
      <div className="comparison-grid" style={{ '--cols': rows.length }}>
        <div className="cmp-row cmp-row-header">
          <div className="cmp-label">Commune</div>
          {rows.map((r) => (
            <div key={r.bfs} className="cmp-cell cmp-head">
              <div className="cmp-name">
                <button className="cmp-name-link" onClick={() => onSelect && onSelect(r.bfs)}
                        title="Show on map">
                  <strong>{r.commune.n}</strong>
                </button>
                <span className="canton-chip">{r.commune.c}</span>
                {r === reference && <span className="cmp-ref-badge">ref</span>}
              </div>
              <div className="cmp-actions">
                {r !== reference && (
                  <button className="cmp-link"
                    onClick={() => onSetReference(r.bfs)}
                    title="Use as savings reference">⤴ ref</button>
                )}
                <button className="cmp-x" onClick={() => onRemove(r.bfs)}
                        title="Remove from comparison">×</button>
              </div>
            </div>
          ))}
        </div>

        {[
          { key: 'federal',     label: 'Federal',   color: '#dc2626' },
          { key: 'cantonal',    label: 'Cantonal',  color: '#2563eb' },
          { key: 'commune',     label: 'Commune',   color: '#16a34a' },
          { key: 'church',      label: 'Church',    color: '#a855f7' },
        ].map((line) => (
          <div className="cmp-row" key={line.key}>
            <div className="cmp-label">
              <span className="dot" style={{ background: line.color }} />
              {line.label}
            </div>
            {rows.map((r) => (
              <div key={r.bfs} className="cmp-cell">
                <div className="cmp-amount">{formatCHF(r.result[line.key])}</div>
                <div className="cmp-mo">{formatCHF(r.result[line.key] / 12)} / mo</div>
              </div>
            ))}
          </div>
        ))}

        <div className="cmp-row cmp-row-total">
          <div className="cmp-label"><strong>Total taxes</strong></div>
          {rows.map((r) => {
            const isLowest = r.result.total === minTotal;
            return (
              <div key={r.bfs} className={`cmp-cell ${isLowest ? 'cmp-best' : ''}`}>
                <div className="cmp-amount">{formatCHF(r.result.total)}</div>
                <div className="cmp-mo">
                  {formatPct(r.result.effectiveRate)} eff.
                </div>
              </div>
            );
          })}
        </div>

        <div className="cmp-row">
          <div className="cmp-label">Savings vs. ref. (yr)</div>
          {rows.map((r) => {
            const diff = r.result.total - reference.result.total;
            const cls = diff < 0 ? 'savings-good' : diff > 0 ? 'savings-bad' : 'savings-zero';
            return (
              <div key={r.bfs} className={`cmp-cell ${cls}`}>
                <div className="cmp-amount">
                  {diff === 0 ? '—' : (diff < 0 ? '−' : '+') + formatCHF(Math.abs(diff)).replace('CHF', 'CHF ')}
                </div>
                <div className="cmp-mo">
                  {diff === 0 ? '' : (diff < 0 ? '−' : '+') + formatCHF(Math.abs(diff / 12)).replace('CHF', 'CHF ') + ' / mo'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="cmp-row">
          <div className="cmp-label">Marginal rate</div>
          {rows.map((r) => (
            <div key={r.bfs} className="cmp-cell">
              <div className="cmp-amount">{formatPct(r.marginal)}</div>
              <div className="cmp-mo">on next 1'000</div>
            </div>
          ))}
        </div>

        <div className="cmp-row">
          <div className="cmp-label">Net (after taxes &amp; social)</div>
          {rows.map((r) => (
            <div key={r.bfs} className="cmp-cell">
              <div className="cmp-amount">{formatCHF(r.result.net)}</div>
              <div className="cmp-mo">{formatCHF(r.result.net / 12)} / mo</div>
            </div>
          ))}
        </div>

        {state.incomeMode === 'gross' && (
          <>
            <div className="cmp-row">
              <div className="cmp-label">Social contributions</div>
              {rows.map((r) => (
                <div key={r.bfs} className="cmp-cell">
                  <div className="cmp-amount">{formatCHF(r.result.socialContributions)}</div>
                  <div className="cmp-mo">{formatCHF(r.result.socialContributions / 12)} / mo</div>
                </div>
              ))}
            </div>
            {rows.some(r => r.result.bvg > 0) && (
              <div className="cmp-row">
                <div className="cmp-label">Pillar 2 (BVG)</div>
                {rows.map((r) => (
                  <div key={r.bfs} className="cmp-cell">
                    <div className="cmp-amount">{formatCHF(r.result.bvg)}</div>
                    <div className="cmp-mo">{formatCHF(r.result.bvg / 12)} / mo</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="cmp-row">
          <div className="cmp-label">Taxable (federal)</div>
          {rows.map((r) => (
            <div key={r.bfs} className="cmp-cell cmp-faint">
              {formatCHF(r.result.taxableFederal)}
            </div>
          ))}
        </div>
        <div className="cmp-row">
          <div className="cmp-label">Taxable (cantonal)</div>
          {rows.map((r) => (
            <div key={r.bfs} className="cmp-cell cmp-faint">
              {formatCHF(r.result.taxableCantonal)}
            </div>
          ))}
        </div>

        <div className="cmp-row">
          <div className="cmp-label">Multipliers (Ca / Co / Ch)</div>
          {rows.map((r) => (
            <div key={r.bfs} className="cmp-cell cmp-faint">
              {r.commune.ca}% / {r.commune.co}% / {r.result.churchRate || 0}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
