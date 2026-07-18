import express from 'express';
import { supabase } from './supabaseClient.js';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// ----------------------------------------------------------------------
// PRODUCTS
// ----------------------------------------------------------------------
router.get('/products', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------------------------
// USER CONFIG
// ----------------------------------------------------------------------
router.get('/user', async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1).single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
        res.json(data || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/user', async (req, res) => {
    try {
        const { id, name, height, weight, is_registered } = req.body;
        let result;
        if (id) {
            result = await supabase.from('users').update({ name, height, weight, is_registered }).eq('id', id).select().single();
        } else {
            // Insert if no ID provided (basic mock approach)
            result = await supabase.from('users').insert([{ name, height, weight, is_registered }]).select().single();
        }
        if (result.error) throw result.error;
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------------------------
// FAVORITES (Inspiration Wardrobe)
// ----------------------------------------------------------------------
router.get('/favorites', async (req, res) => {
    try {
        // Get favorites with user_id... ignoring user auth for now mock one
        const { data: users, error: userError } = await supabase.from('users').select('id').limit(1).single();
        if (userError && userError.code !== 'PGRST116') throw userError;
        const userId = users ? users.id : null;

        if (!userId) return res.json([]);

        const { data, error } = await supabase
            .from('favorites')
            .select(`
        *,
        favorite_items (
           products (*)
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Format to match frontend structure
        const formattedData = data.map(fav => ({
            id: fav.id,
            title: fav.title,
            image: fav.image,
            timestamp: new Date(fav.created_at).getTime(),
            date: new Date(fav.created_at).toLocaleDateString(),
            items: fav.favorite_items.map(fi => fi.products).filter(Boolean)
        }));

        res.json(formattedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/favorites', async (req, res) => {
    try {
        const { title, image, product_ids } = req.body;

        // Get mock user
        const { data: users } = await supabase.from('users').select('id').limit(1).single();
        const userId = users ? users.id : null;

        // Insert favorite
        const { data: favData, error: favError } = await supabase
            .from('favorites')
            .insert([{ user_id: userId, title, image }])
            .select()
            .single();

        if (favError) throw favError;

        // Insert favorite items if provided
        if (product_ids && product_ids.length > 0) {
            const itemsToInsert = product_ids.map(pid => ({ favorite_id: favData.id, product_id: pid }));
            const { error: itemsError } = await supabase.from('favorite_items').insert(itemsToInsert);
            if (itemsError) throw itemsError;
        }

        res.json({ success: true, id: favData.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add item to existing favorite
router.post('/favorites/:id/items', async (req, res) => {
    try {
        const { id } = req.params;
        const { product_id } = req.body;
        const { data, error } = await supabase
            .from('favorite_items')
            .insert([{ favorite_id: parseInt(id), product_id }]);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/favorites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('favorites').delete().eq('id', parseInt(id));
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove item from favorite
router.delete('/favorites/:id/items/:product_id', async (req, res) => {
    try {
        const { id, product_id } = req.params;
        const { error } = await supabase
            .from('favorite_items')
            .delete()
            .match({ favorite_id: parseInt(id), product_id: parseInt(product_id) });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ----------------------------------------------------------------------
// CHAT HISTORY
// ----------------------------------------------------------------------
router.get('/chat', async (req, res) => {
    try {
        const { data: users } = await supabase.from('users').select('*').limit(1).single();
        const userId = users ? users.id : null;

        if (userId) {
            // Delete old history to start fresh
            await supabase.from('chat_history').delete().eq('user_id', userId);

            // Insert default greeting
            const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const greeting = { role: 'ai', content: '嗨！我是你的专属 AI 造型师。今天想尝试什么风格呢？', time: aiTime };

            const { data: newInitialMsg } = await supabase
                .from('chat_history')
                .insert([{ user_id: userId, ...greeting }])
                .select()
                .single();

            res.json([newInitialMsg]);
        } else {
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { role, content, action, time } = req.body;

        // Get mock user
        const { data: users } = await supabase.from('users').select('*').limit(1).single();
        const userId = users ? users.id : null;

        // Save user message first
        const { data: userMsgData, error: userMsgError } = await supabase
            .from('chat_history')
            .insert([{ user_id: userId, role, content, action, time }])
            .select()
            .single();

        if (userMsgError) throw userMsgError;

        if (role === 'user') {
            // Fetch recent chat history
            const { data: historyData } = await supabase
                .from('chat_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            let history = historyData || [];
            history.reverse();

            const aiMessages = [];
            let userPreferencesText = "";
            const preferences = [];

            history.forEach(msg => {
                if (msg.role === 'preference') {
                    // Hidden memory of user preferences
                    try {
                        const p = JSON.parse(msg.content);
                        preferences.push(`喜欢[${p.type}]：${p.value} (场景：${p.context || '未知'})`);
                    } catch(e) {}
                } else {
                    let cleanContent = msg.content || "";
                    cleanContent = cleanContent.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
                    aiMessages.push({
                        role: msg.role === 'ai' ? 'assistant' : 'user',
                        content: cleanContent
                    });
                }
            });

            if (preferences.length > 0) {
                userPreferencesText = `\n【用户知识库（近期偏好记忆）】\n${preferences.join('\n')}\n请在推荐时优先考虑用户的上述偏好。`;
            }

            const systemPrompt = `你是一个专业的AI时尚穿搭造型师。
【核心原则】：你只能讨论和回答与服装、穿搭、造型、美妆、配饰等时尚相关的问题。对于任何非此类问题，必须委婉且幽默地拒绝回答并绕回时尚话题。
你的用户是：${users?.name || 'Unknown'}，身高：${users?.height || '未知'}cm，体重：${users?.weight || '未知'}kg。${userPreferencesText}

【输出要求】：
你的回复必须包含两部分：
1. 给用户的穿搭建议文案（简短、专业、富有亲和力，1-3句即可）。
2. 在文案最后，必须附带一个JSON格式的意图解析，用于触发前端系统的展示。必须用\`\`\`json包裹。
JSON结构如下：
\`\`\`json
{
  "target_gender": "女士" 或 "男士", // 默认为男士，除非用户明确要求给女朋友、女生等
  "main_style": "极简风" 或 "街头潮流" 或 "老钱风" 或 "复古" 或 "职场通勤" 或 "", // 选择最接近的大风格，如果无法判断则为空字符串
  "item_type": "西装" 或 "鞋" 或 "包" 或 "衬衫" 等 // 若用户明确寻找某特定单品类别则提取，无则为空字符串 ""
}
\`\`\`
`;

            const completion = await openai.chat.completions.create({
                model: "qwen3.7-plus",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...aiMessages
                ],
                extra_body: {
                    enable_thinking: true
                }
            });

            const aiResponseText = completion.choices[0].message.content;
            const reasoningContent = completion.choices[0].message.reasoning_content;

            let finalContent = aiResponseText;
            if (reasoningContent) {
                finalContent = `<thinking>${reasoningContent}</thinking>${aiResponseText}`;
            }

            const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const { data: aiMsgData, error: aiMsgError } = await supabase
                .from('chat_history')
                .insert([{ user_id: userId, role: 'ai', content: finalContent, action: null, time: aiTime }])
                .select()
                .single();

            if (aiMsgError) throw aiMsgError;
            res.json({ userMessage: userMsgData, aiMessage: aiMsgData });
        } else {
            res.json({ userMessage: userMsgData });
        }
    } catch (err) {
        console.error("Chat API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/preferences', async (req, res) => {
    try {
        const { type, value, context } = req.body;
        
        const { data: users } = await supabase.from('users').select('*').limit(1).single();
        const userId = users ? users.id : null;

        const content = JSON.stringify({ type, value, context });
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const { data, error } = await supabase
            .from('chat_history')
            .insert([{ user_id: userId, role: 'preference', content, action: 'save_preference', time }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        console.error("Preferences API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
