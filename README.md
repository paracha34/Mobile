## Environment Setup
Copy .env.example to .env and fill in your values:
- VITE_SUPABASE_URL: Your Supabase Project URL
- VITE_SUPABASE_ANON_KEY: Your Supabase anon public key
- GEMINI_API_KEY: Your Google AI Studio API key (optional - for Tech Advisor feature)

# Gadget Zone - Premium Electronics & Mobile Store

A high-performance e-commerce progressive web application (PWA) for smartphones, audio, wearables, and computing electronics.

## Features
- **Public Storefront**: Responsive catalog with multi-criteria filtering, price range controls, real-time search, trending badges, and detailed specification breakdowns.
- **Cart & Checkout**: Slide-in cart drawer with LocalStorage synchronization and validated checkout submitting directly to Supabase `orders`.
- **Admin Console**: Protected management portal for product inventory, promotions, categories, and order fulfillment status updates.
- **PWA Ready**: Offline caching and in-app install prompt for mobile and desktop.
- **Tech Advisor**: High-reasoning AI electronics consultant powered by Gemini 4 Argon thinking mode.

## Supabase Database Setup
Run the SQL script provided in `supabase-schema.sql` inside your Supabase project's SQL Editor to bootstrap tables (`categories`, `products`, `banners`, `orders`), Row Level Security (RLS) policies, and storage buckets (`product-images`, `banners`).

## Admin Access
Create your administrator account in the Supabase Dashboard under **Authentication > Users > Add User**. Only authenticated Supabase users can access `/admin`.

## Deployment
Build for production:
```bash
npm run build
```
Vercel deployment is pre-configured with `vercel.json`.
