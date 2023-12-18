const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x121212,
});

document.body.appendChild(app.view);

//variation為色相角度範圍大小，角度越大隨機到的顏色差異越大
function getRandomColor(baseColor, variation = 87) {
    const hueVariation = Math.random() * variation - variation / 2;
    const finalHue = (baseColor + hueVariation) % 360;
    return PIXI.utils.string2hex(`hsl(${finalHue}, 100%, 50%)`);
}

function launchFirework(x, y) {
    const particleCount = 100;
    const baseColor = Math.random() * 360; // 基準色

    for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Graphics();
        const size = Math.random() * 3;//煙火粒子效果寬度
        const length = Math.random() * 100 + 10;//煙火粒子效果長度

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
    //播放音效
    PIXI.sound.Sound.from({
        url: 'explode' + (Math.floor(Math.random() * 8) + 1) + '.wav',
        preload: true,
        loaded: function (err, sound) {
            sound.volume = Math.random() * 3;//隨機音量
            sound.play({
                start: .5,
                filters: [
                    new PIXI.sound.filters.StereoFilter((x / window.innerWidth) * 2 - 1),//聲道控制(-1左1右，透過x軸除以頁面寬度來決定左右聲道)
                ],
            });
            //利用延遲製造回音
            setTimeout(function () {
                sound.play({
                    volume: .1,
                    filters: [
                        new PIXI.sound.filters.StereoFilter((x / window.innerWidth) * 2 - 1),
                    ],
                });
            }, 100);
        }
    });
}

function launchFireworkOnMove(event) {
    const x = event.clientX;
    const y = event.clientY;
    launchFirework(x, y);
}

window.addEventListener("pointerdown", (event) => {
    const x = event.clientX;
    const y = event.clientY;
    launchFirework(x, y);

    // 綁定 pointermove 事件
    // window.addEventListener("pointermove", launchFireworkOnMove);
});

window.addEventListener("pointerup", () => {
    // 移除 pointermove 事件
    window.removeEventListener("pointermove", launchFireworkOnMove);
});


window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

function animate() {
    var rndW = Math.random() * window.innerWidth;
    var rndH = Math.random() * window.innerHeight;
    launchFirework(rndW, rndH);
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000);
}

// 開始動畫
animate();