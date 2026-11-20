import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Banner, Category, Product } from '../types';
import { dbService } from '../lib/supabase';
import { ProductCard } from '../components/products/ProductCard';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { BannerSkeleton, ProductCardSkeleton } from '../components/common/SkeletonLoader';
import { OrderStatusTracker } from '../components/home/OrderStatusTracker';

// Subheadline Typewriter Component
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 30 }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayed(text.slice(0, index));
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="inline-flex items-center">
      <span>{displayed}</span>
      {displayed.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-purple-400 animate-pulse rounded-sm align-middle" />
      )}
    </span>
  );
};

export const Home: React.FC = () => {
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [promoBanner, setPromoBanner] = useState<Banner | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero slider active index
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const [heroes, promos, cats, trending, featured] = await Promise.all([
          dbService.getBanners('hero'),
          dbService.getBanners('promo'),
          dbService.getCategories(),
          dbService.getProducts({ filter: 'trending' }),
          dbService.getProducts({ filter: 'featured' }),
        ]);

        if (isMounted) {
          setHeroBanners(heroes);
          setPromoBanner(promos[0] || null);
          setCategories(cats);
          setTrendingProducts(trending.slice(0, 6));
          setFeaturedProducts(featured.slice(0, 8));
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load home page data:', e);
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate hero slider every 4 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [heroBanners.length]);

  const activeHero = heroBanners[currentSlide] || {
    id: 'fallback-hero',
    title: 'Titanium Innovation: Flagship Smart Devices',
    subtitle: 'OFFICIAL PAKISTAN LAUNCH',
    description: 'Discover next-generation AI smartphones, spatial noise-canceling audio, and rugged titanium smartwatches.',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
    button_text: 'Explore Catalog',
    button_link: '/products',
    banner_type: 'hero',
    display_order: 1,
    is_active: true,
  };

  const heroWords = activeHero.title.split(' ');

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* a) Hero Banner Slider with animated gradient shift and parallax drift */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {loading ? (
          <BannerSkeleton />
        ) : (
          <div className="relative rounded-3xl bg-gradient-to-br from-[#12121a] via-[#1a1a2e] to-[#0a0a0f] border border-[#2a2a3e] overflow-hidden min-h-[380px] sm:min-h-[460px] flex items-center shadow-2xl animate-gradient-drift">
            {/* Ambient slow parallax drift neon orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-parallax-drift" />
            <div
              className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-parallax-drift"
              style={{ animationDelay: '-5s' }}
            />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-10 md:p-12 w-full">
              {/* Left Text */}
              <div className="md:col-span-7 space-y-4 text-left">
                {/* Subheadline with smooth typewriter effect */}
                {activeHero.subtitle && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <TypewriterText key={activeHero.subtitle + '-' + currentSlide} text={activeHero.subtitle} speed={30} />
                  </div>
                )}

                {/* Headline text with staggered word-by-word fade-in on page load */}
                <motion.h1
                  key={activeHero.id + '-' + currentSlide}
                  className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.07,
                      },
                    },
                  }}
                >
                  {heroWords.map((word, i) => (
                    <motion.span
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        },
                      }}
                      className="inline-block bg-gradient-to-r from-white via-gray-100 to-purple-300 bg-clip-text text-transparent"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.h1>

                <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 max-w-xl leading-relaxed">
                  {activeHero.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {/* Primary button with glowing pulse effect on hover, smooth scale-up, and ripple shockwave on click */}
                  <Link
                    to={activeHero.button_link || '/products'}
                    className="btn-futuristic-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/40 active:scale-95 cursor-pointer"
                  >
                    <span>{activeHero.button_text || 'Shop Now'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {/* Secondary button with animated underline sweep and subtle lift shadow on hover */}
                  <Link
                    to="/products"
                    className="btn-futuristic-secondary inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#12121a]/80 hover:bg-[#1a1a2e] border border-[#2a2a3e] text-gray-200 font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    <span>View All Products</span>
                  </Link>
                </div>
              </div>

              {/* Right Image */}
              <div className="md:col-span-5 flex justify-center items-center relative">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden p-2">
                  <img
                    src={activeHero.image_url}
                    alt={activeHero.title}
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(124,58,237,0.35)] transition-all duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Dots and Arrows */}
            {heroBanners.length > 1 && (
              <>
                <div className="absolute bottom-4 left-6 sm:left-12 flex items-center gap-2 z-20">
                  {heroBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'w-8 bg-purple-500' : 'w-2 bg-gray-600 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="absolute bottom-4 right-6 sm:right-12 hidden sm:flex items-center gap-2 z-20">
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1))
                    }
                    className="p-2 rounded-lg bg-[#12121a]/80 border border-[#2a2a3e] text-gray-300 hover:text-white transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
                    }
                    className="p-2 rounded-lg bg-[#12121a]/80 border border-[#2a2a3e] text-gray-300 hover:text-white transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* b) Category Icons Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Explore Categories</span>
          </h2>
          <Link
            to="/products"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 group shrink-0 min-w-[84px] sm:min-w-[100px]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1a1a2e] border border-gray-700/60 group-hover:border-purple-500 group-hover:bg-purple-950/30 flex items-center justify-center text-gray-300 group-hover:text-purple-300 shadow-md group-hover:shadow-purple-900/30 group-hover:scale-105 transition-all duration-200">
                <DynamicIcon name={cat.icon_name} className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-xs font-medium text-gray-300 group-hover:text-white text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* c) Trending Now Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400/30" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Trending Now</h2>
              <p className="text-xs text-gray-400">Top selling high-demand tech items this week</p>
            </div>
          </div>
          <Link
            to="/products?filter=trending"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* d) Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {promoBanner && (
          <div className="relative rounded-3xl bg-gradient-to-r from-purple-950 via-[#1a1a2e] to-[#12121a] border border-purple-500/30 overflow-hidden shadow-2xl p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/30 border border-rose-500/50 text-rose-300 text-[11px] font-black uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-rose-400" />
                  <span>{promoBanner.subtitle || 'LIMITED TIME OFFER'}</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-white">
                  {promoBanner.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
                  {promoBanner.description}
                </p>
                <div className="pt-2">
                  <Link
                    to={promoBanner.button_link || '/products?filter=trending'}
                    className="btn-futuristic-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/40 transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <span>{promoBanner.button_text || 'Claim Offer Now'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-4 flex justify-center">
                <img
                  src={promoBanner.image_url}
                  alt={promoBanner.title}
                  className="w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-[0_15px_25px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* e) Order Status & Shipment Lookup */}
      <OrderStatusTracker />

      {/* f) Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Featured Gadgets</h2>
            <p className="text-xs text-gray-400">Curated flagship devices with official brand warranties</p>
          </div>
          <Link
            to="/products?filter=featured"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
