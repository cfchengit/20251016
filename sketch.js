// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

let finalScore = 85;
let maxScore = 100;
let scoreText = "成績分數: " + finalScore + "/" + maxScore;

// 在實際 H5P 應用中，您會使用以下機制來捕獲分數：

H5P.externalDispatcher.on('xAPI', function(event){
    // event.getScore() 取得分數，event.getMaxScore() 取得滿分
    if (event.getScore() === event.getMaxScore() && event.getMaxScore() > 0){
        // 這裡可以將分數儲存到變數中或進行其他操作
        console.log('使用者獲得了滿分！');
    }
});


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

// setup() 函數：只會在程式開始時執行一次
function setup() {
    // 創建一個與窗口同大小的畫布
    createCanvas(windowWidth / 2, windowHeight / 2);
    background(255, 255, 255); // 設定白色背景
    noLoop(); // 由於分數是靜態的，我們只繪製一次
}

// draw() 函數：不斷重複執行，但在 setup() 中使用 noLoop() 後只執行一次
function draw() {
    // 1. 設定文字樣式
    textSize(50); // 設定文字大小
    fill(0, 50, 200); // 藍色填充文字 (fill() 設定文本填充顏色)

    // 2. 繪製文本
    // text(文本內容, x座標, y座標)
    // 我們將文本放在畫布中央
    textAlign(CENTER); // 將文本對齊模式設為置中 (CENTER)
    text(scoreText, width / 2, height / 2);

    // 額外資訊：顯示滑鼠座標以供測試
    textSize(18);
    fill(100);
    text("重新載入頁面以更新分數", width / 2, height / 2 + 50);
}

