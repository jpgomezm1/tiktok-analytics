import { useParams, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVideoExplorer, VideoExplorerData } from '@/hooks/useVideoExplorer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, ExternalLink, RefreshCw, TrendingUp, Users, Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIInsights {
  what_worked: string[];
  what_to_improve: string[];
  ab_hook_ideas: string[];
  suggested_cta: string;
  next_experiment: string;
}

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { videos, loading } = useVideoExplorer();
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const video = videos.find(v => v.id === id);

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Video no encontrado</h1>
            <p className="text-text-secondary mb-6">El video que buscas no existe.</p>
            <Link to="/videos">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatMetric = (value: number, type: 'percentage' | 'decimal' | 'number') => {
    if (type === 'percentage') return `${value.toFixed(1)}%`;
    if (type === 'decimal') return value.toFixed(1);
    return value.toLocaleString();
  };

  const getViralBadge = (video: VideoExplorerData) => {
    if (video.is_viral) {
      return { label: '🔥 Viral', variant: 'default' as const, className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' };
    }
    if (video.viral_index >= 7) {
      return { label: '✅ Bueno', variant: 'secondary' as const, className: '' };
    }
    if (video.viral_index >= 5) {
      return { label: '🔸 Medio', variant: 'outline' as const, className: '' };
    }
    return { label: '❌ Bajo', variant: 'destructive' as const, className: '' };
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-analysis', {
        body: {
          video_data: {
            title: video.title,
            duration: video.duration_seconds,
            engagement_rate: video.engagement_rate,
            retention_rate: video.retention_rate,
            saves_per_1k: video.saves_per_1k,
            f_per_1k: video.f_per_1k,
            for_you_percentage: video.for_you_percentage,
            viral_index: video.viral_index,
            hook: video.hook,
            guion: video.guion,
            video_type: video.video_type,
            views: video.views
          },
          analysis_type: 'video_insights'
        }
      });

      if (error) throw error;
      setAiInsights(data);
    } catch (error) {
      console.error('Error generating insights:', error);
      // Fallback insights
      setAiInsights({
        what_worked: [
          `Retención del ${video.retention_rate.toFixed(1)}% indica buen enganche inicial`,
          `${video.saves_per_1k.toFixed(1)} saves/1k muestra contenido valioso`,
          `Distribución For You del ${video.for_you_percentage.toFixed(1)}% fue efectiva`
        ],
        what_to_improve: [
          'Optimizar los primeros 3 segundos para mayor retención',
          'Incluir CTA más temprano para aumentar follows',
          'Probar variaciones de hook más directas'
        ],
        ab_hook_ideas: [
          'Hook de pregunta directa: "¿Sabías que...?"',
          'Hook de beneficio: "En 30 segundos aprenderás..."',
          'Hook contraintuitivo: "Todo lo que te dijeron sobre X está mal"'
        ],
        suggested_cta: 'Sígueme para más contenido como este',
        next_experiment: 'Probar hooks de máximo 2 segundos en próximos 3 videos'
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  const viralBadge = getViralBadge(video);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/videos">
            <Button variant="outline" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">{video.title}</h1>
              <p className="text-text-secondary">
                Publicado el {new Date(video.published_date).toLocaleDateString('es-ES')}
              </p>
            </div>
            {video.video_url && (
              <Button variant="outline" className="gap-2 mt-4 lg:mt-0" asChild>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Ver en TikTok
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Views */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mx-auto mb-2">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">{video.views.toLocaleString()}</div>
                  <div className="text-sm text-text-secondary">Vistas</div>
                  {video.views_per_1k_followers && (
                    <div className="text-xs text-text-muted mt-1">
                      {video.views_per_1k_followers.toFixed(0)}/1k followers
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Engagement Rate */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full mx-auto mb-2">
                    <Heart className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {formatMetric(video.engagement_rate, 'percentage')}
                  </div>
                  <div className="text-sm text-text-secondary">ER %</div>
                  <div className="text-xs text-text-muted mt-1">p{video.engagement_percentile}</div>
                </CardContent>
              </Card>

              {/* Retention Rate */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {formatMetric(video.retention_rate, 'percentage')}
                  </div>
                  <div className="text-sm text-text-secondary">Retención %</div>
                  <div className="text-xs text-text-muted mt-1">p{video.retention_percentile}</div>
                </CardContent>
              </Card>

              {/* Saves per 1K */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mx-auto mb-2">
                    <Bookmark className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {formatMetric(video.saves_per_1k, 'decimal')}
                  </div>
                  <div className="text-sm text-text-secondary">Saves / 1K</div>
                  <div className="text-xs text-text-muted mt-1">p{video.saves_percentile}</div>
                </CardContent>
              </Card>

              {/* Follows per 1K */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-full mx-auto mb-2">
                    <Users className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {formatMetric(video.f_per_1k, 'decimal')}
                  </div>
                  <div className="text-sm text-text-secondary">Follows / 1K</div>
                  <div className="text-xs text-text-muted mt-1">p{video.f_per_1k_percentile}</div>
                </CardContent>
              </Card>

              {/* For You % */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {formatMetric(video.for_you_percentage, 'percentage')}
                  </div>
                  <div className="text-sm text-text-secondary">% For You</div>
                  <div className="text-xs text-text-muted mt-1">p{video.for_you_percentile}</div>
                </CardContent>
              </Card>
            </div>

            {/* Viral Index */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Viral Index</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold text-text-primary">
                        {video.viral_index.toFixed(1)}/10
                      </span>
                      <Badge variant={viralBadge.variant} className={viralBadge.className}>
                        {viralBadge.label}
                      </Badge>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="text-text-muted cursor-help">ℹ️</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Índice 0–10 que combina views (log), retención, saves/1K, follows/1K y % For You.</p>
                        {video.is_viral && (
                          <p className="mt-1 text-xs">
                            Marcamos 'Viral' si supera 10.000 views y está en el top 7% histórico.
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary">Fuentes de tráfico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'For You Page', value: video.traffic_for_you, color: 'bg-primary' },
                    { label: 'Hashtags', value: video.traffic_hashtag, color: 'bg-green-500' },
                    { label: 'Sounds', value: video.traffic_sound, color: 'bg-yellow-500' },
                    { label: 'Profile', value: video.traffic_profile, color: 'bg-red-500' },
                    { label: 'Search', value: video.traffic_search, color: 'bg-indigo-500' },
                  ].map((source) => {
                    const percentage = video.views > 0 ? (source.value / video.views * 100) : 0;
                    return (
                      <div key={source.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                          <span className="text-text-secondary">{source.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-text-primary font-medium">{source.value.toLocaleString()}</div>
                          <div className="text-xs text-text-muted">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Script/Guion */}
            {video.guion && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-text-primary">Script/Guion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary whitespace-pre-wrap">{video.guion}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - AI Insights */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-text-primary">Insights de IA</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateInsights}
                    disabled={loadingInsights}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingInsights ? 'animate-spin' : ''}`} />
                    {loadingInsights ? 'Generando...' : 'Regenerar'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!aiInsights && !loadingInsights && (
                  <div className="text-center py-8">
                    <p className="text-text-muted mb-4">Genera insights de IA para este video</p>
                    <Button onClick={generateInsights} className="gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Generar insights
                    </Button>
                  </div>
                )}

                {loadingInsights && (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted">Analizando video...</p>
                  </div>
                )}

                {aiInsights && (
                  <div className="space-y-4">
                    {/* What Worked */}
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">✅ Qué funcionó</h4>
                      <ul className="space-y-1">
                        {aiInsights.what_worked.map((item, index) => (
                          <li key={index} className="text-sm text-text-secondary">• {item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* What to Improve */}
                    <div>
                      <h4 className="font-semibold text-orange-400 mb-2">⚠️ Qué mejorar</h4>
                      <ul className="space-y-1">
                        {aiInsights.what_to_improve.map((item, index) => (
                          <li key={index} className="text-sm text-text-secondary">• {item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* A/B Hook Ideas */}
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">🔄 Ideas A/B</h4>
                      <ul className="space-y-1">
                        {aiInsights.ab_hook_ideas.map((item, index) => (
                          <li key={index} className="text-sm text-text-secondary">• {item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggested CTA */}
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-2">📢 CTA</h4>
                      <p className="text-sm text-text-secondary bg-muted p-2 rounded">
                        "{aiInsights.suggested_cta}"
                      </p>
                    </div>

                    {/* Next Experiment */}
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">🚀 Próximo experimento</h4>
                      <p className="text-sm text-text-secondary bg-muted p-2 rounded">
                        {aiInsights.next_experiment}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;