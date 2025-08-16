import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FollowerTrend } from '@/hooks/useFollowers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Evolución de Seguidores</CardTitle>
          <CardDescription className="text-text-secondary">
            Últimos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Evolución de Seguidores</CardTitle>
          <CardDescription className="text-text-secondary">
            Últimos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-text-muted">
            <p>No hay datos históricos de seguidores</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-text-primary">Evolución de Seguidores</CardTitle>
        <CardDescription className="text-text-secondary">
          Últimos {data.length} días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
                stroke="hsl(var(--text-muted))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--text-muted))"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                labelFormatter={formatTooltipLabel}
                formatter={(value: number) => [value.toLocaleString(), 'Seguidores']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ 
                  fill: '#8b5cf6', 
                  strokeWidth: 2, 
                  r: 4 
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#c084fc',
                  stroke: '#8b5cf6',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};