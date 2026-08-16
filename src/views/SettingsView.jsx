import { useState } from 'react';
import { Check, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { T } from '../constants/index.js';
import { iBase, Inp, Sel, Txta, Btn, NumInp } from '../components/ui/BaseUI.jsx';

// ── SETTINGS VIEW ─────────────────────────────────────────────────────────────
export function SettingsView({ cfg = {}, setCfg, onResetData, cloudStatus, onManualSync }) {
  const [f, setF] = useState(() => ({
    schoolName: cfg?.schoolName || 'SAGE School',
    address: cfg?.address || '',
    phone: cfg?.phone || '',
    email: cfg?.email || '',
    currentSemester: cfg?.currentSemester || 2,
    currentYear: cfg?.currentYear || 2026,
    fees: Array.isArray(cfg?.fees) && cfg.fees.length > 0 ? [...cfg.fees] : [
      { id: 1, label: 'Kg 1', amount: 1500 },
      { id: 2, label: 'Kg 2', amount: 1560 },
      { id: 3, label: 'Level 1', amount: 1620 },
      { id: 4, label: 'Level 2', amount: 1680 },
      { id: 5, label: 'Level 3', amount: 1740 },
      { id: 6, label: 'Level 4', amount: 1800 },
    ],
    semDates: Array.isArray(cfg?.semDates) && cfg.semDates.length > 0 ? [...cfg.semDates] : [
      { sem: 1, start: '2026-01-05', end: '2026-06-26' },
      { sem: 2, start: '2026-07-06', end: '2026-12-18' },
    ],
    regForm: {
      title: 'STUDENT REGISTRATION FORM',
      regFee: 50,
      regFeeLabel: 'Registration Fee (One-off)',
      intro: 'Please complete all sections in BLOCK LETTERS. Return the completed form with required documents.',
      terms: '1. Fees must be paid on or before the due date.\n2. Fees paid are non-refundable.\n3. The school reserves the right to suspend students with outstanding arrears.\n4. Parents must notify the school of any changes in contact details.',
      declaration: 'I hereby declare that the information provided is true and accurate. I agree to abide by the school rules and regulations.',
      ...(cfg?.regForm || {}),
    },
  }));
  const [saved, setSaved] = useState(false);

  const u = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const uRf = (k, v) => setF((x) => ({ ...x, regForm: { ...x.regForm, [k]: v } }));
  
  const save = () => {
    setCfg(f);
    setSaved(true);
    if (onManualSync) onManualSync();
    setTimeout(() => setSaved(false), 2500);
  };
  
  const updFee = (id, k, v) =>
    setF((x) => ({ ...x, fees: (x.fees || []).map((fe) => fe.id === id ? { ...fe, [k]: v } : fe) }));
    
  const updSem = (i, k, v) =>
    setF((x) => {
      const d = [...(x.semDates || [])];
      d[i] = { ...d[i], [k]: v };
      return { ...x, semDates: d };
    });
    
  const addFee = () =>
    setF((x) => ({ ...x, fees: [...(x.fees || []), { id: Date.now(), label: 'New Level', amount: 1500 }] }));
    
  const delFee = (id) =>
    setF((x) => ({ ...x, fees: (x.fees || []).filter((fe) => fe.id !== id) }));

  const Sec = ({ title, children }) => (
    <div style={{ background: 'white', borderRadius: 12, boxShadow: T.shadow, marginBottom: 16 }}>
      <div style={{ padding: '13px 20px', borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 14, color: T.text }}>
        {title}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: '3px 0 0' }}>Configure the school administration system</p>
        </div>
        <Btn v={saved ? 'green' : 'sky'} onClick={save}>
          {saved ? <><CheckCircle size={14} />Saved!</> : <><Check size={14} />Save All Changes</>}
        </Btn>
      </div>

      <Sec title="School Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <Inp col="1/-1" label="School Name" value={f.schoolName} onChange={(e) => u('schoolName', e.target.value)} />
          <Inp col="1/-1" label="Address" value={f.address} onChange={(e) => u('address', e.target.value)} />
          <Inp label="Phone" value={f.phone} onChange={(e) => u('phone', e.target.value)} />
          <Inp label="Email" value={f.email} onChange={(e) => u('email', e.target.value)} />
        </div>
      </Sec>

      <Sec title="Academic Calendar">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', marginBottom: 18 }}>
          <Sel label="Current Semester" value={f.currentSemester} onChange={(e) => u('currentSemester', Number(e.target.value))}>
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </Sel>
          <NumInp
            label="Current Year"
            value={f.currentYear}
            onChange={(e) => u('currentYear', Number(e.target.value))}
            min={2020}
            max={2035}
            step={1}
            quickSteps={[2025, 2026, 2027]}
          />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
          Semester Date Ranges
        </div>
        {f.semDates.map((sd, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: '0 10px', alignItems: 'end', marginBottom: 4 }}>
            <div style={{ padding: '8px 10px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, color: T.muted, marginBottom: 12 }}>
              Sem {sd.sem}
            </div>
            <Inp label={i === 0 ? 'Start' : undefined} type="date" value={sd.start} onChange={(e) => updSem(i, 'start', e.target.value)} />
            <Inp label={i === 0 ? 'End' : undefined} type="date" value={sd.end} onChange={(e) => updSem(i, 'end', e.target.value)} />
          </div>
        ))}
      </Sec>

      <Sec title="Fee Structure (Standards: RM 250 – 300 / month)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 110px 36px', gap: 9, marginBottom: 10 }}>
          {['Education Level', 'Fee (RM / sem)', 'Monthly Rate', ''].map((h) => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {h}
            </div>
          ))}
        </div>
        {f.fees.map((fe) => {
          const monthly = Math.round((Number(fe.amount || 0) / 6) * 100) / 100;
          return (
            <div key={fe.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 110px 36px', gap: 9, marginBottom: 8, alignItems: 'center' }}>
              <input value={fe.label} onChange={(e) => updFee(fe.id, 'label', e.target.value)} style={{ ...iBase }} />
              <input type="number" value={fe.amount} onChange={(e) => updFee(fe.id, 'amount', Number(e.target.value))} style={{ ...iBase }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: T.sky, padding: '7px 8px', background: '#F0F9FF', borderRadius: 7, textAlign: 'center' }}>
                RM {monthly}/mo
              </div>
              <button
                onClick={() => delFee(fe.id)}
                style={{ padding: 7, border: `1px solid ${T.border}`, borderRadius: 7, cursor: 'pointer', background: 'white', lineHeight: 0 }}
              >
                <Trash2 size={13} color={T.red} />
              </button>
            </div>
          );
        })}
        <Btn sm v="outline" onClick={addFee}><Plus size={13} />Add Level</Btn>
      </Sec>

      <Sec title="Registration Form Template">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <Inp label="Form Title" value={f.regForm.title} onChange={(e) => uRf('title', e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
            <NumInp
              label="Reg Fee"
              prefix="RM"
              step={20}
              value={f.regForm.regFee}
              onChange={(e) => uRf('regFee', Number(e.target.value))}
            />
            <Inp label="Fee Label" value={f.regForm.regFeeLabel} onChange={(e) => uRf('regFeeLabel', e.target.value)} />
          </div>
          <Txta col="1/-1" label="Introduction Paragraph" rows={2} value={f.regForm.intro} onChange={(e) => uRf('intro', e.target.value)} />
          <Txta col="1/-1" label="Terms & Conditions" rows={7} value={f.regForm.terms} onChange={(e) => uRf('terms', e.target.value)} />
          <Txta col="1/-1" label="Declaration Text" rows={3} value={f.regForm.declaration} onChange={(e) => uRf('declaration', e.target.value)} />
        </div>
      </Sec>

      {/* Cloud Sync & Database Status */}
      <Sec title="☁️ Cloud Database & Multi-Device Sync">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                Connection Status:
                {cloudStatus === 'synced' && <span style={{ color: '#059669' }}>🟢 Connected & Active (Syncing all devices)</span>}
                {cloudStatus === 'syncing' && <span style={{ color: '#0284C7' }}>🔄 Syncing with Cloud…</span>}
                {cloudStatus === 'unconfigured' && <span style={{ color: '#D97706' }}>🟡 Local Mode (Connect Vercel KV / Upstash Redis)</span>}
                {cloudStatus === 'error' && <span style={{ color: '#DC2626' }}>🔴 Sync Disconnected</span>}
              </div>
              <p style={{ fontSize: 13, color: T.muted, margin: '4px 0 0' }}>
                {cloudStatus === 'synced'
                  ? 'All changes made on this device automatically sync to your other laptops and mobile phones in real time.'
                  : 'Currently storing data locally. Connect Vercel Storage (Upstash Redis) to sync across all your devices.'}
              </p>
            </div>
            {onManualSync && (
              <Btn sm v="sky" onClick={onManualSync}>
                🔄 Sync Now
              </Btn>
            )}
          </div>

          {cloudStatus === 'unconfigured' && (
            <div style={{
              background: '#FFFBEB', border: '1px solid #FDE68A',
              borderRadius: 8, padding: 14, marginTop: 6,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E', marginBottom: 6 }}>
                💡 How to enable Multi-Device Sync in 2 steps (Free):
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>
                <li>Go to your project in the <strong>Vercel Dashboard</strong>.</li>
                <li>Click the <strong>Storage</strong> tab → Click <strong>Create Database</strong> → Select <strong>KV / Upstash Redis</strong> (Free).</li>
                <li>Redeploy your app or click <strong>Sync Now</strong>. Your data will now automatically sync across all your phones, laptops, and admins!</li>
              </ol>
            </div>
          )}
        </div>
      </Sec>

      {onResetData && (
        <Sec title="Data & Storage Management">
          <p style={{ fontSize: 13, color: T.muted, margin: '0 0 14px' }}>
            Wipe all records and restore original demo data if needed.
          </p>
          <Btn v="danger" onClick={onResetData}>
            <Trash2 size={14} /> Reset All Data to Defaults
          </Btn>
        </Sec>
      )}
    </div>
  );
}
