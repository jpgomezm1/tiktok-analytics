import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Upload, Plus, Sparkles, TrendingUp, FileText } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-2xl overflow-hidden">
        <CardContent className="py-16 px-8 text-center relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Enhanced Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-6 h-6 bg-blue-500/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -right-8 w-4 h-4 bg-green-500/20 rounded-full animate-pulse delay-300"></div>
            </div>

            {/* Enhanced Title */}
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              Configura tu Analytics Dashboard
            </h3>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Importa tus videos de TikTok para desbloquear insights poderosos, 
              métricas detalladas y análisis de rendimiento que impulsen tu crecimiento.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="p-3 bg-purple-500/20 rounded-xl w-fit mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Métricas Avanzadas</h4>
                <p className="text-sm text-text-muted">Análisis de engagement, retención y performance</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Visualizaciones</h4>
                <p className="text-sm text-text-muted">Gráficos interactivos y comparativas temporales</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="p-3 bg-green-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="font-semibold text-text-primary mb-2">Insights IA</h4>
                <p className="text-sm text-text-muted">Recomendaciones personalizadas y patrones</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 rounded-xl"
              >
                <Upload className="w-5 h-5 mr-2" />
                Importar Videos CSV
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-border text-text-secondary hover:bg-muted hover:border-purple-bright/30 transition-all duration-300 px-8 py-3 rounded-xl backdrop-blur-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Video Manual
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">¿Necesitas ayuda?</span>
              </div>
              <p className="text-xs text-text-muted">
                Descarga tus datos desde TikTok Creator Studio → Analytics → Exportar datos
              </p>
            </div>

            {/* Stats Preview */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Videos', value: '0', color: 'purple' },
                { label: 'Vistas', value: '0', color: 'blue' },
                { label: 'Engagement', value: '0%', color: 'green' },
                { label: 'Retención', value: '0%', color: 'yellow' }
              ].map((stat, index) => (
                <div key={index} className="bg-card/30 backdrop-blur-sm border border-border/20 rounded-xl p-3">
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}