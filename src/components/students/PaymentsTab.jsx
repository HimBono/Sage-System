import { useState } from 'react';
import { Plus, Check, Trash2, FileText, DollarSign, Calendar, Edit2, ShoppingBag, CreditCard } from 'lucide-react';
import { T, PMETHODS } from '../../constants/index.js';
import { fmtMoney, genId, genRec, today } from '../../utils/formatters.js';
import {
  semFeeOf, semTotals, payStatus, suggestFeeAmt, calcMonthlySchedule,
} from '../../utils/paymentHelpers.js';
import { SBadge, Btn, Th, Td, Sel, Inp, Pill, NumInp, Mdl } from '../ui/BaseUI.jsx';

// ── PAYMENTS TAB (shown inside StudentDetail) ─────────────────────────────────
export function PaymentsTab({ student, cfg, onUpdate, onViewReceipt }) {
  const [adding, setAdding] = useState(false);
  const [editingInst, setEditingInst] = useState(null); // { sfId, inst }
  const [pf, setPf] = useState({
    sem: cfg.currentSemester, year: cfg.currentYear,
    totalDue: '', amount: '', date: today(), method: 'Cash', note: '',
  });

  const openAdd = (presetAmt = null, presetNote = '') => {
    const ef = semFeeOf(student, cfg);
    const et = semTotals(ef);
    const suggested = ef ? Math.max(0, et.balance) : suggestFeeAmt(student.level, cfg.fees, student.discount);
    setPf({
      sem: cfg.currentSemester, year: cfg.currentYear,
      totalDue: ef ? ef.totalDue : suggestFeeAmt(student.level, cfg.fees, student.discount),
      amount: presetAmt !== null ? presetAmt : (suggested || ''),
      date: today(),
      method: 'Cash',
      note: presetNote,
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
          plan: student.paymentPlan || 'monthly',
          totalDue: Number(pf.totalDue) || suggestFeeAmt(student.level, cfg.fees, student.discount) || amt,
          installments: [newInst],
        },
      ];
    }
    onUpdate({ ...student, semFees: newSF });
    setAdding(false);
  };

  const saveEditedInst = () => {
    if (!editingInst) return;
    const { sfId, inst } = editingInst;
    const newSF = (student.semFees || []).map((sf) => {
      if (sf.id !== sfId) return sf;
      return {
        ...sf,
        installments: sf.installments.map((i) => (i.id === inst.id ? { ...inst, amount: Number(inst.amount) } : i)),
      };
    });
    onUpdate({ ...student, semFees: newSF });
    setEditingInst(null);
  };

  const deleteInst = (sfId, instId) => {
    if (!window.confirm('Delete this payment entry?')) return;
    const newSF = (student.semFees || [])
      .map((sf) => {
        if (sf.id !== sfId) return sf;
        return { ...sf, installments: sf.installments.filter((i) => i.id !== instId) };
      })
      .filter((sf) => sf.installments.length > 0);
    onUpdate({ ...student, semFees: newSF });
  };

  const togglePlan = (sfId, currentPlan) => {
    const nextPlan = currentPlan === 'monthly' ? 'full' : 'monthly';
    const newSF = (student.semFees || []).map((sf) => {
      if (sf.id === sfId) return { ...sf, plan: nextPlan };
      return sf;
    });
    onUpdate({ ...student, paymentPlan: nextPlan, semFees: newSF });
  };

  const currentSF = semFeeOf(student, cfg);
  const ct        = semTotals(currentSF);
  const pct       = ct.due > 0 ? Math.min(100, Math.round(ct.paid / ct.due * 100)) : 0;
  const ps        = payStatus(student, cfg);
  const plan      = currentSF?.plan || student.paymentPlan || 'monthly';
  const monthlySchedule = currentSF ? calcMonthlySchedule(currentSF) : [];
  const nextUnpaidMonth = monthlySchedule.find((m) => m.status !== 'paid');

  const existSF = (student.semFees || []).find(
    (sf) => sf.sem === Number(pf.sem) && sf.year === Number(pf.year),
  );
  const existT  = semTotals(existSF);

  // Starter package breakdown
  const pkg = student.initialPackage;
  const pkgTotal = pkg
    ? (pkg.admission?.enabled ? Number(pkg.admission.amount) || 0 : 0) +
      (pkg.books?.enabled ? Number(pkg.books.amount) || 0 : 0) +
      (pkg.uniform?.enabled ? Number(pkg.uniform.amount) || 0 : 0) +
      (pkg.custom?.enabled ? Number(pkg.custom.amount) || 0 : 0)
    : 0;

  return (
    <div style={{ padding: 20 }}>
      {/* Starter Package Notice if applicable */}
      {pkg && pkgTotal > 0 && (
        <div style={{
          background: '#F8FAFC', border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} color={T.sky} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                Starter Package (Admission, Books & Uniform)
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>
                Total: {fmtMoney(pkgTotal)} · Status: {pkg.paidNow ? '✓ Paid upon registration' : '⏳ Pending / Pay Later'}
              </div>
            </div>
          </div>
          <Pill label={pkg.paidNow ? 'Settled' : 'Pending'} color={pkg.paidNow ? T.green : T.orange} />
        </div>
      )}

      {/* Current semester summary Card */}
      <div style={{
        background: 'white', borderRadius: 12, padding: 18,
        marginBottom: 16, border: `1px solid ${T.border}`, boxShadow: T.shadow,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              Semester {cfg.currentSemester}, {cfg.currentYear} Overview
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F1F5F9', color: T.muted, fontWeight: 600 }}>
                {plan === 'monthly' ? '🗓 6-Month Monthly Plan' : '💰 Full Semester Plan'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
              Level: <strong>{student.level}</strong> · Rate: {plan === 'monthly' && currentSF?.totalDue ? `${fmtMoney(currentSF.totalDue / 6)} / month` : `${fmtMoney(ct.due)} / sem`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {currentSF && (
              <button
                onClick={() => togglePlan(currentSF.id, plan)}
                title="Switch between Monthly Plan and Full Semester"
                style={{
                  background: 'none', border: `1px solid ${T.border}`, borderRadius: 6,
                  padding: '4px 8px', fontSize: 11, fontWeight: 600, color: T.sky, cursor: 'pointer',
                }}
              >
                Switch to {plan === 'monthly' ? 'Full' : 'Monthly'}
              </button>
            )}
            <SBadge s={ps} />
          </div>
        </div>

        {ct.due > 0 ? (
          <>
            <div style={{ background: T.border, borderRadius: 99, height: 7, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: ct.balance === 0 ? T.green : ct.paid > 0 ? T.orange : T.border,
                width: `${pct}%`, transition: 'width .4s',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14 }}>
              <span style={{ color: T.muted }}>Total Due: <strong style={{ color: T.text }}>{fmtMoney(ct.due)}</strong></span>
              <span style={{ color: T.muted }}>Paid: <strong style={{ color: T.green }}>{fmtMoney(ct.paid)}</strong></span>
              <span style={{ color: T.muted }}>Balance: <strong style={{ color: ct.balance > 0 ? T.orange : T.green }}>{fmtMoney(ct.balance)}</strong></span>
            </div>

            {/* 6-Month Visual Monthly Schedule (When on monthly plan) */}
            {plan === 'monthly' && monthlySchedule.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid #F1F5F9` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 9 }}>
                  6-Month Instalment Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {monthlySchedule.map((m) => {
                    const isPaid = m.status === 'paid';
                    const isPartial = m.status === 'partial';
                    const bg = isPaid ? '#ECFDF5' : isPartial ? '#FFF7ED' : '#F8FAFC';
                    const border = isPaid ? '#A7F3D0' : isPartial ? '#FED7AA' : T.border;
                    const fg = isPaid ? T.green : isPartial ? T.orange : T.muted;

                    return (
                      <div
                        key={m.monthIndex}
                        onClick={() => !isPaid && openAdd(m.balance, `Month ${m.monthIndex} (${m.monthName})`)}
                        style={{
                          background: bg, border: `1px solid ${border}`,
                          borderRadius: 8, padding: '8px 6px', textAlign: 'center',
                          cursor: !isPaid ? 'pointer' : 'default', transition: 'all .15s',
                        }}
                        title={!isPaid ? `Click to pay Month ${m.monthIndex} (${fmtMoney(m.balance)})` : 'Paid'}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{m.monthName}</div>
                        <div style={{ fontSize: 10, color: T.muted, margin: '2px 0' }}>M{m.monthIndex}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: fg }}>
                          {isPaid ? '✓ Paid' : fmtMoney(m.due)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            No fee record for this semester yet. Click "Record Payment" to initialize.
          </div>
        )}
      </div>

      {/* Header row & Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Payment & Receipt History</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {plan === 'monthly' && nextUnpaidMonth && (
            <Btn sm v="sky" onClick={() => openAdd(nextUnpaidMonth.balance, `Month ${nextUnpaidMonth.monthIndex} (${nextUnpaidMonth.monthName})`)}>
              <Calendar size={13} /> Pay M{nextUnpaidMonth.monthIndex} ({fmtMoney(nextUnpaidMonth.balance)})
            </Btn>
          )}
          <Btn sm onClick={() => openAdd()}><Plus size={13} />Record Payment</Btn>
        </div>
      </div>

      {/* Add payment form */}
      {adding && (
        <div style={{
          background: '#F0F9FF', border: '1px solid #BAE6FD',
          borderRadius: 10, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>
            Record New Payment
          </div>
          {existSF && (
            <div style={{
              fontSize: 12, color: T.orange, marginBottom: 10,
              background: '#FFF7ED', padding: '6px 10px', borderRadius: 6,
            }}>
              ⚡ Current Semester Balance: {fmtMoney(existT.balance)}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Sel label="Semester" value={pf.sem} onChange={(e) => setPf((x) => ({ ...x, sem: e.target.value }))}>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </Sel>
            <NumInp
              label="Year"
              value={pf.year}
              onChange={(e) => setPf((x) => ({ ...x, year: e.target.value }))}
              min={2020}
              max={2035}
              step={1}
            />
            {!existSF && (
              <NumInp
                label="Total Fee Due"
                prefix="RM"
                step={50}
                value={pf.totalDue}
                onChange={(e) => setPf((x) => ({ ...x, totalDue: e.target.value }))}
                placeholder={suggestFeeAmt(student.level, cfg.fees, student.discount) || '0.00'}
              />
            )}
            <NumInp
              label={existSF ? `Paying Amount` : 'Amount'}
              required
              prefix="RM"
              step={50}
              value={pf.amount}
              onChange={(e) => setPf((x) => ({ ...x, amount: e.target.value }))}
              placeholder="0.00"
              quickSteps={
                plan === 'monthly' && currentSF?.totalDue
                  ? [currentSF.totalDue / 6, (currentSF.totalDue / 6) * 2, existT.balance].filter(Boolean)
                  : [100, 200, 500]
              }
            />
            <Sel label="Payment Method" value={pf.method} onChange={(e) => setPf((x) => ({ ...x, method: e.target.value }))}>
              {PMETHODS.map((m) => <option key={m}>{m}</option>)}
            </Sel>
            <Inp label="Date Paid" type="date" value={pf.date} onChange={(e) => setPf((x) => ({ ...x, date: e.target.value }))} />
            <Inp
              col="1/-1"
              label="Note / Remarks"
              optional
              value={pf.note}
              onChange={(e) => setPf((x) => ({ ...x, note: e.target.value }))}
              placeholder="e.g. Month 1 tuition fee, 1st instalment, full settlement…"
            />
          </div>
          <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
            <Btn sm onClick={addPayment} disabled={!pf.amount} v="green"><Check size={13} />Confirm & Issue Receipt</Btn>
            <Btn sm v="outline" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingInst && (
        <Mdl title={`Edit Payment · ${editingInst.inst.receiptNo}`} onClose={() => setEditingInst(null)}>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <NumInp
                col="1/-1"
                label="Payment Amount"
                prefix="RM"
                step={20}
                value={editingInst.inst.amount}
                onChange={(e) => setEditingInst((prev) => ({
                  ...prev,
                  inst: { ...prev.inst, amount: e.target.value },
                }))}
              />
              <Sel
                label="Payment Method"
                value={editingInst.inst.method}
                onChange={(e) => setEditingInst((prev) => ({
                  ...prev,
                  inst: { ...prev.inst, method: e.target.value },
                }))}
              >
                {PMETHODS.map((m) => <option key={m}>{m}</option>)}
              </Sel>
              <Inp
                label="Date Paid"
                type="date"
                value={editingInst.inst.date}
                onChange={(e) => setEditingInst((prev) => ({
                  ...prev,
                  inst: { ...prev.inst, date: e.target.value },
                }))}
              />
              <Inp
                col="1/-1"
                label="Note / Reference"
                optional
                value={editingInst.inst.note || ''}
                onChange={(e) => setEditingInst((prev) => ({
                  ...prev,
                  inst: { ...prev.inst, note: e.target.value },
                }))}
              />
            </div>
          </div>
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn v="outline" onClick={() => setEditingInst(null)}>Cancel</Btn>
            <Btn v="green" onClick={saveEditedInst}><Check size={14} />Save Updates</Btn>
          </div>
        </Mdl>
      )}

      {/* Payment records */}
      {(student.semFees || []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: T.muted, background: 'white', borderRadius: 10, border: `1px solid ${T.border}` }}>
          <DollarSign size={32} style={{ opacity: .3, display: 'block', margin: '0 auto 7px' }} />
          <div style={{ fontSize: 14 }}>No payment records yet.</div>
          <Btn sm onClick={() => openAdd()} style={{ marginTop: 10 }}><Plus size={12} />Add First Payment</Btn>
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
                marginBottom: 12, overflow: 'hidden', background: 'white',
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
                    <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>
                      ({sf.plan === 'monthly' ? '6-Month Plan' : 'Full Semester'})
                    </span>
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
                          <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                            <Btn sm v="outline" onClick={() => onViewReceipt({ inst, semFee: sf })}>
                              <FileText size={12} />Receipt
                            </Btn>
                            <button
                              onClick={() => setEditingInst({ sfId: sf.id, inst: { ...inst } })}
                              title="Edit payment"
                              style={{
                                padding: '4px 6px', border: `1px solid ${T.border}`,
                                borderRadius: 6, cursor: 'pointer', background: 'white', lineHeight: 0,
                              }}
                            >
                              <Edit2 size={12} color={T.sky} />
                            </button>
                            <button
                              onClick={() => deleteInst(sf.id, inst.id)}
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
