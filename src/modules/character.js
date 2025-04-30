import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Create the character using the GLB model
export function createCharacter(config, scene) {
  const characterGroup = new THREE.Group();
  
  // Character state with default values
  const character = {
    object: characterGroup,
    model: null,
    mixer: null,
    animations: {},
    hitboxMesh: null, // For debug visualization
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
      this.object.position.y = 0; // Will be adjusted when model loads
      this.object.position.z = 0; // Start at z=0 so camera can see it
      
      // Load the character model
      loadCharacterModel(this, config, scene);
    },
    
    // Create or update hitbox visualization for debug mode
    updateHitbox(scene) {
      if (!config.debug.enabled || !config.debug.showHitboxes) {
        if (this.hitboxMesh) {
          scene.remove(this.hitboxMesh);
          this.hitboxMesh = null;
        }
        return;
      }
      
      // Create hitbox if it doesn't exist
      if (!this.hitboxMesh) {
        const hitboxConfig = config.character.hitbox;
        const radius = config.character.radius * hitboxConfig.radiusScale;
        const height = config.character.height * hitboxConfig.heightScale;
        
        // Create capsule-like hitbox for character
        const geometry = new THREE.CapsuleGeometry(
          radius,
          height - radius * 2,
          8,
          8
        );
        
        const material = new THREE.MeshBasicMaterial({
          color: config.debug.colors.characterHitbox,
          transparent: true,
          opacity: config.debug.hitboxOpacity,
          wireframe: true
        });
        
        this.hitboxMesh = new THREE.Mesh(geometry, material);
        scene.add(this.hitboxMesh);
      }
      
      // Update hitbox position
      if (this.hitboxMesh) {
        this.hitboxMesh.position.copy(this.object.position);
      }
    },
    
    // Toggle hitbox visibility
    toggleHitbox(enabled, scene) {
      if (enabled) {
        this.updateHitbox(scene);
      } else if (this.hitboxMesh) {
        scene.remove(this.hitboxMesh);
        this.hitboxMesh = null;
      }
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
        
        // Rotate character slightly in the direction of movement
        // Adjust rotation based on character facing direction
        let rotateAngle;
        if (config.character.model.faceDirection === 'backward') {
          rotateAngle = direction > 0 ? Math.PI/6 : -Math.PI/6;
        } else {
          rotateAngle = direction > 0 ? -Math.PI/6 : Math.PI/6;
        }
        
        if (this.model) {
          // Save current rotation
          this.previousRotation = this.model.rotation.y;
          // Set target rotation
          this.targetRotation = rotateAngle;
        }
      }
    },
    
    // Move character forward
    moveForward(delta) {
      this.object.position.z -= this.speed * delta;
    },
    
    // Update character position and lane change animation
    update(delta, scene) {
      // Update animation mixer with configurable speed
      if (this.mixer) {
        this.mixer.update(delta * config.character.model.animationSpeed);
      }
      
      // Handle lane change animation (smooth sliding)
      if (this.isChangingLane) {
        this.laneChangeProgress += delta * this.laneChangeSpeed;
        
        if (this.laneChangeProgress >= 1) {
          // Lane change finished
          this.laneChangeProgress = 0;
          this.isChangingLane = false;
          this.object.position.x = this.trackPositions[this.currentTrack];
          
          // Reset character rotation to base rotation
          if (this.model) {
            this.model.rotation.y = config.character.model.rotation;
          }
        } else {
          // During lane change animation (smooth linear interpolation)
          const startX = this.trackPositions[this.previousTrack];
          const endX = this.trackPositions[this.currentTrack];
          this.object.position.x = THREE.MathUtils.lerp(startX, endX, this.laneChangeProgress);
          
          // Animate rotation during lane change
          if (this.model) {
            const progress = Math.sin(this.laneChangeProgress * Math.PI);
            this.model.rotation.y = config.character.model.rotation + (this.targetRotation * progress);
          }
        }
      }
      
      // Move forward
      this.moveForward(delta);
      
      // Update hitbox if debug is enabled
      if (config.debug.enabled && config.debug.showHitboxes) {
        this.updateHitbox(scene);
      }
    }
  };
  
  return character;
}

// Load the character model
function loadCharacterModel(character, config, scene) {
  const loader = new GLTFLoader();
  
  loader.load(
    config.character.model.path,
    (gltf) => {
      // Store model and animations
      character.model = gltf.scene;
      character.mixer = new THREE.AnimationMixer(gltf.scene);
      
      // Add the model to the character group
      character.object.add(gltf.scene);
      
      // Scale model appropriately based on config
      const scale = config.character.model.scale;
      gltf.scene.scale.set(scale, scale, scale);
      
      // Adjust position for proper height
      character.object.position.y = config.character.height / 2;
      
      // Center model on character
      gltf.scene.position.set(0, -config.character.height / 2, 0);
      
      // Apply base rotation to make character face the desired direction
      gltf.scene.rotation.y = config.character.model.rotation;
      
      // Store animations
      gltf.animations.forEach((clip) => {
        character.animations[clip.name] = character.mixer.clipAction(clip);
      });
      
      // Play the configured animation
      const defaultAnim = config.character.model.defaultAnimation;
      if (character.animations[defaultAnim]) {
        character.animations[defaultAnim].play();
      } else if (gltf.animations.length > 0) {
        // Fallback to first animation if default is not found
        character.mixer.clipAction(gltf.animations[0]).play();
        console.log(`${defaultAnim} animation not found, playing: ${gltf.animations[0].name}`);
      }
      
      // Log available animations for debugging
      console.log("Available animations:", gltf.animations.map(a => a.name));
      
      // Initialize hitbox if debug is enabled
      if (config.debug.enabled && config.debug.showHitboxes) {
        character.updateHitbox(scene);
      }
    },
    (xhr) => {
      // Loading progress
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      // Error handling
      console.error('An error happened loading the character model:', error);
    }
  );
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