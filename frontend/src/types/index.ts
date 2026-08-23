export interface HardwareProfile {
  id: string;
  name: string;
  sram_kb: number;
  flash_mb: number;
  clock_mhz: number;
  arch: string;
  simd: string;
}

export interface PresetModel {
  id: string;
  name: string;
  domain: string;
  architecture: string;
  dataset: string;
  description: string;
  input_shape: string;
  input_type: string;
}

export interface LayerData {
  layer_id: string;
  op_type: string;
  in_shape: string;
  out_shape: string;
  macs: number;
  flash_bytes: number;
  sram_bytes: number;
  scale_factor: number;
  zero_point: number;
  sram_offset_hex: string;
  lifetime: [number, number];
  bitwidth: 4 | 8 | 16 | 32;
}

export interface ArenaBlock {
  layer_id: string;
  name: string;
  start_bytes: number;
  end_bytes: number;
  size_bytes: number;
  hex_address: string;
  lifetime: [number, number];
  color: string;
}

export interface CompilationResult {
  model_name: string;
  target_hardware: string;
  fits_hardware: boolean;
  zero_malloc_verified: boolean;
  quantization_bits: 4 | 8;
  mixed_precision: boolean;
  baseline_fp32: {
    flash_bytes: number;
    peak_sram_bytes: number;
    total_macs: number;
    estimated_latency_ms: number;
  };
  optimized_int8: {
    flash_bytes: number;
    peak_sram_bytes: number;
    total_macs: number;
    estimated_latency_ms: number;
    compression_ratio: number;
    flash_reduction_pct: number;
  };
  layers: LayerData[];
  arena_blocks: ArenaBlock[];
  c_header_code: string;
  recommendations: string[];
  bottlenecks: string[];
}