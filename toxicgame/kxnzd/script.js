
//document.getElementById('debuger').innerText = window.devicePixelRatio;
// 創建 PIXI 應用，指定畫布大小
const app = new PIXI.Application({
    backgroundColor: 0x121212,
});

let DPR = window.devicePixelRatio;
const background = new PIXI.Graphics();
// 添加 PIXI 渲染器到 HTML 文檔中的容器
document.body.appendChild(app.view);
// 監聽視窗大小變化事件
window.addEventListener('resize', resizeCanvas);

// 視窗大小變化時的處理函數
function resizeCanvas() {
    DPR = window.devicePixelRatio;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    createBackgoundBoard()
}

// 初始調用一次 resizeCanvas，確保畫布大小與視窗大小一致
resizeCanvas();

const blockColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFFFFF];

let currentBlock;
let board = createEmptyBoard();


function createBlock() {
    const block = new PIXI.Container();
    const color = blockColors[Math.floor(Math.random() * blockColors.length)];

    // 設定方塊的起始位置為背景中間上方
    const blockSize = 30 * DPR;
    const boardWidth = 10;
    const boardHeight = 20;
    const backgroundX = (app.screen.width - boardWidth * blockSize) / 2;
    const backgroundY = (app.screen.height - boardHeight * blockSize) / 2;
    block.x = backgroundX + (boardWidth / 2 - 1) * blockSize;// 設定 x 座標為中央
    block.y = backgroundY - blockSize; // 設定 y 座標為上方
    for (let i = 0; i < 4; i++) {
        const square = createSquare(color);
        square.x = i % 2 * blockSize;
        square.y = Math.floor(i / 2) * blockSize;
        block.addChild(square);
    }
    return block;
}

function createSquare(color) {
    const square = new PIXI.Graphics();
    square.beginFill(color);
    square.drawRect(0, 0, 30, 30);
    square.endFill();
    return square;
}

function createEmptyBoard() {
    const board = [];
    for (let i = 0; i < 20; i++) {
        const row = [];
        for (let j = 0; j < 10; j++) {
            row.push(null);
        }
        board.push(row);
    }
    return board;
}

function renderBoard() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const square = board[i][j];
            if (square !== null) {
                square.x = j * 30;
                square.y = i * 30;
            }
        }
    }
}


function isValidMove() {
    for (let i = 0; i < currentBlock.children.length; i++) {
        const square = currentBlock.children[i];
        const boardX = Math.floor((currentBlock.x + square.x - background.x) / 30);
        const boardY = Math.floor((currentBlock.y + square.y - background.y) / 30);
        // 檢查是否超出邊界
        if (boardY >= 20) {
            return false;
        }

        if (boardX < 0) {
            return false;
        }

        if (boardX >= 10) {
            currentBlock.x = background.x + 210;
        }

        // 檢查是否與其他方塊重疊
        // if (boardY >= 0 && board[boardY][boardX] !== null) {
        // return false;
        // }
    }

    return true;
}

function moveBlock(dx, dy) {
    currentBlock.x += dx;
    currentBlock.y += dy;
    if (!isValidMove()) {
        currentBlock.x -= dx;
        currentBlock.y -= dy;
    }
}

function rotateBlock() {
    currentBlock.rotation += Math.PI / 2;

    if (!isValidMove()) {
        // Revert the rotation if it's not valid
        currentBlock.rotation -= Math.PI / 2;
    }
}

function update() {
    if ((getMaxY() - background.y) / 30 == 20) {
        // 方塊到達底部或碰到其他方塊
        fixBlock();
        spawnNewBlock();
    }
    moveBlock(0, 30);

    app.renderer.render(app.stage);
    setTimeout(update, 1000);
}

function fixBlock() {
    // 固定方塊在底部，將方塊的每個方塊加入到 board 陣列中
    currentBlock.children.forEach(square => {
        console.log(square);
        const boardX = Math.floor((currentBlock.x + square.x - background.x) / 30);
        const boardY = Math.floor((currentBlock.y + square.y - background.y) / 30);
        board[boardY][boardX] = square;
    });

    // renderBoard(); // 顯示遊戲板
    // app.stage.removeChild(currentBlock);
}

function spawnNewBlock() {
    // 生成新的方塊
    currentBlock = createBlock();

    app.stage.addChildAt(currentBlock, 1);
}

function createBackgoundBoard() {
    background.clear();
    background.beginFill(0x121212); // 使用顏色 #121212 作為背景色

    const blockSize = 30 * DPR; // 方塊大小
    const boardWidth = 10;
    const boardHeight = 20;

    // 計算背景板的位置，使其位於畫面中央
    const backgroundX = (app.screen.width - boardWidth * blockSize) / 2;
    const backgroundY = (app.screen.height - boardHeight * blockSize) / 2;

    background.position.set(backgroundX, backgroundY);
    background.lineStyle(10, 0xffffff);
    background.drawRect(0, 0, blockSize * 10, blockSize * 20);
    // 繪製網格線條
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            const x = j * blockSize;
            const y = i * blockSize;

            // 使用灰色線條
            background.lineStyle(2, 0x666666); // 線條顏色 0x888888，寬度 1
            background.drawRect(x, y, blockSize, blockSize);
        }
    }

    background.endFill();

    // 將背景板添加到舞台
    app.stage.addChildAt(background, 0);
}

function getMaxY() {
    let maxY = -Infinity;

    for (let i = 0; i < currentBlock.children.length; i++) {
        const square = currentBlock.children[i];
        const squareGlobalPosition = square.getGlobalPosition();
        const squareMaxY = squareGlobalPosition.y + square.height;

        // 更新最大 Y 座標
        maxY = Math.max(maxY, squareMaxY);
    }

    return maxY;
}

function init() {
    currentBlock = createBlock();

    app.stage.addChildAt(currentBlock, 1);
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                moveBlock(-30, 0);
                break;
            case 'ArrowRight':
                moveBlock(30, 0);
                break;
            case 'ArrowDown':
                moveBlock(0, 30);
                break;
            case 'ArrowUp':
                rotateBlock();
                break;
        }
    });

    update();
}

init();
