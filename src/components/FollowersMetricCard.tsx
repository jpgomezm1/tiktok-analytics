import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { useFollowers } from '@/hooks/useFollowers';
import { Users } from 'lucide-react';

export const FollowersMetricCard = () => {
  const { latestCount, getChangeStats } = useFollowers();
  const [changeText, setChangeText] = useState<string>('');
  const [changeType, setChangeType] = useState<'increase' | 'decrease' | 'neutral'>('neutral');

  useEffect(() => {
    const loadChangeStats = async () => {
      const stats = await getChangeStats();
      
      if (stats.change30d) {
        const { absolute, percentage } = stats.change30d;
        const sign = absolute >= 0 ? '+' : '';
        setChangeText(`${sign}${percentage}% este mes (${sign}${absolute.toLocaleString()})`);
        setChangeType(absolute >= 0 ? 'increase' : 'decrease');
      } else if (stats.change7d) {
        const { absolute, percentage } = stats.change7d;
        const sign = absolute >= 0 ? '+' : '';
        setChangeText(`${sign}${percentage}% últimos 7 días (${sign}${absolute.toLocaleString()})`);
        setChangeType(absolute >= 0 ? 'increase' : 'decrease');
      } else {
        setChangeText('Sin datos históricos');
        setChangeType('neutral');
      }
    };

    if (latestCount !== null) {
      loadChangeStats();
    }
  }, [latestCount]);

  return (
    <MetricCard
      title="Total Seguidores"
      value={latestCount ?? 0}
      change={changeText}
      changeType={changeType}
      icon={<Users />}
    />
  );
};