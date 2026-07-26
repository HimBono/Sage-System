import { useState } from 'react';
import { Edit2, ClipboardList } from 'lucide-react';
import { T } from '../../constants/index.js';
import { fmtDate } from '../../utils/formatters.js';
import { payStatus, waMsg } from '../../utils/paymentHelpers.js';
import { Mdl, SBadge, Av, Btn } from '../ui/BaseUI.jsx';
import { PaymentsTab } from './PaymentsTab.jsx';
import { IDCard } from './IDCard.jsx';

// ── STUDENT DETAIL MODAL ──────────────────────────────────────────────────────
export function StudentDetail({ student, cfg, onClose, onEdit, onUpdate, onViewReceipt, onRegForm }) {
  const [tab, setTab] = useState('profile');
  const ps  = payStatus(student, cfg);
  const phone = (student.parentPhone || '').replace(/[^0-9]/g, '');
  const waUrl = phone
    ? `https://wa.me/6${phone}?text=${encodeURIComponent(waMsg(student, cfg))}`
    : null;

  const TB = ({ t, l }) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '9px 14px', border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: 13,
        borderBottom: tab === t ? `2px solid ${T.sky}` : '2px solid transparent',
        color: tab === t ? T.sky : T.muted, background: 'none',
      }}
    >
      {l}
    </button>
  );

  // Profile info sections
  const profileSections = [
    {
      h: 'Personal',
      rows: [
        ['IC / Passport', student.ic || '—'],
        ['Date of Birth', fmtDate(student.dob)],
        ['Gender',        student.gender || '—'],
        ['Phone',         student.phone  || '—'],
        ['Email',         student.email  || '—'],
      ],
    },
    {
      h: 'Academic',
      rows: [
        ['Level',    student.level],
        ['Semester', `Semester ${student.semester}`],
        ['Year',     student.year],
        ['Enrolled', fmtDate(student.enrolledOn)],
        ['Status',   student.status],
      ],
    },
    {
      h: 'Parent / Guardian',
      rows: [
        ['Name',  student.parentName  || '—'],
        ['Phone', student.parentPhone || '—'],
        ['Email', student.parentEmail || '—'],
      ],
    },
    {
      h: 'Address',
      rows: [['', student.address || 'Not provided']],
    },
  ];

  return (
    <Mdl title="Student Profile" onClose={onClose} wide>
      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(135deg,${T.navy},${T.navyLt})`,
        padding: '20px 22px', color: 'white',
        display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
      }}>
        <Av photo={student.photo} name={student.name} id={student.id} sz={60} r={13} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{student.name}</div>
          <div style={{ fontSize: 13, opacity: .6, marginTop: 1 }}>{student.id} · {student.level}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
            <SBadge s={ps} /><SBadge s={student.status} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {waUrl && (
            <a
              href={waUrl} target="_blank" rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', border: '1px solid rgba(255,255,255,.25)',
                background: 'rgba(255,255,255,.1)', color: 'white',
                borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none',
              }}
            >
              💬 WhatsApp
            </a>
          )}
          <Btn sm onClick={onRegForm} style={{ border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.1)', color: 'white' }}>
            <ClipboardList size={13} />Reg Form
          </Btn>
          <Btn sm onClick={onEdit} style={{ border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.1)', color: 'white' }}>
            <Edit2 size={13} />Edit
          </Btn>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ borderBottom: `1px solid ${T.border}`, display: 'flex', padding: '0 20px' }}>
        <TB t="profile"   l="Profile"   />
        <TB t="payments"  l="Payments"  />
        <TB t="card"      l="ID Card"   />
        {student.notes && <TB t="notes" l="📝 Notes" />}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {profileSections.map(({ h, rows }) => (
            <div key={h} style={{ background: '#F8FAFC', borderRadius: 10, padding: '13px 14px' }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: T.muted,
                textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 9,
              }}>
                {h}
              </div>
              {rows.map(([k, v]) => (
                <div key={k || String(v)} style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: 6, fontSize: 13,
                }}>
                  {k && <span style={{ color: T.muted }}>{k}</span>}
                  <span style={{
                    fontWeight: 500, color: T.text,
                    textAlign: 'right', maxWidth: k ? '64%' : '100%',
                  }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Payments tab */}
      {tab === 'payments' && (
        <PaymentsTab student={student} cfg={cfg} onUpdate={onUpdate} onViewReceipt={onViewReceipt} />
      )}

      {/* ID Card tab */}
      {tab === 'card' && <IDCard student={student} cfg={cfg} />}

      {/* Notes tab */}
      {tab === 'notes' && (
        <div style={{ padding: 20 }}>
          <div style={{
            background: '#FFFBEB', border: `1px solid ${T.amber}`,
            borderRadius: 10, padding: '14px 16px',
            whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: T.text,
          }}>
            {student.notes || 'No notes.'}
          </div>
        </div>
      )}
    </Mdl>
  );
}
