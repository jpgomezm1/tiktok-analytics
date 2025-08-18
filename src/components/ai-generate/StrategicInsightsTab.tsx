import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, ExternalLink, RefreshCw, BarChart3, Lightbulb, Target, Zap, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import { HistoricalData } from '@/hooks/useHistoricalData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StrategicInsightsTabProps {
  historicalData: HistoricalData | null;
  hasData: boolean;
}

interface VideoExample {
  title: string;
  reason: string;
  metrics: string;
}

interface GeneratedInsights {
  analysis: string;
  recommendations: string[];
  video_examples?: VideoExample[];
  note?: string;
}

export const StrategicInsightsTab = ({ historicalData, hasData }: StrategicInsightsTabProps) => {
  const [question, setQuestion] = useState('');
  const [insights, setInsights] = useState<GeneratedInsights | null>(null);
  
  const { generateStrategicInsights, loading } = useAIGenerate();
  const { toast } = useToast();
  const navigate = useNavigate();

  const suggestedQuestions = [
    { q: "¿Qué CTA me trae más seguidores?", icon: "👥", category: "engagement" },
    { q: "¿Qué horario funciona mejor para mis videos?", icon: "⏰", category: "timing" },
    { q: "¿Qué vertical debo priorizar este mes?", icon: "📊", category: "strategy" },
    { q: "¿Cómo puedo mejorar mi retención promedio?", icon: "📈", category: "performance" },
    { q: "¿Qué duración de video me genera más F/1k?", icon: "⏱️", category: "format" },
    { q: "¿Cuáles son mis patrones de éxito más claros?", icon: "🎯", category: "analysis" }
  ];

  const handleAnalyze = async () => {
    if (!question.trim()) {
      toast({
        title: "❓ Pregunta requerida",
        description: "Por favor escribe una pregunta sobre tu estrategia",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await generateStrategicInsights(question, historicalData || undefined);
      
      if (response.success && response.content) {
        try {
          // Clean and parse the JSON response
          let cleanedContent = response.content.trim();
          
          // Remove any markdown code block wrappers
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          
          const parsed = JSON.parse(cleanedContent);
          setInsights(parsed);
          
          toast({
            title: "🧠 Análisis completado",
            description: "Claude ha analizado tu estrategia",
          });
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          console.error('Response content:', response.content);
          throw new Error('La respuesta de Claude no tiene el formato correcto');
        }
      } else {
        throw new Error(response.error || 'No se pudo generar el análisis');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "❌ Error",
        description: "No pudimos conectar con AI. Intenta de nuevo en unos minutos.",
        variant: "destructive"
      });
    }
  };

  const handleQuestionClick = (suggestedQuestion: string) => {
    setQuestion(suggestedQuestion);
  };

  const goToVideoDetail = (videoTitle: string) => {
    // Find video by title and navigate to detail
    const video = historicalData?.videos.find(v => v.title === videoTitle);
    if (video) {
      navigate(`/videos/${video.id}`);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'engagement': return 'purple';
      case 'timing': return 'blue';
      case 'strategy': return 'green';
      case 'performance': return 'orange';
      case 'format': return 'pink';
      case 'analysis': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Input Form */}
      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-text-primary">
                Consulta Estratégica a Claude
              </CardTitle>
              <CardDescription className="text-text-secondary">
                {hasData 
                  ? '🧠 Claude analizará tus datos históricos para responder tu pregunta estratégica'
                  : '✨ Claude proporcionará sugerencias generales (conecta tus datos para análisis específicos)'
                }
              </CardDescription>
            </div>
          </div>
          
          {hasData && (
            <div className="bg-gradient-to-r from-success/10 to-green-600/10 rounded-lg p-3 border border-success/20">
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <BarChart3 className="w-4 h-4" />
                TikTok Brain activo - Analizando {historicalData?.metrics?.video_count || 0} videos
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-semibold text-text-primary">
              Pregunta sobre tu estrategia
            </Label>
            <Textarea
              id="question"
              placeholder="ej: ¿Qué CTA me trae más seguidores? ¿Cómo puedo mejorar mi retención? ¿Qué horario funciona mejor?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px] bg-background/60 border-border/60 focus:border-green-500/50 transition-all duration-200 resize-none"
            />
          </div>

          {/* Enhanced Suggested Questions */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Preguntas sugeridas:
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((item, index) => {
                const color = getCategoryColor(item.category);
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleQuestionClick(item.q)}
                    className={cn(
                      "text-left justify-start h-auto p-4 hover:shadow-md transition-all duration-200",
                      `hover:border-${color}-500/30 hover:bg-${color}-500/5`
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium">{item.q}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={loading || !question.trim()}
            className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all duration-200"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Analizando con Claude...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Analizar con AI (Claude)
              </>
            )}
          </Button>

          {!hasData && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-semibold text-yellow-600 mb-1">
                    💡 Para análisis más específicos
                  </p>
                  <p className="text-sm text-text-secondary">
                    Importa tus datos históricos de TikTok para que Claude analice tus patrones reales.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Generated Insights */}
      {insights && (
        <div className="space-y-6">
          {/* Enhanced Analysis */}
          <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-text-primary">
                  Análisis de Claude
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-6 shadow-sm">
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                  {insights.analysis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Recommendations */}
          <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-text-primary">
                  Recomendaciones Accionables
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 shadow-md">
                        {index + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-primary flex-1 leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Video Examples */}
          {insights.video_examples && insights.video_examples.length > 0 && (
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Videos de Ejemplo
                    </CardTitle>
                    <CardDescription className="text-text-secondary">
                      Ejemplos de tu contenido relacionados con el análisis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.video_examples.map((video, index) => (
                    <div 
                      key={index} 
                      className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <h4 className="font-semibold text-text-primary group-hover:text-purple-light transition-colors duration-200">
                            {video.title}
                          </h4>
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                            <p className="text-sm text-text-secondary">
                              <span className="font-semibold text-purple-600">💡 Por qué es relevante:</span><br />
                              {video.reason}
                            </p>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-sm text-text-secondary">
                              <span className="font-semibold text-blue-600">📊 Métricas:</span><br />
                              {video.metrics}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToVideoDetail(video.title)}
                          className="gap-2 hover:border-purple-500/30 hover:text-purple-500 transition-all duration-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver video
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced General Note */}
          {insights.note && (
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-blue-600 mb-1">
                    📝 Nota de Claude
                  </p>
                  <p className="text-sm text-text-secondary">
                    {insights.note}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Empty State */}
      {!insights && !loading && (
        <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-muted/10">
          <CardContent className="py-16 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-bright/20 to-green-dark/10 rounded-2xl flex items-center justify-center mx-auto">
                <Brain className="w-10 h-10 text-green-light" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-text-primary">
                Pregunta a Claude sobre tu Estrategia
              </h3>
              <p className="text-text-secondary max-w-lg mx-auto leading-relaxed">
                {hasData 
                  ? 'Haz preguntas a Claude sobre tu estrategia. Con tus datos cargados, Claude se basará en tus patrones reales para darte insights específicos.'
                  : 'Haz preguntas a Claude sobre tu estrategia. Si cargas datos, Claude se basará en tus patrones reales; si no, obtendrás sugerencias generales.'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto text-sm">
              <div className="flex flex-col items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-400">Análisis Profundo</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-400">Recomendaciones</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-purple-400">Ejemplos Reales</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};