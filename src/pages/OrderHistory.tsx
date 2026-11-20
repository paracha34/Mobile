import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { dbService } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await dbService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load order history from Supabase:', err);
      showToast('Could not load orders. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    showToast(`Order #${orderNumber} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      });
    });
    showToast(`Added ${order.items.length} item(s) from order #${order.order_number} to your cart`, 'success');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return {
          label: 'Delivered',
          classes: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: CheckCircle2,
        };
      case 'shipped':
        return {
          label: 'Shipped (In Transit)',
          classes: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          icon: Truck,
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          classes: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: Check,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          classes: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          icon: XCircle,
        };
      case 'pending':
      default:
        return {
          label: 'Order Placed (Pending)',
          classes: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: Clock,
        };
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.order_number.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      order.phone.toLowerCase().includes(q) ||
      order.city.toLowerCase().includes(q) ||
      order.items.some((item) => item.name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#2a2a3e]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Order History &amp; Purchases
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Track live package progress, inspect invoices, and reorder gadgets
              </p>
            </div>
          </div>
        </div>

        {/* Refresh & Quick Stats */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-[#1a1a2e] border border-[#2a2a3e] text-xs font-semibold text-gray-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Search input */}
        <div className="md:col-span-7 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order # (e.g. ORD-1736...), gadget name, phone..."
            className="w-full bg-[#12121a] border border-[#2a2a3e] focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-900/40'
                  : 'bg-[#12121a] text-gray-400 hover:text-white border border-[#2a2a3e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-[#12121a] border border-[#2a2a3e] p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#2a2a3e]">
                <div className="h-5 w-40 bg-[#2a2a3e] rounded" />
                <div className="h-5 w-24 bg-[#2a2a3e] rounded-full" />
              </div>
              <div className="h-16 w-full bg-[#1a1a2e] rounded-2xl" />
              <div className="h-4 w-32 bg-[#2a2a3e] rounded" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl bg-[#12121a] border border-[#2a2a3e] p-12 sm:p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center mx-auto text-purple-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">
              {searchQuery || selectedStatus !== 'all' ? 'No matching orders found' : 'No order history yet'}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or switching status tabs to locate your order.'
                : 'When you purchase smartphones, headphones, or wearables, your order history and tracking details will appear here.'}
            </p>
          </div>
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-colors"
            >
              <span>Explore Latest Tech</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Order List */
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;
            const stepIdx = getStepIndex(order.status);

            return (
              <div
                key={order.id}
                className="rounded-3xl bg-[#12121a] border border-[#2a2a3e] overflow-hidden shadow-xl hover:border-purple-500/30 transition-all duration-200"
              >
                {/* Order Top Bar */}
                <div className="p-5 sm:p-6 bg-[#1a1a2e]/60 border-b border-[#2a2a3e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Order #
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold text-white">
                        {order.order_number}
                      </span>
                      <button
                        onClick={() => handleCopyOrderNumber(order.order_number)}
                        className="text-gray-400 hover:text-purple-300 p-1 rounded transition-colors"
                        title="Copy Order Number"
                      >
                        {copiedId === order.order_number ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}</span>
                      <span>•</span>
                      <span>{order.city}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badge.classes}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Tracking Stepper (if not cancelled) */}
                {order.status !== 'cancelled' && (
                  <div className="px-6 py-4 bg-[#0a0a0f]/60 border-b border-[#2a2a3e]/60">
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {[
                        { step: 1, name: 'Placed' },
                        { step: 2, name: 'Confirmed' },
                        { step: 3, name: 'Shipped' },
                        { step: 4, name: 'Delivered' },
                      ].map((s) => {
                        const isReached = stepIdx >= s.step;
                        const isCurrent = stepIdx === s.step;
                        return (
                          <div key={s.step} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                                isReached
                                  ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-900/50'
                                  : 'bg-[#1a1a2e] border-[#2a2a3e] text-gray-500'
                              }`}
                            >
                              {isReached ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                            </div>
                            <span
                              className={`text-[10px] mt-1 font-semibold ${
                                isCurrent
                                  ? 'text-purple-300'
                                  : isReached
                                  ? 'text-gray-300'
                                  : 'text-gray-600'
                              }`}
                            >
                              {s.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items in Order */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="divide-y divide-[#2a2a3e]/60">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#0a0a0f] border border-[#2a2a3e] overflow-hidden shrink-0 flex items-center justify-center p-1">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-white truncate hover:text-purple-300 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Quantity: <span className="text-gray-200 font-bold">{item.quantity}</span> × PKR {item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-purple-300">
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping and Total Footer */}
                  <div className="pt-4 border-t border-[#2a2a3e] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    {/* Destination Info */}
                    <div className="flex items-start gap-2 text-gray-400">
                      <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-200 font-medium">{order.customer_name}</span> ({order.phone})
                        <p className="text-[11px] text-gray-500">{order.address}, {order.city}</p>
                      </div>
                    </div>

                    {/* Total & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <div className="text-left sm:text-right pr-2">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Total Paid / Due</span>
                        <span className="text-base font-black text-white">
                          PKR {order.total.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleReorder(order)}
                        className="px-4 py-2 rounded-xl bg-[#1a1a2e] hover:bg-[#25253d] border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                        <span>Buy Again</span>
                      </button>
                    </div>
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
