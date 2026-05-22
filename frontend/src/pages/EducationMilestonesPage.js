import React from 'react';
import CrudPage from '../components/CrudPage';
import { educationMilestonesApi } from '../services/api';

export default function EducationMilestonesPage() {
  return (
    <CrudPage
      title="Education Milestones"
      subtitle="Per-beneficiary academic / extracurricular achievements (admissions, exams, awards, internships)."
      api={educationMilestonesApi}
      statusKey="status"
      fields={[
        { key: 'emi_id',         label: 'Milestone ID' },
        { key: 'beneficiary_id', label: 'Beneficiary ID' },
        { key: 'title',          label: 'Title' },
        { key: 'category',       label: 'Category', type: 'select', options: ['admission','exam','graduation','award','internship','other'] },
        { key: 'target_date',    label: 'Target Date',   type: 'date' },
        { key: 'achieved_date',  label: 'Achieved Date', type: 'date' },
        { key: 'status',         label: 'Status', type: 'select', options: ['planned','in_progress','achieved','missed'] },
        { key: 'notes',          label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
