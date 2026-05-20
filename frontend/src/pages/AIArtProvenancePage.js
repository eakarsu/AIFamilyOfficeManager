import React from 'react';
import AIPage from '../components/AIPage';
import { aiArtProvenanceCheck } from '../services/api';

export default function AIArtProvenancePage() {
  return (
    <AIPage
      title="AI · Art Provenance Check"
      feature="art-provenance-check"
      subtitle="Audit the chain of ownership for a work for gaps and red flags."
      inputs={[
        { key: 'art_id',             label: 'Art ID',        placeholder: 'e.g. ART-014' },
        { key: 'work_title',         label: 'Work Title',    placeholder: 'e.g. Femme assise (1937)' },
        { key: 'artist',             label: 'Artist',        placeholder: 'e.g. Pablo Picasso' },
        { key: 'claimed_provenance', label: 'Claimed Provenance', type: 'textarea' },
        { key: 'context_notes',      label: 'Context Notes', type: 'textarea' },
      ]}
      run={(v) => aiArtProvenanceCheck({
        art_id: v.art_id,
        work_title: v.work_title,
        artist: v.artist,
        claimed_provenance: v.claimed_provenance,
        context_notes: v.context_notes,
      })}
    />
  );
}
