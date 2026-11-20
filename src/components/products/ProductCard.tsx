import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = isInWishlist(product.id);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_quantity <= 0) return;

    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      quantity: 1,
      max_stock: product.stock_quantity,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'orange':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'green':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'blue':
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          tilt.x !== 0 || tilt.y !== 0
            ? `perspective(1000px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`
            : undefined,
      }}
      className="product-card-tilt group flex flex-col justify-between rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] p-3 sm:p-4 transition-all duration-300 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-900/30 relative overflow-hidden"
    >
      {/* Top badges & Wishlist toggle */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-start justify-between z-20 pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-none max-w-[calc(100%-40px)]">
          {product.badge_label && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-md ${getBadgeStyle(
                product.badge_color
              )}`}
            >
              {product.badge_label}
            </span>
          )}

          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Dedicated Wishlist Toggle Button */}
        <button
          onClick={handleToggleWishlist}
          type="button"
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
            isSaved
              ? 'bg-rose-500/25 text-rose-400 border border-rose-500/50 hover:bg-rose-500/40 shadow-rose-950/40'
              : 'bg-black/55 hover:bg-black/85 text-gray-400 hover:text-white border border-white/10 hover:border-white/30 backdrop-blur-md'
          } active:scale-75 shrink-0 cursor-pointer`}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              isSaved ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-300'
            }`}
          />
        </button>
      </div>

      {/* Product Image with smooth zoom-in & slide-up Add to Cart reveal */}
      <div className="relative w-full aspect-square rounded-xl bg-[#0a0a0f] overflow-hidden mb-3 border border-[#2a2a3e]/60 flex items-center justify-center p-2">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {product.stock_quantity <= 0 && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Slide-up reveal Add to Cart button from bottom on card hover */}
        <div className="absolute inset-x-2 bottom-2 z-20 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none">
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className="btn-futuristic-primary w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xl shadow-purple-950/80 pointer-events-auto active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <p className="text-[10px] uppercase font-bold tracking-wider text-purple-400 mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-gray-200">{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-gray-500">({product.review_count})</span>
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-3 pt-3 border-t border-[#2a2a3e] flex items-center justify-between gap-2">
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-white">
              PKR {product.price.toLocaleString()}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-gray-500 line-through">
                PKR {product.original_price!.toLocaleString()}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className="btn-futuristic-primary w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-purple-900/30 transition-all active:scale-90 shrink-0 cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};
