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
import { TopBottomChart } from '@/components/TopBottomChart';
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
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    topVsBottom: { top: [], bottom: [] },
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
          topVsBottom,
          trafficDonut
        ] = await Promise.all([
          kpis.followersNow(),
          kpis.newFollowers(selectedPeriod),
          kpis.retentionAvg(selectedPeriod),
          kpis.savesPer1K(selectedPeriod),
          kpis.forYouShare(selectedPeriod),
          kpis.initialVelocity(selectedPeriod),
          kpis.charts.followersTrend(selectedPeriod),
          kpis.charts.topVsBottom(selectedPeriod),
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
          topVsBottom,
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
      <div className="space-y-xl">
        <div className="flex justify-end">
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <KPIGridSkeleton count={6} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          <div className="lg:col-span-3">
            <VideoGridSkeleton count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {/* Page Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-lg mb-xl">
        <div className="flex items-center space-x-md" data-tour="period-selector">
          <PeriodSelector 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={handlePeriodChange}
          />
          <TourTrigger onStartTour={() => setShowTour(true)} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGlossary(true)}
            className="text-text-secondary border-border hover:bg-muted"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            ¿Qué significa?
          </Button>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center space-x-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddVideo(true)}
          className="text-text-secondary border-border hover:bg-muted"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Agregar Video</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCSVImport(true)}
          className="text-text-secondary border-border hover:bg-muted"
        >
          <Upload className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Importar CSV</span>
        </Button>
      </div>

      {/* Empty States */}
      {!hasFollowersData && !hasVideosData ? (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Configura tu Dashboard de KPIs
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Registra tus seguidores e importa tus videos para desbloquear métricas accionables que impulsen tu crecimiento.
          </p>
          <div className="space-y-4">
            <FollowersUpdateForm />
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setShowAddVideo(true)}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Video
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCSVImport(true)}
                className="border-border text-text-secondary"
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
            <Card className="bg-card border-border shadow-card border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary mb-1">
                      Registra tus seguidores de hoy
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Para activar los KPIs de seguidores, necesitas registrar tu count actual.
                    </p>
                    <FollowersUpdateForm />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg" data-tour="kpis-grid">
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
            
            <KPICard
              title="Velocidad inicial"
              value={kpiData.initialVelocity?.value || 100}
              deltaAbs={kpiData.initialVelocity?.deltaAbs || 0}
              deltaPct={kpiData.initialVelocity?.deltaPct || 0}
              icon={<Zap />}
              tooltip="Proxy de velocidad inicial vs histórico"
              format="percentage"
              loading={!kpiData.initialVelocity}
              disabled={true} // Always disabled as it's a proxy
              onInfoClick={() => setShowGlossary(true)}
            />
          </div>

          {/* Charts Section */}
          {hasVideosData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl" data-tour="viral-videos">
              {/* Followers Trend */}
              <FollowersChart data={chartsData.followersTrend} loading={loading} />
              
              {/* Top vs Bottom Performance */}
              <TopBottomChart data={chartsData.topVsBottom} loading={loading} />
              
              {/* Traffic Sources */}
              <TrafficDonutChart data={chartsData.trafficDonut} loading={loading} />
            </div>
          )}

          {/* Recent Videos - Only show if has videos but no specific message needed */}
          {hasVideosData && analytics && analytics.recentVideos.length > 0 && (
            <Card className="bg-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-text-primary">Videos Recientes</CardTitle>
                <CardDescription className="text-text-secondary">
                  Rendimiento de tu contenido más reciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg" data-tour="ai-insights">
                  {analytics.recentVideos.slice(0, 6).map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </CardContent>
            </Card>
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
  );
};

export default Dashboard;