import ReconciliationSetup from "@/components/ReconciliationSetup";
import { MadeWithDyad } from "@/components/made-with-dyad";
import AppLayout from "@/components/AppLayout";
import { Upload } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <header className="flex items-center gap-3 mb-6">
        <Upload className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">
          Configuración de Conciliación
        </h1>
      </header>
      <ReconciliationSetup />
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Index;