-- Add unique constraint on user_id for tiktok_account_contexts table
ALTER TABLE public.tiktok_account_contexts 
ADD CONSTRAINT tiktok_account_contexts_user_id_unique UNIQUE (user_id);