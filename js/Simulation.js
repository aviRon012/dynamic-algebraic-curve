import { Particle } from './Particle.js';
import { Solver } from './Solver.js';
import { Renderer } from './Renderer.js';
import { params, K_DIST, K_SPEED, K_FORCE } from './Params.js';

export class Simulation {
    constructor(glCanvas, uiCanvas) {
        this.glCanvas = glCanvas;
        this.uiCanvas = uiCanvas;
        this.gl = glCanvas.getContext('webgl');
        this.ctx = uiCanvas.getContext('2d');
        
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.solver = null;
        this.renderer = null;
        this.currentDegree = 2;
        this.pointCount = 0;
        
        // Callbacks
        this.onDegreeChange = null;
        this.onPauseChange = null;
        this.onCurveVisibilityChange = null;

        this.init();
    }

    init() {
        this.resize();
        this.setDegree(this.currentDegree); // Initializes solver/renderer/particles
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.glCanvas.width = this.width;
        this.glCanvas.height = this.height;
        this.uiCanvas.width = this.width;
        this.uiCanvas.height = this.height;

        this.gl.viewport(0, 0, this.width, this.height);

        this.updatePhysicsParams();

        if (this.solver) this.solver.resize(this.width, this.height, params.scale);
        if (this.renderer) this.renderer.resize(this.width, this.height, params.scale);
    }

    updatePhysicsParams() {
        // Safe check if pointCount is not set yet
        if (!this.pointCount) return;
        
        const areaPerPoint = (this.width * this.height) / this.pointCount;
        const baseScale = Math.sqrt(areaPerPoint);
        
        params.minDistance = baseScale * K_DIST;
        params.maxSpeed = baseScale * K_SPEED;
        params.maxForce = params.maxSpeed * K_FORCE;
        params.scale = Math.min(this.width, this.height) / 2.5;
    }

    setDegree(newDegree) {
        if (newDegree < 1 || newDegree > 6) return;
        this.currentDegree = newDegree;
        
        const termCount = ((this.currentDegree + 1) * (this.currentDegree + 2)) / 2;
        this.pointCount = termCount - 1;
        
        this.solver = new Solver(this.currentDegree);
        this.renderer = new Renderer(this.gl, this.currentDegree);
        
        this.updatePhysicsParams();
        this.resize(); // Ensure solver/renderer get new sizes
        this.spawnParticles();
        
        if (this.onDegreeChange) this.onDegreeChange(this.currentDegree);
    }

    spawnParticles() {
        this.particles = [];
        const margin = params.minDistance;
        for (let i = 0; i < this.pointCount; i++) {
            let x = Math.random() * (this.width - margin * 2) + margin;
            let y = Math.random() * (this.height - margin * 2) + margin;
            this.particles.push(new Particle(x, y));
        }
    }

    togglePause() {
        params.isPaused = !params.isPaused;
        if (this.onPauseChange) this.onPauseChange(params.isPaused);
    }

    toggleCurve() {
        params.showCurve = !params.showCurve;
        if (this.onCurveVisibilityChange) this.onCurveVisibilityChange(params.showCurve);
    }

    animate() {
        if (!params.isPaused) {
            for (let p of this.particles) {
                p.update(this.particles, this.width, this.height, params);
            }
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let p of this.particles) p.draw(this.ctx);

        if (params.showCurve) {
            const coeffs = this.solver.solve(this.particles);
            if (coeffs) this.renderer.draw(coeffs);
        } else {
            this.renderer.clear();
        }

        requestAnimationFrame(() => this.animate());
    }
}
