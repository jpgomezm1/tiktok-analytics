import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus, Clock, Heart, TrendingUp, Zap, BookOpen, Calculator, Lightbulb, Target } from 'lucide-react';

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
      importance: 'Base para calcular crecimiento y tendencias. Mantén este dato actualizado diariamente.',
      color: 'from-blue-500 to-blue-600',
      difficulty: 'Básico'
    },
    {
      id: 'new-followers',
      icon: <UserPlus className="w-5 h-5" />,
      title: 'Nuevos seguidores',
      formula: 'followers(T0) − followers(T0−p)',
      description: 'Diferencia entre seguidores actuales y los de hace p días (7/30/90).',
      example: 'Si tenías 5,500 hace 30 días y ahora tienes 5,847, ganaste 347 seguidores.',
      importance: 'Mide crecimiento neto reciente. Positivo = crecimiento, negativo = pérdida de audiencia.',
      color: 'from-green-500 to-green-600',
      difficulty: 'Básico'
    },
    {
      id: 'retention',
      icon: <Clock className="w-5 h-5" />,
      title: 'Retención media (%)',
      formula: 'Σ(avg_time_watched_i × views_i) / Σ(duration_i × views_i) × 100',
      description: 'Porcentaje promedio de video que los usuarios ven, ponderado por vistas.',
      example: 'Si un video de 60s se ve 30s en promedio: 30/60 = 50% retención.',
      importance: 'El algoritmo prioriza contenido que retiene. Mayor retención = mayor distribución.',
      color: 'from-orange-500 to-orange-600',
      difficulty: 'Intermedio'
    },
    {
      id: 'saves-per-1k',
      icon: <Heart className="w-5 h-5" />,
      title: 'Saves por 1.000 vistas',
      formula: 'Σ(saves) / Σ(views) × 1000',
      description: 'Cantidad de saves por cada 1,000 vistas. Indicador de valor y recordación.',
      example: 'Si tienes 50 saves en 10,000 vistas: 50/10,000 × 1000 = 5 saves/1k.',
      importance: 'Correlaciona con distribución futura. Alto ratio = contenido valioso que el algoritmo premiará.',
      color: 'from-red-500 to-red-600',
      difficulty: 'Intermedio'
    },
    {
      id: 'for-you-share',
      icon: <TrendingUp className="w-5 h-5" />,
      title: '% For You',
      formula: 'Σ(traffic_for_you) / Σ(views) × 100',
      description: 'Porcentaje de vistas que provienen del feed principal For You de TikTok.',
      example: 'Si 7,000 de 10,000 vistas vienen de For You: 7,000/10,000 × 100 = 70%.',
      importance: 'Mide cuánto te empuja el feed principal. Alto % = el algoritmo confía en tu contenido.',
      color: 'from-purple-500 to-purple-600',
      difficulty: 'Avanzado'
    },
    {
      id: 'initial-velocity',
      icon: <Zap className="w-5 h-5" />,
      title: 'Velocidad inicial (proxy)',
      formula: 'Mediana Vistas Día 1 (periodo) / Mediana histórica Día 1 × 100',
      description: 'Compara velocidad inicial de videos recientes vs histórico. Proxy usando vistas totales.',
      example: 'Si tus videos actuales arrancan con 1,000 vistas vs 800 histórico: 1,000/800 × 100 = 125%.',
      importance: 'Si arrancas fuerte, el algoritmo te da más exposición inicial en las primeras horas.',
      color: 'from-yellow-500 to-yellow-600',
      difficulty: 'Avanzado'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermedio': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Avanzado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-gradient-to-br from-background via-background to-muted/20 border-border/60 backdrop-blur-sm">
        <SheetHeader className="space-y-4 pb-6 border-b border-border/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-bright to-purple-dark rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                ¿Qué significan los KPIs?
              </SheetTitle>
              <SheetDescription className="text-text-secondary text-sm">
                Fórmulas, ejemplos y por qué cada métrica importa para el crecimiento
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6">
          <div className="space-y-8">
            {kpis.map((kpi, index) => (
              <div key={kpi.id} className="group">
                <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-bright/30">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-br ${kpi.color} rounded-xl shadow-md text-white group-hover:scale-110 transition-transform duration-200`}>
                        {kpi.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text-primary group-hover:text-purple-light transition-colors duration-200">
                          {kpi.title}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(kpi.difficulty)} mt-1`}>
                          {kpi.difficulty}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content sections */}
                  <div className="space-y-4">
                    {/* Formula */}
                    <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-4 border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="w-4 h-4 text-purple-bright" />
                        <Badge variant="outline" className="text-xs font-semibold border-purple-bright/30 text-purple-light">
                          Fórmula
                        </Badge>
                      </div>
                      <p className="text-sm font-mono bg-card/60 backdrop-blur-sm p-3 rounded-lg text-text-secondary border border-border/20 leading-relaxed">
                        {kpi.formula}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <Badge variant="outline" className="text-xs font-semibold border-blue-500/30 text-blue-400">
                          Descripción
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed pl-6">
                        {kpi.description}
                      </p>
                    </div>

                    {/* Example */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <Badge variant="outline" className="text-xs font-semibold border-yellow-500/30 text-yellow-600">
                          Ejemplo
                        </Badge>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50/50 to-orange-50/30 border border-yellow-200/30 rounded-lg p-3 ml-6">
                        <p className="text-sm text-text-muted italic leading-relaxed">
                          {kpi.example}
                        </p>
                      </div>
                    </div>

                    {/* Importance */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <Badge variant="outline" className="text-xs font-semibold border-green-500/30 text-green-600">
                          Por qué importa
                        </Badge>
                      </div>
                      <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/30 border border-green-200/30 rounded-lg p-3 ml-6">
                        <p className="text-sm text-text-secondary font-medium leading-relaxed">
                          {kpi.importance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {index < kpis.length - 1 && (
                  <div className="flex justify-center my-6">
                    <Separator className="w-24 border-border/30" />
                  </div>
                )}
              </div>
            ))}

            {/* Enhanced footer note */}
            <div className="mt-8 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Notas importantes</h4>
                  <div className="space-y-2 text-sm text-text-muted leading-relaxed">
                    <p>
                      <strong className="text-text-secondary">Promedios ponderados:</strong> Algunas métricas usan promedios ponderados por vistas para dar mayor peso a contenido con más impacto.
                    </p>
                    <p>
                      <strong className="text-text-secondary">Comparación temporal:</strong> Los deltas comparan contra el periodo anterior de la misma duración.
                    </p>
                    <p>
                      <strong className="text-text-secondary">Actualización:</strong> Las métricas se recalculan automáticamente al cambiar el período de análisis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};