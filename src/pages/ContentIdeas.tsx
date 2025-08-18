import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, Target, Zap, TrendingUp, Copy, ThumbsUp, ThumbsDown, Play, Brain, Sparkles, BarChart3, Settings, Filter } from 'lucide-react';
import { useContentIdeas, GenerateIdeasParams, ContentIdea, IdeaFeedback } from '@/hooks/useContentIdeas';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ContentIdeas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'hook' | 'guion' | 'cta'>('hook');
  const [selectedMode, setSelectedMode] = useState<'exploit' | 'explore' | 'mixed'>('mixed');
  const [showExploitOnly, setShowExploitOnly] = useState(false);
  const [recipeBuilder, setRecipeBuilder] = useState({
    hook: '',
    guion: '',
    cta: ''
  });
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; idea: ContentIdea | null }>({
    open: false,
    idea: null
  });
  
  const { loading, ideas, generateIdeas, submitFeedback } = useContentIdeas();
  const { toast } = useToast();

  const handleGenerateIdeas = async () => {
    const params: GenerateIdeasParams = {
      query: searchQuery.trim() || undefined,
      type: selectedType,
      topK: 8,
      mode: selectedMode
    };

    await generateIdeas(params);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado",
      description: "Texto copiado al portapapeles"
    });
  };

  const handleAddToRecipe = (idea: ContentIdea, type: 'hook' | 'guion' | 'cta') => {
    setRecipeBuilder(prev => ({
      ...prev,
      [type]: idea.text
    }));
    toast({
      title: "✨ Agregado al Recipe Builder",
      description: `${type} agregado exitosamente`
    });
  };

  const handleFeedback = async (idea: ContentIdea, outcome: 'success' | 'failure') => {
    const feedback: IdeaFeedback = {
      idea_id: idea.id,
      idea_text: idea.text,
      idea_type: selectedType,
      idea_mode: idea.mode,
      outcome,
      feedback_notes: `User marked as ${outcome}`
    };

    await submitFeedback(feedback);
    setFeedbackDialog({ open: false, idea: null });
    
    toast({
      title: outcome === 'success' ? "👍 Feedback positivo" : "👎 Feedback negativo",
      description: "Gracias por tu feedback, nos ayuda a mejorar"
    });
  };

  const generateScript = () => {
    const { hook, guion, cta } = recipeBuilder;
    if (!hook && !guion && !cta) return '';
    
    return `${hook ? `🎯 HOOK:\n${hook}\n\n` : ''}${guion ? `📝 GUIÓN:\n${guion}\n\n` : ''}${cta ? `✨ CTA:\n${cta}` : ''}`;
  };

  const filteredIdeas = ideas?.ideas.filter(idea => 
    !showExploitOnly || idea.mode === 'exploit'
  ) || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hook': return '🎯';
      case 'guion': return '📝';
      case 'cta': return '✨';
      default: return '💡';
    }
  };

  const getModeColor = (mode: string) => {
    return mode === 'exploit' ? 'green' : 'blue';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-bright to-purple-dark rounded-2xl shadow-xl">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                Generador de Ideas
              </h1>
              <p className="text-lg text-text-secondary">
                Hooks, guiones y CTAs basados en tu TikTok Brain
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Search Controls */}
        <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-text-primary">
                Configuración de Generación
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="search-query" className="text-sm font-semibold text-text-primary">
                  Consulta (opcional)
                </Label>
                <Input
                  id="search-query"
                  placeholder="ej: hooks sobre productividad"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content-type" className="text-sm font-semibold text-text-primary">
                  Tipo de Contenido
                </Label>
                <Select value={selectedType} onValueChange={(value: 'hook' | 'guion' | 'cta') => setSelectedType(value)}>
                  <SelectTrigger className="bg-background/60 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hook">🎯 Hook</SelectItem>
                    <SelectItem value="guion">📝 Guión</SelectItem>
                    <SelectItem value="cta">✨ CTA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="generation-mode" className="text-sm font-semibold text-text-primary">
                  Modo de Generación
                </Label>
                <Select value={selectedMode} onValueChange={(value: 'exploit' | 'explore' | 'mixed') => setSelectedMode(value)}>
                  <SelectTrigger className="bg-background/60 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">🔄 Mixto</SelectItem>
                    <SelectItem value="exploit">🎯 Exploit (Probado)</SelectItem>
                    <SelectItem value="explore">🔬 Explore (Experimental)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleGenerateIdeas} 
                  disabled={loading}
                  className="w-full py-3 bg-gradient-primary hover:opacity-90 shadow-lg transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generar Ideas
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-purple-bright" />
                  <div>
                    <Label htmlFor="exploit-filter" className="font-semibold text-text-primary">
                      Solo ideas Exploit (probadas)
                    </Label>
                    <p className="text-xs text-text-muted">
                      Mostrar únicamente patrones con historial de éxito
                    </p>
                  </div>
                </div>
                <Switch
                  id="exploit-filter"
                  checked={showExploitOnly}
                  onCheckedChange={setShowExploitOnly}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-bright data-[state=checked]:to-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="ideas" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-2 bg-muted/50 backdrop-blur-sm p-1 rounded-xl shadow-lg">
              <TabsTrigger 
                value="ideas" 
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                )}
              >
                <Target className="h-4 w-4" />
                <span className="font-medium">Ideas Generadas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="recipe" 
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                )}
              >
                <Zap className="h-4 w-4" />
                <span className="font-medium">Recipe Builder</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ideas" className="space-y-6">
            {ideas && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Enhanced Ideas */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between bg-gradient-to-r from-success/10 to-green-600/10 rounded-xl p-4 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success/20 rounded-lg">
                        <span className="text-2xl">{getTypeIcon(selectedType)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text-primary">
                          {filteredIdeas.length} Ideas {selectedType}
                        </h3>
                        <p className="text-sm text-success">
                          Basadas en tus patrones exitosos
                        </p>
                      </div>
                    </div>
                    {ideas.facets.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ideas.facets.themes.slice(0, 3).map(theme => (
                          <Badge key={theme} variant="secondary" className="text-xs bg-purple-500/10 text-purple-400">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {filteredIdeas.map((idea, index) => (
                      <Card 
                        key={idea.id} 
                        className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg hover:shadow-2xl transition-all duration-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={idea.mode === 'exploit' ? 'default' : 'secondary'}
                                className={cn(
                                  "text-xs font-semibold px-3 py-1",
                                  idea.mode === 'exploit' 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                )}
                              >
                                {idea.mode === 'exploit' ? '🎯 Exploit' : '🔬 Explore'}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-400"
                              >
                                {Math.round(idea.confidence * 100)}% confianza
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="bg-gradient-to-br from-muted/40 to-muted/20 p-4 rounded-xl border border-border/30">
                            <p className="font-medium text-sm leading-relaxed text-text-primary">
                              {idea.text}
                            </p>
                          </div>
                          
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-sm text-text-secondary leading-relaxed">
                              <span className="font-semibold text-blue-600">💡 Justificación:</span><br />
                              {idea.justification}
                            </p>
                          </div>
                          
                          {idea.examples.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                                <BarChart3 className="w-3 h-3" />
                                Ejemplos similares exitosos:
                              </p>
                              {idea.examples.map((example, idx) => (
                                <div key={idx} className="bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-lg p-3 text-xs">
                                  <p className="mb-2 font-medium text-text-primary">
                                    "{example.content.substring(0, 80)}..."
                                  </p>
                                  <div className="grid grid-cols-3 gap-3 text-text-muted">
                                    <div className="text-center p-2 bg-purple-500/10 rounded">
                                      <div className="font-bold text-purple-400">💾 {example.metrics.saves_per_1k.toFixed(1)}</div>
                                      <div className="text-xs">Saves/1k</div>
                                    </div>
                                    <div className="text-center p-2 bg-blue-500/10 rounded">
                                      <div className="font-bold text-blue-400">👥 {example.metrics.f_per_1k.toFixed(1)}</div>
                                      <div className="text-xs">Follows/1k</div>
                                    </div>
                                    <div className="text-center p-2 bg-green-500/10 rounded">
                                      <div className="font-bold text-green-400">⏱️ {example.metrics.retention_pct.toFixed(0)}%</div>
                                      <div className="text-xs">Retención</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyToClipboard(idea.text)}
                              className="flex-1 hover:border-blue-500/30 hover:text-blue-500 transition-all duration-200"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddToRecipe(idea, selectedType)}
                              className="flex-1 hover:border-purple-500/30 hover:text-purple-500 transition-all duration-200"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              + Recipe
                            </Button>
                            
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeedback(idea, 'success')}
                                className="p-2 hover:border-green-500/30 hover:text-green-500 transition-all duration-200"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFeedback(idea, 'failure')}
                                className="p-2 hover:border-red-500/30 hover:text-red-500 transition-all duration-200"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Enhanced Facets Sidebar */}
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Filter className="h-5 w-5 text-purple-bright" />
                        Facetas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {ideas.facets.themes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-text-primary">Temas</h4>
                          <div className="flex flex-wrap gap-2">
                            {ideas.facets.themes.map(theme => (
                              <Badge key={theme} variant="secondary" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {ideas.facets.cta_types.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-text-primary">Tipos de CTA</h4>
                          <div className="flex flex-wrap gap-2">
                            {ideas.facets.cta_types.map(type => (
                              <Badge key={type} variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {ideas.facets.editing_styles.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-text-primary">Estilos</h4>
                          <div className="flex flex-wrap gap-2">
                            {ideas.facets.editing_styles.map(style => (
                              <Badge key={style} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                                {style}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Estadísticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between items-center p-2 bg-blue-500/10 rounded-lg">
                          <span className="text-text-secondary">Ideas generadas:</span>
                          <span className="font-bold text-blue-400">{ideas.total_generated}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-500/10 rounded-lg">
                          <span className="text-text-secondary">Tiempo:</span>
                          <span className="font-bold text-green-400">{ideas.generation_time_ms}ms</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-500/10 rounded-lg">
                          <span className="text-text-secondary">Exploit vs Explore:</span>
                          <span className="font-bold text-purple-400">
                            {ideas.ideas.filter(i => i.mode === 'exploit').length}:{ideas.ideas.filter(i => i.mode === 'explore').length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {!ideas && !loading && (
              <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-muted/10">
                <CardContent className="py-16 text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-bright/20 to-purple-dark/10 rounded-2xl flex items-center justify-center mx-auto">
                      <Lightbulb className="w-10 h-10 text-purple-light" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-text-primary">
                      Genera Ideas de Contenido
                    </h3>
                    <p className="text-text-secondary max-w-md mx-auto">
                      Utiliza tu TikTok Brain para generar hooks, guiones y CTAs basados en patrones exitosos
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recipe" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Recipe Builder
                    </CardTitle>
                    <p className="text-sm text-text-secondary">
                      Combina diferentes elementos para crear tu guión completo
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="recipe-hook" className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      🎯 Hook
                    </Label>
                    <Textarea
                      id="recipe-hook"
                      placeholder="Selecciona un hook o escribe el tuyo..."
                      value={recipeBuilder.hook}
                      onChange={(e) => setRecipeBuilder(prev => ({ ...prev, hook: e.target.value }))}
                      rows={4}
                      className="bg-background/60 border-border/60 focus:border-green-500/50 transition-all duration-200 resize-none"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="recipe-guion" className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      📝 Guión
                    </Label>
                    <Textarea
                      id="recipe-guion"
                      placeholder="Selecciona un guión o escribe el tuyo..."
                      value={recipeBuilder.guion}
                      onChange={(e) => setRecipeBuilder(prev => ({ ...prev, guion: e.target.value }))}
                      rows={4}
                      className="bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="recipe-cta" className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      ✨ CTA
                    </Label>
                    <Textarea
                      id="recipe-cta"
                      placeholder="Selecciona un CTA o escribe el tuyo..."
                      value={recipeBuilder.cta}
                      onChange={(e) => setRecipeBuilder(prev => ({ ...prev, cta: e.target.value }))}
                      rows={4}
                      className="bg-background/60 border-border/60 focus:border-purple-500/50 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                <Separator className="border-border/30" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <Play className="h-5 w-5 text-orange-500" />
                      Guión Completo
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyToClipboard(generateScript())}
                      disabled={!generateScript()}
                      className="gap-2 hover:border-green-500/30 hover:text-green-500 transition-all duration-200"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar Guión
                    </Button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-muted/40 to-muted/20 p-6 rounded-xl min-h-[200px] whitespace-pre-line border border-border/30">
                    {generateScript() || (
                      <div className="text-center text-text-muted space-y-3">
                        <Sparkles className="w-8 h-8 mx-auto opacity-50" />
                        <span>
                          Tu guión completo aparecerá aquí cuando agregues elementos...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}