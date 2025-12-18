import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, CheckCircle, Scale, SlidersHorizontal } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ThresholdVisualizer from './ThresholdVisualizer';

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
      max={100} // Fixed max to 100
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
  reviewThreshold: number;
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

  // --- Normalization Logic ---
  useEffect(() => {
    if (currentMode === 'Exacto' || availableWeights.length === 0) {
      return;
    }

    const totalWeight = availableWeights.reduce((sum, key) => sum + (currentWeights[key] || 0), 0);
    
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
    
    // Ensure all non-active keys are reset to 0
    Object.keys(currentWeights).forEach(key => {
        if (!availableWeights.includes(key)) {
            newWeighting[key] = 0;
        }
    });

    const isDifferent = availableWeights.some(key => newWeighting[key] !== currentWeights[key]);

    if (isDifferent) {
        onToleranceChange('weighting', newWeighting);
    }

  }, [availableWeights, currentWeights, currentMode, onToleranceChange]);
  // ---------------------------

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
      newWeighting[keyToChange] = 100;
    } else if (numOtherKeys === 1) {
      const otherKey = otherKeys[0];
      newWeighting[otherKey] = remainingWeightForOthers;
    } else if (numOtherKeys === 2) {
      const [key1, key2] = otherKeys;
      
      const currentWeight1 = currentWeights[key1] || 0;
      const currentWeight2 = currentWeights[key2] || 0;
      const currentSumOfOthers = currentWeight1 + currentWeight2;

      if (currentSumOfOthers === 0) {
        newWeighting[key1] = Math.floor(remainingWeightForOthers / 2);
        newWeighting[key2] = remainingWeightForOthers - newWeighting[key1];
      } else {
        const ratio1 = currentWeight1 / currentSumOfOthers;
        const newWeight1 = Math.round(remainingWeightForOthers * ratio1);
        const newWeight2 = remainingWeightForOthers - newWeight1;
        
        newWeighting[key1] = newWeight1;
        newWeighting[key2] = newWeight2;
      }
    }

    onToleranceChange('weighting', newWeighting);
  };
  
  // --- Handlers for Classification Thresholds (New Logic) ---
  const handleAutoMatchChange = (newValue: number) => {
    const suggested = toleranceSettings.suggestedMatchThreshold;
    // Must be at least 1 point higher than suggested, and max 100
    const validatedValue = Math.min(100, Math.max(newValue, suggested + 1));
    onToleranceChange('autoMatchThreshold', validatedValue);
  };

  const handleSuggestedMatchChange = (newValue: number) => {
    const auto = toleranceSettings.autoMatchThreshold;
    const review = toleranceSettings.reviewThreshold;
    
    // Must be less than auto and greater than review
    let validatedValue = Math.min(newValue, auto - 1);
    validatedValue = Math.max(validatedValue, review + 1);
    
    onToleranceChange('suggestedMatchThreshold', validatedValue);
  };

  const handleReviewThresholdChange = (newValue: number) => {
    const suggested = toleranceSettings.suggestedMatchThreshold;
    // Must be less than suggested, and min 0
    const validatedValue = Math.max(0, Math.min(newValue, suggested - 1));
    onToleranceChange('reviewThreshold', validatedValue);
  };
  // ----------------------------------------------------------
  
  // Helper to check if we should show scoring controls
  const showScoringControls = currentMode !== 'Exacto' && availableWeights.length > 0;
  
  // Helper to check if we should show tolerance controls (Amount/Date/Fuzzy)
  const showToleranceControls = currentMode !== 'Exacto' && (hasAmountOrDate || hasText);

  // Collect tolerance controls into an array for easier grid layout
  const toleranceControls = [];
  if (softKeys.includes('Amount')) {
    toleranceControls.push(
      <div key="amount" className="space-y-2">
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
        <p className="text-xs text-muted-foreground">Define los límites de variación aceptables para los montos.</p>
      </div>
    );
  }
  if (softKeys.includes('Date')) {
    toleranceControls.push(
      <div key="date" className="space-y-2">
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
        <p className="text-xs text-muted-foreground">Define los límites de variación aceptables para las fechas.</p>
      </div>
    );
  }
  if (currentMode === 'Flexible' && hasText) {
    toleranceControls.push(
      <div key="text" className="space-y-2">
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
        <p className="text-xs text-muted-foreground">Define el puntaje mínimo de similitud para campos de texto.</p>
      </div>
    );
  }


  return (
    <Card className="shadow-xl rounded-xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
          <Settings className="w-5 h-5" /> 6. Strictness / Nivel de Tolerancia
        </CardTitle>
        <CardDescription>
          Define la estrictez con la que se compararán los valores, basado en las Soft Keys seleccionadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b pb-4">
          {/* Exacto Mode */}
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors border">
            <Label htmlFor="mode-exacto" className="flex flex-col space-y-1 cursor-pointer pr-2">
              <span className="font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Exacto</span>
              <p className="text-xs text-muted-foreground">Solo se aceptan coincidencias perfectas usando Hard Keys. (Default)</p>
            </Label>
            <Switch
              id="mode-exacto"
              checked={currentMode === 'Exacto'}
              onCheckedChange={(checked) => onModeChange('Exacto', checked)}
            />
          </div>

          {/* Balanceado Mode */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded-md transition-colors border",
            hasAmountOrDate ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"
          )}>
            <Label htmlFor="mode-balanceado" className="flex flex-col space-y-1 cursor-pointer pr-2">
              <span className="font-medium flex items-center gap-2"><Scale className="w-4 h-4 text-yellow-500" /> Balanceado</span>
              <p className="text-xs text-muted-foreground">Permite pequeñas variaciones en montos y fechas. (Requiere Amount o Date en Soft Keys)</p>
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
            "flex items-center justify-between p-2 rounded-md transition-colors border",
            hasText ? "hover:bg-accent" : "opacity-50 cursor-not-allowed"
          )}>
            <Label htmlFor="mode-flexible" className="flex flex-col space-y-1 cursor-pointer pr-2">
              <span className="font-medium flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-blue-500" /> Flexible</span>
              <p className="text-xs text-muted-foreground">Utiliza lógica de coincidencia difusa para campos de texto. (Requiere campos textuales en Soft Keys)</p>
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
            <p className="text-sm text-muted-foreground mb-4">Define los límites de variación aceptables para los campos.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toleranceControls}
            </div>
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
            <p className="text-sm text-muted-foreground mb-4">Define los puntajes mínimos requeridos para clasificar una coincidencia.</p>

            <ThresholdVisualizer 
              auto={toleranceSettings.autoMatchThreshold}
              suggested={toleranceSettings.suggestedMatchThreshold}
              review={toleranceSettings.reviewThreshold}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Auto Match Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Match Automático (Score %)</Label>
                  <span className="text-sm font-medium">{toleranceSettings.autoMatchThreshold}%</span>
                </div>
                <Slider
                  value={[toleranceSettings.autoMatchThreshold]}
                  max={100}
                  min={0} // Static min for visual proportionality
                  step={1}
                  onValueChange={(v) => handleAutoMatchChange(v[0])}
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
                  max={100} // Static max for visual proportionality
                  min={0} // Static min for visual proportionality
                  step={1}
                  onValueChange={(v) => handleSuggestedMatchChange(v[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Coincidencias entre este puntaje y el Match Automático se marcan como Sugeridas.</p>
              </div>
              
              {/* Review Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Para Revisar (Score %)</Label>
                  <span className="text-sm font-medium">{toleranceSettings.reviewThreshold}%</span>
                </div>
                <Slider
                  value={[toleranceSettings.reviewThreshold]}
                  max={100} // Static max for visual proportionality
                  min={0} // Static min for visual proportionality
                  step={1}
                  onValueChange={(v) => handleReviewThresholdChange(v[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Coincidencias entre este puntaje y el Match Sugerido se marcan como 'Para Revisar'. Por debajo de este puntaje, se consideran 'No Match'.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrictnessControls;