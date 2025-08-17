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
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    success({
      title: "Exportación iniciada",
      description: `Preparando ${filteredVideos.length} videos para descarga...`
    });
    if (filteredVideos.length === 0) {
      showError({
        title: "No hay datos para exportar",
        description: "Ajusta los filtros para incluir videos"
      });
      return;
    }

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

  if (loading) {
    return (
      <div className="space-y-xl">
        <div className="flex justify-end">
          <div className="h-10 w-48 bg-muted animate-pulse rounded"></div>
        </div>
        <VideoGridSkeleton count={12} />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="space-y-xl">
        <NoVideosState 
          title="Importa tu CSV para empezar"
          subtitle="Sube tus datos de TikTok para encontrar patrones usando señales fuertes como retención, saves y tráfico For You."
          showImportButton={true}
          showExampleButton={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {/* Page Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-lg mb-xl">
        <div className="flex items-center gap-md">
          {selectedVideos.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              {selectedVideos.length} seleccionados
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectionMode(!selectionMode)}
            className={selectionMode ? "bg-primary text-primary-foreground" : ""}
          >
            Seleccionar
          </Button>
          
          {selectedVideos.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompare}
              className="gap-2"
            >
              <GitCompare className="w-4 h-4" />
              Comparar
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <VideoFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        totalVideos={videos.length}
        filteredCount={filteredVideos.length}
      />

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <Grid className="w-4 h-4" />
              Tarjetas
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {filteredVideos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary mb-4">
              No hay videos que cumplan este patrón, prueba quitar un filtro
            </p>
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
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl">
          {filteredVideos.map((video) => (
            <VideoExplorerCard
              key={video.id}
              video={video}
              isSelected={selectedVideos.includes(video.id)}
              onSelect={(selected) => handleCardSelection(video.id, selected)}
              showSelection={selectionMode}
            />
          ))}
        </div>
      ) : (
        <VideoListView
          videos={filteredVideos}
          selectedVideos={selectedVideos}
          onSelectionChange={handleSelectionChange}
          showSelection={selectionMode}
        />
      )}

      {/* Comparison Modal */}
      <VideoComparisonModal
        open={showComparison}
        onClose={() => setShowComparison(false)}
        comparisonData={comparisonData}
      />
    </div>
  );
};

export default Videos;