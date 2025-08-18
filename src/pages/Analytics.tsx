import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideos } from "@/hooks/useVideos";
import { useAuth } from "@/hooks/useAuth";
import { useKPIs, Period } from "@/hooks/useKPIs";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { AnalyticsEngine } from "@/utils/analyticsEngine";

// Componentes modularizados
import HeaderControls from "./AnalyticsComponents/HeaderControls";
import EmptyState from "./AnalyticsComponents/EmptyState";
import OverviewTab from "./AnalyticsComponents/OverviewTab";
import MetricsTab from "./AnalyticsComponents/MetricsTab";
import PerformanceTab from "./AnalyticsComponents/PerformanceTab";
import AdvancedTabs from "./AnalyticsComponents/AdvancedTabs";

const Analytics = () => {
  const { videos, analytics, loading } = useVideos();
  const { user } = useAuth();
  const kpis = useKPIs();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("30d");
  const [topBottomData, setTopBottomData] = useState<{ top: any[]; bottom: any[] }>({ top: [], bottom: [] });

  // Engine y derivados
  const aiEngine = useMemo(() => new AnalyticsEngine(videos), [videos]);
  const performanceScores = useMemo(() => aiEngine.calculatePerformanceScores(), [aiEngine]);
  const insights = useMemo(() => aiEngine.generateInsights(), [aiEngine]);
  const patterns = useMemo(() => aiEngine.analyzeContentPatterns(), [aiEngine]);

  const advancedAnalytics = useAdvancedAnalytics(videos);

  // Carga Top vs Bottom por período
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const topBottom = await kpis.charts.topVsBottom(selectedPeriod);
        setTopBottomData(topBottom);
      } catch (error) {
        console.error("Error loading top/bottom data:", error);
        setTopBottomData({ top: [], bottom: [] });
      }
    };
    loadData();
  }, [user, selectedPeriod, kpis.charts]);

  const handlePeriodChange = (period: Period) => setSelectedPeriod(period);

  // Cálculos agregados por período (mantengo la lógica original)
  const analyticsData = useMemo(() => {
    const periodDays = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const periodVideos = videos.filter((video: any) => new Date(video.published_date) >= cutoffDate);

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
        retentionBreakdown: { excellent: 0, good: 0, average: 0, poor: 0, critical: 0 },
        contentTypeBreakdown: [],
        weeklyTrends: [],
      };
    }

    const totals = periodVideos.reduce(
      (acc: any, video: any) => {
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
          totalWatchTime: acc.totalWatchTime + avgTime * views,
          totalDuration: acc.totalDuration + duration * views,
          totalForYouTraffic: acc.totalForYouTraffic + forYouTraffic,
          videoCount: acc.videoCount + 1,
        };
      },
      {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
        totalFollowers: 0,
        totalWatchTime: 0,
        totalDuration: 0,
        totalForYouTraffic: 0,
        videoCount: 0,
      }
    );

    const avgEngagement =
      totals.totalViews > 0 ? ((totals.totalLikes + totals.totalComments + totals.totalShares) / totals.totalViews) * 100 : 0;
    const avgRetention = totals.totalDuration > 0 ? (totals.totalWatchTime / totals.totalDuration) * 100 : 0;
    const avgSavesPer1K = totals.totalViews > 0 ? (totals.totalSaves / totals.totalViews) * 1000 : 0;
    const avgForYouTraffic = totals.totalViews > 0 ? (totals.totalForYouTraffic / totals.totalViews) * 100 : 0;

    const videosWithScore = periodVideos.map((video: any) => ({
      ...video,
      score: video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views) * 100 : 0,
    }));
    const bestVideo =
      videosWithScore.length > 0 ? videosWithScore.reduce((best: any, cur: any) => (cur.score > best.score ? cur : best)) : null;
    const worstVideo =
      videosWithScore.length > 0 ? videosWithScore.reduce((worst: any, cur: any) => (cur.score < worst.score ? cur : worst)) : null;

    const timelineData: any[] = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayVideos = periodVideos.filter((v: any) => v.published_date === dateStr);
      const dayTotals = dayVideos.reduce(
        (acc: any, v: any) => ({
          views: acc.views + (v.views || 0),
          engagement: acc.engagement + ((v.likes || 0) + (v.comments || 0) + (v.shares || 0)),
          saves: acc.saves + (v.saves || 0),
          followers: acc.followers + (v.new_followers || 0),
        }),
        { views: 0, engagement: 0, saves: 0, followers: 0 }
      );
      timelineData.push({
        date: date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        views: dayTotals.views,
        engagement: dayTotals.views > 0 ? (dayTotals.engagement / dayTotals.views) * 100 : 0,
        saves: dayTotals.saves,
        followers: dayTotals.followers,
      });
    }

    const correlationData = periodVideos
      .map((v: any) => {
        const retention = v.duration_seconds > 0 ? (v.avg_time_watched / v.duration_seconds) * 100 : 0;
        return {
          title: (v.title?.substring(0, 20) || "Sin título") + "...",
          retention,
          savesPer1K: v.views > 0 ? (v.saves / v.views) * 1000 : 0,
          views: v.views || 0,
          duration: v.duration_seconds || 0,
          forYouPct: v.views > 0 ? (v.traffic_for_you / v.views) * 100 : 0,
          engagement: v.views > 0 ? ((v.likes + v.comments + v.shares) / v.views) * 100 : 0,
        };
      })
      .filter((x: any) => x.views > 0);

    const hourlyPerformance = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      videos: [] as any[],
      totalViews: 0,
      totalEngagement: 0,
      totalSaves: 0,
      totalFollows: 0,
      totalComments: 0,
      totalShares: 0,
    }));

    periodVideos.forEach((video: any) => {
      let publishedHour = 0;
      if (video.published_date) {
        const publishedDate = new Date(video.published_date + "T00:00:00");
        if (video.published_time) {
          publishedHour = parseInt(video.published_time.split(":")[0], 10);
        } else {
          const videoScore = (video.views || 0) + (video.likes || 0) * 10 + (video.comments || 0) * 15;
          const daysSinceEpoch = Math.floor(publishedDate.getTime() / 86_400_000);
          const seed = (videoScore + daysSinceEpoch + (video.id ? video.id.charCodeAt(0) : 0)) % 100;
          if (seed < 25) publishedHour = 19;
          else if (seed < 40) publishedHour = 20;
          else if (seed < 55) publishedHour = 21;
          else if (seed < 65) publishedHour = 13;
          else if (seed < 75) publishedHour = 18;
          else if (seed < 80) publishedHour = 22;
          else if (seed < 85) publishedHour = 12;
          else if (seed < 90) publishedHour = 14;
          else publishedHour = Math.floor(seed / 4);
        }
      } else {
        const performance = (video.views || 0) + (video.likes || 0) * 5;
        publishedHour = 18 + (performance % 6);
      }
      publishedHour = Math.max(0, Math.min(23, publishedHour));
      const engagement = video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views) * 100 : 0;
      const hourData = hourlyPerformance[publishedHour];
      hourData.videos.push(video);
      hourData.totalViews += video.views || 0;
      hourData.totalEngagement += engagement;
      hourData.totalSaves += video.saves || 0;
      hourData.totalFollows += video.new_followers || 0;
      hourData.totalComments += video.comments || 0;
      hourData.totalShares += video.shares || 0;
    });

    const hourlyData = hourlyPerformance
      .map((h) => {
        const videoCount = h.videos.length;
        if (videoCount === 0)
          return {
            hour: `${h.hour.toString().padStart(2, "0")}:00`,
            avgViews: 0,
            avgEngagement: 0,
            videoCount: 0,
            totalViews: 0,
            avgSaves: 0,
            avgFollows: 0,
            avgComments: 0,
            avgShares: 0,
            performanceScore: 0,
            isEmpty: true,
          };
        const avgViews = Math.round(h.totalViews / videoCount);
        const avgEngagement = Number((h.totalEngagement / videoCount).toFixed(1));
        const avgSaves = Number((h.totalSaves / videoCount).toFixed(1));
        const avgFollows = Number((h.totalFollows / videoCount).toFixed(1));
        const avgComments = Number((h.totalComments / videoCount).toFixed(1));
        const avgShares = Number((h.totalShares / videoCount).toFixed(1));
        const performanceScore =
          avgViews * 0.3 + avgEngagement * 1000 * 0.25 + avgSaves * 100 * 0.2 + avgComments * 50 * 0.15 + avgShares * 80 * 0.1;

        return {
          hour: `${h.hour.toString().padStart(2, "0")}:00`,
          avgViews,
          avgEngagement,
          videoCount,
          totalViews: h.totalViews,
          avgSaves,
          avgFollows,
          avgComments,
          avgShares,
          performanceScore: Math.round(performanceScore),
          isEmpty: false,
        };
      })
      .filter((x) => !x.isEmpty)
      .sort((a, b) => b.performanceScore - a.performanceScore);

    const durationPerformanceData = periodVideos
      .map((v: any) => ({
        duration: v.duration_seconds || 0,
        views: v.views || 0,
        engagement: v.views > 0 ? ((v.likes + v.comments + v.shares) / v.views) * 100 : 0,
        saves: v.views > 0 ? (v.saves / v.views) * 1000 : 0,
        title: (v.title?.substring(0, 15) || "Sin título") + "...",
      }))
      .filter((x: any) => x.duration > 0 && x.views > 0);

    const velocityData = periodVideos
      .map((v: any) => {
        const daysSincePublished = Math.max(1, Math.floor((Date.now() - new Date(v.published_date).getTime()) / 86_400_000));
        const dailyVelocity = (v.views || 0) / daysSincePublished;
        return {
          title: (v.title?.substring(0, 20) || "Sin título") + "...",
          velocity: Math.round(dailyVelocity),
          totalViews: v.views || 0,
          daysOld: daysSincePublished,
          engagement: v.views > 0 ? ((v.likes + v.comments + v.shares) / v.views) * 100 : 0,
        };
      })
      .filter((x: any) => x.totalViews > 0)
      .sort((a: any, b: any) => b.velocity - a.velocity);

    const trafficData = [
      { name: "For You", value: totals.totalForYouTraffic, color: "#8B5CF6" },
      { name: "Perfil", value: periodVideos.reduce((s: number, v: any) => s + (v.traffic_profile || 0), 0), color: "#3B82F6" },
      { name: "Hashtag", value: periodVideos.reduce((s: number, v: any) => s + (v.traffic_hashtag || 0), 0), color: "#10B981" },
      { name: "Audio", value: periodVideos.reduce((s: number, v: any) => s + (v.traffic_sound || 0), 0), color: "#F59E0B" },
      { name: "Búsqueda", value: periodVideos.reduce((s: number, v: any) => s + (v.traffic_search || 0), 0), color: "#EF4444" },
    ].filter((i) => i.value > 0);

    const retentionBreakdown = periodVideos.reduce(
      (acc: any, v: any) => {
        const r = v.duration_seconds > 0 ? (v.avg_time_watched / v.duration_seconds) * 100 : 0;
        if (r >= 80) acc.excellent++;
        else if (r >= 60) acc.good++;
        else if (r >= 40) acc.average++;
        else if (r >= 20) acc.poor++;
        else acc.critical++;
        return acc;
      },
      { excellent: 0, good: 0, average: 0, poor: 0, critical: 0 }
    );

    const ctMap = periodVideos.reduce((acc: any, v: any) => {
      const type = v.video_type || "Sin categorizar";
      if (!acc[type]) acc[type] = { count: 0, avgViews: 0, totalViews: 0, avgEngagement: 0, totalEngagement: 0 };
      acc[type].count++;
      acc[type].totalViews += v.views || 0;
      const engagement = v.views > 0 ? ((v.likes + v.comments + v.shares) / v.views) * 100 : 0;
      acc[type].totalEngagement += engagement;
      return acc;
    }, {});
    Object.keys(ctMap).forEach((t) => {
      ctMap[t].avgViews = ctMap[t].totalViews / ctMap[t].count;
      ctMap[t].avgEngagement = ctMap[t].totalEngagement / ctMap[t].count;
    });

    const weeklyTrends: any[] = [];
    const weeksToShow = Math.min(Math.floor(periodDays / 7), 8);
    for (let week = 0; week < weeksToShow; week++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (week + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - week * 7);
      const weekVideos = periodVideos.filter((v: any) => {
        const d = new Date(v.published_date);
        return d >= weekStart && d < weekEnd;
      });
      if (weekVideos.length > 0) {
        const w = weekVideos.reduce(
          (acc: any, v: any) => ({
            views: acc.views + (v.views || 0),
            engagement: acc.engagement + ((v.likes || 0) + (v.comments || 0) + (v.shares || 0)),
            saves: acc.saves + (v.saves || 0),
            followers: acc.followers + (v.new_followers || 0),
            videos: acc.videos + 1,
          }),
          { views: 0, engagement: 0, saves: 0, followers: 0, videos: 0 }
        );
        weeklyTrends.unshift({
          week: `Sem ${weeksToShow - week}`,
          avgViews: Math.round(w.views / w.videos),
          avgEngagement: w.views > 0 ? (w.engagement / w.views) * 100 : 0,
          totalSaves: w.saves,
          totalFollowers: w.followers,
          videoCount: w.videos,
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
      hourlyData,
      durationPerformanceData,
      velocityData: velocityData.slice(0, 10),
      retentionBreakdown,
      contentTypeBreakdown: Object.entries(ctMap).map(([type, data]: any) => ({ type, ...data })),
      weeklyTrends,
    };
  }, [videos, selectedPeriod]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header skeleton */}
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  <div className="h-10 w-80 bg-gradient-to-r from-muted/50 to-muted/30 animate-pulse rounded-xl"></div>
                  <div className="h-5 w-96 bg-muted/30 animate-pulse rounded-lg"></div>
                </div>
                <div className="h-16 w-64 bg-muted/50 animate-pulse rounded-xl mt-4 sm:mt-0"></div>
              </div>
              <div className="h-16 bg-muted/30 animate-pulse rounded-xl"></div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex justify-center">
              <div className="h-14 w-[600px] bg-muted/50 animate-pulse rounded-xl"></div>
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-gradient-to-br from-muted/30 to-muted/10 animate-pulse rounded-xl" />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gradient-to-br from-muted/30 to-muted/10 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <HeaderControls selectedPeriod={selectedPeriod} onChangePeriod={handlePeriodChange} />

          {videos.length === 0 ? (
            <EmptyState />
          ) : (
            <Tabs defaultValue="overview" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-5 bg-muted/50 backdrop-blur-sm p-1 rounded-xl shadow-lg w-fit">
                  <TabsTrigger 
                    value="overview"
                    className="px-6 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    Resumen
                  </TabsTrigger>
                  <TabsTrigger 
                    value="metrics"
                    className="px-6 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    Métricas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performance"
                    className="px-6 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    Rendimiento
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comparatives"
                    className="px-6 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    Comparativas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timing"
                    className="px-6 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    Timing
                  </TabsTrigger>
                </TabsList>
              </div>

              <OverviewTab
                analyticsData={analyticsData}
                advancedAnalytics={advancedAnalytics}
                insights={insights}
                performanceScores={performanceScores}
              />

              <MetricsTab analyticsData={analyticsData} />

              <PerformanceTab
                analyticsData={analyticsData}
                topBottomData={topBottomData}
                performanceScores={performanceScores}
              />

              <AdvancedTabs tab="comparatives" analyticsData={analyticsData} videos={videos} selectedPeriod={selectedPeriod} />
              <AdvancedTabs tab="timing" analyticsData={analyticsData} />
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;