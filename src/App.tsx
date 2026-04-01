import React, { useEffect, useMemo, useState, useRef } from "react";

// ===================== 🌟 CSS & Styles =====================
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  html, body, #root { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
  body { background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.02em; font-size: 15px; overflow-x: hidden; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  textarea:focus, select:focus, input:focus { outline: 3px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 8px center; background-size: 1.2em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; padding-right: 32px !important; }
  details > summary { list-style: none; cursor: pointer; transition: color 0.2s; outline: none; }
  details > summary:hover { color: #0d9488; }
  details > summary::-webkit-details-marker { display: none; }
  
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; }
  .sticky-table-header th { position: sticky; top: 0; z-index: 20; background: #f8fafc; box-shadow: 0 2px 4px -1px rgba(0,0,0,0.05); }
  .sticky-header-panel { position: sticky; top: 0; z-index: 30; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); padding-top: 16px; margin-top: -16px; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1); }
  
  .calendar-row { transition: background-color 0.2s; cursor: pointer; }
  .calendar-row:hover { background-color: #f1f5f9 !important; }
  .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important; }
  .btn-hover:active { transform: translateY(0); box-shadow: none !important; }
  .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; cursor: pointer; }
  .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  
  .rule-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center; width: 100%; }
  .rule-sel { padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; flex: 1 1 120px; font-size: 14px; transition: border-color 0.2s; }
  .rule-num { width: 60px; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 14px; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 20px; flex-shrink: 0; padding: 0 8px; transition: 0.2s; }
  .rule-del:hover { background: #fee2e2; border-radius: 6px; }
  .rule-add { background: #fff; color: #4f46e5; border: 2px dashed #a5b4fc; padding: 10px 16px; font-size: 15px; width: 100%; display: flex; justify-content: center; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 12px; transition: all 0.2s; }
  .rule-add:hover { background: #e0e7ff; border-color: #4f46e5; }
  .rule-label { font-size: 14px; font-weight: 700; color: #64748b; flex-shrink: 0; }
  
  .tabs-header { display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; padding: 0 12px; flex-wrap: wrap; }
  .tab-btn { background: none; border: none; padding: 12px 20px; font-size: 16px; font-weight: 800; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: 0.2s; }
  .tab-btn:hover { color: #3b82f6; }
  .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
  
  .name-textarea { width: 100%; height: 120px; padding: 12px; font-size: 14px !important; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 600; line-height: 1.5; }
  .name-textarea::placeholder { color: #94a3b8; font-weight: 400; }
  
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  .modal-animate { animation: fadeIn 0.2s ease-out forwards; }
  .modal-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); }
  .modal-content { background: #fff; padding: 32px; border-radius: 16px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; }
  .modal-wide { max-width: 1000px; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
  .modal-title { margin: 0; font-size: 24px; color: #0f172a; font-weight: 800; }
  .close-btn { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; transition: 0.2s; }
  .close-btn:hover { background: #e2e8f0; }

  @media print {
    body { background: #fff; overflow: visible; font-size: 12pt; } .no-print { display: none !important; }
    .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
    table { width: 100% !important; border-collapse: collapse !important; table-layout: auto; }
    tr { page-break-inside: avoid; }
    th, td { border: 1px solid #000 !important; padding: 6px !important; font-size: 11pt !important; color: #000 !important; position: static !important; max-width: none; word-break: normal; }
  }
`;

// ===================== 🌟 Types & Constants =====================
type RenderGroup = { title: string; color: string; sections: string[] };
type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
type RejectReason = { hard: boolean, msg: string };

interface CustomRules {
  staffList: string; receptionStaffList: string; supportStaffList: string; supportTargetRooms: string; customHolidays: string;
  capacity: Record<string, number>; dailyCapacities: any[]; dailyAdditions: any[]; priorityRooms: string[]; fullDayOnlyRooms: string; noConsecutiveRooms: string; 
  consecutiveAlertRooms: string; noLateShiftStaff: string; noLateShiftRooms: string; ngPairs: any[]; fixed: any[]; forbidden: any[]; substitutes: any[]; pushOuts: any[]; emergencies: any[]; swapRules: any[]; kenmuPairs: any[]; rescueRules: any[]; lateShifts: any[];
  lunchBaseCount: number; lunchSpecialDays: any[]; lunchConditional: any[]; lunchRoleRules: any[]; lunchPrioritySections: string; lunchLastResortSections: string; linkedRooms: any[]; 
  alertMaxKenmu: number; alertEmptyRooms: string; smartKenmu: any[];
}
type AutoAssignContext = { allStaff: string[]; activeGeneralStaff: string[]; activeReceptionStaff: string[]; monthlyAssign: Record<string, string>; customRules: CustomRules; };

const SECTIONS = ["明け","入り","土日休日代休","不在","待機","CT","MRI","RI","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","治療","検像","昼当番","受付","受付ヘルプ"];
const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
const WORK_SECTIONS = SECTIONS.filter(s => !REST_SECTIONS.includes(s));
const ROLE_PLACEHOLDERS = ROOM_SECTIONS.map(s => s + "枠");
const GENERAL_ROOMS = ["1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA", "検像"];
const EXTENDED_ROOM_SECTIONS = [...ROOM_SECTIONS, "CT(4)", "CT(3)", "MRI(3)", "治療(3)"];

const FALLBACK_HOLIDAYS: Record<string, string> = { "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日", "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日" };
const MONTHLY_CATEGORIES = [ { key: "CT", label: "CT" }, { key: "MRI", label: "MRI" }, { key: "治療", label: "治療 (メイン)" }, { key: "治療サブ優先", label: "治療 (サブ優先)" }, { key: "治療サブ", label: "治療 (サブ)" }, { key: "RI", label: "RI (メイン)" }, { key: "RIサブ", label: "RI (サブ)" }, { key: "MMG", label: "MMG" }, { key: "受付", label: "受付" }, { key: "受付ヘルプ", label: "受付ヘルプ" } ];
const DEFAULT_MONTHLY_ASSIGN: Record<string, string> = { CT: "", MRI: "", 治療: "", 治療サブ優先: "", 治療サブ: "", RI: "", RIサブ: "", MMG: "", 受付: "", 受付ヘルプ: "" };
const DEFAULT_PRIORITY_ROOMS = ["治療", "受付", "MMG", "RI", "MRI", "CT", "透視（6号）", "透視（11号）", "1号室", "5号室", "2号室", "骨塩", "ポータブル", "DSA", "検像", "パノラマCT", "3号室", "受付ヘルプ", "透析後胸部"];

const DEFAULT_RULES: CustomRules = { 
  staffList: "", receptionStaffList: "", supportStaffList: "", supportTargetRooms: "2号室, 3号室", customHolidays: "", 
  capacity: { CT: 4, MRI: 3, 治療: 3, RI: 1, MMG: 1, "透視（6号）": 1, "透視（11号）": 1, 骨塩: 1, "1号室": 1, "5号室": 1, パノラマCT: 2 }, 
  dailyCapacities: [], dailyAdditions: [], priorityRooms: DEFAULT_PRIORITY_ROOMS, fullDayOnlyRooms: "", noConsecutiveRooms: "ポータブル", consecutiveAlertRooms: "ポータブル, 透視（6号）",
  noLateShiftStaff: "浅野、木内康、髙橋", noLateShiftRooms: "透視（11号）", ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], 
  swapRules: [{ targetRoom: "ポータブル", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }, { targetRoom: "パノラマCT", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }],
  kenmuPairs: [], rescueRules: [{ targetRoom: "ポータブル", sourceRooms: "3号室、2号室、1号室、5号室、CT(4)" }, { targetRoom: "DSA", sourceRooms: "5号室、2号室、検像、CT(4)" }, { targetRoom: "骨塩", sourceRooms: "1号室、5号室、2号室、CT(4)" }], lateShifts: [], 
  lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], 
  lunchRoleRules: [{ day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" }],
  lunchPrioritySections: "RI, 1号室, 2号室, 3号室, 5号室", lunchLastResortSections: "治療", 
  linkedRooms: [ { target: "ポータブル", sources: "2号室、CT(4)" }, { target: "DSA", sources: "2号室、1号室、5号室" }, { target: "検像", sources: "骨塩" }, { target: "パノラマCT", sources: "透視（6号）、2号室" } ], 
  alertMaxKenmu: 3, alertEmptyRooms: "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像",
  smartKenmu: [{ targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" }]
};

const KEY_ALL_DAYS = "shifto_alldays_v2480"; const KEY_MONTHLY = "shifto_monthly_v2480"; const KEY_RULES = "shifto_rules_v2480";
const pad = (n: number) => String(n).padStart(2, '0');
const TIME_OPTIONS: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h = 8; h <= 19; h++) { for (let m = 0; m < 60; m += 15) { if (h === 8 && m === 0) continue; TIME_OPTIONS.push(`(${h}:${pad(m)}〜)`); TIME_OPTIONS.push(`(〜${h}:${pad(m)})`); } }

const split = (v: string) => (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean);
const join = (a: string[]) => a.filter(Boolean).join("、");
const extractStaffName = (f: string) => f.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
const parseRoomCond = (str: string) => { const m = str.match(/^(.*?)\((\d+)\)$/); return m ? { r: m[1], min: Number(m[2]) } : { r: str, min: 0 }; };

function parseAndSortStaff(staffString: string) {
  const list = split(staffString);
  const parsed = list.map(s => { const match = s.match(/^(.*?)[\(（](.*?)[\)）]$/); return { cleanName: match ? match[1].trim() : s, yomi: match ? match[2].trim() : s }; });
  parsed.sort((a, b) => a.yomi.localeCompare(b.yomi, 'ja')); return Array.from(new Set(parsed.map(p => p.cleanName)));
}

function formatDayForDisplay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }
function getMonthlyStaffForSection(sec: string, monthlyAssign: Record<string, string>): string[] {
  let staff: string[] = [];
  if (sec === "治療") staff = [...split(monthlyAssign.治療), ...split(monthlyAssign.治療サブ優先), ...split(monthlyAssign.治療サブ)];
  else if (sec === "RI") staff = [...split(monthlyAssign.RI), ...split(monthlyAssign.RIサブ)];
  else if (monthlyAssign[sec] !== undefined) staff = split(monthlyAssign[sec]);
  return staff.map(extractStaffName);
}
function isMonthlyMainStaff(section: string, name: string, monthlyAssign: Record<string, string>) { if (!section) return false; return getMonthlyStaffForSection(section, monthlyAssign).includes(name); }
function getStaffAmount(name: string) { if (ROLE_PLACEHOLDERS.includes(extractStaffName(name))) return 0; return (name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/)) ? 0.5 : 1; }

const btnStyle = (bg: string, color: string = "#fff", fontSize: number = 14): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 6 });
const panelStyle = (): React.CSSProperties => ({ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" });
const cellStyle = (isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties => { 
  let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff"); if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff"); 
  return { border: "1px solid #e2e8f0", padding: "10px 12px", background: bg, fontWeight: isHeader ? 700 : 600, textAlign: isHeader ? "center" : "left", fontSize: 15, color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, boxShadow: isSticky ? "2px 0 4px -2px rgba(0,0,0,0.05)" : "none", transition: "background-color 0.2s", lineHeight: 1.6 }; 
};

const RENDER_GROUPS: RenderGroup[] = [
  { title: "休務・夜勤", color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] },
  { title: "モダリティ", color: "#3b82f6", sections: ["CT","MRI","RI","治療"] },
  { title: "一般撮影・透視・その他", color: "#10b981", sections: ["MMG","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","検像","受付","受付ヘルプ","昼当番"] },
  { title: "待機・その他", color: "#f59e0b", sections: ["待機"] } 
];

// ===================== 🌟 UI Component Helpers =====================
const Modal = ({ title, onClose, wide, children }: any) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className={`modal-content modal-animate ${wide ? 'modal-wide' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button onClick={onClose} className="close-btn">✖</button>
      </div>
      {children}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn-hover" onClick={onClose} style={{ ...btnStyle("#2563eb", "#fff", 16), width: "100%", justifyContent: "center", padding: "12px" }}>閉じる</button>
      </div>
    </div>
  </div>
);

const RuleCard = ({ bg, border, color, icon, title, desc, children }: any) => (
  <div style={{ background: bg, padding: 20, borderRadius: 12, border: `2px solid ${border}`, marginBottom: 20 }}>
    <h5 style={{ margin: "0 0 12px 0", color, fontSize: 18, fontWeight: 800 }}>{icon} {title}</h5>
    {desc && <p style={{ fontSize: 14, color: "#475569", marginTop: 0, marginBottom: 16 }}>{desc}</p>}
    {children}
  </div>
);

const MultiPicker = ({ selected, onChange, options, placeholder }: any) => {
  const current = split(selected);
  const handleAdd = (val: string) => { if (val && !current.includes(val)) onChange(join([...current, val])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 8 }}>
      {current.map((item, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 16, padding: "6px 12px", fontSize: 14, fontWeight: 700, border: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: 6 }}>
          <span>{item}</span><span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" onChange={(e: any) => { handleAdd(e.target.value); e.target.value = ""; }} value=""><option value="">{placeholder || "＋追加"}</option>{options.filter((s: string) => !current.includes(s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</select>
    </div>
  );
};

const WeekCalendarPicker = ({ targetMonday, onChange, nationalHolidays, customHolidays }: any) => {
  const [isOpen, setIsOpen] = useState(false); const [viewDate, setViewDate] = useState(new Date(targetMonday));
  useEffect(() => { setViewDate(new Date(targetMonday)); }, [targetMonday]);
  const year = viewDate.getFullYear(); const month = viewDate.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate(); const firstDay = new Date(year, month - 1, 1).getDay();
  const weeks: (number | null)[][] = []; let currentWeek: (number | null)[] = new Array(7).fill(null);
  for (let i = 0; i < firstDay; i++) currentWeek[i] = null;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = (firstDay + d - 1) % 7; currentWeek[dow] = d;
    if (dow === 6 || d === daysInMonth) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); }
  }
  const handleWeekClick = (weekObj: (number|null)[]) => {
    let validDay = weekObj.find(d => d !== null); if (!validDay) return;
    const dObj = new Date(year, month - 1, validDay, 12, 0, 0); const day = dObj.getDay(); const diff = dObj.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(dObj.getTime()); mon.setDate(diff);
    onChange(`${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`); setIsOpen(false);
  };
  return (
    <div style={{ position: "relative" }}>
      <button className="btn-hover" onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff", "#2563eb"), border: "1px solid #bfdbfe", padding: "8px 14px", fontSize: 15 }}>📅 {targetMonday} 週 ▼</button>
      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)}></div>
          <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 12, padding: 20, zIndex: 50, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.15)", minWidth: 320 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button onClick={() => setViewDate(new Date(year, month - 2, 1))} style={{ border: "none", background: "#f1f5f9", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>◀</button>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{year}年 {month}月</div>
              <button onClick={() => setViewDate(new Date(year, month, 1))} style={{ border: "none", background: "#f1f5f9", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>▶</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: 16 }}>
              <thead><tr><th style={{ color: "#ef4444", padding: 8 }}>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th style={{ color: "#3b82f6", padding: 8 }}>土</th></tr></thead>
              <tbody>
                {weeks.map((w, wIdx) => {
                  const isSelectedWeek = w.some(d => { if(!d) return false; const dObj = new Date(year, month - 1, d, 12, 0, 0); const day = dObj.getDay(); const diff = dObj.getDate() - day + (day === 0 ? -6 : 1); const checkMon = new Date(dObj.getTime()); checkMon.setDate(diff); return `${checkMon.getFullYear()}-${pad(checkMon.getMonth()+1)}-${pad(checkMon.getDate())}` === targetMonday; });
                  return (
                    <tr key={wIdx} onClick={() => handleWeekClick(w)} className="calendar-row" style={{ background: isSelectedWeek ? "#eff6ff" : "transparent" }}>
                      {w.map((d, dIdx) => {
                        if (!d) return <td key={dIdx} style={{ padding: 10 }}></td>;
                        const isHoliday = !!(nationalHolidays[`${year}-${pad(month)}-${pad(d)}`] || customHolidays.includes(`${year}-${pad(month)}-${pad(d)}`));
                        let color = "#334155"; if (dIdx === 0 || isHoliday) color = "#ef4444"; else if (dIdx === 6) color = "#3b82f6";
                        return <td key={dIdx} style={{ padding: 10, color, fontWeight: isHoliday ? 800 : 600, position: "relative" }}>{d}{isHoliday && <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, background: "#ef4444", borderRadius: "50%" }}></div>}</td>;
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const SectionEditor = ({ section, value, activeStaff, onChange, noTime = false, customOptions = [] }: any) => {
  const members = split(value); const isTaiki = section === "待機"; const isFuzai = section === "不在";
  const handleAdd = (name: string) => { if (name) onChange(join([...members, isTaiki ? `${name}(17:00〜19:00)` : name])); };
  const handleRemove = (idx: number) => { const next = [...members]; next.splice(idx, 1); onChange(join(next)); };
  const handleTimeChange = (idx: number, newTime: string) => { if (noTime && !isFuzai) return; const next = [...members]; next[idx] = extractStaffName(next[idx]) + newTime; onChange(join(next)); };
  return (
    <div className="card-hover" style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
      <label style={{ fontSize: 16, fontWeight: 800, color: "#475569", marginBottom: 12 }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {members.map((m, i) => {
          const coreName = extractStaffName(m); const currentMod = m.substring(coreName.length);
          const isPlaceholder = ROLE_PLACEHOLDERS.includes(coreName) || (customOptions.includes(coreName) && !activeStaff.includes(coreName));
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime && !isFuzai ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime && !isFuzai ? "#334155" : "#0369a1"), borderRadius: 16, padding: "8px 12px 8px 14px", fontSize: 15, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${isPlaceholder ? "#fde047" : (noTime && !isFuzai ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 700 }}>
              <span>{coreName}</span>
              {(!noTime || isFuzai) && (
                <select value={currentMod} onChange={(e: any) => handleTimeChange(i, e.target.value)} style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: "inherit", cursor: "pointer", padding: "0 20px 0 6px" }}>
                  {isFuzai ? <><option value="">全休</option><option value="(AM)">AM休</option><option value="(PM)">PM休</option></> : isTaiki ? <><option value="(17:00〜19:00)">17:00〜19:00</option><option value="(17:00〜22:00)">17:00〜22:00</option><option value="(17:00〜)">17:00〜</option></> : <><option value="">終日</option><option value="(AM)">AM</option><option value="(PM)">PM</option>{currentMod && !["", "(AM)", "(PM)"].includes(currentMod) && !TIME_OPTIONS.includes(currentMod) && (<option value={currentMod}>{currentMod.replace(/[()]/g, '')}</option>)}{TIME_OPTIONS.filter(t => t !== "(AM)" && t !== "(PM)").map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</>}
                </select>
              )}
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 6 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e: any) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 15, color: "#64748b", flex: 1, minWidth: 100, cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "8px 24px 8px 12px" }}>
          <option value="">＋追加</option>
          <optgroup label="スタッフ">{activeStaff.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>
          {customOptions.length > 0 && <optgroup label="担当枠（未定）">{customOptions.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>}
        </select>
      </div>
    </div>
  );
};

const renderLog = (logStr: string, i: number) => {
  if (logStr.startsWith("・■")) { return <li key={i} style={{ marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottom: "2px solid #cbd5e1", fontSize: 18, fontWeight: 800, color: "#334155" }}>{logStr.substring(2)}</li>; }
  const match = logStr.match(/^・(.*?)\s\[(.*?)\]\s(.*)$/);
  if (!match) return <li key={i} style={{ padding: "8px 12px", marginBottom: "4px", background: "#f8fafc", borderRadius: "6px", fontSize: 14, color: "#475569", lineHeight: 1.6, wordBreak: "break-word" }}>{logStr.substring(1)}</li>;
  const [_, icon, category, text] = match;
  let bg = "#f8fafc"; let border = "#e2e8f0"; let color = "#475569"; let badgeBg = "#e2e8f0"; let badgeColor = "#475569";
  if (category.includes("配置決定") || category.includes("増枠")) { bg = "#eff6ff"; border = "#bfdbfe"; color = "#1e3a8a"; badgeBg = "#dbeafe"; badgeColor = "#1d4ed8"; }
  else if (category.includes("緊急") || category.includes("救済") || category.includes("除外")) { bg = "#fef2f2"; border = "#fecaca"; color = "#7f1d1d"; badgeBg = "#fee2e2"; badgeColor = "#b91c1c"; }
  else if (category.includes("代打") || category.includes("交換")) { bg = "#fff7ed"; border = "#fed7aa"; color = "#7c2d12"; badgeBg = "#ffedd5"; badgeColor = "#c2410c"; }
  else if (category.includes("兼務") || category.includes("専任スキップ") || category.includes("負担軽減")) { bg = "#ecfdf5"; border = "#a7f3d0"; color = "#064e3b"; badgeBg = "#d1fae5"; badgeColor = "#047857"; }
  else if (category.includes("遅番")) { bg = "#f5f3ff"; border = "#ddd6fe"; color = "#4c1d95"; badgeBg = "#ede9fe"; badgeColor = "#6d28d9"; }
  else if (category.includes("玉突き")) { bg = "#e0f2fe"; border = "#bae6fd"; color = "#0c4a6e"; badgeBg = "#bae6fd"; badgeColor = "#0369a1"; }
  else if (category.includes("専従") || category.includes("役割")) { bg = "#f0fdfa"; border = "#bbf7d0"; color = "#14532d"; badgeBg = "#dcfce7"; badgeColor = "#15803d"; }
  else if (category.includes("昼当番") || category.includes("ヘルプ") || category.includes("サポート") || category.includes("余剰")) { bg = "#fdf4ff"; border = "#f5d0fe"; color = "#701a75"; badgeBg = "#fae8ff"; badgeColor = "#86198f"; }
  return (
    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", marginBottom: "6px", background: bg, borderRadius: "8px", border: `1px solid ${border}`, fontSize: 14, color, lineHeight: 1.6, fontWeight: 600, wordBreak: "break-word" }}>
      <span style={{ display: "inline-block", padding: "4px 8px", background: badgeBg, color: badgeColor, borderRadius: "6px", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>{icon} {category}</span>
      <span style={{ fontWeight: 700 }}>{text}</span>
    </li>
  );
}

// ===================== 🌟 自動割付ロジック =====================
class AutoAssigner {
  day: DayData; prevDay: DayData | null; pastDaysInMonth: DayData[]; pastDaysInWeek: DayData[]; ctx: AutoAssignContext; isSmartFix: boolean;
  dayCells: Record<string, string>; blockMap: Map<string, string> = new Map();
  skipSections: string[] = []; clearSections: string[] = []; roleAssignments: Record<string, any> = {}; currentKenmu: any[] = [];
  dynamicCapacity: Record<string, number> = {}; assignCounts: Record<string, number> = {}; maxAssigns: Record<string, number> = {}; counts: Record<string, number> = {}; roomCounts: Record<string, Record<string, number>> = {};
  initialAvailAll: string[] = []; initialAvailGeneral: string[] = []; initialAvailSupport: string[] = []; initialAvailReception: string[] = [];
  logInfo: string[] = []; staffAssignments: {staff: string, section: string}[] = [];
  
  private log(msg: string) { this.logInfo.push(`・${msg}`); }
  private logPhase(phaseName: string) { this.logInfo.push(`・■${phaseName}`); }

  getPastRoomCount(staff: string, room: string) {
    const isMonthlyTarget = ["CT", "MRI"].includes(room);
    const targetPastDays = isMonthlyTarget ? this.pastDaysInMonth : this.pastDaysInWeek;
    return targetPastDays.filter(pd => split(pd.cells[room] || "").map(extractStaffName).includes(staff)).length;
  }

  getTodayRoomCount(staff: string) { let count = 0; Object.keys(this.dayCells).forEach(sec => { if (REST_SECTIONS.includes(sec) || ["待機", "昼当番", "受付", "受付ヘルプ"].includes(sec)) return; if (split(this.dayCells[sec]).map(extractStaffName).includes(staff)) count++; }); return count; }

  canAddKenmu(staff: string, targetRoom: string, bypassExclusiveForSource: boolean = false): boolean {
    const limit = this.ctx.customRules.alertMaxKenmu || 3;
    const currentRoomCount = this.getTodayRoomCount(staff);
    const isAlreadyInTarget = split(this.dayCells[targetRoom] || "").map(extractStaffName).includes(staff);
    if (!isAlreadyInTarget && currentRoomCount >= limit) return false;

    const exclusivePairs = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.isExclusive);
    for (const p of exclusivePairs) {
      const inS1 = split(this.dayCells[p.s1] || "").map(extractStaffName).includes(staff);
      const inS2 = split(this.dayCells[p.s2] || "").map(extractStaffName).includes(staff);
      if (inS1 || inS2) { if (targetRoom !== p.s1 && targetRoom !== p.s2) return false; }
      if (targetRoom === p.s1 || targetRoom === p.s2) {
        if (!bypassExclusiveForSource) {
           const currentRooms = ROOM_SECTIONS.filter(r => split(this.dayCells[r] || "").map(extractStaffName).includes(staff) && !["待機", "昼当番", "受付", "受付ヘルプ"].includes(r));
           const hasOutsideRoom = currentRooms.some(r => r !== p.s1 && r !== p.s2);
           if (hasOutsideRoom) return false;
        }
      }
    }
    return true;
  }

  isMmgCapable(staff: string): boolean { return split(this.ctx.monthlyAssign.MMG || "").map(extractStaffName).includes(extractStaffName(staff)); }

  constructor(day: DayData, prevDay: DayData | null, pastDaysInMonth: DayData[], pastDaysInWeek: DayData[], ctx: AutoAssignContext, isSmartFix: boolean = false) {
    this.day = { ...day }; this.prevDay = prevDay; this.pastDaysInMonth = pastDaysInMonth; this.pastDaysInWeek = pastDaysInWeek; this.ctx = ctx; this.dayCells = { ...day.cells }; this.dynamicCapacity = { ...(ctx.customRules.capacity || {}) }; this.isSmartFix = isSmartFix;
  }

  execute(): DayData {
    this.logPhase("フェーズ1：前日処理・設定反映");
    this.initCounts(); 

    if (this.prevDay && this.prevDay.cells["入り"]) {
      const iriMembers = split(this.prevDay.cells["入り"]).map(extractStaffName);
      this.dayCells["明け"] = join(Array.from(new Set([...split(this.dayCells["明け"]), ...iriMembers])));
      if (iriMembers.length > 0) this.log(`[前日処理] 昨日の「入り」メンバーを「明け」に配置しました`);
    }
    if (this.day.isPublicHoliday) { this.log(`🎌 祝日（休診日）のためスキップしました`); return { ...this.day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])), logInfo: this.logInfo }; }

    if (!this.isSmartFix) {
      ROOM_SECTIONS.forEach(sec => { this.dayCells[sec] = join(split(this.dayCells[sec]).filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); });
      this.dayCells["昼当番"] = ""; this.dayCells["受付ヘルプ"] = ""; this.dayCells["待機"] = "";
    }

    this.buildBlockMap();
    
    if (this.isSmartFix) {
      this.logPhase("欠員除外処理（スマート修正）");
      WORK_SECTIONS.forEach(sec => {
        let current = split(this.dayCells[sec]);
        let next = current.filter(m => {
          const core = extractStaffName(m); const block = this.blockMap.get(core);
          if (ROLE_PLACEHOLDERS.includes(core)) return true;
          if (block === 'ALL') return false; 
          if (block === 'AM' && (m.includes("(AM)") || !m.includes("("))) return false; 
          if (block === 'PM' && (m.includes("(PM)") || !m.includes("("))) return false; 
          return true;
        });
        if (current.length !== next.length) { this.dayCells[sec] = join(next); this.log(`🔄 [欠員除外] ${sec} から不在となった担当者を除外しました`); }
      });
    }

    this.applyDailyAdditions(); this.evaluateEmergencies(); this.cleanUpDayCells();
    
    WORK_SECTIONS.forEach(sec => { split(this.dayCells[sec]).forEach((m: string) => { const core = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(core) && this.blockMap.get(core) !== 'ALL') this.addU(core, getStaffAmount(m)); }); });

    this.prepareAvailability();

    if (this.isSmartFix) {
      this.logPhase("ピンポイント補充（スマート修正）");
      this.log(`⚠️ 現在の配置を維持し、空き枠にのみフリーのスタッフを補充します`);
      const priority = this.ctx.customRules.priorityRooms || SECTIONS;
      priority.forEach((room: string) => {
         if (REST_SECTIONS.includes(room) || ["昼当番","受付ヘルプ","待機"].includes(room)) return;
         if ((this.ctx.customRules.linkedRooms || []).some((r:any) => r.target === room)) return; 
         const cap = this.dynamicCapacity[room] || 1;
         let current = split(this.dayCells[room]);
         const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
         
         const noConsecutiveRooms = split(this.ctx.customRules.noConsecutiveRooms || "");
         const prevDayMembers = (this.prevDay && room && noConsecutiveRooms.includes(room)) ? split(this.prevDay.cells[room] || "").map(extractStaffName) : [];
         const isFixedToAny = (staffName: string) => (this.ctx.customRules.fixed || []).some((r:any) => r.staff === staffName);

         let sortedAvail = [...this.initialAvailGeneral];
         sortedAvail.sort((a, b) => this.getPastRoomCount(a, room) - this.getPastRoomCount(b, room));

         while (getAmt(current) < cap) {
            const freeStaff = sortedAvail.find((s: string) => {
              if (this.isUsed(s)) return false;
              if (this.isForbidden(s, room)) return false;
              if (room === "MMG" && !this.isMmgCapable(s)) return false;
              if (!this.canAddKenmu(s, room)) return false;
              if (prevDayMembers.includes(s)) return false; 
              if (isFixedToAny(s)) return false; 
              return true;
            });
            if (!freeStaff) break; 
            const block = this.blockMap.get(freeStaff);
            let tag = ""; let p = 1;
            if (block === 'AM') { tag = "(PM)"; p = 0.5; } else if (block === 'PM') { tag = "(AM)"; p = 0.5; }
            current.push(`${freeStaff}${tag}`); this.addU(freeStaff, p);
            
            sortedAvail = sortedAvail.filter(s => s !== freeStaff);
            this.log(`✅ [配置決定] ${room} の空き枠に ${freeStaff}${tag} を補充しました`);
         }
         this.dayCells[room] = join(current);
      });
    } else {
      this.assignRooms(); 
    }

    this.processPostTasks();
    return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
  }

  initCounts() {
    this.ctx.allStaff.forEach((s: string) => { 
      this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.counts[s] = 0; this.roomCounts[s] = {}; 
      SECTIONS.forEach((sec: string) => this.roomCounts[s][sec] = 0); 
    });

    const monthlyRooms = ["CT", "MRI"];
    this.pastDaysInMonth.forEach(pd => {
      Object.entries(pd.cells).forEach(([sec, val]) => {
        if (!monthlyRooms.includes(sec)) return;
        split(val as string).forEach((m: string) => {
          const c = extractStaffName(m);
          if (this.roomCounts[c]) { this.roomCounts[c][sec]++; this.counts[c]++; }
        });
      });
    });

    this.pastDaysInWeek.forEach(pd => {
      Object.entries(pd.cells).forEach(([sec, val]) => {
        if (monthlyRooms.includes(sec)) return;
        if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return;
        split(val as string).forEach((m: string) => {
          const c = extractStaffName(m);
          if (this.roomCounts[c]) { this.roomCounts[c][sec]++; this.counts[c]++; }
        });
      });
    });
  }

  buildBlockMap() {
    this.ctx.allStaff.forEach((s: string) => this.blockMap.set(s, 'NONE'));
    ["明け","入り","土日休日代休"].forEach((sec: string) => { split(this.dayCells[sec]).forEach((m: string) => this.blockMap.set(extractStaffName(m), 'ALL')); });
    split(this.dayCells["不在"]).forEach((m: string) => {
      const core = extractStaffName(m);
      if (m.includes("(AM)")) this.blockMap.set(core, 'AM'); else if (m.includes("(PM)")) this.blockMap.set(core, 'PM'); else this.blockMap.set(core, 'ALL');
    });
  }

  applyDailyAdditions() {
    (this.ctx.customRules.dailyAdditions || []).forEach((rule: any) => {
      if (rule.date === this.day.id && rule.section && rule.count > 0) {
        const timeTag = rule.time === "全日" || !rule.time ? "" : rule.time; const placeholderName = rule.section + "枠" + timeTag;
        let current = split(this.dayCells[rule.section]);
        if (!current.includes(placeholderName)) { for (let i = 0; i < rule.count; i++) current.push(placeholderName); this.dayCells[rule.section] = join(current); this.log(`📈 [増枠] 特別ルールにより、${rule.section} に ${rule.count}枠 追加しました`); }
      }
    });
  }

  evaluateEmergencies() {
    const tempAvailCount = this.ctx.activeGeneralStaff.filter((s: string) => this.blockMap.get(s) !== 'ALL').length;
    (this.ctx.customRules.emergencies || []).forEach((em: any) => {
      if (tempAvailCount <= Number(em.threshold)) {
        if (em.type === "role_assign" && em.role) { if (!this.roleAssignments[em.role] || em.threshold < this.roleAssignments[em.role].threshold) this.roleAssignments[em.role] = em; }
        if (em.type === "staff_assign" && em.staff && em.section) { this.staffAssignments.push({ staff: em.staff, section: em.section }); this.log(`🚨 [緊急] 出勤${tempAvailCount}人以下: ${em.staff} を ${em.section} に強制配置します`); }
        if (em.type === "clear" && em.section) { this.skipSections.push(em.section); this.clearSections.push(em.section); this.log(`🚨 [緊急] 出勤${tempAvailCount}人: ${em.section} を空室に設定しました`); }
        if (em.type === "change_capacity" && em.section) { if (!(this.ctx.customRules.dailyAdditions || []).some((r: any) => r.date === this.day.id && r.section === em.section)) { this.dynamicCapacity[em.section] = Number(em.newCapacity ?? 3); this.log(`🚨 [緊急] 出勤${tempAvailCount}人: ${em.section} の定員を ${em.newCapacity}人に変更しました`); } }
      }
    });
  }

  cleanUpDayCells() {
    Object.keys(this.dayCells).forEach(sec => {
      if (["明け","入り","不在","土日休日代休"].includes(sec)) return;
      if (this.skipSections.includes(sec)) { this.dayCells[sec] = ""; return; }
      let members = split(this.dayCells[sec]).map(m => {
        const core = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(core)) return m; const block = this.blockMap.get(core);
        if (block === 'ALL') return null; if (block === 'AM' && m.includes('(AM)')) return null; if (block === 'PM' && m.includes('(PM)')) return null; 
        if (block === 'AM' && !m.includes('(PM)') && !m.match(/\(.*\)/)) return `${core}(PM)`; if (block === 'PM' && !m.includes('(AM)') && !m.match(/\(.*\)/)) return `${core}(AM)`;
        return m;
      }).filter(Boolean) as string[];
      this.dayCells[sec] = join(members);
    });
  }

  getForbiddenCount(staffName: string): number { const rules = this.ctx.customRules.forbidden || []; const rule = rules.find((r: any) => r.staff === staffName); return rule ? split(rule.sections).length : 0; }

  prepareAvailability() {
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "");
    const effectiveReceptionStaff = this.ctx.activeReceptionStaff.length > 0 ? this.ctx.activeReceptionStaff : this.ctx.activeGeneralStaff;
    this.initialAvailAll = this.ctx.allStaff.filter((s: string) => this.blockMap.get(s) !== 'ALL').sort((a: string, b: string) => {
      if ((this.assignCounts[a] || 0) !== (this.assignCounts[b] || 0)) return (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0); 
      if ((this.counts[a] || 0) !== (this.counts[b] || 0)) return (this.counts[a] || 0) - (this.counts[b] || 0); 
      const aForbidCount = this.getForbiddenCount(a); const bForbidCount = this.getForbiddenCount(b);
      if (aForbidCount !== bForbidCount) return bForbidCount - aForbidCount;
      return a.localeCompare(b, 'ja');
    });
    this.initialAvailSupport = this.initialAvailAll.filter((s: string) => supportStaffList.includes(s));
    this.initialAvailGeneral = this.initialAvailAll.filter((s: string) => this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s));
    this.initialAvailReception = this.initialAvailAll.filter((s: string) => effectiveReceptionStaff.includes(s) && !supportStaffList.includes(s));
  }

  isUsed(name: string): boolean { return (this.assignCounts[name] || 0) >= (this.maxAssigns[name] || 1); }
  addU(name: string, f = 1): void { this.assignCounts[name] = (this.assignCounts[name] || 0) + f; }
  isForbidden(staff: string, section: string): boolean { return (this.ctx.customRules.forbidden || []).some((rule: any) => rule.staff === staff && split(rule.sections).includes(section)); }
  hasNGPair(candidate: string, members: string[], checkSoft: boolean): boolean { return members.some(member => (this.ctx.customRules.ngPairs || []).some((ng: any) => { const match = (ng.s1 === candidate && ng.s2 === member) || (ng.s1 === member && ng.s2 === candidate); if (!match) return false; if ((ng.level || "hard") === "hard") return true; if ((ng.level || "hard") === "soft" && checkSoft) return true; return false; })); }

  pick(availList: string[], list: string[], n: number, section?: string, currentAssigned: string[] = []): string[] {
    const result: string[] = []; const uniqueList = Array.from(new Set(list.filter(Boolean)));
    const filterFn = (name: string, checkSoftNg: boolean) => {
      if (!availList.includes(name) || this.isUsed(name) || (section && this.isForbidden(name, section))) return false;
      if (this.hasNGPair(name, [...currentAssigned, ...result].map(extractStaffName), checkSoftNg)) return false;
      if (section && !this.canAddKenmu(name, section)) return false; 
      if (section) {
         const kenmuTargets = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.s1 === section || p.s2 === section).map((p: any) => p.s1 === section ? p.s2 : p.s1);
         for (const target of kenmuTargets) { if (this.isForbidden(name, target)) return false; }
      }
      return true;
    };
    for (const name of uniqueList.filter(n => filterFn(n, true))) { result.push(name); if (result.length >= n) return result; }
    for (const name of uniqueList.filter(n => filterFn(n, false))) { result.push(name); if (result.length >= n) return result; }
    return result;
  }

  fill(availList: string[], section: string, preferredList: string[], targetCount: number) {
    if (this.skipSections.includes(section)) return;
    let current = split(this.dayCells[section]);
    const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "");
    const getCurrentAmount = (arr: string[]) => arr.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
    
    let prevAmount = -1;
    while (getCurrentAmount(current) < targetCount) {
      const currentAmount = getCurrentAmount(current); 
      if (currentAmount === prevAmount) break; 
      prevAmount = currentAmount;
      
      const remaining = targetCount - currentAmount;
      let needTag = "";
      if (remaining === 0.5 || remaining === 1.5 || remaining === 2.5) {
         const amCount = current.filter(m => m.includes("(AM)")).length; const pmCount = current.filter(m => m.includes("(PM)")).length;
         if (amCount > pmCount) needTag = "(PM)"; if (pmCount > amCount) needTag = "(AM)";
      }

      this.log(`📋 [候補選考] ${section} の枠を補充します（残り ${remaining}人分${needTag ? ` / 要求: ${needTag}` : ''}）`);

      const getFilterReason = (name: string): RejectReason | null => {
         if (current.map(extractStaffName).includes(name)) return { hard: true, msg: "同室に配置済" };
         if (this.isUsed(name)) return { hard: true, msg: "他業務で配置済" };
         if (this.isForbidden(name, section)) return { hard: true, msg: "担当不可設定" };
         if (section === "MMG" && !this.isMmgCapable(name)) return { hard: true, msg: "MMG月間担当者ではない" };
         if (!this.canAddKenmu(name, section)) return { hard: true, msg: "兼務上限または専念ペア制約" };

         const kenmuTargets = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.s1 === section || p.s2 === section).map((p: any) => p.s1 === section ? p.s2 : p.s1);
         for (const target of kenmuTargets) { if (this.isForbidden(name, target)) return { hard: true, msg: `兼務先(${target})が不可` }; }

         const b = this.blockMap.get(name);
         if (needTag && b === 'NONE') return { hard: true, msg: "半端枠への終日スタッフ割当禁止(連鎖防止)" };
         if (b === 'ALL') return { hard: true, msg: "全日ブロック" };
         if (needTag === "(AM)" && b === 'AM') return { hard: true, msg: "AMブロック" };
         if (needTag === "(PM)" && b === 'PM') return { hard: true, msg: "PMブロック" };
         if (fullDayOnlyList.includes(section) && b !== 'NONE') return { hard: true, msg: "終日専任室だが半休" };
         const noConsecutiveRooms = split(this.ctx.customRules.noConsecutiveRooms || "");
         const prevDayMembers = (this.prevDay && section && noConsecutiveRooms.includes(section)) ? split(this.prevDay.cells[section] || "").map(extractStaffName) : [];
         if (prevDayMembers.includes(name)) return { hard: false, msg: "連日担当禁止ルール" };
         if (this.hasNGPair(name, current.map(extractStaffName), false)) return { hard: true, msg: "絶対NGペア" };
         if (this.hasNGPair(name, current.map(extractStaffName), true)) return { hard: false, msg: "なるべくNGペア" };
         return null; 
      };

      const candidatesWithReason = availList.map(name => ({ name, reason: getFilterReason(name) }));
      let validNames = candidatesWithReason.filter(c => !c.reason).map(c => c.name);
      
      let fallbackMsg = "";
      if (validNames.length === 0) {
          const softCandidates = candidatesWithReason.filter(c => c.reason && !c.reason.hard);
          if (softCandidates.length > 0) { validNames = softCandidates.map(c => c.name); fallbackMsg = `（⚠️ 回避のため特例選出）`; } else { break; }
      }

      const validPreferred = validNames.filter(n => preferredList.includes(n));
      const validAvail = validNames.filter(n => !preferredList.includes(n));

      const sortCandidates = (candidates: string[]) => {
         let mainStaff: string[] = []; let subPrioStaff: string[] = []; let subStaff: string[] = [];
         if (section === "治療") { mainStaff = split(this.ctx.monthlyAssign.治療 || "").map(extractStaffName); subPrioStaff = split(this.ctx.monthlyAssign.治療サブ優先 || "").map(extractStaffName); subStaff = split(this.ctx.monthlyAssign.治療サブ || "").map(extractStaffName); } 
         else if (section === "RI") { mainStaff = split(this.ctx.monthlyAssign.RI || "").map(extractStaffName); subStaff = split(this.ctx.monthlyAssign.RIサブ || "").map(extractStaffName); } 
         else { mainStaff = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName); }

         const hasAmFree = validNames.some(s => this.blockMap.get(s) === 'PM'); const hasPmFree = validNames.some(s => this.blockMap.get(s) === 'AM');
         const prevDayMembers = (this.prevDay && section) ? split(this.prevDay.cells[section] || "").map(extractStaffName) : [];

         return [...candidates].sort((a, b) => {
             const bA = this.blockMap.get(a); const bB = this.blockMap.get(b); let scoreA = 0; let scoreB = 0;
             if (mainStaff.includes(a)) scoreA += 10000; else if (subPrioStaff.includes(a)) scoreA += 5000; else if (subStaff.includes(a)) scoreA += 2000;
             if (mainStaff.includes(b)) scoreB += 10000; else if (subPrioStaff.includes(b)) scoreB += 5000; else if (subStaff.includes(b)) scoreB += 2000;
             
             const roomCountWeight = (section === "MRI" || section === "CT") ? 200 : 100;
             scoreA -= (this.roomCounts[a]?.[section] || 0) * roomCountWeight; scoreB -= (this.roomCounts[b]?.[section] || 0) * roomCountWeight;

             if (prevDayMembers.includes(a)) scoreA -= 500; if (prevDayMembers.includes(b)) scoreB -= 500;
             
             if (section === "ポータブル") {
                 const pastA = this.getPastRoomCount(a, section); const pastB = this.getPastRoomCount(b, section);
                 if (pastA > 0) scoreA -= 1000 * pastA; if (pastB > 0) scoreB -= 1000 * pastB;
             }

             const linkedSources = (this.ctx.customRules.linkedRooms || []).flatMap((r: any) => split(r.sources).map(s => parseRoomCond(s).r));
             const kenmuSections = (this.ctx.customRules.kenmuPairs || []).flatMap((r: any) => [r.s1, r.s2]);
             const isChainSource = linkedSources.includes(section) || kenmuSections.includes(section);
             if (isChainSource) { if (bA === 'AM' || bA === 'PM') scoreA -= 800; if (bB === 'AM' || bB === 'PM') scoreB -= 800; }

             if (needTag === "") { if (hasAmFree && hasPmFree && (bA === 'AM' || bA === 'PM')) scoreA += 200; else if (bA === 'AM' || bA === 'PM') scoreA += 150; else if (bA === 'NONE') scoreA += 100; } else { if (needTag === "(AM)" && bA === 'PM') scoreA += 200; if (needTag === "(PM)" && bA === 'AM') scoreA += 200; if (bA === 'NONE') scoreA += 100; }
             if (needTag === "") { if (hasAmFree && hasPmFree && (bB === 'AM' || bB === 'PM')) scoreB += 200; else if (bB === 'AM' || bB === 'PM') scoreB += 150; else if (bB === 'NONE') scoreB += 100; } else { if (needTag === "(AM)" && bB === 'PM') scoreB += 200; if (needTag === "(PM)" && bB === 'AM') scoreB += 200; if (bB === 'NONE') scoreB += 100; }
             if (scoreA !== scoreB) return scoreB - scoreA;
             if ((this.assignCounts[a] || 0) !== (this.assignCounts[b] || 0)) return (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0);
             if ((this.counts[a] || 0) !== (this.counts[b] || 0)) return (this.counts[a] || 0) - (this.counts[b] || 0);
             const forbidA = this.getForbiddenCount(a); const forbidB = this.getForbiddenCount(b);
             if (forbidA !== forbidB) return forbidB - forbidA; 
             return a.localeCompare(b, 'ja');
         });
      };
      
      const sortedPreferred = sortCandidates(validPreferred); const sortedAvail = sortCandidates(validAvail);
      const allSorted = [...sortedPreferred, ...sortedAvail];
      
      const pickedCoreList = this.pick(validNames, allSorted, 1, section, current.map(extractStaffName));
      if (pickedCoreList.length === 0) break;
      
      const core = pickedCoreList[0]; const block = this.blockMap.get(core); let tag = ""; let f = 1;
      if (block === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } else if (block === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } else { if (needTag) { tag = needTag; f = 0.5; this.blockMap.set(core, needTag === "(AM)" ? 'AM' : 'PM'); } else { tag = ""; f = 1; this.blockMap.set(core, 'ALL'); } }
      current.push(`${core}${tag}`); this.addU(core, f);
      this.log(`✅ [配置決定] ${section} に ${core}${tag} を配置しました。${fallbackMsg}`);
    }
    this.dayCells[section] = join(current);
  }

  assignRooms() {
    this.logPhase("フェーズ2：例外・代打処理");

    (this.ctx.customRules.fixed || []).forEach((rule: any) => { if (!rule.staff || !rule.section) return; Object.keys(this.dayCells).forEach(sec => { if (sec === rule.section) return; if (REST_SECTIONS.includes(sec)) return; const before = split(this.dayCells[sec]); const after = before.filter(m => extractStaffName(m) !== rule.staff); if (before.length !== after.length) { this.dayCells[sec] = join(after); this.assignCounts[rule.staff] = 0; this.blockMap.set(rule.staff, 'NONE'); } }); });
    (this.ctx.customRules.fixed || []).forEach((rule: any) => { if (!rule.staff || !rule.section || !this.initialAvailAll.includes(rule.staff) || this.isUsed(rule.staff) || this.isForbidden(rule.staff, rule.section)) return; if (this.skipSections.includes(rule.section)) return; const current = split(this.dayCells[rule.section]); if (current.map(extractStaffName).includes(rule.staff) || this.hasNGPair(rule.staff, current.map(extractStaffName), false)) return; const b = this.blockMap.get(rule.staff); let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); } else { this.blockMap.set(rule.staff, 'ALL'); } this.dayCells[rule.section] = join([...current, `${rule.staff}${tag}`]); this.addU(rule.staff, f); this.log(`🔒 [専従] ${rule.staff} を ${rule.section} に固定配置しました`); });

    this.staffAssignments.forEach((rule: any) => {
      if (!rule.staff || !rule.section || !this.initialAvailAll.includes(rule.staff) || this.isUsed(rule.staff) || this.isForbidden(rule.staff, rule.section)) return;
      if (this.skipSections.includes(rule.section)) return;
      const current = split(this.dayCells[rule.section]);
      if (current.map(extractStaffName).includes(rule.staff) || this.hasNGPair(rule.staff, current.map(extractStaffName), false)) return;
      const b = this.blockMap.get(rule.staff); let tag = ""; let f = 1;
      if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); } else { this.blockMap.set(rule.staff, 'ALL'); }
      this.dayCells[rule.section] = join([...current, `${rule.staff}${tag}`]); this.addU(rule.staff, f);
      this.log(`🚨 [緊急専従] 人数不足のため ${rule.staff} を ${rule.section} に強制配置しました`);
    });

    Object.values(this.roleAssignments).forEach((ra: any) => { if (this.skipSections.includes(ra.section)) return; const candidates = split(this.ctx.monthlyAssign[ra.role] || ""); const targetAvail = ["受付"].includes(ra.role) ? this.initialAvailReception : this.initialAvailGeneral; const staff = candidates.find(s => targetAvail.includes(s) && !this.isUsed(s) && !this.isForbidden(s, ra.section)); if (staff && !split(this.dayCells[ra.section]).map(extractStaffName).includes(staff)) { const b = this.blockMap.get(staff); let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else { this.blockMap.set(staff, 'ALL'); } this.dayCells[ra.section] = join([...split(this.dayCells[ra.section]), `${staff}${tag}`]); this.addU(staff, f); this.log(`📌 [緊急役割] ${staff} を ${ra.section} に配置しました`); } });

    (this.ctx.customRules.substitutes || []).forEach((sub: any) => { 
      const targets = split(sub.target); if (targets.length === 0 || this.skipSections.includes(sub.section)) return; 
      const currentRoomStaff = split(this.dayCells[sub.section]).map(extractStaffName);
      if (targets.some(t => currentRoomStaff.includes(t))) return; 
      
      const trigger = targets.every(t => !this.initialAvailAll.includes(t)); 
      if (trigger) { 
        const fallbackStaff = split(sub.subs).filter(s => this.initialAvailGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, sub.section)); 
        if (fallbackStaff.length > 0) { 
          const currentRoomMembers = split(this.dayCells[sub.section]); 
          const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "");
          for (const f of fallbackStaff) { 
            if (fullDayOnlyList.includes(sub.section) && this.blockMap.get(f) !== 'NONE') continue; 
            if (!this.hasNGPair(f, currentRoomMembers.map(extractStaffName), false) && currentRoomMembers.length < 6) { 
              if (!this.canAddKenmu(f, sub.section)) continue; 
              const b = this.blockMap.get(f); let tag = ""; let fr = 1; 
              if (b === 'AM') { tag = "(PM)"; fr = 0.5; this.blockMap.set(f, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; fr = 0.5; this.blockMap.set(f, 'ALL'); } else { this.blockMap.set(f, 'ALL'); } 
              this.dayCells[sub.section] = join([...currentRoomMembers, `${f}${tag}`]); this.addU(f, fr); 
              this.log(`🔄 [代打] ${sub.target} が不在のため、${f} を ${sub.section} に配置しました`); 
              break; 
            } 
          } 
        } 
      } 
    });

    (this.ctx.customRules.pushOuts || []).forEach((po: any) => { 
      const s1 = po.s1 || po.triggerStaff; const s2 = po.s2 || po.targetStaff; const tSec = po.triggerSection; 
      if (!s1 || !s2 || !tSec || !po.targetSections) return; 
      if (this.initialAvailGeneral.includes(s1) && this.initialAvailGeneral.includes(s2)) { 
        const currentTSec = split(this.dayCells[tSec]).map(extractStaffName);
        const s1In = currentTSec.includes(s1) || isMonthlyMainStaff(tSec, s1, this.ctx.monthlyAssign); 
        const s2In = currentTSec.includes(s2) || isMonthlyMainStaff(tSec, s2, this.ctx.monthlyAssign); 
        if (s1In && s2In) { 
          const allowedRooms = split(po.targetSections).filter(s => !this.skipSections.includes(s)); 
          const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "");
          for (const room of allowedRooms) { 
            if (this.isForbidden(s2, room)) continue; 
            if (fullDayOnlyList.includes(room) && this.blockMap.get(s2) !== 'NONE') continue; 
            const currentRoom = split(this.dayCells[room]); 
            if (this.hasNGPair(s2, currentRoom.map(extractStaffName), false)) continue; 
            if (!this.canAddKenmu(s2, room)) continue; 
            const actualCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1); 
            const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
            if (getAmt(currentRoom) < actualCap) { 
              this.dayCells[tSec] = join(split(this.dayCells[tSec]).filter(m => extractStaffName(m) !== s2));
              const b = this.blockMap.get(s2); let tag = ""; 
              if (b === 'AM') { tag = "(PM)"; } else if (b === 'PM') { tag = "(AM)"; } 
              this.dayCells[room] = join([...currentRoom, `${s2}${tag}`]); 
              this.log(`🎱 [玉突き] ${s1} と被ったため、${s2} を ${room} に移動しました`); 
              break; 
            } 
          } 
        } 
      } 
    });

    this.logPhase("フェーズ3：メイン配置");
    const basePriorityList = this.ctx.customRules.priorityRooms && this.ctx.customRules.priorityRooms.length > 0 ? this.ctx.customRules.priorityRooms : DEFAULT_PRIORITY_ROOMS;
    const PRIORITY_LIST = ["治療", ...basePriorityList.filter((r: string) => r !== "治療")];
    const linkedTargetRooms = (this.ctx.customRules.linkedRooms || []).map((r: any) => r.target);

    PRIORITY_LIST.forEach((room: string) => {
      if (this.skipSections.includes(room)) return;
      if (["受付ヘルプ", "昼当番", "待機"].includes(room)) return;

      let targetCount = this.dynamicCapacity[room] !== undefined ? this.dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
      let currentMembersForTarget = split(this.dayCells[room]);
      const placeholders = currentMembersForTarget.filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)));
      if (placeholders.length > 0) { targetCount += placeholders.length; this.dayCells[room] = join(currentMembersForTarget.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); }

      if (room === "受付") {
        let currentUketsuke = split(this.dayCells["受付"]);
        const uketsukeMonthly = split(this.ctx.monthlyAssign.受付 || "");
        for (const name of uketsukeMonthly) {
          if (this.initialAvailAll.includes(name) && !this.isUsed(name) && !currentUketsuke.map(extractStaffName).includes(name)) { 
            const b = this.blockMap.get(name); if (b === 'ALL') continue;
            let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else { this.blockMap.set(name, 'ALL'); }
            currentUketsuke.push(`${name}${tag}`); this.addU(name, f); 
          }
        }
        const currentUketsukeAmount = currentUketsuke.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
        let neededUketsuke = targetCount - currentUketsukeAmount;
        if (neededUketsuke > 0 && !linkedTargetRooms.includes(room)) { 
          const pickedUketsuke = this.pick(this.initialAvailReception, this.initialAvailReception, Math.ceil(neededUketsuke), "受付", currentUketsuke);
          pickedUketsuke.forEach((name: string) => {
            const b = this.blockMap.get(name); let tag = ""; let f = 1;
            if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else { this.blockMap.set(name, 'ALL'); }
            currentUketsuke.push(`${name}${tag}`); this.addU(name, f);
          });
        }
        this.dayCells["受付"] = join(currentUketsuke);
      } else {
        let preferredList: string[] = [];
        if (["治療", "RI", "CT", "MRI", "MMG"].includes(room)) { preferredList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign).filter((s: string) => this.initialAvailGeneral.includes(s)); } else if (this.ctx.monthlyAssign[room]) { preferredList = split(this.ctx.monthlyAssign[room]).filter((s: string) => this.initialAvailGeneral.includes(s)); }
        let candidates = this.initialAvailGeneral;
        const strictRooms = ["治療", "RI", "MMG"];
        if (strictRooms.includes(room)) { candidates = preferredList.length > 0 ? preferredList : this.initialAvailGeneral; }
        
        const partnerRooms = (this.ctx.customRules.kenmuPairs || [])
          .filter((p: any) => p.s1 === room || p.s2 === room)
          .map((p: any) => p.s1 === room ? p.s2 : p.s1);
        const hasPartnerFilled = partnerRooms.some(pr => split(this.dayCells[pr]).reduce((sum, m) => sum + getStaffAmount(m), 0) > 0);
        
        const isLinkedTarget = linkedTargetRooms.includes(room);
        const shouldSkipFill = isLinkedTarget || hasPartnerFilled;

        if (!shouldSkipFill) { 
          this.fill(candidates, room, preferredList, targetCount); 
        } else {
          if (isLinkedTarget) { this.log(`⏭️ [専任スキップ] ${room} は基本兼務ルールの対象のため、専任配置をスキップ`); } 
          else { this.log(`⏭️ [専任スキップ] ${room} は常時兼務ペアに配置済みのため、専任配置をスキップ`); }
        }
      }
    });
  }

  processPostTasks() {
    this.logPhase("フェーズ4：兼務・交換・救済・遅番");

    const noLSStaffList = split(this.ctx.customRules.noLateShiftStaff || "");
    const noLSRooms = split(this.ctx.customRules.noLateShiftRooms || "").flatMap(room => split(this.dayCells[room] || "").map(extractStaffName));
    const absentAll = [...split(this.dayCells["明け"]), ...split(this.dayCells["入り"]), ...split(this.dayCells["土日休日代休"])].map(extractStaffName);
    const absentPM = split(this.dayCells["不在"]).filter(m => !m.includes("(AM)")).map(extractStaffName);
    const cannotLS = [...absentAll, ...absentPM, ...noLSStaffList, ...noLSRooms]; 
    const isFixed = (sn: string) => (this.ctx.customRules.fixed || []).some((r:any) => r.staff === sn);
    const noCRooms = split(this.ctx.customRules.noConsecutiveRooms || "");

    (this.ctx.customRules.swapRules || []).forEach((rule: any) => {
      const { targetRoom, triggerRoom, sourceRooms } = rule;
      if (!targetRoom || !triggerRoom || !sourceRooms) return;
      if (this.clearSections.includes(targetRoom) || this.clearSections.includes(triggerRoom)) return;
      
      const triggerMembers = split(this.dayCells[triggerRoom]);
      if (triggerMembers.length === 0) return;

      const prevDayTarget = (this.prevDay && noCRooms.includes(targetRoom)) ? split(this.prevDay.cells[targetRoom] || "").map(extractStaffName) : [];

      const triggerCanTarget = triggerMembers.some(m => {
          const c = extractStaffName(m);
          if (ROLE_PLACEHOLDERS.includes(c) || this.isForbidden(c, targetRoom) || prevDayTarget.includes(c) || isFixed(c)) return false;
          
          let curAm = m.includes("(AM)"); let curPm = m.includes("(PM)");
          if (!curAm && !curPm) { curAm = true; curPm = true; } 
          
          let targetAm = 0; let targetPm = 0;
          split(this.dayCells[targetRoom]).forEach(x => { if (x.includes("(AM)")) targetAm += 1; else if (x.includes("(PM)")) targetPm += 1; else { targetAm += 1; targetPm += 1; } });
          const targetCap = this.dynamicCapacity[targetRoom] || 1;

          if (curAm && curPm) { return (targetAm < targetCap || targetPm < targetCap) && this.canAddKenmu(c, targetRoom, true); }
          if (curAm) { return targetAm < targetCap && this.canAddKenmu(c, targetRoom, true); }
          if (curPm) { return targetPm < targetCap && this.canAddKenmu(c, targetRoom, true); }
          return false;
      });

      if (!triggerCanTarget) {
          const swapSources = split(sourceRooms);
          let swapped = false;

          for (const srcStrRoom of swapSources) {
              const { r: srcRoom, min } = parseRoomCond(srcStrRoom);
              if (srcRoom === triggerRoom) continue;

              const srcMembers = split(this.dayCells[srcRoom]);
              if (min > 0 && srcMembers.reduce((sum, m) => sum + getStaffAmount(m), 0) < min) continue;

              let srcCands: string[] = [];
              for (const srcM of srcMembers) {
                  const srcCore = extractStaffName(srcM);
                  if (ROLE_PLACEHOLDERS.includes(srcCore) || isFixed(srcCore)) continue;
                  if (this.isForbidden(srcCore, targetRoom) || prevDayTarget.includes(srcCore) || !this.canAddKenmu(srcCore, targetRoom, true)) continue;
                  if (this.isForbidden(srcCore, triggerRoom)) continue;
                  if (this.hasNGPair(srcCore, triggerMembers.map(extractStaffName), false)) continue;
                  srcCands.push(srcM);
              }
              srcCands.sort((a, b) => this.getPastRoomCount(extractStaffName(a), targetRoom) - this.getPastRoomCount(extractStaffName(b), targetRoom));

              for (const srcM of srcCands) {
                  const srcCore = extractStaffName(srcM);
                  const targetToKick = triggerMembers.find(m => {
                      const c = extractStaffName(m);
                      if (isFixed(c)) return false;
                      if (this.isForbidden(c, srcRoom)) return false;
                      if (this.hasNGPair(c, srcMembers.map(extractStaffName), false)) return false;
                      
                      let srcAm = srcM.includes("(AM)"); let srcPm = srcM.includes("(PM)");
                      if (!srcAm && !srcPm) { srcAm = true; srcPm = true; }
                      let tgtAm = m.includes("(AM)"); let tgtPm = m.includes("(PM)");
                      if (!tgtAm && !tgtPm) { tgtAm = true; tgtPm = true; }
                      return srcAm === tgtAm && srcPm === tgtPm;
                  });

                  if (targetToKick) {
                      const kickCore = extractStaffName(targetToKick);
                      this.dayCells[triggerRoom] = join(triggerMembers.map(m => m === targetToKick ? m.replace(kickCore, srcCore) : m));
                      this.dayCells[srcRoom] = join(srcMembers.map(m => m === srcM ? m.replace(srcCore, kickCore) : m));
                      
                      this.log(`🔄 [交換・救済] ${triggerRoom} から ${targetRoom} に出られる人がいないため、${triggerRoom} の ${kickCore} と ${srcRoom} の ${srcCore} を入れ替えました`);
                      swapped = true;
                      break;
                  }
              }
              if (swapped) break;
          }
      }
    });

    let uGen1 = this.initialAvailGeneral.filter((s: string) => !this.isUsed(s));
    (this.ctx.customRules.linkedRooms || []).forEach((rule: any) => {
      const targetRoom = rule.target;
      if (!targetRoom || this.clearSections.includes(targetRoom) || this.skipSections.includes(targetRoom)) return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      let currentMems = split(this.dayCells[targetRoom]);
      const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
      
      const prevDayMembers = (this.prevDay && noCRooms.includes(targetRoom)) ? split(this.prevDay.cells[targetRoom] || "").map(extractStaffName) : [];
      uGen1.sort((a, b) => this.getPastRoomCount(a, targetRoom) - this.getPastRoomCount(b, targetRoom));

      while (getAmt(currentMems) < targetCap && uGen1.length > 0) {
        const candIdx = uGen1.findIndex((s: string) => 
           !this.isForbidden(s, targetRoom) && 
           !this.hasNGPair(s, currentMems.map(extractStaffName), false) && 
           !isFixed(s) &&
           !prevDayMembers.includes(s) && 
           (targetRoom === "MMG" ? this.isMmgCapable(s) : true) &&
           this.canAddKenmu(s, targetRoom)
        );
        
        if (candIdx === -1) break;
        const staff = uGen1[candIdx];
        uGen1.splice(candIdx, 1);
        
        const b = this.blockMap.get(staff);
        let tag = ""; let f = 1;
        if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } 
        else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } 
        else { this.blockMap.set(staff, 'ALL'); }
        
        currentMems.push(`${staff}${tag}`);
        this.addU(staff, f);
        this.log(`🙌 [負担軽減] 出勤人数に余裕があるため、他からの兼務にせず ${staff} を ${targetRoom} に専任配置しました`);
      }
      this.dayCells[targetRoom] = join(currentMems);
    });

    (this.ctx.customRules.smartKenmu || []).forEach((rule: any) => {
      const targetRoom = rule.targetRoom;
      if (!targetRoom || this.clearSections.includes(targetRoom) || this.skipSections.includes(targetRoom)) return;

      const targetMembers = split(this.dayCells[targetRoom]);
      if (targetMembers.length === 0) return;

      const currentTargetStr = targetMembers[0];
      const targetCore = extractStaffName(currentTargetStr);

      if (!ROLE_PLACEHOLDERS.includes(targetCore)) {
        const isDedicated = !ROOM_SECTIONS.some(r => r !== targetRoom && split(this.dayCells[r]).map(extractStaffName).includes(targetCore));
        if (isDedicated) {
          const swapSources = split(rule.sourceRooms);
          let swapCandidateFullStr: string | null = null;
          let foundSrcRoom: string | null = null;

          for (const srcStrRoom of swapSources) {
            const { r: srcRoom, min } = parseRoomCond(srcStrRoom);
            const srcMembers = split(this.dayCells[srcRoom]);

            if (min > 0) {
                const amt = srcMembers.reduce((sum, m) => sum + getStaffAmount(m), 0);
                if (amt < min) continue;
            }

            let srcCands: string[] = [];
            for (const srcStr of srcMembers) {
              const core = extractStaffName(srcStr);
              if (core === targetCore || ROLE_PLACEHOLDERS.includes(core) || this.isForbidden(core, targetRoom) || this.hasNGPair(core, targetMembers.map(extractStaffName), false) || isFixed(core)) continue;
              if (targetRoom === "MMG" && !this.isMmgCapable(core)) continue;
              if (!this.canAddKenmu(core, targetRoom)) continue;
              srcCands.push(srcStr);
            }
            srcCands.sort((a, b) => this.getPastRoomCount(extractStaffName(a), targetRoom) - this.getPastRoomCount(extractStaffName(b), targetRoom));

            for (const srcStr of srcCands) {
              swapCandidateFullStr = srcStr;
              foundSrcRoom = srcRoom;
              break;
            }
            if (swapCandidateFullStr) break;
          }

          if (swapCandidateFullStr && foundSrcRoom) {
            const candCore = extractStaffName(swapCandidateFullStr);
            this.dayCells[foundSrcRoom] = join(split(this.dayCells[foundSrcRoom]).filter(m => m !== swapCandidateFullStr));

            let currentTargetTags = "";
            if (currentTargetStr.includes("(AM)")) currentTargetTags = "(AM)";
            else if (currentTargetStr.includes("(PM)")) currentTargetTags = "(PM)";

            this.dayCells[foundSrcRoom] = join([...split(this.dayCells[foundSrcRoom]), `${targetCore}${currentTargetTags}`]);
            this.dayCells[targetRoom] = swapCandidateFullStr;
            this.addU(candCore, getStaffAmount(swapCandidateFullStr));
            this.log(`🔄 [スマート兼務] ${targetCore} を専任から外して ${foundSrcRoom} に移動し、代わりに ${candCore} を ${targetRoom} と兼務させました`);
          }
        }
      }
    });

    const processKenmu = (sourceMems: string[], targetMems: string[], targetRoom: string) => {
       const targetCap = this.dynamicCapacity[targetRoom] || 1; const targetCores = targetMems.map(extractStaffName);
       const getCurrentAmount = (arr: string[]) => arr.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
       let currentAmount = getCurrentAmount(targetMems);
       if (currentAmount >= targetCap) return targetMems;
       for (const m of sourceMems) {
          if (currentAmount >= targetCap) break;
          const core = extractStaffName(m);
          const prevDayMembers = (this.prevDay && targetRoom && noCRooms.includes(targetRoom)) ? split(this.prevDay.cells[targetRoom] || "").map(extractStaffName) : [];
          if (isFixed(core) || targetCores.includes(core) || m.includes("17:00") || m.includes("19:00") || m.includes("22:00") || this.isForbidden(core, targetRoom) || prevDayMembers.includes(core) || this.hasNGPair(core, targetCores, false) || !this.canAddKenmu(core, targetRoom)) continue;

          let pushStr = m; let curAm = 0; let curPm = 0;
          targetMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
          if (curAm < targetCap && curPm >= targetCap) { if (m.includes("(PM)")) continue; pushStr = `${core}(AM)`; } 
          else if (curAm >= targetCap && curPm < targetCap) { if (m.includes("(AM)")) continue; pushStr = `${core}(PM)`; }
          targetMems.push(pushStr); targetCores.push(core); const amount = getStaffAmount(pushStr); currentAmount += amount; this.addU(core, amount);
       }
       return targetMems;
    };

    (this.ctx.customRules.kenmuPairs || []).forEach((pair: any) => {
      if (!pair.s1 || !pair.s2) return;
      let m1 = split(this.dayCells[pair.s1]); let m2 = split(this.dayCells[pair.s2]);
      if (m1.length > 0 || m2.length > 0) this.log(`🔗 [常時兼務] ${pair.s1} と ${pair.s2} を連動させました`);
      this.dayCells[pair.s2] = join(processKenmu(m1, m2, pair.s2));
      m2 = split(this.dayCells[pair.s2]); this.dayCells[pair.s1] = join(processKenmu(m2, m1, pair.s1));
    });

    (this.ctx.customRules.linkedRooms || []).forEach((rule: any) => {
      const targetRoom = rule.target;
      if (!targetRoom || this.clearSections.includes(targetRoom) || this.skipSections.includes(targetRoom)) return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      let currentMems = split(this.dayCells[targetRoom]);
      let curAm = 0; let curPm = 0;
      currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
      const sourceRooms = split(rule.sources);
      
      for (const srcStr of sourceRooms) {
        if (curAm >= targetCap && curPm >= targetCap) break; 
        const { r: srcRoom, min } = parseRoomCond(srcStr);
        if (min > 0) { const amt = split(this.dayCells[srcRoom]).reduce((sum, m) => sum + getStaffAmount(m), 0); if (amt < min) continue; }

        split(this.dayCells[srcRoom]).forEach(m => {
          if (curAm >= targetCap && curPm >= targetCap) return;
          const core = extractStaffName(m);
          const prevDayMembers = (this.prevDay && targetRoom && noCRooms.includes(targetRoom)) ? split(this.prevDay.cells[targetRoom] || "").map(extractStaffName) : [];

          if (isFixed(core) || this.hasNGPair(core, currentMems.map(extractStaffName), false) || prevDayMembers.includes(core) || (targetRoom === "MMG" && !this.isMmgCapable(core)) || (!currentMems.map(extractStaffName).includes(core) && !this.canAddKenmu(core, targetRoom, true))) return;

          if (!ROLE_PLACEHOLDERS.includes(core) && !currentMems.map(extractStaffName).includes(core) && !this.isForbidden(core, targetRoom)) {
            if (!m.includes("17:00") && !m.includes("19:00") && !m.includes("22:00")) {
               let pushStr = m;
               if (targetRoom === "パノラマCT" && srcRoom === "透視（6号）") { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; } else {
                 if (curAm < targetCap && curPm >= targetCap) { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; } 
                 else if (curAm >= targetCap && curPm < targetCap) { if (m.includes("(AM)")) return; pushStr = `${core}(PM)`; }
               }
               currentMems.push(pushStr);
               if (pushStr.includes("(AM)")) curAm += 1; else if (pushStr.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; }
               this.addU(core, getStaffAmount(pushStr));
               this.log(`🔗 [基本兼務] ${srcRoom} 担当の ${pushStr} を ${targetRoom} にセット配置しました`);
            }
          }
        });
      }
      this.dayCells[targetRoom] = join(currentMems);
    });

    ROOM_SECTIONS.forEach(targetRoom => {
      if (this.clearSections.includes(targetRoom)) return;
      if (["待機", "昼当番", "受付", "受付ヘルプ"].includes(targetRoom)) return;
      
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      let currentMems = split(this.dayCells[targetRoom]);
      let curAm = 0; let curPm = 0;
      currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
      if (curAm >= targetCap && curPm >= targetCap) return; 
      
      const matchingRescueRules = (this.ctx.customRules.rescueRules || []).filter((r: any) => r.targetRoom === targetRoom);
      if (matchingRescueRules.length > 0) {
         const sourceRooms = matchingRescueRules.flatMap((r: any) => split(r.sourceRooms || ""));
         let candidates: { core: string, fullStr: string, srcIdx: number }[] = [];
         
         const prevDayMembers = (this.prevDay && targetRoom && noCRooms.includes(targetRoom)) ? split(this.prevDay.cells[targetRoom] || "").map(extractStaffName) : [];

         sourceRooms.forEach((srcStr: string, idx: number) => {
            const { r: srcRoom, min } = parseRoomCond(srcStr);
            if (srcRoom === targetRoom) return;
            if (min > 0) { const amt = split(this.dayCells[srcRoom]).reduce((sum, m) => sum + getStaffAmount(m), 0); if (amt < min) return; }

            split(this.dayCells[srcRoom]).forEach(m => {
               const core = extractStaffName(m);
               if (isFixed(core) || ROLE_PLACEHOLDERS.includes(core) || prevDayMembers.includes(core) || candidates.some(c => c.core === core) || this.isForbidden(core, targetRoom)) return;
               if (!m.includes("17:00") && !m.includes("19:00") && !m.includes("22:00")) candidates.push({ core, fullStr: m, srcIdx: idx });
            });
         });

         const currentCores = currentMems.map(extractStaffName); 
         candidates = candidates.filter(c => !currentCores.includes(c.core));
         candidates = candidates.filter(c => { if (targetRoom === "MMG" && !this.isMmgCapable(c.core)) return false; if (!this.canAddKenmu(c.core, targetRoom, true)) return false; return true; });
         
         candidates.sort((a, b) => { 
             const pastA = this.getPastRoomCount(a.core, targetRoom);
             const pastB = this.getPastRoomCount(b.core, targetRoom);
             if (pastA !== pastB) return pastA - pastB;
             
             const aRooms = this.getTodayRoomCount(a.core); const bRooms = this.getTodayRoomCount(b.core);
             if (aRooms !== bRooms) return aRooms - bRooms;
             if (a.srcIdx !== b.srcIdx) return a.srcIdx - b.srcIdx;
             if ((this.assignCounts[a.core] || 0) !== (this.assignCounts[b.core] || 0)) return (this.assignCounts[a.core] || 0) - (this.assignCounts[b.core] || 0); 
             return (this.counts[a.core] || 0) - (this.counts[b.core] || 0); 
         });
         
         for (const cand of candidates) {
            if (curAm >= targetCap && curPm >= targetCap) break;
            if (this.hasNGPair(cand.core, currentMems.map(extractStaffName), false)) continue;

            let pushStr = cand.fullStr;
            if (curAm < targetCap && curPm >= targetCap) { if (cand.fullStr.includes("(PM)")) continue; pushStr = `${cand.core}(AM)`; } 
            else if (curAm >= targetCap && curPm < targetCap) { if (cand.fullStr.includes("(AM)")) continue; pushStr = `${cand.core}(PM)`; }
            currentMems.push(pushStr); 
            if (pushStr.includes("(AM)")) curAm += 1; else if (pushStr.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; }
            this.addU(cand.core, getStaffAmount(pushStr));
            this.log(`🆘 [救済] 定員割れの ${targetRoom} に、${pushStr} を兼務で追加しました`);
         }
         this.dayCells[targetRoom] = join(currentMems);
      }
    });

    (this.ctx.customRules.lateShifts || []).forEach((rule: any) => {
      if (!rule.section || !rule.lateTime || !rule.dayEndTime) return;
      if (this.skipSections.includes(rule.section)) return;
      if (!ROOM_SECTIONS.includes(rule.section)) return;
      let current = split(this.dayCells[rule.section]);
      if (current.length === 0) return;
      current = current.map(m => (!m.includes("(") && !m.includes(")")) ? m + rule.dayEndTime : m);

      if (!current.some(m => m.includes(rule.lateTime))) {
        const currentCore = current.map(extractStaffName);
        const prevLateStaff = this.prevDay ? split(this.prevDay.cells[rule.section] || "").filter((m: string) => m.includes(rule.lateTime)).map(extractStaffName) : [];
        const getCandidate = (candidatesList: string[], allowConsecutive: boolean, checkIsUsed: boolean) => {
          let cand = candidatesList.filter(name => {
            if (cannotLS.includes(name) || currentCore.includes(name) || this.blockMap.get(name) === 'PM' || this.isForbidden(name, rule.section) || (!allowConsecutive && prevLateStaff.includes(name)) || (checkIsUsed && this.isUsed(name))) return false;
            return true;
          });
          if (cand.length > 0) { cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); return cand[0]; }
          return null;
        };

        let picked = getCandidate(this.initialAvailGeneral, false, true); 
        if (!picked) picked = getCandidate(this.initialAvailGeneral, false, false); 
        if (!picked) picked = getCandidate(this.initialAvailGeneral, true, true); 
        if (!picked) picked = getCandidate(this.initialAvailGeneral, true, false);

        if (picked) {
          current.push(`${picked}${rule.lateTime}`); this.addU(picked, 0.5); this.blockMap.set(picked, this.blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); 
          this.log(`🌆 [遅番] ${rule.section} の遅番に ${picked} をアサインしました`);
        }
      }
      this.dayCells[rule.section] = join(current);
    });

    // ★ 兼務解消（De-Kenmu）ロジック
    const deKenmuTargets = ["ポータブル", "DSA", "パノラマCT", "検像", "骨塩", "MMG", "透視（11号）", "透視（6号）"];
    let uGen2 = this.initialAvailGeneral.filter((s: string) => !this.isUsed(s));

    uGen2.forEach((staff: string) => {
      const b = this.blockMap.get(staff); 
      if (b === 'ALL') return;
      
      let tag = ""; let f = 1;
      if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } 
      else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } 
      else { this.blockMap.set(staff, 'ALL'); }
      
      let assigned = false;

      for (const room of deKenmuTargets) {
        if (this.skipSections.includes(room) || this.clearSections.includes(room) || this.isForbidden(staff, room)) continue;
        if (room === "MMG" && !this.isMmgCapable(staff)) continue;
        
        let currentMems = split(this.dayCells[room]);
        const candidateToReplaceIdx = currentMems.findIndex(m => {
          const core = extractStaffName(m);
          if (ROLE_PLACEHOLDERS.includes(core)) return false;
          if (isFixed(core)) return false;
          if (this.getTodayRoomCount(core) <= 1) return false;
          
          const otherCores = currentMems.filter(x => x !== m).map(extractStaffName);
          if (this.hasNGPair(staff, otherCores, false)) return false;
          
          let curAm = m.includes("(AM)"); let curPm = m.includes("(PM)");
          if (!curAm && !curPm) { curAm = true; curPm = true; } 
          let newAm = tag === "(AM)"; let newPm = tag === "(PM)";
          if (!newAm && !newPm) { newAm = true; newPm = true; } 
          
          if (curAm && !newAm) return false;
          if (curPm && !newPm) return false;
          
          return true;
        });

        if (candidateToReplaceIdx !== -1) {
          const oldStr = currentMems[candidateToReplaceIdx];
          const oldCore = extractStaffName(oldStr);
          
          let replaceTag = "";
          if (oldStr.includes("(AM)")) replaceTag = "(AM)";
          else if (oldStr.includes("(PM)")) replaceTag = "(PM)";
          else replaceTag = tag; 

          currentMems[candidateToReplaceIdx] = `${staff}${replaceTag}`;
          this.dayCells[room] = join(currentMems);
          
          this.addU(staff, f);
          
          // 古い担当者の「今日の割当数」のみ減算する
          this.assignCounts[oldCore] = Math.max(0, (this.assignCounts[oldCore] || 1) - getStaffAmount(oldStr));
          
          // 古い担当者の「今日の残りの業務」を調べて blockMap を再計算
          let amBusy = false; let pmBusy = false;
          ["明け","入り","土日休日代休"].forEach(sec => {
            if (split(this.dayCells[sec]).map(extractStaffName).includes(oldCore)) { amBusy = true; pmBusy = true; }
          });
          split(this.dayCells["不在"]).forEach(m => {
            if (extractStaffName(m) === oldCore) {
              if (m.includes("(AM)")) amBusy = true;
              else if (m.includes("(PM)")) pmBusy = true;
              else { amBusy = true; pmBusy = true; }
            }
          });
          WORK_SECTIONS.forEach(sec => {
            split(this.dayCells[sec]).forEach(m => {
              if (extractStaffName(m) === oldCore) {
                if (m.includes("(AM)")) amBusy = true;
                else if (m.includes("(PM)")) pmBusy = true;
                else { amBusy = true; pmBusy = true; }
              }
            });
          });

          if (amBusy && pmBusy) this.blockMap.set(oldCore, 'ALL');
          else if (amBusy) this.blockMap.set(oldCore, 'AM');
          else if (pmBusy) this.blockMap.set(oldCore, 'PM');
          else this.blockMap.set(oldCore, 'NONE');
          
          this.log(`🪄 [兼務解消] 余剰の ${staff} を ${room} に専任配置し、${oldCore} の兼務を解消しました`);
          assigned = true;
          break;
        }
      }

      if (!assigned && !this.skipSections.includes("3号室") && !this.isForbidden(staff, "3号室")) {
        let current = split(this.dayCells["3号室"]);
        if (!this.hasNGPair(staff, current.map(extractStaffName), false)) {
          this.dayCells["3号室"] = join([...current, `${staff}${tag}`]);
          this.addU(staff, f);
          this.log(`♻️ [余剰配置] 兼務解消できる部屋がなかったため、${staff} を 3号室 に追加しました`);
        }
      }
    });

    const availSupport = this.initialAvailSupport; 
    const supportTargetRooms = split(this.ctx.customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT");
    const unassignedSupport = availSupport.filter((s: string) => !this.isUsed(s));
    
    unassignedSupport.forEach((staff: string) => {
      const b = this.blockMap.get(staff); if (b === 'ALL') return;
      for (const room of supportTargetRooms) {
        if (this.skipSections.includes(room) || this.isForbidden(staff, room)) continue;
        let current = split(this.dayCells[room]); 
        const currentCores = current.map(extractStaffName);
        const currentAmount = current.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
        
        const prevDayMembers = (this.prevDay && room && noCRooms.includes(room)) ? split(this.prevDay.cells[room] || "").map(extractStaffName) : [];

        if (currentAmount > 0 && !currentCores.includes(staff) && !this.hasNGPair(staff, currentCores, false) && !prevDayMembers.includes(staff)) {
          let tag = ""; let f = 1;
          if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else { this.blockMap.set(staff, 'ALL'); }
          this.dayCells[room] = join([...current, `${staff}${tag}`]); this.addU(staff, f); 
          this.log(`🤝 [サポート] 全ての配置完了後、${staff} を ${room} に追加しました`); break; 
        }
      }
    });

    this.logPhase("フェーズ5：仕上げ（最後に配置）");

    if (!this.skipSections.includes("昼当番")) {
      let currentLunch = split(this.dayCells["昼当番"]);
      let baseLunchTarget = this.ctx.customRules.lunchBaseCount ?? 3;
      const dayChar = this.day.label.match(/\((.*?)\)/)?.[1];
      if (dayChar) { const specialDay = (this.ctx.customRules.lunchSpecialDays || []).find((sd:any) => sd.day === dayChar); if (specialDay) baseLunchTarget = Number(specialDay.count); }
      const lunchTarget = baseLunchTarget;

      (this.ctx.customRules.lunchRoleRules || []).forEach((rule: any) => {
        if (rule.day === "毎日" || rule.day === dayChar) {
          const roleStaffList = split(this.ctx.monthlyAssign[rule.role] || "").map(extractStaffName);
          const todayRoleMembers = split(this.dayCells[rule.role] || "").map(extractStaffName);
          let selectedLunch: string | null = null;

          const sourceRooms = split(rule.sourceRooms);
          for (const srcStr of sourceRooms) {
            const { r: srcRoom, min } = parseRoomCond(srcStr);
            const roomMembers = split(this.dayCells[srcRoom] || "");
            const cap = this.dynamicCapacity[srcRoom] || 1;
            const currentAmount = roomMembers.reduce((sum, m) => sum + getStaffAmount(m), 0);
            
            const reqCount = min > 0 ? min : cap;
            if (currentAmount >= reqCount) {
              selectedLunch = roomMembers.map(extractStaffName).find(name => roleStaffList.includes(name) && !todayRoleMembers.includes(name) && !this.isForbidden(name, "昼当番") && !this.hasNGPair(name, currentLunch, false)) || null;
            }
            if (selectedLunch) break;
          }

          if (!selectedLunch) {
            selectedLunch = todayRoleMembers.find(name => !this.isForbidden(name, "昼当番") && !this.hasNGPair(name, currentLunch, false)) || null;
          }

          if (selectedLunch && !currentLunch.includes(selectedLunch) && currentLunch.length < lunchTarget) {
            currentLunch.push(selectedLunch);
            this.log(`🍱 [昼当番(${rule.role}確保)] ${rule.day}曜のルールにより、${selectedLunch} を昼当番に配置しました`);
          }
        }
      });

      const riMembers = split(this.dayCells["RI"]).map(extractStaffName);
      riMembers.forEach((name: string) => { 
        if (!currentLunch.includes(name) && currentLunch.length < lunchTarget && !this.isForbidden(name, "昼当番") && !this.hasNGPair(name, currentLunch, false)) { currentLunch.push(name); }
      });

      const prioritySecs = split(this.ctx.customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT");
      for (const sec of prioritySecs) {
        if (currentLunch.length >= lunchTarget) break;
        split(this.dayCells[sec]).forEach((name: string) => { 
          const core = extractStaffName(name); 
          if (!currentLunch.includes(core) && currentLunch.length < lunchTarget && !this.isForbidden(core, "昼当番") && !this.hasNGPair(core, currentLunch, false)) { currentLunch.push(core); }
        });
      }

      if (currentLunch.length < lunchTarget) {
        (this.ctx.customRules.lunchConditional || []).forEach((cond: any) => {
          if (!cond.section) return;
          const secMembers = split(this.dayCells[cond.section]);
          if (secMembers.length >= Number(cond.min)) {
            let picked = 0;
            for (const name of secMembers) {
              if (picked >= Number(cond.out) || currentLunch.length >= lunchTarget) break;
              const core = extractStaffName(name);
              if (!currentLunch.includes(core) && !this.isForbidden(core, "昼当番") && !this.hasNGPair(core, currentLunch, false)) { currentLunch.push(core); picked++; }
            }
          }
        });
      }
      
      if (currentLunch.length < lunchTarget) {
        const lastResortSecs = split(this.ctx.customRules.lunchLastResortSections ?? "治療");
        const lastResortMembers: string[] = [];
        lastResortSecs.forEach(sec => { split(this.dayCells[sec]).forEach((name: string) => lastResortMembers.push(extractStaffName(name))); });

        const fallbackCandidates = this.initialAvailGeneral.filter((name: string) => !lastResortMembers.includes(name) && !currentLunch.includes(name) && !this.isForbidden(name, "昼当番") && !this.hasNGPair(name, currentLunch, false));
        for (const name of fallbackCandidates) { if (currentLunch.length < lunchTarget) currentLunch.push(name); }
        
        if (currentLunch.length < lunchTarget) {
           const finalFallback = this.initialAvailGeneral.filter((name: string) => lastResortMembers.includes(name) && !currentLunch.includes(name) && !this.isForbidden(name, "昼当番") && !this.hasNGPair(name, currentLunch, false));
           for (const name of finalFallback) { if (currentLunch.length < lunchTarget) currentLunch.push(name); }
        }
      }
      this.dayCells["昼当番"] = join(currentLunch.slice(0, lunchTarget));
      this.log(`🍱 [昼当番] 計 ${currentLunch.length} 名を配置しました`);
    }

    const uTarget = this.dynamicCapacity.受付 !== undefined ? this.dynamicCapacity.受付 : 2;
    const currentUketsukeCount = split(this.dayCells["受付"]).reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
    const needsUketsukeHelp = currentUketsukeCount < uTarget;

    if (needsUketsukeHelp && !this.skipSections.includes("受付ヘルプ")) {
      let helpMems = split(this.dayCells["受付ヘルプ"]);
      if (helpMems.length === 0) {
        const lunchCores = split(this.dayCells["昼当番"]).map(extractStaffName);
        const getHelp = (exclude: string[]) => {
          let cand = this.initialAvailGeneral.filter((n: string) => {
            if (exclude.includes(n) || helpMems.map(extractStaffName).includes(n) || this.isForbidden(n, "受付ヘルプ") || cannotLS.includes(n) || isFixed(n)) return false; 
            return true;
          });
          if (cand.length > 0) { 
            cand = cand.filter((n: string) => !this.hasNGPair(n, helpMems.map(extractStaffName), false));
            cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); 
            return cand[0]; 
          }
          return null; 
        };
        const lunchHelpCandidate = getHelp(lunchCores);
        if (lunchHelpCandidate) { helpMems.push(`${lunchHelpCandidate}(12:15〜13:00)`); this.log(`🛎️ [受付ヘルプ] 昼枠(12:15〜)に ${lunchHelpCandidate} をアサインしました`); }
        const kenzoCores = split(this.dayCells["検像"]).map(extractStaffName);
        const validKenzo = kenzoCores.filter((n: string) => this.blockMap.get(n) !== 'AM' && !helpMems.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ") && !cannotLS.includes(n) && !isFixed(n) && !this.hasNGPair(n, helpMems.map(extractStaffName), false));
        let picked16 = validKenzo.length > 0 ? validKenzo[0] : null;
        if (!picked16) {
          const excl = lunchHelpCandidate ? [lunchHelpCandidate] : [];
          let cand = this.initialAvailGeneral.filter((n: string) => this.blockMap.get(n) !== 'AM' && !helpMems.map(extractStaffName).includes(n) && !excl.includes(n) && !this.isForbidden(n, "受付ヘルプ") && !cannotLS.includes(n) && !isFixed(n) && !this.hasNGPair(n, helpMems.map(extractStaffName), false));
          if (cand.length > 0) { cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); picked16 = cand[0]; }
        }
        if (picked16) { helpMems.push(`${picked16}(16:00〜)`); this.log(`🛎️ [受付ヘルプ] 夕枠(16:00〜)に ${picked16} をアサインしました`); }
      }
      this.dayCells["受付ヘルプ"] = join(helpMems);
    }
  }
}
