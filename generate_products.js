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

const categories = ["极简风", "街头潮流", "老钱风", "复古", "职场通勤"];

const imageKeywords = {
    "极简风": ["minimalist-fashion", "clean-aesthetic", "white-shirt", "minimal-outfit", "structured-bag", "monochrome"],
    "街头潮流": ["streetwear", "sneakers", "hoodie", "urban-fashion", "oversized", "skater"],
    "老钱风": ["old-money-fashion", "cashmere", "tweed", "classic-style", "polo", "elegant"],
    "复古": ["vintage-fashion", "90s-style", "retro-clothing", "denim", "leather-jacket", "y2k"],
    "职场通勤": ["business-casual", "suit", "blazer", "office-wear", "trousers", "work-bag"]
};

// Words to assemble product names
const adjectives = ["高品质", "经典", "复古", "休闲", "极简", "优雅", "法式", "宽松", "修身", "百搭", "廓形", "质感", "无缝", "环保", "立体"];
const materials = ["纯棉", "羊毛", "真丝", "亚麻", "牛仔", "牛皮", "丝绒", "羊绒", "混纺", "缎面", "针织", "防水面料", "粗花呢", "皮草", "灯芯绒"];
const nouns = ["风衣", "西服套装", "直筒裤", "连衣裙", "卫衣", "夹克", "托特包", "单肩包", "运动鞋", "乐福鞋", "针织衫", "半身裙", "大衣", "围巾", "帽子"];

function generateRandomProduct(category, index) {
    const isFeatured = Math.random() > 0.8;
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const mat = materials[Math.floor(Math.random() * materials.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    const name = `${adj}${mat}${noun} - 序列号${String(index).padStart(3, '0')}`;

    const price = Math.floor(Math.random() * 2000 + 100);
    const likes = Math.floor(Math.random() * 5000);

    const kwList = imageKeywords[category] || ["fashion"];
    const kw = kwList[Math.floor(Math.random() * kwList.length)];
    const image = `https://source.unsplash.com/800x1200/?${kw}&sig=${index}`; // Unsplash source api with sig to avoid caching duplicates

    const pTags = ["NEW", "HOT", "AI PICK", null, null, null];
    const tag = pTags[Math.floor(Math.random() * pTags.length)];

    // Randomly add a second related category sometimes
    let productCategories = [category];
    if (Math.random() > 0.7) {
        const otherCat = categories[Math.floor(Math.random() * categories.length)];
        if (otherCat !== category) {
            productCategories.push(otherCat);
        }
    }

    // Convert to Postgres array format string or let Supabase node array handle it. Supabase SDK supports JS arrays.

    return {
        name,
        price: `¥${price.toLocaleString()}`,
        image,
        category: productCategories,
        tag,
        likes,
        description: `为您量身打造的${category}单品，选用${mat}材质，完美契合您的穿搭灵感。这是系列产品第 ${index} 号。`
    };
}

async function seedMassiveData() {
    console.log('Generating 30 products per category...');
    let totalProducts = [];

    let globalIndex = 0;
    for (const cat of categories) {
        for (let i = 0; i < 30; i++) {
            globalIndex++;
            totalProducts.push(generateRandomProduct(cat, globalIndex));
        }
    }

    console.log(`Prepared ${totalProducts.length} mock products. Inserting to Supabase in batches...`);

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < totalProducts.length; i += batchSize) {
        const batch = totalProducts.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}...`);

        // The format of 'category' should be string array. Wait, in database it is 'TEXT[]'. Supabase JS accepts JS array of strings.
        const pgBatch = batch.map(p => {
            // According to our SQL `category TEXT[] DEFAULT '{}'`, Supabase js handles JS array to PostgreSQL array.
            // Wait, for sometimes insertion we need format '{"Cat1", "Cat2"}'.
            // Let's pass '{' + p.category.map(c => '"' + c + '"').join(',') + '}' just to be safe, because sometimes pg driver gets confused.
            // Actually, JS array works fine for supabase-js.
            return p;
        });

        const { error } = await supabase.from('products').insert(batch);
        if (error) {
            console.error('Error inserting batch', error);
            // Wait, let's try safely format as pg string just in case
            console.log('Trying fallback format for categories...');
            const fallbackBatch = batch.map(p => ({
                ...p,
                category: `{${p.category.map(c => `"${c}"`).join(',')}}`
            }));
            const { error: fallbackError } = await supabase.from('products').insert(fallbackBatch);
            if (fallbackError) {
                console.error("Fallback error", fallbackError);
            }
        }
    }

    console.log('Massive seed complete!');
}

seedMassiveData();
