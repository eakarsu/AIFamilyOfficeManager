import React from 'react';
import CrudPage from '../components/CrudPage';
import { illiquidAssetsApi } from '../services/api';

export default function IlliquidAssetsPage() {
  return (
    <CrudPage
      title="Illiquid Assets"
      subtitle="Private companies, yachts, aircraft, plantations, IP."
      api={illiquidAssetsApi}
      statusKey="status"
      fields={[
        { key: 'asset_id',     label: 'Asset ID' },
        { key: 'family_id',    label: 'Family ID' },
        { key: 'type',         label: 'Type' },
        { key: 'valuation_usd',label: 'Valuation (USD)', type: 'number' },
        { key: 'valued_at',    label: 'Valued At',       type: 'date' },
        { key: 'custodian',    label: 'Custodian' },
        { key: 'status',       label: 'Status',          type: 'select', options: ['held','verified','divesting','sold','review'] },
        { key: 'notes',        label: 'Notes',           type: 'textarea' },
      ]}
    />
  );
}
