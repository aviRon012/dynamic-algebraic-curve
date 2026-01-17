class F{constructor(f,u){this.x=f,this.y=u}set(f,u){return this.x=f,this.y=u,this}setVec(f){return this.x=f.x,this.y=f.y,this}add(f){return this.x+=f.x,this.y+=f.y,this}sub(f){return this.x-=f.x,this.y-=f.y,this}mult(f){return this.x*=f,this.y*=f,this}div(f){if(f!==0)this.x/=f,this.y/=f;return this}magSq(){return this.x*this.x+this.y*this.y}mag(){return Math.sqrt(this.x*this.x+this.y*this.y)}normalize(){let f=this.mag();if(f>0)this.div(f);return this}limit(f){let u=this.magSq();if(u>f*f)this.div(Math.sqrt(u)),this.mult(f);return this}static dist(f,u){let z=f.x-u.x,J=f.y-u.y;return Math.sqrt(z*z+J*J)}static distSq(f,u){let z=f.x-u.x,J=f.y-u.y;return z*z+J*J}static sub(f,u){return new F(f.x-u.x,f.y-u.y)}copy(){return new F(this.x,this.y)}}var A=0.22,S=0.0055,I=0.06,P=2.5,V=6,R=[0.11764705882352941,0.1607843137254902,0.23137254901960785,1],C=[0.058823529411764705,0.09019607843137255,0.16470588235294117,1],w=[0.17647058823529413,0.8313725490196079,0.7490196078431373,1],g="#fbbf24";var t=0.3,l=25,h=80,T=50,y=1.5,D=1,W=2,Q={minDistance:100,maxSpeed:2.5,maxForce:0.15,scale:1,isPaused:!1,viewMode:0};class x{constructor(f,u){this.pos=new F(f,u),this.vel=new F(Math.random()*2-1,Math.random()*2-1),this.acc=new F(0,0),this.wanderTheta=Math.random()*Math.PI*2,this._steer=new F(0,0),this._diff=new F(0,0),this._circleCenter=new F(0,0),this._displacement=new F(0,0)}applyForce(f){this.acc.add(f)}separate(f,u){let z=u.minDistance*u.minDistance;this._steer.set(0,0);let J=0;for(let b of f){let Z=F.distSq(this.pos,b.pos);if(b!==this&&Z<z&&Z>0){let Y=Math.sqrt(Z);this._diff.setVec(this.pos).sub(b.pos),this._diff.normalize(),this._diff.div(Y),this._steer.add(this._diff),J++}}if(J>0)this._steer.div(J),this._steer.normalize(),this._steer.mult(u.maxSpeed),this._steer.sub(this.vel),this._steer.limit(u.maxForce*y);return this._steer}wander(f){this.wanderTheta+=(Math.random()*2-1)*t,this._circleCenter.setVec(this.vel),this._circleCenter.normalize(),this._circleCenter.mult(h),this._displacement.set(0,-1),this._displacement.mult(l);let u=this.wanderTheta,z=this._displacement.x,J=this._displacement.y;this._displacement.x=z*Math.cos(u)-J*Math.sin(u),this._displacement.y=z*Math.sin(u)+J*Math.cos(u);let b=this._circleCenter.add(this._displacement);return b.limit(f.maxForce),b}edges(f,u,z){let J=this._diff;if(J.set(0,0),this.pos.x<T)J.x=z.maxSpeed;if(this.pos.x>f-T)J.x=-z.maxSpeed;if(this.pos.y<T)J.y=z.maxSpeed;if(this.pos.y>u-T)J.y=-z.maxSpeed;if(J.mag()>0)J.normalize(),J.mult(z.maxSpeed),J.sub(this.vel),J.limit(z.maxForce*W);return J}update(f,u,z,J){let b=this.separate(f,J),Z=this.wander(J),Y=this.edges(u,z,J);b.mult(y),Z.mult(D),Y.mult(W),this.applyForce(b),this.applyForce(Z),this.applyForce(Y),this.vel.add(this.acc),this.vel.limit(J.maxSpeed),this.pos.add(this.vel),this.acc.mult(0)}draw(f){f.beginPath(),f.arc(this.pos.x,this.pos.y,V,0,Math.PI*2),f.fillStyle=g,f.fill(),f.strokeStyle="white",f.lineWidth=1,f.stroke()}}class j{constructor(f){this.degree=f,this.terms=this.generateTerms(f),this.termCount=this.terms.length,this.pointCount=this.termCount-1,this.prevCoeffs=null,this.matrix=[];for(let u=0;u<this.pointCount;u++)this.matrix.push(new Float64Array(this.termCount));this.coeffsBuffer=new Float64Array(this.termCount),this.width=1,this.height=1,this.cx=0.5,this.cy=0.5,this.scale=1}resize(f,u,z){this.width=f,this.height=u,this.cx=f/2,this.cy=u/2,this.scale=z}generateTerms(f){let u=[];for(let z=f;z>=0;z--)for(let J=z;J>=0;J--){let b=z-J;u.push({x:J,y:b})}return u}solve(f){if(f.length!==this.pointCount)return null;let u=new Float64Array(this.degree+1),z=new Float64Array(this.degree+1);u[0]=1,z[0]=1;for(let k=0;k<this.pointCount;k++){let U=f[k],L=(U.pos.x-this.cx)/this.scale,H=(U.pos.y-this.cy)/this.scale;for(let X=1;X<=this.degree;X++)u[X]=u[X-1]*L,z[X]=z[X-1]*H;let M=this.matrix[k];for(let X=0;X<this.termCount;X++){let q=this.terms[X];M[X]=u[q.x]*z[q.y]}}let J=this.pointCount,b=this.termCount,Z=0;for(let k=0;k<J;k++){if(b<=Z)break;let U=k,L=Math.abs(this.matrix[k][Z]);for(let B=k+1;B<J;B++){let K=Math.abs(this.matrix[B][Z]);if(K>L)L=K,U=B}let H=0.0000000001,M=Math.max(1,L);if(L<H*M){Z++,k--;continue}let X=this.matrix[k];this.matrix[k]=this.matrix[U],this.matrix[U]=X;let q=this.matrix[k][Z];for(let B=0;B<b;B++)this.matrix[k][B]/=q;for(let B=0;B<J;B++){if(B===k)continue;q=this.matrix[B][Z];for(let K=0;K<b;K++)this.matrix[B][K]-=q*this.matrix[k][K]}Z++}this.coeffsBuffer[b-1]=1;for(let k=J-1;k>=0;k--)this.coeffsBuffer[k]=-this.matrix[k][b-1];let Y=0;for(let k of this.coeffsBuffer)Y+=k*k;Y=Math.sqrt(Y);for(let k=0;k<b;k++)this.coeffsBuffer[k]/=Y;if(this.prevCoeffs){let k=0;for(let U=0;U<b;U++)k+=this.coeffsBuffer[U]*this.prevCoeffs[U];if(k<0)for(let U=0;U<b;U++)this.coeffsBuffer[U]*=-1}if(!this.prevCoeffs)this.prevCoeffs=new Float32Array(b);for(let k=0;k<b;k++)this.prevCoeffs[k]=this.coeffsBuffer[k];return this.prevCoeffs}}var O=`// src/js/shaders/curve.wgsl

// Specialization Constant: Allows the driver to unroll loops
override degree: u32;

struct Uniforms {
    // 16-byte aligned blocks for best compatibility
    colPos: vec4<f32>,
    colNeg: vec4<f32>,
    colLine: vec4<f32>,
    
    resolution: vec2<f32>,
    scale: f32,
    _pad: f32, // Padding to ensure 16-byte alignment for the array following
    
    coeffs: array<vec4<f32>, 32>, // 32 * 4 = 128 floats. 16-byte aligned.
}

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    // Standard full-screen triangle strip/quad positions
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
    
    // WebGPU origin (0,0) is top-left.
    // Solver uses Canvas coordinates (Y increases downwards).
    let pixelX = fragCoord.x;
    let pixelY = fragCoord.y; 
    
    let x = (pixelX - cx) / u.scale;
    let y = (pixelY - cy) / u.scale;
    
    var val = 0.0;
    var idx = 0u;

    // Polynomial Evaluation
    // Iterate exactly matching the JS Solver term generation order:
    // Outer: Total Degree 'd' from MAX down to 0
    // Inner: x power 'px' from 'd' down to 0
    for (var i = 0u; i <= degree; i = i + 1u) {
        let d = degree - i;
        
        for (var j = 0u; j <= d; j = j + 1u) {
            let px = d - j;
            let py = d - px;
            
            // Access packed coefficients
            // array index = idx / 4
            // component index = idx % 4
            let vecIdx = idx / 4u;
            let compIdx = idx % 4u;
            let c = u.coeffs[vecIdx][compIdx];
            
            // Optimization: Only multiply if power > 0
            
            var term = c;
            
            // Manual pow() because WGSL pow(neg, int) is undefined/NaN
            if (px > 0u) {
                var p_res = 1.0;
                for(var k=0u; k<px; k=k+1u) { p_res = p_res * x; }
                term = term * p_res;
            }
            if (py > 0u) {
                var p_res = 1.0;
                for(var k=0u; k<py; k=k+1u) { p_res = p_res * y; }
                term = term * p_res;
            }
            
            val = val + term;
            idx = idx + 1u;
        }
    }
    
    // Anti-Aliasing using Distance Estimation
    // d = |val| / |grad(val)|
    // fwidth(val) approximates the change in val over one pixel.
    let d = abs(val) / (fwidth(val) + 0.00001);
    
    let lineThickness = 1.5;
    let alpha = 1.0 - smoothstep(lineThickness - 1.0, lineThickness, d);
    
    let color = select(u.colNeg, u.colPos, val > 0.0);
    
    return mix(color, u.colLine, alpha);
}
`;class _{constructor(f,u){this.canvas=f,this.degree=u,this.adapter=null,this.device=null,this.context=null,this.pipeline=null,this.uniformBuffer=null,this.bindGroup=null,this.width=f.width,this.height=f.height,this.scale=1,this.uniformData=new Float32Array(144),this.setUniformColor(0,R),this.setUniformColor(4,C),this.setUniformColor(8,w),this.isReady=!1}setUniformColor(f,u){this.uniformData.set(u,f)}async init(){if(!navigator.gpu)return"WebGPU is not supported in this browser. Try Chrome, Edge, or Firefox Nightly.";if(this.adapter=await navigator.gpu.requestAdapter(),!this.adapter)return"No WebGPU adapter found. Your hardware might not support WebGPU.";this.device=await this.adapter.requestDevice(),console.log("WebGPU Device acquired:",this.device),this.context=this.canvas.getContext("webgpu");let f=navigator.gpu.getPreferredCanvasFormat();return this.context.configure({device:this.device,format:f,alphaMode:"premultiplied"}),this.uniformBuffer=this.device.createBuffer({size:this.uniformData.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),await this.createPipeline(this.degree),this.isReady=!0,console.log("Renderer Ready!"),null}async createPipeline(f){if(this.degree=f,console.log("Compiling shader with degree override:",f),!O)console.error("Shader code is empty!");let u=this.device.createShaderModule({label:"Curve Shader",code:O}),z=navigator.gpu.getPreferredCanvasFormat();this.pipeline=this.device.createRenderPipeline({layout:"auto",vertex:{module:u,entryPoint:"vs_main"},fragment:{module:u,entryPoint:"fs_main",targets:[{format:z}],constants:{degree:f}},primitive:{topology:"triangle-strip"}}),this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniformBuffer}}]})}resize(f,u,z){this.width=f,this.height=u,this.scale=z,this.uniformData[12]=f,this.uniformData[13]=u,this.uniformData[14]=z}dispose(){if(this.uniformBuffer)this.uniformBuffer.destroy()}async draw(f){if(!this.isReady||!this.device||!this.pipeline)return;if(f)this.uniformData.set(f,16);this.device.pushErrorScope("validation"),this.device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData);let u=this.device.createCommandEncoder(),J={colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]},b=u.beginRenderPass(J);b.setPipeline(this.pipeline),b.setBindGroup(0,this.bindGroup),b.draw(4),b.end(),this.device.queue.submit([u.finish()]);let Z=await this.device.popErrorScope();if(Z)console.error("WebGPU Validation Error:",Z.message),this.isReady=!1}clear(){if(!this.isReady||!this.device)return;let f=this.device.createCommandEncoder(),z={colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]};f.beginRenderPass(z).end(),this.device.queue.submit([f.finish()])}}var $=1,G=6;class N{constructor(f,u,z){this.glCanvas=f,this.uiCanvas=u,this.container=z,this.ctx=u.getContext("2d"),this.width=0,this.height=0,this.particles=[],this.solver=null,this.renderer=null,this.currentDegree=2,this.pointCount=0,this.needsUpdate=!0,this.onDegreeChange=null,this.onPauseChange=null,this.onCurveVisibilityChange=null,this.init()}showError(f){let u=document.createElement("div");if(u.style.position="absolute",u.style.top="50%",u.style.left="50%",u.style.transform="translate(-50%, -50%)",u.style.backgroundColor="rgba(220, 38, 38, 0.9)",u.style.color="white",u.style.padding="20px",u.style.borderRadius="8px",u.style.fontFamily="sans-serif",u.style.zIndex="1000",u.style.textAlign="center",u.innerHTML=`<h3>Initialization Error</h3><p>${f}</p>`,this.container&&this.container.appendChild)this.container.appendChild(u);else document.body.appendChild(u);let z=this.container.getElementById?this.container.getElementById("ui-container"):document.getElementById("ui-container");if(z)z.style.display="none"}async init(){this.resize(),await this.setDegree(this.currentDegree),this.animate()}resize(){let f=this.container.host?this.container.host.clientWidth:this.container.clientWidth||window.innerWidth,u=this.container.host?this.container.host.clientHeight:this.container.clientHeight||window.innerHeight,z=window.devicePixelRatio||1;if(this.uiCanvas.width=f*z,this.uiCanvas.height=u*z,this.uiCanvas.style.width=`${f}px`,this.uiCanvas.style.height=`${u}px`,this.ctx.scale(z,z),this.glCanvas.width=f*z,this.glCanvas.height=u*z,this.width=f,this.height=u,this.updatePhysicsParams(),this.solver)this.solver.resize(this.width,this.height,Q.scale);if(this.renderer)this.renderer.resize(this.glCanvas.width,this.glCanvas.height,Q.scale*z);this.needsUpdate=!0}updatePhysicsParams(){if(!this.pointCount)return;let f=this.width*this.height/this.pointCount,u=Math.sqrt(f);Q.minDistance=u*A,Q.maxSpeed=u*S,Q.maxForce=Q.maxSpeed*I,Q.scale=Math.min(this.width,this.height)/P}async setDegree(f){if(f<$||f>G)return;this.currentDegree=f;let u=(this.currentDegree+1)*(this.currentDegree+2)/2;if(this.pointCount=u-1,this.renderer)this.renderer.dispose();this.solver=new j(this.currentDegree),this.renderer=new _(this.glCanvas,this.currentDegree);let z=await this.renderer.init();if(z){this.showError(z);return}if(this.updatePhysicsParams(),this.solver.resize(this.width,this.height,Q.scale),this.renderer.resize(this.glCanvas.width,this.glCanvas.height,Q.scale*(window.devicePixelRatio||1)),this.spawnParticles(),this.needsUpdate=!0,this.onDegreeChange)this.onDegreeChange(this.currentDegree)}spawnParticles(){this.particles=[];let f=Q.minDistance;for(let u=0;u<this.pointCount;u++){let z=Math.random()*(this.width-f*2)+f,J=Math.random()*(this.height-f*2)+f;this.particles.push(new x(z,J))}this.needsUpdate=!0}togglePause(){if(Q.isPaused=!Q.isPaused,this.needsUpdate=!0,this.onPauseChange)this.onPauseChange(Q.isPaused)}cycleViewMode(){if(Q.viewMode=(Q.viewMode+1)%3,this.needsUpdate=!0,this.onViewModeChange)this.onViewModeChange(Q.viewMode)}triggerUpdate(){this.needsUpdate=!0}animate(){if(!Q.isPaused||this.needsUpdate){if(!Q.isPaused)for(let z of this.particles)z.update(this.particles,this.width,this.height,Q);if(this.ctx.clearRect(0,0,this.width,this.height),Q.viewMode===0||Q.viewMode===2)for(let z of this.particles)z.draw(this.ctx);let u=!1;if(Q.viewMode===0||Q.viewMode===1){let z=this.solver.solve(this.particles);if(z&&this.renderer){if(this.renderer.draw(z),this.renderer.isReady)u=!0}}else if(this.renderer){if(this.renderer.clear(),this.renderer.isReady)u=!0}if(Q.viewMode===2||u)this.needsUpdate=!1}requestAnimationFrame(()=>this.animate())}}class o extends HTMLElement{constructor(){super();this.attachShadow({mode:"open"}),this.simulation=null,this.resizeObserver=null,this.draggedParticle=null,this.touchOffset=0,this.idleTimer=null}static get observedAttributes(){return["degree","paused","view-mode"]}attributeChangedCallback(f,u,z){if(!this.simulation)return;switch(f){case"degree":let J=parseInt(z);if(!isNaN(J)&&J!==this.simulation.currentDegree)this.simulation.setDegree(J);break;case"paused":let b=z!==null;if(b!==Q.isPaused){if(this.simulation.togglePause(),Q.isPaused!==b)this.simulation.togglePause()}break;case"view-mode":let Z={all:0,curve:1,points:2},Y=Z[z]!==void 0?Z[z]:parseInt(z);if(!isNaN(Y)&&Y!==Q.viewMode)Q.viewMode=Y,this.simulation.triggerUpdate(),this.updateUI();break}}get degree(){return this.simulation?this.simulation.currentDegree:2}set degree(f){this.setAttribute("degree",f)}get paused(){return Q.isPaused}set paused(f){f?this.setAttribute("paused",""):this.removeAttribute("paused")}get viewMode(){return Q.viewMode}set viewMode(f){this.setAttribute("view-mode",f)}connectedCallback(){this.shadowRoot.innerHTML=`
    <style>
    :host {
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
</style>
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

    <canvas id="glCanvas"></canvas>
    <canvas id="uiCanvas"></canvas>
`;let f=this.shadowRoot.getElementById("glCanvas"),u=this.shadowRoot.getElementById("uiCanvas");if(this.simulation=new N(f,u,this.shadowRoot),this.hasAttribute("degree"))this.simulation.setDegree(parseInt(this.getAttribute("degree")));if(this.hasAttribute("paused"))Q.isPaused=!0;if(this.hasAttribute("view-mode")){let z={all:0,curve:1,points:2},J=this.getAttribute("view-mode");Q.viewMode=z[J]!==void 0?z[J]:parseInt(J)}this.simulation.onDegreeChange=(z)=>{this.updateUI()},this.simulation.onPauseChange=(z)=>{if(this.updateUI(),z&&!this.hasAttribute("paused"))this.setAttribute("paused","");if(!z&&this.hasAttribute("paused"))this.removeAttribute("paused")},this.simulation.onViewModeChange=(z)=>this.updateUI(),this.resizeObserver=new ResizeObserver(()=>{if(this.simulation)this.simulation.resize()}),this.resizeObserver.observe(this),this.bindEvents(),this.initIdleTimer(),this.updateUI()}disconnectedCallback(){if(this.resizeObserver)this.resizeObserver.disconnect();window.removeEventListener("keydown",this._handleKeydown)}bindEvents(){let f=(b)=>this.shadowRoot.getElementById(b),u=f("uiCanvas");f("btn-deg-up").onclick=()=>this.simulation.setDegree(this.simulation.currentDegree+1),f("btn-deg-down").onclick=()=>this.simulation.setDegree(this.simulation.currentDegree-1),f("btn-restart").onclick=()=>this.simulation.spawnParticles(),f("btn-pause").onclick=()=>this.simulation.togglePause(),f("btn-curve").onclick=()=>this.simulation.cycleViewMode();let z=f("info-modal");f("btn-info").onclick=()=>z.classList.add("visible"),f("btn-close-modal").onclick=()=>z.classList.remove("visible"),z.onclick=(b)=>{if(b.target===z)z.classList.remove("visible")},u.addEventListener("mousedown",(b)=>{this.touchOffset=0,this.handleDragStart(b.clientX,b.clientY)}),window.addEventListener("mousemove",(b)=>this.handleDragMove(b.clientX,b.clientY)),window.addEventListener("mouseup",()=>this.draggedParticle=null),u.addEventListener("touchstart",(b)=>{b.preventDefault(),this.touchOffset=-60,this.handleDragStart(b.touches[0].clientX,b.touches[0].clientY)},{passive:!1}),u.addEventListener("touchmove",(b)=>{b.preventDefault(),this.handleDragMove(b.touches[0].clientX,b.touches[0].clientY)},{passive:!1}),u.addEventListener("touchend",()=>this.draggedParticle=null);let J=()=>this.resetIdle();u.addEventListener("mousemove",J),u.addEventListener("mousedown",J),u.addEventListener("touchstart",J),this._handleKeydown=(b)=>{if(b.key==="F1")b.preventDefault(),z.classList.add("visible");if(b.key==="Escape")z.classList.remove("visible");if(b.key===" ")b.preventDefault(),this.simulation.togglePause();if(b.key==="r"||b.key==="R")this.simulation.spawnParticles();if(b.key==="c"||b.key==="C")this.simulation.cycleViewMode();if(b.key==="ArrowUp")b.preventDefault(),this.simulation.setDegree(this.simulation.currentDegree+1);if(b.key==="ArrowDown")b.preventDefault(),this.simulation.setDegree(this.simulation.currentDegree-1);J()},window.addEventListener("keydown",this._handleKeydown)}updateUI(){let f=(J)=>this.shadowRoot.getElementById(J),u=this.simulation.currentDegree;f("degree-val").textContent=u,f("btn-deg-down").disabled=u<=$,f("btn-deg-up").disabled=u>=G,f("btn-pause").textContent=Q.isPaused?"Resume":"Pause";let z=["View: All","View: Curve","View: Points"];f("btn-curve").textContent=z[Q.viewMode]}handleDragStart(f,u){if(!Q.isPaused)return;if(Q.viewMode===1)return;let z=this.shadowRoot.getElementById("uiCanvas").getBoundingClientRect(),J=f-z.left,b=u-z.top;for(let Z of this.simulation.particles){let Y=Z.pos.x-J,k=Z.pos.y-b;if(Y*Y+k*k<900){this.draggedParticle=Z;break}}}handleDragMove(f,u){if(!this.draggedParticle)return;if(!Q.isPaused){this.draggedParticle=null;return}let z=this.shadowRoot.getElementById("uiCanvas").getBoundingClientRect(),J=f-z.left,b=u-z.top+this.touchOffset;this.draggedParticle.pos.x=J,this.draggedParticle.pos.y=b,this.draggedParticle.vel.set(0,0),this.simulation.triggerUpdate()}initIdleTimer(){this.resetIdle()}resetIdle(){let f=this.shadowRoot.getElementById("ui-container"),u=this.shadowRoot.getElementById("info-modal");f.classList.remove("hidden"),this.style.cursor="default",clearTimeout(this.idleTimer),this.idleTimer=setTimeout(()=>{if(u.classList.contains("visible")){this.resetIdle();return}f.classList.add("hidden"),this.style.cursor="none"},3000)}}customElements.define("algebraic-curve",o);export{o as AlgebraicCurve};
