import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Copy, TrendingUp, AlertTriangle, CheckCircle2, Target, Zap, BarChart3, Lightbulb, ArrowUp, Eye, Heart, Users, Brain, Sparkles } from 'lucide-react';
import { useScriptAnalyzer, type ScriptAnalysisParams } from '@/hooks/useScriptAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ViralAnalyzer() {
  const [hook, setHook] = useState('');
  const [script, setScript] = useState('');
  const [cta, setCta] = useState('');
  const { loading, analysis, analyzeScript } = useScriptAnalyzer();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    const params: ScriptAnalysisParams = {
      hook: hook.trim(),
      script: script.trim(),
      cta: cta.trim()
    };

    await analyzeScript(params);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'hook': return '🎯';
      case 'script': return '📝';
      case 'cta': return '✨';
      default: return '💡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                Analizador de Guiones
              </h1>
              <p className="text-lg text-text-secondary">
                Evalúa y mejora tus Hook + Guión + CTA
              </p>
            </div>
          </div>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Analiza la estructura completa de tu guión y recibe mejoras específicas y accionables basadas en datos
          </p>
        </div>

        {/* Enhanced Input Section */}
        <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-text-primary">
                  Estructura del Guión
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Ingresa cada componente de tu guión para análisis integral
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  🎯 Hook (Gancho inicial)
                </label>
                <Textarea
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="Ej: ¿Sabías que el 90% de emprendedores comete este error fatal?"
                  rows={4}
                  className="bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  📝 Cuerpo del Guión
                </label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Desarrollo principal del video, puntos clave, explicaciones..."
                  rows={4}
                  className="bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  ✨ Call to Action
                </label>
                <Textarea
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Ej: Comenta 'QUIERO' si te sirvió este tip"
                  rows={4}
                  className="bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            <Button 
              onClick={handleAnalyze}
              disabled={loading || (!hook.trim() && !script.trim() && !cta.trim())}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Brain className="h-5 w-5 mr-2 animate-pulse" />
                  Analizando guión completo...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Analizar Guión Completo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Overall Score */}
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Score General del Guión
                    </CardTitle>
                    <CardDescription>
                      Evaluación integral basada en datos históricos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="text-center space-y-2">
                    <div className={cn("text-4xl font-bold", getScoreColor(analysis.overall_score))}>
                      {analysis.overall_score}%
                    </div>
                    <div className="text-sm text-text-muted">Score General</div>
                    <Progress value={analysis.overall_score} className="h-2" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className={cn("text-2xl font-bold", getScoreColor(analysis.viral_potential.hook_score))}>
                      {analysis.viral_potential.hook_score}%
                    </div>
                    <div className="text-xs text-text-muted">🎯 Hook</div>
                    <Progress value={analysis.viral_potential.hook_score} className="h-2" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className={cn("text-2xl font-bold", getScoreColor(analysis.viral_potential.script_score))}>
                      {analysis.viral_potential.script_score}%
                    </div>
                    <div className="text-xs text-text-muted">📝 Guión</div>
                    <Progress value={analysis.viral_potential.script_score} className="h-2" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className={cn("text-2xl font-bold", getScoreColor(analysis.viral_potential.cta_score))}>
                      {analysis.viral_potential.cta_score}%
                    </div>
                    <div className="text-xs text-text-muted">✨ CTA</div>
                    <Progress value={analysis.viral_potential.cta_score} className="h-2" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className={cn("text-2xl font-bold", getScoreColor(analysis.viral_potential.coherence_score))}>
                      {analysis.viral_potential.coherence_score}%
                    </div>
                    <div className="text-xs text-text-muted">🔗 Coherencia</div>
                    <Progress value={analysis.viral_potential.coherence_score} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                    <ArrowUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Mejoras Accionables
                    </CardTitle>
                    <CardDescription>
                      Optimizaciones específicas ordenadas por impacto
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.improvements.map((improvement, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getSectionIcon(improvement.section)}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-500/10 border-purple-500/20 text-purple-600">
                            {improvement.section.toUpperCase()}
                          </Badge>
                          <span className="text-lg">{getPriorityIcon(improvement.priority)}</span>
                          <Badge 
                            className={cn(
                              "text-xs",
                              improvement.priority === 'high' && "bg-red-500/10 border-red-500/20 text-red-600",
                              improvement.priority === 'medium' && "bg-yellow-500/10 border-yellow-500/20 text-yellow-600",
                              improvement.priority === 'low' && "bg-green-500/10 border-green-500/20 text-green-600"
                            )}
                          >
                            {improvement.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted">Impacto:</span>
                        <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-600">
                          {improvement.impact_score}/10
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-red-600">❌ ACTUAL:</label>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                          <p className="text-sm text-text-primary">{improvement.current_text}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-green-600">✅ MEJORADO:</label>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 relative">
                          <p className="text-sm text-text-primary">{improvement.improved_text}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(improvement.improved_text)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-green-500/20"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold text-blue-600">💡 ¿Por qué mejorarlo?</span><br />
                        {improvement.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths and Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-green-600">
                      Fortalezas Detectadas
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-text-primary leading-relaxed">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-md">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-amber-600">
                      Riesgos Identificados
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.risks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-text-primary leading-relaxed">{risk}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Similar Successful Scripts */}
            {analysis.similar_successful_scripts.length > 0 && (
              <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-text-primary">
                        Guiones Similares Exitosos
                      </CardTitle>
                      <CardDescription>
                        Referencias de alto rendimiento para inspirarte
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.similar_successful_scripts.map((script, index) => (
                    <div 
                      key={index} 
                      className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30 space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-purple-600">🎯 Hook:</label>
                          <p className="text-sm text-text-primary bg-purple-500/10 p-2 rounded">{script.hook}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-blue-600">📝 Extracto:</label>
                          <p className="text-sm text-text-primary bg-blue-500/10 p-2 rounded">{script.script_excerpt}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-green-600">✨ CTA:</label>
                          <p className="text-sm text-text-primary bg-green-500/10 p-2 rounded">{script.cta}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-border/30">
                        <div className="text-center p-2 bg-purple-500/10 rounded">
                          <div className="text-sm font-bold text-purple-400">💾 {script.metrics.saves_per_1k.toFixed(1)}</div>
                          <div className="text-xs text-text-muted">Saves/1k</div>
                        </div>
                        <div className="text-center p-2 bg-blue-500/10 rounded">
                          <div className="text-sm font-bold text-blue-400">👥 {script.metrics.f_per_1k.toFixed(1)}</div>
                          <div className="text-xs text-text-muted">Follows/1k</div>
                        </div>
                        <div className="text-center p-2 bg-green-500/10 rounded">
                          <div className="text-sm font-bold text-green-400">⏱️ {script.metrics.retention_pct.toFixed(0)}%</div>
                          <div className="text-xs text-text-muted">Retención</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-500/10 rounded">
                          <div className="text-sm font-bold text-yellow-400">👀 {(script.metrics.views / 1000).toFixed(0)}k</div>
                          <div className="text-xs text-text-muted">Views</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Execution Tips */}
            {analysis.execution_tips.length > 0 && (
              <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-md">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-text-primary">
                        Tips de Ejecución
                      </CardTitle>
                      <CardDescription>
                        Consejos prácticos para maximizar el impacto
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.execution_tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-text-primary leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}