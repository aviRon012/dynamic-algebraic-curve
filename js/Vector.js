export class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    set(x, y) { this.x = x; this.y = y; return this; }
    setVec(v) { this.x = v.x; this.y = v.y; return this; }
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    mult(n) { this.x *= n; this.y *= n; return this; }
    div(n) { if (n !== 0) { this.x /= n; this.y /= n; } return this; }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { let m = this.mag(); if (m > 0) this.div(m); return this; }
    limit(max) { if (this.mag() > max) { this.normalize(); this.mult(max); } return this; }
    static dist(v1, v2) { let dx = v1.x - v2.x; let dy = v1.y - v2.y; return Math.sqrt(dx * dx + dy * dy); }
    static sub(v1, v2) { return new Vector(v1.x - v2.x, v1.y - v2.y); }
    copy() { return new Vector(this.x, this.y); }
}
