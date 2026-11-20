export type BadgeColor = 'orange' | 'green' | 'blue';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  price: number;
  original_price?: number;
  category_id: string;
  category?: Category;
  stock_quantity: number;
  badge_label?: string;
  badge_color?: BadgeColor;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_trending: boolean;
  is_active: boolean;
  images: string[];
  specifications: Record<string, string>;
  created_at?: string;
}

export type BannerType = 'hero' | 'promo';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  banner_type: BannerType;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  max_stock?: number;
}
