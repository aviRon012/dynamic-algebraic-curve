import { Vector } from '../math/Vector.ts';
import { 
    POINT_RADIUS, POINT_COLOR,
    WANDER_RANGE, WANDER_RADIUS, WANDER_DISTANCE,
    EDGE_MARGIN,
    WEIGHT_SEPARATION, WEIGHT_WANDER, WEIGHT_BOUNDARIES,
    type SimulationParams
} from './Params.ts';

/**
 * Represents a single autonomous agent in the simulation.
 * Implements Reynolds-style steering behaviors (Separation, Wander, Bounds).
 */
export class Particle {
    pos: Vector;
    vel: Vector;
    acc: Vector;
    wanderTheta: number;
    
    // Reusable vectors
    _steer: Vector;
    _diff: Vector;
    _circleCenter: Vector;
    _displacement: Vector;

    constructor(x: number, y: number) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.acc = new Vector(0, 0);
        this.wanderTheta = Math.random() * Math.PI * 2;
        
        this._steer = new Vector(0, 0);
        this._diff = new Vector(0, 0);
        this._circleCenter = new Vector(0, 0);
        this._displacement = new Vector(0, 0);
    }

    applyForce(force: Vector) { this.acc.add(force); }

    separate(particles: Particle[], params: SimulationParams): Vector {
        let desiredseparationSq = params.minDistance * params.minDistance;
        this._steer.set(0, 0);
        let count = 0;
        for (let other of particles) {
            let dSq = Vector.distSq(this.pos, other.pos);
            if ((other !== this) && (dSq < desiredseparationSq) && (dSq > 0)) {
                let d = Math.sqrt(dSq);
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

    wander(params: SimulationParams): Vector {
        this.wanderTheta += (Math.random() * 2 - 1) * WANDER_RANGE;
        
        this._circleCenter.setVec(this.vel);
        this._circleCenter.normalize();
        this._circleCenter.mult(WANDER_DISTANCE);
        
        this._displacement.set(0, -1);
        this._displacement.mult(WANDER_RADIUS);
        
        let h = this.wanderTheta;
        let x = this._displacement.x;
        let y = this._displacement.y;
        // Rotate displacement
        this._displacement.x = x * Math.cos(h) - y * Math.sin(h);
        this._displacement.y = x * Math.sin(h) + y * Math.cos(h);
        
        let target = this._circleCenter.add(this._displacement);
        target.limit(params.maxForce);
        return target;
    }

    edges(width: number, height: number, params: SimulationParams): Vector {
        let steer = this._diff; // Reuse vector
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

    update(particles: Particle[], width: number, height: number, params: SimulationParams) {
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

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = POINT_COLOR;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}