import { params } from './Params.js';

/**
 * Manages the User Interface and Inputs.
 * Bridges the DOM (Buttons, Mouse, Keyboard) with the Simulation logic.
 */
export class UIManager {
    /**
     * @param {import('./Simulation.js').Simulation} simulation 
     */
    constructor(simulation) {
        this.sim = simulation;
        this.draggedParticle = null;
        this.idleTimer = null;
        this.uiContainer = document.getElementById('ui-container');
        this.canvas = document.getElementById('uiCanvas');

        this.bindEvents();
        this.setupCallbacks();
        this.initIdleTimer();
    }

    bindEvents() {
        // Buttons
        document.getElementById('btn-deg-up').addEventListener('click', () => this.sim.setDegree(this.sim.currentDegree + 1));
        document.getElementById('btn-deg-down').addEventListener('click', () => this.sim.setDegree(this.sim.currentDegree - 1));
        document.getElementById('btn-restart').addEventListener('click', () => this.sim.spawnParticles());
        document.getElementById('btn-pause').addEventListener('click', () => this.sim.togglePause());
        document.getElementById('btn-curve').addEventListener('click', () => this.sim.cycleViewMode());

        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.sim.togglePause();
            }
            if (e.key === 'r' || e.key === 'R') this.sim.spawnParticles();
            if (e.key === 'c' || e.key === 'C') this.sim.cycleViewMode();
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.sim.setDegree(this.sim.currentDegree + 1);
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.sim.setDegree(this.sim.currentDegree - 1);
            }
            this.resetIdle();
        });

        // Mouse Drag
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());

        // Touch Drag (Attached to Canvas only)
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Idle Reset
        window.addEventListener('mousemove', () => this.resetIdle());
        window.addEventListener('mousedown', () => this.resetIdle());
        window.addEventListener('touchstart', () => this.resetIdle());
        window.addEventListener('resize', () => this.resetIdle());
        window.addEventListener('orientationchange', () => this.resetIdle());
    }

    setupCallbacks() {
        this.sim.onDegreeChange = (degree) => {
            document.getElementById('degree-val').textContent = degree;
        };
        
        this.sim.onPauseChange = (isPaused) => {
            document.getElementById('btn-pause').textContent = isPaused ? 'Resume' : 'Pause';
        };

        this.sim.onViewModeChange = (mode) => {
            const labels = ['View: All', 'View: Curve', 'View: Points'];
            document.getElementById('btn-curve').textContent = labels[mode];
        };
    }

    handleMouseDown(e) {
        this.attemptDragStart(e.clientX, e.clientY);
    }

    handleMouseMove(e) {
        this.attemptDragMove(e.clientX, e.clientY);
    }

    handleMouseUp() {
        this.draggedParticle = null;
    }

    handleTouchStart(e) {
        e.preventDefault(); 
        this.attemptDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        this.attemptDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    handleTouchEnd() {
        this.draggedParticle = null;
    }

    attemptDragStart(x, y) {
        if (!params.isPaused) return;
        if (params.viewMode === 1) return; // Cannot drag invisible particles
        
        // Find closest particle within hit radius
        for (let p of this.sim.particles) {
            const dx = p.pos.x - x;
            const dy = p.pos.y - y;
            if (dx*dx + dy*dy < 900) { // Slightly larger hit radius for touch (30px)
                this.draggedParticle = p;
                break;
            }
        }
    }

    attemptDragMove(x, y) {
        if (this.draggedParticle) {
            if (!params.isPaused) {
                this.draggedParticle = null;
                return;
            }
            this.draggedParticle.pos.x = x;
            this.draggedParticle.pos.y = y;
            this.draggedParticle.vel.set(0, 0);
        }
    }

    initIdleTimer() {
        this.resetIdle();
    }

    resetIdle() {
        this.uiContainer.classList.remove('hidden');
        document.body.style.cursor = 'default';
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            this.uiContainer.classList.add('hidden');
            document.body.style.cursor = 'none';
        }, 3000);
    }
}