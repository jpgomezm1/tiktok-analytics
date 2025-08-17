import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, TrendingUp, Clock, Eye, Heart, Share, Users, Lightbulb, Target, Zap } from 'lucide-react';
import { useAdvancedBrainSearch, type BrainSearchParams, type BrainSearchResult } from '@/hooks/useAdvancedBrainSearch';
import { useToast } from '@/hooks/use-toast';

// Utility functions
const getScoreColor = (score: number) => {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-gray-600';
};

const getPerformanceBadgeColor = (zScore: number) => {
  if (zScore > 1.5) return 'bg-green-100 text-green-800';
  if (zScore > 0.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

const formatMetric = (value: number, decimals = 1) => {
  return value?.toFixed(decimals) || '0';
};

export default function BrainSearchEngine() {
  const { loading, results, searchBrain, clearResults } = useAdvancedBrainSearch();
  const { toast } = useToast();
  
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<BrainSearchParams['filters']>({});
  const [activeTab, setActiveTab] = useState('search');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una consulta de búsqueda",
        variant: "destructive"
      });
      return;
    }

    const searchParams: BrainSearchParams = {
      query: query.trim(),
      topK: 20,
      filters,
      language: 'es',
      diversityBoost: true
    };

    await searchBrain(searchParams);
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Search className="h-8 w-8 text-primary" />
          TikTok Brain Search Engine
        </h1>
        <p className="text-muted-foreground">
          Motor de búsqueda avanzado y explicable para encontrar contenido viral relevante
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Búsqueda Inteligente
              </CardTitle>
              <CardDescription>
                Usa lenguaje natural para encontrar contenido viral
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: hooks cortos sobre emprendimiento que generen muchos seguidores últimos 30 días"
                  className="h-20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <div className="text-xs text-muted-foreground">
                  Ejemplos: "storytelling viral", "hooks cortos últimos 30 días", "CTAs que generan follows"
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch} 
                  disabled={loading || !query.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Filtros Avanzados</h4>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Limpiar
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium">Fecha desde</label>
                      <Input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Fecha hasta</label>
                      <Input
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Tipo de contenido</label>
                    <Select
                      value={filters.contentTypes?.[0] || ''}
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        contentTypes: value ? [value] : undefined 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los tipos</SelectItem>
                        <SelectItem value="hook">Hooks</SelectItem>
                        <SelectItem value="guion">Guiones</SelectItem>
                        <SelectItem value="cta">CTAs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Estilo de edición</label>
                    <Select
                      value={filters.editing_style || ''}
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        editing_style: value || undefined 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estilos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los estilos</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                        <SelectItem value="walk & talk">Walk & Talk</SelectItem>
                        <SelectItem value="text overlay">Text Overlay</SelectItem>
                        <SelectItem value="talking head">Talking Head</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Mínimo de vistas</label>
                    <Input
                      type="number"
                      placeholder="Ej: 10000"
                      value={filters.minViews || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        minViews: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>
              )}

              {results && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {results.total_results} resultados en {results.search_time_ms}ms
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearResults}>
                      Limpiar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {results ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Resultados ({results.results.length})
                </TabsTrigger>
                <TabsTrigger value="facets" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Análisis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
                {results.results.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Sin resultados</h3>
                      <p className="text-muted-foreground">
                        No se encontraron contenidos que coincidan con tu búsqueda.
                        Intenta con términos diferentes o ajusta los filtros.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  results.results.map((result, index) => (
                    <ResultCard key={`${result.video_id}-${result.section_tag}`} result={result} rank={index + 1} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="facets" className="space-y-6">
                <FacetsAnalysis facets={results.facets} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Busca en tu TikTok Brain</h3>
                <p className="text-muted-foreground mb-6">
                  Usa el panel de la izquierda para buscar contenido viral relevante usando lenguaje natural.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    Búsqueda semántica bilingüe
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Reranking por métricas
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lightbulb className="h-4 w-4" />
                    Explicaciones automáticas
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Diversidad garantizada
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, rank }: { result: BrainSearchResult; rank: number }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">#{rank}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{result.section_tag}</Badge>
                {result.video_theme && (
                  <Badge variant="secondary">{result.video_theme}</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatMetric(result.metrics.views, 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {result.metrics.duration_seconds}s
                </span>
                <span>{new Date(result.metrics.published_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getScoreColor(result.score.final_score)}`}>
              {formatMetric(result.score.final_score)}
            </div>
            <div className="text-xs text-muted-foreground">Score final</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm leading-relaxed">{result.content}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {formatMetric(result.metrics.retention_pct)}%
            </div>
            <div className="text-xs text-muted-foreground">Retención</div>
            {result.score.z_ret > 0 && (
              <Badge className={getPerformanceBadgeColor(result.score.z_ret)}>
                +{formatMetric(result.score.z_ret)}σ
              </Badge>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {formatMetric(result.metrics.saves_per_1k)}
            </div>
            <div className="text-xs text-muted-foreground">Saves/1k</div>
            {result.score.z_saves > 0 && (
              <Badge className={getPerformanceBadgeColor(result.score.z_saves)}>
                +{formatMetric(result.score.z_saves)}σ
              </Badge>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {formatMetric(result.metrics.f_per_1k)}
            </div>
            <div className="text-xs text-muted-foreground">Follows/1k</div>
            {result.score.z_follows > 0 && (
              <Badge className={getPerformanceBadgeColor(result.score.z_follows)}>
                +{formatMetric(result.score.z_follows)}σ
              </Badge>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {formatMetric(result.metrics.for_you_pct)}%
            </div>
            <div className="text-xs text-muted-foreground">FYP %</div>
            {result.score.z_fyp > 0 && (
              <Badge className={getPerformanceBadgeColor(result.score.z_fyp)}>
                +{formatMetric(result.score.z_fyp)}σ
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{result.why_this}</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Similitud:</span>
          <Progress value={result.score.sim_final * 100} className="h-2 flex-1" />
          <span className="text-muted-foreground">{formatMetric(result.score.sim_final * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

function FacetsAnalysis({ facets }: { facets: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Temas Principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {facets.video_themes.map((theme: any, index: number) => (
              <div key={theme.value} className="flex items-center justify-between">
                <span className="text-sm">{theme.value}</span>
                <div className="flex items-center gap-2">
                  <Progress value={theme.percentage} className="h-2 w-20" />
                  <span className="text-xs text-muted-foreground">{theme.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tipos de CTA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {facets.cta_types.map((cta: any) => (
              <div key={cta.value} className="flex items-center justify-between">
                <span className="text-sm capitalize">{cta.value}</span>
                <div className="flex items-center gap-2">
                  <Progress value={cta.percentage} className="h-2 w-20" />
                  <span className="text-xs text-muted-foreground">{cta.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Duración de Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {facets.duration_buckets.map((bucket: any) => (
              <div key={bucket.range} className="flex items-center justify-between">
                <span className="text-sm">{bucket.range}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {bucket.count} videos
                  </span>
                  <Badge variant="outline">
                    {formatMetric(bucket.avg_performance)} perf avg
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Percentiles de Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Retención</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">P50</div>
                  <div>{formatMetric(facets.metrics_percentiles.retention_pct.p50)}%</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">P75</div>
                  <div>{formatMetric(facets.metrics_percentiles.retention_pct.p75)}%</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">P90</div>
                  <div>{formatMetric(facets.metrics_percentiles.retention_pct.p90)}%</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Saves per 1K</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">P50</div>
                  <div>{formatMetric(facets.metrics_percentiles.saves_per_1k.p50)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">P75</div>
                  <div>{formatMetric(facets.metrics_percentiles.saves_per_1k.p75)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">P90</div>
                  <div>{formatMetric(facets.metrics_percentiles.saves_per_1k.p90)}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Follows per 1K</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">P50</div>
                  <div>{formatMetric(facets.metrics_percentiles.f_per_1k.p50)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">P75</div>
                  <div>{formatMetric(facets.metrics_percentiles.f_per_1k.p75)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">P90</div>
                  <div>{formatMetric(facets.metrics_percentiles.f_per_1k.p90)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}