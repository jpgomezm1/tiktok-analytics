import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FollowerEntry {
  id: string;
  entry_date: string;
  followers_count: number;
  created_at: string;
}

interface FollowerHistoryHook {
  loading: boolean;
  getToday: () => Promise<{ entry_date: string; followers_count: number }>;
  upsertForDate: (entry_date: string, followers_count: number) => Promise<boolean>;
  getCountOn: (date: string) => Promise<number>;
  getSeries: (days: number) => Promise<Array<{ date: string; followers: number }>>;
}

export const useFollowersHistory = (): FollowerHistoryHook => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get timezone-aware date (Colombia timezone)
  const getTodayDate = (): string => {
    const now = new Date();
    // Convert to Colombia timezone (UTC-5)
    const colombiaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
    return colombiaTime.toISOString().split('T')[0];
  };

  const getToday = async (): Promise<{ entry_date: string; followers_count: number }> => {
    if (!user) throw new Error('User not authenticated');
    
    const todayDate = getTodayDate();
    
    try {
      setLoading(true);
      
      // Check if entry exists for today
      const { data: existing, error: fetchError } = await supabase
        .from('followers_history')
        .select('entry_date, followers_count')
        .eq('user_id', user.id)
        .eq('entry_date', todayDate)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        return existing;
      }

      // Create initial entry with default value
      const { data: newEntry, error: insertError } = await supabase
        .from('followers_history')
        .insert({
          user_id: user.id,
          entry_date: todayDate,
          followers_count: 5088
        })
        .select('entry_date, followers_count')
        .single();

      if (insertError) throw insertError;

      return newEntry;
    } finally {
      setLoading(false);
    }
  };

  const upsertForDate = async (entry_date: string, followers_count: number): Promise<boolean> => {
    if (!user) throw new Error('User not authenticated');
    
    // Validate input
    if (!Number.isInteger(followers_count) || followers_count < 0) {
      throw new Error('Followers count must be a non-negative integer');
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('followers_history')
        .upsert({
          user_id: user.id,
          entry_date,
          followers_count
        }, {
          onConflict: 'user_id,entry_date'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error upserting followers history:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCountOn = async (date: string): Promise<number> => {
    if (!user) return 0;

    try {
      // Get the latest entry on or before the given date
      const { data, error } = await supabase
        .from('followers_history')
        .select('followers_count')
        .eq('user_id', user.id)
        .lte('entry_date', date)
        .order('entry_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return data.followers_count;
      }

      // If no previous data, get the first available entry (carry-forward)
      const { data: firstEntry, error: firstError } = await supabase
        .from('followers_history')
        .select('followers_count')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstError) throw firstError;

      return firstEntry?.followers_count || 0;
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  };

  const getSeries = async (days: number): Promise<Array<{ date: string; followers: number }>> => {
    if (!user) return [];

    try {
      const endDate = getTodayDate();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get all entries in range
      const { data: entries, error } = await supabase
        .from('followers_history')
        .select('entry_date, followers_count')
        .eq('user_id', user.id)
        .gte('entry_date', startDateStr)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: true });

      if (error) throw error;

      const series: Array<{ date: string; followers: number }> = [];
      let lastKnownCount = 0;

      // Fill in the series day by day
      for (let i = 0; i < days; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - days + 1 + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        const entry = entries?.find(e => e.entry_date === dateStr);
        
        if (entry) {
          lastKnownCount = entry.followers_count;
        }

        series.push({
          date: dateStr,
          followers: lastKnownCount
        });
      }

      return series;
    } catch (error) {
      console.error('Error getting followers series:', error);
      return [];
    }
  };

  return {
    loading,
    getToday,
    upsertForDate,
    getCountOn,
    getSeries
  };
};