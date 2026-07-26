import { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { T, LEVELS, STATUSES } from '../../constants/index.js';
import { iBase, Inp, Sel, Txta, Btn, Av, Mdl } from '../ui/BaseUI.jsx';
import { genId, today } from '../../utils/formatters.js';

// ── BLANK STUDENT TEMPLATE ────────────────────────────────────────────────────
const BLANK = {
  name: '', ic: '', dob: '', gender: 'Male', phone: '', email: '',
  photo: null, level: 'Secondary 1', semester: 2, year: 2026,
  enrolledOn: today(), status: 'active', discount: 'None',
  parentName: '', parentPhone: '', parentEmail: '',
  address: '', notes: '', semFees: [],
};

// ── STUDENT FORM (inside a Modal) ─────────────────────────────────────────────
export function StudentFormModal({ student, onSave, onClose, cfg, allStudents }) {
  const isEdit = !!student?.id;
  const [f, setF] = useState(
    student
      ? { ...student, notes: student.notes || '' }
      : { ...BLANK, semester: cfg.currentSemester, year: cfg.currentYear },
  );
  const [tab, setTab]       = useState('personal');
  const [icWarn, setIcWarn] = useState('');

  const u = (k, v) => setF((prev) => ({ ...prev, [k]: v }));
  const g = (k)   => f[k] ?? '';
  const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' };

  const TB = ({ t, l }) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '8px 14px', border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: 13,
        borderBottom: tab === t ? `2px solid ${T.sky}` : '2px solid transparent',
        color: tab === t ? T.sky : T.muted, background: 'none',
      }}
    >
      {l}
    </button>
  );

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => u('photo', ev.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!f.name || !f.level) return;
    if (f.ic && allStudents) {
      const dup = (allStudents || []).find((s) => s.ic === f.ic && s.id !== f.id);
      if (dup) {
        setIcWarn(`IC already registered to ${dup.name} (${dup.id})`);
        setTab('personal');
        return;
      }
    }
    onSave(isEdit ? f : { ...f, id: genId('STU') });
  };

  return (
    <Mdl title={isEdit ? `Edit: ${student.name}` : 'Register New Student'} onClose={onClose} wide>
      {/* Tab bar */}
      <div style={{
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', padding: '0 18px', gap: 2, flexShrink: 0,
      }}>
        <TB t="personal" l="Personal" />
        <TB t="academic" l="Academic" />
        <TB t="parent"   l="Parent"   />
        <TB t="notes"    l="Notes"    />
      </div>

      <div style={{ padding: 20 }}>
        {/* ── Personal tab ── */}
        {tab === 'personal' && (
          <div style={grid}>
            <Inp col="1/-1" label="Full Name *" value={g('name')}
              onChange={(e) => u('name', e.target.value)} placeholder="As per IC / passport" />

            {/* IC with duplicate warning */}
            <div style={{ gridColumn: '1/-1', marginBottom: 12 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700, color: T.muted,
                marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em',
              }}>
                IC / Passport No.
              </label>
              <input
                value={g('ic')}
                onChange={(e) => { u('ic', e.target.value); setIcWarn(''); }}
                placeholder="000000-00-0000"
                style={{ ...iBase, borderColor: icWarn ? T.red : T.border }}
              />
              {icWarn && <div style={{ fontSize: 12, color: T.red, marginTop: 4 }}>⚠ {icWarn}</div>}
            </div>

            <Inp label="Date of Birth" type="date"  value={g('dob')}   onChange={(e) => u('dob', e.target.value)} />
            <Sel label="Gender" value={g('gender')} onChange={(e) => u('gender', e.target.value)}>
              <option>Male</option><option>Female</option>
            </Sel>
            <Sel label="Status" value={g('status')} onChange={(e) => u('status', e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </Sel>
            <Inp label="Phone" value={g('phone')} onChange={(e) => u('phone', e.target.value)} placeholder="01X-XXX XXXX" />
            <Inp label="Email" type="email" value={g('email')} onChange={(e) => u('email', e.target.value)} placeholder="student@email.com" />
            <Txta col="1/-1" label="Address" value={g('address')} onChange={(e) => u('address', e.target.value)} placeholder="Full home address" />

            {/* Photo upload */}
            <div style={{ gridColumn: '1/-1', marginBottom: 8 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700, color: T.muted,
                marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em',
              }}>
                Student Photo
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Av photo={g('photo')} name={g('name') || '?'} id={g('id')} sz={60} r={10} />
                <div>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 11px', border: `1px solid ${T.border}`,
                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', background: 'white', color: T.text,
                  }}>
                    📷 Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                  </label>
                  {g('photo') && (
                    <button
                      onClick={() => u('photo', null)}
                      style={{
                        marginLeft: 8, padding: '5px 11px',
                        border: `1px solid ${T.border}`, borderRadius: 8,
                        fontSize: 12, cursor: 'pointer', background: 'white',
                        color: T.red, fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  )}
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                    Shown on ID card and profile. JPG or PNG.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Academic tab ── */}
        {tab === 'academic' && (
          <div style={grid}>
            <Sel col="1/-1" label="Education Level *" value={g('level')} onChange={(e) => u('level', e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </Sel>
            <Sel label="Current Semester" value={g('semester')} onChange={(e) => u('semester', Number(e.target.value))}>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </Sel>
            <Inp label="Academic Year" type="number" value={g('year')} onChange={(e) => u('year', Number(e.target.value))} />
            <Inp col="1/-1" label="Enrollment Date" type="date" value={g('enrolledOn')} onChange={(e) => u('enrolledOn', e.target.value)} />
            <Sel col="1/-1" label="Sibling Discount" value={g('discount')} onChange={(e) => u('discount', e.target.value)}>
              <option value="None">None</option>
              <option value="2nd Sibling (15%)">2nd Sibling (15% discount)</option>
              <option value="3rd Sibling (25%)">3rd Sibling (25% discount)</option>
            </Sel>
          </div>
        )}

        {/* ── Parent tab ── */}
        {tab === 'parent' && (
          <div style={grid}>
            <Inp col="1/-1" label="Parent / Guardian Name" value={g('parentName')} onChange={(e) => u('parentName', e.target.value)} />
            <Inp label="Parent Phone" value={g('parentPhone')} onChange={(e) => u('parentPhone', e.target.value)} placeholder="01X-XXX XXXX" />
            <Inp label="Parent Email" type="email" value={g('parentEmail')} onChange={(e) => u('parentEmail', e.target.value)} placeholder="parent@email.com" />
          </div>
        )}

        {/* ── Notes tab ── */}
        {tab === 'notes' && (
          <div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>
              Internal admin notes — not printed on any document.
            </div>
            <Txta
              label="Notes" rows={7} value={g('notes')}
              onChange={(e) => u('notes', e.target.value)}
              placeholder="Medical conditions, special arrangements, sibling info, admin flags…"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px', borderTop: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
      }}>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>
          <UserCheck size={14} />{isEdit ? 'Save Changes' : 'Register Student'}
        </Btn>
      </div>
    </Mdl>
  );
}
