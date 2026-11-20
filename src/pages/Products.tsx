import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Category, Product } from '../types';
import { dbService } from '../lib/supabase';
import { ProductCard } from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';

const ITEMS_PER_PAGE = 12;

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from URL or defaults
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentFilter = (searchParams.get('filter') as 'trending' | 'featured') || undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Local filter controls
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSelectedCategory(currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          dbService.getCategories(),
          dbService.getProducts({
            categorySlug: selectedCategory || undefined,
            filter: currentFilter,
            search: currentSearch || undefined,
            minPrice: minPrice !== '' ? Number(minPrice) : undefined,
            maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
            inStockOnly,
            sort: sortOption,
          }),
        ]);

        if (isMounted) {
          setCategories(cats);
          setProducts(prods);
          setCurrentPage(1); // Reset to page 1 on filter changes
          setLoading(false);
        }
      } catch (e) {
        console.error('Error fetching products:', e);
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, currentFilter, currentSearch, minPrice, maxPrice, inStockOnly, sortOption]);

  const handleCategoryChange = (slug: string) => {
    const nextSlug = selectedCategory === slug ? '' : slug;
    setSelectedCategory(nextSlug);

    const newParams = new URLSearchParams(searchParams);
    if (nextSlug) {
      newParams.set('category', nextSlug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortOption('newest');
    setSearchParams(new URLSearchParams());
  };

  // Pagination slice
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2a2a3e]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Explore Electronics &amp; Mobiles</span>
            {currentFilter && (
              <span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 text-xs font-bold uppercase">
                {currentFilter}
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {currentSearch ? (
              <>Showing search results for <span className="text-purple-400 font-bold">"{currentSearch}"</span></>
            ) : (
              `Showing ${products.length} verified tech devices`
            )}
          </p>
        </div>

        {/* Sort and Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-xs font-semibold text-gray-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-gray-400 hidden sm:inline">Sort by:</label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
              className="bg-[#12121a] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3e]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                <span>Filters</span>
              </h3>
              {(selectedCategory || minPrice || maxPrice || inStockOnly || currentSearch) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Categories filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Categories</h4>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center justify-between text-xs text-gray-300 hover:text-white cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat.slug}
                        onChange={() => handleCategoryChange(cat.slug)}
                        className="rounded border-[#2a2a3e] bg-[#0a0a0f] text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className={selectedCategory === cat.slug ? 'text-purple-400 font-bold' : ''}>
                        {cat.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3 pt-3 border-t border-[#2a2a3e]">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Price Range (PKR)</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-gray-500 mb-1 block">Min</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 mb-1 block">Max</span>
                  <input
                    type="number"
                    placeholder="1,000,000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* In stock toggle */}
            <div className="pt-3 border-t border-[#2a2a3e]">
              <label className="flex items-center justify-between text-xs text-gray-300 hover:text-white cursor-pointer">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[#2a2a3e] bg-[#0a0a0f] text-purple-600 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xs bg-[#12121a] border-l border-[#2a2a3e] p-5 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3e]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Filter className="w-4 h-4 text-purple-400" />
                      <span>Filter Options</span>
                    </h3>
                    <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Categories</h4>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2.5 text-xs text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedCategory === cat.slug}
                            onChange={() => handleCategoryChange(cat.slug)}
                            className="rounded border-[#2a2a3e] bg-[#0a0a0f] text-purple-600"
                          />
                          <span className={selectedCategory === cat.slug ? 'text-purple-400 font-bold' : ''}>
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-3 pt-3 border-t border-[#2a2a3e]">
                    <h4 className="text-xs font-bold text-gray-300 uppercase">Price Range</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min PKR"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-2 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="Max PKR"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#2a2a3e]">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      clearAllFilters();
                      setMobileFilterOpen(false);
                    }}
                    className="w-full py-2 bg-transparent text-gray-400 text-xs"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid & Pagination */}
        <main className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center mx-auto text-purple-400">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">No products found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No electronics matched your active filters or search keyword. Try adjusting price parameters or clearing filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                        : 'bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:text-white'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
