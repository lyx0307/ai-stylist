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

// 5 Main Styles x 4 Sub-styles x 5 Products = 100 Products
const STRUCTURE = {
  "极简风": {
    "日系极简": [
      { name: "男士棉麻宽松衬衫", price: "¥299", desc: "纯棉麻材质，带来呼吸感。日系落肩版型，舒适不拘束。" },
      { name: "男士锥形休闲裤", price: "¥359", desc: "微锥版型修饰腿型，低饱和度色系百搭实用。" },
      { name: "男士日系套头针织衫", price: "¥259", desc: "基础款纯色，面料柔软，单穿或内搭均可。" },
      { name: "女士日系薄风衣", price: "¥499", desc: "轻薄挺括面料，A字版型，自带慵懒日系氛围。" },
      { name: "女士褶皱半身长裙", price: "¥229", desc: "日系经典褶皱裙，中长款设计，文静优雅。" }
    ],
    "北欧极简": [
      { name: "男士几何剪裁外套", price: "¥599", desc: "冷色调结构主义设计，防水面料，极简无多余装饰。" },
      { name: "男士极简直筒西裤", price: "¥399", desc: "高级垂坠感，无褶设计，北欧干练风格。" },
      { name: "女士高冷灰色大衣", price: "¥899", desc: "极简直筒剪裁，羊毛混纺，高级清冷感满分。" },
      { name: "女士不对称衬衫", price: "¥329", desc: "北欧解构主义，不对称领口设计，细节考究。" },
      { name: "女士极简切尔西靴", price: "¥699", desc: "无接缝极简皮靴，冷淡风穿搭的绝佳配件。" }
    ],
    "质感极简": [
      { name: "男士重磅羊绒毛衣", price: "¥899", desc: "顶级羊绒材质，基础圆领，极致舒适的Normcore风格。" },
      { name: "男士真丝混纺打底衫", price: "¥459", desc: "隐约的光泽感，亲肤透气，低调展现生活品质。" },
      { name: "女士重磅真丝衬衫", price: "¥699", desc: "珍珠般的光泽与垂坠，质感极简爱好者的必备单品。" },
      { name: "女士纯羊毛西装裤", price: "¥559", desc: "全羊毛定制级面料，利落剪裁，高级质感。" },
      { name: "男士极简托特包", price: "¥999", desc: "整张牛皮制作，无明显Logo，触感极佳。" }
    ],
    "都市极简": [
      { name: "男士无缝压胶夹克", price: "¥799", desc: "都市机能与极简的结合，防水拉链，科技感十足。" },
      { name: "男士九分弹力休闲裤", price: "¥299", desc: "适合都市步行的微弹面料，干练不拖沓。" },
      { name: "女士无领西装外套", price: "¥659", desc: "去掉繁琐翻领的都市极简风，内搭T恤即可出门。" },
      { name: "女士干练吊带内搭", price: "¥159", desc: "利落方领设计，都市女性的百搭神仙内搭。" },
      { name: "男士极简乐福鞋", price: "¥599", desc: "流线型鞋面，都市通勤与休闲无缝切换。" }
    ]
  },
  "街头潮流": {
    "美式高街": [
      { name: "男士Oversize印花T恤", price: "¥199", desc: "重磅水洗做旧棉，背后夸张字母印花，高街标配。" },
      { name: "男士破坏抽须牛仔裤", price: "¥459", desc: "手工破坏处理，微喇版型，街头感拉满。" },
      { name: "男士做旧连帽卫衣", price: "¥359", desc: "水洗褪色工艺，厚实抓绒，纯正美式街头风。" },
      { name: "女士短款紧身背心", price: "¥129", desc: "高街辣妹风，搭配宽松工装裤的绝佳上半身单品。" },
      { name: "女士高街阔腿裤", price: "¥399", desc: "拖地长度，腰部抽绳设计，慵懒又帅气。" }
    ],
    "日系Cityboy": [
      { name: "男士宽条纹长袖T", price: "¥229", desc: "经典Cityboy条纹，重磅粗纱线，层次叠穿利器。" },
      { name: "男士多口袋工装衬衫", price: "¥359", desc: "宽松落肩，实用大口袋，日系街头叠穿必备。" },
      { name: "男士宽松灯芯绒裤", price: "¥329", desc: "秋冬Cityboy氛围感担当，宽大舒适。" },
      { name: "女士日系休闲夹克", price: "¥499", desc: "Citygirl中性风，防风面料，宽大版型带抽绳。" },
      { name: "女士日系长款伞裙", price: "¥259", desc: "搭配帆布鞋和卫衣，轻松混搭出街头少女感。" }
    ],
    "运动街头": [
      { name: "男士复古运动夹克", price: "¥459", desc: "90年代复古拼色，轻薄防风防泼水。" },
      { name: "男士侧条纹运动裤", price: "¥299", desc: "经典复古校服裤改良，混搭西装或大衣的街头玩法。" },
      { name: "女士复古运动短装", price: "¥199", desc: "拉链立领运动衫，短款修身，Y2K运动街头风。" },
      { name: "女士抽绳降落伞裤", price: "¥359", desc: "超大廓形降落伞裤，运动与街头的完美结合。" },
      { name: "男士老爹运动鞋", price: "¥699", desc: "复古厚底老爹鞋，百搭舒适的街头圣品。" }
    ],
    "废土机能": [
      { name: "男士多口袋战术马甲", price: "¥499", desc: "机能风核心单品，立体口袋，可调节绑带。" },
      { name: "男士防水机能长裤", price: "¥559", desc: "特氟龙涂层防水面料，立体剪裁，未来废土感。" },
      { name: "男士机能防风衣", price: "¥899", desc: "全压胶防水，赛博朋克风大兜帽设计。" },
      { name: "女士机能风包臀裙", price: "¥299", desc: "硬挺废土面料与女性曲线的冲突美学，配有战术插扣。" },
      { name: "女士机能短袖T恤", price: "¥259", desc: "不对称镂空设计，科技感反光印花。" }
    ]
  },
  "老钱风": {
    "常春藤学院": [
      { name: "男士绞花针织马甲", price: "¥299", desc: "经典常春藤绞花，内搭牛津纺衬衫的标配。" },
      { name: "男士牛津纺纽扣领衬衫", price: "¥359", desc: "厚实挺括，标志性纽扣领，学院风灵魂单品。" },
      { name: "男士卡其色休闲裤", price: "¥399", desc: "Chino裤，经典卡其色，搭配乐福鞋最为优雅。" },
      { name: "女士格纹百褶裙", price: "¥259", desc: "苏格兰格纹，复古学院风少女感。" },
      { name: "女士学院风西装外套", price: "¥599", desc: "金扣设计，胸口刺绣徽章，常春藤经典复刻。" }
    ],
    "意式优雅": [
      { name: "男士无结构轻薄西装", price: "¥999", desc: "意式那不勒斯剪裁，无垫肩极度舒适，优雅从容。" },
      { name: "男士高领羊绒衫", price: "¥899", desc: "冬季意式老钱最爱，贴身穿着的极致柔软。" },
      { name: "男士手工翻毛皮乐福鞋", price: "¥1299", desc: "意式手工制作，无衬里，赤脚穿着体验极佳。" },
      { name: "女士真丝包臀半裙", price: "¥699", desc: "流动的液体真丝，展现意式女人的曼妙曲线。" },
      { name: "女士双排扣羊毛大衣", price: "¥1599", desc: "剪裁极致收腰，高级驼色，散发老钱气场。" }
    ],
    "贵族度假": [
      { name: "男士亚麻古巴领衬衫", price: "¥399", desc: "地中海度假必备，透气亚麻，随意敞开的领口。" },
      { name: "男士白色亚麻长裤", price: "¥459", desc: "富豪度假村标准穿搭，轻松随性不失体面。" },
      { name: "女士编织草帽", price: "¥299", desc: "宽大帽檐，黑色丝带装饰，优雅度假风情。" },
      { name: "女士印花真丝长裙", price: "¥899", desc: "法式里维埃拉风格印花，海风吹拂下的飘逸感。" },
      { name: "男士草编底帆布鞋", price: "¥359", desc: "经典Espadrilles，度假休闲的最佳足底选择。" }
    ],
    "经典复古老钱": [
      { name: "男士粗花呢猎装夹克", price: "¥1299", desc: "英国乡村贵族风格，厚实粗花呢，经久耐穿。" },
      { name: "男士灯芯绒三件套西装", price: "¥1599", desc: "复古英伦老钱，厚重有质感的复古绅士。" },
      { name: "女士粗花呢小香风外套", price: "¥899", desc: "经典黑白混织粗花呢，名媛老钱的标志性穿搭。" },
      { name: "女士珍珠项链", price: "¥999", desc: "复古老钱风的灵魂配饰，温润优雅的经典之选。" },
      { name: "男士菱格纹绗缝外套", price: "¥699", desc: "英伦马术风格，防风保暖的复古经典。" }
    ]
  },
  "复古": {
    "美式复古": [
      { name: "男士原牛牛仔夹克", price: "¥599", desc: "未脱脂原色丹宁，Amekaji玩家必养单品。" },
      { name: "男士赤耳丹宁直筒裤", price: "¥499", desc: "重磅14oz赤耳单宁，复刻50年代经典版型。" },
      { name: "男士亨利领长袖T", price: "¥259", desc: "复古工装内搭，三粒扣亨利领，硬汉气质。" },
      { name: "女士复古印花T恤", price: "¥199", desc: "70年代乐队巡演复刻印花，水洗做旧感。" },
      { name: "女士微喇毛边牛仔裤", price: "¥359", desc: "70年代嬉皮士风格，显腿长的美式复古版型。" }
    ],
    "法式复古": [
      { name: "女士碎花茶歇裙", price: "¥399", desc: "V领收腰，经典法式印花，浪漫慵懒的法国街头感。" },
      { name: "女士针织开衫", price: "¥299", desc: "粗棒针织，复古纽扣，搭配碎花裙的绝配。" },
      { name: "女士复古玛丽珍鞋", price: "¥459", desc: "平底漆皮玛丽珍，法式少女的复古情怀。" },
      { name: "男士条纹海魂衫", price: "¥259", desc: "法国水手条纹，法式男装的经典复古元素。" },
      { name: "男士直筒九分西裤", price: "¥359", desc: "搭配海魂衫与乐福鞋，穿出巴黎左岸的文艺复古。" }
    ],
    "港风复古": [
      { name: "男士复古做旧皮夹克", price: "¥899", desc: "90年代港片男主角同款，宽大垫肩落拓不羁。" },
      { name: "男士高领纯黑毛衣", price: "¥299", desc: "搭配皮衣或风衣，港风男神的冬日标配。" },
      { name: "女士大红高开叉吊带裙", price: "¥459", desc: "高饱和度港风红，明艳动人的复古风情。" },
      { name: "女士复古波点衬衫", price: "¥259", desc: "大波点雪纺，夸张领结，重回八十年代香港街头。" },
      { name: "男士复古金丝眼镜", price: "¥199", desc: "港风文青必备，斯文败类感十足的配饰。" }
    ],
    "Y2K千禧风": [
      { name: "女士金属光泽短羽绒", price: "¥599", desc: "太空银反光面料，超短款，千禧年未来感。" },
      { name: "女士低腰工装裤", price: "¥359", desc: "卡其色低腰设计，露出腰线的Y2K辣妹标配。" },
      { name: "女士厚底老爹鞋", price: "¥499", desc: "极度夸张的厚底，2000年代街头潮流回潮。" },
      { name: "男士复古网眼运动服", price: "¥359", desc: "大面积反光条与网眼拼接，千禧年电子风。" },
      { name: "男士Y2K无框墨镜", price: "¥159", desc: "渐变色镜片，无框设计，千禧辣妹/亚逼潮男必备。" }
    ]
  },
  "职场通勤": {
    "韩系通勤": [
      { name: "女士雾霾蓝西装外套", price: "¥559", desc: "温柔低饱和色系，微修身剪裁，韩剧女主同款。" },
      { name: "女士垂坠感阔腿裤", price: "¥299", desc: "极度显腿长的雪纺面料，走动带风。" },
      { name: "女士雪纺系带衬衫", price: "¥259", desc: "领口蝴蝶结系带，温柔不失专业的职场内搭。" },
      { name: "男士修身九分西裤", price: "¥299", desc: "露踝九分长度，韩系欧巴干净利落的下半身。" },
      { name: "男士韩版长风衣", price: "¥699", desc: "及膝长度，防风防水，秋日通勤的韩系氛围感。" }
    ],
    "欧美气场": [
      { name: "女士强力垫肩西装", price: "¥799", desc: "Power Suit设计，夸张垫肩，女高管气场全开。" },
      { name: "女士尖头高跟鞋", price: "¥599", desc: "8cm细高跟，真皮材质，职场战鞋。" },
      { name: "女士修身铅笔裙", price: "¥359", desc: "包裹臀部曲线，膝上长度，干练的女强人风范。" },
      { name: "男士戗驳领双排扣西装", price: "¥1299", desc: "权力套装，夸张戗驳领，华尔街精英的标配。" },
      { name: "男士法式袖口衬衫", price: "¥459", desc: "需要佩戴袖扣的高级衬衫，气场通勤内搭。" }
    ],
    "松弛感通勤": [
      { name: "女士宽松羊绒毛衣", price: "¥799", desc: "不刻意强调曲线，只求质感与舒服的松弛感。" },
      { name: "女士软底乐福鞋", price: "¥459", desc: "踩跟两穿设计，像拖鞋一样舒适的职场平底鞋。" },
      { name: "男士宽松无领西装", price: "¥599", desc: "开衫式的西装，抛弃束缚感，轻松应对无着装要求的职场。" },
      { name: "男士德训鞋", price: "¥399", desc: "替代硬底皮鞋的完美通勤运动鞋，体面且舒适。" },
      { name: "女士大容量托特包", price: "¥899", desc: "装下电脑与杂物，松弛女职员的通勤百宝箱。" }
    ],
    "雅痞轻熟": [
      { name: "男士解构设计西装", price: "¥899", desc: "不对称口袋，半里布设计，打破常规的雅痞风范。" },
      { name: "男士高领长袖T恤", price: "¥199", desc: "替代衬衫内搭西装，保暖且带有几分艺术家气质。" },
      { name: "男士切尔西靴", price: "¥799", desc: "尖头麂皮切尔西，收窄裤脚，英伦雅痞男的秋冬最爱。" },
      { name: "女士丝绒西装外套", price: "¥699", desc: "暗黑光泽的丝绒材质，轻熟女人的夜间通勤战袍。" },
      { name: "女士细丝带衬衫", price: "¥299", desc: "区别于领带的细丝带，带着一丝不羁的轻熟诱惑。" }
    ]
  }
};

function getBase64Image(gender, title, subtitle) {
  // SVG generation
  let bgColor = gender.includes('女') ? '#FFF0F5' : '#F0F8FF';
  let accentColor = gender.includes('女') ? '#FF69B4' : '#4169E1';
  let textColor = '#333333';

  if (title.includes('老钱')) { bgColor = '#F5F5DC'; accentColor = '#8B4513'; }
  else if (title.includes('极简')) { bgColor = '#F5F5F5'; accentColor = '#666666'; }
  else if (title.includes('街头') || title.includes('机能')) { bgColor = '#1A1A1A'; accentColor = '#00FF00'; textColor = '#FFFFFF'; }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <rect x="50" y="50" width="700" height="1100" fill="none" stroke="${accentColor}" stroke-width="4" rx="20"/>
    <text x="400" y="550" font-family="system-ui, -apple-system, sans-serif" font-size="80" font-weight="900" text-anchor="middle" fill="${textColor}">${gender}</text>
    <text x="400" y="650" font-family="system-ui, -apple-system, sans-serif" font-size="60" font-weight="700" text-anchor="middle" fill="${textColor}">${title}</text>
    <rect x="250" y="900" width="300" height="60" rx="30" fill="${accentColor}" opacity="0.8"/>
    <text x="400" y="940" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" text-anchor="middle" fill="${bgColor === '#1A1A1A' ? '#000000' : '#FFFFFF'}">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function reseed() {
  console.log("Cleaning old products...");
  const { error: deleteError } = await supabase.from('products').delete().neq('id', 0);
  if (deleteError) {
    console.error("Delete error:", deleteError);
    return;
  }

  const productsToInsert = [];
  let idCounter = 1;

  for (const [mainStyle, subStyles] of Object.entries(STRUCTURE)) {
    for (const [subStyle, items] of Object.entries(subStyles)) {
      for (const item of items) {
        const genderMatch = item.name.match(/^(男士|女士)/);
        const gender = genderMatch ? genderMatch[1] : '中性';
        const shortName = item.name.replace(/^(男士|女士)/, '');

        productsToInsert.push({
          id: idCounter++,
          name: item.name,
          price: item.price,
          category: [mainStyle],
          tag: subStyle,
          description: item.desc,
          image: getBase64Image(gender, shortName, subStyle),
          likes: Math.floor(Math.random() * 2000) + 100
        });
      }
    }
  }

  console.log(`Inserting ${productsToInsert.length} products with 5x4x5 structure...`);
  
  // Insert in batches of 50
  for (let i = 0; i < productsToInsert.length; i += 50) {
    const batch = productsToInsert.slice(i, i + 50);
    const { error: insertError } = await supabase.from('products').insert(batch);
    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }
  }

  console.log("Reseed complete! Total products:", productsToInsert.length);
}

reseed();
