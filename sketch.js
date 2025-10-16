// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

// let finalScore = 85;
// let maxScore = 100;
// let scoreText = "成績分數: " + finalScore + "/" + maxScore;
// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字
// 在實際 H5P 應用中，您會使用以下機制來捕獲分數：

// H5P.externalDispatcher.on('xAPI', function(event){
//     // event.getScore() 取得分數，event.getMaxScore() 取得滿分
//     if (event.getScore() === event.getMaxScore() && event.getMaxScore() > 0){
//         // 這裡可以將分數儲存到變數中或進行其他操作
//         console.log('使用者獲得了滿分！');
//     }
// });

window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 (見方案二)
        // ----------------------------------------
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // ... (其他設置)
    createCanvas(windowWidth / 2, windowHeight / 2); 
    background(255); 
    noLoop(); // 如果您希望分數只有在改變時才繪製，保留此行
} 

function draw() { 
    // 1. 清除背景，以防留下舊分數的軌跡
    background(255); 
    
    // 2. 使用全域變數 `scoreText` 繪製文本
    textSize(50); 
    fill(0); 
    textAlign(CENTER);
    
    // 確保即使初始分數是 0，也會顯示文字
    const display = scoreText || "等待 H5P 成績..."; 
    text(display, width / 2, height / 2); 
}
