import { Particle } from './Particle.js';
import { Solver } from './Solver.js';
import { Renderer } from './Renderer.js';
import { params, K_DIST, K_SPEED, K_FORCE, VIEW_SCALE_FACTOR } from './Params.js';

export const MIN_DEGREE = 1;
export const MAX_DEGREE = 6;

/**
 * Orchestrates the entire simulation loop.
 * Manages the physics engine, mathematical solver, and WebGL renderer.
 * Decoupled from the DOM/UI.
 */
export class Simulation {
    /**
     * @param {HTMLCanvasElement} glCanvas - Canvas for WebGPU rendering.
     * @param {HTMLCanvasElement} uiCanvas - Canvas for 2D particle rendering.
     * @param {HTMLElement|ShadowRoot} container - The container element for sizing.
     */
    constructor(glCanvas, uiCanvas, container) {
        this.glCanvas = glCanvas;
        this.uiCanvas = uiCanvas;
        this.container = container; // Host or ShadowRoot
        
        // WebGPU context is handled by Renderer
        this.ctx = uiCanvas.getContext('2d');
        
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.solver = null;
        this.renderer = null;
        this.currentDegree = 2;
        this.pointCount = 0;
        
        this.needsUpdate = true; // Dirty flag for rendering

        // Event Hooks
        this.onDegreeChange = null;
        this.onPauseChange = null;
        this.onCurveVisibilityChange = null;

        this.init();
    }

    showError(msg) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'absolute';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.fontFamily = 'sans-serif';
        errorDiv.style.zIndex = '1000';
        errorDiv.style.textAlign = 'center';
        errorDiv.innerHTML = `<h3>Initialization Error</h3><p>${msg}</p>`;
        
        if (this.container && this.container.appendChild) {
            this.container.appendChild(errorDiv);
        } else {
            document.body.appendChild(errorDiv);
        }
        
        const ui = this.container.getElementById ? this.container.getElementById('ui-container') : document.getElementById('ui-container');
        if (ui) ui.style.display = 'none';
    }

    async init() {
        this.resize();
        await this.setDegree(this.currentDegree); 
        this.animate();
    }

    /**
     * Handles window resize events.
     * Updates canvas dimensions and recalculates physics/rendering scales.
     */
    resize() {
        // Use container dimensions, falling back to window if not provided (standalone mode)
        const logicalWidth = this.container.host ? this.container.host.clientWidth : (this.container.clientWidth || window.innerWidth);
        const logicalHeight = this.container.host ? this.container.host.clientHeight : (this.container.clientHeight || window.innerHeight);
        
        // Handle High-DPI (Retina) Displays
        const dpr = window.devicePixelRatio || 1;
        
        // UI Canvas (2D) - Scale for sharpness
        this.uiCanvas.width = logicalWidth * dpr;
        this.uiCanvas.height = logicalHeight * dpr;
        this.uiCanvas.style.width = `${logicalWidth}px`;
        this.uiCanvas.style.height = `${logicalHeight}px`;
        this.ctx.scale(dpr, dpr); // Normalize 2D context to logical coords
        
        // WebGPU Canvas - Scale for sharpness
        this.glCanvas.width = logicalWidth * dpr;
        this.glCanvas.height = logicalHeight * dpr;
        // WebGPU canvas style is already 100% via CSS
        
        this.width = logicalWidth;
        this.height = logicalHeight;

        this.updatePhysicsParams();

        // Solver uses Logical Coordinates (keeps math consistent regardless of DPI)
        if (this.solver) this.solver.resize(this.width, this.height, params.scale);
        
        // Renderer uses Physical Coordinates (for sharp rendering)
        // We pass the physical resolution and the Scaled scale factor
        if (this.renderer) {
            this.renderer.resize(
                this.glCanvas.width, 
                this.glCanvas.height, 
                params.scale * dpr
            );
        }
        
        this.needsUpdate = true;
    }

    /**
     * Dynamically scales physics parameters based on screen size and particle density.
     * Ensures consistent behavior across different resolutions.
     */
    updatePhysicsParams() {
        if (!this.pointCount) return;
        
        const areaPerPoint = (this.width * this.height) / this.pointCount;
        const baseScale = Math.sqrt(areaPerPoint);
        
        params.minDistance = baseScale * K_DIST;
        params.maxSpeed = baseScale * K_SPEED;
        params.maxForce = params.maxSpeed * K_FORCE;
        params.scale = Math.min(this.width, this.height) / VIEW_SCALE_FACTOR;
    }

    /**
     * Changes the degree of the algebraic curve.
     * Re-initializes particles, solver, and renderer.
     * @param {number} newDegree 
     */
    async setDegree(newDegree) {
        if (newDegree < MIN_DEGREE || newDegree > MAX_DEGREE) return;
        this.currentDegree = newDegree;
        
        const termCount = ((this.currentDegree + 1) * (this.currentDegree + 2)) / 2;
        this.pointCount = termCount - 1;
        
        // Clean up old resources
        if (this.renderer) {
            this.renderer.dispose();
        }

        this.solver = new Solver(this.currentDegree);
        this.renderer = new Renderer(this.glCanvas, this.currentDegree);
        
        // Check for initialization error
        const error = await this.renderer.init();
        if (error) {
            this.showError(error);
            return;
        }

        this.updatePhysicsParams();
        this.solver.resize(this.width, this.height, params.scale);
        this.renderer.resize(
            this.glCanvas.width, 
            this.glCanvas.height, 
            params.scale * (window.devicePixelRatio || 1)
        );
        
        this.spawnParticles();
        
        this.needsUpdate = true;
        if (this.onDegreeChange) this.onDegreeChange(this.currentDegree);
    }

    /**
     * Respawns all particles at random locations within the valid area.
     */
    spawnParticles() {
        this.particles = [];
        const margin = params.minDistance;
        for (let i = 0; i < this.pointCount; i++) {
            let x = Math.random() * (this.width - margin * 2) + margin;
            let y = Math.random() * (this.height - margin * 2) + margin;
            this.particles.push(new Particle(x, y));
        }
        this.needsUpdate = true;
    }

    togglePause() {
        params.isPaused = !params.isPaused;
        this.needsUpdate = true;
        if (this.onPauseChange) this.onPauseChange(params.isPaused);
    }

    cycleViewMode() {
        params.viewMode = (params.viewMode + 1) % 3;
        this.needsUpdate = true;
        if (this.onViewModeChange) this.onViewModeChange(params.viewMode);
    }

    /**
     * External trigger for UI interactions (like dragging) to force a redraw.
     */
    triggerUpdate() {
        this.needsUpdate = true;
    }

    /**
     * The main animation loop.
     */
    animate() {
        // If not paused, we always update and draw
        // If paused, we only draw if something marked the frame as dirty (needsUpdate)
        const shouldRender = !params.isPaused || this.needsUpdate;

        if (shouldRender) {
            if (!params.isPaused) {
                for (let p of this.particles) {
                    p.update(this.particles, this.width, this.height, params);
                }
            }

            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Draw Particles (Mode 0: Both, Mode 2: Particles Only)
            if (params.viewMode === 0 || params.viewMode === 2) {
                for (let p of this.particles) p.draw(this.ctx);
            }

            // Draw Curve (Mode 0: Both, Mode 1: Curve Only)
            let curveDrawn = false;
            if (params.viewMode === 0 || params.viewMode === 1) {
                const coeffs = this.solver.solve(this.particles);
                if (coeffs && this.renderer) {
                     this.renderer.draw(coeffs);
                     // If renderer wasn't ready, it skipped drawing.
                     // We check isReady to know if we succeeded.
                     if (this.renderer.isReady) curveDrawn = true;
                }
            } else {
                if (this.renderer) {
                    this.renderer.clear();
                    if (this.renderer.isReady) curveDrawn = true;
                }
            }

            // Only mark update complete if we aren't waiting for the renderer
            // If viewMode is particles only (2), we don't care about renderer
            if (params.viewMode === 2 || curveDrawn) {
                this.needsUpdate = false;
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}