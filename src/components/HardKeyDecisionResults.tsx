import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCheck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HardKeyDecisionResultsProps {
  hardKeys: string[];
  simulatedMatchPercent: number;
}

const HardKeyDecisionResults: React.FC<HardKeyDecisionResultsProps> = ({ hardKeys, simulatedMatchPercent }) => {
  const navigate = useNavigate();
  // Ensure percentage is between 0 and 100
  const safeMatchPercent = Math.max(0, Math.min(100, simulatedMatchPercent));
  const unmatchedPercent = 100 - safeMatchPercent;

  const handleAction = (action: 'continue_soft_keys' | 'review_hard_keys') => {
    if (action === 'continue_soft_keys') {
      // Navigate back to the index page, passing state to immediately show Soft Key steps
      navigate('/', { state: { continueSoftKeys: true } });
    } else {
      // Navigate back to the index page to review hard keys (default state)
      navigate('/');
    }
  };

  return (
    <Card className="shadow-xl rounded-xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
          <CheckCheck className="w-5 h-5" /> Resultados Preliminares (Solo Hard Keys)
        </CardTitle>
        <CardDescription>
          El motor de conciliación ha completado la primera fase usando solo las Hard Keys.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Preliminary Results Display */}
        <div className={cn(
          "p-6 rounded-lg text-center transition-all duration-500",
          safeMatchPercent > 50 
            ? "bg-green-500/20 border border-green-600/50 text-green-700 dark:text-green-400" 
            : "bg-yellow-500/20 border border-yellow-600/50 text-yellow-700 dark:text-yellow-400"
        )}>
          <p className="text-4xl font-bold">
            {safeMatchPercent.toFixed(1)}%
          </p>
          <p className="text-sm font-medium mt-1">
            de los registros hicieron Match Automático.
          </p>
          <p className="text-xs mt-2">
            ({unmatchedPercent.toFixed(1)}% quedan sin coincidencia.)
          </p>
        </div>

        {/* Action Selection */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-md text-primary">
            ¿Qué quieres hacer ahora?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => handleAction('continue_soft_keys')}
              className="w-full"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Continuar con Soft Keys (para el {unmatchedPercent.toFixed(1)}% restante)
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleAction('review_hard_keys')}
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

export default HardKeyDecisionResults;