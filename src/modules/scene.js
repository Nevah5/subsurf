import * as THREE from 'three';

// Create the ground plane
export function createGround(config) {
  const groundGeometry = new THREE.BoxGeometry(
    config.ground.width,
    0.1, // Very thin height
    config.ground.length,
    1, // Simple segments
    1,
    config.plane.lengthSegments
  );
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: config.ground.color,
    side: THREE.DoubleSide
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);

  // Position ground so it's below the road and stretches away
  ground.position.y = config.ground.y;
  ground.position.z = -config.ground.length / 2;
  
  return ground;
}

// Create the road plane
export function createRoad(config) {
  const planeGeometry = new THREE.BoxGeometry(
    config.plane.width,
    0.1, // Very thin height
    config.plane.length,
    config.plane.widthSegments,
    1,
    config.plane.lengthSegments
  );
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: config.plane.color,
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  // Position plane so it stretches away from the camera
  plane.position.z = -config.plane.length / 2;
  
  return plane;
}

// Set up lighting
export function setupLighting(scene) {
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add directional light (sun-like)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);
}

// Initialize the scene
export function createScene() {
  return new THREE.Scene();
}

// Create camera
export function createCamera(config) {
  const camera = new THREE.PerspectiveCamera(
    config.camera.fov,
    window.innerWidth / window.innerHeight,
    config.camera.near,
    config.camera.far
  );
  
  // Set camera position
  camera.position.set(
    config.camera.position.x,
    config.camera.position.y,
    config.camera.position.z
  );
  
  // Apply camera rotation
  camera.rotation.x = config.camera.rotation.x;
  camera.rotation.y = config.camera.rotation.y;
  camera.rotation.z = config.camera.rotation.z;
  
  return camera;
}

// Create renderer
export function createRenderer(config) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(config.renderer.pixelRatio);
  renderer.setClearColor(config.renderer.clearColor);
  
  return renderer;
}

// Handle window resize
export function setupResizeHandler(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
} 