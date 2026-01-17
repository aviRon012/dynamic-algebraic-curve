import { Particle } from '../engine/Particle.ts';

/**
 * Solves for the coefficients of an implicit algebraic curve passing through a set of points.
 * Uses Gaussian Elimination with Partial Pivoting.
 */
export class Solver {
    degree: number;
    terms: {x: number, y: number}[];
    termCount: number;
    pointCount: number;
    prevCoeffs: Float32Array | null;
    matrix: Float64Array[];
    coeffsBuffer: Float64Array;
    width: number;
    height: number;
    cx: number;
    cy: number;
    scale: number;

    /**
     * @param {number} degree - The degree of the curve (e.g., 2 for Conic, 3 for Cubic).
     */
    constructor(degree: number) {
        this.degree = degree;
        this.terms = this.generateTerms(degree);
        this.termCount = this.terms.length;
        this.pointCount = this.termCount - 1; // Need T-1 points to solve (1 degree of freedom for scale)

        this.prevCoeffs = null;
        
        // Matrix: pointCount rows, termCount cols
        // We reuse these arrays to avoid garbage collection
        this.matrix = [];
        for (let i = 0; i < this.pointCount; i++) {
            this.matrix.push(new Float64Array(this.termCount));
        }
        this.coeffsBuffer = new Float64Array(this.termCount);

        this.width = 1;
        this.height = 1;
        this.cx = 0.5;
        this.cy = 0.5;
        this.scale = 1;
    }

    /**
     * Updates the internal dimensions used for normalizing point coordinates.
     */
    resize(width: number, height: number, scale: number) {
        this.width = width;
        this.height = height;
        this.cx = width / 2;
        this.cy = height / 2;
        this.scale = scale;
    }

    /**
     * Generates the list of polynomial terms (powers of x and y).
     */
    generateTerms(degree: number) {
        let terms = [];
        for (let d = degree; d >= 0; d--) {
            for (let x = d; x >= 0; x--) {
                let y = d - x;
                terms.push({x, y});
            }
        }
        return terms;
    }

    /**
     * Solves the system of linear equations to find the curve coefficients.
     */
    solve(particles: Particle[]): Float32Array | null {
        if (particles.length !== this.pointCount) return null;

        // 1. Fill Matrix
        const xPowers = new Float64Array(this.degree + 1);
        const yPowers = new Float64Array(this.degree + 1);
        xPowers[0] = 1.0;
        yPowers[0] = 1.0;

        for (let i = 0; i < this.pointCount; i++) {
            let p = particles[i];
            let nx = (p.pos.x - this.cx) / this.scale;
            let ny = (p.pos.y - this.cy) / this.scale;
            
            // Pre-calculate powers for this particle
            for (let k = 1; k <= this.degree; k++) {
                xPowers[k] = xPowers[k-1] * nx;
                yPowers[k] = yPowers[k-1] * ny;
            }

            let row = this.matrix[i]!;
            for (let j = 0; j < this.termCount; j++) {
                let t = this.terms[j]!;
                row[j] = xPowers[t.x]! * yPowers[t.y]!;
            }
        }

        // 2. Gaussian Elimination with Partial Pivoting
        const nRows = this.pointCount;
        const nCols = this.termCount;
        let lead = 0;
        
        for (let r = 0; r < nRows; r++) {
            if (nCols <= lead) break;
            
            // Partial Pivoting: Find max value in column to minimize error
            let maxRow = r;
            let maxVal = Math.abs(this.matrix[r]![lead]!);
            
            for (let i = r + 1; i < nRows; i++) {
                let currVal = Math.abs(this.matrix[i]![lead]!);
                if (currVal > maxVal) {
                    maxVal = currVal;
                    maxRow = i;
                }
            }

            // Singularity Check (Relative Epsilon)
            const EPSILON = 1e-10;
            const pivotScale = Math.max(1.0, maxVal);
            
            if (maxVal < EPSILON * pivotScale) {
                lead++;
                r--; // Retry this row with next column
                continue;
            }

            // Swap rows
            let temp = this.matrix[r]!;
            this.matrix[r] = this.matrix[maxRow]!;
            this.matrix[maxRow] = temp;
            
            // Normalize Pivot Row
            let val = this.matrix[r]![lead]!;
            for (let j = 0; j < nCols; j++) this.matrix[r]![j] /= val;
            
            // Eliminate other rows
            for (let k = 0; k < nRows; k++) {
                if (k === r) continue;
                val = this.matrix[k]![lead]!;
                for (let j = 0; j < nCols; j++) this.matrix[k]![j] -= val * this.matrix[r]![j];
            }
            lead++;
        }

        // 3. Extract Coefficients
        // The last column (constant/lowest term) corresponds to the '1' in the solution vector space
        this.coeffsBuffer[nCols - 1] = 1; 
        for (let i = nRows - 1; i >= 0; i--) {
            this.coeffsBuffer[i] = -this.matrix[i]![nCols - 1]!; 
        }

        // 4. Normalize Vector (for consistent gradient rendering)
        let mag = 0;
        for(let c of this.coeffsBuffer) mag += c*c;
        mag = Math.sqrt(mag);
        for(let i=0; i < nCols; i++) this.coeffsBuffer[i] /= mag;

        // 5. Consistency Check (prevent sign flipping between frames)
        if (this.prevCoeffs) {
            let dot = 0;
            for(let i=0; i < nCols; i++) dot += this.coeffsBuffer[i] * this.prevCoeffs[i];
            if (dot < 0) {
                for(let i=0; i < nCols; i++) this.coeffsBuffer[i] *= -1;
            }
        }

        // Save for next frame
        if (!this.prevCoeffs) {
            this.prevCoeffs = new Float32Array(nCols);
        }
        for(let i=0; i < nCols; i++) this.prevCoeffs[i] = this.coeffsBuffer[i];

        return this.prevCoeffs;
    }
}