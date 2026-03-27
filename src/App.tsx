// ============== 🌟 純粋関数への切り出し（Auto Assign Logic） ==============
type DayData = { id: string; label: string; isPublicHoliday: boolean; holidayName: string; cells: Record<string, string> };

type AutoAssignContext = {
  allStaff: string[];
  activeGeneralStaff: string[];
  activeReceptionStaff: string[];
  monthlyAssign: Record<string, string>;
  customRules: any;
};

const executeAutoAssign = (day: DayData, prevDay: DayData | null, pastDays: DayData[], ctx: AutoAssignContext) => {
  const { allStaff, activeGeneralStaff, activeReceptionStaff, monthlyAssign, customRules } = ctx;
  const dayCells = { ...day.cells };
  
  // 明け・入りの引き継ぎ
  if (prevDay && prevDay.cells["入り"]) {
    const iriMembers = split(prevDay.cells["入り"]).map(getCoreName);
    const currentAke = split(dayCells["明け"]);
    dayCells["明け"] = join(Array.from(new Set([...currentAke, ...iriMembers])));
  }

  if (day.isPublicHoliday) return { ...day, cells: Object.fromEntries(SECTIONS.map(s => [s, ""])) };

  const blockMap = new Map<string, string>();
  const buildBlockMap = () => {
    allStaff.forEach(s => blockMap.set(s, 'NONE'));
    ["明け","入り","土日休日代休"].forEach(sec => {
      split(dayCells[sec]).forEach(m => blockMap.set(getCoreName(m), 'ALL'));
    });
    split(dayCells["不在"]).forEach(m => {
      const core = getCoreName(m);
      if (m.includes("(AM)")) blockMap.set(core, 'AM'); 
      else if (m.includes("(PM)")) blockMap.set(core, 'PM'); 
      else blockMap.set(core, 'ALL');
    });
  };
  buildBlockMap();

  const isForbidden = (staff: string, section: string) => (customRules.forbidden || []).some((rule: any) => rule.staff === staff && split(rule.sections).includes(section));
  const hasNGPair = (candidate: string, members: string[], checkSoft: boolean) => members.some(member => (customRules.ngPairs || []).some((ng: any) => {
    const match = (ng.s1 === candidate && ng.s2 === member) || (ng.s1 === member && ng.s2 === candidate);
    if (!match) return false;
    if ((ng.level || "hard") === "hard") return true;
    if ((ng.level || "hard") === "soft" && checkSoft) return true;
    return false;
  }));

  const getForbiddenCount = (staffName: string) => {
    const rules = customRules.forbidden || [];
    const rule = rules.find((r: any) => r.staff === staffName);
    return rule ? split(rule.sections).length : 0;
  };

  let skipSections: string[] = [];
  let roleAssignments: Record<string, any> = {};
  let currentKenmu: any[] = [];
  let dynamicCapacity = { ...(customRules.capacity || {}) };
  
  const evaluateEmergencies = () => {
    const tempAvailCount = activeGeneralStaff.filter(s => blockMap.get(s) !== 'ALL').length;
    (customRules.emergencies || []).forEach((em: any) => {
      if (tempAvailCount <= Number(em.threshold)) {
        if (em.type === "role_assign") { if (!roleAssignments[em.role] || em.threshold < roleAssignments[em.role].threshold) { roleAssignments[em.role] = em; } }
        if (em.type === "clear" && em.section) { skipSections.push(em.section); }
        if (em.type === "change_capacity" && em.section) { dynamicCapacity[em.section] = Number(em.newCapacity ?? 3); }
        if (em.type === "kenmu") { 
          currentKenmu.push(em); 
          if (em.s2) {
             split(em.s2).forEach(s => skipSections.push(s));
          }
        }
      }
    });
  };
  evaluateEmergencies();

  const assignCounts: Record<string, number> = {};
  const maxAssigns: Record<string, number> = {};
  const counts: Record<string, number> = {};
  
  allStaff.forEach(s => { assignCounts[s] = 0; maxAssigns[s] = 1; counts[s] = 0; });
  pastDays.forEach(pd => { Object.entries(pd.cells).forEach(([sec, val]) => { if (["明け","入り","不在","土日休日代休","昼当番"].includes(sec)) return; split(val as string).forEach(m => { const c = getCoreName(m); if (counts[c] !== undefined) counts[c]++; }); }); });

  const isUsed = (name: string) => (assignCounts[name] || 0) >= (maxAssigns[name] || 1);
  const addU = (name: string, f = 1) => { assignCounts[name] = (assignCounts[name] || 0) + f; };

  Object.keys(dayCells).forEach(sec => {
      if (["明け","入り","不在","土日休日代休"].includes(sec)) return;
      if (skipSections.includes(sec)) { dayCells[sec] = ""; return; }
      
      let members = split(dayCells[sec]);
      members = members.map(m => {
        const core = getCoreName(m);
        const block = blockMap.get(core);
        if (block === 'ALL') return null; 
        if (block === 'AM' && m.includes('(AM)')) return null; 
        if (block === 'PM' && m.includes('(PM)')) return null; 
        if (block === 'AM' && !m.includes('(PM)') && !m.match(/\(.*\)/)) return `${core}(PM)`;
        if (block === 'PM' && !m.includes('(AM)') && !m.match(/\(.*\)/)) return `${core}(AM)`;
        return m;
      }).filter(Boolean) as string[];
      dayCells[sec] = join(members);

      if (!REST_SECTIONS.includes(sec) && sec !== "昼当番") {
          split(dayCells[sec]).forEach(name => { 
              const c = getCoreName(name); 
              const isHalf = name.includes("(AM)") || name.includes("(PM)") || name.match(/\(〜/) || name.match(/〜\)/);
              assignCounts[c] = (assignCounts[c] || 0) + (isHalf ? 0.5 : 1);
          }); 
      }
  });

  const supportStaffList = parseAndSortStaff(customRules.supportStaffList || "");
  const supportTargetRooms = split(customRules.supportTargetRooms ?? "1号室,2号室,5号室,パノラマCT");
  const fullDayOnlyList = split(customRules.fullDayOnlyRooms ?? "DSA,検像,骨塩,パノラマCT");
  
  // 🌟 修正点1: シャッフルを廃止し、決定論的な安定ソートに変更
  const availAll = allStaff.filter(s => blockMap.get(s) !== 'ALL').sort((a, b) => {
    const aForbidCount = getForbiddenCount(a);
    const bForbidCount = getForbiddenCount(b);
    if (aForbidCount !== bForbidCount) return bForbidCount - aForbidCount;
    if (counts[a] !== counts[b]) return counts[a] - counts[b]; 
    return a.localeCompare(b, 'ja'); // 同点の場合は名前順で安定させる
  });
  
  const availSupport = availAll.filter(s => supportStaffList.includes(s));
  const availGeneral = availAll.filter(s => activeGeneralStaff.includes(s) && !supportStaffList.includes(s));
  const effectiveReceptionStaff = activeReceptionStaff.length > 0 ? activeReceptionStaff : activeGeneralStaff;
  const availReception = availAll.filter(s => effectiveReceptionStaff.includes(s) && !supportStaffList.includes(s));

  function pick(availList: string[], list: string[], n: number, section?: string, currentAssigned: string[] = [], allowRepeatFromPrev = false) {
    const result: string[] = [];
    const uniqueList = Array.from(new Set(list.filter(Boolean)));

    const primary = uniqueList.filter(name => {
      if (!availList.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
      // 🌟 修正点2: sectionが未定義の場合を安全に処理
      const isFixed = (customRules.fixed || []).some((r:any) => r.staff === name && r.section === section) || (section ? isMonthlyMainStaff(section, name, monthlyAssign) : false);
      
      if (!allowRepeatFromPrev && prevDay && section && !isFixed) {
        if (split(prevDay.cells[section] || "").map(getCoreName).includes(name)) return false;
      }
      if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), true)) return false;
      return true;
    });
    for (const name of primary) { result.push(name); addU(name, 1); if (result.length >= n) return result; }

    const fallback = uniqueList.filter(name => {
      if (!availList.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
      const isFixed = (customRules.fixed || []).some((r:any) => r.staff === name && r.section === section) || (section ? isMonthlyMainStaff(section, name, monthlyAssign) : false);
      
      if (!allowRepeatFromPrev && prevDay && section && !isFixed) {
        if (split(prevDay.cells[section] || "").map(getCoreName).includes(name)) return false;
      }
      if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), false)) return false;
      return true;
    });
    for (const name of fallback) { result.push(name); addU(name, 1); if (result.length >= n) return result; }
    
    const lastResort = uniqueList.filter(name => {
      if (!availList.includes(name) || isUsed(name) || (section && isForbidden(name, section))) return false;
      if (hasNGPair(name, [...currentAssigned, ...result].map(getCoreName), false)) return false;
      return true;
    });
    for (const name of lastResort) { result.push(name); addU(name, 1); if (result.length >= n) return result; }

    return result;
  }

  function fill(availList: string[], section: string, preferredList: string[], targetCount: number) {
    if (skipSections.includes(section)) return;
    let current = split(dayCells[section]);
    
    const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + (m.includes("(AM)") || m.includes("(PM)") || m.match(/\(〜/) || m.match(/〜\)/) ? 0.5 : 1), 0);

    let safeCounter = 0;
    while (getCurrentAmount(current) < targetCount && safeCounter < 20) {
      safeCounter++;
      // 🌟 修正点3: 無限ループ回避の安全弁（コンソールに警告）
      if (safeCounter === 20) {
        console.warn(`[AutoAssign] ループ上限到達: ${day.label}の ${section} (現在 ${getCurrentAmount(current)}人 / 目標 ${targetCount}人)`);
      }

      const remaining = targetCount - getCurrentAmount(current);
      
      let needTag = "";
      if (remaining === 0.5 || remaining === 1.5 || remaining === 2.5) {
         const amCount = current.filter(m => m.includes("(AM)")).length;
         const pmCount = current.filter(m => m.includes("(PM)")).length;
         if (amCount > pmCount) needTag = "(PM)";
         if (pmCount > amCount) needTag = "(AM)";
      }

      const isValidBlock = (name: string) => {
         const b = blockMap.get(name);
         if (b === 'ALL') return false;
         if (needTag === "(AM)" && b === 'AM') return false; 
         if (needTag === "(PM)" && b === 'PM') return false; 
         
         if (fullDayOnlyList.includes(section) && b !== 'NONE') return false;

         return true;
      };

      const validPreferred = preferredList.filter(name => !isUsed(name) && !isForbidden(name, section) && !current.map(getCoreName).includes(name) && isValidBlock(name));
      const validAvail = availList.filter(name => !isUsed(name) && !isForbidden(name, section) && !current.map(getCoreName).includes(name) && isValidBlock(name));

      if (validPreferred.length === 0 && validAvail.length === 0) break;

      const hasAmFree = validAvail.some(s => blockMap.get(s) === 'PM');
      const hasPmFree = validAvail.some(s => blockMap.get(s) === 'AM');
      
      const sortCandidates = (candidates: string[]) => {
         return [...candidates].sort((a, b) => {
             const bA = blockMap.get(a);
             const bB = blockMap.get(b);

             let scoreA = 0; let scoreB = 0;

             if (needTag === "") {
                 if (hasAmFree && hasPmFree && (bA === 'AM' || bA === 'PM')) scoreA += 200; 
                 else if (bA === 'AM' || bA === 'PM') scoreA += 150; 
                 else if (bA === 'NONE') scoreA += 100; 
             } else {
                 if (needTag === "(AM)" && bA === 'PM') scoreA += 200; 
                 if (needTag === "(PM)" && bA === 'AM') scoreA += 200; 
                 if (bA === 'NONE') scoreA += 100; 
             }

             if (needTag === "") {
                 if (hasAmFree && hasPmFree && (bB === 'AM' || bB === 'PM')) scoreB += 200;
                 else if (bB === 'AM' || bB === 'PM') scoreB += 150;
                 else if (bB === 'NONE') scoreB += 100;
             } else {
                 if (needTag === "(AM)" && bB === 'PM') scoreB += 200;
                 if (needTag === "(PM)" && bB === 'AM') scoreB += 200;
                 if (bB === 'NONE') scoreB += 100;
             }

             if (scoreA !== scoreB) return scoreB - scoreA;
             return a.localeCompare(b, 'ja'); // ここも安定ソート
         });
      };

      const sortedPreferred = sortCandidates(validPreferred);
      const sortedAvail = sortCandidates(validAvail);

      const pickedCoreList = pick(sortedAvail, [...sortedPreferred, ...sortedAvail], 1, section, current.map(getCoreName), false);
      if (pickedCoreList.length === 0) break;

      const core = pickedCoreList[0];
      assignCounts[core] -= 1;

      const block = blockMap.get(core);
      let tag = ""; let f = 1;
      
      if (block === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(core, 'ALL'); } 
      else if (block === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(core, 'ALL'); } 
      else { 
          if (needTag) {
              tag = needTag;
              f = 0.5;
              blockMap.set(core, needTag === "(AM)" ? 'AM' : 'PM');
          } else {
              tag = ""; 
              f = 1;
              blockMap.set(core, 'ALL');
          }
      }
      
      current.push(`${core}${tag}`);
      addU(core, f);
    }
    dayCells[section] = join(current);
  }

  const assignRooms = () => {
    (customRules.fixed || []).forEach((rule: any) => {
      if (!rule.staff || !rule.section) return;
      Object.keys(dayCells).forEach(sec => {
        if (sec === rule.section) return;
        if (REST_SECTIONS.includes(sec)) return;
        const before = split(dayCells[sec]);
        const after = before.filter(m => getCoreName(m) !== rule.staff);
        if (before.length !== after.length) {
          dayCells[sec] = join(after);
          assignCounts[rule.staff] = 0; 
          blockMap.set(rule.staff, 'NONE'); 
        }
      });
    });

    (customRules.fixed || []).forEach((rule: any) => {
      if (!rule.staff || !rule.section || !availAll.includes(rule.staff) || isUsed(rule.staff) || isForbidden(rule.staff, rule.section)) return;
      if (skipSections.includes(rule.section)) return;
      const current = split(dayCells[rule.section]);
      if (current.map(getCoreName).includes(rule.staff) || hasNGPair(rule.staff, current.map(getCoreName), false)) return;
      
      const b = blockMap.get(rule.staff);
      let tag = ""; let f = 1;
      if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(rule.staff, 'ALL'); }
      else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(rule.staff, 'ALL'); }
      else { blockMap.set(rule.staff, 'ALL'); }

      dayCells[rule.section] = join([...current, `${rule.staff}${tag}`]); 
      addU(rule.staff, f);
    });

    Object.values(roleAssignments).forEach((ra: any) => {
      if (skipSections.includes(ra.section)) return;
      const candidates = split(monthlyAssign[ra.role] || "");
      const targetAvail = ["受付"].includes(ra.role) ? availReception : availGeneral;
      const staff = candidates.find(s => targetAvail.includes(s) && !isUsed(s) && !isForbidden(s, ra.section));
      if (staff && !split(dayCells[ra.section]).map(getCoreName).includes(staff)) { 
        const b = blockMap.get(staff);
        let tag = ""; let f = 1;
        if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
        else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
        else { blockMap.set(staff, 'ALL'); }
        dayCells[ra.section] = join([...split(dayCells[ra.section]), `${staff}${tag}`]); 
        addU(staff, f); 
      }
    });

    const PRIORITY_LIST = customRules.priorityRooms && customRules.priorityRooms.length > 0 ? customRules.priorityRooms : DEFAULT_PRIORITY_ROOMS;

    PRIORITY_LIST.forEach((room: string) => {
      if (skipSections.includes(room)) return;

      const targetCount = dynamicCapacity[room] !== undefined ? dynamicCapacity[room] : 1;

      if (room === "受付") {
        let currentUketsuke = split(dayCells["受付"]);
        const uketsukeMonthly = split(monthlyAssign.受付 || "");
        for (const name of uketsukeMonthly) {
          if (availAll.includes(name) && !isUsed(name) && !currentUketsuke.map(getCoreName).includes(name)) { 
            currentUketsuke.push(name); addU(name, 1); 
          }
        }
        const neededUketsuke = targetCount - currentUketsuke.length;
        if (neededUketsuke > 0) {
          const pickedUketsuke = pick(availReception, availReception, neededUketsuke, "受付", currentUketsuke);
          currentUketsuke = [...currentUketsuke, ...pickedUketsuke];
        }
        dayCells["受付"] = join(currentUketsuke);
      } else {
        let preferredList: string[] = [];
        if (["治療", "RI", "CT", "MRI", "MMG", "透析後胸部"].includes(room)) {
           preferredList = getMonthlyStaffForSection(room, monthlyAssign).filter((s: string) => availGeneral.includes(s));
        } else if (monthlyAssign[room]) {
           preferredList = split(monthlyAssign[room]).filter((s: string) => availGeneral.includes(s));
        }
        
        let candidates = availGeneral;
        const strictRooms = ["治療", "RI", "MMG", "透析後胸部"];
        
        // 🌟 修正点4: 月間担当が全員休みなら、一般スタッフをフォールバックさせる
        if (strictRooms.includes(room)) {
           candidates = preferredList.length > 0 ? preferredList : availGeneral; 
        }
        
        fill(candidates, room, preferredList, targetCount);

        const currentAssigned = split(dayCells[room]);
        if (currentAssigned.length === 0) {
          const kenmuRule = (customRules.emergencies || []).find((em: any) => em.type === "kenmu" && split(em.s2).includes(room));
          if (kenmuRule && kenmuRule.s1) {
            const sourceStaff = split(dayCells[kenmuRule.s1]);
            if (sourceStaff.length > 0) {
              const allowed = sourceStaff.filter(m => {
                 if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) return false;
                 return !isForbidden(getCoreName(m), room);
              }).map(getCoreName);

              if (allowed.length > 0) {
                dayCells[room] = allowed[0]; 
              }
            }
          }
        }
      }
    });

    (customRules.kenmuPairs || []).forEach((pair: any) => {
      if (!pair.s1 || !pair.s2) return;
      if (split(dayCells[pair.s2]).length > 0) return;
      const source = split(dayCells[pair.s1]);
      if (source.length === 0) return;
      const allowed = source
        .filter(m => {
          if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) return false;
          return !isForbidden(getCoreName(m), pair.s2);
        })
        .map(getCoreName);
      if (allowed.length > 0) {
        dayCells[pair.s2] = join(allowed);
      }
    });

    currentKenmu.forEach((km: any) => {
      const p1 = split(dayCells[km.s1]);
      if (p1.length > 0) {
        const targets = split(km.s2);
        targets.forEach(targetRoom => {
          if (skipSections.includes(targetRoom)) { 
            const allowed = p1.filter(m => {
               if (m.includes("17:00") || m.includes("19:00") || m.includes("22:00")) return false;
               return !isForbidden(getCoreName(m), targetRoom);
            }).map(getCoreName); 
            if (allowed.length > 0) {
               dayCells[targetRoom] = allowed[0]; 
            }
          }
        });
      }
    });
    
    (customRules.pushOuts || []).forEach((po: any) => {
      const s1 = po.s1 || po.triggerStaff;
      const s2 = po.s2 || po.targetStaff;
      const tSec = po.triggerSection;
      
      if (!s1 || !s2 || !tSec || !po.targetSections) return;
      
      if (availGeneral.includes(s1) && availGeneral.includes(s2) && !isUsed(s2)) {
         const s1In = split(dayCells[tSec]).map(getCoreName).includes(s1) || isMonthlyMainStaff(tSec, s1, monthlyAssign);
         const s2In = split(dayCells[tSec]).map(getCoreName).includes(s2) || isMonthlyMainStaff(tSec, s2, monthlyAssign);
         
         if (s1In && s2In) {
            const allowedRooms = split(po.targetSections).filter(s => !skipSections.includes(s));
            for (const room of allowedRooms) {
              if (isForbidden(s2, room)) continue;
              if (fullDayOnlyList.includes(room) && blockMap.get(s2) !== 'NONE') continue;

              const current = split(dayCells[room]);
              if (hasNGPair(s2, current.map(getCoreName), false)) continue;
              
              const actualCap = dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
              if (current.length < actualCap) {
                const b = blockMap.get(s2);
                let tag = ""; let f = 1;
                if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(s2, 'ALL'); }
                else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(s2, 'ALL'); }
                else { blockMap.set(s2, 'ALL'); }
                dayCells[room] = join([...current, `${s2}${tag}`]);
                addU(s2, f);
                dayCells[tSec] = join(split(dayCells[tSec]).filter(m => getCoreName(m) !== s2));
                break;
              }
            }
         }
      }
    });

    (customRules.substitutes || []).forEach((sub: any) => {
      const targets = split(sub.target);
      if (targets.length === 0 || skipSections.includes(sub.section)) return; 
      
      const trigger = targets.every(t => !availAll.includes(t) || isUsed(t));
      if (trigger) {
        const fallbackStaff = split(sub.subs).filter(s => availGeneral.includes(s) && !isUsed(s) && !isForbidden(s, sub.section));
        if (fallbackStaff.length > 0) {
          const currentSec = split(dayCells[sub.section]);
          for (const f of fallbackStaff) {
            if (fullDayOnlyList.includes(sub.section) && blockMap.get(f) !== 'NONE') continue;

            if (!hasNGPair(f, currentSec.map(getCoreName), false) && currentSec.length < 6) {
              const b = blockMap.get(f);
              let tag = ""; let fr = 1;
              if (b === 'AM') { tag = "(PM)"; fr = 0.5; blockMap.set(f, 'ALL'); }
              else if (b === 'PM') { tag = "(AM)"; fr = 0.5; blockMap.set(f, 'ALL'); }
              else { blockMap.set(f, 'ALL'); }
              dayCells[sub.section] = join([...currentSec, `${f}${tag}`]); 
              addU(f, fr);
              break; 
            }
          }
        }
      }
    });
  };
  assignRooms();

  const processPostTasks = () => {
    let helpMembers: string[] = [];
    const tempAvailCountForHelp = activeGeneralStaff.filter(s => blockMap.get(s) !== 'ALL').length;
    if (tempAvailCountForHelp <= (customRules.helpThreshold ?? 17)) {
      helpMembers = [...split(dayCells["RI"]).map(getCoreName)];
      if (split(dayCells["CT"]).length >= 4) { helpMembers.push(getCoreName(split(dayCells["CT"])[split(dayCells["CT"]).length - 1])); }
    }

    (customRules.lateShifts || []).forEach((rule: any) => {
      if (!rule.section || !rule.lateTime || !rule.dayEndTime) return;
      if (skipSections.includes(rule.section)) return;
      if (!ROOM_SECTIONS.includes(rule.section)) return;
      
      let current = split(dayCells[rule.section]);
      if (current.length === 0) return;

      current = current.map(m => (!m.includes("(") && !m.includes(")")) ? m + rule.dayEndTime : m);

      if (!current.some(m => m.includes(rule.lateTime))) {
        const currentCore = current.map(getCoreName);
        const getCandidate = (candidatesList: string[]) => {
          let cand = candidatesList.filter(name => {
            if (currentCore.includes(name)) return false;
            const b = blockMap.get(name);
            if (b === 'PM') return false; 
            if (isForbidden(name, rule.section)) return false;
            return true;
          });
          if (cand.length > 0) {
            cand.sort((a, b) => (assignCounts[a] || 0) - (assignCounts[b] || 0));
            return cand[0];
          }
          return null;
        };

        let picked = getCandidate(helpMembers) || getCandidate(availGeneral);
        if (picked) {
          current.push(`${picked}${rule.lateTime}`);
          addU(picked, 0.5);
          blockMap.set(picked, blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); 
        }
      }
      dayCells[rule.section] = join(current);
    });

    const assignSupportStaff = () => {
      const unassignedSupport = availSupport.filter(s => !isUsed(s));
      unassignedSupport.forEach(staff => {
        const b = blockMap.get(staff);
        if (b === 'ALL') return;

        let assigned = false;
        for (const room of supportTargetRooms) {
          if (skipSections.includes(room) || isForbidden(staff, room)) continue;
          
          let current = split(dayCells[room]);
          const currentCores = current.map(getCoreName);
          
          if (current.length === 1 && !currentCores.includes(staff) && !hasNGPair(staff, currentCores, false)) {
            let tag = ""; let f = 1;
            if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
            else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
            else { blockMap.set(staff, 'ALL'); }
            
            dayCells[room] = join([...current, `${staff}${tag}`]);
            addU(staff, f);
            assigned = true;
            break; 
          }
        }
        
        if (!assigned && !skipSections.includes("待機") && !isForbidden(staff, "待機")) {
           let current = split(dayCells["待機"]);
           let tag = ""; let f = 1;
           if (b === 'AM') { tag = "(PM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
           else if (b === 'PM') { tag = "(AM)"; f = 0.5; blockMap.set(staff, 'ALL'); }
           else { blockMap.set(staff, 'ALL'); }
           dayCells["待機"] = join([...current, `${staff}${tag}`]);
           addU(staff, f);
        }
      });
    };
    assignSupportStaff();

    if (!skipSections.includes("昼当番")) {
      let currentLunch = split(dayCells["昼当番"]);
      let baseLunchTarget = customRules.lunchBaseCount ?? 3;
      const dayChar = day.label.match(/\((.*?)\)/)?.[1];
      if (dayChar) {
        const specialDay = (customRules.lunchSpecialDays || []).find((sd:any) => sd.day === dayChar);
        if (specialDay) baseLunchTarget = Number(specialDay.count);
      }
      const lunchTarget = baseLunchTarget;

      const riMembers = split(dayCells["RI"]).map(getCoreName);
      riMembers.forEach(name => {
        if (!currentLunch.includes(name) && currentLunch.length < lunchTarget && !isForbidden(name, "昼当番")) {
          currentLunch.push(name);
        }
      });

      const prioritySecs = split(customRules.lunchPrioritySections ?? "RI,1号室,2号室,3号室,5号室,CT");
      for (const sec of prioritySecs) {
        if (currentLunch.length >= lunchTarget) break;
        split(dayCells[sec]).forEach(name => {
          const core = getCoreName(name);
          if (!currentLunch.includes(core) && currentLunch.length < lunchTarget && !isForbidden(core, "昼当番")) {
            currentLunch.push(core);
          }
        });
      }

      if (currentLunch.length < lunchTarget) {
        (customRules.lunchConditional || []).forEach((cond: any) => {
          if (!cond.section) return;
          const secMembers = split(dayCells[cond.section]);
          if (secMembers.length >= Number(cond.min)) {
            let picked = 0;
            for (const name of secMembers) {
              if (picked >= Number(cond.out) || currentLunch.length >= lunchTarget) break;
              const core = getCoreName(name);
              if (!currentLunch.includes(core) && !isForbidden(core, "昼当番")) {
                currentLunch.push(core);
                picked++;
              }
            }
          }
        });
      }
      
      if (currentLunch.length < lunchTarget) {
        const lastResortSecs = split(customRules.lunchLastResortSections ?? "治療");
        const lastResortMembers: string[] = [];
        lastResortSecs.forEach(sec => {
          split(dayCells[sec]).forEach(name => lastResortMembers.push(getCoreName(name)));
        });

        const fallbackCandidates = availGeneral.filter(name => !lastResortMembers.includes(name) && !currentLunch.includes(name) && !isForbidden(name, "昼当番"));
        for (const name of fallbackCandidates) { 
          if (currentLunch.length < lunchTarget) currentLunch.push(name); 
        }
        
        if (currentLunch.length < lunchTarget) {
           const finalFallback = availGeneral.filter(name => lastResortMembers.includes(name) && !currentLunch.includes(name) && !isForbidden(name, "昼当番"));
           for (const name of finalFallback) {
             if (currentLunch.length < lunchTarget) currentLunch.push(name); 
           }
        }
      }
      dayCells["昼当番"] = join(currentLunch.slice(0, lunchTarget));

      const uTarget = dynamicCapacity.受付 !== undefined ? dynamicCapacity.受付 : 2;
      const currentUketsukeCount = split(dayCells["受付"]).length;
      const needsUketsukeHelp = currentUketsukeCount < uTarget;

      if (needsUketsukeHelp && !skipSections.includes("受付ヘルプ")) {
        let helpMems = split(dayCells["受付ヘルプ"]);
        const lunchCores = split(dayCells["昼当番"]).map(getCoreName);

        const getHelp = (exclude: string[]) => {
          let cand = availGeneral.filter(n => !exclude.includes(n) && !helpMems.map(getCoreName).includes(n) && !isForbidden(n, "受付ヘルプ"));
          if (cand.length > 0) { cand.sort((a, b) => (assignCounts[a] || 0) - (assignCounts[b] || 0)); return cand[0]; }
          return null; 
        };

        const lunchHelpCandidate = getHelp(lunchCores);
        if (lunchHelpCandidate) {
          helpMems.push(`${lunchHelpCandidate}(12:15〜13:00)`);
        }

        const kenzoCores = split(dayCells["検像"]).map(getCoreName);
        const validKenzo = kenzoCores.filter(n => blockMap.get(n) !== 'AM' && !helpMems.map(getCoreName).includes(n) && !isForbidden(n, "受付ヘルプ"));

        let picked16 = validKenzo.length > 0 ? validKenzo[0] : null;

        if (!picked16) {
          const excl = lunchHelpCandidate ? [lunchHelpCandidate] : [];
          let cand = availGeneral.filter(n => blockMap.get(n) !== 'AM' && !helpMems.map(getCoreName).includes(n) && !excl.includes(n) && !isForbidden(n, "受付ヘルプ"));
          if (cand.length > 0) { cand.sort((a, b) => (assignCounts[a] || 0) - (assignCounts[b] || 0)); picked16 = cand[0]; }
        }

        if (picked16) {
          helpMems.push(`${picked16}(16:00〜)`);
        }

        dayCells["受付ヘルプ"] = join(helpMems);
      }
    }
  };
  processPostTasks();

  return { ...day, cells: dayCells };
};
