import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// NOTE: PLEASE REPLACE WITH YOUR OWN SUPABASE PROJECT URL AND ANON KEY
// You can find these in your Supabase project's settings under "API".
// -----------------------------------------------------------------------------
const supabaseUrl = 'https://rkuiwfshwnnvlhibaqht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdWl3ZnNod25udmxoaWJhcWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzIyODQsImV4cCI6MjA3NDU0ODI4NH0.-BTlryGZalmIxxjw5y82zSJW9FE5YRDVMONrJFvU0J0';
// -----------------------------------------------------------------------------

if (!supabaseUrl || supabaseUrl === 'https://rkuiwfshwnnvlhibaqht.supabase.co' || !supabaseKey || supabaseKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdWl3ZnNod25udmxoaWJhcWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzIyODQsImV4cCI6MjA3NDU0ODI4NH0.-BTlryGZalmIxxjw5y82zSJW9FE5YRDVMONrJFvU0J0') {
    // This is not a real error, but a visual reminder for the user to configure their credentials.
    // In a real production app, you would use environment variables and throw a hard error if they are missing.
    alert("ATTENTION: Please configure your Supabase credentials in supabase/client.ts");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
