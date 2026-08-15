import { T } from '../../constants/index.js';
import { inits, pal } from '../../utils/formatters.js';
import { X } from 'lucide-react';

// ── BASE INPUT STYLE ──────────────────────────────────────────────────────────
export const iBase = {
  width: '100%', padding: '8px 12px',
  border: `1px solid ${T.border}`, borderRadius: 8,
  fontSize: 14, color: T.text, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', background: 'white',
};

// ── FIELD WRAPPER ─────────────────────────────────────────────────────────────
export const F = ({ label, required, optional, col, children }) => (
  <div style={{ marginBottom: 12, gridColumn: col }}>
    {label && (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 4,
      }}>
        <label style={{
          display: 'block', fontSize: 11, fontWeight: 700, color: T.muted,
          textTransform: 'uppercase', letterSpacing: '.06em',
        }}>
          {label} {required && <span style={{ color: T.red, fontWeight: 800 }}>*</span>}
        </label>
        {optional && (
          <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, letterSpacing: '.02em' }}>
            (optional)
          </span>
        )}
      </div>
    )}
    {children}
  </div>
);

// ── INPUT ─────────────────────────────────────────────────────────────────────
export const Inp = ({ label, required, optional, col, style: s, ...p }) => (
  <F label={label} required={required} optional={optional} col={col}>
    <input {...p} style={{ ...iBase, ...(s || {}) }} />
  </F>
);

// ── NUMBER PICKER / AMOUNT INPUT ──────────────────────────────────────────────
export const NumInp = ({
  label, required, optional, col, value, onChange, min = 0, max, step = 1,
  prefix, suffix, quickSteps = [], placeholder, style: s, ...p
}) => {
  const numVal = value === '' || value === undefined || value === null ? '' : Number(value);

  const handleStep = (delta) => {
    const current = numVal === '' ? 0 : numVal;
    let next = current + delta;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    onChange({ target: { value: next } });
  };

  return (
    <F label={label} required={required} optional={optional} col={col}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          border: `1px solid ${T.border}`, borderRadius: 8,
          background: 'white', overflow: 'hidden',
          transition: 'border-color 0.15s',
          ...(s || {}),
        }}>
          {prefix && (
            <span style={{
              padding: '0 10px', fontSize: 13, fontWeight: 700,
              color: T.muted, background: '#F8FAFC', borderRight: `1px solid ${T.border}`,
              height: 38, display: 'flex', alignItems: 'center', userSelect: 'none',
            }}>
              {prefix}
            </span>
          )}
          <input
            type="number"
            value={value ?? ''}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            {...p}
            style={{
              flex: 1, padding: '8px 12px', border: 'none',
              outline: 'none', fontSize: 14, color: T.text,
              background: 'transparent', width: '100%', minWidth: 0,
            }}
          />
          {suffix && (
            <span style={{
              padding: '0 10px', fontSize: 12, color: T.muted,
              background: '#F8FAFC', borderLeft: `1px solid ${T.border}`,
              height: 38, display: 'flex', alignItems: 'center', userSelect: 'none',
            }}>
              {suffix}
            </span>
          )}
          <div style={{ display: 'flex', borderLeft: `1px solid ${T.border}`, height: 38 }}>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => handleStep(-step)}
              style={{
                width: 32, border: 'none', background: '#F8FAFC',
                borderRight: `1px solid ${T.border}`, cursor: 'pointer',
                fontSize: 16, fontWeight: 700, color: T.muted, display: 'flex',
                alignItems: 'center', justifyContent: 'center', userSelect: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
            >
              −
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => handleStep(step)}
              style={{
                width: 32, border: 'none', background: '#F8FAFC',
                cursor: 'pointer', fontSize: 16, fontWeight: 700,
                color: T.muted, display: 'flex', alignItems: 'center',
                justifyContent: 'center', userSelect: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
            >
              +
            </button>
          </div>
        </div>
        {quickSteps && quickSteps.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
            {quickSteps.map((qs) => (
              <button
                key={qs}
                type="button"
                tabIndex={-1}
                onClick={() => onChange({ target: { value: qs } })}
                style={{
                  padding: '2px 8px', fontSize: 11, fontWeight: 600,
                  borderRadius: 5, border: `1px solid ${T.border}`,
                  background: Number(value) === qs ? '#E0F2FE' : '#F8FAFC',
                  color: Number(value) === qs ? T.sky : T.muted,
                  cursor: 'pointer',
                }}
              >
                {prefix ? `${prefix} ` : ''}{qs}
              </button>
            ))}
          </div>
        )}
      </div>
    </F>
  );
};

// ── SELECT ────────────────────────────────────────────────────────────────────
export const Sel = ({ label, required, optional, col, children, style: s, ...p }) => (
  <F label={label} required={required} optional={optional} col={col}>
    <select {...p} style={{ ...iBase, ...(s || {}) }}>{children}</select>
  </F>
);

// ── TEXTAREA ──────────────────────────────────────────────────────────────────
export const Txta = ({ label, required, optional, col, rows, ...p }) => (
  <F label={label} required={required} optional={optional} col={col}>
    <textarea
      {...p}
      rows={rows || 3}
      style={{ ...iBase, resize: 'vertical', minHeight: rows ? rows * 22 : 68 }}
    />
  </F>
);

// ── BUTTON ────────────────────────────────────────────────────────────────────
export const Btn = ({ children, v = 'sky', sm, full, disabled, onClick, style: s, title }) => {
  const vs = {
    sky:     { bg: T.sky,    fg: 'white' },
    navy:    { bg: T.navy,   fg: 'white' },
    green:   { bg: T.green,  fg: 'white' },
    orange:  { bg: T.orange, fg: 'white' },
    red:     { bg: T.red,    fg: 'white' },
    outline: { bg: 'white',  fg: T.text, border: `1px solid ${T.border}` },
  };
  const cv = vs[v] || vs.sky;
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: cv.bg, color: cv.fg,
        border: cv.border || 'none',
        padding: sm ? '5px 11px' : '8px 16px',
        borderRadius: 8,
        fontSize: sm ? 12 : 14,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        width: full ? '100%' : undefined,
        justifyContent: full ? 'center' : undefined,
        ...s,
      }}
    >
      {children}
    </button>
  );
};

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
export const SBadge = ({ s }) => {
  const m = {
    paid:      { bg: '#D1FAE5', fg: '#065F46', t: '✓ Paid' },
    partial:   { bg: '#FFEDD5', fg: '#9A3412', t: '⚡ Partial' },
    unpaid:    { bg: '#FEF3C7', fg: '#92400E', t: '⏳ Unpaid' },
    active:    { bg: '#DBEAFE', fg: '#1E40AF', t: 'Active' },
    inactive:  { bg: '#F1F5F9', fg: '#475569', t: 'Inactive' },
    withdrawn: { bg: '#FEE2E2', fg: '#991B1B', t: 'Withdrawn' },
    graduated: { bg: '#EDE9FE', fg: '#5B21B6', t: 'Graduated' },
  };
  const x = m[s] || m.active;
  return (
    <span style={{
      background: x.bg, color: x.fg,
      padding: '2px 9px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {x.t}
    </span>
  );
};

// ── AVATAR ────────────────────────────────────────────────────────────────────
export const Av = ({ photo, name, id, sz = 36, r = 9 }) =>
  photo ? (
    <img
      src={photo}
      alt={name}
      style={{ width: sz, height: sz, borderRadius: r, objectFit: 'cover', flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: sz, height: sz, background: pal(id || name || 'A'),
      borderRadius: r, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'white',
      fontWeight: 800, fontSize: sz * 0.34, flexShrink: 0,
    }}>
      {inits(name)}
    </div>
  );

// ── MODAL ─────────────────────────────────────────────────────────────────────
export const Mdl = ({ title, onClose, children, wide, extraWide }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(15,34,64,.52)',
    zIndex: 50, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 16,
  }}>
    <div style={{
      background: 'white', borderRadius: 16,
      boxShadow: '0 20px 60px rgba(0,0,0,.25)',
      width: '100%', maxWidth: extraWide ? 900 : wide ? 710 : 540,
      maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px', borderBottom: `1px solid ${T.border}`, flexShrink: 0,
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text }}>{title}</h2>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: T.muted }}
        >
          <X size={19} />
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
    </div>
  </div>
);

// ── TABLE HEADER CELL ─────────────────────────────────────────────────────────
export const Th = ({ c, right, sortable, active, dir, onClick }) => (
  <th
    onClick={sortable ? onClick : undefined}
    style={{
      padding: '10px 14px',
      textAlign: right ? 'right' : 'left',
      fontSize: 11, fontWeight: 700,
      color: active ? T.sky : T.muted,
      textTransform: 'uppercase', letterSpacing: '.06em',
      borderBottom: `1px solid ${T.border}`,
      background: '#F8FAFC', whiteSpace: 'nowrap',
      cursor: sortable ? 'pointer' : 'default', userSelect: 'none',
    }}
  >
    {c}{sortable && active && (dir === 'asc' ? ' ↑' : ' ↓')}
  </th>
);

// ── TABLE DATA CELL ───────────────────────────────────────────────────────────
export const Td = ({ children, s }) => (
  <td style={{
    padding: '12px 14px',
    borderTop: `1px solid ${T.border}`,
    fontSize: 14, color: T.text, ...s,
  }}>
    {children}
  </td>
);

// ── ICON BUTTON ───────────────────────────────────────────────────────────────
export const IconBtn = ({ I, color, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: 5, border: `1px solid ${T.border}`, borderRadius: 6,
      cursor: 'pointer', background: 'white', lineHeight: 0, flexShrink: 0,
    }}
  >
    <I size={13} color={color} />
  </button>
);

// ── PILL ──────────────────────────────────────────────────────────────────────
export const Pill = ({ label, color }) => (
  <span style={{
    background: color + '18', color,
    padding: '2px 8px', borderRadius: 20,
    fontSize: 11, fontWeight: 700,
  }}>
    {label}
  </span>
);
