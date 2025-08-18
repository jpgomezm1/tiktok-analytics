import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FollowerTrend } from '@/hooks/useFollowers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, Users, Activity } from 'lucide-react';

interface FollowersChartProps {
  data: FollowerTrend[];
  loading?: boolean;
}

export const FollowersChart = ({ data, loading }: FollowersChartProps) => {
  const formatXAxisLabel = (tickItem: string) => {
    try {
      return format(new Date(tickItem), 'dd/MM', { locale: es });
    } catch {
      return tickItem;
    }
  };

  const formatTooltipLabel = (label: string) => {
    try {
      return format(new Date(label), 'dd MMMM yyyy', { locale: es });
    } catch {
      return label;
    }
  };

  // Calculate growth stats
  const getGrowthStats = () => {
    if (!data || data.length < 2) return null;
    
    const firstValue = data[0].count;
    const lastValue = data[data.length - 1].count;
    const growth = lastValue - firstValue;
    const growthPercentage = ((growth / firstValue) * 100);
    
    return {
      growth,
      growthPercentage,
      isPositive: growth >= 0
    };
  };

  const growthStats = getGrowthStats();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gradient-to-r from-muted to-muted/60 animate-pulse rounded-lg"></div>
              <div className="h-4 w-32 bg-gradient-to-r from-muted/60 to-muted/40 animate-pulse rounded"></div>
            </div>
            <div className="h-10 w-10 bg-gradient-to-r from-muted to-muted/60 animate-pulse rounded-xl"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-bright/30 border-t-purple-bright rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-purple-bright/10 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-muted to-muted/70 rounded-xl">
              <Users className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-text-primary">Evolución de Seguidores</CardTitle>
              <CardDescription className="text-text-secondary">
                Últimos 30 días
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl">
              <Activity className="w-12 h-12 text-text-muted mx-auto" />
            </div>
            <div>
              <p className="text-text-muted font-medium">No hay datos históricos de seguidores</p>
              <p className="text-text-muted text-sm mt-1">Registra tus seguidores diariamente para ver el crecimiento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl hover:shadow-2xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-text-primary group-hover:text-blue-600 transition-colors duration-200">
                Evolución de Seguidores
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Últimos {data.length} días
              </CardDescription>
            </div>
          </div>
          
          {/* Growth indicator */}
          {growthStats && (
            <div className="text-right">
              <div className={`text-lg font-bold ${growthStats.isPositive ? 'text-success' : 'text-error'}`}>
                {growthStats.isPositive ? '+' : ''}{growthStats.growth.toLocaleString()}
              </div>
              <div className={`text-xs font-medium ${growthStats.isPositive ? 'text-success' : 'text-error'}`}>
                {growthStats.isPositive ? '+' : ''}{growthStats.growthPercentage.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[320px] p-4 bg-gradient-to-br from-muted/10 to-transparent rounded-xl border border-border/30">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="50%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.2}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
                stroke="hsl(var(--text-muted))"
                fontSize={11}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                stroke="hsl(var(--text-muted))"
                fontSize={11}
                tickFormatter={(value) => value.toLocaleString()}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip 
                labelFormatter={formatTooltipLabel}
                formatter={(value: number) => [value.toLocaleString(), 'Seguidores']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  color: 'hsl(var(--popover-foreground))',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(8px)'
                }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                fill="url(#followersGradient)"
                dot={{ 
                  fill: '#3b82f6', 
                  strokeWidth: 2, 
                  r: 4,
                  stroke: '#ffffff'
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#6366f1',
                  stroke: '#ffffff',
                  strokeWidth: 3,
                  filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};