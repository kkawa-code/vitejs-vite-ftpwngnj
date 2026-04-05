import React, { useEffect, useMemo, useState, useRef } from "react";

const GS=`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');html,body,#root{max-width:100%!important;width:100%!important;margin:0!important;padding:0!important;}body{background:#f4f7f9;color:#334155;-webkit-print-color-adjust:exact;font-family:'Inter',sans-serif;letter-spacing:0.02em;font-size:16px;overflow-x:hidden;}*{box-sizing:border-box;}textarea,select,button,input{font:inherit;}textarea:focus,select:focus,input:focus{outline:3px solid #3b82f6;outline-offset:-1px;border-color:transparent!important;}select{appearance:none;background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right 8px center;background-size:1.2em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;padding-right:32px!important;}details>summary{list-style:none;cursor:pointer;outline:none;}details>summary:hover{color:#0d9488;}.scroll-container{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;border-radius:8px;border:1px solid #e2e8f0;background:#fff;}.sticky-table-header th{position:sticky;top:0;z-index:20;background:#f8fafc;box-shadow:0 2px 4px -1px rgba(0,0,0,0.05);}.sticky-header-panel{position:sticky;top:0;z-index:30;background:rgba(255,255,255,0.95);backdrop-filter:blur(4px);padding-top:16px;margin-top:-16px;box-shadow:0 4px 6px -4px rgba(0,0,0,0.1);}.calendar-row{transition:background-color 0.2s;cursor:pointer;}.calendar-row:hover{background-color:#f1f5f9!important;}.btn-hover{transition:all 0.2s;cursor:pointer;}.btn-hover:hover{transform:translateY(-1px);filter:brightness(1.05);box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)!important;}.card-hover{transition:box-shadow 0.2s,transform 0.2s;cursor:pointer;}.card-hover:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06);}.rule-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center;width:100%;}.rule-sel,.rule-num{padding:8px 12px;border-radius:6px;border:1px solid #cbd5e1;font-weight:600;font-size:15px;transition:border-color 0.2s;}.rule-num{width:60px;text-align:center;flex-shrink:0;}.rule-del{border:none;background:none;color:#ef4444;cursor:pointer;font-size:24px;flex-shrink:0;padding:0 8px;transition:0.2s;}.rule-del:hover{background:#fee2e2;border-radius:6px;}.rule-add{background:#fff;color:#4f46e5;border:2px dashed #a5b4fc;padding:10px 16px;font-size:16px;width:100%;display:flex;justify-content:center;font-weight:bold;border-radius:8px;cursor:pointer;margin-top:12px;transition:0.2s;}.rule-add:hover{background:#e0e7ff;border-color:#4f46e5;}.rule-label{font-size:15px;font-weight:700;color:#64748b;flex-shrink:0;}.tab-btn{background:none;border:none;padding:12px 20px;font-size:17px;font-weight:800;color:#64748b;cursor:pointer;border-bottom:3px solid transparent;transition:0.2s;}.tab-btn:hover{color:#3b82f6;}.tab-btn.active{color:#2563eb;border-bottom-color:#2563eb;}.name-textarea{width:100%;height:120px;padding:12px;font-size:15px;border-radius:8px;border:1px solid #cbd5e1;font-weight:600;line-height:1.5;}.modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);}.modal-content{background:#fff;padding:32px;border-radius:16px;width:100%;max-width:600px;max-height:85vh;overflow-y:auto;}.modal-wide{max-width:1000px;}.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e2e8f0;}.modal-title{margin:0;font-size:24px;color:#0f172a;font-weight:800;}.close-btn{background:#f1f5f9;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;color:#64748b;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;transition:0.2s;}.close-btn:hover{background:#e2e8f0;}@media print{body{background:#fff;}.no-print{display:none!important;}.print-area{box-shadow:none!important;border:none!important;padding:0!important;margin:0!important;width:100%!important;}table{width:100%!important;border-collapse:collapse!important;table-layout:auto;}th,td{border:1px solid #000!important;padding:6px!important;font-size:11pt!important;color:#000!important;position:static!important;}}`;

type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
type WarningInfo = { level: 'red' | 'orange' | 'yellow'; title: string; msg: string; staff?: string; room?: string; };

const SEC = ["明け","入り","土日休日代休","不在","待機","CT","MRI","RI","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","受付","受付ヘルプ"];
const AS_SEC = SEC.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const RM_SEC = SEC.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const RE_SEC = ["明け","入り","土日休日代休","不在"];
const WK_SEC = SEC.filter(s => !RE_SEC.includes(s));
const PL_SEC = RM_SEC.map(s => s + "枠");
const GEN_RM = ["1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA", "検像"];
const EX_SEC = [...RM_SEC, "CT(4)", "CT(3)", "MRI(3)", "治療(3)"];

const KEY_ALL_DAYS = 'shifto_alldays';
const KEY_RULES = 'shifto_rules';
const KEY_MONTHLY = 'shifto_monthly';
const DEFAULT_MONTHLY_ASSIGN: Record<string,string> = { CT:"", MRI:"", RI:"", RIメイン:"", RIサブ:"", MMG:"", 治療:"", 治療サブ優先:"", 治療サブ:"", 受付:"", 受付ヘルプ:"" };
const FALLBACK_HOLIDAYS: Record<string,string> = {};
const formatDayForDisplay = (d: Date): string => { const days=["日","月","火","水","木","金","土"]; return `${d.getMonth()+1}/${d.getDate()}(${days[d.getDay()]})`; };
const WeekCalendarPicker = ({targetMonday, onChange}: {targetMonday:string, onChange:(v:string)=>void, nationalHolidays?:Record<string,string>, customHolidays?:string[]}) => {
  const [y,m,day] = targetMonday.split('-').map(Number);
  const opts: {id:string,label:string}[] = [];
  const base = new Date(y,m-1,day); base.setDate(base.getDate()-28);
  for(let i=0;i<56;i++){ const d=new Date(base); d.setDate(base.getDate()+i*7);
    const id=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dend=new Date(d); dend.setDate(d.getDate()+4);
    opts.push({id, label:`${d.getMonth()+1}/${d.getDate()}〜${dend.getMonth()+1}/${dend.getDate()}`});
  }
  return <select value={targetMonday} onChange={e=>onChange(e.target.value)} className="rule-sel" style={{fontWeight:700,fontSize:15}}>
    {opts.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
  </select>;
};

const DEF_RULES = { 
  staffList: "", receptionStaffList: "", supportStaffList: "浅野", supportTargetRooms: "2号室, 3号室", supportTargetRoomsLowImpact: "3号室,パノラマCT", supportTargetRoomsHighImpact: "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像", customHolidays: "", capacity: { "CT": 4, "MRI": 3, "治療": 3, "RI": 1, "MMG": 1, "透視（6号）": 1, "透視（11号）": 1, "骨塩": 1, "1号室": 1, "5号室": 1, "パノラマCT": 1 }, dailyCapacities: [], dailyAdditions: [], priorityRooms: ["治療", "受付", "MMG", "RI", "MRI", "CT", "DSA", "ポータブル", "透視（6号）", "透視（11号）", "骨塩", "1号室", "2号室", "5号室", "検像", "パノラマCT", "3号室", "受付ヘルプ", "透析後胸部"], fullDayOnlyRooms: "DSA", noConsecutiveRooms: "ポータブル", consecutiveAlertRooms: "ポータブル, 透視（6号）", noLateShiftStaff: "浅野、木内康、髙橋、川崎、松平、阿部", noLateShiftRooms: "透視（11号）", lateShiftLowPriorityStaff: "木内康、石田、澤邊、依田", closedRooms: [], ngPairs: [{s1:"本郷",s2:"寺本",level:"hard"},{s1:"髙橋",s2:"寺本",level:"soft"}], fixed: [], forbidden: [{staff:"浅野",sections:"CT、ポータブル、MRI、1号室、MMG、骨塩、透析後胸部、DSA、残り・待機、受付、受付ヘルプ、パノラマCT、5号室、検像、治療、RI"}], substitutes: [], pushOuts: [], emergencies: [{ threshold: 19, type: "change_capacity", role: "", section: "CT", newCapacity: 3 }, { threshold: 17, type: "staff_assign", role: "", section: "2号室", newCapacity: 3, staff: "" }], swapRules: [{ targetRoom: "ポータブル", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }, { targetRoom: "パノラマCT", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }, { targetRoom: "DSA", triggerRoom: "5号室", sourceRooms: "透視（6号）、1号室、2号室、CT(4)" }], kenmuPairs: [{ s1: "MMG", s2: "透視（11号）", isExclusive: true }, { s1: "骨塩", s2: "検像", isExclusive: true }, { s1: "パノラマCT", s2: "透視（6号）", isExclusive: true }, { s1: "2号室", s2: "パノラマCT", isExclusive: false }], rescueRules: [{ targetRoom: "ポータブル", sourceRooms: "3号室、2号室、1号室、5号室、CT(4)" }, { targetRoom: "DSA", sourceRooms: "5号室、2号室、検像、CT(4)" }, { targetRoom: "1号室", sourceRooms: "3号室、パノラマCT、CT(4)" }, { targetRoom: "2号室", sourceRooms: "3号室、パノラマCT、CT(4)" }, { targetRoom: "3号室", sourceRooms: "パノラマCT、CT(4)" }, { targetRoom: "5号室", sourceRooms: "3号室、パノラマCT、CT(4)" }], lateShifts: [{ section: "透視（6号）", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" }], lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], lunchRoleRules: [{ day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" }], lunchPrioritySections: "RI, 1号室, 2号室, 3号室, 5号室", lunchLastResortSections: "治療", linkedRooms: [{ target: "ポータブル", sources: "3号室(1)、2号室、1号室、5号室、CT(4)" }, { target: "検像", sources: "骨塩" }, { target: "DSA", sources: "5号室、2号室、CT(4)、パノラマCT" }, { target: "パノラマCT", sources: "透視（6号）、2号室" }], alertMaxKenmu: 3, alertEmptyRooms: "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像,受付", smartKenmu: [{ targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" }] 
};

const pad = (n: number) => String(n).padStart(2, '0');
const TO: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h=8; h<=19; h++) { for (let m=0; m<60; m+=15) { if(h===8&&m===0)continue; TO.push(`(${h}:${pad(m)}〜)`); TO.push(`(〜${h}:${pad(m)})`); } }

const sp = (v: string) => (v||"").split(/[、,\n]+/).map(s=>s.trim()).filter(Boolean);
const jn = (a: string[]) => a.filter(Boolean).join("、");
const ex = (f: string) => f.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
const prC = (s: string) => { const m=s.match(/^(.*?)\((\d+)\)$/); return m?{r:m[1],min:Number(m[2])}:{r:s,min:0}; };
const pSt = (str: string) => { const l=sp(str).map(s=>{ const m=s.match(/^(.*?)[\(（](.*?)[\)）]$/); return {c:m?m[1].trim():s, y:m?m[2].trim():s}; }); l.sort((a,b)=>a.y.localeCompare(b.y,'ja')); return Array.from(new Set(l.map(p=>p.c))); };
const getAmt = (n: string) => PL_SEC.includes(ex(n)) ? 0 : (n.includes("(AM)")||n.includes("(PM)")||n.match(/\(〜/)||n.match(/〜\)/)) ? 0.5 : 1;

function getMSt(sec: string, moAssign: Record<string, string>): string[] { let st: string[] = []; if (sec === "治療") st = [...sp(moAssign.治療), ...sp(moAssign.治療サブ優先), ...sp(moAssign.治療サブ)]; else if (sec === "RI") st = [...sp(moAssign.RI), ...sp(moAssign.RIサブ)]; else if (moAssign[sec] !== undefined) st = sp(moAssign[sec]); return st.map(ex); }

// --- Style helpers ---
const cellStyle = (isHeader=false, isHoliday=false, isSelected=false, isLabel=false, isZebra=false): React.CSSProperties => ({
  background: isHoliday ? "#fef2f2" : isSelected ? "#eff6ff" : isZebra ? "#f8fafc" : "#ffffff",
  verticalAlign: "top",
});
const panelStyle = (): React.CSSProperties => ({
  background: "#ffffff",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  border: "1px solid #e2e8f0",
  padding: 24,
});
type RenderGroup = { title: string; color: string; sections: string[] };
const RENDER_GROUPS: RenderGroup[] = [
  { title: "休務・夜勤",            color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] },
  { title: "モダリティ",            color: "#3b82f6", sections: ["CT","MRI","RI","治療"] },
  { title: "一般撮影・透視・その他", color: "#10b981", sections: ["1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","検像"] },
  { title: "待機・その他",           color: "#f59e0b", sections: ["待機","昼当番","受付","受付ヘルプ"] },
];

// --- UI Components ---
const Btn = ({bg, c, sz, ch, oC, dis}:any) => <button className="btn-hover" onClick={oC} disabled={dis} style={{background:bg,color:c||"#fff",border:"none",borderRadius:6,padding:"8px 12px",cursor:dis?"not-allowed":"pointer",fontWeight:700,fontSize:sz||15,whiteSpace:"nowrap",boxShadow:"0 2px 4px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:6,opacity:dis?0.5:1}}>{ch}</button>;
const M = ({t, oC, w, ch}:any) => <div className="modal-overlay" onClick={oC}><div className={`modal-content ${w?'modal-wide':''}`} onClick={e=>e.stopPropagation()}><div className="modal-header"><h3 className="modal-title">{t}</h3><button onClick={oC} className="close-btn">✖</button></div>{ch}<div style={{textAlign:"center",marginTop:32}}><Btn bg="#2563eb" c="#fff" sz={16} oC={oC} ch="閉じる" style={{width:"100%", justifyContent:"center"}}/></div></div></div>;
const RC = ({bg, b, c, ic, t, d, ch}:any) => <div style={{background:bg,padding:24,borderRadius:12,border:`2px solid ${b}`,marginBottom:20}}><h5 style={{margin:"0 0 12px 0",color:c,fontSize:18,fontWeight:800}}>{ic} {t}</h5>{d&&<p style={{fontSize:15,color:"#166534",marginTop:0,marginBottom:16}}>{d}</p>}{ch}</div>;
const MP = ({v, oC, opt, ph}:any) => { const c=sp(v); return <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8,marginBottom:8}}>{c.map((x,i)=><div key={i} style={{background:"#e0f2fe",color:"#0369a1",borderRadius:16,padding:"6px 12px",fontSize:15,fontWeight:700,border:"1px solid #bae6fd",display:"flex",alignItems:"center",gap:6}}><span>{x}</span><span onClick={()=>{const n=[...c];n.splice(i,1);oC(jn(n));}} style={{cursor:"pointer",opacity:0.5}}>✖</span></div>)}<select className="rule-sel" onChange={e=>{if(e.target.value&&!c.includes(e.target.value))oC(jn([...c,e.target.value]));e.target.value="";}} value=""><option value="">{ph||"＋追加"}</option>{opt.filter((s:any)=>!c.includes(s)).map((s:any)=><option key={s} value={s}>{s}</option>)}</select></div>; };
const Del = ({oC}:any) => <button onClick={oC} className="rule-del">✖</button>;
const Num = ({v, oC, w=60}:any) => <input type="number" value={v} onChange={e=>oC(Number(e.target.value))} className="rule-num" style={{width:w}} />;
const Row = ({children}:any) => <div className="rule-row">{children}</div>;
const StaffSel = ({v, oC, list, ph="スタッフ", w}:any) => <select value={v} onChange={e=>oC(e.target.value)} className="rule-sel" style={{width:w, flex:"0 0 auto"}}><option value="">{ph}</option>{list.map((s:any)=><option key={s} value={s}>{s}</option>)}</select>;
const RoomSel = ({v, oC, list, ph="場所", w}:any) => <select value={v} onChange={e=>oC(e.target.value)} className="rule-sel" style={{width:w, flex:"0 0 auto"}}><option value="">{ph}</option>{list.map((s:any)=><option key={s} value={s}>{s}</option>)}</select>;

const MONTHLY_CATEGORIES: {key: string; label: string}[] = [
  {key:"CT",label:"CT"},{key:"MRI",label:"MRI"},{key:"RI",label:"RI"},{key:"RIメイン",label:"RIメイン"},{key:"RIサブ",label:"RIサブ"},
  {key:"MMG",label:"MMG"},{key:"治療",label:"治療"},{key:"治療サブ優先",label:"治療サブ優先"},{key:"治療サブ",label:"治療サブ"},
  {key:"受付",label:"受付"},{key:"受付ヘルプ",label:"受付ヘルプ"},
];
const SectionEditor = ({section, value, activeStaff, onChange, noTime, customOptions}:any) => {
  const opts = [...(activeStaff||[]), ...(customOptions||[])];
  const TIME_BTNS = ["(AM)","(PM)","(12:15〜13:00)","(17:00〜19:00)","(17:00〜22:00)"];
  const addTag = (tag:string) => {
    const arr = sp(value); if(arr.length===0)return;
    const last = arr[arr.length-1]; const core = ex(last);
    arr[arr.length-1] = `${core}${tag}`; onChange(jn(arr));
  };
  return <div style={{background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",padding:"10px 12px",marginBottom:0}}>
    <div style={{fontSize:14,fontWeight:700,color:"#94a3b8",marginBottom:6}}>{section}</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",marginBottom:noTime?0:8}}>
      {sp(value).map((m:string,i:number)=><div key={i} style={{background:"#eff6ff",color:"#1d4ed8",borderRadius:20,padding:"4px 12px",fontSize:15,fontWeight:700,border:"1px solid #bfdbfe",display:"flex",alignItems:"center",gap:6}}><span>{m}</span><span onClick={()=>{const a=sp(value);a.splice(i,1);onChange(jn(a));}} style={{cursor:"pointer",color:"#93c5fd",fontWeight:400}}>✕</span></div>)}
      <select value="" onChange={e=>{if(e.target.value)onChange(jn([...sp(value),e.target.value]));e.target.value="";}} style={{padding:"4px 32px 4px 10px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:14,fontWeight:600,background:"#f8fafc",cursor:"pointer",appearance:"none",backgroundImage:"url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")",backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center",backgroundSize:"1em"}}>
        <option value="">＋追加</option>{opts.filter((s:any)=>!sp(value).map(ex).includes(s)).map((s:any)=><option key={s} value={s}>{s}</option>)}
      </select>
    </div>
    {!noTime && <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{TIME_BTNS.map((t:string)=><button key={t} onClick={()=>addTag(t)} style={{padding:"3px 10px",borderRadius:6,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:13,fontWeight:600,cursor:"pointer",color:"#475569"}}>{t.replace(/[()]/g,'')}</button>)}</div>}
  </div>;
};

const rLog = (ls: string, i: number) => {
  if(ls.startsWith("・■")) return <li key={i} style={{marginTop:16,marginBottom:8,paddingBottom:4,borderBottom:"2px solid #cbd5e1",fontSize:18,fontWeight:800,color:"#334155"}}>{ls.substring(2)}</li>;
  const m=ls.match(/^・(.*?)\s\[(.*?)\]\s(.*)$/); if(!m) return <li key={i} style={{padding:"8px 12px",marginBottom:4,background:"#f8fafc",borderRadius:6,fontSize:14,color:"#475569",lineHeight:1.6}}>{ls.substring(1)}</li>;
  let bg="#f8fafc", b="#e2e8f0", c="#475569", bbg="#e2e8f0", bc="#475569";
  if(m[2].includes("配置")||m[2].includes("増枠")||m[2].includes("初期優先度")){bg="#eff6ff";b="#bfdbfe";c="#1e3a8a";bbg="#dbeafe";bc="#1d4ed8";}
  else if(m[2].includes("緊急")||m[2].includes("除外")||m[2].includes("スキップ")){bg="#fef2f2";b="#fecaca";c="#7f1d1d";bbg="#fee2e2";bc="#b91c1c";}
  else if(m[2].includes("救済")||m[2].includes("代打")||m[2].includes("最終救済")||m[2].includes("特例サポート")){bg="#fff7ed";b="#fed7aa";c="#9a3412";bbg="#ffedd5";bc="#c2410c";}
  else if(m[2].includes("兼務")||m[2].includes("負担軽減")||m[2].includes("スマート兼務")||m[2].includes("兼務解消")){bg="#ecfdf5";b="#a7f3d0";c="#064e3b";bbg="#d1fae5";bc="#047857";}
  else if(m[2].includes("遅番")){bg="#f5f3ff";b="#ddd6fe";c="#4c1d95";bbg="#ede9fe";bc="#6d28d9";}
  else if(m[2].includes("玉突き")){bg="#e0f2fe";b="#bae6fd";c="#0c4a6e";bbg="#bae6fd";bc="#0369a1";}
  else if(m[2].includes("専従")||m[2].includes("役割")||m[2].includes("低影響補充")){bg="#f0fdfa";b="#bbf7d0";c="#14532d";bbg="#dcfce7";bc="#15803d";}
  else if(m[2].includes("昼当番")||m[2].includes("ヘルプ")||m[2].includes("サポート")||m[2].includes("余剰")||m[2].includes("ポータブル特例")){bg="#fdf4ff";b="#f5d0fe";c="#701a75";bbg="#fae8ff";bc="#86198f";}
  return <li key={i} style={{display:"flex",gap:8,padding:"10px 12px",marginBottom:6,background:bg,borderRadius:8,border:`1px solid ${b}`,fontSize:14,color:c,lineHeight:1.6,fontWeight:600}}><span style={{background:bbg,color:bc,padding:"4px 8px",borderRadius:6,fontWeight:800,fontSize:13,whiteSpace:"nowrap",flexShrink:0,marginTop:2}}>{m[1]} {m[2]}</span><span>{m[3]}</span></li>;
};

// ===================== 🌟 AutoAssigner =====================
class AutoAssigner {
  d: DayData; pd: DayData | null; pm: DayData[]; pw: DayData[]; cx: any; sm: boolean; dc: Record<string,string>; bm: Map<string,string> = new Map();
  sk: string[] = []; cl: string[] = []; ra: Record<string,any> = {}; cap: Record<string,number> = {};
  ac: Record<string,number> = {}; ma: Record<string,number> = {}; cts: Record<string,number> = {}; rc: Record<string,Record<string,number>> = {};
  iaAll: string[] = []; iaGen: string[] = []; iaSup: string[] = []; iaRec: string[] = []; logInfo: string[] = []; stA: any[] = [];
  
  constructor(d: DayData, pd: DayData | null, pm: DayData[], pw: DayData[], cx: any, sm: boolean) {
    this.d={...d}; this.pd=pd; this.pm=pm; this.pw=pw; this.cx=cx; this.dc={...d.cells}; this.cap={...(cx.customRules.capacity||{})}; this.sm=sm;
  }
  
  private lg(m: string) { this.logInfo.push(`・${m}`); } private lgP(p: string) { this.logInfo.push(`・■${p}`); }
  gPR(s: string, r: string) { return (["CT","MRI"].includes(r)?this.pm:this.pw).filter(x=>sp(x.cells[r]).map(ex).includes(s)).length; }
  gTR(s: string) { let c=0; Object.keys(this.dc).forEach(k=>{if(RE_SEC.includes(k)||["待機","昼当番","受付","受付ヘルプ"].includes(k))return; sp(this.dc[k]).forEach(m=>{if(ex(m)===s&&!m.includes("17:")&&!m.includes("18:")&&!m.includes("19:")&&!m.includes("22:"))c++;});}); return c; }
  gTC(s: string) { let a=0,p=0; Object.keys(this.dc).forEach(k=>{if(["待機","昼当番","受付","受付ヘルプ"].includes(k)||RE_SEC.includes(k))return; sp(this.dc[k]).forEach(m=>{if(ex(m)===s){if(m.includes("(AM)"))a++;else if(m.includes("(PM)"))p++;else{a++;p++;}}});}); return {a,p}; }
  iU(n: string) { return (this.ac[n]||0) >= (this.ma[n]||1); } aU(n: string, f=1) { this.ac[n]=(this.ac[n]||0)+f; }
  getPastLateShiftCount(s: string) { return [...this.pm,...this.pw].filter(d=>Object.values(d.cells).some(v=>sp(v).some(m=>ex(m)===s&&(m.includes("17:")||m.includes("18:")||m.includes("19:")||m.includes("22:"))))).length; }
  iFb(st: string, sc: string) { return (this.cx.customRules.forbidden||[]).some((r:any)=>ex(r.staff)===ex(st)&&sp(r.sections).includes(sc)); }
  hNG(c: string, ms: string[], sf: boolean) { return ms.some(m=>(this.cx.customRules.ngPairs||[]).some((n:any)=>{const mt=(ex(n.s1)===ex(c)&&ex(n.s2)===ex(m))||(ex(n.s1)===ex(m)&&ex(n.s2)===ex(c)); if(!mt)return false; return (n.level||"hard")==="hard"||(n.level==="soft"&&sf);})); }
  iFDO(r: string) { return sp(this.cx.customRules.fullDayOnlyRooms||"").includes(r); }
  noHD(r: string, tag: string) { return this.iFDO(r) && (tag.includes("AM") || tag.includes("PM")); }
  iHB(st: string, sc: string) { if(!this.iFDO(sc)) return {h:false, m:false, monthlyHalfException:false}; const fm=sp(this.dc["不在"]); const a=fm.some(m=>ex(m)===st&&m.includes("(AM)")); const p=fm.some(m=>ex(m)===st&&m.includes("(PM)")); if(!a&&!p)return {h:false, m:false, monthlyHalfException:false}; const isMain=getMSt(sc,this.cx.monthlyAssign).includes(st); return {h:!isMain, m:true, monthlyHalfException:isMain}; }
  iHNC(s: string, r: string) { return this.pd ? sp(this.cx.customRules.noConsecutiveRooms).includes(r) && sp(this.pd.cells[r]).map(ex).includes(s) : false; }
  gRSc(src: string, tgt: string, st?: string) { let sc=0; const l=sp(this.cx.customRules.supportTargetRoomsLowImpact); const h=sp(this.cx.customRules.supportTargetRoomsHighImpact); if(src===tgt)sc+=9999; if(l.includes(src))sc-=1000; if(h.includes(src))sc+=1000; const sm=sp(this.dc[src]); const sL=sp(this.cx.customRules.supportStaffList).map(ex); if(sm.length>0&&sm.every(m=>sL.includes(ex(m))))sc+=5000; else{const a=sm.reduce((s,m)=>s+getAmt(m),0); if(a<=1)sc+=500; else if(a<=2)sc+=200;} if(st&&h.includes(src)&&(this.bm.get(st)==='AM'||this.bm.get(st)==='PM'))sc+=300; if(this.cl.includes(src)||this.sk.includes(src))sc+=5000; return sc; }
  uBM(c: string, p: string) { const cu=this.bm.get(c); this.bm.set(c, p.includes("(AM)")?(cu==='PM'||cu==='ALL'?'ALL':'AM'):p.includes("(PM)")?(cu==='AM'||cu==='ALL'?'ALL':'PM'):'ALL'); }
  cAK(st: string, tgt: string, bp=false) { if(!sp(this.dc[tgt]).map(ex).includes(st) && this.gTR(st)>=(this.cx.customRules.alertMaxKenmu||3)) return false; const exP=(this.cx.customRules.kenmuPairs||[]).filter((p:any)=>p.isExclusive); for(const p of exP){ const i1=sp(this.dc[p.s1]).map(ex).includes(st); const i2=sp(this.dc[p.s2]).map(ex).includes(st); if((i1||i2)&&tgt!==p.s1&&tgt!==p.s2)return false; if((tgt===p.s1||tgt===p.s2)&&!bp){if(RM_SEC.filter(r=>sp(this.dc[r]).map(ex).includes(st)&&!["待機","昼当番","受付","受付ヘルプ"].includes(r)).some(r=>r!==p.s1&&r!==p.s2))return false;} } return true; }
  iMC(st: string) { return sp(this.cx.monthlyAssign.MMG).map(ex).includes(ex(st)); }
  gET(r: string, bc: number) { const d=this.d.label.match(/\((.*?)\)/)?.[1]; if(!d)return{cap:bc,aC:false,pC:false,al:false}; const cl=(this.cx.customRules.closedRooms||[]).filter((x:any)=>x.room===r&&x.day===d); let a=false,p=false,al=false; cl.forEach((x:any)=>{if(x.time==="全日")al=true;else if(x.time==="(AM)")a=true;else if(x.time==="(PM)")p=true;}); if(a&&p)al=true; if(al)return{cap:0,aC:true,pC:true,al:true}; if(a||p)return{cap:bc/2,aC:a,pC:p,al:false}; return{cap:bc,aC:false,pC:false,al:false}; }
  pk(aL: string[], ls: string[], n: number, sc?: string, cA: string[]=[]): string[] { const r:string[]=[]; const uL=Array.from(new Set(ls.filter(Boolean))); const f=(nm:string, sf:boolean)=>{if(!aL.includes(nm)||this.iU(nm)||(sc&&this.iFb(nm,sc)))return false; if(this.hNG(nm,[...cA,...r].map(ex),sf))return false; if(sc&&!this.cAK(nm,sc))return false; return true;}; for(const nm of uL.filter(x=>f(x,true))){r.push(nm);if(r.length>=n)return r;} for(const nm of uL.filter(x=>f(x,false))){r.push(nm);if(r.length>=n)return r;} return r; }

  exe(): DayData {
    this.lgP("前提処理"); this.cx.allStaff.forEach((s: string)=>{this.ac[s]=0;this.ma[s]=1;this.rc[s]={};SEC.forEach(x=>this.rc[s][x]=0);this.cts[s]=0;});
    this.pm.forEach(pd=>Object.entries(pd.cells).forEach(([k,v])=>{if(["CT","MRI"].includes(k))sp(v).forEach(m=>{const c=ex(m);if(this.rc[c]){this.rc[c][k]++;this.cts[c]++;}});}));
    this.pw.forEach(pd=>Object.entries(pd.cells).forEach(([k,v])=>{if(!["CT","MRI"].includes(k))sp(v).forEach(m=>{const c=ex(m);if(this.rc[c]){this.rc[c][k]++;this.cts[c]++;}});}));
    if(this.pd?.cells["入り"]){ const im=sp(this.pd.cells["入り"]).map(ex); this.dc["明け"]=jn(Array.from(new Set([...sp(this.dc["明け"]),...im]))); if(im.length>0)this.lg(`[前日処理] 昨日の入りを明けに`); }
    if(this.d.isPublicHoliday){ this.lg(`🎌 祝日スキップ`); return {...this.d,cells:Object.fromEntries(SEC.map(s=>[s,""])),logInfo:this.logInfo}; }
    const dc=this.d.label.match(/\((.*?)\)/)?.[1]; if(dc) (this.cx.customRules.closedRooms||[]).forEach((r:any)=>{if(r.day===dc)this.lg(`🛑 ${r.room} ${r.time} 閉室`);});
    if(!this.sm){ RM_SEC.forEach(s=>this.dc[s]=jn(sp(this.dc[s]).filter(m=>PL_SEC.includes(ex(m))))); this.dc["昼当番"]=""; this.dc["受付ヘルプ"]=""; this.dc["待機"]=""; }
    this.cx.allStaff.forEach((s: string)=>this.bm.set(s,'NONE')); ["明け","入り","土日休日代休"].forEach(s=>sp(this.dc[s]).forEach(m=>this.bm.set(ex(m),'ALL'))); sp(this.dc["不在"]).forEach(m=>this.bm.set(ex(m),m.includes("(AM)")?'AM':m.includes("(PM)")?'PM':'ALL'));
    if(this.sm) WK_SEC.forEach(s=>{ const nx=sp(this.dc[s]).filter(m=>{const c=ex(m),b=this.bm.get(c);if(PL_SEC.includes(c))return true; if(b==='ALL')return false; if(b==='AM'&&!m.includes("(PM)")&&!m.match(/\(.*\)/))return false; if(b==='PM'&&!m.includes("(AM)")&&!m.match(/\(.*\)/))return false; return true;}); if(sp(this.dc[s]).length!==nx.length)this.dc[s]=jn(nx); });
    (this.cx.customRules.dailyAdditions||[]).forEach((r:any)=>{if(r.date===this.d.id&&r.section&&r.count>0&&r.section!=="透析後胸部"){const p=r.section+"枠"+(r.time==="全日"||!r.time?"":r.time); let c=sp(this.dc[r.section]); if(!c.includes(p)){for(let i=0;i<r.count;i++)c.push(p);this.dc[r.section]=jn(c);}}});
    const tAv=this.cx.activeGeneralStaff.filter((s: string)=>this.bm.get(s)!=='ALL').length; (this.cx.customRules.emergencies||[]).forEach((em:any)=>{if(tAv<=Number(em.threshold)){if(em.type==="role_assign"&&em.role&&em.section)this.ra[em.role]=em; if(em.type==="staff_assign"&&em.staff&&em.section)this.stA.push(em); if(em.type==="clear"&&em.section){this.sk.push(em.section);this.cl.push(em.section);} if(em.type==="change_capacity"&&em.section)this.cap[em.section]=Number(em.newCapacity);}});
    Object.keys(this.dc).forEach(s=>{if(["明け","入り","不在","土日休日代休"].includes(s))return; if(this.sk.includes(s)){this.dc[s]="";return;} this.dc[s]=jn(sp(this.dc[s]).map(m=>{const c=ex(m);if(PL_SEC.includes(c))return m; const b=this.bm.get(c); if(b==='ALL'||(b==='AM'&&m.includes('(AM)'))||(b==='PM'&&m.includes('(PM)')))return null; if(b==='AM'&&!m.includes('(PM)')&&!m.match(/\(.*\)/))return `${c}(PM)`; if(b==='PM'&&!m.includes('(AM)')&&!m.match(/\(.*\)/))return `${c}(AM)`; return m;}).filter(Boolean) as string[]); });
    WK_SEC.forEach(s=>sp(this.dc[s]).forEach((m: string)=>{const c=ex(m);if(!PL_SEC.includes(c)&&this.bm.get(c)!=='ALL')this.aU(c,getAmt(m));}));
    const sSL=sp(this.cx.customRules.supportStaffList).map(ex); this.iaAll=this.cx.allStaff.filter((s: string)=>this.bm.get(s)!=='ALL').sort((a: string, b: string)=>(this.cts[a]||0)-(this.cts[b]||0)||a.localeCompare(b,'ja')); this.iaSup=this.iaAll.filter(s=>sSL.includes(s)); this.iaGen=this.iaAll.filter(s=>this.cx.activeGeneralStaff.includes(s)&&!sSL.includes(s)); this.iaRec=this.iaAll.filter(s=>this.cx.activeReceptionStaff.includes(s)||(this.cx.activeGeneralStaff.includes(s)&&!sSL.includes(s)));

    if(this.sm) {
      (this.cx.customRules.priorityRooms||SEC).forEach((rm:string)=>{
        if(RE_SEC.includes(rm)||["昼当番","受付ヘルプ","待機","透析後胸部"].includes(rm)||(this.cx.customRules.linkedRooms||[]).some((r:any)=>r.target===rm))return;
        const e=this.gET(rm,this.cap[rm]||1); if(e.al)return;
        let c=sp(this.dc[rm]); const getAmtArr=(arr:string[])=>arr.reduce((a:number,m:string)=>a+(PL_SEC.includes(ex(m))?0:getAmt(m)),0);
        const isFx=(sn:string)=>(this.cx.customRules.fixed||[]).some((r:any)=>ex(r.staff)===ex(sn));
        let sA=[...this.iaGen].sort((a,b)=>(this.bm.get(a)==='NONE'?0:100)-(this.bm.get(b)==='NONE'?0:100)||this.gPR(a,rm)-this.gPR(b,rm));
        while(getAmtArr(c)<e.cap){
          const fs=sA.find(s=>{if(this.ac[s]>=1||(this.ac[s]===0.5&&(!["CT","MRI","治療","RI"].includes(rm)||!getMSt(rm,this.cx.monthlyAssign).includes(s))))return false; if(this.iFb(s,rm)||(rm==="MMG"&&!this.iMC(s))||!this.cAK(s,rm)||this.iHNC(s,rm)||isFx(s))return false; const b=this.bm.get(s); if((e.pC&&b==='AM')||(e.aC&&b==='PM')||this.noHD(rm,b||""))return false; return true;});
          if(!fs)break; const b=this.bm.get(fs); let t="",p=1; if(b==='AM'){t="(PM)";p=0.5;}else if(b==='PM'){t="(AM)";p=0.5;}else if(e.pC){t="(AM)";p=0.5;}else if(e.aC){t="(PM)";p=0.5;} c.push(`${fs}${t}`); this.aU(fs,p); sA=sA.filter(x=>x!==fs); this.lg(`✅ [配置決定] ${rm} に ${fs}${t}`);
        } this.dc[rm]=jn(c);
      });
      return {...this.d,cells:this.dc,logInfo:this.logInfo};
    }

    this.lgP("例外処理");
    (this.cx.customRules.fixed||[]).forEach((r:any)=>{if(!r.staff||!r.section)return; Object.keys(this.dc).forEach(s=>{if(s===r.section||RE_SEC.includes(s))return; const af=sp(this.dc[s]).filter(m=>ex(m)!==ex(r.staff)); if(sp(this.dc[s]).length!==af.length){this.dc[s]=jn(af);this.ac[ex(r.staff)]=0;this.bm.set(ex(r.staff),'NONE');}});});
    [...(this.cx.customRules.fixed||[]),...this.stA].forEach((r:any)=>{const c=ex(r.staff); if(!c||!r.section||!this.iaAll.includes(c)||this.iU(c)||this.iFb(c,r.section)||r.section==="透析後胸部")return; if(this.iHNC(c,r.section)||this.sk.includes(r.section)||sp(this.dc[r.section]).map(ex).includes(c)||this.hNG(c,sp(this.dc[r.section]).map(ex),false))return; const b=this.bm.get(c); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; if(this.noHD(r.section,t))return; this.bm.set(c,'ALL'); this.dc[r.section]=jn([...sp(this.dc[r.section]),`${c}${t}`]); this.aU(c,t?0.5:1); this.lg(`🔒 [専従] ${c} を ${r.section}`);});
    Object.values(this.ra).forEach(ra=>{if(this.sk.includes(ra.section)||ra.section==="透析後胸部")return; const cand=sp(this.cx.monthlyAssign[ra.role]||"").map(ex); const st=cand.find(s=>(["受付"].includes(ra.role)?this.iaRec:this.iaGen).includes(s)&&!this.iU(s)&&!this.iFb(s,ra.section)); if(st&&!sp(this.dc[ra.section]).map(ex).includes(st)){const b=this.bm.get(st); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; if(this.noHD(ra.section,t))return; this.bm.set(st,'ALL'); this.dc[ra.section]=jn([...sp(this.dc[ra.section]),`${st}${t}`]); this.aU(st,t?0.5:1); this.lg(`📌 [緊急役割] ${st} を ${ra.section}`);}});
    (this.cx.customRules.substitutes||[]).forEach((su:any)=>{const tgts=sp(su.target).map(ex); if(!tgts.length||!su.section||this.sk.includes(su.section)||su.section==="透析後胸部"||tgts.some(t=>sp(this.dc[su.section]).map(ex).includes(t))||!tgts.every(t=>!this.iaAll.includes(t)))return; const fs=sp(su.subs).map(ex).filter(s=>this.iaGen.includes(s)&&!this.iU(s)&&!this.iFb(s,su.section)); if(fs.length>0){const cM=sp(this.dc[su.section]); for(const f of fs){if(this.iHB(f,su.section).h||this.hNG(f,cM.map(ex),false)||!this.cAK(f,su.section))continue; const b=this.bm.get(f); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; if(this.noHD(su.section,t))continue; this.bm.set(f,'ALL'); this.dc[su.section]=jn([...cM,`${f}${t}`]); this.aU(f,t?0.5:1); this.lg(`🔄 [代打] ${f} を ${su.section}`); break;}}});
    (this.cx.customRules.pushOuts||[]).forEach((po:any)=>{const s1=ex(po.s1||po.triggerStaff), s2=ex(po.s2||po.targetStaff), tS=po.triggerSection; if(!s1||!s2||!tS||!po.targetSections||!this.iaGen.includes(s1)||!this.iaGen.includes(s2)||!sp(this.dc[tS]).map(ex).includes(s1)||!sp(this.dc[tS]).map(ex).includes(s2))return; for(const rm of sp(po.targetSections).filter(s=>!this.sk.includes(s)&&s!=="透析後胸部")){if(this.iFb(s2,rm)||this.iHB(s2,rm).h||this.hNG(s2,sp(this.dc[rm]).map(ex),false)||!this.cAK(s2,rm))continue; const aC=this.cap[rm]??(["CT","MRI","治療"].includes(rm)?3:1); if(sp(this.dc[rm]).reduce((a,m)=>a+(PL_SEC.includes(ex(m))?0:getAmt(m)),0)<aC){this.dc[tS]=jn(sp(this.dc[tS]).filter(m=>ex(m)!==s2)); const b=this.bm.get(s2); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; if(this.noHD(rm,t))continue; this.dc[rm]=jn([...sp(this.dc[rm]),`${s2}${t}`]); this.aU(s2,t==="(AM)"||t==="(PM)"?0.5:1); this.bm.set(s2,t===""?'ALL':t==="(AM)"?'PM':'AM'); this.lg(`🎱 [玉突き] ${s1} と被ったため ${s2} を ${rm}`); break;}}});

    this.lgP("メイン配置");
    const LTR=(this.cx.customRules.linkedRooms||[]).map((r:any)=>r.target);
    (this.cx.customRules.priorityRooms||(DEF_RULES.priorityRooms||[])).forEach((rm:string)=>{
      if(this.sk.includes(rm)||["受付ヘルプ","昼当番","待機","透析後胸部"].includes(rm))return;
      let tC=this.cap[rm]!==undefined?this.cap[rm]:(["CT","MRI","治療"].includes(rm)?3:1);
      let cM=sp(this.dc[rm]); const ph=cM.filter(m=>PL_SEC.includes(ex(m))); if(ph.length>0){tC+=ph.length; this.dc[rm]=jn(cM.filter(m=>!PL_SEC.includes(ex(m))));}
      if(rm==="受付"){
        let cU=sp(this.dc["受付"]); sp(this.cx.monthlyAssign.受付).map(ex).forEach(n=>{if(this.iaAll.includes(n)&&!this.iU(n)&&!cU.map(ex).includes(n)){const b=this.bm.get(n);if(b==='ALL')return;let t=b==='AM'?"(PM)":b==='PM'?"(AM)":"";cU.push(`${n}${t}`);this.aU(n,t?0.5:1);this.bm.set(n,'ALL');}});
        let nU=tC-cU.reduce((s,m)=>s+getAmt(m),0); if(nU>0&&!LTR.includes(rm)){this.pk(this.iaRec,this.iaRec,Math.ceil(nU),"受付",cU).forEach((n:string)=>{const b=this.bm.get(n);let t=b==='AM'?"(PM)":b==='PM'?"(AM)":"";cU.push(`${n}${t}`);this.aU(n,t?0.5:1);this.bm.set(n,'ALL');});} this.dc["受付"]=jn(cU);
      } else {
        let pL=(["治療","RI","CT","MRI","MMG"].includes(rm)?getMSt(rm,this.cx.monthlyAssign):sp(this.cx.monthlyAssign[rm]).map(ex)).filter(s=>this.iaGen.includes(s));
        let cand=(["治療","RI","MMG"].includes(rm)&&pL.length>0)?pL:this.iaGen;
        if(!LTR.includes(rm)&&!(this.cx.customRules.kenmuPairs||[]).filter((p:any)=>p.s1===rm||p.s2===rm).map((p:any)=>p.s1===rm?p.s2:p.s1).some((pr:string)=>sp(this.dc[pr]).reduce((s,m)=>s+getAmt(m),0)>0)){ this.fill(cand, rm, pL, tC); }
      }
    });

    this.processPostTasks(); return {...this.d, cells:this.dc, logInfo:this.logInfo};
  }

  fill(avL: string[], sec: string, pL: string[], tC: number) {
    if(this.sk.includes(sec)||sec==="透析後胸部")return; const e=this.gET(sec,tC); if(e.al)return;
    let cur=sp(this.dc[sec]); let pA=-1;
    while(cur.reduce((s,m)=>s+getAmt(m),0)<e.cap) {
      const cA=cur.reduce((s,m)=>s+getAmt(m),0); if(cA===pA)break; pA=cA; let cAm=e.aC?999:0, cPm=e.pC?999:0; cur.forEach(x=>{if(x.includes("(AM)"))cAm++;else if(x.includes("(PM)"))cPm++;else{cAm++;cPm++;}});
      let nT=""; if(cAm>=tC&&cPm<tC)nT="(PM)"; else if(cPm>=tC&&cAm<tC)nT="(AM)"; else if(e.cap-cA===0.5){nT=cAm>cPm?"(PM)":cPm>cAm?"(AM)":"";}
      const gFR=(name:string):{hard:boolean,msg:string}|null=>{if(cur.map(ex).includes(name))return{hard:true,msg:"配置済"}; if(this.iU(name))return{hard:true,msg:"他業務"}; if(this.iFb(name,sec))return{hard:true,msg:"不可"}; if(sec==="MMG"&&!this.iMC(name))return{hard:true,msg:"MMG外"}; if(!this.cAK(name,sec))return{hard:true,msg:"上限"}; const b=this.bm.get(name); if(nT&&b==='NONE'&&!e.pC&&!e.aC&&!getMSt(sec,this.cx.monthlyAssign).includes(name))return{hard:true,msg:"半端枠"}; if(b==='ALL')return{hard:true,msg:"全日ブ"}; if(nT==="(AM)"&&b==='AM')return{hard:true,msg:"AMブ"}; if(nT==="(PM)"&&b==='PM')return{hard:true,msg:"PMブ"}; if(e.pC&&b==='AM')return{hard:true,msg:"午後休"}; if(e.aC&&b==='PM')return{hard:true,msg:"午前休"}; if(this.noHD(sec,nT||b||""))return{hard:true,msg:"終日専任"}; if(this.iHB(name,sec).h)return{hard:true,msg:"終日専任"}; if(this.iHNC(name,sec))return{hard:false,msg:"連日"}; if(this.hNG(name,cur.map(ex),false))return{hard:true,msg:"NG"}; if(this.hNG(name,cur.map(ex),true))return{hard:false,msg:"NG軟"}; return null;};
      const cWR=avL.map(n=>({n,r:gFR(n)})); let vN=cWR.filter(c=>!c.r).map(c=>c.n); let fM=""; if(!vN.length){const sC=cWR.filter(c=>c.r&&!c.r.hard); if(sC.length>0){vN=sC.map(c=>c.n); fM="（⚠️特例）";}else break;}
      const vP=vN.filter(n=>pL.includes(n)); const vA=vN.filter(n=>!pL.includes(n));
      const sCnd=(cs:string[])=>{let ms=sp(this.cx.monthlyAssign[sec]).map(ex),sps=sp(this.cx.monthlyAssign[sec+"サブ優先"]).map(ex),ss=sp(this.cx.monthlyAssign[sec+"サブ"]).map(ex); if(sec==="治療"||sec==="RI"){ms=sp(this.cx.monthlyAssign[sec]).map(ex);if(sec==="治療"){sps=sp(this.cx.monthlyAssign.治療サブ優先).map(ex);ss=sp(this.cx.monthlyAssign.治療サブ).map(ex);}else{ss=sp(this.cx.monthlyAssign.RIサブ).map(ex);}} const hA=vN.some(s=>this.bm.get(s)==='PM'), hP=vN.some(s=>this.bm.get(s)==='AM'); return [...cs].sort((a,b)=>{const bA=this.bm.get(a),bB=this.bm.get(b); let sA=0,sB=0; if(ms.includes(a))sA+=10000;else if(sps.includes(a))sA+=5000;else if(ss.includes(a))sA+=2000; if(ms.includes(b))sB+=10000;else if(sps.includes(b))sB+=5000;else if(ss.includes(b))sB+=2000; if(this.iHB(a,sec).monthlyHalfException)sA-=3000; if(this.iHB(b,sec).monthlyHalfException)sB-=3000; const rw=["MRI","CT"].includes(sec)?200:100; sA-=(this.rc[a]?.[sec]||0)*rw; sB-=(this.rc[b]?.[sec]||0)*rw; if(this.iHNC(a,sec))sA-=500; if(this.iHNC(b,sec))sB-=500; if(sec==="ポータブル"){sA-=1000*this.gPR(a,sec);sB-=1000*this.gPR(b,sec);} if(nT===""){if(bA==='NONE')sA+=200;else if(hA&&hP&&(bA==='AM'||bA==='PM'))sA+=100;}else{if(nT==="(AM)"&&bA==='PM')sA+=200;if(nT==="(PM)"&&bA==='AM')sA+=200;if(bA==='NONE')sA+=100;} if(nT===""){if(bB==='NONE')sB+=200;else if(hA&&hP&&(bB==='AM'||bB==='PM'))sB+=100;}else{if(nT==="(AM)"&&bB==='PM')sB+=200;if(nT==="(PM)"&&bB==='AM')sB+=200;if(bB==='NONE')sB+=100;} return sB-sA||(this.ac[a]||0)-(this.ac[b]||0)||a.localeCompare(b,'ja');});};
      const pC=this.pk(vN,[...sCnd(vP),...sCnd(vA)],1,sec,cur.map(ex)); if(!pC.length)break;
      const c=pC[0], b=this.bm.get(c); let t="", f=1; if(b==='AM'){t="(PM)";f=0.5;this.bm.set(c,'ALL');}else if(b==='PM'){t="(AM)";f=0.5;this.bm.set(c,'ALL');}else{if(nT){t=nT;f=0.5;this.bm.set(c,nT==="(AM)"?'AM':'PM');}else if(e.pC){t="(AM)";f=0.5;this.bm.set(c,'AM');}else if(e.aC){t="(PM)";f=0.5;this.bm.set(c,'PM');}else{this.bm.set(c,'ALL');}}
      cur.push(`${c}${t}`); this.aU(c,f); this.lg(`✅ [配置] ${sec} に ${c}${t} ${fM}`);
    }
    this.dc[sec]=jn(cur);
  }

  processPostTasks() {
    const sSL=sp(this.cx.customRules.supportStaffList).map(ex); const lowPriorityStaff=sp(this.cx.customRules.lateShiftLowPriorityStaff).map(ex);
    this.iaSup.forEach(staff=>{if(this.iU(staff))return; let asg=false; for(const rm of sp(this.cx.customRules.supportTargetRooms)){if(this.sk.includes(rm)||this.iFb(staff,rm)||rm==="透析後胸部")continue; let c=sp(this.dc[rm]); if(c.length>0&&!c.map(ex).includes(staff)&&!this.hNG(staff,c.map(ex),false)&&!this.iHNC(staff,rm)){const b=this.bm.get(staff);let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; if(this.noHD(rm,t))continue; this.dc[rm]=jn([...c,`${staff}${t}`]);this.aU(staff,t?0.5:1);this.bm.set(staff,'ALL');asg=true;break;}} if(!asg){for(const rm of sp(this.cx.customRules.supportTargetRooms)){if(this.sk.includes(rm)||this.iFb(staff,rm)||rm==="透析後胸部")continue; if(!sp(this.dc[rm]).length&&!this.iHNC(staff,rm)&&this.cAK(staff,rm)){const b=this.bm.get(staff);let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; if(this.noHD(rm,t))continue; this.dc[rm]=`${staff}${t}`;this.aU(staff,t?0.5:1);this.bm.set(staff,'ALL');break;}}}});
    
    (this.cx.customRules.swapRules||[]).forEach((r:any)=>{
      if(!r.targetRoom||!r.triggerRoom||!r.sourceRooms||r.targetRoom==="透析後胸部"||r.triggerRoom==="透析後胸部")return;
      const tC=this.cap[r.targetRoom]??(["CT","MRI","治療"].includes(r.targetRoom)?3:1); if(sp(this.dc[r.targetRoom]).reduce((s,m)=>s+getAmt(m),0)>=tC)return;
      const tM=sp(this.dc[r.triggerRoom]); if(!tM.length)return;
      if(!tM.some(m=>{const c=ex(m);return !PL_SEC.includes(c)&&!this.iFb(c,r.targetRoom)&&!this.iHNC(c,r.targetRoom)&&!this.iHB(c,r.targetRoom).h&&this.cAK(c,r.targetRoom,true);})){
        let sw=false;
        for(const sSR of sp(r.sourceRooms).sort((a,b)=>this.gRSc(prC(a).r,r.targetRoom)-this.gRSc(prC(b).r,r.targetRoom))){
          const {r:sR}=prC(sSR); if(sR===r.triggerRoom||sR==="透析後胸部")continue; const sM=sp(this.dc[sR]);
          let sC=sM.filter(m=>!PL_SEC.includes(ex(m))&&!this.iFb(ex(m),r.targetRoom)&&!this.iHB(ex(m),r.targetRoom).h&&!this.iHNC(ex(m),r.targetRoom)&&this.cAK(ex(m),r.targetRoom,true)&&!this.iFb(ex(m),r.triggerRoom)&&!this.noHD(r.targetRoom,m));
          sC.sort((a,b)=>this.gTR(ex(a))-this.gTR(ex(b))||this.gPR(ex(a),r.targetRoom)-this.gPR(ex(b),r.targetRoom));
          for(const sm of sC){const sCo=ex(sm); const tTK=tM.find(m=>!this.iFb(ex(m),sR)&&!this.iHB(ex(m),sR).h&&!this.hNG(ex(m),sM.map(ex),false)&&this.cAK(ex(m),sR,true)); if(tTK&&this.cAK(sCo,r.targetRoom,true)){this.dc[r.triggerRoom]=jn(tM.map(m=>m===tTK?m.replace(ex(tTK),sCo):m)); this.dc[sR]=jn(sM.map(m=>m===sm?m.replace(sCo,ex(tTK)):m)); this.lg(`🔄 [玉突き] ${r.triggerRoom}の${ex(tTK)}と ${sR}の${sCo}を交換`); sw=true; break;}} if(sw)break;
        }
      }
    });

    let uG1=this.iaGen.filter(s=>!this.iU(s)&&this.bm.get(s)!=='ALL');
    (this.cx.customRules.linkedRooms||[]).forEach((r:any)=>{
      if(!r.target||this.sk.includes(r.target)||r.target==="透析後胸部")return; const tC=this.cap[r.target]??(["CT","MRI","治療"].includes(r.target)?3:1); const e=this.gET(r.target,tC); if(e.al)return;
      let cM=sp(this.dc[r.target]); let cA=0,cP=0; cM.forEach(x=>{if(x.includes("(AM)"))cA++;else if(x.includes("(PM)"))cP++;else{cA++;cP++;}});
      if(cM.length>0&&cM.every(m=>sSL.includes(ex(m)))){cA=0;cP=0;} uG1.sort((a,b)=>this.gTR(a)-this.gTR(b)||this.gPR(a,r.target)-this.gPR(b,r.target));
      while((cA<tC||cP<tC)&&uG1.length>0){const ci=uG1.findIndex(s=>!this.iFb(s,r.target)&&!this.iHB(s,r.target).h&&!this.hNG(s,cM.map(ex),false)&&!this.iHNC(s,r.target)&&!(r.target==="MMG"&&!this.iMC(s))&&this.cAK(s,r.target)&&!(cP>=tC&&this.bm.get(s)==='AM')&&!(cA>=tC&&this.bm.get(s)==='PM')&&!this.noHD(r.target,this.bm.get(s)||"")); if(ci===-1)break; const st=uG1[ci]; uG1.splice(ci,1); const b=this.bm.get(st); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; if(!t){if(cA>=tC)t="(PM)";else if(cP>=tC)t="(AM)";} this.bm.set(st,t===""?'ALL':t==="(AM)"?'PM':'AM'); cM.push(`${st}${t}`); if(t==="(AM)")cA++;else if(t==="(PM)")cP++;else{cA++;cP++;} this.aU(st,t?0.5:1); this.lg(`🙌 [負担軽減] 余剰の ${st} を ${r.target} に配置`);} this.dc[r.target]=jn(cM);
    });

    (this.cx.customRules.smartKenmu||[]).forEach((r:any)=>{
      if(!r.targetRoom||this.sk.includes(r.targetRoom)||r.targetRoom==="透析後胸部")return; const tM=sp(this.dc[r.targetRoom]); if(!tM.length)return;
      for(const tm of tM){const tc=ex(tm); if(PL_SEC.includes(tc))continue; if(!RM_SEC.some(rm=>rm!==r.targetRoom&&sp(this.dc[rm]).map(ex).includes(tc))){
        let sC:string|null=null, fSR:string|null=null;
        for(const sSR of sp(r.sourceRooms)){const{r:sR,min}=prC(sSR); const sMs=sp(this.dc[sR]); if(sR==="透析後胸部"||(min>0&&sMs.reduce((s,m)=>s+getAmt(m),0)<min)||this.iFb(tc,sR)||this.iHB(tc,sR).h||!this.cAK(tc,sR,true))continue;
          let cnds=sMs.filter(m=>{const c=ex(m);return c!==tc&&!PL_SEC.includes(c)&&!this.iFb(c,r.targetRoom)&&!this.hNG(c,tM.map(ex),false)&&!this.iHNC(c,r.targetRoom)&&(r.targetRoom==="MMG"?this.iMC(c):true)&&this.cAK(c,r.targetRoom)&&!this.noHD(r.targetRoom,m);});
          cnds.sort((a,b)=>this.gTR(ex(a))-this.gTR(ex(b))||this.gPR(ex(a),r.targetRoom)-this.gPR(ex(b),r.targetRoom));
          if(cnds.length>0){sC=cnds[0]; fSR=sR; break;}
        }
        if(sC&&fSR){const cc=ex(sC); this.dc[fSR]=jn([...sp(this.dc[fSR]).filter(m=>m!==sC),`${tc}${tm.includes("(AM)")?"(AM)":tm.includes("(PM)")?"(PM)":""}`]); this.dc[r.targetRoom]=jn(tM.map(m=>m===tm?sC:m) as string[]); this.aU(cc,getAmt(sC)); this.bm.set(tc,tm.includes("(AM)")?'PM':tm.includes("(PM)")?'AM':'ALL'); break;}
      }}
    });

    const processKenmu=(sm:string[], tm:string[], tr:string)=>{if(tr==="透析後胸部")return tm; const tC=this.cap[tr]||1; const tcs=tm.map(ex); let cA=tm.reduce((s,m)=>s+getAmt(m),0); for(const m of sm){if(cA>=tC)break; const c=ex(m); if(tcs.includes(c)||m.includes("17:")||m.includes("19:")||this.iFb(c,tr)||this.iHNC(c,tr)||this.iHB(c,tr).h||this.hNG(c,tcs,false)||!this.cAK(c,tr)||this.noHD(tr,m))continue; let pS=m, cam=0, cpm=0; tm.forEach(x=>{if(x.includes("(AM)"))cam++;else if(x.includes("(PM)"))cpm++;else{cam++;cpm++;}}); if(cam<tC&&cpm>=tC){if(m.includes("(PM)"))continue;pS=`${c}(AM)`;}else if(cam>=tC&&cpm<tC){if(m.includes("(AM)"))continue;pS=`${c}(PM)`;} tm.push(pS); tcs.push(c); const a=getAmt(pS); cA+=a; this.aU(c,a); this.uBM(c,pS);} return tm;};
    (this.cx.customRules.kenmuPairs||[]).forEach((p:any)=>{if(!p.s1||!p.s2||p.s1==="透析後胸部"||p.s2==="透析後胸部")return; let m1=sp(this.dc[p.s1]), m2=sp(this.dc[p.s2]); this.dc[p.s2]=jn(processKenmu(m1,m2,p.s2)); m2=sp(this.dc[p.s2]); this.dc[p.s1]=jn(processKenmu(m2,m1,p.s1));});

    (this.cx.customRules.linkedRooms||[]).forEach((r:any)=>{
      if(!r.target||this.sk.includes(r.target)||r.target==="透析後胸部")return; const tC=this.cap[r.target]??(["CT","MRI","治療"].includes(r.target)?3:1); const e=this.gET(r.target,tC); if(e.al)return;
      let cM=sp(this.dc[r.target]); let cA=0,cP=0; cM.forEach(x=>{if(x.includes("(AM)"))cA++;else if(x.includes("(PM)"))cP++;else{cA++;cP++;}});
      for(const sSR of sp(r.sources)){if(cA>=tC&&cP>=tC)break; const {r:sR,min}=prC(sSR); if(sR==="透析後胸部"||(min>0&&sp(this.dc[sR]).reduce((s,m)=>s+getAmt(m),0)<min))continue;
        sp(this.dc[sR]).forEach(m=>{if(cA>=tC&&cP>=tC)return; const c=ex(m); if(!PL_SEC.includes(c)&&!cM.map(ex).includes(c)&&!this.iFb(c,r.target)&&!this.iHB(c,r.target).h&&!this.hNG(c,cM.map(ex),false)&&!this.iHNC(c,r.target)&&(r.target==="MMG"?this.iMC(c):true)&&this.cAK(c,r.target,true)&&!m.includes("17:")&&!m.includes("19:")&&!this.noHD(r.target,m)){let pS=m; if(r.target==="パノラマCT"&&sR==="透視（6号）"){if(m.includes("(PM)"))return; pS=`${c}(AM)`;}else{if(cA<tC&&cP>=tC){if(m.includes("(PM)"))return; pS=`${c}(AM)`;}else if(cA>=tC&&cP<tC){if(m.includes("(AM)"))return; pS=`${c}(PM)`;}else if(e.pC){if(m.includes("(PM)"))return; pS=`${c}(AM)`;}else if(e.aC){if(m.includes("(AM)"))return; pS=`${c}(PM)`;}} if(this.noHD(r.target,pS))return; cM.push(pS); if(pS.includes("(AM)"))cA++;else if(pS.includes("(PM)"))cP++;else{cA++;cP++;} this.aU(c,getAmt(pS)); this.uBM(c,pS); this.lg(`🔗 [基本兼務] ${sR} の ${pS} を ${r.target}`);}});
      } this.dc[r.target]=jn(cM);
    });

    RM_SEC.forEach(tR=>{
      if(this.cl.includes(tR)||["待機","昼当番","受付","受付ヘルプ","透析後胸部"].includes(tR))return; const tC=this.cap[tR]??(["CT","MRI","治療"].includes(tR)?3:1); const e=this.gET(tR,tC); if(e.al)return;
      let cM=sp(this.dc[tR]); let cA=e.aC?999:0, cP=e.pC?999:0; cM.forEach(x=>{if(x.includes("(AM)"))cA++;else if(x.includes("(PM)"))cP++;else{cA++;cP++;}}); if(cM.length>0&&cM.every(m=>sSL.includes(ex(m)))){cA=e.aC?999:0;cP=e.pC?999:0;} if(cA>=tC&&cP>=tC)return;
      const mR=(this.cx.customRules.rescueRules||[]).filter((r:any)=>r.targetRoom===tR); let sRms=mR.length>0?mR.flatMap((r:any)=>sp(r.sourceRooms)).sort((a:string,b:string)=>this.gRSc(prC(a).r,tR)-this.gRSc(prC(b).r,tR)):[...sp(this.cx.customRules.supportTargetRoomsLowImpact),"2号室","1号室","5号室","CT(4)"].filter(r=>r!==tR);
      if(sRms.length>0){let cnds:{c:string,fS:string,i:number}[]=[]; sRms.forEach((sS:string,i:number)=>{const{r:sR,min}=prC(sS); if(sR===tR||sR==="透析後胸部"||(min>0&&sp(this.dc[sR]).reduce((s,m)=>s+getAmt(m),0)<min))return; sp(this.dc[sR]).forEach(m=>{const c=ex(m); if(!PL_SEC.includes(c)&&!this.iHNC(c,tR)&&!cnds.some(x=>x.c===c)&&!this.iFb(c,tR)&&!this.iHB(c,tR).h&&!m.includes("17:")&&!this.noHD(tR,m))cnds.push({c,fS:m,i});});}); const cCs=cM.map(ex); cnds=cnds.filter(c=>!cCs.includes(c.c)&&(tR==="MMG"?this.iMC(c.c):true)&&this.cAK(c.c,tR,true)); cnds.sort((a,b)=>this.gTR(a.c)-this.gTR(b.c)||this.gPR(a.c,tR)-this.gPR(b.c,tR)||a.i-b.i||(this.ac[a.c]||0)-(this.ac[b.c]||0)); for(const cn of cnds){if(cA>=tC&&cP>=tC)break; if(this.hNG(cn.c,cCs,false))continue; let pS=cn.fS; if(cA<tC&&cP>=tC){if(cn.fS.includes("(PM)"))continue; pS=`${cn.c}(AM)`;}else if(cA>=tC&&cP<tC){if(cn.fS.includes("(AM)"))continue; pS=`${cn.c}(PM)`;}else if(e.pC){if(cn.fS.includes("(PM)"))continue; pS=`${cn.c}(AM)`;}else if(e.aC){if(cn.fS.includes("(AM)"))continue; pS=`${cn.c}(PM)`;} cM.push(pS); if(pS.includes("(AM)"))cA++;else if(pS.includes("(PM)"))cP++;else{cA++;cP++;} this.aU(cn.c,getAmt(pS)); this.uBM(cn.c,pS);} this.dc[tR]=jn(cM);}
    });

    (this.cx.customRules.emergencies||[]).forEach((em:any)=>{
      if(em.type!=="empty_room_swap")return; const wR=em.section; const sRL=sp(em.sourceRooms||em.sourceRoom); if(!wR||!sRL.length||this.sk.includes(wR)||wR==="透析後胸部")return; const wC=this.cap[wR]??1; if(sp(this.dc[wR]).reduce((s,m)=>s+getAmt(m),0)>=wC)return;
      let sw=false; for(const sF of sRL){if(sw||sF==="透析後胸部")break; const sM=sp(this.dc[sF]); if(!sM.length)continue; const ngI=sM.filter(m=>{const c=ex(m);return !PL_SEC.includes(c)&&(this.iFb(c,wR)||!this.cAK(c,wR,true));}); if(!ngI.length)continue; for(const src of RM_SEC.filter(r=>r!==wR&&r!==sF&&!this.sk.includes(r)&&!["待機","昼当番","受付","受付ヘルプ","透析後胸部"].includes(r))){if(sw)break; const rM=sp(this.dc[src]); const oC=rM.filter(m=>{const c=ex(m);return !PL_SEC.includes(c)&&!this.iFb(c,wR)&&!this.iFb(c,sF)&&!this.iHB(c,wR).h&&!this.iHNC(c,wR)&&this.cAK(c,wR,true)&&!m.includes("17:")&&!m.includes("19:")&&!this.noHD(wR,m);}); for(const om of oC){const oc=ex(om); const km=ngI.find(m=>{const c=ex(m);return !this.iFb(c,src)&&!this.iHB(c,src).h&&!this.hNG(c,rM.map(ex),false)&&this.cAK(c,src,true);}); if(!km)continue; const kc=ex(km); this.dc[sF]=jn(sM.map(m=>m===km?m.replace(kc,oc):m)); this.dc[src]=jn(rM.map(m=>m===om?m.replace(oc,kc):m)); sw=true; break;}}}
    });

    (this.cx.customRules.lateShifts||[]).forEach((r:any)=>{let c=sp(this.dc[r.section]); if(c.length>0&&!c.some(m=>m.includes("17:")||m.includes("18:"))){const cC=c.map(ex); const pL=this.pd?sp(this.pd.cells[r.section]).filter(m=>m.includes("17:")||m.includes("18:")||m.includes("19:")||m.includes("22:")).map(ex):[]; const exS=Array.from(new Set([...sp(this.cx.customRules.noLateShiftStaff).map(ex),...sp(this.cx.customRules.noLateShiftRooms).flatMap(rm=>sp(this.dc[rm]).map(ex))])); const fM=sp(this.dc["不在"]); const cnd=this.iaGen.filter(n=>!cC.includes(n)&&!this.iFb(n,r.section)&&!exS.includes(n)&&!fM.some(m=>ex(m)===n)); cnd.sort((a,b)=>{let sA=this.getPastLateShiftCount(a)*100, sB=this.getPastLateShiftCount(b)*100; const iA=lowPriorityStaff.indexOf(a), iB=lowPriorityStaff.indexOf(b); if(iA!==-1)sA+=100000+((lowPriorityStaff.length-iA)*10000); if(iB!==-1)sB+=100000+((lowPriorityStaff.length-iB)*10000); return sA-sB||a.localeCompare(b,'ja');}); let pk=cnd.find(n=>!pL.includes(n))||(cnd.length?cnd[0]:null); if(pk){c.push(`${pk}${r.lateTime}`); this.bm.set(pk,this.bm.get(pk)==='AM'?'ALL':'PM'); this.dc[r.section]=jn(c);}}});

    const pM=sp(this.dc["ポータブル"]), r2M=sp(this.dc["2号室"]), r2C=r2M.map(ex), r2A=r2M.reduce((s,m)=>s+(PL_SEC.includes(ex(m))?0:getAmt(m)),0); let nAH=false, nPH=false; r2M.forEach(rm=>{const c=ex(rm); const pm=pM.find(x=>ex(x)===c); if(pm){if(pm.includes("(AM)"))nAH=true; else if(pm.includes("(PM)"))nPH=true; else{nAH=true;nPH=true;}}});
    if(r2A<2&&(nAH||nPH)){
      const fC=(iA:boolean,exS:string[])=>[...sSL,...this.iaGen].filter((s,i,a)=>a.indexOf(s)===i).find(s=>{if(r2C.includes(s)||this.iFb(s,"2号室")||this.iHB(s,"2号室").h||this.hNG(s,r2C,false)||!this.cAK(s,"2号室")||this.iHNC(s,"2号室"))return false; const b=this.bm.get(s); if(b==='ALL'||(iA&&b==='AM')||(!iA&&b==='PM'))return false; if(exS.some(r=>sp(this.dc[r]).map(ex).includes(s)))return false; return true;});
      if(nAH){let p=fC(true,["1号室","5号室"])??fC(true,[]); if(p){this.dc["2号室"]=jn([...sp(this.dc["2号室"]),`${p}(AM)`]); this.aU(p,0.5); this.bm.set(p,this.bm.get(p)==='PM'?'ALL':'AM'); this.lg(`🤝 [ポータブル特例] 2号室兼務(AM)のため ${p}`);}}
      if(nPH){let p=fC(false,["1号室","5号室"])??fC(false,[]); if(p){this.dc["2号室"]=jn([...sp(this.dc["2号室"]),`${p}(PM)`]); this.aU(p,0.5); this.bm.set(p,this.bm.get(p)==='AM'?'ALL':'PM'); this.lg(`🤝 [ポータブル特例] 2号室兼務(PM)のため ${p}`);}}
    }

    const pL=this.cx.customRules.priorityRooms||(DEF_RULES.priorityRooms||[]);
    const dKT=RM_SEC.filter(r=>!["CT","MRI","治療","RI","待機","昼当番","受付","受付ヘルプ","透析後胸部"].includes(r)).sort((a,b)=>{let iA=pL.indexOf(a);if(iA===-1)iA=999;let iB=pL.indexOf(b);if(iB===-1)iB=999;return iB-iA;});
    const rP=[...RM_SEC].sort((a,b)=>{let iA=pL.indexOf(a);if(iA===-1)iA=999;let iB=pL.indexOf(b);if(iB===-1)iB=999;return iB-iA;});
    
    let uG2=this.iaGen.filter(s=>!this.iU(s)&&this.bm.get(s)!=='ALL');
    uG2.forEach(st=>{
      const b=this.bm.get(st); if(b==='ALL')return; let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; let asg=false;
      for(const rm of dKT){
        if(this.sk.includes(rm)||this.iFb(st,rm)||(rm==="MMG"&&!this.iMC(st))||(t!==""&&this.iHB(st,rm).h))continue; const e=this.gET(rm,1); if(e.al||(t==="(PM)"&&e.pC)||(t==="(AM)"&&e.aC))continue;
        let cM=sp(this.dc[rm]);
        const rI=cM.findIndex(m=>{const c=ex(m); if(PL_SEC.includes(c)||this.hNG(st,cM.filter(x=>x!==m).map(ex),false))return false; const cc=this.gTC(c); if((t==="(AM)"&&cc.a<=1)||(t==="(PM)"&&cc.p<=1)||(t===""&&cc.a<=1&&cc.p<=1))return false; let ca=m.includes("(AM)"),cp=m.includes("(PM)"); if(!ca&&!cp){ca=true;cp=true;} let na=t==="(AM)",np=t==="(PM)"; if(!na&&!np){na=true;np=true;} return (ca&&na)||(cp&&np);});
        if(rI!==-1){const oS=cM[rI], oC=ex(oS); let oR=""; if(t==="(AM)"&&!oS.includes("("))oR=`${oC}(PM)`; else if(t==="(PM)"&&!oS.includes("("))oR=`${oC}(AM)`; cM[rI]=`${st}${t}`; if(oR)cM.push(oR); this.dc[rm]=jn(cM); this.aU(st,t?0.5:1); this.bm.set(st,'ALL'); this.ac[oC]=Math.max(0,(this.ac[oC]||1)-getAmt(oS)); let am=false,pm=false; RM_SEC.forEach(r=>{if(["待機","昼当番","受付","受付ヘルプ"].includes(r))return; sp(this.dc[r]).forEach(m=>{if(ex(m)===oC){if(m.includes("(AM)"))am=true;else if(m.includes("(PM)"))pm=true;else{am=true;pm=true;}}});}); if(am&&pm)this.bm.set(oC,'ALL'); else if(am)this.bm.set(oC,'AM'); else if(pm)this.bm.set(oC,'PM'); else this.bm.set(oC,'NONE'); this.lg(`🪄 [兼務解消] ${st} を専任化し ${oC} の負担軽減`); asg=true; break;}
      }
      if(!asg){for(const rm of rP){if(this.sk.includes(rm)||this.iFb(st,rm)||(rm==="MMG"&&!this.iMC(st))||["待機","昼当番","受付","受付ヘルプ","CT","MRI","治療","RI","透析後胸部"].includes(rm)||(t!==""&&this.iHB(st,rm).h))continue; const aC=this.cap[rm]??(["CT","MRI","治療"].includes(rm)?3:1); const e=this.gET(rm,aC); if(e.al||(t==="(PM)"&&e.pC)||(t==="(AM)"&&e.aC)||!this.cAK(st,rm)||this.iHNC(st,rm)||this.noHD(rm,t))continue; let cM=sp(this.dc[rm]); if(cM.reduce((s,m)=>s+getAmt(m),0)>=e.cap||this.hNG(st,cM.map(ex),false))continue; this.dc[rm]=jn([...cM,`${st}${t}`]); this.aU(st,t?0.5:1); this.bm.set(st,'ALL'); this.lg(`♻️ [余剰配置] 余力のあった ${st} を ${rm}`); asg=true; break;}}
      if(!asg){for(const fbR of ["3号室","2号室","1号室","5号室"]){if(this.sk.includes(fbR)||this.iFb(st,fbR))continue; const e=this.gET(fbR,1); if(e.al||(t==="(PM)"&&e.pC)||(t==="(AM)"&&e.aC)||this.iHNC(st,fbR)||this.noHD(fbR,t))continue; let cM=sp(this.dc[fbR]); if(this.hNG(st,cM.map(ex),false))continue; this.dc[fbR]=jn([...cM,`${st}${t}`]); this.aU(st,t?0.5:1); this.bm.set(st,'ALL'); this.lg(`🚨 [最終救済] 定員超過でも未配置を防ぐため ${st} を ${fbR}`); asg=true; break;}}
    });

    this.lgP("仕上げ");
    if(!this.sk.includes("昼当番")){
      let cL=sp(this.dc["昼当番"]); let lT=this.cx.customRules.lunchBaseCount??3; const dC=this.d.label.match(/\((.*?)\)/)?.[1]; if(dC){const sd=(this.cx.customRules.lunchSpecialDays||[]).find((x:any)=>x.day===dC); if(sd)lT=Number(sd.count);}
      (this.cx.customRules.lunchRoleRules||[]).forEach((r:any)=>{if(r.day==="毎日"||r.day===dC){const rS=sp(this.cx.monthlyAssign[r.role]||"").map(ex), tM=sp(this.dc[r.role]||"").map(ex); let sl:string|null=null; for(const src of sp(r.sourceRooms)){const{r:sR,min}=prC(src); const rM=sp(this.dc[sR]||""), rq=min>0?min:(this.cap[sR]||1); if(rM.reduce((su,m)=>su+getAmt(m),0)>=rq){sl=rM.map(ex).find(n=>rS.includes(n)&&!tM.includes(n)&&!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false))||null;} if(sl)break;} if(!sl)sl=tM.find(n=>!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false))||null; if(sl&&!cL.includes(sl)&&cL.length<lT)cL.push(sl);}});
      sp(this.dc["RI"]).map(ex).forEach(n=>{if(!cL.includes(n)&&cL.length<lT&&!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false))cL.push(n);});
      sp(this.cx.customRules.lunchPrioritySections??"RI,1号室,2号室,3号室,5号室,CT").forEach(sc=>sp(this.dc[sc]).forEach(n=>{const c=ex(n);if(!cL.includes(c)&&cL.length<lT&&!this.iFb(c,"昼当番")&&!this.hNG(c,cL,false))cL.push(c);}));
      if(cL.length<lT){(this.cx.customRules.lunchConditional||[]).forEach((co:any)=>{const sM=sp(this.dc[co.section]); if(sM.length>=Number(co.min)){let p=0; for(const n of sM){if(p>=Number(co.out)||cL.length>=lT)break; const c=ex(n); if(!cL.includes(c)&&!this.iFb(c,"昼当番")&&!this.hNG(c,cL,false)){cL.push(c);p++;}}}});}
      if(cL.length<lT){const lrM:string[]=[]; sp(this.cx.customRules.lunchLastResortSections??"治療").forEach(sc=>sp(this.dc[sc]).forEach(n=>lrM.push(ex(n)))); this.iaGen.filter((n: string)=>!lrM.includes(n)&&!cL.includes(n)&&!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false)).forEach((n: string)=>{if(cL.length<lT)cL.push(n);}); this.iaGen.filter((n: string)=>lrM.includes(n)&&!cL.includes(n)&&!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false)).forEach((n: string)=>{if(cL.length<lT)cL.push(n);});}
      this.dc["昼当番"]=jn(cL.slice(0,lT));
    }
    const uT=this.cap.受付!==undefined?this.cap.受付:2;
    if(sp(this.dc["受付"]).reduce((s,m)=>s+getAmt(m),0)<uT&&!this.sk.includes("受付ヘルプ")){let hm=sp(this.dc["受付ヘルプ"]); if(hm.length===0){const lC=sp(this.dc["昼当番"]).map(ex); const gH=(exS:string[])=>{let c=this.iaGen.filter((n: string)=>!exS.includes(n)&&!hm.map(ex).includes(n)&&!this.iFb(n,"受付ヘルプ")&&!this.hNG(n,hm.map(ex),false)); if(c.length>0){c.sort((a,b)=>(this.ac[a]||0)-(this.ac[b]||0));return c[0];}return null;}; const lH=gH(lC); if(lH)hm.push(`${lH}(12:15〜13:00)`); const vK=sp(this.dc["検像"]).map(ex).filter((n: string)=>this.bm.get(n)!=='AM'&&!hm.map(ex).includes(n)&&!this.iFb(n,"受付ヘルプ")&&!this.hNG(n,hm.map(ex),false)); let pk=vK.length>0?vK[0]:null; if(!pk)pk=gH(lH?[lH]:[]); if(pk)hm.push(`${pk}(16:00〜)`);} this.dc["受付ヘルプ"]=jn(hm);}
  }
}

// ===================== 🌟 Main App Component =====================
export default function App(): any {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats' | 'rules'>('calendar');
  const [allDays, setAllDays] = useState<Record<string, Record<string, string>>>(() => { try { return JSON.parse(localStorage.getItem(KEY_ALL_DAYS) || "{}"); } catch { return {}; } });
  const [customRules, setCustomRules] = useState<Record<string,any>>(() => { try { return { ...DEF_RULES, ...JSON.parse(localStorage.getItem(KEY_RULES) || "{}") }; } catch { return DEF_RULES; } });
  const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string>>(() => { try { return { ...DEFAULT_MONTHLY_ASSIGN, ...JSON.parse(localStorage.getItem(KEY_MONTHLY) || "{}") }; } catch { return DEFAULT_MONTHLY_ASSIGN; } });
  const [targetMonday, setTargetMonday] = useState(() => { const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff)); return `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`; });
  const [sel, setSel] = useState(""); 
  const [assignLogs, setAssignLogs] = useState<Record<string, string[]>>({}); 
  const [selectedErrorDay, setSelectedErrorDay] = useState<string | null>(null); 
  const [showLogDay, setShowLogDay] = useState<string | null>(null); 
  const [showUnassignedList, setShowUnassignedList] = useState<string | null>(null); 
  const [selectedStaffForStats, setSelectedStaffForStats] = useState<string | null>(null); 
  const [showRuleModal, setShowRuleModal] = useState(false); 
  const [history, setHistory] = useState<Record<string, Record<string, string>>[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const [importText, setImportText] = useState(""); 
  const [nationalHolidays, setNationalHolidays] = useState<Record<string, string>>(FALLBACK_HOLIDAYS);
  const [highlightedStaff, setHighlightedStaff] = useState<string | null>(null); 
  const [hoveredStaff, setHoveredStaff] = useState<string | null>(null);

  useEffect(() => { fetch("https://holidays-jp.github.io/api/v1/date.json").then(res => res.json()).then(data => setNationalHolidays(prev => ({ ...prev, ...data }))).catch(e => console.error(e)); }, []);
  useEffect(() => { localStorage.setItem(KEY_ALL_DAYS, JSON.stringify(allDays)); localStorage.setItem(KEY_RULES, JSON.stringify(customRules)); localStorage.setItem(KEY_MONTHLY, JSON.stringify(monthlyAssign)); }, [allDays, customRules, monthlyAssign]);

  const activeGeneralStaff = useMemo(() => pSt(customRules.staffList), [customRules.staffList]);
  const activeReceptionStaff = useMemo(() => pSt(customRules.receptionStaffList), [customRules.receptionStaffList]);
  const allStaff = useMemo(() => Array.from(new Set([...activeGeneralStaff, ...activeReceptionStaff])), [activeGeneralStaff, activeReceptionStaff]);
  const customHolidays = sp(customRules.customHolidays || "");

  const days = useMemo(() => {
    const [y, m, d] = targetMonday.split('-').map(Number); const mon = new Date(y, m - 1, d);
    return [0, 1, 2, 3, 4].map(i => { 
      const curr = new Date(mon); curr.setDate(curr.getDate() + i); 
      const id = `${curr.getFullYear()}-${pad(curr.getMonth()+1)}-${pad(curr.getDate())}`; 
      const isHoliday = !!nationalHolidays[id] || customHolidays.includes(id); 
      return { id, label: formatDayForDisplay(curr), isPublicHoliday: isHoliday, holidayName: nationalHolidays[id] || "休診日", cells: allDays[id] || Object.fromEntries(SEC.map(s => [s, ""])) }; 
    });
  }, [targetMonday, allDays, customHolidays, nationalHolidays]);

  useEffect(() => { if (!sel || !days.find(d => d.id === sel)) setSel(days[0].id); }, [days, sel]); 
  const cur = days.find(d => d.id === sel) || days[0];
  
  const getDailyStats = (dayId: string) => { 
    const cells = allDays[dayId] || {}; 
    const absentMems = sp(cells["不在"] || "");
    const allDayOff = new Set([...sp(cells["明け"]||""),...sp(cells["入り"]||""),...sp(cells["土日休日代休"]||"")].map(ex));
    const workingStaff = allStaff.filter(s => !allDayOff.has(s) && !absentMems.some(m => ex(m) === s && !m.includes("(AM)") && !m.includes("(PM)"))); 
    const staffTime: Record<string, {am: boolean, pm: boolean}> = {};
    workingStaff.forEach(s => staffTime[s] = {am: false, pm: false});
    absentMems.forEach(m => { const c = ex(m); if (staffTime[c]) { if (m.includes("(AM)")) staffTime[c].am = true; if (m.includes("(PM)")) staffTime[c].pm = true; } });
    WK_SEC.forEach(sec => {
      if (sec === "待機" || sec === "昼当番") return;
      sp(cells[sec]).forEach(m => { const c = ex(m); if (staffTime[c]) { if (m.includes("(AM)")) staffTime[c].am = true; else if (m.includes("(PM)")) staffTime[c].pm = true; else { staffTime[c].am = true; staffTime[c].pm = true; } } });
    });
    const unassigned: string[] = [];
    workingStaff.forEach(s => { if (!staffTime[s].am && !staffTime[s].pm) unassigned.push(s); else if (!staffTime[s].am) unassigned.push(`${s}(AM未配置)`); else if (!staffTime[s].pm) unassigned.push(`${s}(PM未配置)`); });
    return { workingCount: workingStaff.length, absentCount: allStaff.length - workingStaff.length, unassigned }; 
  };
  
  const getDayWarnings = (dayId: string): WarningInfo[] => { 
    const w: WarningInfo[] = []; const cells = allDays[dayId] || {}; const staffMap: Record<string, string[]> = {}; 
    RM_SEC.forEach(room => { sp(cells[room]).forEach(m => { const core = ex(m); if(!staffMap[core]) staffMap[core]=[]; if(!staffMap[core].includes(room)) staffMap[core].push(room); }) }); 
    const softNgPairs = (customRules.ngPairs || []).filter((p: any) => p.level === "soft"); 
    softNgPairs.forEach((ng: any) => { const s1 = ex(ng.s1); const s2 = ex(ng.s2); RM_SEC.forEach(room => { const mems = sp(cells[room]).map(ex); if (mems.includes(s1) && mems.includes(s2)) w.push({ level: 'yellow', title: '回避特例', room, msg: `なるべくNGペア（${s1} と ${s2}）が「${room}」で同室です` }); }); }); 
    Object.entries(staffMap).forEach(([staff, rms]) => { const limit = customRules.alertMaxKenmu || 3; const dayCount = rms.filter(r => { const m = sp(cells[r]).find(x => ex(x) === staff); return m && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:"); }).length; if(dayCount > limit) w.push({ level: 'orange', title: '兼務超過', staff, msg: `${staff}さんが日中 ${dayCount}部屋を担当中` }); }); 
    const targetEmptyRooms = sp(customRules.alertEmptyRooms || "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像"); 
    targetEmptyRooms.forEach(room => { if (sp(cells[room]).length === 0) w.push({ level: 'yellow', title: '空室', room, msg: `「${room}」の担当者がいません` }); }); 
    const uTarget = customRules.capacity?.受付 ?? 2; 
    if (sp(cells["受付"]).reduce((sum: number, m: string) => sum + getAmt(m), 0) < uTarget && sp(cells["受付ヘルプ"]).length === 0) { w.push({ level: 'yellow', title: '受付不足', room: '受付', msg: `受付が${uTarget}名未満ですが、受付ヘルプがいません` }); } 
    const curIdx = days.findIndex(d => d.id === dayId); 
    if (curIdx > 0 && !days[curIdx-1].isPublicHoliday) { sp(customRules.noConsecutiveRooms).forEach(room => { const prev = sp(allDays[days[curIdx-1].id]?.[room]).map(ex); sp(cells[room]).map(ex).filter(n => prev.includes(n)).forEach(n => w.push({ level: 'red', title: '連日注意', staff: n, room, msg: `${n}さんが「${room}」に連日入っています` })); }); } 
    const stats = getDailyStats(dayId); 
    stats.unassigned.forEach(item => { if (item.includes("(AM未配置)")) w.push({ level: 'red', title: '半日未配置', staff: ex(item), msg: `${ex(item)}さんの午前が未配置です` }); else if (item.includes("(PM未配置)")) w.push({ level: 'red', title: '半日未配置', staff: ex(item), msg: `${ex(item)}さんの午後が未配置です` }); else w.push({ level: 'red', title: '未配置', staff: item, msg: `${item}さんが配置されていません` }); }); 
    return w; 
  };
  
  const monthlyMatrixStats = useMemo(() => { const targetMonth = targetMonday.substring(0, 7); const stats: Record<string, Record<string, { total: number, late: number }>> = {}; activeGeneralStaff.forEach(s => { stats[s] = {}; RM_SEC.forEach(r => stats[s][r] = { total: 0, late: 0 }); }); Object.entries(allDays).forEach(([dateStr, cells]) => { if (dateStr.startsWith(targetMonth)) { RM_SEC.forEach(room => { sp(cells[room] || "").forEach(m => { const core = ex(m); if (stats[core]?.[room] !== undefined) { stats[core][room].total += 1; if (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")) stats[core][room].late += 1; } }); }); } }); return stats; }, [targetMonday, allDays, activeGeneralStaff]);
  
  const setAllDaysWithHistory = (updater: any) => { setAllDays(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; if (JSON.stringify(prev) !== JSON.stringify(next)) setHistory(h => [...h, prev].slice(-20)); return next; }); };
  const updateDay = (k: string, v: string) => { setAllDaysWithHistory((prev: any) => { const nextState = { ...prev, [sel]: { ...(prev[sel] || {}), [k]: v } }; if (k === "入り") { const idx = days.findIndex(d => d.id === sel); if (idx >= 0 && idx < days.length - 1) { const nextDayId = days[idx + 1].id; const currentAke = sp((prev[nextDayId] || {})["明け"]).filter(m => !sp(v).includes(m)); nextState[nextDayId] = { ...(prev[nextDayId] || {}), "明け": jn([...currentAke, ...sp(v)]) }; } } return nextState; }); };

  const handleAutoAssign = (isSmart: boolean, isWeekly: boolean) => {
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev }; const newLogs = { ...assignLogs }; const ctx = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules }; const targetDays = isWeekly ? days : [cur];
      targetDays.forEach(day => {
        const idx = days.findIndex(d => d.id === day.id); let prevDayObj: any = null; const dObj = new Date(day.id);
        if (dObj.getDay() !== 1) { const prevDate = new Date(dObj); prevDate.setDate(prevDate.getDate() - 1); const prevDateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(prevDate.getDate())}`; if (nextAll[prevDateStr]) prevDayObj = { id: prevDateStr, cells: nextAll[prevDateStr] }; else if (idx > 0) prevDayObj = { id: days[idx-1].id, cells: nextAll[days[idx-1].id] || days[idx-1].cells }; }
        const targetMonth = day.id.substring(0, 7); const pastDaysInMonthArray = Object.entries(nextAll).filter(([dateStr]) => dateStr.startsWith(targetMonth) && dateStr < day.id).map(([dateStr, cells]) => ({ id: dateStr, cells } as any));
        const pastDaysInWeekArray = days.slice(0, idx).map(d => ({ ...d, cells: nextAll[d.id] || d.cells }));
        const worker = new AutoAssigner({ ...day, cells: nextAll[day.id] || day.cells }, prevDayObj, pastDaysInMonthArray, pastDaysInWeekArray, ctx, isSmart);
        const res = worker.exe(); nextAll[day.id] = res.cells; newLogs[day.id] = res.logInfo || [];
       });
      setAssignLogs(newLogs); return nextAll;
    });
  };

  const handleUndo = () => { if (history.length > 0) { const last = history[history.length - 1]; setAllDays(last); setHistory(h => h.slice(0, -1)); } };
  const updateMonthly = (k: string, v: string) => { setMonthlyAssign(prev => ({ ...prev, [k]: v })); };
  const updateRule = (type: keyof Record<string,any>, idx: number, key: string, val: any) => { setCustomRules(r => { const arr = [...((r[type] as any[]) || [])]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: keyof Record<string,any>, idx: number) => { setCustomRules(r => { const arr = [...((r[type] as any[]) || [])]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };
  const addRule = (type: keyof Record<string,any>, def: any) => { setCustomRules(r => ({ ...r, [type]: [...((r[type] as any[]) || []), def] })); };

  const handleClearGroupDay = (title: string, sections: string[]) => { if (window.confirm(`${cur.label} の「${title}」をクリアしますか？`)) { setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; sections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; }); } };
  const handleClearGroupWeek = (title: string, sections: string[]) => { if (window.confirm(`表示中の「${title}」を1週間分すべてクリアしますか？`)) { setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; sections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; }); } };
  const handleClearWorkDay = () => { if (window.confirm(`${cur.label} の「モダリティ」と「一般撮影・透視・その他」をクリアしますか？`)) { const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections]; setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; }); } };
  const handleClearWorkWeek = () => { if (window.confirm(`表示中の「モダリティ」と「一般撮影・透視・その他」を1週間分すべてクリアしますか？`)) { const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections]; setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; }); } };
  const handleCopyYesterday = () => { const idx = days.findIndex(d => d.id === cur.id); if (idx <= 0) return; const prevDay = days[idx - 1]; setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...prevDay.cells } })); };

  const handleExport = () => { const dataObj = { allDays, monthlyAssign, customRules }; const blob = new Blob([JSON.stringify(dataObj)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `shifto_backup_${targetMonday}.json`; a.click(); URL.revokeObjectURL(url); };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event: any) => { try { const dataObj = JSON.parse(event.target.result); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("データを復元しました！"); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("読み込みに失敗しました。"); } }; reader.readAsText(file); e.target.value = ""; };
  const handleCopyToClipboard = () => { const dataObj = { allDays, monthlyAssign, customRules }; navigator.clipboard.writeText(JSON.stringify(dataObj)).then(() => { alert("データをコピーしました！"); }).catch(() => { alert("コピーに失敗しました。"); }); };
  const handleTextImport = () => { if(!importText) return; try { const dataObj = JSON.parse(importText); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("テキストからデータを復元しました！"); setImportText(""); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("テキストの読み込みに失敗しました。"); } };

  const dailyStaffRoomCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    days.forEach(day => {
      counts[day.id] = {};
      if (day.isPublicHoliday) return;
      RM_SEC.forEach(rs => {
        if (["待機", "昼当番", "受付", "受付ヘルプ"].includes(rs)) return;
        sp(allDays[day.id]?.[rs]).forEach(m => {
          const core = ex(m);
          if (!m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:")) {
            counts[day.id][core] = (counts[day.id][core] || 0) + 1;
          }
        });
      });
    });
    return counts;
  }, [days, allDays]);

  return (
    <div style={{ maxWidth: "98%", margin: "0 auto", padding: "24px", boxSizing: "border-box" }}>
      <style>{GS}</style>
      
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "20px 32px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 26, fontWeight: 900 }}>勤務割付システム Ver 2.92</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(highlightedStaff || hoveredStaff) && (
            <div style={{ background: "#2563eb", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px rgba(37,99,235,0.3)", animation: "fadeIn 0.3s ease" }}>
              <span>✨ {highlightedStaff || hoveredStaff} さんをハイライト中</span>
              {highlightedStaff && <button onClick={() => setHighlightedStaff(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "18px", padding: 0 }}>✖</button>}
            </div>
          )}
          <Btn oC={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()-7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} bg="#f1f5f9" c="#475569" ch="◀ 先週" />
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <Btn oC={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} bg="#f1f5f9" c="#475569" ch="来週 ▶" />
        </div>
      </div>

      <div className="tabs-header no-print">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 週間予定表</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 月間集計</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>⚙️ 設定・データ入出力</button>
      </div>

      <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
        <div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "16px" }}>
          <div className="scroll-container">
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
              <thead className="sticky-table-header">
                <tr>
                  <th style={{...cellStyle(true, false, false, true), borderRight: "2px solid #e2e8f0", borderBottom: "2px solid #e2e8f0"}}>区分</th>
                  {days.map(day => {
                    const stats = getDailyStats(day.id); const warnings = getDayWarnings(day.id);
                    return (
                      <th key={day.id} onClick={() => setSel(day.id)} style={{...cellStyle(true, day.isPublicHoliday, day.id === sel), borderBottom: "2px solid #e2e8f0", cursor: "pointer"}}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 17 }}>{day.label}</span>
                            {warnings.length > 0 && <span onClick={(e) => { e.stopPropagation(); setSelectedErrorDay(day.id); }} className="btn-hover" style={{ background: "#fff7ed", color: "#c2410c", padding: "4px 8px", borderRadius: 6, fontSize: 14, border: "1px solid #fdba74" }}>⚠️ 注意 {warnings.length}</span>}
                            {!day.isPublicHoliday && assignLogs[day.id]?.length > 0 && <span onClick={(e) => { e.stopPropagation(); setShowLogDay(day.id); }} className="btn-hover" style={{ background: "#f0f9ff", color: "#0369a1", padding: "4px 8px", borderRadius: 6, fontSize: 14, border: "1px solid #bae6fd" }}>🤔 根拠</span>}
                          </div>
                          {!day.isPublicHoliday && (
                            <div onClick={(e) => { e.stopPropagation(); setShowUnassignedList(day.id); }} className="btn-hover" style={{ fontSize: 14, background: stats.unassigned.length > 0 ? "#fee2e2" : "#d1fae5", color: stats.unassigned.length > 0 ? "#ef4444" : "#065f46", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>
                              出勤:{stats.workingCount}名 (不在:{stats.absentCount}名)<br/>未配置:<span style={{fontSize:18, textDecoration:"underline"}}>{stats.unassigned.length}</span>名 
                            </div>
                          )}
                          {day.isPublicHoliday && <div style={{ fontSize: 16, color: "#ef4444" }}>🎌 {day.holidayName}</div>}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {SEC.map((section, sIdx) => (
                  <tr key={section}>
                    <td style={{...cellStyle(true, false, false, true, sIdx % 2 === 1), borderRight: "2px solid #e2e8f0"}}>{section}</td>
                    {days.map((day, dIdx) => {
                      const currentMems = sp(allDays[day.id]?.[section]); const prevMems = dIdx > 0 ? sp(allDays[days[dIdx-1].id]?.[section]).map(ex) : []; const isAlertRoom = sp(customRules.noConsecutiveRooms).includes(section); const warnings = getDayWarnings(day.id); const isRoomEmpty = currentMems.length === 0 && warnings.some(w => w.level === 'yellow' && w.room === section); let baseBgStyle = cellStyle(false, day.isPublicHoliday, day.id === sel, false, sIdx % 2 === 1); if (isRoomEmpty && !day.isPublicHoliday) baseBgStyle.background = "#fef08a";
                      
                      return (
                        <td key={day.id + section} style={baseBgStyle}>
                          {!day.isPublicHoliday && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", lineHeight: "1.4" }}>
                              {currentMems.map((m, mIdx) => {
                                const coreName = ex(m); const mod = m.substring(coreName.length); const isConsecutive = isAlertRoom && prevMems.includes(coreName); const hasRedWarning = isConsecutive || warnings.some(w => w.level === 'red' && w.staff === coreName && w.room === section); const hasOrangeWarning = warnings.some(w => w.level === 'orange' && w.staff === coreName); const hasYellowWarning = warnings.some(w => w.level === 'yellow' && w.room === section && w.title === '回避特例');
                                
                                const targetStaff = highlightedStaff || hoveredStaff;
                                const isHighlighted = targetStaff === coreName;
                                const isDimmed = targetStaff !== null && targetStaff !== coreName;
                                
                                const roomCount = dailyStaffRoomCounts[day.id]?.[coreName] || 0;
                                const limit = customRules.alertMaxKenmu || 3;
                                const isOverLimit = roomCount > limit;

                                let tagBg = "#f8fafc"; let tagColor = "#334155"; let tagBorder = "#cbd5e1";
                                
                                if (isOverLimit) { tagBg = "#ffedd5"; tagColor = "#9a3412"; tagBorder = "#fdba74"; }

                                if (hasRedWarning) { tagBg = "#fee2e2"; tagColor = "#b91c1c"; tagBorder = "#ef4444"; } 
                                else if (hasOrangeWarning) { tagBorder = "#ea580c"; } 
                                else if (hasYellowWarning) { tagBorder = "#ca8a04"; }

                                let inlineStyle: React.CSSProperties = { background: tagBg, color: tagColor, border: `2px solid ${tagBorder}`, padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", fontSize: "16px", fontWeight: (hasRedWarning || isOverLimit) ? 800 : 700, transition: "all 0.2s ease" };
                                
                                if (isHighlighted) {
                                  inlineStyle.background = "#2563eb"; inlineStyle.color = "#fff"; inlineStyle.borderColor = "#1d4ed8"; inlineStyle.boxShadow = "0 4px 12px rgba(37,99,235,0.4)"; inlineStyle.transform = "scale(1.05)"; inlineStyle.zIndex = 10; inlineStyle.position = "relative";
                                } else if (isDimmed) {
                                  inlineStyle.opacity = 0.25; inlineStyle.filter = "grayscale(1)";
                                }

                                return (
                                  <div key={mIdx} className="btn-hover" 
                                    onClick={(e) => { e.stopPropagation(); setHighlightedStaff(prev => prev === coreName ? null : coreName); }}
                                    onMouseEnter={() => setHoveredStaff(coreName)}
                                    onMouseLeave={() => setHoveredStaff(null)}
                                    style={inlineStyle}
                                  >
                                    <span>{coreName}</span>
                                    {mod && (mod.includes("(AM)") ? <span style={{ background: isHighlighted ? "#bfdbfe" : "#e0f2fe", color: isHighlighted ? "#1e40af" : "#0369a1", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #bae6fd", fontWeight: 800 }}>AM</span> : mod.includes("(PM)") ? <span style={{ background: isHighlighted ? "#fbcfe8" : "#fce7f3", color: isHighlighted ? "#9f1239" : "#be185d", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #fbcfe8", fontWeight: 800 }}>PM</span> : <span style={{ background: isHighlighted ? "#e2e8f0" : "#f3f4f6", color: isHighlighted ? "#334155" : "#4b5563", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #d1d5db", fontWeight: 700 }}>{mod.replace(/[()]/g, '')}</span>)}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="no-print" style={{ ...panelStyle() }}>
          <div className="scroll-container hide-scrollbar sticky-header-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 16, marginBottom: 24 }}>
             <div style={{ display: "flex", gap: 8 }}>
                {days.map(d => <button key={d.id} onClick={() => setSel(d.id)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: d.id === sel ? "#2563eb" : "#fff", color: d.id === sel ? "#fff" : "#64748b", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>{d.label}</button>)}
             </div>
             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn oC={() => setShowRuleModal(true)} bg="#f8fafc" c="#475569" ch="📖 システムのルール" />
                <Btn oC={() => handleAutoAssign(false, false)} bg="#10b981" ch="✨ 1日自動割当" />
                <Btn oC={() => handleAutoAssign(false, true)} bg="#0ea5e9" ch="⚡ 週間自動割当" />
                <Btn oC={() => handleAutoAssign(true, false)} bg="#f59e0b" ch="🔄 欠員補充(1日)" />
                <Btn oC={() => handleAutoAssign(true, true)} bg="#d97706" ch="🔄 欠員補充(週間)" />
                <Btn oC={handleCopyYesterday} bg="#f8fafc" c="#475569" ch="📋 昨日をコピー" dis={cur.isPublicHoliday} />
                <Btn oC={handleUndo} bg={history.length === 0 ? "#cbd5e1" : "#8b5cf6"} ch="↩️ 戻る" dis={history.length===0} />
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
             {RENDER_GROUPS.map((group: RenderGroup) => (
               <div key={group.title} style={{ gridColumn: "1 / -1" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #e2e8f0" }}>
                   <h4 style={{ fontSize: 21, fontWeight: 900, borderLeft: `6px solid ${group.color}`, paddingLeft: 12, margin: 0 }}>{group.title}</h4>
                   {group.title === "休務・夜勤" || group.title === "待機・その他" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <Btn oC={() => handleClearGroupDay(group.title, group.sections)} bg="#fff" c="#64748b" ch="🧹 1日クリア" />
                        <Btn oC={() => handleClearGroupWeek(group.title, group.sections)} bg="#fff" c="#64748b" ch="🧹 週間クリア" />
                      </div>
                    ) : group.title === "モダリティ" || group.title === "一般撮影・透視・その他" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <Btn oC={handleClearWorkDay} bg="#fff" c="#64748b" ch="🧹 業務1日クリア" />
                        <Btn oC={handleClearWorkWeek} bg="#fff" c="#64748b" ch="🧹 業務週間クリア" />
                      </div>
                    ) : null}
                 </div>
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                   {group.sections.map((s: string) => <SectionEditor key={s} section={s} value={allDays[sel]?.[s] || ""} activeStaff={allStaff} onChange={(v: string) => updateDay(s, v)} noTime={RE_SEC.includes(s) || s === "昼当番"} customOptions={PL_SEC.filter(p => p.startsWith(s))} />)}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="no-print" style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 24 }}>
          <h3 style={{ fontWeight: 900, color: "#3b82f6", fontSize: 21, marginTop: 0 }}>配置マトリックス（月間集計）</h3>
          <div style={{ marginTop: 16, overflowX: "auto", maxHeight: "70vh", border: "2px solid #cbd5e1", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "16px", textAlign: "center", tableLayout: "auto" }}>
              <thead><tr><th style={{ position: "sticky", left: 0, top: 0, background: "#f8fafc", zIndex: 30, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", color: "#1e293b", fontWeight: 900 }}>スタッフ</th>{RM_SEC.map(r => <th key={r} style={{ position: "sticky", top: 0, zIndex: 20, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", background: "#f8fafc", fontWeight: 900 }}>{r}</th>)}</tr></thead>
              <tbody>
                {allStaff.filter(s => activeGeneralStaff.includes(s)).map((staff, sIdx) => {
                  const isZebra = sIdx % 2 === 1; const rowBg = isZebra ? "#f1f5f9" : "#ffffff";
                  return (
                    <tr key={staff} className="calendar-row">
                      <td onClick={() => setSelectedStaffForStats(staff)} style={{ position: "sticky", left: 0, background: rowBg, zIndex: 10, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", fontWeight: 900, textAlign: "left", cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}>{staff}</td>
                      {RM_SEC.map(r => {
                        const stat = monthlyMatrixStats[staff]?.[r] || { total: 0, late: 0 }; let bg = rowBg; let color = "#334155";
                        if (["CT", "MRI"].includes(r)) { if (stat.total > 0) { bg = `rgba(59, 130, 246, ${Math.min(0.1 + stat.total * 0.15, 0.9)})`; if(stat.total >= 3) color = "#fff"; } else if (getMSt(r, monthlyAssign).includes(staff)) bg = "#fef08a"; }
                        return ( <td key={r} style={{ padding: 10, background: bg, color: color, fontWeight: stat.total > 0 ? 900 : 500, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{stat.total > 0 ? <span style={{fontSize:17}}>{stat.total}</span> : <span style={{ width: "16px" }}></span>}{stat.late > 0 && <span style={{ fontSize: "13px", background: "#fef08a", color: "#b45309", padding: "2px 6px", borderRadius: "6px", border: "1px solid #fde047" }}>遅{stat.late}</span>}</div></td> );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="no-print" style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 25, fontWeight: 900, marginBottom: 20, color: "#0f766e" }}>👥 スタッフ名簿</h3>
          <div style={{ background: "#f0fdf4", padding: "16px 20px", borderRadius: 12, border: "2px solid #bbf7d0", marginBottom: 24 }}><p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#166534", lineHeight: 1.6 }}>💡 順番を自動で「50音順」にするため、名前の後にカッコでふりがなをつけてください。</p></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
             <div><label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>一般スタッフ</label><textarea className="name-textarea" placeholder="例: 山田(やまだ)" value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} /></div>
             <div><label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>受付スタッフ</label><textarea className="name-textarea" placeholder="例: 高橋(たかはし)" value={customRules.receptionStaffList} onChange={e => setCustomRules({...customRules, receptionStaffList: e.target.value})} /></div>
          </div>
        </div>

        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 25, fontWeight: 900, marginBottom: 20, color: "#be185d" }}>📱 データ保存・復元</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
             <Btn oC={handleExport} bg="#6366f1" ch="💾 ファイル保存" />
             <Btn oC={() => fileInputRef.current?.click()} bg="#8b5cf6" ch="📂 ファイル読込" />
             <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleImport} />
             <div style={{ width: "2px", height: "32px", background: "#cbd5e1", margin: "0 8px" }}></div>
             <Btn oC={handleCopyToClipboard} bg="#db2777" ch="📋 テキストコピー" />
             <input type="text" value={importText} onChange={e => setImportText(e.target.value)} placeholder="貼り付けて復元" style={{ flex: 1, padding: "10px 16px", fontSize: 17, borderRadius: 8, border: "2px solid #f9a8d4" }} />
             <Btn oC={handleTextImport} bg="#be185d" ch="✨ 復元" />
          </div>
        </div>

        <div style={{ ...panelStyle() }}>
          <h3 style={{ fontSize: 27, fontWeight: 900, marginBottom: 32, color: "#0f766e" }}>📋 ルールの優先順位（システムはこの上から順に処理します）</h3>

          <div style={{ borderLeft: "8px solid #94a3b8", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 23, fontWeight: 900, color: "#475569", marginBottom: 20, borderBottom: "2px solid #cbd5e1", paddingBottom: 10 }}>フェーズ1：前提・固定ルール（最優先）</h4>
            
            <RC bg="#f8fafc" b="#cbd5e1" c="#334155" ic="🙅" t="担当不可ルール" ch={
              <>{(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                    <Row><StaffSel v={rule.staff} oC={(v:any)=>updateRule("forbidden", idx, "staff", v)} list={activeGeneralStaff} /><Del oC={()=>removeRule("forbidden", idx)} /></Row>
                    <MP v={rule.sections} oC={(v: string) => updateRule("forbidden", idx, "sections", v)} opt={AS_SEC} />
                  </div>
              ))}<button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button></>
            } />

            <RC bg="#f0fdf4" b="#bbf7d0" c="#15803d" ic="🔒" t="専従ルール" ch={
              <>{(customRules.fixed || []).map((rule: any, idx: number) => (
                  <Row key={idx}><StaffSel v={rule.staff} oC={(v:any)=>updateRule("fixed", idx, "staff", v)} list={activeGeneralStaff} /><RoomSel v={rule.section} oC={(v:any)=>updateRule("fixed", idx, "section", v)} list={RM_SEC} /><Del oC={()=>removeRule("fixed", idx)} /></Row>
              ))}<button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button></>
            } />

            <RC bg="#fef2f2" b="#fecaca" c="#b91c1c" ic="🚫" t="NGペア" ch={
              <>{(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <Row key={idx}><StaffSel v={rule.s1} oC={(v:any)=>updateRule("ngPairs", idx, "s1", v)} list={activeGeneralStaff} /><span className="rule-label">と</span><StaffSel v={rule.s2} oC={(v:any)=>updateRule("ngPairs", idx, "s2", v)} list={activeGeneralStaff} /><select value={rule.level || "hard"} onChange={(e: any) => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"120px"}}><option value="hard">絶対NG</option><option value="soft">なるべくNG</option></select><Del oC={()=>removeRule("ngPairs", idx)} /></Row>
              ))}<button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ NGペアを追加</button></>
            } />

            <RC bg="#f8fafc" b="#cbd5e1" c="#334155" ic="🕒" t="終日専任・連日禁止" ch={
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【終日専任】半休・AM/PM不可の部屋</label><MP v={customRules.fullDayOnlyRooms ?? ""} oC={(v: string) => setCustomRules({...customRules, fullDayOnlyRooms: v})} opt={RM_SEC} /></div>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【連日禁止】2日連続で担当させない部屋</label><MP v={customRules.noConsecutiveRooms ?? ""} oC={(v: string) => setCustomRules({...customRules, noConsecutiveRooms: v})} opt={RM_SEC} /></div>
              </div>
            } />

            <RC bg="#fdf4ff" b="#f5d0fe" c="#86198f" ic="🏠" t="遅番不可スタッフ・部屋" ch={
              <><label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>遅番不可スタッフ</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center", marginBottom: 16 }}><MP v={customRules.noLateShiftStaff || ""} oC={(v: string) => setCustomRules({...customRules, noLateShiftStaff: v})} opt={allStaff} ph="＋スタッフを選択" /></div>
              <label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>その日その部屋に入っている人も遅番除外</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center" }}><MP v={customRules.noLateShiftRooms || ""} oC={(v: string) => setCustomRules({...customRules, noLateShiftRooms: v})} opt={RM_SEC} ph="＋部屋を選択" /></div></>
            } />
          </div>

          <div style={{ borderLeft: "8px solid #f59e0b", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#b45309", marginBottom: 20, borderBottom: "2px solid #fcd34d", paddingBottom: 10 }}>フェーズ2：例外・代打処理</h4>
            
            <RC bg="#fef08a" b="#fde047" c="#a16207" ic="🚨" t="緊急ルール（人数不足時）" ch={
              <><div style={{ marginBottom: 16, padding: "12px", background: "#fef8f8", borderRadius: "8px", border: "1px dashed #fca5a5", color: "#991b1b", fontSize: "16px", fontWeight: "600" }}>💡 <b>「左側（発動条件）」から「右側（アクション）」へ</b> 流れるようにルールを設定します。</div>
              {(customRules.emergencies || []).map((em: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ flex: '1 1 350px', display: 'flex', gap: '8px', alignItems: 'center', borderRight: '2px dashed #cbd5e1', paddingRight: '16px' }}>
                      <span style={{fontWeight: 800, color: '#ef4444', flexShrink: 0}}>【条件】</span>
                      <select className="rule-sel" value={em.type} onChange={(e:any) => updateRule("emergencies", idx, "type", e.target.value)}>
                        <option value="change_capacity">出勤人数が指定以下の場合</option><option value="staff_assign">出勤人数が指定以下の場合（強制配置）</option><option value="role_assign">出勤人数が指定以下の場合（月間担当）</option><option value="clear">出勤人数が指定以下の場合（部屋閉鎖）</option><option value="empty_room_swap">指定の部屋が空室の場合</option>
                      </select>
                      {em.type !== 'empty_room_swap' && <><Num v={em.threshold || 0} oC={(v:any)=>updateRule("emergencies", idx, "threshold", v)} w={60} />人以下</>}
                      {em.type === 'empty_room_swap' && <><RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={RM_SEC} ph="監視する部屋" /> が空室</>}
                    </div>
                    <div style={{ flex: '1 1 400px', display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '8px' }}>
                       <span style={{fontWeight: 800, color: '#3b82f6', flexShrink: 0}}>➔【アクション】</span>
                       {em.type === 'change_capacity' && <><RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={RM_SEC} /> の定員を <Num v={em.newCapacity||1} oC={(v:any)=>updateRule("emergencies", idx, "newCapacity", v)} w={60} /> 名にする</>}
                       {em.type === 'staff_assign' && <><StaffSel v={em.staff} oC={(v:any)=>updateRule("emergencies", idx, "staff", v)} list={activeGeneralStaff} /> を <RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={RM_SEC} /> に配置</>}
                       {em.type === 'role_assign' && <><select className="rule-sel" value={em.role} onChange={(e:any)=>updateRule("emergencies", idx, "role", e.target.value)}><option value="">月間設定</option>{MONTHLY_CATEGORIES.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select> を <RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={RM_SEC} /> に配置</>}
                       {em.type === 'clear' && <><RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={RM_SEC} /> を無人にする</>}
                       {em.type === 'empty_room_swap' && <><select className="rule-sel" value={em.sourceRooms} onChange={(e:any)=>updateRule("emergencies", idx, "sourceRooms", e.target.value)}><option value="">補充元の部屋(優先順)</option>{RM_SEC.map(s=><option key={s} value={s}>{s}</option>)}</select> から強制補充</>}
                    </div>
                    <Del oC={()=>removeRule("emergencies", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#a16207", borderColor:"#ca8a04"}} onClick={() => addRule("emergencies", { type: "change_capacity", threshold: 16, section: "CT", newCapacity: 3 })}>＋ 緊急ルールを追加</button></>
            } />

            <RC bg="#f0fdf4" b="#bbf7d0" c="#15803d" ic="🔄" t="メイン配置の交換ルール" ch={
              <>{(customRules.swapRules || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "2px solid #bbf7d0", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>[</span>
                      <RoomSel v={rule.targetRoom} oC={(v:any)=>updateRule("swapRules", idx, "targetRoom", v)} list={RM_SEC} ph="兼務先" />
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>] に [</span>
                      <RoomSel v={rule.triggerRoom} oC={(v:any)=>updateRule("swapRules", idx, "triggerRoom", v)} list={RM_SEC} ph="メイン部屋" />
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>] の担当者が誰も入れない時➔</span>
                      <Del oC={()=>removeRule("swapRules", idx)} />
                    </div>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>以下の部屋の担当者とメイン配置を交換する（※左の部屋から優先）:</span>
                      <MP v={rule.sourceRooms} oC={(v: string) => updateRule("swapRules", idx, "sourceRooms", v)} opt={EX_SEC} />
                    </div>
                  </div>
              ))}<button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("swapRules", { targetRoom: "DSA", triggerRoom: "5号室", sourceRooms: "透視（6号）、1号室、2号室" })}>＋ 交換ルールを追加</button></>
            } />

            <RC bg="#fff7ed" b="#fed7aa" c="#c2410c" ic="🔄" t="代打ルール" ch={
              <>{(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center", background: "#fff", padding: "16px", borderRadius: 8, border: "1px solid #fdba74", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}><MP v={rule.target} oC={(v: string) => updateRule("substitutes", idx, "target", v)} opt={activeGeneralStaff} ph="対象スタッフ(休)" /></div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>が全員休みの時➔</span>
                    <div style={{ flex: 1, minWidth: "200px" }}><MP v={rule.subs} oC={(v: string) => updateRule("substitutes", idx, "subs", v)} opt={activeGeneralStaff} ph="代打スタッフを追加" /></div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>を</span>
                    <RoomSel v={rule.section} oC={(v:any)=>updateRule("substitutes", idx, "section", v)} list={RM_SEC} />
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>に優先</span>
                    <Del oC={()=>removeRule("substitutes", idx)} />
                  </div>
              ))}<button className="rule-add" style={{color:"#c2410c", borderColor:"#fdba74"}} onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打ルールを追加</button></>
            } />

            <RC bg="#e0f2fe" b="#bae6fd" c="#0369a1" ic="🎱" t="玉突きルール" ch={
              <>{(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "1px solid #bae6fd", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <StaffSel v={rule.s1 || rule.triggerStaff} oC={(v:any)=>updateRule("pushOuts", idx, "s1", v)} list={activeGeneralStaff} ph="誰" />
                      <span className="rule-label" style={{color:"#0284c7"}}>と</span>
                      <StaffSel v={rule.s2 || rule.targetStaff} oC={(v:any)=>updateRule("pushOuts", idx, "s2", v)} list={activeGeneralStaff} ph="誰" />
                      <span className="rule-label" style={{color:"#0284c7"}}>が同じ</span>
                      <RoomSel v={rule.triggerSection} oC={(v:any)=>updateRule("pushOuts", idx, "triggerSection", v)} list={RM_SEC} />
                      <span className="rule-label" style={{color:"#0284c7"}}>になる時➔ 後者を</span>
                      <Del oC={()=>removeRule("pushOuts", idx)} />
                    </div>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#0284c7"}}>以下の部屋に移動（※左から優先）:</span>
                      <MP v={rule.targetSections} oC={(v: string) => updateRule("pushOuts", idx, "targetSections", v)} opt={RM_SEC} />
                    </div>
                  </div>
              ))}<button className="rule-add" style={{color:"#0369a1", borderColor:"#7dd3fc"}} onClick={() => addRule("pushOuts", { s1: "", s2: "", triggerSection: "", targetSections: "" })}>＋ 玉突きルールを追加</button></>
            } />
          </div>

          <div style={{ borderLeft: "8px solid #3b82f6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#1d4ed8", marginBottom: 20, borderBottom: "2px solid #bfdbfe", paddingBottom: 10 }}>フェーズ3：メイン配置</h4>
            
            <RC bg="#fffbeb" b="#fde68a" c="#b45309" ic="👑" t="部屋の割り当て優先順位" ch={
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {(customRules.priorityRooms || (DEF_RULES.priorityRooms||[])).map((room: string, idx: number, arr: string[]) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "10px 14px", borderRadius: 8, border: "1px solid #fcd34d" }}>
                    <div style={{ display: "flex", alignItems: "center" }}><span style={{ fontSize: 17, fontWeight: 800, color: "#92400e", marginRight: 8 }}>{idx + 1}.</span><span style={{ fontSize: 19, fontWeight: 700, color: "#b45309" }}>{room}</span></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "6px 10px", fontSize: 17 }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "6px 10px", fontSize: 17 }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
            } />

            <RC bg="#f8fafc" b="#cbd5e1" c="#334155" ic="👥" t="絶対優先の定員設定" ch={
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", padding: "10px 16px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                    <span style={{ fontWeight: 800, fontSize: 19 }}>{room}:</span>
                    <Num v={count} oC={(v:any)=>setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: v}})} w={60} />
                    <span style={{fontSize: 17}}>人</span>
                    <span onClick={() => { const n={...customRules.capacity}; delete n[room]; setCustomRules({...customRules, capacity:n}); }} style={{ cursor: "pointer", color: "#ef4444", marginLeft: 8, fontSize: 21 }}>✖</span>
                  </div>
                ))}
                <RoomSel v={""} oC={(v:any)=>{if(v) setCustomRules({...customRules, capacity: {...customRules.capacity, [v]: 1}})}} list={RM_SEC} ph="＋部屋追加" w={180} />
              </div>
            } />

            <RC bg="#fff" b="#e2e8f0" c="#334155" ic="📅" t="月間担当者の設定" ch={
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => {
                  const opts = key === "受付ヘルプ" ? GEN_RM : [];
                  return ( <SectionEditor key={key} section={label} value={monthlyAssign[key] || ""} activeStaff={key === "受付" ? activeReceptionStaff : allStaff} onChange={(v: string) => updateMonthly(key, v)} noTime={true} customOptions={opts} /> );
                })}
              </div>
            } />
          </div>

          <div style={{ borderLeft: "8px solid #10b981", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#047857", marginBottom: 20, borderBottom: "2px solid #a7f3d0", paddingBottom: 10 }}>フェーズ4：兼務・救済・遅番</h4>
            
            <RC bg="#fdf4ff" b="#f0abfc" c="#86198f" ic="✨" t="スマート兼務（専任担当の負担軽減・引き抜き）" ch={
              <>{(customRules.smartKenmu || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ background: "#fff", padding: "16px 20px", border: "1px solid #f0abfc", borderRadius: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#86198f" }}>[</span>
                        <RoomSel v={rule.targetRoom} oC={(v:any)=>updateRule("smartKenmu", idx, "targetRoom", v)} list={RM_SEC} ph="専任を外す部屋" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#86198f" }}>] を、以下の担当者に兼務させる（※左から優先）:</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 6 }}><MP v={rule.sourceRooms} oC={(v: string) => updateRule("smartKenmu", idx, "sourceRooms", v)} opt={EX_SEC} /></div>
                    </div>
                    <Del oC={()=>removeRule("smartKenmu", idx)} />
                  </div>
              ))}<button className="rule-add" style={{ color: "#86198f", borderColor: "#f0abfc" }} onClick={() => addRule("smartKenmu", { targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" })}>＋ スマート兼務ルールを追加</button></>
            } />

            <RC bg="#ecfdf5" b="#a7f3d0" c="#065f46" ic="🔗" t="兼務・セット配置ルール" ch={
              <><h6 style={{ fontSize: 17, color: "#047857", marginTop: 0, marginBottom: 12 }}>■ 常時兼務ペア</h6>
              {(customRules.kenmuPairs || []).map((rule: any, idx: number) => (
                <div key={idx} className="rule-row" style={{ background: "#fff", padding: "12px 16px", border: "1px solid #a7f3d0", borderRadius: 8 }}>
                  <RoomSel v={rule.s1} oC={(v:any)=>updateRule("kenmuPairs", idx, "s1", v)} list={RM_SEC} ph="部屋を選択" />
                  <span className="rule-label" style={{ color: "#065f46" }}>←→</span>
                  <RoomSel v={rule.s2} oC={(v:any)=>updateRule("kenmuPairs", idx, "s2", v)} list={RM_SEC} ph="部屋を選択" />
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16, fontSize: 16, color: "#047857", fontWeight: 700, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!rule.isExclusive} onChange={(e) => updateRule("kenmuPairs", idx, "isExclusive", e.target.checked)} style={{ width: 22, height: 22, cursor: "pointer" }} />このペアに専念させる
                  </label>
                  <Del oC={()=>removeRule("kenmuPairs", idx)} />
                </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("kenmuPairs", { s1: "", s2: "" })}>＋ ペアを追加</button>

              <h6 style={{ fontSize: 17, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 基本兼務（セット配置）</h6>
              {(customRules.linkedRooms || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "1px solid #a7f3d0", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>[</span>
                        <RoomSel v={rule.target} oC={(v:any)=>updateRule("linkedRooms", idx, "target", v)} list={RM_SEC} ph="兼務専用にする部屋" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>] には専任を置かず、[</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }}><MP v={rule.sources} oC={(v: string) => updateRule("linkedRooms", idx, "sources", v)} opt={EX_SEC} /></div>
                      <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>] の担当者をセットで配置する（※左から優先）</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#065f46" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#065f46" }}>▼</button>
                      <Del oC={()=>removeRule("linkedRooms", idx)} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("linkedRooms", { target: "", sources: "" })}>＋ セット配置ルールを追加</button>

              <h6 style={{ fontSize: 17, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 🆘 空室（人数不足）救済ルール</h6>
              {(customRules.rescueRules || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "1px solid #fde047", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#854d0e" }}>もし</span>
                        <RoomSel v={rule.targetRoom} oC={(v:any)=>updateRule("rescueRules", idx, "targetRoom", v)} list={RM_SEC} ph="（空室の部屋）" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#854d0e" }}>が不足なら ➔ 以下の部屋から兼務を探す（※左から優先）</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10 }}><MP v={rule.sourceRooms} oC={(v: string) => updateRule("rescueRules", idx, "sourceRooms", v)} opt={EX_SEC} /></div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#a16207" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#a16207" }}>▼</button>
                      <Del oC={()=>removeRule("rescueRules", idx)} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#854d0e", borderColor: "#fde047" }} onClick={() => addRule("rescueRules", { targetRoom: "", sourceRooms: "" })}>＋ 救済ルールを追加</button></>
            } />

            <RC bg="#f5f3ff" b="#ddd6fe" c="#6d28d9" ic="🌆" t="遅番ルール" ch={
              <><div style={{ marginBottom: 16, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #ddd6fe" }}>
                <label style={{ fontSize: 16, fontWeight: 800, color: "#6d28d9", display: "block", marginBottom: 4 }}>優先度を下げるスタッフ（左に書いた人ほど徹底して除外します）</label>
                <MP v={customRules.lateShiftLowPriorityStaff || ""} oC={(v: string) => setCustomRules({...customRules, lateShiftLowPriorityStaff: v})} opt={allStaff} ph="＋スタッフを選択" />
              </div>
              {(customRules.lateShifts || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"12px 16px", border:"1px solid #ddd6fe", borderRadius:8}}>
                    <RoomSel v={rule.section} oC={(v:any)=>updateRule("lateShifts", idx, "section", v)} list={RM_SEC} />
                    <span className="rule-label" style={{color:"#6d28d9"}}>に</span>
                    <select value={rule.lateTime} onChange={(e: any) => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">遅番の時間</option>{TO.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>の担当を追加する（日勤は</span>
                    <select value={rule.dayEndTime} onChange={(e: any) => updateRule("lateShifts", idx, "dayEndTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">終了時間</option>{TO.filter(t => t.includes("(〜")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>とする）</span>
                    <Del oC={()=>removeRule("lateShifts", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルールを追加</button></>
            } />

            <RC bg="#fff1f2" b="#fecaca" c="#be185d" ic="⚠️" t="兼務上限のストッパー設定（過労防止）" ch={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Num v={customRules.alertMaxKenmu ?? 3} oC={(v:any)=>setCustomRules({...customRules, alertMaxKenmu: v})} w={80} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#9f1239" }}>部屋以上の兼務は自動ブロック（手動時はエラー表示）</span>
              </div>
            } />
          </div>

          <div style={{ borderLeft: "8px solid #8b5cf6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#6d28d9", marginBottom: 20, borderBottom: "2px solid #c4b5fd", paddingBottom: 10 }}>フェーズ5：仕上げ（最後に配置）</h4>
            
            <RC bg="#eef2ff" b="#c7d2fe" c="#4338ca" ic="🍱" t="昼当番ルール" ch={
              <><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#fff", padding: "12px 20px", borderRadius: 10, border: "1px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 19, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span><Num v={customRules.lunchBaseCount ?? 3} oC={(v:any)=>setCustomRules({...customRules, lunchBaseCount: v})} w={80} />
              </div>

              <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", marginBottom: 20 }}>
                <h6 style={{ margin: "0 0 16px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>👤 特定役割の確保（別部屋から引抜）</h6>
                {(customRules.lunchRoleRules || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{ borderBottom: "1px dashed #e0e7ff", paddingBottom: 16, marginBottom: 16 }}>
                    <select value={rule.day} onChange={(e: any) => updateRule("lunchRoleRules", idx, "day", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", minWidth: "100px"}}>{["月","火","水","木","金","土","日","毎日"].map(d => <option key={d} value={d}>{d}{d!=="毎日"?"曜":""}</option>)}</select>
                    <span className="rule-label">は</span>
                    <select value={rule.role} onChange={(e: any) => updateRule("lunchRoleRules", idx, "role", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", minWidth: "140px"}}><option value="">役割を選択</option>{MONTHLY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
                    <span className="rule-label">担当を優先。引抜元（定員を満たしている場合のみ。※左から優先）:</span>
                    <MP v={rule.sourceRooms} oC={(v: string) => updateRule("lunchRoleRules", idx, "sourceRooms", v)} opt={EX_SEC} />
                    <Del oC={()=>removeRule("lunchRoleRules", idx)} />
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("lunchRoleRules", { day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" })}>＋ 役割確保ルールを追加</button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>📅 曜日ごとに人数を変える</h6>
                    {(customRules.lunchSpecialDays || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.day} onChange={(e: any) => updateRule("lunchSpecialDays", idx, "day", e.target.value)} className="rule-sel">{["月","火","水","木","金","土","日"].map(d => <option key={d} value={d}>{d}曜</option>)}</select>
                        <span className="rule-label">は</span>
                        <Num v={rule.count} oC={(v:any)=>updateRule("lunchSpecialDays", idx, "count", v)} />
                        <Del oC={()=>removeRule("lunchSpecialDays", idx)} />
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchSpecialDays", { day: "火", count: 4 })}>＋ 曜日ルールを追加</button>
                  </div>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h6>
                    {(customRules.lunchConditional || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <RoomSel v={rule.section} oC={(v:any)=>updateRule("lunchConditional", idx, "section", v)} list={RM_SEC} />
                        <Num v={rule.min} oC={(v:any)=>updateRule("lunchConditional", idx, "min", v)} />
                        <span className="rule-label">人以上➔</span>
                        <Num v={rule.out} oC={(v:any)=>updateRule("lunchConditional", idx, "out", v)} />
                        <Del oC={()=>removeRule("lunchConditional", idx)} />
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchConditional", { section: "CT", min: 4, out: 1 })}>＋ 条件ルールを追加</button>
                  </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 24 }}>
                  <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", minWidth: "260px" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>🎯 優先的に選出する部屋</h6>
                    <MP v={customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT"} oC={(v: string) => setCustomRules({...customRules, lunchPrioritySections: v})} opt={RM_SEC} />
                  </div>
                  <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", minWidth: "260px" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>⚠️ 緊急時のみ選出する部屋（なるべく除外）</h6>
                    <MP v={customRules.lunchLastResortSections ?? "治療"} oC={(v: string) => setCustomRules({...customRules, lunchLastResortSections: v})} opt={RM_SEC} />
                  </div>
              </div></>
            } />

            <RC bg="#f0fdf4" b="#bbf7d0" c="#15803d" ic="🤝" t="サポート専任（2人目要員）ルール" ch={
              <><div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 17, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>対象スタッフ名（複数可）</label>
                    <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "1px solid #86efac", minHeight: "56px", display: "flex", alignItems: "center" }}>
                      <MP v={customRules.supportStaffList || ""} oC={(v: string) => setCustomRules({...customRules, supportStaffList: v})} opt={allStaff} ph="＋スタッフを選択" />
                    </div>
                  </div>
                  <div style={{ flex: 2, minWidth: "260px" }}>
                    <label style={{ fontSize: 17, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>優先する対象部屋</label>
                    <MP v={customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT"} oC={(v: string) => setCustomRules({...customRules, supportTargetRooms: v})} opt={RM_SEC} />
                  </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start", marginTop: 16 }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 15, fontWeight: 800, color: "#166534", display: "block", marginBottom: 4 }}>低影響グループ（優先的に補充元にする部屋）</label>
                    <MP v={customRules.supportTargetRoomsLowImpact ?? "3号室,パノラマCT"} oC={(v: string) => setCustomRules({...customRules, supportTargetRoomsLowImpact: v})} opt={RM_SEC} />
                  </div>
                  <div style={{ flex: 2, minWidth: "260px" }}>
                    <label style={{ fontSize: 15, fontWeight: 800, color: "#166534", display: "block", marginBottom: 4 }}>高影響グループ（極力補充元にしない部屋）</label>
                    <MP v={customRules.supportTargetRoomsHighImpact ?? "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像"} oC={(v: string) => setCustomRules({...customRules, supportTargetRoomsHighImpact: v})} opt={RM_SEC} />
                  </div>
              </div></>
            } />
          </div>
          
        </div>
      </div>

      {/* ===================== モーダル類 ===================== */}
      {showUnassignedList && (
        <M t="未配置のスタッフ" oC={() => setShowUnassignedList(null)} ch={
          <div style={{ fontSize: 20, lineHeight: 1.6, color: "#ef4444", fontWeight: 800, textAlign: "center" }}>
            {getDailyStats(showUnassignedList).unassigned.join("、") || "全員配置済みです"}
          </div>
        } />
      )}

      {selectedErrorDay && (
        <M t={`👀 ${selectedErrorDay} の確認事項`} oC={() => setSelectedErrorDay(null)} ch={
          <ul style={{ listStyle: "none", padding: 0 }}>
            {getDayWarnings(selectedErrorDay).map((w, i) => {
              let badgeColor = "#475569"; let badgeBg = "#f8fafc"; let icon = "⚠️"; let borderColor = "#cbd5e1";
              if (w.level === 'red') { badgeColor = "#b91c1c"; badgeBg = "#fee2e2"; icon = "🔴"; borderColor = "#fecaca"; }
              else if (w.level === 'orange') { badgeColor = "#c2410c"; badgeBg = "#ffedd5"; icon = "🟠"; borderColor = "#fed7aa"; }
              else if (w.level === 'yellow') { badgeColor = "#a16207"; badgeBg = "#fef08a"; icon = "🟡"; borderColor = "#fde047"; }
              
              return (
                <li key={i} style={{ display: "flex", gap: "12px", padding: "16px 20px", marginBottom: "12px", background: "#f8fafc", border: `2px solid ${borderColor}`, borderRadius: "10px", fontSize: 16, fontWeight: 700, color: "#334155", lineHeight: 1.6, alignItems: "center" }}>
                  <span style={{ display: "inline-block", background: badgeBg, color: badgeColor, padding: "4px 10px", borderRadius: "6px", fontSize: "14px", fontWeight: 800, whiteSpace: "nowrap", border: `1px solid ${borderColor}` }}>{icon} {w.title}</span>
                  <span>{w.msg}</span>
                </li>
              );
            })}
          </ul>
        } />
      )}

      {selectedStaffForStats && (
        <M t={`👤 ${selectedStaffForStats} さんの詳細`} oC={() => setSelectedStaffForStats(null)} ch={
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 18 }}>
            <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}><th style={{ padding: "12px 10px", textAlign: "left" }}>日付</th><th style={{ padding: "12px 10px", textAlign: "left" }}>担当業務</th></tr></thead>
            <tbody>
              {Object.entries(allDays).filter(([dateStr]) => dateStr.startsWith(targetMonday.substring(0, 7))).sort((a, b) => a[0].localeCompare(b[0])).map(([dateStr, cells]) => {
                const assigns: string[] = [];
                Object.entries(cells).forEach(([sec, val]) => {
                  if(["明け","入り","土日休日代休","不在","待機","昼当番","受付","受付ヘルプ"].includes(sec)) return;
                  const members = sp(val as string); const myAssign = members.find(m => ex(m) === selectedStaffForStats);
                  if (myAssign) { const timeStr = myAssign.substring(selectedStaffForStats.length); assigns.push(`${sec}${timeStr}`); }
                });
                const dObj = new Date(dateStr); const YOUBI = ["日", "月", "火", "水", "木", "金", "土"];
                const label = `${dObj.getMonth() + 1}/${dObj.getDate()}(${YOUBI[dObj.getDay()]})`;
                if (assigns.length === 0) return null;
                return (
                  <tr key={dateStr} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: "12px 10px", color: "#0ea5e9", fontWeight: 700 }}>{assigns.join(" / ")}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        } />
      )}

      {showLogDay && (
        <M t={`🤔 ${showLogDay} の割当根拠`} oC={() => setShowLogDay(null)} wide ch={
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {assignLogs[showLogDay]?.map((log, i) => rLog(log, i))}
            {!assignLogs[showLogDay] || assignLogs[showLogDay].length === 0 ? <li style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>自動割当の履歴がありません</li> : null}
          </ul>
        } />
      )}

      {showRuleModal && (
        <M t="🏥 勤務割付システムのルールブック" oC={() => setShowRuleModal(false)} wide ch={
          <div style={{ lineHeight: 1.8, fontSize: "16px", color: "#334155" }}>
            <p>このシステムはランダムではなく、複数のルールを順番に適用し、スタッフの負担・安全・公平性のバランスを見ながら、最適に近いシフトを自動で組み立てています。</p>
            
            <h4 style={{ color: "#e11d48", borderBottom: "2px solid #ffe4e6", paddingBottom: 8, marginTop: 24 }}>🛑 1. システムが「絶対に守る」鉄の掟</h4>
            <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}><strong>担当不可・NGペアの厳守:</strong> 「この部屋はまだ不可」「この2人は同室にしない」設定は必ず守ります。</li>
              <li style={{ marginBottom: 8 }}><strong>兼務上限（過労ストッパー）:</strong> 設定値（標準3）に達した時点（3部屋担当など）でカレンダーに⚠️注意が出ます。さらにその上限を超える（4部屋目などの）自動配置はブロックされます。</li>
              <li style={{ marginBottom: 8 }}><strong>連日担当の禁止:</strong> ポータブルなど連日禁止の部屋は、昨日の担当者をすべてのルートで問答無用に除外します。</li>
              <li style={{ marginBottom: 8 }}><strong>半休の終日専任室ブロック:</strong> 午前後休の人をCT/MRI等に配置することは原則ありません。</li>
            </ul>

            <h4 style={{ color: "#2563eb", borderBottom: "2px solid #dbeafe", paddingBottom: 8 }}>🟦 2. 誰が選ばれる？「ポイント制」</h4>
            <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}><strong>優先加点:</strong> その月の「メイン担当」「サブ担当」は優先的に選ばれます。</li>
              <li style={{ marginBottom: 8 }}><strong>平等化減点:</strong> CT・MRIは「今月」、その他の部屋は「今週」すでにその部屋に入っている回数が多い人ほど減点され、均等化されます。</li>
            </ul>

            <h4 style={{ color: "#10b981", borderBottom: "2px solid #d1fae5", paddingBottom: 8 }}>🟩 3. シフトが完成するまでの「5ステップ」</h4>
            <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}><strong>欠員ブロック＆緊急対応:</strong> 休みを外し、人数不足時は緊急ルールを真っ先に発動。</li>
              <li style={{ marginBottom: 8 }}><strong>例外・代打・玉突き:</strong> 専従固定や代打ルールを先に処理します。</li>
              <li style={{ marginBottom: 8 }}><strong>メイン配置:</strong> 優先順位の高い部屋から順番にメイン担当者を決めます。</li>
              <li style={{ marginBottom: 8 }}>
                <strong>兼務・救済・応援:</strong>
                <div style={{ background: "#f0fdf4", padding: "8px 12px", borderRadius: 6, border: "1px solid #bbf7d0", margin: "4px 0" }}>
                   💡 フェーズ4で複数候補がある場合は、原則として<br/>
                   <strong>① 過去担当回数が少ない人</strong><br/>
                   <strong>② 今日の兼務部屋数が少ない人</strong><br/>
                   <strong>③ 補充元として指定された順（左から優先）</strong><br/>
                   の順で総合的に選びます。
                </div>
                定員割れがある場合、他への影響が少ない部屋から安全に兼務の応援を呼びます。
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>総仕上げ（昼当番・余剰配置）:</strong>
                昼当番はまず設定された条件（治療以外など）から探し、それでも不足なら最終手段（治療など）からも拾います。受付ヘルプもここで決定します。<br/>
                <strong>♻️ 余剰配置:</strong> 1日を通して何の部屋にも割り当てられなかった一般スタッフがいる場合、まず<strong>兼務中の部屋の兼務解消（専任化）</strong>を試みます。兼務解消できる部屋がなければ、<strong>優先順位が低い部屋から順に</strong>配置します。（※待機への自動配置は行いません）
              </li>
            </ol>
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: 16, borderRadius: 8, marginTop: 32 }}>
              <strong style={{ color: "#334155" }}>💡 最後に</strong><br/>もし「この部屋の負担が偏っている」場合は、人間が【設定画面】の「月担当」や「優先順位」を少し調整することで、意図に近いシフトを作れるようになります。
            </div>
          </div>
        } />
      )}
    </div>
  );
}
