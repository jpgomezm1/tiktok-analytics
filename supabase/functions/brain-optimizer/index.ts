import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple k-means clustering implementation
function kMeansCluster(vectors: number[][], k: number, maxIterations = 10): number[] {
  const n = vectors.length;
  const dim = vectors[0].length;
  
  if (n <= k) {
    return vectors.map((_, i) => i);
  }
  
  // Initialize centroids randomly
  const centroids: number[][] = [];
  for (let i = 0; i < k; i++) {
    centroids.push([...vectors[Math.floor(Math.random() * n)]]);
  }
  
  let assignments = new Array(n).fill(0);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    const newAssignments = vectors.map((vector, i) => {
      let minDist = Infinity;
      let bestCluster = 0;
      
      for (let j = 0; j < k; j++) {
        const dist = euclideanDistance(vector, centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = j;
        }
      }
      
      return bestCluster;
    });
    
    // Check for convergence
    if (newAssignments.every((a, i) => a === assignments[i])) {
      break;
    }
    
    assignments = newAssignments;
    
    // Update centroids
    for (let j = 0; j < k; j++) {
      const clusterPoints = vectors.filter((_, i) => assignments[i] === j);
      if (clusterPoints.length > 0) {
        for (let d = 0; d < dim; d++) {
          centroids[j][d] = clusterPoints.reduce((sum, point) => sum + point[d], 0) / clusterPoints.length;
        }
      }
    }
  }
  
  return assignments;
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

// Calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// Deduplication based on similarity threshold
async function deduplicateContent(userId: string): Promise<{ deduplicatedCount: number }> {
  console.log('Starting deduplication for user:', userId);
  
  try {
    // Get all non-duplicate vectors for the user
    const { data: vectors, error } = await supabase
      .from('tiktok_brain_vectors')
      .select('id, content, embedding_es, saves_per_1k, f_per_1k, views, created_at')
      .eq('user_id', userId)
      .eq('is_duplicate', false)
      .not('embedding_es', 'is', null)
      .order('created_at', { ascending: true });

    if (error || !vectors || vectors.length === 0) {
      console.log('No vectors found for deduplication');
      return { deduplicatedCount: 0 };
    }

    console.log(`Processing ${vectors.length} vectors for deduplication`);
    
    let deduplicatedCount = 0;
    const processed = new Set<string>();

    for (let i = 0; i < vectors.length; i++) {
      if (processed.has(vectors[i].id)) continue;
      
      const currentVector = vectors[i];
      const currentEmbedding = JSON.parse(currentVector.embedding_es);
      
      for (let j = i + 1; j < vectors.length; j++) {
        if (processed.has(vectors[j].id)) continue;
        
        const compareVector = vectors[j];
        const compareEmbedding = JSON.parse(compareVector.embedding_es);
        
        // Calculate similarity
        const similarity = cosineSimilarity(currentEmbedding, compareEmbedding);
        
        if (similarity > 0.95) {
          // Mark the one with lower performance as duplicate
          const currentPerf = (currentVector.saves_per_1k || 0) + (currentVector.f_per_1k || 0);
          const comparePerf = (compareVector.saves_per_1k || 0) + (compareVector.f_per_1k || 0);
          
          const duplicateId = currentPerf >= comparePerf ? compareVector.id : currentVector.id;
          
          // Update the duplicate
          const { error: updateError } = await supabase
            .from('tiktok_brain_vectors')
            .update({ 
              is_duplicate: true, 
              similarity_score: similarity 
            })
            .eq('id', duplicateId);
          
          if (!updateError) {
            processed.add(duplicateId);
            deduplicatedCount++;
            console.log(`Marked vector ${duplicateId} as duplicate (similarity: ${similarity.toFixed(3)})`);
          }
        }
      }
    }

    console.log(`Deduplication complete. Marked ${deduplicatedCount} vectors as duplicates`);
    return { deduplicatedCount };
    
  } catch (error) {
    console.error('Error in deduplication:', error);
    throw error;
  }
}

// Clustering and diversity analysis
async function clusterContent(userId: string): Promise<{ clustersCreated: number }> {
  console.log('Starting clustering for user:', userId);
  
  try {
    // Get all non-duplicate vectors with embeddings
    const { data: vectors, error } = await supabase
      .from('tiktok_brain_vectors')
      .select('id, content_type, embedding_es, saves_per_1k, f_per_1k, retention_pct')
      .eq('user_id', userId)
      .eq('is_duplicate', false)
      .not('embedding_es', 'is', null);

    if (error || !vectors || vectors.length < 5) {
      console.log('Not enough vectors for clustering');
      return { clustersCreated: 0 };
    }

    console.log(`Clustering ${vectors.length} vectors`);
    
    // Extract embeddings
    const embeddings = vectors.map(v => JSON.parse(v.embedding_es));
    
    // Determine optimal number of clusters (simple heuristic)
    const numClusters = Math.min(Math.max(3, Math.floor(vectors.length / 10)), 10);
    
    // Perform clustering
    const clusterAssignments = kMeansCluster(embeddings, numClusters);
    
    // Clear existing cluster assignments
    await supabase
      .from('tiktok_brain_vectors')
      .update({ cluster_id: null })
      .eq('user_id', userId);
    
    await supabase
      .from('tiktok_brain_clusters')
      .delete()
      .eq('user_id', userId);
    
    // Create new clusters and assign vectors
    const clusterStats = new Map<number, {
      vectors: any[];
      avgPerformance: number;
      representativeId: string;
    }>();
    
    // Group vectors by cluster
    for (let i = 0; i < vectors.length; i++) {
      const clusterId = clusterAssignments[i];
      if (!clusterStats.has(clusterId)) {
        clusterStats.set(clusterId, { vectors: [], avgPerformance: 0, representativeId: '' });
      }
      clusterStats.get(clusterId)!.vectors.push(vectors[i]);
    }
    
    let clustersCreated = 0;
    
    // Process each cluster
    for (const [clusterIndex, stats] of clusterStats.entries()) {
      if (stats.vectors.length === 0) continue;
      
      // Calculate average performance
      const avgPerf = stats.vectors.reduce((sum, v) => 
        sum + (v.saves_per_1k || 0) + (v.f_per_1k || 0), 0) / stats.vectors.length;
      
      // Find representative vector (highest performing)
      const representative = stats.vectors.reduce((best, current) => {
        const currentPerf = (current.saves_per_1k || 0) + (current.f_per_1k || 0);
        const bestPerf = (best.saves_per_1k || 0) + (best.f_per_1k || 0);
        return currentPerf > bestPerf ? current : best;
      });
      
      // Create cluster record
      const { data: cluster, error: clusterError } = await supabase
        .from('tiktok_brain_clusters')
        .insert({
          user_id: userId,
          cluster_name: `Cluster ${clusterIndex + 1} (${stats.vectors[0].content_type})`,
          representative_vector_id: representative.id,
          content_type: stats.vectors[0].content_type,
          avg_performance: avgPerf,
          vector_count: stats.vectors.length
        })
        .select('id')
        .single();
      
      if (clusterError) {
        console.error('Error creating cluster:', clusterError);
        continue;
      }
      
      // Assign vectors to cluster
      const vectorIds = stats.vectors.map(v => v.id);
      const { error: assignError } = await supabase
        .from('tiktok_brain_vectors')
        .update({ cluster_id: cluster.id })
        .in('id', vectorIds);
      
      if (!assignError) {
        clustersCreated++;
        console.log(`Created cluster ${cluster.id} with ${stats.vectors.length} vectors (avg perf: ${avgPerf.toFixed(2)})`);
      }
    }
    
    console.log(`Clustering complete. Created ${clustersCreated} clusters`);
    return { clustersCreated };
    
  } catch (error) {
    console.error('Error in clustering:', error);
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

    const { action } = await req.json();

    if (action === 'deduplicate') {
      const result = await deduplicateContent(user.id);
      
      return new Response(JSON.stringify({
        success: true,
        ...result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'cluster') {
      const result = await clusterContent(user.id);
      
      return new Response(JSON.stringify({
        success: true,
        ...result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'optimize') {
      // Run both deduplication and clustering
      const dedupeResult = await deduplicateContent(user.id);
      const clusterResult = await clusterContent(user.id);
      
      return new Response(JSON.stringify({
        success: true,
        deduplicatedCount: dedupeResult.deduplicatedCount,
        clustersCreated: clusterResult.clustersCreated
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action. Use: deduplicate, cluster, or optimize');

  } catch (error) {
    console.error('Error in brain-optimizer:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});