import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Zap } from 'lucide-react';

interface SoftKeySelectorProps {
  availableColumns: string[];
  selectedKeys: string[];
  onKeyChange: (key: string, isSelected: boolean) => void;
}

const SoftKeySelector: React.FC<SoftKeySelectorProps> = ({ availableColumns, selectedKeys, onKeyChange }) => {
  // Conceptual filter for soft key candidates
  const softKeyCandidates = availableColumns.filter(col => 
    ['Amount', 'Date', 'Vendor Name', 'Description'].includes(col)
  );

  return (
    <Card className="shadow-xl rounded-xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
          <Zap className="w-5 h-5" /> 4. Soft Keys (Optional)
        </CardTitle>
        <CardDescription>
          Campos que ayudan a elegir el mejor match, permitiendo cierta tolerancia o coincidencia difusa.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {softKeyCandidates.map((key) => (
          <div key={key} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors">
            <Checkbox
              id={`soft-key-${key}`}
              checked={selectedKeys.includes(key)}
              onCheckedChange={(checked) => onKeyChange(key, checked as boolean)}
            />
            <Label
              htmlFor={`soft-key-${key}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {key}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SoftKeySelector;