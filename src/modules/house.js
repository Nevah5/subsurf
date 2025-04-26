import * as THREE from 'three';

// Helper function to get a random number between min and max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Helper function to get a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to create houses on both sides of the road
export function createHouses(config) {
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
      // For the first house, use the startZ from config
      // For subsequent houses, position based on the previous house
      if (i === 0) {
        lastZ = config.houses.startZ;
      } else {
        lastZ = lastZ - (lastWidth / 2) - (depth / 2);
      }
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
  
  return housesGroup;
} 