import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Copy, TrendingUp, AlertTriangle, Users, Eye, Heart } from 'lucide-react';
import { useViralAnalyzer, type ViralAnalysisParams } from '@/hooks/useViralAnalyzer';
import { useToast } from '@/hooks/use-toast';

export default function ViralAnalyzer() {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'hook' | 'guion' | 'cta'>('hook');
  const { loading, analysis, analyzeContent } = useViralAnalyzer();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    const params: ViralAnalysisParams = {
      content: content.trim(),
      content_type: contentType
    };

    await analyzeContent(params);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const formatPercentage = (value: number) => Math.round(value * 100);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Analizador de Potencial Viral</h1>
        <p className="text-muted-foreground">
          Analiza el potencial viral de tu contenido con IA y datos históricos
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido a Analizar</CardTitle>
          <CardDescription>
            Ingresa el hook, guión o CTA que quieres analizar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Contenido</label>
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hook">Hook (Gancho)</SelectItem>
                <SelectItem value="guion">Guión</SelectItem>
                <SelectItem value="cta">Call to Action</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contenido</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Escribe tu ${contentType} aquí...`}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
            className="w-full"
          >
            {loading ? 'Analizando...' : 'Analizar Potencial Viral'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Probabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Probabilidades de Éxito
              </CardTitle>
              {analysis.guardrail_adjusted && (
                <Badge variant="outline" className="w-fit">
                  Contenido ajustado por guardrails
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      Top 10% Views
                    </span>
                    <span className="text-sm font-bold">
                      {formatPercentage(analysis.analysis.probabilities.P_top10_views)}%
                    </span>
                  </div>
                  <Progress value={analysis.analysis.probabilities.P_top10_views * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Heart className="h-4 w-4" />
                      P90 Saves
                    </span>
                    <span className="text-sm font-bold">
                      {formatPercentage(analysis.analysis.probabilities.P_saves_p90)}%
                    </span>
                  </div>
                  <Progress value={analysis.analysis.probabilities.P_saves_p90 * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      P90 Follows
                    </span>
                    <span className="text-sm font-bold">
                      {formatPercentage(analysis.analysis.probabilities.P_follow_p90)}%
                    </span>
                  </div>
                  <Progress value={analysis.analysis.probabilities.P_follow_p90 * 100} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Aspectos Positivos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.positives.map((positive, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <span className="text-sm">{positive}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Riesgos Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                      <span className="text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variantes Sugeridas</CardTitle>
              <CardDescription>
                Diferentes enfoques basados en tu contenido original
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={variant.version === 'clickbait' ? 'default' : 
                        variant.version === 'benefit_led' ? 'secondary' : 'outline'}>
                        {variant.version === 'clickbait' ? 'Clickbait' :
                         variant.version === 'benefit_led' ? 'Basado en Beneficios' : 'Contrario'}
                      </Badge>
                      <Badge variant={variant.recommended === 'exploit' ? 'destructive' : 'default'}>
                        {variant.recommended === 'exploit' ? 'Exploit' : 'Explore'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(variant.text)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm">{variant.text}</p>
                  <p className="text-xs text-muted-foreground">{variant.why_variant}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Similar Content */}
          {analysis.analysis.neighbors_used.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contenido Similar Exitoso</CardTitle>
                <CardDescription>
                  Ejemplos históricos usados para el análisis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.analysis.neighbors_used.map((neighbor, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <p className="text-sm">{neighbor.content}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Saves: {neighbor.metrics.saves_per_1k.toFixed(1)}/1k</span>
                      <span>Follows: {neighbor.metrics.f_per_1k.toFixed(1)}/1k</span>
                      <span>Retención: {neighbor.metrics.retention_pct.toFixed(1)}%</span>
                      <span>Views: {neighbor.metrics.views.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}