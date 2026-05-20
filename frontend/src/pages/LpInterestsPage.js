import React from 'react';
import CrudPage from '../components/CrudPage';
import { lpInterestsApi } from '../services/api';

export default function LpInterestsPage() {
  return (
    <CrudPage
      title="LP Interests"
      subtitle="Hedge fund and other LP positions with NAV."
      api={lpInterestsApi}
      statusKey="status"
      fields={[
        { key: 'lp_id',          label: 'LP ID' },
        { key: 'family_id',      label: 'Family ID' },
        { key: 'fund',           label: 'Fund' },
        { key: 'vintage',        label: 'Vintage', type: 'number' },
        { key: 'commitment_usd', label: 'Commitment (USD)', type: 'number' },
        { key: 'nav_usd',        label: 'NAV (USD)',        type: 'number' },
        { key: 'status',         label: 'Status',           type: 'select', options: ['active','wound_down','review'] },
        { key: 'notes',          label: 'Notes',            type: 'textarea' },
      ]}
    />
  );
}
