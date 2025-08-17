import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Lightbulb, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface InteractiveTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  tourId: string;
}

export const InteractiveTour = ({ 
  steps, 
  isActive, 
  onComplete, 
  onSkip, 
  tourId 
}: InteractiveTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      let top = 0;
      let left = 0;
      
      switch (step.placement) {
        case 'top':
          top = rect.top + scrollY - 10;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + 10;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 10;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 10;
          break;
      }
      
      setTooltipPosition({ top, left });
      
      // Add highlight class
      element.classList.add('tour-highlight');
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }

    return () => {
      if (element) {
        element.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, isActive, steps]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isActive || !targetElement) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
      
      {/* Tour Tooltip */}
      <div 
        className="fixed z-50 transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          top: tooltipPosition.top, 
          left: tooltipPosition.left 
        }}
      >
        <Card className="w-80 bg-card border-border shadow-glow">
          <CardContent className="p-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-3 h-3 text-white" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} de {steps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-md">
              <h3 className="font-semibold text-text-primary">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.content}</p>
              
              {step.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={step.action.onClick}
                  className="w-full border-purple-bright/30 text-purple-light hover:bg-purple-bright/10"
                >
                  <Target className="w-4 h-4 mr-2" />
                  {step.action.label}
                </Button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-lg pt-md border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              <Button
                onClick={nextStep}
                size="sm"
                className={cn(
                  "gap-2",
                  isLastStep 
                    ? "bg-gradient-success hover:shadow-success" 
                    : "bg-gradient-primary hover:shadow-glow"
                )}
              >
                {isLastStep ? 'Finalizar' : 'Siguiente'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};