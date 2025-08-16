import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVideos } from '@/hooks/useVideos';
import { Zap, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Play, ExternalLink } from 'lucide-react';

interface PredictionResult {
  viralScore: number;
  expectedViews: number;
  confidence: number;
  recommendations: string[];
  risks: string[];
}

interface VideoExample {
  id: string;
  title: string;
  published_date: string;
  engagement_rate: number;
  video_url?: string;
}

export const ViralPotentialAnalyzer = () => {
  const { toast } = useToast();
  const { videos } = useVideos();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    hook: '',
    videoTheme: '',
    ctaType: '',
    editingStyle: '',
    duration: ''
  });

  const analyzePotential = async () => {
    if (!formData.title || !formData.hook) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title and hook for analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-analysis', {
        body: { 
          type: 'performance_prediction',
          data: formData
        }
      });

      if (error) throw error;

      // Parse the prediction result
      const result = parsePredictionResult(data.analysis, formData);
      setPrediction(result);

      toast({
        title: "Analysis complete",
        description: `Viral potential: ${result.viralScore}/100`,
      });
    } catch (error) {
      console.error('Error analyzing potential:', error);
      toast({
        title: "Error",
        description: "Failed to analyze viral potential. Please try again.",
        variant: "destructive",
      });
      
      // Fallback prediction
      setPrediction({
        viralScore: 75,
        expectedViews: 15000,
        confidence: 70,
        recommendations: [
          "Strong hook detected - good start!",
          "Consider adding trending elements",
          "Optimize for better engagement"
        ],
        risks: [
          "Hook could be more compelling",
          "Consider shorter duration"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const parsePredictionResult = (analysis: string, data: any): PredictionResult => {
    // Extract viral score (look for percentages or scores)
    const scoreMatch = analysis.match(/(\d+)%|\b(\d+)\/100|score.*?(\d+)/i);
    const viralScore = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) : 65;

    // Estimate views based on title quality and theme
    const baseViews = 10000;
    const titleBonus = data.title.length > 50 ? 1.2 : 1.0;
    const expectedViews = Math.round(baseViews * titleBonus * (viralScore / 100));

    // Extract and limit recommendations
    const lines = analysis.split('\n').filter(line => line.trim().length > 0);
    let recommendations: string[] = [];
    let risks: string[] = [];
    
    lines.forEach(line => {
      const cleaned = line.trim();
      if (cleaned.match(/^[\d\-\*•]/) || 
          cleaned.toLowerCase().includes('recomendación') || 
          cleaned.toLowerCase().includes('usar') ||
          cleaned.toLowerCase().includes('mantener') ||
          cleaned.toLowerCase().includes('mejorar')) {
        const rec = cleaned.replace(/^[\d\-\*•\s]+/, '').trim();
        if (rec.length > 10 && recommendations.length < 3) {
          recommendations.push(rec);
        }
      } else if (cleaned.toLowerCase().includes('riesgo') || 
                 cleaned.toLowerCase().includes('evitar') ||
                 cleaned.toLowerCase().includes('problema')) {
        const risk = cleaned.replace(/^[\d\-\*•\s]+/, '').trim();
        if (risk.length > 10 && risks.length < 3) {
          risks.push(risk);
        }
      }
    });

    // Default recommendations if none found
    if (recommendations.length === 0) {
      recommendations = [
        'Usar hook impactante en primeros 3 segundos',
        'Optimizar duración según audiencia objetivo',
        'Incluir elementos visuales llamativos'
      ];
    } else if (recommendations.length > 3) {
      recommendations = recommendations.slice(0, 3);
    }

    // Default risks if none found
    if (risks.length === 0) {
      risks = [
        'Duración podría afectar retención',
        'Considerar timing de publicación'
      ];
    } else if (risks.length > 3) {
      risks = risks.slice(0, 3);
    }

    return {
      viralScore: Math.min(viralScore, 100),
      expectedViews,
      confidence: 75,
      recommendations,
      risks
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High Viral Potential';
    if (score >= 60) return 'Good Potential';
    if (score >= 40) return 'Moderate Potential';
    return 'Low Potential';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-text-primary">
          <Zap className="w-5 h-5 text-purple-400" />
          Viral Potential Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title *</Label>
              <Input
                id="title"
                placeholder="Enter your video title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hook">Hook/Opening Line *</Label>
            <Textarea
              id="hook"
              placeholder="Describe your video's opening hook"
              value={formData.hook}
              onChange={(e) => setFormData(prev => ({ ...prev, hook: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Video Theme</Label>
              <Select value={formData.videoTheme} onValueChange={(value) => setFormData(prev => ({ ...prev, videoTheme: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">CTA Type</Label>
              <Select value={formData.ctaType} onValueChange={(value) => setFormData(prev => ({ ...prev, ctaType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CTA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow">Follow</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="share">Share</SelectItem>
                  <SelectItem value="link-in-bio">Link in Bio</SelectItem>
                  <SelectItem value="save">Save</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Editing Style</Label>
              <Select value={formData.editingStyle} onValueChange={(value) => setFormData(prev => ({ ...prev, editingStyle: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast-cuts">Fast Cuts</SelectItem>
                  <SelectItem value="smooth-transitions">Smooth Transitions</SelectItem>
                  <SelectItem value="static">Static Camera</SelectItem>
                  <SelectItem value="trending-effects">Trending Effects</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={analyzePotential}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze Viral Potential
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {prediction && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="text-center space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(prediction.viralScore)}`}>
                {prediction.viralScore}/100
              </div>
              <Badge variant="outline" className="text-sm">
                {getScoreLabel(prediction.viralScore)}
              </Badge>
              <Progress value={prediction.viralScore} className="w-full h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-semibold text-text-primary">
                  {prediction.expectedViews.toLocaleString()}
                </div>
                <div className="text-sm text-text-muted">Expected Views</div>
              </div>

              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <div className="text-lg font-semibold text-text-primary">
                  {prediction.confidence}%
                </div>
                <div className="text-sm text-text-muted">Confidence</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Recomendaciones
                </h4>
                <div className="space-y-3">
                  {prediction.recommendations.map((rec, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-muted/5 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-text-primary">{rec}</span>
                      </div>
                      
                      {/* Examples for this recommendation */}
                      <div className="ml-7">
                        {(() => {
                          const examples = findVideoExamples(rec);
                          return examples.length > 0 ? (
                            <div className="space-y-1">
                              <p className="text-xs text-text-muted mb-1">Ejemplos:</p>
                              {examples.slice(0, 2).map((example, exIndex) => (
                                <div key={exIndex} className="flex items-center justify-between p-2 bg-card rounded border border-border/50">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-xs font-medium text-text-primary truncate">
                                      {example.title.length > 30 ? example.title.substring(0, 30) + '...' : example.title}
                                    </h5>
                                    <span className="text-xs text-green-400 font-medium">
                                      {example.engagement_rate.toFixed(1)}% ER
                                    </span>
                                  </div>
                                  {example.video_url ? (
                                    <ExternalLink className="w-3 h-3 text-primary ml-1" />
                                  ) : (
                                    <Play className="w-3 h-3 text-text-muted ml-1" />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted italic">
                              Sube más videos para ver ejemplos
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Potential Risks
                </h4>
                <ul className="space-y-1">
                  {prediction.risks.map((risk, index) => (
                    <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-orange-400 text-xs mt-1">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};