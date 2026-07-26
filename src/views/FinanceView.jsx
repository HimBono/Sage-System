import { useState } from 'react';
import { 
  Plus, Trash2, Edit2, Wallet, 
  Users, Bell, Calendar, DollarSign 
} from 'lucide-react';
import { T } from '../constants/index.js';
import { fmtMoney, fmtDate, genId } from '../utils/formatters.js';
import { Btn, Th, Td, Inp, Sel, Mdl, Txta } from '../components/ui/BaseUI.jsx';

export function FinanceView({ finances, setFinances }) {
  const [tab, setTab] = useState('expenses');
  const [modal, setModal] = useState(null);

  const totalExpenses = finances.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = finances.teachers.reduce((sum, t) => sum + t.salary, 0);

  const TB = ({ t, l, I }) => (
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
    </button>
  );

  const delItem = (type, id) => {
    if (window.confirm('Delete this record permanently?')) {
      setFinances(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item.id !== id)
      }));
    }
  };

  const SC = ({ l, val, I, color }) => (
    <div style={{ background: 'white', borderRadius: 12, padding: '18px 20px', boxShadow: T.shadow, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 7 }}>{l}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: T.text }}>{val}</div>
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
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Manage expenses, payroll, and upcoming reminders</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <SC l="Total Expenses" val={fmtMoney(totalExpenses)} I={Wallet} color={T.orange} />
        <SC l="Monthly Payroll" val={fmtMoney(totalSalaries)} I={Users} color={T.purple} />
        <SC l="Active Reminders" val={finances.reminders.length} I={Bell} color={T.sky} />
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${T.border}`, display: 'flex', marginBottom: 16, background: 'white', borderRadius: '12px 12px 0 0', padding: '0 12px' }}>
        <TB t="expenses" l="Expenses" I={Wallet} />
        <TB t="teachers" l="Teacher Payroll" I={Users} />
        <TB t="reminders" l="Reminders" I={Bell} />
      </div>

      {/* EXPENSES TAB */}
      {tab === 'expenses' && (
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', boxShadow: T.shadow, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Recorded Expenses</div>
            <Btn sm onClick={() => setModal({ type: 'add_expense' })}><Plus size={13} />Add Expense</Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th c="Date" /><Th c="Category" /><Th c="Description" /><Th c="Amount" right /><Th c="Recurring" /><Th c="" /></tr>
            </thead>
            <tbody>
              {finances.expenses.map(e => (
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
              {finances.expenses.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: T.muted }}>No expenses recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* TEACHERS TAB */}
      {tab === 'teachers' && (
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', boxShadow: T.shadow, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Teacher Directory & Payroll</div>
            <Btn sm onClick={() => setModal({ type: 'add_teacher' })}><Plus size={13} />Add Teacher</Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th c="Name" /><Th c="Joined" /><Th c="Notes" /><Th c="Monthly Salary" right /><Th c="" /></tr>
            </thead>
            <tbody>
              {finances.teachers.map(t => (
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
              {finances.teachers.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: T.muted }}>No teachers recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* REMINDERS TAB */}
      {tab === 'reminders' && (
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', boxShadow: T.shadow, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Upcoming Reminders</div>
            <Btn sm onClick={() => setModal({ type: 'add_reminder' })}><Plus size={13} />Add Reminder</Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th c="Due Date" /><Th c="Title" /><Th c="Amount" right /><Th c="" /></tr>
            </thead>
            <tbody>
              {finances.reminders.map(r => {
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
              {finances.reminders.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: T.muted }}>No active reminders.</td></tr>}
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
  const [f, setF] = useState({});
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));

  const save = () => {
    if (modal.type === 'add_expense') {
      const e = { id: genId('EXP'), category: f.category || 'Other', amount: Number(f.amount), date: f.date || new Date().toISOString().split('T')[0], description: f.description, recurring: !!f.recurring };
      setFinances(prev => ({ ...prev, expenses: [...prev.expenses, e] }));
    } else if (modal.type === 'add_teacher') {
      const t = { id: genId('TCH'), name: f.name, salary: Number(f.salary), notes: f.notes, joinedDate: f.joinedDate || new Date().toISOString().split('T')[0] };
      setFinances(prev => ({ ...prev, teachers: [...prev.teachers, t] }));
    } else if (modal.type === 'add_reminder') {
      const r = { id: genId('REM'), title: f.title, dueDate: f.dueDate, amount: Number(f.amount) || null };
      setFinances(prev => ({ ...prev, reminders: [...prev.reminders, r] }));
    }
    setModal(null);
  };

  let title = '';
  if (modal.type === 'add_expense') title = 'Record Expense';
  if (modal.type === 'add_teacher') title = 'Add Teacher';
  if (modal.type === 'add_reminder') title = 'Add Reminder';

  return (
    <Mdl title={title} onClose={() => setModal(null)}>
      <div style={{ padding: 20 }}>
        {modal.type === 'add_expense' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Sel label="Category" value={f.category} onChange={e => u('category', e.target.value)}>
              <option value="">Select...</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Supplies">Supplies</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </Sel>
            <Inp label="Amount (RM)" type="number" value={f.amount} onChange={e => u('amount', e.target.value)} />
            <Inp label="Date" type="date" value={f.date} onChange={e => u('date', e.target.value)} />
            <div style={{ alignSelf: 'center', marginTop: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={f.recurring} onChange={e => u('recurring', e.target.checked)} />
                Recurring Monthly Expense
              </label>
            </div>
            <Txta col="1/-1" label="Description" value={f.description} onChange={e => u('description', e.target.value)} />
          </div>
        )}

        {modal.type === 'add_teacher' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Inp col="1/-1" label="Teacher Name" value={f.name} onChange={e => u('name', e.target.value)} />
            <Inp label="Monthly Salary (RM)" type="number" value={f.salary} onChange={e => u('salary', e.target.value)} />
            <Inp label="Joined Date" type="date" value={f.joinedDate} onChange={e => u('joinedDate', e.target.value)} />
            <Txta col="1/-1" label="Notes / Roles" value={f.notes} onChange={e => u('notes', e.target.value)} placeholder="e.g., Senior English Teacher, Class 1A Form Teacher" />
          </div>
        )}

        {modal.type === 'add_reminder' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Inp col="1/-1" label="Reminder Title" value={f.title} onChange={e => u('title', e.target.value)} />
            <Inp label="Due Date" type="date" value={f.dueDate} onChange={e => u('dueDate', e.target.value)} />
            <Inp label="Expected Amount (RM) - Optional" type="number" value={f.amount} onChange={e => u('amount', e.target.value)} />
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
