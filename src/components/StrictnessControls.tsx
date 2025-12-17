import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, CheckCircle, Scale, SlidersHorizontal } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';

// --- Types for Strictness Controls ---
type StrictnessMode = 'Exacto' | 'Balanceado' | 'Flexible';

interface WeightingSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const WeightingSlider: React.FC<WeightingSliderProps> = ({ label, value, onChange }) => (
  <div className="space-y-2 p-2 border rounded-md bg-background/50">
    <div className="flex justify-between items-center">
      <Label className="font-medium text-sm">{label}</Label>
      <span className="text-sm font-semibold text-primary">{value}%</span>
    </div>
    <Slider
      value={[value]}
      max={100}
      step={5}
      onValueChange={(v) => onChange(v[0])}
      className="w-full"
    />
  </div>
);

interface StrictnessControlsProps {
  softKeys: string[];
  currentMode: StrictnessMode;
  onModeChange: (mode: StrictnessMode, checked: boolean) => void;
  toleranceSettings: {
    amountTolerancePercent: number;
    dateToleranceDays: number;
    textFuzzyThreshold: number;
    weighting: Record<string, number>;
  };
  onToleranceChange: (key: keyof StrictnessControlsProps['toleranceSettings'], value: number | Record<string, number>) => void;
}

const StrictnessControls: React.FC<StrictnessControlsProps> = ({
  softKeys,
  currentMode,
  onModeChange,
  toleranceSettings,
  onToleranceChange,
}) => {
  const hasAmountOrDate = softKeys.some(key => ['Amount', 'Date'].includes(key));
  const hasText = softKeys.some(key => ['Vendor Name', 'Description'].includes(key));

  const availableWeights = useMemo(() => {
    const weights: string[] = [];
    if (softKeys.includes('Amount')) weights.push('Amount');
    if (softKeys.includes('Date')) weights.push('Date');
    // Group textual fields under 'Text' weight if any textual soft key is selected
    if (hasText) weights.push('Text'); 
    return weights;
  }, [softKeys, hasText]);

  const totalWeight = availableWeights.reduce((sum, key) => sum + (toleranceSettings.weighting[key] || 0), 0);

  const handleWeightChange = (key: string, value: number) => {
    const newWeighting = { ...toleranceSettings.weighting, [key]: value };
    onToleranceChange('weighting', newWeighting);
  };

  return (
    <Card className="shadow-xl rounded-xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
          <Settings className="w-5 h-5" /> 5. Strictness / Nivel de Tolerancia
        </CardTitle>
        <CardDescription>
          Define la estrictez con la que se compararán los valores, basado en las Soft Keys seleccionadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Mode Selection */}
        <div className="space-y-4 border-b pb-4">
          {/* Exacto Mode */}
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
            <Label htmlFor="mode-exacto" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Exacto</span>
              <p className="text-sm text-muted-foreground">Solo se aceptan coincidencias perfectas usando Hard Keys. (Default)</p>
            </Label>
            <Switch
              id="mode-exacto"
              checked={currentMode === 'Exacto'}
              onCheckedChange={(checked) => onModeChange('Exacto', checked)}
            />
          </div>

          {/* Balanceado Mode */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded-md transition-colors",
            hasAmountOrDate ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"
          )}>
            <Label htmlFor="mode-balanceado" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium flex items-center gap-2"><Scale className="w-4 h-4 text-yellow-500" /> Balanceado</span>
              <p className="text-sm text-muted-foreground">Permite pequeñas variaciones en montos y fechas. (Requiere Amount o Date en Soft Keys)</p>
            </Label>
            <Switch
              id="mode-balanceado"
              checked={currentMode === 'Balanceado'}
              disabled={!hasAmountOrDate}
              onCheckedChange={(checked) => onModeChange('Balanceado', checked)}
            />
          </div>

          {/* Flexible Mode */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded-md transition-colors",
            hasText ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"
          )}>
            <Label htmlFor="mode-flexible" className="flex flex-col space-y-1 cursor-pointer">
              <span className="font-medium flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-blue-500" /> Flexible</span>
              <p className="text-sm text-muted-foreground">Utiliza lógica de coincidencia difusa para campos de texto. (Requiere campos textuales en Soft Keys)</p>
            </Label>
            <Switch
              id="mode-flexible"
              checked={currentMode === 'Flexible'}
              disabled={!hasText}
              onCheckedChange={(checked) => onModeChange('Flexible', checked)}
            />
          </div>
        </div>

        {/* Dynamic Controls based on Mode */}
        {currentMode === 'Exacto' && softKeys.length > 0 && (
          <p className="text-sm text-muted-foreground italic">
            Sin soft keys seleccionadas, el match será exacto usando hard keys.
          </p>
        )}

        {currentMode === 'Balanceado' && hasAmountOrDate && (
          <div className="space-y-4">
            <h4 className="font-semibold text-md">Tolerancia Porcentual y Temporal</h4>
            {softKeys.includes('Amount') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Tolerancia de Monto (%)</Label>
                  <span className="text-sm font-medium">{toleranceSettings.amountTolerancePercent}%</span>
                </div>
                <Slider
                  value={[toleranceSettings.amountTolerancePercent]}
                  max={5}
                  step={0.1}
                  onValueChange={(v) => onToleranceChange('amountTolerancePercent', v[0])}
                  className="w-full"
                />
              </div>
            )}
            {softKeys.includes('Date') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Tolerancia de Fecha (Días)</Label>
                  <span className="text-sm font-medium">{toleranceSettings.dateToleranceDays} días</span>
                </div>
                <Slider
                  value={[toleranceSettings.dateToleranceDays]}
                  max={30}
                  step={1}
                  onValueChange={(v) => onToleranceChange('dateToleranceDays', v[0])}
                  className="w-full"
                />
              </div>
            )}

            <h4 className="font-semibold text-md mt-6">Pesos de Scoring (Total: {totalWeight}%)</h4>
            <p className="text-sm text-muted-foreground mb-2">Define la importancia relativa de cada Soft Key en el puntaje de coincidencia.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableWeights.map(key => (
                <WeightingSlider
                  key={key}
                  label={key}
                  value={toleranceSettings.weighting[key] || 0}
                  onChange={(value) => handleWeightChange(key, value)}
                />
              ))}
            </div>
          </div>
        )}

        {currentMode === 'Flexible' && hasText && (
          <div className="space-y-4">
            <h4 className="font-semibold text-md">Umbral de Coincidencia Textual (Fuzzy)</h4>
            <p className="text-sm text-muted-foreground">Define qué tan similar debe ser el texto para considerarse un match.</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Umbral de Similitud</Label>
                <span className="text-sm font-medium">{toleranceSettings.textFuzzyThreshold}%</span>
              </div>
              <Slider
                value={[toleranceSettings.textFuzzyThreshold]}
                max={100}
                step={5}
                onValueChange={(v) => onToleranceChange('textFuzzyThreshold', v[0])}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrictnessControls;