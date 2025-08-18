import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoFiltersBar } from '@/components/VideoFiltersBar';
import { VideoExplorerCard } from '@/components/VideoExplorerCard';
import { VideoListView } from '@/components/VideoListView';
import { VideoComparisonModal } from '@/components/VideoComparisonModal';
import { NoVideosState } from '@/components/empty-states/NoVideosState';
import { VideoGridSkeleton } from '@/components/skeletons/VideoCardSkeleton';
import { useVideoExplorer, VideoFilters, VideoExplorerData } from '@/hooks/useVideoExplorer';
import { 
  Grid, 
  List, 
  Download, 
  BarChart3, 
  Plus, 
  Upload, 
  Sparkles,
  GitCompare,
  Users,
  Video,
  Filter,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Videos = () => {
  const { videos, loading, getVideos, getComparison } = useVideoExplorer();
  const { toast, success, error: showError } = useToast();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  
  const [filters, setFilters] = useState<VideoFilters>({
    dateRange: { start: null, end: null, preset: null },
    duration: [],
    videoType: undefined,
    signals: {
      topRetention: false,
      topSaves: false,
      highForYou: false,
      topF1k: false,
      highVelocity: false
    },
    search: ''
  });

  const filteredVideos = useMemo(() => {
    return getVideos(filters);
  }, [videos, filters, getVideos]);

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedVideos(selectedIds);
  };

  const handleCardSelection = (videoId: string, selected: boolean) => {
    if (selected) {
      setSelectedVideos([...selectedVideos, videoId]);
    } else {
      setSelectedVideos(selectedVideos.filter(id => id !== videoId));
    }
  };

  const handleCompare = () => {
    if (selectedVideos.length < 2) {
      toast({
        title: "Selecciona al menos 2 videos",
        description: "Necesitas seleccionar videos para compararlos",
        variant: "destructive"
      });
      return;
    }

    // Split selected videos into two groups (first half vs second half)
    const midpoint = Math.floor(selectedVideos.length / 2);
    const groupA = filteredVideos.filter(v => selectedVideos.slice(0, midpoint).includes(v.id));
    const groupB = filteredVideos.filter(v => selectedVideos.slice(midpoint).includes(v.id));

    const comparison = getComparison(groupA, groupB);
    setComparisonData(comparison);
    setShowComparison(true);
  };

  const handleExportCSV = () => {
    if (filteredVideos.length === 0) {
      showError({
        title: "No hay datos para exportar",
        description: "Ajusta los filtros para incluir videos"
      });
      return;
    }

    success({
      title: "Exportación iniciada",
      description: `Preparando ${filteredVideos.length} videos para descarga...`
    });

    // Create CSV content
    const headers = [
      'Título', 'Vistas', 'Engagement %', 'Retención %', 'Saves/1k', '% For You', 
      'Viral Index', 'Duración (s)', 'Fecha'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredVideos.map(video => [
        `"${video.title}"`,
        video.views,
        video.engagement_rate.toFixed(2),
        video.retention_rate.toFixed(2),
        video.saves_per_1k.toFixed(2),
        video.for_you_percentage.toFixed(2),
        video.viral_index.toFixed(2),
        video.duration_seconds,
        video.published_date
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `videos-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    success({
      title: "CSV descargado exitosamente",
      description: `${filteredVideos.length} videos exportados`
    });
  };

  const clearSelection = () => {
    setSelectedVideos([]);
    setSelectionMode(false);
  };

  const selectAll = () => {
    setSelectedVideos(filteredVideos.map(v => v.id));
  };

  const hasActiveFilters = () => {
    return filters.search !== '' || 
           filters.duration.length > 0 || 
           filters.videoType !== undefined ||
           Object.values(filters.signals).some(signal => signal) ||
           filters.dateRange.start !== null || 
           filters.dateRange.end !== null ||
           filters.dateRange.preset !== null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-8 w-48 bg-gradient-to-r from-muted to-muted/60 animate-pulse rounded-lg"></div>
                  <div className="h-4 w-72 bg-gradient-to-r from-muted/60 to-muted/40 animate-pulse rounded"></div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-10 w-32 bg-gradient-to-r from-muted to-muted/60 animate-pulse rounded-lg"></div>
                  <div className="h-10 w-28 bg-gradient-to-r from-muted/60 to-muted/40 animate-pulse rounded-lg"></div>
                </div>
              </div>
              <div className="h-16 w-full bg-gradient-to-r from-muted/40 to-muted/20 animate-pulse rounded-xl"></div>
            </div>
            <VideoGridSkeleton count={12} />
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <NoVideosState 
              title="Importa tu CSV para empezar"
              subtitle="Sube tus datos de TikTok para encontrar patrones usando señales fuertes como retención, saves y tráfico For You."
              showImportButton={true}
              showExampleButton={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Enhanced Header Section */}
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-bright to-purple-dark rounded-xl shadow-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                      Explorador de Videos
                    </h1>
                    <p className="text-text-secondary">
                      Analiza patrones y encuentra insights en tu contenido
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Selection Controls */}
                {selectionMode && (
                  <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border rounded-xl px-3 py-2">
                    {selectedVideos.length > 0 && (
                      <Badge variant="secondary" className="gap-1 bg-purple-bright/20 text-purple-light border-purple-bright/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {selectedVideos.length} seleccionados
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="text-xs"
                    >
                      Todos
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="text-xs"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* Main Actions */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectionMode(!selectionMode)}
                    className={cn(
                      "transition-all duration-200 backdrop-blur-sm bg-card/50",
                      selectionMode 
                        ? "bg-purple-bright text-white border-purple-bright shadow-lg" 
                        : "hover:border-purple-bright/30"
                    )}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {selectionMode ? 'Cancelar' : 'Seleccionar'}
                  </Button>
                  
                  {selectedVideos.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCompare}
                      className="gap-2 hover:border-blue-500/30 hover:text-blue-500 transition-all duration-200 backdrop-blur-sm bg-card/50"
                    >
                      <GitCompare className="w-4 h-4" />
                      Comparar
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="gap-2 hover:border-green-500/30 hover:text-green-500 transition-all duration-200 backdrop-blur-sm bg-card/50"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar CSV</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
              <VideoFiltersBar
                filters={filters}
                onFiltersChange={setFilters}
                totalVideos={videos.length}
                filteredCount={filteredVideos.length}
              />
            </div>
          </div>

          {/* Enhanced View Controls */}
          <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text-secondary">
                  {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                </span>
                {hasActiveFilters() && (
                  <Badge variant="outline" className="text-xs">
                    <Filter className="w-3 h-3 mr-1" />
                    Filtrado
                  </Badge>
                )}
              </div>
              
              {videos.length !== filteredVideos.length && (
                <span className="text-xs text-text-muted">
                  de {videos.length} totales
                </span>
              )}
            </div>
            
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
              <TabsList className="bg-muted/50 backdrop-blur-sm">
                <TabsTrigger value="grid" className="gap-2 data-[state=active]:bg-card">
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Tarjetas</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-card">
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Lista</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Enhanced Content */}
          {filteredVideos.length === 0 ? (
            <Card className="border-dashed border-2 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <CardContent className="py-16 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted to-muted/70 rounded-2xl flex items-center justify-center">
                  <Filter className="w-10 h-10 text-text-muted" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    No hay videos que cumplan este patrón
                  </h3>
                  <p className="text-text-secondary max-w-md mx-auto">
                    Prueba ajustar los filtros o quitar algunas restricciones para ver más resultados
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    dateRange: { start: null, end: null, preset: null },
                    duration: [],
                    videoType: undefined,
                    signals: {
                      topRetention: false,
                      topSaves: false,
                      highForYou: false,
                      topF1k: false,
                      highVelocity: false
                    },
                    search: ''
                  })}
                  className="gap-2 hover:border-purple-bright/30"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => (
                <div 
                  key={video.id}
                  className="transform transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <VideoExplorerCard
                    video={video}
                    isSelected={selectedVideos.includes(video.id)}
                    onSelect={(selected) => handleCardSelection(video.id, selected)}
                    showSelection={selectionMode}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg">
              <VideoListView
                videos={filteredVideos}
                selectedVideos={selectedVideos}
                onSelectionChange={handleSelectionChange}
                showSelection={selectionMode}
              />
            </div>
          )}

          {/* Comparison Modal */}
          <VideoComparisonModal
            open={showComparison}
            onClose={() => setShowComparison(false)}
            comparisonData={comparisonData}
          />
        </div>
      </div>
    </div>
  );
};

export default Videos;