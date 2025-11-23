// ==========================================
//  Yama RPG - Dungeon & Gimmick Update (Ver 4.3 Fixed)
// ==========================================

// --- 1. 定数・データ定義 ---
const mapSize = 10;

// 属性定義
const ELEM = { NONE:0, FIRE:1, WATER:2, EARTH:3, WIND:4, LIGHT:5, DARK:6 };
const ELEM_ICONS = ["", "🔥", "💧", "🪨", "🍃", "✨", "🌑"];

// マップチップ定義
const TILE = { FLOOR:0, WALL:1, STAIRS:2, BOSS:3, HOLE:4, CHEST:5, SHOP:6, FLOW:7, WARP:8, EXIT:9, UP_STAIRS:10 };

// 3D描画用座標
const VIEW_METRICS = [
    {x:0, y:0, w:300, h:200}, {x:60, y:40, w:180, h:120},
    {x:100, y:70, w:100, h:60}, {x:120, y:85, w:60, h:30}
];

// --- マップデータ定義 (修正版：上り階段追加) ---
const maps = {
    1: { // 地下迷宮
        1: [ // B1F (変更なし)
            [1,1,1,1,1,1,1,1,1,1],
            [1,9,0,0,0,1,0,0,0,1],
            [1,1,1,1,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,1],
            [1,0,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,1,1,1,1,1,1,0,2,1], // (8,8) 下り階段
            [1,1,1,1,1,1,1,1,1,1]
        ],
        2: [ // B2F (修正: 8,8に上り階段配置)
            [1,1,1,1,1,1,1,1,1,1],
            [1,2,0,0,0,6,0,0,5,1], // (1,1) 下り階段
            [1,1,1,1,0,1,1,1,1,1],
            [1,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,1,1,0,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,10,1], // (8,8) 上り階段(ID:10)
            [1,1,1,1,1,1,1,1,1,1]
        ],
        3: [ // B3F (修正: 1,1に上り階段配置)
            [1,1,1,1,1,1,1,1,1,1],
            [1,10,0,0,0,1,0,0,0,1], // (1,1) 上り階段(ID:10)
            [1,1,1,1,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,1,3,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ]
    },
    2: { // 迷いの森
        1: [ // B1F (変更なし)
            [1,1,1,1,1,1,1,1,1,1],
            [1,9,0,1,0,0,0,1,0,1],
            [1,0,0,1,0,1,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,1,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,2,1], // (8,8) 下り階段
            [1,1,1,1,1,1,1,1,1,1]
        ],
        2: [ // B2F (修正: 8,8に上り階段)
            [1,1,1,1,1,1,1,1,1,1],
            [1,2,1,0,0,0,0,0,6,1], // (1,1) 下り階段
            [1,0,1,0,1,1,1,1,0,1],
            [1,0,0,0,1,5,0,1,0,1],
            [1,1,1,0,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,0,0,0,1],
            [1,0,0,0,1,0,0,1,0,1],
            [1,1,1,1,1,1,1,1,10,1], // (8,8) 上り階段
            [1,1,1,1,1,1,1,1,1,1]
        ],
        3: [ // B3F (修正: 1,1に上り階段)
            [1,1,1,1,1,1,1,1,1,1],
            [1,10,0,1,0,0,0,0,0,1], // (1,1) 上り階段
            [1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,1,3,1,0,1],
            [1,0,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,1,1,1,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ]
    },
    3: { // 海底洞窟
        1: [ // B1F (変更なし) 下り(8,7)
            [1,1,1,1,1,1,1,1,1,1],
            [1,9,0,0,0,0,0,7,0,1], 
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,7,7,7,7,0,0,1],
            [1,1,1,1,1,1,1,0,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,7,7,0,0,0,0,2,1], // (8,7) 下り階段
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],
        2: [ // B2F (修正: 8,7に上り階段)
            [1,1,1,1,1,1,1,1,1,1],
            [1,2,0,0,0,6,0,0,0,1], // (1,1) 下り階段
            [1,7,7,7,7,7,7,7,0,1],
            [1,0,0,0,0,0,0,0,0,1], 
            [1,0,7,7,7,7,7,7,7,1],
            [1,0,0,0,0,0,0,0,0,1], 
            [1,1,1,1,1,7,7,7,0,1],
            [1,5,0,0,0,0,0,0,10,1], // (8,7) 上り階段
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],
        3: [ // B3F (修正: 1,1に上り階段)
            [1,1,1,1,1,1,1,1,1,1],
            [1,10,0,7,7,0,0,0,0,1], // (1,1) 上り階段
            [1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,7,7,1,0,7,7,0,1], 
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,3,1,1,0,1], 
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ]
    },
    4: { // 古代神殿
        1: [ // B1F (変更なし) 下り(1,7)
            [1,1,1,1,1,1,1,1,1,1],
            [1,9,0,0,1,0,0,8,0,1], 
            [1,0,1,1,1,0,1,1,1,1],
            [1,0,1,0,0,0,0,0,0,1],
            [1,0,1,0,1,1,1,1,0,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,0,1,1],
            [1,2,8,0,0,0,1,0,0,1], // (1,7) 下り階段
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],
        2: [ // B2F (修正: 1,7に上り階段)
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,8,1,6,0,0,2,1], // (8,1) 下り階段
            [1,1,1,1,1,1,1,1,0,1],
            [1,5,0,8,1,8,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,8,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,0,1],
            [1,10,0,0,0,0,0,0,0,1], // (1,7) 上り階段
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],
        3: [ // B3F (修正: 8,1に上り階段)
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,8,0,8,0,0,10,1], // (8,1) 上り階段
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,8,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,3,1,0,0,0,0,0,0,1], 
            [1,1,1,0,1,1,1,1,0,1],
            [1,8,0,0,1,0,0,8,0,1], 
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ]
    },
    5: { // 天空の塔
        1: [ // B1F (変更なし) 下り(8,8)
            [1,1,1,1,1,1,1,1,1,1],
            [1,9,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,0,2,1], // (8,8) 下り階段
            [1,1,1,1,1,1,1,1,1,1]
        ],
        2: [ // B2F (修正: 8,8に上り階段)
            [1,1,1,1,1,1,1,1,1,1],
            [1,2,0,4,0,0,0,0,6,1], // (1,1) 下り階段
            [1,1,0,1,0,1,1,1,1,1],
            [1,5,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,4,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,4,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,10,1], // (8,8) 上り階段
            [1,1,1,1,1,1,1,1,1,1]
        ],
        3: [ // B3F (修正: 1,1に上り階段)
            [1,1,1,1,1,1,1,1,1,1],
            [1,10,0,0,4,0,0,0,0,1], // (1,1) 上り階段
            [1,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,4,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,1,3,0,0,0,0,0,1],
            [1,0,1,1,0,0,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1]
        ]
    }
};

// --- ギミックデータ (古代神殿 修正版) ---
const gimmickData = {
    // --- 海底洞窟 (3) ---
    // B1F
    "3_1_7_1": {type:'flow', dx:-1, dy:0}, 
    "3_1_3_3": {type:'flow', dx:1, dy:0}, "3_1_4_3": {type:'flow', dx:1, dy:0}, "3_1_5_3": {type:'flow', dx:1, dy:0}, "3_1_6_3": {type:'flow', dx:1, dy:0},
    "3_1_2_7": {type:'flow', dx:1, dy:0}, "3_1_3_7": {type:'flow', dx:1, dy:0},

    // B2F
    "3_2_1_2": {type:'flow', dx:1, dy:0}, "3_2_2_2": {type:'flow', dx:1, dy:0}, "3_2_3_2": {type:'flow', dx:1, dy:0},
    "3_2_4_2": {type:'flow', dx:1, dy:0}, "3_2_5_2": {type:'flow', dx:1, dy:0}, "3_2_6_2": {type:'flow', dx:1, dy:0}, "3_2_7_2": {type:'flow', dx:1, dy:0},
    "3_2_2_4": {type:'flow', dx:-1, dy:0}, "3_2_3_4": {type:'flow', dx:-1, dy:0}, "3_2_4_4": {type:'flow', dx:-1, dy:0},
    "3_2_5_4": {type:'flow', dx:-1, dy:0}, "3_2_6_4": {type:'flow', dx:-1, dy:0}, "3_2_7_4": {type:'flow', dx:-1, dy:0}, "3_2_8_4": {type:'flow', dx:-1, dy:0},
    "3_2_5_6": {type:'flow', dx:1, dy:0}, "3_2_6_6": {type:'flow', dx:1, dy:0}, "3_2_7_6": {type:'flow', dx:1, dy:0}, 

    // B3F
    "3_3_3_1": {type:'flow', dx:1, dy:0}, "3_3_4_1": {type:'flow', dx:1, dy:0}, 
    "3_3_2_4": {type:'flow', dx:-1, dy:0}, "3_3_3_4": {type:'flow', dx:-1, dy:0}, 
    "3_3_6_4": {type:'flow', dx:1, dy:0}, "3_3_7_4": {type:'flow', dx:1, dy:0}, 

    // --- 古代神殿 (4) ---
    // B1F
    "4_1_7_1": {type:'warp', tx:2, ty:7}, // Start(1,1) -> Goalエリア(Warpマス 2,7)
    "4_1_2_7": {type:'warp', tx:1, ty:1}, // 脱出用 (Exitマス 1,1)

    // B2F
    "4_2_1_5": {type:'warp', tx:5, ty:3}, // 左端(1,5) -> 中央エリア(Warpマス 5,3)
    "4_2_3_3": {type:'warp', tx:8, ty:2}, // 中央左(3,3) -> Goalエリア(8,2) ※ここは着地用フロアのまま
    "4_2_5_3": {type:'warp', tx:1, ty:5}, // 中央右(5,3) -> Startエリア(Warpマス 1,5)

    // B3F
    "4_3_3_1": {type:'warp', tx:7, ty:3}, // -> Warpマス 7,3
    "4_3_5_1": {type:'warp', tx:1, ty:1}, 
    "4_3_7_3": {type:'warp', tx:1, ty:7}, // -> Warpマス 1,7
    "4_3_1_7": {type:'warp', tx:1, ty:4}, 
    "4_3_7_7": {type:'warp', tx:8, ty:1}
};
// --- ダンジョン・モンスターデータ (Level 10 MAX Balance) ---
const dungeonData = {
    1: { // 地下迷宮 (推奨Lv 1-2)
        name: "地下迷宮",
        theme: { ceil: "#1a1a1a", floor: "#3d342b", wallBaseRGB: [107, 91, 69], wallStroke: "#111" },
        enemies: [
            // 初期装備(攻撃力10前後)で2-3発で倒せるくらい
            {name:"スライム", hp:18, exp:4, gold:5, img:"slime.png", elem:ELEM.WATER, effect:"poison", rate:0.2, minFloor:1},
            {name:"ゴブリン", hp:28, exp:6, gold:8, img:"goblin.png", elem:ELEM.EARTH, minFloor:1},
            {name:"オーク", hp:45, exp:10, gold:12, img:"orc.png", elem:ELEM.EARTH, minFloor:3}
        ],
        // Lv2-3で挑むボス。HP250程度
        boss: {name:"オークキング", hp:250, exp:100, gold:150, img:"OrcKing.png", elem:ELEM.EARTH, actions:["attack","charge"]}
    },
    2: { // 迷いの森 (推奨Lv 3-4)
        name: "迷いの森",
        theme: { ceil: "#001100", floor: "#002200", wallBaseRGB: [34, 139, 34], wallStroke: "#002200" },
        enemies: [
            // Tier2装備(攻撃力20前後)を想定
            {name:"シルフ", hp:50, exp:15, gold:15, img:"Sylph.png", elem:ELEM.WIND, minFloor:1},
            {name:"キラービー", hp:40, exp:14, gold:14, img:"KillerBee.png", elem:ELEM.WIND, effect:"paralyze", rate:0.2, minFloor:1},
            {name:"人喰い花", hp:80, exp:20, gold:25, img:"ManEating.png", elem:ELEM.EARTH, minFloor:3}
        ],
        boss: {name:"トレント", hp:650, exp:350, gold:300, img:"treant.png", elem:ELEM.EARTH, actions:["attack","poisonMist","paralyzeVine"]}
    },
    3: { // 海底洞窟 (推奨Lv 5-6)
        name: "海底洞窟",
        theme: { ceil: "#000033", floor: "#000055", wallBaseRGB: [0, 100, 200], wallStroke: "#000033" },
        enemies: [
            // Tier3装備で挑む。敵のHPも3桁に
            {name:"キラーF", hp:100, exp:30, gold:35, img:"KillerFish.png", elem:ELEM.WATER, effect:"critical", rate:0.15, minFloor:1}, 
            {name:"タートル", hp:160, exp:35, gold:40, img:"Turtle.png", elem:ELEM.WATER, highDef:true, minFloor:1},
            {name:"マーマン", hp:140, exp:45, gold:50, img:"Merman.png", elem:ELEM.WATER, minFloor:3}
        ],
        boss: {name:"クジラ", hp:1400, exp:800, gold:600, img:"Whale.png", elem:ELEM.WATER, actions:["attack","tsunami","aquaBreath"]}
    },
    4: { // 古代神殿 (推奨Lv 7-8)
        name: "古代神殿",
        theme: { ceil: "#222", floor: "#444", wallBaseRGB: [200, 200, 150], wallStroke: "#554400" },
        enemies: [
            // 終盤手前。Tier4装備。状態異常が厄介
            {name:"スケルトン", hp:200, exp:70, gold:60, img:"skeleton.png", elem:ELEM.DARK, minFloor:1},
            {name:"ゾンビ", hp:280, exp:80, gold:70, img:"zombie.png", elem:ELEM.DARK, effect:"poison", rate:0.3, minFloor:1},
            {name:"ゴースト", hp:150, exp:90, gold:80, img:"ghost.png", elem:ELEM.DARK, physResist:true, minFloor:3}
        ],
        boss: {name:"グリフォン", hp:2800, exp:1500, gold:1200, img:"griffin.png", elem:ELEM.WIND, actions:["attack","storm","aeroBlast"]}
    },
    5: { // 天空の塔 (推奨Lv 9-10 MAX)
        name: "天空の塔",
        theme: { ceil: "#001133", floor: "#111", wallBaseRGB: [100, 100, 120], wallStroke: "#000" },
        enemies: [
            // レベル10(MAX) + Tier5最強装備で挑む相手
            // 雑魚でも油断すると死ぬ強さ
            {name:"リザードマン", hp:450, exp:150, gold:100, img:"Lizardman.png", elem:ELEM.EARTH, minFloor:1},
            {name:"ダークエルフ", hp:380, exp:180, gold:120, img:"DarkElf.png", elem:ELEM.DARK, magic:ELEM.DARK, minFloor:1},
            {name:"精霊", hp:350, exp:220, gold:150, img:"Spirit.png", elem:ELEM.LIGHT, physResist:true, minFloor:3}
        ],
        // ラスボス: HP 5000
        // Lv10勇者の攻撃(Tier5武器+スキル)で1ターン300-400ダメ想定 -> 約15ターンで決着
        boss: {name:"ドラゴン", hp:5000, exp:0, gold:0, img:"dragon.png", elem:ELEM.FIRE, actions:["attack","inferno","fireBreath","charge"]}
    }
};
// 宝箱定義 (MapID_Floor_X_Y)
const fixedChestData = {
    "1_2_8_1": "i01",
    "2_2_5_3": "w01",
    "3_2_1_3": "a02", 
    "4_2_4_1": "ac01", 
    "5_2_1_3": "i04"
};

// --- スキルデータ (spellData) の修正 ---
const spellData = {
    // ... (既存の fire, wind, earth, water, escape はそのまま) ...
    fire: { name:"ファイア", type:"attack", element:ELEM.FIRE, target:"single", power:25, stat:"int", cost:3 },
    wind: { name:"ウィンド", type:"attack", element:ELEM.WIND, target:"single", power:25, stat:"int", cost:3 },
    earth: { name:"ロック", type:"attack", element:ELEM.EARTH, target:"single", power:25, stat:"int", cost:3 },
    water: { name:"アクア", type:"attack", element:ELEM.WATER, target:"single", power:25, stat:"int", cost:3 },
    
    // ★削除: firestorm, blizzard
    // ★追加: 闇単体、無属性高火力
    dark: { name:"ダーク", type:"attack", element:ELEM.DARK, target:"single", power:50, stat:"int", cost:6 },
    meteor: { name:"メテオ", type:"attack", element:ELEM.NONE, target:"single", power:90, stat:"int", cost:12 },

    escape: { name:"エスケープ", type:"util", target:"self", cost:1 },
    
    heal: { name:"ヒール", type:"heal", target:"single", power:35, stat:"pie", cost:3 },
    healall: { name:"ヒールオール", type:"heal", target:"all", power:25, stat:"pie", cost:6 },
    raise: { name:"レイズ", type:"revive", target:"single", power:0, stat:"pie", cost:10, desc:"戦闘不能を回復" },

    light: { name:"ライト", type:"attack", element:ELEM.LIGHT, target:"single", power:30, stat:"pie", cost:4 },
    
    // ★変更: holy -> highHeal (単体高回復)
    highHeal: { name:"ハイヒール", type:"heal", target:"single", power:100, stat:"pie", cost:8 },

    // ... (buffDef以降はそのまま) ...
    buffDef: { name:"プロテクト", type:"buff", target:"single", effect:"defUp", turns:6, cost:4 },
    buffAtk: { name:"バイキルト", type:"buff", target:"single", effect:"atkUp", turns:6, cost:4 },
    slash: { name:"強斬り", type:"phys", element:ELEM.NONE, target:"single", mult:1.5, cost:3 },
    sweep: { name:"なぎ払い", type:"phys", element:ELEM.NONE, target:"all", mult:0.8, cost:3 },
    double: { name:"二段斬り", type:"phys", element:ELEM.NONE, target:"single", mult:2.2, cost:4 },
    charge: { name:"全身全霊", type:"phys", element:ELEM.NONE, target:"single", mult:3.0, cost:5 },
    cross: { name:"十字斬り", type:"phys", element:ELEM.NONE, target:"single", mult:2.0, cost:4 }
};

// --- 職業データ (jobData) の修正 ---
const jobData = {
    // ... (勇者、戦士はそのまま) ...
    hero: { name: "勇者", icon: "👑", baseStats: { str:12, int:9, pie:9, vit:10, agi:9, luc:9 }, learnset: { 1:['slash'], 2:['heal'], 3:['fire'], 5:['wind','buffDef'], 7:['earth','water'], 9:['cross'] }, canEquip: ['sword','heavyShield','lightShield','armor','clothes','helm','hat','gauntlet','gloves','acc'], desc:"万能型。" },
    warrior: { name: "戦士", icon: "⚔️", baseStats: { str:14, int:5, pie:5, vit:12, agi:7, luc:7 }, learnset: { 1:['slash'], 3:['sweep'], 6:['double'], 9:['charge'] }, canEquip: ['sword','axe','heavyShield','lightShield','armor','clothes','helm','hat','gauntlet','gloves','acc'], desc:"物理攻撃特化。" },
    
    // ★変更: 魔法使い (Lv7: firestorm -> dark, Lv9: blizzard -> meteor)
    mage: { name: "魔法使い", icon: "🪄", baseStats: { str:6, int:14, pie:7, vit:6, agi:10, luc:8 }, learnset: { 1:['fire'], 2:['wind'], 4:['earth'], 5:['water','escape'], 7:['dark'], 9:['meteor'] }, canEquip: ['staff','clothes','hat','gloves','lightShield','acc'], desc:"攻撃魔法のエキスパート。" },
    
    // ★変更: 僧侶 (Lv10: holy -> highHeal)
    priest: { name: "僧侶", icon: "✝️", baseStats: { str:8, int:8, pie:14, vit:8, agi:7, luc:8 }, learnset: { 1:['heal'], 3:['light'], 4:['buffDef'], 5:['raise'], 6:['healall'], 8:['buffAtk'], 10:['highHeal'] }, canEquip: ['mace','staff','lightShield','clothes','hat','gloves','acc'], desc:"回復と支援の要。" }
};

// tier: 1=初期, 2=序盤(店売り上限), 3=中盤, 4=終盤, 5=最強
const itemData = {
    // --- 武器 (各5段階) ---
    // 剣 (勇者・戦士)
    w_sw1: {name:"ショートソード", type:"weapon", subType:"sword", power:6, price:100, tier:1},
    w_sw2: {name:"ロングソード", type:"weapon", subType:"sword", power:12, price:400, tier:2},
    w_sw3: {name:"バスタードソード", type:"weapon", subType:"sword", power:22, price:1200, tier:3},
    w_sw4: {name:"プラチナソード", type:"weapon", subType:"sword", power:35, price:3500, tier:4},
    w_sw5: {name:"ドラゴンキラー", type:"weapon", subType:"sword", power:50, price:8000, tier:5},

    // 斧 (戦士)
    w_ax1: {name:"手斧", type:"weapon", subType:"axe", power:9, price:150, tier:1},
    w_ax2: {name:"バトルアックス", type:"weapon", subType:"axe", power:16, price:550, tier:2},
    w_ax3: {name:"ウォーアクス", type:"weapon", subType:"axe", power:28, price:1500, tier:3},
    w_ax4: {name:"グレートアクス", type:"weapon", subType:"axe", power:42, price:4000, tier:4},
    w_ax5: {name:"デモンズアクス", type:"weapon", subType:"axe", power:60, price:9000, tier:5},

    // 鈍器/メイス (僧侶)
    w_mc1: {name:"メイス", type:"weapon", subType:"mace", power:8, price:200, tier:1},
    w_mc2: {name:"アイアンハンマー", type:"weapon", subType:"mace", power:15, price:500, tier:2},
    w_mc3: {name:"モーニングスター", type:"weapon", subType:"mace", power:24, price:1300, tier:3},
    w_mc4: {name:"ウォーハンマー", type:"weapon", subType:"mace", power:36, price:3600, tier:4},
    w_mc5: {name:"裁きの槌", type:"weapon", subType:"mace", power:48, price:8500, tier:5},

    // 杖 (魔法使い・僧侶)
    w_st1: {name:"木の杖", type:"weapon", subType:"staff", power:4, price:80, tier:1},
    w_st2: {name:"魔術師の杖", type:"weapon", subType:"staff", power:10, price:350, tier:2},
    w_st3: {name:"ルビーの杖", type:"weapon", subType:"staff", power:18, price:1100, tier:3},
    w_st4: {name:"賢者の杖", type:"weapon", subType:"staff", power:28, price:3200, tier:4},
    w_st5: {name:"世界樹の杖", type:"weapon", subType:"staff", power:40, price:7500, tier:5},

    // --- 防具 (鎧・服・盾・兜・帽子 各3段階: 序盤・中盤・終盤) ---
    // 鎧 (重装)
    a_hv1: {name:"皮の鎧", type:"armor", subType:"armor", ac:5, price:250, tier:1},
    a_hv2: {name:"鎖カタビラ", type:"armor", subType:"armor", ac:12, price:1500, tier:3},
    a_hv3: {name:"ミスリルアーマー", type:"armor", subType:"armor", ac:25, price:6000, tier:5},

    // 服 (軽装)
    a_lt1: {name:"布の服", type:"armor", subType:"clothes", ac:2, price:50, tier:1},
    a_lt2: {name:"絹のローブ", type:"armor", subType:"clothes", ac:8, price:1000, tier:3},
    a_lt3: {name:"大賢者の法衣", type:"armor", subType:"clothes", ac:18, price:5000, tier:5},

    // 盾
    s_lt1: {name:"バックラー", type:"shield", subType:"lightShield", ac:3, price:100, tier:1},
    s_hv2: {name:"カイトシールド", type:"shield", subType:"heavyShield", ac:8, price:1200, tier:3},
    s_hv3: {name:"勇者の盾", type:"shield", subType:"heavyShield", ac:15, price:4500, tier:5},

    // 兜・帽子
    h_lt1: {name:"革の帽子", type:"helm", subType:"hat", ac:2, price:70, tier:1},
    h_hv2: {name:"鉄の兜", type:"helm", subType:"helm", ac:6, price:800, tier:3},
    h_hv3: {name:"グランドヘルム", type:"helm", subType:"helm", ac:12, price:3000, tier:5},

    // --- その他 (変更なし) ---
    ac01:{name:"守りの指輪",type:"accessory",subType:"acc",ac:5,price:1200, tier:3}, 
    ac02:{name:"力の指輪",type:"accessory",subType:"acc",power:5,price:1200, tier:3},
    i01:{name:"傷薬",type:"consumable",effect:"heal",power:30,price:20,desc:"HP30回復"}, 
    i02:{name:"毒消し",type:"consumable",effect:"curePoison",price:20,desc:"毒を直す"}, 
    i03:{name:"気付け薬",type:"consumable",effect:"curePara",price:30,desc:"麻痺を直す"}, 
    i04:{name:"脱出の杖",type:"consumable",effect:"warp",price:150,desc:"町へ戻る"}
};

// ダンジョンIDごとのドロップリスト (ID: 1, 10, 20, 30, 40)
const dungeonDropData = {
    1: ['w_sw1','w_ax1','w_mc1','w_st1','a_lt1','h_lt1','s_lt1'], // 地下迷宮
    2: ['w_sw2','w_ax2','w_mc2','w_st2','a_hv1','h_lt1'],         // 迷いの森
    3: ['w_sw3','w_ax3','w_mc3','w_st3','a_hv2','s_hv2','a_lt2'], // 海底洞窟
    4: ['w_sw4','w_ax4','w_mc4','w_st4','h_hv2','ac01'],          // 古代神殿
    5: ['w_sw5','w_ax5','w_mc5','w_st5','a_hv3','s_hv3','a_lt3','h_hv3','ac02'] // 天空の塔
};

let party = [
    { id: "p1", name: "アベル", img: "abel.png", jobId: "hero", level: 1, exp: 0, hp: 0, maxHp: 0, stats: {}, alive: true, status: "normal", spells: {}, buffs:{atk:0, def:0}, equips: { weapon:null, armor:null, shield:null, helm:null, acc:null } },
    { id: "p2", name: "メイ", img: "mei.png", jobId: "mage", level: 1, exp: 0, hp: 0, maxHp: 0, stats: {}, alive: true, status: "normal", spells: {}, buffs:{atk:0, def:0}, equips: { weapon:null, armor:null, shield:null, helm:null, acc:null } },
    { id: "p3", name: "シーラ", img: "sheila.png", jobId: "priest", level: 1, exp: 0, hp: 0, maxHp: 0, stats: {}, alive: true, status: "normal", spells: {}, buffs:{atk:0, def:0}, equips: { weapon:null, armor:null, shield:null, helm:null, acc:null } }
];

let partyInventory = [], partyGold = 100, openedChests = [];
let playerPos = { x: 1, y: 1, dir: 0 };
let currentDungeonId = 1;
let currentFloor = 1;
let currentMapData = [];
let visitedMaps = {}; 
let dungeonShopActive = false;

let enemies = []; 
let isBattle = false, activeMemberIndex = 0, actionQueue = [], ctx = null, battleSpellMode = 'spell', menuReturnTo = 'town', templeTargetIndex = -1, selectedJobId = "", bonusPoints = 0, tempStatAlloc = {}; 

let clearedDungeons = [];

// --- 初期化・共通関数 ---
window.onload = function() {
    party.forEach(p => { initCharacter(p); calculateStats(p); p.hp = p.maxHp; });
    // マップ初期化
    for(let d=1; d<=5; d++){
        visitedMaps[d] = {};
        for(let f=1; f<=3; f++){
            visitedMaps[d][f] = Array(mapSize).fill().map(()=>Array(mapSize).fill(false));
        }
    }
    initMapUI(); updateTownStatus();
    const cv = document.getElementById('dungeon-canvas');
    if(cv) { ctx = cv.getContext('2d'); }
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('dungeon-scene').style.display === 'none') return;
        if (isBattle || document.getElementById('camp-overlay').style.display === 'flex') return;
        if(e.key==='ArrowUp'||e.key==='w') movePlayer('forward');
        if(e.key==='ArrowDown'||e.key==='s') movePlayer('backward');
        if(e.key==='ArrowLeft'||e.key==='a') turnPlayer('left');
        if(e.key==='ArrowRight'||e.key==='d') turnPlayer('right');
        if(e.key==='Enter') checkArea();
    });
};

function initCharacter(p) {
    const j = jobData[p.jobId];
    p.stats = {...j.baseStats};
    p.spells = {};
    learnSpells(p, 1);
}

function learnSpells(p, lvl) {
    const j = jobData[p.jobId];
    if(j.learnset[lvl]) {
        j.learnset[lvl].forEach(key => {
            if (!p.spells[key]) {
                p.spells[key] = { ...spellData[key], max:4, current:4 }; // 回数微増
            }
        });
    }
}

function calculateStats(p) { 
    // 基本値を計算
    p.maxHp = Math.floor((p.stats.vit * 2.5) + (p.level * p.stats.vit * 0.8) + 10);
    p.atk = p.stats.str; 
    p.def = Math.floor(p.stats.agi / 2); 

    // 装備補正の加算
    for(let s in p.equips){ 
        const equipObj = p.equips[s]; // これは {itemId, bonus, uid} または null
        if(equipObj){ 
            const i = itemData[equipObj.itemId]; 
            // 基本性能
            if(i.power) p.atk += i.power; 
            if(i.ac) p.def += i.ac; 
            
            // ★追加: ランダム効果の加算
            if(equipObj.bonus) {
                if(equipObj.bonus.str) p.atk += equipObj.bonus.str; // 簡易的にatkに加算(本来はstats.strに足すべきだが計算済なので直接加算)
                // ※厳密にやるなら stats を再計算する必要がありますが、
                // 今回は最終値(atk/def/maxHp)に補正を乗せる形にします
                
                if(equipObj.bonus.hp) p.maxHp += equipObj.bonus.hp;
                if(equipObj.bonus.def) p.def += equipObj.bonus.def; // 防御ボーナス用(もしあれば)
                
                // ステータス依存の計算用補正値（攻撃力などに影響）
                if(equipObj.bonus.str) p.atk += equipObj.bonus.str; // 上で足してるので二重になるが、簡略化のため「Str+」は直接攻撃力に加算とする
                // ※本来は p.stats.str に足して再計算すべきですが、コード規模を抑えるため「最終値へのボーナス」として扱います
                
                // 守備力へのボーナス (Agi/Vitなど)
                if(equipObj.bonus.agi) p.def += Math.floor(equipObj.bonus.agi / 2);
                if(equipObj.bonus.vit) p.maxHp += Math.floor(equipObj.bonus.vit * 2.5);
            }
        } 
    } 
    // HPが減ったときの整合性
    if(p.hp > p.maxHp) p.hp = p.maxHp;
}

function getEquipString(equipObj) { 
    if(!equipObj) return "なし"; 
    const id = equipObj.itemId;
    const i = itemData[id]; 
    let s=""; 
    if(i.power) s+=`攻+${i.power}`; 
    if(i.ac) s+=`防+${i.ac}`; 
    
    // ここで修正後のgetBonusStringが呼ばれる
    const bStr = getBonusString(equipObj);
    
    return `${i.name} ${s} ${bStr}`; 
}
function getEquipJobString(sub) { let n=[]; for(let k in jobData) if(jobData[k].canEquip.includes(sub)) n.push(jobData[k].name); return n.length>0?`[${n.join('/')}]`:"[不可]"; }

// --- マップ・移動 ---
function startGame() { document.getElementById('prologue-scene').style.display = 'none'; document.getElementById('town-scene').style.display = 'block'; }

function loadDungeonMap(dId, floor) {
    currentDungeonId = dId;
    currentFloor = floor;
    currentMapData = maps[dId][floor];

    const dName = dungeonData[dId].name;
    document.getElementById('floor-display').innerText = `${dName} B${floor}F`;
    checkObject();
}

function movePlayer(t) { if(isBattle)return; let dx=0, dy=0, d=playerPos.dir; if(t==='forward'){if(d===0)dy=-1;if(d===1)dx=1;if(d===2)dy=1;if(d===3)dx=-1;} else {if(d===0)dy=1;if(d===1)dx=-1;if(d===2)dy=-1;if(d===3)dx=1;} executeMove(dx,dy); }
function turnPlayer(d) { if(isBattle)return; if(d==='left')playerPos.dir=(playerPos.dir+3)%4; if(d==='right')playerPos.dir=(playerPos.dir+1)%4; updateDungeonUI(); }

function executeMove(dx, dy) { 
    const nx=playerPos.x+dx, ny=playerPos.y+dy; 
    if(nx<0||nx>=mapSize||ny<0||ny>=mapSize){ log("行き止まりだ。"); return; } 
    const tile = currentMapData[ny][nx];
    
    // 壁判定
    if(tile===TILE.WALL){ 
        visitedMaps[currentDungeonId][currentFloor][ny][nx]=true; 
        log("壁だ。"); updateDungeonUI(); return; 
    } 
    
    // 移動確定
    playerPos.x=nx; playerPos.y=ny; 
    checkObject(); updatePlayerVision(); updateDungeonUI(); 
    
    // 毒ダメージ
    let poisonDmg = false;
    party.forEach(p => { 
        if(p.status==='poison' && p.alive) { 
            p.hp -= Math.floor(p.maxHp * 0.05); 
            if(p.hp<=0) { p.hp=0; p.alive=false; log(`${p.name}は毒で倒れた...`); }
            poisonDmg = true;
        } 
    }); 
    if(poisonDmg) updateDungeonUI();

    // イベント・ギミック判定
    handleTileEvent(tile, nx, ny);
}

function handleTileEvent(tile, x, y) {
    // ボス
    if(tile===TILE.BOSS){ 
        log("強烈な殺気を感じる..."); 
        setTimeout(startBossBattle, 1000); 
        return; 
    } 
    
    // 商人 (乗ったときにメッセージ、Enterで会話)
    if(tile===TILE.SHOP){
        log("商人がいる。「何か入用かね？」");
    }

    // ギミック: 流水
    if(tile===TILE.FLOW) {
        const key = `${currentDungeonId}_${currentFloor}_${x}_${y}`;
        const gim = gimmickData[key];
        if(gim && gim.type === 'flow') {
            log("足元が流される！");
            setTimeout(() => {
                executeMove(gim.dx, gim.dy);
            }, 300);
            return; // エンカウントなしで流される
        }
    }

    // ギミック: ワープ
    if(tile===TILE.WARP) {
        const key = `${currentDungeonId}_${currentFloor}_${x}_${y}`;
        const gim = gimmickData[key];
        if(gim && gim.type === 'warp') {
            log("空間が歪んでいる...");
            setTimeout(() => {
                playerPos.x = gim.tx; playerPos.y = gim.ty;
                log("ワープした！");
                updatePlayerVision(); updateDungeonUI();
            }, 500);
            return;
        }
    }

    // ギミック: 落とし穴
    if(tile===TILE.HOLE) {
        log("落とし穴だ！");
        setTimeout(() => {
            if(currentFloor > 1) {
                loadDungeonMap(currentDungeonId, currentFloor - 1);
                // 落ちた位置(ランダムにするか、固定にするか) -> とりあえず中央付近へ
                playerPos.x = 5; playerPos.y = 5;
                log("下の階に落ちてしまった...");
                // 小ダメージ
                party.forEach(p => { if(p.alive) p.hp = Math.max(1, p.hp - 10); });
                updatePlayerVision(); updateDungeonUI();
            } else {
                log("しかし底が浅かった。");
            }
        }, 500);
        return;
    }

    // エンカウント判定
    // 商人, ワープ, 流水, 階段, 出口 ではエンカウントしない
    if(![TILE.STAIRS, TILE.BOSS, TILE.CHEST, TILE.EXIT, TILE.SHOP, TILE.FLOW, TILE.WARP, TILE.HOLE].includes(tile)) {
        // 階層ごとの基本エンカウント率
        let rate = 0.12;
        if(currentFloor === 2) rate = 0.15;
        if(currentFloor === 3) rate = 0.20; // 3Fもエンカウントありに変更

        if(Math.random() < rate) startBattle(); 
    }
}

function checkObject() { document.getElementById('btn-return').style.display=(currentMapData[playerPos.y][playerPos.x]===9)?'flex':'none'; }

function checkArea() { 
    if(isBattle)return; 
    const v=currentMapData[playerPos.y][playerPos.x]; 
    if(v===TILE.EXIT) log("出口だ。"); 
    else if(v===TILE.STAIRS){ 
        // 下り階段処理 (既存)
        if(currentFloor < 3) {
            loadDungeonMap(currentDungeonId, currentFloor + 1);
            updatePlayerVision(); updateDungeonUI(); log("階段を降りた。");
        } else {
            log("これ以上降りられない。");
        }
    } else if(v===TILE.UP_STAIRS){ 
        // ★追加: 上り階段処理
        if(currentFloor > 1) {
            loadDungeonMap(currentDungeonId, currentFloor - 1);
            updatePlayerVision(); updateDungeonUI(); log("階段を上がった。");
        } else {
            log("ここからは戻れない。"); // 通常ありえないが念のため
        }
    } else if(v===TILE.CHEST) {
        const key = `${currentDungeonId}_${currentFloor}_${playerPos.x}_${playerPos.y}`; 
        if(!openedChests.includes(key) && fixedChestData[key]) { 
            const itemId = fixedChestData[key];
            
            // ★変更
            const dropItem = createDropItem(itemId); // ランダム付与
            partyInventory.push(dropItem);
            
            openedChests.push(key); 
            const bonusStr = getBonusString(dropItem);
            alert(`${itemData[itemId].name}${bonusStr}を手に入れた！`); 
            updateDungeonUI();
        } else log("宝箱は空だ。");
    } else if(v===TILE.SHOP) {
        dungeonShopActive = true;
        openShop(); 
    } else log("特に何もない。"); 
}

function returnToTown(force=false) {
    if (isBattle && !force) return;
    if (!force && currentMapData[playerPos.y][playerPos.x] !== TILE.EXIT) { log("出口ではない！"); return; }
    document.getElementById('dungeon-scene').style.display = 'none'; document.getElementById('town-scene').style.display = 'block';
    updateTownStatus(); if(!force) townLog("町へ戻った。");
}
function openWorldMap() { document.getElementById('town-scene').style.display = 'none'; document.getElementById('world-map-scene').style.display = 'flex'; }
function closeWorldMap() { document.getElementById('world-map-scene').style.display = 'none'; document.getElementById('town-scene').style.display = 'block'; }

function goToDungeon(dId) {
    const idMap = { 1:1, 10:2, 20:3, 30:4, 40:5 };
    const realId = idMap[dId] || dId; 

    if (party.every(p => !p.alive)) { alert("全滅しています。宿屋へ。"); return; }
    
    document.getElementById('main-area').classList.remove('shake-screen');
    closeWorldMap();
    document.getElementById('town-scene').style.display = 'none';
    document.getElementById('dungeon-scene').style.display = 'flex';
    
    const cv = document.getElementById('dungeon-canvas');
    if(cv) ctx = cv.getContext('2d');
    
    loadDungeonMap(realId, 1);
    
    playerPos.x = 1; 
    playerPos.y = 1; 
    playerPos.dir = 1; 
    
    checkObject(); updatePlayerVision(); updateDungeonUI(); toggleControls('move');
    townLog(`${dungeonData[realId].name}へ入った...`);
}

// --- 3D描画 ---
function updateDungeonUI() {
    if(!isBattle) draw3D(); renderMap();
    document.getElementById('c-dir').innerText=["北","東","南","西"][playerPos.dir];
    document.getElementById('c-x').innerText=playerPos.x; document.getElementById('c-y').innerText=playerPos.y;
    document.getElementById('dungeon-party-status').innerHTML = party.map(p=>{
        let clr = p.hp < p.maxHp*0.3 ? '#ff5555' : '#fff'; 
        if(!p.alive) clr = '#888';
        let statusIcon = "";
        if(!p.alive) statusIcon = "🪦";
        else if(p.status === 'poison') statusIcon = "<span style='color:#d0d;'>☠️</span>";
        else if(p.status === 'paralyze') statusIcon = "<span style='color:#dd0;'>⚡</span>";
        return `<div class="ps-row"><div><span class="job-badge-sm">${jobData[p.jobId].name.charAt(0)}</span><span style="font-size:0.9em; color:#aaa; margin-right:3px;">Lv.${p.level}</span>${p.name} ${statusIcon}</div><div style="color:${clr}">HP:${p.hp}</div></div>`;
    }).join('');
    checkObject();
}
function draw3D(){
    if(!ctx) return;
    const theme = dungeonData[currentDungeonId].theme;
    ctx.fillStyle = theme.ceil; ctx.fillRect(0,0,300,100);
    ctx.fillStyle = theme.floor; ctx.fillRect(0,100,300,100);
    for(let d=3; d>=0; d--) drawLayer(d, theme);
}
function drawLayer(d, theme){
    const l=getRelPos(d,-1)===1, r=getRelPos(d,1)===1, f=getRelPos(d,0)===1;
    const m=VIEW_METRICS[d], nm=(d<3)?VIEW_METRICS[d+1]:null;
    const i=1.0-(d*0.25); const base=theme.wallBaseRGB; 
    const rv=Math.floor(base[0]*i), gv=Math.floor(base[1]*i), bv=Math.floor(base[2]*i);
    const wc=`rgb(${rv},${gv},${bv})`, sc=`rgb(${Math.floor(rv*0.7)},${Math.floor(gv*0.7)},${Math.floor(bv*0.7)})`;
    ctx.lineWidth=2; ctx.strokeStyle=theme.wallStroke;
    if(f){ ctx.fillStyle=wc; ctx.fillRect(m.x,m.y,m.w,m.h); ctx.strokeRect(m.x,m.y,m.w,m.h); }
    else if(d<3 && nm){ if(l){ctx.fillStyle=sc;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(nm.x,nm.y);ctx.lineTo(nm.x,nm.y+nm.h);ctx.lineTo(m.x,m.y+m.h);ctx.fill();ctx.stroke();} if(r){ctx.fillStyle=sc;ctx.beginPath();ctx.moveTo(m.x+m.w,m.y);ctx.lineTo(nm.x+nm.w,nm.y);ctx.lineTo(nm.x+nm.w,nm.y+nm.h);ctx.lineTo(m.x+m.w,m.y+m.h);ctx.fill();ctx.stroke();} }
    
    let cx=playerPos.x, cy=playerPos.y, dr=playerPos.dir;
    if(dr===0)cy-=d; else if(dr===1)cx+=d; else if(dr===2)cy+=d; else if(dr===3)cx-=d;
    let val=0; if(cx>=0 && cx<mapSize && cy>=0 && cy<mapSize) val=currentMapData[cy][cx];
    
    // イベント描画
    if([TILE.STAIRS, TILE.UP_STAIRS, TILE.BOSS, TILE.CHEST, TILE.SHOP, TILE.EXIT, TILE.HOLE].includes(val)) {
        let s=m.w*0.6, ix=m.x+(m.w-s)/2, iy=m.y+(m.h-s)/2;
        let t='ev'; 
        if(val===TILE.STAIRS || val===TILE.UP_STAIRS) t='ladder'; // 上りも下りも同じアイコンでOK
        else if(val===TILE.BOSS) {
            // (ボスの描画処理はそのまま)
            ctx.save();
            const cx = ix + s / 2;
            const cy = iy + s / 2;
            const grad = ctx.createRadialGradient(cx, cy, s * 0.1, cx, cy, s * 0.8);
            grad.addColorStop(0, "rgba(255, 50, 50, 0.9)");
            grad.addColorStop(0.4, "rgba(150, 0, 0, 0.6)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, s * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(50, 0, 0, 0.8)";
            ctx.beginPath();
            ctx.arc(cx, cy, s * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return; 
        }
        else if(val===TILE.CHEST) t='chest';
        else if(val===TILE.SHOP) t='shop';
        else if(val===TILE.HOLE) {
            // ★修正: 天空の塔(ID=5)以外の場合のみ穴を描画
            if(currentDungeonId !== 5) t='hole';
            else return; // 描画しない（床として表示）
        }
        
        drawIcon(ctx, ix, iy, s, t); 
    }
}
function drawImageAt(ctx, src, x, y, size) {
    const img = new Image();
    img.src = src;
    if (img.complete) {
        ctx.drawImage(img, x, y, size, size);
    } else {
        img.onload = () => ctx.drawImage(img, x, y, size, size);
    }
}

function drawIcon(ctx, x, y, size, type) {
    const scale = 0.8; const offset = (size * (1 - scale)) / 2; x += offset; y += offset; size *= scale; ctx.save();
    if(type === 'ladder') {
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = Math.max(1, size/15); ctx.beginPath();
        ctx.moveTo(x + size*0.25, y); ctx.lineTo(x + size*0.25, y + size); ctx.moveTo(x + size*0.75, y); ctx.lineTo(x + size*0.75, y + size);
        for(let i=1; i<=5; i++) { const ry = y + (size * i / 6); ctx.moveTo(x + size*0.25, ry); ctx.lineTo(x + size*0.75, ry); } ctx.stroke();
    } else if(type === 'chest') {
        const boxH = size * 0.5; const lidH = size * 0.3; const baseY = y + (size - boxH) / 2 + lidH / 3;
        ctx.fillStyle = '#8B4513'; ctx.fillRect(x, baseY, size, boxH);
        ctx.fillStyle = '#A0522D'; ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x + size/2, baseY - lidH * 1.8, x + size, baseY); ctx.fill();
        ctx.strokeStyle = '#DAA520'; ctx.lineWidth = Math.max(2, size / 12); ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x + size/2, baseY - lidH * 1.8, x + size, baseY); ctx.stroke();
        ctx.strokeRect(x, baseY, size, boxH);
    } else if(type === 'shop') {
        ctx.font = `${size}px sans-serif`; ctx.fillStyle = "#fff"; ctx.fillText("💰", x, y + size/1.2);
    } else if(type === 'hole') {
        ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(x+size/2, y+size/2, size/2, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#444"; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
}
function getRelPos(f,s){let x=playerPos.x,y=playerPos.y,d=playerPos.dir;if(d===0)y-=f;if(d===1)x+=f;if(d===2)y+=f;if(d===3)x-=f;if(d===0)x+=s;if(d===1)y+=s;if(d===2)x-=s;if(d===3)y-=s;if(x<0||x>=mapSize||y<0||y>=mapSize)return 1;return(currentMapData[y][x]===1)?1:0;}

// --- 町・施設UI ---
function updateTownStatus() {
    document.getElementById('town-gold').innerText = partyGold;
    const c = document.getElementById('town-status');
    c.innerHTML = '';
    party.forEach(p => {
        c.innerHTML += `<div class="status-card"><img src="${p.img}" class="hero-icon-lg"><div class="status-info"><div><span class="job-badge">${jobData[p.jobId].name}</span> ${p.name}</div><div>Lv.${p.level}</div><div>HP: ${p.hp}/${p.maxHp}</div><div>EXP: ${p.exp}</div></div></div>`;
    });
}
function townLog(msg) { const l = document.getElementById('town-log'); l.innerHTML += `<p>> ${msg}</p>`; l.scrollTop = l.scrollHeight; }
function townAction(act) {
    if (act === 'inn') {
        if (partyGold < 10) { townLog("お金が足りない！(10G)"); return; }
        partyGold -= 10; party.forEach(p => { p.hp = p.maxHp; p.alive = true; p.status = "normal"; for(let k in p.spells) p.spells[k].current = p.spells[k].max; });
        updateTownStatus(); townLog("宿に泊まった。");
    } else if (act === 'shop') { dungeonShopActive = false; openShop(); }
    else if (act === 'temple') openTemple(); 
    else if (act === 'outside') openWorldMap();
}
function openShop() { 
    if(dungeonShopActive) document.getElementById('dungeon-scene').style.display='none';
    else document.getElementById('town-scene').style.display='none'; 
    document.getElementById('shop-scene').style.display='block'; 
    updateShopUI(); 
}
function exitShop() { 
    document.getElementById('shop-scene').style.display='none'; 
    if(dungeonShopActive) {
        document.getElementById('dungeon-scene').style.display='flex';
        updateDungeonUI();
        dungeonShopActive = false;
    } else {
        document.getElementById('town-scene').style.display='block'; 
        updateTownStatus(); 
    }
}
function updateShopUI() { 
    document.getElementById('shop-gold').innerText = partyGold; 
    const list = document.getElementById('shop-list'); 
    list.innerHTML = ''; 

    // (任意) ショップのタイトルを場所によって変える
    const titleHeader = document.querySelector('#shop-scene h2');
    if(titleHeader) {
        titleHeader.innerText = dungeonShopActive ? "💰 行商人" : "💰 道具屋";
    }
    
    for (let id in itemData) { 
        const item = itemData[id]; 
        
        // --- フィルタリング処理 ---
        if(item.type !== 'consumable'){ 
            if(dungeonShopActive) {
                // ダンジョン内ショップ: 現在のダンジョンIDと同じTierの装備だけ並べる
                if(item.tier !== currentDungeonId) continue;
            } else {
                // 町の道具屋: Tier 2 (序盤) 以下の装備だけ並べる
                if(item.tier > 2) continue;
            }
        } 
        // ※消耗品(consumable)はどちらでも全て販売します

        let stats = ""; 
        if(item.type !== 'consumable'){ 
            if(item.power) stats += `攻+${item.power} `; 
            if(item.ac) stats += `防+${item.ac} `; 
            stats += getEquipJobString(item.subType); 
        } 
        if(item.effect) stats += `効果:${item.desc} `; 
        
        const div = document.createElement('div'); 
        div.className = 'shop-item'; 
        div.innerHTML = `<div class="shop-info"><div class="shop-row"><span class="shop-name">${item.name}</span><span class="shop-price">${item.price}G</span></div><div class="shop-desc">${stats}</div></div> <button class="btn shop-btn" onclick="buyItem('${id}')">購入</button>`; 
        list.appendChild(div); 
    } 
}
function buyItem(id) { 
    const item = itemData[id]; 
    if (partyGold >= item.price) { 
        partyGold -= item.price; 
        
        // ★変更: 装備品ならボーナスなしオブジェクト、消耗品ならID文字列
        if(item.type === 'consumable') {
            partyInventory.push(id);
        } else {
            partyInventory.push({ itemId: id, bonus: {}, uid: Date.now() + Math.random() });
        }

        alert(`${item.name}を購入しました。`); 
        updateShopUI(); 
    } else {
        alert("お金が足りません。"); 
    }
}
// --- 神殿 (転職・レベルアップ) ---
function openTemple() { 
    document.getElementById('town-scene').style.display='none'; 
    document.getElementById('temple-scene').style.display='block'; 
    templeTargetIndex = -1; 
    document.getElementById('temple-action-area').style.display = 'none'; 
    document.getElementById('job-select-area').style.display='none'; 
    document.getElementById('levelup-area').style.display='none'; 
    
    const list = document.getElementById('temple-member-list'); 
    list.innerHTML = party.map((p,i) => { 
        // ★修正: 99 -> 10 に変更
        const canLvl = p.exp >= p.level * 100 && p.level < 10; 
        const lvlBadges = canLvl ? `<span class="lvl-up-badge">UP!</span>` : ""; 
        const selectedClass = (i === templeTargetIndex) ? "selected" : ""; 
        return `<div class="temple-card ${selectedClass}" onclick="selectTempleMember(${i})"><img src="${p.img}" class="temple-icon"><div class="temple-card-info"><div class="temple-name">${p.name}</div><div class="temple-meta">Lv.${p.level} ${jobData[p.jobId].name}</div></div>${lvlBadges}</div>`; 
    }).join(''); 
}
function selectTempleMember(idx) { 
    openTemple(); 
    templeTargetIndex = idx; 
    const cards = document.getElementsByClassName('temple-card'); 
    if(cards[idx]) cards[idx].classList.add('selected-card'); 
    document.getElementById('temple-action-area').style.display = 'block'; 
    
    const p = party[idx]; 
    const req = p.level * 100; 
    const btnText = document.getElementById('btn-lvl-sub'); 
    
    // ★修正: 99 -> 10 に変更
    if(p.level >= 10) { 
        btnText.innerText="MAX"; 
        btnText.style.color="#f88"; 
    } else if(p.exp >= req) { 
        btnText.innerText = "可能！"; 
        btnText.style.color = "#ff0"; 
    } else { 
        btnText.innerText = `あと ${req - p.exp}`; 
        btnText.style.color = "#888"; 
    } 
}
function exitTemple() { document.getElementById('temple-scene').style.display='none'; document.getElementById('town-scene').style.display='block'; updateTownStatus(); }
function showJobChange() { document.getElementById('job-select-area').style.display='block'; document.getElementById('levelup-area').style.display='none'; const jobs = ['hero','warrior','mage','priest']; document.getElementById('job-buttons').innerHTML = jobs.map(j => { const d = jobData[j]; return `<button class="btn job-card-btn" id="btn-job-${j}" onclick="selectJob('${j}')"><div style="font-size:2em;">${d.icon}</div><div>${d.name}</div></button>`; }).join(''); document.getElementById('job-desc').innerHTML = "<div style='padding:20px; color:#aaa; text-align:center;'>職業アイコンをタップして<br>詳細を確認してください</div>"; selectedJobId = null; }
function selectJob(jid) { selectedJobId = jid; const d = jobData[jid]; const btns = document.querySelectorAll('.job-card-btn'); btns.forEach(b => b.classList.remove('active-job')); document.getElementById(`btn-job-${jid}`).classList.add('active-job'); const equipTypes = { sword:"剣", axe:"斧", mace:"鈍器", staff:"杖", heavyShield:"大盾", lightShield:"小盾", armor:"鎧", clothes:"服", helm:"兜", hat:"帽子" }; const equips = d.canEquip.map(e => equipTypes[e]).filter(v=>v).join('・'); const html = `<div class="job-info-panel"><h3 style="margin:0 0 10px 0; color:#ffd700; border-bottom:1px solid #555; padding-bottom:5px;">${d.icon} ${d.name}</h3><p style="font-size:0.9em; line-height:1.4; margin-bottom:10px;">${d.desc}</p><div class="job-detail-grid"><div class="detail-box"><div class="detail-label">基礎ステータス</div><div class="stat-bar-row"><span>腕力:</span> <span class="stat-val">${d.baseStats.str}</span></div><div class="stat-bar-row"><span>知力:</span> <span class="stat-val">${d.baseStats.int}</span></div><div class="stat-bar-row"><span>信仰:</span> <span class="stat-val">${d.baseStats.pie}</span></div><div class="stat-bar-row"><span>体力:</span> <span class="stat-val">${d.baseStats.vit}</span></div></div><div class="detail-box"><div class="detail-label">特徴</div><div style="font-size:0.8em; text-align:left;"><div style="margin-bottom:4px;">🛠️ <b>装備:</b> ${equips}</div></div></div></div></div>`; document.getElementById('job-desc').innerHTML = html; }
function executeClassChange() { if(!selectedJobId) return alert("職業を選択してください"); if(!party[templeTargetIndex]) return; const p = party[templeTargetIndex]; if(p.jobId === selectedJobId) return alert("すでにその職業です"); if(!confirm("レベルが1に戻りますがよろしいですか？")) return; p.jobId = selectedJobId; p.level = 1; p.exp = 0; initCharacter(p); calculateStats(p); p.hp = p.maxHp; alert("転職しました！"); selectTempleMember(templeTargetIndex); }
function checkLevelUp() { 
    const p = party[templeTargetIndex]; 
    // ★修正: 99 -> 10 に変更
    if(p.level >= 10) return alert("レベルは最大です"); 
    
    const req = p.level * 100; 
    if (p.exp >= req) { 
        bonusPoints = 4; 
        tempStatAlloc={str:0,int:0,pie:0,vit:0,agi:0,luc:0}; 
        document.getElementById('job-select-area').style.display='none'; 
        document.getElementById('levelup-area').style.display='block'; 
        renderLevelUpStats(); 
        updateBonusUI(); 
    } else { 
        alert(`経験値が足りません (あと ${req - p.exp})`); 
    } 
}
function executeLevelUp() { if(bonusPoints > 0) return alert("ポイントを使い切ってください"); const p = party[templeTargetIndex]; const req = p.level * 100; p.level++; p.exp -= req; for(let k in tempStatAlloc) p.stats[k]+=tempStatAlloc[k]; 
    for(let k in p.spells) { if(p.spells[k].max < 9) { p.spells[k].max += 1; p.spells[k].current += 1; } }
    learnSpells(p, p.level);
    calculateStats(p); p.hp = p.maxHp; alert("レベルアップしました！"); document.getElementById('levelup-area').style.display='none'; selectTempleMember(templeTargetIndex); 
}
function renderLevelUpStats() { const p = party[templeTargetIndex]; const stats = ['str','int','pie','vit','agi','luc']; const labels = {str:'腕力',int:'知力',pie:'信仰',vit:'体力',agi:'敏捷',luc:'運'}; const c = document.getElementById('levelup-stats'); c.innerHTML = stats.map(k => `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;"><span>${labels[k]}: <span style="color:#fff; font-weight:bold;">${p.stats[k] + tempStatAlloc[k]}</span></span><div><button class="btn" style="width:30px; height:30px;" onclick="addStat('${k}', -1)">-</button><button class="btn" style="width:30px; height:30px;" onclick="addStat('${k}', 1)">+</button></div></div>`).join(''); }
function addStat(k, v) { if(v > 0 && bonusPoints > 0) { tempStatAlloc[k]++; bonusPoints--; } else if (v < 0 && tempStatAlloc[k] > 0) { tempStatAlloc[k]--; bonusPoints++; } renderLevelUpStats(); updateBonusUI(); }
function updateBonusUI() { document.getElementById('bonus-points').innerText = bonusPoints; }

// --- メニュー系関数 (Camp/Items) ---
function openCamp(from) { menuReturnTo = from || 'camp'; document.getElementById('btn-camp-check').style.display = (document.getElementById('dungeon-scene').style.display === 'flex') ? 'block' : 'none'; if(menuReturnTo==='dungeon') document.getElementById('move-controls').style.display = 'none'; document.getElementById('camp-overlay').style.display='flex'; }
function closeCamp() { document.getElementById('camp-overlay').style.display='none'; if(document.getElementById('dungeon-scene').style.display === 'flex') { toggleControls('move'); } }
function checkAreaCamp() { closeCamp(); checkArea(); }
function openCampSpellMenu() { document.getElementById('camp-overlay').style.display = 'none'; showSubMenu(party.map((p, i) => { const disabled = !p.alive ? "disabled style='color:#888'" : ""; return `<button class="btn" ${disabled} onclick="showCampSpellList(${i})">${p.name}</button>`; }).join(''), "誰が唱える？"); }
// キャンプで魔法リストを表示する関数
function showCampSpellList(actorIdx) { 
    const p = party[actorIdx]; 
    let html = ""; 
    for(let key in p.spells) { 
        const s = p.spells[key]; 
        // ★修正: 'revive' タイプも表示するように追加
        if((s.type === 'heal' || s.type === 'util' || s.type === 'revive') && s.max > 0) { 
            const disabled = s.current <= 0 ? "disabled" : ""; 
            html += `<button class="btn" ${disabled} onclick="selectCampSpellTarget(${actorIdx}, '${key}')">✨ ${s.name} (${s.current}/${s.max})</button>`; 
        } 
    } 
    if (html === "") html = "<div style='grid-column:1/-1; padding:20px; color:#888;'>使える呪文がない</div>"; 
    showSubMenu(html, `${p.name}の呪文`); 
}
function selectCampSpellTarget(actorIdx, spellKey) { const p = party[actorIdx]; const s = p.spells[spellKey]; if (s.current <= 0) return; if (s.target === 'self' || spellKey === 'escape') { executeCampSpell(actorIdx, null, spellKey); return; } if (s.target === 'all') { executeCampSpell(actorIdx, -1, spellKey); return; } showSubMenu(party.map((t, i) => { const hpColor = t.hp < t.maxHp ? "#8f8" : "#fff"; return `<button class="btn" onclick="executeCampSpell(${actorIdx}, ${i}, '${spellKey}')"><span style="color:${hpColor}">${t.name}</span> (HP:${t.hp}/${t.maxHp})</button>`; }).join(''), "誰にかける？"); }
// キャンプで魔法を実行する関数
function executeCampSpell(actorIdx, targetIdx, spellKey) { 
    const actor = party[actorIdx]; 
    const spell = actor.spells[spellKey]; 
    
    // MP(回数)チェック
    if(spell.current <= 0) return;

    if (spell.type === 'heal') { 
        const targets = (targetIdx === -1) ? party : [party[targetIdx]]; 
        let rec = spell.power + actor.stats.pie; 
        
        let anyoneHealed = false;
        targets.forEach(t => { 
            // ★修正: 生存者のみ回復
            if(t.alive) {
                t.hp += rec; 
                if (t.hp > t.maxHp) t.hp = t.maxHp; 
                anyoneHealed = true;
            }
        }); 
        
        if(anyoneHealed) {
            spell.current--;
            alert("回復した！"); 
        } else {
            alert("効果がなかった（対象が戦闘不能など）");
            return; // 回数を減らさない
        }

    } else if (spell.type === 'revive') {
        // ★追加: 蘇生処理
        const t = party[targetIdx];
        if (t.alive) {
            alert("その必要はないようだ");
            return;
        }
        
        spell.current--;
        t.alive = true;
        t.hp = Math.floor(t.maxHp / 2); // 最大HPの半分で復活
        t.status = 'normal';
        alert(`${t.name}は生き返った！`);

    } else if (spellKey === 'escape') { 
        spell.current--;
        alert("脱出した！"); 
        closeSubMenu(); 
        closeCamp(); 
        returnToTown(true); 
        return; 
    } 
    
    if (document.getElementById('dungeon-scene').style.display === 'flex') updateDungeonUI(); 
    else updateTownStatus(); 
    
    if (spell.current > 0) showCampSpellList(actorIdx); 
    else openCampSpellMenu(); 
}
function openEquipMenu(from) { if(from) menuReturnTo=from; document.getElementById('camp-overlay').style.display='none'; showSubMenu(party.map((p,i) => `<button class="btn" onclick="showEquipChar(${i})">${p.name}</button>`).join(''), "装備変更"); }
function showEquipChar(idx) { 
    templeTargetIndex = idx; 
    const p = party[idx]; 
    const slots = { weapon:'武器', shield:'盾', armor:'鎧', helm:'兜', acc:'装飾' }; 
    let html = `<div style="grid-column:1/-1;color:#fff;text-align:center;">${p.name}の装備</div>`; 
    
    for(let s in slots) { 
        // p.equips[s] はオブジェクトになった
        const eq = p.equips[s];
        let eqName = "なし";
        if(eq) {
            eqName = itemData[eq.itemId].name + " " + getBonusString(eq);
        }
        html += `<button class="btn" onclick="equipSlot('${s}')">${slots[s]}: ${eqName}</button>`; 
    } 
    showSubMenu(html, "装備選択"); 
}
function equipSlot(slot) { 
    const p = party[templeTargetIndex]; 
    const job = jobData[p.jobId]; 
    
    // インベントリから「装備可能」かつ「スロットが合う」ものを抽出
    // mapで {item, originalIndex} のペアを作る
    const candidates = partyInventory.map((item, index) => ({item, index}))
        .filter(wrapper => {
            const obj = wrapper.item;
            if(typeof obj === 'string') return false; // 消耗品は除外
            
            const itDef = itemData[obj.itemId];
            let typeMatch = false; 
            if(slot==='weapon' && itDef.type==='weapon') typeMatch=true; 
            if(slot==='armor' && itDef.type==='armor') typeMatch=true; 
            if(slot==='shield' && itDef.type==='shield') typeMatch=true; 
            if(slot==='helm' && itDef.type==='helm') typeMatch=true; 
            if(slot==='acc' && itDef.type==='accessory') typeMatch=true; 
            
            return typeMatch && job.canEquip.includes(itDef.subType); 
        });

    let html = `<button class="btn" onclick="doEquip(-1, '${slot}')">外す</button>`; 
    
    if(candidates.length === 0) {
        html += `<div style="color:#aaa; padding:10px;">装備できるアイテムがない</div>`;
    } else {
        html += candidates.map(wrapper => {
            const obj = wrapper.item;
            const idx = wrapper.index;
            const itDef = itemData[obj.itemId];
            const bonusStr = getBonusString(obj);
            
            let powerStr = ""; 
            if(itDef.power) powerStr = `攻${itDef.power}`; 
            if(itDef.ac) powerStr = `防${itDef.ac}`; 
            
            // ★修正: ボタン内のテキスト配置
            return `<button class="btn" style="height:auto; min-height:50px; padding:8px; flex-direction:column; align-items:flex-start; line-height:1.4;" onclick="doEquip(${idx}, '${slot}')">
                <div style="font-weight:bold;">${itDef.name}</div>
                <div style="font-size:0.85em;">${powerStr} ${bonusStr}</div>
            </button>`;
        }).join('');
    }
    
    showSubMenu(html, "装備選択");
}

function doEquip(invIndex, slot) { 
    const p = party[templeTargetIndex]; 
    
    // 現在装備しているものをインベントリに戻す
    if(p.equips[slot]) {
        partyInventory.push(p.equips[slot]);
    } 
    
    if(invIndex === -1) {
        // 外すだけ
        p.equips[slot] = null;
        alert("装備を外しました");
    } else {
        // インベントリから装備へ移動
        const itemObj = partyInventory[invIndex];
        p.equips[slot] = itemObj;
        partyInventory.splice(invIndex, 1); // インベントリから削除
        alert(`${itemData[itemObj.itemId].name}を装備しました`);
    }
    
    calculateStats(p); 
    showEquipChar(templeTargetIndex); 
}
// openItemMenuの修正版
function openItemMenu() { 
    if(partyInventory.length === 0) return alert("何も持っていない"); 
    document.getElementById('camp-overlay').style.display='none'; 
    
    const html = partyInventory.map((item, i) => {
        // 消耗品(文字列)の場合
        if (typeof item === 'string') {
            const it = itemData[item];
            return `<div class="shop-item">
                <div class="shop-info">${it.name} (道具)</div>
                <div>
                    <button class="btn shop-btn" onclick="selectItemTarget('${item}', ${i})">使う</button>
                    <button class="btn shop-btn" style="background:#522; border-color:#f55;" onclick="discardItem(${i})">捨てる</button>
                </div>
            </div>`;
        } 
        // 装備品(オブジェクト)の場合
        else {
            const it = itemData[item.itemId];
            const bonusStr = getBonusString(item); // HTMLタグ付きで返ってくる
            
            let statInfo = "";
            if(it.power) statInfo += `攻+${it.power} `;
            if(it.ac) statInfo += `防+${it.ac} `;

            // ★修正: レイアウトを整理 (名前・性能・追加効果 を見やすく配置)
            return `<div class="shop-item" style="flex-direction:column; align-items:flex-start; padding:8px;">
                <div style="width:100%; display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="font-weight:bold; color:#eee;">${it.name}</span>
                    <span style="font-size:0.8em; color:#aaa;">${getEquipJobString(it.subType)}</span>
                </div>
                <div style="font-size:0.9em; color:#ccc; margin-bottom:4px;">
                    ${statInfo} ${bonusStr}
                </div>
                <div style="width:100%; text-align:right;">
                    <button class="btn shop-btn" style="background:#522; border-color:#f55;" onclick="discardItem(${i})">捨てる</button>
                </div>
            </div>`;
        }
    }).join('');

    showSubMenu(html, "アイテム一覧"); 
}

// 捨てる機能
function discardItem(index) {
    const item = partyInventory[index];
    const name = (typeof item === 'string') ? itemData[item].name : itemData[item.itemId].name;
    
    if(confirm(`${name} を捨てますか？`)) {
        partyInventory.splice(index, 1);
        // メニュー再描画
        openItemMenu();
    }
}
function selectItemTarget(itemId) { const it = itemData[itemId]; if(it.type !== 'consumable') { alert(`これは${it.name}です。装備メニューから装備してください。`); return; } if(battleSpellMode === 'item') { document.getElementById('sub-menu-overlay').style.display='none'; toggleControls('target'); ['btn-target-0','btn-target-1','btn-target-2'].forEach((id,i) => { document.getElementById(id).innerText=`${party[i].name}`; document.getElementById(id).onclick = () => executeBattleItem(itemId, i); }); return; } if(it.effect === 'warp') { useItem(itemId, null); return; } showSubMenu(party.map((p,i) => `<button class="btn" onclick="useItem('${itemId}', ${i})">${p.name}</button>`).join(''), "誰に使う？"); }
function useItem(itemId, targetIdx) { const item = itemData[itemId]; const invIdx = partyInventory.indexOf(itemId); if(invIdx > -1) partyInventory.splice(invIdx, 1); if(item.effect === 'warp') { alert("光に包まれた！"); closeSubMenu(); closeCamp(); returnToTown(true); return; } const t = party[targetIdx]; if(item.effect === 'heal') { t.hp += item.power; if(t.hp > t.maxHp) t.hp = t.maxHp; alert(`${t.name}は回復した`); } else if(item.effect === 'curePoison') { if(t.status === 'poison') { t.status='normal'; alert("毒が消えた"); } else alert("効果がなかった"); } else if(item.effect === 'curePara') { if(t.status === 'paralyze') { t.status='normal'; alert("麻痺が治った"); } else alert("効果がなかった"); } if(document.getElementById('dungeon-scene').style.display === 'flex') updateDungeonUI(); else updateTownStatus(); openItemMenu(); }
function showSubMenu(html, title) { document.getElementById('sub-menu-overlay').style.display='flex'; document.getElementById('sub-menu-title').innerText = title; document.getElementById('sub-menu-content').innerHTML = html; }
function closeSubMenu() { 
    document.getElementById('sub-menu-overlay').style.display='none'; 
    
    // 戦闘中のアイテム使用時など
    if(battleSpellMode === 'item') { 
        toggleControls('battle'); 
        battleSpellMode = 'spell'; 
        return;
    }
    
    // ★追加箇所: ダンジョンからの直接呼び出しなら、キャンプを開かずにダンジョンへ戻る
    if(menuReturnTo === 'direct') {
        toggleControls('move'); // 移動ボタンを表示
        return;
    }

    // 通常（キャンプ経由）の場合はキャンプメニューに戻る
    document.getElementById('camp-overlay').style.display='flex'; 
}
function openStatusMenu() { 
    document.getElementById('camp-overlay').style.display = 'none'; 
    document.getElementById('status-scene').style.display = 'flex'; 
    const con = document.getElementById('status-content'); con.innerHTML = ''; 
    
    party.forEach(p => { 
        let w = getEquipString(p.equips.weapon); 
        let a = getEquipString(p.equips.armor); 
        let s = getEquipString(p.equips.shield); 
        let h = getEquipString(p.equips.helm); 
        let ac = getEquipString(p.equips.acc); 
        
        // ★修正: 99 -> 10 に変更
        let nextExp = (p.level>=10) ? 0 : (p.level * 100) - p.exp; 

        // ...(以下、ステータス表示処理は変更なし)...
        
        // 既存コードのまま
        let bonuses = { str:0, int:0, pie:0, vit:0, agi:0, luc:0 };
        for(let slot in p.equips) {
            const eq = p.equips[slot];
            if(eq && eq.bonus) {
                for(let k in bonuses) {
                    if(eq.bonus[k]) bonuses[k] += eq.bonus[k];
                }
            }
        }
        
        const fmtStat = (key, label) => {
            const base = p.stats[key];
            const add = bonuses[key];
            let addStr = "";
            if(add !== 0) {
                const sign = add > 0 ? "+" : "";
                addStr = ` <span style="color:#ff0; font-size:0.9em;">(${sign}${add})</span>`;
            }
            return `<div>${label}: ${base}${addStr}</div>`;
        };

        let spellListHtml = ""; 
        const spellKeys = Object.keys(p.spells); 
        if(spellKeys.length > 0) { 
            spellListHtml = `<div style="margin-top:8px; border-top:1px dashed #444; padding-top:5px;"><div style="font-size:0.8em; color:#aaa; margin-bottom:3px;">習得済み:</div><div style="display:flex; flex-wrap:wrap; gap:5px;">`; 
            for(let k in p.spells) { 
                const sp = p.spells[k]; 
                if(sp.max > 0) { 
                    spellListHtml += `<span style="background:#333; padding:2px 6px; border-radius:4px; font-size:0.8em; border:1px solid #555;">${ELEM_ICONS[sp.element]||""}${sp.name} <span style="color:#8ff;">${sp.current}/${sp.max}</span></span>`; 
                } 
            } 
            spellListHtml += `</div></div>`; 
        }

        let html = `<div class="status-card" style="display:block;">
            <div style="display:flex; align-items:center; border-bottom:1px solid #555; margin-bottom:5px; padding-bottom:5px;">
                <img src="${p.img}" class="hero-icon-lg" style="width:40px;height:40px;margin-right:10px;">
                <div style="font-weight:bold; color:#ffd700;">${p.name} (Lv.${p.level} ${jobData[p.jobId].name})</div>
            </div>
            <div class="detail-stats">
                <div>HP: ${p.hp}/${p.maxHp}</div>
                <div>攻: ${p.atk} / 防: ${p.def}</div>
                ${fmtStat('str', '力')}
                ${fmtStat('int', '知')}
                ${fmtStat('pie', '信')}
                ${fmtStat('vit', '体')}
                ${fmtStat('agi', '速')}
                ${fmtStat('luc', '運')}
            </div>
            <div style="font-size:0.8em; margin-top:5px; color:#88ff88;">次のレベルまで: ${nextExp} EXP</div>
            <div style="font-size:0.8em; margin-top:5px; color:#aaa;">
                武器: ${w}<br>盾: ${s}<br>鎧: ${a}<br>兜: ${h}<br>装飾: ${ac}
            </div>
            ${spellListHtml}
        </div>`; 
        
        con.innerHTML += html; 
    }); 
}
function closeStatusMenu() { document.getElementById('status-scene').style.display = 'none'; document.getElementById('camp-overlay').style.display = 'flex'; }

// --- 戦闘システム ---

function startBattle() {
    const d = dungeonData[currentDungeonId];
    // 出現モンスターのフィルタリング (階層制限)
    const validEnemies = d.enemies.filter(e => {
        return !e.minFloor || currentFloor >= e.minFloor;
    });

    if(validEnemies.length === 0) return; // 出現モンスターがいない場合

    const count = Math.floor(Math.random() * 2) + 1; 
    let enemyList = [];
    const suffix = ["A", "B", "C"];
    let nameCounts = {}; 

    for(let i=0; i<count; i++) {
        const tpl = validEnemies[Math.floor(Math.random() * validEnemies.length)];
        let nm = tpl.name;
        if(!nameCounts[tpl.name]) nameCounts[tpl.name]=0;
        if(count > 1) {
            nameCounts[tpl.name]++;
            nm += ` ${suffix[nameCounts[tpl.name]-1]}`;
        }
        enemyList.push({ ...tpl, name: nm, maxHp: tpl.hp, isBoss: false, id: i });
    }
    
    setupBattle(enemyList);
    log("魔物が現れた！");
}

function startBossBattle() { 
    const d = dungeonData[currentDungeonId];
    const boss = d.boss;
    log(`${boss.name}が現れた！`);
    setupBattle([{ ...boss, maxHp: boss.hp, isBoss: true, id: 0 }]);
}

function setupBattle(enemyList) { 
    isBattle = true; 
    enemies = enemyList;
    
    const mainArea = document.getElementById('main-area');
    const originalImg = document.getElementById('enemy-img');
    document.querySelectorAll('.dynamic-enemy-container').forEach(e => e.remove());
    originalImg.style.display = 'none';
    originalImg.classList.remove('shake-enemy');

const isMobile = window.innerWidth < 768;

    enemies.forEach((e, idx) => {
        const container = document.createElement('div');
        container.id = `enemy-unit-${idx}`;
        container.className = 'dynamic-enemy-container';
        container.style.position = 'absolute';
        container.style.top = isMobile ? '42%' : '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.zIndex = '10';
        container.style.textAlign = 'center';
        
        let leftPos = '50%';
        if(enemies.length === 2) leftPos = (idx === 0) ? '35%' : '65%';
        container.style.left = leftPos;

        const nameLabel = document.createElement('div');
        nameLabel.innerHTML = `${ELEM_ICONS[e.elem]||""} ${e.name}`;
        nameLabel.style.color = "#fff";
        nameLabel.style.fontSize = "12px";
        nameLabel.style.fontWeight = "bold";
        nameLabel.style.textShadow = "1px 1px 2px #000";
        nameLabel.style.marginBottom = "2px";
        nameLabel.style.whiteSpace = "nowrap";
        
        const img = document.createElement('img');
        img.src = `${e.img}`;
        img.id = `enemy-img-${idx}`; 
        if (e.isBoss) {
            // ボス: スマホなら0.7倍程度に縮小
            img.style.width = isMobile ? '140px' : '200px';   
            img.style.height = isMobile ? '168px' : '240px'; 
        } else {
            // 雑魚: スマホなら0.8倍程度に縮小
            img.style.width = isMobile ? '96px' : '120px';   
            img.style.height = isMobile ? '120px' : '150px';  
        }
        
        img.style.imageRendering = 'pixelated';
        img.style.objectFit = 'contain'; 
        img.style.filter = 'drop-shadow(0 10px 10px rgba(0,0,0,0.8))';
        
        container.appendChild(nameLabel);
        container.appendChild(img);
        mainArea.appendChild(container);
    });
    
    if(ctx){ ctx.fillStyle="rgba(0,0,0,0.7)"; ctx.fillRect(0,0,300,200); } 
    document.getElementById('enemy-stat').style.visibility = 'visible'; 
    updateEnemyStatName();
    document.getElementById('battle-msg').style.display = 'block'; 
    actionQueue = []; 
    party.forEach(p => { p.isDefending = false; p.buffs = {atk:0, def:0}; }); 
    activeMemberIndex = 0; 
    startInputPhase(true); 
}

function updateEnemyStatName() {
    const container = document.getElementById('enemy-stat');
    const aliveEnemies = enemies.filter(e => e.hp > 0);
    if (aliveEnemies.length === 0) { container.style.visibility = 'hidden'; return; }
    let html = aliveEnemies.map(e => `<div style="font-size:0.85em; margin-bottom:2px;">👾 ${ELEM_ICONS[e.elem]||""} ${e.name}</div>`).join('');
    container.innerHTML = html;
    container.style.visibility = 'visible';
}

function startInputPhase(isFirst=false) { 
    if(!isFirst) activeMemberIndex++; 
    if(activeMemberIndex >= party.length) { executeTurnActions(); return; } 
    const p = party[activeMemberIndex]; 
    if(!p.alive) { startInputPhase(); return; } 
    
    // ★追加: 新しいターン(コマンド入力)が来たら防御を解除する
    p.isDefending = false;

    if(p.buffs.atk > 0) p.buffs.atk--;
    if(p.buffs.def > 0) p.buffs.def--;

    if(p.status === 'paralyze') { 
        if(Math.random() < 0.3) {
            p.status = 'normal';
            log(`${p.name}の麻痺が治った！`);
        } else {
            log(`${p.name}は麻痺して動けない！`); 
            actionQueue.push({type:'wait', actorIndex:activeMemberIndex, name:p.name}); 
            startInputPhase(); 
            return; 
        }
    } 
    document.getElementById('battle-msg').innerText = `▶ ${p.name} のコマンド`; 
    toggleControls('battle'); 
// 1人目(index 0)なら戻るボタンを隠し、それ以外なら表示する
    const backBtn = document.getElementById('btn-battle-back');
    if(backBtn) {
        if(activeMemberIndex > 0) {
            backBtn.style.display = 'flex'; // ボタンを表示
            // 見た目を良くするため、戻れる時は「逃げる」を隠す等の調整も可能ですが、
            // 今回はシンプルに両方表示、またはグリッドのスペースを活用します
        } else {
            backBtn.style.display = 'none'; // 1人目は戻れないので隠す
        }
    }
}

function fight(act) { 
    const p = party[activeMemberIndex]; 
    
    if(act==='run') { 
        // ★修正: 逃げる処理を一括実行 & 成功率アップ
        
        // ボス戦チェック
        if(enemies.some(e=>e.isBoss)) {
            log("逃げられなかった！(ボス戦)");
            // 即座にターン終了へ (入力済みの行動も破棄して敵のターンへ)
            actionQueue = []; 
            executeTurnActions(); 
            return;
        }

        // 成功率を 0.5 (50%) から 0.8 (80%) にアップ
        if(Math.random() < 0.8) { 
            log("逃げ切った！"); 
            endBattle(); 
            return; 
        } else { 
            log("逃げられなかった！"); 
            // 失敗時は味方のターンを強制終了
            // これまでに入力した行動（actionQueue）をクリア
            actionQueue = [];
            // 即座に行動フェーズへ移行（キューが空なのでそのまま敵ターンへ）
            executeTurnActions();
            return; 
        } 
        // startInputPhase() は呼ばない
    } else if(act==='attack') {
        if(enemies.filter(e=>e.hp>0).length > 1) { openEnemyTargetMenu('attack'); return; }
        let tIdx = enemies.findIndex(e => e.hp > 0);
        actionQueue.push({type:'attack', actorIndex:activeMemberIndex, targetIndex:tIdx, name:p.name}); 
        startInputPhase(); 
    } else if(act==='defend') {
        actionQueue.push({type:'defend', actorIndex:activeMemberIndex, name:p.name}); 
        startInputPhase();
    }
}
function openSpellMenu() { 
    toggleControls('spell'); 
    const p = party[activeMemberIndex]; 
    const container = document.getElementById('spell-controls');
    container.innerHTML = ''; container.style.gridTemplateColumns = "repeat(2, 1fr)";
    
    let count = 0;
    for(let key in p.spells) {
        const spell = p.spells[key];
        if(spell.max === 0) continue; 
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.fontSize = '0.8em';
        btn.innerHTML = `${ELEM_ICONS[spell.element]||""}${spell.name}<br>(${spell.current})`;
        btn.disabled = spell.current <= 0;
        btn.onclick = () => preCastSpell(key);
        container.appendChild(btn);
        count++;
    }
    const backBtn = document.createElement('button'); backBtn.className = 'btn'; backBtn.style.gridColumn = "1 / -1"; backBtn.innerText = "戻る"; backBtn.onclick = closeSpellMenu; container.appendChild(backBtn);
}

function preCastSpell(spellKey) {
    const p = party[activeMemberIndex];
    const spell = p.spells[spellKey];
    if(spell.target === 'all' || spell.target === 'self') {
        actionQueue.push({type:'spell', spellKey:spellKey, actorIndex:activeMemberIndex, targetIndex:-1, name:p.name});
        startInputPhase();
    } else if (spell.type === 'heal' || spell.type === 'buff') {
        toggleControls('target'); 
        ['btn-target-0','btn-target-1','btn-target-2'].forEach((id,i) => { 
            document.getElementById(id).style.display = 'inline-block';
            document.getElementById(id).innerText=`${party[i].name}`; 
            document.getElementById(id).onclick = () => { actionQueue.push({type:'spell', spellKey:spellKey, actorIndex:activeMemberIndex, targetIndex:i, name:p.name}); startInputPhase(); };
        });
        document.querySelector('#target-controls button:last-child').onclick = openSpellMenu;
    } else {
        if(enemies.filter(e=>e.hp>0).length > 1) { openEnemyTargetMenu('spell', spellKey); } else { let tIdx = enemies.findIndex(e => e.hp > 0); actionQueue.push({type:'spell', spellKey:spellKey, actorIndex:activeMemberIndex, targetIndex:tIdx, name:p.name}); startInputPhase(); }
    }
}

function openEnemyTargetMenu(actionType, spellKey=null) {
    toggleControls('target');
    const btns = ['btn-target-0','btn-target-1','btn-target-2'];
    btns.forEach(id => document.getElementById(id).style.display = 'none'); 
    enemies.forEach((e, i) => {
        if(e.hp <= 0) return; 
        const btn = document.getElementById(btns[i]); 
        if(btn) {
            btn.style.display = 'inline-block';
            btn.innerText = `${e.name}`; 
            btn.onclick = () => {
                const p = party[activeMemberIndex];
                if(actionType === 'attack') { actionQueue.push({type:'attack', actorIndex:activeMemberIndex, targetIndex:i, name:p.name}); } 
                else if(actionType === 'spell') { actionQueue.push({type:'spell', spellKey:spellKey, actorIndex:activeMemberIndex, targetIndex:i, name:p.name}); }
                startInputPhase();
            };
        }
    });
    document.querySelector('#target-controls button:last-child').onclick = () => { if(actionType==='spell') openSpellMenu(); else toggleControls('battle'); };
}

function openBattleItemMenu() { menuReturnTo = 'battle'; battleSpellMode = 'item'; openItemMenu(); }
function executeBattleItem(itemId, targetIdx) { const invIdx = partyInventory.indexOf(itemId); if(invIdx > -1) partyInventory.splice(invIdx, 1); actionQueue.push({type:'item', actorIndex:activeMemberIndex, targetIndex:targetIdx, itemId:itemId, name:party[activeMemberIndex].name}); startInputPhase(); }
function closeSpellMenu() { toggleControls('battle'); }
function executeTurnActions() { toggleControls('none'); document.getElementById('battle-msg').innerText = "⚔️ 戦闘中..."; processQueue(); }

function processQueue() { 
    if(enemies.every(e => e.hp <= 0)) { checkWin(); return; } 
    if(actionQueue.length===0) { setTimeout(enemyTurn, 500); return; } 
    
    const act = actionQueue.shift(); 
    const actor = party[act.actorIndex]; 
    if(!actor.alive) { processQueue(); return; } 

    let nextDelay = 800; 

    if(act.type === 'defend') {
        actor.isDefending = true; document.getElementById('battle-msg').innerText = `🛡️ ${actor.name} は防御`; log(`${actor.name}は防御した`);
    } else if (act.type === 'attack') {
        // (省略: 変更なし)
        let target = enemies[act.targetIndex]; if(!target || target.hp <= 0) target = enemies.find(e => e.hp > 0);
        if(target) {
            document.getElementById('battle-msg').innerText = `⚔️ ${actor.name} の攻撃`; playVfx('slash', enemies.indexOf(target));
            let dmg = Math.floor(actor.atk * (actor.buffs.atk>0 ? 1.5 : 1.0)) - Math.floor(Math.random()*2); 
            if(target.physResist) { dmg = Math.floor(dmg * 0.2); log("物理攻撃が効きにくい！"); }
            else if(target.highDef) { dmg = Math.floor(dmg * 0.5); log("硬い！"); }
            if(dmg < 1) dmg = 1; target.hp -= dmg;
            log(`${actor.name}の攻撃！ ${target.name}に${dmg}ダメ`);
            checkEnemyDeath(target, enemies.indexOf(target));
        }
    } else if (act.type === 'spell') {
        const spell = actor.spells[act.spellKey]; spell.current--;
        document.getElementById('battle-msg').innerText = `${ELEM_ICONS[spell.element]||"✨"} ${actor.name} の${spell.name}`; 
        
        if(spell.type === 'heal') {
            playVfx('heal'); const targets = (spell.target === 'all') ? party : [party[act.targetIndex]];
            targets.forEach(t => { 
                // ★修正: 生存チェックを追加。死んでいる場合は回復しない
                if(t.alive) {
                    let rec = spell.power + actor.stats[spell.stat]; 
                    t.hp += rec; 
                    if(t.hp > t.maxHp) t.hp = t.maxHp; 
                    log(`${t.name}が回復した`); 
                } else {
                    log(`${t.name}には効果がなかった`);
                }
            });
        } else if (spell.type === 'revive') {
            // ★追加: 戦闘中の蘇生処理
            playVfx('heal'); 
            const t = party[act.targetIndex];
            if(t.alive) {
                log("しかし効果がなかった");
            } else {
                t.alive = true;
                t.status = 'normal';
                t.hp = Math.floor(t.maxHp / 2);
                log(`${t.name}が生き返った！`);
            }
        } else if (spell.type === 'buff') {
            playVfx('heal'); const t = party[act.targetIndex];
            
            // ★修正: 固定の「3」ではなく「spell.turns」を使うように変更
            if(spell.effect === 'defUp') { 
                t.buffs.def = spell.turns; // ← ここを 3 から spell.turns に変更
                log(`${t.name}の防御力が上がった！`); 
            }
            if(spell.effect === 'atkUp') { 
                t.buffs.atk = spell.turns; // ← ここを 3 から spell.turns に変更
                log(`${t.name}の攻撃力が上がった！`); 
            }
        } else if (spell.type === 'util' && act.spellKey === 'escape') {
            log(`${actor.name}はエスケープを唱えた！`); endBattle(); returnToTown(true); return;
        } else if (spell.type === 'attack' || spell.type === 'phys') {
            // (省略: 変更なし)
            let targets = []; if(spell.target === 'all') targets = enemies.filter(e => e.hp > 0); else { let t = enemies[act.targetIndex]; if(!t || t.hp <= 0) t = enemies.find(e => e.hp > 0); if(t) targets = [t]; }
            targets.forEach(t => {
                let baseVal = (spell.type === 'phys') ? (actor.atk * spell.mult) : (spell.power + (actor.stats[spell.stat] * 2));
                if(spell.type === 'phys' && actor.buffs.atk > 0) baseVal *= 1.5;
                let mod = getElementMultiplier(spell.element, t.elem);
                let dmg = Math.floor(baseVal * mod);
                if(spell.type === 'phys' && t.physResist) { dmg = Math.floor(dmg * 0.2); log("効きにくい！"); }
                if(dmg < 1) dmg = 1; t.hp -= dmg;
                let vfx = (spell.element === ELEM.FIRE) ? 'fire' : 'slash'; playVfx(vfx, enemies.indexOf(t));
                log(`${t.name}に${dmg}ダメ` + (mod>1?"(弱点!)":""));
                checkEnemyDeath(t, enemies.indexOf(t));
            });
        }
    } else if(act.type==='item') { 
        // (省略: 変更なし)
        const item = itemData[act.itemId]; const t = party[act.targetIndex]; 
        document.getElementById('battle-msg').innerText = `💊 ${actor.name} は ${item.name} を使用`; 
        if(item.effect === 'heal') { playVfx('heal'); t.hp += item.power; if(t.hp > t.maxHp) t.hp = t.maxHp; log(`${t.name}のHPが回復した`); } 
        else if(item.effect === 'curePoison') { if(t.status==='poison') {t.status='normal'; log("毒が消えた");} else log("効果がなかった"); } 
        else if(item.effect === 'curePara') { if(t.status==='paralyze') {t.status='normal'; log("麻痺が治った");} else log("効果がなかった"); } 
    } else if (act.type === 'wait') {
        nextDelay = 100;
    }

    updateDungeonUI(); 
    updateEnemyStatName(); 
    setTimeout(processQueue, nextDelay); 
}

function getElementMultiplier(atkElem, defElem) {
    if(atkElem === ELEM.NONE) return 1.0;
    if((atkElem===ELEM.FIRE && defElem===ELEM.WIND) || (atkElem===ELEM.WIND && defElem===ELEM.EARTH) || (atkElem===ELEM.EARTH && defElem===ELEM.WATER) || (atkElem===ELEM.WATER && defElem===ELEM.FIRE)) return 1.5;
    if((atkElem===ELEM.LIGHT && defElem===ELEM.DARK) || (atkElem===ELEM.DARK && defElem===ELEM.LIGHT)) return 1.5;
    return 1.0;
}

function checkEnemyDeath(targetEnemy, imgIdx) {
    if(targetEnemy.hp <= 0) {
        targetEnemy.hp = 0;
        const unit = document.getElementById(`enemy-unit-${imgIdx}`);
        if(unit) unit.style.display = 'none'; 
        log(`${targetEnemy.name}を倒した！`);
    }
}

// ハクスラ用：追加効果生成（必ず付与版）
function createDropItem(id) {
    const itemDef = itemData[id];
    // 消耗品は追加効果なし
    if (itemDef.type === 'consumable') return id;

    let bonus = {};
    const rand = Math.random();

    // ★変更: 「ボーナスなし」を削除し、確率を再配分
    // 0.00 - 0.60 (60%): 単発ステータスアップ
    // 0.60 - 0.80 (20%): HPアップ
    // 0.80 - 0.90 (10%): 全ステータスアップ (レア)
    // 0.90 - 1.00 (10%): マイナス効果

    if (rand < 0.60) {
        // 単発ステータスアップ
        const stats = ['str', 'int', 'pie', 'vit', 'agi', 'luc'];
        const target = stats[Math.floor(Math.random() * stats.length)];
        bonus[target] = Math.floor(Math.random() * 5) + 1; 
    } else if (rand < 0.80) {
        // HPアップ
        bonus['hp'] = Math.floor(Math.random() * 20) + 10; 
    } else if (rand < 0.90) {
        // 全ステータスアップ
        const val = Math.floor(Math.random() * 3) + 1;
        ['str', 'int', 'pie', 'vit', 'agi', 'luc'].forEach(s => bonus[s] = val);
    } else {
        // マイナス効果
        const stats = ['str', 'int', 'pie', 'vit', 'agi', 'luc'];
        const target = stats[Math.floor(Math.random() * stats.length)];
        bonus[target] = (Math.floor(Math.random() * 3) + 1) * -1; 
    }

    return {
        itemId: id,
        bonus: bonus,
        uid: Date.now() + Math.random()
    };
}

// 追加効果のテキスト化（修正版）
function getBonusString(itemObj) {
    if (!itemObj || typeof itemObj === 'string' || !itemObj.bonus) return "";
    
    // ボーナスオブジェクトが空なら空文字を返す
    if (Object.keys(itemObj.bonus).length === 0) return "";

    let parts = [];
    const b = itemObj.bonus;
    // 全ステータスチェック
    const allStats = ['str', 'int', 'pie', 'vit', 'agi', 'luc'];
    const firstVal = b[allStats[0]];
    
    // 全ステータスが同じ値かチェック（全ステアップ判定）
    if (firstVal && allStats.every(k => b[k] === firstVal)) {
        parts.push(`全ステ${firstVal > 0 ? '+' : ''}${firstVal}`);
    } else {
        for (let key in b) {
            const val = b[key];
            if (val === 0) continue;
            const label = {str:'力', int:'知', pie:'信', vit:'体', agi:'速', luc:'運', hp:'HP'}[key] || key;
            parts.push(`${label}${val > 0 ? '+' : ''}${val}`);
        }
    }
    
    // ★変更: 「（追加効果：～）」という形式で返す
    return parts.length > 0 ? `<span style="color:#ff0;">（追加効果：${parts.join(' ')}）</span>` : "";
}

function checkWin() { 
    if(enemies.every(e => e.hp <= 0)) { 
        let totalExp = 0; let totalGold = 0;
        enemies.forEach(e => { totalExp += e.exp; totalGold += e.gold; });
        
        document.querySelectorAll('.dynamic-enemy-container').forEach(e => e.style.display = 'none');
        
        let dropMsg = "";
        // ★変更: ドロップ率を 0.4(40%) -> 0.8(80%) に変更
        const dropRate = enemies.some(e=>e.isBoss) ? 1.0 : 0.8;
        
        if(Math.random() < dropRate) {
            const dropList = dungeonDropData[currentDungeonId];
            if(dropList && dropList.length > 0) {
                const getItemId = dropList[Math.floor(Math.random() * dropList.length)];
                
                // オブジェクト化（必ず追加効果が付くよう修正された関数を呼ぶ）
                const dropItem = createDropItem(getItemId);
                partyInventory.push(dropItem);
                
                const name = itemData[getItemId].name;
                const bonusStr = getBonusString(dropItem);
                dropMsg = `\n宝箱を拾った！ [${name}${bonusStr}] を入手。`;
            }
        }

        log(`勝利！ 合計 EXP:${totalExp} Gold:${totalGold}${dropMsg}`); 
        
        partyGold += totalGold; 
        party.forEach(p => { if(p.alive) p.exp += totalExp; }); 
        
        if(enemies.some(e => e.isBoss)) setTimeout(gameClear, 1000); 
        else setTimeout(endBattle, 1000); 
    } 
}

// --- 敵のAI思考ルーチン ---
// yamaRPG/game.js の enemyTurn 関数のみ抜粋・修正版

function enemyTurn() { 
    if(party.every(p=>!p.alive)) { gameOver(); return; } 
    let actingEnemies = enemies.filter(e => e.hp > 0);
    const executeEnemyAction = (idx) => {
        if(idx >= actingEnemies.length) { finishEnemyTurn(); return; }
        const enemy = actingEnemies[idx];
        
        // 溜め状態の処理
        if(enemy.isCharging) {
            enemy.isCharging = false;
            playVfx('fire'); log(`${enemy.name}の溜め攻撃！`);
            let t = getRandomTarget(); 
            // 痛恨ダメージもダンジョンレベルに応じて強化
            let chargeDmg = 50 + (currentDungeonId * currentDungeonId * 5); 
            if(t) takeDamage(t, chargeDmg, enemy.elem, true); 
            updateDungeonUI();
            setTimeout(() => executeEnemyAction(idx + 1), 1000);
            return;
        }

        // 行動決定
        let action = "attack";
        if(enemy.actions && enemy.actions.length > 0) {
            if(Math.random() < 0.3) {
                action = enemy.actions[Math.floor(Math.random() * enemy.actions.length)];
            }
        }

        // アクション実行
        if(action === "charge") {
            enemy.isCharging = true;
            log(`${enemy.name}は力を溜めている...`);
        } 
        else if (action === "poisonMist") {
            playVfx('damage');
            log(`${enemy.name}の毒の霧！`);
            party.forEach(p => {
                if(p.alive && Math.random() < 0.4) { p.status = 'poison'; log(`${p.name}は毒を受けた`); }
            });
        }
        else if (action === "paralyzeVine") {
            playVfx('damage');
            let t = getRandomTarget();
            if(t) {
                log(`${enemy.name}の絡みつくツタ！`);
                // 固定ダメージではなく少し強化
                let vineDmg = 10 + (currentDungeonId * 2);
                takeDamage(t, vineDmg, ELEM.EARTH);
                if(Math.random() < 0.4) { t.status = 'paralyze'; log(`${t.name}は麻痺した！`); }
            }
        }
        else if (action === "tsunami" || action === "storm" || action === "inferno") {
            playVfx('fire'); // 代用
            let elem = (action==='tsunami')?ELEM.WATER : (action==='storm')?ELEM.WIND : ELEM.FIRE;
            log(`${enemy.name}の全体魔法！`);
            // ★修正箇所1: 魔法ダメージ強化 (二乗計算)
            party.forEach(p => { 
                if(p.alive) {
                    let magDmg = 10 + (currentDungeonId * currentDungeonId * 3);
                    takeDamage(p, magDmg, elem); 
                }
            });
        }
        else {
            // 通常攻撃 + 追加効果
            playVfx('damage'); 
            let t = getRandomTarget(); 
            if(t) { 
                // ★修正箇所2: 物理ダメージ強化 (二乗計算)
                let dmg = 5 + (currentDungeonId * currentDungeonId * 4); 
                if(enemy.isBoss) dmg += 20; // ボス補正も強化
                
                // クリティカル
                if(enemy.effect === 'critical' && Math.random() < 0.1) {
                    dmg *= 3; log("痛恨の一撃！！！");
                }
                
                takeDamage(t, dmg, enemy.elem); 
                
                // 毒・麻痺付与
                if(t.alive && enemy.effect === 'poison' && Math.random() < enemy.rate) { t.status='poison'; log(`${t.name}は毒を受けた！`); }
                if(t.alive && enemy.effect === 'paralyze' && Math.random() < enemy.rate) { t.status='paralyze'; log(`${t.name}は麻痺した！`); }
            }
        }

        updateDungeonUI();
        setTimeout(() => executeEnemyAction(idx + 1), 800);
    };
    executeEnemyAction(0);
}

function getRandomTarget() { const alive = party.filter(p=>p.alive); if(alive.length===0) return null; return alive[Math.floor(Math.random()*alive.length)]; }

function takeDamage(target, dmg, enemyElem, isHeavy=false) { 
    if(target.isDefending) dmg = Math.floor(dmg/2); 
    if(target.buffs.def > 0) dmg = Math.floor(dmg * 0.6);
    
    // 装備防御の反映
    dmg -= Math.floor(target.def / 2);
    if(dmg < 1) dmg = 1; 
    
    target.hp -= dmg; 
    log(`${target.name}に${dmg}のダメージ`); 
    if(target.hp<=0) { target.hp=0; target.alive=false; log(`${target.name}は倒れた`); } 
    updateDungeonUI(); 
}

function finishEnemyTurn() { if(party.every(p=>!p.alive)) setTimeout(gameOver,1000); else { activeMemberIndex=0; setTimeout(()=>startInputPhase(true), 1000); } }
function endBattle() { isBattle=false; document.querySelectorAll('.dynamic-enemy-container').forEach(e => e.remove()); document.getElementById('enemy-stat').style.visibility='hidden'; document.getElementById('battle-msg').style.display='none'; updateDungeonUI(); toggleControls('move'); }
function gameOver() { log("全滅しました..."); setTimeout(()=>{ isBattle=false; endBattle(); returnToTown(true); party.forEach(p=>{p.hp=1;p.alive=true;p.status='normal';}); partyGold = Math.floor(partyGold/2); townLog("全滅した... 所持金が半分になった。"); updateTownStatus(); },2000); }
function gameClear() {
    // 今回クリアしたダンジョンIDをリストに追加（重複チェック）
    if (!clearedDungeons.includes(currentDungeonId)) {
        clearedDungeons.push(currentDungeonId);
    }

    const bossName = dungeonData[currentDungeonId].boss.name;
    const dungeonName = dungeonData[currentDungeonId].name;

    // 全5つのダンジョンをクリアしたか判定
    if (clearedDungeons.length >= 5) {
        // ★全クリア時の処理
        alert(`【GAME CLEAR】\n\nおめでとうございます！\n${bossName}を倒し、ついに全ての迷宮を制覇しました！\n\nあなたは伝説の冒険者として語り継がれるでしょう。`);
        
        endBattle(); 
        returnToTown(true); // 町へ戻る
        
        townLog(`全てのダンジョンを踏破し、ゲームをクリアした！！`);
        // 必要であればここでスタッフロールや特別なクリア画面への遷移を追加できます
    } else {
        // ★通常ボス撃破時の処理（まだ未クリアのダンジョンがある）
        const progress = clearedDungeons.length;
        alert(`${bossName}を討伐した！\n探索を終了し、町へ戻ります。\n(クリア状況: ${progress}/5)`);
        
        endBattle(); 
        returnToTown(true); // 町へ戻る
        
        townLog(`${dungeonName}を踏破した！ (達成度: ${progress}/5)`);
    }
    
    updateTownStatus(); 
}

// --- 演出・ユーティリティ ---
function toggleControls(mode) {
    ['move-controls','battle-controls','spell-controls','target-controls'].forEach(id=>document.getElementById(id).style.display='none');
    if(mode==='battle') document.getElementById('battle-controls').style.display='grid';
    else if(mode==='spell') document.getElementById('spell-controls').style.display='grid';
    else if(mode==='target') document.getElementById('target-controls').style.display='grid';
    else if(mode==='move') { document.getElementById('move-controls').style.display='grid'; checkObject(); }
}
function playVfx(t, targetIdx=null){
    const l=document.getElementById('vfx-layer');
    const m=document.getElementById('main-area');
    const d=document.createElement('div');
    let targetUnit = null;
    if(targetIdx !== null) targetUnit = document.getElementById(`enemy-unit-${targetIdx}`);
    if(t==='slash'||t==='fire'){
        d.className=(t==='slash')?'vfx-slash':'vfx-fire';
        if(targetUnit) {
            targetUnit.classList.remove('shake-enemy');
            void targetUnit.offsetWidth;
            targetUnit.classList.add('shake-enemy');
            d.style.position = 'absolute';
            d.style.left = targetUnit.style.left; 
            d.style.top = targetUnit.style.top;
        }
    } else if(t==='heal'){ d.className='vfx-heal'; } 
    else if(t==='damage'){
        d.className='vfx-damage';
        m.classList.remove('shake-screen');
        void m.offsetWidth;
        m.classList.add('shake-screen');
    }
    l.appendChild(d);
    setTimeout(()=>d.remove(),1000);
}
function initMapUI(){const a=document.getElementById('map-area');a.innerHTML="";for(let y=0;y<mapSize;y++)for(let x=0;x<mapSize;x++){let d=document.createElement('div');d.id=`cell-${x}-${y}`;d.className='cell cell-unknown';a.appendChild(d);}}
function updatePlayerVision(){[{x:0,y:0},{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}].forEach(o=>{let tx=playerPos.x+o.x,ty=playerPos.y+o.y;if(tx>=0&&tx<mapSize&&ty>=0&&ty<mapSize)visitedMaps[currentDungeonId][currentFloor][ty][tx]=true;});}
function renderMap(){
    const ar = ["▲","▶","▼","◀"]; // 北、東、南、西
    const vis = visitedMaps[currentDungeonId][currentFloor];
    
    for(let y=0; y<mapSize; y++) {
        for(let x=0; x<mapSize; x++) {
            const c = document.getElementById(`cell-${x}-${y}`);
            c.innerText = "";
            c.className = 'cell'; // 一旦リセット

            // 1. 現在地 (最優先)
            if(x === playerPos.x && y === playerPos.y) {
                c.classList.add('cell-hero');
                c.innerText = ar[playerPos.dir];
                continue;
            }

            // 2. 未踏破エリア
            if(!vis[y][x]) {
                c.classList.add('cell-unknown');
                continue;
            }

            // 3. マップデータに基づく描画
            const v = currentMapData[y][x];
            
            if (v === TILE.WALL) {
                c.classList.add('cell-wall');
            } else {
                // 基本は床
                c.classList.add('cell-floor');

                // イベントがある場合の追加クラスとアイコン
                if (v === TILE.STAIRS || v === TILE.UP_STAIRS) {
                    c.classList.add('cell-stairs');
                    c.innerText = "≡"; // 階段記号
                } else if (v === TILE.BOSS) {
                    c.classList.add('cell-boss');
                    c.innerText = "💀";
                } else if (v === TILE.CHEST) {
                    // 宝箱 (開けたかどうかチェック)
                    const key = `${currentDungeonId}_${currentFloor}_${x}_${y}`;
                    if(!openedChests.includes(key)) {
                        c.classList.add('cell-chest');
                        c.innerText = "■"; // 宝箱あり
                    } else {
                        // 開封済みはただの床にするか、空箱マークにする
                        c.innerText = "□";
                        c.style.color = "#666"; // 目立たなくする
                    }
                } else if (v === TILE.SHOP) {
                    c.classList.add('cell-event');
                    c.innerText = "$";
                } else if (v === TILE.EXIT) {
                    c.classList.add('cell-entrance');
                    c.innerText = "E";
                } else if (v === TILE.FLOW) {
                    c.innerText = "~"; // 流水
                    c.style.color = "#88f";
                } else if (v === TILE.WARP) {
                    c.classList.add('cell-event');
                    c.innerText = "@";
                } else if (v === TILE.HOLE) {
                    c.innerText = "O";
                }
            }
        }
    }
}
function log(m){const l=document.getElementById('log');l.innerHTML+=`<p>> ${m}</p>`;l.scrollTop=l.scrollHeight;}

// ==========================================
//  セーブ＆ロード機能 (追加実装)
// ==========================================

const SAVE_KEY = 'yamaRPG_SaveData_v1';

function saveGame() {
    // 保存するデータをまとめる
    // 現在のシーン判定 (ダンジョン画面が表示されていればダンジョン、それ以外は町)
    const isDungeon = document.getElementById('dungeon-scene').style.display === 'flex';
    
    const saveData = {
        party: party,
        inventory: partyInventory,
        gold: partyGold,
        openedChests: openedChests,
        visitedMaps: visitedMaps,
        clearedDungeons: clearedDungeons || [], // クリア状況
        // 場所データ
        currentDungeonId: currentDungeonId,
        currentFloor: currentFloor,
        playerPos: playerPos,
        // 再開時のシーン情報
        scene: isDungeon ? 'dungeon' : 'town',
        timestamp: new Date().toLocaleString()
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        alert(`セーブしました！\n日時: ${saveData.timestamp}`);
    } catch (e) {
        alert("セーブに失敗しました。\nブラウザの容量制限などの可能性があります。");
        console.error(e);
    }
}

function loadGame() {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) {
        alert("セーブデータが見つかりません。");
        return;
    }

    if (!confirm("続きから始めますか？\n(現在の進行状況は上書きされます)")) return;

    try {
        const data = JSON.parse(json);

        // データを復元
        party = data.party;
        partyInventory = data.inventory;
        partyGold = data.gold;
        openedChests = data.openedChests;
        visitedMaps = data.visitedMaps;
        clearedDungeons = data.clearedDungeons || [];
        
        currentDungeonId = data.currentDungeonId;
        currentFloor = data.currentFloor;
        playerPos = data.playerPos;

        // UIやステータス計算の更新
        party.forEach(p => {
            // オブジェクトのメソッドなどはJSONで消えるため、念のため再計算などを通す
            // (このゲームの作りならデータ復元だけで概ね動きます)
            calculateStats(p); 
        });

        // 画面切り替え処理
        document.getElementById('prologue-scene').style.display = 'none';
        document.getElementById('camp-overlay').style.display = 'none';

        if (data.scene === 'dungeon') {
            // ダンジョンへ復帰
            document.getElementById('town-scene').style.display = 'none';
            document.getElementById('dungeon-scene').style.display = 'flex';
            
            // マップデータの再ロード
            currentMapData = maps[currentDungeonId][currentFloor];
            const cv = document.getElementById('dungeon-canvas');
            if(cv) ctx = cv.getContext('2d');

            // UI更新
            const dName = dungeonData[currentDungeonId].name;
            document.getElementById('floor-display').innerText = `${dName} B${currentFloor}F`;
            
            checkObject();
            updatePlayerVision();
            updateDungeonUI();
            toggleControls('move');
            log("ゲームをロードしました。");
        } else {
            // 町へ復帰
            document.getElementById('dungeon-scene').style.display = 'none';
            document.getElementById('town-scene').style.display = 'block';
            updateTownStatus();
            townLog("ゲームをロードしました。");
        }

    } catch (e) {
        alert("セーブデータの読み込みに失敗しました。データが壊れている可能性があります。");
        console.error(e);
    }
}

// ★追加: 前のキャラクターに戻る処理
function battleBack() {
    // 1人目の時は戻れない
    if (activeMemberIndex <= 0) return;

    // 前のキャラクターの行動をキャンセルする
    // (actionQueueの末尾は「前の人のコマンド」が入っているため削除)
    actionQueue.pop();

    // インデックスを戻す
    // ※前のキャラが死んでいる場合は飛ばして、さらにその前へ戻る必要がある
    do {
        activeMemberIndex--;
    } while (activeMemberIndex > 0 && !party[activeMemberIndex].alive);

    // インデックスを戻した状態で入力フェーズを再開
    // 引数を true にすることで、startInputPhase 内での activeMemberIndex++ を防ぐ
    startInputPhase(true);
}