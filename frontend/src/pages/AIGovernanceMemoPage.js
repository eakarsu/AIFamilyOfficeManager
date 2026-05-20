import React from 'react';
import AIPage from '../components/AIPage';
import { aiGovernanceMemoDraft } from '../services/api';

export default function AIGovernanceMemoPage() {
  return (
    <AIPage
      title="AI · Governance Memo Draft"
      feature="governance-memo-draft"
      subtitle="Draft a structured governance memo for the family council."
      inputs={[
        { key: 'family_id',     label: 'Family ID', placeholder: 'e.g. FAM-001' },
        { key: 'topic',         label: 'Memo Topic',    type: 'textarea', placeholder: 'e.g. Amend IPS v2.0 to raise illiquid allocation cap from 25% → 35%.' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiGovernanceMemoDraft({ family_id: v.family_id, topic: v.topic, context_notes: v.context_notes })}
    />
  );
}
