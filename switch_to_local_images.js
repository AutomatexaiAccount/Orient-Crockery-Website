const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://rppakudcmvwlkcxjhnfn.supabase.co';
const supabaseKey = 'sb_secret__0uCB8f2gWM0y4-Q9Tq6Vg_p7dfgQbq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function switchImagesToLocal() {
  const publicProductsDir = path.join(__dirname, 'public', 'images', 'products');
  const finalImagesDir = path.join(__dirname, 'FINAL_IMAGES_FOR_SUPABASE');
  
  if (!fs.existsSync(publicProductsDir)) {
    fs.mkdirSync(publicProductsDir, { recursive: true });
  }

  // 1. Copy all images to public/images/products
  const images = fs.readdirSync(finalImagesDir);
  console.log(`Copying ${images.length} images to local public folder...`);
  
  for (const img of images) {
    fs.copyFileSync(
      path.join(finalImagesDir, img),
      path.join(publicProductsDir, img)
    );
  }

  console.log("Images copied successfully! Now updating database to point to local paths...");

  // 2. Update Supabase to use local paths
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, image')
    .gte('id', 400);

  if (fetchError) {
    console.error("Error fetching products:", fetchError.message);
    return;
  }

  let updatedCount = 0;
  for (const product of products) {
    if (product.image && product.image.includes('supabase.co')) {
      // Find the file in our copied images (some are .png, some .jpg, some .webp)
      // Since our script saved them as .png in FINAL_IMAGES_FOR_SUPABASE, they are all .png
      const localPath = `/images/products/${product.id}.png`;
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ image: localPath })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Failed to update ${product.id}:`, updateError.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} products in the database to use local images!`);
}

switchImagesToLocal();
