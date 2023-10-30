import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://fysmrdbevwxphtrsevkn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5c21yZGJldnd4cGh0cnNldmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUxNzkxNzMsImV4cCI6MjAxMDc1NTE3M30.gstQlVVRP6quLuDyM7pmtSY9HUoW8Igt3_ymgN3tZcA'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
