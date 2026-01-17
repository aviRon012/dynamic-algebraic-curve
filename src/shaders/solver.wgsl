// Solver Compute Shader

override pointCount: u32;
override termCount: u32;
override degree: u32;

struct SolverParams {
    scale: f32,
    width: f32,
    height: f32,
    padding: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<vec2<f32>>;
@group(0) @binding(1) var<storage, read_write> coeffs: array<f32>;
@group(0) @binding(2) var<uniform> params: SolverParams;
@group(0) @binding(3) var<storage, read_write> prevCoeffs: array<f32>;
@group(0) @binding(4) var<storage, read_write> matrix: array<f32>; // Flat array, size termCount*termCount

var<workgroup> dotProductSum: f32;

// We use 256 threads. This supports matrix sizes up to 256 rows.
// Degree 20 -> ~230 terms. Safe.
@compute @workgroup_size(256)
fn main(@builtin(local_invocation_id) id: vec3<u32>) {
    let row = id.x;
    let valid_row = row < pointCount;
    let n_cols = termCount; // Use override directly

    // --- STEP 1: BUILD MATRIX ---
    if (valid_row) {
        let p_raw = particles[row];
        let cx = params.width * 0.5;
        let cy = params.height * 0.5;
        let nx = (p_raw.x - cx) / params.scale;
        let ny = (p_raw.y - cy) / params.scale;

        var col: u32 = 0u;
        for (var d = degree; d + 1u > 0u; d--) {
            for (var px = d; px + 1u > 0u; px--) {
                let py = d - px;
                var val = 1.0;
                for(var k=0u; k<px; k++) { val *= nx; }
                for(var k=0u; k<py; k++) { val *= ny; }
                
                // Flat access: row * stride + col
                matrix[row * n_cols + col] = val;
                col++;
            }
        }
    }
    workgroupBarrier();

    // --- STEP 2: GAUSSIAN ELIMINATION ---
    let n_rows = pointCount;

    for (var k = 0u; k < n_rows; k++) {
        // Pivot Finding (Thread 0)
        if (id.x == 0u) {
            var max_val = abs(matrix[k * n_cols + k]);
            var max_row = k;
            
            for (var r = k + 1u; r < n_rows; r++) {
                let val = abs(matrix[r * n_cols + k]);
                if (val > max_val) {
                    max_val = val;
                    max_row = r;
                }
            }
            
            // Swap rows
            if (max_row != k) {
                for (var c = 0u; c < n_cols; c++) {
                    let idx1 = k * n_cols + c;
                    let idx2 = max_row * n_cols + c;
                    let tmp = matrix[idx1];
                    matrix[idx1] = matrix[idx2];
                    matrix[idx2] = tmp;
                }
            }
            
            // Normalize
            let pivot = matrix[k * n_cols + k];
            if (abs(pivot) > 1e-10) {
                for (var c = k; c < n_cols; c++) {
                    matrix[k * n_cols + c] /= pivot;
                }
            }
        }
        
        workgroupBarrier();
        
        // Elimination (Parallel by row)
        // Only threads > k need to work? Or all threads != k?
        // Standard GE eliminates below pivot.
        // Parallelizing:
        // We assigned thread `row` to matrix `row`.
        // If `row > k`, eliminate.
        if (valid_row && row > k) { // Only eliminate rows BELOW pivot
            let pivot_val = matrix[row * n_cols + k];
            if (abs(pivot_val) > 1e-10) {
                for (var c = k; c < n_cols; c++) {
                    // matrix[row][c] -= pivot * matrix[k][c]
                    let val_k = matrix[k * n_cols + c];
                    matrix[row * n_cols + c] -= pivot_val * val_k;
                }
            }
        }
        
        workgroupBarrier();
    }

    // --- STEP 3: BACK SUBSTITUTION ---
    // With RREF/Diagonalization above? No, we did Gaussian (Row Echelon), not Gauss-Jordan (Reduced Row Echelon).
    // The loop above only eliminates BELOW.
    // So we have an Upper Triangular matrix.
    // We need to solve for x by back-substitution.
    
    // Thread 0 can do back-sub sequentially (fast enough for N=100)
    // Or we can do parallel Jordan step.
    
    // Let's implement correct Back Substitution for Upper Triangular.
    // We want to find coeffs c[0]..c[N-1].
    // We know c[N] = 1 (fixed).
    // Last equation: M[N-1][N-1] * c[N-1] + M[N-1][N] * 1 = 0
    // => c[N-1] = -M[N-1][N] / M[N-1][N-1] (Pivot should be 1 if normalized)
    
    if (id.x == 0u) {
        // Initialize coeffs with 0 (or target value)
        // We need to write to `coeffs` array.
        
        // Last term is fixed to 1.0
        // termCount is N+1 terms. pointCount is N equations.
        // matrix is N x (N+1).
        // c[N] = 1.0.
        
        coeffs[n_rows] = 1.0; 
        
        // Iterate rows backwards from N-1 down to 0
        for (var i_iter = 0u; i_iter < n_rows; i_iter++) {
            let i = n_rows - 1u - i_iter; // i goes N-1..0
            
            // Equation i: sum(M[i][j] * c[j]) = 0 for j=i..N
            // M[i][i] * c[i] + sum(...) = 0
            // c[i] = -sum(M[i][j]*c[j]) / M[i][i]
            // Since we normalized, M[i][i] is 1.0.
            
            var sum = 0.0;
            for (var j = i + 1u; j < n_cols; j++) {
                sum += matrix[i * n_cols + j] * coeffs[j];
            }
            coeffs[i] = -sum;
        }
    }
    workgroupBarrier();

    // --- STEP 4: SIGN CONSISTENCY ---
    if (id.x == 0u) { dotProductSum = 0.0; }
    workgroupBarrier();

    if (row < n_cols) {
        // Parallel dot product part? No, let's just do it serial in thread 0.
        // Reducing race conditions. 
    }
    
    if (id.x == 0u) {
        var sum = 0.0;
        for (var i = 0u; i < n_cols; i++) {
            sum += coeffs[i] * prevCoeffs[i];
        }
        
        if (sum < 0.0) {
            for (var i = 0u; i < n_cols; i++) {
                coeffs[i] = -coeffs[i];
            }
        }
        
        // Store
        for (var i = 0u; i < n_cols; i++) {
            prevCoeffs[i] = coeffs[i];
        }
    }
}
