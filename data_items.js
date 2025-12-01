// ==========================================
//  アイテム・装備データ
// ==========================================

// 装備スロットごとの定義データ
const EQUIP_SLOTS_DEF = {
    weapon: { label: "Main Hand", name: "武器", icon: "⚔️", color: "#f88" },
    shield: { label: "Off Hand",  name: "盾",   icon: "🛡️", color: "#88f" },
    helm:   { label: "Head",      name: "頭",   icon: "🪖", color: "#fa8" },
    armor:  { label: "Body",      name: "身体", icon: "🧥", color: "#8f8" },
    acc:    { label: "Accessory", name: "装飾", icon: "💍", color: "#d8f" }
};

const itemData = {
    // Tier 1: 地下迷宮 (Lv1~3)
    w_sw1: {name:"銅の剣", type:"weapon", subType:"sword", phys: PHYS.SLASH, power:12, price:80, tier:1},   
    w_sp1: {name:"竹槍", type:"weapon", subType:"spear", phys: PHYS.PIERCE, power:13, price:90, tier:1}, 
    w_ax1: {name:"石の斧", type:"weapon", subType:"axe", phys: PHYS.BLUNT, power:15, price:110, tier:1}, 
    w_mc1: {name:"こんぼう", type:"weapon", subType:"mace", phys: PHYS.BLUNT, power:14, price:90, tier:1}, 
    w_st1: {name:"樫の杖", type:"weapon", subType:"staff", phys: PHYS.BLUNT, power:8, price:60, tier:1},  
    a_lt1: {name:"旅人の服", type:"armor", subType:"clothes", ac:3, price:50, tier:1},
    a_hv1: {name:"皮の鎧", type:"armor", subType:"armor", ac:5, price:150, tier:1},
    s_lt1: {name:"皮の盾", type:"shield", subType:"lightShield", ac:2, price:70, tier:1},
    h_lt1: {name:"皮の帽子", type:"helm", subType:"hat", ac:1, price:40, tier:1},

    // Tier 2: 迷いの森 (Lv4~7)
    w_sw2: {name:"鉄の剣", type:"weapon", subType:"sword", phys: PHYS.SLASH, power:18, price:450, tier:2},
    w_sp2: {name:"鉄の槍", type:"weapon", subType:"spear", phys: PHYS.PIERCE, power:19, price:480, tier:2},
    w_ax2: {name:"鉄の斧", type:"weapon", subType:"axe", phys: PHYS.SLASH, power:21, price:550, tier:2},
    w_mc2: {name:"フレイル", type:"weapon", subType:"mace", phys: PHYS.BLUNT, power:20, price:500, tier:2},
    w_st2: {name:"魔導の杖", type:"weapon", subType:"staff", phys: PHYS.BLUNT, power:13, price:400, tier:2},
    a_lt_t2: {name:"武道着", type:"armor", subType:"clothes", ac:8, price:500, tier:2},
    a_hv_t2: {name:"鎖帷子", type:"armor", subType:"armor", ac:12, price:750, tier:2},
    s_hv_t2: {name:"鉄の盾", type:"shield", subType:"heavyShield", ac:6, price:550, tier:2},
    h_hv_t2: {name:"鉄の兜", type:"helm", subType:"helm", ac:4, price:450, tier:2},
    // ★追加: Tier 2 軽装 (小盾・帽子)
    s_lt_t2: {name:"ウッドシールド", type:"shield", subType:"lightShield", ac:4, price:350, tier:2},
    h_lt_t2: {name:"ターバン", type:"helm", subType:"hat", ac:2, price:250, tier:2},

    // Tier 3: 海底洞窟 (Lv8~11)
    w_sw3: {name:"鋼の剣", type:"weapon", subType:"sword", phys: PHYS.SLASH, power:26, price:1200, tier:3},
    w_sp3: {name:"パルチザン", type:"weapon", subType:"spear", phys: PHYS.PIERCE, power:28, price:1300, tier:3},
    w_ax3: {name:"バトルアックス", type:"weapon", subType:"axe", phys: PHYS.SLASH, power:32, price:1500, tier:3},
    w_mc3: {name:"モーニングスター", type:"weapon", subType:"mace", phys: PHYS.BLUNT, power:30, price:1400, tier:3},
    w_st3: {name:"ルビーの杖", type:"weapon", subType:"staff", phys: PHYS.BLUNT, power:18, price:1100, tier:3},
    a_lt2: {name:"みかわしの服", type:"armor", subType:"clothes", ac:16, price:1400, tier:3},
    a_hv2: {name:"鉄の鎧", type:"armor", subType:"armor", ac:22, price:2000, tier:3},
    s_hv2: {name:"カイトシールド", type:"shield", subType:"heavyShield", ac:10, price:1300, tier:3},
    h_hv2: {name:"鉄仮面", type:"helm", subType:"helm", ac:8, price:1000, tier:3},
    ac01:{name:"守りの指輪",type:"accessory",subType:"acc",ac:5, price:1500, tier:3}, 
    // ★追加: Tier 3 軽装 (小盾・帽子)
    s_lt2: {name:"シルバーバックラー", type:"shield", subType:"lightShield", ac:7, price:900, tier:3},
    h_lt2: {name:"シルクの帽子", type:"helm", subType:"hat", ac:5, price:700, tier:3},

    // Tier 4: 古代神殿 (Lv12~15)
    // ※Tier4はもともと軽装(s_lt_t4, h_lt_t4)が定義済み
    w_sw4: {name:"プラチナソード", type:"weapon", subType:"sword", phys: PHYS.SLASH, power:45, price:3500, tier:4},
    w_sp4: {name:"トライデント", type:"weapon", subType:"spear", phys: PHYS.PIERCE, power:48, price:3800, tier:4},
    w_ax4: {name:"グレートアックス", type:"weapon", subType:"axe", phys: PHYS.SLASH, power:54, price:4200, tier:4},
    w_mc4: {name:"ウォーハンマー", type:"weapon", subType:"mace", phys: PHYS.BLUNT, power:50, price:4000, tier:4},
    w_st4: {name:"賢者の杖", type:"weapon", subType:"staff", phys: PHYS.BLUNT, power:30, price:3200, tier:4},
    a_lt_t4: {name:"魔法の法衣", type:"armor", subType:"clothes", ac:28, price:4000, tier:4},
    a_hv_t4: {name:"魔法の鎧", type:"armor", subType:"armor", ac:35, price:5500, tier:4},
    s_lt_t4: {name:"魔法の盾", type:"shield", subType:"lightShield", ac:16, price:3500, tier:4},
    h_lt_t4: {name:"司祭の帽子", type:"helm", subType:"hat", ac:12, price:2800, tier:4},

    // Tier 5: 天空の塔 (Lv16~20)
    w_sw5: {name:"ドラゴンキラー", type:"weapon", subType:"sword", phys: PHYS.SLASH, power:70, price:9000, tier:5},
    w_sp5: {name:"ドラゴンランス", type:"weapon", subType:"spear", phys: PHYS.PIERCE, power:75, price:9500, tier:5},
    w_ax5: {name:"魔神の斧", type:"weapon", subType:"axe", phys: PHYS.SLASH, power:82, price:11000, tier:5},
    w_mc5: {name:"ギガントハンマー", type:"weapon", subType:"mace", phys: PHYS.BLUNT, power:78, price:10500, tier:5},
    w_st5: {name:"世界樹の杖", type:"weapon", subType:"staff", phys: PHYS.BLUNT, power:50, price:8500, tier:5},
    a_lt3: {name:"大賢者のローブ", type:"armor", subType:"clothes", ac:45, price:10000, tier:5},
    a_hv3: {name:"ドラゴンメイル", type:"armor", subType:"armor", ac:60, price:15000, tier:5},
    s_hv3: {name:"勇者の盾", type:"shield", subType:"heavyShield", ac:30, price:9000, tier:5},
    h_hv3: {name:"グレートヘルム", type:"helm", subType:"helm", ac:20, price:7000, tier:5},
    ac02:{name:"力の指輪",type:"accessory",subType:"acc",power:10, price:5000, tier:5},
    // ★追加: Tier 5 軽装 (小盾・帽子)
    s_lt3: {name:"ルーンシールド", type:"shield", subType:"lightShield", ac:22, price:6500, tier:5},
    h_lt3: {name:"司教の帽子", type:"helm", subType:"hat", ac:15, price:5500, tier:5},

    // Tier 6: 最強装備 (伝説級)
    w_sw6: {name:"ラグナロク", type:"weapon", subType:"sword", phys: PHYS.SLASH, power:100, price:25000, tier:6},
    w_sp6: {name:"グングニル", type:"weapon", subType:"spear", phys: PHYS.PIERCE, power:105, price:26000, tier:6},
    w_ax6: {name:"パンゲアブレイカー", type:"weapon", subType:"axe", phys: PHYS.SLASH, power:115, price:28000, tier:6},
    w_mc6: {name:"ミョルニル", type:"weapon", subType:"mace", phys: PHYS.BLUNT, power:110, price:27000, tier:6},
    w_st6: {name:"カドゥケウス", type:"weapon", subType:"staff", phys: PHYS.BLUNT, power:70, price:24000, tier:6},
    
    a_lt6: {name:"熾天使の羽衣", type:"armor", subType:"clothes", ac:70, price:22000, tier:6},
    a_hv6: {name:"アダマンアーマー", type:"armor", subType:"armor", ac:95, price:30000, tier:6},
    
    s_hv6: {name:"イージスの盾", type:"shield", subType:"heavyShield", ac:50, price:20000, tier:6},
    h_hv6: {name:"源氏の兜", type:"helm", subType:"helm", ac:40, price:18000, tier:6},
    // ★追加: Tier 6 軽装 (小盾・帽子)
    s_lt6: {name:"聖女の盾", type:"shield", subType:"lightShield", ac:35, price:15000, tier:6},
    h_lt6: {name:"ロイヤルクラウン", type:"helm", subType:"hat", ac:28, price:14000, tier:6},
    
    ac03: {name:"アルテマリング", type:"accessory", subType:"acc", power:20, ac:10, price:50000, tier:6},

// --- itemData への追記 ---

    // === 短剣 (Dagger) Tier 1-6 ===
    w_dg1: {name:"ナイフ", type:"weapon", subType:"dagger", phys: PHYS.SLASH, power:10, price:60, tier:1},
    w_dg2: {name:"ダガー", type:"weapon", subType:"dagger", phys: PHYS.SLASH, power:16, price:350, tier:2},
    w_dg3: {name:"アサシンダガー", type:"weapon", subType:"dagger", phys: PHYS.PIERCE, power:24, price:1000, tier:3},
    w_dg4: {name:"マンゴーシュ", type:"weapon", subType:"dagger", phys: PHYS.SLASH, power:40, price:3000, tier:4},
    w_dg5: {name:"ソードブレイカー", type:"weapon", subType:"dagger", phys: PHYS.SLASH, power:65, price:8000, tier:5},
    w_dg6: {name:"ゾーリンシェイプ", type:"weapon", subType:"dagger", phys: PHYS.SLASH, power:95, price:23000, tier:6},

    // === 弓 (Bow) Tier 1-6 ===
    w_bw1: {name:"ショートボウ", type:"weapon", subType:"bow", phys: PHYS.PIERCE, power:14, price:100, tier:1},
    w_bw2: {name:"ロングボウ", type:"weapon", subType:"bow", phys: PHYS.PIERCE, power:22, price:500, tier:2},
    w_bw3: {name:"クロスボウ", type:"weapon", subType:"bow", phys: PHYS.PIERCE, power:34, price:1400, tier:3},
    w_bw4: {name:"グレートボウ", type:"weapon", subType:"bow", phys: PHYS.PIERCE, power:56, price:4300, tier:4},
    w_bw5: {name:"エルフィンボウ", type:"weapon", subType:"bow", phys: PHYS.PIERCE, power:85, price:11500, tier:5},
    w_bw6: {name:"アルテミスの弓", type:"weapon", subType:"bow", phys: PHYS.PIERCE, power:120, price:29000, tier:6},

    // === 刀 (Katana) Tier 3-6 ===
    w_kt3: {name:"打刀", type:"weapon", subType:"katana", phys: PHYS.SLASH, power:35, price:1600, tier:3},
    w_kt4: {name:"菊一文字", type:"weapon", subType:"katana", phys: PHYS.SLASH, power:58, price:4500, tier:4},
    w_kt5: {name:"村雨", type:"weapon", subType:"katana", phys: PHYS.SLASH, power:88, price:12000, tier:5},
    w_kt6: {name:"正宗", type:"weapon", subType:"katana", phys: PHYS.SLASH, power:125, price:32000, tier:6},

    // === クナイ (Kunai) Tier 3-6 ===
    w_kn3: {name:"クナイ", type:"weapon", subType:"kunai", phys: PHYS.PIERCE, power:28, price:1200, tier:3},
    w_kn4: {name:"十字手裏剣", type:"weapon", subType:"kunai", phys: PHYS.SLASH, power:46, price:3600, tier:4},
    w_kn5: {name:"風魔手裏剣", type:"weapon", subType:"kunai", phys: PHYS.SLASH, power:72, price:9200, tier:5},
    w_kn6: {name:"影縫い", type:"weapon", subType:"kunai", phys: PHYS.PIERCE, power:102, price:24000, tier:6},

    // 消耗品
    i01:{name:"薬草",type:"consumable",effect:"heal",power:30,price:10,desc:"HP30回復"}, 
    i02:{name:"毒消し草",type:"consumable",effect:"curePoison",price:15,desc:"毒を直す"}, 
    i03:{name:"気付け薬",type:"consumable",effect:"curePara",price:30,desc:"麻痺を直す"}, 
    i04:{name:"天使の羽",type:"consumable",effect:"warp",price:100,desc:"町へ戻る"},
    i05: {name:"目覚めの鈴", type:"consumable", effect:"cureSleep", price:30, desc:"睡眠を覚ます"},
    i06: {name:"気付け草", type:"consumable", effect:"cureConfuse", price:40, desc:"混乱を治す"},
    i07: {name:"金の針", type:"consumable", effect:"cureStone", price:100, desc:"石化を解く"},
    i08: {name:"特薬草", type:"consumable", effect:"heal", power:100, price:80, desc:"HP100回復"},
    i09: {name:"忘却の石", type:"consumable", effect:"respec", price:100, desc:"ステータスを初期化して振り直す"}


};

// 宝箱定義 (MapID_Floor_X_Y)
const fixedChestData = {
    "1_2_8_1": "i01",
    "2_2_5_3": "w01",
    "3_2_1_3": "a02", 
    "4_2_4_1": "ac01", 
    "5_2_1_3": "i04"
};

// --- dungeonDropData の更新 ---
const dungeonDropData = {
    // 1: 地下迷宮 (Tier 1) - 短剣・弓を追加
    1: ['w_sw1','w_ax1','w_mc1','w_st1','w_sp1','w_dg1','w_bw1','a_lt1','h_lt1','s_lt1'], 
    
    // 2: 迷いの森 (Tier 2) - 短剣・弓を追加
    2: ['w_sw2','w_ax2','w_mc2','w_st2','w_sp2','w_dg2','w_bw2', 'a_hv_t2', 'a_lt_t2', 's_hv_t2', 'h_hv_t2', 's_lt_t2', 'h_lt_t2'],
    
    // 3: 海底洞窟 (Tier 3) - 刀・クナイ・短剣・弓を追加
    3: ['w_sw3','w_ax3','w_mc3','w_st3','w_sp3','w_dg3','w_bw3','w_kt3','w_kn3','a_hv2','s_hv2','a_lt2','h_hv2','ac01', 's_lt2', 'h_lt2'], 
    
    // 4: 古代神殿 (Tier 4) - 全種追加
    4: ['w_sw4','w_ax4','w_mc4','w_st4','w_sp4','w_dg4','w_bw4','w_kt4','w_kn4', 'a_hv_t4', 'a_lt_t4', 's_lt_t4', 'h_lt_t4'],

    // 5: 天空の塔 (Tier 5 + Tier 6) - 全種追加
    5: [
        // Tier 5
        'w_sw5','w_ax5','w_mc5','w_st5','w_sp5','w_dg5','w_bw5','w_kt5','w_kn5','a_hv3','s_hv3','a_lt3','h_hv3','ac02', 's_lt3', 'h_lt3',
        // Tier 6 (Rare)
        'w_sw6','w_ax6','w_mc6','w_st6','w_sp6','w_dg6','w_bw6','w_kt6','w_kn6','a_hv6','s_hv6','a_lt6','h_hv6','ac03', 's_lt6', 'h_lt6'
    ] 
};
