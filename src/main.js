import * as THREE from 'three';
import config from './config.js';
import './style.css';

// Import modules
import { setupMenu } from './modules/ui.js';
import { 
  createScene, createCamera, createRenderer, 
  createGround, createRoad, setupLighting,
  setupResizeHandler 
} from './modules/scene.js';
import { createTracks } from './modules/track.js';
import { createHouses } from './modules/house.js';
import { createCharacter, setupCharacterControls } from './modules/character.js';

// Game state
let isPlaying = false;
let lastTime = 0;
let worldSegments = []; // Store world segments for infinite generation
let lastGeneratedPosition = 0; // Track the last position where we generated a segment

// Initialize scene
const scene = createScene();
const camera = createCamera(config);

// Place camera at initial position where it can see the character
camera.position.z = 5; // Position camera just behind character's start position

const renderer = createRenderer(config);
document.body.appendChild(renderer.domElement);

// Create environment for the initial segment
const initialSegment = new THREE.Group();
scene.add(initialSegment);

// Create ground
const ground = createGround(config);
initialSegment.add(ground);

// Create road
const road = createRoad(config);
initialSegment.add(road);

// Create tracks
const tracks = createTracks(config);
initialSegment.add(tracks);

// Create houses
const houses = createHouses(config);
initialSegment.add(houses);

// Add the initial segment to the world segments array
worldSegments.push({
  object: initialSegment,
  zPosition: 0
});

// Create character
const character = createCharacter(config);
character.initTrackPositions(config.tracks.spacing);
scene.add(character.object);

// Setup character controls
setupCharacterControls(character);

// Add lighting
setupLighting(scene);

// Handle window resize
setupResizeHandler(camera, renderer);

// Function to generate a new world segment at the given z position
function generateWorldSegment(zPosition) {
  const segmentLength = 500; // Length of each new segment
  
  // Create a new segment group
  const segment = new THREE.Group();
  segment.position.z = zPosition;
  
  // Add road extension
  const roadSegment = createRoad(config);
  roadSegment.position.z = 0; // Position at the start of the segment
  segment.add(roadSegment);
  
  // Add ground extension
  const groundSegment = createGround(config);
  groundSegment.position.z = 0; // Position at the start of the segment
  segment.add(groundSegment);
  
  // Add track extension
  const tracksSegment = createTracks(config);
  tracksSegment.position.z = 0; // Position at the start of the segment
  segment.add(tracksSegment);
  
  // Modify the houses config temporarily for this segment to ensure proper placement
  const houseConfig = { ...config };
  houseConfig.houses = { ...config.houses };
  houseConfig.houses.startZ = 0; // Start houses at the beginning of this segment
  
  // Add houses extension
  const housesSegment = createHouses(houseConfig);
  segment.add(housesSegment);
  
  // Add segment to the scene and track it
  scene.add(segment);
  worldSegments.push({
    object: segment,
    zPosition: zPosition
  });
  
  // Update the last generated position
  lastGeneratedPosition = zPosition - segmentLength;
  
  return segment;
}

// Function to manage world generation
function updateWorld() {
  // Generate new segments as the character moves forward
  const characterZ = character.object.position.z;
  const generationDistance = 300; // Distance ahead to maintain generated world
  
  // Check if we need to generate a new segment
  if (characterZ < lastGeneratedPosition + generationDistance) {
    generateWorldSegment(lastGeneratedPosition);
  }
  
  // Clean up old segments far behind the character
  const cleanupDistance = 500; // Distance behind character to remove segments
  worldSegments = worldSegments.filter(segment => {
    if (segment.zPosition > characterZ + cleanupDistance) {
      scene.remove(segment.object);
      return false;
    }
    return true;
  });
}

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);
  
  // Calculate delta time for smooth animation
  const delta = lastTime === 0 ? 0 : (time - lastTime) / 1000;
  lastTime = time;
  
  // Update game state
  if (isPlaying) {
    // Update character position and animation
    character.update(delta);
    
    // Move camera to follow character
    camera.position.z = character.object.position.z + 10; // Position camera behind character
    
    // Update world generation
    updateWorld();
  }
  
  renderer.render(scene, camera);
}

// Start animation
animate(0);

// Initialize UI
setupMenu(config);

// Start game when play button is clicked
document.getElementById('play-button').addEventListener('click', () => {
  isPlaying = true;
  
  // Initialize world generation
  lastGeneratedPosition = -config.plane.length; // Start at the end of the initial plane
  generateWorldSegment(lastGeneratedPosition); // Generate the first additional segment
});
