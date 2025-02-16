import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { PMREMGenerator } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, .1, 1000);
const msg = document.getElementById('msg');
const info = document.getElementById('info');
const manager = new THREE.LoadingManager();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
var intersects;

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};
var object;
let fireworks = [];
const loaders = new GLTFLoader(manager);
loaders.load(
    `taipei101/scene.gltf`,
    (gltf) => {
        object = gltf.scene
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhysicalMaterial({
                    metalness: 1.0,  // 完全鏡面效果
                    roughness: 0.0,  // 無粗糙度
                    envMap: scene.environment,  // 讓鏡面反射環境
                    side: THREE.FrontSide // 避免內部樓層影響
                });
            }
        });

        scene.add(object);
        var bbox = new THREE.Box3().setFromObject(object);

        var center = new THREE.Vector3();
        bbox.getCenter(center);

        var minPoint = bbox.min;
        var maxPoint = bbox.max;

        var verticalCenter = (minPoint.z + maxPoint.z) / 2;

        scene.fog = new THREE.FogExp2(0xaaaaaa, 0.00005); // 調整密度來讓遠處模糊
        // 創建地板（大型平面）
        const groundGeometry = new THREE.PlaneGeometry(10000, 10000); // 設定大小
        const groundMaterial = new THREE.MeshStandardMaterial({
            metalness: 1,
            roughness: 0,
            envMap: scene.environment,
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = - Math.PI / 2; // 旋轉為水平面
        ground.position.y = minPoint.y; // 根據模型高度調整，避免漂浮
        scene.add(ground);

        camera.position.set(minPoint.x - 50, minPoint.y, 0);
        camera.lookAt(scene.position);
        msg.style.display = 'none';
    },
    (xhr) => {
        if (xhr.lengthComputable) {
            msg.innerText = `載入模型中...`;
        }
    },
    (error) => {
        console.error('An error happened', error);
        msg.innerText = '載入模型發生錯誤!';
    }
);

const exrLoader = new EXRLoader();

exrLoader.load('textures/NightSkyHDRI013_4K-HDR.exr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping; // 設定為球形貼圖
    scene.environment = texture; // 設定環境光貼圖
    scene.background = texture; // 設定背景（可選）

    // 如果場景太亮，可降低曝光
    renderer.toneMappingExposure = 0.01; // 0.5 = 降低亮度
});


const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMappingExposure = 0.5; // 0.5 代表降低亮度，1.0 是預設值

const controls = new OrbitControls(camera, renderer.domElement);

document.getElementById("container3D").appendChild(renderer.domElement);

// const topLight = new THREE.DirectionalLight(0xffffff, .1);
// topLight.position.set(100, 100, 100);
// topLight.castShadow = true;
// scene.add(topLight);

// const ambientLight = new THREE.AmbientLight(0xffffff, 0); // 使用淺黃色（PeachPuff）並設置強度為0.5
// scene.add(ambientLight);

var pointLight = new THREE.PointLight(0xff0000, 0, 0); // 白色光，強度為1，距離為100的點光源
pointLight.position.set(2, -5, 0); // 設定光源位置，這裡假設燈光位於摩天大樓頂部的中心
scene.add(pointLight); // 將點光源添加到場景中

var pointLightHelper = new THREE.PointLightHelper(pointLight, 0); // 點光源Helper
// scene.add(pointLightHelper); // 將點光源Helper添加到場景中

class Firework {
    constructor() {
        this.particleCount = 100;
        this.geometry = new THREE.BufferGeometry();
        this.positions = [];
        this.colors = [];
        this.velocities = [];
        this.accelerations = [];
        this.color = new THREE.Color();
        this.lights = [];
        this.init();
    }

    init() {
        let position_range = 100;
        let baseColor = Math.random() * 360;
        let initialPosition;
        if (intersects.length > 0) {
            const intersect = intersects[0];
            console.log('Intersection:', intersect.point);
            initialPosition = intersect.point;
        } else {
            initialPosition = new THREE.Vector3(
                Math.random() * position_range,
                Math.random() * position_range,
                Math.random() * position_range
            );
        }

        for (let i = 0; i < this.particleCount; i++) {
            // 初始位置
            this.positions.push(initialPosition.x, initialPosition.y, initialPosition.z);

            // 随机颜色
            const hueVariation = Math.random() * 87 - 87 / 2;
            const finalHue = ((baseColor + hueVariation) % 360) / 360;
            this.color.setHSL(finalHue, 1.0, 0.5);
            this.colors.push(this.color.r, this.color.g, this.color.b);

            // 随机速度
            const speed = 0.5 + Math.random() * 2;
            const theta = Math.random() * Math.PI; // 极角范围在 [0, PI]
            const phi = Math.random() * Math.PI * 2; // 方位角范围在 [0, 2*PI]
            const velocity = new THREE.Vector3(
                speed * Math.sin(theta) * Math.cos(phi),
                speed * Math.sin(theta) * Math.sin(phi),
                speed * Math.cos(theta)
            );
            this.velocities.push(velocity);
            this.accelerations.push(new THREE.Vector3(0, -0.02, 0)); // 模擬重力
        }

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));

        this.material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.particles = new THREE.Points(this.geometry, this.material);

        console.log(parseInt(this.colors[0] * 255));
        const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')

        const particle_light = new THREE.PointLight(rgbToHex(parseInt(this.colors[0] * 255), parseInt(this.colors[1] * 255), parseInt(this.colors[2] * 255)), 10000, 10000);
        particle_light.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        var particle_pointLightHelper = new THREE.PointLightHelper(particle_light, 10); // 點光源Helper
        // scene.add(particle_pointLightHelper); // 將點光源Helper添加到場景中
        scene.add(particle_light);
        const duration = 1;
        gsap.to(particle_light, {
            intensity: 0,
            duration: duration,
            onComplete: () => {
                scene.remove(particle_light);
                scene.remove(particle_pointLightHelper);
            }
        });
        scene.add(this.particles);
    }

    update() {
        const positions = this.geometry.attributes.position.array;

        for (let i = 0; i < this.particleCount; i++) {
            // 更新速度和位置
            const velocity = this.velocities[i];
            const acceleration = this.accelerations[i];
            velocity.add(acceleration);

            positions[i * 3] += velocity.x;
            positions[i * 3 + 1] += velocity.y;
            positions[i * 3 + 2] += velocity.z;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}

function createFireworks() {
    // 将鼠标位置转换到标准设备坐标 (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // 更新射线投射器
    raycaster.setFromCamera(mouse, camera);

    // 计算与射线相交的对象
    intersects = raycaster.intersectObjects(scene.children);


    const firework = new Firework();
    fireworks.push(firework);
}

// Bloom effect
const renderPass = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass();
bloomPass.strength = 300;
bloomPass.radius = 1;
bloomPass.threshold = 0.5;
composer.addPass(bloomPass);

function animate() {
    requestAnimationFrame(animate);
    info.innerText = "相機座標：" + camera.position.x.toFixed(1) + " / " + camera.position.y.toFixed(1) + " / " + camera.position.z.toFixed(1);
    renderer.render(scene, camera);

    var amplitude = 10; // 呼吸燈強度的振幅
    var period = 1000; // 呼吸燈的週期，以毫秒為單位
    var time = Date.now();
    var intensity = Math.sin(2 * Math.PI * time / period) * amplitude + amplitude; // 此處的Math.sin函數創建了一個週期性變化
    pointLight.intensity = intensity;

    fireworks.forEach(firework => firework.update());
}



window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', () => {
    createFireworks();
}, false);

function onClick(event) {

}
animate();