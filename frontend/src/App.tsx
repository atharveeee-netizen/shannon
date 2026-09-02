import { useState, useEffect, useCallback } from 'react';
import {
  HardwareProfile,
  PresetModel,
  CompilationResult,
} from './types';
import {
  HARDWARE_PROFILES,
  PRESET_MODELS,
  fetchHardware,
  compileModel,
  uploadAndCompileModel,
} from './services/api';
import { Sidebar, ViewId } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CommandPalette } from './components/CommandPalette';

// Engineering Views
import { DashboardView } from './views/DashboardView';
import { ModelsView } from './views/ModelsView';
import { InputsView } from './views/InputsView';
import { ImportView } from './views/ImportView';
import { GraphView } from './views/GraphView';
import { QuantizationView } from './views/QuantizationView';
import { MemoryArenaView } from './views/MemoryArenaView';
import { OptimizationView } from './views/OptimizationView';
import { CodeGenView } from './views/CodeGenView';
import { TestbenchView } from './views/TestbenchView';
import { BenchmarksView } from './views/BenchmarksView';
import { TargetsView } from './views/TargetsView';
import { DeploymentView } from './views/DeploymentView';
import { LogsView } from './views/LogsView';
import { SettingsView } from './views/SettingsView';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('shannon_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  const [hardwareList, setHardwareList] = useState<HardwareProfile[]>(HARDWARE_PROFILES);
  const [models] = useState<PresetModel[]>(PRESET_MODELS);
  const [selectedHwId, setSelectedHwId] = useState<string>('STM32H7');
  const [selectedModelId, setSelectedModelId] = useState<string>('kws');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFilename, setCustomFilename] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [compilationStatus, setCompilationStatus] = useState<'READY' | 'COMPILING' | 'VERIFIED' | 'FAILED'>('VERIFIED');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shannon_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shannon_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchHardware()
      .then((hw) => setHardwareList(hw))
      .catch(() => setHardwareList(HARDWARE_PROFILES));
  }, []);

  // Global Keyboard Shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const runCompilation = useCallback(async (modelId: string, hwId: string, fileToUpload: File | null = customFile) => {
    setIsCompiling(true);
    setCompilationStatus('COMPILING');
    setErrorMessage(null);
    try {
      let res: CompilationResult;
      if (fileToUpload) {
        res = await uploadAndCompileModel(fileToUpload, hwId);
      } else {
        res = await compileModel(modelId, hwId);
      }
      setCompilationResult(res);
      setCompilationStatus('VERIFIED');
    } catch (err: any) {
      console.error('Compilation error:', err);
      setErrorMessage(err.message || 'Compilation completed with fallback.');
      setCompilationStatus('FAILED');
    } finally {
      setIsCompiling(false);
    }
  }, [customFile]);

  useEffect(() => {
    runCompilation(selectedModelId, selectedHwId, customFile);
  }, [selectedModelId, selectedHwId, customFile, runCompilation]);

  const handleSelectModel = (id: string) => {
    setCustomFile(null);
    setCustomFilename(null);
    setSelectedModelId(id);
  };

  const handleUploadCustom = (file: File) => {
    setCustomFile(file);
    setCustomFilename(file.name);
    runCompilation('custom', selectedHwId, file);
  };

  const handleDownloadHeader = () => {
    if (!compilationResult) return;
    const blob = new Blob([compilationResult.c_header_code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shannon_${compilationResult.model_name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_model.h`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const currentHw = hardwareList.find((h) => h.id === selectedHwId) || hardwareList[0];
  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-sans flex flex-col antialiased">
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onSelectHardware={setSelectedHwId}
        onSelectModel={handleSelectModel}
        onTriggerCompile={() => runCompilation(selectedModelId, selectedHwId, customFile)}
        onDownloadHeader={handleDownloadHeader}
        onToggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
        hardwareList={hardwareList}
        models={models}
      />

      {/* Persistent Compact Top Header */}
      <TopHeader
        currentModel={currentModel}
        currentHw={currentHw}
        hardwareList={hardwareList}
        onSelectHardware={setSelectedHwId}
        isCompiling={isCompiling}
        onRunCompile={() => runCompilation(selectedModelId, selectedHwId, customFile)}
        compilationStatus={compilationStatus}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenCommandPalette={() => setIsCmdOpen(true)}
      />

      {/* Main Studio Body: Left Sidebar + Center Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Left Navigation Sidebar (~240px) */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          targetHw={currentHw}
          compilationStatus={compilationStatus}
        />

        {/* Center Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-2.5 bg-danger-subtle border border-danger/30 rounded text-danger text-xs flex items-center justify-between font-mono">
              <span>{errorMessage}</span>
              <button
                onClick={() => runCompilation(selectedModelId, selectedHwId, customFile)}
                className="px-2 py-0.5 bg-danger text-white rounded text-[11px] font-semibold hover:opacity-90 transition"
              >
                Retry
              </button>
            </div>
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              currentModel={currentModel}
              currentHw={currentHw}
              compilationResult={compilationResult}
              onNavigate={setActiveView}
              onRunCompile={() => runCompilation(selectedModelId, selectedHwId, customFile)}
              isCompiling={isCompiling}
            />
          )}

          {activeView === 'models' && (
            <ModelsView
              models={models}
              selectedModelId={selectedModelId}
              onSelectModel={handleSelectModel}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'inputs' && (
            <InputsView model={currentModel} />
          )}

          {activeView === 'import' && (
            <ImportView
              onUploadCustom={handleUploadCustom}
              customFilename={customFilename}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'graph' && (
            <GraphView compilationResult={compilationResult} />
          )}

          {activeView === 'quantization' && (
            <QuantizationView
              compilationResult={compilationResult}
              onRunCompile={() => runCompilation(selectedModelId, selectedHwId, customFile)}
              isCompiling={isCompiling}
            />
          )}

          {activeView === 'arena' && (
            <MemoryArenaView
              compilationResult={compilationResult}
              targetHw={currentHw}
            />
          )}

          {activeView === 'optimization' && (
            <OptimizationView
              compilationResult={compilationResult}
              targetHw={currentHw}
            />
          )}

          {activeView === 'codegen' && (
            <CodeGenView
              compilationResult={compilationResult}
              targetHw={currentHw}
              onDownloadHeader={handleDownloadHeader}
            />
          )}

          {(activeView === 'testbench' || activeView === 'parity') && (
            <TestbenchView
              model={currentModel}
              compilationResult={compilationResult}
              targetHw={currentHw}
            />
          )}

          {activeView === 'benchmarks' && (
            <BenchmarksView />
          )}

          {activeView === 'targets' && (
            <TargetsView
              currentHw={currentHw}
              hardwareList={hardwareList}
              onSelectHardware={setSelectedHwId}
            />
          )}

          {activeView === 'deployment' && (
            <DeploymentView
              currentHw={currentHw}
              compilationResult={compilationResult}
              onDownloadHeader={handleDownloadHeader}
            />
          )}

          {activeView === 'logs' && (
            <LogsView />
          )}

          {activeView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
}