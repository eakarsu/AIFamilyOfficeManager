import React from 'react';
import CrudPage from '../components/CrudPage';
import { valuationReportsApi } from '../services/api';

export default function ValuationReportsPage() {
  return (
    <CrudPage
      title="Valuation Reports"
      subtitle="Third-party valuation reports of illiquid assets."
      api={valuationReportsApi}
      statusKey="status"
      fields={[
        { key: 'val_id',    label: 'Valuation ID' },
        { key: 'asset_id',  label: 'Asset ID' },
        { key: 'valuer',    label: 'Valuer' },
        { key: 'value_usd', label: 'Value (USD)', type: 'number' },
        { key: 'valued_at', label: 'Valued At',   type: 'date' },
        { key: 'status',    label: 'Status',      type: 'select', options: ['draft','final','disputed','review'] },
        { key: 'notes',     label: 'Notes',       type: 'textarea' },
      ]}
    />
  );
}
