// 全域變數定義
let finalScore = 0; 
let maxScore = 0;
let scoreText = "等待 H5P 成績中..."; 
let scoreCanvas; // 儲存 p5.js 畫布物件

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

    // 初始隱藏畫布 (即使 CSS 已經設定，這也是一個確認步驟)
    // 我們依賴 CSS 的 display: none 來隱藏畫布，但我們必須拿到這個 DOM 節點
    // 註：如果使用 p5.js 的 scoreCanvas.hide()，它會自動將 display 設為 none。
    scoreCanvas.hide(); 
    
    noLoop(); 
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

        // // 2. 關鍵步驟：顯示 p5.js 畫布
        if (scoreCanvas) {
            scoreCanvas.show(); // 顯示畫布 (等同於將 display 設為 block)
        }
        
        // // 3. 呼叫 p5.js 重新繪製
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);

// score_display.js 中的 draw() 函數片段
function draw() { 
    // 關鍵：每次繪製時，清除畫布，但如果希望背景透明，
    // 您可以使用透明度低的 background(255, 0)
    // 或者只在您需要覆蓋 H5P 內容時才繪製背景。
    clear(); // 清除畫布，使其完全透明
// function draw() { 
//     background(255); // 清除背景

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;

    textSize(80); 
    textAlign(CENTER);
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色 [6]
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色 [6]
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色 [6]
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    // textSize(50);
    // fill(50);
    // text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    // 繪製分數文本
    textSize(50); 
    fill(0, 50, 200); 
    textAlign(CENTER); 
    text(scoreText, width / 2, height / 2); // 將文本繪製在 iFrame 中央
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 [7]
        fill(0, 200, 50, 150); // 帶透明度
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 [4]
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // 如果您想要更複雜的視覺效果，還可以根據分數修改線條粗細 (strokeWeight) 
    // 或使用 sin/cos 函數讓圖案的動畫效果有所不同 [8, 9]。
}


