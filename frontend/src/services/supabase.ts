import { createClient } from '@supabase/supabase-js';

/*
 * Provide your Supabase project URL and anon key here.  Without valid
 * values the authentication functions will fail.  You can find these
 * credentials in your Supabase project settings under API.
 */
const SUPABASE_URL = 'https://kroiwjcchccoxawtwtic.supabase.co';
// The following anon key is sensitive and should be stored securely in
// environment variables or a secrets manager in a production
// application.  It is embedded here for demonstration only.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyb2l3amNjaGNjb3hhd3R3dGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0OTM5OTQsImV4cCI6MjA2OTA2OTk5NH0.aFr2Vlo1Z6P9yjwrDYjhbwm6lgPE62eUqYmXiw1yP_M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);