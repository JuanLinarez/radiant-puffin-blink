import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, CheckCircle, Scale, SlidersHorizontal } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

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
      max={100} // Fixed max to 100 to ensure the slider is always draggable
      step={1}
      onValueChange={(v) => onChange(v[0])}
      className="w-full"
    />
  </div>
);

interface ToleranceSettings {
  amountTolerancePercent: number;
  dateToleranceDays: number;
  textFuzzyThreshold: number;
  weighting: Record<string, number>;
  autoMatchThreshold: number;
  suggestedMatchThreshold: number;
  reviewThreshold: number; // NEW
}

interface StrictnessControlsProps {
  softKeys: string[];
  currentMode: StrictnessMode;
  onModeChange: (mode: StrictnessMode, checked: boolean) => void;
  toleranceSettings: ToleranceSettings;
  onToleranceChange: (key: keyof ToleranceSettings, value: number | Record<string, number>) => void;
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

  const currentWeights = toleranceSettings.weighting;

  const availableWeights = useMemo(() => {
    if (currentMode === 'Exacto') return [];

    const weights: string[] = [];
    
    const selectedAmount = softKeys.includes('Amount');
    const selectedDate = softKeys.includes('Date');
    
    if (selectedAmount) weights.push('Amount');
    if (selectedDate) weights.push('Date');

    // Text is only included in Flexible mode if textual keys are selected
    if (currentMode === 'Flexible' && hasText) {
      weights.push('Text');
    }
    
    return weights;
  }, [softKeys, currentMode, hasText]);

  // --- Normalization Logic (New useEffect) ---
  useEffect(() => {
    if (currentMode === 'Exacto' || availableWeights.length === 0) {
      return;
    }

    const totalWeight = availableWeights.reduce((sum, key) => sum + (currentWeights[key] || 0), 0);
    
    // Check if the current active weights already sum to 100%
    if (totalWeight === 100) {
      return;
    }

    // If not 100%, normalize the weights
    const numWeights = availableWeights.length;
    const baseWeight = Math.floor(100 / numWeights);
    const remainder = 100 % numWeights;

    const newWeighting: Record<string, number> = {};
    let currentTotal = 0;

    availableWeights.forEach((key, index) => {
      // Distribute remainder to the first 'remainder' keys
      const weight = baseWeight + (index < remainder ? 1 : 0);
      newWeighting[key] = weight;
      currentTotal += weight;
    });
    
    // Ensure all non-active keys are reset to 0 (or removed, but setting to 0 is safer for state consistency)
    Object.keys(currentWeights).forEach(key => {
        if (!availableWeights.includes(key)) {
            newWeighting[key] = 0;
        }
    });

    // Only update if the calculated weights are different from the current state
    const isDifferent = availableWeights.some(key => newWeighting[key] !== currentWeights[key]);

    if (isDifferent) {
        onToleranceChange('weighting', newWeighting);
    }

  // We depend on availableWeights (which changes with softKeys and currentMode) and currentWeights (to check if normalization is needed)
  }, [availableWeights, currentWeights, currentMode, onToleranceChange]);
  // -------------------------------------------

  // Calculate total weight based ONLY on currently available weights
  const totalWeight = availableWeights.reduce((sum, key) => sum + (currentWeights[key] || 0), 0);
  const remainingWeight = 100 - totalWeight;

  const handleWeightChange = (keyToChange: string, newValue: number) => {
    // Ensure the new value is between 0 and 100
    newValue = Math.max(0, Math.min(100, newValue));

    const newWeighting = { ...currentWeights };
    newWeighting[keyToChange] = newValue;

    const otherKeys = availableWeights.filter(key => key !== keyToChange);
    const numOtherKeys = otherKeys.length;
    
    const remainingWeightForOthers = 100 - newValue;

    if (numOtherKeys === 0) {
      // Only one key active, it must be 100%
      newWeighting[keyToChange] = 100;
    } else if (numOtherKeys === 1) {
      // Two keys active: adjust the other one automatically
      const otherKey = otherKeys[0];
      newWeighting[otherKey] = remainingWeightForOthers;
    } else if (numOtherKeys === 2) {
      // Three keys active: distribute the remaining weight proportionally between the other two
      const [key1, key2] = otherKeys;
      
      const currentWeight1 = currentWeights[key1] || 0;
      const currentWeight2 = currentWeights[key2] || 0;
      const currentSumOfOthers = currentWeight1 + currentWeight2;

      if (currentSumOfOthers === 0) {
        // If the other two were zero, distribute equally
        newWeighting[key1] = Math.floor(remainingWeightForOthers / 2);
        newWeighting[key2] = remainingWeightForOthers - newWeighting[key1];
      } else {
        // Distribute proportionally
        const ratio1 = currentWeight1 / currentSumOfOthers;
        const ratio2 = currentWeight2 / currentSumOfOthers;
        
        // Calculate new weights, rounding to ensure total is 100
        const newWeight1 = Math.round(remainingWeightForOthers * ratio1);
        const newWeight2 = remainingWeightForOthers - newWeight1; // Ensure total is exactly remainingWeightForOthers
        
        newWeighting[key1] = newWeight1;
        newWeighting[key2] = newWeight2;
      }
    }

    onToleranceChange('weighting', newWeighting);
  };
  
  // Helper to check if we should show scoring controls
  const showScoringControls = currentMode !== 'Exacto' && availableWeights.length > 0;
  
  // Helper to check if we should show tolerance controls (Amount/Date/Fuzzy)
  const showToleranceControls = currentMode !== 'Exacto' && (hasAmountOrDate || hasText);

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

        {/* Dynamic Tolerance Controls */}
        {showToleranceControls && (
          <div className="space-y-4 border-b pb-4">
            <h4 className="font-semibold text-md text-primary">Controles de Tolerancia</h4>
            <p className="text-sm text-muted-foreground">Define los límites de variación aceptables para los campos.</p>

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

            {currentMode === 'Flexible' && hasText && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Umbral de Similitud Textual (Fuzzy %)</Label>
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
            )}
          </div>
        )}

        {/* Dynamic Scoring Controls */}
        {showScoringControls && (
          <div className="space-y-4 border-b pb-4">
            <h4 className="font-semibold text-md text-primary">Pesos de Scoring (Total: {totalWeight}%)</h4>
            
            <p className="text-sm text-muted-foreground mb-2">
              Define la importancia relativa de cada Soft Key en el puntaje de coincidencia. 
              Peso restante: <span className={cn("font-semibold", remainingWeight < 0 ? "text-destructive" : "text-primary")}>{remainingWeight}%</span>
            </p>
            
            {availableWeights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWeights.map(key => (
                  <WeightingSlider
                    key={key}
                    label={key}
                    value={currentWeights[key] || 0}
                    onChange={(value) => handleWeightChange(key, value)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Classification Thresholds */}
        {(currentMode === 'Balanceado' || currentMode === 'Flexible') && (
          <div className="space-y-4">
            <h4 className="font-semibold text-md text-primary">Umbrales de Clasificación de Match</h4>
            <p className="text-sm text-muted-foreground">Define los puntajes mínimos requeridos para clasificar una coincidencia.</p>

            {/* Auto Match Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Match Automático (Score %)</Label>
                <span className="text-sm font-medium">{toleranceSettings.autoMatchThreshold}%</span>
              </div>
              <Slider
                value={[toleranceSettings.autoMatchThreshold]}
                max={100}
                min={toleranceSettings.suggestedMatchThreshold + 1} // Must be higher than suggested
                step={1}
                onValueChange={(v) => onToleranceChange('autoMatchThreshold', v[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Coincidencias con este puntaje o superior se marcan automáticamente como Match.</p>
            </div>

            {/* Suggested Match Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Match Sugerido (Score %)</Label>
                <span className="text-sm font-medium">{toleranceSettings.suggestedMatchThreshold}%</span>
              </div>
              <Slider
                value={[toleranceSettings.suggestedMatchThreshold]}
                max={toleranceSettings.autoMatchThreshold - 1} // Must be lower than auto
                min={toleranceSettings.reviewThreshold + 1} // Must be higher than review
                step={1}
                onValueChange={(v) => onToleranceChange('suggestedMatchThreshold', v[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Coincidencias entre este puntaje y el Match Automático se marcan como Sugeridas.</p>
            </div>
            
            {/* Review Threshold (NEW) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Para Revisar (Score %)</Label>
                <span className="text-sm font-medium">{toleranceSettings.reviewThreshold}%</span>
              </div>
              <Slider
                value={[toleranceSettings.reviewThreshold]}
                max={toleranceSettings.suggestedMatchThreshold - 1} // Must be lower than suggested
                min={0}
                step={1}
                onValueChange={(v) => onToleranceChange('reviewThreshold', v[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Coincidencias entre este puntaje y el Match Sugerido se marcan como 'Para Revisar'. Por debajo de este puntaje, se consideran 'No Match'.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrictnessControls;