import React from 'react';
import CrudPage from '../components/CrudPage';
import { charitableGiftsApi } from '../services/api';

export default function CharitableGiftsPage() {
  return (
    <CrudPage
      title="Charitable Gifts"
      subtitle="DAF, foundation, CLT, CRUT and direct gifts."
      api={charitableGiftsApi}
      statusKey="status"
      fields={[
        { key: 'gift_id',    label: 'Gift ID' },
        { key: 'family_id',  label: 'Family ID' },
        { key: 'recipient',  label: 'Recipient' },
        { key: 'amount_usd', label: 'Amount (USD)', type: 'number' },
        { key: 'vehicle',    label: 'Vehicle',      type: 'select', options: ['DAF','private_foundation','CLT','CRUT','CRAT','PIF','foundation','direct'] },
        { key: 'ts',         label: 'Timestamp',    type: 'datetime-local' },
        { key: 'status',     label: 'Status',       type: 'select', options: ['completed','pending','review'] },
        { key: 'notes',      label: 'Notes',        type: 'textarea' },
      ]}
    />
  );
}
