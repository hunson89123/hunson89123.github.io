import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
let scene, camera, renderer, particles, fireworks = [], buildings = [];
let canvas2D, ctx2D;

function init() {
    // 初始化場景
    scene = new THREE.Scene();

    // 初始化相機
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.zIndex = '1'; // WebGL 輸出在上層
    document.body.appendChild(renderer.domElement);

    // 初始化 2D Canvas 層
    canvas2D = document.createElement('canvas');
    canvas2D.style.zIndex = '0'; // 2D canvas 在底層
    canvas2D.width = window.innerWidth;
    canvas2D.height = window.innerHeight;
    canvas2D.style.position = 'absolute';
    canvas2D.style.top = '0';
    canvas2D.style.left = '0';
    canvas2D.style.pointerEvents = 'none';
    canvas2D.style.zIndex = '1';
    ctx2D = canvas2D.getContext('2d');
    document.body.appendChild(canvas2D);

    // 軌道控制器
    new OrbitControls(camera, renderer.domElement);

    // 載入 GLTF 大樓模型
    createBuildings();

    // 加上 AxesHelper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 視窗調整
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function createBuildings() {
    const loader = new GLTFLoader();
    loader.load(
        './taipei101/_taipei101.gltf',
        (gltf) => {
            const building = gltf.scene;
            building.scale.set(1, 1, 1);
            building.position.set(0, 0, 0);

            building.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material && child.material.isMeshStandardMaterial) {
                        child.material.emissive = new THREE.Color(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                }
            });

            buildings.push(building);
            scene.add(building);
        },
        undefined,
        (error) => {
            console.error('載入 GLTF 失敗:', error);
        }
    );

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(5, 10, 5);
    scene.add(ambient, directional);
}

function createFirework(event) {
    const x = event.clientX;
    const y = event.clientY;

    const rect = canvas2D.getBoundingClientRect();
    const posX = x - rect.left;
    const posY = y - rect.top;

    const particleCount = 100;
    const particles = [];
    const color = `hsl(${Math.random() * 360}, 100%, 70%)`;

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        particles.push({
            x: posX,
            y: posY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            life: Math.random() * 60 + 40,
            color,
            size: Math.random() * 2 + 1
        });
    }
    fireworks.push(particles);

    const mouse = new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(buildings, true);

    if (intersects.length > 0) {
        const b = intersects[0].object;
        b.material.emissive.set(color);
        b.material.emissiveIntensity = 1;
        setTimeout(() => b.material.emissiveIntensity = 0, 300);
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    ctx2D.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx2D.fillRect(0, 0, canvas2D.width, canvas2D.height);
    ctx2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
    ctx2D.globalCompositeOperation = 'lighter';
    fireworks.forEach((particles, i) => {
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.life--;

            ctx2D.save();
            ctx2D.globalAlpha = Math.max(p.life / 100, 0);
            ctx2D.shadowColor = p.color;
            ctx2D.shadowBlur = 20;
            ctx2D.fillStyle = p.color;
            ctx2D.beginPath();
            ctx2D.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx2D.fill();
            ctx2D.restore();
        });
        fireworks[i] = particles.filter(p => p.life > 0);
    });
    fireworks = fireworks.filter(p => p.length > 0);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas2D.width = window.innerWidth;
    canvas2D.height = window.innerHeight;
}

document.addEventListener('click', createFirework);
init();
