/** Shangrao teaching table v1. Virtual teaching points; local rules may differ. */
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Meld = { type: 'chi' | 'peng' | 'gang' | 'angang' | 'bugang'; tiles: number[]; from: number };
export type Player = { name: string; hand: number[]; melds: Meld[]; discards: number[] };
export type Action = { type: 'hu' | 'peng' | 'chi' | 'gang' | 'angang' | 'bugang' | 'pass'; player: number; tile?: number; tiles?: number[]; label: string };
export type Win = { name: string; points: number; natural: boolean };
export type GameState = {
  version: 1; difficulty: Difficulty; phase: 'discard' | 'claim' | 'ended'; current: number;
  players: Player[]; wall: number[]; indicator: number; wild: number;
  lastDiscard: { player: number; tile: number } | null; pendingClaims: Action[];
  log: string[]; winner: number | null;
  result: { title: string; description: string; points: number; breakdown: string[] } | null;
  turn: number; drawnTile: number | null; seed: number;
};
export type Hint = { index: number; tile: number; title: string; reason: string; waitingTiles: number[] };
const CHINESE = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const HONORS = ['东', '南', '西', '北', '中', '发', '白'];
const validTile = (t: number) => Number.isInteger(t) && t >= 0 && t < 34;
const isTerminal = (t: number) => t >= 27 || t % 9 === 0 || t % 9 === 8;
const sorted = (a: number[]) => a.sort((a, b) => a - b);
const copy = (s: GameState): GameState => JSON.parse(JSON.stringify(s));
export function tileName(t: number): string { if (!validTile(t)) return '未知牌'; return t >= 27 ? HONORS[t - 27] ?? '未知牌' : `${CHINESE[t % 9]}${['万', '筒', '条'][Math.floor(t / 9)]}`; }
export function getWild(indicator: number): number {
  if (indicator < 27) return Math.floor(indicator / 9) * 9 + (indicator + 1) % 9;
  if (indicator < 31) return 27 + (indicator - 26) % 4;
  return 31 + (indicator - 30) % 3;
}
function random(s: GameState): number { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
function log(s: GameState, message: string) { s.log = [...s.log.slice(-79), message]; }
function countsFor(hand: number[], wild: number) { const c = Array<number>(34).fill(0); let w = 0; for (const t of hand) t === wild ? w++ : c[t]++; return { c, w }; }
function standard(c: number[], w: number, groups: number): boolean {
  const memo = new Map<string, boolean>();
  function sets(counts: number[], jokers: number, remaining: number): boolean {
    const i = counts.findIndex(n => n > 0);
    if (i < 0) return jokers === remaining * 3;
    if (remaining <= 0) return false;
    const key = `${counts.join('')}/${jokers}/${remaining}`;
    if (memo.has(key)) return memo.get(key)!;
    for (let used = Math.min(3, counts[i]); used >= 1; used--) {
      const need = 3 - used;
      if (need > jokers) continue;
      counts[i] -= used;
      const ok = sets(counts, jokers - need, remaining - 1);
      counts[i] += used;
      if (ok) { memo.set(key, true); return true; }
    }
    if (i < 27) {
      const base = Math.floor(i / 9) * 9;
      for (let start = Math.max(base, i - 2); start <= Math.min(i, base + 6); start++) {
        const used: number[] = []; let missing = 0;
        for (let t = start; t < start + 3; t++) { if (counts[t]) { counts[t]--; used.push(t); } else missing++; }
        const ok = missing <= jokers && sets(counts, jokers - missing, remaining - 1);
        used.forEach(t => counts[t]++);
        if (ok) { memo.set(key, true); return true; }
      }
    }
    memo.set(key, false); return false;
  }
  for (let i = 0; i < 34; i++) {
    if (!c[i]) continue;
    for (let used = Math.min(2, c[i]); used >= 1; used--) {
      const need = 2 - used; if (need > w) continue;
      c[i] -= used; const ok = sets(c, w - need, groups); c[i] += used;
      if (ok) return true;
    }
  }
  return w >= 2 && sets(c, w - 2, groups);
}
function scatteredCapacity(c: number[], seven: boolean, wilds: number): boolean {
  if (c.some(n => n > 1)) return false;
  if (seven && c.slice(27).filter(Boolean).length + wilds < 7) return false;
  let capacity = 7;
  for (let suit = 0; suit < 3; suit++) {
    const selected = Array.from({ length: 9 }, (_, i) => i).filter(i => c[suit * 9 + i]);
    if (selected.some((v, i) => i && v - selected[i - 1] < 3)) return false;
    let max = 0;
    for (let mask = 0; mask < 512; mask++) {
      if (selected.some(i => !(mask & (1 << i)))) continue;
      const a = Array.from({ length: 9 }, (_, i) => i).filter(i => mask & (1 << i));
      if (a.every((v, i) => !i || v - a[i - 1] >= 3)) max = Math.max(max, a.length);
    }
    capacity += max;
  }
  return capacity >= 14;
}
function validMeld(meld: Meld, wild: number): boolean {
  if (!Array.isArray(meld.tiles) || meld.tiles.some(t => !validTile(t) || t === wild)) return false;
  if (meld.type === 'chi') {
    const tiles = [...meld.tiles].sort((a, b) => a - b);
    return tiles.length === 3 && tiles[0] < 27 && Math.floor(tiles[0] / 9) === Math.floor(tiles[2] / 9) && tiles[1] === tiles[0] + 1 && tiles[2] === tiles[0] + 2;
  }
  const size = meld.type === 'peng' ? 3 : ['gang', 'angang', 'bugang'].includes(meld.type) ? 4 : 0;
  return size > 0 && meld.tiles.length === size && meld.tiles.every(t => t === meld.tiles[0]);
}
/** Returns the highest teaching-point pattern. Wilds can stand for any tile. */
export function evaluateWin(hand: number[], wild: number, melds: Meld[] = []): Win | null {
  if (!validTile(wild) || hand.some(t => !validTile(t)) || hand.length !== 14 - 3 * melds.length || melds.length > 4 || melds.some(m => !validMeld(m, wild))) return null;
  // Count physical copies across concealed tiles AND declared sets before applying wilds.
  const physical = Array<number>(34).fill(0);
  for (const t of [...hand, ...melds.flatMap(m => m.tiles)]) if (++physical[t] > 4) return null;
  const { c, w } = countsFor(hand, wild); const natural = w === 0;
  const found: Win[] = [];
  const add = (name: string, points: number) => found.push({ name, points: points + (natural ? 1 : 0), natural });
  if (hand.every(t => t === wild || isTerminal(t)) && melds.every(m => m.tiles.every(isTerminal))) add('九幺', 6);
  if (melds.length === 0) {
    if (scatteredCapacity(c, false, w)) add('十三烂', 4);
    if (scatteredCapacity(c, true, w) && c.slice(0, 27).reduce((a, b) => a + b, 0) <= 7) add('七星十三烂', 8);
    const odd = c.filter(n => n % 2).length;
    if (odd <= w && (w - odd) % 2 === 0) add('七对', 4);
  }
  if (standard([...c], w, 4 - melds.length)) {
    let allTriplets = false;
    if (melds.every(m => m.type !== 'chi')) {
      for (let pair = -1; pair < 34; pair++) {
        const available = pair < 0 ? 0 : c[pair];
        if (pair >= 0 && !available) continue;
        const use = Math.min(2, available); const leftWild = w - (2 - use);
        if (leftWild < 0) continue;
        const remaining = [...c]; if (pair >= 0) remaining[pair] -= use;
        const needed = remaining.reduce((sum, n) => sum + (3 - n % 3) % 3, 0);
        if (needed <= leftWild && (leftWild - needed) % 3 === 0) allTriplets = true;
      }
    }
    add(allTriplets ? '碰碰胡' : '平胡', allTriplets ? 3 : 1);
  }
  return found.sort((a, b) => b.points - a.points)[0] ?? null;
}
export function createGame(difficulty: Difficulty = 'easy', rng: () => number = Math.random): GameState {
  const deck = Array.from({ length: 136 }, (_, i) => Math.floor(i / 4));
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.min(i, Math.max(0, Math.floor(rng() * (i + 1)))); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const indicator = deck.pop()!;
  const names = ['你', '阿饶', '桂花婶', '胡老师'];
  const players = names.map(name => ({ name, hand: [] as number[], melds: [] as Meld[], discards: [] as number[] }));
  for (let i = 0; i < 13; i++) for (const p of players) p.hand.push(deck.pop()!);
  const extra = deck.pop()!; players[0].hand.push(extra); players.forEach(p => sorted(p.hand));
  return { version: 1, difficulty, phase: 'discard', current: 0, players, wall: deck, indicator, wild: getWild(indicator), lastDiscard: null, pendingClaims: [], log: [`茶已沏好。翻出${tileName(indicator)}，${tileName(getWild(indicator))}是本局宝牌。`, '你坐庄，先出一张牌。'], winner: null, result: null, turn: 1, drawnTile: extra, seed: Math.floor(rng() * 4294967295) >>> 0 };
}
function selfActions(s: GameState, player: number): Action[] {
  if (s.phase !== 'discard' || s.current !== player) return [];
  const p = s.players[player]; const out: Action[] = [];
  const win = s.drawnTile !== null ? evaluateWin(p.hand, s.wild, p.melds) : null;
  if (win) out.push({ type: 'hu', player, label: `自摸 · ${win.name}` });
  if (!s.wall.length) return out;
  for (let t = 0; t < 34; t++) {
    if (t === s.wild) continue;
    const count = p.hand.filter(x => x === t).length;
    if (count === 4) out.push({ type: 'angang', player, tile: t, label: `暗杠${tileName(t)}` });
    if (count && p.melds.some(m => m.type === 'peng' && m.tiles[0] === t)) out.push({ type: 'bugang', player, tile: t, label: `加杠${tileName(t)}` });
  }
  return out;
}
export function playerActions(s: GameState): Action[] {
  if (s.phase === 'claim') {
    const mine = s.pendingClaims.filter(a => a.player === 0);
    return mine.length ? [...mine, { type: 'pass', player: 0, label: '过' }] : [];
  }
  return selfActions(s, 0);
}
function claimActions(s: GameState, player: number, from: number, tile: number): Action[] {
  if (tile === s.wild) return [];
  const p = s.players[player]; const n = p.hand.filter(t => t === tile).length; const actions: Action[] = [];
  if (n >= 2) actions.push({ type: 'peng', player, tile, tiles: [tile, tile, tile], label: `碰${tileName(tile)}` });
  if (n >= 3 && s.wall.length) actions.push({ type: 'gang', player, tile, tiles: [tile, tile, tile, tile], label: `杠${tileName(tile)}` });
  if (player === (from + 1) % 4 && tile < 27) {
    const base = Math.floor(tile / 9) * 9;
    for (let start = Math.max(base, tile - 2); start <= Math.min(tile, base + 6); start++) {
      const tiles = [start, start + 1, start + 2]; const needed = tiles.filter(t => t !== tile);
      if (tiles.includes(s.wild)) continue;
      if (needed.every(t => p.hand.includes(t))) actions.push({ type: 'chi', player, tile, tiles, label: `吃 ${tiles.map(tileName).join('·')}` });
    }
  }
  return actions;
}
const priority = (a: Action) => a.type === 'chi' ? 1 : 2;
function compareClaims(a: Action, b: Action, from: number) { return priority(b) - priority(a) || (a.player - from + 4) % 4 - (b.player - from + 4) % 4 || Number(b.type === 'gang') - Number(a.type === 'gang'); }
function endDraw(s: GameState) {
  s.phase = 'ended'; s.pendingClaims = []; s.drawnTile = null;
  s.result = { title: '流局 · 茶凉了，再续一杯', description: '牌墙摸完，无人自摸胡牌。本局不计分。', points: 0, breakdown: ['虚拟教学分：0'] };
  log(s, '牌墙摸完，本局流局。');
}
function draw(s: GameState, player: number, replacement = false) {
  s.pendingClaims = []; s.current = player; s.drawnTile = null;
  if (!s.wall.length) { endDraw(s); return; }
  const tile = replacement ? s.wall.shift()! : s.wall.pop()!;
  s.players[player].hand.push(tile); sorted(s.players[player].hand);
  s.drawnTile = tile; s.phase = 'discard'; s.turn++;
  log(s, `${s.players[player].name}${replacement ? '杠后补牌' : '摸牌'}${player === 0 ? `：${tileName(tile)}` : '。'}`);
}
function waiting(hand: number[], wild: number, melds: Meld[]): number[] {
  if (hand.length !== 13 - 3 * melds.length) return [];
  const out: number[] = [];
  for (let t = 0; t < 34; t++) if (hand.filter(x => x === t).length < 4 && evaluateWin([...hand, t], wild, melds)) out.push(t);
  return out;
}
/** Scores only the acting player's hand and publicly exposed tiles, never opponents' hands. */
function handScore(hand: number[], wild: number, melds: Meld[]): number {
  const { c, w } = countsFor(hand, wild); let score = w * 8 + melds.length * 10;
  for (let t = 0; t < 34; t++) {
    if (c[t] >= 3) score += 10 + (c[t] - 3);
    else if (c[t] === 2) score += 5;
    else if (c[t]) score += t >= 27 ? -0.8 : (t % 9 === 0 || t % 9 === 8 ? -0.3 : 0.1);
    if (t < 27 && c[t]) {
      const rank = t % 9;
      if (rank <= 7 && c[t + 1]) score += 2.4;
      if (rank <= 6 && c[t + 2]) score += 1.3;
      if (rank <= 6 && c[t + 1] && c[t + 2]) score += 3.5;
    }
  }
  // Closed hands may pursue pairs or scattered patterns instead of indiscriminately opening.
  if (!melds.length) {
    const pairs = c.reduce((sum, n) => sum + Math.floor(n / 2), 0);
    score = Math.max(score, pairs * 6 + w * 8 - 4);
    let unique = 0; let conflict = 0;
    for (let t = 0; t < 34; t++) if (c[t]) {
      unique++; conflict += (c[t] - 1) * 4;
      if (t < 27) for (let d = 1; d <= 2; d++) if (t % 9 + d < 9 && c[t + d]) conflict += 3;
    }
    score = Math.max(score, unique * 3 - conflict + w * 7 - 8);
  }
  return score;
}
export function recommendedDiscard(s: GameState, player = s.current): number {
  const p = s.players[player]; if (!p?.hand.length) return -1;
  let bestIndex = 0; let bestScore = -Infinity;
  const visible = Array<number>(34).fill(0);
  for (let seat = 0; seat < s.players.length; seat++) { const person = s.players[seat]; person.discards.forEach(t => visible[t]++); person.melds.filter(m => m.type !== 'angang' || seat === player).forEach(m => m.tiles.forEach(t => visible[t]++)); }
  visible[s.indicator]++;
  p.hand.forEach((tile, i) => {
    const next = p.hand.filter((_, index) => i !== index); let score = handScore(next, s.wild, p.melds);
    if (tile === s.wild) score -= 20;
    if (s.difficulty === 'hard') {
      // More publicly exhausted tiles are safer to release; no hidden-hand information is read.
      score += visible[tile] * (s.turn > 25 ? 0.85 : 0.25);
      const outs = waiting(next, s.wild, p.melds);
      if (outs.length) score += 40 + outs.reduce((sum, t) => sum + Math.max(0, 4 - visible[t] - next.filter(x => x === t).length), 0) * 0.2;
    }
    if (score > bestScore) { bestScore = score; bestIndex = i; }
  });
  return bestIndex;
}
function botClaim(s: GameState, actions: Action[], player: number): Action | null {
  if (!actions.length) return null;
  const p = s.players[player]; const { c, w } = countsFor(p.hand, s.wild);
  if (!p.melds.length && (c.filter(n => n >= 2).length >= 4 || scatteredCapacity(c, false, w))) return null;
  const gang = actions.find(a => a.type === 'gang'); if (gang) return gang;
  const ordered = [...actions].sort((a, b) => priority(b) - priority(a));
  if (s.difficulty === 'easy') return random(s) < 0.75 ? ordered[0] : null;
  let best: Action | null = null; let gain = -Infinity;
  for (const action of ordered) {
    const hand = [...p.hand]; let skipped = false;
    for (const t of action.tiles!) { if (!skipped && t === action.tile) { skipped = true; continue; } hand.splice(hand.indexOf(t), 1); }
    const melds = [...p.melds, { type: action.type as Meld['type'], tiles: action.tiles!, from: s.lastDiscard!.player }];
    let after = -Infinity;
    for (let i = 0; i < hand.length; i++) after = Math.max(after, handScore(hand.filter((_, j) => i !== j), s.wild, melds));
    const delta = after - handScore(p.hand, s.wild, p.melds);
    if (delta > gain) { best = action; gain = delta; }
  }
  return gain >= -0.5 ? best : null;
}
function processDiscard(s: GameState, index: number) {
  const player = s.current; const p = s.players[player];
  const [tile] = p.hand.splice(index, 1); p.discards.push(tile);
  s.lastDiscard = { player, tile }; s.drawnTile = null;
  log(s, `${p.name}打出${tileName(tile)}${tile === s.wild ? '（宝牌打出不作吃碰杠）' : ''}。`);
  const candidates: Action[] = [];
  for (let offset = 1; offset < 4; offset++) {
    const claimant = (player + offset) % 4; const actions = claimActions(s, claimant, player, tile);
    if (claimant === 0) candidates.push(...actions);
    else { const chosen = botClaim(s, actions, claimant); if (chosen) candidates.push(chosen); }
  }
  candidates.sort((a, b) => compareClaims(a, b, player));
  const bot = candidates.find(a => a.player !== 0);
  // Never offer a human a lower-priority claim that a bot has already elected to take.
  s.pendingClaims = candidates.filter(a => a.player !== 0 || !bot || compareClaims(a, bot, player) <= 0);
  if (s.pendingClaims.length) {
    s.phase = 'claim'; s.current = s.pendingClaims.some(a => a.player === 0) ? 0 : s.pendingClaims[0].player;
  } else draw(s, (player + 1) % 4);
}
export function discardTile(state: GameState, index: number): GameState {
  if (state.phase !== 'discard' || state.current !== 0 || !Number.isInteger(index) || index < 0 || index >= state.players[0].hand.length) return state;
  const s = copy(state); processDiscard(s, index); return s;
}
function sameAction(a: Action, b: Action): boolean { return a.type === b.type && a.player === b.player && a.tile === b.tile && JSON.stringify(a.tiles ?? []) === JSON.stringify(b.tiles ?? []); }
function finishWin(s: GameState, player: number) {
  const win = evaluateWin(s.players[player].hand, s.wild, s.players[player].melds); if (!win) return;
  s.phase = 'ended'; s.winner = player; s.pendingClaims = [];
  s.result = { title: `${s.players[player].name}自摸 · ${win.name}`, description: player === 0 ? '这一声胡，茶馆都听见啦！' : '牌桌没有白坐的功夫，下一杯茶轮到你胡。', points: win.points, breakdown: [`${win.name}基础分：${win.points - (win.natural ? 1 : 0)}`, win.natural ? '无宝成牌奖励：+1' : '使用宝牌辅助：+0', '仅取最高牌型，不叠加；虚拟教学分，不含地方奖金、包赔与货币结算。'] };
  log(s, `${s.players[player].name}自摸${win.name}！教学分 ${win.points}。`);
}
function applyAction(s: GameState, action: Action) {
  const player = action.player; const p = s.players[player];
  if (action.type === 'hu') { finishWin(s, player); return; }
  if (action.type === 'pass') {
    s.pendingClaims = s.pendingClaims.filter(a => a.player !== player);
    if (s.pendingClaims.length) { s.current = s.pendingClaims[0].player; return; }
    draw(s, (s.lastDiscard!.player + 1) % 4); return;
  }
  const tile = action.tile!;
  if (action.type === 'angang') {
    p.hand = p.hand.filter(t => t !== tile);
    p.melds.push({ type: 'angang', tiles: [tile, tile, tile, tile], from: player });
    log(s, `${p.name}暗杠${player === 0 ? tileName(tile) : '一组牌'}。`); draw(s, player, true); return;
  }
  if (action.type === 'bugang') {
    p.hand.splice(p.hand.indexOf(tile), 1);
    const meld = p.melds.find(m => m.type === 'peng' && m.tiles[0] === tile)!;
    meld.type = 'bugang'; meld.tiles.push(tile);
    log(s, `${p.name}加杠${tileName(tile)}。`); draw(s, player, true); return;
  }
  const from = s.lastDiscard!.player;
  const river = s.players[from].discards;
  river.splice(river.lastIndexOf(tile), 1);
  let skipped = false;
  for (const t of action.tiles!) { if (!skipped && t === tile) { skipped = true; continue; } p.hand.splice(p.hand.indexOf(t), 1); }
  p.melds.push({ type: action.type, tiles: [...action.tiles!], from });
  s.pendingClaims = []; s.current = player; s.phase = 'discard'; s.drawnTile = null;
  log(s, `${p.name}${action.type === 'chi' ? '吃' : action.type === 'peng' ? '碰' : '明杠'}${tileName(tile)}。`);
  s.lastDiscard = null;
  if (action.type === 'gang') draw(s, player, true);
}
export function act(state: GameState, action: Action): GameState {
  if (action.player !== state.current) return state;
  const allowed = action.player === 0 ? playerActions(state) : state.phase === 'claim' ? state.pendingClaims.filter(a => a.player === action.player) : selfActions(state, action.player);
  if (!allowed.some(a => sameAction(a, action))) return state;
  const s = copy(state); applyAction(s, action); return s;
}
/** Advances one bot decision. Call again after a UI delay while the current actor is a bot. */
export function stepBot(state: GameState): GameState {
  if (state.phase === 'ended' || state.current === 0) return state;
  const s = copy(state);
  if (s.phase === 'claim') { const action = s.pendingClaims[0]; if (action) applyAction(s, action); return s; }
  const actions = selfActions(s, s.current); const hu = actions.find(a => a.type === 'hu');
  if (hu) { applyAction(s, hu); return s; }
  const gang = actions.find(a => a.type === 'angang' || a.type === 'bugang');
  if (gang) { applyAction(s, gang); return s; }
  let index = recommendedDiscard(s, s.current);
  if (s.difficulty === 'easy' && random(s) < 0.3) {
    const safe = s.players[s.current].hand.map((t, i) => ({ t, i })).filter(x => x.t !== s.wild);
    if (safe.length) index = safe[Math.floor(random(s) * safe.length)].i;
  }
  processDiscard(s, index); return s;
}
export function getHint(s: GameState): Hint {
  const p = s.players[0];
  if (!p?.hand.length || s.phase !== 'discard' || s.current !== 0) {
    const title = s.phase === 'ended' ? '本局已经结束' : s.phase === 'claim' && s.current === 0 ? '先决定吃碰杠，或选择过' : '稍等，轮到你时再看出牌建议';
    return { index: -1, tile: -1, title, reason: '现在没有需要你打出的牌。', waitingTiles: [] };
  }
  const index = recommendedDiscard({ ...s, difficulty: 'hard' }, 0); const tile = p.hand[index] ?? -1;
  if (!validTile(tile)) return { index: -1, tile: -1, title: '暂时无法给出建议', reason: '手牌数据不完整，请重新开局。', waitingTiles: [] };
  const hand = p.hand.filter((_, i) => i !== index); const waitingTiles = waiting(hand, s.wild, p.melds);
  let reason = '优先保留对子、相邻牌与宝牌，整理有连接的搭子，慢慢把散牌送走。';
  if (tile >= 27 && p.hand.filter(t => t === tile).length === 1) reason = '这张字牌暂时没有同伴，也不能组成顺子；先释放它，把位置留给搭子。';
  if (tile < 27 && tile >= 0 && (tile % 9 === 0 || tile % 9 === 8)) reason = '这张边张连接方向较少。保留中间张和已经成形的搭子，进张空间更灵活。';
  if (waitingTiles.length) reason = `打出后可听：${waitingTiles.map(tileName).join('、')}。这里只提示可胡牌种，不保证牌墙还有这些牌。`;
  return { index, tile, title: waitingTiles.length ? '差一张，茶就香了！' : `建议打出${tileName(tile)}`, reason, waitingTiles };
}
