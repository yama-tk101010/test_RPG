// ==========================================
//  ダンジョン・モンスターデータ
// ==========================================

const dungeonData = {
    1: { 
        name: "地下迷宮", // 推奨Lv1~3
        theme: { ceil: "#0a0a0a", floor: "#1a1a1a", wallBaseRGB: [140, 130, 120], type: 'brick' },
        enemies: [
            {name:"スライム", hp:12, exp:8888, gold:15, img:"slime.png", elem:ELEM.WATER, agi:4, luc:5, atk:12, resist:{}, actions:["attack"]},
            {name:"ゴブリン", hp:16, exp:12, gold:22, img:"goblin.png", elem:ELEM.EARTH, agi:6, luc:10, atk:16, resist:{}, actions:["attack"]},
            {name:"オーク", hp:35, exp:20, gold:40, img:"orc.png", elem:ELEM.EARTH, agi:5, luc:8, atk:22, minFloor:2, resist:{stun:0.5}, actions:["attack"]}
        ],
        // ★修正: HPを少し下げ、ATK/DEFを固定値で設定
        boss: {
            name:"オークキング", 
            hp: 120, // 150 -> 120
            exp: 200, gold: 500, 
            img: "OrcKing.png", elem: ELEM.EARTH, 
            agi: 8, luc: 20, 
            atk: 35, // 計算式だと64になるのを抑制
            def: 6,  // 明示的に設定
            resist:{poison:0.2}, 
            actions:["attack","charge"]
        }
    },
    2: { 
        name: "迷いの森", // 推奨Lv4~7
        theme: { ceil: "#051505", floor: "#1a2e1a", wallBaseRGB: [60, 160, 60], type: 'forest' },
        enemies: [
            {name:"キラービー", hp:35, exp:35, gold:55, img:"KillerBee.png", elem:ELEM.WIND, agi:15, luc:10, atk:35, resist:{pierce:1.5}, effect:"paralyze", rate:0.2, actions:["attack"]},
            {name:"人喰い花", hp:45, exp:45, gold:70, img:"ManEating.png", elem:ELEM.EARTH, agi:7, luc:5, atk:40, resist:{fire:1.5}, actions:["attack", "sleepPollen"]},
            {name:"シルフ", hp:40, exp:55, gold:85, img:"Sylph.png", elem:ELEM.WIND, agi:18, luc:15, atk:45, minFloor:2, resist:{earth:0.5}, actions:["attack", "wind"]}
        ],
        // ★修正: HP450は長いので400へ。ATKも55→45へ緩和。
        boss: {
            name:"トレント", 
            hp: 400, // 450 -> 400
            exp: 500, gold: 1500, 
            img: "treant.png", elem: ELEM.EARTH, 
            agi: 10, luc: 30, 
            atk: 45, // 55 -> 45
            def: 10, // 硬すぎないように設定
            resist:{fire:1.5}, // 弱点(火)はそのまま
            actions:["attack","poisonMist","paralyzeVine"]
        }
    },
    3: { 
        name: "海底洞窟", // 推奨Lv8~11
        theme: { ceil: "#000022", floor: "#001133", wallBaseRGB: [50, 100, 200], type: 'cave' },
        enemies: [
            {name:"キラーF", hp:70, exp:90, gold:130, img:"KillerFish.png", elem:ELEM.WATER, agi:20, luc:20, atk:70, resist:{}, effect:"critical", rate:0.1, actions:["attack"]}, 
            {name:"マーマン", hp:85, exp:110, gold:160, img:"Merman.png", elem:ELEM.WATER, agi:15, luc:15, atk:75, resist:{}, actions:["attack", "water"]},
            {name:"タートル", hp:120, exp:130, gold:200, img:"Turtle.png", elem:ELEM.WATER, agi:5, luc:15, atk:85, minFloor:2, highDef:true, resist:{phys:0.7}, actions:["attack"]}
        ],
        // ★修正: 全体攻撃(tsunami)が痛いのでATKを抑制。HPも1000→850へ。
        boss: {
            name:"クジラ", 
            hp: 850, // 1000 -> 850
            exp: 1500, gold: 3000, 
            img: "Whale.png", elem: ELEM.WATER, 
            agi: 15, luc: 40, 
            atk: 75, // 95 -> 75
            def: 18, 
            resist:{fire:0.5, thunder:1.5}, 
            actions:["attack","tsunami","aquaBreath"]
        }
    },
    4: { 
        name: "古代神殿", // 推奨Lv12~15
        theme: { ceil: "#1a1a10", floor: "#2a2a20", wallBaseRGB: [220, 200, 120], type: 'temple' },
        enemies: [
            {name:"スケルトン", hp:120, exp:200, gold:280, img:"skeleton.png", elem:ELEM.DARK, agi:18, luc:5, atk:110, resist:{blunt:1.5, slash:0.7}, actions:["attack"]},
            {name:"ゾンビ", hp:150, exp:220, gold:300, img:"zombie.png", elem:ELEM.DARK, agi:8, luc:5, atk:115, resist:{fire:1.5, pierce:0.8}, effect:"poison", rate:0.4, actions:["attack"]},
            {name:"ゴースト", hp:100, exp:250, gold:350, img:"ghost.png", elem:ELEM.DARK, agi:25, luc:20, atk:120, minFloor:2, resist:{phys:0.4, light:1.5}, actions:["attack", "confuseRay", "dark"]} 
        ],
        // ★修正: 2回攻撃(double)が脅威なのでATKを大幅調整。
        boss: {
            name:"グリフォン", 
            hp: 1500, // 1800 -> 1500
            exp: 3000, gold: 5000, 
            img: "griffin.png", elem: ELEM.WIND, 
            agi: 40, luc: 50, 
            atk: 100, // 140 -> 100
            def: 25, 
            resist:{earth:0}, 
            actions:["attack","storm","aeroBlast","double"]
        }
    },
    5: { 
        name: "天空の塔", // 推奨Lv16~
        theme: { ceil: "#001144", floor: "#333344", wallBaseRGB: [160, 170, 190], type: 'tower' },
        enemies: [
            {name:"リザードマン", hp:200, exp:350, gold:600, img:"Lizardman.png", elem:ELEM.EARTH, agi:30, luc:20, atk:160, resist:{slash:0.8}, actions:["attack", "double"]},
            {name:"精霊", hp:180, exp:400, gold:700, img:"Spirit.png", elem:ELEM.LIGHT, agi:50, luc:40, atk:170, resist:{phys:0.6}, actions:["attack", "light", "judgment", "healall"]},
            {name:"ダークエルフ", hp:220, exp:450, gold:900, img:"DarkElf.png", elem:ELEM.DARK, agi:45, luc:30, atk:180, minFloor:2, resist:{magic:0.5}, actions:["attack", "dark", "sleep", "meteor"]}
        ],
        // ★修正: ラスボス。HP3500は多すぎるので3000へ。
        boss: {
            name:"ドラゴン", 
            hp: 3000, // 3500 -> 3000
            exp: 0, gold: 0, 
            img: "dragon.png", elem: ELEM.FIRE, 
            agi: 35, luc: 60, 
            atk: 160, // 220 -> 160
            def: 40, 
            resist:{fire:0, status:0}, 
            actions:["attack","inferno","fireBreath","charge", "roar"]
        }
    }
};