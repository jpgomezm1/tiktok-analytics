import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { VideoFiltersSidebar } from '@/components/videos/VideoFiltersSidebar';
import { VideoTable } from '@/components/videos/VideoTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVideoFilters } from '@/hooks/useVideoFilters';
import { exportToCSV } from '@/utils/csvExport';
import { VideoFilters, SortOption } from '@/types/videos';
import { 
  Download, 
  Table as TableIcon, 
  Grid3X3, 
  Filter,
  X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Videos = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showSidebar, setShowSidebar] = useState(true);
  const { toast } = useToast();

  const {
    filters,
    sortBy,
    normalizeBy1K,
    updateFilters,
    updateSort,
    updateNormalize,
    filteredVideos,
    calculatePerformanceBadge,
    filterOptions,
    loading,
  } = useVideoFilters();

  const handleLoadView = (
    newFilters: VideoFilters, 
    newSort: SortOption, 
    newNormalize: boolean
  ) => {
    updateFilters(newFilters);
    updateSort(newSort);
    updateNormalize(newNormalize);
    
    toast({
      title: "Vista cargada",
      description: "Los filtros se han aplicado ✅",
    });
  };

  const handleExportCSV = () => {
    if (filteredVideos.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay videos para exportar",
        variant: "destructive",
      });
      return;
    }

    exportToCSV(filteredVideos);
    toast({
      title: "CSV exportado",
      description: `${filteredVideos.length} videos exportados ✅`,
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {showSidebar && (
            <VideoFiltersSidebar
              filters={filters}
              sortBy={sortBy}
              normalizeBy1K={normalizeBy1K}
              filterOptions={filterOptions}
              onFiltersChange={updateFilters}
              onSortChange={updateSort}
              onNormalizeChange={updateNormalize}
              onLoadView={handleLoadView}
            />
          )}

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Explorador de Videos</h1>
                <Badge variant="outline">{filteredVideos.length} videos</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  {showSidebar ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                </Button>
                
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            ) : (
              <VideoTable
                videos={filteredVideos}
                calculatePerformanceBadge={calculatePerformanceBadge}
                normalizeBy1K={normalizeBy1K}
                viewMode={viewMode}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Videos;