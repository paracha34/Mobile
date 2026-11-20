import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  Search,
  Truck,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';
import { dbService } from '../../lib/supabase';

const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'Order received & logged' },
  { status: 'confirmed', label: 'Processing', desc: 'Verified & packaged' },
  { status: 'shipped', label: 'In Transit', desc: 'With courier partner' },
  { status: 'delivered', label: 'Delivered', desc: 'Received at destination' },
];

export const OrderStatusTracker: React.FC = () => {
  const [orderQuery, setOrderQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleIds = [
    { id: 'ord-101', label: 'ord-101', status: 'Delivered' },
    { id: 'ord-102', label: 'ord-102', status: 'Shipped' },
    { id: 'ord-103', label: 'ord-103', status: 'Confirmed' },
  ];

  const handleSearch = async (queryToSearch?: string) => {
    const targetQuery = (queryToSearch ?? orderQuery).trim();
    if (!targetQuery) {
      setErrorMsg('Please enter an Order ID or Order Reference Number');
      return;
    }

    setErrorMsg(null);
    setIsSearching(true);
    setHasSearched(true);

    try {
      const order = await dbService.lookupOrder(targetQuery);
      if (order) {
        setSearchedOrder(order);
        setErrorMsg(null);
      } else {
        setSearchedOrder(null);
        setErrorMsg(`No order found matching "${targetQuery}". Please verify your order number.`);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setErrorMsg('Failed to fetch order status. Please try again.');
      setSearchedOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setOrderQuery('');
    setSearchedOrder(null);
    setHasSearched(false);
    setErrorMsg(null);
  };

  const getStepProgressIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = searchedOrder ? getStepProgressIndex(searchedOrder.status) : 0;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: CheckCircle2,
          text: 'Delivered',
        };
      case 'shipped':
        return {
          bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          icon: Truck,
          text: 'Dispatched & In Transit',
        };
      case 'confirmed':
        return {
          bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
          icon: CheckCircle2,
          text: 'Confirmed & Processing',
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          icon: XCircle,
          text: 'Cancelled',
        };
      case 'pending':
      default:
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: Clock,
          text: 'Pending Verification',
        };
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#161626] to-[#10101b] border border-purple-500/20 p-6 sm:p-10 shadow-2xl overflow-hidden text-left">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a3e] pb-6">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-900/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Order Status & Shipment Lookup
                  </h2>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    Live Tracking
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  Enter your Order ID or tracking code to query real-time delivery status from the database
                </p>
              </div>
            </div>

            <Link
              to="/order-history"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors shrink-0"
            >
              <span>View Your Order History</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g., ord-101 or ORD-17369...)"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors shadow-inner"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-4 top-4" />
                {orderQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderQuery('')}
                    className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300 text-xs px-1.5 py-0.5 rounded bg-gray-800"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/40 hover:shadow-purple-700/50 transition-all active:scale-95 shrink-0"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Status</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick-test sample chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-gray-500 font-medium">Try sample orders:</span>
              {sampleIds.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setOrderQuery(sample.id);
                    handleSearch(sample.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1a1a2e] hover:bg-purple-950/60 border border-[#2a2a3e] hover:border-purple-500/40 text-[11px] font-mono text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-purple-400 font-bold">{sample.label}</span>
                  <span className="text-gray-500 text-[10px]">({sample.status})</span>
                </button>
              ))}
            </div>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-xs text-rose-300/80">
                  Please verify that the ID matches your checkout confirmation, or click one of the sample orders above to see how live tracking looks.
                </p>
              </div>
            </div>
          )}

          {/* Searched Order Details */}
          {searchedOrder && (
            <div className="rounded-2xl bg-[#0e0e18] border border-purple-500/30 p-5 sm:p-7 space-y-6 shadow-xl animate-fade-in">
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#25253d] pb-5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg font-black text-white font-mono">
                      #{searchedOrder.id}
                    </span>
                    {searchedOrder.order_number && (
                      <span className="text-xs font-mono text-gray-400 bg-[#1a1a2e] px-2.5 py-0.5 rounded-md border border-[#2a2a3e]">
                        Ref: {searchedOrder.order_number}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      Placed on {new Date(searchedOrder.created_at).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {(() => {
                    const badge = getStatusBadge(searchedOrder.status);
                    const BadgeIcon = badge.icon;
                    return (
                      <div
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${badge.bg}`}
                      >
                        <BadgeIcon className="w-4 h-4" />
                        <span>{badge.text}</span>
                      </div>
                    );
                  })()}

                  <button
                    onClick={handleReset}
                    className="p-2 rounded-xl bg-[#1a1a2e] hover:bg-[#25253d] text-gray-400 hover:text-white border border-[#2a2a3e] transition-colors"
                    title="Track another order"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Shipping Stepper (Only if not cancelled) */}
              {searchedOrder.status !== 'cancelled' ? (
                <div className="pt-2 pb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
                    Shipment Journey
                  </h4>
                  <div className="relative">
                    {/* Connecting track bar */}
                    <div className="absolute top-5 left-6 right-6 h-1 bg-[#1f1f33] rounded-full hidden sm:block">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${(Math.max(0, currentStepIdx) / (STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Step Nodes */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                      {STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const isPending = idx > currentStepIdx;

                        return (
                          <div
                            key={step.status}
                            className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2 rounded-xl transition-all ${
                              isCurrent
                                ? 'bg-purple-950/30 sm:bg-transparent border border-purple-500/30 sm:border-transparent'
                                : ''
                            }`}
                          >
                            {/* Circle Indicator */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                isCompleted
                                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                  : isCurrent
                                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white ring-4 ring-purple-500/30 animate-pulse'
                                  : 'bg-[#1a1a2e] text-gray-500 border border-[#2a2a3e]'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : isCurrent ? (
                                <Truck className="w-5 h-5 text-white" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>

                            {/* Label & Description */}
                            <div className="sm:mt-2 text-left sm:text-center min-w-0">
                              <p
                                className={`text-xs font-bold leading-tight ${
                                  isCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                  This order was cancelled. If you believe this is an error or need assistance, please contact Gadget Zone customer support.
                </div>
              )}

              {/* Delivery Destination & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl bg-[#12121e] border border-[#232338] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>Shipping Destination</span>
                  </div>
                  <div className="text-xs text-gray-300 space-y-0.5">
                    <p className="text-white font-semibold">{searchedOrder.customer_name}</p>
                    <p className="text-gray-400">{searchedOrder.address}</p>
                    <p className="text-purple-300 font-medium">{searchedOrder.city}, Pakistan</p>
                    <p className="text-[11px] text-gray-500 pt-1">Phone: {searchedOrder.phone}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#12121e] border border-[#232338] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span>Package Summary</span>
                  </div>
                  <div className="text-xs text-gray-300 space-y-1.5">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Total Items:</span>
                      <span className="text-white font-medium">
                        {searchedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Payment Method:</span>
                      <span className="text-purple-300 font-medium">Cash on Delivery (COD)</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#25253d] text-sm font-bold">
                      <span className="text-gray-200">Order Total:</span>
                      <span className="text-purple-400">
                        Rs. {searchedOrder.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List in Order */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Items in this Shipment ({searchedOrder.items.length})
                </h4>
                <div className="divide-y divide-[#222238] rounded-xl bg-[#12121e] border border-[#232338] overflow-hidden">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-[#1a1a2e] border border-[#2a2a3e] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-400">
                            Qty: <span className="text-purple-300 font-semibold">{item.quantity}</span> × Rs. {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-white">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes if present */}
              {searchedOrder.notes && (
                <div className="p-3 rounded-xl bg-[#1a1a2e]/60 border border-[#2a2a3e] text-xs text-gray-400">
                  <span className="text-gray-300 font-medium">Delivery Note: </span>
                  {searchedOrder.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
