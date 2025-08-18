import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText, Download, Copy, RefreshCw, Brain, Sparkles, Target, Clock, Users, Zap, Play } from 'lucide-react';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import { HistoricalData } from '@/hooks/useHistoricalData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ScriptGeneratorTabProps {
  historicalData: HistoricalData | null;
  hasData: boolean;
}

interface GeneratedScript {
  hook: string;
  development: string;
  cta: string;
  estimated_duration: string;
  insights: {
    duration_recommendation: string;
    hook_strategy: string;
    expected_f1k: string;
  };
}

export const ScriptGeneratorTab = ({ historicalData, hasData }: ScriptGeneratorTabProps) => {
  const [vertical, setVertical] = useState('');
  const [description, setDescription] = useState('');
  const [useBrain, setUseBrain] = useState(true);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);

  // Check for URL parameters to pre-fill from ideas tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ideaTitle = urlParams.get('idea');
    const ideaDescription = urlParams.get('description');
    
    if (ideaTitle && ideaDescription) {
      setDescription(`${ideaTitle}\n\n${ideaDescription}`);
      setVertical('entretenimiento'); // Default vertical
      
      // Clear URL parameters
      urlParams.delete('idea');
      urlParams.delete('description');
      window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    }
  }, []);
  
  const { generateScript, loading } = useAIGenerate();
  const { toast } = useToast();

  const verticals = [
    { value: 'educacion', label: 'Educación', icon: '📚', color: 'blue' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎬', color: 'purple' },
    { value: 'vender', label: 'Vender', icon: '💰', color: 'green' },
    { value: 'informativo', label: 'Informativo', icon: '📰', color: 'orange' },
    { value: 'otro', label: 'Otro', icon: '✨', color: 'gray' }
  ];

  const handleGenerate = async () => {
    if (!vertical || !description.trim()) {
      toast({
        title: "⚠️ Campos requeridos",
        description: "Por favor selecciona una vertical y describe el guion",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await generateScript(
        vertical, 
        description, 
        useBrain, 
        historicalData || undefined
      );
      
      if (response.success && response.content) {
        try {
          // Clean the response content to remove any control characters
          let cleanedContent = response.content.trim();
          console.log('Original content:', response.content);
          
          // Remove any markdown code block wrappers
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          
          // Remove control characters that break JSON parsing
          cleanedContent = cleanedContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
          
          console.log('Cleaned content:', cleanedContent);
          
          // Try to parse the JSON
          const parsed = JSON.parse(cleanedContent);
          setGeneratedScript(parsed.script);
          
          toast({
            title: "🎬 Guion generado",
            description: "Claude ha creado tu guion estructurado",
          });
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.error('Raw content that failed:', response.content);
          
          // Create fallback script from raw content
          const fallbackScript = {
            hook: "Error al procesar respuesta",
            development: response.content.substring(0, 500) + "...",
            cta: "Intenta generar nuevamente",
            estimated_duration: "N/A",
            insights: {
              duration_recommendation: "Error en el procesamiento",
              hook_strategy: "Error en el procesamiento", 
              expected_f1k: "Error en el procesamiento"
            }
          };
          
          setGeneratedScript(fallbackScript);
          
          toast({
            title: "⚠️ Error de formato",
            description: "Claude generó contenido pero no pudimos procesarlo correctamente. Revisa los logs del navegador.",
            variant: "destructive"
          });
        }
      } else {
        throw new Error(response.error || 'No se pudo generar el guion');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "❌ Error",
        description: "No pudimos conectar con AI. Intenta de nuevo en unos minutos.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado",
      description: "Texto copiado al portapapeles"
    });
  };

  const exportScript = () => {
    if (!generatedScript) return;

    const scriptText = `GUION PARA TIKTOK
Vertical: ${vertical}
Descripción: ${description}

=== HOOK (${generatedScript.estimated_duration}) ===
${generatedScript.hook}

=== DESARROLLO ===
${generatedScript.development}

=== CTA FINAL ===
${generatedScript.cta}

=== INSIGHTS CLAUDE ===
Duración: ${generatedScript.insights.duration_recommendation}
Hook: ${generatedScript.insights.hook_strategy}
F/1k esperado: ${generatedScript.insights.expected_f1k}
`;

    const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guion-tiktok-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "📥 Guion exportado",
      description: "Archivo TXT descargado correctamente"
    });
  };

  const selectedVertical = verticals.find(v => v.value === vertical);

  return (
    <div className="space-y-8">
      {/* Enhanced Input Form */}
      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-text-primary">
                Genera Guion Estructurado
              </CardTitle>
              <CardDescription className="text-text-secondary">
                {useBrain 
                  ? '🧠 Claude usará tu TikTok Brain para crear guiones basados en tus patrones exitosos'
                  : '✨ Claude creará un guion con estructura clara optimizada para TikTok'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vertical Selection */}
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="vertical" className="text-sm font-semibold text-text-primary">
                Vertical del contenido
              </Label>
              <Select value={vertical} onValueChange={setVertical}>
                <SelectTrigger className="bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200">
                  <SelectValue placeholder="Selecciona una vertical" />
                </SelectTrigger>
                <SelectContent>
                  {verticals.map(v => (
                    <SelectItem key={v.value} value={v.value} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>{v.icon}</span>
                        <span>{v.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedVertical && (
                <div className={cn(
                  "p-3 rounded-lg border mt-2",
                  `bg-${selectedVertical.color}-500/10 border-${selectedVertical.color}-500/20`
                )}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{selectedVertical.icon}</span>
                    <span className={`font-medium text-${selectedVertical.color}-400`}>
                      {selectedVertical.label} seleccionado
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Brain Toggle */}
            <div className="bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                    <Brain className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-sm">
                      TikTok Brain
                    </p>
                    <p className="text-xs text-text-muted">
                      Patrones exitosos
                    </p>
                  </div>
                  <Switch
                    checked={useBrain}
                    onCheckedChange={setUseBrain}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                  />
                </div>
                
                {useBrain && hasData && (
                  <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 text-success text-xs font-medium">
                      <Target className="w-3 h-3" />
                      Activo ({historicalData?.metrics?.video_count || 0} videos)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-text-primary">
              Descripción del guion
            </Label>
            <Textarea
              id="description"
              placeholder="ej: un video corto explicando cómo automatizar procesos con IA para emprendedores que quieren escalar su negocio sin trabajar más horas"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={loading || !vertical || !description.trim()}
            className={cn(
              "w-full py-3 text-lg font-semibold shadow-lg transition-all duration-200",
              useBrain 
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                : "bg-gradient-primary hover:opacity-90"
            )}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generando guion con Claude...
              </>
            ) : (
              <>
                {useBrain ? <Brain className="w-5 h-5 mr-2" /> : <FileText className="w-5 h-5 mr-2" />}
                {useBrain ? 'Generar con TikTok Brain' : 'Generar Guion con AI (Claude)'}
              </>
            )}
          </Button>

          {!useBrain && hasData && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-yellow-600">💡 Tip:</span> Activa el TikTok Brain para que Claude genere guiones basados en tus patrones de éxito reales.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Generated Script */}
      {generatedScript && (
        <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-text-primary">
                    Guion Generado
                  </CardTitle>
                  <CardDescription className="text-text-secondary">
                    📏 Estructura optimizada para {generatedScript.estimated_duration}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${generatedScript.hook}\n\n${generatedScript.development}\n\n${generatedScript.cta}`)}
                  className="gap-2 hover:border-blue-500/30 hover:text-blue-500 transition-all duration-200"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportScript}
                  className="gap-2 hover:border-green-500/30 hover:text-green-500 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Exportar TXT
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Hook Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 shadow-md">
                  🎯 HOOK (3-5s)
                </Badge>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  <span>Primeros segundos críticos</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4 shadow-sm">
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed font-medium">
                  {generatedScript.hook}
                </p>
              </div>
            </div>

            {/* Development Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 shadow-md">
                  📖 DESARROLLO
                </Badge>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Users className="w-3 h-3" />
                  <span>Contenido principal</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4 shadow-sm">
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                  {generatedScript.development}
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 shadow-md">
                  🚀 CTA FINAL
                </Badge>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Target className="w-3 h-3" />
                  <span>Call to action</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-4 shadow-sm">
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed font-medium">
                  {generatedScript.cta}
                </p>
              </div>
            </div>

            {/* Enhanced Mini-insights */}
            <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-6 border border-border/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-text-primary">
                  Mini-insights de Claude
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-orange-600 text-sm">Duración</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {generatedScript.insights.duration_recommendation}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-blue-600 text-sm">Hook Strategy</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {generatedScript.insights.hook_strategy}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-600 text-sm">F/1k Esperado</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {generatedScript.insights.expected_f1k}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Empty State */}
      {!generatedScript && !loading && (
        <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-muted/10">
          <CardContent className="py-16 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-bright/20 to-blue-dark/10 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-10 h-10 text-blue-light" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-text-primary">
                Genera tu Guion Estructurado
              </h3>
              <p className="text-text-secondary max-w-lg mx-auto leading-relaxed">
                Selecciona una vertical, describe tu idea y Claude creará un guion optimizado para TikTok 
                con hook, desarrollo y CTA basado en mejores prácticas.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto text-sm">
              <div className="flex flex-col items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <Target className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-400">Hook Efectivo</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-400">Desarrollo Claro</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-purple-400">CTA Poderoso</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};