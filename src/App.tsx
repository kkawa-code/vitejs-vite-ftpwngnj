import React, { useEffect, useMemo, useState, useRef } from "react";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  
  html, body, #root { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
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
  .rule-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; align-items: center; width: 100%; }
  .rule-sel { padding: 14px 44px 14px 18px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 600; flex: 1 1 160px; min-width: 160px; font-size: 24px; transition: border-color 0.2s; }
  .rule-num { width: 90px; padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 24px; text-align: center; flex-shrink: 0; transition: border-color 0.2s; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 28px; flex-shrink: 0; padding: 0 12px; transition: 0.2s; }
  .rule-del:hover { background: #fee2e2; border-radius: 6px; }
  .rule-add { background: #fff; color: #4f46e5; border: 2px dashed #a5b4fc; padding: 16px 24px; font-size: 24px; width: 100%; display: flex; justify-content: center; font-weight: bold; border-radius: 10px; cursor: pointer; margin-top: 16px; transition: all 0.2s; }
  .rule-label { font-size: 24px; font-weight: 700; color: #64748b; flex-shrink: 0; }
  
  .tabs-header { display: flex; gap: 12px; border-bottom: 3px solid #e2e8f0; margin-bottom: 32px; padding: 0 16px; }
  .tab-btn { background: none; border: none; padding: 16px 32px; font-size: 26px; font-weight: 800; color: #64748b; cursor: pointer; border-bottom: 4px solid transparent; margin-bottom: -3px; transition: 0.2s; }
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

// ===================== 🌟 型定義 =====================
type RenderGroup = { title: string; color: string; sections: string[] };
type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
type RejectReason = { hard: boolean, msg: string };

interface CustomRules {
  staffList: string;
  receptionStaffList: string;
  supportStaffList: string;
  supportTargetRooms: string;
  customHolidays: string;
  capacity: Record<string, number>;
  dailyAdditions: any[];
  priorityRooms: string[];
  fullDayOnlyRooms: string;
  noConsecutiveRooms: string;
  consecutiveAlertRooms: string; // 改善点: 設定できるように追加
  noLateShiftStaff: string;
  ngPairs: any[];
  fixed: any[];
  forbidden: any[];
  substitutes: any[];
  pushOuts: any[];
  emergencies: any[];
  kenmuPairs: any[];
  rescueRules: any[];
  lateShifts: any[];
  helpThreshold: number;
  lunchBaseCount: number;
  lunchSpecialDays: any[];
  lunchConditional: any[];
  lunchPrioritySections: string;
  lunchLastResortSections: string;
  linkedRooms: any[];
  alertMaxKenmu: number;
  alertEmptyRooms: string;
}

const SECTIONS = [
  "明け","入り","土日休日代休","不在","待機","CT","MRI","RI",
  "1号室","2号室","3号室","5号室","透視（6号）","透視（11号）",
  "MMG","骨塩","パノラマCT","ポータブル","DSA","治療","検像","昼当番","受付","受付ヘルプ" 
];

const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
const WORK_SECTIONS = SECTIONS.filter(s => !REST_SECTIONS.includes(s));
const ROLE_PLACEHOLDERS = ROOM_SECTIONS.map(s => s + "枠");

const KEY_ALL_DAYS = "shifto_alldays_v210"; 
const KEY_MONTHLY = "shifto_monthly_v210"; 
const KEY_RULES = "shifto_rules_v210";

// ===================== 🌟 共通関数 =====================
const split = (v: string) => (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean);
const join = (a: string[]) => a.filter(Boolean).join("、");
const extractStaffName = (name: string) => name.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
const pad = (n: number) => String(n).padStart(2, '0');
const btnStyle = (bg: string, color: string = "#fff"): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: "12px", padding: "16px 24px", cursor: "pointer", fontWeight: 800, fontSize: 22, whiteSpace: "nowrap", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 });
const panelStyle = (): React.CSSProperties => ({ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "40px", boxShadow: "0 6px 12px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" });
const cellStyle = (isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties => { 
  let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff");
  if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; 
  else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff"); 
  return { border: "1px solid #e2e8f0", padding: "24px", background: bg, fontWeight: isHeader ? 800 : 600, textAlign: isHeader ? "center" : "left", fontSize: 24, minWidth: isHeader && !isSticky ? "200px" : "auto", color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, transition: "background-color 0.2s" }; 
};

// ===================== 🌟 自動割付ロジック (スマート修正対応) =====================
class AutoAssigner {
  dayCells: Record<string, string>;
  blockMap: Map<string, string> = new Map();
  assignCounts: Record<string, number> = {};
  logInfo: string[] = [];

  constructor(private day: any, private prevDay: any, private ctx: any, private isSmartFix: boolean = false) {
    this.dayCells = { ...day.cells };
  }

  execute(): DayData {
    this.buildBlockMap();
    
    // スマート修正ではない場合（通常の自動割当）は、一度全ての業務枠をリセットする
    if (!this.isSmartFix) {
      WORK_SECTIONS.forEach(sec => {
        const current = split(this.dayCells[sec]);
        // 枠（プレースホルダー）以外の名前を消去
        this.dayCells[sec] = join(current.filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m))));
      });
      this.dayCells["昼当番"] = ""; this.dayCells["受付ヘルプ"] = "";
    }

    // 1. 本来は出勤しているが、不在設定された人（AM休/PM休）をチェックし、
    // もしその人が現在その時間帯の仕事に入っているなら消去する（穴を開ける）
    WORK_SECTIONS.forEach(sec => {
      let current = split(this.dayCells[sec]);
      let next = current.filter(m => {
        const core = extractStaffName(m);
        const block = this.blockMap.get(core);
        if (block === 'ALL') return false; // 今日休みになった
        if (block === 'AM' && (m.includes("(AM)") || !m.includes("("))) return false; // 午前休みだが、午前仕事に入っている
        if (block === 'PM' && (m.includes("(PM)") || !m.includes("("))) return false; // 午後休みだが、午後仕事に入っている
        return true;
      });
      if (current.length !== next.length) {
          this.dayCells[sec] = join(next);
          this.logInfo.push(`${sec} の不在者を除外しました。`);
      }
    });

    // 2. 空いた穴を埋める（優先順位に従う）
    const priority = this.ctx.customRules.priorityRooms || SECTIONS;
    priority.forEach((room: string) => {
      if (REST_SECTIONS.includes(room) || ["昼当番","受付ヘルプ"].includes(room)) return;
      this.fillRoom(room);
    });

    // 3. 基本兼務などの処理（既存ロジック）
    this.applyLinkedRooms();

    return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
  }

  private buildBlockMap() {
    this.ctx.allStaff.forEach((s: string) => this.blockMap.set(s, 'NONE'));
    [...split(this.dayCells["明け"]), ...split(this.dayCells["入り"]), ...split(this.dayCells["土日休日代休"])].forEach(m => {
      this.blockMap.set(extractStaffName(m), 'ALL');
    });
    split(this.dayCells["不在"]).forEach(m => {
      const core = extractStaffName(m);
      if (m.includes("(AM)")) this.blockMap.set(core, 'AM');
      else if (m.includes("(PM)")) this.blockMap.set(core, 'PM');
      else this.blockMap.set(core, 'ALL');
    });
    // 現在の配置をカウント（スマート修正用）
    WORK_SECTIONS.forEach(sec => {
      split(this.dayCells[sec]).forEach(m => {
        const core = extractStaffName(m);
        if (!ROLE_PLACEHOLDERS.includes(core)) {
          this.assignCounts[core] = (this.assignCounts[core] || 0) + (m.includes("(") ? 0.5 : 1);
        }
      });
    });
  }

  private fillRoom(room: string) {
    const targetCap = this.ctx.customRules.capacity[room] || 1;
    let current = split(this.dayCells[room]);
    const monthlyMain = split(this.ctx.monthlyAssign[room] || "").map(extractStaffName);

    // 未配置スタッフから候補を抽出
    const candidates = this.ctx.allStaff.filter(s => {
      if (this.blockMap.get(s) === 'ALL') return false;
      if (current.map(extractStaffName).includes(s)) return false;
      if ((this.assignCounts[s] || 0) >= 1) return false;
      return true;
    }).sort((a, b) => {
        const aMain = monthlyMain.includes(a) ? 1 : 0;
        const bMain = monthlyMain.includes(b) ? 1 : 0;
        return bMain - aMain; // 月間担当優先
    });

    const getCurrentAmount = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : (m.includes("(") ? 0.5 : 1)), 0);

    while (getCurrentAmount(current) < targetCap && candidates.length > 0) {
      const staff = candidates.shift()!;
      const block = this.blockMap.get(staff);
      let tag = ""; let p = 1;
      if (block === 'AM') { tag = "(PM)"; p = 0.5; }
      else if (block === 'PM') { tag = "(AM)"; p = 0.5; }
      
      current.push(`${staff}${tag}`);
      this.assignCounts[staff] = (this.assignCounts[staff] || 0) + p;
      this.logInfo.push(`✅ ${room} に ${staff}${tag} を補充しました`);
    }
    this.dayCells[room] = join(current);
  }

  private applyLinkedRooms() {
    (this.ctx.customRules.linkedRooms || []).forEach((rule: any) => {
      const sources = split(rule.sources);
      let targetMems = split(this.dayCells[rule.target]);
      sources.forEach(src => {
        split(this.dayCells[src]).forEach(m => {
          if (!targetMems.map(extractStaffName).includes(extractStaffName(m)) && !ROLE_PLACEHOLDERS.includes(extractStaffName(m))) {
            targetMems.push(m);
          }
        });
      });
      this.dayCells[rule.target] = join(targetMems);
    });
  }
}

// ===================== 🌟 UIコンポーネント =====================
const MultiSectionPicker = ({ selected, onChange, options, hasArrows = false }: any) => {
  const current = split(selected);
  const handleAdd = (sec: string) => { if (sec && !current.includes(sec)) onChange(join([...current, sec])); };
  const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, marginBottom: 12 }}>
      {current.map((sec, i) => (
        <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 24, padding: "12px 20px", fontSize: 22, fontWeight: 800, border: "2px solid #bae6fd", display: "flex", alignItems: "center", gap: 10 }}>
          <span>{sec}</span><span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" onChange={(e) => { handleAdd(e.target.value); e.target.value = ""; }} value="">
        <option value="">＋追加</option>
        {options.filter((s: string) => !current.includes(s)).map((s: string) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

// ===================== 🌟 アプリメイン =====================
export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats' | 'rules'>('calendar');
  const [allDays, setAllDays] = useState<Record<string, Record<string, string>>>(() => { try { const saved = localStorage.getItem(KEY_ALL_DAYS); if (saved) return JSON.parse(saved); } catch {} return {}; });
  const [customRules, setCustomRules] = useState<CustomRules>(() => { try { const saved = localStorage.getItem(KEY_RULES); if (saved) return JSON.parse(saved); } catch {} return { staffList: "", receptionStaffList: "", supportStaffList: "", supportTargetRooms: "", customHolidays: "", capacity: {}, dailyAdditions: [], priorityRooms: [], fullDayOnlyRooms: "", noConsecutiveRooms: "", consecutiveAlertRooms: "ポータブル, 透視（6号）", noLateShiftStaff: "", ngPairs: [], fixed: [], forbidden: [], substitutes: [], pushOuts: [], emergencies: [], kenmuPairs: [], rescueRules: [], lateShifts: [], helpThreshold: 17, lunchBaseCount: 3, lunchSpecialDays: [], lunchConditional: [], lunchPrioritySections: "", lunchLastResortSections: "", linkedRooms: [], alertMaxKenmu: 3, alertEmptyRooms: "" }; });
  const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string>>({});
  const [targetMonday, setTargetMonday] = useState("2026-03-30");
  const [sel, setSel] = useState("");
  const [selectedErrorDay, setSelectedErrorDay] = useState<string | null>(null);
  const [selectedStaffForStats, setSelectedStaffForStats] = useState<string | null>(null);
  const [showUnassignedList, setShowUnassignedList] = useState<string | null>(null);
  const [assignLogs, setAssignLogs] = useState<Record<string, string[]>>({});

  useEffect(() => { localStorage.setItem(KEY_ALL_DAYS, JSON.stringify(allDays)); localStorage.setItem(KEY_RULES, JSON.stringify(customRules)); }, [allDays, customRules]);

  const activeGeneralStaff = useMemo(() => parseAndSortStaff(customRules.staffList), [customRules.staffList]);
  const allStaff = useMemo(() => Array.from(new Set([...activeGeneralStaff, ...parseAndSortStaff(customRules.receptionStaffList)])), [activeGeneralStaff, customRules.receptionStaffList]);

  const days = useMemo(() => {
    const [y, m, d] = targetMonday.split('-').map(Number);
    return [0, 1, 2, 3, 4].map(i => {
      const date = new Date(y, m - 1, d + i);
      const id = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
      return { id, label: formatDayForDisplay(date), cells: allDays[id] || {} };
    });
  }, [targetMonday, allDays]);

  useEffect(() => { if(!sel) setSel(days[0].id); }, [days]);

  // ================= 改善点：人数のカウントと未配置者の抽出 =================
  const getDailyStats = (dayId: string) => {
    const cells = allDays[dayId] || {};
    const absent = new Set();
    REST_SECTIONS.forEach(s => split(cells[s]).forEach(m => absent.add(extractStaffName(m))));
    const working = allStaff.filter(s => !absent.has(s));
    const assigned = new Set();
    WORK_SECTIONS.forEach(s => split(cells[s]).forEach(m => assigned.add(extractStaffName(m))));
    const unassigned = working.filter(s => !assigned.has(s));
    return { workingCount: working.length, unassigned };
  };

  const getDayWarnings = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return [];
    const w: any[] = []; const cells = allDays[dayId] || {};
    const staffRoomMap: Record<string, string[]> = {};
    ROOM_SECTIONS.forEach(room => split(cells[room]).forEach(m => {
      const core = extractStaffName(m); if (!staffRoomMap[core]) staffRoomMap[core] = [];
      if (!staffRoomMap[core].includes(room)) staffRoomMap[core].push(room);
    }));
    Object.entries(staffRoomMap).forEach(([s, rms]) => { if(rms.length >= (customRules.alertMaxKenmu || 3)) w.push({ type: 'error', msg: `【過多】${s}さんが ${rms.length}部屋（${rms.join('、')}）を担当中` }); });
    const curIdx = days.findIndex(d => d.id === dayId);
    if (curIdx > 0) {
      const alertRooms = split(customRules.consecutiveAlertRooms);
      alertRooms.forEach(room => {
        const prev = split(allDays[days[curIdx-1].id]?.[room]).map(extractStaffName);
        const cur = split(allDays[dayId]?.[room]).map(extractStaffName);
        cur.filter(n => prev.includes(n)).forEach(n => w.push({ type: 'error', msg: `【連日】${n}さんが「${room}」に2日連続で入っています` }));
      });
    }
    return w;
  };

  const handleAutoAssign = (isSmart: boolean) => {
    const nextAll = { ...allDays };
    const newLogs = { ...assignLogs };
    let prevDay = null;
    days.forEach(day => {
      const ctx = { allStaff, activeGeneralStaff, customRules, monthlyAssign };
      const worker = new AutoAssigner(day, prevDay, ctx, isSmart);
      const res = worker.execute();
      nextAll[day.id] = res.cells;
      newLogs[day.id] = res.logInfo || [];
      prevDay = res;
    });
    setAllDays(nextAll); setAssignLogs(newLogs);
  };

  const updateDay = (k: string, v: string) => {
      const nextAll = { ...allDays, [sel]: { ...(allDays[sel] || {}), [k]: v } };
      if (k === "入り") {
          const idx = days.findIndex(d => d.id === sel);
          if (idx >= 0 && idx < days.length - 1) {
              const nextId = days[idx+1].id;
              nextAll[nextId] = { ...(allDays[nextId] || {}), "明け": v };
          }
      }
      setAllDays(nextAll);
  };

  return (
    <div style={{ maxWidth: "96%", margin: "0 auto", padding: "32px", width: "100%", boxSizing: "border-box" }}>
      <style>{globalStyle}</style>
      
      {/* ヘッダー */}
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, padding: "32px 40px" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 40, fontWeight: 800 }}>勤務割付システム Ver 2.1</h2>
        <div style={{ display: "flex", gap: 16 }}>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={{}} customHolidays={[]} />
          <button className="btn-hover" onClick={() => window.print()} style={btnStyle("#475569")}>🖨️ 印刷</button>
        </div>
      </div>

      <div className="tabs-header no-print">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 週間予定表</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 稼働統計</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>⚙️ ルール設定</button>
      </div>

      {/* ===================== 📅 カレンダー タブ ===================== */}
      <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
        <div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "36px 24px" }}>
          <div className="scroll-container" style={{ borderRadius: 12, border: "2px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1400 }}>
              <thead>
                <tr>
                  <th style={{...cellStyle(true, false, false, true), borderRight: "3px solid #e2e8f0"}}>区分</th>
                  {days.map(day => {
                    const stats = getDailyStats(day.id);
                    const warnings = getDayWarnings(day.id);
                    return (
                      <th key={day.id} onClick={() => setSel(day.id)} style={{...cellStyle(true, false, day.id === sel), cursor: "pointer"}}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                            {day.label}
                            {warnings.length > 0 && <span onClick={(e) => { e.stopPropagation(); setSelectedErrorDay(day.id); }} style={{ background: "#fff7ed", color: "#c2410c", padding: "4px 10px", borderRadius: 12, fontSize: 16, border: "1px solid #fdba74" }}>⚠️ 注 {warnings.length}</span>}
                          </div>
                          {/* 未配置者カウンター */}
                          <div onClick={(e) => { e.stopPropagation(); setShowUnassignedList(day.id); }} style={{ fontSize: 16, background: stats.unassigned.length > 0 ? "#fee2e2" : "#d1fae5", color: stats.unassigned.length > 0 ? "#ef4444" : "#065f46", padding: "4px 8px", borderRadius: 10, cursor: "pointer" }}>
                            出勤:{stats.workingCount} / 未配置:{stats.unassigned.length}名
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section, sIdx) => (
                  <tr key={section}>
                    <td style={{...cellStyle(true, false, false, true, sIdx % 2 === 1), borderRight: "3px solid #e2e8f0"}}>{section}</td>
                    {days.map((day, dIdx) => {
                      const prevDayId = dIdx > 0 ? days[dIdx-1].id : null;
                      const prevMems = prevDayId ? split(allDays[prevDayId]?.[section]).map(extractStaffName) : [];
                      const isAlertRoom = split(customRules.consecutiveAlertRooms).includes(section);
                      const currentMems = split(allDays[day.id]?.[section]);
                      return (
                        <td key={day.id + section} style={cellStyle(false, false, day.id === sel, false, sIdx % 2 === 1)}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {currentMems.map((m, mIdx) => {
                                const isConsecutive = isAlertRoom && prevMems.includes(extractStaffName(m));
                                return <span key={mIdx} style={{ color: isConsecutive ? "#ef4444" : "inherit", fontWeight: isConsecutive ? 900 : "inherit" }}>{m}{mIdx < currentMems.length - 1 ? "、" : ""}</span>;
                            })}
                          </div>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 24, marginBottom: 32 }}>
             <div style={{ display: "flex", gap: 12 }}>
                {days.map(d => <button key={d.id} onClick={() => setSel(d.id)} style={{ padding: "16px 28px", borderRadius: 12, border: "none", background: d.id === sel ? "#2563eb" : "#fff", color: d.id === sel ? "#fff" : "#64748b", fontWeight: 800, fontSize: 24, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>{d.label}</button>)}
             </div>
             <div style={{ display: "flex", gap: 16 }}>
                <button className="btn-hover" onClick={() => handleAutoAssign(false)} style={btnStyle("#10b981")}>✨ 1日自動割当</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(true)} style={btnStyle("#f59e0b")}>🔄 スマート修正</button>
             </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
             {RENDER_GROUPS.flatMap(g => g.sections).map(s => (
               <SectionEditor key={s} section={s} value={allDays[sel]?.[s] || ""} activeStaff={allStaff} onChange={v => updateDay(s, v)} noTime={REST_SECTIONS.includes(s) || s === "昼当番"} />
             ))}
          </div>
        </div>
      </div>

      {/* ===================== ⚙️ 設定 タブ ===================== */}
      <div style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle() }}>
          <h3 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>システム設定</h3>
          
          <div style={{ background: "#fff1f2", padding: 32, borderRadius: 16, border: "2px solid #fecaca", marginBottom: 32 }}>
            <h4 style={{ margin: "0 0 20px 0", color: "#be185d", fontSize: 28, fontWeight: 800 }}>⚠️ 連日担当のアラート設定</h4>
            <p style={{ fontSize: 20, color: "#9f1239", marginBottom: 12 }}>ここで選んだ部屋のみ、2日連続で入ったスタッフの名前が赤字になります。</p>
            <MultiSectionPicker selected={customRules.consecutiveAlertRooms} onChange={(v:any) => setCustomRules({...customRules, consecutiveAlertRooms: v})} options={ROOM_SECTIONS} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <label style={{ fontWeight: 800, display: "block", marginBottom: 12 }}>一般スタッフ名簿</label>
                <textarea value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} style={{ width: "100%", height: 300, padding: 20, borderRadius: 12, border: "2px solid #cbd5e1" }} />
              </div>
              <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12 }}>
                <h4 style={{ fontWeight: 800 }}>📌 ヒント: スマート修正の使い方</h4>
                <p style={{ fontSize: 20, lineHeight: 1.6 }}>「今日は山田さんが急に午後休になった」という場合、手動で「不在」に 山田(PM) を入れ、<b>スマート修正</b>ボタンを押してください。<br/>全体のパズルを壊さず、山田さんが空けた穴にだけ未配置のスタッフを補充します。</p>
              </div>
          </div>
        </div>
      </div>

      {/* ===================== モーダル類 ===================== */}
      {showUnassignedList && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)" }} onClick={() => setShowUnassignedList(null)}>
          <div className="modal-animate" style={{ background: "#fff", padding: 40, borderRadius: 24, width: 500 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>未配置のスタッフ</h3>
            <div style={{ fontSize: 24, lineHeight: 2, color: "#ef4444" }}>
              {getDailyStats(showUnassignedList).unassigned.join("、") || "全員配置済みです"}
            </div>
            <button onClick={() => setShowUnassignedList(null)} style={{ ...btnStyle("#2563eb"), marginTop: 32, width: "100%", justifyContent: "center" }}>閉じる</button>
          </div>
        </div>
      )}

      {selectedErrorDay && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)" }} onClick={() => setSelectedErrorDay(null)}>
          <div className="modal-animate" style={{ background: "#fff", padding: 40, borderRadius: 24, maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>確認事項詳細</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {getDayWarnings(selectedErrorDay).map((w, i) => <li key={i} style={{ padding: "16px", background: "#f8fafc", borderRadius: 10, marginBottom: 12, fontSize: 22 }}>{w.msg}</li>)}
            </ul>
            <button onClick={() => setSelectedErrorDay(null)} style={{ ...btnStyle("#2563eb"), marginTop: 32, width: "100%", justifyContent: "center" }}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ヘルパー: スタッフ名簿解析
function parseAndSortStaff(s: string) {
  return (s || "").split(/[、,\n]+/).map(x => x.trim().split(/[（(]/)[0]).filter(Boolean);
}

// ヘルパー: 日付フォーマット
function formatDayForDisplay(d: Date) {
  const YOUBI = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`;
}
