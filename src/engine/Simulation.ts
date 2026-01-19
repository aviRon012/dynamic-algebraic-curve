import { Particle } from './Particle.ts';
import { SolverGPU } from './SolverGPU.ts';
import { Renderer } from './Renderer.ts';
import { createDefaultParams, K_DIST, K_SPEED, K_FORCE, VIEW_SCALE_FACTOR } from './Params.ts';

export const MIN_DEGREE = 1;
export const MAX_DEGREE = 6;

export class Simulation {
    glCanvas: HTMLCanvasElement;
    uiCanvas: HTMLCanvasElement;
    container: HTMLElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    particles: Particle[];
    solver: SolverGPU | null;
    renderer: Renderer | null;
    currentDegree: number;
    pointCount: number;
    params: any;
    draggedParticle: Particle | null;
    needsUpdate: boolean;
    onDegreeChange: ((d: number) => void) | null;
    onPauseChange: ((p: boolean) => void) | null;
    onViewModeChange: ((m: number) => void) | null;
    
    // Shared WebGPU Device
    adapter: GPUAdapter | null;
    device: GPUDevice | null;

    // Performance
    lastTime: number;
    frameCount: number;
    fps: number;
    onFpsUpdate: ((fps: number) => void) | null;
    
    isChangingDegree: boolean;

    constructor(glCanvas: HTMLCanvasElement, uiCanvas: HTMLCanvasElement, container: HTMLElement) {
        this.glCanvas = glCanvas;
        this.uiCanvas = uiCanvas;
        this.container = container;
        
        const context = uiCanvas.getContext('2d');
        if (!context) throw new Error("Could not get 2D context");
        this.ctx = context;
        
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.solver = null;
        this.renderer = null;
        this.currentDegree = 2;
        this.pointCount = 0;
        
        this.params = createDefaultParams();
        this.draggedParticle = null;
        this.needsUpdate = true;
        this.isChangingDegree = false;
        
        this.adapter = null;
        this.device = null;

        this.onDegreeChange = null;
        this.onPauseChange = null;
        this.onViewModeChange = null;
        
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.onFpsUpdate = null;

        this.init();
    }

    showError(msg: string) {
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
        
        if (this.container) {
            this.container.appendChild(errorDiv);
        } else {
            document.body.appendChild(errorDiv);
        }
        
        const ui = document.getElementById('ui-container');
        if (ui) ui.style.display = 'none';
    }

    async init() {
        if (!navigator.gpu) {
            this.showError("WebGPU not supported.");
            return;
        }
        this.adapter = await navigator.gpu.requestAdapter();
        if (!this.adapter) {
            this.showError("No WebGPU adapter found.");
            return;
        }
        
        this.device = await this.adapter.requestDevice();
        
        this.resize();
        await this.setDegree(this.currentDegree); 
        this.animate();
    }

    resize() {
        const logicalWidth = this.container.clientWidth || window.innerWidth;
        const logicalHeight = this.container.clientHeight || window.innerHeight;
        
        const dpr = window.devicePixelRatio || 1;
        
        this.uiCanvas.width = logicalWidth * dpr;
        this.uiCanvas.height = logicalHeight * dpr;
        this.uiCanvas.style.width = `${logicalWidth}px`;
        this.uiCanvas.style.height = `${logicalHeight}px`;
        this.ctx.scale(dpr, dpr);
        
        this.glCanvas.width = logicalWidth * dpr;
        this.glCanvas.height = logicalHeight * dpr;
        
        this.width = logicalWidth;
        this.height = logicalHeight;

        this.updatePhysicsParams();

        if (this.solver) this.solver.resize(this.width, this.height, this.params.scale);
        
        if (this.renderer) {
            this.renderer.resize(
                this.glCanvas.width, 
                this.glCanvas.height, 
                this.params.scale * dpr
            );
        }
        
        this.needsUpdate = true;
    }

    updatePhysicsParams() {
        if (!this.pointCount) return;
        
        const areaPerPoint = (this.width * this.height) / this.pointCount;
        const baseScale = Math.sqrt(areaPerPoint);
        
        this.params.minDistance = baseScale * K_DIST;
        this.params.maxSpeed = baseScale * K_SPEED;
        this.params.maxForce = this.params.maxSpeed * K_FORCE;
        this.params.scale = Math.min(this.width, this.height) / VIEW_SCALE_FACTOR;
    }

    async setDegree(newDegree: number) {
        if (this.isChangingDegree) return;
        if (newDegree < MIN_DEGREE || newDegree > MAX_DEGREE) return;
        
        this.isChangingDegree = true;
        
        const termCount = ((newDegree + 1) * (newDegree + 2)) / 2;
        const nextPointCount = termCount - 1;
        
        if (!this.device) {
            this.isChangingDegree = false;
            return;
        }

        // 1. Create NEW resources in background
        const nextSolver = new SolverGPU(this.device, newDegree);
        const nextRenderer = new Renderer(this.glCanvas, newDegree);
        
        const error = await nextRenderer.init(this.device);
        if (error) {
            this.showError(error);
            this.isChangingDegree = false;
            return;
        }

        // 2. Prepare NEW state
        nextSolver.resize(this.width, this.height, this.params.scale);
        nextRenderer.resize(
            this.glCanvas.width, 
            this.glCanvas.height, 
            this.params.scale * (window.devicePixelRatio || 1)
        );

        // 3. Prepare NEW particles and Pre-Warm Solver
        const nextParticles: Particle[] = [];
        const margin = this.params.minDistance;
        for (let i = 0; i < nextPointCount; i++) {
            let x = Math.random() * (this.width - margin * 2) + margin;
            let y = Math.random() * (this.height - margin * 2) + margin;
            nextParticles.push(new Particle(x, y));
        }
        
        // Ensure Solver is ready before calling solve
        // (SolverGPU.initPipeline is async and called in constructor)
        // We wait for it here if needed
        while (!nextSolver.isReady) {
            await new Promise(r => setTimeout(r, 10));
        }
        
        nextSolver.solve(nextParticles);

        // 4. THE SWAP (Atomic)
        const oldRenderer = this.renderer;
        const oldSolver = this.solver;
        
        this.currentDegree = newDegree;
        this.pointCount = nextPointCount;
        this.solver = nextSolver;
        this.renderer = nextRenderer;
        this.particles = nextParticles;
        
        this.updatePhysicsParams();
        
        // 5. Dispose OLD resources safely
        if (this.device) {
            await this.device.queue.onSubmittedWorkDone();
        }
        
        if (oldRenderer) oldRenderer.dispose();
        if (oldSolver) oldSolver.dispose();
        
        this.needsUpdate = true;
        if (this.onDegreeChange) this.onDegreeChange(this.currentDegree);
        
        this.isChangingDegree = false;
    }

    spawnParticles() {
        this.particles = [];
        const margin = this.params.minDistance;
        for (let i = 0; i < this.pointCount; i++) {
            let x = Math.random() * (this.width - margin * 2) + margin;
            let y = Math.random() * (this.height - margin * 2) + margin;
            this.particles.push(new Particle(x, y));
        }
        this.needsUpdate = true;
    }

    togglePause() {
        this.params.isPaused = !this.params.isPaused;
        this.needsUpdate = true;
        if (this.onPauseChange) this.onPauseChange(this.params.isPaused);
    }

    cycleViewMode() {
        this.params.viewMode = (this.params.viewMode + 1) % 3;
        this.needsUpdate = true;
        if (this.onViewModeChange) this.onViewModeChange(this.params.viewMode);
    }

    handleInputStart(x: number, y: number): boolean {
        if (!this.params.isPaused) return false;
        if (this.params.viewMode === 1) return false;

        const grabRadiusSq = 900;

        for (let p of this.particles) {
            const dx = p.pos.x - x;
            const dy = p.pos.y - y;
            if (dx * dx + dy * dy < grabRadiusSq) {
                this.draggedParticle = p;
                return true;
            }
        }
        return false;
    }

    handleInputMove(x: number, y: number) {
        if (!this.draggedParticle) return;
        if (!this.params.isPaused) {
            this.draggedParticle = null;
            return;
        }

        this.draggedParticle.pos.x = x;
        this.draggedParticle.pos.y = y;
        this.draggedParticle.vel.set(0, 0);
        this.needsUpdate = true;
    }

    handleInputEnd() {
        this.draggedParticle = null;
    }

    triggerUpdate() {
        this.needsUpdate = true;
    }

    animate() {
        const now = performance.now();
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            if (this.onFpsUpdate) this.onFpsUpdate(this.fps);
        }

        const shouldRender = !this.params.isPaused || this.needsUpdate;

        if (shouldRender) {
            if (!this.params.isPaused) {
                for (let p of this.particles) {
                    p.update(this.particles, this.width, this.height, this.params);
                }
            }

            this.ctx.clearRect(0, 0, this.width, this.height);
            
            if (this.params.viewMode === 0 || this.params.viewMode === 2) {
                for (let p of this.particles) p.draw(this.ctx);
            }

            let curveDrawn = false;
            if (this.params.viewMode === 0 || this.params.viewMode === 1) {
                if (this.solver && this.solver.isReady && this.renderer) {
                    this.solver.solve(this.particles);
                    const coeffsBuffer = this.solver.getCoeffsBuffer();
                    
                    this.renderer.draw(coeffsBuffer);
                    if (this.renderer.isReady) curveDrawn = true;
                }
            } else {
                if (this.renderer) {
                    this.renderer.clear();
                    if (this.renderer.isReady) curveDrawn = true;
                }
            }

            if (this.params.viewMode === 2 || curveDrawn) {
                this.needsUpdate = false;
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}