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

const adjectives = ["高品质", "经典", "复古", "休闲", "极简", "优雅", "法式", "宽松", "修身", "百搭", "廓形", "质感", "立体", "时尚", "轻奢"];
const materials = ["纯棉", "羊毛", "真丝", "亚麻", "牛仔", "牛皮", "丝绒", "羊绒", "混纺", "缎面", "针织", "防水面料", "粗花呢", "灯芯绒", "雪纺"];

const items = [
    { noun: "风衣", gender: "both" },
    { noun: "西服套装", gender: "both" },
    { noun: "直筒裤", gender: "both" },
    { noun: "连衣裙", gender: "female" },
    { noun: "卫衣", gender: "both" },
    { noun: "夹克", gender: "both" },
    { noun: "托特包", gender: "both" },
    { noun: "单肩包", gender: "both" },
    { noun: "运动鞋", gender: "both" },
    { noun: "乐福鞋", gender: "both" },
    { noun: "针织衫", gender: "both" },
    { noun: "半身裙", gender: "female" },
    { noun: "大衣", gender: "both" },
    { noun: "围巾", gender: "both" },
    { noun: "帽子", gender: "both" },
];

// Generate SVG data URI with Chinese text on white background
function makeSvgImage(genderPrefix, noun) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200">
  <rect width="800" height="1200" fill="#f5f5f5"/>
  <text x="400" y="520" text-anchor="middle" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="#555">${genderPrefix}</text>
  <text x="400" y="660" text-anchor="middle" font-family="Arial,sans-serif" font-size="96" font-weight="bold" fill="#222">${noun}</text>
</svg>`;
    // Encode as data URI
    const encoded = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    return encoded;
}

function generateProduct(category) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const mat = materials[Math.floor(Math.random() * materials.length)];
    const item = items[Math.floor(Math.random() * items.length)];

    let genderPrefix;
    if (item.gender === "female") {
        genderPrefix = "女士";
    } else {
        genderPrefix = Math.random() > 0.5 ? "男士" : "女士";
    }

    const name = `${adj}${genderPrefix}${mat}${item.noun}`;
    const price = Math.floor(Math.random() * 2000 + 100);
    const likes = Math.floor(Math.random() * 5000);
    const image = makeSvgImage(genderPrefix, item.noun);

    const pTags = ["NEW", "HOT", "AI PICK", null, null, null];
    const tag = pTags[Math.floor(Math.random() * pTags.length)];

    // Each product belongs to exactly ONE category
    return {
        name,
        price: `¥${price.toLocaleString()}`,
        image,
        category: [category],
        tag,
        likes,
        description: `为您量身打造的${category}单品，选用${mat}材质，完美契合您的穿搭灵感。`
    };
}

async function reseed() {
    console.log('Deleting all existing products...');
    const { error: fiError } = await supabase.from('favorite_items').delete().gte('favorite_id', 0);
    if (fiError) console.warn('Warning deleting favorite_items:', fiError.message);

    const { error: delError } = await supabase.from('products').delete().gte('id', 0);
    if (delError) {
        console.error('Error deleting products:', delError);
        return;
    }
    console.log('All existing products deleted.');

    console.log('Generating 20 products per category (100 total)...');
    const allProducts = [];

    for (const cat of categories) {
        for (let i = 0; i < 20; i++) {
            allProducts.push(generateProduct(cat));
        }
    }

    const batchSize = 50;
    for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}...`);
        const { error } = await supabase.from('products').insert(batch);
        if (error) {
            console.error('Error inserting batch:', error);
        }
    }

    console.log(`Done! Inserted ${allProducts.length} products.`);
}

reseed();
