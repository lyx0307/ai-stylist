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

async function fixImagesV2() {
    console.log('Fetching products to update with gender prefixes and real images...');

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
            let matchedNoun = null;
            
            for (const noun of Object.keys(imageLibrary)) {
                if (p.name.includes(noun)) {
                    matchedNoun = noun;
                    break;
                }
            }

            if (!matchedNoun) return; // Skip if no noun found

            const availableForMale = imageLibrary[matchedNoun].male.length > 0;
            const availableForFemale = imageLibrary[matchedNoun].female.length > 0;
            
            let gender = "female"; // default
            if (availableForMale && availableForFemale) {
                gender = Math.random() > 0.5 ? "male" : "female";
            } else if (availableForMale) {
                gender = "male";
            }

            // Remove old gender prefix if exists to prevent duplication
            let newName = p.name.replace("男士", "").replace("女士", "");
            
            // Insert gender prefix right before the noun
            const genderPrefix = gender === "male" ? "男士" : "女士";
            newName = newName.replace(matchedNoun, `${genderPrefix}${matchedNoun}`);
            
            // Generate real image URL
            const imageIds = imageLibrary[matchedNoun][gender];
            const imageId = imageIds[Math.floor(Math.random() * imageIds.length)];
            const newImage = `https://images.unsplash.com/photo-${imageId}?w=800&q=80`;
            
            const { error: updateError } = await supabase
                .from('products')
                .update({ image: newImage, name: newName })
                .eq('id', p.id);

            if (updateError) {
                console.error(`Error updating product ${p.id}:`, updateError);
            }
        }));
    }

    console.log('Products updated successfully with gender names and real images!');
}

fixImagesV2();
