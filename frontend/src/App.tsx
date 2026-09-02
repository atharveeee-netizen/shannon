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
import { AppHeader } from './components/AppHeader';
import { SiliconSidebar } from './components/SiliconSidebar';
import { RightPanel } from './components/RightPanel';
import { CompilerControls } from './components/CompilerControls';
import { CompileResult } from './components/CompileResult';
import { OptimizationTable } from './components/OptimizationTable';
import { TechnicalInspector } from './components/TechnicalInspector';
import { CommandPalette } from './components/CommandPalette';
import { ImpulseFlowGraph } from './components/ImpulseFlowGraph';
import { ConfusionMatrixView } from './components/ConfusionMatrixView';
import { DspSpectralView } from './components/DspSpectralView';
import { DeploymentGrid } from './components/DeploymentGrid';

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

  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isQuantized, setIsQuantized] = useState<boolean>(true);

  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);

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
    setErrorMessage(null);
    try {
      let res: CompilationResult;
      if (fileToUpload) {
        res = await uploadAndCompileModel(fileToUpload, hwId);
      } else {
        res = await compileModel(modelId, hwId);
      }
      setCompilationResult(res);
    } catch (err: any) {
      console.error('Compilation error:', err);
      setErrorMessage(err.message || 'Compilation completed with fallback.');
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

      {/* Top Full-Width Header with Edge Impulse Breadcrumbs */}
      <AppHeader
        onOpenCommandPalette={() => setIsCmdOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        currentHw={currentHw}
        currentModel={currentModel}
        compilationResult={compilationResult}
        onDownloadHeader={handleDownloadHeader}
        isQuantized={isQuantized}
        onToggleQuantization={setIsQuantized}
      />

      {/* 3-Column Studio Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        
        {/* Left Navigation Rail & Silicon Telemetry */}
        <SiliconSidebar
          currentHw={currentHw}
          hardwareList={hardwareList}
          onSelectHardware={setSelectedHwId}
          compilationResult={compilationResult}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        {/* Center Main Workspace */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
          {errorMessage && (
            <div className="p-2.5 bg-danger/10 border border-danger/30 rounded text-danger text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={() => runCompilation(selectedModelId, selectedHwId, customFile)}
                className="px-2 py-0.5 bg-danger text-canvas rounded text-[11px] font-medium hover:opacity-90 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Model Controls Bar */}
          <CompilerControls
            models={models}
            selectedModelId={selectedModelId}
            onSelectModel={handleSelectModel}
            customFilename={customFilename}
            onUploadCustom={handleUploadCustom}
            hardwareList={hardwareList}
            selectedHwId={selectedHwId}
            onSelectHardware={setSelectedHwId}
            isCompiling={isCompiling}
            onCompile={() => runCompilation(selectedModelId, selectedHwId, customFile)}
          />

          {/* Impulse Pipeline Visual Flow Diagram */}
          <ImpulseFlowGraph
            model={currentModel}
            targetHw={currentHw}
            compilationResult={compilationResult}
            activeSection={activeSection}
            onSelectSection={setActiveSection}
          />

          {/* Section 1: Dashboard & Performance Overview */}
          {(activeSection === 'dashboard' || activeSection === 'impulse') && compilationResult && (
            <div className="space-y-5">
              <CompileResult
                result={compilationResult}
                targetHw={currentHw}
              />

              <ConfusionMatrixView
                model={currentModel}
                result={compilationResult}
                targetHw={currentHw}
              />

              <OptimizationTable
                result={compilationResult}
              />

              <TechnicalInspector
                result={compilationResult}
                targetHw={currentHw}
                onDownloadHeader={handleDownloadHeader}
              />
            </div>
          )}

          {/* Section 2: DSP Preprocessing & Spectral Filterbank */}
          {activeSection === 'dsp' && (
            <DspSpectralView
              model={currentModel}
              targetHw={currentHw}
            />
          )}

          {/* Section 3: NN Classifier, Confusion Matrix & Performance */}
          {activeSection === 'classifier' && compilationResult && (
            <div className="space-y-5">
              <ConfusionMatrixView
                model={currentModel}
                result={compilationResult}
                targetHw={currentHw}
              />

              <OptimizationTable
                result={compilationResult}
              />

              <TechnicalInspector
                result={compilationResult}
                targetHw={currentHw}
                onDownloadHeader={handleDownloadHeader}
              />
            </div>
          )}

          {/* Section 4: Memory Arena Tab Direct View */}
          {activeSection === 'arena' && compilationResult && (
            <div className="space-y-5">
              <TechnicalInspector
                result={compilationResult}
                targetHw={currentHw}
                onDownloadHeader={handleDownloadHeader}
              />
            </div>
          )}

          {/* Section 5: Live Sensory Testbench */}
          {activeSection === 'testbench' && (
            <div className="p-4 bg-surface border border-border rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Live Sensory Testbench & Simulator Active
              </h3>
              <p className="text-xs text-text-secondary">
                Inspect real-time hardware-in-the-loop inference feed on the right sidebar testbench panel.
              </p>
            </div>
          )}

          {/* Section 6: Deployment & Microcontroller Firmware Grid */}
          {activeSection === 'deployment' && (
            <DeploymentGrid
              currentHw={currentHw}
              hardwareList={hardwareList}
              onSelectHardware={setSelectedHwId}
              compilationResult={compilationResult}
              onDownloadHeader={handleDownloadHeader}
            />
          )}
        </main>

        {/* Right Sidebar: Live Sensory Simulator & Silicon Copilot */}
        <RightPanel
          selectedModelId={selectedModelId}
          targetHw={currentHw}
          compilationResult={compilationResult}
        />

      </div>
    </div>
  );
}