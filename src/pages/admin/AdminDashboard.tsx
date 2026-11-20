import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  DollarSign,
  Eye,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Order, Product } from '../../types';
import { dbService } from '../../lib/supabase';

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [allProds, allOrders] = await Promise.all([
          dbService.getAllProductsAdmin(),
          dbService.getOrders(),
        ]);
        setProducts(allProds);
        setOrders(allOrders);
      } catch (e) {
        console.error('Error fetching admin stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);

  const recentOrders = orders.slice(0, 10);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'confirmed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'pending':
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Operations &amp; Metrics</h2>
          <p className="text-xs text-gray-400">Live store performance and order fulfillment pipeline</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products?action=add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/banners?action=add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a1a2e] hover:bg-[#25253d] border border-[#2a2a3e] text-gray-200 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Add Banner</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3e] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? '...' : totalProducts}
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <span className="text-purple-400 font-semibold">{products.filter((p) => p.is_active).length} active</span> in catalog
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3e] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? '...' : totalOrders}
          </div>
          <div className="text-[11px] text-gray-500">
            Across all shipping cities
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3e] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {loading ? '...' : pendingOrders}
          </div>
          <div className="text-[11px] text-gray-500">
            Awaiting verification &amp; dispatch
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3e] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white truncate">
            {loading ? '...' : `PKR ${totalRevenue.toLocaleString()}`}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Excludes cancelled orders</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#2a2a3e] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
            <p className="text-[11px] text-gray-400">Latest 10 orders placed across Pakistan</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1a1a2e] text-gray-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total (PKR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3e]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No orders logged yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {ord.customer_name}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {ord.city}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      PKR {ord.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/admin/orders"
                        className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
