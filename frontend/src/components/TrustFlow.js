import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';

function fmtUsd(n) {
  const v = Number(n || 0);
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

export default function TrustFlow({ data }) {
  const flows = (data && data.flows) || [];
  if (!flows.length) {
    return <div style={{ color: '#94a3b8' }}>No trust distribution data.</div>;
  }

  const chartData = flows.slice(0, 12).map((f) => ({
    name: f.edge_label,
    Scheduled: f.scheduled_usd,
    Paid: f.paid_usd,
    trust: f.trust_id,
    beneficiary: f.beneficiary_name,
  }));

  return (
    <div data-testid="trust-flow-chart" style={{ width: '100%', height: 420 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 130, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis type="number" tickFormatter={fmtUsd} stroke="#94a3b8" />
          <YAxis type="category" dataKey="name" stroke="#cbd5e1" width={220} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, name) => [fmtUsd(value), name]}
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
          <Bar dataKey="Scheduled" stackId="a" fill="#a78bfa" />
          <Bar dataKey="Paid"      stackId="a" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', color: '#cbd5e1', marginTop: 8 }}>
        {data.total_edges} trust→beneficiary edges · Grand total{' '}
        <strong style={{ color: '#fff' }}>{fmtUsd(data.grand_total_usd)}</strong>
      </div>
    </div>
  );
}
