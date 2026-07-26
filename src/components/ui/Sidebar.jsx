import {
  LayoutDashboard, Users, FileText, Settings,
  GraduationCap, LogOut, Wallet
} from 'lucide-react';
import { T } from '../../constants/index.js';

// ── NAV ITEMS (with icon references resolved here) ────────────────────────────
const NAV = [
  { id: 'dashboard', l: 'Dashboard', I: LayoutDashboard },
  { id: 'finance',   l: 'Finance',   I: Wallet          },
  { id: 'students',  l: 'Students',  I: Users           },
  { id: 'receipts',  l: 'Receipts',  I: FileText        },
  { id: 'settings',  l: 'Settings',  I: Settings        },
];

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
export function Sidebar({ active, go, school, onOut }) {
  return (
    <div style={{ width: 214, background: T.navy, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo / School name */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: T.sky, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <GraduationCap size={17} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>{school}</div>
            <div style={{ color: 'rgba(255,255,255,.38)', fontSize: 10 }}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV.map(({ id, l, I }) => (
          <button
            key={id}
            onClick={() => go(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', padding: '9px 10px', borderRadius: 8,
              border: 'none', cursor: 'pointer', marginBottom: 2,
              background: active === id ? T.sky : 'transparent',
              color: active === id ? 'white' : 'rgba(255,255,255,.48)',
              fontWeight: active === id ? 600 : 400,
              fontSize: 13, textAlign: 'left',
            }}
          >
            <I size={16} />{l}
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <button
          onClick={onOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            width: '100%', padding: '9px 10px', borderRadius: 8,
            border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.05)',
            color: 'rgba(255,255,255,.4)', fontSize: 13,
          }}
        >
          <LogOut size={15} />Sign Out
        </button>
      </div>
    </div>
  );
}

// ── TOP BAR ───────────────────────────────────────────────────────────────────
export function TopBar({ cfg }) {
  return (
    <div style={{
      padding: '12px 22px', background: 'white',
      borderBottom: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
    }}>
      <span style={{ fontSize: 13, color: T.muted }}>
        Academic Year {cfg.currentYear} · Semester {cfg.currentSemester}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 32, height: 32, background: T.sky, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: 13,
        }}>
          A
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Administrator</div>
          <div style={{ fontSize: 11, color: T.muted }}>System Admin</div>
        </div>
      </div>
    </div>
  );
}
