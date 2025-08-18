import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ScriptAnalysisParams {
  hook: string;
  script: string;
  cta: string;
}

interface ScriptImprovement {
  section: 'hook' | 'script' | 'cta';
  current_text: string;
  improved_text: string;
  reason: string;
  impact_score: number;
  priority: 'high' | 'medium' | 'low';
}

interface ScriptAnalysisResult {
  overall_score: number;
  viral_potential: {
    hook_score: number;
    script_score: number;
    cta_score: number;
    coherence_score: number;
  };
  improvements: ScriptImprovement[];
  strengths: string[];
  risks: string[];
  similar_successful_scripts: Array<{
    hook: string;
    script_excerpt: string;
    cta: string;
    metrics: {
      saves_per_1k: number;
      f_per_1k: number;
      retention_pct: number;
      views: number;
    };
  }>;
  execution_tips: string[];
}

// Get account context for guardrails and strategic alignment
async function getAccountContext(userId: string): Promise<any> {
  try {
    const { data: context } = await supabase
      .from('tiktok_account_contexts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Account context loaded:', !!context);
    return context || {
      mission: 'No definida',
      brand_pillars: [],
      positioning: 'No definido',
      content_themes: [],
      tone_guide: 'Profesional pero accesible',
      north_star_metric: 'engagement',
      strategic_bets: [],
      do_not_do: [],
      negative_keywords: [],
      weights: { retention: 0.3, saves: 0.5, follows: 0.2, fyp: 0.0 }
    };
  } catch (error) {
    console.error('Error loading account context:', error);
    return {
      mission: 'No definida',
      brand_pillars: [],
      positioning: 'No definido',
      content_themes: [],
      tone_guide: 'Profesional pero accesible',
      north_star_metric: 'engagement',
      strategic_bets: [],
      do_not_do: [],
      negative_keywords: [],
      weights: { retention: 0.3, saves: 0.5, follows: 0.2, fyp: 0.0 }
    };
  }
}

// Get successful scripts from brain vectors for reference
async function getSuccessfulScripts(userId: string, limit: number = 5): Promise<any[]> {
  const { data: scripts } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT DISTINCT
        h.content as hook,
        s.content as script_content,
        c.content as cta,
        h.saves_per_1k,
        h.f_per_1k,
        h.retention_pct,
        h.views,
        h.video_id
      FROM tiktok_brain_vectors h
      LEFT JOIN tiktok_brain_vectors s ON h.video_id = s.video_id AND s.content_type = 'content'
      LEFT JOIN tiktok_brain_vectors c ON h.video_id = c.video_id AND c.content_type = 'cta'
      WHERE h.user_id = $1
        AND h.content_type = 'hook'
        AND h.is_duplicate = false
        AND h.saves_per_1k > 2
        AND h.f_per_1k > 1
        AND h.retention_pct > 30
        AND h.published_date >= CURRENT_DATE - INTERVAL '90 days'
      ORDER BY 
        (COALESCE(h.saves_per_1k, 0) + COALESCE(h.f_per_1k, 0) + COALESCE(h.retention_pct, 0)/10) DESC
      LIMIT $2
    `,
    params: [userId, limit]
  });

  return scripts || [];
}

// Generate embeddings for similarity analysis
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 1536
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI embedding error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Find similar successful content using vector similarity
async function findSimilarContent(userId: string, text: string, contentType: string): Promise<any[]> {
  try {
    const embedding = await generateEmbedding(text);
    const embeddingStr = `[${embedding.join(',')}]`;
    
    const { data: similar } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          content,
          saves_per_1k,
          f_per_1k,
          retention_pct,
          views,
          (embedding_es <=> $2::vector) as distance
        FROM tiktok_brain_vectors
        WHERE user_id = $1
          AND content_type = $3
          AND is_duplicate = false
          AND saves_per_1k > 1.5
          AND published_date >= CURRENT_DATE - INTERVAL '90 days'
        ORDER BY embedding_es <=> $2::vector
        LIMIT 5
      `,
      params: [userId, embeddingStr, contentType]
    });

    return similar || [];
  } catch (error) {
    console.error('Error finding similar content:', error);
    return [];
  }
}

// Main analysis function using AI
async function analyzeScriptWithAI(
  userId: string,
  params: ScriptAnalysisParams,
  context: any,
  successfulScripts: any[]
): Promise<ScriptAnalysisResult> {
  
  const scriptText = `Hook: ${params.hook}\nGuión: ${params.script}\nCTA: ${params.cta}`;
  
  // Get similar content for each section
  const [similarHooks, similarScripts, similarCTAs] = await Promise.all([
    params.hook ? findSimilarContent(userId, params.hook, 'hook') : [],
    params.script ? findSimilarContent(userId, params.script, 'content') : [],
    params.cta ? findSimilarContent(userId, params.cta, 'cta') : []
  ]);

  const systemPrompt = `Eres un experto analista de contenido viral para TikTok especializado en optimizar guiones completos. Tu trabajo es evaluar la estructura Hook + Guión + CTA y proporcionar mejoras específicas y accionables.

CONTEXTO DE LA CUENTA:
- Misión: ${context.mission}
- Pilares de marca: ${context.brand_pillars?.join(', ') || 'No definidos'}
- Posicionamiento: ${context.positioning}
- Temas de contenido: ${context.content_themes?.join(', ') || 'Generales'}
- Tono: ${context.tone_guide}
- Métrica principal: ${context.north_star_metric}
- Apuestas estratégicas: ${context.strategic_bets?.join(', ') || 'No definidas'}
- NO hacer: ${context.do_not_do?.join(', ') || 'Nada específico'}
- Palabras negativas: ${context.negative_keywords?.join(', ') || 'Ninguna'}

PESOS DE MÉTRICAS:
- Retención: ${context.weights?.retention || 0.3}
- Saves: ${context.weights?.saves || 0.5}  
- Follows: ${context.weights?.follows || 0.2}

GUIONES EXITOSOS DE REFERENCIA:
${successfulScripts.map(s => `- Hook: "${s.hook}" | Script: "${s.script_content?.substring(0, 100)}..." | CTA: "${s.cta}" (Saves: ${s.saves_per_1k}/1k, Follows: ${s.f_per_1k}/1k, Retención: ${s.retention_pct}%)`).join('\n')}

CONTENIDO SIMILAR EXITOSO POR SECCIÓN:
Hooks similares: ${similarHooks.map(h => `"${h.content}" (${h.saves_per_1k}/1k saves)`).join('; ')}
Scripts similares: ${similarScripts.map(s => `"${s.content.substring(0, 50)}..." (${s.retention_pct}% retención)`).join('; ')}
CTAs similares: ${similarCTAs.map(c => `"${c.content}" (${c.f_per_1k}/1k follows)`).join('; ')}

INSTRUCCIONES CRÍTICAS:
1. Evalúa cada sección (hook, script, cta) individualmente Y la coherencia entre ellas
2. Proporciona mejoras ESPECÍFICAS Y ACCIONABLES, no generalidades
3. Basa las sugerencias en patrones exitosos detectados en los datos
4. Respeta completamente el contexto de la cuenta y restricciones
5. Prioriza mejoras por impacto potencial
6. Incluye tips de ejecución prácticos

Responde SOLO con JSON válido en este formato:
{
  "overall_score": número entre 0-100,
  "viral_potential": {
    "hook_score": número entre 0-100,
    "script_score": número entre 0-100, 
    "cta_score": número entre 0-100,
    "coherence_score": número entre 0-100
  },
  "improvements": [
    {
      "section": "hook|script|cta",
      "current_text": "texto actual",
      "improved_text": "versión mejorada específica",
      "reason": "explicación basada en datos de por qué mejorarlo",
      "impact_score": número 1-10,
      "priority": "high|medium|low"
    }
  ],
  "strengths": ["fortalezas detectadas específicas"],
  "risks": ["riesgos identificados específicos"],
  "similar_successful_scripts": [
    {
      "hook": "hook exitoso similar",
      "script_excerpt": "extracto del script",
      "cta": "cta exitoso",
      "metrics": {"saves_per_1k": 0, "f_per_1k": 0, "retention_pct": 0, "views": 0}
    }
  ],
  "execution_tips": ["consejos prácticos de ejecución"]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analiza este guión completo:\n\n${scriptText}` }
      ],
      max_tokens: 3000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    console.error('OpenAI API Error:', response.status, response.statusText);
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('OpenAI Response:', JSON.stringify(data, null, 2));
  
  const aiResponse = data.choices[0].message.content;
  console.log('AI Response Content:', aiResponse);
  
  try {
    // Clean the response to ensure it's valid JSON
    let cleanedResponse = aiResponse.trim();
    
    // Remove any markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('Cleaned Response:', cleanedResponse);
    
    const parsed = JSON.parse(cleanedResponse);
    
    // Validate the structure
    if (!parsed.overall_score && parsed.overall_score !== 0) {
      console.error('Invalid response structure - missing overall_score');
      throw new Error('Invalid AI response structure');
    }
    
    // Enrich with actual successful scripts from database
    parsed.similar_successful_scripts = successfulScripts.slice(0, 3).map(script => ({
      hook: script.hook || 'No disponible',
      script_excerpt: script.script_content?.substring(0, 150) + '...' || 'No disponible',
      cta: script.cta || 'No disponible',
      metrics: {
        saves_per_1k: script.saves_per_1k || 0,
        f_per_1k: script.f_per_1k || 0,
        retention_pct: script.retention_pct || 0,
        views: script.views || 0
      }
    }));
    
    console.log('Successfully parsed and enriched response');
    return parsed;
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    console.error('Raw AI response was:', aiResponse);
    
    // Return a fallback response if parsing fails
    return {
      overall_score: 50,
      viral_potential: {
        hook_score: 50,
        script_score: 50,
        cta_score: 50,
        coherence_score: 50
      },
      improvements: [
        {
          section: 'script',
          current_text: params.script || 'N/A',
          improved_text: 'Error al generar mejora - intenta de nuevo',
          reason: 'No se pudo procesar la respuesta de IA',
          impact_score: 5,
          priority: 'medium'
        }
      ],
      strengths: ['Error al analizar fortalezas'],
      risks: ['Error al procesar la respuesta de IA'],
      similar_successful_scripts: successfulScripts.slice(0, 2).map(script => ({
        hook: script.hook || 'No disponible',
        script_excerpt: script.script_content?.substring(0, 100) + '...' || 'No disponible',
        cta: script.cta || 'No disponible',
        metrics: {
          saves_per_1k: script.saves_per_1k || 0,
          f_per_1k: script.f_per_1k || 0,
          retention_pct: script.retention_pct || 0,
          views: script.views || 0
        }
      })),
      execution_tips: ['Intenta analizar de nuevo - hubo un error temporal']
    };
  }
}

// Main analyzer function
async function analyzeScript(userId: string, params: ScriptAnalysisParams): Promise<ScriptAnalysisResult> {
  try {
    console.log('Starting script analysis for user:', userId);
    console.log('Params:', JSON.stringify(params, null, 2));
    
    // Get account context
    const context = await getAccountContext(userId);
    
    // Get successful scripts for reference
    const successfulScripts = await getSuccessfulScripts(userId);
    console.log('Found successful scripts:', successfulScripts.length);
    
    // Generate comprehensive analysis
    const analysis = await analyzeScriptWithAI(userId, params, context, successfulScripts);
    
    console.log('Analysis completed successfully');
    return analysis;
    
  } catch (error) {
    console.error('Error analyzing script:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user');
    }

    const params: ScriptAnalysisParams = await req.json();
    
    if (!params.hook?.trim() && !params.script?.trim() && !params.cta?.trim()) {
      throw new Error('At least one section (hook, script, or cta) is required');
    }

    const results = await analyzeScript(user.id, params);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in script-analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      overall_score: 0,
      viral_potential: {
        hook_score: 0,
        script_score: 0,
        cta_score: 0,
        coherence_score: 0
      },
      improvements: [],
      strengths: [],
      risks: ["Error en el análisis"],
      similar_successful_scripts: [],
      execution_tips: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});