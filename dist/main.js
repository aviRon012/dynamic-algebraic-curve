var T=`:host {
    display: block;
    position: relative;
    width: 100%;
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height for mobile */
    overflow: hidden;
    background-color: #0f172a;
    font-family: sans-serif;
}

canvas {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
#glCanvas { z-index: 0; }
#uiCanvas { z-index: 1; }

#ui-container {
    position: absolute;
    bottom: calc(40px + env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    color: white;
    font-family: 'Segoe UI', sans-serif;
    background: rgba(15, 23, 42, 0.8);
    padding: 12px 24px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    transition: opacity 0.5s ease;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 24px;
    max-width: 90%;
    box-sizing: border-box;
}
#ui-container.hidden {
    opacity: 0;
    pointer-events: none;
}
.row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
}

button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #5eead4;
    padding: 0 16px;
    height: 36px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
button svg {
    width: 18px;
    height: 18px;
    stroke: currentColor; /* Inherit color for Lucide icons */
}
button:hover {
    background: rgba(45, 212, 191, 0.2);
    border-color: #5eead4;
}
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: transparent;
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
}

.degree-ctrl {
    display: flex;
    align-items: center;
    gap: 10px;
}
#degree-val {
    font-weight: bold;
    min-width: 20px;
    text-align: center;
}

/* Info Modal */
#info-modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}
#info-modal.visible {
    opacity: 1;
    pointer-events: all;
}
.modal-content {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    max-height: 80dvh;
    overflow-y: auto;
    color: #e2e8f0;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    position: relative;
}
.modal-content h2 { margin-top: 0; color: #5eead4; font-size: 1.5rem; }
.modal-content h3 { color: #fbbf24; font-size: 1.1rem; margin-bottom: 8px; margin-top: 16px; }
.modal-content p, .modal-content ul { line-height: 1.5; margin-bottom: 12px; font-size: 0.95rem; }
.modal-content ul { padding-left: 20px; margin-top: 0; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

.btn-primary { background: #2dd4bf; color: #0f172a; border: none; }
.btn-primary:hover { background: #5eead4; }

#btn-close-modal {
    position: absolute;
    top: 16px; right: 16px;
    background: transparent; border: none;
    color: #94a3b8; font-size: 24px;
    padding: 4px; cursor: pointer;
}
#btn-close-modal:hover { color: white; }

@media (max-width: 600px) {
    #ui-container {
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        width: max-content;
        bottom: calc(20px + env(safe-area-inset-bottom));
    }
    .row { width: 100%; justify-content: center; }
}
`;class l{x;y;constructor(t,i){this.x=t,this.y=i}set(t,i){return this.x=t,this.y=i,this}setVec(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}sub(t){return this.x-=t.x,this.y-=t.y,this}mult(t){return this.x*=t,this.y*=t,this}div(t){if(t!==0)this.x/=t,this.y/=t;return this}magSq(){return this.x*this.x+this.y*this.y}mag(){return Math.sqrt(this.x*this.x+this.y*this.y)}normalize(){let t=this.mag();if(t>0)this.div(t);return this}limit(t){let i=this.magSq();if(i>t*t)this.div(Math.sqrt(i)),this.mult(t);return this}static dist(t,i){let r=t.x-i.x,e=t.y-i.y;return Math.sqrt(r*r+e*e)}static distSq(t,i){let r=t.x-i.x,e=t.y-i.y;return r*r+e*e}static sub(t,i){return new l(t.x-i.x,t.y-i.y)}}var j=0.22,U=0.0055,V=0.06,N=2.5,q=6,B=[0.11764705882352941,0.1607843137254902,0.23137254901960785,1],L=[0.058823529411764705,0.09019607843137255,0.16470588235294117,1],D=[0.17647058823529413,0.8313725490196079,0.7490196078431373,1],K="#fbbf24";var W=0.3,J=25,H=80,f=50,m=1.5,E=1,w=2;function Q(){return{minDistance:100,maxSpeed:2.5,maxForce:0.15,scale:1,isPaused:!1,viewMode:0}}class v{pos;vel;acc;wanderTheta;_steer;_diff;_circleCenter;_displacement;constructor(t,i){this.pos=new l(t,i),this.vel=new l(Math.random()*2-1,Math.random()*2-1),this.acc=new l(0,0),this.wanderTheta=Math.random()*Math.PI*2,this._steer=new l(0,0),this._diff=new l(0,0),this._circleCenter=new l(0,0),this._displacement=new l(0,0)}applyForce(t){this.acc.add(t)}separate(t,i){let r=i.minDistance*i.minDistance;this._steer.set(0,0);let e=0;for(let o of t){let n=l.distSq(this.pos,o.pos);if(o!==this&&n<r&&n>0){let a=Math.sqrt(n);this._diff.setVec(this.pos).sub(o.pos),this._diff.normalize(),this._diff.div(a),this._steer.add(this._diff),e++}}if(e>0)this._steer.div(e),this._steer.normalize(),this._steer.mult(i.maxSpeed),this._steer.sub(this.vel),this._steer.limit(i.maxForce*m);return this._steer}wander(t){this.wanderTheta+=(Math.random()*2-1)*W,this._circleCenter.setVec(this.vel),this._circleCenter.normalize(),this._circleCenter.mult(H),this._displacement.set(0,-1),this._displacement.mult(J);let i=this.wanderTheta,r=this._displacement.x,e=this._displacement.y;this._displacement.x=r*Math.cos(i)-e*Math.sin(i),this._displacement.y=r*Math.sin(i)+e*Math.cos(i);let o=this._circleCenter.add(this._displacement);return o.limit(t.maxForce),o}edges(t,i,r){let e=this._diff;if(e.set(0,0),this.pos.x<f)e.x=r.maxSpeed;if(this.pos.x>t-f)e.x=-r.maxSpeed;if(this.pos.y<f)e.y=r.maxSpeed;if(this.pos.y>i-f)e.y=-r.maxSpeed;if(e.mag()>0)e.normalize(),e.mult(r.maxSpeed),e.sub(this.vel),e.limit(r.maxForce*w);return e}update(t,i,r,e){let o=this.separate(t,e),n=this.wander(e),a=this.edges(i,r,e);o.mult(m),n.mult(E),a.mult(w),this.applyForce(o),this.applyForce(n),this.applyForce(a),this.vel.add(this.acc),this.vel.limit(e.maxSpeed),this.pos.add(this.vel),this.acc.mult(0)}draw(t){t.beginPath(),t.arc(this.pos.x,this.pos.y,q,0,Math.PI*2),t.fillStyle=K,t.fill(),t.strokeStyle="white",t.lineWidth=1,t.stroke()}}var X=`// Solver Compute Shader

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
        // We assigned thread \`row\` to matrix \`row\`.
        // If \`row > k\`, eliminate.
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
        // We need to write to \`coeffs\` array.
        
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
`;class b{device;degree;pointCount;termCount;pipeline;bindGroup;particleBuffer;coeffsBuffer;prevCoeffsBuffer;paramsBuffer;matrixBuffer;isReady;constructor(t,i){this.device=t,this.degree=i,this.isReady=!1,this.termCount=(i+1)*(i+2)/2,this.pointCount=this.termCount-1,this.pipeline=null,this.bindGroup=null,this.particleBuffer=t.createBuffer({size:this.pointCount*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.coeffsBuffer=t.createBuffer({size:this.termCount*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.prevCoeffsBuffer=t.createBuffer({size:this.termCount*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.matrixBuffer=t.createBuffer({size:this.termCount*this.termCount*4,usage:GPUBufferUsage.STORAGE}),this.paramsBuffer=t.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.initPipeline()}async initPipeline(){let t=this.device.createShaderModule({code:X});this.pipeline=await this.device.createComputePipelineAsync({layout:"auto",compute:{module:t,entryPoint:"main",constants:{degree:this.degree,pointCount:this.pointCount,termCount:this.termCount}}}),this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.particleBuffer}},{binding:1,resource:{buffer:this.coeffsBuffer}},{binding:2,resource:{buffer:this.paramsBuffer}},{binding:3,resource:{buffer:this.prevCoeffsBuffer}},{binding:4,resource:{buffer:this.matrixBuffer}}]}),this.isReady=!0}resize(t,i,r){let e=new Float32Array([r,t,i,0]);this.device.queue.writeBuffer(this.paramsBuffer,0,e)}solve(t){if(!this.pipeline||!this.bindGroup)return;let i=new Float32Array(this.pointCount*2);for(let o=0;o<this.pointCount;o++)i[o*2]=t[o].pos.x,i[o*2+1]=t[o].pos.y;this.device.queue.writeBuffer(this.particleBuffer,0,i);let r=this.device.createCommandEncoder(),e=r.beginComputePass();e.setPipeline(this.pipeline),e.setBindGroup(0,this.bindGroup),e.dispatchWorkgroups(1),e.end(),this.device.queue.submit([r.finish()])}getCoeffsBuffer(){return this.coeffsBuffer}dispose(){this.particleBuffer.destroy(),this.coeffsBuffer.destroy(),this.prevCoeffsBuffer.destroy(),this.paramsBuffer.destroy(),this.matrixBuffer.destroy()}}var y=`// src/shaders/curve.wgsl

override degree: u32;

struct Uniforms {
    colPos: vec4<f32>,
    colNeg: vec4<f32>,
    colLine: vec4<f32>,
    
    resolution: vec2<f32>,
    scale: f32,
    _pad: f32, 
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> coeffs: array<f32>;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0,  1.0)
    );
    
    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    return output;
}

@fragment
fn fs_main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
    let w = u.resolution.x;
    let h = u.resolution.y;
    let cx = w * 0.5;
    let cy = h * 0.5;
    
    let pixelX = fragCoord.x;
    let pixelY = fragCoord.y; 
    
    let x = (pixelX - cx) / u.scale;
    let y = (pixelY - cy) / u.scale;
    
    // --- OPTIMIZATION: Pre-calculate Powers ---
    // Max degree supported here is 20 (requires 21 slots). 
    // This removes nested loops from the polynomial loop.
    var x_pows: array<f32, 21>;
    var y_pows: array<f32, 21>;
    
    x_pows[0] = 1.0;
    y_pows[0] = 1.0;
    
    // Calculate powers sequentially (O(D) operations)
    for (var k = 1u; k <= degree; k = k + 1u) {
        x_pows[k] = x_pows[k - 1u] * x;
        y_pows[k] = y_pows[k - 1u] * y;
    }
    
    var val = 0.0;
    var idx = 0u;

    // --- STEP 2: Polynomial Evaluation ---
    // Total Ops: O(D^2) instead of O(D^3)
    for (var i = 0u; i <= degree; i = i + 1u) {
        let d = degree - i;
        for (var j = 0u; j <= d; j = j + 1u) {
            let px = d - j;
            let py = d - px;
            
            // Just one multiplication instead of a loop
            val += coeffs[idx] * x_pows[px] * y_pows[py];
            idx = idx + 1u;
        }
    }
    
    // Anti-Aliasing using Distance Estimation
    let d = abs(val) / (fwidth(val) + 0.00001);
    
    let lineThickness = 1.5;
    let alpha = 1.0 - smoothstep(lineThickness - 1.0, lineThickness, d);
    
    let color = select(u.colNeg, u.colPos, val > 0.0);
    return mix(color, u.colLine, alpha);
}
`;var I=0,A=4,G=8,O=12,$=13,tt=14,it=64;class k{canvas;degree;adapter;device;context;pipeline;uniformBuffer;bindGroup;width;height;scale;uniformData;isReady;constructor(t,i){this.canvas=t,this.degree=i,this.adapter=null,this.device=null,this.context=null,this.pipeline=null,this.uniformBuffer=null,this.bindGroup=null,this.width=t.width,this.height=t.height,this.scale=1,this.uniformData=new Float32Array(it/4),this.setUniformColor(I,B),this.setUniformColor(A,L),this.setUniformColor(G,D),this.isReady=!1}setUniformColor(t,i){this.uniformData.set(i,t)}async init(t){if(!navigator.gpu)return"WebGPU is not supported.";if(t)this.device=t,this.adapter=null;else{if(this.adapter=await navigator.gpu.requestAdapter(),!this.adapter)return"No WebGPU adapter found.";this.device=await this.adapter.requestDevice()}if(this.context=this.canvas.getContext("webgpu"),!this.context)return"Failed to get WebGPU context";let i=navigator.gpu.getPreferredCanvasFormat();return this.context.configure({device:this.device,format:i,alphaMode:"premultiplied"}),this.uniformBuffer=this.device.createBuffer({size:this.uniformData.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),await this.createPipeline(this.degree),this.isReady=!0,null}async createPipeline(t){if(!this.device)return;if(this.degree=t,!y)return;let i=this.device.createShaderModule({label:"Curve Shader",code:y}),r=navigator.gpu.getPreferredCanvasFormat();this.pipeline=this.device.createRenderPipeline({layout:"auto",vertex:{module:i,entryPoint:"vs_main"},fragment:{module:i,entryPoint:"fs_main",targets:[{format:r}],constants:{degree:t}},primitive:{topology:"triangle-strip"}})}resize(t,i,r){this.width=t,this.height=i,this.scale=r,this.uniformData[O]=t,this.uniformData[$]=i,this.uniformData[tt]=r}dispose(){if(this.uniformBuffer)this.uniformBuffer.destroy()}async draw(t){if(!this.isReady||!this.device||!this.pipeline||!this.context||!this.uniformBuffer)return;this.device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData),this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:{buffer:t}}]});let i=this.device.createCommandEncoder(),e={colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]},o=i.beginRenderPass(e);o.setPipeline(this.pipeline),o.setBindGroup(0,this.bindGroup),o.draw(4),o.end(),this.device.queue.submit([i.finish()]);let n=await this.device.popErrorScope();if(n)console.error("WebGPU Validation Error:",n.message),this.isReady=!1}clear(){if(!this.isReady||!this.device||!this.context)return;let t=this.device.createCommandEncoder(),r={colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]};t.beginRenderPass(r).end(),this.device.queue.submit([t.finish()])}}var P=1,C=6;class _{glCanvas;uiCanvas;container;ctx;width;height;particles;solver;renderer;currentDegree;pointCount;params;draggedParticle;needsUpdate;onDegreeChange;onPauseChange;onViewModeChange;adapter;device;lastTime;frameCount;fps;onFpsUpdate;constructor(t,i,r){this.glCanvas=t,this.uiCanvas=i,this.container=r;let e=i.getContext("2d");if(!e)throw Error("Could not get 2D context");this.ctx=e,this.width=0,this.height=0,this.particles=[],this.solver=null,this.renderer=null,this.currentDegree=2,this.pointCount=0,this.params=Q(),this.draggedParticle=null,this.needsUpdate=!0,this.adapter=null,this.device=null,this.onDegreeChange=null,this.onPauseChange=null,this.onViewModeChange=null,this.lastTime=performance.now(),this.frameCount=0,this.fps=0,this.onFpsUpdate=null,this.init()}showError(t){let i=document.createElement("div");if(i.style.position="absolute",i.style.top="50%",i.style.left="50%",i.style.transform="translate(-50%, -50%)",i.style.backgroundColor="rgba(220, 38, 38, 0.9)",i.style.color="white",i.style.padding="20px",i.style.borderRadius="8px",i.style.fontFamily="sans-serif",i.style.zIndex="1000",i.style.textAlign="center",i.innerHTML=`<h3>Initialization Error</h3><p>${t}</p>`,this.container&&"appendChild"in this.container)this.container.appendChild(i);else document.body.appendChild(i);let r="getElementById"in this.container?this.container.getElementById("ui-container"):document.getElementById("ui-container");if(r)r.style.display="none"}async init(){if(!navigator.gpu){this.showError("WebGPU not supported.");return}if(this.adapter=await navigator.gpu.requestAdapter(),!this.adapter){this.showError("No WebGPU adapter found.");return}this.device=await this.adapter.requestDevice(),this.resize(),await this.setDegree(this.currentDegree),this.animate()}resize(){let t=this.container.host,i=t?t.clientWidth:this.container.clientWidth||window.innerWidth,r=t?t.clientHeight:this.container.clientHeight||window.innerHeight,e=window.devicePixelRatio||1;if(this.uiCanvas.width=i*e,this.uiCanvas.height=r*e,this.uiCanvas.style.width=`${i}px`,this.uiCanvas.style.height=`${r}px`,this.ctx.scale(e,e),this.glCanvas.width=i*e,this.glCanvas.height=r*e,this.width=i,this.height=r,this.updatePhysicsParams(),this.solver)this.solver.resize(this.width,this.height,this.params.scale);if(this.renderer)this.renderer.resize(this.glCanvas.width,this.glCanvas.height,this.params.scale*e);this.needsUpdate=!0}updatePhysicsParams(){if(!this.pointCount)return;let t=this.width*this.height/this.pointCount,i=Math.sqrt(t);this.params.minDistance=i*j,this.params.maxSpeed=i*U,this.params.maxForce=this.params.maxSpeed*V,this.params.scale=Math.min(this.width,this.height)/N}async setDegree(t){if(t<P||t>C)return;this.currentDegree=t;let i=(this.currentDegree+1)*(this.currentDegree+2)/2;if(this.pointCount=i-1,this.updatePhysicsParams(),this.spawnParticles(),this.renderer)this.renderer.dispose();if(this.solver)this.solver.dispose();if(!this.device)return;this.solver=new b(this.device,this.currentDegree),this.renderer=new k(this.glCanvas,this.currentDegree);let r=await this.renderer.init(this.device);if(r){this.showError(r);return}if(this.solver.resize(this.width,this.height,this.params.scale),this.renderer.resize(this.glCanvas.width,this.glCanvas.height,this.params.scale*(window.devicePixelRatio||1)),this.needsUpdate=!0,this.onDegreeChange)this.onDegreeChange(this.currentDegree)}spawnParticles(){this.particles=[];let t=this.params.minDistance;for(let i=0;i<this.pointCount;i++){let r=Math.random()*(this.width-t*2)+t,e=Math.random()*(this.height-t*2)+t;this.particles.push(new v(r,e))}this.needsUpdate=!0}togglePause(){if(this.params.isPaused=!this.params.isPaused,this.needsUpdate=!0,this.onPauseChange)this.onPauseChange(this.params.isPaused)}cycleViewMode(){if(this.params.viewMode=(this.params.viewMode+1)%3,this.needsUpdate=!0,this.onViewModeChange)this.onViewModeChange(this.params.viewMode)}handleInputStart(t,i){if(!this.params.isPaused)return!1;if(this.params.viewMode===1)return!1;let r=900;for(let e of this.particles){let o=e.pos.x-t,n=e.pos.y-i;if(o*o+n*n<r)return this.draggedParticle=e,!0}return!1}handleInputMove(t,i){if(!this.draggedParticle)return;if(!this.params.isPaused){this.draggedParticle=null;return}this.draggedParticle.pos.x=t,this.draggedParticle.pos.y=i,this.draggedParticle.vel.set(0,0),this.needsUpdate=!0}handleInputEnd(){this.draggedParticle=null}triggerUpdate(){this.needsUpdate=!0}animate(){let t=performance.now();if(this.frameCount++,t-this.lastTime>=1000){if(this.fps=this.frameCount,this.frameCount=0,this.lastTime=t,this.onFpsUpdate)this.onFpsUpdate(this.fps)}if(!this.params.isPaused||this.needsUpdate){if(!this.params.isPaused)for(let e of this.particles)e.update(this.particles,this.width,this.height,this.params);if(this.ctx.clearRect(0,0,this.width,this.height),this.params.viewMode===0||this.params.viewMode===2)for(let e of this.particles)e.draw(this.ctx);let r=!1;if(this.params.viewMode===0||this.params.viewMode===1){if(this.solver&&this.solver.isReady&&this.renderer){this.solver.solve(this.particles);let e=this.solver.getCoeffsBuffer();if(this.renderer.draw(e),this.renderer.isReady)r=!0}}else if(this.renderer){if(this.renderer.clear(),this.renderer.isReady)r=!0}if(this.params.viewMode===2||r)this.needsUpdate=!1}requestAnimationFrame(()=>this.animate())}}var et=`
    <style>${T}</style>
    <div id="ui-container">
        <div class="row">
            <span>Degree:</span>
            <div class="degree-ctrl">
                <button id="btn-deg-down" title="Arrow Down">-</button>
                <span id="degree-val">2</span>
                <button id="btn-deg-up" title="Arrow Up">+</button>
            </div>
        </div>
        <div class="row">
            <button id="btn-pause" style="flex: 1" title="Space">Pause</button>
            <button id="btn-restart" style="flex: 1" title="R">Restart</button>
            <button id="btn-curve" style="flex: 1" title="C">View: All</button>
            <button id="btn-info" title="F1">
                <!-- Inline SVG for Info Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </button>
        </div>
    </div>
    
    <!-- Info Modal -->
    <div id="info-modal">
        <div class="modal-content">
            <button id="btn-close-modal">&times;</button>
            <h2>Dynamic Polynomials</h2>
            
            <h3>What is this?</h3>
            <p>A visualization of high-degree algebraic curves (<em>f(x,y) = 0</em>).</p>

            <h3>Why the points?</h3>
            <p>Random equations usually produce empty screens. By forcing the curve to pass through these moving points, we guarantee interesting, visible shapes.</p>

            <h3>How to play:</h3>
            <ul>
                <li><strong>Watch</strong> the swarm evolve the shape.</li>
                <li><strong>Pause (Space)</strong> to drag points manually.</li>
                <li><strong>Change Degree</strong> to see complex loops (deg 3+).</li>
            </ul>

            <div class="modal-actions">
                <a href="https://github.com/aviRon012/dynamic-algebraic-curve" target="_blank">
                    <button class="btn-primary" style="display: flex; align-items: center; gap: 8px;">
                        <!-- Inline SVG for GitHub Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                        View Code on GitHub
                    </button>
                </a>
            </div>
        </div>
    </div>

    <!-- FPS Counter -->
    <div id="fps-counter" style="position: absolute; top: 10px; left: 10px; color: #5eead4; font-family: monospace; font-weight: bold; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px; pointer-events: none; z-index: 20;">FPS: --</div>

    <canvas id="glCanvas"></canvas>
    <canvas id="uiCanvas"></canvas>
`;function rt(){let t=document.getElementById("app-container");if(!t)return;t.innerHTML=et;let i=(s)=>document.getElementById(s),r=i("glCanvas"),e=i("uiCanvas");if(!r||!e)return;let o=new _(r,e,t),n=()=>{let s=o.currentDegree,h=i("btn-deg-down"),d=i("btn-deg-up"),p=i("degree-val"),c=i("btn-pause"),S=i("btn-curve");if(p)p.textContent=s.toString();if(h)h.disabled=s<=P;if(d)d.disabled=s>=C;if(c)c.textContent=o.params.isPaused?"Resume":"Pause";let Z=["View: All","View: Curve","View: Points"];if(S)S.textContent=Z[o.params.viewMode]};o.onDegreeChange=n,o.onPauseChange=n,o.onViewModeChange=n,o.onFpsUpdate=(s)=>{let h=i("fps-counter");if(h)h.textContent=`FPS: ${s}`},n(),i("btn-deg-up").onclick=()=>o.setDegree(o.currentDegree+1),i("btn-deg-down").onclick=()=>o.setDegree(o.currentDegree-1),i("btn-restart").onclick=()=>o.spawnParticles(),i("btn-pause").onclick=()=>o.togglePause(),i("btn-curve").onclick=()=>o.cycleViewMode();let a=i("info-modal");i("btn-info").onclick=()=>a.classList.add("visible"),i("btn-close-modal").onclick=()=>a.classList.remove("visible"),a.onclick=(s)=>{if(s.target===a)a.classList.remove("visible")};let g=0,x=null,M=(s,h)=>{let d=e.getBoundingClientRect(),p=s-d.left,c=h-d.top;o.handleInputStart(p,c)},z=(s,h)=>{let d=e.getBoundingClientRect(),p=s-d.left,c=h-d.top+g;o.handleInputMove(p,c)};e.addEventListener("mousedown",(s)=>{g=0,M(s.clientX,s.clientY)}),window.addEventListener("mousemove",(s)=>z(s.clientX,s.clientY)),window.addEventListener("mouseup",()=>o.handleInputEnd()),e.addEventListener("touchstart",(s)=>{s.preventDefault(),g=-60,M(s.touches[0].clientX,s.touches[0].clientY)},{passive:!1}),e.addEventListener("touchmove",(s)=>{s.preventDefault(),z(s.touches[0].clientX,s.touches[0].clientY)},{passive:!1}),e.addEventListener("touchend",()=>o.handleInputEnd());let u=()=>{let s=i("ui-container");if(!s)return;if(s.classList.remove("hidden"),document.body.style.cursor="default",x)clearTimeout(x);x=setTimeout(()=>{if(a.classList.contains("visible")){u();return}s.classList.add("hidden"),document.body.style.cursor="none"},3000)};u(),e.addEventListener("mousemove",u),e.addEventListener("mousedown",u),e.addEventListener("touchstart",u),window.addEventListener("keydown",(s)=>{if(s.key==="F1")s.preventDefault(),a.classList.add("visible");if(s.key==="Escape")a.classList.remove("visible");if(s.key===" ")s.preventDefault(),o.togglePause();if(s.key==="r"||s.key==="R")o.spawnParticles();if(s.key==="c"||s.key==="C")o.cycleViewMode();if(s.key==="ArrowUp")s.preventDefault(),o.setDegree(o.currentDegree+1);if(s.key==="ArrowDown")s.preventDefault(),o.setDegree(o.currentDegree-1);u()}),window.addEventListener("resize",()=>{o.resize()})}rt();

//# debugId=9A3020B84F5A8D7764756E2164756E21
