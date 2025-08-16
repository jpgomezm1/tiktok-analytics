import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, FileText, Brain, AlertCircle } from 'lucide-react';
import { IdeasQuickTab } from '@/components/ai-generate/IdeasQuickTab';
import { ScriptGeneratorTab } from '@/components/ai-generate/ScriptGeneratorTab';
import { StrategicInsightsTab } from '@/components/ai-generate/StrategicInsightsTab';
import { useHistoricalData } from '@/hooks/useHistoricalData';

const AIGenerate = () => {
  const { data: historicalData, loading } = useHistoricalData();
  const [activeTab, setActiveTab] = useState('ideas');

  const hasData = historicalData && historicalData.videos.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando datos históricos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              AI Generate
            </h1>
            <p className="text-text-secondary">
              Copiloto creativo con Claude & TikTok Brain - Ideas, guiones e insights basados en tus datos
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            {hasData ? (
              <Badge className="bg-success/20 text-success border-success/40">
                {historicalData.metrics.video_count} videos cargados
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600">
                Sin datos históricos
              </Badge>
            )}
          </div>
        </div>

        {/* Data Status Banner */}
        {!hasData && (
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-text-primary mb-1">
                    Obtén insights personalizados
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Claude puede generar contenido general, pero TikTok Brain necesita tus datos históricos para análisis específicos 
                    basados en tus patrones de éxito. Importa tus datos desde la sección de Videos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas Rápidas
            </TabsTrigger>
            <TabsTrigger value="scripts" className="gap-2">
              <FileText className="w-4 h-4" />
              Generador de Guiones
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="w-4 h-4" />
              Insights Estratégicos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ideas" className="space-y-6">
            <IdeasQuickTab historicalData={historicalData} hasData={hasData} />
          </TabsContent>

          <TabsContent value="scripts" className="space-y-6">
            <ScriptGeneratorTab historicalData={historicalData} hasData={hasData} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <StrategicInsightsTab historicalData={historicalData} hasData={hasData} />
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Potenciado por Claude AI + TikTok Brain
                </p>
                <p className="text-xs text-text-muted">
                  Vector knowledge engine con análisis semántico de tus patrones exitosos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIGenerate;