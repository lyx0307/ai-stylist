-- database_schema.sql
-- Please run this script in your Supabase SQL Editor to create the necessary tables.

-- 1. Users table (Mock single user for now, but scalable)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    height TEXT,
    weight TEXT,
    is_registered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT[] DEFAULT '{}',
    tag TEXT,
    likes INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Favorites table (Inspiration Wardrobe)
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Favorite Items table (Mapping products to favorites)
CREATE TABLE IF NOT EXISTS favorite_items (
    favorite_id INTEGER REFERENCES favorites(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (favorite_id, product_id)
);

-- 5. Chat History table
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    action TEXT,
    time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some seed data for products
INSERT INTO products (name, price, image, category, tag, likes, description) VALUES
('经典廓形风衣', '¥899', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"极简风", "职场通勤", "老钱风"}', 'NEW', 1200, '这款风衣采用高垂坠感面料，剪裁利落，适合多种场合穿着。'),
('阔腿褶皱西裤', '¥299', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"极简风", "职场通勤"}', NULL, 850, '经典高腰设计，拉长腿部线条，面料舒适透气。'),
('缎面吊带连衣裙', '¥599', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"老钱风", "复古"}', NULL, 1500, '100% 桑蚕丝，光泽感极佳，尽显优雅气质。'),
('日常帆布托特包', '¥120', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"极简风", "街头潮流"}', 'AI PICK', 450, '大容量设计，满足日常通勤需求。'),
('极简结构真皮手袋', '¥1,200', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"极简风", "老钱风", "职场通勤"}', NULL, 2400, '头层牛皮制作，质感细腻，极简线条设计。'),
('美利奴羊毛粗针织衫', '¥450', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"老钱风", "复古", "极简风"}', NULL, 500, '澳洲进口美利奴羊毛，保暖舒适，亲肤不扎。'),
('90年代直筒牛仔裤', '¥350', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"复古", "街头潮流"}', NULL, 2100, '复古洗水工艺，直筒版型修饰腿型。'),
('复古跑步休闲鞋', '¥680', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"街头潮流", "复古"}', 'NEW', 1800, '复古配色，轻便透气，适合日常休闲。'),
('oversize 卫衣', '¥299', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"街头潮流"}', NULL, 900, '宽松版型，舒适百搭，街头潮人必备。'),
('羊绒围巾', '¥399', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', '{"老钱风", "极简风"}', NULL, 1100, '柔软亲肤，冬季保暖神器。');

-- Add a default user
INSERT INTO users (name, height, weight, is_registered) VALUES ('刘宇翔', '165', '48', true);
