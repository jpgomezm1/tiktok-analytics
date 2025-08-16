import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoFiltersBar } from '@/components/VideoFiltersBar';
import { VideoExplorerCard } from '@/components/VideoExplorerCard';
import { VideoListView } from '@/components/VideoListView';
import { VideoComparisonModal } from '@/components/VideoComparisonModal';
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
  const { toast } = useToast();
  
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
      toast({
        title: "No hay datos para exportar",
        description: "Ajusta los filtros para incluir videos",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = [
      'Título', 'Vistas', 'Engagement %', 'Retención %', 'Saves/1k', '% For You', 
      'Performance Score', 'Duración (s)', 'Fecha'
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
        video.performance_score.toFixed(2),
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

    toast({
      title: "CSV exportado",
      description: `${filteredVideos.length} videos exportados correctamente`
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Explorador de Videos</h1>
            <p className="text-text-secondary">Descubre patrones de rendimiento en tu contenido</p>
          </div>
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-text-primary">
                  Importa tu CSV para empezar
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  Sube tus datos de TikTok para encontrar patrones usando señales fuertes como retención, saves y tráfico For You.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90">
                  <Upload className="w-4 h-4" />
                  Importar CSV
                </Button>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar video manual
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <Sparkles className="w-4 h-4" />
                <span>Análisis por percentiles, no solo por views</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Explorador de Videos</h1>
          <p className="text-text-secondary">
            Encuentra patrones usando señales fuertes y ranking por percentiles
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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