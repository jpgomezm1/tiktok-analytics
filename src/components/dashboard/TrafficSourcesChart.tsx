import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricTooltip } from './MetricTooltip';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProcessedVideo {
  traffic_for_you?: number;
  traffic_follow?: number;
  traffic_hashtag?: number;
  traffic_sound?: number;
  traffic_profile?: number;
  traffic_search?: number;
  published_date: string;
}

interface TrafficSourcesChartProps {
  videos: ProcessedVideo[];
  loading: boolean;
}

export const TrafficSourcesChart = ({
  videos,
  loading
}: TrafficSourcesChartProps) => {
  const trafficData = useMemo(() => {
    if (!videos || videos.length === 0) return { current: [], previous: [], deltas: [] };

    const now = new Date();
    const last7d = videos.filter(v => 
      new Date(v.published_date) >= new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    );
    const prev7d = videos.filter(v => {
      const date = new Date(v.published_date);
      return date >= new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)) &&
             date < new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    });

    const calculateTrafficTotals = (videoList: ProcessedVideo[]) => {
      return videoList.reduce((acc, video) => {
        acc.forYou += video.traffic_for_you || 0;
        acc.follow += video.traffic_follow || 0;
        acc.hashtag += video.traffic_hashtag || 0;
        acc.sound += video.traffic_sound || 0;
        acc.profile += video.traffic_profile || 0;
        acc.search += video.traffic_search || 0;
        return acc;
      }, {
        forYou: 0,
        follow: 0, 
        hashtag: 0,
        sound: 0,
        profile: 0,
        search: 0
      });
    };

    const currentTotals = calculateTrafficTotals(last7d);
    const previousTotals = calculateTrafficTotals(prev7d);

    const sources = [
      { name: 'For You', key: 'forYou', color: '#8B5CF6', current: currentTotals.forYou, previous: previousTotals.forYou },
      { name: 'Follow', key: 'follow', color: '#06B6D4', current: currentTotals.follow, previous: previousTotals.follow },
      { name: 'Hashtag', key: 'hashtag', color: '#10B981', current: currentTotals.hashtag, previous: previousTotals.hashtag },
      { name: 'Sound', key: 'sound', color: '#F59E0B', current: currentTotals.sound, previous: previousTotals.sound },
      { name: 'Perfil', key: 'profile', color: '#EF4444', current: currentTotals.profile, previous: previousTotals.profile },
      { name: 'Búsqueda', key: 'search', color: '#6366F1', current: currentTotals.search, previous: previousTotals.search }
    ];

    const totalCurrent = sources.reduce((sum, s) => sum + s.current, 0);
    
    const currentData = sources
      .filter(s => s.current > 0)
      .map(source => ({
        name: source.name,
        value: source.current,
        percentage: totalCurrent > 0 ? (source.current / totalCurrent) * 100 : 0,
        color: source.color
      }));

    const deltas = sources.map(source => {
      const change = source.current - source.previous;
      const changePercentage = source.previous > 0 ? (change / source.previous) * 100 : 0;
      
      let direction: 'up' | 'down' | 'neutral' = 'neutral';
      if (Math.abs(changePercentage) > 5) {
        direction = changePercentage > 0 ? 'up' : 'down';
      }

      return {
        name: source.name,
        change,
        changePercentage,
        direction
      };
    });

    return { current: currentData, deltas };
  }, [videos]);

  const getDeltaIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-400" />;
      default: return <Minus className="w-3 h-3 text-text-muted" />;
    }
  };

  const getDeltaColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-text-muted';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-text-primary font-medium">{data.name}</p>
          <p className="text-text-secondary">
            {data.value.toLocaleString()} vistas ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Fuentes de Tráfico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded w-3/4" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = trafficData.current.length > 0;

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-text-primary flex items-center gap-2">
          Fuentes de Tráfico
          <MetricTooltip
            label="Fuentes de Tráfico"
            formula="Distribución de vistas por fuente de descubrimiento"
            why="De dónde llega tu audiencia y cómo cambia semana a semana. Ayuda a optimizar la estrategia de distribución."
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-64 flex items-center justify-center text-center">
            <div>
              <PieChart className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">No hay datos de tráfico disponibles</p>
              <p className="text-sm text-text-muted mt-2">Los datos de fuentes aparecerán cuando tengas videos con información de tráfico</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData.current}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {trafficData.current.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Delta Changes */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text-primary mb-3">
                Cambios vs semana anterior
              </h4>
              {trafficData.deltas.map((delta, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: trafficData.current.find(c => c.name === delta.name)?.color || '#6B7280' 
                      }}
                    />
                    <span className="text-sm text-text-secondary">{delta.name}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${getDeltaColor(delta.direction)}`}>
                    {getDeltaIcon(delta.direction)}
                    <span>
                      {delta.direction === 'neutral' ? '=' : 
                       delta.changePercentage > 0 ? `+${delta.changePercentage.toFixed(0)}%` :
                       `${delta.changePercentage.toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              ))}
              
              {trafficData.deltas.length === 0 && (
                <div className="text-sm text-text-muted text-center py-4">
                  No hay datos suficientes para comparar
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};