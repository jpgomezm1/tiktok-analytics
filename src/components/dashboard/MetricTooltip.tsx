import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MetricTooltipProps {
  label: string;
  formula: string;
  why: string;
  children?: React.ReactNode;
}

export const MetricTooltip = ({ label, formula, why, children }: MetricTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <HelpCircle className="w-4 h-4 text-text-muted hover:text-text-secondary cursor-help" />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-card border-border p-3" side="top">
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary">{label}</h4>
            <div className="text-sm text-text-secondary">
              <p><span className="font-medium">Fórmula:</span> {formula}</p>
              <p className="mt-1"><span className="font-medium">Por qué importa:</span> {why}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};