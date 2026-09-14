// ==========================================
// SHREEVA TRENDS - SUPABASE CONFIGURATION
// ==========================================

// Your Supabase Project URL
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";

// Your Supabase ANON / PUBLIC key
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";


// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
