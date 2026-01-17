/**
 * A lightweight 2D Vector class for physics calculations.
 * Supports chainable operations for efficiency.
 */
export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) { this.x = x; this.y = y; }

    set(x: number, y: number): Vector { this.x = x; this.y = y; return this; }

    setVec(v: Vector): Vector { this.x = v.x; this.y = v.y; return this; }

    add(v: Vector): Vector { this.x += v.x; this.y += v.y; return this; }

    sub(v: Vector): Vector { this.x -= v.x; this.y -= v.y; return this; }

    mult(n: number): Vector { this.x *= n; this.y *= n; return this; }

    div(n: number): Vector { if (n !== 0) { this.x /= n; this.y /= n; } return this; }

    magSq(): number { return this.x * this.x + this.y * this.y; }

    mag(): number { return Math.sqrt(this.x * this.x + this.y * this.y); }

    normalize(): Vector { let m = this.mag(); if (m > 0) this.div(m); return this; }

    limit(max: number): Vector { 
        let mSq = this.magSq();
        if (mSq > max * max) { 
            this.div(Math.sqrt(mSq)); 
            this.mult(max); 
        } 
        return this; 
    }

    static dist(v1: Vector, v2: Vector): number { let dx = v1.x - v2.x; let dy = v1.y - v2.y; return Math.sqrt(dx * dx + dy * dy); }

    static distSq(v1: Vector, v2: Vector): number { let dx = v1.x - v2.x; let dy = v1.y - v2.y; return dx * dx + dy * dy; }

    static sub(v1: Vector, v2: Vector): Vector { return new Vector(v1.x - v2.x, v1.y - v2.y); }
}