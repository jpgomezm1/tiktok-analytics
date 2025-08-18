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
import { Search, Filter, TrendingUp, Clock, Eye, Heart, Share, Users, Lightbulb, Target, Zap, Brain, Sparkles, BarChart3 } from 'lucide-react';
import { useAdvancedBrainSearch, type BrainSearchParams, type BrainSearchResult } from '@/hooks/useAdvancedBrainSearch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Utility functions
const getScoreColor = (score: number) => {
  if (score >= 0.8) return 'text-green-500';
  if (score >= 0.6) return 'text-yellow-500';
  if (score >= 0.4) return 'text-orange-500';
  return 'text-red-500';
};

const getScoreGradient = (score: number) => {
  if (score >= 0.8) return 'from-green-500 to-emerald-500';
  if (score >= 0.6) return 'from-yellow-500 to-orange-500';
  if (score >= 0.4) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-red-600';
};

const getPerformanceBadgeColor = (zScore: number) => {
  if (zScore > 1.5) return 'bg-green-100 text-green-800 border-green-200';
  if (zScore > 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-bright to-purple-dark rounded-2xl shadow-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
              TikTok Brain Search Engine
            </h1>
          </div>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Motor de búsqueda avanzado y explicable para encontrar contenido viral relevante usando IA semántica
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-bright" />
              <span>Búsqueda semántica</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Reranking inteligente</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Explicaciones automáticas</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Search Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-text-primary">
                      Búsqueda Inteligente
                    </CardTitle>
                    <CardDescription className="text-text-secondary">
                      Usa lenguaje natural para encontrar contenido viral
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: hooks cortos sobre emprendimiento que generen muchos seguidores últimos 30 días"
                    className="h-24 bg-background/60 backdrop-blur-sm border-border/60 focus:border-purple-bright/50 transition-all duration-200 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                    <p className="text-xs text-text-muted leading-relaxed">
                      <span className="font-medium text-purple-light">Ejemplos:</span><br />
                      • "storytelling viral últimos 30 días"<br />
                      • "hooks cortos que generan follows"<br />
                      • "CTAs efectivos para engagement"
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSearch} 
                    disabled={loading || !query.trim()}
                    className="flex-1 bg-gradient-primary hover:opacity-90 shadow-lg transition-all duration-200"
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
                    className="hover:border-purple-bright/30 transition-all duration-200"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Enhanced Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="space-y-4 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <Filter className="h-4 w-4 text-purple-bright" />
                        Filtros Avanzados
                      </h4>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-text-muted hover:text-red-500">
                        Limpiar
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-secondary">Fecha desde</label>
                        <Input
                          type="date"
                          value={filters.dateFrom || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                          className="bg-background/60 border-border/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-secondary">Fecha hasta</label>
                        <Input
                          type="date"
                          value={filters.dateTo || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                          className="bg-background/60 border-border/60"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Tipo de contenido</label>
                      <Select
                        value={filters.contentTypes?.[0] || ''}
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          contentTypes: value ? [value] : undefined 
                        }))}
                      >
                        <SelectTrigger className="bg-background/60 border-border/60">
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

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Estilo de edición</label>
                      <Select
                        value={filters.editing_style || ''}
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          editing_style: value || undefined 
                        }))}
                      >
                        <SelectTrigger className="bg-background/60 border-border/60">
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

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Mínimo de vistas</label>
                      <Input
                        type="number"
                        placeholder="Ej: 10000"
                        value={filters.minViews || ''}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          minViews: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        className="bg-background/60 border-border/60"
                      />
                    </div>
                  </div>
                )}

                {results && (
                  <div className="space-y-3">
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                          <span className="font-medium text-success">
                            {results.total_results} resultados
                          </span>
                        </div>
                        <div className="text-text-muted">
                          {results.search_time_ms}ms
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearResults} className="w-full text-text-muted hover:text-red-500">
                      Limpiar resultados
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Results Panel */}
          <div className="lg:col-span-2">
            {results ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm">
                  <TabsTrigger value="search" className="flex items-center gap-2 data-[state=active]:bg-card">
                    <Lightbulb className="h-4 w-4" />
                    Resultados ({results.results.length})
                  </TabsTrigger>
                  <TabsTrigger value="facets" className="flex items-center gap-2 data-[state=active]:bg-card">
                    <BarChart3 className="h-4 w-4" />
                    Análisis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-6 mt-6">
                  {results.results.length === 0 ? (
                    <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-lg">
                      <CardContent className="py-16 text-center space-y-4">
                        <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto">
                          <Search className="h-10 h-10 text-text-muted" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-text-primary mb-2">Sin resultados</h3>
                          <p className="text-text-secondary max-w-md mx-auto">
                            No se encontraron contenidos que coincidan con tu búsqueda.
                            Intenta con términos diferentes o ajusta los filtros.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    results.results.map((result, index) => (
                      <div key={`${result.video_id}-${result.section_tag}`} style={{ animationDelay: `${index * 100}ms` }}>
                        <ResultCard result={result} rank={index + 1} />
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="facets" className="space-y-6 mt-6">
                  <FacetsAnalysis facets={results.facets} />
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
                <CardContent className="py-20 text-center space-y-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-bright/20 to-purple-dark/10 rounded-3xl flex items-center justify-center mx-auto">
                      <Brain className="h-12 w-12 text-purple-light" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-text-primary">Busca en tu TikTok Brain</h3>
                    <p className="text-text-secondary max-w-lg mx-auto leading-relaxed">
                      Usa el panel de la izquierda para buscar contenido viral relevante usando lenguaje natural.
                      Nuestro motor de IA encuentra patrones ocultos en tu contenido.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <Zap className="h-6 w-6 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">Búsqueda semántica</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <Target className="h-6 w-6 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400">Reranking inteligente</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                      <Lightbulb className="h-6 w-6 text-yellow-500" />
                      <span className="text-xs font-medium text-yellow-600">Explicaciones automáticas</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                      <span className="text-xs font-medium text-green-500">Diversidad garantizada</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, rank }: { result: BrainSearchResult; rank: number }) {
  return (
    <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg hover:shadow-2xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-sm font-bold text-white">#{rank}</span>
              </div>
              {rank <= 3 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">🏆</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                  {result.section_tag}
                </Badge>
                {result.video_theme && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                    {result.video_theme}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">{formatMetric(result.metrics.views, 0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span>{result.metrics.duration_seconds}s</span>
                </div>
                <span>{new Date(result.metrics.published_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <div className={cn("text-2xl font-bold", getScoreColor(result.score.final_score))}>
              {formatMetric(result.score.final_score)}
            </div>
            <div className="text-xs text-text-muted">Score final</div>
            <div className={cn("w-16 h-2 rounded-full bg-gradient-to-r", getScoreGradient(result.score.final_score))}></div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30">
          <p className="text-sm leading-relaxed text-text-primary">{result.content}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-xl font-bold text-green-500">
              {formatMetric(result.metrics.retention_pct)}%
            </div>
            <div className="text-xs text-text-muted mb-2">Retención</div>
            {result.score.z_ret > 0 && (
              <Badge className={getPerformanceBadgeColor(result.score.z_ret)}>
                +{formatMetric(result.score.z_ret)}σ
              </Badge>
            )}
          </div>
          
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-xl font-bold text-blue-500">
              {formatMetric(result.metrics.saves_per_1k)}
            </div>
            <div className="text-xs text-text-muted mb-2">Saves/1k</div>
            {result.score.z_saves > 0 && (
              <Badge className={getPerformanceBadgeColor(result.score.z_saves)}>
                +{formatMetric(result.score.z_saves)}σ
              </Badge>
            )}
          </div>
          
          <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="text-xl font-bold text-purple-500">
              {formatMetric(result.metrics.f_per_1k)}
            </div>
            <div className="text-xs text-text-muted mb-2">Follows/1k</div>
            {result.score.z_follows > 0 && (
              <Badge className={getPerformanceBadgeColor(result.score.z_follows)}>
                +{formatMetric(result.score.z_follows)}σ
              </Badge>
            )}
          </div>
          
          <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="text-xl font-bold text-orange-500">
              {formatMetric(result.metrics.for_you_pct)}%
            </div>
            <div className="text-xs text-text-muted mb-2">FYP %</div>
            {result.score.z_fyp > 0 && (
              <Badge className={getPerformanceBadgeColor(result.score.z_fyp)}>
                +{formatMetric(result.score.z_fyp)}σ
              </Badge>
            )}
          </div>
        </div>

        <Separator className="border-border/30" />

        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 mt-0.5 text-yellow-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-600 mb-1">¿Por qué este resultado?</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{result.why_this}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-secondary">Similitud:</span>
          <div className="flex-1 bg-muted/30 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-bright to-blue-500 transition-all duration-500"
              style={{ width: `${result.score.sim_final * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-purple-light">{formatMetric(result.score.sim_final * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

function FacetsAnalysis({ facets }: { facets: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-text-primary">Temas Principales</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facets.video_themes.map((theme: any, index: number) => (
              <div key={theme.value} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
                <span className="text-sm font-medium text-text-primary">{theme.value}</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-muted/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-bright to-blue-500"
                      style={{ width: `${theme.percentage}%` }}
                    ></div>
                  </div>
                  <Badge variant="outline" className="text-xs">{theme.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Users className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-text-primary">Tipos de CTA</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facets.cta_types.map((cta: any) => (
              <div key={cta.value} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
                <span className="text-sm font-medium text-text-primary capitalize">{cta.value}</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-muted/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${cta.percentage}%` }}
                    ></div>
                  </div>
                  <Badge variant="outline" className="text-xs">{cta.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg">
      <CardHeader>
         <div className="flex items-center gap-3">
           <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
             <Clock className="h-5 w-5 text-white" />
           </div>
           <CardTitle className="text-lg font-bold text-text-primary">Duración de Videos</CardTitle>
         </div>
       </CardHeader>
       <CardContent>
         <div className="space-y-4">
           {facets.duration_buckets.map((bucket: any) => (
             <div key={bucket.range} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
               <span className="text-sm font-medium text-text-primary">{bucket.range}</span>
               <div className="flex items-center gap-3">
                 <div className="text-right">
                   <div className="text-xs text-text-muted">
                     {bucket.count} videos
                   </div>
                   <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/30">
                     {formatMetric(bucket.avg_performance)} perf avg
                   </Badge>
                 </div>
               </div>
             </div>
           ))}
         </div>
       </CardContent>
     </Card>

     <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg">
       <CardHeader>
         <div className="flex items-center gap-3">
           <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
             <Target className="h-5 w-5 text-white" />
           </div>
           <CardTitle className="text-lg font-bold text-text-primary">Percentiles de Métricas</CardTitle>
         </div>
       </CardHeader>
       <CardContent>
         <div className="space-y-6">
           <div className="space-y-3">
             <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
               Retención
             </div>
             <div className="grid grid-cols-3 gap-3">
               <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                 <div className="text-xs font-medium text-green-600 mb-1">P50</div>
                 <div className="font-bold text-green-500">{formatMetric(facets.metrics_percentiles.retention_pct.p50)}%</div>
               </div>
               <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                 <div className="text-xs font-medium text-green-600 mb-1">P75</div>
                 <div className="font-bold text-green-500">{formatMetric(facets.metrics_percentiles.retention_pct.p75)}%</div>
               </div>
               <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                 <div className="text-xs font-medium text-green-600 mb-1">P90</div>
                 <div className="font-bold text-green-500">{formatMetric(facets.metrics_percentiles.retention_pct.p90)}%</div>
               </div>
             </div>
           </div>

           <div className="space-y-3">
             <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
               <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
               Saves per 1K
             </div>
             <div className="grid grid-cols-3 gap-3">
               <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                 <div className="text-xs font-medium text-blue-600 mb-1">P50</div>
                 <div className="font-bold text-blue-500">{formatMetric(facets.metrics_percentiles.saves_per_1k.p50)}</div>
               </div>
               <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                 <div className="text-xs font-medium text-blue-600 mb-1">P75</div>
                 <div className="font-bold text-blue-500">{formatMetric(facets.metrics_percentiles.saves_per_1k.p75)}</div>
               </div>
               <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                 <div className="text-xs font-medium text-blue-600 mb-1">P90</div>
                 <div className="font-bold text-blue-500">{formatMetric(facets.metrics_percentiles.saves_per_1k.p90)}</div>
               </div>
             </div>
           </div>

           <div className="space-y-3">
             <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
               <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
               Follows per 1K
             </div>
             <div className="grid grid-cols-3 gap-3">
               <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                 <div className="text-xs font-medium text-purple-600 mb-1">P50</div>
                 <div className="font-bold text-purple-500">{formatMetric(facets.metrics_percentiles.f_per_1k.p50)}</div>
               </div>
               <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                 <div className="text-xs font-medium text-purple-600 mb-1">P75</div>
                 <div className="font-bold text-purple-500">{formatMetric(facets.metrics_percentiles.f_per_1k.p75)}</div>
               </div>
               <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                 <div className="text-xs font-medium text-purple-600 mb-1">P90</div>
                 <div className="font-bold text-purple-500">{formatMetric(facets.metrics_percentiles.f_per_1k.p90)}</div>
               </div>
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   </div>
 );
}