import { TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCard } from "@/components/ScoreCard";
import { TopBottomChart } from "@/components/TopBottomChart";
import { 
  Zap, Activity, TrendingUp, Award, Target, Sparkles, 
  BarChart3, Clock, Trophy, Star
} from "lucide-react";
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Scatter } from "recharts";

type Props = {
  analyticsData: any;
  topBottomData: { top: any[]; bottom: any[] };
  performanceScores: any;
};

export default function PerformanceTab({ analyticsData, topBottomData, performanceScores }: Props) {
  return (
    <TabsContent value="performance" className="space-y-6 lg:space-y-8 w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-text-primary to-green-600 bg-clip-text text-transparent truncate">
            Análisis de Rendimiento
          </h2>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">Evaluación completa de performance y potencial</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-600 border-green-500/30 flex-shrink-0">
          <TrendingUp className="w-3 h-3 mr-1" />
          Performance activo
        </Badge>
      </div>

      {/* Main Performance Section */}
      <div className="space-y-4 w-full overflow-hidden">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg sm:text-xl font-bold text-text-primary flex-shrink-0">Top vs Bottom Performance</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-full"></div>
        </div>
        
        <div className="w-full">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6 lg:gap-8 w-full overflow-hidden">
            {/* Enhanced TopBottomChart - Contenedor con límites estrictos */}
            <div className="relative min-h-[500px] w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl"></div>
              <div className="relative h-full w-full overflow-hidden">
                <TopBottomChart data={topBottomData} loading={false} />
              </div>
            </div>
            
            {/* Enhanced Score Cards */}
            <div className="space-y-4 w-full max-w-full">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                <h4 className="text-base sm:text-lg font-semibold text-text-primary truncate">Scores de Performance</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="transform hover:scale-105 transition-all duration-200">
                  <ScoreCard 
                    title="Calidad de Contenido" 
                    score={performanceScores.contentQuality} 
                    description="Engagement y retención promedio" 
                    color="blue"
                    icon={<Award className="w-4 h-4" />}
                  />
                </div>
                
                <div className="transform hover:scale-105 transition-all duration-200">
                  <ScoreCard 
                    title="Potencial Viral" 
                    score={performanceScores.viralPotential} 
                    description="Capacidad de alcance masivo" 
                    color="green"
                    icon={<Sparkles className="w-4 h-4" />}
                  />
                </div>
                
                <div className="transform hover:scale-105 transition-all duration-200">
                  <ScoreCard 
                    title="Listo para Monetizar" 
                    score={performanceScores.monetizationReadiness} 
                    description="Preparado para generar ingresos" 
                    color="orange"
                    icon={<Target className="w-4 h-4" />}
                  />
                </div>
                
                <div className="transform hover:scale-105 transition-all duration-200">
                  <ScoreCard 
                    title="Crecimiento General" 
                    score={performanceScores.overallGrowth} 
                    description="Score general de desarrollo" 
                    color="purple"
                    icon={<TrendingUp className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Velocity Analysis Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg sm:text-xl font-bold text-text-primary flex-shrink-0">Análisis de Velocidad</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-orange-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-600/5 border-orange-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-xl flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-base sm:text-lg block truncate">Análisis de Velocidad Inicial</span>
                <p className="text-xs sm:text-sm text-text-muted font-normal">Relación entre antigüedad y velocidad de views</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={analyticsData.velocityData}>
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="daysOld" 
                    stroke="hsl(var(--text-muted))" 
                    fontSize={10} 
                    name="Días desde publicación"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    dataKey="velocity" 
                    stroke="hsl(var(--text-muted))" 
                    fontSize={10} 
                    name="Views por día"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      fontSize: "12px"
                    }}
                    formatter={(value: any, name: string) => [
                      name === "velocity" ? `${value}/día` : value, 
                      name === "velocity" ? "Velocidad" : name
                    ]}
                    labelFormatter={(l) => `Días: ${l}`}
                  />
                  <Scatter 
                    dataKey="velocity" 
                    fill="#F97316" 
                    name="velocity"
                    r={4}
                    opacity={0.8}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention Distribution Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg sm:text-xl font-bold text-text-primary flex-shrink-0">Distribución de Retención</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-blue-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl flex-shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-base sm:text-lg block truncate">Distribución de Retención por Categorías</span>
                <p className="text-xs sm:text-sm text-text-muted font-normal">Clasificación de videos según su tasa de retención</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {([
                { 
                  k: "excellent", 
                  label: "Excelente", 
                  hint: "≥80%", 
                  color: "green",
                  icon: <Star className="w-3 h-3 sm:w-4 sm:h-4" />,
                  bgColor: "from-green-500/10 to-green-600/5 border-green-500/20"
                },
                { 
                  k: "good", 
                  label: "Buena", 
                  hint: "60-79%", 
                  color: "blue",
                  icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
                  bgColor: "from-blue-500/10 to-blue-600/5 border-blue-500/20"
                },
                { 
                  k: "average", 
                  label: "Promedio", 
                  hint: "40-59%", 
                  color: "yellow",
                  icon: <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />,
                  bgColor: "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20"
                },
                { 
                  k: "poor", 
                  label: "Baja", 
                  hint: "20-39%", 
                  color: "orange",
                  icon: <Clock className="w-3 h-3 sm:w-4 sm:h-4" />,
                  bgColor: "from-orange-500/10 to-orange-600/5 border-orange-500/20"
                },
                { 
                  k: "critical", 
                  label: "Crítica", 
                  hint: "<20%", 
                  color: "red",
                  icon: <Activity className="w-3 h-3 sm:w-4 sm:h-4" />,
                  bgColor: "from-red-500/10 to-red-600/5 border-red-500/20"
                },
              ] as const).map((category) => (
                <Card 
                  key={category.k} 
                  className={`bg-gradient-to-br ${category.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[120px] sm:min-h-[140px]`}
                >
                  <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <div className={`p-1.5 sm:p-2 bg-${category.color}-500/20 rounded-xl`}>
                        {category.icon}
                      </div>
                    </div>
                    
                    <div className={`text-xl sm:text-2xl lg:text-3xl font-bold text-${category.color}-600 mb-1 sm:mb-2`}>
                      {analyticsData.retentionBreakdown[category.k]}
                    </div>
                    
                    <div className="text-xs sm:text-sm font-medium text-text-primary mb-1 truncate">
                      {category.label}
                    </div>
                    
                    <div className="text-xs text-text-muted bg-background/50 rounded-full px-2 py-1 truncate">
                      {category.hint}
                    </div>
                    
                    {/* Progress bar indicator */}
                    <div className="mt-2 sm:mt-3 h-1 bg-background/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${category.color}-500 rounded-full transition-all duration-1000`}
                        style={{ 
                          width: `${Math.min(100, (analyticsData.retentionBreakdown[category.k] / Math.max(...Object.values(analyticsData.retentionBreakdown))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Summary */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-text-primary text-sm sm:text-base">Resumen de Retención</span>
                </div>
                <div className="text-xs sm:text-sm text-text-secondary">
                  Total: {Object.values(analyticsData.retentionBreakdown).reduce((a: number, b: number) => a + b, 0)} videos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}