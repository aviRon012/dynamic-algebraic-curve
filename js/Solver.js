export class Solver {
    constructor(degree) {
        this.degree = degree;
        this.terms = this.generateTerms(degree);
        this.termCount = this.terms.length;
        this.pointCount = this.termCount - 1;

        this.prevCoeffs = null;
        
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

    resize(width, height, scale) {
        this.width = width;
        this.height = height;
        this.cx = width / 2;
        this.cy = height / 2;
        this.scale = scale;
    }

    generateTerms(degree) {
        let terms = [];
        for (let d = degree; d >= 0; d--) {
            for (let x = d; x >= 0; x--) {
                let y = d - x;
                terms.push({x, y});
            }
        }
        return terms;
    }

    solve(particles) {
        if (particles.length !== this.pointCount) return null;

        for (let i = 0; i < this.pointCount; i++) {
            let p = particles[i];
            let nx = (p.pos.x - this.cx) / this.scale;
            let ny = (p.pos.y - this.cy) / this.scale;
            
            let row = this.matrix[i];
            for (let j = 0; j < this.termCount; j++) {
                let t = this.terms[j];
                let val = 1;
                for(let k=0; k<t.x; k++) val *= nx;
                for(let k=0; k<t.y; k++) val *= ny;
                row[j] = val;
            }
        }

        const nRows = this.pointCount;
        const nCols = this.termCount;
        let lead = 0;
        
        for (let r = 0; r < nRows; r++) {
            if (nCols <= lead) break;
            
            // Partial Pivoting
            let maxRow = r;
            let maxVal = Math.abs(this.matrix[r][lead]);
            
            for (let i = r + 1; i < nRows; i++) {
                let currVal = Math.abs(this.matrix[i][lead]);
                if (currVal > maxVal) {
                    maxVal = currVal;
                    maxRow = i;
                }
            }

            // If the pivot column is zero (singular), move to next column
            const EPSILON = 1e-10;
            const pivotScale = Math.max(1.0, maxVal); // Avoid division by zero issues if maxVal is tiny
            
            if (maxVal < EPSILON * pivotScale) {
                lead++;
                r--; // Stay on this row, check next column
                continue;
            }

            // Swap rows
            let temp = this.matrix[r];
            this.matrix[r] = this.matrix[maxRow];
            this.matrix[maxRow] = temp;
            
            let val = this.matrix[r][lead];
            for (let j = 0; j < nCols; j++) this.matrix[r][j] /= val;
            
            for (let k = 0; k < nRows; k++) {
                if (k === r) continue;
                val = this.matrix[k][lead];
                for (let j = 0; j < nCols; j++) this.matrix[k][j] -= val * this.matrix[r][j];
            }
            lead++;
        }

        this.coeffsBuffer[nCols - 1] = 1; 
        for (let i = nRows - 1; i >= 0; i--) {
            this.coeffsBuffer[i] = -this.matrix[i][nCols - 1]; 
        }

        let mag = 0;
        for(let c of this.coeffsBuffer) mag += c*c;
        mag = Math.sqrt(mag);
        for(let i=0; i < nCols; i++) this.coeffsBuffer[i] /= mag;

        if (this.prevCoeffs) {
            let dot = 0;
            for(let i=0; i < nCols; i++) dot += this.coeffsBuffer[i] * this.prevCoeffs[i];
            if (dot < 0) {
                for(let i=0; i < nCols; i++) this.coeffsBuffer[i] *= -1;
            }
        }

        if (!this.prevCoeffs) {
            this.prevCoeffs = new Float32Array(nCols);
        }
        for(let i=0; i < nCols; i++) this.prevCoeffs[i] = this.coeffsBuffer[i];

        return this.prevCoeffs;
    }
}
