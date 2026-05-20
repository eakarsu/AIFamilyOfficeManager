import React from 'react';
import CrudPage from '../components/CrudPage';
import { advisorsApi } from '../services/api';

export default function AdvisorsPage() {
  return (
    <CrudPage
      title="Advisors"
      subtitle="Lead advisors and specialist counsel per family."
      api={advisorsApi}
      statusKey="status"
      fields={[
        { key: 'advisor_id', label: 'Advisor ID' },
        { key: 'name',       label: 'Name' },
        { key: 'firm',       label: 'Firm' },
        { key: 'specialty',  label: 'Specialty' },
        { key: 'family_id',  label: 'Family ID' },
        { key: 'status',     label: 'Status', type: 'select', options: ['active','review','retired'] },
        { key: 'notes',      label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
