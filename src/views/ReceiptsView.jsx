import { useState, useMemo } from 'react';
import { Search, X, Printer, ShoppingBag, CreditCard } from 'lucide-react';
import { T, PMETHODS } from '../constants/index.js';
import { fmtMoney, fmtDate } from '../utils/formatters.js';
import { Th, Td, Btn, Pill, Mdl } from '../components/ui/BaseUI.jsx';
import { ReceiptDoc } from '../components/receipts/ReceiptDoc.jsx';

// ── RECEIPTS VIEW ─────────────────────────────────────────────────────────────
export function ReceiptsView({ students, cfg, finances }) {
  const [q, setQ] = useState('');
  const [fType, setFType] = useState('all');
  const [fSem, setFSem] = useState('');
  const [fYear, setFYear] = useState('');
  const [fMethod, setFMethod] = useState('');
  const [sel, setSel] = useState(null);

  const all = useMemo(() => {
    const rows = [];

    // 1. Tuition Fee Receipts
    (students || []).forEach((s) => {
      (s.semFees || []).forEach((sf) => {
        (sf.installments || []).forEach((inst) => {
          rows.push({
            id: `TUITION_${inst.id}`,
            inst,
            semFee: sf,
            student: s,
            category: 'Tuition Fee',
            type: 'tuition',
            receiptNo: inst.receiptNo,
            date: inst.date,
            method: inst.method || 'Cash',
            amount: inst.amount,
            sem: sf.sem,
            year: sf.year,
          });
        });
      });

      // 2. Starter Package / Registration Receipts
      const pkg = s.initialPackage;
      if (pkg && (pkg.paidNow || pkg.receiptNo)) {
        const pkgTotal =
          (pkg.admission?.enabled ? Number(pkg.admission.amount) || 0 : 0) +
          (pkg.books?.enabled ? Number(pkg.books.amount) || 0 : 0) +
          (pkg.uniform?.enabled ? Number(pkg.uniform.amount) || 0 : 0) +
          (pkg.custom?.enabled ? Number(pkg.custom.amount) || 0 : 0);

        if (pkgTotal > 0) {
          const recNo = pkg.receiptNo || `REC-${s.year || cfg.currentYear}-${s.id.slice(-4)}`;
          rows.push({
            id: `PKG_${s.id}`,
            inst: {
              id: `PKG_INST_${s.id}`,
              receiptNo: recNo,
              amount: pkgTotal,
              date: pkg.date || s.enrolledOn,
              method: pkg.method || 'Cash',
              note: 'Registration & Starter Package (Admission, Books & Uniforms)',
              isStarterPkg: true,
            },
            student: s,
            pkg,
            category: 'Registration & Starter Bundle',
            type: 'package',
            receiptNo: recNo,
            date: pkg.date || s.enrolledOn,
            method: pkg.method || 'Cash',
            amount: pkgTotal,
            sem: s.semester || cfg.currentSemester,
            year: s.year || cfg.currentYear,
          });
        }
      }
    });

    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [students, cfg]);

  const list = all.filter((r) => {
    const qn = q.toLowerCase();
    const matchQ =
      !qn ||
      r.receiptNo.toLowerCase().includes(qn) ||
      r.student.name.toLowerCase().includes(qn) ||
      r.student.id.toLowerCase().includes(qn);
    const matchType = fType === 'all' || r.type === fType;
    const matchSem = !fSem || String(r.sem) === fSem;
    const matchYear = !fYear || String(r.year) === fYear;
    const matchMethod = !fMethod || (r.method || '') === fMethod;

    return matchQ && matchType && matchSem && matchYear && matchMethod;
  });

  const totalCollected = list.reduce((s, r) => s + Number(r.amount || 0), 0);
  const years = [...new Set(all.map((r) => r.year))].filter(Boolean).sort((a, b) => b - a);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>Receipts & Billing Records</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: '3px 0 0' }}>
            {list.length} receipt{list.length !== 1 ? 's' : ''} · {fmtMoney(totalCollected)} total collected
          </p>
        </div>
      </div>

      <div style={{
        background: 'white', borderRadius: 11, padding: 13, boxShadow: T.shadow,
        marginBottom: 12, display: 'flex', gap: 9, flexWrap: 'wrap',
      }}>
        <div style={{
          flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 7,
          border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px',
        }}>
          <Search size={14} color={T.muted} />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search receipt no., student name or ID…"
            style={{ border: 'none', outline: 'none', fontSize: 14, flex: 1, background: 'none' }}
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
          value={fType} onChange={(e) => setFType(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 13, background: 'white', color: T.text }}
        >
          <option value="all">All Receipt Types</option>
          <option value="tuition">Tuition Fee Receipts</option>
          <option value="package">Registration & Starter Bundles</option>
        </select>

        <select
          value={fSem} onChange={(e) => setFSem(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 13, background: 'white', color: T.text }}
        >
          <option value="">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>

        <select
          value={fYear} onChange={(e) => setFYear(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 13, background: 'white', color: T.text }}
        >
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          value={fMethod} onChange={(e) => setFMethod(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 13, background: 'white', color: T.text }}
        >
          <option value="">All Methods</option>
          {PMETHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: 12, boxShadow: T.shadow, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th c="Receipt No." />
              <Th c="Student" />
              <Th c="Type / Category" />
              <Th c="Method" />
              <Th c="Amount" right />
              <Th c="Date" />
              <Th c="" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 36, color: T.muted, fontSize: 14 }}>
                  No receipts match the current filters.
                </td>
              </tr>
            ) : list.map((r) => {
              const isPkg = r.type === 'package';
              return (
                <tr key={r.id}>
                  <Td s={{ fontFamily: 'monospace', fontSize: 12, color: T.muted, fontWeight: 700 }}>
                    {r.receiptNo}
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{r.student.name}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{r.student.id} · {r.student.level}</div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isPkg ? <ShoppingBag size={14} color={T.sky} /> : <CreditCard size={14} color={T.green} />}
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.category}</span>
                    </div>
                    {r.inst.note && <div style={{ fontSize: 11, color: T.muted }}>{r.inst.note}</div>}
                  </Td>
                  <Td><Pill label={r.method || '—'} color={T.sky} /></Td>
                  <Td s={{ fontWeight: 800, color: T.green, textAlign: 'right', fontSize: 14 }}>
                    +{fmtMoney(r.amount)}
                  </Td>
                  <Td s={{ color: T.muted, fontSize: 13 }}>{fmtDate(r.date)}</Td>
                  <Td>
                    <Btn sm v="outline" onClick={() => setSel(r)}>
                      <Printer size={12} />Print
                    </Btn>
                  </Td>
                </tr>
              );
            })}
            {list.length > 0 && (
              <tr style={{ background: '#F8FAFC' }}>
                <td colSpan={4} style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: T.text }}>
                  Total Collected ({list.length} receipts)
                </td>
                <td style={{ padding: '12px 14px', fontSize: 15, fontWeight: 900, color: T.green, textAlign: 'right' }}>
                  {fmtMoney(totalCollected)}
                </td>
                <td colSpan={2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sel && (
        <Mdl title={`Receipt · ${sel.receiptNo}`} onClose={() => setSel(null)} wide>
          <ReceiptDoc
            inst={sel.inst}
            semFee={sel.semFee}
            student={sel.student}
            cfg={cfg}
            pkg={sel.pkg}
          />
        </Mdl>
      )}
    </div>
  );
}
