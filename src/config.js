// Configuration for the 3D scene
export default {
  // Plane settings
  plane: {
    width: 10,           // Width of the plane (configurable)
    length: 1000,        // Length of the plane (stretching to "infinity")
    widthSegments: 1,
    lengthSegments: 100, // More segments for the stretched dimension
    color: '#6a5a43',    // Blue color by default
  },
  
  // Ground plane settings
  ground: {
    width: 100,          // Width of the ground (extends under houses)
    length: 1000,        // Same length as the road
    color: '#4CAF50',    // Green color
    y: -0.1              // Slightly below the road
  },
  
  // Train tracks settings
  tracks: {
    count: 3,                  // Number of tracks
    spacing: 3,              // Space between track centers
    railWidth: 0.3,            // Width of each rail
    railHeight: 0.15,          // Height of rails
    railColor: '#555555',      // Dark gray for rails
    tieWidth: 0.3,             // Width of railroad ties
    tieLength: 2.5,            // Length of railroad ties (perpendicular to rails)
    tieHeight: 0.1,            // Height of railroad ties
    tieColor: '#3d2817',       // Brown color for wooden ties
    tieSpacing: 0.7,             // Space between ties
    ballastWidth: 3,           // Width of the ballast (gravel bed)
    ballastColor: '#7a7877',   // Gray color for ballast
    ballastHeight: 0.05,       // Height of ballast
    y: 0.1                     // Position just above the road
  },
  
  // Train settings
  train: {
    width: 2.2,                // Width of train (slightly narrower than track spacing)
    height: 2.5,               // Height of train
    locomotiveLength: 5,       // Length of the locomotive
    wagonLength: 7,            // Length of each wagon
    gap: 0.2,                  // Gap between wagons
    minLength: 15,             // Minimum train length (including locomotive and wagons)
    maxLength: 40,             // Maximum train length
    speed: 25,                 // Speed the train moves at
    spawnInterval: 2,          // Time between train spawns in seconds (was 5)
    locomotiveColor: '#d63031',// Red locomotive
    wagonColor1: '#0984e3',    // Blue wagon
    wagonColor2: '#00b894',    // Green wagon
    windowColor: '#74b9ff',    // Light blue windows
    
    // 3D model settings
    model: {
      path: 'src/models/Tram.glb',  // Path to the model file
      scale: 0.1,                    // Scale of the model
      yOffset: 0.1,                  // Height adjustment for the model
      numCars: {                     // Number of cars to use
        min: 1,                      // Minimum number of cars
        max: 3                       // Maximum number of cars
      },
      carSpacing: 0.1                // Space between cars
    }
  },
  
  // Collectible coins settings
  coins: {
    radius: 0.3,               // Radius of the coin
    thickness: 0.1,            // Thickness of the coin
    color: '#FFD700',          // Gold color
    height: 0.7,               // Height above the track
    minPerTrack: 5,            // Minimum coins per track
    maxPerTrack: 15,           // Maximum coins per track
    collectionDistance: 1.0,   // How close character needs to be to collect
    rotationSpeed: 2.0         // How fast coins rotate
  },
  
  // Character settings
  character: {
    radius: 0.5,               // Radius of the bean character
    height: 1.8,               // Height of the bean character - increased for visibility
    color: '#FF4500',          // Bright orange-red color for better visibility
    speed: 15,                 // Movement speed
    jumpHeight: 1.5,           // Height of jump when switching tracks - increased
    acceleration: 0.2,         // How quickly the character speeds up
    maxSpeed: 30,               // Maximum speed the character can reach
    
    // 3D model settings
    model: {
      path: 'src/models/Character_Animated.glb', // Path to the model file
      scale: 0.8,                               // Scale of the model 
      animationSpeed: 1.5,                      // Speed multiplier for animations (higher = faster)
      faceDirection: 'backward',                // Direction character faces: 'forward' or 'backward'
      rotation: Math.PI,                        // Base rotation in radians (Math.PI = 180 degrees)
      defaultAnimation: 'Run'                   // Default animation to play
    }
  },
  
  // Renderer settings
  renderer: {
    clearColor: '#66b9ec',
    pixelRatio: window.devicePixelRatio,
  },
  
  // Camera settings
  camera: {
    fov: 60,
    near: 0.1,
    far: 2000,
    position: { x: 0, y: 8, z: -10 }, // Positioned closer to the plane
    rotation: { x: -2 / 6, y: 0, z: 0 } // Looking downward at about 30 degrees
  },

  // Houses (blocks) settings
  houses: {
    // How many blocks to generate on each side
    count: 20,
    // Starting position along the z-axis
    startZ: 0,
    // Distance between blocks along the z-axis (on average)
    spacing: 45,
    // Distance from the center of the road (the plane)
    distanceFromRoad: {
      min: 0, // Minimum distance from road center
      max: 1  // Maximum distance from road center
    },
    // House sizes
    size: {
      width: {
        min: 30,
        max: 30
      },
      height: {
        min: 10,
        max: 16
      },
      depth: {
        min: 4,
        max: 12
      }
    },
    // Colors for the houses
    colors: [
      '#ff8c66', // Orange/Terracotta
      '#e67e22', // Darker Orange
      '#f39c12', // Amber
      '#d35400', // Pumpkin
      '#c0392b', // Dark Red
      '#e74c3c', // Red
      '#ecf0f1', // White
      '#bdc3c7', // Light Gray
      '#95a5a6', // Gray
      '#7f8c8d', // Dark Gray
    ]
  },

  // Menu settings
  menu: {
    title: {
      text: "SubSurf",
      color: "#FFFFFF" // White, configurable
    },
    buttons: {
      play: {
        text: "Play",
        color: "#FFFFFF", // Button text color
        backgroundColor: "#4CAF50" // Green background
      },
      settings: {
        text: "Settings",
        color: "#FFFFFF", // Button text color
        backgroundColor: "#2196F3" // Blue background
      }
    }
  }
}