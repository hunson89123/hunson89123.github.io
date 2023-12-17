
//document.getElementById('debuger').innerText = window.devicePixelRatio;
// 創建 PIXI 應用，指定畫布大小
const app = new PIXI.Application({
    backgroundColor: 0x1099bb,
});

let DPR = window.devicePixelRatio;
// 添加 PIXI 渲染器到 HTML 文檔中的容器
document.body.appendChild(app.view);
// 監聽視窗大小變化事件
window.addEventListener('resize', resizeCanvas);

// 視窗大小變化時的處理函數
function resizeCanvas() {
    app.renderer.resize(window.innerWidth, window.innerHeight);

    // 添加 PIXI 渲染器到 HTML 文檔中的容器
    document.body.appendChild(app.view);

    // 創建黑色邊框
    const border = new PIXI.Graphics();
    border.lineStyle(20, 0xff0000); // 使用黑色線條
    border.drawRect(1, 1, app.screen.width - 2, app.screen.height - 2); // 略小於舞台大小以形成邊框

    // 添加邊框到舞台
    app.stage.addChild(border);
}

// 初始調用一次 resizeCanvas，確保畫布大小與視窗大小一致
resizeCanvas();

// 添加 PIXI 渲染器到 HTML 文檔中的容器
document.body.appendChild(app.view);

// 創建 Container 來管理 bunnies
const bunnyContainer = new PIXI.Container();
app.stage.addChild(bunnyContainer);

// 監聽螢幕點擊事件
app.view.addEventListener('click', onScreenClick);

function onScreenClick(event) {
    // 獲取點擊的位置座標
    const clickX = event.clientX - app.view.getBoundingClientRect().left;
    const clickY = event.clientY - app.view.getBoundingClientRect().top;

    // 加載精靈圖片
    PIXI.Assets.add('bunny', 'bunny.png');
    const texturesPromise = PIXI.Assets.load(['bunny']);

    texturesPromise.then((textures) => {
        const bunny = PIXI.Sprite.from(textures.bunny);

        // 設置精靈的錨點為中心
        bunny.anchor.set(0.5);

        // 設置精靈的初始位置
        bunny.x = app.screen.width / 2;
        bunny.y = app.screen.height;
        bunny.scale.set(0.1 * window.devicePixelRatio);

        // 將精靈添加到舞台
        app.stage.addChild(bunny);

        // 計算射向的方向向量
        const directionX = clickX - bunny.x;
        const directionY = clickY - bunny.y;

        // 計算向量的長度
        const length = Math.sqrt(directionX * directionX + directionY * directionY);

        // 設置速度
        const speed = 10;

        // 計算速度向量
        const velocityX = (directionX / length) * speed;
        const velocityY = (directionY / length) * speed;

        // 設置精靈的角度
        bunny.rotation = Math.atan2(velocityY, velocityX) + Math.PI / 2;

        // 在動畫循環中移動精靈
        app.ticker.add(() => {
            bunny.x += velocityX;
            bunny.y += velocityY;

            // 檢查是否飛出螢幕外
            if (bunny.y < -bunny.height) {
                // 移除精靈
                app.stage.removeChild(bunny);
            }
        });
    });
}
