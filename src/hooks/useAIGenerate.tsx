import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HistoricalData } from '@/hooks/useHistoricalData';

export interface AIRequest {
  prompt: string;
  data?: HistoricalData;
  useHistoricalData?: boolean;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export const useAIGenerate = () => {
  const [loading, setLoading] = useState(false);

  const generateContent = async (request: AIRequest): Promise<AIResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt: request.prompt,
          data: request.useHistoricalData ? request.data : null
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate content');
      }

      return data;
    } catch (error) {
      console.error('Error generating AI content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setLoading(false);
    }
  };

  const generateIdeas = async (
    count: number = 5, 
    topic: string = '', 
    historicalData?: HistoricalData
  ): Promise<AIResponse> => {
    let prompt = `Genera ${count} ideas creativas para videos de TikTok`;
    
    if (topic) {
      prompt += ` sobre el tema: "${topic}"`;
    }

    if (historicalData && historicalData.videos.length > 0) {
      prompt += `\n\nBASE TUS SUGERENCIAS EN ESTOS DATOS HISTÓRICOS REALES:
      
Métricas promedio del usuario:
- Retención promedio: ${historicalData.metrics.avg_retention.toFixed(1)}%
- Saves por 1K vistas: ${historicalData.metrics.avg_saves_per_1k.toFixed(1)}
- Seguidores por 1K vistas (F/1k): ${historicalData.metrics.avg_f_per_1k.toFixed(1)}
- % For You promedio: ${historicalData.metrics.avg_for_you_percentage.toFixed(1)}%
- Engagement promedio: ${historicalData.metrics.avg_engagement_rate.toFixed(1)}%

Videos top performers (F/1k más alto):
${historicalData.videos
  .sort((a, b) => b.f_per_1k - a.f_per_1k)
  .slice(0, 3)
  .map(v => `- "${v.title}" (F/1k: ${v.f_per_1k.toFixed(1)}, Retención: ${v.retention_rate.toFixed(1)}%)`)
  .join('\n')}

Patrones detectados:
- Duración óptima: ${historicalData.patterns.optimal_duration_range.min}-${historicalData.patterns.optimal_duration_range.max} segundos
- Mejores hooks: ${historicalData.patterns.best_hook_types.join(', ')}

IMPORTANTE: Cada idea debe incluir:
1. Título del video
2. Descripción breve (2-3 líneas)
3. Badge explicando qué patrón histórico usaste
4. Por qué crees que funcionará basado en los datos

Formato de respuesta en JSON:
{
  "ideas": [
    {
      "title": "Título del video",
      "description": "Descripción breve del contenido",
      "pattern_used": "Patrón histórico aplicado",
      "reason": "Por qué debería funcionar según los datos"
    }
  ]
}`;
    } else {
      prompt += `\n\nNo tienes datos históricos disponibles, así que genera ideas generales pero efectivas para TikTok.

Formato de respuesta en JSON:
{
  "ideas": [
    {
      "title": "Título del video",
      "description": "Descripción breve del contenido", 
      "pattern_used": "Sugerencia general",
      "reason": "Por qué podría funcionar en TikTok"
    }
  ]
}`;
    }

    return generateContent({ prompt, data: historicalData, useHistoricalData: !!historicalData });
  };

  const generateScript = async (
    vertical: string,
    description: string,
    useHistoricalData: boolean,
    historicalData?: HistoricalData
  ): Promise<AIResponse> => {
    let prompt = `Genera un guion estructurado para TikTok sobre: "${description}"
    
Vertical: ${vertical}
`;

    if (useHistoricalData && historicalData && historicalData.videos.length > 0) {
      prompt += `\nBASADO EN ESTOS DATOS HISTÓRICOS REALES:

Métricas promedio:
- Retención: ${historicalData.metrics.avg_retention.toFixed(1)}%
- F/1k: ${historicalData.metrics.avg_f_per_1k.toFixed(1)}
- Duración óptima: ${historicalData.patterns.optimal_duration_range.min}-${historicalData.patterns.optimal_duration_range.max}s

Videos exitosos de referencia:
${historicalData.videos
  .sort((a, b) => b.f_per_1k - a.f_per_1k)
  .slice(0, 2)
  .map(v => `- "${v.title}" (Hook: "${v.hook?.substring(0, 50) || 'Sin hook'}...")`)
  .join('\n')}

GENERA UN GUION que aplique estos patrones exitosos.`;
    }

    prompt += `\n\nEstructura requerida:
1. HOOK (primeros 3-5 segundos) - Debe captar atención inmediatamente
2. DESARROLLO (cuerpo principal) - Mantén ritmo cada 3-5 segundos
3. CTA FINAL - Optimizado para conversión a seguidores

Formato de respuesta en JSON:
{
  "script": {
    "hook": "Hook de 3-5 segundos",
    "development": "Desarrollo principal del contenido", 
    "cta": "CTA final optimizado",
    "estimated_duration": "Duración estimada en segundos",
    "insights": {
      "duration_recommendation": "Por qué esta duración",
      "hook_strategy": "Por qué este tipo de hook",
      "expected_f1k": "F/1k esperado basado en patrones"
    }
  }
}`;

    return generateContent({ prompt, data: historicalData, useHistoricalData });
  };

  const generateStrategicInsights = async (
    question: string,
    historicalData?: HistoricalData
  ): Promise<AIResponse> => {
    let prompt = `Analiza esta pregunta estratégica sobre TikTok: "${question}"`;

    if (historicalData && historicalData.videos.length > 0) {
      prompt += `\n\nUSA ESTOS DATOS HISTÓRICOS REALES PARA TU ANÁLISIS:

Resumen del canal:
- ${historicalData.metrics.video_count} videos publicados
- ${historicalData.metrics.total_views.toLocaleString()} vistas totales
- ${historicalData.metrics.total_new_followers.toLocaleString()} seguidores generados
- Retención promedio: ${historicalData.metrics.avg_retention.toFixed(1)}%
- F/1k promedio: ${historicalData.metrics.avg_f_per_1k.toFixed(1)}

Top 3 videos por F/1k:
${historicalData.videos
  .sort((a, b) => b.f_per_1k - a.f_per_1k)
  .slice(0, 3)
  .map((v, i) => `${i+1}. "${v.title}" - F/1k: ${v.f_per_1k.toFixed(1)}, Retención: ${v.retention_rate.toFixed(1)}%, Vistas: ${v.views.toLocaleString()}`)
  .join('\n')}

Bottom 3 videos por F/1k:
${historicalData.videos
  .sort((a, b) => a.f_per_1k - b.f_per_1k)
  .slice(0, 3)
  .map((v, i) => `${i+1}. "${v.title}" - F/1k: ${v.f_per_1k.toFixed(1)}, Retención: ${v.retention_rate.toFixed(1)}%, Vistas: ${v.views.toLocaleString()}`)
  .join('\n')}

RESPONDE CON:
1. Análisis claro basado en los datos reales
2. 3-5 recomendaciones accionables específicas
3. Ejemplos de videos míos como referencia
4. Métricas clave a seguir

Formato JSON:
{
  "analysis": "Análisis detallado basado en datos",
  "recommendations": [
    "Recomendación 1",
    "Recomendación 2", 
    "Recomendación 3"
  ],
  "video_examples": [
    {
      "title": "Título del video ejemplo",
      "reason": "Por qué es relevante",
      "metrics": "Métricas destacadas"
    }
  ]
}`;
    } else {
      prompt += `\n\nNo hay datos históricos disponibles. Proporciona sugerencias generales pero útiles.

Formato JSON:
{
  "analysis": "Análisis general de la estrategia",
  "recommendations": [
    "Recomendación general 1",
    "Recomendación general 2"
  ],
  "note": "Para análisis más específicos, importa tus datos históricos de TikTok"
}`;
    }

    return generateContent({ prompt, data: historicalData, useHistoricalData: !!historicalData });
  };

  return {
    loading,
    generateIdeas,
    generateScript,
    generateStrategicInsights
  };
};