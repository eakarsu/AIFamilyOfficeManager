import React from 'react';
import AIPage from '../components/AIPage';
import { aiPhilanthropicGrantScore } from '../services/api';

export default function AIPhilanthropicGrantScorePage() {
  return (
    <AIPage
      title="AI · Philanthropic Grant Scorer"
      feature="philanthropic-grant-score"
      subtitle="Score a candidate grant on mission alignment, impact, ops health, governance, and concentration risk."
      inputs={[
        { key: 'family_id',     label: 'Family ID',     placeholder: 'e.g. FAM-001' },
        { key: 'recipient',     label: 'Recipient',     placeholder: 'e.g. Memorial Sloan Kettering' },
        { key: 'amount_usd',    label: 'Amount (USD)',  type: 'number' },
        { key: 'cause_area',    label: 'Cause Area',    placeholder: 'e.g. cancer research' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiPhilanthropicGrantScore({
        family_id:  v.family_id,
        recipient:  v.recipient,
        amount_usd: Number(v.amount_usd || 0),
        cause_area: v.cause_area,
        context_notes: v.context_notes,
      })}
    />
  );
}
