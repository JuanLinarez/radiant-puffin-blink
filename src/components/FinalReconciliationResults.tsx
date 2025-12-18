import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReconciliationConfig } from './ReconciliationSetup';

interface FinalReconciliationResultsProps {
  config: ReconciliationConfig;
  initialMatchPercent: number; // Match achieved by Hard Keys alone
}

const FinalReconciliationResults: React.FC<FinalReconciliationResultsProps> = ({ config, initialMatchPercent }) => {
  // Simulación de mejora de match gracias a Soft Keys y Strictness Mode
  let softKeyMatchBoost = 0;
  
  if (config.softKeys.length > 0) {
    // Base boost
    softKeyMatchBoost = 15; 
    
    // Adjust boost based on strictness mode (Flexible gives more boost)
    if (config.strictnessMode === 'Balanceado') {
      softKeyMatchBoost += 5;
    } else if (config.strictnessMode === 'Flexible') {
      softKeyMatchBoost += 10;
    }
    
    // Adjust based on threshold settings (lower thresholds mean higher match)
    const avgThreshold = (config.toleranceSettings.autoMatchThreshold + config.toleranceSettings.suggestedMatchThreshold + config.toleranceSettings.reviewThreshold) / 3;
    softKeyMatchBoost += (80 - avgThreshold) / 10; // If avg threshold is low (e.g., 50), boost is higher.
  }

  // Calculate final match percentage
  const finalMatchPercent = Math.min(100, initialMatchPercent + softKeyMatchBoost);
  const softKeyContribution = finalMatchPercent - initialMatchPercent;
  const unmatchedPercent = 100 - finalMatchPercent;

  return (
    <Card className="shadow-xl rounded-xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
          <CheckCircle2 className="w-6 h-6" /> Resultados de Conciliación Final
        </CardTitle>
        <CardDescription>
          La conciliación ha finalizado utilizando Hard Keys, Soft Keys y los controles de tolerancia definidos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-500/20 rounded-lg border border-green-600/50">
            <p className="text-4xl font-bold text-green-700 dark:text-green-400">{finalMatchPercent.toFixed(1)}%</p>
            <p className="text-sm font-medium mt-1 text-green-800 dark:text-green-300">Match Total</p>
          </div>
          <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-600/50">
            <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">+{softKeyContribution.toFixed(1)}%</p>
            <p className="text-sm font-medium mt-1 text-blue-800 dark:text-blue-300">Contribución Soft Keys</p>
          </div>
          <div className="p-4 bg-destructive/20 rounded-lg border border-destructive/50">
            <p className="text-4xl font-bold text-destructive dark:text-red-400">{unmatchedPercent.toFixed(1)}%</p>
            <p className="text-sm font-medium mt-1 text-destructive dark:text-red-300">Sin Coincidencia</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Desglose de Clasificación
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between items-center p-2 bg-green-500/10 rounded-md">
              <span>Match Automático (Score ≥ {config.toleranceSettings.autoMatchThreshold}%)</span>
              <span className="font-semibold text-green-600">{(finalMatchPercent * 0.7).toFixed(1)}%</span>
            </li>
            <li className="flex justify-between items-center p-2 bg-blue-500/10 rounded-md">
              <span>Match Sugerido (Score ≥ {config.toleranceSettings.suggestedMatchThreshold}%)</span>
              <span className="font-semibold text-blue-600">{(finalMatchPercent * 0.2).toFixed(1)}%</span>
            </li>
            <li className="flex justify-between items-center p-2 bg-yellow-500/10 rounded-md">
              <span>Para Revisar (Score ≥ {config.toleranceSettings.reviewThreshold}%)</span>
              <span className="font-semibold text-yellow-600">{(finalMatchPercent * 0.1).toFixed(1)}%</span>
            </li>
            <li className="flex justify-between items-center p-2 bg-destructive/10 rounded-md">
              <span>Sin Coincidencia (Score &lt; {config.toleranceSettings.reviewThreshold}%)</span>
              <span className="font-semibold text-destructive">{unmatchedPercent.toFixed(1)}%</span>
            </li>
          </ul>
        </div>
        
        {/* Next Steps */}
        <div className="pt-4 border-t text-center">
          <p className="text-md font-medium mb-3">Próximos Pasos:</p>
          <p className="text-sm text-muted-foreground">
            Ahora puedes descargar el reporte de resultados o proceder a la revisión manual de los registros 'Sugeridos' y 'Para Revisar'.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalReconciliationResults;