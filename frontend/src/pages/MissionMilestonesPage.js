import React from 'react';
import CrudPage from '../components/CrudPage';
import { missionMilestonesApi } from '../services/api';

export default function MissionMilestonesPage() {
  return (
    <CrudPage
      title="Mission Milestones"
      subtitle="Concrete deliverables tied to a Family Mission."
      api={missionMilestonesApi}
      statusKey="status"
      fields={[
        { key: 'milestone_id', label: 'Milestone ID' },
        { key: 'mission_id',   label: 'Mission ID' },
        { key: 'title',        label: 'Title' },
        { key: 'due_date',     label: 'Due Date', type: 'date' },
        { key: 'owner',        label: 'Owner' },
        { key: 'progress_pct', label: 'Progress %', type: 'number' },
        { key: 'status',       label: 'Status', type: 'select', options: ['open','in_progress','done','blocked'] },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
