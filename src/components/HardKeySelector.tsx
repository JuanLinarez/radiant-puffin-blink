import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Key } from 'lucide-react';

interface HardKeySelectorProps {
  availableColumns: string[];
  selectedKeys: string[];
  onKeyChange: (key: string, isSelected: boolean) => void;
}

const HardKeySelector: React.FC<HardKeySelectorProps> = ({ availableColumns, selectedKeys, onKeyChange }) => {
  // Conceptual filter for hard key candidates
  const hardKeyCandidates = availableColumns.filter(col => 
    ['Vendor Code', 'Currency', 'Company Code'].includes(col)
  );

  return (
    <Card className="shadow-xl rounded-xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
          <Key className="w-5 h-5" /> 3. Seleccione Hard Keys (Required)
        </CardTitle>
        <CardDescription>
          Campos que deben coincidir sí o sí para que dos registros se consideren un match.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {hardKeyCandidates.map((key) => (
          <div key={key} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors">
            <Checkbox
              id={`hard-key-${key}`}
              checked={selectedKeys.includes(key)}
              onCheckedChange={(checked) => onKeyChange(key, checked as boolean)}
            />
            <Label
              htmlFor={`hard-key-${key}`}
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

export default HardKeySelector;