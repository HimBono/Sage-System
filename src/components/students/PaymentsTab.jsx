import { useState } from 'react';
import { Plus, Check, Trash2, FileText, DollarSign } from 'lucide-react';
import { T, PMETHODS } from '../../constants/index.js';
import { fmtMoney, genId, genRec, today } from '../../utils/formatters.js';
import {
  semFeeOf, semTotals, payStatus, suggestFeeAmt,
} from '../../utils/paymentHelpers.js';
import { SBadge, Btn, Th, Td, Sel, Inp, Pill } from '../ui/BaseUI.jsx';

// ── PAYMENTS TAB (shown inside StudentDetail) ─────────────────────────────────
export function PaymentsTab({ student, cfg, onUpdate, onViewReceipt }) {
  const [adding, setAdding] = useState(false);
  const [pf, setPf] = useState({
    sem: cfg.currentSemester, year: cfg.currentYear,
    totalDue: '', amount: '', date: today(), method: 'Cash', note: '',
  });

  const openAdd = () => {
    const ef = semFeeOf(student, cfg);
    const et = semTotals(ef);
    const suggested = ef ? Math.max(0, et.balance) : suggestFeeAmt(student.level, cfg.fees, student.discount);
    setPf({
      sem: cfg.currentSemester, year: cfg.currentYear,
      totalDue: ef ? ef.totalDue : suggestFeeAmt(student.level, cfg.fees, student.discount),
      amount: suggested, date: today(), method: 'Cash', note: '',
    });
    setAdding(true);
  };

  const addPayment = () => {
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
          totalDue: Number(pf.totalDue) || suggestFeeAmt(student.level, cfg.fees, student.discount) || amt,
          installments: [newInst],
        },
      ];
    }
    onUpdate({ ...student, semFees: newSF });
    setAdding(false);
  };

  const deleteInst = (sfId, instId) => {
    const newSF = (student.semFees || [])
      .map((sf) => {
        if (sf.id !== sfId) return sf;
        return { ...sf, installments: sf.installments.filter((i) => i.id !== instId) };
      })
      .filter((sf) => sf.installments.length > 0);
    onUpdate({ ...student, semFees: newSF });
  };

  const currentSF = semFeeOf(student, cfg);
  const ct        = semTotals(currentSF);
  const pct       = ct.due > 0 ? Math.min(100, Math.round(ct.paid / ct.due * 100)) : 0;
  const ps        = payStatus(student, cfg);
  const existSF   = (student.semFees || []).find(
    (sf) => sf.sem === Number(pf.sem) && sf.year === Number(pf.year),
  );
  const existT    = semTotals(existSF);

  return (
    <div style={{ padding: 20 }}>
      {/* Current semester summary */}
      <div style={{
        background: '#F8FAFC', borderRadius: 12, padding: 16,
        marginBottom: 16, border: `1px solid ${T.border}`,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: ct.due > 0 ? 10 : 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            Semester {cfg.currentSemester}, {cfg.currentYear} — Current
          </div>
          <SBadge s={ps} />
        </div>
        {ct.due > 0 ? (
          <>
            <div style={{ background: T.border, borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: ct.balance === 0 ? T.green : ct.paid > 0 ? T.orange : T.border,
                width: `${pct}%`, transition: 'width .4s',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: T.muted }}>Total Due <strong style={{ color: T.text }}>{fmtMoney(ct.due)}</strong></span>
              <span style={{ color: T.muted }}>Paid <strong style={{ color: T.green }}>{fmtMoney(ct.paid)}</strong></span>
              <span style={{ color: T.muted }}>Balance <strong style={{ color: ct.balance > 0 ? T.orange : T.green }}>{fmtMoney(ct.balance)}</strong></span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            No fee record for this semester yet. Click "Add Payment" to record.
          </div>
        )}
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>All Payment Records</div>
        <Btn sm onClick={openAdd}><Plus size={13} />Add Payment</Btn>
      </div>

      {/* Add payment form */}
      {adding && (
        <div style={{
          background: '#F0F9FF', border: '1px solid #BAE6FD',
          borderRadius: 10, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>
            Record Payment / Instalment
          </div>
          {existSF && (
            <div style={{
              fontSize: 12, color: T.orange, marginBottom: 10,
              background: '#FFF7ED', padding: '5px 10px', borderRadius: 6,
            }}>
              ⚡ Existing record — Balance: {fmtMoney(existT.balance)}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Sel label="Semester" value={pf.sem} onChange={(e) => setPf((x) => ({ ...x, sem: e.target.value }))}>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </Sel>
            <Inp label="Year" type="number" value={pf.year} onChange={(e) => setPf((x) => ({ ...x, year: e.target.value }))} />
            {!existSF && (
              <Inp
                label="Total Due (RM)" type="number"
                value={pf.totalDue} onChange={(e) => setPf((x) => ({ ...x, totalDue: e.target.value }))}
                placeholder={suggestFeeAmt(student.level, cfg.fees, student.discount) || '0.00'}
              />
            )}
            <Inp
              label={existSF ? `Paying (Bal: ${fmtMoney(existT.balance)})` : 'Amount (RM)'}
              type="number" value={pf.amount}
              onChange={(e) => setPf((x) => ({ ...x, amount: e.target.value }))}
              placeholder="0.00"
            />
            <Sel label="Payment Method" value={pf.method} onChange={(e) => setPf((x) => ({ ...x, method: e.target.value }))}>
              {PMETHODS.map((m) => <option key={m}>{m}</option>)}
            </Sel>
            <Inp label="Date Paid" type="date" value={pf.date} onChange={(e) => setPf((x) => ({ ...x, date: e.target.value }))} />
            <Inp
              col="1/-1" label="Note (optional)"
              value={pf.note} onChange={(e) => setPf((x) => ({ ...x, note: e.target.value }))}
              placeholder="e.g. 1st instalment, full payment…"
            />
          </div>
          <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
            <Btn sm onClick={addPayment} disabled={!pf.amount} v="green"><Check size={13} />Confirm</Btn>
            <Btn sm v="outline" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Payment records */}
      {(student.semFees || []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: T.muted }}>
          <DollarSign size={32} style={{ opacity: .3, display: 'block', margin: '0 auto 7px' }} />
          <div style={{ fontSize: 14 }}>No payment records yet.</div>
          <Btn sm onClick={openAdd} style={{ marginTop: 10 }}><Plus size={12} />Add First Payment</Btn>
        </div>
      ) : (
        [...(student.semFees || [])]
          .sort((a, b) => b.year - a.year || b.sem - a.sem)
          .map((sf) => {
            const t    = semTotals(sf);
            const pct2 = t.due > 0 ? Math.min(100, Math.round(t.paid / t.due * 100)) : 0;
            const st   = t.balance === 0 ? 'paid' : t.paid > 0 ? 'partial' : 'unpaid';
            return (
              <div key={sf.id} style={{
                border: `1px solid ${T.border}`, borderRadius: 10,
                marginBottom: 12, overflow: 'hidden',
              }}>
                {/* Semester header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '11px 14px', background: '#F8FAFC',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>
                      Semester {sf.sem}, {sf.year}
                    </div>
                    <SBadge s={st} />
                  </div>
                  <div style={{ fontSize: 13, color: T.muted }}>
                    <strong style={{ color: T.green }}>{fmtMoney(t.paid)}</strong> / {fmtMoney(t.due)}
                    {t.balance > 0 && (
                      <span style={{ color: T.orange, marginLeft: 8 }}>({fmtMoney(t.balance)} left)</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {t.due > 0 && (
                  <div style={{ padding: '0 14px 6px', background: '#F8FAFC' }}>
                    <div style={{ background: T.border, borderRadius: 99, height: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        background: t.balance === 0 ? T.green : T.orange,
                        width: `${pct2}%`,
                      }} />
                    </div>
                  </div>
                )}

                {/* Instalment table */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA' }}>
                      <Th c="#" /><Th c="Receipt" /><Th c="Method" />
                      <Th c="Amount" /><Th c="Note" /><Th c="Date" /><Th c="" />
                    </tr>
                  </thead>
                  <tbody>
                    {sf.installments.map((inst, i) => (
                      <tr key={inst.id}>
                        <Td s={{ fontSize: 12, color: T.muted, width: 32 }}>{i + 1}</Td>
                        <Td s={{ fontFamily: 'monospace', fontSize: 11, color: T.muted }}>{inst.receiptNo}</Td>
                        <Td s={{ fontSize: 12 }}><Pill label={inst.method || '—'} color={T.sky} /></Td>
                        <Td s={{ fontWeight: 700, color: T.green }}>{fmtMoney(inst.amount)}</Td>
                        <Td s={{ color: T.muted, fontSize: 12 }}>{inst.note || '—'}</Td>
                        <Td s={{ color: T.muted, fontSize: 12 }}>{inst.date}</Td>
                        <Td>
                          <div style={{ display: 'flex', gap: 3 }}>
                            <Btn sm v="outline" onClick={() => onViewReceipt({ inst, semFee: sf })}>
                              <FileText size={12} />Receipt
                            </Btn>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this payment entry?')) deleteInst(sf.id, inst.id);
                              }}
                              title="Delete entry"
                              style={{
                                padding: '4px 6px', border: `1px solid ${T.border}`,
                                borderRadius: 6, cursor: 'pointer', background: 'white', lineHeight: 0,
                              }}
                            >
                              <Trash2 size={12} color={T.red} />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
      )}
    </div>
  );
}
