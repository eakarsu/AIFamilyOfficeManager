import React from 'react';
import CrudPage from '../components/CrudPage';
import { successionPlansApi } from '../services/api';

export default function SuccessionPlansPage() {
  return (
    <CrudPage
      title="Succession Plans"
      subtitle="Versioned succession documents and signatory lists."
      api={successionPlansApi}
      statusKey="status"
      fields={[
        { key: 'plan_id',        label: 'Plan ID' },
        { key: 'family_id',      label: 'Family ID' },
        { key: 'version',        label: 'Version' },
        { key: 'signatories',    label: 'Signatories', type: 'textarea' },
        { key: 'effective_date', label: 'Effective Date', type: 'date' },
        { key: 'status',         label: 'Status',         type: 'select', options: ['active','review','superseded'] },
        { key: 'notes',          label: 'Notes',          type: 'textarea' },
      ]}
    />
  );
}
