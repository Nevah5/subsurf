import * as THREE from 'three';
import config from './config.js';
import './style.css';

// Setup menu from config
function setupMenu() {
  const menuTitle = document.getElementById('menu-title');
  const playButton = document.getElementById('play-button');
  const settingsButton = document.getElementById('settings-button');

  // Apply title text and color from config
  menuTitle.textContent = config.menu.title.text;
  menuTitle.style.color = config.menu.title.color;

  // Apply play button text and styles
  playButton.textContent = config.menu.buttons.play.text;
  playButton.style.color = config.menu.buttons.play.color;
  playButton.style.backgroundColor = config.menu.buttons.play.backgroundColor;

  // Apply settings button text and styles
  settingsButton.textContent = config.menu.buttons.settings.text;
  settingsButton.style.color = config.menu.buttons.settings.color;
  settingsButton.style.backgroundColor = config.menu.buttons.settings.backgroundColor;

  // Button event listeners
  playButton.addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
  });

  settingsButton.addEventListener('click', () => {
    alert('Settings not implemented yet');
  });
}

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
  config.camera.fov,
  window.innerWidth / window.innerHeight,
  config.camera.near,
  config.camera.far
);
camera.position.set(
  config.camera.position.x,
  config.camera.position.y,
  config.camera.position.z
);

// Apply camera rotation
camera.rotation.x = config.camera.rotation.x;
camera.rotation.y = config.camera.rotation.y;
camera.rotation.z = config.camera.rotation.z;

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(config.renderer.pixelRatio);
renderer.setClearColor(config.renderer.clearColor);
document.body.appendChild(renderer.domElement);

// Create plane - using BoxGeometry for better stretching
const planeGeometry = new THREE.BoxGeometry(
  config.plane.width,
  0.1, // Very thin height
  config.plane.length,
  config.plane.widthSegments,
  1,
  config.plane.lengthSegments
);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: config.plane.color,
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

// Position plane so it stretches away from the camera
plane.position.z = -config.plane.length / 2;
scene.add(plane);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Initialize
setupMenu();
animate();
