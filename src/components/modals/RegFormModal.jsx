import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Printer } from 'lucide-react';
import { T } from '../../constants/index.js';
import { fmtDate } from '../../utils/formatters.js';
import { printDoc } from '../../utils/print.js';
import { Mdl, Inp, Sel, Txta, Btn } from '../ui/BaseUI.jsx';

// ── REGISTRATION FORM MODAL ───────────────────────────────────────────────────
export function RegFormModal({ student, cfg, onClose, onSaveCfg }) {
  const [rf, setRf]       = useState({ ...cfg.regForm });
  const [prefill, setPrefill] = useState(!!student);
  const [editing, setEditing] = useState(false);
  const s   = student;
  const upd = (k, v) => setRf((x) => ({ ...x, [k]: v }));

  const printHtml =
    `<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman',serif;color:#1E293B;font-size:13px}.pg{max-width:680px;margin:0 auto}.hdr{text-align:center;border-bottom:2px solid #0F2240;padding-bottom:14px;margin-bottom:18px}.sn{font-size:18px;font-weight:900;color:#0F2240}.sub{font-size:11px;color:#64748B;margin-top:2px}.ftitle{font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:10px;color:#0F2240}.sh{font-size:10px;font-weight:800;color:#0F2240;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #0F2240;padding-bottom:3px;margin:16px 0 10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}.field{margin-bottom:8px}.fl{font-size:10px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px}.fv{border-bottom:1px solid #94A3B8;padding-bottom:2px;font-size:13px;min-height:20px}.feerow{display:flex;justify-content:space-between;border:1px solid #E2E8F0;padding:8px 12px;border-radius:4px}.terms{font-size:11px;line-height:1.8;white-space:pre-line;color:#374151}.sigrow{display:grid;grid-template-columns:1fr 40px 1fr;gap:0 20px;align-items:flex-end;margin-top:24px}.sigline{border-bottom:1.5px solid #1E293B;min-height:30px;margin-bottom:3px}.siglabel{font-size:10px;color:#64748B;text-align:center}.office{background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:4px;padding:12px;margin-top:20px}.offh{font-size:10px;font-weight:700;text-transform:uppercase;color:#64748B;margin-bottom:10px}@media print{@page{size:A4;margin:18mm}}</style>` +
    `<div class="pg"><div class="hdr"><div class="sn">${cfg.schoolName}</div><div class="sub">${cfg.address} | ${cfg.phone} | ${cfg.email}</div><div class="ftitle">${rf.title}</div></div>` +
    `<p style="font-size:11px;color:#64748B;margin-bottom:14px">${rf.intro}</p>` +
    `<div class="sh">Section A — Student Particulars</div><div class="grid">` +
    `<div class="field" style="grid-column:1/-1"><div class="fl">Full Name (as per IC / Passport)</div><div class="fv">${prefill && s?.name ? s.name : ''}</div></div>` +
    `<div class="field"><div class="fl">IC / Passport No.</div><div class="fv">${prefill && s?.ic ? s.ic : ''}</div></div>` +
    `<div class="field"><div class="fl">Date of Birth</div><div class="fv">${prefill && s?.dob ? fmtDate(s.dob) : ''}</div></div>` +
    `<div class="field"><div class="fl">Gender</div><div class="fv">${prefill && s?.gender ? s.gender : ''}</div></div>` +
    `<div class="field"><div class="fl">Level Applying For</div><div class="fv">${prefill && s?.level ? s.level : ''}</div></div>` +
    `<div class="field" style="grid-column:1/-1"><div class="fl">Home Address</div><div class="fv" style="min-height:36px">${prefill && s?.address ? s.address : ''}</div></div>` +
    `</div><div class="sh">Section B — Parent / Guardian Particulars</div><div class="grid">` +
    `<div class="field" style="grid-column:1/-1"><div class="fl">Parent / Guardian Full Name</div><div class="fv">${prefill && s?.parentName ? s.parentName : ''}</div></div>` +
    `<div class="field"><div class="fl">Relationship to Student</div><div class="fv"></div></div>` +
    `<div class="field"><div class="fl">IC / Passport No.</div><div class="fv"></div></div>` +
    `<div class="field"><div class="fl">Phone Number</div><div class="fv">${prefill && s?.parentPhone ? s.parentPhone : ''}</div></div>` +
    `<div class="field"><div class="fl">Email Address</div><div class="fv">${prefill && s?.parentEmail ? s.parentEmail : ''}</div></div>` +
    `</div><div class="sh">Section C — Registration Fee</div>` +
    `<div class="feerow"><span>${rf.regFeeLabel}</span><strong>RM ${parseFloat(rf.regFee).toFixed(2)}</strong></div>` +
    `<p style="font-size:11px;color:#64748B;margin-top:6px">Tuition fees are as per the school's current fee schedule available at the front office.</p>` +
    `<div class="sh">Section D — Terms &amp; Conditions</div><div class="terms">${rf.terms.replace(/</g, '&lt;')}</div>` +
    `<div class="sh">Declaration</div>` +
    `<p style="font-size:11px;line-height:1.7;color:#374151;margin-bottom:20px">${rf.declaration.replace(/</g, '&lt;')}</p>` +
    `<div class="sigrow"><div><div class="sigline"></div><div class="siglabel">Parent / Guardian Signature</div></div><div style="text-align:center;color:#94A3B8;padding-bottom:6px">·</div><div><div class="sigline"></div><div class="siglabel">Date</div></div></div>` +
    `<div class="office"><div class="offh">For Office Use Only</div><div class="grid">` +
    `<div class="field"><div class="fl">Registration No.</div><div class="fv">${prefill && s?.id ? s.id : ''}</div></div>` +
    `<div class="field"><div class="fl">Date Received</div><div class="fv"></div></div>` +
    `<div class="field"><div class="fl">Processed By</div><div class="fv"></div></div>` +
    `<div class="field"><div class="fl">Approved By</div><div class="fv"></div></div>` +
    `</div></div></div>`;

  const sections = [
    {
      h: 'Section A — Student Particulars',
      fields: [
        { l: 'Full Name (as per IC / Passport)', v: s?.name, full: true },
        { l: 'IC / Passport No.', v: s?.ic },
        { l: 'Date of Birth', v: fmtDate(s?.dob) },
        { l: 'Gender', v: s?.gender },
        { l: 'Level Applying For', v: s?.level },
        { l: 'Home Address', v: s?.address, full: true },
      ],
    },
    {
      h: 'Section B — Parent / Guardian Particulars',
      fields: [
        { l: 'Parent / Guardian Full Name', v: s?.parentName, full: true },
        { l: 'Relationship to Student', v: '' },
        { l: 'IC / Passport No.', v: '' },
        { l: 'Phone Number', v: s?.parentPhone },
        { l: 'Email Address', v: s?.parentEmail },
      ],
    },
  ];

  return (
    <Mdl
      title={student ? `Reg Form — ${student.name}` : 'Blank Registration Form'}
      onClose={onClose}
      extraWide
    >
      {/* Toolbar */}
      <div style={{
        padding: '10px 18px', borderBottom: `1px solid ${T.border}`,
        display: 'flex', gap: 10, alignItems: 'center',
        background: '#F8FAFC', flexShrink: 0,
      }}>
        {student && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: T.text }}>
            <input
              type="checkbox" checked={prefill}
              onChange={(e) => setPrefill(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Pre-fill student data
          </label>
        )}
        <div style={{ flex: 1 }} />
        <Btn sm v="outline" onClick={() => setEditing((x) => !x)}>
          {editing
            ? <><ChevronDown size={13} />Hide Editor</>
            : <><ChevronRight size={13} />Edit Content</>}
        </Btn>
        <Btn sm v="outline" onClick={() => onSaveCfg({ ...cfg, regForm: rf })}>
          <Check size={13} />Save as Default
        </Btn>
        <Btn sm onClick={() => printDoc(printHtml, `Registration Form${s ? ` — ${s.name}` : ''}`)}>
          <Printer size={13} />Print Form
        </Btn>
      </div>

      {/* Inline editor */}
      {editing && (
        <div style={{
          padding: '16px 22px', borderBottom: `1px solid ${T.border}`,
          background: '#F0F9FF',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.sky,
            marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em',
          }}>
            Form Content Editor
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Inp label="Form Title" value={rf.title} onChange={(e) => upd('title', e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
              <Inp label="Reg Fee (RM)" type="number" value={rf.regFee} onChange={(e) => upd('regFee', Number(e.target.value))} />
              <Inp label="Fee Label" value={rf.regFeeLabel} onChange={(e) => upd('regFeeLabel', e.target.value)} />
            </div>
            <Txta col="1/-1" label="Introduction Text" rows={2} value={rf.intro} onChange={(e) => upd('intro', e.target.value)} />
            <Txta col="1/-1" label="Terms & Conditions" rows={6} value={rf.terms} onChange={(e) => upd('terms', e.target.value)} />
            <Txta col="1/-1" label="Declaration" rows={3} value={rf.declaration} onChange={(e) => upd('declaration', e.target.value)} />
          </div>
        </div>
      )}

      {/* Form preview */}
      <div style={{ padding: 22 }}>
        <div style={{
          textAlign: 'center', borderBottom: `2px solid ${T.navy}`,
          paddingBottom: 14, marginBottom: 18,
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.navy }}>{cfg.schoolName}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            {cfg.address} | {cfg.phone} | {cfg.email}
          </div>
          <div style={{
            fontSize: 14, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', marginTop: 10, color: T.navy,
          }}>
            {rf.title}
          </div>
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 14, lineHeight: 1.5 }}>{rf.intro}</div>

        {sections.map((sec) => (
          <div key={sec.h}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: T.navy,
              textTransform: 'uppercase', letterSpacing: '.1em',
              borderBottom: `2px solid ${T.navy}`, paddingBottom: 4,
              marginBottom: 12, marginTop: 18,
            }}>
              {sec.h}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
              {sec.fields.map(({ l, v, full }) => (
                <div key={l} style={{ gridColumn: full ? '1/-1' : undefined, marginBottom: 8 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: T.muted,
                    textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2,
                  }}>
                    {l}
                  </div>
                  <div style={{
                    borderBottom: `1.5px solid ${prefill && v ? T.text : '#CBD5E1'}`,
                    paddingBottom: 3, fontSize: 13, minHeight: 22,
                    color: T.text, fontWeight: prefill && v ? 500 : 400,
                  }}>
                    {prefill ? v || '' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Section C */}
        <div style={{
          fontSize: 11, fontWeight: 800, color: T.navy,
          textTransform: 'uppercase', letterSpacing: '.1em',
          borderBottom: `2px solid ${T.navy}`, paddingBottom: 4,
          marginBottom: 12, marginTop: 18,
        }}>
          Section C — Registration Fee
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          border: `1px solid ${T.border}`, padding: '10px 14px',
          borderRadius: 8, marginBottom: 6,
        }}>
          <span style={{ fontSize: 13 }}>{rf.regFeeLabel}</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: T.navy }}>
            RM {parseFloat(rf.regFee).toFixed(2)}
          </span>
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>
          Tuition fees are as per the school's current fee schedule available at the front office.
        </div>

        {/* Section D */}
        <div style={{
          fontSize: 11, fontWeight: 800, color: T.navy,
          textTransform: 'uppercase', letterSpacing: '.1em',
          borderBottom: `2px solid ${T.navy}`, paddingBottom: 4,
          marginBottom: 12, marginTop: 18,
        }}>
          Section D — Terms & Conditions
        </div>
        <div style={{
          fontSize: 11, color: T.text, lineHeight: 1.8,
          whiteSpace: 'pre-line', padding: '10px 14px',
          background: '#F8FAFC', borderRadius: 8,
        }}>
          {rf.terms}
        </div>

        {/* Declaration */}
        <div style={{
          fontSize: 11, fontWeight: 800, color: T.navy,
          textTransform: 'uppercase', letterSpacing: '.1em',
          borderBottom: `2px solid ${T.navy}`, paddingBottom: 4,
          marginBottom: 12, marginTop: 18,
        }}>
          Declaration
        </div>
        <div style={{ fontSize: 11, color: T.text, lineHeight: 1.7, marginBottom: 24 }}>
          {rf.declaration}
        </div>

        {/* Signature row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 40px 1fr',
          gap: '0 20px', alignItems: 'flex-end', marginBottom: 20,
        }}>
          <div>
            <div style={{ borderBottom: `1.5px solid ${T.text}`, minHeight: 32, marginBottom: 4 }} />
            <div style={{ fontSize: 10, color: T.muted, textAlign: 'center' }}>Parent / Guardian Signature</div>
          </div>
          <div style={{ textAlign: 'center', color: T.muted, paddingBottom: 6 }}>·</div>
          <div>
            <div style={{ borderBottom: `1.5px solid ${T.text}`, minHeight: 32, marginBottom: 4 }} />
            <div style={{ fontSize: 10, color: T.muted, textAlign: 'center' }}>Date</div>
          </div>
        </div>

        {/* Office use only */}
        <div style={{
          background: '#F8FAFC', border: `1px dashed ${T.border}`,
          borderRadius: 8, padding: 14,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: T.muted,
            textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10,
          }}>
            For Office Use Only
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
            {[
              { l: 'Registration No.', v: s?.id },
              { l: 'Date Received',    v: '' },
              { l: 'Processed By',     v: '' },
              { l: 'Approved By',      v: '' },
            ].map(({ l, v }) => (
              <div key={l} style={{ marginBottom: 8 }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: T.muted,
                  textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2,
                }}>
                  {l}
                </div>
                <div style={{
                  borderBottom: '1px solid #CBD5E1',
                  paddingBottom: 3, fontSize: 13, minHeight: 20,
                }}>
                  {prefill ? v || '' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Mdl>
  );
}
