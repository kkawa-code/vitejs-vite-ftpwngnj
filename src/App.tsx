// ----------------- 👇 後半コード ここから 👇 -----------------
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
  
  // ★修正：受付・受付ヘルプを「未配置」から正しく除外（配置済みとして扱う）
  const getDailyStats = (dayId: string) => { 
    const cells = allDays[dayId] || {}; 
    const absentMems = split(cells["不在"] || "");
    const workingStaff = allStaff.filter(s => { 
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

  // カレンダー描画用の兼務数事前計算
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
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 26, fontWeight: 900 }}>勤務割付システム Ver 2.92</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(highlightedStaff || hoveredStaff) && (
            <div style={{ background: "#2563eb", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px rgba(37,99,235,0.3)", animation: "fadeIn 0.3s ease" }}>
              <span>✨ {highlightedStaff || hoveredStaff} さんをハイライト中</span>
              {highlightedStaff && <button onClick={() => setHighlightedStaff(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "18px", padding: 0 }}>✖</button>}
            </div>
          )}
          <Btn oC={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()-7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} bg="#f1f5f9" c="#475569" ch="◀ 先週" />
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <Btn oC={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} bg="#f1f5f9" c="#475569" ch="来週 ▶" />
        </div>
      </div>

      <div className="tabs-header no-print">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 週間予定表</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 月間集計</button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>⚙️ 設定・データ入出力</button>
      </div>

      {/* ===================== カレンダー タブ ===================== */}
      <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>

        <div className="print-area" style={{ ...panelStyle(), marginBottom: 32, padding: "16px" }}>
          <div className="scroll-container">
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
              <thead className="sticky-table-header">
                <tr>
                  <th style={{...cellStyle(true, false, false, true), borderRight: "2px solid #e2e8f0", borderBottom: "2px solid #e2e8f0"}}>区分</th>
                  {days.map(day => {
                    const stats = getDailyStats(day.id); const warnings = getDayWarnings(day.id);
                    return (
                      <th key={day.id} onClick={() => setSel(day.id)} style={{...cellStyle(true, day.isPublicHoliday, day.id === sel), borderBottom: "2px solid #e2e8f0", cursor: "pointer"}}>
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
                    <td style={{...cellStyle(true, false, false, true, sIdx % 2 === 1), borderRight: "2px solid #e2e8f0"}}>{section}</td>
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
                                const isOverLimit = roomCount > limit; // ★ 上限を超えたときだけ警告表示

                                let tagBg = "#f8fafc"; let tagColor = "#334155"; let tagBorder = "#cbd5e1";
                                
                                if (isOverLimit) { tagBg = "#ffedd5"; tagColor = "#9a3412"; tagBorder = "#fdba74"; }

                                if (hasRedWarning) { tagBg = "#fee2e2"; tagColor = "#b91c1c"; tagBorder = "#ef4444"; } 
                                else if (hasOrangeWarning) { tagBorder = "#ea580c"; } 
                                else if (hasYellowWarning) { tagBorder = "#ca8a04"; }

                                let inlineStyle: React.CSSProperties = { background: tagBg, color: tagColor, border: `2px solid ${tagBorder}`, padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", fontSize: "16px", fontWeight: (hasRedWarning || isOverLimit) ? 800 : 700, transition: "all 0.2s ease" };
                                
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
                <Btn oC={() => setShowRuleModal(true)} bg="#f8fafc" c="#475569" ch="📖 システムのルール" />
                <Btn oC={() => handleAutoAssign(false, false)} bg="#10b981" ch="✨ 1日自動割当" />
                <Btn oC={() => handleAutoAssign(false, true)} bg="#0ea5e9" ch="⚡ 週間自動割当" />
                <Btn oC={() => handleAutoAssign(true, false)} bg="#f59e0b" ch="🔄 欠員補充(1日)" />
                <Btn oC={() => handleAutoAssign(true, true)} bg="#d97706" ch="🔄 欠員補充(週間)" />
                <Btn oC={handleCopyYesterday} bg="#f8fafc" c="#475569" ch="📋 昨日をコピー" dis={cur.isPublicHoliday} />
                <Btn oC={handleUndo} bg={history.length === 0 ? "#cbd5e1" : "#8b5cf6"} ch="↩️ 戻る" dis={history.length===0} />
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
             {RENDER_GROUPS.map((group: RenderGroup) => (
               <div key={group.title} style={{ gridColumn: "1 / -1" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #e2e8f0" }}>
                   <h4 style={{ fontSize: 21, fontWeight: 900, borderLeft: `6px solid ${group.color}`, paddingLeft: 12, margin: 0 }}>{group.title}</h4>
                   {group.title === "休務・夜勤" || group.title === "待機・その他" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <Btn oC={() => handleClearGroupDay(group.title, group.sections)} bg="#fff" c="#64748b" ch="🧹 1日クリア" />
                        <Btn oC={() => handleClearGroupWeek(group.title, group.sections)} bg="#fff" c="#64748b" ch="🧹 週間クリア" />
                      </div>
                    ) : group.title === "モダリティ" || group.title === "一般撮影・透視・その他" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <Btn oC={handleClearWorkDay} bg="#fff" c="#64748b" ch="🧹 業務1日クリア" />
                        <Btn oC={handleClearWorkWeek} bg="#fff" c="#64748b" ch="🧹 業務週間クリア" />
                      </div>
                    ) : null}
                 </div>
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                   {group.sections.map((s: string) => <SectionEditor key={s} section={s} value={allDays[sel]?.[s] || ""} activeStaff={allStaff} onChange={(v: string) => updateDay(s, v)} noTime={REST_SECTIONS.includes(s) || s === "昼当番"} customOptions={ROLE_PLACEHOLDERS.filter(p => p.startsWith(s))} />)}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* ===================== 📊 マトリックス タブ ===================== */}
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

      {/* ===================== ⚙️ 設定 タブ ===================== */}
      <div className="no-print" style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 25, fontWeight: 900, marginBottom: 20, color: "#0f766e" }}>👥 スタッフ名簿</h3>
          <div style={{ background: "#f0fdf4", padding: "16px 20px", borderRadius: 12, border: "2px solid #bbf7d0", marginBottom: 24 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#166534", lineHeight: 1.6 }}>
              💡 順番を自動で「50音順」にするため、名前の後にカッコでふりがなをつけてください。<br/>
              （例： <span style={{ color: "#047857", fontWeight: 900, background: "#fff", padding: "2px 6px", borderRadius: "6px" }}>山田(やまだ)</span>、<span style={{ color: "#047857", fontWeight: 900, background: "#fff", padding: "2px 6px", borderRadius: "6px" }}>佐藤(さとう)</span> ）※カッコは半角・全角どちらでもOKです。
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
             <div>
               <label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>一般スタッフ</label>
               <textarea className="name-textarea" placeholder="例: 山田(やまだ)" value={customRules.staffList} onChange={e => setCustomRules({...customRules, staffList: e.target.value})} />
             </div>
             <div>
               <label style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, display: "block" }}>受付スタッフ</label>
               <textarea className="name-textarea" placeholder="例: 高橋(たかはし)" value={customRules.receptionStaffList} onChange={e => setCustomRules({...customRules, receptionStaffList: e.target.value})} />
             </div>
          </div>
        </div>

        <div style={{ ...panelStyle(), marginBottom: 32 }}>
          <h3 style={{ fontSize: 25, fontWeight: 900, marginBottom: 20, color: "#be185d" }}>📱 データ保存・復元</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
             <Btn oC={handleExport} bg="#6366f1" ch="💾 ファイル保存" />
             <Btn oC={() => fileInputRef.current?.click()} bg="#8b5cf6" ch="📂 ファイル読込" />
             <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleImport} />
             <div style={{ width: "2px", height: "32px", background: "#cbd5e1", margin: "0 8px" }}></div>
             <Btn oC={handleCopyToClipboard} bg="#db2777" ch="📋 テキストコピー" />
             <input type="text" value={importText} onChange={e => setImportText(e.target.value)} placeholder="貼り付けて復元" style={{ flex: 1, padding: "10px 16px", fontSize: 17, borderRadius: 8, border: "2px solid #f9a8d4" }} />
             <Btn oC={handleTextImport} bg="#be185d" ch="✨ 復元" />
          </div>
        </div>

        <div style={{ ...panelStyle() }}>
          <h3 style={{ fontSize: 27, fontWeight: 900, marginBottom: 32, color: "#0f766e" }}>📋 ルールの優先順位（システムはこの上から順に処理します）</h3>

          {/* ===================== フェーズ1 ===================== */}
          <div style={{ borderLeft: "8px solid #94a3b8", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 23, fontWeight: 900, color: "#475569", marginBottom: 20, borderBottom: "2px solid #cbd5e1", paddingBottom: 10 }}>フェーズ1：前提・固定ルール（最優先）</h4>
            
            <RC bg="#f8fafc" b="#cbd5e1" c="#334155" ic="🙅" t="担当不可ルール" ch={
              <>{(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                    <Row><StaffSel v={rule.staff} oC={(v:any)=>updateRule("forbidden", idx, "staff", v)} list={activeGeneralStaff} /><Del oC={()=>removeRule("forbidden", idx)} /></Row>
                    <MP v={rule.sections} oC={(v: string) => updateRule("forbidden", idx, "sections", v)} opt={ASSIGNABLE_SECTIONS} />
                  </div>
              ))}<button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button></>
            } />

            <RC bg="#f0fdf4" b="#bbf7d0" c="#15803d" ic="🔒" t="専従ルール" ch={
              <>{(customRules.fixed || []).map((rule: any, idx: number) => (
                  <Row key={idx}><StaffSel v={rule.staff} oC={(v:any)=>updateRule("fixed", idx, "staff", v)} list={activeGeneralStaff} /><RoomSel v={rule.section} oC={(v:any)=>updateRule("fixed", idx, "section", v)} list={ROOM_SECTIONS} /><Del oC={()=>removeRule("fixed", idx)} /></Row>
              ))}<button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button></>
            } />

            <RC bg="#fef2f2" b="#fecaca" c="#b91c1c" ic="🚫" t="NGペア" ch={
              <>{(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <Row key={idx}><StaffSel v={rule.s1} oC={(v:any)=>updateRule("ngPairs", idx, "s1", v)} list={activeGeneralStaff} /><span className="rule-label">と</span><StaffSel v={rule.s2} oC={(v:any)=>updateRule("ngPairs", idx, "s2", v)} list={activeGeneralStaff} /><select value={rule.level || "hard"} onChange={(e: any) => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"120px"}}><option value="hard">絶対NG</option><option value="soft">なるべくNG</option></select><Del oC={()=>removeRule("ngPairs", idx)} /></Row>
              ))}<button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ NGペアを追加</button></>
            } />

            <RC bg="#f8fafc" b="#cbd5e1" c="#334155" ic="🕒" t="終日専任・連日禁止" ch={
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【終日専任】半休・AM/PM不可の部屋</label><MP v={customRules.fullDayOnlyRooms ?? ""} oC={(v: string) => setCustomRules({...customRules, fullDayOnlyRooms: v})} opt={ROOM_SECTIONS} /></div>
                <div style={{ flex: 1, minWidth: 260 }}><label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【連日禁止】2日連続で担当させない部屋</label><MP v={customRules.noConsecutiveRooms ?? ""} oC={(v: string) => setCustomRules({...customRules, noConsecutiveRooms: v})} opt={ROOM_SECTIONS} /></div>
              </div>
            } />

            <RC bg="#fdf4ff" b="#f5d0fe" c="#86198f" ic="🏠" t="遅番不可スタッフ・部屋" ch={
              <><label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>遅番不可スタッフ</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center", marginBottom: 16 }}><MP v={customRules.noLateShiftStaff || ""} oC={(v: string) => setCustomRules({...customRules, noLateShiftStaff: v})} opt={allStaff} ph="＋スタッフを選択" /></div>
              <label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>その日その部屋に入っている人も遅番除外</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center" }}><MP v={customRules.noLateShiftRooms || ""} oC={(v: string) => setCustomRules({...customRules, noLateShiftRooms: v})} opt={ROOM_SECTIONS} ph="＋部屋を選択" /></div></>
            } />
          </div>

          {/* ===================== フェーズ2 ===================== */}
          <div style={{ borderLeft: "8px solid #f59e0b", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#b45309", marginBottom: 20, borderBottom: "2px solid #fcd34d", paddingBottom: 10 }}>フェーズ2：例外・代打処理</h4>
            
            <RC bg="#fef08a" b="#fde047" c="#a16207" ic="🚨" t="緊急ルール（人数不足時）" ch={
              <><div style={{ marginBottom: 16, padding: "12px", background: "#fef8f8", borderRadius: "8px", border: "1px dashed #fca5a5", color: "#991b1b", fontSize: "16px", fontWeight: "600" }}>💡 <b>「左側（発動条件）」から「右側（アクション）」へ</b> 流れるようにルールを設定します。</div>
              {(customRules.emergencies || []).map((em: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ flex: '1 1 350px', display: 'flex', gap: '8px', alignItems: 'center', borderRight: '2px dashed #cbd5e1', paddingRight: '16px' }}>
                      <span style={{fontWeight: 800, color: '#ef4444', flexShrink: 0}}>【条件】</span>
                      <select className="rule-sel" value={em.type} onChange={(e:any) => updateRule("emergencies", idx, "type", e.target.value)}>
                        <option value="change_capacity">出勤人数が指定以下の場合</option><option value="staff_assign">出勤人数が指定以下の場合（強制配置）</option><option value="role_assign">出勤人数が指定以下の場合（月間担当）</option><option value="clear">出勤人数が指定以下の場合（部屋閉鎖）</option><option value="empty_room_swap">指定の部屋が空室の場合</option>
                      </select>
                      {em.type !== 'empty_room_swap' && <><Num v={em.threshold || 0} oC={(v:any)=>updateRule("emergencies", idx, "threshold", v)} w={60} />人以下</>}
                      {em.type === 'empty_room_swap' && <><RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} ph="監視する部屋" /> が空室</>}
                    </div>
                    <div style={{ flex: '1 1 400px', display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '8px' }}>
                       <span style={{fontWeight: 800, color: '#3b82f6', flexShrink: 0}}>➔【アクション】</span>
                       {em.type === 'change_capacity' && <><RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} /> の定員を <Num v={em.newCapacity||1} oC={(v:any)=>updateRule("emergencies", idx, "newCapacity", v)} w={60} /> 名にする</>}
                       {em.type === 'staff_assign' && <><StaffSel v={em.staff} oC={(v:any)=>updateRule("emergencies", idx, "staff", v)} list={activeGeneralStaff} /> を <RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} /> に配置</>}
                       {em.type === 'role_assign' && <><select className="rule-sel" value={em.role} onChange={(e:any)=>updateRule("emergencies", idx, "role", e.target.value)}><option value="">月間設定</option>{MONTHLY_CATEGORIES.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select> を <RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} /> に配置</>}
                       {em.type === 'clear' && <><RoomSel v={em.section} oC={(v:any)=>updateRule("emergencies", idx, "section", v)} list={ROOM_SECTIONS} /> を無人にする</>}
                       {em.type === 'empty_room_swap' && <><select className="rule-sel" value={em.sourceRooms} onChange={(e:any)=>updateRule("emergencies", idx, "sourceRooms", e.target.value)}><option value="">補充元の部屋(優先順)</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> から強制補充</>}
                    </div>
                    <Del oC={()=>removeRule("emergencies", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#a16207", borderColor:"#ca8a04"}} onClick={() => addRule("emergencies", { type: "change_capacity", threshold: 16, section: "CT", newCapacity: 3 })}>＋ 緊急ルールを追加</button></>
            } />

            <RC bg="#f0fdf4" b="#bbf7d0" c="#15803d" ic="🔄" t="メイン配置の交換ルール" d="※ 兼務に行けないスタッフを、別部屋の兼務に行けるスタッフと丸ごと入れ替えます。" ch={
              <>{(customRules.swapRules || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "2px solid #bbf7d0", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>[</span>
                      <RoomSel v={rule.targetRoom} oC={(v:any)=>updateRule("swapRules", idx, "targetRoom", v)} list={ROOM_SECTIONS} ph="兼務先" />
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>] に [</span>
                      <RoomSel v={rule.triggerRoom} oC={(v:any)=>updateRule("swapRules", idx, "triggerRoom", v)} list={ROOM_SECTIONS} ph="メイン部屋" />
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>] の担当者が誰も入れない時➔</span>
                      <Del oC={()=>removeRule("swapRules", idx)} />
                    </div>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>以下の部屋の担当者とメイン配置を交換する（※左の部屋から優先）:</span>
                      <MP v={rule.sourceRooms} oC={(v: string) => updateRule("swapRules", idx, "sourceRooms", v)} opt={EXTENDED_ROOM_SECTIONS} />
                    </div>
                  </div>
              ))}<button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("swapRules", { targetRoom: "DSA", triggerRoom: "5号室", sourceRooms: "透視（6号）、1号室、2号室" })}>＋ 交換ルールを追加</button></>
            } />

            <RC bg="#fff7ed" b="#fed7aa" c="#c2410c" ic="🔄" t="代打ルール" ch={
              <>{(customRules.substitutes || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center", background: "#fff", padding: "16px", borderRadius: 8, border: "1px solid #fdba74", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}><MP v={rule.target} oC={(v: string) => updateRule("substitutes", idx, "target", v)} opt={activeGeneralStaff} ph="対象スタッフ(休)" /></div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>が全員休みの時➔</span>
                    <div style={{ flex: 1, minWidth: "200px" }}><MP v={rule.subs} oC={(v: string) => updateRule("substitutes", idx, "subs", v)} opt={activeGeneralStaff} ph="代打スタッフを追加" /></div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>を</span>
                    <RoomSel v={rule.section} oC={(v:any)=>updateRule("substitutes", idx, "section", v)} list={ROOM_SECTIONS} />
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>に優先</span>
                    <Del oC={()=>removeRule("substitutes", idx)} />
                  </div>
              ))}<button className="rule-add" style={{color:"#c2410c", borderColor:"#fdba74"}} onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打ルールを追加</button></>
            } />

            <RC bg="#e0f2fe" b="#bae6fd" c="#0369a1" ic="🎱" t="玉突きルール" ch={
              <>{(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "1px solid #bae6fd", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <StaffSel v={rule.s1 || rule.triggerStaff} oC={(v:any)=>updateRule("pushOuts", idx, "s1", v)} list={activeGeneralStaff} ph="誰" />
                      <span className="rule-label" style={{color:"#0284c7"}}>と</span>
                      <StaffSel v={rule.s2 || rule.targetStaff} oC={(v:any)=>updateRule("pushOuts", idx, "s2", v)} list={activeGeneralStaff} ph="誰" />
                      <span className="rule-label" style={{color:"#0284c7"}}>が同じ</span>
                      <RoomSel v={rule.triggerSection} oC={(v:any)=>updateRule("pushOuts", idx, "triggerSection", v)} list={ROOM_SECTIONS} />
                      <span className="rule-label" style={{color:"#0284c7"}}>になる時➔ 後者を</span>
                      <Del oC={()=>removeRule("pushOuts", idx)} />
                    </div>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#0284c7"}}>以下の部屋に移動（※左から優先）:</span>
                      <MP v={rule.targetSections} oC={(v: string) => updateRule("pushOuts", idx, "targetSections", v)} opt={ROOM_SECTIONS} />
                    </div>
                  </div>
              ))}<button className="rule-add" style={{color:"#0369a1", borderColor:"#7dd3fc"}} onClick={() => addRule("pushOuts", { s1: "", s2: "", triggerSection: "", targetSections: "" })}>＋ 玉突きルールを追加</button></>
            } />
          </div>

          {/* ===================== フェーズ3 ===================== */}
          <div style={{ borderLeft: "8px solid #3b82f6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#1d4ed8", marginBottom: 20, borderBottom: "2px solid #bfdbfe", paddingBottom: 10 }}>フェーズ3：メイン配置</h4>
            
            <RC bg="#fffbeb" b="#fde68a" c="#b45309" ic="👑" t="部屋の割り当て優先順位" ch={
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
            } />

            <RC bg="#f8fafc" b="#cbd5e1" c="#334155" ic="👥" t="絶対優先の定員設定" ch={
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {Object.entries(customRules.capacity || {}).map(([room, count]) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", padding: "10px 16px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                    <span style={{ fontWeight: 800, fontSize: 19 }}>{room}:</span>
                    <Num v={count} oC={(v:any)=>setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: v}})} w={60} />
                    <span style={{fontSize: 17}}>人</span>
                    <span onClick={() => { const n={...customRules.capacity}; delete n[room]; setCustomRules({...customRules, capacity:n}); }} style={{ cursor: "pointer", color: "#ef4444", marginLeft: 8, fontSize: 21 }}>✖</span>
                  </div>
                ))}
                <RoomSel v={""} oC={(v:any)=>{if(v) setCustomRules({...customRules, capacity: {...customRules.capacity, [v]: 1}})}} list={ROOM_SECTIONS} ph="＋部屋追加" w={180} />
              </div>
            } />

            <RC bg="#fff" b="#e2e8f0" c="#334155" ic="📅" t="月間担当者の設定" ch={
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => {
                  const opts = key === "受付ヘルプ" ? GENERAL_ROOMS : [];
                  return (
                    <SectionEditor key={key} section={label} value={monthlyAssign[key] || ""} activeStaff={key === "受付" ? activeReceptionStaff : allStaff} onChange={(v: string) => updateMonthly(key, v)} noTime={true} customOptions={opts} />
                  );
                })}
              </div>
            } />
          </div>

          {/* ===================== フェーズ4 ===================== */}
          <div style={{ borderLeft: "8px solid #10b981", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#047857", marginBottom: 20, borderBottom: "2px solid #a7f3d0", paddingBottom: 10 }}>フェーズ4：兼務・救済・遅番</h4>
            
            <RC bg="#fdf4ff" b="#f0abfc" c="#86198f" ic="✨" t="スマート兼務（専任担当の負担軽減・引き抜き）" d="※ 指定した部屋の専任担当者をフリーにし、他部屋から兼務で引き抜きます。" ch={
              <>{(customRules.smartKenmu || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ background: "#fff", padding: "16px 20px", border: "1px solid #f0abfc", borderRadius: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#86198f" }}>[</span>
                        <RoomSel v={rule.targetRoom} oC={(v:any)=>updateRule("smartKenmu", idx, "targetRoom", v)} list={ROOM_SECTIONS} ph="専任を外す部屋" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#86198f" }}>] を、以下の担当者に兼務させる（※左から優先）:</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 6 }}>
                        <MP v={rule.sourceRooms} oC={(v: string) => updateRule("smartKenmu", idx, "sourceRooms", v)} opt={EXTENDED_ROOM_SECTIONS} />
                      </div>
                    </div>
                    <Del oC={()=>removeRule("smartKenmu", idx)} />
                  </div>
              ))}<button className="rule-add" style={{ color: "#86198f", borderColor: "#f0abfc" }} onClick={() => addRule("smartKenmu", { targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" })}>＋ スマート兼務ルールを追加</button></>
            } />

            <RC bg="#ecfdf5" b="#a7f3d0" c="#065f46" ic="🔗" t="兼務・セット配置ルール" ch={
              <><h6 style={{ fontSize: 17, color: "#047857", marginTop: 0, marginBottom: 12 }}>■ 常時兼務ペア</h6>
              {(customRules.kenmuPairs || []).map((rule: any, idx: number) => (
                <div key={idx} className="rule-row" style={{ background: "#fff", padding: "12px 16px", border: "1px solid #a7f3d0", borderRadius: 8 }}>
                  <RoomSel v={rule.s1} oC={(v:any)=>updateRule("kenmuPairs", idx, "s1", v)} list={ROOM_SECTIONS} ph="部屋を選択" />
                  <span className="rule-label" style={{ color: "#065f46" }}>←→</span>
                  <RoomSel v={rule.s2} oC={(v:any)=>updateRule("kenmuPairs", idx, "s2", v)} list={ROOM_SECTIONS} ph="部屋を選択" />
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16, fontSize: 16, color: "#047857", fontWeight: 700, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!rule.isExclusive} onChange={(e) => updateRule("kenmuPairs", idx, "isExclusive", e.target.checked)} style={{ width: 22, height: 22, cursor: "pointer" }} />
                    このペアに専念させる（他の部屋の兼務禁止）
                  </label>
                  <Del oC={()=>removeRule("kenmuPairs", idx)} />
                </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("kenmuPairs", { s1: "", s2: "" })}>＋ ペアを追加</button>

              <h6 style={{ fontSize: 17, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 基本兼務（セット配置）<br/><span style={{fontSize: 15, color: "#065f46", fontWeight: "normal", marginLeft: 12}}>※ 引抜元が定員を満たしている場合のみ発動します。</span></h6>
              {(customRules.linkedRooms || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "1px solid #a7f3d0", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>[</span>
                        <RoomSel v={rule.target} oC={(v:any)=>updateRule("linkedRooms", idx, "target", v)} list={ROOM_SECTIONS} ph="兼務専用にする部屋" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>] には専任を置かず、[</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }}>
                        <MP v={rule.sources} oC={(v: string) => updateRule("linkedRooms", idx, "sources", v)} opt={EXTENDED_ROOM_SECTIONS} />
                      </div>
                      <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>] の担当者をセットで配置する（※左から優先）</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#065f46" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#065f46" }}>▼</button>
                      <Del oC={()=>removeRule("linkedRooms", idx)} />
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
                        <RoomSel v={rule.targetRoom} oC={(v:any)=>updateRule("rescueRules", idx, "targetRoom", v)} list={ROOM_SECTIONS} ph="（空室の部屋）" />
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#854d0e" }}>が不足なら ➔ 以下の部屋から兼務を探す（※左から優先）</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10 }}>
                        <MP v={rule.sourceRooms} oC={(v: string) => updateRule("rescueRules", idx, "sourceRooms", v)} opt={EXTENDED_ROOM_SECTIONS} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#a16207" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#a16207" }}>▼</button>
                      <Del oC={()=>removeRule("rescueRules", idx)} />
                    </div>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#854d0e", borderColor: "#fde047" }} onClick={() => addRule("rescueRules", { targetRoom: "", sourceRooms: "" })}>＋ 救済ルールを追加</button></>
            } />

            <RC bg="#f5f3ff" b="#ddd6fe" c="#6d28d9" ic="🌆" t="遅番ルール" ch={
              <><div style={{ marginBottom: 16, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #ddd6fe" }}>
                <label style={{ fontSize: 16, fontWeight: 800, color: "#6d28d9", display: "block", marginBottom: 4 }}>優先度を下げるスタッフ（左に書いた人ほど徹底して除外します）</label>
                <MP v={customRules.lateShiftLowPriorityStaff || ""} oC={(v: string) => setCustomRules({...customRules, lateShiftLowPriorityStaff: v})} opt={allStaff} ph="＋スタッフを選択" />
                <div style={{ fontSize: 14, color: "#475569", marginTop: 8 }}>※遅番は「日中の業務量」ではなく「今月の遅番回数が少ない人」から均等に選ばれます。ここに登録された人は回数に関わらず最終手段としてのみ選ばれます。</div>
              </div>
              {(customRules.lateShifts || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{background:"#fff", padding:"12px 16px", border:"1px solid #ddd6fe", borderRadius:8}}>
                    <RoomSel v={rule.section} oC={(v:any)=>updateRule("lateShifts", idx, "section", v)} list={ROOM_SECTIONS} />
                    <span className="rule-label" style={{color:"#6d28d9"}}>に</span>
                    <select value={rule.lateTime} onChange={(e: any) => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">遅番の時間</option>{TIME_OPTIONS.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>の担当を追加する（日勤は</span>
                    <select value={rule.dayEndTime} onChange={(e: any) => updateRule("lateShifts", idx, "dayEndTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">終了時間</option>{TIME_OPTIONS.filter(t => t.includes("(〜")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>とする）</span>
                    <Del oC={()=>removeRule("lateShifts", idx)} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルールを追加</button></>
            } />

            <RC bg="#fff1f2" b="#fecaca" c="#be185d" ic="⚠️" t="兼務上限のストッパー設定（過労防止）" ch={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Num v={customRules.alertMaxKenmu ?? 3} oC={(v:any)=>setCustomRules({...customRules, alertMaxKenmu: v})} w={80} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#9f1239" }}>部屋以上の兼務は自動ブロック（手動時はエラー表示）</span>
              </div>
            } />
          </div>

          {/* ===================== フェーズ5 ===================== */}
          <div style={{ borderLeft: "8px solid #8b5cf6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#6d28d9", marginBottom: 20, borderBottom: "2px solid #c4b5fd", paddingBottom: 10 }}>フェーズ5：仕上げ（最後に配置）</h4>
            
            <RC bg="#eef2ff" b="#c7d2fe" c="#4338ca" ic="🍱" t="昼当番ルール" ch={
              <><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#fff", padding: "12px 20px", borderRadius: 10, border: "1px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 19, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span>
                  <Num v={customRules.lunchBaseCount ?? 3} oC={(v:any)=>setCustomRules({...customRules, lunchBaseCount: v})} w={80} />
              </div>

              <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", marginBottom: 20 }}>
                <h6 style={{ margin: "0 0 16px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>👤 特定役割の確保（別部屋から引抜）</h6>
                {(customRules.lunchRoleRules || []).map((rule: any, idx: number) => (
                  <div key={idx} className="rule-row" style={{ borderBottom: "1px dashed #e0e7ff", paddingBottom: 16, marginBottom: 16 }}>
                    <select value={rule.day} onChange={(e: any) => updateRule("lunchRoleRules", idx, "day", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", minWidth: "100px"}}>{["月","火","水","木","金","土","日","毎日"].map(d => <option key={d} value={d}>{d}{d!=="毎日"?"曜":""}</option>)}</select>
                    <span className="rule-label">は</span>
                    <select value={rule.role} onChange={(e: any) => updateRule("lunchRoleRules", idx, "role", e.target.value)} className="rule-sel" style={{flex:"0 0 auto", minWidth: "140px"}}><option value="">役割を選択</option>{MONTHLY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
                    <span className="rule-label">担当を優先。引抜元（定員を満たしている場合のみ。※左から優先）:</span>
                    <MP v={rule.sourceRooms} oC={(v: string) => updateRule("lunchRoleRules", idx, "sourceRooms", v)} opt={EXTENDED_ROOM_SECTIONS} />
                    <Del oC={()=>removeRule("lunchRoleRules", idx)} />
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
                        <Num v={rule.count} oC={(v:any)=>updateRule("lunchSpecialDays", idx, "count", v)} />
                        <Del oC={()=>removeRule("lunchSpecialDays", idx)} />
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchSpecialDays", { day: "火", count: 4 })}>＋ 曜日ルールを追加</button>
                  </div>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h6>
                    {(customRules.lunchConditional || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <RoomSel v={rule.section} oC={(v:any)=>updateRule("lunchConditional", idx, "section", v)} list={ROOM_SECTIONS} />
                        <Num v={rule.min} oC={(v:any)=>updateRule("lunchConditional", idx, "min", v)} />
                        <span className="rule-label">人以上➔</span>
                        <Num v={rule.out} oC={(v:any)=>updateRule("lunchConditional", idx, "out", v)} />
                        <Del oC={()=>removeRule("lunchConditional", idx)} />
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchConditional", { section: "CT", min: 4, out: 1 })}>＋ 条件ルールを追加</button>
                  </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 24 }}>
                  <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", minWidth: "260px" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>🎯 優先的に選出する部屋</h6>
                    <MP v={customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT"} oC={(v: string) => setCustomRules({...customRules, lunchPrioritySections: v})} opt={ROOM_SECTIONS} />
                  </div>
                  <div style={{ flex: 1, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff", minWidth: "260px" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>⚠️ 緊急時のみ選出する部屋（なるべく除外）</h6>
                    <MP v={customRules.lunchLastResortSections ?? "治療"} oC={(v: string) => setCustomRules({...customRules, lunchLastResortSections: v})} opt={ROOM_SECTIONS} />
                  </div>
              </div></>
            } />

            <RC bg="#f0fdf4" b="#bbf7d0" c="#15803d" ic="🤝" t="サポート専任（2人目要員）ルール" ch={
              <><div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 17, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>対象スタッフ名（複数可）</label>
                    <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "1px solid #86efac", minHeight: "56px", display: "flex", alignItems: "center" }}>
                      <MP v={customRules.supportStaffList || ""} oC={(v: string) => setCustomRules({...customRules, supportStaffList: v})} opt={allStaff} ph="＋スタッフを選択" />
                    </div>
                  </div>
                  <div style={{ flex: 2, minWidth: "260px" }}>
                    <label style={{ fontSize: 17, fontWeight: 800, color: "#166534", display: "block", marginBottom: 8 }}>優先する対象部屋</label>
                    <MP v={customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT"} oC={(v: string) => setCustomRules({...customRules, supportTargetRooms: v})} opt={ROOM_SECTIONS} />
                  </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start", marginTop: 16 }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: 15, fontWeight: 800, color: "#166534", display: "block", marginBottom: 4 }}>低影響グループ（優先的に補充元にする部屋）</label>
                    <MP v={customRules.supportTargetRoomsLowImpact ?? "3号室,パノラマCT"} oC={(v: string) => setCustomRules({...customRules, supportTargetRoomsLowImpact: v})} opt={ROOM_SECTIONS} />
                  </div>
                  <div style={{ flex: 2, minWidth: "260px" }}>
                    <label style={{ fontSize: 15, fontWeight: 800, color: "#166534", display: "block", marginBottom: 4 }}>高影響グループ（極力補充元にしない部屋）</label>
                    <MP v={customRules.supportTargetRoomsHighImpact ?? "CT,MRI,治療,RI,ポータブル,2号室,1号室,5号室,透視（6号）,透視（11号）,骨塩,検像"} oC={(v: string) => setCustomRules({...customRules, supportTargetRoomsHighImpact: v})} opt={ROOM_SECTIONS} />
                  </div>
              </div></>
            } />
          </div>
          
        </div>
      </div>

      {/* ===================== モーダル類 ===================== */}
      {showUnassignedList && (
        <M t="未配置のスタッフ" oC={() => setShowUnassignedList(null)} ch={
          <div style={{ fontSize: 20, lineHeight: 1.6, color: "#ef4444", fontWeight: 800, textAlign: "center" }}>
            {getDailyStats(showUnassignedList).unassigned.join("、") || "全員配置済みです"}
          </div>
        } />
      )}

      {selectedErrorDay && (
        <M t={`👀 ${selectedErrorDay} の確認事項`} oC={() => setSelectedErrorDay(null)} ch={
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
        } />
      )}

      {selectedStaffForStats && (
        <M t={`👤 ${selectedStaffForStats} さんの詳細`} oC={() => setSelectedStaffForStats(null)} ch={
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
        } />
      )}

      {showLogDay && (
        <M t={`🤔 ${showLogDay} の割当根拠`} oC={() => setShowLogDay(null)} wide ch={
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {assignLogs[showLogDay]?.map((log, i) => rLog(log, i))}
            {!assignLogs[showLogDay] || assignLogs[showLogDay].length === 0 ? <li style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>自動割当の履歴がありません</li> : null}
          </ul>
        } />
      )}

      {showRuleModal && (
        <M t="🏥 勤務割付システムのルールブック" oC={() => setShowRuleModal(false)} wide ch={
          <div style={{ lineHeight: 1.8, fontSize: "16px", color: "#334155" }}>
            <p>このシステムはランダムではなく、複数のルールを順番に適用し、スタッフの負担・安全・公平性のバランスを見ながら、最適に近いシフトを自動で組み立てています。</p>
            
            <h4 style={{ color: "#e11d48", borderBottom: "2px solid #ffe4e6", paddingBottom: 8, marginTop: 24 }}>🛑 1. システムが「絶対に守る」鉄の掟</h4>
            <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}><strong>担当不可・NGペアの厳守:</strong> 「この部屋はまだ不可」「この2人は同室にしない」設定は必ず守ります。</li>
              <li style={{ marginBottom: 8 }}><strong>兼務上限（過労ストッパー）:</strong> 設定値（標準3）に達した時点（3部屋担当など）でカレンダーに⚠️注意が出ます。さらにその上限を超える（4部屋目などの）自動配置はブロックされます。</li>
              <li style={{ marginBottom: 8 }}><strong>連日担当の禁止:</strong> ポータブルなど連日禁止の部屋は、昨日の担当者をすべてのルートで問答無用に除外します。</li>
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
              <li style={{ marginBottom: 8 }}><strong>メイン配置:</strong> 優先順位の高い部屋から順番にメイン担当者を決めます。</li>
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
                昼当番はまず設定された条件（治療以外など）から探し、それでも不足なら最終手段（治療など）からも拾います。受付ヘルプもここで決定します。<br/>
                <strong>♻️ 余剰配置:</strong> 1日を通して何の部屋にも割り当てられなかった一般スタッフがいる場合、まず<strong>兼務中の部屋の兼務解消（専任化）</strong>を試みます。兼務解消できる部屋がなければ、<strong>優先順位が低い部屋から順に</strong>配置します。（※待機への自動配置は行いません）
              </li>
            </ol>

            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: 16, borderRadius: 8, marginTop: 32 }}>
              <strong style={{ color: "#334155" }}>💡 最後に</strong><br/>
              もし「この部屋の負担が偏っている」場合は、人間が【設定画面】の「月担当」や「優先順位」を少し調整することで、意図に近いシフトを作れるようになります。
            </div>
          </div>
        } />
      )}
    </div>
  );
}
