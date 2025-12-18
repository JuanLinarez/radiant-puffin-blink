import React from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useLocation } from 'react-router-dom';
import HardKeyDecisionResults from '@/components/HardKeyDecisionResults';
import FinalReconciliationResults from '@/components/FinalReconciliationResults'; // Importamos el nuevo componente
import { ReconciliationConfig } from '@/components/ReconciliationSetup';

const Results: React.FC = () => {
  const location = useLocation();
  const config = location.state?.config as ReconciliationConfig | undefined;

  // Simulación: El porcentaje de match aumenta ligeramente con más hard keys seleccionadas.
  const simulatedHardKeyMatchPercent = config && config.hardKeys.length > 0 
    ? 60 + config.hardKeys.length * 5 
    : 0;

  // Scenario 2: Final Results (ran with Soft Keys)
  if (config && config.softKeys.length > 0) {
    return (
      <AppLayout>
        <div className="p-6 bg-card rounded-xl shadow-lg max-w-4xl mx-auto">
          <FinalReconciliationResults 
            config={config}
            initialMatchPercent={simulatedHardKeyMatchPercent}
          />
        </div>
        <MadeWithDyad />
      </AppLayout>
    );
  }

  // Scenario 1: User just ran Hard Keys and needs to decide (Soft Keys are empty)
  if (config && config.hardKeys.length > 0 && config.softKeys.length === 0) {
    return (
      <AppLayout>
        <div className="p-6 bg-card rounded-xl shadow-lg max-w-4xl mx-auto">
          <HardKeyDecisionResults 
            config={config} // Pasamos la configuración completa
            simulatedMatchPercent={simulatedHardKeyMatchPercent}
          />
        </div>
        <MadeWithDyad />
      </AppLayout>
    );
  }
  
  // Scenario 3: Default/No config loaded
  return (
    <AppLayout>
      <div className="p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">Resultados de Reconciliación</h1>
        <p className="text-muted-foreground">
          Aquí se mostrarán los resultados detallados de la conciliación una vez que se ejecute el proceso.
        </p>
        <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          No hay configuración de conciliación cargada. Por favor, inicie el proceso desde la página de Configuración.
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Results;