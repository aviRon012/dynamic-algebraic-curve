import { COLOR_POS, COLOR_NEG, COLOR_LINE } from './Params.ts';
// @ts-ignore
import shaderCode from '../shaders/curve.wgsl';

// Uniform Buffer Offsets (floats)
const OFF_COL_POS = 0;
const OFF_COL_NEG = 4;
const OFF_COL_LINE = 8;
const OFF_WIDTH = 12;
const OFF_HEIGHT = 13;
const OFF_SCALE = 14;
const UNIFORM_SIZE = 16 * 4; // 16 floats * 4 bytes = 64 bytes

export class Renderer {
    canvas: HTMLCanvasElement;
    degree: number;
    adapter: GPUAdapter | null;
    device: GPUDevice | null;
    context: GPUCanvasContext | null;
    pipeline: GPURenderPipeline | null;
    uniformBuffer: GPUBuffer | null;
    bindGroup: GPUBindGroup | null;
    width: number;
    height: number;
    scale: number;
    uniformData: Float32Array;
    isReady: boolean;

    constructor(canvas: HTMLCanvasElement, degree: number) {
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
        
        this.uniformData = new Float32Array(UNIFORM_SIZE / 4);
        
        this.setUniformColor(OFF_COL_POS, COLOR_POS);
        this.setUniformColor(OFF_COL_NEG, COLOR_NEG);
        this.setUniformColor(OFF_COL_LINE, COLOR_LINE);
        
        this.isReady = false;
    }

    setUniformColor(offset: number, colorArray: number[] | Float32Array) {
        this.uniformData.set(colorArray, offset);
    }

    async init(sharedDevice?: GPUDevice): Promise<string | null> {
        if (!navigator.gpu) {
            return "WebGPU is not supported.";
        }

        if (sharedDevice) {
            this.device = sharedDevice;
            this.adapter = null; 
        } else {
            this.adapter = await navigator.gpu.requestAdapter();
            if (!this.adapter) return "No WebGPU adapter found.";
            this.device = await this.adapter.requestDevice();
        }

        this.context = this.canvas.getContext('webgpu') as GPUCanvasContext;
        if (!this.context) return "Failed to get WebGPU context";

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
        return null;
    }

    async createPipeline(degree: number) {
        if (!this.device) return;
        this.degree = degree;
        // @ts-ignore
        if (!shaderCode) return;

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
    }

    resize(width: number, height: number, scale: number) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.uniformData[OFF_WIDTH] = width;
        this.uniformData[OFF_HEIGHT] = height;
        this.uniformData[OFF_SCALE] = scale;
    }

    dispose() {
        if (this.uniformBuffer) this.uniformBuffer.destroy();
    }

    async draw(coeffsBuffer: GPUBuffer) {
        if (!this.isReady || !this.device || !this.pipeline || !this.context || !this.uniformBuffer) return;

        this.device.pushErrorScope('validation');

        try {
            this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData as any);

            this.bindGroup = this.device.createBindGroup({
                layout: this.pipeline!.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: { buffer: this.uniformBuffer! } },
                    { binding: 1, resource: { buffer: coeffsBuffer } }
                ]
            });

            const commandEncoder = this.device.createCommandEncoder();
            const textureView = this.context!.getCurrentTexture().createView();

            const renderPassDescriptor: GPURenderPassDescriptor = {
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
            passEncoder.setPipeline(this.pipeline!);
            passEncoder.setBindGroup(0, this.bindGroup);
            passEncoder.draw(4);
            passEncoder.end();

            this.device.queue.submit([commandEncoder.finish()]);
            
            const error = await this.device.popErrorScope();
            if (error) {
                console.error("WebGPU Validation Error:", error.message);
                this.isReady = false; 
            }
        } catch (e) {
            console.error("Render Error:", e);
            this.isReady = false;
        }
    }

    clear() {
        if (!this.isReady || !this.device || !this.context) return;
        
        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context!.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
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
