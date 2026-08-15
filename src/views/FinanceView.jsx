import { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Edit2, Wallet, 
  Users, Bell, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Filter, Search
} from 'lucide-react';
import { T, PMETHODS } from '../constants/index.js';
import { fmtMoney, fmtDate, genId, today } from '../utils/formatters.js';
import { Btn, Th, Td, Inp, Sel, Mdl, Txta, NumInp, Pill } from '../components/ui/BaseUI.jsx';

export function FinanceView({ students = [], finances, setFinances }) {
  const [tab, setTab] = useState('incomes');
  const [incomeCat, setIncomeCat] = useState('all');
  const [incomeQuery, setIncomeQuery] = useState('');
  const [modal, setModal] = useState(null);

  // 1. Gather all student-based revenues (tuition + starter packages)
  const studentIncomes = useMemo(() => {
    const rows = [];
    (students || []).forEach((s) => {
      // Tuition installments
      (s.semFees || []).forEach((sf) => {
        (sf.installments || []).forEach((inst) => {
          rows.push({
            id: `TUITION_${inst.id}`,
            date: inst.date,
            receiptNo: inst.receiptNo,
            category: 'Tuition Fee',
            description: `Tuition: ${s.name} (${s.level} - Sem ${sf.sem})`,
            studentName: s.name,
            studentId: s.id,
            method: inst.method || 'Cash',
            amount: Number(inst.amount) || 0,
            isStudentLinked: true,
          });
        });
      });

      // Starter package
      const pkg = s.initialPackage;
      if (pkg && (pkg.paidNow || pkg.receiptNo)) {
        const pkgTotal =
          (pkg.admission?.enabled ? Number(pkg.admission.amount) || 0 : 0) +
          (pkg.books?.enabled ? Number(pkg.books.amount) || 0 : 0) +
          (pkg.uniform?.enabled ? Number(pkg.uniform.amount) || 0 : 0) +
          (pkg.custom?.enabled ? Number(pkg.custom.amount) || 0 : 0);

        if (pkgTotal > 0) {
          const recNo = pkg.receiptNo || `REC-${s.year || 2026}-${s.id.slice(-4)}`;
          rows.push({
            id: `PKG_${s.id}`,
            date: pkg.date || s.enrolledOn,
            receiptNo: recNo,
            category: 'Registration & Materials',
            description: `Starter Package for ${s.name} (Admission, Books & Uniforms)`,
            studentName: s.name,
            studentId: s.id,
            method: pkg.method || 'Cash',
            amount: pkgTotal,
            isStudentLinked: true,
          });
        }
      }
    });
    return rows;
  }, [students]);

  // 2. Manual / External Incomes in finances (non-student)
  const externalIncomes = (finances.incomes || [])
    .filter((inc) => !inc.studentId)
    .map((inc) => ({ ...inc, isStudentLinked: false }));

  // Unified income list
  const unifiedIncomes = useMemo(() => {
    return [...studentIncomes, ...externalIncomes].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [studentIncomes, externalIncomes]);

  const expenses = finances.expenses || [];
  const teachers = finances.teachers || [];
  const reminders = finances.reminders || [];

  const totalIncome   = unifiedIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalSalaries = teachers.reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
  const netBalance    = totalIncome - totalExpenses - totalSalaries;

  const filteredIncomes = useMemo(() => {
    return unifiedIncomes.filter((inc) => {
      const q = incomeQuery.toLowerCase();
      const matchQuery = !q ||
        (inc.description || '').toLowerCase().includes(q) ||
        (inc.studentName || '').toLowerCase().includes(q) ||
        (inc.receiptNo || '').toLowerCase().includes(q) ||
        (inc.category || '').toLowerCase().includes(q);
      const matchCat = incomeCat === 'all' || inc.category === incomeCat;
      return matchQuery && matchCat;
    });
  }, [unifiedIncomes, incomeQuery, incomeCat]);

  const TB = ({ t, l, I, badge }) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '10px 16px', border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: tab === t ? `2px solid ${T.sky}` : '2px solid transparent',
        color: tab === t ? T.sky : T.muted, background: 'none',
      }}
    >
      <I size={16} /> {l}
      {badge !== undefined && (
        <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, background: '#F1F5F9', color: T.muted }}>
          {badge}
        </span>
      )}
    </button>
  );

  const delItem = (type, id) => {
    if (window.confirm('Delete this record permanently?')) {
      setFinances(prev => ({
        ...prev,
        [type]: (prev[type] || []).filter(item => item.id !== id)
      }));
    }
  };

  const SC = ({ l, val, I, color, sub, positive }) => (
    <div style={{ background: 'white', borderRadius: 12, padding: '18px 20px', boxShadow: T.shadow, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 7 }}>{l}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: positive !== undefined ? (positive ? T.green : T.red) : T.text }}>
            {val}
          </div>
          {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{sub}</div>}
        </div>
        <div style={{ width: 44, height: 44, background: color + '1a', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <I size={20} color={color} />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: '0 0 3px' }}>Finance & Operations</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Track school revenue, expenditures, payroll, and cashflow</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <SC l="Total Income" val={fmtMoney(totalIncome)} I={ArrowUpRight} color={T.green} sub={`${incomes.length} revenue entries`} />
        <SC l="Total Expenses" val={fmtMoney(totalExpenses)} I={ArrowDownRight} color={T.orange} sub={`${expenses.length} expense entries`} />
        <SC l="Monthly Payroll" val={fmtMoney(totalSalaries)} I={Users} color={T.purple} sub={`${teachers.length} active teachers`} />
        <SC
          l="Net Cash Flow"
          val={fmtMoney(netBalance)}
          I={TrendingUp}
          color={netBalance >= 0 ? T.sky : T.red}
          positive={netBalance >= 0}
          sub="Income − Expenses − Payroll"
        />
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${T.border}`, display: 'flex', marginBottom: 16, background: 'white', borderRadius: '12px 12px 0 0', padding: '0 12px' }}>
        <TB t="incomes" l="Income & Collections" I={ArrowUpRight} badge={incomes.length} />
        <TB t="expenses" l="Expenses" I={Wallet} badge={expenses.length} />
        <TB t="teachers" l="Teacher Payroll" I={Users} badge={teachers.length} />
        <TB t="reminders" l="Reminders" I={Bell} badge={reminders.length} />
      </div>

      {/* INCOME TAB */}
      {tab === 'incomes' && (
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', boxShadow: T.shadow, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 260 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7, flex: 1,
                border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', background: 'white',
              }}>
                <Search size={14} color={T.muted} />
                <input
                  value={incomeQuery}
                  onChange={(e) => setIncomeQuery(e.target.value)}
                  placeholder="Search receipt, student name, description…"
                  style={{ border: 'none', outline: 'none', fontSize: 13, color: T.text, width: '100%', background: 'none' }}
                />
              </div>
              <select
                value={incomeCat}
                onChange={(e) => setIncomeCat(e.target.value)}
                style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 13, color: T.text, background: 'white' }}
              >
                <option value="all">All Categories</option>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Registration & Materials">Registration & Materials</option>
                <option value="Books & Materials">Books & Materials</option>
                <option value="Uniforms & Clothes">Uniforms & Clothes</option>
                <option value="Donation & Grants">Donation & Grants</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Btn sm v="green" onClick={() => setModal({ type: 'add_income' })}><Plus size={13} />Add Income</Btn>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th c="Date" /><Th c="Receipt" /><Th c="Category" /><Th c="Description / Student" /><Th c="Method" /><Th c="Amount" right /><Th c="" />
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.map((inc) => (
                <tr key={inc.id}>
                  <Td s={{ color: T.muted, fontSize: 13 }}>{fmtDate(inc.date)}</Td>
                  <Td s={{ fontFamily: 'monospace', fontSize: 12, color: T.muted }}>{inc.receiptNo || '—'}</Td>
                  <Td><Pill label={inc.category || 'General'} color={inc.category === 'Tuition Fee' ? T.green : T.sky} /></Td>
                  <Td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{inc.description}</div>
                    {inc.studentName && <div style={{ fontSize: 11, color: T.muted }}>Student: {inc.studentName}</div>}
                  </Td>
                  <Td s={{ fontSize: 12 }}><Pill label={inc.method || 'Cash'} color={T.muted} /></Td>
                  <Td s={{ fontWeight: 800, color: T.green, textAlign: 'right', fontSize: 14 }}>
                    +{fmtMoney(inc.amount)}
                  </Td>
                  <Td>
                    <button
                      onClick={() => delItem('incomes', inc.id)}
                      title="Delete record"
                      style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: T.red }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </Td>
                </tr>
              ))}
              {filteredIncomes.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 28, color: T.muted, fontSize: 13 }}>
                    No income records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* EXPENSES TAB */}
      {tab === 'expenses' && (
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', boxShadow: T.shadow, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Recorded Expenditures</div>
            <Btn sm onClick={() => setModal({ type: 'add_expense' })}><Plus size={13} />Add Expense</Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th c="Date" /><Th c="Category" /><Th c="Description" /><Th c="Amount" right /><Th c="Recurring" /><Th c="" /></tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}>
                  <Td s={{ color: T.muted }}>{fmtDate(e.date)}</Td>
                  <Td s={{ fontWeight: 600 }}>{e.category}</Td>
                  <Td>{e.description}</Td>
                  <Td s={{ fontWeight: 700, color: T.orange, textAlign: 'right' }}>{fmtMoney(e.amount)}</Td>
                  <Td>{e.recurring ? <span style={{ color: T.sky, fontSize: 12, fontWeight: 600 }}>Yes (Monthly)</span> : '-'}</Td>
                  <Td>
                    <button onClick={() => delItem('expenses', e.id)} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: T.red }}><Trash2 size={14} /></button>
                  </Td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: T.muted }}>No expenses recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* TEACHERS TAB */}
      {tab === 'teachers' && (
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', boxShadow: T.shadow, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Teacher Directory & Payroll</div>
            <Btn sm onClick={() => setModal({ type: 'add_teacher' })}><Plus size={13} />Add Teacher</Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th c="Name" /><Th c="Joined" /><Th c="Notes" /><Th c="Monthly Salary" right /><Th c="" /></tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id}>
                  <Td s={{ fontWeight: 600 }}>{t.name}</Td>
                  <Td s={{ color: T.muted }}>{fmtDate(t.joinedDate)}</Td>
                  <Td s={{ fontSize: 12, color: T.muted }}>{t.notes}</Td>
                  <Td s={{ fontWeight: 700, color: T.purple, textAlign: 'right' }}>{fmtMoney(t.salary)}</Td>
                  <Td>
                    <button onClick={() => delItem('teachers', t.id)} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: T.red }}><Trash2 size={14} /></button>
                  </Td>
                </tr>
              ))}
              {teachers.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: T.muted }}>No teachers recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* REMINDERS TAB */}
      {tab === 'reminders' && (
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', boxShadow: T.shadow, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Upcoming Reminders</div>
            <Btn sm onClick={() => setModal({ type: 'add_reminder' })}><Plus size={13} />Add Reminder</Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th c="Due Date" /><Th c="Title" /><Th c="Amount" right /><Th c="" /></tr>
            </thead>
            <tbody>
              {reminders.map(r => {
                const isOverdue = new Date(r.dueDate) < new Date();
                return (
                  <tr key={r.id}>
                    <Td s={{ color: isOverdue ? T.red : T.text, fontWeight: isOverdue ? 700 : 400 }}>
                      <Calendar size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      {fmtDate(r.dueDate)} {isOverdue && '(Overdue)'}
                    </Td>
                    <Td s={{ fontWeight: 600 }}>{r.title}</Td>
                    <Td s={{ textAlign: 'right' }}>{r.amount ? fmtMoney(r.amount) : '—'}</Td>
                    <Td>
                      <button onClick={() => delItem('reminders', r.id)} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: T.green }} title="Mark as done">
                        ✓ Done
                      </button>
                    </Td>
                  </tr>
                );
              })}
              {reminders.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: T.muted }}>No active reminders.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal && <FinanceModal modal={modal} setModal={setModal} setFinances={setFinances} />}
    </div>
  );
}

function FinanceModal({ modal, setModal, setFinances }) {
  const [f, setF] = useState({
    date: today(),
    method: 'Cash',
    category: modal.type === 'add_income' ? 'Tuition Fee' : 'Rent',
  });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));

  const save = () => {
    if (modal.type === 'add_income') {
      const inc = {
        id: genId('INC'),
        date: f.date || today(),
        category: f.category || 'Other',
        description: f.description || 'General Income',
        amount: Number(f.amount) || 0,
        studentName: f.studentName || '',
        receiptNo: f.receiptNo || genId('REC'),
        method: f.method || 'Cash',
      };
      setFinances(prev => ({ ...prev, incomes: [inc, ...(prev.incomes || [])] }));
    } else if (modal.type === 'add_expense') {
      const e = {
        id: genId('EXP'),
        category: f.category || 'Other',
        amount: Number(f.amount) || 0,
        date: f.date || today(),
        description: f.description || '',
        recurring: !!f.recurring,
      };
      setFinances(prev => ({ ...prev, expenses: [...(prev.expenses || []), e] }));
    } else if (modal.type === 'add_teacher') {
      const t = {
        id: genId('TCH'),
        name: f.name || 'Teacher',
        salary: Number(f.salary) || 0,
        notes: f.notes || '',
        joinedDate: f.joinedDate || today(),
      };
      setFinances(prev => ({ ...prev, teachers: [...(prev.teachers || []), t] }));
    } else if (modal.type === 'add_reminder') {
      const r = {
        id: genId('REM'),
        title: f.title || 'Reminder',
        dueDate: f.dueDate || today(),
        amount: Number(f.amount) || null,
      };
      setFinances(prev => ({ ...prev, reminders: [...(prev.reminders || []), r] }));
    }
    setModal(null);
  };

  let title = '';
  if (modal.type === 'add_income') title = 'Record School Income';
  if (modal.type === 'add_expense') title = 'Record Expense';
  if (modal.type === 'add_teacher') title = 'Add Teacher to Payroll';
  if (modal.type === 'add_reminder') title = 'Add Reminder';

  return (
    <Mdl title={title} onClose={() => setModal(null)}>
      <div style={{ padding: 20 }}>
        {modal.type === 'add_income' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Sel label="Income Category" value={f.category} onChange={e => u('category', e.target.value)}>
              <option value="Tuition Fee">Tuition Fee</option>
              <option value="Registration & Materials">Registration & Materials</option>
              <option value="Books & Materials">Books & Materials</option>
              <option value="Uniforms & Clothes">Uniforms & Clothes</option>
              <option value="Donation & Grants">Donation & Grants</option>
              <option value="Events & Activities">Events & Activities</option>
              <option value="Other">Other</option>
            </Sel>
            <NumInp
              label="Amount Received"
              required
              prefix="RM"
              step={50}
              value={f.amount}
              onChange={e => u('amount', e.target.value)}
              placeholder="0.00"
              quickSteps={[100, 200, 500, 1000]}
            />
            <Inp col="1/-1" label="Description" required value={f.description} onChange={e => u('description', e.target.value)} placeholder="e.g., Book fee collection, Term 1 tuition payment" />
            <Inp label="Payer / Student Name" optional value={f.studentName} onChange={e => u('studentName', e.target.value)} placeholder="e.g., Aisyah binti Ahmad" />
            <Sel label="Payment Method" value={f.method} onChange={e => u('method', e.target.value)}>
              {PMETHODS.map(m => <option key={m}>{m}</option>)}
            </Sel>
            <Inp label="Date Received" type="date" value={f.date} onChange={e => u('date', e.target.value)} />
            <Inp label="Receipt No." optional value={f.receiptNo} onChange={e => u('receiptNo', e.target.value)} placeholder="Auto-generated if blank" />
          </div>
        )}

        {modal.type === 'add_expense' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Sel label="Category" value={f.category} onChange={e => u('category', e.target.value)}>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Supplies">Supplies</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </Sel>
            <NumInp
              label="Amount"
              required
              prefix="RM"
              step={50}
              value={f.amount}
              onChange={e => u('amount', e.target.value)}
              placeholder="0.00"
            />
            <Inp label="Date" type="date" value={f.date} onChange={e => u('date', e.target.value)} />
            <div style={{ alignSelf: 'center', marginTop: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={f.recurring} onChange={e => u('recurring', e.target.checked)} />
                Recurring Monthly Expense
              </label>
            </div>
            <Txta col="1/-1" label="Description" optional value={f.description} onChange={e => u('description', e.target.value)} placeholder="Expense details (optional)" />
          </div>
        )}

        {modal.type === 'add_teacher' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Inp col="1/-1" label="Teacher Name" required value={f.name} onChange={e => u('name', e.target.value)} placeholder="Full name" />
            <NumInp
              label="Monthly Salary"
              required
              prefix="RM"
              step={100}
              value={f.salary}
              onChange={e => u('salary', e.target.value)}
              placeholder="0.00"
              quickSteps={[1500, 2000, 2500, 3000, 3500]}
            />
            <Inp label="Joined Date" optional type="date" value={f.joinedDate} onChange={e => u('joinedDate', e.target.value)} />
            <Txta col="1/-1" label="Notes / Roles" optional value={f.notes} onChange={e => u('notes', e.target.value)} placeholder="e.g., Senior English Teacher, Class Form Teacher (optional)" />
          </div>
        )}

        {modal.type === 'add_reminder' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Inp col="1/-1" label="Reminder Title" required value={f.title} onChange={e => u('title', e.target.value)} placeholder="e.g. Pay School Utility Bill" />
            <Inp label="Due Date" required type="date" value={f.dueDate} onChange={e => u('dueDate', e.target.value)} />
            <NumInp
              label="Expected Amount"
              optional
              prefix="RM"
              step={50}
              value={f.amount}
              onChange={e => u('amount', e.target.value)}
              placeholder="0.00"
            />
          </div>
        )}
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Btn v="outline" onClick={() => setModal(null)}>Cancel</Btn>
        <Btn onClick={save}>Save Record</Btn>
      </div>
    </Mdl>
  );
}
