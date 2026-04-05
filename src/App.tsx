import React, { useEffect, useMemo, useState, useRef } from "react";

const GS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');html,body,#root{max-width:100%!important;width:100%!important;margin:0!important;padding:0!important;}body{background:#f4f7f9;color:#334155;-webkit-print-color-adjust:exact;font-family:'Inter',sans-serif;letter-spacing:0.02em;font-size:16px;overflow-x:hidden;}*{box-sizing:border-box;}textarea,select,button,input{font:inherit;}textarea:focus,select:focus,input:focus{outline:3px solid #3b82f6;outline-offset:-1px;border-color:transparent!important;}select{appearance:none;background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right 8px center;background-size:1.2em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;padding-right:32px!important;}details>summary{list-style:none;cursor:pointer;outline:none;}details>summary:hover{color:#0d9488;}.scroll-container{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;border-radius:8px;border:1px solid #e2e8f0;background:#fff;}.sticky-table-header th{position:sticky;top:0;z-index:20;background:#f8fafc;box-shadow:0 2px 4px -1px rgba(0,0,0,0.05);}.sticky-header-panel{position:sticky;top:0;z-index:30;background:rgba(255,255,255,0.95);backdrop-filter:blur(4px);padding-top:16px;margin-top:-16px;box-shadow:0 4px 6px -4px rgba(0,0,0,0.1);}.calendar-row{transition:background-color 0.2s;cursor:pointer;}.calendar-row:hover{background-color:#f1f5f9!important;}.btn-hover{transition:all 0.2s;cursor:pointer;}.btn-hover:hover{transform:translateY(-1px);filter:brightness(1.05);box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)!important;}.card-hover{transition:box-shadow 0.2s,transform 0.2s;cursor:pointer;}.card-hover:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06);}.rule-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center;width:100%;}.rule-sel,.rule-num{padding:8px 12px;border-radius:6px;border:1px solid #cbd5e1;font-weight:600;font-size:15px;transition:border-color 0.2s;}.rule-num{width:60px;text-align:center;flex-shrink:0;}.rule-del{border:none;background:none;color:#ef4444;cursor:pointer;font-size:24px;flex-shrink:0;padding:0 8px;transition:0.2s;}.rule-del:hover{background:#fee2e2;border-radius:6px;}.rule-add{background:#fff;color:#4f46e5;border:2px dashed #a5b4fc;padding:10px 16px;font-size:16px;width:100%;display:flex;justify-content:center;font-weight:bold;border-radius:8px;cursor:pointer;margin-top:12px;transition:0.2s;}.rule-add:hover{background:#e0e7ff;border-color:#4f46e5;}.rule-label{font-size:15px;font-weight:700;color:#64748b;flex-shrink:0;}.tab-btn{background:none;border:none;padding:12px 20px;font-size:17px;font-weight:800;color:#64748b;cursor:pointer;border-bottom:3px solid transparent;transition:0.2s;}.tab-btn:hover{color:#3b82f6;}.tab-btn.active{color:#2563eb;border-bottom-color:#2563eb;}.name-textarea{width:100%;height:120px;padding:12px;font-size:15px;border-radius:8px;border:1px solid #cbd5e1;font-weight:600;line-height:1.5;}.modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);}.modal-content{background:#fff;padding:32px;border-radius:16px;width:100%;max-width:600px;max-height:85vh;overflow-y:auto;}.modal-wide{max-width:1000px;}.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e2e8f0;}.modal-title{margin:0;font-size:24px;color:#0f172a;font-weight:800;}.close-btn{background:#f1f5f9;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;color:#64748b;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;transition:0.2s;}.close-btn:hover{background:#e2e8f0;}@media print{body{background:#fff;}.no-print{display:none!important;}.print-area{box-shadow:none!important;border:none!important;padding:0!important;margin:0!important;width:100%!important;}table{width:100%!important;border-collapse:collapse!important;table-layout:auto;}th,td{border:1px solid #000!important;padding:6px!important;font-size:11pt!important;color:#000!important;position:static!important;}}`;

type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
type WarningInfo = { level: 'red' | 'orange' | 'yellow'; title: string; msg: string; staff?: string; room?: string; };

const SEC = ["明け","入り","土日休日代休","不在","待機","CT","MRI","RI","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","受付","受付ヘルプ"];
const AS_SEC = SEC.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const RM_SEC = SEC.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const RE_SEC = ["明け","入り","土日休日代休","不在"];
const WK_SEC = SEC.filter(s => !RE_SEC.includes(s));
const PL_SEC = RM_SEC.map(s => s + "枠");
const EX_SEC = [...RM_SEC, "CT(4)", "CT(3)", "MRI(3)", "治療(3)"];

const DEF_RULES = { 
  staffList: "", receptionStaffList: "", supportStaffList: "浅野", supportTargetRooms: "2号室,3号室", supportTargetRoomsLowImpact: "3号室,パノラマCT", supportTargetRoomsHighImpact: "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像", customHolidays: "", capacity: { "CT": 4, "MRI": 3, "治療": 3, "RI": 1, "MMG": 1, "透視（6号）": 1, "透視（11号）": 1, "骨塩": 1, "1号室": 1, "5号室": 1, "パノラマCT": 1 }, dailyCapacities: [], dailyAdditions: [], priorityRooms: ["治療", "受付", "MMG", "RI", "MRI", "CT", "DSA", "ポータブル", "透視（6号）", "透視（11号）", "骨塩", "1号室", "2号室", "5号室", "検像", "パノラマCT", "3号室", "受付ヘルプ", "透析後胸部"], fullDayOnlyRooms: "", noConsecutiveRooms: "ポータブル", consecutiveAlertRooms: "ポータブル, 透視（6号）", noLateShiftStaff: "浅野、木内康、髙橋、川崎、松平、阿部", noLateShiftRooms: "透視（11号）", lateShiftLowPriorityStaff: "木内康、石田、澤邊、依田", closedRooms: [], ngPairs: [{s1:"本郷",s2:"寺本",level:"hard"},{s1:"髙橋",s2:"寺本",level:"soft"}], fixed: [], forbidden: [{staff:"浅野",sections:"CT、ポータブル、MRI、1号室、MMG、骨塩、透析後胸部、DSA、残り・待機、受付、受付ヘルプ、パノラマCT、5号室、検像、治療、RI"}], substitutes: [], pushOuts: [], emergencies: [{ threshold: 19, type: "change_capacity", role: "", section: "CT", newCapacity: 3 }], swapRules: [{ targetRoom: "ポータブル", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }], kenmuPairs: [{ s1: "MMG", s2: "透視（11号）", isExclusive: true }], rescueRules: [{ targetRoom: "ポータブル", sourceRooms: "3号室、2号室、1号室、5号室、CT(4)" }], lateShifts: [{ section: "透視（6号）", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" }], lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], lunchRoleRules: [{ day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" }], lunchPrioritySections: "RI, 1号室, 2号室, 3号室, 5号室", lunchLastResortSections: "治療", linkedRooms: [{ target: "ポータブル", sources: "3号室(1)、2号室、1号室、5号室、CT(4)" }], alertMaxKenmu: 3, alertEmptyRooms: "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像,受付", smartKenmu: [{ targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" }] 
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

// --- Helper Components ---
const Btn = ({bg, c, sz, ch, oC, dis}:any) => <button className="btn-hover" onClick={oC} disabled={dis} style={{background:bg,color:c,border:"none",borderRadius:6,padding:"8px 12px",cursor:dis?"not-allowed":"pointer",fontWeight:700,fontSize:sz||15,whiteSpace:"nowrap",boxShadow:"0 2px 4px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:6,opacity:dis?0.5:1}}>{ch}</button>;
const M = ({t, oC, w, ch}:any) => <div className="modal-overlay" onClick={oC}><div className={`modal-content ${w?'modal-wide':''}`} onClick={e=>e.stopPropagation()}><div className="modal-header"><h3 className="modal-title">{t}</h3><button onClick={oC} className="close-btn">✖</button></div>{ch}<div style={{textAlign:"center",marginTop:32}}><Btn bg="#2563eb" c="#fff" sz={16} oC={oC} ch="閉じる" /></div></div></div>;
const RC = ({bg, b, c, ic, t, d, ch}:any) => <div style={{background:bg,padding:24,borderRadius:12,border:`2px solid ${b}`,marginBottom:20}}><h5 style={{margin:"0 0 12px 0",color:c,fontSize:18,fontWeight:800}}>{ic} {t}</h5>{d&&<p style={{fontSize:15,color:"#166534",marginTop:0,marginBottom:16}}>{d}</p>}{ch}</div>;
const MP = ({v, oC, opt, ph}:any) => { const c=sp(v); return <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8,marginBottom:8}}>{c.map((x,i)=><div key={i} style={{background:"#e0f2fe",color:"#0369a1",borderRadius:16,padding:"6px 12px",fontSize:15,fontWeight:700,border:"1px solid #bae6fd",display:"flex",alignItems:"center",gap:6}}><span>{x}</span><span onClick={()=>{const n=[...c];n.splice(i,1);oC(jn(n));}} style={{cursor:"pointer",opacity:0.5}}>✖</span></div>)}<select className="rule-sel" onChange={e=>{if(e.target.value&&!c.includes(e.target.value))oC(jn([...c,e.target.value]));e.target.value="";}} value=""><option value="">{ph||"＋追加"}</option>{opt.filter((s:any)=>!c.includes(s)).map((s:any)=><option key={s} value={s}>{s}</option>)}</select></div>; };
const Del = ({oC}:any) => <button onClick={oC} className="rule-del">✖</button>;
const Num = ({v, oC, w=60}:any) => <input type="number" value={v} onChange={e=>oC(Number(e.target.value))} className="rule-num" style={{width:w}} />;
const Sel = ({v, oC, opt, ph, w}:any) => <select value={v} onChange={e=>oC(e.target.value)} className="rule-sel" style={{width:w, flex:"0 0 auto"}}><option value="">{ph}</option>{opt.map((s:any)=><option key={s} value={s}>{s}</option>)}</select>;

const rLog = (ls: string, i: number) => {
  if(ls.startsWith("・■")) return <li key={i} style={{marginTop:16,marginBottom:8,paddingBottom:4,borderBottom:"2px solid #cbd5e1",fontSize:18,fontWeight:800,color:"#334155"}}>{ls.substring(2)}</li>;
  const m=ls.match(/^・(.*?)\s\[(.*?)\]\s(.*)$/); if(!m) return <li key={i} style={{padding:"8px 12px",marginBottom:4,background:"#f8fafc",borderRadius:6,fontSize:14,color:"#475569",lineHeight:1.6}}>{ls.substring(1)}</li>;
  let bg="#f8fafc", b="#e2e8f0", c="#475569", bbg="#e2e8f0", bc="#475569";
  if(m[2].includes("配置")||m[2].includes("増枠")){bg="#eff6ff";b="#bfdbfe";c="#1e3a8a";bbg="#dbeafe";bc="#1d4ed8";}
  else if(m[2].includes("緊急")||m[2].includes("除外")){bg="#fef2f2";b="#fecaca";c="#7f1d1d";bbg="#fee2e2";bc="#b91c1c";}
  else if(m[2].includes("救済")||m[2].includes("代打")){bg="#fff7ed";b="#fed7aa";c="#9a3412";bbg="#ffedd5";bc="#c2410c";}
  else if(m[2].includes("兼務")||m[2].includes("負担軽減")){bg="#ecfdf5";b="#a7f3d0";c="#064e3b";bbg="#d1fae5";bc="#047857";}
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
  iFb(st: string, sc: string) { return (this.cx.customRules.forbidden||[]).some((r:any)=>ex(r.staff)===ex(st)&&sp(r.sections).includes(sc)); }
  hNG(c: string, ms: string[], sf: boolean) { return ms.some(m=>(this.cx.customRules.ngPairs||[]).some((n:any)=>{const mt=(ex(n.s1)===ex(c)&&ex(n.s2)===ex(m))||(ex(n.s1)===ex(m)&&ex(n.s2)===ex(c)); if(!mt)return false; return (n.level||"hard")==="hard"||sf;})); }
  iFDO(r: string) { return sp(this.cx.customRules.fullDayOnlyRooms||"").includes(r); }
  iHB(st: string, sc: string) { if(!this.iFDO(sc)) return {h:false}; const fm=sp(this.dc["不在"]); const a=fm.some(m=>ex(m)===st&&m.includes("(AM)")); const p=fm.some(m=>ex(m)===st&&m.includes("(PM)")); if(!a&&!p)return {h:false}; return {h:!isMonthlyMainStaff(sc,st,this.cx.monthlyAssign)}; }
  iHNC(s: string, r: string) { return this.pd && sp(this.cx.customRules.noConsecutiveRooms).includes(r) && sp(this.pd.cells[r]).map(ex).includes(s); }
  gRSc(src: string, tgt: string, st?: string) { let sc=0; const l=sp(this.cx.customRules.supportTargetRoomsLowImpact); const h=sp(this.cx.customRules.supportTargetRoomsHighImpact); if(src===tgt)sc+=9999; if(l.includes(src))sc-=1000; if(h.includes(src))sc+=1000; const sm=sp(this.dc[src]); const sL=sp(this.cx.customRules.supportStaffList).map(ex); if(sm.length>0&&sm.every(m=>sL.includes(ex(m))))sc+=5000; else{const a=sm.reduce((s,m)=>s+getAmt(m),0); if(a<=1)sc+=500; else if(a<=2)sc+=200;} if(st&&h.includes(src)&&(this.bm.get(st)==='AM'||this.bm.get(st)==='PM'))sc+=300; if(this.cl.includes(src)||this.sk.includes(src))sc+=5000; return sc; }
  uBM(c: string, p: string) { const cu=this.bm.get(c); this.bm.set(c, p.includes("(AM)")?(cu==='PM'||cu==='ALL'?'ALL':'AM'):p.includes("(PM)")?(cu==='AM'||cu==='ALL'?'ALL':'PM'):'ALL'); }
  cAK(st: string, tgt: string, bp=false) { if(!sp(this.dc[tgt]).map(ex).includes(st) && this.gTR(st)>=(this.cx.customRules.alertMaxKenmu||3)) return false; const exP=(this.cx.customRules.kenmuPairs||[]).filter((p:any)=>p.isExclusive); for(const p of exP){ const i1=sp(this.dc[p.s1]).map(ex).includes(st); const i2=sp(this.dc[p.s2]).map(ex).includes(st); if((i1||i2)&&tgt!==p.s1&&tgt!==p.s2)return false; if((tgt===p.s1||tgt===p.s2)&&!bp){if(RM_SEC.filter(r=>sp(this.dc[r]).map(ex).includes(st)&&!["待機","昼当番","受付","受付ヘルプ"].includes(r)).some(r=>r!==p.s1&&r!==p.s2))return false;} } return true; }
  iMC(st: string) { return sp(this.cx.monthlyAssign.MMG).map(ex).includes(ex(st)); }
  gET(r: string, bc: number) { const d=this.d.label.match(/\((.*?)\)/)?.[1]; if(!d)return{cap:bc,aC:false,pC:false,al:false}; const cl=(this.cx.customRules.closedRooms||[]).filter((x:any)=>x.room===r&&x.day===d); let a=false,p=false,al=false; cl.forEach((x:any)=>{if(x.time==="全日")al=true;else if(x.time==="(AM)")a=true;else if(x.time==="(PM)")p=true;}); if(a&&p)al=true; if(al)return{cap:0,aC:true,pC:true,al:true}; if(a||p)return{cap:bc/2,aC:a,pC:p,al:false}; return{cap:bc,aC:false,pC:false,al:false}; }
  pk(aL: string[], ls: string[], n: number, sc?: string, cA: string[]=[]): string[] { const r:string[]=[]; const uL=Array.from(new Set(ls.filter(Boolean))); const f=(nm:string, sf:boolean)=>{if(!aL.includes(nm)||this.iU(nm)||(sc&&this.iFb(nm,sc)))return false; if(this.hNG(nm,[...cA,...r].map(ex),sf))return false; if(sc&&!this.cAK(nm,sc))return false; return true;}; for(const nm of uL.filter(x=>f(x,true))){r.push(nm);if(r.length>=n)return r;} for(const nm of uL.filter(x=>f(x,false))){r.push(nm);if(r.length>=n)return r;} return r; }

  exe(): DayData {
    this.lgP("前提処理"); this.cx.allStaff.forEach(s=>{this.ac[s]=0;this.ma[s]=1;this.rc[s]={};SEC.forEach(x=>this.rc[s][x]=0);this.cts[s]=0;});
    this.pm.forEach(pd=>Object.entries(pd.cells).forEach(([k,v])=>{if(["CT","MRI"].includes(k))sp(v).forEach(m=>{const c=ex(m);if(this.rc[c]){this.rc[c][k]++;this.cts[c]++;}});}));
    this.pw.forEach(pd=>Object.entries(pd.cells).forEach(([k,v])=>{if(!["CT","MRI"].includes(k))sp(v).forEach(m=>{const c=ex(m);if(this.rc[c]){this.rc[c][k]++;this.cts[c]++;}});}));
    if(this.pd?.cells["入り"]){ const im=sp(this.pd.cells["入り"]).map(ex); this.dc["明け"]=jn(Array.from(new Set([...sp(this.dc["明け"]),...im]))); if(im.length>0)this.lg(`[前日処理] 昨日の入りを明けに`); }
    if(this.d.isPublicHoliday){ this.lg(`🎌 祝日スキップ`); return {...this.d,cells:Object.fromEntries(SEC.map(s=>[s,""])),logInfo:this.logInfo}; }
    const dc=this.d.label.match(/\((.*?)\)/)?.[1]; if(dc) (this.cx.customRules.closedRooms||[]).forEach((r:any)=>{if(r.day===dc)this.lg(`🛑 ${r.room} ${r.time} 閉室`);});
    if(!this.sm){ RM_SEC.forEach(s=>this.dc[s]=jn(sp(this.dc[s]).filter(m=>PL_SEC.includes(ex(m))))); this.dc["昼当番"]=""; this.dc["受付ヘルプ"]=""; this.dc["待機"]=""; }
    this.cx.allStaff.forEach(s=>this.bm.set(s,'NONE')); ["明け","入り","土日休日代休"].forEach(s=>sp(this.dc[s]).forEach(m=>this.bm.set(ex(m),'ALL'))); sp(this.dc["不在"]).forEach(m=>this.bm.set(ex(m),m.includes("(AM)")?'AM':m.includes("(PM)")?'PM':'ALL'));
    if(this.sm) WK_SEC.forEach(s=>{ const nx=sp(this.dc[s]).filter(m=>{const c=ex(m),b=this.bm.get(c);if(PL_SEC.includes(c))return true; if(b==='ALL')return false; if(b==='AM'&&!m.includes("(PM)")&&!m.match(/\(.*\)/))return false; if(b==='PM'&&!m.includes("(AM)")&&!m.match(/\(.*\)/))return false; return true;}); if(sp(this.dc[s]).length!==nx.length)this.dc[s]=jn(nx); });
    (this.cx.customRules.dailyAdditions||[]).forEach((r:any)=>{if(r.date===this.d.id&&r.section&&r.count>0&&r.section!=="透析後胸部"){const p=r.section+"枠"+(r.time==="全日"||!r.time?"":r.time); let c=sp(this.dc[r.section]); if(!c.includes(p)){for(let i=0;i<r.count;i++)c.push(p);this.dc[r.section]=jn(c);}}});
    const tAv=this.cx.activeGeneralStaff.filter(s=>this.bm.get(s)!=='ALL').length; (this.cx.customRules.emergencies||[]).forEach((em:any)=>{if(tAv<=Number(em.threshold)){if(em.type==="role_assign"&&em.role&&em.section)this.ra[em.role]=em; if(em.type==="staff_assign"&&em.staff&&em.section)this.stA.push(em); if(em.type==="clear"&&em.section){this.sk.push(em.section);this.cl.push(em.section);} if(em.type==="change_capacity"&&em.section)this.cap[em.section]=Number(em.newCapacity);}});
    Object.keys(this.dc).forEach(s=>{if(["明け","入り","不在","土日休日代休"].includes(s))return; if(this.sk.includes(s)){this.dc[s]="";return;} this.dc[s]=jn(sp(this.dc[s]).map(m=>{const c=ex(m);if(PL_SEC.includes(c))return m; const b=this.bm.get(c); if(b==='ALL'||(b==='AM'&&m.includes('(AM)'))||(b==='PM'&&m.includes('(PM)')))return null; if(b==='AM'&&!m.includes('(PM)')&&!m.match(/\(.*\)/))return `${c}(PM)`; if(b==='PM'&&!m.includes('(AM)')&&!m.match(/\(.*\)/))return `${c}(AM)`; return m;}).filter(Boolean) as string[]); });
    WK_SEC.forEach(s=>sp(this.dc[s]).forEach(m=>{const c=ex(m);if(!PL_SEC.includes(c)&&this.bm.get(c)!=='ALL')this.aU(c,getAmt(m));}));
    const sSL=sp(this.cx.customRules.supportStaffList).map(ex); this.iaAll=this.cx.allStaff.filter(s=>this.bm.get(s)!=='ALL').sort((a,b)=>(this.cts[a]||0)-(this.cts[b]||0)||a.localeCompare(b,'ja')); this.iaSup=this.iaAll.filter(s=>sSL.includes(s)); this.iaGen=this.iaAll.filter(s=>this.cx.activeGeneralStaff.includes(s)&&!sSL.includes(s)); this.iaRec=this.iaAll.filter(s=>this.cx.activeReceptionStaff.includes(s)||(this.cx.activeGeneralStaff.includes(s)&&!sSL.includes(s)));

    if(this.sm) {
      (this.cx.customRules.priorityRooms||SEC).forEach((rm:string)=>{
        if(RE_SEC.includes(rm)||["昼当番","受付ヘルプ","待機","透析後胸部"].includes(rm)||(this.cx.customRules.linkedRooms||[]).some((r:any)=>r.target===rm))return;
        const e=this.gET(rm,this.cap[rm]||1); if(e.al)return;
        let c=sp(this.dc[rm]); const isFx=(sn:string)=>(this.cx.customRules.fixed||[]).some((r:any)=>ex(r.staff)===ex(sn));
        let sA=[...this.iaGen].sort((a,b)=>(this.bm.get(a)==='NONE'?0:100)-(this.bm.get(b)==='NONE'?0:100)||this.gPR(a,rm)-this.gPR(b,rm));
        while(c.reduce((s,m)=>s+(PL_SEC.includes(ex(m))?0:getAmt(m)),0)<e.cap){
          const fs=sA.find(s=>{if(this.ac[s]>=1||(this.ac[s]===0.5&&(!["CT","MRI","治療","RI"].includes(rm)||!isMonthlyMainStaff(rm,s,this.cx.monthlyAssign))))return false; if(this.iFb(s,rm)||(rm==="MMG"&&!this.iMC(s))||!this.cAK(s,rm)||this.iHNC(s,rm)||isFx(s))return false; const b=this.bm.get(s); if((e.pC&&b==='AM')||(e.aC&&b==='PM'))return false; return true;});
          if(!fs)break; const b=this.bm.get(fs); let t="",p=1; if(b==='AM'){t="(PM)";p=0.5;}else if(b==='PM'){t="(AM)";p=0.5;}else if(e.pC){t="(AM)";p=0.5;}else if(e.aC){t="(PM)";p=0.5;}
          c.push(`${fs}${t}`); this.aU(fs,p); sA=sA.filter(x=>x!==fs); this.lg(`✅ [配置決定] ${rm} に ${fs}${t}`);
        }
        this.dc[rm]=jn(c);
      });
      return {...this.d,cells:this.dc,logInfo:this.logInfo};
    }

    this.lgP("例外処理");
    (this.cx.customRules.fixed||[]).forEach((r:any)=>{if(!r.staff||!r.section)return; Object.keys(this.dc).forEach(s=>{if(s===r.section||RE_SEC.includes(s))return; const af=sp(this.dc[s]).filter(m=>ex(m)!==ex(r.staff)); if(sp(this.dc[s]).length!==af.length){this.dc[s]=jn(af);this.ac[ex(r.staff)]=0;this.bm.set(ex(r.staff),'NONE');}});});
    [...(this.cx.customRules.fixed||[]),...this.stA].forEach((r:any)=>{const c=ex(r.staff); if(!c||!r.section||!this.iaAll.includes(c)||this.iU(c)||this.iFb(c,r.section)||r.section==="透析後胸部"||this.iHNC(c,r.section)||this.sk.includes(r.section)||sp(this.dc[r.section]).map(ex).includes(c)||this.hNG(c,sp(this.dc[r.section]).map(ex),false))return; const b=this.bm.get(c); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.bm.set(c,'ALL'); this.dc[r.section]=jn([...sp(this.dc[r.section]),`${c}${t}`]); this.aU(c,t?0.5:1); this.lg(`🔒 [専従] ${c} を ${r.section}`);});
    Object.values(this.ra).forEach(ra=>{if(this.sk.includes(ra.section)||ra.section==="透析後胸部")return; const st=sp(this.cx.monthlyAssign[ra.role]||"").map(ex).find(s=>(["受付"].includes(ra.role)?this.iaRec:this.iaGen).includes(s)&&!this.iU(s)&&!this.iFb(s,ra.section)); if(st&&!sp(this.dc[ra.section]).map(ex).includes(st)){const b=this.bm.get(st); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.bm.set(st,'ALL'); this.dc[ra.section]=jn([...sp(this.dc[ra.section]),`${st}${t}`]); this.aU(st,t?0.5:1); this.lg(`📌 [緊急役割] ${st} を ${ra.section}`);}});
    (this.cx.customRules.substitutes||[]).forEach((su:any)=>{const ts=sp(su.target).map(ex); if(!ts.length||!su.section||this.sk.includes(su.section)||su.section==="透析後胸部"||ts.some(t=>sp(this.dc[su.section]).map(ex).includes(t))||!ts.every(t=>!this.iaAll.includes(t)))return; const fs=sp(su.subs).map(ex).filter(s=>this.iaGen.includes(s)&&!this.iU(s)&&!this.iFb(s,su.section)); if(fs.length>0){const cm=sp(this.dc[su.section]); for(const f of fs){if(this.iHB(f,su.section).h||this.hNG(f,cm.map(ex),false)||!this.cAK(f,su.section))continue; const b=this.bm.get(f); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.bm.set(f,'ALL'); this.dc[su.section]=jn([...cm,`${f}${t}`]); this.aU(f,t?0.5:1); this.lg(`🔄 [代打] ${f} を ${su.section}`); break;}}});
    (this.cx.customRules.pushOuts||[]).forEach((po:any)=>{const s1=ex(po.s1||po.triggerStaff), s2=ex(po.s2||po.targetStaff), tS=po.triggerSection; if(!s1||!s2||!tS||!po.targetSections||!this.iaGen.includes(s1)||!this.iaGen.includes(s2)||!sp(this.dc[tS]).map(ex).includes(s1)||!sp(this.dc[tS]).map(ex).includes(s2))return; for(const rm of sp(po.targetSections).filter(s=>!this.sk.includes(s)&&s!=="透析後胸部")){if(this.iFb(s2,rm)||this.iHB(s2,rm).h||this.hNG(s2,sp(this.dc[rm]).map(ex),false)||!this.cAK(s2,rm))continue; if(sp(this.dc[rm]).reduce((a,m)=>a+(PL_SEC.includes(ex(m))?0:getAmt(m)),0)<(this.cap[rm]??(["CT","MRI","治療"].includes(rm)?3:1))){this.dc[tS]=jn(sp(this.dc[tS]).filter(m=>ex(m)!==s2)); const b=this.bm.get(s2); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.dc[rm]=jn([...sp(this.dc[rm]),`${s2}${t}`]); this.aU(s2,t?0.5:1); this.bm.set(s2,t===""?'ALL':t==="(AM)"?'PM':'AM'); this.lg(`🎱 [玉突き] ${s2} を ${rm}`); break;}}});

    this.lgP("メイン配置");
    const LTR=(this.cx.customRules.linkedRooms||[]).map((r:any)=>r.target);
    (this.cx.customRules.priorityRooms||DEFAULT_PRIORITY_ROOMS).forEach((rm:string)=>{
      if(this.sk.includes(rm)||["受付ヘルプ","昼当番","待機","透析後胸部"].includes(rm))return;
      let tC=this.cap[rm]!==undefined?this.cap[rm]:(["CT","MRI","治療"].includes(rm)?3:1);
      let cM=sp(this.dc[rm]); const ph=cM.filter(m=>PL_SEC.includes(ex(m))); if(ph.length>0){tC+=ph.length; this.dc[rm]=jn(cM.filter(m=>!PL_SEC.includes(ex(m))));}
      if(rm==="受付"){
        let cU=sp(this.dc["受付"]); sp(this.cx.monthlyAssign.受付).map(ex).forEach(n=>{if(this.iaAll.includes(n)&&!this.iU(n)&&!cU.map(ex).includes(n)){const b=this.bm.get(n);if(b==='ALL')return;let t=b==='AM'?"(PM)":b==='PM'?"(AM)":"";cU.push(`${n}${t}`);this.aU(n,t?0.5:1);this.bm.set(n,'ALL');}});
        let nU=tC-cU.reduce((s,m)=>s+getAmt(m),0); if(nU>0&&!LTR.includes(rm)){this.pk(this.iaRec,this.iaRec,Math.ceil(nU),"受付",cU).forEach(n=>{const b=this.bm.get(n);let t=b==='AM'?"(PM)":b==='PM'?"(AM)":"";cU.push(`${n}${t}`);this.aU(n,t?0.5:1);this.bm.set(n,'ALL');});} this.dc["受付"]=jn(cU);
      } else {
        let pL=(["治療","RI","CT","MRI","MMG"].includes(rm)?getMonthlyStaffForSection(rm,this.cx.monthlyAssign):sp(this.cx.monthlyAssign[rm]).map(ex)).filter(s=>this.iaGen.includes(s));
        if(!LTR.includes(rm)&&!(this.cx.customRules.kenmuPairs||[]).filter((p:any)=>p.s1===rm||p.s2===rm).map((p:any)=>p.s1===rm?p.s2:p.s1).some(pr=>sp(this.dc[pr]).reduce((s,m)=>s+getAmt(m),0)>0)){ this.fill(["治療","RI","MMG"].includes(rm)&&pL.length>0?pL:this.iaGen, rm, pL, tC); }
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
      const gFR=(n:string):RejectReason|null=>{if(cur.map(ex).includes(n))return{hard:true,msg:"配置済"}; if(this.iU(n))return{hard:true,msg:"他業務"}; if(this.iFb(n,sec))return{hard:true,msg:"不可"}; if(sec==="MMG"&&!this.iMC(n))return{hard:true,msg:"MMG外"}; if(!this.cAK(n,sec))return{hard:true,msg:"上限"}; const b=this.bm.get(n); if(nT&&b==='NONE'&&!e.pC&&!e.aC&&!isMonthlyMainStaff(sec,n,this.cx.monthlyAssign))return{hard:true,msg:"半端"}; if(b==='ALL')return{hard:true,msg:"ALL"}; if(nT==="(AM)"&&b==='AM')return{hard:true,msg:"AMブ"}; if(nT==="(PM)"&&b==='PM')return{hard:true,msg:"PMブ"}; if(e.pC&&b==='AM')return{hard:true,msg:"午後休AM不可"}; if(e.aC&&b==='PM')return{hard:true,msg:"午前休PM不可"}; if(this.iFDO(sec)&&(nT!==""||b!=='NONE'))return{hard:true,msg:"終日専任"}; if(this.iHB(n,sec).h)return{hard:true,msg:"終日"}; if(this.iHNC(n,sec))return{hard:false,msg:"連日"}; if(this.hNG(n,cur.map(ex),false))return{hard:true,msg:"NG"}; if(this.hNG(n,cur.map(ex),true))return{hard:false,msg:"NG軟"}; return null;};
      let vN=avL.filter(n=>!gFR(n)); let fM=""; if(vN.length===0){const sC=avL.filter(n=>{const r=gFR(n);return r&&!r.hard;}); if(sC.length>0){vN=sC;fM="（特例）";}else break;}
      const stC=(cands:string[])=>{let ms=sp(this.cx.monthlyAssign[sec]).map(ex), sps=sp(this.cx.monthlyAssign[sec+"サブ優先"]).map(ex), ss=sp(this.cx.monthlyAssign[sec+"サブ"]).map(ex); const hA=vN.some(s=>this.bm.get(s)==='PM'), hP=vN.some(s=>this.bm.get(s)==='AM'); return [...cands].sort((a,b)=>{const bA=this.bm.get(a),bB=this.bm.get(b); let sA=0,sB=0; if(ms.includes(a))sA+=10000;else if(sps.includes(a))sA+=5000;else if(ss.includes(a))sA+=2000; if(ms.includes(b))sB+=10000;else if(sps.includes(b))sB+=5000;else if(ss.includes(b))sB+=2000; if(this.iHB(a,sec).monthlyHalfException)sA-=3000; if(this.iHB(b,sec).monthlyHalfException)sB-=3000; const rw=["MRI","CT"].includes(sec)?200:100; sA-=(this.rc[a]?.[sec]||0)*rw; sB-=(this.rc[b]?.[sec]||0)*rw; if(this.iHNC(a,sec))sA-=500; if(this.iHNC(b,sec))sB-=500; if(sec==="ポータブル"){sA-=1000*this.gPR(a,sec);sB-=1000*this.gPR(b,sec);} if(nT===""){if(bA==='NONE')sA+=200;else if(hA&&hP&&(bA==='AM'||bA==='PM'))sA+=100;}else{if(nT==="(AM)"&&bA==='PM')sA+=200;if(nT==="(PM)"&&bA==='AM')sA+=200;if(bA==='NONE')sA+=100;} if(nT===""){if(bB==='NONE')sB+=200;else if(hA&&hP&&(bB==='AM'||bB==='PM'))sB+=100;}else{if(nT==="(AM)"&&bB==='PM')sB+=200;if(nT==="(PM)"&&bB==='AM')sB+=200;if(bB==='NONE')sB+=100;} return sB-sA||(this.ac[a]||0)-(this.ac[b]||0)||a.localeCompare(b,'ja');});};
      const pC=this.pk(vN,[...stC(vN.filter(n=>pL.includes(n))),...stC(vN.filter(n=>!pL.includes(n)))],1,sec,cur.map(ex)); if(!pC.length)break;
      const c=pC[0], b=this.bm.get(c); let t="", f=1; if(b==='AM'){t="(PM)";f=0.5;this.bm.set(c,'ALL');}else if(b==='PM'){t="(AM)";f=0.5;this.bm.set(c,'ALL');}else{if(nT){t=nT;f=0.5;this.bm.set(c,nT==="(AM)"?'AM':'PM');}else{this.bm.set(c,'ALL');}}
      cur.push(`${c}${t}`); this.aU(c,f); this.lg(`✅ [配置] ${sec} に ${c}${t} ${fM}`);
    }
    this.dc[sec]=jn(cur);
  }

  processPostTasks() {
    const sSL=sp(this.cx.customRules.supportStaffList).map(ex);
    this.iaSup.forEach(st=>{if(this.iU(st))return; let as=false; for(const rm of sp(this.cx.customRules.supportTargetRooms)){if(this.sk.includes(rm)||this.iFb(st,rm)||rm==="透析後胸部")continue; let c=sp(this.dc[rm]); if(c.length>0&&!c.map(ex).includes(st)&&!this.hNG(st,c.map(ex),false)&&!this.iHNC(st,rm)){const b=this.bm.get(st);let t=b==='AM'?"(PM)":b==='PM'?"(AM)":"";this.dc[rm]=jn([...c,`${st}${t}`]);this.aU(st,t?0.5:1);this.bm.set(st,'ALL');as=true;break;}} if(!as){for(const rm of sp(this.cx.customRules.supportTargetRooms)){if(this.sk.includes(rm)||this.iFb(st,rm)||rm==="透析後胸部")continue; if(!sp(this.dc[rm]).length&&!this.iHNC(st,rm)&&this.cAK(st,rm)){const b=this.bm.get(st);let t=b==='AM'?"(PM)":b==='PM'?"(AM)":"";this.dc[rm]=`${st}${t}`;this.aU(st,t?0.5:1);this.bm.set(st,'ALL');break;}}}});
    
    (this.cx.customRules.swapRules||[]).forEach((r:any)=>{
      if(!r.targetRoom||!r.triggerRoom||!r.sourceRooms||r.targetRoom==="透析後胸部"||r.triggerRoom==="透析後胸部")return;
      const tC=this.cap[r.targetRoom]??(["CT","MRI","治療"].includes(r.targetRoom)?3:1); if(sp(this.dc[r.targetRoom]).reduce((s,m)=>s+getAmt(m),0)>=tC)return;
      const tM=sp(this.dc[r.triggerRoom]); if(!tM.length)return;
      if(!tM.some(m=>{const c=ex(m);return !PL_SEC.includes(c)&&!this.iFb(c,r.targetRoom)&&!this.iHNC(c,r.targetRoom)&&!this.iHB(c,r.targetRoom).h&&this.cAK(c,r.targetRoom,true);})){
        let sw=false;
        for(const sSR of sp(r.sourceRooms).sort((a,b)=>this.gRSc(prC(a).r,r.targetRoom)-this.gRSc(prC(b).r,r.targetRoom))){
          const {r:sR}=prC(sSR); if(sR===r.triggerRoom||sR==="透析後胸部")continue;
          const sM=sp(this.dc[sR]);
          let sC=sM.filter(m=>!PL_SEC.includes(ex(m))&&!this.iFb(ex(m),r.targetRoom)&&!this.iHB(ex(m),r.targetRoom).h&&!this.iHNC(ex(m),r.targetRoom)&&this.cAK(ex(m),r.targetRoom,true)&&!this.iFb(ex(m),r.triggerRoom)&&!(this.iFDO(r.targetRoom)&&(m.includes("(AM)")||m.includes("(PM)"))));
          sC.sort((a,b)=>this.gTR(ex(a))-this.gTR(ex(b))||this.gPR(ex(a),r.targetRoom)-this.gPR(ex(b),r.targetRoom));
          for(const sm of sC){const sCo=ex(sm); const tTK=tM.find(m=>!this.iFb(ex(m),sR)&&!this.iHB(ex(m),sR).h&&!this.hNG(ex(m),sM.map(ex),false)&&this.cAK(ex(m),sR,true)); if(tTK&&this.cAK(sCo,r.targetRoom,true)){this.dc[r.triggerRoom]=jn(tM.map(m=>m===tTK?m.replace(ex(tTK),sCo):m)); this.dc[sR]=jn(sM.map(m=>m===sm?m.replace(sCo,ex(tTK)):m)); this.lg(`🔄 [玉突き] ${r.triggerRoom}の${ex(tTK)}と ${sR}の${sCo}を交換`); sw=true; break;}}
          if(sw)break;
        }
      }
    });

    let uG1=this.iaGen.filter(s=>!this.iU(s)&&this.bm.get(s)!=='ALL');
    (this.cx.customRules.linkedRooms||[]).forEach((r:any)=>{
      if(!r.target||this.sk.includes(r.target)||r.target==="透析後胸部")return; const tC=this.cap[r.target]??(["CT","MRI","治療"].includes(r.target)?3:1); const e=this.gET(r.target,tC); if(e.al)return;
      let cM=sp(this.dc[r.target]); let cA=0,cP=0; cM.forEach(x=>{if(x.includes("(AM)"))cA++;else if(x.includes("(PM)"))cP++;else{cA++;cP++;}});
      if(cM.length>0&&cM.every(m=>sSL.includes(ex(m)))){cA=0;cP=0;}
      uG1.sort((a,b)=>this.gTR(a)-this.gTR(b)||this.gPR(a,r.target)-this.gPR(b,r.target));
      while((cA<tC||cP<tC)&&uG1.length>0){const ci=uG1.findIndex(s=>!this.iFb(s,r.target)&&!this.iHB(s,r.target).h&&!this.hNG(s,cM.map(ex),false)&&!this.iHNC(s,r.target)&&!(r.target==="MMG"&&!this.iMC(s))&&this.cAK(s,r.target)&&!(cP>=tC&&this.bm.get(s)==='AM')&&!(cA>=tC&&this.bm.get(s)==='PM')&&!(this.iFDO(r.target)&&this.bm.get(s)!=='NONE')); if(ci===-1)break; const st=uG1[ci]; uG1.splice(ci,1); const b=this.bm.get(st); let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; if(!t){if(cA>=tC)t="(PM)";else if(cP>=tC)t="(AM)";} this.bm.set(st,t===""?'ALL':t==="(AM)"?'PM':'AM'); cM.push(`${st}${t}`); if(t==="(AM)")cA++;else if(t==="(PM)")cP++;else{cA++;cP++;} this.aU(st,t?0.5:1); this.lg(`🙌 [負担軽減] 余剰 ${st} を ${r.target}`);}
      this.dc[r.target]=jn(cM);
    });

    (this.cx.customRules.smartKenmu||[]).forEach((r:any)=>{
      if(!r.targetRoom||this.sk.includes(r.targetRoom)||r.targetRoom==="透析後胸部")return; const tM=sp(this.dc[r.targetRoom]); if(!tM.length)return;
      for(const tm of tM){const tc=ex(tm); if(PL_SEC.includes(tc))continue; if(!RM_SEC.some(rm=>rm!==r.targetRoom&&sp(this.dc[rm]).map(ex).includes(tc))){
        let sC:string|null=null, fSR:string|null=null;
        for(const sSR of sp(r.sourceRooms)){const{r:sR,min}=prC(sSR); const sMs=sp(this.dc[sR]); if(sR==="透析後胸部"||(min>0&&sMs.reduce((s,m)=>s+getAmt(m),0)<min)||this.iFb(tc,sR)||this.iHB(tc,sR).h||!this.cAK(tc,sR,true))continue;
          let cnds=sMs.filter(m=>{const c=ex(m);return c!==tc&&!PL_SEC.includes(c)&&!this.iFb(c,r.targetRoom)&&!this.hNG(c,tM.map(ex),false)&&!this.iHNC(c,r.targetRoom)&&(r.targetRoom==="MMG"?this.iMC(c):true)&&this.cAK(c,r.targetRoom)&&!(this.iFDO(r.targetRoom)&&(m.includes("(AM)")||m.includes("(PM)")));});
          cnds.sort((a,b)=>this.gTR(ex(a))-this.gTR(ex(b))||this.gPR(ex(a),r.targetRoom)-this.gPR(ex(b),r.targetRoom));
          if(cnds.length>0){sC=cnds[0]; fSR=sR; break;}
        }
        if(sC&&fSR){const cc=ex(sC); this.dc[fSR]=jn([...sp(this.dc[fSR]).filter(m=>m!==sC),`${tc}${tm.includes("(AM)")?"(AM)":tm.includes("(PM)")?"(PM)":""}`]); this.dc[r.targetRoom]=jn(tM.map(m=>m===tm?sC:m) as string[]); this.aU(cc,getAmt(sC)); this.bm.set(tc,tm.includes("(AM)")?'PM':tm.includes("(PM)")?'AM':'ALL'); break;}
      }}
    });

    const pK=(sm:string[], tm:string[], tr:string)=>{if(tr==="透析後胸部")return tm; const tC=this.cap[tr]||1; const tcs=tm.map(ex); let cA=tm.reduce((s,m)=>s+getAmt(m),0); for(const m of sm){if(cA>=tC)break; const c=ex(m); if(tcs.includes(c)||m.includes("17:")||m.includes("19:")||this.iFb(c,tr)||this.iHNC(c,tr)||this.iHB(c,tr).h||this.hNG(c,tcs,false)||!this.cAK(c,tr)||(this.iFDO(tr)&&(m.includes("(AM)")||m.includes("(PM)"))))continue; let pS=m, cam=0, cpm=0; tm.forEach(x=>{if(x.includes("(AM)"))cam++;else if(x.includes("(PM)"))cpm++;else{cam++;cpm++;}}); if(cam<tC&&cpm>=tC){if(m.includes("(PM)"))continue;pS=`${c}(AM)`;}else if(cam>=tC&&cpm<tC){if(m.includes("(AM)"))continue;pS=`${c}(PM)`;} tm.push(pS); tcs.push(c); const a=getAmt(pS); cA+=a; this.aU(c,a); this.uBM(c,pS);} return tm;};
    (this.cx.customRules.kenmuPairs||[]).forEach((p:any)=>{if(!p.s1||!p.s2||p.s1==="透析後胸部"||p.s2==="透析後胸部")return; let m1=sp(this.dc[p.s1]), m2=sp(this.dc[p.s2]); this.dc[p.s2]=jn(pK(m1,m2,p.s2)); m2=sp(this.dc[p.s2]); this.dc[p.s1]=jn(pK(m2,m1,p.s1));});

    (this.cx.customRules.linkedRooms||[]).forEach((r:any)=>{
      if(!r.target||this.sk.includes(r.target)||r.target==="透析後胸部")return; const tC=this.cap[r.target]??(["CT","MRI","治療"].includes(r.target)?3:1); const e=this.gET(r.target,tC); if(e.al)return;
      let cM=sp(this.dc[r.target]); let cA=0,cP=0; cM.forEach(x=>{if(x.includes("(AM)"))cA++;else if(x.includes("(PM)"))cP++;else{cA++;cP++;}});
      for(const sSR of sp(r.sources)){if(cA>=tC&&cP>=tC)break; const {r:sR,min}=prC(sSR); if(sR==="透析後胸部"||(min>0&&sp(this.dc[sR]).reduce((s,m)=>s+getAmt(m),0)<min))continue;
        sp(this.dc[sR]).forEach(m=>{if(cA>=tC&&cP>=tC)return; const c=ex(m); if(!PL_SEC.includes(c)&&!cM.map(ex).includes(c)&&!this.iFb(c,r.target)&&!this.iHB(c,r.target).h&&!this.hNG(c,cM.map(ex),false)&&!this.iHNC(c,r.target)&&(r.target==="MMG"?this.iMC(c):true)&&this.cAK(c,r.target,true)&&!m.includes("17:")&&!m.includes("19:")&&!(this.iFDO(r.target)&&(m.includes("(AM)")||m.includes("(PM)")))){let pS=m; if(r.target==="パノラマCT"&&sR==="透視（6号）"){if(m.includes("(PM)"))return; pS=`${c}(AM)`;}else{if(cA<tC&&cP>=tC){if(m.includes("(PM)"))return; pS=`${c}(AM)`;}else if(cA>=tC&&cP<tC){if(m.includes("(AM)"))return; pS=`${c}(PM)`;}else if(e.pC){if(m.includes("(PM)"))return; pS=`${c}(AM)`;}else if(e.aC){if(m.includes("(AM)"))return; pS=`${c}(PM)`;}} cM.push(pS); if(pS.includes("(AM)"))cA++;else if(pS.includes("(PM)"))cP++;else{cA++;cP++;} this.aU(c,getAmt(pS)); this.uBM(c,pS); this.lg(`🔗 [基本兼務] ${sR} の ${pS} を ${r.target}`);}});
      }
      this.dc[r.target]=jn(cM);
    });

    RM_SEC.forEach(tR=>{
      if(this.cl.includes(tR)||["待機","昼当番","受付","受付ヘルプ","透析後胸部"].includes(tR))return; const tC=this.cap[tR]??(["CT","MRI","治療"].includes(tR)?3:1); const e=this.gET(tR,tC); if(e.al)return;
      let cM=sp(this.dc[tR]); let cA=e.aC?999:0, cP=e.pC?999:0; cM.forEach(x=>{if(x.includes("(AM)"))cA++;else if(x.includes("(PM)"))cP++;else{cA++;cP++;}}); if(cM.length>0&&cM.every(m=>sSL.includes(ex(m)))){cA=e.aC?999:0;cP=e.pC?999:0;} if(cA>=tC&&cP>=tC)return;
      const mR=(this.cx.customRules.rescueRules||[]).filter((r:any)=>r.targetRoom===tR); let sRms=mR.length>0?mR.flatMap((r:any)=>sp(r.sourceRooms)).sort((a:string,b:string)=>this.gRSc(prC(a).r,tR)-this.gRSc(prC(b).r,tR)):[...sp(this.cx.customRules.supportTargetRoomsLowImpact),"2号室","1号室","5号室","CT(4)"].filter(r=>r!==tR);
      if(sRms.length>0){let cnds:{c:string,fS:string,i:number}[]=[]; sRms.forEach((sS:string,i:number)=>{const{r:sR,min}=prC(sS); if(sR===tR||sR==="透析後胸部"||(min>0&&sp(this.dc[sR]).reduce((s,m)=>s+getAmt(m),0)<min))return; sp(this.dc[sR]).forEach(m=>{const c=ex(m); if(!PL_SEC.includes(c)&&!this.iHNC(c,tR)&&!cnds.some(x=>x.c===c)&&!this.iFb(c,tR)&&!this.iHB(c,tR).h&&!m.includes("17:")&&!(this.iFDO(tR)&&(m.includes("(AM)")||m.includes("(PM)"))))cnds.push({c,fS:m,i});});}); const cCs=cM.map(ex); cnds=cnds.filter(c=>!cCs.includes(c.c)&&(tR==="MMG"?this.iMC(c.c):true)&&this.cAK(c.c,tR,true)); cnds.sort((a,b)=>this.gTR(a.c)-this.gTR(b.c)||this.gPR(a.c,tR)-this.gPR(b.c,tR)||a.i-b.i||(this.ac[a.c]||0)-(this.ac[b.c]||0)); for(const cn of cnds){if(cA>=tC&&cP>=tC)break; if(this.hNG(cn.c,cCs,false))continue; let pS=cn.fS; if(cA<tC&&cP>=tC){if(cn.fS.includes("(PM)"))continue; pS=`${cn.c}(AM)`;}else if(cA>=tC&&cP<tC){if(cn.fS.includes("(AM)"))continue; pS=`${cn.c}(PM)`;}else if(e.pC){if(cn.fS.includes("(PM)"))continue; pS=`${cn.c}(AM)`;}else if(e.aC){if(cn.fS.includes("(AM)"))continue; pS=`${cn.c}(PM)`;} cM.push(pS); if(pS.includes("(AM)"))cA++;else if(pS.includes("(PM)"))cP++;else{cA++;cP++;} this.aU(cn.c,getAmt(pS)); this.uBM(cn.c,pS);} this.dc[tR]=jn(cM);}
    });

    (this.cx.customRules.emergencies||[]).forEach((em:any)=>{
      if(em.type!=="empty_room_swap")return; const wR=em.section; const sRL=sp(em.sourceRooms||em.sourceRoom); if(!wR||!sRL.length||this.sk.includes(wR)||wR==="透析後胸部")return; const wC=this.cap[wR]??1; if(sp(this.dc[wR]).reduce((s,m)=>s+getAmt(m),0)>=wC)return;
      let sw=false; for(const sF of sRL){if(sw||sF==="透析後胸部")break; const sM=sp(this.dc[sF]); if(!sM.length)continue; const ngI=sM.filter(m=>{const c=ex(m);return !PL_SEC.includes(c)&&(this.iFb(c,wR)||!this.cAK(c,wR,true));}); if(!ngI.length)continue; for(const src of RM_SEC.filter(r=>r!==wR&&r!==sF&&!this.sk.includes(r)&&!["待機","昼当番","受付","受付ヘルプ","透析後胸部"].includes(r))){if(sw)break; const rM=sp(this.dc[src]); const oC=rM.filter(m=>{const c=ex(m);return !PL_SEC.includes(c)&&!this.iFb(c,wR)&&!this.iFb(c,sF)&&!this.iHB(c,wR).h&&!this.iHNC(c,wR)&&this.cAK(c,wR,true)&&!m.includes("17:")&&!m.includes("19:")&&!(this.iFDO(wR)&&(m.includes("(AM)")||m.includes("(PM)")));}); for(const om of oC){const oc=ex(om); const km=ngI.find(m=>{const c=ex(m);return !this.iFb(c,src)&&!this.iHB(c,src).h&&!this.hNG(c,rM.map(ex),false)&&this.cAK(c,src,true);}); if(!km)continue; const kc=ex(km); this.dc[sF]=jn(sM.map(m=>m===km?m.replace(kc,oc):m)); this.dc[src]=jn(rM.map(m=>m===om?m.replace(oc,kc):m)); sw=true; break;}}}
    });

    (this.cx.customRules.lateShifts||[]).forEach((r:any)=>{let c=sp(this.dc[r.section]); if(c.length>0&&!c.some(m=>m.includes("17:")||m.includes("18:"))){const cC=c.map(ex); const pL=this.pd?sp(this.pd.cells[r.section]).filter(m=>m.includes("17:")||m.includes("18:")||m.includes("19:")||m.includes("22:")).map(ex):[]; const exS=Array.from(new Set([...sp(this.cx.customRules.noLateShiftStaff).map(ex),...sp(this.cx.customRules.noLateShiftRooms).flatMap(rm=>sp(this.dc[rm]).map(ex))])); const fM=sp(this.dc["不在"]); const cnd=this.iaGen.filter(n=>!cC.includes(n)&&!this.iFb(n,r.section)&&!exS.includes(n)&&!fM.some(m=>ex(m)===n)); cnd.sort((a,b)=>{let sA=this.getPastLateShiftCount(a)*100, sB=this.getPastLateShiftCount(b)*100; const iA=lowPriorityStaff.indexOf(a), iB=lowPriorityStaff.indexOf(b); if(iA!==-1)sA+=100000+((lowPriorityStaff.length-iA)*10000); if(iB!==-1)sB+=100000+((lowPriorityStaff.length-iB)*10000); return sA-sB||a.localeCompare(b,'ja');}); let pk=cnd.find(n=>!pL.includes(n))||(cnd.length?cnd[0]:null); if(pk){c.push(`${pk}${r.lateTime}`); this.bm.set(pk,this.bm.get(pk)==='AM'?'ALL':'PM'); this.dc[r.section]=jn(c);}}});

    const pM=sp(this.dc["ポータブル"]), r2M=sp(this.dc["2号室"]), r2C=r2M.map(ex), r2A=r2M.reduce((s,m)=>s+(PL_SEC.includes(ex(m))?0:getAmt(m)),0);
    let nAH=false, nPH=false; r2M.forEach(rm=>{const c=ex(rm); const pm=pM.find(x=>ex(x)===c); if(pm){if(pm.includes("(AM)"))nAH=true; else if(pm.includes("(PM)"))nPH=true; else{nAH=true;nPH=true;}}});
    if(r2A<2&&(nAH||nPH)){
      const fC=(iA:boolean,exS:string[])=>[...sSL,...this.iaGen].filter((s,i,a)=>a.indexOf(s)===i).find(s=>{if(r2C.includes(s)||this.iFb(s,"2号室")||this.iHB(s,"2号室").h||this.hNG(s,r2C,false)||!this.cAK(s,"2号室")||this.iHNC(s,"2号室"))return false; const b=this.bm.get(s); if(b==='ALL'||(iA&&b==='AM')||(!iA&&b==='PM'))return false; if(exS.some(r=>sp(this.dc[r]).map(ex).includes(s)))return false; return true;});
      if(nAH){let p=fC(true,["1号室","5号室"])??fC(true,[]); if(p){this.dc["2号室"]=jn([...sp(this.dc["2号室"]),`${p}(AM)`]); this.aU(p,0.5); this.bm.set(p,this.bm.get(p)==='PM'?'ALL':'AM'); this.lg(`🤝 [ポータブル特例] 2号室兼務(AM)のため ${p}`);}}
      if(nPH){let p=fC(false,["1号室","5号室"])??fC(false,[]); if(p){this.dc["2号室"]=jn([...sp(this.dc["2号室"]),`${p}(PM)`]); this.addU(p,0.5); this.bm.set(p,this.bm.get(p)==='AM'?'ALL':'PM'); this.lg(`🤝 [ポータブル特例] 2号室兼務(PM)のため ${p}`);}}
    }

    const pL=this.cx.customRules.priorityRooms||DEFAULT_PRIORITY_ROOMS;
    const dKT=RM_SEC.filter(r=>!["CT","MRI","治療","RI","待機","昼当番","受付","受付ヘルプ","透析後胸部"].includes(r)).sort((a,b)=>{let iA=pL.indexOf(a);if(iA===-1)iA=999;let iB=pL.indexOf(b);if(iB===-1)iB=999;return iB-iA;});
    const rP=[...RM_SEC].sort((a,b)=>{let iA=pL.indexOf(a);if(iA===-1)iA=999;let iB=pL.indexOf(b);if(iB===-1)iB=999;return iB-iA;});
    
    let uG2=this.iaGen.filter(s=>!this.iU(s)&&this.bm.get(s)!=='ALL');
    uG2.forEach(st=>{
      const b=this.bm.get(st); if(b==='ALL')return; let t=b==='AM'?"(PM)":b==='PM'?"(AM)":""; let asg=false;
      for(const rm of dKT){
        if(this.sk.includes(rm)||this.iFb(st,rm)||(rm==="MMG"&&!this.iMC(st))||(t!==""&&this.iHB(st,rm).h))continue; const e=this.gET(rm,1); if(e.al||(t==="(PM)"&&e.pC)||(t==="(AM)"&&e.aC))continue;
        let cM=sp(this.dc[rm]); const rI=cM.findIndex(m=>{const c=ex(m); if(PL_SEC.includes(c)||this.hNG(st,cM.filter(x=>x!==m).map(ex),false))return false; const cc=this.gTC(c); if((t==="(AM)"&&cc.a<=1)||(t==="(PM)"&&cc.p<=1)||(t===""&&cc.a<=1&&cc.p<=1))return false; let ca=m.includes("(AM)"),cp=m.includes("(PM)"); if(!ca&&!cp){ca=true;cp=true;} let na=t==="(AM)",np=t==="(PM)"; if(!na&&!np){na=true;np=true;} return (ca&&na)||(cp&&np);});
        if(rI!==-1){const oS=cM[rI], oC=ex(oS); let oR=""; if(t==="(AM)"&&!oS.includes("("))oR=`${oC}(PM)`; else if(t==="(PM)"&&!oS.includes("("))oR=`${oC}(AM)`; cM[rI]=`${st}${t}`; if(oR)cM.push(oR); this.dc[rm]=jn(cM); this.aU(st,t?0.5:1); this.bm.set(st,'ALL'); this.ac[oC]=Math.max(0,(this.ac[oC]||1)-getAmt(oS)); let am=false,pm=false; RM_SEC.forEach(r=>{if(["待機","昼当番","受付","受付ヘルプ"].includes(r))return; sp(this.dc[r]).forEach(m=>{if(ex(m)===oC){if(m.includes("(AM)"))am=true;else if(m.includes("(PM)"))pm=true;else{am=true;pm=true;}}});}); this.bm.set(oC,am&&pm?'ALL':am?'AM':pm?'PM':'NONE'); this.lg(`🪄 [兼務解消] ${st} を専任化し ${oC} 負担軽減`); asg=true; break;}
      }
      if(!asg){for(const rm of rP){if(this.sk.includes(rm)||this.iFb(st,rm)||(rm==="MMG"&&!this.iMC(st))||["待機","昼当番","受付","受付ヘルプ","CT","MRI","治療","RI","透析後胸部"].includes(rm)||(t!==""&&this.iHB(st,rm).h))continue; const aC=this.cap[rm]??(["CT","MRI","治療"].includes(rm)?3:1); const e=this.gET(rm,aC); if(e.al||(t==="(PM)"&&e.pC)||(t==="(AM)"&&e.aC)||!this.cAK(st,rm)||this.iHNC(st,rm)||(this.iFDO(rm)&&(t==="(AM)"||t==="(PM)")))continue; let cM=sp(this.dc[rm]); if(cM.reduce((s,m)=>s+getAmt(m),0)>=e.cap||this.hNG(st,cM.map(ex),false))continue; this.dc[rm]=jn([...cM,`${st}${t}`]); this.aU(st,t?0.5:1); this.bm.set(st,'ALL'); this.lg(`♻️ [余剰配置] 余力のあった ${st} を ${rm}`); asg=true; break;}}
      if(!asg){for(const fbR of ["3号室","2号室","1号室","5号室"]){if(this.sk.includes(fbR)||this.iFb(st,fbR))continue; const e=this.gET(fbR,1); if(e.al||(t==="(PM)"&&e.pC)||(t==="(AM)"&&e.aC)||this.iHNC(st,fbR)||(this.iFDO(fbR)&&(t==="(AM)"||t==="(PM)")))continue; let cM=sp(this.dc[fbR]); if(this.hNG(st,cM.map(ex),false))continue; this.dc[fbR]=jn([...cM,`${st}${t}`]); this.aU(st,t?0.5:1); this.bm.set(st,'ALL'); this.lg(`🚨 [最終救済] 未配置を防ぐため ${st} を ${fbR}`); asg=true; break;}}
    });

    this.logPhase("仕上げ");
    if(!this.sk.includes("昼当番")){
      let cL=sp(this.dc["昼当番"]); let lT=this.cx.customRules.lunchBaseCount??3; const dC=this.d.label.match(/\((.*?)\)/)?.[1]; if(dC){const sd=(this.cx.customRules.lunchSpecialDays||[]).find((x:any)=>x.day===dC); if(sd)lT=Number(sd.count);}
      (this.cx.customRules.lunchRoleRules||[]).forEach((r:any)=>{if(r.day==="毎日"||r.day===dC){const rS=sp(this.cx.monthlyAssign[r.role]).map(ex), tM=sp(this.dc[r.role]).map(ex); let sl:string|null=null; for(const s of sp(r.sourceRooms)){const{r:sR,min}=prC(s); const rM=sp(this.dc[sR]), rq=min>0?min:(this.cap[sR]||1); if(rM.reduce((su,m)=>su+getAmt(m),0)>=rq){sl=rM.map(ex).find(n=>rS.includes(n)&&!tM.includes(n)&&!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false))||null;} if(sl)break;} if(!sl)sl=tM.find(n=>!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false))||null; if(sl&&!cL.includes(sl)&&cL.length<lT)cL.push(sl);}});
      sp(this.dc["RI"]).map(ex).forEach(n=>{if(!cL.includes(n)&&cL.length<lT&&!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false))cL.push(n);});
      sp(this.cx.customRules.lunchPrioritySections??"RI,1号室,2号室,3号室,5号室,CT").forEach(sc=>sp(this.dc[sc]).forEach(n=>{const c=ex(n);if(!cL.includes(c)&&cL.length<lT&&!this.iFb(c,"昼当番")&&!this.hNG(c,cL,false))cL.push(c);}));
      if(cL.length<lT){(this.cx.customRules.lunchConditional||[]).forEach((co:any)=>{const sM=sp(this.dc[co.section]); if(sM.length>=Number(co.min)){let p=0; for(const n of sM){if(p>=Number(co.out)||cL.length>=lT)break; const c=ex(n); if(!cL.includes(c)&&!this.iFb(c,"昼当番")&&!this.hNG(c,cL,false)){cL.push(c);p++;}}}});}
      if(cL.length<lT){const lrM:string[]=[]; sp(this.cx.customRules.lunchLastResortSections??"治療").forEach(sc=>sp(this.dc[sc]).forEach(n=>lrM.push(ex(n)))); this.iaGen.filter(n=>!lrM.includes(n)&&!cL.includes(n)&&!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false)).forEach(n=>{if(cL.length<lT)cL.push(n);}); this.iaGen.filter(n=>lrM.includes(n)&&!cL.includes(n)&&!this.iFb(n,"昼当番")&&!this.hNG(n,cL,false)).forEach(n=>{if(cL.length<lT)cL.push(n);});}
      this.dc["昼当番"]=jn(cL.slice(0,lT));
    }
    const uT=this.cap.受付!==undefined?this.cap.受付:2;
    if(sp(this.dc["受付"]).reduce((s,m)=>s+getAmt(m),0)<uT&&!this.sk.includes("受付ヘルプ")){let hm=sp(this.dc["受付ヘルプ"]); if(hm.length===0){const lC=sp(this.dc["昼当番"]).map(ex); const gH=(ex:string[])=>{let c=this.iaGen.filter(n=>!ex.includes(n)&&!hm.map(ex).includes(n)&&!this.iFb(n,"受付ヘルプ")&&!this.hNG(n,hm.map(ex),false)); if(c.length>0){c.sort((a,b)=>(this.ac[a]||0)-(this.ac[b]||0));return c[0];}return null;}; const lH=gH(lC); if(lH)hm.push(`${lH}(12:15〜13:00)`); const vK=sp(this.dc["検像"]).map(ex).filter(n=>this.bm.get(n)!=='AM'&&!hm.map(ex).includes(n)&&!this.iFb(n,"受付ヘルプ")&&!this.hNG(n,hm.map(ex),false)); let p16=vK.length>0?vK[0]:null; if(!p16)p16=gH(lH?[lH]:[]); if(p16)hm.push(`${p16}(16:00〜)`);} this.dc["受付ヘルプ"]=jn(hm);}
  }
}
// ----------------- 前半コード ここまで -----------------
