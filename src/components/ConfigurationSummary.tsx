import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Settings } from 'lucide-react';
import { ReconciliationConfig } from './ReconciliationSetup'; // Import type

interface ConfigurationSummaryProps {
  config: ReconciliationConfig;
}

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({ config }) => {
  return (
    <Card className="shadow-xl rounded-xl border-l-4 border-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
          <Settings className="w-5 h-5" /> Resumen de Configuración Actual de Hard Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Hard Keys */}
        <div>
          <h5 className="text-sm font-semibold flex items-center gap-1 mb-2 text-foreground">
            <Key className="w-4 h-4 text-muted-foreground" /> Hard Keys ({config.hardKeys.length})
          </h5>
          <div className="flex flex-wrap gap-2">
            {config.hardKeys.length > 0 ? (
              config.hardKeys.map(key => (
                <Badge key={key} variant="default" className="bg-primary hover:bg-primary/90">
                  {key}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">Ninguna seleccionada.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationSummary;