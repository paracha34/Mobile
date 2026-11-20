import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock_quantity <= 0) {
      showToast('Item is currently out of stock', 'warning');
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
    removeFromWishlist(product.id);
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
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeWishlist}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#12121a] border-l border-[#2a2a3e] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#2a2a3e] flex items-center justify-between bg-[#1a1a2e]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Saved Wishlist</h2>
                <p className="text-xs text-gray-400">
                  {wishlist.length} {wishlist.length === 1 ? 'saved gadget' : 'saved gadgets'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {wishlist.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="px-2.5 py-1 text-xs text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
                  title="Clear all saved items"
                >
                  Clear
                </button>
              )}
              <button
                onClick={closeWishlist}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-rose-400/80 shadow-lg shadow-rose-900/10">
                  <Heart className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your wishlist is empty</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                    Tap the heart icon on any product card to save items you love and buy them later.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeWishlist();
                    navigate('/products');
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all active:scale-95"
                >
                  Explore Gadgets
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              wishlist.map((item) => {
                const isOutOfStock = item.stock_quantity <= 0;
                const hasDiscount = item.original_price && item.original_price > item.price;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3.5 p-3 rounded-2xl bg-[#1a1a2e]/70 border border-[#2a2a3e] hover:border-purple-500/40 transition-all duration-200 group relative"
                  >
                    {/* Thumbnail */}
                    <Link
                      to={`/products/${item.slug}`}
                      onClick={closeWishlist}
                      className="w-20 h-20 rounded-xl bg-[#0a0a0f] border border-[#2a2a3e] p-1.5 shrink-0 overflow-hidden flex items-center justify-center"
                    >
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {item.category && (
                          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                            {item.category.name}
                          </span>
                        )}
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={closeWishlist}
                          className="block text-xs font-semibold text-white hover:text-purple-300 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-extrabold text-white">
                            PKR {item.price.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-gray-500 line-through">
                              PKR {item.original_price!.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#2a2a3e]/60">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">
                            Out of Stock
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleMoveToCart(item, e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold transition-all active:scale-95"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Move to Cart</span>
                          </button>
                        )}

                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors ml-auto"
                          aria-label={`Remove ${item.name} from wishlist`}
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#2a2a3e] bg-[#1a1a2e]/60 space-y-2.5">
              <button
                onClick={handleAddAllToCart}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add All In-Stock to Cart</span>
              </button>

              <Link
                to="/wishlist"
                onClick={closeWishlist}
                className="w-full py-2.5 px-4 rounded-xl bg-[#12121a] hover:bg-[#1f1f2e] border border-[#2a2a3e] text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Wishlist Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
