import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Period } from '@/hooks/useKPIs';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
  className?: string;
}

export const PeriodSelector = ({ selectedPeriod, onPeriodChange, className }: PeriodSelectorProps) => {
  const periods: { value: Period; label: string }[] = [
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' }
  ];

  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted rounded-lg", className)}>
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all",
            selectedPeriod === period.value
              ? "bg-gradient-primary text-white shadow-sm"
              : "text-text-muted hover:text-text-secondary hover:bg-background"
          )}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
};