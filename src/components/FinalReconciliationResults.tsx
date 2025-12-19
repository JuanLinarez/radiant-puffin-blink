import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, TrendingUp, Settings, Key, Zap, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReconciliationConfig } from './ReconciliationSetup';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';

interface FinalReconciliationResultsProps {
  config: ReconciliationConfig;
  initialMatchPercent: number; // Match achieved by Hard Keys alone
}

const FinalReconciliationResults: React.FC<FinalReconciliationResultsProps> = ({ config, initialMatchPercent }) => {
  const navigate = useNavigate();
  
  // --- Simulation Logic: Breakdown of 100% ---
  
  // 1. Match achieved by Hard Keys (Exact Match)
  const hardMatchPercent = Math.max(0, Math.min(100, initialMatchPercent));
  
  // 2. Records that failed Hard Key match (Remanente)
  const unmatchedByHardKeys = 100 - hardMatchPercent;

  // 3. Simulate Soft Key Success Rate on the unmatched portion
  let softKeySuccessRate = 0;
  
  if (config.softKeys.length > 0) {
    // Base success rate on the remanente
    softKeySuccessRate = 0.5; 
    
    // Adjust based on strictness mode (Flexible gives slightly better success)
    if (config.strictnessMode === 'Balanceado') {
      softKeySuccessRate = 0.55;
    } else if (config.strictnessMode === 'Flexible') {
      softKeySuccessRate = 0.65;
    }
    
    // Adjust based on threshold settings (lower thresholds mean higher success)
    const avgThreshold = (config.toleranceSettings.autoMatchThreshold + config.toleranceSettings.suggestedMatchThreshold + config.toleranceSettings.reviewThreshold) / 3;
    // If avg threshold is low (e.g., 50), success rate is higher.
    softKeySuccessRate += (80 - avgThreshold) / 100; 
  }

  softKeySuccessRate = Math.max(0, Math.min(1, softKeySuccessRate));

  // 4. Calculate Soft Match Total (contribution to 100%)
  const softMatchTotal = unmatchedByHardKeys * softKeySuccessRate; // Total portion of remanente that found a match
  
  // 5. Calculate Final Unmatched (remaining records that failed Soft Keys entirely)
  const finalUnmatchedPercent = unmatchedByHardKeys - softMatchTotal;

  // 6. Distribute softMatchTotal into categories (using fixed proportions for simulation)
  const softAutoRatio = 0.7;
  const softSuggestedRatio = 0.2;
  const softReviewRatio = 0.1;

  const softMatchAuto = softMatchTotal * softAutoRatio;
  const softMatchSuggested = softMatchTotal * softSuggestedRatio;
  const softMatchReview = softMatchTotal * softReviewRatio; // This portion is now considered 'unmatched' for manual review

  // 7. Final Match Total (Only Exact, Auto, Sugerido)
  const finalMatchTotal = hardMatchPercent + softMatchAuto + softMatchSuggested;

  // 8. Soft Key Contribution (Only Auto + Sugerido)
  const softKeyContribution = softMatchAuto + softMatchSuggested;

  // 9. Final Unmatched (Original Unmatched + Review Matches)
  const finalUnmatchedWithReview = finalUnmatchedPercent + softMatchReview;
  
  // --- Handlers ---
  const handleReviewConfig = () => {
    // Navigate back to the setup page, passing the current config and forcing soft key steps visibility
    navigate('/', { state: { config, continueSoftKeys: true } });
  };
  
  const handleExport = (type: 'match' | 'review') => {
    const fileName = type === 'match' 
      ? `Reporte_Match_Total_${new Date().toISOString().slice(0, 10)}` 
      : `Reporte_Pendiente_Revision_${new Date().toISOString().slice(0, 10)}`;
      
    showSuccess(`Simulando exportación de ${fileName}.xlsx`);
  };
  
  const handleExplore = () => {
    // Future RAG/Vector analysis functionality
    showSuccess("Simulando exploración avanzada de registros pendientes...");
  };

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
        
        {/* Summary Metrics (4 Cards) - REORDERED */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          
          {/* 1. Final Match Total (Auto + Sugerido) */}
          <div className="p-4 bg-primary/20 rounded-lg border border-primary/50">
            <p className="text-3xl font-bold text-primary dark:text-primary-foreground">{finalMatchTotal.toFixed(1)}%</p>
            <p className="text-xs font-medium mt-1 text-primary dark:text-primary-foreground">Match Total (Auto + Sugerido)</p>
          </div>
          
          {/* 2. Hard Match Total */}
          <div className="p-4 bg-green-500/20 rounded-lg border border-green-600/50">
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">{hardMatchPercent.toFixed(1)}%</p>
            <p className="text-xs font-medium mt-1 text-green-800 dark:text-green-300">Match Exacto (Hard Keys)</p>
          </div>
          
          {/* 3. Soft Key Contribution (Auto + Sugerido) */}
          <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-600/50">
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{softKeyContribution.toFixed(1)}%</p>
            <p className="text-xs font-medium mt-1 text-blue-800 dark:text-blue-300">Contribución Soft Keys</p>
          </div>
          
          {/* 4. Final Unmatched (Including Review) */}
          <div className="p-4 bg-destructive/20 rounded-lg border border-destructive/50">
            <p className="text-3xl font-bold text-destructive dark:text-red-400">{finalUnmatchedWithReview.toFixed(1)}%</p>
            <p className="text-xs font-medium mt-1 text-destructive dark:text-red-300">Pendiente de Revisión / Sin Match</p>
          </div>
        </div>

        {/* Detailed Breakdown (Summing to 100%) */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-lg text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Desglose de Clasificación (100% de Registros)
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            
            {/* Hard Key Match (Exact) */}
            <li className="flex justify-between items-center p-2 bg-green-500/10 rounded-md border-l-4 border-green-600">
              <span className="flex items-center gap-2 font-semibold text-foreground">
                <Key className="w-4 h-4 text-green-600" /> Match Exacto (Hard Keys)
              </span>
              <span className="font-bold text-green-700">{hardMatchPercent.toFixed(1)}%</span>
            </li>
            
            {/* Soft Key Matches (Only Auto + Sugerido) */}
            <li className="flex justify-between items-center p-2 bg-blue-500/10 rounded-md">
              <span className="flex items-center gap-2 font-semibold text-foreground">
                <Zap className="w-4 h-4 text-blue-600" /> Match Soft Total (Automático + Sugerido)
              </span>
              <span className="font-bold text-blue-700">{softKeyContribution.toFixed(1)}%</span>
            </li>
            
            {/* Soft Match Breakdown */}
            <li className="ml-4 space-y-1">
                <div className="flex justify-between items-center p-1 bg-blue-500/5 rounded-md">
                    <span>- Automático (Score ≥ {config.toleranceSettings.autoMatchThreshold}%)</span>
                    <span className="font-semibold text-blue-600">{softMatchAuto.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-1 bg-blue-500/5 rounded-md">
                    <span>- Sugerido (Score ≥ {config.toleranceSettings.suggestedMatchThreshold}%)</span>
                    <span className="font-semibold text-blue-600">{softMatchSuggested.toFixed(1)}%</span>
                </div>
            </li>

            {/* Final Unmatched (Including Review) */}
            <li className="flex justify-between items-center p-2 bg-destructive/10 rounded-md border-l-4 border-destructive">
              <span className="flex items-center gap-2 font-semibold text-foreground">
                <XCircle className="w-4 h-4 text-destructive" /> Pendiente de Revisión / Sin Coincidencia Final
              </span>
              <span className="font-bold text-destructive">{finalUnmatchedWithReview.toFixed(1)}%</span>
            </li>
            
            {/* Sub-breakdown for Unmatched/Review */}
            <li className="ml-4 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between items-center p-1">
                    <span>(Incluye registros 'Para Revisar' Score ≥ {config.toleranceSettings.reviewThreshold}%)</span>
                    <span className="font-semibold text-destructive/80">{softMatchReview.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-1">
                    <span>(Incluye registros 'Sin Match' Score &lt; {config.toleranceSettings.reviewThreshold}%)</span>
                    <span className="font-semibold text-destructive/80">{finalUnmatchedPercent.toFixed(1)}%</span>
                </div>
            </li>
          </ul>
        </div>
        
        {/* Next Steps */}
        <div className="pt-4 border-t text-center space-y-4">
          <p className="text-md font-medium mb-3">Próximos Pasos:</p>
          
          {/* Row 1: Export Actions */}
          <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
              <Button 
                  onClick={() => handleExport('match')}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700"
              >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Match Total ({finalMatchTotal.toFixed(1)}%)
              </Button>
              <Button 
                  onClick={() => handleExport('review')}
                  variant="destructive"
                  className="w-full md:w-auto"
              >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Pendiente de Revisión ({finalUnmatchedWithReview.toFixed(1)}%)
              </Button>
          </div>
          
          {/* Row 2: Review/Explore Actions */}
          <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
              <Button 
                variant="outline"
                onClick={handleReviewConfig}
                className="w-full md:w-auto"
              >
                <Settings className="w-4 h-4 mr-2" />
                Revisar Configuración de Soft Keys
              </Button>
              <Button 
                variant="secondary"
                onClick={handleExplore}
                className="w-full md:w-auto"
              >
                <Search className="w-4 h-4 mr-2" />
                Explorar Registros Pendientes (RAG)
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalReconciliationResults;