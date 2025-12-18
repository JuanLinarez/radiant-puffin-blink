import React from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { HelpCircle } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <AppLayout>
      <header className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">
          Ayuda y Soporte
        </h1>
      </header>
      <div className="p-6 bg-card rounded-xl shadow-lg">
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