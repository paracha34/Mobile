import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { dbService } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalStatus, setModalStatus] = useState<OrderStatus>('pending');
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await dbService.getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Error fetching admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDetail = (ord: Order) => {
    setSelectedOrder(ord);
    setModalStatus(ord.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const updated = await dbService.updateOrderStatus(selectedOrder.id, modalStatus);
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        setSelectedOrder(updated);
        showToast(`Order #${updated.order_number} marked as ${modalStatus.toUpperCase()}`, 'success');
      }
    } catch (e) {
      console.error('Failed to update status:', e);
      showToast('Error updating order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

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

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Orders &amp; Dispatch Manager</h2>
          <p className="text-xs text-gray-400">Review incoming customer purchases, tracking IDs, and fulfill status</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#12121a] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Orders ({orders.length})</option>
              <option value="pending">Pending ({orders.filter((o) => o.status === 'pending').length})</option>
              <option value="confirmed">Confirmed ({orders.filter((o) => o.status === 'confirmed').length})</option>
              <option value="shipped">Shipped ({orders.filter((o) => o.status === 'shipped').length})</option>
              <option value="delivered">Delivered ({orders.filter((o) => o.status === 'delivered').length})</option>
              <option value="cancelled">Cancelled ({orders.filter((o) => o.status === 'cancelled').length})</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, phone, customer..."
              className="bg-[#12121a] border border-[#2a2a3e] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1a1a2e] text-gray-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3e]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => handleOpenDetail(ord)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {ord.customer_name}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {ord.phone}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {ord.city}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      PKR {ord.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(ord);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-semibold p-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-3xl bg-[#12121a] border border-[#2a2a3e] shadow-2xl p-6 sm:p-8 space-y-6 text-left animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a3e]">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Order Details</span>
                <h3 className="text-lg font-mono font-bold text-purple-400">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#1a1a2e]/60 border border-[#2a2a3e] text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Customer Info</span>
                </div>
                <p className="text-gray-300 font-medium">{selectedOrder.customer_name}</p>
                <p className="text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-500" />
                  {selectedOrder.phone}
                </p>
                {selectedOrder.email && <p className="text-gray-400">{selectedOrder.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>Destination Address</span>
                </div>
                <p className="text-gray-300">{selectedOrder.address}</p>
                <p className="text-gray-400 font-medium">City: {selectedOrder.city}</p>
                {selectedOrder.notes && (
                  <p className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/20 mt-1">
                    Note: "{selectedOrder.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Parcel Contents ({selectedOrder.items.length} items)
              </h4>
              <div className="divide-y divide-[#2a2a3e] max-h-56 overflow-y-auto pr-1">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover bg-[#0a0a0f] border border-[#2a2a3e]"
                      />
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-[11px] text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-300">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#2a2a3e] flex justify-between text-sm font-bold text-white">
                <span>Grand Total (COD / Due)</span>
                <span className="text-purple-400 text-base">PKR {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Status Update Dropdown + Save Button */}
            <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-[#2a2a3e] space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Update Fulfillment Status</span>
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as OrderStatus)}
                  className="w-full sm:flex-1 bg-[#12121a] border border-[#2a2a3e] rounded-xl px-3.5 py-2 text-xs text-white font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="pending">Pending (Unprocessed)</option>
                  <option value="confirmed">Confirmed (Verified with Customer)</option>
                  <option value="shipped">Shipped (Dispatched with Courier)</option>
                  <option value="delivered">Delivered (Successfully Handed Over)</option>
                  <option value="cancelled">Cancelled (Void Order)</option>
                </select>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-colors"
                >
                  {updating ? 'Saving...' : 'Save Status in Supabase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
