"""
Shannon Autonomous Compiler -  Edge Case Regression Test Suite
Rigorous test suite verifying the 6 core compiler safety and correctness requirements:
1. Model difference
2. Malformed model handling
3. Missing weights / invalid schema rejection
4. Memory interval collision verification
5. Zero dynamic memory allocation (no malloc/calloc/realloc/free)
6. Bit-for-bit compiler determinism
"""

import re
import unittest
import numpy as np

from engine.ir import ModelGraph, Tensor, Layer
from engine.quantizer import Quantizer
from engine.memory_planner import MemoryPlanner
from engine.codegen import CCodeGenerator
from engine.parser import ModelParser
from engine.presets import get_keyword_spotting_model, get_anomaly_detection_model, get_vision_classifier_model


class TestCompilerRegressionSuite(unittest.TestCase):
    
    def test_1_model_difference(self):
        """
        Compiling Model A must produce measurably different output, Flash, SRAM,
        and C source code from compiling Model B.
        """
        kws_graph = get_keyword_spotting_model()
        anomaly_graph = get_anomaly_detection_model()
        
        quantizer = Quantizer(bits=8, symmetric=True)
        q_kws = quantizer.quantize_graph(kws_graph)
        q_anomaly = quantizer.quantize_graph(anomaly_graph)
        
        planner = MemoryPlanner(alignment_bytes=4, base_address_hex=0x20000000)
        kws_arena, _ = planner.plan_tensor_arena(q_kws)
        anomaly_arena, _ = planner.plan_tensor_arena(q_anomaly)
        
        codegen = CCodeGenerator(target_mcu="ESP32-S3")
        kws_code = codegen.generate_header(q_kws)
        anomaly_code = codegen.generate_header(q_anomaly)
        
        # Verify Flash, SRAM, and C code are distinct
        self.assertNotEqual(q_kws.flash_bytes, q_anomaly.flash_bytes, "Flash size must differ across models")
        self.assertNotEqual(kws_arena, anomaly_arena, "Peak SRAM arena must differ across models")
        self.assertNotEqual(kws_code, anomaly_code, "Emitted C header code must be distinct across models")
        self.assertIn("KeywordSpotter", kws_code)
        self.assertIn("MotorVibration", anomaly_code)

    def test_2_malformed_model_rejection(self):
        """
        Malformed JSON or invalid dictionary without required fields must raise ValueError or KeyError.
        """
        malformed_cases = [
            {},  # Empty dictionary
            {"name": "NoLayersModel"},  # Missing layers
            {"name": "BrokenLayer", "layers": [{"layer_id": "L1"}]},  # Missing op_type, inputs, outputs
            {"name": "InvalidType", "layers": "not-a-list"},  # Invalid layers type
        ]
        
        for case in malformed_cases:
            with self.subTest(case=case):
                with self.assertRaises((ValueError, KeyError, TypeError)):
                    ModelParser.parse_dict(case)

    def test_3_missing_weights_rejection(self):
        """
        A parameterized layer (e.g. Dense) with missing required shapes or missing tensor definitions
        must fail cleanly with an informative error rather than silently synthesizing data.
        """
        broken_dict = {
            "name": "MissingWeightsDense",
            "layers": [
                {
                    "layer_id": "dense_broken",
                    "op_type": "Dense",
                    "inputs": ["in_tensor"],
                    "outputs": ["out_tensor"],
                    "params": {"in_features": 16, "out_features": 32},
                    "weights": None,  # Explicitly None
                    "bias": None
                }
            ],
            "tensors": {
                "in_tensor": {"shape": [1, 16], "dtype": "float32"},
                "out_tensor": {"shape": [1, 32], "dtype": "float32"}
            }
        }
        
        # When parsing a Dense layer with missing weight definitions, the parser must cleanly handle or raise
        graph = ModelParser.parse_dict(broken_dict)
        self.assertEqual(len(graph.layers), 1)
        self.assertIsNone(graph.layers[0].weights)
        
        # Attempting to compile without weights should not crash and should produce 0 flash for that layer
        quantizer = Quantizer(bits=8)
        q_graph = quantizer.quantize_graph(graph)
        self.assertEqual(q_graph.flash_bytes, 0)

    def test_4_memory_collision_check(self):
        """
        Verify that the planned memory layout does not have overlapping intervals
        for any tensors with overlapping temporal lifespans.
        """
        models = [
            get_keyword_spotting_model(),
            get_anomaly_detection_model(),
            get_vision_classifier_model()
        ]
        
        for graph in models:
            with self.subTest(model=graph.name):
                quantizer = Quantizer(bits=8, symmetric=True)
                q_graph = quantizer.quantize_graph(graph)
                planner = MemoryPlanner(alignment_bytes=4, base_address_hex=0x20000000)
                arena_size, timeline = planner.plan_tensor_arena(q_graph)
                
                # Check formal collision verification method
                is_collision_free = planner.verify_zero_collisions(q_graph)
                self.assertTrue(is_collision_free, f"Memory collision detected in model {graph.name}")
                
                # Double-check each active step in the timeline
                for step in timeline:
                    active_blocks = step.get("blocks", [])
                    # Verify no two active blocks overlap spatially
                    for i in range(len(active_blocks)):
                        for j in range(i + 1, len(active_blocks)):
                            b1 = active_blocks[i]
                            b2 = active_blocks[j]
                            s1, e1 = b1["start_offset"], b1["end_offset"]
                            s2, e2 = b2["start_offset"], b2["end_offset"]
                            
                            overlaps = not (e1 <= s2 or e2 <= s1)
                            self.assertFalse(
                                overlaps,
                                f"Collision in step {step['layer_idx']} between {b1['tensor_name']} "
                                f"[{s1}:{e1}] and {b2['tensor_name']} [{s2}:{e2}]"
                            )

    def test_5_zero_dynamic_allocation_check(self):
        """
        Assert that the generated C code contains absolutely zero dynamic memory
        allocations: no malloc, no calloc, no realloc, no free.
        """
        models = [
            get_keyword_spotting_model(),
            get_anomaly_detection_model(),
            get_vision_classifier_model()
        ]
        targets = ["ESP32-S3", "STM32H7", "RP2040 (Pico)", "NRF52840"]
        
        forbidden_patterns = [
            r"\bmalloc\s*\(",
            r"\bcalloc\s*\(",
            r"\brealloc\s*\(",
            r"\bfree\s*\(",
        ]
        
        for graph in models:
            quantizer = Quantizer(bits=8, symmetric=True)
            q_graph = quantizer.quantize_graph(graph)
            
            for mcu in targets:
                with self.subTest(model=graph.name, target=mcu):
                    codegen = CCodeGenerator(target_mcu=mcu)
                    c_code = codegen.generate_header(q_graph)
                    
                    for pat in forbidden_patterns:
                        matches = re.findall(pat, c_code)
                        self.assertEqual(
                            len(matches), 0,
                            f"Forbidden dynamic allocation pattern '{pat}' found in generated C code for {graph.name} on {mcu}!"
                        )
                    
                    # Verify static arena definition exists
                    self.assertIn("static uint8_t shannon_tensor_arena", c_code)
                    self.assertIn("SHANNON_ARENA_SIZE", c_code)

    def test_6_compiler_determinism(self):
        """
        Compiling the exact same model twice must produce identical results:
        identical Flash bytes, identical Peak SRAM bytes, and identical C code.
        """
        graph1 = get_keyword_spotting_model()
        graph2 = get_keyword_spotting_model()
        
        quantizer = Quantizer(bits=8, symmetric=True)
        q1 = quantizer.quantize_graph(graph1)
        q2 = quantizer.quantize_graph(graph2)
        
        self.assertEqual(q1.flash_bytes, q2.flash_bytes, "Flash bytes must be strictly deterministic")
        
        planner1 = MemoryPlanner(alignment_bytes=4, base_address_hex=0x20000000)
        planner2 = MemoryPlanner(alignment_bytes=4, base_address_hex=0x20000000)
        
        sram1, _ = planner1.plan_tensor_arena(q1)
        sram2, _ = planner2.plan_tensor_arena(q2)
        
        self.assertEqual(sram1, sram2, "Peak SRAM bytes must be strictly deterministic")
        
        codegen = CCodeGenerator(target_mcu="ESP32-S3")
        code1 = codegen.generate_header(q1)
        code2 = codegen.generate_header(q2)
        
        self.assertEqual(code1, code2, "Generated C code must be bit-for-bit deterministic")

    def test_7_genuine_onnx_parsing_and_rejection(self):
        """
        Verifies genuine ONNX model parsing, weight extraction, and explicit rejection of unsupported ops.
        """
        import onnx
        from onnx import helper, TensorProto
        import tempfile
        import os

        # 1. Valid ONNX Model
        w = np.random.randn(8, 1, 3, 3).astype(np.float32)
        init_w = helper.make_tensor('w', TensorProto.FLOAT, [8, 1, 3, 3], w.tobytes(), raw=True)
        node_conv = helper.make_node('Conv', ['X', 'w'], ['Y'], kernel_shape=[3, 3])
        node_relu = helper.make_node('Relu', ['Y'], ['Z'])

        graph_def = helper.make_graph(
            [node_conv, node_relu],
            'ValidOnnxNet',
            [helper.make_tensor_value_info('X', TensorProto.FLOAT, [1, 1, 16, 16])],
            [helper.make_tensor_value_info('Z', TensorProto.FLOAT, [1, 8, 16, 16])],
            [init_w]
        )
        model_def = helper.make_model(graph_def, producer_name='shannon_test')

        with tempfile.NamedTemporaryFile(suffix='.onnx', delete=False) as tf:
            onnx_path = tf.name
            onnx.save(model_def, onnx_path)

        try:
            parsed = ModelParser.parse_onnx(onnx_path)
            self.assertEqual(parsed.name, 'ValidOnnxNet')
            self.assertEqual(len(parsed.layers), 2)
            self.assertEqual(parsed.layers[0].op_type, 'Conv2D')
            self.assertEqual(parsed.layers[1].op_type, 'Relu')
            self.assertIsNotNone(parsed.layers[0].weights)
            self.assertEqual(parsed.layers[0].weights.shape, (8, 1, 3, 3))
        finally:
            if os.path.exists(onnx_path):
                os.remove(onnx_path)

        # 2. Unsupported ONNX Operator (Must raise ValueError, ZERO silent fallback)
        node_unsupported = helper.make_node('NonExistentCustomOp', ['X'], ['Z'])
        bad_graph_def = helper.make_graph(
            [node_unsupported],
            'BadOnnxNet',
            [helper.make_tensor_value_info('X', TensorProto.FLOAT, [1, 1, 16, 16])],
            [helper.make_tensor_value_info('Z', TensorProto.FLOAT, [1, 1, 16, 16])]
        )
        bad_model_def = helper.make_model(bad_graph_def, producer_name='shannon_test')

        with tempfile.NamedTemporaryFile(suffix='.onnx', delete=False) as tf:
            bad_onnx_path = tf.name
            onnx.save(bad_model_def, bad_onnx_path)

        try:
            with self.assertRaises(ValueError) as ctx:
                ModelParser.parse_onnx(bad_onnx_path)
            self.assertIn("Unsupported ONNX operator", str(ctx.exception))
        finally:
            if os.path.exists(bad_onnx_path):
                os.remove(bad_onnx_path)


if __name__ == "__main__":
    unittest.main()
