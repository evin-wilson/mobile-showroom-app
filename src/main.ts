import { GUI } from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Create a camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const pos = new THREE.Vector3(31, 13, -6.8);
camera.position.copy(pos); //28, 17, -5

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Created OrbitCOntrols
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const gltfLoader = new GLTFLoader();

gltfLoader.load("./assets/mobile-shop.gltf", (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  const boundingBox = new THREE.Box3().setFromObject(model);
  const center = boundingBox.getCenter(new THREE.Vector3());

  controls.target.copy(center);
  },
  undefined,
  function (e) {
    console.error(e);
  }
);

//add light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// update canvas when resize happen
window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

// function to add dat.gui
function gui_adder() {
  const gui = new GUI();
  const cameraFolder = gui.addFolder("Camera");
  let positionFolder = cameraFolder.addFolder("Position");
  let rotationFolder = cameraFolder.addFolder("Rotation");

  // Create a separate object to hold the camera position and rotation
  const cameraValues = {
    position: camera.position.clone(),
    rotation: camera.rotation.clone()
  };

  positionFolder.add(cameraValues.position, "x", -100, 100).name("x");
  positionFolder.add(cameraValues.position, "y", -100, 100).name("y");
  positionFolder.add(cameraValues.position, "z", -100, 100).name("z");

  rotationFolder.add(cameraValues.rotation, "x", -Math.PI, Math.PI).name("x");
  rotationFolder.add(cameraValues.rotation, "y", -Math.PI, Math.PI).name("y");
  rotationFolder.add(cameraValues.rotation, "z", -Math.PI, Math.PI).name("z");

  // Update camera position and rotation when dat.gui values change
  positionFolder.__controllers.forEach(controller => {
    controller.onChange(function() {
      camera.position.copy(cameraValues.position);
    });
  });

  rotationFolder.__controllers.forEach(controller => {
    controller.onChange(function() {
      camera.rotation.copy(cameraValues.rotation);
    });
  });

  // Create OrbitControls and update dat.gui values when controls change
  controls.addEventListener("change", function () {
    cameraValues.position.copy(camera.position);
    cameraValues.rotation.copy(camera.rotation);
    gui.updateDisplay();
  });
}

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

gui_adder();
animate();
