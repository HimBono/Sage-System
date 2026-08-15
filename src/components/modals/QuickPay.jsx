import { useState } from 'react';
import { Check } from 'lucide-react';
import { T, PMETHODS } from '../../constants/index.js';
import { fmtMoney, genId, genRec, today } from '../../utils/formatters.js';
import {
  semFeeOf, semTotals, payStatus, suggestFeeAmt,
} from '../../utils/paymentHelpers.js';
import { Mdl, Inp, Sel, SBadge, Btn, NumInp } from '../ui/BaseUI.jsx';

// ── QUICK PAY MODAL ───────────────────────────────────────────────────────────
export function QuickPay({ student, cfg, onSave, onClose }) {
  const existSF  = semFeeOf(student, cfg);
  const existT   = semTotals(existSF);
  const suggested = existSF
    ? Math.max(0, existT.balance)
    : suggestFeeAmt(student.level, cfg.fees, student.discount);

  const [pf, setPf] = useState({
    sem:      cfg.currentSemester,
    year:     cfg.currentYear,
    totalDue: existSF ? existSF.totalDue : suggestFeeAmt(student.level, cfg.fees, student.discount),
    amount:   suggested,
    date:     today(),
    method:   'Cash',
    note:     '',
  });

  const u   = (k, v) => setPf((x) => ({ ...x, [k]: v }));
  const isNew = !existSF;
  const balance = existSF
    ? Math.max(0, existT.balance - Number(pf.amount || 0))
    : Math.max(0, Number(pf.totalDue || 0) - Number(pf.amount || 0));
  const ps = payStatus(student, cfg);

  const commit = () => {
    const semN = Number(pf.sem), yrN = Number(pf.year), amt = Number(pf.amount);
    if (!amt) return;
    const newInst = {
      id: genId('INS'), amount: amt, date: pf.date,
      method: pf.method, note: pf.note, receiptNo: genRec(yrN),
    };
    const idx = (student.semFees || []).findIndex(
      (sf) => sf.sem === semN && sf.year === yrN,
    );
    let newSF;
    if (idx >= 0) {
      newSF = student.semFees.map((sf, i) =>
        i === idx ? { ...sf, installments: [...sf.installments, newInst] } : sf,
      );
    } else {
      newSF = [
        ...(student.semFees || []),
        {
          id: genId('SF'), sem: semN, year: yrN,
          totalDue: Number(pf.totalDue) || amt,
          installments: [newInst],
        },
      ];
    }
    onSave({ ...student, semFees: newSF });
  };

  return (
    <Mdl title={`Quick Pay — ${student.name}`} onClose={onClose}>
      <div style={{ padding: 20 }}>
        {/* Status strip */}
        <div style={{
          background: '#F8FAFC', border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 18,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: ps !== 'unpaid' ? 10 : 0,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                {student.level} — Sem {cfg.currentSemester}, {cfg.currentYear}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>
                Fee: {fmtMoney(existSF ? existSF.totalDue : pf.totalDue || suggestFeeAmt(student.level, cfg.fees, student.discount))}
              </div>
            </div>
            <SBadge s={ps} />
          </div>
          {existSF && (
            <>
              <div style={{
                background: T.border, borderRadius: 99, height: 6,
                overflow: 'hidden', marginBottom: 6,
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: existT.balance === 0 ? T.green : T.orange,
                  width: `${Math.min(100, existT.due > 0 ? existT.paid / existT.due * 100 : 0)}%`,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: T.green }}>Paid: {fmtMoney(existT.paid)}</span>
                <span style={{ color: existT.balance > 0 ? T.orange : T.green }}>
                  Balance: {fmtMoney(existT.balance)}
                </span>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <Sel label="Semester" value={pf.sem} onChange={(e) => u('sem', e.target.value)}>
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </Sel>
          <NumInp
            label="Year"
            value={pf.year}
            onChange={(e) => u('year', e.target.value)}
            min={2020}
            max={2035}
            step={1}
          />
          {isNew && (
            <NumInp
              col="1/-1"
              label="Total Fee Due"
              prefix="RM"
              step={50}
              value={pf.totalDue}
              onChange={(e) => u('totalDue', e.target.value)}
              placeholder={suggestFeeAmt(student.level, cfg.fees, student.discount) || '0.00'}
            />
          )}
          <NumInp
            col="1/-1"
            label="Amount Paying"
            required
            prefix="RM"
            step={50}
            value={pf.amount}
            onChange={(e) => u('amount', e.target.value)}
            placeholder="0.00"
            quickSteps={
              suggested > 0
                ? [suggested / 2, suggested].filter(Boolean)
                : [100, 200, 500]
            }
          />
          <Sel label="Payment Method" value={pf.method} onChange={(e) => u('method', e.target.value)}>
            {PMETHODS.map((m) => <option key={m}>{m}</option>)}
          </Sel>
          <Inp label="Date Paid" type="date" value={pf.date} onChange={(e) => u('date', e.target.value)} />
          <Inp
            col="1/-1"
            label="Note"
            optional
            value={pf.note}
            onChange={(e) => u('note', e.target.value)}
            placeholder="e.g. 1st instalment, full payment…"
          />
        </div>

        {Number(pf.amount) > 0 && (
          <div style={{
            background: balance === 0 ? '#D1FAE5' : '#FFF7ED',
            border: `1px solid ${balance === 0 ? T.green : T.orange}`,
            borderRadius: 8, padding: '10px 14px', marginTop: 4,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: T.muted }}>Balance after this payment</span>
            <span style={{
              fontWeight: 800, fontSize: 15,
              color: balance === 0 ? T.green : T.orange,
            }}>
              {fmtMoney(balance)}
            </span>
          </div>
        )}
      </div>

      <div style={{
        padding: '12px 20px', borderTop: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
      }}>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={commit} disabled={!Number(pf.amount)} v="green">
          <Check size={14} />Confirm Payment
        </Btn>
      </div>
    </Mdl>
  );
}
