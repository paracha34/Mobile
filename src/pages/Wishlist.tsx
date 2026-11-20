import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, ShoppingBag, Trash2, Zap } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (product: any) => {
    if (product.stock_quantity <= 0) {
      showToast('Item is out of stock', 'warning');
      return;
    }

    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      quantity: 1,
      max_stock: product.stock_quantity,
    });
    showToast(`Added "${product.name}" to your cart`, 'success');
  };

  const handleAddAllToCart = () => {
    const inStockItems = wishlist.filter((item) => item.stock_quantity > 0);
    if (inStockItems.length === 0) {
      showToast('No in-stock items available to add to cart', 'warning');
      return;
    }

    inStockItems.forEach((product) => {
      addToCart({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
        quantity: 1,
        max_stock: product.stock_quantity,
      });
    });

    showToast(`Added ${inStockItems.length} in-stock item${inStockItems.length > 1 ? 's' : ''} to cart!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalog
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Saved Wishlist
              </h1>
              <p className="text-xs text-gray-400">
                {wishlist.length} {wishlist.length === 1 ? 'saved item' : 'saved items'} in your persistent browser storage
              </p>
            </div>
          </div>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={clearWishlist}
              className="px-3.5 py-2 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] hover:border-rose-500/40 text-xs font-semibold text-gray-300 hover:text-rose-400 transition-colors"
            >
              Clear Wishlist
            </button>
            <button
              onClick={handleAddAllToCart}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All In-Stock to Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {wishlist.length === 0 ? (
        <div className="rounded-3xl bg-[#12121a] border border-[#2a2a3e] p-10 sm:p-16 text-center max-w-lg mx-auto space-y-5">
          <div className="w-20 h-20 rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-rose-400/80 mx-auto shadow-xl shadow-rose-950/20">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Your wishlist is currently empty</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5 leading-relaxed">
              Explore our tech catalogue and tap the heart icon on any gadget card to bookmark items you're interested in purchasing later.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 transition-all active:scale-95"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((item) => {
            const isOutOfStock = item.stock_quantity <= 0;
            const hasDiscount = item.original_price && item.original_price > item.price;
            const discountPercent = hasDiscount
              ? Math.round(((item.original_price! - item.price) / item.original_price!) * 100)
              : 0;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] p-4 transition-all duration-200 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-900/15 relative group"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-rose-950 border border-white/10 hover:border-rose-500/50 text-gray-300 hover:text-rose-400 flex items-center justify-center transition-colors"
                  aria-label={`Remove ${item.name} from wishlist`}
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Image */}
                <Link
                  to={`/products/${item.slug}`}
                  className="relative w-full aspect-square rounded-xl bg-[#0a0a0f] overflow-hidden mb-3 border border-[#2a2a3e]/60 flex items-center justify-center p-2"
                >
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-sm">
                      -{discountPercent}%
                    </span>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {item.category && (
                      <p className="text-[10px] uppercase font-bold tracking-wider text-purple-400 mb-1">
                        {item.category.name}
                      </p>
                    )}
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-xs sm:text-sm font-semibold text-white hover:text-purple-300 transition-colors line-clamp-2 leading-snug"
                    >
                      {item.name}
                    </Link>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-4 pt-3 border-t border-[#2a2a3e] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-white">
                        PKR {item.price.toLocaleString()}
                      </div>
                      {hasDiscount && (
                        <div className="text-[11px] text-gray-500 line-through">
                          PKR {item.original_price!.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isOutOfStock}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
