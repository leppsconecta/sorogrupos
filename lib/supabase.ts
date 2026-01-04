
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzylycxvjmxzyfpyhngx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eWx5Y3h2am14enlmcHlobmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTExMjksImV4cCI6MjA4Mjg2NzEyOX0.3gjVuMMX0YgfP3KhR5DxLAWe9iwzKiZ4BhJdgh8vb6o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
