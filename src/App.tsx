import React, { useEffect, useMemo, useState, useRef } from "react";

// ===================== 🌟 CSS & Styles =====================
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  html, body, #root { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
  body { background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', sans-serif; letter-spacing: 0.02em; font-size: 16px; overflow-x: hidden; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  textarea:focus, select:focus, input:focus { outline: 3px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 8px center; background-size: 1.2em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; padding-right: 32px !important; }
  details>summary { list-style: none; cursor: pointer; outline: none; transition: color 0.2s; }
  details>summary:hover { color: #0d9488; }
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; }
  .sticky-table-header th { position: sticky; top: 0; z-index: 20; background: #f8fafc; box-shadow: 0 2px 4px -1px rgba(0,0,0,0.05); }
  .sticky-header-panel { position: sticky; top: 0; z-index: 30; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); padding-top: 16px; margin-top: -16px; box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1); }
  .calendar-row { transition: background-color 0.2s; cursor: pointer; }
  .calendar-row:hover { background-color: #f1f5f9 !important; }
  .btn-hover { transition: all 0.2s; cursor: pointer; }
  .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important; }
  .card-hover { transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; }
  .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .rule-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center; width: 100%; }
  .rule-sel, .rule-num { padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 15px; transition: border-color 0.2s; }
  .rule-num { width: 60px; text-align: center; flex-shrink: 0; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 24px; flex-shrink: 0; padding: 0 8px; transition: 0.2s; }
  .rule-del:hover { background: #fee2e2; border-radius: 6px; }
  .rule-add { background: #fff; color: #4f46e5; border: 2px dashed #a5b4fc; padding: 10px 16px; font-size: 16px; width: 100%; display: flex; justify-content: center; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 12px; transition: 0.2s; }
  .rule-add:hover { background: #e0e7ff; border-color: #4f46e5; }
  .rule-label { font-size: 15px; font-weight: 700; color: #64748b; flex-shrink: 0; }
  .tab-btn { background: none; border: none; padding: 12px 20px; font-size: 17px; font-weight: 800; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; transition: 0.2s; }
  .tab-btn:hover { color: #3b82f6; }
  .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
  .name-textarea { width: 100%; height: 120px; padding: 12px; font-size: 15px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 600; line-height: 1.5; }
  .modal-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); }
  .modal-content { background: #fff; padding: 32px; border-radius: 16px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; }
  .modal-wide { max-width: 1000px; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
  .modal-title { margin: 0; font-size: 24px; color: #0f172a; font-weight: 800; }
  .close-btn { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; transition: 0.2s; }
  .close-btn:hover { background: #e2e8f0; }
  @media print { body { background: #fff; } .no-print { display: none !important; } .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; } table { width: 100% !important; border-collapse: collapse !important; table-layout: auto; } th, td { border: 1px solid #000 !important; padding: 6px !important; font-size: 11pt !important; color: #000 !important; position: static !important; } }
`;

// ===================== 🌟 Types & Constants =====================
export type RenderGroup = { title: string; color: string; sections: string[] };
export type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
export type WarningInfo = { level: 'red' | 'orange' | 'yellow'; title: string; msg: string; staff?: string; room?: string; };
export type RejectReason = { hard: boolean; msg: string };

export interface CustomRules {
  staffList: string; receptionStaffList: string; supportStaffList: string; supportTargetRooms: string; 
  supportTargetRoomsLowImpact: string; supportTargetRoomsHighImpact: string; customHolidays: string; capacity: Record<string, number>; 
  dailyCapacities: any[]; dailyAdditions: any[]; priorityRooms: string[]; fullDayOnlyRooms: string; noConsecutiveRooms: string; 
  consecutiveAlertRooms: string; noLateShiftStaff: string; noLateShiftRooms: string; lateShiftLowPriorityStaff: string;
  closedRooms: any[]; ngPairs: any[]; fixed: any[]; forbidden: any[]; substitutes: any[]; pushOuts: any[]; emergencies: any[]; 
  swapRules: any[]; kenmuPairs: any[]; rescueRules: any[]; lateShifts: any[]; lunchBaseCount: number; lunchSpecialDays: any[]; 
  lunchConditional: any[]; lunchRoleRules: any[]; lunchPrioritySections: string; lunchLastResortSections: string; linkedRooms: any[];
  alertMaxKenmu: number; alertEmptyRooms: string; smartKenmu: any[];
}
export type AutoAssignContext = { allStaff: string[]; activeGeneralStaff: string[]; activeReceptionStaff: string[]; monthlyAssign: Record<string, string>; customRules: CustomRules; };

export const SECTIONS = ["明け","入り","土日休日代休","不在","待機","CT","MRI","RI","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","受付","受付ヘルプ"];
export const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
export const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
export const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
export const WORK_SECTIONS = SECTIONS.filter(s => !REST_SECTIONS.includes(s));
export const ROLE_PLACEHOLDERS = ROOM_SECTIONS.map(s => s + "枠");
export const GENERAL_ROOMS = ["1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA", "検像"];
export const EXTENDED_ROOM_SECTIONS = [...ROOM_SECTIONS, "CT(4)", "CT(3)", "MRI(3)", "治療(3)"];

export const DEFAULT_PRIORITY_ROOMS = ["治療", "受付", "MMG", "RI", "MRI", "CT", "DSA", "ポータブル", "透視（6号）", "透視（11号）", "骨塩", "1号室", "2号室", "5号室", "検像", "パノラマCT", "3号室", "受付ヘルプ", "透析後胸部"];
export const MONTHLY_CATEGORIES = [ { key: "CT", label: "CT" }, { key: "MRI", label: "MRI" }, { key: "治療", label: "治療 (メイン)" }, { key: "治療サブ優先", label: "治療 (サブ優先)" }, { key: "治療サブ", label: "治療 (サブ)" }, { key: "RI", label: "RI (メイン)" }, { key: "RIサブ", label: "RI (サブ)" }, { key: "MMG", label: "MMG" }, { key: "受付", label: "受付" }, { key: "受付ヘルプ", label: "受付ヘルプ" } ];
export const DEFAULT_MONTHLY_ASSIGN: Record<string, string> = { CT: "", MRI: "", 治療: "", 治療サブ優先: "", 治療サブ: "", RI: "", RIサブ: "", MMG: "", 受付: "", 受付ヘルプ: "" };

export const RENDER_GROUPS: RenderGroup[] = [ 
  { title: "休務・夜勤", color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] }, 
  { title: "モダリティ", color: "#3b82f6", sections: ["CT","MRI","RI","治療"] }, 
  { title: "一般撮影・透視・その他", color: "#10b981", sections: ["MMG","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","検像","受付","受付ヘルプ","昼当番"] }, 
  { title: "待機・その他", color: "#f59e0b", sections: ["待機","透析後胸部"] } 
];

export const FALLBACK_HOLIDAYS: Record<string, string> = { "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日", "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日" };

export const DEFAULT_RULES: CustomRules = { 
  staffList: "", receptionStaffList: "", supportStaffList: "浅野", supportTargetRooms: "2号室, 3号室", supportTargetRoomsLowImpact: "3号室,パノラマCT", supportTargetRoomsHighImpact: "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像", customHolidays: "", capacity: { "CT": 4, "MRI": 3, "治療": 3, "RI": 1, "MMG": 1, "透視（6号）": 1, "透視（11号）": 1, "骨塩": 1, "1号室": 1, "5号室": 1, "パノラマCT": 1 }, dailyCapacities: [], dailyAdditions: [], priorityRooms: DEFAULT_PRIORITY_ROOMS, fullDayOnlyRooms: "DSA", noConsecutiveRooms: "ポータブル", consecutiveAlertRooms: "ポータブル, 透視（6号）", noLateShiftStaff: "浅野、木内康、髙橋、川崎、松平、阿部", noLateShiftRooms: "透視（11号）", lateShiftLowPriorityStaff: "木内康、石田、澤邊、依田", closedRooms: [], ngPairs: [{s1:"本郷",s2:"寺本",level:"hard"},{s1:"髙橋",s2:"寺本",level:"soft"}], fixed: [], forbidden: [{staff:"浅野",sections:"CT、ポータブル、MRI、1号室、MMG、骨塩、透析後胸部、DSA、残り・待機、受付、受付ヘルプ、パノラマCT、5号室、検像、治療、RI"}], substitutes: [], pushOuts: [], 
  emergencies: [{ threshold: 19, type: "change_capacity", role: "", section: "CT", newCapacity: 3 }, { threshold: 17, type: "staff_assign", role: "", section: "2号室", newCapacity: 3, staff: "" }], 
  swapRules: [{ targetRoom: "ポータブル", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }, { targetRoom: "パノラマCT", triggerRoom: "2号室", sourceRooms: "1号室、5号室、CT(4)" }, { targetRoom: "DSA", triggerRoom: "5号室", sourceRooms: "透視（6号）、1号室、2号室、CT(4)" }], 
  kenmuPairs: [{ s1: "MMG", s2: "透視（11号）", isExclusive: true }, { s1: "骨塩", s2: "検像", isExclusive: true }, { s1: "パノラマCT", s2: "透視（6号）", isExclusive: true }, { s1: "2号室", s2: "パノラマCT", isExclusive: false }], 
  rescueRules: [{ targetRoom: "ポータブル", sourceRooms: "3号室、2号室、1号室、5号室、CT(4)" }, { targetRoom: "DSA", sourceRooms: "5号室、2号室、検像、CT(4)" }, { targetRoom: "1号室", sourceRooms: "3号室、パノラマCT、CT(4)" }, { targetRoom: "2号室", sourceRooms: "3号室、パノラマCT、CT(4)" }, { targetRoom: "3号室", sourceRooms: "パノラマCT、CT(4)" }, { targetRoom: "5号室", sourceRooms: "3号室、パノラマCT、CT(4)" }], 
  lateShifts: [{ section: "透視（6号）", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" }], lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], lunchRoleRules: [{ day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" }], lunchPrioritySections: "RI, 1号室, 2号室, 3号室, 5号室", lunchLastResortSections: "治療", 
  linkedRooms: [{ target: "ポータブル", sources: "3号室(1)、2号室、1号室、5号室、CT(4)" }, { target: "検像", sources: "骨塩" }, { target: "DSA", sources: "5号室、2号室、CT(4)、パノラマCT" }, { target: "パノラマCT", sources: "透視（6号）、2号室" }], alertMaxKenmu: 3, alertEmptyRooms: "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像,受付", smartKenmu: [{ targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" }] 
};

export const KEY_ALL_DAYS = "shifto_alldays_v300"; export const KEY_MONTHLY = "shifto_monthly_v300"; export const KEY_RULES = "shifto_rules_v300";

export const pad = (n: number) => String(n).padStart(2, '0');
export const TIME_OPTIONS: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h = 8; h <= 19; h++) { for (let m = 0; m < 60; m += 15) { if (h === 8 && m === 0) continue; TIME_OPTIONS.push(`(${h}:${pad(m)}〜)`); TIME_OPTIONS.push(`(〜${h}:${pad(m)})`); } }

export const split = (v: string) => (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean);
export const join = (a: string[]) => a.filter(Boolean).join("、");
export const extractStaffName = (f: string) => f.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
export const parseRoomCond = (str: string) => { const m = str.match(/^(.*?)\((\d+)\)$/); return m ? { r: m[1], min: Number(m[2]) } : { r: str, min: 0 }; };

export function parseAndSortStaff(staffString: string) {
  const list = split(staffString);
  const parsed = list.map(s => { const match = s.match(/^(.*?)[\(（](.*?)[\)）]$/); return { cleanName: match ? match[1].trim() : s, yomi: match ? match[2].trim() : s }; });
  parsed.sort((a, b) => a.yomi.localeCompare(b.yomi, 'ja'));
  return Array.from(new Set(parsed.map(p => p.cleanName)));
}

export function formatDayForDisplay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }

export function getMonthlyStaffForSection(sec: string, monthlyAssign: Record<string, string>): string[] {
  let staff: string[] = [];
  if (sec === "治療") staff = [...split(monthlyAssign.治療), ...split(monthlyAssign.治療サブ優先), ...split(monthlyAssign.治療サブ)];
  else if (sec === "RI") staff = [...split(monthlyAssign.RI), ...split(monthlyAssign.RIサブ)];
  else if (monthlyAssign[sec] !== undefined) staff = split(monthlyAssign[sec]);
  return staff.map(extractStaffName);
}

export function isMonthlyMainStaff(section: string, name: string, monthlyAssign: Record<string, string>) {
  if (!section) return false;
  return getMonthlyStaffForSection(section, monthlyAssign).includes(extractStaffName(name));
}

export function parseClock(text: string): number {
  const [h, m] = text.split(":").map(Number);
  return h * 60 + m;
}

export function getWorkRangeFromTag(tag: string): { start: number; end: number } {
  if (!tag) return { start: 0, end: 24 * 60 };
  if (tag === "(AM)") return { start: 0, end: 12 * 60 };
  if (tag === "(PM)") return { start: 12 * 60, end: 24 * 60 };
  let m = tag.match(/^\(〜(\d{1,2}:\d{2})\)$/);
  if (m) return { start: 0, end: parseClock(m[1]) };
  m = tag.match(/^\((\d{1,2}:\d{2})〜\)$/);
  if (m) return { start: parseClock(m[1]), end: 24 * 60 };
  m = tag.match(/^\((\d{1,2}:\d{2})〜(\d{1,2}:\d{2})\)$/);
  if (m) return { start: parseClock(m[1]), end: parseClock(m[2]) };
  return { start: 0, end: 24 * 60 };
}

export function getShiftCoverageFromTag(tag: string): { am: boolean; pm: boolean } {
  const range = getWorkRangeFromTag(tag);
  const boundary = 11 * 60 + 30;
  return {
    am: range.start < boundary && range.end > 0,
    pm: range.end > boundary && range.start < 24 * 60,
  };
}

export function entryCoversShift(entry: string, shift: 'AM' | 'PM'): boolean {
  const tag = entry.substring(extractStaffName(entry).length);
  const coverage = getShiftCoverageFromTag(tag);
  return shift === 'AM' ? coverage.am : coverage.pm;
}

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${pad(m)}`;
}

export function tagsOverlap(tagA: string, tagB: string): boolean {
  const a = getWorkRangeFromTag(tagA || "");
  const b = getWorkRangeFromTag(tagB || "");
  return a.start < b.end && a.end > b.start;
}

export function trimEntryToNeed(entry: string, need: 'AM' | 'PM'): string | null {
  if (!entryCoversShift(entry, need)) return null;
  const core = extractStaffName(entry);
  const tag = entry.substring(core.length);
  if (!tag) return `${core}${need === 'AM' ? '(AM)' : '(PM)'}`;
  return entry;
}

export function getStaffAmount(name: string) {
  if (ROLE_PLACEHOLDERS.includes(extractStaffName(name))) return 0;
  return (name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/)) ? 0.5 : 1;
}

export const ABSENCE_HELP_KEY = "__absenceHelp";
export const ABSENCE_HELP_NONE = "__NO_HELP__";

export function parseAbsenceHelpMap(dayCells?: Record<string, string>): Record<string, string> {
  if (!dayCells) return {};
  const raw = dayCells[ABSENCE_HELP_KEY] || "{}";
  const candidates = [raw, raw.replace(/、/g, ",")];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (!parsed || typeof parsed !== "object") continue;
      return Object.fromEntries(
        Object.entries(parsed).filter(([k, v]) => typeof k === "string" && typeof v === "string")
      ) as Record<string, string>;
    } catch {
    }
  }
  return {};
}

// ===================== 🌟 UI Components =====================
export const btnStyle = (bg: string, color: string = "#fff", fontSize: number = 15): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 6 });
export const panelStyle = (): React.CSSProperties => ({ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" });
export const cellStyle = (isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties => { let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff"); if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff"); return { border: "1px solid #e2e8f0", padding: "10px 12px", background: bg, fontWeight: isHeader ? 800 : 700, textAlign: isHeader ? "center" : "left", fontSize: isHeader ? 16 : 15, color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, transition: "background-color 0.2s" }; };

export const Modal = ({ title, onClose, wide, children }: any) => ( <div className="modal-overlay" onClick={onClose}><div className={`modal-content modal-animate ${wide ? 'modal-wide' : ''}`} onClick={e => e.stopPropagation()}><div className="modal-header"><h3 className="modal-title">{title}</h3><button onClick={onClose} className="close-btn">✖</button></div>{children}<div style={{ textAlign: "center", marginTop: 32 }}><button className="btn-hover" onClick={onClose} style={{ ...btnStyle("#2563eb", "#fff", 16), width: "100%", justifyContent: "center", padding: "16px" }}>閉じる</button></div></div></div> );
export const RuleCard = ({ bg, border, color, icon, title, desc, children }: any) => ( <div style={{ background: bg, padding: 24, borderRadius: 12, border: `2px solid ${border}`, marginBottom: 20 }}><h5 style={{ margin: "0 0 12px 0", color, fontSize: 18, fontWeight: 800 }}>{icon} {title}</h5>{desc && <p style={{ fontSize: 15, color: "#166534", marginTop: 0, marginBottom: 16 }}>{desc}</p>}{children}</div> );
export const MultiPicker = ({ selected, onChange, options, placeholder }: any) => { const current = split(selected); const handleAdd = (val: string) => { if (val && !current.includes(val)) onChange(join([...current, val])); }; const handleRemove = (idx: number) => { const next = [...current]; next.splice(idx, 1); onChange(join(next)); }; return ( <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 8 }}>{current.map((item, i) => ( <div key={i} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 16, padding: "6px 12px", fontSize: 15, fontWeight: 700, border: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: 6 }}><span>{item}</span><span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5 }}>✖</span></div> ))} <select className="rule-sel" onChange={(e: any) => { handleAdd(e.target.value); e.target.value = ""; }} value=""><option value="">{placeholder || "＋追加"}</option>{options.filter((s: string) => !current.includes(s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</select></div> ); };

export const DelBtn = ({onClick}:any) => <button onClick={onClick} className="rule-del">✖</button>;
export const NumInp = ({v, onChange, w}:any) => <input type="number" value={v} onChange={e=>onChange(Number(e.target.value))} className="rule-num" style={{width:w}} />;
export const Row = ({children}:any) => <div className="rule-row">{children}</div>;
export const StaffSel = ({v, onChange, list, ph="スタッフ", w}:any) => <select value={v} onChange={e=>onChange(e.target.value)} className="rule-sel" style={{width:w, flex:"0 0 auto"}}><option value="">{ph}</option>{list.map((s:any)=><option key={s} value={s}>{s}</option>)}</select>;
export const RoomSel = ({v, onChange, list, ph="場所", w}:any) => <select value={v} onChange={e=>onChange(e.target.value)} className="rule-sel" style={{width:w, flex:"0 0 auto"}}><option value="">{ph}</option>{list.map((s:any)=><option key={s} value={s}>{s}</option>)}</select>;

export const renderLog = (logStr: string, i: number) => {
  if (logStr.startsWith("・■")) return <li key={i} style={{ marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottom: "2px solid #cbd5e1", fontSize: 18, fontWeight: 800, color: "#334155" }}>{logStr.substring(2)}</li>;
  if (logStr.startsWith("❌")) return <li key={i} style={{ padding: "10px 14px", marginBottom: "6px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: 14, color: "#991b1b", fontWeight: 700 }}>{logStr}</li>;
  if (logStr.startsWith("⚠️")) return <li key={i} style={{ padding: "10px 14px", marginBottom: "6px", background: "#fef08a", border: "1px solid #fde047", borderRadius: "8px", fontSize: 14, color: "#854d0e", fontWeight: 700 }}>{logStr}</li>;
  
  const match = logStr.match(/^・(.*?)\s\[(.*?)\]\s(.*)$/);
  if (!match) return <li key={i} style={{ padding: "8px 12px", marginBottom: "4px", background: "#f8fafc", borderRadius: "6px", fontSize: 14, color: "#475569", lineHeight: 1.6, wordBreak: "break-word" }}>{logStr.substring(1)}</li>;
  const icon = match[1]; const category = match[2]; const text = match[3];
  let bg = "#f8fafc"; let border = "#e2e8f0"; let color = "#475569"; let badgeBg = "#e2e8f0"; let badgeColor = "#475569";
  if (category.includes("配置決定") || category.includes("増枠") || category.includes("初期優先度")) { bg = "#eff6ff"; border = "#bfdbfe"; color = "#1e3a8a"; badgeBg = "#dbeafe"; badgeColor = "#1d4ed8"; }
  else if (category.includes("緊急") || category.includes("除外") || category.includes("スキップ")) { bg = "#fef2f2"; border = "#fecaca"; color = "#7f1d1d"; badgeBg = "#fee2e2"; badgeColor = "#b91c1c"; }
  else if (category.includes("救済") || category.includes("代打") || category.includes("最終救済") || category.includes("特例サポート") || category.includes("時間補充")) { bg = "#fff7ed"; border = "#fed7aa"; color = "#9a3412"; badgeBg = "#ffedd5"; badgeColor = "#c2410c"; }
  else if (category.includes("兼務") || category.includes("負担軽減") || category.includes("スマート兼務") || category.includes("解消")) { bg = "#ecfdf5"; border = "#a7f3d0"; color = "#064e3b"; badgeBg = "#d1fae5"; badgeColor = "#047857"; }
  else if (category.includes("遅番")) { bg = "#f5f3ff"; border = "#ddd6fe"; color = "#4c1d95"; badgeBg = "#ede9fe"; badgeColor = "#6d28d9"; }
  else if (category.includes("玉突き")) { bg = "#e0f2fe"; border = "#bae6fd"; color = "#0c4a6e"; badgeBg = "#bae6fd"; badgeColor = "#0369a1"; }
  else if (category.includes("専従") || category.includes("役割") || category.includes("サポート固定")) { bg = "#f0fdfa"; border = "#bbf7d0"; color = "#14532d"; badgeBg = "#dcfce7"; badgeColor = "#15803d"; }
  else if (category.includes("昼当番") || category.includes("ヘルプ") || category.includes("サポート") || category.includes("余剰") || category.includes("ポータブル特例")) { bg = "#fdf4ff"; border = "#f5d0fe"; color = "#701a75"; badgeBg = "#fae8ff"; badgeColor = "#86198f"; }
  return <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", marginBottom: "6px", background: bg, borderRadius: "8px", border: `1px solid ${border}`, fontSize: 14, color, lineHeight: 1.6, fontWeight: 600, wordBreak: "break-word" }}><span style={{ display: "inline-block", padding: "4px 8px", background: badgeBg, color: badgeColor, borderRadius: "6px", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>{icon} {category}</span><span style={{ fontWeight: 700 }}>{text}</span></li>;
};

export const WeekCalendarPicker = ({ targetMonday, onChange, nationalHolidays, customHolidays }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(targetMonday));
  useEffect(() => { setViewDate(new Date(targetMonday)); }, [targetMonday]);
  const year = viewDate.getFullYear(); const month = viewDate.getMonth() + 1; const daysInMonth = new Date(year, month, 0).getDate(); const firstDay = new Date(year, month - 1, 1).getDay();
  const weeks: (number | null)[][] = []; let currentWeek: (number | null)[] = new Array(7).fill(null);
  for (let i = 0; i < firstDay; i++) currentWeek[i] = null;
  for (let d = 1; d <= daysInMonth; d++) { const dow = (firstDay + d - 1) % 7; currentWeek[dow] = d; if (dow === 6 || d === daysInMonth) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); } }
  const handleWeekClick = (weekObj: (number|null)[]) => {
    let validDay = weekObj.find(d => d !== null); if (!validDay) return;
    const dObj = new Date(year, month - 1, validDay, 12, 0, 0); const day = dObj.getDay(); const diff = dObj.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(dObj.getTime()); mon.setDate(diff);
    onChange(`${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`); setIsOpen(false);
  };
  return (
    <div style={{ position: "relative" }}>
      <button className="btn-hover" onClick={() => setIsOpen(!isOpen)} style={{ ...btnStyle("#fff", "#2563eb"), border: "1px solid #bfdbfe", padding: "8px 14px", fontSize: 15 }}>📅 {targetMonday} 週 ▼</button>
      {isOpen && (
        <><div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)}></div>
          <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 12, padding: 20, zIndex: 50, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.15)", minWidth: 320 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><button onClick={() => setViewDate(new Date(year, month - 2, 1))} style={{ border: "none", background: "#f1f5f9", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>◀</button><div style={{ fontWeight: 800, fontSize: 18 }}>{year}年 {month}月</div><button onClick={() => setViewDate(new Date(year, month, 1))} style={{ border: "none", background: "#f1f5f9", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>▶</button></div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: 16 }}><thead><tr><th style={{ color: "#ef4444", padding: 8 }}>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th style={{ color: "#3b82f6", padding: 8 }}>土</th></tr></thead>
              <tbody>{weeks.map((w, wIdx) => {
                  const isSelectedWeek = w.some(d => { if(!d) return false; const dObj = new Date(year, month - 1, d, 12, 0, 0); const day = dObj.getDay(); const diff = dObj.getDate() - day + (day === 0 ? -6 : 1); const checkMon = new Date(dObj.getTime()); checkMon.setDate(diff); return `${checkMon.getFullYear()}-${pad(checkMon.getMonth()+1)}-${pad(checkMon.getDate())}` === targetMonday; });
                  return <tr key={wIdx} onClick={() => handleWeekClick(w)} className="calendar-row" style={{ background: isSelectedWeek ? "#eff6ff" : "transparent" }}>{w.map((d, dIdx) => { if (!d) return <td key={dIdx} style={{ padding: 10 }}></td>; const isHoliday = !!(nationalHolidays[`${year}-${pad(month)}-${pad(d)}`] || customHolidays.includes(`${year}-${pad(month)}-${pad(d)}`)); let color = "#334155"; if (dIdx === 0 || isHoliday) color = "#ef4444"; else if (dIdx === 6) color = "#3b82f6"; return <td key={dIdx} style={{ padding: 10, color, fontWeight: isHoliday ? 800 : 600 }}>{d}</td>; })}</tr>
                })}</tbody>
            </table></div></>
      )}
    </div>
  );
};

export const SectionEditor = ({ section, value, activeStaff, onChange, noTime = false, customOptions = [], onAddHelp, dayCells }: any) => {
  const members = split(value); const isTaiki = section === "待機"; const isFuzai = section === "不在"; const isHelp = section === "受付ヘルプ";
  const [pendingFuzai, setPendingFuzai] = React.useState("");
  const FUZAI_TIMES = ["","(AM)","(PM)","(〜8:30)","(〜9:00)","(〜9:30)","(〜10:00)","(〜10:30)","(〜11:00)","(〜11:30)","(〜12:00)","(〜12:30)","(〜13:00)","(〜13:30)","(〜14:00)","(〜14:30)","(〜15:00)","(〜15:30)","(〜16:00)","(〜16:30)","(〜17:00)","(8:30〜)","(9:00〜)","(9:30〜)","(10:00〜)","(10:30〜)","(11:00〜)","(11:30〜)","(12:00〜)","(12:30〜)","(13:00〜)","(13:30〜)","(14:00〜)","(14:30〜)","(15:00〜)","(15:30〜)","(16:00〜)","(16:30〜)","(17:00〜)"];
  const FUZAI_LABELS: Record<string,string> = {"":"全休","(AM)":"AM休","(PM)":"PM休","(〜8:30)":"〜8:30","(〜9:00)":"〜9:00","(〜9:30)":"〜9:30","(〜10:00)":"〜10:00","(〜10:30)":"〜10:30","(〜11:00)":"〜11:00","(〜11:30)":"〜11:30","(〜12:00)":"〜12:00","(〜12:30)":"〜12:30","(〜13:00)":"〜13:00","(〜13:30)":"〜13:30","(〜14:00)":"〜14:00","(〜14:30)":"〜14:30","(〜15:00)":"〜15:00","(〜15:30)":"〜15:30","(〜16:00)":"〜16:00","(〜16:30)":"〜16:30","(〜17:00)":"〜17:00","(8:30〜)":"8:30〜","(9:00〜)":"9:00〜","(9:30〜)":"9:30〜","(10:00〜)":"10:00〜","(10:30〜)":"10:30〜","(11:00〜)":"11:00〜","(11:30〜)":"11:30〜","(12:00〜)":"12:00〜","(12:30〜)":"12:30〜","(13:00〜)":"13:00〜","(13:30〜)":"13:30〜","(14:00〜)":"14:00〜","(14:30〜)":"14:30〜","(15:00〜)":"15:00〜","(15:30〜)":"15:30〜","(16:00〜)":"16:00〜","(16:30〜)":"16:30〜","(17:00〜)":"17:00〜"};
  const HELP_TIMES = ["(12:15〜13:00)","(16:00〜)","(8:30〜)","(9:00〜)","(9:30〜)","(10:00〜)","(10:30〜)","(11:00〜)","(11:30〜)","(12:00〜)","(13:00〜)","(13:30〜)","(14:00〜)","(14:30〜)","(15:00〜)","(15:30〜)","(16:30〜)","(17:00〜)"];
  const handleAdd = (name: string) => {
    if (!name) return;
    if (isFuzai) { onChange(join([...members, `${name}${pendingFuzai}`])); setPendingFuzai(""); return; }
    if (isHelp) { onChange(join([...members, `${name}(12:15〜13:00)`])); return; }
    onChange(join([...members, isTaiki ? `${name}(17:00〜19:00)` : name]));
  };
  const handleRemove = (idx: number) => { const next = [...members]; next.splice(idx, 1); onChange(join(next)); };
  const handleTimeChange = (idx: number, newTime: string) => { if (noTime && !isFuzai && !isHelp) return; const next = [...members]; next[idx] = extractStaffName(next[idx]) + newTime; onChange(join(next)); };
  return (
    <div className="card-hover" style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
      <label style={{ fontSize: 16, fontWeight: 800, color: "#475569", marginBottom: 12 }}>{section}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {members.map((m, i) => {
          const coreName = extractStaffName(m); const currentMod = m.substring(coreName.length); const isPlaceholder = ROLE_PLACEHOLDERS.includes(coreName) || (customOptions.includes(coreName) && !activeStaff.includes(coreName));
          return (
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime && !isFuzai ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime && !isFuzai ? "#334155" : "#0369a1"), borderRadius: 16, padding: "8px 12px 8px 14px", fontSize: 15, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${isPlaceholder ? "#fde047" : (noTime && !isFuzai ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 700 }}>
              <span>{coreName}</span>
              {(!noTime || isFuzai || isHelp) && (
                <select value={currentMod} onChange={(e: any) => handleTimeChange(i, e.target.value)} style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: "inherit", cursor: "pointer", padding: "0 20px 0 6px" }}>
                  {isFuzai
                    ? FUZAI_TIMES.map(t => <option key={t} value={t}>{FUZAI_LABELS[t]}</option>)
                    : isHelp
                      ? HELP_TIMES.map(t => <option key={t} value={t}>{t.replace(/[()]/g,'')}</option>)
                      : isTaiki ? <><option value="(17:00〜19:00)">17:00〜19:00</option><option value="(17:00〜22:00)">17:00〜22:00</option><option value="(17:00〜)">17:00〜</option></>
                        : <><option value="">終日</option><option value="(AM)">AM</option><option value="(PM)">PM</option>{currentMod && !["", "(AM)", "(PM)"].includes(currentMod) && !TIME_OPTIONS.includes(currentMod) && (<option value={currentMod}>{currentMod.replace(/[()]/g, '')}</option>)}{TIME_OPTIONS.filter(t => t !== "(AM)" && t !== "(PM)").map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</>}
                </select>
              )}
              {isFuzai && currentMod !== "" && onAddHelp && (() => {
                const HELP_RMS = ["CT","MRI","RI","治療","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","検像"];
                const foundRm = dayCells ? HELP_RMS.find((r:string) => split(dayCells[r]||"").some((m:string) => extractStaffName(m) === coreName)) : null;
                const foundEntries = foundRm ? split(dayCells[foundRm] || "").filter((m:string) => m.startsWith(foundRm+"枠")) : [];
                const foundEntry = foundEntries.length > 0 ? foundEntries[foundEntries.length - 1] : null;
                return (
                  <span style={{display:"flex",alignItems:"center",gap:2,marginLeft:4,borderLeft:"1px solid #c7d2fe",paddingLeft:4}}>
                    {foundEntry
                      ? <span style={{fontSize:11,color:"#6366f1",fontWeight:700,whiteSpace:"nowrap"}}>{foundRm} {foundEntry.substring((foundRm+"枠").length).replace(/[()]/g,"")} 補充済</span>
                      : <><span style={{fontSize:11,color:"#6366f1",fontWeight:700,whiteSpace:"nowrap"}}>補充</span>
                        <select defaultValue="" onChange={(e:any)=>{if(e.target.value){onAddHelp(coreName,e.target.value);e.target.value="";}}} style={{appearance:"none",background:"transparent",border:"none",outline:"none",fontSize:13,fontWeight:700,color:"#6366f1",cursor:"pointer",padding:"0 16px 0 2px"}}>
                          <option value="">何時から</option>
                          {["(AM)","(PM)","(8:30〜)","(9:00〜)","(9:30〜)","(10:00〜)","(10:30〜)","(11:00〜)","(11:30〜)","(12:00〜)","(12:30〜)","(13:00〜)","(13:30〜)","(14:00〜)","(14:30〜)","(15:00〜)","(15:30〜)","(16:00〜)","(16:30〜)","(17:00〜)"].map((t:string)=><option key={t} value={t}>{t.replace(/[()]/g,"")}</option>)}
                        </select></>
                    }
                  </span>
                );
              })()}
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 6 }}>✖</span>
            </div>
          )
        })}
        {isFuzai && (
          <select value={pendingFuzai} onChange={(e: any) => setPendingFuzai(e.target.value)} style={{ border: "1px dashed #fbbf24", background: "#fffbeb", outline: "none", fontSize: 15, color: "#92400e", cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "8px 12px", minWidth: 90 }}>
            {FUZAI_TIMES.map(t => <option key={t} value={t}>{FUZAI_LABELS[t]}</option>)}
          </select>
        )}
        <select onChange={(e: any) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 15, color: "#64748b", flex: 1, minWidth: 100, cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "8px 24px 8px 12px" }}>
          <option value="">＋{isFuzai ? "不在者を選択" : isHelp ? "ヘルプを追加" : "追加"}</option>
          <optgroup label="スタッフ">{activeStaff.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>
          {customOptions.length > 0 && <optgroup label="担当枠（未定）">{customOptions.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s)).map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>}
        </select>
      </div>
    </div>
  );
};

// ===================== 🌟 AutoAssigner =====================
export class AutoAssigner {
  day: DayData; prevDay: DayData | null; pastDaysInMonth: DayData[]; pastDaysInWeek: DayData[]; ctx: AutoAssignContext; isSmartFix: boolean;
  dayCells: Record<string, string>; blockMap: Map<string, string> = new Map(); timeTagMap: Map<string, string> = new Map();
  skipSections: string[] = []; clearSections: string[] = []; roleAssignments: Record<string, any> = {}; currentKenmu: any[] = [];
  dynamicCapacity: Record<string, number> = {}; assignCounts: Record<string, number> = {}; maxAssigns: Record<string, number> = {};
  counts: Record<string, number> = {}; roomCounts: Record<string, Record<string, number>> = {};
  initialAvailAll: string[] = []; initialAvailGeneral: string[] = []; initialAvailSupport: string[] = []; initialAvailReception: string[] = [];
  logInfo: string[] = []; staffAssignments: {staff: string, section: string}[] = [];
  
  constructor(day: DayData, prevDay: DayData | null, pastDaysInMonth: DayData[], pastDaysInWeek: DayData[], ctx: AutoAssignContext, isSmartFix: boolean = false) {
    this.day = { ...day }; this.prevDay = prevDay; this.pastDaysInMonth = pastDaysInMonth; this.pastDaysInWeek = pastDaysInWeek; this.ctx = ctx; this.dayCells = { ...day.cells }; this.dynamicCapacity = { ...(ctx.customRules.capacity || {}) }; this.isSmartFix = isSmartFix;
  }
  
  private log(msg: string) { this.logInfo.push(`・${msg}`); } 
  private logPhase(phaseName: string) { this.logInfo.push(`・■${phaseName}`); }
  private logError(msg: string) { this.logInfo.push(`❌ ${msg}`); }
  private logWarn(msg: string) { this.logInfo.push(`⚠️ ${msg}`); }
  
  getPastRoomCount(s: string, r: string) { const isM = ["CT", "MRI"].includes(r); const pds = isM ? this.pastDaysInMonth : this.pastDaysInWeek; return pds.filter(pd => split(pd.cells[r] || "").map(extractStaffName).includes(s)).length; }
  getPastLateShiftCount(s: string) { let c = 0; this.pastDaysInMonth.forEach(pd => { Object.values(pd.cells).forEach(val => { split(val as string).forEach(m => { if (extractStaffName(m) === s && (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:"))) c++; }); }); }); return c; }
  getTodayRoomCount(s: string) { let c = 0; Object.keys(this.dayCells).forEach(sec => { if (REST_SECTIONS.includes(sec) || ["待機", "昼当番", "受付", "受付ヘルプ"].includes(sec)) return; split(this.dayCells[sec]).forEach(m => { if (extractStaffName(m) === s && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:")) c++; }); }); return c; }
  private getAssignedWorkTag(staff: string): string { const b = this.blockMap.get(staff); const tt = this.timeTagMap.get(staff); if (b === 'AM') return tt || "(PM)"; if (b === 'PM') return tt || "(AM)"; return ""; }
  private canStaffCoverNeedTag(staff: string, needTag: string): boolean {
    const b = this.blockMap.get(staff);
    if (b === 'ALL') return false;
    if (!needTag) return true;
    const availableTag = this.getAssignedWorkTag(staff);
    return tagsOverlap(availableTag, needTag);
  }
  private setRemainingAvailabilityAfterAssign(staff: string, assignedTag: string) {
    if (!assignedTag) {
      this.blockMap.set(staff, 'ALL');
      this.timeTagMap.delete(staff);
      return;
    }
    if (assignedTag === '(AM)') {
      this.blockMap.set(staff, 'AM');
      this.timeTagMap.delete(staff);
      return;
    }
    if (assignedTag === '(PM)') {
      this.blockMap.set(staff, 'PM');
      this.timeTagMap.delete(staff);
      return;
    }
    const range = getWorkRangeFromTag(assignedTag);
    if (range.start <= 0 && range.end < 24 * 60) {
      this.blockMap.set(staff, 'AM');
      this.timeTagMap.set(staff, `(${formatClock(range.end)}〜)`);
      return;
    }
    if (range.start > 0 && range.end >= 24 * 60) {
      this.blockMap.set(staff, 'PM');
      this.timeTagMap.set(staff, `(〜${formatClock(range.start)})`);
      return;
    }
    this.blockMap.set(staff, 'ALL');
    this.timeTagMap.delete(staff);
  }
  getStaffTimeCounts(s: string) { let am = 0; let pm = 0; Object.keys(this.dayCells).forEach(sec => { if (["待機","昼当番","受付","受付ヘルプ"].includes(sec) || REST_SECTIONS.includes(sec)) return; split(this.dayCells[sec]).forEach(m => { if (extractStaffName(m) === s) { if (entryCoversShift(m, 'AM')) am++; if (entryCoversShift(m, 'PM')) pm++; } }); }); return { am, pm }; }
  
  isUsed(name: string): boolean { return (this.assignCounts[name] || 0) >= (this.maxAssigns[name] || 1); } 
  addUsage(name: string, f = 1): void { this.assignCounts[name] = (this.assignCounts[name] || 0) + f; } 
  isForbidden(staff: string, section: string): boolean { return (this.ctx.customRules.forbidden || []).some((rule: any) => extractStaffName(rule.staff) === extractStaffName(staff) && split(rule.sections).includes(section)); } 
  hasNGPair(candidate: string, members: string[], checkSoft: boolean): boolean { return members.some(member => (this.ctx.customRules.ngPairs || []).some((ng: any) => { const match = (extractStaffName(ng.s1) === extractStaffName(candidate) && extractStaffName(ng.s2) === extractStaffName(member)) || (extractStaffName(ng.s1) === extractStaffName(member) && extractStaffName(ng.s2) === extractStaffName(candidate)); if (!match) return false; if ((ng.level || "hard") === "hard") return true; if ((ng.level || "hard") === "soft" && checkSoft) return true; return false; })); }
  
  isFullDayOnly(r: string) { return split(this.ctx.customRules.fullDayOnlyRooms || "").includes(r); }
  isTimeTagBlockedByFullDayRule(r: string, tag: string) { return this.isFullDayOnly(r) && (tag.includes("AM") || tag.includes("PM")); }

  private isHalfDayBlocked(staff: string, section: string): { hard: boolean; monthlyHalfException: boolean } { const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? ""); if (!fullDayOnlyList.includes(section)) return { hard: false, monthlyHalfException: false }; const fuzaiMems = split(this.dayCells["不在"]); const isFuzaiAm = fuzaiMems.some(m => extractStaffName(m) === staff && m.includes("(AM)")); const isFuzaiPm = fuzaiMems.some(m => extractStaffName(m) === staff && m.includes("(PM)")); if (!isFuzaiAm && !isFuzaiPm) return { hard: false, monthlyHalfException: false }; const monthly = isMonthlyMainStaff(section, staff, this.ctx.monthlyAssign); if (!monthly) return { hard: true, monthlyHalfException: false }; return { hard: false, monthlyHalfException: true }; }
  
  private isHardNoConsecutive(s: string, r: string): boolean { const noC = split(this.ctx.customRules.noConsecutiveRooms || ""); if (!this.prevDay || !noC.includes(r)) return false; return split(this.prevDay.cells[r] || "").map(extractStaffName).includes(s); }
  
  private getRoomDependencyCount(r: string): number { let sc = 0; (this.ctx.customRules.linkedRooms || []).forEach((x: any) => { if (split(x.sources || "").some((y: string) => parseRoomCond(y).r === r)) sc += 3; if (x.target === r) sc += 1; }); (this.ctx.customRules.rescueRules || []).forEach((x: any) => { if (split(x.sourceRooms || "").some((y: string) => parseRoomCond(y).r === r)) sc += 2; if (x.targetRoom === r) sc += 1; }); (this.ctx.customRules.swapRules || []).forEach((x: any) => { if (split(x.sourceRooms || "").some((y: string) => parseRoomCond(y).r === r)) sc += 2; if (x.triggerRoom === r) sc += 1; if (x.targetRoom === r) sc += 1; }); (this.ctx.customRules.kenmuPairs || []).forEach((p: any) => { if (p.s1 === r || p.s2 === r) sc += 2; }); return sc; }
  private getRescueSourceScore(src: string, tgt: string, st?: string): number { let sc = 0; const low = split(this.ctx.customRules.supportTargetRoomsLowImpact || "3号室,パノラマCT"); const high = split(this.ctx.customRules.supportTargetRoomsHighImpact || "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像"); if (src === tgt) sc += 9999; if (low.includes(src)) sc -= 1000; if (high.includes(src)) sc += 1000; sc += this.getRoomDependencyCount(src) * 100; const sm = split(this.dayCells[src] || ""); const sList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName); const isOnly = sm.length > 0 && sm.every(m => sList.includes(extractStaffName(m))); if (isOnly) sc += 5000; else { const amt = sm.reduce((sum, m) => sum + getStaffAmount(m), 0); if (amt <= 1) sc += 500; else if (amt <= 2) sc += 200; } if (st) { const b = this.blockMap.get(st); if ((b === 'AM' || b === 'PM') && high.includes(src)) sc += 300; } if (this.clearSections.includes(src) || this.skipSections.includes(src)) sc += 5000; return sc; }
  
  updateBlockMapAfterKenmu(core: string, pushStr: string) {
    const cur = this.blockMap.get(core) || 'NONE';
    const tag = pushStr.substring(extractStaffName(pushStr).length);
    if (!tag) { this.blockMap.set(core, 'ALL'); this.timeTagMap.delete(core); return; }
    if (tag.includes("(AM)")) { this.blockMap.set(core, (cur === 'PM' || cur === 'ALL') ? 'ALL' : 'AM'); this.timeTagMap.delete(core); return; }
    if (tag.includes("(PM)")) { this.blockMap.set(core, (cur === 'AM' || cur === 'ALL') ? 'ALL' : 'PM'); this.timeTagMap.delete(core); return; }
    if (cur === 'NONE') { this.setRemainingAvailabilityAfterAssign(core, tag); return; }
    this.blockMap.set(core, 'ALL');
    this.timeTagMap.delete(core);
  }
  private getAbsenceHelpTargetRoom(staff: string): string | null {
    const core = extractStaffName(staff);
    const fixed = (this.ctx.customRules.fixed || []).find((r: any) => extractStaffName(r.staff) === core && ROOM_SECTIONS.includes(r.section));
    if (fixed?.section) return fixed.section;
    for (const room of ["CT", "MRI", "治療", "RI", "MMG"]) {
      if (getMonthlyStaffForSection(room, this.ctx.monthlyAssign).includes(core)) return room;
    }
    for (const room of ROOM_SECTIONS) {
      if (split(this.dayCells[room] || "").some(m => extractStaffName(m) === core)) return room;
    }
    return null;
  }
  private countCoverageForTag(section: string, tag: string): number {
    return split(this.dayCells[section] || "").reduce((sum, entry) => {
      const entryTag = entry.substring(extractStaffName(entry).length);
      return sum + (tagsOverlap(entryTag, tag) ? 1 : 0);
    }, 0);
  }
  private processAbsenceHelpAssignments() {
    const helpMap = parseAbsenceHelpMap(this.dayCells);
    const handled = new Set<string>();
    for (const [staff, helpTag] of Object.entries(helpMap)) {
      const core = extractStaffName(staff);
      if (!helpTag || helpTag === ABSENCE_HELP_NONE || handled.has(core)) continue;
      const room = this.getAbsenceHelpTargetRoom(core);
      if (!room || this.skipSections.includes(room) || room === "透析後胸部") continue;
      const targetCap = this.dynamicCapacity[room] !== undefined ? this.dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
      if (this.countCoverageForTag(room, helpTag) >= targetCap) continue;
      const currentMembers = split(this.dayCells[room] || "");
      const currentNames = currentMembers.map(extractStaffName);
      const sourceRooms = Array.from(new Set([
        ...(this.ctx.customRules.rescueRules || []).filter((r: any) => r.targetRoom === room).flatMap((r: any) => split(r.sourceRooms || "").map((x: string) => parseRoomCond(x).r)),
        ...split(this.ctx.customRules.supportTargetRoomsLowImpact || "3号室,パノラマCT").map((x: string) => parseRoomCond(x).r),
        ...split(this.ctx.customRules.supportTargetRooms || "2号室,3号室").map((x: string) => parseRoomCond(x).r),
        "1号室", "2号室", "3号室", "5号室", "パノラマCT", "検像", "骨塩"
      ].filter((r: string) => !!r && r !== room && ROOM_SECTIONS.includes(r))));
      const candidates: Array<{ name: string; source: string; entryTag: string; score: number; }> = [];
      this.initialAvailGeneral.forEach((name: string) => {
        if (currentNames.includes(name) || this.isForbidden(name, room) || this.isHardNoConsecutive(name, room) || this.isHalfDayBlocked(name, room).hard || this.hasNGPair(name, currentNames, false) || !this.canAddKenmu(name, room) || !this.canStaffCoverNeedTag(name, helpTag) || this.isTimeTagBlockedByFullDayRule(room, helpTag)) return;
        candidates.push({ name, source: "", entryTag: helpTag, score: -10000 + (this.assignCounts[name] || 0) * 100 + this.getPastRoomCount(name, room) * 10 });
      });
      sourceRooms.forEach((sourceRoom: string) => {
        split(this.dayCells[sourceRoom] || "").forEach((entry: string) => {
          const name = extractStaffName(entry);
          const tag = entry.substring(name.length);
          if (currentNames.includes(name) || candidates.some(c => c.name === name) || this.isForbidden(name, room) || this.isHardNoConsecutive(name, room) || this.isHalfDayBlocked(name, room).hard || this.hasNGPair(name, currentNames, false) || !this.canAddKenmu(name, room, true) || this.isTimeTagBlockedByFullDayRule(room, helpTag) || !tagsOverlap(tag, helpTag)) return;
          candidates.push({ name, source: sourceRoom, entryTag: helpTag, score: this.getRescueSourceScore(sourceRoom, room, name) + (this.assignCounts[name] || 0) * 100 + this.getPastRoomCount(name, room) * 10 });
        });
      });
      candidates.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name, 'ja'));
      const picked = candidates[0];
      if (!picked) {
         this.logError(`[時間補充失敗] ${room}への${helpTag}補充候補が見つかりません。`);
         continue;
      }
      this.dayCells[room] = join([...currentMembers, `${picked.name}${helpTag}`]);
      this.addUsage(picked.name, getStaffAmount(`${picked.name}${helpTag}`));
      this.updateBlockMapAfterKenmu(picked.name, `${picked.name}${helpTag}`);
      this.log(`🧩 [時間補充] ${room} に ${picked.name}${helpTag} を追加`);
      handled.add(core);
    }
  }
  canAddKenmu(st: string, tgt: string, bypass: boolean = false): boolean { const limit = this.ctx.customRules.alertMaxKenmu || 3; const cRooms = this.getTodayRoomCount(st); if (!split(this.dayCells[tgt] || "").map(extractStaffName).includes(st) && cRooms >= limit) return false; const exPairs = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.isExclusive); for (const p of exPairs) { const inS1 = split(this.dayCells[p.s1] || "").map(extractStaffName).includes(st); const inS2 = split(this.dayCells[p.s2] || "").map(extractStaffName).includes(st); if (inS1 || inS2) { if (tgt !== p.s1 && tgt !== p.s2) return false; } if (tgt === p.s1 || tgt === p.s2) { if (!bypass) { const curR = ROOM_SECTIONS.filter(r => split(this.dayCells[r] || "").map(extractStaffName).includes(st) && !["待機", "昼当番", "受付", "受付ヘルプ"].includes(r)); const hasOut = curR.some(r => r !== p.s1 && r !== p.s2); if (hasOut) return false; } } } return true; }
  isMmgCapable(st: string): boolean { return split(this.ctx.monthlyAssign.MMG || "").map(extractStaffName).includes(extractStaffName(st)); }
  getEffectiveTarget(room: string, baseCap: number) { const dayChar = this.day.label.match(/\((.*?)\)/)?.[1]; if (!dayChar) return { cap: baseCap, amClosed: false, pmClosed: false, allClosed: false }; const closed = (this.ctx.customRules.closedRooms || []).filter((r: any) => r.room === room && r.day === dayChar); let amClosed = false; let pmClosed = false; let allClosed = false; closed.forEach((r: any) => { if (r.time === "全日") allClosed = true; else if (r.time === "(AM)") amClosed = true; else if (r.time === "(PM)") pmClosed = true; }); if (amClosed && pmClosed) allClosed = true; if (allClosed) return { cap: 0, amClosed: true, pmClosed: true, allClosed: true }; if (amClosed || pmClosed) return { cap: baseCap / 2, amClosed, pmClosed, allClosed: false }; return { cap: baseCap, amClosed: false, pmClosed: false, allClosed: false }; }
  
  pick(availList: string[], list: string[], n: number, section?: string, currentAssigned: string[] = []): string[] { const result: string[] = []; const uniqueList = Array.from(new Set(list.filter(Boolean))); const filterFn = (name: string, checkSoftNg: boolean) => { if (!availList.includes(name) || this.isUsed(name) || (section && this.isForbidden(name, section))) return false; if (this.hasNGPair(name, [...currentAssigned, ...result].map(extractStaffName), checkSoftNg)) return false; if (section && !this.canAddKenmu(name, section)) return false; return true; }; for (const name of uniqueList.filter(nm => filterFn(nm, true))) { result.push(name); if (result.length >= n) return result; } for (const name of uniqueList.filter(nm => filterFn(nm, false))) { result.push(name); if (result.length >= n) return result; } return result; }

  initCounts() { this.ctx.allStaff.forEach(s => { this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.roomCounts[s] = {}; SECTIONS.forEach(sec => this.roomCounts[s][sec] = 0); this.counts[s] = 0; }); this.pastDaysInMonth.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (["CT", "MRI"].includes(sec)) { split(val as string).forEach(m => { const c = extractStaffName(m); if (this.roomCounts[c]) { this.roomCounts[c][sec]++; this.counts[c]++; } }); } }); }); this.pastDaysInWeek.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (!["CT", "MRI"].includes(sec)) { split(val as string).forEach(m => { const c = extractStaffName(m); if (this.roomCounts[c]) { this.roomCounts[c][sec]++; this.counts[c]++; } }); } }); }); }

  buildBlockMap() { this.timeTagMap.clear(); this.ctx.allStaff.forEach(s => this.blockMap.set(s, 'NONE')); ["明け","入り","土日休日代休"].forEach(sec => { split(this.dayCells[sec]).forEach(m => this.blockMap.set(extractStaffName(m), 'ALL')); }); split(this.dayCells["不在"]).forEach(m => { const core = extractStaffName(m); if (m.includes("(AM)")) this.blockMap.set(core, 'AM'); else if (m.includes("(PM)")) this.blockMap.set(core, 'PM'); else if (m.match(/\(〜\d/)) { this.blockMap.set(core, 'AM'); const t = m.match(/\(〜(\d+:\d+)\)/)?.[1]; if (t) this.timeTagMap.set(core, `(${t}〜)`); } else if (m.match(/\(\d.*〜\)/)) { this.blockMap.set(core, 'PM'); const t = m.match(/\((\d+:\d+)〜\)/)?.[1]; if (t) this.timeTagMap.set(core, `(〜${t})`); } else this.blockMap.set(core, 'ALL'); }); }
  applyDailyAdditions() { (this.ctx.customRules.dailyAdditions || []).forEach((rule: any) => { if (rule.date === this.day.id && rule.section && rule.count > 0 && rule.section !== "透析後胸部") { const placeholderName = rule.section + "枠" + (rule.time === "全日" || !rule.time ? "" : rule.time); let current = split(this.dayCells[rule.section]); if (!current.includes(placeholderName)) { for (let i = 0; i < rule.count; i++) current.push(placeholderName); this.dayCells[rule.section] = join(current); } } }); }
  evaluateEmergencies() { const tempAvailCount = this.ctx.activeGeneralStaff.filter(s => this.blockMap.get(s) !== 'ALL').length; (this.ctx.customRules.emergencies || []).forEach((em: any) => { if (tempAvailCount <= Number(em.threshold)) { if (em.type === "role_assign" && em.role && em.section) this.roleAssignments[em.role] = em; if (em.type === "staff_assign" && em.staff && em.section) this.staffAssignments.push({ staff: em.staff, section: em.section }); if (em.type === "clear" && em.section) { this.skipSections.push(em.section); this.clearSections.push(em.section); } if (em.type === "change_capacity" && em.section) this.dynamicCapacity[em.section] = Number(em.newCapacity); } }); }
  cleanUpDayCells() { Object.keys(this.dayCells).forEach(sec => { if (["明け","入り","不在","土日休日代休"].includes(sec)) return; if (this.skipSections.includes(sec)) { this.dayCells[sec] = ""; return; } let members = split(this.dayCells[sec]).map(m => { const core = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(core)) return m; const block = this.blockMap.get(core); const tt = this.timeTagMap.get(core); if (block === 'ALL') return null; if (tt && m.includes(tt)) return m; if (block === 'AM' && m.includes('(AM)')) return null; if (block === 'PM' && m.includes('(PM)')) return null; if (block === 'PM' && tt && m.includes('(AM)')) return `${core}${tt}`; if (block === 'AM' && !m.match(/\(.*\)/)) return `${core}${tt || '(PM)'}`; if (block === 'PM' && !m.match(/\(.*\)/)) return `${core}${tt || '(AM)'}`; return m; }).filter(Boolean) as string[]; this.dayCells[sec] = join(members); }); }
  prepareAvailability() { const supportStaffList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName); this.initialAvailAll = this.ctx.allStaff.filter(s => this.blockMap.get(s) !== 'ALL').sort((a, b) => { if ((this.counts[a] || 0) !== (this.counts[b] || 0)) return (this.counts[a] || 0) - (this.counts[b] || 0); return a.localeCompare(b, 'ja'); }); this.initialAvailSupport = this.initialAvailAll.filter(s => supportStaffList.includes(s)); this.initialAvailGeneral = this.initialAvailAll.filter(s => this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s)); this.initialAvailReception = this.initialAvailAll.filter(s => this.ctx.activeReceptionStaff.includes(s) || (this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s))); }

  execute(): DayData {
    this.logPhase("フェーズ1：前提処理"); this.initCounts();
    if (this.prevDay?.cells["入り"]) { const iriMems = split(this.prevDay.cells["入り"]).map(extractStaffName); this.dayCells["明け"] = join(Array.from(new Set([...split(this.dayCells["明け"]), ...iriMems]))); if (iriMems.length > 0) this.log(`[前日処理] 昨日の「入り」を「明け」に配置`); }
    if (this.day.isPublicHoliday) { this.log(`🎌 祝日のためスキップ`); return { ...this.day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])), logInfo: this.logInfo }; }
    const dayChar = this.day.label.match(/\((.*?)\)/)?.[1]; if (dayChar) { (this.ctx.customRules.closedRooms || []).forEach((r: any) => { if (r.day === dayChar) this.log(`🛑 曜日ルールで ${r.room} の ${r.time} 閉室`); }); }
    if (!this.isSmartFix) { ROOM_SECTIONS.forEach(sec => { this.dayCells[sec] = join(split(this.dayCells[sec]).filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); }); this.dayCells["昼当番"] = ""; this.dayCells["受付ヘルプ"] = ""; this.dayCells["待機"] = ""; }
    this.buildBlockMap();
    if (this.isSmartFix) { WORK_SECTIONS.forEach(sec => { let cur = split(this.dayCells[sec]); let nx = cur.filter(m => { const core = extractStaffName(m); const b = this.blockMap.get(core); if (ROLE_PLACEHOLDERS.includes(core)) return true; if (b === 'ALL') return false; const tt = this.timeTagMap.get(core); if (tt && m.includes(tt)) return true; if (b === 'AM' && (!m.includes('(') || m.includes('(AM)'))) return false; if (b === 'PM' && (!m.includes('(') || m.includes('(PM)'))) return false; if (b === 'PM' && tt && m.includes('(AM)')) return false; return true; }); if (cur.length !== nx.length) { this.dayCells[sec] = join(nx); } }); }
    this.applyDailyAdditions(); this.evaluateEmergencies(); this.cleanUpDayCells();
    WORK_SECTIONS.forEach(sec => { split(this.dayCells[sec]).forEach((m: string) => { const core = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(core) && this.blockMap.get(core) !== 'ALL') this.addUsage(core, getStaffAmount(m)); }); });
    this.prepareAvailability();
    
    if (this.isSmartFix) {
      const priority = this.ctx.customRules.priorityRooms || SECTIONS;
      priority.forEach((room: string) => {
         if (REST_SECTIONS.includes(room) || ["昼当番","受付ヘルプ","待機","透析後胸部"].includes(room)) return;
         if ((this.ctx.customRules.linkedRooms || []).some((r:any) => r.target === room)) return;
         const cap = this.dynamicCapacity[room] || 1; const eff = this.getEffectiveTarget(room, cap); if (eff.allClosed) return;
         let current = split(this.dayCells[room]); const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
         const isFixedToAny = (staffName: string) => (this.ctx.customRules.fixed || []).some((r:any) => extractStaffName(r.staff) === extractStaffName(staffName));
         let sortedAvail = [...this.initialAvailGeneral]; sortedAvail.sort((a, b) => { const sA = this.blockMap.get(a) === 'NONE' ? 0 : 100; const sB = this.blockMap.get(b) === 'NONE' ? 0 : 100; if (sA !== sB) return sA - sB; return this.getPastRoomCount(a, room) - this.getPastRoomCount(b, room); });
         while (getAmt(current) < eff.cap) {
            const freeStaff = sortedAvail.find((s: string) => { 
                if (this.assignCounts[s] >= 1) return false; if (this.assignCounts[s] === 0.5 && (!["CT", "MRI", "治療", "RI"].includes(room) || !isMonthlyMainStaff(room, s, this.ctx.monthlyAssign))) return false; 
                if (this.isForbidden(s, room) || (room === "MMG" && !this.isMmgCapable(s)) || !this.canAddKenmu(s, room) || this.isHardNoConsecutive(s, room) || isFixedToAny(s)) return false; 
                const b = this.blockMap.get(s); if ((eff.pmClosed && b === 'AM') || (eff.amClosed && b === 'PM') || this.isTimeTagBlockedByFullDayRule(room, b || "")) return false; return true; 
            });
            if (!freeStaff) break;
            const block = this.blockMap.get(freeStaff); let tag = ""; let p = 1; 
            if (block === 'AM') { tag = "(PM)"; p = 0.5; } else if (block === 'PM') { tag = "(AM)"; p = 0.5; } else if (eff.pmClosed) { tag = "(AM)"; p = 0.5; } else if (eff.amClosed) { tag = "(PM)"; p = 0.5; }
            current.push(`${freeStaff}${tag}`); this.addUsage(freeStaff, p); sortedAvail = sortedAvail.filter(s => s !== freeStaff); this.log(`✅ [配置決定] ${room} に ${freeStaff}${tag} を補充`);
         }
         this.dayCells[room] = join(current);
      });
      return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
    }
    
    this.logPhase("フェーズ2：例外処理");
    (this.ctx.customRules.fixed || []).forEach((r: any) => { if (!r.staff || !r.section) return; Object.keys(this.dayCells).forEach(sec => { if (sec === r.section || REST_SECTIONS.includes(sec)) return; const bef = split(this.dayCells[sec]); const aft = bef.filter(m => extractStaffName(m) !== extractStaffName(r.staff)); if (bef.length !== aft.length) { this.dayCells[sec] = join(aft); this.assignCounts[extractStaffName(r.staff)] = 0; this.blockMap.set(extractStaffName(r.staff), 'NONE'); } }); });
    (this.ctx.customRules.fixed || []).forEach((r: any) => { const core = extractStaffName(r.staff); if (!core || !r.section || !this.initialAvailAll.includes(core) || this.isUsed(core) || this.isForbidden(core, r.section) || r.section === "透析後胸部" || this.isHardNoConsecutive(core, r.section) || this.skipSections.includes(r.section)) return; const cur = split(this.dayCells[r.section]); if (cur.map(extractStaffName).includes(core) || this.hasNGPair(core, cur.map(extractStaffName), false)) return; let t = this.getAssignedWorkTag(core); if (this.isTimeTagBlockedByFullDayRule(r.section, t)) return; this.blockMap.set(core, 'ALL'); this.dayCells[r.section] = join([...cur, `${core}${t}`]); this.addUsage(core, t?0.5:1); this.log(`🔒 [専従] ${core} を ${r.section} に固定配置`); });
    this.staffAssignments.forEach((r: any) => { const core = extractStaffName(r.staff); if (!core || !r.section || !this.initialAvailAll.includes(core) || this.isUsed(core) || this.isForbidden(core, r.section) || r.section === "透析後胸部" || this.isHardNoConsecutive(core, r.section) || this.skipSections.includes(r.section)) return; const cur = split(this.dayCells[r.section]); if (cur.map(extractStaffName).includes(core) || this.hasNGPair(core, cur.map(extractStaffName), false)) return; let t = this.getAssignedWorkTag(core); if (this.isTimeTagBlockedByFullDayRule(r.section, t)) return; this.blockMap.set(core, 'ALL'); this.dayCells[r.section] = join([...cur, `${core}${t}`]); this.addUsage(core, t?0.5:1); this.log(`🚨 [緊急強制] ${core} を ${r.section} に配置`); });
    Object.values(this.roleAssignments).forEach((ra: any) => { if (this.skipSections.includes(ra.section) || ra.section === "透析後胸部") return; const cand = split(this.ctx.monthlyAssign[ra.role] || "").map(extractStaffName); const tAvail = ["受付"].includes(ra.role) ? this.initialAvailReception : this.initialAvailGeneral; const st = cand.find(s => tAvail.includes(s) && !this.isUsed(s) && !this.isForbidden(s, ra.section)); if (st && !split(this.dayCells[ra.section]).map(extractStaffName).includes(st)) { let t = this.getAssignedWorkTag(st); if (this.isTimeTagBlockedByFullDayRule(ra.section, t)) return; this.blockMap.set(st, 'ALL'); this.dayCells[ra.section] = join([...split(this.dayCells[ra.section]), `${st}${t}`]); this.addUsage(st, t?0.5:1); this.log(`📌 [緊急役割] ${st} を ${ra.section} に配置`); } });
    (this.ctx.customRules.substitutes || []).forEach((sub: any) => { const tgts = split(sub.target).map(extractStaffName); if (tgts.length === 0 || !sub.section || this.skipSections.includes(sub.section) || sub.section === "透析後胸部" || tgts.some(t => split(this.dayCells[sub.section]).map(extractStaffName).includes(t)) || !tgts.every(t => !this.initialAvailAll.includes(t))) return; const fs = split(sub.subs).map(extractStaffName).filter(s => this.initialAvailGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, sub.section)); if (fs.length > 0) { const cMems = split(this.dayCells[sub.section]); for (const f of fs) { if (this.isHalfDayBlocked(f, sub.section).hard || this.hasNGPair(f, cMems.map(extractStaffName), false) || !this.canAddKenmu(f, sub.section)) continue; let t = this.getAssignedWorkTag(f); if (this.isTimeTagBlockedByFullDayRule(sub.section, t)) continue; this.blockMap.set(f, 'ALL'); this.dayCells[sub.section] = join([...cMems, `${f}${t}`]); this.addUsage(f, t?0.5:1); this.log(`🔄 [代打] ${f} を ${sub.section} に配置`); break; } } });
    (this.ctx.customRules.pushOuts || []).forEach((po: any) => { const s1 = extractStaffName(po.s1 || po.triggerStaff); const s2 = extractStaffName(po.s2 || po.targetStaff); const tSec = po.triggerSection; if (!s1 || !s2 || !tSec || !po.targetSections || !this.initialAvailGeneral.includes(s1) || !this.initialAvailGeneral.includes(s2)) return; const cTSec = split(this.dayCells[tSec]).map(extractStaffName); if (cTSec.includes(s1) && cTSec.includes(s2)) { for (const room of split(po.targetSections).filter(s => !this.skipSections.includes(s) && s !== "透析後胸部")) { if (this.isForbidden(s2, room) || this.isHalfDayBlocked(s2, room).hard || this.hasNGPair(s2, split(this.dayCells[room]).map(extractStaffName), false) || !this.canAddKenmu(s2, room)) continue; const aCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1); const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0); if (getAmt(split(this.dayCells[room])) < aCap) { this.dayCells[tSec] = join(split(this.dayCells[tSec]).filter(m => extractStaffName(m) !== s2)); let t = this.getAssignedWorkTag(s2); if (this.isTimeTagBlockedByFullDayRule(room, t)) continue; this.dayCells[room] = join([...split(this.dayCells[room]), `${s2}${t}`]); this.addUsage(s2, t === "(AM)" || t === "(PM)" ? 0.5 : 1); this.blockMap.set(s2, t === "" ? 'ALL' : (t === "(AM)" ? 'PM' : 'AM')); this.log(`🎱 [玉突き] ${s1} と被ったため ${s2} を ${room} に移動`); break; } } } });

    this.logPhase("フェーズ3：メイン配置");
    const PRIORITY_LIST = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
    const linkedTargetRooms = (this.ctx.customRules.linkedRooms || []).map((r: any) => r.target);
    
    // ★ Ver 3.00: 部屋の「難易度（入れる候補者の少なさ）」を計算し、厳しい部屋から順に処理する
    const targetRooms = PRIORITY_LIST.filter((room: string) => !this.skipSections.includes(room) && !["受付ヘルプ", "昼当番", "待機", "透析後胸部"].includes(room) && !linkedTargetRooms.includes(room));
    const roomDifficulties = targetRooms.map(room => {
      if (room === "受付") return { room, score: 99999, targetCount: this.dynamicCapacity.受付 !== undefined ? this.dynamicCapacity.受付 : 2 };
      
      let targetCount = this.dynamicCapacity[room] !== undefined ? this.dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
      const eff = this.getEffectiveTarget(room, targetCount);
      if (eff.allClosed) return { room, score: -9999, targetCount };
      
      let pList: string[] = [];
      if (["治療", "RI", "CT", "MRI", "MMG"].includes(room)) pList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign).filter((s: string) => this.initialAvailGeneral.includes(s)); 
      else if (this.ctx.monthlyAssign[room]) pList = split(this.ctx.monthlyAssign[room]).map(extractStaffName).filter((s: string) => this.initialAvailGeneral.includes(s));
      let cand = (["治療", "RI", "MMG"].includes(room)) ? (pList.length > 0 ? pList : this.initialAvailGeneral) : this.initialAvailGeneral;

      let availableCount = cand.filter(name => {
        if (this.isUsed(name) || this.isForbidden(name, room) || (room === "MMG" && !this.isMmgCapable(name)) || !this.canAddKenmu(name, room)) return false;
        const b = this.blockMap.get(name);
        if (b === 'ALL' || (eff.pmClosed && b === 'AM') || (eff.amClosed && b === 'PM')) return false;
        if (this.isTimeTagBlockedByFullDayRule(room, this.getAssignedWorkTag(name))) return false;
        return true;
      }).length;
      
      const baseIndex = PRIORITY_LIST.indexOf(room);
      const score = (100 - availableCount) * 1000 - baseIndex;
      return { room, score, targetCount };
    });

    roomDifficulties.sort((a, b) => b.score - a.score);
    this.log(`📈 動的配置順: ${roomDifficulties.filter(r => r.score > -9000).map(r => r.room).join(" → ")}`);

    roomDifficulties.forEach(({ room, targetCount }) => {
      if (this.skipSections.includes(room)) return;
      let cMems = split(this.dayCells[room]); const ph = cMems.filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)));
      const phTags: string[] = []; if (ph.length > 0) { ph.forEach(p => { const core = extractStaffName(p); const tag = p.substring(core.length); if (tag) phTags.push(tag); }); targetCount += ph.length; this.dayCells[room] = join(cMems.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); }
      
      if (room === "受付") {
        let cUke = split(this.dayCells["受付"]); const ukeMo = split(this.ctx.monthlyAssign.受付 || "").map(extractStaffName);
        for (const n of ukeMo) { if (this.initialAvailAll.includes(n) && !this.isUsed(n) && !cUke.map(extractStaffName).includes(n)) { const b = this.blockMap.get(n); if (b === 'ALL') continue; let t = this.getAssignedWorkTag(n); cUke.push(`${n}${t}`); this.addUsage(n, t?0.5:1); this.blockMap.set(n, 'ALL'); } }
        const cUkeAmt = cUke.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0); let needUke = targetCount - cUkeAmt;
        if (needUke > 0 && !linkedTargetRooms.includes(room)) { const pUke = this.pick(this.initialAvailReception, this.initialAvailReception, Math.ceil(needUke), "受付", cUke); pUke.forEach((n: string) => { let t = this.getAssignedWorkTag(n); cUke.push(`${n}${t}`); this.addUsage(n, t?0.5:1); this.blockMap.set(n, 'ALL'); }); }
        this.dayCells["受付"] = join(cUke);
      } else {
        let pList: string[] = [];
        if (["治療", "RI", "CT", "MRI", "MMG"].includes(room)) pList = getMonthlyStaffForSection(room, this.ctx.monthlyAssign).filter((s: string) => this.initialAvailGeneral.includes(s)); 
        else if (this.ctx.monthlyAssign[room]) pList = split(this.ctx.monthlyAssign[room]).map(extractStaffName).filter((s: string) => this.initialAvailGeneral.includes(s));
        let cand = (["治療", "RI", "MMG"].includes(room)) ? (pList.length > 0 ? pList : this.initialAvailGeneral) : this.initialAvailGeneral;
        const pRooms = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.s1 === room || p.s2 === room).map((p: any) => p.s1 === room ? p.s2 : p.s1);
        const hasPF = pRooms.some(pr => split(this.dayCells[pr]).reduce((sum, m) => sum + getStaffAmount(m), 0) > 0);
        if (!((this.ctx.customRules.linkedRooms || []).some((r: any) => r.target === room)) && !hasPF) { this.fill(cand, room, pList, targetCount, phTags.length > 0 ? phTags[phTags.length - 1] : ""); }
      }
    });

    this.processAbsenceHelpAssignments();
    this.processPostTasks();
    this.prepareAvailability();
    this.processAbsenceHelpAssignments();
    this.enforceSupportAssignments();
    return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
  }

  private enforceSupportAssignments() {
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName);
    const targetRooms = split(this.ctx.customRules.supportTargetRooms || "");
    const orderedRooms = [
      ...targetRooms.filter(r => split(this.dayCells[r] || "").length > 0),
      ...targetRooms.filter(r => split(this.dayCells[r] || "").length === 0),
    ];
    supportStaffList.forEach(staff => {
      if (!this.ctx.activeGeneralStaff.includes(staff)) return;
      if (this.isUsed(staff) || this.blockMap.get(staff) === 'ALL') return;
      const alreadyAssigned = ROOM_SECTIONS.some(r => split(this.dayCells[r] || "").some(m => extractStaffName(m) === staff));
      if (alreadyAssigned) return;
      const membersWithTags = ROOM_SECTIONS.flatMap(r => split(this.dayCells[r] || ""));
      const currentTag = membersWithTags.find(m => extractStaffName(m) === staff)?.substring(staff.length) || this.getAssignedWorkTag(staff);
      for (const room of orderedRooms) {
        if (!room || this.skipSections.includes(room) || room === "透析後胸部") continue;
        if (this.isForbidden(staff, room) || this.isHardNoConsecutive(staff, room)) continue;
        const currentMembers = split(this.dayCells[room] || "");
        if (this.hasNGPair(staff, currentMembers.map(extractStaffName), false)) continue;
        if (!this.canAddKenmu(staff, room)) continue;
        if (this.isTimeTagBlockedByFullDayRule(room, currentTag)) continue;
        this.dayCells[room] = join([...currentMembers, `${staff}${currentTag}`]);
        this.addUsage(staff, currentTag ? 0.5 : 1);
        this.blockMap.set(staff, 'ALL');
        this.timeTagMap.delete(staff);
        this.log(`🧑‍🤝‍🧑 [サポート固定] ${staff} を ${room} に配置`);
        break;
      }
    });
  }

  fill(availList: string[], section: string, preferredList: string[], targetCount: number, forcedNeedTag: string = "") {
    if (this.skipSections.includes(section) || section === "透析後胸部") return; const eff = this.getEffectiveTarget(section, targetCount); if (eff.allClosed) return;
    let current = split(this.dayCells[section]); const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + getStaffAmount(m), 0); let prevAmount = -1;
    while (getCurrentAmount(current) < eff.cap) {
      const currentAmount = getCurrentAmount(current); if (currentAmount === prevAmount) break; prevAmount = currentAmount;
      const remaining = eff.cap - currentAmount; let curAm = eff.amClosed ? 999 : 0; let curPm = eff.pmClosed ? 999 : 0; let placeholderTag = ""; current.forEach(x => { const xc = extractStaffName(x); if (ROLE_PLACEHOLDERS.includes(xc)) {   const xt = x.substring(xc.length);   if (xt) placeholderTag = xt;   return; } if (entryCoversShift(x, 'AM')) curAm++; if (entryCoversShift(x, 'PM')) curPm++; });
      let needTag = forcedNeedTag || placeholderTag || ""; if (!needTag && remaining <= 1) {
        const complementTag = current.map(x => x.substring(extractStaffName(x).length)).find(tag => /^\((\d{1,2}:\d{2})〜\)$/.test(tag) || /^\(〜(\d{1,2}:\d{2})\)$/.test(tag));
        if (complementTag) {
          const m = complementTag.match(/^\((\d{1,2}:\d{2})〜\)$/);
          const n = complementTag.match(/^\(〜(\d{1,2}:\d{2})\)$/);
          if (m) needTag = `(〜${m[1]})`;
          else if (n) needTag = `(${n[1]}〜)`;
        }
      }
      if (!needTag) { if (curAm >= targetCount && curPm < targetCount) needTag = "(PM)"; else if (curPm >= targetCount && curAm < targetCount) needTag = "(AM)"; else if (remaining === 0.5) { if (curAm > curPm) needTag = "(PM)"; else if (curPm > curAm) needTag = "(AM)"; } }
      
      const getFilterReason = (name: string): RejectReason | null => { 
        if (current.map(extractStaffName).includes(name)) return { hard: true, msg: "同室配置済" }; 
        if (this.isUsed(name)) return { hard: true, msg: "他業務配置済" }; 
        if (this.isForbidden(name, section)) return { hard: true, msg: "担当不可" }; 
        if (section === "MMG" && !this.isMmgCapable(name)) return { hard: true, msg: "MMG外" }; 
        if (!this.canAddKenmu(name, section)) return { hard: true, msg: "兼務上限" }; 
        const b = this.blockMap.get(name); 
        if (b === 'ALL') return { hard: true, msg: "全日ブ" }; 
        if (needTag && !this.canStaffCoverNeedTag(name, needTag)) return { hard: true, msg: "時間不一致" }; 
        if (needTag && b === 'NONE' && ["CT", "MRI", "治療", "RI"].includes(section)) { 
          if (!eff.pmClosed && !eff.amClosed && !isMonthlyMainStaff(section, name, this.ctx.monthlyAssign)) return { hard: true, msg: "半端枠" }; 
        } 
        if (eff.pmClosed && b === 'AM') return { hard: true, msg: "午後休" }; 
        if (eff.amClosed && b === 'PM') return { hard: true, msg: "午前休" }; 
        if (this.isTimeTagBlockedByFullDayRule(section, needTag || this.getAssignedWorkTag(name) || "")) return { hard: true, msg: "終日専任" }; 
        if (this.isHalfDayBlocked(name, section).hard) return { hard: true, msg: "終日専任" }; 
        
        if (this.isHardNoConsecutive(name, section)) return { hard: false, msg: "連日注意" }; 
        if (this.hasNGPair(name, current.map(extractStaffName), false)) return { hard: true, msg: "絶対NG" }; 
        if (this.hasNGPair(name, current.map(extractStaffName), true)) return { hard: false, msg: "なるべくNG" }; 
        return null; 
      };

      const cWR = availList.map(n => ({ n, r: getFilterReason(n) })); 
      let vN = cWR.filter(c => !c.r).map(c => c.n); 
      let fM = ""; 
      
      if (!vN.length) { 
        const sC = cWR.filter(c => c.r && !c.r.hard); 
        if (sC.length > 0) { 
          vN = sC.map(c => c.n); 
          fM = `（⚠️ 妥協配置：${sC.map(c => `${c.n}(${c.r?.msg})`).join(', ')}）`; 
        } else {
          const failReasons = cWR.slice(0, 5).map(c => `${c.n}(${c.r?.msg})`).join(", ");
          this.logError(`[配置失敗] ${section} に入れる候補者がいません。除外理由例: ${failReasons} ...`);
          break; 
        }
      }
      
      const vP = vN.filter(n => preferredList.includes(n)); const vA = vN.filter(n => !preferredList.includes(n));
      const sCnd = (cs: string[]) => { let ms = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName), sps = split(this.ctx.monthlyAssign[section + "サブ優先"] || "").map(extractStaffName), ss = split(this.ctx.monthlyAssign[section + "サブ"] || "").map(extractStaffName); if (section === "治療" || section === "RI") { ms = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName); if (section === "治療") { sps = split(this.ctx.monthlyAssign.治療サブ優先 || "").map(extractStaffName); ss = split(this.ctx.monthlyAssign.治療サブ || "").map(extractStaffName); } else { ss = split(this.ctx.monthlyAssign.RIサブ || "").map(extractStaffName); } } const hA = vN.some(s => this.blockMap.get(s) === 'PM'); const hP = vN.some(s => this.blockMap.get(s) === 'AM'); return [...cs].sort((a, b) => { const bA = this.blockMap.get(a), bB = this.blockMap.get(b); let sA = 0, sB = 0; if (ms.includes(a)) sA += 10000; else if (sps.includes(a)) sA += 5000; else if (ss.includes(a)) sA += 2000; if (ms.includes(b)) sB += 10000; else if (sps.includes(b)) sB += 5000; else if (ss.includes(b)) sB += 2000; if (this.isHalfDayBlocked(a, section).monthlyHalfException) sA -= 3000; if (this.isHalfDayBlocked(b, section).monthlyHalfException) sB -= 3000; const rw = ["MRI", "CT"].includes(section) ? 200 : 100; sA -= (this.roomCounts[a]?.[section] || 0) * rw; sB -= (this.roomCounts[b]?.[section] || 0) * rw; if (this.isHardNoConsecutive(a, section)) sA -= 500; if (this.isHardNoConsecutive(b, section)) sB -= 500; if (section === "ポータブル") { sA -= 1000 * this.getPastRoomCount(a, section); sB -= 1000 * this.getPastRoomCount(b, section); } if (needTag === "") { if (bA === 'NONE') sA += 200; else if (hA && hP && (bA === 'AM' || bA === 'PM')) sA += 100; } else { if (needTag === "(AM)" && bA === 'PM') sA += 200; if (needTag === "(PM)" && bA === 'AM') sA += 200; if (bA === 'NONE') sA += 100; } if (needTag === "") { if (bB === 'NONE') sB += 200; else if (hA && hP && (bB === 'AM' || bB === 'PM')) sB += 100; } else { if (needTag === "(AM)" && bB === 'PM') sB += 200; if (needTag === "(PM)" && bB === 'AM') sB += 200; if (bB === 'NONE') sB += 100; } return sB - sA || (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0) || a.localeCompare(b, 'ja'); }); };
      const pC = this.pick(vN, [...sCnd(vP), ...sCnd(vA)], 1, section, current.map(extractStaffName)); if (!pC.length) break;
      const c = pC[0], b = this.blockMap.get(c); let t = "", f = 1; if (b === 'AM' || b === 'PM') { t = this.getAssignedWorkTag(c); f = getStaffAmount(`${c}${t}`); this.blockMap.set(c, 'ALL'); this.timeTagMap.delete(c); } else { if (needTag) { t = needTag; f = getStaffAmount(`${c}${t}`); this.setRemainingAvailabilityAfterAssign(c, t); } else if (eff.pmClosed) { t = "(AM)"; f = 0.5; this.blockMap.set(c, 'AM'); this.timeTagMap.delete(c); } else if (eff.amClosed) { t = "(PM)"; f = 0.5; this.blockMap.set(c, 'PM'); this.timeTagMap.delete(c); } else { t = ""; f = 1; this.blockMap.set(c, 'ALL'); this.timeTagMap.delete(c); } }
      current.push(`${c}${t}`); this.addUsage(c, f); 
      
      if (fM) {
        this.logWarn(`[妥協配置決定] ${section} に ${c}${t} を配置 ${fM}`);
      } else {
        this.log(`✅ [配置決定] ${section} に ${c}${t}`);
      }
    }
    this.dayCells[section] = join(current);
  }

  processPostTasks() {
    const sSL = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName); const lowPriorityStaff = split(this.ctx.customRules.lateShiftLowPriorityStaff || "").map(extractStaffName);
    this.initialAvailSupport.forEach(staff => { if (this.isUsed(staff)) return; let asg = false; for (const rm of split(this.ctx.customRules.supportTargetRooms)) { if (this.skipSections.includes(rm) || this.isForbidden(staff, rm) || rm === "透析後胸部") continue; let c = split(this.dayCells[rm]); if (c.length > 0 && !c.map(extractStaffName).includes(staff) && !this.hasNGPair(staff, c.map(extractStaffName), false) && !this.isHardNoConsecutive(staff, rm)) { let t = this.getAssignedWorkTag(staff); if (this.isTimeTagBlockedByFullDayRule(rm, t)) continue; this.dayCells[rm] = join([...c, `${staff}${t}`]); this.addUsage(staff, t ? 0.5 : 1); this.blockMap.set(staff, 'ALL'); asg = true; break; } } if (!asg) { for (const rm of split(this.ctx.customRules.supportTargetRooms)) { if (this.skipSections.includes(rm) || this.isForbidden(staff, rm) || rm === "透析後胸部") continue; if (!split(this.dayCells[rm]).length && !this.isHardNoConsecutive(staff, rm) && this.canAddKenmu(staff, rm)) { let t = this.getAssignedWorkTag(staff); if (this.isTimeTagBlockedByFullDayRule(rm, t)) continue; this.dayCells[rm] = `${staff}${t}`; this.addUsage(staff, t ? 0.5 : 1); this.blockMap.set(staff, 'ALL'); break; } } } });
    
    (this.ctx.customRules.swapRules || []).forEach((r: any) => {
      if (!r.targetRoom || !r.triggerRoom || !r.sourceRooms || r.targetRoom === "透析後胸部" || r.triggerRoom === "透析後胸部") return;
      const tC = this.dynamicCapacity[r.targetRoom] ?? (["CT", "MRI", "治療"].includes(r.targetRoom) ? 3 : 1); if (split(this.dayCells[r.targetRoom]).reduce((s, m) => s + getStaffAmount(m), 0) >= tC) return;
      const tM = split(this.dayCells[r.triggerRoom]); if (!tM.length) return;
      if (!tM.some(m => { const c = extractStaffName(m); return !ROLE_PLACEHOLDERS.includes(c) && !this.isForbidden(c, r.targetRoom) && !this.isHardNoConsecutive(c, r.targetRoom) && !this.isHalfDayBlocked(c, r.targetRoom).hard && this.canAddKenmu(c, r.targetRoom, true); })) {
        let sw = false;
        for (const sSR of split(r.sourceRooms).sort((a, b) => this.getRescueSourceScore(parseRoomCond(a).r, r.targetRoom) - this.getRescueSourceScore(parseRoomCond(b).r, r.targetRoom))) {
          const { r: sR } = parseRoomCond(sSR); if (sR === r.triggerRoom || sR === "透析後胸部") continue; const sM = split(this.dayCells[sR]);
          let sC = sM.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)) && !this.isForbidden(extractStaffName(m), r.targetRoom) && !this.isHalfDayBlocked(extractStaffName(m), r.targetRoom).hard && !this.isHardNoConsecutive(extractStaffName(m), r.targetRoom) && this.canAddKenmu(extractStaffName(m), r.targetRoom, true) && !this.isForbidden(extractStaffName(m), r.triggerRoom) && !this.isTimeTagBlockedByFullDayRule(r.targetRoom, m));
          sC.sort((a, b) => this.getTodayRoomCount(extractStaffName(a)) - this.getTodayRoomCount(extractStaffName(b)) || this.getPastRoomCount(extractStaffName(a), r.targetRoom) - this.getPastRoomCount(extractStaffName(b), r.targetRoom));
          for (const sm of sC) { const sCo = extractStaffName(sm); const tTK = tM.find(m => !this.isForbidden(extractStaffName(m), sR) && !this.isHalfDayBlocked(extractStaffName(m), sR).hard && !this.hasNGPair(extractStaffName(m), sM.map(extractStaffName), false) && this.canAddKenmu(extractStaffName(m), sR, true)); if (tTK && this.canAddKenmu(sCo, r.targetRoom, true)) { this.dayCells[r.triggerRoom] = join(tM.map(m => m === tTK ? m.replace(extractStaffName(tTK), sCo) : m)); this.dayCells[sR] = join(sM.map(m => m === sm ? m.replace(sCo, extractStaffName(tTK)) : m)); this.log(`🔄 [玉突き] ${r.triggerRoom}の${extractStaffName(tTK)}と ${sR}の${sCo}を交換`); sw = true; break; } } if (sw) break;
        }
      }
    });

    let uG1 = this.initialAvailGeneral.filter(s => !this.isUsed(s) && this.blockMap.get(s) !== 'ALL');
    (this.ctx.customRules.linkedRooms || []).forEach((r: any) => {
      if (!r.target || this.skipSections.includes(r.target) || r.target === "透析後胸部") return; const tC = this.dynamicCapacity[r.target] ?? (["CT", "MRI", "治療"].includes(r.target) ? 3 : 1); const e = this.getEffectiveTarget(r.target, tC); if (e.allClosed) return;
      let cM = split(this.dayCells[r.target]); let cA = 0, cP = 0; cM.forEach(x => { if (entryCoversShift(x, 'AM')) cA++; if (entryCoversShift(x, 'PM')) cP++; });
      if (cM.length > 0 && cM.every(m => sSL.includes(extractStaffName(m)))) { cA = 0; cP = 0; } uG1.sort((a, b) => this.getTodayRoomCount(a) - this.getTodayRoomCount(b) || this.getPastRoomCount(a, r.target) - this.getPastRoomCount(b, r.target));
      while ((cA < tC || cP < tC) && uG1.length > 0) { const ci = uG1.findIndex(s => !this.isForbidden(s, r.target) && !this.isHalfDayBlocked(s, r.target).hard && !this.hasNGPair(s, cM.map(extractStaffName), false) && !this.isHardNoConsecutive(s, r.target) && !(r.target === "MMG" && !this.isMmgCapable(s)) && this.canAddKenmu(s, r.target) && !(cP >= tC && this.blockMap.get(s) === 'AM') && !(cA >= tC && this.blockMap.get(s) === 'PM') && !this.isTimeTagBlockedByFullDayRule(r.target, this.blockMap.get(s) || "")); if (ci === -1) break; const st = uG1[ci]; uG1.splice(ci, 1); const b = this.blockMap.get(st); let t = b === 'AM' ? "(PM)" : b === 'PM' ? "(AM)" : ""; if (!t) { if (cA >= tC) t = "(PM)"; else if (cP >= tC) t = "(AM)"; } this.blockMap.set(st, t === "" ? 'ALL' : t === "(AM)" ? 'PM' : 'AM'); cM.push(`${st}${t}`); if (entryCoversShift(`${st}${t}`, 'AM')) cA++; if (entryCoversShift(`${st}${t}`, 'PM')) cP++; this.addUsage(st, t ? 0.5 : 1); this.log(`🙌 [負担軽減] 余剰の ${st} を ${r.target} に専任配置`); } this.dayCells[r.target] = join(cM);
    });

    (this.ctx.customRules.smartKenmu || []).forEach((r: any) => {
      if (!r.targetRoom || this.skipSections.includes(r.targetRoom) || r.targetRoom === "透析後胸部") return; const tM = split(this.dayCells[r.targetRoom]); if (!tM.length) return;
      for (const tm of tM) { const tc = extractStaffName(tm); if (ROLE_PLACEHOLDERS.includes(tc) || ROOM_SECTIONS.some(rm => rm !== r.targetRoom && split(this.dayCells[rm]).map(extractStaffName).includes(tc))) continue; 
        let sC: string | null = null, fSR: string | null = null;
        for (const sSR of split(r.sourceRooms)) { const { r: sR, min } = parseRoomCond(sSR); const sMs = split(this.dayCells[sR]); if (sR === "透析後胸部" || (min > 0 && sMs.reduce((s, m) => s + getStaffAmount(m), 0) < min) || this.isForbidden(tc, sR) || this.isHalfDayBlocked(tc, sR).hard || !this.canAddKenmu(tc, sR, true)) continue;
          let cnds = sMs.filter(m => { const c = extractStaffName(m); return c !== tc && !ROLE_PLACEHOLDERS.includes(c) && !this.isForbidden(c, r.targetRoom) && !this.hasNGPair(c, tM.map(extractStaffName), false) && !this.isHardNoConsecutive(c, r.targetRoom) && (r.targetRoom === "MMG" ? this.isMmgCapable(c) : true) && this.canAddKenmu(c, r.targetRoom) && !this.isTimeTagBlockedByFullDayRule(r.targetRoom, m); });
          cnds.sort((a, b) => this.getTodayRoomCount(extractStaffName(a)) - this.getTodayRoomCount(extractStaffName(b)) || this.getPastRoomCount(extractStaffName(a), r.targetRoom) - this.getPastRoomCount(extractStaffName(b), r.targetRoom));
          if (cnds.length > 0) { sC = cnds[0]; fSR = sR; break; }
        }
        if (sC && fSR) { const cc = extractStaffName(sC); const tmTag = tm.substring(tc.length); this.dayCells[fSR] = join([...split(this.dayCells[fSR]).filter(m => m !== sC), `${tc}${tmTag}`]); this.dayCells[r.targetRoom] = join(tM.map(m => m === tm ? sC : m) as string[]); this.addUsage(cc, getStaffAmount(sC as string)); this.setRemainingAvailabilityAfterAssign(tc, tmTag); break; }
      }
    });

    const processKenmu = (sm: string[], tm: string[], tr: string) => { if (tr === "透析後胸部") return tm; const tC = this.dynamicCapacity[tr] || 1; const tcs = tm.map(extractStaffName); let cA = tm.reduce((s, m) => s + getStaffAmount(m), 0); for (const m of sm) { if (cA >= tC) break; const c = extractStaffName(m); if (tcs.includes(c) || m.includes("17:") || m.includes("19:") || this.isForbidden(c, tr) || this.isHardNoConsecutive(c, tr) || this.isHalfDayBlocked(c, tr).hard || this.hasNGPair(c, tcs, false) || !this.canAddKenmu(c, tr) || this.isTimeTagBlockedByFullDayRule(tr, m)) continue; let pS = m, cam = 0, cpm = 0; tm.forEach(x => { if (entryCoversShift(x, 'AM')) cam++; if (entryCoversShift(x, 'PM')) cpm++; }); if (cam < tC && cpm >= tC) { const trimmed = trimEntryToNeed(m, 'AM'); if (!trimmed) continue; pS = trimmed; } else if (cam >= tC && cpm < tC) { const trimmed = trimEntryToNeed(m, 'PM'); if (!trimmed) continue; pS = trimmed; } tm.push(pS); tcs.push(c); const a = getStaffAmount(pS); cA += a; this.addUsage(c, a); this.updateBlockMapAfterKenmu(c, pS); } return tm; };
    (this.ctx.customRules.kenmuPairs || []).forEach((p: any) => { if (!p.s1 || !p.s2 || p.s1 === "透析後胸部" || p.s2 === "透析後胸部") return; let m1 = split(this.dayCells[p.s1]), m2 = split(this.dayCells[p.s2]); this.dayCells[p.s2] = join(processKenmu(m1, m2, p.s2)); m2 = split(this.dayCells[p.s2]); this.dayCells[p.s1] = join(processKenmu(m2, m1, p.s1)); });

    (this.ctx.customRules.linkedRooms || []).forEach((r: any) => {
      if (!r.target || this.skipSections.includes(r.target) || r.target === "透析後胸部") return; const tC = this.dynamicCapacity[r.target] ?? (["CT", "MRI", "治療"].includes(r.target) ? 3 : 1); const e = this.getEffectiveTarget(r.target, tC); if (e.allClosed) return;
      let cM = split(this.dayCells[r.target]); let cA = 0, cP = 0; cM.forEach(x => { if (entryCoversShift(x, 'AM')) cA++; if (entryCoversShift(x, 'PM')) cP++; });
      for (const sSR of split(r.sources)) { if (cA >= tC && cP >= tC) break; const { r: sR, min } = parseRoomCond(sSR); if (sR === "透析後胸部" || (min > 0 && split(this.dayCells[sR]).reduce((s, m) => s + getStaffAmount(m), 0) < min)) continue;
        split(this.dayCells[sR]).forEach(m => { if (cA >= tC && cP >= tC) return; const c = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(c) && !cM.map(extractStaffName).includes(c) && !this.isForbidden(c, r.target) && !this.isHalfDayBlocked(c, r.target).hard && !this.hasNGPair(c, cM.map(extractStaffName), false) && !this.isHardNoConsecutive(c, r.target) && (r.target === "MMG" ? this.isMmgCapable(c) : true) && this.canAddKenmu(c, r.target, true) && !m.includes("17:") && !m.includes("19:") && !this.isTimeTagBlockedByFullDayRule(r.target, m)) { let pS = m; if (r.target === "パノラマCT" && sR === "透視（6号）") { const trimmed = trimEntryToNeed(m, 'AM'); if (!trimmed) return; pS = trimmed; } else { if (cA < tC && cP >= tC) { const trimmed = trimEntryToNeed(m, 'AM'); if (!trimmed) return; pS = trimmed; } else if (cA >= tC && cP < tC) { const trimmed = trimEntryToNeed(m, 'PM'); if (!trimmed) return; pS = trimmed; } else if (e.pmClosed) { const trimmed = trimEntryToNeed(m, 'AM'); if (!trimmed) return; pS = trimmed; } else if (e.amClosed) { const trimmed = trimEntryToNeed(m, 'PM'); if (!trimmed) return; pS = trimmed; } } cM.push(pS); if (entryCoversShift(pS, 'AM')) cA++; if (entryCoversShift(pS, 'PM')) cP++; this.addUsage(c, getStaffAmount(pS)); this.updateBlockMapAfterKenmu(c, pS); this.log(`🔗 [基本兼務] ${sR} の ${pS} を ${r.target} にセット配置しました`); } });
      } this.dayCells[r.target] = join(cM);
    });

    ROOM_SECTIONS.forEach(tR => {
      if (this.clearSections.includes(tR) || ["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(tR)) return; const tC = this.dynamicCapacity[tR] ?? (["CT", "MRI", "治療"].includes(tR) ? 3 : 1); const e = this.getEffectiveTarget(tR, tC); if (e.allClosed) return;
      let cM = split(this.dayCells[tR]); let cA = e.amClosed ? 999 : 0, cP = e.pmClosed ? 999 : 0; cM.forEach(x => { if (entryCoversShift(x, 'AM')) cA++; if (entryCoversShift(x, 'PM')) cP++; }); if (cM.length > 0 && cM.every(m => sSL.includes(extractStaffName(m)))) { cA = e.amClosed ? 999 : 0; cP = e.pmClosed ? 999 : 0; } if (cA >= tC && cP >= tC) return;
      const mR = (this.ctx.customRules.rescueRules || []).filter((r: any) => r.targetRoom === tR); let sRms = mR.length > 0 ? mR.flatMap((r: any) => split(r.sourceRooms || "")).sort((a: string, b: string) => this.getRescueSourceScore(parseRoomCond(a).r, tR) - this.getRescueSourceScore(parseRoomCond(b).r, tR)) : [...split(this.ctx.customRules.supportTargetRoomsLowImpact || "3号室,パノラマCT"), "2号室", "1号室", "5号室", "CT(4)"].filter(r => r !== tR);
      if (sRms.length > 0) { let cnds: { c: string, fS: string, i: number }[] = []; sRms.forEach((sS: string, i: number) => { const { r: sR, min } = parseRoomCond(sS); if (sR === tR || sR === "透析後胸部" || (min > 0 && split(this.dayCells[sR]).reduce((s, m) => s + getStaffAmount(m), 0) < min)) return; split(this.dayCells[sR]).forEach(m => { const c = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(c) && !this.isHardNoConsecutive(c, tR) && !cnds.some(x => x.c === c) && !this.isForbidden(c, tR) && !this.isHalfDayBlocked(c, tR).hard && !m.includes("17:") && !this.isTimeTagBlockedByFullDayRule(tR, m)) cnds.push({ c, fS: m, i }); }); }); const cCs = cM.map(extractStaffName); cnds = cnds.filter(c => !cCs.includes(c.c) && (tR === "MMG" ? this.isMmgCapable(c.c) : true) && this.canAddKenmu(c.c, tR, true)); cnds.sort((a, b) => this.getTodayRoomCount(a.c) - this.getTodayRoomCount(b.c) || this.getPastRoomCount(a.c, tR) - this.getPastRoomCount(b.c, tR) || a.i - b.i || (this.assignCounts[a.c] || 0) - (this.assignCounts[b.c] || 0)); for (const cn of cnds) { if (cA >= tC && cP >= tC) break; if (this.hasNGPair(cn.c, cCs, false)) continue; let pS = cn.fS; if (cA < tC && cP >= tC) { const trimmed = trimEntryToNeed(cn.fS, 'AM'); if (!trimmed) continue; pS = trimmed; } else if (cA >= tC && cP < tC) { const trimmed = trimEntryToNeed(cn.fS, 'PM'); if (!trimmed) continue; pS = trimmed; } else if (e.pmClosed) { const trimmed = trimEntryToNeed(cn.fS, 'AM'); if (!trimmed) continue; pS = trimmed; } else if (e.amClosed) { const trimmed = trimEntryToNeed(cn.fS, 'PM'); if (!trimmed) continue; pS = trimmed; } cM.push(pS); if (entryCoversShift(pS, 'AM')) cA++; if (entryCoversShift(pS, 'PM')) cP++; this.addUsage(cn.c, getStaffAmount(pS)); this.updateBlockMapAfterKenmu(cn.c, pS); } this.dayCells[tR] = join(cM); }
    });

    (this.ctx.customRules.emergencies || []).forEach((em: any) => {
      if (em.type !== "empty_room_swap") return; const wR = em.section; const sRL = split(em.sourceRooms || em.sourceRoom || ""); if (!wR || !sRL.length || this.skipSections.includes(wR) || wR === "透析後胸部") return; const wC = this.dynamicCapacity[wR] ?? 1; if (split(this.dayCells[wR]).reduce((s, m) => s + getStaffAmount(m), 0) >= wC) return;
      let sw = false; for (const sF of sRL) { if (sw || sF === "透析後胸部") break; const sM = split(this.dayCells[sF]); if (!sM.length) continue; const ngI = sM.filter(m => { const c = extractStaffName(m); return !ROLE_PLACEHOLDERS.includes(c) && (this.isForbidden(c, wR) || !this.canAddKenmu(c, wR, true)); }); if (!ngI.length) continue; for (const src of ROOM_SECTIONS.filter(r => r !== wR && r !== sF && !this.skipSections.includes(r) && !["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r))) { if (sw) break; const rM = split(this.dayCells[src]); const oC = rM.filter(m => { const c = extractStaffName(m); return !ROLE_PLACEHOLDERS.includes(c) && !this.isForbidden(c, wR) && !this.isForbidden(c, sF) && !this.isHalfDayBlocked(c, wR).hard && !this.isHardNoConsecutive(c, wR) && this.canAddKenmu(c, wR, true) && !m.includes("17:") && !m.includes("19:") && !this.isTimeTagBlockedByFullDayRule(wR, m); }); for (const om of oC) { const oc = extractStaffName(om); const km = ngI.find(m => { const c = extractStaffName(m); return !this.isForbidden(c, src) && !this.isHalfDayBlocked(c, src).hard && !this.hasNGPair(c, rM.map(extractStaffName), false) && this.canAddKenmu(c, src, true); }); if (!km) continue; const kc = extractStaffName(km); this.dayCells[sF] = join(sM.map(m => m === km ? m.replace(kc, oc) : m)); this.dayCells[src] = join(rM.map(m => m === om ? m.replace(oc, kc) : m)); sw = true; break; } } }
    });

    (this.ctx.customRules.lateShifts || []).forEach((rule: any) => {
      let current = split(this.dayCells[rule.section]); if (current.length > 0 && !current.some(m => m.includes("17:") || m.includes("18:"))) { const currentCore = current.map(extractStaffName); const prevLateStaff = this.prevDay ? split(this.prevDay.cells[rule.section] || "").filter((m: string) => m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")).map(extractStaffName) : []; const excludeStaff = Array.from(new Set([...split(this.ctx.customRules.noLateShiftStaff || "").map(extractStaffName), ...split(this.ctx.customRules.noLateShiftRooms || "").flatMap(r => split(this.dayCells[r] || "").map(extractStaffName))])); const fuzaiMems = split(this.dayCells["不在"]); const candidates = this.initialAvailGeneral.filter(n => !currentCore.includes(n) && !this.isForbidden(n, rule.section) && !excludeStaff.includes(n) && !fuzaiMems.some(m => extractStaffName(m) === n)); candidates.sort((a, b) => { let sA = this.getPastLateShiftCount(a) * 100; let sB = this.getPastLateShiftCount(b) * 100; const idxA = lowPriorityStaff.indexOf(a); const idxB = lowPriorityStaff.indexOf(b); if (idxA !== -1) sA += 100000 + ((lowPriorityStaff.length - idxA) * 10000); if (idxB !== -1) sB += 100000 + ((lowPriorityStaff.length - idxB) * 10000); if (sA !== sB) return sA - sB; return a.localeCompare(b, 'ja'); }); let picked = candidates.find(n => !prevLateStaff.includes(n)); if (!picked && candidates.length > 0) picked = candidates[0]; if (picked) { current.push(`${picked}${rule.lateTime}`); this.blockMap.set(picked, this.blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); this.dayCells[rule.section] = join(current); } }
    });

    const pM = split(this.dayCells["ポータブル"]); const r2M = split(this.dayCells["2号室"]); const r2C = r2M.map(extractStaffName); const r2A = r2M.reduce((s, m) => s + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
    let nAH = false, nPH = false; r2M.forEach(rm => { const c = extractStaffName(rm); const pm = pM.find(x => extractStaffName(x) === c); if (pm) { if (pm.includes("(AM)")) nAH = true; else if (pm.includes("(PM)")) nPH = true; else { nAH = true; nPH = true; } } });
    if (r2A < 2 && (nAH || nPH)) {
      const fC = (iA: boolean, exS: string[]) => [...sSL, ...this.initialAvailGeneral].filter((s, i, a) => a.indexOf(s) === i).find(s => { if (r2C.includes(s) || this.isForbidden(s, "2号室") || this.isHalfDayBlocked(s, "2号室").hard || this.hasNGPair(s, r2C, false) || !this.canAddKenmu(s, "2号室") || this.isHardNoConsecutive(s, "2号室")) return false; const b = this.blockMap.get(s); if (b === 'ALL' || (iA && b === 'AM') || (!iA && b === 'PM')) return false; if (exS.some(r => split(this.dayCells[r]).map(extractStaffName).includes(s))) return false; return true; });
      if (nAH) { let p = fC(true, ["1号室", "5号室"]) ?? fC(true, []); if (p) { this.dayCells["2号室"] = join([...split(this.dayCells["2号室"]), `${p}(AM)`]); this.addUsage(p, 0.5); this.blockMap.set(p, this.blockMap.get(p) === 'PM' ? 'ALL' : 'AM'); this.log(`🤝 [ポータブル特例] 2号室のポータブル兼務(AM)のため ${p} を追加`); } }
      if (nPH) { let p = fC(false, ["1号室", "5号室"]) ?? fC(false, []); if (p) { this.dayCells["2号室"] = join([...split(this.dayCells["2号室"]), `${p}(PM)`]); this.addUsage(p, 0.5); this.blockMap.set(p, this.blockMap.get(p) === 'AM' ? 'ALL' : 'PM'); this.log(`🤝 [ポータブル特例] 2号室のポータブル兼務(PM)のため ${p} を追加`); } }
    }

    const pL = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
    const dKT = ROOM_SECTIONS.filter(r => !["CT", "MRI", "治療", "RI", "待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r)).sort((a, b) => { let iA = pL.indexOf(a); if (iA === -1) iA = 999; let iB = pL.indexOf(b); if (iB === -1) iB = 999; return iB - iA; });
    const rP = [...ROOM_SECTIONS].sort((a, b) => { let iA = pL.indexOf(a); if (iA === -1) iA = 999; let iB = pL.indexOf(b); if (iB === -1) iB = 999; return iB - iA; });
    
    const normalizeSingleCapacityRoom = (room: string) => {
      const cap = this.dynamicCapacity[room] ?? (['CT', 'MRI', '治療'].includes(room) ? 3 : 1);
      if (cap !== 1) return;
      const members = split(this.dayCells[room]);
      if (members.length <= 1) return;
      const fullDay = members.filter(m => entryCoversShift(m, 'AM') && entryCoversShift(m, 'PM'));
      if (fullDay.length === 0) return;
      this.dayCells[room] = join(fullDay.slice(0, 1));
    };
    normalizeSingleCapacityRoom('2号室');

    let uG2 = this.initialAvailGeneral.filter(s => !this.isUsed(s) && this.blockMap.get(s) !== 'ALL');
    uG2.forEach(st => {
      const b = this.blockMap.get(st); if (b === 'ALL') return; let t = this.getAssignedWorkTag(st); let asg = false;
      for (const rm of dKT) {
        if (this.skipSections.includes(rm) || this.isForbidden(st, rm) || (rm === "MMG" && !this.isMmgCapable(st))) continue; if (t !== "" && this.isHalfDayBlocked(st, rm).hard) continue; const e = this.getEffectiveTarget(rm, 1); if (e.allClosed || (t === "(PM)" && e.pmClosed) || (t === "(AM)" && e.amClosed)) continue;
        let cM = split(this.dayCells[rm]);
        const rI = cM.findIndex(m => { 
          const c = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(c) || this.hasNGPair(st, cM.filter(x => x !== m).map(extractStaffName), false)) return false; 
          const cc = this.getStaffTimeCounts(c); if ((t === "(AM)" && cc.am <= 1) || (t === "(PM)" && cc.pm <= 1) || (t === "" && cc.am <= 1 && cc.pm <= 1)) return false;
          let ca = m.includes("(AM)"), cp = m.includes("(PM)"); if (!ca && !cp) { ca = true; cp = true; } let na = t === "(AM)", np = t === "(PM)"; if (!na && !np) { na = true; np = true; } return (ca && na) || (cp && np); 
        });
        if (rI !== -1) {
          const oS = cM[rI], oC = extractStaffName(oS); let oR = ""; if (t === "(AM)" && !oS.includes("(")) oR = `${oC}(PM)`; else if (t === "(PM)" && !oS.includes("(")) oR = `${oC}(AM)`; cM[rI] = `${st}${t}`; if (oR) cM.push(oR); this.dayCells[rm] = join(cM); this.addUsage(st, t ? 0.5 : 1); this.blockMap.set(st, 'ALL'); this.assignCounts[oC] = Math.max(0, (this.assignCounts[oC] || 1) - getStaffAmount(oS)); let am = false, pm = false; ROOM_SECTIONS.forEach(r => { if (["待機", "昼当番", "受付", "受付ヘルプ"].includes(r)) return; split(this.dayCells[r]).forEach(m => { if (extractStaffName(m) === oC) { if (entryCoversShift(m, 'AM')) am = true; if (entryCoversShift(m, 'PM')) pm = true; } }); }); if (am && pm) this.blockMap.set(oC, 'ALL'); else if (am) this.blockMap.set(oC, 'AM'); else if (pm) this.blockMap.set(oC, 'PM'); else this.blockMap.set(oC, 'NONE'); this.log(`🪄 [兼務解消] ${st} を専任化し ${oC} の負担軽減`); asg = true; break;
        }
      }
      if (!asg) { for (const rm of rP) { if (this.skipSections.includes(rm) || this.isForbidden(st, rm) || (rm === "MMG" && !this.isMmgCapable(st)) || ["待機", "昼当番", "受付", "受付ヘルプ", "CT", "MRI", "治療", "RI", "透析後胸部"].includes(rm) || (t !== "" && this.isHalfDayBlocked(st, rm).hard)) continue; const aC = this.dynamicCapacity[rm] ?? (["CT", "MRI", "治療"].includes(rm) ? 3 : 1); const e = this.getEffectiveTarget(rm, aC); if (e.allClosed || (t === "(PM)" && e.pmClosed) || (t === "(AM)" && e.amClosed) || !this.canAddKenmu(st, rm) || this.isHardNoConsecutive(st, rm) || this.isTimeTagBlockedByFullDayRule(rm, t)) continue; let cM = split(this.dayCells[rm]); if (cM.reduce((s, m) => s + getStaffAmount(m), 0) >= e.cap || this.hasNGPair(st, cM.map(extractStaffName), false)) continue; this.dayCells[rm] = join([...cM, `${st}${t}`]); this.addUsage(st, t ? 0.5 : 1); this.blockMap.set(st, 'ALL'); this.log(`♻️ [余剰配置] 余力のある ${st} を ${rm} に追加配置`); asg = true; break; } }
      
      // ★ Ver 3.00: 最終救済は本当に誰もいないときだけ。連日注意で引っかかっていたならここで押し込む
      if (!asg) { 
        for (const fbR of ["3号室", "2号室", "1号室", "5号室"]) { 
          if (this.skipSections.includes(fbR) || this.isForbidden(st, fbR)) continue; 
          const e = this.getEffectiveTarget(fbR, 1); 
          if (e.allClosed || (t === "(PM)" && e.pmClosed) || (t === "(AM)" && e.amClosed) || this.isTimeTagBlockedByFullDayRule(fbR, t)) continue; 
          let cM = split(this.dayCells[fbR]); 
          if (this.hasNGPair(st, cM.map(extractStaffName), false)) continue; 
          
          this.dayCells[fbR] = join([...cM, `${st}${t}`]); 
          this.addUsage(st, t ? 0.5 : 1); 
          this.blockMap.set(st, 'ALL'); 
          
          if (this.isHardNoConsecutive(st, fbR)) {
             this.logWarn(`[最終救済・妥協] ${st} を連日になりますが ${fbR} に強制配置`);
          } else {
             this.log(`🚨 [最終救済] 定員超過でも未配置を防ぐため ${st} を ${fbR} に強制配置`); 
          }
          asg = true; break; 
        } 
      }
    });

    this.logPhase("仕上げ");
    if (!this.skipSections.includes("昼当番")) {
      let cL = split(this.dayCells["昼当番"]); let lT = this.ctx.customRules.lunchBaseCount ?? 3; const dC = this.day.label.match(/\((.*?)\)/)?.[1]; if (dC) { const sd = (this.ctx.customRules.lunchSpecialDays || []).find((x: any) => x.day === dC); if (sd) lT = Number(sd.count); }
      (this.ctx.customRules.lunchRoleRules || []).forEach((r: any) => { if (r.day === "毎日" || r.day === dC) { const rS = split(this.ctx.monthlyAssign[r.role] || "").map(extractStaffName), tM = split(this.dayCells[r.role] || "").map(extractStaffName); let sl: string | null = null; for (const src of split(r.sourceRooms)) { const { r: sR, min } = parseRoomCond(src); const rM = split(this.dayCells[sR] || ""), rq = min > 0 ? min : (this.dynamicCapacity[sR] || 1); if (rM.reduce((su, m) => su + getStaffAmount(m), 0) >= rq) { sl = rM.map(extractStaffName).find(n => rS.includes(n) && !tM.includes(n) && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, cL, false)) || null; } if (sl) break; } if (!sl) sl = tM.find(n => !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, cL, false)) || null; if (sl && !cL.includes(sl) && cL.length < lT) cL.push(sl); } });
      split(this.dayCells["RI"]).map(extractStaffName).forEach(n => { if (!cL.includes(n) && cL.length < lT && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, cL, false)) cL.push(n); });
      split(this.ctx.customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT").forEach(sc => split(this.dayCells[sc]).forEach(n => { const c = extractStaffName(n); if (!cL.includes(c) && cL.length < lT && !this.isForbidden(c, "昼当番") && !this.hasNGPair(c, cL, false)) cL.push(c); }));
      if (cL.length < lT) { (this.ctx.customRules.lunchConditional || []).forEach((co: any) => { const sM = split(this.dayCells[co.section]); if (sM.length >= Number(co.min)) { let p = 0; for (const n of sM) { if (p >= Number(co.out) || cL.length >= lT) break; const c = extractStaffName(n); if (!cL.includes(c) && !this.isForbidden(c, "昼当番") && !this.hasNGPair(c, cL, false)) { cL.push(c); p++; } } } }); }
      if (cL.length < lT) { const lrM: string[] = []; split(this.ctx.customRules.lunchLastResortSections ?? "治療").forEach(sc => split(this.dayCells[sc]).forEach(n => lrM.push(extractStaffName(n)))); this.initialAvailGeneral.filter((n: string) => !lrM.includes(n) && !cL.includes(n) && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, cL, false)).forEach((n: string) => { if (cL.length < lT) cL.push(n); }); this.initialAvailGeneral.filter((n: string) => lrM.includes(n) && !cL.includes(n) && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, cL, false)).forEach((n: string) => { if (cL.length < lT) cL.push(n); }); }
      this.dayCells["昼当番"] = join(cL.slice(0, lT));
    }
    const uT = this.dynamicCapacity.受付 !== undefined ? this.dynamicCapacity.受付 : 2;
    if (split(this.dayCells["受付"]).reduce((s, m) => s + getStaffAmount(m), 0) < uT && !this.skipSections.includes("受付ヘルプ")) { let hm = split(this.dayCells["受付ヘルプ"]); if (hm.length === 0) { const lC = split(this.dayCells["昼当番"]).map(extractStaffName); const gH = (exS: string[]) => { let c = this.initialAvailGeneral.filter((n: string) => !exS.includes(n) && !hm.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ") && !this.hasNGPair(n, hm.map(extractStaffName), false)); if (c.length > 0) { c.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); return c[0]; } return null; }; const lH = gH(lC); if (lH) hm.push(`${lH}(12:15〜13:00)`); const vK = split(this.dayCells["検像"]).map(extractStaffName).filter((n: string) => this.blockMap.get(n) !== 'AM' && !hm.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ") && !this.hasNGPair(n, hm.map(extractStaffName), false)); let pk = vK.length > 0 ? vK[0] : null; if (!pk) pk = gH(lH ? [lH] : []); if (pk) hm.push(`${pk}(16:00〜)`); } this.dayCells["受付ヘルプ"] = join(hm); }
  }
}

      {/* ===================== モーダル類 ===================== */}
      {showUnassignedList && (
        <Modal title="未配置のスタッフ" onClose={() => setShowUnassignedList(null)}>
          <div style={{ fontSize: 20, lineHeight: 1.6, color: "#ef4444", fontWeight: 800, textAlign: "center" }}>
            {getDailyStats(showUnassignedList).unassigned.join("、") || "全員配置済みです"}
          </div>
        </Modal>
      )}

      {selectedErrorDay && (
        <Modal title={`👀 ${selectedErrorDay} の確認事項`} onClose={() => setSelectedErrorDay(null)}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {getDayWarnings(selectedErrorDay).map((w, i) => {
              let badgeColor = "#475569"; let badgeBg = "#f8fafc"; let icon = "⚠️"; let borderColor = "#cbd5e1";
              if (w.level === 'red') { badgeColor = "#b91c1c"; badgeBg = "#fee2e2"; icon = "🔴"; borderColor = "#fecaca"; }
              else if (w.level === 'orange') { badgeColor = "#c2410c"; badgeBg = "#ffedd5"; icon = "🟠"; borderColor = "#fed7aa"; }
              else if (w.level === 'yellow') { badgeColor = "#a16207"; badgeBg = "#fef08a"; icon = "🟡"; borderColor = "#fde047"; }
              
              return (
                <li key={i} style={{ display: "flex", gap: "12px", padding: "16px 20px", marginBottom: "12px", background: "#f8fafc", border: `2px solid ${borderColor}`, borderRadius: "10px", fontSize: 16, fontWeight: 700, color: "#334155", lineHeight: 1.6, alignItems: "center" }}>
                  <span style={{ display: "inline-block", background: badgeBg, color: badgeColor, padding: "4px 10px", borderRadius: "6px", fontSize: "14px", fontWeight: 800, whiteSpace: "nowrap", border: `1px solid ${borderColor}` }}>{icon} {w.title}</span>
                  <span>{w.msg}</span>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}

      {selectedStaffForStats && (
        <Modal title={`👤 ${selectedStaffForStats} さんの詳細`} onClose={() => setSelectedStaffForStats(null)}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 18 }}>
            <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}><th style={{ padding: "12px 10px", textAlign: "left" }}>日付</th><th style={{ padding: "12px 10px", textAlign: "left" }}>担当業務</th></tr></thead>
            <tbody>
              {Object.entries(allDays).filter(([dateStr]) => dateStr.startsWith(targetMonday.substring(0, 7))).sort((a, b) => a[0].localeCompare(b[0])).map(([dateStr, cells]) => {
                const assigns: string[] = [];
                Object.entries(cells).forEach(([sec, val]) => {
                  if(["明け","入り","土日休日代休","不在","待機","昼当番","受付","受付ヘルプ"].includes(sec)) return;
                  const members = split(val as string); const myAssign = members.find(m => extractStaffName(m) === selectedStaffForStats);
                  if (myAssign) { const timeStr = myAssign.substring(selectedStaffForStats.length); assigns.push(`${sec}${timeStr}`); }
                });
                const dObj = new Date(dateStr); const YOUBI = ["日", "月", "火", "水", "木", "金", "土"];
                const label = `${dObj.getMonth() + 1}/${dObj.getDate()}(${YOUBI[dObj.getDay()]})`;
                if (assigns.length === 0) return null;
                return (
                  <tr key={dateStr} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: "12px 10px", color: "#0ea5e9", fontWeight: 700 }}>{assigns.join(" / ")}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Modal>
      )}

      {showLogDay && (
        <Modal title={`🤔 ${showLogDay} の割当根拠`} onClose={() => setShowLogDay(null)} wide>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {assignLogs[showLogDay]?.map((log, i) => renderLog(log, i))}
            {!assignLogs[showLogDay] || assignLogs[showLogDay].length === 0 ? <li style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>自動割当の履歴がありません</li> : null}
          </ul>
        </Modal>
      )}

      {showRuleModal && (
        <Modal title="🏥 勤務割付システムのルールブック" onClose={() => setShowRuleModal(false)} wide>
          <div style={{ lineHeight: 1.8, fontSize: "16px", color: "#334155" }}>
            <p>このシステムはランダムではなく、複数のルールを順番に適用し、スタッフの負担・安全・公平性のバランスを見ながら、最適に近いシフトを自動で組み立てています。</p>
            
            <h4 style={{ color: "#e11d48", borderBottom: "2px solid #ffe4e6", paddingBottom: 8, marginTop: 24 }}>🛑 1. システムが「絶対に守る」鉄の掟</h4>
            <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}><strong>担当不可・NGペアの厳守:</strong> 「この部屋はまだ不可」「この2人は同室にしない」設定は必ず守ります。</li>
              <li style={{ marginBottom: 8 }}><strong>兼務上限（過労ストッパー）:</strong> 設定値（標準3）に達した時点で⚠️注意が出ます。上限を超える自動配置はブロックされます。</li>
              <li style={{ marginBottom: 8 }}><strong>半休の終日専任室ブロック:</strong> 午前後休の人をCT/MRI等に配置することは原則ありません。</li>
            </ul>

            <h4 style={{ color: "#2563eb", borderBottom: "2px solid #dbeafe", paddingBottom: 8 }}>🟦 2. 誰が選ばれる？「ポイント制」</h4>
            <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}><strong>優先加点:</strong> その月の「メイン担当」「サブ担当」は優先的に選ばれます。</li>
              <li style={{ marginBottom: 8 }}><strong>平等化減点:</strong> CT・MRIは「今月」、その他の部屋は「今週」すでにその部屋に入っている回数が多い人ほど減点され、均等化されます。</li>
            </ul>

            <h4 style={{ color: "#10b981", borderBottom: "2px solid #d1fae5", paddingBottom: 8 }}>🟩 3. シフトが完成するまでの「5ステップ」</h4>
            <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}><strong>欠員ブロック＆緊急対応:</strong> 休みを外し、人数不足時は緊急ルールを真っ先に発動。</li>
              <li style={{ marginBottom: 8 }}><strong>例外・代打・玉突き:</strong> 専従固定や代打ルールを先に処理します。</li>
              <li style={{ marginBottom: 8 }}><strong>メイン配置:</strong> <span style={{color: "#ef4444", fontWeight: "bold"}}>【Ver3.00 強化】</span> システムが「入れる人が少なくて難易度が高い部屋」を自動計算し、厳しい部屋から順番に優先して配置します。</li>
              <li style={{ marginBottom: 8 }}>
                <strong>兼務・救済・応援:</strong>
                <div style={{ background: "#f0fdf4", padding: "8px 12px", borderRadius: 6, border: "1px solid #bbf7d0", margin: "4px 0" }}>
                   💡 フェーズ4で複数候補がある場合は、原則として<br/>
                   <strong>① 過去担当回数が少ない人</strong><br/>
                   <strong>② 今日の兼務部屋数が少ない人</strong><br/>
                   <strong>③ 補充元として指定された順（左から優先）</strong><br/>
                   の順で総合的に選びます。
                </div>
                定員割れがある場合、他への影響が少ない部屋から安全に兼務の応援を呼びます。
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>総仕上げ（昼当番・余剰配置）:</strong>
                昼当番を決定後、余力のあるスタッフは優先的に兼務解消（専任化）にあてられます。また未配置の人をなくすため、最後の余剰人員は定員オーバーでも汎用部屋（3号室等）に押し込まれます。
              </li>
            </ol>

            <div style={{ background: "#fff7ed", border: "2px solid #fed7aa", padding: 16, borderRadius: 8, marginTop: 32 }}>
              <strong style={{ color: "#c2410c", fontSize: "18px" }}>💡 連日注意の「妥協ルール」について</strong><br/>
              ポータブルなど連日禁止の部屋は、基本的には昨日の担当者を避けます。<br/>
              ただし、<strong>「どうしても他の人が全員他業務で埋まっていて、空室になってしまう場合」に限り</strong>、特例（妥協）として連日でも配置されるようにシステムが柔軟に対応します。<br/>
              妥協配置が行われた場合は「🤔根拠」ボタンのログに⚠️マークで表示されます。
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
