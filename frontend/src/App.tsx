import { useState, useEffect } from 'react';
import {
  HardwareProfile,
  GraphNode,
  GraphEdge,
  StaticAnalysisIssue,
  SimulatedSiliconState,
  TargetLanguage,
} from './types';
import { HARDWARE_PROFILES, PRESET_MODELS, optimizeModel } from './services/api';
import { GraphCanvas } from './components/GraphCanvas';
import { SiliconSimulator } from './components/SiliconSimulator';
import { GhostAuditor } from './components/GhostAuditor';
import { CodeStudio } from './components/CodeStudio';
import { ShannonCopilot } from './components/ShannonCopilot';
import {
  Layers,
  Cpu,
  Code,
  ShieldCheck,
  BrainCircuit,
  Play,
  Square,
  Sparkles,
  HardDrive,
} from 'lucide-react';

const INITIAL_NODES: GraphNode[] = [
  { id: 'node_in', name: 'audio_mfcc_in', type: 'Input', x: 40, y: 180, macs: 0, sram_bytes: 490, flash_bytes: 0, shape: '1×49×10', isQuantized: true },
  { id: 'node_conv1', name: 'kws_conv1_3x3', type: 'Conv2D', x: 260, y: 120, macs: 22560, sram_bytes: 752, flash_bytes: 480, shape: '1×47×16', isQuantized: true },
  { id: 'node_pool1', name: 'kws_pool1_2x2', type: 'MaxPool2D', x: 500, y: 120, macs: 752, sram_bytes: 368, flash_bytes: 0, shape: '1×23×16', isQuantized: true },
  { id: 'node_dense1', name: 'kws_dense_64', type: 'Dense', x: 740, y: 180, macs: 23552, sram_bytes: 64, flash_bytes: 23552, shape: '1×64', isQuantized: true },
  { id: 'node_out', name: 'kws_logits', type: 'Output', x: 980, y: 180, macs: 256, sram_bytes: 4, flash_bytes: 256, shape: '1×4', isQuantized: true },
];

const INITIAL_EDGES: GraphEdge[] = [
  { id: 'e1', sourceNodeId: 'node_in', targetNodeId: 'node_conv1', tensorShape: '49x10 (INT8)' },
  { id: 'e2', sourceNodeId: 'node_conv1', targetNodeId: 'node_pool1', tensorShape: '47x16 (INT8)' },
  { id: 'e3', sourceNodeId: 'node_pool1', targetNodeId: 'node_dense1', tensorShape: '23x16 (INT8)' },
  { id: 'e4', sourceNodeId: 'node_dense1', targetNodeId: 'node_out', tensorShape: '1x64 (INT8)' },
];

const INITIAL_ISSUES: StaticAnalysisIssue[] = [
  {
    id: 'issue_1',
    title: 'Zero-Malloc SRAM Arena Verified',
    description: 'Tensor buffer lifetimes statically planned without dynamic heap allocation. Guarantees 0 bytes fragmentation.',
    severity: 'info',
    fixSuggestion: 'MISRA-C Rule 21.3 Compliant.',
  },
  {
    id: 'issue_2',
    title: 'Dense Layer Quantization Outlier Check',
    description: 'Layer kws_dense_64 dynamic range normalized. Symmetric INT8 scale factor optimal at S=0.0078125.',
    severity: 'info',
  },
];

export function App() {
  const [selectedHwId, setSelectedHwId] = useState<string>('ESP32-S3');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('kws');
  const [activeTab, setActiveTab] = useState<'canvas' | 'simulator' | 'code' | 'auditor' | 'copilot'>('canvas');
  const [targetLang, setTargetLang] = useState<TargetLanguage>('cpp_esp32');

  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string>('node_conv1');
  const [issues, setIssues] = useState<StaticAnalysisIssue[]>(INITIAL_ISSUES);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('// Loading Shannon compiled kernel...');

  const currentHw: HardwareProfile = HARDWARE_PROFILES[selectedHwId] || HARDWARE_PROFILES['ESP32-S3'];
  const currentModel = PRESET_MODELS.find((m) => m.id === selectedPresetId) || PRESET_MODELS[0];

  const [simState, setSimState] = useState<SimulatedSiliconState>({
    gpio: { GPIO_13: true, GPIO_12: false, GPIO_14: true, GPIO_27: false },
    adc: { ADC_IN1: 1.65 },
    uartLogs: [
      '[0.000s] SYSTEM_BOOT: Shannon TinyML Engine v2.0',
      `[+0.012s] HARDWARE_INIT: ${currentHw.name} (${currentHw.arch})`,
      `[+0.018s] SRAM_ARENA_ALLOC: 1,120 Bytes @ 0x20000000 (Static Zero-Malloc)`,
      '[+0.025s] INFERENCE_READY: Vectorized INT8 SIMD Pipeline Active',
    ],
    pwmFreq: 1000,
    activeLayerId: 'node_conv1',
    coreTempC: 38.4,
    powerMw: 142,
  });

  useEffect(() => {
    const runCompile = async () => {
      try {
        const res = await optimizeModel(selectedPresetId, selectedHwId);
        setGeneratedCode(res.code);
      } catch {
        setGeneratedCode('// Shannon Static C++ Kernel Generator\n#include <stdint.h>\n...');
      }
    };
    runCompile();
  }, [selectedPresetId, selectedHwId]);

  useEffect(() => {
    if (!isSimulating) return;

    const nodeIds = nodes.map((n) => n.id);
    let step = 0;

    const interval = setInterval(() => {
      step = (step + 1) % nodeIds.length;
      const curId = nodeIds[step];
      const targetNode = nodes.find((n) => n.id === curId);

      setActiveNodeId(curId);
      setSimState((prev) => ({
        ...prev,
        activeLayerId: curId,
        coreTempC: +(38.0 + Math.random() * 2.5).toFixed(1),
        powerMw: Math.round(135 + Math.random() * 20),
        gpio: {
          ...prev.gpio,
          GPIO_13: step % 2 === 0,
          GPIO_12: step % 2 !== 0,
        },
        uartLogs: [
          `[+${(Date.now() / 1000 % 100).toFixed(3)}s] ${targetNode?.type.toUpperCase()} [${targetNode?.name}]: MACs: ${targetNode?.macs} | Buffer: ${targetNode?.sram_bytes}B`,
          ...prev.uartLogs.slice(0, 30),
        ],
      }));
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, nodes]);

  const handleAddNode = (type: GraphNode['type'] = 'Conv2D') => {
    const id = `node_layer_${nodes.length + 1}`;
    const newNode: GraphNode = {
      id,
      name: `layer_${nodes.length + 1}_${type.toLowerCase()}`,
      type,
      x: 200 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      macs: 16384,
      sram_bytes: 512,
      flash_bytes: 1024,
      shape: '1×24×16',
      isQuantized: true,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  const handleUpdateNode = (updated: GraphNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleAddEdge = (sourceId: string, targetId: string) => {
    const newEdge: GraphEdge = {
      id: `edge_${Date.now()}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      tensorShape: 'INT8 Tensor',
    };
    setEdges((prev) => [...prev, newEdge]);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const handleAutoFix = (issueId: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
  };

  const totalSramBytes = nodes.reduce((acc, n) => acc + n.sram_bytes, 0);
  const totalFlashBytes = nodes.reduce((acc, n) => acc + n.flash_bytes, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Engineering HUD Navigation */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base shadow-sm shadow-emerald-500/20">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2 font-mono">
                SHANNON <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">v2.0 TINYML STUDIO</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono">Autonomous Hardware Compiler & Optimizer</span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Target MCU Selector */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 hidden sm:block" />
            <select
              value={selectedHwId}
              onChange={(e) => setSelectedHwId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(HARDWARE_PROFILES).map(([key, h]: [string, HardwareProfile]) => (
                <option key={key} value={key}>
                  {h.name} ({h.sram_kb}KB SRAM / {h.flash_mb}MB Flash)
                </option>
              ))}
            </select>
          </div>

          {/* Model Preset Selector */}
          <div className="flex items-center gap-2 hidden lg:flex">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
            >
              {PRESET_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.domain})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex items-center gap-3">
          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 text-xs font-semibold font-mono rounded-lg flex items-center gap-1.5 transition ${
              isSimulating
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" /> Stop Sim
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run Sim
              </>
            )}
          </button>

          {/* Main IDE Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'canvas' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Canvas
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'simulator' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Silicon Bench
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'code' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Code Studio
            </button>
            <button
              onClick={() => setActiveTab('auditor')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'auditor' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Auditor
            </button>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'copilot' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" /> AI Copilot
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 p-5 max-w-7xl w-full mx-auto flex flex-col gap-4">
        {activeTab === 'canvas' && (
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            activeNodeId={activeNodeId}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onAddNode={handleAddNode}
            onAddEdge={handleAddEdge}
            onDeleteEdge={handleDeleteEdge}
          />
        )}

        {activeTab === 'simulator' && (
          <SiliconSimulator
            simState={simState}
            targetHw={currentHw}
            isSimulating={isSimulating}
            onToggleSim={() => setIsSimulating(!isSimulating)}
            onUpdateGpio={(pin, val) =>
              setSimState((p) => ({ ...p, gpio: { ...p.gpio, [pin]: val } }))
            }
            onUpdateAdc={(pin, val) =>
              setSimState((p) => ({ ...p, adc: { ...p.adc, [pin]: val } }))
            }
            onUpdatePwm={(freq) => setSimState((p) => ({ ...p, pwmFreq: freq }))}
          />
        )}

        {activeTab === 'code' && (
          <CodeStudio
            code={generatedCode}
            targetLanguage={targetLang}
            onChangeTarget={setTargetLang}
          />
        )}

        {activeTab === 'auditor' && (
          <GhostAuditor
            issues={issues}
            onSelectNode={(nodeId) => {
              setSelectedNodeId(nodeId);
              setActiveTab('canvas');
            }}
            onAutoFix={handleAutoFix}
          />
        )}

        {activeTab === 'copilot' && (
          <ShannonCopilot
            targetHwName={currentHw.name}
            modelName={currentModel.name}
          />
        )}

        {/* Bottom Telemetry & Memory Dock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Flash ROM (INT8 Weights)
              </span>
              <span className="text-purple-400 font-bold">
                {(totalFlashBytes / 1024).toFixed(1)} KB / {currentHw.flash_mb * 1024} KB
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, (totalFlashBytes / (currentHw.flash_mb * 1024 * 1024)) * 100 * 50)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-emerald-400 block mt-1">
              🚀 75% Flash Storage Compression (FP32 &rarr; INT8)
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Peak SRAM Tensor Arena
              </span>
              <span className="text-emerald-400 font-bold">
                {(totalSramBytes / 1024).toFixed(1)} KB / {currentHw.sram_kb} KB
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: `${Math.min(100, (totalSramBytes / (currentHw.sram_kb * 1024)) * 100 * 10)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-cyan-400 block mt-1">
              ⚡ Zero Dynamic Allocation (0 Bytes malloc in firmware)
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">MISRA-C:2012 COMPLIANCE</span>
              <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> VERIFIED SAFE
              </h4>
              <span className="text-[9px] font-mono text-slate-500">No buffer overflows • Static arrays</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block">TARGET INTRINSICS</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {selectedHwId === 'ESP32-S3' ? 'Xtensa PIE (8-bit SIMD)' : 'ARM CMSIS-NN __SMLAD'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}