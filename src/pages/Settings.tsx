import React from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Settings: React.FC = () => {
  return (
    <AppLayout>
      <div className="p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">Ajustes de la Aplicación</h1>
        <p className="text-muted-foreground">Configura las preferencias generales de la aplicación.</p>
        <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          Contenido de ajustes simulado.
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Settings;