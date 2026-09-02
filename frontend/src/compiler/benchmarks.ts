import { ModelGraph } from './ir';
import { TargetBenchmarkEntry, HardwareProfile } from '../types';

export const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'ESP32-S3',
    name: 'ESP32-S3',
    sram_kb: 512,
    flash_mb: 8,
    clock_mhz: 240,
    arch: 'Xtensa Dual LX7 + Vector',
    simd: 'Xtensa PIE (8-bit SIMD)',
    active_ma: 50.0,
    sleep_ua: 10.0,
  },
  {
    id: 'STM32H7',
    name: 'STM32H7',
    sram_kb: 1024,
    flash_mb: 2,
    clock_mhz: 480,
    arch: 'ARM Cortex-M7',
    simd: 'ARM CMSIS-NN __SMLAD (Dual 16-bit MAC)',
    active_ma: 90.0,
    sleep_ua: 15.0,
  },
  {
    id: 'RP2040',
    name: 'RP2040',
    sram_kb: 264,
    flash_mb: 2,
    clock_mhz: 133,
    arch: 'Dual ARM Cortex-M0+',
    simd: '32-bit software unrolled',
    active_ma: 25.0,
    sleep_ua: 8.0,
  },
  {
    id: 'nRF52840',
    name: 'nRF52840',
    sram_kb: 256,
    flash_mb: 1,
    clock_mhz: 64,
    arch: 'ARM Cortex-M4F',
    simd: 'ARMv7E-M DSP Instructions',
    active_ma: 18.0,
    sleep_ua: 2.5,
  },
  {
    id: 'Teensy41',
    name: 'Teensy 4.1',
    sram_kb: 1024,
    flash_mb: 8,
    clock_mhz: 600,
    arch: 'ARM Cortex-M7 @ 600MHz',
    simd: 'ARM DWT + CMSIS-NN 4-way SIMD',
    active_ma: 100.0,
    sleep_ua: 20.0,
  },
];

export function evaluateMultiTargetBenchmarks(graph: ModelGraph): TargetBenchmarkEntry[] {
  return HARDWARE_PROFILES.map((hw) => {
    const flashKb = graph.flash_bytes / 1024;
    const sramKb = graph.peak_sram_bytes / 1024;

    const flashLimitKb = hw.flash_mb * 1024;
    const sramLimitKb = hw.sram_kb;

    const flashPct = Math.min(100, (flashKb / flashLimitKb) * 100);
    const sramPct = Math.min(100, (sramKb / sramLimitKb) * 100);

    const fits = flashKb <= flashLimitKb && sramKb <= sramLimitKb;

    // Latency model: MACs / (ClockMHz * SIMD efficiency factor)
    const simdFactor = hw.arch.includes('M7') ? 1.8 : hw.arch.includes('Vector') ? 1.6 : hw.arch.includes('M4') ? 1.2 : 0.8;
    const latencyMs = Number(((graph.total_macs / (hw.clock_mhz * 1000 * simdFactor)) * 1.3).toFixed(2));

    return {
      hardware_id: hw.id,
      hardware_name: hw.name,
      arch: hw.arch,
      clock_mhz: hw.clock_mhz,
      flash_total_kb: flashLimitKb,
      sram_total_kb: sramLimitKb,
      flash_utilization_pct: Number(flashPct.toFixed(2)),
      sram_utilization_pct: Number(sramPct.toFixed(2)),
      estimated_latency_ms: Math.max(0.05, latencyMs),
      fits,
      provenance: 'Compiler Static Cycle Model',
    };
  });
}
