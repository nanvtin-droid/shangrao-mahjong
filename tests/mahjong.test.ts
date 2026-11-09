import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore Node's native TypeScript runner requires an explicit extension.
import { createGame, getWild, evaluateWin, discardTile, playerActions, act, stepBot, recommendedDiscard, getHint, tileName } from '../lib/mahjong.ts';
import type { GameState, Meld } from '../lib/mahjong.ts';
function rng(seed = 42) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function inventory(s: GameState) { const all = [s.indicator, ...s.wall, ...s.players.flatMap(p => [...p.hand, ...p.discards, ...p.melds.flatMap(m => m.tiles)])]; return Array.from({ length: 34 }, (_, t) => all.filter(x => x === t).length); }
test('indicator cycles independently through suits, winds and dragons', () => { assert.equal(getWild(8), 0); assert.equal(getWild(17), 9); assert.equal(getWild(26), 18); assert.equal(getWild(30), 27); assert.equal(getWild(33), 31); assert.equal(getWild(31), 32); });
test('dealing conserves 136 tiles and assigns a 14-tile dealer', () => { const s = createGame('medium', rng()); assert.deepEqual(s.players.map(p => p.hand.length), [14,13,13,13]); assert.equal(s.wall.length,82); assert.deepEqual(inventory(s), Array(34).fill(4)); });
test('recognizes ordinary, wildcard, seven-pairs and open wins', () => {
 assert.equal(evaluateWin([0,1,2,3,4,5,9,10,11,18,19,20,27,27],33)?.name,'平胡');
 assert.equal(evaluateWin([0,1,2,3,4,5,9,10,11,18,19,33,27,27],33)?.natural,false);
 assert.equal(evaluateWin([0,0,3,3,8,8,12,12,16,16,23,23,29,29],33)?.name,'七对');
 assert.equal(evaluateWin([0,0,0,0,3,3,8,8,12,12,16,16,29,29],33)?.name,'七对');
 const melds: Meld[]=[{type:'chi',tiles:[0,1,2],from:3}];
 assert.equal(evaluateWin([3,4,5,9,10,11,18,19,20,27,27],33,melds)?.name,'平胡');
 assert.equal(evaluateWin([0,0,1,1,4,7,12,17,18,20,25,27,28,29],33),null);
});
test('scattered and nine-yao patterns use Shangrao semantics', () => {
 assert.equal(evaluateWin([0,3,6,9,12,15,18,27,28,29,30,31,32,33],26)?.name,'七星十三烂');
 assert.equal(evaluateWin([0,3,6,9,12,15,18,21,24,27,28,29,30,31],33)?.name,'十三烂');
 assert.equal(evaluateWin([0,0,8,8,9,17,18,26,27,28,29,30,31,32],33)?.name,'九幺');
 const melds: Meld[]=[{type:'peng',tiles:[0,0,0],from:1}];
 assert.equal(evaluateWin([8,9,17,18,26,27,28,29,30,31,32],33,melds)?.name,'九幺');
 assert.equal(evaluateWin([0,3,5,9,12,15,18,21,24,27,28,29,30,31],33),null);
});
test('only legal self-draw and claim actions can mutate state', () => { const s=createGame('easy',rng()); assert.strictEqual(discardTile(s,-1),s); assert.strictEqual(act(s,{type:'hu',player:0,label:'fake'}),s); assert.strictEqual(stepBot(s),s); });
test('natural treasure cannot participate in a meld', () => { const s=createGame('easy',rng()); s.wild=4; s.players[0].hand=[4,4,4,4,0,1,2,9,10,11,18,19,20,27]; assert.ok(!playerActions(s).some(a=>a.tile===4 && ['angang','bugang'].includes(a.type))); });
test('seeded complete games conserve every tile and always terminate', () => {
 for(const difficulty of ['easy','medium','hard'] as const) for(let seed=1;seed<=8;seed++) {
  let s=createGame(difficulty,rng(seed)); let steps=0;
  while(s.phase!=='ended' && steps++<700) {
   assert.deepEqual(inventory(s),Array(34).fill(4));
   const before=JSON.stringify(s);
   if(s.current===0) {
    const actions=playerActions(s); const hu=actions.find(a=>a.type==='hu');
    if(hu) s=act(s,hu);
    else if(s.phase==='claim') s=act(s,actions.find(a=>a.type!=='pass') ?? actions[0]);
    else { const gang=actions.find(a=>a.type==='angang'||a.type==='bugang'); s=gang?act(s,gang):discardTile(s,recommendedDiscard(s,0)); }
   } else s=stepBot(s);
   assert.notEqual(JSON.stringify(s),before,'state machine must make progress');
   for(const p of s.players) assert.ok(p.hand.length>=0 && p.melds.length<=4);
  }
  assert.equal(s.phase,'ended',`seed ${seed} ${difficulty} terminated`); assert.deepEqual(inventory(s),Array(34).fill(4));
 }
});
test('hint logic never reads opponents concealed hands', () => { const s=createGame('hard',rng(84)); const before=recommendedDiscard(s,0); s.players[1].hand=Array(13).fill(33); s.players[2].hand=Array(13).fill(0); assert.equal(recommendedDiscard(s,0),before); });
test('concealed opponent kongs cannot influence the visible-information advisor', () => { const s=createGame('hard',rng(91)); s.players[1].melds=[{type:'angang',tiles:[0,0,0,0],from:1}]; const before=recommendedDiscard(s,0); s.players[1].melds=[{type:'angang',tiles:[33,33,33,33],from:1}]; assert.equal(recommendedDiscard(s,0),before); });
test('concealed and added kongs replace from the back and conserve tiles', () => {
 const s=createGame('medium',rng()); s.wild=33; s.players[0].hand=[0,0,0,0,1,2,3,4,5,9,10,11,18,19];
 const before=inventory(s); const oldWall=s.wall.length; const back=s.wall[0];
 const action=playerActions(s).find(a=>a.type==='angang')!; assert.ok(action);
 const after=act(s,action); assert.deepEqual(inventory(after),before); assert.equal(after.wall.length,oldWall-1); assert.equal(after.drawnTile,back); assert.equal(after.players[0].hand.length,11); assert.equal(after.players[0].melds[0].tiles.length,4);
 const added=createGame('medium',rng()); added.wild=33; added.players[0].hand=[0,1,2,3,4,5,9,10,11,18,19]; added.players[0].melds=[{type:'peng',tiles:[0,0,0],from:2}];
 const beforeAdd=inventory(added); const add=playerActions(added).find(a=>a.type==='bugang')!; assert.ok(add);
 const afterAdd=act(added,add); assert.deepEqual(inventory(afterAdd),beforeAdd); assert.equal(afterAdd.players[0].melds[0].type,'bugang'); assert.equal(afterAdd.players[0].melds[0].tiles.length,4);
});
test('claiming takes exactly one tile from river and cannot create a self-draw', () => {
 const s=createGame('medium',rng()); s.wild=33; s.phase='claim'; s.current=0; s.drawnTile=null;
 s.players[0].hand=[0,0,1,2,3,4,5,6,9,10,11,18,19]; s.players[3].discards=[0]; s.lastDiscard={player:3,tile:0};
 s.pendingClaims=[{type:'peng',player:0,tile:0,tiles:[0,0,0],label:'碰一万'}];
 const before=inventory(s); const after=act(s,playerActions(s)[0]);
 assert.deepEqual(inventory(after),before); assert.deepEqual(after.players[3].discards,[]); assert.equal(after.players[0].hand.length,11); assert.equal(after.current,0); assert.equal(after.phase,'discard'); assert.equal(after.drawnTile,null); assert.ok(!playerActions(after).some(a=>a.type==='hu'));
});
test('passing all claims advances to the player after the discarder', () => {
 const s=createGame('easy',rng()); s.phase='claim'; s.current=0; s.lastDiscard={player:2,tile:27}; s.pendingClaims=[{type:'peng',player:0,tile:27,tiles:[27,27,27],label:'碰东'}];
 const next=act(s,playerActions(s).find(a=>a.type==='pass')!); assert.equal(next.current,3); assert.equal(next.phase,'discard'); assert.equal(next.wall.length,s.wall.length-1);
});
test('the final discard is processed before the empty wall causes a draw', () => { const s=createGame('easy',rng()); s.wall=[]; s.wild=27; s.players[0].hand[0]=27; const next=discardTile(s,0); assert.equal(next.phase,'ended'); assert.equal(next.winner,null); assert.equal(next.result?.points,0); });
test('win evaluation rejects a fifth physical copy, including open sets and treasure', () => {
 assert.equal(evaluateWin([0,0,0,0,0,3,4,5,9,10,11,18,19,20],33),null);
 assert.equal(evaluateWin([33,33,33,33,33,3,4,5,9,10,11,18,19,20],33),null);
 assert.equal(evaluateWin([0,0,3,4,5,9,10,11,18,19,20],33,[{type:'peng',tiles:[0,0,0],from:1}]),null);
 assert.equal(evaluateWin([0,1,2,3,4,5,9,10,11,18,19,20,27,27],-1),null);
});
test('malformed or treasure-containing melds cannot be treated as completed groups', () => {
 const hand=[3,4,5,9,10,11,18,19,20,27,27];
 assert.equal(evaluateWin(hand,33,[{type:'chi',tiles:[0,1,8],from:1}]),null);
 assert.equal(evaluateWin(hand,33,[{type:'peng',tiles:[0,0,1],from:1}]),null);
 assert.equal(evaluateWin(hand,0,[{type:'peng',tiles:[0,0,0],from:1}]),null);
 assert.equal(evaluateWin(hand,33,[{type:'gang',tiles:[0,0,0],from:1}]),null);
});
test('treasures complete scattered hands only when enough separated positions exist', () => {
 assert.equal(evaluateWin([0,3,6,9,12,15,18,27,28,29,30,31,32,26],26)?.name,'七星十三烂');
 // Three suits fixed at 3 and 7 have capacity two apiece: 6 numbers + 7 honors = only 13.
 assert.equal(evaluateWin([2,6,11,15,20,24,27,28,29,30,33,33,33,33],33),null);
});
test('a bot cannot take a pending decision away from the human', () => {
 const s=createGame('medium',rng()); s.phase='claim'; s.current=0; s.lastDiscard={player:3,tile:0};
 s.pendingClaims=[{type:'peng',player:0,tile:0,tiles:[0,0,0],label:'碰'}, {type:'chi',player:1,tile:0,tiles:[0,1,2],label:'吃'}];
 assert.strictEqual(stepBot(s),s); assert.strictEqual(act(s,s.pendingClaims[1]),s);
 const passed=act(s,playerActions(s).find(a=>a.type==='pass')!); assert.equal(passed.current,1); assert.equal(passed.pendingClaims.length,1);
});
test('kong claims precede lower-priority chow claims after an actual discard', () => {
 const s=createGame('medium',rng()); s.wild=33; s.players[0].hand=[3,0,1,2,4,5,6,9,10,11,18,19,20,27];
 s.players[1].hand=[1,2,7,9,10,11,18,19,20,24,27,28,29];
 s.players[2].hand=[3,3,3,0,1,2,9,10,11,18,19,20,27];
 s.players[3].hand=[4,7,10,13,16,19,22,25,27,28,29,30,31];
 const after=discardTile(s,0); assert.equal(after.phase,'claim'); assert.equal(after.current,2); assert.equal(after.pendingClaims[0].type,'gang');
 const claimed=stepBot(after); assert.equal(claimed.players[2].melds[0].type,'gang'); assert.equal(claimed.players[1].melds.length,0);
});
test('added-kong replacement can produce a valid self-draw win', () => {
 const s=createGame('medium',rng()); s.wild=33; s.players[0].hand=[0,3,4,5,9,10,11,18,19,20,27];
 s.players[0].melds=[{type:'peng',tiles:[0,0,0],from:2}]; s.wall=[27,...s.wall];
 const next=act(s,playerActions(s).find(a=>a.type==='bugang')!);
 const hu=playerActions(next).find(a=>a.type==='hu'); assert.ok(hu); assert.equal(next.drawnTile,27);
 const won=act(next,hu!); assert.equal(won.phase,'ended'); assert.equal(won.winner,0);
});
test('empty, missing, non-turn and ended hands produce safe hints without undefined labels', () => {
 const s=createGame('easy',rng()); s.players[0].hand=[]; assert.equal(getHint(s).index,-1); assert.ok(!getHint(s).title.includes('undefined'));
 s.players=[]; assert.equal(getHint(s).index,-1);
 const other=createGame('easy',rng()); other.current=1; assert.equal(getHint(other).index,-1); other.phase='ended'; assert.equal(getHint(other).title,'本局已经结束');
 assert.equal(tileName(-1),'未知牌'); assert.equal(tileName(Number.NaN),'未知牌');
});
test('a real bot discard pauses on the human peng decision until it is answered', () => {
 const s=createGame('medium',rng()); s.current=3; s.wild=33; s.drawnTile=null;
 s.players[3].hand=[0,1,2,3,4,5,9,10,11,18,19,20,20,27];
 s.players[0].hand=[27,27,1,2,3,4,5,6,9,10,11,18,19];
 s.players[1].hand=[4,7,10,13,16,19,22,25,28,29,30,31,32];
 s.players[2].hand=[4,7,10,13,16,19,22,25,28,29,30,31,32];
 const next=stepBot(s); assert.equal(next.phase,'claim'); assert.equal(next.current,0); assert.ok(playerActions(next).some(a=>a.type==='peng')); assert.strictEqual(stepBot(next),next);
});
