const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rppakudcmvwlkcxjhnfn.supabase.co';
const supabaseKey = 'sb_secret__0uCB8f2gWM0y4-Q9Tq6Vg_p7dfgQbq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function normalizeAllProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name');

  if (error) {
    console.error(error);
    return;
  }

  let updated = 0;
  console.log("Scanning all products for formatting inconsistencies...");

  for (const p of products) {
    let newName = p.name;
    
    // 1. Normalize hyphens (ensure exactly one space before and after)
    newName = newName.replace(/\s*-\s*/g, ' - ');
    
    // 2. Fix common acronyms and words
    newName = newName.replace(/\b(ss|s\.s)\b/ig, 'SS');
    newName = newName.replace(/\bgl\b/ig, 'GL');
    newName = newName.replace(/\bw\/lid\b/ig, 'w/Lid');
    newName = newName.replace(/\bfrypan\b/ig, 'Fry Pan');
    
    // 3. Normalize unit formatting (e.g., "24 cm" -> "24cm", "1.5 l" -> "1.5L")
    newName = newName.replace(/(\d+(\.\d+)?)\s*cm\b/ig, '$1cm');
    newName = newName.replace(/(\d+(\.\d+)?)\s*ml\b/ig, '$1ml');
    newName = newName.replace(/(\d+(\.\d+)?)\s*(Ltr|L)\b/ig, '$1L');
    
    // 4. Clean up multiple spaces
    newName = newName.replace(/\s+/g, ' ').trim();

    if (newName !== p.name) {
      console.log(`[${p.id}] Fixed: ${p.name} -> ${newName}`);
      await supabase.from('products').update({ name: newName }).eq('id', p.id);
      updated++;
    }
  }

  console.log(`\nScan complete! Fixed formatting for ${updated} products across all brands.`);
}

normalizeAllProducts();
