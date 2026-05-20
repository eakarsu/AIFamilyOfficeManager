import React from 'react';
import AIPage from '../components/AIPage';
import { aiCharitableImpactReport } from '../services/api';

export default function AICharitableImpactPage() {
  return (
    <AIPage
      title="AI · Charitable Impact Report"
      feature="charitable-impact-report"
      subtitle="Compose a periodic philanthropic impact report."
      inputs={[
        { key: 'family_id',     label: 'Family ID',     placeholder: 'e.g. FAM-001' },
        { key: 'period',        label: 'Period',        placeholder: 'e.g. 2025 calendar' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiCharitableImpactReport({ family_id: v.family_id, period: v.period, context_notes: v.context_notes })}
    />
  );
}
