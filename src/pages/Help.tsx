import React from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Help: React.FC = () => {
  return (
    <AppLayout>
      <div className="p-6 bg-card rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">Ayuda y Soporte</h1>
        <p className="text-muted-foreground">Encuentra guías, tutoriales y contacta a soporte.</p>
        <div className="mt-8 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          Contenido de ayuda simulado.
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Help;