// ==========================================
// SHREEVA TRENDS - SUPABASE CONFIGURATION
// ==========================================

// Your Supabase Project URL
const SUPABASE_URL = "https://zavsiwaeakrtduocghdn.supabase.co";

// Your Supabase ANON / PUBLIC key
const SUPABASE_ANON_KEY = "sb_publishable_Di6dEhZK1WjdCdEF_otctw_S-APk_G8";


// ==========================================
// CREATE SUPABASE CLIENT
// ==========================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
