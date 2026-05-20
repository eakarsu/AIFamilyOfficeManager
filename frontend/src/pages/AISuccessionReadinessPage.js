import React from 'react';
import AIPage from '../components/AIPage';
import { aiSuccessionReadiness } from '../services/api';

export default function AISuccessionReadinessPage() {
  return (
    <AIPage
      title="AI · Succession Readiness"
      feature="succession-readiness"
      subtitle="Score the family across documents, governance, next-gen, liquidity and advisor alignment."
      inputs={[
        { key: 'family_id',     label: 'Family ID',     placeholder: 'e.g. FAM-001' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiSuccessionReadiness({ family_id: v.family_id, context_notes: v.context_notes })}
    />
  );
}
