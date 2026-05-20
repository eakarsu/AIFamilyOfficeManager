import React from 'react';
import CrudPage from '../components/CrudPage';
import { familiesApi } from '../services/api';

export default function FamiliesPage() {
  return (
    <CrudPage
      title="Families"
      subtitle="Multi-generation family households served by the office."
      api={familiesApi}
      statusKey="status"
      fields={[
        { key: 'family_id',          label: 'Family ID' },
        { key: 'name',               label: 'Name' },
        { key: 'generation_count',   label: 'Generations', type: 'number' },
        { key: 'primary_residence',  label: 'Primary Residence' },
        { key: 'net_worth_band',     label: 'Net Worth Band',  type: 'select', options: ['$100M-$250M','$250M-$500M','$500M-$1B','$1B-$5B','$5B+'] },
        { key: 'advisor_id',         label: 'Lead Advisor ID' },
        { key: 'status',             label: 'Status',          type: 'select', options: ['active','review','dormant'] },
        { key: 'notes',              label: 'Notes',           type: 'textarea' },
      ]}
    />
  );
}
