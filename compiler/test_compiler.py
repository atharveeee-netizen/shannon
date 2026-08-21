"""
Automated Test Suite for Shannon Compiler
"""
import unittest
import numpy as np

from engine.ir import ModelGraph, Tensor, Layer
from engine.quantizer import Quantizer
from engine.memory_planner import MemoryPlanner
from engine.presets import get_keyword_spotting_model, get_anomaly_detection_model, get_vision_classifier_model
from engine.codegen import CCodeGenerator
from agent.optimizer_agent import ShannonAgent

class TestShannonCompiler(unittest.TestCase):
    def test_kws_quantization_and_codegen(self):
        graph = get_keyword_spotting_model()
        self.assertGreater(graph.flash_bytes, 0)
        
        # Test Quantization
        quantizer = Quantizer(bits=8, symmetric=True)
        q_graph = quantizer.quantize_graph(graph)
        
        # Test Memory Planner
        planner = MemoryPlanner(alignment_bytes=4)
        arena_size, timeline = planner.plan_tensor_arena(q_graph)
        self.assertGreater(arena_size, 0)
        self.assertEqual(len(timeline), len(q_graph.layers))

        # Test Agent Audit
        agent = ShannonAgent(target_hw="ESP32-S3")
        report = agent.analyze_bottlenecks(q_graph)
        self.assertTrue(report["fits_hardware"])

        # Test C Codegen
        codegen = CCodeGenerator(target_mcu="ESP32-S3")
        c_code = codegen.generate_header(q_graph)
        self.assertIn("shannon_run_inference", c_code)
        self.assertIn("SHANNON_ARENA_SIZE", c_code)
        self.assertIn("shannon_tensor_arena", c_code)

    def test_anomaly_model_pipeline(self):
        graph = get_anomaly_detection_model()
        quantizer = Quantizer(bits=8)
        q_graph = quantizer.quantize_graph(graph)
        planner = MemoryPlanner()
        arena_size, _ = planner.plan_tensor_arena(q_graph)
        self.assertGreater(arena_size, 0)

    def test_vision_model_pipeline(self):
        graph = get_vision_classifier_model()
        quantizer = Quantizer(bits=8)
        q_graph = quantizer.quantize_graph(graph)
        planner = MemoryPlanner()
        arena_size, _ = planner.plan_tensor_arena(q_graph)
        self.assertGreater(arena_size, 0)
        agent = ShannonAgent("STM32H7")
        report = agent.analyze_bottlenecks(q_graph)
        self.assertEqual(report["agent_verdict"], "READY_FOR_DEPLOYMENT")

if __name__ == "__main__":
    unittest.main()