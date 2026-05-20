import React from 'react';
import AIPage from '../components/AIPage';
import { aiTrustDistributionSuggest } from '../services/api';

export default function AITrustDistributionPage() {
  return (
    <AIPage
      title="AI · Trust Distribution Suggest"
      feature="trust-distribution-suggest"
      subtitle="Suggest a period distribution schedule from a trust to its beneficiaries."
      inputs={[
        { key: 'trust_id',      label: 'Trust ID',      placeholder: 'e.g. TRU-001' },
        { key: 'period',        label: 'Period',        placeholder: 'e.g. 2026-Q2' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea', placeholder: 'HEMS standard, special requests, governance overlays.' },
      ]}
      run={(v) => aiTrustDistributionSuggest({ trust_id: v.trust_id, period: v.period, context_notes: v.context_notes })}
    />
  );
}
