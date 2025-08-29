// Re-export the supabase client from integrations
export { supabase } from '@/integrations/supabase/client';

// Database types  
export interface User {
  id: string;
  email: string;
  age_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Institute {
  id: string;
  name: string;
  domain_patterns: string[];
  active: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  section: 'feed' | 'dark_desire';
  kind: 'text' | 'image' | 'poll';
  content: string;
  images: string[];
  poll_options: any;
  visibility: 'campus' | 'global';
  created_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  type: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface SecretLike {
  id: string;
  source_user_id: string;
  target_post_id: string;
  target_user_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  media_ref?: string;
  created_at: string;
  deleted_at?: string;
}