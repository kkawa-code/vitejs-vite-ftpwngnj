import React, { useEffect, useMemo, useState, useRef } from "react";

// ===================== 🌟 CSS & Styles =====================
const globalStyle = `
  html, body, #root { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
  body { background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: "Segoe UI", "Yu Gothic UI", "Hiragino Sans", "Meiryo", system-ui, -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 0.02em; font-size: 16px; font-weight: 600; overflow-x: hidden; }
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  textarea, select, button, input { font: inherit; font-weight: 700; }
  textarea:focus, select:focus, input:focus { outline: 3px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 8px center; background-size: 1.2em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; padding-right: 32px !important; }
  details>summary { list-style: none; cursor: pointer; outline: none; transition: color 0.2s; }
  details>summary:hover { color: #0d9488; }
  .scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; }
  .sticky-table-header th { position: sticky; top: 0; z-index: 20; background: #f8fafc; border-bottom: 1px solid #cbd5e1; box-shadow: 0 2px 5px -2px rgba(15,23,42,0.16); }
  .sticky-header-panel { position: sticky; top: 0; z-index: 30; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(4px); padding-top: 16px; margin-top: -16px; box-shadow: 0 4px 8px -6px rgba(15,23,42,0.18); border-bottom: 1px solid rgba(203,213,225,0.9); }
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
  .rule-label { font-size: 15px; font-weight: 700; color: #475569; flex-shrink: 0; }
  .tab-btn { background: none; border: none; padding: 12px 20px; font-size: 17px; font-weight: 800; color: #475569; cursor: pointer; border-bottom: 3px solid transparent; transition: 0.2s; }
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
  .screen-weekly-table { display: block; }
  .print-weekly-sheet { display: none; }
  @page { size: A4 portrait; margin: 2mm; }
  @media print {
    html, body, #root {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    body {
      background: #fff !important;
      color: #000 !important;
      font-size: 9px !important;
      font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #root > div {
      max-width: none !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .no-print { display: none !important; }
    .screen-weekly-table { display: none !important; }

    .print-weekly-sheet {
      display: block !important;
      width: 100% !important;
      height: 280.5mm !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      page-break-after: avoid !important;
    }
    .print-sheet-table {
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      border-collapse: collapse !important;
      table-layout: auto !important;
      page-break-inside: avoid !important;
    }
    .print-sheet-table th,
    .print-sheet-table td {
      border: 0.2mm solid #111 !important;
      background: #fff !important;
      color: #000 !important;
      padding: 0.72mm 0.75mm !important;
      font-size: 10.5pt !important;
      font-weight: 700 !important;
      line-height: 1.12 !important;
      vertical-align: middle !important;
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: clip !important;
      word-break: keep-all !important;
      overflow-wrap: anywhere !important;
    }
    .print-sheet-table th {
      font-size: 10.9pt !important;
      font-weight: 800 !important;
      text-align: center !important;
    }
    .print-sheet-table .p-sec {
      width: 8mm !important;
      font-weight: 700 !important;
      text-align: center !important;
      vertical-align: middle !important;
      white-space: nowrap !important;
      font-size: 8.8pt !important;
      padding-left: 0.4mm !important;
      padding-right: 0.4mm !important;
    }
    .print-sheet-table .p-day {
      font-size: 9.9pt !important;
      font-weight: 700 !important;
      line-height: 1.04 !important;
      white-space: nowrap !important;
    }
    .print-sheet-table .p-line {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 10.2pt !important;
      font-weight: 700 !important;
      line-height: 1.12 !important;
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: clip !important;
      word-break: keep-all !important;
      overflow-wrap: anywhere !important;
    }
    .print-sheet-table thead tr {
      height: 7.2mm !important;
    }
    .print-sheet-table tbody tr {
      height: auto !important;
    }
    .print-sheet-table tbody tr.p-row-short {
      height: 7.9mm !important;
    }
    .print-sheet-table tbody tr.p-row-default {
      height: 9.9mm !important;
    }
    .print-sheet-table tbody tr.p-row-tall {
      height: 11.1mm !important;
    }
    .print-sheet-table tbody tr.p-row-verytall {
      height: 12.2mm !important;
    }
    .scroll-container,
    .print-area {
      overflow: visible !important;
      border: none !important;
      background: #fff !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
  }`;

// ===================== 🌟 Types & Constants =====================
export type RenderGroup = { title: string; color: string; sections: string[] };
export type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
export type WarningInfo = { level: 'red' | 'orange' | 'yellow'; title: string; msg: string; staff?: string; room?: string; fromTime?: string; };
export type RejectReason = { hard: boolean; msg: string };

export interface CustomRules {
  staffList: string; receptionStaffList: string; femaleStaffList: string; supportStaffList: string; supportTargetRooms: string; 
  customHolidays: string; capacity: Record<string, number>; dailyAdditions: any[]; priorityRooms: string[]; 
  fullDayOnlyRooms: string; noConsecutiveRooms: string; noLateShiftStaff: string; noLateShiftRooms: string; lateShiftLowPriorityStaff: string;
  fluoroAuxConflictRooms: string;
  closedRooms: any[]; ngPairs: any[]; fixed: any[]; forbidden: any[]; substitutes: any[]; pushOuts: any[]; emergencies: any[]; 
  swapRules: any[]; kenmuPairs: any[]; rescueRules: any[]; lateShifts: any[]; lunchBaseCount: number; lunchSpecialDays: any[]; 
  lunchConditional: any[]; lunchRoleRules: any[]; lunchPrioritySections: string; lunchLastResortSections: string; linkedRooms: any[];
  alertMaxKenmu: number; alertEmptyRooms: string;
}
export type AutoAssignContext = { allStaff: string[]; activeGeneralStaff: string[]; activeReceptionStaff: string[]; monthlyAssign: Record<string, string>; customRules: CustomRules; };

export const SECTIONS = ["明け","入り","土日休日代休","不在","待機","CT","MRI","RI","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","治療","検像","昼当番","受付","受付ヘルプ"];
export const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在"].includes(s));
export const ROOM_SECTIONS = SECTIONS.filter(s => !["明け","入り","土日休日代休","不在","待機","昼当番"].includes(s));
export const REST_SECTIONS = ["明け","入り","土日休日代休","不在"];
export const WORK_SECTIONS = SECTIONS.filter(s => !REST_SECTIONS.includes(s));
export const WEEKLY_DISPLAY_SECTIONS = (() => {
  const ordered = SECTIONS.filter(s => s !== "透析後胸部");
  const insertIndex = ordered.indexOf("受付ヘルプ");
  ordered.splice(insertIndex >= 0 ? insertIndex + 1 : ordered.length, 0, "透析後胸部");
  return ordered;
})();
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
  { title: "待機・透析後胸部", color: "#f59e0b", sections: ["待機","透析後胸部"] } 
];

export const FALLBACK_HOLIDAYS: Record<string, string> = { "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日", "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日" };

export const DEFAULT_RULES: CustomRules = { 
  staffList: "", receptionStaffList: "", femaleStaffList: "", supportStaffList: "", supportTargetRooms: "2号室、3号室", customHolidays: "", 
  capacity: { "CT": 4, "MRI": 3, "治療": 3, "RI": 1, "MMG": 1, "透視（6号）": 1, "透視（11号）": 1, "骨塩": 1, "1号室": 1, "5号室": 1, "パノラマCT": 2 }, 
  dailyAdditions: [], priorityRooms: ["治療","受付","MMG","RI","MRI","CT","透視（6号）","透視（11号）","骨塩","1号室","5号室","2号室","ポータブル","DSA","検像","パノラマCT","3号室","受付ヘルプ","透析後胸部"], 
  fullDayOnlyRooms: "DSA、CT、MRI", noConsecutiveRooms: "ポータブル", 
  noLateShiftStaff: "", noLateShiftRooms: "透視（11号）", lateShiftLowPriorityStaff: "", fluoroAuxConflictRooms: "透視（6号）、透視（11号）", 
  closedRooms: [], 
  ngPairs: [], 
  fixed: [], 
  forbidden: [], 
  substitutes: [], 
  pushOuts: [], 
  emergencies: [{ threshold: 19, type: "change_capacity", role: "", section: "CT", newCapacity: 3 }, { threshold: 17, type: "clear", role: "", section: "3号室" }], 
  swapRules: [
    { targetRoom: "パノラマCT", triggerRoom: "5号室", sourceRooms: "1号室、2号室、CT(4)" },
    { targetRoom: "ポータブル", triggerRoom: "3号室", sourceRooms: "2号室、CT(4)、1号室、5号室" },
    { targetRoom: "DSA", triggerRoom: "5号室", sourceRooms: "CT(4)、2号室、1号室、透視（6号）" },
    { targetRoom: "検像", triggerRoom: "骨塩", sourceRooms: "透視（11号）、1号室、2号室、5号室" }
  ], 
  kenmuPairs: [
    { s1: "MMG", s2: "透視（11号）", isExclusive: true },
    { s1: "骨塩", s2: "検像", isExclusive: true },
    { s1: "パノラマCT", s2: "透視（6号）", isExclusive: true }
  ], 
  rescueRules: [
    { targetRoom: "ポータブル", sourceRooms: "3号室、2号室、CT(4)" },
    { targetRoom: "DSA", sourceRooms: "5号室、2号室、CT(4)" },
    { targetRoom: "1号室", sourceRooms: "3号室、CT(4)" },
    { targetRoom: "2号室", sourceRooms: "3号室、CT(4)" },
    { targetRoom: "5号室", sourceRooms: "3号室、CT(4)、2号室" }
  ], 
  lateShifts: [{ section: "透視（6号）", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)", fromSecondUseInWeek: true }], 
  lunchBaseCount: 3, lunchSpecialDays: [{ day: "火", count: 4 }], lunchConditional: [{ section: "CT", min: 4, out: 1 }], 
  lunchRoleRules: [{ day: "火", role: "MMG", sourceRooms: "CT(4)、1号室、2号室、3号室、5号室" }], 
  lunchPrioritySections: "RI、1号室、2号室、3号室、5号室", lunchLastResortSections: "治療", 
  linkedRooms: [
    { target: "ポータブル", sources: "3号室(1)、2号室、1号室、5号室、CT(4)" },
    { target: "DSA", sources: "5号室、CT(4)、2号室" },
    { target: "パノラマCT", sources: "透視（6号）、2号室" }
  ], 
  alertMaxKenmu: 3, alertEmptyRooms: "CT、MRI、治療、RI、1号室、2号室、3号室、5号室、透視（6号）、透視（11号）、MMG、骨塩、パノラマCT、ポータブル、DSA、検像、受付" 
};


const sanitizeRulesInput = (raw: any): CustomRules => {
  const {
    smartKenmu: _smartKenmu,
    consecutiveAlertRooms: _consecutiveAlertRooms,
    dailyCapacities: _dailyCapacities,
    supportTargetRoomsLowImpact: _supportTargetRoomsLowImpact,
    supportTargetRoomsHighImpact: _supportTargetRoomsHighImpact,
    ...rest
  } = raw || {};
  const merged = { ...DEFAULT_RULES, ...rest } as CustomRules;
  const rawClosedRooms = merged.closedRooms || [];
  const legacyThreeRoomAllDay = ["月", "火", "水", "木", "金"].every(day =>
    rawClosedRooms.some((r: any) => r?.room === "3号室" && r?.time === "全日" && r?.day === day)
  );
  merged.closedRooms = legacyThreeRoomAllDay
    ? rawClosedRooms.filter((r: any) => !(r?.room === "3号室" && r?.time === "全日"))
    : rawClosedRooms;
  return merged;
};

export const KEY_ALL_DAYS = "shifto_alldays_v300"; export const KEY_MONTHLY = "shifto_monthly_v300"; export const KEY_RULES = "shifto_rules_v300";

export const pad = (n: number) => String(n).padStart(2, '0');
export const TIME_OPTIONS: string[] = ["(AM)", "(PM)", "(12:15〜13:00)", "(17:00〜19:00)", "(17:00〜22:00)"];
for (let h = 8; h <= 19; h++) { for (let m = 0; m < 60; m += 15) { if (h === 8 && m === 0) continue; TIME_OPTIONS.push(`(${h}:${pad(m)}〜)`); TIME_OPTIONS.push(`(〜${h}:${pad(m)})`); } }

export const split = (v: string) => (v || "").split(/[、,\n]+/).map(s => s.trim()).filter(Boolean);
export const join = (a: string[]) => a.filter(Boolean).join("、");
export const extractStaffName = (f: string) => f.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
export const parseRoomCond = (str: string) => { const m = str.match(/^(.*?)\((\d+)\)$/); return m ? { r: m[1], min: Number(m[2]) } : { r: str, min: 0 }; };

export const DEFAULT_FLUORO_AUX_CONFLICT_ROOMS = "透視（6号）、透視（11号）";
export const AUX_FOLLOWUP_SECTIONS = ["待機", "透析後胸部"];
export const getFluoroAuxConflictSections = (rooms?: string) => split(rooms || DEFAULT_FLUORO_AUX_CONFLICT_ROOMS);
export const hasFluoroAuxConflict = (dayCells: Record<string, string> | undefined, staff: string, targetSection: string, conflictRooms?: string) => {
  if (!dayCells) return false;
  const core = extractStaffName(staff);
  const fluoroConflictSections = getFluoroAuxConflictSections(conflictRooms);
  if (AUX_FOLLOWUP_SECTIONS.includes(targetSection)) {
    return fluoroConflictSections.some(sec => split(dayCells[sec] || "").some(m => extractStaffName(m) === core));
  }
  if (fluoroConflictSections.includes(targetSection)) {
    return AUX_FOLLOWUP_SECTIONS.some(sec => split(dayCells[sec] || "").some(m => extractStaffName(m) === core));
  }
  return false;
};

export const applyFluoroAuxConflictRule = (cells: Record<string, string>, changedSection: string, conflictRooms?: string) => {
  const fluoroConflictSections = getFluoroAuxConflictSections(conflictRooms);
  if (![...fluoroConflictSections, ...AUX_FOLLOWUP_SECTIONS].includes(changedSection)) return cells;
  const next = { ...cells };
  const changedMembers = split(next[changedSection] || "").map(extractStaffName);
  if (changedMembers.length === 0) return next;
  const oppositeSections = AUX_FOLLOWUP_SECTIONS.includes(changedSection)
    ? fluoroConflictSections
    : fluoroConflictSections.includes(changedSection)
      ? AUX_FOLLOWUP_SECTIONS
      : [];
  oppositeSections.forEach(sec => {
    const current = split(next[sec] || "");
    const filtered = current.filter(m => !changedMembers.includes(extractStaffName(m)));
    if (filtered.length !== current.length) next[sec] = join(filtered);
  });
  return next;
};

export const parseLooseJsonMap = (raw?: string): Record<string, string> => {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch {}
  try { return JSON.parse(raw.replace(/、(?=\s*")/g, ",")); } catch {}
  return {};
};
export const stringifyJsonMap = (obj: Record<string, string>) => JSON.stringify(obj);

export function parseAndSortStaff(staffString: string) {
  const list = split(staffString);
  const parsed = list.map(s => { const match = s.match(/^(.*?)[\(（](.*?)[\)）]$/); return { cleanName: match ? match[1].trim() : s, yomi: match ? match[2].trim() : s }; });
  parsed.sort((a, b) => a.yomi.localeCompare(b.yomi, 'ja'));
  return Array.from(new Set(parsed.map(p => p.cleanName)));
}

export function formatDayForDisplay(d: Date) { const YOUBI = ["日", "月", "火", "水", "木", "金", "土"]; return `${d.getMonth() + 1}/${d.getDate()}(${YOUBI[d.getDay()]})`; }
export function parseDateId(dateStr: string) { const [y, m, d] = dateStr.split('-').map(Number); return new Date(y, m - 1, d, 12, 0, 0); }
export function toDateId(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
export function getMondayOfWeek(d: Date) { const base = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0); const day = base.getDay(); const diff = base.getDate() - day + (day === 0 ? -6 : 1); base.setDate(diff); return base; }
export function getAssignmentCycleInfo(dateStr: string) {
  const target = parseDateId(dateStr);
  const curMonthFirst = new Date(target.getFullYear(), target.getMonth(), 1, 12, 0, 0);
  const nextMonthFirst = new Date(target.getFullYear(), target.getMonth() + 1, 1, 12, 0, 0);
  const curCycleStart = getMondayOfWeek(curMonthFirst);
  const nextCycleStart = getMondayOfWeek(nextMonthFirst);
  let cycleMonthFirst = curMonthFirst;
  if (target < curCycleStart) cycleMonthFirst = new Date(target.getFullYear(), target.getMonth() - 1, 1, 12, 0, 0);
  else if (target >= nextCycleStart) cycleMonthFirst = nextMonthFirst;
  const cycleStart = getMondayOfWeek(cycleMonthFirst);
  const afterCycleMonthFirst = new Date(cycleMonthFirst.getFullYear(), cycleMonthFirst.getMonth() + 1, 1, 12, 0, 0);
  const nextStart = getMondayOfWeek(afterCycleMonthFirst);
  const endInclusive = new Date(nextStart.getTime());
  endInclusive.setDate(endInclusive.getDate() - 1);
  return {
    monthKey: `${cycleMonthFirst.getFullYear()}-${pad(cycleMonthFirst.getMonth() + 1)}`,
    monthLabel: `${cycleMonthFirst.getFullYear()}年${cycleMonthFirst.getMonth() + 1}月`,
    startId: toDateId(cycleStart),
    endExclusiveId: toDateId(nextStart),
    endInclusiveId: toDateId(endInclusive),
    rangeLabel: `${formatDayForDisplay(cycleStart)}〜${formatDayForDisplay(endInclusive)}`,
  };
}

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

export function getStaffAmount(name: string) {
  if (ROLE_PLACEHOLDERS.includes(extractStaffName(name))) return 0;
  return (name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/)) ? 0.5 : 1;
}
export function isAllDayAbsenceEntry(entry: string) {
  return !!entry && !entry.includes("(AM)") && !entry.includes("(PM)") && !entry.includes("〜");
}

// ===================== 🌟 UI Components =====================
export const btnStyle = (bg: string, color: string = "#fff", fontSize: number = 15): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 6 });
export const panelStyle = (): React.CSSProperties => ({ background: "#fff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 14px -10px rgba(15,23,42,0.16)", width: "100%", boxSizing: "border-box" });
export const cellStyle = (isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties => { let bg = isHeader ? "#f8fafc" : (isZebra ? "#fafbfc" : "#fff"); if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e7f1ff" : "#f3f8ff"); return { border: "1px solid #cbd5e1", padding: "10px 12px", background: bg, fontWeight: isHeader ? 900 : 800, textAlign: isHeader ? "center" : "left", fontSize: isHeader ? 16 : 15, color: isHoliday && isHeader ? "#dc2626" : "#1e293b", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, transition: "background-color 0.2s" }; };

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
  const match = logStr.match(/^・(.*?)\s\[(.*?)\]\s(.*)$/);
  if (!match) return <li key={i} style={{ padding: "8px 12px", marginBottom: "4px", background: "#f8fafc", borderRadius: "6px", fontSize: 14, color: "#475569", lineHeight: 1.6, wordBreak: "break-word" }}>{logStr.substring(1)}</li>;
  const icon = match[1]; const category = match[2]; const text = match[3];
  let bg = "#f8fafc"; let border = "#e2e8f0"; let color = "#475569"; let badgeBg = "#e2e8f0"; let badgeColor = "#475569";
  if (category.includes("配置決定") || category.includes("増枠") || category.includes("初期優先度")) { bg = "#eff6ff"; border = "#bfdbfe"; color = "#1e3a8a"; badgeBg = "#dbeafe"; badgeColor = "#1d4ed8"; }
  else if (category.includes("緊急") || category.includes("除外") || category.includes("スキップ")) { bg = "#fef2f2"; border = "#fecaca"; color = "#7f1d1d"; badgeBg = "#fee2e2"; badgeColor = "#b91c1c"; }
  else if (category.includes("救済") || category.includes("代打") || category.includes("最終救済") || category.includes("特例サポート")) { bg = "#fff7ed"; border = "#fed7aa"; color = "#9a3412"; badgeBg = "#ffedd5"; badgeColor = "#c2410c"; }
  else if (category.includes("兼務") || category.includes("負担軽減") || category.includes("スマート兼務") || category.includes("解消")) { bg = "#ecfdf5"; border = "#a7f3d0"; color = "#064e3b"; badgeBg = "#d1fae5"; badgeColor = "#047857"; }
  else if (category.includes("遅番")) { bg = "#f5f3ff"; border = "#ddd6fe"; color = "#4c1d95"; badgeBg = "#ede9fe"; badgeColor = "#6d28d9"; }
  else if (category.includes("玉突き")) { bg = "#e0f2fe"; border = "#bae6fd"; color = "#0c4a6e"; badgeBg = "#bae6fd"; badgeColor = "#0369a1"; }
  else if (category.includes("専従") || category.includes("役割") || category.includes("低影響補充")) { bg = "#f0fdfa"; border = "#bbf7d0"; color = "#14532d"; badgeBg = "#dcfce7"; badgeColor = "#15803d"; }
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

export const SectionEditor = ({ section, value, activeStaff, onChange, noTime = false, customOptions = [], onAddHelp, onClearHelp, dayCells, fluoroAuxConflictRooms }: any) => {
  const members = split(value); const isTaiki = section === "待機"; const isFuzai = section === "不在"; const isHelp = section === "受付ヘルプ";
  const selectableStaff = activeStaff.filter((s: string) => !members.some((m: string) => extractStaffName(m) === s) && !hasFluoroAuxConflict(dayCells, s, section, fluoroAuxConflictRooms));
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
            <div key={i} style={{ background: isPlaceholder ? "#fef08a" : (noTime && !isFuzai ? "#f1f5f9" : "#e0f2fe"), color: isPlaceholder ? "#a16207" : (noTime && !isFuzai ? "#334155" : "#0369a1"), borderRadius: 16, padding: "8px 12px 8px 14px", fontSize: 15, display: "flex", alignItems: isFuzai ? "flex-start" : "center", flexWrap: isFuzai ? "wrap" : "nowrap", gap: 6, border: `1px solid ${isPlaceholder ? "#fde047" : (noTime && !isFuzai ? "#cbd5e1" : "#bae6fd")}`, fontWeight: 700, maxWidth: "100%", minWidth: 0, overflow: "hidden" }}>
              <span>{coreName}</span>
              {(!noTime || isFuzai || isHelp) && (
                <select value={currentMod} onChange={(e: any) => handleTimeChange(i, e.target.value)} style={{ appearance: "none", background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: "inherit", cursor: "pointer", padding: "0 20px 0 6px", minWidth: 0, maxWidth: isFuzai ? 92 : undefined, flexShrink: 1 }}>
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
                const helpMap = dayCells ? parseLooseJsonMap(dayCells["__absenceHelp"]) : {};
                const helpRoomMap = dayCells ? parseLooseJsonMap(dayCells["__absenceHelpRooms"]) : {};
                const foundRm = dayCells ? HELP_RMS.find((r:string) => split(dayCells[r]||"").some((m:string) => extractStaffName(m) === coreName)) : null;
                const foundEntries = foundRm ? split(dayCells[foundRm] || "").filter((m:string) => m.startsWith(foundRm+"枠")) : [];
                const foundEntry = foundEntries.length > 0 ? foundEntries[foundEntries.length - 1] : null;
                const metaTime = helpMap[coreName] || "";
                const metaRoom = helpRoomMap[coreName] || "";
                const displayRoom = foundEntry ? foundRm : (metaTime && metaTime !== "__NO_HELP__" ? metaRoom : "");
                const helpValue = metaTime && metaTime !== "__NO_HELP__" ? metaTime : "";
                return (
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,marginLeft:4,borderLeft:"1px solid #c7d2fe",paddingLeft:6,whiteSpace:"normal",flexWrap:"wrap",overflow:"hidden",maxWidth:"100%",minWidth:0,flex:"1 1 120px"}}>
                    <span style={{fontSize:10.5,color:"#6366f1",fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",maxWidth:96}}>
                      {displayRoom ? roomLinkLabel(displayRoom) : "未設定"}
                    </span>
                    <select value={helpValue} onChange={(e:any)=>{ if (e.target.value) onAddHelp(coreName, e.target.value); else if (onClearHelp) onClearHelp(coreName); }} style={{appearance:"none",background:"transparent",border:"none",outline:"none",fontSize:10.5,fontWeight:800,color:"#6366f1",cursor:"pointer",padding:"0 10px 0 0",minWidth:52,maxWidth:72,flexShrink:0}}>
                      <option value="">補充なし</option>
                      {["(AM)","(PM)","(8:30〜)","(9:00〜)","(9:30〜)","(10:00〜)","(10:30〜)","(11:00〜)","(11:30〜)","(12:00〜)","(12:30〜)","(13:00〜)","(13:30〜)","(14:00〜)","(14:30〜)","(15:00〜)","(15:30〜)","(16:00〜)","(16:30〜)","(17:00〜)"].map((t:string)=><option key={t} value={t}>{t.replace(/[()]/g,"")}</option>)}
                    </select>
                    {helpValue && <span style={{fontSize:10,color:"#7c3aed",fontWeight:700,flexShrink:0}}>補充</span>}
                    {helpValue && onClearHelp && <button type="button" onClick={(e)=>{e.stopPropagation(); onClearHelp(coreName);}} style={{border:"none",background:"transparent",color:"#6366f1",fontSize:10.5,fontWeight:800,cursor:"pointer",padding:0,flexShrink:0}}>解除</button>}
                  </span>
                );
              })()}
              <span onClick={() => handleRemove(i)} style={{ cursor: "pointer", opacity: 0.5, paddingLeft: 6, marginLeft: isFuzai ? "auto" : 0, flexShrink: 0 }}>✖</span>
            </div>
          )
        })}
        {isFuzai && (
          <select value={pendingFuzai} onChange={(e: any) => setPendingFuzai(e.target.value)} style={{ border: "1px dashed #fbbf24", background: "#fffbeb", outline: "none", fontSize: 15, color: "#92400e", cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "8px 12px", minWidth: 90 }}>
            {FUZAI_TIMES.map(t => <option key={t} value={t}>{FUZAI_LABELS[t]}</option>)}
          </select>
        )}
        <select onChange={(e: any) => handleAdd(e.target.value)} value="" style={{ border: "1px dashed #cbd5e1", background: "#f8fafc", outline: "none", fontSize: 15, color: "#475569", flex: 1, minWidth: 100, cursor: "pointer", fontWeight: 600, borderRadius: 8, padding: "8px 24px 8px 12px" }}>
          <option value="">＋{isFuzai ? "不在者を選択" : isHelp ? "ヘルプを追加" : "追加"}</option>
          <optgroup label="スタッフ">{selectableStaff.map((s: string) => <option key={s} value={s}>{s}</option>)}</optgroup>
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
  logInfo: string[] = []; staffAssignments: {staff: string, section: string}[] = []; lateShiftAssigned: Set<string> = new Set();
  
  constructor(day: DayData, prevDay: DayData | null, pastDaysInMonth: DayData[], pastDaysInWeek: DayData[], ctx: AutoAssignContext, isSmartFix: boolean = false) {
    this.day = { ...day }; this.prevDay = prevDay; this.pastDaysInMonth = pastDaysInMonth; this.pastDaysInWeek = pastDaysInWeek; const safeRules = sanitizeRulesInput(ctx.customRules); this.ctx = { ...ctx, customRules: safeRules }; this.dayCells = { ...day.cells }; this.dynamicCapacity = { ...(safeRules.capacity || {}) }; this.isSmartFix = isSmartFix;
  }
  
  private log(msg: string) { this.logInfo.push(`・${msg}`); } 
  private logPhase(phaseName: string) { this.logInfo.push(`・■${phaseName}`); }
  
  getPastRoomCount(s: string, r: string) { const isM = ["CT", "MRI", "MMG"].includes(r); const pds = isM ? this.pastDaysInMonth : this.pastDaysInWeek; return pds.filter(pd => split(pd.cells[r] || "").map(extractStaffName).includes(s)).length; }
  getPastLateShiftCount(s: string) { let c = 0; this.pastDaysInMonth.forEach(pd => { Object.values(pd.cells).forEach(val => { split(val as string).forEach(m => { if (extractStaffName(m) === s && (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:"))) c++; }); }); }); return c; }
  getTodayRoomCount(s: string) { let c = 0; Object.keys(this.dayCells).forEach(sec => { if (this.isMetadataKey(sec) || REST_SECTIONS.includes(sec) || ["待機", "昼当番", "受付", "受付ヘルプ"].includes(sec)) return; split(this.dayCells[sec]).forEach(m => { if (extractStaffName(m) === s && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:")) c++; }); }); return c; }
  getTodayRoomLoad(s: string) { let c = 0; Object.keys(this.dayCells).forEach(sec => { if (this.isMetadataKey(sec) || REST_SECTIONS.includes(sec) || ["待機", "昼当番", "受付", "受付ヘルプ"].includes(sec)) return; split(this.dayCells[sec]).forEach(m => { if (extractStaffName(m) === s && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:")) c += getStaffAmount(m); }); }); return c; }
  getStaffTimeCounts(s: string) { let am = 0; let pm = 0; Object.keys(this.dayCells).forEach(sec => { if (this.isMetadataKey(sec) || ["待機","昼当番","受付","受付ヘルプ"].includes(sec) || REST_SECTIONS.includes(sec)) return; split(this.dayCells[sec]).forEach(m => { if (extractStaffName(m) === s) { if (m.includes("(AM)")) am++; else if (m.includes("(PM)")) pm++; else { am++; pm++; } } }); }); return { am, pm }; }
  private getAssignedUsage(staff: string): number { const counts = this.getStaffTimeCounts(staff); return (counts.am > 0 ? 0.5 : 0) + (counts.pm > 0 ? 0.5 : 0); }
  private isUnassignedForRelief(staff: string, tag: string): boolean { const counts = this.getStaffTimeCounts(staff); if (tag === "(AM)") return counts.am === 0; if (tag === "(PM)") return counts.pm === 0; return counts.am === 0 && counts.pm === 0; }
  
  isUsed(name: string): boolean { return (this.assignCounts[name] || 0) >= (this.maxAssigns[name] || 1); } 
  addUsage(name: string, _f = 1): void { this.assignCounts[name] = this.getAssignedUsage(name); } 
  private mergeBlockState(current: string | undefined, am: boolean, pm: boolean): string {
    if (current === 'ALL') return 'ALL';
    const hasAm = current === 'AM' || am;
    const hasPm = current === 'PM' || pm;
    if (hasAm && hasPm) return 'ALL';
    if (hasAm) return 'AM';
    if (hasPm) return 'PM';
    return 'NONE';
  }
  private refreshAssignmentState(): void {
    this.ctx.allStaff.forEach(s => { this.assignCounts[s] = this.getAssignedUsage(s); this.blockMap.set(s, 'NONE'); });
    ["明け","入り","土日休日代休"].forEach(sec => { split(this.dayCells[sec] || "").forEach(m => this.blockMap.set(extractStaffName(m), 'ALL')); });
    split(this.dayCells["不在"] || "").forEach(m => {
      const core = extractStaffName(m);
      if (m.includes("(AM)")) this.blockMap.set(core, this.mergeBlockState(this.blockMap.get(core), true, false));
      else if (m.includes("(PM)")) this.blockMap.set(core, this.mergeBlockState(this.blockMap.get(core), false, true));
      else if (m.match(/\(〜\d/)) this.blockMap.set(core, this.mergeBlockState(this.blockMap.get(core), true, false));
      else if (m.match(/\(\d.*〜\)/)) this.blockMap.set(core, this.mergeBlockState(this.blockMap.get(core), false, true));
      else this.blockMap.set(core, 'ALL');
    });
    WORK_SECTIONS.forEach(sec => {
      if (this.isMetadataKey(sec) || ["待機", "昼当番", "受付ヘルプ"].includes(sec) || REST_SECTIONS.includes(sec)) return;
      split(this.dayCells[sec] || "").forEach(m => {
        const core = extractStaffName(m);
        if (ROLE_PLACEHOLDERS.includes(core) || this.blockMap.get(core) === 'ALL') return;
        if (m.includes("(AM)")) this.blockMap.set(core, this.mergeBlockState(this.blockMap.get(core), true, false));
        else if (m.includes("(PM)") || m.includes("(17:") || m.includes("(18:") || m.includes("(19:") || m.includes("(22:")) this.blockMap.set(core, this.mergeBlockState(this.blockMap.get(core), false, true));
        else this.blockMap.set(core, 'ALL');
      });
    });
  }
  isForbidden(staff: string, section: string): boolean { return (this.ctx.customRules.forbidden || []).some((rule: any) => extractStaffName(rule.staff) === extractStaffName(staff) && split(rule.sections).includes(section)); } 
  hasNGPair(candidate: string, members: string[], checkSoft: boolean): boolean { return members.some(member => (this.ctx.customRules.ngPairs || []).some((ng: any) => { const match = (extractStaffName(ng.s1) === extractStaffName(candidate) && extractStaffName(ng.s2) === extractStaffName(member)) || (extractStaffName(ng.s1) === extractStaffName(member) && extractStaffName(ng.s2) === extractStaffName(candidate)); if (!match) return false; if ((ng.level || "hard") === "hard") return true; if ((ng.level || "hard") === "soft" && checkSoft) return true; return false; })); }
  
  isFullDayOnly(r: string) { return split(this.ctx.customRules.fullDayOnlyRooms || "").includes(r); }
  isTimeTagBlockedByFullDayRule(r: string, tag: string) {
    const normalized = (tag || "").trim();
    if (!this.isFullDayOnly(r)) return false;
    if (!normalized || normalized === 'NONE' || normalized === 'ALL') return false;
    return normalized.includes("AM") || normalized.includes("PM") || normalized.includes("〜");
  }
  private getPreferredWorkTag(staff: string): string {
    const exactTag = this.timeTagMap.get(staff);
    if (exactTag) return exactTag;
    const block = this.blockMap.get(staff);
    if (block === 'AM') return "(PM)";
    if (block === 'PM') return "(AM)";
    return "";
  }
  private getMemberTimeTag(entry: string): string {
    const core = extractStaffName(entry);
    return entry.substring(core.length);
  }
  private getPortableTag(staff: string): string {
    return this.getPreferredWorkTag(staff);
  }
  private isLateOrNightEntry(entry: string): boolean {
    return entry.includes("17:") || entry.includes("18:") || entry.includes("19:") || entry.includes("22:");
  }

  private normalizePortableSourceCond(src: string): { r: string; min: number } | null {
    const cond = parseRoomCond(src);
    if (!cond.r || cond.r === "ポータブル" || cond.r === "透析後胸部") return null;
    // ポータブルは「兼務候補部屋」閉域で扱う。MRI/治療/RIからの直接補充はしない。
    if (["MRI", "治療", "RI", "受付", "受付ヘルプ", "昼当番", "待機"].includes(cond.r)) return null;
    // CT は4人体制の余剰枠だけを候補にする。CT3人体制からは持ってこない。
    if (cond.r === "CT" && cond.min < 4) return { r: "CT", min: 4 };
    return { r: cond.r, min: cond.min };
  }

  private getPortableSourceConds(): { r: string; min: number }[] {
    const raw: string[] = [];
    (this.ctx.customRules.linkedRooms || [])
      .filter((rule: any) => rule.target === "ポータブル")
      .forEach((rule: any) => split(rule.sources || "").forEach((src: string) => raw.push(src)));
    (this.ctx.customRules.rescueRules || [])
      .filter((rule: any) => rule.targetRoom === "ポータブル")
      .forEach((rule: any) => split(rule.sourceRooms || "").forEach((src: string) => raw.push(src)));
    if (raw.length === 0) raw.push("3号室", "2号室", "1号室", "5号室", "CT(4)");

    const result: { r: string; min: number }[] = [];
    const seen = new Set<string>();
    raw.forEach(src => {
      const cond = this.normalizePortableSourceCond(src);
      if (!cond) return;
      const key = `${cond.r}:${cond.min}`;
      if (seen.has(key)) return;
      seen.add(key);
      result.push(cond);
    });
    return result;
  }

  private sourceAmount(room: string): number {
    return split(this.dayCells[room] || "").reduce((sum, m) => sum + getStaffAmount(m), 0);
  }

  private isPortableSourceAvailable(cond: { r: string; min: number }, allowClearedThree: boolean = false): boolean {
    if (!cond.r || cond.r === "ポータブル" || cond.r === "透析後胸部") return false;
    if (this.skipSections.includes(cond.r) && !(allowClearedThree && cond.r === "3号室")) return false;
    if (this.shouldSkipAutoAssignRoom(cond.r)) return false;
    if (cond.r === "CT" && this.sourceAmount("CT") < Math.max(cond.min, 4)) return false;
    if (cond.min > 0 && this.sourceAmount(cond.r) < cond.min) return false;
    return true;
  }

  private getRoomsForStaff(core: string): string[] {
    return ROOM_SECTIONS.filter(r =>
      !["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r) &&
      split(this.dayCells[r] || "").some(m => extractStaffName(m) === core)
    );
  }

  private isFixedToRoom(core: string, room: string): boolean {
    return (this.ctx.customRules.fixed || []).some((rule: any) =>
      extractStaffName(rule.staff) === extractStaffName(core) && rule.section === room
    );
  }

  private isProtectedModalityStaff(core: string, room: string): boolean {
    if (!["CT", "MRI", "治療", "RI"].includes(room)) return false;
    if (this.isFixedToRoom(core, room)) return true;
    return isMonthlyMainStaff(room, core, this.ctx.monthlyAssign);
  }

  private isProtectedInCurrentModality(core: string): boolean {
    return this.getRoomsForStaff(core).some(room => this.isProtectedModalityStaff(core, room));
  }

  private canPlaceEntryInRoomStrict(core: string, entry: string, room: string, members: string[]): boolean {
    if (!core || ROLE_PLACEHOLDERS.includes(core)) return false;
    if (this.isLateOrNightEntry(entry)) return false;
    if (this.isForbidden(core, room) || this.isHalfDayBlocked(core, room).hard) return false;
    if (this.hasNGPair(core, members.filter(m => extractStaffName(m) !== core).map(extractStaffName), false)) return false;
    if (this.isTimeTagBlockedByFullDayRule(room, entry)) return false;
    return true;
  }

  private canUseEntryForPortable(
    core: string,
    entry: string,
    portableMembers: string[],
    currentIndex: number = -1,
    allowWeeklyRepeat: boolean = true,
    allowConsecutive: boolean = false
  ): boolean {
    if (!this.canPlaceEntryInRoomStrict(core, entry, "ポータブル", portableMembers.filter((_, idx) => idx !== currentIndex))) return false;
    // ポータブルは「連日なし・週1」を強く優先。ただし少人数日の最終救済では候補部屋内に限って緩和する。
    if (!allowConsecutive && this.shouldAvoidConsecutive(core, "ポータブル")) return false;
    if (!allowWeeklyRepeat && this.shouldAvoidWeeklyRepeat(core, "ポータブル")) return false;
    const otherPortableCores = portableMembers
      .filter((_, idx) => idx !== currentIndex)
      .map(extractStaffName);
    if (otherPortableCores.includes(core)) return false;
    if (this.hasNGPair(core, otherPortableCores, false)) return false;
    return this.canAddKenmu(core, "ポータブル", true);
  }

  private getPortableSourceInfo(core: string, allowClearedThree: boolean = false): { idx: number; room: string; entry: string; members: string[] } | null {
    const sources = this.getPortableSourceConds();
    for (let idx = 0; idx < sources.length; idx++) {
      const cond = sources[idx];
      if (!this.isPortableSourceAvailable(cond, allowClearedThree)) continue;
      const members = split(this.dayCells[cond.r] || "");
      const entry = members.find(m => extractStaffName(m) === core) || "";
      if (entry) return { idx, room: cond.r, entry, members };
    }
    return null;
  }

  private tryAttachPortableOnlyToSource(core: string, entry: string): string | null {
    if (this.isProtectedInCurrentModality(core)) return null;
    const sources = this.getPortableSourceConds();
    const ordered = [
      ...sources.filter(s => s.r === "3号室"),
      ...sources.filter(s => s.r !== "3号室")
    ];

    for (const cond of ordered) {
      const allowClearedThree = cond.r === "3号室";
      if (!this.isPortableSourceAvailable({ ...cond, min: 0 }, allowClearedThree)) continue;
      if (cond.r === "CT" && this.sourceAmount("CT") < 4) continue;
      const members = split(this.dayCells[cond.r] || "");
      if (members.some(m => extractStaffName(m) === core)) return cond.r;
      const baseCap = this.dynamicCapacity[cond.r] ?? (["CT", "MRI", "治療"].includes(cond.r) ? 3 : 1);
      const eff = this.getEffectiveTarget(cond.r, baseCap);
      if (eff.allClosed) continue;
      if (members.reduce((sum, m) => sum + getStaffAmount(m), 0) >= eff.cap) continue;
      if (!this.canPlaceEntryInRoomStrict(core, entry, cond.r, members)) continue;
      if (!this.canAddKenmu(core, cond.r, true)) continue;
      this.dayCells[cond.r] = join([...members, entry]);
      this.refreshAssignmentState();
      this.log(`🔒 [ポータブル閉域] ${entry} を ${cond.r} にも配置し、ポータブルを候補部屋由来に正規化しました`);
      return cond.r;
    }
    return null;
  }

  private findPortableStrictSourceCandidate(
    portableMembers: string[],
    currentIndex: number,
    options: { allowWeeklyRepeat?: boolean; allowConsecutive?: boolean; maxSourceIndex?: number } = {}
  ): { entry: string; sourceRoom: string; sourceIndex: number; staff: string } | null {
    const allowWeeklyRepeat = options.allowWeeklyRepeat ?? true;
    const allowConsecutive = options.allowConsecutive ?? false;
    const maxSourceIndex = options.maxSourceIndex ?? Infinity;
    const sources = this.getPortableSourceConds();
    const candidates: { entry: string; sourceRoom: string; sourceIndex: number; staff: string }[] = [];

    sources.forEach((cond, sourceIndex) => {
      if (sourceIndex >= maxSourceIndex) return;
      if (!this.isPortableSourceAvailable(cond, false)) return;
      const sourceMembers = split(this.dayCells[cond.r] || "");
      sourceMembers.forEach(entry => {
        const staff = extractStaffName(entry);
        // MRI/治療/RIなどの専従・月間主担当が別途候補部屋に紛れ込んでいても、ポータブル直行にはしない。
        // ただし CT(4) は明示された候補元なので、4人体制を満たす場合だけ候補として残す。
        if (cond.r !== "CT" && this.isProtectedInCurrentModality(staff)) return;
        if (!this.canUseEntryForPortable(staff, entry, portableMembers, currentIndex, allowWeeklyRepeat, allowConsecutive)) return;
        candidates.push({ entry, sourceRoom: cond.r, sourceIndex, staff });
      });
    });

    candidates.sort((a, b) =>
      // まず設定された候補部屋の順番を絶対優先する。
      a.sourceIndex - b.sourceIndex ||
      // 同じ候補部屋内では、週内2回目・月内過多・当日負荷をなるべく避ける。
      this.getRepeatAvoidPenalty(a.staff, "ポータブル") - this.getRepeatAvoidPenalty(b.staff, "ポータブル") ||
      this.getTodayRoomCount(a.staff) - this.getTodayRoomCount(b.staff) ||
      this.getPastRoomCount(a.staff, "ポータブル") - this.getPastRoomCount(b.staff, "ポータブル") ||
      a.staff.localeCompare(b.staff, "ja")
    );
    return candidates[0] || null;
  }

  private tryPortableModalitySourceSwap(
    portableMembers: string[],
    currentIndex: number,
    options: { allowWeeklyRepeat?: boolean; allowConsecutive?: boolean; maxSourceIndex?: number } = {}
  ): { entry: string; sourceRoom: string; sourceIndex: number; modalityRoom: string; modalityStaff: string; sourceStaff: string } | null {
    const allowWeeklyRepeat = options.allowWeeklyRepeat ?? true;
    const allowConsecutive = options.allowConsecutive ?? false;
    const maxSourceIndex = options.maxSourceIndex ?? Infinity;
    const sources = this.getPortableSourceConds();
    const modalityRooms = ["MRI", "CT"].filter(room => !this.skipSections.includes(room) && !this.shouldSkipAutoAssignRoom(room));

    for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
      if (sourceIndex >= maxSourceIndex) break;
      const cond = sources[sourceIndex];
      if (!this.isPortableSourceAvailable(cond, false)) continue;
      const sourceMembers = split(this.dayCells[cond.r] || "");
      for (const sourceEntry of sourceMembers) {
        const sourceStaff = extractStaffName(sourceEntry);
        if (!sourceStaff || ROLE_PLACEHOLDERS.includes(sourceStaff) || this.isLateOrNightEntry(sourceEntry)) continue;

        for (const modalityRoom of modalityRooms) {
          const modalityMembers = split(this.dayCells[modalityRoom] || "");
          for (const modalityEntry of modalityMembers) {
            const modalityStaff = extractStaffName(modalityEntry);
            if (!modalityStaff || ROLE_PLACEHOLDERS.includes(modalityStaff) || modalityStaff === sourceStaff || this.isLateOrNightEntry(modalityEntry)) continue;
            // CT/MRIの固定者・月間主担当は交換で崩さない。非専従者だけを一般候補部屋へ動かす。
            if (this.isProtectedModalityStaff(modalityStaff, modalityRoom)) continue;

            const sourceTag = this.getMemberTimeTag(sourceEntry);
            const modalityTag = this.getMemberTimeTag(modalityEntry);
            const movedSourceToModality = `${sourceStaff}${modalityTag}`;
            const movedModalityToSource = `${modalityStaff}${sourceTag}`;
            const nextSourceMembers = sourceMembers.map(m => m === sourceEntry ? movedModalityToSource : m);
            const nextModalityMembers = modalityMembers.map(m => m === modalityEntry ? movedSourceToModality : m);

            if (!this.canPlaceEntryInRoomStrict(sourceStaff, movedSourceToModality, modalityRoom, nextModalityMembers)) continue;
            if (!this.canPlaceEntryInRoomStrict(modalityStaff, movedModalityToSource, cond.r, nextSourceMembers)) continue;
            if (!this.canUseEntryForPortable(modalityStaff, movedModalityToSource, portableMembers, currentIndex, allowWeeklyRepeat, allowConsecutive)) continue;
            if (!this.canSwapKeepKenmuLimit(sourceStaff, modalityRoom, cond.r, sourceEntry, movedSourceToModality)) continue;
            if (!this.canSwapKeepKenmuLimit(modalityStaff, cond.r, modalityRoom, modalityEntry, movedModalityToSource)) continue;

            this.dayCells[cond.r] = join(nextSourceMembers);
            this.dayCells[modalityRoom] = join(nextModalityMembers);
            this.refreshAssignmentState();
            this.log(`🔁 [ポータブル閉域交換] ${cond.r} の ${sourceStaff} と ${modalityRoom} の非専従 ${modalityStaff} を交換し、${modalityStaff} を候補部屋由来のポータブル候補にしました`);
            return { entry: movedModalityToSource, sourceRoom: cond.r, sourceIndex, modalityRoom, modalityStaff, sourceStaff };
          }
        }
      }
    }
    return null;
  }

  private enforcePortableClosedSourcePolicy() {
    if (this.skipSections.includes("ポータブル") || this.shouldSkipAutoAssignRoom("ポータブル")) return;
    let portableMembers = split(this.dayCells["ポータブル"] || "");
    if (portableMembers.length === 0) return;

    let changed = false;
    for (let i = 0; i < portableMembers.length; i++) {
      const entry = portableMembers[i];
      const core = extractStaffName(entry);
      if (!core || ROLE_PLACEHOLDERS.includes(core)) continue;

      const sourceInfo = this.getPortableSourceInfo(core, true);
      const protectedModalityLeak = !!sourceInfo && sourceInfo.room !== "CT" && this.isProtectedInCurrentModality(core);
      const isValidSourceMember = !!sourceInfo && !protectedModalityLeak && this.canUseEntryForPortable(core, entry, portableMembers, i, true);
      if (isValidSourceMember) continue;

      const canUseCurrentForPortable = this.canUseEntryForPortable(core, entry, portableMembers, i, true);
      const attachedRoom = canUseCurrentForPortable ? this.tryAttachPortableOnlyToSource(core, entry) : null;
      if (attachedRoom) {
        changed = true;
        portableMembers = split(this.dayCells["ポータブル"] || "");
        continue;
      }

      // 第1候補：設定された候補部屋の優先順から、連日なし・週内初回の人を使う。
      const directNonWeekly = this.findPortableStrictSourceCandidate(portableMembers, i, { allowWeeklyRepeat: false });
      if (directNonWeekly) {
        portableMembers[i] = directNonWeekly.entry;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`🔒 [ポータブル閉域] 候補外の ${entry} を使わず、設定順 ${directNonWeekly.sourceRoom} 由来の ${directNonWeekly.entry} に差し替えました`);
        changed = true;
        continue;
      }

      // 第2候補：候補部屋の人が禁止・連日・週内重複で難しい場合、CT/MRIの非専従者と候補部屋の人を交換する。
      const swappedNonWeekly = this.tryPortableModalitySourceSwap(portableMembers, i, { allowWeeklyRepeat: false });
      if (swappedNonWeekly) {
        portableMembers[i] = swappedNonWeekly.entry;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`🔒 [ポータブル閉域] MRI/CTから直接補充せず、${swappedNonWeekly.sourceRoom} と ${swappedNonWeekly.modalityRoom} の交換後に ${swappedNonWeekly.entry} をポータブルへ配置しました`);
        changed = true;
        continue;
      }

      // 第3候補：交換しても無理なら、連日だけは避けたうえで週内2回目を許容する。
      const directWeekly = this.findPortableStrictSourceCandidate(portableMembers, i, { allowWeeklyRepeat: true });
      if (directWeekly) {
        portableMembers[i] = directWeekly.entry;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`⚠️ [ポータブル週内再担当] 交換でも候補がないため、連日ではない ${directWeekly.sourceRoom} 由来の ${directWeekly.entry} を週内2回目候補として配置しました`);
        changed = true;
        continue;
      }

      const swappedWeekly = this.tryPortableModalitySourceSwap(portableMembers, i, { allowWeeklyRepeat: true });
      if (swappedWeekly) {
        portableMembers[i] = swappedWeekly.entry;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`⚠️ [ポータブル週内再担当交換] 週内初回では埋まらないため、${swappedWeekly.sourceRoom} と ${swappedWeekly.modalityRoom} を交換して ${swappedWeekly.entry} を配置しました`);
        changed = true;
        continue;
      }

      // 第4候補：それでも人がいない場合のみ、候補部屋内に限って連日ポータブルを最終救済で許容する。
      const directConsecutive = this.findPortableStrictSourceCandidate(portableMembers, i, { allowWeeklyRepeat: true, allowConsecutive: true });
      if (directConsecutive) {
        portableMembers[i] = directConsecutive.entry;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`⚠️ [ポータブル最終救済] 候補部屋内で他に解がないため、${directConsecutive.sourceRoom} 由来の ${directConsecutive.entry} を連日/週内再担当も含めて許容しました`);
        changed = true;
        continue;
      }

      const swappedConsecutive = this.tryPortableModalitySourceSwap(portableMembers, i, { allowWeeklyRepeat: true, allowConsecutive: true });
      if (swappedConsecutive) {
        portableMembers[i] = swappedConsecutive.entry;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`⚠️ [ポータブル最終救済交換] 候補部屋内で他に解がないため、${swappedConsecutive.sourceRoom} と ${swappedConsecutive.modalityRoom} を交換して ${swappedConsecutive.entry} を配置しました`);
        changed = true;
        continue;
      }

      portableMembers.splice(i, 1);
      i--;
      this.dayCells["ポータブル"] = join(portableMembers);
      this.refreshAssignmentState();
      this.log(`🚫 [ポータブル閉域] ${entry} は候補部屋由来にできず、MRI/CT直取りや禁止者配置を避けるためポータブルから外しました`);
      changed = true;
    }

    if (changed) {
      this.dayCells["ポータブル"] = join(portableMembers);
      this.refreshAssignmentState();
    }
  }

  private isMetadataKey(sec: string) { return sec.startsWith("__"); }
  private hhmmToMinutes(s: string) { const [h, m] = s.split(":").map(Number); return h * 60 + m; }
  private isLunchAvailable(staff: string): boolean {
    const entry = split(this.dayCells["不在"] || "").find(m => extractStaffName(m) === staff);
    if (!entry) return true;
    if (!entry.includes("(")) return false;
    if (entry.includes("(PM)")) return false;
    const until = entry.match(/\(〜(\d+:\d+)\)/)?.[1];
    if (until) return this.hhmmToMinutes(until) <= (12 * 60 + 15);
    const from = entry.match(/\((\d+:\d+)〜\)/)?.[1];
    if (from) return this.hhmmToMinutes(from) >= (13 * 60);
    return !entry.includes("(AM)");
  }

  private isHalfDayBlocked(staff: string, section: string): { hard: boolean; monthlyHalfException: boolean } {
    const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? "");
    if (!fullDayOnlyList.includes(section)) return { hard: false, monthlyHalfException: false };
    const entry = split(this.dayCells["不在"] || "").find(m => extractStaffName(m) === staff);
    if (!entry) return { hard: false, monthlyHalfException: false };
    const isPartial = entry.includes("(AM)") || entry.includes("(PM)") || entry.includes("〜");
    if (!isPartial) return { hard: false, monthlyHalfException: false };
    return { hard: true, monthlyHalfException: false };
  }
  private hasPmAbsence(staff: string): boolean {
    const entry = split(this.dayCells["不在"] || "").find(m => extractStaffName(m) === extractStaffName(staff));
    if (!entry) return false;
    if (entry.includes("(PM)")) return true;
    const from = entry.match(/\((\d+:\d+)〜\)/)?.[1];
    return !!from && this.hhmmToMinutes(from) < (17 * 60);
  }
  private getPastWeekRoomCount(s: string, r: string): number { return this.pastDaysInWeek.filter(pd => split(pd.cells[r] || "").map(extractStaffName).includes(s)).length; }
  private getPastMonthRoomCount(s: string, r: string): number { return this.pastDaysInMonth.filter(pd => split(pd.cells[r] || "").map(extractStaffName).includes(s)).length; }
  private shouldAvoidConsecutive(s: string, r: string): boolean { const noC = split(this.ctx.customRules.noConsecutiveRooms || ""); if (!this.prevDay || !noC.includes(r)) return false; return split(this.prevDay.cells[r] || "").map(extractStaffName).includes(s); }
  private shouldAvoidWeeklyRepeat(s: string, r: string): boolean { const noC = split(this.ctx.customRules.noConsecutiveRooms || ""); if (!noC.includes(r)) return false; return this.getPastWeekRoomCount(s, r) >= 1; }
  private getRoomDependencyCount(r: string): number { let sc = 0; (this.ctx.customRules.linkedRooms || []).forEach((x: any) => { if (split(x.sources || "").some((y: string) => parseRoomCond(y).r === r)) sc += 3; if (x.target === r) sc += 1; }); (this.ctx.customRules.rescueRules || []).forEach((x: any) => { if (split(x.sourceRooms || "").some((y: string) => parseRoomCond(y).r === r)) sc += 2; if (x.targetRoom === r) sc += 1; }); (this.ctx.customRules.swapRules || []).forEach((x: any) => { if (split(x.sourceRooms || "").some((y: string) => parseRoomCond(y).r === r)) sc += 2; if (x.triggerRoom === r) sc += 1; if (x.targetRoom === r) sc += 1; }); (this.ctx.customRules.kenmuPairs || []).forEach((p: any) => { if (p.s1 === r || p.s2 === r) sc += 2; }); return sc; }
  private getRescueSourceScore(src: string, tgt: string, _st?: string): number { let sc = 0; if (src === tgt) sc += 9999; sc += this.getRoomDependencyCount(src) * 100; const sm = split(this.dayCells[src] || ""); const sList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName); const isOnly = sm.length > 0 && sm.every(m => sList.includes(extractStaffName(m))); if (isOnly) sc += 5000; else { const amt = sm.reduce((sum, m) => sum + getStaffAmount(m), 0); if (amt <= 1) sc += 500; else if (amt <= 2) sc += 200; } if (this.clearSections.includes(src) || this.skipSections.includes(src)) sc += 5000; return sc; }
  private getRepeatAvoidPenalty(staff: string, room: string): number { const noC = split(this.ctx.customRules.noConsecutiveRooms || ""); if (!noC.includes(room)) return 0; if (this.shouldAvoidConsecutive(staff, room)) return 100000; return (this.shouldAvoidWeeklyRepeat(staff, room) ? 300 : 0) + this.getPastMonthRoomCount(staff, room) * 50; }
  private preferNonRepeatCandidates<T>(items: T[], room: string, getStaff: (item: T) => string): T[] { const noConsecutive = items.filter(item => !this.shouldAvoidConsecutive(getStaff(item), room)); const base = noConsecutive.length > 0 ? noConsecutive : items; const noWeekly = base.filter(item => !this.shouldAvoidWeeklyRepeat(getStaff(item), room)); return noWeekly.length > 0 ? noWeekly : base; }
  // fullDayOnlyRooms は「半日・AM/PM配置を避ける部屋」として扱い、兼務自体はここでは禁止しない。
  private getPushOutRoomScore(staff: string, room: string): number { const baseCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1); const eff = this.getEffectiveTarget(room, baseCap); if (eff.allClosed) return 999999; const roomMembers = split(this.dayCells[room]); let roomAm = eff.amClosed ? 999 : 0; let roomPm = eff.pmClosed ? 999 : 0; roomMembers.forEach(m => { if (m.includes("(AM)")) roomAm++; else if (m.includes("(PM)")) roomPm++; else { roomAm++; roomPm++; } }); const fullness = Math.min(roomAm, eff.cap) + Math.min(roomPm, eff.cap); return this.getRepeatAvoidPenalty(staff, room) * 10 + fullness * 100 + roomMembers.length; }
  private releaseSupportPartnerForEmptyRoom(targetRoom: string) {
    if (!targetRoom || this.skipSections.includes(targetRoom) || targetRoom === "透析後胸部" || this.shouldSkipAutoAssignRoom(targetRoom)) return;
    const supportStaff = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName);
    const supportRooms = split(this.ctx.customRules.supportTargetRooms || "");
    if (!supportStaff.length || !supportRooms.length) return;
    const baseCap = this.dynamicCapacity[targetRoom] ?? (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
    const eff = this.getEffectiveTarget(targetRoom, baseCap);
    if (eff.allClosed) return;

    const sourceRooms = Array.from(new Set(supportRooms)).filter((r: string) => r && r !== targetRoom);
    if (!sourceRooms.length) return;

    const hasSupportRemaining = (members: string[]) => members.some(m => supportStaff.includes(extractStaffName(m)));
    let targetMembers = split(this.dayCells[targetRoom] || "");

    // targetRoom が空いている場合は、支援部屋（例: 支援スタッフ＋一般スタッフ）から相方を「移動」して空室を先に埋める。
    if (targetMembers.length === 0) {
      for (const sourceRoom of sourceRooms) {
        if (this.skipSections.includes(sourceRoom) || this.shouldSkipAutoAssignRoom(sourceRoom)) continue;
        const sourceMembers = split(this.dayCells[sourceRoom] || "");
        if (!hasSupportRemaining(sourceMembers)) continue;
        const movable = sourceMembers.find(entry => {
          const core = extractStaffName(entry);
          if (supportStaff.includes(core) || ROLE_PLACEHOLDERS.includes(core) || entry.includes("17:") || entry.includes("19:")) return false;
          if (this.isForbidden(core, targetRoom) || this.isHalfDayBlocked(core, targetRoom).hard) return false;
          if (this.isTimeTagBlockedByFullDayRule(targetRoom, entry)) return false;
          return sourceMembers.filter(m => m !== entry).some(m => supportStaff.includes(extractStaffName(m)));
        });
        if (movable) {
          this.dayCells[sourceRoom] = join(sourceMembers.filter(m => m !== movable));
          this.dayCells[targetRoom] = movable;
          this.log(`🧩 [サポート最終整理] ${sourceRoom} は支援スタッフのみで維持し、${extractStaffName(movable)} を ${targetRoom} に移動しました`);
          this.refreshAssignmentState();
          return;
        }
      }
    }

    // 既に支援対象部屋の担当者を targetRoom に兼務追加してしまっている場合は、支援対象部屋側から外して「支援スタッフだけ」に戻す。
    for (const sourceRoom of sourceRooms) {
      if (this.skipSections.includes(sourceRoom) || this.shouldSkipAutoAssignRoom(sourceRoom)) continue;
      const sourceMembers = split(this.dayCells[sourceRoom] || "");
      if (!hasSupportRemaining(sourceMembers)) continue;
      const duplicate = sourceMembers.find(m => {
        const core = extractStaffName(m);
        return !supportStaff.includes(core) && targetMembers.some(tm => extractStaffName(tm) === core);
      });
      if (duplicate && sourceMembers.filter(m => m !== duplicate).some(m => supportStaff.includes(extractStaffName(m)))) {
        this.dayCells[sourceRoom] = join(sourceMembers.filter(m => m !== duplicate));
        this.log(`↪️ [サポート最終整理] ${extractStaffName(duplicate)} は ${targetRoom} 側に残し、${sourceRoom} は支援スタッフのみで維持しました`);
        this.refreshAssignmentState();
        targetMembers = split(this.dayCells[targetRoom] || "");
      }
    }

    let cA = eff.amClosed ? 999 : 0;
    let cP = eff.pmClosed ? 999 : 0;
    targetMembers.forEach(m => {
      if (m.includes("(AM)")) cA++;
      else if (m.includes("(PM)")) cP++;
      else { cA++; cP++; }
    });
    if (cA >= baseCap && cP >= baseCap) return;

    const candidates: { sourceRoom: string; entry: string; targetEntry: string }[] = [];
    for (const sourceRoom of sourceRooms) {
      if (this.skipSections.includes(sourceRoom) || this.shouldSkipAutoAssignRoom(sourceRoom)) continue;
      const sourceMembers = split(this.dayCells[sourceRoom] || "");
      if (!hasSupportRemaining(sourceMembers)) continue;
      sourceMembers.forEach(entry => {
        const core = extractStaffName(entry);
        if (supportStaff.includes(core) || ROLE_PLACEHOLDERS.includes(core) || entry.includes("17:") || entry.includes("19:")) return;
        if (targetMembers.some(m => extractStaffName(m) === core)) return;
        if (this.isForbidden(core, targetRoom) || this.isHalfDayBlocked(core, targetRoom).hard || this.hasNGPair(core, targetMembers.map(extractStaffName), false)) return;
        let targetEntry = entry;
        if (cA < baseCap && cP >= baseCap) { if (entry.includes("(PM)")) return; targetEntry = `${core}(AM)`; }
        else if (cA >= baseCap && cP < baseCap) { if (entry.includes("(AM)")) return; targetEntry = `${core}(PM)`; }
        else if (eff.pmClosed) { if (entry.includes("(PM)")) return; targetEntry = `${core}(AM)`; }
        else if (eff.amClosed) { if (entry.includes("(AM)")) return; targetEntry = `${core}(PM)`; }
        if (this.isTimeTagBlockedByFullDayRule(targetRoom, targetEntry)) return;
        candidates.push({ sourceRoom, entry, targetEntry });
      });
    }
    candidates.sort((a, b) => this.getTodayRoomLoad(extractStaffName(a.entry)) - this.getTodayRoomLoad(extractStaffName(b.entry)) || this.getPastRoomCount(extractStaffName(a.entry), targetRoom) - this.getPastRoomCount(extractStaffName(b.entry), targetRoom));
    const picked = candidates[0];
    if (!picked) return;
    const sourceMembers = split(this.dayCells[picked.sourceRoom] || "");
    const remainingSource = sourceMembers.filter(m => m !== picked.entry);
    if (!remainingSource.some(m => supportStaff.includes(extractStaffName(m)))) return;
    this.dayCells[picked.sourceRoom] = join(remainingSource);
    this.dayCells[targetRoom] = join([...targetMembers, picked.targetEntry]);
    this.log(`🧩 [サポート最終整理] ${picked.sourceRoom} は支援スタッフのみで維持し、${extractStaffName(picked.entry)} を ${targetRoom} に移動しました`);
    this.refreshAssignmentState();
  }

  private releaseSupportPartnersForEmptyRooms(targetRooms: string[] = ["1号室", "5号室"]) {
    targetRooms.forEach(room => this.releaseSupportPartnerForEmptyRoom(room));
  }

  private placeSupportStaffAsLastResort() {
    const supportStaff = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName);
    const supportRooms = split(this.ctx.customRules.supportTargetRooms || "");
    if (!supportStaff.length || !supportRooms.length) return;
    this.initialAvailSupport.forEach(staff => {
      if (!supportStaff.includes(extractStaffName(staff)) || this.isUsed(staff) || this.blockMap.get(staff) === 'ALL') return;
      const tag = this.getPreferredWorkTag(staff);
      for (const rm of supportRooms) {
        if (this.skipSections.includes(rm) || rm === "透析後胸部" || this.shouldSkipAutoAssignRoom(rm) || this.isForbidden(staff, rm)) continue;
        if (split(this.dayCells[rm] || "").length > 0) continue;
        const eff = this.getEffectiveTarget(rm, this.dynamicCapacity[rm] ?? (["CT", "MRI", "治療"].includes(rm) ? 3 : 1));
        if (eff.allClosed || (tag === "(PM)" && eff.pmClosed) || (tag === "(AM)" && eff.amClosed)) continue;
        if (this.isTimeTagBlockedByFullDayRule(rm, tag) || !this.canAddKenmu(staff, rm)) continue;
        this.dayCells[rm] = `${staff}${tag}`;
        this.addUsage(staff, tag ? 0.5 : 1);
        this.blockMap.set(staff, 'ALL');
        this.log(`🚨 [サポート最終配置] 通常候補で埋まらないため ${staff}${tag} を ${rm} に単独配置`);
        break;
      }
    });
    this.refreshAssignmentState();
  }

  private trimOverloadedSupportPartners() {
    const supportStaff = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName);
    const supportRooms = split(this.ctx.customRules.supportTargetRooms || "");
    if (!supportStaff.length || !supportRooms.length) return;
    let changed = false;
    supportRooms.forEach(room => {
      if (this.skipSections.includes(room) || this.shouldSkipAutoAssignRoom(room)) return;
      const members = split(this.dayCells[room] || "");
      if (!members.some(m => supportStaff.includes(extractStaffName(m)))) return;
      const next = members.filter(entry => {
        const core = extractStaffName(entry);
        if (supportStaff.includes(core) || ROLE_PLACEHOLDERS.includes(core)) return true;
        const hasOtherRoom = ROOM_SECTIONS.some(r => r !== room && !["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r) && split(this.dayCells[r] || "").some(m => extractStaffName(m) === core));
        if (hasOtherRoom && this.getTodayRoomLoad(core) >= 3) {
          this.log(`↪️ [サポート最終整理] ${core} は3件兼務を避けるため ${room} から外し、支援スタッフを残しました`);
          changed = true;
          return false;
        }
        return true;
      });
      if (next.length !== members.length && next.some(m => supportStaff.includes(extractStaffName(m)))) this.dayCells[room] = join(next);
    });
    if (changed) this.refreshAssignmentState();
  }

  private canAddLinkedTargetLoadShare(staff: string, fromRoom: string, targetRoom: string, entryForTarget: string): boolean {
    const linkedTargets = Array.from(new Set((this.ctx.customRules.linkedRooms || []).map((r: any) => r.target).filter(Boolean))) as string[];
    const linkedTargetSet = new Set(linkedTargets);
    const core = extractStaffName(staff);
    if (!core || !linkedTargetSet.has(fromRoom) || !linkedTargetSet.has(targetRoom)) return false;
    if (hasFluoroAuxConflict(this.dayCells, core, targetRoom, this.ctx.customRules.fluoroAuxConflictRooms)) return false;
    const alreadyInTarget = split(this.dayCells[targetRoom] || "").map(extractStaffName).includes(core);
    const limit = this.ctx.customRules.alertMaxKenmu || 3;
    const nextLoad = this.getTodayRoomLoad(core) + (alreadyInTarget ? 0 : getStaffAmount(entryForTarget));
    return nextLoad <= limit;
  }

  private isLinkedTargetSourcePair(targetRoom: string, existingRoom: string): boolean {
    return (this.ctx.customRules.linkedRooms || []).some((rule: any) => {
      const target = String(rule.target || "");
      const sources = split(rule.sources || "").map(src => parseRoomCond(src).r);
      return (target === existingRoom && sources.includes(targetRoom)) || (target === targetRoom && sources.includes(existingRoom));
    });
  }

  private isAllowedLinkedSwapTarget(targetRoom: string, existingRooms: string[]): boolean {
    return existingRooms.some(existingRoom => this.isLinkedTargetSourcePair(targetRoom, existingRoom));
  }

  private sharePartialHelpersWithLinkedTargets() {
    const linkedTargets = Array.from(new Set((this.ctx.customRules.linkedRooms || []).map((r: any) => r.target).filter(Boolean))) as string[];
    const linkedTargetSet = new Set(linkedTargets);
    if (!linkedTargets.length) return;

    const isLateOrNightEntry = (entry: string) => entry.includes("17:") || entry.includes("18:") || entry.includes("19:") || entry.includes("22:");
    const isSplitTargetEntry = (entry: string) => {
      const tag = this.getMemberTimeTag(entry);
      return tag.includes("(AM)") || tag.includes("(PM)") || tag.includes("〜");
    };
    const getHelperSplit = (helperEntry: string, targetCore: string) => {
      const helperCore = extractStaffName(helperEntry);
      const tag = this.getMemberTimeTag(helperEntry);
      if (tag.match(/^\(〜\d/)) {
        const from = tag.match(/\(〜(\d+:\d+)\)/)?.[1] || "";
        if (!from) return { helperForTarget: "", targetRemainder: "" };
        return { helperForTarget: `${helperCore}(〜${from})`, targetRemainder: `${targetCore}(${from}〜)` };
      }
      if (tag === "(AM)") return { helperForTarget: `${helperCore}(AM)`, targetRemainder: `${targetCore}(PM)` };
      if (tag === "(PM)") return { helperForTarget: `${helperCore}(PM)`, targetRemainder: `${targetCore}(AM)` };
      return { helperForTarget: helperCore, targetRemainder: "" };
    };
    const helperRooms = linkedTargets
      .filter(room => !this.skipSections.includes(room) && room !== "透析後胸部" && !this.shouldSkipAutoAssignRoom(room))
      .flatMap(room => {
        const members = split(this.dayCells[room] || "");
        return members.map(helperEntry => ({ room, members, helperEntry, helperCore: extractStaffName(helperEntry) }));
      })
      .filter(x => {
        if (!x.helperCore || ROLE_PLACEHOLDERS.includes(x.helperCore) || isLateOrNightEntry(x.helperEntry)) return false;
        if (this.getTodayRoomLoad(x.helperCore) > 1) return false;
        const otherRooms = ROOM_SECTIONS.filter(r => r !== x.room && split(this.dayCells[r] || "").some(m => extractStaffName(m) === x.helperCore));
        return otherRooms.every(r => linkedTargetSet.has(r));
      })
      .sort((a, b) => {
        const aSplit = isSplitTargetEntry(a.helperEntry) ? 0 : 1;
        const bSplit = isSplitTargetEntry(b.helperEntry) ? 0 : 1;
        return aSplit - bSplit || this.getTodayRoomLoad(a.helperCore) - this.getTodayRoomLoad(b.helperCore);
      });

    for (const helper of helperRooms) {
      const candidates = linkedTargets
        .filter(room => room !== helper.room && !this.skipSections.includes(room) && room !== "透析後胸部" && !this.shouldSkipAutoAssignRoom(room))
        .map(room => {
          const members = split(this.dayCells[room] || "");
          if (members.length !== 1) return { room, members, replaceable: [] as string[], maxLoad: 0 };
          const replaceable = members.filter(entry => {
            const core = extractStaffName(entry);
            if (!core || core === helper.helperCore || ROLE_PLACEHOLDERS.includes(core)) return false;
            if (isLateOrNightEntry(entry) || isSplitTargetEntry(entry)) return false;
            if (this.getTodayRoomLoad(core) < 2) return false;
            const coreRooms = ROOM_SECTIONS.filter(r => r !== room && split(this.dayCells[r] || "").some(m => extractStaffName(m) === core));
            const hasNonTargetLoad = coreRooms.some(r => !linkedTargetSet.has(r) && !["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r));
            if (!hasNonTargetLoad) return false;
            const splitPlan = getHelperSplit(helper.helperEntry, core);
            if (!splitPlan.helperForTarget) return false;
            if (this.isTimeTagBlockedByFullDayRule(room, splitPlan.helperForTarget)) return false;
            if (splitPlan.targetRemainder && this.isTimeTagBlockedByFullDayRule(room, splitPlan.targetRemainder)) return false;
            return true;
          });
          const maxLoad = replaceable.reduce((mx, entry) => Math.max(mx, this.getTodayRoomLoad(extractStaffName(entry))), 0);
          return { room, members, replaceable, maxLoad };
        })
        .filter(x => x.replaceable.length > 0)
        .sort((a, b) => b.maxLoad - a.maxLoad || this.getRepeatAvoidPenalty(extractStaffName(b.replaceable[0]), b.room) - this.getRepeatAvoidPenalty(extractStaffName(a.replaceable[0]), a.room));

      for (const candidate of candidates) {
        const room = candidate.room;
        if (candidate.members.some(m => extractStaffName(m) === helper.helperCore)) continue;
        if (room === "MMG" && !this.isMmgCapable(helper.helperCore)) continue;
        if (this.isForbidden(helper.helperCore, room) || this.isHalfDayBlocked(helper.helperCore, room).hard) continue;
        if (this.hasNGPair(helper.helperCore, candidate.members.map(extractStaffName), false)) continue;
        const targetEntry = candidate.replaceable[0];
        const targetCore = extractStaffName(targetEntry);
        const splitPlan = getHelperSplit(helper.helperEntry, targetCore);
        if (!splitPlan.helperForTarget) continue;
        if (!this.canAddKenmu(helper.helperCore, room, true) && !this.canAddLinkedTargetLoadShare(helper.helperCore, helper.room, room, splitPlan.helperForTarget)) continue;
        const replacement = splitPlan.targetRemainder ? [splitPlan.helperForTarget, splitPlan.targetRemainder] : [splitPlan.helperForTarget];
        this.dayCells[room] = join(candidate.members.flatMap(m => m === targetEntry ? replacement : [m]));
        this.log(`🪄 [基本兼務負担軽減] ${helper.room} の ${helper.helperEntry} を ${room} にも入れ、${targetCore} の負担を減らしました`);
        this.refreshAssignmentState();
        return;
      }
    }
  }


  private canMoveEntryBetweenRooms(core: string, entry: string, fromRoom: string, toRoom: string, toMembers: string[]): boolean {
    if (!this.canPlaceEntryInRoomStrict(core, entry, toRoom, toMembers)) return false;
    if (!this.canSwapKeepKenmuLimit(core, toRoom, fromRoom, entry, entry)) return false;
    return true;
  }

  private getRoomLoadFromMembers(members: string[]): number {
    return members.reduce((sum, m) => sum + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
  }

  private tryProtectOneRoomForPortable(): boolean {
    if (this.skipSections.includes("ポータブル") || this.shouldSkipAutoAssignRoom("ポータブル")) return false;
    let portableMembers = split(this.dayCells["ポータブル"] || "");
    if (portableMembers.length === 0) return false;

    for (let targetIndex = 0; targetIndex < portableMembers.length; targetIndex++) {
      const portableEntry = portableMembers[targetIndex];
      const portableCore = extractStaffName(portableEntry);
      if (!portableCore || ROLE_PLACEHOLDERS.includes(portableCore) || this.isLateOrNightEntry(portableEntry)) continue;

      const currentSource = this.getPortableSourceInfo(portableCore, true);
      if (!currentSource || currentSource.room !== "1号室") continue;
      if (!this.canUseEntryForPortable(portableCore, portableEntry, portableMembers, targetIndex, true, true)) continue;

      const oneMembers = split(this.dayCells["1号室"] || "");
      const portableSourceIndex = oneMembers.findIndex(m => m === currentSource.entry);
      if (portableSourceIndex === -1) continue;
      const sourceTag = this.getMemberTimeTag(currentSource.entry);

      const swapRooms = ["2号室", "3号室", "5号室"].filter(room => room !== "1号室");
      for (const room of swapRooms) {
        if (this.shouldSkipAutoAssignRoom(room)) continue;
        const roomMembers = split(this.dayCells[room] || "");
        const candidates = roomMembers
          .map((entry, index) => ({ entry, index, core: extractStaffName(entry), tag: this.getMemberTimeTag(entry) }))
          .filter(x =>
            x.core &&
            !ROLE_PLACEHOLDERS.includes(x.core) &&
            x.core !== portableCore &&
            !this.isLateOrNightEntry(x.entry) &&
            x.tag === sourceTag
          )
          .sort((a, b) =>
            // ポータブル禁止者・対応可能部屋が少ない人は1号室側に固定されやすくする。
            (this.isForbidden(a.core, "ポータブル") ? -200 : 0) - (this.isForbidden(b.core, "ポータブル") ? -200 : 0) ||
            this.getTodayRoomLoad(a.core) - this.getTodayRoomLoad(b.core) ||
            a.core.localeCompare(b.core, "ja")
          );

        for (const candidate of candidates) {
          const movedPortableToRoom = `${portableCore}${candidate.tag}`;
          const movedCandidateToOne = `${candidate.core}${sourceTag}`;
          const nextOneMembers = oneMembers.map((m, idx) => idx === portableSourceIndex ? movedCandidateToOne : m);
          const nextRoomMembers = roomMembers.map((m, idx) => idx === candidate.index ? movedPortableToRoom : m);

          if (!this.canPlaceEntryInRoomStrict(candidate.core, movedCandidateToOne, "1号室", nextOneMembers)) continue;
          if (!this.canPlaceEntryInRoomStrict(portableCore, movedPortableToRoom, room, nextRoomMembers)) continue;
          if (!this.canUseEntryForPortable(portableCore, movedPortableToRoom, portableMembers, targetIndex, true, true)) continue;
          if (!this.canSwapKeepKenmuLimit(candidate.core, "1号室", room, candidate.entry, movedCandidateToOne)) continue;
          if (!this.canSwapKeepKenmuLimit(portableCore, room, "1号室", currentSource.entry, movedPortableToRoom)) continue;

          this.dayCells["1号室"] = join(nextOneMembers);
          this.dayCells[room] = join(nextRoomMembers);
          portableMembers[targetIndex] = movedPortableToRoom;
          this.dayCells["ポータブル"] = join(portableMembers);
          this.refreshAssignmentState();
          this.log(`🧭 [ポータブル配置構造] 1号室を空洞化させないため、1号室の ${currentSource.entry} と ${room} の ${candidate.entry} を交換し、${portableCore} を${room}由来のポータブルに寄せました`);
          return true;
        }
      }
    }
    return false;
  }

  private enforcePortableSourcePriority() {
    if (this.skipSections.includes("ポータブル") || this.shouldSkipAutoAssignRoom("ポータブル")) return;
    let portableMembers = split(this.dayCells["ポータブル"] || "");
    if (portableMembers.length === 0) return;

    for (let targetIndex = 0; targetIndex < portableMembers.length; targetIndex++) {
      const currentEntry = portableMembers[targetIndex];
      const currentCore = extractStaffName(currentEntry);
      if (!currentCore || ROLE_PLACEHOLDERS.includes(currentCore)) continue;

      const currentSource = this.getPortableSourceInfo(currentCore, true);
      // 候補部屋由来でないもの、またはMRI等の専従者が候補部屋に紛れ込んだものは閉域ポリシー側で処理する。
      if (!currentSource || (currentSource.room !== "CT" && this.isProtectedInCurrentModality(currentCore)) || !this.canUseEntryForPortable(currentCore, currentEntry, portableMembers, targetIndex, true)) continue;
      if (currentSource.idx === 0) continue;

      // まず、より優先度の高い候補部屋から週内初回の人へ差し替える。
      const betterDirect = this.findPortableStrictSourceCandidate(portableMembers, targetIndex, {
        allowWeeklyRepeat: false,
        maxSourceIndex: currentSource.idx,
      });
      if (betterDirect) {
        portableMembers[targetIndex] = betterDirect.entry;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`🔗 [ポータブル優先順] 設定順を優先し、${currentSource.room} 由来の ${currentEntry} から ${betterDirect.sourceRoom} 由来の ${betterDirect.entry} に変更しました`);
        return;
      }

      // 次に、より優先度の高い候補部屋へCT/MRIの非専従者を交換で入れられるか試す。
      const betterSwap = this.tryPortableModalitySourceSwap(portableMembers, targetIndex, {
        allowWeeklyRepeat: false,
        maxSourceIndex: currentSource.idx,
      });
      if (betterSwap) {
        portableMembers[targetIndex] = betterSwap.entry;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`🔗 [ポータブル優先順交換] ${betterSwap.sourceRoom} と ${betterSwap.modalityRoom} を交換し、優先度の高い候補部屋由来の ${betterSwap.entry} に変更しました`);
        return;
      }

      // 現在の担当が既に週内2回目なら、より優先度の高い候補部屋の週内2回目にも差し替えを許す。
      if (this.shouldAvoidWeeklyRepeat(currentCore, "ポータブル")) {
        const betterWeekly = this.findPortableStrictSourceCandidate(portableMembers, targetIndex, {
          allowWeeklyRepeat: true,
          maxSourceIndex: currentSource.idx,
        });
        if (betterWeekly) {
          portableMembers[targetIndex] = betterWeekly.entry;
          this.dayCells["ポータブル"] = join(portableMembers);
          this.refreshAssignmentState();
          this.log(`⚠️ [ポータブル優先順週内再担当] 週内2回目同士のため、設定順を優先して ${betterWeekly.sourceRoom} 由来の ${betterWeekly.entry} に変更しました`);
          return;
        }
      }
    }
  }


  private enforcePortableThreeRoomPairing() {
    if (this.skipSections.includes("ポータブル") || this.shouldSkipAutoAssignRoom("ポータブル")) return;
    let portableMembers = split(this.dayCells["ポータブル"] || "");
    if (portableMembers.length === 0) return;

    const threeCond = this.normalizePortableSourceCond("3号室");
    if (!threeCond) return;
    const threeEff = this.getEffectiveTarget("3号室", this.dynamicCapacity["3号室"] ?? 1);
    if (threeEff.allClosed || this.shouldSkipAutoAssignRoom("3号室")) return;

    for (let targetIndex = 0; targetIndex < portableMembers.length; targetIndex++) {
      const currentEntry = portableMembers[targetIndex];
      const currentCore = extractStaffName(currentEntry);
      if (!currentCore || ROLE_PLACEHOLDERS.includes(currentCore)) continue;
      if (!this.canUseEntryForPortable(currentCore, currentEntry, portableMembers, targetIndex, true)) continue;

      const currentSource = this.getPortableSourceInfo(currentCore, true);
      if (!currentSource || currentSource.room === "3号室") continue;
      if (currentSource.room !== "CT" && this.isProtectedInCurrentModality(currentCore)) continue;

      const threeMembers = split(this.dayCells["3号室"] || "");
      if (threeMembers.some(m => extractStaffName(m) === currentCore)) continue;

      const sourceMembers = split(this.dayCells[currentSource.room] || "");
      const sourceEntry = currentSource.entry;
      const sourceIndex = sourceMembers.findIndex(m => m === sourceEntry);
      if (sourceIndex === -1) continue;

      const currentTag = this.getMemberTimeTag(currentEntry);
      const sourceTag = this.getMemberTimeTag(sourceEntry);
      if (currentTag !== sourceTag) continue;

      const threeLoad = threeMembers.reduce((sum, m) => sum + getStaffAmount(m), 0);
      const threeCap = threeEff.cap ?? 1;
      if (threeLoad < threeCap) {
        const movedPortableToThree = `${currentCore}${sourceTag}`;
        const sourceAfterMove = sourceMembers.filter((_, idx) => idx !== sourceIndex);
        const sourceWouldBeEmpty = this.getRoomLoadFromMembers(sourceAfterMove) <= 0;
        // 3号室＋ポータブルを基本形にする。ただし1号室を空洞化させる移動は先に1号室保護交換へ回す。
        if (currentSource.room !== "1号室" || !sourceWouldBeEmpty) {
          if (this.canMoveEntryBetweenRooms(currentCore, movedPortableToThree, currentSource.room, "3号室", threeMembers)) {
            this.dayCells[currentSource.room] = join(sourceAfterMove);
            this.dayCells["3号室"] = join([...threeMembers, movedPortableToThree]);
            portableMembers[targetIndex] = movedPortableToThree;
            this.dayCells["ポータブル"] = join(portableMembers);
            this.refreshAssignmentState();
            this.log(`🔗 [ポータブル3号室原則] ${currentSource.room} の ${currentEntry} を3号室へ移し、3号室＋ポータブルの基本形に寄せました`);
            return;
          }
        }

        if (!this.canPlaceEntryInRoomStrict(currentCore, currentEntry, "3号室", threeMembers)) continue;
        if (!this.canAddKenmu(currentCore, "3号室", true)) continue;
        this.dayCells["3号室"] = join([...threeMembers, currentEntry]);
        this.refreshAssignmentState();
        this.log(`🔗 [ポータブル3号室原則] ${currentEntry} を3号室にも入れ、ポータブルを3号室由来に寄せました`);
        return;
      }

      const replaceableThree = threeMembers
        .map((entry, index) => ({ entry, index, core: extractStaffName(entry), tag: this.getMemberTimeTag(entry) }))
        .filter(x =>
          x.core &&
          !ROLE_PLACEHOLDERS.includes(x.core) &&
          x.core !== currentCore &&
          !this.isLateOrNightEntry(x.entry) &&
          x.tag === sourceTag
        );

      for (const three of replaceableThree) {
        const movedPortableToThree = `${currentCore}${three.tag}`;
        const movedThreeToSource = `${three.core}${sourceTag}`;
        const nextThreeMembers = threeMembers.map((m, idx) => idx === three.index ? movedPortableToThree : m);
        const nextSourceMembers = sourceMembers.map((m, idx) => idx === sourceIndex ? movedThreeToSource : m);

        if (!this.canPlaceEntryInRoomStrict(currentCore, movedPortableToThree, "3号室", nextThreeMembers)) continue;
        if (!this.canPlaceEntryInRoomStrict(three.core, movedThreeToSource, currentSource.room, nextSourceMembers)) continue;
        if (!this.canSwapKeepKenmuLimit(currentCore, "3号室", currentSource.room, sourceEntry, movedPortableToThree)) continue;
        if (!this.canSwapKeepKenmuLimit(three.core, currentSource.room, "3号室", three.entry, movedThreeToSource)) continue;

        this.dayCells["3号室"] = join(nextThreeMembers);
        this.dayCells[currentSource.room] = join(nextSourceMembers);
        portableMembers[targetIndex] = movedPortableToThree;
        this.dayCells["ポータブル"] = join(portableMembers);
        this.refreshAssignmentState();
        this.log(`🔁 [ポータブル3号室原則] ${currentSource.room} の ${currentEntry} と3号室の ${three.entry} を交換し、ポータブルを3号室兼務へ寄せました`);
        return;
      }
    }
  }


  private enforcePortableSourceRoomSwapPreference() {
    if (this.skipSections.includes("ポータブル") || this.shouldSkipAutoAssignRoom("ポータブル")) return;
    let portableMembers = split(this.dayCells["ポータブル"] || "");
    if (portableMembers.length === 0) return;

    const sources = this.getPortableSourceConds();
    const portableRoomPriority = (room: string) => {
      if (room === "3号室") return 0;
      if (room === "2号室") return 1;
      if (room === "5号室") return 2;
      if (room === "1号室") return 3;
      return 9;
    };

    for (let targetIndex = 0; targetIndex < portableMembers.length; targetIndex++) {
      const portableEntry = portableMembers[targetIndex];
      const portableCore = extractStaffName(portableEntry);
      if (!portableCore || ROLE_PLACEHOLDERS.includes(portableCore) || this.isLateOrNightEntry(portableEntry)) continue;
      if (!this.canUseEntryForPortable(portableCore, portableEntry, portableMembers, targetIndex, true)) continue;

      const currentSource = this.getPortableSourceInfo(portableCore, true);
      if (!currentSource) continue;
      if (!["1号室", "5号室", "2号室"].includes(currentSource.room)) continue;

      const currentRank = portableRoomPriority(currentSource.room);
      if (currentRank <= 0 || currentRank >= 9) continue;
      const currentEntry = currentSource.entry;
      const currentTag = this.getMemberTimeTag(currentEntry);
      if (currentTag !== this.getMemberTimeTag(portableEntry)) continue;

      const betterSources = sources
        .map((cond, sourceIndex) => ({ ...cond, sourceIndex, rank: portableRoomPriority(cond.r) }))
        .filter(cond =>
          cond.rank < currentRank &&
          cond.rank < 9 &&
          cond.r !== currentSource.room &&
          cond.r !== "CT" &&
          !this.skipSections.includes(cond.r) &&
          !this.shouldSkipAutoAssignRoom(cond.r) &&
          this.isPortableSourceAvailable(cond, cond.r === "3号室") &&
          split(this.dayCells[cond.r] || "").length > 0
        )
        .sort((a, b) => a.rank - b.rank || a.sourceIndex - b.sourceIndex);

      for (const better of betterSources) {
        const betterMembers = split(this.dayCells[better.r] || "");
        const currentSourceMembers = split(this.dayCells[currentSource.room] || "");
        const currentSourceIndex = currentSourceMembers.findIndex(m => m === currentEntry);
        if (currentSourceIndex === -1) continue;

        const betterCandidates = betterMembers
          .map((entry, index) => ({ entry, index, core: extractStaffName(entry), tag: this.getMemberTimeTag(entry) }))
          .filter(x =>
            x.core &&
            !ROLE_PLACEHOLDERS.includes(x.core) &&
            x.core !== portableCore &&
            !this.isLateOrNightEntry(x.entry) &&
            x.tag === currentTag
          )
          .sort((a, b) =>
            this.getTodayRoomLoad(a.core) - this.getTodayRoomLoad(b.core) ||
            this.getPastRoomCount(a.core, currentSource.room) - this.getPastRoomCount(b.core, currentSource.room) ||
            a.core.localeCompare(b.core, "ja")
          );

        for (const betterCandidate of betterCandidates) {
          const movedPortableToBetter = `${portableCore}${betterCandidate.tag}`;
          const movedBetterToCurrent = `${betterCandidate.core}${currentTag}`;
          const nextBetterMembers = betterMembers.map((m, idx) => idx === betterCandidate.index ? movedPortableToBetter : m);
          const nextCurrentSourceMembers = currentSourceMembers.map((m, idx) => idx === currentSourceIndex ? movedBetterToCurrent : m);

          if (!this.canPlaceEntryInRoomStrict(portableCore, movedPortableToBetter, better.r, nextBetterMembers)) continue;
          if (!this.canPlaceEntryInRoomStrict(betterCandidate.core, movedBetterToCurrent, currentSource.room, nextCurrentSourceMembers)) continue;
          if (!this.canUseEntryForPortable(portableCore, movedPortableToBetter, portableMembers, targetIndex, true)) continue;
          if (!this.canSwapKeepKenmuLimit(portableCore, better.r, currentSource.room, currentEntry, movedPortableToBetter)) continue;
          if (!this.canSwapKeepKenmuLimit(betterCandidate.core, currentSource.room, better.r, betterCandidate.entry, movedBetterToCurrent)) continue;

          this.dayCells[better.r] = join(nextBetterMembers);
          this.dayCells[currentSource.room] = join(nextCurrentSourceMembers);
          portableMembers[targetIndex] = movedPortableToBetter;
          this.dayCells["ポータブル"] = join(portableMembers);
          this.refreshAssignmentState();
          this.log(`🔁 [ポータブル候補部屋内交換] ${currentSource.room} の ${portableEntry} と ${better.r} の ${betterCandidate.entry} を交換し、ポータブル由来をより優先度の高い ${better.r} に寄せました`);
          return;
        }
      }
    }
  }

  private getNoConsecutiveSourceRooms(room: string): string[] {
    const rooms: string[] = [];
    if (room === "ポータブル") {
      this.getPortableSourceConds().forEach(cond => {
        if (this.isPortableSourceAvailable(cond, false)) rooms.push(cond.r);
      });
      if (rooms.length === 0) {
        ["3号室", "2号室", "1号室", "5号室"].forEach(r => {
          const cond = this.normalizePortableSourceCond(r);
          if (cond && this.isPortableSourceAvailable(cond, false)) rooms.push(cond.r);
        });
        const ctCond = this.normalizePortableSourceCond("CT(4)");
        if (ctCond && this.isPortableSourceAvailable(ctCond, false)) rooms.push("CT");
      }
      return Array.from(new Set(rooms)).filter(r => r && r !== room && r !== "透析後胸部");
    }

    (this.ctx.customRules.linkedRooms || []).filter((r: any) => r.target === room).forEach((r: any) => split(r.sources || "").forEach((src: string) => rooms.push(parseRoomCond(src).r)));
    (this.ctx.customRules.rescueRules || []).filter((r: any) => r.targetRoom === room).forEach((r: any) => split(r.sourceRooms || "").forEach((src: string) => rooms.push(parseRoomCond(src).r)));
    ["3号室", "2号室", "1号室", "5号室", "CT"].forEach(r => rooms.push(r));
    return Array.from(new Set(rooms)).filter(r => r && r !== room && r !== "透析後胸部" && !this.skipSections.includes(r) && !this.shouldSkipAutoAssignRoom(r));
  }
  private canSwapKeepKenmuLimit(staff: string, targetRoom: string, removeRoom: string, removeEntry: string, addEntry: string): boolean {
    const core = extractStaffName(staff);
    if (!core) return false;
    if (hasFluoroAuxConflict(this.dayCells, core, targetRoom, this.ctx.customRules.fluoroAuxConflictRooms)) return false;
    const limit = this.ctx.customRules.alertMaxKenmu || 3;
    const currentLoad = this.getTodayRoomLoad(core);
    const beforeRooms = ROOM_SECTIONS.filter(r =>
      r !== removeRoom &&
      !["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r) &&
      split(this.dayCells[r] || "").some(m => extractStaffName(m) === core)
    );
    const alreadyInTargetAfterRemove = beforeRooms.includes(targetRoom);
    const nextLoad = currentLoad - getStaffAmount(removeEntry) + (alreadyInTargetAfterRemove ? 0 : getStaffAmount(addEntry));
    if (nextLoad > limit) return false;

    const exPairs = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.isExclusive);
    for (const p of exPairs) {
      const hadPairBefore = beforeRooms.includes(p.s1) || beforeRooms.includes(p.s2);
      if (hadPairBefore && targetRoom !== p.s1 && targetRoom !== p.s2 && !this.isAllowedLinkedSwapTarget(targetRoom, beforeRooms)) return false;
    }
    return true;
  }
  private findNoRepeatSwap(room: string, currentEntry: string, currentMembers: string[], preferWeeklyClean: boolean = false): { replacementEntry: string; sourceRoom: string; sourceEntry: string; sourceRoomEntries: string[] } | null {
    const currentCore = extractStaffName(currentEntry);
    const currentTag = this.getMemberTimeTag(currentEntry);
    const currentCores = currentMembers.map(extractStaffName);
    const oppositeTag = (tag: string) => tag === "(AM)" ? "(PM)" : tag === "(PM)" ? "(AM)" : "";
    const candidates: { replacementEntry: string; sourceRoom: string; sourceEntry: string; sourceRoomEntries: string[]; staff: string; sourceIndex: number }[] = [];
    this.getNoConsecutiveSourceRooms(room).forEach((sourceRoom, sourceIndex) => {
      const sourceMembers = split(this.dayCells[sourceRoom] || "");
      sourceMembers.forEach(sourceEntry => {
        const staff = extractStaffName(sourceEntry);
        const sourceTag = this.getMemberTimeTag(sourceEntry);
        const sameTagSwap = sourceTag === currentTag;
        const splitFullDaySourceSwap = sourceTag === "" && (currentTag === "(AM)" || currentTag === "(PM)");
        if (!sameTagSwap && !splitFullDaySourceSwap) return;
        if (ROLE_PLACEHOLDERS.includes(staff) || staff === currentCore || currentCores.includes(staff)) return;
        if (sourceMembers.filter(m => m !== sourceEntry).map(extractStaffName).includes(currentCore)) return;
        if (this.shouldAvoidConsecutive(staff, room)) return;
        if (preferWeeklyClean && this.shouldAvoidWeeklyRepeat(staff, room)) return;
        if (sourceEntry.includes("17:") || sourceEntry.includes("18:") || sourceEntry.includes("19:") || sourceEntry.includes("22:")) return;
        if (this.isForbidden(staff, room) || this.isHalfDayBlocked(staff, room).hard || this.hasNGPair(staff, currentMembers.filter(m => m !== currentEntry).map(extractStaffName), false)) return;
        const replacementEntry = splitFullDaySourceSwap ? `${staff}${currentTag}` : sourceEntry;
        const movedCurrentEntry = sameTagSwap ? `${currentCore}${sourceTag}` : `${currentCore}${currentTag}`;
        if (!this.canSwapKeepKenmuLimit(staff, room, sourceRoom, sourceEntry, replacementEntry)) return;
        if (this.isTimeTagBlockedByFullDayRule(room, replacementEntry) || this.isTimeTagBlockedByFullDayRule(sourceRoom, movedCurrentEntry)) return;
        const sourcePeers = sourceMembers.filter(m => m !== sourceEntry).map(extractStaffName);
        if (this.isForbidden(currentCore, sourceRoom) || this.isHalfDayBlocked(currentCore, sourceRoom).hard || this.hasNGPair(currentCore, sourcePeers, false) || !this.canSwapKeepKenmuLimit(currentCore, sourceRoom, room, currentEntry, movedCurrentEntry)) return;
        const sourceRoomEntries = sourceMembers.flatMap(m => {
          if (m !== sourceEntry) return [m];
          if (!splitFullDaySourceSwap) return [movedCurrentEntry];
          const keepSourceOpposite = `${staff}${oppositeTag(currentTag)}`;
          return [movedCurrentEntry, keepSourceOpposite];
        }).filter(Boolean);
        candidates.push({ replacementEntry, sourceRoom, sourceEntry, sourceRoomEntries, staff, sourceIndex });
      });
    });
    candidates.sort((a, b) => this.getPastMonthRoomCount(a.staff, room) - this.getPastMonthRoomCount(b.staff, room) || a.sourceIndex - b.sourceIndex || this.getTodayRoomLoad(a.staff) - this.getTodayRoomLoad(b.staff) || this.getPastRoomCount(a.staff, room) - this.getPastRoomCount(b.staff, room) || a.staff.localeCompare(b.staff, 'ja'));
    return candidates[0] ? { replacementEntry: candidates[0].replacementEntry, sourceRoom: candidates[0].sourceRoom, sourceEntry: candidates[0].sourceEntry, sourceRoomEntries: candidates[0].sourceRoomEntries } : null;
  }
  private rebalanceNoConsecutiveRooms() {
    split(this.ctx.customRules.noConsecutiveRooms || "").forEach(room => {
      if (!room || this.skipSections.includes(room) || room === "透析後胸部") return;
      const current = split(this.dayCells[room] || "");
      if (current.length === 0) return;
      const next = [...current];
      for (let i = 0; i < next.length; i++) {
        const staff = extractStaffName(next[i]);
        const isConsecutive = this.shouldAvoidConsecutive(staff, room);
        const isWeeklyRepeat = this.shouldAvoidWeeklyRepeat(staff, room);
        if (ROLE_PLACEHOLDERS.includes(staff) || (!isConsecutive && !isWeeklyRepeat)) continue;
        const swap = this.findNoRepeatSwap(room, next[i], next, true) || (isConsecutive ? this.findNoRepeatSwap(room, next[i], next, false) : null);
        if (!swap) { this.log(`↪️ [${isConsecutive ? "連日" : "週内重複"}回避見送り] ${room} の ${next[i]} は安全に交換できる候補がありません`); continue; }
        const oldEntry = next[i];
        next[i] = swap.replacementEntry;
        this.dayCells[swap.sourceRoom] = join(swap.sourceRoomEntries);
        this.dayCells[room] = join(next);
        this.refreshAssignmentState();
        this.assignCounts[extractStaffName(swap.replacementEntry)] = this.getAssignedUsage(extractStaffName(swap.replacementEntry));
        this.assignCounts[staff] = this.getAssignedUsage(staff);
        this.log(`♻️ [${isConsecutive ? "連日" : "週内重複"}回避] ${room} の ${oldEntry} と ${swap.sourceRoom} の ${swap.replacementEntry} を交換`);
        break;
      }
      this.dayCells[room] = join(next);
    });
  }
  private applyPushOutRules() {
    (this.ctx.customRules.pushOuts || []).forEach((po: any) => {
      const s1 = extractStaffName(po.s1 || po.triggerStaff);
      const s2 = extractStaffName(po.s2 || po.targetStaff);
      const tSec = po.triggerSection;
      if (!s1 || !s2 || !tSec || !po.targetSections || this.skipSections.includes(tSec) || tSec === "透析後胸部") return;
      const triggerMembers = split(this.dayCells[tSec]);
      if (!triggerMembers.map(extractStaffName).includes(s1) || !triggerMembers.map(extractStaffName).includes(s2)) return;
      const currentEntry = triggerMembers.find(m => extractStaffName(m) === s2);
      if (!currentEntry) return;

      const targetRoomsInOrder = split(po.targetSections).filter(room => !this.skipSections.includes(room) && room !== "透析後胸部" && !this.shouldSkipAutoAssignRoom(room));
      const targetRoomsByScore = [...targetRoomsInOrder].sort((a, b) => this.getPushOutRoomScore(s2, a) - this.getPushOutRoomScore(s2, b));

      const trySwap = (): boolean => {
        const triggerWithoutTarget = triggerMembers.filter(m => extractStaffName(m) !== s2);
        for (const room of targetRoomsInOrder) {
          const roomMembers = split(this.dayCells[room]);
          const baseCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
          const eff = this.getEffectiveTarget(room, baseCap);
          if (eff.allClosed) continue;
          for (const roomEntry of roomMembers) {
            const swapStaff = extractStaffName(roomEntry);
            if (!swapStaff || ROLE_PLACEHOLDERS.includes(swapStaff) || swapStaff === s1 || swapStaff === s2) continue;
            const sourceTag = this.getMemberTimeTag(roomEntry);
            const targetTag = this.getMemberTimeTag(currentEntry);
            const movedTarget = `${s2}${sourceTag}`;
            const movedSwap = `${swapStaff}${targetTag}`;
            if ((sourceTag === "(AM)" && eff.amClosed) || (sourceTag === "(PM)" && eff.pmClosed)) continue;
            if (this.isTimeTagBlockedByFullDayRule(room, movedTarget) || this.isTimeTagBlockedByFullDayRule(tSec, movedSwap)) continue;

            const sourcePeers = roomMembers.filter(m => m !== roomEntry).map(extractStaffName);
            const triggerPeers = triggerWithoutTarget.map(extractStaffName);
            if (this.isForbidden(s2, room) || this.isHalfDayBlocked(s2, room).hard || this.hasNGPair(s2, sourcePeers, false)) continue;
            if (this.isForbidden(swapStaff, tSec) || this.isHalfDayBlocked(swapStaff, tSec).hard || this.hasNGPair(swapStaff, triggerPeers, false)) continue;

            this.dayCells[tSec] = join(triggerMembers.map(m => m === currentEntry ? movedSwap : m));
            this.dayCells[room] = join(roomMembers.map(m => m === roomEntry ? movedTarget : m));
            this.refreshAssignmentState();
            this.log(`🎱 [玉突き交換] ${tSec} の ${s2} と ${room} の ${swapStaff} を交換`);
            return true;
          }
        }
        return false;
      };

      const tryMove = (): boolean => {
        for (const room of targetRoomsByScore) {
          const roomMembers = split(this.dayCells[room]);
          if (roomMembers.map(extractStaffName).includes(s2)) {
            this.dayCells[tSec] = join(triggerMembers.filter(m => extractStaffName(m) !== s2));
            this.refreshAssignmentState();
            this.log(`🎱 [玉突き] ${s1} と被ったため ${s2} を ${tSec} から外しました`);
            return true;
          }
          if (this.isForbidden(s2, room) || this.isHalfDayBlocked(s2, room).hard || this.hasNGPair(s2, roomMembers.map(extractStaffName), false) || !this.canAddKenmu(s2, room)) continue;
          const baseCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
          const eff = this.getEffectiveTarget(room, baseCap);
          if (eff.allClosed) continue;
          let roomAm = eff.amClosed ? 999 : 0;
          let roomPm = eff.pmClosed ? 999 : 0;
          roomMembers.forEach(m => { if (m.includes("(AM)")) roomAm++; else if (m.includes("(PM)")) roomPm++; else { roomAm++; roomPm++; } });
          let moved = currentEntry;
          if (eff.pmClosed) { if (currentEntry.includes("(PM)")) continue; moved = `${s2}(AM)`; if (roomAm >= eff.cap) continue; }
          else if (eff.amClosed) { if (currentEntry.includes("(AM)")) continue; moved = `${s2}(PM)`; if (roomPm >= eff.cap) continue; }
          else if (!currentEntry.includes("(")) {
            if (roomAm >= eff.cap && roomPm < eff.cap) moved = `${s2}(PM)`;
            else if (roomPm >= eff.cap && roomAm < eff.cap) moved = `${s2}(AM)`;
            else if (roomAm >= eff.cap && roomPm >= eff.cap) continue;
          } else if (currentEntry.includes("(AM)")) { if (roomAm >= eff.cap) continue; }
          else if (currentEntry.includes("(PM)")) { if (roomPm >= eff.cap) continue; }
          if (this.isTimeTagBlockedByFullDayRule(room, moved)) continue;
          this.dayCells[tSec] = join(triggerMembers.filter(m => extractStaffName(m) !== s2));
          this.dayCells[room] = join([...roomMembers, moved]);
          this.refreshAssignmentState();
          this.log(`🎱 [玉突き] ${s1} と被ったため ${s2} を ${room} に移動`);
          return true;
        }
        return false;
      };

      if (trySwap()) return;
      if (!tryMove()) this.log(`↪️ [玉突き未実行] ${tSec} の ${s1}/${s2}: 通常定員内で移動・交換できる候補がありません`);
    });
  }
  updateBlockMapAfterKenmu(core: string, pushStr: string) { const cur = this.blockMap.get(core); let nx: string; if (pushStr.includes("(AM)")) nx = (cur === 'PM' || cur === 'ALL') ? 'ALL' : 'AM'; else if (pushStr.includes("(PM)")) nx = (cur === 'AM' || cur === 'ALL') ? 'ALL' : 'PM'; else nx = 'ALL'; this.blockMap.set(core, nx); }
  private repairMmgElevenConflict(conflictStaff: string): boolean {
    const staffCore = extractStaffName(conflictStaff);
    if (!staffCore) return false;
    const mmgMembers = split(this.dayCells["MMG"] || "");
    const elevenMembers = split(this.dayCells["透視（11号）"] || "");
    const staffInMmg = mmgMembers.some(m => extractStaffName(m) === staffCore);
    const staffInEleven = elevenMembers.some(m => extractStaffName(m) === staffCore);
    if (!staffInMmg && !staffInEleven) return false;
    const auxCores = new Set<string>();
    AUX_FOLLOWUP_SECTIONS.forEach(sec => split(this.dayCells[sec] || "").forEach(m => auxCores.add(extractStaffName(m))));
    const femaleList = split(this.ctx.customRules.femaleStaffList || "").map(extractStaffName);
    const exclusivePairs = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.isExclusive && p.s1 && p.s2);
    const getSwapRoomsForCandidate = (sourceRoom: string, candidateCore: string) => {
      const pair = exclusivePairs.find((p: any) =>
        p.s1 !== "MMG" && p.s2 !== "MMG" && p.s1 !== "透視（11号）" && p.s2 !== "透視（11号）" &&
        [p.s1, p.s2].includes(sourceRoom) &&
        [p.s1, p.s2].some((r: string) => split(this.dayCells[r] || "").some(m => extractStaffName(m) === candidateCore))
      );
      return pair ? [pair.s1, pair.s2] : [sourceRoom];
    };
    const isCandidateMmgOk = (core: string) => !auxCores.has(core) && core !== staffCore && !this.isForbidden(core, "MMG") && (femaleList.includes(core) || this.isMmgCapable(core));
    const sourceRooms = ["MMG", "骨塩", "検像", "パノラマCT", "5号室", "2号室", "ポータブル", "CT", "RI", "治療", "1号室", "透視（6号）"].filter(r => !this.skipSections.includes(r) && !this.shouldSkipAutoAssignRoom(r));
    for (const sourceRoom of sourceRooms) {
      const sourceMembers = split(this.dayCells[sourceRoom] || "");
      const candidates = sourceMembers
        .filter(m => !m.includes("17:") && !m.includes("19:"))
        .filter(m => isCandidateMmgOk(extractStaffName(m)))
        .sort((a, b) => {
          const aCore = extractStaffName(a);
          const bCore = extractStaffName(b);
          const aFull = a.includes("(") ? 1 : 0;
          const bFull = b.includes("(") ? 1 : 0;
          return aFull - bFull || this.getTodayRoomLoad(aCore) - this.getTodayRoomLoad(bCore) || this.getPastRoomCount(aCore, "MMG") - this.getPastRoomCount(bCore, "MMG");
        });
      for (const candidateEntry of candidates) {
        const candidateCore = extractStaffName(candidateEntry);
        const candidateTag = this.getMemberTimeTag(candidateEntry);
        if (this.isTimeTagBlockedByFullDayRule("MMG", candidateTag) || this.isTimeTagBlockedByFullDayRule("透視（11号）", candidateTag)) continue;
        const swapRooms = getSwapRoomsForCandidate(sourceRoom, candidateCore);
        const swapPlans = swapRooms.map(room => ({ room, members: split(this.dayCells[room] || "") })).map(plan => ({
          ...plan,
          candidateEntries: plan.members.filter(m => extractStaffName(m) === candidateCore && !m.includes("17:") && !m.includes("19:")),
        }));
        if (swapPlans.some(plan => plan.candidateEntries.length === 0)) continue;
        const candidateRooms = ROOM_SECTIONS.filter(r =>
          !["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r) &&
          split(this.dayCells[r] || "").some(m => extractStaffName(m) === candidateCore && !m.includes("17:") && !m.includes("19:"))
        );
        if (candidateRooms.some(r => !swapRooms.includes(r) && r !== "MMG" && r !== "透視（11号）")) continue;
        const canSwapPair = swapPlans.every(plan => {
          const nextPeers = plan.members.filter(m => extractStaffName(m) !== candidateCore).map(extractStaffName);
          return plan.candidateEntries.every(entry => {
            const replacement = staffCore + this.getMemberTimeTag(entry);
            return !this.isForbidden(staffCore, plan.room) && !this.isHalfDayBlocked(staffCore, plan.room).hard && !this.hasNGPair(staffCore, nextPeers, false) && !this.isTimeTagBlockedByFullDayRule(plan.room, replacement);
          });
        });
        if (!canSwapPair) continue;
        swapPlans.forEach(plan => {
          this.dayCells[plan.room] = join(plan.members.map(m => extractStaffName(m) === candidateCore ? staffCore + this.getMemberTimeTag(m) : m));
        });
        const nextMmg = mmgMembers.filter(m => extractStaffName(m) !== staffCore && extractStaffName(m) !== candidateCore);
        const nextEleven = elevenMembers.filter(m => extractStaffName(m) !== staffCore && extractStaffName(m) !== candidateCore);
        this.dayCells["MMG"] = join([...nextMmg, candidateCore + candidateTag]);
        this.dayCells["透視（11号）"] = join([...nextEleven, candidateCore + candidateTag]);
        this.refreshAssignmentState();
        this.log("🔁 [MMG・11号調整] 待機/透析後胸部と重なる " + staffCore + " の代わりに " + candidateCore + " を MMG・透視（11号）へ移し、" + swapRooms.join("・") + " は " + staffCore + " に戻しました");
        return true;
      }
    }
    return false;
  }
  private fillElevenFromMmgPair(auxCores: Set<string>): boolean {
    const elevenMembers = split(this.dayCells["透視（11号）"] || "");
    if (elevenMembers.length > 0) return true;
    const mmgMembers = split(this.dayCells["MMG"] || "");
    if (mmgMembers.length === 0) return false;

    const safeMmg = mmgMembers.find(m => {
      const core = extractStaffName(m);
      return core && !auxCores.has(core) && !ROLE_PLACEHOLDERS.includes(core) && !m.includes("17:") && !m.includes("19:") && !this.isForbidden(core, "透視（11号）") && !this.isHalfDayBlocked(core, "透視（11号）").hard && !this.isTimeTagBlockedByFullDayRule("透視（11号）", m);
    });
    if (safeMmg) {
      this.dayCells["透視（11号）"] = safeMmg;
      this.addUsage(extractStaffName(safeMmg), getStaffAmount(safeMmg));
      this.updateBlockMapAfterKenmu(extractStaffName(safeMmg), safeMmg);
      this.log(`🧩 [MMG・11号基本兼務] MMG の ${extractStaffName(safeMmg)} を 透視（11号）にも配置しました`);
      return true;
    }

    const conflictedMmg = mmgMembers.find(m => auxCores.has(extractStaffName(m)));
    if (conflictedMmg) return this.repairMmgElevenConflict(extractStaffName(conflictedMmg));
    return false;
  }
  private fillEmptyFluoroConflictRoom(room: string, auxCores: Set<string>): boolean {
    if (split(this.dayCells[room] || "").length > 0) return true;
    if (room === "透視（11号）") return this.fillElevenFromMmgPair(auxCores);
    const femaleList = split(this.ctx.customRules.femaleStaffList || "").map(extractStaffName);
    const sourceRooms = ["MMG", "1号室", "2号室", "5号室", "骨塩", "検像", "パノラマCT", "ポータブル", "CT", "RI", "治療"];
    for (const sourceRoom of sourceRooms) {
      if (this.skipSections.includes(sourceRoom) || this.shouldSkipAutoAssignRoom(sourceRoom)) continue;
      const sourceMembers = split(this.dayCells[sourceRoom] || "");
      for (const entry of sourceMembers) {
        const core = extractStaffName(entry);
        if (!core || auxCores.has(core) || ROLE_PLACEHOLDERS.includes(core) || entry.includes("17:") || entry.includes("19:")) continue;
        if (this.isForbidden(core, room) || this.isHalfDayBlocked(core, room).hard || this.isTimeTagBlockedByFullDayRule(room, entry)) continue;
        if (room === "透視（11号）" && sourceRoom === "MMG" && !femaleList.includes(core) && !this.isMmgCapable(core)) continue;
        if (this.hasNGPair(core, [], false)) continue;
        if (!this.canAddKenmu(core, room, true)) continue;
        this.dayCells[room] = entry;
        this.addUsage(core, getStaffAmount(entry));
        this.updateBlockMapAfterKenmu(core, entry);
        this.log(`🧩 [透視補充] ${room} が空いたため ${sourceRoom} の担当者を兼務補充しました`);
        return true;
      }
    }
    return false;
  }
  private enforceFluoroAuxConflictRule(): void {
    const conflictRooms = getFluoroAuxConflictSections(this.ctx.customRules.fluoroAuxConflictRooms);
    const auxCores = new Set<string>();
    AUX_FOLLOWUP_SECTIONS.forEach(sec => {
      split(this.dayCells[sec] || "").forEach(m => {
        const core = extractStaffName(m);
        if (core) auxCores.add(core);
      });
    });
    if (auxCores.size === 0) return;
    conflictRooms.forEach(room => {
      let before = split(this.dayCells[room] || "");
      const conflicted = before.filter(m => auxCores.has(extractStaffName(m))).map(extractStaffName);
      if (room === "透視（11号）") {
        if (conflicted.length > 0 && before.length === conflicted.length) {
          conflicted.some(staff => this.repairMmgElevenConflict(staff));
          before = split(this.dayCells[room] || "");
        }
        if (before.length === 0) {
          this.fillElevenFromMmgPair(auxCores);
          before = split(this.dayCells[room] || "");
        }
      }
      const after = before.filter(m => !auxCores.has(extractStaffName(m)));
      if (after.length !== before.length) {
        const removed = before.filter(m => auxCores.has(extractStaffName(m))).map(extractStaffName);
        this.dayCells[room] = join(after);
        this.log(`🚫 [待機・透析後胸部優先] ${room} から ${join(Array.from(new Set(removed)))} を外しました`);
      }
      if (split(this.dayCells[room] || "").length === 0) {
        this.fillEmptyFluoroConflictRoom(room, auxCores);
      }
    });
  }

  canAddKenmu(st: string, tgt: string, bypass: boolean = false): boolean {
    const core = extractStaffName(st);
    if (hasFluoroAuxConflict(this.dayCells, core, tgt, this.ctx.customRules.fluoroAuxConflictRooms)) return false;
    const limit = this.ctx.customRules.alertMaxKenmu || 3;
    const normalCap = Math.max(2, limit - 1);
    const alreadyInTarget = split(this.dayCells[tgt] || "").map(extractStaffName).includes(core);
    const cLoad = this.getTodayRoomLoad(core);
    if (!alreadyInTarget && cLoad >= limit) return false;
    // 3件兼務は通常の基本兼務・救済では作らない。必要な場合は最終救済側でだけ許容する。
    if (!alreadyInTarget && cLoad >= normalCap) return false;
    const exPairs = (this.ctx.customRules.kenmuPairs || []).filter((p: any) => p.isExclusive);
    for (const p of exPairs) {
      const inS1 = split(this.dayCells[p.s1] || "").map(extractStaffName).includes(core);
      const inS2 = split(this.dayCells[p.s2] || "").map(extractStaffName).includes(core);
      if (inS1 || inS2) { if (tgt !== p.s1 && tgt !== p.s2) return false; }
      if (tgt === p.s1 || tgt === p.s2) {
        if (!bypass) {
          const curR = ROOM_SECTIONS.filter(r => split(this.dayCells[r] || "").map(extractStaffName).includes(core) && !["待機", "昼当番", "受付", "受付ヘルプ"].includes(r));
          const hasOut = curR.some(r => r !== p.s1 && r !== p.s2);
          if (hasOut) return false;
        }
      }
    }
    return true;
  }
  private isLinkedTargetRoom(room: string): boolean { return (this.ctx.customRules.linkedRooms || []).some((rule: any) => rule.target === room); }
  isMmgCapable(st: string): boolean { return split(this.ctx.monthlyAssign.MMG || "").map(extractStaffName).includes(extractStaffName(st)); }
  getEffectiveTarget(room: string, baseCap: number) { const dayChar = this.day.label.match(/\((.*?)\)/)?.[1]; if (!dayChar) return { cap: baseCap, amClosed: false, pmClosed: false, allClosed: false }; const closed = (this.ctx.customRules.closedRooms || []).filter((r: any) => r.room === room && r.day === dayChar); let amClosed = false; let pmClosed = false; let allClosed = false; closed.forEach((r: any) => { if (r.time === "全日") allClosed = true; else if (r.time === "(AM)") amClosed = true; else if (r.time === "(PM)") pmClosed = true; }); if (amClosed && pmClosed) allClosed = true; if (allClosed) return { cap: 0, amClosed: true, pmClosed: true, allClosed: true }; if (amClosed || pmClosed) return { cap: baseCap / 2, amClosed, pmClosed, allClosed: false }; return { cap: baseCap, amClosed: false, pmClosed: false, allClosed: false }; }
  private shouldSkipAutoAssignRoom(room: string): boolean { const eff = this.getEffectiveTarget(room, this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1)); return eff.allClosed; }
  
  pick(availList: string[], list: string[], n: number, section?: string, currentAssigned: string[] = []): string[] { const result: string[] = []; const uniqueList = Array.from(new Set(list.filter(Boolean))); const filterFn = (name: string, checkSoftNg: boolean) => { if (!availList.includes(name) || this.isUsed(name) || (section && this.isForbidden(name, section))) return false; if (this.hasNGPair(name, [...currentAssigned, ...result].map(extractStaffName), checkSoftNg)) return false; if (section && !this.canAddKenmu(name, section)) return false; return true; }; for (const name of uniqueList.filter(nm => filterFn(nm, true))) { result.push(name); if (result.length >= n) return result; } for (const name of uniqueList.filter(nm => filterFn(nm, false))) { result.push(name); if (result.length >= n) return result; } return result; }

  initCounts() { this.ctx.allStaff.forEach(s => { this.assignCounts[s] = 0; this.maxAssigns[s] = 1; this.roomCounts[s] = {}; SECTIONS.forEach(sec => this.roomCounts[s][sec] = 0); this.counts[s] = 0; }); this.pastDaysInMonth.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (["CT", "MRI", "MMG"].includes(sec)) { split(val as string).forEach(m => { const c = extractStaffName(m); if (this.roomCounts[c]) { this.roomCounts[c][sec]++; this.counts[c]++; } }); } }); }); this.pastDaysInWeek.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (!["CT", "MRI", "MMG"].includes(sec)) { split(val as string).forEach(m => { const c = extractStaffName(m); if (this.roomCounts[c]) { this.roomCounts[c][sec]++; this.counts[c]++; } }); } }); }); }
  buildBlockMap() { this.ctx.allStaff.forEach(s => this.blockMap.set(s, 'NONE')); ["明け","入り","土日休日代休"].forEach(sec => { split(this.dayCells[sec]).forEach(m => this.blockMap.set(extractStaffName(m), 'ALL')); }); split(this.dayCells["不在"]).forEach(m => { const core = extractStaffName(m); if (m.includes("(AM)")) this.blockMap.set(core, 'AM'); else if (m.includes("(PM)")) this.blockMap.set(core, 'PM'); else if (m.match(/\(〜\d/)) { this.blockMap.set(core, 'AM'); } else if (m.match(/\(\d.*〜\)/)) {   this.blockMap.set(core, 'PM');   const t = m.match(/\((\d+:\d+)〜\)/)?.[1];   if (t) this.timeTagMap.set(core, `(〜${t})`); } else this.blockMap.set(core, 'ALL'); }); }
  applyDailyAdditions() { (this.ctx.customRules.dailyAdditions || []).forEach((rule: any) => { if (rule.date === this.day.id && rule.section && rule.count > 0 && rule.section !== "透析後胸部") { const placeholderName = rule.section + "枠" + (rule.time === "全日" || !rule.time ? "" : rule.time); let current = split(this.dayCells[rule.section]); if (!current.includes(placeholderName)) { for (let i = 0; i < rule.count; i++) current.push(placeholderName); this.dayCells[rule.section] = join(current); } } }); }
  evaluateEmergencies() {
    const tempAvailCount = this.ctx.activeGeneralStaff.filter(s => this.blockMap.get(s) !== 'ALL').length;
    (this.ctx.customRules.emergencies || []).forEach((em: any) => {
      if (em.type === "empty_room_swap") return;
      if (tempAvailCount > Number(em.threshold)) return;
      if (em.type === "role_assign" && em.role && em.section) {
        this.roleAssignments[em.role] = em;
        this.log(`🚨 [緊急ルール] 稼働可能${tempAvailCount}人以下のため ${em.role} を ${em.section} に優先配置`);
      }
      if (em.type === "staff_assign" && em.staff && em.section) {
        this.staffAssignments.push({ staff: em.staff, section: em.section });
        this.log(`🚨 [緊急ルール] 稼働可能${tempAvailCount}人以下のため ${em.staff} を ${em.section} に優先配置`);
      }
      if (em.type === "clear" && em.section) {
        if (!this.skipSections.includes(em.section)) this.skipSections.push(em.section);
        if (!this.clearSections.includes(em.section)) this.clearSections.push(em.section);
        this.log(`🚨 [緊急ルール] 稼働可能${tempAvailCount}人以下のため ${em.section} を空室扱い`);
      }
      if (em.type === "change_capacity" && em.section) {
        this.dynamicCapacity[em.section] = Number(em.newCapacity);
        this.log(`🚨 [緊急ルール] 稼働可能${tempAvailCount}人以下のため ${em.section} 定員を ${Number(em.newCapacity)} 名に変更`);
      }
    });
  }
  cleanUpDayCells() { Object.keys(this.dayCells).forEach(sec => { if (this.isMetadataKey(sec) || ["明け","入り","不在","土日休日代休"].includes(sec)) return; if (this.skipSections.includes(sec)) { this.dayCells[sec] = ""; return; } let members = split(this.dayCells[sec]).map(m => { const core = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(core)) return m; const block = this.blockMap.get(core); const tt = this.timeTagMap.get(core); if (block === 'ALL') return null; if (tt && m.includes(tt)) return m; if (block === 'AM' && m.includes('(AM)')) return null; if (block === 'PM' && m.includes('(PM)')) return null; if (block === 'PM' && tt && m.includes('(AM)')) return `${core}${tt}`; if (block === 'AM' && !m.includes('(PM)') && !m.match(/\(.*\)/)) return `${core}(PM)`; if (block === 'PM' && !m.match(/\(.*\)/)) return `${core}${tt || '(AM)'}`; return m; }).filter(Boolean) as string[]; this.dayCells[sec] = join(members); }); }
  prepareAvailability() { const supportStaffList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName); this.initialAvailAll = this.ctx.allStaff.filter(s => this.blockMap.get(s) !== 'ALL').sort((a, b) => { if ((this.counts[a] || 0) !== (this.counts[b] || 0)) return (this.counts[a] || 0) - (this.counts[b] || 0); return a.localeCompare(b, 'ja'); }); this.initialAvailSupport = this.initialAvailAll.filter(s => supportStaffList.includes(s)); this.initialAvailGeneral = this.initialAvailAll.filter(s => this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s)); this.initialAvailReception = this.initialAvailAll.filter(s => this.ctx.activeReceptionStaff.includes(s) || (this.ctx.activeGeneralStaff.includes(s) && !supportStaffList.includes(s))); }

  execute(): DayData {
    this.logPhase("フェーズ1：前提処理"); this.initCounts();
    if (this.prevDay?.cells["入り"]) { const iriMems = split(this.prevDay.cells["入り"]).map(extractStaffName); this.dayCells["明け"] = join(Array.from(new Set([...split(this.dayCells["明け"]), ...iriMems]))); if (iriMems.length > 0) this.log(`[前日処理] 昨日の「入り」を「明け」に配置`); }
    if (this.day.isPublicHoliday) { this.log(`🎌 祝日のためスキップ`); return { ...this.day, cells: this.dayCells, logInfo: this.logInfo }; }
    if (!this.isSmartFix) { ROOM_SECTIONS.forEach(sec => { if (sec === "透析後胸部") return; this.dayCells[sec] = join(split(this.dayCells[sec]).filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); }); this.dayCells["昼当番"] = ""; this.dayCells["受付ヘルプ"] = ""; }
    this.buildBlockMap();
    if (this.isSmartFix) { WORK_SECTIONS.forEach(sec => { let cur = split(this.dayCells[sec]); let nx = cur.filter(m => { const core = extractStaffName(m); const b = this.blockMap.get(core); if (ROLE_PLACEHOLDERS.includes(core)) return true; if (b === 'ALL') return false; const tt = this.timeTagMap.get(core); if (tt && m.includes(tt)) return true; if (b === 'AM' && (!m.includes('(') || m.includes('(AM)'))) return false; if (b === 'PM' && (!m.includes('(') || m.includes('(PM)'))) return false; if (b === 'PM' && tt && m.includes('(AM)')) return false; return true; }); if (cur.length !== nx.length) { this.dayCells[sec] = join(nx); } }); }
    this.applyDailyAdditions(); this.evaluateEmergencies(); this.cleanUpDayCells();
    WORK_SECTIONS.forEach(sec => { split(this.dayCells[sec]).forEach((m: string) => { const core = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(core) && this.blockMap.get(core) !== 'ALL') this.addUsage(core, getStaffAmount(m)); }); });
    this.prepareAvailability();
    
    if (this.isSmartFix) {
      const priority = this.ctx.customRules.priorityRooms || SECTIONS;
      priority.forEach((room: string) => {
         if (REST_SECTIONS.includes(room) || ["昼当番","受付ヘルプ","待機","透析後胸部"].includes(room) || this.shouldSkipAutoAssignRoom(room)) return;
         if ((this.ctx.customRules.linkedRooms || []).some((r:any) => r.target === room)) return;
         const cap = this.dynamicCapacity[room] || 1; const eff = this.getEffectiveTarget(room, cap); if (eff.allClosed) return;
         let current = split(this.dayCells[room]); const getAmt = (arr: string[]) => arr.reduce((acc, m) => acc + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
         const isFixedToAny = (staffName: string) => (this.ctx.customRules.fixed || []).some((r:any) => extractStaffName(r.staff) === extractStaffName(staffName));
         let sortedAvail = [...this.initialAvailGeneral]; sortedAvail.sort((a, b) => { const sA = (this.blockMap.get(a) === 'NONE' ? 0 : 100) + (this.shouldAvoidConsecutive(a, room) ? 2000 : 0) + (this.shouldAvoidWeeklyRepeat(a, room) ? 800 : 0); const sB = (this.blockMap.get(b) === 'NONE' ? 0 : 100) + (this.shouldAvoidConsecutive(b, room) ? 2000 : 0) + (this.shouldAvoidWeeklyRepeat(b, room) ? 800 : 0); if (sA !== sB) return sA - sB; return this.getPastRoomCount(a, room) - this.getPastRoomCount(b, room); });
         while (getAmt(current) < eff.cap) {
            const freeStaff = sortedAvail.find((s: string) => { 
                if (this.assignCounts[s] >= 1) return false; if (this.assignCounts[s] === 0.5 && (!["CT", "MRI", "治療", "RI"].includes(room) || !isMonthlyMainStaff(room, s, this.ctx.monthlyAssign))) return false; 
                if (this.isForbidden(s, room) || (room === "MMG" && !this.isMmgCapable(s)) || !this.canAddKenmu(s, room) || isFixedToAny(s)) return false; 
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
    
    this.logPhase("フェーズ2：固定・例外処理");
    (this.ctx.customRules.fixed || []).forEach((r: any) => { if (!r.staff || !r.section) return; Object.keys(this.dayCells).forEach(sec => { if (sec === r.section || REST_SECTIONS.includes(sec)) return; const bef = split(this.dayCells[sec]); const aft = bef.filter(m => extractStaffName(m) !== extractStaffName(r.staff)); if (bef.length !== aft.length) { this.dayCells[sec] = join(aft); this.assignCounts[extractStaffName(r.staff)] = 0; this.blockMap.set(extractStaffName(r.staff), 'NONE'); } }); });
    (this.ctx.customRules.fixed || []).forEach((r: any) => { const core = extractStaffName(r.staff); if (!core || !r.section || !this.initialAvailAll.includes(core) || this.isUsed(core) || this.isForbidden(core, r.section) || r.section === "透析後胸部" || this.skipSections.includes(r.section)) return; const cur = split(this.dayCells[r.section]); if (cur.map(extractStaffName).includes(core) || this.hasNGPair(core, cur.map(extractStaffName), false)) return; let t = this.getPreferredWorkTag(core); if (this.isTimeTagBlockedByFullDayRule(r.section, t)) return; this.blockMap.set(core, 'ALL'); this.dayCells[r.section] = join([...cur, `${core}${t}`]); this.addUsage(core, t?0.5:1); this.log(`🔒 [専従] ${core} を ${r.section} に固定配置`); });
    this.staffAssignments.forEach((r: any) => { const core = extractStaffName(r.staff); if (!core || !r.section || !this.initialAvailAll.includes(core) || this.isUsed(core) || this.isForbidden(core, r.section) || r.section === "透析後胸部" || this.skipSections.includes(r.section)) return; const cur = split(this.dayCells[r.section]); if (cur.map(extractStaffName).includes(core) || this.hasNGPair(core, cur.map(extractStaffName), false)) return; let t = this.getPreferredWorkTag(core); if (this.isTimeTagBlockedByFullDayRule(r.section, t)) return; this.blockMap.set(core, 'ALL'); this.dayCells[r.section] = join([...cur, `${core}${t}`]); this.addUsage(core, t?0.5:1); this.log(`🚨 [緊急強制] ${core} を ${r.section} に配置`); });
    Object.values(this.roleAssignments).forEach((ra: any) => { if (this.skipSections.includes(ra.section) || ra.section === "透析後胸部") return; const cand = split(this.ctx.monthlyAssign[ra.role] || "").map(extractStaffName); const tAvail = ["受付"].includes(ra.role) ? this.initialAvailReception : this.initialAvailGeneral; const st = cand.find(s => tAvail.includes(s) && !this.isUsed(s) && !this.isForbidden(s, ra.section)); if (st && !split(this.dayCells[ra.section]).map(extractStaffName).includes(st)) { let t = this.getPreferredWorkTag(st); if (this.isTimeTagBlockedByFullDayRule(ra.section, t)) return; this.blockMap.set(st, 'ALL'); this.dayCells[ra.section] = join([...split(this.dayCells[ra.section]), `${st}${t}`]); this.addUsage(st, t?0.5:1); this.log(`📌 [緊急役割] ${st} を ${ra.section} に配置`); } });
    (this.ctx.customRules.substitutes || []).forEach((sub: any) => { const tgts = split(sub.target).map(extractStaffName); if (tgts.length === 0 || !sub.section || this.skipSections.includes(sub.section) || sub.section === "透析後胸部" || tgts.some(t => split(this.dayCells[sub.section]).map(extractStaffName).includes(t)) || !tgts.every(t => !this.initialAvailAll.includes(t))) return; const fs = split(sub.subs).map(extractStaffName).filter(s => this.initialAvailGeneral.includes(s) && !this.isUsed(s) && !this.isForbidden(s, sub.section)); if (fs.length > 0) { const cMems = split(this.dayCells[sub.section]); for (const f of fs) { if (this.isHalfDayBlocked(f, sub.section).hard || this.hasNGPair(f, cMems.map(extractStaffName), false) || !this.canAddKenmu(f, sub.section)) continue; let t = this.getPreferredWorkTag(f); if (this.isTimeTagBlockedByFullDayRule(sub.section, t)) continue; this.blockMap.set(f, 'ALL'); this.dayCells[sub.section] = join([...cMems, `${f}${t}`]); this.addUsage(f, t?0.5:1); this.log(`🔄 [代打] ${f} を ${sub.section} に配置`); break; } } });
    this.applyPushOutRules();

    this.logPhase("フェーズ3：メイン配置");
    const PRIORITY_LIST = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
    const linkedTargetRooms = (this.ctx.customRules.linkedRooms || []).map((r: any) => r.target);
    PRIORITY_LIST.forEach((room: string) => {
      if (this.skipSections.includes(room) || ["受付ヘルプ", "昼当番", "待機", "透析後胸部"].includes(room) || this.shouldSkipAutoAssignRoom(room)) return;
      let targetCount = this.dynamicCapacity[room] !== undefined ? this.dynamicCapacity[room] : (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
      let cMems = split(this.dayCells[room]); const ph = cMems.filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)));
      const phTags: string[] = []; if (ph.length > 0) { ph.forEach(p => { const core = extractStaffName(p); const tag = p.substring(core.length); if (tag) phTags.push(tag); }); targetCount += ph.length; this.dayCells[room] = join(cMems.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)))); }
      if (room === "受付") {
        let cUke = split(this.dayCells["受付"]); const ukeMo = split(this.ctx.monthlyAssign.受付 || "").map(extractStaffName);
        for (const n of ukeMo) { if (this.initialAvailAll.includes(n) && !this.isUsed(n) && !cUke.map(extractStaffName).includes(n)) { const b = this.blockMap.get(n); if (b === 'ALL') continue; let t = b==='AM'?"(PM)":b==='PM'?"(AM)":""; cUke.push(`${n}${t}`); this.addUsage(n, t?0.5:1); this.blockMap.set(n, 'ALL'); } }
        const cUkeAmt = cUke.reduce((sum: number, m: string) => sum + getStaffAmount(m), 0); let needUke = targetCount - cUkeAmt;
        if (needUke > 0 && !linkedTargetRooms.includes(room)) { const pUke = this.pick(this.initialAvailReception, this.initialAvailReception, Math.ceil(needUke), "受付", cUke); pUke.forEach((n: string) => { let t = this.getPreferredWorkTag(n); cUke.push(`${n}${t}`); this.addUsage(n, t?0.5:1); this.blockMap.set(n, 'ALL'); }); }
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

    this.processPostTasks(); return { ...this.day, cells: this.dayCells, logInfo: this.logInfo };
  }

  fill(availList: string[], section: string, preferredList: string[], targetCount: number, forcedNeedTag: string = "") {
    if (this.skipSections.includes(section) || section === "透析後胸部" || this.shouldSkipAutoAssignRoom(section)) return; const eff = this.getEffectiveTarget(section, targetCount); if (eff.allClosed) return;
    const originalPlaceholders = split(this.dayCells[section]).filter(m => ROLE_PLACEHOLDERS.includes(extractStaffName(m)));
    let current = split(this.dayCells[section]); const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + getStaffAmount(m), 0); let prevAmount = -1;
    while (getCurrentAmount(current) < eff.cap) {
      const currentAmount = getCurrentAmount(current); if (currentAmount === prevAmount) break; prevAmount = currentAmount;
      const remaining = eff.cap - currentAmount; let curAm = eff.amClosed ? 999 : 0; let curPm = eff.pmClosed ? 999 : 0; let placeholderTag = ""; current.forEach(x => { const xc = extractStaffName(x); if (ROLE_PLACEHOLDERS.includes(xc)) {   const xt = x.substring(xc.length);   if (xt) placeholderTag = xt;   return; } if (x.includes("(AM)")) curAm++; else if (x.includes("(PM)")) curPm++; else { curAm++; curPm++; } });
      let needTag = forcedNeedTag || placeholderTag || ""; if (!needTag) { if (curAm >= targetCount && curPm < targetCount) needTag = "(PM)"; else if (curPm >= targetCount && curAm < targetCount) needTag = "(AM)"; else if (remaining === 0.5) { if (curAm > curPm) needTag = "(PM)"; else if (curPm > curAm) needTag = "(AM)"; } }
      const getFilterReason = (name: string): RejectReason | null => { if (current.map(extractStaffName).includes(name)) return { hard: true, msg: "同室配置済" }; if (this.isUsed(name)) return { hard: true, msg: "他業務配置済" }; if (this.isForbidden(name, section)) return { hard: true, msg: "担当不可" }; if (section === "MMG" && !this.isMmgCapable(name)) return { hard: true, msg: "MMG外" }; if (!this.canAddKenmu(name, section)) return { hard: true, msg: "兼務上限" }; const b = this.blockMap.get(name); if (needTag && b === 'NONE') { if (!eff.pmClosed && !eff.amClosed && !isMonthlyMainStaff(section, name, this.ctx.monthlyAssign)) return { hard: true, msg: "半端枠" }; } if (b === 'ALL') return { hard: true, msg: "全日ブ" }; if (needTag === "(AM)" && b === 'AM') return { hard: true, msg: "AMブ" }; if (needTag === "(PM)" && b === 'PM') return { hard: true, msg: "PMブ" }; if (eff.pmClosed && b === 'AM') return { hard: true, msg: "午後休" }; if (eff.amClosed && b === 'PM') return { hard: true, msg: "午前休" }; if (this.isTimeTagBlockedByFullDayRule(section, needTag || b || "")) return { hard: true, msg: "半日不可" }; if (this.isHalfDayBlocked(name, section).hard) return { hard: true, msg: "半日不可" }; if (this.shouldAvoidConsecutive(name, section)) return { hard: false, msg: "連日回避" }; if (this.shouldAvoidWeeklyRepeat(name, section)) return { hard: false, msg: "週1回優先" }; if (this.hasNGPair(name, current.map(extractStaffName), false)) return { hard: true, msg: "絶対NG" }; if (this.hasNGPair(name, current.map(extractStaffName), true)) return { hard: false, msg: "なるべくNG" }; return null; };
      const cWR = availList.map(n => ({ n, r: getFilterReason(n) })); let vN = cWR.filter(c => !c.r).map(c => c.n); let fM = ""; if (!vN.length) { const sC = cWR.filter(c => c.r && !c.r.hard); if (sC.length > 0) { vN = sC.map(c => c.n); fM = "（⚠️特例）"; } else break; }
      if (section === "ポータブル") vN = this.preferNonRepeatCandidates(vN, section, (name: string) => name);
      const vP = vN.filter(n => preferredList.includes(n)); const vA = vN.filter(n => !preferredList.includes(n));
      const sCnd = (cs: string[]) => { let ms = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName), sps = split(this.ctx.monthlyAssign[section + "サブ優先"] || "").map(extractStaffName), ss = split(this.ctx.monthlyAssign[section + "サブ"] || "").map(extractStaffName); if (section === "治療" || section === "RI") { ms = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName); if (section === "治療") { sps = split(this.ctx.monthlyAssign.治療サブ優先 || "").map(extractStaffName); ss = split(this.ctx.monthlyAssign.治療サブ || "").map(extractStaffName); } else { ss = split(this.ctx.monthlyAssign.RIサブ || "").map(extractStaffName); } } const hA = vN.some(s => this.blockMap.get(s) === 'PM'); const hP = vN.some(s => this.blockMap.get(s) === 'AM'); return [...cs].sort((a, b) => { const bA = this.blockMap.get(a), bB = this.blockMap.get(b); let sA = 0, sB = 0; if (ms.includes(a)) sA += 10000; else if (sps.includes(a)) sA += 5000; else if (ss.includes(a)) sA += 2000; if (ms.includes(b)) sB += 10000; else if (sps.includes(b)) sB += 5000; else if (ss.includes(b)) sB += 2000; if (this.isHalfDayBlocked(a, section).monthlyHalfException) sA -= 3000; if (this.isHalfDayBlocked(b, section).monthlyHalfException) sB -= 3000; const rw = ["MRI", "CT"].includes(section) ? 200 : 100; sA -= (this.roomCounts[a]?.[section] || 0) * rw; sB -= (this.roomCounts[b]?.[section] || 0) * rw; if (this.shouldAvoidConsecutive(a, section)) sA -= 2200; else if (this.shouldAvoidWeeklyRepeat(a, section)) sA -= 900; if (this.shouldAvoidConsecutive(b, section)) sB -= 2200; else if (this.shouldAvoidWeeklyRepeat(b, section)) sB -= 900; if (section === "ポータブル") { sA -= this.getRepeatAvoidPenalty(a, section); sB -= this.getRepeatAvoidPenalty(b, section); } if (needTag === "") { if (bA === 'NONE') sA += 200; else if (hA && hP && (bA === 'AM' || bA === 'PM')) sA += 100; } else { if (needTag === "(AM)" && bA === 'PM') sA += 200; if (needTag === "(PM)" && bA === 'AM') sA += 200; if (bA === 'NONE') sA += 100; } if (needTag === "") { if (bB === 'NONE') sB += 200; else if (hA && hP && (bB === 'AM' || bB === 'PM')) sB += 100; } else { if (needTag === "(AM)" && bB === 'PM') sB += 200; if (needTag === "(PM)" && bB === 'AM') sB += 200; if (bB === 'NONE') sB += 100; } return sB - sA || (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0) || a.localeCompare(b, 'ja'); }); };
      const pC = this.pick(vN, [...sCnd(vP), ...sCnd(vA)], 1, section, current.map(extractStaffName)); if (!pC.length) break;
      const c = pC[0], b = this.blockMap.get(c); let t = section === "ポータブル" ? this.getPortableTag(c) : this.getPreferredWorkTag(c); let f = t ? 0.5 : 1; if (b === 'AM' && !t) { t = "(PM)"; f = 0.5; this.blockMap.set(c, 'ALL'); } else if (b === 'PM' && !t) { t = "(AM)"; f = 0.5; this.blockMap.set(c, 'ALL'); } else if (t) { this.blockMap.set(c, 'ALL'); } else { if (needTag) { t = needTag; f = 0.5; this.blockMap.set(c, needTag === "(AM)" ? 'AM' : 'PM'); } else if (eff.pmClosed) { t = "(AM)"; f = 0.5; this.blockMap.set(c, 'AM'); } else if (eff.amClosed) { t = "(PM)"; f = 0.5; this.blockMap.set(c, 'PM'); } else { t = ""; f = 1; this.blockMap.set(c, 'ALL'); } }
      current.push(`${c}${t}`); this.addUsage(c, f); this.log(`✅ [配置決定] ${section} に ${c}${t} ${fM}`);
    }
    const remainingPlaceholders = originalPlaceholders.filter((_, idx) => idx < Math.max(0, targetCount - current.length));
    this.dayCells[section] = join([...current, ...remainingPlaceholders]);
  }

  processPostTasks() {
    this.logPhase("フェーズ4：兼務・救済・遅番");
    const sSL = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName); const lowPriorityStaff = split(this.ctx.customRules.lateShiftLowPriorityStaff || "").map(extractStaffName);
    this.initialAvailSupport.forEach(staff => {
      if (this.isUsed(staff)) return;
      for (const rm of split(this.ctx.customRules.supportTargetRooms)) {
        if (this.skipSections.includes(rm) || this.isForbidden(staff, rm) || rm === "透析後胸部" || this.shouldSkipAutoAssignRoom(rm)) continue;
        const c = split(this.dayCells[rm]);
        if (c.length > 0 && !c.map(extractStaffName).includes(staff) && !this.hasNGPair(staff, c.map(extractStaffName), false)) {
          const t = this.getPreferredWorkTag(staff);
          if (this.isTimeTagBlockedByFullDayRule(rm, t)) continue;
          this.dayCells[rm] = join([...c, `${staff}${t}`]);
          this.addUsage(staff, t ? 0.5 : 1);
          this.blockMap.set(staff, 'ALL');
          this.log(`🤝 [サポート兼務] ${staff} を ${rm} の2人目として追加`);
          break;
        }
      }
    });
    
    this.releaseSupportPartnersForEmptyRooms();
    
    (this.ctx.customRules.swapRules || []).forEach((r: any) => {
      if (!r.targetRoom || !r.triggerRoom || !r.sourceRooms || r.targetRoom === "透析後胸部" || r.triggerRoom === "透析後胸部") return;
      const tC = this.dynamicCapacity[r.targetRoom] ?? (["CT", "MRI", "治療"].includes(r.targetRoom) ? 3 : 1);
      if (split(this.dayCells[r.targetRoom]).reduce((s, m) => s + getStaffAmount(m), 0) >= tC) return;
      const tM = split(this.dayCells[r.triggerRoom]);
      if (!tM.length) return;
      if (tM.some(m => { const c = extractStaffName(m); return !ROLE_PLACEHOLDERS.includes(c) && !this.isForbidden(c, r.targetRoom) && !this.isHalfDayBlocked(c, r.targetRoom).hard && this.canAddKenmu(c, r.targetRoom, true); })) return;
      let swapped = false;
      for (const sSR of split(r.sourceRooms).sort((a, b) => this.getRescueSourceScore(parseRoomCond(a).r, r.targetRoom) - this.getRescueSourceScore(parseRoomCond(b).r, r.targetRoom))) {
        const { r: sR } = parseRoomCond(sSR);
        if (sR === r.triggerRoom || sR === "透析後胸部") continue;
        const sM = split(this.dayCells[sR]);
        if (!sM.length) { this.log(`↪️ [交換スキップ] ${r.targetRoom}: ${sR} に交換候補なし`); continue; }
        const sCandidates = sM.filter(m => {
          const c = extractStaffName(m);
          return !ROLE_PLACEHOLDERS.includes(c) && !this.isForbidden(c, r.targetRoom) && !this.isHalfDayBlocked(c, r.targetRoom).hard && !this.isForbidden(c, r.triggerRoom) && !this.isTimeTagBlockedByFullDayRule(r.targetRoom, m);
        });
        sCandidates.sort((a, b) => this.getTodayRoomLoad(extractStaffName(a)) - this.getTodayRoomLoad(extractStaffName(b)) || this.getPastRoomCount(extractStaffName(a), r.targetRoom) - this.getPastRoomCount(extractStaffName(b), r.targetRoom));
        if (!sCandidates.length) { this.log(`↪️ [交換スキップ] ${r.targetRoom}: ${sR} に ${r.targetRoom} 適格者なし`); continue; }
        for (const sm of sCandidates) {
          const sCo = extractStaffName(sm);
          const tTK = tM.find(m => {
            const tc = extractStaffName(m);
            return !this.isForbidden(tc, sR) && !this.isHalfDayBlocked(tc, sR).hard && !this.hasNGPair(tc, sM.map(extractStaffName), false);
          });
          if (!tTK) { this.log(`↪️ [交換スキップ] ${r.targetRoom}: ${sR} に戻せる ${r.triggerRoom} 担当がいない`); continue; }
          const targetMembers = split(this.dayCells[r.targetRoom]);
          if (this.hasNGPair(sCo, targetMembers.map(extractStaffName), false)) { this.log(`↪️ [交換スキップ] ${r.targetRoom}: ${sCo} は NG ペア`); continue; }
          const sourceTag = this.getMemberTimeTag(sm);
          const triggerTag = this.getMemberTimeTag(tTK);
          const movedToTrigger = `${sCo}${sourceTag}`;
          const movedToSource = `${extractStaffName(tTK)}${triggerTag}`;
          this.dayCells[r.triggerRoom] = join(tM.map(m => m === tTK ? movedToTrigger : m));
          this.dayCells[sR] = join(sM.map(m => m === sm ? movedToSource : m));
          if (!targetMembers.some(m => extractStaffName(m) === sCo)) {
            this.dayCells[r.targetRoom] = join([...targetMembers, movedToTrigger]);
          }
          this.refreshAssignmentState();
          this.log(`🔄 [交換成立] ${r.triggerRoom}の${extractStaffName(tTK)}と ${sR}の${sCo}を交換し、${sCo} を ${r.targetRoom} に配置`);
          swapped = true;
          break;
        }
        if (swapped) break;
      }
      if (!swapped) this.log(`↪️ [交換不成立] ${r.targetRoom} を埋められず`);
    });

    let uG1 = this.initialAvailGeneral.filter(s => !this.isUsed(s) && this.blockMap.get(s) !== 'ALL');
    (this.ctx.customRules.linkedRooms || []).forEach((r: any) => {
      if (!r.target || this.skipSections.includes(r.target) || r.target === "透析後胸部" || this.shouldSkipAutoAssignRoom(r.target)) return;
      if (this.isLinkedTargetRoom(r.target)) return;
      const tC = this.dynamicCapacity[r.target] ?? (["CT", "MRI", "治療"].includes(r.target) ? 3 : 1); const e = this.getEffectiveTarget(r.target, tC); if (e.allClosed) return;
      let cM = split(this.dayCells[r.target]); let cA = 0, cP = 0; cM.forEach(x => { if (x.includes("(AM)")) cA++; else if (x.includes("(PM)")) cP++; else { cA++; cP++; } });
      if (cM.length > 0 && cM.every(m => sSL.includes(extractStaffName(m)))) { cA = 0; cP = 0; } uG1.sort((a, b) => this.getRepeatAvoidPenalty(a, r.target) - this.getRepeatAvoidPenalty(b, r.target) || this.getTodayRoomCount(a) - this.getTodayRoomCount(b) || this.getPastRoomCount(a, r.target) - this.getPastRoomCount(b, r.target));
      while ((cA < tC || cP < tC) && uG1.length > 0) { const ci = uG1.findIndex(s => { let candidateTag = this.getPreferredWorkTag(s); if (!candidateTag) { if (cA >= tC) candidateTag = "(PM)"; else if (cP >= tC) candidateTag = "(AM)"; } return this.isUnassignedForRelief(s, candidateTag) && !this.isForbidden(s, r.target) && !this.isHalfDayBlocked(s, r.target).hard && !this.hasNGPair(s, cM.map(extractStaffName), false) && !(r.target === "MMG" && !this.isMmgCapable(s)) && this.canAddKenmu(s, r.target) && !(cP >= tC && this.blockMap.get(s) === 'AM') && !(cA >= tC && this.blockMap.get(s) === 'PM') && !this.isTimeTagBlockedByFullDayRule(r.target, candidateTag || this.blockMap.get(s) || ""); }); if (ci === -1) break; const st = uG1[ci]; uG1.splice(ci, 1); let t = this.getPreferredWorkTag(st); if (!t) { if (cA >= tC) t = "(PM)"; else if (cP >= tC) t = "(AM)"; } this.blockMap.set(st, t === "" ? 'ALL' : t === "(AM)" ? 'PM' : 'AM'); cM.push(`${st}${t}`); if (t === "(AM)") cA++; else if (t === "(PM)") cP++; else { cA++; cP++; } this.addUsage(st, t ? 0.5 : 1); this.log(`🙌 [負担軽減] 余剰の ${st} を ${r.target} に専任配置`); } this.dayCells[r.target] = join(cM);
    });


    const processKenmu = (sm: string[], tm: string[], tr: string) => { if (tr === "透析後胸部") return tm; const tC = this.dynamicCapacity[tr] || 1; const tcs = tm.map(extractStaffName); let cA = tm.reduce((s, m) => s + getStaffAmount(m), 0); for (const m of sm) { if (cA >= tC) break; const c = extractStaffName(m); if (tcs.includes(c) || m.includes("17:") || m.includes("19:") || this.isForbidden(c, tr) || this.isHalfDayBlocked(c, tr).hard || this.hasNGPair(c, tcs, false) || !this.canAddKenmu(c, tr) || this.isTimeTagBlockedByFullDayRule(tr, m)) continue; let pS = m, cam = 0, cpm = 0; tm.forEach(x => { if (x.includes("(AM)")) cam++; else if (x.includes("(PM)")) cpm++; else { cam++; cpm++; } }); if (cam < tC && cpm >= tC) { if (m.includes("(PM)")) continue; pS = `${c}(AM)`; } else if (cam >= tC && cpm < tC) { if (m.includes("(AM)")) continue; pS = `${c}(PM)`; } tm.push(pS); tcs.push(c); const a = getStaffAmount(pS); cA += a; this.addUsage(c, a); this.updateBlockMapAfterKenmu(c, pS); } return tm; };
    (this.ctx.customRules.kenmuPairs || []).forEach((p: any) => { if (!p.s1 || !p.s2 || p.s1 === "透析後胸部" || p.s2 === "透析後胸部") return; let m1 = split(this.dayCells[p.s1]), m2 = split(this.dayCells[p.s2]); this.dayCells[p.s2] = join(processKenmu(m1, m2, p.s2)); m2 = split(this.dayCells[p.s2]); this.dayCells[p.s1] = join(processKenmu(m2, m1, p.s1)); });

    (this.ctx.customRules.linkedRooms || []).forEach((r: any) => {
      if (!r.target || this.skipSections.includes(r.target) || r.target === "透析後胸部" || this.shouldSkipAutoAssignRoom(r.target)) return; const tC = this.dynamicCapacity[r.target] ?? (["CT", "MRI", "治療"].includes(r.target) ? 3 : 1); const e = this.getEffectiveTarget(r.target, tC); if (e.allClosed) return;
      let cM = split(this.dayCells[r.target]); let cA = 0, cP = 0; cM.forEach(x => { if (x.includes("(AM)")) cA++; else if (x.includes("(PM)")) cP++; else { cA++; cP++; } });
      const linkedCandidates: { member: string; sourceRoom: string; sourceIndex: number }[] = [];
      split(r.sources).forEach((sSR: string, sourceIndex: number) => {
        const { r: sR, min } = parseRoomCond(sSR);
        if (sR === "透析後胸部" || this.shouldSkipAutoAssignRoom(sR) || (min > 0 && split(this.dayCells[sR]).reduce((s, m) => s + getStaffAmount(m), 0) < min)) return;
        split(this.dayCells[sR]).forEach(m => {
          const c = extractStaffName(m);
          if (ROLE_PLACEHOLDERS.includes(c) || linkedCandidates.some(x => extractStaffName(x.member) === c) || cM.map(extractStaffName).includes(c) || this.isForbidden(c, r.target) || this.isHalfDayBlocked(c, r.target).hard || this.shouldAvoidConsecutive(c, r.target) || this.hasNGPair(c, cM.map(extractStaffName), false) || (r.target === "MMG" && !this.isMmgCapable(c)) || !this.canAddKenmu(c, r.target, true) || m.includes("17:") || m.includes("19:") || this.isTimeTagBlockedByFullDayRule(r.target, m)) return;
          linkedCandidates.push({ member: m, sourceRoom: sR, sourceIndex });
        });
      });
      const narrowedLinkedCandidates = r.target === "ポータブル" ? this.preferNonRepeatCandidates(linkedCandidates, r.target, (item) => extractStaffName(item.member)) : linkedCandidates;
      narrowedLinkedCandidates.sort((a, b) => {
        const srcDiff = a.sourceIndex - b.sourceIndex;
        const repeatDiff = this.getRepeatAvoidPenalty(extractStaffName(a.member), r.target) - this.getRepeatAvoidPenalty(extractStaffName(b.member), r.target);
        const todayDiff = this.getTodayRoomCount(extractStaffName(a.member)) - this.getTodayRoomCount(extractStaffName(b.member));
        const pastDiff = this.getPastRoomCount(extractStaffName(a.member), r.target) - this.getPastRoomCount(extractStaffName(b.member), r.target);
        return r.target === "ポータブル" ? (srcDiff || repeatDiff || todayDiff || pastDiff) : (repeatDiff || todayDiff || pastDiff || srcDiff);
      });
      for (const candidate of narrowedLinkedCandidates) { if (cA >= tC && cP >= tC) break; const sR = candidate.sourceRoom; const m = candidate.member; const c = extractStaffName(m); if (cM.map(extractStaffName).includes(c)) continue; let pS = m; if (r.target === "パノラマCT" && sR === "透視（6号）") { if (m.includes("(PM)")) continue; pS = `${c}(AM)`; } else { if (cA < tC && cP >= tC) { if (m.includes("(PM)")) continue; pS = `${c}(AM)`; } else if (cA >= tC && cP < tC) { if (m.includes("(AM)")) continue; pS = `${c}(PM)`; } else if (e.pmClosed) { if (m.includes("(PM)")) continue; pS = `${c}(AM)`; } else if (e.amClosed) { if (m.includes("(AM)")) continue; pS = `${c}(PM)`; } } cM.push(pS); if (pS.includes("(AM)")) cA++; else if (pS.includes("(PM)")) cP++; else { cA++; cP++; } this.addUsage(c, getStaffAmount(pS)); this.updateBlockMapAfterKenmu(c, pS); this.log(`🔗 [基本兼務] ${sR} の ${pS} を ${r.target} にセット配置しました`); }
      this.dayCells[r.target] = join(cM);
    });

    this.refreshAssignmentState();

    ROOM_SECTIONS.forEach(tR => {
      if (this.clearSections.includes(tR) || ["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(tR) || this.shouldSkipAutoAssignRoom(tR)) return; const tC = this.dynamicCapacity[tR] ?? (["CT", "MRI", "治療"].includes(tR) ? 3 : 1); const e = this.getEffectiveTarget(tR, tC); if (e.allClosed) return;
      let cM = split(this.dayCells[tR]); let cA = e.amClosed ? 999 : 0, cP = e.pmClosed ? 999 : 0; cM.forEach(x => { if (x.includes("(AM)")) cA++; else if (x.includes("(PM)")) cP++; else { cA++; cP++; } }); if (cM.length > 0 && cM.every(m => sSL.includes(extractStaffName(m)))) { cA = e.amClosed ? 999 : 0; cP = e.pmClosed ? 999 : 0; } if (cA >= tC && cP >= tC) return;
      const mR = (this.ctx.customRules.rescueRules || []).filter((r: any) => r.targetRoom === tR); let sRms = mR.length > 0 ? mR.flatMap((r: any) => split(r.sourceRooms || "")).sort((a: string, b: string) => this.getRescueSourceScore(parseRoomCond(a).r, tR) - this.getRescueSourceScore(parseRoomCond(b).r, tR)) : ["3号室", "パノラマCT", "2号室", "1号室", "5号室", "CT(4)"].filter(r => r !== tR);
      if (sRms.length > 0) { let cnds: { c: string, fS: string, i: number }[] = []; sRms.forEach((sS: string, i: number) => { const { r: sR, min } = parseRoomCond(sS); if (sR === tR || sR === "透析後胸部" || (min > 0 && split(this.dayCells[sR]).reduce((s, m) => s + getStaffAmount(m), 0) < min)) return; split(this.dayCells[sR]).forEach(m => { const c = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(c) && !cnds.some(x => x.c === c) && !this.isForbidden(c, tR) && !this.isHalfDayBlocked(c, tR).hard && !this.shouldAvoidConsecutive(c, tR) && !m.includes("17:") && !this.isTimeTagBlockedByFullDayRule(tR, m)) cnds.push({ c, fS: m, i }); }); }); const cCs = cM.map(extractStaffName); cnds = cnds.filter(c => !cCs.includes(c.c) && (tR === "MMG" ? this.isMmgCapable(c.c) : true) && this.canAddKenmu(c.c, tR, true)); if (tR === "ポータブル") cnds = this.preferNonRepeatCandidates(cnds, tR, (item) => item.c); cnds.sort((a, b) => this.getRepeatAvoidPenalty(a.c, tR) - this.getRepeatAvoidPenalty(b.c, tR) || this.getTodayRoomCount(a.c) - this.getTodayRoomCount(b.c) || this.getPastRoomCount(a.c, tR) - this.getPastRoomCount(b.c, tR) || a.i - b.i || (this.assignCounts[a.c] || 0) - (this.assignCounts[b.c] || 0)); for (const cn of cnds) { if (cA >= tC && cP >= tC) break; if (this.hasNGPair(cn.c, cCs, false)) continue; let pS = cn.fS; if (cA < tC && cP >= tC) { if (cn.fS.includes("(PM)")) continue; pS = `${cn.c}(AM)`; } else if (cA >= tC && cP < tC) { if (cn.fS.includes("(AM)")) continue; pS = `${cn.c}(PM)`; } else if (e.pmClosed) { if (cn.fS.includes("(PM)")) continue; pS = `${cn.c}(AM)`; } else if (e.amClosed) { if (cn.fS.includes("(AM)")) continue; pS = `${cn.c}(PM)`; } cM.push(pS); if (pS.includes("(AM)")) cA++; else if (pS.includes("(PM)")) cP++; else { cA++; cP++; } this.addUsage(cn.c, getStaffAmount(pS)); this.updateBlockMapAfterKenmu(cn.c, pS); } this.dayCells[tR] = join(cM); }
    });

    this.releaseSupportPartnersForEmptyRooms();
    this.trimOverloadedSupportPartners();
    this.placeSupportStaffAsLastResort();
    this.releaseSupportPartnersForEmptyRooms();

    (this.ctx.customRules.emergencies || []).forEach((em: any) => {
      if (em.type !== "empty_room_swap") return; const wR = em.section; const sRL = split(em.sourceRooms || em.sourceRoom || ""); if (!wR || !sRL.length || this.skipSections.includes(wR) || wR === "透析後胸部") return; const wC = this.dynamicCapacity[wR] ?? 1; if (split(this.dayCells[wR]).reduce((s, m) => s + getStaffAmount(m), 0) >= wC) return;
      let sw = false; for (const sF of sRL) { if (sw || sF === "透析後胸部") break; const sM = split(this.dayCells[sF]); if (!sM.length) continue; const ngI = sM.filter(m => { const c = extractStaffName(m); return !ROLE_PLACEHOLDERS.includes(c) && (this.isForbidden(c, wR) || !this.canAddKenmu(c, wR, true)); }); if (!ngI.length) continue; for (const src of ROOM_SECTIONS.filter(r => r !== wR && r !== sF && !this.skipSections.includes(r) && !["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r))) { if (sw) break; const rM = split(this.dayCells[src]); const currentTargetMembers = split(this.dayCells[wR]); const oC = rM.filter(m => { const c = extractStaffName(m); return !ROLE_PLACEHOLDERS.includes(c) && !this.isForbidden(c, wR) && !this.isForbidden(c, sF) && !this.isHalfDayBlocked(c, wR).hard && !this.hasNGPair(c, currentTargetMembers.map(extractStaffName), false) && (wR === "MMG" ? this.isMmgCapable(c) : true) && this.canAddKenmu(c, wR, true) && !m.includes("17:") && !m.includes("19:") && !this.isTimeTagBlockedByFullDayRule(wR, m); }); for (const om of oC) { const oc = extractStaffName(om); const km = ngI.find(m => { const c = extractStaffName(m); return !this.isForbidden(c, src) && !this.isHalfDayBlocked(c, src).hard && !this.hasNGPair(c, rM.map(extractStaffName), false) && this.canAddKenmu(c, src, true); }); if (!km) continue; const kc = extractStaffName(km); const sourceTag = this.getMemberTimeTag(om); const swappedTag = this.getMemberTimeTag(km); const movedToSwapSource = `${oc}${sourceTag}`; const movedToSrc = `${kc}${swappedTag}`; if (this.isTimeTagBlockedByFullDayRule(wR, movedToSwapSource)) continue; this.dayCells[sF] = join(sM.map(m => m === km ? movedToSwapSource : m)); this.dayCells[src] = join(rM.map(m => m === om ? movedToSrc : m)); if (!currentTargetMembers.some(m => extractStaffName(m) === oc)) { this.dayCells[wR] = join([...currentTargetMembers, movedToSwapSource]); this.addUsage(oc, getStaffAmount(movedToSwapSource)); this.updateBlockMapAfterKenmu(oc, movedToSwapSource); this.log(`🧩 [緊急交換] ${src} の ${oc} を ${sF} 経由で ${wR} に補充`); } sw = true; break; } } }
    });

    this.applyPushOutRules();
    this.rebalanceNoConsecutiveRooms();

    (this.ctx.customRules.lateShifts || []).forEach((rule: any) => {
      let current = split(this.dayCells[rule.section]);
      if (current.length > 0 && !current.some(m => m.includes("17:") || m.includes("18:"))) {
        const usedCountThisWeek = this.pastDaysInWeek.filter((pd: DayData) =>
          split(pd.cells[rule.section] || "").some((m: string) =>
            !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:")
          )
        ).length;
        if (rule.fromSecondUseInWeek && usedCountThisWeek === 0) {
          this.log(`🕒 [遅番保留] ${rule.section} は部屋として今週初回のため遅番を付与しない`);
          return;
        }
        const currentCore = current.map(extractStaffName);
        const prevLateStaff = this.prevDay ? split(this.prevDay.cells[rule.section] || "").filter((m: string) => m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")).map(extractStaffName) : [];
        const excludeStaff = Array.from(new Set([...split(this.ctx.customRules.noLateShiftStaff || "").map(extractStaffName), ...split(this.ctx.customRules.noLateShiftRooms || "").flatMap(r => split(this.dayCells[r] || "").map(extractStaffName))]));
        const candidates = this.initialAvailGeneral.filter(n => !currentCore.includes(n) && !this.isForbidden(n, rule.section) && !excludeStaff.includes(n) && !this.hasPmAbsence(n) && this.getTodayRoomLoad(n) > 0 && !hasFluoroAuxConflict(this.dayCells, n, rule.section, this.ctx.customRules.fluoroAuxConflictRooms));
        candidates.sort((a, b) => { let sA = this.getPastLateShiftCount(a) * 100; let sB = this.getPastLateShiftCount(b) * 100; const idxA = lowPriorityStaff.indexOf(a); const idxB = lowPriorityStaff.indexOf(b); if (idxA !== -1) sA += 100000 + ((lowPriorityStaff.length - idxA) * 10000); if (idxB !== -1) sB += 100000 + ((lowPriorityStaff.length - idxB) * 10000); if (sA !== sB) return sA - sB; return a.localeCompare(b, 'ja'); });
        let picked = candidates.find(n => !prevLateStaff.includes(n));
        if (!picked && candidates.length > 0) picked = candidates[0];
        if (picked) {
          current.push(`${picked}${rule.lateTime}`);
          const prevBlock = this.blockMap.get(picked);
          this.blockMap.set(picked, prevBlock === 'AM' ? 'ALL' : (prevBlock || 'PM'));
          this.dayCells[rule.section] = join(current);
          this.lateShiftAssigned.add(picked);
          this.assignCounts[picked] = this.getAssignedUsage(picked);
          this.log(`🌙 [遅番確定] ${picked} を ${rule.section} の遅番に配置`);
        }
      }
    });

    const pM = split(this.dayCells["ポータブル"]); const r2M = split(this.dayCells["2号室"]); const r2C = r2M.map(extractStaffName); const r2A = r2M.reduce((s, m) => s + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);
    let nAH = false, nPH = false; r2M.forEach(rm => { const c = extractStaffName(rm); const pm = pM.find(x => extractStaffName(x) === c); if (pm) { if (pm.includes("(AM)")) nAH = true; else if (pm.includes("(PM)")) nPH = true; else { nAH = true; nPH = true; } } });
    if (r2A < 2 && (nAH || nPH)) {
      const fC = (iA: boolean, exS: string[]) => [...sSL, ...this.initialAvailGeneral].filter((s, i, a) => a.indexOf(s) === i).find(s => { if (r2C.includes(s) || this.isForbidden(s, "2号室") || this.isHalfDayBlocked(s, "2号室").hard || this.hasNGPair(s, r2C, false) || !this.canAddKenmu(s, "2号室")) return false; const b = this.blockMap.get(s); if (b === 'ALL' || (iA && b === 'AM') || (!iA && b === 'PM')) return false; if (exS.some(r => split(this.dayCells[r]).map(extractStaffName).includes(s))) return false; return true; });
      if (nAH) { let p = fC(true, ["1号室", "5号室"]) ?? fC(true, []); if (p) { this.dayCells["2号室"] = join([...split(this.dayCells["2号室"]), `${p}(AM)`]); this.addUsage(p, 0.5); this.blockMap.set(p, this.blockMap.get(p) === 'PM' ? 'ALL' : 'AM'); this.log(`🤝 [ポータブル特例] 2号室のポータブル兼務(AM)のため ${p} を追加`); } }
      if (nPH) { let p = fC(false, ["1号室", "5号室"]) ?? fC(false, []); if (p) { this.dayCells["2号室"] = join([...split(this.dayCells["2号室"]), `${p}(PM)`]); this.addUsage(p, 0.5); this.blockMap.set(p, this.blockMap.get(p) === 'AM' ? 'ALL' : 'PM'); this.log(`🤝 [ポータブル特例] 2号室のポータブル兼務(PM)のため ${p} を追加`); } }
    }

    const pL = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
    const dKT = ROOM_SECTIONS.filter(r => !["CT", "MRI", "治療", "RI", "待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r) && !this.shouldSkipAutoAssignRoom(r)).sort((a, b) => { let iA = pL.indexOf(a); if (iA === -1) iA = 999; let iB = pL.indexOf(b); if (iB === -1) iB = 999; return iB - iA; });
    const rP = [...ROOM_SECTIONS].sort((a, b) => { let iA = pL.indexOf(a); if (iA === -1) iA = 999; let iB = pL.indexOf(b); if (iB === -1) iB = 999; return iB - iA; });
    
    this.refreshAssignmentState();
    let uG2 = this.initialAvailGeneral.filter(s => !this.isUsed(s) && this.blockMap.get(s) !== 'ALL' && !this.lateShiftAssigned.has(s));
    uG2.forEach(st => {
      const b = this.blockMap.get(st); if (b === 'ALL') return; let t = this.getPreferredWorkTag(st); let asg = false;
      if (!this.isUnassignedForRelief(st, t)) return;
      for (const rm of dKT) {
        if (this.skipSections.includes(rm) || this.isForbidden(st, rm) || (rm === "MMG" && !this.isMmgCapable(st))) continue; if (t !== "" && this.isHalfDayBlocked(st, rm).hard) continue; const e = this.getEffectiveTarget(rm, 1); if (e.allClosed || (t === "(PM)" && e.pmClosed) || (t === "(AM)" && e.amClosed)) continue;
        let cM = split(this.dayCells[rm]);
        const rI = cM.findIndex(m => { 
          const c = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(c) || this.hasNGPair(st, cM.filter(x => x !== m).map(extractStaffName), false)) return false; 
          const cc = this.getStaffTimeCounts(c); if ((t === "(AM)" && cc.am <= 1) || (t === "(PM)" && cc.pm <= 1) || (t === "" && cc.am <= 1 && cc.pm <= 1)) return false;
          let ca = m.includes("(AM)"), cp = m.includes("(PM)"); if (!ca && !cp) { ca = true; cp = true; } let na = t === "(AM)", np = t === "(PM)"; if (!na && !np) { na = true; np = true; } return (ca && na) || (cp && np); 
        });
        if (rI !== -1) {
          const oS = cM[rI], oC = extractStaffName(oS); let oR = ""; if (t === "(AM)" && !oS.includes("(")) oR = `${oC}(PM)`; else if (t === "(PM)" && !oS.includes("(")) oR = `${oC}(AM)`; cM[rI] = `${st}${t}`; if (oR) cM.push(oR); this.dayCells[rm] = join(cM); this.addUsage(st, t ? 0.5 : 1); this.blockMap.set(st, 'ALL'); this.assignCounts[oC] = this.getAssignedUsage(oC); let am = false, pm = false; ROOM_SECTIONS.forEach(r => { if (["待機", "昼当番", "受付", "受付ヘルプ"].includes(r)) return; split(this.dayCells[r]).forEach(m => { if (extractStaffName(m) === oC) { if (m.includes("(AM)")) am = true; else if (m.includes("(PM)")) pm = true; else { am = true; pm = true; } } }); }); if (am && pm) this.blockMap.set(oC, 'ALL'); else if (am) this.blockMap.set(oC, 'AM'); else if (pm) this.blockMap.set(oC, 'PM'); else this.blockMap.set(oC, 'NONE'); this.log(`🪄 [兼務解消] ${st} を専任化し ${oC} の負担軽減`); asg = true; break;
        }
      }
      if (!asg) { for (const rm of rP) { if (this.skipSections.includes(rm) || this.shouldSkipAutoAssignRoom(rm) || this.isLinkedTargetRoom(rm) || this.isForbidden(st, rm) || (rm === "MMG" && !this.isMmgCapable(st)) || ["待機", "昼当番", "受付", "受付ヘルプ", "CT", "MRI", "治療", "RI", "透析後胸部"].includes(rm) || (t !== "" && this.isHalfDayBlocked(st, rm).hard)) continue; const aC = this.dynamicCapacity[rm] ?? (["CT", "MRI", "治療"].includes(rm) ? 3 : 1); const e = this.getEffectiveTarget(rm, aC); if (e.allClosed || (t === "(PM)" && e.pmClosed) || (t === "(AM)" && e.amClosed) || !this.canAddKenmu(st, rm) || this.isTimeTagBlockedByFullDayRule(rm, t)) continue; let cM = split(this.dayCells[rm]); if (cM.reduce((s, m) => s + getStaffAmount(m), 0) >= e.cap || this.hasNGPair(st, cM.map(extractStaffName), false)) continue; this.dayCells[rm] = join([...cM, `${st}${t}`]); this.addUsage(st, t ? 0.5 : 1); this.blockMap.set(st, 'ALL'); this.log(`♻️ [余剰配置] 余力のある ${st} を ${rm} に追加配置`); asg = true; break; } }
      if (!asg) { for (const fbR of ["2号室", "1号室", "5号室", "3号室"]) { if (this.skipSections.includes(fbR) || this.shouldSkipAutoAssignRoom(fbR) || this.isForbidden(st, fbR)) continue; const e = this.getEffectiveTarget(fbR, 1); if (e.allClosed || (t === "(PM)" && e.pmClosed) || (t === "(AM)" && e.amClosed) || this.isTimeTagBlockedByFullDayRule(fbR, t)) continue; let cM = split(this.dayCells[fbR]); if (this.hasNGPair(st, cM.map(extractStaffName), false)) continue; this.dayCells[fbR] = join([...cM, `${st}${t}`]); this.addUsage(st, t ? 0.5 : 1); this.blockMap.set(st, 'ALL'); this.log(`🚨 [最終救済] 定員超過でも未配置を防ぐため ${st} を ${fbR} に強制配置`); asg = true; break; } }
    });

    this.releaseSupportPartnersForEmptyRooms();
    this.trimOverloadedSupportPartners();
    this.placeSupportStaffAsLastResort();
    this.releaseSupportPartnersForEmptyRooms();
    this.trimOverloadedSupportPartners();
    this.sharePartialHelpersWithLinkedTargets();
    this.rebalanceNoConsecutiveRooms();
    this.enforcePortableClosedSourcePolicy();
    this.tryProtectOneRoomForPortable();
    this.enforcePortableSourcePriority();
    this.enforcePortableThreeRoomPairing();
    this.enforcePortableSourceRoomSwapPreference();
    this.tryProtectOneRoomForPortable();
    this.enforcePortableThreeRoomPairing();
    this.enforcePortableClosedSourcePolicy();
    this.refreshAssignmentState();

    this.logPhase("フェーズ5：仕上げ");
    if (!this.skipSections.includes("昼当番")) {
      let cL = split(this.dayCells["昼当番"]); let lT = this.ctx.customRules.lunchBaseCount ?? 3; const dC = this.day.label.match(/\((.*?)\)/)?.[1]; if (dC) { const sd = (this.ctx.customRules.lunchSpecialDays || []).find((x: any) => x.day === dC); if (sd) lT = Number(sd.count); }
      const canLunch = (n: string) => this.isLunchAvailable(n) && !this.isForbidden(n, "昼当番") && !this.hasNGPair(n, cL, false);
      const femaleList = split(this.ctx.customRules.femaleStaffList || "").map(extractStaffName);
      if (femaleList.length > 0 && cL.length < lT && !cL.some(n => femaleList.includes(extractStaffName(n)))) {
        const occupiedGeneral = ROOM_SECTIONS
          .filter(r => !["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r))
          .flatMap(r => split(this.dayCells[r] || "").map(extractStaffName));
        const femaleCandidate = occupiedGeneral.find(n => femaleList.includes(extractStaffName(n)) && !cL.includes(n) && canLunch(n));
        if (femaleCandidate) cL.push(femaleCandidate);
      } else if (femaleList.length === 0 && cL.length < lT) {
        const mmgFallback = split(this.dayCells["MMG"] || "").map(extractStaffName).find(n => !cL.includes(n) && canLunch(n));
        if (mmgFallback) cL.push(mmgFallback);
      }
      (this.ctx.customRules.lunchRoleRules || []).forEach((r: any) => { if (r.day === "毎日" || r.day === dC) { const rS = split(this.ctx.monthlyAssign[r.role] || "").map(extractStaffName), tM = split(this.dayCells[r.role] || "").map(extractStaffName); let sl: string | null = null; for (const src of split(r.sourceRooms)) { const { r: sR, min } = parseRoomCond(src); const rM = split(this.dayCells[sR] || ""), rq = min > 0 ? min : (this.dynamicCapacity[sR] || 1); if (rM.reduce((su, m) => su + getStaffAmount(m), 0) >= rq) { sl = rM.map(extractStaffName).find(n => rS.includes(n) && !tM.includes(n) && canLunch(n)) || null; } if (sl) break; } if (!sl) sl = tM.find(n => canLunch(n)) || null; if (sl && !cL.includes(sl) && cL.length < lT) cL.push(sl); } });
      split(this.dayCells["RI"]).map(extractStaffName).forEach(n => { if (!cL.includes(n) && cL.length < lT && canLunch(n)) cL.push(n); });
      split(this.ctx.customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT").forEach(sc => split(this.dayCells[sc]).forEach(n => { const c = extractStaffName(n); if (!cL.includes(c) && cL.length < lT && canLunch(c)) cL.push(c); }));
      if (cL.length < lT) { (this.ctx.customRules.lunchConditional || []).forEach((co: any) => { const sM = split(this.dayCells[co.section]); if (sM.length >= Number(co.min)) { let p = 0; for (const n of sM) { if (p >= Number(co.out) || cL.length >= lT) break; const c = extractStaffName(n); if (!cL.includes(c) && canLunch(c)) { cL.push(c); p++; } } } }); }
      if (cL.length < lT) { const lrM: string[] = []; split(this.ctx.customRules.lunchLastResortSections ?? "治療").forEach(sc => split(this.dayCells[sc]).forEach(n => lrM.push(extractStaffName(n)))); this.initialAvailGeneral.filter((n: string) => !lrM.includes(n) && !cL.includes(n) && canLunch(n)).forEach((n: string) => { if (cL.length < lT) cL.push(n); }); this.initialAvailGeneral.filter((n: string) => lrM.includes(n) && !cL.includes(n) && canLunch(n)).forEach((n: string) => { if (cL.length < lT) cL.push(n); }); }
      this.dayCells["昼当番"] = join(cL.slice(0, lT));
    }
    const uT = this.dynamicCapacity.受付 !== undefined ? this.dynamicCapacity.受付 : 2;
    if (split(this.dayCells["受付"]).reduce((s, m) => s + getStaffAmount(m), 0) < uT && !this.skipSections.includes("受付ヘルプ")) { let hm = split(this.dayCells["受付ヘルプ"]); if (hm.length === 0) { const lC = split(this.dayCells["昼当番"]).map(extractStaffName); const gH = (exS: string[]) => { let c = this.initialAvailGeneral.filter((n: string) => !exS.includes(n) && !hm.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ") && !this.hasNGPair(n, hm.map(extractStaffName), false)); if (c.length > 0) { c.sort((a, b) => (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0)); return c[0]; } return null; }; const lH = gH(lC); if (lH) hm.push(`${lH}(12:15〜13:00)`); const vK = split(this.dayCells["検像"]).map(extractStaffName).filter((n: string) => this.blockMap.get(n) !== 'PM' && !hm.map(extractStaffName).includes(n) && !this.isForbidden(n, "受付ヘルプ") && !this.hasNGPair(n, hm.map(extractStaffName), false)); let pk = vK.length > 0 ? vK[0] : null; if (!pk) pk = gH(lH ? [lH] : []); if (pk) hm.push(`${pk}(16:00〜)`); } this.dayCells["受付ヘルプ"] = join(hm); }
    this.releaseSupportPartnersForEmptyRooms();
    this.enforceFluoroAuxConflictRule();
    this.refreshAssignmentState();
    this.releaseSupportPartnersForEmptyRooms();
    this.trimOverloadedSupportPartners();
    this.refreshAssignmentState();
  }
}

// ===================== 🌟 Main App Component =====================
export default function App(): any {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats' | 'rules'>('calendar');
  const [allDays, setAllDays] = useState<Record<string, Record<string, string>>>(() => { try { return JSON.parse(localStorage.getItem(KEY_ALL_DAYS) || "{}"); } catch { return {}; } });
  const [customRules, setCustomRules] = useState<CustomRules>(() => { try { return sanitizeRulesInput(JSON.parse(localStorage.getItem(KEY_RULES) || "{}")); } catch { return sanitizeRulesInput(DEFAULT_RULES); } });
  const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string>>(() => { try { return { ...DEFAULT_MONTHLY_ASSIGN, ...JSON.parse(localStorage.getItem(KEY_MONTHLY) || "{}") }; } catch { return DEFAULT_MONTHLY_ASSIGN; } });
  const [targetMonday, setTargetMonday] = useState(() => { const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff)); return `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`; });
  const [sel, setSel] = useState(""); 
  const [assignLogs, setAssignLogs] = useState<Record<string, string[]>>({}); 
  const [selectedErrorDay, setSelectedErrorDay] = useState<string | null>(null); 
  const [showLogDay, setShowLogDay] = useState<string | null>(null); 
  const [showUnassignedList, setShowUnassignedList] = useState<string | null>(null); 
  const [selectedStaffForStats, setSelectedStaffForStats] = useState<string | null>(null); 
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{ staff: string; room: string } | null>(null); 
  const [showRuleModal, setShowRuleModal] = useState(false); 
  const [history, setHistory] = useState<Record<string, Record<string, string>>[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const [importText, setImportText] = useState(""); 
  const [nationalHolidays, setNationalHolidays] = useState<Record<string, string>>(FALLBACK_HOLIDAYS);
  const [highlightedStaff, setHighlightedStaff] = useState<string | null>(null); 
  const [weeklySwapMode, setWeeklySwapMode] = useState(false);
  const [weeklySwapPending, setWeeklySwapPending] = useState<{ dayId: string; section: string; member: string; index: number; coreName: string } | null>(null);
  const [hoveredStaff, setHoveredStaff] = useState<string | null>(null);

  useEffect(() => { fetch("https://holidays-jp.github.io/api/v1/date.json").then(res => res.json()).then(data => setNationalHolidays(prev => ({ ...prev, ...data }))).catch(e => console.error(e)); }, []);
  useEffect(() => {
    const normalizedRules = sanitizeRulesInput(customRules);
    if (JSON.stringify(normalizedRules) !== JSON.stringify(customRules)) {
      setCustomRules(normalizedRules);
    }
  }, [customRules]);

  useEffect(() => { localStorage.setItem(KEY_ALL_DAYS, JSON.stringify(allDays)); localStorage.setItem(KEY_RULES, JSON.stringify(sanitizeRulesInput(customRules))); localStorage.setItem(KEY_MONTHLY, JSON.stringify(monthlyAssign)); }, [allDays, customRules, monthlyAssign]);

  const activeGeneralStaff = useMemo(() => parseAndSortStaff(customRules.staffList), [customRules.staffList]);
  const activeReceptionStaff = useMemo(() => parseAndSortStaff(customRules.receptionStaffList), [customRules.receptionStaffList]);
  const allStaff = useMemo(() => Array.from(new Set([...activeGeneralStaff, ...activeReceptionStaff])), [activeGeneralStaff, activeReceptionStaff]);
  const customHolidays = split(customRules.customHolidays || "");
  const assignmentCycleInfo = useMemo(() => getAssignmentCycleInfo(targetMonday), [targetMonday]);

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
  
  // ★修正：受付・受付ヘルプを「未配置」から正しく除外（配置済みとして扱う）
  const getDailyStats = (dayId: string) => { 
    const cells = allDays[dayId] || {}; 
    const absentMems = split(cells["不在"] || "");
    const allDayOffSet = new Set([...split(cells["明け"]||""),...split(cells["入り"]||""),...split(cells["土日休日代休"]||"")].map(extractStaffName));
    const workingStaff = allStaff.filter(s => { 
      if (allDayOffSet.has(s)) return false;
      const isFullAbsent = absentMems.some(m => extractStaffName(m) === s && isAllDayAbsenceEntry(m)); 
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
      // 修正ポイント：受付と受付ヘルプは無視せず、きちんと仕事としてカウントする！
      if (sec === "不在" || sec === "待機" || sec === "昼当番") return; 
      split(cells[sec]).forEach(m => { 
        const c = extractStaffName(m); 
        if (staffTime[c]) { 
          if (m.includes("(AM)")) staffTime[c].am = true; 
          else if (m.includes("(PM)")) staffTime[c].pm = true; 
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
  
  const hhmmToMinutes = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const getMemberCoverageRange = (member: string) => {
    // AM勤務は「昼まで」ではなく「PM不在」として扱い、13:00までは在室扱いにする
    if (member.includes("(AM)")) return { start: 0, end: 13 * 60 };
    if (member.includes("(PM)")) return { start: 13 * 60, end: 24 * 60 };
    const until = member.match(/\(〜(\d+:\d+)\)/)?.[1];
    if (until) return { start: 0, end: hhmmToMinutes(until) };
    const from = member.match(/\((\d+:\d+)〜\)/)?.[1];
    if (from) return { start: hhmmToMinutes(from), end: 24 * 60 };
    return { start: 0, end: 24 * 60 };
  };
  const roomCoverageCountAt = (cells: Record<string, string>, room: string, minute: number) => {
    return split(cells[room] || "").filter(m => {
      if (m.startsWith(`${room}枠`)) return false;
      const range = getMemberCoverageRange(m);
      return range.start <= minute && range.end > minute;
    }).length;
  };
  const getTriggeredCapacityForWarning = (dayId: string, room: string) => {
    let cap = customRules.capacity?.[room] ?? 1;
    const cells = allDays[dayId] || {};
    const blockMap = new Map<string, string>();
    activeGeneralStaff.forEach(s => blockMap.set(s, 'NONE'));
    ["明け", "入り", "土日休日代休"].forEach(sec => {
      split(cells[sec] || "").forEach(m => blockMap.set(extractStaffName(m), 'ALL'));
    });
    split(cells["不在"] || "").forEach(m => {
      const core = extractStaffName(m);
      if (m.includes("(AM)") || m.match(/\(〜\d/)) blockMap.set(core, 'AM');
      else if (m.includes("(PM)") || m.match(/\(\d.*〜\)/)) blockMap.set(core, 'PM');
      else blockMap.set(core, 'ALL');
    });
    const tempAvailCount = activeGeneralStaff.filter(s => blockMap.get(s) !== 'ALL').length;
    (customRules.emergencies || []).forEach((em: any) => {
      if (em.type === "change_capacity" && em.section === room && tempAvailCount <= Number(em.threshold)) {
        cap = Number(em.newCapacity);
      }
    });
    return cap;
  };
  const getRoomRequiredCoverageAt = (dayId: string, room: string, minute: number) => {
    const base = getTriggeredCapacityForWarning(dayId, room);
    const day = days.find(d => d.id === dayId);
    const dayChar = day?.label.match(/\((.*?)\)/)?.[1];
    if (!dayChar) return base;
    const closed = (customRules.closedRooms || []).filter((r: any) => r.room === room && r.day === dayChar);
    let amClosed = false;
    let pmClosed = false;
    let allClosed = false;
    closed.forEach((r: any) => {
      if (r.time === "全日") allClosed = true;
      else if (r.time === "(AM)") amClosed = true;
      else if (r.time === "(PM)") pmClosed = true;
    });
    if (allClosed) return 0;
    if (minute >= 13 * 60 && pmClosed) return 0;
    if (minute < 13 * 60 && amClosed) return 0;
    return base;
  };
  const requestedStartMinute = (tag: string) => {
    if (!tag) return 0;
    if (tag === "(PM)") return 13 * 60;
    if (tag === "(AM)") return 0;
    const from = tag.match(/\((\d+:\d+)〜\)/)?.[1];
    if (from) return hhmmToMinutes(from);
    return 0;
  };
  const formatShortageFromTime = (tag: string) => {
    if (!tag) return "";
    if (tag === "(PM)") return "13:00";
    if (tag === "(AM)") return "AM";
    const from = tag.match(/\((\d+:\d+)〜\)/)?.[1];
    if (from) return from;
    return tag.replace(/[()]/g, "").replace(/〜$/, "");
  };
  const minuteToShortageLabel = (minute: number) => `${Math.floor(minute / 60)}:${pad(minute % 60)}`;
  const ROOM_DAY_START_MINUTE = 8 * 60 + 30;
  const getRoomFirstShortageMinute = (dayId: string, cells: Record<string, string>, room: string) => {
    const members = split(cells[room] || '').filter(m => !m.startsWith(`${room}枠`));
    if (members.length === 0) return null;
    const candidateMinutes = new Set<number>([ROOM_DAY_START_MINUTE, 11 * 60 + 30, 13 * 60]);
    members.forEach(member => {
      const range = getMemberCoverageRange(member);
      if (range.start > ROOM_DAY_START_MINUTE) candidateMinutes.add(range.start);
      if (range.end < 24 * 60) candidateMinutes.add(range.end);
    });
    const sortedMinutes = Array.from(candidateMinutes).sort((a, b) => a - b);
    for (const minute of sortedMinutes) {
      const requiredCount = getRoomRequiredCoverageAt(dayId, room, minute);
      if (requiredCount <= 0) continue;
      const coveringCount = roomCoverageCountAt(cells, room, minute);
      if (coveringCount < requiredCount) return minute;
    }
    return null;
  };

  const getDayWarnings = (dayId: string): WarningInfo[] => { 
    const w: WarningInfo[] = []; const cells = allDays[dayId] || {}; const staffMap: Record<string, string[]> = {}; 
    ROOM_SECTIONS.forEach(room => { split(cells[room]).forEach(m => { const core = extractStaffName(m); if(!staffMap[core]) staffMap[core]=[]; if(!staffMap[core].includes(room)) staffMap[core].push(room); }) }); 
    const softNgPairs = (customRules.ngPairs || []).filter((p: any) => p.level === "soft"); 
    softNgPairs.forEach((ng: any) => { const s1 = extractStaffName(ng.s1); const s2 = extractStaffName(ng.s2); ROOM_SECTIONS.forEach(room => { const mems = split(cells[room]).map(extractStaffName); if (mems.includes(s1) && mems.includes(s2)) w.push({ level: 'yellow', title: '回避特例', room, msg: `なるべくNGペア（${s1} と ${s2}）が「${room}」で同室です` }); }); }); 
    const fluoroConflictSections = getFluoroAuxConflictSections(customRules.fluoroAuxConflictRooms); AUX_FOLLOWUP_SECTIONS.forEach(auxRoom => { split(cells[auxRoom] || "").map(extractStaffName).forEach(staff => { const conflictRoom = fluoroConflictSections.find(fRoom => split(cells[fRoom] || "").map(extractStaffName).includes(staff)); if (conflictRoom) w.push({ level: 'yellow', title: '併用注意', staff, room: auxRoom, msg: `${staff}さんが「${auxRoom}」と「${conflictRoom}」を兼ねています` }); }); }); 
    Object.entries(staffMap).forEach(([staff, rms]) => { const limit = customRules.alertMaxKenmu || 3; const dayCount = rms.filter(r => { const m = split(cells[r]).find(x => extractStaffName(x) === staff); return m && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:"); }).length; if(dayCount > limit) w.push({ level: 'orange', title: '兼務超過', staff, msg: `${staff}さんが日中 ${dayCount}部屋を担当中` }); }); 
    const targetEmptyRooms = split(customRules.alertEmptyRooms || "CT,MRI,治療,RI,1号室,2号室,3号室,5号室,透視（6号）,透視（11号）,MMG,骨塩,パノラマCT,ポータブル,DSA,検像"); 
    targetEmptyRooms.forEach(room => { if (split(cells[room]).length === 0) w.push({ level: 'yellow', title: '空室', room, msg: `「${room}」の担当者がいません` }); }); 
    const helpMap = parseLooseJsonMap(cells["__absenceHelp"]);
    const helpRoomMap = parseLooseJsonMap(cells["__absenceHelpRooms"]);
    Object.entries(helpMap).forEach(([staff, fromTime]) => {
      if (!fromTime || fromTime === "__NO_HELP__") return;
      const room = helpRoomMap[staff];
      if (!room) {
        w.push({ level: 'orange', title: '補充不足', staff, fromTime: formatShortageFromTime(fromTime), msg: `${staff}さんの${fromTime.replace(/[()]/g, '')}以降の補充先が見つかっていません` });
        return;
      }
      const minute = requestedStartMinute(fromTime);
      const placeholder = `${room}枠${fromTime}`;
      const members = split(cells[room] || "");
      const hasPlaceholder = members.includes(placeholder);
      const requiredCount = getRoomRequiredCoverageAt(dayId, room, minute);
      const coveringCount = roomCoverageCountAt(cells, room, minute);
      if (hasPlaceholder) {
        w.push({ level: 'orange', title: '補充不足', staff, room, fromTime: formatShortageFromTime(fromTime), msg: `${room}の${fromTime.replace(/[()]/g, '')}補充が埋まっていません` });
      } else if (requiredCount > 0 && coveringCount === 0) {
        w.push({ level: 'orange', title: '補充不足', staff, room, fromTime: formatShortageFromTime(fromTime), msg: `${room}は${fromTime.replace(/[()]/g, '')}以降の担当者がいません` });
      } else if (requiredCount > 0 && coveringCount < requiredCount) {
        w.push({ level: 'orange', title: '補充不足', staff, room, fromTime: formatShortageFromTime(fromTime), msg: `${room}は${fromTime.replace(/[()]/g, '')}以降 ${coveringCount}/${requiredCount}名で不足しています` });
      }
    });
    targetEmptyRooms.forEach(room => {
      const hasRoomShortage = w.some(x => x.room === room && (x.title === '補充不足' || x.title === '午後不足'));
      if (hasRoomShortage) return;
      if (split(cells[room] || '').length === 0) return;
      const shortageMinute = getRoomFirstShortageMinute(dayId, cells, room);
      if (shortageMinute == null) return;
      const requiredCount = getRoomRequiredCoverageAt(dayId, room, shortageMinute);
      const coveringCount = roomCoverageCountAt(cells, room, shortageMinute);
      const shortageLabel = minuteToShortageLabel(shortageMinute);
      const isInitialShortage = shortageMinute <= ROOM_DAY_START_MINUTE;
      w.push({
        level: 'orange',
        title: isInitialShortage ? '人数不足' : '午後不足',
        room,
        fromTime: isInitialShortage ? undefined : shortageLabel,
        msg: coveringCount === 0
          ? (isInitialShortage ? `「${room}」の担当者がいません` : `${room}は${shortageLabel}以降の担当者がいません`)
          : (isInitialShortage ? `${room}は終日 ${coveringCount}/${requiredCount}名で不足しています` : `${room}は${shortageLabel}以降 ${coveringCount}/${requiredCount}名で不足しています`)
      });
    });
    const uTarget = customRules.capacity?.受付 ?? 2; 
    if (split(cells["受付"]).reduce((sum: number, m: string) => sum + getStaffAmount(m), 0) < uTarget && split(cells["受付ヘルプ"]).length === 0) { w.push({ level: 'yellow', title: '受付不足', room: '受付', msg: `受付が${uTarget}名未満ですが、受付ヘルプがいません` }); } 
    const curIdx = days.findIndex(d => d.id === dayId); 
    const dObj = parseDateId(dayId);
    dObj.setDate(dObj.getDate() - 1);
    const prevDateStr = `${dObj.getFullYear()}-${pad(dObj.getMonth()+1)}-${pad(dObj.getDate())}`;
    const isPrevHoliday = !!nationalHolidays[prevDateStr] || customHolidays.includes(prevDateStr);
    const prevCells = (!isPrevHoliday && allDays[prevDateStr]) ? allDays[prevDateStr] : null;

    split(customRules.noConsecutiveRooms).forEach(room => {
      const prev = prevCells ? split(prevCells[room]).map(extractStaffName) : [];
      split(cells[room]).map(extractStaffName).forEach(n => {
        const weekCount = days.slice(0, curIdx).filter(d => split(allDays[d.id]?.[room]).map(extractStaffName).includes(n)).length;
        if (prev.includes(n)) w.push({ level: 'red', title: '連日注意', staff: n, room, msg: `${n}さんが「${room}」に連日入っています` });
        else if (weekCount > 0) w.push({ level: 'orange', title: '週内重複', staff: n, room, msg: `${n}さんが「${room}」に今週${weekCount + 1}回目で入っています` });
      });
    }); 
    
    const stats = getDailyStats(dayId); 
    stats.unassigned.forEach(item => { 
      if (item.includes("(AM未配置)")) w.push({ level: 'red', title: '半日未配置', staff: extractStaffName(item), msg: `${extractStaffName(item)}さんの午前が未配置です` }); 
      else if (item.includes("(PM未配置)")) w.push({ level: 'red', title: '半日未配置', staff: extractStaffName(item), msg: `${extractStaffName(item)}さんの午後が未配置です` }); 
      else w.push({ level: 'red', title: '未配置', staff: item, msg: `${item}さんが1日を通して配置されていません` }); 
    }); 
    return w; 
  };
  
  const monthlyMatrixStats = useMemo(() => { const stats: Record<string, Record<string, { total: number, late: number }>> = {}; activeGeneralStaff.forEach(s => { stats[s] = {}; ROOM_SECTIONS.forEach(r => stats[s][r] = { total: 0, late: 0 }); }); Object.entries(allDays).forEach(([dateStr, cells]) => { if (dateStr >= assignmentCycleInfo.startId && dateStr < assignmentCycleInfo.endExclusiveId) { ROOM_SECTIONS.forEach(room => { split(cells[room] || "").forEach(m => { const core = extractStaffName(m); if (stats[core]?.[room] !== undefined) { stats[core][room].total += 1; if (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")) stats[core][room].late += 1; } }); }); } }); return stats; }, [assignmentCycleInfo, allDays, activeGeneralStaff]);
  const monthlyAssignmentSummary = useMemo(() => {
    return MONTHLY_CATEGORIES.map(({ key, label }) => ({
      key,
      label,
      staff: split(monthlyAssign[key] || "").map(extractStaffName),
    }));
  }, [monthlyAssign]);
  const monthlyAssignmentCardStyles: Record<string, { accent: string; tint: string; border: string; text: string; chipBg: string; chipBorder: string; }> = {
    CT: { accent: "#2563eb", tint: "#f8fbff", border: "#cbdaf7", text: "#1d4ed8", chipBg: "#ffffff", chipBorder: "#cbdaf7" },
    MRI: { accent: "#4f46e5", tint: "#fafbff", border: "#d4d8f6", text: "#4338ca", chipBg: "#ffffff", chipBorder: "#d4d8f6" },
    治療: { accent: "#db2777", tint: "#fffafb", border: "#f2d3df", text: "#be185d", chipBg: "#ffffff", chipBorder: "#f2d3df" },
    治療サブ優先: { accent: "#ea580c", tint: "#fffaf6", border: "#f2d4bf", text: "#c2410c", chipBg: "#ffffff", chipBorder: "#f2d4bf" },
    治療サブ: { accent: "#d97706", tint: "#fffdf8", border: "#ead9b5", text: "#b45309", chipBg: "#ffffff", chipBorder: "#ead9b5" },
    RI: { accent: "#059669", tint: "#f7fcfa", border: "#c9e9dc", text: "#047857", chipBg: "#ffffff", chipBorder: "#c9e9dc" },
    RIサブ: { accent: "#10b981", tint: "#f8fcfa", border: "#cfe8dc", text: "#15803d", chipBg: "#ffffff", chipBorder: "#cfe8dc" },
    MMG: { accent: "#ec4899", tint: "#fffafb", border: "#f1d2df", text: "#be185d", chipBg: "#ffffff", chipBorder: "#f1d2df" },
    受付: { accent: "#b45309", tint: "#fffdf8", border: "#ead9b5", text: "#92400e", chipBg: "#ffffff", chipBorder: "#ead9b5" },
    受付ヘルプ: { accent: "#7c3aed", tint: "#fbfaff", border: "#ddd4f7", text: "#6d28d9", chipBg: "#ffffff", chipBorder: "#ddd4f7" },
  };
  const monthlyStatsGroupStyles: Record<string, { accent: string; bg: string; border: string; text: string }> = {
    CT: { accent: "#2563eb", bg: "#f8fbff", border: "#cbdaf7", text: "#1d4ed8" },
    MRI: { accent: "#4f46e5", bg: "#fafbff", border: "#d4d8f6", text: "#4338ca" },
    治療メイン: { accent: "#db2777", bg: "#fffafb", border: "#f2d3df", text: "#be185d" },
    RI: { accent: "#059669", bg: "#f7fcfa", border: "#c9e9dc", text: "#047857" },
    その他: { accent: "#64748b", bg: "#fbfcfd", border: "#cbd5e1", text: "#334155" },
  };
  const getMonthlyRoleTags = (staff: string) => {
    const tags: string[] = [];
    if (split(monthlyAssign.CT || "").map(extractStaffName).includes(staff)) tags.push("CT");
    if (split(monthlyAssign.MRI || "").map(extractStaffName).includes(staff)) tags.push("MRI");
    if (split(monthlyAssign.治療 || "").map(extractStaffName).includes(staff)) tags.push("治療メイン");
    if (split(monthlyAssign.RI || "").map(extractStaffName).includes(staff)) tags.push("RI");
    return tags;
  };
  const getMonthlyPrimaryGroup = (staff: string) => {
    const tags = getMonthlyRoleTags(staff);
    return tags[0] || "その他";
  };
  const groupedMonthlyStatsRows = useMemo(() => {
    const orderedGroups = ["CT", "MRI", "治療メイン", "RI", "その他"];
    let flatIndex = 0;
    return orderedGroups.map(group => {
      const rows = activeGeneralStaff
        .filter(staff => getMonthlyPrimaryGroup(staff) === group)
        .map(staff => ({ staff, flatIndex: flatIndex++, tags: getMonthlyRoleTags(staff) }));
      return { key: group, label: group, rows };
    }).filter(group => group.rows.length > 0);
  }, [activeGeneralStaff, monthlyAssign]);
  
  const setAllDaysWithHistory = (updater: any) => { setAllDays(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; if (JSON.stringify(prev) !== JSON.stringify(next)) setHistory(h => [...h, prev].slice(-20)); return next; }); };
  const updateDay = (k: string, v: string) => { setAllDaysWithHistory((prev: any) => { let nextDayCells = { ...(prev[sel] || {}), [k]: v }; nextDayCells = applyFluoroAuxConflictRule(nextDayCells, k, customRules.fluoroAuxConflictRooms); const nextState = { ...prev, [sel]: nextDayCells }; if (k === "入り") { const idx = days.findIndex(d => d.id === sel); if (idx >= 0 && idx < days.length - 1) { const nextDayId = days[idx + 1].id; const currentAke = split((prev[nextDayId] || {})["明け"]).filter(m => !split(v).includes(m)); nextState[nextDayId] = { ...(prev[nextDayId] || {}), "明け": join([...currentAke, ...split(v)]) }; } } return nextState; }); };

  const clearAbsenceHelp = (staffName: string) => {
    setAllDaysWithHistory((prev: any) => {
      const cells = { ...(prev[sel] || {}) };
      const helpMap = parseLooseJsonMap(cells["__absenceHelp"]);
      const helpRoomMap = parseLooseJsonMap(cells["__absenceHelpRooms"]);
      const prevTime = helpMap[staffName];
      const prevRoom = helpRoomMap[staffName];
      if (prevRoom && prevTime && prevTime !== "__NO_HELP__") {
        cells[prevRoom] = join(split(cells[prevRoom] || "").filter((m: string) => m !== `${prevRoom}枠${prevTime}`));
      }
      delete helpMap[staffName];
      delete helpRoomMap[staffName];
      cells["__absenceHelp"] = stringifyJsonMap(helpMap);
      cells["__absenceHelpRooms"] = stringifyJsonMap(helpRoomMap);
      return { ...prev, [sel]: cells };
    });
  };

  const addAbsenceHelp = (staffName: string, fromTime: string) => {
    setAllDaysWithHistory((prev: any) => {
      const cells = { ...(prev[sel] || {}) };
      const rooms = ["CT","MRI","RI","治療","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","MMG","骨塩","パノラマCT","ポータブル","DSA","検像"];
      const helpMap = parseLooseJsonMap(cells["__absenceHelp"]);
      const helpRoomMap = parseLooseJsonMap(cells["__absenceHelpRooms"]);
      const prevTime = helpMap[staffName];
      const prevRoom = helpRoomMap[staffName];
      if (prevRoom && prevTime && prevTime !== "__NO_HELP__") {
        cells[prevRoom] = join(split(cells[prevRoom] || "").filter((m: string) => m !== `${prevRoom}枠${prevTime}`));
      }
      const found = rooms.find(r => split(cells[r] || "").some((m: string) => extractStaffName(m) === staffName));
      const targetRoom = found || prevRoom || "";
      if (targetRoom) {
        const cur = cells[targetRoom] || "";
        const entry = targetRoom + "枠" + fromTime;
        if (!split(cur).includes(entry)) cells[targetRoom] = cur ? `${cur}、${entry}` : entry;
        helpRoomMap[staffName] = targetRoom;
      }
      helpMap[staffName] = fromTime;
      cells["__absenceHelp"] = stringifyJsonMap(helpMap);
      cells["__absenceHelpRooms"] = stringifyJsonMap(helpRoomMap);
      return { ...prev, [sel]: cells };
    });
  };

  const handleAutoAssign = (isSmart: boolean, isWeekly: boolean) => {
    setAllDaysWithHistory((prev: any) => {
      const nextAll = { ...prev }; const newLogs = { ...assignLogs }; const ctx = { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules }; const targetDays = isWeekly ? days : [cur];
      const buildStoredDay = (dateStr: string, fallbackCells?: Record<string, string>) => ({ id: dateStr, label: dateStr, isPublicHoliday: !!nationalHolidays[dateStr] || customHolidays.includes(dateStr), holidayName: nationalHolidays[dateStr] || "休診日", cells: nextAll[dateStr] || fallbackCells || Object.fromEntries(SECTIONS.map(s => [s, ""])) });
      targetDays.forEach(day => {
        const idx = days.findIndex(d => d.id === day.id); let prevDayObj: DayData | null = null; const dObj = new Date(day.id);
        if (dObj.getDay() !== 1) { const prevDate = new Date(dObj); prevDate.setDate(prevDate.getDate() - 1); const prevDateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(prevDate.getDate())}`; if (nextAll[prevDateStr]) prevDayObj = buildStoredDay(prevDateStr); else if (idx > 0) prevDayObj = buildStoredDay(days[idx-1].id, days[idx-1].cells); }
        const cycleInfo = getAssignmentCycleInfo(day.id); const pastDaysInMonthArray = Object.entries(nextAll).filter(([dateStr]) => dateStr >= cycleInfo.startId && dateStr < day.id).map(([dateStr, cells]) => buildStoredDay(dateStr, cells as Record<string, string>));
        const pastDaysInWeekArray = days.slice(0, idx).map(d => buildStoredDay(d.id, d.cells));
        const originalCells = nextAll[day.id] || day.cells;
        const worker = new AutoAssigner({ ...day, cells: originalCells }, prevDayObj, pastDaysInMonthArray, pastDaysInWeekArray, ctx, isSmart);
        const res = worker.execute();
        const metadata = Object.fromEntries(Object.entries(originalCells).filter(([k]) => k.startsWith("__")));
        nextAll[day.id] = { ...metadata, ...res.cells };
        newLogs[day.id] = res.logInfo || [];
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
  const handleClearWorkDay = () => { if (window.confirm(`${cur.label} の「モダリティ・一般撮影」をクリアしますか？`)) { const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections]; setAllDaysWithHistory((prev: any) => { const nextCells = { ...(prev[cur.id] || cur.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); return { ...prev, [cur.id]: nextCells }; }); } };
  const handleClearWorkWeek = () => { if (window.confirm(`表示中の「モダリティ・一般撮影」を1週間分すべてクリアしますか？`)) { const workSections = [...RENDER_GROUPS[1].sections, ...RENDER_GROUPS[2].sections]; setAllDaysWithHistory((prev: any) => { const nextState = { ...prev }; days.forEach(d => { const nextCells = { ...(prev[d.id] || d.cells) }; workSections.forEach(sec => { nextCells[sec] = ""; }); nextState[d.id] = nextCells; }); return nextState; }); } };
  const handleCopyYesterday = () => { const idx = days.findIndex(d => d.id === cur.id); if (idx <= 0) return; const prevDay = days[idx - 1]; setAllDaysWithHistory((prev: any) => ({ ...prev, [cur.id]: { ...prevDay.cells } })); };
  const handleWeeklyChipClick = (dayId: string, section: string, member: string, index: number, coreName: string) => {
    if (!weeklySwapMode) {
      setHighlightedStaff(prev => prev === coreName ? null : coreName);
      return;
    }
    if (!weeklySwapPending) {
      setWeeklySwapPending({ dayId, section, member, index, coreName });
      return;
    }
    if (weeklySwapPending.dayId !== dayId) {
      setWeeklySwapPending({ dayId, section, member, index, coreName });
      return;
    }
    if (weeklySwapPending.section === section && weeklySwapPending.index === index && weeklySwapPending.member === member) {
      setWeeklySwapPending(null);
      return;
    }
    setAllDaysWithHistory((prev: any) => {
      const dayCells = { ...(prev[dayId] || {}) };
      const fromMembers = split(dayCells[weeklySwapPending.section] || '');
      const toMembers = split(dayCells[section] || '');
      const fromIdx = weeklySwapPending.index < fromMembers.length && fromMembers[weeklySwapPending.index] === weeklySwapPending.member
        ? weeklySwapPending.index
        : fromMembers.findIndex((x: string) => x === weeklySwapPending.member);
      const toIdx = index < toMembers.length && toMembers[index] === member
        ? index
        : toMembers.findIndex((x: string) => x === member);
      if (fromIdx < 0 || toIdx < 0) return prev;
      if (weeklySwapPending.section === section) {
        const nextMembers = [...fromMembers];
        [nextMembers[fromIdx], nextMembers[toIdx]] = [nextMembers[toIdx], nextMembers[fromIdx]];
        dayCells[section] = join(nextMembers);
      } else {
        const nextFrom = [...fromMembers];
        const nextTo = [...toMembers];
        const fromMember = nextFrom[fromIdx];
        const toMember = nextTo[toIdx];
        nextFrom[fromIdx] = toMember;
        nextTo[toIdx] = fromMember;
        dayCells[weeklySwapPending.section] = join(nextFrom);
        dayCells[section] = join(nextTo);
      }
      const normalizedDayCells = applyFluoroAuxConflictRule(applyFluoroAuxConflictRule(dayCells, weeklySwapPending.section, customRules.fluoroAuxConflictRooms), section, customRules.fluoroAuxConflictRooms);
      return { ...prev, [dayId]: normalizedDayCells };
    });
    setWeeklySwapPending(null);
  };

  const handleExport = () => { const dataObj = { allDays, monthlyAssign, customRules: sanitizeRulesInput(customRules) }; const blob = new Blob([JSON.stringify(dataObj)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `shifto_backup_${targetMonday}.json`; a.click(); URL.revokeObjectURL(url); };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event: any) => { try { const dataObj = JSON.parse(event.target.result); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(sanitizeRulesInput(dataObj.customRules)); alert("データを復元しました！"); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("読み込みに失敗しました。"); } }; reader.readAsText(file); e.target.value = ""; };
  const handleCopyToClipboard = () => { const dataObj = { allDays, monthlyAssign, customRules: sanitizeRulesInput(customRules) }; navigator.clipboard.writeText(JSON.stringify(dataObj)).then(() => { alert("データをコピーしました！"); }).catch(() => { alert("コピーに失敗しました。"); }); };
  const handleTextImport = () => { if(!importText) return; try { const dataObj = JSON.parse(importText); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(sanitizeRulesInput(dataObj.customRules)); alert("テキストからデータを復元しました！"); setImportText(""); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("テキストの読み込みに失敗しました。"); } };

  const dailyStaffRooms = useMemo(() => {
    const roomsByDay: Record<string, Record<string, string[]>> = {};
    days.forEach(day => {
      const byStaff: Record<string, string[]> = {};
      if (!day.isPublicHoliday) {
        ROOM_SECTIONS.forEach(room => {
          if (["待機", "昼当番", "受付", "受付ヘルプ"].includes(room)) return;
          split(allDays[day.id]?.[room]).forEach(m => {
            if (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")) return;
            const core = extractStaffName(m);
            if (!byStaff[core]) byStaff[core] = [];
            if (!byStaff[core].includes(room)) byStaff[core].push(room);
          });
        });
      }
      roomsByDay[day.id] = byStaff;
    });
    return roomsByDay;
  }, [days, allDays]);

  const getFinalAssignmentRows = (dayId: string) => {
    const cells = allDays[dayId] || {};
    return SECTIONS.filter(sec => !["土日休日代休"].includes(sec)).map(sec => ({ sec, val: String((cells as any)[sec] || "") })).filter(x => split(x.val).length > 0);
  };


  return (
    <div style={{ maxWidth: "98%", margin: "0 auto", padding: "24px", boxSizing: "border-box" }}>
      <style>{globalStyle}</style>
      
      <div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "20px 32px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 26, fontWeight: 900 }}>勤務割付システム Ver 2.99</h2>
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
          {activeTab === 'calendar' && <button className="btn-hover" onClick={() => window.print()} style={btnStyle("#2563eb", "#fff")}>🖨️ 週間配置を印刷</button>}
          {activeTab === 'calendar' && <button className="btn-hover" onClick={() => { setWeeklySwapMode(prev => { const next = !prev; if (!next) setWeeklySwapPending(null); return next; }); setHighlightedStaff(null); }} style={btnStyle(weeklySwapMode ? "#0f766e" : "#f8fafc", weeklySwapMode ? "#fff" : "#475569")}>↔ 交換モード{weeklySwapMode ? ' ON' : ''}</button>}
        </div>
      </div>

      <div className="tabs-header no-print">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 週間予定表</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 月間集計</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>⚙️ 設定・データ入出力</button>
      </div>

      <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
        <div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "16px" }}>
          {weeklySwapMode && (<div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, border: "1px solid #99f6e4", background: weeklySwapPending ? "#ecfeff" : "#f0fdfa", color: "#0f766e", fontWeight: 700, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}><span>↔ 交換モード中</span><span style={{ opacity: 0.82 }}>{weeklySwapPending ? `${weeklySwapPending.dayId} の ${weeklySwapPending.section} / ${weeklySwapPending.coreName} を選択中。次に同じ日の相手をクリックすると交換。` : "同じ日の名前を2つ選ぶと交換します。もう一度トグルを押すと終了します。"}</span>{weeklySwapPending && <button type="button" className="btn-hover" onClick={() => setWeeklySwapPending(null)} style={{ ...btnStyle("#ffffff", "#0f766e", 13), border: "1px solid #99f6e4", padding: "6px 10px" }}>選択解除</button>}</div>)}
          <div className="screen-weekly-table">
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
                            {!day.isPublicHoliday && assignLogs[day.id]?.length > 0 && <span onClick={(e) => { e.stopPropagation(); setShowLogDay(day.id); }} className="btn-hover" style={{ background: "#f0f9ff", color: "#0369a1", padding: "4px 8px", borderRadius: 6, fontSize: 14, border: "1px solid #bae6fd" }}>🧭 配置ログ</span>}
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
                {WEEKLY_DISPLAY_SECTIONS.map((section, sIdx) => (
                  <tr key={section}>
                    <td style={{...cellStyle(true, false, false, true, sIdx % 2 === 1), borderRight: "1px solid #e2e8f0", borderBottom: `2px solid ${ROOM_SECTIONS.includes(section) ? "#cbd5e1" : "#dbe4ee"}`}}>{section}</td>
                    {days.map((day, dIdx) => {
                      const currentMems = split(allDays[day.id]?.[section]); const prevMems = dIdx > 0 ? split(allDays[days[dIdx-1].id]?.[section]).map(extractStaffName) : []; const isAlertRoom = split(customRules.noConsecutiveRooms).includes(section); const warnings = getDayWarnings(day.id); const isRoomEmpty = currentMems.length === 0 && warnings.some(w => w.level === 'yellow' && w.room === section && w.title === '空室'); const roomShortageWarning = warnings.find(w => w.room === section && (w.title === '午後不足' || w.title === '補充不足')); const shortageFrom = roomShortageWarning?.fromTime || (roomShortageWarning?.title === '午後不足' ? 'PM' : ''); const hasPartialGap = !!roomShortageWarning && currentMems.length > 0; let baseBgStyle = cellStyle(false, day.isPublicHoliday, day.id === sel, false, sIdx % 2 === 1); if (isRoomEmpty && !day.isPublicHoliday) { baseBgStyle.background = "linear-gradient(180deg, #e8ebf0 0%, #dde2e8 100%)"; baseBgStyle.boxShadow = "inset 0 0 0 1px #b2bac4"; } else if (hasPartialGap && !day.isPublicHoliday) { baseBgStyle.background = "linear-gradient(90deg, rgba(255,255,255,1) 0 48%, #e4e8ee 48% 100%)"; baseBgStyle.boxShadow = "inset 0 0 0 1px #aeb7c2"; } baseBgStyle.borderBottom = `2px solid ${ROOM_SECTIONS.includes(section) ? "#cbd5e1" : "#dbe4ee"}`;
                      
                      return (
                        <td key={day.id + section} style={{ ...baseBgStyle, position: hasPartialGap ? "relative" : baseBgStyle.position }}>
                          {!day.isPublicHoliday && (
                            <>
                              {hasPartialGap && currentMems.length > 0 && (
                                <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2, padding: "4px 9px", borderRadius: 999, background: "#fff7ed", border: "1px solid #fb923c", color: "#9a3412", fontSize: 12, fontWeight: 900, lineHeight: 1, letterSpacing: "0.01em", boxShadow: "0 1px 2px rgba(15,23,42,0.08)" }}>
                                  {shortageFrom ? `${shortageFrom}〜不足` : '途中不足'}
                                </div>
                              )}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", lineHeight: "1.4", alignItems: "flex-start", paddingRight: hasPartialGap ? 92 : 0 }}>
                                {currentMems.length === 0 && isRoomEmpty && <div aria-hidden style={{ width: "100%", minHeight: 28, borderRadius: 10, border: "1px dashed #7b8794", background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.14) 100%)", position: "relative" }}><span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 26, height: 4, borderRadius: 999, background: "#64748b", opacity: 0.86 }} /></div>}
                                {currentMems.map((m, mIdx) => {
                                const coreName = extractStaffName(m); const mod = m.substring(coreName.length); const isConsecutive = isAlertRoom && prevMems.includes(coreName); const hasRedWarning = isConsecutive || warnings.some(w => w.level === 'red' && w.staff === coreName && w.room === section); const hasOrangeWarning = warnings.some(w => w.level === 'orange' && w.staff === coreName); const hasYellowWarning = warnings.some(w => w.level === 'yellow' && w.room === section && w.title === '回避特例');
                                
                                const targetStaff = highlightedStaff || hoveredStaff;
                                const isHighlighted = targetStaff === coreName;
                                const isDimmed = targetStaff !== null && targetStaff !== coreName;
                                const isSwapSelected = weeklySwapMode && weeklySwapPending?.dayId === day.id && weeklySwapPending?.section === section && weeklySwapPending?.index === mIdx && weeklySwapPending?.member === m;
                                
                                const sameDayRooms = dailyStaffRooms[day.id]?.[coreName] || [];
                                const roomCount = sameDayRooms.length;
                                const isRoomLikeSection = ROOM_SECTIONS.includes(section) && !["不在","明け","入り","土日休日代休"].includes(section);
                                const otherRooms = isRoomLikeSection ? sameDayRooms.filter(r => r !== section) : [];
                                const showKenmuMeta = isRoomLikeSection && roomCount >= 2;

                                let tagBg = "#ffffff"; let tagColor = "#0f172a"; let tagBorder = "#475569";
                                let metaBg = "#f8fafc"; let metaColor = "#475569"; let metaBorder = "#e2e8f0";
                                let countBg = "#e2e8f0"; let countColor = "#475569";
                                let dangerDot: string | null = null;
                                if (showKenmuMeta && roomCount >= 4) { tagBg = "#fff7f7"; tagColor = "#991b1b"; tagBorder = "#ef4444"; metaBg = "#fef2f2"; metaColor = "#991b1b"; metaBorder = "#fecaca"; countBg = "#fee2e2"; countColor = "#991b1b"; }
                                else if (showKenmuMeta && roomCount === 3) { tagBg = "#fff6ee"; tagColor = "#0f172a"; tagBorder = "#d9b68e"; metaBg = "#ffe3c2"; metaColor = "#9a3412"; metaBorder = "#f5b978"; countBg = "#f7c98f"; countColor = "#9a3412"; }
                                else if (showKenmuMeta && roomCount === 2) { tagBg = "#f1fbf3"; tagColor = "#0f172a"; tagBorder = "#86bf96"; metaBg = "#e4f6e8"; metaColor = "#166534"; metaBorder = "#b5dfbf"; countBg = "#c8ebd1"; countColor = "#166534"; }

                                if (hasRedWarning) { tagBg = "#fff7f7"; tagColor = "#b91c1c"; tagBorder = "#ef4444"; metaBg = "#fef2f2"; metaColor = "#b91c1c"; metaBorder = "#fecaca"; countBg = "#fee2e2"; countColor = "#b91c1c"; }
                                else if (hasOrangeWarning) { dangerDot = "#f59e0b"; }
                                else if (hasYellowWarning) { dangerDot = "#eab308"; }

                                let inlineStyle: React.CSSProperties = {
                                  background: tagBg,
                                  color: tagColor,
                                  border: `1px solid ${tagBorder}`,
                                  padding: showKenmuMeta ? "6px 9px 7px" : "6px 10px",
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "stretch",
                                  flexDirection: "column",
                                  gap: "4px",
                                  fontSize: "15px",
                                  fontWeight: hasRedWarning ? 800 : 700,
                                  transition: "all 0.2s ease",
                                  boxShadow: "none",
                                  alignSelf: "flex-start"
                                };
                                
                                if (isSwapSelected) {
                                  inlineStyle.background = "#0f766e"; inlineStyle.color = "#fff"; inlineStyle.borderColor = "#0f766e"; inlineStyle.boxShadow = "0 0 0 2px rgba(15,118,110,0.18), 0 6px 16px rgba(15,118,110,0.24)"; inlineStyle.transform = "scale(1.04)"; inlineStyle.zIndex = 12; inlineStyle.position = "relative";
                                } else if (isHighlighted) {
                                  inlineStyle.background = "#2563eb"; inlineStyle.color = "#fff"; inlineStyle.borderColor = "#1d4ed8"; inlineStyle.boxShadow = "0 4px 12px rgba(37,99,235,0.4)"; inlineStyle.transform = "scale(1.05)"; inlineStyle.zIndex = 10; inlineStyle.position = "relative";
                                } else if (isDimmed && !weeklySwapMode) {
                                  inlineStyle.opacity = 0.25; inlineStyle.filter = "grayscale(1)";
                                }

                                const titleText = showKenmuMeta ? `兼務: ${sameDayRooms.join("、")}` : coreName;

                                const modNode = mod && (mod.includes("(AM)") ? <span data-print-mod="1" style={{ background: isHighlighted ? "#bfdbfe" : "#e0f2fe", color: isHighlighted ? "#1e40af" : "#0369a1", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", border: "1px solid #bae6fd", fontWeight: 800 }}>AM</span> : mod.includes("(PM)") ? <span data-print-mod="1" style={{ background: isHighlighted ? "#fbcfe8" : "#fce7f3", color: isHighlighted ? "#9f1239" : "#be185d", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", border: "1px solid #fbcfe8", fontWeight: 800 }}>PM</span> : <span data-print-mod="1" style={{ background: isHighlighted ? "#e2e8f0" : "#f3f4f6", color: isHighlighted ? "#334155" : "#4b5563", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", border: "1px solid #d1d5db", fontWeight: 700 }}>{mod.replace(/[()]/g, '')}</span>);

                                return (
                                  <div key={mIdx} className="btn-hover" data-print-chip="1" 
                                    title={titleText}
                                    onClick={(e) => { e.stopPropagation(); handleWeeklyChipClick(day.id, section, m, mIdx, coreName); }}
                                    onMouseEnter={() => setHoveredStaff(coreName)}
                                    onMouseLeave={() => setHoveredStaff(null)}
                                    style={inlineStyle}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", minWidth: 0 }}>
                                        <span data-print-name="1">{coreName}</span>
                                        {dangerDot && !isHighlighted && <span style={{width:8,height:8,borderRadius:"50%",background:dangerDot,display:"inline-block",flexShrink:0}} />}
                                        {modNode}
                                      </div>
                                      {showKenmuMeta && (
                                        <span style={{
                                          flexShrink: 0,
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          minWidth: roomCount === 2 ? "34px" : undefined,
                                          padding: roomCount >= 4 ? "1px 6px" : roomCount === 2 ? "2px 8px" : "1px 5px",
                                          background: isHighlighted ? "rgba(255,255,255,0.16)" : countBg,
                                          color: isHighlighted ? "#fff" : countColor,
                                          border: isHighlighted ? "1px solid rgba(255,255,255,0.28)" : roomCount === 2 ? `1px solid ${metaBorder}` : "1px solid transparent",
                                          borderRadius: "999px",
                                          fontSize: roomCount === 2 ? "11px" : "10px",
                                          fontWeight: roomCount === 2 ? 900 : 800,
                                          letterSpacing: roomCount === 2 ? "0.01em" : 0,
                                          lineHeight: 1.2
                                        }}>{roomCount}件</span>
                                      )}
                                    </div>
                                    {showKenmuMeta && (
                                      <div data-print-badge="1" style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        alignSelf: "flex-start",
                                        marginTop: "1px",
                                        padding: roomCount >= 3 ? "2px 7px" : "2px 6px",
                                        background: isHighlighted ? "rgba(255,255,255,0.16)" : metaBg,
                                        color: isHighlighted ? "#fff" : metaColor,
                                        border: isHighlighted ? "1px solid rgba(255,255,255,0.32)" : `1px solid ${metaBorder}`,
                                        borderRadius: "999px",
                                        fontSize: roomCount >= 3 ? "10.5px" : "10.5px",
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                        whiteSpace: "nowrap",
                                        maxWidth: roomCount === 2 ? "138px" : "156px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                      }}>
                                        <span style={{opacity:0.72, flexShrink:0}}>兼</span>
                                        <span style={{overflow:"hidden", textOverflow:"ellipsis"}}>{otherRooms.map(roomLinkLabel).join(" ・ ")}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              </div>
                            </>
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
          <div className="print-weekly-sheet">
            <table className="print-sheet-table">
              <thead>
                <tr>
                  <th className="p-sec">区分</th>
                  {days.map(day => (
                    <th key={`print-${day.id}`}>
                      <div className="p-day">{day.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEKLY_DISPLAY_SECTIONS.map((section) => {
                  const rowClass = ["土日休日代休", "待機", "透析後胸部", "3号室"].includes(section)
                    ? "p-row-short"
                    : ["不在", "治療", "昼当番"].includes(section)
                    ? "p-row-verytall"
                    : ["受付ヘルプ", "受付", "パノラマCT"].includes(section)
                    ? "p-row-tall"
                    : "p-row-default";
                  return (
                  <tr key={`print-row-${section}`} className={rowClass}>
                    <td className="p-sec">{section}</td>
                    {days.map(day => {
                      const members = split(allDays[day.id]?.[section]);
                      return (
                        <td key={`print-${day.id}-${section}`}>
                          {members.length === 0 ? <div className="p-line"></div> : members.map((m, idx) => (
                            <div key={idx} className="p-line">{formatPrintMember(m)}</div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
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
                   {group.title === "休務・夜勤" || group.title === "待機" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <button className="btn-hover" onClick={() => handleClearGroupDay(group.title, group.sections)} style={btnStyle("#fff", "#64748b")}>🧹 1日クリア</button>
                        <button className="btn-hover" onClick={() => handleClearGroupWeek(group.title, group.sections)} style={btnStyle("#fff", "#64748b")}>🧹 週間クリア</button>
                      </div>
                    ) : group.title === "モダリティ" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <button className="btn-hover" onClick={handleClearWorkDay} style={btnStyle("#fff", "#64748b")}>🧹 業務1日クリア</button>
                        <button className="btn-hover" onClick={handleClearWorkWeek} style={btnStyle("#fff", "#64748b")}>🧹 業務週間クリア</button>
                      </div>
                    ) : null}
                 </div>
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                   {group.sections.map((s: string) => <SectionEditor key={s} section={s} value={allDays[sel]?.[s] || ""} activeStaff={allStaff} onChange={(v: string) => updateDay(s, v)} noTime={REST_SECTIONS.includes(s) || s === "昼当番"} customOptions={ROLE_PLACEHOLDERS.filter(p => p.startsWith(s))} onAddHelp={s === "不在" ? addAbsenceHelp : undefined} onClearHelp={s === "不在" ? clearAbsenceHelp : undefined} dayCells={allDays[sel] || {}} fluoroAuxConflictRooms={customRules.fluoroAuxConflictRooms} />)}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="no-print" style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 24, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", border: "1px solid #cbd5e1", boxShadow: "0 12px 24px -20px rgba(15,23,42,0.22)" }}>
          <h3 style={{ fontWeight: 900, color: "#0f172a", fontSize: 21, marginTop: 0, marginBottom: 8, letterSpacing: "0.01em" }}>月担当一覧・配置マトリックス</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "stretch", marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 14, padding: "12px 14px", minWidth: 240 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "#334155", letterSpacing: "0.08em" }}>ASSIGNMENT CYCLE</span>
              <span style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>{assignmentCycleInfo.monthLabel}担当分</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>集計範囲: {assignmentCycleInfo.rangeLabel}</span>
            </div>
            <div style={{ display: "flex", flex: 1, minWidth: 220, alignItems: "center", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 14, padding: "12px 16px", color: "#475569", fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>
              まず月担当を上で確認し、その下で偏りや遅番回数を確認できる並びにしています。
            </div>
          </div>
          <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)", border: "1px solid #cbd5e1", borderRadius: 16, padding: 18, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>今サイクルの月担当</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {monthlyAssignmentSummary.map(({ key, label, staff }) => {
                const isEmpty = staff.length === 0;
                const palette = monthlyAssignmentCardStyles[key] || { accent: "#64748b", tint: "#f8fafc", border: "#cbd5e1", text: "#475569", chipBg: "#f1f5f9", chipBorder: "#cbd5e1" };
                return (
                  <div
                    key={key}
                    style={{
                      background: isEmpty ? "#f8fafc" : `linear-gradient(180deg, ${palette.tint} 0%, #ffffff 100%)`,
                      border: `1px solid ${isEmpty ? "#cbd5e1" : palette.border}`,
                      borderTop: `4px solid ${isEmpty ? "#cbd5e1" : palette.accent}`,
                      borderRadius: 14,
                      padding: "14px 15px",
                      minHeight: 108,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      boxShadow: isEmpty ? "none" : "0 10px 20px -18px rgba(15,23,42,0.4)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: isEmpty ? "#64748b" : palette.text }}>{label}</div>
                      <span style={{ fontSize: 12, fontWeight: 900, color: isEmpty ? "#64748b" : palette.text, background: isEmpty ? "#e2e8f0" : "rgba(255,255,255,0.82)", border: `1px solid ${isEmpty ? "#cbd5e1" : palette.border}`, borderRadius: 999, padding: "4px 8px", whiteSpace: "nowrap" }}>
                        {isEmpty ? "未設定" : `${staff.length}名`}
                      </span>
                    </div>
                    {isEmpty ? (
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#94a3b8", lineHeight: 1.6, border: "1px dashed #cbd5e1", borderRadius: 10, padding: "10px 12px", background: "rgba(255,255,255,0.65)" }}>未設定</div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {staff.map((name) => (
                          <span
                            key={`${key}-${name}`}
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: palette.text,
                              background: palette.chipBg,
                              border: `1px solid ${palette.chipBorder}`,
                              borderRadius: 999,
                              padding: "6px 10px",
                              lineHeight: 1.2,
                            }}
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#1e293b" }}>詳細件数</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>CT・MRI は偏り確認のため少しだけ強めに表示しています</div>
          </div>
          <div style={{ marginTop: 16, overflowX: "auto", maxHeight: "70vh", border: "2px solid #cbd5e1", borderRadius: 14, background: "#ffffff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "15px", textAlign: "center", tableLayout: "auto" }}>
              <thead><tr><th style={{ position: "sticky", top: 0, left: 0, background: "#f8fafc", zIndex: 15, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", color: "#1e293b", fontWeight: 900 }}>スタッフ</th>{ROOM_SECTIONS.map(r => <th key={r} style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 12, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", fontWeight: 900 }}>{r}</th>)}</tr></thead>
              <tbody>
                {groupedMonthlyStatsRows.map(group => {
                  const groupStyle = monthlyStatsGroupStyles[group.key] || monthlyStatsGroupStyles["その他"];
                  return (
                    <React.Fragment key={group.key}>
                      <tr>
                        <td colSpan={ROOM_SECTIONS.length + 1} style={{ padding: "10px 14px", background: groupStyle.bg, color: groupStyle.text, fontWeight: 900, textAlign: "left", borderTop: `2px solid ${groupStyle.border}`, borderBottom: `2px solid ${groupStyle.border}` }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 999, background: groupStyle.accent, display: "inline-block" }}></span>
                            {group.label}
                          </span>
                        </td>
                      </tr>
                      {group.rows.map(({ staff, flatIndex, tags }) => {
                        const isZebra = flatIndex % 2 === 1; const rowBg = isZebra ? "#f8fafc" : "#ffffff";
                        return (
                          <tr key={staff} className="calendar-row">
                            <td onClick={() => setSelectedStaffForStats(staff)} style={{ position: "sticky", left: 0, background: rowBg, zIndex: 10, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", fontWeight: 900, textAlign: "left", cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span>{staff}</span>
                                {tags.map(tag => {
                                  const tagStyle = monthlyStatsGroupStyles[tag] || monthlyStatsGroupStyles["その他"];
                                  return <span key={tag} style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999, fontSize: 12, fontWeight: 800, background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.border}`, textDecoration: "none" }}>{tag}</span>;
                                })}
                              </div>
                            </td>
                            {ROOM_SECTIONS.map(r => {
                              const stat = monthlyMatrixStats[staff]?.[r] || { total: 0, late: 0 }; let bg = rowBg; let color = "#334155";
                              if (["CT", "MRI"].includes(r)) { if (stat.total > 0) { bg = `rgba(59, 130, 246, ${Math.min(0.1 + stat.total * 0.15, 0.9)})`; if(stat.total >= 3) color = "#fff"; } else if (isMonthlyMainStaff(r, staff, monthlyAssign)) bg = "#fef08a"; }
                              return (
                                <td key={r} style={{ padding: 10, background: bg, color: color, fontWeight: stat.total > 0 ? 900 : 500, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    {stat.total > 0 ? (
                                      <button type="button" onClick={() => setSelectedMatrixCell({ staff, room: r })} style={{ border: "none", background: "transparent", padding: 0, margin: 0, fontSize: 17, fontWeight: 900, color: "inherit", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}>{stat.total}</button>
                                    ) : <span style={{ width: "16px" }}></span>}
                                    {stat.late > 0 && <span style={{ fontSize: "13px", background: "#fef08a", color: "#b45309", padding: "2px 6px", borderRadius: "6px", border: "1px solid #fde047" }}>遅{stat.late}</span>}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </React.Fragment>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
             <div><label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>一般スタッフ</label><textarea className="name-textarea" placeholder="例: スタッフA(すたっふA)" value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} /></div>
             <div><label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>受付スタッフ</label><textarea className="name-textarea" placeholder="例: スタッフA(すたっふA)" value={customRules.receptionStaffList} onChange={e => setCustomRules({...customRules, receptionStaffList: e.target.value})} /></div>
             <div><label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>一般スタッフのなかの女性</label><textarea className="name-textarea" placeholder="例: スタッフA、スタッフB" value={customRules.femaleStaffList || ""} onChange={e => setCustomRules({...customRules, femaleStaffList: e.target.value})} /></div>
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
            <h4 style={{ fontSize: 23, fontWeight: 900, color: "#475569", marginBottom: 20, borderBottom: "2px solid #cbd5e1", paddingBottom: 10 }}>フェーズ1：前提処理（前日・不在・閉室準備）</h4>
            
            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🙅" title="担当不可ルール">
              {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                    <Row><StaffSel v={rule.staff} onChange={(v:any)=>updateRule("forbidden", idx, "staff", v)} list={activeGeneralStaff} /><DelBtn onClick={()=>removeRule("forbidden", idx)} /></Row>
                    <MultiPicker selected={rule.sections} onChange={(v: string) => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button>
            </RuleCard>


            <RuleCard bg="#fef2f2" border="#fecaca" color="#b91c1c" icon="🚫" title="NGペア">
              {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <Row key={idx}><StaffSel v={rule.s1} onChange={(v:any)=>updateRule("ngPairs", idx, "s1", v)} list={activeGeneralStaff} /><span className="rule-label">と</span><StaffSel v={rule.s2} onChange={(v:any)=>updateRule("ngPairs", idx, "s2", v)} list={activeGeneralStaff} /><select value={rule.level || "hard"} onChange={(e: any) => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"120px"}}><option value="hard">絶対NG</option><option value="soft">なるべくNG</option></select><DelBtn onClick={()=>removeRule("ngPairs", idx)} /></Row>
              ))}
              <button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ NGペアを追加</button>
            </RuleCard>

            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🕒" title="半日不可・連日回避">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【半日不可】半休・AM/PM不可の部屋（兼務自体は可）</label><MultiPicker selected={customRules.fullDayOnlyRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, fullDayOnlyRooms: v})} options={ROOM_SECTIONS} /></div>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【連日を強く回避・週1回優先】連日はなるべく避け、今週2回目以降もできれば避けたい部屋（不足時は許容）</label><MultiPicker selected={customRules.noConsecutiveRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, noConsecutiveRooms: v})} options={ROOM_SECTIONS} /></div>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【待機・透析後胸部】重ねない部屋</label><MultiPicker selected={customRules.fluoroAuxConflictRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, fluoroAuxConflictRooms: v})} options={ROOM_SECTIONS.filter(s => !AUX_FOLLOWUP_SECTIONS.includes(s))} /></div>
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
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#b45309", marginBottom: 20, borderBottom: "2px solid #fcd34d", paddingBottom: 10 }}>フェーズ2：固定・例外・代打処理</h4>
            

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🔒" title="専従ルール">
              {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <Row key={idx}><StaffSel v={rule.staff} onChange={(v:any)=>updateRule("fixed", idx, "staff", v)} list={activeGeneralStaff} /><RoomSel v={rule.section} onChange={(v:any)=>updateRule("fixed", idx, "section", v)} list={ROOM_SECTIONS} /><DelBtn onClick={()=>removeRule("fixed", idx)} /></Row>
              ))}
              <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button>
            </RuleCard>
            <RuleCard bg="#fef08a" border="#fde047" color="#a16207" icon="🚨" title="緊急ルール（人数不足時）">
              <div style={{ marginBottom: 16, padding: "12px", background: "#fef8f8", borderRadius: "8px", border: "1px dashed #fca5a5", color: "#991b1b", fontSize: "15px", fontWeight: "600" }}>💡 <b>「左側（発動条件）」から「右側（アクション）」へ</b> 流れるようにルールを設定します。</div>
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
                    <label style={{display:"inline-flex", alignItems:"center", gap:6, fontSize:14, fontWeight:700, color:"#6d28d9", marginLeft:4}}>
                      <input type="checkbox" checked={!!rule.fromSecondUseInWeek} onChange={(e:any)=>updateRule("lateShifts", idx, "fromSecondUseInWeek", e.target.checked)} />
                      部屋の今週2回目以降
                    </label>
                    <DelBtn onClick={()=>removeRule("lateShifts", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)", fromSecondUseInWeek: false })}>＋ 遅番ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#fff1f2" border="#fecaca" color="#be185d" icon="⚠️" title="兼務上限のストッパー設定">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <NumInp v={customRules.alertMaxKenmu ?? 3} onChange={(v:any)=>setCustomRules({...customRules, alertMaxKenmu: v})} w={80} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#9f1239" }}>部屋以上の兼務は自動ブロック（手動時はエラー表示）</span>
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
                    <label style={{ fontSize: 17, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>基本で担当させる対象部屋</label>
                    <MultiPicker selected={customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT"} onChange={(v: string) => setCustomRules({...customRules, supportTargetRooms: v})} options={ROOM_SECTIONS} />
                  </div>
              </div>
              <div style={{ marginTop: 14, background: "#ffffff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", color: "#166534", fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>
                基本は対象部屋の2人目として兼務で使います。通常の基本兼務・空室救済の後、3件兼務を作る前に対象部屋をサポートスタッフ1人で維持できる場合は相方を外します。1号室・5号室などが空いている場合はサポートスタッフを残して相方を空室へ移動します。サポートスタッフの単独配置は、通常候補と救済でも埋まらない場合に、3件兼務より先に使います。
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
              let badgeColor = "#475569"; let badgeBg = "#ffffff"; let icon = "⚠️"; let borderColor = "#cbd5e1"; let cardBg = "#ffffff"; let accentColor = "#94a3b8";
              if (w.level === 'red') { badgeColor = "#991b1b"; badgeBg = "#fff5f5"; icon = "🔴"; borderColor = "#fca5a5"; cardBg = "#fffdfd"; accentColor = "#dc2626"; }
              else if (w.level === 'orange') { badgeColor = "#9a3412"; badgeBg = "#fff7ed"; icon = "🟠"; borderColor = "#fdba74"; cardBg = "#fffdfa"; accentColor = "#ea580c"; }
              else if (w.level === 'yellow') { badgeColor = "#854d0e"; badgeBg = "#fffbea"; icon = "🟡"; borderColor = "#facc15"; cardBg = "#fffefd"; accentColor = "#ca8a04"; }
              
              return (
                <li key={i} style={{ display: "flex", gap: "12px", padding: "16px 20px", marginBottom: "12px", background: cardBg, border: `1px solid ${borderColor}`, borderLeft: `6px solid ${accentColor}`, borderRadius: "12px", fontSize: 16, fontWeight: 700, color: "#1e293b", lineHeight: 1.6, alignItems: "center", boxShadow: "0 6px 16px -14px rgba(15,23,42,0.22)" }}>
                  <span style={{ display: "inline-block", background: badgeBg, color: badgeColor, padding: "5px 10px", borderRadius: "999px", fontSize: "14px", fontWeight: 800, whiteSpace: "nowrap", border: `1px solid ${borderColor}` }}>{icon} {w.title}</span>
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
              {Object.entries(allDays).filter(([dateStr]) => dateStr >= assignmentCycleInfo.startId && dateStr < assignmentCycleInfo.endExclusiveId).sort((a, b) => a[0].localeCompare(b[0])).map(([dateStr, cells]) => {
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

      {selectedMatrixCell && (
        <Modal title={`📅 ${selectedMatrixCell.staff} さんの ${selectedMatrixCell.room} 日付一覧`} onClose={() => setSelectedMatrixCell(null)}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 18 }}>
            <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}><th style={{ padding: "12px 10px", textAlign: "left" }}>日付</th><th style={{ padding: "12px 10px", textAlign: "left" }}>担当</th></tr></thead>
            <tbody>
              {Object.entries(allDays)
                .filter(([dateStr]) => dateStr >= assignmentCycleInfo.startId && dateStr < assignmentCycleInfo.endExclusiveId)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([dateStr, cells]) => {
                  const members = split(cells[selectedMatrixCell.room] || "");
                  const hit = members.find(m => extractStaffName(m) === selectedMatrixCell.staff);
                  if (!hit) return null;
                  const dObj = new Date(dateStr); const YOUBI = ["日", "月", "火", "水", "木", "金", "土"];
                  const label = `${dObj.getMonth() + 1}/${dObj.getDate()}(${YOUBI[dObj.getDay()]})`;
                  const timeStr = hit.substring(selectedMatrixCell.staff.length) || "終日";
                  return (
                    <tr key={dateStr} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px", fontWeight: 600 }}>{label}</td>
                      <td style={{ padding: "12px 10px", color: "#0f766e", fontWeight: 700 }}>{selectedMatrixCell.room}{timeStr === "終日" ? "" : timeStr}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Modal>
      )}

      {showLogDay && (
        <Modal title={`🧭 ${showLogDay} の配置ログ`} onClose={() => setShowLogDay(null)} wide>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 16, color: "#334155", lineHeight: 1.8 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>見方</div>
            <div>上段は自動配置の流れです。下段の<strong>最終確定</strong>に、その日の最終結果をまとめています。</div>
          </div>
          <h4 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>配置の流れ</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {assignLogs[showLogDay]?.filter(log => log !== "・■仕上げ").map((log, i) => renderLog(log, i))}
            {!assignLogs[showLogDay] || assignLogs[showLogDay].length === 0 ? <li style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>自動割当の履歴がありません</li> : null}
          </ul>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "2px solid #e2e8f0" }}>
            <h4 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>最終確定</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
              {getFinalAssignmentRows(showLogDay).map((row, i) => (
                <div key={row.sec + i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontWeight: 800, color: "#334155", marginBottom: 4 }}>{row.sec}</div>
                  <div style={{ color: "#0f172a", fontWeight: 700, lineHeight: 1.7, wordBreak: "break-word" }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {showRuleModal && (
        <Modal title="📖 勤務割付システムのルール" onClose={() => setShowRuleModal(false)} wide>
          <div style={{ lineHeight: 1.8, fontSize: "15px", color: "#334155" }}>
            <p>このシステムはランダムではなく、複数のルールを順番に適用して配置を作ります。まず前提条件を固め、そのあと主配置、交換、兼務、救済、仕上げの順で調整していきます。</p>
            
            <h4 style={{ color: "#e11d48", borderBottom: "2px solid #ffe4e6", paddingBottom: 8, marginTop: 24 }}>🛑 1. システムが「絶対に守る」鉄の掟</h4>
            <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}><strong>担当不可・NGペアの厳守:</strong> 「この部屋はまだ不可」「この2人は同室にしない」設定は必ず守ります。</li>
              <li style={{ marginBottom: 8 }}><strong>兼務上限（過労ストッパー）:</strong> 設定値（標準3）に達した時点で⚠️注意が出ます。上限を超える自動配置はブロックされます。</li>
              <li style={{ marginBottom: 8 }}><strong>連日禁止・週1回優先:</strong> ポータブルなど指定部屋は、連日担当をフェーズ4以降の強制除外として扱います。ポータブルは設定した候補部屋の優先順を守り、原則として3号室兼務に寄せます。3号室担当が連日などで使えない場合は、ポータブル担当者を3号室へ入れる交換を先に試し、それでも無理な場合のみ週内2回目を許容します。</li>
              <li style={{ marginBottom: 8 }}><strong>半日不可部屋のブロック:</strong> 午前後休の人をDSA/MRI等にAM/PM配置しない設定です。兼務自体を禁止する設定ではありません。</li>
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
              <li style={{ marginBottom: 8 }}><strong>メイン配置:</strong> 優先順位の高い部屋から順番にメイン担当者を決めます。</li>
              <li style={{ marginBottom: 8 }}>
                <strong>兼務・交換・救済:</strong>
                <div style={{ background: "#f0fdf4", padding: "8px 12px", borderRadius: 6, border: "1px solid #bbf7d0", margin: "4px 0" }}>
                   💡 フェーズ4では、<strong>交換ルール → 基本兼務 → 空室救済 → サポート最終整理 → 遅番</strong> の順で処理します。<br/>
                   候補の選び方はルールの種類ごとに少し違いますが、主に <strong>当日の兼務負荷</strong>、<strong>過去担当回数</strong>、<strong>設定した優先順</strong> を見ながら安全な候補を選びます。
                </div>
                定員割れがある場合は、ほかの部屋への影響が少ない候補から兼務や救済を呼びます。
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>総仕上げ（昼当番・余剰配置）:</strong>
                昼当番を決定後、余力のあるスタッフは優先的に兼務解消（専任化）にあてられます。3件兼務は最後の手段に寄せ、サポート対象部屋は可能ならサポートスタッフ1人で維持して負担を逃がします。
              </li>
            </ol>

            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: 16, borderRadius: 8, marginTop: 32 }}>
              <strong style={{ color: "#334155" }}>💡 最後に</strong><br/>
              もし「この部屋の負担が偏っている」場合は、人間が【設定画面】の「月担当」や「優先順位」を少し調整することで、意図に近いシフトを作れるようになります。
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const roomLinkLabel = (room: string) => ({
  "1号室": "1号室",
  "2号室": "2号室",
  "3号室": "3号室",
  "5号室": "5号室",
  "透視（6号）": "透視6",
  "透視（11号）": "透視11",
  "骨塩": "骨塩",
  "パノラマCT": "パノラマ",
  "ポータブル": "ポータブル",
  "検像": "検像",
  "DSA": "DSA",
  "治療": "治療"
} as Record<string, string>)[room] || room.replace(/[（）()]/g, "");

const formatPrintMember = (m: string) => m
  .replace(/（/g, "(")
  .replace(/）/g, ")")
  .replace("(AM)", " AM")
  .replace("(PM)", " PM")
  .replace("(〜", " ")
  .replace("(17:00〜)", " 17:00〜")
  .replace("(16:00〜)", " 16:00〜")
  .replace("(12:15〜13:00)", " 12:15〜13:00")
  .trim();


