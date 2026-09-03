import { useState } from 'react';
import { CompilerProvider, useCompiler } from './context/CompilerContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ContextualInspector } from './components/ContextualInspector';
import { SiliconCopilotDrawer } from './components/views/SiliconCopilotDrawer';
import { CommandPalette } from './components/CommandPalette';

// Project Views
import { DashboardView } from './components/views/DashboardView';
import { ModelsView } from './components/views/ModelsView';
import { InputsView } from './components/views/InputsView';
import { ImportView } from './components/views/ImportView';

// Compiler Views
import { GraphView } from './components/views/GraphView';
import { QuantizationView } from './components/views/QuantizationView';
import { MemoryArenaView } from './components/views/MemoryArenaView';
import { OptimizationView } from './components/views/OptimizationView';
import { CodeGenView } from './components/views/CodeGenView';

// Simulation Views
import { SignalFlowView } from './components/views/SignalFlowView';
import { TensorInspectorView } from './components/views/TensorInspectorView';
import { WaveformsView } from './components/views/WaveformsView';
import { Fp32VsInt8View } from './components/views/Fp32VsInt8View';
import { CompareView } from './components/views/CompareView';

// Validation Views
import { TestbenchView } from './components/views/TestbenchView';
import { NumericalParityView } from './components/views/NumericalParityView';
import { BenchmarksView } from './components/views/BenchmarksView';

// Hardware Views
import { TargetsView } from './components/views/TargetsView';
import { DeploymentView } from './components/views/DeploymentView';

// System Views
import { LogsView } from './components/views/LogsView';
import { SettingsView } from './components/views/SettingsView';

function StudioContent() {
  const { activeTab } = useCompiler();
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-canvas text-text-primary font-sans overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Studio Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-canvas">
        {/* Top Navigation Bar */}
        <TopBar />

        {/* Dynamic Studio Workspace Body */}
        <main className="flex-1 overflow-y-auto bg-canvas custom-scrollbar">
          {/* Project */}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'models' && <ModelsView />}
          {activeTab === 'inputs' && <InputsView />}
          {activeTab === 'import' && <ImportView />}

          {/* Compiler */}
          {activeTab === 'graph' && <GraphView />}
          {activeTab === 'quantization' && <QuantizationView />}
          {activeTab === 'memory' && <MemoryArenaView />}
          {activeTab === 'optimization' && <OptimizationView />}
          {activeTab === 'codegen' && <CodeGenView />}

          {/* Simulation */}
          {activeTab === 'signalflow' && <SignalFlowView />}
          {activeTab === 'tensor' && <TensorInspectorView />}
          {activeTab === 'waveforms' && <WaveformsView />}
          {activeTab === 'fp32vsint8' && <Fp32VsInt8View />}
          {activeTab === 'compare' && <CompareView />}

          {/* Validation */}
          {activeTab === 'testbench' && <TestbenchView />}
          {activeTab === 'parity' && <NumericalParityView />}
          {activeTab === 'benchmarks' && <BenchmarksView />}

          {/* Hardware */}
          {activeTab === 'targets' && <TargetsView />}
          {activeTab === 'deployment' && <DeploymentView />}

          {/* System */}
          {activeTab === 'logs' && <LogsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Contextual Right Inspector */}
      <ContextualInspector />

      {/* Silicon Copilot AI Auditor Drawer */}
      <SiliconCopilotDrawer />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <CompilerProvider>
      <StudioContent />
    </CompilerProvider>
  );
}