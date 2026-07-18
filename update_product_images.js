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

const nounPrompts = {
    "风衣": "fashion photography of a stylish women trench coat",
    "西服套装": "fashion photography of an elegant suit",
    "直筒裤": "fashion photography of stylish straight pants trousers",
    "连衣裙": "fashion photography of a beautiful elegant dress",
    "卫衣": "fashion photography of a trendy hoodie",
    "夹克": "fashion photography of a cool fashion jacket",
    "托特包": "fashion photography of a stylish tote bag",
    "单肩包": "fashion photography of a stylish shoulder bag",
    "运动鞋": "fashion photography of trendy sneakers shoes",
    "乐福鞋": "fashion photography of elegant leather loafers shoes",
    "针织衫": "fashion photography of a cozy knitwear sweater",
    "半身裙": "fashion photography of a stylish skirt",
    "大衣": "fashion photography of a stylish winter coat",
    "围巾": "fashion photography of a stylish scarf",
    "帽子": "fashion photography of a stylish hat"
};

async function fixImages() {
    console.log('Fetching products to update images based on semantics...');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products to fix. Updating...`);

    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        console.log(`Fixing batch ${Math.floor(i / batchSize) + 1}...`);

        await Promise.all(batch.map(async (p) => {
            let matchedNoun = "fashion item";
            let prompt = "fashion photography of a stylish fashion item";
            
            for (const [noun, nPrompt] of Object.entries(nounPrompts)) {
                if (p.name.includes(noun)) {
                    matchedNoun = noun;
                    prompt = nPrompt;
                    break;
                }
            }

            // Generate deterministic AI image URL
            const promptEncoded = encodeURIComponent(prompt);
            const newImage = `https://image.pollinations.ai/prompt/${promptEncoded}?width=800&height=1200&nologo=true&seed=${p.id}`;
            
            const { error: updateError } = await supabase
                .from('products')
                .update({ image: newImage })
                .eq('id', p.id);

            if (updateError) {
                console.error(`Error updating product ${p.id}:`, updateError);
            }
        }));
    }

    console.log('Image URLs updated successfully to semantic matching images!');
}

fixImages();
