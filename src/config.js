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
      text: "Subsurf",
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