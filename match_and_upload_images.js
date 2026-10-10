const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const supabaseUrl = 'https://rppakudcmvwlkcxjhnfn.supabase.co';
const supabaseKey = 'sb_secret__0uCB8f2gWM0y4-Q9Tq6Vg_p7dfgQbq';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get all files recursively
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.match(/\.(png|jpe?g|webp)$/i)) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

async function start() {
  console.log("Reading images...");
  const stahlImages = getAllFiles(path.join(__dirname, 'STAHL'));
  const meyerImages = getAllFiles(path.join(__dirname, 'TRIVANTAGE PRO'));
  const allImages = [...stahlImages, ...meyerImages];
  
  console.log(`Found ${allImages.length} images.`);

  const csvData = fs.readFileSync('./NEW_PRODUCTS_IMPORT.csv', 'utf8');
  const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  const products = parsed.data;

  console.log(`Matching and uploading for ${products.length} products...`);

  for (const product of products) {
    // Basic tokenizer for the product name
    const tokens = product.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    
    // Score each image path based on how many tokens match
    let bestMatch = null;
    let bestScore = 0;

    for (const imgPath of allImages) {
      const normalizedPath = imgPath.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      let score = 0;
      for (const token of tokens) {
        if (normalizedPath.includes(token)) {
          score++;
        }
      }
      
      // If the brand matches, give extra points
      if (product.name.toLowerCase().includes('meyer') && imgPath.toLowerCase().includes('trivantage')) score += 2;
      if (product.name.toLowerCase().includes('stahl') && imgPath.toLowerCase().includes('stahl')) score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = imgPath;
      }
    }

    if (bestMatch && bestScore > 3) { // Ensure reasonable match
      console.log(`[${product.id}] ${product.name}`);
      console.log(`    Matched: ${bestMatch} (Score: ${bestScore})`);
      
      // Read file and upload
      const fileBuffer = fs.readFileSync(bestMatch);
      const ext = path.extname(bestMatch);
      const contentType = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
      
      const fileName = `${product.id}.png`; // Always save as .png or whatever to match db
      
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) {
        console.error(`    Error uploading: ${error.message}`);
      } else {
        console.log(`    Successfully uploaded to Supabase Storage!`);
      }
    } else {
      console.log(`[${product.id}] ${product.name} - NO GOOD MATCH FOUND`);
    }
  }
  
  console.log("Done!");
}

start();
