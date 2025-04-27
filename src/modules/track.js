import * as THREE from 'three';

// Function to create all train tracks
export function createTracks(config) {
  // Create a group to hold all tracks
  const tracksGroup = new THREE.Group();
  
  // Calculate how many tracks to create and their spacing
  const trackCount = config.tracks.count;
  const spacing = config.tracks.spacing;
  
  // Calculate total width to center the tracks
  const totalWidth = (trackCount - 1) * spacing;
  const startX = -totalWidth / 2;
  
  // Create each track
  for (let i = 0; i < trackCount; i++) {
    // Calculate the x position for this track
    const trackX = startX + i * spacing;
    
    // Create a single track and add it to the group
    const track = createSingleTrack(config, trackX);
    tracksGroup.add(track);
  }
  
  return tracksGroup;
}

// Function to create a single train track
function createSingleTrack(config, xPosition) {
  // Create a group for this track
  const trackGroup = new THREE.Group();
  
  // Create the ballast (gravel bed)
  createBallast(trackGroup, config);
  
  // Create the rails
  createRails(trackGroup, config);
  
  // Create the ties (wooden planks)
  createTies(trackGroup, config);
  
  // Position the track at the correct x-coordinate
  trackGroup.position.x = xPosition;
  
  return trackGroup;
}

// Create the ballast (gravel bed)
function createBallast(trackGroup, config) {
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
}

// Create the rails
function createRails(trackGroup, config) {
  // Calculate the distance between rails
  const railDistance = config.tracks.tieLength * 0.8;
  
  // Create rail geometry and material
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
  
  // Create left rail
  const leftRail = new THREE.Mesh(railGeometry, railMaterial);
  leftRail.position.x = -railDistance / 2;
  leftRail.position.y = config.tracks.y + config.tracks.ballastHeight / 2 + config.tracks.railHeight / 2;
  trackGroup.add(leftRail);
  
  // Create right rail
  const rightRail = new THREE.Mesh(railGeometry, railMaterial);
  rightRail.position.x = railDistance / 2;
  rightRail.position.y = config.tracks.y + config.tracks.ballastHeight / 2 + config.tracks.railHeight / 2;
  trackGroup.add(rightRail);
}

// Create the ties (wooden planks)
function createTies(trackGroup, config) {
  // Create tie geometry and material
  const tieGeometry = new THREE.BoxGeometry(
    config.tracks.tieLength,
    config.tracks.tieHeight,
    config.tracks.tieWidth
  );
  
  const tieMaterial = new THREE.MeshStandardMaterial({
    color: config.tracks.tieColor,
    roughness: 0.8
  });
  
  // Calculate the proper y position for ties
  const tieY = config.tracks.y + config.tracks.ballastHeight / 2 + config.tracks.tieHeight / 2;
  
  // Place ties starting from the beginning of the player's view
  // and extending through the entire track length
  
  // Start 10 units before the player to ensure visibility at the start
  const playerStartZ = 120;
  
  // Place dense ties at the very beginning (high density area)
  for (let z = playerStartZ; z >= -50; z -= 0.3) {
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.set(0, tieY, z);
    trackGroup.add(tie);
  }
  
  // Continue with regular spacing for the rest of the track
  const tieSpacing = config.tracks.tieSpacing;
  for (let z = -50 - tieSpacing; z >= -config.plane.length; z -= tieSpacing) {
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.set(0, tieY, z);
    trackGroup.add(tie);
  }
} 