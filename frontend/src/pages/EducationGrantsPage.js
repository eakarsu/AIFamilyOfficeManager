import React from 'react';
import CrudPage from '../components/CrudPage';
import { educationGrantsApi } from '../services/api';

export default function EducationGrantsPage() {
  return (
    <CrudPage
      title="Education Grants"
      subtitle="Education distributions to beneficiaries."
      api={educationGrantsApi}
      statusKey="status"
      fields={[
        { key: 'grant_id',       label: 'Grant ID' },
        { key: 'beneficiary_id', label: 'Beneficiary ID' },
        { key: 'school',         label: 'School' },
        { key: 'amount_usd',     label: 'Amount (USD)', type: 'number' },
        { key: 'year',           label: 'Year', type: 'number' },
        { key: 'status',         label: 'Status', type: 'select', options: ['pending','approved','paid','denied'] },
        { key: 'notes',          label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
