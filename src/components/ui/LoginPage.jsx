import { useState } from 'react';
import {
  GraduationCap, Users, DollarSign, CreditCard, ClipboardList, Lock,
} from 'lucide-react';
import { T } from '../../constants/index.js';
import { Inp, Btn } from './BaseUI.jsx';

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
export function LoginPage({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const go = () => {
    setBusy(true);
    setTimeout(() => {
      if ((u === 'admin' || u === 'sageampang@gmail.com') && p === 'Sageadmin123') {
        onLogin();
      } else {
        setErr('Invalid credentials');
        setBusy(false);
      }
    }, 700);
  };

  const features = [
    { I: Users,         l: 'Student Registry',      d: 'Register & manage student records' },
    { I: DollarSign,    l: 'Instalment Payments',    d: 'Full, partial & instalment fee tracking' },
    { I: CreditCard,    l: 'ID Card Generator',      d: 'Auto-generate printable student cards' },
    { I: ClipboardList, l: 'Registration Forms',     d: 'Editable A4 forms with parent signature' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui,sans-serif' }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        background: `linear-gradient(145deg,${T.navy},${T.navyLt})`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 48,
      }}>
        <div style={{ color: 'white', maxWidth: 340, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, background: T.sky, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <GraduationCap size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 4px' }}>SAGE School</h1>
          <p style={{ opacity: .6, margin: '0 0 36px', fontSize: 14 }}>Administration Portal</p>

          {features.map((f) => (
            <div key={f.l} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              textAlign: 'left', marginBottom: 16,
            }}>
              <div style={{
                background: 'rgba(255,255,255,.12)', borderRadius: 9,
                padding: 9, flexShrink: 0,
              }}>
                <f.I size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.l}</div>
                <div style={{ fontSize: 12, opacity: .5, marginTop: 1 }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{
        width: 430, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 48, background: 'white',
      }}>
        <div style={{ maxWidth: 320, width: '100%' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: T.muted, margin: '0 0 24px' }}>Sign in to your admin account</p>

          <Inp label="Username" value={u} onChange={(e) => setU(e.target.value)} placeholder="admin" />
          <Inp
            label="Password" type="password"
            value={p} onChange={(e) => setP(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && go()}
          />

          {err && (
            <div style={{
              background: '#FEE2E2', color: '#991B1B',
              padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12,
            }}>
              {err}
            </div>
          )}

          <Btn full onClick={go} disabled={busy} style={{ padding: '10px 16px' }}>
            <Lock size={14} />{busy ? 'Signing in…' : 'Sign In'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
