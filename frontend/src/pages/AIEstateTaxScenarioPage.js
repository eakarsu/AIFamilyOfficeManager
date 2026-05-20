import React from 'react';
import AIPage from '../components/AIPage';
import { aiEstateTaxScenario } from '../services/api';

export default function AIEstateTaxScenarioPage() {
  return (
    <AIPage
      title="AI · Estate Tax Scenario"
      feature="estate-tax-scenario"
      subtitle="Model federal, state and foreign estate-tax exposure under a scenario."
      inputs={[
        { key: 'family_id',     label: 'Family ID',     placeholder: 'e.g. FAM-001' },
        { key: 'scenario',      label: 'Scenario',      type: 'textarea', placeholder: 'e.g. Model the 2026 federal sunset impact without further planning.' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea', placeholder: 'Residency, current exemptions used, structures already in place.' },
      ]}
      run={(v) => aiEstateTaxScenario({ family_id: v.family_id, scenario: v.scenario, context_notes: v.context_notes })}
    />
  );
}
