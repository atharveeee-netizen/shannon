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
} from './services/api';
import { AppHeader } from './components/AppHeader';
import { CompilerControls } from './components/CompilerControls';
import { CompileResult } from './components/CompileResult';
import { OptimizationTable } from './components/OptimizationTable';
import { TechnicalInspector } from './components/TechnicalInspector';
import { CommandPalette } from './components/CommandPalette';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('shannon_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  const [hardwareList, setHardwareList] = useState<HardwareProfile[]>(HARDWARE_PROFILES);
  const [models] = useState<PresetModel[]>(PRESET_MODELS);
  const [selectedHwId, setSelectedHwId] = useState<string>('ESP32-S3');
  const [selectedModelId, setSelectedModelId] = useState<string>('kws');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFilename, setCustomFilename] = useState<string | null>(null);

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

  const runCompilation = async (modelId: string, hwId: string, fileToUpload: File | null = customFile) => {
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
      setErrorMessage(err.message || 'Failed to connect to Shannon Compiler backend. Ensure server is running on http://localhost:8000.');
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    runCompilation(selectedModelId, selectedHwId, customFile);
  }, [selectedModelId, selectedHwId]);

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
    link.download = `shannon_${compilationResult.model_name.toLowerCase()}_model.h`;
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
        onTriggerCompile={() => runCompilation(selectedModelId, selectedHwId, customFile)}
        onDownloadHeader={handleDownloadHeader}
        onToggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
        hardwareList={hardwareList}
        models={models}
      />

      <AppHeader
        onOpenCommandPalette={() => setIsCmdOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {errorMessage && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-[4px] text-danger text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => runCompilation(selectedModelId, selectedHwId, customFile)}
              className="px-2 py-1 bg-danger text-canvas rounded text-[11px] font-medium hover:opacity-90 transition"
            >
              Retry
            </button>
          </div>
        )}

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

        {compilationResult && (
          <>
            <CompileResult
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
          </>
        )}
      </main>
    </div>
  );
}