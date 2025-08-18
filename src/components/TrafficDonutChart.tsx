import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Globe, Hash, Music, Search, User } from 'lucide-react';

interface TrafficData {
  label: string;
  value: number;
}

interface TrafficDonutChartProps {
  data: TrafficData[];
  loading?: boolean;
}

const COLORS = {
  'For You': '#8b5cf6',
  'Perfil': '#06b6d4',
  'Hashtag': '#10b981',
  'Audio': '#f59e0b',
  'Búsqueda': '#ef4444'
};

const ICONS = {
  'For You': <Globe className="w-4 h-4" />,
  'Perfil': <User className="w-4 h-4" />,
  'Hashtag': <Hash className="w-4 h-4" />,
  'Audio': <Music className="w-4 h-4" />,
  'Búsqueda': <Search className="w-4 h-4" />
};

export const TrafficDonutChart = ({ data, loading }: TrafficDonutChartProps) => {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gradient-to-r from-muted to-muted/60 animate-pulse rounded-lg"></div>
              <div className="h-4 w-56 bg-gradient-to-r from-muted/60 to-muted/40 animate-pulse rounded"></div>
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
              <BarChart3 className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-text-primary">Fuentes de Tráfico</CardTitle>
              <CardDescription className="text-text-secondary">
                Distribución de vistas por origen
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl">
              <BarChart3 className="w-12 h-12 text-text-muted mx-auto" />
            </div>
            <div>
              <p className="text-text-muted font-medium">No hay datos de tráfico disponibles</p>
              <p className="text-text-muted text-sm mt-1">Importa videos con datos de tráfico para ver la distribución</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTooltip = (value: number, name: string) => {
    return [`${value.toFixed(1)}%`, name];
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 bg-muted/20 rounded-lg px-3 py-2 border border-border/30">
            <div className="flex items-center space-x-1">
              {ICONS[entry.value as keyof typeof ICONS] || <Globe className="w-4 h-4" />}
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
            </div>
            <span className="text-xs font-medium text-text-secondary">
              {entry.value}
            </span>
            <span className="text-xs font-bold text-text-primary">
              {entry.payload.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  const topSource = data.reduce((max, current) => current.value > max.value ? current : max);

  return (
    <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl hover:shadow-2xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-text-primary group-hover:text-purple-600 transition-colors duration-200">
                Fuentes de Tráfico
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Distribución de vistas por origen
              </CardDescription>
            </div>
          </div>
          
          {/* Top source indicator */}
          <div className="text-right">
            <div className="text-sm font-medium text-text-muted">Top Source</div>
            <div className="flex items-center space-x-1">
              {ICONS[topSource.label as keyof typeof ICONS] || <Globe className="w-4 h-4" />}
              <span className="text-sm font-bold text-text-primary">{topSource.label}</span>
            </div>
            <div className="text-xs font-medium" style={{ color: COLORS[topSource.label as keyof typeof COLORS] }}>
              {topSource.value.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-gradient-to-br from-muted/10 to-transparent rounded-xl border border-border/30 p-4">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {Object.entries(COLORS).map(([key, color]) => (
                    <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="40%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={85}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient-${entry.label})`}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={formatTooltip}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--popover-foreground))',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Legend 
                  content={<CustomLegend />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};