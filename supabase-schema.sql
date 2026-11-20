-- =========================================================================
-- Gadget Zone - Complete Supabase PostgreSQL Schema & Security Rules
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =========================================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Smartphone',
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    badge_label TEXT,
    badge_color TEXT CHECK (badge_color IN ('orange', 'green', 'blue')),
    rating NUMERIC NOT NULL DEFAULT 5.0,
    review_count INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_trending BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    images TEXT[] NOT NULL DEFAULT '{}',
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    button_text TEXT NOT NULL DEFAULT 'Shop Now',
    button_link TEXT NOT NULL DEFAULT '/products',
    banner_type TEXT NOT NULL CHECK (banner_type IN ('hero', 'promo')),
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 6. Public read policies
CREATE POLICY "Public categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Public products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Public banners are viewable by everyone" 
ON public.banners FOR SELECT USING (true);

-- Anyone can submit an order at checkout
CREATE POLICY "Public can insert orders" 
ON public.orders FOR INSERT WITH CHECK (true);

-- Admins can view orders
CREATE POLICY "Admins have full access to orders" 
ON public.orders FOR ALL TO authenticated USING (true);

-- Admins have full access to categories, products, banners
CREATE POLICY "Admins have full access to categories" 
ON public.categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins have full access to products" 
ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins have full access to banners" 
ON public.banners FOR ALL TO authenticated USING (true);

-- 7. Storage Buckets (run if needed)
-- Insert public buckets 'product-images' and 'banners'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for images
CREATE POLICY "Public read product-images" 
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public read banners" 
ON storage.objects FOR SELECT USING (bucket_id = 'banners');

-- Authenticated upload
CREATE POLICY "Authenticated upload product-images" 
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload banners" 
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
