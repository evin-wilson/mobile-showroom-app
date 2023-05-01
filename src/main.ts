import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const gltfLoader = new GLTFLoader();
// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
// Create a camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

gltfLoader.load('/assets/tabel.gltf', (gltf) => {
  const bbox = new THREE.Box3().setFromObject(gltf.scene);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());

  console.log('model size: ', size.x, size.y, size.z);
  
  // obj.position.set(0, 0, 0);
  
  // get the max dimension of the bounding box
  const maxDim = Math.max(size.x, size.y, size.z);
  
  // compute the distance required to fit the model within the camera's view
  const dist = maxDim / (2 * Math.tan(Math.PI * camera.fov / 360));

  // position the camera at the center of the bounding box and set its distance
  camera.position.copy(center);
  camera.position.z += dist;

  // point the camera at the center of the bounding box
  camera.lookAt(center);

  // set the model's position to the origin of the bounding box
  // gltf.scene.position.copy(center).multiplyScalar(-1);
  gltf.scene.position.set(3.5, 0, 0);
  scene.add(gltf.scene);
});

gltfLoader.load('./assets/showroom.gltf', (gltf)=>{
  gltf.scene.scale.setScalar(1)
  gltf.scene.position.set(3.5, 0, 0);
  scene.add(gltf.scene);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const floorGeometry = new THREE.PlaneGeometry(10, 10); // width, height
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff, // white color
  metalness: 0.3, // amount of metalness
  roughness: 0.8, // amount of roughness
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // rotate to lay flat on x-z plane
floor.receiveShadow = true; // allow the floor to receive shadows
scene.add(floor);

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
controls.minDistance=5;
controls.maxDistance=10;
// Render the scene
function animate() {
  requestAnimationFrame(animate);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  controls.update();
}
animate();
