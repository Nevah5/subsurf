# Three.js Plane Demo

A simple Vite project with Three.js that renders a plane with configurable color.

## Features
- 3D scene with a plane
- Configurable plane color in config.js
- Orbit controls for camera movement

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
// Example: Change the plane color
plane: {
  width: 10,
  height: 10,
  widthSegments: 1,
  heightSegments: 1,
  color: '#ff0000', // Change to red
},
``` 