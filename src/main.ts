import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
// Create a camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
// TODO need to set the intial look
camera.position.set(40, 30, -1);
camera.rotation.set(0, Math.PI / 2, 0);
// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 0, 0);
// controls.enablePan = false;
// controls.enableDamping = true;

const gltfLoader = new GLTFLoader();

gltfLoader.load('./assets/mobile-shop.gltf', (gltf)=>{
  scene.add(gltf.scene);
},undefined, function ( e ) {
  console.error( e );
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);


//add light
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(2,2,5);
scene.add(light)

// update canvas when resize happen
window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
};

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
  console.log(
   controls.object.position.clone());
   console.log(controls.object.rotation.clone());
   
}

animate();
