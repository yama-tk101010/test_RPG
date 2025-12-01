// ==========================================
//  定数・設定データ
// ==========================================

const mapSize = 20;
const viewRange = 4;

// 属性定義
const ELEM = { NONE:0, FIRE:1, WATER:2, EARTH:3, WIND:4, LIGHT:5, DARK:6 };
const ELEM_ICONS = ["", "🔥", "💧", "🪨", "🍃", "✨", "🌑"];

// 物理属性の定義
const PHYS = { NONE: 'none', SLASH: 'slash', PIERCE: 'pierce', BLUNT: 'blunt' };
const PHYS_ICONS = { slash: "⚔️", pierce: "🔱", blunt: "🔨", none: "👊" };

// エレメントIDに対応するVFXクラス名のマッピング
const ELEM_VFX_MAP = ["slash", "fire", "water", "earth", "wind", "light", "dark"];

// 状態異常の定義
const STATUS = {
    NORMAL: "normal",
    POISON: "poison",
    PARALYZE: "paralyze",
    SLEEP: "sleep",
    CONFUSE: "confuse",
    STUN: "stun",
    STONE: "stone",
    DEAD: "dead"
};

// 状態異常の表示名とアイコン
const STATUS_INFO = {
    normal: { name:"", icon:"" },
    poison: { name:"毒", icon:"☠️", color:"#d0d" },
    paralyze: { name:"麻痺", icon:"⚡", color:"#dd0" },
    sleep: { name:"睡眠", icon:"💤", color:"#88f" },
    confuse: { name:"混乱", icon:"💫", color:"#f80" },
    stun: { name:"気絶", icon:"😵", color:"#fff" },
    stone: { name:"石化", icon:"🗿", color:"#888" },
    dead: { name:"死亡", icon:"🪦", color:"#444" }
};

// マップチップ定義
const TILE = { FLOOR:0, WALL:1, STAIRS:2, BOSS:3, HOLE:4, CHEST:5, SHOP:10, FLOW:7, WARP:8, EXIT:9, UP_STAIRS:6, DOOR:11, LOCKED_DOOR:12, SWITCH:13 };

// 3D描画用座標
const VIEW_METRICS = [
    {x:0, y:0, w:300, h:200}, {x:60, y:40, w:180, h:120},
    {x:100, y:70, w:100, h:60}, {x:120, y:85, w:60, h:30}
];

// 床の奥行きライン定義
const FLOOR_Y = [200, 160, 130, 115, 108, 104, 102];
const CEIL_Y  = [0,   40,  70,  85,  92,  96,  98];
const CEIL_LINES = CEIL_Y; // drawPerspectiveGridで使用