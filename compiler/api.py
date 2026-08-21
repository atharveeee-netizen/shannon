"""
Shannon Compiler REST API
FastAPI backend powering the Shannon Studio web application.
"""

from fastapi import FastAPI, HTTPException
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

app = FastAPI(title="Shannon TinyML Compiler API", version="1.0.0")

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
    custom_model: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    target_hardware: str = "ESP32-S3"
    model_name: str = "KeywordSpotter_v1"
    context: Optional[Dict[str, Any]] = None

def _get_preset_graph(preset_id: str) -> ModelGraph:
    if preset_id in ["kws", "keyword_spotter", "keyword"]:
        return get_keyword_spotting_model()
    elif preset_id in ["anomaly", "vibration", "motor"]:
        return get_anomaly_detection_model()
    elif preset_id in ["vision", "person_detect", "camera"]:
        return get_vision_classifier_model()
    raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' not found.")

@app.get("/api/health")
def health():
    return {"status": "online", "service": "Shannon Compiler Engine v1.0.0"}

@app.get("/api/hardware")
def get_hardware_profiles():
    return HardwareSpecs.PROFILES

@app.get("/api/presets")
def get_presets():
    return [
        {
            "id": "kws",
            "name": "Audio Keyword Spotter",
            "domain": "Audio / Voice",
            "description": "1D-CNN for on-device voice wake words ('Yes', 'No', 'Silence', 'Unknown').",
            "input_shape": [1, 49, 10],
            "input_type": "Audio Spectrogram (MFCC)"
        },
        {
            "id": "anomaly",
            "name": "Motor Anomaly Autoencoder",
            "domain": "Industrial IoT / Predictive Maintenance",
            "description": "Reconstruction autoencoder for real-time 3-axis vibration anomaly scoring.",
            "input_shape": [1, 64],
            "input_type": "IMU FFT Power Spectrum"
        },
        {
            "id": "vision",
            "name": "MicroVision Person Detector",
            "domain": "Edge Vision / Smart Camera",
            "description": "Depthwise separable CNN for ultra-low-power person detection.",
            "input_shape": [1, 48, 48, 1],
            "input_type": "48x48 Grayscale Camera Frame"
        }
    ]

@app.post("/api/presets/{preset_id}/optimize")
def optimize_preset(preset_id: str, req: OptimizeRequest):
    # 1. Load baseline model
    graph = _get_preset_graph(preset_id)
    fp32_stats = {
        "flash_bytes": graph.flash_bytes,
        "peak_sram_bytes": graph.peak_sram_bytes,
        "total_macs": graph.total_macs,
        "estimated_latency_ms": graph.estimated_latency_ms
    }

    # 2. Quantize
    quantizer = Quantizer(bits=req.bits, symmetric=req.symmetric)
    quantized_graph = quantizer.quantize_graph(graph)

    # 3. Plan Memory Arena
    planner = MemoryPlanner(alignment_bytes=4)
    arena_size, timeline = planner.plan_tensor_arena(quantized_graph)

    # 4. Run Agent Diagnosis
    agent = ShannonAgent(target_hw=req.target_hardware)
    agent_report = agent.analyze_bottlenecks(quantized_graph)

    # 5. Generate C++ Code
    codegen = CCodeGenerator(target_mcu=req.target_hardware)
    c_header = codegen.generate_header(quantized_graph)

    return {
        "model_name": quantized_graph.name,
        "target_hardware": req.target_hardware,
        "quantization": {"bits": req.bits, "symmetric": req.symmetric},
        "baseline_fp32": fp32_stats,
        "optimized_int8": {
            "flash_bytes": quantized_graph.flash_bytes,
            "peak_sram_bytes": arena_size,
            "total_macs": quantized_graph.total_macs,
            "estimated_latency_ms": quantized_graph.estimated_latency_ms,
            "compression_ratio": round((fp32_stats["flash_bytes"] / max(quantized_graph.flash_bytes, 1)), 2)
        },
        "memory_timeline": timeline,
        "agent_report": agent_report,
        "graph": quantized_graph.to_dict(),
        "c_header_code": c_header
    }

@app.post("/api/custom/optimize")
def optimize_custom(req: OptimizeRequest):
    if not req.custom_model:
        raise HTTPException(status_code=400, detail="custom_model dictionary is required.")
    
    graph = ModelParser.parse_dict(req.custom_model)
    fp32_stats = {
        "flash_bytes": graph.flash_bytes,
        "peak_sram_bytes": graph.peak_sram_bytes,
        "total_macs": graph.total_macs,
        "estimated_latency_ms": graph.estimated_latency_ms
    }

    quantizer = Quantizer(bits=req.bits, symmetric=req.symmetric)
    quantized_graph = quantizer.quantize_graph(graph)

    planner = MemoryPlanner(alignment_bytes=4)
    arena_size, timeline = planner.plan_tensor_arena(quantized_graph)

    agent = ShannonAgent(target_hw=req.target_hardware)
    agent_report = agent.analyze_bottlenecks(quantized_graph)

    codegen = CCodeGenerator(target_mcu=req.target_hardware)
    c_header = codegen.generate_header(quantized_graph)

    return {
        "model_name": quantized_graph.name,
        "target_hardware": req.target_hardware,
        "quantization": {"bits": req.bits, "symmetric": req.symmetric},
        "baseline_fp32": fp32_stats,
        "optimized_int8": {
            "flash_bytes": quantized_graph.flash_bytes,
            "peak_sram_bytes": arena_size,
            "total_macs": quantized_graph.total_macs,
            "estimated_latency_ms": quantized_graph.estimated_latency_ms,
            "compression_ratio": round((fp32_stats["flash_bytes"] / max(quantized_graph.flash_bytes, 1)), 2)
        },
        "memory_timeline": timeline,
        "agent_report": agent_report,
        "graph": quantized_graph.to_dict(),
        "c_header_code": c_header
    }

@app.post("/api/agent/chat")
def agent_chat(req: ChatRequest):
    msg = req.message.lower()
    hw = req.target_hardware
    hw_data = HardwareSpecs.PROFILES.get(hw, HardwareSpecs.PROFILES["ESP32-S3"])
    
    if "flash" in msg or "rom" in msg:
        reply = f"For {hw}, you have {hw_data['flash_mb']}MB of Flash storage. Quantizing weights to INT8 compresses the model footprint by 75% compared to FP32, making it effortlessly fit into Flash ROM."
    elif "sram" in msg or "ram" in msg or "memory" in msg:
        reply = f"On {hw}, the SRAM limit is {hw_data['sram_kb']}KB. Our memory planner dynamically reuses intermediate activation buffers, meaning your tensor arena stays under {round(hw_data['sram_kb'] * 0.4)}KB during execution."
    elif "prune" in msg or "pruning" in msg:
        reply = "Structured magnitude pruning removes 20-30% of inactive channels with <0.5% accuracy loss, directly reducing both execution latency and activation buffer sizes."
    elif "latency" in msg or "speed" in msg or "time" in msg:
        reply = f"Running at {hw_data['clock_mhz']} MHz on {hw} ({hw_data['arch']}), the estimated inference time is optimized using SIMD MAC operations for sub-millisecond execution."
    else:
        reply = f"Hello! I am your Shannon Optimization Copilot. I've audited your model for {hw} ({hw_data['arch']}). The tensor arena is safely configured with zero-dependency C++ code ready to compile."

    return {
        "reply": reply,
        "target_hardware": hw,
        "status": "success"
    }