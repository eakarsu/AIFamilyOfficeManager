import React from 'react';
import CrudPage from '../components/CrudPage';
import { auditLogApi } from '../services/api';

export default function AuditLogPage() {
  return (
    <CrudPage
      title="Audit Log"
      subtitle="Tamper-evident trail of actor, action and result."
      api={auditLogApi}
      statusKey="result"
      allowAttachments={false}
      fields={[
        { key: 'entry_id', label: 'Entry ID' },
        { key: 'actor',    label: 'Actor' },
        { key: 'target',   label: 'Target' },
        { key: 'action',   label: 'Action' },
        { key: 'result',   label: 'Result', type: 'select', options: ['success','pending','review','denied','draft'] },
        { key: 'ts',       label: 'Timestamp', type: 'datetime-local' },
        { key: 'notes',    label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
