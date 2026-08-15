import { useState } from 'react';
import { UserCheck, ShoppingBag, CreditCard, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
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
    admission: { enabled: true, amount: 100, label: 'Admission Fee' },
    books:     { enabled: true, amount: 150, label: 'Books & Materials' },
    uniform:   { enabled: true, amount: 100, label: 'Uniform & Clothes' },
    custom:    { enabled: false, amount: 50, label: 'Supplies / ID Kit' },
    paidNow:   true,
    method:    'Cash',
    date:      today(),
  },
};

// ── MINIMAL & EASY STUDENT REGISTRATION MODAL ────────────────────────────────
export function StudentFormModal({ student, onSave, onClose, cfg, allStudents }) {
  const isEdit = !!student?.id;
  const [showMore, setShowMore] = useState(false);
  const [nameWarn, setNameWarn] = useState(false);
  const [icWarn, setIcWarn]     = useState('');

  const [f, setF] = useState(() => {
    if (student) {
      return {
        ...student,
        notes: student.notes || '',
        paymentPlan: student.paymentPlan || 'monthly',
        initialPackage: student.initialPackage || {
          admission: { enabled: false, amount: 100, label: 'Admission Fee' },
          books:     { enabled: false, amount: 150, label: 'Books & Materials' },
          uniform:   { enabled: false, amount: 100, label: 'Uniform & Clothes' },
          custom:    { enabled: false, amount: 0, label: 'Custom Supply' },
          paidNow:   false,
          method:    'Cash',
          date:      today(),
        },
      };
    }
    const defaultLevel = LEVELS[0] || 'Kg 1';
    const standardSemFee = suggestFeeAmt(defaultLevel, cfg.fees, 'None') || 1500;
    return {
      ...BLANK,
      level: defaultLevel,
      semester: cfg.currentSemester,
      year: cfg.currentYear,
      customTuitionFee: standardSemFee,
      collectFirstMonthNow: true,
      initialPackage: {
        admission: { enabled: true, amount: 100, label: 'Admission Fee' },
        books:     { enabled: true, amount: 150, label: 'Books & Learning Materials' },
        uniform:   { enabled: true, amount: 100, label: 'School Uniform & Clothes' },
        custom:    { enabled: false, amount: 50, label: 'Extra Activity / Supplies' },
        paidNow:   true,
        method:    'Cash',
        date:      today(),
      },
    };
  });

  const u = (k, v) => setF((prev) => ({ ...prev, [k]: v }));
  const g = (k)   => f[k] ?? '';

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

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => u('photo', ev.target.result);
    r.readAsDataURL(file);
  };

  // Fees calculations
  const pkg = f.initialPackage || {};
  const bundleTotal =
    (pkg.admission?.enabled ? Number(pkg.admission.amount) || 0 : 0) +
    (pkg.books?.enabled ? Number(pkg.books.amount) || 0 : 0) +
    (pkg.uniform?.enabled ? Number(pkg.uniform.amount) || 0 : 0) +
    (pkg.custom?.enabled ? Number(pkg.custom.amount) || 0 : 0);

  const suggestedTuition = suggestFeeAmt(f.level, cfg.fees, f.discount) || 1500;
  const semesterDue = Number(f.customTuitionFee ?? suggestedTuition);
  const monthlyRate = Math.round((semesterDue / 6) * 100) / 100;

  // First month or full semester amount collected today
  const firstMonthTuition = f.paymentPlan === 'monthly' ? monthlyRate : semesterDue;
  const totalDueToday = (pkg.paidNow ? bundleTotal : 0) + (f.collectFirstMonthNow ? firstMonthTuition : 0);

  const handleSave = () => {
    if (!f.name || !f.name.trim()) {
      setNameWarn(true);
      return;
    }
    if (f.ic && f.ic.trim() && allStudents) {
      const dup = (allStudents || []).find((s) => s.ic && s.ic.trim() === f.ic.trim() && s.id !== f.id);
      if (dup) {
        setIcWarn(`IC already registered to ${dup.name} (${dup.id})`);
        return;
      }
    }

    const studentId = isEdit ? f.id : genId('STU');
    const generatedIncomes = [];

    let updatedSemFees = [...(f.semFees || [])];
    const semN = Number(f.semester);
    const yrN = Number(f.year);

    if (!isEdit) {
      const installments = [];
      const paymentDate = f.initialPackage?.date || today();
      const paymentMethod = f.initialPackage?.method || 'Cash';

      // 1. Initial 1st month / tuition payment if selected
      if (f.collectFirstMonthNow && firstMonthTuition > 0) {
        const tuitionRecNo = genRec(yrN);
        const inst = {
          id: genId('INS'),
          amount: firstMonthTuition,
          date: paymentDate,
          method: paymentMethod,
          note: f.paymentPlan === 'monthly' ? 'Month 1 Tuition Fee' : 'Full Semester Tuition',
          receiptNo: tuitionRecNo,
        };
        installments.push(inst);

        generatedIncomes.push({
          id: genId('INC'),
          date: paymentDate,
          category: 'Tuition Fee',
          description: `Tuition: ${f.name} (${f.level} - ${inst.note})`,
          amount: firstMonthTuition,
          studentId,
          studentName: f.name,
          receiptNo: tuitionRecNo,
          method: paymentMethod,
        });
      }

      updatedSemFees.push({
        id: genId('SF'),
        sem: semN,
        year: yrN,
        plan: f.paymentPlan || 'monthly',
        totalDue: semesterDue,
        installments,
      });

      // 2. Starter bundle payment if marked paid
      if (f.initialPackage?.paidNow && bundleTotal > 0) {
        const bundleRecNo = genRec(yrN);
        const items = [];
        if (pkg.admission?.enabled) items.push(`Admission (RM ${pkg.admission.amount})`);
        if (pkg.books?.enabled) items.push(`Books (RM ${pkg.books.amount})`);
        if (pkg.uniform?.enabled) items.push(`Uniform (RM ${pkg.uniform.amount})`);
        if (pkg.custom?.enabled) items.push(`${pkg.custom.label} (RM ${pkg.custom.amount})`);

        generatedIncomes.push({
          id: genId('INC'),
          date: paymentDate,
          category: 'Registration & Materials',
          description: `Starter Package for ${f.name} [${items.join(', ')}]`,
          amount: bundleTotal,
          studentId,
          studentName: f.name,
          receiptNo: bundleRecNo,
          method: paymentMethod,
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
    <Mdl title={isEdit ? `Edit Student: ${student.name}` : '✨ Quick Student Registration'} onClose={onClose} extraWide>
      <div style={{ padding: '20px 24px', maxHeight: 'calc(85vh - 110px)', overflowY: 'auto', background: '#F8FAFC' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr' : '1.1fr 1fr', gap: 20, alignItems: 'start' }}>
          
          {/* ── LEFT COLUMN: ESSENTIAL STUDENT INFORMATION ── */}
          <div style={{ background: 'white', borderRadius: 12, padding: 18, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              👤 Student Profile
            </div>

            <Inp
              label="Full Name"
              required
              value={g('name')}
              onChange={(e) => { u('name', e.target.value); setNameWarn(false); }}
              placeholder="e.g. Aisyah binti Ahmad"
              style={{ borderColor: nameWarn ? T.red : undefined, fontSize: 15, fontWeight: 600 }}
            />
            {nameWarn && (
              <div style={{ fontSize: 12, color: T.red, marginTop: -8, marginBottom: 8 }}>
                ⚠ Please enter the student's name.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <Sel
                label="Education Level"
                required
                value={g('level')}
                onChange={(e) => {
                  const newLvl = e.target.value;
                  u('level', newLvl);
                  u('customTuitionFee', suggestFeeAmt(newLvl, cfg.fees, f.discount));
                }}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </Sel>

              <Sel label="Gender" optional value={g('gender')} onChange={(e) => u('gender', e.target.value)}>
                <option>Male</option>
                <option>Female</option>
              </Sel>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <Inp label="Parent / Guardian Name" optional value={g('parentName')} onChange={(e) => u('parentName', e.target.value)} placeholder="Guardian's name" />
              <Inp label="Parent Phone" optional value={g('parentPhone')} onChange={(e) => u('parentPhone', e.target.value)} placeholder="01X-XXX XXXX" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <Sel label="Sibling Discount" optional value={g('discount')} onChange={(e) => {
                const disc = e.target.value;
                u('discount', disc);
                u('customTuitionFee', suggestFeeAmt(f.level, cfg.fees, disc));
              }}>
                <option value="None">None</option>
                <option value="2nd Sibling (15%)">2nd Sibling (15% OFF)</option>
                <option value="3rd Sibling (25%)">3rd Sibling (25% OFF)</option>
              </Sel>
              <Sel label="Status" value={g('status')} onChange={(e) => u('status', e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </Sel>
            </div>

            {/* Photo Upload (Minimal) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: `1px solid ${T.border}` }}>
              <Av photo={g('photo')} name={g('name') || '?'} id={g('id')} sz={44} r={8} />
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', border: `1px solid ${T.border}`,
                  borderRadius: 6, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', background: 'white', color: T.text,
                }}>
                  📷 {g('photo') ? 'Change Photo' : 'Upload Photo (Optional)'}
                  <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                </label>
                {g('photo') && (
                  <button onClick={() => u('photo', null)} style={{ marginLeft: 6, background: 'none', border: 'none', color: T.red, fontSize: 11, cursor: 'pointer' }}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Collapsible Section for Secondary/Optional details */}
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.sky, fontSize: 12, fontWeight: 700, padding: '4px 0',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showMore ? 'Hide Additional Details' : '+ Add More Details (IC, DOB, Address, Notes)'}
              </button>

              {showMore && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.border}` }}>
                  <Inp
                    label="IC / Passport No."
                    optional
                    value={g('ic')}
                    onChange={(e) => { u('ic', e.target.value); setIcWarn(''); }}
                    placeholder="000000-00-0000"
                    style={{ borderColor: icWarn ? T.red : undefined }}
                  />
                  {icWarn && <div style={{ fontSize: 11, color: T.red, marginTop: -6, marginBottom: 6 }}>⚠ {icWarn}</div>}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <Inp label="Date of Birth" optional type="date" value={g('dob')} onChange={(e) => u('dob', e.target.value)} />
                    <Inp label="Student Email" optional type="email" value={g('email')} onChange={(e) => u('email', e.target.value)} placeholder="student@email.com" />
                  </div>

                  <Txta label="Home Address" optional rows={2} value={g('address')} onChange={(e) => u('address', e.target.value)} placeholder="Full address" />
                  <Txta label="Admin Notes" optional rows={2} value={g('notes')} onChange={(e) => u('notes', e.target.value)} placeholder="Special medical or background notes" />
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: FEES, STARTER BUNDLE & SETTLEMENT ── */}
          {!isEdit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* 1. Academic Fee Section */}
              <div style={{ background: 'white', borderRadius: 12, padding: 18, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={16} color={T.sky} /> Academic Tuition Fee
                  </div>
                  <span style={{ fontSize: 11, color: T.muted, background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                    Standard: RM 250 – 300 / mo
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <NumInp
                    label="Monthly Rate"
                    prefix="RM"
                    value={monthlyRate}
                    step={10}
                    onChange={(e) => {
                      const newMo = Number(e.target.value);
                      u('customTuitionFee', newMo * 6);
                    }}
                    quickSteps={[250, 275, 300]}
                  />

                  <NumInp
                    label="Semester Total (6 Mos)"
                    prefix="RM"
                    value={semesterDue}
                    step={50}
                    onChange={(e) => u('customTuitionFee', Number(e.target.value))}
                  />
                </div>

                {/* Plan Toggle */}
                <div style={{ display: 'flex', gap: 6, background: '#F8FAFC', padding: 4, borderRadius: 8, border: `1px solid ${T.border}` }}>
                  <button
                    type="button"
                    onClick={() => u('paymentPlan', 'monthly')}
                    style={{
                      flex: 1, padding: '7px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                      fontWeight: 700, fontSize: 12,
                      background: f.paymentPlan === 'monthly' ? 'white' : 'transparent',
                      color: f.paymentPlan === 'monthly' ? T.sky : T.muted,
                      boxShadow: f.paymentPlan === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    🗓 Monthly (RM {monthlyRate}/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => u('paymentPlan', 'full')}
                    style={{
                      flex: 1, padding: '7px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                      fontWeight: 700, fontSize: 12,
                      background: f.paymentPlan === 'full' ? 'white' : 'transparent',
                      color: f.paymentPlan === 'full' ? T.green : T.muted,
                      boxShadow: f.paymentPlan === 'full' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    💰 Full Sem (RM {semesterDue})
                  </button>
                </div>
              </div>

              {/* 2. Starter Bundle (Clear & Prominent Prices) */}
              <div style={{ background: 'white', borderRadius: 12, padding: 18, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShoppingBag size={16} color={T.orange} /> Starter Bundle & Items
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.green }}>
                    Total: {fmtMoney(bundleTotal)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Admission */}
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, border: `1px solid ${pkg.admission?.enabled ? '#BAE6FD' : T.border}`,
                    background: pkg.admission?.enabled ? '#F0F9FF' : 'white', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={!!pkg.admission?.enabled}
                        onChange={(e) => uPkg('admission', 'enabled', e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Admission & Reg Fee</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>RM</span>
                      <input
                        type="number"
                        value={pkg.admission?.amount ?? 100}
                        disabled={!pkg.admission?.enabled}
                        onChange={(e) => uPkg('admission', 'amount', Number(e.target.value))}
                        style={{ width: 60, padding: '3px 6px', borderRadius: 5, border: `1px solid ${T.border}`, fontWeight: 800, fontSize: 13, textAlign: 'right' }}
                      />
                    </div>
                  </label>

                  {/* Books */}
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, border: `1px solid ${pkg.books?.enabled ? '#BAE6FD' : T.border}`,
                    background: pkg.books?.enabled ? '#F0F9FF' : 'white', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={!!pkg.books?.enabled}
                        onChange={(e) => uPkg('books', 'enabled', e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Books & Learning Materials</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>RM</span>
                      <input
                        type="number"
                        value={pkg.books?.amount ?? 150}
                        disabled={!pkg.books?.enabled}
                        onChange={(e) => uPkg('books', 'amount', Number(e.target.value))}
                        style={{ width: 60, padding: '3px 6px', borderRadius: 5, border: `1px solid ${T.border}`, fontWeight: 800, fontSize: 13, textAlign: 'right' }}
                      />
                    </div>
                  </label>

                  {/* Uniform */}
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, border: `1px solid ${pkg.uniform?.enabled ? '#BAE6FD' : T.border}`,
                    background: pkg.uniform?.enabled ? '#F0F9FF' : 'white', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={!!pkg.uniform?.enabled}
                        onChange={(e) => uPkg('uniform', 'enabled', e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Uniform & School Clothes</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>RM</span>
                      <input
                        type="number"
                        value={pkg.uniform?.amount ?? 100}
                        disabled={!pkg.uniform?.enabled}
                        onChange={(e) => uPkg('uniform', 'amount', Number(e.target.value))}
                        style={{ width: 60, padding: '3px 6px', borderRadius: 5, border: `1px solid ${T.border}`, fontWeight: 800, fontSize: 13, textAlign: 'right' }}
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Payment Settlement Card */}
              <div style={{
                background: '#ECFDF5', border: `1px solid #A7F3D0`,
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Total Collection Today
                    </div>
                    <div style={{ fontSize: 11, color: '#047857' }}>
                      Bundle ({fmtMoney(bundleTotal)}) + {f.paymentPlan === 'monthly' ? `Month 1 (${fmtMoney(monthlyRate)})` : `Full Sem (${fmtMoney(semesterDue)})`}
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#065F46' }}>
                    {fmtMoney(totalDueToday)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid #A7F3D0' }}>
                  <Sel label="Payment Method" value={pkg.method} onChange={(e) => uPkgMeta('method', e.target.value)}>
                    {PMETHODS.map((m) => <option key={m}>{m}</option>)}
                  </Sel>
                  <Inp label="Date Paid" type="date" value={pkg.date} onChange={(e) => uPkgMeta('date', e.target.value)} />
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 24px', borderTop: `1px solid ${T.border}`, background: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, color: T.muted }}>
          Only <strong style={{ color: T.text }}>Full Name</strong> is required to register.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn v="outline" onClick={onClose}>Cancel</Btn>
          <Btn v="green" onClick={handleSave}>
            <UserCheck size={14} />{isEdit ? 'Save Changes' : '✓ Complete Registration & Issue Receipt'}
          </Btn>
        </div>
      </div>
    </Mdl>
  );
}
