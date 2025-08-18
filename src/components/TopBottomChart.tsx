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
      <Card className="bg-card border-border shadow-card w-full max-w-full">
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
      <div className="space-y-3 w-full">
        {videos.map((video, index) => (
          <div key={video.id} className="flex items-start sm:items-center justify-between p-3 bg-muted rounded-lg gap-3 w-full max-w-full overflow-hidden">
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-1 min-w-0">
                <span className="text-xs font-medium text-text-muted flex-shrink-0">
                  #{index + 1}
                </span>
                <h4 className="text-sm font-medium text-text-primary truncate min-w-0 flex-1" title={video.title}>
                  {video.title}
                </h4>
              </div>
              
              {/* Información de métricas - Stack en móvil, inline en desktop */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-text-muted">
                <span className="flex-shrink-0">{video.views.toLocaleString()} vistas</span>
                <span className="flex-shrink-0">Retención: {video.retention.toFixed(1)}%</span>
                <span className="flex-shrink-0">Saves/1k: {video.savesPer1k.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Badge y trending - Siempre visible */}
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
              {isTop ? (
                <TrendingUp className="w-4 h-4 text-success flex-shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-error flex-shrink-0" />
              )}
              <Badge 
                variant={isTop ? "default" : "secondary"} 
                className="text-xs whitespace-nowrap flex-shrink-0"
              >
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
    <Card className="bg-card border-border shadow-card w-full max-w-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-text-primary text-lg sm:text-xl">Top 5 vs Bottom 5</CardTitle>
        <CardDescription className="text-text-secondary text-sm">
          Mejores y peores videos por métricas clave
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'retention' | 'saves')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="retention" className="text-xs sm:text-sm">Por Retención</TabsTrigger>
            <TabsTrigger value="saves" className="text-xs sm:text-sm">Por Saves/1k</TabsTrigger>
          </TabsList>

          <TabsContent value="retention" className="space-y-4 sm:space-y-6 w-full overflow-hidden">
            <div className="w-full">
              <h3 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Top 5 - Mayor Retención</span>
              </h3>
              {renderVideoList(data.top, true)}
            </div>
            
            <div className="w-full">
              <h3 className="text-sm font-medium text-error mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Bottom 5 - Menor Retención</span>
              </h3>
              {renderVideoList(data.bottom, false)}
            </div>
          </TabsContent>

          <TabsContent value="saves" className="space-y-4 sm:space-y-6 w-full overflow-hidden">
            <div className="w-full">
              <h3 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Top 5 - Más Saves/1k</span>
              </h3>
              {renderVideoList(data.top, true)}
            </div>
            
            <div className="w-full">
              <h3 className="text-sm font-medium text-error mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Bottom 5 - Menos Saves/1k</span>
              </h3>
              {renderVideoList(data.bottom, false)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};