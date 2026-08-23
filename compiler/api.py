"""
Shannon TinyML Compiler REST API
Production-grade FastAPI backend powering the Shannon Studio web application.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import numpy as np

try:
    from engine.ir import ModelGraph
    from engine.quantizer import Quantizer
    from engine.memory_planner import MemoryPlanner
    from engine.presets import get_keyword_spotting_model, get_anomaly_detection_model, get_vision_classifier_model
    from engine.codegen import CCodeGenerator
    from engine.parser import ModelParser
    from agent.optimizer_agent import ShannonAgent, HardwareSpecs
except ImportError:
    from .engine.ir import ModelGraph
    from .engine.quantizer import Quantizer
    from .engine.memory_planner import MemoryPlanner
    from .engine.presets import get_keyword_spotting_model, get_anomaly_detection_model, get_vision_classifier_model
    from .engine.codegen import CCodeGenerator
    from .engine.parser import ModelParser
    from .agent.optimizer_agent import ShannonAgent, HardwareSpecs

app = FastAPI(
    title="Shannon TinyML Compiler Studio API",
    version="2.4.0",
    description="Autonomous Compiler & Hardware Optimization Engine for Microcontrollers (Zero-Malloc TinyML)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizeRequest(BaseModel):
    target_hardware: str = "ESP32-S3"
    bits: int = 8
    symmetric: bool = True
    mixed_precision: bool = False
    custom_model: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: Optional[str] = None
    query: Optional[str] = None
    target_hardware: Optional[str] = None
    target_hw: Optional[str] = None
    model_name: Optional[str] = "KeywordSpotter_v1"
    context: Optional[Dict[str, Any]] = None

def _get_preset_graph(preset_id: str) -> ModelGraph:
    pid = preset_id.lower().strip()
    if pid in ["kws", "keyword_spotter", "keyword", "audio"]:
        return get_keyword_spotting_model()
    elif pid in ["anomaly", "vibration", "motor", "autoencoder"]:
        return get_anomaly_detection_model()
    elif pid in ["vision", "person_detect", "camera", "microvision"]:
        return get_vision_classifier_model()
    raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' not found. Available: kws, anomaly, vision.")

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "service": "Shannon Autonomous Compiler Engine",
        "version": "2.4.0",
        "supported_mcu": list(HardwareSpecs.PROFILES.keys()),
        "zero_malloc_verified": True
    }

@app.get("/api/hardware")
def get_hardware_profiles():
    return HardwareSpecs.PROFILES

@app.get("/api/presets")
def get_presets():
    return [
        {
            "id": "kws",
            "name": "Audio Keyword Spotter",
            "domain": "Voice Wake-Word",
            "architecture": "1D Depthwise-Separable CNN",
            "dataset": "Google Speech Commands v2",
            "description": "1D-CNN detecting wake words ('Yes', 'No', 'Silence', 'Unknown') on 49x10 MFCC spectrograms.",
            "input_shape": [1, 49, 10],
            "input_type": "Audio Spectrogram (MFCC 16kHz PCM)"
        },
        {
            "id": "anomaly",
            "name": "Motor Anomaly Autoencoder",
            "domain": "Industrial Predictive Maintenance",
            "architecture": "5-Layer Deep Autoencoder",
            "dataset": "NASA Bearing Vibration Dataset",
            "description": "Reconstruction autoencoder for real-time 3-axis vibration anomaly scoring.",
            "input_shape": [1, 64],
            "input_type": "IMU FFT Power Spectrum"
        },
        {
            "id": "vision",
            "name": "MicroVision Person Detector",
            "domain": "Edge Computer Vision",
            "architecture": "MobileNet-Tiny (0.25x Depthwise-Separable)",
            "dataset": "Visual Wake Words (VWW)",
            "description": "Ultra-low-power person detector classifying presence on 48x48 grayscale camera frames.",
            "input_shape": [1, 48, 48, 1],
            "input_type": "48x48 Grayscale Camera Frame"
        }
    ]

@app.post("/api/presets/{preset_id}/optimize")
@app.post("/api/compile-preset/{preset_id}")
def optimize_preset(preset_id: str, req: Optional[OptimizeRequest] = None, target_hw: Optional[str] = Query(None)):
    hw = (req.target_hardware if req else None) or target_hw or "ESP32-S3"
    bits = req.bits if req else 8
    symmetric = req.symmetric if req else True
    mixed_precision = req.mixed_precision if req else False

    # 1. Load baseline model graph
    graph = _get_preset_graph(preset_id)
    fp32_stats = {
        "flash_bytes": graph.flash_bytes,
        "peak_sram_bytes": graph.peak_sram_bytes,
        "total_macs": graph.total_macs,
        "estimated_latency_ms": graph.estimated_latency_ms
    }

    # 2. Quantize weights & tensors
    quantizer = Quantizer(bits=bits, symmetric=symmetric, mixed_precision=mixed_precision)
    quantized_graph = quantizer.quantize_graph(graph)

    # 3. Plan Memory Arena (0 Bytes runtime malloc)
    planner = MemoryPlanner(alignment_bytes=4, base_address_hex=0x20000000)
    arena_size, timeline = planner.plan_tensor_arena(quantized_graph)
    is_collision_free = planner.verify_zero_collisions(quantized_graph)

    # 4. Run Agent Diagnosis & Bottleneck Analysis
    agent = ShannonAgent(target_hw=hw)
    agent_report = agent.analyze_bottlenecks(quantized_graph)

    # 5. Generate Standalone C/C++ Header
    codegen = CCodeGenerator(target_mcu=hw)
    c_header = codegen.generate_header(quantized_graph)

    return {
        "model_name": quantized_graph.name,
        "target_hardware": hw,
        "quantization": {
            "bits": bits,
            "symmetric": symmetric,
            "mixed_precision": mixed_precision
        },
        "baseline_fp32": fp32_stats,
        "optimized_int8": {
            "flash_bytes": quantized_graph.flash_bytes,
            "peak_sram_bytes": arena_size,
            "total_macs": quantized_graph.total_macs,
            "estimated_latency_ms": quantized_graph.estimated_latency_ms,
            "compression_ratio": round((fp32_stats["flash_bytes"] / max(quantized_graph.flash_bytes, 1)), 2),
            "flash_reduction_pct": round((1.0 - (quantized_graph.flash_bytes / max(fp32_stats["flash_bytes"], 1))) * 100.0, 1)
        },
        "fits_hardware": agent_report["fits_hardware"],
        "zero_malloc_verified": is_collision_free,
        "memory_timeline": timeline,
        "agent_report": agent_report,
        "graph": quantized_graph.to_dict(),
        "c_header_code": c_header,
        "code": c_header,
        "bottlenecks": [b["message"] for b in agent_report.get("bottlenecks", [])],
        "recommendations": agent_report.get("recommendations", [])
    }

@app.post("/api/custom/optimize")
def optimize_custom(req: OptimizeRequest):
    if not req.custom_model:
        raise HTTPException(status_code=400, detail="custom_model dictionary definition is required.")
    
    graph = ModelParser.parse_dict(req.custom_model)
    fp32_stats = {
        "flash_bytes": graph.flash_bytes,
        "peak_sram_bytes": graph.peak_sram_bytes,
        "total_macs": graph.total_macs,
        "estimated_latency_ms": graph.estimated_latency_ms
    }

    quantizer = Quantizer(bits=req.bits, symmetric=req.symmetric, mixed_precision=req.mixed_precision)
    quantized_graph = quantizer.quantize_graph(graph)

    planner = MemoryPlanner(alignment_bytes=4, base_address_hex=0x20000000)
    arena_size, timeline = planner.plan_tensor_arena(quantized_graph)
    is_collision_free = planner.verify_zero_collisions(quantized_graph)

    agent = ShannonAgent(target_hw=req.target_hardware)
    agent_report = agent.analyze_bottlenecks(quantized_graph)

    codegen = CCodeGenerator(target_mcu=req.target_hardware)
    c_header = codegen.generate_header(quantized_graph)

    return {
        "model_name": quantized_graph.name,
        "target_hardware": req.target_hardware,
        "quantization": {"bits": req.bits, "symmetric": req.symmetric, "mixed_precision": req.mixed_precision},
        "baseline_fp32": fp32_stats,
        "optimized_int8": {
            "flash_bytes": quantized_graph.flash_bytes,
            "peak_sram_bytes": arena_size,
            "total_macs": quantized_graph.total_macs,
            "estimated_latency_ms": quantized_graph.estimated_latency_ms,
            "compression_ratio": round((fp32_stats["flash_bytes"] / max(quantized_graph.flash_bytes, 1)), 2),
            "flash_reduction_pct": round((1.0 - (quantized_graph.flash_bytes / max(fp32_stats["flash_bytes"], 1))) * 100.0, 1)
        },
        "fits_hardware": agent_report["fits_hardware"],
        "zero_malloc_verified": is_collision_free,
        "memory_timeline": timeline,
        "agent_report": agent_report,
        "graph": quantized_graph.to_dict(),
        "c_header_code": c_header,
        "code": c_header
    }

@app.post("/api/agent/chat")
def agent_chat(req: ChatRequest):
    user_msg = req.message or req.query or ""
    hw = req.target_hardware or req.target_hw or "ESP32-S3"
    model_name = req.model_name or "KeywordSpotter_v1"
    
    agent = ShannonAgent(target_hw=hw)
    reply = agent.chat_reasoning(user_query=user_msg, model_name=model_name, context=req.context)

    return {
        "reply": reply,
        "response": reply,
        "target_hardware": hw,
        "model_name": model_name,
        "status": "success"
    }

@app.get("/api/benchmark")
def get_benchmark_matrix():
    """
    Returns full benchmark matrix across all 3 models and 5 microcontroller targets.
    """
    targets = list(HardwareSpecs.PROFILES.keys())
    models = ["kws", "anomaly", "vision"]
    
    matrix = []
    for m in models:
        g = _get_preset_graph(m)
        fp32_flash = g.flash_bytes
        
        q = Quantizer(bits=8, symmetric=True)
        q_g = q.quantize_graph(g)
        
        planner = MemoryPlanner(alignment_bytes=4)
        sram, _ = planner.plan_tensor_arena(q_g)
        
        target_evals = {}
        for hw in targets:
            agent = ShannonAgent(target_hw=hw)
            rep = agent.analyze_bottlenecks(q_g)
            target_evals[hw] = {
                "fits": rep["fits_hardware"],
                "sram_util_pct": rep["sram_utilization_pct"],
                "flash_util_pct": rep["flash_utilization_pct"],
                "latency_ms": rep["estimated_latency_ms"]
            }
            
        matrix.append({
            "model_id": m,
            "model_name": q_g.name,
            "fp32_flash_bytes": fp32_flash,
            "int8_flash_bytes": q_g.flash_bytes,
            "peak_sram_bytes": sram,
            "mac_count": q_g.total_macs,
            "compression_ratio": f"{round(fp32_flash / max(q_g.flash_bytes, 1), 1)}x",
            "targets": target_evals
        })
        
    return {
        "benchmarks": matrix,
        "hardware_profiles": HardwareSpecs.PROFILES
    }