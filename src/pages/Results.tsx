import React from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useLocation } from 'react-router-dom';
import HardKeyDecisionResults from '@/components/HardKeyDecisionResults';
import FinalReconciliationResults from '@/components/FinalReconciliationResults';
import { ReconciliationConfig } from '@/components/ReconciliationSetup';
import { FileText } from 'lucide-react';

const Results: React.FC = () => {
  const location = useLocation();
  const config = location.state?.config as ReconciliationConfig | undefined;

  // Simulación: El porcentaje de match aumenta ligeramente con más hard keys seleccionadas.
  const simulatedHardKeyMatchPercent = config && config.hardKeys.length > 0 
    ? 60 + config.hardKeys.length * 5 
    : 0;

  const isFinalResults = config && config.softKeys.length > 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Resultados de Conciliación
          </h1>
        </header>

        <div className="p-6 bg-card rounded-xl shadow-lg max-w-4xl mx-auto">
          {/* Scenario 2: Final Results (ran with Soft Keys) */}
          {isFinalResults ? (
            <FinalReconciliationResults 
              config={config!}
              initialMatchPercent={simulatedHardKeyMatchPercent}
            />
          ) : 
          /* Scenario 1: User just ran Hard Keys and needs to decide (Soft Keys are empty) */
          (config && config.hardKeys.length > 0) ? (
            <HardKeyDecisionResults 
              config={config} // Pasamos la configuración completa
              simulatedMatchPercent={simulatedHardKeyMatchPercent}
            />
          ) : 
          /* Scenario 3: Default/No config loaded */
          (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">Sin Resultados Disponibles</h2>
              <p className="text-muted-foreground">
                Aquí se mostrarán los resultados detallados de la conciliación una vez que se ejecute el proceso.
              </p>
              <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                No hay configuración de conciliación cargada. Por favor, inicie el proceso desde la página de Configuración.
              </div>
            </div>
          )}
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Results;