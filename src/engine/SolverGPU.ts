// @ts-ignore
import shaderCode from '../shaders/solver.wgsl';
import { Particle } from './Particle.ts';

export class SolverGPU {
    device: GPUDevice;
    degree: number;
    pointCount: number;
    termCount: number;
    
    pipeline: GPUComputePipeline | null;
    bindGroup: GPUBindGroup | null;
    
    particleBuffer: GPUBuffer;
    coeffsBuffer: GPUBuffer;
    prevCoeffsBuffer: GPUBuffer; 
    paramsBuffer: GPUBuffer;
    matrixBuffer: GPUBuffer; // New scratch buffer
    isReady: boolean;
    
    constructor(device: GPUDevice, degree: number) {
        this.device = device;
        this.degree = degree;
        this.isReady = false;
        
        this.termCount = ((degree + 1) * (degree + 2)) / 2;
        this.pointCount = this.termCount - 1;
        
        this.pipeline = null;
        this.bindGroup = null;
        
        // Particles
        this.particleBuffer = device.createBuffer({
            size: this.pointCount * 2 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        
        // Coeffs (Output)
        this.coeffsBuffer = device.createBuffer({
            size: this.termCount * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST, 
        });

        // Prev Coeffs (State)
        this.prevCoeffsBuffer = device.createBuffer({
            size: this.termCount * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, 
        });
        
        // Matrix Scratch Buffer (Row-major flattened)
        // Size: termCount * termCount floats
        // We actually only need pointCount rows, but square is easier.
        this.matrixBuffer = device.createBuffer({
            size: this.termCount * this.termCount * 4,
            usage: GPUBufferUsage.STORAGE,
        });
        
        // Params
        this.paramsBuffer = device.createBuffer({
            size: 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        this.initPipeline();
    }
    
    async initPipeline() {
        const shaderModule = this.device.createShaderModule({
            code: shaderCode
        });
        
        this.pipeline = await this.device.createComputePipelineAsync({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'main',
                constants: {
                    degree: this.degree,
                    pointCount: this.pointCount,
                    termCount: this.termCount
                }
            }
        });
        
        this.bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer } },
                { binding: 1, resource: { buffer: this.coeffsBuffer } },
                { binding: 2, resource: { buffer: this.paramsBuffer } },
                { binding: 3, resource: { buffer: this.prevCoeffsBuffer } },
                { binding: 4, resource: { buffer: this.matrixBuffer } }
            ]
        });
        
        this.isReady = true;
    }
    
    resize(width: number, height: number, scale: number) {
        const data = new Float32Array([scale, width, height, 0.0]);
        this.device.queue.writeBuffer(this.paramsBuffer, 0, data);
    }
    
    solve(particles: Particle[]) {
        if (!this.pipeline || !this.bindGroup) return;
        
        // 1. Upload Particles
        const data = new Float32Array(this.pointCount * 2);
        for(let i=0; i<this.pointCount; i++) {
            data[i*2] = particles[i].pos.x;
            data[i*2+1] = particles[i].pos.y;
        }
        this.device.queue.writeBuffer(this.particleBuffer, 0, data);
        
        // 2. Dispatch Compute
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.dispatchWorkgroups(1);
        pass.end();
        
        this.device.queue.submit([encoder.finish()]);
    }
    
    getCoeffsBuffer() {
        return this.coeffsBuffer;
    }
    
    dispose() {
        this.particleBuffer.destroy();
        this.coeffsBuffer.destroy();
        this.prevCoeffsBuffer.destroy();
        this.paramsBuffer.destroy();
        this.matrixBuffer.destroy();
    }
}
