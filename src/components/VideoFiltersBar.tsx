import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { VideoFilters } from '@/hooks/useVideoExplorer';

interface VideoFiltersBarProps {
  filters: VideoFilters;
  onFiltersChange: (filters: VideoFilters) => void;
  totalVideos: number;
  filteredCount: number;
}

export const VideoFiltersBar = ({ 
  filters, 
  onFiltersChange, 
  totalVideos, 
  filteredCount 
}: VideoFiltersBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<VideoFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const updateSignals = (signal: keyof VideoFilters['signals'], value: boolean) => {
    updateFilters({
      signals: { ...filters.signals, [signal]: value }
    });
  };

  const updateDuration = (duration: 'short' | 'medium' | 'long', checked: boolean) => {
    const newDuration = checked 
      ? [...filters.duration, duration]
      : filters.duration.filter(d => d !== duration);
    updateFilters({ duration: newDuration });
  };

  const setDatePreset = (preset: '7d' | '30d') => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (preset === '7d' ? 7 : 30));
    
    updateFilters({
      dateRange: { start, end, preset }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
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
  };

  const hasActiveFilters = 
    filters.dateRange.preset ||
    filters.duration.length > 0 ||
    filters.videoType ||
    Object.values(filters.signals).some(Boolean) ||
    filters.search;

  return (
    <div className="bg-card border-border border rounded-lg p-4 space-y-4 sticky top-4 z-10">
      {/* Search and basic controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar en título, hook, guión..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="bg-background"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
              !
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-text-muted"
          >
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Date Range */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary">Período</h4>
            <div className="flex gap-2">
              <Button
                variant={filters.dateRange.preset === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDatePreset('7d')}
                className="h-8"
              >
                Últimos 7 días
              </Button>
              <Button
                variant={filters.dateRange.preset === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDatePreset('30d')}
                className="h-8"
              >
                Últimos 30 días
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-2",
                      filters.dateRange.preset === 'custom' && "bg-primary text-primary-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {filters.dateRange.start ? (
                      <>
                        {format(filters.dateRange.start, "dd/MM", { locale: es })}
                        {filters.dateRange.end && ` - ${format(filters.dateRange.end, "dd/MM", { locale: es })}`}
                      </>
                    ) : (
                      "Personalizado"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: filters.dateRange.start || undefined,
                      to: filters.dateRange.end || undefined
                    }}
                    onSelect={(range) => {
                      updateFilters({
                        dateRange: {
                          start: range?.from || null,
                          end: range?.to || null,
                          preset: 'custom'
                        }
                      });
                    }}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary">Duración</h4>
            <div className="flex gap-2">
              {[
                { key: 'short' as const, label: '<20s' },
                { key: 'medium' as const, label: '20-40s' },
                { key: 'long' as const, label: '>40s' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={filters.duration.includes(key)}
                    onCheckedChange={(checked) => updateDuration(key, checked as boolean)}
                  />
                  <label
                    htmlFor={key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Signals */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary">Señales fuertes</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="topRetention"
                  checked={filters.signals.topRetention}
                  onCheckedChange={(checked) => updateSignals('topRetention', checked as boolean)}
                />
                <label htmlFor="topRetention" className="text-sm">
                  Top 10% Retención
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="topSaves"
                  checked={filters.signals.topSaves}
                  onCheckedChange={(checked) => updateSignals('topSaves', checked as boolean)}
                />
                <label htmlFor="topSaves" className="text-sm">
                  Top 10% Saves/1k
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="highForYou"
                  checked={filters.signals.highForYou}
                  onCheckedChange={(checked) => updateSignals('highForYou', checked as boolean)}
                />
                <label htmlFor="highForYou" className="text-sm">
                  % For You alto
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="highVelocity"
                  checked={filters.signals.highVelocity}
                  onCheckedChange={(checked) => updateSignals('highVelocity', checked as boolean)}
                  disabled
                />
                <label htmlFor="highVelocity" className="text-sm text-text-muted">
                  Velocidad inicial
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Próximamente
                  </Badge>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-text-muted border-t border-border pt-3">
        <span>
          Mostrando {filteredCount.toLocaleString()} de {totalVideos.toLocaleString()} videos
        </span>
        
        {hasActiveFilters && (
          <span className="text-text-secondary">
            Filtros activos
          </span>
        )}
      </div>
    </div>
  );
};