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