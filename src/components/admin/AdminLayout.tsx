import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, signOut, isSupabaseConnected } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('products')) return 'Product Inventory Manager';
    if (path.includes('banners')) return 'Banners & Promotions Manager';
    if (path.includes('categories')) return 'Store Categories Manager';
    if (path.includes('orders')) return 'Customer Orders Manager';
    return 'Admin Executive Dashboard';
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex text-left">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#12121a] border-r border-[#2a2a3e] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Close */}
          <div className="h-16 sm:h-20 px-6 border-b border-[#2a2a3e] flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div className="text-left">
                <span className="font-bold text-sm tracking-tight text-white block">
                  GADGET<span className="text-purple-400">ZONE</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium -mt-1 block">Management Console</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar User Info & View Store */}
        <div className="p-4 border-t border-[#2a2a3e] space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#1a1a2e] hover:bg-[#25253d] text-gray-300 hover:text-white text-xs font-medium border border-[#2a2a3e] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span>View Public Store</span>
            </span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-white truncate">{user?.email || 'Admin'}</p>
              <p className="text-[10px] text-gray-500">Super Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 sm:h-20 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3e] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-gray-300"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#12121a] border border-[#2a2a3e] text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-gray-300 hidden sm:inline">
                {isSupabaseConnected ? 'Supabase Connected' : 'Local Persistence Mode'}
              </span>
            </div>

            <div className="text-xs font-medium text-gray-400 hidden md:block">
              {user?.email}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
