import React from 'react';
import CrudPage from '../components/CrudPage';
import { holdingsApi } from '../services/api';

export default function HoldingsPage() {
  return (
    <CrudPage
      title="Holdings"
      subtitle="Public market positions across custodian accounts."
      api={holdingsApi}
      statusKey="status"
      fields={[
        { key: 'holding_id', label: 'Holding ID' },
        { key: 'family_id',  label: 'Family ID' },
        { key: 'security',   label: 'Security' },
        { key: 'qty',        label: 'Qty',          type: 'number' },
        { key: 'value_usd',  label: 'Value (USD)',  type: 'number' },
        { key: 'account',    label: 'Account' },
        { key: 'status',     label: 'Status',       type: 'select', options: ['open','closed','restricted'] },
        { key: 'notes',      label: 'Notes',        type: 'textarea' },
      ]}
    />
  );
}
