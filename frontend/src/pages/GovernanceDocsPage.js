import React from 'react';
import CrudPage from '../components/CrudPage';
import { governanceDocsApi } from '../services/api';

export default function GovernanceDocsPage() {
  return (
    <CrudPage
      title="Governance Docs"
      subtitle="Family constitutions, charters, IPS and bylaws."
      api={governanceDocsApi}
      statusKey="status"
      fields={[
        { key: 'doc_id',         label: 'Doc ID' },
        { key: 'family_id',      label: 'Family ID' },
        { key: 'type',           label: 'Type' },
        { key: 'version',        label: 'Version' },
        { key: 'effective_date', label: 'Effective Date', type: 'date' },
        { key: 'status',         label: 'Status',         type: 'select', options: ['active','review','superseded'] },
        { key: 'notes',          label: 'Notes',          type: 'textarea' },
      ]}
    />
  );
}
