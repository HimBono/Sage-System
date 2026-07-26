import { Printer } from 'lucide-react';
import { T } from '../../constants/index.js';
import { fmtDate, fmtMoney, inits } from '../../utils/formatters.js';
import { semTotals } from '../../utils/paymentHelpers.js';
import { printDoc } from '../../utils/print.js';
import { Av, Btn } from '../ui/BaseUI.jsx';

// ── RECEIPT DOCUMENT (view + print) ──────────────────────────────────────────
export function ReceiptDoc({ inst, semFee, student, cfg }) {
  const totals    = semTotals(semFee);
  const instIdx   = semFee.installments.findIndex((i) => i.id === inst.id) + 1;
  const instCount = semFee.installments.length;
  const isInstalment = instCount > 1;
  const paidToDate = semFee.installments
    .slice(0, instIdx)
    .reduce((s, i) => s + i.amount, 0);
  const balAfter = Math.max(0, semFee.totalDue - paidToDate);

  // ── Print HTML ──
  const html =
    `<style>*{margin:0;padding:0;box-sizing:border-box}body{color:#1E293B;font-family:system-ui,sans-serif}.hdr{text-align:center;border-bottom:2px solid #0F2240;padding-bottom:16px;margin-bottom:20px}.sn{font-size:20px;font-weight:900;color:#0F2240}.sub{font-size:12px;color:#64748B;margin-top:2px}.tag{font-size:12px;font-weight:700;color:#0EA5E9;letter-spacing:2px;text-transform:uppercase;margin-top:10px}.meta{display:flex;justify-content:space-between;margin-bottom:20px}.ml{font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.05em}.mv{font-size:14px;font-weight:700;margin-top:2px}.box{background:#F8FAFC;border-radius:8px;padding:12px 14px;margin-bottom:16px}.bn{font-size:15px;font-weight:800}.bs{font-size:13px;color:#64748B;margin-top:2px}table{width:100%;border-collapse:collapse}th{background:#F8FAFC;padding:8px 10px;text-align:left;font-size:12px;color:#64748B}td{padding:10px;border-top:1px solid #E2E8F0;font-size:14px}.bal{border:2px dashed #F97316;border-radius:8px;padding:10px 14px;margin:14px 0;display:flex;justify-content:space-between}.stamp{display:inline-block;border:3px solid #10B981;color:#10B981;padding:6px 18px;border-radius:8px;font-size:16px;font-weight:800;transform:rotate(-5deg)}.ft{margin-top:32px;display:flex;justify-content:space-between;font-size:11px;color:#94A3B8}</style>` +
    `<div class="hdr"><div class="sn">${cfg.schoolName}</div><div class="sub">${cfg.address}</div><div class="sub">${cfg.phone} | ${cfg.email}</div><div class="tag">${isInstalment ? `Official Receipt — Instalment ${instIdx} of ${instCount}` : 'Official Receipt'}</div></div>` +
    `<div class="meta"><div><div class="ml">Receipt No.</div><div class="mv">${inst.receiptNo}</div></div><div><div class="ml">Date</div><div class="mv">${fmtDate(inst.date)}</div></div><div><div class="ml">Student ID</div><div class="mv">${student.id}</div></div><div><div class="ml">Method</div><div class="mv">${inst.method || '—'}</div></div></div>` +
    `<div class="box"><div class="bn">${student.name}</div><div class="bs">${student.level} · Semester ${semFee.sem}, ${semFee.year}${inst.note ? ` · ${inst.note}` : ''}</div></div>` +
    `<table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody>` +
    `<tr><td>Tuition Fee — ${student.level} (Sem ${semFee.sem}, ${semFee.year}) — Total: ${fmtMoney(semFee.totalDue)}</td><td style="text-align:right;color:#64748B">${fmtMoney(semFee.totalDue)}</td></tr>` +
    `<tr><td style="font-weight:700">${isInstalment ? `Instalment ${instIdx} of ${instCount}` : 'Amount Paid'}${inst.method ? ` (${inst.method})` : ''}</td><td style="text-align:right;font-weight:900;font-size:18px;border-top:2px solid #0F2240">${fmtMoney(inst.amount)}</td></tr>` +
    `</tbody></table>` +
    (isInstalment
      ? `<div class="bal"><div><span style="font-size:11px;color:#64748B">PAID TO DATE</span><br/><strong>${fmtMoney(paidToDate)}</strong> of ${fmtMoney(semFee.totalDue)}</div><div style="text-align:right"><span style="font-size:11px;color:#64748B">BALANCE REMAINING</span><br/><strong style="color:${balAfter > 0 ? '#F97316' : '#10B981'}">${fmtMoney(balAfter)}</strong></div></div>`
      : '') +
    `<div style="text-align:center;margin:18px 0"><div class="stamp">${balAfter === 0 ? '✓ FULLY PAID' : '✓ RECEIVED'}</div></div>` +
    `<div class="ft"><div>Official receipt — please retain for your records.</div><div>Printed: ${new Date().toLocaleDateString('en-MY')}</div></div>`;

  return (
    <div style={{ padding: 22 }}>
      {/* Preview card */}
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          background: T.navy, color: 'white',
          padding: '16px 22px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{cfg.schoolName}</div>
          <div style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{cfg.address}</div>
          <div style={{ fontSize: 11, opacity: .6 }}>{cfg.phone} · {cfg.email}</div>
          <div style={{
            marginTop: 9, fontSize: 12, fontWeight: 700,
            color: T.sky, letterSpacing: 2, textTransform: 'uppercase',
          }}>
            {isInstalment
              ? `Official Receipt — Instalment ${instIdx} of ${instCount}`
              : 'Official Receipt'}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {/* Meta row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: 16, flexWrap: 'wrap', gap: 10,
          }}>
            {[
              ['Receipt No.', inst.receiptNo],
              ['Date',        fmtDate(inst.date)],
              ['Student ID',  student.id],
              ['Method',      inst.method || '—'],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{
                  fontSize: 11, color: T.muted,
                  textTransform: 'uppercase', letterSpacing: '.05em',
                }}>
                  {l}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Student info */}
          <div style={{
            background: '#F8FAFC', borderRadius: 8,
            padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{student.name}</div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>
              {student.level} · Semester {semFee.sem}, {semFee.year}
              {inst.note ? ` · ${inst.note}` : ''}
            </div>
          </div>

          {/* Line items */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left',  fontSize: 12, fontWeight: 600, color: T.muted }}>Description</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: T.muted }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', borderTop: `1px solid ${T.border}`, fontSize: 14 }}>
                  Tuition Fee — {student.level} (Sem {semFee.sem}, {semFee.year})
                </td>
                <td style={{ padding: '10px', borderTop: `1px solid ${T.border}`, textAlign: 'right', fontSize: 12, color: T.muted }}>
                  {fmtMoney(semFee.totalDue)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 10px 0', borderTop: `2px solid ${T.navy}`, fontWeight: 700, fontSize: 14 }}>
                  {isInstalment ? `Instalment ${instIdx} of ${instCount}` : 'Amount Paid'}
                  {inst.method ? ` · ${inst.method}` : ''}
                </td>
                <td style={{ padding: '10px 10px 0', borderTop: `2px solid ${T.navy}`, textAlign: 'right', fontWeight: 900, fontSize: 18, color: T.navy }}>
                  {fmtMoney(inst.amount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Instalment progress */}
          {isInstalment && (
            <div style={{
              border: `2px dashed ${T.orange}`, borderRadius: 8,
              padding: '10px 14px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
            }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Paid to Date
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {fmtMoney(paidToDate)}
                  <span style={{ fontSize: 12, color: T.muted }}> / {fmtMoney(semFee.totalDue)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Balance</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: balAfter > 0 ? T.orange : T.green }}>
                  {fmtMoney(balAfter)}
                </div>
              </div>
            </div>
          )}

          {/* Stamp */}
          <div style={{ textAlign: 'center', margin: '14px 0' }}>
            <span style={{
              display: 'inline-block',
              border: `3px solid ${balAfter === 0 ? T.green : T.sky}`,
              color: balAfter === 0 ? T.green : T.sky,
              padding: '5px 18px', borderRadius: 8,
              fontSize: 15, fontWeight: 800, transform: 'rotate(-5deg)',
            }}>
              {balAfter === 0 ? '✓ FULLY PAID' : '✓ RECEIVED'}
            </span>
          </div>

          <div style={{ fontSize: 11, color: T.muted, textAlign: 'center' }}>
            Official receipt — please retain for your records.
          </div>
        </div>
      </div>

      {/* Print button */}
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <Btn onClick={() => printDoc(html, `Receipt ${inst.receiptNo}`)}>
          <Printer size={14} />Print Receipt
        </Btn>
      </div>
    </div>
  );
}
