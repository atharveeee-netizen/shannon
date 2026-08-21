export interface HardwareProfile {
  name: string;
  sram_kb: number;
  flash_mb: number;
  clock_mhz: number;
  arch: string;
  recommendedFor: string;
}

export interface PresetModel {
  id: string;
  name: string;
  domain: string;
  description: string;
  input_shape: number[];
  input_type: string;
}

export interface OptimizationResult {
  model_name: string;
  target_hardware: string;
  quantization: {
    bits: number;
    symmetric: boolean;
  };
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
  };
  memory_timeline: Array<{
    layer_idx: number;
    layer_id: string;
    op_type: string;
    active_sram_bytes: number;
    active_tensors: string[];
  }>;
  agent_report: {
    target_hardware: string;
    fits_hardware: boolean;
    sram_usage_bytes: number;
    sram_capacity_bytes: number;
    sram_utilization_pct: number;
    flash_usage_bytes: number;
    flash_capacity_bytes: number;
    flash_utilization_pct: number;
    estimated_latency_ms: number;
    bottlenecks: Array<{
      severity: 'CRITICAL' | 'WARNING' | 'INFO';
      type: string;
      message: string;
    }>;
    recommendations: string[];
    agent_verdict: string;
  };
  c_header_code: string;
}