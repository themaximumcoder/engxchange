import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://udcspzahpyjcixsccnyq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkY3NwemFocHlqY2l4c2NjbnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzA4NDcsImV4cCI6MjA5MTg0Njg0N30.6XM7ja6XEN4yqKm9TroQQUH7oM7KBQ4IlW8JTkH-nRo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
