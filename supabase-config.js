// Initialize Supabase Client
const SUPABASE_URL = 'https://hjijfjhmqzuuwpbrxvnr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaWpmamhtcXp1dXdwYnJ4dm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NDk3ODYsImV4cCI6MjEwMDMyNTc4Nn0.r5W4SlK2-gfCJKwHsVvOHsg8h5aPUyZGN7igu84HgtY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
