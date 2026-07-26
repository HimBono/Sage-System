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
export const suggestFeeAmt = (level, fees, discount = 'None') => {
  const l = (level || '').toLowerCase();
  const m = fees.find((f) => {
    const fl = f.label.toLowerCase();
    if ((l.includes('primary 1') || l.includes('primary 2') || l.includes('primary 3')) && fl.includes('primary 1')) return true;
    if ((l.includes('primary 4') || l.includes('primary 5') || l.includes('primary 6')) && fl.includes('primary 4')) return true;
    if ((l.includes('secondary 1') || l.includes('secondary 2') || l.includes('secondary 3')) && fl.includes('secondary 1')) return true;
    if ((l.includes('secondary 4') || l.includes('secondary 5')) && fl.includes('secondary 4')) return true;
    if (l.includes('6') && fl.includes('sixth')) return true;
    return false;
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
