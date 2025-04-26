# Three.js Plane Demo

A simple Vite project with Three.js that renders a stretched plane extending far from the camera.

## Features
- 3D scene with a stretched plane
- Configurable plane width and color in config.js
- Fixed camera angle looking down at the plane

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

You can modify the plane's appearance by editing the `src/config.js` file:

```js
// Example: Change the plane width and color
plane: {
  width: 20,           // Increase width
  length: 1000,        // Length of the plane (stretching to "infinity")
  widthSegments: 1,
  lengthSegments: 100,
  color: '#ff0000',    // Change to red
},
``` 