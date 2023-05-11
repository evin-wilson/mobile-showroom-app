import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const gltfLoader = new GLTFLoader();
// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
// Create a camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-1.7, 0, 8.7);
camera.lookAt(1.7, 0, 8.7);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xA3A3A3);

gltfLoader.load('/assets/scene.gltf', (gltf) => {
  scene.add(gltf.scene);
});

//add light
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(2,2,5);
scene.add(light)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance=5;
controls.maxDistance=50;
// Render the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
animate();
