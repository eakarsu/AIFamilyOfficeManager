import React from 'react';
import CrudPage from '../components/CrudPage';
import { distributionsApi } from '../services/api';

export default function DistributionsPage() {
  return (
    <CrudPage
      title="Distributions"
      subtitle="Trust → beneficiary distributions by period."
      api={distributionsApi}
      statusKey="status"
      fields={[
        { key: 'dist_id',        label: 'Distribution ID' },
        { key: 'trust_id',       label: 'Trust ID' },
        { key: 'beneficiary_id', label: 'Beneficiary ID' },
        { key: 'amount_usd',     label: 'Amount (USD)', type: 'number' },
        { key: 'period',         label: 'Period' },
        { key: 'status',         label: 'Status',       type: 'select', options: ['scheduled','approved','paid','cancelled'] },
        { key: 'notes',          label: 'Notes',        type: 'textarea' },
      ]}
    />
  );
}
