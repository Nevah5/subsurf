// Configuration for the 3D scene
export default {
  // Plane settings
  plane: {
    width: 10,
    height: 10,
    widthSegments: 1,
    heightSegments: 1,
    color: '#3498db', // Blue color by default
  },
  
  // Renderer settings
  renderer: {
    clearColor: '#000000',
    pixelRatio: window.devicePixelRatio,
  },
  
  // Camera settings
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 5, z: 10 }
  }
} 