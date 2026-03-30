import React, { useEffect, useMemo, useState, useRef } from "react";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  
  html, body, #root { 
    max-width: 100% !important; 
    width: 100% !important; 
    margin: 0 !important; 
    padding: 0 !important; 
  }

  body { background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.02em; font-size: 24px; overflow-x: clip; }
  
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  textarea:focus, select:focus, input:focus { outline: 3px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  
  select { 
    appearance: none; 
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); 
    background-repeat: no-repeat; 
    background-position: right 16px center; 
    background-size: 1.5em; 
    text-overflow: ellipsis; 
    white-space: nowrap; 
    overflow: hidden; 
    padding-right: 64px !important; 
  }
  
  details > summary { list-style: none; cursor: pointer; transition: color 0.2s; outline: none; }
  details > summary:hover { color: #0d9488; }
  details > summary::-webkit-details-marker { display: none; }
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
  
  .sticky-header { position: sticky; top: 0; z-index: 30; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); padding-top: 20px; margin-top: -20px; box-shadow: 0 10px 10px -10px rgba(0,0,0,0.05); }

  .calendar-row { transition: background-color 0.2s; cursor: pointer; }
  .calendar-row:hover { background-color: #f1f5f9 !important; }
  .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important; }
  .btn-hover:active { transform: translateY(0); box-shadow: none !important; }
  .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; cursor: pointer; }
  .card-hover:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .rule-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; align-items: center; width: 100%; }
  .rule-sel { padding: 14px 44px 14px 18px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 600; flex: 1 1 160px; min-width: 160px; font-size: 24px; transition: border-color 0.2s; }
  .rule-num { width: 90px; padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 24px; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 28px; flex-shrink: 0; padding: 0 12px; transition: 0.2s; }
  .rule-del:hover { background: #fee2e2; border-radius: 6px; }
  .rule-add { background: #fff; color: #4f46e5; border: 2px dashed #a5b4fc; padding: 16px 24px; font-size: 24px; width: 100%; display: flex; justify-content: center; font-weight: bold; border-radius: 10px; cursor: pointer; margin-top: 16px; transition: all 0.2s; }
  .rule-add:hover { background: #e0e7ff; border-color: #4f46e5; }
  .rule-label { font-size: 24px; font-weight: 700; color: #64748b; flex-shrink: 0; }
  
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  .modal-animate { animation: fadeIn 0.2s ease-out forwards; }

  @media print {
    body { background: #fff; overflow: visible; font-size: 16pt; } .no-print { display: none !important; }
    .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
    table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed; }
    tr { page-break-inside: avoid; }
    th, td { border: 1px solid #000 !important; padding: 12px !important; font-size: 16pt !important; color: #000 !important; position: static !important; max-width: 150px; word-break: break-all; }
  }
`;

// ===================== 🌟 型定義 =====================
type RenderGroup = { title: string; color: string; sections: string[] };
type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
type RejectReason = { hard: boolean, msg: string };

interface RuleCapacity { [room: string]: number; }
interface RuleDailyCapacity { date: string; section: string; capacity: number; }
interface RuleDailyAddition { date: string; section: string; time: string; count: number; }
interface RuleNgPair { s1: string; s2: string; level: string; }
interface RuleFixed { staff: string; section: string; }
interface RuleForbidden { staff: string; sections: string; }
interface RuleSubstitute { target: string; subs: string; section: string; }
interface RulePushOut { s1?: string; triggerStaff?: string; s2?: string; targetStaff?: string; triggerSection: string; targetSections: string; }
interface RuleEmergency { threshold: number; type: string; role?: string; section?: string; s1?: string; s2?: string; newCapacity?: number; }
interface RuleKenmuPair { s1: string; s2: string; }
interface RuleRescue { targetRoom: string; sourceRooms: string; }
interface RuleLateShift { section: string; lateTime: string; dayEndTime: string; }
interface RuleLunchSpecial { day: string; count: number; }
interface RuleLunchCond { section: string; min: number; out: number; }
interface RuleLinked { target: string; sources: string; } 

interface CustomRules {
  staffList: string;
  receptionStaffList: string;
  supportStaffList: string;
  supportTargetRooms: string;
  customHolidays: string;
  capacity: RuleCapacity;
  dailyCapacities: RuleDailyCapacity[];
  dailyAdditions: RuleDailyAddition[];
  priorityRooms: string[];
  fullDayOnlyRooms: string;
  noConsecutiveRooms: string;
  noLateShiftStaff: string;
  ngPairs: RuleNgPair[];
  fixed: RuleFixed[];
  forbidden: RuleForbidden[];
  substitutes: RuleSubstitute[];
  pushOuts: RulePushOut[];
  emergencies: RuleEmergency[];
  kenmuPairs: RuleKenmuPair[];
  rescueRules: RuleRescue[];
  lateShifts: RuleLateShift[];
  helpThreshold: number;
  lunchBaseCount: number;
  lunchSpecialDays: RuleLunchSpecial[];
  lunchConditional: RuleLunchCond[];
  lunchPrioritySections: string;
  lunchLastResortSections: string;
  linkedRooms: RuleLinked[];
  alertMaxKenmu: number;
  alertEmptyRooms: string;
}

type AutoAssignContext = { 
  allStaff: string[]; 
  activeGeneralStaff: string[]; 
  activeReceptionStaff: string[]; 
  monthlyAssign: Record<string, string>; 
  customRules: CustomRules; 
};

const SECTIONS = [
  "明け","入り","土日休日代休","不在","待機","CT","MRI","RI",
  "1号室","2号室","3号室","5号室","透視（6号）","透視（11号）",
  "MMG","骨塩","パノラマCT","ポータブル","DSA","治療","検像","昼当番","受付","受付ヘルプ" 
];

const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
const ROLE_PLACEHOLDERS = ROOM_SECTIONS.map(s => s + "枠");
const GENERAL_ROOMS = ["1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA", "検像"];
const FALLBACK_HOLIDAYS: Record<string, string> = {
  "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日", "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日"
};

const MONTHLY_CATEGORIES = [
  { key: "CT", label: "CT" }, { key: "MRI", label: "MRI" }, { key: "治療", label: "治療 (メイン)" }, { key: "治療サブ優先", label: "治療 (サブ優先)" },
  { key: "治療サブ", label: "治療 (サブ)" }, { key: "RI", label: "RI (メイン)" }, { key: "RIサブ", label: "RI (サブ)" }, { key: "MMG", label: "MMG" },
  { key: "受付", label: "受付" }, { key: "受付ヘルプ", label: "受付ヘルプ" }
];

const DEFAULT_STAFF = "";
const DEFAULT_MONTHLY_ASSIGN: Record<string, string> = { CT: "", MRI: "", 治療: "", 治療サブ優先: "", 治療サブ: "", RI: "", RIサブ: "", MMG: "", 受付: "", 受付ヘルプ: "" };

const DEFAULT_PRIORITY_ROOMS = [
  "治療", "受付", "MMG", "RI", "MRI", "CT", "透視（6号）", "透視（11号）", "1号室", "5号室", "2号室", "骨塩", "ポータブル", "DSA", "検像", "パノラマCT", "3号室", "受付ヘルプ", "透析後胸部"
];

const DEFAULT_RULES: CustomRules = { 
  staffList: DEFAULT_STAFF, receptionStaffList: "", supportStaffList: "", supportTargetRooms: "2号室, 3号室", customHolidays: "", 
  capacity: { CT: 4, MRI: 3, 治療: 3, RI: 1, MMG: 1, "透視（6号）": 1, "透視（11号）": 1, 骨塩: 1, "1号室": 1, "5号室": 1, パノラマCT: 2 }, 
  dailyCapacities: [], dailyAdditions: [], 
  priorityRooms: DEFAULT_PRIORITY_ROOMS, 
  fullDayOnlyRooms: "", 
  noConsecutiveRooms: "ポータブル",
  noLateShiftStaff: "浅野、木内康、髙橋",
  ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], 
  kenmuPairs: [], 
  rescueRules: [],
  lateShifts: [], helpThreshold: 24, lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], 
  lunchPrioritySections: "RI, 1号室, 2号室, 3号室, 5号室", lunchLastResortSections: "治療",
  alertMaxKenmu: 3,
  alertEmptyRooms: "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像",
  linkedRooms: []
};

const KEY_ALL_DAYS = "shifto_alldays_v210"; 
const KEY_MONTHLY = "shifto_monthly_v210"; 
const KEY_RULES = "shifto_rules_v210";

const pad = (n: number) => String(n).padStart(2, '0');

const TIME_OPTIONS: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h = 8; h <= 19; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 8 && m === 0) continue; 
    TIME_OPTIONS.push(`(${h}:${pad(m)}〜)`);
    TIME_OPTIONS.push(`(〜${h}:${pad(m)})`);
  }
}

function split(v: string) { return (v || "").split(/[、,\n]+/).map((s: string) => s.trim()).filter(Boolean); }
function join(a: string[]) { return a.filter(Boolean).join("、"); }
function formatDayForDisplay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }
function extractStaffName(fullName: string) { return fullName.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim(); }

function parseAndSortStaff(staffString: string) {
  const list = split(staffString);
  const parsed = list.map(s => {
    const match = s.match(/^(.*?)[\(（](.*?)[\)）]$/);
    return { cleanName: match ? match[1].trim() : s, yomi: match ? match[2].trim() : s };
  });
  parsed.sort((a, b) => a.yomi.localeCompare(b.yomi, 'ja'));
  return Array.from(new Set(parsed.map(p => p.cleanName)));
}

function getMonthlyStaffForSection(sec: string, monthlyAssign: Record<string, string>): string[] {
  let staff: string[] = [];
  if (sec === "治療") staff = [...split(monthlyAssign.治療), ...split(monthlyAssign.治療サブ優先), ...split(monthlyAssign.治療サブ)];
  else if (sec === "RI") staff = [...split(monthlyAssign.RI), ...split(monthlyAssign.RIサブ)];
  else if (monthlyAssign[sec] !== undefined) staff = split(monthlyAssign[sec]);
  return staff.map(extractStaffName);
}

function isMonthlyMainStaff(section: string, name: string, monthlyAssign: Record<string, string>) {
  if (!section) return false;
  return getMonthlyStaffForSection(section, monthlyAssign).includes(name);
}

function getStaffAmount(name: string) {
  if (ROLE_PLACEHOLDERS.includes(extractStaffName(name))) return 0;
  return (name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/)) ? 0.5 : 1;
}

function btnStyle(bg: string, color: string = "#fff"): React.CSSProperties { return { background: bg, color: color, border: "none", borderRadius: "12px", padding: "16px 24px", cursor: "pointer", fontWeight: 800, fontSize: 22, whiteSpace: "nowrap", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 }; }
function panelStyle(): React.CSSProperties { return { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "40px", boxShadow: "0 6px 12px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" }; }
function cellStyle(isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties { 
  let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff");
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff"); 
  return { border: "1px solid #e2e8f0", padding: "24px", background: bg, fontWeight: isHeader ? 800 : 600, textAlign: isHeader ? "center" : "left", fontSize: 24, minWidth: isHeader && !isSticky ? "200px" : "auto", color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, boxShadow: isSticky ? "3px 0 6px -2px rgba(0,0,0,0.05)" : "none", transition: "background-color 0.2s" }; 
}

const RENDER_GROUPS: RenderGroup[] = [
  { title: "休務・夜勤", color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] },
  { title: "モダリティ", color: "#3b82f6", sections: ["CT","MRI","RI","治療"] },
  { title: "一般撮影・透視・その他", color: "#10b981", sections: ["MMG","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","検像","受付","受付ヘルプ","昼当番"] },
  { title: "待機・その他", color: "#f59e0b", sections: ["待機"] } 
];

// ===================== 🌟 UI コンポーネント =====================

const MultiSectionPicker = ({ selected, onChange, options, hasArrows = false }: { selected: string, onChange: (v: string) => void, options: string[], hasArrows?: boolean }) => {
  const current = split(selected);
  const handleAdd = (sec: string) => { if (sec && !current.includes(sec)) onChange(join([...current, sec])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };
  const handleMoveLeft = (idx: number) => { if (idx === 0) return; const next = [...current]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; onChange(join(next)); };
  const handleMoveRight = (idx: number) => { if (idx === current.length - 1) return; const next = [...current]; [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]; onChange(join(next)); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, marginBottom: 12, alignItems: "center" }}>
      {current.map((sec, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 24, padding: hasArrows ? "8px 16px" : "12px 20px", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: hasArrows ? 10 : 12, border: "2px solid #bae6fd", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          {hasArrows && (i > 0 ? <button onClick={() => handleMoveLeft(i)} style={{ background: "#7dd3fc", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18, fontWeight: "bold" }}>◀</button> : <span style={{ width: 32 }}></span>)}
          <span style={{ userSelect: "none", padding: hasArrows ? "0 4px" : "0" }}>{sec}</span>
          {hasArrows && (i < current.length - 1 ? <button onClick={() => handleMoveRight(i)} style={{ background: "#7dd3fc", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18, fontWeight: "bold" }}>▶</button> : <span style={{ width: 32 }}></span>)}
          <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, marginLeft: hasArrows ? 8 : 4, fontSize: 24 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" style={{ padding: "12px 44px 12px 16px", fontSize: 22, minWidth: 200, maxWidth: "100%", height: 52, textOverflow: "ellipsis" }} onChange={(e) => { handleAdd(e.target.value); e.target.value = ""; }} value="">
        <option value="">＋追加</option>
        {options.filter((s: string) => !current.includes(s)).map((s: string) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

const MultiStaffPicker = ({ selected, onChange, options, placeholder = "＋追加", hasArrows = false }: { selected: string, onChange: (v: string) => void, options: string[], placeholder?: string, hasArrows?: boolean }) => {
  const current = split(selected);
  const handleAdd = (name: string) => { if (name && !current.includes(name)) onChange(join([...current, name])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };
  const handleMoveLeft = (idx: number) => { if (idx === 0) return; const next = [...current]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; onChange(join(next)); };
  const handleMoveRight = (idx: number) => { if (idx === current.length - 1) return; const next = [...current]; [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]; onChange(join(next)); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, marginBottom: 12, alignItems: "center" }}>
      {current.map((name, i) => (
        <div key={i} style={{ background: "#f1f5f9", color: "#334155", borderRadius: 24, padding: hasArrows ? "8px 16px" : "12px 20px", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: hasArrows ? 10 : 12, border: "2px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          {hasArrows && (i > 0 ? <button onClick={() => handleMoveLeft(i)} style={{ background: "#94a3b8", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18, fontWeight: "bold" }}>◀</button> : <span style={{ width: 32 }}></span>)}
          <span style={{ userSelect: "none", padding: hasArrows ? "0 4px" : "0" }}>{name}</span>
          {hasArrows && (i < current.length - 1 ? <button onClick={() => handleMoveRight(i)} style={{ background: "#94a3b8", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18, fontWeight: "bold" }}>▶</button> : <span style={{ width: 32 }}></span>)}
          <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, marginLeft: hasArrows ? 8 : 4, fontSize: 24 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" style={{ padding: "12px 44px 12px 16px", fontSize: 22, minWidth: 260, maxWidth: "100%", height: 52, textOverflow: "ellipsis" }} onChange={(e) => { handleAdd(e.target.value); e.target.value = ""; }} value="">
        <option value="">{placeholder}</option>
        {options.filter((s: string) => !current.includes(s)).map((s: string) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

const WeekCalendarPicker = ({ targetMonday, onChange, nationalHolidays, customHolidays }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(targetMonday));
  useEffect(() => { setViewDate(new Date(targetMonday)); }, [targetMonday]);
  const year = viewDate.getFullYear(); const month = viewDate.getMonth() + 1;
  const handlePrev = () => setViewDate(new Date(year, month - 2, 1));
  const handleNext = () => setViewDate(new Date(year, month, 1));
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = new Array(7).fill(null);
  for (let i = 0; i < firstDay; i++) currentWeek[i] = null;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = (firstDay + d - 1) % 7;
    currentWeek[dayOfWeek] = d;
    if (dayOfWeek === 6 || d === daysInMonth) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); }
  }
  const handleWeekClick = (weekObj: (number|null)[]) => {
    let validDay = null;
    for (let i = 1; i < 7; i++) {
      if (weekObj[i] !== null) { validDay = weekObj[i]; break; }
    }
    if (validDay === null && weekObj[0] !== null) validDay = weekObj[0]; 
    if (!validDay) return;

    const dObj = new Date(year, month - 1, validDay, 12, 0, 0); 
    const day = dObj.getDay();
    const diff = dObj.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(dObj.getTime());
    mon.setDate(diff);
    onChange(`${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`);
    setIsOpen(false);
  };
  return (
    <div style={{ position: "relative" }}>
      <button className="btn-hover" onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff", "#2563eb"), border: "2px solid #bfdbfe", padding: "14px 20px", fontSize: 22 }}>
        📅 {targetMonday} 週 ▼
      </button>
      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)}></div>
          <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "2px solid #cbd5e1", borderRadius: 20, padding: 32, zIndex: 50, boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.15)", minWidth: 460 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={handlePrev} style={{ border: "none", background: "#f1f5f9", borderRadius: 10, padding: "14px 24px", cursor: "pointer", color: "#475569", fontWeight: "bold", fontSize: 24 }}>◀</button>
              <div style={{ fontWeight: 800, fontSize: 28, color: "#1e293b", letterSpacing: "0.05em" }}>{year}年 {month}月</div>
              <button onClick={handleNext} style={{ border: "none", background: "#f1f5f9", borderRadius: 10, padding: "14px 24px", cursor: "pointer", color: "#475569", fontWeight: "bold", fontSize: 24 }}>▶</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: 24 }}>
              <thead><tr><th style={{ color: "#ef4444", padding: 16 }}>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th style={{ color: "#3b82f6", padding: 16 }}>土</th></tr></thead>
              <tbody>
                {weeks.map((w, wIdx) => {
                  const isSelectedWeek = w.some(d => {
                    if(!d) return false;
                    const dObj = new Date(year, month - 1, d, 12, 0, 0); 
                    const day = dObj.getDay();
                    const diff = dObj.getDate() - day + (day === 0 ? -6 : 1);
                    const checkMon = new Date(dObj.getTime()); checkMon.setDate(diff);
                    return `${checkMon.getFullYear()}-${pad(checkMon.getMonth()+1)}-${pad(checkMon.getDate())}` === targetMonday;
                  });
                  return (
                    <tr key={wIdx} onClick={() => handleWeekClick(w)} className="calendar-row" style={{ background: isSelectedWeek ? "#eff6ff" : "transparent" }}>
                      {w.map((d, dIdx) => {
                        if (!d) return <td key={dIdx} style={{ padding: 20 }}></td>;
                        const dateStr = `${year}-${pad(month)}-${pad(d)}`;
                        const holidayName = nationalHolidays[dateStr] || (customHolidays.includes(dateStr) ? "休診日" : null);
                        const isHoliday = !!holidayName;
                        let color = "#334155"; if (dIdx === 0 || isHoliday) color = "#ef4444"; else if (dIdx === 6) color = "#3b82f6";
                        return (
                          <td key={dIdx} style={{ padding: 20, color, fontWeight: isHoliday ? 800 : 600, position: "relative" }} title={holidayName || ""}>
                            {d}
                            {isHoliday && <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, background: "#ef4444", borderRadius: "50%" }}></div>}
                          </td>
                        );
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

const SectionEditor = ({ section, value, activeStaff, onChange, noTime = false, customOptions = [] }: { section: string, value: string, activeStaff: string[], onChange: (v: string) => void, noTime?: boolean, customOptions?: string[] }) => {
  const members = split(value);
  const isTaiki = section === "待機";
  const handleAdd = (name: string) => { if (name) { const newName = isTaiki ? `${name}(17:00〜19:00)` : name; onChange(join([...members, newName])); } };
  const handleRemove = (idx: number) => { const next = [...members]; next.splice(idx, 1); onChange(join(next)); };
  const handleTimeChange = (idx: number, newTime: string) => { if (noTime) return; const next = [...members]; next[idx] = extractStaffName(next[idx]) + newTime; onChange(join(next)); };

  return (
    <div className="card-hover" style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
      <label style={{ fontSize: 26, fontWeight: 800, color: "#475569", marginBottom: 16, letterSpacing: "0.02em" }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {members.map((m, i) => {
          const coreName = extractStaffName(m);
          const currentMod = m.substring(coreName.length);
          const isPlaceholder = ROLE_PLACEHOLDERS.includes(coreName) || (customOptions.includes(coreName) && !activeStaff.includes(coreName));
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime ? "#334155" : "#0369a1"), borderRadius: 20, padding: "14px 20px 14px 22px", fontSize: 22, display: "flex", alignItems: "center", gap: 10, border: `2px solid ${isPlaceholder ? "#fde047" : (noTime ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 800 }}>
              <span style={{ userSelect: "none" }}>{coreName}</span>
              {!noTime && (
                <select value={currentMod} onChange={(e) => handleTimeChange(i, e.target.value)} style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 22, fontWeight: 800, color: "inherit", cursor: "pointer", padding: "0 28px 0 8px" }}>
                  <option value="">終日</option>{!isTaiki && <option value="(AM)">AM</option>}{!isTaiki && <option value="(PM)">PM</option>}
                  {isTaiki ? (<><option value="(17:00〜19:00)">17:00〜19:00</option><option value="(17:00〜22:00)">17:00〜22:00</option><option value="(17:00〜)">17:00〜</option></>) : (<>{currentMod && !["", "(AM)", "(PM)"].includes(currentMod) && !TIME_OPTIONS.includes(currentMod) && (<option value={currentMod}>{currentMod.replace(/[()]/g, '')}</option>)}{TIME_OPTIONS.filter(t => t !== "(AM)" && t !== "(PM)").map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</>)}
                </select>
              )}
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 10, fontSize: 24 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e) => handleAdd(e.target.value)} value="" style={{ border: "2px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 22, color: "#64748b", flex: 1, minWidth: 160, cursor: "pointer", fontWeight: 700, borderRadius: 12, padding: "14px 36px 14px 20px" }}>
          <option value="">＋追加</option>
          <optgroup label="スタッフ">{activeStaff.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>
          {customOptions.length > 0 && <optgroup label="部屋連動（兼務）">{customOptions.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>}
          <optgroup label="担当枠（未定）">{ROLE_PLACEHOLDERS.filter((s: string) => s.startsWith(section) && !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>
        </select>
      </div>
    </div>
  );
};

// ===================== 🌟 ロジック =====================

class AutoAssigner {
  day: DayData; prevDay: DayData | null; pastDays: DayData[]; ctx: AutoAssignContext;
  dayCells: Record<string, string>; blockMap: Map<string, string> = new Map();
  skipSections: string[] = []; clearSections: string[] = []; roleAssignments: Record<string, any> = {}; currentKenmu: any[] = [];
  dynamicCapacity: Record<string, number> = {}; assignCounts: Record<string, number> = {}; maxAssigns: Record<string, number> = {}; counts: Record<string, number> = {}; roomCounts: Record<string, Record<string, number>> = {};
  initialAvailAll: string[] = []; initialAvailGeneral: string[] = []; initialAvailSupport: string[] = []; initialAvailReception: string[] = [];
  logInfo: string[] = [];
  
  private log(msg: string) { this.logInfo.push(`・${msg}`); }

  getTodayRoomCount(staff: string) {
    let count = 0;
    Object.keys(this.dayCells).forEach(sec => {
      if (REST_SECTIONS.includes(sec) || ["待機", "昼当番", "受付", "受付ヘルプ"].includes(sec)) return;
      if (split(this.dayCells[sec]).map(extractStaffName).includes(staff)) count++;
    });
    return count;
  }

  constructor(day: DayData, prevDay: DayData | null, pastDays: DayData[], ctx: AutoAssignContext) {
    this.day = { ...day }; this.prevDay = prevDay; this.pastDays = pastDays; this.ctx = ctx; this.dayCells = { ...day.cells }; this.dynamicCapacity = { ...(ctx.customRules.capacity || {}) };
  }

  execute(): DayData {
    if (this.prevDay && this.prevDay.cells["入り"]) {
      const iriMembers = split(this.prevDay.cells["入り"]).map(extractStaffName);
      const currentAke = split(this.dayCells["明け"]);
      this.dayCells["明け"] = join(Array.from(new Set([...currentAke, ...iriMembers])));
      if (iriMembers.length > 0) this.log(`[前日処理] 昨日の「入り」メンバー（${iriMembers.join('、')}）を「明け」に配置しました`);
    }
    if (this.day.isPublicHoliday) {
      this.log(`🎌 祝日（休診日）のため、全ての配置をスキップしました`);
      return { ...this.day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])), logInfo: this.logInfo };
    }

    this.buildBlockMap(); this.applyDailyAdditions(); this.evaluateEmergencies(); this.initCounts(); this.cleanUpDayCells();
    this.prepareAvailability(); this.assignRooms(); this.processPostTasks();
    return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
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
        const timeTag = rule.time === "全日" || !rule.time ? "" : rule.time;
        const placeholderName = rule.section + "枠" + timeTag;
        let current = split(this.dayCells[rule.section]);
        for (let i = 0; i < rule.count; i++) current.push(placeholderName);
        this.dayCells[rule.section] = join(current);
        this.log(`📈 [増枠] 特別ルールにより、${rule.section} に ${rule.count}枠 追加しました`);
      }
    });
  }

  evaluateEmergencies() {
    const tempAvailCount = this.ctx.activeGeneralStaff.filter((s: string) => this.blockMap.get(s) !== 'ALL').length;
    (this.ctx.customRules.emergencies || []).forEach((em: any) => {
      if (tempAvailCount <= Number(em.threshold)) {
        if (em.type === "role_assign" && em.role) { if (!this.roleAssignments[em.role] || em.threshold < this.roleAssignments[em.role].threshold) this.roleAssignments[em.role] = em; }
        if (em.type === "clear" && em.section) { this.skipSections.push(em.section); this.clearSections.push(em.section); this.log(`🚨 [緊急] 出勤${tempAvailCount}人: ${em.section} を空室に設定しました`); }
        if (em.type === "change_capacity" && em.section) { if (!(this.ctx.customRules.dailyAdditions || []).some((r: any) => r.date === this.day.id && r.section === em.section)) { this.dynamicCapacity[em.section] = Number(em.newCapacity ?? 3); this.log(`🚨 [緊急] 出勤${tempAvailCount}人: ${em.section} の定員を ${em.newCapacity}人に変更しました`); } }
      }
    });
  }

  initCounts() {
    this.ctx.allStaff.forEach((s: string) => { this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.counts[s] = 0; this.roomCounts[s] = {}; SECTIONS.forEach((sec: string) => this.roomCounts[s][sec] = 0); });
    this.pastDays.forEach(pd => { 
      Object.entries(pd.cells).forEach(([sec, val]) => { 
        if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return; 
        split(val as string).forEach((m: string) => { const c = extractStaffName(m); if (this.counts[c] !== undefined) { this.counts[c]++; this.roomCounts[c][sec] = (this.roomCounts[c][sec] || 0) + 1; } }); 
      }); 
    });
  }

  cleanUpDayCells() {
    Object.keys(this.dayCells).forEach(sec => {
      if (["明け","入り","不在","土日休日代休"].includes(sec)) return;
      if (this.skipSections.includes(sec)) { this.dayCells[sec] = ""; return; }
      let members = split(this.dayCells[sec]).map(m => {
        const core = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(core)) return m;
        const block = this.blockMap.get(core);
        if (block === 'ALL') return null; if (block === 'AM' && m.includes('(AM)')) return null; if (block === 'PM' && m.includes('(PM)')) return null; 
        if (block === 'AM' && !m.includes('(PM)') && !m.match(/\(.*\)/)) return `${core}(PM)`; if (block === 'PM' && !m.includes('(AM)') && !m.match(/\(.*\)/)) return `${core}(AM)`;
        return m;
      }).filter(Boolean) as string[];
      this.dayCells[sec] = join(members);
      if (!REST_SECTIONS.includes(sec) && sec !== "昼当番") { split(this.dayCells[sec]).forEach((name: string) => { const c = extractStaffName(name); if (ROLE_PLACEHOLDERS.includes(c)) return; this.addU(c, getStaffAmount(name)); }); }
    });
  }

  getForbiddenCount(staffName: string): number {
    const rules = this.ctx.customRules.forbidden || [];
    const rule = rules.find((r: any) => r.staff === staffName);
    return rule ? split(rule.sections).length : 0;
  }

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
         const b = this.blockMap.get(name);
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

      const logCandidateInfo = (name: string) => {
         const b = this.blockMap.get(name);
         const isPref = preferredList.includes(name);
         const typeStr = isPref ? "月間担当" : "一般候補";
         const monthCnt = this.roomCounts[name]?.[section] || 0;
         const todayCnt = this.getTodayRoomCount(name);
         return `[${typeStr}] 今月${monthCnt}回 / 本日${todayCnt}枠 / 空き:${b === 'NONE' ? '終日' : b === 'AM' ? 'PM' : b === 'PM' ? 'AM' : 'なし'}`;
      };

      const candidatesWithReason = availList.map(name => ({ name, reason: getFilterReason(name) }));
      let validNames = candidatesWithReason.filter(c => !c.reason).map(c => c.name);
      
      const rejectedPref = candidatesWithReason.filter(c => c.reason && preferredList.includes(c.name) && c.reason.msg !== "同室に配置済");
      if (rejectedPref.length > 0) {
          this.log(`🚫 [除外] 本来の月間担当者が外れた理由: ${rejectedPref.map(c => `${c.name}(${c.reason?.msg})`).join(", ")}`);
      }

      let fallbackMsg = "";
      if (validNames.length === 0) {
          const softCandidates = candidatesWithReason.filter(c => c.reason && !c.reason.hard);
          if (softCandidates.length > 0) {
              validNames = softCandidates.map(c => c.name);
              fallbackMsg = `（🚨空室回避のため [${softCandidates[0].reason?.msg}] を特例で無視して選出）`;
          } else {
              const rejectedGen = candidatesWithReason.filter(c => c.reason && c.reason.hard && !preferredList.includes(c.name));
              this.log(`⛔ [配置不可] 配置可能な候補者がいません。一般候補の除外理由例: ${rejectedGen.map(c => `${c.name}(${c.reason?.msg})`).slice(0, 5).join(", ")}...`);
              break;
          }
      }

      const validPreferred = validNames.filter(n => preferredList.includes(n));
      const validAvail = validNames.filter(n => !preferredList.includes(n));

      const sortCandidates = (candidates: string[]) => {
         let mainStaff: string[] = []; let subPrioStaff: string[] = []; let subStaff: string[] = [];
         if (section === "治療") {
             mainStaff = split(this.ctx.monthlyAssign.治療 || "").map(extractStaffName);
             subPrioStaff = split(this.ctx.monthlyAssign.治療サブ優先 || "").map(extractStaffName);
             subStaff = split(this.ctx.monthlyAssign.治療サブ || "").map(extractStaffName);
         } else if (section === "RI") {
             mainStaff = split(this.ctx.monthlyAssign.RI || "").map(extractStaffName);
             subStaff = split(this.ctx.monthlyAssign.RIサブ || "").map(extractStaffName);
         } else {
             mainStaff = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName);
         }

         const hasAmFree = validNames.some(s => this.blockMap.get(s) === 'PM');
         const hasPmFree = validNames.some(s => this.blockMap.get(s) === 'AM');

         return [...candidates].sort((a, b) => {
             const bA = this.blockMap.get(a); const bB = this.blockMap.get(b);
             let scoreA = 0; let scoreB = 0;
             if (mainStaff.includes(a)) scoreA += 10000; else if (subPrioStaff.includes(a)) scoreA += 5000; else if (subStaff.includes(a)) scoreA += 2000;
             if (mainStaff.includes(b)) scoreB += 10000; else if (subPrioStaff.includes(b)) scoreB += 5000; else if (subStaff.includes(b)) scoreB += 2000;
             
             scoreA -= (this.roomCounts[a]?.[section] || 0) * 100; scoreB -= (this.roomCounts[b]?.[section] || 0) * 100;
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
      
      const sortedPreferred = sortCandidates(validPreferred); 
      const sortedAvail = sortCandidates(validAvail);
      
      const allSorted = [...sortedPreferred, ...sortedAvail];
      this.log(`💡 [上位候補] ${allSorted.slice(0, 3).map(name => `${name}(${logCandidateInfo(name)})`).join(" ＞ ")}`);
      
      const pickedCoreList = this.pick(validNames, allSorted, 1, section, current.map(extractStaffName));
      if (pickedCoreList.length === 0) {
         this.log(`⛔ [配置不可] 候補者はいましたが、最終的な調整（NGペア等）で全員除外されました。`);
         break;
      }
      
      const core = pickedCoreList[0]; const block = this.blockMap.get(core); let tag = ""; let f = 1;
      if (block === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } else if (block === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } else { if (needTag) { tag = needTag; f = 0.5; this.blockMap.set(core, needTag === "(AM)" ? 'AM' : 'PM'); } else { tag = ""; f = 1; this.blockMap.set(core, 'ALL'); } }
      current.push(`${core}${tag}`); this.addU(core, f);
      
      const isPref = preferredList.includes(core);
      this.log(`✅ [配置決定] ${section} に ${core}${tag} を配置しました。（選出理由: ${isPref ? '月間担当' : '一般候補'}から最上位, 今月 ${(this.roomCounts[core]?.[section] || 0) + 1} 回目）${fallbackMsg}`);
    }
    this.dayCells[section] = join(current);
  }

  assignRooms() {
    const availAll = this.initialAvailAll; const availGeneral = this.initialAvailGeneral; const availReception = this.initialAvailReception; const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "");
    
    (this.ctx.customRules.fixed || []).forEach((rule: any) => { 
      if (!rule.staff || !rule.section) return; 
      Object.keys(this.dayCells).forEach(sec => { 
        if (sec === rule.section) return; 
        if (REST_SECTIONS.includes(sec)) return; 
        const before = split(this.dayCells[sec]); 
        const after = before.filter(m => extractStaffName(m) !== rule.staff); 
        if (before.length !== after.length) { 
          this.dayCells[sec] = join(after); 
        } 
      }); 
    });

    (this.ctx.customRules.fixed || []).forEach((rule: any) => { 
      if (!rule.staff || !rule.section || !availAll.includes(rule.staff) || this.isForbidden(rule.staff, rule.section)) return; 
      if (this.skipSections.includes(rule.section)) return; 
      
      const current = split(this.dayCells[rule.section]); 
      const isAlreadyIn = current.map(extractStaffName).includes(rule.staff); 
      
      this.blockMap.set(rule.staff, 'ALL'); 
      this.assignCounts[rule.staff] = 1; 

      if (!isAlreadyIn) { 
        this.dayCells[rule.section] = join([...current, rule.staff]); 
        this.log(`🔒 [専従] ${rule.staff} を ${rule.section} に固定配置しました`); 
      } 
    });

    Object.values(this.roleAssignments).forEach((ra: any) => { if (this.skipSections.includes(ra.section)) return; const candidates = split(this.ctx.monthlyAssign[ra.role] || ""); const targetAvail = ["受付"].includes(ra.role) ? availReception : availGeneral; const staff = candidates.find(s => targetAvail.includes(s) && !this.isUsed(s) && !this.isForbidden(s, ra.section)); if (staff && !split(this.dayCells[ra.section]).map(extractStaffName).includes(staff)) { const b = this.blockMap.get(staff); let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else { this.blockMap.set(staff, 'ALL'); } this.dayCells[ra.section] = join([...split(this.dayCells[ra.section]), `${staff}${tag}`]); this.addU(staff, f); this.log(`📌 [緊急役割] ${staff} を ${ra.section} に配置しました`); } });

    (this.ctx.customRules.substitutes || []).forEach((sub: any) => { const targets = split(sub.target); if (targets.length === 0 || this.skipSections.includes(sub.section)) return; const trigger = targets.every(t => !availAll.includes(t) || this.isUsed(t)); if (trigger) { const fallbackStaff = split(sub.subs).filter(s => availGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, sub.section)); if (fallbackStaff.length > 0) { const currentSec = split(this.dayCells[sub.section]); for (const f of fallbackStaff) { if (fullDayOnlyList.includes(sub.section) && this.blockMap.get(f) !== 'NONE') continue; if (!this.hasNGPair(f, currentSec.map(extractStaffName), false) && currentSec.length < 6) { const b = this.blockMap.get(f); let tag = ""; let fr = 1; if (b === 'AM') { tag = "(PM)"; fr = 0.5; this.blockMap.set(f, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; fr = 0.5; this.blockMap.set(f, 'ALL'); } else { this.blockMap.set(f, 'ALL'); } this.dayCells[sub.section] = join([...currentSec, `${f}${tag}`]); this.addU(f, fr); this.log(`🔄 [代打] ${sub.target} が不在のため、${f} を ${sub.section} に配置しました`); break; } } } } });

    (this.ctx.customRules.pushOuts || []).forEach((po: any) => { const s1 = po.s1 || po.triggerStaff; const s2 = po.s2 || po.targetStaff; const tSec = po.triggerSection; if (!s1 || !s2 || !tSec || !po.targetSections) return; if (availGeneral.includes(s1) && availGeneral.includes(s2) && !this.isUsed(s2)) { const s1In = split(this.dayCells[tSec]).map(extractStaffName).includes(s1) || isMonthlyMainStaff(tSec, s1, this.ctx.monthlyAssign); const s2In = split(this.dayCells[tSec]).map(extractStaffName).includes(s2) || isMonthlyMainStaff(tSec, s2, this.ctx.monthlyAssign); if (s1In && s2In) { const allowedRooms = split(po.targetSections).filter(s => !this.skipSections.includes(s)); for (const room of allowedRooms) { if (this.isForbidden(s2, room)) continue; if (fullDayOnlyList.includes(room) && this.blockMap.get(s2) !== 'NONE') continue; const current = split(this.dayCells[room]); if (this.hasNGPair(s2, current.map(extractStaffName), false)) continue; const actualCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1); if (current.length < actualCap) { const b = this.blockMap.get(s2); let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(s2, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(s2, 'ALL'); } else { this.blockMap.set(s2, 'ALL'); } this.dayCells[room] = join([...current, `${s2}${tag}`]); this.addU(s2, f); this.dayCells[tSec] = join(split(this.dayCells[tSec]).filter(m => extractStaffName(m) !== s2)); this.log(`🎱 [玉突き] ${s1} と被ったため、${s2} を ${room} に移動しました`); break; } } } } });

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
          if (availAll.includes(name) && !this.isUsed(name) && !currentUketsuke.map(extractStaffName).includes(name)) { 
            const b = this.blockMap.get(name); if (b === 'ALL') continue;
            let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else { this.blockMap.set(name, 'ALL'); }
            currentUketsuke.push(`${name}${tag}`); this.addU(name, f); 
            this.log(`🎯 [月間担当] 受付 に ${name}${tag} を配置しました`);
          }
        }
        const currentUketsukeAmount = currentUketsuke.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
        let neededUketsuke = targetCount - currentUketsukeAmount;
        if (neededUketsuke > 0 && !linkedTargetRooms.includes(room)) { 
          const pickedUketsuke = this.pick(availReception, availReception, Math.ceil(neededUketsuke), "受付", currentUketsuke);
          pickedUketsuke.forEach((name: string) => {
            const b = this.blockMap.get(name); let tag = ""; let f = 1;
            if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else { this.blockMap.set(name, 'ALL'); }
            currentUketsuke.push(`${name}${tag}`); this.addU(name, f);
            this.log(`🎯 [不足補充] 受付 に ${name}${tag} を追加配置しました`);
          });
        }
        this.dayCells["受付"] = join(currentUketsuke);
      } else {
        let preferredList: string[] = [];
        if (["治療", "RI", "CT", "MRI", "MMG"].includes(room)) { preferredList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign).filter((s: string) => availGeneral.includes(s)); } else if (this.ctx.monthlyAssign[room]) { preferredList = split(this.ctx.monthlyAssign[room]).filter((s: string) => availGeneral.includes(s)); }
        let candidates = availGeneral;
        const strictRooms = ["治療", "RI", "MMG"];
        if (strictRooms.includes(room)) { candidates = preferredList.length > 0 ? preferredList : availGeneral; }
        
        if (!linkedTargetRooms.includes(room)) {
           this.fill(candidates, room, preferredList, targetCount);
        } else {
           this.log(`⏭️ [専任スキップ] ${room} は基本兼務ルール（セット配置）の対象のため、専任スタッフの自動割当をスキップしました`);
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
          const isFixedToSource = (this.ctx.customRules.fixed || []).some((r:any) => r.staff === core);
          if (isFixedToSource) {
              this.log(`🔒 [兼務ブロック] ${core} さんは専従のため、${targetRoom} への兼務は行いません`);
              continue;
          }
          if (targetCores.includes(core)) continue; if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) continue; if (this.isForbidden(core, targetRoom)) continue;
          
          let pushStr = m;
          let curAm = 0; let curPm = 0;
          targetMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
          if (curAm < targetCap && curPm >= targetCap) { if (m.includes("(PM)")) continue; pushStr = `${core}(AM)`; } 
          else if (curAm >= targetCap && curPm < targetCap) { if (m.includes("(AM)")) continue; pushStr = `${core}(PM)`; }

          targetMems.push(pushStr); targetCores.push(core);
          const amount = getStaffAmount(pushStr); currentAmount += amount; this.addU(core, amount);
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
  }

  processPostTasks() {
    const availSupport = this.initialAvailSupport; const availGeneral = this.initialAvailGeneral; const supportTargetRooms = split(this.ctx.customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT");
    const noLateShiftStaffList = split(this.ctx.customRules.noLateShiftStaff || "");

    const absentAll = [...split(this.dayCells["明け"]), ...split(this.dayCells["入り"]), ...split(this.dayCells["土日休日代休"])].map(extractStaffName);
    const absentPM = split(this.dayCells["不在"]).filter(m => !m.includes("(AM)")).map(extractStaffName);
    const cannotLateShift = [...absentAll, ...absentPM, ...noLateShiftStaffList];

    const isFixedToAny = (staffName: string) => (this.ctx.customRules.fixed || []).some((r:any) => r.staff === staffName);

    (this.ctx.customRules.linkedRooms || []).forEach((rule: any) => {
      const targetRoom = rule.target;
      if (!targetRoom || this.clearSections.includes(targetRoom) || this.skipSections.includes(targetRoom)) return;
      
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      let currentMems = split(this.dayCells[targetRoom]);
      
      let curAm = 0; let curPm = 0;
      currentMems.forEach(x => {
         if (x.includes("(AM)")) curAm += 1;
         else if (x.includes("(PM)")) curPm += 1;
         else { curAm += 1; curPm += 1; }
      });
      
      const sourceRooms = split(rule.sources);
      
      for (const srcRoom of sourceRooms) {
        if (curAm >= targetCap && curPm >= targetCap) break; 

        split(this.dayCells[srcRoom]).forEach(m => {
          if (curAm >= targetCap && curPm >= targetCap) return;
          
          const core = extractStaffName(m);
          if (isFixedToAny(core)) return;

          if (!ROLE_PLACEHOLDERS.includes(core) && !currentMems.map(extractStaffName).includes(core) && !this.isForbidden(core, targetRoom)) {
            if (!m.includes("17:00") && !m.includes("19:00") && !m.includes("22:00")) {
               
               let pushStr = m;
               if (curAm < targetCap && curPm >= targetCap) {
                  if (m.includes("(PM)")) return; 
                  pushStr = `${core}(AM)`;
               } else if (curAm >= targetCap && curPm < targetCap) {
                  if (m.includes("(AM)")) return; 
                  pushStr = `${core}(PM)`;
               }
               
               currentMems.push(pushStr);
               if (pushStr.includes("(AM)")) curAm += 1;
               else if (pushStr.includes("(PM)")) curPm += 1;
               else { curAm += 1; curPm += 1; }
               
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
      currentMems.forEach(x => {
         if (x.includes("(AM)")) curAm += 1;
         else if (x.includes("(PM)")) curPm += 1;
         else { curAm += 1; curPm += 1; }
      });
      
      if (curAm >= targetCap && curPm >= targetCap) return; 
      
      const rescueRule = (this.ctx.customRules.rescueRules || []).find((r: any) => r.targetRoom === targetRoom);
      if (rescueRule && rescueRule.sourceRooms) {
         const sourceRooms = split(rescueRule.sourceRooms);
         let candidates: { core: string, fullStr: string, srcIdx: number }[] = [];
         
         sourceRooms.forEach((srcRoom, idx) => {
            if (srcRoom === targetRoom) return;
            split(this.dayCells[srcRoom]).forEach(m => {
               const core = extractStaffName(m);
               if (isFixedToAny(core)) return;

               if (!ROLE_PLACEHOLDERS.includes(core) && !candidates.some(c => c.core === core) && !this.isForbidden(core, targetRoom)) {
                  if (!m.includes("17:00") && !m.includes("19:00") && !m.includes("22:00")) {
                      candidates.push({ core, fullStr: m, srcIdx: idx });
                  }
               }
            });
         });

         const currentCores = currentMems.map(extractStaffName); 
         candidates = candidates.filter(c => !currentCores.includes(c.core));
         
         candidates.sort((a, b) => { 
             const aRooms = this.getTodayRoomCount(a.core);
             const bRooms = this.getTodayRoomCount(b.core);
             if (aRooms !== bRooms) return aRooms - bRooms;
             if (a.srcIdx !== b.srcIdx) return a.srcIdx - b.srcIdx;
             if ((this.assignCounts[a.core] || 0) !== (this.assignCounts[b.core] || 0)) return (this.assignCounts[a.core] || 0) - (this.assignCounts[b.core] || 0); 
             return (this.counts[a.core] || 0) - (this.counts[b.core] || 0); 
         });
         
         for (const cand of candidates) {
            if (curAm >= targetCap && curPm >= targetCap) break;
            
            let pushStr = cand.fullStr;
            if (curAm < targetCap && curPm >= targetCap) {
               if (cand.fullStr.includes("(PM)")) continue; 
               pushStr = `${cand.core}(AM)`;
            } else if (curAm >= targetCap && curPm < targetCap) {
               if (cand.fullStr.includes("(AM)")) continue; 
               pushStr = `${cand.core}(PM)`;
            }
            
            currentMems.push(pushStr); 
            if (pushStr.includes("(AM)")) curAm += 1;
            else if (pushStr.includes("(PM)")) curPm += 1;
            else { curAm += 1; curPm += 1; }
            
            this.addU(cand.core, getStaffAmount(pushStr));
            this.log(`🆘 [バックアップ発動] 定員割れの ${targetRoom} に、${pushStr} を兼務で追加しました（本日${this.getTodayRoomCount(cand.core)}部屋目）`);
         }
         this.dayCells[targetRoom] = join(currentMems);
      }
    });

    let helpMembers: string[] = [];
    const tempAvailCountForHelp = this.ctx.activeGeneralStaff.filter((s: string) => this.blockMap.get(s) !== 'ALL').length;
    if (tempAvailCountForHelp <= (this.ctx.customRules.helpThreshold ?? 17)) {
      helpMembers = [...split(this.dayCells["RI"]).map(extractStaffName)];
      if (split(this.dayCells["CT"]).length >= 4) { helpMembers.push(extractStaffName(split(this.dayCells["CT"])[split(this.dayCells["CT"]).length - 1])); }
    }

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
            if (cannotLateShift.includes(name)) return false;
            if (currentCore.includes(name)) return false;
            const b = this.blockMap.get(name); if (b === 'PM') return false; 
            if (this.isForbidden(name, rule.section)) return false;
            if (!allowConsecutive && prevLateStaff.includes(name)) return false; 
            if (checkIsUsed && this.isUsed(name)) return false;
            return true;
          });
          if (cand.length > 0) { cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); return cand[0]; }
          return null;
        };

        let picked = getCandidate(availGeneral, false, true); 
        if (!picked) picked = getCandidate(availGeneral, false, false); 
        if (!picked) picked = getCandidate(availGeneral, true, true); 
        if (!picked) picked = getCandidate(availGeneral, true, false);

        if (picked) {
          current.push(`${picked}${rule.lateTime}`); this.addU(picked, 0.5); this.blockMap.set(picked, this.blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); 
          this.log(`🌆 [遅番] ${rule.section} の遅番に ${picked} をアサインしました`);
        }
      }
      this.dayCells[rule.section] = join(current);
    });

    if (!this.skipSections.includes("昼当番")) {
      let currentLunch = split(this.dayCells["昼当番"]);
      let baseLunchTarget = this.ctx.customRules.lunchBaseCount ?? 3;
      const dayChar = this.day.label.match(/\((.*?)\)/)?.[1];
      if (dayChar) { const specialDay = (this.ctx.customRules.lunchSpecialDays || []).find((sd:any) => sd.day === dayChar); if (specialDay) baseLunchTarget = Number(specialDay.count); }
      const lunchTarget = baseLunchTarget;

      const riMembers = split(this.dayCells["RI"]).map(extractStaffName);
      riMembers.forEach(name => { if (!currentLunch.includes(name) && currentLunch.length < lunchTarget && !this.isForbidden(name, "昼当番")) currentLunch.push(name); });

      const prioritySecs = split(this.ctx.customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT");
      for (const sec of prioritySecs) {
        if (currentLunch.length >= lunchTarget) break;
        split(this.dayCells[sec]).forEach(name => { const core = extractStaffName(name); if (!currentLunch.includes(core) && currentLunch.length < lunchTarget && !this.isForbidden(core, "昼当番")) currentLunch.push(core); });
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
              if (!currentLunch.includes(core) && !this.isForbidden(core, "昼当番")) { currentLunch.push(core); picked++; }
            }
          }
        });
      }
      
      if (currentLunch.length < lunchTarget) {
        const lastResortSecs = split(this.ctx.customRules.lunchLastResortSections ?? "治療");
        const lastResortMembers: string[] = [];
        lastResortSecs.forEach(sec => { split(this.dayCells[sec]).forEach(name => lastResortMembers.push(extractStaffName(name))); });

        const fallbackCandidates = availGeneral.filter(name => !lastResortMembers.includes(name) && !currentLunch.includes(name) && !this.isForbidden(name, "昼当番"));
        for (const name of fallbackCandidates) { if (currentLunch.length < lunchTarget) currentLunch.push(name); }
        
        if (currentLunch.length < lunchTarget) {
           const finalFallback = availGeneral.filter(name => lastResortMembers.includes(name) && !currentLunch.includes(name) && !this.isForbidden(name, "昼当番"));
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
          let cand = availGeneral.filter(n => {
            if (exclude.includes(n)) return false; if (helpMems.map(extractStaffName).includes(n)) return false; if (this.isForbidden(n, "受付ヘルプ")) return false; if (cannotLateShift.includes(n)) return false; 
            if (isFixedToAny(n)) return false; 
            return true;
          });
          if (cand.length > 0) { cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); return cand[0]; }
          return null; 
        };

        const lunchHelpCandidate = getHelp(lunchCores);
        if (lunchHelpCandidate) { helpMems.push(`${lunchHelpCandidate}(12:15〜13:00)`); this.log(`🛎️ [受付ヘルプ] 昼枠(12:15〜)に ${lunchHelpCandidate} をアサインしました`); }

        const kenzoCores = split(this.dayCells["検像"]).map(extractStaffName);
        const validKenzo = kenzoCores.filter((n: string) => this.blockMap.get(n) !== 'AM' && !helpMems.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ") && !cannotLateShift.includes(n) && !isFixedToAny(n));
        let picked16 = validKenzo.length > 0 ? validKenzo[0] : null;

        if (!picked16) {
          const excl = lunchHelpCandidate ? [lunchHelpCandidate] : [];
          let cand = availGeneral.filter(n => this.blockMap.get(n) !== 'AM' && !helpMems.map(extractStaffName).includes(n) && !excl.includes(n) && !this.isForbidden(n, "受付ヘルプ") && !cannotLateShift.includes(n) && !isFixedToAny(n));
          if (cand.length > 0) { cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); picked16 = cand[0]; }
        }
        if (picked16) { helpMems.push(`${picked16}(16:00〜)`); this.log(`🛎️ [受付ヘルプ] 夕枠(16:00〜)に ${picked16} をアサインしました`); }
      }
      this.dayCells["受付ヘルプ"] = join(helpMems);
    }
    
    const assignSupportStaff = () => {
      const unassignedSupport = availSupport.filter(s => !this.isUsed(s));
      unassignedSupport.forEach(staff => {
        const b = this.blockMap.get(staff); if (b === 'ALL') return;
        let assigned = false;
        
        for (const room of supportTargetRooms) {
          if (this.skipSections.includes(room) || this.isForbidden(staff, room)) continue;
          let current = split(this.dayCells[room]); 
          const currentCores = current.map(extractStaffName);
          const currentAmount = current.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
          
          if (currentAmount > 0 && !currentCores.includes(staff) && !this.hasNGPair(staff, currentCores, false)) {
            let tag = ""; let f = 1;
            if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else { this.blockMap.set(staff, 'ALL'); }
            this.dayCells[room] = join([...current, `${staff}${tag}`]); this.addU(staff, f); assigned = true; 
            this.log(`🤝 [サポート] 全ての配置完了後、${staff} を ${room} に追加しました`); break; 
          }
        }
        
        if (!assigned && !this.skipSections.includes("待機") && !this.isForbidden(staff, "待機")) {
           let current = split(this.dayCells["待機"]); let tag = ""; let f = 1;
           if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else { this.blockMap.set(staff, 'ALL'); }
           this.dayCells["待機"] = join([...current, `${staff}${tag}`]); this.addU(staff, f);
           this.log(`🤝 [サポート] 入れる部屋がなかったため、${staff} を 待機 に配置しました`);
        }
      });
    };
    assignSupportStaff();
  }
}

// ===================== 🌟 メインコンポーネント =====================
export default function App() {
  const [allDays, setAllDays] = useState<Record<string, Record<string, string>>>(() => { try { const saved = localStorage.getItem(KEY_ALL_DAYS); if (saved) return JSON.parse(saved); } catch {} return {}; });
  const [assignLogs, setAssignLogs] = useState<Record<string, string[]>>({});
  const [selectedLogDay, setSelectedLogDay] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, Record<string, string>>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [selectedStaffForStats, setSelectedStaffForStats] = useState<string | null>(null);

  const [targetMonday, setTargetMonday] = useState(() => {
    const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff));
    return `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`;
  });

  const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string>>(() => { try { const saved = localStorage.getItem(KEY_MONTHLY); if (saved) return { ...DEFAULT_MONTHLY_ASSIGN, ...JSON.parse(saved) }; } catch (e) { console.error(e); } return DEFAULT_MONTHLY_ASSIGN; });
  const [customRules, setCustomRules] = useState<CustomRules>(() => { try { const saved = localStorage.getItem(KEY_RULES); if (saved) return { ...DEFAULT_RULES, ...JSON.parse(saved) }; } catch (e) { console.error(e); } return DEFAULT_RULES; });
  const [sel, setSel] = useState("");
  const [nationalHolidays, setNationalHolidays] = useState<Record<string, string>>(FALLBACK_HOLIDAYS);

  useEffect(() => { fetch("https://holidays-jp.github.io/api/v1/date.json").then(res => res.json()).then(data => setNationalHolidays(prev => ({ ...prev, ...data }))).catch(e => console.error(e)); }, []);
  useEffect(() => { localStorage.setItem(KEY_ALL_DAYS, JSON.stringify(allDays)); }, [allDays]);
  useEffect(() => { localStorage.setItem(KEY_MONTHLY, JSON.stringify(monthlyAssign)); }, [monthlyAssign]);
  useEffect(() => { localStorage.setItem(KEY_RULES, JSON.stringify(customRules)); }, [customRules]);

  const activeGeneralStaff = useMemo(() => parseAndSortStaff(customRules.staffList || DEFAULT_STAFF), [customRules.staffList]);
  const activeReceptionStaff = useMemo(() => parseAndSortStaff(customRules.receptionStaffList || ""), [customRules.receptionStaffList]);
  const allStaff = useMemo(() => Array.from(new Set([...activeGeneralStaff, ...activeReceptionStaff])), [activeGeneralStaff, activeReceptionStaff]);

  const customHolidays = split(customRules.customHolidays || "");
  const days = useMemo(() => {
    const [y, m, d] = targetMonday.split('-').map(Number); const mon = new Date(y, m - 1, d);
    return [0, 1, 2, 3, 4].map(i => {
      const curr = new Date(mon); curr.setDate(curr.getDate() + i);
      const id = `${curr.getFullYear()}-${pad(curr.getMonth()+1)}-${pad(curr.getDate())}`;
      let holidayName = nationalHolidays[id] || ""; if (!holidayName && customHolidays.includes(id)) holidayName = "休診日";
      return { id, label: formatDayForDisplay(curr), isPublicHoliday: !!holidayName, holidayName, cells: allDays[id] || Object.fromEntries(SECTIONS.map(s => [s, ""])) };
    });
  }, [targetMonday, allDays, customHolidays, nationalHolidays]);

  useEffect(() => { if (!sel || !days.find(d => d.id === sel)) setSel(days[0].id); }, [days, sel]);

  const cur = days.find(d => d.id === sel) || days[0];

  const getDayWarnings = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (!day || day.isPublicHoliday) return [];
    const w: {type: 'error'|'alert'|'info', msg: string}[] = [];
    const cells = day.cells;
    
    const staffRoomMap: Record<string, string[]> = {};
    ROOM_SECTIONS.forEach(room => {
      split(cells[room]).forEach(m => {
        const core = extractStaffName(m);
        if (!staffRoomMap[core]) staffRoomMap[core] = [];
        if (!staffRoomMap[core].includes(room)) staffRoomMap[core].push(room);
      });
    });
    
    Object.entries(staffRoomMap).forEach(([staff, rooms]) => {
      if (rooms.length >= (customRules.alertMaxKenmu || 3)) w.push({ type: 'error', msg: `⚠️【兼務過多】${staff}さんが ${rooms.length}部屋（${rooms.join('、')}）を兼務！` });
    });

    const targetEmptyRooms = split(customRules.alertEmptyRooms || "");
    ROOM_SECTIONS.forEach(room => {
      if (split(cells[room]).length === 0 && targetEmptyRooms.includes(room)) w.push({type: 'alert', msg: `💡 空室: ${room}`});
    });

    const curIdx = days.findIndex(d => d.id === dayId);
    if (curIdx > 0) {
      const prevDay = days[curIdx - 1];
      if (!prevDay.isPublicHoliday) {
        const noConsecutiveRooms = split(customRules.noConsecutiveRooms || "");
        noConsecutiveRooms.forEach(room => {
          const prevMembers = split(prevDay.cells[room]).map(extractStaffName);
          const curMembers = split(cells[room]).map(extractStaffName);
          curMembers.filter(n => prevMembers.includes(n)).forEach(n => w.push({ type: 'error', msg: `🚨【連日禁止】${n}さんが連続で ${room} に入っています！` }));
        });
      }
    }
    return w;
  };

  const warnings = useMemo(() => getDayWarnings(sel), [sel, days, customRules, activeGeneralStaff, allDays]);
const priorityRoomsList = useMemo(() => {
  const base = customRules.priorityRooms && customRules.priorityRooms.length > 0
    ? customRules.priorityRooms
    : DEFAULT_PRIORITY_ROOMS;
  const list = [...base];
  ROOM_SECTIONS.forEach(r => { if (!list.includes(r)) list.push(r); });
  return list;
}, [customRules.priorityRooms]);

const monthlyMatrixStats = useMemo(() => {
  const monthlyMatrixStats = useMemo(() => {
    const targetMonth = targetMonday.substring(0, 7);
    const stats: Record<string, Record<string, { total: number, late: number }>> = {};
    activeGeneralStaff.forEach(s => { 
      stats[s] = {}; 
      ROOM_SECTIONS.forEach(r => stats[s][r] = { total: 0, late: 0 }); 
    });
    
    Object.entries(allDays).forEach(([dateStr, cells]) => {
      if (dateStr.startsWith(targetMonth)) {
        ROOM_SECTIONS.forEach(room => {
          const membersInRoom = split(cells[room] || "");
          membersInRoom.forEach(m => {
            const core = extractStaffName(m);
            if (stats[core] !== undefined && stats[core][room] !== undefined) {
              stats[core][room].total += 1;
              if (m.includes("17:00") || m.includes("18:00") || m.includes("19:00") || m.includes("22:00")) {
                stats[core][room].late += 1;
              }
            }
          });
        });
      }
    });
    return stats;
  }, [targetMonday, allDays, activeGeneralStaff]);

  const getAvailableStaffForDay = (section: string, currentDayCells: any) => {
    const baseStaff = section === "受付" ? (activeReceptionStaff.length > 0 ? activeReceptionStaff : activeGeneralStaff) : (REST_SECTIONS.includes(section) || ["待機", "昼当番", "受付ヘルプ"].includes(section) ? allStaff : activeGeneralStaff);
    if (REST_SECTIONS.includes(section)) return baseStaff;
    const absentStaff = [ ...split(currentDayCells["明け"]).map(extractStaffName), ...split(currentDayCells["入り"]).map(extractStaffName), ...split(currentDayCells["土日休日代休"]).map(extractStaffName), ...split(currentDayCells["不在"]).map(extractStaffName) ];
    return baseStaff.filter(s => !absentStaff.includes(s));
  };

  const setAllDaysWithHistory = (updater: any) => {
    setAllDays(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) { setHistory(h => [...h, prev].slice(-20)); } return next;
    });
  };

  const handleAutoOne = () => {
    if(!cur || cur.isPublicHoliday) return;
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev };
      const idx = days.findIndex(d => d.id === cur.id);
      const baseDay = { ...days[idx], cells: nextAll[days[idx].id] || days[idx].cells };
      const prevDayObj = idx > 0 ? { ...days[idx-1], cells: nextAll[days[idx-1].id] || days[idx-1].cells } : null;
      const ctx: AutoAssignContext = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules };
      const worker: AutoAssigner = new AutoAssigner(baseDay, prevDayObj, days.slice(0, idx).map(d => ({...d, cells: nextAll[d.id] || d.cells})), ctx);
      const res: DayData = worker.execute();
      nextAll[res.id] = res.cells;
      setAssignLogs(logState => ({...logState, [res.id]: res.logInfo || []}));
      return nextAll;
    });
  };

  const handleAutoAll = () => {
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev };
      let prevDayObj: DayData | null = null;
      const tempDays: DayData[] = [];
      const newLogs = { ...assignLogs };
      const ctx: AutoAssignContext = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules };
      for (let i = 0; i < 5; i++) {
        const baseDay = { ...days[i], cells: nextAll[days[i].id] || days[i].cells };
        const worker: AutoAssigner = new AutoAssigner(baseDay, prevDayObj, tempDays, ctx);
        const res: DayData = worker.execute();
        nextAll[res.id] = res.cells;
        newLogs[res.id] = res.logInfo || [];
        prevDayObj = res;
        tempDays.push(res);
      }
      setAssignLogs(newLogs);
      return nextAll;
    });
  };

  const handleUndo = () => { if (history.length > 0) { const last = history[history.length - 1]; setAllDays(last); setHistory(h => h.slice(0, -1)); } };
  const updateDay = (k: string, v: string) => { setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...(prev[cur.id] || cur.cells), [k]: v } })); };
  const updateMonthly = (k: string, v: string) => { setMonthlyAssign(prev => ({ ...prev, [k]: v })); };
  const updateRule = (type: keyof CustomRules, idx: number, key: string, val: any) => { setCustomRules(r => { const arr = [...(r[type] as any[])]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: keyof CustomRules, idx: number) => { setCustomRules(r => { const arr = [...(r[type] as any[])]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };
  const addRule = (type: keyof CustomRules, def: any) => { setCustomRules(r => ({ ...r, [type]: [...(r[type] as any[]), def] })); };
  
  const handleCopyYesterday = () => {
    const idx = days.findIndex(d => d.id === cur.id);
    if (idx <= 0) { alert("月曜日には前日のデータがありません。"); return; }
    const prevDay = days[idx - 1];
    setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...prevDay.cells } }));
  };

  const handleClearGroupDay = (title: string, sections: string[]) => {
    if (window.confirm(`${cur.label} の「${title}」をクリアしますか？`)) {
      setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; sections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; });
    }
  };

  const handleClearGroupWeek = (title: string, sections: string[]) => {
    if (window.confirm(`表示中の「${title}」を1週間分すべてクリアしますか？`)) {
      setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; sections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; });
    }
  };

  const handleClearWorkDay = () => {
    if (window.confirm(`${cur.label} の「モダリティ」と「一般撮影・透視・その他」をクリアしますか？`)) {
      const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections];
      setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; });
    }
  };

  const handleClearWorkWeek = () => {
    if (window.confirm(`表示中の「モダリティ」と「一般撮影・透視・その他」を1週間分すべてクリアしますか？`)) {
      const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections];
      setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; });
    }
  };

  const handleResetAll = () => {
    if (window.confirm("本当にすべてのデータを初期状態にリセットしますか？\n※これまで入力したシフト、特殊ルール、月間設定がすべて消去されます。")) {
      setAllDaysWithHistory({}); setMonthlyAssign(DEFAULT_MONTHLY_ASSIGN); setCustomRules(DEFAULT_RULES);
      localStorage.removeItem(KEY_ALL_DAYS); localStorage.removeItem(KEY_MONTHLY); localStorage.removeItem(KEY_RULES);
      alert("すべてのデータをリセットしました。");
    }
  };

  const handleExport = () => {
    const dataObj = { allDays, monthlyAssign, customRules };
    const blob = new Blob([JSON.stringify(dataObj)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `shifto_backup_${targetMonday}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      try {
        const dataObj = JSON.parse(event.target.result);
        if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("データを復元しました！"); } else { alert("正しいデータ形式ではありません。"); }
      } catch (err) { alert("読み込みに失敗しました。"); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const handleCopyToClipboard = () => {
    const dataObj = { allDays, monthlyAssign, customRules };
    navigator.clipboard.writeText(JSON.stringify(dataObj)).then(() => { alert("データをコピーしました！LINEのKeepメモなどに貼り付けてスマホに送ってください。"); }).catch(() => { alert("コピーに失敗しました。お使いのブラウザでは許可されていません。"); });
  };

  const handleTextImport = () => {
    if(!importText) return;
    try {
      const dataObj = JSON.parse(importText);
      if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("テキストからデータを復元しました！"); setImportText(""); } else { alert("正しいデータ形式ではありません。"); }
    } catch (err) { alert("テキストの読み込みに失敗しました。コピー漏れがないか確認してください。"); }
  };

  return (
    <div style={{ maxWidth: "96%", margin: "0 auto", padding: "32px", width: "100%", boxSizing: "border-box" }}>
      <style>{globalStyle}</style>
      
      {/* ヘッダー */}
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, gap: 20, flexWrap: "wrap", padding: "32px 40px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 40, fontWeight: 800 }}>勤務割付システム</h2>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button className="btn-hover" onClick={handleExport} style={btnStyle("#6366f1")}>💾 保存</button>
          <button className="btn-hover" onClick={() => fileInputRef.current?.click()} style={btnStyle("#8b5cf6")}>📂 読込</button>
          <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleImport} />
          <button className="btn-hover" onClick={() => window.print()} style={btnStyle("#475569")}>🖨️ 印刷</button>
          <button className="btn-hover" onClick={handleResetAll} style={btnStyle("#ef4444")}>🗑️ リセット</button>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32, padding: "28px 40px" }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#be185d", fontSize: 26, display: "flex", alignItems: "center", gap: 12 }}>
            📱 スマホ連携（テキストコピー）
          </summary>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <button className="btn-hover" onClick={handleCopyToClipboard} style={{ ...btnStyle("#db2777"), flex: 1, justifyContent: "center" }}>📋 コピー</button>
            <input type="text" value={importText} onChange={e => setImportText(e.target.value)} placeholder="貼り付けて復元" style={{ flex: 2, padding: "20px 24px", fontSize: 24, borderRadius: 12, border: "2px solid #f9a8d4" }} />
            <button className="btn-hover" onClick={handleTextImport} style={{ ...btnStyle("#be185d"), flex: 1, justifyContent: "center" }}>✨ 復元</button>
          </div>
        </details>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#0f766e", fontSize: 28, display: "flex", alignItems: "center", gap: 12 }}>
            ⚙️ スタッフ名簿・特殊ルール
          </summary>
          <div style={{ marginTop: 24, display: "grid", gap: 32, paddingTop: 32, borderTop: "2px dashed #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 32 }}>
              <div><label style={{fontWeight:800, color:"#475569", marginBottom:12, display:"block"}}>一般スタッフ</label><textarea value={customRules.staffList} onChange={e=>setCustomRules({...customRules, staffList:e.target.value})} placeholder="例: 山田(やまだ), 佐藤(さとう)" style={{width:"100%", padding:20, border:"2px solid #cbd5e1", borderRadius:12, fontSize:24, minHeight:140}}/></div>
              <div><label style={{fontWeight:800, color:"#475569", marginBottom:12, display:"block"}}>受付スタッフ</label><textarea value={customRules.receptionStaffList} onChange={e=>setCustomRules({...customRules, receptionStaffList:e.target.value})} placeholder="例: 伊藤(いとう), 鈴木(すずき)" style={{width:"100%", padding:20, border:"2px solid #cbd5e1", borderRadius:12, fontSize:24, minHeight:140}}/></div>
              <div><label style={{fontWeight:800, color:"#475569", marginBottom:12, display:"block"}}>追加の休診日</label><textarea value={customRules.customHolidays} onChange={e=>setCustomRules({...customRules, customHolidays:e.target.value})} placeholder="例: 2026-12-29" style={{width:"100%", padding:20, border:"2px solid #cbd5e1", borderRadius:12, fontSize:24, minHeight:140}}/></div>
            </div>

            <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, border: "2px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 16px 0", fontSize: 28, fontWeight: 800 }}>👥 絶対優先の定員設定</h4>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: "16px 24px", borderRadius: 10, border: "2px solid #cbd5e1" }}>
                    <span style={{ fontWeight: 800, fontSize: 24 }}>{room}:</span>
                    <input type="number" value={count as number} onChange={e => setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: Number(e.target.value)}})} style={{ width: 72, border: "none", fontSize: 28, textAlign: "center", fontWeight: 800 }} />
                    <span style={{fontSize: 22}}>人</span>
                    <span onClick={() => { const n={...customRules.capacity}; delete n[room]; setCustomRules({...customRules, capacity:n}); }} style={{ cursor: "pointer", color: "#ef4444", marginLeft: 8, fontSize: 28 }}>✖</span>
                  </div>
                ))}
                <select onChange={e => { if(e.target.value) setCustomRules({...customRules, capacity: {...customRules.capacity, [e.target.value]: 1}}); e.target.value=""; }} className="rule-sel" style={{flex:"none", width:200}}><option value="">＋部屋追加</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select>
              </div>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: "2px dashed #cbd5e1" }}>
                  <h5 style={{ margin: "0 0 16px 0", color: "#0ea5e9", fontSize: 24, fontWeight: 800 }}>📅 特定の日だけ枠を追加する（増枠）</h5>
                  {(customRules.dailyAdditions || []).map((rule: any, idx: number) => (
                    <div key={idx} className="rule-row" style={{ background: "#fff", padding: "16px 24px", border: "2px solid #bae6fd", borderRadius: 12 }}>
                      <input type="date" value={rule.date} onChange={e => updateRule("dailyAdditions", idx, "date", e.target.value)} className="rule-sel" style={{ flex: "0 0 240px", padding: "14px 16px", borderColor: "#7dd3fc" }} />
                      <span className="rule-label" style={{ color: "#0369a1" }}>の</span>
                      <select value={rule.section} onChange={e => updateRule("dailyAdditions", idx, "section", e.target.value)} className="rule-sel" style={{ borderColor: "#7dd3fc" }}><option value="">部屋を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{ color: "#0369a1" }}>に</span>
                      <select value={rule.time || "全日"} onChange={e => updateRule("dailyAdditions", idx, "time", e.target.value)} className="rule-sel" style={{ borderColor: "#7dd3fc", flex: "0 0 140px" }}><option value="全日">全日</option><option value="(AM)">AM</option><option value="(PM)">PM</option></select>
                      <input type="number" min="1" value={rule.count} onChange={e => updateRule("dailyAdditions", idx, "count", Number(e.target.value))} className="rule-num" style={{ borderColor: "#7dd3fc" }} />
                      <span className="rule-label" style={{ color: "#0369a1" }}>人追加する</span>
                      <button onClick={() => removeRule("dailyAdditions", idx)} className="rule-del">✖</button>
                    </div>
                  ))}
                  <button className="rule-add" style={{ color: "#0ea5e9", borderColor: "#7dd3fc" }} onClick={() => addRule("dailyAdditions", { date: targetMonday, section: "CT", time: "全日", count: 1 })}>＋ 特定日の増枠を追加</button>
                </div>
            </div>

            <div style={{ background: "#fffbeb", padding: 32, borderRadius: 16, border: "2px solid #fde68a" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#b45309", fontSize: 28, fontWeight: 800 }}>👑 部屋の割り当て優先順位</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {priorityRoomsList.map((room: string, idx: number, arr: string[]) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "12px 16px", borderRadius: 10, border: "2px solid #fcd34d" }}>
                    <div style={{ display: "flex", alignItems: "center" }}><span style={{ fontSize: 20, fontWeight: 800, color: "#92400e", marginRight: 12 }}>{idx + 1}.</span><span style={{ fontSize: 24, fontWeight: 700, color: "#b45309" }}>{room}</span></div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "4px 8px" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "4px 8px" }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, border: "2px solid #cbd5e1" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#334155", fontSize: 28, fontWeight: 800 }}>🕒 終日専任・連日禁止</h4>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 360 }}>
                  <label style={{ fontSize: 22, fontWeight: 700, color: "#475569", display: "block", marginBottom: 12 }}>【終日専任】半休・AM/PM不可の部屋</label>
                  <MultiSectionPicker selected={customRules.fullDayOnlyRooms ?? ""} onChange={v => setCustomRules({...customRules, fullDayOnlyRooms: v})} options={ROOM_SECTIONS} hasArrows={false} />
                </div>
                <div style={{ flex: 1, minWidth: 360 }}>
                  <label style={{ fontSize: 22, fontWeight: 700, color: "#475569", display: "block", marginBottom: 12 }}>【連日禁止】2日連続で担当させない部屋</label>
                  <MultiSectionPicker selected={customRules.noConsecutiveRooms ?? ""} onChange={v => setCustomRules({...customRules, noConsecutiveRooms: v})} options={ROOM_SECTIONS} hasArrows={false} />
                </div>
              </div>
            </div>

            <div style={{ background: "#ecfdf5", padding: 32, borderRadius: 16, border: "2px solid #a7f3d0" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#065f46", fontSize: 26, fontWeight: 800 }}>🔗 兼務・セット配置ルール</h4>
              
              <h5 style={{ fontSize: 24, color: "#047857", marginTop: 24, marginBottom: 12 }}>■ 常時兼務ペア</h5>
              {(customRules.kenmuPairs || []).map((rule: any, idx: number) => (
                <div key={idx} className="rule-row" style={{ background: "#fff", padding: "18px 24px", border: "2px solid #a7f3d0", borderRadius: 12 }}>
                  <select value={rule.s1} onChange={e => updateRule("kenmuPairs", idx, "s1", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7" }}><option value="">部屋を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <span className="rule-label" style={{ color: "#065f46" }}>←→</span>
                  <select value={rule.s2} onChange={e => updateRule("kenmuPairs", idx, "s2", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7" }}><option value="">部屋を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <button onClick={() => removeRule("kenmuPairs", idx)} className="rule-del">✖</button>
                </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("kenmuPairs", { s1: "", s2: "" })}>＋ ペアを追加</button>

              <h5 style={{ fontSize: 24, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 基本兼務（セット配置）</h5>
              {(customRules.linkedRooms || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "2px solid #a7f3d0", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 22, fontWeight: 700, color: "#065f46" }}>[</span>
                        <select value={rule.target} onChange={e => updateRule("linkedRooms", idx, "target", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7", minWidth: 200, padding: "10px 40px 10px 12px" }}>
                          <option value="">兼務専用にする部屋</option>
                          {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize: 22, fontWeight: 700, color: "#065f46" }}>] には専任を置かず、[</span>
                      </div>
                      <div style={{ marginLeft: 24, marginTop: 8, marginBottom: 8 }}>
                        <MultiSectionPicker selected={rule.sources} onChange={v => updateRule("linkedRooms", idx, "sources", v)} options={ROOM_SECTIONS} hasArrows={true} />
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 700, color: "#065f46" }}>] の担当者をセットで配置する</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#d1fae5", borderRadius: 8, padding: "8px 16px", fontSize: 20, color: "#065f46" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#d1fae5", borderRadius: 8, padding: "8px 16px", fontSize: 20, color: "#065f46" }}>▼</button>
                      <button onClick={() => removeRule("linkedRooms", idx)} className="rule-del" style={{ marginTop: 4 }}>✖</button>
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("linkedRooms", { target: "", sources: "" })}>＋ セット配置ルールを追加</button>

              <h5 style={{ fontSize: 24, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 🆘 空室（人数不足）救済ルール</h5>
              {(customRules.rescueRules || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "2px solid #fde047", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 22, fontWeight: 700, color: "#854d0e" }}>もし</span>
                        <select value={rule.targetRoom} onChange={e => updateRule("rescueRules", idx, "targetRoom", e.target.value)} className="rule-sel" style={{ borderColor: "#fef08a", minWidth: 200, padding: "10px 40px 10px 12px" }}>
                          <option value="">（空室の部屋）</option>
                          {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize: 22, fontWeight: 700, color: "#854d0e" }}>が不足なら ➔ 以下の部屋から兼務を探す</span>
                      </div>
                      <div style={{ marginLeft: 24, marginTop: 8 }}>
                        <MultiSectionPicker selected={rule.sourceRooms} onChange={v => updateRule("rescueRules", idx, "sourceRooms", v)} options={ROOM_SECTIONS} hasArrows={true} />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef08a", borderRadius: 8, padding: "8px 16px", fontSize: 20, color: "#a16207" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef08a", borderRadius: 8, padding: "8px 16px", fontSize: 20, color: "#a16207" }}>▼</button>
                      <button onClick={() => removeRule("rescueRules", idx)} className="rule-del" style={{ marginTop: 4 }}>✖</button>
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#854d0e", borderColor: "#fde047" }} onClick={() => addRule("rescueRules", { targetRoom: "", sourceRooms: "" })}>＋ 救済ルールを追加</button>
            </div>

            <div style={{ background: "#fff1f2", padding: 32, borderRadius: 16, border: "2px solid #fecaca" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#be185d", fontSize: 28, fontWeight: 800 }}>⚠️ アラート設定</h4>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 320, background: "#fff", padding: 24, borderRadius: 12, border: "2px solid #fca5a5" }}>
                  <label style={{ display: "block", marginBottom: 12, fontWeight: 700, color: "#9f1239" }}>兼務の上限</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input type="number" min="2" max="10" value={customRules.alertMaxKenmu ?? 3} onChange={e => setCustomRules({...customRules, alertMaxKenmu: Number(e.target.value)})} style={{ width: 80, padding: "12px", borderRadius: 8, border: "2px solid #fca5a5", textAlign: "center", fontWeight: 800, color: "#be185d", fontSize: 24 }} />
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#9f1239" }}>部屋以上 兼務でエラー</span>
                  </div>
                </div>
                <div style={{ flex: 2, minWidth: 400, background: "#fff", padding: 24, borderRadius: 12, border: "2px solid #fca5a5" }}>
                  <label style={{ display: "block", marginBottom: 12, fontWeight: 700, color: "#9f1239" }}>空室警告を出す部屋</label>
                  <MultiSectionPicker selected={customRules.alertEmptyRooms ?? ROOM_SECTIONS.join(',')} onChange={v => setCustomRules({...customRules, alertEmptyRooms: v})} options={ROOM_SECTIONS} hasArrows={false} />
                </div>
              </div>
            </div>

            <div style={{ background: "#f0fdf4", padding: 32, borderRadius: 16, border: "2px solid #bbf7d0" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#15803d", fontSize: 28, fontWeight: 800 }}>🤝 サポート専任（2人目要員）ルール</h4>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "320px" }}>
                    <label style={{ fontSize: 22, fontWeight: 700, color: "#166534", display: "block", marginBottom: 12 }}>対象スタッフ名（複数可）</label>
                    <div style={{ background: "#fff", padding: "14px", borderRadius: 12, border: "2px solid #86efac", minHeight: "56px", display: "flex", alignItems: "center" }}>
                      <MultiStaffPicker selected={customRules.supportStaffList || ""} onChange={v => setCustomRules({...customRules, supportStaffList: v})} options={allStaff} placeholder="＋スタッフを選択" hasArrows={false} />
                    </div>
                  </div>
                  <div style={{ flex: 2, minWidth: "400px" }}>
                    <label style={{ fontSize: 22, fontWeight: 700, color: "#166534", display: "block", marginBottom: 12 }}>優先する対象部屋</label>
                    <MultiSectionPicker selected={customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT"} onChange={v => setCustomRules({...customRules, supportTargetRooms: v})} options={ROOM_SECTIONS} hasArrows={false} />
                  </div>
              </div>
            </div>

            <div style={{ background: "#eef2ff", padding: 32, borderRadius: 16, border: "2px solid #c7d2fe" }}>
              <h4 style={{ margin: "0 0 20px 0", color: "#4338ca", fontSize: 28, fontWeight: 800 }}>🍱 昼当番ルール</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, background: "#fff", padding: "18px 32px", borderRadius: 12, border: "2px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span>
                  <input type="number" min="0" value={customRules.lunchBaseCount ?? 3} onChange={e => setCustomRules({...customRules, lunchBaseCount: Number(e.target.value)})} style={{ width: 80, padding: "14px", borderRadius: 8, border: "2px solid #a5b4fc", textAlign: "center", fontWeight: 800, color: "#4f46e5", fontSize: 24 }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                  <div style={{ flex: 1, minWidth: "400px", background: "#fff", padding: 28, borderRadius: 12, border: "2px solid #e0e7ff" }}>
                    <h5 style={{ margin: "0 0 18px 0", fontSize: 24, color: "#4f46e5", fontWeight: 800 }}>📅 曜日で人数を変える</h5>
                    {(customRules.lunchSpecialDays || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.day} onChange={e => updateRule("lunchSpecialDays", idx, "day", e.target.value)} className="rule-sel">{["月","火","水","木","金","土","日"].map(d => <option key={d} value={d}>{d}曜</option>)}</select>
                        <span className="rule-label">は</span>
                        <input type="number" value={rule.count} onChange={e => updateRule("lunchSpecialDays", idx, "count", Number(e.target.value))} className="rule-num" />
                        <button onClick={() => removeRule("lunchSpecialDays", idx)} className="rule-del">✖</button>
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchSpecialDays", { day: "火", count: 4 })}>＋ 曜日ルールを追加</button>
                  </div>
                  <div style={{ flex: 1, minWidth: "400px", background: "#fff", padding: 28, borderRadius: 12, border: "2px solid #e0e7ff" }}>
                    <h5 style={{ margin: "0 0 18px 0", fontSize: 24, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h5>
                    {(customRules.lunchConditional || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.section} onChange={e => updateRule("lunchConditional", idx, "section", e.target.value)} className="rule-sel"><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <input type="number" value={rule.min} onChange={e => updateRule("lunchConditional", idx, "min", Number(e.target.value))} className="rule-num" />
                        <span className="rule-label">人以上➔</span>
                        <input type="number" value={rule.out} onChange={e => updateRule("lunchConditional", idx, "out", Number(e.target.value))} className="rule-num" />
                        <button onClick={() => removeRule("lunchConditional", idx)} className="rule-del">✖</button>
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchConditional", { section: "CT", min: 4, out: 1 })}>＋ 条件ルールを追加</button>
                  </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 24 }}>
                  <div style={{ flex: 1, background: "#fff", padding: 28, borderRadius: 12, border: "2px solid #e0e7ff", minWidth: "400px" }}>
                    <h5 style={{ margin: "0 0 14px 0", fontSize: 24, color: "#4f46e5", fontWeight: 800 }}>🎯 優先的に選出する部屋</h5>
                    <MultiSectionPicker selected={customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT"} onChange={v => setCustomRules({...customRules, lunchPrioritySections: v})} options={ROOM_SECTIONS} hasArrows={false} />
                  </div>
                  <div style={{ flex: 1, background: "#fff", padding: 28, borderRadius: 12, border: "2px solid #e0e7ff", minWidth: "400px" }}>
                    <h5 style={{ margin: "0 0 14px 0", fontSize: 24, color: "#4f46e5", fontWeight: 800 }}>⚠️ 緊急時のみ選出する部屋（なるべく除外）</h5>
                    <MultiSectionPicker selected={customRules.lunchLastResortSections ?? "治療"} onChange={v => setCustomRules({...customRules, lunchLastResortSections: v})} options={ROOM_SECTIONS} hasArrows={false} />
                  </div>
              </div>
            </div>

            <div style={{ background: "#f5f3ff", padding: 32, borderRadius: 16, border: "2px solid #ddd6fe" }}>
              <h4 style={{ margin: "0 0 20px 0", color: "#6d28d9", fontSize: 28, fontWeight: 800 }}>🌆 遅番ルール</h4>
              {(customRules.lateShifts || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"18px 24px", border:"2px solid #ddd6fe", borderRadius:12}}>
                    <select value={rule.section} onChange={e => updateRule("lateShifts", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "180px", flex: "1 1 auto"}}><option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>に</span>
                    <select value={rule.lateTime} onChange={e => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "220px", flex: "1 1 auto"}}><option value="">遅番の時間</option>{TIME_OPTIONS.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>の担当を追加する（日勤は</span>
                    <select value={rule.dayEndTime} onChange={e => updateRule("lateShifts", idx, "dayEndTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "220px", flex: "1 1 auto"}}><option value="">終了時間</option>{TIME_OPTIONS.filter(t => t.includes("(〜")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>とする）</span>
                    <button onClick={() => removeRule("lateShifts", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルールを追加</button>
            </div>

            <div style={{ background: "#e0f2fe", padding: 32, borderRadius: 16, border: "2px solid #bae6fd" }}>
              <h4 style={{ margin: "0 0 20px 0", color: "#0369a1", fontSize: 28, fontWeight: 800 }}>🎱 玉突きルール</h4>
              {(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 28, borderBottom: "2px solid #bae6fd", paddingBottom: 28 }}>
                    <div className="rule-row">
                      <select value={rule.s1 || rule.triggerStaff} onChange={e => updateRule("pushOuts", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>と</span>
                      <select value={rule.s2 || rule.targetStaff} onChange={e => updateRule("pushOuts", idx, "s2", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>が同じ</span>
                      <select value={rule.triggerSection} onChange={e => updateRule("pushOuts", idx, "triggerSection", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>になる時➔ 後者を</span>
                      <button onClick={() => removeRule("pushOuts", idx)} className="rule-del">✖</button>
                    </div>
                    <div className="rule-row">
                      <MultiSectionPicker selected={rule.targetSections} onChange={v => updateRule("pushOuts", idx, "targetSections", v)} options={ROOM_SECTIONS} hasArrows={true} />
                      <span className="rule-label" style={{color:"#0284c7"}}>に移動</span>
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#0369a1", borderColor:"#7dd3fc"}} onClick={() => addRule("pushOuts", { s1: "", s2: "", triggerSection: "", targetSections: "" })}>＋ 玉突きルールを追加</button>
            </div>

            <div style={{ background: "#fff7ed", padding: 32, borderRadius: 16, border: "2px solid #fed7aa" }}>
              <h4 style={{ margin: "0 0 20px 0", color: "#c2410c", fontSize: 28, fontWeight: 800 }}>🔄 代打ルール</h4>
              {(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: 18, marginBottom: 20, alignItems: "center", background: "#fff", padding: "24px", borderRadius: 12, border: "2px solid #fdba74", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ flex: 1, minWidth: "240px" }}><MultiStaffPicker selected={rule.target} onChange={v => updateRule("substitutes", idx, "target", v)} options={activeGeneralStaff} placeholder="対象スタッフ(休)" hasArrows={false} /></div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#c2410c" }}>が全員休みの時➔</span>
                    <div style={{ flex: 1, minWidth: "280px" }}><MultiStaffPicker selected={rule.subs} onChange={v => updateRule("substitutes", idx, "subs", v)} options={activeGeneralStaff} placeholder="代打スタッフを追加" hasArrows={true} /></div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#c2410c" }}>を</span>
                    <select value={rule.section} onChange={e => updateRule("substitutes", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fed7aa", color: "#c2410c", flex: "0 0 180px"}}><option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#c2410c" }}>に優先</span>
                    <button onClick={() => removeRule("substitutes", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#c2410c", borderColor:"#fdba74"}} onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打ルールを追加</button>
            </div>

            <div style={{ background: "#fdf4ff", padding: 32, borderRadius: 16, border: "2px solid #f5d0fe" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#86198f", fontSize: 28, fontWeight: 800 }}>🏠 遅番不可スタッフ</h4>
              <div style={{ background: "#fff", padding: "14px", borderRadius: 12, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center" }}>
                <MultiStaffPicker selected={customRules.noLateShiftStaff || ""} onChange={v => setCustomRules({...customRules, noLateShiftStaff: v})} options={allStaff} placeholder="＋スタッフを選択" hasArrows={false} />
              </div>
            </div>

            <div style={{ background: "#fef2f2", padding: 32, borderRadius: 16, border: "2px solid #fecaca" }}>
              <h4 style={{ margin: "0 0 20px 0", color: "#b91c1c", fontSize: 28, fontWeight: 800 }}>🚫 NGペア</h4>
              {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.s1} onChange={e => updateRule("ngPairs", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span className="rule-label">と</span>
                    <select value={rule.s2} onChange={e => updateRule("ngPairs", idx, "s2", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.level || "hard"} onChange={e => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"180px"}}><option value="hard">絶対NG</option><option value="soft">なるべくNG</option></select>
                    <button onClick={() => removeRule("ngPairs", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ NGペアを追加</button>
            </div>

            <div style={{ background: "#f0fdf4", padding: 32, borderRadius: 16, border: "2px solid #bbf7d0" }}>
              <h4 style={{ margin: "0 0 20px 0", color: "#15803d", fontSize: 28, fontWeight: 800 }}>🔒 専従ルール</h4>
              {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.staff} onChange={e => updateRule("fixed", idx, "staff", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.section} onChange={e => updateRule("fixed", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("fixed", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button>
            </div>

            <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, border: "2px solid #cbd5e1" }}>
              <h4 style={{ margin: "0 0 20px 0", color: "#475569", fontSize: 28, fontWeight: 800 }}>🙅 担当不可ルール</h4>
              {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 28, borderBottom: "2px solid #e2e8f0", paddingBottom: 28 }}>
                    <div className="rule-row">
                      <select value={rule.staff} onChange={e => updateRule("forbidden", idx, "staff", e.target.value)} className="rule-sel"><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("forbidden", idx)} className="rule-del">✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.sections} onChange={v => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} hasArrows={false} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button>
            </div>

            <div style={{ background: "#fef08a", padding: 32, borderRadius: 16, border: "2px solid #fde047" }}>
              <h4 style={{ margin: "0 0 20px 0", color: "#a16207", fontSize: 28, fontWeight: 800 }}>🚨 緊急ルール（人数不足時）</h4>
              <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 16, background: "#fff", padding: "18px 32px", borderRadius: 12, border: "2px solid #fde047" }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#854d0e" }}>🚑 一般スタッフ発動ライン: 出勤</span>
                  <input type="number" value={customRules.helpThreshold ?? 17} onChange={e => setCustomRules({...customRules, helpThreshold: Number(e.target.value)})} style={{ width: "100px", padding: "12px", borderRadius: 8, border: "2px solid #fde047", textAlign: "center", fontWeight: 800, color: "#a16207", fontSize: 24 }} />
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#a16207" }}>人以下</span>
              </div>
              {(customRules.emergencies || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"18px 24px", border:"2px dashed #fde047", borderRadius:12}}>
                    <span className="rule-label" style={{color:"#854d0e"}}>出勤</span>
                    <input type="number" value={rule.threshold} onChange={e => updateRule("emergencies", idx, "threshold", Number(e.target.value))} className="rule-num" style={{borderColor:"#fde047"}} />
                    <span className="rule-label" style={{color:"#854d0e"}}>人以下➔</span>
                    <select value={["clear", "role_assign", "change_capacity"].includes(rule.type) ? rule.type : "change_capacity"} onChange={e => updateRule("emergencies", idx, "type", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", width:"180px", borderColor:"#fde047"}}>
                      <option value="role_assign">担当配置</option>
                      <option value="change_capacity">定員変更</option>
                      <option value="clear">配置なし</option>
                    </select>
                    {rule.type === "role_assign" ? (<><select value={rule.role} onChange={e => updateRule("emergencies", idx, "role", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">月間設定</option>{MONTHLY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select><span className="rule-label" style={{color:"#854d0e"}}>を</span><select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></>) : rule.type === "change_capacity" ? (<><select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select><span className="rule-label" style={{color:"#854d0e"}}>の定員を</span><input type="number" value={rule.newCapacity ?? 3} onChange={e => updateRule("emergencies", idx, "newCapacity", Number(e.target.value))} className="rule-num" style={{borderColor:"#fde047"}} /><span className="rule-label" style={{color:"#854d0e"}}>人にする</span></>) : (<><select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select><span className="rule-label" style={{color:"#854d0e"}}>を空にする</span></>)}
                    <button onClick={() => removeRule("emergencies", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#a16207", borderColor:"#ca8a04"}} onClick={() => addRule("emergencies", { threshold: 16, type: "change_capacity", role: "", section: "CT", newCapacity: 3 })}>＋ 追加</button>
            </div>

            <div style={{ paddingTop: 32, borderTop: "2px dashed #cbd5e1" }}>
              <h4 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.02em" }}>📅 月間担当者の設定</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => {
                  const opts = key === "受付ヘルプ" ? GENERAL_ROOMS : [];
                  return (
                    <SectionEditor key={key} section={label} value={monthlyAssign[key] || ""} activeStaff={key === "受付" ? activeReceptionStaff : allStaff} onChange={v => updateMonthly(key, v)} noTime={true} customOptions={opts} />
                  );
                })}
              </div>
            </div>

          </div>
        </details>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#3b82f6", fontSize: 28 }}>📊 配置マトリックス（月間集計）</summary>
          <div style={{ marginTop: 24, overflowX: "auto", maxHeight: "70vh", border: "2px solid #cbd5e1", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "18px", textAlign: "center", minWidth: 1000 }}>
              <thead>
                <tr>
                  <th style={{ position: "sticky", left: 0, top: 0, background: "#f8fafc", zIndex: 30, padding: 12, borderRight: "1px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", color: "#1e293b", fontWeight: 800 }}>スタッフ</th>
                  {ROOM_SECTIONS.map(r => <th key={r} style={{ position: "sticky", top: 0, zIndex: 20, padding: "12px 8px", borderRight: "1px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontWeight: 800, whiteSpace: "nowrap", fontSize: "20px" }}>{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {allStaff.filter(s => activeGeneralStaff.includes(s)).map((staff, sIdx) => {
                  const isZebra = sIdx % 2 === 1;
                  const rowBg = isZebra ? "#f1f5f9" : "#ffffff";
                  return (
                    <tr key={staff} className="calendar-row">
                      <td onClick={() => setSelectedStaffForStats(staff)} style={{ position: "sticky", left: 0, background: rowBg, zIndex: 10, padding: "12px 16px", borderRight: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", fontWeight: 800, textAlign: "left", cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}>{staff}</td>
                      {ROOM_SECTIONS.map(r => {
                        const stat = monthlyMatrixStats[staff]?.[r] || { total: 0, late: 0 };
                        let bg = rowBg; let color = "#334155";
                        if (["CT", "MRI"].includes(r)) {
                          if (stat.total > 0) { bg = `rgba(59, 130, 246, ${Math.min(0.1 + stat.total * 0.15, 0.9)})`; if(stat.total >= 3) color = "#fff"; }
                          else if (isMonthlyMainStaff(r, staff, monthlyAssign)) bg = "#fef08a";
                        }
                        return (
                          <td key={r} style={{ padding: "8px 12px", background: bg, color: color, fontWeight: stat.total > 0 ? 800 : 500, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                              {stat.total > 0 ? <span style={{fontSize:20}}>{stat.total}</span> : <span style={{ width: "20px" }}></span>}
                              {stat.late > 0 && <span style={{ fontSize: "14px", background: "#fef08a", color: "#b45309", padding: "2px 6px", borderRadius: "12px", lineHeight: 1, fontWeight: 800, border: "1px solid #fde047" }}>遅 {stat.late}</span>}
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
        </details>
      </div>

      <div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "36px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>週間一覧</h3>
          <div className="no-print"><WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} /></div>
        </div>
        <div className="scroll-container" style={{ borderRadius: 12, border: "2px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1400, background: "#fff" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 20 }}>
              <tr>
                <th style={{...cellStyle(true, false, false, true), borderRight: "3px solid #e2e8f0", borderBottom: "3px solid #e2e8f0"}}>区分</th>
                {days.map(day => {
                  const dayWarnings = getDayWarnings(day.id);
                  const errorCount = dayWarnings.filter((w: {type: string}) => w.type === 'error').length;
                  const alertCount = dayWarnings.filter((w: {type: string}) => w.type === 'alert').length;
                  return (
                    <th key={day.id} onClick={() => setSel(day.id)} style={{...cellStyle(true, day.isPublicHoliday, day.id === sel), borderBottom: "3px solid #e2e8f0", cursor: "pointer"}}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        {day.label}
                        {/* 🌟 週間一覧のアラートバッジ */}
                        {errorCount > 0 && <div style={{ background: "#fef2f2", border: "2px solid #ef4444", color: "#ef4444", borderRadius: "12px", padding: "2px 8px", fontSize: 16, display: "flex", alignItems: "center", gap: 4, fontWeight: "bold" }}>🚨 エラー {errorCount}</div>}
                        {errorCount === 0 && alertCount > 0 && <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", color: "#b45309", borderRadius: "12px", padding: "2px 8px", fontSize: 16, display: "flex", alignItems: "center", gap: 4, fontWeight: "bold" }}>⚠️ 注意 {alertCount}</div>}
                        {!day.isPublicHoliday && assignLogs[day.id]?.length > 0 && (
                          <button className="no-print" onClick={(e) => { e.stopPropagation(); setSelectedLogDay(day.id); }} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "4px 8px", fontSize: 16, color: "#0369a1", fontWeight: "bold", cursor: "pointer" }}>🤔 根拠</button>
                        )}
                      </div>
                      {day.isPublicHoliday && <div style={{ fontSize: 18, color: "#ef4444", marginTop: 4 }}>🎌 {day.holidayName}</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((section, sIdx) => (
                <tr key={section}>
                  <td style={{...cellStyle(true, false, false, true, sIdx % 2 === 1), borderRight: "3px solid #e2e8f0"}}>{section}</td>
                  {days.map(day => (
                    <td key={day.id + section} style={cellStyle(false, day.isPublicHoliday, day.id === sel, false, sIdx % 2 === 1)}>
                      {!day.isPublicHoliday && split(day.cells[section]).join("、")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle() }}>
        <div className="scroll-container hide-scrollbar sticky-header" style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(4px)", paddingBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {days.map(d => (
              <button key={d.id} onClick={() => setSel(d.id)} style={{ padding: "16px 28px", borderRadius: 12, border: "none", background: d.id === sel ? "#2563eb" : "#fff", color: d.id === sel ? "#fff" : (d.isPublicHoliday ? "#ef4444" : "#64748b"), fontWeight: 800, fontSize: 24, cursor: "pointer", boxShadow: d.id === sel ? "0 4px 6px rgba(0,0,0,0.1)" : "0 2px 4px rgba(0,0,0,0.05)" }}>{d.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button className="btn-hover" onClick={handleAutoOne} style={{...btnStyle("#10b981"), padding: "16px 24px", fontSize: 22}}>✨ 1日自動割当</button>
            <button className="btn-hover" onClick={handleAutoAll} style={{...btnStyle("#0ea5e9"), padding: "16px 24px", fontSize: 22}}>⚡ 全日程自動割当</button>
            <button className="btn-hover" onClick={handleCopyYesterday} style={{ ...btnStyle("#f8fafc", "#475569"), border: "2px solid #cbd5e1", padding: "16px 24px", fontSize: 22 }} disabled={cur.isPublicHoliday}>📋 昨日をコピー</button>
            <button className="btn-hover" onClick={handleUndo} disabled={history.length === 0} style={{...btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6"), padding: "16px 24px", fontSize: 22}}>↩️ 戻る</button>
          </div>
        </div>

        {cur.isPublicHoliday ? (
          <div style={{ padding: 80, textAlign: "center", background: "#f8fafc", borderRadius: 20, border: "3px dashed #cbd5e1", marginTop: 32 }}>
            <h3 style={{ color: "#64748b", fontSize: 32 }}>🎌 この日は休診日です</h3>
          </div>
        ) : (
          <div style={{ marginTop: 32 }}>
            {warnings.length > 0 && (
              <div style={{ background: "#fffbeb", border: "2px dashed #fcd34d", padding: 32, borderRadius: 16, display: "flex", gap: 24, marginBottom: 40 }}>
                <div style={{ fontSize: 40 }}>💡</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {warnings.map((w, i) => (
                    <div key={i} style={{ background: w.type === 'error' ? "#fef2f2" : "#f0f9ff", border: `1px solid ${w.type === 'error' ? "#fca5a5" : "#bae6fd"}`, padding: "12px 20px", borderRadius: 10, fontSize: 22, fontWeight: 700, color: w.type === 'error' ? "#b91c1c" : "#0369a1" }}>{w.msg}</div>
                  ))}
                </div>
              </div>
            )}
            
            {RENDER_GROUPS.map(group => (
              <div key={group.title} style={{ marginBottom: 48 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "3px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: 30, fontWeight: 800, borderLeft: `10px solid ${group.color}`, paddingLeft: 16, margin: 0 }}>{group.title}</h4>
                  {group.title === "休務・夜勤" && (
                    <div style={{display: "flex", gap: 16}}>
                      <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "10px 20px", fontSize: 20, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                      <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "10px 20px", fontSize: 20, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                    </div>
                  )}
                  {group.title === "モダリティ" && (
                    <div style={{display: "flex", gap: 16}}>
                      <button onClick={handleClearWorkDay} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "10px 20px", fontSize: 20, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務1日クリア</button>
                      <button onClick={handleClearWorkWeek} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "10px 20px", fontSize: 20, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務週間クリア</button>
                    </div>
                  )}
                  {group.title === "待機・その他" && (
                    <div style={{display: "flex", gap: 16}}>
                      <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "10px 20px", fontSize: 20, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                      <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "10px 20px", fontSize: 20, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
                  {group.sections.map(s => {
                    const noTimeSections = ["明け","入り","不在","土日休日代休","昼当番"];
                    return <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={getAvailableStaffForDay(s, cur.cells)} onChange={v => updateDay(s, v)} noTime={noTimeSections.includes(s)} customOptions={ROLE_PLACEHOLDERS.filter(p => p.startsWith(s))} />
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStaffForStats && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSelectedStaffForStats(null)}>
          <div className="modal-animate" style={{ background: "#fff", padding: 40, borderRadius: 24, width: "90%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, paddingBottom: 20, borderBottom: "2px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, fontSize: 32, color: "#0f172a", fontWeight: 800 }}>👤 {selectedStaffForStats} さんの稼働詳細</h3>
              <button onClick={() => setSelectedStaffForStats(null)} className="btn-hover" style={{ background: "#f1f5f9", border: "none", width: 56, height: 56, borderRadius: "50%", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 28 }}>✖</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 24 }}>
              <thead><tr style={{ borderBottom: "3px solid #e2e8f0" }}><th style={{ padding: "16px 12px", textAlign: "left" }}>日付</th><th style={{ padding: "16px 12px", textAlign: "left" }}>業務担当</th></tr></thead>
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
                  return (
                    <tr key={dateStr} style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <td style={{ padding: "16px 12px", fontWeight: 600 }}>{label}</td>
                      <td style={{ padding: "16px 12px", color: assigns.length > 0 ? "#0ea5e9" : "#94a3b8", fontWeight: 700 }}>{assigns.length > 0 ? assigns.join(" / ") : "なし"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ textAlign: "center", marginTop: 32 }}><button onClick={() => setSelectedStaffForStats(null)} style={btnStyle("#2563eb")}>閉じる</button></div>
          </div>
        </div>
      )}

      {selectedLogDay && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSelectedLogDay(null)}>
          <div className="modal-animate" style={{ background: "#fff", padding: 40, borderRadius: 24, width: "90%", maxWidth: 800, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, paddingBottom: 20, borderBottom: "2px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, fontSize: 32, color: "#0f172a", fontWeight: 800 }}>🤔 {selectedLogDay} の割当根拠</h3>
              <button onClick={() => setSelectedLogDay(null)} className="btn-hover" style={{ background: "#f1f5f9", border: "none", width: 56, height: 56, borderRadius: "50%", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 28 }}>✖</button>
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {assignLogs[selectedLogDay]?.map((log, i) => <li key={i} style={{ padding: "12px 0", borderBottom: "1px dashed #cbd5e1", fontSize: 20 }}>{log}</li>)}
            </ul>
            <div style={{ textAlign: "center", marginTop: 32 }}><button onClick={() => setSelectedLogDay(null)} style={btnStyle("#2563eb")}>閉じる</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
