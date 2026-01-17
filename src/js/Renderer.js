import { COLOR_POS, COLOR_NEG, COLOR_LINE } from './Params.js';
import shaderCode from './shaders/curve.wgsl';

export class Renderer {
    constructor(canvas, degree) {
        this.canvas = canvas;
        this.degree = degree;
        
        this.adapter = null;
        this.device = null;
        this.context = null;
        this.pipeline = null;
        this.uniformBuffer = null;
        this.bindGroup = null;
        
        this.width = canvas.width;
        this.height = canvas.height;
        this.scale = 1;
        
        // Uniform Data: Colors(12) + Res(2) + Scale(1) + Pad(1) + Coeffs(128)
        this.uniformData = new Float32Array(144);
        
        this.setUniformColor(0, COLOR_POS);
        this.setUniformColor(4, COLOR_NEG);
        this.setUniformColor(8, COLOR_LINE);
        
        this.isReady = false;
        // init() call removed - will be called by Simulation
    }

    setUniformColor(offset, colorArray) {
        this.uniformData.set(colorArray, offset);
    }

    async init() {
        if (!navigator.gpu) {
            return "WebGPU is not supported in this browser. Try Chrome, Edge, or Firefox Nightly.";
        }

        this.adapter = await navigator.gpu.requestAdapter();
        if (!this.adapter) {
            return "No WebGPU adapter found. Your hardware might not support WebGPU.";
        }

        this.device = await this.adapter.requestDevice();
        console.log("WebGPU Device acquired:", this.device);

        this.context = this.canvas.getContext('webgpu');
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: presentationFormat,
            alphaMode: 'premultiplied',
        });

        this.uniformBuffer = this.device.createBuffer({
            size: this.uniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        await this.createPipeline(this.degree);
        
        this.isReady = true;
        console.log("Renderer Ready!");
        return null; // No error
    }

    async createPipeline(degree) {
        this.degree = degree;
        console.log("Compiling shader with degree override:", degree);
        if (!shaderCode) console.error("Shader code is empty!");

        const shaderModule = this.device.createShaderModule({
            label: 'Curve Shader',
            code: shaderCode
        });

        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        this.pipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: 'vs_main',
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs_main',
                targets: [{ format: presentationFormat }],
                constants: {
                    degree: degree,
                }
            },
            primitive: {
                topology: 'triangle-strip',
            }
        });

        this.bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.uniformBuffer }
                }
            ]
        });
    }

    resize(width, height, scale) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.uniformData[12] = width;
        this.uniformData[13] = height;
        this.uniformData[14] = scale;
    }

    dispose() {
        if (this.uniformBuffer) this.uniformBuffer.destroy();
    }

    async draw(coeffs) {
        if (!this.isReady || !this.device || !this.pipeline) return;

        if (coeffs) {
            this.uniformData.set(coeffs, 16);
        }

        this.device.pushErrorScope('validation');

        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData);

        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0, g: 0, b: 0, a: 0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.bindGroup);
        passEncoder.draw(4);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
        
        const error = await this.device.popErrorScope();
        if (error) {
            console.error("WebGPU Validation Error:", error.message);
            this.isReady = false; 
        }
    }

    clear() {
        if (!this.isReady || !this.device) return;
        
        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0, g: 0, b: 0, a: 0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }
}
