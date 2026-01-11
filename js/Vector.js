/**
 * A lightweight 2D Vector class for physics calculations.
 * Supports chainable operations for efficiency.
 */
export class Vector {
    /**
     * @param {number} x - The x component.
     * @param {number} y - The y component.
     */
    constructor(x, y) { this.x = x; this.y = y; }

    /**
     * Sets the vector components.
     * @param {number} x 
     * @param {number} y 
     * @returns {Vector} this
     */
    set(x, y) { this.x = x; this.y = y; return this; }

    /**
     * Copies components from another vector.
     * @param {Vector} v 
     * @returns {Vector} this
     */
    setVec(v) { this.x = v.x; this.y = v.y; return this; }

    /**
     * Adds another vector to this one.
     * @param {Vector} v 
     * @returns {Vector} this
     */
    add(v) { this.x += v.x; this.y += v.y; return this; }

    /**
     * Subtracts another vector from this one.
     * @param {Vector} v 
     * @returns {Vector} this
     */
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }

    /**
     * Multiplies the vector by a scalar.
     * @param {number} n 
     * @returns {Vector} this
     */
    mult(n) { this.x *= n; this.y *= n; return this; }

    /**
     * Divides the vector by a scalar.
     * @param {number} n 
     * @returns {Vector} this
     */
    div(n) { if (n !== 0) { this.x /= n; this.y /= n; } return this; }

    /**
     * Calculates the squared magnitude of the vector.
     * Faster than mag() as it avoids Math.sqrt().
     * @returns {number}
     */
    magSq() { return this.x * this.x + this.y * this.y; }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number}
     */
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }

    /**
     * Normalizes the vector to unit length (1).
     * @returns {Vector} this
     */
    normalize() { let m = this.mag(); if (m > 0) this.div(m); return this; }

    /**
     * Limits the magnitude of the vector to a maximum value.
     * @param {number} max 
     * @returns {Vector} this
     */
    limit(max) { 
        let mSq = this.magSq();
        if (mSq > max * max) { 
            this.div(Math.sqrt(mSq)); // Normalize manual to avoid re-calculating magSq
            this.mult(max); 
        } 
        return this; 
    }

    /**
     * Calculates the Euclidean distance between two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {number}
     */
    static dist(v1, v2) { let dx = v1.x - v2.x; let dy = v1.y - v2.y; return Math.sqrt(dx * dx + dy * dy); }

    /**
     * Calculates the squared Euclidean distance between two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {number}
     */
    static distSq(v1, v2) { let dx = v1.x - v2.x; let dy = v1.y - v2.y; return dx * dx + dy * dy; }

    /**
     * Returns a new Vector that is the difference (v1 - v2).
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {Vector}
     */
    static sub(v1, v2) { return new Vector(v1.x - v2.x, v1.y - v2.y); }

    /**
     * Creates a copy of this vector.
     * @returns {Vector}
     */
    copy() { return new Vector(this.x, this.y); }
}