import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, Flame, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const search = location.search;

  const isActive = (route: string, query?: string) => {
    if (query) {
      return path === route && search.includes(query);
    }
    return path === route;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-[#2a2a3e] px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around relative">
        {/* Tab 1: Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            isActive('/') && !search ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </Link>

        {/* Tab 2: Categories */}
        <Link
          to="/products?view=categories"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            search.includes('category') || search.includes('view=categories')
              ? 'text-purple-400 font-bold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Categories</span>
        </Link>

        {/* Tab 3: Shop (Center Purple Circle) */}
        <Link
          to="/products"
          className="flex flex-col items-center justify-center -mt-6 group"
          aria-label="Shop Catalog"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-500 p-1 shadow-lg shadow-purple-900/50 group-active:scale-95 transition-transform flex items-center justify-center border-4 border-[#0a0a0f]">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-purple-300 mt-0.5">Shop</span>
        </Link>

        {/* Tab 4: Deals */}
        <Link
          to="/products?filter=trending"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            search.includes('filter=trending') ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Flame className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[10px]">Deals</span>
        </Link>

        {/* Tab 5: Account & Orders */}
        <Link
          to="/order-history"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            path === '/order-history' || path.startsWith('/admin') ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Account</span>
        </Link>
      </div>
    </nav>
  );
};
