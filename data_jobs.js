// ==========================================
//  職業・スキルデータ (Update: Custom Tree)
// ==========================================

// --- スキルデータ (spellData) ---
const spellData = {
    // --- 攻撃魔法 (単体) --- Cost: 1 (基本)
    fire: { name:"ファイア", type:"attack", element:ELEM.FIRE, target:"single", power:25, stat:"int", cost:3, desc:"単体に火の玉を放つ", learnCost: 1 },
    wind: { name:"ウィンド", type:"attack", element:ELEM.WIND, target:"single", power:25, stat:"int", cost:3, desc:"単体をカマイタチで切り裂く", learnCost: 1 },
    earth: { name:"ロック", type:"attack", element:ELEM.EARTH, target:"single", power:25, stat:"int", cost:3, desc:"単体に岩をぶつける", learnCost: 1 },
    water: { name:"アクア", type:"attack", element:ELEM.WATER, target:"single", power:25, stat:"int", cost:3, desc:"単体に水流を放つ", learnCost: 1 },
    
    // 闇・光は少し強いので Cost: 2
    dark: { name:"ダーク", type:"attack", element:ELEM.DARK, target:"single", power:30, stat:"int", cost:6, desc:"単体を闇の力で攻撃", learnCost: 2 },
    light: { name:"ライト", type:"attack", element:ELEM.LIGHT, target:"single", power:30, stat:"int", cost:4, desc:"単体を聖なる光で攻撃", learnCost: 2 },

    // --- 攻撃魔法 (全体) --- Cost: 2~3
    inferno: { name:"インフェルノ", type:"attack", element:ELEM.FIRE, target:"all", power:45, stat:"int", cost:12, desc:"敵全体を業火で焼き尽くす", learnCost: 2 },
    cocytus: { name:"コキュートス", type:"attack", element:ELEM.WATER, target:"all", power:45, stat:"int", cost:12, desc:"敵全体を絶対零度で凍らす", learnCost: 2 },
    storm: { name:"ストーム", type:"attack", element:ELEM.WIND, target:"all", power:45, stat:"int", cost:12, desc:"敵全体を嵐で切り刻む", learnCost: 2 },
    quake: { name:"クエイク", type:"attack", element:ELEM.EARTH, target:"all", power:45, stat:"int", cost:12, desc:"敵全体を激震で襲う", learnCost: 2 },
    
    darkness: { name:"ダークネス", type:"attack", element:ELEM.DARK, target:"all", power:45, stat:"int", cost:12, desc:"敵全体を闇で包み込む", learnCost: 3 },
    judgment: { name:"ジャッジメント", type:"attack", element:ELEM.LIGHT, target:"all", power:50, stat:"int", cost:18, desc:"敵全体に神の裁きを下す", learnCost: 4 }, // 強力
    
    // 奥義クラス Cost: 5
    meteor: { name:"メテオ", type:"attack", element:ELEM.NONE, target:"all", power:90, stat:"int", cost:25, desc:"敵全体に隕石を落とす", learnCost: 5 },
    bigBang: { name:"ビッグバン", type:"attack", element:ELEM.NONE, target:"all", power:120, stat:"int", cost:40, desc:"全てを無に帰す大爆発", learnCost: 5 },

    // --- 回復・補助魔法 ---
    heal: { name:"ヒール", type:"heal", target:"single", power:35, stat:"pie", cost:3, desc:"味方一人のHPを回復", learnCost: 1 },
    highHeal: { name:"ハイヒール", type:"heal", target:"single", power:100, stat:"pie", cost:8, desc:"味方一人のHPを大回復", learnCost: 2 },
    fullHeal: { name:"フルヒール", type:"heal", target:"single", power:999, stat:"pie", cost:14, desc:"味方一人のHPを全回復", learnCost: 4 },
    healall: { name:"ヒールオール", type:"heal", target:"all", power:25, stat:"pie", cost:10, desc:"味方全体のHPを回復", learnCost: 3 },
    omegaHeal: { name:"オメガヒール", type:"heal", target:"all", power:80, stat:"pie", cost:22, desc:"味方全体のHPを大回復", learnCost: 5 },

    raise: { name:"レイズ", type:"revive", target:"single", power:0, stat:"pie", cost:10, desc:"戦闘不能をHP半分で復活", learnCost: 3 },
    escape: { name:"エスケープ", type:"util", target:"self", cost:1, desc:"ダンジョンから脱出する", learnCost: 1 },

    // --- 状態異常治療 --- Cost: 1~2
    cure: { name:"キュア", type:"cure", target:"single", effect:"poison", cost:4, desc:"毒を治療する", learnCost: 1 },
    refresh: { name:"リフレッシュ", type:"cure", target:"single", effect:"paralyze", cost:6, desc:"麻痺を治療する", learnCost: 1 },
    awaken: { name:"アウェイク", type:"cure", target:"single", effect:"sleep", cost:4, desc:"睡眠から目覚めさせる", learnCost: 1 },
    sanity: { name:"サニティ", type:"cure", target:"single", effect:"confuse", cost:5, desc:"混乱を治療する", learnCost: 1 },

    // --- 状態異常付与 (デバフ) --- Cost: 2~3
    sleep: { name:"スリープ", type:"enfeeble", element:ELEM.DARK, target:"single", status:STATUS.SLEEP, rate:0.7, cost:5, desc:"敵単体を眠らせる", learnCost: 2 },
    panic: { name:"パニック", type:"enfeeble", element:ELEM.DARK, target:"all", status:STATUS.CONFUSE, rate:0.5, cost:8, desc:"敵全体を混乱させる", learnCost: 3 },

    // --- バフ・特殊スキル --- (有能な技なのでコスト高め)
    buffDef: { name:"プロテクト", type:"buff", target:"single", effect:"defUp", turns:6, cost:5, desc:"味方の防御力を上げる", learnCost: 2 },
    buffAtk: { name:"バイキルト", type:"buff", target:"single", effect:"atkUp", turns:6, cost:6, desc:"味方の攻撃力を上げる", learnCost: 3 },

    magicShield: { name:"Mシールド", type:"buff", target:"all", effect:"magicShield", turns:2, cost:8, desc:"2Tの間、味方全体の被ダメージを軽減", learnCost: 3 },
    berserk: { name:"バーサーク", type:"buff", target:"self", effect:"berserk", turns:3, cost:0, desc:"防御を捨てて攻撃力を大幅UP(3T)", learnCost: 3 },
    omakase: { name:"魔力覚醒", type:"buff", target:"self", effect:"magicBoost", turns:3, cost:5, desc:"3Tの間魔法威力激増だが消費2倍", learnCost: 3 },
    charge: { name:"チャージ", type:"buff", target:"self", effect:"charge", turns:1, cost:0, desc:"力を溜めて次の技の威力を3倍にする", learnCost: 3 },
    stance: { name:"心眼の構え", type:"buff", target:"self", effect:"stance", turns:4, cost:4, desc:"4Tの間クリティカル率大幅UP", learnCost: 3 },
    bunshin: { name:"分身の術", type:"buff", target:"self", effect:"bunshin", val:3, cost:10, desc:"3回まで全ての攻撃を無効化する", learnCost: 4 },

    // --- 物理スキル (特技) ---
    slash: { name:"強斬り", type:"phys", element:ELEM.NONE, target:"single", mult:1.5, cost:3, desc:"単体に強烈な斬撃", learnCost: 1 },
    double: { name:"二段斬り", type:"phys", element:ELEM.NONE, target:"single", mult:2.2, cost:5, desc:"単体に2回連続攻撃", learnCost: 2 },
    cross: { name:"十字斬り", type:"phys", element:ELEM.NONE, target:"single", mult:2.0, cost:4, desc:"単体に十字の斬撃", learnCost: 2 },
    chargeAttack: { name:"全身全霊", type:"phys", element:ELEM.NONE, target:"single", mult:3.0, cost:8, desc:"単体に渾身の一撃", learnCost: 4 },
    
    // --- 物理範囲スキル ---
    sweep: { name:"なぎ払い", type:"phys", element:ELEM.NONE, target:"all", mult:0.7, cost:4, desc:"敵全体を攻撃", learnCost: 2 },
    spin: { name:"回転斬り", type:"phys", element:ELEM.NONE, target:"all", mult:1.0, cost:8, desc:"敵全体を強く攻撃", learnCost: 3 },
    landCrash: { name:"大地砕き", type:"phys", element:ELEM.EARTH, target:"all", mult:1.4, cost:12, desc:"敵全体に土属性攻撃", learnCost: 4 },
    gigaSlash: { name:"ギガブレイク", type:"phys", element:ELEM.LIGHT, target:"all", mult:1.8, cost:15, desc:"究極の必殺剣", learnCost: 5 },

    provoke: { name:"挑発", type:"skill_provoke", element:ELEM.NONE, target:"single", cost:5, turns:5, desc:"敵を挑発し、自分を狙わせる(5ターン)", learnCost: 1 },

    // --- 盗賊スキル ---
    mug: { name:"強奪", type:"phys", element:ELEM.NONE, target:"single", mult:1.2, cost:3, desc:"小ダメージ＋金を盗む(未実装)", learnCost: 1 },
    sandThrow: { name:"砂かけ", type:"enfeeble", element:ELEM.EARTH, target:"single", status:STATUS.STUN, rate:0.6, cost:4, desc:"目潰しして敵を気絶させる", learnCost: 2 },
    poisonEdge: { name:"ポイズンエッジ", type:"phys", element:ELEM.NONE, target:"single", mult:1.3, cost:5, desc:"毒の刃で攻撃する", effect:"poison", rate:0.8, learnCost: 2 },
    shadowBind: { name:"影縫い", type:"enfeeble", element:ELEM.DARK, target:"single", status:STATUS.PARALYZE, rate:0.7, cost:6, desc:"影を縫い留めて麻痺させる", learnCost: 3 },
    assassinDagger: { name:"急所突き", type:"phys", element:ELEM.NONE, target:"single", mult:1.4, cost:8, desc:"確率で即死(未実装のため大麻痺)", effect:"paralyze", rate:0.5, learnCost: 4 },

    // --- 弓使いスキル ---
    powerShot: { name:"パワーショット", type:"phys", element:ELEM.NONE, target:"single", mult:1.8, cost:4, desc:"強力な矢を放つ", learnCost: 2 },
    rapidFire: { name:"五月雨撃ち", type:"phys", element:ELEM.NONE, target:"single", mult:2.8, cost:8, desc:"目にも留まらぬ連射攻撃", learnCost: 3 },
    snipe: { name:"スナイプ", type:"phys", element:ELEM.NONE, target:"single", mult:3.5, cost:12, desc:"急所を狙い澄ました一撃", learnCost: 4 },
    meteorRain: { name:"メテオレイン", type:"phys", element:ELEM.FIRE, target:"all", mult:2.0, cost:20, desc:"炎の矢を雨のように降らせる", learnCost: 4 },
    heavenArrow: { name:"天穿つ矢", type:"phys", element:ELEM.LIGHT, target:"single", mult:5.0, cost:25, desc:"天をも穿つ究極の矢", learnCost: 5 },

    // --- 侍スキル ---
    iai: { name:"居合", type:"phys", element:ELEM.NONE, target:"all", mult:0.9, cost:4, desc:"敵全体を素早く斬る", learnCost: 1 },
    tsubame: { name:"燕返し", type:"phys", element:ELEM.NONE, target:"single", mult:2.5, cost:6, desc:"回避不能の二連撃", learnCost: 3 },
    moonSlash: { name:"残月", type:"phys", element:ELEM.DARK, target:"all", mult:1.5, cost:10, desc:"敵全体を闇の斬撃で払う", learnCost: 3 },
    cherryBlossom: { name:"桜花繚乱", type:"phys", element:ELEM.NONE, target:"all", mult:2.2, cost:18, desc:"敵全体を美しく散らす奥義", learnCost: 5 },

    // --- 忍者スキル ---
    shuriken: { name:"手裏剣", type:"phys", element:ELEM.NONE, target:"single", mult:1.2, cost:2, desc:"牽制の一撃", learnCost: 1 },
    assassinate: { name:"暗殺剣", type:"phys", element:ELEM.DARK, target:"single", mult:3.0, cost:12, desc:"闇に紛れて致命傷を与える", learnCost: 3 },
    katon: { name:"火遁の術", type:"attack", element:ELEM.FIRE, target:"all", power:40, stat:"int", cost:10, desc:"火薬玉で敵全体を攻撃", learnCost: 2 },
    suiton: { name:"水遁の術", type:"attack", element:ELEM.WATER, target:"all", power:40, stat:"int", cost:10, desc:"大波で敵全体を攻撃", learnCost: 2 },
    doton: { name:"土遁の術", type:"attack", element:ELEM.EARTH, target:"all", power:40, stat:"int", cost:10, desc:"地震を起こして敵全体を攻撃", learnCost: 2 },
    futon: { name:"風遁の術", type:"attack", element:ELEM.WIND, target:"all", power:40, stat:"int", cost:10, desc:"カマイタチで敵全体を攻撃", learnCost: 2 }
};

const jobData = {
    hero: { 
        name: "勇者", icon: "👑", 
        baseStats: { str:8, int:6, pie:6, vit:8, agi:6, luc:6 }, 
        canEquip: ['sword','spear','heavyShield','lightShield','armor','clothes','helm','hat','gauntlet','gloves','acc'], 
        desc:"バランス型。物理・回復・魔法をバランスよく習得可能。" 
    },
    warrior: { 
        name: "戦士", icon: "⚔️", 
        baseStats: { str:10, int:3, pie:3, vit:10, agi:5, luc:5 }, 
        canEquip: ['sword','axe','mace','spear','heavyShield','lightShield','armor','clothes','helm','hat','gauntlet','gloves','acc'], 
        desc:"前衛の要。強力な物理特技とバフを習得する。" 
    },
    mage: { 
        name: "魔法使い", icon: "🪄", 
        baseStats: { str:4, int:10, pie:5, vit:5, agi:7, luc:6 }, 
        canEquip: ['staff','clothes','hat','gloves','lightShield','acc'], 
        desc:"4属性と闇の魔法を操る。広範囲殲滅が得意。" 
    },
    priest: { 
        name: "僧侶", icon: "✝️", 
        baseStats: { str:5, int:5, pie:10, vit:6, agi:5, luc:6 }, 
        canEquip: ['spear','mace','staff','lightShield','clothes','hat','gloves','acc'], 
        desc:"回復のエキスパート。光魔法やバフも使える。" 
    },
    thief: { 
        name: "盗賊", icon: "💰", 
        baseStats: { str:5, int:4, pie:3, vit:5, agi:10, luc:10 }, 
        canEquip: ['dagger','lightShield','clothes','hat','gloves','acc'], 
        desc:"状態異常攻撃が得意なトリックスター。" 
    },
    archer: { 
        name: "弓使い", icon: "🏹", 
        baseStats: { str:9, int:4, pie:4, vit:5, agi:8, luc:8 }, 
        canEquip: ['bow','clothes','hat','gloves','acc'], 
        desc:"単体物理火力が高い。様々な矢技を習得する。" 
    },
    sage: { 
        name: "賢者", icon: "📜", 
        baseStats: { str:4, int:8, pie:8, vit:5, agi:5, luc:5 }, 
        canEquip: ['staff','lightShield','clothes','hat','gloves','acc'], 
        desc:"全属性の魔法と回復魔法を極める上級職。" 
    },
    samurai: { 
        name: "侍", icon: "👺", 
        baseStats: { str:9, int:5, pie:5, vit:7, agi:8, luc:4 }, 
        canEquip: ['katana','heavyShield','lightShield','armor','helm','gauntlet','acc'], 
        desc:"強力な刀技と全体攻撃を持つ剣士。" 
    },
    ninja: { 
        name: "忍者", icon: "🥷", 
        baseStats: { str:7, int:7, pie:3, vit:5, agi:9, luc:6 }, 
        canEquip: ['dagger','kunai','clothes','hat','gloves','acc'], 
        desc:"忍術(全体魔法)と暗殺技を操る。" 
    },
};

const skillTreeData = {
    hero: [
        // 1. 強斬りルート
        { id: 'slash', req: null, children: [
            { id: 'cross', req: 1, children: [
                { id: 'spin', req: 1, children: [
                    { id: 'gigaSlash', req: 1 }
                ]}
            ]}
        ]},
        // 2. 挑発ルート
        { id: 'provoke', req: null, children: [
            { id: 'magicShield', req: 1 }
        ]},
        // 3～6. 4属性魔法 -> コンプで光全体
        { id: 'fire', req: null },
        { id: 'water', req: null },
        { id: 'earth', req: null },
        { id: 'wind', req: null },
        { id: 'judgment', req: 'hero_elem_comp' }, // 4属性習得が条件
        
        // 7. 回復ルート
        { id: 'heal', req: null, children: [
            { id: 'healall', req: 1 }
        ]}
    ],
    warrior: [
        // 1. 強斬りからの分岐
        { id: 'slash', req: null, children: [
            { id: 'double', req: 1, children: [
                { id: 'chargeAttack', req: 1 } // 全身全霊
            ]},
            { id: 'sweep', req: 1, children: [
                { id: 'landCrash', req: 1 } // 大地砕き
            ]}
        ]},
        // 2. 独立: バーサーク
        { id: 'berserk', req: null }
    ],
    mage: [
        // 1～4. 属性単体 -> 全体
        { id: 'fire', req: null, children: [ { id: 'inferno', req: 1 } ] },
        { id: 'water', req: null, children: [ { id: 'cocytus', req: 1 } ] },
        { id: 'earth', req: null, children: [ { id: 'quake', req: 1 } ] },
        { id: 'wind', req: null, children: [ { id: 'storm', req: 1 } ] },
        
        // 5. 闇 -> 闇全体 -> 無属性(メテオ) / デバフ(Sleep) -> 魔力覚醒(Omakase)
        { id: 'dark', req: null, children: [
            { id: 'darkness', req: 1, children: [ { id: 'meteor', req: 1 } ] },
            { id: 'sleep', req: 1, children: [ { id: 'omakase', req: 1 } ] }
        ]},
        // 6. エスケープ
        { id: 'escape', req: null }
    ],
    priest: [
        // 1. ヒールからの多岐分岐
        { id: 'heal', req: null, children: [
            { id: 'highHeal', req: 1, children: [ { id: 'fullHeal', req: 1 } ] },
            { id: 'healall', req: 1, children: [ { id: 'omegaHeal', req: 1 } ] },
            // 状態異常回復チェーン (毒->麻痺->眠り->混乱)
            { id: 'cure', req: 1, children: [ 
                { id: 'refresh', req: 1, children: [ 
                    { id: 'awaken', req: 1, children: [
                        { id: 'sanity', req: 1 }
                    ]} 
                ]} 
            ]},
            // 補助 -> 蘇生
            { id: 'buffDef', req: 1, children: [ { id: 'raise', req: 1 } ] }
        ]},
        // 2. 光攻撃
        { id: 'light', req: null, children: [ { id: 'judgment', req: 1 } ] }
    ],
    thief: [
        // 1. 強奪からの並列派生
        { id: 'mug', req: null, children: [
            { id: 'assassinDagger', req: 1 }, // 急所突き
            { id: 'poisonEdge', req: 1 },     // 状態異常攻撃1
            { id: 'sandThrow', req: 1 },      // 状態異常攻撃2
            { id: 'shadowBind', req: 1 },     // 状態異常攻撃3
            { id: 'panic', req: 1 }           // 状態異常攻撃4
        ]}
    ],
    archer: [
        // 1. チャージ起点
        { id: 'charge', req: null, children: [
            { id: 'powerShot', req: 1, children: [
                { id: 'rapidFire', req: 1, children: [
                    { id: 'snipe', req: 1, children: [
                        { id: 'heavenArrow', req: 1 }
                    ]}
                ]},
                { id: 'meteorRain', req: 1 } // パワーショットから分岐
            ]}
        ]}
    ],
    sage: [
        // 1～4. 全体 -> 単体 (魔法使いの逆)
        { id: 'inferno', req: null, children: [ { id: 'fire', req: 1 } ] },
        { id: 'cocytus', req: null, children: [ { id: 'water', req: 1 } ] },
        { id: 'quake', req: null, children: [ { id: 'earth', req: 1 } ] },
        { id: 'storm', req: null, children: [ { id: 'wind', req: 1 } ] },
        // 5. 闇全体
        { id: 'darkness', req: null },
        // 6. 光全体
        { id: 'judgment', req: null },
        // 7. 単体回復 -> 全体回復
        { id: 'heal', req: null, children: [ { id: 'healall', req: 1 } ] },
        // 8. バイキルト
        { id: 'buffAtk', req: null },
        // 9. ビッグバン (全体魔法6種習得で開放)
        { id: 'bigBang', req: 'sage_all_comp' }
    ],
    samurai: [
        // 1. 居合ルート
        { id: 'iai', req: null, children: [
            { id: 'tsubame', req: 1 },
            { id: 'moonSlash', req: 1, children: [ { id: 'cherryBlossom', req: 1 } ] }
        ]},
        // 2. 挑発 -> 構え
        { id: 'provoke', req: null, children: [ { id: 'stance', req: 1 } ] }
    ],
    ninja: [
        // 1. 単体攻撃
        { id: 'shuriken', req: null, children: [ { id: 'assassinate', req: 1 } ] },
        // 2. 火遁 -> 風遁
        { id: 'katon', req: null, children: [ { id: 'futon', req: 1 } ] },
        // 3. 水遁 -> 土遁
        { id: 'suiton', req: null, children: [ { id: 'doton', req: 1 } ] },
        // 4. 分身
        { id: 'bunshin', req: null }
    ]
};