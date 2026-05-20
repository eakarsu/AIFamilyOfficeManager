import React from 'react';
import CrudPage from '../components/CrudPage';
import { trustsApi } from '../services/api';

export default function TrustsPage() {
  return (
    <CrudPage
      title="Trusts"
      subtitle="Dynasty, GST, discretionary, charitable and family holding trusts."
      api={trustsApi}
      statusKey="status"
      fields={[
        { key: 'trust_id',  label: 'Trust ID' },
        { key: 'family_id', label: 'Family ID' },
        { key: 'type',      label: 'Type' },
        { key: 'trustee',   label: 'Trustee' },
        { key: 'assets_usd',label: 'Assets (USD)', type: 'number' },
        { key: 'status',    label: 'Status',       type: 'select', options: ['active','closing','closed','review'] },
        { key: 'notes',     label: 'Notes',        type: 'textarea' },
      ]}
    />
  );
}
