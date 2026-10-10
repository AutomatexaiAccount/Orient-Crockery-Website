const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const Papa = require('papaparse');

const supabaseUrl = 'https://rppakudcmvwlkcxjhnfn.supabase.co';
const supabaseKey = 'sb_secret__0uCB8f2gWM0y4-Q9Tq6Vg_p7dfgQbq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function upload() {
  const csvData = fs.readFileSync('./NEW_PRODUCTS_IMPORT.csv', 'utf8');
  
  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true, // Automatically converts numbers
  });
  
  const products = parsed.data;
  console.log(`Uploading ${products.length} products to Supabase...`);
  
  for (const product of products) {
    const { error } = await supabase.from('products').upsert(product);
    if (error) {
      console.error(`Error uploading product ${product.id}:`, error.message);
    } else {
      console.log(`Successfully uploaded product: ${product.name}`);
    }
  }
  console.log('Upload complete!');
}

upload();
