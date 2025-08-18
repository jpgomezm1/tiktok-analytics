import { TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, Heart, BarChart3, BookmarkPlus, Users, MessageCircle, Share, 
  TrendingUp, ArrowUpRight, Activity, Zap, Target
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, Legend } from "recharts";

type Props = { analyticsData: any };

export default function MetricsTab({ analyticsData }: Props) {
  return (
    <TabsContent value="metrics" className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-blue-600 bg-clip-text text-transparent">
            Métricas Detalladas
          </h2>
          <p className="text-text-secondary mt-1">Análisis profundo de performance y engagement</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-600 border-blue-500/30">
          <Activity className="w-3 h-3 mr-1" />
          Actualizando en vivo
        </Badge>
      </div>

      {/* Main Charts Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Tendencias Principales</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-blue-500/50 to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Eye className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <span className="text-lg">Evolución de Views</span>
                  <p className="text-sm text-text-muted font-normal">Crecimiento diario de visualizaciones</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timelineData}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
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
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      fill="url(#viewsGradient)" 
                      name="Views" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/5 to-red-600/5 border-red-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <span className="text-lg">Tasa de Engagement</span>
                  <p className="text-sm text-text-muted font-normal">Evolución del engagement diario</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="date" stroke="hsl(var(--text-muted))" fontSize={11} />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }}
                      formatter={(value: any) => [`${value}%`, "Engagement"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "#EF4444" }} 
                      activeDot={{ r: 6, fill: "#EF4444" }} 
                      name="engagement" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparative Chart */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Comparación Diaria</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-full"></div>
        </div>
        
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <span className="text-lg">Comparación de Métricas por Día</span>
                <p className="text-sm text-text-muted font-normal">Views, saves y nuevos seguidores</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.timelineData}>
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
                  <XAxis dataKey="date" stroke="hsl(var(--text-muted))" fontSize={11} />
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
                  <Bar dataKey="views" fill="url(#viewsBar)" name="Views" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saves" fill="url(#savesBar)" name="Saves" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="followers" fill="url(#followersBar)" name="New Followers" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Resumen de Métricas</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-purple-500/50 to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Views" 
            icon={<Eye className="w-5 h-5 text-blue-500" />} 
            value={analyticsData.totalViews.toLocaleString()} 
            subtitle={`Promedio: ${Math.round(analyticsData.totalViews / Math.max(1, analyticsData.videoCount)).toLocaleString()}/video`}
            color="blue"
          />
          <StatCard 
            title="Total Likes" 
            icon={<Heart className="w-5 h-5 text-red-500" />} 
            value={analyticsData.totalLikes.toLocaleString()} 
            subtitle={`Rate: ${
              analyticsData.totalViews > 0 ? ((analyticsData.totalLikes / analyticsData.totalViews) * 100).toFixed(2) : 0
            }%`}
            color="red"
          />
          <StatCard 
            title="Total Comments" 
            icon={<MessageCircle className="w-5 h-5 text-green-500" />} 
            value={analyticsData.totalComments.toLocaleString()} 
            subtitle={`Rate: ${
              analyticsData.totalViews > 0 ? ((analyticsData.totalComments / analyticsData.totalViews) * 100).toFixed(2) : 0
            }%`}
            color="green"
          />
          <StatCard 
            title="Total Shares" 
            icon={<Share className="w-5 h-5 text-purple-500" />} 
            value={analyticsData.totalShares.toLocaleString()} 
            subtitle={`Rate: ${
              analyticsData.totalViews > 0 ? ((analyticsData.totalShares / analyticsData.totalViews) * 100).toFixed(2) : 0
            }%`}
            color="purple"
          />
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-text-primary">Métricas Específicas</h3>
          <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 border-yellow-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <BookmarkPlus className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <span className="text-lg">Tasa de Saves</span>
                  <p className="text-sm text-text-muted font-normal">Evolución de saves por período</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timelineData}>
                    <defs>
                      <linearGradient id="savesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
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
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="saves" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      fill="url(#savesGradient)" 
                      name="Saves" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Users className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <span className="text-lg">Crecimiento de Seguidores</span>
                  <p className="text-sm text-text-muted font-normal">Nuevos seguidores por día</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timelineData}>
                    <defs>
                      <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
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
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="followers" 
                      stroke="#6366F1" 
                      strokeWidth={2}
                      fill="url(#followersGradient)" 
                      name="New Followers" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}

function StatCard({ title, value, subtitle, icon, color }: any) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    red: "from-red-500/10 to-red-600/5 border-red-500/20",
    green: "from-green-500/10 to-green-600/5 border-green-500/20",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
    yellow: "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20",
    indigo: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20"
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-text-primary mb-1">{value}</div>
        <div className="text-xs text-text-secondary">{subtitle}</div>
      </CardContent>
    </Card>
  );
}