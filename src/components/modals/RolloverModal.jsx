import { T } from '../../constants/index.js';
import { Mdl, Btn } from '../ui/BaseUI.jsx';
import { nextLevel } from '../../utils/paymentHelpers.js';

// ── ROLLOVER MODAL ────────────────────────────────────────────────────────────
export function RolloverModal({ students, cfg, onConfirm, onClose }) {
  const nextSem      = cfg.currentSemester === 1 ? 2 : 1;
  const nextYear     = cfg.currentSemester === 2 ? cfg.currentYear + 1 : cfg.currentYear;
  const advanceLevel = cfg.currentSemester === 2;
  const activeCount  = students.filter((s) => s.status === 'active').length;

  const summaryItems = [
    ['Currently',     `Sem ${cfg.currentSemester}, ${cfg.currentYear}`],
    ['Moving To',     `Sem ${nextSem}, ${nextYear}`],
    ['Level Advance', advanceLevel ? 'Yes — active students move up one level' : 'No — mid-year only'],
    ['Fee Status',    `All students reset to Unpaid for Sem ${nextSem}`],
  ];

  return (
    <Mdl title="Semester Rollover" onClose={onClose}>
      <div style={{ padding: 20 }}>
        {/* Warning banner */}
        <div style={{
          background: '#FFF7ED', border: '1px solid #FED7AA',
          borderRadius: 10, padding: '12px 16px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.orange, marginBottom: 4 }}>
            ⚠ Review before continuing
          </div>
          <div style={{ fontSize: 13, color: T.text }}>
            This will advance the system to{' '}
            <strong>Semester {nextSem}, {nextYear}</strong> and update{' '}
            <strong>{activeCount} active students</strong>.
          </div>
        </div>

        {/* Summary grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {summaryItems.map(([l, v]) => (
            <div key={l} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{
                fontSize: 11, color: T.muted, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3,
              }}>
                {l}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v}</div>
            </div>
          ))}
        </div>

        {advanceLevel && (
          <div style={{
            background: '#EDE9FE', border: '1px solid #C4B5FD',
            borderRadius: 8, padding: '10px 14px', marginBottom: 12,
            fontSize: 13, color: '#5B21B6',
          }}>
            📚 Level advance: e.g. Primary 6 → Secondary 1, Secondary 3 → Secondary 4. Upper 6 stays at Upper 6.
          </div>
        )}

        <div style={{ fontSize: 12, color: T.muted }}>
          Inactive, withdrawn, and graduated students will not be affected.
        </div>
      </div>

      <div style={{
        padding: '12px 20px', borderTop: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
      }}>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn v="orange" onClick={() => onConfirm(nextSem, nextYear, advanceLevel)}>
          🔄 Confirm Rollover
        </Btn>
      </div>
    </Mdl>
  );
}
