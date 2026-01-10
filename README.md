# Dynamic Algebraic Curve Explorer

**[Live Demo](https://aviron012.github.io/dynamic-algebraic-curve/)**

A visualization of **implicit algebraic curves** ($f(x,y) = 0$) driven by a swarm of autonomous agents.

This project combines linear algebra and steering behaviors to create an organic, evolving mathematical display. A swarm of particles moves naturally around the screen, and in every frame, the application solves for and renders the unique algebraic curve that passes through all of their positions.

## Controls

The UI overlay appears automatically when you move your mouse or touch the screen.

| Action | Desktop (Keyboard) | Mobile / Mouse |
| :--- | :--- | :--- |
| **Increase Degree** | `Arrow Up` | `+` Button |
| **Decrease Degree** | `Arrow Down` | `-` Button |
| **Pause/Resume** | `Space` | `Pause` Button |
| **Restart (Randomize)** | `R` | `Restart` Button |
| **Cycle View Mode** | `C` | `View: ...` Button |
| **Move Particle** | Drag (when Paused + Visible) | Drag (when Paused + Visible) |

> **Note:** The "View Mode" button cycles between **All**, **Curve Only**, and **Points Only**. Dragging particles is only possible when they are visible.

## Implementation Details

The application is built with vanilla JavaScript (ES6 Modules) and uses WebGL for high-performance rendering.

### 1. The Core Loop
1.  **Physics Update:** Particles calculate steering forces (Separation, Wander, Boundary avoidance) to move to new positions.
2.  **Algebraic Solver:** The system constructs a matrix where each row represents a particle and each column represents a polynomial term (e.g., $x^2, xy, y^2, x, y, 1$). It solves the linear system $A \cdot c = 0$ to find the coefficient vector $c$.
3.  **Rendering**:
    *   **Particles:** Drawn on a standard 2D Canvas.
    *   **Curve:** The coefficient vector is sent to a WebGL Fragment Shader. The shader evaluates the polynomial for every pixel and draws the zero-set boundary ($f(x,y) \approx 0$).

### 2. Mathematics
*   **Terms:** A curve of degree $D$ has $N = \frac{(D+1)(D+2)}{2}$ terms. We need $N-1$ points to define it uniquely (up to a scale factor).
*   **Solver (`Solver.js`):** Implements **Gaussian Elimination with Partial Pivoting** to solve the system. It handles singular matrices (when points are collinear or degenerate) by reusing the previous frame's valid coefficients to prevent flickering.
*   **Coordinate Space:** All calculations happen in a normalized $[-1, 1]$ coordinate space to ensure numerical stability for high-degree polynomials (avoiding floating-point overflow/underflow).

### 3. Rendering (`Renderer.js`)
*   **Dynamic Shaders:** The GLSL fragment shader is **generated at runtime**. If you switch from Degree 2 to Degree 6, the JavaScript constructs a new shader string with the appropriate polynomial terms ($x^6, x^5y, \dots$).
*   **Anti-Aliasing:** The curve is rendered using **Distance Estimation**. The shader calculates the value $val = f(x,y)$ and uses the gradient magnitude $|∇ f|$ (via `fwidth` / `GL_OES_standard_derivatives`) to determine the pixel's distance from the curve, creating smooth, anti-aliased lines.

## Project Structure

*   **`index.html`**: Main entry point and UI overlay.
*   **`js/`**
    *   **`main.js`**: Bootstraps the application and handles the event loop.
    *   **`Simulation.js`**: The central controller. Orchestrates the interaction between Physics, Solver, and Renderer.
    *   **`Particle.js`**: Implements autonomous agent behaviors (Reynolds' Steering).
    *   **`Solver.js`**: Linear algebra engine. Contains the Gaussian Elimination logic.
    *   **`Renderer.js`**: WebGL manager. Compiles shaders and handles drawing commands.
    *   **`UIManager.js`**: Handles user input (Mouse, Touch, Keyboard) and DOM updates.
    *   **`Params.js`**: Central configuration for physics constants, colors, and visuals.
    *   **`Vector.js`**: A lightweight 2D vector utility class.
