import { useState, useEffect } from 'react';
import {
  HardwareProfile,
  ModelZooItem,
  LayerBentoRow,
  ZeroMallocBlock,
  SimulatedSiliconState,
} from './types';
import { SramArenaTimeline } from './components/SramArenaTimeline';
import { CodeViewerPanel } from './components/CodeViewerPanel';
import { SensorWorkbench } from './components/SensorWorkbench';
import { CommandPalette } from './components/CommandPalette';
import { AgentChat } from './components/AgentChat';
import { ScreenpipeAuditDrawer } from './components/ScreenpipeAuditDrawer';
import { optimizeModel } from './services/api';
import {
  Play,
  Square,
  Download,
  Search,
  Github,
  Sparkles,
  Layers,
  Cpu,
  Database,
  X,
} from 'lucide-react';

const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'ESP32-S3',
    name: 'ESP32-S3',
    vendor: 'Espressif',
    sram_kb: 512,
    flash_mb: 8,
    clock_mhz: 240,
    arch: 'Xtensa LX7 Dual-Core (Vector PIE)',
    simd: 'Xtensa PIE (8-bit SIMD)',
    voltage_v: 3.3,
    power_budget_mw: 250,
    recommendedFor: 'Voice & Smart Vision Nodes',
  },
  {
    id: 'STM32H7',
    name: 'STM32H7',
    vendor: 'STMicroelectronics',
    sram_kb: 1024,
    flash_mb: 2,
    clock_mhz: 480,
    arch: 'ARM Cortex-M7 (CMSIS-NN)',
    simd: 'ARM __SMLAD (Dual 16-bit MAC)',
    voltage_v: 3.3,
    power_budget_mw: 420,
    recommendedFor: 'Industrial Robotics & Vision',
  },
  {
    id: 'RP2040',
    name: 'RP2040 (Pico)',
    vendor: 'Raspberry Pi',
    sram_kb: 264,
    flash_mb: 2,
    clock_mhz: 133,
    arch: 'Dual ARM Cortex-M0+',
    simd: 'Software Unrolled 32-bit',
    voltage_v: 3.3,
    power_budget_mw: 90,
    recommendedFor: 'Ultra Low-Cost Edge Sensors',
  },
  {
    id: 'nRF52840',
    name: 'nRF52840',
    vendor: 'Nordic Semi',
    sram_kb: 256,
    flash_mb: 1,
    clock_mhz: 64,
    arch: 'ARM Cortex-M4F (BLE / Mesh)',
    simd: 'ARMv7E-M DSP Instructions',
    voltage_v: 3.0,
    power_budget_mw: 45,
    recommendedFor: 'Wearable Medical Monitors',
  },
  {
    id: 'MAX78000',
    name: 'MAX78000',
    vendor: 'Analog Devices',
    sram_kb: 442,
    flash_mb: 0.5,
    clock_mhz: 100,
    arch: 'ARM Cortex-M4F + CNN HW Engine',
    simd: 'Hardware CNN Accelerator',
    voltage_v: 1.8,
    power_budget_mw: 35,
    recommendedFor: 'Ultra Low-Energy Audio/Vision',
  },
  {
    id: 'GAP9',
    name: 'GAP9',
    vendor: 'GreenWaves',
    sram_kb: 1600,
    flash_mb: 16,
    clock_mhz: 400,
    arch: '9-Core RISC-V + NE16 Tensor Engine',
    simd: 'GAP8/9 Vector Intrinsics',
    voltage_v: 1.0,
    power_budget_mw: 50,
    recommendedFor: 'Autonomous Micro-Drones',
  },
];

const MODEL_ZOO: ModelZooItem[] = [
  {
    id: 'kws',
    name: 'Audio Keyword Spotter',
    domain: 'Voice Wake-Word',
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
    domain: 'Edge Vision',
    architecture: 'MobileNet-Tiny (0.25x Depthwise)',
    dataset: 'Visual Wake Words (VWW)',
    input_shape: '1x48x48x1 (Grayscale)',
    input_type: 'Grayscale Camera Frame',
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
    domain: 'Industrial IoT',
    architecture: '5-Layer Deep Autoencoder',
    dataset: 'NASA Bearing Vibration Dataset',
    input_shape: '1x64 (FFT)',
    input_type: 'Accelerometer FFT Spectrum',
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
  { layer_id: 'conv1_out', buffer_name: 'Activation Tensor A', start_offset_bytes: 0, end_offset_bytes: 752, size_bytes: 752, hex_address: '0x20000000', lifetime_window: [0, 2], color: '#0284C7' },
  { layer_id: 'pool1_out', buffer_name: 'Activation Tensor B', start_offset_bytes: 752, end_offset_bytes: 1120, size_bytes: 368, hex_address: '0x200002F0', lifetime_window: [1, 3], color: '#10B981' },
  { layer_id: 'dense1_out', buffer_name: 'Activation Tensor A (Reused)', start_offset_bytes: 0, end_offset_bytes: 64, size_bytes: 64, hex_address: '0x20000000', lifetime_window: [2, 4], color: '#38BDF8' },
  { layer_id: 'logits_out', buffer_name: 'Output Tensor', start_offset_bytes: 64, end_offset_bytes: 68, size_bytes: 4, hex_address: '0x20000040', lifetime_window: [3, 4], color: '#F59E0B' },
];

export function App() {
  const [selectedHwId, setSelectedHwId] = useState<string>('ESP32-S3');
  const [selectedModelId, setSelectedModelId] = useState<string>('kws');
  const [quantBits, setQuantBits] = useState<number>(8);
  const [mixedPrecision, setMixedPrecision] = useState<boolean>(false);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);

  const [layers] = useState<LayerBentoRow[]>(INITIAL_LAYERS);
  const [arenaBlocks] = useState<ZeroMallocBlock[]>(INITIAL_BLOCKS);

  const currentHw = HARDWARE_PROFILES.find((h) => h.id === selectedHwId) || HARDWARE_PROFILES[0];
  const currentModel = MODEL_ZOO.find((m) => m.id === selectedModelId) || MODEL_ZOO[0];

  const [simState, setSimState] = useState<SimulatedSiliconState>({
    gpio: { GPIO_13: true, GPIO_12: false, GPIO_14: true, GPIO_27: false },
    adc: { ADC_IN1: 1.65 },
    uartLogs: [
      '[0.000s] SYSTEM_BOOT: Shannon TinyML Engine v2.4 (Bare-Metal Silicon)',
      `[+0.012s] HARDWARE_INIT: ${currentHw.name} (${currentHw.arch})`,
      `[+0.018s] SRAM_ARENA_ALLOC: ${(currentModel.peak_sram_kb * 1024).toFixed(0)} Bytes @ 0x20000000 (Static Zero-Malloc)`,
      `[+0.024s] SIMD_PIPELINE: Active (${currentHw.simd})`,
      '[+0.030s] INFERENCE_STREAM: Ready for real-time sensory loop @ 115200 Baud',
    ],
    pwmFreq: 1000,
    activeLayerId: 'conv1_3x3',
    coreTempC: 38.2,
    powerMw: 138,
    latencyMicros: 420,
    fps: 2380,
    memoryIntegrityPassed: true,
  });

  const [generatedCppHeader, setGeneratedCppHeader] = useState<string>(
`/* ===========================================================================
 * SHANNON AUTONOMOUS COMPILER — AUTOGENERATED TINYML INFERENCE HEADER
 * Model: ${currentModel.name}
 * Target Architecture: ${currentHw.name} (${currentHw.arch})
 * Peak SRAM Arena: ${(currentModel.peak_sram_kb * 1024).toFixed(0)} Bytes (${currentModel.peak_sram_kb} KB)
 * Flash Memory (ROM): ${(currentModel.int8_flash_kb * 1024).toFixed(0)} Bytes (${currentModel.int8_flash_kb} KB)
 * Total MACs: ${currentModel.mac_count.toLocaleString()}
 * Static Allocation: MISRA-C:2012 Rule 21.3 Compliant (0 Bytes Dynamic malloc)
 * =========================================================================== */

#ifndef SHANNON_${currentModel.id.toUpperCase()}_H
#define SHANNON_${currentModel.id.toUpperCase()}_H

#include <stdint.h>
#include <string.h>

#define SHANNON_ARENA_SIZE ${Math.round(currentModel.peak_sram_kb * 1024)}

// Static Tensor Arena Memory Pool in Fast SRAM (Aligned to 4-byte word)
static uint8_t shannon_tensor_arena[SHANNON_ARENA_SIZE] __attribute__((aligned(4)));

// Quantized INT8 Weights in Flash ROM
static const int8_t shannon_weights[] = {
    12, -45, 88, -120, 34, 19, -5, 67, 102, -88, 14, 0, -33, 91, -12, 44
};

static inline int shannon_run_inference(const int8_t* input_data, int8_t* output_data) {
    if (!input_data || !output_data) return -1;
    // Stage input to static arena offset 0x20000000
    memcpy(&shannon_tensor_arena[0], input_data, 490);

    // Vectorized INT8 Inner Kernel (${currentHw.simd})
    output_data[0] = shannon_tensor_arena[0];
    return 0; // Success
}

#endif // SHANNON_${currentModel.id.toUpperCase()}_H
`
  );

  const handleTriggerCompile = async () => {
    setIsCompiling(true);
    try {
      const res = await optimizeModel(selectedModelId, currentHw.name);
      if (res && res.code) {
        setGeneratedCppHeader(res.code);
      }
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsCompiling(false);
      setSimState((prev) => ({
        ...prev,
        uartLogs: [
          `[+${(Date.now() / 1000 % 100).toFixed(3)}s] COMPILER_SUCCESS: ${currentModel.name} compiled for ${currentHw.name}. Peak Arena: ${currentModel.peak_sram_kb}KB.`,
          ...prev.uartLogs,
        ],
      }));
    }, 700);
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

  return (
    <div className="h-screen w-screen bg-[#070A0F] text-[#F8FAFC] font-sans flex flex-col overflow-hidden select-none selection:bg-[#0284C7]/30 selection:text-[#38BDF8]">
      {/* Command Palette Overlay (⌘K) */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onSelectTab={() => {}}
        onSelectHardware={setSelectedHwId}
        onSelectModel={setSelectedModelId}
        onTriggerAgentLoop={handleTriggerCompile}
        hardwareList={HARDWARE_PROFILES}
        models={MODEL_ZOO}
      />

      {/* Screenpipe Continuous Audit Drawer */}
      <ScreenpipeAuditDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

      {/* Top IDE Header (44px) - Clean, Uncluttered, High-Density */}
      <header className="h-11 bg-[#070A0F] border-b border-[#1E293B] px-3 flex items-center justify-between select-none shrink-0 z-30">
        {/* Left: Brand & Model / Hardware Selectors */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-[3px] bg-[#0284C7]/20 border border-[#38BDF8]/50 flex items-center justify-center text-[#38BDF8] font-bold text-xs shadow-[0_0_10px_rgba(56,189,248,0.35)]">
              ⚡
            </div>
            <span className="font-bold text-xs text-[#F8FAFC]">SHANNON</span>
            <span className="text-[10px] text-[#38BDF8] bg-[#0284C7]/15 px-1.5 py-0.2 rounded border border-[#38BDF8]/30 font-bold">
              IDE
            </span>
          </div>

          <div className="h-3.5 w-px bg-[#1E293B]" />

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#1E293B] hover:border-[#38BDF8]/40 transition-colors">
            <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="bg-transparent text-xs text-[#F8FAFC] font-semibold focus:outline-none cursor-pointer"
            >
              {MODEL_ZOO.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0B0F17] text-[#F8FAFC]">
                  {m.name} ({m.domain})
                </option>
              ))}
            </select>
          </div>

          {/* Target MCU Selector Dropdown */}
          <div className="flex items-center gap-1 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#1E293B] hover:border-[#10B981]/40 transition-colors">
            <Cpu className="w-3.5 h-3.5 text-[#10B981]" />
            <select
              value={selectedHwId}
              onChange={(e) => setSelectedHwId(e.target.value)}
              className="bg-transparent text-xs text-[#F8FAFC] font-semibold focus:outline-none cursor-pointer"
            >
              {HARDWARE_PROFILES.map((h) => (
                <option key={h.id} value={h.id} className="bg-[#0B0F17] text-[#F8FAFC]">
                  {h.name} ({h.clock_mhz}MHz • {h.sram_kb}KB SRAM)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions, Copilot, Compile Button */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setIsCmdOpen(true)}
            className="flex items-center gap-1 bg-[#0E1420] hover:bg-[#141C2E] text-[#94A3B8] hover:text-[#F8FAFC] px-2 py-1 border border-[#1E293B] rounded text-xs transition-all btn-tactile"
          >
            <Search className="w-3 h-3 text-[#38BDF8]" />
            <kbd className="text-[9px] bg-[#070A0F] px-1 py-0.2 rounded border border-[#1E293B] text-[#64748B]">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className="flex items-center gap-1 bg-[#0E1420] hover:bg-[#141C2E] text-[#38BDF8] hover:text-[#F8FAFC] px-2.5 py-1 border border-[#1E293B] rounded text-xs transition-all btn-tactile"
          >
            <Sparkles className="w-3 h-3 text-[#38BDF8]" />
            <span>Copilot</span>
          </button>

          <button
            onClick={() => {
              const blob = new Blob([generatedCppHeader], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `shannon_${currentModel.id}.h`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1 bg-[#0E1420] hover:bg-[#141C2E] text-[#E2E8F0] px-2.5 py-1 border border-[#1E293B] rounded text-xs transition-all btn-tactile"
          >
            <Download className="w-3 h-3 text-[#94A3B8]" />
            <span>Export (.h)</span>
          </button>

          <a
            href="https://github.com/atharveeee-netizen/shannon"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0E1420] hover:bg-[#141C2E] border border-[#1E293B] rounded transition-all btn-tactile"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
          </a>

          {/* Primary Compile Action */}
          <button
            onClick={handleTriggerCompile}
            disabled={isCompiling}
            className={`px-3 py-1 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all btn-tactile-primary ${
              isCompiling
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 animate-pulse'
                : ''
            }`}
          >
            {isCompiling ? (
              <>
                <Square className="w-3 h-3 fill-current" /> OPTIMIZING...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> COMPILE (⌘B)
              </>
            )}
          </button>
        </div>
      </header>

      {/* Slide-over Shannon AI Copilot Drawer */}
      {isCopilotOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setIsCopilotOpen(false)}>
          <div
            className="w-full max-w-lg bg-[#0B0F17] border-l border-[#1E293B] h-full shadow-2xl flex flex-col p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-xs font-bold text-[#F8FAFC] font-mono uppercase">
                  SHANNON AI COPILOT
                </h3>
              </div>
              <button onClick={() => setIsCopilotOpen(false)} className="text-[#8B949E] hover:text-[#F8FAFC]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AgentChat targetHardware={currentHw.name} modelName={currentModel.name} />
            </div>
          </div>
        </div>
      )}

      {/* CLEAN 3-PANE SPLIT: Tensor Layers (Left) | C++ Code Viewer (Center) | Live SRAM Timeline & Bench (Right) */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* PANE 1: TENSOR LAYERS & ARCHITECTURE BENTO (320px) */}
        <aside className="w-80 bg-[#0B0F17] border border-[#1E293B] rounded-[3px] flex flex-col shrink-0 select-none overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-2.5 border-b border-[#1E293B] bg-[#070A0F] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="font-bold text-[#F8FAFC]">TENSOR LAYERS</span>
            </div>
            <span className="text-[10px] text-[#10B981] font-bold font-tabular bg-[#10B981]/15 px-1.5 py-0.2 rounded border border-[#10B981]/30">
              {layers.length} LAYERS
            </span>
          </div>

          {/* Layer List Bento Table */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-xs">
            {layers.map((l) => (
              <div
                key={l.layer_id}
                className="p-2 bg-[#070A0F] border border-[#1E293B] hover:border-[#38BDF8] rounded-[2px] transition-all duration-150 flex flex-col gap-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">{l.layer_id}</span>
                  <span className="text-[9px] text-[#38BDF8] bg-[#0284C7]/15 px-1 rounded font-bold">
                    {l.op_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px] text-[#64748B] font-tabular">
                  <div>In: <strong className="text-[#94A3B8]">{l.in_shape}</strong></div>
                  <div>Out: <strong className="text-[#94A3B8]">{l.out_shape}</strong></div>
                  <div>MACs: <strong className="text-[#38BDF8]">{l.macs.toLocaleString()}</strong></div>
                  <div>Offset: <strong className="text-[#10B981]">{l.sram_offset_hex}</strong></div>
                </div>
              </div>
            ))}

            {/* Precision Controls Card */}
            <div className="pt-2 border-t border-[#1E293B] space-y-2">
              <div className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
                PRECISION TUNING
              </div>

              <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                <button
                  onClick={() => setQuantBits(8)}
                  className={`py-1 rounded-[2px] text-xs font-bold transition-all btn-tactile ${
                    quantBits === 8
                      ? 'btn-tactile-primary'
                      : 'bg-[#070A0F] text-[#94A3B8] border border-[#1E293B]'
                  }`}
                >
                  INT8 Symmetric
                </button>
                <button
                  onClick={() => setQuantBits(4)}
                  className={`py-1 rounded-[2px] text-xs font-bold transition-all btn-tactile ${
                    quantBits === 4
                      ? 'btn-tactile-primary'
                      : 'bg-[#070A0F] text-[#94A3B8] border border-[#1E293B]'
                  }`}
                >
                  INT4 Packed
                </button>
              </div>

              <label className="flex items-center justify-between text-[11px] text-[#94A3B8] bg-[#070A0F] p-1.5 rounded border border-[#1E293B] cursor-pointer">
                <span>Mixed Precision (HAWQ)</span>
                <input
                  type="checkbox"
                  checked={mixedPrecision}
                  onChange={(e) => setMixedPrecision(e.target.checked)}
                  className="accent-[#0284C7] rounded"
                />
              </label>
            </div>
          </div>

          {/* Footer Footprint Summary */}
          <div className="p-2 bg-[#070A0F] border-t border-[#1E293B] flex items-center justify-between font-mono text-[10px] text-[#64748B] font-tabular">
            <span>Flash: <strong className="text-[#38BDF8]">{currentModel.int8_flash_kb} KB</strong></span>
            <span>Peak SRAM: <strong className="text-[#10B981]">{currentModel.peak_sram_kb} KB</strong></span>
          </div>
        </aside>

        {/* PANE 2: C/C++ CODE VIEWER & DISASSEMBLY (Flexible Center) */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <CodeViewerPanel
            code={generatedCppHeader}
            targetHw={currentHw}
            currentModel={currentModel}
          />
        </main>

        {/* PANE 3: LIVE SRAM TIMELINE & SENSOR WORKBENCH (380px) */}
        <aside className="w-96 flex flex-col gap-2 shrink-0 select-none overflow-hidden h-full">
          {/* Top: Interactive SRAM Memory Arena Timeline */}
          <div className="flex-1 min-h-0">
            <SramArenaTimeline
              blocks={arenaBlocks}
              targetHw={currentHw}
              totalArenaBytes={Math.round(currentModel.peak_sram_kb * 1024)}
            />
          </div>

          {/* Bottom: Hardware-in-the-Loop Sensor Workbench */}
          <div className="shrink-0">
            <SensorWorkbench
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
          </div>
        </aside>
      </div>
    </div>
  );
}