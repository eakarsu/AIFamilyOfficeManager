import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';

function fmtUsd(n) {
  const v = Number(n || 0);
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

export default function NetWorthChart({ data }) {
  const series = (data && data.series) || [];
  if (!series.length) {
    return <div style={{ color: '#94a3b8' }}>No net-worth series available.</div>;
  }

  return (
    <div data-testid="networth-chart" style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradHold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis tickFormatter={fmtUsd} stroke="#94a3b8" width={70} />
          <Tooltip
            formatter={(value, name) => [fmtUsd(value), name]}
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />

          <Area
            type="monotone" dataKey="valuation_usd" name="Valuations"
            stroke="#10b981" fillOpacity={1} fill="url(#gradVal)"
          />
          <Area
            type="monotone" dataKey="holdings_usd" name="Holdings"
            stroke="#f59e0b" fillOpacity={1} fill="url(#gradHold)"
          />
          <Area
            type="monotone" dataKey="net_worth_usd" name="Net Worth"
            stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gradNet)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', color: '#cbd5e1', marginTop: 8 }}>
        Latest Net Worth:{' '}
        <strong style={{ color: '#fff' }}>{fmtUsd(data.latest_net_worth_usd)}</strong>
      </div>
    </div>
  );
}
