import React from 'react';
import CrudPage from '../components/CrudPage';
import { realEstateApi } from '../services/api';

export default function RealEstatePage() {
  return (
    <CrudPage
      title="Real Estate"
      subtitle="Primary residences, trophy properties and rental holdings."
      api={realEstateApi}
      statusKey="status"
      fields={[
        { key: 're_id',     label: 'RE ID' },
        { key: 'family_id', label: 'Family ID' },
        { key: 'address',   label: 'Address' },
        { key: 'type',      label: 'Type', type: 'select', options: ['residence','rental','commercial','land','vacation'] },
        { key: 'value_usd', label: 'Value (USD)', type: 'number' },
        { key: 'status',    label: 'Status',     type: 'select', options: ['held','listing','sold','review'] },
        { key: 'notes',     label: 'Notes',      type: 'textarea' },
      ]}
    />
  );
}
