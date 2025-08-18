import { TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, TrendingUp, Heart, Calendar, Activity, Target, Zap, Layers, 
  Users, BookmarkPlus, ArrowUpRight, Sparkles, Eye, Clock, Trophy,
  BarChart3, TrendingDown
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { BrainIndexingPrompt } from "@/components/BrainIndexingPrompt";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, Legend } from "recharts";

type OverviewProps = {
  analyticsData: any;
  insights: any[];
  performanceScores: any;
  advancedAnalytics: any;
};

export default function OverviewTab({ analyticsData, insights, performanceScores, advancedAnalytics }: OverviewProps) {
  return (
    <TabsContent value="overview" className="space-y-8">
      {/* AI Status Alert - Enhanced */}
      {advancedAnalytics.hasBrainVectors === false && (
        <Alert className="border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 shadow-xl">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Brain className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <AlertDescription className="text-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-blue-600">🚀 Analytics Básicos Activos</strong>
                    <p className="text-sm text-blue-600/80 mt-1">
                      Activa el procesamiento IA para predicciones de viralidad, clustering automático y insights avanzados.
                    </p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Upgrade disponible
                  </Badge>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Key Metrics Section - Enhanced */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-text-primary">Métricas Principales</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-purple-500/50 to-transparent rounded-full"></div>
          <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-600 border-green-500/30">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="transform hover:scale-105 transition-all duration-200">
            <MetricCard 
              title="Total Views" 
              value={analyticsData.totalViews.toLocaleString()} 
              change={`${analyticsData.videoCount} videos`} 
              changeType="neutral" 
              icon={<Eye className="w-5 h-5" />} 
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-200">
            <MetricCard 
              title="Engagement Rate" 
              value={`${analyticsData.avgEngagement.toFixed(1)}%`} 
              change={`${analyticsData.totalLikes.toLocaleString()} likes`} 
              changeType="neutral" 
              icon={<Heart className="w-5 h-5" />} 
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-200">
            <MetricCard 
              title="Saves por 1K" 
              value={analyticsData.avgSavesPer1K.toFixed(1)} 
              change={`${analyticsData.totalSaves.toLocaleString()} saves`} 
              changeType="neutral" 
              icon={<BookmarkPlus className="w-5 h-5" />} 
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-200">
            <MetricCard 
              title="New Followers" 
              value={analyticsData.totalFollowers.toLocaleString()} 
              change={`${analyticsData.avgForYouTraffic.toFixed(1)}% For You`} 
              changeType="neutral" 
              icon={<Users className="w-5 h-5" />} 
            />
          </div>
        </div>
      </div>

      

      {/* Charts Section - Enhanced */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-text-primary">Análisis Temporal</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <span className="text-lg">Performance Timeline</span>
                  <p className="text-sm text-text-muted font-normal">Evolución de vistas en el tiempo</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timelineData}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="date" stroke="hsl(var(--text-muted))" fontSize={11} />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "12px", 
                        fontSize: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      fill="url(#viewsGradient)" 
                      name="Views" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <span className="text-lg">Tendencia de Engagement</span>
                  <p className="text-sm text-text-muted font-normal">Evolución semanal del engagement</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="week" stroke="hsl(var(--text-muted))" fontSize={11} />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "12px", 
                        fontSize: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }}
                      formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Engagement Rate"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgEngagement" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "#EF4444" }} 
                      activeDot={{ r: 6, fill: "#EF4444" }} 
                      name="avgEngagement" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Summary - Enhanced */}
      <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <span className="text-lg">Resumen Semanal de Performance</span>
              <p className="text-sm text-text-muted font-normal">Comparativa de métricas por semana</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.weeklyTrends}>
                <defs>
                  <linearGradient id="viewsBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="savesBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="followersBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="week" stroke="hsl(var(--text-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))", 
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                  }} 
                />
                <Legend />
                <Bar dataKey="avgViews" fill="url(#viewsBar)" name="Avg Views" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalSaves" fill="url(#savesBar)" name="Total Saves" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalFollowers" fill="url(#followersBar)" name="New Followers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Enhanced */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-text-primary">Stats Rápidas</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData.bestVideo && (
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-500" />
                  Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text-secondary mb-2 truncate">{analyticsData.bestVideo.title}</p>
                <div className="text-lg font-bold text-text-primary">{analyticsData.bestVideo.views?.toLocaleString()}</div>
                <div className="text-xs text-green-500 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{analyticsData.bestVideo.score?.toFixed(1)}% engagement</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Retención Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-text-primary">{analyticsData.avgRetention.toFixed(1)}%</div>
              <div className="text-xs text-text-secondary">Tiempo promedio visto</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                For You Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-text-primary">{analyticsData.avgForYouTraffic.toFixed(1)}%</div>
              <div className="text-xs text-text-secondary">Promedio del período</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                Velocidad Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-text-primary">
                {analyticsData.velocityData.length > 0
                  ? Math.round(analyticsData.velocityData.reduce((s: number, v: any) => s + v.velocity, 0) / analyticsData.velocityData.length).toLocaleString()
                  : "0"}
              </div>
              <div className="text-xs text-text-secondary">Views por día</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}