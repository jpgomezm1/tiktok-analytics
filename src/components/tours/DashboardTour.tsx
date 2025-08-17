import { useState } from 'react';
import { InteractiveTour, TourStep } from './InteractiveTour';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const dashboardSteps: TourStep[] = [
  {
    id: 'kpis',
    title: 'KPIs Principales',
    content: 'Estas métricas te muestran el rendimiento de tu cuenta en tiempo real. Los deltas comparan con períodos anteriores.',
    target: '[data-tour="kpis-grid"]',
    placement: 'bottom'
  },
  {
    id: 'period-selector',
    title: 'Selector de Período',
    content: 'Cambia entre 7, 30 o 90 días para ver diferentes ventanas de tiempo en tus análisis.',
    target: '[data-tour="period-selector"]',
    placement: 'left'
  },
  {
    id: 'viral-videos',
    title: 'Videos Virales',
    content: 'Aquí ves tus videos con mejor rendimiento. Haz clic en cualquiera para ver detalles completos.',
    target: '[data-tour="viral-videos"]',
    placement: 'top'
  },
  {
    id: 'ai-insights',
    title: 'Insights de IA',
    content: 'La IA analiza tus patrones y te da recomendaciones específicas basadas en tu contenido exitoso.',
    target: '[data-tour="ai-insights"]',
    placement: 'top',
    action: {
      label: 'Ver AI Generate',
      onClick: () => window.location.href = '/ai-generate'
    }
  }
];

interface DashboardTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const DashboardTour = ({ isActive, onComplete, onSkip }: DashboardTourProps) => {
  return (
    <InteractiveTour
      steps={dashboardSteps}
      isActive={isActive}
      onComplete={onComplete}
      onSkip={onSkip}
      tourId="dashboard"
    />
  );
};

export const TourTrigger = ({ onStartTour }: { onStartTour: () => void }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onStartTour}
      className="gap-2 border-purple-bright/30 text-purple-light hover:bg-purple-bright/10"
    >
      <MapPin className="w-4 h-4" />
      Tour de Dashboard
    </Button>
  );
};