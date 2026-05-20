import React from 'react';
import AIPage from '../components/AIPage';
import { aiGenerationalImpact } from '../services/api';

export default function AIGenerationalImpactPage() {
  return (
    <AIPage
      title="AI · Generational Impact"
      feature="generational-impact"
      subtitle="Model the impact of a major wealth-transfer decision across G1-G4."
      inputs={[
        { key: 'family_id',     label: 'Family ID',     placeholder: 'e.g. FAM-001' },
        { key: 'decision',      label: 'Decision',      type: 'textarea', placeholder: 'e.g. Sell Vandermeer Holdings LLC for $185M cash now vs hold 10y.' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiGenerationalImpact({ family_id: v.family_id, decision: v.decision, context_notes: v.context_notes })}
    />
  );
}
