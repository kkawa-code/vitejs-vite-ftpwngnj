import React, { useEffect, useMemo, useState, useRef } from "react";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  body { margin: 0; background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.02em; overflow-x: hidden; font-size: 20px; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  textarea:focus, select:focus, input:focus { outline: 2px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 0.6rem center; background-size: 1.4em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
  details > summary { list-style: none; cursor: pointer; transition: color 0.2s; outline: none; }
  details > summary:hover { color: #0d9488; }
  details > summary::-webkit-details-marker { display: none; }
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
  
  .sticky-header { position: sticky; top: 0; z-index: 30; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); padding-top: 16px; margin-top: -16px; box-shadow: 0 10px 10px -10px rgba(0,0,0,0.05); }

  .calendar-row { transition: background-color 0.2s; cursor: pointer; }
  .calendar-row:hover { background-color: #f1f5f9 !important; }
  .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important; }
  .btn-hover:active { transform: translateY(0); box-shadow: none !important; }
  .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; cursor: pointer; }
  .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .rule-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; align-items: center; width: 100%; }
  .rule-sel { padding: 12px 36px 12px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 600; flex: 1 1 140px; min-width: 140px; font-size: 20px; transition: border-color 0.2s; }
  .rule-num { width: 72px; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 20px; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 24px; flex-shrink: 0; padding: 0 10px; transition: 0.2s; }
  .rule-del:hover { background: #fee2e2; border-radius: 4px; }
  .rule-add { background: #fff; color: #4f46e5; border: 2px dashed #a5b4fc; padding: 12px 18px; font-size: 20px; width: 100%; display: flex; justify-content: center; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 14px; transition: all 0.2s; }
  .rule-add:hover { background: #e0e7ff; border-color: #4f46e5; }
  .rule-label { font-size: 20px; font-weight: 700; color: #64748b; flex-shrink: 0; }
  
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

type RenderGroup = { title: string; color: string; sections: string[] };

const SECTIONS = [
  "明け","入り","土日休日代休","不在","待機","CT","MRI","RI",
  "1号室","2号室","3号室","5号室","透視（6号）","透視（11号）",
  "MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","受付","受付ヘルプ"
];

const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];

// 🌟変更点：どの部屋でも「〇〇枠」を出せるように自動生成
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

const DEFAULT_RULES = { 
  staffList: DEFAULT_STAFF, receptionStaffList: "", supportStaffList: "", supportTargetRooms: "1号室,2号室,5号室,パノラマCT", customHolidays: "", 
  capacity: { CT: 3, MRI: 3, 治療: 3, RI: 1, 受付: 2 }, 
  priorityRooms: DEFAULT_PRIORITY_ROOMS, 
  fullDayOnlyRooms: "DSA,検像,骨塩,パノラマCT", 
  ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], 
  kenmuPairs: [], 
  lateShifts: [], 
  helpThreshold: 17, lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], 
  lunchPrioritySections: "RI,1号室,2号室,3号室,5号室,CT", lunchLastResortSections: "治療" 
};

const KEY_ALL_DAYS = "shifto_alldays_v112"; 
const KEY_MONTHLY = "shifto_monthly_v112"; 
const KEY_RULES = "shifto_rules_v112";

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

function split(v: string) { return (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean); }
function join(a: string[]) { return a.filter(Boolean).join("、"); }
function formatDayForDisplay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }
function getCoreName(fullName: string) { return fullName.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim(); }

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
  return staff.map(getCoreName);
}

const isMonthlyMainStaff = (section: string, name: string, monthlyAssign: Record<string, string>) => {
  if (!section) return false;
  return getMonthlyStaffForSection(section, monthlyAssign).includes(name);
};

function btnStyle(bg: string, color: string = "#fff"): React.CSSProperties { 
  return { background: bg, color: color, border: "none", borderRadius: "10px", padding: "16px 24px", cursor: "pointer", fontWeight: 700, fontSize: 20, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 8 }; 
}
function panelStyle(): React.CSSProperties { 
  return { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", width: "100%", boxSizing: "border-box" }; 
}
function cellStyle(isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties { 
  let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff");
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff"); 
  return { border: "1px solid #e2e8f0", padding: "20px", background: bg, fontWeight: isHeader ? 800 : 500, textAlign: isHeader ? "center" : "left", fontSize: 20, minWidth: isHeader && !isSticky ? "160px" : "auto", color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, boxShadow: isSticky ? "2px 0 5px -2px rgba(0,0,0,0.05)" : "none", transition: "background-color 0.2s" }; 
}

const MultiSectionPicker = ({ selected, onChange, options }: { selected: string, onChange: (v: string) => void, options: string[] }) => {
  const current = split(selected);
  const handleAdd = (sec: string) => { if (sec && !current.includes(sec)) onChange(join([...current, sec])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12, alignItems: "center" }}>
      {current.map((sec, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 16, padding: "10px 18px", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 10, border: "1px solid #bae6fd" }}>
          {sec} <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.6 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" style={{ padding: "10px 28px 10px 14px", fontSize: 18, minWidth: 140, flex: "0 0 auto", height: 46 }} onChange={(e) => handleAdd(e.target.value)} value="">
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      {current.map((name, i) => (
        <div key={i} style={{ background: "#f1f5f9", color: "#334155", borderRadius: 16, padding: "10px 18px", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 10, border: "1px solid #cbd5e1" }}>
          {name} <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" style={{ padding: "10px 28px 10px 14px", fontSize: 18, minWidth: 140, flex: "0 0 auto", height: 46 }} onChange={(e) => handleAdd(e.target.value)} value="">
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
      <button className="btn-hover" onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff", "#2563eb"), border: "1px solid #bfdbfe", padding: "16px 24px", fontSize: 20 }}>
        📅 {targetMonday} の週 ▼
      </button>
      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)}></div>
          <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 16, padding: 24, zIndex: 50, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", minWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <button onClick={handlePrev} style={{ border: "none", background: "#f1f5f9", borderRadius: 8, padding: "12px 20px", cursor: "pointer", color: "#475569", fontWeight: "bold", fontSize: 20 }}>◀</button>
              <div style={{ fontWeight: 800, fontSize: 22, color: "#1e293b", letterSpacing: "0.05em" }}>{year}年 {month}月</div>
              <button onClick={handleNext} style={{ border: "none", background: "#f1f5f9", borderRadius: 8, padding: "12px 20px", cursor: "pointer", color: "#475569", fontWeight: "bold", fontSize: 20 }}>▶</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: 20 }}>
              <thead><tr><th style={{ color: "#ef4444", padding: 14, fontWeight: 700 }}>日</th><th style={{ padding: 14, fontWeight: 700 }}>月</th><th style={{ padding: 14, fontWeight: 700 }}>火</th><th style={{ padding: 14, fontWeight: 700 }}>水</th><th style={{ padding: 14, fontWeight: 700 }}>木</th><th style={{ padding: 14, fontWeight: 700 }}>金</th><th style={{ color: "#3b82f6", padding: 14, fontWeight: 700 }}>土</th></tr></thead>
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
                        if (!d) return <td key={dIdx} style={{ padding: 16 }}></td>;
                        const dateStr = `${year}-${pad(month)}-${pad(d)}`;
                        const holidayName = nationalHolidays[dateStr] || (customHolidays.includes(dateStr) ? "休診日" : null);
                        const isHoliday = !!holidayName;
                        const isSun = dIdx === 0;
                        const isSat = dIdx === 6;
                        let color = "#334155";
                        if (isSun || isHoliday) color = "#ef4444";
                        else if (isSat) color = "#3b82f6";
                        
                        return (
                          <td key={dIdx} style={{ padding: 16, color, fontWeight: isHoliday ? 800 : 500, position: "relative" }} title={holidayName || ""}>
                            {d}
                            {isHoliday && <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, background: "#ef4444", borderRadius: "50%" }}></div>}
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
    const core = getCoreName(next[idx]);
    next[idx] = core + newTime;
    onChange(join(next));
  };

  return (
    <div className="card-hover" style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
      <label style={{ fontSize: 22, fontWeight: 800, color: "#475569", marginBottom: 14, letterSpacing: "0.02em" }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {members.map((m, i) => {
          const coreName = getCoreName(m);
          const currentMod = m.substring(coreName.length);
          const isPlaceholder = ROLE_PLACEHOLDERS.includes(coreName) || (customOptions.includes(coreName) && !activeStaff.includes(coreName));
          
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime ? "#334155" : "#0369a1"), borderRadius: 16, padding: "10px 16px 10px 18px", fontSize: 19, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${isPlaceholder ? "#fde047" : (noTime ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 700 }}>
              <span style={{ userSelect: "none" }}>{coreName}</span>
              {!noTime && (
                <select 
                  value={currentMod} 
                  onChange={(e) => handleTimeChange(i, e.target.value)}
                  style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 18, fontWeight: 800, color: "inherit", cursor: "pointer", padding: "0 24px 0 6px" }}
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
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 8 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 19, color: "#64748b", flex: 1, minWidth: 140, cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "12px 32px 12px 16px" }}>
          <option value="">＋追加</option>
          <optgroup label="スタッフ">
            {activeStaff.filter(s => !members.some(m => getCoreName(m) === s)).map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          {customOptions.length > 0 && (
            <optgroup label="部屋連動（兼務）">
              {customOptions.filter(s => !members.some(m => getCoreName(m) === s)).map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
          )}
          <optgroup label="担当枠（未定）">
            {/* 🌟ここでも、追加されていないプレースホルダー枠のみ表示 */}
            {ROLE_PLACEHOLDERS.filter(s => s.startsWith(section) && !members.some(m => getCoreName(m) === s)).map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
        </select>
      </div>
    </div>
  );
};

// ============== 🌟 純粋関数への切り出し（Auto Assign Logic） ==============
type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string> };

type AutoAssignContext = {
  allStaff: string[];
  activeGeneralStaff: string[];
  activeReceptionStaff: string[];
  monthlyAssign: Record<string, string>;
  customRules: any;
};

const executeAutoAssign = (day: DayData, prevDay: DayData | null, pastDays: DayData[], ctx: AutoAssignContext) => {
  const { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules } = ctx;
  const dayCells = { ...day.cells };
  
  if (prevDay && prevDay.cells["入り"]) {
    const iriMembers = split(prevDay.cells["入り"]).map(getCoreName);
    const currentAke = split(dayCells["明け"]);
    dayCells["明け"] = join(Array.from(new Set([...currentAke, ...iriMembers])));
  }

  if (day.isPublicHoliday) return { ...day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])) };

  const blockMap = new Map<string, string>();
  const buildBlockMap = () => {
    allStaff.forEach(s => blockMap.set(s, 'NONE'));
    ["明け","入り","土日休日代休"].forEach(sec => {
      split(dayCells[sec]).forEach(m => blockMap.set(getCoreName(m), 'ALL'));
    });
    split(dayCells["不在"]).forEach(m => {
      const core = getCoreName(m);
      if (m.includes("(AM)")) blockMap.set(core, 'AM'); 
      else if (m.includes("(PM)")) blockMap.set(core, 'PM'); 
      else blockMap.set(core, 'ALL');
    });
  };
  buildBlockMap();

  const isForbidden = (staff: string, section: string) => (customRules.forbidden || []).some((rule: any) => rule.staff === staff && split(rule.sections).includes(section));
  const hasNGPair = (candidate: string, members: string[], checkSoft: boolean) => members.some(member => (customRules.ngPairs || []).some((ng: any) => {
    const match = (ng.s1 === candidate && ng.s2 === member) || (ng.s1 === member && ng.s2 === candidate);
    if (!match) return false;
    if ((ng.level || "hard") === "hard") return true;
    if ((ng.level || "hard") === "soft" && checkSoft) return true;
    return false;
  }));

  const getForbiddenCount = (staffName: string) => {
    const rules = customRules.forbidden || [];
    const rule = rules.find((r: any) => r.staff === staffName);
    return rule ? split(rule.sections).length : 0;
  };

  let skipSections: string[] = [];
  let roleAssignments: Record<string, any> = {};
  let currentKenmu: any[] = [];
  let dynamicCapacity = { ...(customRules.capacity || {}) };
  
  const evaluateEmergencies = () => {
    const tempAvailCount = activeGeneralStaff.filter(s => blockMap.get(s) !== 'ALL').length;
    (customRules.emergencies || []).forEach((em: any) => {
      if (tempAvailCount <= Number(em.threshold)) {
        if (em.type === "role_assign") { if (!roleAssignments[em.role] || em.threshold < roleAssignments[em.role].threshold) { roleAssignments[em.role] = em; } }
        if (em.type === "clear" && em.section) { skipSections.push(em.section); }
        if (em.type === "change_capacity" && em.section) { dynamicCapacity[em.section] = Number(em.newCapacity ?? 3); }
        if (em.type === "kenmu") { 
          currentKenmu.push(em); 
          if (em.s2) {
             split(em.s2).forEach(s => skipSections.push(s));
          }
        }
      }
    });
  };
  evaluateEmergencies();

  const assignCounts: Record<string, number> = {};
  const maxAssigns: Record<string, number> = {};
  const counts: Record<string, number> = {};
  
  allStaff.forEach(s => { assignCounts[s] = 0; maxAssigns[s] = 1; counts[s] = 0; });
  pastDays.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return; split(val as string).forEach(m => { const c = getCoreName(m); if (counts[c] !== undefined) counts[c]++; }); }); });

  const isUsed = (name: string) => (assignCounts[name] || 0) >= (maxAssigns[name] || 1);
  const addU = (name: string, f = 1) => { assignCounts[name] = (assignCounts[name] || 0) + f; };

  Object.keys(dayCells).forEach(sec => {
      if (["明け","入り","不在","土日休日代休"].includes(sec)) return;
      if (skipSections.includes(sec)) { dayCells[sec] = ""; return; }
      
      let members = split(dayCells[sec]);
      members = members.map(m => {
        const core = getCoreName(m);
        // 🌟 プレースホルダーはそのまま通す
        if (ROLE_PLACEHOLDERS.includes(core)) return m;

        const block = blockMap.get(core);
        if (block === 'ALL') return null; 
        if (block === 'AM' && m.includes('(AM)')) return null; 
        if (block === 'PM' && m.includes('(PM)')) return null; 
        if (block === 'AM' && !m.includes('(PM)') && !m.match(/\(.*\)/)) return `${core}(PM)`;
        if (block === 'PM' && !m.includes('(AM)') && !m.match(/\(.*\)/)) return `${core}(AM)`;
        return m;
      }).filter(Boolean) as string[];
      dayCells[sec] = join(members);

      if (!REST_SECTIONS.includes(sec) && sec !== "昼当番") {
          split(dayCells[sec]).forEach(name => { 
              const c = getCoreName(name); 
              if (ROLE_PLACEHOLDERS.includes(c)) return; // プレースホルダーは稼働数にカウントしない
              const isHalf = name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/);
              assignCounts[c] = (assignCounts[c] || 0) + (isHalf ? 0.5 : 1);
          }); 
      }
  });

  const supportStaffList = parseAndSortStaff(customRules.supportStaffList || "");
  const supportTargetRooms = split(customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT");
  const fullDayOnlyList = split(customRules.fullDayOnlyRooms ?? "DSA,検像,骨塩,パノラマCT");
  
  const availAll = allStaff.filter(s => blockMap.get(s) !== 'ALL').sort((a, b) => {
    const aForbidCount = getForbiddenCount(a);
    const bForbidCount = getForbiddenCount(b);
    if (aForbidCount !== bForbidCount) return bForbidCount - aForbidCount;
    if ((counts[a] || 0) !== (counts[b] || 0)) return (counts[a] || 0) - (counts[b] || 0); 
    if ((assignCounts[a] || 0) !== (assignCounts[b] || 0)) return (assignCounts[a] || 0) - (assignCounts[b] || 0); 
    return a.localeCompare(b, 'ja');
  });
  
  const availSupport = availAll.filter(s => supportStaffList.includes(s));
  const availGeneral = availAll.filter(s => activeGeneralStaff.includes(s) && !supportStaffList.includes(s));
  const effectiveReceptionStaff = activeReceptionStaff.length > 0 ? activeReceptionStaff : activeGeneralStaff;
  const availReception = availAll.filter(s => effectiveReceptionStaff.includes(s) && !supportStaffList.includes(s));

  function pick(availList: string[], list: string[], n: number, section?: string, currentAssigned: string[] = [], allowRepeatFromPrev = false): string[] {
    const result: string[] = [];
    const uniqueList = Array.from(new Set(list.filter(Boolean)));

    const primary = uniqueList.filter(name => {
      if (!availList.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
      const isFixed = (customRules.fixed || []).some((r:any) => r.staff === name && r.section === section) || (section ? isMonthlyMainStaff(section, name, monthlyAssign) : false);
      
      if (!allowRepeatFromPrev && prevDay && section && !isFixed) {
        if (split(prevDay.cells[section] || "").map(getCoreName).includes(name)) return false;
      }
      if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), true)) return false;
      return true;
    });
    for (const name of primary) { result.push(name); if (result.length >= n) return result; }

    const fallback = uniqueList.filter(name => {
      if (!availList.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
      const isFixed = (customRules.fixed || []).some((r:any) => r.staff === name && r.section === section) || (section ? isMonthlyMainStaff(section, name, monthlyAssign) : false);
      
      if (!allowRepeatFromPrev && prevDay && section && !isFixed) {
        if (split(prevDay.cells[section] || "").map(getCoreName).includes(name)) return false;
      }
      if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), false)) return false;
      return true;
    });
    for (const name of fallback) { result.push(name); if (result.length >= n) return result; }
    
    const lastResort = uniqueList.filter(name => {
      if (!availList.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
      if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), false)) return false;
      return true;
    });
    for (const name of lastResort) { result.push(name); if (result.length >= n) return result; }

    return result;
  }

  function fill(availList: string[], section: string, preferredList: string[], targetCount: number) {
    if (skipSections.includes(section)) return;
    let current = split(dayCells[section]);
    
    const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + (m.includes("(AM)") || m.includes("(PM)") || m.match(/\(〜/) || m.match(/〜\)/) ? 0.5 : 1), 0);

    let safeCounter = 0;
    while (getCurrentAmount(current) < targetCount && safeCounter < 20) {
      safeCounter++;
      if (safeCounter === 20) {
        console.warn(`[AutoAssign] ループ上限到達: ${day.label}の ${section} (現在 ${getCurrentAmount(current)}人 / 目標 ${targetCount}人)`);
      }

      const remaining = targetCount - getCurrentAmount(current);
      
      let needTag = "";
      if (remaining === 0.5 || remaining === 1.5 || remaining === 2.5) {
         const amCount = current.filter(m => m.includes("(AM)")).length;
         const pmCount = current.filter(m => m.includes("(PM)")).length;
         if (amCount > pmCount) needTag = "(PM)";
         if (pmCount > amCount) needTag = "(AM)";
      }

      const isValidBlock = (name: string) => {
         const b = blockMap.get(name);
         if (b === 'ALL') return false;
         if (needTag === "(AM)" && b === 'AM') return false; 
         if (needTag === "(PM)" && b === 'PM') return false; 
         
         if (fullDayOnlyList.includes(section) && b !== 'NONE') return false;

         return true;
      };

      const validPreferred = preferredList.filter(name => !isUsed(name) && !isForbidden(name, section) && !current.map(getCoreName).includes(name) && isValidBlock(name));
      const validAvail = availList.filter(name => !isUsed(name) && !isForbidden(name, section) && !current.map(getCoreName).includes(name) && isValidBlock(name));

      if (validPreferred.length === 0 && validAvail.length === 0) break;

      const hasAmFree = validAvail.some(s => blockMap.get(s) === 'PM');
      const hasPmFree = validAvail.some(s => blockMap.get(s) === 'AM');
      
      const sortCandidates = (candidates: string[]) => {
         const mainStaff = split(monthlyAssign[section] || "").map(getCoreName);
         
         return [...candidates].sort((a, b) => {
             const bA = blockMap.get(a);
             const bB = blockMap.get(b);

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
             
             if ((counts[a] || 0) !== (counts[b] || 0)) {
                 return (counts[a] || 0) - (counts[b] || 0);
             }
             if ((assignCounts[a] || 0) !== (assignCounts[b] || 0)) {
                 return (assignCounts[a] || 0) - (assignCounts[b] || 0);
             }

             return a.localeCompare(b, 'ja');
         });
      };

      const sortedPreferred = sortCandidates(validPreferred);
      const sortedAvail = sortCandidates(validAvail);

      const pickedCoreList = pick(sortedAvail, [...sortedPreferred, ...sortedAvail], 1, section, current.map(getCoreName), false);
      if (pickedCoreList.length === 0) break;

      const core = pickedCoreList[0];

      const block = blockMap.get(core);
      let tag = ""; let f = 1;
      
      if (block === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(core, 'ALL'); } 
      else if (block === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(core, 'ALL'); } 
      else { 
          if (needTag) {
              tag = needTag;
              f = 0.5;
              blockMap.set(core, needTag === "(AM)" ? 'AM' : 'PM');
          } else {
              tag = ""; 
              f = 1;
              blockMap.set(core, 'ALL');
          }
      }
      
      current.push(`${core}${tag}`);
      addU(core, f);
    }
    dayCells[section] = join(current);
  }

  const assignRooms = () => {
    (customRules.fixed || []).forEach((rule: any) => {
      if (!rule.staff || !rule.section) return;
      Object.keys(dayCells).forEach(sec => {
        if (sec === rule.section) return;
        if (REST_SECTIONS.includes(sec)) return;
        const before = split(dayCells[sec]);
        const after = before.filter(m => getCoreName(m) !== rule.staff);
        if (before.length !== after.length) {
          dayCells[sec] = join(after);
          assignCounts[rule.staff] = 0; 
          blockMap.set(rule.staff, 'NONE'); 
        }
      });
    });

    (customRules.fixed || []).forEach((rule: any) => {
      if (!rule.staff || !rule.section || !availAll.includes(rule.staff) || isUsed(rule.staff) || isForbidden(rule.staff, rule.section)) return;
      if (skipSections.includes(rule.section)) return;
      const current = split(dayCells[rule.section]);
      if (current.map(getCoreName).includes(rule.staff) || hasNGPair(rule.staff, current.map(getCoreName), false)) return;
      
      const b = blockMap.get(rule.staff);
      let tag = ""; let f = 1;
      if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(rule.staff, 'ALL'); }
      else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(rule.staff, 'ALL'); }
      else { blockMap.set(rule.staff, 'ALL'); }

      dayCells[rule.section] = join([...current, `${rule.staff}${tag}`]); 
      addU(rule.staff, f);
    });

    Object.values(roleAssignments).forEach((ra: any) => {
      if (skipSections.includes(ra.section)) return;
      const candidates = split(monthlyAssign[ra.role] || "");
      const targetAvail = ["受付"].includes(ra.role) ? availReception : availGeneral;
      const staff = candidates.find(s => targetAvail.includes(s) && !isUsed(s) && !isForbidden(s, ra.section));
      if (staff && !split(dayCells[ra.section]).map(getCoreName).includes(staff)) { 
        const b = blockMap.get(staff);
        let tag = ""; let f = 1;
        if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
        else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
        else { blockMap.set(staff, 'ALL'); }
        dayCells[ra.section] = join([...split(dayCells[ra.section]), `${staff}${tag}`]); 
        addU(staff, f); 
      }
    });

    (customRules.substitutes || []).forEach((sub: any) => {
      const targets = split(sub.target);
      if (targets.length === 0 || skipSections.includes(sub.section)) return; 
      
      const trigger = targets.every(t => !availAll.includes(t) || isUsed(t));
      if (trigger) {
        const fallbackStaff = split(sub.subs).filter(s => availGeneral.includes(s) && !isUsed(s) && !isForbidden(s, sub.section));
        if (fallbackStaff.length > 0) {
          const currentSec = split(dayCells[sub.section]);
          for (const f of fallbackStaff) {
            if (fullDayOnlyList.includes(sub.section) && blockMap.get(f) !== 'NONE') continue;

            if (!hasNGPair(f, currentSec.map(getCoreName), false) && currentSec.length < 6) {
              const b = blockMap.get(f);
              let tag = ""; let fr = 1;
              if (b === 'AM') { tag = "(PM)"; fr = 0.5; blockMap.set(f, 'ALL'); }
              else if (b === 'PM') { tag = "(AM)"; fr = 0.5; blockMap.set(f, 'ALL'); }
              else { blockMap.set(f, 'ALL'); }
              dayCells[sub.section] = join([...currentSec, `${f}${tag}`]); 
              addU(f, fr);
              break; 
            }
          }
        }
      }
    });

    (customRules.pushOuts || []).forEach((po: any) => {
      const s1 = po.s1 || po.triggerStaff;
      const s2 = po.s2 || po.targetStaff;
      const tSec = po.triggerSection;
      
      if (!s1 || !s2 || !tSec || !po.targetSections) return;
      
      if (availGeneral.includes(s1) && availGeneral.includes(s2) && !isUsed(s2)) {
         const s1In = split(dayCells[tSec]).map(getCoreName).includes(s1) || isMonthlyMainStaff(tSec, s1, monthlyAssign);
         const s2In = split(dayCells[tSec]).map(getCoreName).includes(s2) || isMonthlyMainStaff(tSec, s2, monthlyAssign);
         
         if (s1In && s2In) {
            const allowedRooms = split(po.targetSections).filter(s => !skipSections.includes(s));
            for (const room of allowedRooms) {
              if (isForbidden(s2, room)) continue;
              if (fullDayOnlyList.includes(room) && blockMap.get(s2) !== 'NONE') continue;

              const current = split(dayCells[room]);
              if (hasNGPair(s2, current.map(getCoreName), false)) continue;
              
              const actualCap = dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
              if (current.length < actualCap) {
                const b = blockMap.get(s2);
                let tag = ""; let f = 1;
                if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(s2, 'ALL'); }
                else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(s2, 'ALL'); }
                else { blockMap.set(s2, 'ALL'); }
                dayCells[room] = join([...current, `${s2}${tag}`]);
                addU(s2, f);
                dayCells[tSec] = join(split(dayCells[tSec]).filter(m => getCoreName(m) !== s2));
                break;
              }
            }
         }
      }
    });

    const basePriorityList = customRules.priorityRooms && customRules.priorityRooms.length > 0 ? customRules.priorityRooms : DEFAULT_PRIORITY_ROOMS;
    const PRIORITY_LIST = ["治療", ...basePriorityList.filter((r: string) => r !== "治療")];

    PRIORITY_LIST.forEach((room: string) => {
      if (skipSections.includes(room)) return;

      let targetCount = dynamicCapacity[room] !== undefined ? dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);

      // 🌟 変更点：手動で置かれた「未定枠」の数をカウントし、定員を引き上げる
      let currentMembersForTarget = split(dayCells[room]);
      const placeholders = currentMembersForTarget.filter(m => ROLE_PLACEHOLDERS.includes(getCoreName(m)));
      if (placeholders.length > 0) {
         targetCount += placeholders.length;
         // プレースホルダーを消して、後続のfillに枠を埋めさせる
         dayCells[room] = join(currentMembersForTarget.filter(m => !ROLE_PLACEHOLDERS.includes(getCoreName(m))));
      }

      if (room === "受付") {
        let currentUketsuke = split(dayCells["受付"]);
        const uketsukeMonthly = split(monthlyAssign.受付 || "");
        for (const name of uketsukeMonthly) {
          if (availAll.includes(name) && !isUsed(name) && !currentUketsuke.map(getCoreName).includes(name)) { 
            currentUketsuke.push(name); addU(name, 1); 
          }
        }
        const neededUketsuke = targetCount - currentUketsuke.length;
        if (neededUketsuke > 0) {
          const pickedUketsuke = pick(availReception, availReception, neededUketsuke, "受付", currentUketsuke);
          pickedUketsuke.forEach((name: string) => addU(name, 1)); 
          currentUketsuke = [...currentUketsuke, ...pickedUketsuke];
        }
        dayCells["受付"] = join(currentUketsuke);
      } else {
        let preferredList: string[] = [];
        if (["治療", "RI", "CT", "MRI", "MMG", "透析後胸部"].includes(room)) {
           preferredList = getMonthlyStaffForSection(room, monthlyAssign).filter((s: string) => availGeneral.includes(s));
        } else if (monthlyAssign[room]) {
           preferredList = split(monthlyAssign[room]).filter((s: string) => availGeneral.includes(s));
        }
        
        let candidates = availGeneral;
        const strictRooms = ["治療", "RI", "MMG", "透析後胸部"];
        if (strictRooms.includes(room)) {
           candidates = preferredList.length > 0 ? preferredList : availGeneral; 
        }
        
        fill(candidates, room, preferredList, targetCount);

        const currentAssigned = split(dayCells[room]);
        if (currentAssigned.length === 0) {
          const kenmuRule = (customRules.emergencies || []).find((em: any) => em.type === "kenmu" && split(em.s2).includes(room));
          if (kenmuRule && kenmuRule.s1) {
            const sourceStaff = split(dayCells[kenmuRule.s1]);
            if (sourceStaff.length > 0) {
              const allowed = sourceStaff.filter(m => {
                 if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) return false;
                 return !isForbidden(getCoreName(m), room);
              }).map(getCoreName);

              if (allowed.length > 0) {
                dayCells[room] = allowed[0]; 
              }
            }
          }
        }
      }
    });

    (customRules.kenmuPairs || []).forEach((pair: any) => {
      if (!pair.s1 || !pair.s2) return;
      
      const m1 = split(dayCells[pair.s1]);
      const m2 = split(dayCells[pair.s2]);

      if (m1.length > 0 && m2.length === 0) {
        const allowed = m1.filter(m => {
          if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) return false;
          return !isForbidden(getCoreName(m), pair.s2);
        }).map(getCoreName);
        if (allowed.length > 0) dayCells[pair.s2] = join(allowed);
      }
      else if (m2.length > 0 && m1.length === 0) {
        const allowed = m2.filter(m => {
          if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) return false;
          return !isForbidden(getCoreName(m), pair.s1);
        }).map(getCoreName);
        if (allowed.length > 0) dayCells[pair.s1] = join(allowed);
      }
    });

    currentKenmu.forEach((km: any) => {
      const p1 = split(dayCells[km.s1]);
      if (p1.length > 0) {
        const targets = split(km.s2);
        targets.forEach(targetRoom => {
          if (skipSections.includes(targetRoom)) { 
            const allowed = p1.filter(m => {
               if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) return false;
               return !isForbidden(getCoreName(m), targetRoom);
            }).map(getCoreName); 
            if (allowed.length > 0) {
               dayCells[targetRoom] = allowed[0]; 
            }
          }
        });
      }
    });
  };
  assignRooms();

  const processPostTasks = () => {
    let helpMembers: string[] = [];
    const tempAvailCountForHelp = activeGeneralStaff.filter(s => blockMap.get(s) !== 'ALL').length;
    if (tempAvailCountForHelp <= (customRules.helpThreshold ?? 17)) {
      helpMembers = [...split(dayCells["RI"]).map(getCoreName)];
      if (split(dayCells["CT"]).length >= 4) { helpMembers.push(getCoreName(split(dayCells["CT"])[split(dayCells["CT"]).length - 1])); }
    }

    (customRules.lateShifts || []).forEach((rule: any) => {
      if (!rule.section || !rule.lateTime || !rule.dayEndTime) return;
      if (skipSections.includes(rule.section)) return;
      if (!ROOM_SECTIONS.includes(rule.section)) return;
      
      let current = split(dayCells[rule.section]);
      if (current.length === 0) return;

      current = current.map(m => (!m.includes("(") && !m.includes(")")) ? m + rule.dayEndTime : m);

      if (!current.some(m => m.includes(rule.lateTime))) {
        const currentCore = current.map(getCoreName);
        const getCandidate = (candidatesList: string[]) => {
          let cand = candidatesList.filter(name => {
            if (currentCore.includes(name)) return false;
            const b = blockMap.get(name);
            if (b === 'PM') return false; 
            if (isForbidden(name, rule.section)) return false;
            return true;
          });
          if (cand.length > 0) {
            cand.sort((a, b) => (assignCounts[a] || 0) - (assignCounts[b] || 0));
            return cand[0];
          }
          return null;
        };

        let picked = getCandidate(helpMembers) || getCandidate(availGeneral);
        if (picked) {
          current.push(`${picked}${rule.lateTime}`);
          addU(picked, 0.5);
          blockMap.set(picked, blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); 
        }
      }
      dayCells[rule.section] = join(current);
    });

    const assignSupportStaff = () => {
      const unassignedSupport = availSupport.filter(s => !isUsed(s));
      unassignedSupport.forEach(staff => {
        const b = blockMap.get(staff);
        if (b === 'ALL') return;

        let assigned = false;
        for (const room of supportTargetRooms) {
          if (skipSections.includes(room) || isForbidden(staff, room)) continue;
          
          let current = split(dayCells[room]);
          const currentCores = current.map(getCoreName);
          
          if (current.length === 1 && !currentCores.includes(staff) && !hasNGPair(staff, currentCores, false)) {
            let tag = ""; let f = 1;
            if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
            else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
            else { blockMap.set(staff, 'ALL'); }
            
            dayCells[room] = join([...current, `${staff}${tag}`]);
            addU(staff, f);
            assigned = true;
            break; 
          }
        }
        
        if (!assigned && !skipSections.includes("待機") && !isForbidden(staff, "待機")) {
           let current = split(dayCells["待機"]);
           let tag = ""; let f = 1;
           if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
           else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
           else { blockMap.set(staff, 'ALL'); }
           dayCells["待機"] = join([...current, `${staff}${tag}`]);
           addU(staff, f);
        }
      });
    };
    assignSupportStaff();

    if (!skipSections.includes("昼当番")) {
      let currentLunch = split(dayCells["昼当番"]);
      let baseLunchTarget = customRules.lunchBaseCount ?? 3;
      const dayChar = day.label.match(/\((.*?)\)/)?.[1];
      if (dayChar) {
        const specialDay = (customRules.lunchSpecialDays || []).find((sd:any) => sd.day === dayChar);
        if (specialDay) baseLunchTarget = Number(specialDay.count);
      }
      const lunchTarget = baseLunchTarget;

      const riMembers = split(dayCells["RI"]).map(getCoreName);
      riMembers.forEach(name => {
        if (!currentLunch.includes(name) && currentLunch.length < lunchTarget && !isForbidden(name, "昼当番")) {
          currentLunch.push(name);
        }
      });

      const prioritySecs = split(customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT");
      for (const sec of prioritySecs) {
        if (currentLunch.length >= lunchTarget) break;
        split(dayCells[sec]).forEach(name => {
          const core = getCoreName(name);
          if (!currentLunch.includes(core) && currentLunch.length < lunchTarget && !isForbidden(core, "昼当番")) {
            currentLunch.push(core);
          }
        });
      }

      if (currentLunch.length < lunchTarget) {
        (customRules.lunchConditional || []).forEach((cond: any) => {
          if (!cond.section) return;
          const secMembers = split(dayCells[cond.section]);
          if (secMembers.length >= Number(cond.min)) {
            let picked = 0;
            for (const name of secMembers) {
              if (picked >= Number(cond.out) || currentLunch.length >= lunchTarget) break;
              const core = getCoreName(name);
              if (!currentLunch.includes(core) && !isForbidden(core, "昼当番")) {
                currentLunch.push(core);
                picked++;
              }
            }
          }
        });
      }
      
      if (currentLunch.length < lunchTarget) {
        const lastResortSecs = split(customRules.lunchLastResortSections ?? "治療");
        const lastResortMembers: string[] = [];
        lastResortSecs.forEach(sec => {
          split(dayCells[sec]).forEach(name => lastResortMembers.push(getCoreName(name)));
        });

        const fallbackCandidates = availGeneral.filter(name => !lastResortMembers.includes(name) && !currentLunch.includes(name) && !isForbidden(name, "昼当番"));
        for (const name of fallbackCandidates) { 
          if (currentLunch.length < lunchTarget) currentLunch.push(name); 
        }
        
        if (currentLunch.length < lunchTarget) {
           const finalFallback = availGeneral.filter(name => lastResortMembers.includes(name) && !currentLunch.includes(name) && !isForbidden(name, "昼当番"));
           for (const name of finalFallback) {
             if (currentLunch.length < lunchTarget) currentLunch.push(name); 
           }
        }
      }
      dayCells["昼当番"] = join(currentLunch.slice(0, lunchTarget));

      const uTarget = dynamicCapacity.受付 !== undefined ? dynamicCapacity.受付 : 2;
      const currentUketsukeCount = split(dayCells["受付"]).length;
      const needsUketsukeHelp = currentUketsukeCount < uTarget;

      if (needsUketsukeHelp && !skipSections.includes("受付ヘルプ")) {
        let helpMems = split(dayCells["受付ヘルプ"]);
        const lunchCores = split(dayCells["昼当番"]).map(getCoreName);

        const getHelp = (exclude: string[]) => {
          let cand = availGeneral.filter(n => !exclude.includes(n) && !helpMems.map(getCoreName).includes(n) && !isForbidden(n, "受付ヘルプ"));
          if (cand.length > 0) { cand.sort((a, b) => (assignCounts[a] || 0) - (assignCounts[b] || 0)); return cand[0]; }
          return null; 
        };

        const lunchHelpCandidate = getHelp(lunchCores);
        if (lunchHelpCandidate) {
          helpMems.push(`${lunchHelpCandidate}(12:15〜13:00)`);
        }

        const kenzoCores = split(dayCells["検像"]).map(getCoreName);
        const validKenzo = kenzoCores.filter((n: string) => blockMap.get(n) !== 'AM' && !helpMems.map(getCoreName).includes(n) && !isForbidden(n, "受付ヘルプ"));

        let picked16 = validKenzo.length > 0 ? validKenzo[0] : null;

        if (!picked16) {
          const excl = lunchHelpCandidate ? [lunchHelpCandidate] : [];
          let cand = availGeneral.filter(n => blockMap.get(n) !== 'AM' && !helpMems.map(getCoreName).includes(n) && !excl.includes(n) && !isForbidden(n, "受付ヘルプ"));
          if (cand.length > 0) { cand.sort((a, b) => (assignCounts[a] || 0) - (assignCounts[b] || 0)); picked16 = cand[0]; }
        }

        if (picked16) {
          helpMems.push(`${picked16}(16:00〜)`);
        }

        dayCells["受付ヘルプ"] = join(helpMems);
      }
    }
  };
  processPostTasks();

  return { ...day, cells: dayCells };
};
// ==========================================


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
      if (saved) {
        return { ...DEFAULT_MONTHLY_ASSIGN, ...JSON.parse(saved) };
      }
    } catch {} 
    return DEFAULT_MONTHLY_ASSIGN;
  });
  
  const [customRules, setCustomRules] = useState<any>(() => {
    try { 
      const saved = localStorage.getItem(KEY_RULES); 
      if (saved) {
        return { ...DEFAULT_RULES, ...JSON.parse(saved) };
      }
    } catch {} 
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

  const activeGeneralStaff = useMemo(() => {
    return parseAndSortStaff(customRules.staffList || DEFAULT_STAFF);
  }, [customRules.staffList]);

  const activeReceptionStaff = useMemo(() => {
    return parseAndSortStaff(customRules.receptionStaffList || "");
  }, [customRules.receptionStaffList]);

  const allStaff = useMemo(() => {
    return Array.from(new Set([...activeGeneralStaff, ...activeReceptionStaff]));
  }, [activeGeneralStaff, activeReceptionStaff]);

  const getStaffForSection = (section: string) => {
    if (section === "受付") return activeReceptionStaff.length > 0 ? activeReceptionStaff : activeGeneralStaff;
    if (REST_SECTIONS.includes(section) || ["待機", "昼当番", "受付ヘルプ"].includes(section)) return allStaff;
    return activeGeneralStaff;
  };

  const getAvailableStaffForDay = (section: string, currentDayCells: any) => {
    const baseStaff = getStaffForSection(section);
    if (REST_SECTIONS.includes(section)) return baseStaff;
    
    const absentStaff = [
      ...split(currentDayCells["明け"]).map(getCoreName),
      ...split(currentDayCells["入り"]).map(getCoreName),
      ...split(currentDayCells["土日休日代休"]).map(getCoreName),
      ...split(currentDayCells["不在"]).map(getCoreName)
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
        nextState[nextId] = { ...nextCells, "明け": join(split(v).map(getCoreName)) };
      }
      return nextState;
    }); 
  };
  
  const updateMonthly = (category: string, value: string) => { setMonthlyAssign(prev => ({ ...prev, [category]: value })); };
  const addRule = (type: string, defaultObj: any) => setCustomRules((r: any) => ({ ...r, [type]: [...(r[type] || []), defaultObj] }));
  const updateRule = (type: string, idx: number, key: string, val: string) => { setCustomRules((r: any) => { const arr = [...r[type]]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: string, idx: number) => { setCustomRules((r: any) => { const arr = [...r[type]]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };

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
        const members = split(d.cells[sec]).map(getCoreName);
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
        if(activeGeneralStaff.includes(getCoreName(m))) tempAvailCountW--; 
      });
    });
    
    const dynamicCapacityW = { ...(customRules.capacity || {}) };
    (customRules.emergencies || []).forEach((em: any) => {
      if (tempAvailCountW <= Number(em.threshold) && em.type === "change_capacity" && em.section) {
        dynamicCapacityW[em.section] = Number(em.newCapacity ?? 3);
      }
    });

    ROOM_SECTIONS.forEach(room => {
      const count = split(cells[room]).length;
      const target = dynamicCapacityW[room];

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
          const names = split(cells[sec]).map(getCoreName);
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
    
    (customRules.lateShifts || []).forEach((rule: any) => {
       const m = split(cells[rule.section]);
       if (m.length > 0 && !m.some(x => x.includes(rule.lateTime))) {
         w.push({type: 'alert', msg: `🌇【${rule.section}】${rule.lateTime}の担当がいません`});
       }
    });

    const curIndex = days.findIndex(d => d.id === cur.id);
    if (curIndex > 0) {
      const prevDay = days[curIndex - 1];
      if (!prevDay.isPublicHoliday) {
        const prevPortable = split(prevDay.cells["ポータブル"]).map(getCoreName);
        const curPortable = split(cells["ポータブル"]).map(getCoreName);
        const consecutive = curPortable.filter(n => prevPortable.includes(n));
        consecutive.forEach(n => {
          w.push({ type: 'error', msg: `🚨【ポータブル連続】${n}さんが昨日と連続で入っています！` });
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
      const updatedDay = executeAutoAssign(baseDay, prevDayObj, days.slice(0, idx).map(d => ({...d, cells: nextAll[d.id] || d.cells})), ctx);
      
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
        const updatedDay = executeAutoAssign(baseDay, prevDayObj, tempDays, ctx);
        nextAll[updatedDay.id] = updatedDay.cells;
        prevDayObj = updatedDay;
        tempDays.push(updatedDay);
      }
      return nextAll;
    });
  };

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", padding: "24px", width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
      <style>{globalStyle}</style>
      
      {/* 🌟 ヘッダー */}
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap", padding: "24px 32px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a", letterSpacing: "0.02em", fontSize: 32, fontWeight: 800 }}>勤務割付システム</h2>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          
          <button className="btn-hover" onClick={handleExport} style={btnStyle("#6366f1")}>💾 保存</button>
          
          <button className="btn-hover" onClick={() => fileInputRef.current?.click()} style={btnStyle("#8b5cf6")}>📂 読込</button>
          <input type="file" ref={fileInputRef} accept=".json,application/json,text/plain,*/*" style={{ display: "none" }} onChange={handleImport} />
          <button className="btn-hover" onClick={() => window.print()} style={btnStyle("#475569")}>🖨️ 印刷</button>
          <button className="btn-hover" onClick={handleResetAll} style={btnStyle("#ef4444")}>🗑️ リセット</button>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 24, padding: "20px 32px" }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#be185d", fontSize: 20, display: "flex", alignItems: "center", gap: 10, letterSpacing: "0.02em" }}>
            <span>📱</span> スマホ・PC間のデータ連携（テキストのコピー＆復元）を開く
          </summary>
          <div style={{ marginTop: 16, paddingTop: 20, borderTop: "2px dashed #fbcfe8" }}>
            <p style={{ fontSize: 18, color: "#9d174d", marginBottom: 16, fontWeight: 600 }}>
              Android等でファイルが保存・選択できない場合、以下のボタンでデータをコピーし、LINE等でスマホに送ってください。<br/>
              スマホ側でその文字を下の枠に貼り付けて「復元」を押せばデータを移行できます。
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn-hover" onClick={handleCopyToClipboard} style={{ ...btnStyle("#db2777"), flex: 1, justifyContent: "center" }}>📋 データをコピー</button>
              <input type="text" value={importText} onChange={e => setImportText(e.target.value)} placeholder="スマホでコピーした文字をここに貼り付け" style={{ flex: 2, padding: "16px 20px", borderRadius: 8, border: "1px solid #f9a8d4", outline: "none", minWidth: 200, fontSize: 18 }} />
              <button className="btn-hover" onClick={handleTextImport} style={{ ...btnStyle("#be185d"), flex: 1, justifyContent: "center" }}>✨ テキストから復元</button>
            </div>
          </div>
        </details>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 24 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#0f766e", padding: "10px", fontSize: 22, display: "flex", alignItems: "center", gap: 10, letterSpacing: "0.02em" }}>
            <span>⚙️</span> スタッフ名簿 ＆ 特殊ルールの設定を開く
          </summary>
          <div style={{ paddingTop: 28, borderTop: "2px dashed #e2e8f0", marginTop: 20 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28, marginBottom: 28 }}>
              <div>
                <label style={{ fontSize: 20, fontWeight: 800, color: "#475569", display: "block", marginBottom: 12 }}>在籍スタッフ名簿（一般）</label>
                <textarea value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} placeholder="例: 山田(やまだ), 佐藤(さとう)" style={{ width: "100%", padding: 16, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 120, fontSize: 20, lineHeight: 1.6 }} />
                <div style={{ fontSize: 16, color: "#10b981", marginTop: 10, fontWeight: 600 }}>※カッコでふりがなを入れると50音順にソートされます！</div>
              </div>
              <div>
                <label style={{ fontSize: 20, fontWeight: 800, color: "#475569", display: "block", marginBottom: 12 }}>受付スタッフ名簿</label>
                <textarea value={customRules.receptionStaffList || ""} onChange={e => setCustomRules({...customRules, receptionStaffList: e.target.value})} placeholder="例: 伊藤(いとう), 鈴木(すずき)" style={{ width: "100%", padding: 16, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 120, fontSize: 20, lineHeight: 1.6 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div>
                  <label style={{ fontSize: 20, fontWeight: 800, color: "#475569", display: "block", marginBottom: 12 }}>追加の休診日</label>
                  <textarea value={customRules.customHolidays || ""} onChange={e => setCustomRules({...customRules, customHolidays: e.target.value})} placeholder="例: 2026-12-29, 2026-12-30" style={{ width: "100%", padding: 16, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 120, fontSize: 20, lineHeight: 1.6 }} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 28, marginBottom: 28 }}>
              
              <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, border: "1px solid #e2e8f0", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 14px 0", color: "#334155", fontSize: 22, fontWeight: 800 }}>👥 絶対優先の人数設定（自動割当用）</h4>
                <p style={{ fontSize: 18, color: "#64748b", marginBottom: 18, fontWeight: 600 }}>ここで設定した部屋と人数は、システムが最優先でアサインします。（CTの基本人数などを設定します）</p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                  {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                    <div key={room} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", padding: "12px 20px", borderRadius: 8, border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#475569" }}>{room}:</span>
                      <input type="number" min="0" value={count as number} onChange={e => setCustomRules({...customRules, capacity: {...(customRules.capacity||{}), [room]: Number(e.target.value)}})} style={{ width: 60, border: "none", outline: "none", fontSize: 22, fontWeight: 800, textAlign: "center", color: "#334155", background: "transparent" }} />
                      <span style={{ fontSize: 18, color: "#64748b", fontWeight: 600 }}>人</span>
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
              </div>

              <div style={{ background: "#fffbeb", padding: 24, borderRadius: 12, border: "1px solid #fde68a", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 14px 0", color: "#b45309", fontSize: 22, fontWeight: 800 }}>👑 部屋の割り当て優先順位（上から順に埋めます）</h4>
                <p style={{ fontSize: 18, color: "#d97706", marginBottom: 18, fontWeight: 600 }}>人が足りない場合、優先順位が低い（下にある）部屋から空室になり、自動的に兼務扱いになります。</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {priorityRoomsList.map((room: string, idx: number, arr: string[]) => (
                    <div key={room} style={{ display: "flex", alignItems: "center", background: "#fff", padding: "10px 16px", borderRadius: 8, border: "1px solid #fcd34d", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#92400e", marginRight: 12, minWidth: 28 }}>{idx + 1}.</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#b45309", marginRight: 12 }}>{room}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button onClick={() => {
                          setCustomRules((prev: any) => {
                            const newArr = [...priorityRoomsList];
                            [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                            return { ...prev, priorityRooms: newArr };
                          });
                        }} disabled={idx === 0} style={{ border: "none", background: idx === 0 ? "transparent" : "#fef3c7", cursor: idx === 0 ? "default" : "pointer", fontSize: 16, padding: "4px 10px", borderRadius: 4, color: "#92400e", lineHeight: 1 }}>▲</button>
                        <button onClick={() => {
                          setCustomRules((prev: any) => {
                            const newArr = [...priorityRoomsList];
                            [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
                            return { ...prev, priorityRooms: newArr };
                          });
                        }} disabled={idx === arr.length - 1} style={{ border: "none", background: idx === arr.length - 1 ? "transparent" : "#fef3c7", cursor: idx === arr.length - 1 ? "default" : "pointer", fontSize: 16, padding: "4px 10px", borderRadius: 4, color: "#92400e", lineHeight: 1 }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, border: "1px solid #cbd5e1", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 14px 0", color: "#334155", fontSize: 22, fontWeight: 800 }}>🕒 終日専任（半休・AM/PM不可）の部屋</h4>
                <p style={{ fontSize: 18, color: "#64748b", marginBottom: 18, fontWeight: 600 }}>検査数が少ない部屋や、半休の人をわざわざアサインする意味がない部屋を指定します。ここには「1日通しで入れる人」しか配置されません。</p>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "300px" }}>
                    <MultiSectionPicker selected={customRules.fullDayOnlyRooms ?? "DSA,検像,骨塩,パノラマCT"} onChange={v => setCustomRules({...customRules, fullDayOnlyRooms: v})} options={ROOM_SECTIONS} />
                  </div>
                </div>
              </div>

              <div style={{ background: "#ecfdf5", padding: 24, borderRadius: 12, border: "1px solid #a7f3d0", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#065f46", fontSize: 22, fontWeight: 800 }}>🔗 常時兼務ペア</h4>
                <p style={{ fontSize: 18, color: "#047857", marginBottom: 18, fontWeight: 600 }}>
                  人が足りない時に自動で兼務にする部屋のペアです。余裕がある時は独立した担当者が入ります。
                </p>
                {(customRules.kenmuPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{ background: "#fff", padding: "14px 20px", border: "1px solid #a7f3d0", borderRadius: 8 }}>
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

              <div style={{ background: "#f0fdf4", padding: 24, borderRadius: 12, border: "1px solid #bbf7d0", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 14px 0", color: "#15803d", fontSize: 22, fontWeight: 800 }}>🤝 サポート専任（2人目要員）ルール</h4>
                <p style={{ fontSize: 18, color: "#166534", marginBottom: 18, fontWeight: 600 }}>指定したスタッフを、1人目の配置が終わった後の「対象部屋」に2人目として自動配置します。</p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 18, fontWeight: 700, color: "#166534", display: "block", marginBottom: 8 }}>対象スタッフ名（複数可）</label>
                    <div style={{ background: "#fff", padding: "10px", borderRadius: 8, border: "1px solid #86efac", minHeight: "44px", display: "flex", alignItems: "center" }}>
                      <MultiStaffPicker 
                        selected={customRules.supportStaffList || ""} 
                        onChange={v => setCustomRules({...customRules, supportStaffList: v})} 
                        options={allStaff} 
                        placeholder="＋スタッフを選択" 
                      />
                    </div>
                  </div>
                  <div style={{ flex: 2, minWidth: "300px" }}>
                    <label style={{ fontSize: 18, fontWeight: 700, color: "#166534", display: "block", marginBottom: 8 }}>優先する対象部屋</label>
                    <MultiSectionPicker selected={customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT"} onChange={v => setCustomRules({...customRules, supportTargetRooms: v})} options={ROOM_SECTIONS} />
                  </div>
                </div>
              </div>

              <div style={{ background: "#eef2ff", padding: 24, borderRadius: 12, border: "1px solid #c7d2fe", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#4338ca", fontSize: 22, fontWeight: 800 }}>🍱 昼当番の自動選出ルール</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, background: "#fff", padding: "14px 24px", borderRadius: 10, border: "1px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span>
                  <input type="number" min="0" value={customRules.lunchBaseCount ?? 3} onChange={e => setCustomRules({...customRules, lunchBaseCount: Number(e.target.value)})} style={{ width: 70, padding: "10px", borderRadius: 6, border: "1px solid #a5b4fc", textAlign: "center", fontWeight: 800, color: "#4f46e5", fontSize: 20 }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ flex: 1, minWidth: "340px", background: "#fff", padding: 20, borderRadius: 10, border: "1px solid #e0e7ff" }}>
                    <h5 style={{ margin: "0 0 14px 0", fontSize: 19, color: "#4f46e5", fontWeight: 800 }}>📅 曜日で人数を変える</h5>
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
                  <div style={{ flex: 1, minWidth: "340px", background: "#fff", padding: 20, borderRadius: 10, border: "1px solid #e0e7ff" }}>
                    <h5 style={{ margin: "0 0 14px 0", fontSize: 19, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h5>
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
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 20 }}>
                  <div style={{ flex: 1, background: "#fff", padding: 20, borderRadius: 10, border: "1px solid #e0e7ff", minWidth: "340px" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: 19, color: "#4f46e5", fontWeight: 800 }}>🎯 優先的に選出する部屋</h5>
                    <MultiSectionPicker selected={customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT"} onChange={v => setCustomRules({...customRules, lunchPrioritySections: v})} options={ROOM_SECTIONS} />
                  </div>
                  <div style={{ flex: 1, background: "#fff", padding: 20, borderRadius: 10, border: "1px solid #e0e7ff", minWidth: "340px" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: 19, color: "#4f46e5", fontWeight: 800 }}>⚠️ 緊急時のみ選出する部屋（なるべく除外）</h5>
                    <MultiSectionPicker selected={customRules.lunchLastResortSections ?? "治療"} onChange={v => setCustomRules({...customRules, lunchLastResortSections: v})} options={ROOM_SECTIONS} />
                  </div>
                </div>

              </div>

              <div style={{ background: "#f5f3ff", padding: 24, borderRadius: 12, border: "1px solid #ddd6fe", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#6d28d9", fontSize: 22, fontWeight: 800 }}>🌆 遅番・引き継ぎルール</h4>
                <p style={{ fontSize: 18, color: "#7c3aed", marginBottom: 18, fontWeight: 600 }}>「17時以降も稼働する部屋」を指定できます。日勤者には自動で終了時間が付き、遅番が1名追加されます。</p>
                {(customRules.lateShifts || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"14px 20px", border:"1px solid #ddd6fe", borderRadius:8}}>
                    <select value={rule.section} onChange={e => updateRule("lateShifts", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe"}}>
                      <option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>に</span>
                    <select value={rule.lateTime} onChange={e => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", flex: "0 0 140px"}}>
                      <option value="">遅番の時間</option>
                      {TIME_OPTIONS.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}
                    </select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>の担当を追加する（日勤は</span>
                    <select value={rule.dayEndTime} onChange={e => updateRule("lateShifts", idx, "dayEndTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", flex: "0 0 140px"}}>
                      <option value="">終了時間</option>
                      {TIME_OPTIONS.filter(t => t.includes("(〜")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}
                    </select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>とする）</span>
                    <button onClick={() => removeRule("lateShifts", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルールを追加</button>
              </div>

              <div style={{ background: "#e0f2fe", padding: 24, borderRadius: 12, border: "1px solid #bae6fd", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#0369a1", fontSize: 22, fontWeight: 800 }}>🎱 玉突き・同室回避ルール</h4>
                <p style={{ fontSize: 18, color: "#0284c7", marginBottom: 18, fontWeight: 600 }}>「AさんとBさんが同じ部屋になりそうな時、Bさんを別の部屋に押し出す」ルールです。</p>
                {(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "1px solid #bae6fd", paddingBottom: 20 }}>
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

              <div style={{ background: "#fff7ed", padding: 24, borderRadius: 12, border: "1px solid #fed7aa", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#c2410c", fontSize: 22, fontWeight: 800 }}>🔄 代打ルール</h4>
                <p style={{ fontSize: 18, color: "#9a3412", marginBottom: 18, fontWeight: 600 }}>特定のスタッフが休みの時に、指定した代打スタッフを優先してアサインするルールです。</p>
                {(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 16, alignItems: "center", background: "#fff", padding: "18px", borderRadius: 8, border: "1px solid #fdba74", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                    
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <MultiStaffPicker selected={rule.target} onChange={v => updateRule("substitutes", idx, "target", v)} options={activeGeneralStaff} placeholder="対象スタッフ(休)" />
                    </div>
                    
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#c2410c" }}>が全員休みの時➔</span>
                    <div style={{ flex: 1, minWidth: "240px" }}>
                      <MultiStaffPicker selected={rule.subs} onChange={v => updateRule("substitutes", idx, "subs", v)} options={activeGeneralStaff} placeholder="代打スタッフを追加" />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#c2410c" }}>を</span>
                    <select value={rule.section} onChange={e => updateRule("substitutes", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fed7aa", color: "#c2410c", flex: "0 0 150px"}}>
                      <option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#c2410c" }}>に優先</span>
                    <button onClick={() => removeRule("substitutes", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#c2410c", borderColor:"#fdba74"}} onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打ルールを追加</button>
              </div>

              <div style={{ background: "#fef2f2", padding: 24, borderRadius: 12, border: "1px solid #fecaca", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#b91c1c", fontSize: 22, fontWeight: 800 }}>🚫 NGペア</h4>
                {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.s1} onChange={e => updateRule("ngPairs", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span className="rule-label">と</span>
                    <select value={rule.s2} onChange={e => updateRule("ngPairs", idx, "s2", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.level || "hard"} onChange={e => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"150px"}}>
                      <option value="hard">絶対NG</option><option value="soft">なるべくNG</option>
                    </select>
                    <button onClick={() => removeRule("ngPairs", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ 追加</button>
              </div>

              <div style={{ background: "#f0fdf4", padding: 24, borderRadius: 12, border: "1px solid #bbf7d0", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#15803d", fontSize: 22, fontWeight: 800 }}>🔒 専従（必ずここに配置）</h4>
                {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.staff} onChange={e => updateRule("fixed", idx, "staff", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.section} onChange={e => updateRule("fixed", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("fixed", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button>
              </div>

              <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, border: "1px solid #cbd5e1", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#475569", fontSize: 22, fontWeight: 800 }}>🙅 担当不可（複数選択可）</h4>
                {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "1px solid #e2e8f0", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <select value={rule.staff} onChange={e => updateRule("forbidden", idx, "staff", e.target.value)} className="rule-sel"><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("forbidden", idx)} className="rule-del">✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.sections} onChange={v => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
                ))}
                <button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button>
              </div>

              <div style={{ background: "#fef08a", padding: 24, borderRadius: 12, border: "1px solid #fde047", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#a16207", fontSize: 22, fontWeight: 800 }}>🚨 緊急ルール（人数不足時の対応）</h4>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: "14px 24px", borderRadius: 10, border: "1px solid #fde047" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#854d0e" }}>🚑 一般スタッフ発動ライン: 出勤</span>
                  <input type="number" value={customRules.helpThreshold ?? 17} onChange={e => setCustomRules({...customRules, helpThreshold: Number(e.target.value)})} style={{ width: "80px", padding: "10px", borderRadius: 6, border: "1px solid #fde047", textAlign: "center", fontWeight: 800, color: "#a16207", fontSize: 20 }} />
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#a16207" }}>人以下</span>
                </div>
                <p style={{ fontSize: 18, color: "#a16207", marginBottom: 16, fontWeight: 600 }}>※「兼務」を連鎖させる場合（AがBを兼務し、BがCを兼務など）は、ルールの順番に注意するか、「AがBを兼務」「AがCを兼務」と直接指定すると確実です。</p>
                {(customRules.emergencies || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"14px 20px", border:"1px dashed #fde047", borderRadius:8}}>
                    <span className="rule-label" style={{color:"#854d0e"}}>出勤</span>
                    <input type="number" value={rule.threshold} onChange={e => updateRule("emergencies", idx, "threshold", e.target.value)} className="rule-num" style={{borderColor:"#fde047"}} />
                    <span className="rule-label" style={{color:"#854d0e"}}>人以下➔</span>
                    
                    <select value={["kenmu", "clear", "role_assign", "change_capacity"].includes(rule.type) ? rule.type : "role_assign"} onChange={e => updateRule("emergencies", idx, "type", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", width:"150px", borderColor:"#fde047"}}>
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
                        <div style={{ flex: 1, minWidth: "180px" }}>
                          <MultiSectionPicker selected={rule.s2 || ""} onChange={v => updateRule("emergencies", idx, "s2", v)} options={ROOM_SECTIONS} />
                        </div>
                        <span className="rule-label" style={{color:"#854d0e"}}>] も兼務</span>
                      </>
                    ) : rule.type === "change_capacity" ? (
                      <>
                        <select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fde047"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <span className="rule-label" style={{color:"#854d0e"}}>の定員を</span>
                        <input type="number" value={rule.newCapacity ?? 3} onChange={e => updateRule("emergencies", idx, "newCapacity", e.target.value)} className="rule-num" style={{borderColor:"#fde047"}} />
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

            <div style={{ marginTop: 32, paddingTop: 28, borderTop: "2px dashed #cbd5e1" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#1e293b", fontSize: 24, fontWeight: 800, letterSpacing: "0.02em" }}>📅 月間担当者の設定</h4>
              <p style={{ fontSize: 18, color: "#64748b", marginBottom: 20, fontWeight: 600 }}>今月のベースとなる各モダリティの担当者を設定します。（追加形式）</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
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

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 24 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#3b82f6", fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}>
            <span>📊</span> 今週のスタッフ稼働メーター（自動集計）を開く
          </summary>
          <div style={{ marginTop: 20, borderTop: "2px dashed #cbd5e1", paddingTop: 20 }}>
            <p style={{ fontSize: 18, color: "#64748b", marginBottom: 20, fontWeight: 600 }}>※表示中の1週間（月〜日）で、誰が何回「業務（待機・当番除く）」に割り当てられているかを自動集計します。クリックで詳細が見れます。</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {weeklyStats.map(([name, stat]) => (
                <div key={name} className="card-hover btn-hover" onClick={() => setSelectedStaffForStats(name)} style={{ background: stat.total > 0 ? "#fff" : "#f1f5f9", border: `1px solid ${stat.total > 0 ? "#bfdbfe" : "#e2e8f0"}`, padding: "14px 20px", borderRadius: 8, minWidth: 200, boxShadow: stat.total > 0 ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}>
                  <div style={{ fontWeight: 800, color: stat.total > 0 ? "#1e293b" : "#94a3b8", marginBottom: 10, fontSize: 19 }}>{name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                    <span style={{ fontSize: 16, color: "#64748b", fontWeight: 600 }}>総稼働: <strong style={{color:"#2563eb", fontSize:20}}>{stat.total}</strong> 枠</span>
                    <div style={{ display: "flex", gap: 8, fontSize: 14, fontWeight: 800 }}>
                      {stat.portable > 0 && <span style={{ color: "#ef4444", background: "#fee2e2", padding: "4px 8px", borderRadius: 6 }}>ポ:{stat.portable}</span>}
                      {stat.ct > 0 && <span style={{ color: "#0ea5e9", background: "#e0f2fe", padding: "4px 8px", borderRadius: 6 }}>C:{stat.ct}</span>}
                      {stat.mri > 0 && <span style={{ color: "#10b981", background: "#d1fae5", padding: "4px 8px", borderRadius: 6 }}>M:{stat.mri}</span>}
                      {stat.room6 > 0 && <span style={{ color: "#8b5cf6", background: "#ede9fe", padding: "4px 8px", borderRadius: 6 }}>6号:{stat.room6}</span>}
                      {stat.room11 > 0 && <span style={{ color: "#f59e0b", background: "#fef3c7", padding: "4px 8px", borderRadius: 6 }}>11号:{stat.room11}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 24, border: "1px solid #e2e8f0" }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#475569", fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}>
            <span>📋</span> 自動割当のルール（部屋が埋まる優先度）を開く
          </summary>
          <div style={{ marginTop: 20, borderTop: "2px dashed #cbd5e1", paddingTop: 20 }}>
            <h4 style={{ margin: "0 0 14px 0", color: "#334155", fontSize: 22, fontWeight: 800 }}>📌 部屋が埋まる順番（処理の優先順位）</h4>
            <p style={{ fontSize: 18, color: "#64748b", marginBottom: 16, fontWeight: 600 }}>※上から順にスタッフが割り当てられていきます。</p>
            <div style={{ fontSize: 19, color: "#334155", lineHeight: 1.6, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #cbd5e1", marginBottom: 18 }}>
              <ol style={{ margin: 0, paddingLeft: 28 }}>
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
      <div className="print-area" style={{ ...panelStyle(), marginBottom: 24, padding: "28px 20px" }}>
        <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 26, fontWeight: 800, color: "#1e293b", paddingLeft: 10, letterSpacing: "0.02em" }}>週間一覧</h3>
        <div className="scroll-container" style={{ borderBottom: "1px solid #e2e8f0", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000, background: "#fff" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 20, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              <tr>
                <th style={{...cellStyle(true, false, false, true, false), position: "sticky", top: 0, left: 0, zIndex: 30, minWidth: "140px", borderRight: "2px solid #e2e8f0", borderBottom: "2px solid #e2e8f0"}}>区分</th>
                {days.map(day => {
                  return (
                    <th key={day.id} style={{...cellStyle(true, day.isPublicHoliday, day.id === sel, false, false), position: "sticky", top: 0, zIndex: 20, borderBottom: "2px solid #e2e8f0"}}>
                      <div style={{ fontSize: 20, letterSpacing: "0.02em" }}>{day.label}</div>
                      {day.isPublicHoliday && <div style={{ fontSize: 16, color: "#ef4444", marginTop: 6, fontWeight: 600 }}>🎌 {day.holidayName}</div>}
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
                    <td style={{...cellStyle(true, false, false, true, isZebra), borderRight: "2px solid #e2e8f0"}}>{section}</td>
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

      <div className="no-print" style={{ ...panelStyle(), borderRadius: "24px 24px 0 0", boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
        
        {/* 🌟 曜日タブとアクションボタンの統合＆追従化 */}
        <div className="scroll-container hide-scrollbar sticky-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "center", borderBottom: "none", marginBottom: 0 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {days.map(d => {
              return (
                <button className="btn-hover" key={d.id} onClick={() => setSel(d.id)} style={{ flexShrink: 0, padding: "16px 26px", cursor: "pointer", border: "none", borderRadius: "10px", background: d.id === sel ? "#2563eb" : "transparent", color: d.id === sel ? "#fff" : (d.isPublicHoliday ? "#ef4444" : "#64748b"), fontWeight: d.id === sel ? 800 : 600, fontSize: 20, whiteSpace: "nowrap", transition: "0.2s" }}>
                  {d.label} {d.isPublicHoliday && "🎌"}
                </button>
              )
            })}
          </div>
          
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn-hover" onClick={handleAutoOne} style={{...btnStyle("#10b981"), padding: "16px 24px", fontSize: 19}}>✨ 表示日を自動割当</button>
            <button className="btn-hover" onClick={handleAutoAll} style={{...btnStyle("#0ea5e9"), padding: "16px 24px", fontSize: 19}}>⚡ 全日程を自動割当</button>
            <button className="btn-hover" onClick={handleCopyYesterday} style={{ ...btnStyle("#f8fafc", "#475569"), border: "1px solid #cbd5e1", padding: "16px 24px", fontSize: 19 }} disabled={cur.isPublicHoliday}>📋 昨日の入力をコピー</button>
            {/* 🌟 一番下にも保存ボタンを復活 */}
            <button className="btn-hover" onClick={handleExport} style={{...btnStyle("#6366f1"), padding: "16px 24px", fontSize: 19}}>💾 保存</button>
            <button className="btn-hover" onClick={handleUndo} style={{...btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6"), padding: "16px 24px", fontSize: 19, cursor: history.length === 0 ? "not-allowed" : "pointer"}} disabled={history.length === 0}>↩️ 戻る</button>
          </div>
        </div>

        {cur.isPublicHoliday ? (
          <div style={{ padding: "100px 28px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "2px dashed #cbd5e1", marginTop: 32 }}>
            <h3 style={{ margin: 0, color: "#64748b", fontSize: 26, fontWeight: 800 }}>🎌 この日（{cur.holidayName}）は祝日・休診日のため、シフトは入力できません。</h3>
            <p style={{ fontSize: 19, color: "#94a3b8", marginTop: 16, fontWeight: 600 }}>※「特殊ルールの設定」から追加の休診日を変更できます。</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 40, marginTop: 32 }}>
            {warnings.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px dashed #fcd34d", padding: "24px 32px", borderRadius: "12px", display: "flex", gap: "18px", alignItems: "flex-start", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "32px" }}>💡</div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#b45309", marginBottom: "14px" }}>配置のチェックリスト</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {warnings.map((w, i) => (
                      <div key={i} style={{ 
                        background: w.type === 'error' ? "#fef2f2" : w.type === 'alert' ? "#fff7ed" : "#f0f9ff", 
                        border: `1px solid ${w.type === 'error' ? "#fecaca" : w.type === 'alert' ? "#fdba74" : "#bae6fd"}`, 
                        padding: "12px 18px", borderRadius: "8px", fontSize: "18px", 
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: 24, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 12, fontWeight: 800 }}>
                    <span style={{ display: "inline-block", width: 8, height: 24, background: group.color, borderRadius: 4 }}></span>
                    {group.title}
                  </h4>
                  {group.title === "休務・夜勤" && (
                    <div style={{display: "flex", gap: 12}}>
                      <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "12px 20px", fontSize: 18, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                      <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "12px 20px", fontSize: 18, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                    </div>
                  )}
                  {group.title === "モダリティ" && (
                    <div style={{display: "flex", gap: 12}}>
                      <button onClick={handleClearWorkDay} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "12px 20px", fontSize: 18, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務1日クリア</button>
                      <button onClick={handleClearWorkWeek} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "12px 20px", fontSize: 18, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務週間クリア</button>
                    </div>
                  )}
                  {group.title === "待機" && (
                    <div style={{display: "flex", gap: 12}}>
                      <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "12px 20px", fontSize: 18, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                      <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "12px 20px", fontSize: 18, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
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
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)" }} onClick={() => setSelectedStaffForStats(null)}>
          <div className="modal-animate" style={{ background: "#fff", padding: 32, borderRadius: 20, width: "90%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", fontWeight: 800 }}>👤 {selectedStaffForStats} さんの稼働詳細</h3>
              <button onClick={() => setSelectedStaffForStats(null)} className="btn-hover" style={{ background: "#f1f5f9", border: "none", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20 }}>✖</button>
            </div>
            
            {days.every(d => d.isPublicHoliday) ? (
              <p style={{ textAlign: "center", color: "#64748b", fontSize: 20 }}>今週はすべて休診日です。</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 20 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "14px 10px", textAlign: "left", color: "#475569" }}>日付</th>
                    <th style={{ padding: "14px 10px", textAlign: "left", color: "#475569" }}>業務担当</th>
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
                      <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "18px 10px", fontWeight: 600, color: "#334155", verticalAlign: "top", width: "40%" }}>{d.label}</td>
                        <td style={{ padding: "18px 10px", color: assigns.length > 0 ? "#0ea5e9" : "#94a3b8", fontWeight: 700 }}>
                          {assigns.length > 0 ? assigns.join(" / ") : "なし（または休務）"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <button className="btn-hover" onClick={() => setSelectedStaffForStats(null)} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "16px 40px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 20 }}>閉じる</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
