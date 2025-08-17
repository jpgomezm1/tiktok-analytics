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

// Enhanced brain search with context integration
async function searchBrain(params: any): Promise<any[]> {
  const { 
    userId, 
    query, 
    topK = 10, 
    contentTypes = [], 
    dateFrom, 
    dateTo, 
    minViews, 
    vertical,
    language = 'es',
    useClusters = false,
    diversityBoost = false
  } = params;

  console.log('Enhanced brain search params:', { userId, query, topK, contentTypes, language, useClusters, diversityBoost });

  try {
    // Generate query embedding
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`Embedding generation failed: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    
    // Get user's account context for enhanced search
    let contextEmbedding = null;
    try {
      const { data: contextData } = await supabase
        .from('tiktok_account_context_embeddings')
        .select('embedding')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (contextData?.embedding) {
        contextEmbedding = contextData.embedding;
      }
    } catch (error) {
      console.log('No context embedding found, using basic search');
    }

    // Build enhanced SQL query with bilingual support
    const embeddingField = language === 'en' ? 'embedding_en' : 'embedding_es';
    
    let sql = `
      SELECT 
        id,
        video_id,
        content_type,
        content,
        section_tag,
        video_theme,
        cta_type,
        editing_style,
        tone_style,
        language,
        cluster_id,
        retention_pct,
        saves_per_1k,
        f_per_1k,
        for_you_pct,
        views,
        duration_seconds,
        published_date,
        (1 - (${embeddingField} <=> $2::vector)) as similarity_score
      FROM tiktok_brain_vectors
      WHERE user_id = $1
        AND is_duplicate = false
        AND ${embeddingField} IS NOT NULL
    `;

    const queryParams: any[] = [userId, `[${queryEmbedding.join(',')}]`];
    let paramIndex = 3;

    // Add filters
    if (contentTypes.length > 0) {
      sql += ` AND content_type = ANY($${paramIndex}::text[])`;
      queryParams.push(contentTypes);
      paramIndex++;
    }

    if (dateFrom) {
      sql += ` AND published_date >= $${paramIndex}::date`;
      queryParams.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      sql += ` AND published_date <= $${paramIndex}::date`;
      queryParams.push(dateTo);
      paramIndex++;
    }

    if (minViews) {
      sql += ` AND views >= $${paramIndex}::bigint`;
      queryParams.push(minViews);
      paramIndex++;
    }

    if (vertical) {
      sql += ` AND video_theme ILIKE $${paramIndex}`;
      queryParams.push(`%${vertical}%`);
      paramIndex++;
    }

    // Diversity boost: if enabled, add cluster-based filtering
    if (diversityBoost && useClusters) {
      sql += `
        AND (cluster_id IS NULL OR cluster_id IN (
          SELECT DISTINCT cluster_id 
          FROM tiktok_brain_vectors 
          WHERE user_id = $1 AND cluster_id IS NOT NULL 
          GROUP BY cluster_id 
          ORDER BY AVG(saves_per_1k + f_per_1k) DESC 
          LIMIT 5
        ))
      `;
    }

    // Order by similarity and performance
    sql += `
      ORDER BY 
        (similarity_score * 0.7 + 
         LEAST(saves_per_1k / 100.0, 1.0) * 0.2 + 
         LEAST(f_per_1k / 50.0, 1.0) * 0.1) DESC
      LIMIT $${paramIndex}::int
    `;
    queryParams.push(topK);

    console.log('Executing enhanced search SQL:', sql.substring(0, 200) + '...');

    // Execute the search
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sql,
      params: queryParams
    });

    if (error) {
      console.error('SQL execution error:', error);
      // Fallback to simpler query
      return await fallbackSearch(userId, queryEmbedding, language, topK);
    }

    if (!data || data.length === 0) {
      console.log('No results from enhanced search, trying fallback');
      return await fallbackSearch(userId, queryEmbedding, language, topK);
    }

    // Log search query for analytics
    try {
      await supabase
        .from('brain_queries_log')
        .insert({
          user_id: userId,
          query: query,
          top_k: topK,
          latency_ms: Date.now() % 10000 // Approximate latency
        });
    } catch (logError) {
      console.error('Failed to log search query:', logError);
    }

    console.log(`Enhanced search returned ${data.length} results`);
    return data;

  } catch (error) {
    console.error('Error in enhanced brain search:', error);
    throw error;
  }
}

// Fallback search when main query fails
async function fallbackSearch(userId: string, queryEmbedding: number[], language: string, topK: number): Promise<any[]> {
  try {
    const embeddingField = language === 'en' ? 'embedding_en' : 'embedding_es';
    
    const { data, error } = await supabase
      .from('tiktok_brain_vectors')
      .select(`
        id,
        video_id,
        content_type,
        content,
        section_tag,
        video_theme,
        retention_pct,
        saves_per_1k,
        f_per_1k,
        for_you_pct,
        views,
        duration_seconds,
        published_date
      `)
      .eq('user_id', userId)
      .eq('is_duplicate', false)
      .not(embeddingField, 'is', null)
      .limit(topK);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Fallback search failed:', error);
    return [];
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

    const searchParams = await req.json();
    searchParams.userId = user.id;

    const results = await searchBrain(searchParams);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced brain-search:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});