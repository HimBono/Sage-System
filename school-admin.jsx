import { useState, useMemo } from "react";
import {
  LayoutDashboard, Users, FileText, Settings, Search, Plus,
  Edit2, Trash2, Eye, Printer, X, LogOut, GraduationCap,
  DollarSign, CheckCircle, AlertCircle, UserCheck, CreditCard,
  Lock, Check, ChevronDown, ChevronRight, ClipboardList, Zap,
  TrendingUp, BookOpen, MoreHorizontal
} from "lucide-react";

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  navy:'#0F2240', navyLt:'#1A3A60', sky:'#0EA5E9',
  bg:'#EEF2F7', white:'#FFFFFF', green:'#10B981',
  amber:'#F59E0B', orange:'#F97316', red:'#EF4444', purple:'#8B5CF6',
  text:'#1E293B', muted:'#64748B', border:'#E2E8F0',
  shadow:'0 1px 3px rgba(0,0,0,0.08)',
};
const PAL = [T.sky, T.purple, T.green, T.amber, T.red];
const LEVELS = [
  'Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6',
  'Secondary 1','Secondary 2','Secondary 3','Secondary 4','Secondary 5',
  'Lower 6','Upper 6'
];
const PMETHODS = ['Cash','Bank Transfer','Online Banking','Cheque','Other'];
const STATUSES = ['active','inactive','withdrawn','graduated'];

// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmtDate = d => {
  if (!d) return '—';
  try { return new Date(d+'T00:00:00').toLocaleDateString('en-MY',{day:'2-digit',month:'short',year:'numeric'}); }
  catch { return d; }
};
const fmtMoney = n => `RM ${parseFloat(n||0).toLocaleString('en-MY',{minimumFractionDigits:2})}`;
const inits = name => (name||'').trim().split(/\s+/).map(w=>w[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
const pal = id => PAL[(id||'A').charCodeAt((id||'A').length-1) % PAL.length];
const genId = p => p + Math.random().toString(36).slice(2,7).toUpperCase();
const genRec = yr => `REC${yr}${String(Date.now()).slice(-4)}`;
const today = () => new Date().toISOString().slice(0,10);

// ── PAYMENT HELPERS ───────────────────────────────────────────────────────────
const semFeeOf = (student, cfg) =>
  (student.semFees||[]).find(sf => sf.sem===cfg.currentSemester && sf.year===cfg.currentYear);

const semTotals = sf => {
  if (!sf) return { due:0, paid:0, balance:0 };
  const paid = (sf.installments||[]).reduce((s,i) => s+i.amount, 0);
  return { due: sf.totalDue, paid, balance: Math.max(0, sf.totalDue - paid) };
};

const payStatus = (student, cfg) => {
  const sf = semFeeOf(student, cfg);
  if (!sf || !sf.installments?.length) return 'unpaid';
  const { due, paid } = semTotals(sf);
  if (paid >= due) return 'paid';
  return 'partial';
};

const suggestFeeAmt = (level, fees) => {
  const l = (level||'').toLowerCase();
  const m = fees.find(f => {
    const fl = f.label.toLowerCase();
    if((l.includes('primary 1')||l.includes('primary 2')||l.includes('primary 3'))&&fl.includes('primary 1')) return true;
    if((l.includes('primary 4')||l.includes('primary 5')||l.includes('primary 6'))&&fl.includes('primary 4')) return true;
    if((l.includes('secondary 1')||l.includes('secondary 2')||l.includes('secondary 3'))&&fl.includes('secondary 1')) return true;
    if((l.includes('secondary 4')||l.includes('secondary 5'))&&fl.includes('secondary 4')) return true;
    if(l.includes('6')&&fl.includes('sixth')) return true;
    return false;
  });
  return m?.amount || 0;
};
const isArchived = s => s.status === 'withdrawn' || s.status === 'graduated';
const nextLevel = level => { const i = LEVELS.indexOf(level); return i >= 0 && i < LEVELS.length-1 ? LEVELS[i+1] : level; };
const copyText = t => { try { navigator.clipboard.writeText(t); } catch(e) {} };
const waMsg = (s, cfg) => {
  const sf = semFeeOf(s, cfg); const t = semTotals(sf);
  const bal = t.balance > 0 ? `Balance outstanding: *${fmtMoney(t.balance)}*` : 'No payment recorded yet for this semester.';
  return `Assalamualaikum / Good day, *${s.parentName||'Parent/Guardian'}*,\n\nThis is a friendly reminder from *${cfg.schoolName}* regarding your child *${s.name}* (${s.level}).\n\nSemester ${cfg.currentSemester}, ${cfg.currentYear} fee:\n${bal}\n\nKindly settle the outstanding amount at your earliest convenience. Please contact us at ${cfg.phone} for any queries.\n\nThank you.\n_${cfg.schoolName} Administration_`;
};

// ── SEED DATA ─────────────────────────────────────────────────────────────────
const INIT_CFG = {
  schoolName:'SAGE International School',
  address:'No. 12, Jalan Cengal, 50450 Kuala Lumpur',
  phone:'03-2282 7200', email:'admin@sage.edu.my',
  currentSemester:2, currentYear:2026,
  semDates:[
    {sem:1,year:2026,start:'2026-01-05',end:'2026-06-14'},
    {sem:2,year:2026,start:'2026-07-01',end:'2026-12-12'},
  ],
  fees:[
    {id:1,label:'Primary 1–3',amount:1200},
    {id:2,label:'Primary 4–6',amount:1400},
    {id:3,label:'Secondary 1–3',amount:1600},
    {id:4,label:'Secondary 4–5',amount:1800},
    {id:5,label:'Sixth Form',amount:2200},
  ],
  regForm:{
    title:'APPLICATION FOR ADMISSION',
    intro:'Please complete all sections clearly. Submit this form with a photocopy of the student\'s birth certificate or passport and one passport-sized photograph.',
    regFee:200,
    regFeeLabel:'Registration Fee (Non-refundable)',
    terms:`1. Submission of this form does not guarantee placement. Acceptance is subject to the school's assessment and available space.\n2. The registration fee is strictly non-refundable under any circumstances.\n3. All information provided must be accurate and truthful. Misrepresentation may result in immediate cancellation.\n4. Parents/guardians must inform the school of any changes to contact details within 7 days.\n5. Students are expected to adhere to the school's code of conduct and disciplinary policy at all times.\n6. Tuition fees are due at the beginning of each semester. Late payment may incur a penalty.\n7. The school reserves the right to amend its policies and fee structure with reasonable prior notice.`,
    declaration:`I/We hereby declare that all information provided in this application form is true, accurate, and complete. I/We agree to abide by the school's rules, regulations, and fee structure. I/We understand that any misrepresentation may result in the cancellation of this application without refund.`,
  }
};

const INIT_STUDENTS = [
  { id:'STU001',name:'Ahmad Farhan bin Abdullah',ic:'050312-14-5678',dob:'2005-03-12',gender:'Male',phone:'012-345 6789',email:'farhan@email.com',photo:null,level:'Secondary 4',semester:2,year:2026,enrolledOn:'2024-01-15',status:'active',parentName:'Abdullah bin Rahman',parentPhone:'019-876 5432',parentEmail:'abdullah@email.com',address:'No. 45, Jalan Ampang, 50450 KL',notes:'',
    semFees:[
      {id:'SF001',sem:1,year:2026,totalDue:1800,installments:[{id:'INS001',amount:1800,date:'2026-01-10',method:'Bank Transfer',note:'Full payment',receiptNo:'REC20260001'}]},
      {id:'SF002',sem:2,year:2026,totalDue:1800,installments:[{id:'INS002',amount:1800,date:'2026-07-03',method:'Online Banking',note:'Full payment',receiptNo:'REC20260002'}]},
    ]},
  { id:'STU002',name:'Nur Aisyah binti Malik',ic:'060720-14-1234',dob:'2006-07-20',gender:'Female',phone:'011-234 5678',email:'aisyah@email.com',photo:null,level:'Secondary 3',semester:2,year:2026,enrolledOn:'2024-01-15',status:'active',parentName:'Malik bin Yusof',parentPhone:'016-543 2109',parentEmail:'malik@email.com',address:'Unit 7B, Sri Hartamas, KL',notes:'',
    semFees:[
      {id:'SF003',sem:1,year:2026,totalDue:1600,installments:[{id:'INS003',amount:1600,date:'2026-01-12',method:'Cash',note:'Full payment',receiptNo:'REC20260003'}]},
    ]},
  { id:'STU003',name:'Lim Jun Kai',ic:'070501-10-9876',dob:'2007-05-01',gender:'Male',phone:'013-456 7890',email:'junkai@email.com',photo:null,level:'Primary 6',semester:2,year:2026,enrolledOn:'2025-01-10',status:'active',parentName:'Lim Wei Chong',parentPhone:'012-678 9012',parentEmail:'limwc@email.com',address:'28 Taman Desa, 58100 KL',notes:'Needs extra support in Maths.',
    semFees:[
      {id:'SF004',sem:1,year:2026,totalDue:1400,installments:[{id:'INS004',amount:700,date:'2026-01-08',method:'Cash',note:'1st instalment',receiptNo:'REC20260004'},{id:'INS005',amount:700,date:'2026-03-10',method:'Cash',note:'2nd instalment',receiptNo:'REC20260005'}]},
      {id:'SF005',sem:2,year:2026,totalDue:1400,installments:[{id:'INS006',amount:500,date:'2026-07-05',method:'Bank Transfer',note:'1st instalment',receiptNo:'REC20260006'}]},
    ]},
  { id:'STU004',name:'Priya d/o Krishnan',ic:'080922-14-3344',dob:'2008-09-22',gender:'Female',phone:'017-999 1234',email:'priya@email.com',photo:null,level:'Primary 4',semester:2,year:2026,enrolledOn:'2025-07-15',status:'active',parentName:'Krishnan a/l Raju',parentPhone:'017-888 5566',parentEmail:'krishnan@email.com',address:'Blok C-12-3, Pandan Indah, KL',notes:'',
    semFees:[]},
];

// ── PRINT ─────────────────────────────────────────────────────────────────────
const printDoc = (html, title='Print') => {
  try {
    const w = window.open('','_blank','width=860,height=700');
    if (!w) { alert('Allow popups to use the print feature.'); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{margin:32px;font-family:system-ui,sans-serif;color:#1E293B}@media print{@page{margin:18mm}}</style></head><body>${html}<`+`script>setTimeout(()=>{window.print();},350);<`+`/script></body></html>`);
    w.document.close();
  } catch(e) { alert('Could not open print window — please allow popups.'); }
};

// ── BASE UI ───────────────────────────────────────────────────────────────────
const iBase = {width:'100%',padding:'8px 12px',border:`1px solid ${T.border}`,borderRadius:8,fontSize:14,color:T.text,outline:'none',boxSizing:'border-box',fontFamily:'inherit',background:'white'};

const F = ({label,col,children}) => (
  <div style={{marginBottom:12,gridColumn:col}}>
    {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:T.muted,marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</label>}
    {children}
  </div>
);
const Inp = ({label,col,style:s,...p}) => <F label={label} col={col}><input {...p} style={{...iBase,...(s||{})}}/></F>;
const Sel = ({label,col,children,style:s,...p}) => <F label={label} col={col}><select {...p} style={{...iBase,...(s||{})}}>{children}</select></F>;
const Txta = ({label,col,rows,...p}) => <F label={label} col={col}><textarea {...p} rows={rows||3} style={{...iBase,resize:'vertical',minHeight:rows?rows*22:68}}/></F>;

const Btn = ({children,v='sky',sm,full,disabled,onClick,style:s,title}) => {
  const vs={sky:{bg:T.sky,fg:'white'},navy:{bg:T.navy,fg:'white'},green:{bg:T.green,fg:'white'},orange:{bg:T.orange,fg:'white'},red:{bg:T.red,fg:'white'},outline:{bg:'white',fg:T.text,border:`1px solid ${T.border}`}};
  const cv=vs[v]||vs.sky;
  return (
    <button title={title} onClick={onClick} disabled={disabled} style={{background:cv.bg,color:cv.fg,border:cv.border||'none',padding:sm?'5px 11px':'8px 16px',borderRadius:8,fontSize:sm?12:14,fontWeight:600,cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.55:1,display:'inline-flex',alignItems:'center',gap:5,width:full?'100%':undefined,justifyContent:full?'center':undefined,...s}}>
      {children}
    </button>
  );
};

const SBadge = ({s}) => {
  const m={paid:{bg:'#D1FAE5',fg:'#065F46',t:'✓ Paid'},partial:{bg:'#FFEDD5',fg:'#9A3412',t:'⚡ Partial'},unpaid:{bg:'#FEF3C7',fg:'#92400E',t:'⏳ Unpaid'},active:{bg:'#DBEAFE',fg:'#1E40AF',t:'Active'},inactive:{bg:'#F1F5F9',fg:'#475569',t:'Inactive'},withdrawn:{bg:'#FEE2E2',fg:'#991B1B',t:'Withdrawn'},graduated:{bg:'#EDE9FE',fg:'#5B21B6',t:'Graduated'}};
  const x=m[s]||m.active;
  return <span style={{background:x.bg,color:x.fg,padding:'2px 9px',borderRadius:20,fontSize:12,fontWeight:600,whiteSpace:'nowrap'}}>{x.t}</span>;
};

const Av = ({photo,name,id,sz=36,r=9}) => (
  photo
    ? <img src={photo} alt={name} style={{width:sz,height:sz,borderRadius:r,objectFit:'cover',flexShrink:0}}/>
    : <div style={{width:sz,height:sz,background:pal(id||name||'A'),borderRadius:r,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:sz*0.34,flexShrink:0}}>{inits(name)}</div>
);

const Mdl = ({title,onClose,children,wide,extraWide}) => (
  <div style={{position:'fixed',inset:0,background:'rgba(15,34,64,.52)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
    <div style={{background:'white',borderRadius:16,boxShadow:'0 20px 60px rgba(0,0,0,.25)',width:'100%',maxWidth:extraWide?900:wide?710:540,maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 22px',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <h2 style={{margin:0,fontSize:16,fontWeight:700,color:T.text}}>{title}</h2>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:3,color:T.muted}}><X size={19}/></button>
      </div>
      <div style={{overflowY:'auto',flex:1}}>{children}</div>
    </div>
  </div>
);

const Th = ({c,right,sortable,active,dir,onClick}) => (
  <th onClick={sortable?onClick:undefined} style={{padding:'10px 14px',textAlign:right?'right':'left',fontSize:11,fontWeight:700,color:active?T.sky:T.muted,textTransform:'uppercase',letterSpacing:'.06em',borderBottom:`1px solid ${T.border}`,background:'#F8FAFC',whiteSpace:'nowrap',cursor:sortable?'pointer':'default',userSelect:'none'}}>
    {c}{sortable&&active&&(dir==='asc'?' ↑':' ↓')}
  </th>
);
const Td = ({children,s}) => <td style={{padding:'12px 14px',borderTop:`1px solid ${T.border}`,fontSize:14,color:T.text,...s}}>{children}</td>;
const IconBtn = ({I,color,onClick,title}) => (
  <button onClick={onClick} title={title} style={{padding:5,border:`1px solid ${T.border}`,borderRadius:6,cursor:'pointer',background:'white',lineHeight:0,flexShrink:0}}><I size={13} color={color}/></button>
);

const Pill = ({label,color}) => (
  <span style={{background:color+'18',color,padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:700}}>{label}</span>
);

// ── QUICK PAY MODAL ───────────────────────────────────────────────────────────
function QuickPay({student,cfg,onSave,onClose}) {
  const existSF = semFeeOf(student, cfg);
  const existT  = semTotals(existSF);
  const suggested = existSF
    ? Math.max(0, existT.balance)
    : suggestFeeAmt(student.level, cfg.fees);

  const [pf,setPf] = useState({
    sem:   cfg.currentSemester,
    year:  cfg.currentYear,
    totalDue: existSF ? existSF.totalDue : suggestFeeAmt(student.level, cfg.fees),
    amount: suggested,
    date:  today(),
    method:'Cash',
    note:  '',
  });
  const u = (k,v) => setPf(x=>({...x,[k]:v}));

  const isNew = !existSF;
  const balance = existSF ? Math.max(0, existT.balance - Number(pf.amount||0)) : Math.max(0, Number(pf.totalDue||0) - Number(pf.amount||0));
  const ps = payStatus(student, cfg);

  const commit = () => {
    const semN=Number(pf.sem), yrN=Number(pf.year), amt=Number(pf.amount);
    if(!amt) return;
    const newInst = {id:genId('INS'),amount:amt,date:pf.date,method:pf.method,note:pf.note,receiptNo:genRec(yrN)};
    const idx = (student.semFees||[]).findIndex(sf=>sf.sem===semN&&sf.year===yrN);
    let newSF;
    if(idx>=0) {
      newSF = student.semFees.map((sf,i)=>i===idx?{...sf,installments:[...sf.installments,newInst]}:sf);
    } else {
      newSF = [...(student.semFees||[]),{id:genId('SF'),sem:semN,year:yrN,totalDue:Number(pf.totalDue)||amt,installments:[newInst]}];
    }
    onSave({...student,semFees:newSF});
  };

  return (
    <Mdl title={`Quick Pay — ${student.name}`} onClose={onClose}>
      <div style={{padding:20}}>
        {/* Status strip */}
        <div style={{background:'#F8FAFC',border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 16px',marginBottom:18}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:ps!=='unpaid'?10:0}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:T.text}}>{student.level} — Sem {cfg.currentSemester}, {cfg.currentYear}</div>
              <div style={{fontSize:12,color:T.muted,marginTop:1}}>Fee: {fmtMoney(existSF?existSF.totalDue:pf.totalDue||suggestFeeAmt(student.level,cfg.fees))}</div>
            </div>
            <SBadge s={ps}/>
          </div>
          {existSF && (
            <>
              <div style={{background:T.border,borderRadius:99,height:6,overflow:'hidden',marginBottom:6}}>
                <div style={{height:'100%',borderRadius:99,background:existT.balance===0?T.green:T.orange,width:`${Math.min(100,existT.due>0?existT.paid/existT.due*100:0)}%`}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                <span style={{color:T.green}}>Paid: {fmtMoney(existT.paid)}</span>
                <span style={{color:existT.balance>0?T.orange:T.green}}>Balance: {fmtMoney(existT.balance)}</span>
              </div>
            </>
          )}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <Sel label="Semester" value={pf.sem} onChange={e=>u('sem',e.target.value)}>
            <option value={1}>Semester 1</option><option value={2}>Semester 2</option>
          </Sel>
          <Inp label="Year" type="number" value={pf.year} onChange={e=>u('year',e.target.value)}/>
          {isNew && <Inp col="1/-1" label="Total Fee Due (RM)" type="number" value={pf.totalDue} onChange={e=>u('totalDue',e.target.value)} placeholder={suggestFeeAmt(student.level,cfg.fees)||'0.00'}/>}
          <Inp label="Amount Paying (RM)" type="number" value={pf.amount} onChange={e=>u('amount',e.target.value)} placeholder="0.00" style={{borderColor:pf.amount?T.green:T.border}}/>
          <Sel label="Payment Method" value={pf.method} onChange={e=>u('method',e.target.value)}>
            {PMETHODS.map(m=><option key={m}>{m}</option>)}
          </Sel>
          <Inp label="Date Paid" type="date" value={pf.date} onChange={e=>u('date',e.target.value)}/>
          <Inp col="1/-1" label="Note (optional)" value={pf.note} onChange={e=>u('note',e.target.value)} placeholder="e.g. 1st instalment, full payment…"/>
        </div>

        {Number(pf.amount)>0 && (
          <div style={{background:balance===0?'#D1FAE5':'#FFF7ED',border:`1px solid ${balance===0?T.green:T.orange}`,borderRadius:8,padding:'10px 14px',marginTop:4,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13,color:T.muted}}>Balance after this payment</span>
            <span style={{fontWeight:800,fontSize:15,color:balance===0?T.green:T.orange}}>{fmtMoney(balance)}</span>
          </div>
        )}
      </div>
      <div style={{padding:'12px 20px',borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'flex-end',gap:8,flexShrink:0}}>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={commit} disabled={!Number(pf.amount)} v="green"><Check size={14}/>Confirm Payment</Btn>
      </div>
    </Mdl>
  );
}

// ── RECEIPT DOC ───────────────────────────────────────────────────────────────
function ReceiptDoc({inst,semFee,student,cfg}) {
  const totals = semTotals(semFee);
  const instIdx = semFee.installments.findIndex(i=>i.id===inst.id)+1;
  const instCount = semFee.installments.length;
  const isInstalment = instCount > 1;
  const paidToDate = semFee.installments.slice(0,instIdx).reduce((s,i)=>s+i.amount,0);
  const balAfter = Math.max(0, semFee.totalDue - paidToDate);

  const html=`<style>*{margin:0;padding:0;box-sizing:border-box}body{color:#1E293B;font-family:system-ui,sans-serif}.hdr{text-align:center;border-bottom:2px solid #0F2240;padding-bottom:16px;margin-bottom:20px}.sn{font-size:20px;font-weight:900;color:#0F2240}.sub{font-size:12px;color:#64748B;margin-top:2px}.tag{font-size:12px;font-weight:700;color:#0EA5E9;letter-spacing:2px;text-transform:uppercase;margin-top:10px}.meta{display:flex;justify-content:space-between;margin-bottom:20px}.ml{font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.05em}.mv{font-size:14px;font-weight:700;margin-top:2px}.box{background:#F8FAFC;border-radius:8px;padding:12px 14px;margin-bottom:16px}.bn{font-size:15px;font-weight:800}.bs{font-size:13px;color:#64748B;margin-top:2px}table{width:100%;border-collapse:collapse}th{background:#F8FAFC;padding:8px 10px;text-align:left;font-size:12px;color:#64748B}td{padding:10px;border-top:1px solid #E2E8F0;font-size:14px}.bal{border:2px dashed #F97316;border-radius:8px;padding:10px 14px;margin:14px 0;display:flex;justify-content:space-between}.stamp{display:inline-block;border:3px solid #10B981;color:#10B981;padding:6px 18px;border-radius:8px;font-size:16px;font-weight:800;transform:rotate(-5deg)}.ft{margin-top:32px;display:flex;justify-content:space-between;font-size:11px;color:#94A3B8}</style>
<div class="hdr"><div class="sn">${cfg.schoolName}</div><div class="sub">${cfg.address}</div><div class="sub">${cfg.phone} | ${cfg.email}</div><div class="tag">${isInstalment?`Official Receipt — Instalment ${instIdx} of ${instCount}`:'Official Receipt'}</div></div>
<div class="meta"><div><div class="ml">Receipt No.</div><div class="mv">${inst.receiptNo}</div></div><div><div class="ml">Date</div><div class="mv">${fmtDate(inst.date)}</div></div><div><div class="ml">Student ID</div><div class="mv">${student.id}</div></div><div><div class="ml">Method</div><div class="mv">${inst.method||'—'}</div></div></div>
<div class="box"><div class="bn">${student.name}</div><div class="bs">${student.level} · Semester ${semFee.sem}, ${semFee.year}${inst.note?` · ${inst.note}`:''}</div></div>
<table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody>
<tr><td>Tuition Fee — ${student.level} (Sem ${semFee.sem}, ${semFee.year}) — Total: ${fmtMoney(semFee.totalDue)}</td><td style="text-align:right;color:#64748B">${fmtMoney(semFee.totalDue)}</td></tr>
<tr><td style="font-weight:700">${isInstalment?`Instalment ${instIdx} of ${instCount}`:'Amount Paid'}${inst.method?` (${inst.method})`:''}</td><td style="text-align:right;font-weight:900;font-size:18px;border-top:2px solid #0F2240">${fmtMoney(inst.amount)}</td></tr>
</tbody></table>
${isInstalment?`<div class="bal"><div><span style="font-size:11px;color:#64748B">PAID TO DATE</span><br/><strong>${fmtMoney(paidToDate)}</strong> of ${fmtMoney(semFee.totalDue)}</div><div style="text-align:right"><span style="font-size:11px;color:#64748B">BALANCE REMAINING</span><br/><strong style="color:${balAfter>0?'#F97316':'#10B981'}">${fmtMoney(balAfter)}</strong></div></div>`:''}
<div style="text-align:center;margin:18px 0"><div class="stamp">${balAfter===0?'✓ FULLY PAID':'✓ RECEIVED'}</div></div>
<div class="ft"><div>Official receipt — please retain for your records.</div><div>Printed: ${new Date().toLocaleDateString('en-MY')}</div></div>`;

  return (
    <div style={{padding:22}}>
      <div style={{border:`1px solid ${T.border}`,borderRadius:12,overflow:'hidden'}}>
        <div style={{background:T.navy,color:'white',padding:'16px 22px',textAlign:'center'}}>
          <div style={{fontSize:17,fontWeight:800}}>{cfg.schoolName}</div>
          <div style={{fontSize:11,opacity:.6,marginTop:2}}>{cfg.address}</div>
          <div style={{fontSize:11,opacity:.6}}>{cfg.phone} · {cfg.email}</div>
          <div style={{marginTop:9,fontSize:12,fontWeight:700,color:T.sky,letterSpacing:2,textTransform:'uppercase'}}>
            {isInstalment?`Official Receipt — Instalment ${instIdx} of ${instCount}`:'Official Receipt'}
          </div>
        </div>
        <div style={{padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
            {[['Receipt No.',inst.receiptNo],['Date',fmtDate(inst.date)],['Student ID',student.id],['Method',inst.method||'—']].map(([l,v])=>(
              <div key={l}><div style={{fontSize:11,color:T.muted,textTransform:'uppercase',letterSpacing:'.05em'}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:T.text,marginTop:2}}>{v}</div></div>
            ))}
          </div>
          <div style={{background:'#F8FAFC',borderRadius:8,padding:'12px 14px',marginBottom:16}}>
            <div style={{fontWeight:800,fontSize:15,color:T.text}}>{student.name}</div>
            <div style={{fontSize:13,color:T.muted,marginTop:2}}>{student.level} · Semester {semFee.sem}, {semFee.year}{inst.note?` · ${inst.note}`:''}</div>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',marginBottom:12}}>
            <thead><tr style={{background:'#F8FAFC'}}><th style={{padding:'8px 10px',textAlign:'left',fontSize:12,fontWeight:600,color:T.muted}}>Description</th><th style={{padding:'8px 10px',textAlign:'right',fontSize:12,fontWeight:600,color:T.muted}}>Amount</th></tr></thead>
            <tbody>
              <tr><td style={{padding:'10px',borderTop:`1px solid ${T.border}`,fontSize:14}}>Tuition Fee — {student.level} (Sem {semFee.sem}, {semFee.year})</td><td style={{padding:'10px',borderTop:`1px solid ${T.border}`,textAlign:'right',fontSize:12,color:T.muted}}>{fmtMoney(semFee.totalDue)}</td></tr>
              <tr><td style={{padding:'10px 10px 0',borderTop:`2px solid ${T.navy}`,fontWeight:700,fontSize:14}}>{isInstalment?`Instalment ${instIdx} of ${instCount}`:'Amount Paid'}{inst.method?` · ${inst.method}`:''}</td>
              <td style={{padding:'10px 10px 0',borderTop:`2px solid ${T.navy}`,textAlign:'right',fontWeight:900,fontSize:18,color:T.navy}}>{fmtMoney(inst.amount)}</td></tr>
            </tbody>
          </table>
          {isInstalment && (
            <div style={{border:`2px dashed ${T.orange}`,borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div><div style={{fontSize:11,color:T.muted,textTransform:'uppercase',letterSpacing:'.05em'}}>Paid to Date</div><div style={{fontWeight:700,fontSize:15}}>{fmtMoney(paidToDate)}<span style={{fontSize:12,color:T.muted}}> / {fmtMoney(semFee.totalDue)}</span></div></div>
              <div style={{textAlign:'right'}}><div style={{fontSize:11,color:T.muted,textTransform:'uppercase',letterSpacing:'.05em'}}>Balance</div><div style={{fontWeight:700,fontSize:15,color:balAfter>0?T.orange:T.green}}>{fmtMoney(balAfter)}</div></div>
            </div>
          )}
          <div style={{textAlign:'center',margin:'14px 0'}}>
            <span style={{display:'inline-block',border:`3px solid ${balAfter===0?T.green:T.sky}`,color:balAfter===0?T.green:T.sky,padding:'5px 18px',borderRadius:8,fontSize:15,fontWeight:800,transform:'rotate(-5deg)'}}>{balAfter===0?'✓ FULLY PAID':'✓ RECEIVED'}</span>
          </div>
          <div style={{fontSize:11,color:T.muted,textAlign:'center'}}>Official receipt — please retain for your records.</div>
        </div>
      </div>
      <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}><Btn onClick={()=>printDoc(html,`Receipt ${inst.receiptNo}`)}><Printer size={14}/>Print Receipt</Btn></div>
    </div>
  );
}

// ── ID CARD ───────────────────────────────────────────────────────────────────
function IDCard({student,cfg}) {
  const ac=pal(student.id);
  const bars=[14,22,9,17,24,11,19,15,23,10,18,13,21,12,20,16,24,9,17,13];
  const avHtml = student.photo
    ? `<img src="${student.photo}" style="width:68px;height:68px;border-radius:10px;object-fit:cover;flex-shrink:0"/>`
    : `<div style="width:68px;height:68px;background:${ac};border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:26px;font-weight:800;flex-shrink:0">${inits(student.name)}</div>`;
  const html=`<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#EEF2F7}.card{width:350px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.2)}.top{background:${ac};padding:16px 18px;color:white}.sch{font-size:10px;font-weight:700;opacity:.75;text-transform:uppercase;letter-spacing:1.5px}.ttl{font-size:15px;font-weight:800;margin-top:2px}.body{background:white;padding:16px 18px;display:flex;gap:13px;align-items:flex-start}.nm{font-size:15px;font-weight:800;color:#1E293B}.id{font-size:11px;color:#64748B;font-family:monospace;margin:4px 0}.dt{font-size:12px;color:#64748B;margin:2px 0}.foot{background:${ac};padding:8px 18px;display:flex;justify-content:space-between;align-items:center}.vd{color:rgba(255,255,255,.6);font-size:10px}.bc{display:flex;gap:2px;align-items:flex-end}</style><div class="card"><div class="top"><div class="sch">${cfg.schoolName}</div><div class="ttl">Student Identity Card</div></div><div class="body">${avHtml}<div><div class="nm">${student.name}</div><div class="id">${student.id}</div><div class="dt">Level: ${student.level}</div><div class="dt">Semester ${student.semester}, ${student.year}</div><div class="dt">DOB: ${fmtDate(student.dob)}</div></div></div><div class="foot"><div class="vd">Valid ${student.year}</div><div class="bc">${bars.map(h=>`<div style="background:rgba(255,255,255,.65);width:2px;height:${h}px"></div>`).join('')}</div></div></div>`;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'center',padding:'22px 22px 8px'}}>
        <div style={{width:350,borderRadius:16,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.14)'}}>
          <div style={{background:ac,padding:'16px 18px',color:'white'}}>
            <div style={{fontSize:10,fontWeight:700,opacity:.75,textTransform:'uppercase',letterSpacing:1.5}}>{cfg.schoolName}</div>
            <div style={{fontSize:15,fontWeight:800,marginTop:2}}>Student Identity Card</div>
          </div>
          <div style={{background:'white',padding:'16px 18px',display:'flex',gap:13,alignItems:'flex-start'}}>
            <Av photo={student.photo} name={student.name} id={student.id} sz={68} r={10}/>
            <div><div style={{fontSize:15,fontWeight:800,color:T.text}}>{student.name}</div><div style={{fontSize:11,color:T.muted,fontFamily:'monospace',margin:'4px 0'}}>{student.id}</div><div style={{fontSize:12,color:T.muted}}>Level: {student.level}</div><div style={{fontSize:12,color:T.muted}}>Semester {student.semester}, {student.year}</div><div style={{fontSize:12,color:T.muted}}>DOB: {fmtDate(student.dob)}</div></div>
          </div>
          <div style={{background:ac,padding:'8px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'rgba(255,255,255,.6)',fontSize:10}}>Valid {student.year}</span>
            <div style={{display:'flex',gap:2,alignItems:'flex-end'}}>{bars.map((h,i)=><div key={i} style={{background:'rgba(255,255,255,.65)',width:2,height:h}}/>)}</div>
          </div>
        </div>
      </div>
      <div style={{padding:'10px 22px 20px',display:'flex',justifyContent:'center'}}><Btn onClick={()=>printDoc(html,`ID Card – ${student.name}`)}><Printer size={14}/>Print ID Card</Btn></div>
    </div>
  );
}

// ── REG FORM ──────────────────────────────────────────────────────────────────
function RegFormModal({student,cfg,onClose,onSaveCfg}) {
  const [rf,setRf]=useState({...cfg.regForm});
  const [prefill,setPrefill]=useState(!!student);
  const [editing,setEditing]=useState(false);
  const s=student;
  const upd=(k,v)=>setRf(x=>({...x,[k]:v}));

  const printHtml=`<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman',serif;color:#1E293B;font-size:13px}.pg{max-width:680px;margin:0 auto}.hdr{text-align:center;border-bottom:2px solid #0F2240;padding-bottom:14px;margin-bottom:18px}.sn{font-size:18px;font-weight:900;color:#0F2240}.sub{font-size:11px;color:#64748B;margin-top:2px}.ftitle{font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:10px;color:#0F2240}.sh{font-size:10px;font-weight:800;color:#0F2240;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #0F2240;padding-bottom:3px;margin:16px 0 10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}.field{margin-bottom:8px}.fl{font-size:10px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px}.fv{border-bottom:1px solid #94A3B8;padding-bottom:2px;font-size:13px;min-height:20px}.feerow{display:flex;justify-content:space-between;border:1px solid #E2E8F0;padding:8px 12px;border-radius:4px}.terms{font-size:11px;line-height:1.8;white-space:pre-line;color:#374151}.sigrow{display:grid;grid-template-columns:1fr 40px 1fr;gap:0 20px;align-items:flex-end;margin-top:24px}.sigline{border-bottom:1.5px solid #1E293B;min-height:30px;margin-bottom:3px}.siglabel{font-size:10px;color:#64748B;text-align:center}.office{background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:4px;padding:12px;margin-top:20px}.offh{font-size:10px;font-weight:700;text-transform:uppercase;color:#64748B;margin-bottom:10px}@media print{@page{size:A4;margin:18mm}}</style>
<div class="pg"><div class="hdr"><div class="sn">${cfg.schoolName}</div><div class="sub">${cfg.address} | ${cfg.phone} | ${cfg.email}</div><div class="ftitle">${rf.title}</div></div>
<p style="font-size:11px;color:#64748B;margin-bottom:14px">${rf.intro}</p>
<div class="sh">Section A — Student Particulars</div><div class="grid">
<div class="field" style="grid-column:1/-1"><div class="fl">Full Name (as per IC / Passport)</div><div class="fv">${prefill&&s?.name?s.name:''}</div></div>
<div class="field"><div class="fl">IC / Passport No.</div><div class="fv">${prefill&&s?.ic?s.ic:''}</div></div>
<div class="field"><div class="fl">Date of Birth</div><div class="fv">${prefill&&s?.dob?fmtDate(s.dob):''}</div></div>
<div class="field"><div class="fl">Gender</div><div class="fv">${prefill&&s?.gender?s.gender:''}</div></div>
<div class="field"><div class="fl">Level Applying For</div><div class="fv">${prefill&&s?.level?s.level:''}</div></div>
<div class="field" style="grid-column:1/-1"><div class="fl">Home Address</div><div class="fv" style="min-height:36px">${prefill&&s?.address?s.address:''}</div></div>
</div>
<div class="sh">Section B — Parent / Guardian Particulars</div><div class="grid">
<div class="field" style="grid-column:1/-1"><div class="fl">Parent / Guardian Full Name</div><div class="fv">${prefill&&s?.parentName?s.parentName:''}</div></div>
<div class="field"><div class="fl">Relationship to Student</div><div class="fv"></div></div>
<div class="field"><div class="fl">IC / Passport No.</div><div class="fv"></div></div>
<div class="field"><div class="fl">Phone Number</div><div class="fv">${prefill&&s?.parentPhone?s.parentPhone:''}</div></div>
<div class="field"><div class="fl">Email Address</div><div class="fv">${prefill&&s?.parentEmail?s.parentEmail:''}</div></div>
</div>
<div class="sh">Section C — Registration Fee</div>
<div class="feerow"><span>${rf.regFeeLabel}</span><strong>RM ${parseFloat(rf.regFee).toFixed(2)}</strong></div>
<p style="font-size:11px;color:#64748B;margin-top:6px">Tuition fees are as per the school's current fee schedule available at the front office.</p>
<div class="sh">Section D — Terms &amp; Conditions</div><div class="terms">${rf.terms.replace(/</g,'&lt;')}</div>
<div class="sh">Declaration</div>
<p style="font-size:11px;line-height:1.7;color:#374151;margin-bottom:20px">${rf.declaration.replace(/</g,'&lt;')}</p>
<div class="sigrow"><div><div class="sigline"></div><div class="siglabel">Parent / Guardian Signature</div></div><div style="text-align:center;color:#94A3B8;padding-bottom:6px">·</div><div><div class="sigline"></div><div class="siglabel">Date</div></div></div>
<div class="office"><div class="offh">For Office Use Only</div><div class="grid">
<div class="field"><div class="fl">Registration No.</div><div class="fv">${prefill&&s?.id?s.id:''}</div></div>
<div class="field"><div class="fl">Date Received</div><div class="fv"></div></div>
<div class="field"><div class="fl">Processed By</div><div class="fv"></div></div>
<div class="field"><div class="fl">Approved By</div><div class="fv"></div></div>
</div></div></div>`;

  return (
    <Mdl title={student?`Reg Form — ${student.name}`:'Blank Registration Form'} onClose={onClose} extraWide>
      <div style={{padding:'10px 18px',borderBottom:`1px solid ${T.border}`,display:'flex',gap:10,alignItems:'center',background:'#F8FAFC',flexShrink:0}}>
        {student && (
          <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer',color:T.text}}>
            <input type="checkbox" checked={prefill} onChange={e=>setPrefill(e.target.checked)} style={{cursor:'pointer'}}/>
            Pre-fill student data
          </label>
        )}
        <div style={{flex:1}}/>
        <Btn sm v="outline" onClick={()=>setEditing(x=>!x)}>{editing?<><ChevronDown size={13}/>Hide Editor</>:<><ChevronRight size={13}/>Edit Content</>}</Btn>
        <Btn sm v="outline" onClick={()=>onSaveCfg({...cfg,regForm:rf})}><Check size={13}/>Save as Default</Btn>
        <Btn sm onClick={()=>printDoc(printHtml,`Registration Form${s?` — ${s.name}`:''}`)}><Printer size={13}/>Print Form</Btn>
      </div>

      {editing && (
        <div style={{padding:'16px 22px',borderBottom:`1px solid ${T.border}`,background:'#F0F9FF'}}>
          <div style={{fontSize:12,fontWeight:700,color:T.sky,marginBottom:12,textTransform:'uppercase',letterSpacing:'.06em'}}>Form Content Editor</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
            <Inp label="Form Title" value={rf.title} onChange={e=>upd('title',e.target.value)}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 10px'}}>
              <Inp label="Reg Fee (RM)" type="number" value={rf.regFee} onChange={e=>upd('regFee',Number(e.target.value))}/>
              <Inp label="Fee Label" value={rf.regFeeLabel} onChange={e=>upd('regFeeLabel',e.target.value)}/>
            </div>
            <Txta col="1/-1" label="Introduction Text" rows={2} value={rf.intro} onChange={e=>upd('intro',e.target.value)}/>
            <Txta col="1/-1" label="Terms & Conditions" rows={6} value={rf.terms} onChange={e=>upd('terms',e.target.value)}/>
            <Txta col="1/-1" label="Declaration" rows={3} value={rf.declaration} onChange={e=>upd('declaration',e.target.value)}/>
          </div>
        </div>
      )}

      <div style={{padding:22}}>
        <div style={{textAlign:'center',borderBottom:`2px solid ${T.navy}`,paddingBottom:14,marginBottom:18}}>
          <div style={{fontSize:18,fontWeight:900,color:T.navy}}>{cfg.schoolName}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>{cfg.address} | {cfg.phone} | {cfg.email}</div>
          <div style={{fontSize:14,fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginTop:10,color:T.navy}}>{rf.title}</div>
        </div>
        <div style={{fontSize:11,color:T.muted,marginBottom:14,lineHeight:1.5}}>{rf.intro}</div>

        {[{h:'Section A — Student Particulars',fields:[{l:'Full Name (as per IC / Passport)',v:s?.name,full:true},{l:'IC / Passport No.',v:s?.ic},{l:'Date of Birth',v:fmtDate(s?.dob)},{l:'Gender',v:s?.gender},{l:'Level Applying For',v:s?.level},{l:'Home Address',v:s?.address,full:true}]},{h:'Section B — Parent / Guardian Particulars',fields:[{l:'Parent / Guardian Full Name',v:s?.parentName,full:true},{l:'Relationship to Student',v:''},{l:'IC / Passport No.',v:''},{l:'Phone Number',v:s?.parentPhone},{l:'Email Address',v:s?.parentEmail}]}].map(sec=>(
          <div key={sec.h}>
            <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:'uppercase',letterSpacing:'.1em',borderBottom:`2px solid ${T.navy}`,paddingBottom:4,marginBottom:12,marginTop:18}}>{sec.h}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 20px'}}>
              {sec.fields.map(({l,v,full})=>(
                <div key={l} style={{gridColumn:full?'1/-1':undefined,marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'.04em',marginBottom:2}}>{l}</div>
                  <div style={{borderBottom:`1.5px solid ${prefill&&v?T.text:'#CBD5E1'}`,paddingBottom:3,fontSize:13,minHeight:22,color:T.text,fontWeight:prefill&&v?500:400}}>{prefill?v||'':''}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:'uppercase',letterSpacing:'.1em',borderBottom:`2px solid ${T.navy}`,paddingBottom:4,marginBottom:12,marginTop:18}}>Section C — Registration Fee</div>
        <div style={{display:'flex',justifyContent:'space-between',border:`1px solid ${T.border}`,padding:'10px 14px',borderRadius:8,marginBottom:6}}>
          <span style={{fontSize:13}}>{rf.regFeeLabel}</span>
          <span style={{fontWeight:800,fontSize:14,color:T.navy}}>RM {parseFloat(rf.regFee).toFixed(2)}</span>
        </div>
        <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Tuition fees are as per the school's current fee schedule available at the front office.</div>

        <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:'uppercase',letterSpacing:'.1em',borderBottom:`2px solid ${T.navy}`,paddingBottom:4,marginBottom:12,marginTop:18}}>Section D — Terms & Conditions</div>
        <div style={{fontSize:11,color:T.text,lineHeight:1.8,whiteSpace:'pre-line',padding:'10px 14px',background:'#F8FAFC',borderRadius:8}}>{rf.terms}</div>

        <div style={{fontSize:11,fontWeight:800,color:T.navy,textTransform:'uppercase',letterSpacing:'.1em',borderBottom:`2px solid ${T.navy}`,paddingBottom:4,marginBottom:12,marginTop:18}}>Declaration</div>
        <div style={{fontSize:11,color:T.text,lineHeight:1.7,marginBottom:24}}>{rf.declaration}</div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr',gap:'0 20px',alignItems:'flex-end',marginBottom:20}}>
          <div><div style={{borderBottom:`1.5px solid ${T.text}`,minHeight:32,marginBottom:4}}/><div style={{fontSize:10,color:T.muted,textAlign:'center'}}>Parent / Guardian Signature</div></div>
          <div style={{textAlign:'center',color:T.muted,paddingBottom:6}}>·</div>
          <div><div style={{borderBottom:`1.5px solid ${T.text}`,minHeight:32,marginBottom:4}}/><div style={{fontSize:10,color:T.muted,textAlign:'center'}}>Date</div></div>
        </div>

        <div style={{background:'#F8FAFC',border:`1px dashed ${T.border}`,borderRadius:8,padding:14}}>
          <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>For Office Use Only</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 20px'}}>
            {[{l:'Registration No.',v:s?.id},{l:'Date Received',v:''},{l:'Processed By',v:''},{l:'Approved By',v:''}].map(({l,v})=>(
              <div key={l} style={{marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:600,color:T.muted,textTransform:'uppercase',letterSpacing:'.04em',marginBottom:2}}>{l}</div>
                <div style={{borderBottom:`1px solid #CBD5E1`,paddingBottom:3,fontSize:13,minHeight:20}}>{prefill?v||'':''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Mdl>
  );
}

// ── STUDENT FORM ──────────────────────────────────────────────────────────────
const BLANK={name:'',ic:'',dob:'',gender:'Male',phone:'',email:'',photo:null,level:'Secondary 1',semester:2,year:2026,enrolledOn:today(),status:'active',parentName:'',parentPhone:'',parentEmail:'',address:'',notes:'',semFees:[]};

function StudentForm({student,onSave,onClose,cfg,allStudents}) {
  const isEdit=!!student?.id;
  const [f,setF]=useState(student?{...student,notes:student.notes||''}:{...BLANK,semester:cfg.currentSemester,year:cfg.currentYear});
  const [tab,setTab]=useState('personal');
  const [icWarn,setIcWarn]=useState('');
  const u=(k,v)=>setF(prev=>({...prev,[k]:v}));
  const g=k=>f[k]??'';
  const grid={display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'};
  const TB=({t,l})=><button onClick={()=>setTab(t)} style={{padding:'8px 14px',border:'none',cursor:'pointer',fontWeight:600,fontSize:13,borderBottom:tab===t?`2px solid ${T.sky}`:'2px solid transparent',color:tab===t?T.sky:T.muted,background:'none'}}>{l}</button>;
  const handlePhoto=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>u('photo',ev.target.result);r.readAsDataURL(file);};
  const handleSave=()=>{
    if(!f.name||!f.level)return;
    if(f.ic&&allStudents){
      const dup=(allStudents||[]).find(s=>s.ic===f.ic&&s.id!==f.id);
      if(dup){setIcWarn(`IC already registered to ${dup.name} (${dup.id})`);setTab('personal');return;}
    }
    onSave(isEdit?f:{...f,id:genId('STU')});
  };
  return (
    <Mdl title={isEdit?`Edit: ${student.name}`:'Register New Student'} onClose={onClose} wide>
      <div style={{borderBottom:`1px solid ${T.border}`,display:'flex',padding:'0 18px',gap:2,flexShrink:0}}>
        <TB t="personal" l="Personal"/><TB t="academic" l="Academic"/><TB t="parent" l="Parent"/><TB t="notes" l="Notes"/>
      </div>
      <div style={{padding:20}}>
        {tab==='personal'&&<div style={grid}>
          <Inp col="1/-1" label="Full Name *" value={g('name')} onChange={e=>u('name',e.target.value)} placeholder="As per IC / passport"/>
          <div style={{gridColumn:'1/-1',marginBottom:12}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:T.muted,marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em'}}>IC / Passport No.</label>
            <input value={g('ic')} onChange={e=>{u('ic',e.target.value);setIcWarn('');}} placeholder="000000-00-0000" style={{...iBase,borderColor:icWarn?T.red:T.border}}/>
            {icWarn&&<div style={{fontSize:12,color:T.red,marginTop:4}}>⚠ {icWarn}</div>}
          </div>
          <Inp label="Date of Birth" type="date" value={g('dob')} onChange={e=>u('dob',e.target.value)}/>
          <Sel label="Gender" value={g('gender')} onChange={e=>u('gender',e.target.value)}><option>Male</option><option>Female</option></Sel>
          <Sel label="Status" value={g('status')} onChange={e=>u('status',e.target.value)}>
            {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </Sel>
          <Inp label="Phone" value={g('phone')} onChange={e=>u('phone',e.target.value)} placeholder="01X-XXX XXXX"/>
          <Inp label="Email" type="email" value={g('email')} onChange={e=>u('email',e.target.value)} placeholder="student@email.com"/>
          <Txta col="1/-1" label="Address" value={g('address')} onChange={e=>u('address',e.target.value)} placeholder="Full home address"/>
          <div style={{gridColumn:'1/-1',marginBottom:8}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>Student Photo</label>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <Av photo={g('photo')} name={g('name')||'?'} id={g('id')} sz={60} r={10}/>
              <div>
                <label style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 11px',border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',background:'white',color:T.text}}>
                  📷 Upload Photo<input type="file" accept="image/*" onChange={handlePhoto} style={{display:'none'}}/>
                </label>
                {g('photo')&&<button onClick={()=>u('photo',null)} style={{marginLeft:8,padding:'5px 11px',border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,cursor:'pointer',background:'white',color:T.red,fontWeight:600}}>Remove</button>}
                <div style={{fontSize:11,color:T.muted,marginTop:4}}>Shown on ID card and profile. JPG or PNG.</div>
              </div>
            </div>
          </div>
        </div>}
        {tab==='academic'&&<div style={grid}>
          <Sel col="1/-1" label="Education Level *" value={g('level')} onChange={e=>u('level',e.target.value)}>{LEVELS.map(l=><option key={l}>{l}</option>)}</Sel>
          <Sel label="Current Semester" value={g('semester')} onChange={e=>u('semester',Number(e.target.value))}><option value={1}>Semester 1</option><option value={2}>Semester 2</option></Sel>
          <Inp label="Academic Year" type="number" value={g('year')} onChange={e=>u('year',Number(e.target.value))}/>
          <Inp col="1/-1" label="Enrollment Date" type="date" value={g('enrolledOn')} onChange={e=>u('enrolledOn',e.target.value)}/>
        </div>}
        {tab==='parent'&&<div style={grid}>
          <Inp col="1/-1" label="Parent / Guardian Name" value={g('parentName')} onChange={e=>u('parentName',e.target.value)}/>
          <Inp label="Parent Phone" value={g('parentPhone')} onChange={e=>u('parentPhone',e.target.value)} placeholder="01X-XXX XXXX"/>
          <Inp label="Parent Email" type="email" value={g('parentEmail')} onChange={e=>u('parentEmail',e.target.value)} placeholder="parent@email.com"/>
        </div>}
        {tab==='notes'&&<div>
          <div style={{fontSize:12,color:T.muted,marginBottom:10}}>Internal admin notes — not printed on any document.</div>
          <Txta label="Notes" rows={7} value={g('notes')} onChange={e=>u('notes',e.target.value)} placeholder="Medical conditions, special arrangements, sibling info, admin flags…"/>
        </div>}
      </div>
      <div style={{padding:'12px 20px',borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'flex-end',gap:8,flexShrink:0}}>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}><UserCheck size={14}/>{isEdit?'Save Changes':'Register Student'}</Btn>
      </div>
    </Mdl>
  );
}

// ── PAYMENTS TAB ──────────────────────────────────────────────────────────────
function PaymentsTab({student,cfg,onUpdate,onViewReceipt}) {
  const [adding,setAdding]=useState(false);
  const [pf,setPf]=useState({sem:cfg.currentSemester,year:cfg.currentYear,totalDue:'',amount:'',date:today(),method:'Cash',note:''});
  const u=k=>v=>setPf(x=>({...x,[k]:v}));

  const openAdd=()=>{
    const ef=semFeeOf(student,cfg);
    const et=semTotals(ef);
    const suggested=ef?Math.max(0,et.balance):suggestFeeAmt(student.level,cfg.fees);
    setPf({sem:cfg.currentSemester,year:cfg.currentYear,totalDue:ef?ef.totalDue:suggestFeeAmt(student.level,cfg.fees),amount:suggested,date:today(),method:'Cash',note:''});
    setAdding(true);
  };

  const addPayment=()=>{
    const semN=Number(pf.sem),yrN=Number(pf.year),amt=Number(pf.amount);
    if(!amt)return;
    const newInst={id:genId('INS'),amount:amt,date:pf.date,method:pf.method,note:pf.note,receiptNo:genRec(yrN)};
    const idx=(student.semFees||[]).findIndex(sf=>sf.sem===semN&&sf.year===yrN);
    let newSF;
    if(idx>=0){newSF=student.semFees.map((sf,i)=>i===idx?{...sf,installments:[...sf.installments,newInst]}:sf);}
    else{newSF=[...(student.semFees||[]),{id:genId('SF'),sem:semN,year:yrN,totalDue:Number(pf.totalDue)||suggestFeeAmt(student.level,cfg.fees)||amt,installments:[newInst]}];}
    onUpdate({...student,semFees:newSF});
    setAdding(false);
  };

  const deleteInst=(sfId,instId)=>{
    const newSF=(student.semFees||[]).map(sf=>{
      if(sf.id!==sfId)return sf;
      const insts=sf.installments.filter(i=>i.id!==instId);
      return {...sf,installments:insts};
    }).filter(sf=>sf.installments.length>0);
    onUpdate({...student,semFees:newSF});
  };

  const currentSF=semFeeOf(student,cfg);
  const ct=semTotals(currentSF);
  const pct=ct.due>0?Math.min(100,Math.round(ct.paid/ct.due*100)):0;
  const ps=payStatus(student,cfg);
  const existSF=(student.semFees||[]).find(sf=>sf.sem===Number(pf.sem)&&sf.year===Number(pf.year));
  const existT=semTotals(existSF);

  return (
    <div style={{padding:20}}>
      <div style={{background:'#F8FAFC',borderRadius:12,padding:16,marginBottom:16,border:`1px solid ${T.border}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:ct.due>0?10:0}}>
          <div style={{fontSize:13,fontWeight:700,color:T.text}}>Semester {cfg.currentSemester}, {cfg.currentYear} — Current</div>
          <SBadge s={ps}/>
        </div>
        {ct.due>0?(
          <>
            <div style={{background:T.border,borderRadius:99,height:8,overflow:'hidden',marginBottom:8}}>
              <div style={{height:'100%',borderRadius:99,background:ct.balance===0?T.green:ct.paid>0?T.orange:T.border,width:`${pct}%`,transition:'width .4s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
              <span style={{color:T.muted}}>Total Due <strong style={{color:T.text}}>{fmtMoney(ct.due)}</strong></span>
              <span style={{color:T.muted}}>Paid <strong style={{color:T.green}}>{fmtMoney(ct.paid)}</strong></span>
              <span style={{color:T.muted}}>Balance <strong style={{color:ct.balance>0?T.orange:T.green}}>{fmtMoney(ct.balance)}</strong></span>
            </div>
          </>
        ):(
          <div style={{fontSize:13,color:T.muted,marginTop:4}}>No fee record for this semester yet. Click "Add Payment" to record.</div>
        )}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:600,color:T.text}}>All Payment Records</div>
        <Btn sm onClick={openAdd}><Plus size={13}/>Add Payment</Btn>
      </div>

      {adding&&(
        <div style={{background:'#F0F9FF',border:'1px solid #BAE6FD',borderRadius:10,padding:16,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>Record Payment / Instalment</div>
          {existSF&&<div style={{fontSize:12,color:T.orange,marginBottom:10,background:'#FFF7ED',padding:'5px 10px',borderRadius:6}}>⚡ Existing record — Balance: {fmtMoney(existT.balance)}</div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            <Sel label="Semester" value={pf.sem} onChange={e=>setPf(x=>({...x,sem:e.target.value}))}><option value={1}>Semester 1</option><option value={2}>Semester 2</option></Sel>
            <Inp label="Year" type="number" value={pf.year} onChange={e=>setPf(x=>({...x,year:e.target.value}))}/>
            {!existSF&&<Inp label="Total Due (RM)" type="number" value={pf.totalDue} onChange={e=>setPf(x=>({...x,totalDue:e.target.value}))} placeholder={suggestFeeAmt(student.level,cfg.fees)||'0.00'}/>}
            <Inp label={existSF?`Paying (Bal: ${fmtMoney(existT.balance)})`:'Amount (RM)'} type="number" value={pf.amount} onChange={e=>setPf(x=>({...x,amount:e.target.value}))} placeholder="0.00"/>
            <Sel label="Payment Method" value={pf.method} onChange={e=>setPf(x=>({...x,method:e.target.value}))}>{PMETHODS.map(m=><option key={m}>{m}</option>)}</Sel>
            <Inp label="Date Paid" type="date" value={pf.date} onChange={e=>setPf(x=>({...x,date:e.target.value}))}/>
            <Inp col="1/-1" label="Note (optional)" value={pf.note} onChange={e=>setPf(x=>({...x,note:e.target.value}))} placeholder="e.g. 1st instalment, full payment…"/>
          </div>
          <div style={{display:'flex',gap:7,marginTop:8}}>
            <Btn sm onClick={addPayment} disabled={!pf.amount} v="green"><Check size={13}/>Confirm</Btn>
            <Btn sm v="outline" onClick={()=>setAdding(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {(student.semFees||[]).length===0?(
        <div style={{textAlign:'center',padding:'32px 0',color:T.muted}}>
          <DollarSign size={32} style={{opacity:.3,display:'block',margin:'0 auto 7px'}}/>
          <div style={{fontSize:14}}>No payment records yet.</div>
          <Btn sm onClick={openAdd} style={{marginTop:10}}><Plus size={12}/>Add First Payment</Btn>
        </div>
      ):(
        [...(student.semFees||[])].sort((a,b)=>b.year-a.year||b.sem-a.sem).map(sf=>{
          const t=semTotals(sf);
          const pct2=t.due>0?Math.min(100,Math.round(t.paid/t.due*100)):0;
          const st=t.balance===0?'paid':t.paid>0?'partial':'unpaid';
          return (
            <div key={sf.id} style={{border:`1px solid ${T.border}`,borderRadius:10,marginBottom:12,overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',background:'#F8FAFC'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.text}}>Semester {sf.sem}, {sf.year}</div>
                  <SBadge s={st}/>
                </div>
                <div style={{fontSize:13,color:T.muted}}>
                  <strong style={{color:T.green}}>{fmtMoney(t.paid)}</strong> / {fmtMoney(t.due)}
                  {t.balance>0&&<span style={{color:T.orange,marginLeft:8}}>({fmtMoney(t.balance)} left)</span>}
                </div>
              </div>
              {t.due>0&&<div style={{padding:'0 14px 6px',background:'#F8FAFC'}}><div style={{background:T.border,borderRadius:99,height:4,overflow:'hidden'}}><div style={{height:'100%',borderRadius:99,background:t.balance===0?T.green:T.orange,width:`${pct2}%`}}/></div></div>}
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#FAFAFA'}}><Th c="#"/><Th c="Receipt"/><Th c="Method"/><Th c="Amount"/><Th c="Note"/><Th c="Date"/><Th c=""/></tr></thead>
                <tbody>
                  {sf.installments.map((inst,i)=>(
                    <tr key={inst.id}>
                      <Td s={{fontSize:12,color:T.muted,width:32}}>{i+1}</Td>
                      <Td s={{fontFamily:'monospace',fontSize:11,color:T.muted}}>{inst.receiptNo}</Td>
                      <Td s={{fontSize:12}}><Pill label={inst.method||'—'} color={T.sky}/></Td>
                      <Td s={{fontWeight:700,color:T.green}}>{fmtMoney(inst.amount)}</Td>
                      <Td s={{color:T.muted,fontSize:12}}>{inst.note||'—'}</Td>
                      <Td s={{color:T.muted,fontSize:12}}>{fmtDate(inst.date)}</Td>
                      <Td>
                        <div style={{display:'flex',gap:3}}>
                          <Btn sm v="outline" onClick={()=>onViewReceipt({inst,semFee:sf})}><FileText size={12}/>Receipt</Btn>
                          <button onClick={()=>{ if(window.confirm('Delete this payment entry?')) deleteInst(sf.id,inst.id); }} title="Delete entry" style={{padding:'4px 6px',border:`1px solid ${T.border}`,borderRadius:6,cursor:'pointer',background:'white',lineHeight:0}}><Trash2 size={12} color={T.red}/></button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── STUDENT DETAIL ────────────────────────────────────────────────────────────
function StudentDetail({student,cfg,onClose,onEdit,onUpdate,onViewReceipt,onRegForm}) {
  const [tab,setTab]=useState('profile');
  const ps=payStatus(student,cfg);
  const TB=({t,l})=><button onClick={()=>setTab(t)} style={{padding:'9px 14px',border:'none',cursor:'pointer',fontWeight:600,fontSize:13,borderBottom:tab===t?`2px solid ${T.sky}`:'2px solid transparent',color:tab===t?T.sky:T.muted,background:'none'}}>{l}</button>;
  const phone=(student.parentPhone||'').replace(/[^0-9]/g,'');
  const waUrl=phone?`https://wa.me/6${phone}?text=${encodeURIComponent(waMsg(student,cfg))}`:null;
  return (
    <Mdl title="Student Profile" onClose={onClose} wide>
      <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyLt})`,padding:'20px 22px',color:'white',display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
        <Av photo={student.photo} name={student.name} id={student.id} sz={60} r={13}/>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800}}>{student.name}</div>
          <div style={{fontSize:13,opacity:.6,marginTop:1}}>{student.id} · {student.level}</div>
          <div style={{display:'flex',gap:6,marginTop:7}}><SBadge s={ps}/><SBadge s={student.status}/></div>
        </div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',justifyContent:'flex-end'}}>
          {waUrl&&<a href={waUrl} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 11px',border:'1px solid rgba(255,255,255,.25)',background:'rgba(255,255,255,.1)',color:'white',borderRadius:8,fontSize:12,fontWeight:600,textDecoration:'none'}}>💬 WhatsApp</a>}
          <Btn sm onClick={onRegForm} style={{border:'1px solid rgba(255,255,255,.25)',background:'rgba(255,255,255,.1)',color:'white'}}><ClipboardList size={13}/>Reg Form</Btn>
          <Btn sm onClick={onEdit} style={{border:'1px solid rgba(255,255,255,.25)',background:'rgba(255,255,255,.1)',color:'white'}}><Edit2 size={13}/>Edit</Btn>
        </div>
      </div>
      <div style={{borderBottom:`1px solid ${T.border}`,display:'flex',padding:'0 20px'}}>
        <TB t="profile" l="Profile"/><TB t="payments" l="Payments"/><TB t="card" l="ID Card"/>
        {student.notes&&<TB t="notes" l="📝 Notes"/>}
      </div>
      {tab==='profile'&&(
        <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[{h:'Personal',rows:[['IC / Passport',student.ic||'—'],['Date of Birth',fmtDate(student.dob)],['Gender',student.gender||'—'],['Phone',student.phone||'—'],['Email',student.email||'—']]},{h:'Academic',rows:[['Level',student.level],['Semester',`Semester ${student.semester}`],['Year',student.year],['Enrolled',fmtDate(student.enrolledOn)],['Status',student.status]]},{h:'Parent / Guardian',rows:[['Name',student.parentName||'—'],['Phone',student.parentPhone||'—'],['Email',student.parentEmail||'—']]},{h:'Address',rows:[['',student.address||'Not provided']]}].map(({h,rows})=>(
            <div key={h} style={{background:'#F8FAFC',borderRadius:10,padding:'13px 14px'}}>
              <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:9}}>{h}</div>
              {rows.map(([k,v])=>(<div key={k||String(v)} style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13}}>{k&&<span style={{color:T.muted}}>{k}</span>}<span style={{fontWeight:500,color:T.text,textAlign:'right',maxWidth:k?'64%':'100%'}}>{v}</span></div>))}
            </div>
          ))}
        </div>
      )}
      {tab==='payments'&&<PaymentsTab student={student} cfg={cfg} onUpdate={onUpdate} onViewReceipt={onViewReceipt}/>}
      {tab==='card'&&<IDCard student={student} cfg={cfg}/>}
      {tab==='notes'&&<div style={{padding:20}}><div style={{background:'#FFFBEB',border:`1px solid ${T.amber}`,borderRadius:10,padding:'14px 16px',whiteSpace:'pre-wrap',fontSize:14,lineHeight:1.7,color:T.text}}>{student.notes||'No notes.'}</div></div>}
    </Mdl>
  );
}

// ── OUTSTANDING REPORT ────────────────────────────────────────────────────────
function OutstandingReport({students,cfg,onClose}) {
  const rows=students
    .filter(s=>!isArchived(s)&&payStatus(s,cfg)!=='paid')
    .map(s=>{const sf=semFeeOf(s,cfg);const t=semTotals(sf);return{s,sf,t,ps:payStatus(s,cfg)};})
    .sort((a,b)=>b.t.balance-a.t.balance);
  const totalBal=rows.reduce((sum,r)=>sum+(r.t.balance||suggestFeeAmt(r.s.level,cfg.fees)),0);
  const html=`<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;color:#1E293B;font-size:13px;margin:24px}.hdr{border-bottom:2px solid #0F2240;padding-bottom:12px;margin-bottom:16px}.sn{font-size:18px;font-weight:900;color:#0F2240}.sub{font-size:11px;color:#64748B;margin-top:2px}.rpt{font-size:12px;font-weight:700;color:#F97316;letter-spacing:1px;margin-top:6px}table{width:100%;border-collapse:collapse;margin-top:10px}th{background:#F8FAFC;padding:8px 10px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase;border-bottom:2px solid #E2E8F0}td{padding:8px 10px;border-top:1px solid #E2E8F0;font-size:12px}.ft td{font-weight:700;border-top:2px solid #0F2240;background:#F8FAFC}@media print{@page{size:A4;margin:15mm}}</style>
<div class="hdr"><div class="sn">${cfg.schoolName}</div><div class="sub">${cfg.address} | Generated: ${new Date().toLocaleDateString('en-MY')}</div><div class="rpt">OUTSTANDING FEES — SEMESTER ${cfg.currentSemester}, ${cfg.currentYear}</div></div>
<table><thead><tr><th>#</th><th>Student</th><th>Level</th><th>Parent / Phone</th><th>Status</th><th style="text-align:right">Due</th><th style="text-align:right">Paid</th><th style="text-align:right">Balance</th></tr></thead><tbody>
${rows.map((r,i)=>`<tr><td>${i+1}</td><td><strong>${r.s.name}</strong><br/><span style="color:#64748B">${r.s.id}</span></td><td>${r.s.level}</td><td>${r.s.parentName||'—'}<br/><span style="color:#64748B">${r.s.parentPhone||'—'}</span></td><td>${r.ps==='partial'?'Partial':'Unpaid'}</td><td style="text-align:right">${fmtMoney(r.sf?r.t.due:suggestFeeAmt(r.s.level,cfg.fees))}</td><td style="text-align:right;color:#10B981">${fmtMoney(r.t.paid)}</td><td style="text-align:right;font-weight:700;color:${r.ps==='partial'?'#F97316':'#EF4444'}">${fmtMoney(r.t.balance||suggestFeeAmt(r.s.level,cfg.fees))}</td></tr>`).join('')}
</tbody><tfoot><tr class="ft"><td colspan="7" style="text-align:right">Total Outstanding</td><td style="text-align:right;color:#EF4444">${fmtMoney(totalBal)}</td></tr></tfoot></table>`;
  return (
    <Mdl title="Outstanding Fees Report" onClose={onClose} extraWide>
      <div style={{padding:'10px 18px',borderBottom:`1px solid ${T.border}`,display:'flex',gap:10,alignItems:'center',background:'#F8FAFC',flexShrink:0}}>
        <div style={{fontSize:13,color:T.muted}}>{rows.length} student{rows.length!==1?'s':''} outstanding · <strong style={{color:T.red}}>{fmtMoney(totalBal)}</strong> total</div>
        <div style={{flex:1}}/>
        <Btn sm onClick={()=>printDoc(html,'Outstanding Fees Report')}><Printer size={13}/>Print Report</Btn>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><Th c="#"/><Th c="Student"/><Th c="Level"/><Th c="Parent / Phone"/><Th c="Status"/><Th c="Due" right/><Th c="Paid" right/><Th c="Balance" right/><Th c=""/></tr></thead>
          <tbody>
            {rows.length===0?<tr><td colSpan={9} style={{textAlign:'center',padding:36,color:T.muted}}>All students are fully paid for this semester. 🎉</td></tr>
            :rows.map((r,i)=>{
              const phone=(r.s.parentPhone||'').replace(/[^0-9]/g,'');
              const waUrl=phone?`https://wa.me/6${phone}?text=${encodeURIComponent(waMsg(r.s,cfg))}`:null;
              const bal=r.t.balance||(r.sf?0:suggestFeeAmt(r.s.level,cfg.fees));
              return (
                <tr key={r.s.id}>
                  <Td s={{fontSize:12,color:T.muted,width:30}}>{i+1}</Td>
                  <Td><div style={{fontWeight:600}}>{r.s.name}</div><div style={{fontSize:11,color:T.muted,fontFamily:'monospace'}}>{r.s.id}</div></Td>
                  <Td s={{fontSize:13}}>{r.s.level}</Td>
                  <Td><div style={{fontSize:13}}>{r.s.parentName||'—'}</div><div style={{fontSize:11,color:T.muted}}>{r.s.parentPhone||'—'}</div></Td>
                  <Td><SBadge s={r.ps}/></Td>
                  <Td s={{textAlign:'right',fontSize:13}}>{fmtMoney(r.sf?r.t.due:suggestFeeAmt(r.s.level,cfg.fees))}</Td>
                  <Td s={{textAlign:'right',fontWeight:600,color:T.green}}>{fmtMoney(r.t.paid)}</Td>
                  <Td s={{textAlign:'right',fontWeight:800,color:r.ps==='partial'?T.orange:T.red}}>{fmtMoney(bal)}</Td>
                  <Td>{waUrl&&<a href={waUrl} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 8px',border:`1px solid ${T.border}`,borderRadius:6,fontSize:12,color:'#16a34a',background:'white',textDecoration:'none',fontWeight:600}}>💬 WA</a>}</Td>
                </tr>
              );
            })}
          </tbody>
          {rows.length>0&&<tfoot><tr style={{background:'#F8FAFC'}}><td colSpan={7} style={{padding:'10px 14px',fontWeight:700,fontSize:14,color:T.text,textAlign:'right'}}>Total Outstanding</td><td style={{padding:'10px 14px',fontWeight:900,fontSize:15,color:T.red,textAlign:'right',borderTop:`2px solid ${T.navy}`}}>{fmtMoney(totalBal)}</td><td/></tr></tfoot>}
        </table>
      </div>
    </Mdl>
  );
}

// ── ROLLOVER MODAL ────────────────────────────────────────────────────────────
function RolloverModal({students,cfg,onConfirm,onClose}) {
  const nextSem=cfg.currentSemester===1?2:1;
  const nextYear=cfg.currentSemester===2?cfg.currentYear+1:cfg.currentYear;
  const advanceLevel=cfg.currentSemester===2;
  const activeCount=students.filter(s=>s.status==='active').length;
  return (
    <Mdl title="Semester Rollover" onClose={onClose}>
      <div style={{padding:20}}>
        <div style={{background:'#FFF7ED',border:`1px solid #FED7AA`,borderRadius:10,padding:'12px 16px',marginBottom:18}}>
          <div style={{fontSize:14,fontWeight:700,color:T.orange,marginBottom:4}}>⚠ Review before continuing</div>
          <div style={{fontSize:13,color:T.text}}>This will advance the system to <strong>Semester {nextSem}, {nextYear}</strong> and update <strong>{activeCount} active students</strong>.</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {[['Currently','Sem '+cfg.currentSemester+', '+cfg.currentYear],['Moving To','Sem '+nextSem+', '+nextYear],['Level Advance',advanceLevel?'Yes — active students move up one level':'No — mid-year only'],['Fee Status','All students reset to Unpaid for Sem '+nextSem]].map(([l,v])=>(
            <div key={l} style={{background:'#F8FAFC',borderRadius:8,padding:'10px 12px'}}>
              <div style={{fontSize:11,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:3}}>{l}</div>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>{v}</div>
            </div>
          ))}
        </div>
        {advanceLevel&&<div style={{background:'#EDE9FE',border:`1px solid #C4B5FD`,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13,color:'#5B21B6'}}>📚 Level advance: e.g. Primary 6 → Secondary 1, Secondary 3 → Secondary 4. Upper 6 stays at Upper 6.</div>}
        <div style={{fontSize:12,color:T.muted}}>Inactive, withdrawn, and graduated students will not be affected.</div>
      </div>
      <div style={{padding:'12px 20px',borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'flex-end',gap:8,flexShrink:0}}>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn v="orange" onClick={()=>onConfirm(nextSem,nextYear,advanceLevel)}>🔄 Confirm Rollover</Btn>
      </div>
    </Mdl>
  );
}

// ── STUDENTS VIEW ─────────────────────────────────────────────────────────────
function StudentsView({students,setStudents,cfg,setCfg,onRollover}) {
  const [q,setQ]=useState('');
  const [fl,setFl]=useState('');
  const [fs,setFs]=useState('');
  const [showArchived,setShowArchived]=useState(false);
  const [sortField,setSortField]=useState('name');
  const [sortDir,setSortDir]=useState('asc');
  const [modal,setModal]=useState(null);
  const [waToast,setWaToast]=useState('');

  const doSort=f=>{if(sortField===f)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortField(f);setSortDir('asc');}};

  const list=useMemo(()=>{
    const filtered=students.filter(s=>{
      if(!showArchived&&isArchived(s))return false;
      const qn=q.toLowerCase();
      return(!qn||s.name.toLowerCase().includes(qn)||s.id.toLowerCase().includes(qn)||(s.ic||'').includes(qn)||(s.parentName||'').toLowerCase().includes(qn)||(s.parentPhone||'').includes(q))&&(!fl||s.level===fl)&&(!fs||payStatus(s,cfg)===fs);
    });
    return [...filtered].sort((a,b)=>{
      let va,vb;
      if(sortField==='name'){va=a.name;vb=b.name;}
      else if(sortField==='level'){va=LEVELS.indexOf(a.level);vb=LEVELS.indexOf(b.level);}
      else if(sortField==='status'){va=payStatus(a,cfg);vb=payStatus(b,cfg);}
      else if(sortField==='balance'){va=semTotals(semFeeOf(a,cfg)).balance;vb=semTotals(semFeeOf(b,cfg)).balance;}
      else{va=a.name;vb=b.name;}
      if(typeof va==='string')return sortDir==='asc'?va.localeCompare(vb):vb.localeCompare(va);
      return sortDir==='asc'?va-vb:vb-va;
    });
  },[students,q,fl,fs,showArchived,sortField,sortDir,cfg]);

  const ms=modal?.sid?students.find(x=>x.id===modal.sid):null;
  const save=s=>{setStudents(prev=>s.id&&prev.find(x=>x.id===s.id)?prev.map(x=>x.id===s.id?s:x):[...prev,s]);setModal(null);};
  const upd=s=>{setStudents(prev=>prev.map(x=>x.id===s.id?s:x));setModal(m=>({...m,type:'view',sid:s.id}));};
  const updQP=s=>{setStudents(prev=>prev.map(x=>x.id===s.id?s:x));setModal(null);};
  const del=id=>{if(window.confirm('Delete this student permanently?'))setStudents(p=>p.filter(x=>x.id!==id));};

  const handleWA=(s,e)=>{
    e.stopPropagation();
    const phone=(s.parentPhone||'').replace(/[^0-9]/g,'');
    if(!phone){alert('No parent phone number on record.');return;}
    copyText(waMsg(s,cfg));
    window.open(`https://wa.me/6${phone}?text=${encodeURIComponent(waMsg(s,cfg))}`,'_blank');
    setWaToast(s.id);setTimeout(()=>setWaToast(''),2000);
  };

  const activeCount=students.filter(s=>!isArchived(s)).length;
  const unpaidCount=students.filter(s=>!isArchived(s)&&payStatus(s,cfg)==='unpaid').length;
  const partialCount=students.filter(s=>!isArchived(s)&&payStatus(s,cfg)==='partial').length;
  const SH=({c,f})=><Th c={c} sortable active={sortField===f} dir={sortDir} onClick={()=>doSort(f)}/>;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div><h1 style={{fontSize:21,fontWeight:800,color:T.text,margin:0}}>Students</h1><p style={{fontSize:13,color:T.muted,margin:'3px 0 0'}}>{list.length} of {activeCount} active students</p></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>
          <Btn v="outline" onClick={()=>setModal({type:'report'})}><FileText size={14}/>Outstanding</Btn>
          <Btn v="outline" onClick={()=>setModal({type:'regform',sid:null})}><ClipboardList size={14}/>Blank Form</Btn>
          <Btn v="outline" onClick={onRollover}>🔄 Rollover</Btn>
          <Btn onClick={()=>setModal({type:'add'})}><Plus size={14}/>Register Student</Btn>
        </div>
      </div>

      {(unpaidCount>0||partialCount>0)&&<div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
        {unpaidCount>0&&<div onClick={()=>setFs('unpaid')} style={{background:'#FEF3C7',border:'1px solid #FDE68A',borderRadius:9,padding:'8px 14px',fontSize:13,color:'#92400E',display:'flex',alignItems:'center',gap:7,cursor:'pointer'}}><AlertCircle size={14}/><strong>{unpaidCount}</strong> unpaid this semester</div>}
        {partialCount>0&&<div onClick={()=>setFs('partial')} style={{background:'#FFEDD5',border:'1px solid #FED7AA',borderRadius:9,padding:'8px 14px',fontSize:13,color:'#9A3412',display:'flex',alignItems:'center',gap:7,cursor:'pointer'}}><Zap size={14}/><strong>{partialCount}</strong> partial</div>}
        {(fs==='unpaid'||fs==='partial')&&<button onClick={()=>setFs('')} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:9,padding:'8px 12px',fontSize:13,color:T.muted,cursor:'pointer'}}>✕ Clear</button>}
      </div>}

      <div style={{background:'white',borderRadius:11,padding:13,boxShadow:T.shadow,marginBottom:12,display:'flex',gap:9,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:180,display:'flex',alignItems:'center',gap:7,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px'}}>
          <Search size={14} color={T.muted}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Name, ID, IC, parent name…" style={{border:'none',outline:'none',fontSize:14,color:T.text,flex:1,background:'none'}}/>
          {q&&<button onClick={()=>setQ('')} style={{background:'none',border:'none',cursor:'pointer',padding:0,lineHeight:0}}><X size={13} color={T.muted}/></button>}
        </div>
        <select value={fl} onChange={e=>setFl(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px',fontSize:14,background:'white',color:T.text}}>
          <option value="">All Levels</option>{LEVELS.map(l=><option key={l}>{l}</option>)}
        </select>
        <select value={fs} onChange={e=>setFs(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px',fontSize:14,background:'white',color:T.text}}>
          <option value="">All Status</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option>
        </select>
        <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer',color:T.muted,padding:'7px 4px',userSelect:'none'}}>
          <input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>Show archived
        </label>
      </div>

      <div style={{background:'white',borderRadius:12,boxShadow:T.shadow}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>
            <SH c="Student" f="name"/>
            <Th c="ID"/>
            <SH c="Level" f="level"/>
            <Th c="Parent"/>
            <SH c="Fee Status" f="status"/>
            <SH c="Balance" f="balance"/>
            <Th c="Actions"/>
          </tr></thead>
          <tbody>
            {list.length===0
              ?<tr><td colSpan={7} style={{textAlign:'center',padding:36,color:T.muted,fontSize:14}}>No students found.{' '}{(q||fl||fs)&&<button onClick={()=>{setQ('');setFl('');setFs('');}} style={{background:'none',border:'none',color:T.sky,cursor:'pointer',fontWeight:600}}>Clear filters</button>}</td></tr>
              :list.map(s=>{
                const sf=semFeeOf(s,cfg);const st=semTotals(sf);const ps=payStatus(s,cfg);const arch=isArchived(s);
                return (
                  <tr key={s.id} style={{background:arch?'#F8FAFC':ps==='unpaid'&&!arch?'#FFFBEB':undefined,opacity:arch?0.6:1}}>
                    <Td><div style={{display:'flex',alignItems:'center',gap:9}}><Av photo={s.photo} name={s.name} id={s.id} sz={33} r={8}/><div><div style={{fontWeight:600,fontSize:14}}>{s.name}{s.notes&&<span title={s.notes} style={{marginLeft:5,fontSize:10,color:T.amber}}>📝</span>}</div><div style={{fontSize:11,color:T.muted}}>{s.email||s.phone}</div></div></div></Td>
                    <Td s={{fontFamily:'monospace',fontSize:12,color:T.muted}}>{s.id}</Td>
                    <Td s={{fontSize:13}}>{s.level}</Td>
                    <Td><div style={{fontSize:13,fontWeight:500}}>{s.parentName||'—'}</div><div style={{fontSize:11,color:T.muted}}>{s.parentPhone}</div></Td>
                    <Td>{arch?<SBadge s={s.status}/>:<SBadge s={ps}/>}</Td>
                    <Td s={{fontWeight:700,color:st.balance>0?T.orange:T.muted,textAlign:'right'}}>{sf?fmtMoney(st.balance):'—'}</Td>
                    <Td>
                      <div style={{display:'flex',gap:3}}>
                        {!arch&&<Btn sm v="orange" onClick={()=>setModal({type:'quickpay',sid:s.id})} title="Quick Pay"><Zap size={12}/>Pay</Btn>}
                        <IconBtn I={Eye} color={T.muted} onClick={()=>setModal({type:'view',sid:s.id})} title="View profile"/>
                        <IconBtn I={Edit2} color={T.sky} onClick={()=>setModal({type:'edit',sid:s.id})} title="Edit"/>
                        <button onClick={e=>handleWA(s,e)} title={waToast===s.id?'Sent!':'WhatsApp reminder'} style={{padding:5,border:`1px solid ${T.border}`,borderRadius:6,cursor:'pointer',background:waToast===s.id?'#D1FAE5':'white',lineHeight:0}}>💬</button>
                        <IconBtn I={ClipboardList} color={T.purple} onClick={()=>setModal({type:'regform',sid:s.id})} title="Reg form"/>
                        <IconBtn I={Trash2} color={T.red} onClick={()=>del(s.id)} title="Delete"/>
                      </div>
                    </Td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {modal?.type==='add'&&<StudentForm student={null} onSave={save} onClose={()=>setModal(null)} cfg={cfg} allStudents={students}/>}
      {modal?.type==='edit'&&ms&&<StudentForm student={ms} onSave={save} onClose={()=>setModal(null)} cfg={cfg} allStudents={students}/>}
      {modal?.type==='quickpay'&&ms&&<QuickPay student={ms} cfg={cfg} onSave={updQP} onClose={()=>setModal(null)}/>}
      {modal?.type==='view'&&ms&&<StudentDetail student={ms} cfg={cfg} onClose={()=>setModal(null)} onEdit={()=>setModal({type:'edit',sid:ms.id})} onUpdate={upd} onViewReceipt={({inst,semFee})=>setModal({type:'receipt',sid:ms.id,inst,semFee})} onRegForm={()=>setModal({type:'regform',sid:ms.id})}/>}
      {modal?.type==='receipt'&&ms&&<Mdl title={`Receipt · ${modal.inst.receiptNo}`} onClose={()=>setModal({type:'view',sid:ms.id})} wide><ReceiptDoc inst={modal.inst} semFee={modal.semFee} student={ms} cfg={cfg}/></Mdl>}
      {modal?.type==='regform'&&<RegFormModal student={modal.sid?ms:null} cfg={cfg} onClose={()=>setModal(null)} onSaveCfg={setCfg}/>}
      {modal?.type==='report'&&<OutstandingReport students={students} cfg={cfg} onClose={()=>setModal(null)}/>}
    </div>
  );
}

// ── RECEIPTS VIEW ─────────────────────────────────────────────────────────────
function ReceiptsView({students,cfg}) {
  const [q,setQ]=useState('');
  const [fSem,setFSem]=useState('');
  const [fYear,setFYear]=useState('');
  const [fMethod,setFMethod]=useState('');
  const [sel,setSel]=useState(null);

  const all=useMemo(()=>{
    const rows=[];
    students.forEach(s=>(s.semFees||[]).forEach(sf=>sf.installments.forEach(inst=>rows.push({inst,semFee:sf,student:s}))));
    return rows.sort((a,b)=>new Date(b.inst.date)-new Date(a.inst.date));
  },[students]);

  const list=all.filter(r=>{
    const qn=q.toLowerCase();
    return(!qn||r.inst.receiptNo.toLowerCase().includes(qn)||r.student.name.toLowerCase().includes(qn)||r.student.id.toLowerCase().includes(qn))
      &&(!fSem||String(r.semFee.sem)===fSem)
      &&(!fYear||String(r.semFee.year)===fYear)
      &&(!fMethod||(r.inst.method||''===fMethod));
  });

  const totalCollected=list.reduce((s,r)=>s+r.inst.amount,0);
  const years=[...new Set(all.map(r=>r.semFee.year))].sort((a,b)=>b-a);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><h1 style={{fontSize:21,fontWeight:800,color:T.text,margin:0}}>Receipts</h1><p style={{fontSize:13,color:T.muted,margin:'3px 0 0'}}>{list.length} receipt{list.length!==1?'s':''} · {fmtMoney(totalCollected)} shown</p></div>
      </div>

      <div style={{background:'white',borderRadius:11,padding:13,boxShadow:T.shadow,marginBottom:12,display:'flex',gap:9,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:180,display:'flex',alignItems:'center',gap:7,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px'}}>
          <Search size={14} color={T.muted}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Receipt no., student name or ID…" style={{border:'none',outline:'none',fontSize:14,flex:1,background:'none'}}/>
          {q&&<button onClick={()=>setQ('')} style={{background:'none',border:'none',cursor:'pointer',padding:0,lineHeight:0}}><X size={13} color={T.muted}/></button>}
        </div>
        <select value={fSem} onChange={e=>setFSem(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px',fontSize:14,background:'white',color:T.text}}>
          <option value="">All Semesters</option><option value="1">Semester 1</option><option value="2">Semester 2</option>
        </select>
        <select value={fYear} onChange={e=>setFYear(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px',fontSize:14,background:'white',color:T.text}}>
          <option value="">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={fMethod} onChange={e=>setFMethod(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px',fontSize:14,background:'white',color:T.text}}>
          <option value="">All Methods</option>{PMETHODS.map(m=><option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={{background:'white',borderRadius:12,boxShadow:T.shadow}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><Th c="Receipt No."/><Th c="Student"/><Th c="Semester"/><Th c="Method"/><Th c="Amount" right/><Th c="Balance After" right/><Th c="Date"/><Th c=""/></tr></thead>
          <tbody>
            {list.length===0
              ?<tr><td colSpan={8} style={{textAlign:'center',padding:36,color:T.muted,fontSize:14}}>No receipts match the current filters.</td></tr>
              :list.map(({inst:p,semFee:sf,student:s})=>{
                const instIdx=sf.installments.findIndex(i=>i.id===p.id)+1;
                const paidToDate=sf.installments.slice(0,instIdx).reduce((sum,i)=>sum+i.amount,0);
                const bal=Math.max(0,sf.totalDue-paidToDate);
                return (
                  <tr key={p.id}>
                    <Td s={{fontFamily:'monospace',fontSize:12,color:T.muted}}>{p.receiptNo}</Td>
                    <Td><div style={{fontWeight:600,fontSize:14}}>{s.name}</div><div style={{fontSize:11,color:T.muted}}>{s.id}</div></Td>
                    <Td><div>Sem {sf.sem}, {sf.year}</div>{sf.installments.length>1&&<div style={{fontSize:11,color:T.orange}}>Inst. {instIdx}/{sf.installments.length}</div>}</Td>
                    <Td><Pill label={p.method||'—'} color={T.sky}/></Td>
                    <Td s={{fontWeight:700,color:T.green,textAlign:'right'}}>{fmtMoney(p.amount)}</Td>
                    <Td s={{fontWeight:600,color:bal>0?T.orange:T.green,textAlign:'right'}}>{fmtMoney(bal)}</Td>
                    <Td s={{color:T.muted}}>{fmtDate(p.date)}</Td>
                    <Td><Btn sm v="outline" onClick={()=>setSel({inst:p,semFee:sf,student:s})}><Printer size={12}/>Print</Btn></Td>
                  </tr>
                );
              })}
            {list.length>0&&(
              <tr style={{background:'#F8FAFC'}}>
                <td colSpan={4} style={{padding:'10px 14px',fontSize:13,fontWeight:700,color:T.text}}>Total shown ({list.length} receipts)</td>
                <td style={{padding:'10px 14px',fontSize:14,fontWeight:800,color:T.green,textAlign:'right'}}>{fmtMoney(totalCollected)}</td>
                <td colSpan={3}/>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sel&&<Mdl title={`Receipt · ${sel.inst.receiptNo}`} onClose={()=>setSel(null)} wide><ReceiptDoc inst={sel.inst} semFee={sel.semFee} student={sel.student} cfg={cfg}/></Mdl>}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({students,cfg,onRollover}) {
  const active=students.filter(s=>!isArchived(s));
  const total=active.length;
  const paid=active.filter(s=>payStatus(s,cfg)==='paid').length;
  const partial=active.filter(s=>payStatus(s,cfg)==='partial').length;
  const unpaid=total-paid-partial;
  const archived=students.filter(s=>isArchived(s)).length;
  const now=new Date();
  const newM=active.filter(s=>{const d=new Date(s.enrolledOn);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).length;

  const totalExpected=active.reduce((sum,s)=>{const sf=semFeeOf(s,cfg);return sum+(sf?sf.totalDue:suggestFeeAmt(s.level,cfg.fees));},0);
  const totalCollected=active.reduce((sum,s)=>{const sf=semFeeOf(s,cfg);return sum+semTotals(sf).paid;},0);
  const totalOutstanding=active.reduce((sum,s)=>{const sf=semFeeOf(s,cfg);return sum+semTotals(sf).balance;},0);

  const levelBreakdown=LEVELS.map(l=>({l,count:active.filter(s=>s.level===l).length})).filter(x=>x.count>0);
  const maxLvl=Math.max(...levelBreakdown.map(x=>x.count),1);

  const SC=({l,val,I,color,sub,money})=>(
    <div style={{background:'white',borderRadius:12,padding:'18px 20px',boxShadow:T.shadow,flex:1}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:7}}>{l}</div><div style={{fontSize:money?20:28,fontWeight:900,color:T.text}}>{val}</div>{sub&&<div style={{fontSize:12,color:T.muted,marginTop:2}}>{sub}</div>}</div>
        <div style={{width:44,height:44,background:color+'1a',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center'}}><I size={20} color={color}/></div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
        <div><h1 style={{fontSize:21,fontWeight:800,color:T.text,margin:'0 0 3px'}}>Dashboard</h1><p style={{fontSize:13,color:T.muted,margin:0}}>Semester {cfg.currentSemester}, {cfg.currentYear} · {cfg.schoolName}</p></div>
        {onRollover&&<Btn v="outline" onClick={onRollover}>🔄 Semester Rollover</Btn>}
      </div>

      <div style={{display:'flex',gap:12,marginBottom:12}}>
        <SC l="Active Students" val={total} I={Users} color={T.sky} sub={archived?`+ ${archived} archived`:'All enrolled'}/>
        <SC l="Fully Paid" val={paid} I={CheckCircle} color={T.green} sub="Current semester"/>
        <SC l="Partial" val={partial} I={Zap} color={T.orange} sub="Instalments ongoing"/>
        <SC l="Unpaid" val={unpaid} I={AlertCircle} color={T.red} sub="No payment yet"/>
      </div>

      <div style={{display:'flex',gap:12,marginBottom:18}}>
        <SC l="Expected Revenue" val={fmtMoney(totalExpected)} I={TrendingUp} color={T.sky} sub="Current semester" money/>
        <SC l="Collected" val={fmtMoney(totalCollected)} I={DollarSign} color={T.green} sub="Received so far" money/>
        <SC l="Outstanding" val={fmtMoney(totalOutstanding)} I={AlertCircle} color={T.orange} sub="Remaining balance" money/>
        <SC l="New This Month" val={newM} I={UserCheck} color={T.purple} sub="Enrollments"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
        <div style={{background:'white',borderRadius:12,boxShadow:T.shadow,padding:'16px 20px'}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14,display:'flex',alignItems:'center',gap:7}}><BookOpen size={15} color={T.sky}/>Students by Level</div>
          {levelBreakdown.length===0?<div style={{color:T.muted,fontSize:13}}>No data.</div>:levelBreakdown.map(({l,count})=>(
            <div key={l} style={{marginBottom:9}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}><span style={{color:T.text}}>{l}</span><span style={{fontWeight:700,color:T.sky}}>{count}</span></div>
              <div style={{background:T.border,borderRadius:99,height:5,overflow:'hidden'}}><div style={{height:'100%',background:T.sky,borderRadius:99,width:`${(count/maxLvl)*100}%`}}/></div>
            </div>
          ))}
        </div>

        <div style={{background:'white',borderRadius:12,boxShadow:T.shadow}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${T.border}`,fontWeight:700,fontSize:14,color:T.text}}>Recent Students</div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><Th c="Student"/><Th c="Level"/><Th c="Status"/></tr></thead>
            <tbody>
              {active.slice(0,5).map(s=>(
                <tr key={s.id}>
                  <Td><div style={{display:'flex',alignItems:'center',gap:8}}><Av photo={s.photo} name={s.name} id={s.id} sz={28} r={6}/><div style={{fontWeight:600,fontSize:13}}>{s.name}</div></div></Td>
                  <Td s={{fontSize:12}}>{s.level}</Td>
                  <Td><SBadge s={payStatus(s,cfg)}/></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS VIEW ─────────────────────────────────────────────────────────────
function SettingsView({cfg,setCfg}) {
  const [f,setF]=useState({...cfg,fees:[...cfg.fees],semDates:[...cfg.semDates],regForm:{...cfg.regForm}});
  const [saved,setSaved]=useState(false);
  const u=(k,v)=>setF(x=>({...x,[k]:v}));
  const uRf=(k,v)=>setF(x=>({...x,regForm:{...x.regForm,[k]:v}}));
  const save=()=>{setCfg(f);setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const updFee=(id,k,v)=>setF(x=>({...x,fees:x.fees.map(fe=>fe.id===id?{...fe,[k]:v}:fe)}));
  const updSem=(i,k,v)=>setF(x=>{const d=[...x.semDates];d[i]={...d[i],[k]:v};return{...x,semDates:d};});
  const addFee=()=>setF(x=>({...x,fees:[...x.fees,{id:Date.now(),label:'New Level',amount:0}]}));
  const delFee=id=>setF(x=>({...x,fees:x.fees.filter(fe=>fe.id!==id)}));

  const Sec=({title,children})=>(
    <div style={{background:'white',borderRadius:12,boxShadow:T.shadow,marginBottom:16}}>
      <div style={{padding:'13px 20px',borderBottom:`1px solid ${T.border}`,fontWeight:700,fontSize:14,color:T.text}}>{title}</div>
      <div style={{padding:20}}>{children}</div>
    </div>
  );

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><h1 style={{fontSize:21,fontWeight:800,color:T.text,margin:0}}>Settings</h1><p style={{fontSize:13,color:T.muted,margin:'3px 0 0'}}>Configure the school administration system</p></div>
        <Btn v={saved?'green':'sky'} onClick={save}>{saved?<><CheckCircle size={14}/>Saved!</>:<><Check size={14}/>Save All Changes</>}</Btn>
      </div>
      <Sec title="School Information">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <Inp col="1/-1" label="School Name" value={f.schoolName} onChange={e=>u('schoolName',e.target.value)}/>
          <Inp col="1/-1" label="Address" value={f.address} onChange={e=>u('address',e.target.value)}/>
          <Inp label="Phone" value={f.phone} onChange={e=>u('phone',e.target.value)}/>
          <Inp label="Email" value={f.email} onChange={e=>u('email',e.target.value)}/>
        </div>
      </Sec>
      <Sec title="Academic Calendar">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px',marginBottom:18}}>
          <Sel label="Current Semester" value={f.currentSemester} onChange={e=>u('currentSemester',Number(e.target.value))}><option value={1}>Semester 1</option><option value={2}>Semester 2</option></Sel>
          <Inp label="Current Year" type="number" value={f.currentYear} onChange={e=>u('currentYear',Number(e.target.value))}/>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Semester Date Ranges</div>
        {f.semDates.map((sd,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr 1fr',gap:'0 10px',alignItems:'end',marginBottom:4}}>
            <div style={{padding:'8px 10px',border:`1px solid ${T.border}`,borderRadius:8,fontSize:14,color:T.muted,marginBottom:12}}>Sem {sd.sem}</div>
            <Inp label={i===0?'Start':undefined} type="date" value={sd.start} onChange={e=>updSem(i,'start',e.target.value)}/>
            <Inp label={i===0?'End':undefined} type="date" value={sd.end} onChange={e=>updSem(i,'end',e.target.value)}/>
          </div>
        ))}
      </Sec>
      <Sec title="Fee Structure">
        <div style={{display:'grid',gridTemplateColumns:'1fr 150px 36px',gap:9,marginBottom:10}}>
          {['Education Level','Fee (RM / sem)',''].map(h=><div key={h} style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</div>)}
        </div>
        {f.fees.map(fe=>(
          <div key={fe.id} style={{display:'grid',gridTemplateColumns:'1fr 150px 36px',gap:9,marginBottom:8,alignItems:'center'}}>
            <input value={fe.label} onChange={e=>updFee(fe.id,'label',e.target.value)} style={{...iBase}}/>
            <input type="number" value={fe.amount} onChange={e=>updFee(fe.id,'amount',Number(e.target.value))} style={{...iBase}}/>
            <button onClick={()=>delFee(fe.id)} style={{padding:7,border:`1px solid ${T.border}`,borderRadius:7,cursor:'pointer',background:'white',lineHeight:0}}><Trash2 size={13} color={T.red}/></button>
          </div>
        ))}
        <Btn sm v="outline" onClick={addFee}><Plus size={13}/>Add Level</Btn>
      </Sec>
      <Sec title="Registration Form Template">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <Inp label="Form Title" value={f.regForm.title} onChange={e=>uRf('title',e.target.value)}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 10px'}}>
            <Inp label="Reg Fee (RM)" type="number" value={f.regForm.regFee} onChange={e=>uRf('regFee',Number(e.target.value))}/>
            <Inp label="Fee Label" value={f.regForm.regFeeLabel} onChange={e=>uRf('regFeeLabel',e.target.value)}/>
          </div>
          <Txta col="1/-1" label="Introduction Paragraph" rows={2} value={f.regForm.intro} onChange={e=>uRf('intro',e.target.value)}/>
          <Txta col="1/-1" label="Terms & Conditions" rows={7} value={f.regForm.terms} onChange={e=>uRf('terms',e.target.value)}/>
          <Txta col="1/-1" label="Declaration Text" rows={3} value={f.regForm.declaration} onChange={e=>uRf('declaration',e.target.value)}/>
        </div>
      </Sec>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const NAV=[{id:'dashboard',l:'Dashboard',I:LayoutDashboard},{id:'students',l:'Students',I:Users},{id:'receipts',l:'Receipts',I:FileText},{id:'settings',l:'Settings',I:Settings}];

function Sidebar({active,go,school,onOut}) {
  return (
    <div style={{width:214,background:T.navy,display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'20px 16px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,background:T.sky,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><GraduationCap size={17} color="white"/></div>
          <div><div style={{color:'white',fontWeight:700,fontSize:12,lineHeight:1.3}}>{school}</div><div style={{color:'rgba(255,255,255,.38)',fontSize:10}}>Admin Portal</div></div>
        </div>
      </div>
      <nav style={{padding:'12px 8px',flex:1}}>
        {NAV.map(({id,l,I})=>(
          <button key={id} onClick={()=>go(id)} style={{display:'flex',alignItems:'center',gap:9,width:'100%',padding:'9px 10px',borderRadius:8,border:'none',cursor:'pointer',marginBottom:2,background:active===id?T.sky:'transparent',color:active===id?'white':'rgba(255,255,255,.48)',fontWeight:active===id?600:400,fontSize:13,textAlign:'left'}}>
            <I size={16}/>{l}
          </button>
        ))}
      </nav>
      <div style={{padding:'12px 8px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
        <button onClick={onOut} style={{display:'flex',alignItems:'center',gap:9,width:'100%',padding:'9px 10px',borderRadius:8,border:'none',cursor:'pointer',background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.4)',fontSize:13}}><LogOut size={15}/>Sign Out</button>
      </div>
    </div>
  );
}

function TopBar({cfg}) {
  return (
    <div style={{padding:'12px 22px',background:'white',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
      <span style={{fontSize:13,color:T.muted}}>Academic Year {cfg.currentYear} · Semester {cfg.currentSemester}</span>
      <div style={{display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:32,height:32,background:T.sky,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:13}}>A</div>
        <div><div style={{fontSize:13,fontWeight:700,color:T.text}}>Administrator</div><div style={{fontSize:11,color:T.muted}}>System Admin</div></div>
      </div>
    </div>
  );
}

function LoginPage({onLogin}) {
  const [u,setU]=useState('');const [p,setP]=useState('');const [err,setErr]=useState('');const [busy,setBusy]=useState(false);
  const go=()=>{setBusy(true);setTimeout(()=>{if(u==='admin'&&p==='admin123'){onLogin();}else{setErr('Invalid credentials — use admin / admin123');setBusy(false);}},700);};
  return (
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif'}}>
      <div style={{flex:1,background:`linear-gradient(145deg,${T.navy},${T.navyLt})`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:48}}>
        <div style={{color:'white',maxWidth:340,textAlign:'center'}}>
          <div style={{width:72,height:72,background:T.sky,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}><GraduationCap size={36} color="white"/></div>
          <h1 style={{fontSize:28,fontWeight:900,margin:'0 0 4px'}}>SAGE School</h1>
          <p style={{opacity:.6,margin:'0 0 36px',fontSize:14}}>Administration Portal</p>
          {[{I:Users,l:'Student Registry',d:'Register & manage student records'},{I:DollarSign,l:'Instalment Payments',d:'Full, partial & instalment fee tracking'},{I:CreditCard,l:'ID Card Generator',d:'Auto-generate printable student cards'},{I:ClipboardList,l:'Registration Forms',d:'Editable A4 forms with parent signature'}].map(f=>(
            <div key={f.l} style={{display:'flex',gap:12,alignItems:'flex-start',textAlign:'left',marginBottom:16}}>
              <div style={{background:'rgba(255,255,255,.12)',borderRadius:9,padding:9,flexShrink:0}}><f.I size={16}/></div>
              <div><div style={{fontWeight:600,fontSize:14}}>{f.l}</div><div style={{fontSize:12,opacity:.5,marginTop:1}}>{f.d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{width:430,display:'flex',flexDirection:'column',justifyContent:'center',padding:48,background:'white'}}>
        <div style={{maxWidth:320,width:'100%'}}>
          <h2 style={{fontSize:24,fontWeight:800,color:T.text,margin:'0 0 4px'}}>Welcome back</h2>
          <p style={{fontSize:14,color:T.muted,margin:'0 0 24px'}}>Sign in to your admin account</p>
          <Inp label="Username" value={u} onChange={e=>setU(e.target.value)} placeholder="admin"/>
          <Inp label="Password" type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&go()}/>
          {err&&<div style={{background:'#FEE2E2',color:'#991B1B',padding:'8px 12px',borderRadius:8,fontSize:13,marginBottom:12}}>{err}</div>}
          <Btn full onClick={go} disabled={busy} style={{padding:'10px 16px'}}><Lock size={14}/>{busy?'Signing in…':'Sign In'}</Btn>
          <p style={{fontSize:11,color:T.muted,textAlign:'center',marginTop:12}}>Demo: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authed,setAuthed]=useState(false);
  const [view,setView]=useState('dashboard');
  const [students,setStudents]=useState(INIT_STUDENTS);
  const [cfg,setCfg]=useState(INIT_CFG);
  const [rollover,setRollover]=useState(false);

  const handleRollover=(nextSem,nextYear,advanceLevel)=>{
    setCfg(c=>({...c,currentSemester:nextSem,currentYear:nextYear}));
    setStudents(prev=>prev.map(s=>{
      if(s.status!=='active') return s;
      return {...s, semester:nextSem, year:nextYear, level:advanceLevel?nextLevel(s.level):s.level};
    }));
    setRollover(false);
  };

  if(!authed) return <LoginPage onLogin={()=>setAuthed(true)}/>;
  return (
    <div style={{display:'flex',height:'100vh',fontFamily:'"Inter",system-ui,-apple-system,sans-serif'}}>
      <Sidebar active={view} go={setView} school={cfg.schoolName} onOut={()=>{setAuthed(false);setView('dashboard');}}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
        <TopBar cfg={cfg}/>
        <main style={{flex:1,overflowY:'auto',padding:22}}>
          {view==='dashboard'&&<Dashboard students={students} cfg={cfg} onRollover={()=>setRollover(true)}/>}
          {view==='students' &&<StudentsView students={students} setStudents={setStudents} cfg={cfg} setCfg={setCfg} onRollover={()=>setRollover(true)}/>}
          {view==='receipts' &&<ReceiptsView students={students} cfg={cfg}/>}
          {view==='settings' &&<SettingsView cfg={cfg} setCfg={setCfg}/>}
        </main>
      </div>
      {rollover&&<RolloverModal students={students} cfg={cfg} onConfirm={handleRollover} onClose={()=>setRollover(false)}/>}
    </div>
  );
}
