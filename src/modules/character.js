import * as THREE from 'three';

// Create the bean character
export function createCharacter(config) {
  const characterGroup = new THREE.Group();
  
  // Create the bean body (capsule-like shape)
  const bodyGeometry = new THREE.CapsuleGeometry(
    config.character.radius,
    config.character.height - config.character.radius * 2,
    8,
    8
  );
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: config.character.color,
    roughness: 0.3,
    metalness: 0.2
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  
  // Capsule should be upright (no rotation needed)
  characterGroup.add(body);
  
  // Character state
  const character = {
    object: characterGroup,
    currentTrack: 1, // Start on middle track (0: left, 1: middle, 2: right)
    previousTrack: 1, // Store the previous track to know which direction we're coming from
    speed: config.character.speed,
    isChangingLane: false,
    laneChangeProgress: 0,
    laneChangeSpeed: 4.0, // Speed of lane change (higher = faster)
    trackPositions: [],
    
    // Initialize track positions based on config
    initTrackPositions(trackSpacing) {
      const totalWidth = (config.tracks.count - 1) * trackSpacing;
      const startX = -totalWidth / 2;
      
      for (let i = 0; i < config.tracks.count; i++) {
        this.trackPositions[i] = startX + i * trackSpacing;
      }
      
      // Position character on the current track
      this.object.position.x = this.trackPositions[this.currentTrack];
      this.object.position.y = config.character.height / 2 + 0.2; // Positioned slightly higher
      this.object.position.z = 0; // Start at z=0 so camera can see it
    },
    
    // Move character to a different track
    switchTrack(direction) {
      // Only switch if not currently changing lanes
      if (this.isChangingLane) return;
      
      const newTrack = this.currentTrack + direction;
      
      // Check if the new track exists
      if (newTrack >= 0 && newTrack < config.tracks.count) {
        this.isChangingLane = true;
        this.laneChangeProgress = 0;
        this.previousTrack = this.currentTrack;
        this.currentTrack = newTrack;
      }
    },
    
    // Move character forward
    moveForward(delta) {
      this.object.position.z -= this.speed * delta;
    },
    
    // Update character position and lane change animation
    update(delta) {
      // Handle lane change animation (smooth sliding)
      if (this.isChangingLane) {
        this.laneChangeProgress += delta * this.laneChangeSpeed;
        
        if (this.laneChangeProgress >= 1) {
          // Lane change finished
          this.laneChangeProgress = 0;
          this.isChangingLane = false;
          this.object.position.x = this.trackPositions[this.currentTrack];
        } else {
          // During lane change animation (smooth linear interpolation)
          const startX = this.trackPositions[this.previousTrack];
          const endX = this.trackPositions[this.currentTrack];
          this.object.position.x = THREE.MathUtils.lerp(startX, endX, this.laneChangeProgress);
        }
      }
      
      // Move forward
      this.moveForward(delta);
    }
  };
  
  return character;
}

// Setup keyboard controls for the character
export function setupCharacterControls(character) {
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        character.switchTrack(-1); // Move left
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        character.switchTrack(1); // Move right
        break;
    }
  });
} 