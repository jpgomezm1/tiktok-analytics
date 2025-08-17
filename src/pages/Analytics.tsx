import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/hooks/useAuth';
import { MetricCard } from '@/components/MetricCard';
import { InsightCard } from '@/components/InsightCard';
import { ScoreCard } from '@/components/ScoreCard';
import { TopBottomChart } from '@/components/TopBottomChart';
import { PeriodSelector } from '@/components/PeriodSelector';
import { AdvancedInsightsCard } from '@/components/AdvancedInsightsCard';
import { ClusterAnalysisCard } from '@/components/ClusterAnalysisCard';
import { ViralPredictionsCard } from '@/components/ViralPredictionsCard';
import { PerformanceMatrixCard } from '@/components/PerformanceMatrixCard';
import { ExecutiveSummaryCard } from '@/components/ExecutiveSummaryCard';
import { BrainIndexingPrompt } from '@/components/BrainIndexingPrompt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsEngine } from '@/utils/analyticsEngine';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useKPIs, Period } from '@/hooks/useKPIs';
import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Brain, 
  Lightbulb, 
  Target, 
  BarChart3, 
  Sparkles, 
  Calendar, 
  Users, 
  BookmarkPlus, 
  Share,
  Play,
  Clock,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Grid3X3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  ScatterChart,
  Scatter
} from 'recharts';

const Analytics = () => {
  const { videos, analytics, loading } = useVideos();
  const { user } = useAuth();
  const kpis = useKPIs();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');
  const [topBottomData, setTopBottomData] = useState({ top: [], bottom: [] });
  
  const aiEngine = useMemo(() => new AnalyticsEngine(videos), [videos]);
  const performanceScores = useMemo(() => aiEngine.calculatePerformanceScores(), [aiEngine]);
  const insights = useMemo(() => aiEngine.generateInsights(), [aiEngine]);
  const patterns = useMemo(() => aiEngine.analyzeContentPatterns(), [aiEngine]);
  
  // Advanced Analytics Hook
  const advancedAnalytics = useAdvancedAnalytics(videos);

  // Load KPI data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const topBottom = await kpis.charts.topVsBottom(selectedPeriod);
        setTopBottomData(topBottom);
      } catch (error) {
        console.error('Error loading top/bottom data:', error);
        setTopBottomData({ top: [], bottom: [] });
      }
    };

    loadData();
  }, [user, selectedPeriod]);

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  // Calculate comprehensive analytics data
  const analyticsData = useMemo(() => {
    const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    
    const periodVideos = videos.filter(video => 
      new Date(video.published_date) >= cutoffDate
    );

    if (periodVideos.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
        totalFollowers: 0,
        avgEngagement: 0,
        avgRetention: 0,
        avgSavesPer1K: 0,
        avgForYouTraffic: 0,
        videoCount: 0,
        bestVideo: null,
        worstVideo: null,
        timelineData: [],
        trafficData: [],
        correlationData: [],
        hourlyData: [],
        durationPerformanceData: [],
        velocityData: [],
        retentionBreakdown: [],
        contentTypeBreakdown: [],
        weeklyTrends: []
      };
    }

    // Basic aggregations
    const totals = periodVideos.reduce((acc, video) => {
      const views = video.views || 0;
      const likes = video.likes || 0;
      const comments = video.comments || 0;
      const shares = video.shares || 0;
      const saves = video.saves || 0;
      const newFollowers = video.new_followers || 0;
      const avgTime = video.avg_time_watched || 0;
      const duration = video.duration_seconds || 1;
      const forYouTraffic = video.traffic_for_you || 0;

      return {
        totalViews: acc.totalViews + views,
        totalLikes: acc.totalLikes + likes,
        totalComments: acc.totalComments + comments,
        totalShares: acc.totalShares + shares,
        totalSaves: acc.totalSaves + saves,
        totalFollowers: acc.totalFollowers + newFollowers,
        totalWatchTime: acc.totalWatchTime + (avgTime * views),
        totalDuration: acc.totalDuration + (duration * views),
        totalForYouTraffic: acc.totalForYouTraffic + forYouTraffic,
        videoCount: acc.videoCount + 1
      };
    }, {
      totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0,
      totalSaves: 0, totalFollowers: 0, totalWatchTime: 0, totalDuration: 0,
      totalForYouTraffic: 0, videoCount: 0
    });

    // Calculate averages
    const avgEngagement = totals.totalViews > 0 
      ? ((totals.totalLikes + totals.totalComments + totals.totalShares) / totals.totalViews) * 100 
      : 0;
    
    const avgRetention = totals.totalDuration > 0 
      ? (totals.totalWatchTime / totals.totalDuration) * 100 
      : 0;
    
    const avgSavesPer1K = totals.totalViews > 0 
      ? (totals.totalSaves / totals.totalViews) * 1000 
      : 0;
    
    const avgForYouTraffic = totals.totalViews > 0 
      ? (totals.totalForYouTraffic / totals.totalViews) * 100 
      : 0;

    // Find best and worst performers
    const videosWithScore = periodVideos.map(video => ({
      ...video,
      score: video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views) * 100 : 0
    }));
    
    const bestVideo = videosWithScore.length > 0 
      ? videosWithScore.reduce((best, current) => current.score > best.score ? current : best)
      : null;
    
    const worstVideo = videosWithScore.length > 0 
      ? videosWithScore.reduce((worst, current) => current.score < worst.score ? current : worst)
      : null;

    // Timeline data (daily aggregation)
    const timelineData = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayVideos = periodVideos.filter(video => 
        video.published_date === dateStr
      );
      
      const dayTotals = dayVideos.reduce((acc, video) => ({
        views: acc.views + (video.views || 0),
        engagement: acc.engagement + ((video.likes || 0) + (video.comments || 0) + (video.shares || 0)),
        saves: acc.saves + (video.saves || 0),
        followers: acc.followers + (video.new_followers || 0)
      }), { views: 0, engagement: 0, saves: 0, followers: 0 });

      timelineData.push({
        date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        views: dayTotals.views,
        engagement: dayTotals.views > 0 ? (dayTotals.engagement / dayTotals.views) * 100 : 0,
        saves: dayTotals.saves,
        followers: dayTotals.followers
      });
    }

    // Correlation analysis (Retention vs Saves, Duration vs Views, etc.)
    const correlationData = periodVideos.map(video => {
      const retention = video.duration_seconds > 0 
        ? (video.avg_time_watched / video.duration_seconds) * 100 
        : 0;
      const savesPer1K = video.views > 0 
        ? (video.saves / video.views) * 1000 
        : 0;
      const forYouPct = video.views > 0 
        ? (video.traffic_for_you / video.views) * 100 
        : 0;

      return {
        title: video.title?.substring(0, 20) + '...' || 'Sin título',
        retention,
        savesPer1K,
        views: video.views || 0,
        duration: video.duration_seconds || 0,
        forYouPct,
        engagement: video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views) * 100 : 0
      };
    }).filter(v => v.views > 0);

    // Hourly performance analysis (mock based on video performance and date)
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourVideos = periodVideos.filter(video => {
        // Mock hour extraction based on date
        const mockHour = (new Date(video.published_date).getDate() + hour) % 24;
        return mockHour === hour;
      });

      if (hourVideos.length > 0) {
        const avgViews = hourVideos.reduce((sum, v) => sum + (v.views || 0), 0) / hourVideos.length;
        const avgEngagement = hourVideos.reduce((sum, v) => {
          const views = v.views || 0;
          return sum + (views > 0 ? ((v.likes + v.comments + v.shares) / views) * 100 : 0);
        }, 0) / hourVideos.length;

        hourlyData.push({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          avgViews: Math.round(avgViews),
          avgEngagement: Number(avgEngagement.toFixed(1)),
          videoCount: hourVideos.length
        });
      }
    }

    // Duration vs Performance analysis
    const durationPerformanceData = periodVideos.map(video => ({
      duration: video.duration_seconds || 0,
      views: video.views || 0,
      engagement: video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views) * 100 : 0,
      saves: video.views > 0 ? (video.saves / video.views) * 1000 : 0,
      title: video.title?.substring(0, 15) + '...' || 'Sin título'
    })).filter(v => v.duration > 0 && v.views > 0);

    // Velocity analysis (views in first days vs total)
    const velocityData = periodVideos.map(video => {
      const daysSincePublished = Math.max(1, Math.floor(
        (new Date().getTime() - new Date(video.published_date).getTime()) / (1000 * 60 * 60 * 24)
      ));
      const dailyVelocity = (video.views || 0) / daysSincePublished;

      return {
        title: video.title?.substring(0, 20) + '...' || 'Sin título',
        velocity: Math.round(dailyVelocity),
        totalViews: video.views || 0,
        daysOld: daysSincePublished,
        engagement: video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views) * 100 : 0
      };
    }).filter(v => v.totalViews > 0).sort((a, b) => b.velocity - a.velocity);

    // Traffic breakdown
    const trafficData = [
      { name: 'For You', value: totals.totalForYouTraffic, color: '#8B5CF6' },
      { 
        name: 'Perfil', 
        value: periodVideos.reduce((sum, v) => sum + (v.traffic_profile || 0), 0), 
        color: '#3B82F6' 
      },
      { 
        name: 'Hashtag', 
        value: periodVideos.reduce((sum, v) => sum + (v.traffic_hashtag || 0), 0), 
        color: '#10B981' 
      },
      { 
        name: 'Audio', 
        value: periodVideos.reduce((sum, v) => sum + (v.traffic_sound || 0), 0), 
        color: '#F59E0B' 
      },
      { 
        name: 'Búsqueda', 
        value: periodVideos.reduce((sum, v) => sum + (v.traffic_search || 0), 0), 
        color: '#EF4444' 
      }
    ].filter(item => item.value > 0);

    // Retention breakdown by ranges
    const retentionBreakdown = periodVideos.reduce((acc, video) => {
      const retention = video.duration_seconds > 0 
        ? (video.avg_time_watched / video.duration_seconds) * 100 
        : 0;
      
      if (retention >= 80) acc.excellent++;
      else if (retention >= 60) acc.good++;
      else if (retention >= 40) acc.average++;
      else if (retention >= 20) acc.poor++;
      else acc.critical++;
      
      return acc;
    }, { excellent: 0, good: 0, average: 0, poor: 0, critical: 0 });

    // Content type breakdown
    const contentTypeBreakdown = periodVideos.reduce((acc, video) => {
      const type = video.video_type || 'Sin categorizar';
      if (!acc[type]) acc[type] = { count: 0, avgViews: 0, totalViews: 0, avgEngagement: 0, totalEngagement: 0 };
      acc[type].count++;
      acc[type].totalViews += video.views || 0;
      const engagement = video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views) * 100 : 0;
      acc[type].totalEngagement += engagement;
      return acc;
    }, {});

    Object.keys(contentTypeBreakdown).forEach(type => {
      contentTypeBreakdown[type].avgViews = 
        contentTypeBreakdown[type].totalViews / contentTypeBreakdown[type].count;
      contentTypeBreakdown[type].avgEngagement = 
        contentTypeBreakdown[type].totalEngagement / contentTypeBreakdown[type].count;
    });

    // Weekly trends
    const weeklyTrends = [];
    const weeksToShow = Math.min(Math.floor(periodDays / 7), 8);
    
    for (let week = 0; week < weeksToShow; week++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (week + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - week * 7);

      const weekVideos = periodVideos.filter(video => {
        const videoDate = new Date(video.published_date);
        return videoDate >= weekStart && videoDate < weekEnd;
      });

      if (weekVideos.length > 0) {
        const weekTotals = weekVideos.reduce((acc, video) => ({
          views: acc.views + (video.views || 0),
          engagement: acc.engagement + ((video.likes || 0) + (video.comments || 0) + (video.shares || 0)),
          saves: acc.saves + (video.saves || 0),
          followers: acc.followers + (video.new_followers || 0),
          videos: acc.videos + 1
        }), { views: 0, engagement: 0, saves: 0, followers: 0, videos: 0 });

        weeklyTrends.unshift({
          week: `Sem ${weeksToShow - week}`,
          avgViews: Math.round(weekTotals.views / weekTotals.videos),
          avgEngagement: weekTotals.views > 0 ? (weekTotals.engagement / weekTotals.views) * 100 : 0,
          totalSaves: weekTotals.saves,
          totalFollowers: weekTotals.followers,
          videoCount: weekTotals.videos
        });
      }
    }

    return {
      totalViews: totals.totalViews,
      totalLikes: totals.totalLikes,
      totalComments: totals.totalComments,
      totalShares: totals.totalShares,
      totalSaves: totals.totalSaves,
      totalFollowers: totals.totalFollowers,
      avgEngagement,
      avgRetention,
      avgSavesPer1K,
      avgForYouTraffic,
      videoCount: totals.videoCount,
      bestVideo,
      worstVideo,
      timelineData,
      trafficData,
      correlationData,
      hourlyData: hourlyData.slice(0, 12), // Top 12 hours
      durationPerformanceData,
      velocityData: velocityData.slice(0, 10),
      retentionBreakdown,
      contentTypeBreakdown: Object.entries(contentTypeBreakdown).map(([type, data]) => ({
        type,
        ...(data as any)
      })),
      weeklyTrends
    };
  }, [videos, selectedPeriod]);

  if (loading) {
    return (
      <div className="space-y-xl">
        <div className="flex justify-end">
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-lg">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics Dashboard</h1>
          <p className="text-text-secondary">Análisis profundo de tu contenido de TikTok</p>
        </div>
        <PeriodSelector 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No hay datos para analizar</h3>
            <p className="text-text-secondary">Importa videos para ver analytics detallados</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="correlation">Correlaciones</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="clustering">Clustering</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Executive Summary */}
            <ExecutiveSummaryCard 
              data={{
                viralReadiness: advancedAnalytics.getViralReadinessScore(),
                contentDiversity: advancedAnalytics.getContentDiversityScore(),
                optimizationOpportunities: advancedAnalytics.getOptimizationOpportunities().length,
                topClusters: advancedAnalytics.getTopClusters().length,
                highPotentialVideos: advancedAnalytics.getHighPotentialVideos().length,
                criticalInsights: advancedAnalytics.getCriticalInsights().length,
                optimalHours: advancedAnalytics.getOptimalPublishingHours().length,
                contentGaps: advancedAnalytics.getContentGaps().length
              }}
              isLoading={advancedAnalytics.loading}
            />

            {/* Brain Indexing Prompt for Overview if needed */}
            {advancedAnalytics.hasBrainVectors === false && (
              <Alert className="border-blue-500/30 bg-blue-500/5">
                <Brain className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  <strong>Analytics Básicos Activos:</strong> Para activar predicciones de viralidad, clustering automático y insights avanzados con IA, 
                  ve a la tab "AI Insights" y activa el procesamiento inteligente de tu contenido.
                </AlertDescription>
              </Alert>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Views"
                value={analyticsData.totalViews.toLocaleString()}
                change={`${analyticsData.videoCount} videos`}
                changeType="neutral"
                icon={<Eye />}
              />
              <MetricCard
                title="Engagement Rate"
                value={`${analyticsData.avgEngagement.toFixed(1)}%`}
                change={`${analyticsData.totalLikes.toLocaleString()} likes`}
                changeType="neutral"
                icon={<Heart />}
              />
              <MetricCard
                title="Saves por 1K"
                value={analyticsData.avgSavesPer1K.toFixed(1)}
                change={`${analyticsData.totalSaves.toLocaleString()} saves`}
                changeType="neutral"
                icon={<BookmarkPlus />}
              />
              <MetricCard
                title="New Followers"
                value={analyticsData.totalFollowers.toLocaleString()}
                change={`${analyticsData.avgForYouTraffic.toFixed(1)}% For You`}
                changeType="neutral"
                icon={<Users />}
              />
            </div>

            {/* Advanced AI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Viral Readiness"
                value={`${advancedAnalytics.getViralReadinessScore()}%`}
                change="AI Score"
                changeType="neutral"
                icon={<Zap />}
              />
              <MetricCard
                title="Content Clusters"
                value={advancedAnalytics.getTopClusters().length.toString()}
                change="Activos con IA"
                changeType="neutral"
                icon={<Layers />}
              />
              <MetricCard
                title="High Potential"
                value={advancedAnalytics.getHighPotentialVideos().length.toString()}
                change="Videos"
                changeType="neutral"
                icon={<TrendingUp />}
              />
              <MetricCard
                title="Critical Insights"
                value={advancedAnalytics.getCriticalInsights().length.toString()}
                change="Requieren acción"
                changeType="neutral"
                icon={<Brain />}
              />
            </div>

            {/* Performance Timeline & Weekly Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Performance Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--text-muted))" fontSize={11} />
                        <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                          name="Views"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Tendencias Semanales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.weeklyTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" stroke="hsl(var(--text-muted))" fontSize={11} />
                        <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="avgViews" fill="hsl(var(--primary))" name="Avg Views" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.bestVideo && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      Top Performer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-text-secondary mb-2 truncate">
                      {analyticsData.bestVideo.title}
                    </p>
                    <div className="text-lg font-bold text-text-primary">
                      {analyticsData.bestVideo.views?.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-500">
                      {analyticsData.bestVideo.score?.toFixed(1)}% engagement
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Retención Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-text-primary">
                    {analyticsData.avgRetention.toFixed(1)}%
                  </div>
                  <div className="text-xs text-text-secondary">
                    Tiempo promedio visto
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    For You Traffic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-text-primary">
                    {analyticsData.avgForYouTraffic.toFixed(1)}%
                  </div>
                  <div className="text-xs text-text-secondary">
                    Promedio del período
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    Velocidad Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-text-primary">
                    {analyticsData.velocityData.length > 0 
                      ? Math.round(analyticsData.velocityData.reduce((sum, v) => sum + v.velocity, 0) / analyticsData.velocityData.length).toLocaleString()
                      : '0'
                    }
                  </div>
                  <div className="text-xs text-text-secondary">
                    Views por día
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Top vs Bottom - Optimized for mobile */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
              <TopBottomChart data={topBottomData} loading={false} />
              
              {/* Performance Scores - Vertical Stack */}
              <div className="space-y-4">
                <ScoreCard
                  title="Calidad"
                  score={performanceScores.contentQuality}
                  description="Engagement y retención"
                  color="blue"
                />
                <ScoreCard
                  title="Viral"
                  score={performanceScores.viralPotential}
                  description="Potencial viral"
                  color="green"
                />
                <ScoreCard
                  title="Monetización"
                  score={performanceScores.monetizationReadiness}
                  description="Listo para ingresos"
                  color="orange"
                />
                <ScoreCard
                  title="Crecimiento"
                  score={performanceScores.overallGrowth}
                  description="Score general"
                  color="purple"
                />
              </div>
            </div>

            {/* Velocity Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Análisis de Velocidad Inicial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={analyticsData.velocityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="daysOld" 
                        stroke="hsl(var(--text-muted))" 
                        fontSize={11}
                        name="Días desde publicación"
                      />
                      <YAxis 
                        dataKey="velocity" 
                        stroke="hsl(var(--text-muted))" 
                        fontSize={11}
                        name="Views por día"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                        formatter={(value, name, props) => [
                          name === 'velocity' ? `${value}/día` : value,
                          name === 'velocity' ? 'Velocidad' : name
                        ]}
                        labelFormatter={(label) => `Días: ${label}`}
                      />
                      <Scatter 
                        dataKey="velocity" 
                        fill="hsl(var(--primary))" 
                        name="velocity"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Retention Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Distribución de Retención
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-xl font-bold text-green-500 mb-1">
                      {analyticsData.retentionBreakdown.excellent}
                    </div>
                    <div className="text-xs text-text-secondary">Excelente</div>
                    <div className="text-xs text-text-muted">≥80%</div>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-xl font-bold text-blue-500 mb-1">
                      {analyticsData.retentionBreakdown.good}
                    </div>
                    <div className="text-xs text-text-secondary">Buena</div>
                    <div className="text-xs text-text-muted">60-79%</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="text-xl font-bold text-yellow-500 mb-1">
                      {analyticsData.retentionBreakdown.average}
                    </div>
                    <div className="text-xs text-text-secondary">Promedio</div>
                    <div className="text-xs text-text-muted">40-59%</div>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-xl font-bold text-orange-500 mb-1">
                      {analyticsData.retentionBreakdown.poor}
                    </div>
                    <div className="text-xs text-text-secondary">Baja</div>
                    <div className="text-xs text-text-muted">20-39%</div>
                  </div>
                  <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="text-xl font-bold text-red-500 mb-1">
                      {analyticsData.retentionBreakdown.critical}
                    </div>
                    <div className="text-xs text-text-secondary">Crítica</div>
                    <div className="text-xs text-text-muted">&lt;20%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Correlation Tab */}
          <TabsContent value="correlation" className="space-y-6">
            {/* Retention vs Saves Correlation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Retención vs Saves (Correlación)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={analyticsData.correlationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="retention" 
                        stroke="hsl(var(--text-muted))" 
                        fontSize={11}
                        name="Retención (%)"
                      />
                      <YAxis 
                        dataKey="savesPer1K" 
                        stroke="hsl(var(--text-muted))" 
                        fontSize={11}
                        name="Saves per 1K"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                        formatter={(value, name) => [
                          name === 'retention' ? `${value}%` : value,
                          name === 'retention' ? 'Retención' : 'Saves/1K'
                        ]}
                        labelFormatter={(label) => `Video: ${label}`}
                      />
                      <Scatter 
                        dataKey="savesPer1K" 
                        fill="hsl(var(--primary))" 
                        name="savesPer1K"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Duration vs Views Correlation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  Duración vs Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={analyticsData.durationPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="duration" 
                        stroke="hsl(var(--text-muted))" 
                        fontSize={11}
                        name="Duración (seg)"
                      />
                      <YAxis 
                        dataKey="engagement" 
                        stroke="hsl(var(--text-muted))" 
                        fontSize={11}
                        name="Engagement (%)"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Scatter 
                        dataKey="engagement" 
                        fill="hsl(var(--accent))" 
                        name="engagement"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="space-y-6">
            {/* Best Hours Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Horarios Óptimos de Publicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--text-muted))" fontSize={11} />
                      <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="avgViews" fill="hsl(var(--primary))" name="Avg Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Fuentes de Tráfico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.trafficData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.trafficData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analyticsData.trafficData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-text-secondary">No hay datos de tráfico</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {/* Content Type Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-500" />
                  Performance por Tipo de Contenido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.contentTypeBreakdown.slice(0, 6).map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-text-primary mb-1">{type.type}</div>
                        <div className="text-xs text-text-secondary">
                          {type.count} videos • {type.avgViews.toLocaleString()} views promedio
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-text-primary">
                          {type.avgEngagement.toFixed(1)}%
                        </div>
                        <div className="text-xs text-text-muted">engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Pattern Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Temas con Mejor Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patterns.filter(p => p.type === 'theme').slice(0, 8).map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                          <span className="text-sm text-text-secondary truncate">{pattern.value}</span>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-sm font-medium text-text-primary">
                            {pattern.avgEngagement.toFixed(1)}%
                          </div>
                          <div className="text-xs text-text-muted">{pattern.videoCount}v</div>
                        </div>
                      </div>
                    ))}
                    {patterns.filter(p => p.type === 'theme').length === 0 && (
                      <p className="text-sm text-text-muted text-center py-4">
                        Agrega data de temas para ver patrones
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    CTAs Más Efectivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patterns.filter(p => p.type === 'cta').slice(0, 8).map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                          <span className="text-sm text-text-secondary truncate">{pattern.value}</span>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-sm font-medium text-text-primary">
                            {pattern.avgViews.toLocaleString()}
                          </div>
                          <div className="text-xs text-text-muted">avg</div>
                        </div>
                      </div>
                    ))}
                    {patterns.filter(p => p.type === 'cta').length === 0 && (
                      <p className="text-sm text-text-muted text-center py-4">
                        Agrega data de CTAs para ver patrones
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights - Compact Version */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Insights de Contenido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.slice(0, 4).map((insight) => (
                      <div key={insight.id} className="p-4 bg-muted/20 rounded-lg border border-border/50">
                        <h4 className="font-medium text-text-primary mb-2">{insight.title}</h4>
                        <p className="text-sm text-text-secondary mb-3">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {insight.type}
                          </Badge>
                          <span className="text-xs text-text-muted">
                            {insight.confidence}% confianza
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            {advancedAnalytics.hasBrainVectors === false ? (
              <BrainIndexingPrompt 
                videoCount={videos.length}
                onIndexingComplete={() => {
                  advancedAnalytics.refreshAnalytics();
                }}
              />
            ) : (
              <>
                {/* Advanced Analytics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Viral Readiness"
                    value={`${advancedAnalytics.getViralReadinessScore()}%`}
                    change="Basado en patterns ML"
                    changeType="neutral"
                    icon={<Zap />}
                  />
                  <MetricCard
                    title="Content Diversity"
                    value={`${advancedAnalytics.getContentDiversityScore()}%`}
                    change={`${advancedAnalytics.getTopClusters().length} clusters activos`}
                    changeType="neutral"
                    icon={<Layers />}
                  />
                  <MetricCard
                    title="Optimization Opportunities"
                    value={advancedAnalytics.getOptimizationOpportunities().length.toString()}
                    change="Acciones recomendadas"
                    changeType="neutral"
                    icon={<Target />}
                  />
                </div>

                {/* Advanced Insights */}
                <AdvancedInsightsCard 
                  insights={advancedAnalytics.advancedInsights}
                  onInsightClick={(insight) => console.log('Insight clicked:', insight)}
                />

                {/* Viral Predictions */}
                <ViralPredictionsCard 
                  predictions={advancedAnalytics.viralPredictions}
                  onPredictionClick={(prediction) => console.log('Prediction clicked:', prediction)}
                />
              </>
            )}
          </TabsContent>

          {/* Clustering Tab */}
          <TabsContent value="clustering" className="space-y-6">
            {advancedAnalytics.hasBrainVectors === false ? (
              <BrainIndexingPrompt 
                videoCount={videos.length}
                onIndexingComplete={() => {
                  advancedAnalytics.refreshAnalytics();
                }}
              />
            ) : (
              <>
                {/* Cluster Analysis */}
                <ClusterAnalysisCard 
                  clusters={advancedAnalytics.clusterAnalysis}
                  onClusterClick={(cluster) => console.log('Cluster clicked:', cluster)}
                />

                {/* Performance Matrix */}
                {advancedAnalytics.performanceMatrix && (
                  <PerformanceMatrixCard matrix={advancedAnalytics.performanceMatrix} />
                )}
              </>
            )}

            {/* Timing Analysis */}
            {advancedAnalytics.timingAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Análisis de Timing Óptimo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Optimal Hours */}
                    <div>
                      <h4 className="font-medium text-text-primary mb-3">Mejores Horarios</h4>
                      <div className="space-y-2">
                        {advancedAnalytics.getOptimalPublishingHours().map((hour, index) => (
                          <div key={hour.hour} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm text-text-secondary">
                              {hour.hour}:00
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-text-muted">
                                {hour.video_count} videos
                              </div>
                              <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                                {hour.avg_performance.toFixed(0)} score
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Publishing Velocity */}
                    <div>
                      <h4 className="font-medium text-text-primary mb-3">Frecuencia de Publicación</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Actual</span>
                          <span className="font-medium text-text-primary">
                            {advancedAnalytics.timingAnalysis.publishing_velocity_analysis.current_frequency}/día
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Óptima</span>
                          <span className="font-medium text-primary">
                            {advancedAnalytics.timingAnalysis.publishing_velocity_analysis.optimal_frequency}/día
                          </span>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-sm text-blue-600">
                            {advancedAnalytics.timingAnalysis.publishing_velocity_analysis.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Analytics;