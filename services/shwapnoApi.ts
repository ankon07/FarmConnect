// Mock data based on scraped Shwapno website
export interface ShwapnoProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  inStock: boolean;
  delivery: string;
}

export const shwapnoProducts: ShwapnoProduct[] = [
  {
    id: "1",
    name: "Beetroot",
    price: 185,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "2",
    name: "Shosha (Cucumber)",
    price: 47.50,
    unit: "Per 500 gm",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "3",
    name: "Pudinapata (Mint Leaf)",
    price: 250,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "4",
    name: "Kagzi (Lemon)",
    price: 6,
    unit: "Per Piece",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "5",
    name: "Mishti Alu (Sweet Potato)",
    price: 96,
    unit: "Per Unit",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "6",
    name: "Capsicum (Yellow)",
    price: 880,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "7",
    name: "Capsicum (Red)",
    price: 880,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "8",
    name: "Capsicum (Green)",
    price: 400,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "9",
    name: "Tomato Round (India)",
    price: 160,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "10",
    name: "Salad Pata (Lettuce) Local",
    price: 730,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "11",
    name: "Dhoniapata (Coriander Leaf) Local",
    price: 300,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "12",
    name: "Loti (Taro Stolon)",
    price: 90,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "13",
    name: "Kacha Morich (Chilli Green)",
    price: 280,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "14",
    name: "Dherosh (Lady Finger)",
    price: 60,
    unit: "Per Unit (1kg)",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  },
  {
    id: "15",
    name: "Salad Mix Combo",
    price: 40,
    unit: "Per Piece",
    image: "https://d2t8nl1y0ie1km.cloudfront.net/images/thumbs/675ac4448849c1df9b6b72ab_Salad-Mix_1_415.jpeg",
    category: "Fresh Vegetables",
    inStock: true,
    delivery: "1-2 hours"
  }
];

export const getShwapnoProducts = async (category?: string): Promise<ShwapnoProduct[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (category) {
    return shwapnoProducts.filter(product => 
      product.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  return shwapnoProducts;
};

export const searchShwapnoProducts = async (query: string): Promise<ShwapnoProduct[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return shwapnoProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  );
};
