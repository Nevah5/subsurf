import * as THREE from 'three';

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
    // Collision boundaries
    getBounds() {
      const position = this.object.position;
      return {
        frontZ: position.z,
        backZ: position.z - this.length,
        trackIndex: this.trackIndex,
        topY: config.train.height + config.tracks.y + config.tracks.railHeight,
        bottomY: config.tracks.y + config.tracks.railHeight
      };
    },
    // Update train position
    update(delta) {
      if (!this.active) return;
      
      // Move train toward player (positive z)
      this.object.position.z += this.speed * delta;
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
  
  // Generate a train with random length and color pattern
  function generateTrain(trackIndex) {
    const trackPositions = calculateTrackPositions(config);
    const x = trackPositions[trackIndex];
    
    // Choose a random length (in wagons) for the train
    const minWagons = Math.ceil(config.train.minLength / config.train.wagonLength);
    const maxWagons = Math.floor(config.train.maxLength / config.train.wagonLength);
    const numWagons = Math.floor(Math.random() * (maxWagons - minWagons + 1)) + minWagons;
    
    // Create train group
    const trainGroup = new THREE.Group();
    
    // Create locomotive (first car)
    const locomotive = createLocomotive(config);
    trainGroup.add(locomotive);
    
    // Calculate total train length including locomotive
    let trainLength = config.train.locomotiveLength;
    
    // Add wagons
    for (let i = 0; i < numWagons; i++) {
      // Add gap between cars
      trainLength += config.train.gap;
      
      // Create and position wagon
      const wagon = createWagon(config, i % 2 === 0 ? config.train.wagonColor1 : config.train.wagonColor2);
      wagon.position.z = -trainLength - config.train.wagonLength / 2;
      trainGroup.add(wagon);
      
      // Update train length
      trainLength += config.train.wagonLength;
    }
    
    // Position the train far behind the visible area
    const startZ = -1000;
    trainGroup.position.set(
      x, 
      config.tracks.y + config.tracks.railHeight + config.train.height / 2,
      startZ
    );
    
    // Add to scene
    scene.add(trainGroup);
    
    // Add to train array with metadata
    trains.push({
      object: trainGroup,
      trackIndex: trackIndex,
      length: trainLength,
      speed: config.train.speed,
      removed: false
    });
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
  
  /**
   * Create a locomotive (first car of the train)
   */
  function createLocomotive(config) {
    const group = new THREE.Group();
    
    // Base dimensions
    const width = config.train.width;
    const height = config.train.height;
    const length = config.train.locomotiveLength;
    
    // Create main body
    const bodyGeometry = new THREE.BoxGeometry(width, height, length);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: config.train.locomotiveColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Add front window
    const windowWidth = width * 0.7;
    const windowHeight = height * 0.4;
    const windowDepth = 0.1;
    const windowGeometry = new THREE.BoxGeometry(windowWidth, windowHeight, windowDepth);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: config.train.windowColor });
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.z = -length / 2 + windowDepth / 2;
    frontWindow.position.y = height * 0.1;
    
    // Create top part (cabin)
    const cabinWidth = width * 0.8;
    const cabinHeight = height * 0.3;
    const cabinLength = length * 0.6;
    const cabinGeometry = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
    const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
    cabin.position.y = height / 2 + cabinHeight / 2;
    cabin.position.z = length * 0.1; // Slightly toward the back
    
    // Add details - front lights
    const lightRadius = 0.3;
    const lightGeometry = new THREE.SphereGeometry(lightRadius, 16, 16);
    const lightMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: 0xffffcc,
      emissiveIntensity: 0.5
    });
    
    const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
    leftLight.position.set(-width / 3, -height / 4, -length / 2);
    
    const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
    rightLight.position.set(width / 3, -height / 4, -length / 2);
    
    // Assemble locomotive
    group.add(body);
    group.add(frontWindow);
    group.add(cabin);
    group.add(leftLight);
    group.add(rightLight);
    
    // Position so the front of the train is at z=0 in the group's coordinate system
    group.position.z = length / 2;
    
    return group;
  }
  
  /**
   * Create a train wagon
   */
  function createWagon(config, color) {
    const group = new THREE.Group();
    
    // Base dimensions
    const width = config.train.width;
    const height = config.train.height;
    const length = config.train.wagonLength;
    
    // Create main body
    const bodyGeometry = new THREE.BoxGeometry(width, height, length);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Add windows
    const windowWidth = width * 0.3;
    const windowHeight = height * 0.4;
    const windowDepth = 0.1;
    const windowSpacing = length / 4;
    const windowGeometry = new THREE.BoxGeometry(windowWidth, windowHeight, windowDepth);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: config.train.windowColor });
    
    // Add windows on both sides
    for (let i = -1; i <= 1; i += 2) { // Left and right sides
      for (let j = -1; j <= 1; j++) { // 3 windows per side
        if (j === 0) continue; // Skip the middle position
        
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(
          (width / 2) * i,
          0,
          j * windowSpacing
        );
        window.rotation.y = Math.PI / 2;
        group.add(window);
      }
    }
    
    // Assemble wagon
    group.add(body);
    
    // Position so the front of the wagon is at z=0 in the group's coordinate system
    group.position.z = length / 2;
    
    return group;
  }
  
  // Update function to be called every frame
  function update(delta, playerZ) {
    // Spawn new trains at random intervals
    timeSinceLastSpawn += delta;
    
    if (timeSinceLastSpawn >= config.train.spawnInterval) {
      // Choose a random track
      const trackIndex = Math.floor(Math.random() * config.tracks.count);
      
      // Generate a train on that track
      generateTrain(trackIndex);
      
      // Reset spawn timer with some randomness
      timeSinceLastSpawn = 0;
    }
    
    // Update all train positions
    trains.forEach(train => {
      if (train.removed) return;
      
      // Move train forward
      train.object.position.z += train.speed * delta;
      
      // Remove trains that are far past the player
      if (train.object.position.z > playerZ + 100) {
        scene.remove(train.object);
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
    });
    
    // Clear the trains array
    trains.length = 0;
    
    // Reset timer
    timeSinceLastSpawn = 0;
  }
  
  // Return public API
  return {
    update,
    reset
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
  
  // Calculate character dimensions for collision
  const charRadius = config.character.width / 2;
  const charHalfHeight = config.character.height / 2;
  
  // Create a simplified representation of the character as a cylinder
  // To check if character is on a track with a train
  for (let train of trains) {
    // Skip if not on the same track
    if (train.trackIndex !== charTrackIndex) {
      continue;
    }
    
    // Train position and dimensions
    const trainPos = train.object.position;
    const trainWidth = config.train.width;
    const trainHeight = config.train.height;
    const trainLength = train.length;
    
    // Calculate train bounds
    const trainFront = trainPos.z;
    const trainBack = trainPos.z - trainLength;
    
    // Check if character is within train length bounds
    if (charPos.z >= trainBack && charPos.z <= trainFront) {
      // Character is in z-range of train, now check height
      
      // If character is above the train (riding on top)
      const minRidingHeight = trainPos.y + trainHeight / 2 + charHalfHeight * 0.5;
      if (charPos.y >= minRidingHeight) {
        result.onTopOfTrain = true;
      } else {
        // Character is colliding with the train
        result.collision = true;
      }
      
      // Break on first collision/interaction
      break;
    }
  }
  
  return result;
} 