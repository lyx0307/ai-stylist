import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixImages() {
    console.log('Fetching products with broken Unsplash source URLs...');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, image')
        .like('image', '%source.unsplash.com%');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products to fix. Updating...`);

    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        console.log(`Fixing batch ${Math.floor(i / batchSize) + 1}...`);

        // Have to update one by one or via an upsert
        // Since we only want to update, let's just do Promise.all for the batch
        await Promise.all(batch.map(async (p) => {
            // Use picsum.photos as a reliable placeholder with a seed based on product ID
            const newImage = `https://picsum.photos/seed/${p.id}/800/1200`;
            const { error: updateError } = await supabase
                .from('products')
                .update({ image: newImage })
                .eq('id', p.id);

            if (updateError) {
                console.error(`Error updating product ${p.id}:`, updateError);
            }
        }));
    }

    console.log('Image URLs fixed successfully!');
}

fixImages();
