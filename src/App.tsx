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
type WarningInfo = { level: 'red' | 'orange' | 'yellow'; title: string; msg: string; staff?: string; room?: string; };

interface CustomRules {
  staffList: string; receptionStaffList: string; supportStaffList: string; supportTargetRooms: string; 
  supportTargetRoomsLowImpact: string; supportTargetRoomsHighImpact: string; 
  customHolidays: string; capacity: Record<string, number>; dailyCapacities: any[]; dailyAdditions: any[]; 
  priorityRooms: string[]; fullDayOnlyRooms: string; noConsecutiveRooms: string; consecutiveAlertRooms: string;
  noLateShiftStaff: string; noLateShiftRooms: string; lateShiftLowPriorityStaff: string;
  ngPairs: any[]; fixed: any[]; forbidden: any[]; substitutes: any[]; pushOuts: any[]; emergencies: any[]; swapRules: any[]; 
  kenmuPairs: any[]; rescueRules: any[]; lateShifts: any[]; lunchBaseCount: number; lunchSpecialDays: any[]; lunchConditional: any[]; 
  lunchRoleRules: any[]; lunchPrioritySections: string; lunchLastResortSections: string; linkedRooms: any[];
  alertMaxKenmu: number; alertEmptyRooms: string; smartKenmu: any[];
}
type AutoAssignContext = { allStaff: string[]; activeGeneralStaff: string[]; activeReceptionStaff: string[]; monthlyAssign: Record<string, string>; customRules: CustomRules; };

const SECTIONS = ["明け","入り","土日休日代休","不在","待機","CT","MRI","RI","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","治療","検像","昼当番","受付","受付ヘルプ"];
const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
const WORK_SECTIONS = SECTIONS.filter(s => !REST_SECTIONS.includes(s));
const ROLE_PLACEHOLDERS = ROOM_SECTIONS.map(s => s + "枠");

// デフォルトルール設定（個人情報なし）
const DEFAULT_RULES: CustomRules = { 
  staffList: "", receptionStaffList: "", supportStaffList: "", supportTargetRooms: "2号室, 3号室", 
  supportTargetRoomsLowImpact: "3号室,パノラマCT", 
  supportTargetRoomsHighImpact: "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像", 
  customHolidays: "", 
  capacity: { "CT": 4, "MRI": 3, "治療": 3, "RI": 1, "MMG": 1, "透視（6号）": 1, "透視（11号）": 1, "骨塩": 1, "1号室": 1, "5号室": 1, "パノラマCT": 1 }, 
  dailyCapacities: [], dailyAdditions: [], priorityRooms: [], fullDayOnlyRooms: "", noConsecutiveRooms: "ポータブル", consecutiveAlertRooms: "ポータブル, 透視（6号）", 
  noLateShiftStaff: "", noLateShiftRooms: "透視（11号）", lateShiftLowPriorityStaff: "", ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], 
  swapRules: [], 
  kenmuPairs: [], 
  rescueRules: [], 
  lateShifts: [], lunchBaseCount: 3, lunchSpecialDays: [], lunchConditional: [], lunchRoleRules: [], lunchPrioritySections: "RI, 1号室, 2号室, 3号室, 5号室", lunchLastResortSections: "治療", 
  linkedRooms: [], 
  alertMaxKenmu: 3, alertEmptyRooms: "", smartKenmu: [] 
};

const KEY_ALL_DAYS = "shifto_alldays_v251"; 
const KEY_MONTHLY = "shifto_monthly_v251"; 
const KEY_RULES = "shifto_rules_v251";

const pad = (n: number) => String(n).padStart(2, '0');
const TIME_OPTIONS: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h = 8; h <= 19; h++) { 
  for (let m = 0; m < 60; m += 15) { 
    if (h === 8 && m === 0) continue; 
    TIME_OPTIONS.push(`(${h}:${pad(m)}〜)`); 
    TIME_OPTIONS.push(`(〜${h}:${pad(m)})`); 
  } 
}

const split = (v: string) => (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean);
const join = (a: string[]) => a.filter(Boolean).join("、");
const extractStaffName = (f: string) => f.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
const parseRoomCond = (str: string) => { const m = str.match(/^(.*?)\((\d+)\)$/); return m ? { r: m[1], min: Number(m[2]) } : { r: str, min: 0 }; };

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
  return getMonthlyStaffForSection(section, monthlyAssign).includes(extractStaffName(name));
}

function getStaffAmount(name: string) {
  if (ROLE_PLACEHOLDERS.includes(extractStaffName(name))) return 0;
  return (name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/)) ? 0.5 : 1;
}

const btnStyle = (bg: string, color: string = "#fff", fontSize: number = 14): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 6 });
const panelStyle = (): React.CSSProperties => ({ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" });
const cellStyle = (isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties => {
  let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff");
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff");
  return { border: "1px solid #e2e8f0", padding: "10px 12px", background: bg, fontWeight: isHeader ? 700 : 600, textAlign: isHeader ? "center" : "left", fontSize: 15, color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, boxShadow: isSticky ? "2px 0 4px -2px rgba(0,0,0,0.05)" : "none", transition: "background-color 0.2s" };
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
        <button className="btn-hover" onClick={onClose} style={{ ...btnStyle("#2563eb", "#fff", 16), width: "100%", justifyContent: "center", padding: "16px" }}>閉じる</button>
      </div>
    </div>
  </div>
);

const RuleCard = ({ bg, border, color, icon, title, desc, children }: any) => (
  <div style={{ background: bg, padding: 24, borderRadius: 12, border: `2px solid ${border}`, marginBottom: 20 }}>
    <h5 style={{ margin: "0 0 12px 0", color, fontSize: 18, fontWeight: 800 }}>{icon} {title}</h5>
    {desc && <p style={{ fontSize: 14, color: "#166534", marginTop: 0, marginBottom: 16 }}>{desc}</p>}
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
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(targetMonday));
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
  if (category.includes("配置決定") || category.includes("増枠") || category.includes("初期優先度")) { bg = "#eff6ff"; border = "#bfdbfe"; color = "#1e3a8a"; badgeBg = "#dbeafe"; badgeColor = "#1d4ed8"; }
  else if (category.includes("緊急") || category.includes("除外")) { bg = "#fef2f2"; border = "#fecaca"; color = "#7f1d1d"; badgeBg = "#fee2e2"; badgeColor = "#b91c1c"; }
  else if (category.includes("救済発動") || category.includes("特例サポート") || category.includes("救済") || category.includes("汎用救済")) { bg = "#fff7ed"; border = "#fed7aa"; color = "#9a3412"; badgeBg = "#ffedd5"; badgeColor = "#c2410c"; }
  else if (category.includes("代打") || category.includes("交換")) { bg = "#fff7ed"; border = "#fed7aa"; color = "#7c2d12"; badgeBg = "#ffedd5"; badgeColor = "#c2410c"; }
  else if (category.includes("兼務") || category.includes("専任スキップ") || category.includes("負担軽減") || category.includes("スマート兼務")) { bg = "#ecfdf5"; border = "#a7f3d0"; color = "#064e3b"; badgeBg = "#d1fae5"; badgeColor = "#047857"; }
  else if (category.includes("遅番")) { bg = "#f5f3ff"; border = "#ddd6fe"; color = "#4c1d95"; badgeBg = "#ede9fe"; badgeColor = "#6d28d9"; }
  else if (category.includes("玉突き")) { bg = "#e0f2fe"; border = "#bae6fd"; color = "#0c4a6e"; badgeBg = "#bae6fd"; badgeColor = "#0369a1"; }
  else if (category.includes("専従") || category.includes("役割")) { bg = "#f0fdfa"; border = "#bbf7d0"; color = "#14532d"; badgeBg = "#dcfce7"; badgeColor = "#15803d"; }
  else if (category.includes("昼当番") || category.includes("ヘルプ") || category.includes("サポート") || category.includes("余剰")) { bg = "#fdf4ff"; border = "#f5d0fe"; color = "#701a75"; badgeBg = "#fae8ff"; badgeColor = "#86198f"; }
  else if (category.includes("低影響補充")) { bg = "#f0fdfa"; border = "#ccfbf1"; color = "#0f766e"; badgeBg = "#ccfbf1"; badgeColor = "#0f766e"; }
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
        let next = current.filter(m => { const core = extractStaffName(m); const block = this.blockMap.get(core); if (ROLE_PLACEHOLDERS.includes(core)) return true; if (block === 'ALL') return false; if (block === 'AM' && (!m.includes("(") || m.includes("(AM)"))) return false; if (block === 'PM' && (!m.includes("(") || m.includes("(PM)"))) return false; return true; });
        if (current.length !== next.length) { this.dayCells[sec] = join(next); this.log(`🔄 [欠員除外] ${sec} から不在となった担当者を除外しました`); }
      });
    }
    this.applyDailyAdditions(); this.evaluateEmergencies(); this.cleanUpDayCells();
    WORK_SECTIONS.forEach(sec => { split(this.dayCells[sec]).forEach((m: string) => { const core = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(core) && this.blockMap.get(core) !== 'ALL') this.addU(core, getStaffAmount(m)); }); });
    this.prepareAvailability();

    if (this.isSmartFix) {
      this.logPhase("ピンポイント補充（スマート修正）");
      const priority = this.ctx.customRules.priorityRooms || SECTIONS;
      priority.forEach((room: string) => {
         if (REST_SECTIONS.includes(room) || ["昼当番","受付ヘルプ","待機"].includes(room)) return;
         if ((this.ctx.customRules.linkedRooms || []).some((r:any) => r.target === room)) return;
         const cap = this.dynamicCapacity[room] || 1; let current = split(this.dayCells[room]);
         const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
         const isFixedToAny = (staffName: string) => (this.ctx.customRules.fixed || []).some((r:any) => extractStaffName(r.staff) === extractStaffName(staffName));
         let sortedAvail = [...this.initialAvailGeneral];
         while (getAmt(current) < cap) {
            const freeStaff = sortedAvail.find((s: string) => { if (this.assignCounts[s] >= 1) return false; if (this.isForbidden(s, room)) return false; if (room === "MMG" && !this.isMmgCapable(s)) return false; if (!this.canAddKenmu(s, room)) return false; if (this.isHardNoConsecutive(s, room)) return false; if (isFixedToAny(s)) return false; return true; });
            if (!freeStaff) break;
            const block = this.blockMap.get(freeStaff); let tag = ""; let p = 1; if (block === 'AM') { tag = "(PM)"; p = 0.5; } else if (block === 'PM') { tag = "(AM)"; p = 0.5; }
            current.push(`${freeStaff}${tag}`); this.addU(freeStaff, p); sortedAvail = sortedAvail.filter(s => s !== freeStaff); this.log(`✅ [配置決定] ${room} の空き枠に ${freeStaff}${tag} を補充しました`);
         }
         this.dayCells[room] = join(current);
      });
    } else {
      this.logPhase("フェーズ2：例外・代打処理");
      (this.ctx.customRules.fixed || []).forEach((rule: any) => { const core = extractStaffName(rule.staff); if (!core || !rule.section || !this.initialAvailAll.includes(core) || this.isUsed(core) || this.isForbidden(core, rule.section)) return; if (this.skipSections.includes(rule.section)) return; const current = split(this.dayCells[rule.section]); if (current.map(extractStaffName).includes(core) || this.hasNGPair(core, current.map(extractStaffName), false)) return; const b = this.blockMap.get(core); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.blockMap.set(core, 'ALL'); this.dayCells[rule.section] = join([...current, `${core}${tag}`]); this.addU(core, tag?0.5:1); this.log(`🔒 [専従] ${core} を ${rule.section} に固定配置しました`); });
      Object.values(this.roleAssignments).forEach((ra: any) => { if (this.skipSections.includes(ra.section)) return; const candidates = split(this.ctx.monthlyAssign[ra.role] || "").map(extractStaffName); const staff = candidates.find(s => this.initialAvailGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, ra.section)); if (staff && !split(this.dayCells[ra.section]).map(extractStaffName).includes(staff)) { const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.blockMap.set(staff, 'ALL'); this.dayCells[ra.section] = join([...split(this.dayCells[ra.section]), `${staff}${tag}`]); this.addU(staff, tag?0.5:1); this.log(`📌 [役割] ${staff} を ${ra.section} に配置しました`); } });
      (this.ctx.customRules.substitutes || []).forEach((sub: any) => {
         const targets = split(sub.target).map(extractStaffName); if (targets.length === 0 || this.skipSections.includes(sub.section)) return;
         const trigger = targets.every(t => !this.initialAvailAll.includes(t));
         if (trigger) {
           const fallbackStaff = split(sub.subs).map(extractStaffName).filter(s => this.initialAvailGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, sub.section));
           if (fallbackStaff.length > 0) {
             const currentRoomMembers = split(this.dayCells[sub.section]);
             for (const f of fallbackStaff) {
               if (!this.hasNGPair(f, currentRoomMembers.map(extractStaffName), false) && currentRoomMembers.length < 6) {
                 if (!this.canAddKenmu(f, sub.section)) continue;
                 const b = this.blockMap.get(f); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.blockMap.set(f, 'ALL');
                 this.dayCells[sub.section] = join([...currentRoomMembers, `${f}${tag}`]); this.addU(f, tag?0.5:1); this.log(`🔄 [代打] ${sub.target} が不在のため、${f} を ${sub.section} に配置しました`); break;
               }
             }
           }
         }
       });
       (this.ctx.customRules.pushOuts || []).forEach((po: any) => {
         const s1 = extractStaffName(po.s1 || po.triggerStaff); const s2 = extractStaffName(po.s2 || po.targetStaff); const tSec = po.triggerSection;
         if (this.initialAvailGeneral.includes(s1) && this.initialAvailGeneral.includes(s2)) {
           const currentTSec = split(this.dayCells[tSec]).map(extractStaffName);
           if (currentTSec.includes(s1) && currentTSec.includes(s2)) {
             for (const room of split(po.targetSections)) {
               if (this.isForbidden(s2, room) || !this.canAddKenmu(s2, room)) continue;
               const currentRoom = split(this.dayCells[room]);
               if (currentRoom.length < (this.dynamicCapacity[room] || 1)) {
                 this.dayCells[tSec] = join(split(this.dayCells[tSec]).filter(m => extractStaffName(m) !== s2));
                 const b = this.blockMap.get(s2); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.dayCells[room] = join([...currentRoom, `${s2}${tag}`]); this.log(`🎱 [玉突き] ${s1} と被ったため、${s2} を ${room} に移動しました`); break;
               }
             }
           }
         }
       });

      this.logPhase("フェーズ3：メイン配置");
      const PRIORITY_LIST = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
      PRIORITY_LIST.forEach((room: string) => {
        if (this.skipSections.includes(room) || ["受付ヘルプ", "昼当番", "待機"].includes(room)) return;
        let targetCount = this.dynamicCapacity[room] !== undefined ? this.dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
        let currentMembersForTarget = split(this.dayCells[room]);
        const placeholders = currentMembersForTarget.filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)));
        if (placeholders.length > 0) { targetCount += placeholders.length; this.dayCells[room] = join(currentMembersForTarget.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); }
        if (room === "受付") {
          let currentUketsuke = split(this.dayCells["受付"]);
          const pickedUketsuke = this.pick(this.initialAvailReception, this.initialAvailReception, targetCount, "受付", currentUketsuke);
          pickedUketsuke.forEach((name: string) => { const b = this.blockMap.get(name); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; currentUketsuke.push(`${name}${tag}`); this.addU(name, tag?0.5:1); this.blockMap.set(name, 'ALL'); });
          this.dayCells["受付"] = join(currentUketsuke);
        } else {
          let preferredList: string[] = [];
          if (["治療", "RI", "CT", "MRI", "MMG"].includes(room)) { preferredList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign).filter((s: string) => this.initialAvailGeneral.includes(s)); } 
          else if (this.ctx.monthlyAssign[room]) { preferredList = split(this.ctx.monthlyAssign[room]).map(extractStaffName).filter((s: string) => this.initialAvailGeneral.includes(s)); }
          let candidates = (["治療", "RI", "MMG"].includes(room)) ? (preferredList.length > 0 ? preferredList : this.initialAvailGeneral) : this.initialAvailGeneral;
          const partnerRooms = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.s1 === room || p.s2 === room).map((p: any) => p.s1 === room ? p.s2 : p.s1);
          const hasPartnerFilled = partnerRooms.some(pr => split(this.dayCells[pr]).reduce((sum, m) => sum + getStaffAmount(m), 0) > 0);
          if (!((this.ctx.customRules.linkedRooms || []).some((r: any) => r.target === room)) && !hasPartnerFilled) { this.fill(candidates, room, preferredList, targetCount); } else { this.log(`⏭️ [専任スキップ] ${room} は兼務ルールの対象のため、メイン専任配置をスキップ`); }
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
      if (rule.date === this.day.id && rule.section && rule.count > 0) {
        const placeholderName = rule.section + "枠" + (rule.time === "全日" || !rule.time ? "" : rule.time);
        let current = split(this.dayCells[rule.section]);
        if (!current.includes(placeholderName)) { for (let i = 0; i < rule.count; i++) current.push(placeholderName); this.dayCells[rule.section] = join(current); this.log(`📈 [増枠] ${rule.section} に ${rule.count}枠 追加しました`); }
      }
    });
  }

  evaluateEmergencies() {
    const tempAvailCount = this.ctx.activeGeneralStaff.filter(s => this.blockMap.get(s) !== 'ALL').length;
    (this.ctx.customRules.emergencies || []).forEach((em: any) => { if (tempAvailCount <= Number(em.threshold)) { if (em.type === "role_assign" && em.role) this.roleAssignments[em.role] = em; if (em.type === "change_capacity") this.dynamicCapacity[em.section] = Number(em.newCapacity); } });
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
    
    // ★Ver 2.61 修正：初期ソートの可視化
    this.logPhase("初期優先順位の確定");
    this.log(`📊 今週/今月の負荷状況により、一般スタッフを ${this.initialAvailGeneral.join(' > ')} の順で評価します`);
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
    if (this.skipSections.includes(section)) return;
    let current = split(this.dayCells[section]);
    const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + getStaffAmount(m), 0);
    let prevAmount = -1;
    while (getCurrentAmount(current) < targetCount) {
      const currentAmount = getCurrentAmount(current); if (currentAmount === prevAmount) break; prevAmount = currentAmount;
      const remaining = targetCount - currentAmount;
      let needTag = ""; let curAm = 0; let curPm = 0; current.forEach(x => { if (x.includes("(AM)")) curAm++; else if (x.includes("(PM)")) curPm++; else { curAm++; curPm++; } });
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
         if (needTag && b === 'NONE' && !isMonthlyMainStaff(section, name, this.ctx.monthlyAssign)) return { hard: true, msg: "半端枠ブロック" };
         if (b === 'ALL') return { hard: true, msg: "全日ブロック" };
         if (needTag === "(AM)" && b === 'AM') return { hard: true, msg: "AMブロック" };
         if (needTag === "(PM)" && b === 'PM') return { hard: true, msg: "PMブロック" };
         if (this.isHalfDayBlockedForFullDayRoom(name, section).hard) return { hard: true, msg: "終日専任室だが半休" };
         if (this.isHardNoConsecutive(name, section)) return { hard: false, msg: "連日担当禁止" };
         if (this.hasNGPair(name, current.map(extractStaffName), false)) return { hard: true, msg: "絶対NGペア" };
         return null;
       };
      const candidatesWithReason = availList.map(name => ({ name, reason: getFilterReason(name) }));
      let validNames = candidatesWithReason.filter(c => !c.reason).map(c => c.name);
      if (validNames.length === 0) break;
      const allSorted = [...validNames].sort((a, b) => {
         let scoreA = isMonthlyMainStaff(section, a, this.ctx.monthlyAssign) ? 10000 : 0;
         let scoreB = isMonthlyMainStaff(section, b, this.ctx.monthlyAssign) ? 10000 : 0;
         scoreA -= (this.roomCounts[a]?.[section] || 0) * 100; scoreB -= (this.roomCounts[b]?.[section] || 0) * 100;
         if (scoreA !== scoreB) return scoreB - scoreA;
         return (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0);
      });
      const picked = allSorted[0]; const block = this.blockMap.get(picked); let tag = ""; let f = 1;
      if (block === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(picked, 'ALL'); } else if (block === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(picked, 'ALL'); } else { if (needTag) { tag = needTag; f = 0.5; this.blockMap.set(picked, needTag === "(AM)" ? 'AM' : 'PM'); } else { tag = ""; f = 1; this.blockMap.set(picked, 'ALL'); } }
      current.push(`${picked}${tag}`); this.addU(picked, f); this.log(`✅ [配置決定] ${section} に ${picked}${tag} を配置しました`);
    }
    this.dayCells[section] = join(current);
  }

  processPostTasks() {
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName);
    const lowPriorityStaff = split(this.ctx.customRules.lateShiftLowPriorityStaff || "").map(extractStaffName);

    this.initialAvailSupport.forEach(staff => {
      if (this.isUsed(staff)) return;
      for (const room of split(this.ctx.customRules.supportTargetRooms || "")) {
        if (this.skipSections.includes(room) || this.isForbidden(staff, room)) continue;
        let current = split(this.dayCells[room]);
        if (current.length > 0 && !this.hasNGPair(staff, current.map(extractStaffName), false) && !this.isHardNoConsecutive(staff, room)) {
          const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":"";
          this.dayCells[room] = join([...current, `${staff}${tag}`]); this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL');
          this.log(`🤝 [サポート] ${room} に ${staff} を追加しました`); break;
        }
      }
    });

    (this.ctx.customRules.swapRules || []).forEach((rule: any) => {
      const { targetRoom, triggerRoom, sourceRooms } = rule;
      const triggerMembers = split(this.dayCells[triggerRoom]);
      if (triggerMembers.length === 0) return;
      const triggerCanTarget = triggerMembers.some(m => !this.isForbidden(extractStaffName(m), targetRoom) && this.canAddKenmu(extractStaffName(m), targetRoom, true));
      if (!triggerCanTarget) {
          for (const srcStr of split(sourceRooms)) {
              const { r: srcRoom } = parseRoomCond(srcStr); const srcMembers = split(this.dayCells[srcRoom]);
              for (const srcM of srcMembers) {
                  const srcCore = extractStaffName(srcM);
                  // ★Ver 2.61 修正：蹴り出される側(kickCore)の兼務上限チェックを追加
                  const targetToKick = triggerMembers.find(m => { 
                    const c = extractStaffName(m); 
                    return !this.isForbidden(c, srcRoom) && !this.hasNGPair(c, srcMembers.map(extractStaffName), false) && this.canAddKenmu(c, srcRoom, true); 
                  });
                  if (targetToKick && this.canAddKenmu(srcCore, targetRoom, true)) {
                      const kickCore = extractStaffName(targetToKick);
                      this.dayCells[triggerRoom] = join(triggerMembers.map(m => m === targetToKick ? m.replace(kickCore, srcCore) : m));
                      this.dayCells[srcRoom] = join(srcMembers.map(m => m === srcM ? m.replace(srcCore, kickCore) : m));
                      this.log(`🔄 [交換] ${triggerRoom} の ${kickCore} と ${srcRoom} の ${srcCore} を入れ替えました`); return;
                  }
              }
          }
      }
    });

    // ★Ver 2.61 修正：smartKenmuの過負荷チェックと全メンバー走査
    (this.ctx.customRules.smartKenmu || []).forEach((rule: any) => {
      const targetRoom = rule.targetRoom; if (!targetRoom) return;
      const targetMembers = split(this.dayCells[targetRoom]);
      for (const tM of targetMembers) {
          const targetCore = extractStaffName(tM);
          if (ROLE_PLACEHOLDERS.includes(targetCore)) continue;
          const isDedicated = !ROOM_SECTIONS.some(r => r !== targetRoom && split(this.dayCells[r]).map(extractStaffName).includes(targetCore));
          if (isDedicated) {
              for (const srcStrRoom of split(rule.sourceRooms)) {
                  const { r: srcRoom } = parseRoomCond(srcStrRoom); const srcMembers = split(this.dayCells[srcRoom]);
                  // 移動後の targetCore が srcRoom で兼務上限を超えないかチェック
                  if (!this.isForbidden(targetCore, srcRoom) && this.canAddKenmu(targetCore, srcRoom, true)) {
                      const cand = srcMembers.find(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)) && !this.isForbidden(extractStaffName(m), targetRoom) && this.canAddKenmu(extractStaffName(m), targetRoom, true));
                      if (cand) {
                          const candCore = extractStaffName(cand);
                          this.dayCells[targetRoom] = join(targetMembers.map(m => m === tM ? cand : m));
                          this.dayCells[srcRoom] = join([...srcMembers, tM]);
                          this.addU(candCore, getStaffAmount(cand));
                          this.log(`✨ [スマート兼務] ${targetCore} を ${srcRoom} に移し、代わりに ${candCore} を兼務させました`); return;
                      }
                  }
              }
          }
      }
    });

    ROOM_SECTIONS.forEach(targetRoom => {
      const targetCap = this.dynamicCapacity[targetRoom] || (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      let currentMems = split(this.dayCells[targetRoom]);
      let currentAmt = currentMems.reduce((sum, m) => sum + getStaffAmount(m), 0);
      if (currentAmt < targetCap) {
         const matchingRescue = (this.ctx.customRules.rescueRules || []).filter((r: any) => r.targetRoom === targetRoom);
         const sourceRooms = matchingRescue.length > 0 ? matchingRescue.flatMap((r: any) => split(r.sourceRooms)) : [...split(this.ctx.customRules.supportTargetRoomsLowImpact), "2号室", "1号室", "5号室", "CT(4)"].filter(r => r !== targetRoom);
         for (const srcStr of sourceRooms) {
            const { r: srcRoom } = parseRoomCond(srcStr);
            const candidates = split(this.dayCells[srcRoom]).filter(m => {
                const c = extractStaffName(m);
                return !ROLE_PLACEHOLDERS.includes(c) && !split(this.dayCells[targetRoom]).map(extractStaffName).includes(c) && !this.isForbidden(c, targetRoom) && !this.isHardNoConsecutive(c, targetRoom) && this.canAddKenmu(c, targetRoom, true);
            }).sort((a, b) => this.getPastRoomCount(extractStaffName(a), targetRoom) - this.getPastRoomCount(extractStaffName(b), targetRoom));
            for (const cand of candidates) {
                this.dayCells[targetRoom] = join([...split(this.dayCells[targetRoom]), cand]); this.addU(extractStaffName(cand), getStaffAmount(cand));
                this.log(`🆘 [救済] ${srcRoom} の ${cand} を ${targetRoom} に兼務させました`);
                if (split(this.dayCells[targetRoom]).reduce((sum, m) => sum + getStaffAmount(m), 0) >= targetCap) return;
            }
         }
      }
    });

    (this.ctx.customRules.lateShifts || []).forEach((rule: any) => {
      let current = split(this.dayCells[rule.section]);
      if (current.length > 0 && !current.some(m => m.includes("17:") || m.includes("18:"))) {
        const noLateStaff = split(this.ctx.customRules.noLateShiftStaff).map(extractStaffName);
        const fuzaiMems = split(this.dayCells["不在"]);
        const picked = this.initialAvailGeneral.find(n => !current.map(extractStaffName).includes(n) && !noLateStaff.includes(n) && !fuzaiMems.some(m => extractStaffName(m) === n && !m.includes("(AM)")));
        if (picked) {
          current.push(`${picked}${rule.lateTime}`); this.dayCells[rule.section] = join(current);
          this.log(`🌆 [遅番] ${rule.section} に ${picked} を指名しました`);
        }
      }
    });

    // ★Ver 2.61 修正：deKenmuTargets の動的化
    const deKenmuTargets = ROOM_SECTIONS.filter(r => !["CT", "MRI", "治療", "RI", "待機", "昼当番", "受付", "受付ヘルプ"].includes(r));
    this.initialAvailGeneral.filter(s => !this.isUsed(s)).forEach(staff => {
      for (const room of deKenmuTargets) {
        let currentMems = split(this.dayCells[room]);
        const repIdx = currentMems.findIndex(m => this.getTodayRoomCount(extractStaffName(m)) > 1 && !this.hasNGPair(staff, currentMems.filter(x=>x!==m).map(extractStaffName), false));
        if (repIdx !== -1) {
          const oldCore = extractStaffName(currentMems[repIdx]);
          currentMems[repIdx] = staff; this.dayCells[room] = join(currentMems); this.addU(staff, 1); this.blockMap.set(staff, 'ALL');
          this.assignCounts[oldCore] = Math.max(0, this.assignCounts[oldCore] - 1);
          this.log(`🪄 [兼務解消] ${staff} を ${room} に専任配置し、${oldCore} の兼務を減らしました`); break;
        }
      }
    });
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
    const cells = allDays[dayId] || {};
    const absent = new Set<string>(); REST_SECTIONS.forEach(s => split(cells[s]).forEach(m => absent.add(extractStaffName(m))));
    const working = allStaff.filter(s => !absent.has(s));
    const assigned = new Set<string>(); WORK_SECTIONS.forEach(s => split(cells[s]).forEach(m => assigned.add(extractStaffName(m))));
    return { workingCount: working.length, absentCount: absent.size, unassigned: working.filter(s => !assigned.has(s)) };
  };

  const getDayWarnings = (dayId: string): WarningInfo[] => {
    const w: WarningInfo[] = []; const cells = allDays[dayId] || {}; const staffMap: Record<string, string[]> = {};
    ROOM_SECTIONS.forEach(room => { split(cells[room]).forEach(m => { const core = extractStaffName(m); if(!staffMap[core]) staffMap[core]=[]; if(!staffMap[core].includes(room)) staffMap[core].push(room); }) });
    Object.entries(staffMap).forEach(([staff, rms]) => { 
      const limit = customRules.alertMaxKenmu || 3;
      const dayCount = rms.filter(r => { const m = split(cells[r]).find(x => extractStaffName(x) === staff); return m && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:"); }).length; 
      if(dayCount >= limit) w.push({ level: 'orange', title: '兼務限界', staff, msg: `${staff}さんが日中 ${dayCount}部屋を担当中` }); 
    });
    return w;
  };

  const setAllDaysWithHistory = (updater: any) => { setAllDays(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; if (JSON.stringify(prev) !== JSON.stringify(next)) setHistory(h => [...h, prev].slice(-20)); return next; }); };
  const updateDay = (k: string, v: string) => { setAllDaysWithHistory((prev: any) => ({ ...prev, [sel]: { ...(prev[sel] || {}), [k]: v } })); };

  const handleAutoAssign = (isSmart: boolean, isWeekly: boolean) => {
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev }; const newLogs = { ...assignLogs }; const ctx = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules }; const targetDays = isWeekly ? days : [cur];
      targetDays.forEach(day => {
        const idx = days.findIndex(d => d.id === day.id); let prevDayObj: any = null;
        if (idx > 0) prevDayObj = { id: days[idx-1].id, cells: nextAll[days[idx-1].id] || days[idx-1].cells };
        const targetMonth = day.id.substring(0, 7);
        const pastDaysInMonthArray = Object.entries(nextAll).filter(([dateStr]) => dateStr.startsWith(targetMonth) && dateStr < day.id).map(([dateStr, cells]) => ({ id: dateStr, cells } as any));
        const pastDaysInWeekArray = days.slice(0, idx).map(d => ({ ...d, cells: nextAll[d.id] || d.cells }));
        const worker = new AutoAssigner({ ...day, cells: nextAll[day.id] || day.cells }, prevDayObj, pastDaysInMonthArray, pastDaysInWeekArray, ctx, isSmart);
        const res = worker.execute();
        nextAll[day.id] = res.cells; newLogs[day.id] = res.logInfo || [];
       });
      setAssignLogs(newLogs); return nextAll;
    });
  };

  const handleUndo = () => { if (history.length > 0) { const last = history[history.length - 1]; setAllDays(last); setHistory(h => h.slice(0, -1)); } };
  const updateMonthly = (k: string, v: string) => { setMonthlyAssign(prev => ({ ...prev, [k]: v })); };
  const updateRule = (type: keyof CustomRules, idx: number, key: string, val: any) => { setCustomRules(r => { const arr = [...((r[type] as any[]) || [])]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: keyof CustomRules, idx: number) => { setCustomRules(r => { const arr = [...((r[type] as any[]) || [])]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };
  const addRule = (type: keyof CustomRules, def: any) => { setCustomRules(r => ({ ...r, [type]: [...((r[type] as any[]) || []), def] })); };

  return (
    <div style={{ maxWidth: "98%", margin: "0 auto", padding: "24px", boxSizing: "border-box" }}>
      <style>{globalStyle}</style>
      
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 24, fontWeight: 900 }}>勤務割付システム Ver 2.61</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-hover" onClick={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()-7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={{...btnStyle("#f1f5f9", "#475569"), border:"1px solid #cbd5e1"}}>◀ 先週</button>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button className="btn-hover" onClick={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={{...btnStyle("#f1f5f9", "#475569"), border:"1px solid #cbd5e1"}}>来週 ▶</button>
        </div>
      </div>

      <div className="tabs-header no-print">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 週間予定表</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>⚙️ 設定・データ入出力</button>
      </div>

      <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
        <div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "16px" }}>
          <div className="scroll-container">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{...cellStyle(true), width: "100px"}}>区分</th>
                  {days.map(day => (
                    <th key={day.id} onClick={() => setSel(day.id)} style={{...cellStyle(true, day.isPublicHoliday, day.id === sel), cursor: "pointer"}}>
                      {day.label}
                      {getDayWarnings(day.id).length > 0 && <span onClick={(e) => { e.stopPropagation(); setSelectedErrorDay(day.id); }} style={{ background: "#fff7ed", color: "#c2410c", padding: "2px 6px", borderRadius: 4, marginLeft: 8, fontSize: 12 }}>⚠️ 注意</span>}
                      {assignLogs[day.id] && <span onClick={(e) => { e.stopPropagation(); setShowLogDay(day.id); }} style={{ background: "#f0f9ff", color: "#0369a1", padding: "2px 6px", borderRadius: 4, marginLeft: 4, fontSize: 12 }}>根拠</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section, sIdx) => (
                  <tr key={section}>
                    <td style={cellStyle(true, false, false, false, sIdx % 2 === 1)}>{section}</td>
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

        <div className="no-print" style={{ ...panelStyle() }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, borderBottom: "2px solid #e2e8f0", paddingBottom: 16 }}>
             <div style={{ display: "flex", gap: 8 }}>
                {days.map(d => <button key={d.id} onClick={() => setSel(d.id)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: d.id === sel ? "#2563eb" : "#f1f5f9", color: d.id === sel ? "#fff" : "#64748b", fontWeight: 800, cursor: "pointer" }}>{d.label}</button>)}
             </div>
             <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowRuleModal(true)} style={btnStyle("#64748b")}>📖 ルール確認</button>
                <button onClick={() => handleAutoAssign(false, false)} style={btnStyle("#10b981")}>✨ 1日自動</button>
                <button onClick={() => handleAutoAssign(false, true)} style={btnStyle("#0ea5e9")}>⚡ 週間自動</button>
                <button onClick={handleUndo} disabled={history.length === 0} style={btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6")}>↩️ 戻す</button>
             </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
             {SECTIONS.map(s => <SectionEditor key={s} section={s} value={allDays[sel]?.[s] || ""} activeStaff={allStaff} onChange={(v: string) => updateDay(s, v)} />)}
          </div>
        </div>
      </div>

      {/* ===================== ⚙️ 設定 タブ ===================== */}
      <div className="no-print" style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>👥 スタッフ名簿</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
             <div>
               <label style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, display: "block" }}>一般スタッフ</label>
               <textarea className="name-textarea" placeholder="名前(よみ)" value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} />
             </div>
             <div>
               <label style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, display: "block" }}>受付スタッフ</label>
               <textarea className="name-textarea" placeholder="名前(よみ)" value={customRules.receptionStaffList} onChange={e => setCustomRules({...customRules, receptionStaffList: e.target.value})} />
             </div>
          </div>
        </div>

        <div style={{ ...panelStyle() }}>
          <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>📋 ルール設定</h3>
          <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🔒" title="専従ルール">
            {(customRules.fixed || []).map((rule: any, idx: number) => (
                <div key={idx} className="rule-row">
                  <select value={rule.staff} onChange={(e: any) => updateRule("fixed", idx, "staff", e.target.value)} className="rule-sel"><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <select value={rule.section} onChange={(e: any) => updateRule("fixed", idx, "section", e.target.value)} className="rule-sel"><option value="">選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <button onClick={() => removeRule("fixed", idx)} className="rule-del">✖</button>
                </div>
            ))}
            <button className="rule-add" onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button>
          </RuleCard>

          <RuleCard bg="#fdf4ff" border="#f5d0fe" color="#86198f" icon="✨" title="スマート兼務">
            {(customRules.smartKenmu || []).map((rule: any, idx: number) => (
              <div key={idx} style={{ marginBottom: 12, borderBottom: "1px solid #f5d0fe", paddingBottom: 12 }}>
                <div className="rule-row">
                  <select value={rule.targetRoom} onChange={(e: any) => updateRule("smartKenmu", idx, "targetRoom", e.target.value)} className="rule-sel"><option value="">対象部屋</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <button onClick={() => removeRule("smartKenmu", idx)} className="rule-del">✖</button>
                </div>
                <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("smartKenmu", idx, "sourceRooms", v)} options={ROOM_SECTIONS} placeholder="＋代わりの兼務元" />
              </div>
            ))}
            <button className="rule-add" onClick={() => addRule("smartKenmu", { targetRoom: "", sourceRooms: "" })}>＋ スマート兼務を追加</button>
          </RuleCard>

          <RuleCard bg="#fff1f2" border="#fecaca" color="#be185d" icon="⚠️" title="兼務上限">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="number" min="2" max="10" value={customRules.alertMaxKenmu ?? 3} onChange={(e: any) => setCustomRules({...customRules, alertMaxKenmu: Number(e.target.value)})} style={{ width: 80, padding: "10px", borderRadius: 8, textAlign: "center", fontWeight: 800, fontSize: 18 }} />
              <span style={{ fontSize: 16, fontWeight: 700 }}>部屋に達した時点で⚠️表示（それ以上は自動ブロック）</span>
            </div>
          </RuleCard>
        </div>
      </div>

      {/* ===================== モーダル類 ===================== */}
      {selectedErrorDay && (
        <Modal title={`👀 ${selectedErrorDay} の確認事項`} onClose={() => setSelectedErrorDay(null)}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {getDayWarnings(selectedErrorDay).map((w, i) => (
              <li key={i} style={{ padding: "12px", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 8, marginBottom: 8, fontWeight: 700 }}>
                {w.msg}
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {showLogDay && (
        <Modal title={`🤔 ${showLogDay} の割当根拠`} onClose={() => setShowLogDay(null)} wide>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {assignLogs[showLogDay]?.map((log, i) => renderLog(log, i))}
          </ul>
        </Modal>
      )}

      {showRuleModal && (
        <Modal title="🏥 システムのルールブック" onClose={() => setShowRuleModal(false)} wide>
          <div style={{ lineHeight: 1.8, fontSize: "16px" }}>
            <h4 style={{ color: "#e11d48", borderBottom: "2px solid #ffe4e6" }}>🛑 鉄の掟（絶対に守る）</h4>
            <ul>
              <li><strong>担当不可・NGペア:</strong> 設定された拒否条件は、いかなる場合も守ります。</li>
              <li><strong>兼務上限（過労防止）:</strong> 3部屋担当した時点で⚠️注意。4部屋目の自動配置はブロックされます。</li>
              <li><strong>連日禁止:</strong> ポータブル等の連日禁止設定がある部屋は、昨日の担当者を必ず除外します。</li>
            </ul>

            <h4 style={{ color: "#2563eb", borderBottom: "2px solid #dbeafe" }}>🟦 優先順位のロジック</h4>
            <ul>
              <li><strong>モダリティ均等化:</strong> CT・MRIは「今月」、その他一般撮影は「今週」の担当回数が少ない人を優先します。</li>
              <li>
                <strong>救済（フェーズ4）の選定順:</strong>
                <div style={{ background: "#f0fdf4", padding: "8px 12px", borderRadius: 6, border: "1px solid #bbf7d0", margin: "4px 0", fontWeight: "bold" }}>
                   ① 過去担当回数が少ない人<br/>
                   ② 今日の兼務部屋数が少ない人<br/>
                   ③ 補充元として指定された順（左から優先）
                </div>
              </li>
              <li><strong>余剰配置:</strong> 仕事がない人は、まず「兼務の解消（専任化）」を試み、それでも余れば「3号室」へ入ります。</li>
            </ul>
          </div>
        </Modal>
      )}
    </div>
  );
}
