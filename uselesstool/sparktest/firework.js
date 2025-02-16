const { diffuseGroup, normalGroup, lightGroup, PointLight, AmbientLight } = PIXI.lights;
const { Layer, Stage } = PIXI.layers;

let mX, mY;
let baseColor;
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x121212,
    antialias: true,
});
document.getElementById("fireworkArea").appendChild(app.view);
app.stage = new Stage();

const fireworkParticles = [];
let isDrawing = false;
let drawInterval;

const background = new PIXI.Container();

function getRandomColor(baseColor, variation = 87) {
    const hueVariation = Math.random() * variation - variation / 2;
    const finalHue = (baseColor + hueVariation) % 360;
    return PIXI.utils.string2hex(`hsl(${finalHue}, 100%, 50%)`);
}

function createFirework(x, y) {
    const numParticles = Math.random() * 187 + 87;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
        const particle = new PIXI.Graphics();
        const size = Math.random() * 300;//煙火粒子效果寬度
        const length = Math.random() * 10//煙火粒子效果長度

        const color = getRandomColor(baseColor);
        const segments = 1000;  // 線段數量

        particle.lineStyle(2, color, 1);
        particle.moveTo(0, 0);

        for (let j = 0; j <= segments; j++) {
            // 計算當前透明度，從 1 到 0
            const alpha = j / segments;

            // 計算每段線的顏色和透明度
            const px = (j / segments) * length;
            const py = 0;  // 簡單的水平方向

            // 設定每段線的透明度
            particle.lineStyle(2, color, alpha);  // 每段線的透明度從1到0
            particle.lineTo(px, py);  // 畫線段
        }

        particle.x = x;
        particle.y = y;

        app.stage.addChild(particle);

        const light = new PointLight(getRandomColor(baseColor), 0);
        light.x = x;
        light.y = y;
        background.addChild(light);
        app.stage.addChild(new PIXI.layers.Layer(lightGroup), background);

        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        const distance = Math.random() * 360 / 360 * 300;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;

        particle.rotation = Math.atan2(targetY - y, targetX - x);
        particles.push({ sprite: particle, velocity, alpha: 1, light });
    }

    fireworkParticles.push(particles);
}

function animateFireworks() {
    fireworkParticles.forEach((particles, index) => {
        particles.forEach((p, i) => {
            p.sprite.x += p.velocity.x;
            p.sprite.y += p.velocity.y;
            // p.light.x = p.sprite.x;
            // p.light.y = p.sprite.y;
            p.velocity.y += 0.05; // Gravity effect
            p.alpha -= 0.02; // Tail effect
            p.sprite.alpha = p.alpha;
            // p.light.brightness = p.alpha * 0.005;

            if (p.alpha <= 0) {
                app.stage.removeChild(p.sprite);
                background.removeChild(p.light);
                particles.splice(i, 1);
            }
        });
        if (particles.length === 0) {
            fireworkParticles.splice(index, 1);
        }
    });
}

app.ticker.add(() => {
    animateFireworks();
});

function startDrawing(x, y) {
    baseColor = Math.random() * 360;
    updateDrawing(x, y);
    if (!isDrawing) {
        isDrawing = true;
        createFirework(x, y);
        drawInterval = setInterval(() => createFirework(mX, mY), 50);
    }
}

function stopDrawing() {
    isDrawing = false;
    clearInterval(drawInterval);
}

function updateDrawing(x, y) {
    mX = x;
    mY = y;
    if (isDrawing) {
        createFirework(x, y);
    }
}

app.view.addEventListener('mousedown', (e) => startDrawing(e.clientX, e.clientY));
app.view.addEventListener('mouseup', stopDrawing);
app.view.addEventListener('mouseleave', stopDrawing);
app.view.addEventListener('mousemove', (e) => updateDrawing(e.clientX, e.clientY));

app.view.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDrawing(touch.clientX, touch.clientY);
});
app.view.addEventListener('touchend', stopDrawing);
app.view.addEventListener('touchcancel', stopDrawing);
app.view.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    updateDrawing(touch.clientX, touch.clientY);
});
