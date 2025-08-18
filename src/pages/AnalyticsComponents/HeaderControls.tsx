import { Card, CardContent } from '@/components/ui/card';
import { PeriodSelector } from '@/components/PeriodSelector';
import { Activity, BarChart3, Zap, TrendingUp } from 'lucide-react';

type Props = {
  selectedPeriod: "7d" | "30d" | "90d";
  onChangePeriod: (p: "7d" | "30d" | "90d") => void;
};

export default function HeaderControls({ selectedPeriod, onChangePeriod }: Props) {
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return '7 días';
      case '30d': return '30 días';
      case '90d': return '90 días';
      default: return '30 días';
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-text-secondary flex items-center space-x-2">
                <span>Análisis profundo de rendimiento y métricas</span>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-500 font-medium">Live</span>
                </div>
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Period Selector */}
        <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-text-secondary">
                <Activity className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Período:</span>
              </div>
              <PeriodSelector 
                selectedPeriod={selectedPeriod} 
                onPeriodChange={onChangePeriod}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Stats Preview Bar */}
      <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Análisis Activo</p>
                  <p className="text-lg font-bold text-text-primary">
                    {getPeriodLabel(selectedPeriod)}
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Estado</p>
                  <p className="text-sm font-semibold text-green-500 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Actualizando</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-text-muted">Última actualización</p>
                <p className="text-sm font-medium text-text-secondary">hace 2 min</p>
              </div>
              
              {/* Visual indicator */}
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-6 bg-gradient-to-t from-purple-500/30 to-purple-500 rounded-full"
                    style={{ 
                      animationDelay: `${i * 0.2}s`,
                      animation: 'pulse 2s infinite' 
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Stats Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['7d', '30d', '90d'].map((period) => (
          <Card 
            key={period}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedPeriod === period 
                ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/50 shadow-lg' 
                : 'bg-card/30 border-border/30 hover:bg-card/50 hover:border-border/50'
            }`}
            onClick={() => onChangePeriod(period as "7d" | "30d" | "90d")}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {getPeriodLabel(period)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {period === '7d' ? 'Vista semanal' : period === '30d' ? 'Vista mensual' : 'Vista trimestral'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  selectedPeriod === period 
                    ? 'bg-purple-500 shadow-lg shadow-purple-500/50' 
                    : 'bg-border'
                }`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}