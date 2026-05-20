import React from 'react';
import CrudPage from '../components/CrudPage';
import { beneficiariesApi } from '../services/api';

export default function BeneficiariesPage() {
  return (
    <CrudPage
      title="Beneficiaries"
      subtitle="Named beneficiaries with date of birth and relationship."
      api={beneficiariesApi}
      statusKey="status"
      fields={[
        { key: 'ben_id',       label: 'Beneficiary ID' },
        { key: 'family_id',    label: 'Family ID' },
        { key: 'name',         label: 'Name' },
        { key: 'dob',          label: 'Date of Birth', type: 'date' },
        { key: 'relationship', label: 'Relationship',  type: 'select', options: ['matriarch','patriarch','spouse','son','daughter','grandson','granddaughter','sibling','other'] },
        { key: 'status',       label: 'Status',        type: 'select', options: ['active','minor','restricted','deceased'] },
        { key: 'notes',        label: 'Notes',         type: 'textarea' },
      ]}
    />
  );
}
