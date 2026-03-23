import React, { useEffect, useMemo, useState } from "react";

const globalStyle = `
  body { margin: 0; background: #f8fafc; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Helvetica Neue', Arial, sans-serif; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1em; }
  details > summary { list-style: none; cursor: pointer; }
  details > summary::-webkit-details-marker { display: none; }
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .calendar-row { transition: background-color 0.2s; cursor: pointer; }
  .calendar-row:hover { background-color: #f1f5f9 !important; }
  @media print {
    body { background: #fff; } .no-print { display: none !important; }
    .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
    table { width: 100% !important; border-collapse: collapse !important; }
    th, td { border: 1px solid #000 !important; padding: 6px !important; font-size: 10pt !important; color: #000 !important; }
  }
`;

const SECTIONS = [
  "明け","入り","土日休日代休","不在","待機","CT","MRI","RI",
  "1号室","2号室","3号室","5号室","透視（6号）","透視（11号）",
  "MMG","骨塩","パノラマCT","ポータブル","DSA","治療","検像","昼当番","残り・待機","受付"
];

const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","検像","昼当番","残り・待機"].includes(s));
const ROLE_PLACEHOLDERS = ["CT枠", "MRI枠", "RI枠", "治療枠", "MMG枠", "一般枠", "透視枠", "受付枠", "フリー"];

const FALLBACK_HOLIDAYS: Record<string, string> = {
  "2025-01-01": "元日", "2025-01-13": "成人の日", "2025-02-11": "建国記念の日", "2025-02-23": "天皇誕生日", "2025-02-24": "振替休日", "2025-03-20": "春分の日", "2025-04-29": "昭和の日", "2025-05-03": "憲法記念日", "2025-05-04": "みどりの日", "2025-05-05": "こどもの日", "2025-05-06": "振替休日", "2025-07-21": "海の日", "2025-08-11": "山の日", "2025-09-15": "敬老の日", "2025-09-23": "秋分の日", "2025-10-13": "スポーツの日", "2025-11-03": "文化の日", "2025-11-23": "勤労感謝の日", "2025-11-24": "振替休日",
  "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日", "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日", "2026-07-20": "海の日", "2026-08-11": "山の日", "2026-09-21": "敬老の日", "2026-09-22": "国民の休日", "2026-09-23": "秋分の日", "2026-10-12": "スポーツの日", "2026-11-03": "文化の日", "2026-11-23": "勤労感謝の日"
};

const DEFAULT_STAFF = "";

const DEFAULT_MONTHLY_ASSIGN: Record<string, string[]> = {
  CT: ["","","","","",""], MRI: ["","","","","",""], 治療: ["","","",""], 治療サブ: ["","","",""], 
  RIメイン: ["",""], RIサブ: ["","","",""], MMG: ["","","","",""], 検像: ["",""], 受付: ["","",""]
};

const DEFAULT_RULES = {
  staffList: DEFAULT_STAFF, customHolidays: "",
  capacity: { CT: 3, MRI: 3 },
  ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], helpThreshold: 17
};

const KEY_ALL_DAYS = "shifto_alldays_v32"; 
const KEY_MONTHLY = "shifto_monthly_v32"; 
const KEY_RULES = "shifto_rules_v32";

const TIME_MODIFIERS = ["", "(AM)", "(PM)", "(〜昼)", "(昼〜)", "(17時〜)", "(19時〜)"];

function split(v: string) { return (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean); }
function join(a: string[]) { return a.filter(Boolean).join("、"); }
function formatDay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }
function getCoreName(fullName: string) { return fullName.replace(/\(.*\)/g, '').replace(/（.*）/g, '').trim(); }

function btnStyle(bg: string): React.CSSProperties { return { background: bg, color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", transition: "opacity 0.2s" }; }
function panelStyle(): React.CSSProperties { return { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }; }
function cellStyle(isHeader = false, isHoliday = false, isSelected = false): React.CSSProperties { 
  let bg = isHeader ? "#f1f5f9" : "transparent";
  if (isHoliday) bg = isHeader ? "#cbd5e1" : "#f8fafc"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : "#f0f9ff"; 
  return { border: "1px solid #cbd5e1", padding: "8px 12px", background: bg, fontWeight: isHeader ? 700 : 400, textAlign: isHeader ? "center" : "left", fontSize: 13, minWidth: isHeader ? "80px" : "auto", color: isHoliday && isHeader ? "#64748b" : "inherit", verticalAlign: "top" }; 
}

const pad = (n: number) => String(n).padStart(2, '0');

const MultiSectionPicker = ({ selected, onChange, options }: { selected: string, onChange: (v: string) => void, options: string[] }) => {
  const current = split(selected);
  const handleAdd = (sec: string) => { if (sec && !current.includes(sec)) onChange(join([...current, sec])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
      {current.map((sec, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 16, padding: "4px 10px", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, border: "1px solid #bae6fd" }}>
          {sec}
          <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.6 }}>✖</span>
        </div>
      ))}
      <select onChange={(e) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "transparent", outline: "none", fontSize: 12, color: "#64748b", borderRadius: 8, padding: "4px 8px", cursor: "pointer", flex: 1, minWidth: 80 }}>
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
      <button onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff"), color: "#2563eb", border: "1px solid #cbd5e1" }}>
        📅 {targetMonday} の週 ▼
      </button>
      
      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)}></div>
          <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 12, padding: 16, zIndex: 50, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", minWidth: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button onClick={handlePrev} style={{ border: "none", background: "#f1f5f9", borderRadius: 4, padding: "4px 12px", cursor: "pointer", color: "#475569", fontWeight: "bold" }}>◀</button>
              <div style={{ fontWeight: "bold", fontSize: 15, color: "#1e293b" }}>{year}年 {month}月</div>
              <button onClick={handleNext} style={{ border: "none", background: "#f1f5f9", borderRadius: 4, padding: "4px 12px", cursor: "pointer", color: "#475569", fontWeight: "bold" }}>▶</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ color: "#ef4444", padding: 4 }}>日</th><th style={{ padding: 4 }}>月</th><th style={{ padding: 4 }}>火</th><th style={{ padding: 4 }}>水</th><th style={{ padding: 4 }}>木</th><th style={{ padding: 4 }}>金</th><th style={{ color: "#3b82f6", padding: 4 }}>土</th>
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
                        if (!d) return <td key={dIdx} style={{ padding: 8 }}></td>;
                        const dateStr = `${year}-${pad(month)}-${pad(d)}`;
                        const holidayName = nationalHolidays[dateStr] || (customHolidays.includes(dateStr) ? "休診日" : null);
                        const isHoliday = !!holidayName;
                        const isSun = dIdx === 0;
                        const isSat = dIdx === 6;
                        let color = "#334155";
                        if (isSun || isHoliday) color = "#ef4444";
                        else if (isSat) color = "#3b82f6";
                        
                        return (
                          <td key={dIdx} style={{ padding: 8, color, fontWeight: isHoliday ? "bold" : "normal", position: "relative" }} title={holidayName || ""}>
                            {d}
                            {isHoliday && <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, background: "#ef4444", borderRadius: "50%" }}></div>}
                          </td>
                        );
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 12, textAlign: "center" }}>タップした週の「月〜金」を表示します</div>
          </div>
        </>
      )}
    </div>
  );
};

const SectionEditor = ({ section, value, activeStaff, onChange }: { section: string, value: string, activeStaff: string[], onChange: (v: string) => void }) => {
  const members = split(value);
  const handleAdd = (name: string) => { if (name) onChange(join([...members, name])); };
  const handleRemove = (idx: number) => { const next = [...members]; next.splice(idx, 1); onChange(join(next)); };
  const handleCycleTime = (idx: number) => {
    const next = [...members]; const core = getCoreName(next[idx]); const currentMod = next[idx].substring(core.length);
    const modIdx = TIME_MODIFIERS.indexOf(currentMod); const nextMod = TIME_MODIFIERS[modIdx === -1 ? 1 : (modIdx + 1) % TIME_MODIFIERS.length];
    next[idx] = core + nextMod; onChange(join(next));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px" }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {members.map((m, i) => {
          const isPlaceholder = ROLE_PLACEHOLDERS.includes(getCoreName(m));
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : "#e0f2fe", color: isPlaceholder ? "#a16207" : "#0369a1", borderRadius: 16, padding: "4px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${isPlaceholder ? "#fde047" : "#bae6fd"}`, fontWeight: 600 }}>
              <span onClick={() => handleCycleTime(i)} style={{ cursor: "pointer", userSelect: "none" }} title="タップで時間交代を変更">{m}</span>
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.6 }}>✖</span>
            </div>
          )
        })}
        <select onChange={(e) => handleAdd(e.target.value)} value="" style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#94a3b8", flex: 1, minWidth: 80, cursor: "pointer", fontWeight: 600 }}>
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

  const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string[]>>(() => {
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
  const updateMonthlySlot = (category: string, index: number, value: string) => { setMonthlyAssign(prev => { const arr = [...(prev[category] || [])]; arr[index] = value; return { ...prev, [category]: arr }; }); };
  
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

    // ★ 未使用の room 引数を削除しエラーを解消
    function pick(list: string[], n: number, section?: string, currentAssigned: string[] = [], allowRepeatFromPrev = false) {
      const result: string[] = [];
      const uniqueList = Array.from(new Set(list.filter(Boolean)));

      const primary = uniqueList.filter(name => {
        if (!avail.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
        const isMonthlyMain = section === "RI" ? (monthlyAssign.RIメイン || []).includes(name) : false;
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
        const isMonthlyMain = section === "RI" ? (monthlyAssign.RIメイン || []).includes(name) : false;
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
      const candidates = monthlyAssign[ra.role] || [];
      const staff = candidates.find(s => avail.includes(s) && !isUsed(s));
      if (staff && !split(dayCells[ra.section]).map(getCoreName).includes(staff)) { dayCells[ra.section] = join([...split(dayCells[ra.section]), staff]); addUsed(staff); }
    });

    let currentTreat = split(dayCells["治療"]);
    if (currentTreat.length < 3) {
      const preferredTreat = [...(monthlyAssign.治療 || []), ...(monthlyAssign.治療サブ || [])];
      currentTreat = [...currentTreat, ...pick(preferredTreat, 3 - currentTreat.length, "治療", currentTreat)];
      dayCells["治療"] = join(currentTreat);
    }

    let currentRI = split(dayCells["RI"]);
    if (currentRI.length < 1) {
      const preferredRI = [...(monthlyAssign.RIメイン || []), ...(monthlyAssign.RIサブ || [])];
      currentRI = [...currentRI, ...pick(preferredRI, 1 - currentRI.length, "RI", currentRI)];
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
    fill("CT", monthlyAssign.CT || [], ctTarget);
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
        const isTriggerActive = split(dayCells[po.triggerSection]).map(getCoreName).includes(po.triggerStaff) || ((monthlyAssign[po.triggerSection] || []).includes(po.triggerStaff) && avail.includes(po.triggerStaff) && !isUsed(po.triggerStaff));
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
      for (const name of monthlyAssign.MRI || []) { if (mriMembers.length >= mriTarget) break; addMRI(name); }
      for (const name of avail) { if (mriMembers.length >= mriTarget) break; addMRI(name); }
      dayCells["MRI"] = join(mriMembers.slice(0, mriTarget));
    }

    let currentUketsuke = split(dayCells["受付"]);
    const uketsukeMonthly = monthlyAssign.受付 || [];
    for (const name of uketsukeMonthly) {
      if (avail.includes(name) && !isUsed(name) && !currentUketsuke.map(getCoreName).includes(name)) { currentUketsuke.push(name); addUsed(name); }
    }
    dayCells["受付"] = join(currentUketsuke);
    const uketsukeShortage = Math.max(0, 2 - currentUketsuke.length);

    fill("検像", monthlyAssign.検像 || [], 1);

    let helpMembers: string[] = [];
    const threshold = customRules.helpThreshold ?? 17;
    if (availCount <= threshold) {
      helpMembers = [...split(dayCells["RI"]).map(getCoreName)];
      if (ctMembersAfter.length >= 4) { helpMembers.push(ctMembersAfter[ctMembersAfter.length - 1]); }
    }

    ["1号室", "2号室", "3号室", "5号室"].forEach(sec => fill(sec, helpMembers, 1));
    fill("透視（6号）", helpMembers, 1);
    fill("MMG", monthlyAssign.MMG || [], 1);
    fill("透視（11号）", split(dayCells["MMG"]), 1);
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
    const lunchTarget = (day.label.includes("火") ? 4 : 3) + uketsukeShortage;
    
    const lunchCandidates = [...split(dayCells["RI"]), ...split(dayCells["1号室"]), ...split(dayCells["2号室"]), ...split(dayCells["3号室"]), ...split(dayCells["5号室"]), ...split(dayCells["CT"])];
    for (const name of lunchCandidates) { 
      const core = getCoreName(name);
      if (!currentLunch.map(getCoreName).includes(core) && currentLunch.length < lunchTarget) currentLunch.push(core); 
    }
    
    if (currentLunch.length < lunchTarget) {
      const emergencyLunchCandidates = split(dayCells["治療"]).sort((a, b) => {
        const aCore = getCoreName(a); const bCore = getCoreName(b);
        const aIsCore = aCore === "川崎" || aCore === "阿部" ? 1 : 0; const bIsCore = bCore === "川崎" || bCore === "阿部" ? 1 : 0; return aIsCore - bIsCore;
      });
      for (const name of emergencyLunchCandidates) { 
        const core = getCoreName(name);
        if (!currentLunch.map(getCoreName).includes(core) && currentLunch.length < lunchTarget) currentLunch.push(core); 
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
    <div style={{ padding: "16px 8px", maxWidth: 1400, margin: "0 auto", background: "#f8fafc" }}>
      <style>{globalStyle}</style>

      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap", background: "#fff", padding: "16px 24px", borderRadius: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #e2e8f0" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e293b", letterSpacing: 1, fontSize: 22 }}>勤務割付システム</h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 12, fontWeight: 500 }}>担当不可強化 ＆ エラー修正版</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button onClick={handleAutoOne} style={btnStyle("#10b981")}>✨ 表示日を自動割当</button>
          <button onClick={handleAutoAll} style={btnStyle("#0ea5e9")}>⚡ 全日程を自動割当</button>
          <button onClick={() => window.print()} style={btnStyle("#475569")}>🖨️ 印刷</button>
          <button onClick={handleResetAll} style={btnStyle("#ef4444")}>🗑️ 全リセット</button>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 24 }}>
        <details>
          <summary style={{ fontWeight: 700, color: "#0f766e", padding: "8px 4px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
            <span>⚙️</span> スタッフ名簿 ＆ 特殊ルールの設定を開く
          </summary>
          <div style={{ paddingTop: 20, borderTop: "1px solid #e2e8f0", marginTop: 12 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>在籍スタッフ名簿（空白OK・カンマ区切り）</label>
                <textarea value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} placeholder="例: 佐藤, 山田 太郎, 高橋" style={{ width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, minHeight: 60, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>追加の休診日（YYYY-MM-DD形式、カンマ区切り）</label>
                <textarea value={customRules.customHolidays || ""} onChange={e => setCustomRules({...customRules, customHolidays: e.target.value})} placeholder="例: 2026-12-29, 2026-12-30" style={{ width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, minHeight: 60, fontSize: 13 }} />
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>※日本の祝日は自動でブロックされます。ここには独自の病院休診日などを入れてください。</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
              
              <div style={{ background: "#f5f3ff", padding: 12, borderRadius: 8, border: "1px solid #ddd6fe" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#4f46e5", fontSize: 13 }}>👥 人数設定（自動割当用）</h4>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", padding: "4px 10px", borderRadius: 8, border: "1px solid #c7d2fe" }}>
                    <span style={{ fontSize: 13, fontWeight: "bold", color: "#3730a3" }}>CT:</span>
                    <input type="number" min="0" value={customRules.capacity?.CT ?? 3} onChange={e => setCustomRules({...customRules, capacity: {...(customRules.capacity||{}), CT: Number(e.target.value)}})} style={{ width: 40, border: "none", outline: "none", fontSize: 14, fontWeight: "bold", textAlign: "center", color: "#4f46e5" }} />
                    <span style={{ fontSize: 12, color: "#6366f1" }}>人</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", padding: "4px 10px", borderRadius: 8, border: "1px solid #c7d2fe" }}>
                    <span style={{ fontSize: 13, fontWeight: "bold", color: "#3730a3" }}>MRI:</span>
                    <input type="number" min="0" value={customRules.capacity?.MRI ?? 3} onChange={e => setCustomRules({...customRules, capacity: {...(customRules.capacity||{}), MRI: Number(e.target.value)}})} style={{ width: 40, border: "none", outline: "none", fontSize: 14, fontWeight: "bold", textAlign: "center", color: "#4f46e5" }} />
                    <span style={{ fontSize: 12, color: "#6366f1" }}>人</span>
                  </div>
                </div>
              </div>

              <div style={{ background: "#fef2f2", padding: 12, borderRadius: 8, border: "1px solid #fecaca" }}>
                <h4 style={{ margin: "0 0 8px", color: "#b91c1c", fontSize: 13 }}>🚫 NGペア</h4>
                {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: 4, marginBottom: 8, alignItems: "center" }}>
                    <select value={rule.s1} onChange={e => updateRule("ngPairs", idx, "s1", e.target.value)} style={{ flex: 1, padding: 4, borderRadius: 4 }}><option value="">選択</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span style={{ fontSize: 12, color: "#64748b" }}>と</span>
                    <select value={rule.s2} onChange={e => updateRule("ngPairs", idx, "s2", e.target.value)} style={{ flex: 1, padding: 4, borderRadius: 4 }}><option value="">選択</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.level || "hard"} onChange={e => updateRule("ngPairs", idx, "level", e.target.value)} style={{ padding: 4, borderRadius: 4, border: "1px solid #fca5a5", color: "#b91c1c", fontSize: 12 }}>
                      <option value="hard">絶対NG</option><option value="soft">なるべくNG</option>
                    </select>
                    <button onClick={() => removeRule("ngPairs", idx)} style={{ border: "none", background: "none", color: "#b91c1c", cursor: "pointer" }}>✖</button>
                  </div>
                ))}
                <button onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })} style={{ ...btnStyle("#fff"), color: "#b91c1c", border: "1px solid #fca5a5", padding: "4px 8px", fontSize: 12 }}>＋ 追加</button>
              </div>

              <div style={{ background: "#f0fdf4", padding: 12, borderRadius: 8, border: "1px solid #bbf7d0" }}>
                <h4 style={{ margin: "0 0 8px", color: "#15803d", fontSize: 13 }}>🔒 専従（必ずここに配置）</h4>
                {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    <select value={rule.staff} onChange={e => updateRule("fixed", idx, "staff", e.target.value)} style={{ flex: 1, padding: 4, borderRadius: 4, border: "1px solid #86efac" }}><option value="">選択</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.section} onChange={e => updateRule("fixed", idx, "section", e.target.value)} style={{ flex: 1, padding: 4, borderRadius: 4, border: "1px solid #86efac" }}><option value="">選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("fixed", idx)} style={{ border: "none", background: "none", color: "#15803d", cursor: "pointer" }}>✖</button>
                  </div>
                ))}
                <button onClick={() => addRule("fixed", { staff: "", section: "" })} style={{ ...btnStyle("#fff"), color: "#15803d", border: "1px solid #86efac", padding: "4px 8px", fontSize: 12 }}>＋ 追加</button>
              </div>

              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 8px", color: "#475569", fontSize: 13 }}>🙅 担当不可（複数選択可）</h4>
                {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "center" }}>
                      <select value={rule.staff} onChange={e => updateRule("forbidden", idx, "staff", e.target.value)} style={{ width: "120px", padding: 4, borderRadius: 4, border: "1px solid #cbd5e1", fontWeight: 700 }}><option value="">選択</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("forbidden", idx)} style={{ border: "none", background: "none", color: "#475569", cursor: "pointer" }}>✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.sections} onChange={v => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
                ))}
                <button onClick={() => addRule("forbidden", { staff: "", sections: "" })} style={{ ...btnStyle("#fff"), color: "#475569", border: "1px solid #cbd5e1", padding: "4px 8px", fontSize: 12 }}>＋ 追加</button>
              </div>

              <div style={{ background: "#f3f4f6", padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 8px", color: "#334155", fontSize: 13 }}>🔄 代打・優先補充</h4>
                {(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: 4, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <select value={rule.target} onChange={e => updateRule("substitutes", idx, "target", e.target.value)} style={{ width: "80px", padding: 4, borderRadius: 4 }}><option value="">誰が</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span style={{ fontSize: 11 }}>不在時➔</span>
                    <input type="text" value={rule.subs} onChange={e => updateRule("substitutes", idx, "subs", e.target.value)} placeholder="代打(カンマ区切り)" style={{ flex: 1, minWidth: "100px", padding: 4, borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 12 }} />
                    <span style={{ fontSize: 11 }}>を</span>
                    <select value={rule.section} onChange={e => updateRule("substitutes", idx, "section", e.target.value)} style={{ width: "80px", padding: 4, borderRadius: 4 }}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("substitutes", idx)} style={{ border: "none", background: "none", color: "#475569", cursor: "pointer" }}>✖</button>
                  </div>
                ))}
                <button onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })} style={{ ...btnStyle("#fff"), color: "#475569", border: "1px solid #cbd5e1", padding: "4px 8px", fontSize: 12 }}>＋ 追加</button>
              </div>

              <div style={{ background: "#e0f2fe", padding: 12, borderRadius: 8, border: "1px solid #bae6fd", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 8px", color: "#0369a1", fontSize: 13 }}>➡️ 連動・押し出し（誰かが入ったら別の人を動かす）</h4>
                {(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 12, borderBottom: "1px solid #bae6fd", paddingBottom: 12 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "center", flexWrap: "wrap" }}>
                      <select value={rule.triggerStaff} onChange={e => updateRule("pushOuts", idx, "triggerStaff", e.target.value)} style={{ width: "80px", padding: 4, borderRadius: 4 }}><option value="">誰が</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span style={{ fontSize: 11 }}>が</span>
                      <select value={rule.triggerSection} onChange={e => updateRule("pushOuts", idx, "triggerSection", e.target.value)} style={{ width: "80px", padding: 4, borderRadius: 4 }}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span style={{ fontSize: 11 }}>に入ったら➔</span>
                      <select value={rule.targetStaff} onChange={e => updateRule("pushOuts", idx, "targetStaff", e.target.value)} style={{ width: "80px", padding: 4, borderRadius: 4 }}><option value="">誰を</option>{activeStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("pushOuts", idx)} style={{ border: "none", background: "none", color: "#0369a1", cursor: "pointer" }}>✖</button>
                    </div>
                    <MultiSectionPicker selected={rule.targetSections} onChange={v => updateRule("pushOuts", idx, "targetSections", v)} options={ROOM_SECTIONS} />
                  </div>
                ))}
                <button onClick={() => addRule("pushOuts", { triggerStaff: "", triggerSection: "", targetStaff: "", targetSections: "" })} style={{ ...btnStyle("#fff"), color: "#0369a1", border: "1px solid #bae6fd", padding: "4px 8px", fontSize: 12 }}>＋ 追加</button>
              </div>

              <div style={{ background: "#fef08a", padding: 12, borderRadius: 8, border: "1px solid #fde047", gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 8px", color: "#a16207", fontSize: 13 }}>🚨 緊急ルール（人数不足時のヘルプ・兼務）</h4>
                <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "6px 12px", borderRadius: 6, border: "1px solid #fef08a" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#854d0e" }}>🚑 全体ヘルプ発動ライン:</span>
                  <span style={{ fontSize: 12, color: "#854d0e" }}>出勤</span>
                  <input type="number" value={customRules.helpThreshold ?? 17} onChange={e => setCustomRules({...customRules, helpThreshold: Number(e.target.value)})} style={{ width: "50px", padding: 4, borderRadius: 4, border: "1px solid #fde047" }} />
                  <span style={{ fontSize: 12, color: "#854d0e" }}>人以下になると、RI担当者などが一般撮影などを自動兼務します。</span>
                </div>
                {(customRules.emergencies || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", gap: 4, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11 }}>出勤</span>
                    <input type="number" value={rule.threshold} onChange={e => updateRule("emergencies", idx, "threshold", e.target.value)} style={{ width: "50px", padding: 4, borderRadius: 4, border: "1px solid #fde047" }} />
                    <span style={{ fontSize: 11 }}>人以下で➔</span>
                    <select value={rule.type} onChange={e => updateRule("emergencies", idx, "type", e.target.value)} style={{ padding: 4, borderRadius: 4 }}>
                      <option value="role_assign">月間担当を配置</option><option value="kenmu">兼務させる</option>
                    </select>
                    {rule.type === "role_assign" ? (
                      <>
                        <select value={rule.role} onChange={e => updateRule("emergencies", idx, "role", e.target.value)} style={{ padding: 4, borderRadius: 4 }}>
                          <option value="">月間設定から</option>{Object.keys(monthlyAssign).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <span style={{ fontSize: 11 }}>を</span>
                        <select value={rule.section} onChange={e => updateRule("emergencies", idx, "section", e.target.value)} style={{ padding: 4, borderRadius: 4 }}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </>
                    ) : (
                      <>
                        <select value={rule.s1} onChange={e => updateRule("emergencies", idx, "s1", e.target.value)} style={{ padding: 4, borderRadius: 4 }}><option value="">場所1</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <span style={{ fontSize: 11 }}>と</span>
                        <select value={rule.s2} onChange={e => updateRule("emergencies", idx, "s2", e.target.value)} style={{ padding: 4, borderRadius: 4 }}><option value="">場所2</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </>
                    )}
                    <button onClick={() => removeRule("emergencies", idx)} style={{ border: "none", background: "none", color: "#a16207", cursor: "pointer" }}>✖</button>
                  </div>
                ))}
                <button onClick={() => addRule("emergencies", { threshold: 16, type: "kenmu", role: "", section: "", s1: "", s2: "" })} style={{ ...btnStyle("#fff"), color: "#a16207", border: "1px solid #fde047", padding: "4px 8px", fontSize: 12 }}>＋ 追加</button>
              </div>

            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {Object.entries(monthlyAssign).map(([category, members]) => (
                <div key={category} style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: category.includes("メイン") ? "#0284c7" : "#334155" }}>
                    {category}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: 6 }}>
                    {(members as string[]).map((m, idx) => (
                      <select key={idx} value={m} onChange={e => updateMonthlySlot(category, idx, e.target.value)} style={{ padding: 4, borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 12 }}>
                        <option value="">未設定</option>
                        {activeStaff.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>

      <div className="print-area" style={{ ...panelStyle(), marginBottom: 16, padding: "16px 8px" }}>
        <h3 style={{ marginTop: 0, fontSize: 16, paddingLeft: 8 }}>週間一覧</h3>
        <div className="scroll-container">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{...cellStyle(true), minWidth: "90px"}}>区分</th>
                {days.map(day => {
                  return (
                    <th key={day.id} style={cellStyle(true, day.isPublicHoliday, day.id === sel)}>
                      <div style={{ fontSize: 14 }}>{day.label}</div>
                      {day.isPublicHoliday && <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, fontWeight: "normal" }}>🎌 {day.holidayName}</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map(section => (
                <tr key={section}>
                  <td style={cellStyle(true)}>{section}</td>
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

      <div className="no-print" style={panelStyle()}>
        <div className="scroll-container" style={{ display: "flex", gap: 4, borderBottom: "2px solid #e2e8f0", paddingBottom: 8, marginBottom: 16, alignItems: "center" }}>
          {days.map(d => {
            return (
              <button key={d.id} onClick={() => setSel(d.id)} style={{ padding: "8px 16px", cursor: "pointer", border: "none", borderRadius: "8px 8px 0 0", background: d.id === sel ? "#2563eb" : "transparent", color: d.id === sel ? "#fff" : (d.isPublicHoliday ? "#94a3b8" : "#64748b"), fontWeight: d.id === sel ? 700 : 400, fontSize: 15, whiteSpace: "nowrap" }}>
                {d.label} {d.isPublicHoliday && "🎌"}
              </button>
            )
          })}
          <div style={{ flex: 1 }}></div>
          <button onClick={handleCopyYesterday} style={{ ...btnStyle("#fff"), color: "#475569", border: "1px solid #cbd5e1" }} disabled={cur.isPublicHoliday}>📋 昨日の入力をコピー</button>
        </div>

        {cur.isPublicHoliday ? (
          <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 8, border: "2px dashed #cbd5e1" }}>
            <h3 style={{ margin: 0, color: "#64748b" }}>🎌 この日（{cur.holidayName}）は祝日・休診日のため、シフトは入力できません。</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>※「特殊ルールの設定」から追加の休診日を変更できます。</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>休務・夜勤</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {["明け","入り","土日休日代休","不在"].map(s => (
                  <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={activeStaff} onChange={v => updateDay(s, v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>モダリティ・受付</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {["CT","MRI","RI","MMG","治療","受付","検像"].map(s => (
                  <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={activeStaff} onChange={v => updateDay(s, v)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>一般撮影・透視・その他</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {["1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA"].map(s => (
                  <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={activeStaff} onChange={v => updateDay(s, v)} />
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>待機・当番</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {["待機","残り・待機","昼当番"].map(s => (
                  <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={activeStaff} onChange={v => updateDay(s, v)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}