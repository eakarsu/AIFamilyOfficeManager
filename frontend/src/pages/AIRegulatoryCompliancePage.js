import React from 'react';
import AIPage from '../components/AIPage';
import { aiRegulatoryComplianceCheck } from '../services/api';

export default function AIRegulatoryCompliancePage() {
  return (
    <AIPage
      title="AI · Regulatory Compliance Check"
      feature="regulatory-compliance-check"
      subtitle="Multi-jurisdiction compliance scan with obligations and deadlines."
      inputs={[
        { key: 'family_id',     label: 'Family ID',                   placeholder: 'e.g. FAM-001' },
        { key: 'jurisdictions', label: 'Jurisdictions (comma-list)',  type: 'textarea', placeholder: 'e.g. United States, Connecticut, Cayman Islands' },
        { key: 'context_notes', label: 'Context Notes',               type: 'textarea' },
      ]}
      run={(v) => {
        const list = (v.jurisdictions || '').split(',').map((s) => s.trim()).filter(Boolean);
        return aiRegulatoryComplianceCheck({ family_id: v.family_id, jurisdictions: list, context_notes: v.context_notes });
      }}
    />
  );
}
