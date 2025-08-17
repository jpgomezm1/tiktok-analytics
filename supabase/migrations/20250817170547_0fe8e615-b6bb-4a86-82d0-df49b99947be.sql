-- Drop existing table to recreate with new structure
DROP TABLE IF EXISTS public.tiktok_brain_vectors CASCADE;

-- Create enhanced TikTok brain vectors table
CREATE TABLE public.tiktok_brain_vectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id UUID NOT NULL,
  
  -- Content chunking
  section_tag TEXT, -- hook_0_3s, setup, proof, cta_strong
  content_type TEXT NOT NULL, -- hook, guion, cta
  content TEXT NOT NULL,
  
  -- Bilingual embeddings (using 1536 dimensions instead of 3072)
  embedding_es vector(1536),
  embedding_en vector(1536),
  
  -- Enhanced metadata
  video_theme TEXT,
  cta_type TEXT,
  editing_style TEXT,
  tone_style TEXT,
  language TEXT DEFAULT 'es',
  
  -- Clustering and deduplication
  cluster_id UUID,
  is_duplicate BOOLEAN DEFAULT false,
  needs_review BOOLEAN DEFAULT false,
  similarity_score NUMERIC,
  
  -- Video metrics (copied for performance)
  views BIGINT,
  likes BIGINT,
  comments BIGINT,
  shares BIGINT,
  retention_pct NUMERIC,
  saves_per_1k NUMERIC,
  f_per_1k NUMERIC,
  for_you_pct NUMERIC,
  duration_seconds INTEGER,
  published_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Performance indexes
  CONSTRAINT valid_content_length CHECK (length(content) >= 15)
);

-- Enable RLS
ALTER TABLE public.tiktok_brain_vectors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own vectors"
ON public.tiktok_brain_vectors
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vectors"
ON public.tiktok_brain_vectors
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vectors"
ON public.tiktok_brain_vectors
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vectors"
ON public.tiktok_brain_vectors
FOR DELETE
USING (auth.uid() = user_id);

-- Create performance indexes
CREATE INDEX idx_brain_vectors_user_video ON public.tiktok_brain_vectors(user_id, video_id);
CREATE INDEX idx_brain_vectors_content_type ON public.tiktok_brain_vectors(user_id, content_type);
CREATE INDEX idx_brain_vectors_section_tag ON public.tiktok_brain_vectors(user_id, section_tag);
CREATE INDEX idx_brain_vectors_cluster ON public.tiktok_brain_vectors(user_id, cluster_id) WHERE cluster_id IS NOT NULL;
CREATE INDEX idx_brain_vectors_duplicates ON public.tiktok_brain_vectors(user_id, is_duplicate) WHERE is_duplicate = false;

-- Create HNSW indexes for vector similarity search
CREATE INDEX idx_brain_vectors_embedding_es ON public.tiktok_brain_vectors 
USING hnsw (embedding_es vector_cosine_ops) WHERE embedding_es IS NOT NULL;

CREATE INDEX idx_brain_vectors_embedding_en ON public.tiktok_brain_vectors 
USING hnsw (embedding_en vector_cosine_ops) WHERE embedding_en IS NOT NULL;

-- Create trigger for updating timestamp
CREATE TRIGGER update_tiktok_brain_vectors_updated_at
BEFORE UPDATE ON public.tiktok_brain_vectors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for clustering metadata
CREATE TABLE public.tiktok_brain_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cluster_name TEXT,
  representative_vector_id UUID REFERENCES public.tiktok_brain_vectors(id),
  content_type TEXT,
  avg_performance NUMERIC,
  vector_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for clusters
ALTER TABLE public.tiktok_brain_clusters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clusters
CREATE POLICY "Users can view their own clusters"
ON public.tiktok_brain_clusters
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clusters"
ON public.tiktok_brain_clusters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clusters"
ON public.tiktok_brain_clusters
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clusters"
ON public.tiktok_brain_clusters
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for clusters timestamp
CREATE TRIGGER update_tiktok_brain_clusters_updated_at
BEFORE UPDATE ON public.tiktok_brain_clusters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();