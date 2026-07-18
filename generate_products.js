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

const imageLibrary = {
    "风衣": { male: ["1491553895911-0055eca6402d", "1507679622081-43899f8d9519"], female: ["1559582798-678dfc71ccd8", "1520975954732-57dd22299614", "1517849845537-4d257902454a"] },
    "西服套装": { male: ["1594938298598-70f90bf754da", "1593032465175-481ac9940164", "1617137968427-85924c800a22"], female: ["1548624313-0396c75e4b1a", "1600334129128-685c5582c91b"] },
    "直筒裤": { male: ["1542272604-787c3835535d", "1473966968600-fa801b869a1a"], female: ["1584370848010-d7fe6bc767ec", "1602293589930-45aad59ba3ab", "1482849297070-f4fae2173166"] },
    "连衣裙": { male: [], female: ["1515372039744-b8f02a3ae446", "1539008835657-9e8e9680c956", "1496747611176-843222e1e57c"] },
    "卫衣": { male: ["1556821840-3a63f95609a7", "1578681994506-b8f463449011"], female: ["1515886657613-9f3515b0c78f", "1605763240000-7e93b172d754"] },
    "夹克": { male: ["1551028719-0125fd6b208c", "1521223832859-c8b41725b73e", "1489987707023-afc7de50bfd9"], female: ["1534030347209-467a5b0ad3e6", "1508215885820-4585e56135c8"] },
    "托特包": { male: ["1590874103328-eac38a683ce7"], female: ["1591561954557-26941169b49e", "1584916201218-f4242ceb4809", "1598532163257-ba3148cac3dc"] },
    "单肩包": { male: ["1559556801-447b93c8d184"], female: ["1548036328-c15891314ebb", "1594223274512-ad4803739b7c", "1581497396202-5645e76a3a8e"] },
    "运动鞋": { male: ["1542291026-7eec264c27ff", "1552346154-21d32810baa3", "1608231387042-66d1773070a5"], female: ["1595950653106-6c9ebd614c3a", "1600185365483-26d7a4cc7519"] },
    "乐福鞋": { male: ["1608256246200-53e635b5b65f", "1488181436445-312946c10323"], female: ["1515347619362-e64e9a0bc4c6", "1581023772186-b413000632a7"] },
    "针织衫": { male: ["1620799140408-edc6dcb6d633", "1611095941659-450f61d5681c"], female: ["1576566588028-4147f3842f27", "1600881333168-2ef49b341f30", "1503341504253-d2d0864e2772"] },
    "半身裙": { male: [], female: ["1583496661160-c588c2589f85", "1551163943-3f6a855d1153", "1582142407894-ea857e8d4e00"] },
    "大衣": { male: ["1539533018447-63fcce2678e3", "1512353087810-25844bba57be"], female: ["1509631179647-0c4464d11ac6", "1543163521-1bf539c55dd2"] },
    "围巾": { male: ["1601004890684-d8cbf643f5f2", "1543881472-7472093e06f9"], female: ["1520610141648-8a8b1ed7ec14", "1485303790589-9a67a0ea01c8"] },
    "帽子": { male: ["1521369909029-133eb8784261", "1534215754734-18e55d13e346"], female: ["1515886657613-9f3515b0c78f", "1514311548104-b1f49673de14"] }
};

function generateRandomProduct(category, index) {
    const isFeatured = Math.random() > 0.8;
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const mat = materials[Math.floor(Math.random() * materials.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    // Determine gender based on item availability and randomness
    const availableForMale = imageLibrary[noun].male.length > 0;
    const availableForFemale = imageLibrary[noun].female.length > 0;
    
    let gender = "female"; // default
    if (availableForMale && availableForFemale) {
        gender = Math.random() > 0.5 ? "male" : "female";
    } else if (availableForMale) {
        gender = "male";
    }

    const genderPrefix = gender === "male" ? "男士" : "女士";
    const name = `${adj}${genderPrefix}${mat}${noun} - 序列号${String(index).padStart(3, '0')}`;

    const price = Math.floor(Math.random() * 2000 + 100);
    const likes = Math.floor(Math.random() * 5000);

    // Pick a random curated image ID
    const imageIds = imageLibrary[noun][gender];
    const imageId = imageIds[Math.floor(Math.random() * imageIds.length)];
    const image = `https://images.unsplash.com/photo-${imageId}?w=800&q=80`;

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
