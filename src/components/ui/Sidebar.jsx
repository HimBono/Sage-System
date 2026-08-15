import {
  LayoutDashboard, Users, FileText, Settings,
  GraduationCap, LogOut, Wallet, Menu, X
} from 'lucide-react';
import { T } from '../../constants/index.js';

// ── NAV ITEMS ─────────────────────────────────────────────────────────────────
export const NAV = [
  { id: 'dashboard', l: 'Dashboard', I: LayoutDashboard },
  { id: 'finance',   l: 'Finance',   I: Wallet          },
  { id: 'students',  l: 'Students',  I: Users           },
  { id: 'receipts',  l: 'Receipts',  I: FileText        },
  { id: 'settings',  l: 'Settings',  I: Settings        },
];

// ── SIDEBAR (DESKTOP + MOBILE DRAWER) ──────────────────────────────────────────
export function Sidebar({ active, go, school, onOut, mobileOpen, setMobileOpen }) {
  const content = (
    <div style={{
      width: 220, background: T.navy, display: 'flex',
      flexDirection: 'column', height: '100%',
    }}>
      {/* Logo / School name */}
      <div style={{
        padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: T.sky, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <GraduationCap size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{school}</div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 10 }}>Admin Portal</div>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,.6)',
              padding: 4, cursor: 'pointer', display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav style={{ padding: '14px 8px', flex: 1, overflowY: 'auto' }}>
        {NAV.map(({ id, l, I }) => (
          <button
            key={id}
            onClick={() => {
              go(id);
              if (setMobileOpen) setMobileOpen(false);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: 'none', cursor: 'pointer', marginBottom: 3,
              background: active === id ? T.sky : 'transparent',
              color: active === id ? 'white' : 'rgba(255,255,255,.55)',
              fontWeight: active === id ? 700 : 500,
              fontSize: 13, textAlign: 'left',
              transition: 'background .15s',
            }}
          >
            <I size={17} />{l}
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <button
          onClick={onOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.06)',
            color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 500,
          }}
        >
          <LogOut size={16} />Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="desktop-sidebar" style={{ display: 'flex', flexShrink: 0 }}>
        {content}
      </div>

      {/* Mobile drawer backdrop and overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 999, display: 'flex',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 240, maxWidth: '80vw', height: '100%',
              boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
              animation: 'slideInLeft .2s ease-out',
            }}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}

// ── TOP BAR (WITH MOBILE HAMBURGER) ───────────────────────────────────────────
export function TopBar({ cfg, onOpenMobileMenu }) {
  return (
    <div style={{
      padding: '10px 18px', background: 'white',
      borderBottom: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0, height: 52,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className="mobile-hamburger-btn"
          onClick={onOpenMobileMenu}
          style={{
            display: 'none', background: '#F8FAFC', border: `1px solid ${T.border}`,
            borderRadius: 8, padding: 6, cursor: 'pointer', color: T.text,
          }}
        >
          <Menu size={18} />
        </button>
        <span style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>
          Sem {cfg.currentSemester} · {cfg.currentYear}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 30, height: 30, background: T.sky, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: 12,
        }}>
          A
        </div>
        <div className="topbar-user-info">
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>Administrator</div>
          <div style={{ fontSize: 10, color: T.muted }}>System Admin</div>
        </div>
      </div>
    </div>
  );
}

// ── MOBILE BOTTOM NAVIGATION BAR ──────────────────────────────────────────────
export function MobileBottomNav({ active, go }) {
  return (
    <div className="mobile-bottom-nav" style={{
      display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: `1px solid ${T.border}`,
      zIndex: 40, height: 56, justifyContent: 'space-around', alignItems: 'center',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
    }}>
      {NAV.map(({ id, l, I }) => {
        const isSel = active === id;
        return (
          <button
            key={id}
            onClick={() => go(id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              flex: 1, padding: '6px 0',
              color: isSel ? T.sky : T.muted,
            }}
          >
            <I size={18} />
            <span style={{ fontSize: 10, fontWeight: isSel ? 700 : 500, marginTop: 2 }}>{l}</span>
          </button>
        );
      })}
    </div>
  );
}
