import React from 'react';
import AIPage from '../components/AIPage';
import { aiTaxLossHarvest } from '../services/api';

export default function AITaxLossHarvestPage() {
  return (
    <AIPage
      title="AI · Tax-Loss Harvest"
      feature="tax-loss-harvest"
      subtitle="Identify tax-loss harvesting opportunities across the holdings book."
      inputs={[
        { key: 'family_id',     label: 'Family ID (optional)', placeholder: 'e.g. FAM-001' },
        { key: 'context_notes', label: 'Context Notes',        type: 'textarea', placeholder: 'YTD realised gains to offset, wash-sale concerns, etc.' },
      ]}
      run={(v) => aiTaxLossHarvest({ family_id: v.family_id, context_notes: v.context_notes })}
    />
  );
}
