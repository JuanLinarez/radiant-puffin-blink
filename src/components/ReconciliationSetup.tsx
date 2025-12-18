import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, Link, GitBranch } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import HardKeySelector from "./HardKeySelector";
import SoftKeySelector from "./SoftKeySelector";
import StrictnessControls from "./StrictnessControls";

type StrictnessMode = 'Exacto' | 'Balanceado' | 'Flexible';

interface ToleranceSettings {
  amountTolerancePercent: number;
  dateToleranceDays: number;
  textFuzzyThreshold: number;
  weighting: Record<string, number>;
  autoMatchThreshold: number; // Score required for automatic match
  suggestedMatchThreshold: number; // Score required for suggested match
  reviewThreshold: number; // NEW: Score required for 'Pending Review' classification
}

interface ReconciliationConfig {
  file1: File | null;
  file2: File | null;
  
  // Connection Method (Step 6)
  connectionHubSpoke: boolean;
  connectionChain: boolean;
  
  // Record Relationship (Step 2)
  relationOneToOne: boolean;
  relationOneToMany: boolean;
  
  // Key Selection (Steps 3 & 4)
  hardKeys: string[];
  softKeys: string[];

  // Strictness (Step 5)
  strictnessMode: StrictnessMode;
  toleranceSettings: ToleranceSettings;
}

// Conceptual list of all columns detected from files A and B
const CONCEPTUAL_COLUMNS = ['Vendor Code', 'Currency', 'Company Code', 'Amount', 'Date', 'Vendor Name', 'Description'];


const ReconciliationSetup: React.FC = () => {
  const [config, setConfig] = useState<ReconciliationConfig>({
    file1: null,
    file2: null,
    
    connectionHubSpoke: true,
    connectionChain: false,
    
    relationOneToOne: true,
    relationOneToMany: false,
    
    hardKeys: ['Vendor Code', 'Currency', 'Company Code'], // Default hard keys
    softKeys: [],
    
    strictnessMode: 'Exacto',
    toleranceSettings: {
      amountTolerancePercent: 0.5,
      dateToleranceDays: 7,
      textFuzzyThreshold: 80,
      // Initial weighting set up for potential 3-way split (Amount, Date, Text)
      weighting: { Amount: 33, Date: 33, Text: 34 }, 
      autoMatchThreshold: 95,
      suggestedMatchThreshold: 70,
      reviewThreshold: 40, // Default value for the new threshold
    },
  });

  // Handlers for existing sections
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: keyof Pick<ReconciliationConfig, 'file1' | 'file2'>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setConfig(prev => ({ ...prev, [fileKey]: file }));
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
          newStrictnessMode = 'Exacto';
      }
      // If we lose text keys, Flexible mode is no longer possible. Revert to Balanceado if Amount/Date exists, otherwise Exacto.
      if (prev.strictnessMode === 'Flexible' && !hasText) {
          newStrictnessMode = hasAmountOrDate ? 'Balanceado' : 'Exacto';
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
    if (!config.file1 || !config.file2) {
      return;
    }
    
    console.log("Starting reconciliation with config:", config);
    showSuccess("Configuración guardada. Iniciando proceso de reconciliación (simulado).");
  };

  const isReadyToStart = config.file1 && config.file2 && config.hardKeys.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Configuración de Reconciliación</h2>

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
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="file1">Archivo de Origen (A)</Label>
            <Input 
              id="file1" 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={(e) => handleFileChange(e, 'file1')} 
            />
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

      {/* 3. Hard Keys (Required) */}
      <HardKeySelector
        availableColumns={CONCEPTUAL_COLUMNS}
        selectedKeys={config.hardKeys}
        onKeyChange={handleHardKeyChange}
      />

      {/* 4. Soft Keys (Optional) */}
      <SoftKeySelector
        availableColumns={CONCEPTUAL_COLUMNS}
        selectedKeys={config.softKeys}
        onKeyChange={handleSoftKeyChange}
      />

      {/* 5. Strictness / Nivel de Tolerancia */}
      <StrictnessControls
        softKeys={config.softKeys}
        currentMode={config.strictnessMode}
        onModeChange={handleStrictnessModeChange}
        toleranceSettings={config.toleranceSettings}
        onToleranceChange={handleToleranceSettingChange}
      />

      {/* 6. Método de Conexión */}
      <Card className="shadow-xl rounded-xl border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
            <GitBranch className="w-5 h-5" /> 6. Método de Conexión
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

      {/* Start Button */}
      <div className="text-center pt-4">
        <Button 
          size="lg" 
          onClick={handleStartReconciliation} 
          disabled={!isReadyToStart}
          className="w-full md:w-auto"
        >
          Iniciar Reconciliación
        </Button>
        {!isReadyToStart && (
          <p className="mt-2 text-sm text-destructive">Carga ambos archivos y selecciona al menos una Hard Key para continuar.</p>
        )}
      </div>
    </div>
  );
};

export default ReconciliationSetup;