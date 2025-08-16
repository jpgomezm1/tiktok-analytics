import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SavedViewsManager } from './SavedViewsManager';
import { SaveViewModal } from './SaveViewModal';
import { VideoFilters, SortOption, HookType } from '@/types/videos';
import { Filter, RotateCcw, Save } from 'lucide-react';

interface VideoFiltersSidebarProps {
  filters: VideoFilters;
  sortBy: SortOption;
  normalizeBy1K: boolean;
  filterOptions: {
    themes: string[];
    ctaTypes: string[];
    editingStyles: string[];
  };
  onFiltersChange: (filters: Partial<VideoFilters>) => void;
  onSortChange: (sort: SortOption) => void;
  onNormalizeChange: (normalize: boolean) => void;
  onLoadView: (filters: VideoFilters, sort: SortOption, normalize: boolean) => void;
}

export const VideoFiltersSidebar = ({
  filters,
  sortBy,
  normalizeBy1K,
  filterOptions,
  onFiltersChange,
  onSortChange,
  onNormalizeChange,
  onLoadView,
}: VideoFiltersSidebarProps) => {
  const [showSaveModal, setShowSaveModal] = useState(false);

  const hookOptions: { value: HookType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos los hooks' },
    { value: 'pregunta', label: 'Pregunta (¿Cómo?, ¿Qué?)' },
    { value: 'numero', label: 'Número (3 formas, Top 5)' },
    { value: 'como', label: 'Cómo... (How to)' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'published_date_desc', label: 'Fecha (más reciente)' },
    { value: 'saves_per_1k_desc', label: 'Saves por 1K' },
    { value: 'engagement_rate_desc', label: 'Engagement Rate' },
    { value: 'speed_2h_desc', label: 'Velocidad 2h' },
    { value: 'performance_score_desc', label: 'Performance Score' },
    { value: 'views_desc', label: 'Vistas' },
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '14d', label: 'Últimos 14 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: 'all', label: 'Todos los videos' },
  ];

  const clearAllFilters = () => {
    onFiltersChange({
      theme: undefined,
      cta_type: undefined,
      editing_style: undefined,
      hook_type: undefined,
      date_range: '30d',
    });
    onSortChange('published_date_desc');
    onNormalizeChange(false);
  };

  const hasActiveFilters = Boolean(
    filters.theme || 
    filters.cta_type || 
    filters.editing_style || 
    (filters.hook_type && filters.hook_type !== 'all') ||
    normalizeBy1K
  );

  return (
    <div className="w-80 space-y-6">
      {/* Saved Views */}
      <SavedViewsManager onLoadView={onLoadView} />

      {/* Save Current View */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-text-primary">Vista actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => setShowSaveModal(true)}
            className="w-full gap-2"
            variant="outline"
          >
            <Save className="w-4 h-4" />
            Guardar vista
          </Button>
          
          {hasActiveFilters && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-text-muted"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Rango de fechas</label>
            <Select
              value={filters.date_range || '30d'}
              onValueChange={(value) => onFiltersChange({ date_range: value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {dateRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Tema</label>
            <Select
              value={filters.theme || 'all'}
              onValueChange={(value) => onFiltersChange({ theme: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Todos los temas" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todos los temas</SelectItem>
                {filterOptions.themes.map(theme => (
                  <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hook Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Tipo de Hook</label>
            <Select
              value={filters.hook_type || 'all'}
              onValueChange={(value) => onFiltersChange({ hook_type: value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {hookOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CTA Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Tipo de CTA</label>
            <Select
              value={filters.cta_type || 'all'}
              onValueChange={(value) => onFiltersChange({ cta_type: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Todos los CTAs" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todos los CTAs</SelectItem>
                {filterOptions.ctaTypes.map(cta => (
                  <SelectItem key={cta} value={cta}>{cta}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Editing Style */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Estilo de edición</label>
            <Select
              value={filters.editing_style || 'all'}
              onValueChange={(value) => onFiltersChange({ editing_style: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Todos los estilos" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Todos los estilos</SelectItem>
                {filterOptions.editingStyles.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sort & Options */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-text-primary">Orden y opciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sort */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Ordenar por</label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Normalize Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">
              Normalizar por 1K
            </label>
            <Button
              variant={normalizeBy1K ? "default" : "outline"}
              size="sm"
              onClick={() => onNormalizeChange(!normalizeBy1K)}
            >
              {normalizeBy1K ? 'ON' : 'OFF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-text-primary">Filtros activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.theme && (
                <Badge variant="secondary" className="text-xs">
                  Tema: {filters.theme}
                </Badge>
              )}
              {filters.cta_type && (
                <Badge variant="secondary" className="text-xs">
                  CTA: {filters.cta_type}
                </Badge>
              )}
              {filters.editing_style && (
                <Badge variant="secondary" className="text-xs">
                  Estilo: {filters.editing_style}
                </Badge>
              )}
              {filters.hook_type && filters.hook_type !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Hook: {hookOptions.find(h => h.value === filters.hook_type)?.label}
                </Badge>
              )}
              {normalizeBy1K && (
                <Badge variant="secondary" className="text-xs">
                  Normalizado
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <SaveViewModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        filters={filters}
        sortBy={sortBy}
        normalizeBy1K={normalizeBy1K}
      />
    </div>
  );
};