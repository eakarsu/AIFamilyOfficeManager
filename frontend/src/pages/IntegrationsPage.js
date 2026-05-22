import React, { useEffect, useState } from 'react';
import {
  listIntegrations,
  plaidCreateLinkToken,
  plaidSyncHoldings,
  addeparSyncAccounts,
  canoeSyncAlts,
} from '../services/api';

const ACTIONS = {
  plaid:   [
    { label: 'Create Link Token', call: plaidCreateLinkToken },
    { label: 'Sync Holdings',     call: plaidSyncHoldings },
  ],
  addepar: [
    { label: 'Sync Accounts',     call: addeparSyncAccounts },
  ],
  canoe:   [
    { label: 'Sync Alt-Assets',   call: canoeSyncAlts },
  ],
};

export default function IntegrationsPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [actionLog, setActionLog] = useState({});

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listIntegrations()
      .then((d) => { if (alive) setProviders(Array.isArray(d?.providers) ? d.providers : []); })
      .catch((e) => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const runAction = async (provider, label, call) => {
    setActionLog((prev) => ({ ...prev, [`${provider}:${label}`]: { busy: true } }));
    try {
      const out = await call({});
      setActionLog((prev) => ({ ...prev, [`${provider}:${label}`]: { busy: false, out } }));
    } catch (e) {
      setActionLog((prev) => ({ ...prev, [`${provider}:${label}`]: { busy: false, err: e.message } }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Custodian / Aggregator Integrations</h2>
          <p>
            Live wiring for Plaid, Addepar, and Canoe is gated on credentials.
            All sync endpoints return HTTP 503 until the listed env vars are set on the backend host.
          </p>
        </div>
      </div>

      {err && <div className="ai-error">Failed to load: {err}</div>}
      {loading && <div className="empty-state">Loading...</div>}

      {!loading && providers.map((p) => {
        const acts = ACTIONS[p.provider] || [];
        return (
          <div className="card" key={p.provider} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ margin: 0 }}>{p.provider}</h3>
              <span className={`badge ${p.configured ? 'active' : 'review'}`}>
                {p.configured ? 'configured' : 'not configured'}
              </span>
            </div>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>{p.purpose}</p>
            <div style={{ fontSize: 13, color: '#cbd5e1' }}>
              <div><strong>Required env:</strong> <code>{(p.required_env || []).join(', ') || '—'}</code></div>
              {Array.isArray(p.missing_env) && p.missing_env.length > 0 && (
                <div style={{ marginTop: 4, color: '#fbbf24' }}>
                  <strong>Missing:</strong> <code>{p.missing_env.join(', ')}</code>
                </div>
              )}
            </div>

            {acts.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {acts.map((a) => {
                  const key = `${p.provider}:${a.label}`;
                  const log = actionLog[key];
                  return (
                    <div key={key}>
                      <button
                        className="btn secondary"
                        disabled={log?.busy}
                        onClick={() => runAction(p.provider, a.label, a.call)}
                      >
                        {log?.busy ? 'Running...' : a.label}
                      </button>
                      {log && !log.busy && (log.out || log.err) && (
                        <pre style={{
                          background: '#0b1424',
                          padding: 8,
                          marginTop: 6,
                          borderRadius: 6,
                          fontSize: 11,
                          maxWidth: 460,
                          whiteSpace: 'pre-wrap',
                        }}>
                          {log.err
                            ? `Error: ${log.err}`
                            : JSON.stringify(log.out, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
