import React, { useEffect, useMemo, useRef, useState } from "react";

type Section =
  | "明け"
  | "入り"
  | "土日休日代休"
  | "不在"
  | "待機"
  | "CT"
  | "MRI"
  | "RI"
  | "1号室"
  | "2号室"
  | "3号室"
  | "5号室"
  | "透視（6号）"
  | "透視（11号）"
  | "MMG"
  | "骨塩"
  | "パノラマCT"
  | "ポータブル"
  | "DSA"
  | "透析後胸部"
  | "治療"
  | "検像"
  | "昼当番"
  | "受付"
  | "受付ヘルプ";

type CellMap = Record<Section, string>;
type MonthlyAssign = Record<string, string>;
type CapacityMap = Partial<Record<Section, number>>;
type DayData = {
  id: string;
  label: string;
  isHoliday: boolean;
  holidayName: string;
  cells: CellMap;
};

type NgPair = { s1: string; s2: string; level: "hard" | "soft" };
type FixedRule = { staff: string; section: Section };
type ForbiddenRule = { staff: string; sections: string };
type LateShiftRule = { section: Section; lateTime: string; defaultTime: string };
type DailyAdditionRule = { date: string; section: Section; count: number; time: string };

type Settings = {
  staffList: string;
  receptionStaffList: string;
  supportStaffList: string;
  supportTargetRooms: string;
  customHolidays: string;
  capacity: CapacityMap;
  priorityRooms: Section[];
  fullDayOnlyRooms: string;
  ngPairs: NgPair[];
  fixed: FixedRule[];
  forbidden: ForbiddenRule[];
  lateShifts: LateShiftRule[];
  dailyAdditions: DailyAdditionRule[];
  helpThreshold: number;
  lunchBaseCount: number;
  lunchPrioritySections: string;
  lunchLastResortSections: string;
};

type WarningItem = { type: "error" | "alert" | "info"; message: string };

type AssignmentEngineContext = {
  allStaff: string[];
  generalStaff: string[];
  receptionStaff: string[];
  monthlyAssign: MonthlyAssign;
  settings: Settings;
};

const SECTIONS: Section[] = [
  "明け",
  "入り",
  "土日休日代休",
  "不在",
  "待機",
  "CT",
  "MRI",
  "RI",
  "1号室",
  "2号室",
  "3号室",
  "5号室",
  "透視（6号）",
  "透視（11号）",
  "MMG",
  "骨塩",
  "パノラマCT",
  "ポータブル",
  "DSA",
  "透析後胸部",
  "治療",
  "検像",
  "昼当番",
  "受付",
  "受付ヘルプ",
];

const REST_SECTIONS: Section[] = ["明け", "入り", "土日休日代休", "不在"];
const ROOM_SECTIONS: Section[] = SECTIONS.filter(
  (s) => !["明け", "入り", "土日休日代休", "不在", "昼当番"].includes(s),
) as Section[];
const WORK_SECTIONS: Section[] = SECTIONS.filter(
  (s) => !["明け", "入り", "土日休日代休", "不在", "待機", "昼当番"].includes(s),
) as Section[];
const MONTHLY_CATEGORIES = [
  "CT",
  "MRI",
  "治療",
  "治療サブ優先",
  "治療サブ",
  "RI",
  "RIサブ",
  "MMG",
  "透析後胸部",
  "受付",
  "受付ヘルプ",
];
const DEFAULT_PRIORITY_ROOMS: Section[] = [
  "受付",
  "治療",
  "CT",
  "MRI",
  "RI",
  "ポータブル",
  "2号室",
  "5号室",
  "透視（6号）",
  "透視（11号）",
  "MMG",
  "1号室",
  "3号室",
  "DSA",
  "検像",
  "骨塩",
  "パノラマCT",
  "透析後胸部",
  "受付ヘルプ",
  "待機",
];
const FALLBACK_HOLIDAYS: Record<string, string> = {
  "2026-01-01": "元日",
  "2026-01-12": "成人の日",
  "2026-02-11": "建国記念の日",
  "2026-02-23": "天皇誕生日",
  "2026-03-20": "春分の日",
  "2026-04-29": "昭和の日",
  "2026-05-03": "憲法記念日",
  "2026-05-04": "みどりの日",
  "2026-05-05": "こどもの日",
  "2026-05-06": "振替休日",
};
const STORAGE_KEYS = {
  allDays: "shifto.v2.allDays",
  monthly: "shifto.v2.monthly",
  settings: "shifto.v2.settings",
};
const TIME_OPTIONS = [
  "",
  "(AM)",
  "(PM)",
  "(12:15〜13:00)",
  "(16:00〜)",
  "(17:00〜19:00)",
  "(17:00〜22:00)",
];

const DEFAULT_MONTHLY_ASSIGN: MonthlyAssign = {
  CT: "",
  MRI: "",
  治療: "",
  治療サブ優先: "",
  治療サブ: "",
  RI: "",
  RIサブ: "",
  MMG: "",
  透析後胸部: "",
  受付: "",
  受付ヘルプ: "",
};

const DEFAULT_SETTINGS: Settings = {
  staffList: "",
  receptionStaffList: "",
  supportStaffList: "",
  supportTargetRooms: "1号室,2号室,5号室,パノラマCT",
  customHolidays: "",
  capacity: { CT: 3, MRI: 3, 治療: 3, RI: 1, 受付: 2 },
  priorityRooms: DEFAULT_PRIORITY_ROOMS,
  fullDayOnlyRooms: "DSA,検像,骨塩,パノラマCT",
  ngPairs: [],
  fixed: [],
  forbidden: [],
  lateShifts: [],
  dailyAdditions: [],
  helpThreshold: 17,
  lunchBaseCount: 3,
  lunchPrioritySections: "RI,1号室,2号室,3号室,5号室,CT",
  lunchLastResortSections: "治療",
};

function emptyCells(): CellMap {
  return Object.fromEntries(SECTIONS.map((s) => [s, ""])) as CellMap;
}

function split(value: string): string[] {
  return (value || "")
    .split(/[、,\n]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function join(values: string[]): string {
  return values.filter(Boolean).join("、");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toId(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDayLabel(date: Date): string {
  const yobi = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}(${yobi[date.getDay()]})`;
}

function mondayOf(dateText: string): string {
  const date = new Date(dateText);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return toId(date);
}

function extractStaffName(value: string): string {
  return value.replace(/\(.*?\)/g, "").replace(/（.*?）/g, "").trim();
}

function extractTimeTag(value: string): string {
  const core = extractStaffName(value);
  return value.slice(core.length);
}

function staffAmount(value: string): number {
  if (/(\(AM\)|\(PM\)|\(〜.*?\)|\(.*?〜\))/.test(value)) return 0.5;
  return 1;
}

function parseStaffList(raw: string): string[] {
  const parsed = split(raw).map((token) => {
    const match = token.match(/^(.*?)[(（](.*?)[)）]$/);
    return {
      name: match ? match[1].trim() : token.trim(),
      yomi: match ? match[2].trim() : token.trim(),
    };
  });
  parsed.sort((a, b) => a.yomi.localeCompare(b.yomi, "ja"));
  return unique(parsed.map((p) => p.name));
}

function getMonthlyCandidates(section: string, monthlyAssign: MonthlyAssign): string[] {
  if (section === "治療") {
    return unique([
      ...split(monthlyAssign["治療"] || ""),
      ...split(monthlyAssign["治療サブ優先"] || ""),
      ...split(monthlyAssign["治療サブ"] || ""),
    ]).map(extractStaffName);
  }
  if (section === "RI") {
    return unique([
      ...split(monthlyAssign["RI"] || ""),
      ...split(monthlyAssign["RIサブ"] || ""),
    ]).map(extractStaffName);
  }
  return split(monthlyAssign[section] || "").map(extractStaffName);
}

function mergeClasses(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

function isForbidden(staff: string, section: Section, settings: Settings): boolean {
  return settings.forbidden.some(
    (rule) => rule.staff === staff && split(rule.sections).includes(section),
  );
}

function hasNgPair(candidate: string, existing: string[], settings: Settings, includeSoft: boolean): boolean {
  return existing.some((name) =>
    settings.ngPairs.some((pair) => {
      const matched =
        (pair.s1 === candidate && pair.s2 === name) ||
        (pair.s2 === candidate && pair.s1 === name);
      if (!matched) return false;
      if (pair.level === "hard") return true;
      return includeSoft;
    }),
  );
}

function getHolidayName(id: string, settings: Settings, holidayMap: Record<string, string>): string {
  if (holidayMap[id]) return holidayMap[id];
  return split(settings.customHolidays).includes(id) ? "休診日" : "";
}

function buildWeek(targetMonday: string, settings: Settings, allDays: Record<string, CellMap>, holidayMap: Record<string, string>): DayData[] {
  const [y, m, d] = targetMonday.split("-").map(Number);
  const monday = new Date(y, m - 1, d);
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const id = toId(date);
    const holidayName = getHolidayName(id, settings, holidayMap);
    return {
      id,
      label: formatDayLabel(date),
      isHoliday: Boolean(holidayName),
      holidayName,
      cells: allDays[id] || emptyCells(),
    };
  });
}

function availableStaffForSection(section: Section, cells: CellMap, ctx: AssignmentEngineContext): string[] {
  const absent = unique([
    ...split(cells["明け"]).map(extractStaffName),
    ...split(cells["入り"]).map(extractStaffName),
    ...split(cells["土日休日代休"]).map(extractStaffName),
    ...split(cells["不在"]).map(extractStaffName),
  ]);
  if (REST_SECTIONS.includes(section)) return ctx.allStaff.filter((name) => !absent.includes(name));
  if (section === "受付") {
    const base = ctx.receptionStaff.length > 0 ? ctx.receptionStaff : ctx.generalStaff;
    return base.filter((name) => !absent.includes(name));
  }
  if (["昼当番", "待機", "受付ヘルプ"].includes(section)) return ctx.allStaff.filter((name) => !absent.includes(name));
  return ctx.generalStaff.filter((name) => !absent.includes(name));
}

function sectionCapacity(section: Section, settings: Settings, dateId: string): number {
  const additions = settings.dailyAdditions
    .filter((rule) => rule.date === dateId && rule.section === section)
    .reduce((sum, rule) => sum + Number(rule.count || 0), 0);
  const base = settings.capacity[section] ?? (["CT", "MRI", "治療"].includes(section) ? 3 : section === "RI" ? 1 : 0);
  return base + additions;
}

function preferCandidates(section: Section, ctx: AssignmentEngineContext): string[] {
  return getMonthlyCandidates(section, ctx.monthlyAssign);
}

function makePlaceholder(section: Section, time: string): string {
  return `${section}枠${time === "全日" ? "" : time || ""}`;
}

function getPastAssignmentCount(staff: string, pastDays: DayData[]): number {
  let count = 0;
  for (const day of pastDays) {
    for (const section of WORK_SECTIONS) {
      const names = split(day.cells[section]).map(extractStaffName);
      if (names.includes(staff)) count += 1;
    }
  }
  return count;
}

function pushMember(cells: CellMap, section: Section, value: string) {
  const current = split(cells[section]);
  cells[section] = join([...current, value]);
}

function removeMemberEverywhere(cells: CellMap, staff: string, keepSection?: Section) {
  for (const section of SECTIONS) {
    if (keepSection && section === keepSection) continue;
    cells[section] = join(split(cells[section]).filter((v) => extractStaffName(v) !== staff));
  }
}

function applyLateShiftRules(day: DayData, prevDay: DayData | null, ctx: AssignmentEngineContext) {
  for (const rule of ctx.settings.lateShifts) {
    const currentMembers = split(day.cells[rule.section]);
    if (currentMembers.length === 0) continue;

    const alreadyLate = currentMembers.some((member) => member.includes(rule.lateTime));
    if (alreadyLate) continue;

    const currentNames = currentMembers.map(extractStaffName);
    const previousLate = prevDay
      ? split(prevDay.cells[rule.section]).filter((member) => member.includes(rule.lateTime)).map(extractStaffName)
      : [];

    const candidates = availableStaffForSection(rule.section, day.cells, ctx)
      .filter((name) => currentNames.includes(name) || !currentNames.includes(name))
      .filter((name) => !isForbidden(name, rule.section, ctx.settings))
      .sort((a, b) => {
        const prevPenaltyA = previousLate.includes(a) ? 1 : 0;
        const prevPenaltyB = previousLate.includes(b) ? 1 : 0;
        if (prevPenaltyA !== prevPenaltyB) return prevPenaltyA - prevPenaltyB;
        return a.localeCompare(b, "ja");
      });

    const chosen = currentMembers.find((member) => !previousLate.includes(extractStaffName(member))) || candidates[0];
    if (!chosen) continue;

    const baseName = extractStaffName(chosen);
    const next = currentMembers.map((member) => {
      if (extractStaffName(member) !== baseName) return member;
      return `${baseName}${rule.defaultTime || rule.lateTime}`;
    });
    next[0] = next[0];
    const lateIndex = next.findIndex((member) => extractStaffName(member) === baseName);
    if (lateIndex >= 0) next[lateIndex] = `${baseName}${rule.lateTime}`;
    day.cells[rule.section] = join(next);
  }
}

function fillSection(
  section: Section,
  day: DayData,
  prevDay: DayData | null,
  pastDays: DayData[],
  ctx: AssignmentEngineContext,
  used: Set<string>,
) {
  const current = split(day.cells[section]);
  const fullDayOnly = split(ctx.settings.fullDayOnlyRooms);
  const capacity = sectionCapacity(section, ctx.settings, day.id);
  if (capacity <= 0) return;

  const placeholders = ctx.settings.dailyAdditions.filter((rule) => rule.date === day.id && rule.section === section);
  for (const addition of placeholders) {
    for (let i = 0; i < addition.count; i += 1) {
      current.push(makePlaceholder(section, addition.time));
    }
  }

  const targetCount = capacity;
  const existingRealMembers = current.filter((value) => !extractStaffName(value).endsWith("枠"));
  const currentNames = existingRealMembers.map(extractStaffName);
  let amount = existingRealMembers.reduce((sum, value) => sum + staffAmount(value), 0);

  const available = availableStaffForSection(section, day.cells, ctx);
  const preferred = preferCandidates(section, ctx);
  const prevNames = prevDay ? split(prevDay.cells[section]).map(extractStaffName) : [];

  const pool = unique([...preferred, ...available]).filter(Boolean);

  while (amount < targetCount) {
    const candidates = pool
      .filter((name) => available.includes(name))
      .filter((name) => !used.has(name))
      .filter((name) => !currentNames.includes(name))
      .filter((name) => !isForbidden(name, section, ctx.settings))
      .filter((name) => !hasNgPair(name, currentNames, ctx.settings, true))
      .filter((name) => !(prevNames.includes(name) && !preferred.includes(name)))
      .sort((a, b) => {
        const preferredA = preferred.includes(a) ? 1 : 0;
        const preferredB = preferred.includes(b) ? 1 : 0;
        if (preferredA !== preferredB) return preferredB - preferredA;
        const fullPenaltyA = fullDayOnly.includes(section) ? 0 : 0;
        const fullPenaltyB = fullDayOnly.includes(section) ? 0 : 0;
        if (fullPenaltyA !== fullPenaltyB) return fullPenaltyA - fullPenaltyB;
        const pastA = getPastAssignmentCount(a, pastDays);
        const pastB = getPastAssignmentCount(b, pastDays);
        if (pastA !== pastB) return pastA - pastB;
        return a.localeCompare(b, "ja");
      });

    const selected = candidates[0];
    if (!selected) break;

    currentNames.push(selected);
    existingRealMembers.push(selected);
    used.add(selected);
    amount += 1;
  }

  day.cells[section] = join([...existingRealMembers, ...current.filter((value) => extractStaffName(value).endsWith("枠"))]);
}

function assignLunch(day: DayData, ctx: AssignmentEngineContext) {
  const target = ctx.settings.lunchBaseCount;
  const current = split(day.cells["昼当番"]).map(extractStaffName);
  const prioritySections = split(ctx.settings.lunchPrioritySections) as Section[];
  const lastResortSections = split(ctx.settings.lunchLastResortSections) as Section[];

  const addCandidate = (name: string) => {
    if (!name) return;
    if (current.includes(name)) return;
    if (isForbidden(name, "昼当番", ctx.settings)) return;
    current.push(name);
  };

  for (const section of prioritySections) {
    for (const member of split(day.cells[section as Section])) {
      addCandidate(extractStaffName(member));
      if (current.length >= target) break;
    }
    if (current.length >= target) break;
  }

  if (current.length < target) {
    const blocked = new Set<string>();
    for (const section of lastResortSections) {
      split(day.cells[section]).forEach((member) => blocked.add(extractStaffName(member)));
    }
    const pool = ctx.generalStaff.filter((name) => !blocked.has(name));
    for (const name of pool) {
      addCandidate(name);
      if (current.length >= target) break;
    }
  }

  day.cells["昼当番"] = join(current.slice(0, target));
}

function assignReceptionHelp(day: DayData, ctx: AssignmentEngineContext) {
  const receptionNeeded = sectionCapacity("受付", ctx.settings, day.id);
  const currentReception = split(day.cells["受付"]).length;
  if (currentReception >= receptionNeeded) return;

  const help = split(day.cells["受付ヘルプ"]).map(extractStaffName);
  const lunch = split(day.cells["昼当番"]).map(extractStaffName);
  const available = availableStaffForSection("受付ヘルプ", day.cells, ctx)
    .filter((name) => !help.includes(name))
    .filter((name) => !isForbidden(name, "受付ヘルプ", ctx.settings));

  const first = lunch.find((name) => available.includes(name));
  const second = available.find((name) => name !== first);
  const result: string[] = [];
  if (first) result.push(`${first}(12:15〜13:00)`);
  if (second) result.push(`${second}(16:00〜)`);
  day.cells["受付ヘルプ"] = join(result);
}

function assignSupport(day: DayData, ctx: AssignmentEngineContext, used: Set<string>) {
  const supportStaff = split(ctx.settings.supportStaffList).map(extractStaffName);
  const targets = split(ctx.settings.supportTargetRooms) as Section[];
  for (const staff of supportStaff) {
    if (used.has(staff)) continue;
    for (const section of targets) {
      if (isForbidden(staff, section, ctx.settings)) continue;
      const members = split(day.cells[section]);
      if (members.length === 1) {
        pushMember(day.cells, section, staff);
        used.add(staff);
        break;
      }
    }
  }
}

function applyFixedRules(day: DayData, ctx: AssignmentEngineContext, used: Set<string>) {
  for (const rule of ctx.settings.fixed) {
    const available = availableStaffForSection(rule.section, day.cells, ctx);
    if (!available.includes(rule.staff)) continue;
    if (isForbidden(rule.staff, rule.section, ctx.settings)) continue;
    removeMemberEverywhere(day.cells, rule.staff, rule.section);
    const current = split(day.cells[rule.section]).map(extractStaffName);
    if (!current.includes(rule.staff)) pushMember(day.cells, rule.section, rule.staff);
    used.add(rule.staff);
  }
}

function cleanupUnavailable(day: DayData) {
  const absent = new Set(
    unique([
      ...split(day.cells["明け"]).map(extractStaffName),
      ...split(day.cells["入り"]).map(extractStaffName),
      ...split(day.cells["土日休日代休"]).map(extractStaffName),
      ...split(day.cells["不在"]).map(extractStaffName),
    ]),
  );
  for (const section of WORK_SECTIONS) {
    day.cells[section] = join(
      split(day.cells[section]).filter((value) => {
        const name = extractStaffName(value);
        if (name.endsWith("枠")) return true;
        return !absent.has(name);
      }),
    );
  }
}

function autoAssignDay(baseDay: DayData, prevDay: DayData | null, pastDays: DayData[], ctx: AssignmentEngineContext): DayData {
  const day: DayData = { ...baseDay, cells: { ...baseDay.cells } };

  if (prevDay) {
    const iri = split(prevDay.cells["入り"]).map(extractStaffName);
    day.cells["明け"] = join(unique([...split(day.cells["明け"]), ...iri]));
  }

  if (day.isHoliday) {
    return { ...day, cells: emptyCells() };
  }

  cleanupUnavailable(day);

  const used = new Set<string>();
  for (const section of WORK_SECTIONS) {
    split(day.cells[section]).forEach((member) => used.add(extractStaffName(member)));
  }

  applyFixedRules(day, ctx, used);

  const priorityRooms = ctx.settings.priorityRooms.length > 0 ? ctx.settings.priorityRooms : DEFAULT_PRIORITY_ROOMS;
  for (const section of priorityRooms) {
    if (![...WORK_SECTIONS, "待機"].includes(section)) continue;
    fillSection(section, day, prevDay, pastDays, ctx, used);
  }

  assignSupport(day, ctx, used);
  assignLunch(day, ctx);
  assignReceptionHelp(day, ctx);
  applyLateShiftRules(day, prevDay, ctx);

  return day;
}

function autoAssignWeek(days: DayData[], ctx: AssignmentEngineContext): DayData[] {
  const result: DayData[] = [];
  let prev: DayData | null = null;
  for (const day of days) {
    const next = autoAssignDay(day, prev, result, ctx);
    result.push(next);
    prev = next;
  }
  return result;
}

function buildWarnings(day: DayData, prevDay: DayData | null, settings: Settings): WarningItem[] {
  if (!day || day.isHoliday) return [];
  const warnings: WarningItem[] = [];

  for (const section of WORK_SECTIONS) {
    const cap = sectionCapacity(section, settings, day.id);
    if (cap <= 0) continue;
    const count = split(day.cells[section]).filter((value) => !extractStaffName(value).endsWith("枠")).length;
    if (count === 0) warnings.push({ type: "alert", message: `【${section}】が空です` });
    else if (count < cap) warnings.push({ type: "info", message: `【${section}】が不足しています（${count}/${cap}）` });
  }

  for (const pair of settings.ngPairs) {
    if (pair.level !== "soft") continue;
    for (const section of SECTIONS) {
      const names = split(day.cells[section]).map(extractStaffName);
      if (names.includes(pair.s1) && names.includes(pair.s2)) {
        warnings.push({ type: "alert", message: `【${section}】${pair.s1}さんと${pair.s2}さんが同時配置です` });
      }
    }
  }

  if (prevDay) {
    const prevPortable = split(prevDay.cells["ポータブル"]).map(extractStaffName);
    const currentPortable = split(day.cells["ポータブル"]).map(extractStaffName);
    for (const name of currentPortable) {
      if (prevPortable.includes(name)) {
        warnings.push({ type: "error", message: `【ポータブル連続】${name}さんが前日から連続です` });
      }
    }

    for (const rule of settings.lateShifts) {
      const prevLate = split(prevDay.cells[rule.section]).filter((v) => v.includes(rule.lateTime)).map(extractStaffName);
      const currentLate = split(day.cells[rule.section]).filter((v) => v.includes(rule.lateTime)).map(extractStaffName);
      for (const name of currentLate) {
        if (prevLate.includes(name)) {
          warnings.push({ type: "error", message: `【遅番連続】${name}さんが ${rule.section} で連続遅番です` });
        }
      }
    }
  }

  const lunchCount = split(day.cells["昼当番"]).length;
  if (lunchCount < settings.lunchBaseCount) {
    warnings.push({ type: "info", message: `【昼当番】が不足しています（${lunchCount}/${settings.lunchBaseCount}）` });
  }

  return warnings;
}

function StatsCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-sm text-slate-500">{sub}</div> : null}
    </div>
  );
}

function Panel({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      <textarea
        className="min-h-[110px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none ring-0 transition focus:border-sky-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      <input
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-sky-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
      />
    </label>
  );
}

function MemberChip({ value, onRemove }: { value: string; onRemove: () => void }) {
  const base = extractStaffName(value);
  const tag = extractTimeTag(value);
  return (
    <div className="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900">
      <span>{base}</span>
      {tag ? <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">{tag.replace(/[()]/g, "")}</span> : null}
      <button className="text-slate-400 hover:text-red-500" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

function SectionEditor({
  section,
  value,
  onChange,
  availableStaff,
}: {
  section: Section;
  value: string;
  onChange: (value: string) => void;
  availableStaff: string[];
}) {
  const members = split(value);

  const handleAdd = (name: string) => {
    if (!name) return;
    const next = [...members, section === "待機" ? `${name}(17:00〜19:00)` : name];
    onChange(join(next));
  };

  const handleTimeChange = (index: number, tag: string) => {
    const next = [...members];
    const name = extractStaffName(next[index]);
    next[index] = `${name}${tag}`;
    onChange(join(next));
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-base font-bold text-slate-900">{section}</div>
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          defaultValue=""
          onChange={(e) => {
            handleAdd(e.target.value);
            e.currentTarget.value = "";
          }}
        >
          <option value="">＋追加</option>
          {availableStaff
            .filter((staff) => !members.some((member) => extractStaffName(member) === staff))
            .map((staff) => (
              <option key={staff} value={staff}>
                {staff}
              </option>
            ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.length === 0 ? <div className="text-sm text-slate-400">未設定</div> : null}
        {members.map((member, index) => (
          <div key={`${member}-${index}`} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <MemberChip value={member} onRemove={() => onChange(join(members.filter((_, i) => i !== index)))} />
            {!REST_SECTIONS.includes(section) ? (
              <select
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                value={extractTimeTag(member)}
                onChange={(e) => handleTimeChange(index, e.target.value)}
              >
                {TIME_OPTIONS.map((option) => (
                  <option key={option || "full"} value={option}>
                    {option ? option.replace(/[()]/g, "") : "終日"}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function RuleTable<T>({
  rows,
  columns,
  onAdd,
  addLabel,
}: {
  rows: T[];
  columns: Array<{
    header: string;
    render: (row: T, index: number) => React.ReactNode;
  }>;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className="px-4 py-3 text-left font-semibold text-slate-700">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={columns.length}>
                  まだありません
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index}>{columns.map((column) => <td key={column.header} className="px-4 py-3 align-top">{column.render(row, index)}</td>)}</tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button
        className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        onClick={onAdd}
      >
        ＋ {addLabel}
      </button>
    </div>
  );
}

export default function App() {
  const [allDays, setAllDays] = useLocalStorageState<Record<string, CellMap>>(STORAGE_KEYS.allDays, {});
  const [monthlyAssign, setMonthlyAssign] = useLocalStorageState<MonthlyAssign>(STORAGE_KEYS.monthly, DEFAULT_MONTHLY_ASSIGN);
  const [settings, setSettings] = useLocalStorageState<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const [history, setHistory] = useState<Record<string, CellMap>[]>([]);
  const [importText, setImportText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [holidayMap, setHolidayMap] = useState<Record<string, string>>(FALLBACK_HOLIDAYS);

  const today = useMemo(() => mondayOf(toId(new Date())), []);
  const [targetMonday, setTargetMonday] = useState(today);
  const [selectedDayId, setSelectedDayId] = useState(targetMonday);

  const generalStaff = useMemo(() => parseStaffList(settings.staffList), [settings.staffList]);
  const receptionStaff = useMemo(() => parseStaffList(settings.receptionStaffList), [settings.receptionStaffList]);
  const allStaff = useMemo(() => unique([...generalStaff, ...receptionStaff]), [generalStaff, receptionStaff]);
  const ctx = useMemo<AssignmentEngineContext>(() => ({ allStaff, generalStaff, receptionStaff, monthlyAssign, settings }), [allStaff, generalStaff, receptionStaff, monthlyAssign, settings]);

  const days = useMemo(() => buildWeek(targetMonday, settings, allDays, holidayMap), [targetMonday, settings, allDays, holidayMap]);
  const currentDay = days.find((day) => day.id === selectedDayId) || days[0];
  const prevDay = days[Math.max(0, days.findIndex((day) => day.id === currentDay.id) - 1)] || null;

  useEffect(() => {
    setSelectedDayId((prev) => (days.some((day) => day.id === prev) ? prev : days[0]?.id || targetMonday));
  }, [days, targetMonday]);

  useEffect(() => {
    fetch("https://holidays-jp.github.io/api/v1/date.json")
      .then((response) => response.json())
      .then((data) => setHolidayMap((prev) => ({ ...prev, ...data })))
      .catch(() => undefined);
  }, []);

  const setAllDaysWithHistory = (updater: Record<string, CellMap> | ((prev: Record<string, CellMap>) => Record<string, CellMap>)) => {
    setAllDays((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setHistory((current) => [...current, prev].slice(-20));
      }
      return next;
    });
  };

  const updateDayCell = (dayId: string, section: Section, value: string) => {
    setAllDaysWithHistory((prev) => {
      const next = { ...prev, [dayId]: { ...(prev[dayId] || emptyCells()), [section]: value } };
      if (section === "入り") {
        const date = new Date(dayId);
        date.setDate(date.getDate() + 1);
        const nextId = toId(date);
        next[nextId] = { ...(next[nextId] || emptyCells()), 明け: join(split(value).map(extractStaffName)) };
      }
      return next;
    });
  };

  const replaceWeek = (nextDays: DayData[]) => {
    setAllDaysWithHistory((prev) => {
      const next = { ...prev };
      for (const day of nextDays) next[day.id] = day.cells;
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setAllDays(previous);
    setHistory((current) => current.slice(0, -1));
  };

  const handleCopyPreviousDay = () => {
    const index = days.findIndex((day) => day.id === currentDay.id);
    if (index <= 0) return;
    const source = days[index - 1];
    updateDayCell(currentDay.id, "CT", currentDay.cells["CT"]);
    setAllDaysWithHistory((prev) => ({ ...prev, [currentDay.id]: { ...source.cells } }));
  };

  const handleAutoDay = () => {
    const index = days.findIndex((day) => day.id === currentDay.id);
    const base = days[index];
    const previous = index > 0 ? days[index - 1] : null;
    const past = days.slice(0, index);
    const next = autoAssignDay(base, previous, past, ctx);
    replaceWeek(days.map((day) => (day.id === next.id ? next : day)));
  };

  const handleAutoWeek = () => {
    replaceWeek(autoAssignWeek(days, ctx));
  };

  const handleClearWeekWork = () => {
    setAllDaysWithHistory((prev) => {
      const next = { ...prev };
      for (const day of days) {
        const cells = { ...(next[day.id] || day.cells) };
        for (const section of WORK_SECTIONS) cells[section] = "";
        next[day.id] = cells;
      }
      return next;
    });
  };

  const handleResetAll = () => {
    setAllDays({});
    setMonthlyAssign(DEFAULT_MONTHLY_ASSIGN);
    setSettings(DEFAULT_SETTINGS);
    setHistory([]);
  };

  const handleExport = () => {
    const payload = { allDays, monthlyAssign, settings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shifto_v2_${targetMonday}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.allDays) setAllDays(parsed.allDays);
        if (parsed.monthlyAssign) setMonthlyAssign({ ...DEFAULT_MONTHLY_ASSIGN, ...parsed.monthlyAssign });
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      } catch {
        alert("読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  const handleImportText = () => {
    if (!importText.trim()) return;
    try {
      const parsed = JSON.parse(importText);
      if (parsed.allDays) setAllDays(parsed.allDays);
      if (parsed.monthlyAssign) setMonthlyAssign({ ...DEFAULT_MONTHLY_ASSIGN, ...parsed.monthlyAssign });
      if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      setImportText("");
    } catch {
      alert("JSON の形式が正しくありません。");
    }
  };

  const handleCopyJson = async () => {
    const payload = JSON.stringify({ allDays, monthlyAssign, settings });
    await navigator.clipboard.writeText(payload);
  };

  const warnings = useMemo(() => buildWarnings(currentDay, prevDay && prevDay.id !== currentDay.id ? prevDay : null, settings), [currentDay, prevDay, settings]);

  const weeklyStats = useMemo(() => {
    const result: Record<string, { total: number; ct: number; mri: number; portable: number; room6: number; room11: number }> = {};
    for (const staff of generalStaff) {
      result[staff] = { total: 0, ct: 0, mri: 0, portable: 0, room6: 0, room11: 0 };
    }
    for (const day of days) {
      if (day.isHoliday) continue;
      for (const section of WORK_SECTIONS) {
        const names = split(day.cells[section]).map(extractStaffName);
        for (const name of names) {
          if (!result[name]) continue;
          result[name].total += 1;
          if (section === "CT") result[name].ct += 1;
          if (section === "MRI") result[name].mri += 1;
          if (section === "ポータブル") result[name].portable += 1;
          if (section === "透視（6号）") result[name].room6 += 1;
          if (section === "透視（11号）") result[name].room11 += 1;
        }
      }
    }
    return Object.entries(result).sort((a, b) => b[1].total - a[1].total);
  }, [days, generalStaff]);

  const summary = useMemo(() => {
    const staffedSlots = days.reduce((sum, day) => sum + WORK_SECTIONS.reduce((acc, section) => acc + split(day.cells[section]).length, 0), 0);
    const holidayCount = days.filter((day) => day.isHoliday).length;
    const lateRules = settings.lateShifts.length;
    return { staffedSlots, holidayCount, lateRules };
  }, [days, settings.lateShifts.length]);

  const currentCells = currentDay?.cells || emptyCells();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <section className="rounded-[32px] border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-sm font-semibold text-sky-700">勤務割付システム v2</div>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">全面書き直し版</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                1ファイルでも読みやすさを保つことを優先し、状態管理・自動割付・警告生成・入出力を分離しました。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <InputField label="週の月曜日" value={targetMonday} onChange={setTargetMonday} type="date" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700" onClick={handleAutoDay}>選択日を自動割付</button>
            <button className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700" onClick={handleAutoWeek}>週全体を自動割付</button>
            <button className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" onClick={handleUndo}>元に戻す</button>
            <button className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" onClick={handleCopyPreviousDay}>前日をコピー</button>
            <button className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" onClick={handleClearWeekWork}>週の業務欄をクリア</button>
            <button className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700" onClick={handleExport}>保存</button>
            <button className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => fileInputRef.current?.click()}>読込</button>
            <button className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700" onClick={handleResetAll}>リセット</button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.currentTarget.value = "";
              }}
            />
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="週内スタッフ数" value={allStaff.length} sub="一般＋受付" />
          <StatsCard title="割付スロット数" value={summary.staffedSlots} sub="今週の入力合計" />
          <StatsCard title="祝日数" value={summary.holidayCount} sub="表示中の5日間" />
          <StatsCard title="遅番ルール数" value={summary.lateRules} sub="設定済み" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Panel title="スタッフ設定">
              <div className="space-y-4">
                <TextAreaField label="一般スタッフ" value={settings.staffList} onChange={(value) => setSettings((prev) => ({ ...prev, staffList: value }))} placeholder="山田(やまだ), 佐藤(さとう)" />
                <TextAreaField label="受付スタッフ" value={settings.receptionStaffList} onChange={(value) => setSettings((prev) => ({ ...prev, receptionStaffList: value }))} placeholder="伊藤(いとう), 鈴木(すずき)" />
                <TextAreaField label="サポートスタッフ" value={settings.supportStaffList} onChange={(value) => setSettings((prev) => ({ ...prev, supportStaffList: value }))} placeholder="応援に回すスタッフ" />
                <TextAreaField label="追加休診日" value={settings.customHolidays} onChange={(value) => setSettings((prev) => ({ ...prev, customHolidays: value }))} placeholder="2026-12-29, 2026-12-30" />
              </div>
            </Panel>

            <Panel title="基本ルール">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <InputField label="CT定員" value={settings.capacity.CT ?? 3} onChange={(value) => setSettings((prev) => ({ ...prev, capacity: { ...prev.capacity, CT: Number(value || 0) } }))} type="number" />
                <InputField label="MRI定員" value={settings.capacity.MRI ?? 3} onChange={(value) => setSettings((prev) => ({ ...prev, capacity: { ...prev.capacity, MRI: Number(value || 0) } }))} type="number" />
                <InputField label="治療定員" value={settings.capacity.治療 ?? 3} onChange={(value) => setSettings((prev) => ({ ...prev, capacity: { ...prev.capacity, 治療: Number(value || 0) } }))} type="number" />
                <InputField label="RI定員" value={settings.capacity.RI ?? 1} onChange={(value) => setSettings((prev) => ({ ...prev, capacity: { ...prev.capacity, RI: Number(value || 0) } }))} type="number" />
                <InputField label="受付定員" value={settings.capacity.受付 ?? 2} onChange={(value) => setSettings((prev) => ({ ...prev, capacity: { ...prev.capacity, 受付: Number(value || 0) } }))} type="number" />
                <InputField label="昼当番人数" value={settings.lunchBaseCount} onChange={(value) => setSettings((prev) => ({ ...prev, lunchBaseCount: Number(value || 0) }))} type="number" />
                <TextAreaField label="サポート対象部屋" value={settings.supportTargetRooms} onChange={(value) => setSettings((prev) => ({ ...prev, supportTargetRooms: value }))} placeholder="1号室,2号室,5号室" />
                <TextAreaField label="昼当番優先セクション" value={settings.lunchPrioritySections} onChange={(value) => setSettings((prev) => ({ ...prev, lunchPrioritySections: value }))} placeholder="RI,1号室,2号室,CT" />
                <TextAreaField label="昼当番の最後の砦" value={settings.lunchLastResortSections} onChange={(value) => setSettings((prev) => ({ ...prev, lunchLastResortSections: value }))} placeholder="治療" />
                <TextAreaField label="半日禁止セクション" value={settings.fullDayOnlyRooms} onChange={(value) => setSettings((prev) => ({ ...prev, fullDayOnlyRooms: value }))} placeholder="DSA,検像,骨塩" />
              </div>
            </Panel>

            <Panel title="データ連携">
              <div className="space-y-3">
                <button className="w-full rounded-2xl bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white hover:bg-fuchsia-700" onClick={handleCopyJson}>JSON をコピー</button>
                <textarea
                  className="min-h-[180px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="貼り付けた JSON をここから復元"
                />
                <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800" onClick={handleImportText}>テキストから復元</button>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="月間担当">
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {MONTHLY_CATEGORIES.map((category) => (
                  <TextAreaField
                    key={category}
                    label={category}
                    value={monthlyAssign[category] || ""}
                    onChange={(value) => setMonthlyAssign((prev) => ({ ...prev, [category]: value }))}
                    placeholder="担当候補を列挙"
                  />
                ))}
              </div>
            </Panel>

            <Panel title="特殊ルール">
              <div className="grid gap-6 2xl:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-700">固定配置</div>
                  <RuleTable
                    rows={settings.fixed}
                    addLabel="固定配置を追加"
                    onAdd={() => setSettings((prev) => ({ ...prev, fixed: [...prev.fixed, { staff: "", section: "CT" }] }))}
                    columns={[
                      {
                        header: "スタッフ",
                        render: (row, index) => (
                          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.staff} onChange={(e) => setSettings((prev) => ({ ...prev, fixed: prev.fixed.map((item, i) => (i === index ? { ...item, staff: e.target.value } : item)) }))} />
                        ),
                      },
                      {
                        header: "配置先",
                        render: (row, index) => (
                          <select className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.section} onChange={(e) => setSettings((prev) => ({ ...prev, fixed: prev.fixed.map((item, i) => (i === index ? { ...item, section: e.target.value as Section } : item)) }))}>
                            {ROOM_SECTIONS.map((section) => (
                              <option key={section} value={section}>{section}</option>
                            ))}
                          </select>
                        ),
                      },
                      {
                        header: "",
                        render: (_row, index) => <button className="text-red-500" onClick={() => setSettings((prev) => ({ ...prev, fixed: prev.fixed.filter((_, i) => i !== index) }))}>削除</button>,
                      },
                    ]}
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-700">配置禁止</div>
                  <RuleTable
                    rows={settings.forbidden}
                    addLabel="禁止ルールを追加"
                    onAdd={() => setSettings((prev) => ({ ...prev, forbidden: [...prev.forbidden, { staff: "", sections: "" }] }))}
                    columns={[
                      {
                        header: "スタッフ",
                        render: (row, index) => (
                          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.staff} onChange={(e) => setSettings((prev) => ({ ...prev, forbidden: prev.forbidden.map((item, i) => (i === index ? { ...item, staff: e.target.value } : item)) }))} />
                        ),
                      },
                      {
                        header: "禁止セクション",
                        render: (row, index) => (
                          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.sections} onChange={(e) => setSettings((prev) => ({ ...prev, forbidden: prev.forbidden.map((item, i) => (i === index ? { ...item, sections: e.target.value } : item)) }))} placeholder="CT, MRI" />
                        ),
                      },
                      {
                        header: "",
                        render: (_row, index) => <button className="text-red-500" onClick={() => setSettings((prev) => ({ ...prev, forbidden: prev.forbidden.filter((_, i) => i !== index) }))}>削除</button>,
                      },
                    ]}
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-700">NG ペア</div>
                  <RuleTable
                    rows={settings.ngPairs}
                    addLabel="NG ペアを追加"
                    onAdd={() => setSettings((prev) => ({ ...prev, ngPairs: [...prev.ngPairs, { s1: "", s2: "", level: "hard" }] }))}
                    columns={[
                      {
                        header: "スタッフ1",
                        render: (row, index) => (
                          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.s1} onChange={(e) => setSettings((prev) => ({ ...prev, ngPairs: prev.ngPairs.map((item, i) => (i === index ? { ...item, s1: e.target.value } : item)) }))} />
                        ),
                      },
                      {
                        header: "スタッフ2",
                        render: (row, index) => (
                          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.s2} onChange={(e) => setSettings((prev) => ({ ...prev, ngPairs: prev.ngPairs.map((item, i) => (i === index ? { ...item, s2: e.target.value } : item)) }))} />
                        ),
                      },
                      {
                        header: "レベル",
                        render: (row, index) => (
                          <select className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.level} onChange={(e) => setSettings((prev) => ({ ...prev, ngPairs: prev.ngPairs.map((item, i) => (i === index ? { ...item, level: e.target.value as "hard" | "soft" } : item)) }))}>
                            <option value="hard">hard</option>
                            <option value="soft">soft</option>
                          </select>
                        ),
                      },
                      {
                        header: "",
                        render: (_row, index) => <button className="text-red-500" onClick={() => setSettings((prev) => ({ ...prev, ngPairs: prev.ngPairs.filter((_, i) => i !== index) }))}>削除</button>,
                      },
                    ]}
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-700">遅番</div>
                  <RuleTable
                    rows={settings.lateShifts}
                    addLabel="遅番ルールを追加"
                    onAdd={() => setSettings((prev) => ({ ...prev, lateShifts: [...prev.lateShifts, { section: "CT", lateTime: "(17:00〜19:00)", defaultTime: "" }] }))}
                    columns={[
                      {
                        header: "セクション",
                        render: (row, index) => (
                          <select className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.section} onChange={(e) => setSettings((prev) => ({ ...prev, lateShifts: prev.lateShifts.map((item, i) => (i === index ? { ...item, section: e.target.value as Section } : item)) }))}>
                            {WORK_SECTIONS.map((section) => <option key={section} value={section}>{section}</option>)}
                          </select>
                        ),
                      },
                      {
                        header: "遅番タグ",
                        render: (row, index) => (
                          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.lateTime} onChange={(e) => setSettings((prev) => ({ ...prev, lateShifts: prev.lateShifts.map((item, i) => (i === index ? { ...item, lateTime: e.target.value } : item)) }))} />
                        ),
                      },
                      {
                        header: "通常タグ",
                        render: (row, index) => (
                          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" value={row.defaultTime} onChange={(e) => setSettings((prev) => ({ ...prev, lateShifts: prev.lateShifts.map((item, i) => (i === index ? { ...item, defaultTime: e.target.value } : item)) }))} />
                        ),
                      },
                      {
                        header: "",
                        render: (_row, index) => <button className="text-red-500" onClick={() => setSettings((prev) => ({ ...prev, lateShifts: prev.lateShifts.filter((_, i) => i !== index) }))}>削除</button>,
                      },
                    ]}
                  />
                </div>
              </div>
            </Panel>

            <Panel title="週間編集" right={<div className="text-sm font-medium text-slate-500">{currentDay?.holidayName ? `${currentDay.holidayName}` : "通常日"}</div>}>
              <div className="mb-4 flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.id}
                    className={mergeClasses(
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      day.id === currentDay.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                      day.isHoliday && day.id !== currentDay.id ? "ring-1 ring-rose-200 text-rose-700" : "",
                    )}
                    onClick={() => setSelectedDayId(day.id)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>

              {currentDay.isHoliday ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
                  この日は {currentDay.holidayName} です。自動割付では空欄になります。
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                  {SECTIONS.map((section) => (
                    <SectionEditor
                      key={section}
                      section={section}
                      value={currentCells[section]}
                      onChange={(value) => updateDayCell(currentDay.id, section, value)}
                      availableStaff={availableStaffForSection(section, currentCells, ctx)}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="警告・注意">
              <div className="space-y-2">
                {warnings.length === 0 ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">目立つ警告はありません。</div> : null}
                {warnings.map((warning, index) => (
                  <div
                    key={`${warning.message}-${index}`}
                    className={mergeClasses(
                      "rounded-2xl px-4 py-3 text-sm font-semibold",
                      warning.type === "error" && "bg-rose-50 text-rose-800",
                      warning.type === "alert" && "bg-amber-50 text-amber-800",
                      warning.type === "info" && "bg-sky-50 text-sky-800",
                    )}
                  >
                    {warning.message}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="週間集計">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">スタッフ</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">総数</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">CT</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">MRI</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">ポータブル</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">6号</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">11号</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {weeklyStats.map(([name, stats]) => (
                      <tr key={name}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{name}</td>
                        <td className="px-4 py-3">{stats.total}</td>
                        <td className="px-4 py-3">{stats.ct}</td>
                        <td className="px-4 py-3">{stats.mri}</td>
                        <td className="px-4 py-3">{stats.portable}</td>
                        <td className="px-4 py-3">{stats.room6}</td>
                        <td className="px-4 py-3">{stats.room11}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
