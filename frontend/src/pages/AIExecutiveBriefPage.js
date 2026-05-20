import React from 'react';
import AIPage from '../components/AIPage';
import { aiExecutiveBrief } from '../services/api';

export default function AIExecutiveBriefPage() {
  return (
    <AIPage
      title="AI · Executive Brief"
      feature="executive-brief"
      subtitle="Principal-level operating brief on the office position."
      inputs={[
        { key: 'notes', label: 'Bias / Focus Notes', type: 'textarea', placeholder: 'Optional — bias the brief toward a particular family, region or topic.' },
      ]}
      run={(v) => aiExecutiveBrief({ notes: v.notes })}
    />
  );
}
