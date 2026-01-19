import styles from './css/styles.css';
import { Simulation, MIN_DEGREE, MAX_DEGREE } from './engine/Simulation.ts';

const html = `
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

    <!-- FPS Counter -->
    <div id="fps-counter" style="position: absolute; top: 10px; left: 10px; color: #5eead4; font-family: monospace; font-weight: bold; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px; pointer-events: none; z-index: 20;">FPS: --</div>

    <canvas id="glCanvas"></canvas>
    <canvas id="uiCanvas"></canvas>
`;

function initApp() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = html;

    // We can't use Shadow DOM queries anymore, just standard DOM
    const $ = (id: string) => document.getElementById(id);
    const glCanvas = $('glCanvas') as HTMLCanvasElement;
    const uiCanvas = $('uiCanvas') as HTMLCanvasElement;

    if (!glCanvas || !uiCanvas) return;

    const simulation = new Simulation(glCanvas, uiCanvas, container);

    // Bind Events
    const updateUI = () => {
        const d = simulation.currentDegree;
        const btnDown = $('btn-deg-down') as HTMLButtonElement;
        const btnUp = $('btn-deg-up') as HTMLButtonElement;
        const degVal = $('degree-val');
        const btnPause = $('btn-pause');
        const btnCurve = $('btn-curve');

        if(degVal) degVal.textContent = d.toString();
        if(btnDown) btnDown.disabled = (d <= MIN_DEGREE);
        if(btnUp) btnUp.disabled = (d >= MAX_DEGREE);
        if(btnPause) btnPause.textContent = simulation.params.isPaused ? 'Resume' : 'Pause';
        
        const labels = ['View: All', 'View: Curve', 'View: Points'];
        if(btnCurve) btnCurve.textContent = labels[simulation.params.viewMode];
    };

    simulation.onDegreeChange = updateUI;
    simulation.onPauseChange = updateUI;
    simulation.onViewModeChange = updateUI;
    simulation.onFpsUpdate = (fps) => {
        const div = $('fps-counter');
        if (div) div.textContent = `FPS: ${fps}`;
    };

    // Initial UI Update
    updateUI();

    // Buttons
    $('btn-deg-up')!.onclick = () => simulation.setDegree(simulation.currentDegree + 1);
    $('btn-deg-down')!.onclick = () => simulation.setDegree(simulation.currentDegree - 1);
    $('btn-restart')!.onclick = () => simulation.spawnParticles();
    $('btn-pause')!.onclick = () => simulation.togglePause();
    $('btn-curve')!.onclick = () => simulation.cycleViewMode();

    // Modal
    const modal = $('info-modal')!;
    $('btn-info')!.onclick = () => modal.classList.add('visible');
    $('btn-close-modal')!.onclick = () => modal.classList.remove('visible');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('visible'); };

    // Interaction
    let touchOffset = 0;
    let idleTimer: any = null;

    const handleDragStart = (clientX: number, clientY: number) => {
        const rect = uiCanvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        simulation.handleInputStart(x, y);
    };

    const handleDragMove = (clientX: number, clientY: number) => {
        const rect = uiCanvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top + touchOffset;
        simulation.handleInputMove(x, y);
    };

    // Mouse
    uiCanvas.addEventListener('mousedown', (e) => {
        touchOffset = 0;
        handleDragStart(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => handleDragMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => simulation.handleInputEnd());

    // Touch
    uiCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchOffset = -60; // Offset for visibility under finger
        handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    
    uiCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    
    uiCanvas.addEventListener('touchend', () => simulation.handleInputEnd());

    // Idle Timer
    const resetIdle = () => {
        const ui = $('ui-container');
        if (!ui) return;
        
        ui.classList.remove('hidden');
        document.body.style.cursor = 'default';
        if (idleTimer) clearTimeout(idleTimer);
        
        idleTimer = setTimeout(() => {
            if (modal.classList.contains('visible')) {
                resetIdle();
                return;
            }
            ui.classList.add('hidden');
            document.body.style.cursor = 'none';
        }, 3000);
    };

    resetIdle();
    uiCanvas.addEventListener('mousemove', resetIdle);
    uiCanvas.addEventListener('mousedown', resetIdle);
    uiCanvas.addEventListener('touchstart', resetIdle);

    // Keyboard
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F1') { e.preventDefault(); modal.classList.add('visible'); }
        if (e.key === 'Escape') { modal.classList.remove('visible'); }
        if (e.key === ' ') { e.preventDefault(); simulation.togglePause(); }
        if (e.key === 'r' || e.key === 'R') simulation.spawnParticles();
        if (e.key === 'c' || e.key === 'C') simulation.cycleViewMode();
        if (e.key === 'ArrowUp') { e.preventDefault(); simulation.setDegree(simulation.currentDegree + 1); }
        if (e.key === 'ArrowDown') { e.preventDefault(); simulation.setDegree(simulation.currentDegree - 1); }
        resetIdle();
    });

    // Handle Resize specifically for the container setup
    const resizeObserver = new ResizeObserver(() => {
        simulation.resize();
        resetIdle(); // Show UI on rotation/resize
    });
    resizeObserver.observe(container);
}

// Start
initApp();
