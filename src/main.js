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
import { 
  createCoins, checkCoinCollisions, 
  createCoinUI, updateCoinUI, showCoinUI 
} from './modules/coin.js';
import {
  createTrainGenerator,
  checkTrainCollisions
} from './modules/train.js';

// Game state
let isPlaying = false;
let gameOver = false;
let lastTime = 0;
let worldChunks = []; // Store world chunks
let nextChunkPosition = 0; // Position for the next chunk
const CHUNK_LENGTH = 200; // Length of each world chunk
const VISIBLE_CHUNKS = 2; // Number of chunks to keep visible ahead of player
let coinCount = 0;
let coinUI;
let coins = { positions: [] }; // Initialize empty coins object
let trainGenerator;

// Initialize scene
const scene = createScene();
const camera = createCamera(config);

// Place camera at initial position where it can see the character
camera.position.z = 5; // Position camera just behind character's start position

const renderer = createRenderer(config);
document.body.appendChild(renderer.domElement);

// Create pre-game display (tracks visible before starting game)
const initialTracks = createTracks(config);
scene.add(initialTracks);

// Create character
const character = createCharacter(config);
character.initTrackPositions(config.tracks.spacing);
scene.add(character.object);

// Setup character controls
setupCharacterControls(character);

// Create the coin UI but don't show it yet
coinUI = createCoinUI();

// Create game over UI
const gameOverUI = createGameOverUI();

// Create train generator
trainGenerator = createTrainGenerator(config, scene);

// Add lighting
setupLighting(scene);

// Handle window resize
setupResizeHandler(camera, renderer);

// Create a world chunk at the specified z-position
function createWorldChunk(startZ) {
  const chunk = new THREE.Group();
  
  // Create a chunk-specific config with modified starting position for elements
  const chunkConfig = JSON.parse(JSON.stringify(config)); // Deep clone
  chunkConfig.houses.startZ = 0; // Reset to 0 for the chunk's local space
  
  // Create ground for this chunk
  const ground = createGround(chunkConfig);
  ground.position.z = -CHUNK_LENGTH / 2; // Center in the chunk
  chunk.add(ground);
  
  // Create road for this chunk
  const road = createRoad(chunkConfig);
  road.position.z = -CHUNK_LENGTH / 2; // Center in the chunk
  chunk.add(road);
  
  // Create tracks for this chunk
  const tracks = createTracks(chunkConfig);
  tracks.position.z = -CHUNK_LENGTH / 2; // Center in the chunk
  chunk.add(tracks);
  
  // Create houses for this chunk - houses handle their own positioning
  const houses = createHouses(chunkConfig);
  chunk.add(houses);
  
  // Generate coins for this chunk if it's not the first chunk
  if (startZ < 0) {
    // Calculate track positions based on the config
    const trackPositions = [];
    const totalWidth = (config.tracks.count - 1) * config.tracks.spacing;
    const startX = -totalWidth / 2;
    
    for (let i = 0; i < config.tracks.count; i++) {
      trackPositions.push(startX + i * config.tracks.spacing);
    }
    
    // Generate coins for this chunk
    const chunkCoins = createCoins(config, trackPositions);
    
    // Adjust positions for the chunk's local space
    chunkCoins.group.position.z = -CHUNK_LENGTH / 2;
    
    // Add to the chunk
    chunk.add(chunkCoins.group);
    
    // Adjust coin position data for global space and add to overall coins
    chunkCoins.positions.forEach(coin => {
      coin.z += startZ - CHUNK_LENGTH / 2; // Adjust z for global space
      coins.positions.push(coin);
    });
  }
  
  // Position the entire chunk
  chunk.position.z = startZ;
  
  // Add to scene and tracking array
  scene.add(chunk);
  worldChunks.push({
    object: chunk,
    startZ: startZ,
    endZ: startZ - CHUNK_LENGTH
  });
  
  return chunk;
}

// Initialize the world with starting chunks
function initializeWorld() {
  // Remove initial display elements
  scene.remove(initialTracks);
  
  // Clear any existing chunks
  worldChunks.forEach(chunk => {
    scene.remove(chunk.object);
  });
  worldChunks = [];
  
  // Reset coin count
  coinCount = 0;
  coins.positions = [];
  updateCoinUI(coinUI, coinCount);
  
  // Reset trains
  trainGenerator.reset();
  
  // Reset game state
  gameOver = false;
  hideGameOverUI();
  
  // Create initial chunks starting from 0 (character's position)
  // and going forward into the negative z direction
  nextChunkPosition = 0;
  for (let i = 0; i < VISIBLE_CHUNKS; i++) {
    createWorldChunk(nextChunkPosition);
    nextChunkPosition -= CHUNK_LENGTH;
  }
}

// Update world chunks based on character position
function updateWorld() {
  if (!isPlaying || gameOver) return;
  
  const characterZ = character.object.position.z;
  
  // Check if we need to generate new chunks ahead
  const farthestChunkZ = nextChunkPosition + CHUNK_LENGTH;
  const generationThreshold = characterZ - (VISIBLE_CHUNKS * CHUNK_LENGTH);
  
  if (generationThreshold < farthestChunkZ) {
    createWorldChunk(nextChunkPosition);
    nextChunkPosition -= CHUNK_LENGTH;
  }
  
  // Remove chunks that are too far behind the character
  const removalThreshold = characterZ + CHUNK_LENGTH * 2;
  
  worldChunks = worldChunks.filter(chunk => {
    if (chunk.startZ > removalThreshold) {
      scene.remove(chunk.object);
      return false;
    }
    return true;
  });
  
  // Check for coin collisions
  const newCoins = checkCoinCollisions(character, coins, config);
  if (newCoins > 0) {
    coinCount += newCoins;
    updateCoinUI(coinUI, coinCount);
  }
  
  // Animate coins - rotation
  coins.positions.forEach(coin => {
    if (!coin.collected) {
      coin.object.rotation.z += config.coins.rotationSpeed * 0.01;
    }
  });
}

// Create Game Over UI
function createGameOverUI() {
  // Create container
  const container = document.createElement('div');
  container.id = 'game-over';
  container.style.position = 'absolute';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  container.style.color = '#FFFFFF';
  container.style.padding = '30px';
  container.style.borderRadius = '10px';
  container.style.textAlign = 'center';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.zIndex = '1000';
  container.style.display = 'none';
  
  // Game over title
  const title = document.createElement('h1');
  title.textContent = 'GAME OVER';
  title.style.fontSize = '48px';
  title.style.margin = '0 0 20px 0';
  title.style.color = '#FF4500';
  
  // Score display
  const scoreText = document.createElement('div');
  scoreText.id = 'final-score';
  scoreText.textContent = 'Coins collected: 0';
  scoreText.style.fontSize = '24px';
  scoreText.style.margin = '10px 0 30px 0';
  
  // Retry button
  const retryButton = document.createElement('button');
  retryButton.textContent = 'Try Again';
  retryButton.style.backgroundColor = '#4CAF50';
  retryButton.style.color = '#FFFFFF';
  retryButton.style.border = 'none';
  retryButton.style.padding = '12px 24px';
  retryButton.style.fontSize = '18px';
  retryButton.style.borderRadius = '5px';
  retryButton.style.cursor = 'pointer';
  retryButton.style.fontWeight = 'bold';
  
  retryButton.addEventListener('click', () => {
    // Reset character position
    character.object.position.set(
      character.trackPositions[1], // Middle track
      config.character.height / 2 + 0.2,
      0
    );
    character.currentTrack = 1;
    
    // Restart game
    initializeWorld();
    isPlaying = true;
  });
  
  // Assemble UI
  container.appendChild(title);
  container.appendChild(scoreText);
  container.appendChild(retryButton);
  
  // Add to document
  document.body.appendChild(container);
  
  return {
    container,
    scoreText,
    show: (score) => {
      scoreText.textContent = `Coins collected: ${score}`;
      container.style.display = 'block';
    },
    hide: () => {
      container.style.display = 'none';
    }
  };
}

// Show game over UI
function showGameOverUI() {
  gameOverUI.show(coinCount);
}

// Hide game over UI
function hideGameOverUI() {
  gameOverUI.hide();
}

// End the game
function endGame() {
  gameOver = true;
  showGameOverUI();
}

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);
  
  // Calculate delta time for smooth animation
  const delta = lastTime === 0 ? 0 : (time - lastTime) / 1000;
  lastTime = time;
  
  // Update game state
  if (isPlaying && !gameOver) {
    // Update character position and animation
    character.update(delta);
    
    // Update trains
    const trains = trainGenerator.update(delta, character.object.position.z);
    
    // Check train collisions
    const collisionResult = checkTrainCollisions(character, trains, config);
    if (collisionResult.collision) {
      // Player hit a train - game over
      endGame();
    } else if (collisionResult.onTopOfTrain) {
      // Player is riding on top of a train - slightly elevate character
      character.object.position.y = config.train.height + config.tracks.y + 
                                    config.tracks.railHeight + config.character.height / 2 + 0.2;
    } else {
      // Player is on the track - normal height
      character.object.position.y = config.character.height / 2 + 0.2;
    }
    
    // Move camera to follow character
    camera.position.z = character.object.position.z + 10; // Position camera behind character
    
    // Update world chunks
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
  showCoinUI(coinUI);
  initializeWorld();
});
