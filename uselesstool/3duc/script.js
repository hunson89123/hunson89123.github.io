import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, .1, 1000);
const msg = document.getElementById('msg');
const info = document.getElementById('info');
var object;
const loaders = new GLTFLoader();
loaders.load(
    `taipei101/scene.gltf`,
    function (gltf) {
        object = gltf.scene
        scene.add(object);

        //處理從101中心縮放
        var bbox = new THREE.Box3().setFromObject(object);

        var center = new THREE.Vector3();
        bbox.getCenter(center);

        var minPoint = bbox.min;
        var maxPoint = bbox.max;

        var verticalCenter = (minPoint.z + maxPoint.z) / 2;
        camera.position.set(minPoint.x - 50, minPoint.y, 0);
        camera.lookAt(scene.position);
    },
    function (xhr) {
        msg.innerText = (xhr.loaded / xhr.total * 100).toFixed(1) + "%"
    },
    function (error) {
        msg.innerText = error;
    }
);



const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);

document.getElementById("container3D").appendChild(renderer.domElement);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(100, 100, 100);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 使用淺黃色（PeachPuff）並設置強度為0.5
scene.add(ambientLight);

var pointLight = new THREE.PointLight(0xff0000, 1000, 1000); // 白色光，強度為1，距離為100的點光源
pointLight.position.set(2, -5, 0); // 設定光源位置，這裡假設燈光位於摩天大樓頂部的中心
scene.add(pointLight); // 將點光源添加到場景中

var pointLightHelper = new THREE.PointLightHelper(pointLight, 1); // 點光源Helper
scene.add(pointLightHelper); // 將點光源Helper添加到場景中

function animate() {
    requestAnimationFrame(animate);
    info.innerText = "相機座標：" + camera.position.x.toFixed(1) + " / " + camera.position.y.toFixed(1) + " / " + camera.position.z.toFixed(1);
    renderer.render(scene, camera);

    var amplitude = 1000; // 呼吸燈強度的振幅
    var period = 1000; // 呼吸燈的週期，以毫秒為單位
    var time = Date.now();
    var intensity = Math.sin(2 * Math.PI * time / period) * amplitude + amplitude; // 此處的Math.sin函數創建了一個週期性變化
    pointLight.intensity = intensity;

}



window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();