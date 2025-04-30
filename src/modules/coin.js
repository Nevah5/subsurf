import * as THREE from 'three';

// Function to create coins to place on the tracks
export function createCoins(config, trackPositions) {
  const coinsGroup = new THREE.Group();
  
  // Create coin geometry - a simple gold cylinder
  const coinGeometry = new THREE.CylinderGeometry(
    config.coins.radius,
    config.coins.radius,
    config.coins.thickness,
    16
  );
  
  // Create coin material with a gold shiny appearance
  const coinMaterial = new THREE.MeshStandardMaterial({
    color: config.coins.color,
    metalness: 0.8,
    roughness: 0.3,
    emissive: config.coins.color,
    emissiveIntensity: 0.2
  });
  
  // Calculate coin positions
  const coinPositions = [];
  
  // Generate random coins for each track
  trackPositions.forEach((trackX, trackIndex) => {
    // Generate coins along the track with random distribution
    // Start coins much closer to the player's starting position
    const startZ = 30; // Start closer to player (was -50)
    const endZ = -config.plane.length + 50; // End before the end of the track
    
    // Determine how many coins for this track segment
    const coinsCount = Math.floor(Math.random() * config.coins.maxPerTrack) + config.coins.minPerTrack;
    
    for (let i = 0; i < coinsCount; i++) {
      // Calculate a random z position
      const z = Math.random() * (endZ - startZ) + startZ;
      
      // Create coin at this position
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      
      // Rotate coin to be vertical
      coin.rotation.x = Math.PI / 2;
      
      // Position coin slightly above the track
      coin.position.set(
        trackX,
        config.tracks.y + config.coins.height,
        z
      );
      
      // Add to group
      coinsGroup.add(coin);
      
      // Add to positions array for collision detection
      coinPositions.push({
        object: coin,
        x: trackX,
        z: z,
        collected: false,
        trackIndex: trackIndex
      });
    }
  });
  
  return {
    group: coinsGroup,
    positions: coinPositions
  };
}

// Function to check if character has collected coins
export function checkCoinCollisions(character, coins, config) {
  let collected = 0;
  
  // Get character position
  const charX = character.object.position.x;
  const charZ = character.object.position.z;
  const charTrack = character.currentTrack;
  
  // Check each coin
  coins.positions.forEach(coin => {
    // Only check coins on the current track that haven't been collected
    if (!coin.collected && coin.trackIndex === charTrack) {
      // Calculate distance
      const distance = Math.abs(coin.z - charZ);
      
      // If character is close enough to the coin, collect it
      if (distance < config.coins.collectionDistance) {
        // Mark as collected
        coin.collected = true;
        
        // Hide the coin
        coin.object.visible = false;
        
        // Count the collected coin
        collected++;
      }
    }
  });
  
  return collected;
}

// Function to create coin UI
export function createCoinUI() {
  // Create a container for the coin counter
  const container = document.createElement('div');
  container.id = 'coin-counter';
  container.style.position = 'absolute';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  container.style.color = '#FFD700';
  container.style.padding = '10px 15px';
  container.style.borderRadius = '5px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '18px';
  container.style.fontWeight = 'bold';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  
  // Create coin icon
  const coinIcon = document.createElement('span');
  coinIcon.textContent = '🪙';
  coinIcon.style.marginRight = '8px';
  coinIcon.style.fontSize = '24px';
  
  // Create counter text
  const counter = document.createElement('span');
  counter.id = 'coin-count';
  counter.textContent = '0';
  
  // Assemble UI
  container.appendChild(coinIcon);
  container.appendChild(counter);
  
  // Add to document
  document.body.appendChild(container);
  
  // Hide initially
  container.style.display = 'none';
  
  return {
    container,
    counter
  };
}

// Function to update the coin UI
export function updateCoinUI(coinUI, count) {
  coinUI.counter.textContent = count.toString();
}

// Function to show the coin UI
export function showCoinUI(coinUI) {
  coinUI.container.style.display = 'flex';
} 