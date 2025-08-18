import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
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
    if (Math.abs(deltaPct) < 0.1) return <Minus className="w-3.5 h-3.5" />;
    return deltaPct > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />;
  };

  const getDeltaText = () => {
    if (Math.abs(deltaPct) < 0.1) return 'Sin cambios';
    const sign = deltaPct > 0 ? '+' : '';
    return `${sign}${deltaPct.toFixed(1)}% (${sign}${deltaAbs.toLocaleString()})`;
  };

  const getDeltaBgColor = () => {
    if (Math.abs(deltaPct) < 0.1) return 'bg-muted/30';
    return deltaPct > 0 ? 'bg-success/10' : 'bg-error/10';
  };

  const isHighPerformance = () => {
    return Math.abs(deltaPct) > 10 && deltaPct > 0;
  };

  if (loading) {
    return (
      <Card className={cn(
        "bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg",
        disabled && "opacity-50"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gradient-to-r from-muted to-muted/60 animate-pulse rounded-lg"></div>
            <div className="h-3 w-24 bg-gradient-to-r from-muted/60 to-muted/40 animate-pulse rounded"></div>
          </div>
          <div className="h-8 w-8 bg-gradient-to-r from-muted to-muted/60 animate-pulse rounded-xl"></div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-10 w-20 bg-gradient-to-r from-muted to-muted/60 animate-pulse rounded-lg"></div>
          <div className="h-6 w-28 bg-gradient-to-r from-muted/60 to-muted/40 animate-pulse rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer",
      disabled && "opacity-60 cursor-not-allowed",
      !disabled && "hover:border-purple-bright/40 hover:shadow-purple-bright/10 transform hover:scale-[1.02] hover:-translate-y-1"
    )}>
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-bright/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      
      {/* High performance indicator */}
      {isHighPerformance() && !disabled && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-full p-1 border border-yellow-400/30">
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </div>
        </div>
      )}

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-text-secondary flex items-center gap-2 group-hover:text-text-primary transition-all duration-200">
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onInfoClick}
                  className="text-text-muted hover:text-purple-light transition-all duration-200 hover:scale-110 transform p-1 rounded-full hover:bg-purple-bright/10"
                  aria-label={`Información sobre ${title}`}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-card/95 backdrop-blur-sm border border-border/50">
                <p className="text-xs leading-relaxed">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        {icon && (
          <div className="relative">
            <div className="h-8 w-8 p-1.5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 text-text-muted group-hover:from-purple-bright/20 group-hover:to-purple-dark/10 group-hover:text-purple-light transition-all duration-300 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="relative space-y-4">
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-text-primary group-hover:text-purple-light transition-colors duration-200">
              {disabled ? '—' : formatValue(value)}
              {unit && <span className="text-sm text-text-muted ml-1 font-normal">{unit}</span>}
            </div>
            
            {!disabled && (
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border transition-all duration-200",
                getDeltaColor(),
                getDeltaBgColor(),
                Math.abs(deltaPct) < 0.1 ? 'border-muted/30' : deltaPct > 0 ? 'border-success/20' : 'border-error/20'
              )}>
                {getDeltaIcon()}
                <span>{getDeltaText()}</span>
              </div>
            )}
          </div>
        </div>

        {disabled && (
          <div className="mt-3">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-muted/30 to-muted/20 px-3 py-1.5 rounded-full border border-muted/30">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
              <span className="text-xs font-medium text-text-muted">
                Función desactivada
              </span>
            </div>
          </div>
        )}

        {/* Performance insights */}
        {!disabled && Math.abs(deltaPct) > 5 && (
          <div className="pt-2 border-t border-border/30">
            <div className="text-xs text-text-muted">
              {deltaPct > 15 ? '🚀 Excelente crecimiento' : 
               deltaPct > 5 ? '📈 Tendencia positiva' :
               deltaPct < -15 ? '⚠️ Requiere atención' :
               '📉 Descenso moderado'}
            </div>
          </div>
        )}
      </CardContent>

      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 transition-all duration-300",
        disabled ? 'bg-muted/30' :
        Math.abs(deltaPct) < 0.1 ? 'bg-gradient-to-r from-muted/50 to-transparent' :
        deltaPct > 0 ? 'bg-gradient-to-r from-success to-success/50' : 'bg-gradient-to-r from-error to-error/50',
        "scale-x-0 group-hover:scale-x-100 origin-left"
      )}></div>
    </Card>
  );
};