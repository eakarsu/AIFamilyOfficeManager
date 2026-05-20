import React from 'react';
import AIPage from '../components/AIPage';
import { aiBeneficiaryOnboarding } from '../services/api';

export default function AIBeneficiaryOnboardingPage() {
  return (
    <AIPage
      title="AI · Beneficiary Onboarding"
      feature="beneficiary-onboarding"
      subtitle="Generate a phased onboarding plan for a new or maturing beneficiary."
      inputs={[
        { key: 'ben_id',        label: 'Beneficiary ID', placeholder: 'e.g. BEN-003' },
        { key: 'family_id',     label: 'Family ID',      placeholder: 'e.g. FAM-001 (optional, inferred from beneficiary)' },
        { key: 'context_notes', label: 'Context Notes',  type: 'textarea' },
      ]}
      run={(v) => aiBeneficiaryOnboarding({ ben_id: v.ben_id, family_id: v.family_id, context_notes: v.context_notes })}
    />
  );
}
