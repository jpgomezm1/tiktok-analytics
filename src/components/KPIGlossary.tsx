import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus, Clock, Heart, TrendingUp, Zap } from 'lucide-react';

interface KPIGlossaryProps {
  open: boolean;
  onClose: () => void;
}

export const KPIGlossary = ({ open, onClose }: KPIGlossaryProps) => {
  const kpis = [
    {
      id: 'followers-current',
      icon: <Users className="w-5 h-5" />,
      title: 'Seguidores actuales',
      formula: 'Último registro en followers_history',
      description: 'Último registro en tu historial de seguidores. Fuente de verdad para todo el Dashboard.',
      example: 'Si tu último registro es 5,847 seguidores, este será el valor mostrado.',
      importance: 'Base para calcular crecimiento y tendencias. Mantén este dato actualizado diariamente.'
    },
    {
      id: 'new-followers',
      icon: <UserPlus className="w-5 h-5" />,
      title: 'Nuevos seguidores',
      formula: 'followers(T0) − followers(T0−p)',
      description: 'Diferencia entre seguidores actuales y los de hace p días (7/30/90).',
      example: 'Si tenías 5,500 hace 30 días y ahora tienes 5,847, ganaste 347 seguidores.',
      importance: 'Mide crecimiento neto reciente. Positivo = crecimiento, negativo = pérdida de audiencia.'
    },
    {
      id: 'retention',
      icon: <Clock className="w-5 h-5" />,
      title: 'Retención media (%)',
      formula: 'Σ(avg_time_watched_i × views_i) / Σ(duration_i × views_i) × 100',
      description: 'Porcentaje promedio de video que los usuarios ven, ponderado por vistas.',
      example: 'Si un video de 60s se ve 30s en promedio: 30/60 = 50% retención.',
      importance: 'El algoritmo prioriza contenido que retiene. Mayor retención = mayor distribución.'
    },
    {
      id: 'saves-per-1k',
      icon: <Heart className="w-5 h-5" />,
      title: 'Saves por 1.000 vistas',
      formula: 'Σ(saves) / Σ(views) × 1000',
      description: 'Cantidad de saves por cada 1,000 vistas. Indicador de valor y recordación.',
      example: 'Si tienes 50 saves en 10,000 vistas: 50/10,000 × 1000 = 5 saves/1k.',
      importance: 'Correlaciona con distribución futura. Alto ratio = contenido valioso que el algoritmo premiará.'
    },
    {
      id: 'for-you-share',
      icon: <TrendingUp className="w-5 h-5" />,
      title: '% For You',
      formula: 'Σ(traffic_for_you) / Σ(views) × 100',
      description: 'Porcentaje de vistas que provienen del feed principal For You de TikTok.',
      example: 'Si 7,000 de 10,000 vistas vienen de For You: 7,000/10,000 × 100 = 70%.',
      importance: 'Mide cuánto te empuja el feed principal. Alto % = el algoritmo confía en tu contenido.'
    },
    {
      id: 'initial-velocity',
      icon: <Zap className="w-5 h-5" />,
      title: 'Velocidad inicial (proxy)',
      formula: 'Mediana Vistas Día 1 (periodo) / Mediana histórica Día 1 × 100',
      description: 'Compara velocidad inicial de videos recientes vs histórico. Proxy usando vistas totales.',
      example: 'Si tus videos actuales arrancan con 1,000 vistas vs 800 histórico: 1,000/800 × 100 = 125%.',
      importance: 'Si arrancas fuerte, el algoritmo te da más exposición inicial en las primeras horas.'
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background border-border">
        <SheetHeader>
          <SheetTitle className="text-text-primary">¿Qué significan los KPIs?</SheetTitle>
          <SheetDescription className="text-text-secondary">
            Fórmulas, ejemplos y por qué cada métrica importa para el crecimiento
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6">
            {kpis.map((kpi, index) => (
              <div key={kpi.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg text-white">
                    {kpi.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {kpi.title}
                  </h3>
                </div>

                <div className="space-y-3 pl-11">
                  <div>
                    <Badge variant="outline" className="mb-2 font-mono text-xs">
                      Fórmula
                    </Badge>
                    <p className="text-sm font-mono bg-muted p-2 rounded text-text-secondary">
                      {kpi.formula}
                    </p>
                  </div>

                  <div>
                    <Badge variant="outline" className="mb-2">
                      Descripción
                    </Badge>
                    <p className="text-sm text-text-secondary">
                      {kpi.description}
                    </p>
                  </div>

                  <div>
                    <Badge variant="outline" className="mb-2">
                      Ejemplo
                    </Badge>
                    <p className="text-sm text-text-muted italic">
                      {kpi.example}
                    </p>
                  </div>

                  <div>
                    <Badge variant="outline" className="mb-2">
                      Por qué importa
                    </Badge>
                    <p className="text-sm text-text-secondary font-medium">
                      {kpi.importance}
                    </p>
                  </div>
                </div>

                {index < kpis.length - 1 && <Separator className="border-border" />}
              </div>
            ))}

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-text-muted">
                <strong>Nota:</strong> Algunas métricas usan promedios ponderados por vistas para 
                dar mayor peso a contenido con más impacto. Los deltas comparan contra el periodo 
                anterior de la misma duración.
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};