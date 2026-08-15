import {
  Users, CheckCircle, AlertCircle, UserCheck,
  DollarSign, TrendingUp, BookOpen, Zap,
} from 'lucide-react';
import { T, LEVELS } from '../constants/index.js';
import { fmtMoney } from '../utils/formatters.js';
import { semFeeOf, semTotals, payStatus, suggestFeeAmt, isArchived } from '../utils/paymentHelpers.js';
import { SBadge, Av, Th, Td, Btn } from '../components/ui/BaseUI.jsx';

// ── DASHBOARD VIEW ────────────────────────────────────────────────────────────
export function Dashboard({ students, cfg, finances, onRollover }) {
  const active   = students.filter((s) => !isArchived(s));
  const total    = active.length;
  const paid     = active.filter((s) => payStatus(s, cfg) === 'paid').length;
  const partial  = active.filter((s) => payStatus(s, cfg) === 'partial').length;
  const unpaid   = total - paid - partial;
  const archived = students.filter((s) => isArchived(s)).length;
  const now      = new Date();
  const newM     = active.filter((s) => {
    const d = new Date(s.enrolledOn);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const totalExpected = active.reduce((sum, s) => {
    const sf = semFeeOf(s, cfg);
    return sum + (sf ? sf.totalDue : suggestFeeAmt(s.level, cfg.fees, s.discount));
  }, 0);
  const totalCollected  = active.reduce((sum, s) => sum + semTotals(semFeeOf(s, cfg)).paid,    0);
  const totalOutstanding = active.reduce((sum, s) => sum + semTotals(semFeeOf(s, cfg)).balance, 0);

  // 1. Tuition collections from all active students
  const tuitionCollected = active.reduce((sum, s) => {
    return sum + (s.semFees || []).reduce((sSum, sf) => {
      return sSum + (sf.installments || []).reduce((iSum, inst) => iSum + (Number(inst.amount) || 0), 0);
    }, 0);
  }, 0);

  // 2. Starter bundle payments from active students
  const starterPackagesCollected = active.reduce((sum, s) => {
    const pkg = s.initialPackage;
    if (pkg && pkg.paidNow) {
      const bTotal =
        (pkg.admission?.enabled ? Number(pkg.admission.amount) || 0 : 0) +
        (pkg.books?.enabled ? Number(pkg.books.amount) || 0 : 0) +
        (pkg.uniform?.enabled ? Number(pkg.uniform.amount) || 0 : 0) +
        (pkg.custom?.enabled ? Number(pkg.custom.amount) || 0 : 0);
      return sum + bTotal;
    }
    return sum;
  }, 0);

  // 3. Other/manual external revenues recorded in finances (non-student)
  const externalIncomes = (finances?.incomes || [])
    .filter((i) => !i.studentId)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const totalRevenue = tuitionCollected + starterPackagesCollected + externalIncomes;

  const totalExp = (finances?.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalSal = (finances?.teachers || []).reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
  const profit = totalRevenue - totalExp - totalSal;

  const levelBreakdown = LEVELS
    .map((l) => ({ l, count: active.filter((s) => s.level === l).length }))
    .filter((x) => x.count > 0);
  const maxLvl = Math.max(...levelBreakdown.map((x) => x.count), 1);

  // ── Stat card component ──
  const SC = ({ l, val, I, color, sub, money }) => (
    <div style={{
      background: 'white', borderRadius: 12, padding: '16px 18px',
      boxShadow: T.shadow, flex: 1, minWidth: 140,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>{l}</div>
          <div style={{ fontSize: money ? 18 : 24, fontWeight: 900, color: T.text }}>{val}</div>
          {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, background: color + '1a', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <I size={18} color={color} />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: '0 0 3px' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
            Semester {cfg.currentSemester}, {cfg.currentYear} · {cfg.schoolName}
          </p>
        </div>
        {onRollover && (
          <Btn v="outline" sm onClick={onRollover}>🔄 Rollover</Btn>
        )}
      </div>

      {/* Student count stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <SC l="Active Students" val={total}   I={Users}        color={T.sky}    sub={archived ? `+ ${archived} archived` : 'All enrolled'} />
        <SC l="Fully Paid"      val={paid}    I={CheckCircle}  color={T.green}  sub="Current semester" />
        <SC l="Partial"         val={partial} I={Zap}          color={T.orange} sub="Instalments ongoing" />
        <SC l="Unpaid"          val={unpaid}  I={AlertCircle}  color={T.red}    sub="No payment yet" />
      </div>

      {/* Revenue & Profit stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <SC l="Collected Revenue"   val={fmtMoney(totalRevenue)}     I={DollarSign}  color={T.green}  sub="Tuition & Packages" money />
        <SC l="Total Expenses"      val={fmtMoney(totalExp + totalSal)} I={TrendingUp}  color={T.orange} sub="Bills & Payroll" money />
        <SC l="Net Profit"          val={fmtMoney(profit)}           I={CheckCircle} color={profit >= 0 ? T.sky : T.red} sub="Overall balance" money />
        <SC l="Outstanding"         val={fmtMoney(totalOutstanding)} I={AlertCircle} color={T.muted}  sub="Unpaid tuition" money />
      </div>

      {/* Level breakdown + recent students */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18 }}>
        {/* Level chart */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: T.shadow, padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
            <BookOpen size={15} color={T.sky} />Students by Level
          </div>
          {levelBreakdown.length === 0
            ? <div style={{ color: T.muted, fontSize: 13 }}>No data.</div>
            : levelBreakdown.map(({ l, count }) => (
              <div key={l} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: T.text }}>{l}</span>
                  <span style={{ fontWeight: 700, color: T.sky }}>{count}</span>
                </div>
                <div style={{ background: T.border, borderRadius: 99, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: T.sky, borderRadius: 99, width: `${(count / maxLvl) * 100}%` }} />
                </div>
              </div>
            ))}
        </div>

        {/* Recent students */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: T.shadow }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 14, color: T.text }}>
            Recent Students
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><Th c="Student" /><Th c="Level" /><Th c="Status" /></tr>
            </thead>
            <tbody>
              {active.slice(0, 5).map((s) => (
                <tr key={s.id}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Av photo={s.photo} name={s.name} id={s.id} sz={28} r={6} />
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                    </div>
                  </Td>
                  <Td s={{ fontSize: 12 }}>{s.level}</Td>
                  <Td><SBadge s={payStatus(s, cfg)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
