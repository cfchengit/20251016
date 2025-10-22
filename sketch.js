// 全域變數定義
let finalScore = 0; 
let maxScore = 0;
let scoreText = "等待 H5P 成績中..."; 
let scoreCanvas; 

// 煙火相關全域變數
let fireworks = [];
let gravity;
const FIREWORK_COUNTDOWN = 60; 


// =================================================================
// **!!! 移除 preload() 函式和所有音效相關變數 !!!**
// =================================================================


// =================================================================
// 類別定義 (Particle & Firework)
// (與上一個版本相同，但已移除所有音效播放邏輯)
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
            this.vel = createVector(0, random(-10, -15));
        } else {
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10));
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.firework) {
            this.vel.mult(0.9); 
            this.lifespan -= 4; 
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    show() {
        colorMode(HSB);

        if (this.firework) {
            // 火箭顆粒大小
            strokeWeight(6); 
            stroke(this.hu, 255, 255);
        } else {
            // 碎片顆粒大小
            strokeWeight(3); 
            stroke(this.hu, 255, 255, this.lifespan);
        }
        point(this.pos.x, this.pos.y);
    }
    
    done() {
        return this.lifespan < 0;
    }
}

// 煙火類別 (管理一個火箭及其爆炸)
class Firework {
    constructor(startX, startY) {
        this.hu = random(255); 
        this.firework = new Particle(startX, startY, this.hu, true); 
        this.exploded = false;
        this.particles = [];
        this.timer = FIREWORK_COUNTDOWN;
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();
            
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

    scoreCanvas = createCanvas(w, h); 
    scoreCanvas.parent('overlay-container'); 
    
    colorMode(HSB, 255); 
    gravity = createVector(0, 0.2); 

    // 初始隱藏畫布
    scoreCanvas.hide(); 
    
    // **預設啟動 loop()，確保一旦 canvas 顯示，draw() 就會持續執行**
    // 這樣可以避免因為 noLoop() 導致靜態畫面不更新的問題。
    loop(); 
    noLoop(); // 先呼叫 noLoop()，等待接收到成績時再用 loop() 啟動
} 

function draw() { 
    // 每次繪製，先清除畫布，以覆蓋 H5P 內容和前一幀的文字
    clear(); 
    
    // 如果分數還沒傳來 (finalScore 還是 0，且 scoreCanvas 是隱藏的)，則顯示等待文字
    // **注意：由於 scoreCanvas 預設是隱藏的，這裡的邏輯需要調整**
    // **簡化邏輯：如果 finalScore 是 0 (初始值)，則顯示等待文字**

    colorMode(RGB); 
    textSize(50); 
    textAlign(CENTER);
    
    if (finalScore === 0) {
        // **狀態：等待成績**
        fill(150); 
        text(scoreText, width / 2, height / 2);
        
        // **這裡必須 return，不然後續的程式碼可能會導致畫面閃爍**
        return; 
    }
    
    // **狀態：顯示成績**
    // 使用透明背景來製造煙火殘影
    background(0, 0, 0, 25); 

    let percentage = (finalScore / maxScore) * 100;
    let textYOffset = height / 2 - 70;
    let shapeYOffset = height / 2 + 150;

    // A. 繪製文本
    if (percentage >= 90) {
        fill(0, 200, 50); 
        text("恭喜！優異成績！", width / 2, textYOffset);
        
        // 觸發煙火發射 (如果分數夠高)
        if (frameCount % 10 === 0 && random(1) < 0.2) { 
            fireworks.push(new Firework(random(width), height));
        }
        
    } else if (percentage >= 60) {
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, textYOffset);
        
    } else {
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, textYOffset);
    }
    
    // 繪製具體分數
    textSize(50); 
    fill(50);
    text(`${finalScore}/${maxScore}`, width / 2, height / 2 + 50);

    // C. 煙火動畫更新與繪製
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();

        if (fireworks[i].done()) {
            fireworks.splice(i, 1);
        }
    }
    
    // B. 繪製幾何圖形
    if (percentage >= 90) {
        fill(0, 200, 50, 150); 
        noStroke();
        circle(width / 2, shapeYOffset, 150);
        
    } else if (percentage >= 60) {
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, shapeYOffset, 150, 150);
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
        
        // 2. 關鍵步驟：顯示 p5.js 畫布
        if (scoreCanvas) {
            scoreCanvas.show(); // 讓 Canvas 顯示出來
        }
        
        // 3. 呼叫 p5.js 重新繪製
        // **強制 loop() 啟動，讓 draw() 持續執行**
        if (typeof loop === 'function') {
            loop(); 
        }
    }
}, false);
