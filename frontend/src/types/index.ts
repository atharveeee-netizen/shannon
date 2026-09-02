export interface HardwareProfile {
  id: string;
  name: string;
  sram_kb: number;
  flash_mb: number;
  clock_mhz: number;
  arch: string;
  simd: string;
  active_ma?: number;
  sleep_ua?: number;
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

export interface TensorInfo {
  name: string;
  shape: number[];
  dtype: string;
  size_bytes: number;
  scale?: number;
  zero_point?: number;
  sram_offset?: number;
  sram_offset_hex?: string;
  data?: Float32Array | Int8Array | number[];
}

export interface LayerData {
  layer_id: string;
  op_type: string;
  inputs: string[];
  outputs: string[];
  in_shape: string;
  out_shape: string;
  macs: number;
  flash_bytes: number;
  sram_bytes: number;
  scale_factor: number;
  zero_point: number;
  sram_offset_hex: string;
  sram_offset: number;
  lifetime: [number, number];
  bitwidth: 4 | 8 | 16 | 32;
  params: Record<string, any>;
  weights_tensor?: TensorInfo;
  bias_tensor?: TensorInfo;
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

export interface MemoryTimelineStep {
  layer_idx: number;
  layer_id: string;
  op_type: string;
  active_sram_bytes: number;
  active_tensors: string[];
  blocks: {
    tensor_name: string;
    start_offset: number;
    end_offset: number;
    size_bytes: number;
    hex_address: string;
    lifetime_window: [number, number];
  }[];
}

export interface PipelineStage {
  id: 'import' | 'parse' | 'quantize' | 'memory' | 'optimize' | 'codegen' | 'verify' | 'deploy';
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration_ms?: number;
  started_at?: string;
  completed_at?: string;
  logs?: string[];
  detail?: string;
}

export interface CompilerLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  stage?: string;
  message: string;
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
  battery_energy?: {
    battery_life_days: number;
    battery_life_years: number;
    avg_power_mw: number;
    active_energy_uj: number;
  };
  layers: LayerData[];
  tensors: Record<string, TensorInfo>;
  arena_blocks: ArenaBlock[];
  memory_timeline: MemoryTimelineStep[];
  c_header_code: string;
  recommendations: string[];
  bottlenecks: string[];
  pipeline_stages: PipelineStage[];
  logs: CompilerLogEntry[];
  compiled_at: string;
}

export interface TargetBenchmarkEntry {
  hardware_id: string;
  hardware_name: string;
  arch: string;
  clock_mhz: number;
  flash_total_kb: number;
  sram_total_kb: number;
  flash_utilization_pct: number;
  sram_utilization_pct: number;
  estimated_latency_ms: number;
  fits: boolean;
  provenance: 'Compiler Static Cycle Model' | 'Hardware Telemetry Benchmark';
}