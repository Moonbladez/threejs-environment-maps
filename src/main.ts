import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GroundProjectedSkybox } from "three/addons/objects/GroundProjectedSkybox.js";

import "./style.css";

/**
 * Loaders
 */

const gltfLoader = new GLTFLoader();
// const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = global.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Base
 */
// Debug
const gui = new GUI();
const global = {
  envMapIntensity: 1,
  blur: 0.1,
  backgroundIntensity: 1,
};
const backgroundFolder = gui.addFolder("Background");
const modelFolder = gui.addFolder("Model");
modelFolder.add(global, "envMapIntensity").min(0).max(10).step(0.001).name("Intensity").onChange(updateAllMaterials);
backgroundFolder
  .add(global, "blur")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Blur")
  .onChange(() => {
    scene.backgroundBlurriness = global.blur;
  });
backgroundFolder
  .add(global, "backgroundIntensity")
  .min(0.5)
  .max(5)
  .step(0.5)
  .name("Intensity")
  .onChange(() => {
    scene.backgroundIntensity = global.backgroundIntensity;
  });

// Canvas
const canvas = document.querySelector("canvas") as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();
/**
 * Environment map
 */
rgbeLoader.load("/environmentMaps/2/2k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;

  const skybox = new GroundProjectedSkybox(texture);
  skybox.height = 7;
  skybox.scale.setScalar(50);
  skybox.radius = 190;
  scene.add(skybox);

  gui.add(skybox, "radius").min(1).max(200).step(0.1).name("Radius");
  gui.add(skybox, "height").min(1).max(200).step(0.1).name("Height");
});
// const environmentMap = cubeTextureLoader.load([
//   "/environmentMaps/0/px.png",
//   "/environmentMaps/0/nx.png",
//   "/environmentMaps/0/py.png",
//   "/environmentMaps/0/ny.png",
//   "/environmentMaps/0/pz.png",
//   "/environmentMaps/0/nz.png",
// ]);
// scene.environment = environmentMap;
// scene.background = environmentMap;

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({
    roughness: 0.3,
    metalness: 1,
    color: 0xaaaaaa,
  })
);
torusKnot.position.set(-4, 4, 0);

// scene.add(torusKnot);

/**
 * Models
 */
gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(10, 10, 10);
  gltf.scene.position.set(0, 0, 0);
  scene.add(gltf.scene);

  modelFolder.add(gltf.scene.rotation, "y").min(-Math.PI).max(Math.PI).step(0.001).name("rotation");

  updateAllMaterials();
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 5, 10);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
// const clock = new THREE.Clock();
const tick = () => {
  // Time
  // const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
