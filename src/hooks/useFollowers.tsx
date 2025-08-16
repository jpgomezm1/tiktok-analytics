import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FollowerRecord {
  id: string;
  user_id: string;
  entry_date: string;
  followers_count: number;
  created_at: string;
}

export interface FollowerTrend {
  date: string;
  count: number;
}

export const useFollowers = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [latestCount, setLatestCount] = useState<number | null>(null);
  const [trend, setTrend] = useState<FollowerTrend[]>([]);

  const getLatestCount = async () => {
    if (!user) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('followers_history')
        .select('followers_count')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      const count = data?.followers_count || 0;
      setLatestCount(count);
      return count;
    } catch (error) {
      console.error('Error getting latest follower count:', error);
      return null;
    }
  };

  const getTrend = async (range: '7d' | '30d' | '90d' = '30d') => {
    if (!user) return [];

    try {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await (supabase as any)
        .from('followers_history')
        .select('entry_date, followers_count')
        .eq('user_id', user.id)
        .gte('entry_date', fromDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: true });

      if (error) throw error;

      const trendData = (data || []).map(item => ({
        date: item.entry_date,
        count: item.followers_count
      }));

      setTrend(trendData);
      return trendData;
    } catch (error) {
      console.error('Error getting follower trend:', error);
      return [];
    }
  };

  const upsertToday = async (count: number) => {
    if (!user) throw new Error('User not authenticated');

    // Validation
    if (count < 0) {
      throw new Error('Follower count cannot be negative');
    }

    // Check if value is absurdly high compared to latest
    if (latestCount && count > latestCount * 10) {
      throw new Error('Follower count seems too high compared to latest value');
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await (supabase as any)
        .from('followers_history')
        .upsert({
          user_id: user.id,
          entry_date: today,
          followers_count: count
        }, {
          onConflict: 'user_id,entry_date'
        });

      if (error) throw error;

      // Update local state
      setLatestCount(count);
      
      // Refresh trend data
      await getTrend();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating follower count:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getChangeStats = async () => {
    if (!user || !latestCount) return { change7d: null, change30d: null };

    try {
      const today = new Date();
      const date7d = new Date(today);
      date7d.setDate(date7d.getDate() - 7);
      const date30d = new Date(today);
      date30d.setDate(date30d.getDate() - 30);

      // Get counts from 7 and 30 days ago
      const [result7d, result30d] = await Promise.all([
        (supabase as any)
          .from('followers_history')
          .select('followers_count')
          .eq('user_id', user.id)
          .lte('entry_date', date7d.toISOString().split('T')[0])
          .order('entry_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from('followers_history')
          .select('followers_count')
          .eq('user_id', user.id)
          .lte('entry_date', date30d.toISOString().split('T')[0])
          .order('entry_date', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      const count7d = result7d.data?.followers_count;
      const count30d = result30d.data?.followers_count;

      const change7d = count7d ? {
        absolute: latestCount - count7d,
        percentage: ((latestCount - count7d) / count7d * 100).toFixed(1)
      } : null;

      const change30d = count30d ? {
        absolute: latestCount - count30d,
        percentage: ((latestCount - count30d) / count30d * 100).toFixed(1)
      } : null;

      return { change7d, change30d };
    } catch (error) {
      console.error('Error calculating change stats:', error);
      return { change7d: null, change30d: null };
    }
  };

  useEffect(() => {
    if (user) {
      getLatestCount();
      getTrend();
    }
  }, [user]);

  return {
    latestCount,
    trend,
    loading,
    getLatestCount,
    getTrend,
    upsertToday,
    getChangeStats
  };
};