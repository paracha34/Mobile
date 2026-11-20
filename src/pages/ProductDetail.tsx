import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { Product } from '../types';
import { dbService } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/products/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const [loading, setLoading] = useState(true);

  const isSaved = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!slug) return;
      setLoading(true);
      try {
        const item = await dbService.getProductBySlug(slug);
        if (isMounted) {
          setProduct(item);
          setActiveImageIndex(0);
          setQuantity(1);

          if (item) {
            // Fetch related products
            const allInCat = await dbService.getProducts({
              categorySlug: item.category?.slug,
            });
            const filtered = allInCat.filter((p) => p.id !== item.id).slice(0, 4);
            setRelatedProducts(filtered);
          }
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load product detail:', e);
        if (isMounted) setLoading(false);
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-gray-400">
          The gadget you are searching for might have been moved or is currently unavailable.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
  ];

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      quantity,
      max_stock: product.stock_quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      {/* Main product overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Main Image */}
          <div className="relative aspect-square rounded-3xl bg-[#12121a] border border-[#2a2a3e] p-6 flex items-center justify-center overflow-hidden shadow-2xl">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
            />
            {product.badge_label && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600/30 text-purple-300 border border-purple-500/40 backdrop-blur-md">
                {product.badge_label}
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isSaved
                  ? 'bg-rose-500/25 text-rose-400 border border-rose-500/50 shadow-rose-950/40'
                  : 'bg-black/50 hover:bg-black/80 text-gray-400 hover:text-white border border-white/10'
              } active:scale-75 backdrop-blur-md`}
              aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isSaved ? 'In Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl bg-[#12121a] border p-2 flex items-center justify-center overflow-hidden shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-purple-500 ring-2 ring-purple-500/30'
                      : 'border-[#2a2a3e] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Buy Box */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Category & Name */}
          <div>
            {product.category && (
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating & Stock status */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-[#1a1a2e] px-2.5 py-1 rounded-lg border border-[#2a2a3e]">
              <div className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.review_count} verified reviews)</span>
            </div>

            <div className="flex items-center gap-1.5">
              {product.stock_quantity > 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-red-400 font-semibold">Temporarily Out of Stock</span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-[#1a1a2e]/60 border border-[#2a2a3e] space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">
                PKR {product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base text-gray-400 line-through">
                  PKR {product.original_price!.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">Includes all applicable federal duties &amp; brand warranty</p>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {product.short_description}
          </p>

          {/* Quantity Selector & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-300">Quantity:</span>
              <div className="flex items-center border border-[#2a2a3e] bg-[#12121a] rounded-xl px-2 py-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-white min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="btn-futuristic-primary flex-1 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-purple-900/30 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                className="btn-futuristic-primary flex-1 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Instant Checkout</span>
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                title={isSaved ? 'In Wishlist' : 'Add to Wishlist'}
                className={`icon-bounce-glow w-full sm:w-14 py-3.5 sm:py-0 h-auto sm:h-[50px] rounded-xl flex items-center justify-center gap-2 border transition-all active:scale-90 cursor-pointer ${
                  isSaved
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30 shadow-lg shadow-rose-950/30'
                    : 'bg-[#12121a] hover:bg-[#1a1a2e] text-gray-300 hover:text-white border-[#2a2a3e]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="sm:hidden text-xs font-semibold">
                  {isSaved ? 'In Wishlist' : 'Save to Wishlist'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#2a2a3e] text-[11px] text-gray-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-400" />
              <span>Same-day dispatch in Lahore &amp; Karachi</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>1 Year Official Brand Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Below Fold: Full Description & Specifications Tabs */}
      <div className="rounded-3xl bg-[#12121a] border border-[#2a2a3e] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-6 border-b border-[#2a2a3e] pb-3">
          <button
            onClick={() => setActiveTab('description')}
            className={`text-sm font-bold pb-2 transition-colors relative ${
              activeTab === 'description' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Product Overview
            {activeTab === 'description' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`text-sm font-bold pb-2 transition-colors relative ${
              activeTab === 'specifications' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Technical Specifications
            {activeTab === 'specifications' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        </div>

        {activeTab === 'description' ? (
          <div className="prose prose-invert text-xs sm:text-sm text-gray-300 leading-relaxed max-w-none">
            <p className="whitespace-pre-line">{product.full_description}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <tbody className="divide-y divide-[#2a2a3e]">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <tr key={key} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-semibold text-gray-400 w-1/3 sm:w-1/4">
                      {key}
                    </td>
                    <td className="py-3 text-gray-200">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Similar Tech in {product.category?.name || 'Category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
