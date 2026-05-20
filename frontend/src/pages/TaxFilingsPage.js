import React from 'react';
import CrudPage from '../components/CrudPage';
import { taxFilingsApi } from '../services/api';

export default function TaxFilingsPage() {
  return (
    <CrudPage
      title="Tax Filings"
      subtitle="Returns by family, year and type."
      api={taxFilingsApi}
      statusKey="status"
      fields={[
        { key: 'filing_id', label: 'Filing ID' },
        { key: 'family_id', label: 'Family ID' },
        { key: 'year',      label: 'Year', type: 'number' },
        { key: 'type',      label: 'Type' },
        { key: 'status',    label: 'Status',   type: 'select', options: ['draft','review','filed','amended','overdue'] },
        { key: 'filed_at',  label: 'Filed At', type: 'datetime-local' },
        { key: 'notes',     label: 'Notes',    type: 'textarea' },
      ]}
    />
  );
}
