import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Truck, Headphones, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0f] border-t border-[#2a2a3e] pt-12 pb-24 md:pb-12 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 border-b border-[#2a2a3e]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#12121a] border border-[#2a2a3e]">
            <Truck className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-xs">Fast Express Delivery</h4>
              <p className="text-[11px] text-gray-500">Free on orders above PKR 100K</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#12121a] border border-[#2a2a3e]">
            <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-xs">100% Genuine Tech</h4>
              <p className="text-[11px] text-gray-500">Official brand warranties</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#12121a] border border-[#2a2a3e]">
            <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-xs">7 Days Checking</h4>
              <p className="text-[11px] text-gray-500">Hassle-free replacement policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#12121a] border border-[#2a2a3e]">
            <Headphones className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-xs">Expert Tech Support</h4>
              <p className="text-[11px] text-gray-500">Live AI &amp; human specialists</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                GADGET<span className="text-purple-400">ZONE</span>
              </span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm mb-4">
              Your premier destination for verified flagship smartphones, audiophile headphones, smart wearables, and gaming hardware in Pakistan.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Retailer &amp; Verified Stock</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Categories</h5>
            <ul className="space-y-2">
              <li><Link to="/products?category=smartphones" className="hover:text-purple-400 transition-colors">Smartphones</Link></li>
              <li><Link to="/products?category=audio-sound" className="hover:text-purple-400 transition-colors">Audio &amp; ANC</Link></li>
              <li><Link to="/products?category=smart-watches" className="hover:text-purple-400 transition-colors">Smart Watches</Link></li>
              <li><Link to="/products?category=laptops-computing" className="hover:text-purple-400 transition-colors">Laptops</Link></li>
              <li><Link to="/products?category=gaming-vr" className="hover:text-purple-400 transition-colors">Gaming &amp; VR</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Customer Care</h5>
            <ul className="space-y-2">
              <li><Link to="/order-history" className="hover:text-purple-400 transition-colors">Track Shipment &amp; Orders</Link></li>
              <li><Link to="/products" className="hover:text-purple-400 transition-colors">Warranty Claim</Link></li>
              <li><Link to="/checkout" className="hover:text-purple-400 transition-colors">Payment Methods</Link></li>
              <li><Link to="/products" className="hover:text-purple-400 transition-colors">FAQs &amp; Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Store Admin</h5>
            <ul className="space-y-2">
              <li><Link to="/admin/login" className="hover:text-purple-400 transition-colors">Admin Portal</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/admin/products" className="hover:text-purple-400 transition-colors">Manage Products</Link></li>
              <li><Link to="/admin/orders" className="hover:text-purple-400 transition-colors">Orders Manager</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#2a2a3e] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} Gadget Zone Inc. All rights reserved. Prices quoted in PKR.</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-300">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-300">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-gray-300">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
