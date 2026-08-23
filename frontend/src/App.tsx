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
} from './services/api';
import { AppHeader } from './components/AppHeader';
import { ModelSelector } from './components/ModelSelector';
import { TransformationView } from './components/TransformationView';
import { TechnicalInspector } from './components/TechnicalInspector';
import { CommandPalette } from './components/CommandPalette';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('shannon_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark mode for developer tooling
  });

  const [hardwareList, setHardwareList] = useState<HardwareProfile[]>(HARDWARE_PROFILES);
  const [models] = useState<PresetModel[]>(PRESET_MODELS);
  const [selectedHwId, setSelectedHwId] = useState<string>('ESP32-S3');
  const [selectedModelId, setSelectedModelId] = useState<string>('kws');
  const [customFilename, setCustomFilename] = useState<string | null>(null);

  const [isCompiling, setIsCompiling] = useState<boolean>(false);
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
    fetchHardware().then((hw) => setHardwareList(hw));
  }, []);

  const runCompilation = async (modelId: string, hwId: string) => {
    setIsCompiling(true);
    try {
      const res = await compileModel(modelId, hwId);
      setCompilationResult(res);
    } catch (err) {
      console.error('Compilation error:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    runCompilation(selectedModelId, selectedHwId);
  }, [selectedModelId, selectedHwId]);

  const handleSelectModel = (id: string) => {
    setCustomFilename(null);
    setSelectedModelId(id);
  };

  const handleUploadCustom = (file: File) => {
    setCustomFilename(file.name);
    setSelectedModelId('vision');
  };

  const handleDownloadHeader = () => {
    if (!compilationResult) return;
    const blob = new Blob([compilationResult.c_header_code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shannon_model.h';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const currentHw = hardwareList.find((h) => h.id === selectedHwId) || hardwareList[0];

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-sans flex flex-col antialiased">
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onSelectHardware={setSelectedHwId}
        onSelectModel={handleSelectModel}
        onTriggerCompile={() => runCompilation(selectedModelId, selectedHwId)}
        onDownloadHeader={handleDownloadHeader}
        onToggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
        hardwareList={hardwareList}
        models={models}
      />

      <AppHeader
        hardwareList={hardwareList}
        selectedHwId={selectedHwId}
        onSelectHardware={setSelectedHwId}
        onOpenCommandPalette={() => setIsCmdOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
        {/* Step 1: Model Selection */}
        <section>
          <ModelSelector
            models={models}
            selectedModelId={selectedModelId}
            onSelectModel={handleSelectModel}
            customFilename={customFilename}
            onUploadCustom={handleUploadCustom}
          />
        </section>

        {/* Step 2: The Transformation (Before vs After) */}
        {compilationResult && (
          <section>
            <TransformationView
              result={compilationResult}
              targetHw={currentHw}
              isCompiling={isCompiling}
              onCompile={() => runCompilation(selectedModelId, selectedHwId)}
              onDownloadHeader={handleDownloadHeader}
            />
          </section>
        )}

        {/* Step 3: Technical Inspector (Progressive Disclosure) */}
        {compilationResult && (
          <section>
            <TechnicalInspector
              result={compilationResult}
              targetHw={currentHw}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6 text-center text-xs font-mono text-text-secondary">
        <span>Shannon TinyML Compiler • Zero Runtime Dynamic Allocations (MISRA-C:2012 Rule 21.3)</span>
      </footer>
    </div>
  );
}