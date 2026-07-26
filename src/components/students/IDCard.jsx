import { Printer } from 'lucide-react';
import { T } from '../../constants/index.js';
import { fmtDate, inits, pal } from '../../utils/formatters.js';
import { printDoc } from '../../utils/print.js';
import { Av, Btn } from '../ui/BaseUI.jsx';

// ── STUDENT ID CARD ───────────────────────────────────────────────────────────
export function IDCard({ student, cfg }) {
  const ac   = pal(student.id);
  const bars = [14, 22, 9, 17, 24, 11, 19, 15, 23, 10, 18, 13, 21, 12, 20, 16, 24, 9, 17, 13];

  const avHtml = student.photo
    ? `<img src="${student.photo}" style="width:68px;height:68px;border-radius:10px;object-fit:cover;flex-shrink:0"/>`
    : `<div style="width:68px;height:68px;background:${ac};border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:26px;font-weight:800;flex-shrink:0">${inits(student.name)}</div>`;

  const html =
    `<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#EEF2F7}.card{width:350px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.2)}.top{background:${ac};padding:16px 18px;color:white}.sch{font-size:10px;font-weight:700;opacity:.75;text-transform:uppercase;letter-spacing:1.5px}.ttl{font-size:15px;font-weight:800;margin-top:2px}.body{background:white;padding:16px 18px;display:flex;gap:13px;align-items:flex-start}.nm{font-size:15px;font-weight:800;color:#1E293B}.id{font-size:11px;color:#64748B;font-family:monospace;margin:4px 0}.dt{font-size:12px;color:#64748B;margin:2px 0}.foot{background:${ac};padding:8px 18px;display:flex;justify-content:space-between;align-items:center}.vd{color:rgba(255,255,255,.6);font-size:10px}.bc{display:flex;gap:2px;align-items:flex-end}</style>` +
    `<div class="card"><div class="top"><div class="sch">${cfg.schoolName}</div><div class="ttl">Student Identity Card</div></div>` +
    `<div class="body">${avHtml}<div><div class="nm">${student.name}</div><div class="id">${student.id}</div><div class="dt">Level: ${student.level}</div><div class="dt">Semester ${student.semester}, ${student.year}</div><div class="dt">DOB: ${fmtDate(student.dob)}</div></div></div>` +
    `<div class="foot"><div class="vd">Valid ${student.year}</div><div class="bc">${bars.map((h) => `<div style="background:rgba(255,255,255,.65);width:2px;height:${h}px"></div>`).join('')}</div></div></div>`;

  return (
    <div>
      {/* Card preview */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '22px 22px 8px' }}>
        <div style={{
          width: 350, borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,.14)',
        }}>
          <div style={{ background: ac, padding: '16px 18px', color: 'white' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: .75, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {cfg.schoolName}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>Student Identity Card</div>
          </div>
          <div style={{ background: 'white', padding: '16px 18px', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <Av photo={student.photo} name={student.name} id={student.id} sz={68} r={10} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{student.name}</div>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace', margin: '4px 0' }}>{student.id}</div>
              <div style={{ fontSize: 12, color: T.muted }}>Level: {student.level}</div>
              <div style={{ fontSize: 12, color: T.muted }}>Semester {student.semester}, {student.year}</div>
              <div style={{ fontSize: 12, color: T.muted }}>DOB: {fmtDate(student.dob)}</div>
            </div>
          </div>
          <div style={{ background: ac, padding: '8px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 10 }}>Valid {student.year}</span>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              {bars.map((h, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.65)', width: 2, height: h }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Print button */}
      <div style={{ padding: '10px 22px 20px', display: 'flex', justifyContent: 'center' }}>
        <Btn onClick={() => printDoc(html, `ID Card – ${student.name}`)}>
          <Printer size={14} />Print ID Card
        </Btn>
      </div>
    </div>
  );
}
