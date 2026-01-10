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
        document.getElementById('btn-curve').addEventListener('click', () => this.sim.toggleCurve());

        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.sim.togglePause();
            }
            if (e.key === 'r' || e.key === 'R') this.sim.spawnParticles();
            if (e.key === 'c' || e.key === 'C') this.sim.toggleCurve();
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
        
        // Idle Reset
        window.addEventListener('mousemove', () => this.resetIdle());
        window.addEventListener('mousedown', () => this.resetIdle());
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

        this.sim.onCurveVisibilityChange = (showCurve) => {
            document.getElementById('btn-curve').textContent = showCurve ? 'Hide Curve' : 'Show Curve';
        };
    }

    handleMouseDown(e) {
        if (!params.isPaused) return;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Find closest particle within hit radius
        for (let p of this.sim.particles) {
            const dx = p.pos.x - mouseX;
            const dy = p.pos.y - mouseY;
            if (dx*dx + dy*dy < 400) { 
                this.draggedParticle = p;
                break;
            }
        }
    }

    handleMouseMove(e) {
        if (this.draggedParticle) {
            if (!params.isPaused) {
                this.draggedParticle = null;
                return;
            }
            this.draggedParticle.pos.x = e.clientX;
            this.draggedParticle.pos.y = e.clientY;
            this.draggedParticle.vel.set(0, 0);
        }
    }

    handleMouseUp() {
        this.draggedParticle = null;
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