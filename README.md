# Dynamic Algebraic Curve Explorer

**[Live Demo](https://aviron012.github.io/dynamic-algebraic-curve/)**

A visualization of **implicit algebraic curves** ($f(x,y) = 0$) driven by a swarm of autonomous agents.

This project combines linear algebra, particle physics, and GPU computing to create an organic, evolving mathematical display. A swarm of particles moves naturally around the screen, and in every frame, the application solves for and renders the unique algebraic curve that passes through all of their positions.

## Motivation

Most people are familiar with lines ($Ax + By + C = 0$) and conic sections like circles and ellipses. However, as the degree of the polynomial equation increases, the resulting curves become incredibly complex and beautiful.

Exploring these higher-degree curves randomly is difficult; most combinations of coefficients result in curves that are entirely outside the visible window, or do not exist at all.

By **forcing** the curve to pass through a specific set of points within the view, we guarantee that the curve is always visible. The autonomous motion of the particles then serves as a way to "travel" through the continuous space of all possible curves of a given degree.

## Controls

The UI overlay appears automatically when you move your mouse or touch the screen.

| Action | Desktop (Keyboard) | Mobile / Mouse |
| :--- | :--- | :--- |
| **Increase Degree** | `Arrow Up` | `+` Button |
| **Decrease Degree** | `Arrow Down` | `-` Button |
| **Pause/Resume** | `Space` | `Pause` Button |
| **Restart (Randomize)** | `R` | `Restart` Button |
| **Cycle View Mode** | `C` | `View: ...` Button |
| **Show Info / About** | `F1` | `Info` Button |
| **Close Info** | `Esc` | `X` Button |
| **Move Particle** | Drag (when Paused + Visible) | Drag (when Paused + Visible) |

## Tech Stack & Implementation

The application is built with **TypeScript** and uses **WebGPU** for high-performance rendering (with a WebGL fallback for older devices).

### 1. Architecture
*   **Engine (`src/engine/`)**: Manages the core simulation loop, orchestrating physics and rendering.
*   **Math (`src/math/`)**:
    *   **Gaussian Elimination (`Solver.ts`)**: Solves the linear system $A \cdot c = 0$ to find the polynomial coefficients. It implements partial pivoting for numerical stability.
    *   **Vector Math (`Vector.ts`)**: A lightweight 2D vector library.
*   **Rendering (`src/engine/Renderer.ts`)**:
    *   **WebGPU:** Uses a custom WGSL shader (`src/shaders/curve.wgsl`) to evaluate the polynomial for every pixel in parallel.
    *   **Specialization Constants:** The shader uses WGSL `override` constants to unroll loops specifically for the current curve degree, maximizing GPU performance.
    *   **Distance Estimation:** Uses gradient magnitude ($|∇ f|$) via `fwidth` to render smooth, anti-aliased lines.

### 2. Build System
The project uses **Bun** for ultra-fast bundling and development.
*   **TypeScript**: Native support.
*   **Shader Import**: Custom loader allows importing `.wgsl` files as raw strings.
*   **CSS Injection**: Styles are imported and injected at runtime.

## Development

1.  **Install Bun**: [https://bun.sh](https://bun.sh)
2.  **Install Dependencies**:
    ```bash
    bun install
    ```
3.  **Run Development Server**:
    ```bash
    bun run dev   # Watches for changes and rebuilds
    bun run serve # Serves the app at http://localhost:3000
    ```
    *Open two terminals to run both simultaneously.*

4.  **Build for Production**:
    ```bash
    bun run build
    ```
    *Outputs to `dist/`.*

## Project Structure

*   **`src/`**
    *   **`main.ts`**: Entry point. Initializes the app and binds UI events.
    *   **`engine/`**: Core logic (`Simulation`, `Renderer`, `Particle`).
    *   **`math/`**: Mathematical solvers and utilities.
    *   **`shaders/`**: WGSL shader code.
    *   **`css/`**: Styling.
*   **`dist/`**: Compiled assets (generated).
*   **`build.js`**: Bun build configuration.