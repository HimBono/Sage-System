import { useState, useMemo } from 'react';
import {
  Search, X, Plus, FileText, ClipboardList, AlertCircle, Zap, Eye, Edit2, Trash2,
} from 'lucide-react';
import { T, LEVELS } from '../constants/index.js';
import { fmtMoney, copyText } from '../utils/formatters.js';
import {
  semFeeOf, semTotals, payStatus, isArchived, waMsg,
} from '../utils/paymentHelpers.js';
import { SBadge, Av, Th, Td, Btn, IconBtn } from '../components/ui/BaseUI.jsx';
import { StudentFormModal } from '../components/students/StudentForm.jsx';
import { StudentDetail } from '../components/students/StudentDetail.jsx';
import { QuickPay } from '../components/modals/QuickPay.jsx';
import { RegFormModal } from '../components/modals/RegFormModal.jsx';
import { OutstandingReport } from '../components/modals/OutstandingReport.jsx';
import { ReceiptDoc } from '../components/receipts/ReceiptDoc.jsx';
import { Mdl } from '../components/ui/BaseUI.jsx';

// ── STUDENTS VIEW ─────────────────────────────────────────────────────────────
export function StudentsView({ students, setStudents, cfg, setCfg, onRollover }) {
  const [q, setQ] = useState('');
  const [fl, setFl] = useState('');
  const [fs, setFs] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [modal, setModal] = useState(null);
  const [waToast, setWaToast] = useState('');

  const doSort = (f) => {
    if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(f); setSortDir('asc'); }
  };

  const list = useMemo(() => {
    const filtered = students.filter((s) => {
      if (!showArchived && isArchived(s)) return false;
      const qn = q.toLowerCase();
      return (
        (!qn || s.name.toLowerCase().includes(qn) || s.id.toLowerCase().includes(qn) || (s.ic || '').includes(qn) || (s.parentName || '').toLowerCase().includes(qn) || (s.parentPhone || '').includes(q))
        && (!fl || s.level === fl)
        && (!fs || payStatus(s, cfg) === fs)
      );
    });
    return [...filtered].sort((a, b) => {
      let va, vb;
      if (sortField === 'name') { va = a.name; vb = b.name; }
      else if (sortField === 'level') { va = LEVELS.indexOf(a.level); vb = LEVELS.indexOf(b.level); }
      else if (sortField === 'status') { va = payStatus(a, cfg); vb = payStatus(b, cfg); }
      else if (sortField === 'balance') { va = semTotals(semFeeOf(a, cfg)).balance; vb = semTotals(semFeeOf(b, cfg)).balance; }
      else { va = a.name; vb = b.name; }
      
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [students, q, fl, fs, showArchived, sortField, sortDir, cfg]);

  const ms = modal?.sid ? students.find((x) => x.id === modal.sid) : null;
  
  const save = (s) => {
    setStudents((prev) => s.id && prev.find((x) => x.id === s.id) ? prev.map((x) => x.id === s.id ? s : x) : [...prev, s]);
    setModal(null);
  };
  const upd = (s) => {
    setStudents((prev) => prev.map((x) => x.id === s.id ? s : x));
    setModal((m) => ({ ...m, type: 'view', sid: s.id }));
  };
  const updQP = (s) => {
    setStudents((prev) => prev.map((x) => x.id === s.id ? s : x));
    setModal(null);
  };
  const del = (id) => {
    if (window.confirm('Delete this student permanently?')) setStudents((p) => p.filter((x) => x.id !== id));
  };

  const handleWA = (s, e) => {
    e.stopPropagation();
    const phone = (s.parentPhone || '').replace(/[^0-9]/g, '');
    if (!phone) { alert('No parent phone number on record.'); return; }
    copyText(waMsg(s, cfg));
    window.open(`https://wa.me/6${phone}?text=${encodeURIComponent(waMsg(s, cfg))}`, '_blank');
    setWaToast(s.id);
    setTimeout(() => setWaToast(''), 2000);
  };

  const activeCount = students.filter((s) => !isArchived(s)).length;
  const unpaidCount = students.filter((s) => !isArchived(s) && payStatus(s, cfg) === 'unpaid').length;
  const partialCount = students.filter((s) => !isArchived(s) && payStatus(s, cfg) === 'partial').length;
  
  const SH = ({ c, f }) => <Th c={c} sortable active={sortField === f} dir={sortDir} onClick={() => doSort(f)} />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>Students</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: '3px 0 0' }}>{list.length} of {activeCount} active students</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Btn v="outline" onClick={() => setModal({ type: 'report' })}><FileText size={14} />Outstanding</Btn>
          <Btn v="outline" onClick={() => setModal({ type: 'regform', sid: null })}><ClipboardList size={14} />Blank Form</Btn>
          <Btn v="outline" onClick={onRollover}>🔄 Rollover</Btn>
          <Btn onClick={() => setModal({ type: 'add' })}><Plus size={14} />Register Student</Btn>
        </div>
      </div>

      {(unpaidCount > 0 || partialCount > 0) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          {unpaidCount > 0 && (
            <div
              onClick={() => setFs('unpaid')}
              style={{
                background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 9, padding: '8px 14px',
                fontSize: 13, color: '#92400E', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
              }}
            >
              <AlertCircle size={14} /><strong>{unpaidCount}</strong> unpaid this semester
            </div>
          )}
          {partialCount > 0 && (
            <div
              onClick={() => setFs('partial')}
              style={{
                background: '#FFEDD5', border: '1px solid #FED7AA', borderRadius: 9, padding: '8px 14px',
                fontSize: 13, color: '#9A3412', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
              }}
            >
              <Zap size={14} /><strong>{partialCount}</strong> partial
            </div>
          )}
          {(fs === 'unpaid' || fs === 'partial') && (
            <button
              onClick={() => setFs('')}
              style={{
                background: 'none', border: `1px solid ${T.border}`, borderRadius: 9, padding: '8px 12px',
                fontSize: 13, color: T.muted, cursor: 'pointer',
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: 11, padding: 13, boxShadow: T.shadow,
        marginBottom: 12, display: 'flex', gap: 9, flexWrap: 'wrap',
      }}>
        <div style={{
          flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 7,
          border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px',
        }}>
          <Search size={14} color={T.muted} />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Name, ID, IC, parent name…"
            style={{ border: 'none', outline: 'none', fontSize: 14, color: T.text, flex: 1, background: 'none' }}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
            >
              <X size={13} color={T.muted} />
            </button>
          )}
        </div>
        <select
          value={fl} onChange={(e) => setFl(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 14, background: 'white', color: T.text }}
        >
          <option value="">All Levels</option>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select
          value={fs} onChange={(e) => setFs(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 14, background: 'white', color: T.text }}
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: T.muted, padding: '7px 4px', userSelect: 'none' }}>
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      <div style={{ background: 'white', borderRadius: 12, boxShadow: T.shadow }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <SH c="Student" f="name" />
              <Th c="ID" />
              <SH c="Level" f="level" />
              <Th c="Parent" />
              <SH c="Fee Status" f="status" />
              <SH c="Balance" f="balance" />
              <Th c="Actions" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 36, color: T.muted, fontSize: 14 }}>
                  No students found.{' '}
                  {(q || fl || fs) && (
                    <button
                      onClick={() => { setQ(''); setFl(''); setFs(''); }}
                      style={{ background: 'none', border: 'none', color: T.sky, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : list.map((s) => {
              const sf = semFeeOf(s, cfg);
              const st = semTotals(sf);
              const ps = payStatus(s, cfg);
              const arch = isArchived(s);
              return (
                <tr key={s.id} style={{ background: arch ? '#F8FAFC' : (ps === 'unpaid' && !arch ? '#FFFBEB' : undefined), opacity: arch ? 0.6 : 1 }}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Av photo={s.photo} name={s.name} id={s.id} sz={33} r={8} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {s.name}
                          {s.notes && <span title={s.notes} style={{ marginLeft: 5, fontSize: 10, color: T.amber }}>📝</span>}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted }}>{s.email || s.phone}</div>
                      </div>
                    </div>
                  </Td>
                  <Td s={{ fontFamily: 'monospace', fontSize: 12, color: T.muted }}>{s.id}</Td>
                  <Td s={{ fontSize: 13 }}>{s.level}</Td>
                  <Td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.parentName || '—'}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{s.parentPhone}</div>
                  </Td>
                  <Td>{arch ? <SBadge s={s.status} /> : <SBadge s={ps} />}</Td>
                  <Td s={{ fontWeight: 700, color: st.balance > 0 ? T.orange : T.muted, textAlign: 'right' }}>
                    {sf ? fmtMoney(st.balance) : '—'}
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {!arch && (
                        <Btn sm v="orange" onClick={() => setModal({ type: 'quickpay', sid: s.id })} title="Quick Pay">
                          <Zap size={12} />Pay
                        </Btn>
                      )}
                      <IconBtn I={Eye} color={T.muted} onClick={() => setModal({ type: 'view', sid: s.id })} title="View profile" />
                      <IconBtn I={Edit2} color={T.sky} onClick={() => setModal({ type: 'edit', sid: s.id })} title="Edit" />
                      <button
                        onClick={(e) => handleWA(s, e)}
                        title={waToast === s.id ? 'Sent!' : 'WhatsApp reminder'}
                        style={{
                          padding: 5, border: `1px solid ${T.border}`, borderRadius: 6, cursor: 'pointer',
                          background: waToast === s.id ? '#D1FAE5' : 'white', lineHeight: 0,
                        }}
                      >
                        💬
                      </button>
                      <IconBtn I={ClipboardList} color={T.purple} onClick={() => setModal({ type: 'regform', sid: s.id })} title="Reg form" />
                      <IconBtn I={Trash2} color={T.red} onClick={() => del(s.id)} title="Delete" />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal?.type === 'add' && <StudentFormModal student={null} onSave={save} onClose={() => setModal(null)} cfg={cfg} allStudents={students} />}
      {modal?.type === 'edit' && ms && <StudentFormModal student={ms} onSave={save} onClose={() => setModal(null)} cfg={cfg} allStudents={students} />}
      {modal?.type === 'quickpay' && ms && <QuickPay student={ms} cfg={cfg} onSave={updQP} onClose={() => setModal(null)} />}
      {modal?.type === 'view' && ms && (
        <StudentDetail
          student={ms} cfg={cfg} onClose={() => setModal(null)}
          onEdit={() => setModal({ type: 'edit', sid: ms.id })}
          onUpdate={upd}
          onViewReceipt={({ inst, semFee }) => setModal({ type: 'receipt', sid: ms.id, inst, semFee })}
          onRegForm={() => setModal({ type: 'regform', sid: ms.id })}
        />
      )}
      {modal?.type === 'receipt' && ms && (
        <Mdl title={`Receipt · ${modal.inst.receiptNo}`} onClose={() => setModal({ type: 'view', sid: ms.id })} wide>
          <ReceiptDoc inst={modal.inst} semFee={modal.semFee} student={ms} cfg={cfg} />
        </Mdl>
      )}
      {modal?.type === 'regform' && <RegFormModal student={modal.sid ? ms : null} cfg={cfg} onClose={() => setModal(null)} onSaveCfg={setCfg} />}
      {modal?.type === 'report' && <OutstandingReport students={students} cfg={cfg} onClose={() => setModal(null)} />}
    </div>
  );
}
