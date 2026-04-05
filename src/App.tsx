// ----------------- 後半はここから -----------------

  fill(availList: string[], section: string, preferredList: string[], targetCount: number) {
    if (this.skipSections.includes(section) || section === "透析後胸部") return;
    const eff = this.getEffectiveTarget(section, targetCount); if (eff.allClosed) return;
    let current = split(this.dayCells[section]); const getCurrentAmount = (arr: string[]) => arr.reduce((sum, m) => sum + getStaffAmount(m), 0); let prevAmount = -1;
    while (getCurrentAmount(current) < eff.cap) {
      const currentAmount = getCurrentAmount(current); if (currentAmount === prevAmount) break; prevAmount = currentAmount;
      const remaining = eff.cap - currentAmount; let curAm = eff.amClosed ? 999 : 0; let curPm = eff.pmClosed ? 999 : 0; current.forEach(x => { if (x.includes("(AM)")) curAm++; else if (x.includes("(PM)")) curPm++; else { curAm++; curPm++; } });
      let needTag = ""; if (curAm >= targetCount && curPm < targetCount) needTag = "(PM)"; else if (curPm >= targetCount && curAm < targetCount) needTag = "(AM)"; else if (remaining === 0.5) { if (curAm > curPm) needTag = "(PM)"; else if (curPm > curAm) needTag = "(AM)"; }
      const getFilterReason = (name: string): RejectReason | null => { if (current.map(extractStaffName).includes(name)) return { hard: true, msg: "同室配置済" }; if (this.isUsed(name)) return { hard: true, msg: "他業務配置済" }; if (this.isForbidden(name, section)) return { hard: true, msg: "担当不可" }; if (section === "MMG" && !this.isMmgCapable(name)) return { hard: true, msg: "MMG外" }; if (!this.canAddKenmu(name, section)) return { hard: true, msg: "兼務上限" }; const b = this.blockMap.get(name); if (needTag && b === 'NONE') { if (!eff.pmClosed && !eff.amClosed) { const isMain = isMonthlyMainStaff(section, name, this.ctx.monthlyAssign); if (!isMain) return { hard: true, msg: "半端枠" }; } } if (b === 'ALL') return { hard: true, msg: "全日ブロック" }; if (needTag === "(AM)" && b === 'AM') return { hard: true, msg: "AMブロック" }; if (needTag === "(PM)" && b === 'PM') return { hard: true, msg: "PMブロック" }; if (eff.pmClosed && b === 'AM') return { hard: true, msg: "午後休でAM不可" }; if (eff.amClosed && b === 'PM') return { hard: true, msg: "午前休でPM不可" }; if (this.isHalfDayBlockedForFullDayRoom(name, section).hard) return { hard: true, msg: "終日専任室" }; if (this.isHardNoConsecutive(name, section)) return { hard: false, msg: "連日禁止" }; if (this.hasNGPair(name, current.map(extractStaffName), false)) return { hard: true, msg: "絶対NG" }; if (this.hasNGPair(name, current.map(extractStaffName), true)) return { hard: false, msg: "なるべくNG" }; return null; };
      const candidatesWithReason = availList.map(name => ({ name, reason: getFilterReason(name) }));
      let validNames = candidatesWithReason.filter(c => !c.reason).map(c => c.name); let fallbackMsg = "";
      if (validNames.length === 0) { const softCandidates = candidatesWithReason.filter(c => c.reason && !c.reason.hard); if (softCandidates.length > 0) { validNames = softCandidates.map(c => c.name); fallbackMsg = `（⚠️回避特例）`; } else break; }
      const validPreferred = validNames.filter(n => preferredList.includes(n)); const validAvail = validNames.filter(n => !preferredList.includes(n));
      const sortCandidates = (candidates: string[]) => { let mainStaff = split(this.ctx.monthlyAssign[section] || "").map(extractStaffName); let subPrioStaff: string[] = []; let subStaff: string[] = []; if (section === "治療") { mainStaff = split(this.ctx.monthlyAssign.治療 || "").map(extractStaffName); subPrioStaff = split(this.ctx.monthlyAssign.治療サブ優先 || "").map(extractStaffName); subStaff = split(this.ctx.monthlyAssign.治療サブ || "").map(extractStaffName); } else if (section === "RI") { mainStaff = split(this.ctx.monthlyAssign.RI || "").map(extractStaffName); subStaff = split(this.ctx.monthlyAssign.RIサブ || "").map(extractStaffName); } const hasAmFree = validNames.some(s => this.blockMap.get(s) === 'PM'); const hasPmFree = validNames.some(s => this.blockMap.get(s) === 'AM'); return [...candidates].sort((a, b) => { const bA = this.blockMap.get(a); const bB = this.blockMap.get(b); let scoreA = 0; let scoreB = 0; if (mainStaff.includes(a)) scoreA += 10000; else if (subPrioStaff.includes(a)) scoreA += 5000; else if (subStaff.includes(a)) scoreA += 2000; if (mainStaff.includes(b)) scoreB += 10000; else if (subPrioStaff.includes(b)) scoreB += 5000; else if (subStaff.includes(b)) scoreB += 2000; if (this.isHalfDayBlockedForFullDayRoom(a, section).monthlyHalfException) scoreA -= 3000; if (this.isHalfDayBlockedForFullDayRoom(b, section).monthlyHalfException) scoreB -= 3000; const roomCountWeight = (section === "MRI" || section === "CT") ? 200 : 100; scoreA -= (this.roomCounts[a]?.[section] || 0) * roomCountWeight; scoreB -= (this.roomCounts[b]?.[section] || 0) * roomCountWeight; if (this.isHardNoConsecutive(a, section)) scoreA -= 500; if (this.isHardNoConsecutive(b, section)) scoreB -= 500; if (section === "ポータブル") { const pastA = this.getPastRoomCount(a, section); const pastB = this.getPastRoomCount(b, section); if (pastA > 0) scoreA -= 1000 * pastA; if (pastB > 0) scoreB -= 1000 * pastB; } if (needTag === "") { if (bA === 'NONE') scoreA += 200; else if (hasAmFree && hasPmFree && (bA === 'AM' || bA === 'PM')) scoreA += 100; } else { if (needTag === "(AM)" && bA === 'PM') scoreA += 200; if (needTag === "(PM)" && bA === 'AM') scoreA += 200; if (bA === 'NONE') scoreA += 100; } if (needTag === "") { if (bB === 'NONE') scoreB += 200; else if (hasAmFree && hasPmFree && (bB === 'AM' || bB === 'PM')) scoreB += 100; } else { if (needTag === "(AM)" && bB === 'PM') scoreB += 200; if (needTag === "(PM)" && bB === 'AM') scoreB += 200; if (bB === 'NONE') scoreB += 100; } if (scoreA !== scoreB) return scoreB - scoreA; if ((this.assignCounts[a] || 0) !== (this.assignCounts[b] || 0)) return (this.assignCounts[a] || 0) - (this.assignCounts[b] || 0); return a.localeCompare(b, 'ja'); }); };
      const allSorted = [...sortCandidates(validPreferred), ...sortCandidates(validAvail)]; const pickedCoreList = this.pick(validNames, allSorted, 1, section, current.map(extractStaffName)); if (pickedCoreList.length === 0) break;
      const core = pickedCoreList[0]; const block = this.blockMap.get(core); let tag = ""; let f = 1; if (block === 'AM') { tag = "(PM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } else if (block === 'PM') { tag = "(AM)"; f = 0.5; this.blockMap.set(core, 'ALL'); } else { if (needTag) { tag = needTag; f = 0.5; this.blockMap.set(core, needTag === "(AM)" ? 'AM' : 'PM'); } else { tag = ""; f = 1; this.blockMap.set(core, 'ALL'); } }
      current.push(`${core}${tag}`); this.addU(core, f); this.log(`✅ [配置] ${section} に ${core}${tag} ${fallbackMsg}`);
    }
    this.dayCells[section] = join(current);
  }

  processPostTasks() {
    const supportStaffList = split(this.ctx.customRules.supportStaffList || "").map(extractStaffName); const lowPriorityStaff = split(this.ctx.customRules.lateShiftLowPriorityStaff || "").map(extractStaffName);
    this.initialAvailSupport.forEach(staff => { if (this.isUsed(staff)) return; const targets = split(this.ctx.customRules.supportTargetRooms || "2号室,3号室"); let assigned = false; for (const room of targets) { if (this.skipSections.includes(room) || this.isForbidden(staff, room) || room === "透析後胸部") continue; let current = split(this.dayCells[room]); if (current.length > 0 && !current.map(extractStaffName).includes(staff) && !this.hasNGPair(staff, current.map(extractStaffName), false) && !this.isHardNoConsecutive(staff, room)) { const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.dayCells[room] = join([...current, `${staff}${tag}`]); this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL'); assigned = true; break; } } if (!assigned) { for (const room of targets) { if (this.skipSections.includes(room) || this.isForbidden(staff, room) || room === "透析後胸部") continue; let current = split(this.dayCells[room]); if (current.length === 0 && !this.isHardNoConsecutive(staff, room) && this.canAddKenmu(staff, room)) { const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; this.dayCells[room] = `${staff}${tag}`; this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL'); break; } } } });
    
    (this.ctx.customRules.swapRules || []).forEach((rule: any) => {
      const { targetRoom, triggerRoom, sourceRooms } = rule; if (!targetRoom || !triggerRoom || !sourceRooms || targetRoom === "透析後胸部" || triggerRoom === "透析後胸部") return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      const targetAmt = split(this.dayCells[targetRoom]).reduce((sum, m) => sum + getStaffAmount(m), 0);
      if (targetAmt >= targetCap) return;
      const triggerMembers = split(this.dayCells[triggerRoom]); if (triggerMembers.length === 0) return;
      const triggerCanTarget = triggerMembers.some(m => { const c = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(c) || this.isForbidden(c, targetRoom) || this.isHardNoConsecutive(c, targetRoom) || this.isHalfDayBlockedForFullDayRoom(c, targetRoom).hard) return false; return this.canAddKenmu(c, targetRoom, true); });
      if (!triggerCanTarget) {
          const swapSources = split(sourceRooms).sort((a, b) => this.getRescueSourceScore(parseRoomCond(a).r, targetRoom) - this.getRescueSourceScore(parseRoomCond(b).r, targetRoom));
          let swapped = false;
          for (const srcStrRoom of swapSources) {
              const { r: srcRoom } = parseRoomCond(srcStrRoom); if (srcRoom === triggerRoom || srcRoom === "透析後胸部") continue;
              const srcMembers = split(this.dayCells[srcRoom]);
              let srcCands = srcMembers.filter(m => !ROLE_PLACEHOLDERS.includes(extractStaffName(m)) && !this.isForbidden(extractStaffName(m), targetRoom) && !this.isHalfDayBlockedForFullDayRoom(extractStaffName(m), targetRoom).hard && !this.isHardNoConsecutive(extractStaffName(m), targetRoom) && this.canAddKenmu(extractStaffName(m), targetRoom, true) && !this.isForbidden(extractStaffName(m), triggerRoom));
              srcCands.sort((a, b) => this.getTodayRoomCount(extractStaffName(a)) - this.getTodayRoomCount(extractStaffName(b)) || this.getPastRoomCount(extractStaffName(a), targetRoom) - this.getPastRoomCount(extractStaffName(b), targetRoom));
              for (const srcM of srcCands) { const srcCore = extractStaffName(srcM); const targetToKick = triggerMembers.find(m => { const c = extractStaffName(m); return !this.isForbidden(c, srcRoom) && !this.isHalfDayBlockedForFullDayRoom(c, srcRoom).hard && !this.hasNGPair(c, srcMembers.map(extractStaffName), false) && this.canAddKenmu(c, srcRoom, true); }); if (targetToKick && this.canAddKenmu(srcCore, targetRoom, true)) { const kickCore = extractStaffName(targetToKick); this.dayCells[triggerRoom] = join(triggerMembers.map(m => m === targetToKick ? m.replace(kickCore, srcCore) : m)); this.dayCells[srcRoom] = join(srcMembers.map(m => m === srcM ? m.replace(srcCore, kickCore) : m)); this.log(`🔄 [玉突き] ${triggerRoom}の${kickCore}と ${srcRoom}の${srcCore}を交換`); swapped = true; break; } }
              if (swapped) break;
          }
      }
    });

    let uGen1 = this.initialAvailGeneral.filter(s => !this.isUsed(s) && this.blockMap.get(s) !== 'ALL');
    (this.ctx.customRules.linkedRooms || []).forEach((rule: any) => {
      const targetRoom = rule.target; if (!targetRoom || this.skipSections.includes(targetRoom) || targetRoom === "透析後胸部") return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      const effLR = this.getEffectiveTarget(targetRoom, targetCap); if (effLR.allClosed) return;
      let currentMems = split(this.dayCells[targetRoom]); let curAm = 0; let curPm = 0; currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
      const isOnlySupport = currentMems.length > 0 && currentMems.every(m => supportStaffList.includes(extractStaffName(m))); if (isOnlySupport) { curAm = 0; curPm = 0; }
      uGen1.sort((a, b) => this.getTodayRoomCount(a) - this.getTodayRoomCount(b) || this.getPastRoomCount(a, targetRoom) - this.getPastRoomCount(b, targetRoom));
      while ((curAm < targetCap || curPm < targetCap) && uGen1.length > 0) { const candIdx = uGen1.findIndex(s => { if (this.isForbidden(s, targetRoom) || this.isHalfDayBlockedForFullDayRoom(s, targetRoom).hard || this.hasNGPair(s, currentMems.map(extractStaffName), false) || this.isHardNoConsecutive(s, targetRoom) || (targetRoom === "MMG" ? !this.isMmgCapable(s) : false) || !this.canAddKenmu(s, targetRoom)) return false; const b = this.blockMap.get(s); if (curPm >= targetCap && b === 'AM') return false; if (curAm >= targetCap && b === 'PM') return false; return true; }); if (candIdx === -1) break; const staff = uGen1[candIdx]; uGen1.splice(candIdx, 1); const b = this.blockMap.get(staff); let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; if (tag === "") { if (curAm >= targetCap) tag = "(PM)"; else if (curPm >= targetCap) tag = "(AM)"; } this.blockMap.set(staff, tag === "" ? 'ALL' : (tag === "(AM)" ? 'PM' : 'AM')); currentMems.push(`${staff}${tag}`); if (tag==="(AM)") curAm++; else if (tag==="(PM)") curPm++; else { curAm++; curPm++; } this.addU(staff, tag?0.5:1); this.log(`🙌 [負担軽減] 余剰の ${staff} を ${targetRoom} に専任配置`); }
      this.dayCells[targetRoom] = join(currentMems);
    });

    (this.ctx.customRules.smartKenmu || []).forEach((rule: any) => {
      const targetRoom = rule.targetRoom; if (!targetRoom || this.skipSections.includes(targetRoom) || targetRoom === "透析後胸部") return;
      const targetMembers = split(this.dayCells[targetRoom]); if (targetMembers.length === 0) return;
      for (const tM of targetMembers) { const targetCore = extractStaffName(tM); if (ROLE_PLACEHOLDERS.includes(targetCore)) continue; const isDedicated = !ROOM_SECTIONS.some(r => r !== targetRoom && split(this.dayCells[r]).map(extractStaffName).includes(targetCore)); if (isDedicated) { let swapCandidateFullStr: string | null = null; let foundSrcRoom: string | null = null; for (const srcStrRoom of split(rule.sourceRooms)) { const { r: srcRoom, min } = parseRoomCond(srcStrRoom); const srcMembers = split(this.dayCells[srcRoom]); if (srcRoom === "透析後胸部") continue; if (min > 0 && srcMembers.reduce((sum, m) => sum + getStaffAmount(m), 0) < min) continue; if (!this.isForbidden(targetCore, srcRoom) && !this.isHalfDayBlockedForFullDayRoom(targetCore, srcRoom).hard && this.canAddKenmu(targetCore, srcRoom, true)) { let srcCands = srcMembers.filter(m => { const core = extractStaffName(m); return core !== targetCore && !ROLE_PLACEHOLDERS.includes(core) && !this.isForbidden(core, targetRoom) && !this.hasNGPair(core, targetMembers.map(extractStaffName), false) && !this.isHardNoConsecutive(core, targetRoom) && (targetRoom === "MMG" ? this.isMmgCapable(core) : true) && this.canAddKenmu(core, targetRoom); }); srcCands.sort((a, b) => this.getTodayRoomCount(extractStaffName(a)) - this.getTodayRoomCount(extractStaffName(b)) || this.getPastRoomCount(extractStaffName(a), targetRoom) - this.getPastRoomCount(extractStaffName(b), targetRoom)); for (const srcStr of srcCands) { swapCandidateFullStr = srcStr; foundSrcRoom = srcRoom; break; } if (swapCandidateFullStr) break; } } if (swapCandidateFullStr && foundSrcRoom) { const candCore = extractStaffName(swapCandidateFullStr); this.dayCells[foundSrcRoom] = join(split(this.dayCells[foundSrcRoom]).filter(m => m !== swapCandidateFullStr)); let currentTargetTags = tM.includes("(AM)") ? "(AM)" : tM.includes("(PM)") ? "(PM)" : ""; this.dayCells[foundSrcRoom] = join([...split(this.dayCells[foundSrcRoom]), `${targetCore}${currentTargetTags}`]); this.dayCells[targetRoom] = join(targetMembers.map(m => m === tM ? swapCandidateFullStr : m) as string[]); this.addU(candCore, getStaffAmount(swapCandidateFullStr as string)); this.blockMap.set(targetCore, currentTargetTags === "" ? 'ALL' : (currentTargetTags === "(AM)" ? 'PM' : 'AM')); break; } } }
    });

    const processKenmu = (sourceMems: string[], targetMems: string[], targetRoom: string) => { if (targetRoom === "透析後胸部") return targetMems; const targetCap = this.dynamicCapacity[targetRoom] || 1; const targetCores = targetMems.map(extractStaffName); let currentAmount = targetMems.reduce((sum, m) => sum + getStaffAmount(m), 0); for (const m of sourceMems) { if (currentAmount >= targetCap) break; const core = extractStaffName(m); if (targetCores.includes(core) || m.includes("17:") || m.includes("19:") || this.isForbidden(core, targetRoom) || this.isHardNoConsecutive(core, targetRoom) || this.isHalfDayBlockedForFullDayRoom(core, targetRoom).hard || this.hasNGPair(core, targetCores, false) || !this.canAddKenmu(core, targetRoom)) continue; let pushStr = m; let curAm = 0; let curPm = 0; targetMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } }); if (curAm < targetCap && curPm >= targetCap) { if (m.includes("(PM)")) continue; pushStr = `${core}(AM)`; } else if (curAm >= targetCap && curPm < targetCap) { if (m.includes("(AM)")) continue; pushStr = `${core}(PM)`; } targetMems.push(pushStr); targetCores.push(core); const amount = getStaffAmount(pushStr); currentAmount += amount; this.addU(core, amount); this.updateBlockMapAfterKenmu(core, pushStr); } return targetMems; };
    (this.ctx.customRules.kenmuPairs || []).forEach((pair: any) => { if (!pair.s1 || !pair.s2 || pair.s1 === "透析後胸部" || pair.s2 === "透析後胸部") return; let m1 = split(this.dayCells[pair.s1]); let m2 = split(this.dayCells[pair.s2]); this.dayCells[pair.s2] = join(processKenmu(m1, m2, pair.s2)); m2 = split(this.dayCells[pair.s2]); this.dayCells[pair.s1] = join(processKenmu(m2, m1, pair.s1)); });

    (this.ctx.customRules.linkedRooms || []).forEach((rule: any) => {
      const targetRoom = rule.target; if (!targetRoom || this.skipSections.includes(targetRoom) || targetRoom === "透析後胸部") return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      const effLR = this.getEffectiveTarget(targetRoom, targetCap); if (effLR.allClosed) return;
      let currentMems = split(this.dayCells[targetRoom]); let curAm = 0; let curPm = 0; currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } });
      const sourceRooms = split(rule.sources);
      for (const srcStr of sourceRooms) {
        if (curAm >= targetCap && curPm >= targetCap) break; 
        const { r: srcRoom, min } = parseRoomCond(srcStr); if (min > 0 && split(this.dayCells[srcRoom]).reduce((sum, m) => sum + getStaffAmount(m), 0) < min) continue;
        if (srcRoom === "透析後胸部") continue;
        split(this.dayCells[srcRoom]).forEach(m => {
          if (curAm >= targetCap && curPm >= targetCap) return; const core = extractStaffName(m);
          if (!ROLE_PLACEHOLDERS.includes(core) && !currentMems.map(extractStaffName).includes(core) && !this.isForbidden(core, targetRoom) && !this.isHalfDayBlockedForFullDayRoom(core, targetRoom).hard && !this.hasNGPair(core, currentMems.map(extractStaffName), false) && !this.isHardNoConsecutive(core, targetRoom) && (targetRoom === "MMG" ? this.isMmgCapable(core) : true) && this.canAddKenmu(core, targetRoom, true) && !m.includes("17:") && !m.includes("19:")) {
               let pushStr = m;
               if (targetRoom === "パノラマCT" && srcRoom === "透視（6号）") { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; }
               else {
                 if (curAm < targetCap && curPm >= targetCap) { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; }
                 else if (curAm >= targetCap && curPm < targetCap) { if (m.includes("(AM)")) return; pushStr = `${core}(PM)`; }
                 else if (effLR.pmClosed) { if (m.includes("(PM)")) return; pushStr = `${core}(AM)`; }
                 else if (effLR.amClosed) { if (m.includes("(AM)")) return; pushStr = `${core}(PM)`; }
               }
               currentMems.push(pushStr); if (pushStr.includes("(AM)")) curAm += 1; else if (pushStr.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } this.addU(core, getStaffAmount(pushStr)); this.updateBlockMapAfterKenmu(core, pushStr);
               this.log(`🔗 [基本兼務] ${srcRoom} の ${pushStr} を ${targetRoom} にセット配置`);
          }
        });
      }
      this.dayCells[targetRoom] = join(currentMems);
    });

    ROOM_SECTIONS.forEach(targetRoom => {
      if (this.clearSections.includes(targetRoom) || ["待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(targetRoom)) return;
      const targetCap = this.dynamicCapacity[targetRoom] !== undefined ? this.dynamicCapacity[targetRoom] : (["CT", "MRI", "治療"].includes(targetRoom) ? 3 : 1);
      const effResc = this.getEffectiveTarget(targetRoom, targetCap); if (effResc.allClosed) return;
      let currentMems = split(this.dayCells[targetRoom]); let curAm = effResc.amClosed ? 999 : 0; let curPm = effResc.pmClosed ? 999 : 0; currentMems.forEach(x => { if (x.includes("(AM)")) curAm += 1; else if (x.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } }); const isOnlySupport = currentMems.length > 0 && currentMems.every(m => supportStaffList.includes(extractStaffName(m))); if (isOnlySupport) { curAm = effResc.amClosed ? 999 : 0; curPm = effResc.pmClosed ? 999 : 0; } if (curAm >= targetCap && curPm >= targetCap) return;
      const matchingRescueRules = (this.ctx.customRules.rescueRules || []).filter((r: any) => r.targetRoom === targetRoom); let sourceRooms: string[] = []; if (matchingRescueRules.length > 0) { sourceRooms = matchingRescueRules.flatMap((r: any) => split(r.sourceRooms || "")).sort((a: string, b: string) => this.getRescueSourceScore(parseRoomCond(a).r, targetRoom) - this.getRescueSourceScore(parseRoomCond(b).r, targetRoom)); } else { const lowImpact = split(this.ctx.customRules.supportTargetRoomsLowImpact || "3号室,パノラマCT"); sourceRooms = [...lowImpact, "2号室", "1号室", "5号室", "CT(4)"].filter(r => r !== targetRoom); }
      if (sourceRooms.length > 0) { let candidates: { core: string, fullStr: string, srcIdx: number }[] = []; sourceRooms.forEach((srcStr: string, idx: number) => { const { r: srcRoom, min } = parseRoomCond(srcStr); if (srcRoom === targetRoom || srcRoom === "透析後胸部") return; if (min > 0 && split(this.dayCells[srcRoom]).reduce((sum, m) => sum + getStaffAmount(m), 0) < min) return; split(this.dayCells[srcRoom]).forEach(m => { const core = extractStaffName(m); if (!ROLE_PLACEHOLDERS.includes(core) && !this.isHardNoConsecutive(core, targetRoom) && !candidates.some(c => c.core === core) && !this.isForbidden(core, targetRoom) && !this.isHalfDayBlockedForFullDayRoom(core, targetRoom).hard && !m.includes("17:")) candidates.push({ core, fullStr: m, srcIdx: idx }); }); }); const currentCores = currentMems.map(extractStaffName); candidates = candidates.filter(c => !currentCores.includes(c.core) && (targetRoom === "MMG" ? this.isMmgCapable(c.core) : true) && this.canAddKenmu(c.core, targetRoom, true)); candidates.sort((a, b) => { const todayA = this.getTodayRoomCount(a.core); const todayB = this.getTodayRoomCount(b.core); if (todayA !== todayB) return todayA - todayB; const pastA = this.getPastRoomCount(a.core, targetRoom); const pastB = this.getPastRoomCount(b.core, targetRoom); if (pastA !== pastB) return pastA - pastB; if (a.srcIdx !== b.srcIdx) return a.srcIdx - b.srcIdx; return (this.assignCounts[a.core] || 0) - (this.assignCounts[b.core] || 0); }); for (const cand of candidates) { if (curAm >= targetCap && curPm >= targetCap) break; if (this.hasNGPair(cand.core, currentCores, false)) continue; let pushStr = cand.fullStr; if (curAm < targetCap && curPm >= targetCap) { if (cand.fullStr.includes("(PM)")) continue; pushStr = `${cand.core}(AM)`; } else if (curAm >= targetCap && curPm < targetCap) { if (cand.fullStr.includes("(AM)")) continue; pushStr = `${cand.core}(PM)`; } else if (effResc.pmClosed) { if (cand.fullStr.includes("(PM)")) continue; pushStr = `${cand.core}(AM)`; } else if (effResc.amClosed) { if (cand.fullStr.includes("(AM)")) continue; pushStr = `${cand.core}(PM)`; } currentMems.push(pushStr); if (pushStr.includes("(AM)")) curAm += 1; else if (pushStr.includes("(PM)")) curPm += 1; else { curAm += 1; curPm += 1; } this.addU(cand.core, getStaffAmount(pushStr)); this.updateBlockMapAfterKenmu(cand.core, pushStr); } this.dayCells[targetRoom] = join(currentMems); }
    });

    (this.ctx.customRules.emergencies || []).forEach((em: any) => {
      if (em.type !== "empty_room_swap") return;
      const watchRoom = em.section; const sourceRoomList = split(em.sourceRooms || em.sourceRoom || ""); if (!watchRoom || sourceRoomList.length === 0 || this.skipSections.includes(watchRoom) || watchRoom === "透析後胸部") return;
      const watchCap = this.dynamicCapacity[watchRoom] ?? 1; const watchMems = split(this.dayCells[watchRoom]); const watchAmt = watchMems.reduce((s, m) => s + getStaffAmount(m), 0); if (watchAmt >= watchCap) return;
      let swapped = false;
      for (const swapFrom of sourceRoomList) { if (swapped || swapFrom === "透析後胸部") break; const srcMems = split(this.dayCells[swapFrom]); if (srcMems.length === 0) continue; const ngInSrc = srcMems.filter(m => { const c = extractStaffName(m); return !ROLE_PLACEHOLDERS.includes(c) && (this.isForbidden(c, watchRoom) || !this.canAddKenmu(c, watchRoom, true)); }); if (ngInSrc.length === 0) continue; const allRooms = ROOM_SECTIONS.filter(r => r !== watchRoom && r !== swapFrom && !this.skipSections.includes(r) && !["待機","昼当番","受付","受付ヘルプ","透析後胸部"].includes(r)); for (const srcRoom of allRooms) { if (swapped) break; const roomMems = split(this.dayCells[srcRoom]); const okCands = roomMems.filter(m => { const c = extractStaffName(m); if (ROLE_PLACEHOLDERS.includes(c) || this.isForbidden(c, watchRoom) || this.isForbidden(c, swapFrom) || this.isHalfDayBlockedForFullDayRoom(c, watchRoom).hard || this.isHardNoConsecutive(c, watchRoom) || !this.canAddKenmu(c, watchRoom, true) || m.includes("17:") || m.includes("19:")) return false; return true; }); for (const okM of okCands) { const okCore = extractStaffName(okM); const kickM = ngInSrc.find(m => { const c = extractStaffName(m); return !this.isForbidden(c, srcRoom) && !this.isHalfDayBlockedForFullDayRoom(c, srcRoom).hard && !this.hasNGPair(c, roomMems.map(extractStaffName), false) && this.canAddKenmu(c, srcRoom, true); }); if (!kickM) continue; const kickCore = extractStaffName(kickM); this.dayCells[swapFrom] = join(srcMems.map(m => m === kickM ? m.replace(kickCore, okCore) : m)); this.dayCells[srcRoom] = join(roomMems.map(m => m === okM ? m.replace(okCore, kickCore) : m)); swapped = true; break; } } }
    });

    (this.ctx.customRules.lateShifts || []).forEach((rule: any) => {
      let current = split(this.dayCells[rule.section]); if (current.length > 0 && !current.some(m => m.includes("17:") || m.includes("18:"))) { const currentCore = current.map(extractStaffName); const prevLateStaff = this.prevDay ? split(this.prevDay.cells[rule.section] || "").filter((m: string) => m.includes("17:") || m.includes("18:") || m.includes("19:") || m.includes("22:")).map(extractStaffName) : []; const excludeStaff = Array.from(new Set([...split(this.ctx.customRules.noLateShiftStaff || "").map(extractStaffName), ...split(this.ctx.customRules.noLateShiftRooms || "").flatMap(r => split(this.dayCells[r] || "").map(extractStaffName))])); const fuzaiMems = split(this.dayCells["不在"]); const candidates = this.initialAvailGeneral.filter(n => !currentCore.includes(n) && !this.isForbidden(n, rule.section) && !excludeStaff.includes(n) && !fuzaiMems.some(m => extractStaffName(m) === n)); candidates.sort((a, b) => { let sA = this.getPastLateShiftCount(a) * 100; let sB = this.getPastLateShiftCount(b) * 100; const idxA = lowPriorityStaff.indexOf(a); const idxB = lowPriorityStaff.indexOf(b); if (idxA !== -1) sA += 100000 + ((lowPriorityStaff.length - idxA) * 10000); if (idxB !== -1) sB += 100000 + ((lowPriorityStaff.length - idxB) * 10000); if (sA !== sB) return sA - sB; return a.localeCompare(b, 'ja'); }); let picked = candidates.find(n => !prevLateStaff.includes(n)); if (!picked && candidates.length > 0) picked = candidates[0]; if (picked) { current.push(`${picked}${rule.lateTime}`); this.blockMap.set(picked, this.blockMap.get(picked) === 'AM' ? 'ALL' : 'PM'); this.dayCells[rule.section] = join(current); } }
    });

    // ★修正：ポータブル特例（AM/PMの正確な時間判定と、2名以上いる時の無効化）
    const portableMembers = split(this.dayCells["ポータブル"]); 
    const room2Members = split(this.dayCells["2号室"]); 
    const room2Cores = room2Members.map(extractStaffName);
    const room2ActualAmt = room2Members.reduce((sum, m) => sum + (ROLE_PLACEHOLDERS.includes(extractStaffName(m)) ? 0 : getStaffAmount(m)), 0);

    let needAmHelp = false; let needPmHelp = false;
    room2Members.forEach(r2m => {
      const r2Core = extractStaffName(r2m);
      const portMem = portableMembers.find(pm => extractStaffName(pm) === r2Core);
      if (portMem) {
        if (portMem.includes("(AM)")) needAmHelp = true;
        else if (portMem.includes("(PM)")) needPmHelp = true;
        else { needAmHelp = true; needPmHelp = true; }
      }
    });

    if (room2ActualAmt < 2 && (needAmHelp || needPmHelp)) {
      const findCand = (isAm: boolean, ex: string[]) => [...supportStaffList, ...this.initialAvailGeneral].filter((s,i,a)=>a.indexOf(s)===i).find(s => {
        if (room2Cores.includes(s) || this.isForbidden(s,"2号室") || this.isHalfDayBlockedForFullDayRoom(s,"2号室").hard || this.hasNGPair(s,room2Cores,false) || !this.canAddKenmu(s,"2号室") || this.isHardNoConsecutive(s,"2号室")) return false;
        const b = this.blockMap.get(s); if (b === 'ALL') return false; if (isAm && b === 'AM') return false; if (!isAm && b === 'PM') return false;
        if (ex.some(r=>split(this.dayCells[r]).map(extractStaffName).includes(s))) return false;
        return true;
      });
      if (needAmHelp) {
        let p = findCand(true, ["1号室", "5号室"]) ?? findCand(true, []);
        if(p){ this.dayCells["2号室"]=join([...split(this.dayCells["2号室"]),`${p}(AM)`]); this.addU(p,0.5); this.blockMap.set(p, this.blockMap.get(p)==='PM'?'ALL':'AM'); this.log(`🤝 [ポータブル特例] 2号室のポータブル兼務(AM)のため ${p} を追加`); }
      }
      if (needPmHelp) {
        let p = findCand(false, ["1号室", "5号室"]) ?? findCand(false, []);
        if(p){ this.dayCells["2号室"]=join([...split(this.dayCells["2号室"]),`${p}(PM)`]); this.addU(p,0.5); this.blockMap.set(p, this.blockMap.get(p)==='AM'?'ALL':'PM'); this.log(`🤝 [ポータブル特例] 2号室のポータブル兼務(PM)のため ${p} を追加`); }
      }
    }

    const priorityList = this.ctx.customRules.priorityRooms || DEFAULT_PRIORITY_ROOMS;
    const deKenmuTargets = ROOM_SECTIONS.filter(r => !["CT", "MRI", "治療", "RI", "待機", "昼当番", "受付", "受付ヘルプ", "透析後胸部"].includes(r)); 
    // ★修正：優先度が【低い部屋】から先に兼務解消を試みる（骨塩を外して検像を残すため）
    deKenmuTargets.sort((a, b) => { let idxA = priorityList.indexOf(a); if (idxA === -1) idxA = 999; let idxB = priorityList.indexOf(b); if (idxB === -1) idxB = 999; return idxB - idxA; });
    const reversePriority = [...ROOM_SECTIONS].sort((a, b) => { let idxA = priorityList.indexOf(a); if (idxA === -1) idxA = 999; let idxB = priorityList.indexOf(b); if (idxB === -1) idxB = 999; return idxB - idxA; });
    
    let uGen2 = this.initialAvailGeneral.filter(s => !this.isUsed(s) && this.blockMap.get(s) !== 'ALL');
    uGen2.forEach(staff => {
      const b = this.blockMap.get(staff); if (b === 'ALL') return; let tag = b==='AM'?"(PM)":b==='PM'?"(AM)":""; let assigned = false;
      for (const room of deKenmuTargets) {
        if (this.skipSections.includes(room) || this.isForbidden(staff, room) || (room === "MMG" && !this.isMmgCapable(staff))) continue; if (tag !== "" && this.isHalfDayBlockedForFullDayRoom(staff, room).hard) continue; const effD = this.getEffectiveTarget(room, 1); if (effD.allClosed || (tag === "(PM)" && effD.pmClosed) || (tag === "(AM)" && effD.amClosed)) continue;
        let currentMems = split(this.dayCells[room]);
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
          const oldStr = currentMems[repIdx]; const oldCore = extractStaffName(oldStr); 
          let oldRemain = "";
          if (tag === "(AM)" && !oldStr.includes("(")) oldRemain = `${oldCore}(PM)`;
          else if (tag === "(PM)" && !oldStr.includes("(")) oldRemain = `${oldCore}(AM)`;
          
          currentMems[repIdx] = `${staff}${tag}`;
          if (oldRemain) currentMems.push(oldRemain);
          
          this.dayCells[room] = join(currentMems); this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL'); this.assignCounts[oldCore] = Math.max(0, (this.assignCounts[oldCore] || 1) - getStaffAmount(oldStr)); let am = false; let pm = false; ROOM_SECTIONS.forEach(r => { if (r === "待機" || r === "昼当番" || r === "受付" || r === "受付ヘルプ") return; split(this.dayCells[r]).forEach(m => { if (extractStaffName(m) === oldCore) { if (m.includes("(AM)")) am = true; else if (m.includes("(PM)")) pm = true; else { am = true; pm = true; } } }); }); if (am && pm) this.blockMap.set(oldCore, 'ALL'); else if (am) this.blockMap.set(oldCore, 'AM'); else if (pm) this.blockMap.set(oldCore, 'PM'); else this.blockMap.set(oldCore, 'NONE'); this.log(`🪄 [兼務解消] ${staff} を専任化し ${oldCore} の負担軽減`); assigned = true; break;
        }
      }
      if (!assigned) { 
        for (const room of reversePriority) { 
           if (this.skipSections.includes(room) || this.isForbidden(staff, room) || (room === "MMG" && !this.isMmgCapable(staff))) continue; 
           if (["待機", "昼当番", "受付", "受付ヘルプ", "CT", "MRI", "治療", "RI", "透析後胸部"].includes(room)) continue; 
           if (tag !== "" && this.isHalfDayBlockedForFullDayRoom(staff, room).hard) continue; 
           
           // ★ 修正：余剰配置の定員チェック（定員オーバーなら押し込まない）
           const actualCap = this.dynamicCapacity[room] ?? (["CT", "MRI", "治療"].includes(room) ? 3 : 1);
           const effR = this.getEffectiveTarget(room, actualCap); 
           if (effR.allClosed || (tag === "(PM)" && effR.pmClosed) || (tag === "(AM)" && effR.amClosed) || !this.canAddKenmu(staff, room) || this.isHardNoConsecutive(staff, room)) continue; 
           
           let currentMems = split(this.dayCells[room]); 
           let curAmt = currentMems.reduce((sum, m) => sum + getStaffAmount(m), 0);
           if (curAmt >= effR.cap) continue; // 定員を満たしている場合は追加しない

           if (this.hasNGPair(staff, currentMems.map(extractStaffName), false)) continue; 
           this.dayCells[room] = join([...currentMems, `${staff}${tag}`]); this.addU(staff, tag?0.5:1); this.blockMap.set(staff, 'ALL'); this.log(`♻️ [余剰配置] 余力のあった ${staff} を ${room} に追加配置`); assigned = true; break; 
        } 
      }
// ----------------- 後半コード ここから -----------------

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
      if (sec === "不在" || sec === "待機" || sec === "昼当番" || sec === "受付" || sec === "受付ヘルプ") return;
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
    Object.entries(staffMap).forEach(([staff, rms]) => { const limit = customRules.alertMaxKenmu || 3; const dayCount = rms.filter(r => { const m = split(cells[r]).find(x => extractStaffName(x) === staff); return m && !m.includes("17:") && !m.includes("18:") && !m.includes("19:") && !m.includes("22:"); }).length; if(dayCount >= limit) w.push({ level: 'orange', title: '兼務限界', staff, msg: `${staff}さんが日中 ${dayCount}部屋を担当中` }); }); 
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
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: 26, fontWeight: 900 }}>勤務割付システム Ver 2.91</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(highlightedStaff || hoveredStaff) && (
            <div style={{ background: "#2563eb", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px rgba(37,99,235,0.3)" }}>
              <span>✨ {highlightedStaff || hoveredStaff} さんをハイライト中</span>
              {highlightedStaff && <button onClick={() => setHighlightedStaff(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold", fontSize: "18px", padding: 0 }}>✖</button>}
            </div>
          )}
          <button className="btn-hover" onClick={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()-7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={{...btnStyle("#f1f5f9", "#475569"), border:"1px solid #cbd5e1"}}>◀ 先週</button>
          <WeekCalendarPicker targetMonday={targetMonday} onChange={setTargetMonday} nationalHolidays={nationalHolidays} customHolidays={customHolidays} />
          <button className="btn-hover" onClick={() => setTargetMonday(prev => { const d=new Date(prev); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; })} style={{...btnStyle("#f1f5f9", "#475569"), border:"1px solid #cbd5e1"}}>来週 ▶</button>
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
                                const isOverLimit = roomCount > limit; // ★上限を超えたときだけ警告

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
                <button className="btn-hover" onClick={() => setShowRuleModal(true)} style={{...btnStyle("#f8fafc", "#475569"), border: "1px solid #cbd5e1"}}>📖 システムのルール</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(false, false)} style={btnStyle("#10b981")}>✨ 1日自動割当</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(false, true)} style={btnStyle("#0ea5e9")}>⚡ 週間自動割当</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(true, false)} style={btnStyle("#f59e0b")}>🔄 欠員補充(1日)</button>
                <button className="btn-hover" onClick={() => handleAutoAssign(true, true)} style={btnStyle("#d97706")}>🔄 欠員補充(週間)</button>
                <button className="btn-hover" onClick={handleCopyYesterday} style={{ ...btnStyle("#f8fafc", "#475569"), border: "1px solid #cbd5e1" }} disabled={cur.isPublicHoliday}>📋 昨日をコピー</button>
                <button className="btn-hover" onClick={handleUndo} disabled={history.length === 0} style={{...btnStyle(history.length === 0 ? "#cbd5e1" : "#8b5cf6")}}>↩️ 戻る</button>
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
             {RENDER_GROUPS.map((group: RenderGroup) => (
               <div key={group.title} style={{ gridColumn: "1 / -1" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #e2e8f0" }}>
                   <h4 style={{ fontSize: 21, fontWeight: 900, borderLeft: `6px solid ${group.color}`, paddingLeft: 12, margin: 0 }}>{group.title}</h4>
                   {group.title === "休務・夜勤" || group.title === "待機・その他" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <button onClick={() => handleClearGroupDay(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 1日クリア</button>
                        <button onClick={() => handleClearGroupWeek(group.title, group.sections)} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 週間クリア</button>
                      </div>
                    ) : group.title === "モダリティ" || group.title === "一般撮影・透視・その他" ? (
                      <div style={{display: "flex", gap: 8}}>
                        <button onClick={handleClearWorkDay} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務1日クリア</button>
                        <button onClick={handleClearWorkWeek} className="btn-hover" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 15, cursor: "pointer", color: "#64748b", fontWeight: 700 }}>🧹 業務週間クリア</button>
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
              <thead>
                <tr>
                  <th style={{ position: "sticky", left: 0, top: 0, background: "#f8fafc", zIndex: 30, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", color: "#1e293b", fontWeight: 900 }}>スタッフ</th>
                  {ROOM_SECTIONS.map(r => <th key={r} style={{ position: "sticky", top: 0, zIndex: 20, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", background: "#f8fafc", fontWeight: 900 }}>{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {allStaff.filter(s => activeGeneralStaff.includes(s)).map((staff, sIdx) => {
                  const isZebra = sIdx % 2 === 1; const rowBg = isZebra ? "#f1f5f9" : "#ffffff";
                  return (
                    <tr key={staff} className="calendar-row">
                      <td onClick={() => setSelectedStaffForStats(staff)} style={{ position: "sticky", left: 0, background: rowBg, zIndex: 10, padding: 12, borderRight: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", fontWeight: 900, textAlign: "left", cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}>{staff}</td>
                      {ROOM_SECTIONS.map(r => {
                        const stat = monthlyMatrixStats[staff]?.[r] || { total: 0, late: 0 };
                        let bg = rowBg; let color = "#334155";
                        if (["CT", "MRI"].includes(r)) { if (stat.total > 0) { bg = `rgba(59, 130, 246, ${Math.min(0.1 + stat.total * 0.15, 0.9)})`; if(stat.total >= 3) color = "#fff"; } else if (isMonthlyMainStaff(r, staff, monthlyAssign)) bg = "#fef08a"; }
                        return (
                          <td key={r} style={{ padding: 10, background: bg, color: color, fontWeight: stat.total > 0 ? 900 : 500, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                              {stat.total > 0 ? <span style={{fontSize:17}}>{stat.total}</span> : <span style={{ width: "16px" }}></span>}
                              {stat.late > 0 && <span style={{ fontSize: "13px", background: "#fef08a", color: "#b45309", padding: "2px 6px", borderRadius: "6px", border: "1px solid #fde047" }}>遅{stat.late}</span>}
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

          {/* ===================== フェーズ1 ===================== */}
          <div style={{ borderLeft: "8px solid #94a3b8", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 23, fontWeight: 900, color: "#475569", marginBottom: 20, borderBottom: "2px solid #cbd5e1", paddingBottom: 10 }}>フェーズ1：前提・固定ルール（最優先）</h4>
            
            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🙅" title="担当不可ルール">
              {(customRules.forbidden || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                    <div className="rule-row">
                      <select value={rule.staff} onChange={(e: any) => updateRule("forbidden", idx, "staff", e.target.value)} className="rule-sel"><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <button onClick={() => removeRule("forbidden", idx)} className="rule-del">✖</button>
                    </div>
                    <MultiPicker selected={rule.sections} onChange={(v: string) => updateRule("forbidden", idx, "sections", v)} options={ASSIGNABLE_SECTIONS} />
                  </div>
              ))}
              <button className="rule-add" style={{color:"#475569", borderColor:"#cbd5e1"}} onClick={() => addRule("forbidden", { staff: "", sections: "" })}>＋ 追加</button>
            </RuleCard>

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🔒" title="専従ルール">
              {(customRules.fixed || []).map((rule: any, idx: number) => (
                  <div className="rule-row" key={idx}>
                    <select value={rule.staff} onChange={(e: any) => updateRule("fixed", idx, "staff", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.section} onChange={(e: any) => updateRule("fixed", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#86efac"}}><option value="">選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <button onClick={() => removeRule("fixed", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#15803d", borderColor:"#86efac"}} onClick={() => addRule("fixed", { staff: "", section: "" })}>＋ 追加</button>
            </RuleCard>

            <RuleCard bg="#fef2f2" border="#fecaca" color="#b91c1c" icon="🚫" title="NGペア">
              {(customRules.ngPairs || []).map((rule: any, idx: number) => (
                  <div className="rule-row" key={idx}>
                    <select value={rule.s1} onChange={(e: any) => updateRule("ngPairs", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span className="rule-label">と</span>
                    <select value={rule.s2} onChange={(e: any) => updateRule("ngPairs", idx, "s2", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5"}}><option value="">選択</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select value={rule.level || "hard"} onChange={(e: any) => updateRule("ngPairs", idx, "level", e.target.value)} className="rule-sel" style={{borderColor:"#fca5a5", color:"#b91c1c", flex:"0 0 auto", minWidth:"120px"}}><option value="hard">絶対NG</option><option value="soft">なるべくNG</option></select>
                    <button onClick={() => removeRule("ngPairs", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#b91c1c", borderColor:"#fca5a5"}} onClick={() => addRule("ngPairs", { s1: "", s2: "", level: "hard" })}>＋ NGペアを追加</button>
            </RuleCard>

            <RuleCard bg="#f8fafc" border="#cbd5e1" color="#334155" icon="🕒" title="終日専任・連日禁止">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【終日専任】半休・AM/PM不可の部屋</label>
                  <MultiPicker selected={customRules.fullDayOnlyRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, fullDayOnlyRooms: v})} options={ROOM_SECTIONS} />
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <label style={{ fontSize: 17, fontWeight: 800, color: "#475569", display: "block", marginBottom: 8 }}>【連日禁止】2日連続で担当させない部屋</label>
                  <MultiPicker selected={customRules.noConsecutiveRooms ?? ""} onChange={(v: string) => setCustomRules({...customRules, noConsecutiveRooms: v})} options={ROOM_SECTIONS} />
                </div>
              </div>
            </RuleCard>

            <RuleCard bg="#fdf4ff" border="#f5d0fe" color="#86198f" icon="🏠" title="遅番不可スタッフ・部屋">
              <label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>遅番不可スタッフ</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center", marginBottom: 16 }}>
                <MultiPicker selected={customRules.noLateShiftStaff || ""} onChange={(v: string) => setCustomRules({...customRules, noLateShiftStaff: v})} options={allStaff} placeholder="＋スタッフを選択" />
              </div>
              <label style={{ fontSize: 17, fontWeight: 800, color: "#86198f", display: "block", marginBottom: 8 }}>その日その部屋に入っている人も遅番除外</label>
              <div style={{ background: "#fff", padding: "12px", borderRadius: 8, border: "2px solid #f0abfc", minHeight: "56px", display: "flex", alignItems: "center" }}>
                <MultiPicker selected={customRules.noLateShiftRooms || ""} onChange={(v: string) => setCustomRules({...customRules, noLateShiftRooms: v})} options={ROOM_SECTIONS} placeholder="＋部屋を選択" />
              </div>
            </RuleCard>
          </div>

          {/* ===================== フェーズ2 ===================== */}
          <div style={{ borderLeft: "8px solid #f59e0b", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#b45309", marginBottom: 20, borderBottom: "2px solid #fcd34d", paddingBottom: 10 }}>フェーズ2：例外・代打処理</h4>
            
            <RuleCard bg="#fef08a" border="#fde047" color="#a16207" icon="🚨" title="緊急ルール（人数不足時）">
              <div style={{ marginBottom: 16, padding: "12px", background: "#fef8f8", borderRadius: "8px", border: "1px dashed #fca5a5", color: "#991b1b", fontSize: "16px", fontWeight: "600" }}>💡 <b>「左側（発動条件）」から「右側（アクション）」へ</b> 流れるようにルールを設定します。</div>
              {(customRules.emergencies || []).map((em: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ flex: '1 1 350px', display: 'flex', gap: '8px', alignItems: 'center', borderRight: '2px dashed #cbd5e1', paddingRight: '16px' }}>
                      <span style={{fontWeight: 800, color: '#ef4444', flexShrink: 0}}>【条件】</span>
                      <select className="rule-sel" value={em.type} onChange={(e:any) => updateRule("emergencies", idx, "type", e.target.value)}>
                        <option value="change_capacity">出勤人数が指定以下の場合</option>
                        <option value="staff_assign">出勤人数が指定以下の場合（強制配置）</option>
                        <option value="role_assign">出勤人数が指定以下の場合（月間担当）</option>
                        <option value="clear">出勤人数が指定以下の場合（部屋閉鎖）</option>
                        <option value="empty_room_swap">指定の部屋が空室の場合</option>
                      </select>
                      {em.type !== 'empty_room_swap' && <><input type="number" className="rule-num" value={em.threshold || 0} onChange={(e:any)=>updateRule("emergencies", idx, "threshold", Number(e.target.value))} />人以下</>}
                      {em.type === 'empty_room_swap' && <><select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">監視する部屋</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> が空室</>}
                    </div>
                    <div style={{ flex: '1 1 400px', display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '8px' }}>
                       <span style={{fontWeight: 800, color: '#3b82f6', flexShrink: 0}}>➔【アクション】</span>
                       {em.type === 'change_capacity' && <><select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">対象部屋</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> の定員を <input type="number" className="rule-num" value={em.newCapacity||1} onChange={(e:any)=>updateRule("emergencies", idx, "newCapacity", Number(e.target.value))} /> 名にする</>}
                       {em.type === 'staff_assign' && <><select className="rule-sel" value={em.staff} onChange={(e:any)=>updateRule("emergencies", idx, "staff", e.target.value)}><option value="">スタッフ</option>{activeGeneralStaff.map(s=><option key={s} value={s}>{s}</option>)}</select> を <select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">配置先</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> に配置</>}
                       {em.type === 'role_assign' && <><select className="rule-sel" value={em.role} onChange={(e:any)=>updateRule("emergencies", idx, "role", e.target.value)}><option value="">月間設定</option>{MONTHLY_CATEGORIES.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select> を <select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">配置先</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> に配置</>}
                       {em.type === 'clear' && <><select className="rule-sel" value={em.section} onChange={(e:any)=>updateRule("emergencies", idx, "section", e.target.value)}><option value="">閉鎖する部屋</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> を無人にする</>}
                       {em.type === 'empty_room_swap' && <><select className="rule-sel" value={em.sourceRooms} onChange={(e:any)=>updateRule("emergencies", idx, "sourceRooms", e.target.value)}><option value="">補充元の部屋(優先順)</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select> から強制補充</>}
                    </div>
                    <button onClick={() => removeRule("emergencies", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#a16207", borderColor:"#ca8a04"}} onClick={() => addRule("emergencies", { type: "change_capacity", threshold: 16, section: "CT", newCapacity: 3 })}>＋ 緊急ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#f0fdf4" border="#bbf7d0" color="#15803d" icon="🔄" title="メイン配置の交換ルール" desc="※ 兼務に行けないスタッフを、別部屋の兼務に行けるスタッフと丸ごと入れ替えます。">
              {(customRules.swapRules || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "2px solid #bbf7d0", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>[</span>
                      <select value={rule.targetRoom} onChange={(e: any) => updateRule("swapRules", idx, "targetRoom", e.target.value)} className="rule-sel" style={{borderColor:"#86efac", fontSize: 17}}><option value="">兼務先</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>] に [</span>
                      <select value={rule.triggerRoom} onChange={(e: any) => updateRule("swapRules", idx, "triggerRoom", e.target.value)} className="rule-sel" style={{borderColor:"#86efac", fontSize: 17}}><option value="">メイン部屋</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#15803d", fontSize: 17}}>] の担当者が誰も入れない時➔</span>
                      <button onClick={() => removeRule("swapRules", idx)} className="rule-del">✖</button>
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
                    <select value={rule.section} onChange={(e: any) => updateRule("substitutes", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#fed7aa", color: "#c2410c", flex: "0 0 140px"}}><option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#c2410c" }}>に優先</span>
                    <button onClick={() => removeRule("substitutes", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#c2410c", borderColor:"#fdba74"}} onClick={() => addRule("substitutes", { target: "", subs: "", section: "" })}>＋ 代打ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#e0f2fe" border="#bae6fd" color="#0369a1" icon="🎱" title="玉突きルール">
              {(customRules.pushOuts || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 20, borderBottom: "1px solid #bae6fd", paddingBottom: 20 }}>
                    <div className="rule-row">
                      <select value={rule.s1 || rule.triggerStaff} onChange={(e: any) => updateRule("pushOuts", idx, "s1", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>と</span>
                      <select value={rule.s2 || rule.targetStaff} onChange={(e: any) => updateRule("pushOuts", idx, "s2", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">誰</option>{activeGeneralStaff.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>が同じ</span>
                      <select value={rule.triggerSection} onChange={(e: any) => updateRule("pushOuts", idx, "triggerSection", e.target.value)} className="rule-sel" style={{borderColor:"#93c5fd"}}><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <span className="rule-label" style={{color:"#0284c7"}}>になる時➔ 後者を</span>
                      <button onClick={() => removeRule("pushOuts", idx)} className="rule-del">✖</button>
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

          {/* ===================== フェーズ3 ===================== */}
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
                    <input type="number" value={count as number} onChange={e => setCustomRules({...customRules, capacity: {...customRules.capacity, [room]: Number(e.target.value)}})} style={{ width: 60, border: "none", fontSize: 21, textAlign: "center", fontWeight: 800 }} />
                    <span style={{fontSize: 17}}>人</span>
                    <span onClick={() => { const n={...customRules.capacity}; delete n[room]; setCustomRules({...customRules, capacity:n}); }} style={{ cursor: "pointer", color: "#ef4444", marginLeft: 8, fontSize: 21 }}>✖</span>
                  </div>
                ))}
                <select onChange={(e: any) => { if(e.target.value) setCustomRules({...customRules, capacity: {...customRules.capacity, [e.target.value]: 1}}); e.target.value=""; }} className="rule-sel" style={{flex:"none", width:180}}><option value="">＋部屋追加</option>{ROOM_SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select>
              </div>
            </RuleCard>

            <RuleCard bg="#fff" border="#e2e8f0" color="#334155" icon="📅" title="月間担当者の設定">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {MONTHLY_CATEGORIES.map(({ key, label }) => {
                  const opts = key === "受付ヘルプ" ? GENERAL_ROOMS : [];
                  return (
                    <SectionEditor key={key} section={label} value={monthlyAssign[key] || ""} activeStaff={key === "受付" ? activeReceptionStaff : allStaff} onChange={(v: string) => updateMonthly(key, v)} noTime={true} customOptions={opts} />
                  );
                })}
              </div>
            </RuleCard>
          </div>

          {/* ===================== フェーズ4 ===================== */}
          <div style={{ borderLeft: "8px solid #10b981", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#047857", marginBottom: 20, borderBottom: "2px solid #a7f3d0", paddingBottom: 10 }}>フェーズ4：兼務・救済・遅番</h4>
            
            <RuleCard bg="#fdf4ff" border="#f5d0fe" color="#86198f" icon="✨" title="スマート兼務（専任担当の負担軽減・引き抜き）" desc="※ 指定した部屋の専任担当者をフリーにし、他部屋から兼務で引き抜きます。">
              {(customRules.smartKenmu || []).map((rule: any, idx: number) => (
                  <div key={idx} style={{ background: "#fff", padding: "16px 20px", border: "1px solid #f0abfc", borderRadius: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#86198f" }}>[</span>
                        <select value={rule.targetRoom} onChange={(e: any) => updateRule("smartKenmu", idx, "targetRoom", e.target.value)} className="rule-sel" style={{ borderColor: "#f0abfc", minWidth: 160, padding: "8px 24px 8px 10px" }}>
                          <option value="">専任を外す部屋</option>
                          {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#86198f" }}>] を、以下の担当者に兼務させる（※左から優先）:</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 6 }}>
                        <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("smartKenmu", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                      </div>
                    </div>
                    <button onClick={() => removeRule("smartKenmu", idx)} className="rule-del" style={{ marginTop: 4 }}>✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{ color: "#86198f", borderColor: "#f0abfc" }} onClick={() => addRule("smartKenmu", { targetRoom: "MMG", sourceRooms: "1号室、2号室、3号室、5号室、CT(4)" })}>＋ スマート兼務ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#ecfdf5" border="#a7f3d0" color="#065f46" icon="🔗" title="兼務・セット配置ルール">
              <h6 style={{ fontSize: 17, color: "#047857", marginTop: 0, marginBottom: 12 }}>■ 常時兼務ペア</h6>
              {(customRules.kenmuPairs || []).map((rule: any, idx: number) => (
                <div key={idx} className="rule-row" style={{ background: "#fff", padding: "12px 16px", border: "1px solid #a7f3d0", borderRadius: 8 }}>
                  <select value={rule.s1} onChange={(e: any) => updateRule("kenmuPairs", idx, "s1", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7" }}><option value="">部屋を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <span className="rule-label" style={{ color: "#065f46" }}>←→</span>
                  <select value={rule.s2} onChange={(e: any) => updateRule("kenmuPairs", idx, "s2", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7" }}><option value="">部屋を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16, fontSize: 16, color: "#047857", fontWeight: 700, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!rule.isExclusive} onChange={(e) => updateRule("kenmuPairs", idx, "isExclusive", e.target.checked)} style={{ width: 22, height: 22, cursor: "pointer" }} />
                    このペアに専念させる（他の部屋の兼務禁止）
                  </label>
                  <button onClick={() => removeRule("kenmuPairs", idx)} className="rule-del">✖</button>
                </div>
              ))}
              <button className="rule-add" style={{ color: "#065f46", borderColor: "#6ee7b7" }} onClick={() => addRule("kenmuPairs", { s1: "", s2: "" })}>＋ ペアを追加</button>

              <h6 style={{ fontSize: 17, color: "#047857", marginTop: 32, marginBottom: 12 }}>■ 基本兼務（セット配置）<br/><span style={{fontSize: 15, color: "#065f46", fontWeight: "normal", marginLeft: 12}}>※ 引抜元が定員を満たしている場合のみ発動します。</span></h6>
              {(customRules.linkedRooms || []).map((rule: any, idx: number, arr: any[]) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px 24px", border: "1px solid #a7f3d0", borderRadius: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>[</span>
                        <select value={rule.target} onChange={(e: any) => updateRule("linkedRooms", idx, "target", e.target.value)} className="rule-sel" style={{ borderColor: "#6ee7b7", minWidth: 160, padding: "10px 24px 10px 10px" }}>
                          <option value="">兼務専用にする部屋</option>
                          {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>] には専任を置かず、[</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }}>
                        <MultiPicker selected={rule.sources} onChange={(v: string) => updateRule("linkedRooms", idx, "sources", v)} options={EXTENDED_ROOM_SECTIONS} />
                      </div>
                      <span style={{ fontSize: 17, fontWeight: 800, color: "#065f46" }}>] の担当者をセットで配置する（※左から優先）</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === 0} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#065f46" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, linkedRooms: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#d1fae5", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#065f46" }}>▼</button>
                      <button onClick={() => removeRule("linkedRooms", idx)} className="rule-del" style={{ marginTop: 6 }}>✖</button>
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
                        <select value={rule.targetRoom} onChange={(e: any) => updateRule("rescueRules", idx, "targetRoom", e.target.value)} className="rule-sel" style={{ borderColor: "#fef08a", minWidth: 160, padding: "10px 24px 10px 10px" }}>
                          <option value="">（空室の部屋）</option>
                          {ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize: 17, fontWeight: 800, color: "#854d0e" }}>が不足なら ➔ 以下の部屋から兼務を探す（※左から優先）</span>
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 10 }}>
                        <MultiPicker selected={rule.sourceRooms} onChange={(v: string) => updateRule("rescueRules", idx, "sourceRooms", v)} options={EXTENDED_ROOM_SECTIONS} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <button onClick={() => { const n = [...arr]; [n[idx-1], n[idx]] = [n[idx], n[idx-1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === 0} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#a16207" }}>▲</button>
                      <button onClick={() => { const n = [...arr]; [n[idx+1], n[idx]] = [n[idx], n[idx+1]]; setCustomRules({...customRules, rescueRules: n}); }} disabled={idx === arr.length - 1} style={{ border: "none", background: "#fef08a", borderRadius: 6, padding: "8px 12px", fontSize: 17, color: "#a16207" }}>▼</button>
                      <button onClick={() => removeRule("rescueRules", idx)} className="rule-del" style={{ marginTop: 6 }}>✖</button>
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
                    <select value={rule.section} onChange={(e: any) => updateRule("lateShifts", idx, "section", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "140px", flex: "1 1 auto"}}><option value="">場所を選択</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>に</span>
                    <select value={rule.lateTime} onChange={(e: any) => updateRule("lateShifts", idx, "lateTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">遅番の時間</option>{TIME_OPTIONS.filter(t => t.includes("〜)")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>の担当を追加する（日勤は</span>
                    <select value={rule.dayEndTime} onChange={(e: any) => updateRule("lateShifts", idx, "dayEndTime", e.target.value)} className="rule-sel" style={{borderColor:"#ddd6fe", minWidth: "160px", flex: "1 1 auto"}}><option value="">終了時間</option>{TIME_OPTIONS.filter(t => t.includes("(〜")).map(t => <option key={t} value={t}>{t.replace(/[()]/g, '')}</option>)}</select>
                    <span className="rule-label" style={{color:"#6d28d9"}}>とする）</span>
                    <button onClick={() => removeRule("lateShifts", idx)} className="rule-del">✖</button>
                  </div>
              ))}
              <button className="rule-add" style={{color:"#6d28d9", borderColor:"#c4b5fd"}} onClick={() => addRule("lateShifts", { section: "", lateTime: "(17:00〜)", dayEndTime: "(〜17:00)" })}>＋ 遅番ルールを追加</button>
            </RuleCard>

            <RuleCard bg="#fff1f2" border="#fecaca" color="#be185d" icon="⚠️" title="兼務上限のストッパー設定（過労防止）">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" min="2" max="10" value={customRules.alertMaxKenmu ?? 3} onChange={(e: any) => setCustomRules({...customRules, alertMaxKenmu: Number(e.target.value)})} style={{ width: 80, padding: "10px", borderRadius: 8, border: "1px solid #fca5a5", textAlign: "center", fontWeight: 800, color: "#be185d", fontSize: 20 }} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#9f1239" }}>部屋以上の兼務は自動ブロック（手動時はエラー表示）</span>
              </div>
            </RuleCard>
          </div>

         {/* ===================== フェーズ5 ===================== */}
          <div style={{ borderLeft: "8px solid #8b5cf6", paddingLeft: 24, marginBottom: 40 }}>
            <h4 style={{ fontSize: 24, fontWeight: 900, color: "#6d28d9", marginBottom: 20, borderBottom: "2px solid #c4b5fd", paddingBottom: 10 }}>フェーズ5：仕上げ（最後に配置）</h4>
            
            <RuleCard bg="#eef2ff" border="#c7d2fe" color="#4338ca" icon="🍱" title="昼当番ルール">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#fff", padding: "12px 20px", borderRadius: 10, border: "1px solid #c7d2fe", width: "fit-content" }}>
                  <span style={{ fontSize: 19, fontWeight: 800, color: "#3730a3" }}>基本の人数:</span>
                  <input type="number" min="0" value={customRules.lunchBaseCount ?? 3} onChange={(e: any) => setCustomRules({...customRules, lunchBaseCount: Number(e.target.value)})} style={{ width: 80, padding: "8px", borderRadius: 6, border: "1px solid #a5b4fc", textAlign: "center", fontWeight: 800, color: "#4f46e5", fontSize: 20 }} />
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
                    <button onClick={() => removeRule("lunchRoleRules", idx)} className="rule-del">✖</button>
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
                        <input type="number" value={rule.count} onChange={(e: any) => updateRule("lunchSpecialDays", idx, "count", Number(e.target.value))} className="rule-num" />
                        <button onClick={() => removeRule("lunchSpecialDays", idx)} className="rule-del">✖</button>
                      </div>
                    ))}
                    <button className="rule-add" onClick={() => addRule("lunchSpecialDays", { day: "火", count: 4 })}>＋ 曜日ルールを追加</button>
                  </div>
                  <div style={{ flex: 1, minWidth: "260px", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <h6 style={{ margin: "0 0 12px 0", fontSize: 17, color: "#4f46e5", fontWeight: 800 }}>⚖️ 条件付き選出（特定部屋が多い時）</h6>
                    {(customRules.lunchConditional || []).map((rule: any, idx: number) => (
                      <div key={idx} className="rule-row">
                        <select value={rule.section} onChange={(e: any) => updateRule("lunchConditional", idx, "section", e.target.value)} className="rule-sel"><option value="">場所</option>{ROOM_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <input type="number" value={rule.min} onChange={(e: any) => updateRule("lunchConditional", idx, "min", Number(e.target.value))} className="rule-num" />
                        <span className="rule-label">人以上➔</span>
                        <input type="number" value={rule.out} onChange={(e: any) => updateRule("lunchConditional", idx, "out", Number(e.target.value))} className="rule-num" />
                        <button onClick={() => removeRule("lunchConditional", idx)} className="rule-del">✖</button>
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
        </Modal>
      )}
    </div>
  );
}
