export interface HardwareProfile {
  id: string;
  name: string;
  sram_kb: number;
  flash_mb: number;
  clock_mhz: number;
  arch: string;
  simd: string;
  voltage_v: number;
  power_budget_mw: number;
  recommendedFor: string;
}

export interface ModelZooItem {
  id: string;
  name: string;
  domain: string;
  architecture: string;
  dataset: string;
  input_shape: string;
  input_type: string;
  fp32_flash_kb: number;
  int8_flash_kb: number;
  int4_flash_kb: number;
  peak_sram_kb: number;
  mac_count: number;
  flash_compression_ratio: string;
  target_mcu: string;
  accuracy_score: string;
}

export interface LayerBentoRow {
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
  lifetime_start: number;
  lifetime_end: number;
  is_quantized: boolean;
  bitwidth: 4 | 8 | 16 | 32;
}

export type AgentStepId = 'planner' | 'quantizer' | 'memory_mapper' | 'codegen' | 'critic';

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  step: AgentStepId;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'REFINING';
  message: string;
  metric?: string;
}

export interface ZeroMallocBlock {
  layer_id: string;
  buffer_name: string;
  start_offset_bytes: number;
  end_offset_bytes: number;
  size_bytes: number;
  hex_address: string;
  lifetime_window: [number, number];
  color: string;
}

export interface SimulatedSiliconState {
  gpio: Record<string, boolean>;
  adc: Record<string, number>;
  uartLogs: string[];
  pwmFreq: number;
  activeLayerId: string;
  coreTempC: number;
  powerMw: number;
  latencyMicros: number;
  fps: number;
  memoryIntegrityPassed: boolean;
}

export type TargetLanguage = 'cpp_esp32' | 'cpp_stm32' | 'rust_embedded' | 'micropython';

export interface PresetModel {
  id: string;
  name: string;
  domain: string;
  description: string;
  input_shape: number[];
  input_type: string;
}

export interface LayerStat {
  layer_id: string;
  op_type: string;
  macs: number;
  flash_bytes: number;
  sram_bytes?: number;
}

export interface OptimizationResult {
  model_name: string;
  target_hardware: string;
  fits_hardware: boolean;
  total_macs: number;
  estimated_latency_ms: number;
  flash_usage_bytes: number;
  flash_capacity_bytes: number;
  flash_utilization_pct: number;
  sram_usage_bytes: number;
  sram_capacity_bytes: number;
  sram_utilization_pct: number;
  code: string;
  bottlenecks: string[];
  recommendations: string[];
  layer_breakdown?: LayerStat[];
}

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  shape: string;
  macs: number;
  sram_bytes: number;
  flash_bytes: number;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  tensorShape?: string;
}

export interface StaticAnalysisIssue {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  remediation?: string;
  fixSuggestion?: string;
  autoFixable?: boolean;
  applied?: boolean;
  nodeId?: string;
}