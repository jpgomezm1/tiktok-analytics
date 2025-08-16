-- Create function to execute raw SQL for vector search
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT, params JSON DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  video_id uuid,
  content_type text,
  content text,
  retention_pct numeric,
  saves_per_1k numeric,
  f_per_1k numeric,
  for_you_pct numeric,
  views bigint,
  duration_seconds int,
  video_type text,
  published_date date,
  score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a simplified version that works with vector similarity search
  -- For security, we're limiting this to vector search queries only
  IF sql LIKE '%tiktok_brain_vectors%' AND sql LIKE '%embedding%' THEN
    RETURN QUERY EXECUTE sql USING 
      (params->0)::uuid,  -- user_id
      (params->1)::vector(1536),  -- query embedding
      (params->2)::text[],  -- content_types array
      (params->3)::date,  -- date_from
      (params->4)::int;  -- limit
  ELSE
    RAISE EXCEPTION 'Unauthorized query type';
  END IF;
END;
$$;