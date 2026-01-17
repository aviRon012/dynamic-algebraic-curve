// src/shaders/curve.wgsl

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
