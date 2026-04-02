// 修正箇所の抜粋
ROOM_SECTIONS.forEach(room => { 
  if (room === "受付ヘルプ") return; // ★追加: 受付ヘルプ単体では空室警告（黄色）を出さない
  if (split(cells[room]).length === 0) w.push({ level: 'yellow', title: '空室', room, msg: `「${room}」の担当者がいません` }); 
});

// ★追加: 受付の人数チェック（設定人数未満、かつヘルプ不在の場合のみ警告）
const uTarget = customRules.capacity?.受付 ?? 2;
const currentUketsukeCount = split(cells["受付"]).reduce((sum: number, m: string) => sum + getStaffAmount(m), 0);
const hasHelp = split(cells["受付ヘルプ"]).length > 0;
if (currentUketsukeCount < uTarget && !hasHelp) {
  w.push({ level: 'yellow', title: '受付不足', room: '受付', msg: `受付が${uTarget}名未満ですが、受付ヘルプがいません` });
}
