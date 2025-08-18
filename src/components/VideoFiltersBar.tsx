import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X, Search, Clock, TrendingUp, Heart, Zap, Target } from 'lucide-react';
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
        topF1k: false,
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.dateRange.preset) count++;
    if (filters.duration.length > 0) count++;
    if (filters.videoType) count++;
    count += Object.values(filters.signals).filter(Boolean).length;
    return count;
  };

  const signalIcons = {
    topRetention: <Clock className="w-4 h-4" />,
    topSaves: <Heart className="w-4 h-4" />,
    highForYou: <TrendingUp className="w-4 h-4" />,
    topF1k: <Target className="w-4 h-4" />,
    highVelocity: <Zap className="w-4 h-4" />
  };

  const signalColors = {
    topRetention: 'text-orange-500',
    topSaves: 'text-red-500',
    highForYou: 'text-purple-500',
    topF1k: 'text-blue-500',
    highVelocity: 'text-yellow-500'
  };

  return (
    <div className="space-y-4">
      {/* Main Search and Filter Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Buscar en título, hook, guión..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-background/60 backdrop-blur-sm border-border/60 focus:border-purple-bright/50 transition-all duration-200"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilters({ search: '' })}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "gap-2 transition-all duration-200 backdrop-blur-sm bg-card/50 border-border/60",
            isExpanded && "bg-purple-bright/10 border-purple-bright/30 text-purple-light",
            hasActiveFilters && !isExpanded && "bg-blue-500/10 border-blue-500/30 text-blue-400"
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="h-5 min-w-5 text-xs bg-purple-bright/20 text-purple-light border-purple-bright/30">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </Button>
        )}
      </div>

      {/* Active Filters Preview */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-400 border-blue-500/30">
              <Search className="w-3 h-3" />
              "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ search: '' })}
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-500/20"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange.preset && (
            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-400 border-green-500/30">
              <CalendarIcon className="w-3 h-3" />
              {filters.dateRange.preset === '7d' ? 'Últimos 7 días' : 'Últimos 30 días'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ dateRange: { start: null, end: null, preset: null } })}
                className="h-4 w-4 p-0 ml-1 hover:bg-green-500/20"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}

          {Object.entries(filters.signals).filter(([_, active]) => active).map(([signal, _]) => (
            <Badge key={signal} variant="outline" className={cn("gap-1 border-opacity-30", 
              signalColors[signal as keyof typeof signalColors]?.replace('text-', 'bg-').replace('500', '500/10'),
              signalColors[signal as keyof typeof signalColors]?.replace('500', '400'),
              signalColors[signal as keyof typeof signalColors]?.replace('text-', 'border-').replace('500', '500/30')
            )}>
              {signalIcons[signal as keyof typeof signalIcons]}
              {signal === 'topRetention' ? 'Top Retención' :
               signal === 'topSaves' ? 'Top Saves' :
               signal === 'highForYou' ? 'For You Alto' :
               signal === 'topF1k' ? 'Top F/1k' : 'Velocidad'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateSignals(signal as keyof VideoFilters['signals'], false)}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-green-500" />
              <h4 className="text-sm font-semibold text-text-primary">Período</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.dateRange.preset === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDatePreset('7d')}
                className={cn(
                  "h-8 transition-all duration-200",
                  filters.dateRange.preset === '7d' 
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg" 
                    : "hover:border-green-500/30 hover:text-green-500"
                )}
              >
                Últimos 7 días
              </Button>
              <Button
                variant={filters.dateRange.preset === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDatePreset('30d')}
                className={cn(
                  "h-8 transition-all duration-200",
                  filters.dateRange.preset === '30d' 
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg" 
                    : "hover:border-green-500/30 hover:text-green-500"
                )}
              >
                Últimos 30 días
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-2 transition-all duration-200",
                      filters.dateRange.preset === 'custom' && "bg-green-500 text-white hover:bg-green-600",
                      filters.dateRange.preset !== 'custom' && "hover:border-green-500/30 hover:text-green-500"
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
                <PopoverContent className="w-auto p-0 bg-card/95 backdrop-blur-sm border-border/60" align="start">
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-text-primary">Duración</h4>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { key: 'short' as const, label: '<20s', color: 'text-blue-500' },
                { key: 'medium' as const, label: '20-40s', color: 'text-blue-500' },
                { key: 'long' as const, label: '>40s', color: 'text-blue-500' }
              ].map(({ key, label, color }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={filters.duration.includes(key)}
                    onCheckedChange={(checked) => updateDuration(key, checked as boolean)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label
                    htmlFor={key}
                    className={cn(
                      "text-sm font-medium leading-none cursor-pointer transition-colors duration-200",
                      filters.duration.includes(key) ? color : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Signals */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-text-primary">Señales fuertes</h4>
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                Detecta patrones
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg hover:border-orange-500/30 transition-all duration-200">
                <Checkbox
                  id="topRetention"
                  checked={filters.signals.topRetention}
                  onCheckedChange={(checked) => updateSignals('topRetention', checked as boolean)}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <label htmlFor="topRetention" className="text-sm font-medium cursor-pointer">
                    Top 10% Retención
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg hover:border-red-500/30 transition-all duration-200">
                <Checkbox
                  id="topSaves"
                  checked={filters.signals.topSaves}
                  onCheckedChange={(checked) => updateSignals('topSaves', checked as boolean)}
                  className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <label htmlFor="topSaves" className="text-sm font-medium cursor-pointer">
                    Top 10% Saves/1k
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg hover:border-purple-500/30 transition-all duration-200">
                <Checkbox
                  id="highForYou"
                  checked={filters.signals.highForYou}
                  onCheckedChange={(checked) => updateSignals('highForYou', checked as boolean)}
                  className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <label htmlFor="highForYou" className="text-sm font-medium cursor-pointer">
                    % For You alto
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg hover:border-blue-500/30 transition-all duration-200">
                <Checkbox
                  id="topF1k"
                  checked={filters.signals.topF1k}
                  onCheckedChange={(checked) => updateSignals('topF1k', checked as boolean)}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <label htmlFor="topF1k" className="text-sm font-medium cursor-pointer">
                    Top 10% F/1k
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-card/30 backdrop-blur-sm border border-border/20 rounded-lg opacity-60">
                <Checkbox
                  id="highVelocity"
                  checked={filters.signals.highVelocity}
                  onCheckedChange={(checked) => updateSignals('highVelocity', checked as boolean)}
                  disabled
                  className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <label htmlFor="highVelocity" className="text-sm font-medium text-text-muted cursor-not-allowed">
                    Velocidad inicial
                  </label>
                  <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                    Próximamente
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Results Count */}
      <div className="flex items-center justify-between text-sm bg-muted/20 rounded-lg px-4 py-2 border border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-text-secondary">
            Mostrando <span className="text-text-primary font-bold">{filteredCount.toLocaleString()}</span> de <span className="text-text-primary font-bold">{totalVideos.toLocaleString()}</span> videos
          </span>
        </div>
        
        {hasActiveFilters && (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
            {getActiveFiltersCount()} filtros activos
          </Badge>
        )}
      </div>
    </div>
  );
};