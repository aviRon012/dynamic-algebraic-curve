# Dynamic Algebraic Curve Explorer

**[Live Demo](https://aviron012.github.io/dynamic-algebraic-curve/dynamic-algebraic-curve.html)**

This project is an interactive WebGL visualization that explores **Implicit Algebraic Curves** (defined by $f(x,y) = 0$).

Unlike traditional graph plotters that draw specific functions, this application uses a "swarm" of autonomous particles. These particles move naturally around the canvas, and in every frame, a specialized **Solver** calculates the unique algebraic curve that passes through all of their positions. A **Renderer** then draws this curve in real-time using a GPU fragment shader.

The result is a fluid, organic exploration of mathematical shapes, ranging from simple Conic Sections (circles, ellipses) to complex higher-degree polynomials.

## Key Features

*   **Dynamic Degree:** Support for curves of degrees 1 through 6.
    *   *Degree 2 (Quadratic):* Ellipses, Hyperbolas, Parabolas (requires 5 points).
    *   *Degree 3 (Cubic):* Loops, cusps, and serpentine shapes (requires 9 points).
    *   *Degree 4+ (Quartic+):* Highly complex, multi-component shapes.
*   **Real-time Physics:** Particles behave like a swarm (separation, cohesion, wandering) and their speed/density scales dynamically with the window size.
*   **High-Performance Rendering:**
    *   Uses **Gaussian Elimination** (in JS) to solve the linear system for curve coefficients.
    *   Uses **WebGL Fragment Shaders** to render the implicit curve per-pixel using standard derivatives for anti-aliasing.
*   **Modular Architecture:** Built with modern ES6 Modules for clean separation of concerns.

## Directory Structure

*   `dynamic-algebraic-curve.html`: The main entry point. Contains the UI DOM structure and loads the JS modules.
*   `js/`:
    *   `main.js`: Application entry point. Handles the event loop, initialization, inputs, and orchestrates the systems.
    *   `Params.js`: Central configuration file for physics constants, colors, and global state (pause, scale).
    *   `Solver.js`: The mathematical heart. Generates polynomial terms ($x^2, xy, y^2...$) based on degree and solves the matrix to find the curve coefficients.
    *   `Renderer.js`: Manages the WebGL context. Generates custom GLSL shaders on-the-fly to match the current curve degree.
    *   `Particle.js`: Defines the behavior of the individual points (Boids-like physics).
    *   `Vector.js`: A lightweight 2D Vector math library.

## Running the Project

Because this project uses **ES6 Modules** (`import`/`export`), it **cannot** be run directly from the file system (`file://` protocol) due to browser CORS security restrictions.

**You must use a local web server.**

### Option 1: VS Code (Recommended)
1.  Install the **Live Server** extension.
2.  Right-click `dynamic-algebraic-curve.html`.
3.  Select **"Open with Live Server"**.

### Option 2: Python
Run this command in the project root:
```bash
python -m http.server
```
Then open `http://localhost:8000/dynamic-algebraic-curve.html` in your browser.

### Option 3: Node.js
If you have `npx` installed:
```bash
npx http-server .
```

## User Controls

The application features an auto-hiding UI overlay that appears on mouse movement.

| Control | Action | Description |
| :--- | :--- | :--- |
| **Arrow Up** | Increase Degree | Raises the curve degree (max 6), adding more particles. |
| **Arrow Down** | Decrease Degree | Lowers the curve degree (min 1), removing particles. |
| **Space** | Pause / Resume | Freezes the physics simulation to inspect a specific shape. |
| **R** | Restart | Respawns all particles at random locations. |
| **C** | Toggle Curve | Hides/Shows the rendered curve to view raw particles. |
| **Mouse Drag** | Move Particle | **(When Paused)** Click and drag any particle to manually reshape the curve. |

## Development Notes

*   **Coordinate System:** The solver normalizes coordinates to a `[-1, 1]` range (scaled by aspect ratio) to ensure numerical stability for higher-degree polynomials.
*   **Math Logic:** The number of points required for a degree $D$ is calculated as $N = \frac{(D+1)(D+2)}{2} - 1$.
*   **Visuals:** Colors and visual settings can be tweaked in `js/Params.js`.