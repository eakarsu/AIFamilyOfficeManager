import React from 'react';
import AIPage from '../components/AIPage';
import { aiEducationDistributionRule } from '../services/api';

export default function AIEducationDistributionRulePage() {
  return (
    <AIPage
      title="AI · Education Distribution Rule"
      feature="education-distribution-rule"
      subtitle="Draft a fair, scalable rule for education distributions across beneficiaries."
      inputs={[
        { key: 'family_id',     label: 'Family ID',     placeholder: 'e.g. FAM-001' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea', placeholder: 'Coverage scope, caps, merit components, spouse coverage.' },
      ]}
      run={(v) => aiEducationDistributionRule({ family_id: v.family_id, context_notes: v.context_notes })}
    />
  );
}
