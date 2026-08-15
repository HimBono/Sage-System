import { useState } from 'react';
import { UserCheck, AlertCircle, ShoppingBag, CreditCard, Check } from 'lucide-react';
import { T, LEVELS, STATUSES, PMETHODS } from '../../constants/index.js';
import { Inp, Sel, Txta, Btn, Av, Mdl, NumInp } from '../ui/BaseUI.jsx';
import { genId, genRec, today, fmtMoney } from '../../utils/formatters.js';
import { suggestFeeAmt } from '../../utils/paymentHelpers.js';

// ── BLANK STUDENT TEMPLATE ────────────────────────────────────────────────────
const BLANK = {
  name: '', ic: '', dob: '', gender: 'Male', phone: '', email: '',
  photo: null, level: LEVELS[0] || 'Kg 1', semester: 2, year: 2026,
  enrolledOn: today(), status: 'active', discount: 'None',
  parentName: '', parentPhone: '', parentEmail: '',
  address: '', notes: '', semFees: [],
  paymentPlan: 'monthly', // 'monthly' (6 months) or 'full'
  initialPackage: {
    admission: { enabled: true, amount: 200, label: 'Admission & Registration Fee' },
    books:     { enabled: true, amount: 200, label: 'Books & Learning Materials' },
    uniform:   { enabled: true, amount: 150, label: 'School Uniform & Clothes' },
    custom:    { enabled: false, amount: 50, label: 'Activity & ID Kit' },
    paidNow:   true,
    method:    'Cash',
    date:      today(),
  },
};

// ── STUDENT FORM (inside a Modal) ─────────────────────────────────────────────
export function StudentFormModal({ student, onSave, onClose, cfg, allStudents }) {
  const isEdit = !!student?.id;
  const [f, setF] = useState(() => {
    if (student) {
      return {
        ...student,
        notes: student.notes || '',
        paymentPlan: student.paymentPlan || 'monthly',
        initialPackage: student.initialPackage || {
          admission: { enabled: false, amount: cfg.regForm?.regFee || 200, label: 'Admission Fee' },
          books:     { enabled: false, amount: 200, label: 'Books & Materials' },
          uniform:   { enabled: false, amount: 150, label: 'Uniform & Clothes' },
          custom:    { enabled: false, amount: 0, label: 'Custom Supply' },
          paidNow:   false,
          method:    'Cash',
          date:      today(),
        },
      };
    }
    const defaultLevel = LEVELS[0] || 'Kg 1';
    return {
      ...BLANK,
      level: defaultLevel,
      semester: cfg.currentSemester,
      year: cfg.currentYear,
      customTuitionFee: suggestFeeAmt(defaultLevel, cfg.fees, 'None'),
      initialPackage: {
        admission: { enabled: true, amount: cfg.regForm?.regFee || 200, label: cfg.regForm?.regFeeLabel || 'Admission Fee' },
        books:     { enabled: true, amount: 200, label: 'Books & Learning Materials' },
        uniform:   { enabled: true, amount: 150, label: 'School Uniform & Clothes' },
        custom:    { enabled: false, amount: 50, label: 'Activity / Supplies' },
        paidNow:   true,
        method:    'Cash',
        date:      today(),
      },
    };
  });

  const [tab, setTab]           = useState('personal');
  const [nameWarn, setNameWarn] = useState(false);
  const [icWarn, setIcWarn]     = useState('');

  const u = (k, v) => setF((prev) => ({ ...prev, [k]: v }));
  const g = (k)   => f[k] ?? '';
  const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' };

  // Package helpers
  const uPkg = (itemKey, field, val) => {
    setF((prev) => ({
      ...prev,
      initialPackage: {
        ...prev.initialPackage,
        [itemKey]: {
          ...prev.initialPackage[itemKey],
          [field]: val,
        },
      },
    }));
  };

  const uPkgMeta = (field, val) => {
    setF((prev) => ({
      ...prev,
      initialPackage: {
        ...prev.initialPackage,
        [field]: val,
      },
    }));
  };

  // Calculate bundle total
  const pkg = f.initialPackage || {};
  const bundleTotal =
    (pkg.admission?.enabled ? Number(pkg.admission.amount) || 0 : 0) +
    (pkg.books?.enabled ? Number(pkg.books.amount) || 0 : 0) +
    (pkg.uniform?.enabled ? Number(pkg.uniform.amount) || 0 : 0) +
    (pkg.custom?.enabled ? Number(pkg.custom.amount) || 0 : 0);

  // Suggested semester tuition fee based on level & discount
  const suggestedTuition = suggestFeeAmt(f.level, cfg.fees, f.discount);
  const semesterDue = Number(f.customTuitionFee ?? suggestedTuition);
  const monthlyRate = Math.round((semesterDue / 6) * 100) / 100;

  const TB = ({ t, l, I, hasError }) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '9px 14px', border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
        borderBottom: tab === t ? `2px solid ${T.sky}` : '2px solid transparent',
        color: hasError ? T.red : tab === t ? T.sky : T.muted, background: 'none',
      }}
    >
      {I && <I size={14} />}
      {l}
      {hasError && <AlertCircle size={12} color={T.red} />}
    </button>
  );

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => u('photo', ev.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!f.name || !f.name.trim()) {
      setNameWarn(true);
      setTab('personal');
      return;
    }
    if (f.ic && f.ic.trim() && allStudents) {
      const dup = (allStudents || []).find((s) => s.ic && s.ic.trim() === f.ic.trim() && s.id !== f.id);
      if (dup) {
        setIcWarn(`IC already registered to ${dup.name} (${dup.id})`);
        setTab('personal');
        return;
      }
    }

    const studentId = isEdit ? f.id : genId('STU');
    const generatedIncomes = [];

    let updatedSemFees = [...(f.semFees || [])];
    const semN = Number(f.semester);
    const yrN = Number(f.year);

    if (!isEdit) {
      // Initialize the semester fee record
      const existSF = updatedSemFees.find((s) => s.sem === semN && s.year === yrN);
      if (!existSF) {
        updatedSemFees.push({
          id: genId('SF'),
          sem: semN,
          year: yrN,
          plan: f.paymentPlan || 'monthly',
          totalDue: semesterDue,
          installments: [],
        });
      }

      // Check if Initial Starter Package was paid now
      if (f.initialPackage?.paidNow && bundleTotal > 0) {
        const bundleReceiptNo = genRec(yrN);
        const pkgItems = [];
        if (pkg.admission?.enabled) pkgItems.push(`Admission (${fmtMoney(pkg.admission.amount)})`);
        if (pkg.books?.enabled) pkgItems.push(`Books (${fmtMoney(pkg.books.amount)})`);
        if (pkg.uniform?.enabled) pkgItems.push(`Uniform (${fmtMoney(pkg.uniform.amount)})`);
        if (pkg.custom?.enabled) pkgItems.push(`${pkg.custom.label} (${fmtMoney(pkg.custom.amount)})`);

        generatedIncomes.push({
          id: genId('INC'),
          date: f.initialPackage.date || today(),
          category: 'Registration & Materials',
          description: `Initial Package for ${f.name} [${pkgItems.join(', ')}]`,
          amount: bundleTotal,
          studentId,
          studentName: f.name,
          receiptNo: bundleReceiptNo,
          method: f.initialPackage.method || 'Cash',
        });
      }
    }

    const finalStudent = {
      ...f,
      id: studentId,
      semFees: updatedSemFees,
    };

    onSave(finalStudent, generatedIncomes);
  };

  return (
    <Mdl title={isEdit ? `Edit: ${student.name}` : 'Register New Student'} onClose={onClose} wide extraWide>
      {/* Tab bar */}
      <div style={{
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', padding: '0 18px', gap: 4, flexShrink: 0, overflowX: 'auto',
      }}>
        <TB t="personal" l="Personal Info" hasError={nameWarn || !icWarn} />
        <TB t="academic" l="Academic & Fees" I={CreditCard} />
        {!isEdit && <TB t="package" l="Starter Bundle & Books" I={ShoppingBag} />}
        <TB t="parent"   l="Parent (Optional)" />
        <TB t="notes"    l="Notes (Optional)"  />
      </div>

      <div style={{ padding: 22, maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
        {/* ── Personal tab ── */}
        {tab === 'personal' && (
          <div style={grid}>
            <Inp
              col="1/-1"
              label="Full Name"
              required
              value={g('name')}
              onChange={(e) => { u('name', e.target.value); setNameWarn(false); }}
              placeholder="e.g. Aisyah binti Ahmad (Only required field)"
              style={{ borderColor: nameWarn ? T.red : undefined }}
            />
            {nameWarn && (
              <div style={{ gridColumn: '1/-1', fontSize: 12, color: T.red, marginTop: -8, marginBottom: 8 }}>
                ⚠ Please provide the student's name.
              </div>
            )}

            <Inp
              col="1/-1"
              label="IC / Passport No."
              optional
              value={g('ic')}
              onChange={(e) => { u('ic', e.target.value); setIcWarn(''); }}
              placeholder="000000-00-0000 (optional)"
              style={{ borderColor: icWarn ? T.red : undefined }}
            />
            {icWarn && (
              <div style={{ gridColumn: '1/-1', fontSize: 12, color: T.red, marginTop: -8, marginBottom: 8 }}>
                ⚠ {icWarn}
              </div>
            )}

            <Inp label="Date of Birth" optional type="date" value={g('dob')} onChange={(e) => u('dob', e.target.value)} />
            <Sel label="Gender" optional value={g('gender')} onChange={(e) => u('gender', e.target.value)}>
              <option>Male</option><option>Female</option>
            </Sel>
            <Sel label="Status" value={g('status')} onChange={(e) => u('status', e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </Sel>
            <Inp label="Phone" optional value={g('phone')} onChange={(e) => u('phone', e.target.value)} placeholder="01X-XXX XXXX" />
            <Inp label="Email" optional type="email" value={g('email')} onChange={(e) => u('email', e.target.value)} placeholder="student@email.com" />
            <Txta col="1/-1" label="Address" optional value={g('address')} onChange={(e) => u('address', e.target.value)} placeholder="Full home address" />

            {/* Photo upload */}
            <div style={{ gridColumn: '1/-1', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Student Photo
                </label>
                <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>(optional)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Av photo={g('photo')} name={g('name') || '?'} id={g('id')} sz={60} r={10} />
                <div>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 11px', border: `1px solid ${T.border}`,
                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', background: 'white', color: T.text,
                  }}>
                    📷 Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                  </label>
                  {g('photo') && (
                    <button
                      onClick={() => u('photo', null)}
                      style={{
                        marginLeft: 8, padding: '5px 11px',
                        border: `1px solid ${T.border}`, borderRadius: 8,
                        fontSize: 12, cursor: 'pointer', background: 'white',
                        color: T.red, fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  )}
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                    Shown on ID card and profile. JPG or PNG.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Academic & Fees tab ── */}
        {tab === 'academic' && (
          <div>
            <div style={grid}>
              <Sel
                col="1/-1"
                label="Education Level"
                required
                value={g('level')}
                onChange={(e) => {
                  const newLevel = e.target.value;
                  u('level', newLevel);
                  u('customTuitionFee', suggestFeeAmt(newLevel, cfg.fees, f.discount));
                }}
              >
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </Sel>
              <Sel label="Current Semester" value={g('semester')} onChange={(e) => u('semester', Number(e.target.value))}>
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </Sel>
              <NumInp
                label="Academic Year"
                value={g('year')}
                onChange={(e) => u('year', Number(e.target.value))}
                min={2020}
                max={2035}
                quickSteps={[2025, 2026, 2027]}
              />
              <Inp col="1/-1" label="Enrollment Date" optional type="date" value={g('enrolledOn')} onChange={(e) => u('enrolledOn', e.target.value)} />
              <Sel
                col="1/-1"
                label="Sibling Discount"
                optional
                value={g('discount')}
                onChange={(e) => {
                  const disc = e.target.value;
                  u('discount', disc);
                  u('customTuitionFee', suggestFeeAmt(f.level, cfg.fees, disc));
                }}
              >
                <option value="None">None</option>
                <option value="2nd Sibling (15%)">2nd Sibling (15% discount)</option>
                <option value="3rd Sibling (25%)">3rd Sibling (25% discount)</option>
              </Sel>
            </div>

            {/* Tuition Payment Plan Box */}
            <div style={{
              background: '#F0F9FF', border: '1px solid #BAE6FD',
              borderRadius: 12, padding: 18, marginTop: 14,
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.navy, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                <CreditCard size={16} color={T.sky} /> Semester Tuition & Payment Schedule
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <NumInp
                  label="Semester Tuition Total"
                  prefix="RM"
                  step={50}
                  value={f.customTuitionFee ?? suggestedTuition}
                  onChange={(e) => u('customTuitionFee', Number(e.target.value))}
                  placeholder="0.00"
                />

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                    Payment Plan
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => u('paymentPlan', 'monthly')}
                      style={{
                        flex: 1, padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                        border: f.paymentPlan === 'monthly' ? `2px solid ${T.sky}` : `1px solid ${T.border}`,
                        background: f.paymentPlan === 'monthly' ? '#E0F2FE' : 'white',
                        fontWeight: 700, fontSize: 13, color: f.paymentPlan === 'monthly' ? T.sky : T.text,
                        textAlign: 'center',
                      }}
                    >
                      🗓 Monthly (6 Months)
                    </button>
                    <button
                      type="button"
                      onClick={() => u('paymentPlan', 'full')}
                      style={{
                        flex: 1, padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                        border: f.paymentPlan === 'full' ? `2px solid ${T.sky}` : `1px solid ${T.border}`,
                        background: f.paymentPlan === 'full' ? '#E0F2FE' : 'white',
                        fontWeight: 700, fontSize: 13, color: f.paymentPlan === 'full' ? T.sky : T.text,
                        textAlign: 'center',
                      }}
                    >
                      💰 Full Semester
                    </button>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white', borderRadius: 8, padding: '10px 14px',
                border: `1px solid #BAE6FD`, fontSize: 13, color: T.text, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}>
                {f.paymentPlan === 'monthly' ? (
                  <>
                    <span>📅 6 Monthly Instalments:</span>
                    <strong style={{ color: T.sky, fontSize: 14 }}>6 × {fmtMoney(monthlyRate)} / month = {fmtMoney(semesterDue)}</strong>
                  </>
                ) : (
                  <>
                    <span>💰 Full Semester Lump Sum:</span>
                    <strong style={{ color: T.green, fontSize: 14 }}>1 × {fmtMoney(semesterDue)} / semester</strong>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Starter Bundle & Books Tab (For new registration) ── */}
        {!isEdit && tab === 'package' && (
          <div>
            <div style={{
              background: '#F8FAFC', border: `1px solid ${T.border}`,
              borderRadius: 12, padding: 18, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <ShoppingBag size={16} color={T.sky} /> Initial Registration & Starter Package
                  </h3>
                  <p style={{ fontSize: 12, color: T.muted, margin: '2px 0 0' }}>
                    Select and customize initial items (admission, books, uniforms) to bill and sync with finances.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Bundle Total</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: T.green }}>{fmtMoney(bundleTotal)}</div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* 1. Admission */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, background: 'white',
                  padding: '10px 14px', borderRadius: 8, border: `1px solid ${pkg.admission?.enabled ? T.sky : T.border}`,
                }}>
                  <input
                    type="checkbox"
                    checked={!!pkg.admission?.enabled}
                    onChange={(e) => uPkg('admission', 'enabled', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      value={pkg.admission?.label || 'Admission Fee'}
                      onChange={(e) => uPkg('admission', 'label', e.target.value)}
                      disabled={!pkg.admission?.enabled}
                      style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: 13, width: '100%', outline: 'none' }}
                    />
                  </div>
                  <div style={{ width: 130 }}>
                    <NumInp
                      prefix="RM"
                      value={pkg.admission?.amount}
                      onChange={(e) => uPkg('admission', 'amount', Number(e.target.value))}
                      disabled={!pkg.admission?.enabled}
                      step={20}
                    />
                  </div>
                </div>

                {/* 2. Books */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, background: 'white',
                  padding: '10px 14px', borderRadius: 8, border: `1px solid ${pkg.books?.enabled ? T.sky : T.border}`,
                }}>
                  <input
                    type="checkbox"
                    checked={!!pkg.books?.enabled}
                    onChange={(e) => uPkg('books', 'enabled', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      value={pkg.books?.label || 'Books & Learning Materials'}
                      onChange={(e) => uPkg('books', 'label', e.target.value)}
                      disabled={!pkg.books?.enabled}
                      style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: 13, width: '100%', outline: 'none' }}
                    />
                  </div>
                  <div style={{ width: 130 }}>
                    <NumInp
                      prefix="RM"
                      value={pkg.books?.amount}
                      onChange={(e) => uPkg('books', 'amount', Number(e.target.value))}
                      disabled={!pkg.books?.enabled}
                      step={20}
                    />
                  </div>
                </div>

                {/* 3. Uniform */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, background: 'white',
                  padding: '10px 14px', borderRadius: 8, border: `1px solid ${pkg.uniform?.enabled ? T.sky : T.border}`,
                }}>
                  <input
                    type="checkbox"
                    checked={!!pkg.uniform?.enabled}
                    onChange={(e) => uPkg('uniform', 'enabled', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      value={pkg.uniform?.label || 'School Uniform & Clothes'}
                      onChange={(e) => uPkg('uniform', 'label', e.target.value)}
                      disabled={!pkg.uniform?.enabled}
                      style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: 13, width: '100%', outline: 'none' }}
                    />
                  </div>
                  <div style={{ width: 130 }}>
                    <NumInp
                      prefix="RM"
                      value={pkg.uniform?.amount}
                      onChange={(e) => uPkg('uniform', 'amount', Number(e.target.value))}
                      disabled={!pkg.uniform?.enabled}
                      step={20}
                    />
                  </div>
                </div>

                {/* 4. Custom / Misc Supplies */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, background: 'white',
                  padding: '10px 14px', borderRadius: 8, border: `1px solid ${pkg.custom?.enabled ? T.sky : T.border}`,
                }}>
                  <input
                    type="checkbox"
                    checked={!!pkg.custom?.enabled}
                    onChange={(e) => uPkg('custom', 'enabled', e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      value={pkg.custom?.label || 'Activity / Additional Supplies'}
                      onChange={(e) => uPkg('custom', 'label', e.target.value)}
                      disabled={!pkg.custom?.enabled}
                      placeholder="Custom Package Item Name"
                      style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: 13, width: '100%', outline: 'none' }}
                    />
                  </div>
                  <div style={{ width: 130 }}>
                    <NumInp
                      prefix="RM"
                      value={pkg.custom?.amount}
                      onChange={(e) => uPkg('custom', 'amount', Number(e.target.value))}
                      disabled={!pkg.custom?.enabled}
                      step={10}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Settlement for Initial Bundle */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, color: T.text }}>
                    <input
                      type="checkbox"
                      checked={!!pkg.paidNow}
                      onChange={(e) => uPkgMeta('paidNow', e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    Mark Starter Bundle as Paid Now & Sync to Finances
                  </label>
                  {pkg.paidNow && (
                    <span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>
                      ✓ Will automatically record +{fmtMoney(bundleTotal)} to Income
                    </span>
                  )}
                </div>

                {pkg.paidNow && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Sel label="Payment Method" value={pkg.method} onChange={(e) => uPkgMeta('method', e.target.value)}>
                      {PMETHODS.map((m) => <option key={m}>{m}</option>)}
                    </Sel>
                    <Inp label="Payment Date" type="date" value={pkg.date} onChange={(e) => uPkgMeta('date', e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Parent tab ── */}
        {tab === 'parent' && (
          <div style={grid}>
            <Inp col="1/-1" label="Parent / Guardian Name" optional value={g('parentName')} onChange={(e) => u('parentName', e.target.value)} placeholder="Guardian's name" />
            <Inp label="Parent Phone" optional value={g('parentPhone')} onChange={(e) => u('parentPhone', e.target.value)} placeholder="01X-XXX XXXX" />
            <Inp label="Parent Email" optional type="email" value={g('parentEmail')} onChange={(e) => u('parentEmail', e.target.value)} placeholder="parent@email.com" />
          </div>
        )}

        {/* ── Notes tab ── */}
        {tab === 'notes' && (
          <div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>
              Internal admin notes — not printed on any document. All notes are optional.
            </div>
            <Txta
              label="Notes" optional rows={7} value={g('notes')}
              onChange={(e) => u('notes', e.target.value)}
              placeholder="Medical conditions, special arrangements, sibling info, admin flags…"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 22px', borderTop: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, color: T.muted }}>
          Only <strong style={{ color: T.text }}>Full Name</strong> is required.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn v="outline" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave}>
            <UserCheck size={14} />{isEdit ? 'Save Changes' : 'Register Student'}
          </Btn>
        </div>
      </div>
    </Mdl>
  );
}
