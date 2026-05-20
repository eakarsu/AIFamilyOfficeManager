import React from 'react';
import CrudPage from '../components/CrudPage';
import { privateInvestmentsApi } from '../services/api';

export default function PrivateInvestmentsPage() {
  return (
    <CrudPage
      title="Private Investments"
      subtitle="PE fund commitments and capital called."
      api={privateInvestmentsApi}
      statusKey="status"
      fields={[
        { key: 'pi_id',          label: 'PI ID' },
        { key: 'family_id',      label: 'Family ID' },
        { key: 'fund',           label: 'Fund' },
        { key: 'commitment_usd', label: 'Commitment (USD)', type: 'number' },
        { key: 'called_usd',     label: 'Called (USD)',     type: 'number' },
        { key: 'status',         label: 'Status',           type: 'select', options: ['active','wound_down','distributing','review'] },
        { key: 'notes',          label: 'Notes',            type: 'textarea' },
      ]}
    />
  );
}
