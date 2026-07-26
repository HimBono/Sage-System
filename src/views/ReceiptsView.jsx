import { useState, useMemo } from 'react';
import { Search, X, Printer } from 'lucide-react';
import { T, PMETHODS } from '../constants/index.js';
import { fmtMoney, fmtDate } from '../utils/formatters.js';
import { Th, Td, Btn, Pill, Mdl } from '../components/ui/BaseUI.jsx';
import { ReceiptDoc } from '../components/receipts/ReceiptDoc.jsx';

// ── RECEIPTS VIEW ─────────────────────────────────────────────────────────────
export function ReceiptsView({ students, cfg }) {
  const [q, setQ] = useState('');
  const [fSem, setFSem] = useState('');
  const [fYear, setFYear] = useState('');
  const [fMethod, setFMethod] = useState('');
  const [sel, setSel] = useState(null);

  const all = useMemo(() => {
    const rows = [];
    students.forEach((s) =>
      (s.semFees || []).forEach((sf) =>
        sf.installments.forEach((inst) => rows.push({ inst, semFee: sf, student: s }))
      )
    );
    return rows.sort((a, b) => new Date(b.inst.date) - new Date(a.inst.date));
  }, [students]);

  const list = all.filter((r) => {
    const qn = q.toLowerCase();
    return (
      (!qn || r.inst.receiptNo.toLowerCase().includes(qn) || r.student.name.toLowerCase().includes(qn) || r.student.id.toLowerCase().includes(qn))
      && (!fSem || String(r.semFee.sem) === fSem)
      && (!fYear || String(r.semFee.year) === fYear)
      && (!fMethod || (r.inst.method || '') === fMethod)
    );
  });

  const totalCollected = list.reduce((s, r) => s + r.inst.amount, 0);
  const years = [...new Set(all.map((r) => r.semFee.year))].sort((a, b) => b - a);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>Receipts</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: '3px 0 0' }}>
            {list.length} receipt{list.length !== 1 ? 's' : ''} · {fmtMoney(totalCollected)} shown
          </p>
        </div>
      </div>

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
            placeholder="Receipt no., student name or ID…"
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
          value={fSem} onChange={(e) => setFSem(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 14, background: 'white', color: T.text }}
        >
          <option value="">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
        <select
          value={fYear} onChange={(e) => setFYear(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 14, background: 'white', color: T.text }}
        >
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={fMethod} onChange={(e) => setFMethod(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 14, background: 'white', color: T.text }}
        >
          <option value="">All Methods</option>
          {PMETHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: 12, boxShadow: T.shadow }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th c="Receipt No." />
              <Th c="Student" />
              <Th c="Semester" />
              <Th c="Method" />
              <Th c="Amount" right />
              <Th c="Balance After" right />
              <Th c="Date" />
              <Th c="" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 36, color: T.muted, fontSize: 14 }}>
                  No receipts match the current filters.
                </td>
              </tr>
            ) : list.map(({ inst: p, semFee: sf, student: s }) => {
              const instIdx = sf.installments.findIndex((i) => i.id === p.id) + 1;
              const paidToDate = sf.installments.slice(0, instIdx).reduce((sum, i) => sum + i.amount, 0);
              const bal = Math.max(0, sf.totalDue - paidToDate);
              return (
                <tr key={p.id}>
                  <Td s={{ fontFamily: 'monospace', fontSize: 12, color: T.muted }}>{p.receiptNo}</Td>
                  <Td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{s.id}</div>
                  </Td>
                  <Td>
                    <div>Sem {sf.sem}, {sf.year}</div>
                    {sf.installments.length > 1 && (
                      <div style={{ fontSize: 11, color: T.orange }}>Inst. {instIdx}/{sf.installments.length}</div>
                    )}
                  </Td>
                  <Td><Pill label={p.method || '—'} color={T.sky} /></Td>
                  <Td s={{ fontWeight: 700, color: T.green, textAlign: 'right' }}>{fmtMoney(p.amount)}</Td>
                  <Td s={{ fontWeight: 600, color: bal > 0 ? T.orange : T.green, textAlign: 'right' }}>{fmtMoney(bal)}</Td>
                  <Td s={{ color: T.muted }}>{fmtDate(p.date)}</Td>
                  <Td>
                    <Btn sm v="outline" onClick={() => setSel({ inst: p, semFee: sf, student: s })}>
                      <Printer size={12} />Print
                    </Btn>
                  </Td>
                </tr>
              );
            })}
            {list.length > 0 && (
              <tr style={{ background: '#F8FAFC' }}>
                <td colSpan={4} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: T.text }}>
                  Total shown ({list.length} receipts)
                </td>
                <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 800, color: T.green, textAlign: 'right' }}>
                  {fmtMoney(totalCollected)}
                </td>
                <td colSpan={3} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sel && (
        <Mdl title={`Receipt · ${sel.inst.receiptNo}`} onClose={() => setSel(null)} wide>
          <ReceiptDoc inst={sel.inst} semFee={sel.semFee} student={sel.student} cfg={cfg} />
        </Mdl>
      )}
    </div>
  );
}
