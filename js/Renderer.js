import { COLOR_POS, COLOR_NEG, COLOR_LINE } from './Params.js';

const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;

/**
 * Handles WebGL rendering of the implicit curve.
 * Dynamically generates Fragment Shaders based on the curve degree.
 */
export class Renderer {
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {number} degree 
     */
    constructor(gl, degree) {
        this.gl = gl;
        this.degree = degree;
        this.terms = this.generateTerms(degree);
        
        this.programInfo = null;
        this.buffer = null;
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;
        
        this.width = 1;
        this.height = 1;
        this.scale = 1;

        this.init();
    }

    /**
     * Cleans up WebGL resources (buffers, shaders, programs) to prevent memory leaks.
     */
    dispose() {
        const gl = this.gl;
        if (this.buffer) {
            gl.deleteBuffer(this.buffer.position);
        }
        if (this.program) {
            gl.deleteProgram(this.program);
        }
        if (this.vertexShader) {
            gl.deleteShader(this.vertexShader);
        }
        if (this.fragmentShader) {
            gl.deleteShader(this.fragmentShader);
        }
    }

    /**
     * Updates viewport and scale uniform.
     * @param {number} width 
     * @param {number} height 
     * @param {number} scale 
     */
    resize(width, height, scale) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.gl.viewport(0, 0, width, height);
    }

    /**
     * Clears the WebGL canvas (used when curve visibility is toggled off).
     */
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
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

    /**
     * Generates the GLSL Fragment Shader source code.
     * Uses Horner's Method for optimized polynomial evaluation.
     * @returns {string} GLSL source.
     */
    generateFragShader() {
        const termCount = this.terms.length;
        
        // Group terms by x power to implement nested Horner's method
        // P(x, y) = (...(C_n(y)*x + C_{n-1}(y))*x + ...)*x + C_0(y)
        const xGroups = {}; 
        let maxX = 0;

        for (let i = 0; i < termCount; i++) {
            const t = this.terms[i];
            if (!xGroups[t.x]) xGroups[t.x] = [];
            xGroups[t.x].push({ y: t.y, index: i });
            if (t.x > maxX) maxX = t.x;
        }

        let poly = "";

        // Iterate x from highest power to 0
        for (let x = maxX; x >= 0; x--) {
            const group = xGroups[x] || [];
            // Sort by y descending for Horner's in y
            group.sort((a, b) => b.y - a.y);

            let yPoly = "0.0";
            if (group.length > 0) {
                let currentY = group[0].y;
                yPoly = `u_coeffs[${group[0].index}]`;

                for (let i = 1; i < group.length; i++) {
                    const nextTerm = group[i];
                    const diff = currentY - nextTerm.y;
                    
                    for(let k=0; k<diff; k++) yPoly = `(${yPoly}) * y`;
                    
                    yPoly += ` + u_coeffs[${nextTerm.index}]`;
                    currentY = nextTerm.y;
                }
                // Multiply remaining y's (e.g. if last term was y^2)
                for(let k=0; k<currentY; k++) yPoly = `(${yPoly}) * y`;
                
                yPoly = `(${yPoly})`;
            }

            if (x === maxX) {
                poly = yPoly;
            } else {
                poly = `(${poly}) * x + ${yPoly}`;
            }
        }

        return `
            #extension GL_OES_standard_derivatives : enable
            precision highp float;
            uniform vec2 u_resolution;
            uniform float u_scale;
            uniform float u_coeffs[${termCount}];
            uniform vec4 u_colPos;
            uniform vec4 u_colNeg;
            uniform vec4 u_colLine;

            void main() {
                float w = u_resolution.x;
                float h = u_resolution.y;
                float cx = w * 0.5;
                float cy = h * 0.5;
                float scale = u_scale;
                float pixelX = gl_FragCoord.x;
                float pixelY = h - gl_FragCoord.y;
                
                // Normalize to solver space
                float x = (pixelX - cx) / scale;
                float y = (pixelY - cy) / scale;
                
                // Evaluate polynomial (Horner's Method)
                float val = ${poly};
                
                // Determine color
                vec4 color = (val > 0.0) ? u_colPos : u_colNeg;
                
                // Draw AA boundary line using gradient estimation
                float d = abs(val) / (fwidth(val) + 0.00001);
                float lineThickness = 1.5; 
                float alpha = 1.0 - smoothstep(lineThickness - 1.0, lineThickness, d);
                
                gl_FragColor = mix(color, u_colLine, alpha);
            }
        `;
    }

    init() {
        const gl = this.gl;
        gl.getExtension('OES_standard_derivatives');
        
        const fsSource = this.generateFragShader();
        
        this.vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        this.fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
        
        if (!this.vertexShader || !this.fragmentShader) return;

        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Shader Link Error: ' + gl.getProgramInfoLog(this.program));
            return;
        }

        this.programInfo = {
            program: this.program,
            attribLocations: { vertexPosition: gl.getAttribLocation(this.program, 'aVertexPosition') },
            uniformLocations: {
                resolution: gl.getUniformLocation(this.program, 'u_resolution'),
                scale: gl.getUniformLocation(this.program, 'u_scale'),
                coeffs: gl.getUniformLocation(this.program, 'u_coeffs'),
                colPos: gl.getUniformLocation(this.program, 'u_colPos'),
                colNeg: gl.getUniformLocation(this.program, 'u_colNeg'),
                colLine: gl.getUniformLocation(this.program, 'u_colLine'),
            },
        };
        this.buffer = this.initBuffers();
    }

    loadShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader Compile Error: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    initBuffers() {
        const gl = this.gl;
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Full screen quad
        const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return { position: positionBuffer };
    }

    /**
     * Draws the full-screen quad with the computed curve.
     * @param {Float32Array} coeffs - The polynomial coefficients.
     */
    draw(coeffs) {
        if (!coeffs) return;
        const gl = this.gl;

        gl.useProgram(this.programInfo.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
        gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

        gl.uniform2f(this.programInfo.uniformLocations.resolution, this.width, this.height);
        gl.uniform1f(this.programInfo.uniformLocations.scale, this.scale);
        gl.uniform1fv(this.programInfo.uniformLocations.coeffs, coeffs);
        
        gl.uniform4fv(this.programInfo.uniformLocations.colPos, COLOR_POS);
        gl.uniform4fv(this.programInfo.uniformLocations.colNeg, COLOR_NEG);
        gl.uniform4fv(this.programInfo.uniformLocations.colLine, COLOR_LINE);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}