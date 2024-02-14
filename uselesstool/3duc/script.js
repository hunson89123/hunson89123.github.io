import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, .1, 1000);
const msg = document.getElementById('msg');
let object;
let objToRender = 'taipei101';
let mousePos = { x: 0, y: 0 };
const loaders = new GLTFLoader();
loaders.load(
    `earth/scene.gltf`,
    function (gltf) {
        object = gltf.scene;
        scene.add(object);

        /* 處理地糗軸心置中問題 */
        var box = new THREE.Box3().setFromObject(object);
        box.getCenter(object.position); // this re-sets the object position
        object.position.multiplyScalar(- 1);

        var pivot = new THREE.Group();
        scene.add(pivot);
        pivot.add(object);
    },
    function (xhr) {
        msg.innerText = (xhr.loaded / xhr.total * 100) + '%'
    },
    function (error) {
        msg.innerText = error;
    }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);

document.getElementById("container3D").appendChild(renderer.domElement);
camera.position.z = 15;

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 50, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x000000, 5);
scene.add(ambientLight);


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// 添加陀螺儀控制
function handleOrientation(event) {
    var x = event.beta;  // 在[-180, 180]之間，表示前後傾斜。
    var y = event.gamma; // 在[-90, 90]之間，表示左右傾斜。
    object.rotation.x = x * Math.PI / 180;
    object.rotation.y = y * Math.PI / 180;
}

window.addEventListener("deviceorientation", handleOrientation, true);

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();