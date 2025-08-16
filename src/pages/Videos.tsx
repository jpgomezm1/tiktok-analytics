import { useState, useMemo } from 'react';
import { useVideos } from '@/hooks/useVideos';
import { VideoCard } from '@/components/VideoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List, Plus, BarChart3, Upload, Sparkles } from 'lucide-react';

const Videos = () => {
  const { videos, loading } = useVideos();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'performance' | 'saves_per_1k' | 'engagement_rate'>('performance');

  // Enhanced filtering and sorting
  const processedVideos = useMemo(() => {
    // First, calculate derived metrics and filter
    const videosWithMetrics = videos.map(video => {
      const views = video.views || 0;
      const saves = video.saves || 0;
      const likes = video.likes || 0;
      const comments = video.comments || 0;
      const shares = video.shares || 0;

      const savesPer1K = views > 0 ? (saves / views) * 1000 : 0;
      const engagementRate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;

      return {
        ...video,
        savesPer1K,
        engagementRate
      };
    }).filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.hook?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort by selected criteria
    return videosWithMetrics.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return (b.performance_score || 0) - (a.performance_score || 0);
        case 'saves_per_1k':
          return b.savesPer1K - a.savesPer1K;
        case 'engagement_rate':
          return b.engagementRate - a.engagementRate;
        default:
          return 0;
      }
    });
  }, [videos, searchTerm, sortBy]);

  return (
    <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Video Library</h1>
            <p className="text-text-secondary">Manage and analyze your TikTok content performance</p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Video
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-text-primary">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <Input
                  placeholder="Search videos by title or hook..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Score</SelectItem>
                    <SelectItem value="saves_per_1k">Saves por 1K</SelectItem>
                    <SelectItem value="engagement_rate">Engagement Rate</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <div className="flex border border-border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : videos.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-text-primary">
                    Empieza a analizar tu rendimiento
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    Sube tus videos o importa tu data de TikTok para ver patrones, métricas y oportunidades de crecimiento.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90">
                    <Plus className="w-4 h-4" />
                    Agregar video
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Importar CSV
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                  <Sparkles className="w-4 h-4" />
                  <span>Convierte tu data en insights accionables</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : processedVideos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary mb-4">No se encontraron videos con ese término</p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Ver todos los videos
              </Button>
            </CardContent>
          </Card>
        ) : (
           <div className={`grid gap-6 ${
             viewMode === 'grid' 
               ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
               : 'grid-cols-1'
           }`}>
             {processedVideos.map((video) => (
               <VideoCard key={video.id} video={video} />
             ))}
           </div>
        )}
    </div>
  );
};

export default Videos;