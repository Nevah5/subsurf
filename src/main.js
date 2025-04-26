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

// Create ground plane (wider and below the road)
const groundGeometry = new THREE.BoxGeometry(
  config.ground.width,
  0.1, // Very thin height
  config.ground.length,
  1, // Simple segments
  1,
  config.plane.lengthSegments
);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: config.ground.color,
  side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

// Position ground so it's below the road and stretches away
ground.position.y = config.ground.y;
ground.position.z = -config.ground.length / 2;
scene.add(ground);

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

// Function to create a single train track
function createTrack(xOffset) {
  const trackGroup = new THREE.Group();
  
  // Calculate the number of ties needed
  const numTies = Math.floor(config.plane.length / config.tracks.tieSpacing);
  
  // Create ballast (gravel bed under tracks)
  const ballastGeometry = new THREE.BoxGeometry(
    config.tracks.ballastWidth,
    config.tracks.ballastHeight,
    config.plane.length
  );
  const ballastMaterial = new THREE.MeshStandardMaterial({
    color: config.tracks.ballastColor,
    roughness: 0.9
  });
  const ballast = new THREE.Mesh(ballastGeometry, ballastMaterial);
  ballast.position.y = config.tracks.y;
  trackGroup.add(ballast);
  
  // Calculate rail positions
  const railDistance = config.tracks.tieLength * 0.75; // Distance between rails
  const leftRailX = -railDistance / 2;
  const rightRailX = railDistance / 2;
  
  // Create rails
  const railGeometry = new THREE.BoxGeometry(
    config.tracks.railWidth,
    config.tracks.railHeight,
    config.plane.length
  );
  const railMaterial = new THREE.MeshStandardMaterial({
    color: config.tracks.railColor,
    metalness: 0.6,
    roughness: 0.4
  });
  
  // Left rail
  const leftRail = new THREE.Mesh(railGeometry, railMaterial);
  leftRail.position.set(leftRailX, config.tracks.y + config.tracks.ballastHeight / 2 + config.tracks.railHeight / 2, 0);
  trackGroup.add(leftRail);
  
  // Right rail
  const rightRail = new THREE.Mesh(railGeometry, railMaterial);
  rightRail.position.set(rightRailX, config.tracks.y + config.tracks.ballastHeight / 2 + config.tracks.railHeight / 2, 0);
  trackGroup.add(rightRail);
  
  // Create railroad ties
  const tieGeometry = new THREE.BoxGeometry(
    config.tracks.tieLength,
    config.tracks.tieHeight,
    config.tracks.tieWidth
  );
  const tieMaterial = new THREE.MeshStandardMaterial({
    color: config.tracks.tieColor,
    roughness: 0.8
  });
  
  // Add ties along the track
  for (let i = 0; i < numTies; i++) {
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    const zPos = -i * config.tracks.tieSpacing - config.tracks.tieWidth / 2;
    tie.position.set(0, config.tracks.y + config.tracks.ballastHeight / 2 + config.tracks.tieHeight / 2, zPos);
    trackGroup.add(tie);
  }
  
  // Position the entire track
  trackGroup.position.x = xOffset;
  trackGroup.position.z = -config.plane.length / 2;
  
  return trackGroup;
}

// Function to create all train tracks
function createTracks() {
  const tracksGroup = new THREE.Group();
  
  // Calculate the starting offset for centering tracks
  const totalWidth = (config.tracks.count - 1) * config.tracks.spacing;
  const startX = -totalWidth / 2;
  
  // Create each track
  for (let i = 0; i < config.tracks.count; i++) {
    const xOffset = startX + i * config.tracks.spacing;
    const track = createTrack(xOffset);
    tracksGroup.add(track);
  }
  
  return tracksGroup;
}

// Create train tracks
const tracks = createTracks();
scene.add(tracks);

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
