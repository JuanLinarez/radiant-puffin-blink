import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, Settings, Link, GitBranch } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface ReconciliationConfig {
  file1: File | null;
  file2: File | null;
  connectionHubSpoke: boolean;
  connectionChain: boolean;
  relationOneToOne: boolean;
  relationOneToMany: boolean;
  toleranceExact: boolean;
  toleranceBalanced: boolean;
  toleranceFlexible: boolean;
}

const ReconciliationSetup: React.FC = () => {
  const [config, setConfig] = useState<ReconciliationConfig>({
    file1: null,
    file2: null,
    connectionHubSpoke: true, // Default to Hub-and-spoke
    connectionChain: false,
    relationOneToOne: true,
    relationOneToMany: false,
    toleranceExact: true,
    toleranceBalanced: false,
    toleranceFlexible: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: keyof Pick<ReconciliationConfig, 'file1' | 'file2'>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setConfig(prev => ({ ...prev, [fileKey]: file }));
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

  const handleRelationSwitchChange = (key: keyof Pick<ReconciliationConfig, 'relationOneToOne' | 'relationOneToMany'>, checked: boolean) => {
    if (checked) {
      setConfig(prev => ({
        ...prev,
        relationOneToOne: key === 'relationOneToOne',
        relationOneToMany: key === 'relationOneToMany',
      }));
    }
  };

  const handleToleranceSwitchChange = (key: keyof Pick<ReconciliationConfig, 'toleranceExact' | 'toleranceBalanced' | 'toleranceFlexible'>, checked: boolean) => {
    if (checked) {
      setConfig(prev => ({
        ...prev,
        toleranceExact: key === 'toleranceExact',
        toleranceBalanced: key === 'toleranceBalanced',
        toleranceFlexible: key === 'toleranceFlexible',
      }));
    }
  };

  const handleStartReconciliation = () => {
    if (!config.file1 || !config.file2) {
      alert("Por favor, carga ambos archivos antes de iniciar la reconciliación.");
      return;
    }
    
    // Placeholder for actual reconciliation logic
    console.log("Starting reconciliation with config:", config);
    showSuccess("Configuración guardada. Iniciando proceso de reconciliación (simulado).");
  };

  const isReadyToStart = config.file1 && config.file2;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Configuración de Reconciliación</h2>

      {/* Section 1: File Upload (Unchanged) */}
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

      {/* Section 2: Record Relationship (Moved up) */}
      <Card className="shadow-xl rounded-xl border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
            <Link className="w-5 h-5" /> 2. Relación de Registros
          </CardTitle>
          <CardDescription>
            Define cómo se espera que se relacionen los registros entre el Archivo A y el Archivo B.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
            <Label htmlFor="relation-1-1" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">1:1 (Uno a Uno)</span>
              <p className="text-sm text-muted-foreground">Cada registro en A coincide con exactamente un registro en B.</p>
            </Label>
            <Switch
              id="relation-1-1"
              checked={config.relationOneToOne}
              onCheckedChange={(checked) => handleRelationSwitchChange('relationOneToOne', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
            <Label htmlFor="relation-1-n" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">1:Muchos / Muchos:1</span>
              <p className="text-sm text-muted-foreground">Permite que un registro en un archivo coincida con múltiples registros en el otro.</p>
            </Label>
            <Switch
              id="relation-1-n"
              checked={config.relationOneToMany}
              onCheckedChange={(checked) => handleRelationSwitchChange('relationOneToMany', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Comparison Tolerance (Moved up) */}
      <Card className="shadow-xl rounded-xl border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
            <Settings className="w-5 h-5" /> 3. Nivel de Tolerancia
          </CardTitle>
          <CardDescription>
            Selecciona la estrictez con la que se compararán los valores (e.g., montos).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
            <Label htmlFor="tolerance-exact" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">Exacto</span>
              <p className="text-sm text-muted-foreground">Solo se aceptan coincidencias perfectas (0% de variación).</p>
            </Label>
            <Switch
              id="tolerance-exact"
              checked={config.toleranceExact}
              onCheckedChange={(checked) => handleToleranceSwitchChange('toleranceExact', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
            <Label htmlFor="tolerance-balanced" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">Balanceado</span>
              <p className="text-sm text-muted-foreground">Permite pequeñas variaciones (e.g., hasta 0.5% o un monto fijo menor).</p>
            </Label>
            <Switch
              id="tolerance-balanced"
              checked={config.toleranceBalanced}
              onCheckedChange={(checked) => handleToleranceSwitchChange('toleranceBalanced', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
            <Label htmlFor="tolerance-flexible" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">Flexible</span>
              <p className="text-sm text-muted-foreground">Permite variaciones significativas o utiliza lógica de coincidencia difusa.</p>
            </Label>
            <Switch
              id="tolerance-flexible"
              checked={config.toleranceFlexible}
              onCheckedChange={(checked) => handleToleranceSwitchChange('toleranceFlexible', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Connection Method (Moved down) */}
      <Card className="shadow-xl rounded-xl border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
            <GitBranch className="w-5 h-5" /> 4. Método de Conexión
          </CardTitle>
          <CardDescription>
            Define cómo se conectan los archivos entre sí para la conciliación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
            <Label htmlFor="connection-hub" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">Hub-and-spoke (Maestro)</span>
              <p className="text-sm text-muted-foreground">Elige un archivo maestro y concilia los demás contra él (recomendado).</p>
            </Label>
            <Switch
              id="connection-hub"
              checked={config.connectionHubSpoke}
              onCheckedChange={(checked) => handleConnectionSwitchChange('connectionHubSpoke', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
            <Label htmlFor="connection-chain" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">Chain / Pipeline</span>
              <p className="text-sm text-muted-foreground">A ↔ B ↔ C ↔ D, útil cuando cada archivo representa una etapa del proceso.</p>
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
          <p className="mt-2 text-sm text-destructive">Carga ambos archivos para continuar.</p>
        )}
      </div>
    </div>
  );
};

export default ReconciliationSetup;