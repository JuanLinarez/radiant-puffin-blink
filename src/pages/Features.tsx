import React from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Features: React.FC = () => {
  return (
    <AppLayout>
      <div className="p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">Características Avanzadas</h1>
        <p className="text-muted-foreground">Explora las funcionalidades avanzadas de la herramienta de conciliación.</p>
        <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          Contenido de características simulado.
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Features;