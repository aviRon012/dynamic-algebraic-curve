// src/js/shaders/curve.wgsl

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
