import { tileName } from '@/lib/mahjong';
/** Each face is from an image-model generated, photographed-style tile atlas. No drawn face symbols. */
export function Tile({id,small=false,wild=false,back=false,selected=false,onClick,disabled=false}:{id:number;small?:boolean;wild?:boolean;back?:boolean;selected?:boolean;onClick?:()=>void;disabled?:boolean}){
 const atlas=back?'honors':id<9?'wan':id<18?'tong':id<27?'tiao':'honors';
 const cell=back?7:id<27?id%9:id-27;
 const content=<><span className="tile-sprite-clip" aria-hidden="true"><span className="tile-sprite" style={{backgroundImage:`url(/tiles/${atlas}.png)`,backgroundPosition:`${cell%3*50}% ${Math.floor(cell/3)*50}%`}}/></span>{wild&&!back&&<em>宝</em>}</>;
 const cls=`tile realistic ${small?'small':''} ${back?'back':''} ${selected?'selected':''} ${wild&&!back?'wild':''}`;
 const label=back?'暗牌':tileName(id)+(wild?'，宝牌':'');
 return onClick?<button className={cls} aria-label={label+(selected?'，已选中':'')} aria-pressed={selected} title={label} onClick={onClick} disabled={disabled}>{content}</button>:<span className={cls} role="img" aria-label={label} title={label}>{content}</span>;
}
