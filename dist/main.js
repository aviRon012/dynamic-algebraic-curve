var J=`body {
    margin: 0;
    overflow: hidden;
    background-color: #0f172a;
    font-family: sans-serif;
}

#app-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
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
`;class a{x;y;constructor(o,r){this.x=o,this.y=r}set(o,r){return this.x=o,this.y=r,this}setVec(o){return this.x=o.x,this.y=o.y,this}add(o){return this.x+=o.x,this.y+=o.y,this}sub(o){return this.x-=o.x,this.y-=o.y,this}mult(o){return this.x*=o,this.y*=o,this}div(o){if(o!==0)this.x/=o,this.y/=o;return this}magSq(){return this.x*this.x+this.y*this.y}mag(){return Math.sqrt(this.x*this.x+this.y*this.y)}normalize(){let o=this.mag();if(o>0)this.div(o);return this}limit(o){let r=this.magSq();if(r>o*o)this.div(Math.sqrt(r)),this.mult(o);return this}static dist(o,r){let l=o.x-r.x,i=o.y-r.y;return Math.sqrt(l*l+i*i)}static distSq(o,r){let l=o.x-r.x,i=o.y-r.y;return l*l+i*i}static sub(o,r){return new a(o.x-r.x,o.y-r.y)}}var M=0.22,Q=0.0055,Z=0.06,Y=2.5,K=6,X=[0.11764705882352941,0.1607843137254902,0.23137254901960785,1],L=[0.058823529411764705,0.09019607843137255,0.16470588235294117,1],S=[0.17647058823529413,0.8313725490196079,0.7490196078431373,1],e="#fbbf24";var U=0.3,W=25,H=80,y=50,h=1.5,P=1,m=2;function F(){return{minDistance:100,maxSpeed:2.5,maxForce:0.15,scale:1,isPaused:!1,viewMode:0}}class g{pos;vel;acc;wanderTheta;_steer;_diff;_circleCenter;_displacement;constructor(o,r){this.pos=new a(o,r),this.vel=new a(Math.random()*2-1,Math.random()*2-1),this.acc=new a(0,0),this.wanderTheta=Math.random()*Math.PI*2,this._steer=new a(0,0),this._diff=new a(0,0),this._circleCenter=new a(0,0),this._displacement=new a(0,0)}applyForce(o){this.acc.add(o)}separate(o,r){let l=r.minDistance*r.minDistance;this._steer.set(0,0);let i=0;for(let t of o){let f=a.distSq(this.pos,t.pos);if(t!==this&&f<l&&f>0){let u=Math.sqrt(f);this._diff.setVec(this.pos).sub(t.pos),this._diff.normalize(),this._diff.div(u),this._steer.add(this._diff),i++}}if(i>0)this._steer.div(i),this._steer.normalize(),this._steer.mult(r.maxSpeed),this._steer.sub(this.vel),this._steer.limit(r.maxForce*h);return this._steer}wander(o){this.wanderTheta+=(Math.random()*2-1)*U,this._circleCenter.setVec(this.vel),this._circleCenter.normalize(),this._circleCenter.mult(H),this._displacement.set(0,-1),this._displacement.mult(W);let r=this.wanderTheta,l=this._displacement.x,i=this._displacement.y;this._displacement.x=l*Math.cos(r)-i*Math.sin(r),this._displacement.y=l*Math.sin(r)+i*Math.cos(r);let t=this._circleCenter.add(this._displacement);return t.limit(o.maxForce),t}edges(o,r,l){let i=this._diff;if(i.set(0,0),this.pos.x<y)i.x=l.maxSpeed;if(this.pos.x>o-y)i.x=-l.maxSpeed;if(this.pos.y<y)i.y=l.maxSpeed;if(this.pos.y>r-y)i.y=-l.maxSpeed;if(i.mag()>0)i.normalize(),i.mult(l.maxSpeed),i.sub(this.vel),i.limit(l.maxForce*m);return i}update(o,r,l,i){let t=this.separate(o,i),f=this.wander(i),u=this.edges(r,l,i);t.mult(h),f.mult(P),u.mult(m),this.applyForce(t),this.applyForce(f),this.applyForce(u),this.vel.add(this.acc),this.vel.limit(i.maxSpeed),this.pos.add(this.vel),this.acc.mult(0)}draw(o){o.beginPath(),o.arc(this.pos.x,this.pos.y,K,0,Math.PI*2),o.fillStyle=e,o.shadowColor=e,o.shadowBlur=10,o.fill(),o.shadowBlur=0,o.strokeStyle="white",o.lineWidth=1,o.stroke()}}var C=`// Solver Compute Shader

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
`;class _{device;degree;pointCount;termCount;pipeline;bindGroup;particleBuffer;coeffsBuffer;prevCoeffsBuffer;paramsBuffer;matrixBuffer;isReady;constructor(o,r){this.device=o,this.degree=r,this.isReady=!1,this.termCount=(r+1)*(r+2)/2,this.pointCount=this.termCount-1,this.pipeline=null,this.bindGroup=null,this.particleBuffer=o.createBuffer({size:this.pointCount*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.coeffsBuffer=o.createBuffer({size:this.termCount*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.prevCoeffsBuffer=o.createBuffer({size:this.termCount*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.matrixBuffer=o.createBuffer({size:this.termCount*this.termCount*4,usage:GPUBufferUsage.STORAGE}),this.paramsBuffer=o.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.initPipeline()}async initPipeline(){let o=this.device.createShaderModule({code:C});this.pipeline=await this.device.createComputePipelineAsync({layout:"auto",compute:{module:o,entryPoint:"main",constants:{degree:this.degree,pointCount:this.pointCount,termCount:this.termCount}}}),this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.particleBuffer}},{binding:1,resource:{buffer:this.coeffsBuffer}},{binding:2,resource:{buffer:this.paramsBuffer}},{binding:3,resource:{buffer:this.prevCoeffsBuffer}},{binding:4,resource:{buffer:this.matrixBuffer}}]}),this.isReady=!0}resize(o,r,l){let i=new Float32Array([l,o,r,0]);this.device.queue.writeBuffer(this.paramsBuffer,0,i)}solve(o){if(!this.pipeline||!this.bindGroup)return;let r=new Float32Array(this.pointCount*2);for(let t=0;t<this.pointCount;t++)r[t*2]=o[t].pos.x,r[t*2+1]=o[t].pos.y;this.device.queue.writeBuffer(this.particleBuffer,0,r);let l=this.device.createCommandEncoder(),i=l.beginComputePass();i.setPipeline(this.pipeline),i.setBindGroup(0,this.bindGroup),i.dispatchWorkgroups(1),i.end(),this.device.queue.submit([l.finish()])}getCoeffsBuffer(){return this.coeffsBuffer}dispose(){this.particleBuffer.destroy(),this.coeffsBuffer.destroy(),this.prevCoeffsBuffer.destroy(),this.paramsBuffer.destroy(),this.matrixBuffer.destroy()}}var j=`// src/shaders/curve.wgsl

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
`;var I=0,R=4,E=8,D=12,oo=13,ro=14,io=64;class z{canvas;degree;adapter;device;context;pipeline;uniformBuffer;bindGroup;width;height;scale;uniformData;isReady;constructor(o,r){this.canvas=o,this.degree=r,this.adapter=null,this.device=null,this.context=null,this.pipeline=null,this.uniformBuffer=null,this.bindGroup=null,this.width=o.width,this.height=o.height,this.scale=1,this.uniformData=new Float32Array(io/4),this.setUniformColor(I,X),this.setUniformColor(R,L),this.setUniformColor(E,S),this.isReady=!1}setUniformColor(o,r){this.uniformData.set(r,o)}async init(o){if(!navigator.gpu)return"WebGPU is not supported.";if(o)this.device=o,this.adapter=null;else{if(this.adapter=await navigator.gpu.requestAdapter(),!this.adapter)return"No WebGPU adapter found.";this.device=await this.adapter.requestDevice()}if(this.context=this.canvas.getContext("webgpu"),!this.context)return"Failed to get WebGPU context";let r=navigator.gpu.getPreferredCanvasFormat();return this.context.configure({device:this.device,format:r,alphaMode:"premultiplied"}),this.uniformBuffer=this.device.createBuffer({size:this.uniformData.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),await this.createPipeline(this.degree),this.isReady=!0,null}async createPipeline(o){if(!this.device)return;if(this.degree=o,!j)return;let r=this.device.createShaderModule({label:"Curve Shader",code:j}),l=navigator.gpu.getPreferredCanvasFormat();this.pipeline=this.device.createRenderPipeline({layout:"auto",vertex:{module:r,entryPoint:"vs_main"},fragment:{module:r,entryPoint:"fs_main",targets:[{format:l}],constants:{degree:o}},primitive:{topology:"triangle-strip"}})}resize(o,r,l){this.width=o,this.height=r,this.scale=l,this.uniformData[D]=o,this.uniformData[oo]=r,this.uniformData[ro]=l}dispose(){if(this.uniformBuffer)this.uniformBuffer.destroy()}async draw(o){if(!this.isReady||!this.device||!this.pipeline||!this.context||!this.uniformBuffer)return;this.device.pushErrorScope("validation");try{this.device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData),this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:{buffer:o}}]});let r=this.device.createCommandEncoder(),i={colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]},t=r.beginRenderPass(i);t.setPipeline(this.pipeline),t.setBindGroup(0,this.bindGroup),t.draw(4),t.end(),this.device.queue.submit([r.finish()]);let f=await this.device.popErrorScope();if(f)console.error("WebGPU Validation Error:",f.message),this.isReady=!1}catch(r){console.error("Render Error:",r),this.isReady=!1}}clear(){if(!this.isReady||!this.device||!this.context)return;let o=this.device.createCommandEncoder(),l={colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]};o.beginRenderPass(l).end(),this.device.queue.submit([o.finish()])}}var V=1,N=6;class q{glCanvas;uiCanvas;container;ctx;width;height;particles;solver;renderer;currentDegree;pointCount;params;draggedParticle;needsUpdate;onDegreeChange;onPauseChange;onViewModeChange;adapter;device;lastTime;frameCount;fps;onFpsUpdate;isChangingDegree;isLandscape;constructor(o,r,l){this.params=F(),this.draggedParticle=null,this.needsUpdate=!0,this.isChangingDegree=!1,this.isLandscape=window.innerWidth>window.innerHeight,this.adapter=null}resize(){let o=this.container.clientWidth||window.innerWidth,r=this.container.clientHeight||window.innerHeight,l=o>r,i=l!==this.isLandscape;this.isLandscape=l;let t=window.devicePixelRatio||1;if(this.uiCanvas.width=o*t,this.height=r,this.updatePhysicsParams(),i)this.setDegree(this.currentDegree);else{if(this.solver)this.solver.resize(this.width,this.height,this.params.scale);if(this.renderer)this.renderer.resize(this.glCanvas.width,this.glCanvas.height,this.params.scale*t)}this.needsUpdate=!0}updatePhysicsParams(){if(!this.pointCount)return;let o=this.width*this.height/this.pointCount,r=Math.sqrt(o);this.params.minDistance=r*M,this.params.maxSpeed=r*Q,this.params.maxForce=this.params.maxSpeed*Z,this.params.scale=Math.min(this.width,this.height)/Y}async setDegree(o){if(this.isChangingDegree)return;if(o<V||o>N)return;this.isChangingDegree=!0;let l=(o+1)*(o+2)/2-1;if(!this.device){this.isChangingDegree=!1;return}let i=new _(this.device,o),t=new z(this.glCanvas,o),f=await t.init(this.device);if(f){this.showError(f),this.isChangingDegree=!1;return}i.resize(this.width,this.height,this.params.scale),t.resize(this.glCanvas.width,this.glCanvas.height,this.params.scale*(window.devicePixelRatio||1));let u=[],c=this.params.minDistance;for(let b=0;b<l;b++){let p=Math.random()*(this.width-c*2)+c,T=Math.random()*(this.height-c*2)+c;u.push(new g(p,T))}while(!i.isReady)await new Promise((b)=>setTimeout(b,10));i.solve(u);let d=this.renderer,w=this.solver;if(this.currentDegree=o,this.pointCount=l,this.solver=i,this.renderer=t,this.particles=u,this.updatePhysicsParams(),this.device)await this.device.queue.onSubmittedWorkDone();if(d)d.dispose();if(w)w.dispose();if(this.needsUpdate=!0,this.onDegreeChange)this.onDegreeChange(this.currentDegree);this.isChangingDegree=!1}spawnParticles(){this.particles=[];let o=this.params.minDistance;for(let r=0;r<this.pointCount;r++){let l=Math.random()*(this.width-o*2)+o,i=Math.random()*(this.height-o*2)+o;this.particles.push(new g(l,i))}this.needsUpdate=!0}togglePause(){if(this.params.isPaused=!this.params.isPaused,this.needsUpdate=!0,this.onPauseChange)this.onPauseChange(this.params.isPaused)}cycleViewMode(){if(this.params.viewMode=(this.params.viewMode+1)%3,this.needsUpdate=!0,this.onViewModeChange)this.onViewModeChange(this.params.viewMode)}handleInputStart(o,r){if(!this.params.isPaused)return!1;if(this.params.viewMode===1)return!1;let l=900;for(let i of this.particles){let t=i.pos.x-o,f=i.pos.y-r;if(t*t+f*f<l)return this.draggedParticle=i,!0}return!1}handleInputMove(o,r){if(!this.draggedParticle)return;if(!this.params.isPaused){this.draggedParticle=null;return}this.draggedParticle.pos.x=o,this.draggedParticle.pos.y=r,this.draggedParticle.vel.set(0,0),this.needsUpdate=!0}handleInputEnd(){this.draggedParticle=null}triggerUpdate(){this.needsUpdate=!0}animate(){let o=performance.now();if(this.frameCount++,o-this.lastTime>=1000){if(this.fps=this.frameCount,this.frameCount=0,this.lastTime=o,this.onFpsUpdate)this.onFpsUpdate(this.fps)}if(!this.params.isPaused||this.needsUpdate){if(!this.params.isPaused)for(let i of this.particles)i.update(this.particles,this.width,this.height,this.params);if(this.ctx.clearRect(0,0,this.width,this.height),this.params.viewMode===0||this.params.viewMode===2)for(let i of this.particles)i.draw(this.ctx);let l=!1;if(this.params.viewMode===0||this.params.viewMode===1){if(this.solver&&this.solver.isReady&&this.renderer){this.solver.solve(this.particles);let i=this.solver.getCoeffsBuffer();if(this.renderer.draw(i),this.renderer.isReady)l=!0}}else if(this.renderer){if(this.renderer.clear(),this.renderer.isReady)l=!0}if(this.params.viewMode===2||l)this.needsUpdate=!1}requestAnimationFrame(()=>this.animate())}}var to=`
    <style>${J}</style>
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
`;function lo(){let o=document.getElementById("app-container");if(!o)return;o.innerHTML=to;let r=(n)=>document.getElementById(n),l=r("glCanvas"),i=r("uiCanvas");if(!l||!i)return;let t=new q(l,i,o),f=()=>{let n=t.currentDegree,x=r("btn-deg-down"),s=r("btn-deg-up"),k=r("degree-val"),v=r("btn-pause"),B=r("btn-curve");if(k)k.textContent=n.toString();if(x)x.disabled=n<=V;if(s)s.disabled=n>=N;if(v)v.textContent=t.params.isPaused?"Resume":"Pause";let A=["View: All","View: Curve","View: Points"];if(B)B.textContent=A[t.params.viewMode]};t.onDegreeChange=f,t.onPauseChange=f,t.onViewModeChange=f,t.onFpsUpdate=(n)=>{let x=r("fps-counter");if(x)x.textContent=`FPS: ${n}`},f(),r("btn-deg-up").onclick=()=>t.setDegree(t.currentDegree+1),r("btn-deg-down").onclick=()=>t.setDegree(t.currentDegree-1),r("btn-restart").onclick=()=>t.spawnParticles(),r("btn-pause").onclick=()=>t.togglePause(),r("btn-curve").onclick=()=>t.cycleViewMode();let u=r("info-modal");r("btn-info").onclick=()=>u.classList.add("visible"),r("btn-close-modal").onclick=()=>u.classList.remove("visible"),u.onclick=(n)=>{if(n.target===u)u.classList.remove("visible")};let c=0,d=null,w=(n,x)=>{let s=i.getBoundingClientRect(),k=n-s.left,v=x-s.top;t.handleInputStart(k,v)},b=(n,x)=>{let s=i.getBoundingClientRect(),k=n-s.left,v=x-s.top+c;t.handleInputMove(k,v)};i.addEventListener("mousedown",(n)=>{c=0,w(n.clientX,n.clientY)}),window.addEventListener("mousemove",(n)=>b(n.clientX,n.clientY)),window.addEventListener("mouseup",()=>t.handleInputEnd()),i.addEventListener("touchstart",(n)=>{n.preventDefault(),c=-60,w(n.touches[0].clientX,n.touches[0].clientY)},{passive:!1}),i.addEventListener("touchmove",(n)=>{n.preventDefault(),b(n.touches[0].clientX,n.touches[0].clientY)},{passive:!1}),i.addEventListener("touchend",()=>t.handleInputEnd());let p=()=>{let n=r("ui-container");if(!n)return;if(n.classList.remove("hidden"),document.body.style.cursor="default",d)clearTimeout(d);d=setTimeout(()=>{if(u.classList.contains("visible")){p();return}n.classList.add("hidden"),document.body.style.cursor="none"},3000)};p(),i.addEventListener("mousemove",p),i.addEventListener("mousedown",p),i.addEventListener("touchstart",p),window.addEventListener("keydown",(n)=>{if(n.key==="F1")n.preventDefault(),u.classList.add("visible");if(n.key==="Escape")u.classList.remove("visible");if(n.key===" ")n.preventDefault(),t.togglePause();if(n.key==="r"||n.key==="R")t.spawnParticles();if(n.key==="c"||n.key==="C")t.cycleViewMode();if(n.key==="ArrowUp")n.preventDefault(),t.setDegree(t.currentDegree+1);if(n.key==="ArrowDown")n.preventDefault(),t.setDegree(t.currentDegree-1);p()}),new ResizeObserver(()=>{t.resize(),p()}).observe(o)}lo();

//# debugId=0F410482D6F0264E64756E2164756E21
