import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
let object;
let controls;
let objToRender = 'taipei101';
let mousePos = { x: undefined, y: undefined };
const loaders = new GLTFLoader();
loaders.load(
    `scene.gltf`,
    function (gltf) {
        object = gltf.scene;
        scene.add(object);
    },
    function (xhr) {
        console.log('已載入' + (xhr.loaded / xhr.total * 100) + '%')
    },
    function (error) {
        console.log(error);
    }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("container3D").appendChild(renderer.domElement);
camera.position.z = 150;

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 50, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);


function animate() {
    requestAnimationFrame(animate);

    if (object && objToRender === "taipei101") {
        object.rotation.y = -3 + mousePos.x / window.innerWidth * 3;
        object.rotation.x = -1.2 + mousePos.y * 2.5 / window.innerHeight;
    }
    renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
});
animate();