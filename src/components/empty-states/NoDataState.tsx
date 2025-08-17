import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, RefreshCw, AlertCircle, Zap, Brain } from 'lucide-react';

interface NoDataStateProps {
  type: 'analytics' | 'chart' | 'ai' | 'search';
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

const stateConfig = {
  analytics: {
    icon: BarChart3,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    defaultTitle: 'No hay datos suficientes',
    defaultSubtitle: 'Necesitas al menos 5 videos para generar análisis confiables'
  },
  chart: {
    icon: BarChart3,
    color: 'text-green-400', 
    bgColor: 'bg-green-400/10',
    defaultTitle: 'Sin datos para el gráfico',
    defaultSubtitle: 'Los datos aparecerán aquí cuando tengas actividad en el período seleccionado'
  },
  ai: {
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10', 
    defaultTitle: 'IA en modo de espera',
    defaultSubtitle: 'Sube más contenido para desbloquear insights personalizados de IA'
  },
  search: {
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    defaultTitle: 'Sin resultados',
    defaultSubtitle: 'Intenta con términos diferentes o ajusta los filtros'
  }
};

export const NoDataState = ({ 
  type,
  title,
  subtitle,
  actionLabel,
  onAction,
  showRefresh = false,
  onRefresh
}: NoDataStateProps) => {
  const config = stateConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="flex items-center justify-center py-16">
      <Card className="border-dashed border-2 border-border bg-muted/5 max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 px-8 text-center">
          {/* Animated icon */}
          <div className="relative mb-8">
            <div className={`absolute inset-0 -m-2 ${config.bgColor} rounded-full animate-ping opacity-30`}></div>
            <div className={`relative z-10 w-16 h-16 ${config.bgColor} rounded-xl flex items-center justify-center`}>
              <IconComponent className={`w-8 h-8 ${config.color}`} />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-sm">
            {title || config.defaultTitle}
          </h3>
          
          <p className="text-text-secondary mb-xl leading-relaxed">
            {subtitle || config.defaultSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-md">
            {onAction && (
              <Button 
                onClick={onAction}
                className="bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                {actionLabel || 'Comenzar'}
              </Button>
            )}
            
            {showRefresh && onRefresh && (
              <Button 
                variant="outline"
                onClick={onRefresh}
                className="border-border hover:border-purple-bright/30 transition-smooth"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            )}
          </div>

          {/* Warning for low data scenarios */}
          {type === 'analytics' && (
            <div className="mt-xl pt-lg border-t border-border w-full">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Los análisis mejoran con más datos</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};