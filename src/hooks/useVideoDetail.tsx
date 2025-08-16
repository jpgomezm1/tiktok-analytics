import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { VideoExplorerData } from '@/hooks/useVideoExplorer';

export interface VideoDetailData extends VideoExplorerData {
  // Raw data is inherited from VideoExplorerData
}

export interface DerivedMetrics {
  engagement: number;
  retention: number;
  saves1k: number;
  forYouPct: number;
  f1k: number;
}

export interface Comparisons {
  vsAvg: {
    engagement: { value: number; delta: number; deltaPct: number };
    retention: { value: number; delta: number; deltaPct: number };
    saves1k: { value: number; delta: number; deltaPct: number };
    forYouPct: { value: number; delta: number; deltaPct: number };
    f1k: { value: number; delta: number; deltaPct: number };
  };
  vsTop10: {
    engagement: { value: number; delta: number; deltaPct: number };
    retention: { value: number; delta: number; deltaPct: number };
    saves1k: { value: number; delta: number; deltaPct: number };
    forYouPct: { value: number; delta: number; deltaPct: number };
    f1k: { value: number; delta: number; deltaPct: number };
  };
}

export interface VideoInsights {
  worked: string[];
  improve: string[];
  actions: string[];
}

export const useVideoDetail = (videoId: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<VideoDetailData | null>(null);
  const [derived, setDerived] = useState<DerivedMetrics | null>(null);
  const [comps, setComps] = useState<Comparisons | null>(null);
  const [insights, setInsights] = useState<VideoInsights | null>(null);

  const calculateDerived = (video: VideoDetailData): DerivedMetrics => {
    const views = video.views || 0;
    const engagement = views > 0 
      ? ((video.likes + video.comments + video.shares) / views) * 100 
      : 0;
    const retention = video.duration_seconds > 0 
      ? (video.avg_time_watched / video.duration_seconds) * 100 
      : 0;
    const saves1k = views > 0 
      ? (video.saves / views) * 1000 
      : 0;
    const forYouPct = views > 0 
      ? (video.traffic_for_you / views) * 100 
      : 0;
    const f1k = views > 0 
      ? (video.new_followers / views) * 1000 
      : 0;

    return { engagement, retention, saves1k, forYouPct, f1k };
  };

  const calculateComparisons = async (video: VideoDetailData, metrics: DerivedMetrics): Promise<Comparisons> => {
    if (!user) throw new Error('User not authenticated');

    // Get all user's videos for comparison
    const { data: allVideos } = await (supabase as any)
      .from('videos')
      .select(`
        views, likes, comments, shares, saves, new_followers,
        avg_time_watched, duration_seconds, traffic_for_you
      `)
      .eq('user_id', user.id)
      .neq('id', videoId)
      .gt('views', 0);

    if (!allVideos || allVideos.length === 0) {
      // No comparison data available
      const noData = { value: 0, delta: 0, deltaPct: 0 };
      return {
        vsAvg: {
          engagement: noData,
          retention: noData,
          saves1k: noData,
          forYouPct: noData,
          f1k: noData
        },
        vsTop10: {
          engagement: noData,
          retention: noData,
          saves1k: noData,
          forYouPct: noData,
          f1k: noData
        }
      };
    }

    // Calculate metrics for all videos
    const allMetrics = allVideos.map(v => {
      const views = v.views || 0;
      return {
        engagement: views > 0 ? ((v.likes + v.comments + v.shares) / views) * 100 : 0,
        retention: v.duration_seconds > 0 ? (v.avg_time_watched / v.duration_seconds) * 100 : 0,
        saves1k: views > 0 ? (v.saves / views) * 1000 : 0,
        forYouPct: views > 0 ? (v.traffic_for_you / views) * 100 : 0,
        f1k: views > 0 ? (v.new_followers / views) * 1000 : 0
      };
    });

    // Calculate averages
    const avgMetrics = {
      engagement: allMetrics.reduce((acc, m) => acc + m.engagement, 0) / allMetrics.length,
      retention: allMetrics.reduce((acc, m) => acc + m.retention, 0) / allMetrics.length,
      saves1k: allMetrics.reduce((acc, m) => acc + m.saves1k, 0) / allMetrics.length,
      forYouPct: allMetrics.reduce((acc, m) => acc + m.forYouPct, 0) / allMetrics.length,
      f1k: allMetrics.reduce((acc, m) => acc + m.f1k, 0) / allMetrics.length
    };

    // Calculate top 10% thresholds
    const getTop10Threshold = (metricKey: keyof typeof avgMetrics) => {
      const sorted = allMetrics.map(m => m[metricKey]).sort((a, b) => b - a);
      const top10Index = Math.floor(sorted.length * 0.1);
      return sorted[top10Index] || 0;
    };

    const top10Metrics = {
      engagement: getTop10Threshold('engagement'),
      retention: getTop10Threshold('retention'),
      saves1k: getTop10Threshold('saves1k'),
      forYouPct: getTop10Threshold('forYouPct'),
      f1k: getTop10Threshold('f1k')
    };

    // Calculate comparisons
    const createComparison = (current: number, reference: number) => ({
      value: reference,
      delta: current - reference,
      deltaPct: reference > 0 ? ((current - reference) / reference) * 100 : 0
    });

    return {
      vsAvg: {
        engagement: createComparison(metrics.engagement, avgMetrics.engagement),
        retention: createComparison(metrics.retention, avgMetrics.retention),
        saves1k: createComparison(metrics.saves1k, avgMetrics.saves1k),
        forYouPct: createComparison(metrics.forYouPct, avgMetrics.forYouPct),
        f1k: createComparison(metrics.f1k, avgMetrics.f1k)
      },
      vsTop10: {
        engagement: createComparison(metrics.engagement, top10Metrics.engagement),
        retention: createComparison(metrics.retention, top10Metrics.retention),
        saves1k: createComparison(metrics.saves1k, top10Metrics.saves1k),
        forYouPct: createComparison(metrics.forYouPct, top10Metrics.forYouPct),
        f1k: createComparison(metrics.f1k, top10Metrics.f1k)
      }
    };
  };

  const generateInsights = (video: VideoDetailData, metrics: DerivedMetrics, comparisons: Comparisons): VideoInsights => {
    const worked: string[] = [];
    const improve: string[] = [];
    const actions: string[] = [];

    // What worked (✅)
    if (metrics.retention > comparisons.vsAvg.retention.value) {
      worked.push(`Retención superior al promedio (${metrics.retention.toFixed(1)}%)`);
    }
    if (metrics.saves1k > comparisons.vsAvg.saves1k.value) {
      worked.push(`Saves por encima del promedio (${metrics.saves1k.toFixed(1)}/1k)`);
    }
    if (metrics.f1k >= comparisons.vsTop10.f1k.value) {
      worked.push(`F/1k en Top 10% - excelente conversión a seguidores (${metrics.f1k.toFixed(1)}/1k)`);
    }
    if (metrics.forYouPct > comparisons.vsAvg.forYouPct.value) {
      worked.push(`Buena distribución For You (${metrics.forYouPct.toFixed(1)}%)`);
    }
    if (video.views > 1000) {
      worked.push('Alcance significativo - contenido con tracción');
    }

    // What to improve (⚠️)
    if (metrics.retention < comparisons.vsAvg.retention.value * 0.8) {
      improve.push(`Retención baja (${metrics.retention.toFixed(1)}% vs ${comparisons.vsAvg.retention.value.toFixed(1)}% promedio)`);
    }
    if (metrics.f1k < comparisons.vsAvg.f1k.value) {
      improve.push(`F/1k por debajo del promedio - pocas conversiones a seguidores`);
    }
    if (video.duration_seconds > 40) {
      improve.push('Duración excesiva - considerar contenido más conciso');
    }
    if (metrics.forYouPct < 30) {
      improve.push('Baja distribución For You - mejorar engagement inicial');
    }

    // SOS Actions (🚀) - Always provide actionable advice
    if (metrics.f1k < comparisons.vsAvg.f1k.value) {
      actions.push('CTA de follow en los primeros 2-3 segundos del video');
      actions.push('Incluir promesa explícita de valor futuro ("Sígueme para más tips como este")');
    }
    
    if (metrics.retention < 40) {
      actions.push('Primer frame más expresivo y llamativo');
      actions.push('Cambio de ritmo cada 3-5 segundos para mantener atención');
    }
    
    if (video.duration_seconds > 30 && metrics.retention < 50) {
      actions.push('Recortar contenido - eliminar segundos innecesarios');
    }
    
    // Always provide at least one action
    if (actions.length === 0) {
      actions.push('Experimentar con hooks de pregunta directa al espectador');
      actions.push('Probar CTA de follow más temprano en futuros videos');
      actions.push('Analizar momento exacto donde se pierde retención');
    }

    return { worked, improve, actions };
  };

  const loadVideoDetail = async () => {
    if (!user || !videoId) return;

    setLoading(true);
    try {
      const { data: videoData, error } = await (supabase as any)
        .from('videos')
        .select(`
          id, title, image_url, video_url, views, likes, comments, shares, saves, new_followers,
          avg_time_watched, duration_seconds, traffic_for_you, traffic_profile,
          traffic_hashtag, traffic_sound, traffic_search, published_date,
          hook, guion, video_type
        `)
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single();

      if (error || !videoData) {
        throw new Error('Video not found');
      }

      // Convert to VideoDetailData format
      const video: VideoDetailData = {
        ...videoData,
        engagement_rate: 0, // Will be calculated
        retention_rate: 0,
        saves_per_1k: 0,
        for_you_percentage: 0,
        f_per_1k: 0,
        performance_score: 0,
        retention_percentile: 0,
        saves_percentile: 0,
        for_you_percentile: 0,
        engagement_percentile: 0,
        f_per_1k_percentile: 0
      };

      const derivedMetrics = calculateDerived(video);
      const comparisons = await calculateComparisons(video, derivedMetrics);
      const videoInsights = generateInsights(video, derivedMetrics, comparisons);

      setRaw(video);
      setDerived(derivedMetrics);
      setComps(comparisons);
      setInsights(videoInsights);
    } catch (error) {
      console.error('Error loading video detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideoDetail();
  }, [user, videoId]);

  return {
    loading,
    raw,
    derived,
    comps,
    insights,
    refresh: loadVideoDetail
  };
};