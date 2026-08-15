import { LEVELS } from '../constants/index.js';
import { fmtMoney } from './formatters.js';

// ── PAYMENT HELPERS ───────────────────────────────────────────────────────────

/** Find the semFee record for the current semester/year in cfg */
export const semFeeOf = (student, cfg) =>
  (student.semFees || []).find(
    (sf) => sf.sem === cfg.currentSemester && sf.year === cfg.currentYear,
  );

/** Calculate totals for a semFee record */
export const semTotals = (sf) => {
  if (!sf) return { due: 0, paid: 0, balance: 0 };
  const paid = (sf.installments || []).reduce((s, i) => s + i.amount, 0);
  return { due: sf.totalDue, paid, balance: Math.max(0, sf.totalDue - paid) };
};

/** Return 'paid' | 'partial' | 'unpaid' for the current semester */
export const payStatus = (student, cfg) => {
  const sf = semFeeOf(student, cfg);
  if (!sf || !sf.installments?.length) return 'unpaid';
  const { due, paid } = semTotals(sf);
  if (paid >= due) return 'paid';
  return 'partial';
};

/** Suggest a fee amount based on the student's level and the fee schedule */
export const suggestFeeAmt = (level, fees = [], discount = 'None') => {
  const l = (level || '').toLowerCase().trim();
  const m = (fees || []).find((f) => {
    const fl = (f.label || '').toLowerCase().trim();
    return fl === l || l.includes(fl) || fl.includes(l);
  });
  let baseAmt = m?.amount || 0;
  if (discount === '2nd Sibling (15%)') {
    baseAmt = baseAmt * 0.85;
  } else if (discount === '3rd Sibling (25%)') {
    baseAmt = baseAmt * 0.75;
  }
  return baseAmt;
};

/** True if the student is withdrawn or graduated */
export const isArchived = (s) =>
  s.status === 'withdrawn' || s.status === 'graduated';

/** Advance to the next level in the LEVELS list */
export const nextLevel = (level) => {
  const i = LEVELS.indexOf(level);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1] : level;
};

// ── 6-MONTH SEMESTER MONTHLY HELPERS ─────────────────────────────────────────

const SEM1_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const SEM2_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getSemesterMonths = (sem) => {
  return Number(sem) === 1 ? SEM1_MONTHS : SEM2_MONTHS;
};

/**
 * Calculates a 6-month breakdown for a semester fee with 'monthly' or 'full' plan
 */
export const calcMonthlySchedule = (semFee) => {
  if (!semFee) return [];
  const months = getSemesterMonths(semFee.sem);
  const totalDue = Number(semFee.totalDue) || 0;
  const monthlyDue = Math.round((totalDue / 6) * 100) / 100;
  const totalPaid = (semFee.installments || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);

  let remainingPaid = totalPaid;

  return months.map((monthName, idx) => {
    // For the last month, reconcile any rounding cents
    const dueForThisMonth = idx === 5 ? Math.max(0, totalDue - monthlyDue * 5) : monthlyDue;
    let paidForThisMonth = 0;

    if (remainingPaid >= dueForThisMonth) {
      paidForThisMonth = dueForThisMonth;
      remainingPaid -= dueForThisMonth;
    } else if (remainingPaid > 0) {
      paidForThisMonth = remainingPaid;
      remainingPaid = 0;
    }

    const balance = Math.max(0, dueForThisMonth - paidForThisMonth);
    let status = 'unpaid';
    if (paidForThisMonth >= dueForThisMonth && dueForThisMonth > 0) {
      status = 'paid';
    } else if (paidForThisMonth > 0) {
      status = 'partial';
    }

    return {
      monthIndex: idx + 1,
      monthName,
      label: `Month ${idx + 1} (${monthName})`,
      due: dueForThisMonth,
      paid: paidForThisMonth,
      balance,
      status,
    };
  });
};

/** Generate a pre-filled WhatsApp message for a fee reminder */
export const waMsg = (s, cfg) => {
  const sf = semFeeOf(s, cfg);
  const t  = semTotals(sf);
  const bal =
    t.balance > 0
      ? `Balance outstanding: *${fmtMoney(t.balance)}*`
      : 'No payment recorded yet for this semester.';
  return (
    `Assalamualaikum / Good day, *${s.parentName || 'Parent/Guardian'}*,\n\n` +
    `This is a friendly reminder from *${cfg.schoolName}* regarding your child *${s.name}* (${s.level}).\n\n` +
    `Semester ${cfg.currentSemester}, ${cfg.currentYear} fee:\n${bal}\n\n` +
    `Kindly settle the outstanding amount at your earliest convenience. ` +
    `Please contact us at ${cfg.phone} for any queries.\n\n` +
    `Thank you.\n_${cfg.schoolName} Administration_`
  );
};

