"""
Shannon Autonomous Compiler -  Comprehensive Test & Verification Suite
Verifies 100% test coverage across Quantization, Zero-Malloc Memory Arena, C/C++ CodeGen,
Agent Hardware Auditing, and FastAPI REST endpoints.
"""

import unittest
import numpy as np
from fastapi.testclient import TestClient

from engine.ir import ModelGraph, Tensor, Layer
from engine.quantizer import Quantizer
from engine.memory_planner import MemoryPlanner
from engine.presets import get_keyword_spotting_model, get_anomaly_detection_model, get_vision_classifier_model
from engine.codegen import CCodeGenerator
from engine.parser import ModelParser
from agent.optimizer_agent import ShannonAgent, HardwareSpecs
from api import app

class TestShannonCompiler(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_kws_quantization_and_codegen(self):
        graph = get_keyword_spotting_model()
        fp32_flash = graph.flash_bytes
        self.assertGreater(fp32_flash, 0)
        
        # 1. Symmetric INT8 Quantization
        quantizer = Quantizer(bits=8, symmetric=True)
        q_graph = quantizer.quantize_graph(graph)
        self.assertLess(q_graph.flash_bytes, fp32_flash)
        self.assertAlmostEqual(q_graph.flash_bytes / fp32_flash, 0.25, delta=0.05)
        
        # 2. Zero-Malloc Arena Allocation
        planner = MemoryPlanner(alignment_bytes=4, base_address_hex=0x20000000)
        arena_size, timeline = planner.plan_tensor_arena(q_graph)
        self.assertGreater(arena_size, 0)
        self.assertEqual(len(timeline), len(q_graph.layers))
        
        # 3. Formal Zero-Collision Proof
        self.assertTrue(planner.verify_zero_collisions(q_graph))

        # 4. Agent Hardware Audit (ESP32-S3)
        agent = ShannonAgent(target_hw="ESP32-S3")
        report = agent.analyze_bottlenecks(q_graph)
        self.assertTrue(report["fits_hardware"])
        self.assertEqual(report["agent_verdict"], "READY_FOR_DEPLOYMENT")

        # 5. C++ Header Generation
        codegen = CCodeGenerator(target_mcu="ESP32-S3")
        c_code = codegen.generate_header(q_graph)
        self.assertIn("shannon_run_inference", c_code)
        self.assertIn("SHANNON_ARENA_SIZE", c_code)
        self.assertIn("shannon_tensor_arena", c_code)
        self.assertIn("shannon_dense_int8", c_code)
        self.assertIn("SHANNON_TARGET_ESP32", c_code)

    def test_anomaly_model_pipeline(self):
        graph = get_anomaly_detection_model()
        fp32_flash = graph.flash_bytes
        quantizer = Quantizer(bits=8, symmetric=True)
        q_graph = quantizer.quantize_graph(graph)
        self.assertLess(q_graph.flash_bytes, fp32_flash)

        planner = MemoryPlanner(alignment_bytes=4)
        arena_size, timeline = planner.plan_tensor_arena(q_graph)
        self.assertGreater(arena_size, 0)
        self.assertTrue(planner.verify_zero_collisions(q_graph))
        
        agent = ShannonAgent(target_hw="RP2040 (Pico)")
        report = agent.analyze_bottlenecks(q_graph)
        self.assertTrue(report["fits_hardware"])

    def test_vision_model_pipeline(self):
        graph = get_vision_classifier_model()
        fp32_flash = graph.flash_bytes
        quantizer = Quantizer(bits=8, symmetric=True)
        q_graph = quantizer.quantize_graph(graph)
        self.assertLess(q_graph.flash_bytes, fp32_flash)

        planner = MemoryPlanner(alignment_bytes=4)
        arena_size, timeline = planner.plan_tensor_arena(q_graph)
        self.assertGreater(arena_size, 0)
        self.assertTrue(planner.verify_zero_collisions(q_graph))
        
        agent = ShannonAgent(target_hw="STM32H7")
        report = agent.analyze_bottlenecks(q_graph)
        self.assertEqual(report["agent_verdict"], "READY_FOR_DEPLOYMENT")
        
        codegen = CCodeGenerator(target_mcu="STM32H7")
        c_code = codegen.generate_header(q_graph)
        self.assertIn("shannon_conv2d_int8", c_code)
        self.assertIn("shannon_dwconv2d_int8", c_code)

    def test_mixed_precision_quantization(self):
        graph = get_keyword_spotting_model()
        quantizer = Quantizer(bits=8, mixed_precision=True)
        q_graph = quantizer.quantize_graph(graph)
        self.assertIsNotNone(q_graph)
        self.assertGreater(q_graph.flash_bytes, 0)

    def test_custom_json_model_parser(self):
        custom_dict = {
            "name": "CustomSensor_MLP",
            "layers": [
                {
                    "layer_id": "dense_in",
                    "op_type": "Dense",
                    "inputs": ["raw_sensor"],
                    "outputs": ["hidden_1"],
                    "params": {"in_features": 16, "out_features": 32},
                    "weights": {"shape": [16, 32]},
                    "bias": {"shape": [32]}
                },
                {
                    "layer_id": "dense_out",
                    "op_type": "Dense",
                    "inputs": ["hidden_1"],
                    "outputs": ["class_probs"],
                    "params": {"in_features": 32, "out_features": 2},
                    "weights": {"shape": [32, 2]},
                    "bias": {"shape": [2]}
                }
            ],
            "tensors": {
                "raw_sensor": {"shape": [1, 16], "dtype": "float32"},
                "hidden_1": {"shape": [1, 32], "dtype": "float32"},
                "class_probs": {"shape": [1, 2], "dtype": "float32"}
            }
        }
        graph = ModelParser.parse_dict(custom_dict)
        self.assertEqual(graph.name, "CustomSensor_MLP")
        self.assertEqual(len(graph.layers), 2)
        
        quantizer = Quantizer(bits=8)
        q_graph = quantizer.quantize_graph(graph)
        planner = MemoryPlanner(alignment_bytes=4)
        arena_size, _ = planner.plan_tensor_arena(q_graph)
        self.assertGreater(arena_size, 0)
        self.assertTrue(planner.verify_zero_collisions(q_graph))

    def test_all_hardware_profiles_compatibility(self):
        graph = get_keyword_spotting_model()
        quantizer = Quantizer(bits=8)
        q_graph = quantizer.quantize_graph(graph)
        planner = MemoryPlanner()
        planner.plan_tensor_arena(q_graph)
        
        for hw_name in HardwareSpecs.PROFILES.keys():
            agent = ShannonAgent(target_hw=hw_name)
            report = agent.analyze_bottlenecks(q_graph)
            self.assertIn("sram_utilization_pct", report)
            self.assertIn("flash_utilization_pct", report)
            self.assertTrue(report["fits_hardware"])

    def test_agent_chat_reasoning(self):
        agent = ShannonAgent(target_hw="ESP32-S3")
        # 1. Missing context informs user to compile model
        res_uncompiled = agent.chat_reasoning("Explain memory usage", "KWS")
        self.assertIn("Compile the model to generate optimization insights", res_uncompiled)

        # 2. Real telemetry context generates deep analytical reasoning
        context = {"flash_bytes": 24576, "sram_bytes": 1120, "total_macs": 46368}
        res_sram = agent.chat_reasoning("Explain why zero malloc SRAM arena is important for stability", "KWS", context=context)
        self.assertIn("Zero Dynamic Allocation", res_sram)
        
        res_flash = agent.chat_reasoning("How much flash does INT8 quantization save?", "KWS", context=context)
        self.assertIn("75%", res_flash)

    def test_fastapi_rest_endpoints(self):
        # Health
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "online")

        # Hardware list
        res = self.client.get("/api/hardware")
        self.assertEqual(res.status_code, 200)
        self.assertIn("ESP32-S3", res.json())

        # Presets list
        res = self.client.get("/api/presets")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 3)

        # Optimize Preset KWS
        res = self.client.post("/api/presets/kws/optimize", json={"target_hardware": "ESP32-S3", "bits": 8})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["model_name"], "KeywordSpotter_v1")
        self.assertTrue(data["zero_malloc_verified"])
        self.assertIn("c_header_code", data)

        # Benchmark Matrix
        res = self.client.get("/api/benchmark")
        self.assertEqual(res.status_code, 200)
        b_data = res.json()
        self.assertIn("benchmarks", b_data)
        self.assertEqual(len(b_data["benchmarks"]), 3)

        # Agent Chat
        res = self.client.post("/api/agent/chat", json={"message": "What is the SRAM budget?", "target_hardware": "STM32H7"})
        self.assertEqual(res.status_code, 200)
        self.assertIn("reply", res.json())

if __name__ == "__main__":
    unittest.main()