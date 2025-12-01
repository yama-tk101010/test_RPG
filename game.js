// ==========================================
//  Yama RPG - Dungeon & Gimmick Update (Ver 4.3 Fixed)
// ==========================================


// --- ★新規ヘルパー関数: 呪文か特技かを判定 ---
// --- ★修正: 呪文か特技かを判定（provokeを追加） ---
function isPhysicalSkill(spell) {
    return spell.type === 'phys' || spell.type === 'skill_provoke';
}

let unlockedDoors = {};

let party = [
    { id: "p1", name: "アーサー", img: "Hero.png", jobId: "hero", level: 1, exp: 0, hp: 0, maxHp: 0, stats: {}, alive: true, status: "normal", spells: {}, buffs:{atk:0, def:0}, equips: { weapon:null, armor:null, shield:null, helm:null, acc:null } },
    // ★追加: 戦士ガストン (p4)
    { id: "p4", name: "ガストン", img: "Warrior.png", jobId: "warrior", level: 1, exp: 0, hp: 0, maxHp: 0, stats: {}, alive: true, status: "normal", spells: {}, buffs:{atk:0, def:0}, equips: { weapon:null, armor:null, shield:null, helm:null, acc:null } },
    { id: "p2", name: "エルヴィン", img: "Wizard.png", jobId: "mage", level: 1, exp: 0, hp: 0, maxHp: 0, stats: {}, alive: true, status: "normal", spells: {}, buffs:{atk:0, def:0}, equips: { weapon:null, armor:null, shield:null, helm:null, acc:null } },
    { id: "p3", name: "エレナ", img: "Priest.png", jobId: "priest", level: 1, exp: 0, hp: 0, maxHp: 0, stats: {}, alive: true, status: "normal", spells: {}, buffs:{atk:0, def:0}, equips: { weapon:null, armor:null, shield:null, helm:null, acc:null } }
];

let partyInventory = [], partyGold = 100, openedChests = [];
let playerPos = { x: 1, y: 1, dir: 0 };
let currentDungeonId = 1;
let currentFloor = 1;
let currentMapData = [];
let visitedMaps = {}; 
let dungeonShopActive = false;

let enemies = []; 

let autoMoveTimer = null;

let isBattle = false, activeMemberIndex = 0, actionQueue = [], ctx = null, battleSpellMode = null, menuReturnTo = 'town', templeTargetIndex = -1, selectedJobId = "", bonusPoints = 0, tempStatAlloc = {};

let clearedDungeons = [];

// ★追加: 戦闘開始直後の入力ロックフラグ
let isBattleInputBlocked = false;

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

// デバッグ機能: 全ダンジョン・全フロアのマップを「踏破済み」にする
for (let d = 1; d <= 5; d++) {
    // データが存在するか確認
    if (visitedMaps[d]) {
        for (let f = 1; f <= 3; f++) {
            if (visitedMaps[d][f]) {
                // 20x20の全マスを true (訪問済み) に書き換え
                for (let y = 0; y < 20; y++) {
                    for (let x = 0; x < 20; x++) {
                        visitedMaps[d][f][y][x] = true;
                    }
                }
            }
        }
    }
}

// もしダンジョン画面にいれば、即座に画面を更新して反映
if (document.getElementById('dungeon-scene').style.display === 'flex') {
    updateDungeonUI(); // ミニマップ更新
    
    // 拡大マップを開いている場合も更新
    if (document.getElementById('large-map-overlay').style.display === 'flex') {
        renderLargeMap();
    }
}

};

// --- ヘルパー: ツリー投資状況から呪文リストを更新 ---
function updateSpellsFromTree(p) {
    p.spells = {}; // 一旦リセット
    if (!p.investedSkills) p.investedSkills = {};

    for (let skillId in p.investedSkills) {
        const pts = p.investedSkills[skillId];
        if (pts > 0 && spellData[skillId]) {
            // ★変更: 初期回数3 + (ポイント-1)*1
            // ポイント1(習得時) -> 3回
            // ポイント2(強化1) -> 4回
            // ポイント3(強化2) -> 5回
            const maxUses = 3 + (pts - 1) * 1;
            
            p.spells[skillId] = {
                ...spellData[skillId],
                max: maxUses,
                current: maxUses // 習得・強化時は全快
            };
        }
    }
}

function initCharacter(p) {
    const j = jobData[p.jobId];
    p.stats = {...j.baseStats};
    
    // スキル関連の初期化
    p.skillPoints = 10; // Lv1なら1ポイント所持
    p.investedSkills = {};   // 習得状況 { skillId: points }
    
    updateSpellsFromTree(p);
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
    
    // ★修正: HP計算式を変更 (Lv20未振りで200, 特化で400程度になるように)
    // 旧: Vit*3 + Lv*2 + 20
    // 新: Vit*4 + Lv*6 + 40
    p.maxHp = Math.floor((p.stats.vit * 4) + (p.level * 6) + 40);

    p.atk = p.stats.str; 
    p.def = Math.floor(p.stats.agi / 2); 

    // 装備補正の加算
    for(let s in p.equips){ 
        const equipObj = p.equips[s]; 
        if(equipObj){ 
            const i = itemData[equipObj.itemId]; 
            // 基本性能
            if(i.power) p.atk += i.power; 
            if(i.ac) p.def += i.ac; 
            
            // ランダム効果の加算
            if(equipObj.bonus) {
                if(equipObj.bonus.str) p.atk += equipObj.bonus.str; 
                // HPボーナスも少し強化してもいいですが、計算式変更で十分増えるのでそのままでOK
                if(equipObj.bonus.hp) p.maxHp += equipObj.bonus.hp;
                if(equipObj.bonus.def) p.def += equipObj.bonus.def;
                if(equipObj.bonus.agi) p.def += Math.floor(equipObj.bonus.agi / 2);
                if(equipObj.bonus.vit) p.maxHp += Math.floor(equipObj.bonus.vit * 4); // ★ここもVit係数に合わせて *3 -> *4 にしておくと自然です
            }
        } 
    } 
    // HPが減ったときの整合性
    if(p.hp > p.maxHp) p.hp = p.maxHp;
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

function movePlayer(t) {
    stopAutoWalk();
    closeLargeMap(); // ★追加: 移動しようとしたらマップを閉じる
    
    if(isBattle) return;
    let dx=0, dy=0, d=playerPos.dir;
    // ... (以下、既存のコードのまま)
    if(t==='forward'){if(d===0)dy=-1;if(d===1)dx=1;if(d===2)dy=1;if(d===3)dx=-1;} 
    else {if(d===0)dy=1;if(d===1)dx=-1;if(d===2)dy=-1;if(d===3)dx=1;} 
    executeMove(dx,dy);
}
function turnPlayer(d) {
    stopAutoWalk();
    closeLargeMap(); // ★追加: 向きを変えようとしたらマップを閉じる
    
    if(isBattle) return;
    if(d==='left')playerPos.dir=(playerPos.dir+3)%4; 
    if(d==='right')playerPos.dir=(playerPos.dir+1)%4; 
    updateDungeonUI();
}

// ★新規追加: 開閉を切り替える関数
function toggleLargeMap() {
    const overlay = document.getElementById('large-map-overlay');
    // すでに表示されている(flex)なら閉じる、そうでなければ開く
    if (overlay.style.display === 'flex') {
        closeLargeMap();
    } else {
        openLargeMap();
    }
}

function executeMove(dx, dy) { 
    // 1. 移動先の座標を計算 (ここが消えていました)
    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;

    // 2. マップ範囲外なら移動しない
    if (nx < 0 || nx >= mapSize || ny < 0 || ny >= mapSize) {
        return;
    }

    // 3. 壁(TILE.WALL = 1)なら移動しない
    // ※ currentMapData は loadDungeonMap でセットされている前提
    if (currentMapData[ny][nx] === TILE.WALL) {
        return; 
    }

const targetTile = currentMapData[ny][nx];

    if (targetTile === TILE.LOCKED_DOOR) {
        // キーの生成 (例: "1_1_10_5")
        const key = `${currentDungeonId}_${currentFloor}_${nx}_${ny}`;
        
        // まだ開いていない場合
        if (!unlockedDoors[key]) {
            log("堅く閉ざされた扉がある。鍵がかかっているようだ。");
            return; // 移動キャンセル
        } else {
            log("鍵は開いている。扉を通った。");
        }
    }

    // ★追加: 通常扉のメッセージ
    if (targetTile === TILE.DOOR) {
        log("扉を開けて進んだ。");
    }
    // 4. 移動確定
    playerPos.x = nx; 
    playerPos.y = ny; 

const newTile = currentMapData[ny][nx];
    if (newTile === TILE.STAIRS) log("階段がある。");
    else if (newTile === TILE.UP_STAIRS) log("階段がある。");
    else if (newTile === TILE.EXIT) log("出口がある。街へ戻れそうだ。");
    
    // 視界やUIの更新
    checkObject(); 
    updatePlayerVision(); 
    updateDungeonUI(); 
    
    // ★毒ダメージ処理
    let poisonMsg = false;
    party.forEach(p => { 
        if(p.status === STATUS.POISON && p.alive) { 
            // マップ移動では最大HPの2%ダメージ
            const dmg = Math.max(1, Math.floor(p.maxHp * 0.02));
            p.hp -= dmg; 
            if(p.hp <= 0) { 
                p.hp = 0; 
                p.alive = false; 
                p.status = STATUS.DEAD; 
                log(`${p.name}は毒で倒れた...`); 
            }
            poisonMsg = true;
        } 
    }); 
    
    if(poisonMsg) {
        updateDungeonUI();
        if(party.every(p => !p.alive || p.status === STATUS.STONE)) {
            log("全滅しました...");
            setTimeout(() => returnToTown(true), 1000);
            return;
        }
    }

    // 5. イベント・ギミック判定 (移動先のタイルの情報を取得して渡す)
    const tile = currentMapData[ny][nx];
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
        //let rate = 0.12;
        //if(currentFloor === 2) rate = 0.15;
        //if(currentFloor === 3) rate = 0.20; // 3Fもエンカウントありに変更

let rate = 0.05; //デバッグ
        if(Math.random() < rate) startBattle(); 
    }
}

function checkObject() { 
    const tile = currentMapData[playerPos.y][playerPos.x];
    const btn = document.getElementById('btn-return'); // 右下のボタン枠を利用
    
    // いったんリセット
    btn.style.display = 'none';
    btn.onclick = null;
    
    // タイルごとの分岐
    if (tile === TILE.EXIT) {
        // 出口の場合
        btn.style.display = 'flex';
        btn.innerHTML = "🏠 街へ戻る";
        btn.style.color = "#ff0"; // 黄色
        btn.onclick = function() { returnToTown(); };
        
    } else if (tile === TILE.STAIRS) {
        // 下り階段 (ID: 2)
        btn.style.display = 'flex';
        btn.innerHTML = "🪜 移動する";
        btn.style.color = "#0ff"; // 水色
        btn.onclick = function() { checkArea(); }; // checkAreaの処理を実行
        
    } else if (tile === TILE.UP_STAIRS) {
        // 上り階段 (ID: 10)
        btn.style.display = 'flex';
        btn.innerHTML = "🪜 移動する";
        btn.style.color = "#0ff"; // 水色
        btn.onclick = function() { checkArea(); };
    }
}

function checkArea() { 
    if(isBattle)return; 

// ★修正: x と y を定義します
    const x = playerPos.x;
    const y = playerPos.y;
    const v = currentMapData[y][x];

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
    } else if (v === TILE.SWITCH) {
        const switchKey = `${currentDungeonId}_${currentFloor}_${x}_${y}`;
        const gim = gimmickData[switchKey];
        
        if (gim && gim.type === 'unlock') {
            const targetKey = gim.targetKey; // 対象となる扉のキー
            
            if (!unlockedDoors[targetKey]) {
                unlockedDoors[targetKey] = true; // 開錠フラグを立てる
                log("スイッチを押した。「ガゴゴ……」遠くで扉が開く音がした！");
                
                // UI更新 (ミニマップ上の色などが変わるように)
                updateDungeonUI();
            } else {
                log("スイッチは既に押されている。");
            }
        } else {
            log("壊れたスイッチのようだ。反応がない。");
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
// game.js の openWorldMap 関数を書き換え

function openWorldMap() { 
    // 最新のクリア状況を取得するなどの処理があればここに記述
     clearedDungeons = [1,2,3,4,5]; // デバッグ用（必要に応じて解除）

    document.getElementById('town-scene').style.display = 'none'; 
    document.getElementById('world-map-scene').style.display = 'flex'; 

    const list = document.getElementById('world-map-list');
    
    // クラスを上書きしてグリッドレイアウトを適用
    list.className = 'dungeon-list-grid'; 
    list.innerHTML = '';

    // ダンジョンリスト定義
    // styleColor: カードの左線の色
    const dungeons = [
        {id: 1,  realId: 1, label: "地下迷宮", icon: "🏰", styleColor: "#aaa", unlockId: 0, pos: {x:50, y:110}},
        {id: 10, realId: 2, label: "迷いの森", icon: "🌲", styleColor: "#5f5", unlockId: 1, pos: {x:100, y:80}},
        {id: 20, realId: 3, label: "海底洞窟", icon: "🌊", styleColor: "#55f", unlockId: 2, pos: {x:220, y:120}},
        {id: 30, realId: 4, label: "古代神殿", icon: "🏛️", styleColor: "#da4", unlockId: 3, pos: {x:250, y:50}},
        {id: 40, realId: 5, label: "天空の塔", icon: "🗼", styleColor: "#a4d", unlockId: 4, pos: {x:150, y:30}}
    ];

    // 地図の描画 (既存の関数を使用)
    drawWorldMapVisual(dungeons);

    dungeons.forEach(d => {
        // 開放条件チェック
        const isUnlocked = (d.unlockId === 0) || clearedDungeons.includes(d.unlockId);

        if (isUnlocked) {
            // クリア済み判定
            const isCleared = clearedDungeons.includes(d.realId);
            
            // ダンジョンデータから詳細を取得（推奨レベルなどがあれば表示可能）
            // const dData = dungeonData[d.realId]; 

            // バッジHTML生成
            let badgeHtml = "";
            let borderColor = d.styleColor; // デフォルト色

            if(isCleared) {
                badgeHtml = `<div class="dungeon-status-badge badge-clear">★ CLEAR</div>`;
                borderColor = "#ffd700"; // クリア済みは金色枠に上書き
            } else {
                badgeHtml = `<div class="dungeon-status-badge badge-new">NEW!</div>`;
            }

            // カードボタン生成
            const btn = document.createElement('button');
            btn.className = "btn dungeon-card-btn";
            btn.style.borderLeftColor = borderColor; // アクセントカラー適用
            btn.onclick = () => goToDungeon(d.id);
            
            btn.innerHTML = `
                <div class="dungeon-info-group">
                    <div class="dungeon-label">${d.icon} ${d.label}</div>
                    <div class="dungeon-sub-label">Area ${d.realId}</div>
                </div>
                ${badgeHtml}
                <div class="dungeon-card-bg-icon">${d.icon}</div>
            `;
            
            list.appendChild(btn);
        }
    });
}
// ★新規追加: ビジュアルマップを描画する関数
function drawWorldMapVisual(dungeons) {
    const cv = document.getElementById('world-map-canvas');
    if(!cv) return;
    const ctx = cv.getContext('2d');
    
    // 背景（海と陸地を簡易的に描画）
    ctx.fillStyle = "#204060"; // 海
    ctx.fillRect(0, 0, 300, 150);
    
    // 大陸っぽい形（簡易）
    ctx.fillStyle = "#3a5a3a"; // 緑の大地
    ctx.beginPath();
    ctx.moveTo(20, 150);
    ctx.bezierCurveTo(50, 50, 150, 20, 280, 40);
    ctx.lineTo(300, 150);
    ctx.fill();

    // 経路（ライン）を描画
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#666"; // 未開放の道
    
    dungeons.forEach((d, i) => {
        if (i === 0) return;
        const prev = dungeons[i-1];
        
        // 道が開放されているか（前のダンジョンをクリアしているか）
        const pathOpened = clearedDungeons.includes(prev.realId);
        
        ctx.beginPath();
        ctx.moveTo(prev.pos.x, prev.pos.y);
        ctx.lineTo(d.pos.x, d.pos.y);
        
        if (pathOpened) {
            ctx.strokeStyle = "#ffd700"; // 開放済みは金色
            ctx.setLineDash([]);
        } else {
            ctx.strokeStyle = "#444"; // 未開放は暗い色
            ctx.setLineDash([5, 5]); // 点線
        }
        ctx.stroke();
    });
    ctx.setLineDash([]);

    // 各ダンジョンのポイントを描画
    dungeons.forEach(d => {
        const isUnlocked = (d.unlockId === 0) || clearedDungeons.includes(d.unlockId);
        const isCleared = clearedDungeons.includes(d.realId);

        const x = d.pos.x;
        const y = d.pos.y;

        // まだ出現していないダンジョンは描画しない（あるいは薄く表示）
        if (!isUnlocked) return;

        // ポイントの円
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI*2);
        
        if (isCleared) {
            ctx.fillStyle = "#ffd700"; // クリア済み: 金
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ffd700";
        } else {
            ctx.fillStyle = "#ff5555"; // 挑戦可能: 赤
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ff0000";
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // 枠線
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();

        // アイコン（文字）
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // 絵文字の先頭文字だけ取得して表示
        const iconChar = d.label.split(" ")[0]; 
        ctx.fillText(iconChar, x, y - 15);
    });
}

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

// game.js

function updateDungeonUI() {
    if(!isBattle) draw3D(); 
    renderMap();
    document.getElementById('c-dir').innerText=["北","東","南","西"][playerPos.dir];
    document.getElementById('c-x').innerText=playerPos.x; 
    document.getElementById('c-y').innerText=playerPos.y;

    // ★修正: mapの第2引数(i)を受け取り、現在ターンのキャラを判定
    document.getElementById('dungeon-party-status').innerHTML = party.map((p, i) => {
        let clr = p.hp < p.maxHp*0.3 ? '#ff5555' : '#fff'; 
        if(!p.alive) clr = '#888';
        
        let statusIcon = "";
        if(!p.alive) statusIcon = "🪦";
        else if(p.status === 'poison') statusIcon = "<span style='color:#d0d;'>☠️</span>";
        else if(p.status === 'paralyze') statusIcon = "<span style='color:#dd0;'>⚡</span>";
        else if(p.status === 'sleep') statusIcon = "<span style='color:#88f;'>💤</span>"; // 追加しても良い
        else if(p.status === 'confuse') statusIcon = "<span style='color:#f80;'>💫</span>"; // 追加しても良い
        else if(p.status === 'stone') statusIcon = "<span style='color:#888;'>🗿</span>"; // 追加しても良い

        // ★追加: 戦闘中 かつ 現在の入力者ならクラスを付与
        // (実行フェーズ中は highlight しないように activeMemberIndex < party.length もチェックすると自然です)
        const isMyTurn = isBattle && (i === activeMemberIndex) && (actionQueue.length <= i);
        const activeClass = isMyTurn ? " active-turn" : "";

        return `<div class="ps-row${activeClass}"><div><span class="job-badge-sm">${jobData[p.jobId].name.charAt(0)}</span><span style="font-size:0.9em; color:#aaa; margin-right:3px;">Lv.${p.level}</span>${p.name} ${statusIcon}</div><div style="color:${clr}">HP:${p.hp}</div></div>`;
    }).join('');
    
    checkObject();
}

function draw3D(){
    if(!ctx) return;
    const theme = dungeonData[currentDungeonId].theme;
    
    // 1. 環境（床・天井）の描画
    drawEnvironment(ctx, theme);

    // 2. 壁の描画（奥から手前へ）
    for(let d=3; d>=0; d--) drawLayer(d, theme);
}

// 床と天井を詳細に描画する関数
function drawEnvironment(ctx, theme) {
    const W = 300;
    const H = 200;
    const CY = 100; // 地平線（Horizon）

    // --- ベースのグラデーション ---
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, CY);
    ceilGrad.addColorStop(0, theme.ceil);
    ceilGrad.addColorStop(1, "#000"); 
    ctx.fillStyle = ceilGrad; 
    ctx.fillRect(0, 0, W, CY);

    const floorGrad = ctx.createLinearGradient(0, CY, 0, H);
    floorGrad.addColorStop(0, "#000"); 
    floorGrad.addColorStop(1, theme.floor);
    ctx.fillStyle = floorGrad; 
    ctx.fillRect(0, CY, W, CY);

    // --- タイプ別の環境エフェクト ---
    ctx.save();
    
    // 地平線付近のクリッピング（奥の粗さを隠す）
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();

    if (theme.type === 'brick') {
        // [地下迷宮] 石畳のグリッド
        drawPerspectiveGrid(ctx, W, H, CY, "rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)");
    } 
    else if (theme.type === 'forest') {
        // [迷いの森] 草地と木漏れ日
        drawForestFloor(ctx, W, H, CY);
    }
    else if (theme.type === 'cave') {
        // [海底洞窟] 水面の波紋
        drawWaterFloor(ctx, W, H, CY);
    }
    else if (theme.type === 'temple') {
        // [古代神殿] タイル床と天井の梁
        drawTempleEnvironment(ctx, W, H, CY);
    }
    else if (theme.type === 'tower') {
        // [天空の塔] 星空とサイバーなグリッド
        drawTowerEnvironment(ctx, W, H, CY);
    }

    // --- 仕上げ: 距離フォグ（地平線付近を少し暗くして馴染ませる） ---
    const fog = ctx.createLinearGradient(0, CY - 20, 0, CY + 20);
    fog.addColorStop(0, "rgba(0,0,0,0)");
    fog.addColorStop(0.5, "rgba(0,0,0,0.5)"); // 中心だけ少し暗く
    fog.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, CY - 20, W, 40);

    ctx.restore();
}

// 汎用的な透視投影グリッドを描画
function drawPerspectiveGrid(ctx, w, h, cy, colorFloor, colorCeil) {
    ctx.lineWidth = 1;

    // 床のグリッド
    ctx.strokeStyle = colorFloor;
    ctx.beginPath();
    
    // 放射線（奥行き）
    for (let i = -2; i <= 8; i++) {
        const x = i * (w / 3); 
        ctx.moveTo(x, h);
        ctx.lineTo(w / 2, cy); 
    }
    // 横線（距離） - ★壁のパースと一致させる
    FLOOR_Y.forEach(y => {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    });
    ctx.stroke();

    // 天井のグリッド
    if (colorCeil) {
        ctx.strokeStyle = colorCeil;
        ctx.beginPath();
        CEIL_LINES.forEach(y => {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        });
        ctx.stroke();
    }
}

// 森の表現
function drawForestFloor(ctx, w, h, cy) {
    // 床：草の表現
    ctx.fillStyle = "rgba(40, 80, 40, 0.4)";
    // 奥から手前へ描画することで重なりを自然に
    for(let i=FLOOR_Y.length-1; i>=0; i--) {
        const yBase = FLOOR_Y[i];
        if(yBase > h) continue;
        
        // 各ライン付近に草を生やす
        const density = 20 + i * 5; // 手前ほど多く
        const scale = (yBase - cy) / (h - cy); // 手前ほど大きく
        
        for(let j=0; j<density; j++) {
            const x = Math.random() * w;
            const size = 2 + scale * 8;
            // 揺らぎを加える
            const y = yBase - (Math.random() * size); 
            ctx.fillRect(x, y, 2 * scale, size); 
        }
    }

    // 天井：木漏れ日
    ctx.fillStyle = "rgba(20, 50, 20, 0.5)";
    for(let i=0; i<30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * cy;
        const s = 5 + Math.random() * 15;
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI*2); ctx.fill();
    }
}

// 洞窟の表現
function drawWaterFloor(ctx, w, h, cy) {
    // 水面（床）- ラインをパースに合わせる
    ctx.strokeStyle = "rgba(100, 200, 255, 0.3)";
    ctx.lineWidth = 1;
    
    FLOOR_Y.forEach((y, idx) => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        // 波の振幅を手前ほど大きく
        const amp = (y - cy) * 0.05; 
        const freq = 20 + idx * 5;
        
        for(let x=0; x<=w; x+=10) {
            ctx.lineTo(x, y + Math.sin(x/freq + Date.now()/1000)*amp); // 簡易アニメーションっぽく見せるならDate.now使う手もあるが、静止画なら定数でOK
        }
        ctx.stroke();
    });

    // 天井：鍾乳石
    ctx.fillStyle = "rgba(0, 0, 50, 0.6)";
    for(let i=0; i<15; i++) {
        const x = Math.random() * w;
        const y = 0;
        const hLen = 10 + Math.random() * 40;
        const wLen = 2 + Math.random() * 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + wLen, y);
        ctx.lineTo(x + wLen/2, y + hLen);
        ctx.fill();
    }
}

// 神殿の表現
function drawTempleEnvironment(ctx, w, h, cy) {
    // 床：チェッカーボード風のライン
    ctx.strokeStyle = "rgba(200, 180, 100, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // 放射線
    for (let i = -1; i <= 4; i++) {
        const x = i * (w / 2); 
        ctx.moveTo(x, h);
        ctx.lineTo(w / 2, cy);
    }
    // 横線 - パース合わせ
    FLOOR_Y.forEach(y => {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    });
    ctx.stroke();

    // 天井：梁（はり）- パース合わせ
    ctx.fillStyle = "rgba(50, 40, 20, 0.6)";
    CEIL_Y.forEach(y => {
        ctx.fillRect(0, y - 2, w, 4); // 少し太めの梁
    });
}

// 塔の表現
function drawTowerEnvironment(ctx, w, h, cy) {
    // 天井：星空
    ctx.fillStyle = "#fff";
    for(let i=0; i<50; i++) {
        const x = Math.random() * w;
        const y = Math.random() * cy * 1.5;
        const s = Math.random() * 1.5;
        ctx.globalAlpha = 0.3 + Math.random() * 0.7;
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 床：メカニカルなグリッド
    ctx.strokeStyle = "rgba(100, 255, 255, 0.4)";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "#0ff";
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    // 放射線
    for (let i = -4; i <= 8; i++) {
        const x = i * (w / 4);
        ctx.moveTo(x, h);
        ctx.lineTo(w / 2, cy);
    }
    // 横線 - パース合わせ
    FLOOR_Y.forEach(y => {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
}
// 汎用的な透視投影グリッドを描画
function drawPerspectiveGrid(ctx, w, h, cy, colorFloor, colorCeil) {
    ctx.lineWidth = 1;

    // 床のグリッド
    ctx.strokeStyle = colorFloor;
    ctx.beginPath();
    
    // 放射線（奥行き）
    for (let i = -2; i <= 8; i++) {
        const x = i * (w / 3); // 間隔広め
        ctx.moveTo(x, h);
        ctx.lineTo(w / 2, cy); // 消失点へ
    }
    // 横線（距離）- 指数関数的に間隔を狭める
    for (let i = 1; i < 8; i++) {
        const y = cy + (h - cy) / i;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 天井のグリッド（もしあれば）
    if (colorCeil) {
        ctx.strokeStyle = colorCeil;
        ctx.beginPath();
        // 天井の横線
        for (let i = 1; i < 6; i++) {
            const y = cy - (cy / i);
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();
    }
}

function drawLayer(d, theme){
    // 相対座標のチェック
    const l = getRelPos(d, -1) === 1; // 左に壁があるか
    const r = getRelPos(d, 1) === 1;  // 右に壁があるか
    const f = getRelPos(d, 0) === 1;  // 正面に壁があるか
    
    const m = VIEW_METRICS[d];
    const nm = (d < 3) ? VIEW_METRICS[d+1] : null; // 一つ奥の座標

    // 距離による明るさ調整 (奥ほど暗く)
    const brightness = 1.0 - (d * 0.2); 

    // --- 正面の壁 (Front) ---
    if(f){
        drawWallRect(m.x, m.y, m.w, m.h, theme, brightness, 'front', d);
    }
    // --- 側面の壁 (Side) ---
    else if(d < 3 && nm){ 
        if(l){
            // 左壁: 台形を描画
            drawSideWall(m.x, m.y, m.h, nm.x, nm.y, nm.h, theme, brightness * 0.8, 'left');
        } 
        if(r){
            // 右壁: 台形を描画 (X座標は幅を足したもの)
            drawSideWall(m.x + m.w, m.y, m.h, nm.x + nm.w, nm.y, nm.h, theme, brightness * 0.8, 'right');
        } 
    }
    
    // --- イベントアイコン等の描画 (既存処理のまま維持) ---
    let cx=playerPos.x, cy=playerPos.y, dr=playerPos.dir;
    if(dr===0)cy-=d; else if(dr===1)cx+=d; else if(dr===2)cy+=d; else if(dr===3)cx-=d;
    let val=0; if(cx>=0 && cx<mapSize && cy>=0 && cy<mapSize) val=currentMapData[cy][cx];
    
    if([TILE.STAIRS, TILE.UP_STAIRS, TILE.BOSS, TILE.CHEST, TILE.SHOP, TILE.EXIT, TILE.HOLE, 
        TILE.DOOR, TILE.LOCKED_DOOR, TILE.SWITCH].includes(val)) {
        
        let s=m.w*0.6, ix=m.x+(m.w-s)/2, iy=m.y+(m.h-s)/2;
        let t='ev';
        
        // アイコン種別の決定 (既存コードと同じ)
        if(val===TILE.STAIRS || val===TILE.UP_STAIRS) t='ladder';
        else if(val===TILE.BOSS) { /* ...Boss描画処理... */ drawBossAura(ix, iy, s); return; } 
        else if(val===TILE.CHEST) t='chest';
        else if(val===TILE.SHOP) t='shop';
        else if(val===TILE.EXIT) t='exit';
        else if(val===TILE.HOLE) { if(currentDungeonId !== 5) t='hole'; else return; }
        else if(val===TILE.DOOR) t='door';
        else if(val===TILE.LOCKED_DOOR) {
            const key = `${currentDungeonId}_${currentFloor}_${cx}_${cy}`;
            t = unlockedDoors[key] ? 'door' : 'locked_door';
        }
        else if(val===TILE.SWITCH) t='switch';
        
        drawIcon(ctx, ix, iy, s, t); 
    }
}

function drawBossAura(ix, iy, s) {
    ctx.save();
    const cx = ix + s / 2;
    const cy = iy + s / 2;
    const grad = ctx.createRadialGradient(cx, cy, s * 0.1, cx, cy, s * 0.8);
    grad.addColorStop(0, "rgba(255, 50, 50, 0.9)");
    grad.addColorStop(0.4, "rgba(150, 0, 0, 0.6)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(50, 0, 0, 0.8)";
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawSideWall(x1, y1, h1, x2, y2, h2, theme, bright, side) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y2 + h2);
    ctx.lineTo(x1, y1 + h1);
    ctx.closePath();
    
    // ベース色の計算
    const base = theme.wallBaseRGB;
    const r = Math.floor(base[0] * bright);
    const g = Math.floor(base[1] * bright);
    const b = Math.floor(base[2] * bright);
    
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
    ctx.strokeStyle = `rgb(${Math.floor(r*0.5)},${Math.floor(g*0.5)},${Math.floor(b*0.5)})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // クリップして模様を描画
    ctx.save();
    ctx.clip();
    
    // 側面用の簡易パターン (横線を入れる)
    ctx.strokeStyle = `rgba(0,0,0,0.3)`;
    const steps = 6;
    for(let i=1; i<steps; i++) {
        const rY1 = y1 + (h1 * i / steps);
        const rY2 = y2 + (h2 * i / steps);
        ctx.beginPath();
        ctx.moveTo(x1, rY1);
        ctx.lineTo(x2, rY2);
        ctx.stroke();
    }
    
    // 影を落とす
    const shadowGrad = ctx.createLinearGradient(x1, 0, x2, 0);
    if(side === 'left') {
        shadowGrad.addColorStop(0, "rgba(0,0,0,0)");
        shadowGrad.addColorStop(1, "rgba(0,0,0,0.6)"); // 奥側を暗く
    } else {
        shadowGrad.addColorStop(0, "rgba(0,0,0,0.6)");
        shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = shadowGrad;
    ctx.fill();

    ctx.restore();
}

// 正面の矩形壁を描画する関数
function drawWallRect(x, y, w, h, theme, bright, type, depth) {
    // 1. ベースの塗り（グラデーションで立体感を出す）
    const base = theme.wallBaseRGB;
    const r = Math.floor(base[0] * bright);
    const g = Math.floor(base[1] * bright);
    const b = Math.floor(base[2] * bright);

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, `rgb(${r},${g},${b})`); // 上部
    grad.addColorStop(1, `rgb(${Math.floor(r*0.6)},${Math.floor(g*0.6)},${Math.floor(b*0.6)})`); // 下部（暗く）
    
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // 2. 枠線
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgb(${Math.floor(r*0.3)},${Math.floor(g*0.3)},${Math.floor(b*0.3)})`;
    ctx.strokeRect(x, y, w, h);

    // 3. ダンジョンタイプ別の模様描画
    ctx.save();
    // 描画範囲をクリップ
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

    const patternAlpha = 0.3 * bright; // 距離に応じて模様を薄くする

    // === パターン分岐 ===
    if (theme.type === 'brick') {
        // [地下迷宮] レンガ模様
        drawBrickPattern(ctx, x, y, w, h, patternAlpha, 6);
    } 
    else if (theme.type === 'forest') {
        // [迷いの森] 木のような縦線とノイズ
        drawForestPattern(ctx, x, y, w, h, patternAlpha);
    }
    else if (theme.type === 'cave') {
        // [海底洞窟] 岩肌・水面反射のような波線
        drawCavePattern(ctx, x, y, w, h, patternAlpha);
    }
    else if (theme.type === 'temple') {
        // [古代神殿] 柱のような装飾と目地
        drawTemplePattern(ctx, x, y, w, h, patternAlpha);
    }
    else if (theme.type === 'tower') {
        // [天空の塔] 金属パネル風
        drawTowerPattern(ctx, x, y, w, h, patternAlpha);
    }
    
    ctx.restore();
}

// --- 各パターンの実装 ---

function drawBrickPattern(ctx, x, y, w, h, alpha, rows) {
    ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
    ctx.lineWidth = 2;
    const rowH = h / rows;
    
    for (let i = 0; i <= rows; i++) {
        const ly = y + i * rowH;
        // 横線
        ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + w, ly); ctx.stroke();
        
        // 縦線（交互にずらす）
        if (i < rows) {
            const cols = 4;
            const colW = w / cols;
            const offset = (i % 2 === 0) ? 0 : colW / 2;
            
            for (let j = 0; j <= cols; j++) {
                let lx = x + j * colW + offset;
                if (lx > x && lx < x + w) {
                    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + rowH); ctx.stroke();
                }
            }
        }
    }
}

function drawForestPattern(ctx, x, y, w, h, alpha) {
    // 縦の木目
    ctx.strokeStyle = `rgba(20, 40, 20, ${alpha})`;
    ctx.lineWidth = 3;
    const count = 5;
    for(let i=1; i<count; i++) {
        const lx = x + (w * i / count);
        // 少しゆらぎを入れる
        ctx.beginPath();
        ctx.moveTo(lx, y);
        ctx.bezierCurveTo(lx - 5, y + h/2, lx + 5, y + h, lx, y + h);
        ctx.stroke();
    }
    
    // 葉っぱのノイズ
    ctx.fillStyle = `rgba(50, 80, 50, ${alpha * 0.8})`;
    for(let i=0; i<20; i++) {
        const rx = x + Math.random() * w;
        const ry = y + Math.random() * h;
        const s = w * 0.05;
        ctx.beginPath(); ctx.arc(rx, ry, s, 0, Math.PI*2); ctx.fill();
    }
}

function drawCavePattern(ctx, x, y, w, h, alpha) {
    // 岩の亀裂（ランダム線）
    ctx.strokeStyle = `rgba(0, 0, 40, ${alpha})`;
    ctx.lineWidth = 2;
    
    for(let i=0; i<5; i++) {
        const sy = y + Math.random() * h;
        const ey = y + Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(x, sy);
        ctx.lineTo(x + w/2, (sy + ey)/2 + (Math.random()*10 - 5));
        ctx.lineTo(x + w, ey);
        ctx.stroke();
    }
    
    // 水の反射（下の方に薄い青）
    const grad = ctx.createLinearGradient(x, y+h*0.7, x, y+h);
    grad.addColorStop(0, "rgba(100, 200, 255, 0)");
    grad.addColorStop(1, `rgba(100, 200, 255, ${alpha * 0.5})`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y+h*0.7, w, h*0.3);
}

function drawTemplePattern(ctx, x, y, w, h, alpha) {
    // 柱のような装飾（左右に縦ライン）
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.5})`;
    const pW = w * 0.15;
    ctx.fillRect(x + w * 0.1, y, pW, h); // 左柱
    ctx.fillRect(x + w * 0.75, y, pW, h); // 右柱
    
    // ヒエログリフ風の点
    ctx.fillStyle = `rgba(150, 120, 50, ${alpha})`;
    for(let i=0; i<10; i++) {
        const rx = x + w * 0.3 + Math.random() * (w * 0.4);
        const ry = y + Math.random() * h;
        ctx.fillRect(rx, ry, w*0.05, h*0.02);
    }
}

function drawTowerPattern(ctx, x, y, w, h, alpha) {
    // 金属パネル（大きな格子）
    ctx.strokeStyle = `rgba(100, 100, 120, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h); // 外枠
    
    // 中央線
    ctx.beginPath(); ctx.moveTo(x, y + h/2); ctx.lineTo(x + w, y + h/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w/2, y); ctx.lineTo(x + w/2, y + h); ctx.stroke();
    
    // リベット（四隅）
    ctx.fillStyle = `rgba(200, 200, 220, ${alpha})`;
    const r = w * 0.03;
    const pad = w * 0.05;
    
    const drawBolt = (bx, by) => { ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI*2); ctx.fill(); };
    drawBolt(x + pad, y + pad);
    drawBolt(x + w - pad, y + pad);
    drawBolt(x + pad, y + h - pad);
    drawBolt(x + w - pad, y + h - pad);
}

function drawIcon(ctx, x, y, size, type) {
    // スケール調整と位置補正（少し小さく描画して壁との境界を作る）
    const scale = 0.8; 
    const offset = (size * (1 - scale)) / 2; 
    
    // 座標退避
    const ox = x + offset; 
    const oy = y + offset; 
    const s = size * scale; 
    
    ctx.save();
    
    // ==========================================
    //  🚪 ドア (通常) - 壁に埋め込まれた表現
    // ==========================================
    if (type === 'door') {
        // 1. ドア枠 (Frame) - 外壁より少し暗い色で奥行きを出す
        ctx.fillStyle = "#2d2d2d"; // 暗いグレー
        ctx.fillRect(ox, oy, s, s);
        
        // 2. ドア本体 (Panel) - 枠より少し小さくして「埋まり」を表現
        const doorInset = s * 0.1;
        const dw = s - (doorInset * 2);
        const dh = s - doorInset; // 下は床につける
        const dx = ox + doorInset;
        const dy = oy + doorInset;
        
        // 木の質感
        ctx.fillStyle = "#5a4a3a"; // ベースの茶色
        ctx.fillRect(dx, dy, dw, dh);
        
        // 木目のライン (縦線)
        ctx.strokeStyle = "#3e2723";
        ctx.lineWidth = s * 0.05;
        ctx.beginPath();
        ctx.moveTo(dx + dw*0.33, dy); ctx.lineTo(dx + dw*0.33, dy + dh);
        ctx.moveTo(dx + dw*0.66, dy); ctx.lineTo(dx + dw*0.66, dy + dh);
        ctx.stroke();
        
        // 枠の内側に影を落とす (inset shadow)
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(dx, dy, dw, dh);

        // ドアノブ (立体感)
        const knobX = dx + dw * 0.85;
        const knobY = dy + dh * 0.55;
        const knobSize = s * 0.06;
        
        // ノブの影
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath(); ctx.arc(knobX + 1, knobY + 1, knobSize, 0, Math.PI*2); ctx.fill();
        // ノブ本体
        ctx.fillStyle = "#ffd700";
        ctx.beginPath(); ctx.arc(knobX, knobY, knobSize, 0, Math.PI*2); ctx.fill();
        // ノブのハイライト
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(knobX - 1, knobY - 1, knobSize/2, 0, Math.PI*2); ctx.fill();
    }
    // ==========================================
    //  🔒 鍵付き扉 (Locked Door) - 鉄格子や頑丈な表現
    // ==========================================
    else if (type === 'locked_door') {
        // 1. ドア枠
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(ox, oy, s, s);
        
        // 2. ドア本体 (鉄扉)
        const doorInset = s * 0.1;
        const dw = s - (doorInset * 2);
        const dh = s - doorInset;
        const dx = ox + doorInset;
        const dy = oy + doorInset;

        // 鉄板ベース
        ctx.fillStyle = "#37474f"; 
        ctx.fillRect(dx, dy, dw, dh);

        // リベット打ち (四隅)
        ctx.fillStyle = "#78909c";
        const rSize = s * 0.04;
        ctx.beginPath();
        ctx.arc(dx + rSize*2, dy + rSize*2, rSize, 0, Math.PI*2);
        ctx.arc(dx + dw - rSize*2, dy + rSize*2, rSize, 0, Math.PI*2);
        ctx.arc(dx + rSize*2, dy + dh - rSize*2, rSize, 0, Math.PI*2);
        ctx.arc(dx + dw - rSize*2, dy + dh - rSize*2, rSize, 0, Math.PI*2);
        ctx.fill();

        // 厳重なクロスバー (X字)
        ctx.strokeStyle = "#541e1b"; // 錆びた赤色
        ctx.lineWidth = s * 0.08;
        ctx.beginPath();
        ctx.moveTo(dx, dy); ctx.lineTo(dx + dw, dy + dh);
        ctx.moveTo(dx + dw, dy); ctx.lineTo(dx, dy + dh);
        ctx.stroke();
        
        // 大きな鍵アイコン
        ctx.fillStyle = "#ff5555";
        ctx.font = `bold ${s * 0.4}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.fillText("🔒", dx + dw/2, dy + dh/2);
        ctx.shadowBlur = 0;
    }
    // ==========================================
    //  🕹️ スイッチ (Switch) - レバー形式
    // ==========================================
    else if (type === 'switch') {
        // 1. 台座 (Base) - 台形っぽく描画
        const bx = ox + s * 0.2;
        const by = oy + s * 0.7;
        const bw = s * 0.6;
        const bh = s * 0.2;
        
        // 台座の側面
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(bx, by + bh);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx + bw - s*0.1, by);
        ctx.lineTo(bx + s*0.1, by);
        ctx.fill();
        
        // 台座の天面（スリット）
        ctx.fillStyle = "#111";
        ctx.fillRect(bx + s*0.25, by + s*0.05, s*0.1, bh - s*0.1);

        // 2. レバー (Lever) - 斜めに倒れている表現
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = s * 0.08;
        ctx.lineCap = "round";
        
        // 棒の部分
        const stickBaseX = bx + bw/2;
        const stickBaseY = by + bh/2;
        // 少し左に傾ける
        const stickTopX = stickBaseX - s * 0.15;
        const stickTopY = by - s * 0.4;
        
        ctx.beginPath();
        ctx.moveTo(stickBaseX, stickBaseY);
        ctx.lineTo(stickTopX, stickTopY);
        ctx.stroke();

        // 3. レバーの持ち手 (Ball)
        ctx.fillStyle = "#f44336"; // 赤い玉
        const knobR = s * 0.12;
        
        // 球体の影とハイライト
        const grad = ctx.createRadialGradient(stickTopX - knobR*0.3, stickTopY - knobR*0.3, knobR*0.2, stickTopX, stickTopY, knobR);
        grad.addColorStop(0, "#ff8a80");
        grad.addColorStop(0.3, "#f44336");
        grad.addColorStop(1, "#b71c1c");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(stickTopX, stickTopY, knobR, 0, Math.PI*2);
        ctx.fill();
    }

    // --- (以下、既存の他のアイコン描画処理) ---
    else if(type === 'ladder') {
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = Math.max(1, s/15); ctx.beginPath();
        ctx.moveTo(ox + s*0.25, oy); ctx.lineTo(ox + s*0.25, oy + s); ctx.moveTo(ox + s*0.75, oy); ctx.lineTo(ox + s*0.75, oy + s);
        for(let i=1; i<=5; i++) { const ry = oy + (s * i / 6); ctx.moveTo(ox + s*0.25, ry); ctx.lineTo(ox + s*0.75, ry); } ctx.stroke();
    } else if(type === 'chest') {
        const boxH = s * 0.5; const lidH = s * 0.3; const baseY = oy + (s - boxH) / 2 + lidH / 3;
        ctx.fillStyle = '#8B4513'; ctx.fillRect(ox, baseY, s, boxH);
        ctx.fillStyle = '#A0522D'; ctx.beginPath(); ctx.moveTo(ox, baseY); ctx.quadraticCurveTo(ox + s/2, baseY - lidH * 1.8, ox + s, baseY); ctx.fill();
        ctx.strokeStyle = '#DAA520'; ctx.lineWidth = Math.max(2, s / 12); ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(ox, baseY); ctx.quadraticCurveTo(ox + s/2, baseY - lidH * 1.8, ox + s, baseY); ctx.stroke();
        ctx.strokeRect(ox, baseY, s, boxH);
    } else if(type === 'shop') {
        ctx.font = `${s}px sans-serif`; ctx.fillStyle = "#fff"; ctx.fillText("💰", ox, oy + s/1.2);
    } else if(type === 'hole') {
        ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(ox+s/2, oy+s/2, s/2, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#444"; ctx.lineWidth = 2; ctx.stroke();
    } else if(type === 'exit') {
        ctx.fillStyle = "#333"; ctx.fillRect(ox + s*0.2, oy, s*0.6, s);
        const grad = ctx.createLinearGradient(ox, oy, ox, oy + s);
        grad.addColorStop(0, "rgba(200, 255, 255, 0.9)"); grad.addColorStop(1, "rgba(255, 255, 255, 0.2)");
        ctx.fillStyle = grad; ctx.fillRect(ox + s*0.25, oy + s*0.05, s*0.5, s*0.95);
        ctx.fillStyle = "#000"; ctx.font = `bold ${s*0.3}px sans-serif`; ctx.textAlign = "center";
        ctx.fillText("EXIT", ox + s/2, oy + s*0.6);
        ctx.strokeStyle = "#8ff"; ctx.lineWidth = 2; ctx.strokeRect(ox + s*0.2, oy, s*0.6, s);
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
// --- openTemple の修正 (ボタン追加) ---
function openTemple() { 
    document.getElementById('town-scene').style.display='none'; 
    document.getElementById('temple-scene').style.display='block'; 
    templeTargetIndex = -1; 
    document.getElementById('temple-action-area').style.display = 'none'; 
    document.getElementById('job-select-area').style.display='none'; 
    document.getElementById('levelup-area').style.display='none'; 
    
    // 不具合修正箇所: closeSubMenu() だとキャンプが開いてしまうため、直接非表示にする
    document.getElementById('sub-menu-overlay').style.display = 'none';

    const list = document.getElementById('temple-member-list'); 
    list.innerHTML = party.map((p,i) => { 
        const nextReq = p.level * 50; 
        const canLvl = p.exp >= nextReq && p.level < 20; 
        const lvlBadges = canLvl ? `<span class="lvl-up-badge">UP!</span>` : ""; 
        const selectedClass = (i === templeTargetIndex) ? "selected" : ""; 
        return `<div class="temple-card ${selectedClass}" onclick="selectTempleMember(${i})"><img src="${p.img}" class="temple-icon"><div class="temple-card-info"><div class="temple-name">${p.name}</div><div class="temple-meta">Lv.${p.level} ${jobData[p.jobId].name}</div></div>${lvlBadges}</div>`; 
    }).join(''); 
    
    const actionsDiv = document.querySelector('.temple-actions');
    if(actionsDiv) {
        actionsDiv.innerHTML = `
            <button class="btn temple-btn" onclick="checkLevelUp()">
                <div class="main">レベルアップ</div>
                <div class="sub" id="btn-lvl-sub">EXP確認</div>
            </button>
            <button class="btn temple-btn" style="border-color:#fa8; background:linear-gradient(180deg, #421, #210);" onclick="openSkillTree()">
                <div class="main" style="color:#fd8;">スキル習得</div>
                <div class="sub">ツリー確認</div>
            </button>
            <button class="btn temple-btn" onclick="showJobChange()">
                <div class="main">転職</div>
                <div class="sub">Lv1からやり直し</div>
            </button>
            <button class="btn temple-btn" style="border-color:#a8f; background:linear-gradient(180deg, #324, #112);" onclick="checkRespec()">
                <div class="main" style="color:#dcf;">能力再編</div>
                <div class="sub">忘却の石を使用</div>
            </button>
        `;
    }
}

// --- スキルツリー画面表示 ---
function openSkillTree() {
    if(templeTargetIndex === -1) return alert("キャラクターを選択してください");
    const p = party[templeTargetIndex];
    
    // ★重要: 戻り先を「神殿」に指定する
    menuReturnTo = 'temple'; 
    
    renderSkillMenu(p);
}

// --- ★改修: スキルメニュー描画 (Final Fix) ---
function renderSkillMenu(p) {
    const tree = skillTreeData[p.jobId];
    if(!tree) {
        showSubMenu("この職業のスキルデータがありません", "スキルツリー");
        return;
    }

    // ヘッダー
    let html = `
    <div style="background:rgba(0,0,0,0.5); padding:10px; border-bottom:1px solid #444; margin-bottom:10px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:bold; color:#eee;">
                ${jobData[p.jobId].icon} ${jobData[p.jobId].name}
            </div>
            <div style="color:#ffd700; font-weight:bold; font-size:1.1em;">
                SP: <span style="font-size:1.3em;">${p.skillPoints}</span>
            </div>
        </div>
        <div style="font-size:0.75em; color:#aaa; margin-top:4px;">
            ※スキルを選んで習得・強化
        </div>
    </div>
    <div class="skill-tree-container">
    `;
    
    // ノード描画再帰関数
    const renderNode = (nodes, depth, parentLines = []) => {
        let nodeHtml = "";
        
        nodes.forEach((node, index) => {
            const isLast = (index === nodes.length - 1);
            
            // 特殊条件チェック
            if (node.req === 'hero_elem_comp') {
                const hasFire = (p.investedSkills['fire']||0) > 0;
                const hasWater = (p.investedSkills['water']||0) > 0;
                const hasEarth = (p.investedSkills['earth']||0) > 0;
                const hasWind = (p.investedSkills['wind']||0) > 0;
                if(!(hasFire && hasWater && hasEarth && hasWind)) return;
            }
            if (node.req === 'sage_all_comp') {
                const reqSkills = ['inferno', 'cocytus', 'quake', 'storm', 'darkness', 'judgment'];
                const isAllLearned = reqSkills.every(sid => (p.investedSkills[sid] || 0) > 0);
                if (!isAllLearned) return;
            }

            const currentPts = p.investedSkills[node.id] || 0;
            const spell = spellData[node.id];
            
            // ★修正: 習得コストの取得（デフォルト1）
            // 既に習得済み(強化)の場合は一律1ポイント消費とするか、強化もコストを上げるか？
            // ここでは「習得は設定コスト」「強化は一律1コスト」とします（バランス調整のため）
            const learnCost = (currentPts === 0) ? (spell.learnCost || 1) : 1;
            const canAfford = (p.skillPoints >= learnCost);
            
            const maxUses = 3 + (currentPts > 0 ? (currentPts - 1) : 0);
            const nextUses = 3 + currentPts; // (currentPts + 1) - 1
            const icon = isPhysicalSkill(spell) ? (ELEM_ICONS[spell.element]||"⚔️") : (ELEM_ICONS[spell.element]||"🪄");

            let cardClass = "";
            let btnHtml = "";
            let infoHtml = "";

            if (currentPts > 0) {
                // 習得済み -> 強化 (Cost: 1)
                cardClass = "learned";
                infoHtml = `
                    <div class="skill-name">
                        ${spell.name}<span class="skill-level">Lv.${currentPts}</span>
                    </div>
                    <div class="skill-meta">${spell.desc}</div>
                    <div class="skill-meta" style="color:#8ff;">回数: ${maxUses} <span style="color:#aaa;">➡</span> <span style="color:#fff;">${nextUses}</span></div>
                `;
                btnHtml = `<button class="btn skill-btn btn-atk" ${canAfford ? '' : 'disabled'} onclick="allocateSkillPoint('${node.id}', '${p.jobId}')">強化(1pt)</button>`;
            } else {
                // 未習得 -> 新規習得 (Cost: learnCost)
                cardClass = "available";
                infoHtml = `
                    <div class="skill-name" style="color:#eee;">${spell.name}</div>
                    <div class="skill-meta">${spell.desc}</div>
                    <div class="skill-meta" style="color:#aaa;">初期回数: ${nextUses}</div>
                `;
                btnHtml = `<button class="btn skill-btn btn-magic" ${canAfford ? '' : 'disabled'} onclick="allocateSkillPoint('${node.id}', '${p.jobId}')">習得(${learnCost}pt)</button>`;
            }

            // HTML構築
            nodeHtml += `<div class="skill-node-wrapper">`;
            
            // 接続線
            nodeHtml += `<div class="tree-connector-area">`;
            for (let i = 0; i < depth; i++) {
                const drawLine = parentLines[i];
                nodeHtml += `<div class="tree-line-block">${drawLine ? '<div class="tree-line-v"></div>' : ''}</div>`;
            }
            if (depth > 0) {
                nodeHtml += `
                    <div class="tree-line-block">
                        <div class="tree-line-v ${isLast ? 'last-child' : ''}"></div>
                        <div class="tree-line-h"></div>
                    </div>`;
            }
            nodeHtml += `</div>`;

            // カード本体
            nodeHtml += `
                <div class="skill-card ${cardClass}">
                    <div class="skill-icon-box">${icon}</div>
                    <div class="skill-info">
                        ${infoHtml}
                    </div>
                    ${btnHtml}
                </div>
            `;
            nodeHtml += `</div>`;

            // 子ノード
            if (node.children && node.children.length > 0) {
                if (currentPts > 0) {
                    const nextParentLines = [...parentLines, !isLast];
                    nodeHtml += renderNode(node.children, depth + 1, nextParentLines);
                } else {
                    // ロック表示
                    const nextParentLines = [...parentLines, !isLast];
                    node.children.forEach((childNode, cIdx) => {
                        const cIsLast = (cIdx === node.children.length - 1);
                        const cSpell = spellData[childNode.id];
                        const cIcon = isPhysicalSkill(cSpell) ? (ELEM_ICONS[cSpell.element]||"⚔️") : (ELEM_ICONS[cSpell.element]||"🪄");
                        
                        nodeHtml += `<div class="skill-node-wrapper">`;
                        nodeHtml += `<div class="tree-connector-area">`;
                        for (let i = 0; i <= depth; i++) {
                            const drawLine = (i === depth) ? !isLast : parentLines[i];
                            nodeHtml += `<div class="tree-line-block">${drawLine ? '<div class="tree-line-v"></div>' : ''}</div>`;
                        }
                        nodeHtml += `
                            <div class="tree-line-block">
                                <div class="tree-line-v ${cIsLast ? 'last-child' : ''}" style="opacity:0.5;"></div>
                                <div class="tree-line-h" style="border-style:dashed; opacity:0.5;"></div>
                            </div>`;
                        nodeHtml += `</div>`;

                        nodeHtml += `
                            <div class="skill-card locked">
                                <div class="skill-icon-box" style="border-color:#333; color:#555;">${cIcon}</div>
                                <div class="skill-info">
                                    <div class="skill-name" style="color:#777;">${cSpell.name}</div>
                                    <div class="skill-meta">🔒 前提: ${spell.name} Lv1</div>
                                </div>
                                <div class="lock-icon">🔒</div>
                            </div>
                        `;
                        nodeHtml += `</div>`;
                    });
                }
            }
        });
        return nodeHtml;
    };

    html += renderNode(tree, 0);
    html += `</div>`;

    showSubMenu(html, `スキル習得: ${p.name}`);
    document.querySelector('#sub-menu-overlay .screen-box').classList.add('wide-mode');
}
// --- ★新規: ポイント割り振り実行 (Cost Logic Update) ---
function allocateSkillPoint(skillId, jobId) {
    const p = party[templeTargetIndex];
    const spell = spellData[skillId];
    const currentPts = p.investedSkills[skillId] || 0;
    
    // ★修正: 習得時のみ設定コストを消費、強化(Lv2~)は1固定
    const cost = (currentPts === 0) ? (spell.learnCost || 1) : 1;

    if (p.skillPoints < cost) return alert(`ポイントが足りません (必要: ${cost})`);

    p.skillPoints -= cost;
    if (!p.investedSkills[skillId]) p.investedSkills[skillId] = 0;
    p.investedSkills[skillId]++;
    
    // 呪文リスト更新
    updateSpellsFromTree(p);
    
    // 画面更新
    renderSkillMenu(p);
}

function selectTempleMember(idx) { 
    openTemple(); 
    templeTargetIndex = idx; 
    const cards = document.getElementsByClassName('temple-card'); 
    if(cards[idx]) cards[idx].classList.add('selected-card'); 
    document.getElementById('temple-action-area').style.display = 'block'; 
    
    const p = party[idx]; 
    // ★変更: 必要経験値を Lv*100 から Lv*50 に緩和
    const req = p.level * 50; 
    
    const btnText = document.getElementById('btn-lvl-sub'); 
    
    if(p.level >= 20) { 
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

// --- ステータス振り直し機能 ---

// 1. 振り直しチェックと開始
// --- checkRespec の修正 (スキルもリセット) ---
function checkRespec() {
    if(templeTargetIndex === -1) return alert("キャラクターを選択してください");
    const p = party[templeTargetIndex];
    
    const stoneId = "i09";
    const stoneIndex = partyInventory.findIndex(item => (typeof item === 'string' ? item : item.itemId) === stoneId);

    if(stoneIndex === -1) return alert("「忘却の石」を持っていません。");
    if(!confirm(`${p.name}の能力を初期化しますか？\n(ステータスとスキルポイントをリセット)`)) return;

    // 消費
    partyInventory.splice(stoneIndex, 1);

    // 1. ステータスリセット
    const job = jobData[p.jobId];
    p.stats = { ...job.baseStats }; 
    // ステータスポイント再計算 (Lv-1)*3
    bonusPoints = (p.level - 1) * 3;

    // 2. スキルリセット (★追加)
    p.skillPoints = p.level; // Lv1初期(1) + (Lv-1)回アップ = Lv分
    p.investedSkills = {};
    updateSpellsFromTree(p);

    // 画面準備
    tempStatAlloc = {str:0, int:0, pie:0, vit:0, agi:0, luc:0};
    document.getElementById('temple-action-area').style.display = 'block';
    document.getElementById('job-select-area').style.display = 'none';
    document.getElementById('levelup-area').style.display = 'block';
    
    const growBtn = document.querySelector('#levelup-area .btn-magic');
    growBtn.innerText = "✨ 決定する";
    growBtn.onclick = commitRespec;

    renderLevelUpStats();
    updateBonusUI();
    
    alert(`初期化完了！\nステータスを振り直し、スキルメニューからスキルを習得してください。`);
}

function commitRespec() {
    if(bonusPoints > 0) return alert("ポイントを使い切ってください");
    const p = party[templeTargetIndex];
    for(let k in tempStatAlloc) p.stats[k] += tempStatAlloc[k];
    calculateStats(p);
    p.hp = p.maxHp;
    
    alert("ステータス振り直し完了！");
    document.getElementById('levelup-area').style.display = 'none';
    
    const growBtn = document.querySelector('#levelup-area .btn-magic');
    growBtn.innerText = "💪 成長する";
    growBtn.onclick = executeLevelUp;

    selectTempleMember(templeTargetIndex);
}

function exitTemple() { document.getElementById('temple-scene').style.display='none'; document.getElementById('town-scene').style.display='block'; updateTownStatus(); }
// game.js 内の showJobChange 関数内の jobs 配列定義を修正
function showJobChange() { 
    document.getElementById('job-select-area').style.display='block'; 
    document.getElementById('levelup-area').style.display='none'; 
    
    // ★ここを更新: 全職業IDをリストに追加
    const jobs = ['hero','warrior','mage','priest','thief','archer','sage','samurai','ninja']; 
    
    // グリッドレイアウトの微調整（CSSをJSから直接操作して列数を増やすか、折り返しに任せる）
    const container = document.getElementById('job-buttons');
    container.style.display = 'grid';
    // 4列だと入りきらないので、スマホなどでは auto-fill にするか、単に折り返させる
    // ここではCSS修正なしで対応するため列指定を削除してflex的に振る舞わせるか、
    // あるいは style.css 側で grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); にするのがベストですが、
    // JSだけで対応する場合:
    container.style.gridTemplateColumns = "repeat(3, 1fr)"; // 3列表示に変更して見やすくする

    container.innerHTML = jobs.map(j => { 
        const d = jobData[j]; 
        return `<button class="btn job-card-btn" id="btn-job-${j}" onclick="selectJob('${j}')"><div style="font-size:2em;">${d.icon}</div><div>${d.name}</div></button>`; 
    }).join(''); 
    
    document.getElementById('job-desc').innerHTML = "<div style='padding:20px; color:#aaa; text-align:center;'>職業アイコンをタップして<br>詳細を確認してください</div>"; 
    selectedJobId = null; 
}
function selectJob(jid) { selectedJobId = jid; const d = jobData[jid]; const btns = document.querySelectorAll('.job-card-btn'); btns.forEach(b => b.classList.remove('active-job')); document.getElementById(`btn-job-${jid}`).classList.add('active-job'); 
const equipTypes = { 
        sword:"剣", spear:"槍", axe:"斧", mace:"鈍器", staff:"杖", 
        dagger:"短剣", bow:"弓", katana:"刀", kunai:"暗器",
        heavyShield:"大盾", lightShield:"小盾", armor:"鎧", clothes:"服", helm:"兜", hat:"帽子", acc:"装飾" 
    };
const equips = d.canEquip.map(e => equipTypes[e]).filter(v=>v).join('・'); const html = `<div class="job-info-panel"><h3 style="margin:0 0 10px 0; color:#ffd700; border-bottom:1px solid #555; padding-bottom:5px;">${d.icon} ${d.name}</h3><p style="font-size:0.9em; line-height:1.4; margin-bottom:10px;">${d.desc}</p><div class="job-detail-grid"><div class="detail-box"><div class="detail-label">基礎ステータス</div><div class="stat-bar-row"><span>腕力:</span> <span class="stat-val">${d.baseStats.str}</span></div><div class="stat-bar-row"><span>知力:</span> <span class="stat-val">${d.baseStats.int}</span></div><div class="stat-bar-row"><span>信仰:</span> <span class="stat-val">${d.baseStats.pie}</span></div><div class="stat-bar-row"><span>体力:</span> <span class="stat-val">${d.baseStats.vit}</span></div></div><div class="detail-box"><div class="detail-label">特徴</div><div style="font-size:0.8em; text-align:left;"><div style="margin-bottom:4px;">🛠️ <b>装備:</b> ${equips}</div></div></div></div></div>`; document.getElementById('job-desc').innerHTML = html; }
function executeClassChange() { if(!selectedJobId) return alert("職業を選択してください"); if(!party[templeTargetIndex]) return; const p = party[templeTargetIndex]; if(p.jobId === selectedJobId) return alert("すでにその職業です"); if(!confirm("レベルが1に戻りますがよろしいですか？")) return; p.jobId = selectedJobId; p.level = 1; p.exp = 0; initCharacter(p); calculateStats(p); p.hp = p.maxHp; alert("転職しました！"); selectTempleMember(templeTargetIndex); }
function checkLevelUp() { 
    const p = party[templeTargetIndex]; 
    if(p.level >= 20) return alert("レベルは最大です");
    
    const req = p.level * 50; 
    if (p.exp >= req) { 
        bonusPoints = 3; // ステータス用ポイント(既存仕様)
        
        // UI切り替え
        tempStatAlloc={str:0,int:0,pie:0,vit:0,agi:0,luc:0}; 
        document.getElementById('job-select-area').style.display='none'; 
        document.getElementById('levelup-area').style.display='block'; 
        renderLevelUpStats(); 
        updateBonusUI(); 
    } else { 
        alert(`経験値が足りません (あと ${req - p.exp})`); 
    } 
}

// --- ヘルパー関数: アイテムの物理属性アイコンを取得 ---
function getItemTypeIcon(item) {
    if(item.type !== 'weapon') return "";
    const pType = item.phys || PHYS.BLUNT; // 未設定は打撃(素手等)扱い
    return PHYS_ICONS[pType] || "";
}

// --- ヘルパー関数: 攻撃者の物理属性を取得 ---
function getWeaponPhysType(actor) {
    if (actor.isEnemy) return PHYS.NONE; // 敵の攻撃は属性なし（または別途設定）
    
    // 武器を持っていない場合は「打撃（素手）」
    if (!actor.equips || !actor.equips.weapon) return PHYS.BLUNT;
    
    // 武器データから属性を取得
    const wData = itemData[actor.equips.weapon.itemId];
    return wData.phys || PHYS.BLUNT;
}

// --- 既存関数の置き換え: 装備文字列生成 (アイコン追加) ---
function getEquipString(equipObj) { 
    if(!equipObj) return "なし"; 
    const id = equipObj.itemId;
    const i = itemData[id]; 
    let s=""; 
    if(i.power) s+=`攻+${i.power}`; 
    if(i.ac) s+=`防+${i.ac}`; 
    
    // アイコンを追加
    const icon = getItemTypeIcon(i);
    
    const bStr = getBonusString(equipObj);
    return `${icon}${i.name} ${s} ${bStr}`; 
}

// --- 既存関数の置き換え: ショップUI更新 (ソート機能付き) ---
function updateShopUI() { 
    document.getElementById('shop-gold').innerText = partyGold; 
    const list = document.getElementById('shop-list'); 
    list.innerHTML = ''; 

    const titleHeader = document.querySelector('#shop-scene h2');
    if(titleHeader) {
        titleHeader.innerText = dungeonShopActive ? "💰 行商人" : "💰 道具屋";
    }
    
    // game.js 内の updateShopUI 関数内の typeOrder 定義を修正
    const typeOrder = {
        'sword': 1,       // 剣
        'dagger': 2,      // ★追加: 短剣
        'katana': 3,      // ★追加: 刀
        'spear': 4,       // 槍
        'axe': 5,         // 斧
        'mace': 6,        // 鈍器
        'staff': 7,       // 杖
        'bow': 8,         // ★追加: 弓
        'kunai': 9,       // ★追加: クナイ
        'lightShield': 10,
        'heavyShield': 11,
        'hat': 12,
        'helm': 13,
        'clothes': 14,
        'armor': 15,
        'gauntlet': 16,
        'gloves': 17,
        'acc': 18
    };

    // itemDataのキー配列を作成し、ルールに従ってソートする
    const sortedIds = Object.keys(itemData).sort((a, b) => {
        const itemA = itemData[a];
        const itemB = itemData[b];

        // 1. 消耗品(consumable)はリストの一番下へ
        if (itemA.type === 'consumable' && itemB.type !== 'consumable') return 1;
        if (itemA.type !== 'consumable' && itemB.type === 'consumable') return -1;
        
        // 2. 装備品ならサブタイプ順('sword' vs 'spear' など)で比較
        if (itemA.type !== 'consumable' && itemB.type !== 'consumable') {
            const orderA = typeOrder[itemA.subType] || 99;
            const orderB = typeOrder[itemB.subType] || 99;
            if (orderA !== orderB) return orderA - orderB;
        }

        // 3. 同じ種類なら価格(price)が安い順
        return itemA.price - itemB.price;
    });

    // ソートされた順序でループ処理
    for (let id of sortedIds) { 
        const item = itemData[id]; 
        
        // 陳列フィルター (既存ロジック)
        if(item.type !== 'consumable'){ 
            if(dungeonShopActive) {
                // ダンジョン内: その階層(tier)のものだけ
                if(item.tier !== currentDungeonId) continue;
            } else {
                // 町の店: tier 2 (序盤) 以下のものだけ
                if(item.tier > 2) continue;
            }
        } 

        let stats = "";
        
        // アイコンを追加
        const typeIcon = getItemTypeIcon(item);
        
        if(item.type !== 'consumable'){ 
            // 名前やステータスの前にアイコンを表示
            if(typeIcon) stats += `${typeIcon} `; 
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
// --- executeLevelUp の修正 ---
function executeLevelUp() { 
    if(bonusPoints > 0) return alert("ポイントを使い切ってください"); 
    
    const p = party[templeTargetIndex]; 
    const req = p.level * 50; 
    p.level++; 
    p.exp -= req; 
    
    // ステータス反映
    for(let k in tempStatAlloc) p.stats[k]+=tempStatAlloc[k]; 
    
    // ★変更: 自動習得廃止 -> スキルポイント付与
    p.skillPoints++; // LvUPごとに1ポイント
    
    calculateStats(p); 
    p.hp = p.maxHp; 
    
    alert(`レベルアップ！(Lv${p.level})\nスキルポイントを獲得しました(+1)`); 
    
    document.getElementById('levelup-area').style.display='none'; 
    selectTempleMember(templeTargetIndex); // 画面更新
}
// game.js の renderLevelUpStats 関数をこれに置き換えてください

function renderLevelUpStats() { 
    const p = party[templeTargetIndex]; 
    const stats = ['str','int','pie','vit','agi','luc']; 
    const labels = {str:'腕力',int:'知力',pie:'信仰',vit:'体力',agi:'敏捷',luc:'運'}; 
    
    // ステータスの説明文
    const descs = {
        str: '物理攻撃力UP',
        int: '攻撃魔法の威力',
        pie: '回復魔法の威力',
        vit: '最大HP増加',
        agi: '防御力・行動順',
        luc: '会心率・状態異常耐性'
    };

    const c = document.getElementById('levelup-stats'); 
    
    // レイアウト修正版
    // - ボタンの親divに display:flex を追加して横並びを強制
    // - 数値(span)に min-width を指定して桁が変わってもボタン位置がズレないように調整
    c.innerHTML = stats.map(k => `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #333; padding-bottom:4px;">
            <div style="display:flex; flex-direction:column; align-items:flex-start; width: 50%;">
                <span style="font-size:1em;">${labels[k]}</span>
                <span style="font-size:0.65em; color:#aaa; white-space:nowrap;">${descs[k]}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:flex-end; width: 50%;">
                <span style="color:#fff; font-weight:bold; margin-right:10px; font-size:1.3em; min-width:35px; text-align:right; display:inline-block;">
                    ${p.stats[k] + tempStatAlloc[k]}
                </span>
                <div style="display:flex; gap: 5px;">
                    <button class="btn" style="width:32px; height:32px; padding:0; display:flex; justify-content:center; align-items:center;" onclick="addStat('${k}', -1)">-</button>
                    <button class="btn" style="width:32px; height:32px; padding:0; display:flex; justify-content:center; align-items:center;" onclick="addStat('${k}', 1)">+</button>
                </div>
            </div>
        </div>`
    ).join(''); 
}
function addStat(k, v) { if(v > 0 && bonusPoints > 0) { tempStatAlloc[k]++; bonusPoints--; } else if (v < 0 && tempStatAlloc[k] > 0) { tempStatAlloc[k]--; bonusPoints++; } renderLevelUpStats(); updateBonusUI(); }
function updateBonusUI() { document.getElementById('bonus-points').innerText = bonusPoints; }

// ==========================================
//  キャンプメニュー (UI改修版)
// ==========================================

// 既存の openCamp をこの内容で上書きしてください
function openCamp(from) {
    menuReturnTo = from || 'camp';
    
    // 現在のシーン判定
    const isDungeon = (document.getElementById('dungeon-scene').style.display === 'flex');
    
    // ダンジョン内なら移動コントローラを隠す
    if(menuReturnTo === 'dungeon') {
        document.getElementById('move-controls').style.display = 'none';
    }
    
    // 「足元を調べる」ボタンの表示制御 (ダンジョン内でのみ有効に見せる)
    const checkBtn = document.getElementById('btn-camp-check-new');
    if(checkBtn) {
        if(isDungeon) {
            checkBtn.style.opacity = "1";
            checkBtn.style.pointerEvents = "auto";
        } else {
            checkBtn.style.opacity = "0.5";
            checkBtn.style.pointerEvents = "none";
        }
    }

    // UIの内容を最新化して表示
    updateCampUI();
    document.getElementById('camp-overlay').style.display='flex';
}

// ★新規追加: キャンプUI更新関数
function updateCampUI() {
    // 1. 所持金
    const goldEl = document.getElementById('camp-gold-display');
    if(goldEl) goldEl.innerText = partyGold;

    // 2. 現在地
    const locEl = document.getElementById('camp-location');
    if(locEl) {
        if(document.getElementById('dungeon-scene').style.display === 'flex') {
            const dName = dungeonData[currentDungeonId].name;
            locEl.innerText = `📍 ${dName} B${currentFloor}F`;
        } else {
            locEl.innerText = "📍 始まりの町";
        }
    }

    // 3. キャラクターリスト生成
    const listEl = document.getElementById('camp-char-list');
    if(listEl) {
        listEl.innerHTML = party.map(p => {
            // HPバーの色計算
            const hpPer = Math.max(0, Math.min(100, Math.floor((p.hp / p.maxHp) * 100)));
            let barColor = '#4f8'; // 緑
            if (hpPer < 50) barColor = '#fb0'; // 黄
            if (hpPer < 25) barColor = '#f55'; // 赤
            if (!p.alive) barColor = '#555';   // 灰

            // 状態異常バッジ
            let statusBadge = "";
            if (!p.alive) {
                statusBadge = `<span style="color:#aaa; background:#333; padding:1px 4px; border-radius:3px; font-size:0.8em; margin-left:5px;">戦闘不能</span>`;
            } else if (p.status !== 'normal') {
                const info = STATUS_INFO[p.status];
                statusBadge = `<span style="color:${info.color}; border:1px solid ${info.color}; padding:0 3px; border-radius:3px; font-size:0.8em; margin-left:5px;">${info.icon}${info.name}</span>`;
            }

            return `
            <div class="camp-char-card">
                <img src="${p.img}" class="camp-char-img">
                <div class="camp-char-info">
                    <div class="camp-char-top">
                        <div class="camp-char-name">${p.name}</div>
                        <div class="camp-char-job">${jobData[p.jobId].name}</div>
                    </div>
                    
                    <div class="camp-hp-bar-bg">
                        <div class="camp-hp-bar-fill" style="width:${hpPer}%; background:${barColor};"></div>
                    </div>
                    
                    <div class="camp-char-details">
                        <span>HP: <span style="color:#fff;">${p.hp}</span>/${p.maxHp}</span>
                        <span>Lv.${p.level}</span>
                        ${statusBadge}
                    </div>
                </div>
            </div>`;
        }).join('');
    }
}
function closeCamp() { document.getElementById('camp-overlay').style.display='none'; if(document.getElementById('dungeon-scene').style.display === 'flex') { toggleControls('move'); } }
function checkAreaCamp() { closeCamp(); checkArea(); }
// ★改修: キャラ選択をリッチ表示に
function openCampSpellMenu() { 
    document.getElementById('camp-overlay').style.display = 'none'; 
    
    const html = party.map((p, i) => { 
        const disabled = !p.alive ? "disabled" : ""; 
        const jobName = jobData[p.jobId].name;
        
        return `
        <button class="btn char-select-btn" ${disabled} onclick="showCampSpellList(${i})">
            <img src="${p.img}" class="char-select-icon">
            <div class="char-select-info">
                <div class="char-select-name">
                    <span>${p.name}</span>
                    <span class="char-select-job">${jobName}</span>
                </div>
                <div class="char-select-status">
                    HP: <span style="color:${p.hp < p.maxHp * 0.3 ? '#f55' : '#8f8'}">${p.hp}/${p.maxHp}</span>
                    
                </div>
            </div>
        </button>`; 
    }).join('');

    showSubMenu(html, "誰が唱える？"); 
}
// ★改修: 対象選択もリッチ表示に
function selectCampSpellTarget(actorIdx, spellKey) { 
    const p = party[actorIdx]; 
    const s = p.spells[spellKey]; 
    
    if (s.current <= 0) return; 
    
    // 自分自身への使用
    if (s.target === 'self' || spellKey === 'escape') { 
        executeCampSpell(actorIdx, null, spellKey); 
        return; 
    } 
    // 全体魔法
    if (s.target === 'all') { 
        executeCampSpell(actorIdx, -1, spellKey); 
        return; 
    } 
    
    const html = party.map((t, i) => { 
        const hpColor = t.hp < t.maxHp * 0.3 ? "#f55" : (t.hp < t.maxHp ? "#ffeb3b" : "#8f8"); 
        const statusText = t.alive ? `HP: <span style="color:${hpColor}">${t.hp}/${t.maxHp}</span>` : `<span style="color:#888">戦闘不能</span>`;
        
        return `
        <button class="btn char-select-btn" onclick="executeCampSpell(${actorIdx}, ${i}, '${spellKey}')">
            <img src="${t.img}" class="char-select-icon">
            <div class="char-select-info">
                <div class="char-select-name">${t.name}</div>
                <div class="char-select-status">${statusText}</div>
            </div>
        </button>`; 
    }).join('');

    showSubMenu(html, "誰にかける？"); 
}
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
// ★改修: 装備者選択をリッチ表示に
function openEquipMenu(from) { 
    if(from) menuReturnTo = from; 
    document.getElementById('camp-overlay').style.display='none'; 
    
    const html = party.map((p, i) => {
        const jobName = jobData[p.jobId].name;
        // 攻撃力と防御力を表示して選びやすくする
        return `
        <button class="btn char-select-btn" onclick="showEquipChar(${i})">
            <img src="${p.img}" class="char-select-icon">
            <div class="char-select-info">
                <div class="char-select-name">
                    <span>${p.name}</span>
                    <span class="char-select-job">${jobName}</span>
                </div>
                <div class="char-select-status" style="color:#aaa;">
                    攻:${p.atk} / 防:${p.def}
                </div>
            </div>
        </button>`; 
    }).join('');

    showSubMenu(html, "誰の装備？"); 
}
// 装備画面の表示 (showEquipChar) の改修版
function showEquipChar(idx) { 
    templeTargetIndex = idx; 
    const p = party[idx]; 
    
    // 現在のステータス計算（表示用）
    // ※ベース値 + 装備補正
    let totalAtk = p.atk; // calculateStats済みであること
    let totalDef = p.def;

    // ヘッダー部分：キャラ情報
    let html = `
    <div class="equip-header">
        <img src="${p.img}" class="equip-char-img">
        <div style="flex:1;">
            <div style="font-weight:bold; font-size:1.1em; color:#ffd700; margin-bottom:4px;">
                ${p.name} <span style="font-size:0.8em; color:#aaa;">(${jobData[p.jobId].name})</span>
            </div>
            <div class="equip-char-stats">
                <div class="stat-box">攻: <span>${totalAtk}</span></div>
                <div class="stat-box">防: <span>${totalDef}</span></div>
            </div>
        </div>
    </div>
    <div class="equip-slots-container">
    `;
    
    // 各スロットのカード生成
    for(let slotKey in EQUIP_SLOTS_DEF) {
        const def = EQUIP_SLOTS_DEF[slotKey];
        const equipObj = p.equips[slotKey];
        
        let itemName = "装備なし";
        let itemStats = "-";
        let isEmpty = true;
        let styleClass = "empty";
        
        if (equipObj) {
            const item = itemData[equipObj.itemId];
            itemName = item.name;
            isEmpty = false;
            styleClass = "";
            
            // 補正値と追加効果のテキスト生成
            let statsParts = [];
            if(item.power) statsParts.push(`攻+${item.power}`);
            if(item.ac) statsParts.push(`防+${item.ac}`);
            
            // ボーナス効果
            if(equipObj.bonus && Object.keys(equipObj.bonus).length > 0) {
                statsParts.push(getBonusString(equipObj)); // 既存関数を利用
            }
            itemStats = statsParts.join(' ');
        }

        // カードHTML
        html += `
        <div class="equip-slot-card" onclick="equipSlot('${slotKey}')" style="border-left-color:${def.color};">
            <div class="slot-icon-box" style="color:${isEmpty ? '#555' : def.color};">
                ${def.icon}
            </div>
            <div class="slot-info">
                <div class="slot-label" style="color:${def.color};">${def.label}</div>
                <div class="slot-item-name ${styleClass}">${itemName}</div>
                ${!isEmpty ? `<div class="slot-item-stats">${itemStats}</div>` : ''}
            </div>
            <div style="color:#666; font-size:0.8em;">▶</div>
        </div>
        `;
    }
    
    html += `</div>`; // container close
    
    showSubMenu(html, "装備変更"); 

    document.querySelector('#sub-menu-overlay .screen-box').classList.add('tall-mode');
}
function equipSlot(slot) { 
    const p = party[templeTargetIndex]; 
    const job = jobData[p.jobId]; 
    const slotDef = EQUIP_SLOTS_DEF[slot];

    // インベントリから装備可能な候補を抽出
    const candidates = partyInventory.map((item, index) => ({item, index}))
        .filter(wrapper => {
            const obj = wrapper.item;
            if(typeof obj === 'string') return false; // 消耗品は除外
            
            const itDef = itemData[obj.itemId];
            
            // スロットタイプの一致確認
            let typeMatch = false; 
            if(slot==='weapon' && itDef.type==='weapon') typeMatch=true; 
            if(slot==='armor' && itDef.type==='armor') typeMatch=true; 
            if(slot==='shield' && itDef.type==='shield') typeMatch=true; 
            if(slot==='helm' && itDef.type==='helm') typeMatch=true; 
            if(slot==='acc' && itDef.type==='accessory') typeMatch=true; 
            
            // 職業装備可能チェック
            return typeMatch && job.canEquip.includes(itDef.subType); 
        });

    let html = `
    <div style="padding:5px; margin-bottom:10px; border-bottom:1px solid #444; color:#aaa; font-size:0.9em;">
        ${slotDef.icon} ${slotDef.name} を選択中
    </div>
    `;

    // 「外す」ボタン
    html += `
    <button class="btn equip-candidate-btn" onclick="doEquip(-1, '${slot}')" style="justify-content:center !important; border-color:#666;">
        <span style="color:#aaa;">🚫 装備を外す</span>
    </button>
    `;
    
    if(candidates.length === 0) {
        html += `<div style="color:#666; padding:20px; text-align:center;">装備可能なアイテムがありません</div>`;
    } else {
        html += candidates.map(wrapper => {
            const obj = wrapper.item;
            const idx = wrapper.index;
            const itDef = itemData[obj.itemId];
            const bonusStr = getBonusString(obj);
            
            // アイコン取得（武器なら種類別アイコン）
            const icon = getItemTypeIcon(itDef) || slotDef.icon;
            
            let powerStr = ""; 
            if(itDef.power) powerStr += ` <span style="color:#f88">攻+${itDef.power}</span>`; 
            if(itDef.ac) powerStr += ` <span style="color:#88f">防+${itDef.ac}</span>`; 
            
            return `
            <button class="btn equip-candidate-btn" onclick="doEquip(${idx}, '${slot}')">
                <div class="equip-candidate-info">
                    <div style="font-weight:bold; color:#eee;">${icon} ${itDef.name}</div>
                    <div class="equip-candidate-stats">${powerStr} ${bonusStr}</div>
                </div>
                <div style="font-size:0.8em; color:#ffd700;">装備</div>
            </button>`;
        }).join('');
    }
    
    showSubMenu(html, "アイテム選択");
    document.querySelector('#sub-menu-overlay .screen-box').classList.add('tall-mode');
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
// ★改修: アイテム対象選択をリッチ表示に
function selectItemTarget(itemId) { 
    const it = itemData[itemId]; 
    if(it.type !== 'consumable') { 
        alert(`これは${it.name}です。装備メニューから装備してください。`); 
        return; 
    } 
    
    // 戦闘中の場合
    if(battleSpellMode === 'item') { 
        document.getElementById('sub-menu-overlay').style.display='none'; 
        toggleControls('target'); 
        ['btn-target-0','btn-target-1','btn-target-2','btn-target-3'].forEach((id,i) => { 
            if(party[i]) {
                document.getElementById(id).innerText = `${party[i].name}`; 
                document.getElementById(id).onclick = () => executeBattleItem(itemId, i); 
            } else {
                document.getElementById(id).style.display = 'none';
            }
        }); 
        return; 
    } 
    
    if(it.effect === 'warp') { useItem(itemId, null); return; } 
    
    const html = party.map((p, i) => {
        const hpColor = p.hp < p.maxHp * 0.3 ? "#f55" : (p.hp < p.maxHp ? "#ffeb3b" : "#8f8");
        return `
        <button class="btn char-select-btn" onclick="useItem('${itemId}', ${i})">
            <img src="${p.img}" class="char-select-icon">
            <div class="char-select-info">
                <div class="char-select-name">${p.name}</div>
                <div class="char-select-status">
                    HP: <span style="color:${hpColor}">${p.hp}/${p.maxHp}</span>
                    <span style="font-size:0.9em; margin-left:5px;">${p.status !== 'normal' ? '状態:'+STATUS_INFO[p.status].name : ''}</span>
                </div>
            </div>
        </button>`;
    }).join('');

    showSubMenu(html, "誰に使う？"); 
}
function useItem(itemId, targetIdx) { const item = itemData[itemId]; const invIdx = partyInventory.indexOf(itemId); if(invIdx > -1) partyInventory.splice(invIdx, 1); if(item.effect === 'warp') { alert("光に包まれた！"); closeSubMenu(); closeCamp(); returnToTown(true); return; } const t = party[targetIdx]; if(item.effect === 'heal') { t.hp += item.power; if(t.hp > t.maxHp) t.hp = t.maxHp; alert(`${t.name}は回復した`); } else if(item.effect === 'curePoison') { if(t.status === 'poison') { t.status='normal'; alert("毒が消えた"); } else alert("効果がなかった"); } else if(item.effect === 'curePara') { if(t.status === 'paralyze') { t.status='normal'; alert("麻痺が治った"); } else alert("効果がなかった"); } if(document.getElementById('dungeon-scene').style.display === 'flex') updateDungeonUI(); else updateTownStatus(); openItemMenu(); }
// game.js の showSubMenu 関数を探して、以下のように修正（tall-modeのリセットを追加）してください
function showSubMenu(html, title) { 
    // ★追加: 画面を開く前に、拡張クラスをリセットする
    const box = document.querySelector('#sub-menu-overlay .screen-box');
    if(box) {
        box.classList.remove('wide-mode'); // 既存
        box.classList.remove('tall-mode'); // ★新規追加
    }

    document.getElementById('sub-menu-overlay').style.display='flex'; 
    document.getElementById('sub-menu-title').innerText = title; 
    document.getElementById('sub-menu-content').innerHTML = html; 
}
// ★既存関数を修正: 閉じるボタンの挙動に 'spell' モードを追加
function closeSubMenu() { 
    document.getElementById('sub-menu-overlay').style.display='none'; 
    
    // 戦闘中のアイテム選択からの戻り
    if(battleSpellMode === 'item') { 
        toggleControls('battle'); 
        battleSpellMode = null; 
        return;
    }
    
    // 戦闘中の呪文選択からの戻り
    if(battleSpellMode === 'spell') {
        toggleControls('battle');
        battleSpellMode = null;
        return;
    }

    // ダンジョン内での直接装備変更などからの戻り
    if(menuReturnTo === 'direct') {
        toggleControls('move'); 
        return;
    }

    // ★ここが重要: 神殿メニューへの戻り
    // これがないと、神殿に戻ろうとしたときにキャンプが開いてしまいます
    if(menuReturnTo === 'temple') {
        // 神殿画面は背景に表示されたままなので、オーバーレイを消すだけで何もしない
        return;
    }

    // 上記以外（通常時）はキャンプメニューに戻る
    document.getElementById('camp-overlay').style.display='flex'; 
}
// --- ★修正: ステータス画面での表示 ---
function openStatusMenu() { 
    document.getElementById('camp-overlay').style.display = 'none'; 
    document.getElementById('status-scene').style.display = 'flex'; 
    const con = document.getElementById('status-content'); con.innerHTML = ''; 
    
    party.forEach(p => { 
        // ... (装備・ステータス表示部分は維持) ...
        let w = getEquipString(p.equips.weapon); 
        let a = getEquipString(p.equips.armor); 
        let s = getEquipString(p.equips.shield); 
        let h = getEquipString(p.equips.helm); 
        let ac = getEquipString(p.equips.acc); 
        
        let nextReq = (p.level >= 20) ? 0 : (p.level * 50) - p.exp; 
        if (nextReq < 0) nextReq = 0; 

        // ステータス表示ロジック (省略せず維持してください)
        let bonuses = { str:0, int:0, pie:0, vit:0, agi:0, luc:0 };
        for(let slot in p.equips) {
            const eq = p.equips[slot];
            if(eq && eq.bonus) {
                for(let k in bonuses) if(eq.bonus[k]) bonuses[k] += eq.bonus[k];
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

        // --- ★修正箇所: 習得リストを魔法と特技に分ける ---
        let spellListHtml = ""; 
        const magicList = [];
        const skillList = [];

        for(let k in p.spells) { 
            const sp = p.spells[k]; 
            if(sp.max > 0) {
                if (isPhysicalSkill(sp)) skillList.push(sp);
                else magicList.push(sp);
            }
        }

        const renderTags = (list, label) => {
            if (list.length === 0) return "";
            let res = `<div style="font-size:0.8em; color:#aaa; margin-top:3px;">${label}:</div><div style="display:flex; flex-wrap:wrap; gap:5px;">`;
            list.forEach(sp => {
                let icon = isPhysicalSkill(sp) ? (ELEM_ICONS[sp.element]||"⚔️") : (ELEM_ICONS[sp.element]||"");
                res += `<span style="background:#333; padding:2px 6px; border-radius:4px; font-size:0.8em; border:1px solid #555;">${icon}${sp.name} <span style="color:#8ff;">${sp.current}/${sp.max}</span></span>`;
            });
            res += `</div>`;
            return res;
        };

        if (magicList.length > 0 || skillList.length > 0) {
            spellListHtml = `<div style="margin-top:8px; border-top:1px dashed #444; padding-top:5px;">`;
            spellListHtml += renderTags(magicList, "魔法");
            spellListHtml += renderTags(skillList, "特技");
            spellListHtml += `</div>`;
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
            <div style="font-size:0.8em; margin-top:5px; color:#88ff88;">次のレベルまで: ${nextReq} EXP</div>
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
    
    // minFloor を考慮して敵をフィルタリング
    // 定義に minFloor が無い敵は全階層で出現
    // minFloor がある敵は、現在の階層(currentFloor)がそれ以上なら出現
    const validEnemies = d.enemies.filter(e => {
        return !e.minFloor || currentFloor >= e.minFloor;
    });

    if(validEnemies.length === 0) return; 

    // ★修正: 出現数を 1～3匹 に変更
    // Math.random() * 3 で 0, 1, 2 のいずれかになり、+1 して 1, 2, 3 になります
    const count = Math.floor(Math.random() * 3) + 1; 

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
        
        // 攻撃力・防御力の定義チェックと補正
        let enemyAtk = tpl.atk;
        if (!enemyAtk) {
            // 定義忘れ防止用のフォールバック計算式
            enemyAtk = 10 + (currentDungeonId * 20); 
        }
        
        let enemyDef = tpl.def;
        if (enemyDef === undefined) {
            // 防御が無ければ素早さベース
            enemyDef = Math.floor((tpl.agi || 10) / 2);
        }

        enemyList.push({ 
            ...tpl, 
            name: nm, 
            maxHp: tpl.hp, 
            hp: tpl.hp,
            atk: enemyAtk,
            def: enemyDef,
            isBoss: false, 
            id: i, 
            isEnemy: true 
        });
    }
    
    setupBattle(enemyList);
    log("魔物が現れた！");
}

function startBossBattle() { 
    const d = dungeonData[currentDungeonId];
    const boss = d.boss;
    log(`${boss.name}が現れた！`);
    // ★修正: isEnemy: true を追加しました
    setupBattle([{ ...boss, maxHp: boss.hp, isBoss: true, id: 0, isEnemy: true }]);
}
function setupBattle(enemyList) { 
    isBattle = true; 
    enemies = enemyList;
    
    // ★修正: 敵のステータス(攻撃力・防御力)を以前のバランスに合わせて自動計算
    enemies.forEach(e => {
        // 攻撃力が未定義の場合のみ自動計算
        if (e.atk === undefined) {
            let baseDmg = 5 + (currentDungeonId * currentDungeonId * 4);
            if (e.isBoss) baseDmg += 20; 
            e.atk = Math.floor(baseDmg * 2.2);
        }
        
        // 防御力が未定義の場合のみ自動計算
        if (e.def === undefined) {
            e.def = Math.floor((e.agi || 10) / 2);
        }
    });
    
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
        
        // ★修正: 3匹の場合の配置ロジックを追加
        let leftPos = '50%';
        if (enemies.length === 2) {
            // 2匹の場合: 左右に振り分け (35%, 65%)
            leftPos = (idx === 0) ? '35%' : '65%';
        } else if (enemies.length === 3) {
            // 3匹の場合: 左・中央・右 に配置 (25%, 50%, 75%)
            if (idx === 0) leftPos = '25%';
            else if (idx === 1) leftPos = '50%';
            else leftPos = '75%';
        }
        
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
            img.style.width = isMobile ? '140px' : '200px';   
            img.style.height = isMobile ? '168px' : '240px'; 
        } else {
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

 
    // 1. 入力をロックする
    isBattleInputBlocked = true;
    
    // 2. ボタンエリアにロック用クラスを付与（見た目を半透明に）
    const battleControls = document.getElementById('battle-controls');
    battleControls.classList.add('input-locked');

    // 3. 入力フェーズ開始（表示切り替え）
    startInputPhase(true); 

    // 4. 一定時間後にロック解除 (例: 800ミリ秒)
    setTimeout(() => {
        isBattleInputBlocked = false;
        battleControls.classList.remove('input-locked');
    }, 800); 
}
function updateEnemyStatName() {
    const container = document.getElementById('enemy-stat');
    const aliveEnemies = enemies.filter(e => e.hp > 0);
    if (aliveEnemies.length === 0) { container.style.visibility = 'hidden'; return; }
    let html = aliveEnemies.map(e => `<div style="font-size:0.85em; margin-bottom:2px;">👾 ${ELEM_ICONS[e.elem]||""} ${e.name}</div>`).join('');
    container.innerHTML = html;
    container.style.visibility = 'visible';
}

// --- 戦闘変数 (追加) ---
let turnQueue = []; // 行動順リスト

// --- 戦闘開始 ---
function startInputPhase(isFirst=false) { 
    if(!isFirst) activeMemberIndex++; 
    
    // 全員入力完了したら実行フェーズへ
    if(activeMemberIndex >= party.length) { 
        startTurnExecution(); 
        return; 
    } 

    const p = party[activeMemberIndex]; 
    
    // ★修正1: STATUS.CONFUSE (混乱) も入力スキップ対象に追加しました
    const skipCommand = !p.alive || [STATUS.STONE, STATUS.SLEEP, STATUS.PARALYZE, STATUS.STUN, STATUS.CONFUSE].includes(p.status);
    
    if(skipCommand) { 
        // 混乱中(CONFUSE)は勝手に行動
        if (p.status === STATUS.CONFUSE) {
            actionQueue.push({ type: 'confused', actorIndex: activeMemberIndex, name: p.name, agi: p.stats.agi + p.level });
        } else {
            // その他行動不能系
            actionQueue.push({ type: 'skip', actorIndex: activeMemberIndex, name: p.name, agi: p.stats.agi + p.level });
        }
        
        // 次のキャラへ（再帰呼び出し）
        // setTimeoutを入れることで、再帰が深くなりすぎるのを防ぎつつUI更新のタイミングを作ります
        setTimeout(() => startInputPhase(), 0);
        return; 
    }
    
    // 通常のコマンド入力
    p.isDefending = false; 
    document.getElementById('battle-msg').innerText = `▶ ${p.name} のコマンド`; 

    updateDungeonUI();

    toggleControls('battle'); 
    
    // 戻るボタン制御
    const backBtn = document.getElementById('btn-battle-back');
    if(backBtn) backBtn.style.display = (activeMemberIndex > 0) ? 'flex' : 'none';
}
// --- ターン実行フェーズ (行動順決定) ---
function startTurnExecution() {
    toggleControls('none');
    document.getElementById('battle-msg').innerText = "⚔️ 戦闘開始...";

    turnQueue = [];

    // 1. 敵の行動を決定
    enemies.forEach((e, i) => {
        if(e.hp <= 0) return;
        
        if ([STATUS.STONE, STATUS.SLEEP, STATUS.PARALYZE, STATUS.STUN].includes(e.status)) {
             turnQueue.push({ type: 'skip', isEnemy: true, enemyIndex: i, name: e.name, agi: e.agi, status: e.status });
             return;
        }

        const act = decideEnemyAction(e);
        turnQueue.push({ 
            ...act, 
            isEnemy: true, 
            enemyIndex: i, 
            name: e.name, 
            agi: e.agi, 
            luc: e.luc
        });
    });

    // 2. 味方の行動をキューに追加
    actionQueue.forEach(act => {
        const p = party[act.actorIndex];
        
        // ★修正: レベルによる行動速度補正を追加 (Lv * 1.5)
        // これにより、素早さに振らなくてもレベルが上がれば雑魚敵には先制しやすくなる
        let levelBonus = Math.floor(p.level * 1.5);
        let finalAgi = p.stats.agi + levelBonus;

        // 装備ボーナスの加算
        for(let s in p.equips) {
             if(p.equips[s] && p.equips[s].bonus && p.equips[s].bonus.agi) finalAgi += p.equips[s].bonus.agi;
        }

        turnQueue.push({
            ...act,
            isEnemy: false,
            agi: finalAgi,
            luc: p.stats.luc + (p.equips.acc && p.equips.acc.bonus ? (p.equips.acc.bonus.luc||0) : 0)
        });
    });

    // 3. 行動順のソート (AGI + ランダム揺らぎ)
    turnQueue.sort((a, b) => {
        const speedA = a.agi * (0.9 + Math.random() * 0.2); 
        const speedB = b.agi * (0.9 + Math.random() * 0.2);
        
        if(a.type === 'defend' && b.type !== 'defend') return -1;
        if(b.type === 'defend' && a.type !== 'defend') return 1;

        return speedB - speedA; 
    });

    // 4. 実行開始
    processTurnQueue();
}
function decideEnemyAction(enemy) {
    // デフォルトは攻撃
    let type = 'attack';
    let spellKey = null;

    // 行動パターンの抽選
    if(enemy.actions && enemy.actions.length > 0) {
        const actName = enemy.actions[Math.floor(Math.random() * enemy.actions.length)];
        
        if(actName === 'attack') {
            type = 'attack';
        } else if (spellData[actName]) {
            // 魔法・スキル名が一致する場合
            type = 'spell';
            spellKey = actName;
        } else {
            // 特殊行動（既存のコードにある "charge" など）
            // ここでは簡易的に攻撃として扱いつつ、ログで分岐させても良いですが
            // 本格的には enemy.actions に入る文字列を全て spellData に登録するか、
            // ここで分岐処理を書く必要があります。
            // 今回は spellData に sleep, panic などを追加したのでそれを使います。
        }
    }

    // ターゲット決定
    let targetIdx = -1;

    // ★追加: 挑発(Provoke)状態のチェック
    // provokedプロパティがあり、かつ挑発した相手が生きていれば強制ターゲット
    if (enemy.provoked && enemy.provoked.turns > 0) {
        const provokerIdx = enemy.provoked.targetIndex;
        const provoker = party[provokerIdx];
        
        // 挑発者が存在し、生存しており、かつ石化していない場合のみ有効
        if (provoker && provoker.alive && provoker.status !== STATUS.STONE) {
            targetIdx = provokerIdx;
        }
    }

    // ターゲットがまだ決まっていない（挑発されていない、または挑発者が死んでいる）場合はランダム
    if (targetIdx === -1) {
        // 生存しているパーティメンバーから選ぶ
        const livingMembers = party.filter(p => p.alive && p.status !== STATUS.STONE); 
        if(livingMembers.length === 0) return { type: 'wait' };
        
        targetIdx = party.indexOf(livingMembers[Math.floor(Math.random() * livingMembers.length)]);
    }

    return { type, spellKey, targetIndex: targetIdx };
}

// --- ターンキュー処理 (1つずつ実行) ---
function processTurnQueue() {
    // 終了判定
    if(turnQueue.length === 0) {
        endTurnProcessing();
        return;
    }

    // 戦闘終了判定
    if(party.every(p => !p.alive || p.status === STATUS.STONE)) { gameOver(); return; }
    if(enemies.every(e => e.hp <= 0)) { checkWin(); return; }

    const act = turnQueue.shift();
    
    // 行動主体の取得
    let actor = null;

    if(act.isEnemy) {
        actor = enemies[act.enemyIndex];
    } else {
        actor = party[act.actorIndex];
    }

    // 死んでいる、または石化ならスキップ
    if(!actor || actor.hp <= 0 || actor.status === STATUS.STONE) {
        processTurnQueue();
        return;
    }

    // --- 状態異常による行動阻害チェック ---
    
    // 麻痺: 一定確率で動けない
    if(actor.status === STATUS.PARALYZE) {
        log(`${actor.name}は麻痺して動けない！`);
        updateDungeonUI();
        setTimeout(processTurnQueue, 800);
        return;
    }

    // 睡眠
    if(actor.status === STATUS.SLEEP) {
        log(`${actor.name}は眠っている...`);
        updateDungeonUI();
        setTimeout(processTurnQueue, 800);
        return;
    }

    // 気絶 (1ターン休み)
    if(actor.status === STATUS.STUN) {
        log(`${actor.name}は気絶している！`);
        updateDungeonUI();
        setTimeout(processTurnQueue, 800);
        return;
    }

    // 混乱 (行動内容を書き換え)
    if(actor.status === STATUS.CONFUSE) {
        log(`${actor.name}は混乱している！`);
        const allTargets = [...party, ...enemies].filter(c => c.hp > 0 && c.status !== STATUS.DEAD);
        const randomTarget = allTargets[Math.floor(Math.random() * allTargets.length)];
        
        executeAction({
            type: 'attack',
            actor: actor,
            target: randomTarget,
            isConfused: true
        });
        return;
    }

    // --- 通常行動実行 ---
    
    // ★追加: 敵の行動時、挑発(Provoke)状態ならターゲットを強制変更
    // (ターン開始時の決定よりも、実行直前の挑発状態を優先する)
    if (act.isEnemy && actor.provoked && actor.provoked.turns > 0) {
        const provoker = party[actor.provoked.targetIndex];
        // 挑発者が生存しており、石化していなければターゲットを上書き
        if (provoker && provoker.alive && provoker.status !== STATUS.STONE) {
            act.targetIndex = actor.provoked.targetIndex;
        }
    }

    // ターゲットの再確認・取得
    let target = null;
    if(act.targetIndex !== undefined && act.targetIndex !== -1) {
        if(act.isEnemy) {
             // 敵の行動の場合、ターゲットはパーティ
             target = party[act.targetIndex];
        } else {
             // 味方の行動の場合、ターゲットは敵
             // (回復・補助系以外は敵をターゲットにする)
             if(act.type !== 'heal' && act.type !== 'buff' && act.type !== 'revive' && act.type !== 'cure') { 
                 target = enemies[act.targetIndex];
             } else { 
                 target = party[act.targetIndex];
             }
        }
    }

    // ターゲット生存チェック (死んでたら生きている別の敵/味方を狙う)
    if(!target || target.hp <= 0) {
        if(act.isEnemy) target = getRandomTarget(party); // 味方からランダム
        else if(act.type==='attack' || act.type==='spell' || act.type==='phys' || act.type==='skill_provoke') target = getRandomTarget(enemies); // 敵からランダム
    }

    // 行動実行
    executeAction({ ...act, actor: actor, target: target });
}


function executeAction({ type, actor, target, spellKey, itemId, isConfused }) {
    let msg = "";
    let delay = 1000;
    
    const isEnemyAction = actor.isEnemy;

    // バフ・デバフの初期化（未定義の場合）
    if(!actor.buffs) actor.buffs = {atk:0, def:0};

    // --- 防御 ---
    if (type === 'defend') {
        actor.isDefending = true;
        log(`${actor.name}は身を守っている。`, isEnemyAction);
    } 
    // --- 逃走 ---
    else if (type === 'run') {
        if (Math.random() < 0.5) { 
            log(`${actor.name}は逃げ出した！`, isEnemyAction);
            endBattle(); return;
        } else {
            log(`${actor.name}は逃げられなかった！`, isEnemyAction);
        }
    }
    // --- 通常攻撃 ---
    else if (type === 'attack') {
        if(!target) { log("攻撃対象がいない！"); setTimeout(processTurnQueue, 500); return; }
        
        // チャージ状態の消費（威力3倍）は calculateDamage 内で参照するが、
        // 攻撃実行後にフラグを落とす必要があるためここでチェック
        const isCharged = (actor.buffs.charge === true);

        // 物理属性エフェクト判定
        const physType = getWeaponPhysType(actor); 
        const vfxName = (physType === 'none') ? 'blunt' : physType;

        const vfxIdx = getTargetVfxIndex(target);
        if (vfxIdx !== null) playVfx(vfxName, vfxIdx); 
        else playVfx('damage'); 
        
        // クリティカル判定 (「構え」中なら大幅UP)
        let critRate = (actor.stats ? actor.stats.luc : actor.luc) * 0.005;
        if(actor.buffs && actor.buffs.stance > 0) critRate += 0.5; // ★構え: +50%
        const isCrit = Math.random() < critRate;
        
        // 属性相性倍率
        let mod = 1.0;
        if (target.resist) {
            if (target.resist[physType] !== undefined) mod *= target.resist[physType];
            if (target.resist.phys !== undefined) mod *= target.resist.phys;
        }

        let dmg = calculateDamage(actor, target, mod, isCrit);
        
        msg = `${actor.name}の攻撃！`;
        if(isCharged) msg += " (チャージ)";
        if(isCrit) msg += " 会心の一撃！";
        
        log(msg, isEnemyAction);
        
        // 弱点・耐性のヒントログ
        if (!isCrit && mod > 1.0) log(`(弱点をついた！)`, isEnemyAction);
        if (mod < 1.0 && mod > 0) log(`(効きが悪いようだ...)`, isEnemyAction);
        if (mod === 0) log(`(全く効かない！)`, isEnemyAction);
        
        takeDamage(target, dmg, actor.elem || ELEM.NONE, isCrit);
        
        // チャージ解除
        if(isCharged) actor.buffs.charge = false;

        // 追加効果判定
        if(actor.effect && actor.rate && target.hp > 0 && target.status === STATUS.NORMAL) {
            if(Math.random() < actor.rate) {
                applyStatusEffect(target, actor.effect);
            }
        }
    }
    // --- 呪文・スキル ---
    else if (type === 'spell') {
        const spell = actor.spells ? actor.spells[spellKey] : spellData[spellKey]; 
        
        // MP(回数)消費
        // ★おまかせ(MagicBoost)中は消費2倍
        let cost = 1;
        if (actor.buffs && actor.buffs.magicBoost > 0) cost = 2;

        if(actor.spells && actor.spells[spellKey]) {
            actor.spells[spellKey].current = Math.max(0, actor.spells[spellKey].current - cost);
        }

        log(`${actor.name}は${spell.name}を唱えた！`, isEnemyAction);
        
        // (A) バフ・特殊スキル (★新規追加)
        if (spell.type === 'buff') {
            playVfx('heal'); // 汎用バフエフェクト（回復と同じで代用）
            const targets = (spell.target === 'all') ? party : [actor]; // 味方用バフ前提

            targets.forEach(t => {
                if(!t.alive) return;
                
                if(!t.buffs) t.buffs = {atk:0, def:0}; // 初期化

                // 1. マジックシールド (被ダメ軽減)
                if(spell.effect === 'magicShield') {
                    t.buffs.magicShield = spell.turns;
                    log(`${t.name}は魔法の盾に守られた！`);
                }
                // 2. バーサーク (攻撃UP・防御DOWN)
                else if(spell.effect === 'berserk') {
                    t.buffs.berserk = spell.turns;
                    playVfx('fire', getTargetVfxIndex(t)); // 怒りの炎演出
                    log(`${t.name}は怒り狂った！(攻撃UP/防御DOWN)`);
                }
                // 3. おまかせ (魔力覚醒)
                else if(spell.effect === 'magicBoost') {
                    t.buffs.magicBoost = spell.turns;
                    log(`${t.name}は魔力を充填した！(威力UP/消費増)`);
                }
                // 4. チャージ (次ターン3倍)
                else if(spell.effect === 'charge') {
                    t.buffs.charge = true;
                    playVfx('light', getTargetVfxIndex(t));
                    log(`${t.name}は力を溜めている...`);
                }
                // 5. 構え (クリティカルUP)
                else if(spell.effect === 'stance') {
                    t.buffs.stance = spell.turns;
                    log(`${t.name}は精神を研ぎ澄ませた！(会心率UP)`);
                }
                // 6. 分身の術 (無効化)
                else if(spell.effect === 'bunshin') {
                    t.buffs.bunshin = spell.val; // 回数
                    playVfx('wind', getTargetVfxIndex(t));
                    log(`${t.name}の残像が現れた！(3回無効)`);
                }
                // 既存バフ
                else if(spell.effect === 'defUp') {
                    t.buffs.def = spell.turns;
                    log(`${t.name}の防御力が上がった。`);
                } else if(spell.effect === 'atkUp') {
                    t.buffs.atk = spell.turns;
                    log(`${t.name}の攻撃力が上がった。`);
                }
            });
        }
        // (B) 回復・治療魔法
        else if(spell.type === 'heal' || spell.type === 'cure') {
            playVfx('heal');
            const targets = (spell.target === 'all') ? party : [target];
            targets.forEach(t => {
                if(spell.type === 'heal') {
                     if(t.alive) {
                        let rec = spell.power + (actor.stats ? actor.stats.pie : 20);
                        // ★おまかせ(MagicBoost)中は回復量もアップさせるならここ
                        if(actor.buffs && actor.buffs.magicBoost > 0) rec = Math.floor(rec * 1.5);

                        t.hp = Math.min(t.maxHp, t.hp + rec);
                        log(`${t.name}のHPが回復した。`, isEnemyAction);
                     }
                } else if(spell.type === 'cure') {
                    // ... (既存処理省略なし) ...
                    if(spell.effect === 'poison' && t.status === STATUS.POISON) { t.status = STATUS.NORMAL; log(`${t.name}の毒が消えた。`, isEnemyAction); }
                    else if(spell.effect === 'paralyze' && t.status === STATUS.PARALYZE) { t.status = STATUS.NORMAL; log(`${t.name}の麻痺が治った。`, isEnemyAction); }
                    else if(spell.effect === 'sleep' && t.status === STATUS.SLEEP) { t.status = STATUS.NORMAL; log(`${t.name}が目を覚ました。`, isEnemyAction); }
                    else if(spell.effect === 'confuse' && t.status === STATUS.CONFUSE) { t.status = STATUS.NORMAL; log(`${t.name}は正気に戻った。`, isEnemyAction); }
                }
            });
        }
        // (C) 挑発スキル
        else if (spell.type === 'skill_provoke') {
            const tIdx = getTargetVfxIndex(target);
            if (tIdx !== null) playVfx('dark', tIdx); 

            if (target && target.hp > 0) {
                const provokerIdx = party.indexOf(actor);
                if (provokerIdx !== -1) {
                    target.provoked = { targetIndex: provokerIdx, turns: spell.turns };
                    log(`${target.name}は激怒した！(${actor.name}を狙っている)`, isEnemyAction);
                } else {
                    log("しかし効果がなかった。");
                }
            } else {
                log("しかし効果がなかった。");
            }
        }
        // (D) 弱体魔法
        else if (spell.type === 'enfeeble') { 
             playVfx('dark');
             const targets = (spell.target === 'all') ? (actor.isEnemy ? party : enemies) : [target];
             targets.forEach(t => {
                 if(t.hp > 0) {
                     let resist = 1.0;
                     if(t.resist && t.resist[spell.status]) resist = t.resist[spell.status];
                     if(!t.isEnemy) {
                         const luck = t.stats.luc;
                         resist = Math.max(0.1, 1.0 - (luck * 0.02)); 
                     }
                     if(Math.random() < (spell.rate * resist)) {
                         applyStatusEffect(t, spell.status);
                     } else {
                         log(`${t.name}には効かなかった！`, isEnemyAction);
                     }
                 }
             });
        }
        // (E) 物理スキル
        else if (spell.type === 'phys') {
             // チャージ状態確認
             const isCharged = (actor.buffs && actor.buffs.charge === true);
             
             const targets = (spell.target === 'all') ? (actor.isEnemy ? party : enemies) : [target];
             let vfxName = 'slash';
             if(spell.element === ELEM.EARTH) vfxName = 'earth';
             
             targets.forEach(t => {
                 const tIdx = getTargetVfxIndex(t);
                 if (tIdx !== null) playVfx(vfxName, tIdx);
                 else if (actor.isEnemy) playVfx('damage'); 

                 if(t.hp > 0) {
                     // チャージなら倍率3倍
                     let mult = spell.mult;
                     if (isCharged) mult *= 3.0;

                     // クリティカル判定 (構え適用)
                     let critRate = (actor.stats ? actor.stats.luc : actor.luc) * 0.005;
                     if(actor.buffs && actor.buffs.stance > 0) critRate += 0.5;
                     const isCrit = Math.random() < critRate;

                     let dmg = calculateDamage(actor, t, mult, isCrit);
                     takeDamage(t, dmg, spell.element || ELEM.NONE, isCrit);
                 }
             });
             // チャージ消費
             if(isCharged) actor.buffs.charge = false;
        }
        // (F) 攻撃魔法 (火・水など)
        else { 
             if (spell.target !== 'all' && !target) {
                 log("しかし効果がなかった。");
                 updateDungeonUI();
                 setTimeout(processTurnQueue, 500);
                 return;
             }

             const targets = (spell.target === 'all') ? (actor.isEnemy ? party : enemies) : [target];
             let vfxName = ELEM_VFX_MAP[spell.element] || 'fire';

             targets.forEach(t => {
                 const tIdx = getTargetVfxIndex(t);
                 if(tIdx !== null) playVfx(vfxName, tIdx);
                 else if(spell.target === 'all' && actor.isEnemy) playVfx(vfxName); 

                 if(t && t.hp > 0) {
                     let baseDmg = spell.power + (actor.stats ? actor.stats.int : actor.int || 20);
                     
                     // ★おまかせ(MagicBoost)適用
                     if(actor.buffs && actor.buffs.magicBoost > 0) {
                         baseDmg = Math.floor(baseDmg * 2.0); // 威力大幅アップ
                     }

                     let mod = getElementMultiplier(spell.element, t.elem);
                     let dmg = Math.floor(baseDmg * mod);
                     takeDamage(t, dmg, spell.element);
                 }
             });
        }
    }
    // --- アイテム使用 ---
    else if (type === 'item') {
        const item = itemData[itemId];
        log(`${actor.name}は${item.name}を使った。`, isEnemyAction);
        playVfx('heal');
        
        if(item.effect === 'heal') {
            target.hp = Math.min(target.maxHp, target.hp + item.power);
            log(`${target.name}のHPが回復した。`, isEnemyAction);
        } else if(item.effect === 'curePoison' && target.status === STATUS.POISON) {
            target.status = STATUS.NORMAL; log(`${target.name}の毒が消えた。`, isEnemyAction);
        } else if(item.effect === 'cureSleep' && target.status === STATUS.SLEEP) {
            target.status = STATUS.NORMAL; log(`${target.name}が目を覚ました。`, isEnemyAction);
        } else if(item.effect === 'cureConfuse' && target.status === STATUS.CONFUSE) {
            target.status = STATUS.NORMAL; log(`${target.name}は正気に戻った。`, isEnemyAction);
        } else if(item.effect === 'cureStone' && target.status === STATUS.STONE) {
            target.status = STATUS.NORMAL; log(`${target.name}の石化が解けた。`, isEnemyAction);
        } else if(item.effect === 'cureAll') {
            target.status = STATUS.NORMAL; log(`${target.name}の状態異常が回復した。`, isEnemyAction);
        } else {
            log("しかし効果がなかった。");
        }
    }

    updateDungeonUI();
    setTimeout(processTurnQueue, delay);
}


// --- 属性相性計算 (削除されていたため復元) ---
function getElementMultiplier(atkElem, defElem) {
    if (atkElem === ELEM.NONE) return 1.0;
    
    // 4属性の相性 (火 > 風 > 土 > 水 > 火)
    if ((atkElem === ELEM.FIRE && defElem === ELEM.WIND) ||
        (atkElem === ELEM.WIND && defElem === ELEM.EARTH) ||
        (atkElem === ELEM.EARTH && defElem === ELEM.WATER) ||
        (atkElem === ELEM.WATER && defElem === ELEM.FIRE)) {
        return 1.5; // 弱点
    }
    
    // 光と闇の相性 (互いに弱点)
    if ((atkElem === ELEM.LIGHT && defElem === ELEM.DARK) ||
        (atkElem === ELEM.DARK && defElem === ELEM.LIGHT)) {
        return 1.5; // 弱点
    }
    
    return 1.0;
}

// --- ダメージ計算 (バーサーク・チャージ等の補正を追加) ---
function calculateDamage(attacker, defender, multiplier=1.0, isCrit=false) {
    let atk = attacker.atk || (attacker.stats ? attacker.stats.str : 10);
    
    if(!attacker.buffs) attacker.buffs = {};
    if(!defender.buffs) defender.buffs = {};

    // 1. 攻撃側のバフ補正
    if(attacker.buffs.atk > 0) atk *= 1.5;
    
    // ★バーサーク: 攻撃力大幅アップ (2.0倍)
    if(attacker.buffs.berserk > 0) atk *= 2.0;

    // ★チャージ: 威力3倍 (multiplierに乗算済みならここは不要だが、念のため)
    // executeAction側で multiplier に反映させているのでここでは除外

    let def = defender.def || (defender.stats ? Math.floor(defender.stats.agi/2) : 0);
    
    // 2. 防御側のバフ補正
    if(defender.buffs.def > 0) def *= 1.5;

    // ★バーサーク: 防御力大幅ダウン (0.2倍)
    if(defender.buffs.berserk > 0) def *= 0.2;

    // 状態異常による防御低下
    if(defender.status === STATUS.SLEEP || defender.status === STATUS.STUN) {
        def = 0; 
    }
    
    // ダメージ式
    let base = (atk / 2) - (def / 4);
    if(base < 1) base = 1;
    
    let dmg = Math.floor(base * multiplier * (0.9 + Math.random() * 0.2));
    if(isCrit) dmg = Math.floor(dmg * 2.0); 
    
    if(defender.isDefending) dmg = Math.floor(dmg / 2);
    
    return Math.max(1, dmg);
}

function takeDamage(target, dmg, elem, isCrit=false) {
    if(!target.buffs) target.buffs = {};

    // ★分身の術: 回数がある限り無効化
    if(target.buffs.bunshin > 0) {
        target.buffs.bunshin--;
        log(`${target.name}は分身で攻撃をかわした！(残:${target.buffs.bunshin})`, !target.isEnemy);
        return; // ダメージ処理終了
    }

    // ★マジックシールド: 全ダメージ軽減 (例: 0.5倍)
    if(target.buffs.magicShield > 0) {
        dmg = Math.floor(dmg * 0.5);
    }

    target.hp -= dmg;
    let msg = `${target.name}に${dmg}のダメージ！`;
    if(isCrit) msg += " (会心)";
    
    const isPlayerDamage = !target.isEnemy;
    log(msg, isPlayerDamage);

    if(target.status === STATUS.SLEEP) {
        target.status = STATUS.NORMAL;
        log(`${target.name}は目を覚ました！`, isPlayerDamage);
    }

    if(target.hp <= 0) {
        target.hp = 0;
        target.alive = false;
        target.status = STATUS.DEAD;
        
        // バフ全解除
        target.buffs = {atk:0, def:0};

        if(target.isEnemy) {
            log(`${target.name}を倒した！`);
            const unit = document.getElementById(`enemy-unit-${target.id}`);
            if(unit) {
                unit.classList.remove('shake-enemy');
                void unit.offsetWidth; 
                unit.classList.add('enemy-die');
                setTimeout(() => {
                    unit.style.display = 'none';
                    unit.classList.remove('enemy-die'); 
                }, 600);
            }
        } else {
            log(`${target.name}は力尽きた...`, true);
        }
    }
}

// --- 状態異常付与 ---
function applyStatusEffect(target, statusType) {
    if(target.status === STATUS.DEAD || target.status === STATUS.STONE) return;
    
    // 耐性チェックなどは executeAction 内で済ませている前提
    target.status = statusType;
    const info = STATUS_INFO[statusType];
    log(`${target.name}は${info.name}になった！${info.icon}`);
}

// --- ターン終了処理 ---
function endTurnProcessing() {
    const allUnits = [...party, ...enemies];
    let msgList = [];

    allUnits.forEach(u => {
        if(u.hp <= 0 || u.status === STATUS.DEAD) return;

        // 毒
        if(u.status === STATUS.POISON) {
            let dmg = Math.floor(u.maxHp * 0.1);
            if(dmg < 1) dmg = 1;
            u.hp -= dmg;
            msgList.push(`${u.name}は毒に蝕まれている(${dmg}ダメ)`);
            if(u.hp <= 0) {
                u.hp = 0; u.alive = false; u.status = STATUS.DEAD;
                msgList.push(`${u.name}は力尽きた...`);
            }
        }

        // 自然回復
        if(u.status === STATUS.STUN) { u.status = STATUS.NORMAL; }
        else if(u.status === STATUS.SLEEP && Math.random() < 0.3) {
            u.status = STATUS.NORMAL; msgList.push(`${u.name}は目を覚ました。`);
        }
        else if(u.status === STATUS.CONFUSE && Math.random() < 0.3) {
            u.status = STATUS.NORMAL; msgList.push(`${u.name}は正気に戻った。`);
        }

        // --- バフ経過処理 (★新規追加) ---
        if(!u.buffs) u.buffs = {atk:0, def:0};

        // 汎用: 値が正の整数のものを1減らす (chargeなどフラグ型やbunshinなど回数型は除外)
        const turnBuffs = ['atk', 'def', 'magicShield', 'berserk', 'magicBoost', 'stance'];
        
        turnBuffs.forEach(key => {
            if(u.buffs[key] > 0) {
                u.buffs[key]--;
                if(u.buffs[key] === 0) {
                    // バフ切れメッセージ
                    let bName = "";
                    if(key==='magicShield') bName = "マジックシールド";
                    if(key==='berserk') bName = "バーサーク";
                    if(key==='magicBoost') bName = "魔力充填";
                    if(key==='stance') bName = "構え";
                    
                    if(bName) msgList.push(`${u.name}の${bName}が切れた。`);
                }
            }
        });

        // 挑発(Provoked)
        if (u.isEnemy && u.provoked) {
            u.provoked.turns--;
            if (u.provoked.turns <= 0) delete u.provoked;
        }
    });

    if(msgList.length > 0) {
        msgList.forEach(m => log(m));
        updateDungeonUI();
        setTimeout(() => { finishTurnAndNext(); }, 1000);
    } else {
        finishTurnAndNext();
    }
}

function finishTurnAndNext() {
    // 全滅判定など
    if(party.every(p => !p.alive || p.status === STATUS.STONE)) { gameOver(); return; }
    
    // 次のターンへ
    turnQueue = [];
    actionQueue = [];
    activeMemberIndex = 0;
    
    // 敵のターン終了処理(既存があれば)
    
    setTimeout(() => {
        startInputPhase(true); // 次のターンの入力開始
    }, 500);
}

function fight(act) { 
　　// ★追加: ロック中は入力を受け付けない
    if (isBattleInputBlocked) return;
    // ★修正2: 連打防止・整合性チェック
    // すでに現在のキャラの行動が決定済みなら、入力を受け付けない
    if (actionQueue.length > activeMemberIndex) return;

    const p = party[activeMemberIndex]; 
    
    if(act==='run') { 
        // 逃げる処理
        if(enemies.some(e=>e.isBoss)) {
            log("逃げられなかった！(ボス戦)");
            actionQueue = []; 
            startTurnExecution(); 
            return;
        }

        if(Math.random() < 0.8) { 
            log("逃げ切った！"); 
            endBattle(); 
            return; 
        } else { 
            log("逃げられなかった！"); 
            actionQueue = [];
            startTurnExecution(); 
            return; 
        } 
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
    battleSpellMode = 'spell';
    toggleControls('none'); 
    
    const p = party[activeMemberIndex];
    let html = "";
    
    // 習得済み呪文・特技を分類
    const magicList = [];
    const skillList = [];

    for(let key in p.spells) {
        const spell = p.spells[key];
        if(spell.max === 0) continue; // 未習得は除外
        
        if (isPhysicalSkill(spell)) {
            skillList.push({key, spell});
        } else {
            magicList.push({key, spell});
        }
    }

    // --- リスト生成用関数 ---
    const generateListHtml = (list, title) => {
        if (list.length === 0) return "";
        let sectionHtml = `<div style="grid-column:1/-1; color:#ffd700; border-bottom:1px solid #555; margin-top:10px; margin-bottom:5px; padding-left:5px; font-weight:bold;">${title}</div>`;
        
        list.forEach(item => {
            const { key, spell } = item;
            const canCast = spell.current > 0;
            
            // アイコン設定 (物理なら剣、魔法なら属性または杖)
            let icon = "";
            if (isPhysicalSkill(spell)) {
                icon = ELEM_ICONS[spell.element] || "⚔️"; // 物理はデフォルト剣
            } else {
                icon = ELEM_ICONS[spell.element] || "🪄"; // 魔法はデフォルト杖
            }

            const targetStr = spell.target === 'all' ? "全体" : "単体";
            let descText = spell.desc || "特殊効果";
            if(spell.power && spell.power > 0) descText += ` <span style="font-size:0.9em; color:#ffaaaa;">(威力:${spell.power})</span>`;
            if(spell.mult) descText += ` <span style="font-size:0.9em; color:#ffaaaa;">(倍率:${spell.mult}x)</span>`;

            const nameColor = canCast ? "#fff" : "#888";
            const bgStyle = canCast ? "" : "opacity: 0.6;";

            sectionHtml += `
            <div class="shop-item" onclick="${canCast ? `selectBattleSpell('${key}')` : ''}" style="${bgStyle}">
                <div class="shop-info" style="pointer-events:none; flex:1;">
                    <div class="shop-row">
                        <span class="shop-name" style="color:${nameColor}; font-size:1em;">
                            ${icon} ${spell.name}
                        </span>
                        <span class="shop-price" style="color:#8ff; font-family:monospace;">
                            残:${spell.current}
                        </span>
                    </div>
                    <div class="shop-desc" style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <span style="flex:1; margin-right:5px;">${descText}</span>
                        <span style="color:#aaa; white-space:nowrap;">[${targetStr}]</span>
                    </div>
                </div>
                <button class="btn shop-btn" ${!canCast ? 'disabled' : ''} style="min-width:60px; height:40px;">選択</button>
            </div>
            `;
        });
        return sectionHtml;
    };

    html += generateListHtml(magicList, "【 魔法 】");
    html += generateListHtml(skillList, "【 特技 】");
    
    if (html === "") {
        html = "<div style='padding:20px; text-align:center; color:#aaa;'>使える呪文・特技がありません</div>";
    }
    
    showSubMenu(html, `${p.name}の行動選択`);
}

// ★新規追加: リストから呪文を選んだ時の処理
function selectBattleSpell(spellKey) {
    // メニューを閉じる (ただし battleSpellMode はリセットせず、ターゲット選択へ移行)
    document.getElementById('sub-menu-overlay').style.display = 'none';
    
    // 既存の呪文準備処理を呼び出す (ターゲット選択ボタンの表示など)
    preCastSpell(spellKey);
}


function preCastSpell(spellKey) {
    const p = party[activeMemberIndex];
    const spell = p.spells[spellKey];
    if(spell.target === 'all' || spell.target === 'self') {
        actionQueue.push({type:'spell', spellKey:spellKey, actorIndex:activeMemberIndex, targetIndex:-1, name:p.name});
        startInputPhase();
    } else if (spell.type === 'heal' || spell.type === 'buff') {
        toggleControls('target'); 
        // ★ここを修正: 'btn-target-3' を追加
        ['btn-target-0','btn-target-1','btn-target-2','btn-target-3'].forEach((id,i) => { 
            if(party[i]) {
                document.getElementById(id).style.display = 'inline-block';
                document.getElementById(id).innerText=`${party[i].name}`; 
                document.getElementById(id).onclick = () => { actionQueue.push({type:'spell', spellKey:spellKey, actorIndex:activeMemberIndex, targetIndex:i, name:p.name}); startInputPhase(); };
            } else {
                document.getElementById(id).style.display = 'none';
            }
        });
        document.querySelector('#target-controls button:last-child').onclick = openSpellMenu;
    } else {
        if(enemies.filter(e=>e.hp>0).length > 1) { openEnemyTargetMenu('spell', spellKey); } else { let tIdx = enemies.findIndex(e => e.hp > 0); actionQueue.push({type:'spell', spellKey:spellKey, actorIndex:activeMemberIndex, targetIndex:tIdx, name:p.name}); startInputPhase(); }
    }
}

function openEnemyTargetMenu(actionType, spellKey=null) {
    toggleControls('target');
    // ★ここを修正: 'btn-target-3' を追加
    const btns = ['btn-target-0','btn-target-1','btn-target-2','btn-target-3'];
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


function getRandomTarget(group) {
    const valid = group.filter(u => u.hp > 0 && u.status !== STATUS.STONE);
    if(valid.length === 0) return null;
    return valid[Math.floor(Math.random() * valid.length)];
}

function getTargetVfxIndex(target) {
    // パーティか敵かでインデックスを返す（VFX用）
    if(target.isEnemy) return target.id; // enemies配列のインデックス等
    return null; // 味方の場合は画面全体揺らす等
}

// --- 戦闘終了時の処理 (修正) ---
function endBattle() {
    isBattle = false;
    battleSpellMode = null; // ★追加: 戦闘メニュー状態をリセット
    
    document.querySelectorAll('.dynamic-enemy-container').forEach(e => e.remove());
    document.getElementById('enemy-stat').style.visibility='hidden';
    document.getElementById('battle-msg').style.display='none';
    
    // 戦闘後回復する状態異常を解除 (睡眠、混乱、気絶)
    party.forEach(p => {
        if([STATUS.SLEEP, STATUS.CONFUSE, STATUS.STUN].includes(p.status)) {
            p.status = STATUS.NORMAL;
        }
        // 毒、麻痺、石化は残る
    });

    updateDungeonUI();
    toggleControls('move');
}

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
// game.js の playVfx 関数をこれに置き換えてください

function playVfx(t, targetIdx=null){
    const l=document.getElementById('vfx-layer');
    const m=document.getElementById('main-area');
    const d=document.createElement('div');
    let targetUnit = null;
    if(targetIdx !== null) targetUnit = document.getElementById(`enemy-unit-${targetIdx}`);
    
    // エフェクトの種類ごとにクラスを適用
    // 追加した属性: blunt, pierce, water, wind, earth, light, dark
    if(t) d.className = `vfx-${t}`;
    
    // ターゲット指定がある攻撃系エフェクトの場合
    // (slash, fire, blunt, pierce, water, wind, earth, light, dark)
    const targetEffects = ['slash','fire','blunt','pierce','water','wind','earth','light','dark'];
    
    if(targetEffects.includes(t)){
        if(targetUnit) {
            // ① 対象が敵の場合：敵画像を揺らす
            targetUnit.classList.remove('shake-enemy');
            void targetUnit.offsetWidth; // リフロー
            targetUnit.classList.add('shake-enemy');
            
            // エフェクトを敵の位置に合わせる
            d.style.position = 'absolute';
            d.style.left = targetUnit.style.left; 
            d.style.top = targetUnit.style.top;
        } else {
            // ② 対象がプレイヤー（または全体）の場合：画面全体を揺らす
            m.classList.remove('shake-screen');
            void m.offsetWidth; // リフロー
            m.classList.add('shake-screen');
            
            // エフェクトは画面中央
            d.style.position = 'absolute';
            d.style.left = '50%';
            d.style.top = '50%';
            d.style.transform = 'translate(-50%, -50%)';
        }
    } 
    else if(t==='heal'){ 
        // 回復エフェクト(画面全体が緑っぽく光るなどCSSで制御)
        // 必要なら位置調整
    } 
    else if(t==='damage'){ 
        // 汎用ダメージ(画面揺れ)
        m.classList.remove('shake-screen');
        void m.offsetWidth;
        m.classList.add('shake-screen');
    }
    
    l.appendChild(d);
    setTimeout(()=>d.remove(), 1000); // 1秒後にDOM削除
}

// game.js の initMapUI 関数を置き換え

function initMapUI() {
    const a = document.getElementById('map-area');
    a.innerHTML = "";
    // 視界範囲分（例: 9x9）のグリッドを作成
    const size = (viewRange * 2) + 1; 
    for(let y = 0; y < size; y++) {
        for(let x = 0; x < size; x++) {
            let d = document.createElement('div');
            // IDは相対座標用に変更（v-x-y）
            d.id = `v-cell-${x}-${y}`;
            d.className = 'cell cell-unknown';
            a.appendChild(d);
        }
    }
}
function updatePlayerVision(){[{x:0,y:0},{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}].forEach(o=>{let tx=playerPos.x+o.x,ty=playerPos.y+o.y;if(tx>=0&&tx<mapSize&&ty>=0&&ty<mapSize)visitedMaps[currentDungeonId][currentFloor][ty][tx]=true;});}
// game.js の renderMap 関数を置き換え

function renderMap() {
    const ar = ["▲","▶","▼","◀"]; 
    // 現在のフロアの踏破状況
    const vis = visitedMaps[currentDungeonId][currentFloor];
    
    // 表示範囲のループ (例: -4 ～ +4)
    const size = (viewRange * 2) + 1;

    for(let vy = 0; vy < size; vy++) {
        for(let vx = 0; vx < size; vx++) {
            // HTML上のセルを取得
            const c = document.getElementById(`v-cell-${vx}-${vy}`);
            c.innerText = "";
            c.className = 'cell'; 

            c.removeAttribute('style'); // ★追加: 色やスタイルの残骸をリセットする

            // マップ上の絶対座標を計算
            // (vy - viewRange) で -4～4 のオフセットを作る
            const mx = playerPos.x + (vx - viewRange);
            const my = playerPos.y + (vy - viewRange);

            // 1. マップ範囲外の処理 (壁として描画、または黒塗り)
            if (mx < 0 || mx >= mapSize || my < 0 || my >= mapSize) {
                c.classList.add('cell-unknown'); // 範囲外は暗闇
                continue;
            }

            // 2. 現在地 (画面の中央)
            if (mx === playerPos.x && my === playerPos.y) {
                c.classList.add('cell-hero');
                c.innerText = ar[playerPos.dir];
                continue;
            }

            // 3. 未踏破エリア
            if (!vis[my][mx]) {
                c.classList.add('cell-unknown');
                continue;
            }

            // 4. マップデータに基づく描画
            const v = currentMapData[my][mx];
            
            if (v === TILE.WALL) {
                c.classList.add('cell-wall');
            } else {
                c.classList.add('cell-floor');
                
                // アイコン類の描画
                if (v === TILE.STAIRS || v === TILE.UP_STAIRS) {
                    c.classList.add('cell-stairs');
                    c.innerText = "≡";
                } else if (v === TILE.BOSS) {
                    c.classList.add('cell-boss');
                    c.innerText = "💀";
                } else if (v === TILE.CHEST) {
                    const key = `${currentDungeonId}_${currentFloor}_${mx}_${my}`;
                    if (!openedChests.includes(key)) {
                        c.classList.add('cell-chest');
                        c.innerText = "■";
                    } else {
                        c.innerText = "□";
                        c.style.color = "#666";
                    }
                } else if (v === TILE.SHOP) {
                    c.classList.add('cell-event');
                    c.innerText = "$";
                } else if (v === TILE.EXIT) {
                    c.classList.add('cell-entrance');
                    c.innerText = "E";
                } else if (v === TILE.FLOW) {
                    c.innerText = "~";
                    c.style.color = "#88f";
                } else if (v === TILE.WARP) {
                    c.classList.add('cell-event');
                    c.innerText = "@";
                } else if (v === TILE.HOLE) {
                    c.innerText = "O";
                } else if (v === TILE.DOOR) {
    c.classList.add('cell-door');
    c.innerText = "D";
}
else if (v === TILE.LOCKED_DOOR) {
    const key = `${currentDungeonId}_${currentFloor}_${mx}_${my}`; // renderLargeMapでは変数名が異なるので注意(x, y)
    
    if (unlockedDoors[key]) {
        // 開錠済みなら緑色などにするか、doorクラスをあてる
        c.classList.add('cell-door');
        c.innerText = "OP"; // Open
        c.style.backgroundColor = "#5a4a3a";
    } else {
        c.classList.add('cell-door-locked');
        c.innerText = "LOCK";
    }
}
else if (v === TILE.SWITCH) {
    c.classList.add('cell-switch');
    c.innerText = "SW";
}
            }
        }
    }
}

function log(m, isEnemy = false) {
    const l = document.getElementById('log');
    const colorClass = isEnemy ? 'log-enemy' : '';
    

    l.innerHTML += `<p class="${colorClass}">${m}</p>`;
    l.scrollTop = l.scrollHeight;
}

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
unlockedDoors: unlockedDoors,
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
    if (!json) { alert("セーブデータが見つかりません。"); return; }
    if (!confirm("続きから始めますか？")) return;

    try {
        const data = JSON.parse(json);
        party = data.party;
        partyInventory = data.inventory;
        partyGold = data.gold;
        openedChests = data.openedChests;
        visitedMaps = data.visitedMaps;
        clearedDungeons = data.clearedDungeons || [];
        currentDungeonId = data.currentDungeonId;
        currentFloor = data.currentFloor;
        playerPos = data.playerPos;
        unlockedDoors = data.unlockedDoors || {};

        // データの整合性チェックと更新
        party.forEach(p => {
            calculateStats(p);
            
            // ★旧データ対応: skillPointsがない場合はレベル分付与して初期化
            if (p.skillPoints === undefined) {
                p.skillPoints = p.level;
                p.investedSkills = {};
                // ※旧データの p.spells はツリー形式ではないため、一旦リセットされます
                // プレイヤーは「忘却の石」を使ったのと同じ状態で再開することになります
                updateSpellsFromTree(p);
            } else {
                // セーブデータの spells はオブジェクトのメソッドが消えているため、再構築推奨
                // ただし current (残り回数) は維持したい
                const savedSpells = p.spells;
                updateSpellsFromTree(p);
                // 残り回数を復元
                for(let k in p.spells) {
                    if(savedSpells[k]) p.spells[k].current = savedSpells[k].current;
                }
            }
        });

        // 画面復帰処理 (既存のまま)
        document.getElementById('prologue-scene').style.display = 'none';
        document.getElementById('camp-overlay').style.display = 'none';
        if (data.scene === 'dungeon') {
            document.getElementById('town-scene').style.display = 'none';
            document.getElementById('dungeon-scene').style.display = 'flex';
            currentMapData = maps[currentDungeonId][currentFloor];
            const cv = document.getElementById('dungeon-canvas');
            if(cv) ctx = cv.getContext('2d');
            const dName = dungeonData[currentDungeonId].name;
            document.getElementById('floor-display').innerText = `${dName} B${currentFloor}F`;
            checkObject(); updatePlayerVision(); updateDungeonUI(); toggleControls('move');
        } else {
            document.getElementById('dungeon-scene').style.display = 'none';
            document.getElementById('town-scene').style.display = 'block';
            updateTownStatus();
        }
        townLog("ゲームをロードしました。");

    } catch (e) {
        alert("ロード失敗"); console.error(e);
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


// ==========================================
//  拡大マップ機能
// ==========================================

function openLargeMap() {
    if (isBattle) return;
    const overlay = document.getElementById('large-map-overlay');
    const grid = document.getElementById('large-map-grid');

    // 初回のみグリッド生成 (mapSize = 20 に対応)
    if (grid.innerHTML === "") {
        for(let y=0; y<mapSize; y++) {
            for(let x=0; x<mapSize; x++) {
                let d = document.createElement('div');
                d.id = `l-cell-${x}-${y}`;
                d.className = 'cell cell-unknown';
                
                // ★追加: タップ/クリックで自動移動開始
                d.onclick = function(e) {
                    e.stopPropagation(); // 親要素(オーバーレイ)のクリックイベント(閉じる処理)を止める
                    startAutoWalk(x, y);
                };

                grid.appendChild(d);
            }
        }
    }
    overlay.style.display = 'flex';
    renderLargeMap();
}

function closeLargeMap() {
    document.getElementById('large-map-overlay').style.display = 'none';
}

// renderMap関数とほぼ同じロジックだが、対象IDが違う
function renderLargeMap() {
    const ar = ["▲","▶","▼","◀"]; 
    const vis = visitedMaps[currentDungeonId][currentFloor];
    
    for(let y=0; y<mapSize; y++) {
        for(let x=0; x<mapSize; x++) {
            const c = document.getElementById(`l-cell-${x}-${y}`);
            c.innerText = "";
            c.className = 'cell'; 
            c.removeAttribute('style');

            // 1. 現在地
            if(x === playerPos.x && y === playerPos.y) {
                c.classList.add('cell-hero');
                c.innerText = ar[playerPos.dir];
                continue;
            }

            // 2. 未踏破
            if(!vis[y][x]) {
                c.classList.add('cell-unknown');
                continue;
            }

            // 3. マップデータ
            const v = currentMapData[y][x];
            
            if (v === TILE.WALL) {
                c.classList.add('cell-wall');
            } else {
                c.classList.add('cell-floor');

                if (v === TILE.STAIRS || v === TILE.UP_STAIRS) {
                    c.classList.add('cell-stairs');
                    c.innerText = "≡";
                } else if (v === TILE.BOSS) {
                    c.classList.add('cell-boss');
                    c.innerText = "💀";
                } else if (v === TILE.CHEST) {
                    const key = `${currentDungeonId}_${currentFloor}_${x}_${y}`;
                    if(!openedChests.includes(key)) {
                        c.classList.add('cell-chest');
                        c.innerText = "■";
                    } else {
                        c.innerText = "□";
                        c.style.color = "#666";
                    }
                } else if (v === TILE.SHOP) {
                    c.classList.add('cell-event');
                    c.innerText = "$";
                } else if (v === TILE.EXIT) {
                    c.classList.add('cell-entrance');
                    c.innerText = "E";
                } else if (v === TILE.FLOW) {
                    c.innerText = "~";
                    c.style.color = "#88f";
                } else if (v === TILE.WARP) {
                    c.classList.add('cell-event');
                    c.innerText = "@";
                } else if (v === TILE.HOLE) {
                    c.innerText = "O";
                } else if (v === TILE.DOOR) {
    c.classList.add('cell-door');
    c.innerText = "D";
}
else if (v === TILE.LOCKED_DOOR) {
    // ★修正: mx, my ではなく x, y を使用する
    const key = `${currentDungeonId}_${currentFloor}_${x}_${y}`; 
    
    if (unlockedDoors[key]) {
        c.classList.add('cell-door');
        c.innerText = "OP"; 
        c.style.backgroundColor = "#5a4a3a";
    } else {
        c.classList.add('cell-door-locked');
        c.innerText = "LOCK";
    }
}
else if (v === TILE.SWITCH) {
    c.classList.add('cell-switch');
    c.innerText = "SW";
}
            }
        }
    }
}


// ==========================================
//  ★追加: 自動移動システム
// ==========================================

// 経路探索 (幅優先探索 BFS)
// 現在地(sx, sy)から目的地(tx, ty)までの最短ルートを計算します
function findShortestPath(sx, sy, tx, ty) {
    // 目的地が壁、または未踏破(視界外)なら移動不可とする
    if (currentMapData[ty][tx] === TILE.WALL) return null;
    if (!visitedMaps[currentDungeonId][currentFloor][ty][tx]) return null;

    let queue = [{ x: sx, y: sy, path: [] }];
    let visited = Array(mapSize).fill().map(() => Array(mapSize).fill(false));
    visited[sy][sx] = true;

    // 上下左右の移動方向
    const dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];

    while (queue.length > 0) {
        let current = queue.shift();

        // 目的地に到達したらパスを返す
        if (current.x === tx && current.y === ty) {
            return current.path;
        }

        for (let d of dirs) {
            let nx = current.x + d.x;
            let ny = current.y + d.y;

            // マップ範囲内かつ、未訪問かつ、壁でない場合
            if (nx >= 0 && nx < mapSize && ny >= 0 && ny < mapSize) {
                if (!visited[ny][nx] && currentMapData[ny][nx] !== TILE.WALL) {
                    visited[ny][nx] = true;
                    // 新しいパスを作成してキューに追加
                    let newPath = [...current.path, { x: d.x, y: d.y }]; 
                    queue.push({ x: nx, y: ny, path: newPath });
                }
            }
        }
    }
    return null; // 到達不能
}

// 自動移動の開始処理
function startAutoWalk(targetX, targetY) {
    // すでに動いていたら止める
    stopAutoWalk();

    // ルート計算
    const path = findShortestPath(playerPos.x, playerPos.y, targetX, targetY);

    if (!path || path.length === 0) {
        log("そこへは行けません。"); // game.js
        return;
    }

    log("自動移動を開始します...");
    closeLargeMap(); // マップを閉じる

    // ステップ実行
    let stepIndex = 0;
    
    // 0.15秒ごとに1歩進む
    autoMoveTimer = setInterval(() => {
        // --- 停止条件チェック ---
        // 1. 戦闘が始まった
        if (isBattle) {
            stopAutoWalk();
            return;
        }
        // 2. プレイヤーが死んでいる、石化しているなど
        if (party.every(p => !p.alive || p.status === STATUS.STONE)) {
             stopAutoWalk();
             return;
        }

        // 次のステップを取得
        const move = path[stepIndex];
        
        // 向きを変更（演出）
        if (move.y === -1) playerPos.dir = 0; // 北
        else if (move.x === 1) playerPos.dir = 1; // 東
        else if (move.y === 1) playerPos.dir = 2; // 南
        else if (move.x === -1) playerPos.dir = 3; // 西
        
        // 移動実行 (executeMoveは game.js 内の既存関数)
        executeMove(move.x, move.y);

        stepIndex++;

        // ゴール到達またはルート終了
        if (stepIndex >= path.length) {
            stopAutoWalk();
        }
        
        // 階層移動してしまった場合（階段を踏んだ等）はパスが無効になるので停止
        // ※簡易判定: executeMove後に座標が目的地の隣接ですらなくなっていたら飛んだとみなす等も可だが
        // ここでは executeMove 内でイベントが起きたら止まるようにユーザー操作介入で止める方針と合わせる
        
    }, 150); // 移動速度 (ミリ秒)
}

// 自動移動の強制停止
function stopAutoWalk() {
    if (autoMoveTimer) {
        clearInterval(autoMoveTimer);
        autoMoveTimer = null;
    }
}