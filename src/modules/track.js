import * as THREE from 'three';

// Function to create a single train track
export function createTrack(config, xOffset) {
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
  
  // Add ties along the track - start from character position backwards
  // Generate ties from the start of the visible area
  const startOffset = 500; // Start before the player's initial position to be visible at start
  for (let i = 0; i < numTies; i++) {
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    const zPos = startOffset - i * config.tracks.tieSpacing - config.tracks.tieWidth / 2;
    tie.position.set(0, config.tracks.y + config.tracks.ballastHeight / 2 + config.tracks.tieHeight / 2, zPos);
    trackGroup.add(tie);
  }
  
  // Position the entire track
  trackGroup.position.x = xOffset;
  trackGroup.position.z = -config.plane.length / 2;
  
  return trackGroup;
}

// Function to create all train tracks
export function createTracks(config) {
  const tracksGroup = new THREE.Group();
  
  // Calculate the starting offset for centering tracks
  const totalWidth = (config.tracks.count - 1) * config.tracks.spacing;
  const startX = -totalWidth / 2;
  
  // Create each track
  for (let i = 0; i < config.tracks.count; i++) {
    const xOffset = startX + i * config.tracks.spacing;
    const track = createTrack(config, xOffset);
    tracksGroup.add(track);
  }
  
  return tracksGroup;
} 