import React, { useEffect, useMemo, useState, useRef } from "react";

// ===================== 🌟 CSS & Styles =====================
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  html, body, #root { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
  body { background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.02em; font-size: 16px; overflow-x: hidden; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  textarea:focus, select:focus, input:focus { outline: 3px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 8px center; background-size: 1.2em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; padding-right: 32px !important; }
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; }
  .sticky-table-header th { position: sticky; top: 0; z-index: 20; background: #f8fafc; box-shadow: 0 2px 4px -1px rgba(0,0,0,0.05); }
  .sticky-header-panel { position: sticky; top: 0; z-index: 30; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); padding-top: 16px; margin-top: -16px; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1); }
  .calendar-row { transition: background-color 0.2s; cursor: pointer; }
  .calendar-row:hover { background-color: #f1f5f9 !important; }
  .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important; }
  .btn-hover:active { transform: translateY(0); box-shadow: none !important; }
  .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; cursor: pointer; }
  .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .rule-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center; width: 100%; }
  .rule-sel { padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; flex: 1 1 120px; font-size: 15px; transition: border-color 0.2s; }
  .rule-num { width: 60px; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 15px; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 22px; flex-shrink: 0; padding: 0 8px; transition: 0.2s; }
  .rule-del:hover { background: #fee2e2; border-radius: 6px; }
  .rule-add { background: #fff; color: #4f46e5; border: 2px dashed #a5b4fc; padding: 10px 16px; font-size: 16px; width: 100%; display: flex; justify-content: center; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 12px; transition: all 0.2s; }
  .rule-add:hover { background: #e0e7ff; border-color: #4f46e5; }
  .rule-label { font-size: 15px; font-weight: 700; color: #64748b; flex-shrink: 0; }
  .tabs-header { display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; padding: 0 12px; flex-wrap: wrap; }
  .tab-btn { background: none; border: none; padding: 12px 20px; font-size: 17px; font-weight: 800; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: 0.2s; }
  .tab-btn:hover { color: #3b82f6; }
  .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
  .name-textarea { width: 100%; height: 120px; padding: 12px; font-size: 15px !important; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 600; line-height: 1.5; }
  .modal-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); }
  .modal-content { background: #fff; padding: 32px; border-radius: 16px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; }
  .modal-wide { max-width: 1000px; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
  .modal-title { margin: 0; font-size: 24px; color: #0f172a; font-weight: 800; }
  .close-btn { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; transition: 0.2s; }
  .close-btn:hover { background: #e2e8f0; }
`;

// ===================== 🌟 Types & Constants =====================
type RenderGroup = { title: string; color: string; sections: string[] };
type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
type RejectReason = { hard: boolean, msg: string };
type WarningInfo = { level: 'red' | 'orange' | 'yellow'; title: string; msg: string; staff?: string; room?: string; };

interface CustomRules {
  staffList: string; receptionStaffList: string; supportStaffList: string; supportTargetRooms: string; 
  supportTargetRoomsLowImpact: string; supportTargetRoomsHighImpact: string; 
  customHolidays: string; capacity: Record<string, number>; dailyCapacities: any[]; dailyAdditions: any[]; 
  priorityRooms: string[]; fullDayOnlyRooms: string; noConsecutiveRooms: string; consecutiveAlertRooms: string;
  noLateShiftStaff: string; noLateShiftRooms: string; lateShiftLowPriorityStaff: string;
  closedRooms: any[]; ngPairs: any[]; fixed: any[]; forbidden: any[]; substitutes: any[]; pushOuts: any[]; emergencies: any[]; swapRules: any[]; 
  kenmuPairs: any[]; rescueRules: any[]; lateShifts: any[]; lunchBaseCount: number; lunchSpecialDays: any[]; lunchConditional: any[]; 
  lunchRoleRules: any[]; lunchPrioritySections: string; lunchLastResortSections: string; linkedRooms: any[];
  alertMaxKenmu: number; alertEmptyRooms: string; smartKenmu: any[];
}
type AutoAssignContext = { allStaff: string[]; activeGeneralStaff: string[]; activeReceptionStaff: string[]; monthlyAssign: Record<string, string>; customRules: CustomRules; };

const SECTIONS = ["明け","入り","土日休日代休","不在","待機","CT","MRI","RI","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","受付","受付ヘルプ"];
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

// ★修正：DSAの優先順位を大きく引き上げ（CTの次へ）
const DEFAULT_PRIORITY_ROOMS = ["治療", "受付", "MMG", "RI", "MRI", "CT", "DSA", "ポータブル", "透視（6号）", "透視（11号）", "骨塩", "1号室", "2号室", "5号室", "検像", "パノラマCT", "3号室", "受付ヘルプ", "透析後胸部"];

const DEFAULT_RULES: CustomRules = { 
  staffList: "", receptionStaffList: "", supportStaffList: "", supportTargetRooms: "2号室, 3号室", supportTargetRoomsLowImpact: "3号室,パノラマCT", supportTargetRoomsHighImpact: "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像", 
  customHolidays: "", capacity: { "CT": 4, "MRI": 3, "治療": 3, "RI": 1, "MMG": 1, "透視（6号）": 1, "透視（11号）": 1, "骨塩": 1, "1号室": 1, "5号室": 1, "パノラマCT": 1 }, 
  dailyCapacities: [], dailyAdditions: [], priorityRooms: DEFAULT_PRIORITY_ROOMS, fullDayOnlyRooms: "", noConsecutiveRooms: "ポータブル", consecutiveAlertRooms: "ポータブル, 透視（6号）", 
  noLateShiftStaff: "", noLateShiftRooms: "透視（11号）", lateShiftLowPriorityStaff: "", closedRooms: [], ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], 
  emergencies: [{ threshold: 19, type: "change_capacity", role: "", section: "CT", newCapacity: 3 }, { threshold: 18, type: "staff_assign", role: "", section: "2号室", newCapacity: 3, staff: "" }], 
  // ★修正：DSA玉突きをデフォルト追加
  swapRules: [{ targetRoom: "ポータブル", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }, { targetRoom: "パノラマCT", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }, { targetRoom: "DSA", triggerRoom: "5号室", sourceRooms: "透視（6号）、1号室、2号室、CT(4)" }], 
  kenmuPairs: [{ s1: "MMG", s2: "透視（11号）", isExclusive: true }, { s1: "骨塩", s2: "検像", isExclusive: true }, { s1: "パノラマCT", s2: "透視（6号）", isExclusive: true }, { s1: "2号室", s2: "パノラマCT", isExclusive: false }], 
  rescueRules: [{ targetRoom: "ポータブル", sourceRooms: "3号室、2号室、1号室、5号室、CT(4)" }, { targetRoom: "DSA", sourceRooms: "5号室、2号室、検像、CT(4)" }, { targetRoom: "1号室", sourceRooms: "3号室、パノラマCT、CT(4)" }, { targetRoom: "2号室", sourceRooms: "3号室、パノラマCT、CT(4)" }, { targetRoom: "3号室", sourceRooms: "パノラマCT、CT(4)" }], 
  lateShifts: [{ section: "透視（6号）", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" }], lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], lunchRoleRules: [{ day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" }], lunchPrioritySections: "RI, 1号室, 2号室, 3号室, 5号室", lunchLastResortSections: "治療", 
  linkedRooms: [{ target: "ポータブル", sources: "3号室(1)、2号室、1号室、5号室、CT(4)" }, { target: "検像", sources: "骨塩" }, { target: "DSA", sources: "5号室、2号室、CT(4)、パノラマCT" }, { target: "パノラマCT", sources: "透視（6号）、2号室" }], 
  alertMaxKenmu: 3, alertEmptyRooms: "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像,受付", smartKenmu: [{ targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" }] 
};

const KEY_ALL_DAYS = "shifto_alldays_v278"; const KEY_MONTHLY = "shifto_monthly_v278"; const KEY_RULES = "shifto_rules_v278";

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

function isMonthlyMainStaff(section: string, name: string, monthlyAssign: Record<string, string>) {
  if (!section) return false; return getMonthlyStaffForSection(section, monthlyAssign).includes(extractStaffName(name));
}

function getStaffAmount(name: string) {
  if (ROLE_PLACEHOLDERS.includes(extractStaffName(name))) return 0;
  return (name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/)) ? 0.5 : 1;
}

const btnStyle = (bg: string, color: string = "#fff", fontSize: number = 15): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 6 });
const panelStyle = (): React.CSSProperties => ({ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" });
const cellStyle = (isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties => {
  let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff");
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff");
  return { border: "1px solid #e2e8f0", padding: "10px 12px", background: bg, fontWeight: isHeader ? 800 : 700, textAlign: isHeader ? "center" : "left", fontSize: 16, color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, transition: "background-color 0.2s" };
};

const RENDER_GROUPS: RenderGroup[] = [
  { title: "休務・夜勤", color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] },
  { title: "モダリティ", color: "#3b82f6", sections: ["CT","MRI","RI","治療"] },
  { title: "一般撮影・透視・その他", color: "#10b981", sections: ["MMG","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","検像","受付","受付ヘルプ","昼当番"] },
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
        <button className="btn-hover" onClick={onClose} style={{ ...btnStyle("#2563eb", "#fff", 16), width: "100%", justifyContent: "center", padding: "16px" }}>閉じる</button>
      </div>
    </div>
  </div>
);

const RuleCard = ({ bg, border, color, icon, title, desc, children }: any) => (
  <div style={{ background: bg, padding: 24, borderRadius: 12, border: `2px solid ${border}`, marginBottom: 20 }}>
    <h5 style={{ margin: "0 0 12px 0", color, fontSize: 18, fontWeight: 800 }}>{icon} {title}</h5>
    {desc && <p style={{ fontSize: 15, color: "#166534", marginTop: 0, marginBottom: 16 }}>{desc}</p>}
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
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 16, padding: "6px 12px", fontSize: 15, fontWeight: 700, border: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: 6 }}>
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
    const dObj = new Date(year, month - 1, validDay, 12, 0, 0); const day = dObj.getDay();
    const diff = dObj.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(dObj.getTime()); mon.setDate(diff);
    onChange(`${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`); setIsOpen(false);
  };
  return (
    <div style={{ position: "relative" }}>
      <button className="btn-hover" onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff", "#2563eb"), border: "1px solid #bfdbfe", padding: "8px 14px", fontSize: 16 }}>📅 {targetMonday} 週 ▼</button>
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
                        return <td key={dIdx} style={{ padding: 10, color, fontWeight: isHoliday ? 800 : 600 }}>{d}</td>;
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
      <label style={{ fontSize: 17, fontWeight: 800, color: "#475569", marginBottom: 12 }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {members.map((m, i) => {
          const coreName = extractStaffName(m); const currentMod = m.substring(coreName.length);
          const isPlaceholder = ROLE_PLACEHOLDERS.includes(coreName) || (customOptions.includes(coreName) && !activeStaff.includes(coreName));
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime && !isFuzai ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime && !isFuzai ? "#334155" : "#0369a1"), borderRadius: 16, padding: "8px 12px 8px 14px", fontSize: 16, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${isPlaceholder ? "#fde047" : (noTime && !isFuzai ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 700 }}>
              <span>{coreName}</span>
              {(!noTime || isFuzai) && (
                <select value={currentMod} onChange={(e: any) => handleTimeChange(i, e.target.value)} style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 16, fontWeight: 700, color: "inherit", cursor: "pointer", padding: "0 20px 0 6px" }}>
                  {isFuzai ? <><option value="">全休</option><option value="(AM)">AM休</option><option value="(PM)">PM休</option></> : isTaiki ? <><option value="(17:00〜19:00)">17:00〜19:00</option><option value="(17:00〜22:00)">17:00〜22:00</option><option value="(17:00〜)">17:00〜</option></> : <><option value="">終日</option><option value="(AM)">AM</option><option value="(PM)">PM</option>{currentMod && !["", "(AM)", "(PM)"].includes(currentMod) && !TIME_OPTIONS.includes(currentMod) && (<option value={currentMod}>{currentMod.replace(/[()]/g, '')}</option>)}{TIME_OPTIONS.filter(t => t !== "(AM)" && t !== "(PM)").map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</>}
                </select>
              )}
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 6 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e: any) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 16, color: "#64748b", flex: 1, minWidth: 100, cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "8px 24px 8px 12px" }}>
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
  if (!match) return <li key={i} style={{ padding: "8px 12px", marginBottom: "4px", background: "#f8fafc", borderRadius: "6px", fontSize: 15, color: "#475569", lineHeight: 1.6, wordBreak: "break-word" }}>{logStr.substring(1)}</li>;
  const [_, icon, category, text] = match;
  let bg = "#f8fafc"; let border = "#e2e8f0"; let color = "#475569"; let badgeBg = "#e2e8f0"; let badgeColor = "#475569";
  if (category.includes("配置決定") || category.includes("増枠") || category.includes("初期優先度")) { bg = "#eff6ff"; border = "#bfdbfe"; color = "#1e3a8a"; badgeBg = "#dbeafe"; badgeColor = "#1d4ed8"; }
  else if (category.includes("緊急") || category.includes("除外") || category.includes("スキップ")) { bg = "#fef2f2"; border = "#fecaca"; color = "#7f1d1d"; badgeBg = "#fee2e2"; badgeColor = "#b91c1c"; }
  else if (category.includes("救済発動") || category.includes("特例サポート") || category.includes("救済") || category.includes("汎用救済")) { bg = "#fff7ed"; border = "#fed7aa"; color = "#9a3412"; badgeBg = "#ffedd5"; badgeColor = "#c2410c"; }
  else if (category.includes("代打") || category.includes("交換")) { bg = "#fff7ed"; border = "#fed7aa"; color = "#7c2d12"; badgeBg = "#ffedd5"; badgeColor = "#c2410c"; }
  else if (category.includes("兼務") || category.includes("負担軽減") || category.includes("スマート兼務") || category.includes("兼務解消")) { bg = "#ecfdf5"; border = "#a7f3d0"; color = "#064e3b"; badgeBg = "#d1fae5"; badgeColor = "#047857"; }
  else if (category.includes("遅番")) { bg = "#f5f3ff"; border = "#ddd6fe"; color = "#4c1d95"; badgeBg = "#ede9fe"; badgeColor = "#6d28d9"; }
  else if (category.includes("玉突き")) { bg = "#e0f2fe"; border = "#bae6fd"; color = "#0c4a6e"; badgeBg = "#bae6fd"; badgeColor = "#0369a1"; }
  else if (category.includes("専従") || category.includes("役割")) { bg = "#f0fdfa"; border = "#bbf7d0"; color = "#14532d"; badgeBg = "#dcfce7"; badgeColor = "#15803d"; }
  else if (category.includes("昼当番") || category.includes("ヘルプ") || category.includes("サポート") || category.includes("余剰") || category.includes("ポータブル特例") || category.includes("ポータブル連動")) { bg = "#fdf4ff"; border = "#f5d0fe"; color = "#701a75"; badgeBg = "#fae8ff"; badgeColor = "#86198f"; }
  else if (category.includes("低影響補充")) { bg = "#f0fdfa"; border = "#ccfbf1"; color = "#0f766e"; badgeBg = "#ccfbf1"; badgeColor = "#0f766e"; }
  return (
    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", marginBottom: "6px", background: bg, borderRadius: "8px", border: `1px solid ${border}`, fontSize: 15, color, lineHeight: 1.6, fontWeight: 600, wordBreak: "break-word" }}>
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
  dynamicCapacity: Record<string, number> = {}; assignCounts: Record<string, number> = {}; maxAssigns: Record<string, number> = {};
  counts: Record<string, number> = {}; roomCounts: Record<string, Record<string, number>> = {};
  initialAvailAll: string[] = []; initialAvailGeneral: string[] = []; initialAvailSupport: string[] = []; initialAvailReception: string[] = [];
  logInfo: string[] = []; staffAssignments: {staff: string, section: string}[] = [];

  private log(msg: string) { this.logInfo.push(`・${msg}`); }
  private logPhase(phaseName: string) { this.logInfo.push(`・■${phaseName}`); }

  getPastRoomCount(staff: string, room: string) {
    const isMonthlyTarget = ["CT", "MRI"].includes(room);
    const targetPastDays = isMonthlyTarget ? this.pastDaysInMonth : this.pastDaysInWeek;
    return targetPastDays.filter(pd => split(pd.cells[room] || "").map(extractStaffName).includes(staff)).length;
  }

  getPastLateShiftCount(staff: string) {
    let count = 0;
    this.pastDaysInMonth.forEach(pd => { Object.values(pd.cells).forEach(val => { split(val as string).forEach(m => { if (extractStaffName(m) === staff && (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:"))) count++; }); }); });
    return count;
  }

  getTodayRoomCount(staff: string) {
    let count = 0;
    Object.keys(this.dayCells).forEach(sec => { if (REST_SECTIONS.includes(sec) || ["待機", "昼当番", "受付", "受付ヘルプ"].includes(sec)) return; split(this.dayCells[sec]).forEach(m => { if (extractStaffName(m) === staff && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:")) count++; }); }); 
    return count;
  }

  private isHalfDayBlockedForFullDayRoom(staff: string, section: string): { hard: boolean; monthlyHalfException: boolean } {
    const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "");
    if (!fullDayOnlyList.includes(section)) return { hard: false, monthlyHalfException: false };
    const b = this.blockMap.get(staff);
    if (b === 'NONE') return { hard: false, monthlyHalfException: false };
    const monthly = isMonthlyMainStaff(section, staff, this.ctx.monthlyAssign);
    if (!monthly) return { hard: true, monthlyHalfException: false };
    return { hard: false, monthlyHalfException: true };
  }

  private isHardNoConsecutive(staff: string, room: string): boolean {
    const noCRooms = split(this.ctx.customRules.noConsecutiveRooms || "");
    if (!this.prevDay || !noCRooms.includes(room)) return false;
    const prev = split(this.prevDay.cells[room] || "").map(extractStaffName);
    return prev.includes(staff);
  }

  private getRoomDependencyCount(room: string): number {
    let score = 0;
    (this.ctx.customRules.linkedRooms || []).forEach((r: any) => { if (split(r.sources || "").some((s: string) => parseRoomCond(s).r === room)) score += 3; if (r.target === room) score += 1; });
    (this.ctx.customRules.rescueRules || []).forEach((r: any) => { if (split(r.sourceRooms || "").some((s: string) => parseRoomCond(s).r === room)) score += 2; if (r.targetRoom === room) score += 1; });
    (this.ctx.customRules.swapRules || []).forEach((r: any) => { if (split(r.sourceRooms || "").some((s: string) => parseRoomCond(s).r === room)) score += 2; if (r.triggerRoom === room) score += 1; if (r.targetRoom === room) score += 1; });
    (this.ctx.customRules.kenmuPairs || []).forEach((p: any) => { if (p.s1 === room || p.s2 === room) score += 2; });
    return score;
  }

  private getRescueSourceScore(srcRoom: string, targetRoom: string, staff?: string): number {
    let score = 0;
    const lowImpact = split(this.ctx.customRules.supportTargetRoomsLowImpact || "3号室,パノラマCT");
    const highImpact = split(this.ctx.customRules.supportTargetRoomsHighImpact || "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像");
    if (srcRoom === targetRoom) score += 9999;
    if (lowImpact.includes(srcRoom)) score -= 1000;
    if (highImpact.includes(srcRoom)) score += 1000;
    score += this.getRoomDependencyCount(srcRoom) * 100;
    const srcMems = split(this.dayCells[srcRoom] || "");
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName);
    const isOnlySupport = srcMems.length > 0 && srcMems.every(m => supportStaffList.includes(extractStaffName(m)));
    if (isOnlySupport) score += 5000; else { const currentAmount = srcMems.reduce((sum, m) => sum + getStaffAmount(m), 0); if (currentAmount <= 1) score += 500; else if (currentAmount <= 2) score += 200; }
    if (staff) { const b = this.blockMap.get(staff); if ((b === 'AM' || b === 'PM') && highImpact.includes(srcRoom)) score += 300; }
    if (this.clearSections.includes(srcRoom) || this.skipSections.includes(srcRoom)) score += 5000;
    return score;
  }

  updateBlockMapAfterKenmu(core: string, pushStr: string) {
    const current = this.blockMap.get(core);
    let next: string;
    if (pushStr.includes("(AM)")) next = (current === 'PM' || current === 'ALL') ? 'ALL' : 'AM';
    else if (pushStr.includes("(PM)")) next = (current === 'AM' || current === 'ALL') ? 'ALL' : 'PM';
    else next = 'ALL';
    this.blockMap.set(core, next);
  }

  canAddKenmu(staff: string, targetRoom: string, bypassExclusiveForSource: boolean = false): boolean {
    const limit = this.ctx.customRules.alertMaxKenmu || 3;
    const currentRoomCount = this.getTodayRoomCount(staff);
    if (!split(this.dayCells[targetRoom] || "").map(extractStaffName).includes(staff) && currentRoomCount >= limit) return false;
    const exclusivePairs = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.isExclusive);
    for (const p of exclusivePairs) {
      const inS1 = split(this.dayCells[p.s1] || "").map(extractStaffName).includes(staff);
      const inS2 = split(this.dayCells[p.s2] || "").map(extractStaffName).includes(staff);
      if (inS1 || inS2) { if (targetRoom !== p.s1 && targetRoom !== p.s2) return false; }
      if (targetRoom === p.s1 || targetRoom === p.s2) { if (!bypassExclusiveForSource) { const currentRooms = ROOM_SECTIONS.filter(r => split(this.dayCells[r] || "").map(extractStaffName).includes(staff) && !["待機", "昼当番", "受付", "受付ヘルプ"].includes(r)); const hasOutsideRoom = currentRooms.some(r => r !== p.s1 && r !== p.s2); if (hasOutsideRoom) return false; } }
    }
    return true;
  }

  isMmgCapable(staff: string): boolean { return split(this.ctx.monthlyAssign.MMG || "").map(extractStaffName).includes(extractStaffName(staff)); }

  getEffectiveTarget(room: string, baseCap: number) {
    const dayChar = this.day.label.match(/\((.*?)\)/)?.[1];
    if (!dayChar) return { cap: baseCap, amClosed: false, pmClosed: false, allClosed: false };
    const closed = (this.ctx.customRules.closedRooms || []).filter((r: any) => r.room === room && r.day === dayChar);
    let amClosed = false; let pmClosed = false; let allClosed = false;
    closed.forEach((r: any) => {
       if (r.time === "全日") allClosed = true;
       else if (r.time === "(AM)") amClosed = true;
       else if (r.time === "(PM)") pmClosed = true;
    });
    if (amClosed && pmClosed) allClosed = true;
    if (allClosed) return { cap: 0, amClosed: true, pmClosed: true, allClosed: true };
    if (amClosed || pmClosed) return { cap: baseCap / 2, amClosed, pmClosed, allClosed: false };
    return { cap: baseCap, amClosed: false, pmClosed: false, allClosed: false };
  }

  constructor(day: DayData, prevDay: DayData | null, pastDaysInMonth: DayData[], pastDaysInWeek: DayData[], ctx: AutoAssignContext, isSmartFix: boolean = false) {
    this.day = { ...day }; this.prevDay = prevDay; this.pastDaysInMonth = pastDaysInMonth; this.pastDaysInWeek = pastDaysInWeek; this.ctx = ctx; this.dayCells = { ...day.cells };
    this.dynamicCapacity = { ...(ctx.customRules.capacity || {}) }; this.isSmartFix = isSmartFix;
  }

  execute(): DayData {
    this.logPhase("フェーズ1：前提処理");
    this.initCounts();
    if (this.prevDay?.cells["入り"]) {
      const iriMembers = split(this.prevDay.cells["入り"]).map(extractStaffName);
      this.dayCells["明け"] = join(Array.from(new Set([...split(this.dayCells["明け"]), ...iriMembers])));
      if (iriMembers.length > 0) this.log(`[前日処理] 昨日の「入り」メンバーを「明け」に配置`);
    }
    if (this.day.isPublicHoliday) { this.log(`🎌 祝日のためスキップ`); return { ...this.day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])), logInfo: this.logInfo }; }
    
    const dayChar = this.day.label.match(/\((.*?)\)/)?.[1];
    if (dayChar) { (this.ctx.customRules.closedRooms || []).forEach((rule: any) => { if (rule.day === dayChar) this.log(`🛑 曜日ルールにより ${rule.room} の ${rule.time} は閉室`); }); }

    if (!this.isSmartFix) {
      ROOM_SECTIONS.forEach(sec => { this.dayCells[sec] = join(split(this.dayCells[sec]).filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); });
      this.dayCells["昼当番"] = ""; this.dayCells["受付ヘルプ"] = ""; this.dayCells["待機"] = "";
    }
    this.buildBlockMap();
    if (this.isSmartFix) {
      WORK_SECTIONS.forEach(sec => {
        let current = split(this.dayCells[sec]);
        let next = current.filter(m => { const core = extractStaffName(m); const block = this.blockMap.get(core); if (ROLE_PLACEHOLDERS.includes(core)) return true; if (block === 'ALL') return false; if (block === 'AM' && (!m.includes("(") || m.includes("(AM)"))) return false; if (block === 'PM' && (!m.includes("(") || m.includes("(PM)"))) return false; return true; });
        if (current.length !== next.length) { this.dayCells[sec] = join(next); }
      });
    }
    this.applyDailyAdditions(); this.evaluateEmergencies(); this.cleanUpDayCells();
    WORK_SECTIONS.forEach(sec => { split(this.dayCells[sec]).forEach((m: string) => { const core = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(core) && this.blockMap.get(core) !== 'ALL') this.addU(core, getStaffAmount(m)); }); });
    this.prepareAvailability();

    if (this.isSmartFix) {
      const priority = this.ctx.customRules.priorityRooms || SECTIONS;
      priority.forEach((room: string) => {
         if (REST_SECTIONS.includes(room) || ["昼当番","受付ヘルプ","待機","透析後胸部"].includes(room)) return;
         if ((this.ctx.customRules.linkedRooms || []).some((r:any) => r.target === room)) return;
         const cap = this.dynamicCapacity[room] || 1; const eff = this.getEffectiveTarget(room, cap);
         if (eff.allClosed) return;
         let current = split(this.dayCells[room]);
         const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
         const isFixedToAny = (staffName: string) => (this.ctx.customRules.fixed || []).some((r:any) => extractStaffName(r.staff) === extractStaffName(staffName));
         let sortedAvail = [...this.initialAvailGeneral];
         sortedAvail.sort((a, b) => { const scoreA = this.blockMap.get(a) === 'NONE' ? 0 : 100; const scoreB = this.blockMap.get(b) === 'NONE' ? 0 : 100; if (scoreA !== scoreB) return scoreA - scoreB; return this.getPastRoomCount(a, room) - this.getPastRoomCount(b, room); });
         while (getAmt(current) < eff.cap) {
            const freeStaff = sortedAvail.find((s: string) => { 
                if (this.assignCounts[s] >= 1) return false; 
                if (this.assignCounts[s] === 0.5) { if (!["CT", "MRI", "治療", "RI"].includes(room)) return false; if (!isMonthlyMainStaff(room, s, this.ctx.monthlyAssign)) return false; } 
                if (this.isForbidden(s, room)) return false; if (room === "MMG" && !this.isMmgCapable(s)) return false; if (!this.canAddKenmu(s, room)) return false; if (this.isHardNoConsecutive(s, room)) return false; if (isFixedToAny(s)) return false; 
                const b = this.blockMap.get(s);
                if (eff.pmClosed && b === 'AM') return false; 
                if (eff.amClosed && b === 'PM') return false; 
                return true; 
            });
            if (!freeStaff) break;
            const block = this.blockMap.get(freeStaff); let tag = ""; let p = 1; 
            if (block === 'AM') { tag = "(PM)"; p = 0.5; } else if (block === 'PM') { tag = "(AM)"; p = 0.5; }
            else { if (eff.pmClosed) { tag = "(AM)"; p = 0.5; } else if (eff.amClosed) { tag = "(PM)"; p = 0.5; } }
            current.push(`${freeStaff}${tag}`); this.addU(freeStaff, p); sortedAvail = sortedAvail.filter(s => s !== freeStaff); this.log(`✅ [配置決定] ${room} に ${freeStaff}${tag} を補充`);
         }
         this.dayCells[room] = join(current);
      });
      return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
    } else {
      this.logPhase("フェーズ2：例外・代打処理");
      (this.ctx.customRules.fixed || []).forEach((rule: any) => { if (!rule.staff || !rule.section) return; Object.keys(this.dayCells).forEach(sec => { if (sec === rule.section) return; if (REST_SECTIONS.includes(sec)) return; const before = split(this.dayCells[sec]); const after = before.filter(m => extractStaffName(m) !== extractStaffName(rule.staff)); if (before.length !== after.length) { this.dayCells[sec] = join(after); this.assignCounts[extractStaffName(rule.staff)] = 0; this.blockMap.set(extractStaffName(rule.staff), 'NONE'); } }); });
      (this.ctx.customRules.fixed || []).forEach((rule: any) => { 
          const core = extractStaffName(rule.staff); 
          if (!core || !rule.section || !this.initialAvailAll.includes(core) || this.isUsed(core) || this.isForbidden(core, rule.section) || rule.section === "透析後胸部") return; 
          if (this.isHardNoConsecutive(core, rule.section)) return;
          if (this.skipSections.includes(rule.section)) return; 
          const current = split(this.dayCells[rule.section]); 
          if (current.map(extractStaffName).includes(core) || this.hasNGPair(core, current.map(extractStaffName), false)) return; 
          const b = this.blockMap.get(core); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; 
          this.blockMap.set(core, 'ALL'); this.dayCells[rule.section] = join([...current, `${core}${tag}`]); this.addU(core, tag?0.5:1); this.log(`🔒 [専従] ${core} を ${rule.section} に固定配置`); 
      });
      this.staffAssignments.forEach((rule: any) => { 
          const core = extractStaffName(rule.staff); 
          if (!core || !rule.section || !this.initialAvailAll.includes(core) || this.isUsed(core) || this.isForbidden(core, rule.section) || rule.section === "透析後胸部") return; 
          if (this.isHardNoConsecutive(core, rule.section)) return;
          if (this.skipSections.includes(rule.section)) return; 
          const current = split(this.dayCells[rule.section]); 
          if (current.map(extractStaffName).includes(core) || this.hasNGPair(core, current.map(extractStaffName), false)) return; 
          const b = this.blockMap.get(core); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; 
          this.blockMap.set(core, 'ALL'); this.dayCells[rule.section] = join([...current, `${core}${tag}`]); this.addU(core, tag?0.5:1); this.log(`🚨 [緊急専従] ${core} を ${rule.section} に強制配置`); 
      });
      Object.values(this.roleAssignments).forEach((ra: any) => { if (this.skipSections.includes(ra.section) || ra.section === "透析後胸部") return; const candidates = split(this.ctx.monthlyAssign[ra.role] || "").map(extractStaffName); const targetAvail = ["受付"].includes(ra.role) ? this.initialAvailReception : this.initialAvailGeneral; const staff = candidates.find(s => targetAvail.includes(s) && !this.isUsed(s) && !this.isForbidden(s, ra.section)); if (staff && !split(this.dayCells[ra.section]).map(extractStaffName).includes(staff)) { const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.blockMap.set(staff, 'ALL'); this.dayCells[ra.section] = join([...split(this.dayCells[ra.section]), `${staff}${tag}`]); this.addU(staff, tag?0.5:1); this.log(`📌 [緊急役割] ${staff} を ${ra.section} に配置`); } });
      (this.ctx.customRules.substitutes || []).forEach((sub: any) => {
         const targets = split(sub.target).map(extractStaffName); 
         if (targets.length === 0 || !sub.section || this.skipSections.includes(sub.section) || sub.section === "透析後胸部") return;
         const currentRoomStaff = split(this.dayCells[sub.section]).map(extractStaffName); if (targets.some(t => currentRoomStaff.includes(t))) return;
         const trigger = targets.every(t => !this.initialAvailAll.includes(t));
         if (trigger) {
           const fallbackStaff = split(sub.subs).map(extractStaffName).filter(s => this.initialAvailGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, sub.section));
           if (fallbackStaff.length > 0) {
             const currentRoomMembers = split(this.dayCells[sub.section]); 
             for (const f of fallbackStaff) {
               if (this.isHalfDayBlockedForFullDayRoom(f, sub.section).hard) continue;
               if (!this.hasNGPair(f, currentRoomMembers.map(extractStaffName), false) && currentRoomMembers.length < 6) {
                 if (!this.canAddKenmu(f, sub.section)) continue;
                 const b = this.blockMap.get(f); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.blockMap.set(f, 'ALL');
                 this.dayCells[sub.section] = join([...currentRoomMembers, `${f}${tag}`]); this.addU(f, tag?0.5:1); this.log(`🔄 [代打] ${f} を ${sub.section} に配置`); break;
               }
             }
           }
         }
       });
       (this.ctx.customRules.pushOuts || []).forEach((po: any) => {
         const s1 = extractStaffName(po.s1 || po.triggerStaff); const s2 = extractStaffName(po.s2 || po.targetStaff); const tSec = po.triggerSection;
         if (!s1 || !s2 || !tSec || !po.targetSections) return;
         if (this.initialAvailGeneral.includes(s1) && this.initialAvailGeneral.includes(s2)) {
           const currentTSec = split(this.dayCells[tSec]).map(extractStaffName);
           if (currentTSec.includes(s1) && currentTSec.includes(s2)) {
             const allowedRooms = split(po.targetSections).filter(s => !this.skipSections.includes(s) && s !== "透析後胸部");
             for (const room of allowedRooms) {
               if (this.isForbidden(s2, room) || this.isHalfDayBlockedForFullDayRoom(s2, room).hard) continue;
               const currentRoom = split(this.dayCells[room]);
               if (this.hasNGPair(s2, currentRoom.map(extractStaffName), false) || !this.canAddKenmu(s2, room)) continue;
               const actualCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
               const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
               if (getAmt(currentRoom) < actualCap) {
                 this.dayCells[tSec] = join(split(this.dayCells[tSec]).filter(m => extractStaffName(m) !== s2));
                 const b = this.blockMap.get(s2); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; 
                 this.dayCells[room] = join([...currentRoom, `${s2}${tag}`]);
                 this.addU(s2, tag === "(AM)" || tag === "(PM)" ? 0.5 : 1);
                 this.blockMap.set(s2, tag === "" ? 'ALL' : (tag === "(AM)" ? 'PM' : 'AM'));
                 this.log(`🎱 [玉突き] ${s1} と被ったため、${s2} を ${room} に移動しました`); break;
               }
             }
           }
         }
       });

      this.logPhase("フェーズ3：メイン配置");
      const PRIORITY_LIST = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
      const linkedTargetRooms = (this.ctx.customRules.linkedRooms || []).map((r: any) => r.target);
      PRIORITY_LIST.forEach((room: string) => {
        if (this.skipSections.includes(room) || ["受付ヘルプ", "昼当番", "待機", "透析後胸部"].includes(room)) return;
        let targetCount = this.dynamicCapacity[room] !== undefined ? this.dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
        let currentMembersForTarget = split(this.dayCells[room]);
        const placeholders = currentMembersForTarget.filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)));
        if (placeholders.length > 0) { targetCount += placeholders.length; this.dayCells[room] = join(currentMembersForTarget.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); }
        if (room === "受付") {
          let currentUketsuke = split(this.dayCells["受付"]); const uketsukeMonthly = split(this.ctx.monthlyAssign.受付 || "").map(extractStaffName);
          for (const name of uketsukeMonthly) { if (this.initialAvailAll.includes(name) && !this.isUsed(name) && !currentUketsuke.map(extractStaffName).includes(name)) { const b = this.blockMap.get(name); if (b === 'ALL') continue; let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; currentUketsuke.push(`${name}${tag}`); this.addU(name, tag?0.5:1); this.blockMap.set(name, 'ALL'); } }
          const currentUketsukeAmount = currentUketsuke.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
          let neededUketsuke = targetCount - currentUketsukeAmount;
          if (neededUketsuke > 0 && !linkedTargetRooms.includes(room)) {
             const pickedUketsuke = this.pick(this.initialAvailReception, this.initialAvailReception, Math.ceil(neededUketsuke), "受付", currentUketsuke);
             pickedUketsuke.forEach((name: string) => { const b = this.blockMap.get(name); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; currentUketsuke.push(`${name}${tag}`); this.addU(name, tag?0.5:1); this.blockMap.set(name, 'ALL'); });
          }
          this.dayCells["受付"] = join(currentUketsuke);
        } else {
          let preferredList: string[] = [];
          if (["治療", "RI", "CT", "MRI", "MMG"].includes(room)) { preferredList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign).filter((s: string) => this.initialAvailGeneral.includes(s)); } 
          else if (this.ctx.monthlyAssign[room]) { preferredList = split(this.ctx.monthlyAssign[room]).map(extractStaffName).filter((s: string) => this.initialAvailGeneral.includes(s)); }
          let candidates = (["治療", "RI", "MMG"].includes(room)) ? (preferredList.length > 0 ? preferredList : this.initialAvailGeneral) : this.initialAvailGeneral;
          const partnerRooms = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.s1 === room || p.s2 === room).map((p: any) => p.s1 === room ? p.s2 : p.s1);
          const hasPartnerFilled = partnerRooms.some(pr => split(this.dayCells[pr]).reduce((sum, m) => sum + getStaffAmount(m), 0) > 0);
          if (!((this.ctx.customRules.linkedRooms || []).some((r: any) => r.target === room)) && !hasPartnerFilled) { this.fill(candidates, room, preferredList, targetCount); }
        }
      });
    }
    this.processPostTasks();
    return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
  }

  initCounts() {
    this.ctx.allStaff.forEach(s => { this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.roomCounts[s] = {}; SECTIONS.forEach(sec => this.roomCounts[s][sec] = 0); this.counts[s] = 0; });
    this.pastDaysInMonth.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (["CT", "MRI"].includes(sec)) { split(val as string).forEach(m => { const c = extractStaffName(m); if (this.roomCounts[c]) { this.roomCounts[c][sec]++; this.counts[c]++; } }); } }); });
    this.pastDaysInWeek.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (!["CT", "MRI"].includes(sec)) { split(val as string).forEach(m => { const c = extractStaffName(m); if (this.roomCounts[c]) { this.roomCounts[c][sec]++; this.counts[c]++; } }); } }); });
  }

  buildBlockMap() {
    this.ctx.allStaff.forEach(s => this.blockMap.set(s, 'NONE'));
    ["明け","入り","土日休日代休"].forEach(sec => { split(this.dayCells[sec]).forEach(m => this.blockMap.set(extractStaffName(m), 'ALL')); });
    split(this.dayCells["不在"]).forEach(m => { const core = extractStaffName(m); if (m.includes("(AM)")) this.blockMap.set(core, 'AM'); else if (m.includes("(PM)")) this.blockMap.set(core, 'PM'); else this.blockMap.set(core, 'ALL'); });
  }

  applyDailyAdditions() {
    (this.ctx.customRules.dailyAdditions || []).forEach((rule: any) => {
      if (rule.date === this.day.id && rule.section && rule.count > 0 && rule.section !== "透析後胸部") {
        const placeholderName = rule.section + "枠" + (rule.time === "全日" || !rule.time ? "" : rule.time);
        let current = split(this.dayCells[rule.section]);
        if (!current.includes(placeholderName)) { for (let i = 0; i < rule.count; i++) current.push(placeholderName); this.dayCells[rule.section] = join(current); }
      }
    });
  }

  evaluateEmergencies() {
    const tempAvailCount = this.ctx.activeGeneralStaff.filter(s => this.blockMap.get(s) !== 'ALL').length;
    (this.ctx.customRules.emergencies || []).forEach((em: any) => { if (tempAvailCount <= Number(em.threshold)) { if (em.type === "role_assign" && em.role && em.section) this.roleAssignments[em.role] = em; if (em.type === "staff_assign" && em.staff && em.section) this.staffAssignments.push({ staff: em.staff, section: em.section }); if (em.type === "clear" && em.section) { this.skipSections.push(em.section); this.clearSections.push(em.section); } if (em.type === "change_capacity" && em.section) this.dynamicCapacity[em.section] = Number(em.newCapacity); } });
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

  prepareAvailability() {
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName);
    this.initialAvailAll = this.ctx.allStaff.filter(s => this.blockMap.get(s) !== 'ALL').sort((a, b) => {
      if ((this.counts[a] || 0) !== (this.counts[b] || 0)) return (this.counts[a] || 0) - (this.counts[b] || 0);
      return a.localeCompare(b, 'ja');
    });
    this.initialAvailSupport = this.initialAvailAll.filter(s => supportStaffList.includes(s));
    this.initialAvailGeneral = this.initialAvailAll.filter(s => this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s));
    this.initialAvailReception = this.initialAvailAll.filter(s => this.ctx.activeReceptionStaff.includes(s) || (this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s)));
  }

  isUsed(name: string): boolean { return (this.assignCounts[name] || 0) >= (this.maxAssigns[name] || 1); }
  addU(name: string, f = 1): void { this.assignCounts[name] = (this.assignCounts[name] || 0) + f; }
  isForbidden(staff: string, section: string): boolean { return (this.ctx.customRules.forbidden || []).some((rule: any) => extractStaffName(rule.staff) === extractStaffName(staff) && split(rule.sections).includes(section)); }
  hasNGPair(candidate: string, members: string[], checkSoft: boolean): boolean { return members.some(member => (this.ctx.customRules.ngPairs || []).some((ng: any) => { const match = (extractStaffName(ng.s1) === extractStaffName(candidate) && extractStaffName(ng.s2) === extractStaffName(member)) || (extractStaffName(ng.s1) === extractStaffName(member) && extractStaffName(ng.s2) === extractStaffName(candidate)); if (!match) return false; if ((ng.level || "hard") === "hard") return true; if ((ng.level || "hard") === "soft" && checkSoft) return true; return false; })); }

  pick(availList: string[], list: string[], n: number, section?: string, currentAssigned: string[] = []): string[] {
    const result: string[] = []; const uniqueList = Array.from(new Set(list.filter(Boolean)));
    const filterFn = (name: string, checkSoftNg: boolean) => { if (!availList.includes(name) || this.isUsed(name) || (section && this.isForbidden(name, section))) return false; if (this.hasNGPair(name, [...currentAssigned, ...result].map(extractStaffName), checkSoftNg)) return false; if (section && !this.canAddKenmu(name, section)) return false; return true; };
    for (const name of uniqueList.filter(n => filterFn(n, true))) { result.push(name); if (result.length >= n) return result; }
    for (const name of uniqueList.filter(n => filterFn(n, false))) { result.push(name); if (result.length >= n) return result; }
    return result;
  }

  fill(availList: string[], section: string, preferredList: string[], targetCount: number) {
    if (this.skipSections.includes(section) || section === "透析後胸部") return;
    const eff = this.getEffectiveTarget(section, targetCount);
    if (eff.allClosed) return;

    let current = split(this.dayCells[section]);
    const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + getStaffAmount(m), 0);
    let prevAmount = -1;
    while (getCurrentAmount(current) < eff.cap) {
      const currentAmount = getCurrentAmount(current); if (currentAmount === prevAmount) break; prevAmount = currentAmount;
      const remaining = eff.cap - currentAmount;
      let curAm = eff.amClosed ? 999 : 0; let curPm = eff.pmClosed ? 999 : 0; 
      current.forEach(x => { if (x.includes("(AM)")) curAm++; else if (x.includes("(PM)")) curPm++; else { curAm++; curPm++; } });
      
      let needTag = "";
      if (curAm >= targetCount && curPm < targetCount) needTag = "(PM)";
      else if (curPm >= targetCount && curAm < targetCount) needTag = "(AM)";
      else if (remaining === 0.5) { if (curAm > curPm) needTag = "(PM)"; else if (curPm > curAm) needTag = "(AM)"; }

      const getFilterReason = (name: string): RejectReason | null => {
         if (current.map(extractStaffName).includes(name)) return { hard: true, msg: "同室配置済" };
         if (this.isUsed(name)) return { hard: true, msg: "他業務で配置済" };
         if (this.isForbidden(name, section)) return { hard: true, msg: "担当不可設定" };
         if (section === "MMG" && !this.isMmgCapable(name)) return { hard: true, msg: "MMG月間担当外" };
         if (!this.canAddKenmu(name, section)) return { hard: true, msg: "兼務上限" };
         const b = this.blockMap.get(name);
         if (needTag && b === 'NONE') { if (!eff.pmClosed && !eff.amClosed) { const isMain = isMonthlyMainStaff(section, name, this.ctx.monthlyAssign); if (!isMain) return { hard: true, msg: "半端枠ブロック" }; } }
         if (b === 'ALL') return { hard: true, msg: "全日ブロック" };
         if (needTag === "(AM)" && b === 'AM') return { hard: true, msg: "AMブロック" };
         if (needTag === "(PM)" && b === 'PM') return { hard: true, msg: "PMブロック" };
         if (eff.pmClosed && b === 'AM') return { hard: true, msg: "午後休診だがAMブロック" };
         if (eff.amClosed && b === 'PM') return { hard: true, msg: "午前休診だがPMブロック" };
         if (this.isHalfDayBlockedForFullDayRoom(name, section).hard) return { hard: true, msg: "終日専任室だが半休" };
         if (this.isHardNoConsecutive(name, section)) return { hard: false, msg: "連日担当禁止" };
         if (this.hasNGPair(name, current.map(extractStaffName), false)) return { hard: true, msg: "絶対NGペア" };
         if (this.hasNGPair(name, current.map(extractStaffName), true)) return { hard: false, msg: "なるべくNGペア" };
         return null;
       };

      const candidatesWithReason = availList.map(name => ({ name, reason: getFilterReason(name) }));
      let validNames = candidatesWithReason.filter(c => !c.reason).map(c => c.name);
      if (validNames.length === 0) { const softCandidates = candidatesWithReason.filter(c => c.reason && !c.reason.hard); if (softCandidates.length > 0) { validNames = softCandidates.map(c => c.name); } else break; }

      const validPreferred = validNames.filter(n => preferredList.includes(n)); const validAvail = validNames.filter(n => !preferredList.includes(n));
      const sortCandidates = (candidates: string[]) => {
         let mainStaff = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName); let subPrioStaff: string[] = []; let subStaff: string[] = [];
         if (section === "治療") { mainStaff = split(this.ctx.monthlyAssign.治療 || "").map(extractStaffName); subPrioStaff = split(this.ctx.monthlyAssign.治療サブ優先 || "").map(extractStaffName); subStaff = split(this.ctx.monthlyAssign.治療サブ || "").map(extractStaffName); } else if (section === "RI") { mainStaff = split(this.ctx.monthlyAssign.RI || "").map(extractStaffName); subStaff = split(this.ctx.monthlyAssign.RIサブ || "").map(extractStaffName); }
         const hasAmFree = validNames.some(s => this.blockMap.get(s) === 'PM'); const hasPmFree = validNames.some(s => this.blockMap.get(s) === 'AM');
         return [...candidates].sort((a, b) => {
             const bA = this.blockMap.get(a); const bB = this.blockMap.get(b); let scoreA = 0; let scoreB = 0;
             if (mainStaff.includes(a)) scoreA += 10000; else if (subPrioStaff.includes(a)) scoreA += 5000; else if (subStaff.includes(a)) scoreA += 2000;
             if (mainStaff.includes(b)) scoreB += 10000; else if (subPrioStaff.includes(b)) scoreB += 5000; else if (subStaff.includes(b)) scoreB += 2000;
             if (this.isHalfDayBlockedForFullDayRoom(a, section).monthlyHalfException) scoreA -= 3000; if (this.isHalfDayBlockedForFullDayRoom(b, section).monthlyHalfException) scoreB -= 3000;
             const roomCountWeight = (section === "MRI" || section === "CT") ? 200 : 100;
             scoreA -= (this.roomCounts[a]?.[section] || 0) * roomCountWeight; scoreB -= (this.roomCounts[b]?.[section] || 0) * roomCountWeight;
             if (this.isHardNoConsecutive(a, section)) scoreA -= 500; if (this.isHardNoConsecutive(b, section)) scoreB -= 500;
             if (section === "ポータブル") { const pastA = this.getPastRoomCount(a, section); const pastB = this.getPastRoomCount(b, section); if (pastA > 0) scoreA -= 1000 * pastA; if (pastB > 0) scoreB -= 1000 * pastB; }
             if (needTag === "") { if (bA === 'NONE') scoreA += 200; else if (hasAmFree && hasPmFree && (bA === 'AM' || bA === 'PM')) scoreA += 100; } else { if (needTag === "(AM)" && bA === 'PM') scoreA += 200; if (needTag === "(PM)" && bA === 'AM') scoreA += 200; if (bA === 'NONE') scoreA += 100; }
             if (needTag === "") { if (bB === 'NONE') scoreB += 200; else if (hasAmFree && hasPmFree && (bB === 'AM' || bB === 'PM')) scoreB += 100; } else { if (needTag === "(AM)" && bB === 'PM') scoreB += 200; if (needTag === "(PM)" && bB === 'AM') scoreB += 200; if (bB === 'NONE') scoreB += 100; }
             if (scoreA !== scoreB) return scoreB - scoreA;
             if ((this.assignCounts[a] || 0) !== (this.assignCounts[b] || 0)) return (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0);
             return a.localeCompare(b, 'ja');
         });
      };

      const allSorted = [...sortCandidates(validPreferred), ...sortCandidates(validAvail)];
      const pickedCoreList = this.pick(validNames, allSorted, 1, section, current.map(extractStaffName));
      if (pickedCoreList.length === 0) break;
      const core = pickedCoreList[0]; const block = this.blockMap.get(core); let tag = ""; let f = 1;
      
      if (block === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } 
      else if (block === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } 
      else { if (needTag) { tag = needTag; f = 0.5; this.blockMap.set(core, needTag === "(AM)" ? 'AM' : 'PM'); } else { tag = ""; f = 1; this.blockMap.set(core, 'ALL'); } }
      
      current.push(`${core}${tag}`); this.addU(core, f);
    }
    this.dayCells[section] = join(current);
  }

  processPostTasks() {
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName);
    const lowPriorityStaff = split(this.ctx.customRules.lateShiftLowPriorityStaff || "").map(extractStaffName);

    this.initialAvailSupport.forEach(staff => {
      if (this.isUsed(staff)) return;
      const targets = split(this.ctx.customRules.supportTargetRooms || "2号室,3号室");
      let assigned = false;
      for (const room of targets) {
        if (this.skipSections.includes(room) || this.isForbidden(staff, room) || room === "透析後胸部") continue;
        let current = split(this.dayCells[room]);
        if (current.length > 0 && !current.map(extractStaffName).includes(staff) && !this.hasNGPair(staff, current.map(extractStaffName), false) && !this.isHardNoConsecutive(staff, room)) {
          const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":"";
          this.dayCells[room] = join([...current, `${staff}${tag}`]); this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL'); assigned = true; break;
        }
      }
      if (!assigned) {
        for (const room of targets) {
          if (this.skipSections.includes(room) || this.isForbidden(staff, room) || room === "透析後胸部") continue;
          let current = split(this.dayCells[room]);
          if (current.length === 0 && !this.isHardNoConsecutive(staff, room) && this.canAddKenmu(staff, room)) {
             const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":"";
             this.dayCells[room] = `${staff}${tag}`; this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL'); break;
          }
        }
      }
    });

    (this.ctx.customRules.swapRules || []).forEach((rule: any) => {
      const { targetRoom, triggerRoom, sourceRooms } = rule;
      if (!targetRoom || !triggerRoom || !sourceRooms || targetRoom === "透析後胸部" || triggerRoom === "透析後胸部") return;
      const triggerMembers = split(this.dayCells[triggerRoom]); if (triggerMembers.length === 0) return;
      const triggerCanTarget = triggerMembers.some(m => { const c = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(c) || this.isForbidden(c, targetRoom) || this.isHardNoConsecutive(c, targetRoom) || this.isHalfDayBlockedForFullDayRoom(c, targetRoom).hard) return false; return this.canAddKenmu(c, targetRoom, true); });
      if (!triggerCanTarget) {
          const swapSources = split(sourceRooms).sort((a, b) => this.getRescueSourceScore(parseRoomCond(a).r, targetRoom) - this.getRescueSourceScore(parseRoomCond(b).r, targetRoom));
          let swapped = false;
          for (const srcStrRoom of swapSources) {
              const { r: srcRoom } = parseRoomCond(srcStrRoom); if (srcRoom === triggerRoom || srcRoom === "透析後胸部") continue;
              const srcMembers = split(this.dayCells[srcRoom]);
              let srcCands = srcMembers.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)) && !this.isForbidden(extractStaffName(m), targetRoom) && !this.isHalfDayBlockedForFullDayRoom(extractStaffName(m), targetRoom).hard && !this.isHardNoConsecutive(extractStaffName(m), targetRoom) && this.canAddKenmu(extractStaffName(m), targetRoom, true) && !this.isForbidden(extractStaffName(m), triggerRoom));
              srcCands.sort((a, b) => this.getPastRoomCount(extractStaffName(a), targetRoom) - this.getPastRoomCount(extractStaffName(b), targetRoom));
              for (const srcM of srcCands) {
                  const srcCore = extractStaffName(srcM);
                  const targetToKick = triggerMembers.find(m => { const c = extractStaffName(m); return !this.isForbidden(c, srcRoom) && !this.isHalfDayBlockedForFullDayRoom(c, srcRoom).hard && !this.hasNGPair(c, srcMembers.map(extractStaffName), false) && this.canAddKenmu(c, srcRoom, true); });
                  if (targetToKick && this.canAddKenmu(srcCore, targetRoom, true)) {
                      const kickCore = extractStaffName(targetToKick);
                      this.dayCells[triggerRoom] = join(triggerMembers.map(m => m === targetToKick ? m.replace(kickCore, srcCore) : m));
                      this.dayCells[srcRoom] = join(srcMembers.map(m => m === srcM ? m.replace(srcCore, kickCore) : m));
                      swapped = true; break;
                  }
              }
              if (swapped) break;
          }
      }
    });

    let uGen1 = this.initialAvailGeneral.filter(s => !this.isUsed(s) && this.blockMap.get(s) !== 'ALL');
    (this.ctx.customRules.linkedRooms || []).forEach((rule: any) => {
      const targetRoom = rule.target; if (!targetRoom || this.skipSections.includes(targetRoom) || targetRoom === "透析後胸部") return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      const effLR = this.getEffectiveTarget(targetRoom, targetCap);
      if (effLR.allClosed) return;
      let currentMems = split(this.dayCells[targetRoom]);
      let curAm = 0; let curPm = 0; currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
      const isOnlySupport = currentMems.length > 0 && currentMems.every(m => supportStaffList.includes(extractStaffName(m)));
      if (isOnlySupport) { curAm = 0; curPm = 0; }
      uGen1.sort((a, b) => this.getPastRoomCount(a, targetRoom) - this.getPastRoomCount(b, targetRoom));
      while ((curAm < targetCap || curPm < targetCap) && uGen1.length > 0) {
        const candIdx = uGen1.findIndex(s => {
           if (this.isForbidden(s, targetRoom) || this.isHalfDayBlockedForFullDayRoom(s, targetRoom).hard || this.hasNGPair(s, currentMems.map(extractStaffName), false) || this.isHardNoConsecutive(s, targetRoom) || (targetRoom === "MMG" ? !this.isMmgCapable(s) : false) || !this.canAddKenmu(s, targetRoom)) return false;
           const b = this.blockMap.get(s);
           if (curPm >= targetCap && b === 'AM') return false; 
           if (curAm >= targetCap && b === 'PM') return false; 
           return true;
        });
        if (candIdx === -1) break;
        const staff = uGen1[candIdx]; uGen1.splice(candIdx, 1);
        const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; 
        if (tag === "") { if (curAm >= targetCap) tag = "(PM)"; else if (curPm >= targetCap) tag = "(AM)"; }
        this.blockMap.set(staff, tag === "" ? 'ALL' : (tag === "(AM)" ? 'PM' : 'AM'));
        currentMems.push(`${staff}${tag}`); if (tag==="(AM)") curAm++; else if (tag==="(PM)") curPm++; else { curAm++; curPm++; } this.addU(staff, tag?0.5:1);
      }
      this.dayCells[targetRoom] = join(currentMems);
    });

    (this.ctx.customRules.smartKenmu || []).forEach((rule: any) => {
      const targetRoom = rule.targetRoom; if (!targetRoom || this.skipSections.includes(targetRoom) || targetRoom === "透析後胸部") return;
      const targetMembers = split(this.dayCells[targetRoom]); if (targetMembers.length === 0) return;
      for (const tM of targetMembers) {
          const targetCore = extractStaffName(tM);
          if (ROLE_PLACEHOLDERS.includes(targetCore)) continue;
          const isDedicated = !ROOM_SECTIONS.some(r => r !== targetRoom && split(this.dayCells[r]).map(extractStaffName).includes(targetCore));
          if (isDedicated) {
              let swapCandidateFullStr: string | null = null; let foundSrcRoom: string | null = null;
              for (const srcStrRoom of split(rule.sourceRooms)) {
                  const { r: srcRoom, min } = parseRoomCond(srcStrRoom); const srcMembers = split(this.dayCells[srcRoom]);
                  if (srcRoom === "透析後胸部") continue;
                  if (min > 0 && srcMembers.reduce((sum, m) => sum + getStaffAmount(m), 0) < min) continue;
                  if (!this.isForbidden(targetCore, srcRoom) && !this.isHalfDayBlockedForFullDayRoom(targetCore, srcRoom).hard && this.canAddKenmu(targetCore, srcRoom, true)) {
                      let srcCands = srcMembers.filter(m => { const core = extractStaffName(m); return core !== targetCore && !ROLE_PLACEHOLDERS.includes(core) && !this.isForbidden(core, targetRoom) && !this.hasNGPair(core, targetMembers.map(extractStaffName), false) && !this.isHardNoConsecutive(core, targetRoom) && (targetRoom === "MMG" ? this.isMmgCapable(core) : true) && this.canAddKenmu(core, targetRoom); });
                      srcCands.sort((a, b) => this.getPastRoomCount(extractStaffName(a), targetRoom) - this.getPastRoomCount(extractStaffName(b), targetRoom));
                      for (const srcStr of srcCands) { swapCandidateFullStr = srcStr; foundSrcRoom = srcRoom; break; }
                      if (swapCandidateFullStr) break;
                  }
              }
              if (swapCandidateFullStr && foundSrcRoom) {
                  const candCore = extractStaffName(swapCandidateFullStr);
                  this.dayCells[foundSrcRoom] = join(split(this.dayCells[foundSrcRoom]).filter(m => m !== swapCandidateFullStr));
                  let currentTargetTags = tM.includes("(AM)") ? "(AM)" : tM.includes("(PM)") ? "(PM)" : "";
                  this.dayCells[foundSrcRoom] = join([...split(this.dayCells[foundSrcRoom]), `${targetCore}${currentTargetTags}`]);
                  this.dayCells[targetRoom] = join(targetMembers.map(m => m === tM ? swapCandidateFullStr : m) as string[]); 
                  this.addU(candCore, getStaffAmount(swapCandidateFullStr as string));
                  this.blockMap.set(targetCore, currentTargetTags === "" ? 'ALL' : (currentTargetTags === "(AM)" ? 'PM' : 'AM'));
                  break;
              }
          }
      }
    });

    const processKenmu = (sourceMems: string[], targetMems: string[], targetRoom: string) => {
       if (targetRoom === "透析後胸部") return targetMems;
       const targetCap = this.dynamicCapacity[targetRoom] || 1; const targetCores = targetMems.map(extractStaffName);
       let currentAmount = targetMems.reduce((sum, m) => sum + getStaffAmount(m), 0);
       for (const m of sourceMems) {
          if (currentAmount >= targetCap) break;
          const core = extractStaffName(m);
          if (targetCores.includes(core) || m.includes("17:") || m.includes("19:") || this.isForbidden(core, targetRoom) || this.isHardNoConsecutive(core, targetRoom) || this.isHalfDayBlockedForFullDayRoom(core, targetRoom).hard || this.hasNGPair(core, targetCores, false) || !this.canAddKenmu(core, targetRoom)) continue;
          let pushStr = m; let curAm = 0; let curPm = 0; targetMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
          if (curAm < targetCap && curPm >= targetCap) { if (m.includes("(PM)")) continue; pushStr = `${core}(AM)`; } else if (curAm >= targetCap && curPm < targetCap) { if (m.includes("(AM)")) continue; pushStr = `${core}(PM)`; }
          targetMems.push(pushStr); targetCores.push(core); const amount = getStaffAmount(pushStr); currentAmount += amount; this.addU(core, amount);
          this.updateBlockMapAfterKenmu(core, pushStr);
       }
       return targetMems;
    };
    (this.ctx.customRules.kenmuPairs || []).forEach((pair: any) => { if (!pair.s1 || !pair.s2 || pair.s1 === "透析後胸部" || pair.s2 === "透析後胸部") return; let m1 = split(this.dayCells[pair.s1]); let m2 = split(this.dayCells[pair.s2]); this.dayCells[pair.s2] = join(processKenmu(m1, m2, pair.s2)); m2 = split(this.dayCells[pair.s2]); this.dayCells[pair.s1] = join(processKenmu(m2, m1, pair.s1)); });

    (this.ctx.customRules.linkedRooms || []).forEach((rule: any) => {
      const targetRoom = rule.target; if (!targetRoom || this.skipSections.includes(targetRoom) || targetRoom === "透析後胸部") return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      const effLR = this.getEffectiveTarget(targetRoom, targetCap);
      if (effLR.allClosed) return;
      let currentMems = split(this.dayCells[targetRoom]);
      let curAm = 0; let curPm = 0; currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
      const sourceRooms = split(rule.sources);
      for (const srcStr of sourceRooms) {
        if (curAm >= targetCap && curPm >= targetCap) break; 
        const { r: srcRoom, min } = parseRoomCond(srcStr); if (min > 0 && split(this.dayCells[srcRoom]).reduce((sum, m) => sum + getStaffAmount(m), 0) < min) continue;
        if (srcRoom === "透析後胸部") continue;
        split(this.dayCells[srcRoom]).forEach(m => {
          if (curAm >= targetCap && curPm >= targetCap) return; const core = extractStaffName(m);
          if (!ROLE_PLACEHOLDERS.includes(core) && !currentMems.map(extractStaffName).includes(core) && !this.isForbidden(core, targetRoom) && !this.isHalfDayBlockedForFullDayRoom(core, targetRoom).hard && !this.hasNGPair(core, currentMems.map(extractStaffName), false) && !this.isHardNoConsecutive(core, targetRoom) && (targetRoom === "MMG" ? this.isMmgCapable(core) : true) && this.canAddKenmu(core, targetRoom, true) && !m.includes("17:") && !m.includes("19:")) {
               let pushStr = m;
               if (targetRoom === "パノラマCT" && srcRoom === "透視（6号）") { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; }
               else {
                 if (curAm < targetCap && curPm >= targetCap) { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; }
                 else if (curAm >= targetCap && curPm < targetCap) { if (m.includes("(AM)")) return; pushStr = `${core}(PM)`; }
                 else if (effLR.pmClosed) { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; }
                 else if (effLR.amClosed) { if (m.includes("(AM)")) return; pushStr = `${core}(PM)`; }
               }
               currentMems.push(pushStr); if (pushStr.includes("(AM)")) curAm += 1; else if (pushStr.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } this.addU(core, getStaffAmount(pushStr)); this.updateBlockMapAfterKenmu(core, pushStr);
          }
        });
      }
      this.dayCells[targetRoom] = join(currentMems);
    });

    ROOM_SECTIONS.forEach(targetRoom => {
      if (this.clearSections.includes(targetRoom) || ["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(targetRoom)) return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      const effResc = this.getEffectiveTarget(targetRoom, targetCap);
      if (effResc.allClosed) return;
      let currentMems = split(this.dayCells[targetRoom]);
      let curAm = effResc.amClosed ? 999 : 0; let curPm = effResc.pmClosed ? 999 : 0;
      currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
      const isOnlySupport = currentMems.length > 0 && currentMems.every(m => supportStaffList.includes(extractStaffName(m)));
      if (isOnlySupport) { curAm = effResc.amClosed ? 999 : 0; curPm = effResc.pmClosed ? 999 : 0; }
      if (curAm >= targetCap && curPm >= targetCap) return;
       
      const matchingRescueRules = (this.ctx.customRules.rescueRules || []).filter((r: any) => r.targetRoom === targetRoom);
      let sourceRooms: string[] = [];
      if (matchingRescueRules.length > 0) { sourceRooms = matchingRescueRules.flatMap((r: any) => split(r.sourceRooms || "")).sort((a: string, b: string) => this.getRescueSourceScore(parseRoomCond(a).r, targetRoom) - this.getRescueSourceScore(parseRoomCond(b).r, targetRoom)); } 
      else { const lowImpact = split(this.ctx.customRules.supportTargetRoomsLowImpact || "3号室,パノラマCT"); sourceRooms = [...lowImpact, "2号室", "1号室", "5号室", "CT(4)"].filter(r => r !== targetRoom); }

      if (sourceRooms.length > 0) {
         let candidates: { core: string, fullStr: string, srcIdx: number }[] = [];
         sourceRooms.forEach((srcStr: string, idx: number) => {
            const { r: srcRoom, min } = parseRoomCond(srcStr); if (srcRoom === targetRoom || srcRoom === "透析後胸部") return;
            if (min > 0 && split(this.dayCells[srcRoom]).reduce((sum, m) => sum + getStaffAmount(m), 0) < min) return;
            split(this.dayCells[srcRoom]).forEach(m => { 
                const core = extractStaffName(m); 
                if (!ROLE_PLACEHOLDERS.includes(core) && !this.isHardNoConsecutive(core, targetRoom) && !candidates.some(c => c.core === core) && !this.isForbidden(core, targetRoom) && !this.isHalfDayBlockedForFullDayRoom(core, targetRoom).hard && !m.includes("17:")) candidates.push({ core, fullStr: m, srcIdx: idx }); 
            });
         });
         const currentCores = currentMems.map(extractStaffName);
         candidates = candidates.filter(c => !currentCores.includes(c.core) && (targetRoom === "MMG" ? this.isMmgCapable(c.core) : true) && this.canAddKenmu(c.core, targetRoom, true));
         candidates.sort((a, b) => { const pastA = this.getPastRoomCount(a.core, targetRoom); const pastB = this.getPastRoomCount(b.core, targetRoom); if (pastA !== pastB) return pastA - pastB; const aRooms = this.getTodayRoomCount(a.core); const bRooms = this.getTodayRoomCount(b.core); if (aRooms !== bRooms) return aRooms - bRooms; if (a.srcIdx !== b.srcIdx) return a.srcIdx - b.srcIdx; return (this.assignCounts[a.core] || 0) - (this.assignCounts[b.core] || 0); });
         for (const cand of candidates) {
            if (curAm >= targetCap && curPm >= targetCap) break;
            if (this.hasNGPair(cand.core, currentCores, false)) continue;
            let pushStr = cand.fullStr;
            if (curAm < targetCap && curPm >= targetCap) { if (cand.fullStr.includes("(PM)")) continue; pushStr = `${cand.core}(AM)`; }
            else if (curAm >= targetCap && curPm < targetCap) { if (cand.fullStr.includes("(AM)")) continue; pushStr = `${cand.core}(PM)`; }
            else if (effResc.pmClosed) { if (cand.fullStr.includes("(PM)")) continue; pushStr = `${cand.core}(AM)`; }
            else if (effResc.amClosed) { if (cand.fullStr.includes("(AM)")) continue; pushStr = `${cand.core}(PM)`; }
            currentMems.push(pushStr); if (pushStr.includes("(AM)")) curAm += 1; else if (pushStr.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } this.addU(cand.core, getStaffAmount(pushStr)); this.updateBlockMapAfterKenmu(cand.core, pushStr);
         }
         this.dayCells[targetRoom] = join(currentMems);
      }
    });

    (this.ctx.customRules.emergencies || []).forEach((em: any) => {
      if (em.type !== "empty_room_swap") return;
      const watchRoom = em.section; const sourceRoomList = split(em.sourceRooms || em.sourceRoom || "");
      if (!watchRoom || sourceRoomList.length === 0 || this.skipSections.includes(watchRoom) || watchRoom === "透析後胸部") return;
      const watchMems = split(this.dayCells[watchRoom]); const watchCap = this.dynamicCapacity[watchRoom] ?? 1;
      const watchAmt = watchMems.reduce((s, m) => s + getStaffAmount(m), 0);
      if (watchAmt >= watchCap) return;

      let swapped = false;
      for (const swapFrom of sourceRoomList) {
        if (swapped || swapFrom === "透析後胸部") break;
        const srcMems = split(this.dayCells[swapFrom]); if (srcMems.length === 0) continue;
        const ngInSrc = srcMems.filter(m => { const c = extractStaffName(m); return !ROLE_PLACEHOLDERS.includes(c) && (this.isForbidden(c, watchRoom) || !this.canAddKenmu(c, watchRoom, true)); });
        if (ngInSrc.length === 0) continue; 

        const allRooms = ROOM_SECTIONS.filter(r => r !== watchRoom && r !== swapFrom && !this.skipSections.includes(r) && !["待機","昼当番","受付","受付ヘルプ","透析後胸部"].includes(r));
        for (const srcRoom of allRooms) {
          if (swapped) break;
          const roomMems = split(this.dayCells[srcRoom]);
          const okCands = roomMems.filter(m => { const c = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(c) || this.isForbidden(c, watchRoom) || this.isForbidden(c, swapFrom) || this.isHalfDayBlockedForFullDayRoom(c, watchRoom).hard || this.isHardNoConsecutive(c, watchRoom) || !this.canAddKenmu(c, watchRoom, true) || m.includes("17:") || m.includes("19:")) return false; return true; });
          for (const okM of okCands) {
            const okCore = extractStaffName(okM);
            const kickM = ngInSrc.find(m => { const c = extractStaffName(m); return !this.isForbidden(c, srcRoom) && !this.isHalfDayBlockedForFullDayRoom(c, srcRoom).hard && !this.hasNGPair(c, roomMems.map(extractStaffName), false) && this.canAddKenmu(c, srcRoom, true); });
            if (!kickM) continue;
            const kickCore = extractStaffName(kickM);
            this.dayCells[swapFrom] = join(srcMems.map(m => m === kickM ? m.replace(kickCore, okCore) : m));
            this.dayCells[srcRoom] = join(roomMems.map(m => m === okM ? m.replace(okCore, kickCore) : m));
            swapped = true; break;
          }
        }
      }
    });

    (this.ctx.customRules.lateShifts || []).forEach((rule: any) => {
      let current = split(this.dayCells[rule.section]);
      if (current.length > 0 && !current.some(m => m.includes("17:") || m.includes("18:"))) {
        const currentCore = current.map(extractStaffName);
        const prevLateStaff = this.prevDay ? split(this.prevDay.cells[rule.section] || "").filter((m: string) => m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")).map(extractStaffName) : [];
        const excludeStaff = Array.from(new Set([...split(this.ctx.customRules.noLateShiftStaff || "").map(extractStaffName), ...split(this.ctx.customRules.noLateShiftRooms || "").flatMap(r => split(this.dayCells[r] || "").map(extractStaffName))]));
        const fuzaiMems = split(this.dayCells["不在"]);

        const candidates = this.initialAvailGeneral.filter(n => !currentCore.includes(n) && !this.isForbidden(n, rule.section) && !excludeStaff.includes(n) && !fuzaiMems.some(m => extractStaffName(m) === n));
        candidates.sort((a, b) => {
          let sA = this.getPastLateShiftCount(a) * 100; let sB = this.getPastLateShiftCount(b) * 100;
          const idxA = lowPriorityStaff.indexOf(a); const idxB = lowPriorityStaff.indexOf(b);
          if (idxA !== -1) sA += 100000 + ((lowPriorityStaff.length - idxA) * 10000);
          if (idxB !== -1) sB += 100000 + ((lowPriorityStaff.length - idxB) * 10000);
          if (sA !== sB) return sA - sB; return a.localeCompare(b, 'ja');
        });
        let picked = candidates.find(n => !prevLateStaff.includes(n)); if (!picked && candidates.length > 0) picked = candidates[0];
        if (picked) { current.push(`${picked}${rule.lateTime}`); this.blockMap.set(picked, this.blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); this.dayCells[rule.section] = join(current); }
      }
    });

    const portableCores = split(this.dayCells["ポータブル"]).map(extractStaffName);
    const room2Members = split(this.dayCells["2号室"]);
    const room2Cores = room2Members.map(extractStaffName);

    if (room2Cores.some(n => portableCores.includes(n))) {
      const findCandidate = (excludeRooms: string[]) => [...supportStaffList, ...this.initialAvailGeneral].filter((s, i, arr) => arr.indexOf(s) === i).filter(s => !room2Cores.includes(s) && !this.isForbidden(s, "2号室") && !this.isHalfDayBlockedForFullDayRoom(s, "2号室").hard && !this.hasNGPair(s, room2Cores, false) && this.canAddKenmu(s, "2号室") && !this.isHardNoConsecutive(s, "2号室") && this.blockMap.get(s) !== 'ALL' && !excludeRooms.some(r => split(this.dayCells[r]).map(extractStaffName).includes(s)));
      const picked = findCandidate(["1号室", "5号室"])[0] ?? findCandidate([])[0];
      if (picked) { const b = this.blockMap.get(picked); const tag = b === 'AM' ? "(PM)" : b === 'PM' ? "(AM)" : ""; this.dayCells["2号室"] = join([...room2Members, `${picked}${tag}`]); this.addU(picked, tag ? 0.5 : 1); this.blockMap.set(picked, 'ALL'); }
    }

    const priorityList = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
    const deKenmuTargets = ROOM_SECTIONS.filter(r => !["CT", "MRI", "治療", "RI", "待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r));
    deKenmuTargets.sort((a, b) => { let idxA = priorityList.indexOf(a); if (idxA === -1) idxA = 999; let idxB = priorityList.indexOf(b); if (idxB === -1) idxB = 999; return idxA - idxB; });
    const reversePriority = [...ROOM_SECTIONS].sort((a, b) => { let idxA = priorityList.indexOf(a); if (idxA === -1) idxA = 999; let idxB = priorityList.indexOf(b); if (idxB === -1) idxB = 999; return idxB - idxA; });

    let uGen2 = this.initialAvailGeneral.filter(s => !this.isUsed(s) && this.blockMap.get(s) !== 'ALL');
    uGen2.forEach(staff => {
      const b = this.blockMap.get(staff); if (b === 'ALL') return; let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; let assigned = false;
      for (const room of deKenmuTargets) {
        if (this.skipSections.includes(room) || this.isForbidden(staff, room) || (room === "MMG" && !this.isMmgCapable(staff))) continue;
        if (tag !== "" && this.isHalfDayBlockedForFullDayRoom(staff, room).hard) continue;
        const effD = this.getEffectiveTarget(room, 1);
        if (effD.allClosed || (tag === "(PM)" && effD.pmClosed) || (tag === "(AM)" && effD.amClosed)) continue;

        let currentMems = split(this.dayCells[room]);
        const repIdx = currentMems.findIndex(m => {
          const core = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(core) || this.getTodayRoomCount(core) <= 1 || this.hasNGPair(staff, currentMems.filter(x=>x!==m).map(extractStaffName), false)) return false;
          let cAm = m.includes("(AM)"); let cPm = m.includes("(PM)"); if(!cAm && !cPm){cAm=true;cPm=true;} let nAm = tag==="(AM)"; let nPm = tag==="(PM)"; if(!nAm && !nPm){nAm=true;nPm=true;}
          if (cAm && !nAm) return false; if (cPm && !nPm) return false; return true;
        });
        if (repIdx !== -1) {
          const oldStr = currentMems[repIdx]; const oldCore = extractStaffName(oldStr);
          currentMems[repIdx] = `${staff}${oldStr.includes("(AM)") ? "(AM)" : oldStr.includes("(PM)") ? "(PM)" : tag}`; 
          this.dayCells[room] = join(currentMems); this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL');
          this.assignCounts[oldCore] = Math.max(0, (this.assignCounts[oldCore] || 1) - getStaffAmount(oldStr));
          let am = false; let pm = false;
          ROOM_SECTIONS.forEach(r => { if (r === "待機" || r === "昼当番" || r === "受付" || r === "受付ヘルプ") return; split(this.dayCells[r]).forEach(m => { if (extractStaffName(m) === oldCore) { if (m.includes("(AM)")) am = true; else if (m.includes("(PM)")) pm = true; else { am = true; pm = true; } } }); });
          if (am && pm) this.blockMap.set(oldCore, 'ALL'); else if (am) this.blockMap.set(oldCore, 'AM'); else if (pm) this.blockMap.set(oldCore, 'PM'); else this.blockMap.set(oldCore, 'NONE');
          assigned = true; break;
        }
      }
      
      if (!assigned) {
          for (const room of reversePriority) {
              if (this.skipSections.includes(room) || this.isForbidden(staff, room) || (room === "MMG" && !this.isMmgCapable(staff))) continue;
              if (["待機", "昼当番", "受付", "受付ヘルプ", "CT", "MRI", "治療", "RI", "透析後胸部"].includes(room)) continue;
              if (tag !== "" && this.isHalfDayBlockedForFullDayRoom(staff, room).hard) continue;
              const effR = this.getEffectiveTarget(room, 1);
              if (effR.allClosed || (tag === "(PM)" && effR.pmClosed) || (tag === "(AM)" && effR.amClosed) || !this.canAddKenmu(staff, room) || this.isHardNoConsecutive(staff, room)) continue;
              let currentMems = split(this.dayCells[room]);
              if (this.hasNGPair(staff, currentMems.map(extractStaffName), false)) continue;
              this.dayCells[room] = join([...currentMems, `${staff}${tag}`]); this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL'); 
              assigned = true; break;
          }
      }
    });

    this.logPhase("フェーズ5：仕上げ（最後に配置）");
    if (!this.skipSections.includes("昼当番")) {
      let currentLunch = split(this.dayCells["昼当番"]); let lunchTarget = this.ctx.customRules.lunchBaseCount ?? 3;
      const dayChar = this.day.label.match(/\((.*?)\)/)?.[1]; if (dayChar) { const sd = (this.ctx.customRules.lunchSpecialDays || []).find((x:any) => x.day === dayChar); if (sd) lunchTarget = Number(sd.count); }
      (this.ctx.customRules.lunchRoleRules || []).forEach((rule: any) => {
        if (rule.day === "毎日" || rule.day === dayChar) {
          const rStaff = split(this.ctx.monthlyAssign[rule.role] || "").map(extractStaffName); const tMems = split(this.dayCells[rule.role] || "").map(extractStaffName); let sel: string | null = null;
          for (const src of split(rule.sourceRooms)) {
            const { r: srcR, min } = parseRoomCond(src); const rMems = split(this.dayCells[srcR] || ""); const req = min > 0 ? min : (this.dynamicCapacity[srcR] || 1);
            if (rMems.reduce((sum, m) => sum + getStaffAmount(m), 0) >= req) { sel = rMems.map(extractStaffName).find(n => rStaff.includes(n) && !tMems.includes(n) && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, currentLunch, false)) || null; } if (sel) break;
          }
          if (!sel) sel = tMems.find(n => !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, currentLunch, false)) || null;
          if (sel && !currentLunch.includes(sel) && currentLunch.length < lunchTarget) { currentLunch.push(sel); }
        }
      });
      const riMems = split(this.dayCells["RI"]).map(extractStaffName); riMems.forEach(n => { if (!currentLunch.includes(n) && currentLunch.length < lunchTarget && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, currentLunch, false)) currentLunch.push(n); });
      split(this.ctx.customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT").forEach(sec => { split(this.dayCells[sec]).forEach(n => { const core = extractStaffName(n); if (!currentLunch.includes(core) && currentLunch.length < lunchTarget && !this.isForbidden(core, "昼当番") && !this.hasNGPair(core, currentLunch, false)) currentLunch.push(core); }); });
      if (currentLunch.length < lunchTarget) {
        (this.ctx.customRules.lunchConditional || []).forEach((cond: any) => { const sMems = split(this.dayCells[cond.section]); if (sMems.length >= Number(cond.min)) { let p = 0; for (const n of sMems) { if (p >= Number(cond.out) || currentLunch.length >= lunchTarget) break; const core = extractStaffName(n); if (!currentLunch.includes(core) && !this.isForbidden(core, "昼当番") && !this.hasNGPair(core, currentLunch, false)) { currentLunch.push(core); p++; } } } });
      }
      if (currentLunch.length < lunchTarget) {
        const lrMems: string[] = []; split(this.ctx.customRules.lunchLastResortSections ?? "治療").forEach(sec => { split(this.dayCells[sec]).forEach(n => lrMems.push(extractStaffName(n))); });
        this.initialAvailGeneral.filter(n => !lrMems.includes(n) && !currentLunch.includes(n) && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, currentLunch, false)).forEach(n => { if (currentLunch.length < lunchTarget) currentLunch.push(n); });
        this.initialAvailGeneral.filter(n => lrMems.includes(n) && !currentLunch.includes(n) && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, currentLunch, false)).forEach(n => { if (currentLunch.length < lunchTarget) currentLunch.push(n); });
      }
      this.dayCells["昼当番"] = join(currentLunch.slice(0, lunchTarget));
    }

    const uTarget = this.dynamicCapacity.受付 !== undefined ? this.dynamicCapacity.受付 : 2;
    if (split(this.dayCells["受付"]).reduce((sum, m) => sum + getStaffAmount(m), 0) < uTarget && !this.skipSections.includes("受付ヘルプ")) {
      let helpMems = split(this.dayCells["受付ヘルプ"]);
      if (helpMems.length === 0) {
        const lCores = split(this.dayCells["昼当番"]).map(extractStaffName);
        const getHelp = (ex: string[]) => { let cand = this.initialAvailGeneral.filter(n => !ex.includes(n) && !helpMems.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ") && !this.hasNGPair(n, helpMems.map(extractStaffName), false)); if (cand.length > 0) { cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); return cand[0]; } return null; };
        const lHelp = getHelp(lCores); if (lHelp) { helpMems.push(`${lHelp}(12:15〜13:00)`); }
        const validKenzo = split(this.dayCells["検像"]).map(extractStaffName).filter(n => this.blockMap.get(n) !== 'AM' && !helpMems.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ") && !this.hasNGPair(n, helpMems.map(extractStaffName), false));
        let picked16 = validKenzo.length > 0 ? validKenzo[0] : null; if (!picked16) picked16 = getHelp(lHelp ? [lHelp] : []);
        if (picked16) { helpMems.push(`${picked16}(16:00〜)`); }
      }
      this.dayCells["受付ヘルプ"] = join(helpMems);
    }
  }
}

export default function App(): any {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats' | 'rules'>('calendar');
  const [allDays, setAllDays] = useState<Record<string, Record<string, string>>>(() => { try { return JSON.parse(localStorage.getItem(KEY_ALL_DAYS) || "{}"); } catch { return {}; } });
  const [customRules, setCustomRules] = useState<CustomRules>(() => { try { return { ...DEFAULT_RULES, ...JSON.parse(localStorage.getItem(KEY_RULES) || "{}") }; } catch { return DEFAULT_RULES; } });
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

  useEffect(() => { fetch("https://holidays-jp.github.io/api/v1/date.json").then(res => res.json()).then(data => setNationalHolidays(prev => ({ ...prev, ...data }))).catch(e => console.error(e)); }, []);
  useEffect(() => { localStorage.setItem(KEY_ALL_DAYS, JSON.stringify(allDays)); localStorage.setItem(KEY_RULES, JSON.stringify(customRules)); localStorage.setItem(KEY_MONTHLY, JSON.stringify(monthlyAssign)); }, [allDays, customRules, monthlyAssign]);

  const activeGeneralStaff = useMemo(() => parseAndSortStaff(customRules.staffList), [customRules.staffList]);
  const activeReceptionStaff = useMemo(() => parseAndSortStaff(customRules.receptionStaffList), [customRules.receptionStaffList]);
  const allStaff = useMemo(() => Array.from(new Set([...activeGeneralStaff, ...activeReceptionStaff])), [activeGeneralStaff, activeReceptionStaff]);
  const customHolidays = split(customRules.customHolidays || "");

  const days = useMemo(() => {
    const [y, m, d] = targetMonday.split('-').map(Number); const mon = new Date(y, m - 1, d);
    return [0, 1, 2, 3, 4].map(i => {
      const curr = new Date(mon); curr.setDate(curr.getDate() + i);
      const id = `${curr.getFullYear()}-${pad(curr.getMonth()+1)}-${pad(curr.getDate())}`;
      const isHoliday = !!nationalHolidays[id] || customHolidays.includes(id);
      return { id, label: formatDayForDisplay(curr), isPublicHoliday: isHoliday, holidayName: nationalHolidays[id] || "休診日", cells: allDays[id] || Object.fromEntries(SECTIONS.map(s => [s, ""])) };
    });
  }, [targetMonday, allDays, customHolidays, nationalHolidays]);

  useEffect(() => { if (!sel || !days.find(d => d.id === sel)) setSel(days[0].id); }, [days, sel]);
  const cur = days.find(d => d.id === sel) || days[0];

  const getDailyStats = (dayId: string) => {
    const cells = allDays[dayId] || {}; const absent = new Set<string>(); REST_SECTIONS.forEach(s => split(cells[s]).forEach(m => absent.add(extractStaffName(m))));
    const working = allStaff.filter(s => !absent.has(s)); const assigned = new Set<string>(); WORK_SECTIONS.forEach(s => split(cells[s]).forEach(m => assigned.add(extractStaffName(m))));
    return { workingCount: working.length, absentCount: absent.size, unassigned: working.filter(s => !assigned.has(s)) };
  };

  const getDayWarnings = (dayId: string): WarningInfo[] => {
    const w: WarningInfo[] = []; const cells = allDays[dayId] || {}; const staffMap: Record<string, string[]> = {};
    ROOM_SECTIONS.forEach(room => { split(cells[room]).forEach(m => { const core = extractStaffName(m); if(!staffMap[core]) staffMap[core]=[]; if(!staffMap[core].includes(room)) staffMap[core].push(room); }) });
    const softNgPairs = (customRules.ngPairs || []).filter((p: any) => p.level === "soft");
    softNgPairs.forEach((ng: any) => { const s1 = extractStaffName(ng.s1); const s2 = extractStaffName(ng.s2); ROOM_SECTIONS.forEach(room => { const mems = split(cells[room]).map(extractStaffName); if (mems.includes(s1) && mems.includes(s2)) w.push({ level: 'yellow', title: '回避特例', room, msg: `なるべくNGペア（${s1} と ${s2}）が「${room}」で同室です` }); }); });
    Object.entries(staffMap).forEach(([staff, rms]) => { const limit = customRules.alertMaxKenmu || 3; const dayCount = rms.filter(r => { const m = split(cells[r]).find(x => extractStaffName(x) === staff); return m && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:"); }).length; if(dayCount >= limit) w.push({ level: 'orange', title: '兼務限界', staff, msg: `${staff}さんが日中 ${dayCount}部屋を担当中` }); });
    const targetEmptyRooms = split(customRules.alertEmptyRooms || "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像");
    targetEmptyRooms.forEach(room => { if (split(cells[room]).length === 0) w.push({ level: 'yellow', title: '空室', room, msg: `「${room}」の担当者がいません` }); });
    const uTarget = customRules.capacity?.受付 ?? 2;
    if (split(cells["受付"]).reduce((sum: number, m: string) => sum + getStaffAmount(m), 0) < uTarget && split(cells["受付ヘルプ"]).length === 0) { w.push({ level: 'yellow', title: '受付不足', room: '受付', msg: `受付が${uTarget}名未満ですが、受付ヘルプがいません` }); }
    const curIdx = days.findIndex(d => d.id === dayId);
    if (curIdx > 0 && !days[curIdx-1].isPublicHoliday) { split(customRules.noConsecutiveRooms).forEach(room => { const prev = split(allDays[days[curIdx-1].id]?.[room]).map(extractStaffName); split(cells[room]).map(extractStaffName).filter(n => prev.includes(n)).forEach(n => w.push({ level: 'red', title: '連日注意', staff: n, room, msg: `${n}さんが「${room}」に連日入っています` })); }); }
    const absent = new Set<string>(); REST_SECTIONS.forEach(s => split(cells[s]).forEach(m => absent.add(extractStaffName(m)))); const assigned = new Set<string>(); WORK_SECTIONS.forEach(s => split(cells[s]).forEach(m => assigned.add(extractStaffName(m))));
    allStaff.filter(s => !absent.has(s) && !assigned.has(s)).forEach(staff => { w.push({ level: 'red', title: '未配置', staff, msg: `${staff}さんが配置されていません` }); });
    return w;
  };

  const monthlyMatrixStats = useMemo(() => {
    const targetMonth = targetMonday.substring(0, 7); const stats: Record<string, Record<string, { total: number, late: number }>> = {};
    activeGeneralStaff.forEach(s => { stats[s] = {}; ROOM_SECTIONS.forEach(r => stats[s][r] = { total: 0, late: 0 }); });
    Object.entries(allDays).forEach(([dateStr, cells]) => { if (dateStr.startsWith(targetMonth)) { ROOM_SECTIONS.forEach(room => { split(cells[room] || "").forEach(m => { const core = extractStaffName(m); if (stats[core]?.[room] !== undefined) { stats[core][room].total += 1; if (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")) stats[core][room].late += 1; } }); }); } });
    return stats;
  }, [targetMonday, allDays, activeGeneralStaff]);

  const setAllDaysWithHistory = (updater: any) => { setAllDays(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; if (JSON.stringify(prev) !== JSON.stringify(next)) setHistory(h => [...h, prev].slice(-20)); return next; }); };
  const updateDay = (k: string, v: string) => { setAllDaysWithHistory((prev: any) => { const nextState = { ...prev, [sel]: { ...(prev[sel] || {}), [k]: v } }; if (k === "入り") { const idx = days.findIndex(d => d.id === sel); if (idx >= 0 && idx < days.length - 1) { const nextDayId = days[idx + 1].id; const currentAke = split((prev[nextDayId] || {})["明け"]).filter(m => !split(v).includes(m)); nextState[nextDayId] = { ...(prev[nextDayId] || {}), "明け": join([...currentAke, ...split(v)]) }; } } return nextState; }); };

  const handleAutoAssign = (isSmart: boolean, isWeekly: boolean) => {
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev }; const newLogs = { ...assignLogs }; const ctx = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules }; const targetDays = isWeekly ? days : [cur];
      targetDays.forEach(day => {
        const idx = days.findIndex(d => d.id === day.id); let prevDayObj: any = null; const dObj = new Date(day.id);
        if (dObj.getDay() !== 1) { const prevDate = new Date(dObj); prevDate.setDate(prevDate.getDate() - 1); const prevDateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(prevDate.getDate())}`; if (nextAll[prevDateStr]) prevDayObj = { id: prevDateStr, cells: nextAll[prevDateStr] }; else if (idx > 0) prevDayObj = { id: days[idx-1].id, cells: nextAll[days[idx-1].id] || days[idx-1].cells }; }
        const targetMonth = day.id.substring(0, 7); const pastDaysInMonthArray = Object.entries(nextAll).filter(([dateStr]) => dateStr.startsWith(targetMonth) && dateStr < day.id).map(([dateStr, cells]) => ({ id: dateStr, cells } as any));
        const pastDaysInWeekArray = days.slice(0, idx).map(d => ({ ...d, cells: nextAll[d.id] || d.cells }));
        const worker = new AutoAssigner({ ...day, cells: nextAll[day.id] || day.cells }, prevDayObj, pastDaysInMonthArray, pastDaysInWeekArray, ctx, isSmart);
        const res = worker.execute(); nextAll[day.id] = res.cells; newLogs[day.id] = res.logInfo || [];
       });
      setAssignLogs(newLogs); return nextAll;
    });
  };

  const handleUndo = () => { if (history.length > 0) { const last = history[history.length - 1]; setAllDays(last); setHistory(h => h.slice(0, -1)); } };
  const updateMonthly = (k: string, v: string) => { setMonthlyAssign(prev => ({ ...prev, [k]: v })); };
  const updateRule = (type: keyof CustomRules, idx: number, key: string, val: any) => { setCustomRules(r => { const arr = [...((r[type] as any[]) || [])]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: keyof CustomRules, idx: number) => { setCustomRules(r => { const arr = [...((r[type] as any[]) || [])]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };
  const addRule = (type: keyof CustomRules, def: any) => { setCustomRules(r => ({ ...r, [type]: [...((r[type] as any[]) || []), def] })); };

  const handleClearGroupDay = (title: string, sections: string[]) => { if (window.confirm(`${cur.label} の「${title}」をクリアしますか？`)) { setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; sections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; }); } };
  const handleClearGroupWeek = (title: string, sections: string[]) => { if (window.confirm(`表示中の「${title}」を1週間分すべてクリアしますか？`)) { setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; sections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; }); } };
  const handleClearWorkDay = () => { if (window.confirm(`${cur.label} の「モダリティ」と「一般撮影・透視・その他」をクリアしますか？`)) { const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections]; setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; }); } };
  const handleClearWorkWeek = () => { if (window.confirm(`表示中の「モダリティ」と「一般撮影・透視・その他」を1週間分すべてクリアしますか？`)) { const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections]; setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; }); } };
  const handleCopyYesterday = () => { const idx = days.findIndex(d => d.id === cur.id); if (idx <= 0) return; const prevDay = days[idx - 1]; setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...prevDay.cells } })); };

  const handleExport = () => { const dataObj = { allDays, monthlyAssign, customRules }; const blob = new Blob([JSON.stringify(dataObj)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `shifto_backup_${targetMonday}.json`; a.click(); URL.revokeObjectURL(url); };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event: any) => { try { const dataObj = JSON.parse(event.target.result); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("データを復元しました！"); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("読み込みに失敗しました。"); } }; reader.readAsText(file); e.target.value = ""; };
  const handleCopyToClipboard = () => { const dataObj = { allDays, monthlyAssign, customRules }; navigator.clipboard.writeText(JSON.stringify(dataObj)).then(() => { alert("データをコピーしました！"); }).catch(() => { alert("コピーに失敗しました。"); }); };
  const handleTextImport = () => { if(!importText) return; try { const dataObj = JSON.parse(importText); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("テキストからデータを復元しました！"); setImportText(""); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("テキストの読み込みに失敗しました。"); } };

  return (
    <div style={{ maxWidth: "98%", margin: "0 auto", padding: "24px", boxSizing: "border-box" }}>
      <style>{globalStyle}</style>
      
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "20px 32px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 24, fontWeight: 900 }}>勤務割付システム Ver 2.78</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-hover" onClick={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()-7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={{...btnStyle("#f1f5f9", "#475569"), border:"1px solid #cbd5e1"}}>◀ 先週</button>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button className="btn-hover" onClick={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={{...btnStyle("#f1f5f9", "#475569"), border:"1px solid #cbd5e1"}}>来週 ▶</button>
        </div>
      </div>

      <div className="tabs-header no-print">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 週間予定表</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 月間集計</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>⚙️ 設定・データ入出力</button>
      </div>

      {/* ===================== カレンダー タブ ===================== */}
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
                              出勤:{stats.workingCount}名 (不在:{stats.absentCount}名)<br/>
                              未配置:<span style={{fontSize:17, textDecoration:"underline"}}>{stats.unassigned.length}</span>名 
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
                {SECTIONS.map((section, sIdx) => (
                  <tr key={section}>
                    <td style={{...cellStyle(true, false, false, true, sIdx % 2 === 1), borderRight: "2px solid #e2e8f0"}}>{section}</td>
                    {days.map((day, dIdx) => {
                      const currentMems = split(allDays[day.id]?.[section]);
                      const prevMems = dIdx > 0 ? split(allDays[days[dIdx-1].id]?.[section]).map(extractStaffName) : [];
                      
                      const isAlertRoom = split(customRules.noConsecutiveRooms).includes(section);
                      const warnings = getDayWarnings(day.id);
                      
                      const isRoomEmpty = currentMems.length === 0 && warnings.some(w => w.level === 'yellow' && w.room === section);
                      let baseBgStyle = cellStyle(false, day.isPublicHoliday, day.id === sel, false, sIdx % 2 === 1);
                      if (isRoomEmpty && !day.isPublicHoliday) baseBgStyle.background = "#fef08a";

                      return (
                        <td key={day.id + section} style={baseBgStyle}>
                          {!day.isPublicHoliday && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", lineHeight: "1.4" }}>
                              {currentMems.map((m, mIdx) => {
                                const coreName = extractStaffName(m); const mod = m.substring(coreName.length);
                                const isConsecutive = isAlertRoom && prevMems.includes(coreName);
                                const hasRedWarning = isConsecutive || warnings.some(w => w.level === 'red' && w.staff === coreName && w.room === section);
                                const hasOrangeWarning = warnings.some(w => w.level === 'orange' && w.staff === coreName);
                                const hasYellowWarning = warnings.some(w => w.level === 'yellow' && w.room === section && w.title === '回避特例');
                                let tagBg = "#f1f5f9"; let tagColor = "#334155"; let tagBorder = "#cbd5e1";
                                if (hasRedWarning) { tagBg = "#fee2e2"; tagColor = "#b91c1c"; tagBorder = "#fca5a5"; } else if (hasOrangeWarning) { tagBg = "#ffedd5"; tagColor = "#c2410c"; tagBorder = "#fdba74"; } else if (hasYellowWarning) { tagBg = "#fef08a"; tagColor = "#a16207"; tagBorder = "#fde047"; }

                                return (
                                  <div key={mIdx} style={{ background: tagBg, color: tagColor, border: `1px solid ${tagBorder}`, padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", fontSize: "15px", fontWeight: hasRedWarning ? 800 : 700 }}>
                                    <span>{coreName}</span>
                                    {mod && (mod.includes("(AM)") ? <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "12px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #bae6fd", fontWeight: 800 }}>AM</span> : mod.includes("(PM)") ? <span style={{ background: "#fce7f3", color: "#be185d", fontSize: "12px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #fbcfe8", fontWeight: 800 }}>PM</span> : <span style={{ background: "#f3f4f6", color: "#4b5563", fontSize: "12px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #d1d5db", fontWeight: 700 }}>{mod.replace(/[()]/g, '')}</span>)}
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
                <button className="btn-hover" onClick={() => setShowRuleModal(true)} style={{...btnStyle("#f8fafc", "#475569"), border: "1px solid #cbd5e1"}}>📖 システムのルール</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(false, false)} style={btnStyle("#10b981")}>✨ 1日自動割当</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(false, true)} style={btnStyle("#0ea5e9")}>⚡ 週間自動割当</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(true, false)} style={btnStyle("#f59e0b")}>🔄 欠員補充(1日)</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(true, true)} style={btnStyle("#d97706")}>🔄 欠員補充(週間)</button>
                <button className="btn-hover" onClick={handleCopyYesterday} style={{ ...btnStyle("#f8fafc", "#475569"), border: "1px solid #cbd5e1" }} disabled={cur.isPublicHoliday}>📋 昨日をコピー</button>
                <button className="btn-hover" onClick={handleUndo} disabled={history.length === 0} style={{...btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6")}}>↩️ 戻る</button>
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
             {RENDER_GROUPS.map((group: RenderGroup) => (
               <div key={group.title} style={{ gridColumn: "1 / -1" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #e2e8f0" }}>
                   <h4 style={{ fontSize: 21, fontWeight: 900, borderLeft: `6px solid ${group.color}`, paddingLeft: 12, margin: 0 }}>{group.title}</h4>
                   {group.title === "休務・夜勤" && (
                      <div style={{display: "flex", gap: 8}}>
                        <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                        <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                      </div>
                    )}
                    {group.title === "モダリティ" && (
                      <div style={{display: "flex", gap: 8}}>
                        <button onClick={handleClearWorkDay} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務1日クリア</button>
                        <button onClick={handleClearWorkWeek} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務週間クリア</button>
                      </div>
                    )}
                    {group.title === "待機・その他" && (
                      <div style={{display: "flex", gap: 8}}>
                        <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                        <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                      </div>
                    )}
                 </div>
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                   {group.sections.map((s: string) => <SectionEditor key={s} section={s} value={allDays[sel]?.[s] || ""} activeStaff={allStaff} onChange={(v: string) => updateDay(s, v)} noTime={REST_SECTIONS.includes(s) || s === "昼当番"} customOptions={ROLE_PLACEHOLDERS.filter(p => p.startsWith(s))} />)}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* ===================== 📊 マトリックス タブ ===================== */}
      <div className="no-print" style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 24 }}>
          <h3 style={{ fontWeight: 900, color: "#3b82f6", fontSize: 21, marginTop: 0 }}>配置マトリックス（月間集計）</h3>
          <div style={{ marginTop: 16, overflowX: "auto", maxHeight: "70vh", border: "2px solid #cbd5e1", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "16px", textAlign: "center", tableLayout: "auto" }}>
              <thead>
                <tr>
                  <th style={{ position: "sticky", left: 0, top: 0, background: "#f8fafc", zIndex: 30, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", color: "#1e293b", fontWeight: 900 }}>スタッフ</th>
                  {ROOM_SECTIONS.map(r => <th key={r} style={{ position: "sticky", top: 0, zIndex: 20, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", background: "#f8fafc", fontWeight: 900 }}>{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {allStaff.filter(s => activeGeneralStaff.includes(s)).map((staff, sIdx) => {
                  const isZebra = sIdx % 2 === 1; const rowBg = isZebra ? "#f1f5f9" : "#ffffff";
                  return (
                    <tr key={staff} className="calendar-row">
                      <td onClick={() => setSelectedStaffForStats(staff)} style={{ position: "sticky", left: 0, background: rowBg, zIndex: 10, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", fontWeight: 900, textAlign: "left", cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}>{staff}</td>
                      {ROOM_SECTIONS.map(r => {
                        const stat = monthlyMatrixStats[staff]?.[r] || { total: 0, late: 0 };
                        let bg = rowBg; let color = "#334155";
                        if (["CT", "MRI"].includes(r)) { if (stat.total > 0) { bg = `rgba(59, 130, 246, ${Math.min(0.1 + stat.total * 0.15, 0.9)})`; if(stat.total >= 3) color = "#fff"; } else if (isMonthlyMainStaff(r, staff, monthlyAssign)) bg = "#fef08a"; }
                        return (
                          <td key={r} style={{ padding: 10, background: bg, color: color, fontWeight: stat.total > 0 ? 900 : 500, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                              {stat.total > 0 ? <span style={{fontSize:17}}>{stat.total}</span> : <span style={{ width: "16px" }}></span>}
                              {stat.late > 0 && <span style={{ fontSize: "13px", background: "#fef08a", color: "#b45309", padding: "2px 6px", borderRadius: "6px", border: "1px solid #fde047" }}>遅{stat.late}</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== ⚙️ 設定 タブ ===================== */}
      <div className="no-print" style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 25, fontWeight: 900, marginBottom: 20, color: "#0f766e" }}>👥 スタッフ名簿</h3>
          <div style={{ background: "#f0fdf4", padding: "16px 20px", borderRadius: 12, border: "2px solid #bbf7d0", marginBottom: 24 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#166534", lineHeight: 1.6 }}>
              💡 順番を自動で「50音順」にするため、名前の後にカッコでふりがなをつけてください。<br/>
              （例： <span style={{ color: "#047857", fontWeight: 900, background: "#fff", padding: "2px 6px", borderRadius: "6px" }}>山田(やまだ)</span>、<span style={{ color: "#047857", fontWeight: 900, background: "#fff", padding: "2px 6px", borderRadius: "6px" }}>佐藤(さとう)</span> ）※カッコは半角・全角どちらでもOKです。
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
             <div>
               <label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>一般スタッフ</label>
               <textarea className="name-textarea" placeholder="例: 山田(やまだ)  佐藤(さとう)  鈴木(すずき)" value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} />
             </div>
             <div>
               <label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>受付スタッフ</label>
               <textarea className="name-textarea" placeholder="例: 高橋(たかはし)  伊藤(いとう)  渡辺(わたなべ)" value={customRules.receptionStaffList} onChange={e => setCustomRules({...customRules, receptionStaffList: e.target.value})} />
             </div>
          </div>
        </div>

        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 25, fontWeight: 900, marginBottom: 20, color: "#be185d" }}>📱 データ保存・復元</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
             <button className="btn-hover" onClick={handleExport} style={btnStyle("#6366f1")}>💾 ファイル保存</button>
             <button className="btn-hover" onClick={() => fileInputRef.current?.click()} style={btnStyle("#8b5cf6")}>📂 ファイル読込</button>
             <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleImport} />
             <div style={{ width: "2px", height: "32px", background: "#cbd5e1", margin: "0 8px" }}></div>
             <button className="btn-hover" onClick={handleCopyToClipboard} style={btnStyle("#db2777")}>📋 テキストコピー</button>
             <input type="text" value={importText} onChange={e => setImportText(e.target.value)} placeholder="貼り付けて復元" style={{ flex: 1, padding: "10px 16px", fontSize: 17, borderRadius: 8, border: "2px solid #f9a8d4" }} />
             <button className="btn-hover" onClick={handleTextImport} style={btnStyle("#be185d")}>✨ 復元</button>
          </div>
        </div>

        <div style={{ ...panelStyle() }}>
          <h3 style={{ fontSize: 27, fontWeight: 900, marginBottom: 32, color: "#0f766e" }}>📋 ルールの優先順位（システムはこの上から順に処理します）</h3>

          {/* ===================== フェーズ1 ===================== */}
          <div style={{ borderLeft: "8px solid #94a3b8", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 23, fontWeight: 900, color: "#475569", marginBottom: 20, borderBottom: "2px solid #cbd5e1", paddingBottom: 10 }}>フェーズ1：前提・固定ルール（最優先）</h4>
            
            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🙅" title="担当不可ルール">
              {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                    <div className="rule-row">
                      <select value={rule.staff} onChange={(e: any) => updateRule("forbidden", idx, "staff", e.target.value)} className="rule-sel"><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("forbidden", idx)} className="rule-del">✖</button>
                    </div>
                    <MultiPicker selected={rule.sections} onChange={(v: string) => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button>
            </RuleCard>

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🔒" title="専従ルール">
              {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.staff} onChange={(e: any) => updateRule("fixed", idx, "staff", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.section} onChange={(e: any) => updateRule("fixed", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("fixed", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button>
            </RuleCard>

            <RuleCard bg="#fef2f2" border="#fecaca" color="#b91c1c" icon="🚫" title="NGペア">
              {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.s1} onChange={(e: any) => updateRule("ngPairs", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span className="rule-label">と</span>
                    <select value={rule.s2} onChange={(e: any) => updateRule("ngPairs", idx, "s2", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.level || "hard"} onChange={(e: any) => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"120px"}}><option value="hard">絶対NG</option><option value="soft">なるべくNG</option></select>
                    <button onClick={() => removeRule("ngPairs", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ NGペアを追加</button>
            </RuleCard>

            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🕒" title="終日専任・連日禁止">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <label style={{ fontSize: 16, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【終日専任】半休・AM/PM不可の部屋</label>
                  <MultiPicker selected={customRules.fullDayOnlyRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, fullDayOnlyRooms: v})} options={ROOM_SECTIONS} />
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <label style={{ fontSize: 16, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【連日禁止】2日連続で担当させない部屋</label>
                  <MultiPicker selected={customRules.noConsecutiveRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, noConsecutiveRooms: v})} options={ROOM_SECTIONS} />
                </div>
              </div>
            </RuleCard>

            <RuleCard bg="#fdf4ff" border="#f5d0fe" color="#86198f" icon="🏠" title="遅番不可スタッフ・部屋">
              <label style={{ fontSize: 16, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>遅番不可スタッフ</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center", marginBottom: 16 }}>
                <MultiPicker selected={customRules.noLateShiftStaff || ""} onChange={(v: string) => setCustomRules({...customRules, noLateShiftStaff: v})} options={allStaff} placeholder="＋スタッフを選択" />
              </div>
              <label style={{ fontSize: 16, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>その日その部屋に入っている人も遅番除外</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center" }}>
                <MultiPicker selected={customRules.noLateShiftRooms || ""} onChange={(v: string) => setCustomRules({...customRules, noLateShiftRooms: v})} options={ROOM_SECTIONS} placeholder="＋部屋を選択" />
              </div>
            </RuleCard>
          </div>

          {/* ===================== フェーズ2 ===================== */}
          <div style={{ borderLeft: "8px solid #f59e0b", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 22, fontWeight: 900, color: "#b45309", marginBottom: 20, borderBottom: "2px solid #fcd34d", paddingBottom: 10 }}>フェーズ2：例外・代打処理</h4>
            
            <RuleCard bg="#fef08a" border="#fde047" color="#a16207" icon="🚨" title="緊急・空室対応ルール">
              <div style={{ marginBottom: 16, padding: "12px", background: "#fef8f8", borderRadius: "8px", border: "1px dashed #fca5a5", color: "#991b1b", fontSize: "15px", fontWeight: "600" }}>💡 <b>「左側（発動条件）」から「右側（アクション）」へ</b> 流れるようにルールを設定します。</div>
              {(customRules.emergencies || []).map((em: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ flex: '1 1 350px', display: 'flex', gap: '8px', alignItems: 'center', borderRight: '2px dashed #cbd5e1', paddingRight: '16px' }}>
                      <span style={{fontWeight: 800, color: '#ef4444', flexShrink: 0}}>【条件】</span>
                      <select className="rule-sel" value={em.type} onChange={(e:any) => updateRule("emergencies", idx, "type", e.target.value)}>
                        <option value="change_capacity">出勤人数が指定以下の場合</option>
                        <option value="staff_assign">出勤人数が指定以下の場合（強制配置）</option>
                        <option value="role_assign">出勤人数が指定以下の場合（月間担当）</option>
                        <option value="clear">出勤人数が指定以下の場合（部屋閉鎖）</option>
                        <option value="empty_room_swap">指定の部屋が空室の場合</option>
                      </select>
                      {em.type !== 'empty_room_swap' && <><input type="number" className="rule-num" value={em.threshold || 0} onChange={(e:any)=>updateRule("emergencies", idx, "threshold", Number(e.target.value))} />人以下</>}
                      {em.type === 'empty_room_swap' && <><select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">監視する部屋</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> が空室</>}
                    </div>
                    <div style={{ flex: '1 1 400px', display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '8px' }}>
                       <span style={{fontWeight: 800, color: '#3b82f6', flexShrink: 0}}>➔【アクション】</span>
                       {em.type === 'change_capacity' && <><select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">対象部屋</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> の定員を <input type="number" className="rule-num" value={em.newCapacity||1} onChange={(e:any)=>updateRule("emergencies", idx, "newCapacity", Number(e.target.value))} /> 名にする</>}
                       {em.type === 'staff_assign' && <><select className="rule-sel" value={em.staff} onChange={(e:any)=>updateRule("emergencies", idx, "staff", e.target.value)}><option value="">スタッフ</option>{activeGeneralStaff.map(s=><option key={s} value={s}>{s}</option>)}</select> を <select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">配置先</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> に配置</>}
                       {em.type === 'role_assign' && <><select className="rule-sel" value={em.role} onChange={(e:any)=>updateRule("emergencies", idx, "role", e.target.value)}><option value="">月間設定</option>{MONTHLY_CATEGORIES.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select> を <select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">配置先</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> に配置</>}
                       {em.type === 'clear' && <><select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">閉鎖する部屋</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> を無人にする</>}
                       {em.type === 'empty_room_swap' && <><select className="rule-sel" value={em.sourceRooms} onChange={(e:any)=>updateRule("emergencies", idx, "sourceRooms", e.target.value)}><option value="">補充元の部屋(優先順)</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> から玉突き補充</>}
                    </div>
                    <button onClick={() => removeRule("emergencies", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#a16207", borderColor:"#ca8a04"}} onClick={() => addRule("emergencies", { type: "change_capacity", threshold: 16, section: "CT", newCapacity: 3 })}>＋ 緊急ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🔄" title="メイン配置の交換ルール" desc="※ 兼務に行けないスタッフを、別部屋の兼務に行けるスタッフと丸ごと入れ替えます。">
              {(customRules.swapRules || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "2px solid #bbf7d0", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d"}}>[</span>
                      <select value={rule.targetRoom} onChange={(e: any) => updateRule("swapRules", idx, "targetRoom", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">兼務先</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#15803d"}}>] に [</span>
                      <select value={rule.triggerRoom} onChange={(e: any) => updateRule("swapRules", idx, "triggerRoom", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">メイン部屋</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#15803d"}}>] の担当者が誰も入れない時➔</span>
                      <button onClick={() => removeRule("swapRules", idx)} className="rule-del">✖</button>
                    </div>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d"}}>以下の部屋の担当者とメイン配置を交換する（※左の部屋から優先）:</span>
                      <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("swapRules", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("swapRules", { targetRoom: "ポータブル", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" })}>＋ 交換ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#fff7ed" border="#fed7aa" color="#c2410c" icon="🔄" title="代打ルール">
              {(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center", background: "#fff", padding: "16px", borderRadius: 8, border: "1px solid #fdba74", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}><MultiPicker selected={rule.target} onChange={(v: string) => updateRule("substitutes", idx, "target", v)} options={activeGeneralStaff} placeholder="対象スタッフ(休)" /></div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#c2410c" }}>が全員休みの時➔</span>
                    <div style={{ flex: 1, minWidth: "200px" }}><MultiPicker selected={rule.subs} onChange={(v: string) => updateRule("substitutes", idx, "subs", v)} options={activeGeneralStaff} placeholder="代打スタッフを追加" /></div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#c2410c" }}>を</span>
                    <select value={rule.section} onChange={(e: any) => updateRule("substitutes", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fed7aa", color: "#c2410c", flex: "0 0 140px"}}><option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#c2410c" }}>に優先</span>
                    <button onClick={() => removeRule("substitutes", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#c2410c", borderColor:"#fdba74"}} onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#e0f2fe" border="#bae6fd" color="#0369a1" icon="🎱" title="玉突きルール">
              {(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "1px solid #bae6fd", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <select value={rule.s1 || rule.triggerStaff} onChange={(e: any) => updateRule("pushOuts", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>と</span>
                      <select value={rule.s2 || rule.targetStaff} onChange={(e: any) => updateRule("pushOuts", idx, "s2", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>が同じ</span>
                      <select value={rule.triggerSection} onChange={(e: any) => updateRule("pushOuts", idx, "triggerSection", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>になる時➔ 後者を</span>
                      <button onClick={() => removeRule("pushOuts", idx)} className="rule-del">✖</button>
                    </div>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#0284c7"}}>以下の部屋に移動（※左から優先）:</span>
                      <MultiPicker selected={rule.targetSections} onChange={(v: string) => updateRule("pushOuts", idx, "targetSections", v)} options={ROOM_SECTIONS} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#0369a1", borderColor:"#7dd3fc"}} onClick={() => addRule("pushOuts", { s1: "", s2: "", triggerSection: "", targetSections: "" })}>＋ 玉突きルールを追加</button>
            </RuleCard>
          </div>

          {/* ===================== フェーズ3 ===================== */}
          <div style={{ borderLeft: "8px solid #3b82f6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 22, fontWeight: 900, color: "#1d4ed8", marginBottom: 20, borderBottom: "2px solid #bfdbfe", paddingBottom: 10 }}>フェーズ3：メイン配置</h4>
            
            <RuleCard bg="#fffbeb" border="#fde68a" color="#b45309" icon="👑" title="部屋の割り当て優先順位">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {(customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS).map((room, idx, arr) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "10px 14px", borderRadius: 8, border: "1px solid #fcd34d" }}>
                    <div style={{ display: "flex", alignItems: "center" }}><span style={{ fontSize: 16, fontWeight: 800, color: "#92400e", marginRight: 8 }}>{idx + 1}.</span><span style={{ fontSize: 18, fontWeight: 700, color: "#b45309" }}>{room}</span></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "6px 10px", fontSize: 16 }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "6px 10px", fontSize: 16 }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
            </RuleCard>

            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="👥" title="絶対優先の定員設定">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", padding: "10px 16px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                    <span style={{ fontWeight: 800, fontSize: 18 }}>{room}:</span>
                    <input type="number" value={count as number} onChange={e => setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: Number(e.target.value)}})} style={{ width: 60, border: "none", fontSize: 20, textAlign: "center", fontWeight: 800 }} />
                    <span style={{fontSize: 16}}>人</span>
                    <span onClick={() => { const n={...customRules.capacity}; delete n[room]; setCustomRules({...customRules, capacity:n}); }} style={{ cursor: "pointer", color: "#ef4444", marginLeft: 8, fontSize: 20 }}>✖</span>
                  </div>
                ))}
                <select onChange={(e: any) => { if(e.target.value) setCustomRules({...customRules, capacity: {...customRules.capacity, [e.target.value]: 1}}); e.target.value=""; }} className="rule-sel" style={{flex:"none", width:180}}><option value="">＋部屋追加</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select>
              </div>
            </RuleCard>

            <RuleCard bg="#fff" border="#e2e8f0" color="#334155" icon="📅" title="月間担当者の設定">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => {
                  const opts = key === "受付ヘルプ" ? GENERAL_ROOMS : [];
                  return (
                    <SectionEditor key={key} section={label} value={monthlyAssign[key] || ""} activeStaff={key === "受付" ? activeReceptionStaff : allStaff} onChange={(v: string) => updateMonthly(key, v)} noTime={true} customOptions={opts} />
                  );
                })}
              </div>
            </RuleCard>
          </div>

          {/* ===================== フェーズ4 ===================== */}
          <div style={{ borderLeft: "8px solid #10b981", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 22, fontWeight: 900, color: "#047857", marginBottom: 20, borderBottom: "2px solid #a7f3d0", paddingBottom: 10 }}>フェーズ4：兼務・救済・遅番</h4>
            
            <RuleCard bg="#fdf4ff" border="#f5d0fe" color="#86198f" icon="✨" title="スマート兼務（専任担当の負担軽減・引き抜き）" desc="※ 指定した部屋の専任担当者をフリーにし、他部屋から兼務で引き抜きます。">
              {(customRules.smartKenmu || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ background: "#fff", padding: "16px 20px", border: "1px solid #f0abfc", borderRadius: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#86198f" }}>[</span>
                        <select value={rule.targetRoom} onChange={(e: any) => updateRule("smartKenmu", idx, "targetRoom", e.target.value)} className="rule-sel" style={{ borderColor: "#f0abfc", minWidth: 160, padding: "8px 24px 8px 10px" }}>
                          <option value="">専任を外す部屋</option>
                          {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#86198f" }}>] を、以下の担当者に兼務させる（※左から優先）:</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 6 }}>
                        <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("smartKenmu", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                      </div>
                    </div>
                    <button onClick={() => removeRule("smartKenmu", idx)} className="rule-del" style={{ marginTop: 4 }}>✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#86198f", borderColor: "#f0abfc" }} onClick={() => addRule("smartKenmu", { targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" })}>＋ スマート兼務ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#ecfdf5" border="#a7f3d0" color="#065f46" icon="🔗" title="兼務・セット配置ルール">
              <h6 style={{ fontSize: 16, color: "#047857", marginTop: 0, marginBottom: 12 }}>■ 常時兼務ペア</h6>
              {(customRules.kenmuPairs || []).map((rule: any, idx: number) => (
                <div key={idx} className="rule-row" style={{ background: "#fff", padding: "12px 16px", border: "1px solid #a7f3d0", borderRadius: 8 }}>
                  <select value={rule.s1} onChange={(e: any) => updateRule("kenmuPairs", idx, "s1", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7" }}><option value="">部屋を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <span className="rule-label" style={{ color: "#065f46" }}>←→</span>
                  <select value={rule.s2} onChange={(e: any) => updateRule("kenmuPairs", idx, "s2", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7" }}><option value="">部屋を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16, fontSize: 15, color: "#047857", fontWeight: 700, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!rule.isExclusive} onChange={(e) => updateRule("kenmuPairs", idx, "isExclusive", e.target.checked)} style={{ width: 20, height: 20, cursor: "pointer" }} />
                    このペアに専念させる（他の部屋の兼務を一切禁止する）
                  </label>
                  <button onClick={() => removeRule("kenmuPairs", idx)} className="rule-del">✖</button>
                </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("kenmuPairs", { s1: "", s2: "" })}>＋ ペアを追加</button>

              <h6 style={{ fontSize: 16, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 基本兼務（セット配置）<br/><span style={{fontSize: 14, color: "#065f46", fontWeight: "normal", marginLeft: 12}}>※ 引抜元が定員を満たしている場合のみ発動します。</span></h6>
              {(customRules.linkedRooms || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "1px solid #a7f3d0", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#065f46" }}>[</span>
                        <select value={rule.target} onChange={(e: any) => updateRule("linkedRooms", idx, "target", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7", minWidth: 160, padding: "10px 24px 10px 10px" }}>
                          <option value="">兼務専用にする部屋</option>
                          {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#065f46" }}>] には専任を置かず、[</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }}>
                        <MultiPicker selected={rule.sources} onChange={(v: string) => updateRule("linkedRooms", idx, "sources", v)} options={EXTENDED_ROOM_SECTIONS} />
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#065f46" }}>] の担当者をセットで配置する（※左から優先）</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 16, color: "#065f46" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 16, color: "#065f46" }}>▼</button>
                      <button onClick={() => removeRule("linkedRooms", idx)} className="rule-del" style={{ marginTop: 6 }}>✖</button>
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("linkedRooms", { target: "", sources: "" })}>＋ セット配置ルールを追加</button>

              <h6 style={{ fontSize: 16, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 🆘 空室（人数不足）救済ルール</h6>
              {(customRules.rescueRules || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "1px solid #fde047", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#854d0e" }}>もし</span>
                        <select value={rule.targetRoom} onChange={(e: any) => updateRule("rescueRules", idx, "targetRoom", e.target.value)} className="rule-sel" style={{ borderColor: "#fef08a", minWidth: 160, padding: "10px 24px 10px 10px" }}>
                          <option value="">（空室の部屋）</option>
                          {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#854d0e" }}>が不足なら ➔ 以下の部屋から兼務を探す（※左から優先）</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10 }}>
                        <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("rescueRules", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 16, color: "#a16207" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 16, color: "#a16207" }}>▼</button>
                      <button onClick={() => removeRule("rescueRules", idx)} className="rule-del" style={{ marginTop: 6 }}>✖</button>
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#854d0e", borderColor: "#fde047" }} onClick={() => addRule("rescueRules", { targetRoom: "", sourceRooms: "" })}>＋ 救済ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#f5f3ff" border="#ddd6fe" color="#6d28d9" icon="🌆" title="遅番ルール">
              <div style={{ marginBottom: 16, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #ddd6fe" }}>
                <label style={{ fontSize: 14, fontWeight: 800, color: "#6d28d9", display: "block", marginBottom: 4 }}>優先度を下げるスタッフ（左に書いた人ほど徹底して除外します）</label>
                <MultiPicker selected={customRules.lateShiftLowPriorityStaff || ""} onChange={(v: string) => setCustomRules({...customRules, lateShiftLowPriorityStaff: v})} options={allStaff} placeholder="＋スタッフを選択" />
                <div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>※遅番は「日中の業務量」ではなく「今月の遅番回数が少ない人」から均等に選ばれます。ここに登録された人は回数に関わらず最終手段としてのみ選ばれます。</div>
              </div>
              {(customRules.lateShifts || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"12px 16px", border:"1px solid #ddd6fe", borderRadius:8}}>
                    <select value={rule.section} onChange={(e: any) => updateRule("lateShifts", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "140px", flex: "1 1 auto"}}><option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>に</span>
                    <select value={rule.lateTime} onChange={(e: any) => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">遅番の時間</option>{TIME_OPTIONS.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>の担当を追加する（日勤は</span>
                    <select value={rule.dayEndTime} onChange={(e: any) => updateRule("lateShifts", idx, "dayEndTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">終了時間</option>{TIME_OPTIONS.filter(t => t.includes("(〜")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>とする）</span>
                    <button onClick={() => removeRule("lateShifts", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#fff1f2" border="#fecaca" color="#be185d" icon="⚠️" title="兼務上限のストッパー設定（過労防止）">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" min="2" max="10" value={customRules.alertMaxKenmu ?? 3} onChange={(e: any) => setCustomRules({...customRules, alertMaxKenmu: Number(e.target.value)})} style={{ width: 80, padding: "10px", borderRadius: 8, border: "1px solid #fca5a5", textAlign: "center", fontWeight: 800, color: "#be185d", fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: "#9f1239" }}>部屋以上の兼務は自動ブロック（手動時はエラー表示）</span>
              </div>
            </RuleCard>
          </div>

         {/* ===================== フェーズ5 ===================== */}
          <div style={{ borderLeft: "8px solid #8b5cf6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 22, fontWeight: 900, color: "#6d28d9", marginBottom: 20, borderBottom: "2px solid #c4b5fd", paddingBottom: 10 }}>フェーズ5：仕上げ（最後に配置）</h4>
            
            <RuleCard bg="#eef2ff" border="#c7d2fe" color="#4338ca" icon="🍱" title="昼当番ルール">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#fff", padding: "12px 20px", borderRadius: 10, border: "1px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span>
                  <input type="number" min="0" value={customRules.lunchBaseCount ?? 3} onChange={(e: any) => setCustomRules({...customRules, lunchBaseCount: Number(e.target.value)})} style={{ width: 80, padding: "8px", borderRadius: 6, border: "1px solid #a5b4fc", textAlign: "center", fontWeight: 800, color: "#4f46e5", fontSize: 18 }} />
              </div>

              <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", marginBottom: 20 }}>
                <h6 style={{ margin: "0 0 16px 0", fontSize: 16, color: "#4f46e5", fontWeight: 800 }}>👤 特定役割の確保（別部屋から引抜）</h6>
                {(customRules.lunchRoleRules || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{ borderBottom: "1px dashed #e0e7ff", paddingBottom: 16, marginBottom: 16 }}>
                    <select value={rule.day} onChange={(e: any) => updateRule("lunchRoleRules", idx, "day", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", minWidth: "100px"}}>{["月","火","水","木","金","土","日","毎日"].map(d => <option key={d} value={d}>{d}{d!=="毎日"?"曜":""}</option>)}</select>
                    <span className="rule-label">は</span>
                    <select value={rule.role} onChange={(e: any) => updateRule("lunchRoleRules", idx, "role", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", minWidth: "140px"}}><option value="">役割を選択</option>{MONTHLY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
                    <span className="rule-label">担当を優先。引抜元（定員を満たしている場合のみ。※左から優先）:</span>
                    <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("lunchRoleRules", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                    <button onClick={() => removeRule("lunchRoleRules", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("lunchRoleRules", { day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" })}>＋ 役割確保ルールを追加</button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#4f46e5", fontWeight: 800 }}>📅 曜日ごとに人数を変える</h6>
                    {(customRules.lunchSpecialDays || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.day} onChange={(e: any) => updateRule("lunchSpecialDays", idx, "day", e.target.value)} className="rule-sel">{["月","火","水","木","金","土","日"].map(d => <option key={d} value={d}>{d}曜</option>)}</select>
                        <span className="rule-label">は</span>
                        <input type="number" value={rule.count} onChange={(e: any) => updateRule("lunchSpecialDays", idx, "count", Number(e.target.value))} className="rule-num" />
                        <button onClick={() => removeRule("lunchSpecialDays", idx)} className="rule-del">✖</button>
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchSpecialDays", { day: "火", count: 4 })}>＋ 曜日ルールを追加</button>
                  </div>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h6>
                    {(customRules.lunchConditional || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.section} onChange={(e: any) => updateRule("lunchConditional", idx, "section", e.target.value)} className="rule-sel"><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <input type="number" value={rule.min} onChange={(e: any) => updateRule("lunchConditional", idx, "min", Number(e.target.value))} className="rule-num" />
                        <span className="rule-label">人以上➔</span>
                        <input type="number" value={rule.out} onChange={(e: any) => updateRule("lunchConditional", idx, "out", Number(e.target.value))} className="rule-num" />
                        <button onClick={() => removeRule("lunchConditional", idx)} className="rule-del">✖</button>
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchConditional", { section: "CT", min: 4, out: 1 })}>＋ 条件ルールを追加</button>
                  </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 24 }}>
                  <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", minWidth: "260px" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#4f46e5", fontWeight: 800 }}>🎯 優先的に選出する部屋</h6>
                    <MultiPicker selected={customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT"} onChange={(v: string) => setCustomRules({...customRules, lunchPrioritySections: v})} options={ROOM_SECTIONS} />
                  </div>
                  <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", minWidth: "260px" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#4f46e5", fontWeight: 800 }}>⚠️ 緊急時のみ選出する部屋（なるべく除外）</h6>
                    <MultiPicker selected={customRules.lunchLastResortSections ?? "治療"} onChange={(v: string) => setCustomRules({...customRules, lunchLastResortSections: v})} options={ROOM_SECTIONS} />
                  </div>
              </div>
            </RuleCard>

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🤝" title="サポート専任（2人目要員）ルール">
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 16, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>対象スタッフ名（複数可）</label>
                    <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "1px solid #86efac", minHeight: "56px", display: "flex", alignItems: "center" }}>
                      <MultiPicker selected={customRules.supportStaffList || ""} onChange={(v: string) => setCustomRules({...customRules, supportStaffList: v})} options={allStaff} placeholder="＋スタッフを選択" />
                    </div>
                  </div>
                  <div style={{ flex: 2, minWidth: "260px" }}>
                    <label style={{ fontSize: 16, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>優先する対象部屋</label>
                    <MultiPicker selected={customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT"} onChange={(v: string) => setCustomRules({...customRules, supportTargetRooms: v})} options={ROOM_SECTIONS} />
                  </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start", marginTop: 16 }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#166534", display: "block", marginBottom: 4 }}>低影響グループ（優先的に補充元にする部屋）</label>
                    <MultiPicker selected={customRules.supportTargetRoomsLowImpact ?? "3号室,パノラマCT"} onChange={(v: string) => setCustomRules({...customRules, supportTargetRoomsLowImpact: v})} options={ROOM_SECTIONS} />
                  </div>
                  <div style={{ flex: 2, minWidth: "260px" }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#166534", display: "block", marginBottom: 4 }}>高影響グループ（極力補充元にしない部屋）</label>
                    <MultiPicker selected={customRules.supportTargetRoomsHighImpact ?? "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像"} onChange={(v: string) => setCustomRules({...customRules, supportTargetRoomsHighImpact: v})} options={ROOM_SECTIONS} />
                  </div>
              </div>
            </RuleCard>
          </div>
          
        </div>
      </div>

      {/* ===================== モーダル類 ===================== */}
      {showUnassignedList && (
        <Modal title="未配置のスタッフ" onClose={() => setShowUnassignedList(null)}>
          <div style={{ fontSize: 20, lineHeight: 1.6, color: "#ef4444", fontWeight: 800, textAlign: "center" }}>
            {getDailyStats(showUnassignedList).unassigned.join("、") || "全員配置済みです"}
          </div>
        </Modal>
      )}

      {selectedErrorDay && (
        <Modal title={`👀 ${selectedErrorDay} の確認事項`} onClose={() => setSelectedErrorDay(null)}>
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
        </Modal>
      )}

      {selectedStaffForStats && (
        <Modal title={`👤 ${selectedStaffForStats} さんの詳細`} onClose={() => setSelectedStaffForStats(null)}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 18 }}>
            <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}><th style={{ padding: "12px 10px", textAlign: "left" }}>日付</th><th style={{ padding: "12px 10px", textAlign: "left" }}>担当業務</th></tr></thead>
            <tbody>
              {Object.entries(allDays).filter(([dateStr]) => dateStr.startsWith(targetMonday.substring(0, 7))).sort((a, b) => a[0].localeCompare(b[0])).map(([dateStr, cells]) => {
                const assigns: string[] = [];
                Object.entries(cells).forEach(([sec, val]) => {
                  if(["明け","入り","土日休日代休","不在","待機","昼当番","受付","受付ヘルプ"].includes(sec)) return;
                  const members = split(val as string); const myAssign = members.find(m => extractStaffName(m) === selectedStaffForStats);
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
        </Modal>
      )}

      {showLogDay && (
        <Modal title={`🤔 ${showLogDay} の割当根拠`} onClose={() => setShowLogDay(null)} wide>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {assignLogs[showLogDay]?.map((log, i) => renderLog(log, i))}
            {!assignLogs[showLogDay] || assignLogs[showLogDay].length === 0 ? <li style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>自動割当の履歴がありません</li> : null}
          </ul>
        </Modal>
      )}

      {showRuleModal && (
        <Modal title="🏥 勤務割付システムのルールブック" onClose={() => setShowRuleModal(false)} wide>
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
              <strong style={{ color: "#334155" }}>💡 最後に</strong><br/>
              もし「この部屋の負担が偏っている」場合は、人間が【設定画面】の「月担当」や「優先順位」を少し調整することで、意図に近いシフトを作れるようになります。
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
