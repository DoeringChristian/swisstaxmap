import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  Legend, ReferenceLine,
} from 'recharts';
import { computeTaxes } from '../utils/taxCalculations.js';

const COLORS = {
  federal:  '#dc2626',
  cantonal: '#2563eb',
  commune:  '#16a34a',
  church:   '#a855f7',
  total:    '#facc15',
};

export default function RateChart({ params, commune, cantonTariff, federal, deductionsData, maxIncome }) {
  const data = useMemo(() => {
    if (!commune || !cantonTariff) return [];
    const out = [];
    const step = Math.max(1000, Math.round(maxIncome / 80));
    const denom = (gross, taxable) => params.incomeMode === 'gross' ? gross : taxable;

    let prev = null;
    for (let income = step; income <= maxIncome; income += step) {
      const r = computeTaxes({
        ...params, income,
        commune, cantonTariff, federal, deductionsData,
      });
      const d = denom(income, r.taxableCantonal);
      const point = {
        income,
        eff_federal:  d ? (r.federal  / d) * 100 : 0,
        eff_cantonal: d ? (r.cantonal / d) * 100 : 0,
        eff_commune:  d ? (r.commune  / d) * 100 : 0,
        eff_church:   d ? (r.church   / d) * 100 : 0,
        eff_total:    d ? (r.total    / d) * 100 : 0,
      };
      if (prev) {
        const dx = income - prev.income;
        point.mar_federal  = (r.federal  - prev.federal)  / dx * 100;
        point.mar_cantonal = (r.cantonal - prev.cantonal) / dx * 100;
        point.mar_commune  = (r.commune  - prev.commune)  / dx * 100;
        point.mar_church   = (r.church   - prev.church)   / dx * 100;
        point.mar_total    = (r.total    - prev.total)    / dx * 100;
      }
      out.push(point);
      prev = { income, federal: r.federal, cantonal: r.cantonal,
              commune: r.commune, church: r.church, total: r.total };
    }
    return out;
  }, [commune, cantonTariff, federal, deductionsData, params, maxIncome]);

  if (!commune) return null;

  const hasChurch = (commune.kP + commune.kR + commune.kC) > 0 && params.confession !== 'none';

  return (
    <div className="chart-card">
      <h3>Effective vs marginal rate by sector</h3>
      <div className="chart-legend-hint">solid = effective · dashed = marginal</div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
          <XAxis dataKey="income"
            tickFormatter={(v) => `${Math.round(v/1000)}k`} stroke="#94a3b8" />
          <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155',
                            borderRadius: 8, fontSize: 12 }}
            labelFormatter={(v) => `Income: CHF ${v.toLocaleString('de-CH')}`}
            formatter={(value, name) => [`${(+value).toFixed(2)}%`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine x={params.income} stroke="#facc15" strokeDasharray="4 4" />

          <Line type="monotone" dataKey="eff_total"    stroke={COLORS.total} strokeWidth={2.5} dot={false} name="Total (effective)" />
          <Line type="monotone" dataKey="mar_total"    stroke={COLORS.total} strokeDasharray="5 5" strokeWidth={2} dot={false} name="Total (marginal)" />

          <Line type="monotone" dataKey="eff_federal"  stroke={COLORS.federal}  strokeWidth={1.5} dot={false} name="Federal (eff.)" />
          <Line type="monotone" dataKey="mar_federal"  stroke={COLORS.federal}  strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Federal (marg.)" />

          <Line type="monotone" dataKey="eff_cantonal" stroke={COLORS.cantonal} strokeWidth={1.5} dot={false} name="Cantonal (eff.)" />
          <Line type="monotone" dataKey="mar_cantonal" stroke={COLORS.cantonal} strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Cantonal (marg.)" />

          <Line type="monotone" dataKey="eff_commune"  stroke={COLORS.commune}  strokeWidth={1.5} dot={false} name="Commune (eff.)" />
          <Line type="monotone" dataKey="mar_commune"  stroke={COLORS.commune}  strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Commune (marg.)" />

          {hasChurch && <>
            <Line type="monotone" dataKey="eff_church" stroke={COLORS.church} strokeWidth={1.5} dot={false} name="Church (eff.)" />
            <Line type="monotone" dataKey="mar_church" stroke={COLORS.church} strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Church (marg.)" />
          </>}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
