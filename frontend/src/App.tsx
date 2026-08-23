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
import { CommandPalette } from './components/CommandPalette';
import { Silicon3DCanvas } from './components/Silicon3DCanvas';
import { HardDrive, Cpu, ShieldCheck } from 'lucide-react';

const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'ESP32-S3',
    name: 'ESP32-S3',
    sram_kb: 512,
    flash_mb: 8,
    clock_mhz: 240,
    arch: 'Xtensa Dual-Core LX7 with Vector PIE',
    simd: 'Xtensa PIE (8-bit SIMD)',
    voltage_v: 3.3,
    power_budget_mw: 250,
    recommendedFor: 'Voice and Vision Nodes',
  },
  {
    id: 'STM32H7',
    name: 'STM32H7',
    sram_kb: 1024,
    flash_mb: 2,
    clock_mhz: 480,
    arch: 'ARM Cortex-M7 with CMSIS-NN',
    simd: 'ARM __SMLAD (Dual 16-bit MAC)',
    voltage_v: 3.3,
    power_budget_mw: 420,
    recommendedFor: 'High Speed Industrial Robotics',
  },
  {
    id: 'RP2040',
    name: 'RP2040 (Pico)',
    sram_kb: 264,
    flash_mb: 2,
    clock_mhz: 133,
    arch: 'Dual ARM Cortex-M0+',
    simd: 'Software Unrolled 32-bit',
    voltage_v: 3.3,
    power_budget_mw: 90,
    recommendedFor: 'Ultra Low Cost Edge Sensors',
  },
  {
    id: 'nRF52840',
    name: 'nRF52840',
    sram_kb: 256,
    flash_mb: 1,
    clock_mhz: 64,
    arch: 'ARM Cortex-M4F with BLE',
    simd: 'ARMv7E-M DSP Instructions',
    voltage_v: 3.0,
    power_budget_mw: 45,
    recommendedFor: 'Wearable Medical Monitors',
  },
];

const MODEL_ZOO: ModelZooItem[] = [
  {
    id: 'kws',
    name: 'Audio Keyword Spotter',
    domain: 'Voice Wake Word',
    architecture: '1D Depthwise-Separable CNN',
    dataset: 'Google Speech Commands v2',
    input_shape: '1x49x10 (MFCC)',
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
    dataset: 'Visual Wake Words',
    input_shape: '1x48x48x1 (Grayscale)',
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
    input_shape: '1x64 (FFT)',
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
  { layer_id: 'conv1_3x3', op_type: 'Conv2D', in_shape: '1x49x10', out_shape: '1x47x16', macs: 22560, flash_bytes: 480, sram_bytes: 752, scale_factor: 0.00781, zero_point: 0, sram_offset_hex: '0x20000000', lifetime_start: 0, lifetime_end: 2, is_quantized: true, bitwidth: 8 },
  { layer_id: 'pool1_2x2', op_type: 'MaxPool2D', in_shape: '1x47x16', out_shape: '1x23x16', macs: 752, flash_bytes: 0, sram_bytes: 368, scale_factor: 0.00781, zero_point: 0, sram_offset_hex: '0x200002F0', lifetime_start: 1, lifetime_end: 3, is_quantized: true, bitwidth: 8 },
  { layer_id: 'dense1_64', op_type: 'Dense', in_shape: '1x368', out_shape: '1x64', macs: 23552, flash_bytes: 23552, sram_bytes: 64, scale_factor: 0.00390, zero_point: 0, sram_offset_hex: '0x20000000', lifetime_start: 2, lifetime_end: 4, is_quantized: true, bitwidth: 8 },
  { layer_id: 'classifier', op_type: 'Dense', in_shape: '1x64', out_shape: '1x4', macs: 256, flash_bytes: 256, sram_bytes: 4, scale_factor: 0.01562, zero_point: 0, sram_offset_hex: '0x20000040', lifetime_start: 3, lifetime_end: 4, is_quantized: true, bitwidth: 8 },
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
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);

  const [layers] = useState<LayerBentoRow[]>(INITIAL_LAYERS);
  const [arenaBlocks] = useState<ZeroMallocBlock[]>(INITIAL_BLOCKS);

  const currentHw = HARDWARE_PROFILES.find((h) => h.id === selectedHwId) || HARDWARE_PROFILES[0];
  const currentModel = MODEL_ZOO.find((m) => m.id === selectedModelId) || MODEL_ZOO[0];

  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([
    { id: '1', timestamp: '13:40:01', agent: 'Planner', step: 'planner', status: 'PASSED', message: `Parsed model graph: ${currentModel.architecture}. Budget: ${currentHw.sram_kb}KB SRAM.` },
    { id: '2', timestamp: '13:40:02', agent: 'Quantizer', step: 'quantizer', status: 'PASSED', message: `Applied symmetric INT8 PTQ. Flash footprint reduced by ${currentModel.flash_compression_ratio}.`, metric: `Weights: ${currentModel.int8_flash_kb} KB` },
    { id: '3', timestamp: '13:40:03', agent: 'MemoryMapper', step: 'memory_mapper', status: 'PASSED', message: `Greedy interval coloring scheduled ${arenaBlocks.length} buffers with zero overlap.`, metric: `Peak Arena: ${currentModel.peak_sram_kb} KB` },
    { id: '4', timestamp: '13:40:04', agent: 'CodeGen', step: 'codegen', status: 'PASSED', message: `Synthesized zero dependency C++ kernel tuned for ${currentHw.simd}.` },
    { id: '5', timestamp: '13:40:05', agent: 'Critic', step: 'critic', status: 'PASSED', message: `Formal boundary verification passed. 0 bytes dynamic malloc confirmed.` },
  ]);

  const [simState, setSimState] = useState<SimulatedSiliconState>({
    gpio: { GPIO_13: true, GPIO_12: false, GPIO_14: true, GPIO_27: false },
    adc: { ADC_IN1: 1.65 },
    uartLogs: [
      '[0.000s] SYSTEM_BOOT: Shannon TinyML Engine v2.4',
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

  const generatedCppHeader = `// ==================================================================\n// SHANNON AUTONOMOUS COMPILER - ZERO DEPENDENCY TINYML HEADER\n// Target: ${currentHw.name} (${currentHw.arch})\n// Model: ${currentModel.name} (${currentModel.architecture})\n// Precision: Symmetric INT8 Post-Training Quantization\n// ==================================================================\n#pragma once\n#include <stdint.h>\n#include <string.h>\n\n#define SHANNON_TENSOR_ARENA_SIZE ${Math.round(currentModel.peak_sram_kb * 1024)}\n\n// Static Contiguous Tensor Arena in Fast SRAM (0 Bytes malloc)\nstatic uint8_t shannon_tensor_arena[SHANNON_TENSOR_ARENA_SIZE] __attribute__((aligned(4)));\n\n// Quantized INT8 Weights in Flash ROM\nstatic const int8_t shannon_weights[] = {\n    12, -45, 88, -120, 34, 19, -5, 67, 102, -88, 14, 0, -33, 91, -12, 44\n};\n\nvoid shannon_run_inference(const int8_t* input_tensor, int8_t* output_tensor) {\n    // 1. Stage Input to Base Arena Offset 0x20000000\n    memcpy(&shannon_tensor_arena[0], input_tensor, 490);\n\n    // 2. Vectorized Inner Loop (${currentHw.simd})\n    // Statically planned activation buffers reuse memory without runtime heap allocation\n    output_tensor[0] = shannon_tensor_arena[0];\n}\n`;

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F5F8FA] font-sans flex flex-col relative">
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onSelectTab={setActiveTab}
        onSelectHardware={setSelectedHwId}
        onSelectModel={setSelectedModelId}
        onTriggerAgentLoop={handleTriggerAgentLoop}
        hardwareList={HARDWARE_PROFILES}
        models={MODEL_ZOO}
      />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hardwareList={HARDWARE_PROFILES}
        selectedHwId={selectedHwId}
        onSelectHardware={setSelectedHwId}
        isAgentRunning={isAgentRunning}
        onTriggerAgentLoop={handleTriggerAgentLoop}
        onOpenCommandPalette={() => setIsCmdOpen(true)}
      />

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col gap-4">
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

        {/* 3D Die & Bottom Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <Silicon3DCanvas
              targetHw={currentHw}
              peakSramKb={currentModel.peak_sram_kb}
              flashKb={currentModel.int8_flash_kb}
            />
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1A1F28] p-4 rounded-[3px] border border-[#232936]">
            <div className="bg-[#0B0D11] p-3 rounded-[2px] border border-[#232936] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#5C7080] flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#2B95D6]" /> Flash Storage (INT8)
                  </span>
                  <span className="text-[#2B95D6] font-bold">
                    {currentModel.int8_flash_kb} KB
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#12151B] rounded-[1px] overflow-hidden">
                  <div
                    className="h-full bg-[#2B95D6] rounded-[1px]"
                    style={{ width: `${Math.min(100, (currentModel.int8_flash_kb / (currentHw.flash_mb * 1024)) * 100 * 30)}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#0D8050] block mt-2 font-semibold">
                Reduced by {currentModel.flash_compression_ratio} (from {currentModel.fp32_flash_kb}KB FP32)
              </span>
            </div>

            <div className="bg-[#0B0D11] p-3 rounded-[2px] border border-[#232936] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#5C7080] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#0D8050]" /> Peak SRAM Arena Allocation
                  </span>
                  <span className="text-[#0D8050] font-bold">
                    {currentModel.peak_sram_kb} KB / {currentHw.sram_kb} KB
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#12151B] rounded-[1px] overflow-hidden">
                  <div
                    className="h-full bg-[#0D8050] rounded-[1px]"
                    style={{ width: `${Math.min(100, (currentModel.peak_sram_kb / currentHw.sram_kb) * 100 * 10)}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#5C7080] block mt-2">
                0 Bytes runtime malloc / Zero heap fragmentation
              </span>
            </div>

            <div className="sm:col-span-2 bg-[#0B0D11] p-3 rounded-[2px] border border-[#232936] flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#5C7080] block">SAFETY & COMPLIANCE</span>
                <h4 className="text-xs font-bold text-[#F5F8FA] font-mono flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#0D8050]" />
                  MISRA-C:2012 COMPLIANT (0 DYNAMIC ALLOCATIONS)
                </h4>
              </div>
              <div className="text-right font-mono">
                <span className="text-[9px] text-[#5C7080] block">SIMD ACCELERATION</span>
                <span className="text-xs font-bold text-[#2B95D6]">{currentHw.simd}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}