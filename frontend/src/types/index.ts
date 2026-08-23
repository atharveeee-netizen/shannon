export interface HardwareProfile {
  name: string;
  sram_kb: number;
  flash_mb: number;
  clock_mhz: number;
  arch: string;
  recommendedFor: string;
  simd?: string;
}

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
  output_shape: number[];
  sram_offset_bytes?: number;
  sram_size_bytes?: number;
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
  bottlenecks: Array<{ severity: string; type: string; message: string }>;
  recommendations: string[];
  layer_breakdown?: LayerStat[];
}

export type CompilationResult = OptimizationResult;

export interface GraphNode {
  id: string;
  name: string;
  type: 'Conv2D' | 'DepthwiseConv2D' | 'Dense' | 'MaxPool2D' | 'ReLU' | 'Softmax' | 'Input' | 'Output';
  x: number;
  y: number;
  macs: number;
  sram_bytes: number;
  flash_bytes: number;
  shape: string;
  isQuantized: boolean;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  tensorShape: string;
}

export interface StaticAnalysisIssue {
  id: string;
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  nodeId?: string;
  fixSuggestion?: string;
}

export interface SimulatedSiliconState {
  gpio: Record<string, boolean>;
  adc: Record<string, number>;
  uartLogs: string[];
  pwmFreq: number;
  activeLayerId: string;
  coreTempC: number;
  powerMw: number;
}

export type TargetLanguage = 'cpp_esp32' | 'cpp_stm32' | 'rust_embedded' | 'micropython';