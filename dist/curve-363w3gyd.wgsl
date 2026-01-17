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
    
    coeffs: array<f32, 128>, // Fixed max size (supports up to ~Degree 13)
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
    // We want Cartesian origin (0,0) at center, Y up.
    let pixelX = fragCoord.x;
    let pixelY = h - fragCoord.y; 
    
    let x = (pixelX - cx) / u.scale;
    let y = (pixelY - cy) / u.scale;
    
    var val = 0.0;
    var idx = 0u;

    // Polynomial Evaluation
    // Iterate exactly matching the JS Solver term generation order:
    // Outer: Total Degree 'd' from MAX down to 0
    // Inner: x power 'px' from 'd' down to 0
    for (var d = degree; d + 1u > 0u; d = d - 1u) {
        for (var px = d; px + 1u > 0u; px = px - 1u) {
            let py = d - px;
            let c = u.coeffs[idx];
            
            // Optimization: Only multiply if power > 0
            // pow() is expensive, but for small integers simple multiplication might be better.
            // However, branching can be bad too.
            // Using built-in pow(f32, f32) is safe and hardware accelerated.
            
            var term = c;
            if (px > 0u) { term = term * pow(x, f32(px)); }
            if (py > 0u) { term = term * pow(y, f32(py)); }
            
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
