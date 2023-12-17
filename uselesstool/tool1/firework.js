const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x121212,
    resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view);

function getRandomColor(baseColor, variation = 30) {
    const hueVariation = Math.random() * variation - variation / 2;
    const finalHue = (baseColor + hueVariation) % 360;
    return PIXI.utils.string2hex(`hsl(${finalHue}, 100%, 50%)`);
}

function launchFirework(x, y) {
    const particleCount = 100;
    const baseColor = Math.random() * 360; // 基準色

    for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Graphics();
        const size = Math.random() * 3;
        const length = Math.random() * 100 + 10;

        particle.lineStyle({
            width: size,
            color: getRandomColor(baseColor),
            cap: PIXI.LINE_CAP.ROUND,
            join: PIXI.LINE_JOIN.ROUND,
        });

        particle.moveTo(0, 0);
        particle.lineTo(length, 0);

        particle.position.x = x;
        particle.position.y = y;

        const angle = Math.PI * 2 * Math.random();
        const distance = Math.random() * 500;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;

        // 計算粒子的旋轉角度，使其朝向飛行方向
        particle.rotation = Math.atan2(targetY - y, targetX - x);

        app.stage.addChild(particle);

        const duration = 1;

        gsap.to(particle, {
            x: targetX,
            y: targetY,
            alpha: 0,
            duration: duration,
            ease: "power1.line",
            onComplete: () => {
                app.stage.removeChild(particle);
            },
        });
    }
}

app.stage.interactive = true; // 啟用舞台的交互性

window.addEventListener("pointerdown", (event) => {
    // 在這裡處理點擊事件
    const x = event.x;
    const y = event.y;
    launchFirework(x, y);
})


window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

setInterval(function () {
    var rndW = Math.random() * window.innerWidth;
    var rndH = Math.random() * window.innerHeight;
    launchFirework(rndW, rndH);
}, 1000)
