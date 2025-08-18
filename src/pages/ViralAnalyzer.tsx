import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Copy, TrendingUp, AlertTriangle, Users, Eye, Heart, Brain, Sparkles, Target, Zap, BarChart3, CheckCircle } from 'lucide-react';
import { useViralAnalyzer, type ViralAnalysisParams } from '@/hooks/useViralAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ViralAnalyzer() {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'hook' | 'guion' | 'cta'>('hook');
  const { loading, analysis, analyzeContent } = useViralAnalyzer();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    const params: ViralAnalysisParams = {
      content: content.trim(),
      content_type: contentType
    };

    await analyzeContent(params);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const formatPercentage = (value: number) => Math.round(value * 100);

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'hook': return '🎯';
      case 'guion': return '📝';
      case 'cta': return '✨';
      default: return '💡';
    }
  };

  const getViralScore = () => {
    if (!analysis) return 0;
    const { probabilities } = analysis.analysis;
    return Math.round((probabilities.P_top10_views + probabilities.P_saves_p90 + probabilities.P_follow_p90) / 3 * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  const getVariantIcon = (version: string) => {
    switch (version) {
      case 'clickbait': return '🎣';
      case 'benefit_led': return '💎';
      case 'contrarian': return '🔄';
      default: return '💡';
    }
  };

  const getVariantColor = (version: string) => {
    switch (version) {
      case 'clickbait': return 'red';
      case 'benefit_led': return 'blue';
      case 'contrarian': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-red-light bg-clip-text">
                Analizador de Potencial Viral
              </h1>
              <p className="text-lg text-text-secondary">
                IA + datos históricos para predecir el éxito
              </p>
            </div>
          </div>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Analiza el potencial viral de tu contenido usando machine learning entrenado con miles de videos exitosos
          </p>
        </div>

        {/* Enhanced Input Section */}
        <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-text-primary">
                  Contenido a Analizar
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Ingresa el hook, guión o CTA que quieres analizar con IA
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-text-primary">Tipo de Contenido</label>
                <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                  <SelectTrigger className="bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hook">🎯 Hook (Gancho)</SelectItem>
                    <SelectItem value="guion">📝 Guión</SelectItem>
                    <SelectItem value="cta">✨ Call to Action</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-semibold text-text-primary">
                  Contenido {getContentTypeIcon(contentType)}
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Escribe tu ${contentType} aquí... Ejemplo: "¿Sabías que puedes automatizar el 80% de tu trabajo con IA?"`}
                  rows={4}
                  className="bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            <Button 
              onClick={handleAnalyze}
              disabled={loading || !content.trim()}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Brain className="h-5 w-5 mr-2 animate-pulse" />
                  Analizando con IA...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Analizar Potencial Viral
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Enhanced Viral Score */}
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-text-primary">
                        Score de Viralidad
                      </CardTitle>
                      <CardDescription>
                        Predicción basada en análisis de IA
                      </CardDescription>
                    </div>
                  </div>
                  {analysis.guardrail_adjusted && (
                    <Badge className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600">
                      ⚠️ Contenido ajustado por guardrails
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className={cn(
                      "text-6xl font-bold mb-2",
                      getScoreColor(getViralScore()) === 'green' && "text-green-500",
                      getScoreColor(getViralScore()) === 'yellow' && "text-yellow-500",
                      getScoreColor(getViralScore()) === 'red' && "text-red-500"
                    )}>
                      {getViralScore()}%
                    </div>
                    <div className="text-sm text-text-muted">Potencial Viral</div>
                  </div>
                  <div className={cn(
                    "w-full h-3 rounded-full overflow-hidden",
                    getScoreColor(getViralScore()) === 'green' && "bg-green-500/20",
                    getScoreColor(getViralScore()) === 'yellow' && "bg-yellow-500/20",
                    getScoreColor(getViralScore()) === 'red' && "bg-red-500/20"
                  )}>
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        getScoreColor(getViralScore()) === 'green' && "bg-gradient-to-r from-green-500 to-emerald-500",
                        getScoreColor(getViralScore()) === 'yellow' && "bg-gradient-to-r from-yellow-500 to-orange-500",
                        getScoreColor(getViralScore()) === 'red' && "bg-gradient-to-r from-red-500 to-red-600"
                      )}
                      style={{ width: `${getViralScore()}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Probabilities */}
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-text-primary">
                    Probabilidades de Éxito
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-semibold text-text-primary">Top 10% Views</span>
                      </div>
                      <span className="text-xl font-bold text-blue-500">
                        {formatPercentage(analysis.analysis.probabilities.P_top10_views)}%
                      </span>
                    </div>
                    <Progress 
                      value={analysis.analysis.probabilities.P_top10_views * 100} 
                      className="h-3"
                    />
                    <p className="text-xs text-text-muted">
                      Probabilidad de estar en el top 10% de videos más vistos
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-semibold text-text-primary">P90 Saves</span>
                      </div>
                      <span className="text-xl font-bold text-purple-500">
                        {formatPercentage(analysis.analysis.probabilities.P_saves_p90)}%
                      </span>
                    </div>
                    <Progress 
                      value={analysis.analysis.probabilities.P_saves_p90 * 100} 
                      className="h-3"
                    />
                    <p className="text-xs text-text-muted">
                      Probabilidad de alcanzar percentil 90 en saves
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-semibold text-text-primary">P90 Follows</span>
                      </div>
                      <span className="text-xl font-bold text-green-500">
                        {formatPercentage(analysis.analysis.probabilities.P_follow_p90)}%
                      </span>
                    </div>
                    <Progress 
                      value={analysis.analysis.probabilities.P_follow_p90 * 100} 
                      className="h-3"
                    />
                    <p className="text-xs text-text-muted">
                      Probabilidad de alcanzar percentil 90 en follows
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Analysis Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-green-600">
                      Aspectos Positivos
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.analysis.positives.map((positive, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-text-primary leading-relaxed">{positive}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-md">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-amber-600">
                      Riesgos Identificados
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.analysis.risks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-text-primary leading-relaxed">{risk}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Variants */}
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Variantes Sugeridas
                    </CardTitle>
                    <CardDescription>
                      Diferentes enfoques basados en tu contenido original
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.variants.map((variant, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30 space-y-3 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getVariantIcon(variant.version)}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={cn(
                              "text-xs font-semibold px-3 py-1",
                              getVariantColor(variant.version) === 'red' && "bg-gradient-to-r from-red-500 to-red-600 text-white",
                              getVariantColor(variant.version) === 'blue' && "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
                              getVariantColor(variant.version) === 'purple' && "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                            )}
                          >
                            {variant.version === 'clickbait' ? 'Clickbait' :
                             variant.version === 'benefit_led' ? 'Basado en Beneficios' : 'Contrario'}
                          </Badge>
                          <Badge 
                            variant={variant.recommended === 'exploit' ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {variant.recommended === 'exploit' ? '🎯 Exploit' : '🔬 Explore'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(variant.text)}
                        className="hover:border-purple-500/30 hover:text-purple-500 transition-all duration-200"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-background/60 p-3 rounded-lg border border-border/30">
                      <p className="text-sm font-medium text-text-primary leading-relaxed">{variant.text}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-text-secondary leading-relaxed">
                        <span className="font-semibold text-blue-600">💡 Por qué esta variante:</span><br />
                        {variant.why_variant}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Enhanced Similar Content */}
            {analysis.analysis.neighbors_used.length > 0 && (
              <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-text-primary">
                        Contenido Similar Exitoso
                      </CardTitle>
                      <CardDescription>
                        Ejemplos históricos usados para el análisis de IA
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.analysis.neighbors_used.map((neighbor, index) => (
                    <div 
                      key={index} 
                      className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30 space-y-3"
                    >
                      <p className="text-sm font-medium text-text-primary leading-relaxed">
                        "{neighbor.content}"
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <div className="text-sm font-bold text-purple-400">💾 {neighbor.metrics.saves_per_1k.toFixed(1)}</div>
                          <div className="text-xs text-text-muted">Saves/1k</div>
                        </div>
                        <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="text-sm font-bold text-green-400">👥 {neighbor.metrics.f_per_1k.toFixed(1)}</div>
                          <div className="text-xs text-text-muted">Follows/1k</div>
                        </div>
                        <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="text-sm font-bold text-blue-400">⏱️ {neighbor.metrics.retention_pct.toFixed(1)}%</div>
                          <div className="text-xs text-text-muted">Retención</div>
                        </div>
                        <div className="text-center p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          <div className="text-sm font-bold text-orange-400">👁️ {neighbor.metrics.views.toLocaleString()}</div>
                          <div className="text-xs text-text-muted">Views</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Enhanced Empty State */}
        {!analysis && !loading && (
          <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-muted/10">
            <CardContent className="py-16 text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-bright/20 to-red-dark/10 rounded-2xl flex items-center justify-center mx-auto">
                  <TrendingUp className="w-10 h-10 text-red-light" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-text-primary">
                  Analiza tu Potencial Viral
                </h3>
                <p className="text-text-secondary max-w-lg mx-auto leading-relaxed">
                  Ingresa tu contenido y descubre qué tan viral puede ser usando análisis de IA entrenado con miles de videos exitosos
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                <div className="flex flex-col items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <Brain className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Análisis con IA</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-blue-400">Predicciones</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-purple-400">Variantes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}