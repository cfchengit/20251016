// 全域變數定義
let finalScore = 0; 
let maxScore = 0;
let scoreText = "等待 H5P 成績中..."; 
let scoreCanvas; // 儲存 p5.js 畫布物件

// 煙火相關全域變數
let fireworks = [];
let gravity;
const FIREWORK_COUNTDOWN = 60; // 煙火爆炸前上升的幀數 (約 1 秒)

// **新增音效變數**
let launchSound; // 火箭發射音效
let explodeSound; // 爆炸音效

// =================================================================
// **p5.js 預載入音效**
// =================================================================
function preload() {
    // 假設你的音效檔名為 launch.mp3 和 explode.mp3 且放在相同目錄
    // 請將 'path/to/' 替換為你的實際路徑，或確保檔案就在根目錄
    //=+++++++++++++++++++++++++++++++++++++++++++++++++++
    // try {
    //     launchSound = loadSound('launch.mp3');
    //     explodeSound = loadSound('explode.mp3');
    // } catch (error) {
    //     console.error("音效載入失敗，請檢查檔案路徑 (launch.mp3, explode.mp3) 和 p5.sound.js 是否正確引入:", error);
    // }
}


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
            // 火箭的樣子 (顆粒略大)
            strokeWeight(6); // **調整：火箭顆粒加大**
            stroke(this.hu, 255, 255);
        } else {
            // 碎片的樣子 (顆粒略大，透明度隨著生命週期減少)
            strokeWeight(3); // **調整：碎片顆粒加大**
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
        
        // **新增：發射音效**+++++++++++++++++++++++++++++++++++++++++++++++
        // if (launchSound && launchSound.isLoaded()) {
        //      launchSound.play();
        // }
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
        // **新增：爆炸音效**+++++++++++++++++++++++++++++++++++++++++++++
        // if (explodeSound && explodeSound.isLoaded()) {
        //      explodeSound.play();
        // }
        
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
    
    noLoop(); 
} 

function draw() { 
    // 使用透明背景來製造煙火尾跡的殘影效果 (更逼真)
    background(0, 0, 0, 25); 
    
    colorMode(RGB); // 切換回 RGB 模式繪製文字和基本圖形
    // 如果你不想要殘影，取消註釋下一行，但請注意煙火看起來會不太自然
    // clear(); 

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
                // 確保音效的播放能在瀏覽器環境中執行 (通常需要使用者互動後才能播放)
                // 由於 postMessage 是互動後觸發，通常可以播放
                loop(); 
            } else {
                // 否則只繪製一次靜態結果
                redraw(); 
            }
        }
    }
}, false);
