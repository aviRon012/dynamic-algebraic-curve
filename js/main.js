import { Particle } from './Particle.js';
import { Solver } from './Solver.js';
import { Renderer } from './Renderer.js';
import { params, K_DIST, K_SPEED, K_FORCE } from './Params.js';

const glCanvas = document.getElementById('glCanvas');
const uiCanvas = document.getElementById('uiCanvas');
const gl = glCanvas.getContext('webgl');
const ctx = uiCanvas.getContext('2d');

let width, height;
let particles = [];
let solver;
let renderer;
let currentDegree = 2;
let termCount, pointCount;

function spawnParticles() {
    particles = [];
    const margin = params.minDistance; 
    for (let i = 0; i < pointCount; i++) {
        let x = Math.random() * (width - margin * 2) + margin;
        let y = Math.random() * (height - margin * 2) + margin;
        particles.push(new Particle(x, y));
    }
}

function setDegree(newDegree) {
    if (newDegree < 1 || newDegree > 6) return;
    currentDegree = newDegree;
    termCount = ((currentDegree + 1) * (currentDegree + 2)) / 2;
    pointCount = termCount - 1;
    document.getElementById('degree-val').textContent = currentDegree;
    solver = new Solver(currentDegree);
    renderer = new Renderer(gl, currentDegree);
    resize(); 
    spawnParticles();
}

function togglePause() {
    params.isPaused = !params.isPaused;
    document.getElementById('btn-pause').textContent = params.isPaused ? 'Resume' : 'Pause';
}

function toggleCurve() {
    params.showCurve = !params.showCurve;
    document.getElementById('btn-curve').textContent = params.showCurve ? 'Hide Curve' : 'Show Curve';
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    glCanvas.width = width;
    glCanvas.height = height;
    uiCanvas.width = width;
    uiCanvas.height = height;

    const areaPerPoint = (width * height) / pointCount;
    const baseScale = Math.sqrt(areaPerPoint);
    params.minDistance = baseScale * K_DIST;
    params.maxSpeed = baseScale * K_SPEED;
    params.maxForce = params.maxSpeed * K_FORCE;
    params.scale = Math.min(width, height) / 2.5;

    if (solver) solver.resize(width, height, params.scale);
    if (renderer) renderer.resize(width, height, params.scale);
}

function animate() {
    if (!params.isPaused) {
        for (let p of particles) {
            p.update(particles, width, height, params);
        }
    }
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) p.draw(ctx);
    
    if (params.showCurve) {
        const coeffs = solver.solve(particles);
        if (coeffs) renderer.draw(coeffs);
    } else {
        renderer.clear();
    }
    
    requestAnimationFrame(animate);
}

function init() {
    termCount = ((currentDegree + 1) * (currentDegree + 2)) / 2;
    pointCount = termCount - 1;
    solver = new Solver(currentDegree);
    renderer = new Renderer(gl, currentDegree);
    
    document.getElementById('btn-deg-up').addEventListener('click', () => setDegree(currentDegree + 1));
    document.getElementById('btn-deg-down').addEventListener('click', () => setDegree(currentDegree - 1));
    document.getElementById('btn-restart').addEventListener('click', () => spawnParticles());
    document.getElementById('btn-pause').addEventListener('click', togglePause);
    document.getElementById('btn-curve').addEventListener('click', toggleCurve);

    let idleTimer;
    const uiContainer = document.getElementById('ui-container');
    function resetIdle() {
        uiContainer.classList.remove('hidden');
        document.body.style.cursor = 'default';
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            uiContainer.classList.add('hidden');
            document.body.style.cursor = 'none';
        }, 3000);
    }
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('mousedown', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle();

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', (e) => {
        if (e.key === ' ') togglePause();
        if (e.key === 'r' || e.key === 'R') spawnParticles();
        if (e.key === 'c' || e.key === 'C') toggleCurve();
        if (e.key === 'ArrowUp') setDegree(currentDegree + 1);
        if (e.key === 'ArrowDown') setDegree(currentDegree - 1);
    });
    
    spawnParticles();
    requestAnimationFrame(animate);
}

init();
