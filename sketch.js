// 全域變數定義
let finalScore = 0; 
let maxScore = 0;
let scoreText = "等待 H5P 成績中..."; // 此變數將用於等待訊息
let scoreCanvas; 

// **新增狀態管理**
const GAME_STATE = {
    WAITING: 'WAITING',
    DISPLAY_SCORE: 'DISPLAY_SCORE'
};
let gameState = GAME_STATE.WAITING;


// 煙火相關全域變數 (省略類別定義，假設與上一個版本一致)
let fireworks = [];
let gravity;
const FIREWORK_COUNTDOWN = 60;
let launchSound, explodeSound; // 假設音效變數已在 preload() 中定義

// ... (Particle, Firework 類別定義與 preload() 保持不變) ...
function preload() {
    // ... (音效載入，與上一個版本相同) ...
    try {
        launchSound = loadSound('launch.mp3');
        explodeSound = loadSound('explode.mp3');
    } catch (error) {
        console.error("音效載入失敗，請檢查檔案路徑 (launch.mp3, explode.mp3) 和 p5.sound.js 是否正確引入:", error);
    }
}
// ... (Particle, Firework 類別定義與上一個版本相同) ...


// =================================================================
// p5.js 繪圖邏輯
// =================================================================
function setup() {
    const container = document.getElementById('overlay-container');
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    scoreCanvas = createCanvas(w, h); 
    scoreCanvas.parent('overlay-container'); 
    
    colorMode(HSB, 255); 
    gravity = createVector(0, 0.2); 

    scoreCanvas.hide(); 
    
    // 初始不繪製，等待訊息
    noLoop(); 
} 

function draw() { 
    // **清除畫布**：無論哪種狀態，都先清除畫布，讓 H5P 內容不被殘影干擾
    clear(); 
    colorMode(RGB); 

    if (gameState === GAME_STATE.WAITING) {
        // **狀態 A: 等待成績**
        
        textSize(50); 
        textAlign(CENTER);
        fill(150); // 灰色
        text(scoreText, width / 2, height / 2);

    } else if (gameState === GAME_STATE.DISPLAY_SCORE) {
        // **狀態 B: 顯示最終成績、圖形與煙火**
        
        // 使用透明背景來製造煙火殘影，但因為我們在頂部 clear() 了，
        // 所以這裡需要確保圖形和文字是實心顯示
        background(0, 0, 0, 25); // 讓煙火有殘影

        let percentage = (finalScore / maxScore) * 100;
        let textYOffset = height / 2 - 70;
        let shapeYOffset = height / 2 + 150;

        // 繪製文字和圖形 (與舊版本邏輯相同)
        textSize(50); 
        textAlign(CENTER);
        
        if (percentage >= 90) {
            fill(0, 200, 50); 
            text("恭喜！優異成績！", width / 2, textYOffset);
            
            // 觸發煙火發射
            if (frameCount % 10 === 0 && random(1) < 0.2) { 
                fireworks.push(new Firework(random(width), height));
            }
            
            // 繪製圓形
            fill(0, 200, 50, 150); 
            noStroke();
            circle(width / 2, shapeYOffset, 150);
            
        } else if (percentage >= 60) {
            fill(255, 181, 35); 
            text("成績良好，請再接再厲。", width / 2, textYOffset);
            
            // 繪製方形
            fill(255, 181, 35, 150);
            rectMode(CENTER);
            rect(width / 2, shapeYOffset, 150, 150);
            
        } else if (percentage > 0) {
            fill(200, 0, 0); 
            text("需要加強努力！", width / 2, textYOffset);
        }

        // 繪製具體分數 (放在中間)
        textSize(50); 
        fill(50);
        text(`${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
        
        // 煙火動畫更新與繪製
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].show();

            if (fireworks[i].done()) {
                fireworks.splice(i, 1);
            }
        }
        
        // 如果是靜態分數，則停止 loop，如果是煙火則保持 loop
        if (fireworks.length === 0 && percentage >= 90) {
            // 煙火放完了，停止動畫並保持靜態畫面
            noLoop();
        } else if (fireworks.length === 0 && percentage < 90) {
            // 靜態低分/中等分數，停止動畫
            noLoop();
        } else if (fireworks.length > 0) {
             // 還有煙火在飛，保持 loop
             loop();
        }
    }
}


// =================================================================
// 接收 postMessage 消息並更新分數
// =================================================================
window.addEventListener('message', function (event) {
    
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // 1. 更新全域變數
        finalScore = data.score;
        maxScore = data.maxScore;
        
        // 2. 關鍵步驟：切換狀態並顯示畫布
        gameState = GAME_STATE.DISPLAY_SCORE; // 切換到顯示成績狀態
        
        if (scoreCanvas) {
            scoreCanvas.show(); 
        }
        
        // 3. 呼叫 p5.js 重新繪製
        if (typeof redraw === 'function') {
            if ((finalScore / maxScore) * 100 >= 90) {
                // 高分才啟動 loop 播放煙火動畫
                loop(); 
            } else {
                // 靜態繪製一次
                redraw(); 
            }
        }
    }
}, false);
