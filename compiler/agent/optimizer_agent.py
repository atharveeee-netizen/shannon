"""
Shannon Autonomous Hardware Optimizer Agent
Reasons over microcontroller memory budgets, layer compute intensity, and suggests optimizations.
"""

from typing import Dict, Any, List
try:
    from engine.ir import ModelGraph
except ImportError:
    from .engine.ir import ModelGraph

class HardwareSpecs:
    PROFILES = {
        "ESP32-S3": {"sram_kb": 512, "flash_mb": 8, "clock_mhz": 240, "arch": "Xtensa LX7 + Vector Ext"},
        "STM32H7": {"sram_kb": 1024, "flash_mb": 2, "clock_mhz": 480, "arch": "ARM Cortex-M7 + CMSIS-NN"},
        "RP2040 (Pico)": {"sram_kb": 264, "flash_mb": 2, "clock_mhz": 133, "arch": "Dual ARM Cortex-M0+"},
        "nRF52840": {"sram_kb": 256, "flash_mb": 1, "clock_mhz": 64, "arch": "ARM Cortex-M4F"},
        "Arduino Portenta H7": {"sram_kb": 1024, "flash_mb": 16, "clock_mhz": 480, "arch": "Dual M7/M4 + SDRAM"}
    }

class ShannonAgent:
    def __init__(self, target_hw: str = "ESP32-S3"):
        self.target_hw = target_hw
        self.hw_info = HardwareSpecs.PROFILES.get(target_hw, HardwareSpecs.PROFILES["ESP32-S3"])

    def analyze_bottlenecks(self, graph: ModelGraph) -> Dict[str, Any]:
        """
        Audits graph against target hardware limits and generates diagnostic advice.
        """
        sram_limit_bytes = self.hw_info["sram_kb"] * 1024
        flash_limit_bytes = self.hw_info["flash_mb"] * 1024 * 1024

        sram_pct = (graph.peak_sram_bytes / sram_limit_bytes) * 100.0
        flash_pct = (graph.flash_bytes / flash_limit_bytes) * 100.0

        bottlenecks: List[Dict[str, Any]] = []
        recommendations: List[str] = []

        # Check memory fit
        fits_sram = graph.peak_sram_bytes <= sram_limit_bytes
        fits_flash = graph.flash_bytes <= flash_limit_bytes

        if not fits_sram:
            bottlenecks.append({
                "severity": "CRITICAL",
                "type": "SRAM_OVERFLOW",
                "message": f"Model requires {round(graph.peak_sram_bytes/1024, 1)} KB SRAM, exceeding {self.target_hw}'s {self.hw_info['sram_kb']} KB limit."
            })
            recommendations.append("Apply structured weight pruning on early dense/conv layers to reduce activation buffer size.")
        elif sram_pct > 70.0:
            bottlenecks.append({
                "severity": "WARNING",
                "type": "HIGH_SRAM_UTILIZATION",
                "message": f"Peak SRAM usage is {round(sram_pct, 1)}% ({round(graph.peak_sram_bytes/1024, 1)} KB). Leaves tight room for networking stacks."
            })
            recommendations.append("Enable 4-byte memory arena buffer reuse in memory planner.")

        # Inspect layer compute distribution
        if graph.layers:
            max_mac_layer = max(graph.layers, key=lambda l: l.macs)
            if max_mac_layer.macs > 0.4 * max(graph.total_macs, 1):
                bottlenecks.append({
                    "severity": "INFO",
                    "type": "COMPUTE_HOTSPOT",
                    "message": f"Layer '{max_mac_layer.layer_id}' ({max_mac_layer.op_type}) consumes {round((max_mac_layer.macs/graph.total_macs)*100, 1)}% of total MACs."
                })
                if max_mac_layer.op_type == "Conv2D":
                    recommendations.append(f"Convert '{max_mac_layer.layer_id}' into a Depthwise Separable Conv2D to reduce operations by up to 8x.")

        recommendations.append("Applied INT8 symmetric quantization: reduced Flash footprint by 75% compared to FP32.")
        recommendations.append(f"Generated zero-dependency static C header tuned for {self.hw_info['arch']}.")

        return {
            "target_hardware": self.target_hw,
            "hardware_specs": self.hw_info,
            "fits_hardware": fits_sram and fits_flash,
            "sram_usage_bytes": graph.peak_sram_bytes,
            "sram_capacity_bytes": sram_limit_bytes,
            "sram_utilization_pct": round(sram_pct, 2),
            "flash_usage_bytes": graph.flash_bytes,
            "flash_capacity_bytes": flash_limit_bytes,
            "flash_utilization_pct": round(flash_pct, 2),
            "estimated_latency_ms": graph.estimated_latency_ms,
            "bottlenecks": bottlenecks,
            "recommendations": recommendations,
            "agent_verdict": "READY_FOR_DEPLOYMENT" if fits_sram and fits_flash else "REQUIRES_PRUNING"
        }