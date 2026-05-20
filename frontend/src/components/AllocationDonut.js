import React from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#a78bfa', '#ec4899',
  '#06b6d4', '#22c55e', '#ef4444', '#facc15', '#0ea5e9',
];

function fmtUsd(n) {
  const v = Number(n || 0);
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

export default function AllocationDonut({ data }) {
  const allocations = (data && data.allocations) || [];
  if (!allocations.length) {
    return <div style={{ color: '#94a3b8' }}>No allocation data available.</div>;
  }

  const chartData = allocations.map((a) => ({
    name: a.asset_class,
    value: a.value_usd,
    pct: a.pct,
  }));
  const total = data.total_value_usd || chartData.reduce((s, x) => s + x.value, 0);

  return (
    <div data-testid="allocation-donut" style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={2}
            label={(entry) => `${entry.name} (${entry.pct}%)`}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [fmtUsd(value), name]}
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', color: '#cbd5e1', marginTop: 8 }}>
        Total AUM: <strong style={{ color: '#fff' }}>{fmtUsd(total)}</strong>
      </div>
    </div>
  );
}
