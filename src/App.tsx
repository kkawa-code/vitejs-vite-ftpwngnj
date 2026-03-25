import React, { useEffect, useMemo, useState, useRef } from "react";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  body { margin: 0; background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.01em; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
  details > summary { list-style: none; cursor: pointer; transition: color 0.2s; }
  details > summary:hover { color: #0d9488; }
  details > summary::-webkit-details-marker { display: none; }
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .calendar-row { transition: background-color 0.2s; cursor: pointer; }
  .calendar-row:hover { background-color: #f1f5f9 !important; }
  .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important; }
  .btn-hover:active { transform: translateY(0); box-shadow: none !important; }
  .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .rule-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; align-items: center; }
  .rule-sel { padding: 6px 24px 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; flex: 1 1 110px; min-width: 100px; }
  .rule-num { width: 50px; padding: 6px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; text-align: center; flex-shrink: 0; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 16px; flex-shrink: 0; padding: 0 4px; }
  .rule-add { background: #fff; color: #4f46e5; border: 1px dashed #a5b4fc; padding: 6px 12px; font-size: 12px; width: 100%; display: flex; justify-content: center; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 8px; }
  .rule-label { font-size: 12px; font-weight: 700; color: #64748b; flex-shrink: 0; }
  @media print {
    body { background: #fff; } .no-print { display: none !important; }
    .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
    table { width: 100% !important; border-collapse: collapse !important; }
    th, td { border: 1px solid #000 !important; padding: 6px !important; font-size: 10pt !important; color: #000 !important; position: static !important; }
  }
`;

type RenderGroup = { title: string; color: string; sections: string[] };

const SECTIONS = [
  "明け","入り","土日休日代休","不在","待機","CT","MRI","RI",
  "1号室","2号室","3号室","5号室","透視（6号）","透視（11号）",
  "MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","残り・待機","受付","受付ヘルプ"
];

const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番","残り・待機"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
const ROLE_PLACEHOLDERS = ["CT枠", "MRI枠", "RI枠", "治療枠", "MMG枠", "透視枠", "受付枠"];
const GENERAL_ROOMS = ["1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA", "透析後胸部", "検像"];

const FALLBACK_HOLIDAYS: Record<string, string> = {
  "2025-01-01": "元日", "2025-01-13": "成人の日", "2025-02-11": "建国記念の日", "2025-02-23": "天皇誕生日", "2025-02-24": "振替休日", "2025-03-20": "春分の日", "2025-04-29": "昭和の日", "2025-05-03": "憲法記念日", "2025-05-04": "みどりの日", "2025-05-05": "こどもの日", "2025-05-06": "振替休日", "2025-07-21": "海の日", "2025-08-11": "山の日", "2025-09-15": "敬老の日", "2025-09-23": "秋分の日", "2025-10-13": "スポーツの日", "2025-11-03": "文化の日", "2025-11-23": "勤労感謝の日", "2025-11-24": "振替休日",
  "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日", "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日"
};

const MONTHLY_CATEGORIES = [
  { key: "CT", label: "CT" }, { key: "MRI", label: "MRI" }, { key: "治療", label: "治療 (メイン)" }, { key: "治療サブ優先", label: "治療 (サブ優先)" },
  { key: "治療サブ", label: "治療 (サブ)" }, { key: "RI", label: "RI (メイン)" }, { key: "RIサブ", label: "RI (サブ)" }, { key: "MMG", label: "MMG" },
  { key: "透析後胸部", label: "透析後胸部" }, { key: "受付", label: "受付" }, { key: "受付ヘルプ", label: "受付ヘルプ" }
];

const DEFAULT_STAFF = "";
const DEFAULT_MONTHLY_ASSIGN: Record<string, string> = { CT: "", MRI: "", 治療: "", 治療サブ優先: "", 治療サブ: "", RI: "", RIサブ: "", MMG: "", 受付: "", 受付ヘルプ: "", 透析後胸部: "" };
const DEFAULT_RULES = { 
  staffList: DEFAULT_STAFF, receptionStaffList: "", customHolidays: "", capacity: { CT: 3, MRI: 3, 治療: 3, RI: 1 }, 
  ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], 
  lateShifts: [{ section: "透視（6号）", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" }], 
  helpThreshold: 17, lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], 
  lunchPrioritySections: "RI,1号室,2号室,3号室,5号室,CT", lunchLastResortSections: "治療" 
};

const KEY_ALL_DAYS = "shifto_alldays_v91"; 
const KEY_MONTHLY = "shifto_monthly_v91"; 
const KEY_RULES = "shifto_rules_v91";

const TIME_OPTIONS: string[] = ["(AM)", "(PM)"];
for (let h = 8; h <= 19; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 8 && m === 0) continue; 
    const mm = m === 0 ? "00" : m;
    TIME_OPTIONS.push(`(${h}:${mm}〜)`);
    TIME_OPTIONS.push(`(〜${h}:${mm})`);
  }
}

const RENDER_GROUPS: RenderGroup[] = [
  { title: "休務・夜勤", color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] },
  { title: "モダリティ・受付", color: "#3b82f6", sections: ["CT","MRI","RI","MMG","治療","受付","受付ヘルプ","検像"] },
  { title: "一般撮影・透視・その他", color: "#10b981", sections: ["1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","透析後胸部"] },
  { title: "待機・当番", color: "#f59e0b", sections: ["待機","残り・待機","昼当番"] }
];

const pad = (n: number) => String(n).padStart(2, '0');
function split(v: string) { return (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean); }
function join(a: string[]) { return a.filter(Boolean).join("、"); }
function formatDay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }
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

function btnStyle(bg: string): React.CSSProperties { return { background: bg, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 6 }; }
function panelStyle(): React.CSSProperties { return { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)" }; }
function cellStyle(isHeader = false, isHoliday = false, isSelected = false, isSticky = false): React.CSSProperties { 
  let bg = isHeader ? "#f8fafc" : "#fff";
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : "#f0f9ff"; 
  return { border: "1px solid #e2e8f0", padding: "12px", background: bg, fontWeight: isHeader ? 800 : 500, textAlign: isHeader ? "center" : "left", fontSize: 13, minWidth: isHeader && !isSticky ? "100px" : "auto", color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, boxShadow: isSticky ? "2px 0 5px -2px rgba(0,0,0,0.05)" : "none" }; 
}

const MultiSectionPicker = ({ selected, onChange, options }: { selected: string, onChange: (v: string) => void, options: string[] }) => {
  const current = split(selected);
  const handleAdd = (sec: string) => { if (sec && !current.includes(sec)) onChange(join([...current, sec])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
      {current.map((sec, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 16, padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, border: "1px solid #bae6fd" }}>
          {sec} <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.6 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" onChange={(e) => handleAdd(e.target.value)} value="">
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {current.map((name, i) => (
        <div key={i} style={{ background: "#f1f5f9", color: "#334155", borderRadius: 16, padding: "4px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, border: "1px solid #cbd5e1" }}>
          {name} <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" onChange={(e) => handleAdd(e.target.value)} value="">
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
      <button className="btn-hover" onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff"), color: "#2563eb", border: "1px solid #bfdbfe" }}>
        📅 {targetMonday} の週 ▼
      </button>
      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)}></div>
          <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 16, padding: 20, zIndex: 50, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", minWidth: 300 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button onClick={handlePrev} style={{ border: "none", background: "#f1f5f9", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "#475569", fontWeight: "bold" }}>◀</button>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", letterSpacing: "0.05em" }}>{year}年 {month}月</div>
              <button onClick={handleNext} style={{ border: "none", background: "#f1f5f9", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "#475569", fontWeight: "bold" }}>▶</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: 14 }}>
              <thead><tr><th style={{ color: "#ef4444", padding: 6, fontWeight: 700 }}>日</th><th style={{ padding: 6, fontWeight: 700 }}>月</th><th style={{ padding: 6, fontWeight: 700 }}>火</th><th style={{ padding: 6, fontWeight: 700 }}>水</th><th style={{ padding: 6, fontWeight: 700 }}>木</th><th style={{ padding: 6, fontWeight: 700 }}>金</th><th style={{ color: "#3b82f6", padding: 6, fontWeight: 700 }}>土</th></tr></thead>
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
                        if (!d) return <td key={dIdx} style={{ padding: 10 }}></td>;
                        const dateStr = `${year}-${pad(month)}-${pad(d)}`;
                        const holidayName = nationalHolidays[dateStr] || (customHolidays.includes(dateStr) ? "休診日" : null);
                        const isHoliday = !!holidayName;
                        const isSun = dIdx === 0;
                        const isSat = dIdx === 6;
                        let color = "#334155";
                        if (isSun || isHoliday) color = "#ef4444";
                        else if (isSat) color = "#3b82f6";
                        
                        return (
                          <td key={dIdx} style={{ padding: 10, color, fontWeight: isHoliday ? 800 : 500, position: "relative" }} title={holidayName || ""}>
                            {d}
                            {isHoliday && <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, background: "#ef4444", borderRadius: "50%" }}></div>}
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
  const handleAdd = (name: string) => { if (name) onChange(join([...members, name])); };
  const handleRemove = (idx: number) => { const next = [...members]; next.splice(idx, 1); onChange(join(next)); };
  
  const handleTimeChange = (idx: number, newTime: string) => {
    if (noTime) return;
    const next = [...members];
    const core = getCoreName(next[idx]);
    next[idx] = core + newTime;
    onChange(join(next));
  };

  return (
    <div className="card-hover" style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
      <label style={{ fontSize: 13, fontWeight: 800, color: "#475569", marginBottom: 8, letterSpacing: "0.02em" }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {members.map((m, i) => {
          const coreName = getCoreName(m);
          const currentMod = m.substring(coreName.length);
          const isPlaceholder = ROLE_PLACEHOLDERS.includes(coreName) || (customOptions.includes(coreName) && !activeStaff.includes(coreName));
          
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime ? "#334155" : "#0369a1"), borderRadius: 16, padding: "2px 8px 2px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4, border: `1px solid ${isPlaceholder ? "#fde047" : (noTime ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 700 }}>
              <span style={{ userSelect: "none" }}>{coreName}</span>
              {!noTime && (
                <select 
                  value={currentMod} 
                  onChange={(e) => handleTimeChange(i, e.target.value)}
                  style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 11, fontWeight: 800, color: "inherit", cursor: "pointer", padding: "0 18px 0 2px" }}
                >
                  <option value="">終日</option>
                  <option value="(AM)">AM</option>
                  <option value="(PM)">PM</option>
                  {currentMod && !["", "(AM)", "(PM)"].includes(currentMod) && !TIME_OPTIONS.includes(currentMod) && (
                    <option value={currentMod}>{currentMod.replace(/[()]/g, '')}</option>
                  )}
                  {TIME_OPTIONS.filter(t => t !== "(AM)" && t !== "(PM)").map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}
                </select>
              )}
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 4 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 12, color: "#64748b", flex: 1, minWidth: 90, cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "4px 28px 4px 8px" }}>
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
            {ROLE_PLACEHOLDERS.filter(s => !members.some(m => getCoreName(m) === s)).map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
        </select>
      </div>
    </div>
  );
};

export default function App() {
  const [allDays, setAllDays] = useState<Record<string, Record<string, string>>>(() => {
    try { const saved = localStorage.getItem(KEY_ALL_DAYS); if (saved) return JSON.parse(saved); } catch {} return {};
  });

  const [history, setHistory] = useState<Record<string, Record<string, string>>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");

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
      return { id, label: formatDay(curr), isPublicHoliday: !!holidayName, holidayName, cells: allDays[id] || Object.fromEntries(SECTIONS.map(s => [s, ""])) };
    });
  }, [targetMonday, allDays, customHolidays, nationalHolidays]);

  useEffect(() => { if (!sel || !days.find(d => d.id === sel)) setSel(days[0].id); }, [days, sel]);

  const cur = days.find(d => d.id === sel) || days[0];

  const activeGeneralStaff = useMemo(() => parseAndSortStaff(customRules.staffList || DEFAULT_STAFF), [customRules.staffList]);
  const activeReceptionStaff = useMemo(() => parseAndSortStaff(customRules.receptionStaffList || ""), [customRules.receptionStaffList]);
  const allStaff = useMemo(() => Array.from(new Set([...activeGeneralStaff, ...activeReceptionStaff])), [activeGeneralStaff, activeReceptionStaff]);

  const getStaffForSection = (section: string) => (section === "受付" ? activeReceptionStaff : ["明け", "入り", "土日休日代休", "不在", "待機", "残り・待機", "昼当番", "受付ヘルプ"].includes(section) ? allStaff : activeGeneralStaff);
  const getStaffForCategory = (category: string) => (category === "受付" ? activeReceptionStaff : category === "受付ヘルプ" ? allStaff : activeGeneralStaff);

  const setAllDaysWithHistory = (updater: any) => {
    setAllDays(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) setHistory(h => [...h, prev].slice(-20)); 
      return next;
    });
  };

  const handleUndo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      setAllDays(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  const updateDay = (k: string, v: string) => { 
    setAllDaysWithHistory((prev: any) => {
      const nextState = { ...prev, [cur.id]: { ...(prev[cur.id] || cur.cells), [k]: v } };
      if (k === "入り") {
        const dateObj = new Date(cur.id); dateObj.setDate(dateObj.getDate() + 1);
        const nextId = `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())}`;
        nextState[nextId] = { ...(nextState[nextId] || {}), "明け": join(split(v).map(getCoreName)) };
      }
      return nextState;
    }); 
  };
  
  const updateMonthly = (category: string, value: string) => { setMonthlyAssign(prev => ({ ...prev, [category]: value })); };
  const addRule = (type: string, defaultObj: any) => setCustomRules((r: any) => ({ ...r, [type]: [...(r[type] || []), defaultObj] }));
  const updateRule = (type: string, idx: number, key: string, val: string) => { setCustomRules((r: any) => { const arr = [...r[type]]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: string, idx: number) => { setCustomRules((r: any) => { const arr = [...r[type]]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };

  const handleCopyYesterday = () => { const idx = days.findIndex(d => d.id === cur.id); if (idx <= 0) return; setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...days[idx - 1].cells } })); };
  const handleClearRestDay = () => { if (window.confirm("休務をクリアしますか？")) setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...prev[cur.id], ...Object.fromEntries(REST_SECTIONS.map(s => [s, ""])) } })); };
  const handleClearRestWeek = () => {
    if (window.confirm("表示中の一週間分の休務をクリアしますか？")) {
      setAllDaysWithHistory((prev: any) => {
        const next = { ...prev };
        days.forEach(d => { next[d.id] = { ...(next[d.id] || d.cells), ...Object.fromEntries(REST_SECTIONS.map(s => [s, ""])) }; });
        return next;
      });
    }
  };
  const handleClearWorkDay = () => { if (window.confirm("業務配置をクリアしますか？")) setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...prev[cur.id], ...Object.fromEntries(ASSIGNABLE_SECTIONS.map(s => [s, ""])) } })); };
  const handleClearWorkWeek = () => {
    if (window.confirm("表示中の一週間分の業務配置をクリアしますか？")) {
      setAllDaysWithHistory((prev: any) => {
        const next = { ...prev };
        days.forEach(d => { next[d.id] = { ...(next[d.id] || d.cells), ...Object.fromEntries(ASSIGNABLE_SECTIONS.map(s => [s, ""])) }; });
        return next;
      });
    }
  };

  const handleResetAll = () => { if (window.confirm("全リセットしますか？")) { setAllDaysWithHistory({}); setMonthlyAssign(DEFAULT_MONTHLY_ASSIGN); setCustomRules(DEFAULT_RULES); localStorage.clear(); } };
  const handleExport = () => { const blob = new Blob([JSON.stringify({ allDays, monthlyAssign, customRules })], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `shifto_${targetMonday}.json`; a.click(); };
  const handleImport = (e: any) => { const r = new FileReader(); r.onload = (ev: any) => { const d = JSON.parse(ev.target.result); if (d.allDays) { setAllDaysWithHistory(d.allDays); setMonthlyAssign(d.monthlyAssign); setCustomRules(d.customRules); } }; r.readAsText(e.target.files[0]); };
  
  const handleCopyToClipboard = () => navigator.clipboard.writeText(JSON.stringify({ allDays, monthlyAssign, customRules })).then(() => alert("コピー完了！LINEやメールでスマホに送付してください。")).catch(()=>alert("コピー失敗"));
  const handleTextImport = () => { try { const d = JSON.parse(importText); setAllDaysWithHistory(d.allDays); setMonthlyAssign(d.monthlyAssign); setCustomRules(d.customRules); alert("復元完了！"); setImportText(""); } catch(e) { alert("形式エラー"); } };

  const warnings = useMemo(() => {
    if (!cur || cur.isPublicHoliday) return [];
    const w: {type: 'alert'|'info'|'error', msg: string}[] = [];
    const cells = cur.cells;

    Object.entries(customRules.capacity || {}).forEach(([room, target]) => {
      const count = split(cells[room]).length;
      if (count === 0 && (target as number) > 0) w.push({type: 'error', msg: `⚠️【${room}】に誰も配置されていません！`});
      else if (count < (target as number)) w.push({type: 'info', msg: `💡【${room}】が不足（${count}/${target}人）`});
    });

    (customRules.ngPairs || []).forEach((ng: any) => {
      if (ng.level === 'soft' && ng.s1 && ng.s2) {
        SECTIONS.forEach(sec => {
          const names = split(cells[sec]).map(getCoreName);
          if (names.includes(ng.s1) && names.includes(ng.s2)) w.push({type: 'alert', msg: `🤝【${sec}】${ng.s1}さんと${ng.s2}さんが一緒です`});
        });
      }
    });

    (customRules.lateShifts || []).forEach((rule: any) => {
       const m = split(cells[rule.section]);
       if (m.length > 0 && !m.some(x => x.includes(rule.lateTime))) w.push({type: 'alert', msg: `🌇【${rule.section}】${rule.lateTime}がいません`});
    });

    return w;
  }, [cur.cells, customRules]);

  const autoAssign = (day: any, prevDay: any = null, pastDays: any[] = []) => {
    const dayCells = { ...day.cells };
    if (prevDay && prevDay.cells["入り"]) dayCells["明け"] = join(Array.from(new Set([...split(dayCells["明け"]), ...split(prevDay.cells["入り"]).map(getCoreName)])));
    if (day.isPublicHoliday) return { ...day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])) };
    const blockMap = new Map<string, string>();
    allStaff.forEach(s => blockMap.set(s, 'NONE'));
    ["明け","入り","土日休日代休"].forEach(sec => split(dayCells[sec]).forEach(m => blockMap.set(getCoreName(m), 'ALL')));
    split(dayCells["不在"]).forEach(m => { const c = getCoreName(m); blockMap.set(c, m.includes("(AM)") ? 'AM' : m.includes("(PM)") ? 'PM' : 'ALL'); });

    const isForbidden = (staff: string, sec: string) => (customRules.forbidden || []).some((r: any) => r.staff === staff && split(r.sections).includes(sec));
    const hasNGPair = (cand: string, mems: string[], soft: boolean) => mems.some(m => (customRules.ngPairs || []).some((ng: any) => {
      const match = (ng.s1 === cand && ng.s2 === m) || (ng.s1 === m && ng.s2 === cand);
      return match && (ng.level === 'hard' || soft);
    }));

    let skip: string[] = []; let roleRA: Record<string, any> = {}; let kenmu: any[] = [];
    const availCount = activeGeneralStaff.filter(s => blockMap.get(s) !== 'ALL').length;
    (customRules.emergencies || []).forEach((em: any) => {
      if (availCount <= Number(em.threshold)) {
        if (em.type === "role_assign" && (!roleRA[em.role] || em.threshold < roleRA[em.role].threshold)) roleRA[em.role] = em;
        if (em.type === "kenmu") kenmu.push(em);
        if (em.type === "clear" && em.section) skip.push(em.section);
      }
    });

    const strict = ["治療", "RI", "MMG", "透析後胸部"];
    Object.keys(dayCells).forEach(sec => {
      if (REST_SECTIONS.includes(sec)) return;
      if (skip.includes(sec)) { dayCells[sec] = ""; return; }
      let allowed: string[] | null = null;
      if (strict.includes(sec)) {
          if (sec === "治療") allowed = [...split(monthlyAssign.治療), ...split(monthlyAssign.治療サブ優先), ...split(monthlyAssign.治療サブ)];
          else if (sec === "RI") allowed = [...split(monthlyAssign.RI), ...split(monthlyAssign.RIサブ)];
          else allowed = split(monthlyAssign[sec]);
          allowed = allowed.map(getCoreName);
      }
      dayCells[sec] = join(split(dayCells[sec]).map(m => {
        const c = getCoreName(m); const b = blockMap.get(c);
        if (allowed && allowed.length > 0 && !allowed.includes(c)) return null;
        if (b === 'ALL' || (b === 'AM' && m.includes('(AM)')) || (b === 'PM' && m.includes('(PM)'))) return null; 
        return (b === 'AM' && !m.match(/\(.*\)/)) ? `${c}(PM)` : (b === 'PM' && !m.match(/\(.*\)/)) ? `${c}(AM)` : m;
      }).filter(Boolean) as string[]);
    });

    const assignCounts: Record<string, number> = {}; const maxA: Record<string, number> = {};
    allStaff.forEach(s => { assignCounts[s] = 0; maxA[s] = 1; });
    Object.keys(dayCells).forEach(k => { if (!REST_SECTIONS.includes(k) && k !== "昼当番") split(dayCells[k]).forEach(n => assignCounts[getCoreName(n)] = (assignCounts[getCoreName(n)] || 0) + 1); });

    const isUsed = (n: string) => (assignCounts[n] || 0) >= (maxA[n] || 1);
    const addU = (n: string) => { assignCounts[n] = (assignCounts[n] || 0) + 1; };
    const histCounts: Record<string, number> = {}; allStaff.forEach(s => histCounts[s] = 0);
    pastDays.forEach(pd => Object.entries(pd.cells).forEach(([s, v]) => { if (!REST_SECTIONS.includes(s) && s !== "昼当番") split(v as string).forEach(m => { if (histCounts[getCoreName(m)] !== undefined) histCounts[getCoreName(m)]++; }); }));

    const availAllSorted = allStaff.filter(s => blockMap.get(s) !== 'ALL').sort((a, b) => {
      const ab = blockMap.get(a) !== 'NONE', bb = blockMap.get(b) !== 'NONE';
      if (ab && !bb) return -1; if (!ab && bb) return 1;
      return histCounts[a] !== histCounts[b] ? histCounts[a] - histCounts[b] : Math.random() - 0.5;
    });
    const availG = availAllSorted.filter(s => activeGeneralStaff.includes(s)), availR = availAllSorted.filter(s => activeReceptionStaff.includes(s));

    function pick(list: string[], pool: string[], n: number, sec?: string, current: string[] = [], repeat = false) {
      const res: string[] = []; const unique = Array.from(new Set(pool.filter(Boolean)));
      const filter = (soft: boolean) => unique.filter(name => {
        if (!list.includes(name) || isUsed(name) || (sec && isForbidden(name, sec))) return false;
        const fixed = (customRules.fixed || []).some((r:any) => r.staff === name && r.section === sec) || (sec === "RI" && split(monthlyAssign.RI).includes(name));
        if (!repeat && prevDay && sec && !fixed && split(prevDay.cells[sec]).map(getCoreName).includes(name)) return false;
        return !hasNGPair(name, [...current, ...res].map(getCoreName), soft);
      });
      let cand = filter(true); for (const c of cand) { res.push(c); addU(c); if (res.length >= n) return res; }
      cand = filter(false); for (const c of cand) { res.push(c); addU(c); if (res.length >= n) return res; }
      const last = unique.filter(name => list.includes(name) && !isUsed(name) && !(sec && isForbidden(name, sec)) && !hasNGPair(name, [...current, ...res].map(getCoreName), false));
      for (const c of last) { res.push(c); addU(c); if (res.length >= n) return res; }
      return res;
    }

    function fill(list: string[], sec: string, pref: string[], target: number) {
      if (skip.includes(sec)) return; let curM = split(dayCells[sec]); let am = 0, pm = 0;
      curM.forEach(m => { let a=1, p=1; if (m.includes("(AM)") || m.match(/\(〜/)) p=0; if (m.includes("(PM)") || m.match(/〜\)/)) a=0; if(a)am++; if(p)pm++; });
      let safety = 0;
      while ((am < target || pm < target) && safety++ < 20) {
        const pool = pick(list, [...pref, ...list], 1, sec, curM.map(getCoreName), false);
        if (pool.length === 0) break; const c = pool[0], b = blockMap.get(c);
        let t = ""; if (b === 'AM') { t = "(PM)"; pm++; } else if (b === 'PM') { t = "(AM)"; am++; }
        else { if (am < target && pm >= target) { t = "(AM)"; am++; } else if (pm < target && am >= target) { t = "(PM)"; pm++; } else { am++; pm++; } }
        curM.push(`${c}${t}`);
      }
      dayCells[sec] = join(curM);
    }

    (customRules.fixed || []).forEach((r: any) => {
      if (!r.staff || !r.section || !availAllSorted.includes(r.staff) || isUsed(r.staff) || isForbidden(r.staff, r.section) || skip.includes(r.section)) return;
      const curM = split(dayCells[r.section]); if (curM.map(getCoreName).includes(r.staff) || hasNGPair(r.staff, curM.map(getCoreName), false)) return;
      const b = blockMap.get(r.staff); dayCells[r.section] = join([...curM, `${r.staff}${b === 'AM' ? "(PM)" : b === 'PM' ? "(AM)" : ""}`]); addU(r.staff);
    });

    (customRules.pushOuts || []).forEach((po: any) => {
      const s1 = po.s1 || po.triggerStaff, s2 = po.s2 || po.targetStaff, tS = po.triggerSection;
      if (!s1 || !s2 || !tS || !po.targetSections) return;
      if (availG.includes(s1) && availG.includes(s2) && !isUsed(s2)) {
         const mStaff = [...split(monthlyAssign[tS]||""), ...split(monthlyAssign.治療), ...split(monthlyAssign.RI)].map(getCoreName);
         if ((split(dayCells[tS]).map(getCoreName).includes(s1) || mStaff.includes(s1)) && (split(dayCells[tS]).map(getCoreName).includes(s2) || mStaff.includes(s2))) {
            for (const room of split(po.targetSections).filter(s => !skip.includes(s))) {
              if (isForbidden(s2, room)) continue; const curM = split(dayCells[room]);
              if (!hasNGPair(s2, curM.map(getCoreName), false) && curM.length < (room==="CT"||room==="MRI"||room==="治療"?3:1)) {
                const b = blockMap.get(s2); dayCells[room] = join([...curM, `${s2}${b === 'AM' ? "(PM)" : b === 'PM' ? "(AM)" : ""}`]); addU(s2);
                dayCells[tS] = join(split(dayCells[tS]).filter(m => getCoreName(m) !== s2)); break;
              }
            }
         }
      }
    });

    fill([...split(monthlyAssign.治療), ...split(monthlyAssign.治療サブ優先), ...split(monthlyAssign.治療サブ)].filter(s => availG.includes(s)), "治療", [...split(monthlyAssign.治療), ...split(monthlyAssign.治療サブ優先), ...split(monthlyAssign.治療サブ)].filter(s => availG.includes(s)), customRules.capacity?.治療 ?? 3);
    fill([...split(monthlyAssign.RI), ...split(monthlyAssign.RIサブ)].filter(s => availG.includes(s)), "RI", [...split(monthlyAssign.RI), ...split(monthlyAssign.RIサブ)].filter(s => availG.includes(s)), customRules.capacity?.RI ?? 1);
    split(dayCells["RI"]).forEach(n => maxA[getCoreName(n)] = 2);

    if (!skip.includes("CT")) { fill(availG, "CT", split(monthlyAssign.CT || ""), customRules.capacity?.CT ?? 3); if (split(dayCells["CT"]).length >= 4) maxA[getCoreName(split(dayCells["CT"]).slice(-1)[0])] = 2; }
    if (!skip.includes("MRI")) fill(availG, "MRI", split(monthlyAssign.MRI || ""), customRules.capacity?.MRI ?? 3);

    Object.keys(customRules.capacity || {}).forEach(r => { if (!["治療", "RI", "CT", "MRI", "受付"].includes(r) && !skip.includes(r)) fill(r === "MMG" || r === "透析後胸部" ? split(monthlyAssign[r] || "").filter(s => availG.includes(s)) : r === "受付ヘルプ" ? availAllSorted : availG, r, split(monthlyAssign[r] || "").filter(s => availG.includes(s)), customRules.capacity[r]); });

    if (!skip.includes("受付")) {
      const ut = customRules.capacity?.受付 ?? 2; let curU = split(dayCells["受付"]);
      split(monthlyAssign.受付 || "").forEach(n => { if (availR.includes(n) && !isUsed(n) && !curU.map(getCoreName).includes(n)) { curU.push(n); addU(n); } });
      if (ut > curU.length) curU = [...curU, ...pick(availR, availR, ut - curU.length, "受付", curU)];
      dayCells["受付"] = join(curU);
    }

    ["1号室", "2号室", "3号室", "5号室", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA"].forEach(sec => { if (!skip.includes(sec) && !Object.keys(customRules.capacity || {}).includes(sec)) fill(availG, sec, [], 1); });

    (customRules.lateShifts || []).forEach((rule: any) => {
      if (skip.includes(rule.section)) return; fill(availG, rule.section, [], 1);
      let m = split(dayCells[rule.section]); if (m.length === 0) return;
      m = m.map(x => (!x.includes("(")) ? x + rule.dayEndTime : x);
      if (!m.some(x => x.includes(rule.lateTime))) {
        const cand = availG.filter(n => !m.map(getCoreName).includes(n) && blockMap.get(n) !== 'AM' && !isForbidden(n, rule.section) && !hasNGPair(n, m.map(getCoreName), false));
        let p = cand.sort((a,b)=>(assignCounts[a]||0)-(assignCounts[b]||0))[0];
        if (!p) { const f = availG.filter(n => !m.map(getCoreName).includes(n) && blockMap.get(n) !== 'AM'); if (f.length>0) p=f[0]; }
        if (p) { m.push(`${p}${rule.lateTime}`); addU(p); }
      }
      dayCells[rule.section] = join(m);
    });

    kenmu.forEach((km: any) => { const p1 = split(dayCells[km.s1]); if (p1.length > 0 && !skip.includes(km.s2)) dayCells[km.s2] = join(p1); });
    if (!skip.includes("残り・待機")) { let resM = split(dayCells["残り・待機"]); availAllSorted.filter(n => !isUsed(n)).forEach(n => { const b = blockMap.get(n); resM.push(`${n}${b === 'AM' ? "(PM)" : b === 'PM' ? "(AM)" : ""}`); addU(n); }); dayCells["残り・待機"] = join(resM); }
    fill(availG, "待機", [], 1);

    if (!skip.includes("昼当番")) {
      let curL = split(dayCells["昼当番"]); let base = customRules.lunchBaseCount ?? 3;
      const sd = (customRules.lunchSpecialDays || []).find((s:any) => s.day === day.label.match(/\((.*?)\)/)?.[1]);
      const target = (sd ? Number(sd.count) : base) + Math.max(0, (customRules.capacity?.受付 ?? 2) - split(dayCells["受付"]).length);
      split(customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT").forEach(sec => split(dayCells[sec]).forEach(n => { if (!curL.map(getCoreName).includes(getCoreName(n)) && curL.length < target) curL.push(getCoreName(n)); }));
      dayCells["昼当番"] = join(curL.slice(0, target));
    }
    return { ...day, cells: dayCells };
  };

  const handleAutoOne = () => { if(cur.isPublicHoliday) return; setAllDaysWithHistory((prev: any) => { const idx = days.findIndex(d => d.id === cur.id); const updated = autoAssign({ ...days[idx], cells: prev[days[idx].id] || days[idx].cells }, idx > 0 ? { ...days[idx-1], cells: prev[days[idx-1].id] || days[idx-1].cells } : null, days.slice(0, idx).map(d => ({...d, cells: prev[d.id] || d.cells}))); return { ...prev, [updated.id]: updated.cells }; }); };
  const handleAutoAll = () => { setAllDaysWithHistory((prev: any) => { const next = { ...prev }; let pDay = null; const temp: any[] = []; for (let i = 0; i < 5; i++) { const up = autoAssign({ ...days[i], cells: next[days[i].id] || days[i].cells }, pDay, temp); next[up.id] = up.cells; pDay = up; temp.push(up); } return next; }); };

  return (
    <div style={{ padding: "20px 12px", maxWidth: 1400, margin: "0 auto", background: "#f4f7f9" }}>
      <style>{globalStyle}</style>
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap", padding: "16px 24px" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 24, fontWeight: 800 }}>勤務割付システム</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button className="btn-hover" onClick={handleAutoOne} style={btnStyle("#10b981")}>✨ 表示日割当</button>
          <button className="btn-hover" onClick={handleAutoAll} style={btnStyle("#0ea5e9")}>⚡ 週間割当</button>
          <button className="btn-hover" onClick={handleUndo} style={{...btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6"), cursor: history.length === 0 ? "not-allowed" : "pointer"}} disabled={history.length === 0}>↩️ 戻る</button>
          <button className="btn-hover" onClick={handleExport} style={btnStyle("#6366f1")}>💾 保存</button>
          <button className="btn-hover" onClick={() => fileInputRef.current?.click()} style={btnStyle("#8b5cf6")}>📂 読込</button>
          <input type="file" ref={fileInputRef} accept=".json,application/json,text/plain,*/*" style={{ display: "none" }} onChange={handleImport} />
          <button className="btn-hover" onClick={() => window.print()} style={btnStyle("#475569")}>🖨️ 印刷</button>
          <button className="btn-hover" onClick={handleResetAll} style={btnStyle("#ef4444")}>🗑️ リセット</button>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 24 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#0f766e", padding: "4px", fontSize: 16 }}>⚙️ スタッフ・ルール設定</summary>
          <div style={{ paddingTop: 20, borderTop: "2px dashed #e2e8f0", marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 20 }}>
              <div><label style={{ fontSize: 13, fontWeight: 800 }}>スタッフ(一般)</label><textarea value={customRules.staffList} onChange={(e) => setCustomRules({...customRules, staffList: e.target.value})} style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 80 }} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 800 }}>スタッフ(受付)</label><textarea value={customRules.receptionStaffList} onChange={(e) => setCustomRules({...customRules, receptionStaffList: e.target.value})} style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 80 }} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 800 }}>追加休診日</label><textarea value={customRules.customHolidays} onChange={(e) => setCustomRules({...customRules, customHolidays: e.target.value})} style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 80 }} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 10px 0" }}>👥 絶対優先人数</h4>
                {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                  <div key={room} className="rule-row" style={{background:"#fff", padding:4, borderRadius:8}}>
                    <span style={{flex:1, fontWeight:700}}>{room}</span>
                    <input type="number" value={count as number} onChange={(e) => setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: Number(e.target.value)}})} className="rule-num" />
                    <button onClick={() => { const n = {...customRules.capacity}; delete n[room]; setCustomRules({...customRules, capacity: n}); }} className="rule-del">✖</button>
                  </div>
                ))}
                <select onChange={(e) => { if(e.target.value) setCustomRules({...customRules, capacity: {...customRules.capacity, [e.target.value]: 1}}); e.target.value=""; }} className="rule-sel"><option value="">＋追加</option>{ROOM_SECTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select>
              </div>

              {/* ↓↓↓ 完全復活した特殊ルールのUIたち ↓↓↓ */}
              <div style={{ background: "#fff7ed", padding: 16, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 12px 0" }}>🔄 代打ルール</h4>
                {(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:8, borderRadius:8}}>
                    <select value={rule.target} onChange={(e) => updateRule("substitutes", idx, "target", e.target.value)} className="rule-sel"><option value="">対象</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span>➔</span>
                    <div style={{flex:1, minWidth:180}}>
                      <MultiStaffPicker selected={rule.subs} onChange={(v: string) => updateRule("substitutes", idx, "subs", v)} options={activeGeneralStaff} placeholder="代打追加" />
                    </div>
                    <span>を</span>
                    <select value={rule.section} onChange={(e) => updateRule("substitutes", idx, "section", e.target.value)} className="rule-sel"><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span>に優先</span>
                    <button onClick={() => removeRule("substitutes", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打追加</button>
              </div>

              <div style={{ background: "#fef2f2", padding: 16, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 12px 0" }}>🚫 NGペア</h4>
                {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.s1} onChange={(e) => updateRule("ngPairs", idx, "s1", e.target.value)} className="rule-sel"><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span>と</span>
                    <select value={rule.s2} onChange={(e) => updateRule("ngPairs", idx, "s2", e.target.value)} className="rule-sel"><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.level || "hard"} onChange={(e) => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{flex:"0 0 100px"}}><option value="hard">絶対NG</option><option value="soft">なるべく</option></select>
                    <button onClick={() => removeRule("ngPairs", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ NGペア追加</button>
              </div>

              <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 12px 0" }}>🔒 専従</h4>
                {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row">
                    <select value={rule.staff} onChange={(e) => updateRule("fixed", idx, "staff", e.target.value)} className="rule-sel"><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.section} onChange={(e) => updateRule("fixed", idx, "section", e.target.value)} className="rule-sel"><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("fixed", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 専従追加</button>
              </div>

              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 12px 0" }}>🙅 担当不可</h4>
                {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{marginBottom:16, paddingBottom:16, borderBottom:"1px solid #e2e8f0"}}>
                    <div className="rule-row">
                      <select value={rule.staff} onChange={(e) => updateRule("forbidden", idx, "staff", e.target.value)} className="rule-sel"><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("forbidden", idx)} className="rule-del">✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.sections} onChange={(v: string) => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 担当不可追加</button>
              </div>

              <div style={{ background: "#fef08a", padding: 16, borderRadius: 12, gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 12px 0" }}>🚨 緊急ルール（人数不足時）</h4>
                <div className="rule-row" style={{background:"#fff", padding:8, borderRadius:8}}>
                  <span>🚑 発動ライン: 出勤</span>
                  <input type="number" value={customRules.helpThreshold ?? 17} onChange={(e) => setCustomRules({...customRules, helpThreshold: Number(e.target.value)})} className="rule-num" />
                  <span>人以下</span>
                </div>
                {(customRules.emergencies || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:8, borderRadius:8}}>
                    <span>出勤</span><input type="number" value={rule.threshold} onChange={(e) => updateRule("emergencies", idx, "threshold", e.target.value)} className="rule-num" /><span>人以下➔</span>
                    <select value={rule.type} onChange={(e) => updateRule("emergencies", idx, "type", e.target.value)} className="rule-sel" style={{flex:"0 0 100px"}}>
                      <option value="role_assign">配置</option><option value="kenmu">兼務</option><option value="clear">空にする</option>
                    </select>
                    {rule.type === "role_assign" ? (
                      <><select value={rule.role} onChange={(e) => updateRule("emergencies", idx, "role", e.target.value)} className="rule-sel"><option value="">設定</option>{MONTHLY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select><span>を</span><select value={rule.section} onChange={(e) => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel"><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></>
                    ) : rule.type === "kenmu" ? (
                      <><span>[</span><select value={rule.s1} onChange={(e) => updateRule("emergencies", idx, "s1", e.target.value)} className="rule-sel"><option value="">場所1</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select><span>] が [</span><select value={rule.s2} onChange={(e) => updateRule("emergencies", idx, "s2", e.target.value)} className="rule-sel"><option value="">場所2</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select><span>] 兼務</span></>
                    ) : (
                      <><select value={rule.section} onChange={(e) => updateRule("emergencies", idx, "section", e.target.value)} className="rule-sel"><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select><span>を空にする</span></>
                    )}
                    <button onClick={() => removeRule("emergencies", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("emergencies", { threshold: 16, type: "clear", role: "", section: "", s1: "", s2: "" })}>＋ 緊急ルール追加</button>
              </div>
              {/* ↑↑↑ 復元ここまで ↑↑↑ */}

              <div style={{ background: "#f5f3ff", padding: 16, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 12px 0" }}>🌆 遅番・引き継ぎ</h4>
                {(customRules.lateShifts || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:8, borderRadius:8}}>
                    <select value={rule.section} onChange={(e) => updateRule("lateShifts", idx, "section", e.target.value)} className="rule-sel" style={{flex:1}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.lateTime} onChange={(e) => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{flex:1}}>{TIME_OPTIONS.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <button onClick={() => removeRule("lateShifts", idx)} className="rule-del">✖</button>
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルール追加</button>
              </div>
              <div style={{ background: "#e0f2fe", padding: 16, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 12px 0" }}>🎱 玉突き・同室回避</h4>
                {(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ background:"#fff", padding:8, borderRadius:8, marginBottom:8 }}>
                    <div className="rule-row">
                      <select value={rule.s1} onChange={(e) => updateRule("pushOuts", idx, "s1", e.target.value)} className="rule-sel"><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span>と</span>
                      <select value={rule.s2} onChange={(e) => updateRule("pushOuts", idx, "s2", e.target.value)} className="rule-sel"><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    <div className="rule-row" style={{marginTop:4}}>
                      <span>が同じ</span>
                      <select value={rule.triggerSection} onChange={(e) => updateRule("pushOuts", idx, "triggerSection", e.target.value)} className="rule-sel"><option value="">部屋</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span>なら後者を移動</span>
                      <button onClick={() => removeRule("pushOuts", idx)} className="rule-del">✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.targetSections} onChange={(v: string) => updateRule("pushOuts", idx, "targetSections", v)} options={ROOM_SECTIONS} />
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("pushOuts", { s1: "", s2: "", triggerSection: "", targetSections: "" })}>＋ 追加</button>
              </div>
              <div style={{ background: "#fdf2f8", padding: 16, borderRadius: 12, gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 12px 0" }}>📱 スマホ・PC間データ移行（コピペ用）</h4>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-hover" onClick={handleCopyToClipboard} style={{ ...btnStyle("#db2777"), flex: 1 }}>📋 データをコピー</button>
                  <input type="text" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="スマホでコピーした文字をここに貼り付け" style={{ flex: 2, padding: 10, borderRadius: 8, border: "1px solid #f9a8d4" }} />
                  <button className="btn-hover" onClick={handleTextImport} style={{ ...btnStyle("#be185d"), flex: 1 }}>✨ 復元</button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "2px dashed #cbd5e1" }}>
              <h4 style={{ margin: "0 0 12px 0" }}>📅 月間担当</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => (
                  <SectionEditor key={key} section={label} value={monthlyAssign[key] || ""} activeStaff={getStaffForCategory(key)} onChange={(v: string) => updateMonthly(key, v)} noTime={true} customOptions={(key === "受付ヘルプ") ? GENERAL_ROOMS : []} />
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="print-area" style={{ ...panelStyle(), marginBottom: 24, padding: "20px 12px" }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>週間一覧</h3>
        <div className="scroll-container">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{...cellStyle(true, false, false, true), borderRight: "2px solid #e2e8f0"}}>区分</th>
                {days.map(day => (
                  <th key={day.id} style={cellStyle(true, day.isPublicHoliday, day.id === sel)}>
                    <div>{day.label}</div>
                    {day.isPublicHoliday && <div style={{ fontSize: 10, color: "#ef4444" }}>🎌 {day.holidayName}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map(sec => (
                <tr key={sec}>
                  <td style={{...cellStyle(true, false, false, true), borderRight: "2px solid #e2e8f0"}}>{sec}</td>
                  {days.map(day => <td key={day.id + sec} style={cellStyle(false, day.isPublicHoliday, day.id === sel)}>{!day.isPublicHoliday && split(day.cells[sec]).join("、")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), borderRadius: "24px 24px 0 0" }}>
        <div className="scroll-container hide-scrollbar" style={{ display: "flex", gap: 6, borderBottom: "2px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
          {days.map(d => (
            <button className="btn-hover" key={d.id} onClick={() => setSel(d.id)} style={{ padding: "10px 18px", border: "none", borderRadius: "12px 12px 0 0", background: d.id === sel ? "#2563eb" : "transparent", color: d.id === sel ? "#fff" : (d.isPublicHoliday ? "#ef4444" : "#64748b"), fontWeight: 800 }}>
              {d.label} {d.isPublicHoliday && "🎌"}
            </button>
          ))}
          <div style={{ flex: 1 }}></div>
          <button className="btn-hover" onClick={handleCopyYesterday} style={{ ...btnStyle("#f8fafc"), color: "#475569", border: "1px solid #cbd5e1" }}>📋 昨日の入力をコピー</button>
        </div>

        {!cur.isPublicHoliday ? (
          <div style={{ display: "grid", gap: 24 }}>
            {warnings.length > 0 && (
              <div style={{ background: "#fff", border: "2px solid #e2e8f0", padding: "16px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#475569", marginBottom: "10px", display:"flex", alignItems:"center", gap:6 }}>💡 配置のチェックリスト</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {warnings.map((w, i) => (
                    <div key={i} style={{ 
                      background: w.type === 'error' ? "#fef2f2" : w.type === 'alert' ? "#fff7ed" : "#f0f9ff", 
                      border: `1px solid ${w.type === 'error' ? "#fecaca" : w.type === 'alert' ? "#fdba74" : "#bae6fd"}`, 
                      padding: "6px 12px", borderRadius: "8px", fontSize: "12px", 
                      color: w.type === 'error' ? "#b91c1c" : w.type === 'alert' ? "#c2410c" : "#0369a1", 
                      fontWeight: 700 
                    }}>
                      {w.msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {RENDER_GROUPS.map((group: RenderGroup) => (
              <div key={group.title}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, color: "#475569", margin: 0, display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                    <span style={{ width: 4, height: 16, background: group.color, borderRadius: 2 }}></span>{group.title}
                  </h4>
                  {/* ★ 週間クリアボタンを復元し、エラーを解消！ */}
                  {group.title === "休務・夜勤" && (
                    <div style={{display:"flex", gap:8}}>
                      <button onClick={handleClearRestDay} className="btn-hover" style={{ background: "transparent", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>🧹 1日クリア</button>
                      <button onClick={handleClearRestWeek} className="btn-hover" style={{ background: "transparent", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>🧹 週間クリア</button>
                    </div>
                  )}
                  {group.title === "モダリティ・受付" && (
                    <div style={{display:"flex", gap:8}}>
                      <button onClick={handleClearWorkDay} className="btn-hover" style={{ background: "transparent", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>🧹 1日クリア</button>
                      <button onClick={handleClearWorkWeek} className="btn-hover" style={{ background: "transparent", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>🧹 週間クリア</button>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {group.sections.map((s: string) => (
                    <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={getStaffForSection(s)} onChange={(v: string) => updateDay(s, v)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "60px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "2px dashed #cbd5e1" }}>
            <h3 style={{ color: "#64748b" }}>🎌 休診日のため、入力できません。</h3>
          </div>
        )}
      </div>
    </div>
  );
}
