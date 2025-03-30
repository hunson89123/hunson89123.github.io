const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
resizeCanvas();

window.addEventListener("resize", resizeCanvas);
document.addEventListener("click", (event) => createFirework(event.clientX, event.clientY));

let fireworks = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createFirework(x, y) {
    const particleCount = 1000; // 可以調整
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2; // 隨機角度
        const speed = Math.random() * 3 + 3; // 粒子的初速度

        // 從下方發射，並向外噴發（x, y 為起點）
        particles.push({
            x, // 起始位置
            y,
            vx: Math.cos(angle) * speed, // 水平速度
            vy: -Math.random() * 2 - 4, // 垂直速度（向上）
            life: Math.random() * 50 + 50, // 粒子壽命
            size: Math.random() * 2 + 1, // 粒子大小
            color: `hsl(${Math.random() * 360}, 100%, 70%)`, // 隨機顏色
        });
    }

    fireworks.push(particles);
}

function animate() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // 半透明背景，讓煙火逐漸消失
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach((firework, index) => {
        firework.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.5; // 重力影響

            p.life--; // 減少壽命

            // 畫粒子
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 移除已經消失的煙火
        fireworks[index] = firework.filter((p) => p.life > 0);
    });

    fireworks = fireworks.filter((fw) => fw.length > 0); // 清除死亡的煙火
    requestAnimationFrame(animate);
}

animate();
