import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVideos } from '@/hooks/useVideos';
import { Lightbulb, RefreshCw, CheckCircle, Play, ExternalLink } from 'lucide-react';

interface AIInsight {
  type: string;
  analysis: string;
  recommendations: string[];
  confidence: number;
  timestamp: string;
}

interface VideoExample {
  id: string;
  title: string;
  published_date: string;
  engagement_rate: number;
  video_url?: string;
}

interface AIContentSuggestionsProps {
  className?: string;
}

export const AIContentSuggestions = ({ className }: AIContentSuggestionsProps) => {
  const { toast } = useToast();
  const { videos } = useVideos();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-analysis', {
        body: { type: 'content_ideas' }
      });

      if (error) throw error;

      // Structure the analysis to get actionable insights
      const structuredInsights = structureAnalysis(data.analysis, 'content_ideas');
      setInsights([structuredInsights]);

      toast({
        title: "Content insights generated",
        description: "Generated AI-powered content recommendations with examples.",
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate content suggestions. Please try again.",
        variant: "destructive",
      });
      
      // Fallback insights
      setInsights([{
        type: 'content_ideas',
        analysis: 'Based on successful content patterns...',
        recommendations: [
          'Usar hook de pregunta en primeros 3 segundos',
          'Mantener duración entre 15-20 segundos',
          'Incluir CTA clara al final del video'
        ],
        confidence: 85,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const structureAnalysis = (analysis: string, type: string): AIInsight => {
    // Extract recommendations from AI response
    const lines = analysis.split('\n').filter(line => line.trim().length > 0);
    let recommendations: string[] = [];
    
    // Look for bullet points, numbered lists, or recommendations
    lines.forEach(line => {
      const cleaned = line.trim();
      if (cleaned.match(/^[\d\-\*•]/) || 
          cleaned.toLowerCase().includes('recomendación') || 
          cleaned.toLowerCase().includes('usar') ||
          cleaned.toLowerCase().includes('mantener') ||
          cleaned.toLowerCase().includes('incluir')) {
        // Clean up the recommendation text
        const rec = cleaned.replace(/^[\d\-\*•\s]+/, '').trim();
        if (rec.length > 10 && recommendations.length < 3) {
          recommendations.push(rec);
        }
      }
    });

    // Prioritize recommendations with key terms
    const priorityTerms = ['hook', 'duración', 'hora', 'cta', 'segundo'];
    recommendations.sort((a, b) => {
      const aHasPriority = priorityTerms.some(term => a.toLowerCase().includes(term));
      const bHasPriority = priorityTerms.some(term => b.toLowerCase().includes(term));
      if (aHasPriority && !bHasPriority) return -1;
      if (!aHasPriority && bHasPriority) return 1;
      return b.length - a.length; // Prefer longer recommendations
    });

    // Ensure we have exactly 3 recommendations
    if (recommendations.length === 0) {
      recommendations = [
        'Crear contenido basado en tus videos más exitosos',
        'Usar hooks llamativos en los primeros 3 segundos',
        'Optimizar duración según tu audiencia'
      ];
    } else if (recommendations.length > 3) {
      recommendations = recommendations.slice(0, 3);
    } else if (recommendations.length < 3) {
      const fallbacks = [
        'Mantener consistencia en el estilo de contenido',
        'Interactuar activamente con los comentarios',
        'Publicar en horarios de mayor actividad'
      ];
      while (recommendations.length < 3) {
        const fallback = fallbacks[recommendations.length - 1];
        if (fallback) recommendations.push(fallback);
      }
    }

    return {
      type,
      analysis,
      recommendations,
      confidence: 80,
      timestamp: new Date().toISOString()
    };
  };

  const findVideoExamples = (recommendation: string): VideoExample[] => {
    if (!videos || videos.length === 0) return [];

    // Extract keywords from recommendation
    const keywords = recommendation.toLowerCase().split(' ')
      .filter(word => word.length > 3 && !['para', 'con', 'por', 'una', 'del', 'que', 'los', 'las'].includes(word));

    // Find videos that match keywords in title or hook
    const matchingVideos = videos.filter(video => {
      const searchText = `${video.title || ''} ${video.hook || ''}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword));
    });

    // Calculate engagement rate and sort by performance
    const videosWithER = matchingVideos.map(video => {
      const views = video.views || 0;
      const engagement = (video.likes || 0) + (video.comments || 0) + (video.shares || 0);
      const engagement_rate = views > 0 ? (engagement / views) * 100 : 0;

      return {
        id: video.id,
        title: video.title || 'Sin título',
        published_date: video.published_date,
        engagement_rate,
        video_url: video.video_url,
        performance_score: video.performance_score || engagement_rate
      };
    }).sort((a, b) => b.performance_score - a.performance_score);

    return videosWithER.slice(0, 3);
  };


  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            AI Content Ideas
          </CardTitle>
          <Button
            onClick={generateSuggestions}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {loading ? 'Generating...' : 'Generate Ideas'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">Click "Generate Ideas" to get AI-powered content recommendations</p>
            <p className="text-sm text-text-muted mt-1">Based on your best-performing content patterns</p>
          </div>
        ) : (
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <div key={index} className="space-y-4">
                {/* AI Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Recomendaciones
                  </h4>
                  <div className="space-y-2">
                    {insight.recommendations.map((rec, recIndex) => (
                      <div key={recIndex} className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-text-primary">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Examples */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Play className="w-4 h-4 text-purple-400" />
                    Ejemplos
                  </h4>
                  <div className="space-y-3">
                    {insight.recommendations.map((rec, recIndex) => {
                      const examples = findVideoExamples(rec);
                      return (
                        <div key={recIndex} className="bg-muted/10 rounded-lg p-3">
                          <p className="text-xs text-text-muted mb-2">Para: "{rec.substring(0, 50)}..."</p>
                          {examples.length > 0 ? (
                            <div className="space-y-2">
                              {examples.map((example, exIndex) => (
                                <div key={exIndex} className="flex items-center justify-between p-2 bg-card rounded border border-border/50">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-text-primary truncate">
                                      {example.title.length > 40 ? example.title.substring(0, 40) + '...' : example.title}
                                    </h5>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-xs text-text-muted">
                                        {new Date(example.published_date).toLocaleDateString('es-ES')}
                                      </span>
                                      <span className="text-xs text-green-400 font-medium">
                                        {example.engagement_rate.toFixed(1)}% ER
                                      </span>
                                    </div>
                                  </div>
                                  {example.video_url ? (
                                    <button className="ml-2 p-1 text-primary hover:text-primary/80 transition-colors">
                                      <ExternalLink className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <Play className="w-4 h-4 text-text-muted ml-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted italic">
                              Aún no hay ejemplos para este patrón, sube más videos
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Confidence Badge */}
                <div className="flex justify-end">
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% confianza
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};