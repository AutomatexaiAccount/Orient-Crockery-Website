const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Helper to get all files recursively
function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return [];
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
  const outputDir = path.join(__dirname, 'FINAL_IMAGES_FOR_SUPABASE');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const stahlImages = getAllFiles(path.join(__dirname, 'STAHL'));
  const meyerImages = getAllFiles(path.join(__dirname, 'TRIVANTAGE PRO'));
  const allImages = [...stahlImages, ...meyerImages];

  const csvData = fs.readFileSync('./NEW_PRODUCTS_IMPORT.csv', 'utf8');
  const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  const products = parsed.data;

  let successCount = 0;

  for (const product of products) {
    const tokens = product.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    let bestMatch = null;
    let bestScore = 0;

    for (const imgPath of allImages) {
      const normalizedPath = imgPath.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      let score = 0;
      for (const token of tokens) {
        if (normalizedPath.includes(token)) score++;
      }
      if (product.name.toLowerCase().includes('meyer') && imgPath.toLowerCase().includes('trivantage')) score += 2;
      if (product.name.toLowerCase().includes('stahl') && imgPath.toLowerCase().includes('stahl')) score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = imgPath;
      }
    }

    if (bestMatch && bestScore > 3) {
      const targetPath = path.join(outputDir, `${product.id}.png`);
      fs.copyFileSync(bestMatch, targetPath);
      successCount++;
    }
  }
  
  console.log(`Copied ${successCount} perfectly matched images to FINAL_IMAGES_FOR_SUPABASE folder.`);
}

start();
