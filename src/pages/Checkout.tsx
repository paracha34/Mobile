import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { dbService } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export const Checkout: React.FC = () => {
  const { items, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 100000 || subtotal === 0 ? 0 : 500;
  const grandTotal = subtotal + deliveryFee;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length < 10) {
      newErrors.phone = 'Please provide a valid contact number';
    }
    if (!address.trim()) newErrors.address = 'Complete delivery street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('Your shopping cart is empty', 'warning');
      return;
    }

    if (!validate()) {
      showToast('Please fix the errors in the form before submitting', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // Order number format as specified: "ORD-" + Date.now() + random 4 digits
      const randomFour = Math.random().toString().slice(2, 6);
      const orderNumber = `ORD-${Date.now()}-${randomFour}`;

      const newOrder = await dbService.createOrder({
        order_number: orderNumber,
        customer_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          price: i.price,
          image: i.image,
          quantity: i.quantity,
        })),
        subtotal,
        total: grandTotal,
        status: 'pending',
      });

      clearCart();
      showToast(`Order #${newOrder.order_number} confirmed!`, 'success');
      navigate('/order-success', { state: { order: newOrder } });
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Unable to place order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center mx-auto text-purple-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-gray-400">
          Add some gadgets to your cart before proceeding to the checkout portal.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan', 'Quetta', 'Sialkot', 'Gujranwala', 'Other'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Store</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 text-left">
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3e]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <span>Customer &amp; Shipping Details</span>
              </h2>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                256-Bit SSL Encrypted
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Zeeshan"
                  className={`w-full bg-[#0a0a0f] border ${
                    errors.fullName ? 'border-red-500' : 'border-[#2a2a3e] focus:border-purple-500'
                  } rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none`}
                />
                {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className={`w-full bg-[#0a0a0f] border ${
                      errors.phone ? 'border-red-500' : 'border-[#2a2a3e] focus:border-purple-500'
                    } rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Delivery Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Apartment #, Street, Sector / Area"
                    className={`w-full bg-[#0a0a0f] border ${
                      errors.address ? 'border-red-500' : 'border-[#2a2a3e] focus:border-purple-500'
                    } rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none`}
                  />
                  {errors.address && <p className="text-[11px] text-red-400 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    City <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Delivery Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ring the bell twice, call before arriving"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentMethod === 'cod'
                    ? 'border-purple-500 bg-purple-950/20'
                    : 'border-[#2a2a3e] bg-[#0a0a0f]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-0.5 text-purple-600 focus:ring-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Pay in cash to the rider upon parcel inspection</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentMethod === 'bank'
                    ? 'border-purple-500 bg-purple-950/20'
                    : 'border-[#2a2a3e] bg-[#0a0a0f]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="mt-0.5 text-purple-600 focus:ring-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Bank Transfer</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">HBL / Meezan Bank / Raast account details provided</p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Placing Your Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm Order — PKR {grandTotal.toLocaleString()}</span>
              </>
            )}
          </button>
        </form>

        {/* Right Summary Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-[#2a2a3e]">
              Order Summary ({items.length} Items)
            </h3>

            <div className="divide-y divide-[#2a2a3e] max-h-80 overflow-y-auto pr-1 space-y-2">
              {items.map((item) => (
                <div key={item.product_id} className="pt-2 first:pt-0 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-[#0a0a0f] border border-[#2a2a3e] overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                    <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right text-xs font-bold text-purple-300">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-[#2a2a3e] text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Expedited Courier Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE (Order &gt; 100K)</span>
                  ) : (
                    `PKR ${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#2a2a3e]">
                <span>Total Amount</span>
                <span className="text-purple-400 text-base">PKR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2a2a3e] space-y-2 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Original boxed unit with official warranty card</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Tracking ID will be dispatched via SMS &amp; Phone call</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
