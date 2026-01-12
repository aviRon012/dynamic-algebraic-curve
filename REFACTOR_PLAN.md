# Refactoring Plan: Algebraic Curve Web Component

**Goal:** Convert the existing Single Page Application (SPA) into a reusable, self-contained Web Component (`<algebraic-curve>`).

**Target Usage:**
```html
<algebraic-curve degree="3" mode="curve"></algebraic-curve>
```

## 1. Architectural Changes

### A. The Container (`AlgebraicCurve` Class)
Instead of `main.js` bootstrapping the app, the entry point will be a class extending `HTMLElement`.
*   **Shadow DOM:** Will house the styles, the WebGL canvas, the 2D UI canvas, and the HTML overlay (buttons).
*   **Lifecycle:**
    *   `connectedCallback()`: Initialize the Simulation.
    *   `disconnectedCallback()`: Clean up (stop animation loop, remove event listeners).
    *   `attributeChangedCallback()`: React to HTML attribute changes (e.g., changing `degree="4"` in the DOM).

### B. Decoupling `Simulation.js`
Currently, `Simulation` relies on:
1.  `window` events (`resize`, `keydown`).
2.  Specific DOM IDs via `UIManager`.

**Changes:**
*   Pass the **container element** (Shadow Root) to the `Simulation` constructor, not global IDs.
*   Attach event listeners (resize, mouse/touch) to the **host element** or the **canvases**, never `window` (unless absolutely necessary and cleaned up).
*   Use `ResizeObserver` instead of `window.onresize` to support multiple small components on one page.

### C. Absorbing `UIManager.js`
The current `UIManager` is "glue code" that binds buttons to `Simulation` methods.
*   **Simplify:** Move the UI logic directly into the `AlgebraicCurve` Web Component class.
*   The component handles the click events from its own Shadow DOM buttons and calls `this.simulation.setDegree()`.
*   This eliminates one entire file/class complexity.

## 2. File Structure Strategy

**New Structure:**
```text
/js
  /components
     AlgebraicCurve.js  <-- The Web Component (Controller)
  Simulation.js         <-- Logic Core (Physics + Loop)
  Solver.js             <-- Math (Pure)
  Renderer.js           <-- WebGL (Pure)
  Particle.js           <-- Physics Entity (Pure)
  Params.js             <-- Config (Scoped if possible)
```

## 3. Step-by-Step Implementation

### Phase 1: Preparation
1.  **Consolidate Styles:** Move `style.css` content into a JavaScript string or template literal to inject into Shadow DOM (so the component is a single importable file if desired, or keeps CSS isolated).
2.  **Remove Global IDs:** Identify every `document.getElementById` and plan to replace it with `this.shadowRoot.getElementById`.

### Phase 2: The Component Shell
1.  Create `js/AlgebraicCurve.js`.
2.  Implement the `HTMLElement` boilerplate (`attachShadow`, template generation).
3.  Move the HTML structure (buttons, canvases) from `index.html` into the component's inner HTML.

### Phase 3: Adapting Simulation
1.  Modify `Simulation` constructor to accept a `width` and `height` (or a ResizeObserver entry) instead of reading `window.innerWidth`.
2.  Update `resize()` to fit the parent container, not the window.
3.  Ensure `Params` are instance-specific (if we want two curves side-by-side with different settings) or accept that constants are shared. *Decision: Keep constants shared, but state (degree, pause) instance-specific.*

### Phase 4: Integration
1.  Update `index.html` to import the component and use the `<algebraic-curve>` tag.
2.  Verify `ResizeObserver` works (try resizing the browser window).
3.  Verify independent instances (put two on the page).

## 4. Specific Improvements
*   **ResizeObserver:** Essential for blog embedding. The canvas should size itself to the `<div>` it lives in.
*   **Touch Handling:** Ensure `touchOffset` logic works relative to the canvas bounding box, not screen coordinates (using `getBoundingClientRect`).
*   **Cleanup:** Properly destroy WebGL context and stop `requestAnimationFrame` when the component is removed from the DOM (crucial for Single Page Apps navigation).

## 5. API Design (Public Properties)
The component should expose:
*   `degree` (getter/setter)
*   `paused` (getter/setter)
*   `reset()` (method)

This allows external JavaScript on your blog to control the visualization programmatically.
