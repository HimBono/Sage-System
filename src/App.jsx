import { useState, useEffect } from 'react';
import { T } from './constants/index.js';
import { INIT_STUDENTS, INIT_CFG, INIT_FINANCE } from './data/seedData.js';
import { Sidebar, TopBar, MobileBottomNav } from './components/ui/Sidebar.jsx';
import { LoginPage } from './components/ui/LoginPage.jsx';
import { Dashboard } from './views/Dashboard.jsx';
import { StudentsView } from './views/StudentsView.jsx';
import { ReceiptsView } from './views/ReceiptsView.jsx';
import { SettingsView } from './views/SettingsView.jsx';
import { FinanceView } from './views/FinanceView.jsx';
import { RolloverModal } from './components/modals/RolloverModal.jsx';
import { nextLevel } from './utils/paymentHelpers.js';
import { getStoredItem, setStoredItem } from './utils/storage.js';

export default function App() {
  const [authed, setAuthed] = useState(() => {
    return getStoredItem('sage_authed', false) || sessionStorage.getItem('sage_authed_temp') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState('dashboard');
  const [students, setStudents] = useState(() => getStoredItem('sage_students', INIT_STUDENTS));
  const [cfg, setCfg] = useState(() => getStoredItem('sage_cfg', INIT_CFG));
  const [finances, setFinances] = useState(() => getStoredItem('sage_finances', INIT_FINANCE));
  const [rollover, setRollover] = useState(false);

  useEffect(() => {
    setStoredItem('sage_students', students);
  }, [students]);

  useEffect(() => {
    setStoredItem('sage_cfg', cfg);
  }, [cfg]);

  useEffect(() => {
    setStoredItem('sage_finances', finances);
  }, [finances]);

  const handleLogin = (remember) => {
    setAuthed(true);
    if (remember) {
      setStoredItem('sage_authed', true);
    } else {
      sessionStorage.setItem('sage_authed_temp', 'true');
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    setStoredItem('sage_authed', false);
    sessionStorage.removeItem('sage_authed_temp');
    setView('dashboard');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data (students, finances, and settings) back to factory default?')) {
      setStudents(INIT_STUDENTS);
      setCfg(INIT_CFG);
      setFinances(INIT_FINANCE);
      localStorage.clear();
      sessionStorage.clear();
      alert('Data reset successfully to default seed data.');
    }
  };

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

  if (!authed) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: '"Inter",system-ui,-apple-system,sans-serif' }}>
      <Sidebar
        active={view}
        go={setView}
        school={cfg.schoolName}
        onOut={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg, minWidth: 0 }}>
        <TopBar cfg={cfg} onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="main-content-container" style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 76px' }}>
          {view === 'dashboard' && <Dashboard students={students} cfg={cfg} finances={finances} onRollover={() => setRollover(true)} />}
          {view === 'finance' && <FinanceView students={students} finances={finances} setFinances={setFinances} />}
          {view === 'students' && (
            <StudentsView
              students={students}
              setStudents={setStudents}
              cfg={cfg}
              setCfg={setCfg}
              finances={finances}
              setFinances={setFinances}
              onRollover={() => setRollover(true)}
            />
          )}
          {view === 'receipts' && <ReceiptsView students={students} cfg={cfg} finances={finances} />}
          {view === 'settings' && <SettingsView cfg={cfg} setCfg={setCfg} onResetData={handleResetData} />}
        </main>
        <MobileBottomNav active={view} go={setView} />
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
