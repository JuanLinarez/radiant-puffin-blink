import React from "react";
import { cn } from "@/lib/utils";
import { Check, Zap, Eye } from "lucide-react";

interface ThresholdVisualizerProps {
  auto: number; // Auto Match Threshold (e.g., 95)
  suggested: number; // Suggested Match Threshold (e.g., 70)
  review: number; // Review Threshold (e.g., 40)
  showLegend?: boolean;
}

const ThresholdVisualizer: React.FC<ThresholdVisualizerProps> = ({
  auto,
  suggested,
  review,
  showLegend = true,
}) => {
  // Ensure thresholds are ordered correctly (auto > suggested > review)
  // Note: The parent component (StrictnessControls) already enforces these constraints via handlers,
  // but we re-validate here for robustness in visualization.
  const tAuto = Math.min(100, Math.max(0, auto));
  const tSuggested = Math.min(tAuto - 1, Math.max(0, suggested));
  const tReview = Math.min(tSuggested - 1, Math.max(0, review));

  // Calculate widths for the four zones:
  // 1. Auto Match (tAuto to 100)
  // 2. Suggested Match (tSuggested to tAuto)
  // 3. Review (tReview to tSuggested)
  // 4. No Match (0 to tReview)

  const widthAuto = 100 - tAuto;
  const widthSuggested = tAuto - tSuggested;
  const widthReview = tSuggested - tReview;
  const widthNoMatch = tReview;

  return (
    <div className="space-y-3">
      <div className="relative h-8 w-full rounded-lg overflow-hidden border border-input/50">
        {/* Background Bar (Represents 0% to 100%) */}
        <div className="flex h-full w-full">
          {/* No Match Zone (0% to tReview) */}
          <div
            style={{ width: `${widthNoMatch}%` }}
            className="bg-destructive/20 transition-all duration-300"
            title={`No Match: 0% - ${tReview}%`}
          />
          {/* Review Zone (tReview to tSuggested) */}
          <div
            style={{ width: `${widthReview}%` }}
            className="bg-yellow-500/30 transition-all duration-300"
            title={`Revisar: ${tReview}% - ${tSuggested}%`}
          />
          {/* Suggested Zone (tSuggested to tAuto) */}
          <div
            style={{ width: `${widthSuggested}%` }}
            className="bg-blue-500/30 transition-all duration-300"
            title={`Sugerido: ${tSuggested}% - ${tAuto}%`}
          />
          {/* Auto Match Zone (tAuto to 100%) */}
          <div
            style={{ width: `${widthAuto}%` }}
            className="bg-green-500/30 transition-all duration-300"
            title={`Automático: ${tAuto}% - 100%`}
          />
        </div>

        {/* Threshold Markers */}
        {/* Review Marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-yellow-600 dark:bg-yellow-400 shadow-md"
          style={{ left: `${tReview}%` }}
        />
        {/* Suggested Marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-blue-600 dark:bg-blue-400 shadow-md"
          style={{ left: `${tSuggested}%` }}
        />
        {/* Auto Marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-green-600 dark:bg-green-400 shadow-md"
          style={{ left: `${tAuto}%` }}
        />
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive/20 border border-destructive" />
            No Match
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-600" />
            Revisar
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-600" />
            Sugerido
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-600" />
            Automático
          </div>
        </div>
      )}
    </div>
  );
};

export default ThresholdVisualizer;