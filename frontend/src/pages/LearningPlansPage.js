import React from 'react';
import CrudPage from '../components/CrudPage';
import { learningPlansApi } from '../services/api';

export default function LearningPlansPage() {
  return (
    <CrudPage
      title="Learning Plans"
      subtitle="Annual development / education plan per beneficiary."
      api={learningPlansApi}
      statusKey="status"
      fields={[
        { key: 'plan_id',        label: 'Plan ID' },
        { key: 'beneficiary_id', label: 'Beneficiary ID' },
        { key: 'year',           label: 'Year',   type: 'number' },
        { key: 'focus',          label: 'Focus' },
        { key: 'mentor',         label: 'Mentor' },
        { key: 'budget_usd',     label: 'Budget (USD)', type: 'number' },
        { key: 'status',         label: 'Status', type: 'select', options: ['draft','approved','active','complete'] },
        { key: 'notes',          label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
