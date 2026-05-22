import React, { useState } from 'react';

export default function LiquidityLadderPage() {
  const [form, setForm] = useState({ liquidAssets: 2500000, obligations12m: 1800000, capitalCalls12m: 900000, distributionRequests: 600000 });
  const [result, setResult] = useState(null);
  const submit = async () => {
    const response = await fetch('/api/liquidity-ladder/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify(form),
    });
    setResult(await response.json());
  };
  return (
    <div className="panel">
      <h1>Liquidity Ladder</h1>
      {Object.entries(form).map(([key, value]) => (
        <label key={key}>{key.replace(/([A-Z])/g, ' $1')}<input type="number" value={value} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} /></label>
      ))}
      <button className="btn primary" onClick={submit}>Score liquidity</button>
      {result && <section><h2>{result.level.toUpperCase()} · {result.score}/100 · {result.coverage}x</h2><ul>{result.actions.map((action) => <li key={action}>{action}</li>)}</ul></section>}
    </div>
  );
}
