"""
Shannon Tensor Arena Memory Planner
Calculates peak SRAM allocation and layer-by-layer buffer lifecycle reuse.
"""

from typing import Dict, List, Tuple, Any
from .ir import ModelGraph, Tensor

class MemoryPlanner:
    def __init__(self, alignment_bytes: int = 4):
        self.alignment = alignment_bytes

    def _align(self, size: int) -> int:
        return (size + self.alignment - 1) & ~(self.alignment - 1)

    def plan_tensor_arena(self, graph: ModelGraph) -> Tuple[int, List[Dict[str, Any]]]:
        """
        Determines the lifetime of intermediate activations and assigns
        non-overlapping SRAM memory offsets within a single contiguous tensor arena.
        """
        # 1. Determine first and last layer index where each activation tensor is used
        tensor_lifetimes: Dict[str, Tuple[int, int]] = {}
        
        for idx, layer in enumerate(graph.layers):
            for in_t in layer.inputs:
                if in_t in graph.tensors:
                    if in_t not in tensor_lifetimes:
                        tensor_lifetimes[in_t] = (idx, idx)
                    else:
                        tensor_lifetimes[in_t] = (tensor_lifetimes[in_t][0], idx)
            for out_t in layer.outputs:
                if out_t in graph.tensors:
                    if out_t not in tensor_lifetimes:
                        tensor_lifetimes[out_t] = (idx, idx)
                    else:
                        tensor_lifetimes[out_t] = (tensor_lifetimes[out_t][0], idx)

        # 2. Allocate offsets using a greedy interval coloring algorithm
        # Keep track of active memory blocks: list of (start_offset, end_offset, end_layer_idx, tensor_name)
        active_blocks: List[Tuple[int, int, int, str]] = []
        allocated_offsets: Dict[str, int] = {}
        arena_size = 0
        timeline: List[Dict[str, Any]] = []

        for layer_idx, layer in enumerate(graph.layers):
            # Expire blocks that are no longer needed
            active_blocks = [b for b in active_blocks if b[2] >= layer_idx]

            # Allocate outputs of current layer
            for out_t in layer.outputs:
                if out_t not in graph.tensors or out_t in allocated_offsets:
                    continue
                
                t = graph.tensors[out_t]
                t_size = self._align(t.size_bytes)
                t_start, t_end = tensor_lifetimes.get(out_t, (layer_idx, layer_idx))

                # Find first available offset gap
                offset = 0
                sorted_blocks = sorted(active_blocks, key=lambda x: x[0])
                for block in sorted_blocks:
                    b_start, b_end, _, _ = block
                    if offset + t_size <= b_start:
                        break
                    offset = max(offset, b_end)

                offset = self._align(offset)
                allocated_offsets[out_t] = offset
                t.sram_offset = offset
                active_blocks.append((offset, offset + t_size, t_end, out_t))
                arena_size = max(arena_size, offset + t_size)

            current_sram_usage = sum([graph.tensors[b[3]].size_bytes for b in active_blocks if b[3] in graph.tensors])
            timeline.append({
                "layer_idx": layer_idx,
                "layer_id": layer.layer_id,
                "op_type": layer.op_type,
                "active_sram_bytes": current_sram_usage,
                "active_tensors": [b[3] for b in active_blocks]
            })

        graph.peak_sram_bytes = arena_size
        return arena_size, timeline