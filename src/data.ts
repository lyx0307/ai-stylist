export const CATEGORIES = [
  "为你推荐", "极简风", "街头潮流", "老钱风", "复古", "职场通勤"
];

const baseProducts = [
  {
    name: "经典廓形风衣",
    price: "¥899",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["极简风", "职场通勤", "老钱风"]
  },
  {
    name: "阔腿褶皱西裤",
    price: "¥299",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["极简风", "职场通勤"]
  },
  {
    name: "缎面吊带连衣裙",
    price: "¥599",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["老钱风", "复古"]
  },
  {
    name: "日常帆布托特包",
    price: "¥120",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["极简风", "街头潮流"]
  },
  {
    name: "极简结构真皮手袋",
    price: "¥1,200",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["极简风", "老钱风", "职场通勤"]
  },
  {
    name: "美利奴羊毛粗针织衫",
    price: "¥450",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["老钱风", "复古", "极简风"]
  },
  {
    name: "90年代直筒牛仔裤",
    price: "¥350",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["复古", "街头潮流"]
  },
  {
    name: "复古跑步休闲鞋",
    price: "¥680",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["街头潮流", "复古"]
  },
  {
    name: "oversize 卫衣",
    price: "¥299",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["街头潮流"]
  },
  {
    name: "羊绒围巾",
    price: "¥399",
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: ["老钱风", "极简风"]
  }
];

const generateProducts = () => {
  let allProducts = [];
  for (let i = 0; i < 12; i++) {
    allProducts.push(...baseProducts.map((p, idx) => ({
      ...p,
      id: i * 100 + idx,
      likes: Math.floor(Math.random() * 2000 + 100),
      tag: Math.random() > 0.8 ? (Math.random() > 0.5 ? "NEW" : "AI PICK") : null
    })));
  }
  return allProducts;
};

export const PRODUCTS = generateProducts();
