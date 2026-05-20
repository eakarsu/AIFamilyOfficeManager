import React from 'react';
import AIPage from '../components/AIPage';
import { aiAssetAllocationRebalance } from '../services/api';

export default function AIAssetAllocationRebalancePage() {
  return (
    <AIPage
      title="AI · Asset Allocation Rebalance"
      feature="asset-allocation-rebalance"
      subtitle="Recommend a tax-aware rebalance from current to target allocation."
      inputs={[
        { key: 'family_id',          label: 'Family ID',          placeholder: 'e.g. FAM-001' },
        { key: 'current_allocation', label: 'Current Allocation (JSON object)', type: 'textarea', placeholder: '{"public_equity":0.35,"fixed_income":0.20,...}' },
        { key: 'target_allocation',  label: 'Target Allocation (JSON object)',  type: 'textarea', placeholder: '{"public_equity":0.30,"fixed_income":0.22,...}' },
        { key: 'context_notes',      label: 'Context Notes',      type: 'textarea' },
      ]}
      run={(v) => aiAssetAllocationRebalance({
        family_id: v.family_id,
        current_allocation: v.current_allocation,
        target_allocation: v.target_allocation,
        context_notes: v.context_notes,
      })}
    />
  );
}
