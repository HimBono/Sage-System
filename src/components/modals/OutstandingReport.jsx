import { Printer } from 'lucide-react';
import { T } from '../../constants/index.js';
import { fmtMoney } from '../../utils/formatters.js';
import {
  semFeeOf, semTotals, payStatus, suggestFeeAmt, isArchived,
} from '../../utils/paymentHelpers.js';
import { printDoc } from '../../utils/print.js';
import { Mdl, SBadge, Btn, Th, Td } from '../ui/BaseUI.jsx';

// ── OUTSTANDING FEES REPORT ───────────────────────────────────────────────────
export function OutstandingReport({ students, cfg, onClose }) {
  const rows = students
    .filter((s) => !isArchived(s) && payStatus(s, cfg) !== 'paid')
    .map((s) => {
      const sf = semFeeOf(s, cfg);
      const t  = semTotals(sf);
      return { s, sf, t, ps: payStatus(s, cfg) };
    })
    .sort((a, b) => b.t.balance - a.t.balance);

  const totalBal = rows.reduce(
    (sum, r) => sum + (r.t.balance || suggestFeeAmt(r.s.level, cfg.fees, r.s.discount)),
    0,
  );

  const html =
    `<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;color:#1E293B;font-size:13px;margin:24px}.hdr{border-bottom:2px solid #0F2240;padding-bottom:12px;margin-bottom:16px}.sn{font-size:18px;font-weight:900;color:#0F2240}.sub{font-size:11px;color:#64748B;margin-top:2px}.rpt{font-size:12px;font-weight:700;color:#F97316;letter-spacing:1px;margin-top:6px}table{width:100%;border-collapse:collapse;margin-top:10px}th{background:#F8FAFC;padding:8px 10px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase;border-bottom:2px solid #E2E8F0}td{padding:8px 10px;border-top:1px solid #E2E8F0;font-size:12px}.ft td{font-weight:700;border-top:2px solid #0F2240;background:#F8FAFC}@media print{@page{size:A4;margin:15mm}}</style>` +
    `<div class="hdr"><div class="sn">${cfg.schoolName}</div><div class="sub">${cfg.address} | Generated: ${new Date().toLocaleDateString('en-MY')}</div><div class="rpt">OUTSTANDING FEES — SEMESTER ${cfg.currentSemester}, ${cfg.currentYear}</div></div>` +
    `<table><thead><tr><th>#</th><th>Student</th><th>Level</th><th>Parent / Phone</th><th>Status</th><th style="text-align:right">Due</th><th style="text-align:right">Paid</th><th style="text-align:right">Balance</th></tr></thead><tbody>` +
    rows.map((r, i) =>
      `<tr><td>${i + 1}</td><td><strong>${r.s.name}</strong><br/><span style="color:#64748B">${r.s.id}</span></td><td>${r.s.level}</td><td>${r.s.parentName || '—'}<br/><span style="color:#64748B">${r.s.parentPhone || '—'}</span></td><td>${r.ps === 'partial' ? 'Partial' : 'Unpaid'}</td><td style="text-align:right">${fmtMoney(r.sf ? r.t.due : suggestFeeAmt(r.s.level, cfg.fees, r.s.discount))}</td><td style="text-align:right;color:#10B981">${fmtMoney(r.t.paid)}</td><td style="text-align:right;font-weight:700;color:${r.ps === 'partial' ? '#F97316' : '#EF4444'}">${fmtMoney(r.t.balance || suggestFeeAmt(r.s.level, cfg.fees, r.s.discount))}</td></tr>`,
    ).join('') +
    `</tbody><tfoot><tr class="ft"><td colspan="7" style="text-align:right">Total Outstanding</td><td style="text-align:right;color:#EF4444">${fmtMoney(totalBal)}</td></tr></tfoot></table>`;

  return (
    <Mdl title="Outstanding Fees Report" onClose={onClose} extraWide>
      {/* Toolbar */}
      <div style={{
        padding: '10px 18px', borderBottom: `1px solid ${T.border}`,
        display: 'flex', gap: 10, alignItems: 'center',
        background: '#F8FAFC', flexShrink: 0,
      }}>
        <div style={{ fontSize: 13, color: T.muted }}>
          {rows.length} student{rows.length !== 1 ? 's' : ''} outstanding ·{' '}
          <strong style={{ color: T.red }}>{fmtMoney(totalBal)}</strong> total
        </div>
        <div style={{ flex: 1 }} />
        <Btn sm onClick={() => printDoc(html, 'Outstanding Fees Report')}>
          <Printer size={13} />Print Report
        </Btn>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th c="#" />
              <Th c="Student" />
              <Th c="Level" />
              <Th c="Parent / Phone" />
              <Th c="Status" />
              <Th c="Due" right />
              <Th c="Paid" right />
              <Th c="Balance" right />
              <Th c="" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 36, color: T.muted }}>
                    All students are fully paid for this semester. 🎉
                  </td>
                </tr>
              )
              : rows.map((r, i) => {
                const phone = (r.s.parentPhone || '').replace(/[^0-9]/g, '');
                const waUrl = phone
                  ? `https://wa.me/6${phone}?text=${encodeURIComponent(
                      `Reminder from ${cfg.schoolName}: Outstanding fee for ${r.s.name}.`,
                    )}`
                  : null;
                const bal = r.t.balance || (r.sf ? 0 : suggestFeeAmt(r.s.level, cfg.fees, r.s.discount));
                return (
                  <tr key={r.s.id}>
                    <Td s={{ fontSize: 12, color: T.muted, width: 30 }}>{i + 1}</Td>
                    <Td>
                      <div style={{ fontWeight: 600 }}>{r.s.name}</div>
                      <div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace' }}>{r.s.id}</div>
                    </Td>
                    <Td s={{ fontSize: 13 }}>{r.s.level}</Td>
                    <Td>
                      <div style={{ fontSize: 13 }}>{r.s.parentName || '—'}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{r.s.parentPhone || '—'}</div>
                    </Td>
                    <Td><SBadge s={r.ps} /></Td>
                    <Td s={{ textAlign: 'right', fontSize: 13 }}>
                      {fmtMoney(r.sf ? r.t.due : suggestFeeAmt(r.s.level, cfg.fees, r.s.discount))}
                    </Td>
                    <Td s={{ textAlign: 'right', fontWeight: 600, color: T.green }}>
                      {fmtMoney(r.t.paid)}
                    </Td>
                    <Td s={{ textAlign: 'right', fontWeight: 800, color: r.ps === 'partial' ? T.orange : T.red }}>
                      {fmtMoney(bal)}
                    </Td>
                    <Td>
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 8px', border: `1px solid ${T.border}`,
                            borderRadius: 6, fontSize: 12, color: '#16a34a',
                            background: 'white', textDecoration: 'none', fontWeight: 600,
                          }}
                        >
                          💬 WA
                        </a>
                      )}
                    </Td>
                  </tr>
                );
              })}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr style={{ background: '#F8FAFC' }}>
                <td
                  colSpan={7}
                  style={{
                    padding: '10px 14px', fontWeight: 700,
                    fontSize: 14, color: T.text, textAlign: 'right',
                  }}
                >
                  Total Outstanding
                </td>
                <td style={{
                  padding: '10px 14px', fontWeight: 900,
                  fontSize: 15, color: T.red, textAlign: 'right',
                  borderTop: `2px solid ${T.navy}`,
                }}>
                  {fmtMoney(totalBal)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Mdl>
  );
}
