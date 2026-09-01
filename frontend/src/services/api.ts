import { HardwareProfile, PresetModel, CompilationResult, LayerData, ArenaBlock } from '../types';

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:8000/api';

export const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'ESP32-S3',
    name: 'ESP32-S3',
    sram_kb: 512,
    flash_mb: 8,
    clock_mhz: 240,
    arch: 'Xtensa Dual-Core LX7 + Vector',
    simd: 'Xtensa PIE (8-bit SIMD)',
  },
  {
    id: 'STM32H7',
    name: 'STM32H7',
    sram_kb: 1024,
    flash_mb: 2,
    clock_mhz: 480,
    arch: 'ARM Cortex-M7',
    simd: 'ARM CMSIS-NN __SMLAD (Dual 16-bit MAC)',
  },
  {
    id: 'RP2040',
    name: 'RP2040',
    sram_kb: 264,
    flash_mb: 2,
    clock_mhz: 133,
    arch: 'Dual ARM Cortex-M0+',
    simd: '32-bit software unrolled',
  },
  {
    id: 'nRF52840',
    name: 'nRF52840',
    sram_kb: 256,
    flash_mb: 1,
    clock_mhz: 64,
    arch: 'ARM Cortex-M4F',
    simd: 'ARMv7E-M DSP Instructions',
  },
  {
    id: 'Teensy41',
    name: 'Teensy 4.1',
    sram_kb: 1024,
    flash_mb: 8,
    clock_mhz: 600,
    arch: 'ARM Cortex-M7 @ 600MHz',
    simd: 'ARM DWT + CMSIS-NN 4-way SIMD',
  },
];

export const PRESET_MODELS: PresetModel[] = [
  {
    id: 'kws',
    name: 'Audio Keyword Spotter',
    domain: 'Voice Wake Word',
    architecture: '1D Depthwise-Separable CNN',
    dataset: 'Google Speech Commands v2',
    description: 'Classifies 12 wake words from 49x10 MFCC audio spectrograms.',
    input_shape: '1x49x10',
    input_type: '16kHz Audio Spectrogram',
  },
  {
    id: 'vision',
    name: 'MicroVision Person Detector',
    domain: 'Edge Computer Vision',
    architecture: 'MobileNet-Tiny (0.25x)',
    dataset: 'Visual Wake Words (VWW)',
    description: 'Detects person presence on 48x48 grayscale camera frames.',
    input_shape: '1x48x48x1',
    input_type: 'Grayscale Image Frame',
  },
  {
    id: 'anomaly',
    name: 'Motor Vibration Autoencoder',
    domain: 'Industrial Anomaly Detection',
    architecture: '5-Layer Deep Autoencoder',
    dataset: 'NASA Bearing IMS Dataset',
    description: 'Reconstructs 128-FFT vibration spectra for anomaly scoring.',
    input_shape: '1x128',
    input_type: 'Accelerometer FFT Power Spectrum',
  },
];

export async function fetchHardware(): Promise<HardwareProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/hardware`);
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();
    return Object.entries(data).map(([id, val]: [string, any]) => ({
      id,
      name: id,
      sram_kb: val.sram_kb,
      flash_mb: val.flash_mb,
      clock_mhz: val.clock_mhz,
      arch: val.arch,
      simd: val.simd || 'SIMD',
    }));
  } catch {
    return HARDWARE_PROFILES;
  }
}

function parseCompilationResponse(data: any, hardwareId: string, mixedPrecision: boolean = false): CompilationResult {
  const layers: LayerData[] = (data.graph?.layers || []).map((l: any, idx: number) => ({
    layer_id: l.name || l.layer_id || `layer_${idx}`,
    op_type: l.op_type,
    in_shape: l.input_shape ? l.input_shape.join('x') : '-',
    out_shape: l.output_shape ? l.output_shape.join('x') : '-',
    macs: l.macs || 0,
    flash_bytes: l.weight_bytes || 0,
    sram_bytes: l.output_bytes || 0,
    scale_factor: l.scale || 0.00781,
    zero_point: l.zero_point || 0,
    sram_offset_hex: l.sram_offset !== undefined ? `0x${(0x20000000 + l.sram_offset).toString(16).toUpperCase()}` : '0x20000000',
    lifetime: [l.lifetime_start || 0, l.lifetime_end || 1],
    bitwidth: 8,
  }));

  const arena_blocks: ArenaBlock[] = (data.memory_timeline || []).map((t: any) => {
    const firstBlock = t.blocks && t.blocks[0];
    return {
      layer_id: t.layer_id || 'tensor',
      name: firstBlock ? firstBlock.tensor_name : 'Activation Buffer',
      start_bytes: firstBlock ? firstBlock.start_offset : 0,
      end_bytes: firstBlock ? firstBlock.end_offset : t.active_sram_bytes || 0,
      size_bytes: firstBlock ? firstBlock.size_bytes : t.active_sram_bytes || 0,
      hex_address: firstBlock ? firstBlock.hex_address : `0x${(0x20000000).toString(16).toUpperCase()}`,
      lifetime: firstBlock ? firstBlock.lifetime_window : [t.layer_idx || 0, (t.layer_idx || 0) + 1],
      color: '#106BA3',
    };
  });

  return {
    model_name: data.model_name || 'CompiledModel',
    target_hardware: hardwareId,
    fits_hardware: data.fits_hardware,
    zero_malloc_verified: data.zero_malloc_verified,
    quantization_bits: 8,
    mixed_precision: mixedPrecision,
    baseline_fp32: data.baseline_fp32,
    optimized_int8: data.optimized_int8,
    layers,
    arena_blocks,
    c_header_code: data.c_header_code || data.code,
    recommendations: data.agent_report?.recommendations || data.recommendations || [],
    bottlenecks: data.agent_report?.bottlenecks || data.bottlenecks || [],
  };
}

export async function compileModel(
  modelId: string,
  hardwareId: string,
  mixedPrecision: boolean = false
): Promise<CompilationResult> {
  const res = await fetch(`${API_BASE}/presets/${modelId}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_hardware: hardwareId,
      bits: 8,
      symmetric: true,
      mixed_precision: mixedPrecision,
    }),
  });
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Compilation failed with status ${res.status}`);
  }
  
  const data = await res.json();
  return parseCompilationResponse(data, hardwareId, mixedPrecision);
}

export async function uploadAndCompileModel(
  file: File,
  hardwareId: string
): Promise<CompilationResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_hardware', hardwareId);
  formData.append('bits', '8');

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  return parseCompilationResponse(data, hardwareId, false);
}

export async function chatWithAgent(
  message: string,
  hardwareId: string,
  modelName: string,
  context?: any
): Promise<string> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      target_hardware: hardwareId,
      model_name: modelName,
      context,
    }),
  });

  if (!res.ok) {
    throw new Error('Agent reasoning failed');
  }

  const data = await res.json();
  return data.reply || data.response || 'Agent analysis completed.';
}