import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, Settings, Link } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface ReconciliationConfig {
  file1: File | null;
  file2: File | null;
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

  const handleSwitchChange = (key: keyof Omit<ReconciliationConfig, 'file1' | 'file2'>, checked: boolean) => {
    setConfig(prev => ({ ...prev, [key]: checked }));
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

      {/* Section 1: File Upload */}
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Upload className="w-5 h-5 text-blue-600" /> 1. Carga de Archivos Excel
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

      {/* Section 2: Record Relationship */}
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Link className="w-5 h-5 text-blue-600" /> 2. Relación de Registros
          </CardTitle>
          <CardDescription>
            Define cómo se espera que se relacionen los registros entre el Archivo A y el Archivo B.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <Label htmlFor="relation-1-1" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">1:1 (Uno a Uno)</span>
              <p className="text-sm text-muted-foreground">Cada registro en A coincide con exactamente un registro en B.</p>
            </Label>
            <Switch
              id="relation-1-1"
              checked={config.relationOneToOne}
              onCheckedChange={(checked) => handleSwitchChange('relationOneToOne', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <Label htmlFor="relation-1-n" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">1:Muchos / Muchos:1</span>
              <p className="text-sm text-muted-foreground">Permite que un registro en un archivo coincida con múltiples registros en el otro.</p>
            </Label>
            <Switch
              id="relation-1-n"
              checked={config.relationOneToMany}
              onCheckedChange={(checked) => handleSwitchChange('relationOneToMany', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Comparison Tolerance */}
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Settings className="w-5 h-5 text-blue-600" /> 3. Nivel de Tolerancia
          </CardTitle>
          <CardDescription>
            Selecciona la estrictez con la que se compararán los valores (e.g., montos).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <Label htmlFor="tolerance-exact" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">Exacto</span>
              <p className="text-sm text-muted-foreground">Solo se aceptan coincidencias perfectas (0% de variación).</p>
            </Label>
            <Switch
              id="tolerance-exact"
              checked={config.toleranceExact}
              onCheckedChange={(checked) => handleSwitchChange('toleranceExact', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <Label htmlFor="tolerance-balanced" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">Balanceado</span>
              <p className="text-sm text-muted-foreground">Permite pequeñas variaciones (e.g., hasta 0.5% o un monto fijo menor).</p>
            </Label>
            <Switch
              id="tolerance-balanced"
              checked={config.toleranceBalanced}
              onCheckedChange={(checked) => handleSwitchChange('toleranceBalanced', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
            <Label htmlFor="tolerance-flexible" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium">Flexible</span>
              <p className="text-sm text-muted-foreground">Permite variaciones significativas o utiliza lógica de coincidencia difusa.</p>
            </Label>
            <Switch
              id="tolerance-flexible"
              checked={config.toleranceFlexible}
              onCheckedChange={(checked) => handleSwitchChange('toleranceFlexible', checked)}
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
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
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