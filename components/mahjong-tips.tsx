import { ArrowRight, Lightbulb } from 'lucide-react';

const routes = [
  ['平胡', '已经有顺子、两面搭和一对将', '把四组面子和一对将分别找出来。优先处理多余的弱搭，别拆唯一的将。'],
  ['碰碰胡', '已有几组刻子或多对能升刻，顺子潜力弱', '碰前留一对当将。早吃过顺子后，这条路线就关了。'],
  ['七对', '起手对子多，散牌仍有机会配对', '保留暗手，比较凑齐七对还差几张。本站四张同牌可算两对，宝可补缺。'],
  ['十三烂／七星十三烂', '不同字牌多，数牌稀疏', '每门数牌分别排序，相邻点差至少 3。1、4、7 万合格，1、2、4、5 万放在一起就不行。七星还要齐七种字牌。'],
  ['九幺', '1、9 和字牌本来就多', '数还有几张中张必须换掉；重复的幺九和字牌也能用，可碰杠。若已吃出带中张的顺子，不能再做九幺。'],
];

const signals = [
  ['开局常丢孤张字牌、幺九', '可能在整理普通顺子手', '看随后是否吃顺子。前几张散牌信息很弱，七对起手也可能先丢孤张。'],
  ['连丢两门数牌，吃出的顺子集中在第三门', '可能主要留第三门', '看这个倾向是否持续，以及副露是否支持。本站清一色无额外加分，偏一门也可能只是起手自然集中。'],
  ['两三组碰杠，仍未吃顺子', '普通胡或碰碰胡都值得留意', '若碰杠都是幺九和字牌，同时不断打中张，也要考虑九幺。已经亮出的顺子足以排除碰碰胡。'],
  ['一直不吃碰，舍牌较多中张或重复牌', '可能保留特殊牌型，也可能在做门清平胡', '大量丢中张支持九幺的猜测；若连幺九、字牌也常打，证据就弱了。单靠牌河很难区分七对和十三烂。'],
  ['中后段连续拆出相邻牌，如先打八筒再打七筒', '可能在换路线或舍弃一组搭子', '结合之后的出牌和副露再判断。也可能是分两巡摸到的弃牌，不能直接认定听牌或猜出听口。'],
];

const drills = [
  ['两面还是嵌张？', '一个搭子是 4、5 万，另一个是 4、6 筒。若 3 万已全见、6 万只剩 1 张未见，5 筒有 3 张未见，哪组值得留？', '若两种拆法离听牌一样近、又不影响其他搭子，4、6 筒反而更好进：上限 3 张，对比 1 张。'],
  ['这家在做九幺吗？', '右家碰了九筒和白板，随后连打三张中张。你准备打九万，应该怎么看？', '九幺或碰碰胡都有可能，也可能只是普通胡。两组碰牌和舍牌方向一起看，比只看一张更有用。若九万未见很多，同样不伤自己时，可以考虑打一张更难被碰的牌。'],
  ['上家的牌该不该吃？', '你有 4、5 万的两面搭，上家打 6 万。你本来已听两种牌，吃完再打只剩一个几乎见光的单吊。', '先过。虽然多了一组亮牌，吃后却缩窄了实际自摸口。先把吃完要打的牌和新听口想清楚，再点吃。'],
  ['能把两组合在一起做十三烂吗？', '1、4 万和 2、5 万各自都差 3，四张同时留可以吗？', '不行。把同一花色的所有数牌放在一起排序，1 和 2、4 和 5 都只差 1。保留哪组，可再看其他万子、宝和剩余张数。'],
];

const sections = ['尽快听牌', '选择胡牌路线', '看弃牌猜目标', '吃碰杠与收尾', '实战小题'] as const;

export function MahjongTips({ onPlay }: { onPlay: () => void }) {
  const jump = (index: number) => document.getElementById(`mahjong-tip-${index}`)?.scrollIntoView({ block: 'start' });

  return (
    <article className="mahjong-tips">
      <header className="page-title">
        <h1>麻将技巧</h1>
        <p>从拆搭子、数进张，到看三家牌河。用本站上饶规则练习，每一巡都知道先看什么。</p>
      </header>
      <div className="rules-notice"><Lightbulb size={24} /><div>
        <strong>轮到你时，先做这三个判断</strong>
        <p>我离听牌还多远？哪种打法的有效牌剩得更多？打这张会不会顺手帮下家吃、帮别人碰杠？本站主要靠自摸，先把自己的摸牌机会和听口做好。</p>
      </div></div>
      <nav className="tips-index" aria-label="麻将技巧目录">
        {sections.map((title, index) => <button className="button light" key={title} onClick={() => jump(index)}>{title}</button>)}
      </nav>
      <section id="mahjong-tip-0" className="paper-panel">
        <h2>尽快听牌，先数步数，再数进张</h2>
        <ol className="tips-steps">
          <li><strong>起手按四组加一对看。</strong>顺子、刻子、杠各占一组。把成组的、差一张能成组的搭子、将牌分清。同一张牌可以有几种拆法，算进张时别同时用它拼两组。已有五个可靠的候选块时，再处理第六个弱块。</li>
          <li><strong>同样近时，优先留更容易进的形。</strong>45 万可摸 3 或 6，46 万只等 5，12 万只等 3。还没扣掉可见牌时，两面最多 8 张、嵌张或边张最多 4 张。孤张 5 可接 3、4、6、7 成搭，孤张 1 只可接 2、3 成搭，字牌只能靠同名牌成对或成刻。特殊牌型另算。</li>
          <li><strong>区分进张和胡张。</strong>能让手牌更接近听牌的是进张；摸了直接能胡的是胡张。比较两种出牌后，先问哪种更快到听牌，再比较能摸进多少张，以及摸进后会不会只剩一个难等的胡口。</li>
          <li><strong>按实际可见张数计算。</strong>每种牌最多 4 张，扣掉自己手里、四家牌河、亮出的副露和桌上指示牌。被吃碰后移到副露里的牌只算一次。剩下是未见张数的上限，其中一些可能在别人的暗手里。</li>
          <li><strong>靠宝修最难的一块。</strong>先用普通牌拼自然顺子、刻子，试着让宝去补缺牌的搭子或将。每次摸到宝都重新检查听口。本站宝可替牌胡，但不能用来吃碰杠；翻开的指示牌和实际宝牌是两种牌，要分别数。</li>
        </ol>
        <p className="formula">例：听 3、6 万，3 万已见 3 张，6 万已见 1 张，则两种合计最多还有 4 张未见。若改听单张 8 筒，而 8 筒已见 3 张，即使同样已听牌，后者也最多只剩 1 张。</p>
        <p>资料 <a href="https://arxiv.org/abs/2108.06832" target="_blank" rel="noreferrer">Li、Yan、Li 的麻将成牌距离研究</a></p>
      </section>
      <section id="mahjong-tip-1" className="paper-panel">
        <h2>起手选路线，摸两轮再更新</h2>
        <dl className="rule-list">{routes.map(([name, start, method]) => <div key={name}><dt>{name}</dt><dd><strong>{start}。</strong>{method}</dd></div>)}</dl>
        <p>普通胡只差一两步、特殊牌型还要大换牌时，想快胡就走普通路线。两条路线都接近时，先打两边都不需要的牌，留下一轮再决定。吃碰之前记得检查还能做哪些牌型。</p>
        <p>地方玩法参考 <a href="https://m.91y.com/news/wanfadaquan/majiangwanfa/2020/1214/2968.html" target="_blank" rel="noreferrer">91y 上饶麻将规则</a>、<a href="https://m.tcy365.com/news/d15065.html" target="_blank" rel="noreferrer">同城游的宝牌和九幺说明</a></p>
      </section>
      <section id="mahjong-tip-2" className="paper-panel">
        <h2>分别看三家的牌河，再用副露验证</h2>
        <p>每家记三件事：前几巡先扔什么、最近几巡方向有无改变、已经亮出了哪些组。先看能排除什么，再为剩下的可能保留两种解释。亮出的牌比单张弃牌更有说服力。</p>
        <div className="tips-signals">{signals.map(([visible, guess, check]) => (
          <div key={visible}><h3>{visible}</h3><p><strong>{guess}。</strong>{check}</p></div>
        ))}</div>
        <p>特别留意下家，因为只有下家能吃你的弃牌；三家都可能碰杠。比如下家连续吃万子，两张候选弃牌对自己同样有用时，可以先舍他较难吃的那张。某家先前打过 5 万也不能证明现在不会碰 5 万，之后可能又摸进了同名牌。</p>
        <p><strong>用数牌排除不可能的吃碰。</strong>如果你准备打五万，另外三张五万都在公开区域或自己手里，任何人都凑不出两张五万来碰。下家要吃五万，得有 3、4 万、4、6 万或 6、7 万中的一组。如果四张四万和四张六万都已见，也能排除下家吃这张五万。即使如此，五万仍可能是对方本可自摸的胡张。</p>
        <p><strong>三家分开记。</strong>例如右家吃了两组筒子，先关注给他吃筒子的机会；对家碰了白板和九条又一直打中张，把九幺列为候选；左家没亮牌、各门都有弃牌，先保留几种可能。过两巡再看公开动作有没有印证，别因为猜中一家就把同样的判断套到另外两家。</p>
        <p>复盘方法参考 <a href="https://www.ma-jan.or.jp/class_2/49536.html" target="_blank" rel="noreferrer">日本职业麻将联盟《牌谱复盘》</a>。这里只借用按顺序读弃牌、对照副露的观察方法；本站按上饶规则判断吃碰和自摸。</p>
      </section>
      <section id="mahjong-tip-3" className="paper-panel">
        <h2>吃碰杠之前，先想打哪张</h2>
        <ul className="tips-steps">
          <li><strong>吃弱搭通常比吃强搭更省牌。</strong>12 万等到上家打 3 万，吃后能更快听牌，通常值得考虑。45 万本来就有两面，先比较吃完的听口和过牌后保留的变化。</li>
          <li><strong>碰能马上成组，也可能碰掉唯一的将。</strong>如果手里只有一对，先找新将落在哪。碰字牌能把它从对子变成一组，但会锁定牌形，也会关闭七对和十三烂。</li>
          <li><strong>杠能补摸一张，仍要检查牌形。</strong>四张相同未必都闲着，其中一张可能同时支撑顺子。四张也能在本站七对里当两对。若已经听牌，先比较杠前杠后能胡哪些牌。</li>
          <li><strong>尾盘先看余牌和未见胡张。</strong>牌墙快空时，手里有几张真正能自摸的机会，比勉强改做高分牌更重要。若两个打法对自己进度相同，再选较少喂吃碰的一张；本站普通弃牌不会让别人直接点炮胡。</li>
          <li><strong>复盘一次关键出牌。</strong>先把当时看得到的牌记下，再比较两个舍牌选项。记录哪个更早听、哪个听得宽、牌河证据是否支持你的判断。别只凭下一张刚好摸到什么给自己打分。</li>
        </ul>
      </section>
      <section id="mahjong-tip-4" className="paper-panel">
        <h2>实战小题</h2>
        <div className="glossary">{drills.map(([title, question, answer]) => <div className="tips-drill" key={title}>
          <h3>{title}</h3><p>{question}</p>
          <details><summary>查看解析</summary><p>{answer}</p></details>
        </div>)}</div>
        <button className="button primary" onClick={onPlay}>上桌练一局<ArrowRight size={16} /></button>
      </section>
    </article>
  );
}
