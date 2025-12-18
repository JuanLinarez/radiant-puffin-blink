import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, Link, GitBranch, Key } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import HardKeySelector from "./HardKeySelector";
import SoftKeySelector from "./SoftKeySelector";
import StrictnessControls from "./StrictnessControls";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import ConfigurationSummary from "./ConfigurationSummary";
import HardKeyDecisionResults from "./HardKeyDecisionResults"; // Importamos HardKeyDecisionResults

type StrictnessMode = 'Conservador' | 'Balanceado' | 'Flexible';

interface ToleranceSettings {
  amountTolerancePercent: number;
  dateToleranceDays: number;
  textFuzzyThreshold: number;
  weighting: Record<string, number>;
  autoMatchThreshold: number; // Score required for automatic match
  suggestedMatchThreshold: number; // Score required for suggested match
  reviewThreshold: number; // NEW: Score required for 'Pending Review' classification
}

export interface ReconciliationConfig {
  file1: File | null;
  file2: File | null;
  
  // Connection Method (Step 3)
  connectionHubSpoke: boolean;
  connectionChain: boolean;
  
  // Record Relationship (Step 2)
  relationOneToOne: boolean;
  relationOneToMany: boolean;
  
  // Key Selection (Steps 4 & 6)
  hardKeys: string[];
  softKeys: string[];

  // Strictness (Step 7)
  strictnessMode: StrictnessMode;
  toleranceSettings: ToleranceSettings;
}

// Conceptual list of all columns detected from files A and B
const CONCEPTUAL_COLUMNS = ['Vendor Code', 'Currency', 'Company Code', 'Amount', 'Date', 'Vendor Name', 'Description'];

const DEFAULT_CONFIG: ReconciliationConfig = {
  file1: null,
  file2: null,
  
  connectionHubSpoke: true,
  connectionChain: false,
  
  relationOneToOne: true,
  relationOneToMany: false,
  
  hardKeys: [], // Default hard keys: empty
  softKeys: [],
  
  strictnessMode: 'Conservador',
  toleranceSettings: {
    amountTolerancePercent: 0.5,
    dateToleranceDays: 7,
    textFuzzyThreshold: 80,
    weighting: { Amount: 33, Date: 33, Text: 34 }, 
    autoMatchThreshold: 95,
    suggestedMatchThreshold: 70,
    reviewThreshold: 40,
  },
};


const ReconciliationSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const incomingConfig = location.state?.config as ReconciliationConfig | undefined;
  const initialShowSoftKeySteps = location.state?.continueSoftKeys || false;

  const [config, setConfig] = useState<ReconciliationConfig>(
    incomingConfig || DEFAULT_CONFIG
  );
  
  // State to control visibility of Soft Keys and Strictness steps
  const [showSoftKeySteps, setShowSoftKeySteps] = useState(initialShowSoftKeySteps);

  // Handlers for existing sections
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: keyof Pick<ReconciliationConfig, 'file1' | 'file2'>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setConfig(prev => ({ ...prev, [fileKey]: file }));
    // Reset soft key steps visibility if files change
    setShowSoftKeySteps(false);
  };

  const handleRelationSwitchChange = (key: keyof Pick<ReconciliationConfig, 'relationOneToOne' | 'relationOneToMany'>, checked: boolean) => {
    if (checked) {
      setConfig(prev => ({
        ...prev,
        relationOneToOne: key === 'relationOneToOne',
        relationOneToMany: key === 'relationOneToMany',
      }));
    }
  };

  const handleConnectionSwitchChange = (key: keyof Pick<ReconciliationConfig, 'connectionHubSpoke' | 'connectionChain'>, checked: boolean) => {
    if (checked) {
      setConfig(prev => ({
        ...prev,
        connectionHubSpoke: key === 'connectionHubSpoke',
        connectionChain: key === 'connectionChain',
      }));
    }
  };

  // Handlers for Key Selection sections
  const handleHardKeyChange = (key: string, isSelected: boolean) => {
    setConfig(prev => {
      const newKeys = isSelected
        ? [...new Set([...prev.hardKeys, key])]
        : prev.hardKeys.filter(k => k !== key);
      
      // If hard keys change, reset soft key steps visibility
      setShowSoftKeySteps(false);
      
      return { ...prev, hardKeys: newKeys };
    });
  };

  const handleSoftKeyChange = (key: string, isSelected: boolean) => {
    setConfig(prev => {
      const newKeys = isSelected
        ? [...new Set([...prev.softKeys, key])]
        : prev.softKeys.filter(k => k !== key);
      
      // Logic to reset strictness mode if soft keys are removed and the current mode is no longer valid
      let newStrictnessMode: StrictnessMode = prev.strictnessMode;
      
      const hasAmountOrDate = newKeys.some(k => ['Amount', 'Date'].includes(k));
      const hasText = newKeys.some(k => ['Vendor Name', 'Description'].includes(k));

      if (prev.strictnessMode === 'Balanceado' && !hasAmountOrDate) {
          newStrictnessMode = 'Conservador';
      }
      // If we lose text keys, Flexible mode is no longer possible. Revert to Balanceado if Amount/Date exists, otherwise Conservador.
      if (prev.strictnessMode === 'Flexible' && !hasText) {
          newStrictnessMode = hasAmountOrDate ? 'Balanceado' : 'Conservador';
      }
      
      // If all soft keys are removed, revert to Conservador
      if (newKeys.length === 0) {
          newStrictnessMode = 'Conservador';
      }

      return { ...prev, softKeys: newKeys, strictnessMode: newStrictnessMode };
    });
  };

  // Handlers for Strictness Controls section
  const handleStrictnessModeChange = (mode: StrictnessMode, checked: boolean) => {
    if (checked) {
      setConfig(prev => ({ ...prev, strictnessMode: mode }));
    }
  };

  const handleToleranceSettingChange = (key: keyof ToleranceSettings, value: number | Record<string, number>) => {
    setConfig(prev => ({
      ...prev,
      toleranceSettings: {
        ...prev.toleranceSettings,
        [key]: value,
      },
    }));
  };

  const handleStartReconciliation = () => {
    if (config.hardKeys.length === 0) {
      return;
    }
    
    if (!showSoftKeySteps) {
      // Step 1: Hard Keys selected, move to Soft Keys setup
      setShowSoftKeySteps(true);
      showSuccess("Hard Keys configuradas. Continúa con Soft Keys.");
    } else {
      // Step 2: Soft Keys and Strictness configured, run final reconciliation
      // Navigate to results page, passing the full configuration state
      navigate('/results', { state: { config } });
      showSuccess("Configuración final enviada. Calculando resultados...");
    }
  };

  // The button is ready if at least one Hard Key is selected
  const isReadyToStart = config.hardKeys.length > 0;
  
  // Determine button text
  const buttonText = showSoftKeySteps 
    ? "Ejecutar Conciliación Final" 
    : (isReadyToStart ? "Continuar a Soft Keys" : "Iniciar Reconciliación");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        {showSoftKeySteps ? "Configuración de Soft Keys y Tolerancia" : "Configuración de Reconciliación"}
      </h2>

      {/* Configuration Summary (Visible when Hard Keys are selected, and Soft Key steps are NOT active) */}
      {isReadyToStart && !showSoftKeySteps && (
        <ConfigurationSummary config={config} />
      )}

      {/* Initial Setup Steps (Hidden if Soft Key steps are active) */}
      {!showSoftKeySteps && (
        <>
          {/* 1. Carga de Archivos Excel */}
          <Card className="shadow-xl rounded-xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
                <Upload className="w-5 h-5" /> 1. Carga de Archivos Excel
              </CardTitle>
              <CardDescription>
                Selecciona los dos archivos que deseas conciliar.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="file1">Archivo de Origen (A)</Label>
                <Input 
                  id="file1" 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={(e) => handleFileChange(e, 'file1')} 
                />
                {/* Display file name if loaded, even if restored from state */}
                {config.file1 && <p className="text-sm text-muted-foreground truncate">Cargado: {config.file1.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="file2">Archivo a Reconciliar (B)</Label>
                <Input 
                  id="file2" 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={(e) => handleFileChange(e, 'file2')} 
                />
                {/* Display file name if loaded, even if restored from state */}
                {config.file2 && <p className="text-sm text-muted-foreground truncate">Cargado: {config.file2.name}</p>}
              </div>
            </CardContent>
          </Card>

          {/* 2. Relación de Registros */}
          <Card className="shadow-xl rounded-xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
                <Link className="w-5 h-5" /> 2. Relación de Registros
              </CardTitle>
              <CardDescription>
                Define cómo se espera que se relacionen los registros entre el Archivo A y el Archivo B.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors border">
                <Label htmlFor="relation-1-1" className="flex flex-col space-y-1 cursor-pointer pr-2">
                  <span className="font-medium">1:1 (Uno a Uno)</span>
                  <p className="text-xs text-muted-foreground">Cada registro en A coincide con exactamente un registro en B.</p>
                </Label>
                <Switch
                  id="relation-1-1"
                  checked={config.relationOneToOne}
                  onCheckedChange={(checked) => handleRelationSwitchChange('relationOneToOne', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors border">
                <Label htmlFor="relation-1-n" className="flex flex-col space-y-1 cursor-pointer pr-2">
                  <span className="font-medium">1:Muchos / Muchos:1</span>
                  <p className="text-xs text-muted-foreground">Permite que un registro en un archivo coincida con múltiples registros en el otro.</p>
                </Label>
                <Switch
                  id="relation-1-n"
                  checked={config.relationOneToMany}
                  onCheckedChange={(checked) => handleRelationSwitchChange('relationOneToMany', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. Método de Conexión */}
          <Card className="shadow-xl rounded-xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
                <GitBranch className="w-5 h-5" /> 3. Método de Conexión
              </CardTitle>
              <CardDescription>
                Define cómo se conectan los archivos entre sí para la conciliación.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors border">
                <Label htmlFor="connection-hub" className="flex flex-col space-y-1 cursor-pointer pr-2">
                  <span className="font-medium">Hub-and-spoke (Maestro)</span>
                  <p className="text-xs text-muted-foreground">Elige un archivo maestro y concilia los demás contra él (recomendado).</p>
                </Label>
                <Switch
                  id="connection-hub"
                  checked={config.connectionHubSpoke}
                  onCheckedChange={(checked) => handleConnectionSwitchChange('connectionHubSpoke', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors border">
                <Label htmlFor="connection-chain" className="flex flex-col space-y-1 cursor-pointer pr-2">
                  <span className="font-medium">Chain / Pipeline</span>
                  <p className="text-xs text-muted-foreground">A ↔ B ↔ C ↔ D, útil cuando cada archivo representa una etapa del proceso.</p>
                </Label>
                <Switch
                  id="connection-chain"
                  checked={config.connectionChain}
                  onCheckedChange={(checked) => handleConnectionSwitchChange('connectionChain', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Hard Keys (Required) */}
          <HardKeySelector
            availableColumns={CONCEPTUAL_COLUMNS}
            selectedKeys={config.hardKeys}
            onKeyChange={handleHardKeyChange}
          />
        </>
      )}
      
      {/* 6. Soft Keys (Optional) - Always visible if Soft Key steps are active */}
      {showSoftKeySteps && (
        <>
          <SoftKeySelector
            availableColumns={CONCEPTUAL_COLUMNS}
            selectedKeys={config.softKeys}
            onKeyChange={handleSoftKeyChange}
          />

          {/* 7. Strictness / Nivel de Tolerancia - Always visible if Soft Key steps are active */}
          <StrictnessControls
            softKeys={config.softKeys}
            currentMode={config.strictnessMode}
            onModeChange={handleStrictnessModeChange}
            toleranceSettings={config.toleranceSettings}
            onToleranceChange={handleToleranceSettingChange}
          />
        </>
      )}

      {/* Start Button */}
      <div className="text-center pt-4">
        <Button 
          size="lg" 
          onClick={handleStartReconciliation} 
          disabled={!isReadyToStart}
          className="w-full md:w-auto"
        >
          {buttonText}
        </Button>
        {!isReadyToStart && (
          <p className="mt-2 text-sm text-destructive">Selecciona al menos una Hard Key para continuar.</p>
        )}
      </div>
    </div>
  );
};

export default ReconciliationSetup;