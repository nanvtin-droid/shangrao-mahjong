# 茶馆主视觉

## 实物麻将图集（追加）

- 生成方式：内置 `image_gen`，透明 PNG；所有文字、圆点、竹条、字牌和牌背均由模型直接生成，未用代码叠字绘图。
- `public/tiles/wan.png`：九宫格从左到右、从上到下，一万至九万。
- `public/tiles/tong.png`：九宫格从左到右、从上到下，一筒至九筒。
- `public/tiles/tiao.png`：九宫格从左到右、从上到下，一条至九条；一条采用传统鸟纹。
- `public/tiles/honors.png`：第一行东、南、西；第二行北、中、发；第三行白板、绿色牌背、空白牌。
- 视觉核对：数字一到九、筒子点数一到九、竹条二到九、东南西北中发及白板均已逐格检查。
- 图集是 3 × 3 等分网格；CSS 可用 `background-size: 300% 300%` 与 x/y 位置 `0% / 50% / 100%` 选择对应单元。每个单元内包括透明边距，牌体约占单元 64% 宽、85% 高；需在 UI 裁切盒内保持原图比例。

### 万子（首次生成）

Use case: product-mockup. Generate a production ready Mahjong tile SPRITE ATLAS, perfectly SQUARE 1536x1536, exactly THREE columns and THREE rows, nine identical invisible square cells. Transparent background. No visible grid lines. ONE isolated physical Mahjong tile centered in EACH cell. All 9 tiles identical position within their cells, identical scale and dimensions. Every tile has width 64% of cell and height 85% of cell, rectangular proportion width:height 0.75. Camera orthographic, perfectly straight-on front, nearly zero perspective, flat parallel front face, a thin jade-green lower edge visible at the bottom only, no skew or rotation. High end photorealistic creamy ivory bone-porcelain tiles with smooth subtly glossy surface, softly rounded squared corners, tiny natural porcelain texture, shallow engraved and ink-filled symbols. Warm neutral diffuse studio lighting, very soft tiny shadow only immediately below each tile. No prop, table, lettering outside the tiles, no labels, no title, no watermark.
This is the CHARACTERS (萬) SUIT of traditional Chinese Mahjong. Each front has two vertically arranged ENGRAVED glyphs: a clearly legible Chinese number above in dark cinnabar and traditional character 萬 below in deep red. Exact left-to-right row-major order:
ROW 1: 一萬, 二萬, 三萬.
ROW 2: 四萬, 五萬, 六萬.
ROW 3: 七萬, 八萬, 九萬.
Make each number precisely correct, especially 四, 五, 六, 七, 八, 九, in bold authentic traditional engraved Mahjong typography. No replacement or repeated numbers. This is an asset grid, not a photo of tiles on a table. Nine tiles and no other objects. Each cell must be 1/3 of image width by 1/3 of image height.

### 筒子（以万子牌体为参照编辑）

Use case: precise-object-edit. This reference is a square 3 by 3 sprite atlas of nine physical Mahjong tiles. Preserve the EXACT atlas layout, tile size and alignment, transparent background, 3 columns 3 rows, ivory porcelain material, thin green bottom edge, orthographic straight-on view, lighting and rounded corners. CHANGE ONLY THE ENGRAVED FACE ART on all nine tiles from the characters suit into the CIRCLES / DOTS / 筒 suit. Every circle is a distinct small decorative concentric ring engraved into the tile, authentic classic Mahjong ring patterns in dark jade green and cinnabar red. No Chinese characters and no labels. Extremely important: exact distinct circle counts, no missing or extra circle. Center and space the full circle patterns elegantly. ROW-MAJOR ORDER:
TOP LEFT: ONE large ornate jade green ring, central cinnabar dot.
TOP MIDDLE: TWO rings, one green above one red, vertical column of exactly 2.
TOP RIGHT: THREE rings in diagonal from upper left to lower right, green red green, exactly 3.
MIDDLE LEFT: FOUR rings, 2 by 2 square, exactly 4.
MIDDLE CENTER: FIVE rings: four green corner rings and one red ring at center (like five on a dice), exactly 5.
MIDDLE RIGHT: SIX rings, two columns of three rings, top row green, middle/bottom red, exactly 6.
BOTTOM LEFT: SEVEN rings: three green rings across diagonal upper area + four red rings in a 2 by 2 block below, exactly 7.
BOTTOM CENTER: EIGHT rings, two columns of four rings, exactly 8.
BOTTOM RIGHT: NINE rings, 3 columns and 3 rows, top green middle red bottom green, exactly 9.
Do not retain any characters from reference. Use the same nine physical tile body shapes from the reference. Output a square image with genuine alpha transparency.

### 条子（以万子牌体为参照编辑）

Use case: precise-object-edit. The reference is a square 3 by 3 Mahjong sprite atlas. Preserve EXACT grid positions, physical tile bodies and size, ivory porcelain material, thin jade-green bottom edge, orthographic straight-on camera, diffuse warm neutral light, and genuine transparent background. CHANGE ONLY all nine engraved tile face artworks into the BAMBOO / 索 / 条 suit of Chinese Mahjong. No Chinese text or numeral on these tiles. Match the carved ink-filled authentic Mahjong design. ONE bamboo stem means one small distinct straight thick vertically oriented bamboo stick with visible joints; do not draw bamboo branches or leaves except the bird on tile 1. Exact number of stems is essential. Nine faces in left-to-right row-major order:
TOP LEFT (1 bamboo): a single beautiful classic green peacock/bamboo sparrow engraved motif, jade green with tiny cinnabar details, no separate bamboo sticks.
TOP CENTER (2 bamboo): EXACTLY TWO distinct green bamboo stems, two side by side vertical sticks.
TOP RIGHT (3 bamboo): EXACTLY THREE green stems, one top center and two below left and right.
MIDDLE LEFT (4 bamboo): EXACTLY FOUR green stems, a 2 columns by 2 rows grid.
MIDDLE CENTER (5 bamboo): EXACTLY FIVE stems, four green at corners and one cinnabar red at exact center like dice five.
MIDDLE RIGHT (6 bamboo): EXACTLY SIX green stems, 3 columns by 2 rows grid.
BOTTOM LEFT (7 bamboo): EXACTLY SEVEN stems, one red centered at top, six green below in 3 columns by 2 rows grid. Count one plus six equals seven.
BOTTOM CENTER (8 bamboo): EXACTLY EIGHT green stems, 4 columns by 2 rows grid, each visibly separated; do not merge sticks.
BOTTOM RIGHT (9 bamboo): EXACTLY NINE stems, 3 columns by 3 rows grid, central column cinnabar red, outer columns green. Count three rows of three.
Every tile face centered inside its physical tile. Do not retain any character suit symbol from the reference. No additional art, labels or objects. Transparent square image, exactly 3x3 even cells.

### 字牌、牌背与空白（以万子牌体为参照编辑）

Use case: precise-object-edit. This reference is a square 3 by 3 sprite atlas of nine physical Mahjong tiles. Preserve EXACT positions and size of the nine tile bodies, transparent background, 3 columns 3 rows, ivory porcelain front material, thin jade-green bottom edge, orthographic straight-on view, lighting and softly squared corners. CHANGE ONLY THE ENGRAVED FACE ART into seven HONOR tiles plus one BACK VIEW and one blank tile. Nine cells in exact left-to-right row-major order:
TOP LEFT: one large clearly legible traditional Chinese character 東, dark nearly black jade ink, engraved authentic Mahjong calligraphy.
TOP CENTER: 南, dark nearly black jade ink.
TOP RIGHT: 西, dark nearly black jade ink.
MIDDLE LEFT: 北, dark nearly black jade ink.
MIDDLE CENTER: 中, deep cinnabar red ink.
MIDDLE RIGHT: 發, deep jade green ink, clearly legible traditional character (not simplified 发).
BOTTOM LEFT: white dragon 白板: ivory blank tile face with a thin elegant dark blue rectangular double-line frame engraved inset from the perimeter. The middle is empty ivory. NO Chinese character 白.
BOTTOM CENTER: THE BACK OF A TILE: entire visible front face is rich dark jade-green ceramic / bakelite, same physical rectangular shape and scale, softly rounded corners, subtle embossed diamond lattice texture with no word or drawing. A thin ivory layer at bottom edge indicates the reverse of same Mahjong tile.
BOTTOM RIGHT: one completely blank creamy ivory Mahjong tile, no character, no frame, no marks, with green lower edge, useful as blank tile.
No text or labels outside the tiles, no props. Output genuinely transparent square image. Do not retain any previous character suit artwork. Dark ink must be legible against ivory. All nine bodies stay centered in evenly divided 3x3 cells.

- 生成方式：内置 `image_gen`，全新图像，非透明背景。
- 网站资产：`public/teahouse.png`
- 用途：桌面与手机首页的山水茶馆主视觉。
- 画面：暖色茶馆、木窗、上饶江南山水、徽派建筑、麻将与茶具；左侧保留浅色留白，供网页排版。

## 最终提示词

Use case: stylized-concept.
Asset type: Wide website hero illustration, landscape 16:9.
Primary request: A serene, charming Jiangnan mahjong teahouse in Shangrao, Jiangxi, rendered as an exquisite handcrafted clay miniature diorama. Warm ivory paper backdrop, jade green mountains, white Huizhou houses with dark tiled roofs behind wooden lattice windows; a wooden tea table with an orderly row of creamy white mahjong tiles with deep green backs, a ceramic teacup releasing soft steam, and a small potted plant.
Composition: Most detailed scene and visual focus occupy the right two thirds. The left third has softly fading warm cream negative space suitable for overlaid website text. Table tiles large enough to recognize as mahjong; clean restrained scene, no people. A little playful without looking childish. Organic round edges and handmade ceramic textures, sophisticated editorial art direction.
Lighting: Warm gentle afternoon sunlight, tactile soft shadows, misty layered emerald mountain scenery, cozy immersive ambience.
Palette: warm rice-paper ivory #f5f1e7, forest jade #245845, sage green, warm honey wood, tiny restrained cinnabar red accents.
Constraints: No written text, no titles, no logos, no watermark, no UI elements. No harsh black background, no neon. High quality detailed illustration.
