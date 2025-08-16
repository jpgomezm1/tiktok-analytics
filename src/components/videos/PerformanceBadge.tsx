import { Badge } from '@/components/ui/badge';
import { PerformanceBadge as PerformanceBadgeType } from '@/types/videos';

interface PerformanceBadgeProps {
  badge: PerformanceBadgeType;
  size?: 'sm' | 'default';
}

export const PerformanceBadge = ({ badge, size = 'default' }: PerformanceBadgeProps) => {
  const getBadgeVariant = () => {
    switch (badge.percentile) {
      case 90:
        return 'bg-red-600/20 text-red-400 border-red-600/20';
      case 70:
        return 'bg-green-600/20 text-green-400 border-green-600/20';
      case 40:
        return 'bg-orange-600/20 text-orange-400 border-orange-600/20';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/20';
    }
  };

  return (
    <Badge 
      className={`${getBadgeVariant()} ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : ''}`}
    >
      <span className="mr-1">{badge.emoji}</span>
      {badge.label}
    </Badge>
  );
};