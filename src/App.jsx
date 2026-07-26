import { useState } from 'react';
import { T } from './constants/index.js';
import { INIT_STUDENTS, INIT_CFG, INIT_FINANCE } from './data/seedData.js';
import { Sidebar, TopBar } from './components/ui/Sidebar.jsx';
import { LoginPage } from './components/ui/LoginPage.jsx';
import { Dashboard } from './views/Dashboard.jsx';
import { StudentsView } from './views/StudentsView.jsx';
import { ReceiptsView } from './views/ReceiptsView.jsx';
import { SettingsView } from './views/SettingsView.jsx';
import { FinanceView } from './views/FinanceView.jsx';
import { RolloverModal } from './components/modals/RolloverModal.jsx';
import { nextLevel } from './utils/paymentHelpers.js';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState('dashboard');
  const [students, setStudents] = useState(INIT_STUDENTS);
  const [cfg, setCfg] = useState(INIT_CFG);
  const [finances, setFinances] = useState(INIT_FINANCE);
  const [rollover, setRollover] = useState(false);

  const handleRollover = (nextSem, nextYear, advanceLevel) => {
    setCfg((c) => ({ ...c, currentSemester: nextSem, currentYear: nextYear }));
    setStudents((prev) =>
      prev.map((s) => {
        if (s.status !== 'active') return s;
        return { ...s, semester: nextSem, year: nextYear, level: advanceLevel ? nextLevel(s.level) : s.level };
      })
    );
    setRollover(false);
  };

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '"Inter",system-ui,-apple-system,sans-serif' }}>
      <Sidebar
        active={view}
        go={setView}
        school={cfg.schoolName}
        onOut={() => { setAuthed(false); setView('dashboard'); }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}>
        <TopBar cfg={cfg} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {view === 'dashboard' && <Dashboard students={students} cfg={cfg} finances={finances} onRollover={() => setRollover(true)} />}
          {view === 'finance' && <FinanceView finances={finances} setFinances={setFinances} />}
          {view === 'students' && (
            <StudentsView
              students={students}
              setStudents={setStudents}
              cfg={cfg}
              setCfg={setCfg}
              onRollover={() => setRollover(true)}
            />
          )}
          {view === 'receipts' && <ReceiptsView students={students} cfg={cfg} />}
          {view === 'settings' && <SettingsView cfg={cfg} setCfg={setCfg} />}
        </main>
      </div>
      {rollover && (
        <RolloverModal
          students={students}
          cfg={cfg}
          onConfirm={handleRollover}
          onClose={() => setRollover(false)}
        />
      )}
    </div>
  );
}
