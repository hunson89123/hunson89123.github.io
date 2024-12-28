
const { Sprite, Container } = PIXI;
const { diffuseGroup, normalGroup, lightGroup, PointLight, AmbientLight } = PIXI.lights;
const { Layer, Stage } = PIXI.layers;
var webAppUrl = "https://script.google.com/macros/s/AKfycbygnkGZc0BQitYAGKH4jHFg1IGJgFdKPu-y3VXv97e7EUa2xGMUbvp8aASrWvnEE4_OPQ/exec";
var clickCunter = 0;

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x121212,
    antialias: true,
});
document.getElementById("fireworkArea").appendChild(app.view);

app.stage = new Stage();
//variation為色相角度範圍大小，角度越大隨機到的顏色差異越大
function getRandomColor(baseColor, variation = 87) {
    const hueVariation = Math.random() * variation - variation / 2;
    const finalHue = (baseColor + hueVariation) % 360;
    return PIXI.utils.string2hex(`hsl(${finalHue}, 100%, 50%)`);
}

function launchFirework(x, y) {
    const particleCount = Math.random() * 187 + 87;
    const baseColor = Math.random() * 360; // 基準色

    for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Graphics();
        const size = Math.random() * 3;//煙火粒子效果寬度
        const length = Math.random() * 30 + 10;//煙火粒子效果長度

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
        const distance = Math.random() * 360 / 360 * 300;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;

        // 計算粒子的旋轉角度，使其朝向飛行方向
        particle.rotation = Math.atan2(targetY - y, targetX - x);

        app.stage.addChild(particle);

        const duration = (particleCount - 87) / 187 * 0.5 + 1;

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
        url: 'firework' + (Math.floor(Math.random() * 5) + 1) + '.mp3',
        preload: true,
        loaded: function (err, sound) {
            sound.volume = (particleCount - 87) / 360 * 5;//音量隨粒子數量調整
            sound.play({
                filters: [
                    new PIXI.sound.filters.StereoFilter((x / window.innerWidth) * 2 - 1),//聲道控制(-1左1右，透過x軸除以頁面寬度來決定左右聲道)
                ],
            });
        }
    });
    const light = new PointLight(getRandomColor(baseColor), (particleCount - 87) / 187 * 0.5);
    light.x = x;
    light.y = y;


    // Create a background container 
    const background = new Container();
    background.addChild(light);

    app.stage.addChild(new Layer(lightGroup), background);

    const duration = (particleCount - 87) / 100; // 光源閃爍持續時間
    gsap.to(light, {
        alpha: 0,
        duration: duration,
        onComplete: () => {
            background.removeChild(light);
        }
    });

    //紀錄次數
    incrementCounter();
}

function launchWillowFireworks(x, y) {
    const container = new PIXI.Container();

    const colors = [
        0xFF0000, // 紅色
        0xFFFF00, // 黃色
        0x00FF00, // 綠色
        0x0000FF, // 藍色
        0xFF00FF, // 紫色
        0xFFFFFF  // 白色
    ];

    const count = 50; // 煙火粒子數量

    for (let i = 0; i < count; i++) {
        const particle = new PIXI.Graphics();
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 4 + 1; // 粒子大小
        const speed = Math.random() * 5 + 2; // 粒子速度
        const angle = Math.random() * Math.PI * 2; // 粒子飛行角度

        particle.beginFill(color);
        particle.drawCircle(0, 0, size);
        particle.endFill();

        particle.position.set(x, y);

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        particle.vx = vx;
        particle.vy = vy;

        const distance = Math.random() * 360 / 360 * 300;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;

        container.addChild(particle);
        app.stage.addChild(container);

        gsap.to(container, {
            x: targetX,
            y: targetY,
            duration: 5,
            ease: "power1.line",
            onComplete: () => {
                app.stage.removeChild(container);
            }
        });
    }
}

function launchFireworkOnMove(event) {
    const x = event.clientX;
    const y = event.clientY;
    launchFirework(x, y);

}

async function fetchCounter() {
    const response = await fetch(webAppUrl);
    const counter = await response.text();
    const counterElement = document.getElementById("counter");
    counterElement.innerHTML = '<span>共施放了 </span><span id="counter_num">-</span><span> 次煙火</span>';
    counterElement.style.color = "#FFFFFB";

    const counterNumElement = document.getElementById("counter_num");
    counterNumElement.style.color = getRandomColorString(Math.random() * 360);
    counterNumElement.textContent = counter;
}

async function incrementCounter() {
    await fetch(webAppUrl, { method: "POST" });
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
    }, Math.random() * 1000);
}

function getRandomColorString(baseColor, variation = 87) {
    const hueVariation = Math.random() * variation - variation / 2;
    const finalHue = (baseColor + hueVariation) % 360;
    return `hsl(${finalHue}, 100%, 75%)`;
}

// 開始動畫
animate();