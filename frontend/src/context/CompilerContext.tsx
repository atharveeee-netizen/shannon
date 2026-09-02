import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  HardwareProfile,
  CompilationResult,
  PipelineStage,
  CompilerLogEntry,
} from '../types';
import { HARDWARE_PROFILES, PRESET_MODELS, fetchHardware, compileModel, uploadAndCompileModel } from '../services/api';
import { getPresetGraphById } from '../compiler/presets';
import { ModelParser } from '../compiler/parser';
import { ModelGraph } from '../compiler/ir';

export type ModelStatus = 'EMPTY' | 'READY' | 'COMPILING' | 'SUCCESS' | 'FAILED';

interface LoadedModelInfo {
  id: string;
  name: string;
  domain: string;
  architecture: string;
  dataset: string;
  description: string;
  input_shape: string;
  input_type: string;
  isCustom?: boolean;
  file?: File;
  rawGraph?: ModelGraph;
}

interface CompilerContextType {
  loadedModel: LoadedModelInfo | null;
  modelStatus: ModelStatus;
  selectedHw: HardwareProfile;
  hardwareList: HardwareProfile[];
  compilationResult: CompilationResult | null;
  isCompiling: boolean;
  compilationError: string | null;
  pipelineStages: PipelineStage[];
  compilerLogs: CompilerLogEntry[];
  selectedNodeId: string | null;
  isTargetInvalidated: boolean;
  activeTab: string;
  isCopilotOpen: boolean;
  isDarkMode: boolean;
  apiConnected: boolean;
  setActiveTab: (tab: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setIsCopilotOpen: (open: boolean) => void;
  setIsDarkMode: (dark: boolean) => void;
  setHardware: (hwId: string) => void;
  loadPreset: (presetId: string, autoCompile?: boolean) => Promise<void>;
  uploadCustomModel: (file: File, autoCompile?: boolean) => Promise<void>;
  triggerCompile: () => Promise<void>;
  clearModel: () => void;
  downloadHeader: () => void;
}

const CompilerContext = createContext<CompilerContextType | null>(null);

export const CompilerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hardwareList, setHardwareList] = useState<HardwareProfile[]>(HARDWARE_PROFILES);
  const [selectedHw, setSelectedHw] = useState<HardwareProfile>(HARDWARE_PROFILES[0]);
  const [loadedModel, setLoadedModel] = useState<LoadedModelInfo | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('EMPTY');
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [compilerLogs, setCompilerLogs] = useState<CompilerLogEntry[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isTargetInvalidated, setIsTargetInvalidated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(true);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('shannon_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shannon_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shannon_theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch real hardware list on mount
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

  const setHardware = (hwId: string) => {
    const hw = hardwareList.find((h) => h.id === hwId) || hardwareList[0];
    setSelectedHw(hw);

    if (compilationResult && compilationResult.target_hardware !== hwId) {
      setIsTargetInvalidated(true);
    }
  };

  const loadPreset = async (presetId: string, autoCompile: boolean = true) => {
    const preset = PRESET_MODELS.find((p) => p.id === presetId);
    if (!preset) return;

    const graph = getPresetGraphById(presetId);
    const modelInfo: LoadedModelInfo = {
      ...preset,
      isCustom: false,
      rawGraph: graph,
    };

    setLoadedModel(modelInfo);
    setCompilationResult(null);
    setCompilationError(null);
    setSelectedNodeId(null);
    setIsTargetInvalidated(false);
    setModelStatus('READY');

    if (autoCompile) {
      await executeCompilation(presetId, selectedHw.id, null);
    }
  };

  const uploadCustomModel = async (file: File, autoCompile: boolean = true) => {
    try {
      setIsCompiling(true);
      setModelStatus('COMPILING');
      setCompilationError(null);

      const parsedGraph = await ModelParser.parseFile(file);
      const inShape = (parsedGraph.inputs[0] && parsedGraph.tensors[parsedGraph.inputs[0]]?.shape.join('x')) || '1x128';

      const modelInfo: LoadedModelInfo = {
        id: 'custom',
        name: parsedGraph.name,
        domain: 'Custom Upload',
        architecture: `${parsedGraph.layers.length}-Layer Graph`,
        dataset: file.name,
        description: `Imported from file: ${file.name}`,
        input_shape: inShape,
        input_type: 'Custom Tensor Buffer',
        isCustom: true,
        file,
        rawGraph: parsedGraph,
      };

      setLoadedModel(modelInfo);
      setCompilationResult(null);
      setSelectedNodeId(null);
      setIsTargetInvalidated(false);
      setModelStatus('READY');

      if (autoCompile) {
        await executeCompilation('custom', selectedHw.id, file);
      }
    } catch (err: any) {
      setModelStatus('FAILED');
      setCompilationError(err.message || 'Failed to parse model file');
      setIsCompiling(false);
    }
  };

  const executeCompilation = async (
    modelId: string,
    hwId: string,
    customFile: File | null = null
  ) => {
    setIsCompiling(true);
    setModelStatus('COMPILING');
    setCompilationError(null);
    setIsTargetInvalidated(false);

    try {
      let result: CompilationResult;
      if (customFile) {
        result = await uploadAndCompileModel(customFile, hwId);
      } else {
        result = await compileModel(modelId, hwId);
      }

      setCompilationResult(result);
      setPipelineStages(result.pipeline_stages || []);
      setCompilerLogs(result.logs || []);
      setModelStatus('SUCCESS');
      if (result.layers.length > 0 && !selectedNodeId) {
        setSelectedNodeId(result.layers[0].layer_id);
      }
    } catch (err: any) {
      setModelStatus('FAILED');
      setCompilationError(err.message || 'Compilation failed');
    } finally {
      setIsCompiling(false);
    }
  };

  const triggerCompile = async () => {
    if (!loadedModel) return;
    await executeCompilation(loadedModel.id, selectedHw.id, loadedModel.file || null);
  };

  const clearModel = () => {
    setLoadedModel(null);
    setCompilationResult(null);
    setCompilationError(null);
    setModelStatus('EMPTY');
    setPipelineStages([]);
    setCompilerLogs([]);
    setSelectedNodeId(null);
    setIsTargetInvalidated(false);
  };

  const downloadHeader = () => {
    if (!compilationResult || !compilationResult.c_header_code) return;
    const blob = new Blob([compilationResult.c_header_code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = compilationResult.model_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    link.download = `shannon_${safeName}_model.h`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CompilerContext.Provider
      value={{
        loadedModel,
        modelStatus,
        selectedHw,
        hardwareList,
        compilationResult,
        isCompiling,
        compilationError,
        pipelineStages,
        compilerLogs,
        selectedNodeId,
        isTargetInvalidated,
        activeTab,
        isCopilotOpen,
        isDarkMode,
        apiConnected,
        setActiveTab,
        setSelectedNodeId,
        setIsCopilotOpen,
        setIsDarkMode,
        setHardware,
        loadPreset,
        uploadCustomModel,
        triggerCompile,
        clearModel,
        downloadHeader,
      }}
    >
      {children}
    </CompilerContext.Provider>
  );
};

export const useCompiler = () => {
  const ctx = useContext(CompilerContext);
  if (!ctx) {
    throw new Error('useCompiler must be used within a CompilerProvider');
  }
  return ctx;
};
