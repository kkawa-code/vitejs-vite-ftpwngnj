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
  
  // ===================== 🌟 Main App Component =====================
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
  const [importText, setImportText] = useState(""); 
  const [nationalHolidays, setNationalHolidays] = useState<Record<string, string>>(FALLBACK_HOLIDAYS);
  const [highlightedStaff, setHighlightedStaff] = useState<string | null>(null); 
  const [hoveredStaff, setHoveredStaff] = useState<string | null>(null);

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
    const absentMems = split(cells["不在"] || "");
    const allDayOffSet = new Set([...split(cells["明け"]||""),...split(cells["入り"]||""),...split(cells["土日休日代休"]||"")].map(extractStaffName));
    const workingStaff = allStaff.filter(s => { 
      if (allDayOffSet.has(s)) return false;
      const isFullAbsent = absentMems.some(m => extractStaffName(m) === s && !m.includes("(AM)") && !m.includes("(PM)")); 
      return !isFullAbsent; 
    }); 
    
    const staffTime: Record<string, {am: boolean, pm: boolean}> = {};
    workingStaff.forEach(s => staffTime[s] = {am: false, pm: false});
    
    absentMems.forEach(m => { 
      const c = extractStaffName(m); 
      if (staffTime[c]) { 
        if (m.includes("(AM)")) staffTime[c].am = true; 
        if (m.includes("(PM)")) staffTime[c].pm = true; 
      } 
    });
    
    WORK_SECTIONS.forEach(sec => {
      if (sec === "不在" || sec === "待機" || sec === "昼当番") return; 
      split(cells[sec]).forEach(m => { 
        const c = extractStaffName(m); 
        if (staffTime[c]) { 
          if (m.includes("(AM)") || !!m.match(/\(〜\d+:\d+\)/)) staffTime[c].am = true; 
          else if (m.includes("(PM)") || !!m.match(/\(\d+:\d+〜\)/)) staffTime[c].pm = true; 
          else { staffTime[c].am = true; staffTime[c].pm = true; } 
        } 
      });
    });
    
    const unassigned: string[] = [];
    workingStaff.forEach(s => { 
      if (!staffTime[s].am && !staffTime[s].pm) unassigned.push(s); 
      else if (!staffTime[s].am) unassigned.push(`${s}(AM未配置)`); 
      else if (!staffTime[s].pm) unassigned.push(`${s}(PM未配置)`); 
    });
    
    return { workingCount: workingStaff.length, absentCount: allStaff.length - workingStaff.length, unassigned }; 
  };
  
  const getDayWarnings = (dayId: string): WarningInfo[] => { 
    const w: WarningInfo[] = []; const cells = allDays[dayId] || {}; const staffMap: Record<string, string[]> = {}; 
    ROOM_SECTIONS.forEach(room => { split(cells[room]).forEach(m => { const core = extractStaffName(m); if(!staffMap[core]) staffMap[core]=[]; if(!staffMap[core].includes(room)) staffMap[core].push(room); }) }); 
    const softNgPairs = (customRules.ngPairs || []).filter((p: any) => p.level === "soft"); 
    softNgPairs.forEach((ng: any) => { const s1 = extractStaffName(ng.s1); const s2 = extractStaffName(ng.s2); ROOM_SECTIONS.forEach(room => { const mems = split(cells[room]).map(extractStaffName); if (mems.includes(s1) && mems.includes(s2)) w.push({ level: 'yellow', title: '回避特例', room, msg: `なるべくNGペア（${s1} と ${s2}）が「${room}」で同室です` }); }); }); 
    Object.entries(staffMap).forEach(([staff, rms]) => { const limit = customRules.alertMaxKenmu || 3; const dayCount = rms.filter(r => { const m = split(cells[r]).find(x => extractStaffName(x) === staff); return m && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:"); }).length; if(dayCount > limit) w.push({ level: 'orange', title: '兼務超過', staff, msg: `${staff}さんが日中 ${dayCount}部屋を担当中` }); }); 
    const targetEmptyRooms = split(customRules.alertEmptyRooms || "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像"); 
    targetEmptyRooms.forEach(room => { if (split(cells[room]).length === 0) w.push({ level: 'yellow', title: '空室', room, msg: `「${room}」の担当者がいません` }); }); 
    const uTarget = customRules.capacity?.受付 ?? 2; 
    if (split(cells["受付"]).reduce((sum: number, m: string) => sum + getStaffAmount(m), 0) < uTarget && split(cells["受付ヘルプ"]).length === 0) { w.push({ level: 'yellow', title: '受付不足', room: '受付', msg: `受付が${uTarget}名未満ですが、受付ヘルプがいません` }); } 
    const curIdx = days.findIndex(d => d.id === dayId); 
    if (curIdx > 0 && !days[curIdx-1].isPublicHoliday) { split(customRules.noConsecutiveRooms).forEach(room => { const prev = split(allDays[days[curIdx-1].id]?.[room]).map(extractStaffName); split(cells[room]).map(extractStaffName).filter(n => prev.includes(n)).forEach(n => w.push({ level: 'red', title: '連日注意', staff: n, room, msg: `${n}さんが「${room}」に連日入っています` })); }); } 
    
    const stats = getDailyStats(dayId); 
    stats.unassigned.forEach(item => { 
      if (item.includes("(AM未配置)")) w.push({ level: 'red', title: '半日未配置', staff: extractStaffName(item), msg: `${extractStaffName(item)}さんの午前が未配置です` }); 
      else if (item.includes("(PM未配置)")) w.push({ level: 'red', title: '半日未配置', staff: extractStaffName(item), msg: `${extractStaffName(item)}さんの午後が未配置です` }); 
      else w.push({ level: 'red', title: '未配置', staff: item, msg: `${item}さんが1日を通して配置されていません` }); 
    }); 
    return w; 
  };
  
  const monthlyMatrixStats = useMemo(() => { const targetMonth = targetMonday.substring(0, 7); const stats: Record<string, Record<string, { total: number, late: number }>> = {}; activeGeneralStaff.forEach(s => { stats[s] = {}; ROOM_SECTIONS.forEach(r => stats[s][r] = { total: 0, late: 0 }); }); Object.entries(allDays).forEach(([dateStr, cells]) => { if (dateStr.startsWith(targetMonth)) { ROOM_SECTIONS.forEach(room => { split(cells[room] || "").forEach(m => { const core = extractStaffName(m); if (stats[core]?.[room] !== undefined) { stats[core][room].total += 1; if (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")) stats[core][room].late += 1; } }); }); } }); return stats; }, [targetMonday, allDays, activeGeneralStaff]);
  
  const setAllDaysWithHistory = (updater: any) => { setAllDays(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; if (JSON.stringify(prev) !== JSON.stringify(next)) setHistory(h => [...h, prev].slice(-20)); return next; }); };
  const updateDay = (k: string, v: string) => { setAllDaysWithHistory((prev: any) => { const nextState = { ...prev, [sel]: { ...(prev[sel] || {}), [k]: v } }; if (k === "入り") { const idx = days.findIndex(d => d.id === sel); if (idx >= 0 && idx < days.length - 1) { const nextDayId = days[idx + 1].id; const currentAke = split((prev[nextDayId] || {})["明け"]).filter(m => !split(v).includes(m)); nextState[nextDayId] = { ...(prev[nextDayId] || {}), "明け": join([...currentAke, ...split(v)]) }; } } return nextState; }); };

  const handleAutoAssign = (isSmart: boolean, isWeekly: boolean) => {
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev }; const newLogs = { ...assignLogs }; const ctx = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules }; const targetDays = isWeekly ? days : [cur];
      targetDays.forEach(day => {
        const idx = days.findIndex(d => d.id === day.id); let prevDayObj: any = null; const dObj = new Date(day.id);
        if (dObj.getDay() !== 1) { const prevDate = new Date(dObj); prevDate.setDate(prevDate.getDate() - 1); const prevDateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(prevDate.getDate())}`; if (nextAll[prevDateStr]) prevDayObj = { id: prevDateStr, cells: nextAll[prevDateStr] }; else if (idx > 0) prevDayObj = { id: days[idx-1].id, cells: nextAll[days[idx-1].id] || days[idx-1].cells }; }
        const targetMonth = day.id.substring(0, 7); const pastDaysInMonthArray = Object.entries(nextAll).filter(([dateStr]) => dateStr.startsWith(targetMonth) && dateStr < day.id).map(([dateStr, cells]) => ({ id: dateStr, cells } as any));
        const pastDaysInWeekArray = days.slice(0, idx).map(d => ({ ...d, cells: nextAll[d.id] || d.cells }));
        const worker = new AutoAssigner({ ...day, cells: nextAll[day.id] || day.cells }, prevDayObj, pastDaysInMonthArray, pastDaysInWeekArray, ctx, isSmart);
        const res = worker.execute(); nextAll[day.id] = res.cells; newLogs[day.id] = res.logInfo || [];
       });
      setAssignLogs(newLogs); return nextAll;
    });
  };

  const handleUndo = () => { if (history.length > 0) { const last = history[history.length - 1]; setAllDays(last); setHistory(h => h.slice(0, -1)); } };
  const updateMonthly = (k: string, v: string) => { setMonthlyAssign(prev => ({ ...prev, [k]: v })); };
  const updateRule = (type: keyof CustomRules, idx: number, key: string, val: any) => { setCustomRules(r => { const arr = [...((r[type] as any[]) || [])]; arr[idx] = { ...arr[idx], [key]: val }; return { ...r, [type]: arr }; }); };
  const removeRule = (type: keyof CustomRules, idx: number) => { setCustomRules(r => { const arr = [...((r[type] as any[]) || [])]; arr.splice(idx, 1); return { ...r, [type]: arr }; }); };
  const addRule = (type: keyof CustomRules, def: any) => { setCustomRules(r => ({ ...r, [type]: [...((r[type] as any[]) || []), def] })); };

  const handleClearGroupDay = (title: string, sections: string[]) => { if (window.confirm(`${cur.label} の「${title}」をクリアしますか？`)) { setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; sections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; }); } };
  const handleClearGroupWeek = (title: string, sections: string[]) => { if (window.confirm(`表示中の「${title}」を1週間分すべてクリアしますか？`)) { setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; sections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; }); } };
  const handleClearWorkDay = () => { if (window.confirm(`${cur.label} の「モダリティ」と「一般撮影・透視・その他」をクリアしますか？`)) { const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections]; setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; }); } };
  const handleClearWorkWeek = () => { if (window.confirm(`表示中の「モダリティ」と「一般撮影・透視・その他」を1週間分すべてクリアしますか？`)) { const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections]; setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; }); } };
  const handleCopyYesterday = () => { const idx = days.findIndex(d => d.id === cur.id); if (idx <= 0) return; const prevDay = days[idx - 1]; setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...prevDay.cells } })); };

  const handleExport = () => { const dataObj = { allDays, monthlyAssign, customRules }; const blob = new Blob([JSON.stringify(dataObj)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `shifto_backup_${targetMonday}.json`; a.click(); URL.revokeObjectURL(url); };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event: any) => { try { const dataObj = JSON.parse(event.target.result); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("データを復元しました！"); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("読み込みに失敗しました。"); } }; reader.readAsText(file); e.target.value = ""; };
  const handleCopyToClipboard = () => { const dataObj = { allDays, monthlyAssign, customRules }; navigator.clipboard.writeText(JSON.stringify(dataObj)).then(() => { alert("データをコピーしました！"); }).catch(() => { alert("コピーに失敗しました。"); }); };
  const handleTextImport = () => { if(!importText) return; try { const dataObj = JSON.parse(importText); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("テキストからデータを復元しました！"); setImportText(""); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("テキストの読み込みに失敗しました。"); } };

  const dailyStaffRoomCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    days.forEach(day => {
      counts[day.id] = {};
      if (day.isPublicHoliday) return;
      ROOM_SECTIONS.forEach(rs => {
        if (["待機", "昼当番", "受付", "受付ヘルプ"].includes(rs)) return;
        split(allDays[day.id]?.[rs]).forEach(m => {
          const core = extractStaffName(m);
          if (!m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:")) {
            counts[day.id][core] = (counts[day.id][core] || 0) + 1;
          }
        });
      });
    });
    return counts;
  }, [days, allDays]);

  return (
    <div style={{ maxWidth: "98%", margin: "0 auto", padding: "24px", boxSizing: "border-box" }}>
      <style>{globalStyle}</style>
      
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "20px 32px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 26, fontWeight: 900 }}>勤務割付システム Ver 3.00</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(highlightedStaff || hoveredStaff) && (
            <div style={{ background: "#2563eb", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px rgba(37,99,235,0.3)", animation: "fadeIn 0.3s ease" }}>
              <span>✨ {highlightedStaff || hoveredStaff} さんをハイライト中</span>
              {highlightedStaff && <button onClick={() => setHighlightedStaff(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "18px", padding: 0 }}>✖</button>}
            </div>
          )}
          <button className="btn-hover" onClick={() => setTargetMonday((prev:any) => { const d=new Date(prev); d.setDate(d.getDate()-7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={btnStyle("#f1f5f9", "#475569")}>◀ 先週</button>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button className="btn-hover" onClick={() => setTargetMonday((prev:any) => { const d=new Date(prev); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={btnStyle("#f1f5f9", "#475569")}>来週 ▶</button>
        </div>
      </div>

      <div className="tabs-header no-print">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 週間予定表</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 月間集計</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>⚙️ 設定・データ入出力</button>
      </div>

      <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
        <div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "16px" }}>
          <div className="scroll-container">
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
              <thead className="sticky-table-header">
                <tr>
                  <th style={{...cellStyle(true, false, false, true), borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0"}}>区分</th>
                  {days.map(day => {
                    const stats = getDailyStats(day.id); const warnings = getDayWarnings(day.id);
                    return (
                      <th key={day.id} onClick={() => setSel(day.id)} style={{...cellStyle(true, day.isPublicHoliday, day.id === sel), borderBottom: "1px solid #e2e8f0", cursor: "pointer"}}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 17 }}>{day.label}</span>
                            {warnings.length > 0 && <span onClick={(e) => { e.stopPropagation(); setSelectedErrorDay(day.id); }} className="btn-hover" style={{ background: "#fff7ed", color: "#c2410c", padding: "4px 8px", borderRadius: 6, fontSize: 14, border: "1px solid #fdba74" }}>⚠️ 注意 {warnings.length}</span>}
                            {!day.isPublicHoliday && assignLogs[day.id]?.length > 0 && <span onClick={(e) => { e.stopPropagation(); setShowLogDay(day.id); }} className="btn-hover" style={{ background: "#f0f9ff", color: "#0369a1", padding: "4px 8px", borderRadius: 6, fontSize: 14, border: "1px solid #bae6fd" }}>🤔 根拠</span>}
                          </div>
                          {!day.isPublicHoliday && (
                            <div onClick={(e) => { e.stopPropagation(); setShowUnassignedList(day.id); }} className="btn-hover" style={{ fontSize: 14, background: stats.unassigned.length > 0 ? "#fee2e2" : "#d1fae5", color: stats.unassigned.length > 0 ? "#ef4444" : "#065f46", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>
                              出勤:{stats.workingCount}名 (不在:{stats.absentCount}名)<br/>未配置:<span style={{fontSize:18, textDecoration:"underline"}}>{stats.unassigned.length}</span>名 
                            </div>
                          )}
                          {day.isPublicHoliday && <div style={{ fontSize: 16, color: "#ef4444" }}>🎌 {day.holidayName}</div>}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section, sIdx) => (
                  <tr key={section}>
                    <td style={{...cellStyle(true, false, false, true, sIdx % 2 === 1), borderRight: "1px solid #e2e8f0"}}>{section}</td>
                    {days.map((day, dIdx) => {
                      const currentMems = split(allDays[day.id]?.[section]); const prevMems = dIdx > 0 ? split(allDays[days[dIdx-1].id]?.[section]).map(extractStaffName) : []; const isAlertRoom = split(customRules.noConsecutiveRooms).includes(section); const warnings = getDayWarnings(day.id); const isRoomEmpty = currentMems.length === 0 && warnings.some(w => w.level === 'yellow' && w.room === section); let baseBgStyle = cellStyle(false, day.isPublicHoliday, day.id === sel, false, sIdx % 2 === 1); if (isRoomEmpty && !day.isPublicHoliday) baseBgStyle.background = "#fef08a";
                      
                      return (
                        <td key={day.id + section} style={baseBgStyle}>
                          {!day.isPublicHoliday && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", lineHeight: "1.4" }}>
                              {currentMems.map((m, mIdx) => {
                                const coreName = extractStaffName(m); const mod = m.substring(coreName.length); const isConsecutive = isAlertRoom && prevMems.includes(coreName); const hasRedWarning = isConsecutive || warnings.some(w => w.level === 'red' && w.staff === coreName && w.room === section); const hasOrangeWarning = warnings.some(w => w.level === 'orange' && w.staff === coreName); const hasYellowWarning = warnings.some(w => w.level === 'yellow' && w.room === section && w.title === '回避特例');
                                
                                const targetStaff = highlightedStaff || hoveredStaff;
                                const isHighlighted = targetStaff === coreName;
                                const isDimmed = targetStaff !== null && targetStaff !== coreName;
                                
                                const roomCount = dailyStaffRoomCounts[day.id]?.[coreName] || 0;
                                const limit = customRules.alertMaxKenmu || 3;
                                const isOverLimit = roomCount > limit; 

                                let tagBg = "#f0f4ff"; let tagColor = "#1e293b"; let tagBorder = "#94a3b8";
                                
                                if (isOverLimit) { tagBg = "#ffedd5"; tagColor = "#9a3412"; tagBorder = "#fdba74"; }

                                if (hasRedWarning) { tagBg = "#fee2e2"; tagColor = "#b91c1c"; tagBorder = "#ef4444"; } 
                                else if (hasOrangeWarning) { tagBorder = "#ea580c"; } 
                                else if (hasYellowWarning) { tagBorder = "#ca8a04"; }

                                let inlineStyle: React.CSSProperties = { background: tagBg, color: tagColor, border: `1px solid ${tagBorder}`, padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", fontSize: "16px", fontWeight: (hasRedWarning || isOverLimit) ? 800 : 700, transition: "all 0.2s ease" };
                                
                                if (isHighlighted) {
                                  inlineStyle.background = "#2563eb"; inlineStyle.color = "#fff"; inlineStyle.borderColor = "#1d4ed8"; inlineStyle.boxShadow = "0 4px 12px rgba(37,99,235,0.4)"; inlineStyle.transform = "scale(1.05)"; inlineStyle.zIndex = 10; inlineStyle.position = "relative";
                                } else if (isDimmed) {
                                  inlineStyle.opacity = 0.25; inlineStyle.filter = "grayscale(1)";
                                }

                                return (
                                  <div key={mIdx} className="btn-hover" 
                                    onClick={(e) => { e.stopPropagation(); setHighlightedStaff(prev => prev === coreName ? null : coreName); }}
                                    onMouseEnter={() => setHoveredStaff(coreName)}
                                    onMouseLeave={() => setHoveredStaff(null)}
                                    style={inlineStyle}
                                  >
                                    <span>{coreName}</span>
                                    {mod && (mod.includes("(AM)") ? <span style={{ background: isHighlighted ? "#bfdbfe" : "#e0f2fe", color: isHighlighted ? "#1e40af" : "#0369a1", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #bae6fd", fontWeight: 800 }}>AM</span> : mod.includes("(PM)") ? <span style={{ background: isHighlighted ? "#fbcfe8" : "#fce7f3", color: isHighlighted ? "#9f1239" : "#be185d", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #fbcfe8", fontWeight: 800 }}>PM</span> : <span style={{ background: isHighlighted ? "#e2e8f0" : "#f3f4f6", color: isHighlighted ? "#334155" : "#4b5563", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #d1d5db", fontWeight: 700 }}>{mod.replace(/[()]/g, '')}</span>)}
                                  </div>
                                );
                              })}
                            </div>
                          )}
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
          <div className="scroll-container hide-scrollbar sticky-header-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 16, marginBottom: 24 }}>
             <div style={{ display: "flex", gap: 8 }}>
                {days.map(d => <button key={d.id} onClick={() => setSel(d.id)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: d.id === sel ? "#2563eb" : "#fff", color: d.id === sel ? "#fff" : "#64748b", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>{d.label}</button>)}
             </div>
             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn-hover" onClick={() => setShowRuleModal(true)} style={btnStyle("#f8fafc", "#475569")}>📖 システムのルール</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(false, false)} style={btnStyle("#10b981")}>✨ 1日自動割当</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(false, true)} style={btnStyle("#0ea5e9")}>⚡ 週間自動割当</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(true, false)} style={btnStyle("#f59e0b")}>🔄 欠員補充(1日)</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(true, true)} style={btnStyle("#d97706")}>🔄 欠員補充(週間)</button>
                <button className="btn-hover" onClick={handleCopyYesterday} disabled={cur.isPublicHoliday} style={btnStyle("#f8fafc", "#475569")}>📋 昨日をコピー</button>
                <button className="btn-hover" onClick={handleUndo} disabled={history.length === 0} style={btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6")}>↩️ 戻る</button>
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
             {RENDER_GROUPS.map((group: RenderGroup) => (
               <div key={group.title} style={{ gridColumn: "1 / -1" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #e2e8f0" }}>
                   <h4 style={{ fontSize: 21, fontWeight: 900, borderLeft: `6px solid ${group.color}`, paddingLeft: 12, margin: 0 }}>{group.title}</h4>
                   {group.title === "休務・夜勤" || group.title === "待機・その他" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <button className="btn-hover" onClick={() => handleClearGroupDay(group.title, group.sections)} style={btnStyle("#fff", "#64748b")}>🧹 1日クリア</button>
                        <button className="btn-hover" onClick={() => handleClearGroupWeek(group.title, group.sections)} style={btnStyle("#fff", "#64748b")}>🧹 週間クリア</button>
                      </div>
                    ) : group.title === "モダリティ" || group.title === "一般撮影・透視・その他" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <button className="btn-hover" onClick={handleClearWorkDay} style={btnStyle("#fff", "#64748b")}>🧹 業務1日クリア</button>
                        <button className="btn-hover" onClick={handleClearWorkWeek} style={btnStyle("#fff", "#64748b")}>🧹 業務週間クリア</button>
                      </div>
                    ) : null}
                 </div>
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                   {group.sections.map((s: string) => <SectionEditor key={s} section={s} value={allDays[sel]?.[s] || ""} activeStaff={allStaff} onChange={(v: string) => updateDay(s, v)} noTime={REST_SECTIONS.includes(s) || s === "昼当番"} customOptions={ROLE_PLACEHOLDERS.filter(p => p.startsWith(s))} onAddHelp={s === "不在" ? (staffName: string, fromTime: string) => { const cells = allDays[sel] || {}; const rooms = ["CT","MRI","RI","治療","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","検像"]; const found = rooms.find(r => split(cells[r]||"").some((m:string)=>extractStaffName(m)===staffName)); if (found) { const cur = cells[found] || ""; const entry = found+"枠"+fromTime; if (!cur.includes(entry)) updateDay(found, cur ? `${cur}、${entry}` : entry); } } : undefined} dayCells={s === "不在" ? (allDays[sel] || {}) : undefined} />)}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="no-print" style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 24 }}>
          <h3 style={{ fontWeight: 900, color: "#3b82f6", fontSize: 21, marginTop: 0 }}>配置マトリックス（月間集計）</h3>
          <div style={{ marginTop: 16, overflowX: "auto", maxHeight: "70vh", border: "2px solid #cbd5e1", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "16px", textAlign: "center", tableLayout: "auto" }}>
              <thead><tr><th style={{ position: "sticky", left: 0, top: 0, background: "#f8fafc", zIndex: 30, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", color: "#1e293b", fontWeight: 900 }}>スタッフ</th>{ROOM_SECTIONS.map(r => <th key={r} style={{ position: "sticky", top: 0, zIndex: 20, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", background: "#f8fafc", fontWeight: 900 }}>{r}</th>)}</tr></thead>
              <tbody>
                {allStaff.filter(s => activeGeneralStaff.includes(s)).map((staff, sIdx) => {
                  const isZebra = sIdx % 2 === 1; const rowBg = isZebra ? "#f1f5f9" : "#ffffff";
                  return (
                    <tr key={staff} className="calendar-row">
                      <td onClick={() => setSelectedStaffForStats(staff)} style={{ position: "sticky", left: 0, background: rowBg, zIndex: 10, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", fontWeight: 900, textAlign: "left", cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}>{staff}</td>
                      {ROOM_SECTIONS.map(r => {
                        const stat = monthlyMatrixStats[staff]?.[r] || { total: 0, late: 0 }; let bg = rowBg; let color = "#334155";
                        if (["CT", "MRI"].includes(r)) { if (stat.total > 0) { bg = `rgba(59, 130, 246, ${Math.min(0.1 + stat.total * 0.15, 0.9)})`; if(stat.total >= 3) color = "#fff"; } else if (isMonthlyMainStaff(r, staff, monthlyAssign)) bg = "#fef08a"; }
                        return ( <td key={r} style={{ padding: 10, background: bg, color: color, fontWeight: stat.total > 0 ? 900 : 500, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{stat.total > 0 ? <span style={{fontSize:17}}>{stat.total}</span> : <span style={{ width: "16px" }}></span>}{stat.late > 0 && <span style={{ fontSize: "13px", background: "#fef08a", color: "#b45309", padding: "2px 6px", borderRadius: "6px", border: "1px solid #fde047" }}>遅{stat.late}</span>}</div></td> );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="no-print" style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 25, fontWeight: 900, marginBottom: 20, color: "#0f766e" }}>👥 スタッフ名簿</h3>
          <div style={{ background: "#f0fdf4", padding: "16px 20px", borderRadius: 12, border: "2px solid #bbf7d0", marginBottom: 24 }}><p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#166534", lineHeight: 1.6 }}>💡 順番を自動で「50音順」にするため、名前の後にカッコでふりがなをつけてください。</p></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
             <div><label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>一般スタッフ</label><textarea className="name-textarea" placeholder="例: 山田(やまだ)" value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} /></div>
             <div><label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>受付スタッフ</label><textarea className="name-textarea" placeholder="例: 高橋(たかはし)" value={customRules.receptionStaffList} onChange={e => setCustomRules({...customRules, receptionStaffList: e.target.value})} /></div>
          </div>
        </div>

        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 25, fontWeight: 900, marginBottom: 20, color: "#be185d" }}>📱 データ保存・復元</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
             <button className="btn-hover" onClick={handleExport} style={btnStyle("#6366f1")}>💾 ファイル保存</button>
             <button className="btn-hover" onClick={() => fileInputRef.current?.click()} style={btnStyle("#8b5cf6")}>📂 ファイル読込</button>
             <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleImport} />
             <div style={{ width: "2px", height: "32px", background: "#cbd5e1", margin: "0 8px" }}></div>
             <button className="btn-hover" onClick={handleCopyToClipboard} style={btnStyle("#db2777")}>📋 テキストコピー</button>
             <input type="text" value={importText} onChange={e => setImportText(e.target.value)} placeholder="貼り付けて復元" style={{ flex: 1, padding: "10px 16px", fontSize: 17, borderRadius: 8, border: "2px solid #f9a8d4" }} />
             <button className="btn-hover" onClick={handleTextImport} style={btnStyle("#be185d")}>✨ 復元</button>
          </div>
        </div>

        <div style={{ ...panelStyle() }}>
          <h3 style={{ fontSize: 27, fontWeight: 900, marginBottom: 32, color: "#0f766e" }}>📋 ルールの優先順位（システムはこの上から順に処理します）</h3>

          <div style={{ borderLeft: "8px solid #94a3b8", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 23, fontWeight: 900, color: "#475569", marginBottom: 20, borderBottom: "2px solid #cbd5e1", paddingBottom: 10 }}>フェーズ1：前提・固定ルール（最優先）</h4>
            
            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🙅" title="担当不可ルール">
              {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                    <Row><StaffSel v={rule.staff} onChange={(v:any)=>updateRule("forbidden", idx, "staff", v)} list={activeGeneralStaff} /><DelBtn onClick={()=>removeRule("forbidden", idx)} /></Row>
                    <MultiPicker selected={rule.sections} onChange={(v: string) => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button>
            </RuleCard>

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🔒" title="専従ルール">
              {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <Row key={idx}><StaffSel v={rule.staff} onChange={(v:any)=>updateRule("fixed", idx, "staff", v)} list={activeGeneralStaff} /><RoomSel v={rule.section} onChange={(v:any)=>updateRule("fixed", idx, "section", v)} list={ROOM_SECTIONS} /><DelBtn onClick={()=>removeRule("fixed", idx)} /></Row>
              ))}
              <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button>
            </RuleCard>

            <RuleCard bg="#fef2f2" border="#fecaca" color="#b91c1c" icon="🚫" title="NGペア">
              {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <Row key={idx}><StaffSel v={rule.s1} onChange={(v:any)=>updateRule("ngPairs", idx, "s1", v)} list={activeGeneralStaff} /><span className="rule-label">と</span><StaffSel v={rule.s2} onChange={(v:any)=>updateRule("ngPairs", idx, "s2", v)} list={activeGeneralStaff} /><select value={rule.level || "hard"} onChange={(e: any) => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"120px"}}><option value="hard">絶対NG</option><option value="soft">なるべくNG</option></select><DelBtn onClick={()=>removeRule("ngPairs", idx)} /></Row>
              ))}
              <button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ NGペアを追加</button>
            </RuleCard>

            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🕒" title="終日専任・連日禁止">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【終日専任】半休・AM/PM不可の部屋</label><MultiPicker selected={customRules.fullDayOnlyRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, fullDayOnlyRooms: v})} options={ROOM_SECTIONS} /></div>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【連日禁止】2日連続で担当させない部屋</label><MultiPicker selected={customRules.noConsecutiveRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, noConsecutiveRooms: v})} options={ROOM_SECTIONS} /></div>
              </div>
            </RuleCard>

            <RuleCard bg="#fdf4ff" border="#f5d0fe" color="#86198f" icon="🏠" title="遅番不可スタッフ・部屋">
              <label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>遅番不可スタッフ</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center", marginBottom: 16 }}><MultiPicker selected={customRules.noLateShiftStaff || ""} onChange={(v: string) => setCustomRules({...customRules, noLateShiftStaff: v})} options={allStaff} placeholder="＋スタッフを選択" /></div>
              <label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>その日その部屋に入っている人も遅番除外</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center" }}><MultiPicker selected={customRules.noLateShiftRooms || ""} onChange={(v: string) => setCustomRules({...customRules, noLateShiftRooms: v})} options={ROOM_SECTIONS} placeholder="＋部屋を選択" /></div>
            </RuleCard>
          </div>

          <div style={{ borderLeft: "8px solid #f59e0b", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#b45309", marginBottom: 20, borderBottom: "2px solid #fcd34d", paddingBottom: 10 }}>フェーズ2：例外・代打処理</h4>
            
            <RuleCard bg="#fef08a" border="#fde047" color="#a16207" icon="🚨" title="緊急ルール（人数不足時）">
              <div style={{ marginBottom: 16, padding: "12px", background: "#fef8f8", borderRadius: "8px", border: "1px dashed #fca5a5", color: "#991b1b", fontSize: "16px", fontWeight: "600" }}>💡 <b>「左側（発動条件）」から「右側（アクション）」へ</b> 流れるようにルールを設定します。</div>
              {(customRules.emergencies || []).map((em: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ flex: '1 1 350px', display: 'flex', gap: '8px', alignItems: 'center', borderRight: '2px dashed #cbd5e1', paddingRight: '16px' }}>
                      <span style={{fontWeight: 800, color: '#ef4444', flexShrink: 0}}>【条件】</span>
                      <select className="rule-sel" value={em.type} onChange={(e:any) => updateRule("emergencies", idx, "type", e.target.value)}>
                        <option value="change_capacity">出勤人数が指定以下の場合</option><option value="staff_assign">出勤人数が指定以下の場合（強制配置）</option><option value="role_assign">出勤人数が指定以下の場合（月間担当）</option><option value="clear">出勤人数が指定以下の場合（部屋閉鎖）</option><option value="empty_room_swap">指定の部屋が空室の場合</option>
                      </select>
                      {em.type !== 'empty_room_swap' && <><NumInp v={em.threshold || 0} onChange={(v:any)=>updateRule("emergencies", idx, "threshold", v)} w={60} />人以下</>}
                      {em.type === 'empty_room_swap' && <><RoomSel v={em.section} onChange={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} ph="監視する部屋" /> が空室</>}
                    </div>
                    <div style={{ flex: '1 1 400px', display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '8px' }}>
                       <span style={{fontWeight: 800, color: '#3b82f6', flexShrink: 0}}>➔【アクション】</span>
                       {em.type === 'change_capacity' && <><RoomSel v={em.section} onChange={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} /> の定員を <NumInp v={em.newCapacity||1} onChange={(v:any)=>updateRule("emergencies", idx, "newCapacity", v)} w={60} /> 名にする</>}
                       {em.type === 'staff_assign' && <><StaffSel v={em.staff} onChange={(v:any)=>updateRule("emergencies", idx, "staff", v)} list={activeGeneralStaff} /> を <RoomSel v={em.section} onChange={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} /> に配置</>}
                       {em.type === 'role_assign' && <><select className="rule-sel" value={em.role} onChange={(e:any)=>updateRule("emergencies", idx, "role", e.target.value)}><option value="">月間設定</option>{MONTHLY_CATEGORIES.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select> を <RoomSel v={em.section} onChange={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} /> に配置</>}
                       {em.type === 'clear' && <><RoomSel v={em.section} onChange={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} /> を無人にする</>}
                       {em.type === 'empty_room_swap' && <><select className="rule-sel" value={em.sourceRooms} onChange={(e:any)=>updateRule("emergencies", idx, "sourceRooms", e.target.value)}><option value="">補充元の部屋(優先順)</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> から強制補充</>}
                    </div>
                    <DelBtn onClick={()=>removeRule("emergencies", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#a16207", borderColor:"#ca8a04"}} onClick={() => addRule("emergencies", { type: "change_capacity", threshold: 16, section: "CT", newCapacity: 3 })}>＋ 緊急ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🔄" title="メイン配置の交換ルール">
              {(customRules.swapRules || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "2px solid #bbf7d0", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>[</span>
                      <RoomSel v={rule.targetRoom} onChange={(v:any)=>updateRule("swapRules", idx, "targetRoom", v)} list={ROOM_SECTIONS} ph="兼務先" />
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>] に [</span>
                      <RoomSel v={rule.triggerRoom} onChange={(v:any)=>updateRule("swapRules", idx, "triggerRoom", v)} list={ROOM_SECTIONS} ph="メイン部屋" />
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>] の担当者が誰も入れない時➔</span>
                      <DelBtn onClick={()=>removeRule("swapRules", idx)} />
                    </div>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>以下の部屋の担当者とメイン配置を交換する（※左の部屋から優先）:</span>
                      <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("swapRules", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("swapRules", { targetRoom: "DSA", triggerRoom: "5号室", sourceRooms: "透視（6号）、1号室、2号室" })}>＋ 交換ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#fff7ed" border="#fed7aa" color="#c2410c" icon="🔄" title="代打ルール">
              {(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center", background: "#fff", padding: "16px", borderRadius: 8, border: "1px solid #fdba74", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}><MultiPicker selected={rule.target} onChange={(v: string) => updateRule("substitutes", idx, "target", v)} options={activeGeneralStaff} placeholder="対象スタッフ(休)" /></div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>が全員休みの時➔</span>
                    <div style={{ flex: 1, minWidth: "200px" }}><MultiPicker selected={rule.subs} onChange={(v: string) => updateRule("substitutes", idx, "subs", v)} options={activeGeneralStaff} placeholder="代打スタッフを追加" /></div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>を</span>
                    <RoomSel v={rule.section} onChange={(v:any)=>updateRule("substitutes", idx, "section", v)} list={ROOM_SECTIONS} />
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>に優先</span>
                    <DelBtn onClick={()=>removeRule("substitutes", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#c2410c", borderColor:"#fdba74"}} onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#e0f2fe" border="#bae6fd" color="#0369a1" icon="🎱" title="玉突きルール">
              {(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "1px solid #bae6fd", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <StaffSel v={rule.s1 || rule.triggerStaff} onChange={(v:any)=>updateRule("pushOuts", idx, "s1", v)} list={activeGeneralStaff} ph="誰" />
                      <span className="rule-label" style={{color:"#0284c7"}}>と</span>
                      <StaffSel v={rule.s2 || rule.targetStaff} onChange={(v:any)=>updateRule("pushOuts", idx, "s2", v)} list={activeGeneralStaff} ph="誰" />
                      <span className="rule-label" style={{color:"#0284c7"}}>が同じ</span>
                      <RoomSel v={rule.triggerSection} onChange={(v:any)=>updateRule("pushOuts", idx, "triggerSection", v)} list={ROOM_SECTIONS} />
                      <span className="rule-label" style={{color:"#0284c7"}}>になる時➔ 後者を</span>
                      <DelBtn onClick={()=>removeRule("pushOuts", idx)} />
                    </div>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#0284c7"}}>以下の部屋に移動（※左から優先）:</span>
                      <MultiPicker selected={rule.targetSections} onChange={(v: string) => updateRule("pushOuts", idx, "targetSections", v)} options={ROOM_SECTIONS} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#0369a1", borderColor:"#7dd3fc"}} onClick={() => addRule("pushOuts", { s1: "", s2: "", triggerSection: "", targetSections: "" })}>＋ 玉突きルールを追加</button>
            </RuleCard>
          </div>

          <div style={{ borderLeft: "8px solid #3b82f6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#1d4ed8", marginBottom: 20, borderBottom: "2px solid #bfdbfe", paddingBottom: 10 }}>フェーズ3：メイン配置</h4>
            
            <RuleCard bg="#fffbeb" border="#fde68a" color="#b45309" icon="👑" title="部屋の割り当て優先順位">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {(customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS).map((room, idx, arr) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "10px 14px", borderRadius: 8, border: "1px solid #fcd34d" }}>
                    <div style={{ display: "flex", alignItems: "center" }}><span style={{ fontSize: 17, fontWeight: 800, color: "#92400e", marginRight: 8 }}>{idx + 1}.</span><span style={{ fontSize: 19, fontWeight: 700, color: "#b45309" }}>{room}</span></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "6px 10px", fontSize: 17 }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, priorityRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef3c7", borderRadius: 6, padding: "6px 10px", fontSize: 17 }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
            </RuleCard>

            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="👥" title="絶対優先の定員設定">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", padding: "10px 16px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                    <span style={{ fontWeight: 800, fontSize: 19 }}>{room}:</span>
                    <NumInp v={count} onChange={(v:any)=>setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: v}})} w={60} />
                    <span style={{fontSize: 17}}>人</span>
                    <span onClick={() => { const n={...customRules.capacity}; delete n[room]; setCustomRules({...customRules, capacity:n}); }} style={{ cursor: "pointer", color: "#ef4444", marginLeft: 8, fontSize: 21 }}>✖</span>
                  </div>
                ))}
                <RoomSel v={""} onChange={(v:any)=>{if(v) setCustomRules({...customRules, capacity: {...customRules.capacity, [v]: 1}})}} list={ROOM_SECTIONS} ph="＋部屋追加" w={180} />
              </div>
            </RuleCard>

            <RuleCard bg="#fff" border="#e2e8f0" color="#334155" icon="📅" title="月間担当者の設定">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => {
                  const opts = key === "受付ヘルプ" ? GENERAL_ROOMS : [];
                  return ( <SectionEditor key={key} section={label} value={monthlyAssign[key] || ""} activeStaff={key === "受付" ? activeReceptionStaff : allStaff} onChange={(v: string) => updateMonthly(key, v)} noTime={true} customOptions={opts} /> );
                })}
              </div>
            </RuleCard>
          </div>

          <div style={{ borderLeft: "8px solid #10b981", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#047857", marginBottom: 20, borderBottom: "2px solid #a7f3d0", paddingBottom: 10 }}>フェーズ4：兼務・救済・遅番</h4>
            
            <RuleCard bg="#fdf4ff" border="#f0abfc" color="#86198f" icon="✨" title="スマート兼務（専任担当の負担軽減・引き抜き）">
              {(customRules.smartKenmu || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ background: "#fff", padding: "16px 20px", border: "1px solid #f0abfc", borderRadius: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#86198f" }}>[</span>
                        <RoomSel v={rule.targetRoom} onChange={(v:any)=>updateRule("smartKenmu", idx, "targetRoom", v)} list={ROOM_SECTIONS} ph="専任を外す部屋" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#86198f" }}>] を、以下の担当者に兼務させる（※左から優先）:</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 6 }}>
                        <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("smartKenmu", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                      </div>
                    </div>
                    <DelBtn onClick={()=>removeRule("smartKenmu", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#86198f", borderColor: "#f0abfc" }} onClick={() => addRule("smartKenmu", { targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" })}>＋ スマート兼務ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#ecfdf5" border="#a7f3d0" color="#065f46" icon="🔗" title="兼務・セット配置ルール">
              <h6 style={{ fontSize: 17, color: "#047857", marginTop: 0, marginBottom: 12 }}>■ 常時兼務ペア</h6>
              {(customRules.kenmuPairs || []).map((rule: any, idx: number) => (
                <div key={idx} className="rule-row" style={{ background: "#fff", padding: "12px 16px", border: "1px solid #a7f3d0", borderRadius: 8 }}>
                  <RoomSel v={rule.s1} onChange={(v:any)=>updateRule("kenmuPairs", idx, "s1", v)} list={ROOM_SECTIONS} ph="部屋を選択" />
                  <span className="rule-label" style={{ color: "#065f46" }}>←→</span>
                  <RoomSel v={rule.s2} onChange={(v:any)=>updateRule("kenmuPairs", idx, "s2", v)} list={ROOM_SECTIONS} ph="部屋を選択" />
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16, fontSize: 16, color: "#047857", fontWeight: 700, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!rule.isExclusive} onChange={(e) => updateRule("kenmuPairs", idx, "isExclusive", e.target.checked)} style={{ width: 22, height: 22, cursor: "pointer" }} />このペアに専念させる
                  </label>
                  <DelBtn onClick={()=>removeRule("kenmuPairs", idx)} />
                </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("kenmuPairs", { s1: "", s2: "" })}>＋ ペアを追加</button>

              <h6 style={{ fontSize: 17, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 基本兼務（セット配置）</h6>
              {(customRules.linkedRooms || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "1px solid #a7f3d0", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>[</span>
                        <RoomSel v={rule.target} onChange={(v:any)=>updateRule("linkedRooms", idx, "target", v)} list={ROOM_SECTIONS} ph="兼務専用にする部屋" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>] には専任を置かず、[</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }}><MultiPicker selected={rule.sources} onChange={(v: string) => updateRule("linkedRooms", idx, "sources", v)} options={EXTENDED_ROOM_SECTIONS} /></div>
                      <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>] の担当者をセットで配置する（※左から優先）</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#065f46" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#065f46" }}>▼</button>
                      <DelBtn onClick={()=>removeRule("linkedRooms", idx)} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("linkedRooms", { target: "", sources: "" })}>＋ セット配置ルールを追加</button>

              <h6 style={{ fontSize: 17, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 🆘 空室（人数不足）救済ルール</h6>
              {(customRules.rescueRules || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "1px solid #fde047", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#854d0e" }}>もし</span>
                        <RoomSel v={rule.targetRoom} onChange={(v:any)=>updateRule("rescueRules", idx, "targetRoom", v)} list={ROOM_SECTIONS} ph="（空室の部屋）" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#854d0e" }}>が不足なら ➔ 以下の部屋から兼務を探す（※左から優先）</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10 }}><MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("rescueRules", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} /></div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#a16207" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#a16207" }}>▼</button>
                      <DelBtn onClick={()=>removeRule("rescueRules", idx)} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#854d0e", borderColor: "#fde047" }} onClick={() => addRule("rescueRules", { targetRoom: "", sourceRooms: "" })}>＋ 救済ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#f5f3ff" border="#ddd6fe" color="#6d28d9" icon="🌆" title="遅番ルール">
              <div style={{ marginBottom: 16, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #ddd6fe" }}>
                <label style={{ fontSize: 16, fontWeight: 800, color: "#6d28d9", display: "block", marginBottom: 4 }}>優先度を下げるスタッフ（左に書いた人ほど徹底して除外します）</label>
                <MultiPicker selected={customRules.lateShiftLowPriorityStaff || ""} onChange={(v: string) => setCustomRules({...customRules, lateShiftLowPriorityStaff: v})} options={allStaff} placeholder="＋スタッフを選択" />
                <div style={{ fontSize: 14, color: "#475569", marginTop: 8 }}>※遅番は「日中の業務量」ではなく「今月の遅番回数が少ない人」から均等に選ばれます。ここに登録された人は回数に関わらず最終手段としてのみ選ばれます。</div>
              </div>
              {(customRules.lateShifts || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"12px 16px", border:"1px solid #ddd6fe", borderRadius:8}}>
                    <RoomSel v={rule.section} onChange={(v:any)=>updateRule("lateShifts", idx, "section", v)} list={ROOM_SECTIONS} />
                    <span className="rule-label" style={{color:"#6d28d9"}}>に</span>
                    <select value={rule.lateTime} onChange={(e: any) => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">遅番の時間</option>{TIME_OPTIONS.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>の担当を追加する（日勤は</span>
                    <select value={rule.dayEndTime} onChange={(e: any) => updateRule("lateShifts", idx, "dayEndTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">終了時間</option>{TIME_OPTIONS.filter(t => t.includes("(〜")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>とする）</span>
                    <DelBtn onClick={()=>removeRule("lateShifts", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#fff1f2" border="#fecaca" color="#be185d" icon="⚠️" title="兼務上限のストッパー設定">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <NumInp v={customRules.alertMaxKenmu ?? 3} onChange={(v:any)=>setCustomRules({...customRules, alertMaxKenmu: v})} w={80} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#9f1239" }}>部屋以上の兼務は自動ブロック（手動時はエラー表示）</span>
              </div>
            </RuleCard>
          </div>

          <div style={{ borderLeft: "8px solid #8b5cf6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#6d28d9", marginBottom: 20, borderBottom: "2px solid #c4b5fd", paddingBottom: 10 }}>フェーズ5：仕上げ（最後に配置）</h4>
            
            <RuleCard bg="#eef2ff" border="#c7d2fe" color="#4338ca" icon="🍱" title="昼当番ルール">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#fff", padding: "12px 20px", borderRadius: 10, border: "1px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 19, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span><NumInp v={customRules.lunchBaseCount ?? 3} onChange={(v:any)=>setCustomRules({...customRules, lunchBaseCount: v})} w={80} />
              </div>

              <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", marginBottom: 20 }}>
                <h6 style={{ margin: "0 0 16px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>👤 特定役割の確保（別部屋から引抜）</h6>
                {(customRules.lunchRoleRules || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{ borderBottom: "1px dashed #e0e7ff", paddingBottom: 16, marginBottom: 16 }}>
                    <select value={rule.day} onChange={(e: any) => updateRule("lunchRoleRules", idx, "day", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", minWidth: "100px"}}>{["月","火","水","木","金","土","日","毎日"].map(d => <option key={d} value={d}>{d}{d!=="毎日"?"曜":""}</option>)}</select>
                    <span className="rule-label">は</span>
                    <select value={rule.role} onChange={(e: any) => updateRule("lunchRoleRules", idx, "role", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", minWidth: "140px"}}><option value="">役割を選択</option>{MONTHLY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
                    <span className="rule-label">担当を優先。引抜元（定員を満たしている場合のみ。※左から優先）:</span>
                    <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("lunchRoleRules", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                    <DelBtn onClick={()=>removeRule("lunchRoleRules", idx)} />
                  </div>
                ))}
                <button className="rule-add" onClick={() => addRule("lunchRoleRules", { day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" })}>＋ 役割確保ルールを追加</button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>📅 曜日ごとに人数を変える</h6>
                    {(customRules.lunchSpecialDays || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.day} onChange={(e: any) => updateRule("lunchSpecialDays", idx, "day", e.target.value)} className="rule-sel">{["月","火","水","木","金","土","日"].map(d => <option key={d} value={d}>{d}曜</option>)}</select>
                        <span className="rule-label">は</span>
                        <NumInp v={rule.count} onChange={(v:any)=>updateRule("lunchSpecialDays", idx, "count", v)} />
                        <DelBtn onClick={()=>removeRule("lunchSpecialDays", idx)} />
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchSpecialDays", { day: "火", count: 4 })}>＋ 曜日ルールを追加</button>
                  </div>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h6>
                    {(customRules.lunchConditional || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <RoomSel v={rule.section} onChange={(v:any)=>updateRule("lunchConditional", idx, "section", v)} list={ROOM_SECTIONS} />
                        <NumInp v={rule.min} onChange={(v:any)=>updateRule("lunchConditional", idx, "min", v)} />
                        <span className="rule-label">人以上➔</span>
                        <NumInp v={rule.out} onChange={(v:any)=>updateRule("lunchConditional", idx, "out", v)} />
                        <DelBtn onClick={()=>removeRule("lunchConditional", idx)} />
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchConditional", { section: "CT", min: 4, out: 1 })}>＋ 条件ルールを追加</button>
                  </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 24 }}>
                  <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", minWidth: "260px" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>🎯 優先的に選出する部屋</h6>
                    <MultiPicker selected={customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT"} onChange={(v: string) => setCustomRules({...customRules, lunchPrioritySections: v})} options={ROOM_SECTIONS} />
                  </div>
                  <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", minWidth: "260px" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>⚠️ 緊急時のみ選出する部屋（なるべく除外）</h6>
                    <MultiPicker selected={customRules.lunchLastResortSections ?? "治療"} onChange={(v: string) => setCustomRules({...customRules, lunchLastResortSections: v})} options={ROOM_SECTIONS} />
                  </div>
              </div>
            </RuleCard>

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🤝" title="サポート専任（2人目要員）ルール">
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 17, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>対象スタッフ名（複数可）</label>
                    <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "1px solid #86efac", minHeight: "56px", display: "flex", alignItems: "center" }}>
                      <MultiPicker selected={customRules.supportStaffList || ""} onChange={(v: string) => setCustomRules({...customRules, supportStaffList: v})} options={allStaff} placeholder="＋スタッフを選択" />
                    </div>
                  </div>
                  <div style={{ flex: 2, minWidth: "260px" }}>
                    <label style={{ fontSize: 17, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>優先する対象部屋</label>
                    <MultiPicker selected={customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT"} onChange={(v: string) => setCustomRules({...customRules, supportTargetRooms: v})} options={ROOM_SECTIONS} />
                  </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start", marginTop: 16 }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 15, fontWeight: 800, color: "#166534", display: "block", marginBottom: 4 }}>低影響グループ（優先的に補充元にする部屋）</label>
                    <MultiPicker selected={customRules.supportTargetRoomsLowImpact ?? "3号室,パノラマCT"} onChange={(v: string) => setCustomRules({...customRules, supportTargetRoomsLowImpact: v})} options={ROOM_SECTIONS} />
                  </div>
                  <div style={{ flex: 2, minWidth: "260px" }}>
                    <label style={{ fontSize: 15, fontWeight: 800, color: "#166534", display: "block", marginBottom: 4 }}>高影響グループ（極力補充元にしない部屋）</label>
                    <MultiPicker selected={customRules.supportTargetRoomsHighImpact ?? "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像"} onChange={(v: string) => setCustomRules({...customRules, supportTargetRoomsHighImpact: v})} options={ROOM_SECTIONS} />
                  </div>
              </div>
            </RuleCard>
          </div>
          
        </div>
      </div>

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
