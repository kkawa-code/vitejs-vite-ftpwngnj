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
  alertMaxKenmu: number;
  alertEmptyRooms: string;
}

const SECTIONS = [
  "明け","入り","土日休日代休","不在","待機","CT","MRI","RI",
  "1号室","2号室","3号室","5号室","透視（6号）","透視（11号）",
  "MMG","骨塩","パノラマCT","ポータブル","DSA","治療","検像","昼当番","受付","受付ヘルプ" 
];

const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
const ROLE_PLACEHOLDERS = ROOM_SECTIONS.map(s => s + "枠");

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
  "受付", "治療", "MMG", "RI", "MRI", "CT", "透視（6号）", "透視（11号）", "1号室", "5号室", "2号室", "骨塩", "ポータブル", "DSA", "検像", "パノラマCT", "3号室", "受付ヘルプ", "透析後胸部"
];

const DEFAULT_RULES: CustomRules = { 
  staffList: DEFAULT_STAFF, receptionStaffList: "", supportStaffList: "", supportTargetRooms: "2号室, 3号室", customHolidays: "", 
  capacity: { CT: 3, MRI: 3, 治療: 3, RI: 1, MMG: 1, "透視（6号）": 1, "透視（11号）": 1, 骨塩: 1, "1号室": 1, "5号室": 1, パノラマCT: 2 }, 
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
  alertEmptyRooms: "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像"
};

const KEY_ALL_DAYS = "shifto_alldays_v152"; 
const KEY_MONTHLY = "shifto_monthly_v152"; 
const KEY_RULES = "shifto_rules_v152";

const pad = (n: number) => String(n).padStart(2, '0');

const TIME_OPTIONS: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h = 8; h <= 19; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 8 && m === 0) continue; 
    TIME_OPTIONS.push(`(${h}:${pad(m)}〜)`);
    TIME_OPTIONS.push(`(〜${h}:${pad(m)})`);
  }
}

function split(v: string) { return (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean); }
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
          <span style={{ userSelect: "none" }}>{sec}</span>
          {hasArrows && (i < current.length - 1 ? <button onClick={() => handleMoveRight(i)} style={{ background: "#7dd3fc", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18, fontWeight: "bold" }}>▶</button> : <span style={{ width: 32 }}></span>)}
          <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, marginLeft: hasArrows ? 8 : 4, fontSize: 24 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" style={{ padding: "12px 44px 12px 16px", fontSize: 22, minWidth: 200, maxWidth: "100%", height: 52, textOverflow: "ellipsis" }} onChange={(e) => { handleAdd(e.target.value); e.target.value = ""; }} value="">
        <option value="">＋追加</option>
        {options.filter(s => !current.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
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
          <span style={{ userSelect: "none" }}>{name}</span>
          {hasArrows && (i < current.length - 1 ? <button onClick={() => handleMoveRight(i)} style={{ background: "#94a3b8", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18, fontWeight: "bold" }}>▶</button> : <span style={{ width: 32 }}></span>)}
          <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, marginLeft: hasArrows ? 8 : 4, fontSize: 24 }}>✖</span>
        </div>
      ))}
      <select className="rule-sel" style={{ padding: "12px 44px 12px 16px", fontSize: 22, minWidth: 260, maxWidth: "100%", height: 52, textOverflow: "ellipsis" }} onChange={(e) => { handleAdd(e.target.value); e.target.value = ""; }} value="">
        <option value="">{placeholder}</option>
        {options.filter(s => !current.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

// ===================== 🌟 ロジック =====================

class AutoAssigner {
  day: DayData; prevDay: DayData | null; pastDays: DayData[]; ctx: AutoAssignContext;
  dayCells: Record<string, string>; blockMap: Map<string, string> = new Map();
  skipSections: string[] = []; roleAssignments: Record<string, any> = {};
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
    }
    if (this.day.isPublicHoliday) return { ...this.day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])), logInfo: this.logInfo };

    this.buildBlockMap(); this.applyDailyAdditions(); this.evaluateEmergencies(); this.initCounts(); this.cleanUpDayCells();
    this.prepareAvailability(); this.assignRooms(); this.processPostTasks();
    return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
  }

  buildBlockMap() {
    this.ctx.allStaff.forEach(s => this.blockMap.set(s, 'NONE'));
    ["明け","入り","土日休日代休"].forEach(sec => { split(this.dayCells[sec]).forEach(m => this.blockMap.set(extractStaffName(m), 'ALL')); });
    split(this.dayCells["不在"]).forEach(m => {
      const core = extractStaffName(m);
      if (m.includes("(AM)")) this.blockMap.set(core, 'AM'); else if (m.includes("(PM)")) this.blockMap.set(core, 'PM'); else this.blockMap.set(core, 'ALL');
    });
  }

  applyDailyAdditions() {
    (this.ctx.customRules.dailyAdditions || []).forEach((rule) => {
      if (rule.date === this.day.id && rule.section && rule.count > 0) {
        const timeTag = rule.time === "全日" || !rule.time ? "" : rule.time;
        const placeholderName = rule.section + "枠" + timeTag;
        let current = split(this.dayCells[rule.section]);
        for (let i = 0; i < rule.count; i++) current.push(placeholderName);
        this.dayCells[rule.section] = join(current);
      }
    });
  }

  evaluateEmergencies() {
    const tempAvailCount = this.ctx.activeGeneralStaff.filter(s => this.blockMap.get(s) !== 'ALL').length;
    (this.ctx.customRules.emergencies || []).forEach((em) => {
      if (tempAvailCount <= Number(em.threshold)) {
        if (em.type === "role_assign" && em.role) { if (!this.roleAssignments[em.role] || em.threshold < this.roleAssignments[em.role].threshold) this.roleAssignments[em.role] = em; }
        if (em.type === "clear" && em.section) { this.skipSections.push(em.section); this.dayCells[em.section] = ""; }
        if (em.type === "change_capacity" && em.section) { if (!(this.ctx.customRules.dailyAdditions || []).some((r) => r.date === this.day.id && r.section === em.section)) { this.dynamicCapacity[em.section] = Number(em.newCapacity ?? 3); } }
      }
    });
  }

  initCounts() {
    this.ctx.allStaff.forEach(s => { this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.counts[s] = 0; this.roomCounts[s] = {}; SECTIONS.forEach(sec => this.roomCounts[s][sec] = 0); });
    this.pastDays.forEach(pd => { 
      Object.entries(pd.cells).forEach(([sec, val]) => { 
        if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return; 
        split(val).forEach(m => { const c = extractStaffName(m); if (this.counts[c] !== undefined) { this.counts[c]++; this.roomCounts[c][sec] = (this.roomCounts[c][sec] || 0) + 1; } }); 
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
      if (!REST_SECTIONS.includes(sec) && sec !== "昼当番") { split(this.dayCells[sec]).forEach(name => { const c = extractStaffName(name); if (ROLE_PLACEHOLDERS.includes(c)) return; this.addU(c, getStaffAmount(name)); }); }
    });
  }

  prepareAvailability() {
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "");
    const effectiveReceptionStaff = this.ctx.activeReceptionStaff.length > 0 ? this.ctx.activeReceptionStaff : this.ctx.activeGeneralStaff;
    this.initialAvailAll = this.ctx.allStaff.filter(s => this.blockMap.get(s) !== 'ALL').sort((a, b) => {
      if ((this.assignCounts[a] || 0) !== (this.assignCounts[b] || 0)) return (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0); 
      if ((this.counts[a] || 0) !== (this.counts[b] || 0)) return (this.counts[a] || 0) - (this.counts[b] || 0); 
      return a.localeCompare(b, 'ja');
    });
    this.initialAvailSupport = this.initialAvailAll.filter(s => supportStaffList.includes(s));
    this.initialAvailGeneral = this.initialAvailAll.filter(s => this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s));
    this.initialAvailReception = this.initialAvailAll.filter(s => effectiveReceptionStaff.includes(s) && !supportStaffList.includes(s));
  }

  isUsed(name: string): boolean { return (this.assignCounts[name] || 0) >= (this.maxAssigns[name] || 1); }
  addU(name: string, f = 1): void { this.assignCounts[name] = (this.assignCounts[name] || 0) + f; }
  isForbidden(staff: string, section: string): boolean { return (this.ctx.customRules.forbidden || []).some((rule: any) => rule.staff === staff && split(rule.sections).includes(section)); }
  hasNGPair(candidate: string, members: string[], checkSoft: boolean): boolean { return members.some(member => (this.ctx.customRules.ngPairs || []).some((ng: any) => { const match = (ng.s1 === candidate && ng.s2 === member) || (ng.s1 === member && ng.s2 === candidate); if (!match) return false; if ((ng.level || "hard") === "hard") return true; if ((ng.level || "hard") === "soft" && checkSoft) return true; return false; })); }

  pick(availList: string[], list: string[], n: number, section?: string, currentAssigned: string[] = []): string[] {
    const result: string[] = []; const uniqueList = Array.from(new Set(list.filter(Boolean)));
    const noConsecutiveRooms = split(this.ctx.customRules.noConsecutiveRooms || "");
    const prevDayMembers = (this.prevDay && section && noConsecutiveRooms.includes(section)) ? split(this.prevDay.cells[section] || "").map(extractStaffName) : [];
    
    const filterFn = (name: string, checkSoftNg: boolean, checkConsecutive: boolean) => {
      if (!availList.includes(name) || this.isUsed(name) || (section && this.isForbidden(name, section))) return false;
      if (checkConsecutive && prevDayMembers.includes(name)) return false;
      if (this.hasNGPair(name, [...currentAssigned, ...result].map(extractStaffName), checkSoftNg)) return false;
      return true;
    };
    
    for (const name of uniqueList.filter(n => filterFn(n, true, true))) { result.push(name); if (result.length >= n) return result; }
    for (const name of uniqueList.filter(n => filterFn(n, false, true))) { result.push(name); if (result.length >= n) return result; }
    for (const name of uniqueList.filter(n => filterFn(n, true, false))) { result.push(name); if (result.length >= n) return result; }
    for (const name of uniqueList.filter(n => filterFn(n, false, false))) { result.push(name); if (result.length >= n) return result; }
    return result;
  }

  fill(availList: string[], section: string, preferredList: string[], targetCount: number) {
    if (this.skipSections.includes(section)) return;
    let current = split(this.dayCells[section]);
    const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "");
    const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + getStaffAmount(m), 0);
    
    let prevAmount = -1;
    while (getCurrentAmount(current) < targetCount) {
      const currentAmount = getCurrentAmount(current); if (currentAmount === prevAmount) break; prevAmount = currentAmount;
      const remaining = targetCount - currentAmount;
      let needTag = "";
      if (remaining === 0.5 || remaining === 1.5 || remaining === 2.5) {
         const amCount = current.filter(m => m.includes("(AM)")).length; const pmCount = current.filter(m => m.includes("(PM)")).length;
         if (amCount > pmCount) needTag = "(PM)"; if (pmCount > amCount) needTag = "(AM)";
      }

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

      const candidatesWithReason = availList.map(name => ({ name, reason: getFilterReason(name) }));
      let validNames = candidatesWithReason.filter(c => !c.reason).map(c => c.name);
      
      let fallbackMsg = "";
      if (validNames.length === 0) {
          const softCandidates = candidatesWithReason.filter(c => c.reason && !c.reason.hard);
          if (softCandidates.length > 0) {
              validNames = softCandidates.map(c => c.name);
              fallbackMsg = `（🚨空室回避のため [${softCandidates[0].reason?.msg}] を特例で無視して選出）`;
          } else { break; }
      }

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

         return [...candidates].sort((a, b) => {
             const bA = this.blockMap.get(a); const bB = this.blockMap.get(b);
             let scoreA = 0; let scoreB = 0;
             if (mainStaff.includes(a)) scoreA += 10000; else if (subPrioStaff.includes(a)) scoreA += 5000; else if (subStaff.includes(a)) scoreA += 2000;
             if (mainStaff.includes(b)) scoreB += 10000; else if (subPrioStaff.includes(b)) scoreB += 5000; else if (subStaff.includes(b)) scoreB += 2000;
             scoreA -= (this.roomCounts[a]?.[section] || 0) * 100; scoreB -= (this.roomCounts[b]?.[section] || 0) * 100;
             if (scoreA !== scoreB) return scoreB - scoreA;
             if ((this.assignCounts[a] || 0) !== (this.assignCounts[b] || 0)) return (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0);
             return a.localeCompare(b, 'ja');
         });
      };
      
      const pickedCoreList = this.pick(validNames, sortCandidates(validNames), 1, section, current.map(extractStaffName));
      if (pickedCoreList.length === 0) break;
      
      const core = pickedCoreList[0]; const block = this.blockMap.get(core); let tag = ""; let f = 1;
      if (block === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } else if (block === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } else { if (needTag) { tag = needTag; f = 0.5; this.blockMap.set(core, needTag === "(AM)" ? 'AM' : 'PM'); } else { tag = ""; f = 1; this.blockMap.set(core, 'ALL'); } }
      current.push(`${core}${tag}`); this.addU(core, f);
      if (fallbackMsg) this.log(`✅ [空室回避] ${section} に ${core}${tag} を配置しました。${fallbackMsg}`);
    }
    this.dayCells[section] = join(current);
  }

  assignRooms() {
    const availAll = this.initialAvailAll; const availReception = this.initialAvailReception;
    (this.ctx.customRules.fixed || []).forEach((rule: any) => { if (!rule.staff || !rule.section) return; Object.keys(this.dayCells).forEach(sec => { if (sec === rule.section) return; if (REST_SECTIONS.includes(sec)) return; const before = split(this.dayCells[sec]); const after = before.filter(m => extractStaffName(m) !== rule.staff); if (before.length !== after.length) { this.dayCells[sec] = join(after); this.assignCounts[rule.staff] = 0; this.blockMap.set(rule.staff, 'NONE'); } }); });
    (this.ctx.customRules.fixed || []).forEach((rule: any) => { if (!rule.staff || !rule.section || !availAll.includes(rule.staff) || this.isUsed(rule.staff) || this.isForbidden(rule.staff, rule.section)) return; if (this.skipSections.includes(rule.section)) return; const current = split(this.dayCells[rule.section]); if (current.map(extractStaffName).includes(rule.staff) || this.hasNGPair(rule.staff, current.map(extractStaffName), false)) return; const b = this.blockMap.get(rule.staff); let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(rule.staff, 'ALL'); } else { this.blockMap.set(rule.staff, 'ALL'); } this.dayCells[rule.section] = join([...current, `${rule.staff}${tag}`]); this.addU(rule.staff, f); });

    const basePriorityList = this.ctx.customRules.priorityRooms && this.ctx.customRules.priorityRooms.length > 0 ? this.ctx.customRules.priorityRooms : DEFAULT_PRIORITY_ROOMS;
    basePriorityList.forEach((room: string) => {
      if (this.skipSections.includes(room)) return;
      if (["受付ヘルプ", "昼当番", "待機"].includes(room)) return;
      let targetCount = this.dynamicCapacity[room] !== undefined ? this.dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
      let currentMembersForTarget = split(this.dayCells[room]);
      const placeholders = currentMembersForTarget.filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)));
      if (placeholders.length > 0) { targetCount += placeholders.length; this.dayCells[room] = join(currentMembersForTarget.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); }

      if (room === "受付") {
        let currentUketsuke = split(this.dayCells["受付"]);
        for (const name of split(this.ctx.monthlyAssign.受付 || "")) {
          if (availAll.includes(name) && !this.isUsed(name) && !currentUketsuke.map(extractStaffName).includes(name)) { 
            const b = this.blockMap.get(name); if (b === 'ALL') continue;
            let tag = ""; let f = 1; if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else { this.blockMap.set(name, 'ALL'); }
            currentUketsuke.push(`${name}${tag}`); this.addU(name, f); 
          }
        }
        let neededUketsuke = targetCount - currentUketsuke.reduce((sum, m) => sum + getStaffAmount(m), 0);
        if (neededUketsuke > 0) { 
          const pickedUketsuke = this.pick(availReception, availReception, Math.ceil(neededUketsuke), "受付", currentUketsuke);
          pickedUketsuke.forEach((name: string) => {
            const b = this.blockMap.get(name); let tag = ""; let f = 1;
            if (b === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else if (b === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(name, 'ALL'); } else { this.blockMap.set(name, 'ALL'); }
            currentUketsuke.push(`${name}${tag}`); this.addU(name, f);
          });
        }
        this.dayCells["受付"] = join(currentUketsuke);
      } else {
        let preferredList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign);
        this.fill(this.initialAvailGeneral, room, preferredList, targetCount);
      }
    });

    (this.ctx.customRules.kenmuPairs || []).forEach((pair: any) => {
      let m1 = split(this.dayCells[pair.s1]); let m2 = split(this.dayCells[pair.s2]);
      const process = (src: string[], target: string[], targetRoom: string) => {
          const cap = this.dynamicCapacity[targetRoom] || 1;
          let curAmount = target.reduce((s, m) => s + getStaffAmount(m), 0);
          for (const m of src) {
              if (curAmount >= cap) break;
              const core = extractStaffName(m);
              if (target.map(extractStaffName).includes(core) || (this.ctx.customRules.fixed || []).some(r => r.staff === core) || this.isForbidden(core, targetRoom)) continue;
              target.push(m); curAmount += getStaffAmount(m); this.addU(core, getStaffAmount(m));
          }
          return target;
      };
      this.dayCells[pair.s2] = join(process(m1, m2, pair.s2));
      m2 = split(this.dayCells[pair.s2]); this.dayCells[pair.s1] = join(process(m2, m1, pair.s1));
    });
  }

  processPostTasks() {
    const availSupport = this.initialAvailSupport; const availGeneral = this.initialAvailGeneral;
    const supportTargetRooms = split(this.ctx.customRules.supportTargetRooms || "");
    const noLateShiftStaffList = split(this.ctx.customRules.noLateShiftStaff || "");
    const cannotLateShift = [...split(this.dayCells["明け"]), ...split(this.dayCells["入り"]), ...split(this.dayCells["不在"]).filter(m => !m.includes("(AM)")).map(extractStaffName), ...noLateShiftStaffList];

    // 空室救済
    ROOM_SECTIONS.forEach(targetRoom => {
      if (this.skipSections.includes(targetRoom)) return;
      const cap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      let currentMems = split(this.dayCells[targetRoom]);
      let curAmount = currentMems.reduce((s, m) => s + getStaffAmount(m), 0);
      if (curAmount >= cap) return; 
      
      const rescueRule = (this.ctx.customRules.rescueRules || []).find((r: any) => r.targetRoom === targetRoom);
      if (rescueRule && rescueRule.sourceRooms) {
         const candidates: { core: string, fullStr: string, srcIdx: number }[] = [];
         split(rescueRule.sourceRooms).forEach((srcRoom, idx) => {
            split(this.dayCells[srcRoom]).forEach(m => {
               const core = extractStaffName(m);
               if (!this.isForbidden(core, targetRoom) && !(this.ctx.customRules.fixed || []).some(r => r.staff === core)) candidates.push({ core, fullStr: m, srcIdx: idx });
            });
         });
         candidates.sort((a, b) => this.getTodayRoomCount(a.core) - this.getTodayRoomCount(b.core) || a.srcIdx - b.srcIdx);
         for (const cand of candidates) {
            if (curAmount >= cap) break;
            if (currentMems.map(extractStaffName).includes(cand.core)) continue;
            currentMems.push(cand.fullStr); curAmount += getStaffAmount(cand.fullStr); this.addU(cand.core, getStaffAmount(cand.fullStr));
         }
         this.dayCells[targetRoom] = join(currentMems);
      }
    });

    // 遅番
    (this.ctx.customRules.lateShifts || []).forEach((rule: any) => {
      let current = split(this.dayCells[rule.section]);
      if (current.length === 0 || current.some(m => m.includes(rule.lateTime))) return;
      const picked = availGeneral.find(n => !cannotLateShift.includes(n) && !current.map(extractStaffName).includes(n) && !this.isForbidden(n, rule.section));
      if (picked) { current.push(`${picked}${rule.lateTime}`); this.addU(picked, 0.5); this.dayCells[rule.section] = join(current); }
    });

    // 昼当番
    let currentLunch = split(this.dayCells["昼当番"]);
    const lunchTarget = this.ctx.customRules.lunchBaseCount ?? 3;
    const prioritySecs = split(this.ctx.customRules.lunchPrioritySections || "");
    for (const sec of prioritySecs) {
      if (currentLunch.length >= lunchTarget) break;
      split(this.dayCells[sec]).forEach(name => { const core = extractStaffName(name); if (!currentLunch.includes(core) && currentLunch.length < lunchTarget && !this.isForbidden(core, "昼当番")) currentLunch.push(core); });
    }
    this.dayCells["昼当番"] = join(currentLunch.slice(0, lunchTarget));

    // 部長サポート
    availSupport.forEach(staff => {
      const b = this.blockMap.get(staff); if (b === 'ALL') return;
      for (const room of supportTargetRooms) {
        let current = split(this.dayCells[room]);
        if (current.length > 0 && !current.map(extractStaffName).includes(staff) && !this.hasNGPair(staff, current.map(extractStaffName), false)) {
          current.push(staff); this.dayCells[room] = join(current); this.addU(staff, 1); break;
        }
      }
    });
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

  // 🌟 アラート計算ロジック（全ての日に対応）
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

  const warnings = useMemo(() => getDayWarnings(sel), [sel, days, customRules]);

  const setAllDaysWithHistory = (updater: any) => {
    setAllDays(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) { setHistory(h => [...h, prev].slice(-20)); } return next;
    });
  };

  const handleAutoAll = () => {
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev };
      let prevDayObj: DayData | null = null;
      const tempDays: any[] = [];
      const newLogs = { ...assignLogs };
      const ctx: AutoAssignContext = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules };
      for (let i = 0; i < 5; i++) {
        const baseDay = { ...days[i], cells: nextAll[days[i].id] || days[i].cells };
        const worker = new AutoAssigner(baseDay, prevDayObj, tempDays, ctx);
        const res = worker.execute();
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

  return (
    <div style={{ maxWidth: "96%", margin: "0 auto", padding: "32px", width: "100%", boxSizing: "border-box" }}>
      <style>{globalStyle}</style>
      
      {/* ヘッダー */}
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, gap: 20, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 40, fontWeight: 800 }}>勤務割付システム</h2>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button className="btn-hover" onClick={() => { const blob = new Blob([JSON.stringify({allDays, monthlyAssign, customRules})], {type:"application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=`shifto_${targetMonday}.json`; a.click(); }} style={btnStyle("#6366f1")}>💾 保存</button>
          <button className="btn-hover" onClick={() => fileInputRef.current?.click()} style={btnStyle("#8b5cf6")}>📂 読込</button>
          <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if(!file)return; const reader = new FileReader(); reader.onload=(ev:any)=>{ try{ const d=JSON.parse(ev.target.result); setAllDaysWithHistory(d.allDays); setMonthlyAssign(d.monthlyAssign); setCustomRules(d.customRules); alert("復元完了"); }catch(err){ alert("失敗"); } }; reader.readAsText(file); }} />
          <button className="btn-hover" onClick={() => window.print()} style={btnStyle("#475569")}>🖨️ 印刷</button>
          <button className="btn-hover" onClick={() => { if(window.confirm("消しますか？")){ localStorage.clear(); location.reload(); } }} style={btnStyle("#ef4444")}>🗑️ リセット</button>
        </div>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#be185d", fontSize: 26 }}>📱 スマホ連携（テキストコピー）</summary>
          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            <button className="btn-hover" onClick={() => { navigator.clipboard.writeText(JSON.stringify({allDays, monthlyAssign, customRules})); alert("コピーしました"); }} style={{ ...btnStyle("#db2777"), flex: 1 }}>📋 コピー</button>
            <input type="text" value={importText} onChange={e => setImportText(e.target.value)} placeholder="貼り付けて復元" style={{ flex: 2, padding: 20, fontSize: 24, borderRadius: 12, border: "2px solid #f9a8d4" }} />
            <button className="btn-hover" onClick={() => { try{ const d=JSON.parse(importText); setAllDaysWithHistory(d.allDays); setMonthlyAssign(d.monthlyAssign); setCustomRules(d.customRules); alert("復元完了"); }catch(e){alert("失敗");} }} style={{ ...btnStyle("#be185d"), flex: 1 }}>✨ 復元</button>
          </div>
        </details>
      </div>

      <div className="no-print" style={{ ...panelStyle(), marginBottom: 32 }}>
        <details>
          <summary style={{ fontWeight: 800, color: "#0f766e", fontSize: 28 }}>⚙️ スタッフ名簿・特殊ルール</summary>
          <div style={{ marginTop: 24, display: "grid", gap: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div><label style={{fontWeight:800, color:"#475569", marginBottom:12, display:"block"}}>一般スタッフ</label><textarea value={customRules.staffList} onChange={e=>setCustomRules({...customRules, staffList:e.target.value})} style={{width:"100%", padding:16, border:"2px solid #cbd5e1", borderRadius:12, fontSize:22, minHeight:120}}/></div>
              <div><label style={{fontWeight:800, color:"#475569", marginBottom:12, display:"block"}}>受付スタッフ</label><textarea value={customRules.receptionStaffList} onChange={e=>setCustomRules({...customRules, receptionStaffList:e.target.value})} style={{width:"100%", padding:16, border:"2px solid #cbd5e1", borderRadius:12, fontSize:22, minHeight:120}}/></div>
            </div>

            <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, border: "2px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 16px 0", fontSize: 26, fontWeight: 800 }}>👥 絶対優先の定員設定</h4>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "12px 16px", borderRadius: 10, border: "2px solid #cbd5e1" }}>
                    <span style={{ fontWeight: 800 }}>{room}:</span>
                    <input type="number" value={count as number} onChange={e => setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: Number(e.target.value)}})} style={{ width: 60, border: "none", fontSize: 24, textAlign: "center", fontWeight: 800 }} />人
                    <span onClick={() => { const n={...customRules.capacity}; delete n[room]; setCustomRules({...customRules, capacity:n}); }} style={{ cursor: "pointer", color: "#ef4444", marginLeft: 8 }}>✖</span>
                  </div>
                ))}
                <select onChange={e => { if(e.target.value) setCustomRules({...customRules, capacity: {...customRules.capacity, [e.target.value]: 1}}); e.target.value=""; }} className="rule-sel" style={{flex:"none", width:200}}><option value="">＋部屋追加</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select>
              </div>
            </div>

            <div style={{ background: "#fffbeb", padding: 32, borderRadius: 16, border: "2px solid #fde68a" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#b45309", fontSize: 26, fontWeight: 800 }}>👑 部屋の割り当て優先順位</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {(customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS).map((room, idx, arr) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "12px 16px", borderRadius: 10, border: "2px solid #fcd34d" }}>
                    <div style={{ display: "flex", alignItems: "center" }}><span style={{ fontSize: 20, fontWeight: 800, color: "#92400e", marginRight: 12 }}>{idx + 1}.</span><span style={{ fontWeight: 700 }}>{room}</span></div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "4px 8px" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "4px 8px" }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#ecfdf5", padding: 32, borderRadius: 16, border: "2px solid #a7f3d0" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#065f46", fontSize: 26, fontWeight: 800 }}>🔗 兼務・セット配置ルール</h4>
              <div style={{ display: "grid", gap: 16 }}>
                {(customRules.rescueRules || []).map((rule, idx, arr) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "2px solid #fde047", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, color: "#854d0e" }}>もし</span>
                        <select value={rule.targetRoom} onChange={e => updateRule("rescueRules", idx, "targetRoom", e.target.value)} className="rule-sel" style={{ borderColor: "#fef08a", minWidth: 180 }}>
                          <option value="">(空室の部屋)</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontWeight: 700, color: "#854d0e" }}>が不足なら ➔ 以下の部屋から兼務を探す</span>
                      </div>
                      <MultiSectionPicker selected={rule.sourceRooms} onChange={v => updateRule("rescueRules", idx, "sourceRooms", v)} options={ROOM_SECTIONS} hasArrows={true} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef08a", borderRadius: 8, padding: "8px 16px" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef08a", borderRadius: 8, padding: "8px 16px" }}>▼</button>
                      <button onClick={() => removeRule("rescueRules", idx)} style={{ border: "none", background: "#fee2e2", color: "#ef4444", borderRadius: 8, padding: "8px", marginTop: 8 }}>✖</button>
                    </div>
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("rescueRules", { targetRoom: "", sourceRooms: "" })}>＋ 救済ルール追加</button>
              </div>
            </div>

            <div style={{ background: "#fff1f2", padding: 32, borderRadius: 16, border: "2px solid #fecaca" }}>
              <h4 style={{ margin: "0 0 16px 0", color: "#be185d", fontSize: 26, fontWeight: 800 }}>⚠️ アラート設定</h4>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 320, background: "#fff", padding: 24, borderRadius: 12, border: "2px solid #fca5a5" }}>
                  <label style={{ display: "block", marginBottom: 12, fontWeight: 700, color: "#9f1239" }}>兼務の上限</label>
                  <input type="number" value={customRules.alertMaxKenmu} onChange={e => setCustomRules({...customRules, alertMaxKenmu: Number(e.target.value)})} style={{ width: 80, padding: 12, fontSize: 24, fontWeight: 800, textAlign: "center", border: "2px solid #fca5a5", borderRadius: 8 }} />
                  <span style={{ marginLeft: 12, fontWeight: 700 }}>部屋以上で警告</span>
                </div>
                <div style={{ flex: 2, minWidth: 400, background: "#fff", padding: 24, borderRadius: 12, border: "2px solid #fca5a5" }}>
                  <label style={{ display: "block", marginBottom: 12, fontWeight: 700, color: "#9f1239" }}>空室警告を出す部屋</label>
                  <MultiSectionPicker selected={customRules.alertEmptyRooms} onChange={v => setCustomRules({...customRules, alertEmptyRooms: v})} options={ROOM_SECTIONS} hasArrows={false} />
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 32, borderTop: "2px dashed #cbd5e1" }}>
              <h4 style={{ fontSize: 28, fontWeight: 800 }}>📅 月間担当者の設定</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => (
                  <SectionEditor key={key} section={label} value={monthlyAssign[key] || ""} activeStaff={key === "受付" ? activeReceptionStaff : allStaff} onChange={v => updateMonthly(key, v)} noTime={true} />
                ))}
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
                  <th style={{ position: "sticky", left: 0, top: 0, background: "#f8fafc", zIndex: 30, padding: 12, borderRight: "1px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", fontWeight: 800 }}>スタッフ</th>
                  {ROOM_SECTIONS.map(r => <th key={r} style={{ position: "sticky", top: 0, zIndex: 20, padding: 12, borderRight: "1px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", background: "#f8fafc", fontWeight: 800 }}>{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {allStaff.filter(s => activeGeneralStaff.includes(s)).map((staff, sIdx) => {
                  const isZebra = sIdx % 2 === 1;
                  const rowBg = isZebra ? "#f1f5f9" : "#ffffff";
                  return (
                    <tr key={staff} className="calendar-row">
                      <td style={{ position: "sticky", left: 0, background: rowBg, zIndex: 10, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", fontWeight: 800, textAlign: "left" }}>{staff}</td>
                      {ROOM_SECTIONS.map(r => {
                        const stat = monthlyMatrixStats[staff]?.[r] || { total: 0, late: 0 };
                        let bg = rowBg; let color = "#334155";
                        if (["CT", "MRI"].includes(r)) {
                          if (stat.total > 0) { bg = `rgba(59, 130, 246, ${Math.min(0.1 + stat.total * 0.15, 0.9)})`; if(stat.total >= 3) color = "#fff"; }
                          else if (isMonthlyMainStaff(r, staff, monthlyAssign)) bg = "#fef08a";
                        }
                        return (
                          <td key={r} style={{ padding: 8, background: bg, color: color, fontWeight: stat.total > 0 ? 800 : 500, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                              {stat.total > 0 && <span style={{fontSize:20}}>{stat.total}</span>}
                              {stat.late > 0 && <span style={{ fontSize: "14px", background: "#fef08a", color: "#b45309", padding: "2px 6px", borderRadius: "12px", border: "1px solid #fde047" }}>遅 {stat.late}</span>}
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
        <h3 style={{ marginTop: 0, marginBottom: 24, fontSize: 32, fontWeight: 800 }}>週間一覧</h3>
        <div className="scroll-container" style={{ borderRadius: 12, border: "2px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1400, background: "#fff" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 20 }}>
              <tr>
                <th style={{...cellStyle(true, false, false, true), borderRight: "3px solid #e2e8f0", borderBottom: "3px solid #e2e8f0"}}>区分</th>
                {days.map(day => {
                  const dayWarnings = getDayWarnings(day.id);
                  const errorCount = dayWarnings.filter(w => w.type === 'error').length;
                  const alertCount = dayWarnings.filter(w => w.type === 'alert').length;
                  return (
                    <th key={day.id} onClick={() => setSel(day.id)} style={{...cellStyle(true, day.isPublicHoliday, day.id === sel), borderBottom: "3px solid #e2e8f0", cursor: "pointer"}}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
                        {day.label}
                        {/* 🌟 週間一覧のアラートバッジ */}
                        {errorCount > 0 && <div style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: 32, height: 32, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>!!{errorCount}</div>}
                        {errorCount === 0 && alertCount > 0 && <div style={{ background: "#f59e0b", color: "#fff", borderRadius: "50%", width: 32, height: 32, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>!{alertCount}</div>}
                        {!day.isPublicHoliday && assignLogs[day.id]?.length > 0 && (
                          <button className="no-print" onClick={(e) => { e.stopPropagation(); setSelectedLogDay(day.id); }} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "4px 8px", fontSize: 16, color: "#0369a1", fontWeight: "bold" }}>根拠</button>
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
        <div className="scroll-container hide-scrollbar sticky-header" style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {days.map(d => (
              <button key={d.id} onClick={() => setSel(d.id)} style={{ padding: "16px 28px", borderRadius: 12, border: "none", background: d.id === sel ? "#2563eb" : "#fff", color: d.id === sel ? "#fff" : (d.isPublicHoliday ? "#ef4444" : "#64748b"), fontWeight: 800, fontSize: 24, cursor: "pointer", boxShadow: d.id === sel ? "0 4px 6px rgba(0,0,0,0.1)" : "none" }}>{d.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button className="btn-hover" onClick={handleAutoAll} style={btnStyle("#0ea5e9")}>⚡ 全日程を自動割当</button>
            <button className="btn-hover" onClick={handleUndo} disabled={history.length === 0} style={btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6")}>↩️ 戻る</button>
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
                <h4 style={{ fontSize: 30, fontWeight: 800, borderLeft: `10px solid ${group.color}`, paddingLeft: 16, marginBottom: 24 }}>{group.title}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
                  {group.sections.map(s => <SectionEditor key={s} section={s} value={cur.cells[s] || ""} activeStaff={allStaff} onChange={v => updateDay(s, v)} noTime={["明け","入り","不在","土日休日代休","昼当番"].includes(s)} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLogDay && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSelectedLogDay(null)}>
          <div className="modal-animate" style={{ background: "#fff", padding: 40, borderRadius: 24, width: "90%", maxWidth: 800, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 32, borderBottom: "3px solid #e2e8f0", paddingBottom: 16, marginBottom: 24 }}>🤔 {selectedLogDay} の割当根拠</h3>
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
