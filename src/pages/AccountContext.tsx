import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Save, Settings, Target, Users, Shield, Palette, TrendingUp, Brain, Sparkles, BarChart3 } from 'lucide-react';
import { useAccountContext, type AccountContext, type AudiencePersona } from '@/hooks/useAccountContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const METRIC_OPTIONS = [
  { value: 'follows_per_1k', label: 'Follows per 1K views', icon: '👥' },
  { value: 'saves_per_1k', label: 'Saves per 1K views', icon: '💾' },
  { value: 'retention_pct', label: 'Retention %', icon: '⏱️' },
  { value: 'engagement_rate', label: 'Engagement Rate', icon: '📈' },
  { value: 'views', label: 'Total Views', icon: '👁️' },
  { value: 'reach', label: 'Reach', icon: '🌐' },
];

export default function AccountContext() {
  const { context, loading, saveContext, getContext } = useAccountContext();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<AccountContext>({
    mission: '',
    brand_pillars: [],
    positioning: '',
    audience_personas: [],
    do_not_do: [],
    tone_guide: '',
    content_themes: [],
    north_star_metric: '',
    secondary_metrics: [],
    strategic_bets: [],
    negative_keywords: [],
    weights: { retention: 0.3, saves: 0.4, follows: 0.3 }
  });

  // Load existing context on mount
  useEffect(() => {
    getContext();
  }, []);

  // Update form when context is loaded
  useEffect(() => {
    if (context) {
      setFormData({
        mission: context.mission || '',
        brand_pillars: context.brand_pillars || [],
        positioning: context.positioning || '',
        audience_personas: context.audience_personas || [],
        do_not_do: context.do_not_do || [],
        tone_guide: context.tone_guide || '',
        content_themes: context.content_themes || [],
        north_star_metric: context.north_star_metric || '',
        secondary_metrics: context.secondary_metrics || [],
        strategic_bets: context.strategic_bets || [],
        negative_keywords: context.negative_keywords || [],
        weights: context.weights || { retention: 0.3, saves: 0.4, follows: 0.3 }
      });
    }
  }, [context]);

  const addStringArrayItem = (field: keyof AccountContext, value: string) => {
    if (!value.trim()) return;
    
    const currentArray = (formData[field] as string[]) || [];
    if (!currentArray.includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...currentArray, value.trim()]
      }));
    }
  };

  const removeStringArrayItem = (field: keyof AccountContext, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const addAudiencePersona = () => {
    const newPersona: AudiencePersona = {
      persona: '',
      pains: [],
      desires: []
    };
    
    setFormData(prev => ({
      ...prev,
      audience_personas: [...(prev.audience_personas || []), newPersona]
    }));
  };

  const updateAudiencePersona = (index: number, field: keyof AudiencePersona, value: any) => {
    setFormData(prev => ({
      ...prev,
      audience_personas: (prev.audience_personas || []).map((persona, i) => 
        i === index ? { ...persona, [field]: value } : persona
      )
    }));
  };

  const removeAudiencePersona = (index: number) => {
    setFormData(prev => ({
      ...prev,
      audience_personas: (prev.audience_personas || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    const success = await saveContext(formData);
    if (success) {
      toast({
        title: "💾 Contexto guardado",
        description: "Tu contexto de cuenta se ha actualizado correctamente",
      });
    }
  };

  const ArrayInputField = ({ 
    label, 
    field, 
    placeholder, 
    icon 
  }: { 
    label: string; 
    field: keyof AccountContext; 
    placeholder: string;
    icon?: React.ReactNode;
  }) => {
    const [inputValue, setInputValue] = useState('');
    
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          {icon}
          {label}
        </Label>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addStringArrayItem(field, inputValue);
                setInputValue('');
              }
            }}
            className="bg-background/60 border-border/60 focus:border-purple-bright/50 transition-all duration-200"
          />
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              addStringArrayItem(field, inputValue);
              setInputValue('');
            }}
            className="hover:border-purple-500/30 hover:text-purple-500 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {((formData[field] as string[]) || []).map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 transition-all duration-200">
              {item}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors duration-200" 
                onClick={() => removeStringArrayItem(field, index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Enhanced Header */}
        <div className="text-center space-y-6 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-blue-light bg-clip-text">
                Contexto de Cuenta
              </h1>
              <p className="text-lg text-text-secondary">
                Configura tu identidad estratégica
              </p>
            </div>
          </div>
          <p className="text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Define la identidad y objetivos estratégicos de tu cuenta de TikTok para personalizar todas las recomendaciones del TikTok Brain.
          </p>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="identity" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 bg-muted/50 backdrop-blur-sm p-1 rounded-xl shadow-lg">
              <TabsTrigger 
                value="identity" 
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                )}
              >
                <Target className="h-4 w-4" />
                <span className="font-medium">Identidad</span>
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                )}
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Audiencia</span>
              </TabsTrigger>
              <TabsTrigger 
                value="guardrails" 
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                )}
              >
                <Shield className="h-4 w-4" />
                <span className="font-medium">Guardrails</span>
              </TabsTrigger>
              <TabsTrigger 
                value="metrics" 
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                )}
              >
                <Settings className="h-4 w-4" />
                <span className="font-medium">Métricas</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="identity" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Identidad de Marca
                    </CardTitle>
                    <CardDescription className="text-text-secondary">
                      Define la misión, posicionamiento y pilares fundamentales de tu marca.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-text-primary">Misión</Label>
                  <Textarea
                    value={formData.mission}
                    onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                    placeholder="Ej: Lograr que irrelevant sea viral en TikTok para bajar tráfico al funnel"
                    className="h-24 bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
                  />
                </div>

                <ArrayInputField
                  label="Pilares de Marca"
                  field="brand_pillars"
                  placeholder="Ej: IA aplicada a negocios"
                  icon={<Palette className="h-4 w-4 text-blue-500" />}
                />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-text-primary">Posicionamiento</Label>
                  <Textarea
                    value={formData.positioning}
                    onChange={(e) => setFormData(prev => ({ ...prev, positioning: e.target.value }))}
                    placeholder="Ej: Estilo irreverente, directo y sin filtro"
                    className="h-24 bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-text-primary">Guía de Tono</Label>
                  <Textarea
                    value={formData.tone_guide}
                    onChange={(e) => setFormData(prev => ({ ...prev, tone_guide: e.target.value }))}
                    placeholder="Describe el tono de voz que debe usar tu marca"
                    className="h-24 bg-background/60 border-border/60 focus:border-blue-500/50 transition-all duration-200 resize-none"
                  />
                </div>

                <ArrayInputField
                  label="Temas de Contenido"
                  field="content_themes"
                  placeholder="Ej: Automatización"
                  icon={<Sparkles className="h-4 w-4 text-purple-500" />}
                />

                <ArrayInputField
                  label="Apuestas Estratégicas"
                  field="strategic_bets"
                  placeholder="Ej: Contenido educativo viral"
                  icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Audiencia y Personas
                    </CardTitle>
                    <CardDescription className="text-text-secondary">
                      Define los diferentes tipos de audiencia y sus características.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {(formData.audience_personas || []).map((persona, index) => (
                  <Card key={index} className="bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                            <Users className="h-4 w-4 text-blue-500" />
                          </div>
                          <h4 className="font-semibold text-text-primary">Persona {index + 1}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAudiencePersona(index)}
                          className="hover:text-red-500 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-text-primary">Descripción de la Persona</Label>
                          <Input
                            value={persona.persona}
                            onChange={(e) => updateAudiencePersona(index, 'persona', e.target.value)}
                            placeholder="Ej: Emprendedores tech de 25-40 años"
                            className="bg-background/60 border-border/60 focus:border-green-500/50 transition-all duration-200"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <span className="text-red-500">⚠️</span>
                            Pain Points
                          </Label>
                          <Input
                            placeholder="Agrega un pain point y presiona Enter"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const value = (e.target as HTMLInputElement).value.trim();
                                if (value) {
                                  updateAudiencePersona(index, 'pains', [...persona.pains, value]);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            className="bg-background/60 border-border/60 focus:border-red-500/50 transition-all duration-200"
                          />
                          <div className="flex flex-wrap gap-2">
                            {persona.pains.map((pain, painIndex) => (
                              <Badge key={painIndex} className="flex items-center gap-1 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 transition-all duration-200">
                                {pain}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-red-600 transition-colors duration-200" 
                                  onClick={() => {
                                    const newPains = persona.pains.filter((_, i) => i !== painIndex);
                                    updateAudiencePersona(index, 'pains', newPains);
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <span className="text-green-500">✨</span>
                            Deseos
                          </Label>
                          <Input
                            placeholder="Agrega un deseo y presiona Enter"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const value = (e.target as HTMLInputElement).value.trim();
                                if (value) {
                                  updateAudiencePersona(index, 'desires', [...persona.desires, value]);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            className="bg-background/60 border-border/60 focus:border-green-500/50 transition-all duration-200"
                          />
                          <div className="flex flex-wrap gap-2">
                            {persona.desires.map((desire, desireIndex) => (
                              <Badge key={desireIndex} className="flex items-center gap-1 bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 transition-all duration-200">
                                {desire}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-green-600 transition-colors duration-200" 
                                  onClick={() => {
                                    const newDesires = persona.desires.filter((_, i) => i !== desireIndex);
                                    updateAudiencePersona(index, 'desires', newDesires);
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAudiencePersona}
                  className="w-full py-3 hover:border-green-500/30 hover:text-green-500 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Persona
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guardrails" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Guardrails y Restricciones
                    </CardTitle>
                    <CardDescription className="text-text-secondary">
                      Define qué no debe hacer tu marca y palabras clave a evitar.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <ArrayInputField
                  label="Lista de No-Go"
                  field="do_not_do"
                  placeholder="Ej: no contenido político"
                  icon={<Shield className="h-4 w-4 text-red-500" />}
                />

                <ArrayInputField
                  label="Palabras Clave Negativas"
                  field="negative_keywords"
                  placeholder="Ej: técnico pesado"
                  icon={<X className="h-4 w-4 text-orange-500" />}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-text-primary">
                      Métricas y Pesos
                    </CardTitle>
                    <CardDescription className="text-text-secondary">
                      Define tu métrica estrella y cómo ponderar diferentes indicadores.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-text-primary">Métrica Estrella (North Star)</Label>
                  <Select
                    value={formData.north_star_metric}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, north_star_metric: value }))}
                  >
                    <SelectTrigger className="bg-background/60 border-border/60 focus:border-purple-500/50 transition-all duration-200">
                      <SelectValue placeholder="Selecciona tu métrica principal" />
                    </SelectTrigger>
                    <SelectContent>
                      {METRIC_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-6">
                  <Label className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    Pesos por Métrica
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <Label className="font-semibold text-green-600">⏱️ Retención</Label>
                        <span className="text-sm font-bold text-green-500">
                          {Math.round((formData.weights?.retention || 0.3) * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[formData.weights?.retention || 0.3]}
                        onValueChange={([value]) => 
                          setFormData(prev => ({
                            ...prev,
                            weights: { ...prev.weights!, retention: value }
                          }))
                        }
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <Label className="font-semibold text-purple-600">💾 Saves</Label>
                        <span className="text-sm font-bold text-purple-500">
                          {Math.round((formData.weights?.saves || 0.4) * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[formData.weights?.saves || 0.4]}
                        onValueChange={([value]) => 
                          setFormData(prev => ({
                            ...prev,
                            weights: { ...prev.weights!, saves: value }
                          }))
                        }
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <Label className="font-semibold text-blue-600">👥 Follows</Label>
                        <span className="text-sm font-bold text-blue-500">
                          {Math.round((formData.weights?.follows || 0.3) * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[formData.weights?.follows || 0.3]}
                        onValueChange={([value]) => 
                          setFormData(prev => ({
                            ...prev,
                            weights: { ...prev.weights!, follows: value }
                          }))
                        }
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-8 border-border/30" />

        <div className="flex justify-center">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            size="lg"
            className="flex items-center gap-3 px-8 py-3 text-lg font-semibold bg-gradient-primary hover:opacity-90 shadow-xl transition-all duration-200"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Guardando...' : 'Guardar Contexto'}
          </Button>
        </div>
      </div>
    </div>
  );
}