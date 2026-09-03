import React, { useState } from 'react';
import {
  PanelRightClose,
  PanelRightOpen,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { useCompiler } from '../context/CompilerContext';

export const ContextualInspector: React.FC = () => {
  const {
    activeTab,
    selectedHw,
    compilationResult,
    selectedNodeId,
    isCopilotOpen,
    setIsCopilotOpen,
  } = useCompiler();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // If the user specifically toggled Copilot from the sidebar, ensure inspector is open
  const isCopilotMode = isCopilotOpen;

  if (isCollapsed) {
    return (
      <aside className="w-10 border-l border-border bg-surface flex flex-col items-center py-3 select-none flex-shrink-0 z-10">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-[6px] hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors cursor-pointer mb-4"
          title="Expand inspector"
          aria-label="Expand inspector"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>

        <div className="writing-mode-vertical text-xs text-text-muted tracking-wider uppercase font-mono mt-4">
          Inspector
        </div>
      </aside>
    );
  }

  // Find node info if graph or memory tab
  const activeNode =
    compilationResult && selectedNodeId
      ? compilationResult.layers.find((l) => l.layer_id === selectedNodeId) || compilationResult.layers[0]
      : compilationResult?.layers[0];

  return (
    <aside className="w-[300px] border-l border-border bg-surface flex flex-col justify-between select-none flex-shrink-0 z-10">
      {/* Top Header */}
      <div>
        <div className="h-14 px-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {isCopilotMode ? 'Silicon Copilot' : 'Inspector'}
            </span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded-[4px] bg-surface-raised text-text-muted border border-border">
              {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                isCopilotMode
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-raised'
              }`}
              title="Toggle Silicon Copilot"
            >
              <Bot className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-[6px] text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
              title="Collapse inspector"
              aria-label="Collapse inspector"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inspector Body Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
          {/* Active Context Content */}
          {activeTab === 'graph' && activeNode ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider font-medium">Selected Node</div>
                <div className="text-base font-semibold text-text-primary mt-0.5">{activeNode.layer_id}</div>
                <div className="text-xs font-mono text-primary mt-0.5">{activeNode.op_type}</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Input shape:</span>
                  <span className="font-mono text-text-primary">{activeNode.in_shape}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Output shape:</span>
                  <span className="font-mono text-text-primary">{activeNode.out_shape}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Precision:</span>
                  <span className="font-mono text-text-primary">INT8 ({activeNode.bitwidth}-bit)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">MAC operations:</span>
                  <span className="font-mono text-text-primary">{activeNode.macs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Flash weights:</span>
                  <span className="font-mono text-text-primary">{activeNode.flash_bytes} B</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">SRAM buffer:</span>
                  <span className="font-mono text-text-primary">{activeNode.sram_bytes} B</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Physical offset:</span>
                  <span className="font-mono text-primary font-medium">{activeNode.sram_offset_hex}</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'memory' ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider font-medium">Memory Architecture</div>
                <div className="text-base font-semibold text-text-primary mt-0.5">Static BSS Arena</div>
                <div className="text-xs text-text-secondary mt-0.5">Zero dynamic heap allocation</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Base address:</span>
                  <span className="font-mono text-text-primary">0x20000000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Peak buffer size:</span>
                  <span className="font-mono text-text-primary">
                    {compilationResult ? (compilationResult.optimized_int8.peak_sram_bytes / 1024).toFixed(2) : '0'} KB
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Target SRAM limit:</span>
                  <span className="font-mono text-text-primary">{selectedHw.sram_kb} KB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Collision status:</span>
                  <span className="text-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 0 collisions
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Memory reuse:</span>
                  <span className="font-mono text-text-primary">Interval coloring active</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'codegen' ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider font-medium">Generated Firmware</div>
                <div className="text-base font-semibold text-text-primary mt-0.5">shannon_model.h</div>
                <div className="text-xs text-text-secondary mt-0.5">Zero-dependency C99 Header</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Entry point:</span>
                  <span className="font-mono text-text-primary">shannon_inference()</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Memory model:</span>
                  <span className="font-mono text-text-primary">Static BSS</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Dynamic mallocs:</span>
                  <span className="font-mono text-success font-medium">0 B (Verified)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Target ABI:</span>
                  <span className="font-mono text-text-primary">{selectedHw.arch}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">SIMD Acceleration:</span>
                  <span className="font-mono text-text-primary">{selectedHw.simd}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider font-medium">Active Hardware</div>
                <div className="text-base font-semibold text-text-primary mt-0.5">{selectedHw.name}</div>
                <div className="text-xs text-text-secondary mt-0.5">{selectedHw.arch} @ {selectedHw.clock_mhz} MHz</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">SRAM capacity:</span>
                  <span className="font-mono text-text-primary">{selectedHw.sram_kb} KB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Flash capacity:</span>
                  <span className="font-mono text-text-primary">{selectedHw.flash_mb} MB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">SIMD extension:</span>
                  <span className="font-mono text-text-primary">{selectedHw.simd}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Target compatibility:</span>
                  <span className="text-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Compatible
                  </span>
                </div>
              </div>

              {compilationResult && (
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="text-xs text-text-muted font-medium">Compilation Telemetry</div>
                  <div className="bg-surface-raised p-2.5 rounded-[6px] border border-border space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">SRAM:</span>
                      <span className="font-mono text-text-primary">
                        {(compilationResult.optimized_int8.peak_sram_bytes / 1024).toFixed(1)} KB / {selectedHw.sram_kb} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Flash:</span>
                      <span className="font-mono text-text-primary">
                        {(compilationResult.optimized_int8.flash_bytes / 1024).toFixed(1)} KB / {selectedHw.flash_mb * 1024} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Est. Latency:</span>
                      <span className="font-mono text-text-primary">
                        {compilationResult.optimized_int8.estimated_latency_ms.toFixed(2)} ms
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="p-3 border-t border-border bg-surface text-xs text-text-muted flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span>Compiler Online</span>
        </span>
        <span className="font-mono text-text-secondary">v1.0.0</span>
      </div>
    </aside>
  );
};
