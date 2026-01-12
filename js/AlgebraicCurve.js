// The styles are embedded directly to make the component self-contained
const styles = `
    :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100vh; /* Default to full screen if not set */
        overflow: hidden;
        background-color: #0f172a;
        font-family: sans-serif;
    }
    
    canvas {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    #glCanvas { z-index: 0; }
    #uiCanvas { z-index: 1; }

    #ui-container {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        color: white;
        font-family: 'Segoe UI', sans-serif;
        background: rgba(15, 23, 42, 0.8);
        padding: 12px 24px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        transition: opacity 0.5s ease;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 24px;
        max-width: 90%;
        box-sizing: border-box;
    }
    #ui-container.hidden {
        opacity: 0;
        pointer-events: none;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
    }

    button {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #5eead4;
        padding: 0 16px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    button svg {
        width: 18px;
        height: 18px;
        stroke: currentColor; /* Inherit color for Lucide icons */
    }
    button:hover {
        background: rgba(45, 212, 191, 0.2);
        border-color: #5eead4;
    }
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: transparent;
        border-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.3);
    }
    
    .degree-ctrl {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    #degree-val {
        font-weight: bold;
        min-width: 20px;
        text-align: center;
    }

    /* Info Modal */
    #info-modal {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 100;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }
    #info-modal.visible {
        opacity: 1;
        pointer-events: all;
    }
    .modal-content {
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80%;
        overflow-y: auto;
        color: #e2e8f0;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        position: relative;
    }
    .modal-content h2 { margin-top: 0; color: #5eead4; font-size: 1.5rem; }
    .modal-content h3 { color: #fbbf24; font-size: 1.1rem; margin-bottom: 8px; margin-top: 16px; }
    .modal-content p, .modal-content ul { line-height: 1.5; margin-bottom: 12px; font-size: 0.95rem; }
    .modal-content ul { padding-left: 20px; margin-top: 0; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    
    .btn-primary { background: #2dd4bf; color: #0f172a; border: none; }
    .btn-primary:hover { background: #5eead4; }
    
    #btn-close-modal {
        position: absolute;
        top: 16px; right: 16px;
        background: transparent; border: none;
        color: #94a3b8; font-size: 24px;
        padding: 4px; cursor: pointer;
    }
    #btn-close-modal:hover { color: white; }

    @media (max-width: 600px) {
        #ui-container {
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            width: max-content;
            bottom: 20px;
        }
        .row { width: 100%; justify-content: center; }
    }
`;

const template = `
    <style>${styles}</style>
    <div id="ui-container">
        <div class="row">
            <span>Degree:</span>
            <div class="degree-ctrl">
                <button id="btn-deg-down" title="Arrow Down">-</button>
                <span id="degree-val">2</span>
                <button id="btn-deg-up" title="Arrow Up">+</button>
            </div>
        </div>
        <div class="row">
            <button id="btn-pause" style="flex: 1" title="Space">Pause</button>
            <button id="btn-restart" style="flex: 1" title="R">Restart</button>
            <button id="btn-curve" style="flex: 1" title="C">View: All</button>
            <button id="btn-info" title="F1">
                <!-- Inline SVG for Info Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </button>
        </div>
    </div>
    
    <!-- Info Modal -->
    <div id="info-modal">
        <div class="modal-content">
            <button id="btn-close-modal">&times;</button>
            <h2>Dynamic Polynomials</h2>
            
            <h3>What is this?</h3>
            <p>A visualization of high-degree algebraic curves (<em>f(x,y) = 0</em>).</p>

            <h3>Why the points?</h3>
            <p>Random equations usually produce empty screens. By forcing the curve to pass through these moving points, we guarantee interesting, visible shapes.</p>

            <h3>How to play:</h3>
            <ul>
                <li><strong>Watch</strong> the swarm evolve the shape.</li>
                <li><strong>Pause (Space)</strong> to drag points manually.</li>
                <li><strong>Change Degree</strong> to see complex loops (deg 3+).</li>
            </ul>

            <div class="modal-actions">
                <a href="https://github.com/aviRon012/dynamic-algebraic-curve" target="_blank">
                    <button class="btn-primary" style="display: flex; align-items: center; gap: 8px;">
                        <!-- Inline SVG for GitHub Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                        View Code on GitHub
                    </button>
                </a>
            </div>
        </div>
    </div>

    <canvas id="glCanvas"></canvas>
    <canvas id="uiCanvas"></canvas>
`;

import { Simulation, MIN_DEGREE, MAX_DEGREE } from './Simulation.js';
import { params } from './Params.js';

export class AlgebraicCurve extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.simulation = null;
        this.resizeObserver = null;
        
        // Drag state
        this.draggedParticle = null;
        this.touchOffset = 0;
        this.idleTimer = null;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = template;
        
        const glCanvas = this.shadowRoot.getElementById('glCanvas');
        const uiCanvas = this.shadowRoot.getElementById('uiCanvas');
        
        this.simulation = new Simulation(glCanvas, uiCanvas, this.shadowRoot);
        
        // Hook into simulation state changes to update UI
        this.simulation.onDegreeChange = (d) => this.updateUI();
        this.simulation.onPauseChange = (p) => this.updateUI();
        this.simulation.onViewModeChange = (m) => this.updateUI();

        this.resizeObserver = new ResizeObserver(() => {
            if (this.simulation) this.simulation.resize();
        });
        this.resizeObserver.observe(this);
        
        this.bindEvents();
        this.initIdleTimer();
        this.updateUI(); // Initial state
    }

    disconnectedCallback() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        // Remove global listeners if any (e.g. keydown on window)
        // Note: We might want to keep window keydown for accessibility, 
        // but for strict component isolation, we should scope it or remove it.
        // For now, I'll remove the window listeners added in bindEvents.
        window.removeEventListener('keydown', this._handleKeydown);
    }
    
    bindEvents() {
        const $ = (id) => this.shadowRoot.getElementById(id);
        const uiCanvas = $('uiCanvas');

        // Buttons
        $('btn-deg-up').onclick = () => this.simulation.setDegree(this.simulation.currentDegree + 1);
        $('btn-deg-down').onclick = () => this.simulation.setDegree(this.simulation.currentDegree - 1);
        $('btn-restart').onclick = () => this.simulation.spawnParticles();
        $('btn-pause').onclick = () => this.simulation.togglePause();
        $('btn-curve').onclick = () => this.simulation.cycleViewMode();

        // Modal
        const modal = $('info-modal');
        $('btn-info').onclick = () => modal.classList.add('visible');
        $('btn-close-modal').onclick = () => modal.classList.remove('visible');
        modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('visible'); };

        // Interaction (Mouse/Touch) - Bound to Canvas, not Window (better for components)
        // Mouse
        uiCanvas.addEventListener('mousedown', (e) => {
            this.touchOffset = 0;
            this.handleDragStart(e.clientX, e.clientY);
        });
        window.addEventListener('mousemove', (e) => this.handleDragMove(e.clientX, e.clientY)); // Window for drag continuity
        window.addEventListener('mouseup', () => this.draggedParticle = null);

        // Touch
        uiCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchOffset = -60;
            this.handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
        
        uiCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
        
        uiCanvas.addEventListener('touchend', () => this.draggedParticle = null);

        // Idle Timer Resetters
        const resetIdle = () => this.resetIdle();
        uiCanvas.addEventListener('mousemove', resetIdle);
        uiCanvas.addEventListener('mousedown', resetIdle);
        uiCanvas.addEventListener('touchstart', resetIdle);

        // Keyboard (Window level required for shortcuts)
        this._handleKeydown = (e) => {
            if (e.key === 'F1') { e.preventDefault(); modal.classList.add('visible'); }
            if (e.key === ' ') { e.preventDefault(); this.simulation.togglePause(); }
            if (e.key === 'r' || e.key === 'R') this.simulation.spawnParticles();
            if (e.key === 'c' || e.key === 'C') this.simulation.cycleViewMode();
            if (e.key === 'ArrowUp') { e.preventDefault(); this.simulation.setDegree(this.simulation.currentDegree + 1); }
            if (e.key === 'ArrowDown') { e.preventDefault(); this.simulation.setDegree(this.simulation.currentDegree - 1); }
            resetIdle();
        };
        window.addEventListener('keydown', this._handleKeydown);
    }

    updateUI() {
        const $ = (id) => this.shadowRoot.getElementById(id);
        const d = this.simulation.currentDegree;
        
        $('degree-val').textContent = d;
        $('btn-deg-down').disabled = (d <= MIN_DEGREE);
        $('btn-deg-up').disabled = (d >= MAX_DEGREE);
        $('btn-pause').textContent = params.isPaused ? 'Resume' : 'Pause';
        
        const labels = ['View: All', 'View: Curve', 'View: Points'];
        $('btn-curve').textContent = labels[params.viewMode];
    }

    handleDragStart(clientX, clientY) {
        if (!params.isPaused) return;
        if (params.viewMode === 1) return;

        // Coordinates relative to viewport are fine since particle system uses full screen,
        // BUT if component is small, we need clientX relative to canvas?
        // Actually, Particle.pos is in "Canvas Space". 
        // If canvas is full screen, clientX == CanvasX.
        // If canvas is small, we need to subtract canvas.getBoundingClientRect().
        
        const rect = this.shadowRoot.getElementById('uiCanvas').getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        for (let p of this.simulation.particles) {
            const dx = p.pos.x - x;
            const dy = p.pos.y - y;
            if (dx*dx + dy*dy < 900) {
                this.draggedParticle = p;
                break;
            }
        }
    }

    handleDragMove(clientX, clientY) {
        if (!this.draggedParticle) return;
        if (!params.isPaused) { this.draggedParticle = null; return; }

        const rect = this.shadowRoot.getElementById('uiCanvas').getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top + this.touchOffset;

        this.draggedParticle.pos.x = x;
        this.draggedParticle.pos.y = y;
        this.draggedParticle.vel.set(0, 0);
        this.simulation.triggerUpdate();
    }

    initIdleTimer() { this.resetIdle(); }
    
    resetIdle() {
        const ui = this.shadowRoot.getElementById('ui-container');
        ui.classList.remove('hidden');
        this.style.cursor = 'default';
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            ui.classList.add('hidden');
            this.style.cursor = 'none';
        }, 3000);
    }
}

customElements.define('algebraic-curve', AlgebraicCurve);
