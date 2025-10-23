// 全域變數定義
let finalScore = 0; 
let maxScore = 0;
let scoreText = "等待 H5P 成績中..."; 
let scoreCanvas; 

// 煙火相關全域變數
let fireworks = [];
let gravity;
const FIREWORK_COUNTDOWN = 60; 

// **DOM 按鈕變數**
let retryButton; 


// =================================================================
// 類別定義 (Particle & Firework)
// (與上一個版本相同，已移除音效)
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
            strokeWeight(6); 
            stroke(this.hu, 255, 255);
        } else {
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
        this.firework = new Particle(startX, height, this.hu, true); 
        this.exploded = false;
        this.particles = [];
        this.timer = FIREWORK_COUNTDOWN;
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();
            
            this.timer--;
            if (this.timer <= 0 || this.firework.vel.y >= 0) { 
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
// 輔助函式：繪製帶有背景框的文字
// =================================================================
function drawTextBox(textString, x, y, boxW, boxH, textColor = 0) {
    // 繪製半透明白色方框背景 (透明度 80%)
    fill(255, 255, 255, 204); 
    noStroke();
    rectMode(CENTER);
    rect(x, y, boxW, boxH, 10); 

    // 繪製文字
    fill(textColor); 
    textSize(30); 
    textAlign(CENTER, CENTER);
    text(textString, x, y);
}

// **新增函式：按鈕點擊處理邏輯**
function handleRetryClick() {
    // 1. 隱藏 Canvas 和 DOM 按鈕
    scoreCanvas.hide();
    retryButton.hide();
    
    // 2. 重置狀態變數
    finalScore = 0;
    maxScore = 0;
    scoreText = "等待 H5P 成績中..."; 
    fireworks = []; 
    
    // 3. 停止繪製
    noLoop(); 
    
    // 4. 重新繪製一次靜態的「等待中」畫面
    redraw(); 
}


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
    
    // **創建 DOM 按鈕 (位於 Canvas 外部，但重疊)**
    retryButton = createButton('再試一次');
    // 設置按鈕樣式，使其位於畫布底部中央
    retryButton.style('width', '200px');
    retryButton.style('height', '50px');
    retryButton.style('background-color', 'rgb(0, 100, 200)');
    retryButton.style('color', 'white');
    retryButton.style('border', 'none');
    retryButton.style('border-radius', '10px');
    retryButton.style('font-size', '22px');
    retryButton.style('cursor', 'pointer');
    
    // 將按鈕添加到容器，並使用絕對定位
    retryButton.parent('overlay-container');
    retryButton.position(w / 2 - 100, h - 125); // 100 = w/2, 125 = h + 邊距
    
    // 添加點擊事件處理器
    retryButton.mousePressed(handleRetryClick);
    
    // 初始隱藏按鈕
    retryButton.hide();
    
    noLoop(); 
} 

function draw() { 
    // **修正煙火顯示問題：每次完全清除畫布**
    clear(); 
    
    colorMode(RGB); 
    
    if (finalScore === 0) {
        // **狀態：等待成績**
        drawTextBox(scoreText, width / 2, height / 2, 400, 80);
        return; 
    }
    
    // **狀態：顯示成績**
    
    let percentage = (finalScore / maxScore) * 100;
    let textYOffset = height / 2 - 100; 
    let shapeYOffset = height / 2 + 150;

    // A. 繪製祝賀/提示文字
    let mainText = "";
    let mainTextColor = color(0); 

    if (percentage >= 90) {
        mainText = "恭喜！優異成績！";
        mainTextColor = color(0, 200, 50); 
        
        // 觸發煙火發射
        if (frameCount % 5 === 0 && random(1) < 0.3) { 
            fireworks.push(new Firework(random(width), height));
        }
        
    } else if (percentage >= 60) {
        mainText = "成績良好，請再接再厲。";
        mainTextColor = color(255, 181, 35); 
        
    } else {
        mainText = "需要加強努力！";
        mainTextColor = color(200, 0, 0); 
    }
    
    drawTextBox(mainText, width / 2, textYOffset, 450, 80, mainTextColor);
    
    // B. 繪製實際分數
    let scoreDisplay = `得分: ${finalScore}/${maxScore}`;
    drawTextBox(scoreDisplay, width / 2, height / 2, 300, 80);
    
    // C. 煙火動畫更新與繪製
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();

        if (fireworks[i].done()) {
            fireworks.splice(i, 1);
        }
    }
    
    // D. 繪製幾何圖形 
    if (percentage >= 90) {
        fill(0, 200, 50, 150); 
        noStroke();
        circle(width / 2, shapeYOffset, 150);
        
    } else if (percentage >= 60) {
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, shapeYOffset, 150, 150);
    }
    
    // E. 決定是否顯示按鈕和停止動畫
    if (percentage >= 90 && fireworks.length > 0) {
        // 正在放煙火，保持 loop，隱藏按鈕
        retryButton.hide();
        loop(); 
    } else {
        // 靜態分數顯示完成 (低分或煙火放完)，停止動畫，顯示按鈕
        retryButton.show();
        noLoop(); 
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
            scoreCanvas.show(); 
        }
        
        // 3. 呼叫 p5.js 啟動繪圖
        if (typeof loop === 'function') {
            loop(); 
        }
    }
}, false);
