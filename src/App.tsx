import React, { useEffect, useMemo, useState, useRef } from "react";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  
  html, body, #root { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
  body { background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.02em; font-size: 26px; overflow-x: clip; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  textarea:focus, select:focus, input:focus { outline: 3px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  
  select { 
    appearance: none; 
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); 
    background-repeat: no-repeat; background-position: right 16px center; background-size: 1.8em; 
    text-overflow: ellipsis; white-space: nowrap; overflow: hidden; padding-right: 64px !important; 
  }
  
  details > summary { list-style: none; cursor: pointer; transition: color 0.2s; outline: none; }
  details > summary:hover { color: #0d9488; }
  details > summary::-webkit-details-marker { display: none; }
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
  
  .sticky-table-header th { position: sticky; top: 0; z-index: 20; background: #f8fafc; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .sticky-header-panel { position: sticky; top: 0; z-index: 30; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); padding: 20px; box-shadow: 0 10px 10px -10px rgba(0,0,0,0.05); }

  .calendar-row { transition: background-color 0.2s; cursor: pointer; }
  .calendar-row:hover { background-color: #f1f5f9 !important; }
  .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .btn-hover:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: 0 6px 12px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important; }
  .btn-hover:active { transform: translateY(0); box-shadow: none !important; }
  .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; cursor: pointer; }
  .card-hover:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
  .rule-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; align-items: center; width: 100%; }
  .rule-sel { padding: 14px 44px 14px 18px; border-radius: 10px; border: 2px solid #cbd5e1; font-weight: 600; flex: 1 1 160px; min-width: 160px; font-size: 24px; transition: border-color 0.2s; }
  .rule-num { width: 100px; padding: 14px; border-radius: 10px; border: 2px solid #cbd5e1; font-weight: 600; font-size: 24px; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 32px; flex-shrink: 0; padding: 0 12px; transition: 0.2s; }
  .rule-del:hover { background: #fee2e2; border-radius: 6px; }
  .rule-add { background: #fff; color: #4f46e5; border: 3px dashed #a5b4fc; padding: 16px 24px; font-size: 26px; width: 100%; display: flex; justify-content: center; font-weight: bold; border-radius: 10px; cursor: pointer; margin-top: 16px; transition: all 0.2s; }
  .rule-add:hover { background: #e0e7ff; border-color: #4f46e5; }
  .rule-label { font-size: 26px; font-weight: 700; color: #64748b; flex-shrink: 0; }
  
  .tabs-header { display: flex; gap: 12px; border-bottom: 4px solid #e2e8f0; margin-bottom: 32px; padding: 0 16px; flex-wrap: wrap; }
  .tab-btn { background: none; border: none; padding: 16px 36px; font-size: 28px; font-weight: 800; color: #64748b; cursor: pointer; border-bottom: 5px solid transparent; margin-bottom: -4px; transition: 0.2s; }
  .tab-btn:hover { color: #3b82f6; }
  .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }

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

type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
type RejectReason = { hard: boolean, msg: string };

interface CustomRules {
  staffList: string; receptionStaffList: string; supportStaffList: string; supportTargetRooms: string; customHolidays: string;
  capacity: Record<string, number>; dailyCapacities: any[]; dailyAdditions: any[]; priorityRooms: string[]; fullDayOnlyRooms: string; noConsecutiveRooms: string; 
  consecutiveAlertRooms: string;
  noLateShiftStaff: string; ngPairs: any[]; fixed: any[]; forbidden: any[]; substitutes: any[]; pushOuts: any[]; emergencies: any[]; kenmuPairs: any[]; rescueRules: any[]; lateShifts: any[];
  helpThreshold: number; lunchBaseCount: number; lunchSpecialDays: any[]; lunchConditional: any[]; lunchPrioritySections: string; lunchLastResortSections: string; linkedRooms: any[]; 
  alertMaxKenmu: number; alertEmptyRooms: string;
}

type AutoAssignContext = { allStaff: string[]; activeGeneralStaff: string[]; activeReceptionStaff: string[]; monthlyAssign: Record<string, string>; customRules: CustomRules; };

const SECTIONS = ["明け","入り","土日休日代休","不在","待機","CT","MRI","RI","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","治療","検像","昼当番","受付","受付ヘルプ"];
const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
const WORK_SECTIONS = SECTIONS.filter(s => !REST_SECTIONS.includes(s));
const ROLE_PLACEHOLDERS = ROOM_SECTIONS.map(s => s + "枠");
const GENERAL_ROOMS = ["1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA", "検像"];

const FALLBACK_HOLIDAYS: Record<string, string> = { "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日", "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日" };

const MONTHLY_CATEGORIES = [
  { key: "CT", label: "CT" }, { key: "MRI", label: "MRI" }, { key: "治療", label: "治療 (メイン)" }, { key: "治療サブ優先", label: "治療 (サブ優先)" },
  { key: "治療サブ", label: "治療 (サブ)" }, { key: "RI", label: "RI (メイン)" }, { key: "RIサブ", label: "RI (サブ)" }, { key: "MMG", label: "MMG" }, { key: "受付", label: "受付" }, { key: "受付ヘルプ", label: "受付ヘルプ" }
];

const DEFAULT_MONTHLY_ASSIGN: Record<string, string> = { CT: "", MRI: "", 治療: "", 治療サブ優先: "", 治療サブ: "", RI: "", RIサブ: "", MMG: "", 受付: "", 受付ヘルプ: "" };
const DEFAULT_PRIORITY_ROOMS = ["治療", "受付", "MMG", "RI", "MRI", "CT", "透視（6号）", "透視（11号）", "1号室", "5号室", "2号室", "骨塩", "ポータブル", "DSA", "検像", "パノラマCT", "3号室", "受付ヘルプ", "透析後胸部"];

const DEFAULT_RULES: CustomRules = { 
  staffList: "", receptionStaffList: "", supportStaffList: "", supportTargetRooms: "1号室, 2号室, 5号室, パノラマCT", customHolidays: "", 
  capacity: { CT: 4, MRI: 3, 治療: 3, RI: 1, MMG: 1, "透視（6号）": 1, "透視（11号）": 1, 骨塩: 1, "1号室": 1, "5号室": 1, パノラマCT: 2 }, 
  dailyCapacities: [], dailyAdditions: [], priorityRooms: DEFAULT_PRIORITY_ROOMS, fullDayOnlyRooms: "", noConsecutiveRooms: "ポータブル", consecutiveAlertRooms: "ポータブル, 透視（6号）",
  noLateShiftStaff: "浅野、木内康、髙橋", ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], kenmuPairs: [], rescueRules: [], lateShifts: [], 
  helpThreshold: 24, lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], 
  lunchPrioritySections: "RI, 1号室, 2号室, 3号室, 5号室", lunchLastResortSections: "治療", linkedRooms: [], alertMaxKenmu: 3, alertEmptyRooms: ""
};

const KEY_ALL_DAYS = "shifto_alldays_v231"; const KEY_MONTHLY = "shifto_monthly_v231"; const KEY_RULES = "shifto_rules_v231";
const pad = (n: number) => String(n).padStart(2, '0');

const TIME_OPTIONS: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h = 8; h <= 19; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 8 && m === 0) continue; 
    TIME_OPTIONS.push(`(${h}:${pad(m)}〜)`); TIME_OPTIONS.push(`(〜${h}:${pad(m)})`);
  }
}

const split = (v: string) => (v || "").split(/[、,\n]+/).map((s: string) => s.trim()).filter(Boolean);
const join = (a: string[]) => a.filter(Boolean).join("、");
const extractStaffName = (fullName: string) => fullName.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();

function parseAndSortStaff(staffString: string) {
  const list = split(staffString);
  const parsed = list.map(s => {
    const match = s.match(/^(.*?)[\(（](.*?)[\)）]$/);
    return { cleanName: match ? match[1].trim() : s, yomi: match ? match[2].trim() : s };
  });
  parsed.sort((a, b) => a.yomi.localeCompare(b.yomi, 'ja'));
  return Array.from(new Set(parsed.map(p => p.cleanName)));
}

function formatDayForDisplay(d: Date) {
  const YOUBI = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`;
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

const btnStyle = (bg: string, color: string = "#fff"): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: "12px", padding: "16px 24px", cursor: "pointer", fontWeight: 800, fontSize: 24, whiteSpace: "nowrap", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 });
const panelStyle = (): React.CSSProperties => ({ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "40px", boxShadow: "0 6px 12px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" });
const cellStyle = (isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties => { 
  let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff");
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff"); 
  return { border: "1px solid #e2e8f0", padding: "24px", background: bg, fontWeight: isHeader ? 800 : 600, textAlign: isHeader ? "center" : "left", fontSize: 26, minWidth: isHeader && !isSticky ? "200px" : "auto", color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, boxShadow: isSticky ? "3px 0 6px -2px rgba(0,0,0,0.05)" : "none", transition: "background-color 0.2s" }; 
};

const RENDER_GROUPS: { title: string; color: string; sections: string[] }[] = [
  { title: "休務・夜勤", color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] },
  { title: "モダリティ", color: "#3b82f6", sections: ["CT","MRI","RI","治療"] },
  { title: "一般撮影・透視・その他", color: "#10b981", sections: ["MMG","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","検像","受付","受付ヘルプ","昼当番"] },
  { title: "待機・その他", color: "#f59e0b", sections: ["待機"] } 
];

// ===================== 🌟 UI コンポーネント =====================
const MultiPicker = ({ selected, onChange, options, placeholder }: any) => {
  const current = split(selected);
  const handleAdd = (val: string) => { if (val && !current.includes(val)) onChange(join([...current, val])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, marginBottom: 12 }}>
      {current.map((item, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 24, padding: "14px 24px", fontSize: 24, fontWeight: 800, border: "2px solid #bae6fd", display: "flex", alignItems: "center", gap: 10 }}>
          <span>{item}</span><span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" onChange={(e: any) => { handleAdd(e.target.value); e.target.value = ""; }} value=""><option value="">{placeholder || "＋追加"}</option>{options.filter((s: string) => !current.includes(s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</select>
    </div>
  );
};

const WeekCalendarPicker = ({ targetMonday, onChange, nationalHolidays, customHolidays }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(targetMonday));
  useEffect(() => { setViewDate(new Date(targetMonday)); }, [targetMonday]);
  const year = viewDate.getFullYear(); const month = viewDate.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = new Array(7).fill(null);
  for (let i = 0; i < firstDay; i++) currentWeek[i] = null;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = (firstDay + d - 1) % 7; currentWeek[dayOfWeek] = d;
    if (dayOfWeek === 6 || d === daysInMonth) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); }
  }
  const handleWeekClick = (weekObj: (number|null)[]) => {
    let validDay = weekObj.find(d => d !== null); if (!validDay) return;
    const dObj = new Date(year, month - 1, validDay, 12, 0, 0); 
    const day = dObj.getDay(); const diff = dObj.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(dObj.getTime()); mon.setDate(diff);
    onChange(`${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`);
    setIsOpen(false);
  };
  return (
    <div style={{ position: "relative" }}>
      <button className="btn-hover" onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff", "#2563eb"), border: "2px solid #bfdbfe", padding: "14px 20px", fontSize: 24 }}>📅 {targetMonday} 週 ▼</button>
      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)}></div>
          <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "2px solid #cbd5e1", borderRadius: 20, padding: 32, zIndex: 50, boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.15)", minWidth: 460 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={() => setViewDate(new Date(year, month - 2, 1))} style={{ border: "none", background: "#f1f5f9", borderRadius: 10, padding: "14px 24px", cursor: "pointer", fontSize: 24 }}>◀</button>
              <div style={{ fontWeight: 800, fontSize: 28 }}>{year}年 {month}月</div>
              <button onClick={() => setViewDate(new Date(year, month, 1))} style={{ border: "none", background: "#f1f5f9", borderRadius: 10, padding: "14px 24px", cursor: "pointer", fontSize: 24 }}>▶</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: 26 }}>
              <thead><tr><th style={{ color: "#ef4444", padding: 16 }}>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th style={{ color: "#3b82f6", padding: 16 }}>土</th></tr></thead>
              <tbody>
                {weeks.map((w, wIdx) => {
                  const isSelectedWeek = w.some(d => { if(!d) return false; const dObj = new Date(year, month - 1, d, 12, 0, 0); const day = dObj.getDay(); const diff = dObj.getDate() - day + (day === 0 ? -6 : 1); const checkMon = new Date(dObj.getTime()); checkMon.setDate(diff); return `${checkMon.getFullYear()}-${pad(checkMon.getMonth()+1)}-${pad(checkMon.getDate())}` === targetMonday; });
                  return (
                    <tr key={wIdx} onClick={() => handleWeekClick(w)} className="calendar-row" style={{ background: isSelectedWeek ? "#eff6ff" : "transparent" }}>
                      {w.map((d, dIdx) => {
                        if (!d) return <td key={dIdx} style={{ padding: 20 }}></td>;
                        const isHoliday = !!(nationalHolidays[`${year}-${pad(month)}-${pad(d)}`] || customHolidays.includes(`${year}-${pad(month)}-${pad(d)}`));
                        let color = "#334155"; if (dIdx === 0 || isHoliday) color = "#ef4444"; else if (dIdx === 6) color = "#3b82f6";
                        return <td key={dIdx} style={{ padding: 20, color, fontWeight: isHoliday ? 800 : 600, position: "relative" }}>{d}{isHoliday && <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, background: "#ef4444", borderRadius: "50%" }}></div>}</td>;
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
    <div className="card-hover" style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
      <label style={{ fontSize: 28, fontWeight: 800, color: "#475569", marginBottom: 16 }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {members.map((m, i) => {
          const coreName = extractStaffName(m); const currentMod = m.substring(coreName.length);
          const isPlaceholder = ROLE_PLACEHOLDERS.includes(coreName) || (customOptions.includes(coreName) && !activeStaff.includes(coreName));
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime && !isFuzai ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime && !isFuzai ? "#334155" : "#0369a1"), borderRadius: 20, padding: "14px 20px 14px 22px", fontSize: 24, display: "flex", alignItems: "center", gap: 10, border: `2px solid ${isPlaceholder ? "#fde047" : (noTime && !isFuzai ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 800 }}>
              <span>{coreName}</span>
              {(!noTime || isFuzai) && (
                <select value={currentMod} onChange={(e: any) => handleTimeChange(i, e.target.value)} style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 24, fontWeight: 800, color: "inherit", cursor: "pointer", padding: "0 28px 0 8px" }}>
                  {isFuzai ? <><option value="">全休</option><option value="(AM)">AM休</option><option value="(PM)">PM休</option></> : isTaiki ? <><option value="(17:00〜19:00)">17:00〜19:00</option><option value="(17:00〜22:00)">17:00〜22:00</option><option value="(17:00〜)">17:00〜</option></> : <><option value="">終日</option><option value="(AM)">AM</option><option value="(PM)">PM</option>{currentMod && !["", "(AM)", "(PM)"].includes(currentMod) && !TIME_OPTIONS.includes(currentMod) && (<option value={currentMod}>{currentMod.replace(/[()]/g, '')}</option>)}{TIME_OPTIONS.filter(t => t !== "(AM)" && t !== "(PM)").map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</>}
                </select>
              )}
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 10 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e: any) => handleAdd(e.target.value)} value="" style={{ border: "2px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 24, color: "#64748b", flex: 1, minWidth: 160, cursor: "pointer", fontWeight: 700, borderRadius: 12, padding: "14px 36px 14px 20px" }}>
          <option value="">＋追加</option>
          <optgroup label="スタッフ">{activeStaff.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>
          {customOptions.length > 0 && <optgroup label="担当枠（未定）">{customOptions.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>}
        </select>
      </div>
    </div>
  );
};

// ===================== 🌟 自動割付ロジック =====================
class AutoAssigner {
  day: DayData; prevDay: DayData | null; pastDays: DayData[]; ctx: AutoAssignContext; isSmartFix: boolean;
  dayCells: Record<string, string>; blockMap: Map<string, string> = new Map();
  skipSections: string[] = []; clearSections: string[] = []; roleAssignments: Record<string, any> = {}; currentKenmu: any[] = [];
  dynamicCapacity: Record<string, number> = {}; assignCounts: Record<string, number> = {}; maxAssigns: Record<string, number> = {}; counts: Record<string, number> = {}; roomCounts: Record<string, Record<string, number>> = {};
  initialAvailAll: string[] = []; initialAvailGeneral: string[] = []; initialAvailSupport: string[] = []; initialAvailReception: string[] = [];
  logInfo: string[] = [];
  
  private log(msg: string) { this.logInfo.push(`・${msg}`); }

  getTodayRoomCount(staff: string) {
    let count = 0; Object.keys(this.dayCells).forEach(sec => { if (REST_SECTIONS.includes(sec) || ["待機", "昼当番", "受付", "受付ヘルプ"].includes(sec)) return; if (split(this.dayCells[sec]).map(extractStaffName).includes(staff)) count++; }); return count;
  }

  constructor(day: DayData, prevDay: DayData | null, pastDays: DayData[], ctx: AutoAssignContext, isSmartFix: boolean = false) {
    this.day = { ...day }; this.prevDay = prevDay; this.pastDays = pastDays; this.ctx = ctx; this.dayCells = { ...day.cells }; this.dynamicCapacity = { ...(ctx.customRules.capacity || {}) }; this.isSmartFix = isSmartFix;
  }

  execute(): DayData {
    if (this.prevDay && this.prevDay.cells["入り"]) {
      const iriMembers = split(this.prevDay.cells["入り"]).map(extractStaffName);
      this.dayCells["明け"] = join(Array.from(new Set([...split(this.dayCells["明け"]), ...iriMembers])));
    }
    if (this.day.isPublicHoliday) { return { ...this.day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])), logInfo: this.logInfo }; }

    if (!this.isSmartFix) {
      ROOM_SECTIONS.forEach(sec => { this.dayCells[sec] = join(split(this.dayCells[sec]).filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); });
      this.dayCells["昼当番"] = ""; this.dayCells["受付ヘルプ"] = ""; this.dayCells["待機"] = "";
    }

    this.buildBlockMap();
    
    if (this.isSmartFix) {
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
        this.dayCells[sec] = join(next);
      });
    }

    this.applyDailyAdditions(); this.evaluateEmergencies(); this.initCounts(); this.cleanUpDayCells();
    this.prepareAvailability();

    if (this.isSmartFix) {
      const priority = this.ctx.customRules.priorityRooms || SECTIONS;
      priority.forEach((room: string) => {
         if (REST_SECTIONS.includes(room) || ["昼当番","受付ヘルプ","待機"].includes(room)) return;
         if ((this.ctx.customRules.linkedRooms || []).some((r:any) => r.target === room)) return; 
         const cap = this.dynamicCapacity[room] || 1;
         let current = split(this.dayCells[room]);
         const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
         while (getAmt(current) < cap) {
            const freeStaff = this.initialAvailGeneral.find(s => !this.isUsed(s) && !this.isForbidden(s, room));
            if (!freeStaff) break; 
            const block = this.blockMap.get(freeStaff);
            let tag = ""; let p = 1;
            if (block === 'AM') { tag = "(PM)"; p = 0.5; } else if (block === 'PM') { tag = "(AM)"; p = 0.5; }
            current.push(`${freeStaff}${tag}`); this.addU(freeStaff, p);
            this.log(`✅ [欠員補充] ${room} に ${freeStaff}${tag} を配置`);
         }
         this.dayCells[room] = join(current);
      });
    } else {
      this.assignRooms(); 
    }

    this.processPostTasks();
    return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
  }

  buildBlockMap() {
    this.ctx.allStaff.forEach((s: string) => this.blockMap.set(s, 'NONE'));
    ["明け","入り","土日休日代休"].forEach((sec: string) => { split(this.dayCells[sec]).forEach((m: string) => this.blockMap.set(extractStaffName(m), 'ALL')); });
    split(this.dayCells["不在"]).forEach((m: string) => {
      const core = extractStaffName(m);
      if (m.includes("(AM)")) this.blockMap.set(core, 'AM'); else if (m.includes("(PM)")) this.blockMap.set(core, 'PM'); else this.blockMap.set(core, 'ALL');
    });
    WORK_SECTIONS.forEach(sec => {
      split(this.dayCells[sec]).forEach((m: string) => {
        const core = extractStaffName(m);
        if (!ROLE_PLACEHOLDERS.includes(core) && this.blockMap.get(core) !== 'ALL') this.addU(core, getStaffAmount(m));
      });
    });
  }

  applyDailyAdditions() {
    (this.ctx.customRules.dailyAdditions || []).forEach((rule: any) => {
      if (rule.date === this.day.id && rule.section && rule.count > 0) {
        const timeTag = rule.time === "全日" || !rule.time ? "" : rule.time;
        const placeholderName = rule.section + "枠" + timeTag;
        let current = split(this.dayCells[rule.section]);
        if (!current.includes(placeholderName)) {
           for (let i = 0; i < rule.count; i++) current.push(placeholderName);
           this.dayCells[rule.section] = join(current);
        }
      }
    });
  }

  evaluateEmergencies() {
    const tempAvailCount = this.ctx.activeGeneralStaff.filter((s: string) => this.blockMap.get(s) !== 'ALL').length;
    (this.ctx.customRules.emergencies || []).forEach((em: any) => {
      if (tempAvailCount <= Number(em.threshold)) {
        if (em.type === "role_assign" && em.role) { if (!this.roleAssignments[em.role] || em.threshold < this.roleAssignments[em.role].threshold) this.roleAssignments[em.role] = em; }
        if (em.type === "clear" && em.section) { this.skipSections.push(em.section); this.clearSections.push(em.section); }
        if (em.type === "change_capacity" && em.section) { this.dynamicCapacity[em.section] = Number(em.newCapacity ?? 3); }
      }
    });
  }

  initCounts() {
    this.ctx.allStaff.forEach((s: string) => { if(this.assignCounts[s] === undefined) this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.counts[s] = 0; this.roomCounts[s] = {}; SECTIONS.forEach((sec: string) => this.roomCounts[s][sec] = 0); });
    this.pastDays.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return; split(val as string).forEach((m: string) => { const c = extractStaffName(m); if (this.counts[c] !== undefined) { this.counts[c]++; this.roomCounts[c][sec] = (this.roomCounts[c][sec] || 0) + 1; } }); }); });
  }

  cleanUpDayCells() {
    Object.keys(this.dayCells).forEach(sec => {
      if (REST_SECTIONS.includes(sec)) return;
      let members = split(this.dayCells[sec]).map(m => {
        const core = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(core)) return m; const block = this.blockMap.get(core);
        if (block === 'ALL') return null; if (block === 'AM' && m.includes('(AM)')) return null; if (block === 'PM' && m.includes('(PM)')) return null; 
        return m;
      }).filter(Boolean) as string[];
      this.dayCells[sec] = join(members);
    });
  }

  prepareAvailability() {
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "");
    const effectiveReceptionStaff = this.ctx.activeReceptionStaff.length > 0 ? this.ctx.activeReceptionStaff : this.ctx.activeGeneralStaff;
    this.initialAvailAll = this.ctx.allStaff.filter((s: string) => this.blockMap.get(s) !== 'ALL').sort((a: string, b: string) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0) || (this.counts[a] || 0) - (this.counts[b] || 0));
    this.initialAvailSupport = this.initialAvailAll.filter((s: string) => supportStaffList.includes(s));
    this.initialAvailGeneral = this.initialAvailAll.filter((s: string) => this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s));
    this.initialAvailReception = this.initialAvailAll.filter((s: string) => effectiveReceptionStaff.includes(s));
  }

  isUsed(name: string): boolean { return (this.assignCounts[name] || 0) >= (this.maxAssigns[name] || 1); }
  addU(name: string, f = 1): void { this.assignCounts[name] = (this.assignCounts[name] || 0) + f; }
  isForbidden(staff: string, section: string): boolean { return (this.ctx.customRules.forbidden || []).some((rule: any) => rule.staff === staff && split(rule.sections).includes(section)); }
  hasNGPair(candidate: string, members: string[], checkSoft: boolean): boolean { return members.some(member => (this.ctx.customRules.ngPairs || []).some((ng: any) => { const match = (ng.s1 === candidate && ng.s2 === member) || (ng.s1 === member && ng.s2 === candidate); if (!match) return false; return (ng.level || "hard") === "hard" || checkSoft; })); }

  fill(availList: string[], section: string, targetCount: number) {
    if (this.skipSections.includes(section)) return;
    let current = split(this.dayCells[section]);
    const getCurrentAmount = (arr: string[]) => arr.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
    while (getCurrentAmount(current) < targetCount) {
      const remaining = targetCount - getCurrentAmount(current);
      let needTag = "";
      if (remaining === 0.5) {
         const amCount = current.filter(m => m.includes("(AM)")).length;
         const pmCount = current.filter(m => m.includes("(PM)")).length;
         if (amCount > pmCount) needTag = "(PM)"; else if (pmCount > amCount) needTag = "(AM)";
      }
      const candidates = availList.filter(name => {
         if (current.map(extractStaffName).includes(name)) return false;
         if (this.isUsed(name)) return false;
         if (this.isForbidden(name, section)) return false;
         const b = this.blockMap.get(name);
         if (b === 'ALL' || (needTag === "(AM)" && b === 'AM') || (needTag === "(PM)" && b === 'PM')) return false;
         if (this.hasNGPair(name, current.map(extractStaffName), false)) return false;
         return true;
      });
      if (candidates.length === 0) break;
      const core = candidates[0]; const block = this.blockMap.get(core); let tag = ""; let f = 1;
      if (block === 'AM') { tag = "(PM)"; f = 0.5; } else if (block === 'PM') { tag = "(AM)"; f = 0.5; } else if (needTag) { tag = needTag; f = 0.5; }
      current.push(`${core}${tag}`); this.addU(core, f);
    }
    this.dayCells[section] = join(current);
  }

  assignRooms() {
    const PRIORITY_LIST = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
    PRIORITY_LIST.forEach((room: string) => {
      if (this.skipSections.includes(room)) return;
      if (["受付ヘルプ", "昼当番", "待機"].includes(room)) return;
      let targetCount = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
      this.fill(room === "受付" ? this.initialAvailReception : this.initialAvailGeneral, room, targetCount);
    });
  }

  processPostTasks() {
    const supportTargetRooms = split(this.ctx.customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT");
    this.initialAvailSupport.forEach(staff => {
      if (this.isUsed(staff)) return;
      for (const room of supportTargetRooms) {
        if (this.isForbidden(staff, room)) continue;
        let current = split(this.dayCells[room]);
        if (current.length > 0 && !current.map(extractStaffName).includes(staff)) {
           current.push(staff); this.addU(staff, 1);
           this.dayCells[room] = join(current); break;
        }
      }
    });
  }
}

// ===================== 🌟 メインコンポーネント =====================
export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats' | 'rules'>('calendar');
  const [allDays, setAllDays] = useState<Record<string, Record<string, string>>>(() => JSON.parse(localStorage.getItem(KEY_ALL_DAYS) || "{}"));
  const [customRules, setCustomRules] = useState<CustomRules>(() => ({ ...DEFAULT_RULES, ...JSON.parse(localStorage.getItem(KEY_RULES) || "{}") }));
  const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string>>(() => ({ ...DEFAULT_MONTHLY_ASSIGN, ...JSON.parse(localStorage.getItem(KEY_MONTHLY) || "{}") }));
  const [targetMonday, setTargetMonday] = useState(() => {
    const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff));
    return `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`;
  });
  const [sel, setSel] = useState("");
  const [assignLogs, setAssignLogs] = useState<Record<string, string[]>>({});
  const [selectedErrorDay, setSelectedErrorDay] = useState<string | null>(null);
  const [selectedLogDay, setSelectedLogDay] = useState<string | null>(null);
  const [showUnassignedList, setShowUnassignedList] = useState<string | null>(null);
  const [selectedStaffForStats, setSelectedStaffForStats] = useState<string | null>(null);
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
      return { id, label: formatDayForDisplay(curr), isPublicHoliday: !!nationalHolidays[id] || customHolidays.includes(id), holidayName: nationalHolidays[id] || "休診日", cells: allDays[id] || Object.fromEntries(SECTIONS.map(s => [s, ""])) };
    });
  }, [targetMonday, allDays, customHolidays, nationalHolidays]);

  useEffect(() => { if (!sel || !days.find(d => d.id === sel)) setSel(days[0].id); }, [days, sel]);
  const cur = days.find(d => d.id === sel) || days[0];

  const getDailyStats = (dayId: string) => {
    const cells = allDays[dayId] || {}; const absent = new Set<string>();
    REST_SECTIONS.forEach(s => split(cells[s]).forEach(m => absent.add(extractStaffName(m))));
    const working = allStaff.filter(s => !absent.has(s)); const assigned = new Set<string>();
    WORK_SECTIONS.forEach(s => split(cells[s]).forEach(m => assigned.add(extractStaffName(m))));
    return { workingCount: working.length, absentCount: absent.size, unassigned: working.filter(s => !assigned.has(s)) };
  };

  const getDayWarnings = (dayId: string) => {
    const w: any[] = []; const cells = allDays[dayId] || {};
    ROOM_SECTIONS.forEach(room => { if (split(cells[room]).length === 0) w.push({type: 'alert', msg: `【空室】${room}`}); });
    return w;
  };

  const updateDay = (k: string, v: string) => { setAllDays(prev => ({ ...prev, [sel]: { ...(prev[sel] || {}), [k]: v } })); };

  const handleAutoAssign = (isSmart: boolean, isWeekly: boolean) => {
    setAllDays(prev => {
      const nextAll = { ...prev }; const newLogs = { ...assignLogs };
      const ctx = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules };
      const targetDays = isWeekly ? days : [cur];
      targetDays.forEach(day => {
        const worker = new AutoAssigner({ ...day, cells: nextAll[day.id] || day.cells }, null, [], ctx, isSmart);
        const res = worker.execute(); nextAll[day.id] = res.cells; newLogs[day.id] = res.logInfo || [];
      });
      setAssignLogs(newLogs); return nextAll;
    });
  };

  const updateRule = (type: keyof CustomRules, idx: number, key: string, val: any) => { setCustomRules(r => { const arr = [...(r[type] as any[])]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: keyof CustomRules, idx: number) => { setCustomRules(r => { const arr = [...(r[type] as any[])]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };
  const addRule = (type: keyof CustomRules, def: any) => { setCustomRules(r => ({ ...r, [type]: [...(r[type] as any[]), def] })); };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ allDays, monthlyAssign, customRules })], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `backup_${targetMonday}.json`; a.click();
  };

  const handleImport = (e: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (ev: any) => {
      const data = JSON.parse(ev.target.result);
      if (data.allDays) { setAllDays(data.allDays); setMonthlyAssign(data.monthlyAssign); setCustomRules(data.customRules); alert("復元完了"); }
    }; reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: "98%", margin: "0 auto", padding: "40px" }}>
      <style>{globalStyle}</style>
      
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
        <h2 style={{ margin: 0, fontSize: 44, fontWeight: 900 }}>勤務割付システム Ver 2.3</h2>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <button onClick={() => setTargetMonday(p => { const d=new Date(p); d.setDate(d.getDate()-7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={btnStyle("#f1f5f9", "#475569")}>◀ 先週</button>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button onClick={() => setTargetMonday(p => { const d=new Date(p); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={btnStyle("#f1f5f9", "#475569")}>来週 ▶</button>
        </div>
      </div>

      <div className="tabs-header no-print">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 週間予定表</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 月間集計</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>⚙️ 設定・データ入出力</button>
      </div>

      <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
        <div className="print-area" style={{ ...panelStyle(), marginBottom: 40 }}>
          <div className="scroll-container">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1600 }}>
              <thead className="sticky-table-header">
                <tr>
                  <th style={cellStyle(true, false, false, true)}>区分</th>
                  {days.map(day => (
                    <th key={day.id} onClick={() => setSel(day.id)} style={cellStyle(true, day.isPublicHoliday, day.id === sel)}>
                      {day.label}
                      <div onClick={(e) => { e.stopPropagation(); setShowUnassignedList(day.id); }} style={{ fontSize: 18, color: "#64748b", marginTop: 8 }}>
                        未配置: {getDailyStats(day.id).unassigned.length}名
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section, sIdx) => (
                  <tr key={section}>
                    <td style={cellStyle(true, false, false, true, sIdx % 2 === 1)}>{section}</td>
                    {days.map(day => (
                      <td key={day.id + section} style={cellStyle(false, day.isPublicHoliday, day.id === sel, false, sIdx % 2 === 1)}>
                        {split(allDays[day.id]?.[section]).join("、")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="no-print sticky-header-panel" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {days.map(d => <button key={d.id} onClick={() => setSel(d.id)} style={{ padding: "16px 24px", borderRadius: 12, border: "none", background: d.id === sel ? "#2563eb" : "#f1f5f9", color: d.id === sel ? "#fff" : "#64748b", fontWeight: 800 }}>{d.label}</button>)}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => handleAutoAssign(false, false)} style={btnStyle("#10b981")}>✨ 1日自動</button>
            <button onClick={() => handleAutoAssign(false, true)} style={btnStyle("#0ea5e9")}>⚡ 週間自動</button>
            <button onClick={() => handleAutoAssign(true, false)} style={btnStyle("#f59e0b")}>🔄 欠員補充</button>
          </div>
        </div>

        <div className="no-print" style={{ ...panelStyle(), marginTop: 32 }}>
          {RENDER_GROUPS.map(group => (
            <div key={group.title} style={{ marginBottom: 40 }}>
              <h4 style={{ fontSize: 32, borderLeft: `10px solid ${group.color}`, paddingLeft: 16 }}>{group.title}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 24 }}>
                {group.sections.map(s => <SectionEditor key={s} section={s} value={allDays[sel]?.[s] || ""} activeStaff={allStaff} onChange={(v: string) => updateDay(s, v)} noTime={REST_SECTIONS.includes(s)} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="no-print" style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 32, color: "#be185d" }}>🚨 緊急ルール（人数不足時の自動対応）</h3>
          {(customRules.emergencies || []).map((em, idx) => (
            <div key={idx} className="rule-row" style={{ background: "#fff1f2", padding: 20, borderRadius: 12 }}>
              <span className="rule-label">出勤が</span>
              <input type="number" value={em.threshold} onChange={e => updateRule("emergencies", idx, "threshold", Number(e.target.value))} className="rule-num" />
              <span className="rule-label">名以下の時➔</span>
              <select value={em.type} onChange={e => updateRule("emergencies", idx, "type", e.target.value)} className="rule-sel">
                <option value="change_capacity">定員変更</option>
                <option value="clear">空室に設定</option>
              </select>
              <select value={em.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel"><option value="">対象の部屋</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select>
              {em.type === 'change_capacity' && <input type="number" value={em.newCapacity} onChange={e => updateRule("emergencies", idx, "newCapacity", Number(e.target.value))} className="rule-num" />}
              <button onClick={() => removeRule("emergencies", idx)} className="rule-del">✖</button>
            </div>
          ))}
          <button className="rule-add" onClick={() => addRule("emergencies", { threshold: 24, type: "clear", section: "" })}>＋ 緊急ルールを追加</button>
        </div>

        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 32 }}>👥 スタッフ・定員設定</h3>
          <textarea value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} style={{ width: "100%", height: 200, padding: 20, borderRadius: 12 }} placeholder="技師名(よみ)、技師名2..." />
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 24 }}>
            {Object.entries(customRules.capacity || {}).map(([room, count]) => (
              <div key={room} style={{ background: "#f1f5f9", padding: 16, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800 }}>{room}: {count}人</span>
                <input type="number" value={count as number} onChange={e => setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: Number(e.target.value)}})} style={{ width: 60 }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...panelStyle() }}>
          <h3 style={{ fontSize: 32 }}>💾 データ入出力</h3>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <button onClick={handleExport} style={btnStyle("#6366f1")}>💾 ファイル保存</button>
            <button onClick={() => fileInputRef.current?.click()} style={btnStyle("#8b5cf6")}>📂 ファイル読込</button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleImport} />
          </div>
        </div>
      </div>

      {showUnassignedList && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }} onClick={() => setShowUnassignedList(null)}>
          <div style={{ background: "#fff", padding: 48, borderRadius: 24, width: 600 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 32, marginBottom: 20 }}>未配置スタッフ</h3>
            <div style={{ fontSize: 28, color: "#ef4444" }}>{getDailyStats(showUnassignedList).unassigned.join("、") || "なし"}</div>
            <button onClick={() => setShowUnassignedList(null)} style={{ ...btnStyle("#2563eb"), width: "100%", marginTop: 40 }}>閉じる</button>
          </div>
        </div>
      )}

      {selectedErrorDay && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedErrorDay(null)}>
          <div style={{ background: "#fff", padding: 48, borderRadius: 24, width: 600 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 32, marginBottom: 20 }}>注意・警告</h3>
            {getDayWarnings(selectedErrorDay).map((w, i) => <div key={i} style={{ fontSize: 24, marginBottom: 10 }}>{w.msg}</div>)}
            <button onClick={() => setSelectedErrorDay(null)} style={{ ...btnStyle("#2563eb"), width: "100%", marginTop: 40 }}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}
