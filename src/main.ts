import { GUI } from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let phones: THREE.Object3D[] = [];

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

let mouseMoved = false;
let mouseClciked = false;

let updatedTarget: THREE.Vector3;
let orginalTarget: THREE.Vector3;

const intersetObj = {
  intersects: false,
  obj: new THREE.Mesh(),
  orginalRotation: new THREE.Euler(),
  normal: new THREE.Vector3(),
};

const modal = document.querySelector("#modal") as HTMLElement;
const modalCanvas = document.querySelector("#modal-canvas") as HTMLElement;
const modalwidth = 800; //modalCanvas.offsetWidth;
const modalheight = 500; //modalCanvas.offsetHeight;

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Create a scene for modal window
const modalscene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(50,  window.innerWidth / window.innerHeight, 0.1, 1000);
const pos = new THREE.Vector3(12, 5.5, -1.1); //31, 13, -6.8
camera.position.copy(pos); //28, 17, -5

// Create a camera for modal window
const modalcamera = new THREE.PerspectiveCamera(50, modalwidth / modalheight, 0.1, 1000);
modalcamera.position.z = 5;

// Create a renderer
const canvas = document.querySelector("#main-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// renderer for modal window
const modalRenderer = new THREE.WebGLRenderer({
  canvas: modalCanvas,
  antialias: true,
});
modalRenderer.setSize(modalwidth, modalheight);
// make renderer transparent
modalRenderer.setClearColor(0x000000, 0); // Use the alpha value of 0 to make the scene transparent
modalRenderer.setClearAlpha(0);

// Add a sample mesh to modal window
// TODO nned to update this mesh according to the modal clicked
const circleGeometry = new THREE.CircleGeometry(1, 32); // Adjust the radius and segments as desired
const circleMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
});
const circlePicker = new THREE.Mesh(circleGeometry, circleMaterial);
modalscene.add(circlePicker);

// Created OrbitCOntrols
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.addEventListener("change", () => (mouseMoved = true));

// orbit contols for modal window
const modalcontrols = new OrbitControls(modalcamera, modalCanvas);
modalcontrols.enablePan = false;
modalcontrols.enableDamping = true;
modalcontrols.dampingFactor = 0.1;

const gltfLoader = new GLTFLoader(loadingManager());

gltfLoader.load( "./assets/mobile-shop.glb", (gltf) => {
    const mobileShop = gltf.scene;
    gltf.scene.traverse((child) => {
      if (child.name === "phones") {
        phones.push(...child.children);
      }
    });
    scene.add(mobileShop);

    const boundingBox = new THREE.Box3().setFromObject(mobileShop);
    const center = boundingBox.getCenter(new THREE.Vector3());
    orginalTarget = center.clone();
    controls.target.copy(center);

    center.x -= 2;
    updatedTarget = center.clone();
  },
  undefined,
  function (e) {
    console.error(e);
  }
);

function loadingManager() {
  const progressBar = document.getElementById('progress-bar') as HTMLProgressElement
  const progressBarContainer = document.querySelector('.progress-bar-container') as HTMLElement

  const manager = new THREE.LoadingManager();
  manager.onLoad = () => progressBarContainer.style.display = 'none';
  manager.onProgress = (url, itemsLoaded, itemsTotal) => progressBar.value = (itemsLoaded / itemsTotal) * 100
  manager.onError = (url) => console.log('There was an error loading ' + url);

  return manager;
}

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

  positionFolder.add(cameraValues.position, "x", -100, 100, 0.1).name("x");
  positionFolder.add(cameraValues.position, "y", -100, 100, 0.1).name("y");
  positionFolder.add(cameraValues.position, "z", -100, 100, 0.1).name("z");

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

// TODO
function resetMaterials() {
  let intialRotation = new THREE.Euler(0, 0, 0);
  let initialScale = new THREE.Vector3(1, 1, 1);
  intersetObj.obj.scale.copy(initialScale);
  // intersetObj.obj.rotation.copy(intialRotation);
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
      intersetObj.intersects = true;
      intersetObj.obj = intersectedObject;
      intersetObj.orginalRotation = intersectedObject.rotation.clone();

      intersectedObject.scale.set(1, 1.2, 1.2);

      // addSelectionCircle(minPoint, 0.1, 0.3);
      // drawthenormal(intersects[i])
    }
  }
}

function addSelectionCircle(position, PositionOffset, radius) {
  // Define an offset value to position the circle picker above the lowest point
  const offset = PositionOffset;

  // Add a circle picker to the intersected object
  const circleGeometry = new THREE.CircleGeometry(radius, 32);
  const circleMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });
  const circlePicker = new THREE.Mesh(circleGeometry, circleMaterial);

  // Position the circle picker slightly above the lowest point of the intersected object
  circlePicker.position.set(position.x, position.y + offset, position.z);

  // Rotate the circle picker to face upwards
  circlePicker.rotation.x = -Math.PI / 2; // Rotate 90 degrees around the x-axis

  // Add the circle picker to the scene
  scene.add(circlePicker);
}

function helperSphere(radius: number, position: THREE.Vector3, color?: THREE.ColorRepresentation) {
  if (color === undefined) {
    const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
    color = randomColor;
  }
  const helperGeometry = new THREE.SphereGeometry(radius, 16, 16);
  const helperMaterial = new THREE.MeshBasicMaterial({ color: color });
  const helperModel = new THREE.Mesh(helperGeometry, helperMaterial);
  helperModel.position.copy(position);
  scene.add(helperModel);
}

function drawthenormal(intersects) {
  let ptOnCurve = intersects.point; // intersected pt
  let faceNormal = intersects.face.normal.normalize(); // face normal

  // draw the normal
  let normalPts = [];
  let p1 = new THREE.Vector3(ptOnCurve.x, ptOnCurve.y, ptOnCurve.z).clone();
  let p2 = faceNormal.clone().multiplyScalar(10).add(p1);
  normalPts.push(p1);
  normalPts.push(p2);

  let linematerial = new THREE.LineBasicMaterial({ color: 0x0000ff });
  let linegeometry = new THREE.BufferGeometry().setFromPoints(normalPts);
  let line = new THREE.Line(linegeometry, linematerial);
  scene.add(line);
}

function phoneSelected() {
  controls.target.copy(updatedTarget);
  camera.position.y += 5;
  camera.position.x -= 3;
  modal.style.display = "block";
}

function phoneDeselected() {
  modal.style.display = "none";
  controls.target.copy(orginalTarget);
  camera.position.copy(pos);
}

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();

  modalRenderer.render(modalscene, modalcamera);
  modalcontrols.update();
}

// gui_adder();
animate();

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    phoneDeselected();
  }
});
window.addEventListener("resize", onWindowResize);
window.addEventListener("pointerdown", () => (mouseMoved = false));
window.addEventListener("pointerup", (event) => {
  if (mouseMoved === false) {
    checkIntersection(event);

    if (mouseClciked) {
      phoneSelected();
    }
  }
});
window.addEventListener("pointermove", checkIntersection);
