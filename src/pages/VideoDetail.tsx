import { useParams, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVideoExplorer, VideoExplorerData } from '@/hooks/useVideoExplorer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, ExternalLink, RefreshCw, TrendingUp, Users, Bookmark, Brain, Sparkles, BarChart3, Clock, Zap, Target, Play, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const { toast } = useToast();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-bright/30 border-t-purple-bright rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-bright/10 rounded-full mx-auto"></div>
          </div>
          <p className="text-text-secondary font-medium">Cargando análisis del video...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const video = videos.find(v => v.id === id);

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto">
              <Eye className="w-12 h-12 text-red-400" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-text-primary">Video no encontrado</h1>
              <p className="text-text-secondary leading-relaxed">
                El video que buscas no existe o ha sido eliminado de tu biblioteca.
              </p>
            </div>
            <Link to="/videos">
              <Button size="lg" className="gap-2 bg-gradient-primary hover:opacity-90 shadow-lg">
                <ArrowLeft className="w-5 h-5" />
                Volver a Videos
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
      return { 
        label: '🔥 Viral', 
        className: 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg animate-pulse' 
      };
    }
    if (video.viral_index >= 7) {
      return { 
        label: '✅ Excelente', 
        className: 'bg-green-500/20 text-green-400 border-green-500/30' 
      };
    }
    if (video.viral_index >= 5) {
      return { 
        label: '🔸 Bueno', 
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
      };
    }
    return { 
      label: '📈 Mejorable', 
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
    };
  };

  const getPerformanceColor = (percentile: number) => {
    if (percentile >= 90) return 'text-red-400';
    if (percentile >= 70) return 'text-orange-400';
    if (percentile >= 50) return 'text-yellow-400';
    if (percentile >= 30) return 'text-blue-400';
    return 'text-text-muted';
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado",
      description: `${label} copiado al portapapeles`,
    });
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('video-insights', {
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
          }
        }
      });

      if (error) throw error;
      
      // Process and validate the response
      const processedInsights = {
        what_worked: Array.isArray(data?.what_worked) ? data.what_worked : [],
        what_to_improve: Array.isArray(data?.what_to_improve) ? data.what_to_improve : [],
        ab_hook_ideas: Array.isArray(data?.ab_hook_ideas) ? data.ab_hook_ideas : [],
        suggested_cta: data?.suggested_cta || 'Sígueme para más contenido como este',
        next_experiment: data?.next_experiment || 'Continúa experimentando con variaciones'
      };
      
      setAiInsights(processedInsights);
      
      toast({
        title: "✨ Insights generados",
        description: "Análisis de IA completado exitosamente",
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      
      // Smart fallback based on video performance
      const fallbackInsights = generateSmartFallback(video);
      setAiInsights(fallbackInsights);
      
      toast({
        title: "🤖 Análisis local",
        description: "Insights generados basados en patrones de rendimiento",
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  const generateSmartFallback = (video: VideoExplorerData): AIInsights => {
    const metrics = {
      retention: video.retention_rate,
      saves: video.saves_per_1k,
      follows: video.f_per_1k,
      forYou: video.for_you_percentage,
      engagement: video.engagement_rate,
      views: video.views
    };

    const insights: AIInsights = {
      what_worked: [],
      what_to_improve: [],
      ab_hook_ideas: [],
      suggested_cta: '',
      next_experiment: ''
    };

    // Analyze what worked based on strong metrics
    if (metrics.retention >= 60) {
      insights.what_worked.push(`🎯 Hook efectivo: ${metrics.retention.toFixed(1)}% de retención mantiene audiencia`);
    }
    if (metrics.saves >= 3) {
      insights.what_worked.push(`💾 Contenido valioso: ${metrics.saves.toFixed(1)} saves/1K indica utilidad`);
    }
    if (metrics.forYou >= 70) {
      insights.what_worked.push(`🔥 Algoritmo favorable: ${metrics.forYou.toFixed(1)}% For You distribution`);
    }
    if (metrics.views > 50000) {
      insights.what_worked.push(`📈 Alto alcance: ${metrics.views.toLocaleString()} views demuestran appeal masivo`);
    }

    // Identify improvement areas
    if (metrics.retention < 45) {
      insights.what_to_improve.push(`⏱️ Hook más impactante: mejorar retención desde ${metrics.retention.toFixed(1)}%`);
    }
    if (metrics.follows < 1.5) {
      insights.what_to_improve.push(`👥 CTA más persuasivo: incrementar follows desde ${metrics.follows.toFixed(1)}/1K`);
    }
    if (metrics.saves < 2) {
      insights.what_to_improve.push(`💡 Más valor agregado: aumentar saves desde ${metrics.saves.toFixed(1)}/1K`);
    }

    // Generate hook ideas based on performance
    const hookStrategies = [
      'Hook de pregunta directa: "¿Por qué nadie habla de...?"',
      'Hook de beneficio inmediato: "En 30 segundos descubrirás..."',
      'Hook de contradicción: "Todo lo que creías sobre X está mal"',
      'Hook de curiosidad: "El secreto que usan los expertos..."',
      'Hook de urgencia: "Antes de que sea demasiado tarde..."'
    ];
    
    insights.ab_hook_ideas = hookStrategies.slice(0, 3);

    // Smart CTA suggestion
    if (metrics.follows < 2) {
      insights.suggested_cta = 'Sígueme para más secrets como este que funcionan';
    } else if (metrics.saves < 3) {
      insights.suggested_cta = 'Guarda este video para no olvidarlo';
    } else {
      insights.suggested_cta = 'Comenta si quieres que profundice en este tema';
    }

    // Next experiment suggestion
    if (metrics.retention < 50) {
      insights.next_experiment = 'Probar hooks de máximo 2 segundos en próximos 3 videos';
    } else {
      insights.next_experiment = 'Experimentar con diferentes posiciones del CTA';
    }

    return insights;
  };

  const viralBadge = getViralBadge(video);

  const kpiCards = [
    {
      icon: Eye,
      label: 'Vistas',
      value: video.views.toLocaleString(),
      subtitle: video.views_per_1k_followers ? `${video.views_per_1k_followers.toFixed(0)}/1k followers` : null,
      color: 'from-blue-500 to-blue-600',
      percentile: null
    },
    {
      icon: Heart,
      label: 'Engagement',
      value: formatMetric(video.engagement_rate, 'percentage'),
      subtitle: `p${video.engagement_percentile}`,
      color: 'from-orange-500 to-orange-600',
      percentile: video.engagement_percentile
    },
    {
      icon: Clock,
      label: 'Retención',
      value: formatMetric(video.retention_rate, 'percentage'),
      subtitle: `p${video.retention_percentile}`,
      color: 'from-green-500 to-green-600',
      percentile: video.retention_percentile
    },
    {
      icon: Bookmark,
      label: 'Saves/1K',
      value: formatMetric(video.saves_per_1k, 'decimal'),
      subtitle: `p${video.saves_percentile}`,
      color: 'from-purple-500 to-purple-600',
      percentile: video.saves_percentile
    },
    {
      icon: Users,
      label: 'Follows/1K',
      value: formatMetric(video.f_per_1k, 'decimal'),
      subtitle: `p${video.f_per_1k_percentile}`,
      color: 'from-cyan-500 to-cyan-600',
      percentile: video.f_per_1k_percentile
    },
    {
      icon: Zap,
      label: 'For You',
      value: formatMetric(video.for_you_percentage, 'percentage'),
      subtitle: `p${video.for_you_percentile}`,
      color: 'from-pink-500 to-pink-600',
      percentile: video.for_you_percentile
    }
  ];

  const trafficSources = [
    { label: 'For You Page', value: video.traffic_for_you, color: 'from-purple-500 to-purple-600', icon: '🔥' },
    { label: 'Hashtags', value: video.traffic_hashtag, color: 'from-green-500 to-green-600', icon: '#️⃣' },
    { label: 'Sounds', value: video.traffic_sound, color: 'from-yellow-500 to-yellow-600', icon: '🎵' },
    { label: 'Profile', value: video.traffic_profile, color: 'from-red-500 to-red-600', icon: '👤' },
    { label: 'Search', value: video.traffic_search, color: 'from-indigo-500 to-indigo-600', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-8">
          <Link to="/videos">
            <Button variant="outline" className="gap-2 mb-6 hover:border-purple-bright/30 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />
              Volver a Videos
            </Button>
          </Link>
          
          <div className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  {video.image_url && (
                    <div className="w-20 h-15 bg-muted rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-border/30">
                      <img
                        src={video.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-4xl font-bold text-text-primary mb-3 leading-tight">
                      {video.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-text-secondary">
                      <span className="flex items-center gap-1">
                        📅 {new Date(video.published_date).toLocaleDateString('es-ES')}
                      </span>
                      <span className="flex items-center gap-1">
                        ⏱️ {video.duration_seconds}s
                      </span>
                      {video.video_type && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                          {video.video_type}
                        </Badge>
                      )}
                      <Badge className={viralBadge.className}>
                        {viralBadge.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                {video.video_url && (
                  <Button variant="outline" className="gap-2 hover:border-blue-500/30 hover:text-blue-500 transition-all duration-200" asChild>
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Ver en TikTok
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2 hover:border-purple-500/30 hover:text-purple-500 transition-all duration-200"
                  onClick={generateInsights}
                  disabled={loadingInsights}
                >
                  <Brain className={cn("w-4 h-4", loadingInsights && "animate-pulse")} />
                  AI Insights
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - KPIs & Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {kpiCards.map((kpi, index) => (
                <Card key={index} className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-5 text-center">
                    <div className={cn(
                      "flex items-center justify-center w-14 h-14 bg-gradient-to-br rounded-xl mx-auto mb-4 shadow-md transition-transform duration-300 group-hover:scale-110",
                      `${kpi.color}/20`
                    )}>
                      <kpi.icon className={cn("w-7 h-7", `${kpi.color.split(' ')[1]}`)} />
                    </div>
                    <div className="text-2xl font-bold text-text-primary mb-1">{kpi.value}</div>
                    <div className="text-sm text-text-secondary font-medium mb-1">{kpi.label}</div>
                    {kpi.subtitle && (
                      <div className={cn(
                        "text-xs font-medium",
                        kpi.percentile ? getPerformanceColor(kpi.percentile) : "text-blue-400"
                      )}>
                        {kpi.subtitle}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Viral Index Highlight */}
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl shadow-md">
                        <Target className="w-6 h-6 text-purple-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-text-primary">Viral Index</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl font-bold text-text-primary">
                        {video.viral_index.toFixed(1)}
                        <span className="text-2xl text-text-muted">/10</span>
                      </span>
                    </div>
                    
                    {/* Visual score bar */}
                    <div className="w-64 h-3 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(video.viral_index / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="text-3xl cursor-help hover:scale-110 transition-transform duration-200">📊</div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-4">
                        <div className="space-y-2">
                          <p className="font-semibold text-purple-300">Cálculo del Viral Index:</p>
                          <p className="text-sm">Combina views (logarítmico), retención, saves/1K, follows/1K y distribución For You.</p>
                          {video.is_viral && (
                            <p className="text-xs text-orange-300 mt-2">
                              🔥 Status viral: +10K views y top 7% histórico
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl shadow-md">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl font-bold text-text-primary">Distribución de Tráfico</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trafficSources.map((source) => {
                    const percentage = video.views > 0 ? (source.value / video.views * 100) : 0;
                    return (
                      <div key={source.label} className="bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{source.icon}</span>
                            <span className="font-semibold text-text-primary">{source.label}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-text-primary">{source.value.toLocaleString()}</div>
                            <div className="text-xs text-text-muted">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        {percentage > 0 && (
                          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full bg-gradient-to-r transition-all duration-1000", source.color)}
                              style={{ width: `${Math.max(percentage, 3)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hook */}
              {video.hook && (
                <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl shadow-md">
                          <Zap className="w-5 h-5 text-yellow-500" />
                        </div>
                        <CardTitle className="text-lg font-bold text-text-primary">Hook</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(video.hook!, 'Hook')}
                        className="hover:bg-yellow-500/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-xl p-4 border border-yellow-500/20">
                      <p className="text-text-primary font-medium leading-relaxed italic">"{video.hook}"</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Script/Guion */}
              {video.guion && (
                <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl shadow-md">
                          <MessageCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <CardTitle className="text-lg font-bold text-text-primary">Script</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(video.guion!, 'Script')}
                        className="hover:bg-blue-500/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30 max-h-40 overflow-y-auto">
                      <p className="text-text-primary whitespace-pre-wrap leading-relaxed text-sm">{video.guion}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - AI Insights */}
          <div className="xl:col-span-1">
            <Card className="sticky top-4 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl shadow-md">
                      <Brain className="w-5 h-5 text-purple-500" />
                    </div>
                    <CardTitle className="text-lg font-bold text-text-primary">AI Insights</CardTitle>
                  </div>
                  {aiInsights && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generateInsights}
                      disabled={loadingInsights}
                      className="gap-2 hover:bg-purple-500/10"
                    >
                      <RefreshCw className={cn("w-4 h-4", loadingInsights && "animate-spin")} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!aiInsights && !loadingInsights && (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-bright/20 to-purple-dark/10 rounded-2xl flex items-center justify-center mx-auto">
                      <Brain className="w-8 h-8 text-purple-light" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-text-primary">Análisis Inteligente</h4>
                      <p className="text-text-muted text-sm leading-relaxed">
                        Genera insights personalizados basados en el rendimiento de este video
                      </p>
                      <Button onClick={generateInsights} className="gap-2 bg-gradient-primary hover:opacity-90">
                        <Sparkles className="w-4 h-4" />
                        Generar Insights
                      </Button>
                    </div>
                  </div>
                )}

                {loadingInsights && (
                  <div className="text-center py-8 space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-purple-bright/30 border-t-purple-bright rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-purple-bright/10 rounded-full mx-auto"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-primary font-medium">Analizando con IA...</p>
                      <p className="text-text-muted text-xs">Esto puede tomar unos segundos</p>
                    </div>
                  </div>
                )}

                {aiInsights && (
                  <div className="space-y-5">
                    {/* What Worked */}
                    {aiInsights.what_worked && aiInsights.what_worked.length > 0 && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl p-4 border border-green-500/20">
                        <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                          <span>✅</span> 
                          <span>Qué funcionó</span>
                        </h4>
                        <div className="space-y-2">
                          {aiInsights.what_worked.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-green-400 mt-0.5 text-xs">●</span>
                              <span className="text-text-primary leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* What to Improve */}
                    {aiInsights.what_to_improve && aiInsights.what_to_improve.length > 0 && (
                      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/5 rounded-xl p-4 border border-orange-500/20">
                        <h4 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                          <span>⚡</span> 
                          <span>Optimizaciones</span>
                        </h4>
                        <div className="space-y-2">
                          {aiInsights.what_to_improve.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-orange-400 mt-0.5 text-xs">●</span>
                              <span className="text-text-primary leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* A/B Hook Ideas */}
                    {aiInsights.ab_hook_ideas && aiInsights.ab_hook_ideas.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 rounded-xl p-4 border border-blue-500/20">
                        <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                          <span>🔄</span> 
                          <span>Variaciones A/B</span>
                        </h4>
                        <div className="space-y-3">
                          {aiInsights.ab_hook_ideas.map((item, index) => (
                            <div key={index} className="bg-background/60 rounded-lg p-3 border border-border/30">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm text-text-primary leading-relaxed flex-1">{item}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(item, 'Hook idea')}
                                  className="h-6 w-6 p-0 hover:bg-blue-500/10"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested CTA */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/5 rounded-xl p-4 border border-purple-500/20">
                      <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <span>📢</span> 
                        <span>CTA Sugerido</span>
                      </h4>
                      <div className="bg-background/60 p-3 rounded-lg border border-border/30">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-text-primary font-medium italic flex-1">
                            "{aiInsights.suggested_cta}"
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(aiInsights.suggested_cta, 'CTA')}
                            className="h-6 w-6 p-0 hover:bg-purple-500/10"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Next Experiment */}
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/5 rounded-xl p-4 border border-cyan-500/20">
                      <h4 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                        <span>🚀</span> 
                        <span>Próximo Experimento</span>
                      </h4>
                      <div className="bg-background/60 p-3 rounded-lg border border-border/30">
                        <p className="text-sm text-text-primary leading-relaxed">
                          {aiInsights.next_experiment}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-border/30">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allInsights = [
                              ...aiInsights.what_worked,
                              ...aiInsights.what_to_improve,
                              ...aiInsights.ab_hook_ideas,
                              aiInsights.suggested_cta,
                              aiInsights.next_experiment
                            ].join('\n\n');
                            copyToClipboard(allInsights, 'Todos los insights');
                          }}
                          className="gap-1 text-xs hover:border-purple-500/30"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar Todo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateInsights}
                          disabled={loadingInsights}
                          className="gap-1 text-xs hover:border-blue-500/30"
                        >
                          <RefreshCw className={cn("w-3 h-3", loadingInsights && "animate-spin")} />
                          Regenerar
                        </Button>
                      </div>
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