const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rppakudcmvwlkcxjhnfn.supabase.co';
const supabaseKey = 'sb_secret__0uCB8f2gWM0y4-Q9Tq6Vg_p7dfgQbq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTypos() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name')
    .gte('id', 400);

  if (error) {
    console.error(error);
    return;
  }

  let updated = 0;
  for (const p of products) {
    let newName = p.name;
    
    // Fix Stahl -Schild to Stahl - Schild
    newName = newName.replace('Stahl -Schild', 'Stahl - Schild');
    
    // Fix Frypan to Fry Pan
    newName = newName.replace('Frypan', 'Fry Pan');
    
    // Fix any double spaces
    newName = newName.replace(/\s+/g, ' ').trim();

    if (newName !== p.name) {
      console.log(`Fixing: ${p.name} -> ${newName}`);
      await supabase.from('products').update({ name: newName }).eq('id', p.id);
      updated++;
    }
  }

  console.log(`Fixed ${updated} product names.`);
}

fixTypos();
