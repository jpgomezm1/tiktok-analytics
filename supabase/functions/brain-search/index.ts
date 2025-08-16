import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BrainSearchParams {
  userId: string;
  query: string;
  topK?: number;
  filter?: {
    contentTypes?: Array<'hook'|'cta'|'guion'>;
    dateFrom?: string;
    dateTo?: string;
    minViews?: number;
    vertical?: string;
  }
}

interface BrainHit {
  id: string;
  video_id: string;
  content_type: 'hook'|'cta'|'guion';
  content: string;
  score: number;
  metrics: {
    retention_pct?: number;
    saves_per_1k?: number;
    f_per_1k?: number;
    for_you_pct?: number;
    views?: number;
    duration_seconds?: number;
    video_type?: string;
    published_date?: string;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function searchBrain(params: BrainSearchParams): Promise<BrainHit[]> {
  const startTime = Date.now();
  const { userId, query, topK = 8, filter = {} } = params;

  console.log('Searching brain with params:', { userId, query, topK, filter });

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);
  
  // Build SQL query with filters
  let sql = `
    SELECT 
      id,
      video_id,
      content_type,
      content,
      retention_pct,
      saves_per_1k,
      f_per_1k,
      for_you_pct,
      views,
      duration_seconds,
      video_type,
      published_date,
      1 - (embedding <=> $2::vector) as score
    FROM tiktok_brain_vectors 
    WHERE user_id = $1
  `;

  const queryParams: any[] = [userId, JSON.stringify(queryEmbedding)];
  let paramIndex = 3;

  // Add filters
  if (filter.contentTypes && filter.contentTypes.length > 0) {
    sql += ` AND content_type = ANY($${paramIndex})`;
    queryParams.push(filter.contentTypes);
    paramIndex++;
  }

  if (filter.dateFrom) {
    sql += ` AND published_date >= $${paramIndex}`;
    queryParams.push(filter.dateFrom);
    paramIndex++;
  }

  if (filter.dateTo) {
    sql += ` AND published_date <= $${paramIndex}`;
    queryParams.push(filter.dateTo);
    paramIndex++;
  }

  if (filter.minViews) {
    sql += ` AND views >= $${paramIndex}`;
    queryParams.push(filter.minViews);
    paramIndex++;
  }

  if (filter.vertical) {
    sql += ` AND video_type = $${paramIndex}`;
    queryParams.push(filter.vertical);
    paramIndex++;
  }

  sql += ` ORDER BY score DESC LIMIT $${paramIndex}`;
  queryParams.push(topK);

  console.log('Executing SQL:', sql);
  console.log('With params:', queryParams);

  const { data: results, error } = await supabase.rpc('exec_sql', {
    sql: sql,
    params: queryParams
  });

  if (error) {
    console.error('Search error:', error);
    // Fallback to simpler query without RPC
    const { data: fallbackResults, error: fallbackError } = await supabase
      .from('tiktok_brain_vectors')
      .select('*')
      .eq('user_id', userId)
      .limit(topK);

    if (fallbackError) {
      throw new Error(`Search failed: ${fallbackError.message}`);
    }

    const hits: BrainHit[] = (fallbackResults || []).map((row: any) => ({
      id: row.id,
      video_id: row.video_id,
      content_type: row.content_type,
      content: row.content,
      score: 0.5, // Default score since we can't compute similarity
      metrics: {
        retention_pct: row.retention_pct,
        saves_per_1k: row.saves_per_1k,
        f_per_1k: row.f_per_1k,
        for_you_pct: row.for_you_pct,
        views: row.views,
        duration_seconds: row.duration_seconds,
        video_type: row.video_type,
        published_date: row.published_date,
      }
    }));

    return hits;
  }

  const hits: BrainHit[] = (results || []).map((row: any) => ({
    id: row.id,
    video_id: row.video_id,
    content_type: row.content_type,
    content: row.content,
    score: row.score,
    metrics: {
      retention_pct: row.retention_pct,
      saves_per_1k: row.saves_per_1k,
      f_per_1k: row.f_per_1k,
      for_you_pct: row.for_you_pct,
      views: row.views,
      duration_seconds: row.duration_seconds,
      video_type: row.video_type,
      published_date: row.published_date,
    }
  }));

  // Log query for observability
  const latency = Date.now() - startTime;
  await supabase
    .from('brain_queries_log')
    .insert({
      user_id: userId,
      query: query,
      top_k: topK,
      latency_ms: latency
    });

  console.log(`Search completed in ${latency}ms, found ${hits.length} results`);
  return hits;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: BrainSearchParams = await req.json();
    const hits = await searchBrain(params);

    return new Response(
      JSON.stringify({ success: true, hits }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in brain search:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        hits: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});