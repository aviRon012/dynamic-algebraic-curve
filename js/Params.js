// --- SCALING FACTORS ---
export const K_DIST = 0.22;
export const K_SPEED = 0.0055;
export const K_FORCE = 0.06;
export const VIEW_SCALE_FACTOR = 2.5;

// --- VISUALS ---
export const POINT_RADIUS = 6;
export const COLOR_POS = [30/255, 41/255, 59/255, 1.0]; 
export const COLOR_NEG = [15/255, 23/255, 42/255, 1.0];
export const COLOR_LINE = [45/255, 212/255, 191/255, 1.0];
export const POINT_COLOR = '#5eead4';

// --- PHYSICS BEHAVIORS ---
export const WANDER_STRENGTH = 0.1; // (Note: kept for compatibility if used elsewhere)
export const WANDER_RANGE = 0.3;
export const WANDER_RADIUS = 25;
export const WANDER_DISTANCE = 80;
export const EDGE_MARGIN = 50;

// --- FORCE WEIGHTS ---
export const WEIGHT_SEPARATION = 1.5;
export const WEIGHT_WANDER = 1.0;
export const WEIGHT_BOUNDARIES = 2.0;

// --- SHARED STATE ---
export const params = {
    minDistance: 100,
    maxSpeed: 2.5,
    maxForce: 0.15,
    scale: 1,
    isPaused: false,
    showCurve: true
};