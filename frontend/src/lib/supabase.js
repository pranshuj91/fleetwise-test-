import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dphydlneamkkmraxjuxi.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHlkbG5lYW1ra21yYXhqdXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjM4NTQsImV4cCI6MjA3OTEzOTg1NH0.c00dqu0WYkGP_VQCHT8nsS3-JYw50BMXvxXV7NmYfuE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
