import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const gltfLoader = new GLTFLoader();
// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
// Create a camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(70, 0, -30);
// camera.position.set(0, 0, 0);
// camera.rotateZ(Math.PI/2)

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

gltfLoader.load('./assets/mobile-shop.gltf', (gltf)=>{
  gltf.scene.scale.setScalar(1)
  scene.add(gltf.scene);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);


//add light
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(2,2,5);
scene.add(light)

//arrow for directional light
const arrowHelper = new THREE.ArrowHelper(
  light.position.clone().normalize(),
  light.position,
  1,
  0xffffff
);
scene.add(arrowHelper);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.minDistance=5;
// controls.maxDistance=10;
// Render the scene
function animate() {
  requestAnimationFrame(animate);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  controls.update();

  controls.addEventListener( "change", event => {  
    console.log( controls.object.position ); 
})
  
}
animate();
