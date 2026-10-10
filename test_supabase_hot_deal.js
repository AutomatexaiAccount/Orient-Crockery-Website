const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('products').select('*').limit(5);
  if (error) console.error(error);
  console.log("Keys of first product:", data ? Object.keys(data[0]) : null);
  console.log("First product is_hot_deal:", data ? data[0].is_hot_deal : null);
}
test();
