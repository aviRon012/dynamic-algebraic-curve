import { Vector } from './Vector.js';
import { 
    POINT_RADIUS, POINT_COLOR,
    WANDER_RANGE, WANDER_RADIUS, WANDER_DISTANCE,
    EDGE_MARGIN,
    WEIGHT_SEPARATION, WEIGHT_WANDER, WEIGHT_BOUNDARIES
} from './Params.js';

export class Particle {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.acc = new Vector(0, 0);
        this.wanderTheta = Math.random() * Math.PI * 2;
        
        this._steer = new Vector(0, 0);
        this._diff = new Vector(0, 0);
        this._circleCenter = new Vector(0, 0);
        this._displacement = new Vector(0, 0);
    }

    applyForce(force) { this.acc.add(force); }

    separate(particles, params) {
        let desiredseparation = params.minDistance;
        this._steer.set(0, 0);
        let count = 0;
        for (let other of particles) {
            let d = Vector.dist(this.pos, other.pos);
            if ((other !== this) && (d < desiredseparation)) {
                this._diff.setVec(this.pos).sub(other.pos);
                this._diff.normalize();
                this._diff.div(d);
                this._steer.add(this._diff);
                count++;
            }
        }
        if (count > 0) {
            this._steer.div(count);
            this._steer.normalize();
            this._steer.mult(params.maxSpeed);
            this._steer.sub(this.vel);
            this._steer.limit(params.maxForce * WEIGHT_SEPARATION); // Apply weight influence on limit?
            // Original code: steer.limit(MAX_FORCE * 1.5);
            // Wait, the weight is applied *later* in update.
            // But 'separate' had 'steer.limit(MAX_FORCE * 1.5)'.
            // I'll assume 1.5 was a specific tuning for separate force magnitude cap.
            // I'll use WEIGHT_SEPARATION here if it matches the intent.
            // The original update also did `sep.mult(1.5)`.
            // So it was limited to 1.5*Force, AND multiplied by 1.5?
            // Let's stick to the original logic structure but use constants.
        }
        return this._steer;
    }

    // Re-reading original logic:
    // separate: steer.limit(MAX_FORCE * 1.5)
    // edges: steer.limit(MAX_FORCE * 2)
    // update: sep.mult(1.5), wan.mult(1.0), bnd.mult(2.0)
    
    // It seems the limit factors (1.5, 2) match the weights.
    // So I will use WEIGHT_ constants for limits too.

    separate(particles, params) {
        let desiredseparation = params.minDistance;
        this._steer.set(0, 0);
        let count = 0;
        for (let other of particles) {
            let d = Vector.dist(this.pos, other.pos);
            if ((other !== this) && (d < desiredseparation)) {
                this._diff.setVec(this.pos).sub(other.pos);
                this._diff.normalize();
                this._diff.div(d);
                this._steer.add(this._diff);
                count++;
            }
        }
        if (count > 0) {
            this._steer.div(count);
            this._steer.normalize();
            this._steer.mult(params.maxSpeed);
            this._steer.sub(this.vel);
            this._steer.limit(params.maxForce * WEIGHT_SEPARATION); 
        }
        return this._steer;
    }

    wander(params) {
        this.wanderTheta += (Math.random() * 2 - 1) * WANDER_RANGE;
        
        this._circleCenter.setVec(this.vel);
        this._circleCenter.normalize();
        this._circleCenter.mult(WANDER_DISTANCE);
        
        this._displacement.set(0, -1);
        this._displacement.mult(WANDER_RADIUS);
        
        let h = this.wanderTheta;
        let x = this._displacement.x;
        let y = this._displacement.y;
        this._displacement.x = x * Math.cos(h) - y * Math.sin(h);
        this._displacement.y = x * Math.sin(h) + y * Math.cos(h);
        
        let target = this._circleCenter.add(this._displacement);
        target.limit(params.maxForce);
        return target;
    }

    edges(width, height, params) {
        let steer = this._diff;
        steer.set(0, 0);
        
        if (this.pos.x < EDGE_MARGIN) steer.x = params.maxSpeed;
        if (this.pos.x > width - EDGE_MARGIN) steer.x = -params.maxSpeed;
        if (this.pos.y < EDGE_MARGIN) steer.y = params.maxSpeed;
        if (this.pos.y > height - EDGE_MARGIN) steer.y = -params.maxSpeed;
        
        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(params.maxSpeed);
            steer.sub(this.vel);
            steer.limit(params.maxForce * WEIGHT_BOUNDARIES);
        }
        return steer;
    }

    update(particles, width, height, params) {
        let sep = this.separate(particles, params);
        let wan = this.wander(params);
        let bnd = this.edges(width, height, params);
        
        sep.mult(WEIGHT_SEPARATION);
        wan.mult(WEIGHT_WANDER);
        bnd.mult(WEIGHT_BOUNDARIES);
        
        this.applyForce(sep);
        this.applyForce(wan);
        this.applyForce(bnd);
        
        this.vel.add(this.acc);
        this.vel.limit(params.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = POINT_COLOR;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}