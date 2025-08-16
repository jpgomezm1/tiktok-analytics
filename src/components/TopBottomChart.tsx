import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TopBottomItem } from '@/hooks/useKPIs';

interface TopBottomChartProps {
  data: { top: TopBottomItem[]; bottom: TopBottomItem[] };
  loading?: boolean;
}

export const TopBottomChart = ({ data, loading }: TopBottomChartProps) => {
  const [activeTab, setActiveTab] = useState<'retention' | 'saves'>('retention');

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Top 5 vs Bottom 5</CardTitle>
          <CardDescription className="text-text-secondary">
            Mejores y peores videos por métricas clave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderVideoList = (videos: TopBottomItem[], isTop: boolean) => {
    if (videos.length === 0) {
      return (
        <div className="text-center py-8 text-text-muted">
          <p>No hay datos suficientes</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {videos.map((video, index) => (
          <div key={video.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-text-muted">
                  #{index + 1}
                </span>
                <h4 className="text-sm font-medium text-text-primary truncate">
                  {video.title}
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>{video.views.toLocaleString()} vistas</span>
                <span>Retención: {video.retention.toFixed(1)}%</span>
                <span>Saves/1k: {video.savesPer1k.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isTop ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-error" />
              )}
              <Badge variant={isTop ? "default" : "secondary"} className="text-xs">
                {activeTab === 'retention' 
                  ? `${video.retention.toFixed(1)}%`
                  : `${video.savesPer1k.toFixed(1)}`
                }
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-text-primary">Top 5 vs Bottom 5</CardTitle>
        <CardDescription className="text-text-secondary">
          Mejores y peores videos por métricas clave
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'retention' | 'saves')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="retention">Por Retención</TabsTrigger>
            <TabsTrigger value="saves">Por Saves/1k</TabsTrigger>
          </TabsList>

          <TabsContent value="retention" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top 5 - Mayor Retención
              </h3>
              {renderVideoList(data.top, true)}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-error mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Bottom 5 - Menor Retención
              </h3>
              {renderVideoList(data.bottom, false)}
            </div>
          </TabsContent>

          <TabsContent value="saves" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top 5 - Más Saves/1k
              </h3>
              {renderVideoList(data.top, true)}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-error mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Bottom 5 - Menos Saves/1k
              </h3>
              {renderVideoList(data.bottom, false)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};