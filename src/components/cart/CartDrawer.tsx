import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, getTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const subtotal = getTotal();
  const deliveryFee = subtotal > 0 ? (subtotal >= 100000 ? 0 : 500) : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#12121a] border-l border-[#2a2a3e] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#2a2a3e] flex items-center justify-between bg-[#1a1a2e]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Your Cart</h2>
                <p className="text-xs text-gray-400">{items.length} {items.length === 1 ? 'unique item' : 'unique items'}</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-purple-400">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Your shopping cart is empty</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs">
                    Discover our latest smartphones, noise-canceling headphones, and flagship gear.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/products');
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-colors"
                >
                  Start Shopping
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex gap-3.5 p-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] hover:border-purple-500/30 transition-all duration-200"
                >
                  <div className="w-20 h-20 rounded-lg bg-[#0a0a0f] overflow-hidden shrink-0 border border-[#2a2a3e]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-purple-400 mt-0.5">
                        PKR {item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2a2a3e]/60">
                      <div className="flex items-center gap-2 border border-[#2a2a3e] bg-[#12121a] rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="text-gray-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-semibold text-white min-w-[1.2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="text-gray-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-gray-200">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#2a2a3e] bg-[#1a1a2e]/60 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Standard Delivery</span>
                  <span>{deliveryFee === 0 ? <span className="text-emerald-400 font-medium">FREE</span> : `PKR ${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#2a2a3e]">
                  <span>Total</span>
                  <span className="text-purple-400 text-base">PKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-xl shadow-purple-900/30 active:scale-[0.99] transition-all duration-200"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={closeCart}
                className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-1"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
