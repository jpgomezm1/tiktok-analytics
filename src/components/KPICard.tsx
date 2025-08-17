import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIValue } from '@/hooks/useKPIs';

interface KPICardProps {
  title: string;
  value: number;
  unit?: string;
  deltaAbs: number;
  deltaPct: number;
  icon?: ReactNode;
  tooltip: string;
  format?: 'number' | 'percentage' | 'decimal';
  loading?: boolean;
  disabled?: boolean;
  onInfoClick?: () => void;
}

export const KPICard = ({ 
  title, 
  value, 
  unit, 
  deltaAbs, 
  deltaPct, 
  icon, 
  tooltip,
  format = 'number',
  loading = false,
  disabled = false,
  onInfoClick
}: KPICardProps) => {
  const formatValue = (val: number) => {
    if (format === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    if (format === 'decimal') {
      return val.toFixed(1);
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  const getDeltaColor = () => {
    if (Math.abs(deltaPct) < 0.1) return 'text-text-muted';
    return deltaPct > 0 ? 'text-success' : 'text-error';
  };

  const getDeltaIcon = () => {
    if (Math.abs(deltaPct) < 0.1) return <Minus className="w-3 h-3" />;
    return deltaPct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getDeltaText = () => {
    if (Math.abs(deltaPct) < 0.1) return 'Sin cambios';
    const sign = deltaPct > 0 ? '+' : '';
    return `${sign}${deltaPct.toFixed(1)}% (${sign}${deltaAbs.toLocaleString()})`;
  };

  if (loading) {
    return (
      <Card className={cn("bg-card border-border shadow-card", disabled && "opacity-50")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-card border-border shadow-card hover:shadow-hover transition-smooth group cursor-pointer",
      disabled && "opacity-50 cursor-not-allowed",
      "hover:border-purple-bright/30 hover:bg-card/80"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2 group-hover:text-text-primary transition-fast">
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onInfoClick}
                  className="text-text-muted hover:text-purple-light transition-fast hover:scale-110 transform"
                  aria-label={`Información sobre ${title}`}
                >
                  <Info className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-text-muted group-hover:text-purple-light transition-fast">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {disabled ? '—' : formatValue(value)}
              {unit && <span className="text-sm text-text-muted ml-1">{unit}</span>}
            </div>
            {!disabled && (
              <div className={cn("text-xs mt-1 flex items-center gap-1", getDeltaColor())}>
                {getDeltaIcon()}
                {getDeltaText()}
              </div>
            )}
          </div>
        </div>
        {disabled && (
          <div className="mt-2">
            <span className="text-xs text-text-muted bg-muted px-2 py-1 rounded-full">
              Proxy desactivado
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};