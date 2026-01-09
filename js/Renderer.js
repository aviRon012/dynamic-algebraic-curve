import { COLOR_POS, COLOR_NEG, COLOR_LINE } from './Params.js';

const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;

export class Renderer {
    constructor(gl, degree) {
        this.gl = gl;
        this.degree = degree;
        this.terms = this.generateTerms(degree);
        this.programInfo = null;
        this.buffer = null;
        
        this.width = 1;
        this.height = 1;
        this.scale = 1;

        this.init();
    }

    resize(width, height, scale) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.gl.viewport(0, 0, width, height);
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

    generateFragShader() {
        const termCount = this.terms.length;
        let poly = "";
        for (let i = 0; i < termCount; i++) {
            let t = this.terms[i];
            let termStr = `u_coeffs[${i}]`;
            for(let k=0; k<t.x; k++) termStr += "*x";
            for(let k=0; k<t.y; k++) termStr += "*y";
            if (i > 0) poly += " + ";
            poly += termStr;
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
                float x = (pixelX - cx) / scale;
                float y = (pixelY - cy) / scale;
                float val = ${poly};
                vec4 color = (val > 0.0) ? u_colPos : u_colNeg;
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
        const shaderProgram = this.initShaderProgram(vsSource, fsSource);
        this.programInfo = {
            program: shaderProgram,
            attribLocations: { vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition') },
            uniformLocations: {
                resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
                scale: gl.getUniformLocation(shaderProgram, 'u_scale'),
                coeffs: gl.getUniformLocation(shaderProgram, 'u_coeffs'),
                colPos: gl.getUniformLocation(shaderProgram, 'u_colPos'),
                colNeg: gl.getUniformLocation(shaderProgram, 'u_colNeg'),
                colLine: gl.getUniformLocation(shaderProgram, 'u_colLine'),
            },
        };
        this.buffer = this.initBuffers();
    }

    initShaderProgram(vs, fs) {
        const gl = this.gl;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vs);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fs);
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) return null;
        return shaderProgram;
    }

    loadShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    initBuffers() {
        const gl = this.gl;
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return { position: positionBuffer };
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

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
