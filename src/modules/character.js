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
  
  // Rotate the capsule to stand upright
  body.rotation.x = Math.PI / 2;
  characterGroup.add(body);
  
  // Character state
  const character = {
    object: characterGroup,
    currentTrack: 1, // Start on middle track (0: left, 1: middle, 2: right)
    previousTrack: 1, // Store the previous track to know which direction we're coming from
    speed: config.character.speed,
    isJumping: false,
    jumpHeight: config.character.jumpHeight,
    jumpProgress: 0,
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
      // Only switch if not currently jumping
      if (this.isJumping) return;
      
      const newTrack = this.currentTrack + direction;
      
      // Check if the new track exists
      if (newTrack >= 0 && newTrack < config.tracks.count) {
        this.isJumping = true;
        this.jumpProgress = 0;
        this.previousTrack = this.currentTrack;
        this.currentTrack = newTrack;
      }
    },
    
    // Move character forward
    moveForward(delta) {
      this.object.position.z -= this.speed * delta;
    },
    
    // Update character position and jumping animation
    update(delta) {
      // Handle jumping animation
      if (this.isJumping) {
        this.jumpProgress += delta * 5; // Controls jump speed
        
        if (this.jumpProgress >= 1) {
          // Jump finished
          this.jumpProgress = 0;
          this.isJumping = false;
          this.object.position.x = this.trackPositions[this.currentTrack];
          this.object.position.y = config.character.height / 2 + 0.2;
        } else {
          // During jump animation
          const jumpCurve = Math.sin(this.jumpProgress * Math.PI);
          
          // Horizontal movement (lerp between previous and current track)
          const startX = this.trackPositions[this.previousTrack];
          const endX = this.trackPositions[this.currentTrack];
          this.object.position.x = THREE.MathUtils.lerp(startX, endX, this.jumpProgress);
          
          // Vertical movement (arc)
          this.object.position.y = config.character.height / 2 + 0.2 + jumpCurve * this.jumpHeight;
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
        character.switchTrack(-1); // Move left
        break;
      case 'ArrowRight':
        character.switchTrack(1); // Move right
        break;
    }
  });
} 