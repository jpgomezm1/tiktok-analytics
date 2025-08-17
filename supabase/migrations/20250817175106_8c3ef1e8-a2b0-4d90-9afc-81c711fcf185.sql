-- Extend tiktok_account_contexts with missing fields
ALTER TABLE public.tiktok_account_contexts 
ADD COLUMN IF NOT EXISTS strategic_bets text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS negative_keywords text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS weights jsonb DEFAULT '{"retention": 0.3, "saves": 0.5, "follows": 0.2, "fyp": 0.0}'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tiktok_brain_vectors_cluster_id ON public.tiktok_brain_vectors(cluster_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_brain_vectors_published_date ON public.tiktok_brain_vectors(published_date);
CREATE INDEX IF NOT EXISTS idx_tiktok_brain_vectors_is_duplicate ON public.tiktok_brain_vectors(is_duplicate);

-- Add missing fields to tiktok_brain_vectors for clustering and deduplication
ALTER TABLE public.tiktok_brain_vectors 
ADD COLUMN IF NOT EXISTS canonical_id uuid,
ADD COLUMN IF NOT EXISTS is_representative boolean DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tiktok_brain_vectors_canonical_id ON public.tiktok_brain_vectors(canonical_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_brain_vectors_is_representative ON public.tiktok_brain_vectors(is_representative);