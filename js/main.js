import { Simulation } from './Simulation.js';
import { UIManager } from './UIManager.js';

const glCanvas = document.getElementById('glCanvas');
const uiCanvas = document.getElementById('uiCanvas');

// Initialize App
const simulation = new Simulation(glCanvas, uiCanvas);
const uiManager = new UIManager(simulation);