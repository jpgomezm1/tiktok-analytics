import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type Period = '7d' | '30d' | '90d';

export interface KPIValue {
  value: number;
  deltaAbs: number;
  deltaPct: number;
  spark: Array<{ x: string; y: number }>;
}

export interface VideoAggregation {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  total_new_followers: number;
  total_traffic_for_you: number;
  total_traffic_profile: number;
  total_traffic_hashtag: number;
  total_traffic_sound: number;
  total_traffic_search: number;
  weighted_avg_time: number;
  weighted_duration: number;
  video_count: number;
}

export interface TopBottomItem {
  id: string;
  title: string;
  retention: number;
  savesPer1k: number;
  views: number;
}

export const useKPIs = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getDaysFromPeriod = (period: Period): number => {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  const getVideoAggregation = async (period: Period): Promise<VideoAggregation> => {
    if (!user) throw new Error('User not authenticated');

    const days = getDaysFromPeriod(period);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await (supabase as any)
      .from('videos')
      .select(`
        views, likes, comments, shares, saves, new_followers,
        traffic_for_you, traffic_profile, traffic_hashtag, traffic_sound, traffic_search,
        avg_time_watched, duration_seconds, total_time_watched
      `)
      .eq('user_id', user.id)
      .gte('published_date', fromDate.toISOString().split('T')[0]);

    if (error) throw error;

    const videos = data || [];
    
    const totals = videos.reduce((acc, video) => {
      const views = video.views || 0;
      const avgTime = video.avg_time_watched || 0;
      const duration = video.duration_seconds || 1;

      return {
        total_views: acc.total_views + views,
        total_likes: acc.total_likes + (video.likes || 0),
        total_comments: acc.total_comments + (video.comments || 0),
        total_shares: acc.total_shares + (video.shares || 0),
        total_saves: acc.total_saves + (video.saves || 0),
        total_new_followers: acc.total_new_followers + (video.new_followers || 0),
        total_traffic_for_you: acc.total_traffic_for_you + (video.traffic_for_you || 0),
        total_traffic_profile: acc.total_traffic_profile + (video.traffic_profile || 0),
        total_traffic_hashtag: acc.total_traffic_hashtag + (video.traffic_hashtag || 0),
        total_traffic_sound: acc.total_traffic_sound + (video.traffic_sound || 0),
        total_traffic_search: acc.total_traffic_search + (video.traffic_search || 0),
        weighted_avg_time: acc.weighted_avg_time + (avgTime * views),
        weighted_duration: acc.weighted_duration + (duration * views),
        video_count: acc.video_count + 1
      };
    }, {
      total_views: 0, total_likes: 0, total_comments: 0, total_shares: 0, total_saves: 0, total_new_followers: 0,
      total_traffic_for_you: 0, total_traffic_profile: 0, total_traffic_hashtag: 0,
      total_traffic_sound: 0, total_traffic_search: 0,
      weighted_avg_time: 0, weighted_duration: 0, video_count: 0
    });

    return totals;
  };

  const followersNow = async (): Promise<KPIValue> => {
    if (!user) throw new Error('User not authenticated');

    // Get current followers count
    const { data: current } = await (supabase as any)
      .from('followers_history')
      .select('followers_count, entry_date')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get count from 7 days ago for delta
    const date7d = new Date();
    date7d.setDate(date7d.getDate() - 7);
    
    const { data: previous } = await (supabase as any)
      .from('followers_history')
      .select('followers_count')
      .eq('user_id', user.id)
      .lte('entry_date', date7d.toISOString().split('T')[0])
      .order('entry_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get spark data (last 30 days)
    const { data: sparkData } = await (supabase as any)
      .from('followers_history')
      .select('entry_date, followers_count')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: true })
      .limit(30);

    const currentCount = current?.followers_count || 0;
    const previousCount = previous?.followers_count || currentCount;
    const deltaAbs = currentCount - previousCount;
    const deltaPct = previousCount > 0 ? (deltaAbs / previousCount) * 100 : 0;

    const spark = (sparkData || []).map(item => ({
      x: item.entry_date,
      y: item.followers_count
    }));

    return { value: currentCount, deltaAbs, deltaPct, spark };
  };

  const followersYield = async (period: Period): Promise<KPIValue> => {
    const currentAgg = await getVideoAggregation(period);
    const days = getDaysFromPeriod(period);
    
    // Get previous period for comparison
    const previousFromDate = new Date();
    previousFromDate.setDate(previousFromDate.getDate() - (days * 2));
    const previousToDate = new Date();
    previousToDate.setDate(previousToDate.getDate() - days);

    const { data: previousData } = await (supabase as any)
      .from('videos')
      .select('views, new_followers')
      .eq('user_id', user.id)
      .gte('published_date', previousFromDate.toISOString().split('T')[0])
      .lt('published_date', previousToDate.toISOString().split('T')[0]);

    const previousAgg = (previousData || []).reduce((acc, video) => ({
      total_views: acc.total_views + (video.views || 0),
      total_new_followers: acc.total_new_followers + (video.new_followers || 0)
    }), { total_views: 0, total_new_followers: 0 });

    const value = currentAgg.total_views > 0 
      ? (currentAgg.total_new_followers / currentAgg.total_views) * 1000 
      : 0;

    const previousValue = previousAgg.total_views > 0 
      ? (previousAgg.total_new_followers / previousAgg.total_views) * 1000 
      : value;

    const deltaAbs = value - previousValue;
    const deltaPct = previousValue > 0 ? (deltaAbs / previousValue) * 100 : 0;

    return { value, deltaAbs, deltaPct, spark: [] };
  };

  const newFollowers = async (period: Period): Promise<KPIValue> => {
    if (!user) throw new Error('User not authenticated');
    
    // Get current (today's) followers count
    const { data: current } = await (supabase as any)
      .from('followers_history')
      .select('followers_count, entry_date')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get yesterday's followers count
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: yesterdayData } = await (supabase as any)
      .from('followers_history')
      .select('followers_count')
      .eq('user_id', user.id)
      .lte('entry_date', yesterday.toISOString().split('T')[0])
      .order('entry_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get day before yesterday for delta comparison
    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    
    const { data: dayBeforeYesterdayData } = await (supabase as any)
      .from('followers_history')
      .select('followers_count')
      .eq('user_id', user.id)
      .lte('entry_date', dayBeforeYesterday.toISOString().split('T')[0])
      .order('entry_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentCount = current?.followers_count || 0;
    const yesterdayCount = yesterdayData?.followers_count || currentCount;
    const dayBeforeYesterdayCount = dayBeforeYesterdayData?.followers_count || yesterdayCount;

    // Value shows daily difference (today - yesterday)
    const value = currentCount - yesterdayCount;
    
    // Delta shows change compared to previous day's difference
    const previousDayDifference = yesterdayCount - dayBeforeYesterdayCount;
    const deltaAbs = value - previousDayDifference;
    const deltaPct = previousDayDifference !== 0 ? (deltaAbs / Math.abs(previousDayDifference)) * 100 : 0;

    return { value, deltaAbs, deltaPct, spark: [] };
  };

  const retentionAvg = async (period: Period): Promise<KPIValue> => {
    const currentAgg = await getVideoAggregation(period);
    
    // Get previous period for comparison
    const days = getDaysFromPeriod(period);
    const previousFromDate = new Date();
    previousFromDate.setDate(previousFromDate.getDate() - (days * 2));
    const previousToDate = new Date();
    previousToDate.setDate(previousToDate.getDate() - days);

    const { data: previousData } = await (supabase as any)
      .from('videos')
      .select('views, avg_time_watched, duration_seconds')
      .eq('user_id', user.id)
      .gte('published_date', previousFromDate.toISOString().split('T')[0])
      .lt('published_date', previousToDate.toISOString().split('T')[0]);

    const previousAgg = (previousData || []).reduce((acc, video) => {
      const views = video.views || 0;
      const avgTime = video.avg_time_watched || 0;
      const duration = video.duration_seconds || 1;

      return {
        weighted_avg_time: acc.weighted_avg_time + (avgTime * views),
        weighted_duration: acc.weighted_duration + (duration * views)
      };
    }, { weighted_avg_time: 0, weighted_duration: 0 });

    const value = currentAgg.weighted_duration > 0 
      ? (currentAgg.weighted_avg_time / currentAgg.weighted_duration) * 100 
      : 0;

    const previousValue = previousAgg.weighted_duration > 0 
      ? (previousAgg.weighted_avg_time / previousAgg.weighted_duration) * 100 
      : value;

    const deltaAbs = value - previousValue;
    const deltaPct = previousValue > 0 ? (deltaAbs / previousValue) * 100 : 0;

    return { value, deltaAbs, deltaPct, spark: [] };
  };

  const savesPer1K = async (period: Period): Promise<KPIValue> => {
    const currentAgg = await getVideoAggregation(period);
    const days = getDaysFromPeriod(period);
    
    // Get previous period for comparison
    const previousFromDate = new Date();
    previousFromDate.setDate(previousFromDate.getDate() - (days * 2));
    const previousToDate = new Date();
    previousToDate.setDate(previousToDate.getDate() - days);

    const { data: previousData } = await (supabase as any)
      .from('videos')
      .select('views, saves')
      .eq('user_id', user.id)
      .gte('published_date', previousFromDate.toISOString().split('T')[0])
      .lt('published_date', previousToDate.toISOString().split('T')[0]);

    const previousAgg = (previousData || []).reduce((acc, video) => ({
      total_views: acc.total_views + (video.views || 0),
      total_saves: acc.total_saves + (video.saves || 0)
    }), { total_views: 0, total_saves: 0 });

    const value = currentAgg.total_views > 0 
      ? (currentAgg.total_saves / currentAgg.total_views) * 1000 
      : 0;

    const previousValue = previousAgg.total_views > 0 
      ? (previousAgg.total_saves / previousAgg.total_views) * 1000 
      : value;

    const deltaAbs = value - previousValue;
    const deltaPct = previousValue > 0 ? (deltaAbs / previousValue) * 100 : 0;

    return { value, deltaAbs, deltaPct, spark: [] };
  };

  const forYouShare = async (period: Period): Promise<KPIValue> => {
    const currentAgg = await getVideoAggregation(period);
    const days = getDaysFromPeriod(period);
    
    // Get previous period for comparison
    const previousFromDate = new Date();
    previousFromDate.setDate(previousFromDate.getDate() - (days * 2));
    const previousToDate = new Date();
    previousToDate.setDate(previousToDate.getDate() - days);

    const { data: previousData } = await (supabase as any)
      .from('videos')
      .select('views, traffic_for_you')
      .eq('user_id', user.id)
      .gte('published_date', previousFromDate.toISOString().split('T')[0])
      .lt('published_date', previousToDate.toISOString().split('T')[0]);

    const previousAgg = (previousData || []).reduce((acc, video) => ({
      total_views: acc.total_views + (video.views || 0),
      total_traffic_for_you: acc.total_traffic_for_you + (video.traffic_for_you || 0)
    }), { total_views: 0, total_traffic_for_you: 0 });

    const value = currentAgg.total_views > 0 
      ? (currentAgg.total_traffic_for_you / currentAgg.total_views) * 100 
      : 0;

    const previousValue = previousAgg.total_views > 0 
      ? (previousAgg.total_traffic_for_you / previousAgg.total_views) * 100 
      : value;

    const deltaAbs = value - previousValue;
    const deltaPct = previousValue > 0 ? (deltaAbs / previousValue) * 100 : 0;

    return { value, deltaAbs, deltaPct, spark: [] };
  };

  const initialVelocity = async (period: Period): Promise<KPIValue> => {
    // This is a proxy calculation - in real implementation you'd need views_day1 data
    // For now, we'll use a simplified approach
    const value = 100; // Placeholder
    const deltaAbs = 0;
    const deltaPct = 0;

    return { value, deltaAbs, deltaPct, spark: [] };
  };

  const charts = {
    followersTrend: async (period: Period) => {
      if (!user) return [];

      const days = getDaysFromPeriod(period);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data } = await (supabase as any)
        .from('followers_history')
        .select('entry_date, followers_count')
        .eq('user_id', user.id)
        .gte('entry_date', fromDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: true });

      return (data || []).map(item => ({
        date: item.entry_date,
        count: item.followers_count
      }));
    },

    topVsBottom: async (period: Period): Promise<{ top: TopBottomItem[]; bottom: TopBottomItem[] }> => {
      if (!user) return { top: [], bottom: [] };

      const days = getDaysFromPeriod(period);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data } = await (supabase as any)
        .from('videos')
        .select('id, title, views, saves, avg_time_watched, duration_seconds')
        .eq('user_id', user.id)
        .gte('published_date', fromDate.toISOString().split('T')[0])
        .gt('views', 0)
        .order('views', { ascending: false });

      const videos = (data || []).map(video => {
        const retention = video.duration_seconds > 0 
          ? (video.avg_time_watched / video.duration_seconds) * 100 
          : 0;
        const savesPer1k = video.views > 0 
          ? (video.saves / video.views) * 1000 
          : 0;

        return {
          id: video.id,
          title: video.title || 'Untitled',
          retention,
          savesPer1k,
          views: video.views
        };
      });

      const sortedByRetention = [...videos].sort((a, b) => b.retention - a.retention);
      const top = sortedByRetention.slice(0, 5);
      const bottom = sortedByRetention.slice(-5).reverse();

      return { top, bottom };
    },

    trafficDonut: async (period: Period) => {
      const agg = await getVideoAggregation(period);
      
      const totalTraffic = agg.total_traffic_for_you + agg.total_traffic_profile + 
                          agg.total_traffic_hashtag + agg.total_traffic_sound + 
                          agg.total_traffic_search;

      if (totalTraffic === 0) return [];

      return [
        { label: 'For You', value: (agg.total_traffic_for_you / totalTraffic) * 100 },
        { label: 'Perfil', value: (agg.total_traffic_profile / totalTraffic) * 100 },
        { label: 'Hashtag', value: (agg.total_traffic_hashtag / totalTraffic) * 100 },
        { label: 'Audio', value: (agg.total_traffic_sound / totalTraffic) * 100 },
        { label: 'Búsqueda', value: (agg.total_traffic_search / totalTraffic) * 100 }
      ].filter(item => item.value > 0);
    }
  };

  return {
    loading,
    followersNow,
    newFollowers,
    followersYield,
    retentionAvg,
    savesPer1K,
    forYouShare,
    initialVelocity,
    charts
  };
};