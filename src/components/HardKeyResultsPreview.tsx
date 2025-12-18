import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCheck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HardKeyResultsPreviewProps {
  hardKeys: string[];
  onAction: (action: 'continue_soft_keys' | 'review_hard_keys') => void;
}

const HardKeyResultsPreview: React.FC<HardKeyResultsPreviewProps> = ({ hardKeys, onAction }) => {
  // Simulación: El porcentaje de match aumenta ligeramente con más hard keys seleccionadas.
  const simulatedMatchPercent = hardKeys.length > 0 ? 60 + hardKeys.length * 5 : 0;
  const unmatchedPercent = 100 - simulatedMatchPercent;

  return (
    <Card className="shadow-xl rounded-xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
          <CheckCheck className="w-5 h-5" /> 5. Resultados Preliminares (Hard Keys)
        </CardTitle>
        <CardDescription>
          Simulación de la conciliación usando solo las Hard Keys seleccionadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Preliminary Results Display */}
        <div className={cn(
          "p-6 rounded-lg text-center transition-all duration-500",
          simulatedMatchPercent > 50 
            ? "bg-green-500/20 border border-green-600/50 text-green-700 dark:text-green-400" 
            : "bg-yellow-500/20 border border-yellow-600/50 text-yellow-700 dark:text-yellow-400"
        )}>
          <p className="text-4xl font-bold">
            {simulatedMatchPercent}%
          </p>
          <p className="text-sm font-medium mt-1">
            de los registros hicieron Match Automático.
          </p>
          <p className="text-xs mt-2">
            ({unmatchedPercent}% quedan sin coincidencia y necesitan revisión o Soft Keys.)
          </p>
        </div>

        {/* Action Selection */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-md text-primary">
            ¿Qué quieres hacer ahora?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => onAction('continue_soft_keys')}
              className="w-full"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Continuar con Soft Keys (para el {unmatchedPercent}%)
            </Button>
            <Button 
              variant="outline"
              onClick={() => onAction('review_hard_keys')}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Revisar Hard Keys
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HardKeyResultsPreview;