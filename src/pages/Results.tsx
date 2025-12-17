import React from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Results: React.FC = () => {
  return (
    <AppLayout>
      <div className="p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">Resultados de Reconciliación</h1>
        <p className="text-muted-foreground">Aquí se mostrarán los resultados detallados de la conciliación una vez que se ejecute el proceso.</p>
        <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          Contenido de resultados simulado.
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Results;