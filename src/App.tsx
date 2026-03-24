import React, { useEffect, useMemo, useState } from "react";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  body { margin: 0; background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.01em; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 0.6rem center; background-size: 1.2em; }
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
  @media print {
    body { background: #fff; } .no-print { display: none !important; }
    .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
    table { width: 100% !important; border-collapse: collapse !important; }
    th, td { border: 1px solid #000 !important; padding: 6px !important; font-size: 10pt !important; color: #000 !important; position: static !important; }
  }
`;

const SECTIONS = [
  "明け","入り","土日休日代休","不在","待機","CT","MRI","RI",
  "1号室","2号室","3号室","5号室","透視（6号）","透視（11号）",
  "MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","残り・待機","受付","受付ヘルプ"
];

const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","検像","昼当番","残り・待機"].includes(s));
const ROLE_PLACEHOLDERS = ["CT枠", "MRI枠", "RI枠", "治療枠", "MMG枠", "一般枠", "透視枠", "受付枠", "フリー"];

const FALLBACK_HOLIDAYS: Record<string, string> = {
  "2025-01-01": "元日", "2025-01-13": "成人の日", "2025-02-11": "建国記念の日", "2025-02-23": "天皇誕生日", "2025-02-24": "振替休日", "2025-03-20": "春分の日", "2025-04-29": "昭和の日", "2025-05-03": "憲法記念日", "2025-05-04": "みどりの日", "2025-05-05": "こどもの日", "2025-05-06": "振替休日", "2025-07-21": "海の日", "2025-08-11": "山の日", "2025-09-15": "敬老の日", "2025-09-23": "秋分の日", "2025-10-13": "スポーツの日", "2025-11-03": "文化の日", "2025-11-23": "勤労感謝の日", "2025-11-24": "振替休日",
  "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日", "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日", "2026-07-20": "海の日", "2026-08-11": "山の日", "2026-09-21": "敬老の日", "2026-09-22": "国民の休日", "2026-09-23": "秋分の日", "2026-10-12": "スポーツの日", "2026-11-03": "文化の日", "2026-11-23": "勤労感謝の日"
};

const DEFAULT_STAFF = "";

// 月間担当を文字列で管理（柔軟な追加UI用）
const DEFAULT_MONTHLY_ASSIGN: Record<string, string> = {
  CT: "", MRI: "", 治療: "", 治療サブ: "", 
  RIメイン: "", RIサブ: "", MMG: "", 受付: "", 受付ヘルプ: "", 透析後胸部: ""
};

const DEFAULT_RULES = {
  staffList: DEFAULT_STAFF, customHolidays: "",
  capacity: { CT: 3, MRI: 3, 治療: 3, RI: 1 },
  ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], helpThreshold: 17,
  lunchBaseCount: 3,
  lunchSpecialDays: [{ day: "火", count: 4 }],
  lunchConditional: [{ section: "CT", min: 4, out: 1 }],
  lunchPrioritySections: "RI,1号室,2号室,3号室,5号室,CT"
};

const KEY_ALL_DAYS = "shifto_alldays_v40"; 
const KEY_MONTHLY = "shifto_monthly_v40"; 
const KEY_RULES = "shifto_rules_v40";

const TIME_MODIFIERS = ["", "(AM)", "(PM)", "(〜昼)", "(昼〜)", "(〜17時)", "(17時〜)", "(19時〜)", "✍️カスタム"];

function split(v: string) { return (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean); }
function join(a: string[]) { return a.filter(Boolean).join("、"); }
function formatDay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }
function getCoreName(fullName: string) { return fullName.replace(/\(.*\)/g, '').replace(/（.*）/g, '').trim(); }

function btnStyle(bg: string): React.CSSProperties { return { background: bg, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 6 }; }
function panelStyle(): React.CSSProperties { return { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)" }; }
function cellStyle(isHeader = false, isHoliday = false, isSelected = false, isSticky = false): React.CSSProperties { 
  let bg = isHeader ? "#f8fafc" : "#fff";
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : "#f0f9ff"; 
  return { 
    border: "1px solid #e2e8f0", padding: "12px", background: bg, 
    fontWeight: isHeader ? 800 : 500, textAlign: isHeader ? "center" : "left", 
    fontSize: 13, minWidth: isHeader && !isSticky ? "100px" : "auto", 
    color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle",
    position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", 
    zIndex: isSticky ? 10 : 1, boxShadow: isSticky ? "2px 0 5px -2px rgba(0,0,0,0.05)" : "none"
  }; 
}

const pad = (n: number) => String(n).padStart(2, '0');

const MultiSectionPicker = ({ selected, onChange, options }: { selected: string, onChange: (v: string) => void, options: string[] }) => {
  const current = split(selected);
  const handleAdd = (sec: string) => { if (sec && !current.includes(sec)) onChange(join([...current, sec])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
      {current.map((sec, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 16, padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, border: "1px solid #bae6fd" }}>
          {sec}
          <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.6 }}>✖</span>
        </div>
      ))}
      <select onChange={(e) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 12, color: "#64748b", borderRadius: 8, padding: "4px 10px", cursor: "pointer", flex: 1, minWidth: 100, fontWeight: 600 }}>
        <option value="">＋追加</option>
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
              <thead>
                <tr>
                  <th style={{ color: "#ef4444", padding: 6, fontWeight: 700 }}>日</th><th style={{ padding: 6, fontWeight: 700 }}>月</th><th style={{ padding: 6, fontWeight: 700 }}>火</th><th style={{ padding: 6, fontWeight: 700 }}>水</th><th style={{ padding: 6, fontWeight: 700 }}>木</th><th style={{ padding: 6, fontWeight: 700 }}>金</th><th style={{ color: "#3b82f6", padding: 6, fontWeight: 700 }}>土</th>
                </tr>
              </thead>
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

// noTime: 月間担当設定など、時間変更機能が不要な場合にtrueにするフラグ
const SectionEditor = ({ section, value, activeStaff, onChange, noTime = false }: { section: string, value: string, activeStaff: string[], onChange: (v: string) => void, noTime?: boolean }) => {
  const members = split(value);
  const handleAdd = (name: string) => { if (name) onChange(join([...members, name])); };
  const handleRemove = (idx: number) => { const next = [...members]; next.splice(idx, 1); onChange(join(next)); };
  
  const handleCycleTime = (idx: number) => {
    if (noTime) return; // noTimeフラグがあれば時間変更しない
    const next = [...members]; 
    const core = getCoreName(next[idx]); 
    const currentMod = next[idx].substring(core.length);
    
    let modIdx = TIME_MODIFIERS.indexOf(currentMod);
    let nextMod = TIME_MODIFIERS[modIdx === -1 ? 1 : (modIdx + 1) % TIME_MODIFIERS.length];
    
    if (nextMod === "✍️カスタム") {
      const customTime = window.prompt("時間を入力してください（例: 10:30〜）", "");
      if (customTime) {
        nextMod = `(${customTime})`;
      } else {
        nextMod = "";
      }
    }

    next[idx] = core + nextMod; 
    onChange(join(next));
  };

  return (
    <div className="card-hover" style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
      <label style={{ fontSize: 13, fontWeight: 800, color: "#475569", marginBottom: 8, letterSpacing: "0.02em" }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {members.map((m, i) => {
          const isPlaceholder = ROLE_PLACEHOLDERS.includes(getCoreName(m));
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime ? "#334155" : "#0369a1"), borderRadius: 16, padding: "4px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${isPlaceholder ? "#fde047" : (noTime ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 700 }}>
              <span onClick={() => handleCycleTime(i)} style={{ cursor: noTime ? "default" : "pointer", userSelect: "none" }} title={noTime ? "" : "タップで時間を変更"}>{m}</span>
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 12, color: "#64748b", flex: 1, minWidth: 80, cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "4px 8px" }}>
          <option value="">＋追加</option>
          <optgroup label="スタッフ">
            {activeStaff.filter(s => !members.some(m => getCoreName(m) === s)).map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
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

  const [targetMonday, setTargetMonday] = useState(() => {
    const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff));
    return `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`;
  });

  const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string>>(() => {
    try { const saved = localStorage.getItem(KEY_MONTHLY); if (saved) return JSON.parse(saved); } catch {} return DEFAULT_MONTHLY_ASSIGN;
  });
  
  const [customRules, setCustomRules] = useState<any>(() => {
    try { const saved = localStorage.getItem(KEY_RULES); if (saved) return JSON.parse(saved); } catch {} return DEFAULT_RULES;
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

      return { id, label: formatDay(curr), isPublicHoliday, holidayName, cells: allDays[id] || Object.fromEntries(SECTIONS.map(s => [s, ""])) };
    });
  }, [targetMonday, allDays, customHolidays, nationalHolidays]);

  useEffect(() => { if (!sel || !days.find(d => d.id === sel)) setSel(days[0].id); }, [days, sel]);

  const cur = days.find(d => d.id === sel) || days[0];
  const activeStaff = Array.from(new Set(split(customRules.staffList || DEFAULT_STAFF)));

  const updateDay = (k: string, v: string) => { setAllDays(prev => ({ ...prev, [cur.id]: { ...(prev[cur.id] || cur.cells), [k]: v } })); };
  
  // ★ 月間担当を文字列で更新する関数
  const updateMonthly = (category: string, value: string) => { setMonthlyAssign(prev => ({ ...prev, [category]: value })); };
  
  const addRule = (type: string, defaultObj: any) => setCustomRules((r: any) => ({ ...r, [type]: [...(r[type] || []), defaultObj] }));
  const updateRule = (type: string, idx: number, key: string, val: string) => { setCustomRules((r: any) => { const arr = [...r[type]]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: string, idx: number) => { setCustomRules((r: any) => { const arr = [...r[type]]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };

  const handleCopyYesterday = () => {
    const idx = days.findIndex(d => d.id === cur.id);
    if (idx <= 0) { alert("月曜日には前日のデータがありません。"); return; }
    const prevDay = days[idx - 1];
    setAllDays(prev => ({ ...prev, [cur.id]: { ...prevDay.cells } }));
  };

  const handleResetAll = () => {
    if (window.confirm("本当にすべてのデータを初期状態にリセットしますか？\n※これまで入力したシフト、特殊ルール、月間設定がすべて消去されます。")) {
      setAllDays({});
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
    const jsonStr = JSON.stringify(dataObj);
    const blob = new Blob([jsonStr], { type: "application/json" });
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
    reader.onload = (event) => {
      try {
        const dataObj = JSON.parse(event.target?.result as string);
        if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) {
          setAllDays(dataObj.allDays);
          setMonthlyAssign(dataObj.monthlyAssign);
          setCustomRules(dataObj.customRules);
          alert("データを復元しました！");
        } else {
          alert("正しいバックアップファイルではありません。");
        }
      } catch (err) {
        alert("ファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const autoAssign = (day: any, prevDay: any = null, pastDays: any[] = []) => {
    if (day.isPublicHoliday) return { ...day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])) };

    const blocked = new Set([...split(day.cells["明け"]), ...split(day.cells["入り"]), ...split(day.cells["不在"]), ...split(day.cells["土日休日代休"])].map(getCoreName));
    const dayCells = { ...day.cells };
    
    const assignCounts: Record<string, number> = {};
    const maxAssigns: Record<string, number> = {};
    activeStaff.forEach(s => { assignCounts[s] = 0; maxAssigns[s] = 1; });

    Object.keys(dayCells).forEach((key) => { 
      if (["明け","入り","不在","土日休日代休","昼当番"].includes(key)) return; 
      split(dayCells[key]).forEach(name => { const c = getCoreName(name); assignCounts[c] = (assignCounts[c] || 0) + 1; }); 
    });

    const isUsed = (name: string) => (assignCounts[name] || 0) >= (maxAssigns[name] || 1);
    const addUsed = (name: string) => { assignCounts[name] = (assignCounts[name] || 0) + 1; };

    const counts: Record<string, number> = {};
    activeStaff.forEach(s => counts[s] = 0);
    pastDays.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return; split(val as string).forEach(m => { const c = getCoreName(m); if (counts[c] !== undefined) counts[c]++; }); }); });

    const avail = activeStaff.filter(s => !blocked.has(s)).sort((a, b) => {
      if (counts[a] !== counts[b]) return counts[a] - counts[b]; return Math.random() - 0.5;
    });
    const availCount = avail.length;

    const isForbidden = (staff: string, section: string) => (customRules.forbidden || []).some((rule: any) => rule.staff === staff && split(rule.sections).includes(section));

    const hasNGPair = (candidate: string, members: string[], checkSoft: boolean) => members.some(member => (customRules.ngPairs || []).some((ng: any) => {
      const match = (ng.s1 === candidate && ng.s2 === member) || (ng.s1 === member && ng.s2 === candidate);
      if (!match) return false;
      if ((ng.level || "hard") === "hard") return true;
      if ((ng.level || "hard") === "soft" && checkSoft) return true;
      return false;
    }));

    let currentKenmu: any[] = [];
    let roleAssignments: Record<string, any> = {};
    (customRules.emergencies || []).forEach((em: any) => {
      if (availCount <= Number(em.threshold)) {
        if (em.type === "kenmu") currentKenmu.push(em);
        if (em.type === "role_assign") { if (!roleAssignments[em.role] || em.threshold < roleAssignments[em.role].threshold) { roleAssignments[em.role] = em; } }
      }
    });

    function pick(list: string[], n: number, section?: string, currentAssigned: string[] = [], allowRepeatFromPrev = false) {
      const result: string[] = [];
      const uniqueList = Array.from(new Set(list.filter(Boolean)));

      const primary = uniqueList.filter(name => {
        if (!avail.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
        const isMonthlyMain = section === "RI" ? split(monthlyAssign.RIメイン || "").includes(name) : false;
        const isFixed = (customRules.fixed || []).some((r:any) => r.staff === name && r.section === section) || isMonthlyMain;
        if (!allowRepeatFromPrev && prevDay && section && !isFixed) {
          if (split(prevDay.cells[section] || "").map(getCoreName).includes(name)) return false;
        }
        if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), true)) return false;
        return true;
      });
      for (const name of primary) { result.push(name); addUsed(name); if (result.length >= n) return result; }

      const fallback = uniqueList.filter(name => {
        if (!avail.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
        const isMonthlyMain = section === "RI" ? split(monthlyAssign.RIメイン || "").includes(name) : false;
        const isFixed = (customRules.fixed || []).some((r:any) => r.staff === name && r.section === section) || isMonthlyMain;
        if (!allowRepeatFromPrev && prevDay && section && !isFixed) {
          if (split(prevDay.cells[section] || "").map(getCoreName).includes(name)) return false;
        }
        if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), false)) return false;
        return true;
      });
      for (const name of fallback) { result.push(name); addUsed(name); if (result.length >= n) return result; }
      
      const lastResort = uniqueList.filter(name => {
        if (!avail.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
        if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), false)) return false;
        return true;
      });
      for (const name of lastResort) { result.push(name); addUsed(name); if (result.length >= n) return result; }

      return result;
    }

    function fill(section: string, preferredList: string[], targetCount: number) {
      const current = split(dayCells[section]);
      if (current.length >= targetCount) return;
      const picked = pick([...preferredList, ...avail], targetCount - current.length, section, current);
      dayCells[section] = join([...current, ...picked]);
    }

    (customRules.fixed || []).forEach((rule: any) => {
      if (!rule.staff || !rule.section || !avail.includes(rule.staff) || isUsed(rule.staff) || isForbidden(rule.staff, rule.section)) return;
      const current = split(dayCells[rule.section]);
      if (current.map(getCoreName).includes(rule.staff) || hasNGPair(rule.staff, current.map(getCoreName), false)) return;
      dayCells[rule.section] = join([...current, rule.staff]); addUsed(rule.staff);
    });

    Object.values(roleAssignments).forEach((ra: any) => {
      const candidates = split(monthlyAssign[ra.role] || "");
      const staff = candidates.find(s => avail.includes(s) && !isUsed(s));
      if (staff && !split(dayCells[ra.section]).map(getCoreName).includes(staff)) { dayCells[ra.section] = join([...split(dayCells[ra.section]), staff]); addUsed(staff); }
    });

    let currentTreat = split(dayCells["治療"]);
    const treatTarget = customRules.capacity?.治療 ?? 3;
    if (currentTreat.length < treatTarget) {
      const preferredTreat = [...split(monthlyAssign.治療 || ""), ...split(monthlyAssign.治療サブ || "")];
      currentTreat = [...currentTreat, ...pick(preferredTreat, treatTarget - currentTreat.length, "治療", currentTreat)];
      dayCells["治療"] = join(currentTreat);
    }

    let currentRI = split(dayCells["RI"]);
    const riTarget = customRules.capacity?.RI ?? 1;
    if (currentRI.length < riTarget) {
      const preferredRI = [...split(monthlyAssign.RIメイン || ""), ...split(monthlyAssign.RIサブ || "")];
      currentRI = [...currentRI, ...pick(preferredRI, riTarget - currentRI.length, "RI", currentRI)];
      dayCells["RI"] = join(currentRI);
    }
    split(dayCells["RI"]).map(getCoreName).forEach(name => { maxAssigns[name] = 2; });

    (customRules.substitutes || []).forEach((sub: any) => {
      if (!avail.includes(sub.target) || isUsed(sub.target)) {
        const fallbackStaff = split(sub.subs).filter(s => avail.includes(s) && !isUsed(s));
        if (fallbackStaff.length > 0) {
          const currentSec = split(dayCells[sub.section]);
          if (!hasNGPair(fallbackStaff[0], currentSec.map(getCoreName), false) && currentSec.length < 6) {
            dayCells[sub.section] = join([...currentSec, fallbackStaff[0]]); addUsed(fallbackStaff[0]);
          }
        }
      }
    });

    const ctTarget = customRules.capacity?.CT ?? 3;
    fill("CT", split(monthlyAssign.CT || ""), ctTarget);
    const ctMembersAfter = split(dayCells["CT"]).map(getCoreName);
    if (ctMembersAfter.length >= 4) { maxAssigns[ctMembersAfter[ctMembersAfter.length - 1]] = 2; }

    const currentMRI = split(dayCells["MRI"]);
    const mriTarget = customRules.capacity?.MRI ?? 3;
    if (currentMRI.length < mriTarget) {
      const mriMembers = [...currentMRI];
      const addMRI = (name: string) => {
        if (!name || !avail.includes(name) || isUsed(name) || mriMembers.map(getCoreName).includes(name) || isForbidden(name, "MRI") || hasNGPair(name, mriMembers.map(getCoreName), false)) return;
        mriMembers.push(name); addUsed(name);
      };
      (customRules.pushOuts || []).forEach((po: any) => {
        const isTriggerActive = split(dayCells[po.triggerSection]).map(getCoreName).includes(po.triggerStaff) || (split(monthlyAssign[po.triggerSection] || "").includes(po.triggerStaff) && avail.includes(po.triggerStaff) && !isUsed(po.triggerStaff));
        if (isTriggerActive) {
          addMRI(po.triggerStaff);
          if (avail.includes(po.targetStaff) && !isUsed(po.targetStaff)) {
            const allowed = split(po.targetSections);
            for (const room of allowed) {
              if (split(dayCells[room]).length === 0) { dayCells[room] = po.targetStaff; addUsed(po.targetStaff); break; }
            }
          }
        } else { addMRI(po.targetStaff); }
      });
      for (const name of split(monthlyAssign.MRI || "")) { if (mriMembers.length >= mriTarget) break; addMRI(name); }
      for (const name of avail) { if (mriMembers.length >= mriTarget) break; addMRI(name); }
      dayCells["MRI"] = join(mriMembers.slice(0, mriTarget));
    }

    let currentUketsuke = split(dayCells["受付"]);
    const uketsukeMonthly = split(monthlyAssign.受付 || "");
    for (const name of uketsukeMonthly) {
      if (avail.includes(name) && !isUsed(name) && !currentUketsuke.map(getCoreName).includes(name)) { currentUketsuke.push(name); addUsed(name); }
    }
    dayCells["受付"] = join(currentUketsuke);
    const uketsukeShortage = Math.max(0, 2 - currentUketsuke.length);

    const helpMonthly = split(monthlyAssign.受付ヘルプ || "");
    if (helpMonthly.length > 0) {
      fill("受付ヘルプ", helpMonthly, Math.max(split(dayCells["受付ヘルプ"]).length, helpMonthly.length));
    }

    fill("検像", [], 1);

    let helpMembers: string[] = [];
    const threshold = customRules.helpThreshold ?? 17;
    if (availCount <= threshold) {
      helpMembers = [...split(dayCells["RI"]).map(getCoreName)];
      if (ctMembersAfter.length >= 4) { helpMembers.push(ctMembersAfter[ctMembersAfter.length - 1]); }
    }

    ["1号室", "2号室", "3号室", "5号室"].forEach(sec => fill(sec, helpMembers, 1));
    
    const tosekiMonthly = split(monthlyAssign.透析後胸部 || "");
    fill("透析後胸部", tosekiMonthly.length > 0 ? tosekiMonthly : helpMembers, 1);

    fill("透視（6号）", helpMembers, 2);
    let toshi6Members = split(dayCells["透視（6号）"]);
    if (toshi6Members.length === 2 && !toshi6Members[0].includes("(") && !toshi6Members[1].includes("(")) {
      toshi6Members[0] += "(〜17時)";
      toshi6Members[1] += "(17時〜)";
      dayCells["透視（6号）"] = join(toshi6Members);
    }

    fill("MMG", split(monthlyAssign.MMG || ""), 1);
    fill("透視（11号）", helpMembers, 1);
    ["骨塩", "パノラマCT", "ポータブル", "DSA"].forEach(sec => fill(sec, helpMembers, 1));

    currentKenmu.forEach((km: any) => {
      const p1 = split(dayCells[km.s1]);
      if (p1.length > 0) { dayCells[km.s2] = join(p1); }
    });

    const currentReserve = split(dayCells["残り・待機"]);
    if (!currentReserve.length) {
      dayCells["残り・待機"] = join([...currentReserve, ...pick(avail, 1, "残り・待機", currentReserve, true)]);
    }
    fill("待機", [], 1);

    let currentLunch = split(dayCells["昼当番"]);
    
    let baseLunchTarget = customRules.lunchBaseCount ?? 3;
    const dayChar = day.label.match(/\((.*?)\)/)?.[1];
    if (dayChar) {
      const specialDay = (customRules.lunchSpecialDays || []).find((sd:any) => sd.day === dayChar);
      if (specialDay) baseLunchTarget = Number(specialDay.count);
    }
    const lunchTarget = baseLunchTarget + uketsukeShortage;

    (customRules.lunchConditional || []).forEach((cond: any) => {
      if (!cond.section) return;
      const secMembers = split(dayCells[cond.section]);
      if (secMembers.length >= Number(cond.min)) {
        let picked = 0;
        for (const name of secMembers) {
          if (picked >= Number(cond.out)) break;
          const core = getCoreName(name);
          if (!currentLunch.map(getCoreName).includes(core) && currentLunch.length < lunchTarget) {
            currentLunch.push(core);
            picked++;
          }
        }
      }
    });
    
    const prioritySecs = split(customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT");
    const lunchCandidates: string[] = [];
    prioritySecs.forEach(sec => {
      split(dayCells[sec]).forEach(name => lunchCandidates.push(name));
    });

    for (const name of lunchCandidates) { 
      const core = getCoreName(name);
      if (!currentLunch.map(getCoreName).includes(core) && currentLunch.length < lunchTarget) {
        currentLunch.push(core); 
      }
    }
    
    if (currentLunch.length < lunchTarget) {
      const fallbackCandidates = avail.filter(name => !currentLunch.map(getCoreName).includes(name));
      for (const name of fallbackCandidates) { 
        if (currentLunch.length < lunchTarget) currentLunch.push(name); 
      }
    }
    dayCells["昼当番"] = join(currentLunch.slice(0, lunchTarget));

    return { ...day, cells: dayCells };
  };

  const handleAutoOne = () => {
    if(!cur || cur.isPublicHoliday) return;
    setAllDays(prev => {
      const nextAll = { ...prev };
      const idx = days.findIndex(d => d.id === cur.id);
      const baseDay = { ...days[idx], cells: nextAll[days[idx].id] || days[idx].cells };
      const prevDayObj = idx > 0 ? { ...days[idx-1], cells: nextAll[days[idx-1].id] || days[idx-1].cells } : null;
      const updatedDay = autoAssign(baseDay, prevDayObj, days.slice(0, idx).map(d => ({...d, cells: nextAll[d.id] || d.cells})));
      nextAll[updatedDay.id] = updatedDay.cells;
      return nextAll;
    });
  };

  const handleAutoAll = () => {
    setAllDays(prev => {
      const nextAll = { ...prev };
      let prevDayObj = null;
      const tempDays: any[] = [];
      for (let i = 0; i < 5; i++) {
        const baseDay = { ...days[i], cells: nextAll[days[i].id] || days[i].cells };
        const updatedDay = autoAssign(baseDay, prevDayObj, tempDays);
        nextAll[updatedDay.id] = updatedDay.cells;
        prevDayObj = updatedDay;
        tempDays.push(updatedDay);
      }
      return nextAll;
    });
  };

  return (
    <div style={{ padding: "20px 12px", maxWidth: 1400, margin: "0 auto", background: "#f4f7f9" }}>
      <style>{globalStyle}</style>
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap", padding: "16px 24px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a", letterSpacing: "0.02em", fontSize: 24, fontWeight: 800 }}>勤務割付システム</h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13, fontWeight: 600 }}>月間設定・追加柔軟化 (v40 修正版)</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button className="btn-hover" onClick={handleAutoOne} style={btnStyle("#10b981")}>✨ 表示日を自動割当</button>
          <button className="btn-hover" onClick={handleAutoAll} style={btnStyle("#0ea5e9")}>⚡ 全日程を自動割当</button>
          <div style={{ width: "1px", height: "30px", background: "#e2e8f0", margin: "0 4px" }}></div>
          <button className="btn-hover" onClick={handleExport} style={btnStyle("#6366f1")}>💾 保存</button>
          <label className="btn-hover" style={{ ...btnStyle("#8b5cf6"), cursor: "pointer", display: "inline-flex" }}>
            📂 読込
            <input type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
          </label>
          <button className="btn-hover" onClick={() => window.print()} style={btnStyle("#475569")}>🖨️ 印刷</button>
          <button className="btn-hover" onClick={handleResetAll} style={btnStyle("#ef4444")}>🗑️ リセット</button>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 24 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#0f766e", padding: "4px", fontSize: 16, display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.02em" }}>
            <span>⚙️</span> スタッフ名簿 ＆ 特殊ルールの設定を開く
          </summary>
          <div style={{ paddingTop: 20, borderTop: "2px dashed #e2e8f0", marginTop: 16 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>在籍スタッフ名簿（空白OK・カンマ区切り）</label>
                <textarea value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} placeholder="例: 佐藤, 山田 太郎, 高橋" style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 80, fontSize: 14, lineHeight: 1.5 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>追加の休診日（YYYY-MM-DD形式、カンマ区切り）</label>
                <textarea value={customRules.customHolidays || ""} onChange={e => setCustomRules({...customRules, customHolidays: e.target.value})} placeholder="例: 2026-12-29, 2026-12-30" style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 80, fontSize: 14, lineHeight: 1.5 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 20 }}>
              <div style={{ background: "#f5f3ff", padding: 16, borderRadius: 12, border: "1px solid #ddd6fe" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#4f46e5", fontSize: 14, fontWeight: 800 }}>👥 人数設定（自動割当用）</h4>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
                  {["CT", "MRI", "治療", "RI"].map(room => (
                    <div key={room} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", padding: "6px 12px", borderRadius: 8, border: "1px solid #c7d2fe", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#3730a3" }}>{room}:</span>
                      <input type="number" min="0" value={customRules.capacity?.[room] ?? (room==="CT"||room==="MRI"||room==="治療"?3:1)} onChange={e => setCustomRules({...customRules, capacity: {...(customRules.capacity||{}), [room]: Number(e.target.value)}})} style={{ width: 44, border: "none", outline: "none", fontSize: 15, fontWeight: 800, textAlign: "center", color: "#4f46e5", background: "transparent" }} />
                      <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>人</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#eef2ff", padding: 16, borderRadius: 12, border: "1px solid #c7d2fe", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#4338ca", fontSize: 14, fontWeight: 800 }}>🍱 昼当番の自動選出ルール</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#fff", padding: "8px 16px", borderRadius: 10, border: "1px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span>
                  <input type="number" min="0" value={customRules.lunchBaseCount ?? 3} onChange={e => setCustomRules({...customRules, lunchBaseCount: Number(e.target.value)})} style={{ width: 50, padding: "4px", borderRadius: 6, border: "1px solid #a5b4fc", textAlign: "center", fontWeight: 800, color: "#4f46e5", fontSize: 14 }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 14, borderRadius: 10, border: "1px solid #e0e7ff" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: 13, color: "#4f46e5", fontWeight: 800 }}>📅 曜日で人数を変える</h5>
                    {(customRules.lunchSpecialDays || []).map((rule: any, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                        <select value={rule.day} onChange={e => updateRule("lunchSpecialDays", idx, "day", e.target.value)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #c7d2fe", fontWeight: 600 }}>
                          {["月","火","水","木","金","土","日"].map(d => <option key={d} value={d}>{d}曜</option>)}
                        </select>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>は</span>
                        <input type="number" value={rule.count} onChange={e => updateRule("lunchSpecialDays", idx, "count", e.target.value)} style={{ width: "60px", padding: "6px", borderRadius: 6, border: "1px solid #c7d2fe", fontWeight: 600, textAlign: "center" }} />
                        <button onClick={() => removeRule("lunchSpecialDays", idx)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>✖</button>
                      </div>
                    ))}
                    <button className="btn-hover" onClick={() => addRule("lunchSpecialDays", { day: "火", count: 4 })} style={{ ...btnStyle("#fff"), color: "#4f46e5", border: "1px dashed #a5b4fc", padding: "6px 12px", fontSize: 12, width: "100%", justifyContent: "center" }}>＋ 曜日ルールを追加</button>
                  </div>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 14, borderRadius: 10, border: "1px solid #e0e7ff" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: 13, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h5>
                    {(customRules.lunchConditional || []).map((rule: any, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <select value={rule.section} onChange={e => updateRule("lunchConditional", idx, "section", e.target.value)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #c7d2fe", fontWeight: 600 }}>
                          <option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="number" value={rule.min} onChange={e => updateRule("lunchConditional", idx, "min", e.target.value)} style={{ width: "50px", padding: "6px", borderRadius: 6, border: "1px solid #c7d2fe", fontWeight: 600, textAlign: "center" }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>人以上➔</span>
                        <input type="number" value={rule.out} onChange={e => updateRule("lunchConditional", idx, "out", e.target.value)} style={{ width: "50px", padding: "6px", borderRadius: 6, border: "1px solid #c7d2fe", fontWeight: 600, textAlign: "center" }} />
                        <button onClick={() => removeRule("lunchConditional", idx)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>✖</button>
                      </div>
                    ))}
                    <button className="btn-hover" onClick={() => addRule("lunchConditional", { section: "CT", min: 4, out: 1 })} style={{ ...btnStyle("#fff"), color: "#4f46e5", border: "1px dashed #a5b4fc", padding: "6px 12px", fontSize: 12, width: "100%", justifyContent: "center" }}>＋ 条件ルールを追加</button>
                  </div>
                </div>
                <div style={{ background: "#fff", padding: 14, borderRadius: 10, border: "1px solid #e0e7ff", marginTop: 16 }}>
                  <h5 style={{ margin: "0 0 6px 0", fontSize: 13, color: "#4f46e5", fontWeight: 800 }}>🎯 優先的に当番に選出する部屋</h5>
                  <MultiSectionPicker selected={customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT"} onChange={v => setCustomRules({...customRules, lunchPrioritySections: v})} options={ROOM_SECTIONS} />
                </div>
              </div>

              <div style={{ background: "#fef2f2", padding: 16, borderRadius: 12, border: "1px solid #fecaca" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#b91c1c", fontSize: 14, fontWeight: 800 }}>🚫 NGペア</h4>
                {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                    <select value={rule.s1} onChange={e => updateRule("ngPairs", idx, "s1", e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid #fca5a5" }}><option value="">選択</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>と</span>
                    <select value={rule.s2} onChange={e => updateRule("ngPairs", idx, "s2", e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid #fca5a5" }}><option value="">選択</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.level || "hard"} onChange={e => updateRule("ngPairs", idx, "level", e.target.value)} style={{ padding: "6px", borderRadius: 6, border: "1px solid #fca5a5", color: "#b91c1c" }}>
                      <option value="hard">絶対NG</option><option value="soft">なるべくNG</option>
                    </select>
                    <button onClick={() => removeRule("ngPairs", idx)} style={{ border: "none", background: "none", color: "#b91c1c", cursor: "pointer", fontSize: 16 }}>✖</button>
                  </div>
                ))}
                <button className="btn-hover" onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })} style={{ ...btnStyle("#fff"), color: "#b91c1c", border: "1px dashed #fca5a5", padding: "6px 12px", fontSize: 12, width: "100%", justifyContent: "center" }}>＋ 追加</button>
              </div>

              <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 12, border: "1px solid #bbf7d0" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#15803d", fontSize: 14, fontWeight: 800 }}>🔒 専従（必ずここに配置）</h4>
                {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <select value={rule.staff} onChange={e => updateRule("fixed", idx, "staff", e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid #86efac" }}><option value="">選択</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.section} onChange={e => updateRule("fixed", idx, "section", e.target.value)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid #86efac" }}><option value="">選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("fixed", idx)} style={{ border: "none", background: "none", color: "#15803d", cursor: "pointer", fontSize: 16 }}>✖</button>
                  </div>
                ))}
                <button className="btn-hover" onClick={() => addRule("fixed", { staff: "", section: "" })} style={{ ...btnStyle("#fff"), color: "#15803d", border: "1px dashed #86efac", padding: "6px 12px", fontSize: 12, width: "100%", justifyContent: "center" }}>＋ 追加</button>
              </div>

              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#475569", fontSize: 14, fontWeight: 800 }}>🙅 担当不可（複数選択可）</h4>
                {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                      <select value={rule.staff} onChange={e => updateRule("forbidden", idx, "staff", e.target.value)} style={{ width: "140px", padding: "6px", borderRadius: 6, border: "1px solid #cbd5e1", fontWeight: 700 }}><option value="">選択</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("forbidden", idx)} style={{ border: "none", background: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}>✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.sections} onChange={v => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
                ))}
                <button className="btn-hover" onClick={() => addRule("forbidden", { staff: "", sections: "" })} style={{ ...btnStyle("#fff"), color: "#475569", border: "1px dashed #cbd5e1", padding: "6px 12px", fontSize: 12, width: "100%", justifyContent: "center" }}>＋ 追加</button>
              </div>

              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#334155", fontSize: 14, fontWeight: 800 }}>🔄 代打・優先補充</h4>
                {(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <select value={rule.target} onChange={e => updateRule("substitutes", idx, "target", e.target.value)} style={{ width: "90px", padding: "6px", borderRadius: 6, border: "1px solid #cbd5e1" }}><option value="">誰が</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>不在時➔</span>
                    <input type="text" value={rule.subs} onChange={e => updateRule("substitutes", idx, "subs", e.target.value)} placeholder="代打(カンマ区切り)" style={{ flex: 1, minWidth: "120px", padding: "6px", borderRadius: 6, border: "1px solid #cbd5e1" }} />
                    <select value={rule.section} onChange={e => updateRule("substitutes", idx, "section", e.target.value)} style={{ width: "90px", padding: "6px", borderRadius: 6, border: "1px solid #cbd5e1" }}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("substitutes", idx)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>✖</button>
                  </div>
                ))}
                <button className="btn-hover" onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })} style={{ ...btnStyle("#fff"), color: "#475569", border: "1px dashed #cbd5e1", padding: "6px 12px", fontSize: 12, width: "100%", justifyContent: "center" }}>＋ 追加</button>
              </div>

              <div style={{ background: "#e0f2fe", padding: 16, borderRadius: 12, border: "1px solid #bae6fd", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#0369a1", fontSize: 14, fontWeight: 800 }}>➡️ 連動・押し出し（誰かが入ったら別の人を動かす）</h4>
                {(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #bae6fd", paddingBottom: 16 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <select value={rule.triggerStaff} onChange={e => updateRule("pushOuts", idx, "triggerStaff", e.target.value)} style={{ width: "100px", padding: "6px", borderRadius: 6, border: "1px solid #93c5fd" }}><option value="">誰が</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0284c7" }}>が</span>
                      <select value={rule.triggerSection} onChange={e => updateRule("pushOuts", idx, "triggerSection", e.target.value)} style={{ width: "100px", padding: "6px", borderRadius: 6, border: "1px solid #93c5fd" }}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0284c7" }}>に入ったら➔</span>
                      <select value={rule.targetStaff} onChange={e => updateRule("pushOuts", idx, "targetStaff", e.target.value)} style={{ width: "100px", padding: "6px", borderRadius: 6, border: "1px solid #93c5fd" }}><option value="">誰を</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("pushOuts", idx)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.targetSections} onChange={v => updateRule("pushOuts", idx, "targetSections", v)} options={ROOM_SECTIONS} />
                  </div>
                ))}
                <button className="btn-hover" onClick={() => addRule("pushOuts", { triggerStaff: "", triggerSection: "", targetStaff: "", targetSections: "" })} style={{ ...btnStyle("#fff"), color: "#0369a1", border: "1px dashed #7dd3fc", padding: "6px 12px", fontSize: 12, width: "100%", justifyContent: "center" }}>＋ 追加</button>
              </div>

              <div style={{ background: "#fef08a", padding: 16, borderRadius: 12, border: "1px solid #fde047", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#a16207", fontSize: 14, fontWeight: 800 }}>🚨 緊急ルール（人数不足時の自動兼務）</h4>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "8px 16px", borderRadius: 10, border: "1px solid #fde047" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#854d0e" }}>🚑 全体発動ライン: 出勤</span>
                  <input type="number" value={customRules.helpThreshold ?? 17} onChange={e => setCustomRules({...customRules, helpThreshold: Number(e.target.value)})} style={{ width: "60px", padding: "4px", borderRadius: 6, border: "1px solid #fde047", textAlign: "center", fontWeight: 800, color: "#a16207" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#a16207" }}>人以下</span>
                </div>
                {(customRules.emergencies || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center", flexWrap: "wrap", background: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px dashed #fde047" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#854d0e" }}>出勤</span>
                    <input type="number" value={rule.threshold} onChange={e => updateRule("emergencies", idx, "threshold", e.target.value)} style={{ width: "50px", padding: "4px", borderRadius: 6, border: "1px solid #fde047", textAlign: "center" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#854d0e" }}>人以下➔</span>
                    <select value={rule.type} onChange={e => updateRule("emergencies", idx, "type", e.target.value)} style={{ padding: "4px", borderRadius: 6, border: "1px solid #fde047" }}>
                      <option value="role_assign">担当配置</option><option value="kenmu">兼務</option>
                    </select>
                    {rule.type === "role_assign" ? (
                      <>
                        <select value={rule.role} onChange={e => updateRule("emergencies", idx, "role", e.target.value)} style={{ padding: "4px", borderRadius: 6, border: "1px solid #fde047" }}>
                          <option value="">月間設定</option>{Object.keys(monthlyAssign).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#854d0e" }}>を</span>
                        <select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} style={{ padding: "4px", borderRadius: 6, border: "1px solid #fde047" }}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </>
                    ) : (
                      <>
                        <select value={rule.s1} onChange={e => updateRule("emergencies", idx, "s1", e.target.value)} style={{ padding: "4px", borderRadius: 6, border: "1px solid #fde047" }}><option value="">場所1</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#854d0e" }}>と</span>
                        <select value={rule.s2} onChange={e => updateRule("emergencies", idx, "s2", e.target.value)} style={{ padding: "4px", borderRadius: 6, border: "1px solid #fde047" }}><option value="">場所2</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </>
                    )}
                    <button onClick={() => removeRule("emergencies", idx)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>✖</button>
                  </div>
                ))}
                <button className="btn-hover" onClick={() => addRule("emergencies", { threshold: 16, type: "kenmu", role: "", section: "", s1: "", s2: "" })} style={{ ...btnStyle("#fff"), color: "#a16207", border: "1px dashed #ca8a04", padding: "6px 12px", fontSize: 12, width: "100%", justifyContent: "center" }}>＋ 追加</button>
              </div>

            </div>

            {/* ★ 月間担当者の設定（新UI） */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "2px dashed #cbd5e1" }}>
              <h4 style={{ margin: "0 0 6px 0", color: "#1e293b", fontSize: 16, fontWeight: 800, letterSpacing: "0.02em" }}>📅 月間担当者の設定</h4>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16, fontWeight: 600 }}>今月のベースとなる各モダリティの担当者を設定します。（追加形式）</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {Object.entries(monthlyAssign).map(([category, membersStr]) => (
                  <SectionEditor key={category} section={category} value={membersStr} activeStaff={activeStaff} onChange={v => updateMonthly(category, v)} noTime={true} />
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="print-area" style={{ ...panelStyle(), marginBottom: 24, padding: "20px 12px" }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 800, color: "#1e293b", paddingLeft: 8, letterSpacing: "0.02em" }}>週間一覧</h3>
        <div className="scroll-container">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800, background: "#fff" }}>
            <thead>
              <tr>
                <th style={{...cellStyle(true, false, false, true), minWidth: "100px", borderRight: "2px solid #e2e8f0"}}>区分</th>
                {days.map(day => {
                  return (
                    <th key={day.id} style={cellStyle(true, day.isPublicHoliday, day.id === sel)}>
                      <div style={{ fontSize: 14, letterSpacing: "0.02em" }}>{day.label}</div>
                      {day.isPublicHoliday && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>🎌 {day.holidayName}</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map(section => (
                <tr key={section}>
                  <td style={{...cellStyle(true, false, false, true), borderRight: "2px solid #e2e8f0"}}>{section}</td>
                  {days.map(day => {
                    return <td key={day.id + section} style={cellStyle(false, day.isPublicHoliday, day.id === sel)}>
                      {!day.isPublicHoliday && split(day.cells[section]).join("、")}
                    </td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), borderRadius: "24px 24px 0 0", boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
        <div className="scroll-container hide-scrollbar" style={{ display: "flex", gap: 6, borderBottom: "2px solid #e2e8f0", paddingBottom: 12, marginBottom: 20, alignItems: "center" }}>
          {days.map(d => {
            return (
              <button className="btn-hover" key={d.id} onClick={() => setSel(d.id)} style={{ padding: "10px 18px", cursor: "pointer", border: "none", borderRadius: "12px 12px 0 0", background: d.id === sel ? "#2563eb" : "transparent", color: d.id === sel ? "#fff" : (d.isPublicHoliday ? "#ef4444" : "#64748b"), fontWeight: d.id === sel ? 800 : 600, fontSize: 15, whiteSpace: "nowrap", transition: "0.2s" }}>
                {d.label} {d.isPublicHoliday && "🎌"}
              </button>
            )
          })}
          <div style={{ flex: 1 }}></div>
          <button className="btn-hover" onClick={handleCopyYesterday} style={{ ...btnStyle("#f8fafc"), color: "#475569", border: "1px solid #cbd5e1" }} disabled={cur.isPublicHoliday}>📋 昨日の入力をコピー</button>
        </div>

        {cur.isPublicHoliday ? (
          <div style={{ padding: "60px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "2px dashed #cbd5e1" }}>
            <h3 style={{ margin: 0, color: "#64748b", fontSize: 18, fontWeight: 800 }}>🎌 この日（{cur.holidayName}）は祝日・休診日のため、シフトは入力できません。</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 12, fontWeight: 600 }}>※「特殊ルールの設定」から追加の休診日を変更できます。</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 32 }}>
            <div>
              <h4 style={{ fontSize: 14, color: "#475569", margin: "0 0 12px 0", paddingBottom: 6, borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                <span style={{ display: "inline-block", width: 4, height: 16, background: "#94a3b8", borderRadius: 2 }}></span>
                休務・夜勤
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {["明け","入り","土日休日代休","不在"].map(s => (
                  <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={activeStaff} onChange={v => updateDay(s, v)} />
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, color: "#475569", margin: "0 0 12px 0", paddingBottom: 6, borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                <span style={{ display: "inline-block", width: 4, height: 16, background: "#3b82f6", borderRadius: 2 }}></span>
                モダリティ・受付
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {["CT","MRI","RI","MMG","治療","受付","受付ヘルプ","検像"].map(s => (
                  <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={activeStaff} onChange={v => updateDay(s, v)} />
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, color: "#475569", margin: "0 0 12px 0", paddingBottom: 6, borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                <span style={{ display: "inline-block", width: 4, height: 16, background: "#10b981", borderRadius: 2 }}></span>
                一般撮影・透視・その他
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {["1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","透析後胸部"].map(s => (
                  <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={activeStaff} onChange={v => updateDay(s, v)} />
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, color: "#475569", margin: "0 0 12px 0", paddingBottom: 6, borderBottom: "2px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                <span style={{ display: "inline-block", width: 4, height: 16, background: "#f59e0b", borderRadius: 2 }}></span>
                待機・当番
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {["待機","残り・待機","昼当番"].map(s => (
                  <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={activeStaff} onChange={v => updateDay(s, v)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
