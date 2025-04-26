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

// Helper function to get a random number between min and max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Helper function to get a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
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

// Function to create houses on both sides of the road
function createHouses() {
  // Create a group to hold all houses
  const housesGroup = new THREE.Group();
  
  // Create houses for both sides of the road
  [-1, 1].forEach(side => {
    let lastZ = config.houses.startZ;
    let lastWidth = 0;
    
    // Create houses for one side
    for (let i = 0; i < config.houses.count; i++) {
      // Calculate size
      const width = random(config.houses.size.width.min, config.houses.size.width.max);
      const height = random(config.houses.size.height.min, config.houses.size.height.max);
      const depth = random(config.houses.size.depth.min, config.houses.size.depth.max);
      
      // Calculate position
      const distance = random(config.houses.distanceFromRoad.min, config.houses.distanceFromRoad.max);
      const x = side * (config.plane.width / 2 + distance + width / 2);
      
      // Calculate Z position to ensure blocks touch
      // Add half of previous block's depth and half of current block's depth
      lastZ = lastZ - (lastWidth / 2) - (depth / 2);
      lastWidth = depth;
      
      // Add some randomness to Z position (but ensure they still touch)
      const z = lastZ - random(0, 0.5);
      
      // Create the building geometry and material
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({
        color: randomItem(config.houses.colors),
        roughness: 0.7,
      });
      
      // Create the building mesh
      const house = new THREE.Mesh(geometry, material);
      
      // Position the building
      house.position.set(x, height / 2, z);
      
      // Add to the group
      housesGroup.add(house);
      
      // For the next house
      lastZ = z - (depth / 2);
    }
  });
  
  // Add the group to the scene
  scene.add(housesGroup);
  
  return housesGroup;
}

// Create houses
const houses = createHouses();

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
