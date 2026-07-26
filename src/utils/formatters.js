import { PAL } from '../constants/index.js';

// ── DATE / MONEY FORMATTERS ───────────────────────────────────────────────────
export const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-MY', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return d;
  }
};

export const fmtMoney = (n) =>
  `RM ${parseFloat(n || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;

// ── STRING HELPERS ────────────────────────────────────────────────────────────
export const inits = (name) =>
  (name || '').trim().split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

export const pal = (id) =>
  PAL[(id || 'A').charCodeAt((id || 'A').length - 1) % PAL.length];

// ── ID / RECEIPT GENERATORS ───────────────────────────────────────────────────
export const genId  = (p) => p + Math.random().toString(36).slice(2, 7).toUpperCase();
export const genRec = (yr) => `REC${yr}${String(Date.now()).slice(-4)}`;

// ── DATE HELPER ───────────────────────────────────────────────────────────────
export const today = () => new Date().toISOString().slice(0, 10);

// ── CLIPBOARD ─────────────────────────────────────────────────────────────────
export const copyText = (t) => {
  try { navigator.clipboard.writeText(t); } catch (e) { /* silent */ }
};
