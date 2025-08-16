import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFollowersHistory } from '@/hooks/useFollowersHistory';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

interface FollowersWidgetProps {
  compact?: boolean;
  className?: string;
}

export const FollowersWidget = ({ compact = false, className = '' }: FollowersWidgetProps) => {
  const t = useT;
  const { toast } = useToast();
  const { loading, getToday, upsertForDate, getSeries } = useFollowersHistory();
  const [followersCount, setFollowersCount] = useState<string>('');
  const [originalCount, setOriginalCount] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [weeklyDelta, setWeeklyDelta] = useState<number>(0);
  const [sparklineData, setSparklineData] = useState<Array<{ date: string; followers: number }>>([]);

  useEffect(() => {
    loadTodayData();
    loadWeeklyData();
  }, []);

  const loadTodayData = async () => {
    try {
      const todayData = await getToday();
      const countStr = todayData.followers_count.toString();
      setFollowersCount(countStr);
      setOriginalCount(countStr);
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const series = await getSeries(14);
      setSparklineData(series);

      if (series.length >= 7) {
        const today = series[series.length - 1]?.followers || 0;
        const weekAgo = series[series.length - 8]?.followers || 0;
        setWeeklyDelta(today - weekAgo);
      }
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  const handleSave = async () => {
    if (!followersCount.trim()) return;

    const count = parseInt(followersCount);
    if (isNaN(count) || count < 0) {
      toast({
        title: 'Error de validación',
        description: 'Ingresa un número entero mayor o igual a 0',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const success = await upsertForDate(today, count);
      
      if (success) {
        toast({
          title: 'Guardado ✅',
          description: 'Seguidores actualizados para hoy'
        });
        setOriginalCount(followersCount);
        loadWeeklyData(); // Refresh weekly data
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo guardar, intenta de nuevo',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar, intenta de nuevo',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanged = followersCount !== originalCount;
  const deltaColor = weeklyDelta > 0 ? 'text-green-400' : weeklyDelta < 0 ? 'text-red-400' : 'text-text-muted';
  const DeltaIcon = weeklyDelta > 0 ? TrendingUp : TrendingDown;

  if (compact) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-secondary">Seguidores hoy</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={followersCount}
                  onChange={(e) => setFollowersCount(e.target.value)}
                  placeholder="5088"
                  className="w-24 h-8 text-sm"
                  disabled={loading}
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || loading || !hasChanged}
                  className="h-8"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
            {weeklyDelta !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${deltaColor}`}>
                <DeltaIcon className="w-4 h-4" />
                <span>{weeklyDelta > 0 ? '+' : ''}{weeklyDelta}</span>
              </div>
            )}
          </div>
          {hasChanged && (
            <p className="text-xs text-purple-bright mt-2">Actualizado para hoy</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="text-text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          Seguidores hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={followersCount}
            onChange={(e) => setFollowersCount(e.target.value)}
            placeholder="5088"
            className="flex-1"
            disabled={loading}
          />
          <Button
            onClick={handleSave}
            disabled={saving || loading || !hasChanged}
            className="bg-gradient-primary hover:opacity-90"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>

        {hasChanged && (
          <p className="text-sm text-purple-bright">Actualizado para hoy</p>
        )}

        {/* Weekly Delta */}
        {weeklyDelta !== 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-text-secondary">Delta 7 días</span>
            <div className={`flex items-center gap-1 ${deltaColor}`}>
              <DeltaIcon className="w-4 h-4" />
              <span className="font-medium">
                {weeklyDelta > 0 ? '+' : ''}{weeklyDelta.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Mini Sparkline */}
        {sparklineData.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-text-secondary mb-2">Últimos 14 días</p>
            <div className="h-12 w-full flex items-end gap-1">
              {sparklineData.map((point, index) => {
                const maxValue = Math.max(...sparklineData.map(p => p.followers));
                const height = maxValue > 0 ? (point.followers / maxValue) * 100 : 0;
                
                return (
                  <div
                    key={point.date}
                    className="flex-1 bg-gradient-primary rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${point.date}: ${point.followers.toLocaleString()}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};