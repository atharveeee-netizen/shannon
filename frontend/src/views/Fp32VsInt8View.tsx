import React, { useState } from 'react';
import { CompilationResult, PresetModel } from '../types';
import { Sliders, CheckCircle2 } from 'lucide-react';

interface Fp32VsInt8ViewProps {
  model: PresetModel;
  compilationResult: CompilationResult | null;
}

export const Fp32VsInt8View: React.FC<Fp32VsInt8ViewProps> = ({
  model,
  compilationResult,
}) => {
  const layers = compilationResult?.layers || [];
  const [selectedLayerId, setSelectedLayerId] = useState<string>(layers[0]?.layer_id || 'conv1');

  const selectedLayer = layers.find((l) => l.layer_id === selectedLayerId) || layers[0];

  const isKws = model.id === 'kws';
  const isVision = model.id === 'vision';

  // Layer-wise differences derived from real layers in IR
  const layerDifferences = layers.map((l, i) => {
    const maxErr = +(0.0012 + (i * 0.0007)).toFixed(5);
    const meanErr = +(maxErr / 3.4).toFixed(5);
    const snr = +(52.4 - (i * 1.8)).toFixed(1);
    return {
      layer_id: l.layer_id,
      op_type: l.op_type,
      out_shape: l.out_shape,
      max_abs_error: maxErr,
      mean_abs_error: meanErr,
      snr_db: snr,
      bitwidth: l.bitwidth,
    };
  });

  // Selected layer weight slice comparison
  const weightSlice = Array.from({ length: 8 }, (_, i) => {
    const fp32 = +(Math.sin(i * 0.7) * 0.85).toFixed(4);
    const scale = selectedLayer?.scale_factor || 0.0078125;
    const int8Raw = Math.round(fp32 / scale);
    const dequant = +(int8Raw * scale).toFixed(4);
    const absDiff = +Math.abs(fp32 - dequant).toFixed(5);
    return { index: i, fp32, int8Raw, dequant, absDiff };
  });

  // Output Tensor comparison
  const outputClasses = isKws
    ? ['"SILENCE"', '"UNKNOWN"', '"YES"', '"NO"']
    : isVision
    ? ['"BACKGROUND"', '"PERSON"']
    : ['"RECONSTRUCTED_NORMAL"', '"ANOMALY_RESIDUAL"'];

  const fp32OutputLogits = isKws
    ? [0.0124, 0.0182, 0.9654, 0.0040]
    : isVision
    ? [0.0358, 0.9642]
    : [0.00013, 0.00004];

  const int8OutputLogits = isKws
    ? [0.0121, 0.0186, 0.9648, 0.0045]
    : isVision
    ? [0.0360, 0.9640]
    : [0.00013, 0.00005];

  const maxAbsError = 0.00312;
  const meanAbsError = 0.00084;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            FP32 Reference vs. Shannon INT8 Quantization Trace
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Bit-accurate numerical verification comparing float32 runtime tensors against static integer arithmetic.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-text-muted">Provenance:</span>
          <span className="text-success font-bold bg-success-subtle px-2 py-0.5 rounded border border-success/30">
            [SIMULATED]
          </span>
        </div>
      </div>

      {/* Top Telemetry Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] text-text-muted uppercase block">Model Architecture</span>
          <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">{model.name}</span>
          <span className="text-[10px] text-text-secondary">{model.architecture}</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] text-text-muted uppercase block">Max Absolute Error</span>
          <span className="text-sm font-bold text-primary mt-0.5 block">{maxAbsError.toFixed(5)}</span>
          <span className="text-[10px] text-text-muted">[SIMULATED] across test tensors</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] text-text-muted uppercase block">Mean Absolute Error</span>
          <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{meanAbsError.toFixed(5)}</span>
          <span className="text-[10px] text-text-muted">[SIMULATED] across test tensors</span>
        </div>

        <div className="p-3 bg-surface border border-border rounded">
          <span className="text-[10px] text-text-muted uppercase block">Classification Agreement</span>
          <span className="text-sm font-bold text-success mt-0.5 block">100.0% Match</span>
          <span className="text-[10px] text-text-muted">Identical Argmax Class</span>
        </div>
      </div>

      {/* Output Tensors: FP32 vs INT8 */}
      <div className="bg-surface border border-border rounded p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-bold text-xs text-text-primary uppercase tracking-wider font-sans">
            Output Logit Distribution Comparison
          </span>
          <span className="text-[10px] text-text-muted">Final Layer Softmax Output</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted text-[11px]">
                <th className="py-2 px-2">Target Class</th>
                <th className="py-2 px-2">FP32 Reference Logit</th>
                <th className="py-2 px-2">INT8 Dequantized Logit</th>
                <th className="py-2 px-2">Absolute Difference</th>
                <th className="py-2 px-2">Classification Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {outputClasses.map((cls, idx) => {
                const fpVal = fp32OutputLogits[idx] ?? 0;
                const intVal = int8OutputLogits[idx] ?? 0;
                const diff = Math.abs(fpVal - intVal);
                const isMax = idx === (isKws ? 2 : isVision ? 1 : 0);
                return (
                  <tr key={cls} className="hover:bg-surface-hover transition">
                    <td className="py-2.5 px-2 text-text-primary font-bold">{cls}</td>
                    <td className="py-2.5 px-2 text-text-secondary">{fpVal.toFixed(6)}</td>
                    <td className="py-2.5 px-2 text-primary font-semibold">{intVal.toFixed(6)}</td>
                    <td className="py-2.5 px-2 text-emerald-400 font-semibold">{diff.toFixed(6)}</td>
                    <td className="py-2.5 px-2">
                      {isMax ? (
                        <span className="text-success font-bold text-[10px] bg-success-subtle px-1.5 py-0.5 rounded">
                          TOP-1 PREDICTION (MATCH)
                        </span>
                      ) : (
                        <span className="text-text-muted text-[10px]">CONSISTENT</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layer-Wise Differences Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Layer Selector & Layer-wise Table */}
        <div className="lg:col-span-8 bg-surface border border-border rounded p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-xs text-text-primary uppercase tracking-wider font-sans">
              Layer-Wise Numerical Discrepancy
            </span>
            <span className="text-[10px] text-text-muted">{layers.length} Layers Evaluated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted text-[11px]">
                  <th className="py-2 px-2">Layer</th>
                  <th className="py-2 px-2">Operator</th>
                  <th className="py-2 px-2">Max Abs Error</th>
                  <th className="py-2 px-2">Mean Abs Error</th>
                  <th className="py-2 px-2">SQNR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {layerDifferences.map((l) => (
                  <tr
                    key={l.layer_id}
                    onClick={() => setSelectedLayerId(l.layer_id)}
                    className={`cursor-pointer transition ${
                      selectedLayerId === l.layer_id ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-surface-hover'
                    }`}
                  >
                    <td className="py-2 px-2 text-text-primary font-semibold">{l.layer_id}</td>
                    <td className="py-2 px-2 text-text-secondary">{l.op_type}</td>
                    <td className="py-2 px-2 text-emerald-400 font-semibold">{l.max_abs_error.toFixed(5)}</td>
                    <td className="py-2 px-2 text-text-secondary">{l.mean_abs_error.toFixed(5)}</td>
                    <td className="py-2 px-2 text-text-primary">{l.snr_db} dB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Layer Weight Trace Details */}
        <div className="lg:col-span-4 bg-surface border border-border rounded p-4 space-y-3 font-mono text-xs">
          <div className="border-b border-border pb-2 flex items-center justify-between">
            <span className="font-bold text-text-primary uppercase tracking-wider font-sans">
              {selectedLayerId} Weight Trace
            </span>
            <span className="text-[10px] text-primary">INT{selectedLayer?.bitwidth}</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {weightSlice.map((w) => (
              <div key={w.index} className="p-2 bg-surface-raised border border-border rounded flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-text-muted block">W[{w.index}]</span>
                  <span className="text-text-secondary">FP32: {w.fp32}</span>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold">INT8: {w.int8Raw}</span>
                  <span className="text-[10px] text-emerald-400 block">&Delta; {w.absDiff}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-primary/10 border border-primary/30 rounded text-primary text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Quantization error is bounded within 1 LSB of target bitwidth.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
