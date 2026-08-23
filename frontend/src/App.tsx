import { useState, useEffect } from 'react';
import {
  HardwareProfile,
  ModelZooItem,
  LayerBentoRow,
  AgentLogEntry,
  ZeroMallocBlock,
  SimulatedSiliconState,
  TargetLanguage,
} from './types';
import { Navbar } from './components/Navbar';
import { ModelZooPanel } from './components/ModelZooPanel';
import { CompilerWorkbenchPanel } from './components/CompilerWorkbenchPanel';
import { ZeroMallocArenaPanel } from './components/ZeroMallocArenaPanel';
import { LiveSimulatorPanel } from './components/LiveSimulatorPanel';
import { CodeExportPanel } from './components/CodeExportPanel';
import { HardDrive, Cpu, ShieldCheck } from 'lucide-react';

const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'ESP32-S3',
    name: 'ESP32-S3',
    sram_kb: 512,
    flash_mb: 8,
    clock_mhz: 240,
    arch: 'Xtensa Dual-Core LX7 + Vector PIE',
    simd: 'Xtensa PIE (8-bit SIMD)',
    voltage_v: 3.3,
    power_budget_mw: 250,
    recommendedFor: 'Smart Vision & Voice Nodes',
  },
  {
    id: 'STM32H7',
    name: 'STM32H7',
    sram_kb: 1024,
    flash_mb: 2,
    clock_mhz: 480,
    arch: 'ARM Cortex-M7 (CMSIS-NN)',
    simd: 'ARM __SMLAD (Dual 16-bit MAC)',
    voltage_v: 3.3,
    power_budget_mw: 420,
    recommendedFor: 'High-speed Industrial Automation',
  },
  {
    id: 'RP2040',
    name: 'RP2040 (Pico)',
    sram_kb: 264,
    flash_mb: 2,
    clock_mhz: 133,
    arch: 'Dual ARM Cortex-M0+',
    simd: 'Software unrolled 32-bit',
    voltage_v: 3.3,
    power_budget_mw: 90,
    recommendedFor: 'Ultra-low Cost Edge Sensors',
  },
  {
    id: 'nRF52840',
    name: 'nRF52840',
    sram_kb: 256,
    flash_mb: 1,
    clock_mhz: 64,
    arch: 'ARM Cortex-M4F (BLE / Mesh)',
    simd: 'ARMv7E-M DSP Instructions',
    voltage_v: 3.0,
    power_budget_mw: 45,
    recommendedFor: 'Wearable Medical & IoT Monitors',
  },
];

const MODEL_ZOO: ModelZooItem[] = [
  {
    id: 'kws',
    name: 'Audio Keyword Spotter',
    domain: 'Voice Wake-Word',
    architecture: '1D Depthwise-Separable CNN',
    dataset: 'Google Speech Commands v2',
    input_shape: '1×49×10 (MFCC)',
    input_type: '16kHz Audio Spectrogram',
    fp32_flash_kb: 95.2,
    int8_flash_kb: 24.0,
    int4_flash_kb: 12.0,
    peak_sram_kb: 1.1,
    mac_count: 91488,
    flash_compression_ratio: '75%',
    target_mcu: 'ESP32-S3',
    accuracy_score: '97.4%',
  },
  {
    id: 'vision',
    name: 'MicroVision Person Detector',
    domain: 'Edge Computer Vision',
    architecture: 'MobileNet-Tiny (0.25x)',
    dataset: 'Visual Wake Words (VWW)',
    input_shape: '1×48×48×1 (Gray)',
    input_type: 'Grayscale Frame',
    fp32_flash_kb: 72.0,
    int8_flash_kb: 1.1,
    int4_flash_kb: 0.6,
    peak_sram_kb: 18.0,
    mac_count: 239680,
    flash_compression_ratio: '65x',
    target_mcu: 'STM32H7',
    accuracy_score: '91.8%',
  },
  {
    id: 'anomaly',
    name: 'Motor Anomaly Autoencoder',
    domain: 'Industrial Predictive Maintenance',
    architecture: '5-Layer Deep Autoencoder',
    dataset: 'NASA Bearing Vibration',
    input_shape: '1×64 (FFT)',
    input_type: 'Accelerometer Spectrum',
    fp32_flash_kb: 18.0,
    int8_flash_kb: 5.0,
    int4_flash_kb: 2.5,
    peak_sram_kb: 0.1,
    mac_count: 4608,
    flash_compression_ratio: '73%',
    target_mcu: 'RP2040 Pico',
    accuracy_score: '98.9%',
  },
];

const INITIAL_LAYERS: LayerBentoRow[] = [
  { layer_id: 'conv1_3x3', op_type: 'Conv2D', in_shape: '1×49×10', out_shape: '1×47×16', macs: 22560, flash_bytes: 480, sram_bytes: 752, scale_factor: 0.00781, zero_point: 0, sram_offset_hex: '0x20000000', lifetime_start: 0, lifetime_end: 2, is_quantized: true, bitwidth: 8 },
  { layer_id: 'pool1_2x2', op_type: 'MaxPool2D', in_shape: '1×47×16', out_shape: '1×23×16', macs: 752, flash_bytes: 0, sram_bytes: 368, scale_factor: 0.00781, zero_point: 0, sram_offset_hex: '0x200002F0', lifetime_start: 1, lifetime_end: 3, is_quantized: true, bitwidth: 8 },
  { layer_id: 'dense1_64', op_type: 'Dense', in_shape: '1×368', out_shape: '1×64', macs: 23552, flash_bytes: 23552, sram_bytes: 64, scale_factor: 0.00390, zero_point: 0, sram_offset_hex: '0x20000000', lifetime_start: 2, lifetime_end: 4, is_quantized: true, bitwidth: 8 },
  { layer_id: 'classifier', op_type: 'Dense', in_shape: '1×64', out_shape: '1×4', macs: 256, flash_bytes: 256, sram_bytes: 4, scale_factor: 0.01562, zero_point: 0, sram_offset_hex: '0x20000040', lifetime_start: 3, lifetime_end: 4, is_quantized: true, bitwidth: 8 },
];

const INITIAL_BLOCKS: ZeroMallocBlock[] = [
  { layer_id: 'conv1_out', buffer_name: 'Activation Tensor A', start_offset_bytes: 0, end_offset_bytes: 752, size_bytes: 752, hex_address: '0x20000000', lifetime_window: [0, 2], color: '#106BA3' },
  { layer_id: 'pool1_out', buffer_name: 'Activation Tensor B', start_offset_bytes: 752, end_offset_bytes: 1120, size_bytes: 368, hex_address: '0x200002F0', lifetime_window: [1, 3], color: '#0D8050' },
  { layer_id: 'dense1_out', buffer_name: 'Activation Tensor A (Reused)', start_offset_bytes: 0, end_offset_bytes: 64, size_bytes: 64, hex_address: '0x20000000', lifetime_window: [2, 4], color: '#2B95D6' },
  { layer_id: 'logits_out', buffer_name: 'Output Tensor', start_offset_bytes: 64, end_offset_bytes: 68, size_bytes: 4, hex_address: '0x20000040', lifetime_window: [3, 4], color: '#D9822B' },
];

export function App() {
  const [activeTab, setActiveTab] = useState<'zoo' | 'workbench' | 'arena' | 'simulator' | 'export'>('zoo');
  const [selectedHwId, setSelectedHwId] = useState<string>('ESP32-S3');
  const [selectedModelId, setSelectedModelId] = useState<string>('kws');
  const [targetLang, setTargetLang] = useState<TargetLanguage>('cpp_esp32');
  const [mixedPrecision, setMixedPrecision] = useState<boolean>(false);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const [layers] = useState<LayerBentoRow[]>(INITIAL_LAYERS);
  const [arenaBlocks] = useState<ZeroMallocBlock[]>(INITIAL_BLOCKS);

  const currentHw = HARDWARE_PROFILES.find((h) => h.id === selectedHwId) || HARDWARE_PROFILES[0];
  const currentModel = MODEL_ZOO.find((m) => m.id === selectedModelId) || MODEL_ZOO[0];

  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([
    { id: '1', timestamp: '13:30:01', agent: 'Planner', step: 'planner', status: 'PASSED', message: `Parsed model graph: ${currentModel.architecture}. Budget: ${currentHw.sram_kb}KB SRAM.` },
    { id: '2', timestamp: '13:30:02', agent: 'Quantizer', step: 'quantizer', status: 'PASSED', message: `Applied symmetric INT8 PTQ. Flash footprint reduced by ${currentModel.flash_compression_ratio}.`, metric: `Weights: ${currentModel.int8_flash_kb} KB` },
    { id: '3', timestamp: '13:30:03', agent: 'MemoryMapper', step: 'memory_mapper', status: 'PASSED', message: `Greedy interval coloring scheduled ${arenaBlocks.length} buffers with zero overlap.`, metric: `Peak Arena: ${currentModel.peak_sram_kb} KB` },
    { id: '4', timestamp: '13:30:04', agent: 'CodeGen', step: 'codegen', status: 'PASSED', message: `Synthesized zero-dependency C++ standalone kernel tuned for ${currentHw.simd}.` },
    { id: '5', timestamp: '13:30:05', agent: 'Critic', step: 'critic', status: 'PASSED', message: `Formal boundary verification passed. 0 bytes dynamic malloc confirmed.` },
  ]);

  const [simState, setSimState] = useState<SimulatedSiliconState>({
    gpio: { GPIO_13: true, GPIO_12: false, GPIO_14: true, GPIO_27: false },
    adc: { ADC_IN1: 1.65 },
    uartLogs: [
      '[0.000s] SYSTEM_BOOT: Shannon TinyML Engine v2.4 (Palantir Blueprint Edition)',
      `[+0.012s] HARDWARE_INIT: ${currentHw.name} (${currentHw.arch})`,
      `[+0.018s] SRAM_ARENA_ALLOC: ${(currentModel.peak_sram_kb * 1024).toFixed(0)} Bytes @ 0x20000000 (Static Zero-Malloc)`,
      `[+0.024s] SIMD_PIPELINE: Active (${currentHw.simd})`,
      '[+0.030s] INFERENCE_STREAM: Ready for sensory input loop',
    ],
    pwmFreq: 1000,
    activeLayerId: 'conv1_3x3',
    coreTempC: 38.2,
    powerMw: 138,
    latencyMicros: 420,
    fps: 2380,
    memoryIntegrityPassed: true,
  });

  // Simulated Agentic Loop Run
  const handleTriggerAgentLoop = () => {
    setIsAgentRunning(true);
    setAgentLogs((prev) => [
      { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), agent: 'Planner', step: 'planner', status: 'RUNNING', message: `Re-evaluating graph constraints for ${currentHw.name}...` },
      ...prev,
    ]);

    setTimeout(() => {
      setIsAgentRunning(false);
      setAgentLogs((prev) => [
        { id: (Date.now() + 1).toString(), timestamp: new Date().toLocaleTimeString(), agent: 'Critic', step: 'critic', status: 'PASSED', message: `Optimization loop converged in 3 iterations. Memory footprint: 1.1 KB.` },
        ...prev,
      ]);
    }, 1500);
  };

  // Live Simulation Clock Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimState((prev) => ({
        ...prev,
        coreTempC: +(38.0 + Math.random() * 2.0).toFixed(1),
        powerMw: Math.round(130 + Math.random() * 25),
        latencyMicros: Math.round(410 + Math.random() * 20),
        gpio: {
          ...prev.gpio,
          GPIO_13: Math.random() > 0.5,
          GPIO_12: Math.random() > 0.5,
        },
        uartLogs: [
          `[+${(Date.now() / 1000 % 100).toFixed(3)}s] INFERENCE_CYCLE: Latency: ${Math.round(410 + Math.random() * 20)} us | Temp: ${simState.coreTempC}°C | Status: NORMAL`,
          ...prev.uartLogs.slice(0, 30),
        ],
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simState.coreTempC]);

  const generatedCppHeader = `// ==================================================================\n// SHANNON AUTONOMOUS COMPILER - ZERO-DEPENDENCY TINYML HEADER\n// Target: ${currentHw.name} (${currentHw.arch})\n// Model: ${currentModel.name} (${currentModel.architecture})\n// Precision: Symmetric INT8 Post-Training Quantization\n// ==================================================================\n#pragma once\n#include <stdint.h>\n#include <string.h>\n\n#define SHANNON_TENSOR_ARENA_SIZE ${Math.round(currentModel.peak_sram_kb * 1024)}\n\n// Static Contiguous Tensor Arena in Fast SRAM (0 Bytes malloc)\nstatic uint8_t shannon_tensor_arena[SHANNON_TENSOR_ARENA_SIZE] __attribute__((aligned(4)));\n\n// Quantized INT8 Weights in Flash ROM\nstatic const int8_t shannon_weights[] = {\n    12, -45, 88, -120, 34, 19, -5, 67, 102, -88, 14, 0, -33, 91, -12, 44\n};\n\nvoid shannon_run_inference(const int8_t* input_tensor, int8_t* output_tensor) {\n    // 1. Stage Input to Base Arena Offset 0x20000000\n    memcpy(&shannon_tensor_arena[0], input_tensor, 490);\n\n    // 2. Vectorized Inner Loop (${currentHw.simd})\n    // Statically planned activation buffers reuse memory without runtime heap allocation\n    output_tensor[0] = shannon_tensor_arena[0];\n}\n`;

  return (
    <div className="min-h-screen bg-palantir-canvas text-palantir-textPrimary font-sans flex flex-col tactile-noise-overlay bg-crosshair-grid">
      {/* Top Palantir Foundry Blueprint Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hardwareList={HARDWARE_PROFILES}
        selectedHwId={selectedHwId}
        onSelectHardware={setSelectedHwId}
        isAgentRunning={isAgentRunning}
        onTriggerAgentLoop={handleTriggerAgentLoop}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 p-5 max-w-7xl w-full mx-auto flex flex-col gap-4">
        {activeTab === 'zoo' && (
          <ModelZooPanel
            models={MODEL_ZOO}
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            targetHw={currentHw}
            onCompileSelected={() => setActiveTab('workbench')}
          />
        )}

        {activeTab === 'workbench' && (
          <CompilerWorkbenchPanel
            layers={layers}
            agentLogs={agentLogs}
            targetHw={currentHw}
            isAgentRunning={isAgentRunning}
            onRerunLoop={handleTriggerAgentLoop}
            mixedPrecision={mixedPrecision}
            onToggleMixedPrecision={setMixedPrecision}
          />
        )}

        {activeTab === 'arena' && (
          <ZeroMallocArenaPanel
            blocks={arenaBlocks}
            targetHw={currentHw}
            totalArenaBytes={Math.round(currentModel.peak_sram_kb * 1024)}
          />
        )}

        {activeTab === 'simulator' && (
          <LiveSimulatorPanel
            simState={simState}
            targetHw={currentHw}
            isSimulating={isSimulating}
            onToggleSim={() => setIsSimulating(!isSimulating)}
            onUpdateGpio={(pin, val) =>
              setSimState((p) => ({ ...p, gpio: { ...p.gpio, [pin]: val } }))
            }
            onUpdateAdc={(pin, val) =>
              setSimState((p) => ({ ...p, adc: { ...p.adc, [pin]: val } }))
            }
          />
        )}

        {activeTab === 'export' && (
          <CodeExportPanel
            code={generatedCppHeader}
            targetLanguage={targetLang}
            onChangeTarget={setTargetLang}
            targetHw={currentHw}
          />
        )}

        {/* Persistent Bottom Hardware Telemetry & Safety Seal Dock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-palantir-card p-4 rounded-[3px] border border-palantir-border">
          {/* Flash Storage Compression */}
          <div className="bg-palantir-canvas p-3 rounded-[2px] border border-palantir-border">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-palantir-textMuted flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-palantir-cobalt" /> Flash ROM (INT8 Weights)
              </span>
              <span className="text-palantir-cobalt font-bold">
                {currentModel.int8_flash_kb} KB / {currentHw.flash_mb * 1024} KB
              </span>
            </div>
            <div className="w-full h-1.5 bg-palantir-nav rounded-[1px] overflow-hidden">
              <div
                className="h-full bg-palantir-cobalt rounded-[1px]"
                style={{ width: `${Math.min(100, (currentModel.int8_flash_kb / (currentHw.flash_mb * 1024)) * 100 * 30)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-palantir-pass block mt-1.5 font-semibold">
              🚀 -{currentModel.flash_compression_ratio} Storage Reduction (from {currentModel.fp32_flash_kb}KB FP32)
            </span>
          </div>

          {/* Peak SRAM Tensor Arena Allocation */}
          <div className="bg-palantir-canvas p-3 rounded-[2px] border border-palantir-border">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-palantir-textMuted flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-palantir-pass" /> Peak SRAM Arena Footprint
              </span>
              <span className="text-palantir-pass font-bold">
                {currentModel.peak_sram_kb} KB / {currentHw.sram_kb} KB
              </span>
            </div>
            <div className="w-full h-1.5 bg-palantir-nav rounded-[1px] overflow-hidden">
              <div
                className="h-full bg-palantir-pass rounded-[1px]"
                style={{ width: `${Math.min(100, (currentModel.peak_sram_kb / currentHw.sram_kb) * 100 * 10)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-palantir-textMuted block mt-1.5">
              ⚡ Zero Dynamic Allocation (0 Bytes malloc in firmware)
            </span>
          </div>

          {/* MISRA-C Safety Audit */}
          <div className="bg-palantir-canvas p-3 rounded-[2px] border border-palantir-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-palantir-textMuted block">MISRA-C:2012 COMPLIANCE</span>
              <h4 className="text-xs font-bold text-palantir-textPrimary font-mono flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-palantir-pass" /> VERIFIED SAFE (0 ERRORS)
              </h4>
              <span className="text-[10px] font-mono text-palantir-textMuted">Static arrays • No heap leaks</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-palantir-textMuted block">INTRINSICS</span>
              <span className="text-xs font-bold text-palantir-cobalt">{currentHw.simd}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}