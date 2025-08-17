-- Create table for TikTok account contexts
CREATE TABLE public.tiktok_account_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission TEXT,
  brand_pillars TEXT[],
  positioning TEXT,
  audience_personas JSONB,
  do_not_do TEXT[],
  tone_guide TEXT,
  content_themes TEXT[],
  north_star_metric TEXT,
  secondary_metrics TEXT[],
  strategic_bets TEXT[],
  negative_keywords TEXT[],
  weights JSONB DEFAULT '{"retention": 0.3, "saves": 0.4, "follows": 0.3}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for account context embeddings
CREATE TABLE public.tiktok_account_context_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  embedding vector(3072),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tiktok_account_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_account_context_embeddings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tiktok_account_contexts
CREATE POLICY "Users can view their own account context"
ON public.tiktok_account_contexts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own account context"
ON public.tiktok_account_contexts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own account context"
ON public.tiktok_account_contexts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own account context"
ON public.tiktok_account_contexts
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for tiktok_account_context_embeddings
CREATE POLICY "Users can view their own context embeddings"
ON public.tiktok_account_context_embeddings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own context embeddings"
ON public.tiktok_account_context_embeddings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own context embeddings"
ON public.tiktok_account_context_embeddings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own context embeddings"
ON public.tiktok_account_context_embeddings
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating timestamp
CREATE TRIGGER update_tiktok_account_contexts_updated_at
BEFORE UPDATE ON public.tiktok_account_contexts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tiktok_account_context_embeddings_updated_at
BEFORE UPDATE ON public.tiktok_account_context_embeddings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();