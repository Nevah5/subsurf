import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Function to create a train with variable length
export function createTrain(config, trackIndex, startZ, length) {
  const trainGroup = new THREE.Group();
  
  // Calculate track position
  const trackCount = config.tracks.count;
  const spacing = config.tracks.spacing;
  const totalWidth = (trackCount - 1) * spacing;
  const startX = -totalWidth / 2;
  const trackX = startX + trackIndex * spacing;
  
  // Create locomotive (front part)
  const locomotiveGeometry = new THREE.BoxGeometry(
    config.train.width,
    config.train.height,
    config.train.locomotiveLength
  );
  
  const locomotiveMaterial = new THREE.MeshStandardMaterial({
    color: config.train.locomotiveColor,
    metalness: 0.7,
    roughness: 0.3
  });
  
  const locomotive = new THREE.Mesh(locomotiveGeometry, locomotiveMaterial);
  locomotive.position.set(
    0,
    config.train.height / 2 + config.tracks.y + config.tracks.railHeight,
    -config.train.locomotiveLength / 2
  );
  trainGroup.add(locomotive);
  
  // Add front window
  const windowGeometry = new THREE.BoxGeometry(
    config.train.width * 0.6,
    config.train.height * 0.4,
    0.1
  );
  
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: config.train.windowColor,
    transparent: true,
    opacity: 0.7
  });
  
  const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
  frontWindow.position.set(
    0,
    config.train.height * 0.2,
    -0.1
  );
  locomotive.add(frontWindow);
  
  // Add wagons based on the requested length
  const wagonCount = Math.ceil((length - config.train.locomotiveLength) / config.train.wagonLength);
  
  for (let i = 0; i < wagonCount; i++) {
    const wagonGeometry = new THREE.BoxGeometry(
      config.train.width * 0.9,
      config.train.height * 0.9,
      config.train.wagonLength
    );
    
    // Alternate wagon colors for visual interest
    const wagonColor = i % 2 === 0 ? 
      config.train.wagonColor1 : 
      config.train.wagonColor2;
    
    const wagonMaterial = new THREE.MeshStandardMaterial({
      color: wagonColor,
      metalness: 0.6,
      roughness: 0.4
    });
    
    const wagon = new THREE.Mesh(wagonGeometry, wagonMaterial);
    
    // Position each wagon behind the locomotive/previous wagon with a small gap
    const wagonZ = -config.train.locomotiveLength - (i * config.train.wagonLength) - 
                  ((i + 1) * config.train.gap) - config.train.wagonLength / 2;
    
    wagon.position.set(
      0,
      (config.train.height * 0.9) / 2 + config.tracks.y + config.tracks.railHeight,
      wagonZ
    );
    
    trainGroup.add(wagon);
  }
  
  // Position the entire train at the specified track
  trainGroup.position.x = trackX;
  trainGroup.position.z = startZ;
  
  // Create train object with state and methods
  const train = {
    object: trainGroup,
    trackIndex: trackIndex,
    speed: config.train.speed,
    length: length,
    active: true,
    hitbox: null, // Will store hitbox visualization if debug is enabled
    // Collision boundaries
    getBounds() {
      const position = this.object.position;
      // Apply hitbox scaling from config
      const hitboxConfig = config.train.hitbox;
      const width = config.train.width * hitboxConfig.widthScale;
      const height = config.train.height * hitboxConfig.heightScale;
      const length = this.length * hitboxConfig.lengthScale;
      
      return {
        frontZ: position.z,
        backZ: position.z - length,
        trackIndex: this.trackIndex,
        topY: position.y + height / 2,
        bottomY: position.y - height / 2,
        width: width,
        height: height,
        length: length
      };
    },
    // Update train position
    update(delta) {
      if (!this.active) return;
      
      // Move train toward player (positive z)
      this.object.position.z += this.speed * delta;
      
      // Update hitbox visualization if it exists
      if (this.hitbox) {
        this.hitbox.position.copy(this.object.position);
        // Adjust position to center the hitbox
        const bounds = this.getBounds();
        this.hitbox.position.z -= this.length / 2;
      }
    }
  };
  
  return train;
}

/**
 * Creates a train generator that handles train creation and movement
 * @param {Object} config - The game configuration
 * @param {THREE.Scene} scene - The THREE.js scene
 * @returns {Object} The train generator with methods for updating and managing trains
 */
export function createTrainGenerator(config, scene) {
  // Store all active trains in the scene
  const trains = [];
  
  // Track time since last train spawn
  let timeSinceLastSpawn = 0;
  
  // Store loaded tram model for reuse
  let tramModel = null;
  const modelLoader = new GLTFLoader();
  
  // Load the tram model once and store it
  modelLoader.load(
    config.train.model.path,
    (gltf) => {
      tramModel = gltf.scene;
      console.log("Tram model loaded successfully");
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% tram model loaded');
    },
    (error) => {
      console.error('Error loading tram model:', error);
    }
  );
  
  // Create a hitbox visualization for debugging
  function createHitboxVisualization(train) {
    if (!config.debug.enabled || !config.debug.showHitboxes) return null;
    
    const bounds = train.getBounds();
    const hitboxGeometry = new THREE.BoxGeometry(
      bounds.width,
      bounds.height,
      bounds.length
    );
    
    const hitboxMaterial = new THREE.MeshBasicMaterial({
      color: config.debug.colors.trainHitbox,
      transparent: true,
      opacity: config.debug.hitboxOpacity,
      wireframe: true
    });
    
    const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
    hitbox.position.copy(train.object.position);
    hitbox.position.z -= train.length / 2; // Center on the train's length
    
    scene.add(hitbox);
    return hitbox;
  }
  
  // Generate a train with random number of cars using the tram model
  function generateTrain(trackIndex, playerZ = 0) {
    const trackPositions = calculateTrackPositions(config);
    const x = trackPositions[trackIndex];
    
    // Create train group
    const trainGroup = new THREE.Group();
    
    // If model is not loaded yet, wait for next frame
    if (!tramModel) {
      setTimeout(() => generateTrain(trackIndex, playerZ), 500);
      return;
    }
    
    // Choose a random number of cars for this train
    const minCars = config.train.model.numCars.min;
    const maxCars = config.train.model.numCars.max;
    const numCars = Math.floor(Math.random() * (maxCars - minCars + 1)) + minCars;
    
    // Calculate total train length based on the tram model
    // Here we use an approximation based on the visual size of the tram
    const carLength = config.train.locomotiveLength; // Use the locomotive length as a reference
    let trainLength = 0;
    
    // Create and add tram cars
    for (let i = 0; i < numCars; i++) {
      // Clone the model for each car
      const tramCar = tramModel.clone();
      
      // Scale the model
      const scale = config.train.model.scale;
      tramCar.scale.set(scale, scale, scale);
      
      // Position this car based on the total train length so far
      tramCar.position.z = -trainLength;
      
      // Rotate to face the correct direction
      tramCar.rotation.y = Math.PI; // Rotate 180 degrees to face forward
      
      // Add to train group
      trainGroup.add(tramCar);
      
      // Update train length for next car positioning
      trainLength += carLength + config.train.model.carSpacing;
    }
    
    // Adjust final train length to account for the last car
    trainLength = Math.max(trainLength, config.train.minLength);
    
    // Position the train relative to the player's position
    // Always spawn a fixed distance away from the player rather than at a fixed position in the world
    const spawnDistance = 300; // Distance behind player to spawn train
    const startZ = playerZ - spawnDistance;
    
    // Calculate the appropriate Y position based on the track and model
    const yPos = config.tracks.y + config.tracks.railHeight + config.train.model.yOffset;
    
    trainGroup.position.set(x, yPos, startZ);
    
    // Add to scene
    scene.add(trainGroup);
    
    // Create train object
    const train = {
      object: trainGroup,
      trackIndex: trackIndex,
      length: trainLength,
      speed: config.train.speed,
      removed: false,
      hitbox: null,
      
      // Get bounds for collision detection
      getBounds() {
        const position = this.object.position;
        // Apply hitbox scaling from config
        const hitboxConfig = config.train.hitbox;
        const width = config.train.width * hitboxConfig.widthScale;
        const height = config.train.height * hitboxConfig.heightScale;
        const length = this.length * hitboxConfig.lengthScale;
        
        return {
          frontZ: position.z,
          backZ: position.z - length,
          trackIndex: this.trackIndex,
          topY: position.y + height / 2,
          bottomY: position.y - height / 2,
          width: width,
          height: height,
          length: length
        };
      },
      
      // Update train position and hitbox
      update(delta) {
        if (this.removed) return;
        
        // Move train forward
        this.object.position.z += this.speed * delta;
        
        // Update hitbox visualization if it exists
        if (this.hitbox) {
          this.hitbox.position.copy(this.object.position);
          // Adjust position to center the hitbox
          this.hitbox.position.z -= this.length / 2;
        }
      }
    };
    
    // Create hitbox visualization if debug mode is enabled
    if (config.debug.enabled && config.debug.showHitboxes) {
      train.hitbox = createHitboxVisualization(train);
    }
    
    // Add to train array with metadata
    trains.push(train);
  }
  
  // Calculate valid track positions based on config
  function calculateTrackPositions(config) {
    const trackPositions = [];
    const totalWidth = (config.tracks.count - 1) * config.tracks.spacing;
    const startX = -totalWidth / 2;
    
    for (let i = 0; i < config.tracks.count; i++) {
      trackPositions.push(startX + i * config.tracks.spacing);
    }
    
    return trackPositions;
  }
  
  // Generate initial train on a random track
  setTimeout(() => {
    const randomTrack = Math.floor(Math.random() * config.tracks.count);
    generateTrain(randomTrack, 0); // Initial spawn at origin
  }, 1000); // Slight delay to ensure model is loaded
  
  // Toggle debug hitboxes for all trains
  function toggleHitboxes(enabled) {
    trains.forEach(train => {
      if (enabled && !train.hitbox) {
        train.hitbox = createHitboxVisualization(train);
      } else if (!enabled && train.hitbox) {
        scene.remove(train.hitbox);
        train.hitbox = null;
      }
    });
  }
  
  // Update function to be called every frame
  function update(delta, playerZ) {
    // Spawn new trains at random intervals
    timeSinceLastSpawn += delta;
    
    if (timeSinceLastSpawn >= config.train.spawnInterval) {
      // Choose a random track
      const trackIndex = Math.floor(Math.random() * config.tracks.count);
      
      // Generate a train on that track, using player's current Z position
      generateTrain(trackIndex, playerZ);
      
      // Reset spawn timer with some randomness
      timeSinceLastSpawn = 0;
    }
    
    // Update all train positions
    trains.forEach(train => {
      if (train.removed) return;
      
      // Update train position and hitbox
      train.update(delta);
      
      // Remove trains that are far past the player
      if (train.object.position.z > playerZ + 100) {
        scene.remove(train.object);
        if (train.hitbox) {
          scene.remove(train.hitbox);
        }
        train.removed = true;
      }
    });
    
    // Clean up removed trains from the array
    const activeTrains = trains.filter(train => !train.removed);
    trains.length = 0;
    trains.push(...activeTrains);
    
    // Return active trains for collision detection
    return trains;
  }
  
  // Reset function to clean up all trains
  function reset() {
    // Remove all trains from the scene
    trains.forEach(train => {
      scene.remove(train.object);
      if (train.hitbox) {
        scene.remove(train.hitbox);
      }
    });
    
    // Clear the trains array
    trains.length = 0;
    
    // Reset timer
    timeSinceLastSpawn = 0;
  }
  
  // Return public API
  return {
    update,
    reset,
    toggleHitboxes
  };
}

/**
 * Check if the player collides with any trains
 * @param {Object} character - The player character with object property
 * @param {Array} trains - Array of train objects
 * @param {Object} config - The game configuration
 * @returns {Object} Collision result with collision and onTopOfTrain flags
 */
export function checkTrainCollisions(character, trains, config) {
  // Get character position
  const charPos = character.object.position;
  const charTrackIndex = character.currentTrack;
  
  // Default result - no collision, not on top of train
  const result = {
    collision: false,
    onTopOfTrain: false
  };
  
  // Calculate character dimensions for collision using hitbox configuration
  const hitboxConfig = config.character.hitbox;
  const charRadius = config.character.radius * hitboxConfig.radiusScale;
  const charHalfHeight = (config.character.height * hitboxConfig.heightScale) / 2;
  
  // Check collision with each train
  for (let train of trains) {
    // Skip if not on the same track
    if (train.trackIndex !== charTrackIndex) {
      continue;
    }
    
    // Get train bounds with hitbox configuration
    const bounds = train.getBounds();
    
    // Check if character is within train length bounds
    if (charPos.z >= bounds.backZ && charPos.z <= bounds.frontZ) {
      // Character is in z-range of train, now check height
      
      // If character is above the train (riding on top)
      const minRidingHeight = bounds.topY + config.train.hitbox.rideHeightOffset;
      if (charPos.y - charHalfHeight >= minRidingHeight) {
        result.onTopOfTrain = true;
      } else if (charPos.y + charHalfHeight >= bounds.bottomY) {
        // Character is colliding with the train (not above it but within its height)
        result.collision = true;
      }
      
      // Break on first collision/interaction
      break;
    }
  }
  
  return result;
} 