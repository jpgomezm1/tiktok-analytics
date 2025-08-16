import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, ExternalLink, RefreshCw, BarChart3 } from 'lucide-react';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import { HistoricalData } from '@/hooks/useHistoricalData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
    "¿Qué CTA me trae más seguidores?",
    "¿Qué horario funciona mejor para mis videos?",
    "¿Qué vertical debo priorizar este mes?", 
    "¿Cómo puedo mejorar mi retención promedio?",
    "¿Qué duración de video me genera más F/1k?",
    "¿Cuáles son mis patrones de éxito más claros?"
  ];

  const handleAnalyze = async () => {
    if (!question.trim()) {
      toast({
        title: "Pregunta requerida",
        description: "Por favor escribe una pregunta sobre tu estrategia",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await generateStrategicInsights(question, historicalData || undefined);
      
      if (response.success && response.content) {
        const parsed = JSON.parse(response.content);
        setInsights(parsed);
        
        toast({
          title: "Análisis completado",
          description: "Claude ha analizado tu estrategia",
        });
      } else {
        throw new Error(response.error || 'No se pudo generar el análisis');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
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

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Consulta Estratégica a Claude
          </CardTitle>
          <CardDescription className="text-text-secondary">
            {hasData 
              ? 'Claude analizará tus datos históricos para responder tu pregunta estratégica'
              : 'Claude proporcionará sugerencias generales (conecta tus datos para análisis específicos)'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">Pregunta sobre tu estrategia</Label>
            <Textarea
              id="question"
              placeholder="ej: ¿Qué CTA me trae más seguidores?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* Suggested Questions */}
          <div className="space-y-2">
            <Label className="text-sm text-text-secondary">Preguntas sugeridas:</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuestionClick(q)}
                  className="text-xs"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={loading || !question.trim()}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analizando con Claude...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analizar con AI (Claude)
              </>
            )}
          </Button>

          {!hasData && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-text-secondary">
                <strong>Para análisis más específicos:</strong> Importa tus datos históricos de TikTok para que Claude analice tus patrones reales.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Insights */}
      {insights && (
        <div className="space-y-6">
          {/* Analysis */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-text-primary">Análisis de Claude</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-text-secondary whitespace-pre-wrap">
                  {insights.analysis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-text-primary">Recomendaciones Accionables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Badge className="bg-primary text-primary-foreground mt-0.5">
                      {index + 1}
                    </Badge>
                    <p className="text-sm text-text-secondary flex-1">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Video Examples */}
          {insights.video_examples && insights.video_examples.length > 0 && (
            <Card className="bg-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-text-primary">Videos de Ejemplo</CardTitle>
                <CardDescription className="text-text-secondary">
                  Ejemplos de tu contenido relacionados con el análisis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.video_examples.map((video, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-text-primary mb-2">
                            {video.title}
                          </h4>
                          <p className="text-sm text-text-secondary mb-2">
                            <strong>Por qué es relevante:</strong> {video.reason}
                          </p>
                          <p className="text-xs text-text-muted">
                            <strong>Métricas:</strong> {video.metrics}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => goToVideoDetail(video.title)}
                          className="ml-3 gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Note */}
          {insights.note && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-text-secondary">
                <strong>Nota:</strong> {insights.note}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!insights && !loading && (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Pregunta a Claude sobre tu Estrategia
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              {hasData 
                ? 'Haz preguntas a Claude sobre tu estrategia. Con tus datos cargados, Claude se basará en tus patrones reales para darte insights específicos.'
                : 'Haz preguntas a Claude sobre tu estrategia. Si cargas datos, Claude se basará en tus patrones reales; si no, obtendrás sugerencias generales.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};