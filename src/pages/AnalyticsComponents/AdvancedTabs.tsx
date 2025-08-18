import { TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Activity, Grid3X3, Clock, Target, Sparkles, Play, 
  Trophy, Star, BarChart3, Zap, Eye, Users, ArrowUpRight,
  Calendar, Hash, MessageCircle
} from "lucide-react";
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ScatterChart, Scatter, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

type Props = {
  tab: "comparatives" | "timing" | "content";
  analyticsData: any;
  selectedPeriod?: "7d" | "30d" | "90d";
  videos?: any[];
  patterns?: any[];
};

export default function AdvancedTabs({
  tab,
  analyticsData,
  videos = [],
  selectedPeriod = "30d",
  patterns = [],
}: Props) {
  if (tab === "comparatives") return <Comparatives analyticsData={analyticsData} videos={videos} selectedPeriod={selectedPeriod} />;
  if (tab === "timing") return <Timing analyticsData={analyticsData} />;
  if (tab === "content") return <ContentTab analyticsData={analyticsData} patterns={patterns} />;
  return null;
}

/* ---------- Helper único clave-valor ---------- */
function KVRow({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`${strong ? "font-bold text-primary" : "font-medium text-text-primary"}`}>{value}</span>
    </div>
  );
}

/* ================= Comparatives ================= */
function Comparatives({ analyticsData, videos, selectedPeriod }: any) {
  const periodDays = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);
  const periodVideos = videos.filter((v: any) => new Date(v.published_date) >= cutoffDate);
  const sorted = [...periodVideos].sort((a, b) => (b.views || 0) - (a.views || 0));
  const top10 = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.1)));
  const rest = sorted.slice(Math.ceil(sorted.length * 0.1));

  const topStats = {
    avgViews: top10.reduce((s, v) => s + (v.views || 0), 0) / (top10.length || 1),
    avgEngagement: top10.reduce((s, v) => s + (v.engagement_rate || 0), 0) / (top10.length || 1),
    avgSaves: top10.reduce((s, v) => s + (v.saves || 0), 0) / (top10.length || 1),
  };
  const avgStats = {
    avgViews: rest.length > 0 ? rest.reduce((s, v) => s + (v.views || 0), 0) / rest.length : 0,
    avgEngagement: rest.length > 0 ? rest.reduce((s, v) => s + (v.engagement_rate || 0), 0) / rest.length : 0,
    avgSaves: rest.length > 0 ? rest.reduce((s, v) => s + (v.saves || 0), 0) / rest.length : 0,
  };

  const comparisonData = [
    { metric: "Views", top: Math.round(topStats.avgViews), average: Math.round(avgStats.avgViews), difference: avgStats.avgViews > 0 ? Math.round(((topStats.avgViews - avgStats.avgViews) / avgStats.avgViews) * 100) : 0 },
    { metric: "Engagement", top: Number(topStats.avgEngagement.toFixed(1)), average: Number(avgStats.avgEngagement.toFixed(1)), difference: avgStats.avgEngagement > 0 ? Math.round(((topStats.avgEngagement - avgStats.avgEngagement) / avgStats.avgEngagement) * 100) : 0 },
    { metric: "Saves", top: Math.round(topStats.avgSaves), average: Math.round(avgStats.avgSaves), difference: avgStats.avgSaves > 0 ? Math.round(((topStats.avgSaves - avgStats.avgSaves) / avgStats.avgSaves) * 100) : 0 },
  ];

  return (
    <TabsContent value="comparatives" className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-yellow-600 bg-clip-text text-transparent">
            Análisis Comparativo
          </h2>
          <p className="text-text-secondary mt-1">Top performers vs contenido promedio</p>
        </div>
        <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 border-yellow-500/30">
          <Trophy className="w-3 h-3 mr-1" />
          Comparativas activas
        </Badge>
      </div>

      {/* Top vs Average */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Top 10% vs Promedio</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <span className="text-lg">Comparación de Performance</span>
                <p className="text-sm text-text-muted font-normal">Diferencias entre contenido top y promedio</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonData.map((item: any) => (
                <Card key={item.metric} className="bg-gradient-to-br from-green-500/5 to-green-600/5 border-green-500/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-text-primary">{item.metric}</h4>
                      <Badge 
                        variant={item.difference > 50 ? "default" : "outline"} 
                        className={`text-xs ${item.difference > 50 ? 'bg-green-500/20 text-green-600 border-green-500/30' : ''}`}
                      >
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +{item.difference}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-xs text-green-600 mb-1">Top 10%</div>
                        <div className="font-bold text-green-600 text-lg">
                          {item.metric === "Engagement" ? `${item.top}%` : item.top.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/30">
                        <div className="text-xs text-text-muted mb-1">Promedio</div>
                        <div className="font-medium text-text-primary text-lg">
                          {item.metric === "Engagement" ? `${item.average}%` : item.average.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Correlation Analysis */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Análisis de Correlación</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-purple-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <span className="text-lg">Retención vs Engagement</span>
                <p className="text-sm text-text-muted font-normal">Relación entre tiempo visto y engagement</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={analyticsData.correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="retention" 
                    stroke="hsl(var(--text-muted))" 
                    fontSize={11} 
                    name="Retención (%)" 
                  />
                  <YAxis 
                    dataKey="engagement" 
                    stroke="hsl(var(--text-muted))" 
                    fontSize={11} 
                    name="Engagement (%)" 
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: "12px", 
                      fontSize: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                    }}
                    formatter={(value: any, name: string) => [`${value}%`, name === "retention" ? "Retención" : "Engagement"]}
                    labelFormatter={(label: any) => `Video: ${label}`}
                  />
                  <Scatter 
                    dataKey="engagement" 
                    fill="#8B5CF6" 
                    name="engagement"
                    r={6}
                    opacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Type Performance */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Performance por Tipo</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-orange-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-600/5 border-orange-500/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-xl">
                <Grid3X3 className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <span className="text-lg">Performance por Tipo de Contenido</span>
                <p className="text-sm text-text-muted font-normal">Comparación entre diferentes categorías</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.contentTypeBreakdown.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.contentTypeBreakdown.slice(0, 5)}>
                    <defs>
                      <linearGradient id="contentBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="type" 
                      stroke="hsl(var(--text-muted))" 
                      fontSize={11} 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                    />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "12px", 
                        fontSize: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }}
                      formatter={(value: any, name: string) => [
                        name === "avgViews" ? value.toLocaleString() : `${value.toFixed(1)}%`, 
                        name === "avgViews" ? "Avg Views" : "Avg Engagement"
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="avgViews" 
                      fill="url(#contentBar)" 
                      name="Avg Views" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-text-secondary">
                <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
                <p>No hay datos de tipos de contenido</p>
                <p className="text-sm text-text-muted">Agrega categorías a tus videos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}

/* ================= Timing ================= */
function Timing({ analyticsData }: any) {
  return (
    <TabsContent value="timing" className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-indigo-600 bg-clip-text text-transparent">
            Análisis de Timing
          </h2>
          <p className="text-text-secondary mt-1">Optimización temporal y horarios de publicación</p>
        </div>
        <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 border-indigo-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Timing optimizado
        </Badge>
      </div>

      {/* Performance Charts */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Performance Horaria</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-orange-500/5 to-orange-600/5 border-orange-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <span className="text-lg">Performance por Horario</span>
                  <p className="text-sm text-text-muted font-normal">Score de rendimiento por hora</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.hourlyData.slice(0, 12)}>
                    <defs>
                      <linearGradient id="performanceBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="hsl(var(--text-muted))" fontSize={11} />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "12px", 
                        fontSize: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }}
                      formatter={(value: any, name: string) => [
                        name === "avgViews"
                          ? value.toLocaleString()
                          : name === "avgEngagement"
                          ? `${value}%`
                          : name === "videoCount"
                          ? `${value} videos`
                          : value,
                        name === "performanceScore" ? "Performance Score" : name,
                      ]}
                      labelFormatter={(hour: string) => `Hora: ${hour}`}
                    />
                    <Bar 
                      dataKey="performanceScore" 
                      fill="url(#performanceBar)" 
                      name="Performance Score" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-600/5 border-green-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <span className="text-lg">Engagement por Hora</span>
                  <p className="text-sm text-text-muted font-normal">Tasa de engagement temporal</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.hourlyData.slice(0, 12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="hsl(var(--text-muted))" fontSize={11} />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "12px", 
                        fontSize: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }} 
                      formatter={(value: any) => [`${value}%`, "Engagement Rate"]} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgEngagement" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "#10B981" }} 
                      activeDot={{ r: 6, fill: "#10B981" }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Best Times */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Mejores Horarios</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-purple-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <span className="text-lg">Mejores Horarios para Publicar</span>
                <p className="text-sm text-text-muted font-normal">Top horarios ordenados por performance</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.hourlyData.slice(0, 6).map((h: any, idx: number) => (
                <Card 
                  key={h.hour} 
                  className={`${
                    idx === 0 
                      ? 'bg-gradient-to-br from-gold-500/10 to-yellow-500/10 border-yellow-500/30' 
                      : idx === 1 
                      ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/30'
                      : idx === 2
                      ? 'bg-gradient-to-br from-orange-600/10 to-orange-700/10 border-orange-600/30'
                      : 'bg-gradient-to-br from-muted/20 to-muted/10 border-border/30'
                  } hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-xl text-text-primary flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>{h.hour}</span>
                      </h4>
                      <Badge 
                        variant={idx === 0 ? "default" : "outline"} 
                        className={`text-xs ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' : ''
                        }`}
                      >
                        {idx === 0 ? <Trophy className="w-3 h-3 mr-1" /> : null}
                        #{idx + 1}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <KVRow label="Videos" value={h.videoCount} />
                      <KVRow label="Avg Views" value={h.avgViews.toLocaleString()} />
                      <KVRow label="Engagement" value={`${h.avgEngagement}%`} strong />
                      <KVRow label="Score" value={h.performanceScore} strong />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Fuentes de Tráfico</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <span className="text-lg">Distribución de Fuentes de Tráfico</span>
                <p className="text-sm text-text-muted font-normal">De dónde provienen las visualizaciones</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.trafficData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={analyticsData.trafficData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      innerRadius={40} 
                      dataKey="value" 
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.trafficData.map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-text-secondary">
                <Target className="w-12 h-12 mb-3 opacity-50" />
                <p>No hay datos de tráfico</p>
                <p className="text-sm text-text-muted">Los datos aparecerán cuando tengas videos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}

/* ================= Content ================= */
function ContentTab({ analyticsData, patterns = [] }: any) {
  return (
    <TabsContent value="content" className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-green-600 bg-clip-text text-transparent">
            Análisis de Contenido
          </h2>
          <p className="text-text-secondary mt-1">Patrones y performance por tipo de contenido</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-600 border-green-500/30">
          <Play className="w-3 h-3 mr-1" />
          Contenido analizado
        </Badge>
      </div>

      {/* Content Performance */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Performance por Tipo</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-blue-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Play className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <span className="text-lg">Performance por Tipo de Contenido</span>
                <p className="text-sm text-text-muted font-normal">Análisis detallado de categorías de contenido</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.contentTypeBreakdown.slice(0, 6).map((type: any, idx: number) => (
                <Card 
                  key={idx} 
                  className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                          <Hash className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-text-primary mb-1 truncate">{type.type}</div>
                          <div className="text-xs text-text-secondary flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{type.count} videos</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{Math.round(type.avgViews).toLocaleString()} views promedio</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-text-primary">{Number(type.avgEngagement).toFixed(1)}%</div>
                        <div className="text-xs text-text-muted">engagement</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {analyticsData.contentTypeBreakdown.length === 0 && (
                <div className="text-center py-8">
                  <Play className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
                  <p className="text-text-secondary">No hay datos de tipos de contenido</p>
                  <p className="text-sm text-text-muted">Agrega categorías a tus videos para ver el análisis</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Patterns */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Patrones de Contenido</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ListCard
            titleIcon={<Sparkles className="w-5 h-5 text-yellow-500" />}
            title="Temas con Mejor Performance"
            emptyText="Agrega data de temas para ver patrones"
            items={patterns.filter((p: any) => p.type === "theme").slice(0, 8)}
            right={(p: any) => (
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">{p.avgEngagement.toFixed(1)}%</div>
                <div className="text-xs text-text-muted">{p.videoCount}v</div>
              </div>
            )}
            color="yellow"
          />
          <ListCard
            titleIcon={<MessageCircle className="w-5 h-5 text-orange-500" />}
            title="CTAs Más Efectivos"
            emptyText="Agrega data de CTAs para ver patrones"
            items={patterns.filter((p: any) => p.type === "cta").slice(0, 8)}
            right={(p: any) => (
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">{p.avgViews.toLocaleString()}</div>
                <div className="text-xs text-text-muted">avg views</div>
              </div>
            )}
            color="orange"
          />
        </div>
      </div>
    </TabsContent>
  );
}

function ListCard({ titleIcon, title, emptyText, items, right, color = "blue" }: any) {
  const colorClasses = {
    yellow: "from-yellow-500/5 to-yellow-600/5 border-yellow-500/20",
    orange: "from-orange-500/5 to-orange-600/5 border-orange-500/20",
    blue: "from-blue-500/5 to-blue-600/5 border-blue-500/20",
    green: "from-green-500/5 to-green-600/5 border-green-500/20",
    purple: "from-purple-500/5 to-purple-600/5 border-purple-500/20"
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} shadow-xl hover:shadow-2xl transition-all duration-300`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className={`p-2 bg-${color}-500/20 rounded-xl`}>
            {titleIcon}
          </div>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((pattern: any, index: number) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30 hover:bg-background/70 transition-all duration-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    index < 3 
                      ? `bg-${color}-500/20 text-${color}-600 border-${color}-500/30` 
                      : ''
                  }`}
                >
                  {index === 0 ? <Trophy className="w-3 h-3 mr-1" /> : null}
                  #{index + 1}
                </Badge>
                <span className="text-sm text-text-secondary truncate flex-1">{pattern.value}</span>
              </div>
              <div className="ml-3">{right(pattern)}</div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-text-muted opacity-50" />
              <p className="text-sm text-text-muted">{emptyText}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}