import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/VideoCard';
import { CSVImportModal } from '@/components/CSVImportModal';
import { FollowersUpdateForm } from '@/components/FollowersUpdateForm';
import { KPICard } from '@/components/KPICard';
import { KPIGlossary } from '@/components/KPIGlossary';
import { PeriodSelector } from '@/components/PeriodSelector';
import { FollowersChart } from '@/components/FollowersChart';
import { TrafficDonutChart } from '@/components/TrafficDonutChart';
import { DashboardTour, TourTrigger } from '@/components/tours/DashboardTour';
import { KPIGridSkeleton } from '@/components/skeletons/KPISkeleton';
import { VideoGridSkeleton } from '@/components/skeletons/VideoCardSkeleton';
import { useToast } from '@/hooks/use-toast';
import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/hooks/useAuth';
import { useFollowers } from '@/hooks/useFollowers';
import { useKPIs, Period, KPIValue } from '@/hooks/useKPIs';
import { 
  Users, 
  UserPlus,
  Clock,
  Heart,
  TrendingUp, 
  Plus, 
  BarChart3, 
  Upload,
  Zap,
  HelpCircle,
  Activity,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { analytics, loading: videosLoading, videos, addVideo } = useVideos();
  const { user, signOut } = useAuth();
  const { latestCount: followersCount } = useFollowers();
  const kpis = useKPIs();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');
  
  // KPI states
  const [kpiData, setKpiData] = useState<{
    followersNow: KPIValue | null;
    newFollowers: KPIValue | null;
    retentionAvg: KPIValue | null;
    savesPer1K: KPIValue | null;
    forYouShare: KPIValue | null;
    initialVelocity: KPIValue | null;
  }>({
    followersNow: null,
    newFollowers: null,
    retentionAvg: null,
    savesPer1K: null,
    forYouShare: null,
    initialVelocity: null
  });

  const [chartsData, setChartsData] = useState({
    followersTrend: [],
    trafficDonut: []
  });

  const [loading, setLoading] = useState(true);

  // Load KPI data
  useEffect(() => {
    const loadKPIData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [
          followersNowData,
          newFollowersData,
          retentionAvgData,
          savesPer1KData,
          forYouShareData,
          initialVelocityData,
          followersTrend,
          trafficDonut
        ] = await Promise.all([
          kpis.followersNow(),
          kpis.newFollowers(selectedPeriod),
          kpis.retentionAvg(selectedPeriod),
          kpis.savesPer1K(selectedPeriod),
          kpis.forYouShare(selectedPeriod),
          kpis.initialVelocity(selectedPeriod),
          kpis.charts.followersTrend(selectedPeriod),
          kpis.charts.trafficDonut(selectedPeriod)
        ]);

        setKpiData({
          followersNow: followersNowData,
          newFollowers: newFollowersData,
          retentionAvg: retentionAvgData,
          savesPer1K: savesPer1KData,
          forYouShare: forYouShareData,
          initialVelocity: initialVelocityData
        });

        setChartsData({
          followersTrend,
          trafficDonut
        });
      } catch (error) {
        console.error('Error loading KPI data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKPIData();
  }, [user, selectedPeriod]);

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
    info({
      title: `Período actualizado a ${period === '7d' ? '7 días' : period === '30d' ? '30 días' : '90 días'}`,
      description: 'Los KPIs se están recalculando...'
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const hasFollowersData = followersCount !== null && followersCount > 0;
  const hasVideosData = analytics && analytics.totalVideos > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-96 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-10 w-10 bg-muted animate-pulse rounded"></div>
                  <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-28 bg-muted animate-pulse rounded"></div>
                <div className="h-10 w-28 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
            <KPIGridSkeleton count={6} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <VideoGridSkeleton count={6} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Enhanced Header Section */}
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-primary rounded-xl shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                      Analytics Dashboard
                    </h1>
                    <p className="text-text-secondary flex items-center space-x-2">
                      <span>Insights y métricas de rendimiento en tiempo real</span>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-500 font-medium">Live</span>
                      </div>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Controls */}
              <div className="flex items-center space-x-3 mt-4 sm:mt-0" data-tour="period-selector">
                <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border rounded-xl px-3 py-2">
                  <PeriodSelector 
                    selectedPeriod={selectedPeriod} 
                    onPeriodChange={handlePeriodChange}
                  />
                </div>
                <TourTrigger onStartTour={() => setShowTour(true)} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGlossary(true)}
                  className="text-text-secondary border-border hover:bg-muted hover:border-purple-bright/30 transition-all duration-200 backdrop-blur-sm bg-card/50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  ¿Qué significa?
                </Button>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddVideo(true)}
                className="text-text-secondary border-border hover:bg-muted hover:border-purple-bright/30 transition-all duration-200 backdrop-blur-sm bg-card/50 hover:shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Agregar Video</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCSVImport(true)}
                className="text-text-secondary border-border hover:bg-muted hover:border-purple-bright/30 transition-all duration-200 backdrop-blur-sm bg-card/50 hover:shadow-lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Importar CSV</span>
              </Button>
            </div>
          </div>

          {/* Empty States */}
          {!hasFollowersData && !hasVideosData ? (
            <div className="max-w-3xl mx-auto text-center py-16">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Configura tu Dashboard de KPIs
              </h2>
              <p className="text-xl text-text-secondary mb-12 leading-relaxed">
                Registra tus seguidores e importa tus videos para desbloquear métricas accionables que impulsen tu crecimiento.
              </p>
              <div className="space-y-6">
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                  <FollowersUpdateForm />
                </div>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => setShowAddVideo(true)}
                    className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Video
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCSVImport(true)}
                    className="border-border text-text-secondary hover:bg-muted hover:border-purple-bright/30 transition-all duration-200 px-8 py-3"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {!hasFollowersData && (
                <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl border-l-4 border-l-yellow-500 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-yellow-500/20 rounded-xl">
                        <Users className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary mb-2 text-lg">
                          Registra tus seguidores de hoy
                        </h3>
                        <p className="text-text-secondary mb-6 leading-relaxed">
                          Para activar los KPIs de seguidores, necesitas registrar tu count actual.
                        </p>
                        <div className="bg-card/50 rounded-xl p-4">
                          <FollowersUpdateForm />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced KPIs Grid */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-text-primary">Métricas Clave</h2>
                  <div className="h-1 flex-1 bg-gradient-to-r from-purple-bright/50 to-transparent rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="kpis-grid">
                  <div className="transform hover:scale-105 transition-all duration-200">
                    <KPICard
                      title="Seguidores actuales"
                      value={kpiData.followersNow?.value || 0}
                      deltaAbs={kpiData.followersNow?.deltaAbs || 0}
                      deltaPct={kpiData.followersNow?.deltaPct || 0}
                      icon={<Users />}
                      tooltip="Último registro en tu historial de seguidores"
                      loading={!kpiData.followersNow}
                      onInfoClick={() => setShowGlossary(true)}
                    />
                  </div>
                  
                  <div className="transform hover:scale-105 transition-all duration-200">
                    <KPICard
                      title="Nuevos seguidores (hoy)"
                      value={kpiData.newFollowers?.value || 0}
                      deltaAbs={kpiData.newFollowers?.deltaAbs || 0}
                      deltaPct={kpiData.newFollowers?.deltaPct || 0}
                      icon={<UserPlus />}
                      tooltip="Diferencia de seguidores entre hoy y ayer"
                      loading={!kpiData.newFollowers}
                      onInfoClick={() => setShowGlossary(true)}
                    />
                  </div>
                  
                  <div className="transform hover:scale-105 transition-all duration-200">
                    <KPICard
                      title="Retención media"
                      value={kpiData.retentionAvg?.value || 0}
                      deltaAbs={kpiData.retentionAvg?.deltaAbs || 0}
                      deltaPct={kpiData.retentionAvg?.deltaPct || 0}
                      icon={<Clock />}
                      tooltip="Porcentaje promedio de video que ven los usuarios"
                      format="percentage"
                      loading={!kpiData.retentionAvg}
                      disabled={!hasVideosData}
                      onInfoClick={() => setShowGlossary(true)}
                    />
                  </div>
                  
                  <div className="transform hover:scale-105 transition-all duration-200">
                    <KPICard
                      title="Saves por 1K vistas"
                      value={kpiData.savesPer1K?.value || 0}
                      deltaAbs={kpiData.savesPer1K?.deltaAbs || 0}
                      deltaPct={kpiData.savesPer1K?.deltaPct || 0}
                      icon={<Heart />}
                      tooltip="Saves por cada 1,000 vistas - indicador de valor"
                      format="decimal"
                      loading={!kpiData.savesPer1K}
                      disabled={!hasVideosData}
                      onInfoClick={() => setShowGlossary(true)}
                    />
                  </div>
                  
                  <div className="transform hover:scale-105 transition-all duration-200">
                    <KPICard
                      title="% For You"
                      value={kpiData.forYouShare?.value || 0}
                      deltaAbs={kpiData.forYouShare?.deltaAbs || 0}
                      deltaPct={kpiData.forYouShare?.deltaPct || 0}
                      icon={<TrendingUp />}
                      tooltip="Porcentaje de vistas del feed principal For You"
                      format="percentage"
                      loading={!kpiData.forYouShare}
                      disabled={!hasVideosData}
                      onInfoClick={() => setShowGlossary(true)}
                    />
                  </div>
                  
                  <div className="transform hover:scale-105 transition-all duration-200">
                    <KPICard
                      title="Velocidad inicial"
                      value={kpiData.initialVelocity?.value || 100}
                      deltaAbs={kpiData.initialVelocity?.deltaAbs || 0}
                      deltaPct={kpiData.initialVelocity?.deltaPct || 0}
                      icon={<Zap />}
                      tooltip="Proxy de velocidad inicial vs histórico"
                      format="percentage"
                      loading={!kpiData.initialVelocity}
                      disabled={true}
                      onInfoClick={() => setShowGlossary(true)}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Charts Section */}
              {hasVideosData && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-text-primary">Tendencias</h2>
                    <div className="h-1 flex-1 bg-gradient-to-r from-blue-500/50 to-transparent rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-tour="viral-videos">
                    <div className="transform hover:scale-[1.02] transition-all duration-300">
                      <FollowersChart data={chartsData.followersTrend} loading={loading} />
                    </div>
                    
                    <div className="transform hover:scale-[1.02] transition-all duration-300">
                      <TrafficDonutChart data={chartsData.trafficDonut} loading={loading} />
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Recent Videos */}
              {hasVideosData && analytics && analytics.recentVideos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-text-primary">Videos Recientes</h2>
                    <div className="h-1 flex-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-full"></div>
                  </div>
                  <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-text-primary flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Rendimiento Reciente</span>
                      </CardTitle>
                      <CardDescription className="text-text-secondary">
                        Análisis del contenido más reciente y su performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="ai-insights">
                        {analytics.recentVideos.slice(0, 6).map((video, index) => (
                          <div 
                            key={video.id}
                            className="transform hover:scale-105 transition-all duration-200"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <VideoCard video={video} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Glossary Panel */}
          <KPIGlossary open={showGlossary} onClose={() => setShowGlossary(false)} />

          {/* Tour */}
          <DashboardTour
            isActive={showTour}
            onComplete={() => setShowTour(false)}
            onSkip={() => setShowTour(false)}
          />

          {/* Modals */}
          <CSVImportModal
            open={showCSVImport}
            onClose={() => setShowCSVImport(false)}
            onImport={async (videosData) => {
              for (const video of videosData) {
                await addVideo(video);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;