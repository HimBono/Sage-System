// ── SEED DATA ─────────────────────────────────────────────────────────────────
export const INIT_CFG = {
  schoolName: 'SAGE International School',
  address:    'No. 12, Jalan Cengal, 50450 Kuala Lumpur',
  phone:      '03-2282 7200',
  email:      'sageampang@gmail.com',
  currentSemester: 2,
  currentYear:     2026,
  semDates: [
    { sem: 1, year: 2026, start: '2026-01-05', end: '2026-06-14' },
    { sem: 2, year: 2026, start: '2026-07-01', end: '2026-12-12' },
  ],
  fees: [
    { id: 1, label: 'Kg 1',    amount: 1000 },
    { id: 2, label: 'Kg 2',    amount: 1000 },
    { id: 3, label: 'Level 1', amount: 1200 },
    { id: 4, label: 'Level 2', amount: 1300 },
    { id: 5, label: 'Level 3', amount: 1400 },
    { id: 6, label: 'Level 4', amount: 1500 },
  ],
  regForm: {
    title:        'APPLICATION FOR ADMISSION',
    intro:        "Please complete all sections clearly. Submit this form with a photocopy of the student's birth certificate or passport and one passport-sized photograph.",
    regFee:       200,
    regFeeLabel:  'Registration Fee (Non-refundable)',
    terms: `1. Submission of this form does not guarantee placement. Acceptance is subject to the school's assessment and available space.\n2. The registration fee is strictly non-refundable under any circumstances.\n3. All information provided must be accurate and truthful. Misrepresentation may result in immediate cancellation.\n4. Parents/guardians must inform the school of any changes to contact details within 7 days.\n5. Students are expected to adhere to the school's code of conduct and disciplinary policy at all times.\n6. Tuition fees are due at the beginning of each semester. Late payment may incur a penalty.\n7. The school reserves the right to amend its policies and fee structure with reasonable prior notice.`,
    declaration: `I/We hereby declare that all information provided in this application form is true, accurate, and complete. I/We agree to abide by the school's rules, regulations, and fee structure. I/We understand that any misrepresentation may result in the cancellation of this application without refund.`,
  },
};

export const INIT_STUDENTS = [];

export const INIT_FINANCE = {
  incomes: [],
  expenses: [],
  teachers: [],
  reminders: [],
};
