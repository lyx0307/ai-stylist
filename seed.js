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

const FAVORITES_DATA = [
    {
        title: "春季极简风衣穿搭",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        items: [1, 5] // 经典廓形风衣, 极简结构真皮手袋
    },
    {
        title: "棕色系配饰参考",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        items: [5] // 极简结构真皮手袋
    },
    {
        title: "粗针织毛衣质感",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        items: [6] // 美利奴羊毛粗针织衫
    },
    {
        title: "阔腿裤通勤灵感",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        items: [2] // 阔腿褶皱西裤
    },
    {
        title: "复古丹宁日常",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        items: [7] // 90年代直筒牛仔裤
    },
    {
        title: "晚宴丝绸长裙",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        items: [3] // 缎面吊带连衣裙
    }
];

const CHAT_HISTORY = [
    {
        role: 'ai',
        content: '嗨！我是你的专属 AI 造型师。今天想尝试什么风格呢？',
        time: '10:23 AM'
    }
];

async function seedData() {
    console.log('Fetching user...');
    const { data: users, error: userError } = await supabase.from('users').select('id').limit(1).single();

    if (userError || !users) {
        console.error('Error fetching user. Make sure user exists.', userError);
        return;
    }
    const userId = users.id;

    console.log('Seeding Favorites...');
    for (const fav of FAVORITES_DATA) {
        const { data: favData, error: favError } = await supabase
            .from('favorites')
            .insert([{ user_id: userId, title: fav.title, image: fav.image }])
            .select()
            .single();

        if (favError) {
            console.error('Error inserting favorite', favError);
            continue;
        }

        if (fav.items.length > 0) {
            const itemsToInsert = fav.items.map(pid => ({ favorite_id: favData.id, product_id: pid }));
            const { error: itemsError } = await supabase.from('favorite_items').insert(itemsToInsert);
            if (itemsError) {
                console.error('Error inserting favorite items', itemsError);
            }
        }
    }

    console.log('Seeding Chat History...');
    for (const chat of CHAT_HISTORY) {
        const { error: chatError } = await supabase
            .from('chat_history')
            .insert([{ user_id: userId, role: chat.role, content: chat.content, time: chat.time }]);
        if (chatError) {
            console.error('Error inserting chat history', chatError);
        }
    }

    console.log('Seeding complete!');
}

seedData();
