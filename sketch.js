// 全域變數定義
let finalScore = 0; 
let maxScore = 0;
let scoreText = "等待 H5P 成績中..."; 
let scoreCanvas; // 儲存 p5.js 畫布物件

// 煙火相關全域變數
let fireworks = [];
let gravity;
const FIREWORK_COUNTDOWN = 60; // 煙火爆炸前上升的幀數 (約 1 秒)

// =================================================================
// 類別定義 (Particle & Firework)
// =================================================================

// 粒子類別 (用於火箭和爆炸碎片)
class Particle {
    constructor(x, y, hue, firework) {
        this.pos = createVector(x, y);
        this.firework = firework;
        this.lifespan = 255;
        this.hu = hue;
        this.acc = createVector(0, 0);

        if (this.firework) {
            // 火箭的初始速度：向上
            this.vel = createVector(0, random(-10, -15));
        } else {
            // 爆炸碎片的初始速度：隨機方向
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10));
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.firework) {
            this.vel.mult(0.9); // 碎片會逐漸減速
            this.lifespan -= 4; // 碎片會逐漸消失
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    show() {
        colorMode(HSB);

        if (this.firework) {
            // 火箭的樣子 (白色小點)
            strokeWeight(4);
            stroke(this.hu, 255, 255);
        } else {
            // 碎片的樣子 (彩色點，透明度隨著生命週期減少)
            strokeWeight(2);
            stroke(this.hu, 255, 255, this.lifespan);
        }
        point(this.pos.x, this.pos.y);
    }
    
    // 檢查粒子是否已經「死亡」
    done() {
        return this.lifespan < 0;
    }
}

// 煙火類別 (管理一個火箭及其爆炸)
class Firework {
    constructor(startX, startY) {
        this.hu = random(255); // 隨機顏色
        this.firework = new Particle(startX, startY, this.hu, true); // 火箭粒子
        this.exploded = false;
        this.particles = [];
        this.timer = FIREWORK_COUNTDOWN;
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();
            
            // 倒數計時，當達到目標高度時爆炸
            this.timer--;
            if (this.timer <= 0) {
                this.explode();
                this.exploded = true;
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();
            if (this.particles[i].done()) {
                this.particles.splice(i, 1);
            }
        }
    }

    // 火箭爆炸成碎片
    explode() {
        for (let i = 0; i < 100; i++) {
            const p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
            this.particles.push(p);
        }
    }

    show() {
        if (!this.exploded) {
            this.firework.show();
        }
        
        for (const p of this.particles) {
            p.show();
        }
    }
    
    // 檢查煙火是否完成 (所有碎片都消失)
    done() {
        return this.exploded && this.particles.length === 0;
    }
}


// =================================================================
// p5.js 繪圖邏輯
// =================================================================
function setup() {
    // 讓 Canvas 尺寸匹配 iFrame
    const container = document.getElementById('overlay-container');
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    scoreCanvas = createCanvas(w, h); // 將創建的畫布物件賦值給 scoreCanvas
    scoreCanvas.parent('overlay-container'); // 將畫布附加到容器
    
    // 設定顏色模式為 HSB (Hue, Saturation, Brightness)，色相範圍 0-255
    colorMode(HSB, 255); 
    
    // 設定重力向量 (向下)
    gravity = createVector(0, 0.2); 

    // 初始隱藏畫布
    scoreCanvas.hide(); 
    
    // 保持 draw 函式只在收到訊息後執行一次，但為了煙火動畫需要 loop
    // 只有在收到分數且分數夠高時才啟動 loop
    noLoop(); 
} 

function draw() { 
    // 為背景增加少量透明度，製造煙火尾跡的殘影效果
    background(0, 0, 0, 25); 
    
    colorMode(RGB); // 切換回 RGB 模式繪製文字和基本圖形
    clear(); // 改回清除畫布，以保持 H5P 內容可見，但這樣會犧牲煙火殘影效果
    // 如果您希望煙火有殘影（像真實煙火），請將上一行的 clear() 註釋掉，
    // 並取消註釋下一行的 background 
    // background(0, 0, 0, 25); // 這行會讓畫面有殘影效果

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;
    let textYOffset = height / 2 - 70;

    textSize(50); 
    textAlign(CENTER);
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色
        text("恭喜！優異成績！", width / 2, textYOffset);
        
        // **!!! 煙火觸發邏輯 !!!**
        // 隨機發射新的煙火 (每 10 幀發射一顆)
        if (frameCount % 10 === 0 && random(1) < 0.2) { 
            // 隨機位置發射
            fireworks.push(new Firework(random(width), height));
        }
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, textYOffset);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, textYOffset);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // -----------------------------------------------------------------
    // C. 煙火動畫邏輯 (只有在 percentage >= 90 時才會持續新增)
    // -----------------------------------------------------------------
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();

        // 移除已完成的煙火
        if (fireworks[i].done()) {
            fireworks.splice(i, 1);
        }
    }
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    let shapeYOffset = height / 2 + 150;

    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 
        fill(0, 200, 50, 150); // 帶透明度
        noStroke();
        circle(width / 2, shapeYOffset, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, shapeYOffset, 150, 150);
    }
    
    // 如果沒有煙火在畫面上，並且分數低於 90，則回到 noLoop() 狀態
    if (percentage < 90 && fireworks.length === 0) {
        noLoop();
    }
}


// =================================================================
// 接收 postMessage 消息並更新分數
// =================================================================
window.addEventListener('message', function (event) {
    
    // ... (執行來源驗證邏輯) ...

    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // 1. 更新全域變數
        finalScore = data.score;
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;

        // 2. 關鍵步驟：顯示 p5.js 畫布
        if (scoreCanvas) {
            scoreCanvas.show(); // 顯示畫布 (等同於將 display 設為 block)
        }
        
        // 3. 呼叫 p5.js 重新繪製
        if (typeof redraw === 'function') {
            if ((finalScore / maxScore) * 100 >= 90) {
                // 如果是高分，啟動 loop 以執行動畫
                loop(); 
            } else {
                // 否則只繪製一次靜態結果
                redraw(); 
            }
        }
    }
}, false);
