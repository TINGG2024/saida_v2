import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkuhgdxnblshlvwkmwni.supabase.co';
const supabaseKey = 'sb_publishable_5k9JgLr8RWCVQO_P0tvplA_HU0lLewM';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
