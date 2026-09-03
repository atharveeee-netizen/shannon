import { useState } from 'react';
import { CompilerProvider, useCompiler } from './context/CompilerContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ContextualInspector } from './components/ContextualInspector';
import { SiliconCopilotDrawer } from './components/views/SiliconCopilotDrawer';
import { CommandPalette } from './components/CommandPalette';
import { Bot } from 'lucide-react';

// Project Views
import { DashboardView } from './components/views/DashboardView';
import { ImportView } from './components/views/ImportView';

// Compiler Views
import { GraphView } from './components/views/GraphView';
import { QuantizationView } from './components/views/QuantizationView';
import { MemoryArenaView } from './components/views/MemoryArenaView';
import { CodeGenView } from './components/views/CodeGenView';

// Validation Views
import { TestbenchView } from './components/views/TestbenchView';
import { BenchmarksView } from './components/views/BenchmarksView';

// Hardware Views
import { DeploymentView } from './components/views/DeploymentView';

// System Views
import { LogsView } from './components/views/LogsView';
import { SettingsView } from './components/views/SettingsView';

function StudioContent() {
  const { activeTab, isCopilotOpen, setIsCopilotOpen } = useCompiler();
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
          {activeTab === 'import' && <ImportView />}

          {/* Compiler */}
          {activeTab === 'graph' && <GraphView />}
          {activeTab === 'quantization' && <QuantizationView />}
          {activeTab === 'memory' && <MemoryArenaView />}
          {activeTab === 'codegen' && <CodeGenView />}

          {/* Validation */}
          {activeTab === 'testbench' && <TestbenchView />}
          {activeTab === 'benchmarks' && <BenchmarksView />}

          {/* Hardware */}
          {activeTab === 'deployment' && <DeploymentView />}

          {/* System */}
          {activeTab === 'logs' && <LogsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Contextual Right Inspector */}
      <ContextualInspector />

      {/* Floating Copilot Button */}
      {!isCopilotOpen && (
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 px-4 py-2 bg-layer-02 hover:bg-layer-03 border border-border text-text-secondary hover:text-text-primary rounded-none shadow-sm flex items-center justify-center transition-colors z-40 cursor-pointer flex-row gap-2"
          title="Open Silicon Copilot"
        >
          <Bot className="w-4 h-4" />
          <span className="text-xs font-mono">Ask Shannon</span>
        </button>
      )}

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