import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://grozivbohzhpawdmwxau.supabase.co"; // ✅ 정확한 Project URL
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb3ppdmJvaHpocGF3ZG13eGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODc1NzIsImV4cCI6MjA3ODE2MzU3Mn0.nv4zbQHnPctj09X9zMMQYsP5gKVGHB3W_FqxXLPrUbk"; // ✅ anon public key

export const supa = createClient(SUPABASE_URL, SUPABASE_ANON);
