import { createClient } from '@supabase/supabase-js';
import { Banner, Category, Order, Product } from '../types';
import { initialBanners, initialCategories, initialOrders, initialProducts } from './mockData';

// Provided Supabase configuration keys
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Determine if real Supabase keys are supplied
export const isSupabaseConfigured = () => {
  return (
    SUPABASE_URL &&
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    SUPABASE_URL.startsWith('http') &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
  );
};

// Safe client instantiation
const safeUrl = isSupabaseConfigured() ? SUPABASE_URL : 'https://demo-gadgetzone.supabase.co';
const safeKey = isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/* =========================================================================
   Unified Data Service
   Uses real Supabase tables ('products', 'categories', 'banners', 'orders')
   when configured, with synchronized local persistence fallback so the store
   and admin panel are 100% functional out of the box.
   ========================================================================= */

const STORAGE_KEYS = {
  PRODUCTS: 'gadgetzone_products_v1',
  CATEGORIES: 'gadgetzone_categories_v1',
  BANNERS: 'gadgetzone_banners_v1',
  ORDERS: 'gadgetzone_orders_v1',
};

// Local storage helpers
function getLocal<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultData;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const dbService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getCategories failed, falling back to local store:', err);
      }
    }
    return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories)
      .filter((c) => c.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  },

  async getAllCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAllCategories failed, falling back:', err);
      }
    }
    return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories).sort(
      (a, b) => a.display_order - b.display_order
    );
  },

  async saveCategory(category: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured()) {
      try {
        if (category.id) {
          const { data, error } = await supabase
            .from('categories')
            .update(category)
            .eq('id', category.id)
            .select()
            .single();
          if (!error && data) return data;
        } else {
          const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (err) {
        console.warn('Supabase saveCategory failed, saving to local store:', err);
      }
    }
    const categories = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    if (category.id) {
      const idx = categories.findIndex((c) => c.id === category.id);
      if (idx !== -1) {
        categories[idx] = { ...categories[idx], ...category } as Category;
        setLocal(STORAGE_KEYS.CATEGORIES, categories);
        return categories[idx];
      }
    }
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: category.name || 'New Category',
      slug: category.slug || 'category-' + Date.now(),
      icon_name: category.icon_name || 'Smartphone',
      display_order: category.display_order ?? categories.length + 1,
      is_active: category.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    categories.push(newCat);
    setLocal(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteCategory failed, falling back:', err);
      }
    }
    const categories = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const filtered = categories.filter((c) => c.id !== id);
    setLocal(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  },

  // Products
  async getProducts(params?: {
    categorySlug?: string;
    filter?: 'trending' | 'featured';
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  }): Promise<Product[]> {
    let products: Product[] = [];
    const categories = await this.getAllCategories();
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('products').select('*').eq('is_active', true);
        if (params?.filter === 'trending') query = query.eq('is_trending', true);
        if (params?.filter === 'featured') query = query.eq('is_featured', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          products = data;
        }
      } catch (err) {
        console.warn('Supabase getProducts failed, falling back to local store:', err);
      }
    }

    if (products.length === 0) {
      products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts).filter((p) => p.is_active);
    }

    // Attach category object
    products = products.map((p) => ({
      ...p,
      category: categoryMap.get(p.category_id),
    }));

    // Apply filters
    if (params?.categorySlug) {
      const cat = categories.find((c) => c.slug === params.categorySlug);
      if (cat) {
        products = products.filter((p) => p.category_id === cat.id);
      }
    }

    if (params?.filter === 'trending') {
      products = products.filter((p) => p.is_trending);
    } else if (params?.filter === 'featured') {
      products = products.filter((p) => p.is_featured);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    if (params?.minPrice !== undefined && params.minPrice > 0) {
      products = products.filter((p) => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined && params.maxPrice > 0) {
      products = products.filter((p) => p.price <= params.maxPrice!);
    }

    if (params?.inStockOnly) {
      products = products.filter((p) => p.stock_quantity > 0);
    }

    // Sorting
    switch (params?.sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
    }

    return products;
  },

  async getAllProductsAdmin(): Promise<Product[]> {
    let products: Product[] = [];
    const categories = await this.getAllCategories();
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          products = data;
        }
      } catch (err) {
        console.warn('Supabase getAllProductsAdmin failed, falling back:', err);
      }
    }

    if (products.length === 0) {
      products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    }

    return products.map((p) => ({
      ...p,
      category: categoryMap.get(p.category_id),
    }));
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getAllProductsAdmin();
    return products.find((p) => p.slug === slug) || null;
  },

  async saveProduct(product: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured()) {
      try {
        // Strip out joined category object before writing to DB
        const { category, ...cleanProduct } = product as Product;
        if (cleanProduct.id) {
          const { data, error } = await supabase
            .from('products')
            .update(cleanProduct)
            .eq('id', cleanProduct.id)
            .select()
            .single();
          if (!error && data) return data;
        } else {
          const { data, error } = await supabase
            .from('products')
            .insert([cleanProduct])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (err) {
        console.warn('Supabase saveProduct failed, fallback to local store:', err);
      }
    }

    const products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    if (product.id) {
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...product } as Product;
        setLocal(STORAGE_KEYS.PRODUCTS, products);
        return products[idx];
      }
    }

    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: product.name || 'New Product',
      slug: product.slug || ('product-' + Date.now()),
      short_description: product.short_description || '',
      full_description: product.full_description || '',
      price: product.price || 0,
      original_price: product.original_price,
      category_id: product.category_id || 'cat-1',
      stock_quantity: product.stock_quantity ?? 10,
      badge_label: product.badge_label,
      badge_color: product.badge_color || 'green',
      rating: product.rating ?? 5.0,
      review_count: product.review_count ?? 1,
      is_featured: product.is_featured ?? false,
      is_trending: product.is_trending ?? false,
      is_active: product.is_active ?? true,
      images: product.images && product.images.length > 0 ? product.images : [
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      ],
      specifications: product.specifications || {},
      created_at: new Date().toISOString(),
    };
    products.unshift(newProd);
    setLocal(STORAGE_KEYS.PRODUCTS, products);
    return newProd;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteProduct failed, fallback:', err);
      }
    }
    const products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const filtered = products.filter((p) => p.id !== id);
    setLocal(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  // Banners
  async getBanners(type?: 'hero' | 'promo'): Promise<Banner[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (type) query = query.eq('banner_type', type);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getBanners failed, fallback:', err);
      }
    }
    const banners = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners)
      .filter((b) => b.is_active && (!type || b.banner_type === type))
      .sort((a, b) => a.display_order - b.display_order);
    return banners.length > 0 ? banners : initialBanners.filter((b) => !type || b.banner_type === type);
  },

  async getAllBannersAdmin(): Promise<Banner[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('banners').select('*').order('display_order', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAllBannersAdmin failed, fallback:', err);
      }
    }
    return getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners).sort((a, b) => a.display_order - b.display_order);
  },

  async saveBanner(banner: Partial<Banner>): Promise<Banner> {
    if (isSupabaseConfigured()) {
      try {
        if (banner.id) {
          const { data, error } = await supabase
            .from('banners')
            .update(banner)
            .eq('id', banner.id)
            .select()
            .single();
          if (!error && data) return data;
        } else {
          const { data, error } = await supabase
            .from('banners')
            .insert([banner])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (err) {
        console.warn('Supabase saveBanner failed, fallback:', err);
      }
    }
    const banners = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
    if (banner.id) {
      const idx = banners.findIndex((b) => b.id === banner.id);
      if (idx !== -1) {
        banners[idx] = { ...banners[idx], ...banner } as Banner;
        setLocal(STORAGE_KEYS.BANNERS, banners);
        return banners[idx];
      }
    }
    const newBanner: Banner = {
      id: 'ban-' + Date.now(),
      title: banner.title || 'New Promotion',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url:
        banner.image_url ||
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1000&q=80',
      button_text: banner.button_text || 'Shop Now',
      button_link: banner.button_link || '/products',
      banner_type: banner.banner_type || 'hero',
      display_order: banner.display_order ?? banners.length + 1,
      is_active: banner.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    banners.push(newBanner);
    setLocal(STORAGE_KEYS.BANNERS, banners);
    return newBanner;
  },

  async deleteBanner(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteBanner failed, fallback:', err);
      }
    }
    const banners = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
    const filtered = banners.filter((b) => b.id !== id);
    setLocal(STORAGE_KEYS.BANNERS, filtered);
    return true;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getOrders failed, fallback:', err);
      }
    }
    return getLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const fullOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').insert([fullOrder]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createOrder failed, fallback to local store:', err);
      }
    }

    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    orders.unshift(fullOrder);
    setLocal(STORAGE_KEYS.ORDERS, orders);
    return fullOrder;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateOrderStatus failed, fallback:', err);
      }
    }
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      setLocal(STORAGE_KEYS.ORDERS, orders);
      return orders[idx];
    }
    return null;
  },

  async lookupOrder(query: string): Promise<Order | null> {
    const clean = query.trim();
    if (!clean) return null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`id.ilike.%${clean}%,order_number.ilike.%${clean}%`)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase lookupOrder failed, fallback to local store:', err);
      }
    }

    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const normalized = clean.toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === normalized ||
        o.order_number.toLowerCase() === normalized ||
        o.id.toLowerCase().includes(normalized) ||
        o.order_number.toLowerCase().includes(normalized)
    );
    return found || null;
  },

  // File Upload to Supabase Storage
  async uploadFile(bucket: 'product-images' | 'banners', file: File): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (!error && data) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
          if (urlData?.publicUrl) return urlData.publicUrl;
        }
      } catch (err) {
        console.warn(`Supabase Storage upload to ${bucket} failed, using local Data URL fallback:`, err);
      }
    }

    // High fidelity data URL fallback for local previews
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  },
};
