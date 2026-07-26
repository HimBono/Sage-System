// ── THEME ─────────────────────────────────────────────────────────────────────
export const T = {
  navy:   '#0F2240',
  navyLt: '#1A3A60',
  sky:    '#0EA5E9',
  bg:     '#EEF2F7',
  white:  '#FFFFFF',
  green:  '#10B981',
  amber:  '#F59E0B',
  orange: '#F97316',
  red:    '#EF4444',
  purple: '#8B5CF6',
  text:   '#1E293B',
  muted:  '#64748B',
  border: '#E2E8F0',
  shadow: '0 1px 3px rgba(0,0,0,0.08)',
};

export const PAL = [T.sky, T.purple, T.green, T.amber, T.red];

export const LEVELS = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Secondary 5',
  'Lower 6', 'Upper 6',
];

export const PMETHODS = ['Cash', 'Bank Transfer', 'Online Banking', 'Cheque', 'Other'];

export const STATUSES = ['active', 'inactive', 'withdrawn', 'graduated'];

export const NAV = [
  { id: 'dashboard', l: 'Dashboard',  I: null },
  { id: 'students',  l: 'Students',   I: null },
  { id: 'receipts',  l: 'Receipts',   I: null },
  { id: 'settings',  l: 'Settings',   I: null },
];
