import { useState } from 'react';
import { Check, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { T } from '../constants/index.js';
import { iBase, Inp, Sel, Txta, Btn } from '../components/ui/BaseUI.jsx';

// ── SETTINGS VIEW ─────────────────────────────────────────────────────────────
export function SettingsView({ cfg, setCfg }) {
  const [f, setF] = useState({
    ...cfg,
    fees: [...cfg.fees],
    semDates: [...cfg.semDates],
    regForm: { ...cfg.regForm },
  });
  const [saved, setSaved] = useState(false);

  const u = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const uRf = (k, v) => setF((x) => ({ ...x, regForm: { ...x.regForm, [k]: v } }));
  
  const save = () => {
    setCfg(f);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  
  const updFee = (id, k, v) =>
    setF((x) => ({ ...x, fees: x.fees.map((fe) => fe.id === id ? { ...fe, [k]: v } : fe) }));
    
  const updSem = (i, k, v) =>
    setF((x) => {
      const d = [...x.semDates];
      d[i] = { ...d[i], [k]: v };
      return { ...x, semDates: d };
    });
    
  const addFee = () =>
    setF((x) => ({ ...x, fees: [...x.fees, { id: Date.now(), label: 'New Level', amount: 0 }] }));
    
  const delFee = (id) =>
    setF((x) => ({ ...x, fees: x.fees.filter((fe) => fe.id !== id) }));

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
          <Inp label="Current Year" type="number" value={f.currentYear} onChange={(e) => u('currentYear', Number(e.target.value))} />
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

      <Sec title="Fee Structure">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 36px', gap: 9, marginBottom: 10 }}>
          {['Education Level', 'Fee (RM / sem)', ''].map((h) => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {h}
            </div>
          ))}
        </div>
        {f.fees.map((fe) => (
          <div key={fe.id} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 36px', gap: 9, marginBottom: 8, alignItems: 'center' }}>
            <input value={fe.label} onChange={(e) => updFee(fe.id, 'label', e.target.value)} style={{ ...iBase }} />
            <input type="number" value={fe.amount} onChange={(e) => updFee(fe.id, 'amount', Number(e.target.value))} style={{ ...iBase }} />
            <button
              onClick={() => delFee(fe.id)}
              style={{ padding: 7, border: `1px solid ${T.border}`, borderRadius: 7, cursor: 'pointer', background: 'white', lineHeight: 0 }}
            >
              <Trash2 size={13} color={T.red} />
            </button>
          </div>
        ))}
        <Btn sm v="outline" onClick={addFee}><Plus size={13} />Add Level</Btn>
      </Sec>

      <Sec title="Registration Form Template">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <Inp label="Form Title" value={f.regForm.title} onChange={(e) => uRf('title', e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
            <Inp label="Reg Fee (RM)" type="number" value={f.regForm.regFee} onChange={(e) => uRf('regFee', Number(e.target.value))} />
            <Inp label="Fee Label" value={f.regForm.regFeeLabel} onChange={(e) => uRf('regFeeLabel', e.target.value)} />
          </div>
          <Txta col="1/-1" label="Introduction Paragraph" rows={2} value={f.regForm.intro} onChange={(e) => uRf('intro', e.target.value)} />
          <Txta col="1/-1" label="Terms & Conditions" rows={7} value={f.regForm.terms} onChange={(e) => uRf('terms', e.target.value)} />
          <Txta col="1/-1" label="Declaration Text" rows={3} value={f.regForm.declaration} onChange={(e) => uRf('declaration', e.target.value)} />
        </div>
      </Sec>
    </div>
  );
}
