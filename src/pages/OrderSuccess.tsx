import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Truck, Phone, MapPin } from 'lucide-react';
import { Order } from '../types';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const order = (location.state as { order?: Order })?.order;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center space-y-8 animate-fade-in">
      {/* Success Badge */}
      <div className="space-y-3">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Order Confirmed!</h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
          Thank you for choosing Gadget Zone. We have received your order and our dispatch team is prepping your parcel.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="rounded-3xl bg-[#12121a] border border-[#2a2a3e] p-6 sm:p-8 text-left space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2a2a3e] gap-2">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Order Number</span>
            <div className="text-base sm:text-lg font-mono font-bold text-purple-400">
              {order?.order_number || 'ORD-VERIFIED-1001'}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold w-fit">
            Status: Processing (Pending Dispatch)
          </span>
        </div>

        {/* Customer & Shipping Summary */}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300 bg-[#1a1a2e]/60 p-4 rounded-2xl border border-[#2a2a3e]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Delivery Address</span>
              </div>
              <p className="text-gray-400">{order.customer_name}</p>
              <p className="text-gray-400">{order.address}, {order.city}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Phone className="w-4 h-4 text-purple-400" />
                <span>Contact Details</span>
              </div>
              <p className="text-gray-400">{order.phone}</p>
              {order.email && <p className="text-gray-400">{order.email}</p>}
            </div>
          </div>
        )}

        {/* Items List */}
        {order?.items && order.items.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h4>
            <div className="divide-y divide-[#2a2a3e]">
              {order.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-[#2a2a3e]" />
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-purple-300">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#2a2a3e] flex justify-between text-sm font-bold text-white">
              <span>Total Paid / Due on Delivery</span>
              <span className="text-purple-400">PKR {order.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="pt-2 text-xs text-gray-400 flex items-center gap-2">
          <Truck className="w-4 h-4 text-purple-400" />
          <span>Estimated arrival: 24 - 48 hours via TCS / Leopard Express</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all active:scale-95 w-full sm:w-auto"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-gray-300 hover:text-white font-semibold text-sm transition-colors w-full sm:w-auto"
        >
          <Package className="w-4 h-4" />
          <span>Browse More Deals</span>
        </Link>
      </div>
    </div>
  );
};
