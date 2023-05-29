import { GUI } from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let phones: THREE.Object3D[] = [];

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

let mouseMoved = false;
let mouseClciked = false;

const modal = document.querySelector("#modal") as HTMLElement;
const modalCanvas = document.querySelector('#modal-canvas') as HTMLElement;

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
const canvas = document.querySelector("#main-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Created OrbitCOntrols
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.addEventListener("change", () => (mouseMoved = true));

const gltfLoader = new GLTFLoader();

gltfLoader.load( "./assets/mobile-shop-collection.gltf", (gltf) => {
    const model = gltf.scene;
    gltf.scene.traverse((child) => {
      if (child.name === "phones") {
        phones.push(...child.children);
      }
    });
    scene.add(model);

    const boundingBox = new THREE.Box3().setFromObject(model);
    const center = boundingBox.getCenter(new THREE.Vector3());

    controls.target.copy(center);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
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
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// function to add dat.gui
function gui_adder() {
  const gui = new GUI();
  const cameraFolder = gui.addFolder("Camera");
  let positionFolder = cameraFolder.addFolder("Position");
  let rotationFolder = cameraFolder.addFolder("Rotation");

  // Create a separate object to hold the camera position and rotation
  const cameraValues = {
    position: camera.position.clone(),
    rotation: camera.rotation.clone(),
  };

  positionFolder.add(cameraValues.position, "x", -100, 100).name("x");
  positionFolder.add(cameraValues.position, "y", -100, 100).name("y");
  positionFolder.add(cameraValues.position, "z", -100, 100).name("z");

  rotationFolder.add(cameraValues.rotation, "x", -Math.PI, Math.PI).name("x");
  rotationFolder.add(cameraValues.rotation, "y", -Math.PI, Math.PI).name("y");
  rotationFolder.add(cameraValues.rotation, "z", -Math.PI, Math.PI).name("z");

  // Update camera position and rotation when dat.gui values change
  positionFolder.__controllers.forEach((controller) => {
    controller.onChange(function () {
      camera.position.copy(cameraValues.position);
    });
  });

  rotationFolder.__controllers.forEach((controller) => {
    controller.onChange(function () {
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

function resetMaterials() {
  // Remove the circle pickers from the scene
  const circlePickers = scene.children.filter(
    (child) => child instanceof THREE.Mesh
  );
  for (let i = 0; i < circlePickers.length; i++) {
    scene.remove(circlePickers[i]);
  }
}

function checkIntersection(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(phones);

  if (intersects.length > 0) {
    mouseClciked = true;
  } else {
    mouseClciked = false;
    resetMaterials();
  }
  for (let i = 0; i < intersects.length; i++) {
    let intersectedObject = intersects[i].object;
    if (intersectedObject instanceof THREE.Mesh) {
      // Compute the bounding box of the intersected object
      const boundingBox = new THREE.Box3().setFromObject(intersectedObject);
      const minPoint = boundingBox.min;

      // Define an offset value to position the circle picker above the lowest point
      const offset = 0.1;

      // Add a circle picker to the intersected object
      const circleGeometry = new THREE.CircleGeometry(1, 32); // Adjust the radius and segments as desired
      const circleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
      }); // Set the desired color
      const circlePicker = new THREE.Mesh(circleGeometry, circleMaterial);

      // Position the circle picker slightly above the lowest point of the intersected object
      circlePicker.position.set(minPoint.x, minPoint.y + offset, minPoint.z);

      // Rotate the circle picker to face upwards
      circlePicker.rotation.x = -Math.PI / 2; // Rotate 90 degrees around the x-axis

      // Add the circle picker to the scene
      scene.add(circlePicker);
    }
  }
}

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

gui_adder();
animate();


modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
window.addEventListener("resize", onWindowResize);
window.addEventListener("pointerdown", () => (mouseMoved = false));
window.addEventListener("pointerup", (event) => {
  if (mouseMoved === false) {
    checkIntersection(event);

    if (mouseClciked) {
      modal.style.display = "block";
    }
  }
});
window.addEventListener("pointermove", checkIntersection);
