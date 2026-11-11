import { tileName } from '@/lib/mahjong';

// Bounds of the solid tile bodies in the 1254 px atlases, measured from their
// alpha masks. The transparent margins and baked shadows vary by cell.
const ATLAS_SIZE = 1254;
const tileBounds = {
  wan: [
    [91, 48, 255, 344], [498, 48, 255, 344], [906, 48, 254, 344],
    [91, 456, 256, 348], [497, 456, 257, 348], [905, 456, 256, 348],
    [90, 859, 257, 350], [497, 859, 257, 351], [904, 859, 257, 351],
  ],
  tong: [
    [90, 46, 258, 351], [496, 46, 259, 351], [903, 46, 259, 351],
    [89, 454, 260, 352], [496, 454, 259, 352], [903, 454, 260, 352],
    [89, 859, 260, 356], [495, 859, 260, 357], [902, 859, 261, 357],
  ],
  tiao: [
    [88, 46, 259, 346], [497, 46, 258, 346], [904, 46, 259, 346],
    [88, 454, 260, 351], [497, 454, 259, 351], [904, 454, 259, 351],
    [88, 856, 260, 353], [497, 856, 259, 353], [903, 856, 260, 353],
  ],
  honors: [
    [89, 46, 259, 350], [496, 46, 259, 350], [904, 46, 258, 350],
    [89, 454, 259, 352], [496, 455, 259, 351], [903, 454, 259, 352],
    [89, 859, 259, 354], [495, 859, 261, 353],
  ],
} as const;

type TileProps = {
  id: number;
  small?: boolean;
  wild?: boolean;
  back?: boolean;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export function Tile({ id, small, wild, back, selected, onClick, disabled }: TileProps) {
  const atlas = back ? 'honors' : id < 9 ? 'wan' : id < 18 ? 'tong' : id < 27 ? 'tiao' : 'honors';
  const cell = back ? 7 : id < 27 ? id % 9 : id - 27;
  const [x, y, width, height] = tileBounds[atlas][cell] ?? tileBounds.honors[6];
  const content = <>
    <span
      className="tile-sprite-clip"
      aria-hidden="true"
      style={{
        backgroundImage: `url(/tiles/${atlas}.png)`,
        backgroundSize: `${ATLAS_SIZE / width * 100}% ${ATLAS_SIZE / height * 100}%`,
        backgroundPosition: `${x / (ATLAS_SIZE - width) * 100}% ${y / (ATLAS_SIZE - height) * 100}%`,
      }}
    />
    {wild && !back && <em>宝</em>}
  </>;
  const className = ['tile', 'realistic', small && 'small', back && 'back', selected && 'selected', wild && !back && 'wild'].filter(Boolean).join(' ');
  const label = back ? '暗牌' : tileName(id) + (wild ? '，宝牌' : '');

  return onClick
    ? <button className={className} aria-label={label + (selected ? '，已选中' : '')} aria-pressed={selected} title={label} onClick={onClick} disabled={disabled}>{content}</button>
    : <span className={className} role="img" aria-label={label} title={label}>{content}</span>;
}
