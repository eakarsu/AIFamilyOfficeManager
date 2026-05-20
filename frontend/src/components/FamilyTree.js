import React from 'react';

// Pure SVG family tree of beneficiaries by generation.
// data shape: { families: [{ name, family_id, generations: [{ generation, label, members:[{name,relationship,...}] }] }] }
export default function FamilyTree({ data }) {
  const families = (data && data.families) || [];
  if (!families.length) {
    return <div style={{ color: '#94a3b8' }}>No family tree data available.</div>;
  }

  // We render up to 4 family columns side-by-side; if there are more, we wrap.
  return (
    <div className="family-tree-wrap">
      {families.slice(0, 6).map((fam) => {
        // For each family, compute layout: 3 generation rows.
        const rowsWithMembers = fam.generations.filter((g) => (g.members || []).length > 0);
        const rowCount = rowsWithMembers.length || 1;
        const widest = Math.max(1, ...rowsWithMembers.map((g) => g.members.length));
        const nodeW = 150;
        const nodeH = 56;
        const hGap = 16;
        const vGap = 40;
        const width = Math.max(380, widest * (nodeW + hGap) + hGap);
        const height = rowCount * (nodeH + vGap) + vGap + 30;

        // Position each node.
        const nodes = [];
        rowsWithMembers.forEach((g, ri) => {
          const totalW = g.members.length * (nodeW + hGap) - hGap;
          const startX = (width - totalW) / 2;
          g.members.forEach((m, mi) => {
            nodes.push({
              x: startX + mi * (nodeW + hGap),
              y: 30 + ri * (nodeH + vGap),
              gen: g.generation,
              name: m.name || m.ben_id,
              relationship: m.relationship || '',
              status: m.status || '',
            });
          });
        });

        // Build edges parent-row -> child-row (center to center).
        const byGen = {};
        nodes.forEach((n) => {
          byGen[n.gen] = byGen[n.gen] || [];
          byGen[n.gen].push(n);
        });
        const genKeys = Object.keys(byGen).map(Number).sort((a, b) => a - b);
        const edges = [];
        for (let i = 0; i < genKeys.length - 1; i++) {
          const parents = byGen[genKeys[i]];
          const children = byGen[genKeys[i + 1]];
          if (!parents || !children) continue;
          children.forEach((c) => {
            // Connect to nearest parent (proximity heuristic).
            let nearest = parents[0];
            let bestDx = Math.abs(c.x - nearest.x);
            parents.forEach((p) => {
              const dx = Math.abs(c.x - p.x);
              if (dx < bestDx) { nearest = p; bestDx = dx; }
            });
            edges.push({
              x1: nearest.x + nodeW / 2,
              y1: nearest.y + nodeH,
              x2: c.x + nodeW / 2,
              y2: c.y,
            });
          });
        }

        const genColor = { 1: '#f59e0b', 2: '#3b82f6', 3: '#10b981' };

        return (
          <div key={fam.family_id} className="family-tree-card">
            <div className="family-tree-title">
              {fam.name}
              <span className="family-tree-sub">
                · {fam.family_id} · {fam.total_members} members
              </span>
            </div>
            <svg
              data-testid={`family-tree-svg-${fam.family_id}`}
              className="family-tree-svg"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {edges.map((e, i) => (
                <line
                  key={`e-${i}`}
                  x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke="#475569" strokeWidth="2"
                />
              ))}
              {nodes.map((n, i) => (
                <g key={`n-${i}`}>
                  <rect
                    x={n.x} y={n.y} width={nodeW} height={nodeH}
                    rx="8" ry="8"
                    fill="#0f172a"
                    stroke={genColor[n.gen] || '#64748b'}
                    strokeWidth="2"
                  />
                  <text
                    x={n.x + nodeW / 2} y={n.y + 22}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {n.name.length > 22 ? n.name.slice(0, 21) + '…' : n.name}
                  </text>
                  <text
                    x={n.x + nodeW / 2} y={n.y + 40}
                    textAnchor="middle"
                    fill={genColor[n.gen] || '#94a3b8'}
                    fontSize="10"
                  >
                    G{n.gen} · {n.relationship}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
