import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  Legend, ReferenceLine,
} from 'recharts';
import { computeTaxes, formatCHF } from '../utils/taxCalculations.js';

export default function TaxChart({ params, commune, cantonTariff, federal, deductionsData, maxIncome }) {
  const data = useMemo(() => {
    if (!commune || !cantonTariff) return [];
    const out = [];
    const step = Math.max(1000, Math.round(maxIncome / 80));
    for (let income = 0; income <= maxIncome; income += step) {
      const r = computeTaxes({
        ...params,
        income,
        commune, cantonTariff, federal, deductionsData,
      });
      out.push({
        income,
        federal:  Math.round(r.federal),
        cantonal: Math.round(r.cantonal),
        commune:  Math.round(r.commune),
        church:   Math.round(r.church),
      });
    }
    return out;
  }, [commune, cantonTariff, federal, deductionsData, params, maxIncome]);

  if (!commune) return null;

  return (
    <div className="chart-card">
      <h3>{commune.n} — tax burden across income</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="g-fed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.85}/>
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.55}/>
            </linearGradient>
            <linearGradient id="g-can" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.85}/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.55}/>
            </linearGradient>
            <linearGradient id="g-com" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.85}/>
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0.55}/>
            </linearGradient>
            <linearGradient id="g-chu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.85}/>
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.55}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
          <XAxis dataKey="income" tickFormatter={(v) => `${Math.round(v/1000)}k`} stroke="#94a3b8" />
          <YAxis tickFormatter={(v) => `${Math.round(v/1000)}k`} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
            labelFormatter={(v) => `Gross income: ${formatCHF(v)}`}
            formatter={(value, name) => [formatCHF(value), name]}
          />
          <Legend />
          <ReferenceLine
            x={params.income} stroke="#facc15" strokeDasharray="4 4"
            label={{
              value: 'You',
              fill: '#facc15',
              fontSize: 12,
              position: params.income > maxIncome * 0.85 ? 'insideTopLeft' : 'insideTopRight',
            }} />
          <Area type="monotone" dataKey="federal"  stackId="1" stroke="#dc2626" fill="url(#g-fed)" name="Federal" />
          <Area type="monotone" dataKey="cantonal" stackId="1" stroke="#2563eb" fill="url(#g-can)" name="Cantonal" />
          <Area type="monotone" dataKey="commune"  stackId="1" stroke="#16a34a" fill="url(#g-com)" name="Commune" />
          <Area type="monotone" dataKey="church"   stackId="1" stroke="#a855f7" fill="url(#g-chu)" name="Church" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
