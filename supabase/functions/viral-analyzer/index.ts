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

interface AnalyzerParams {
  content: string;
  content_type: 'hook' | 'guion' | 'cta';
}

interface ViralAnalysis {
  input: string;
  analysis: {
    probabilities: {
      P_top10_views: number;
      P_saves_p90: number;
      P_follow_p90: number;
    };
    positives: string[];
    risks: string[];
    neighbors_used: Array<{
      content: string;
      metrics: {
        saves_per_1k: number;
        f_per_1k: number;
        retention_pct: number;
        views: number;
      };
    }>;
  };
  variants: Array<{
    version: 'clickbait' | 'benefit_led' | 'contrarian';
    text: string;
    recommended: 'exploit' | 'explore';
    why_variant: string;
  }>;
  guardrail_adjusted: boolean;
}

// Generate embeddings for similarity search
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

// Get account context for guardrails and weights
async function getAccountContext(userId: string): Promise<any> {
  const { data: context } = await supabase
    .from('tiktok_account_contexts')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return context || {
    do_not_do: [],
    negative_keywords: [],
    weights: { retention: 0.3, saves: 0.5, follows: 0.2, fyp: 0.0 },
    mission: 'No defined',
    tone_guide: 'Professional but accessible'
  };
}

// Find similar content using vector similarity
async function findSimilarContent(
  userId: string, 
  embedding: number[], 
  contentType: string,
  limit: number = 10
): Promise<any[]> {
  // Convert embedding to the format expected by PostgreSQL
  const embeddingStr = `[${embedding.join(',')}]`;
  
  const { data: similar } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        video_id,
        content,
        saves_per_1k,
        f_per_1k,
        retention_pct,
        views,
        published_date,
        (embedding_es <=> $2::vector) as distance
      FROM tiktok_brain_vectors
      WHERE user_id = $1
        AND content_type = $3
        AND is_duplicate = false
        AND published_date >= CURRENT_DATE - INTERVAL '90 days'
      ORDER BY embedding_es <=> $2::vector
      LIMIT $4
    `,
    params: [userId, embeddingStr, contentType, limit]
  });

  return similar || [];
}

// Calculate calibrated probabilities based on similar content performance
function calculateProbabilities(neighbors: any[]): any {
  if (neighbors.length === 0) {
    return {
      P_top10_views: 0.1,
      P_saves_p90: 0.1,
      P_follow_p90: 0.1
    };
  }

  // Calculate percentiles from neighbors
  const saves = neighbors.map(n => n.saves_per_1k || 0).sort((a, b) => a - b);
  const follows = neighbors.map(n => n.f_per_1k || 0).sort((a, b) => a - b);
  const views = neighbors.map(n => n.views || 0).sort((a, b) => a - b);

  const p90Index = Math.floor(neighbors.length * 0.9);
  const medianIndex = Math.floor(neighbors.length * 0.5);

  const savesP90 = saves[p90Index] || 0;
  const followsP90 = follows[p90Index] || 0;
  const viewsMedian = views[medianIndex] || 0;

  // Simple calibration: map performance to probabilities
  return {
    P_top10_views: Math.min(0.9, Math.max(0.05, viewsMedian / 100000)), // Assuming 100k+ is top 10%
    P_saves_p90: Math.min(0.9, Math.max(0.05, savesP90 / 5)), // Assuming 5+ saves/1k is p90
    P_follow_p90: Math.min(0.9, Math.max(0.05, followsP90 / 2)) // Assuming 2+ follows/1k is p90
  };
}

// Generate variants using AI
async function generateVariants(
  content: string,
  contentType: string,
  context: any,
  neighbors: any[]
): Promise<any[]> {
  const neighborExamples = neighbors.slice(0, 3).map(n => 
    `"${n.content}" (saves: ${n.saves_per_1k}/1k, follows: ${n.f_per_1k}/1k)`
  ).join('\n');

  const systemPrompt = `Eres un experto en crear contenido viral para TikTok. Genera 3 variantes del ${contentType} proporcionado:

1. CLICKBAIT: Versión directa y llamativa
2. BENEFIT_LED: Enfocada en beneficios claros  
3. CONTRARIAN: Ángulo contraintuitivo o controversial

Contexto de la cuenta:
- Misión: ${context.mission}
- Tono: ${context.tone_guide}
- NO hacer: ${context.do_not_do?.join(', ') || 'Nada específico'}

Ejemplos exitosos similares:
${neighborExamples}

Para cada variante, decide si es EXPLOIT (basada en patrones probados) o EXPLORE (ángulo nuevo).

Responde SOLO con JSON válido:
{
  "variants": [
    {
      "version": "clickbait",
      "text": "...",
      "recommended": "exploit|explore", 
      "why_variant": "Razón en 1 línea"
    },
    {
      "version": "benefit_led",
      "text": "...",
      "recommended": "exploit|explore",
      "why_variant": "Razón en 1 línea" 
    },
    {
      "version": "contrarian",
      "text": "...",
      "recommended": "exploit|explore",
      "why_variant": "Razón en 1 línea"
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Genera variantes para: "${content}"` }
      ],
      max_completion_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(aiResponse);
    return parsed.variants || [];
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}

// Check guardrails and adjust content if needed
async function checkGuardrails(
  content: string, 
  context: any
): Promise<{ adjusted: boolean; text: string }> {
  const doNotDo = context.do_not_do || [];
  const negativeKeywords = context.negative_keywords || [];

  // Check if content violates guardrails
  const violations = [
    ...doNotDo.filter((rule: string) => 
      content.toLowerCase().includes(rule.toLowerCase())
    ),
    ...negativeKeywords.filter((keyword: string) => 
      content.toLowerCase().includes(keyword.toLowerCase())
    )
  ];

  if (violations.length === 0) {
    return { adjusted: false, text: content };
  }

  // Use AI to rewrite content avoiding violations
  const systemPrompt = `Reescribe este contenido para evitar estas violaciones: ${violations.join(', ')}
  
Contexto:
- Tono: ${context.tone_guide}
- Misión: ${context.mission}

Mantén el mensaje principal pero ajusta las palabras problemáticas.
Responde SOLO con el texto corregido, nada más.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      max_completion_tokens: 300
    }),
  });

  const data = await response.json();
  const adjustedText = data.choices[0].message.content.trim();

  return { adjusted: true, text: adjustedText };
}

// Generate analysis insights
function generateAnalysisInsights(neighbors: any[], probabilities: any): { positives: string[]; risks: string[] } {
  const positives = [];
  const risks = [];

  if (probabilities.P_saves_p90 > 0.6) {
    positives.push("Alto potencial de saves basado en contenido similar");
  }
  if (probabilities.P_follow_p90 > 0.5) {
    positives.push("Probable generación de nuevos seguidores");
  }
  if (neighbors.length >= 5) {
    positives.push("Buena cantidad de datos históricos para predicción");
  }

  if (probabilities.P_top10_views < 0.3) {
    risks.push("Potencial de alcance limitado según patrones históricos");
  }
  if (neighbors.length < 3) {
    risks.push("Pocos datos históricos similares, predicción menos confiable");
  }

  return { positives, risks };
}

// Main analyzer function
async function analyzeViralPotential(userId: string, params: AnalyzerParams): Promise<ViralAnalysis> {
  try {
    // Get account context
    const context = await getAccountContext(userId);

    // Check guardrails first
    const guardrailCheck = await checkGuardrails(params.content, context);

    // Generate embedding for similarity search
    const embedding = await generateEmbedding(guardrailCheck.text);

    // Find similar content
    const neighbors = await findSimilarContent(userId, embedding, params.content_type);

    // Calculate probabilities
    const probabilities = calculateProbabilities(neighbors);

    // Generate insights
    const insights = generateAnalysisInsights(neighbors, probabilities);

    // Generate variants
    const variants = await generateVariants(guardrailCheck.text, params.content_type, context, neighbors);

    // Format neighbors for response
    const neighborsUsed = neighbors.slice(0, 5).map(n => ({
      content: n.content,
      metrics: {
        saves_per_1k: n.saves_per_1k || 0,
        f_per_1k: n.f_per_1k || 0,
        retention_pct: n.retention_pct || 0,
        views: n.views || 0
      }
    }));

    return {
      input: params.content,
      analysis: {
        probabilities,
        positives: insights.positives,
        risks: insights.risks,
        neighbors_used: neighborsUsed
      },
      variants,
      guardrail_adjusted: guardrailCheck.adjusted
    };

  } catch (error) {
    console.error('Error analyzing viral potential:', error);
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

    const params: AnalyzerParams = await req.json();
    
    if (!params.content?.trim()) {
      throw new Error('Content is required');
    }

    if (!['hook', 'guion', 'cta'].includes(params.content_type)) {
      throw new Error('Invalid content_type. Must be hook, guion, or cta');
    }

    const results = await analyzeViralPotential(user.id, params);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in viral-analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      input: "",
      analysis: {
        probabilities: { P_top10_views: 0, P_saves_p90: 0, P_follow_p90: 0 },
        positives: [],
        risks: ["Error en el análisis"],
        neighbors_used: []
      },
      variants: [],
      guardrail_adjusted: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});