import { useState, useEffect } from 'react';
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
  getOfflineFallbackResult,
} from './services/api';

import { OllamaHomeView } from './components/OllamaHomeView';
import { Sidebar, TabType } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/views/DashboardView';
import { ImpulseDesignView } from './components/views/ImpulseDesignView';
import { DspBlockView } from './components/views/DspBlockView';
import { NnClassifierView } from './components/views/NnClassifierView';
import { LiveClassificationView } from './components/views/LiveClassificationView';
import { MemoryArenaView } from './components/views/MemoryArenaView';
import { DeploymentView } from './components/views/DeploymentView';
import { SiliconCopilotDrawer } from './components/views/SiliconCopilotDrawer';
import { CommandPalette } from './components/CommandPalette';

export function App() {
  const [viewMode, setViewMode] = useState<'home' | 'studio'>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('shannon_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [hardwareList, setHardwareList] = useState<HardwareProfile[]>(HARDWARE_PROFILES);
  const [models] = useState<PresetModel[]>(PRESET_MODELS);
  const [selectedHwId, setSelectedHwId] = useState<string>('ESP32-S3');
  const [selectedModelId, setSelectedModelId] = useState<string>('kws');
  const [customFile, setCustomFile] = useState<File | null>(null);

  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);

  // Initialize immediately with guaranteed verified fallback so page is 100% instant & never broken
  const [compilationResult, setCompilationResult] = useState<CompilationResult>(() =>
    getOfflineFallbackResult('kws', 'ESP32-S3')
  );
  const [apiConnected, setApiConnected] = useState<boolean>(true);

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
      .then((hw) => {
        setHardwareList(hw);
        setApiConnected(true);
      })
      .catch(() => {
        setHardwareList(HARDWARE_PROFILES);
        setApiConnected(false);
      });
  }, []);

  const runCompilation = async (modelId: string, hwId: string, fileToUpload: File | null = customFile) => {
    setIsCompiling(true);
    try {
      let res: CompilationResult;
      if (fileToUpload) {
        res = await uploadAndCompileModel(fileToUpload, hwId);
      } else {
        res = await compileModel(modelId, hwId);
      }
      setCompilationResult(res);
      setApiConnected(true);
    } catch {
      setCompilationResult(getOfflineFallbackResult(modelId, hwId));
      setApiConnected(false);
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    runCompilation(selectedModelId, selectedHwId, customFile);
  }, [selectedModelId, selectedHwId]);

  const handleSelectModel = (id: string) => {
    setCustomFile(null);
    setSelectedModelId(id);
  };

  const handleUploadCustom = (file: File) => {
    setCustomFile(file);
    runCompilation('custom', selectedHwId, file);
  };

  const handleDownloadHeader = () => {
    if (!compilationResult) return;
    const blob = new Blob([compilationResult.c_header_code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shannon_${compilationResult.model_name.toLowerCase().replace(/\s+/g, '_')}_model.h`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenStudio = (tab?: string) => {
    if (tab && (tab === 'dashboard' || tab === 'impulse' || tab === 'dsp' || tab === 'classifier' || tab === 'live' || tab === 'arena' || tab === 'deployment')) {
      setActiveTab(tab as TabType);
    }
    setViewMode('studio');
  };

  const selectedModel = models.find((m) => m.id === selectedModelId) || null;
  const selectedHw = hardwareList.find((h) => h.name === selectedHwId) || hardwareList[0];

  // 1. Ollama Minimalist Documentation & CLI Home View
  if (viewMode === 'home') {
    return (
      <OllamaHomeView
        onOpenStudio={handleOpenStudio}
        result={compilationResult}
        selectedModel={selectedModel}
        selectedHw={selectedHw}
        models={models}
        onSelectModel={handleSelectModel}
        onDownloadHeader={handleDownloadHeader}
      />
    );
  }

  // 2. Full Edge Impulse Studio Workspace View
  return (
    <div className="flex h-screen bg-[#0E131F] text-[#F8FAFC] font-sans overflow-hidden">
      {/* Left Sidebar Navigation (Edge Impulse Studio Standard) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        selectedHw={selectedHw}
        isCopilotOpen={isCopilotOpen}
        setIsCopilotOpen={setIsCopilotOpen}
      />

      {/* Main Workspace Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0E131F]">
        {/* Top Navigation Bar with Back to Home button */}
        <TopBar
          selectedModel={selectedModel}
          models={models}
          onSelectModel={handleSelectModel}
          hardwareList={hardwareList}
          selectedHw={selectedHw}
          onSelectHw={(hwName) => setSelectedHwId(hwName)}
          onUploadCustom={handleUploadCustom}
          isCompiling={isCompiling}
          onRecompile={() => runCompilation(selectedModelId, selectedHwId, customFile)}
          onDownloadHeader={handleDownloadHeader}
          isCopilotOpen={isCopilotOpen}
          setIsCopilotOpen={setIsCopilotOpen}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          apiConnected={apiConnected}
          onBackToHome={() => setViewMode('home')}
        />

        {/* Dynamic Studio Tab View Body */}
        <main className="flex-1 overflow-y-auto bg-[#0E131F] custom-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardView
              result={compilationResult}
              selectedModel={selectedModel}
              models={models}
              onSelectModel={handleSelectModel}
              selectedHw={selectedHw}
              onNavigateToTab={setActiveTab}
              onUploadCustom={handleUploadCustom}
            />
          )}

          {activeTab === 'impulse' && (
            <ImpulseDesignView
              result={compilationResult}
              selectedModel={selectedModel}
              selectedHw={selectedHw}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'dsp' && (
            <DspBlockView
              result={compilationResult}
              selectedModel={selectedModel}
              selectedHw={selectedHw}
            />
          )}

          {activeTab === 'classifier' && (
            <NnClassifierView
              result={compilationResult}
              selectedModel={selectedModel}
              selectedHw={selectedHw}
            />
          )}

          {activeTab === 'live' && (
            <LiveClassificationView
              result={compilationResult}
              selectedModel={selectedModel}
              selectedHw={selectedHw}
            />
          )}

          {activeTab === 'arena' && (
            <MemoryArenaView
              result={compilationResult}
              selectedModel={selectedModel}
              selectedHw={selectedHw}
            />
          )}

          {activeTab === 'deployment' && (
            <DeploymentView
              result={compilationResult}
              selectedModel={selectedModel}
              selectedHw={selectedHw}
              onDownloadHeader={handleDownloadHeader}
            />
          )}
        </main>
      </div>

      {/* Silicon Copilot Assistant Drawer */}
      <SiliconCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        result={compilationResult}
        selectedModel={selectedModel}
        selectedHw={selectedHw}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        models={models}
        hardwareList={hardwareList}
        onSelectModel={handleSelectModel}
        onSelectHardware={(hwName) => setSelectedHwId(hwName)}
        onTriggerCompile={() => runCompilation(selectedModelId, selectedHwId, customFile)}
        onDownloadHeader={handleDownloadHeader}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}