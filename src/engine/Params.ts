// --- SCALING FACTORS ---
// Controls how the physics scales with screen size and particle count
export const K_DIST = 0.22; // Separation radius scale (0.15-0.3 recommended)
export const K_SPEED = 0.0055; // Max speed scale
export const K_FORCE = 0.06; // Steering force scale
export const VIEW_SCALE_FACTOR = 2.5; // Viewport zoom (higher = more zoomed out)

// --- VISUALS ---
export const POINT_RADIUS = 6;
export const COLOR_POS = [30/255, 41/255, 59/255, 1.0]; // Dark Blue (Positive)
export const COLOR_NEG = [15/255, 23/255, 42/255, 1.0]; // Darker Blue (Negative)
export const COLOR_LINE = [45/255, 212/255, 191/255, 1.0]; // Cyan (The Curve)
export const POINT_COLOR = '#fbbf24'; // Amber

// --- PHYSICS BEHAVIORS (Reynolds Steering) ---
export const WANDER_STRENGTH = 0.1;
export const WANDER_RANGE = 0.3; // Randomness of wander
export const WANDER_RADIUS = 25;
export const WANDER_DISTANCE = 80;
export const EDGE_MARGIN = 50; // Distance from edge to start turning back

// --- FORCE WEIGHTS ---
export const WEIGHT_SEPARATION = 1.5; // Multiplier for separation force
export const WEIGHT_WANDER = 1.0;     // Multiplier for wander force
export const WEIGHT_BOUNDARIES = 2.0; // Multiplier for boundary containment

export interface SimulationParams {
    minDistance: number;
    maxSpeed: number;
    maxForce: number;
    scale: number;
    isPaused: boolean;
    viewMode: number;
}

// --- INITIAL STATE FACTORY ---
export function createDefaultParams(): SimulationParams {
    return {
        minDistance: 100,
        maxSpeed: 2.5,
        maxForce: 0.15,
        scale: 1,
        isPaused: false,
        viewMode: 0 // 0: Both, 1: Curve Only, 2: Particles Only
    };
}