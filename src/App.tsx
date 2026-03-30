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
  .rule-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; align-items: center; width: 100%; background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
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
      if (iriMembers.length > 0) this.log(`[前日処理] 昨日の「入り」メンバーを「明け」に配置しました`);
    }
    if (this.day.isPublicHoliday) { this.log(`🎌 祝日（休診日）のためスキップしました`); return { ...this.day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])), logInfo: this.logInfo }; }

    // 【通常割当】全員リセット
    if (!this.isSmartFix) {
      ROOM_SECTIONS.forEach(sec => { this.dayCells[sec] = join(split(this.dayCells[sec]).filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); });
      this.dayCells["昼当番"] = ""; this.dayCells["受付ヘルプ"] = ""; this.dayCells["待機"] = "";
    }

    this.buildBlockMap();
    
    // 【欠員補充】: 休みになった人を現在の配置から除外し、その分だけ穴を空ける
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
        if (current.length !== next.length) { this.dayCells[sec] = join(next); this.log(`🔄 [欠員除外] ${sec} から不在となった担当者を除外しました`); }
      });
    }

    this.applyDailyAdditions(); this.evaluateEmergencies(); this.initCounts(); this.cleanUpDayCells();
    this.prepareAvailability();

    // ★ 改善点：欠員補充モード時の超シンプル割付
    if (this.isSmartFix) {
      this.log(`⚠️ 欠員補充モード：現在の配置を維持し、空き枠にのみフリーのスタッフを補充します`);
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
            this.log(`✅ [ピンポイント補充] ${room} の空き枠に ${freeStaff}${tag} を補充しました`);
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
        const timeTag = rule.time === "全日" || !rule.time ? "" : rule.time; const placeholderName = rule.section + "枠" + timeTag;
        let current = split(this.dayCells[rule.section]);
        if (!current.includes(placeholderName)) {
           for (let i = 0; i < rule.count; i++) current.push(placeholderName);
           this.dayCells[rule.section] = join(current); this.log(`📈 [増枠] 特別ルールにより、${rule.section} に ${rule.count}枠 追加しました`);
        }
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
    this.ctx.allStaff.forEach((s: string) => { if(this.assignCounts[s] === undefined) this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.counts[s] = 0; this.roomCounts[s] = {}; SECTIONS.forEach((sec: string) => this.roomCounts[s][sec] = 0); });
    this.pastDays.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return; split(val as string).forEach((m: string) => { const c = extractStaffName(m); if (this.counts[c] !== undefined) { this.counts[c]++; this.roomCounts[c][sec] = (this.roomCounts[c][sec] || 0) + 1; } }); }); });
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
         if (needTag && b === 'NONE') return { hard: true, msg: "半端枠への終日スタッフ割当禁止(連鎖防止)" };
         if (b === 'ALL') return { hard: true, msg: "全日ブロック" };
         if (needTag === "(AM)" && b === 'AM') return { hard: true, msg: "AMブロック" };
         if (needTag === "(PM)" && b === 'PM') return { hard: true, msg: "PMブロック" };
         if (fullDayOnlyList.includes(section) && b !== 'NONE') return { hard: true, msg: "終日専任室だが半休" };
         if (this.hasNGPair(name, current.map(extractStaffName), false)) return { hard: true, msg: "絶対NGペア" };
         if (this.hasNGPair(name, current.map(extractStaffName), true)) return { hard: false, msg: "なるべくNGペア" };
         return null; 
      };

      const candidatesWithReason = availList.map(name => ({ name, reason: getFilterReason(name) }));
      let validNames = candidatesWithReason.filter(c => !c.reason).map(c => c.name);
      
      let fallbackMsg = "";
      if (validNames.length === 0) {
          const softCandidates = candidatesWithReason.filter(c => c.reason && !c.reason.hard);
          if (softCandidates.length > 0) {
              validNames = softCandidates.map(c => c.name); fallbackMsg = `（⚠️ 回避のため特例選出）`;
          } else { break; }
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
             if (prevDayMembers.includes(a)) scoreA -= 500;
             if (prevDayMembers.includes(b)) scoreB -= 500;
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
    const availAll = this.initialAvailAll; const availGeneral = this.initialAvailGeneral; const availReception = this.initialAvailReception; const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "");
    
    (this.ctx.customRules.fixed || []).forEach((rule: any) => { if (!rule.staff || !rule.section) return; Object.keys(this.dayCells).forEach(sec => { if (sec === rule.section) return; if (REST_SECTIONS.includes(sec)) return; const before = split(this.dayCells[sec]); const after = before.filter(m => extractStaffName(m) !== rule.staff); if (before.length !== after.length) { this.dayCells[sec] = join(after); this.assignCounts[rule.staff] = 0; this.blockMap.set(rule.staff, 'NONE'); } }); });
    (this.ctx.customRules.fixed || []).forEach((rule: any) => { if (!rule.staff || !rule.section || !availAll.includes(rule.staff) || this.isUsed(rule.staff) || this.isForbidden(rule.staff, rule.section)) return; if (this.skipSections.includes(rule.section)) return; const current = split(this.dayCells[rule.section]); if (current.map(extractStaffName).includes(rule.staff) || this.hasNGPair(rule.staff, current.map(extractStaffName), false)) return; const b = this.blockMap.get(rule.staff); let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); } else { this.blockMap.set(rule.staff, 'ALL'); } this.dayCells[rule.section] = join([...current, `${rule.staff}${tag}`]); this.addU(rule.staff, f); this.log(`🔒 [専従] ${rule.staff} を ${rule.section} に固定配置しました`); });

    Object.values(this.roleAssignments).forEach((ra: any) => { if (this.skipSections.includes(ra.section)) return; const candidates = split(this.ctx.monthlyAssign[ra.role] || ""); const targetAvail = ["受付"].includes(ra.role) ? availReception : availGeneral; const staff = candidates.find(s => targetAvail.includes(s) && !this.isUsed(s) && !this.isForbidden(s, ra.section)); if (staff && !split(this.dayCells[ra.section]).map(extractStaffName).includes(staff)) { const b = this.blockMap.get(staff); let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(staff, 'ALL'); } else { this.blockMap.set(staff, 'ALL'); } this.dayCells[ra.section] = join([...split(this.dayCells[ra.section]), `${staff}${tag}`]); this.addU(staff, f); this.log(`📌 [緊急役割] ${staff} を ${ra.section} に配置しました`); } });

    (this.ctx.customRules.substitutes || []).forEach((sub: any) => { 
      const targets = split(sub.target); if (targets.length === 0 || this.skipSections.includes(sub.section)) return; 
      const currentSec = split(this.dayCells[sub.section]).map(extractStaffName);
      if (targets.some(t => currentSec.includes(t))) return;
      
      const trigger = targets.every(t => !availAll.includes(t) || this.isUsed(t)); 
      if (trigger) { const fallbackStaff = split(sub.subs).filter(s => availGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, sub.section)); if (fallbackStaff.length > 0) { const currentSec = split(this.dayCells[sub.section]); for (const f of fallbackStaff) { if (fullDayOnlyList.includes(sub.section) && this.blockMap.get(f) !== 'NONE') continue; if (!this.hasNGPair(f, currentSec.map(extractStaffName), false) && currentSec.length < 6) { const b = this.blockMap.get(f); let tag = ""; let fr = 1; if (b === 'AM') { tag = "(PM)"; fr = 0.5; this.blockMap.set(f, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; fr = 0.5; this.blockMap.set(f, 'ALL'); } else { this.blockMap.set(f, 'ALL'); } this.dayCells[sub.section] = join([...currentSec, `${f}${tag}`]); this.addU(f, fr); this.log(`🔄 [代打] ${sub.target} が不在のため、${f} を ${sub.section} に配置しました`); break; } } } } 
    });

    (this.ctx.customRules.pushOuts || []).forEach((po: any) => { 
      const s1 = po.s1 || po.triggerStaff; const s2 = po.s2 || po.targetStaff; const tSec = po.triggerSection; 
      if (!s1 || !s2 || !tSec || !po.targetSections) return; 
      if (availGeneral.includes(s1) && availGeneral.includes(s2)) { 
        const currentTSec = split(this.dayCells[tSec]).map(extractStaffName);
        const s1In = currentTSec.includes(s1) || isMonthlyMainStaff(tSec, s1, this.ctx.monthlyAssign); 
        const s2In = currentTSec.includes(s2) || isMonthlyMainStaff(tSec, s2, this.ctx.monthlyAssign); 
        if (s1In && s2In) { 
          const allowedRooms = split(po.targetSections).filter(s => !this.skipSections.includes(s)); 
          for (const room of allowedRooms) { 
            if (this.isForbidden(s2, room)) continue; 
            if (fullDayOnlyList.includes(room) && this.blockMap.get(s2) !== 'NONE') continue; 
            const currentRoom = split(this.dayCells[room]); 
            if (this.hasNGPair(s2, currentRoom.map(extractStaffName), false)) continue; 
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
          });
        }
        this.dayCells["受付"] = join(currentUketsuke);
      } else {
        let preferredList: string[] = [];
        if (["治療", "RI", "CT", "MRI", "MMG"].includes(room)) { preferredList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign).filter((s: string) => availGeneral.includes(s)); } else if (this.ctx.monthlyAssign[room]) { preferredList = split(this.ctx.monthlyAssign[room]).filter((s: string) => availGeneral.includes(s)); }
        let candidates = availGeneral;
        const strictRooms = ["治療", "RI", "MMG"];
        if (strictRooms.includes(room)) { candidates = preferredList.length > 0 ? preferredList : availGeneral; }
        
        if (!linkedTargetRooms.includes(room)) { this.fill(candidates, room, preferredList, targetCount); } 
        else { this.log(`⏭️ [専任スキップ] ${room} は基本兼務ルール対象のため、専任スタッフ割当をスキップしました`); }
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
          if (isFixedToSource) continue;
          if (targetCores.includes(core)) continue; if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) continue; if (this.isForbidden(core, targetRoom)) continue;
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
      currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
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
               if (curAm < targetCap && curPm >= targetCap) { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; } 
               else if (curAm >= targetCap && curPm < targetCap) { if (m.includes("(AM)")) return; pushStr = `${core}(PM)`; }
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
                  if (!m.includes("17:00") && !m.includes("19:00") && !m.includes("22:00")) candidates.push({ core, fullStr: m, srcIdx: idx });
               }
            });
         });

         const currentCores = currentMems.map(extractStaffName); 
         candidates = candidates.filter(c => !currentCores.includes(c.core));
         candidates.sort((a, b) => { 
             const aRooms = this.getTodayRoomCount(a.core); const bRooms = this.getTodayRoomCount(b.core);
             if (aRooms !== bRooms) return aRooms - bRooms;
             if (a.srcIdx !== b.srcIdx) return a.srcIdx - b.srcIdx;
             if ((this.assignCounts[a.core] || 0) !== (this.assignCounts[b.core] || 0)) return (this.assignCounts[a.core] || 0) - (this.assignCounts[b.core] || 0); 
             return (this.counts[a.core] || 0) - (this.counts[b.core] || 0); 
         });
         
         for (const cand of candidates) {
            if (curAm >= targetCap && curPm >= targetCap) break;
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
      this.log(`🍱 [昼当番] 計 ${current
