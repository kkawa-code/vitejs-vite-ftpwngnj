import React, { useEffect, useMemo, useState, useRef } from "react";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  
  /* 🌟 Viteのデフォルトの壁（横幅制限）を強制的に破壊！ */
  html, body, #root { 
    max-width: 100% !important; 
    width: 100% !important; 
    margin: 0 !important; 
    padding: 0 !important; 
  }

  /* 🌟 全体の横スクロールは防止しつつ、固定ヘッダー（sticky）を殺さない設定 */
  body { background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.02em; font-size: 24px; overflow-x: clip; }
  
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  textarea:focus, select:focus, input:focus { outline: 3px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 0.8rem center; background-size: 1.5em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
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

// ===================== 🌟 型定義の厳密化 =====================
type RenderGroup = { title: string; color: string; sections: string[] };
type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string> };

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
interface RuleLateShift { section: string; lateTime: string; dayEndTime: string; }
interface RuleLunchSpecial { day: string; count: number; }
interface RuleLunchCond { section: string; min: number; out: number; }

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
  ngPairs: RuleNgPair[];
  fixed: RuleFixed[];
  forbidden: RuleForbidden[];
  substitutes: RuleSubstitute[];
  pushOuts: RulePushOut[];
  emergencies: RuleEmergency[];
  kenmuPairs: RuleKenmuPair[];
  lateShifts: RuleLateShift[];
  helpThreshold: number;
  lunchBaseCount: number;
  lunchSpecialDays: RuleLunchSpecial[];
  lunchConditional: RuleLunchCond[];
  lunchPrioritySections: string;
  lunchLastResortSections: string;
}

const SECTIONS = [
  "明け","入り","土日休日代休","不在","待機","CT","MRI","RI",
  "1号室","2号室","3号室","5号室","透視（6号）","透視（11号）",
  "MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","受付","受付ヘルプ"
];

const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
const ROLE_PLACEHOLDERS = ROOM_SECTIONS.map(s => s + "枠");
const GENERAL_ROOMS = ["1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA", "透析後胸部", "検像"];

const FALLBACK_HOLIDAYS: Record<string, string> = {
  "2025-01-01": "元日", "2025-01-13": "成人の日", "2025-02-11": "建国記念の日", "2025-02-23": "天皇誕生日", "2025-02-24": "振替休日", "2025-03-20": "春分の日", "2025-04-29": "昭和の日", "2025-05-03": "憲法記念日", "2025-05-04": "みどりの日", "2025-05-05": "こどもの日", "2025-05-06": "振替休日", "2026-01-01": "元日", "2026-01-12": "成人の日"
};

const MONTHLY_CATEGORIES = [
  { key: "CT", label: "CT" }, { key: "MRI", label: "MRI" }, { key: "治療", label: "治療 (メイン)" }, { key: "治療サブ優先", label: "治療 (サブ優先)" },
  { key: "治療サブ", label: "治療 (サブ)" }, { key: "RI", label: "RI (メイン)" }, { key: "RIサブ", label: "RI (サブ)" }, { key: "MMG", label: "MMG" },
  { key: "透析後胸部", label: "透析後胸部" }, { key: "受付", label: "受付" }, { key: "受付ヘルプ", label: "受付ヘルプ" }
];

const DEFAULT_STAFF = "";
const DEFAULT_MONTHLY_ASSIGN: Record<string, string> = { CT: "", MRI: "", 治療: "", 治療サブ優先: "", 治療サブ: "", RI: "", RIサブ: "", MMG: "", 受付: "", 受付ヘルプ: "", 透析後胸部: "" };

const DEFAULT_PRIORITY_ROOMS = [
  "受付", "治療", "CT", "MRI", "RI", "ポータブル", "2号室", "5号室", 
  "透視（6号）", "透視（11号）", "MMG", "1号室", "3号室", "DSA", "検像", "骨塩", "パノラマCT", "透析後胸部", "受付ヘルプ"
];

const DEFAULT_RULES: CustomRules = { 
  staffList: DEFAULT_STAFF, receptionStaffList: "", supportStaffList: "", supportTargetRooms: "1号室,2号室,5号室,パノラマCT", customHolidays: "", 
  capacity: { CT: 3, MRI: 3, 治療: 3, RI: 1, 受付: 2 }, 
  dailyCapacities: [], dailyAdditions: [], 
  priorityRooms: DEFAULT_PRIORITY_ROOMS, 
  fullDayOnlyRooms: "DSA,検像,骨塩,パノラマCT", 
  ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], 
  kenmuPairs: [], lateShifts: [], 
  helpThreshold: 17, lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], 
  lunchPrioritySections: "RI,1号室,2号室,3号室,5号室,CT", lunchLastResortSections: "治療" 
};

const KEY_ALL_DAYS = "shifto_alldays_v119"; 
const KEY_MONTHLY = "shifto_monthly_v119"; 
const KEY_RULES = "shifto_rules_v119";

const pad = (n: number) => String(n).padStart(2, '0');

const TIME_OPTIONS: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h = 8; h <= 19; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 8 && m === 0) continue; 
    const mm = pad(m);
    TIME_OPTIONS.push(`(${h}:${mm}〜)`);
    TIME_OPTIONS.push(`(〜${h}:${mm})`);
  }
}

const RENDER_GROUPS: RenderGroup[] = [
  { title: "休務・夜勤", color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] },
  { title: "モダリティ", color: "#3b82f6", sections: ["CT","MRI","RI","治療"] },
  { title: "一般撮影・透視・その他", color: "#10b981", sections: ["MMG","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","検像","受付","受付ヘルプ","昼当番"] },
  { title: "待機", color: "#f59e0b", sections: ["待機","透析後胸部"] }
];

// ===================== 🌟 ユーティリティ関数 =====================
function split(v: string) { return (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean); }
function join(a: string[]) { return a.filter(Boolean).join("、"); }
function formatDayForDisplay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }

// 🌟 責務の分離：名前のみを抽出する関数
function extractStaffName(fullName: string) { 
  return fullName.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim(); 
}

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

const isMonthlyMainStaff = (section: string, name: string, monthlyAssign: Record<string, string>) => {
  if (!section) return false;
  return getMonthlyStaffForSection(section, monthlyAssign).includes(name);
};

const getStaffAmount = (name: string) => {
  if (ROLE_PLACEHOLDERS.includes(extractStaffName(name))) return 0;
  return (name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/)) ? 0.5 : 1;
};

// ===================== 🌟 UI コンポーネント =====================
function btnStyle(bg: string, color: string = "#fff"): React.CSSProperties { 
  return { background: bg, color: color, border: "none", borderRadius: "12px", padding: "20px 32px", cursor: "pointer", fontWeight: 800, fontSize: 24, whiteSpace: "nowrap", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 }; 
}
function panelStyle(): React.CSSProperties { 
  return { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "40px", boxShadow: "0 6px 12px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" }; 
}
function cellStyle(isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties { 
  let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff");
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff"); 
  return { border: "1px solid #e2e8f0", padding: "24px", background: bg, fontWeight: isHeader ? 800 : 600, textAlign: isHeader ? "center" : "left", fontSize: 24, minWidth: isHeader && !isSticky ? "200px" : "auto", color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, boxShadow: isSticky ? "3px 0 6px -2px rgba(0,0,0,0.05)" : "none", transition: "background-color 0.2s" }; 
}

const MultiSectionPicker = ({ selected, onChange, options }: { selected: string, onChange: (v: string) => void, options: string[] }) => {
  const current = split(selected);
  const handleAdd = (sec: string) => { if (sec && !current.includes(sec)) onChange(join([...current, sec])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16, alignItems: "center" }}>
      {current.map((sec, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 20, padding: "12px 20px", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 12, border: "2px solid #bae6fd" }}>
          {sec} <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.6 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" style={{ padding: "12px 32px 12px 16px", fontSize: 22, minWidth: 160, flex: "0 0 auto", height: 56 }} onChange={(e) => handleAdd(e.target.value)} value="">
        <option value="">＋追加</option>
        {options.filter(s => !current.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

const MultiStaffPicker = ({ selected, onChange, options, placeholder = "＋追加" }: { selected: string, onChange: (v: string) => void, options: string[], placeholder?: string }) => {
  const current = split(selected);
  const handleAdd = (name: string) => { if (name && !current.includes(name)) onChange(join([...current, name])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      {current.map((name, i) => (
        <div key={i} style={{ background: "#f1f5f9", color: "#334155", borderRadius: 20, padding: "12px 20px", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", gap: 12, border: "2px solid #cbd5e1" }}>
          {name} <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" style={{ padding: "12px 32px 12px 16px", fontSize: 22, minWidth: 160, flex: "0 0 auto", height: 56 }} onChange={(e) => handleAdd(e.target.value)} value="">
        <option value="">{placeholder}</option>
        {options.filter(s => !current.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

const WeekCalendarPicker = ({ targetMonday, onChange, nationalHolidays, customHolidays }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(targetMonday));

  useEffect(() => { setViewDate(new Date(targetMonday)); }, [targetMonday]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

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
    if (dayOfWeek === 6 || d === daysInMonth) {
      weeks.push(currentWeek);
      currentWeek = new Array(7).fill(null);
    }
  }

  const handleWeekClick = (weekObj: (number|null)[]) => {
    const validDay = weekObj.find(d => d !== null);
    if (!validDay) return;
    const dObj = new Date(year, month - 1, validDay);
    const day = dObj.getDay();
    const diff = dObj.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(new Date(dObj).setDate(diff));
    onChange(`${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button className="btn-hover" onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff", "#2563eb"), border: "2px solid #bfdbfe", padding: "18px 28px", fontSize: 24 }}>
        📅 {targetMonday} の週 ▼
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
              <thead><tr><th style={{ color: "#ef4444", padding: 16, fontWeight: 800 }}>日</th><th style={{ padding: 16, fontWeight: 800 }}>月</th><th style={{ padding: 16, fontWeight: 800 }}>火</th><th style={{ padding: 16, fontWeight: 800 }}>水</th><th style={{ padding: 16, fontWeight: 800 }}>木</th><th style={{ padding: 16, fontWeight: 800 }}>金</th><th style={{ color: "#3b82f6", padding: 16, fontWeight: 800 }}>土</th></tr></thead>
              <tbody>
                {weeks.map((w, wIdx) => {
                  const isSelectedWeek = w.some(d => {
                    if(!d) return false;
                    const dObj = new Date(year, month - 1, d);
                    const day = dObj.getDay();
                    const diff = dObj.getDate() - day + (day === 0 ? -6 : 1);
                    const mon = new Date(new Date(dObj).setDate(diff));
                    return `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}` === targetMonday;
                  });

                  return (
                    <tr key={wIdx} onClick={() => handleWeekClick(w)} className="calendar-row" style={{ background: isSelectedWeek ? "#eff6ff" : "transparent" }}>
                      {w.map((d, dIdx) => {
                        if (!d) return <td key={dIdx} style={{ padding: 20 }}></td>;
                        const dateStr = `${year}-${pad(month)}-${pad(d)}`;
                        const holidayName = nationalHolidays[dateStr] || (customHolidays.includes(dateStr) ? "休診日" : null);
                        const isHoliday = !!holidayName;
                        const isSun = dIdx === 0;
                        const isSat = dIdx === 6;
                        let color = "#334155";
                        if (isSun || isHoliday) color = "#ef4444";
                        else if (isSat) color = "#3b82f6";
                        
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
  
  const handleAdd = (name: string) => { 
    if (name) {
      const newName = isTaiki ? `${name}(17:00〜19:00)` : name;
      onChange(join([...members, newName])); 
    }
  };
  const handleRemove = (idx: number) => { const next = [...members]; next.splice(idx, 1); onChange(join(next)); };
  
  const handleTimeChange = (idx: number, newTime: string) => {
    if (noTime) return;
    const next = [...members];
    const core = extractStaffName(next[idx]);
    next[idx] = core + newTime;
    onChange(join(next));
  };

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
                <select 
                  value={currentMod} 
                  onChange={(e) => handleTimeChange(i, e.target.value)}
                  style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 22, fontWeight: 800, color: "inherit", cursor: "pointer", padding: "0 28px 0 8px" }}
                >
                  <option value="">終日</option>
                  {!isTaiki && <option value="(AM)">AM</option>}
                  {!isTaiki && <option value="(PM)">PM</option>}
                  
                  {isTaiki ? (
                    <>
                      <option value="(17:00〜19:00)">17:00〜19:00</option>
                      <option value="(17:00〜22:00)">17:00〜22:00</option>
                      <option value="(17:00〜)">17:00〜</option>
                    </>
                  ) : (
                    <>
                      {currentMod && !["", "(AM)", "(PM)"].includes(currentMod) && !TIME_OPTIONS.includes(currentMod) && (
                        <option value={currentMod}>{currentMod.replace(/[()]/g, '')}</option>
                      )}
                      {TIME_OPTIONS.filter(t => t !== "(AM)" && t !== "(PM)").map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}
                    </>
                  )}
                </select>
              )}
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 10, fontSize: 24 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e) => handleAdd(e.target.value)} value="" style={{ border: "2px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 22, color: "#64748b", flex: 1, minWidth: 160, cursor: "pointer", fontWeight: 700, borderRadius: 12, padding: "14px 36px 14px 20px" }}>
          <option value="">＋追加</option>
          <optgroup label="スタッフ">
            {activeStaff.filter(s => !members.some(m => extractStaffName(m) === s)).map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          {customOptions.length > 0 && (
            <optgroup label="部屋連動（兼務）">
              {customOptions.filter(s => !members.some(m => extractStaffName(m) === s)).map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
          )}
          <optgroup label="担当枠（未定）">
            {ROLE_PLACEHOLDERS.filter(s => s.startsWith(section) && !members.some(m => extractStaffName(m) === s)).map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
        </select>
      </div>
    </div>
  );
};


// ===================== 🌟 巨大関数をクラス化してリファクタリング =====================

type AutoAssignContext = {
  allStaff: string[];
  activeGeneralStaff: string[];
  activeReceptionStaff: string[];
  monthlyAssign: Record<string, string>;
  customRules: CustomRules;
};

class AutoAssigner {
  day: DayData;
  prevDay: DayData | null;
  pastDays: DayData[];
  ctx: AutoAssignContext;
  
  dayCells: Record<string, string>;
  blockMap: Map<string, string> = new Map();
  skipSections: string[] = [];
  clearSections: string[] = []; 
  roleAssignments: Record<string, any> = {};
  currentKenmu: any[] = [];
  dynamicCapacity: Record<string, number> = {};
  
  assignCounts: Record<string, number> = {};
  maxAssigns: Record<string, number> = {};
  counts: Record<string, number> = {};

  constructor(day: DayData, prevDay: DayData | null, pastDays: DayData[], ctx: AutoAssignContext) {
    this.day = { ...day };
    this.prevDay = prevDay;
    this.pastDays = pastDays;
    this.ctx = ctx;
    this.dayCells = { ...day.cells };
    this.dynamicCapacity = { ...(ctx.customRules.capacity || {}) };
  }

  execute(): DayData {
    if (this.prevDay && this.prevDay.cells["入り"]) {
      const iriMembers = split(this.prevDay.cells["入り"]).map(extractStaffName);
      const currentAke = split(this.dayCells["明け"]);
      this.dayCells["明け"] = join(Array.from(new Set([...currentAke, ...iriMembers])));
    }

    if (this.day.isPublicHoliday) {
      return { ...this.day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])) };
    }

    this.buildBlockMap();
    this.applyDailyAdditions();
    this.evaluateEmergencies();
    this.initCounts();
    this.cleanUpDayCells();
    
    this.assignRooms();
    this.processPostTasks();

    return { ...this.day, cells: this.dayCells };
  }

  buildBlockMap() {
    this.ctx.allStaff.forEach(s => this.blockMap.set(s, 'NONE'));
    ["明け","入り","土日休日代休"].forEach(sec => {
      split(this.dayCells[sec]).forEach(m => this.blockMap.set(extractStaffName(m), 'ALL'));
    });
    split(this.dayCells["不在"]).forEach(m => {
      const core = extractStaffName(m);
      if (m.includes("(AM)")) this.blockMap.set(core, 'AM'); 
      else if (m.includes("(PM)")) this.blockMap.set(core, 'PM'); 
      else this.blockMap.set(core, 'ALL');
    });
  }

  applyDailyAdditions() {
    (this.ctx.customRules.dailyAdditions || []).forEach((rule) => {
      if (rule.date === this.day.id && rule.section && rule.count > 0) {
        const timeTag = rule.time === "全日" || !rule.time ? "" : rule.time;
        const placeholderName = rule.section + "枠" + timeTag;
        let current = split(this.dayCells[rule.section]);
        for (let i = 0; i < rule.count; i++) {
          current.push(placeholderName);
        }
        this.dayCells[rule.section] = join(current);
      }
    });
  }

  evaluateEmergencies() {
    const tempAvailCount = this.ctx.activeGeneralStaff.filter(s => this.blockMap.get(s) !== 'ALL').length;
    (this.ctx.customRules.emergencies || []).forEach((em) => {
      if (tempAvailCount <= Number(em.threshold)) {
        if (em.type === "role_assign" && em.role) { 
          if (!this.roleAssignments[em.role] || em.threshold < this.roleAssignments[em.role].threshold) { 
            this.roleAssignments[em.role] = em; 
          } 
        }
        if (em.type === "clear" && em.section) { 
           this.skipSections.push(em.section); 
           this.clearSections.push(em.section); 
        }
        if (em.type === "change_capacity" && em.section) { 
           if (!(this.ctx.customRules.dailyAdditions || []).some((r) => r.date === this.day.id && r.section === em.section)) { 
             this.dynamicCapacity[em.section] = Number(em.newCapacity ?? 3); 
           }
        }
        if (em.type === "kenmu") { 
          this.currentKenmu.push(em); 
          if (em.s2) {
             split(em.s2).forEach(s => this.skipSections.push(s)); 
          }
        }
      }
    });
  }

  initCounts() {
    this.ctx.allStaff.forEach(s => { this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.counts[s] = 0; });
    this.pastDays.forEach(pd => { 
      Object.entries(pd.cells).forEach(([sec, val]) => { 
        if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return; 
        split(val).forEach(m => { 
          const c = extractStaffName(m); 
          if (this.counts[c] !== undefined) this.counts[c]++; 
        }); 
      }); 
    });
  }

  cleanUpDayCells() {
    Object.keys(this.dayCells).forEach(sec => {
      if (["明け","入り","不在","土日休日代休"].includes(sec)) return;
      if (this.skipSections.includes(sec)) { this.dayCells[sec] = ""; return; }
      
      let members = split(this.dayCells[sec]);
      members = members.map(m => {
        const core = extractStaffName(m);
        if (ROLE_PLACEHOLDERS.includes(core)) return m;

        const block = this.blockMap.get(core);
        if (block === 'ALL') return null; 
        if (block === 'AM' && m.includes('(AM)')) return null; 
        if (block === 'PM' && m.includes('(PM)')) return null; 
        if (block === 'AM' && !m.includes('(PM)') && !m.match(/\(.*\)/)) return `${core}(PM)`;
        if (block === 'PM' && !m.includes('(AM)') && !m.match(/\(.*\)/)) return `${core}(AM)`;
        return m;
      }).filter(Boolean) as string[];
      this.dayCells[sec] = join(members);

      if (!REST_SECTIONS.includes(sec) && sec !== "昼当番") {
          split(this.dayCells[sec]).forEach(name => { 
              const c = extractStaffName(name); 
              if (ROLE_PLACEHOLDERS.includes(c)) return; 
              this.addU(c, getStaffAmount(name));
          }); 
      }
    });
  }

  isUsed(name: string): boolean {
    return (this.assignCounts[name] || 0) >= (this.maxAssigns[name] || 1);
  }

  addU(name: string, f = 1): void {
    this.assignCounts[name] = (this.assignCounts[name] || 0) + f;
  }

  isForbidden(staff: string, section: string): boolean {
    return (this.ctx.customRules.forbidden || []).some((rule: any) => rule.staff === staff && split(rule.sections).includes(section));
  }
  
  hasNGPair(candidate: string, members: string[], checkSoft: boolean): boolean {
    return members.some(member => (this.ctx.customRules.ngPairs || []).some((ng: any) => {
      const match = (ng.s1 === candidate && ng.s2 === member) || (ng.s1 === member && ng.s2 === candidate);
      if (!match) return false;
      if ((ng.level || "hard") === "hard") return true;
      if ((ng.level || "hard") === "soft" && checkSoft) return true;
      return false;
    }));
  }

  pick(availList: string[], list: string[], n: number, section?: string, currentAssigned: string[] = [], allowRepeatFromPrev = false): string[] {
    const result: string[] = [];
    const uniqueList = Array.from(new Set(list.filter(Boolean)));
    
    const filterFn = (name: string, isFallback: boolean, checkSoftNg: boolean) => {
      if (!availList.includes(name) || this.isUsed(name) || (section && this.isForbidden(name, section))) return false;
      const isFixed = (this.ctx.customRules.fixed || []).some((r:any) => r.staff === name && r.section === section) || (section ? isMonthlyMainStaff(section, name, this.ctx.monthlyAssign) : false);
      if (!allowRepeatFromPrev && this.prevDay && section && !isFixed) {
        if (split(this.prevDay.cells[section] || "").map(extractStaffName).includes(name)) return false;
      }
      if (this.hasNGPair(name, [...currentAssigned, ...result].map(extractStaffName), checkSoftNg)) return false;
      return true;
    };

    for (const name of uniqueList.filter(n => filterFn(n, false, true))) { result.push(name); if (result.length >= n) return result; }
    for (const name of uniqueList.filter(n => filterFn(n, true, false))) { result.push(name); if (result.length >= n) return result; }
    
    const lastResort = uniqueList.filter(name => {
      if (!availList.includes(name) || this.isUsed(name) || (section && this.isForbidden(name, section))) return false;
      if (this.hasNGPair(name, [...currentAssigned, ...result].map(extractStaffName), false)) return false;
      return true;
    });
    for (const name of lastResort) { result.push(name); if (result.length >= n) return result; }

    return result;
  }

  fill(availList: string[], section: string, preferredList: string[], targetCount: number) {
    if (this.skipSections.includes(section)) return;
    let current = split(this.dayCells[section]);
    const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "DSA,検像,骨塩,パノラマCT");

    const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + getStaffAmount(m), 0);

    let prevAmount = -1;
    while (getCurrentAmount(current) < targetCount) {
      const currentAmount = getCurrentAmount(current);
      if (currentAmount === prevAmount) break; 
      prevAmount = currentAmount;

      const remaining = targetCount - currentAmount;
      
      let needTag = "";
      if (remaining === 0.5 || remaining === 1.5 || remaining === 2.5) {
         const amCount = current.filter(m => m.includes("(AM)")).length;
         const pmCount = current.filter(m => m.includes("(PM)")).length;
         if (amCount > pmCount) needTag = "(PM)";
         if (pmCount > amCount) needTag = "(AM)";
      }

      const isValidBlock = (name: string) => {
         const b = this.blockMap.get(name);
         if (b === 'ALL') return false;
         if (needTag === "(AM)" && b === 'AM') return false; 
         if (needTag === "(PM)" && b === 'PM') return false; 
         if (fullDayOnlyList.includes(section) && b !== 'NONE') return false;
         return true;
      };

      const validPreferred = preferredList.filter(name => !this.isUsed(name) && !this.isForbidden(name, section) && !current.map(extractStaffName).includes(name) && isValidBlock(name));
      const validAvail = availList.filter(name => !this.isUsed(name) && !this.isForbidden(name, section) && !current.map(extractStaffName).includes(name) && isValidBlock(name));

      if (validPreferred.length === 0 && validAvail.length === 0) break;

      const hasAmFree = validAvail.some(s => this.blockMap.get(s) === 'PM');
      const hasPmFree = validAvail.some(s => this.blockMap.get(s) === 'AM');
      
      const sortCandidates = (candidates: string[]) => {
         const mainStaff = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName);
         
         return [...candidates].sort((a, b) => {
             const bA = this.blockMap.get(a);
             const bB = this.blockMap.get(b);

             let scoreA = 0; let scoreB = 0;

             if (mainStaff.includes(a)) scoreA += 10000;
             if (mainStaff.includes(b)) scoreB += 10000;

             if (needTag === "") {
                 if (hasAmFree && hasPmFree && (bA === 'AM' || bA === 'PM')) scoreA += 200; 
                 else if (bA === 'AM' || bA === 'PM') scoreA += 150; 
                 else if (bA === 'NONE') scoreA += 100; 
             } else {
                 if (needTag === "(AM)" && bA === 'PM') scoreA += 200; 
                 if (needTag === "(PM)" && bA === 'AM') scoreA += 200; 
                 if (bA === 'NONE') scoreA += 100; 
             }

             if (needTag === "") {
                 if (hasAmFree && hasPmFree && (bB === 'AM' || bB === 'PM')) scoreB += 200;
                 else if (bB === 'AM' || bB === 'PM') scoreB += 150;
                 else if (bB === 'NONE') scoreB += 100;
             } else {
                 if (needTag === "(AM)" && bB === 'PM') scoreB += 200;
                 if (needTag === "(PM)" && bB === 'AM') scoreB += 200;
                 if (bB === 'NONE') scoreB += 100;
             }

             if (scoreA !== scoreB) return scoreB - scoreA;
             if ((this.counts[a] || 0) !== (this.counts[b] || 0)) return (this.counts[a] || 0) - (this.counts[b] || 0);
             if ((this.assignCounts[a] || 0) !== (this.assignCounts[b] || 0)) return (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0);
             return a.localeCompare(b, 'ja');
         });
      };

      const sortedPreferred = sortCandidates(validPreferred);
      const sortedAvail = sortCandidates(validAvail);

      const pickedCoreList = this.pick(sortedAvail, [...sortedPreferred, ...sortedAvail], 1, section, current.map(extractStaffName), false);
      if (pickedCoreList.length === 0) break;

      const core = pickedCoreList[0];

      const block = this.blockMap.get(core);
      let tag = ""; let f = 1;
      
      if (block === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } 
      else if (block === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } 
      else { 
          if (needTag) {
              tag = needTag;
              f = 0.5;
              this.blockMap.set(core, needTag === "(AM)" ? 'AM' : 'PM');
          } else {
              tag = ""; 
              f = 1;
              this.blockMap.set(core, 'ALL');
          }
      }
      
      current.push(`${core}${tag}`);
      this.addU(core, f);
    }
    this.dayCells[section] = join(current);
  }

  assignRooms() {
    const availAll = this.ctx.allStaff.filter(s => this.blockMap.get(s) !== 'ALL');
    const availGeneral = availAll.filter(s => this.ctx.activeGeneralStaff.includes(s));
    const effectiveReceptionStaff = this.ctx.activeReceptionStaff.length > 0 ? this.ctx.activeReceptionStaff : this.ctx.activeGeneralStaff;
    const availReception = availAll.filter(s => effectiveReceptionStaff.includes(s));
    const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "DSA,検像,骨塩,パノラマCT");

    (this.ctx.customRules.fixed || []).forEach((rule: any) => {
      if (!rule.staff || !rule.section) return;
      Object.keys(this.dayCells).forEach(sec => {
        if (sec === rule.section) return;
        if (REST_SECTIONS.includes(sec)) return;
        const before = split(this.dayCells[sec]);
        const after = before.filter(m => extractStaffName(m) !== rule.staff);
        if (before.length !== after.length) {
          this.dayCells[sec] = join(after);
          this.assignCounts[rule.staff] = 0; 
          this.blockMap.set(rule.staff, 'NONE'); 
        }
      });
    });

    (this.ctx.customRules.fixed || []).forEach((rule: any) => {
      if (!rule.staff || !rule.section || !availAll.includes(rule.staff) || this.isUsed(rule.staff) || this.isForbidden(rule.staff, rule.section)) return;
      if (this.skipSections.includes(rule.section)) return;
      const current = split(this.dayCells[rule.section]);
      if (current.map(extractStaffName).includes(rule.staff) || this.hasNGPair(rule.staff, current.map(extractStaffName), false)) return;
      
      const b = this.blockMap.get(rule.staff);
      let tag = ""; let f = 1;
      if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); }
      else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); }
      else { this.blockMap.set(rule.staff, 'ALL'); }

      this.dayCells[rule.section] = join([...current, `${rule.staff}${tag}`]); 
      this.addU(rule.staff, f);
    });

    Object.values(this.roleAssignments).forEach((ra: any) => {
      if (this.skipSections.includes(ra.section)) return;
      const candidates = split(this.ctx.monthlyAssign[ra.role] || "");
      const targetAvail = ["受付"].includes(ra.role) ? availReception : availGeneral;
      const staff = candidates.find(s => targetAvail.includes(s) && !this.isUsed(s) && !this.isForbidden(s, ra.section));
      if (staff && !split(this.dayCells[ra.section]).map(extractStaffName).includes(staff)) { 
        const b = this.blockMap.get(staff);
        let tag = ""; let f = 1;
        if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); }
        else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); }
        else { this.blockMap.set(staff, 'ALL'); }
        this.dayCells[ra.section] = join([...split(this.dayCells[ra.section]), `${staff}${tag}`]); 
        this.addU(staff, f); 
      }
    });

    (this.ctx.customRules.substitutes || []).forEach((sub: any) => {
      const targets = split(sub.target);
      if (targets.length === 0 || this.skipSections.includes(sub.section)) return; 
      
      const trigger = targets.every(t => !availAll.includes(t) || this.isUsed(t));
      if (trigger) {
        const fallbackStaff = split(sub.subs).filter(s => availGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, sub.section));
        if (fallbackStaff.length > 0) {
          const currentSec = split(this.dayCells[sub.section]);
          for (const f of fallbackStaff) {
            if (fullDayOnlyList.includes(sub.section) && this.blockMap.get(f) !== 'NONE') continue;

            if (!this.hasNGPair(f, currentSec.map(extractStaffName), false) && currentSec.length < 6) {
              const b = this.blockMap.get(f);
              let tag = ""; let fr = 1;
              if (b === 'AM') { tag = "(PM)"; fr = 0.5; this.blockMap.set(f, 'ALL'); }
              else if (b === 'PM') { tag = "(AM)"; fr = 0.5; this.blockMap.set(f, 'ALL'); }
              else { this.blockMap.set(f, 'ALL'); }
              this.dayCells[sub.section] = join([...currentSec, `${f}${tag}`]); 
              this.addU(f, fr);
              break; 
            }
          }
        }
      }
    });

    (this.ctx.customRules.pushOuts || []).forEach((po: any) => {
      const s1 = po.s1 || po.triggerStaff;
      const s2 = po.s2 || po.targetStaff;
      const tSec = po.triggerSection;
      
      if (!s1 || !s2 || !tSec || !po.targetSections) return;
      
      if (availGeneral.includes(s1) && availGeneral.includes(s2) && !this.isUsed(s2)) {
         const s1In = split(this.dayCells[tSec]).map(extractStaffName).includes(s1) || isMonthlyMainStaff(tSec, s1, this.ctx.monthlyAssign);
         const s2In = split(this.dayCells[tSec]).map(extractStaffName).includes(s2) || isMonthlyMainStaff(tSec, s2, this.ctx.monthlyAssign);
         
         if (s1In && s2In) {
            const allowedRooms = split(po.targetSections).filter(s => !this.skipSections.includes(s));
            for (const room of allowedRooms) {
              if (this.isForbidden(s2, room)) continue;
              if (fullDayOnlyList.includes(room) && this.blockMap.get(s2) !== 'NONE') continue;

              const current = split(this.dayCells[room]);
              if (this.hasNGPair(s2, current.map(extractStaffName), false)) continue;
              
              const actualCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
              if (current.length < actualCap) {
                const b = this.blockMap.get(s2);
                let tag = ""; let f = 1;
                if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(s2, 'ALL'); }
                else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(s2, 'ALL'); }
                else { this.blockMap.set(s2, 'ALL'); }
                this.dayCells[room] = join([...current, `${s2}${tag}`]);
                this.addU(s2, f);
                this.dayCells[tSec] = join(split(this.dayCells[tSec]).filter(m => extractStaffName(m) !== s2));
                break;
              }
            }
         }
      }
    });

    const basePriorityList = this.ctx.customRules.priorityRooms && this.ctx.customRules.priorityRooms.length > 0 ? this.ctx.customRules.priorityRooms : DEFAULT_PRIORITY_ROOMS;
    const PRIORITY_LIST = ["治療", ...basePriorityList.filter((r: string) => r !== "治療")];

    PRIORITY_LIST.forEach((room: string) => {
      if (this.skipSections.includes(room)) return;

      let targetCount = this.dynamicCapacity[room] !== undefined ? this.dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);

      let currentMembersForTarget = split(this.dayCells[room]);
      const placeholders = currentMembersForTarget.filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)));
      if (placeholders.length > 0) {
         targetCount += placeholders.length;
         this.dayCells[room] = join(currentMembersForTarget.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m))));
      }

      if (room === "受付") {
        let currentUketsuke = split(this.dayCells["受付"]);
        const uketsukeMonthly = split(this.ctx.monthlyAssign.受付 || "");
        for (const name of uketsukeMonthly) {
          if (availAll.includes(name) && !this.isUsed(name) && !currentUketsuke.map(extractStaffName).includes(name)) { 
            currentUketsuke.push(name); this.addU(name, 1); 
          }
        }
        const neededUketsuke = targetCount - currentUketsuke.length;
        if (neededUketsuke > 0) {
          const pickedUketsuke = this.pick(availReception, availReception, neededUketsuke, "受付", currentUketsuke);
          pickedUketsuke.forEach((name: string) => this.addU(name, 1)); 
          currentUketsuke = [...currentUketsuke, ...pickedUketsuke];
        }
        this.dayCells["受付"] = join(currentUketsuke);
      } else {
        let preferredList: string[] = [];
        if (["治療", "RI", "CT", "MRI", "MMG", "透析後胸部"].includes(room)) {
           preferredList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign).filter((s: string) => availGeneral.includes(s));
        } else if (this.ctx.monthlyAssign[room]) {
           preferredList = split(this.ctx.monthlyAssign[room]).filter((s: string) => availGeneral.includes(s));
        }
        
        let candidates = availGeneral;
        const strictRooms = ["治療", "RI", "MMG", "透析後胸部"];
        if (strictRooms.includes(room)) {
           candidates = preferredList.length > 0 ? preferredList : availGeneral; 
        }
        
        this.fill(candidates, room, preferredList, targetCount);

        const currentAssigned = split(this.dayCells[room]);
        if (currentAssigned.length === 0) {
          const kenmuRule = (this.ctx.customRules.emergencies || []).find((em: any) => em.type === "kenmu" && split(em.s2).includes(room));
          if (kenmuRule && kenmuRule.s1) {
            const sourceStaff = split(this.dayCells[kenmuRule.s1]);
            if (sourceStaff.length > 0) {
              const allowed = sourceStaff.filter(m => {
                 if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) return false;
                 return !this.isForbidden(extractStaffName(m), room);
              }).map(extractStaffName);

              if (allowed.length > 0) {
                this.dayCells[room] = allowed[0]; 
              }
            }
          }
        }
      }
    });

    const processKenmu = (sourceMems: string[], targetMems: string[], targetRoom: string) => {
       const targetCap = this.dynamicCapacity[targetRoom] || 1;
       const targetCores = targetMems.map(extractStaffName);
       
       const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + getStaffAmount(m), 0);
       let currentAmount = getCurrentAmount(targetMems);
       
       if (currentAmount >= targetCap) return targetMems;
       
       for (const m of sourceMems) {
          if (currentAmount >= targetCap) break;
          const core = extractStaffName(m);
          
          if (targetCores.includes(core)) continue;
          if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) continue;
          if (this.isForbidden(core, targetRoom)) continue;
          
          targetMems.push(m);
          targetCores.push(core);
          currentAmount += getStaffAmount(m);
       }
       return targetMems;
    };

    (this.ctx.customRules.kenmuPairs || []).forEach((pair: any) => {
      if (!pair.s1 || !pair.s2) return;
      
      let m1 = split(this.dayCells[pair.s1]);
      let m2 = split(this.dayCells[pair.s2]);

      this.dayCells[pair.s2] = join(processKenmu(m1, m2, pair.s2));
      m2 = split(this.dayCells[pair.s2]); 
      this.dayCells[pair.s1] = join(processKenmu(m2, m1, pair.s1));
    });

    this.currentKenmu.forEach((km: any) => {
      const sourceMembers = split(this.dayCells[km.s1]);
      if (sourceMembers.length > 0) {
        const targets = split(km.s2);
        targets.forEach(targetRoom => {
          if (this.clearSections.includes(targetRoom)) return; 
          let currentTarget = split(this.dayCells[targetRoom]);
          this.dayCells[targetRoom] = join(processKenmu(sourceMembers, currentTarget, targetRoom));
        });
      }
    });
  }

  processPostTasks() {
    const availAll = this.ctx.allStaff.filter(s => this.blockMap.get(s) !== 'ALL');
    const availSupport = availAll.filter(s => split(this.ctx.customRules.supportStaffList || "").includes(s));
    const availGeneral = availAll.filter(s => this.ctx.activeGeneralStaff.includes(s) && !split(this.ctx.customRules.supportStaffList || "").includes(s));
    const supportTargetRooms = split(this.ctx.customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT");

    let helpMembers: string[] = [];
    const tempAvailCountForHelp = this.ctx.activeGeneralStaff.filter(s => this.blockMap.get(s) !== 'ALL').length;
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
        const prevLateStaff = this.prevDay ? split(this.prevDay.cells[rule.section] || "").filter(m => m.includes(rule.lateTime)).map(extractStaffName) : [];

        const getCandidate = (candidatesList: string[], allowConsecutive: boolean) => {
          let cand = candidatesList.filter(name => {
            if (currentCore.includes(name)) return false;
            const b = this.blockMap.get(name);
            if (b === 'PM') return false; 
            if (this.isForbidden(name, rule.section)) return false;
            if (!allowConsecutive && prevLateStaff.includes(name)) return false; 
            return true;
          });
          if (cand.length > 0) {
            cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0));
            return cand[0];
          }
          return null;
        };

        let picked = getCandidate(helpMembers, false) || getCandidate(availGeneral, false);
        if (!picked) picked = getCandidate(helpMembers, true) || getCandidate(availGeneral, true);

        if (picked) {
          current.push(`${picked}${rule.lateTime}`);
          this.addU(picked, 0.5);
          this.blockMap.set(picked, this.blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); 
        }
      }
      this.dayCells[rule.section] = join(current);
    });

    const assignSupportStaff = () => {
      const unassignedSupport = availSupport.filter(s => !this.isUsed(s));
      unassignedSupport.forEach(staff => {
        const b = this.blockMap.get(staff);
        if (b === 'ALL') return;

        let assigned = false;
        for (const room of supportTargetRooms) {
          if (this.skipSections.includes(room) || this.isForbidden(staff, room)) continue;
          
          let current = split(this.dayCells[room]);
          const currentCores = current.map(extractStaffName);
          
          if (current.length === 1 && !currentCores.includes(staff) && !this.hasNGPair(staff, currentCores, false)) {
            let tag = ""; let f = 1;
            if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); }
            else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); }
            else { this.blockMap.set(staff, 'ALL'); }
            
            this.dayCells[room] = join([...current, `${staff}${tag}`]);
            this.addU(staff, f);
            assigned = true;
            break; 
          }
        }
        
        if (!assigned && !this.skipSections.includes("待機") && !this.isForbidden(staff, "待機")) {
           let current = split(this.dayCells["待機"]);
           let tag = ""; let f = 1;
           if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); }
           else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); }
           else { this.blockMap.set(staff, 'ALL'); }
           this.dayCells["待機"] = join([...current, `${staff}${tag}`]);
           this.addU(staff, f);
        }
      });
    };
    assignSupportStaff();

    if (!this.skipSections.includes("昼当番")) {
      let currentLunch = split(this.dayCells["昼当番"]);
      let baseLunchTarget = this.ctx.customRules.lunchBaseCount ?? 3;
      const dayChar = this.day.label.match(/\((.*?)\)/)?.[1];
      if (dayChar) {
        const specialDay = (this.ctx.customRules.lunchSpecialDays || []).find((sd:any) => sd.day === dayChar);
        if (specialDay) baseLunchTarget = Number(specialDay.count);
      }
      const lunchTarget = baseLunchTarget;

      const riMembers = split(this.dayCells["RI"]).map(extractStaffName);
      riMembers.forEach(name => {
        if (!currentLunch.includes(name) && currentLunch.length < lunchTarget && !this.isForbidden(name, "昼当番")) {
          currentLunch.push(name);
        }
      });

      const prioritySecs = split(this.ctx.customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT");
      for (const sec of prioritySecs) {
        if (currentLunch.length >= lunchTarget) break;
        split(this.dayCells[sec]).forEach(name => {
          const core = extractStaffName(name);
          if (!currentLunch.includes(core) && currentLunch.length < lunchTarget && !this.isForbidden(core, "昼当番")) {
            currentLunch.push(core);
          }
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
              if (!currentLunch.includes(core) && !this.isForbidden(core, "昼当番")) {
                currentLunch.push(core);
                picked++;
              }
            }
          }
        });
      }
      
      if (currentLunch.length < lunchTarget) {
        const lastResortSecs = split(this.ctx.customRules.lunchLastResortSections ?? "治療");
        const lastResortMembers: string[] = [];
        lastResortSecs.forEach(sec => {
          split(this.dayCells[sec]).forEach(name => lastResortMembers.push(extractStaffName(name)));
        });

        const fallbackCandidates = availGeneral.filter(name => !lastResortMembers.includes(name) && !currentLunch.includes(name) && !this.isForbidden(name, "昼当番"));
        for (const name of fallbackCandidates) { 
          if (currentLunch.length < lunchTarget) currentLunch.push(name); 
        }
        
        if (currentLunch.length < lunchTarget) {
           const finalFallback = availGeneral.filter(name => lastResortMembers.includes(name) && !currentLunch.includes(name) && !this.isForbidden(name, "昼当番"));
           for (const name of finalFallback) {
             if (currentLunch.length < lunchTarget) currentLunch.push(name); 
           }
        }
      }
      this.dayCells["昼当番"] = join(currentLunch.slice(0, lunchTarget));

      const uTarget = this.dynamicCapacity.受付 !== undefined ? this.dynamicCapacity.受付 : 2;
      const currentUketsukeCount = split(this.dayCells["受付"]).length;
      const needsUketsukeHelp = currentUketsukeCount < uTarget;

      if (needsUketsukeHelp && !this.skipSections.includes("受付ヘルプ")) {
        let helpMems = split(this.dayCells["受付ヘルプ"]);
        const lunchCores = split(this.dayCells["昼当番"]).map(extractStaffName);

        const getHelp = (exclude: string[]) => {
          let cand = availGeneral.filter(n => !exclude.includes(n) && !helpMems.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ"));
          if (cand.length > 0) { cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); return cand[0]; }
          return null; 
        };

        const lunchHelpCandidate = getHelp(lunchCores);
        if (lunchHelpCandidate) {
          helpMems.push(`${lunchHelpCandidate}(12:15〜13:00)`);
        }

        const kenzoCores = split(this.dayCells["検像"]).map(extractStaffName);
        const validKenzo = kenzoCores.filter((n: string) => this.blockMap.get(n) !== 'AM' && !helpMems.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ"));

        let picked16 = validKenzo.length > 0 ? validKenzo[0] : null;

        if (!picked16) {
          const excl = lunchHelpCandidate ? [lunchHelpCandidate] : [];
          let cand = availGeneral.filter(n => this.blockMap.get(n) !== 'AM' && !helpMems.map(extractStaffName).includes(n) && !excl.includes(n) && !this.isForbidden(n, "受付ヘルプ"));
          if (cand.length > 0) { cand.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); picked16 = cand[0]; }
        }

        if (picked16) {
          helpMems.push(`${picked16}(16:00〜)`);
        }

        this.dayCells["受付ヘルプ"] = join(helpMems);
      }
    }
  }
}
// =========================================================================

export default function App() {
  const [allDays, setAllDays] = useState<Record<string, Record<string, string>>>(() => {
    try { const saved = localStorage.getItem(KEY_ALL_DAYS); if (saved) return JSON.parse(saved); } catch {} return {};
  });

  const [history, setHistory] = useState<Record<string, Record<string, string>>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [selectedStaffForStats, setSelectedStaffForStats] = useState<string | null>(null);

  const [targetMonday, setTargetMonday] = useState(() => {
    const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff));
    return `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`;
  });

  const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string>>(() => {
    try { 
      const saved = localStorage.getItem(KEY_MONTHLY); 
      if (saved) return { ...DEFAULT_MONTHLY_ASSIGN, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to load monthlyAssign", e);
    } 
    return DEFAULT_MONTHLY_ASSIGN;
  });
  
  const [customRules, setCustomRules] = useState<CustomRules>(() => {
    try { 
      const saved = localStorage.getItem(KEY_RULES); 
      if (saved) return { ...DEFAULT_RULES, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to load customRules", e);
      alert("⚠️ 設定データの読み込みに失敗しました。データが破損している可能性があるため、デフォルト設定で起動します。");
    } 
    return DEFAULT_RULES;
  });

  const [sel, setSel] = useState("");
  const [nationalHolidays, setNationalHolidays] = useState<Record<string, string>>(FALLBACK_HOLIDAYS);

  useEffect(() => {
    fetch("https://holidays-jp.github.io/api/v1/date.json")
      .then(res => res.json())
      .then(data => setNationalHolidays(prev => ({ ...prev, ...data })))
      .catch(e => console.error("祝日APIの取得に失敗しました", e));
  }, []);

  useEffect(() => { localStorage.setItem(KEY_ALL_DAYS, JSON.stringify(allDays)); }, [allDays]);
  useEffect(() => { localStorage.setItem(KEY_MONTHLY, JSON.stringify(monthlyAssign)); }, [monthlyAssign]);
  useEffect(() => { localStorage.setItem(KEY_RULES, JSON.stringify(customRules)); }, [customRules]);

  const customHolidays = split(customRules.customHolidays || "");
  const days = useMemo(() => {
    const [y, m, d] = targetMonday.split('-').map(Number);
    const mon = new Date(y, m - 1, d);
    return [0, 1, 2, 3, 4].map(i => {
      const curr = new Date(mon); curr.setDate(curr.getDate() + i);
      const id = `${curr.getFullYear()}-${pad(curr.getMonth()+1)}-${pad(curr.getDate())}`;
      
      let holidayName = nationalHolidays[id] || "";
      if (!holidayName && customHolidays.includes(id)) holidayName = "休診日";
      const isPublicHoliday = !!holidayName;

      return { id, label: formatDayForDisplay(curr), isPublicHoliday, holidayName, cells: allDays[id] || Object.fromEntries(SECTIONS.map(s => [s, ""])) };
    });
  }, [targetMonday, allDays, customHolidays, nationalHolidays]);

  useEffect(() => { if (!sel || !days.find(d => d.id === sel)) setSel(days[0].id); }, [days, sel]);

  const cur = days.find(d => d.id === sel) || days[0];

  const activeGeneralStaff = useMemo(() => parseAndSortStaff(customRules.staffList || DEFAULT_STAFF), [customRules.staffList]);
  const activeReceptionStaff = useMemo(() => parseAndSortStaff(customRules.receptionStaffList || ""), [customRules.receptionStaffList]);
  const allStaff = useMemo(() => Array.from(new Set([...activeGeneralStaff, ...activeReceptionStaff])), [activeGeneralStaff, activeReceptionStaff]);

  const getStaffForSection = (section: string) => {
    if (section === "受付") return activeReceptionStaff.length > 0 ? activeReceptionStaff : activeGeneralStaff;
    if (REST_SECTIONS.includes(section) || ["待機", "昼当番", "受付ヘルプ"].includes(section)) return allStaff;
    return activeGeneralStaff;
  };

  const getAvailableStaffForDay = (section: string, currentDayCells: any) => {
    const baseStaff = getStaffForSection(section);
    if (REST_SECTIONS.includes(section)) return baseStaff;
    
    const absentStaff = [
      ...split(currentDayCells["明け"]).map(extractStaffName),
      ...split(currentDayCells["入り"]).map(extractStaffName),
      ...split(currentDayCells["土日休日代休"]).map(extractStaffName),
      ...split(currentDayCells["不在"]).map(extractStaffName)
    ];
    return baseStaff.filter(s => !absentStaff.includes(s));
  };

  const getStaffForCategory = (category: string) => {
    if (category === "受付") return activeReceptionStaff.length > 0 ? activeReceptionStaff : activeGeneralStaff;
    if (category === "受付ヘルプ") return allStaff;
    return activeGeneralStaff;
  };

  const setAllDaysWithHistory = (updater: any) => {
    setAllDays(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setHistory(h => [...h, prev].slice(-20)); 
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setAllDays(previousState);
    setHistory(prev => prev.slice(0, -1));
  };

  const updateDay = (k: string, v: string) => { 
    setAllDaysWithHistory((prev: any) => {
      const nextState = { ...prev, [cur.id]: { ...(prev[cur.id] || cur.cells), [k]: v } };
      if (k === "入り") {
        const dateObj = new Date(cur.id);
        dateObj.setDate(dateObj.getDate() + 1);
        const nextId = `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())}`;
        const nextCells = nextState[nextId] || Object.fromEntries(SECTIONS.map(s => [s, ""]));
        nextState[nextId] = { ...nextCells, "明け": join(split(v).map(extractStaffName)) };
      }
      return nextState;
    }); 
  };
  
  const updateMonthly = (category: string, value: string) => { setMonthlyAssign(prev => ({ ...prev, [category]: value })); };
  const addRule = (type: keyof CustomRules, defaultObj: any) => setCustomRules((r: any) => ({ ...r, [type]: [...(r[type] || []), defaultObj] }));
  const updateRule = (type: keyof CustomRules, idx: number, key: string, val: string | number) => { setCustomRules((r: any) => { const arr = [...r[type]]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: keyof CustomRules, idx: number) => { setCustomRules((r: any) => { const arr = [...r[type]]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };

  const handleCopyYesterday = () => {
    const idx = days.findIndex(d => d.id === cur.id);
    if (idx <= 0) { alert("月曜日には前日のデータがありません。"); return; }
    const prevDay = days[idx - 1];
    setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...prevDay.cells } }));
  };

  const handleClearGroupDay = (title: string, sections: string[]) => {
    if (window.confirm(`${cur.label} の「${title}」をクリアしますか？`)) {
      setAllDaysWithHistory((prev: any) => {
        const nextCells = { ...(prev[cur.id] || cur.cells) };
        sections.forEach(sec => { nextCells[sec] = ""; });
        return { ...prev, [cur.id]: nextCells };
      });
    }
  };

  const handleClearGroupWeek = (title: string, sections: string[]) => {
    if (window.confirm(`表示中の「${title}」を1週間分すべてクリアしますか？`)) {
      setAllDaysWithHistory((prev: any) => {
        const nextState = { ...prev };
        days.forEach(d => {
          const nextCells = { ...(prev[d.id] || d.cells) };
          sections.forEach(sec => { nextCells[sec] = ""; });
          nextState[d.id] = nextCells;
        });
        return nextState;
      });
    }
  };

  const handleClearWorkDay = () => {
    if (window.confirm(`${cur.label} の「モダリティ」と「一般撮影・透視・その他」をクリアしますか？`)) {
      const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections];
      setAllDaysWithHistory((prev: any) => {
        const nextCells = { ...(prev[cur.id] || cur.cells) };
        workSections.forEach(sec => { nextCells[sec] = ""; });
        return { ...prev, [cur.id]: nextCells };
      });
    }
  };

  const handleClearWorkWeek = () => {
    if (window.confirm(`表示中の「モダリティ」と「一般撮影・透視・その他」を1週間分すべてクリアしますか？`)) {
      const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections];
      setAllDaysWithHistory((prev: any) => {
        const nextState = { ...prev };
        days.forEach(d => {
          const nextCells = { ...(prev[d.id] || d.cells) };
          workSections.forEach(sec => { nextCells[sec] = ""; });
          nextState[d.id] = nextCells;
        });
        return nextState;
      });
    }
  };

  const handleResetAll = () => {
    if (window.confirm("本当にすべてのデータを初期状態にリセットしますか？\n※これまで入力したシフト、特殊ルール、月間設定がすべて消去されます。")) {
      setAllDaysWithHistory({});
      setMonthlyAssign(DEFAULT_MONTHLY_ASSIGN);
      setCustomRules(DEFAULT_RULES);
      localStorage.removeItem(KEY_ALL_DAYS);
      localStorage.removeItem(KEY_MONTHLY);
      localStorage.removeItem(KEY_RULES);
      alert("すべてのデータをリセットしました。");
    }
  };

  const handleExport = () => {
    const dataObj = { allDays, monthlyAssign, customRules };
    const blob = new Blob([JSON.stringify(dataObj)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shifto_backup_${targetMonday}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      try {
        const dataObj = JSON.parse(event.target.result);
        if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) {
          setAllDaysWithHistory(dataObj.allDays);
          setMonthlyAssign(dataObj.monthlyAssign);
          setCustomRules(dataObj.customRules);
          alert("データを復元しました！");
        } else {
          alert("正しいデータ形式ではありません。");
        }
      } catch (err) {
        alert("読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopyToClipboard = () => {
    const dataObj = { allDays, monthlyAssign, customRules };
    navigator.clipboard.writeText(JSON.stringify(dataObj)).then(() => {
      alert("データをコピーしました！LINEのKeepメモなどに貼り付けてスマホに送ってください。");
    }).catch(() => {
      alert("コピーに失敗しました。お使いのブラウザでは許可されていません。");
    });
  };

  const handleTextImport = () => {
    if(!importText) return;
    try {
      const dataObj = JSON.parse(importText);
      if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) {
        setAllDaysWithHistory(dataObj.allDays);
        setMonthlyAssign(dataObj.monthlyAssign);
        setCustomRules(dataObj.customRules);
        alert("テキストからデータを復元しました！");
        setImportText("");
      } else {
        alert("正しいデータ形式ではありません。");
      }
    } catch (err) {
      alert("テキストの読み込みに失敗しました。コピー漏れがないか確認してください。");
    }
  };

  const weeklyStats = useMemo(() => {
    const stats: Record<string, { total: number, portable: number, ct: number, mri: number, room6: number, room11: number }> = {};
    activeGeneralStaff.forEach(s => { stats[s] = { total: 0, portable: 0, ct: 0, mri: 0, room6: 0, room11: 0 }; });
    
    days.forEach(d => {
      if (d.isPublicHoliday) return;
      const taskRooms = ASSIGNABLE_SECTIONS.filter(s => !["待機", "昼当番", "受付", "受付ヘルプ"].includes(s));
      taskRooms.forEach(sec => {
        const members = split(d.cells[sec]).map(extractStaffName);
        members.forEach(m => {
          if (stats[m]) {
            stats[m].total += 1;
            if (sec === "ポータブル") stats[m].portable += 1;
            if (sec === "CT") stats[m].ct += 1;
            if (sec === "MRI") stats[m].mri += 1;
            if (sec === "透視（6号）") stats[m].room6 += 1;
            if (sec === "透視（11号）") stats[m].room11 += 1;
          }
        });
      });
    });
    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
  }, [days, activeGeneralStaff]);

  const priorityRoomsList = useMemo(() => {
    const base = customRules.priorityRooms && customRules.priorityRooms.length > 0 ? customRules.priorityRooms : DEFAULT_PRIORITY_ROOMS;
    const list = [...base];
    ROOM_SECTIONS.forEach(r => {
      if (!list.includes(r)) list.push(r);
    });
    return list;
  }, [customRules.priorityRooms]);

  const warnings = useMemo(() => {
    if (!cur || cur.isPublicHoliday) return [];
    const w: {type: 'alert'|'info'|'error', msg: string}[] = [];
    const cells = cur.cells;
    const emptyRooms: string[] = [];

    let tempAvailCountW = activeGeneralStaff.length;
    ["明け","入り","土日休日代休","不在"].forEach(sec => {
      split(cells[sec]).forEach(m => {
        if(activeGeneralStaff.includes(extractStaffName(m))) tempAvailCountW--; 
      });
    });
    
    const dynamicCapacityW = { ...(customRules.capacity || {}) };
    
    (customRules.dailyAdditions || []).forEach((rule: any) => {
      if (rule.date === cur.id && rule.section) {
        dynamicCapacityW[rule.section] = (dynamicCapacityW[rule.section] || 1) + Number(rule.count);
      }
    });

    (customRules.emergencies || []).forEach((em: any) => {
      if (tempAvailCountW <= Number(em.threshold) && em.type === "change_capacity" && em.section) {
        if (!(customRules.dailyAdditions || []).some((r:any) => r.date === cur.id && r.section === em.section)) {
           dynamicCapacityW[em.section] = Number(em.newCapacity ?? 3);
        }
      }
    });

    ROOM_SECTIONS.forEach(room => {
      const count = split(cells[room]).length;
      const target = dynamicCapacityW[room];

      // 🌟変更点：受付ヘルプの空室警告を「受付が1人の時だけ」に限定
      if (room === "受付ヘルプ") {
        const uketsukeCount = split(cells["受付"]).length;
        if (uketsukeCount === 1 && count === 0) {
          w.push({type: 'alert', msg: `💡【受付ヘルプ】受付が1名のためヘルプの配置を推奨します`});
        }
        return; // 通常の「空室リスト」には入れない
      }

      if (target !== undefined && target > 0) {
        if (count === 0) {
          w.push({type: 'alert', msg: `💡【${room}】が空室です（目安 ${target}人）`});
        } else if (count < target) {
          w.push({type: 'info', msg: `💡【${room}】が不足（${count}/${target}人）`});
        }
      } else {
        if (count === 0) {
          emptyRooms.push(room);
        }
      }
    });

    if (emptyRooms.length > 0) {
      w.push({type: 'info', msg: `💡 空室: ${emptyRooms.join(', ')}`});
    }

    (customRules.ngPairs || []).forEach((ng: any) => {
      if (ng.level === 'soft' && ng.s1 && ng.s2) {
        SECTIONS.forEach(sec => {
          const names = split(cells[sec]).map(extractStaffName);
          if (names.includes(ng.s1) && names.includes(ng.s2)) {
            w.push({type: 'alert', msg: `🤝【${sec}】${ng.s1}さんと${ng.s2}さんが一緒です`});
          }
        });
      }
    });

    let baseLunchTarget = customRules.lunchBaseCount ?? 3;
    const dayChar = cur.label.match(/\((.*?)\)/)?.[1];
    if (dayChar) {
      const specialDay = (customRules.lunchSpecialDays || []).find((sd:any) => sd.day === dayChar);
      if (specialDay) baseLunchTarget = Number(specialDay.count);
    }
    const lunchTarget = baseLunchTarget;
    const lunchCount = split(cells["昼当番"]).length;
    if (lunchCount < lunchTarget) {
      w.push({type: 'info', msg: `💡【昼当番】が不足（現在 ${lunchCount}人 / 目安 ${lunchTarget}人）`});
    }
    
    const curIndex = days.findIndex(d => d.id === cur.id);
    if (curIndex > 0) {
      const prevDay = days[curIndex - 1];
      if (!prevDay.isPublicHoliday) {
        
        const prevPortable = split(prevDay.cells["ポータブル"]).map(extractStaffName);
        const curPortable = split(cells["ポータブル"]).map(extractStaffName);
        const consecutive = curPortable.filter(n => prevPortable.includes(n));
        consecutive.forEach(n => {
          w.push({ type: 'error', msg: `🚨【ポータブル連続】${n}さんが昨日と連続で入っています！` });
        });

        (customRules.lateShifts || []).forEach((rule: any) => {
          if (!rule.section || !rule.lateTime) return;
          const prevLate = split(prevDay.cells[rule.section] || "").filter(m => m.includes(rule.lateTime)).map(extractStaffName);
          const curLate = split(cells[rule.section] || "").filter(m => m.includes(rule.lateTime)).map(extractStaffName);
          const consecutiveLate = curLate.filter(n => prevLate.includes(n));
          consecutiveLate.forEach(n => {
            w.push({ type: 'error', msg: `🚨【遅番連続】${n}さんが昨日と連続で ${rule.section} の遅番に入っています！` });
          });
        });
      }
    }

    return w;
  }, [cur, days, customRules, activeGeneralStaff]);

  const handleAutoOne = () => {
    if(!cur || cur.isPublicHoliday) return;
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev };
      const idx = days.findIndex(d => d.id === cur.id);
      const baseDay = { ...days[idx], cells: nextAll[days[idx].id] || days[idx].cells };
      const prevDayObj = idx > 0 ? { ...days[idx-1], cells: nextAll[days[idx-1].id] || days[idx-1].cells } : null;
      
      const ctx: AutoAssignContext = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules };
      const assigner = new AutoAssigner(baseDay, prevDayObj, days.slice(0, idx).map(d => ({...d, cells: nextAll[d.id] || d.cells})), ctx);
      const updatedDay = assigner.execute();
      
      nextAll[updatedDay.id] = updatedDay.cells;
      return nextAll;
    });
  };

  const handleAutoAll = () => {
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev };
      let prevDayObj = null;
      const tempDays: any[] = [];
      const ctx: AutoAssignContext = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules };

      for (let i = 0; i < 5; i++) {
        const baseDay = { ...days[i], cells: nextAll[days[i].id] || days[i].cells };
        const assigner = new AutoAssigner(baseDay, prevDayObj, tempDays, ctx);
        const updatedDay = assigner.execute();
        nextAll[updatedDay.id] = updatedDay.cells;
        prevDayObj = updatedDay;
        tempDays.push(updatedDay);
      }
      return nextAll;
    });
  };

  return (
    <div style={{ maxWidth: "96%", margin: "0 auto", padding: "32px", width: "100%", boxSizing: "border-box" }}>
      <style>{globalStyle}</style>
      
      {/* 🌟 ヘッダー */}
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, gap: 20, flexWrap: "wrap", padding: "32px 40px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a", letterSpacing: "0.02em", fontSize: 40, fontWeight: 800 }}>勤務割付システム</h2>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          
          <button className="btn-hover" onClick={handleExport} style={btnStyle("#6366f1")}>💾 保存</button>
          
          <button className="btn-hover" onClick={() => fileInputRef.current?.click()} style={btnStyle("#8b5cf6")}>📂 読込</button>
          <input type="file" ref={fileInputRef} accept=".json,application/json,text/plain,*/*" style={{ display: "none" }} onChange={handleImport} />
          <button className="btn-hover" onClick={() => window.print()} style={btnStyle("#475569")}>🖨️ 印刷</button>
          <button className="btn-hover" onClick={handleResetAll} style={btnStyle("#ef4444")}>🗑️ リセット</button>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32, padding: "28px 40px" }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#be185d", fontSize: 26, display: "flex", alignItems: "center", gap: 12, letterSpacing: "0.02em" }}>
            <span>📱</span> スマホ・PC間のデータ連携（テキストのコピー＆復元）を開く
          </summary>
          <div style={{ marginTop: 20, paddingTop: 24, borderTop: "2px dashed #fbcfe8" }}>
            <p style={{ fontSize: 20, color: "#9d174d", marginBottom: 20, fontWeight: 600 }}>
              Android等でファイルが保存・選択できない場合、以下のボタンでデータをコピーし、LINE等でスマホに送ってください。<br/>
              スマホ側でその文字を下の枠に貼り付けて「復元」を押せばデータを移行できます。
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn-hover" onClick={handleCopyToClipboard} style={{ ...btnStyle("#db2777"), flex: 1, justifyContent: "center" }}>📋 データをコピー</button>
              <input type="text" value={importText} onChange={e => setImportText(e.target.value)} placeholder="スマホでコピーした文字をここに貼り付け" style={{ flex: 2, padding: "20px 24px", borderRadius: 12, border: "2px solid #f9a8d4", outline: "none", minWidth: 200, fontSize: 24 }} />
              <button className="btn-hover" onClick={handleTextImport} style={{ ...btnStyle("#be185d"), flex: 1, justifyContent: "center" }}>✨ テキストから復元</button>
            </div>
          </div>
        </details>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#0f766e", padding: "12px", fontSize: 28, display: "flex", alignItems: "center", gap: 12, letterSpacing: "0.02em" }}>
            <span>⚙️</span> スタッフ名簿 ＆ 特殊ルールの設定を開く
          </summary>
          <div style={{ paddingTop: 36, borderTop: "2px dashed #e2e8f0", marginTop: 24 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 32, marginBottom: 32 }}>
              <div>
                <label style={{ fontSize: 24, fontWeight: 800, color: "#475569", display: "block", marginBottom: 16 }}>在籍スタッフ名簿（一般）</label>
                <textarea value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} placeholder="例: 山田(やまだ), 佐藤(さとう)" style={{ width: "100%", padding: 20, border: "2px solid #cbd5e1", borderRadius: 12, minHeight: 140, fontSize: 24, lineHeight: 1.6 }} />
                <div style={{ fontSize: 18, color: "#10b981", marginTop: 12, fontWeight: 600 }}>※カッコでふりがなを入れると50音順にソートされます！</div>
              </div>
              <div>
                <label style={{ fontSize: 24, fontWeight: 800, color: "#475569", display: "block", marginBottom: 16 }}>受付スタッフ名簿</label>
                <textarea value={customRules.receptionStaffList || ""} onChange={e => setCustomRules({...customRules, receptionStaffList: e.target.value})} placeholder="例: 伊藤(いとう), 鈴木(すずき)" style={{ width: "100%", padding: 20, border: "2px solid #cbd5e1", borderRadius: 12, minHeight: 140, fontSize: 24, lineHeight: 1.6 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                <div>
                  <label style={{ fontSize: 24, fontWeight: 800, color: "#475569", display: "block", marginBottom: 16 }}>追加の休診日</label>
                  <textarea value={customRules.customHolidays || ""} onChange={e => setCustomRules({...customRules, customHolidays: e.target.value})} placeholder="例: 2026-12-29, 2026-12-30" style={{ width: "100%", padding: 20, border: "2px solid #cbd5e1", borderRadius: 12, minHeight: 140, fontSize: 24, lineHeight: 1.6 }} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 32, marginBottom: 32 }}>
              
              <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, border: "2px solid #e2e8f0", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#334155", fontSize: 28, fontWeight: 800 }}>👥 絶対優先の人数設定（自動割当用）</h4>
                <p style={{ fontSize: 22, color: "#64748b", marginBottom: 24, fontWeight: 600 }}>ここで設定した部屋と人数は、システムが最優先でアサインします。（CTの基本人数などを設定します）</p>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
                  {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                    <div key={room} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: "16px 24px", borderRadius: 10, border: "2px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: "#475569" }}>{room}:</span>
                      <input type="number" min="0" value={count as number} onChange={e => setCustomRules({...customRules, capacity: {...(customRules.capacity||{}), [room]: Number(e.target.value)}})} style={{ width: 72, border: "none", outline: "none", fontSize: 28, fontWeight: 800, textAlign: "center", color: "#334155", background: "transparent" }} />
                      <span style={{ fontSize: 22, color: "#64748b", fontWeight: 600 }}>人</span>
                      <span onClick={() => {
                        const newCap = {...customRules.capacity};
                        delete newCap[room];
                        setCustomRules({...customRules, capacity: newCap});
                      }} className="rule-del" style={{background: "transparent", width: "auto", height: "auto"}}>✖</span>
                    </div>
                  ))}
                  <select onChange={e => {
                    const room = e.target.value;
                    if (room && !customRules.capacity?.[room]) {
                      setCustomRules({...customRules, capacity: {...(customRules.capacity||{}), [room]: 1}});
                    }
                    e.target.value = "";
                  }} className="rule-sel" style={{ flexShrink: 0 }}>
                    <option value="">＋ 部屋を追加</option>
                    {ROOM_SECTIONS.filter(r => !Object.keys(customRules.capacity || {}).includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: "2px dashed #cbd5e1" }}>
                  <h5 style={{ margin: "0 0 16px 0", color: "#0ea5e9", fontSize: 24, fontWeight: 800 }}>📅 特定の日だけ枠を追加する（増枠）</h5>
                  <p style={{ fontSize: 20, color: "#64748b", marginBottom: 20, fontWeight: 600 }}>※「この日のAMだけCTを1人増やす」といったイレギュラーに対応します。</p>
                  {(customRules.dailyAdditions || []).map((rule: any, idx: number) => (
                    <div key={idx} className="rule-row" style={{ background: "#fff", padding: "16px 24px", border: "2px solid #bae6fd", borderRadius: 12 }}>
                      <input type="date" value={rule.date} onChange={e => updateRule("dailyAdditions", idx, "date", e.target.value)} className="rule-sel" style={{ flex: "0 0 240px", padding: "14px 16px", borderColor: "#7dd3fc" }} />
                      <span className="rule-label" style={{ color: "#0369a1" }}>の</span>
                      <select value={rule.section} onChange={e => updateRule("dailyAdditions", idx, "section", e.target.value)} className="rule-sel" style={{ borderColor: "#7dd3fc" }}>
                        <option value="">部屋を選択</option>
                        {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="rule-label" style={{ color: "#0369a1" }}>に</span>
                      <select value={rule.time || "全日"} onChange={e => updateRule("dailyAdditions", idx, "time", e.target.value)} className="rule-sel" style={{ borderColor: "#7dd3fc", flex: "0 0 140px" }}>
                        <option value="全日">全日</option>
                        <option value="(AM)">AM</option>
                        <option value="(PM)">PM</option>
                      </select>
                      <input type="number" min="1" value={rule.count} onChange={e => updateRule("dailyAdditions", idx, "count", e.target.value)} className="rule-num" style={{ borderColor: "#7dd3fc" }} />
                      <span className="rule-label" style={{ color: "#0369a1" }}>人追加する</span>
                      <button onClick={() => removeRule("dailyAdditions", idx)} className="rule-del">✖</button>
                    </div>
                  ))}
                  <button className="rule-add" style={{ color: "#0ea5e9", borderColor: "#7dd3fc" }} onClick={() => addRule("dailyAdditions", { date: targetMonday, section: "CT", time: "全日", count: 1 })}>
                    ＋ 特定日の増枠を追加
                  </button>
                </div>
              </div>

              <div style={{ background: "#fffbeb", padding: 32, borderRadius: 16, border: "2px solid #fde68a", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#b45309", fontSize: 28, fontWeight: 800 }}>👑 部屋の割り当て優先順位（上から順に埋めます）</h4>
                <p style={{ fontSize: 22, color: "#d97706", marginBottom: 24, fontWeight: 600 }}>人が足りない場合、優先順位が低い（下にある）部屋から空室になり、自動的に兼務扱いになります。</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {priorityRoomsList.map((room: string, idx: number, arr: string[]) => (
                    <div key={room} style={{ display: "flex", alignItems: "center", background: "#fff", padding: "12px 20px", borderRadius: 10, border: "2px solid #fcd34d", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#92400e", marginRight: 16, minWidth: 32 }}>{idx + 1}.</span>
                      <span style={{ fontSize: 24, fontWeight: 700, color: "#b45309", marginRight: 16 }}>{room}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button onClick={() => {
                          setCustomRules((prev: any) => {
                            const newArr = [...priorityRoomsList];
                            [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                            return { ...prev, priorityRooms: newArr };
                          });
                        }} disabled={idx === 0} style={{ border: "none", background: idx === 0 ? "transparent" : "#fef3c7", cursor: idx === 0 ? "default" : "pointer", fontSize: 18, padding: "6px 12px", borderRadius: 6, color: "#92400e", lineHeight: 1 }}>▲</button>
                        <button onClick={() => {
                          setCustomRules((prev: any) => {
                            const newArr = [...priorityRoomsList];
                            [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
                            return { ...prev, priorityRooms: newArr };
                          });
                        }} disabled={idx === arr.length - 1} style={{ border: "none", background: idx === arr.length - 1 ? "transparent" : "#fef3c7", cursor: idx === arr.length - 1 ? "default" : "pointer", fontSize: 18, padding: "6px 12px", borderRadius: 6, color: "#92400e", lineHeight: 1 }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, border: "2px solid #cbd5e1", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#334155", fontSize: 28, fontWeight: 800 }}>🕒 終日専任（半休・AM/PM不可）の部屋</h4>
                <p style={{ fontSize: 22, color: "#64748b", marginBottom: 24, fontWeight: 600 }}>検査数が少ない部屋や、半休の人をわざわざアサインする意味がない部屋を指定します。ここには「1日通しで入れる人」しか配置されません。</p>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "360px" }}>
                    <MultiSectionPicker selected={customRules.fullDayOnlyRooms ?? "DSA,検像,骨塩,パノラマCT"} onChange={v => setCustomRules({...customRules, fullDayOnlyRooms: v})} options={ROOM_SECTIONS} />
                  </div>
                </div>
              </div>

              <div style={{ background: "#ecfdf5", padding: 32, borderRadius: 16, border: "2px solid #a7f3d0", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#065f46", fontSize: 28, fontWeight: 800 }}>🔗 常時兼務ペア</h4>
                <p style={{ fontSize: 22, color: "#047857", marginBottom: 24, fontWeight: 600 }}>
                  人が足りない時に自動で兼務にする部屋のペアです。余裕がある時は独立した担当者が入ります。
                </p>
                {(customRules.kenmuPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{ background: "#fff", padding: "18px 24px", border: "2px solid #a7f3d0", borderRadius: 12 }}>
                    <select value={rule.s1} onChange={e => updateRule("kenmuPairs", idx, "s1", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7" }}>
                      <option value="">部屋を選択</option>
                      {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="rule-label" style={{ color: "#065f46" }}>←→</span>
                    <select value={rule.s2} onChange={e => updateRule("kenmuPairs", idx, "s2", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7" }}>
                      <option value="">部屋を選択</option>
                      {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => removeRule("kenmuPairs", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("kenmuPairs", { s1: "", s2: "" })}>
                  ＋ ペアを追加
                </button>
              </div>

              <div style={{ background: "#f0fdf4", padding: 32, borderRadius: 16, border: "2px solid #bbf7d0", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#15803d", fontSize: 28, fontWeight: 800 }}>🤝 サポート専任（2人目要員）ルール</h4>
                <p style={{ fontSize: 22, color: "#166534", marginBottom: 24, fontWeight: 600 }}>指定したスタッフを、1人目の配置が終わった後の「対象部屋」に2人目として自動配置します。</p>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "320px" }}>
                    <label style={{ fontSize: 22, fontWeight: 700, color: "#166534", display: "block", marginBottom: 12 }}>対象スタッフ名（複数可）</label>
                    <div style={{ background: "#fff", padding: "14px", borderRadius: 12, border: "2px solid #86efac", minHeight: "56px", display: "flex", alignItems: "center" }}>
                      <MultiStaffPicker 
                        selected={customRules.supportStaffList || ""} 
                        onChange={v => setCustomRules({...customRules, supportStaffList: v})} 
                        options={allStaff} 
                        placeholder="＋スタッフを選択" 
                      />
                    </div>
                  </div>
                  <div style={{ flex: 2, minWidth: "400px" }}>
                    <label style={{ fontSize: 22, fontWeight: 700, color: "#166534", display: "block", marginBottom: 12 }}>優先する対象部屋</label>
                    <MultiSectionPicker selected={customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT"} onChange={v => setCustomRules({...customRules, supportTargetRooms: v})} options={ROOM_SECTIONS} />
                  </div>
                </div>
              </div>

              <div style={{ background: "#eef2ff", padding: 32, borderRadius: 16, border: "2px solid #c7d2fe", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#4338ca", fontSize: 28, fontWeight: 800 }}>🍱 昼当番の自動選出ルール</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, background: "#fff", padding: "18px 32px", borderRadius: 12, border: "2px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span>
                  <input type="number" min="0" value={customRules.lunchBaseCount ?? 3} onChange={e => setCustomRules({...customRules, lunchBaseCount: Number(e.target.value)})} style={{ width: 80, padding: "14px", borderRadius: 8, border: "2px solid #a5b4fc", textAlign: "center", fontWeight: 800, color: "#4f46e5", fontSize: 24 }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                  <div style={{ flex: 1, minWidth: "400px", background: "#fff", padding: 28, borderRadius: 12, border: "2px solid #e0e7ff" }}>
                    <h5 style={{ margin: "0 0 18px 0", fontSize: 24, color: "#4f46e5", fontWeight: 800 }}>📅 曜日で人数を変える</h5>
                    {(customRules.lunchSpecialDays || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.day} onChange={e => updateRule("lunchSpecialDays", idx, "day", e.target.value)} className="rule-sel">
                          {["月","火","水","木","金","土","日"].map(d => <option key={d} value={d}>{d}曜</option>)}
                        </select>
                        <span className="rule-label">は</span>
                        <input type="number" value={rule.count} onChange={e => updateRule("lunchSpecialDays", idx, "count", e.target.value)} className="rule-num" />
                        <button onClick={() => removeRule("lunchSpecialDays", idx)} className="rule-del">✖</button>
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchSpecialDays", { day: "火", count: 4 })}>＋ 曜日ルールを追加</button>
                  </div>
                  <div style={{ flex: 1, minWidth: "400px", background: "#fff", padding: 28, borderRadius: 12, border: "2px solid #e0e7ff" }}>
                    <h5 style={{ margin: "0 0 18px 0", fontSize: 24, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h5>
                    {(customRules.lunchConditional || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.section} onChange={e => updateRule("lunchConditional", idx, "section", e.target.value)} className="rule-sel">
                          <option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="number" value={rule.min} onChange={e => updateRule("lunchConditional", idx, "min", e.target.value)} className="rule-num" />
                        <span className="rule-label">人以上➔</span>
                        <input type="number" value={rule.out} onChange={e => updateRule("lunchConditional", idx, "out", e.target.value)} className="rule-num" />
                        <button onClick={() => removeRule("lunchConditional", idx)} className="rule-del">✖</button>
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchConditional", { section: "CT", min: 4, out: 1 })}>＋ 条件ルールを追加</button>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 24 }}>
                  <div style={{ flex: 1, background: "#fff", padding: 28, borderRadius: 12, border: "2px solid #e0e7ff", minWidth: "400px" }}>
                    <h5 style={{ margin: "0 0 14px 0", fontSize: 24, color: "#4f46e5", fontWeight: 800 }}>🎯 優先的に選出する部屋</h5>
                    <MultiSectionPicker selected={customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT"} onChange={v => setCustomRules({...customRules, lunchPrioritySections: v})} options={ROOM_SECTIONS} />
                  </div>
                  <div style={{ flex: 1, background: "#fff", padding: 28, borderRadius: 12, border: "2px solid #e0e7ff", minWidth: "400px" }}>
                    <h5 style={{ margin: "0 0 14px 0", fontSize: 24, color: "#4f46e5", fontWeight: 800 }}>⚠️ 緊急時のみ選出する部屋（なるべく除外）</h5>
                    <MultiSectionPicker selected={customRules.lunchLastResortSections ?? "治療"} onChange={v => setCustomRules({...customRules, lunchLastResortSections: v})} options={ROOM_SECTIONS} />
                  </div>
                </div>

              </div>

              <div style={{ background: "#f5f3ff", padding: 32, borderRadius: 16, border: "2px solid #ddd6fe", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#6d28d9", fontSize: 28, fontWeight: 800 }}>🌆 遅番・引き継ぎルール</h4>
                <p style={{ fontSize: 22, color: "#7c3aed", marginBottom: 24, fontWeight: 600 }}>「17時以降も稼働する部屋」を指定できます。日勤者には自動で終了時間が付き、遅番が1名追加されます。</p>
                {(customRules.lateShifts || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"18px 24px", border:"2px solid #ddd6fe", borderRadius:12}}>
                    <select value={rule.section} onChange={e => updateRule("lateShifts", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe"}}>
                      <option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>に</span>
                    <select value={rule.lateTime} onChange={e => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", flex: "0 0 160px"}}>
                      <option value="">遅番の時間</option>
                      {TIME_OPTIONS.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}
                    </select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>の担当を追加する（日勤は</span>
                    <select value={rule.dayEndTime} onChange={e => updateRule("lateShifts", idx, "dayEndTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", flex: "0 0 160px"}}>
                      <option value="">終了時間</option>
                      {TIME_OPTIONS.filter(t => t.includes("(〜")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}
                    </select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>とする）</span>
                    <button onClick={() => removeRule("lateShifts", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルールを追加</button>
              </div>

              <div style={{ background: "#e0f2fe", padding: 32, borderRadius: 16, border: "2px solid #bae6fd", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#0369a1", fontSize: 28, fontWeight: 800 }}>🎱 玉突き・同室回避ルール</h4>
                <p style={{ fontSize: 22, color: "#0284c7", marginBottom: 24, fontWeight: 600 }}>「AさんとBさんが同じ部屋になりそうな時、Bさんを別の部屋に押し出す」ルールです。</p>
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
                      <MultiSectionPicker selected={rule.targetSections} onChange={v => updateRule("pushOuts", idx, "targetSections", v)} options={ROOM_SECTIONS} />
                      <span className="rule-label" style={{color:"#0284c7"}}>に移動</span>
                    </div>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#0369a1", borderColor:"#7dd3fc"}} onClick={() => addRule("pushOuts", { s1: "", s2: "", triggerSection: "", targetSections: "" })}>＋ 玉突きルールを追加</button>
              </div>

              <div style={{ background: "#fff7ed", padding: 32, borderRadius: 16, border: "2px solid #fed7aa", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#c2410c", fontSize: 28, fontWeight: 800 }}>🔄 代打ルール</h4>
                <p style={{ fontSize: 22, color: "#9a3412", marginBottom: 24, fontWeight: 600 }}>特定のスタッフが休みの時に、指定した代打スタッフを優先してアサインするルールです。</p>
                {(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: 18, marginBottom: 20, alignItems: "center", background: "#fff", padding: "24px", borderRadius: 12, border: "2px solid #fdba74", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    
                    <div style={{ flex: 1, minWidth: "240px" }}>
                      <MultiStaffPicker selected={rule.target} onChange={v => updateRule("substitutes", idx, "target", v)} options={activeGeneralStaff} placeholder="対象スタッフ(休)" />
                    </div>
                    
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#c2410c" }}>が全員休みの時➔</span>
                    <div style={{ flex: 1, minWidth: "280px" }}>
                      <MultiStaffPicker selected={rule.subs} onChange={v => updateRule("substitutes", idx, "subs", v)} options={activeGeneralStaff} placeholder="代打スタッフを追加" />
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#c2410c" }}>を</span>
                    <select value={rule.section} onChange={e => updateRule("substitutes", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fed7aa", color: "#c2410c", flex: "0 0 180px"}}>
                      <option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#c2410c" }}>に優先</span>
                    <button onClick={() => removeRule("substitutes", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#c2410c", borderColor:"#fdba74"}} onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打ルールを追加</button>
              </div>

              <div style={{ background: "#fef2f2", padding: 32, borderRadius: 16, border: "2px solid #fecaca", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#b91c1c", fontSize: 28, fontWeight: 800 }}>🚫 NGペア</h4>
                {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.s1} onChange={e => updateRule("ngPairs", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span className="rule-label">と</span>
                    <select value={rule.s2} onChange={e => updateRule("ngPairs", idx, "s2", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.level || "hard"} onChange={e => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"180px"}}>
                      <option value="hard">絶対NG</option><option value="soft">なるべくNG</option>
                    </select>
                    <button onClick={() => removeRule("ngPairs", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ 追加</button>
              </div>

              <div style={{ background: "#f0fdf4", padding: 32, borderRadius: 16, border: "2px solid #bbf7d0", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#15803d", fontSize: 28, fontWeight: 800 }}>🔒 専従（必ずここに配置）</h4>
                {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.staff} onChange={e => updateRule("fixed", idx, "staff", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.section} onChange={e => updateRule("fixed", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("fixed", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button>
              </div>

              <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, border: "2px solid #cbd5e1", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#475569", fontSize: 28, fontWeight: 800 }}>🙅 担当不可（複数選択可）</h4>
                {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 28, borderBottom: "2px solid #e2e8f0", paddingBottom: 28 }}>
                    <div className="rule-row">
                      <select value={rule.staff} onChange={e => updateRule("forbidden", idx, "staff", e.target.value)} className="rule-sel"><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("forbidden", idx)} className="rule-del">✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.sections} onChange={v => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
                ))}
                <button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button>
              </div>

              <div style={{ background: "#fef08a", padding: 32, borderRadius: 16, border: "2px solid #fde047", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 20px 0", color: "#a16207", fontSize: 28, fontWeight: 800 }}>🚨 緊急ルール（人数不足時の対応）</h4>
                <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 16, background: "#fff", padding: "18px 32px", borderRadius: 12, border: "2px solid #fde047" }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#854d0e" }}>🚑 一般スタッフ発動ライン: 出勤</span>
                  <input type="number" value={customRules.helpThreshold ?? 17} onChange={e => setCustomRules({...customRules, helpThreshold: Number(e.target.value)})} style={{ width: "100px", padding: "12px", borderRadius: 8, border: "2px solid #fde047", textAlign: "center", fontWeight: 800, color: "#a16207", fontSize: 24 }} />
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#a16207" }}>人以下</span>
                </div>
                <p style={{ fontSize: 22, color: "#a16207", marginBottom: 20, fontWeight: 600 }}>※「兼務」を連鎖させる場合（AがBを兼務し、BがCを兼務など）は、ルールの順番に注意するか、「AがBを兼務」「AがCを兼務」と直接指定すると確実です。</p>
                {(customRules.emergencies || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"18px 24px", border:"2px dashed #fde047", borderRadius:12}}>
                    <span className="rule-label" style={{color:"#854d0e"}}>出勤</span>
                    <input type="number" value={rule.threshold} onChange={e => updateRule("emergencies", idx, "threshold", Number(e.target.value))} className="rule-num" style={{borderColor:"#fde047"}} />
                    <span className="rule-label" style={{color:"#854d0e"}}>人以下➔</span>
                    
                    <select value={["kenmu", "clear", "role_assign", "change_capacity"].includes(rule.type) ? rule.type : "role_assign"} onChange={e => updateRule("emergencies", idx, "type", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", width:"180px", borderColor:"#fde047"}}>
                      <option value="role_assign">担当配置</option>
                      <option value="kenmu">兼務</option>
                      <option value="change_capacity">定員変更</option>
                      <option value="clear">配置なし</option>
                    </select>

                    {rule.type === "role_assign" ? (
                      <>
                        <select value={rule.role} onChange={e => updateRule("emergencies", idx, "role", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">月間設定</option>{MONTHLY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
                        <span className="rule-label" style={{color:"#854d0e"}}>を</span>
                        <select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </>
                    ) : rule.type === "kenmu" ? (
                      <>
                        <span className="rule-label" style={{color:"#854d0e"}}>[</span>
                        <select value={rule.s1} onChange={e => updateRule("emergencies", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">場所1</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <span className="rule-label" style={{color:"#854d0e"}}>] の担当が [</span>
                        <div style={{ flex: 1, minWidth: "220px" }}>
                          <MultiSectionPicker selected={rule.s2 || ""} onChange={v => updateRule("emergencies", idx, "s2", v)} options={ROOM_SECTIONS} />
                        </div>
                        <span className="rule-label" style={{color:"#854d0e"}}>] も兼務</span>
                      </>
                    ) : rule.type === "change_capacity" ? (
                      <>
                        <select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <span className="rule-label" style={{color:"#854d0e"}}>の定員を</span>
                        <input type="number" value={rule.newCapacity ?? 3} onChange={e => updateRule("emergencies", idx, "newCapacity", Number(e.target.value))} className="rule-num" style={{borderColor:"#fde047"}} />
                        <span className="rule-label" style={{color:"#854d0e"}}>人にする</span>
                      </>
                    ) : (
                      <>
                        <select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <span className="rule-label" style={{color:"#854d0e"}}>を空にする</span>
                      </>
                    )}
                    <button onClick={() => removeRule("emergencies", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#a16207", borderColor:"#ca8a04"}} onClick={() => addRule("emergencies", { threshold: 16, type: "change_capacity", role: "", section: "CT", s1: "", s2: "", newCapacity: 3 })}>＋ 追加</button>
              </div>

            </div>

            <div style={{ marginTop: 40, paddingTop: 32, borderTop: "2px dashed #cbd5e1" }}>
              <h4 style={{ margin: "0 0 14px 0", color: "#1e293b", fontSize: 28, fontWeight: 800, letterSpacing: "0.02em" }}>📅 月間担当者の設定</h4>
              <p style={{ fontSize: 22, color: "#64748b", marginBottom: 24, fontWeight: 600 }}>今月のベースとなる各モダリティの担当者を設定します。（追加形式）</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => {
                  const membersStr = monthlyAssign[key] || "";
                  const opts = (key === "受付ヘルプ") ? GENERAL_ROOMS : [];
                  return (
                    <SectionEditor key={key} section={label} value={membersStr} activeStaff={getStaffForCategory(key)} onChange={v => updateMonthly(key, v)} noTime={true} customOptions={opts} />
                  )
                })}
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#3b82f6", fontSize: 28, display: "flex", alignItems: "center", gap: 12 }}>
            <span>📊</span> 今週のスタッフ稼働メーター（自動集計）を開く
          </summary>
          <div style={{ marginTop: 24, borderTop: "2px dashed #cbd5e1", paddingTop: 24 }}>
            <p style={{ fontSize: 22, color: "#64748b", marginBottom: 24, fontWeight: 600 }}>※表示中の1週間（月〜日）で、誰が何回「業務（待機・当番除く）」に割り当てられているかを自動集計します。クリックで詳細が見れます。</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              {weeklyStats.map(([name, stat]) => (
                <div key={name} className="card-hover btn-hover" onClick={() => setSelectedStaffForStats(name)} style={{ background: stat.total > 0 ? "#fff" : "#f1f5f9", border: `2px solid ${stat.total > 0 ? "#bfdbfe" : "#e2e8f0"}`, padding: "18px 24px", borderRadius: 12, minWidth: 240, boxShadow: stat.total > 0 ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}>
                  <div style={{ fontWeight: 800, color: stat.total > 0 ? "#1e293b" : "#94a3b8", marginBottom: 12, fontSize: 24 }}>{name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #f1f5f9", paddingTop: 12 }}>
                    <span style={{ fontSize: 20, color: "#64748b", fontWeight: 600 }}>総稼働: <strong style={{color:"#2563eb", fontSize:26}}>{stat.total}</strong> 枠</span>
                    <div style={{ display: "flex", gap: 10, fontSize: 18, fontWeight: 800 }}>
                      {stat.portable > 0 && <span style={{ color: "#ef4444", background: "#fee2e2", padding: "4px 10px", borderRadius: 8 }}>ポ:{stat.portable}</span>}
                      {stat.ct > 0 && <span style={{ color: "#0ea5e9", background: "#e0f2fe", padding: "4px 10px", borderRadius: 8 }}>C:{stat.ct}</span>}
                      {stat.mri > 0 && <span style={{ color: "#10b981", background: "#d1fae5", padding: "4px 10px", borderRadius: 8 }}>M:{stat.mri}</span>}
                      {stat.room6 > 0 && <span style={{ color: "#8b5cf6", background: "#ede9fe", padding: "4px 10px", borderRadius: 8 }}>6号:{stat.room6}</span>}
                      {stat.room11 > 0 && <span style={{ color: "#f59e0b", background: "#fef3c7", padding: "4px 10px", borderRadius: 8 }}>11号:{stat.room11}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32, border: "2px solid #e2e8f0" }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#475569", fontSize: 28, display: "flex", alignItems: "center", gap: 12 }}>
            <span>📋</span> 自動割当のルール（部屋が埋まる優先度）を開く
          </summary>
          <div style={{ marginTop: 24, borderTop: "2px dashed #cbd5e1", paddingTop: 24 }}>
            <h4 style={{ margin: "0 0 16px 0", color: "#334155", fontSize: 28, fontWeight: 800 }}>📌 部屋が埋まる順番（処理の優先順位）</h4>
            <p style={{ fontSize: 22, color: "#64748b", marginBottom: 20, fontWeight: 600 }}>※上から順にスタッフが割り当てられていきます。</p>
            <div style={{ fontSize: 24, color: "#334155", lineHeight: 1.6, background: "#fff", padding: 32, borderRadius: 16, border: "2px solid #cbd5e1", marginBottom: 24 }}>
              <ol style={{ margin: 0, paddingLeft: 36 }}>
                <li><strong>【強制ルール】</strong> 専従、代打、玉突き・同室回避</li>
                <li><strong>【主力モダリティ（最優先）】</strong> 治療</li>
                <li><strong>【指定優先部屋】</strong> 「部屋の割り当て優先順位」で並び替えた順番（<span style={{fontWeight:800, color:"#be185d"}}>上から処理</span>：現在は {priorityRoomsList.length > 0 ? priorityRoomsList.join(' → ') : "指定なし"}）</li>
                <li><strong>【一般撮影】</strong> 指定優先部屋以外の残りの部屋</li>
                <li><strong>【サポート】</strong> サポート専任スタッフの2人目配置</li>
                <li><strong>【後処理】</strong> 遅番、兼務、待機、昼当番、受付ヘルプ</li>
              </ol>
            </div>
          </div>
        </details>
      </div>

      {/* 🌟 週間一覧 */}
      <div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "36px 24px" }}>
        <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 32, fontWeight: 800, color: "#1e293b", paddingLeft: 12, letterSpacing: "0.02em" }}>週間一覧</h3>
        <div className="scroll-container" style={{ borderBottom: "2px solid #e2e8f0", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1400, background: "#fff" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 20, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
              <tr>
                <th style={{...cellStyle(true, false, false, true, false), position: "sticky", top: 0, left: 0, zIndex: 30, minWidth: "180px", borderRight: "3px solid #e2e8f0", borderBottom: "3px solid #e2e8f0"}}>区分</th>
                {days.map(day => {
                  return (
                    <th key={day.id} style={{...cellStyle(true, day.isPublicHoliday, day.id === sel, false, false), position: "sticky", top: 0, zIndex: 20, borderBottom: "3px solid #e2e8f0"}}>
                      <div style={{ fontSize: 26, letterSpacing: "0.02em" }}>{day.label}</div>
                      {day.isPublicHoliday && <div style={{ fontSize: 20, color: "#ef4444", marginTop: 8, fontWeight: 600 }}>🎌 {day.holidayName}</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((section, index) => {
                const isZebra = index % 2 === 1; // 🌟 ゼブラストライプ適用
                return (
                  <tr key={section}>
                    <td style={{...cellStyle(true, false, false, true, isZebra), borderRight: "3px solid #e2e8f0"}}>{section}</td>
                    {days.map(day => {
                      return <td key={day.id + section} style={cellStyle(false, day.isPublicHoliday, day.id === sel, false, isZebra)}>
                        {!day.isPublicHoliday && split(day.cells[section]).join("、")}
                      </td>
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), borderRadius: "32px 32px 0 0", boxShadow: "0 -6px 24px rgba(0,0,0,0.04)" }}>
        
        {/* 🌟 曜日タブとアクションボタンの統合＆追従化 */}
        <div className="scroll-container hide-scrollbar sticky-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20, alignItems: "center", borderBottom: "none", marginBottom: 0 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {days.map(d => {
              return (
                <button className="btn-hover" key={d.id} onClick={() => setSel(d.id)} style={{ flexShrink: 0, padding: "20px 32px", cursor: "pointer", border: "none", borderRadius: "12px", background: d.id === sel ? "#2563eb" : "transparent", color: d.id === sel ? "#fff" : (d.isPublicHoliday ? "#ef4444" : "#64748b"), fontWeight: d.id === sel ? 800 : 600, fontSize: 26, whiteSpace: "nowrap", transition: "0.2s" }}>
                  {d.label} {d.isPublicHoliday && "🎌"}
                </button>
              )
            })}
          </div>
          
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn-hover" onClick={handleAutoOne} style={{...btnStyle("#10b981"), padding: "20px 32px", fontSize: 24}}>✨ 表示日を自動割当</button>
            <button className="btn-hover" onClick={handleAutoAll} style={{...btnStyle("#0ea5e9"), padding: "20px 32px", fontSize: 24}}>⚡ 全日程を自動割当</button>
            <button className="btn-hover" onClick={handleCopyYesterday} style={{ ...btnStyle("#f8fafc", "#475569"), border: "2px solid #cbd5e1", padding: "20px 32px", fontSize: 24 }} disabled={cur.isPublicHoliday}>📋 昨日の入力をコピー</button>
            {/* 🌟 一番下にも保存ボタンを復活 */}
            <button className="btn-hover" onClick={handleExport} style={{...btnStyle("#6366f1"), padding: "20px 32px", fontSize: 24}}>💾 保存</button>
            <button className="btn-hover" onClick={handleUndo} style={{...btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6"), padding: "20px 32px", fontSize: 24, cursor: history.length === 0 ? "not-allowed" : "pointer"}} disabled={history.length === 0}>↩️ 戻る</button>
          </div>
        </div>

        {cur.isPublicHoliday ? (
          <div style={{ padding: "120px 32px", textAlign: "center", background: "#f8fafc", borderRadius: 20, border: "3px dashed #cbd5e1", marginTop: 40 }}>
            <h3 style={{ margin: 0, color: "#64748b", fontSize: 32, fontWeight: 800 }}>🎌 この日（{cur.holidayName}）は祝日・休診日のため、シフトは入力できません。</h3>
            <p style={{ fontSize: 24, color: "#94a3b8", marginTop: 20, fontWeight: 600 }}>※「特殊ルールの設定」から追加の休診日を変更できます。</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 48, marginTop: 40 }}>
            {warnings.length > 0 && (
              <div style={{ background: "#fffbeb", border: "2px dashed #fcd34d", padding: "32px 40px", borderRadius: "16px", display: "flex", gap: "24px", alignItems: "flex-start", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "40px" }}>💡</div>
                <div>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: "#b45309", marginBottom: "16px" }}>配置のチェックリスト</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    {warnings.map((w, i) => (
                      <div key={i} style={{ 
                        background: w.type === 'error' ? "#fef2f2" : w.type === 'alert' ? "#fff7ed" : "#f0f9ff", 
                        border: `2px solid ${w.type === 'error' ? "#fecaca" : w.type === 'alert' ? "#fdba74" : "#bae6fd"}`, 
                        padding: "16px 24px", borderRadius: "10px", fontSize: "22px", 
                        color: w.type === 'error' ? "#b91c1c" : w.type === 'alert' ? "#c2410c" : "#0369a1", 
                        fontWeight: 700 
                      }}>
                        {w.msg}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {RENDER_GROUPS.map((group: RenderGroup) => (
              <div key={group.title}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "3px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: 32, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 16, fontWeight: 800 }}>
                    <span style={{ display: "inline-block", width: 10, height: 32, background: group.color, borderRadius: 5 }}></span>
                    {group.title}
                  </h4>
                  {group.title === "休務・夜勤" && (
                    <div style={{display: "flex", gap: 16}}>
                      <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "14px 24px", fontSize: 22, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                      <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "14px 24px", fontSize: 22, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                    </div>
                  )}
                  {group.title === "モダリティ" && (
                    <div style={{display: "flex", gap: 16}}>
                      <button onClick={handleClearWorkDay} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "14px 24px", fontSize: 22, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務1日クリア</button>
                      <button onClick={handleClearWorkWeek} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "14px 24px", fontSize: 22, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務週間クリア</button>
                    </div>
                  )}
                  {group.title === "待機" && (
                    <div style={{display: "flex", gap: 16}}>
                      <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "14px 24px", fontSize: 22, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                      <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "2px solid #cbd5e1", borderRadius: 10, padding: "14px 24px", fontSize: 22, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
                  {group.sections.map((s: string) => {
                    const noTimeSections = ["明け","入り","土日休日代休","不在","昼当番"];
                    const isNoTime = noTimeSections.includes(s);
                    
                    return (
                      <SectionEditor 
                        key={s} 
                        section={s} 
                        value={cur.cells[s] || ""} 
                        activeStaff={getAvailableStaffForDay(s, cur.cells)} 
                        onChange={(v: string) => updateDay(s, v)} 
                        noTime={isNoTime} 
                        customOptions={ROLE_PLACEHOLDERS.filter(p => p.startsWith(s))}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 稼働詳細を表示するモーダル */}
      {selectedStaffForStats && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }} onClick={() => setSelectedStaffForStats(null)}>
          <div className="modal-animate" style={{ background: "#fff", padding: 40, borderRadius: 24, width: "90%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, paddingBottom: 20, borderBottom: "2px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, fontSize: 32, color: "#0f172a", fontWeight: 800 }}>👤 {selectedStaffForStats} さんの稼働詳細</h3>
              <button onClick={() => setSelectedStaffForStats(null)} className="btn-hover" style={{ background: "#f1f5f9", border: "none", width: 56, height: 56, borderRadius: "50%", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 28 }}>✖</button>
            </div>
            
            {days.every(d => d.isPublicHoliday) ? (
              <p style={{ textAlign: "center", color: "#64748b", fontSize: 26 }}>今週はすべて休診日です。</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 26 }}>
                <thead>
                  <tr style={{ borderBottom: "3px solid #e2e8f0" }}>
                    <th style={{ padding: "16px 12px", textAlign: "left", color: "#475569" }}>日付</th>
                    <th style={{ padding: "16px 12px", textAlign: "left", color: "#475569" }}>業務担当</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map(d => {
                    if (d.isPublicHoliday) return null;
                    const assigns: string[] = [];
                    Object.entries(d.cells).forEach(([sec, val]) => {
                      if(["明け","入り","土日休日代休","不在","待機","昼当番","受付","受付ヘルプ"].includes(sec)) return;
                      const members = split(val as string);
                      const myAssign = members.find(m => getCoreName(m) === selectedStaffForStats);
                      if (myAssign) {
                         const timeStr = myAssign.substring(selectedStaffForStats.length);
                         assigns.push(`${sec}${timeStr}`);
                      }
                    });
                    
                    return (
                      <tr key={d.id} style={{ borderBottom: "2px solid #f1f5f9" }}>
                        <td style={{ padding: "20px 12px", fontWeight: 600, color: "#334155", verticalAlign: "top", width: "40%" }}>{d.label}</td>
                        <td style={{ padding: "20px 12px", color: assigns.length > 0 ? "#0ea5e9" : "#94a3b8", fontWeight: 700 }}>
                          {assigns.length > 0 ? assigns.join(" / ") : "なし（または休務）"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <button className="btn-hover" onClick={() => setSelectedStaffForStats(null)} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "20px 48px", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: 26 }}>閉じる</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
