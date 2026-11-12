import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Dices } from 'lucide-react';
import { dealerFromDice, getWallStacks, seatWinds, type DiceRoll, type GameState } from '@/lib/mahjong';
import { Tile } from './tile';

const directions = ['bottom', 'right', 'top', 'left'] as const;
const names = ['你', '阿饶', '桂花婶', '胡老师'];
const avatars = ['你', '饶', '桂', '胡'];
const fullWall = Array<number>(17).fill(2);

function Wall({ seat, stacks }: { seat: number; stacks: number[] }) {
  const count = stacks.reduce((sum, stack) => sum + stack, 0);
  return (
    <div className={`tile-wall wall-${directions[seat]}`} role="img" aria-label={`${seatWinds[seat]}侧牌墙，${count} 张`}>
      {stacks.map((stack, index) => (
        <div className="wall-stack" data-remaining={stack} key={index} aria-hidden="true">
          <div className="wall-layer wall-lower"><Tile id={0} back small /></div>
          <div className="wall-layer wall-upper"><Tile id={0} back small /></div>
        </div>
      ))}
    </div>
  );
}

function River({ game, seat }: { game: GameState; seat: number }) {
  const discards = game.players[seat].discards;
  const horizontal = seat === 0 || seat === 2;
  const count = discards.length;
  const columns = horizontal
    ? Math.max(9, Math.ceil(Math.sqrt(count * 8)))
    : Math.max(3, Math.ceil(Math.sqrt(count)), Math.min(6, Math.ceil(count / 4)));
  const rows = Math.max(1, Math.ceil(count / columns));
  const sizing = { '--river-columns': columns, '--river-rows': rows } as CSSProperties;

  return (
    <section className={`board-river river-${directions[seat]}`} aria-label={`${names[seat]}的牌河`}>
      <header><span>{seatWinds[seat]}家弃牌</span><small>{discards.length} 张</small></header>
      <div className="board-river-space">
        <div className="board-river-tiles" style={sizing}>
          {discards.map((tile, index) => (
            <span key={index} className={game.lastDiscard?.player === seat && index === discards.length - 1 ? 'latest-discard' : undefined}>
              <Tile id={tile} small wild={tile === game.wild} />
            </span>
          ))}
          {!discards.length && <small className="river-empty">尚未出牌</small>}
        </div>
      </div>
    </section>
  );
}

function Seat({ game, seat, paused }: { game: GameState; seat: number; paused: boolean }) {
  const player = game.players[seat];
  const active = game.current === seat && game.phase !== 'ended' && !paused;
  const status = game.phase === 'ended' ? '本局已结束' : paused ? '已暂停' :
    game.current !== 0 ? '牌友思考中…' : game.phase === 'claim' ? '轮到你响应' : '轮到你出牌';

  return (
    <div className={`board-seat board-seat-${directions[seat]}${active ? ' board-seat-active' : ''}`}>
      <div className="board-seat-label">
        <span className={`player-avatar ${['self', 'gold', 'peach', 'sage'][seat]}`}>{avatars[seat]}</span>
        <div className="board-seat-info">
          <strong>{names[seat]} <small>{seatWinds[seat]}家</small></strong>
          {(game.dealer ?? 0) === seat && <span className="dealer-mark">庄</span>}
          <p>{seat === 0 ? status : `手牌 ${player.hand.length} 张`}</p>
        </div>
      </div>
    </div>
  );
}

function MeldGroups({ game, seat }: { game: GameState; seat: number }) {
  return (
    <div className="board-melds">
      {game.players[seat].melds.map((meld, index) => (
        <div className="board-meld" title={meld.type === 'angang' ? '暗杠' : '副露'} key={index}>
          {meld.tiles.map((tile, index) => <Tile id={tile} small back={seat !== 0 && meld.type === 'angang' && game.phase !== 'ended'} key={index} />)}
        </div>
      ))}
    </div>
  );
}

function OpponentHand({ game, seat }: { game: GameState; seat: number }) {
  return (
    <div className={`table-rack rack-${directions[seat]}`}>
      <div className="board-opponent-hand">
        {game.players[seat].hand.map((tile, index) => <Tile id={tile} small back={game.phase !== 'ended'} key={index} />)}
      </div>
      <MeldGroups game={game} seat={seat} />
    </div>
  );
}

export function GameTable({ game, paused, hand, children }: { game: GameState; paused: boolean; hand: ReactNode; children?: ReactNode }) {
  const walls = getWallStacks(game);

  return (
    <section className="seated-game-table" aria-label="四人麻将牌桌">
      {directions.map((side, seat) => <Seat game={game} seat={seat} paused={paused} key={side} />)}
      <div className="mahjong-table flat-table">
        <div className="flat-felt" aria-hidden="true" />
        <div className="table-plane">
          {[1, 2, 3].map(seat => <OpponentHand game={game} seat={seat} key={seat} />)}
          {walls.map((stacks, seat) => <Wall seat={seat} stacks={stacks} key={seat} />)}
          <div className="center-ring">
            {directions.map((side, seat) => <River game={game} seat={seat} key={side} />)}
            <div className="board-center">
              <div className="table-compass-display">
                {directions.map((side, seat) => (
                  <span className={`table-wind wind-${side}${game.phase !== 'ended' && game.current === seat ? ' wind-active' : ''}`} key={side}>
                    {seatWinds[seat]}
                  </span>
                ))}
                <div className="board-stock"><strong>{game.wall.length}</strong><span>余牌</span></div>
              </div>
              <div className="board-bao">
                <div><small>翻牌</small><Tile id={game.indicator} small /></div>
                <ArrowRight size={14} aria-hidden="true" />
                <div><small>本局宝</small><Tile id={game.wild} small wild /></div>
              </div>
              {game.dice && <small className="board-dice-result"><Dices size={13} />{game.dice.join(' + ')} · {seatWinds[game.dealer ?? 0]}家先出</small>}
            </div>
          </div>
        </div>
        <div className="foreground-hand">
          <div className="foreground-melds"><MeldGroups game={game} seat={0} /></div>
          {hand}
        </div>
        {children}
      </div>
    </section>
  );
}

const pipPositions = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

function Die({ value }: { value: number }) {
  return (
    <span className="die-face" role="img" aria-label={`${value} 点`}>
      {Array.from({ length: 9 }, (_, index) => <i className={pipPositions[value - 1].includes(index) ? 'pip' : undefined} key={index} />)}
    </span>
  );
}

export function DiceOpening({ onDeal }: { onDeal: (dice: DiceRoll) => void }) {
  const [dice, setDice] = useState<DiceRoll | null>(null);
  const [rolling, setRolling] = useState(false);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dealButton = useRef<HTMLButtonElement>(null);

  useEffect(() => () => {
    if (rollTimer.current !== null) clearTimeout(rollTimer.current);
  }, []);
  useEffect(() => { if (dice) dealButton.current?.focus(); }, [dice]);

  function roll() {
    const result = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1] as const;
    setRolling(true);
    rollTimer.current = setTimeout(() => {
      setDice(result);
      setRolling(false);
    }, 720);
  }

  const dealer = dice ? dealerFromDice(dice) : null;
  return (
    <div className="dice-opening">
      <div className="mahjong-table dice-felt">
        <div className="table-grain" aria-hidden="true" />
        {directions.map((side, seat) => <Wall seat={seat} stacks={fullWall} key={side} />)}
        <div className="dice-stage">
          <div className={`dice-pair${rolling ? ' rolling' : ''}`} aria-hidden={rolling}>
            <Die value={dice?.[0] ?? 2} />
            <Die value={dice?.[1] ?? 5} />
          </div>
          <p role="status">{dice && dealer !== null
            ? <>{dice[0]} + {dice[1]} = {dice[0] + dice[1]}<strong>{seatWinds[dealer]}家 · {names[dealer]}先出</strong></>
            : rolling ? '骰子正在滚动…' : '掷两颗骰子决定庄家'}</p>
        </div>
      </div>
      <p className="dice-rule">从东家数 1，按东、南、西、北循环数到两颗骰子的总点数。数到的座位先出牌。</p>
      {dice
        ? <button className="button primary large" ref={dealButton} onClick={() => onDeal(dice)}>发牌开局<ArrowRight size={17} /></button>
        : <button className="button primary large" disabled={rolling} onClick={roll}><Dices size={18} />{rolling ? '掷骰子中…' : '掷骰子'}</button>}
    </div>
  );
}
