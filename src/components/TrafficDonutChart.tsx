import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  'Perfil': '#c084fc',
  'Hashtag': '#a855f7',
  'Audio': '#9333ea',
  'Búsqueda': '#7c3aed'
};

export const TrafficDonutChart = ({ data, loading }: TrafficDonutChartProps) => {
  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Fuentes de Tráfico</CardTitle>
          <CardDescription className="text-text-secondary">
            Distribución de vistas por origen
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
          <CardTitle className="text-text-primary">Fuentes de Tráfico</CardTitle>
          <CardDescription className="text-text-secondary">
            Distribución de vistas por origen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-text-muted">
            <p>No hay datos de tráfico disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTooltip = (value: number, name: string) => {
    return [`${value.toFixed(1)}%`, name];
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
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
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-text-primary">Fuentes de Tráfico</CardTitle>
        <CardDescription className="text-text-secondary">
          Distribución de vistas por origen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.label as keyof typeof COLORS] || '#8b5cf6'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                  color: 'hsl(var(--text-secondary))'
                }}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload.value.toFixed(1)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};