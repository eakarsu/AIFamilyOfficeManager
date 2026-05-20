import React from 'react';
import AIPage from '../components/AIPage';
import { aiCharitableVehicleRecommend } from '../services/api';

export default function AICharitableVehiclePage() {
  return (
    <AIPage
      title="AI · Charitable Vehicle Recommend"
      feature="charitable-vehicle-recommend"
      subtitle="Pick the right giving vehicle: DAF, private foundation, CLT, CRUT, direct."
      inputs={[
        { key: 'family_id',     label: 'Family ID',     placeholder: 'e.g. FAM-001' },
        { key: 'goals',         label: 'Philanthropic Goals', type: 'textarea', placeholder: 'e.g. Sustain $8M/year giving across education and cancer research.' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiCharitableVehicleRecommend({ family_id: v.family_id, goals: v.goals, context_notes: v.context_notes })}
    />
  );
}
