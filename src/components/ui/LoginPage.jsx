import { useState } from 'react';
import {
  GraduationCap, Users, DollarSign, CreditCard, ClipboardList, Lock, Check,
} from 'lucide-react';
import { T } from '../../constants/index.js';
import { Inp, Btn } from './BaseUI.jsx';

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
export function LoginPage({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const go = () => {
    setBusy(true);
    setErr('');
    setTimeout(() => {
      if ((u.toLowerCase() === 'admin' || u.toLowerCase() === 'sageampang@gmail.com') && p === 'Sageadmin123') {
        onLogin(rememberMe);
      } else {
        setErr('Invalid username or password.');
        setBusy(false);
      }
    }, 400);
  };

  const features = [
    { I: Users,         l: 'Student Registry',      d: 'Register & manage student records' },
    { I: DollarSign,    l: 'Instalment Payments',    d: 'Full, partial & instalment fee tracking' },
    { I: CreditCard,    l: 'ID Card Generator',      d: 'Auto-generate printable student cards' },
    { I: ClipboardList, l: 'Registration Forms',     d: 'Editable A4 forms with parent signature' },
  ];

  return (
    <div className="login-wrapper" style={{
      display: 'flex', minHeight: '100vh', width: '100vw',
      fontFamily: '"Inter",system-ui,-apple-system,sans-serif',
      background: '#F8FAFC',
    }}>
      {/* Left panel — hidden on mobile */}
      <div className="login-left-panel" style={{
        flex: 1,
        background: `linear-gradient(145deg, ${T.navy}, ${T.navyLt})`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 40,
      }}>
        <div style={{ color: 'white', maxWidth: 360, textAlign: 'center' }}>
          <div style={{
            width: 68, height: 68, background: T.sky, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
          }}>
            <GraduationCap size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>SAGE International</h1>
          <p style={{ opacity: .7, margin: '0 0 32px', fontSize: 14 }}>School Administration Portal</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {features.map((f) => (
              <div key={f.l} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.14)', borderRadius: 8,
                  padding: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.I size={16} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>{f.l}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="login-right-panel" style={{
        width: 440, maxWidth: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: '32px 24px', background: 'white',
      }}>
        <div style={{ maxWidth: 340, width: '100%' }}>
          {/* Mobile school header */}
          <div className="mobile-only-header" style={{ textAlign: 'center', marginBottom: 24, display: 'none' }}>
            <div style={{
              width: 54, height: 54, background: T.sky, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
            }}>
              <GraduationCap size={28} color="white" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 2px', color: T.text }}>SAGE School</h1>
            <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Admin Portal</p>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: T.muted, margin: '0 0 22px' }}>Sign in to access your administrative dashboard</p>

          <Inp
            label="Username / Email"
            value={u}
            onChange={(e) => setU(e.target.value)}
            placeholder="Username or email"
            autoFocus
          />

          <Inp
            label="Password"
            type="password"
            value={p}
            onChange={(e) => setP(e.target.value)}
            placeholder="Enter password"
            onKeyDown={(e) => e.key === 'Enter' && go()}
          />

          {/* Remember me toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: T.text, userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: T.sky, cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 500 }}>Remember me on this device</span>
            </label>
          </div>

          {err && (
            <div style={{
              background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5',
              padding: '9px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14, fontWeight: 500,
            }}>
              ⚠ {err}
            </div>
          )}

          <Btn full onClick={go} disabled={busy || !u || !p} style={{ padding: '11px 16px', fontSize: 14 }}>
            <Lock size={15} />{busy ? 'Signing in…' : 'Sign In'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
