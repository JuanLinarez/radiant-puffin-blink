import React from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useLocation } from 'react-router-dom';
import HardKeyDecisionResults from '@/components/HardKeyDecisionResults';
import { ReconciliationConfig } from '@/components/ReconciliationSetup';

const Results: React.FC = () => {
  const location = useLocation();
  const config = location.state?.config as ReconciliationConfig | undefined;

  // Simulación: El porcentaje de match aumenta ligeramente con más hard keys seleccionadas.
  const simulatedMatchPercent = config && config.hardKeys.length > 0 
    ? 60 + config.hardKeys.length * 5 
    : 0;

  // Scenario 1: User just ran Hard Keys and needs to decide (Soft Keys are empty)
  if (config && config.hardKeys.length > 0 && config.softKeys.length === 0) {
    return (
      <AppLayout>
        <div className="p-6 bg-card rounded-xl shadow-lg max-w-4xl mx-auto">
          <HardKeyDecisionResults 
            hardKeys={config.hardKeys}
            simulatedMatchPercent={simulatedMatchPercent}
          />
        </div>
        <MadeWithDyad />
      </AppLayout>
    );
  }

  // Scenario 2: Final Results (either navigated directly, or ran with Soft Keys)
  return (
    <AppLayout>
      <div className="p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">Resultados de Reconciliación</h1>
        <p className="text-muted-foreground">
          {config && config.softKeys.length > 0 
            ? "Resultados finales basados en Hard Keys y Soft Keys."
            : "Aquí se mostrarán los resultados detallados de la conciliación una vez que se ejecute el proceso."
          }
        </p>
        <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          {config && config.softKeys.length > 0 ? (
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              ¡Conciliación Completa! {Math.min(100, simulatedMatchPercent + 20).toFixed(1)}% Match Total.
            </p>
          ) : (
            "Contenido de resultados simulado."
          )}
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Results;