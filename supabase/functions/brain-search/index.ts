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

interface SearchParams {
  query: string;
  topK?: number;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    minViews?: number;
    contentTypes?: string[];
    video_theme?: string;
    cta_type?: string;
    editing_style?: string;
    durationBuckets?: string[];
  };
  language?: 'es' | 'en';
  diversityBoost?: boolean;
}

interface SearchResult {
  video_id: string;
  section_tag: string;
  content: string;
  metrics: {
    views: number;
    retention_pct: number;
    saves_per_1k: number;
    f_per_1k: number;
    for_you_pct: number;
    duration_seconds: number;
    published_date: string;
  };
  score: {
    sim_final: number;
    z_ret: number;
    z_saves: number;
    z_follows: number;
    z_fyp: number;
    time_decay: number;
    final_score: number;
  };
  why_this: string;
  video_theme?: string;
  cta_type?: string;
  editing_style?: string;
  tone_style?: string;
}

interface SearchResponse {
  results: SearchResult[];
  facets: {
    video_themes: Array<{ value: string; count: number; percentage: number }>;
    cta_types: Array<{ value: string; count: number; percentage: number }>;
    editing_styles: Array<{ value: string; count: number; percentage: number }>;
    duration_buckets: Array<{ range: string; count: number; avg_performance: number }>;
    metrics_percentiles: {
      retention_pct: { p50: number; p75: number; p90: number };
      saves_per_1k: { p50: number; p75: number; p90: number };
      f_per_1k: { p50: number; p75: number; p90: number };
    };
  };
  filters_applied: any;
  total_results: number;
  search_time_ms: number;
}

// Natural language query parser
function parseNaturalQuery(query: string): { cleanedQuery: string; extractedFilters: any } {
  const filters: any = {};
  let cleanedQuery = query.toLowerCase();

  // Duration patterns
  if (cleanedQuery.includes('cortos') || cleanedQuery.includes('short')) {
    filters.durationBuckets = ['0-20s'];
    cleanedQuery = cleanedQuery.replace(/(cortos?|short)/g, '').trim();
  }
  if (cleanedQuery.includes('largos') || cleanedQuery.includes('long')) {
    filters.durationBuckets = ['40s+'];
    cleanedQuery = cleanedQuery.replace(/(largos?|long)/g, '').trim();
  }

  // Time patterns
  const timePatterns = [
    { regex: /últimos? (\d+) días?|last (\d+) days?/g, type: 'days' },
    { regex: /última semana|last week/g, days: 7 },
    { regex: /último mes|last month/g, days: 30 },
    { regex: /último año|last year/g, days: 365 }
  ];

  for (const pattern of timePatterns) {
    const match = cleanedQuery.match(pattern.regex);
    if (match) {
      const days = pattern.days || parseInt(match[1] || match[2] || '30');
      const date = new Date();
      date.setDate(date.getDate() - days);
      filters.dateFrom = date.toISOString().split('T')[0];
      cleanedQuery = cleanedQuery.replace(pattern.regex, '').trim();
    }
  }

  // Content type patterns
  if (cleanedQuery.includes('hook') || cleanedQuery.includes('inicio')) {
    filters.contentTypes = ['hook'];
    cleanedQuery = cleanedQuery.replace(/(hooks?|inicios?)/g, '').trim();
  }
  if (cleanedQuery.includes('cta') || cleanedQuery.includes('llamada')) {
    filters.contentTypes = ['cta'];
    cleanedQuery = cleanedQuery.replace(/(ctas?|llamadas?)/g, '').trim();
  }

  // Style patterns
  const styleMap = {
    'storytelling': ['storytelling', 'historia', 'narrativa'],
    'walk & talk': ['walk', 'caminar', 'hablando'],
    'text overlay': ['texto', 'overlay', 'subtítulos'],
    'talking head': ['talking', 'cabeza', 'frente']
  };

  for (const [style, keywords] of Object.entries(styleMap)) {
    if (keywords.some(keyword => cleanedQuery.includes(keyword))) {
      filters.editing_style = style;
      keywords.forEach(keyword => {
        cleanedQuery = cleanedQuery.replace(new RegExp(keyword, 'g'), '').trim();
      });
      break;
    }
  }

  // Metric priorities
  if (cleanedQuery.includes('seguidor') || cleanedQuery.includes('follow')) {
    filters.prioritizeFollows = true;
    cleanedQuery = cleanedQuery.replace(/(seguidor|follow)/g, '').trim();
  }
  if (cleanedQuery.includes('save') || cleanedQuery.includes('guarda')) {
    filters.prioritizeSaves = true;
    cleanedQuery = cleanedQuery.replace(/(saves?|guarda)/g, '').trim();
  }

  // Clean up extra spaces
  cleanedQuery = cleanedQuery.replace(/\s+/g, ' ').trim();

  return { cleanedQuery, extractedFilters: filters };
}

// Generate bilingual embeddings
async function generateBilingualEmbeddings(text: string): Promise<{
  embedding_es: number[];
  embedding_en: number[];
}> {
  // Generate Spanish embedding
  const esResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: text,
    }),
  });

  if (!esResponse.ok) {
    throw new Error(`Spanish embedding failed: ${esResponse.statusText}`);
  }

  const esData = await esResponse.json();
  const embedding_es = esData.data[0].embedding;

  // Translate to English
  const translateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Translate to English. Return only the translation.' },
        { role: 'user', content: text }
      ],
      max_tokens: 200,
      temperature: 0.1
    }),
  });

  let translatedText = text;
  if (translateResponse.ok) {
    const translateData = await translateResponse.json();
    translatedText = translateData.choices[0].message.content.trim();
  }

  // Generate English embedding
  const enResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: translatedText,
    }),
  });

  if (!enResponse.ok) {
    throw new Error(`English embedding failed: ${enResponse.statusText}`);
  }

  const enData = await enResponse.json();
  const embedding_en = enData.data[0].embedding;

  return { embedding_es, embedding_en };
}

// Calculate Z-scores for metrics normalization
function calculateZScores(results: any[], metrics: string[]): { [key: string]: { mean: number; std: number } } {
  const stats: { [key: string]: { mean: number; std: number } } = {};
  
  for (const metric of metrics) {
    const values = results.map(r => r[metric] || 0).filter(v => v > 0);
    if (values.length === 0) {
      stats[metric] = { mean: 0, std: 1 };
      continue;
    }
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance) || 1;
    
    stats[metric] = { mean, std };
  }
  
  return stats;
}

// Generate explanation for why a result was selected
function generateExplanation(result: any, score: any, rank: number): string {
  const explanations = [];
  
  if (score.sim_final > 0.8) {
    explanations.push(`es muy relevante semánticamente (${(score.sim_final * 100).toFixed(0)}%)`);
  } else if (score.sim_final > 0.6) {
    explanations.push(`es relevante semánticamente (${(score.sim_final * 100).toFixed(0)}%)`);
  }
  
  if (score.z_saves > 1.5) {
    explanations.push(`generó muchos saves (+${score.z_saves.toFixed(1)}σ sobre promedio)`);
  }
  
  if (score.z_follows > 1.5) {
    explanations.push(`atrajo muchos seguidores (+${score.z_follows.toFixed(1)}σ)`);
  }
  
  if (score.z_ret > 1.0) {
    explanations.push(`tuvo buena retención (+${score.z_ret.toFixed(1)}σ)`);
  }
  
  if (result.video_theme) {
    explanations.push(`es sobre ${result.video_theme}`);
  }
  
  if (explanations.length === 0) {
    return `Resultado #${rank + 1}: Contenido relacionado con tu búsqueda.`;
  }
  
  return `Resultado #${rank + 1}: Este contenido ${explanations.join(', ')}.`;
}

// Main search function
async function advancedBrainSearch(userId: string, params: SearchParams): Promise<SearchResponse> {
  const startTime = Date.now();
  
  try {
    // Parse natural language query
    const { cleanedQuery, extractedFilters } = parseNaturalQuery(params.query);
    
    // Merge filters
    const filters = { ...extractedFilters, ...params.filters };
    
    // Get user's account context and embeddings
    const { data: accountContext } = await supabase
      .from('tiktok_account_contexts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    const { data: contextEmbedding } = await supabase
      .from('tiktok_account_context_embeddings')
      .select('embedding')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('Account context loaded:', !!accountContext);
    console.log('Context embedding loaded:', !!contextEmbedding?.embedding);
    
    // Apply context defaults
    if (accountContext) {
      if (!filters.dateFrom && !filters.dateTo) {
        // Default to last 90 days
        const date = new Date();
        date.setDate(date.getDate() - 90);
        filters.dateFrom = date.toISOString().split('T')[0];
      }
      
      // Apply negative keywords filter
      if (accountContext.negative_keywords?.length > 0) {
        // This would be applied in the SQL query
      }
    }
    
    // Generate query embeddings
    const { embedding_es, embedding_en } = await generateBilingualEmbeddings(cleanedQuery);
    
    // Build SQL query with enhanced context integration
    let sql = `
      WITH similarity_scores AS (
        SELECT 
          *,
          GREATEST(
            1 - (embedding_es <=> $2::vector),
            1 - (embedding_en <=> $3::vector)
            ${contextEmbedding ? `, 0.25 * (1 - (embedding_es <=> $4::vector)) + 0.75 * GREATEST(1 - (embedding_es <=> $2::vector), 1 - (embedding_en <=> $3::vector))` : ''}
          ) as sim_final
        FROM tiktok_brain_vectors
        WHERE user_id = $1
          AND is_duplicate = false
          AND (embedding_es IS NOT NULL OR embedding_en IS NOT NULL)
    `;
    
    const queryParams: any[] = [
      userId, 
      `[${embedding_es.join(',')}]`, 
      `[${embedding_en.join(',')}]`
    ];
    let paramIndex = 4;
    
    if (contextEmbedding) {
      queryParams.push(contextEmbedding.embedding);
      paramIndex++;
    }
    
    // Apply filters
    if (filters.contentTypes?.length > 0) {
      sql += ` AND content_type = ANY($${paramIndex}::text[])`;
      queryParams.push(filters.contentTypes);
      paramIndex++;
    }
    
    if (filters.dateFrom) {
      sql += ` AND published_date >= $${paramIndex}::date`;
      queryParams.push(filters.dateFrom);
      paramIndex++;
    }
    
    if (filters.dateTo) {
      sql += ` AND published_date <= $${paramIndex}::date`;
      queryParams.push(filters.dateTo);
      paramIndex++;
    }
    
    if (filters.minViews) {
      sql += ` AND views >= $${paramIndex}::bigint`;
      queryParams.push(filters.minViews);
      paramIndex++;
    }
    
    if (filters.video_theme) {
      sql += ` AND video_theme ILIKE $${paramIndex}`;
      queryParams.push(`%${filters.video_theme}%`);
      paramIndex++;
    }
    
    if (filters.cta_type) {
      sql += ` AND cta_type = $${paramIndex}`;
      queryParams.push(filters.cta_type);
      paramIndex++;
    }
    
    if (filters.editing_style) {
      sql += ` AND editing_style = $${paramIndex}`;
      queryParams.push(filters.editing_style);
      paramIndex++;
    }
    
    if (filters.durationBuckets?.length > 0) {
      const durationConditions = [];
      for (const bucket of filters.durationBuckets) {
        if (bucket === '0-20s') durationConditions.push('duration_seconds <= 20');
        else if (bucket === '20-40s') durationConditions.push('duration_seconds BETWEEN 21 AND 40');
        else if (bucket === '40s+') durationConditions.push('duration_seconds > 40');
      }
      if (durationConditions.length > 0) {
        sql += ` AND (${durationConditions.join(' OR ')})`;
      }
    }
    
    // Exclude negative keywords if present
    if (accountContext?.negative_keywords?.length > 0) {
      const negativePattern = accountContext.negative_keywords.join('|');
      sql += ` AND NOT (content ~* $${paramIndex})`;
      queryParams.push(negativePattern);
      paramIndex++;
    }
    
    sql += `
      )
      SELECT *,
        EXTRACT(epoch FROM (NOW() - published_date)) / 86400.0 as days_old
      FROM similarity_scores
      ORDER BY sim_final DESC
      LIMIT ${(params.topK || 20) * 2}
    `;
    
    console.log('Executing advanced search SQL...');
    
    // Execute search
    const { data: rawResults, error } = await supabase.rpc('exec_sql', {
      sql: sql,
      params: queryParams
    });
    
    if (error) {
      console.error('Search error:', error);
      throw error;
    }
    
    if (!rawResults || rawResults.length === 0) {
      return {
        results: [],
        facets: {
          video_themes: [],
          cta_types: [],
          editing_styles: [],
          duration_buckets: [],
          metrics_percentiles: {
            retention_pct: { p50: 0, p75: 0, p90: 0 },
            saves_per_1k: { p50: 0, p75: 0, p90: 0 },
            f_per_1k: { p50: 0, p75: 0, p90: 0 }
          }
        },
        filters_applied: filters,
        total_results: 0,
        search_time_ms: Date.now() - startTime
      };
    }
    
    // Calculate Z-scores for metrics normalization
    const metricStats = calculateZScores(rawResults, ['retention_pct', 'saves_per_1k', 'f_per_1k', 'for_you_pct']);
    
    // Get context weights
    const weights = accountContext?.weights || { retention: 0.3, saves: 0.4, follows: 0.3 };
    
    // Apply advanced reranking
    const scoredResults = rawResults.map((result: any) => {
      const z_ret = (result.retention_pct - metricStats.retention_pct.mean) / metricStats.retention_pct.std;
      const z_saves = (result.saves_per_1k - metricStats.saves_per_1k.mean) / metricStats.saves_per_1k.std;
      const z_follows = (result.f_per_1k - metricStats.f_per_1k.mean) / metricStats.f_per_1k.std;
      const z_fyp = (result.for_you_pct - metricStats.for_you_pct.mean) / metricStats.for_you_pct.std;
      
      const time_decay = Math.exp(-result.days_old / 90); // 90-day half-life
      
      // Apply priority adjustments from natural language
      let priorityBoost = 0;
      if (filters.prioritizeFollows && z_follows > 0) priorityBoost += 0.1;
      if (filters.prioritizeSaves && z_saves > 0) priorityBoost += 0.1;
      
      const final_score = 
        0.5 * result.sim_final +
        weights.retention * Math.max(0, z_ret) * 0.1 +
        weights.saves * Math.max(0, z_saves) * 0.1 +
        weights.follows * Math.max(0, z_follows) * 0.1 +
        0.1 * Math.max(0, z_fyp) +
        0.05 * time_decay +
        priorityBoost;
      
      return {
        ...result,
        score: {
          sim_final: result.sim_final,
          z_ret,
          z_saves,
          z_follows,
          z_fyp,
          time_decay,
          final_score
        }
      };
    });
    
    // Sort by final score
    scoredResults.sort((a, b) => b.score.final_score - a.score.final_score);
    
    // Apply diversity constraints
    const diverseResults = [];
    const usedClusters = new Set();
    const clusterCounts = new Map();
    
    for (const result of scoredResults) {
      const clusterId = result.cluster_id;
      
      if (!clusterId || !usedClusters.has(clusterId)) {
        diverseResults.push(result);
        if (clusterId) {
          usedClusters.add(clusterId);
          clusterCounts.set(clusterId, 1);
        }
      } else if (clusterCounts.get(clusterId) < 2) {
        diverseResults.push(result);
        clusterCounts.set(clusterId, clusterCounts.get(clusterId) + 1);
      }
      
      if (diverseResults.length >= (params.topK || 10)) break;
    }
    
    // Generate explanations and format results
    const finalResults: SearchResult[] = diverseResults.map((result, index) => ({
      video_id: result.video_id,
      section_tag: result.section_tag,
      content: result.content,
      metrics: {
        views: result.views || 0,
        retention_pct: result.retention_pct || 0,
        saves_per_1k: result.saves_per_1k || 0,
        f_per_1k: result.f_per_1k || 0,
        for_you_pct: result.for_you_pct || 0,
        duration_seconds: result.duration_seconds || 0,
        published_date: result.published_date
      },
      score: result.score,
      why_this: generateExplanation(result, result.score, index),
      video_theme: result.video_theme,
      cta_type: result.cta_type,
      editing_style: result.editing_style,
      tone_style: result.tone_style
    }));
    
    // Generate facets
    const facets = generateFacets(rawResults);
    
    return {
      results: finalResults,
      facets,
      filters_applied: filters,
      total_results: rawResults.length,
      search_time_ms: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('Error in advanced brain search:', error);
    throw error;
  }
}

// Generate facets for filtering
function generateFacets(results: any[]): SearchResponse['facets'] {
  const total = results.length;
  
  // Video themes
  const themeCount = new Map<string, number>();
  const ctaCount = new Map<string, number>();
  const styleCount = new Map<string, number>();
  const durationBuckets = { '0-20s': [], '20-40s': [], '40s+': [] };
  
  for (const result of results) {
    // Themes
    if (result.video_theme) {
      themeCount.set(result.video_theme, (themeCount.get(result.video_theme) || 0) + 1);
    }
    
    // CTAs
    if (result.cta_type) {
      ctaCount.set(result.cta_type, (ctaCount.get(result.cta_type) || 0) + 1);
    }
    
    // Styles
    if (result.editing_style) {
      styleCount.set(result.editing_style, (styleCount.get(result.editing_style) || 0) + 1);
    }
    
    // Duration buckets
    const duration = result.duration_seconds || 0;
    if (duration <= 20) durationBuckets['0-20s'].push(result);
    else if (duration <= 40) durationBuckets['20-40s'].push(result);
    else durationBuckets['40s+'].push(result);
  }
  
  // Calculate percentiles
  const metrics = ['retention_pct', 'saves_per_1k', 'f_per_1k'];
  const percentiles: any = {};
  
  for (const metric of metrics) {
    const values = results.map(r => r[metric] || 0).filter(v => v > 0).sort((a, b) => a - b);
    if (values.length > 0) {
      percentiles[metric] = {
        p50: values[Math.floor(values.length * 0.5)] || 0,
        p75: values[Math.floor(values.length * 0.75)] || 0,
        p90: values[Math.floor(values.length * 0.9)] || 0
      };
    } else {
      percentiles[metric] = { p50: 0, p75: 0, p90: 0 };
    }
  }
  
  return {
    video_themes: Array.from(themeCount.entries())
      .map(([value, count]) => ({ value, count, percentage: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    cta_types: Array.from(ctaCount.entries())
      .map(([value, count]) => ({ value, count, percentage: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count),
    editing_styles: Array.from(styleCount.entries())
      .map(([value, count]) => ({ value, count, percentage: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count),
    duration_buckets: Object.entries(durationBuckets).map(([range, items]) => ({
      range,
      count: items.length,
      avg_performance: items.length > 0 
        ? items.reduce((sum: number, item: any) => sum + (item.saves_per_1k || 0) + (item.f_per_1k || 0), 0) / items.length
        : 0
    })),
    metrics_percentiles: percentiles
  };
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

    const params: SearchParams = await req.json();
    
    if (!params.query?.trim()) {
      throw new Error('Query is required');
    }

    const results = await advancedBrainSearch(user.id, params);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in advanced brain search:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      results: [],
      facets: {
        video_themes: [],
        cta_types: [],
        editing_styles: [],
        duration_buckets: [],
        metrics_percentiles: {
          retention_pct: { p50: 0, p75: 0, p90: 0 },
          saves_per_1k: { p50: 0, p75: 0, p90: 0 },
          f_per_1k: { p50: 0, p75: 0, p90: 0 }
        }
      },
      filters_applied: {},
      total_results: 0,
      search_time_ms: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});