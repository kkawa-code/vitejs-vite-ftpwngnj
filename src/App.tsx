import React, { useEffect, useMemo, useState, useRef } from "react";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  html, body, #root { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
  body { background: #f4f7f9; color: #334155; -webkit-print-color-adjust: exact; font-family: 'Inter', sans-serif; letter-spacing: 0.02em; font-size: 16px; overflow-x: hidden; }
  * { box-sizing: border-box; }
  textarea, select, button, input { font: inherit; }
  textarea:focus, select:focus, input:focus { outline: 3px solid #3b82f6; outline-offset: -1px; border-color: transparent !important; }
  select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 8px center; background-size: 1.2em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; padding-right: 32px !important; }
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
  .rule-sel, .rule-num { padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 15px; }
  .rule-del { border: none; background: none; color: #ef4444; cursor: pointer; font-size: 20px; padding: 0 8px; transition: 0.2s; }
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
  .modal-title { margin: 0; font-size: 22px; color: #0f172a; font-weight: 800; }
  .close-btn { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; transition: 0.2s; }
  .close-btn:hover { background: #e2e8f0; }
  @media print { body { background: #fff; } .no-print { display: none !important; } .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; } table { width: 100% !important; border-collapse: collapse !important; table-layout: auto; } th, td { border: 1px solid #000 !important; padding: 6px !important; font-size: 11pt !important; color: #000 !important; position: static !important; } }
`;
const globalStyle = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');html,body,#root{max-width:100%!important;width:100%!important;margin:0!important;padding:0!important;}body{background:#f4f7f9;color:#334155;-webkit-print-color-adjust:exact;font-family:'Inter',sans-serif;letter-spacing:0.02em;font-size:16px;overflow-x:hidden;}*{box-sizing:border-box;}textarea,select,button,input{font:inherit;}textarea:focus,select:focus,input:focus{outline:3px solid #3b82f6;outline-offset:-1px;border-color:transparent!important;}select{appearance:none;background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right 8px center;background-size:1.2em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;padding-right:32px!important;}details>summary{list-style:none;cursor:pointer;transition:color 0.2s;outline:none;}details>summary:hover{color:#0d9488;}details>summary::-webkit-details-marker{display:none;}.scroll-container{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;border-radius:8px;border:1px solid #e2e8f0;background:#fff;}.sticky-table-header th{position:sticky;top:0;z-index:20;background:#f8fafc;box-shadow:0 2px 4px -1px rgba(0,0,0,0.05);}.sticky-header-panel{position:sticky;top:0;z-index:30;background:rgba(255,255,255,0.95);backdrop-filter:blur(4px);padding-top:16px;margin-top:-16px;box-shadow:0 4px 6px -4px rgba(0,0,0,0.1);}.calendar-row{transition:background-color 0.2s;cursor:pointer;}.calendar-row:hover{background-color:#f1f5f9!important;}.btn-hover{transition:all 0.2s;cursor:pointer;}.btn-hover:hover{transform:translateY(-1px);filter:brightness(1.05);box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)!important;}.card-hover{transition:box-shadow 0.2s,transform 0.2s;cursor:pointer;}.card-hover:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06);}.rule-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center;width:100%;}.rule-sel,.rule-num{padding:8px 12px;border-radius:6px;border:1px solid #cbd5e1;font-weight:600;font-size:15px;}.rule-del{border:none;background:none;color:#ef4444;cursor:pointer;font-size:24px;padding:0 8px;transition:0.2s;}.rule-del:hover{background:#fee2e2;border-radius:6px;}.rule-add{background:#fff;color:#4f46e5;border:2px dashed #a5b4fc;padding:10px 16px;font-size:16px;width:100%;display:flex;justify-content:center;font-weight:bold;border-radius:8px;cursor:pointer;margin-top:12px;transition:0.2s;}.rule-add:hover{background:#e0e7ff;border-color:#4f46e5;}.rule-label{font-size:15px;font-weight:700;color:#64748b;flex-shrink:0;}.tab-btn{background:none;border:none;padding:12px 20px;font-size:17px;font-weight:800;color:#64748b;cursor:pointer;border-bottom:3px solid transparent;transition:0.2s;}.tab-btn:hover{color:#3b82f6;}.tab-btn.active{color:#2563eb;border-bottom-color:#2563eb;}.name-textarea{width:100%;height:120px;padding:12px;font-size:15px;border-radius:8px;border:1px solid #cbd5e1;font-weight:600;line-height:1.5;}.modal-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);}.modal-content{background:#fff;padding:32px;border-radius:16px;width:100%;max-width:600px;max-height:85vh;overflow-y:auto;}.modal-wide{max-width:1000px;}.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e2e8f0;}.modal-title{margin:0;font-size:24px;color:#0f172a;font-weight:800;}.close-btn{background:#f1f5f9;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;color:#64748b;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;transition:0.2s;}.close-btn:hover{background:#e2e8f0;}@media print{body{background:#fff;}.no-print{display:none!important;}.print-area{box-shadow:none!important;border:none!important;padding:0!important;margin:0!important;width:100%!important;}table{width:100%!important;border-collapse:collapse!important;table-layout:auto;}th,td{border:1px solid #000!important;padding:6px!important;font-size:11pt!important;color:#000!important;position:static!important;}}`;

type RenderGroup = { title: string; color: string; sections: string[] };
type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string>; logInfo?: string[] };
@@ -85,6 +49,7 @@ function getStaffAmount(name: string) { if (ROLE_PLACEHOLDERS.includes(extractSt
const btnStyle = (bg: string, color: string = "#fff", fontSize: number = 15): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize, whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 6 });
const panelStyle = (): React.CSSProperties => ({ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)", width: "100%", boxSizing: "border-box" });
const cellStyle = (isHeader = false, isHoliday = false, isSelected = false, isSticky = false, isZebra = false): React.CSSProperties => { let bg = isHeader ? "#f8fafc" : (isZebra ? "#f8fafc" : "#fff"); if (isHoliday) bg = isHeader ? "#f1f5f9" : "#fff1f2"; else if (isSelected) bg = isHeader ? "#eff6ff" : (isZebra ? "#e0f2fe" : "#f0f9ff"); return { border: "1px solid #e2e8f0", padding: "10px 12px", background: bg, fontWeight: isHeader ? 800 : 700, textAlign: isHeader ? "center" : "left", fontSize: isHeader ? 16 : 15, color: isHoliday && isHeader ? "#ef4444" : "inherit", verticalAlign: "middle", position: isSticky ? "sticky" : "static", left: isSticky ? 0 : "auto", zIndex: isSticky ? 10 : 1, transition: "background-color 0.2s" }; };

const RENDER_GROUPS: RenderGroup[] = [ { title: "休務・夜勤", color: "#94a3b8", sections: ["明け","入り","土日休日代休","不在"] }, { title: "モダリティ", color: "#3b82f6", sections: ["CT","MRI","RI","治療"] }, { title: "一般撮影・透視・その他", color: "#10b981", sections: ["MMG","1号室","2号室","3号室","5号室","透視（6号）","透視（11号）","骨塩","パノラマCT","ポータブル","DSA","透析後胸部","検像","受付","受付ヘルプ","昼当番"] }, { title: "待機・その他", color: "#f59e0b", sections: ["待機"] } ];

const Modal = ({ title, onClose, wide, children }: any) => ( <div className="modal-overlay" onClick={onClose}><div className={`modal-content modal-animate ${wide ? 'modal-wide' : ''}`} onClick={e => e.stopPropagation()}><div className="modal-header"><h3 className="modal-title">{title}</h3><button onClick={onClose} className="close-btn">✖</button></div>{children}<div style={{ textAlign: "center", marginTop: 32 }}><button className="btn-hover" onClick={onClose} style={{ ...btnStyle("#2563eb", "#fff", 16), width: "100%", justifyContent: "center", padding: "16px" }}>閉じる</button></div></div></div> );
@@ -106,6 +71,7 @@ class AutoAssigner {
getPastRoomCount(staff: string, room: string) { const isMonthlyTarget = ["CT", "MRI"].includes(room); const targetPastDays = isMonthlyTarget ? this.pastDaysInMonth : this.pastDaysInWeek; return targetPastDays.filter(pd => split(pd.cells[room] || "").map(extractStaffName).includes(staff)).length; }
getPastLateShiftCount(staff: string) { let count = 0; this.pastDaysInMonth.forEach(pd => { Object.values(pd.cells).forEach(val => { split(val as string).forEach(m => { if (extractStaffName(m) === staff && (m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:"))) count++; }); }); }); return count; }
getTodayRoomCount(staff: string) { let count = 0; Object.keys(this.dayCells).forEach(sec => { if (REST_SECTIONS.includes(sec) || ["待機", "昼当番", "受付", "受付ヘルプ"].includes(sec)) return; split(this.dayCells[sec]).forEach(m => { if (extractStaffName(m) === staff && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:")) count++; }); }); return count; }
  getStaffTimeCounts(staff: string) { let am = 0; let pm = 0; Object.keys(this.dayCells).forEach(sec => { if (["待機","昼当番","受付","受付ヘルプ"].includes(sec) || REST_SECTIONS.includes(sec)) return; split(this.dayCells[sec]).forEach(m => { if (extractStaffName(m) === staff) { if (m.includes("(AM)")) am++; else if (m.includes("(PM)")) pm++; else { am++; pm++; } } }); }); return { am, pm }; }
private isHalfDayBlockedForFullDayRoom(staff: string, section: string): { hard: boolean; monthlyHalfException: boolean } { const fullDayOnlyList = split(this.ctx.customRules.fullDayOnlyRooms ?? ""); if (!fullDayOnlyList.includes(section)) return { hard: false, monthlyHalfException: false }; const fuzaiMems = split(this.dayCells["不在"]); const isFuzaiAm = fuzaiMems.some(m => extractStaffName(m) === staff && m.includes("(AM)")); const isFuzaiPm = fuzaiMems.some(m => extractStaffName(m) === staff && m.includes("(PM)")); if (!isFuzaiAm && !isFuzaiPm) return { hard: false, monthlyHalfException: false }; const monthly = isMonthlyMainStaff(section, staff, this.ctx.monthlyAssign); if (!monthly) return { hard: true, monthlyHalfException: false }; return { hard: false, monthlyHalfException: true }; }
private isHardNoConsecutive(staff: string, room: string): boolean { const noCRooms = split(this.ctx.customRules.noConsecutiveRooms || ""); if (!this.prevDay || !noCRooms.includes(room)) return false; const prev = split(this.prevDay.cells[room] || "").map(extractStaffName); return prev.includes(staff); }
private getRoomDependencyCount(room: string): number { let score = 0; (this.ctx.customRules.linkedRooms || []).forEach((r: any) => { if (split(r.sources || "").some((s: string) => parseRoomCond(s).r === room)) score += 3; if (r.target === room) score += 1; }); (this.ctx.customRules.rescueRules || []).forEach((r: any) => { if (split(r.sourceRooms || "").some((s: string) => parseRoomCond(s).r === room)) score += 2; if (r.targetRoom === room) score += 1; }); (this.ctx.customRules.swapRules || []).forEach((r: any) => { if (split(r.sourceRooms || "").some((s: string) => parseRoomCond(s).r === room)) score += 2; if (r.triggerRoom === room) score += 1; if (r.targetRoom === room) score += 1; }); (this.ctx.customRules.kenmuPairs || []).forEach((p: any) => { if (p.s1 === room || p.s2 === room) score += 2; }); return score; }
@@ -115,6 +81,7 @@ class AutoAssigner {
isMmgCapable(staff: string): boolean { return split(this.ctx.monthlyAssign.MMG || "").map(extractStaffName).includes(extractStaffName(staff)); }
getEffectiveTarget(room: string, baseCap: number) { const dayChar = this.day.label.match(/\((.*?)\)/)?.[1]; if (!dayChar) return { cap: baseCap, amClosed: false, pmClosed: false, allClosed: false }; const closed = (this.ctx.customRules.closedRooms || []).filter((r: any) => r.room === room && r.day === dayChar); let amClosed = false; let pmClosed = false; let allClosed = false; closed.forEach((r: any) => { if (r.time === "全日") allClosed = true; else if (r.time === "(AM)") amClosed = true; else if (r.time === "(PM)") pmClosed = true; }); if (amClosed && pmClosed) allClosed = true; if (allClosed) return { cap: 0, amClosed: true, pmClosed: true, allClosed: true }; if (amClosed || pmClosed) return { cap: baseCap / 2, amClosed, pmClosed, allClosed: false }; return { cap: baseCap, amClosed: false, pmClosed: false, allClosed: false }; }
constructor(day: DayData, prevDay: DayData | null, pastDaysInMonth: DayData[], pastDaysInWeek: DayData[], ctx: AutoAssignContext, isSmartFix: boolean = false) { this.day = { ...day }; this.prevDay = prevDay; this.pastDaysInMonth = pastDaysInMonth; this.pastDaysInWeek = pastDaysInWeek; this.ctx = ctx; this.dayCells = { ...day.cells }; this.dynamicCapacity = { ...(ctx.customRules.capacity || {}) }; this.isSmartFix = isSmartFix; }
  
execute(): DayData {
this.logPhase("フェーズ1：前提処理"); this.initCounts();
if (this.prevDay?.cells["入り"]) { const iriMembers = split(this.prevDay.cells["入り"]).map(extractStaffName); this.dayCells["明け"] = join(Array.from(new Set([...split(this.dayCells["明け"]), ...iriMembers]))); if (iriMembers.length > 0) this.log(`[前日処理] 昨日の「入り」を「明け」に配置`); }
@@ -312,8 +279,9 @@ class AutoAssigner {
let current = split(this.dayCells[rule.section]); if (current.length > 0 && !current.some(m => m.includes("17:") || m.includes("18:"))) { const currentCore = current.map(extractStaffName); const prevLateStaff = this.prevDay ? split(this.prevDay.cells[rule.section] || "").filter((m: string) => m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")).map(extractStaffName) : []; const excludeStaff = Array.from(new Set([...split(this.ctx.customRules.noLateShiftStaff || "").map(extractStaffName), ...split(this.ctx.customRules.noLateShiftRooms || "").flatMap(r => split(this.dayCells[r] || "").map(extractStaffName))])); const fuzaiMems = split(this.dayCells["不在"]); const candidates = this.initialAvailGeneral.filter(n => !currentCore.includes(n) && !this.isForbidden(n, rule.section) && !excludeStaff.includes(n) && !fuzaiMems.some(m => extractStaffName(m) === n)); candidates.sort((a, b) => { let sA = this.getPastLateShiftCount(a) * 100; let sB = this.getPastLateShiftCount(b) * 100; const idxA = lowPriorityStaff.indexOf(a); const idxB = lowPriorityStaff.indexOf(b); if (idxA !== -1) sA += 100000 + ((lowPriorityStaff.length - idxA) * 10000); if (idxB !== -1) sB += 100000 + ((lowPriorityStaff.length - idxB) * 10000); if (sA !== sB) return sA - sB; return a.localeCompare(b, 'ja'); }); let picked = candidates.find(n => !prevLateStaff.includes(n)); if (!picked && candidates.length > 0) picked = candidates[0]; if (picked) { current.push(`${picked}${rule.lateTime}`); this.blockMap.set(picked, this.blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); this.dayCells[rule.section] = join(current); } }
});

    const portableMembers = split(this.dayCells["ポータブル"]);
    const room2Members = split(this.dayCells["2号室"]);
    // ★修正：ポータブル特例（AM/PMの正確な時間判定）
    const portableMembers = split(this.dayCells["ポータブル"]); 
    const room2Members = split(this.dayCells["2号室"]); 
const room2Cores = room2Members.map(extractStaffName);
const room2ActualAmt = room2Members.reduce((sum, m) => sum + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);

@@ -335,7 +303,6 @@ class AutoAssigner {
if (ex.some(r=>split(this.dayCells[r]).map(extractStaffName).includes(s))) return false;
return true;
});

if (needAmHelp) {
let p = findCand(true, ["1号室", "5号室"]) ?? findCand(true, []);
if(p){ this.dayCells["2号室"]=join([...split(this.dayCells["2号室"]),`${p}(AM)`]); this.addU(p,0.5); this.blockMap.set(p, this.blockMap.get(p)==='PM'?'ALL':'AM'); this.log(`🤝 [ポータブル特例] 2号室のポータブル兼務(AM)のため ${p} を追加`); }
@@ -356,7 +323,17 @@ class AutoAssigner {
for (const room of deKenmuTargets) {
if (this.skipSections.includes(room) || this.isForbidden(staff, room) || (room === "MMG" && !this.isMmgCapable(staff))) continue; if (tag !== "" && this.isHalfDayBlockedForFullDayRoom(staff, room).hard) continue; const effD = this.getEffectiveTarget(room, 1); if (effD.allClosed || (tag === "(PM)" && effD.pmClosed) || (tag === "(AM)" && effD.amClosed)) continue;
let currentMems = split(this.dayCells[room]);
        const repIdx = currentMems.findIndex(m => { const core = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(core) || this.getTodayRoomCount(core) <= 1 || this.hasNGPair(staff, currentMems.filter(x=>x!==m).map(extractStaffName), false)) return false; let cAm = m.includes("(AM)"); let cPm = m.includes("(PM)"); if(!cAm && !cPm){cAm=true;cPm=true;} let nAm = tag==="(AM)"; let nPm = tag==="(PM)"; if(!nAm && !nPm){nAm=true;nPm=true;} if (cAm && !nAm) return false; if (cPm && !nPm) return false; return true; });
        const repIdx = currentMems.findIndex(m => { 
          const core = extractStaffName(m); 
          if (ROLE_PLACEHOLDERS.includes(core) || this.hasNGPair(staff, currentMems.filter(x=>x!==m).map(extractStaffName), false)) return false; 
          // ★修正：AM/PMの正確な時間カウントを使って「本当に忙しい時間帯だけ」助ける
          const coreCounts = this.getStaffTimeCounts(core);
          if (tag === "(AM)" && coreCounts.am <= 1) return false;
          if (tag === "(PM)" && coreCounts.pm <= 1) return false;
          if (tag === "" && coreCounts.am <= 1 && coreCounts.pm <= 1) return false;
          
          let cAm = m.includes("(AM)"); let cPm = m.includes("(PM)"); if(!cAm && !cPm){cAm=true;cPm=true;} let nAm = tag==="(AM)"; let nPm = tag==="(PM)"; if(!nAm && !nPm){nAm=true;nPm=true;} if (cAm && !nAm) return false; if (cPm && !nPm) return false; return true; 
        });
if (repIdx !== -1) {
const oldStr = currentMems[repIdx]; const oldCore = extractStaffName(oldStr); currentMems[repIdx] = `${staff}${oldStr.includes("(AM)") ? "(AM)" : oldStr.includes("(PM)") ? "(PM)" : tag}`; this.dayCells[room] = join(currentMems); this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL'); this.assignCounts[oldCore] = Math.max(0, (this.assignCounts[oldCore] || 1) - getStaffAmount(oldStr)); let am = false; let pm = false; ROOM_SECTIONS.forEach(r => { if (r === "待機" || r === "昼当番" || r === "受付" || r === "受付ヘルプ") return; split(this.dayCells[r]).forEach(m => { if (extractStaffName(m) === oldCore) { if (m.includes("(AM)")) am = true; else if (m.includes("(PM)")) pm = true; else { am = true; pm = true; } } }); }); if (am && pm) this.blockMap.set(oldCore, 'ALL'); else if (am) this.blockMap.set(oldCore, 'AM'); else if (pm) this.blockMap.set(oldCore, 'PM'); else this.blockMap.set(oldCore, 'NONE'); this.log(`🪄 [兼務解消] ${staff} を専任化し ${oldCore} の負担軽減`); assigned = true; break;
}
@@ -400,6 +377,8 @@ export default function App(): any {
const [monthlyAssign, setMonthlyAssign] = useState<Record<string, string>>(() => { try { return { ...DEFAULT_MONTHLY_ASSIGN, ...JSON.parse(localStorage.getItem(KEY_MONTHLY) || "{}") }; } catch { return DEFAULT_MONTHLY_ASSIGN; } });
const [targetMonday, setTargetMonday] = useState(() => { const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff)); return `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`; });
const [sel, setSel] = useState(""); const [assignLogs, setAssignLogs] = useState<Record<string, string[]>>({}); const [selectedErrorDay, setSelectedErrorDay] = useState<string | null>(null); const [showLogDay, setShowLogDay] = useState<string | null>(null); const [showUnassignedList, setShowUnassignedList] = useState<string | null>(null); const [selectedStaffForStats, setSelectedStaffForStats] = useState<string | null>(null); const [showRuleModal, setShowRuleModal] = useState(false); const [history, setHistory] = useState<Record<string, Record<string, string>>[]>([]); const fileInputRef = useRef<HTMLInputElement>(null); const [importText, setImportText] = useState(""); const [nationalHolidays, setNationalHolidays] = useState<Record<string, string>>(FALLBACK_HOLIDAYS);
  // ★ 新機能：ハイライトするスタッフの状態
  const [highlightedStaff, setHighlightedStaff] = useState<string | null>(null);

useEffect(() => { fetch("https://holidays-jp.github.io/api/v1/date.json").then(res => res.json()).then(data => setNationalHolidays(prev => ({ ...prev, ...data }))).catch(e => console.error(e)); }, []);
useEffect(() => { localStorage.setItem(KEY_ALL_DAYS, JSON.stringify(allDays)); localStorage.setItem(KEY_RULES, JSON.stringify(customRules)); localStorage.setItem(KEY_MONTHLY, JSON.stringify(monthlyAssign)); }, [allDays, customRules, monthlyAssign]);
@@ -453,7 +432,7 @@ export default function App(): any {
const handleCopyToClipboard = () => { const dataObj = { allDays, monthlyAssign, customRules }; navigator.clipboard.writeText(JSON.stringify(dataObj)).then(() => { alert("データをコピーしました！"); }).catch(() => { alert("コピーに失敗しました。"); }); };
const handleTextImport = () => { if(!importText) return; try { const dataObj = JSON.parse(importText); if (dataObj.allDays && dataObj.monthlyAssign && dataObj.customRules) { setAllDaysWithHistory(dataObj.allDays); setMonthlyAssign(dataObj.monthlyAssign); setCustomRules(dataObj.customRules); alert("テキストからデータを復元しました！"); setImportText(""); } else { alert("正しいデータ形式ではありません。"); } } catch (err) { alert("テキストの読み込みに失敗しました。"); } };

  // 兼務数の事前計算（カレンダー描画用）
  // カレンダー描画用の兼務数事前計算
const dailyStaffRoomCounts = useMemo(() => {
const counts: Record<string, Record<string, number>> = {};
days.forEach(day => {
@@ -479,6 +458,12 @@ export default function App(): any {
<div className="no-print" style={{ ...panelStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "20px 32px", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
<h2 style={{ margin: 0, color: "#0f172a", fontSize: 26, fontWeight: 900 }}>勤務割付システム Ver 2.85</h2>
<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {highlightedStaff && (
            <div style={{ background: "#2563eb", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px rgba(37,99,235,0.3)", animation: "fadeIn 0.3s ease" }}>
              <span>✨ {highlightedStaff} さんをハイライト中</span>
              <button onClick={() => setHighlightedStaff(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "18px", padding: 0 }}>✖</button>
            </div>
          )}
<button className="btn-hover" onClick={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()-7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={{...btnStyle("#f1f5f9", "#475569"), border:"1px solid #cbd5e1"}}>◀ 先週</button>
<WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
<button className="btn-hover" onClick={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={{...btnStyle("#f1f5f9", "#475569"), border:"1px solid #cbd5e1"}}>来週 ▶</button>
@@ -491,7 +476,9 @@ export default function App(): any {
<button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>⚙️ 設定・データ入出力</button>
</div>

      {/* ===================== カレンダー タブ ===================== */}
<div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>

<div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "16px" }}>
<div className="scroll-container">
<table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
@@ -534,17 +521,34 @@ export default function App(): any {
{currentMems.map((m, mIdx) => {
const coreName = extractStaffName(m); const mod = m.substring(coreName.length); const isConsecutive = isAlertRoom && prevMems.includes(coreName); const hasRedWarning = isConsecutive || warnings.some(w => w.level === 'red' && w.staff === coreName && w.room === section); const hasOrangeWarning = warnings.some(w => w.level === 'orange' && w.staff === coreName); const hasYellowWarning = warnings.some(w => w.level === 'yellow' && w.room === section && w.title === '回避特例');

                                // ★ 新機能：ハイライト処理と兼務色分け
                                const isHighlighted = highlightedStaff === coreName;
                                const isDimmed = highlightedStaff !== null && highlightedStaff !== coreName;
const roomCount = dailyStaffRoomCounts[day.id]?.[coreName] || 0;
                                
let tagBg = "#f1f5f9"; let tagColor = "#334155"; let tagBorder = "#cbd5e1";

if (roomCount === 2) { tagBg = "#fef08a"; tagColor = "#854d0e"; tagBorder = "#fde047"; }
else if (roomCount >= 3) { tagBg = "#ffedd5"; tagColor = "#9a3412"; tagBorder = "#fdba74"; }

if (hasRedWarning) { tagBg = "#fee2e2"; tagColor = "#b91c1c"; tagBorder = "#ef4444"; }
else if (hasOrangeWarning) { tagBorder = "#ea580c"; }
                                else if (hasYellowWarning) { tagBorder = "#eab308"; }
                                else if (hasYellowWarning) { tagBorder = "#ca8a04"; }

                                return ( <div key={mIdx} style={{ background: tagBg, color: tagColor, border: `2px solid ${tagBorder}`, padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", fontSize: "16px", fontWeight: hasRedWarning ? 800 : 700 }}><span>{coreName}</span>{mod && (mod.includes("(AM)") ? <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #bae6fd", fontWeight: 800 }}>AM</span> : mod.includes("(PM)") ? <span style={{ background: "#fce7f3", color: "#be185d", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #fbcfe8", fontWeight: 800 }}>PM</span> : <span style={{ background: "#f3f4f6", color: "#4b5563", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #d1d5db", fontWeight: 700 }}>{mod.replace(/[()]/g, '')}</span>)}</div> );
                                let inlineStyle: React.CSSProperties = { background: tagBg, color: tagColor, border: `2px solid ${tagBorder}`, padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", fontSize: "16px", fontWeight: hasRedWarning ? 800 : 700, transition: "all 0.2s ease" };
                                
                                if (isHighlighted) {
                                  inlineStyle.background = "#2563eb"; inlineStyle.color = "#fff"; inlineStyle.borderColor = "#1d4ed8"; inlineStyle.boxShadow = "0 4px 12px rgba(37,99,235,0.4)"; inlineStyle.transform = "scale(1.05)"; inlineStyle.zIndex = 10; inlineStyle.position = "relative";
                                } else if (isDimmed) {
                                  inlineStyle.opacity = 0.25; inlineStyle.filter = "grayscale(1)";
                                }

                                return (
                                  <div key={mIdx} className="btn-hover" onClick={(e) => { e.stopPropagation(); setHighlightedStaff(prev => prev === coreName ? null : coreName); }} style={inlineStyle}>
                                    <span>{coreName}</span>
                                    {mod && (mod.includes("(AM)") ? <span style={{ background: isHighlighted ? "#bfdbfe" : "#e0f2fe", color: isHighlighted ? "#1e40af" : "#0369a1", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #bae6fd", fontWeight: 800 }}>AM</span> : mod.includes("(PM)") ? <span style={{ background: isHighlighted ? "#fbcfe8" : "#fce7f3", color: isHighlighted ? "#9f1239" : "#be185d", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #fbcfe8", fontWeight: 800 }}>PM</span> : <span style={{ background: isHighlighted ? "#e2e8f0" : "#f3f4f6", color: isHighlighted ? "#334155" : "#4b5563", fontSize: "13px", padding: "2px 4px", borderRadius: "4px", marginLeft: "4px", border: "1px solid #d1d5db", fontWeight: 700 }}>{mod.replace(/[()]/g, '')}</span>)}
                                  </div>
                                );
})}
</div>
)}
@@ -729,22 +733,22 @@ export default function App(): any {
<RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🕒" title="終日専任・連日禁止">
<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
<div style={{ flex: 1, minWidth: 260 }}>
                  <label style={{ fontSize: 16, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【終日専任】半休・AM/PM不可の部屋</label>
                  <label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【終日専任】半休・AM/PM不可の部屋</label>
<MultiPicker selected={customRules.fullDayOnlyRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, fullDayOnlyRooms: v})} options={ROOM_SECTIONS} />
</div>
<div style={{ flex: 1, minWidth: 260 }}>
                  <label style={{ fontSize: 16, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【連日禁止】2日連続で担当させない部屋</label>
                  <label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【連日禁止】2日連続で担当させない部屋</label>
<MultiPicker selected={customRules.noConsecutiveRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, noConsecutiveRooms: v})} options={ROOM_SECTIONS} />
</div>
</div>
</RuleCard>

<RuleCard bg="#fdf4ff" border="#f5d0fe" color="#86198f" icon="🏠" title="遅番不可スタッフ・部屋">
              <label style={{ fontSize: 16, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>遅番不可スタッフ</label>
              <label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>遅番不可スタッフ</label>
<div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center", marginBottom: 16 }}>
<MultiPicker selected={customRules.noLateShiftStaff || ""} onChange={(v: string) => setCustomRules({...customRules, noLateShiftStaff: v})} options={allStaff} placeholder="＋スタッフを選択" />
</div>
              <label style={{ fontSize: 16, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>その日その部屋に入っている人も遅番除外</label>
              <label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>その日その部屋に入っている人も遅番除外</label>
<div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center" }}>
<MultiPicker selected={customRules.noLateShiftRooms || ""} onChange={(v: string) => setCustomRules({...customRules, noLateShiftRooms: v})} options={ROOM_SECTIONS} placeholder="＋部屋を選択" />
</div>
