import React from 'react';
import AIPage from '../components/AIPage';
import { aiFamilyMeetingAgenda } from '../services/api';

export default function AIFamilyMeetingAgendaPage() {
  return (
    <AIPage
      title="AI · Family Meeting Agenda"
      feature="family-meeting-agenda"
      subtitle="Build a structured annual family meeting agenda."
      inputs={[
        { key: 'family_id',     label: 'Family ID', placeholder: 'e.g. FAM-001' },
        { key: 'themes',        label: 'Themes',    type: 'textarea', placeholder: 'e.g. 2026 sunset planning, IPS amendment, Q2 distributions.' },
        { key: 'context_notes', label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiFamilyMeetingAgenda({ family_id: v.family_id, themes: v.themes, context_notes: v.context_notes })}
    />
  );
}
