import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { TechAdvisorModal } from '../advisor/TechAdvisorModal';
import { AnnouncementBar } from './AnnouncementBar';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { getCount, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const notifications = [
    { id: 1, title: 'Flash Deal Live', desc: 'Up to 35% off high-end audio & gaming accessories!', time: '10m ago' },
    { id: 2, title: 'New Arrival', desc: 'Galaxy S25 Ultra Titanium now in stock.', time: '1h ago' },
    { id: 3, title: 'Free Express Shipping', desc: 'Orders above PKR 100,000 get free expedited delivery.', time: '1d ago' },
  ];

  return (
    <>
      {/* Top Green Announcement Bar with infinite marquee scroll */}
      <AnnouncementBar />

      <header className="sticky top-0 z-40 w-full bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo with shimmer effect on load */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="logo-shimmer-sweep w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-900/30 group-hover:shadow-purple-700/50 transition-all duration-300">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-200 fill-purple-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  GADGET<span className="text-purple-400">ZONE</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-purple-950/80 border border-purple-500/40 text-[9px] font-bold text-purple-300 rounded tracking-wider uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-wider -mt-1 hidden sm:block">Next-Gen Electronics</p>
            </div>
          </Link>

          {/* Desktop Nav Links with Magnetic Hover Effect */}
          <nav className="hidden xl:flex items-center gap-6 px-2">
            <Link
              to="/products"
              className="nav-magnetic-link text-xs font-semibold text-gray-300 hover:text-purple-300 py-1 transition-all"
            >
              All Products
            </Link>
            <Link
              to="/products?filter=trending"
              className="nav-magnetic-link text-xs font-semibold text-gray-300 hover:text-purple-300 py-1 transition-all"
            >
              Hot Deals
            </Link>
            <Link
              to="/order-history"
              className="nav-magnetic-link text-xs font-semibold text-gray-300 hover:text-purple-300 py-1 transition-all"
            >
              Track Orders
            </Link>
          </nav>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-sm lg:max-w-md relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search smartphones, headphones, smartwatches..."
              className="w-full bg-[#12121a] border border-[#2a2a3e] focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 transition-all focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* AI Advisor Button */}
            <button
              onClick={() => setAdvisorOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Tech Advisor</span>
            </button>

            {/* Notification Bell with Bounce Glow */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="icon-bounce-glow p-2 sm:p-2.5 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-gray-300 hover:text-white hover:border-purple-500/40 transition-colors relative cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] shadow-2xl p-4 z-50 animate-slide-up">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3e]">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                    <span className="text-[10px] text-purple-400 font-medium">3 Unread</span>
                  </div>
                  <div className="divide-y divide-[#2a2a3e]/50">
                    {notifications.map((item) => (
                      <div key={item.id} className="py-2.5 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-white">{item.title}</span>
                          <span className="text-[10px] text-gray-500">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Header Icon with Bounce + Glow */}
            <button
              onClick={openWishlist}
              className="icon-bounce-glow p-2 sm:p-2.5 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-gray-300 hover:text-rose-400 hover:border-rose-500/40 transition-colors relative cursor-pointer"
              aria-label="View saved wishlist"
              title="Saved Wishlist"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'fill-rose-500/40 text-rose-400' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-rose-900/50">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Profile Section with Bounce + Glow */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className={`icon-bounce-glow p-2 sm:px-3 sm:py-2 rounded-xl bg-[#12121a] border border-[#2a2a3e] hover:border-purple-500/40 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  showProfileMenu ? 'border-purple-500 text-purple-300' : 'text-gray-300 hover:text-white'
                }`}
                aria-label="User Profile and Order History"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                <span className="hidden xl:inline text-xs font-semibold">
                  {user ? 'Account' : 'My Orders'}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] shadow-2xl p-3.5 z-50 animate-slide-up space-y-2 text-left">
                  <div className="px-3 py-2 border-b border-[#2a2a3e]/80 bg-[#12121a]/60 rounded-xl">
                    <p className="text-xs font-bold text-white truncate">
                      {user ? user.email : 'Shopper Profile'}
                    </p>
                    <p className="text-[10px] text-purple-400 font-medium mt-0.5">
                      {user ? 'Authenticated Admin' : 'Manage Purchases & Deliveries'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to="/order-history"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>Order History</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/30 text-purple-300 rounded font-bold uppercase">
                            Recent
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-normal truncate">
                          Track live status, receipts &amp; reorder
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-600/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                        <Heart className="w-4 h-4 fill-rose-500/40 text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>Saved Wishlist</span>
                          {wishlistCount > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-rose-500/30 text-rose-300 rounded font-bold uppercase">
                              {wishlistCount} saved
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-normal truncate">
                          View and manage bookmarked gadgets
                        </div>
                      </div>
                    </Link>

                    {user ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-bold">Admin Management</div>
                          <div className="text-[10px] text-gray-400 font-normal">Products, banners, &amp; store metrics</div>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        to="/admin/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Shield className="w-4 h-4 text-gray-500 shrink-0" />
                        <span>Admin Login</span>
                      </Link>
                    )}
                  </div>

                  {user && (
                    <div className="pt-2 border-t border-[#2a2a3e]">
                      <button
                        onClick={() => {
                          signOut();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Icon with Glowing Pulse, Scale-up, Ripple & Bounce Glow */}
            <button
              onClick={openCart}
              className="btn-futuristic-primary icon-bounce-glow flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 transition-all active:scale-95 cursor-pointer"
              aria-label="View shopping cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {getCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-[#0a0a0f]">
                    {getCount()}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold">
                Cart {getCount() > 0 && `(${getCount()})`}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-gray-300 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown search & links */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2a2a3e] bg-[#0a0a0f] p-4 space-y-3 animate-slide-up">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-[#12121a] border border-[#2a2a3e] focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </form>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-xs font-semibold text-center text-white"
              >
                All Products
              </Link>
              <Link
                to="/order-history"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-semibold text-purple-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span>My Order History &amp; Tracking</span>
                </div>
                <span className="text-[10px] text-purple-400 font-bold">Track →</span>
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs font-semibold text-rose-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-500/30" />
                  <span>My Saved Wishlist</span>
                </div>
                <span className="text-[10px] text-rose-400 font-bold">{wishlistCount} saved →</span>
              </Link>
              <Link
                to="/products?filter=trending"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-xs font-semibold text-center text-purple-300"
              >
                Trending Deals
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdvisorOpen(true);
                }}
                className="col-span-2 p-2.5 rounded-xl bg-purple-900/40 border border-purple-500/40 text-xs font-semibold text-center text-purple-200 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Ask AI Tech Advisor
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Tech Advisor Modal */}
      <TechAdvisorModal isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </>
  );
};
