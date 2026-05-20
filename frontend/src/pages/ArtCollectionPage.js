import React from 'react';
import CrudPage from '../components/CrudPage';
import { artCollectionApi } from '../services/api';

export default function ArtCollectionPage() {
  return (
    <CrudPage
      title="Art Collection"
      subtitle="Fine art holdings with provenance and verification status."
      api={artCollectionApi}
      statusKey="status"
      fields={[
        { key: 'art_id',     label: 'Art ID' },
        { key: 'family_id',  label: 'Family ID' },
        { key: 'artist',     label: 'Artist' },
        { key: 'work',       label: 'Work' },
        { key: 'value_usd',  label: 'Value (USD)', type: 'number' },
        { key: 'provenance', label: 'Provenance', type: 'textarea' },
        { key: 'status',     label: 'Status',     type: 'select', options: ['verified','review','disputed','loaned','sold'] },
        { key: 'notes',      label: 'Notes',      type: 'textarea' },
      ]}
    />
  );
}
