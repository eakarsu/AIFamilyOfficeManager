import React from 'react';
import AIPage from '../components/AIPage';
import { aiIlliquidValuationBand } from '../services/api';

export default function AIIlliquidValuationPage() {
  return (
    <AIPage
      title="AI · Illiquid Valuation Band"
      feature="illiquid-valuation-band"
      subtitle="Defensible low / mid / high valuation band for an illiquid asset."
      inputs={[
        { key: 'asset_id',      label: 'Asset ID',      placeholder: 'e.g. ILA-001' },
        { key: 'asset_type',    label: 'Asset Type',    placeholder: 'e.g. private operating company' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea', placeholder: 'Comps, EBITDA, recent transactions.' },
      ]}
      run={(v) => aiIlliquidValuationBand({ asset_id: v.asset_id, asset_type: v.asset_type, context_notes: v.context_notes })}
    />
  );
}
