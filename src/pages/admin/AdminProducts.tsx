import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  Edit2,
  Image as ImageIcon,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { BadgeColor, Category, Product } from '../../types';
import { dbService } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [badgeLabel, setBadgeLabel] = useState('');
  const [badgeColor, setBadgeColor] = useState<BadgeColor>('green');
  const [rating, setRating] = useState<number>(5.0);
  const [reviewCount, setReviewCount] = useState<number>(10);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [specRows, setSpecRows] = useState<{ key: string; val: string }[]>([
    { key: 'Processor', val: '' },
    { key: 'Display', val: '' },
  ]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        dbService.getAllProductsAdmin(),
        dbService.getAllCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error('Error fetching admin products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle ?action=add query param
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenCreate();
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingProduct) {
      // Auto slug
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setShortDesc('');
    setFullDesc('');
    setPrice(0);
    setOriginalPrice(undefined);
    setCategoryId(categories[0]?.id || '');
    setStock(10);
    setBadgeLabel('');
    setBadgeColor('green');
    setRating(5.0);
    setReviewCount(1);
    setIsFeatured(false);
    setIsTrending(false);
    setIsActive(true);
    setImages([]);
    setSpecRows([
      { key: 'Display', val: 'OLED 120Hz' },
      { key: 'Battery', val: '5000 mAh' },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setShortDesc(prod.short_description);
    setFullDesc(prod.full_description);
    setPrice(prod.price);
    setOriginalPrice(prod.original_price);
    setCategoryId(prod.category_id);
    setStock(prod.stock_quantity);
    setBadgeLabel(prod.badge_label || '');
    setBadgeColor(prod.badge_color || 'green');
    setRating(prod.rating);
    setReviewCount(prod.review_count);
    setIsFeatured(prod.is_featured);
    setIsTrending(prod.is_trending);
    setIsActive(prod.is_active);
    setImages(prod.images || []);

    const specs = Object.entries(prod.specifications || {}).map(([key, val]) => ({
      key,
      val,
    }));
    setSpecRows(specs.length > 0 ? specs : [{ key: 'Feature', val: 'Value' }]);
    setIsModalOpen(true);
  };

  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await dbService.uploadFile('product-images', file);
        newUrls.push(url);
      }
      setImages((prev) => [...prev, ...newUrls]);
      showToast(`Uploaded ${newUrls.length} product image(s)`, 'success');
    } catch {
      showToast('Error uploading images', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpecRow = () => {
    setSpecRows((prev) => [...prev, { key: '', val: '' }]);
  };

  const handleRemoveSpecRow = (idx: number) => {
    setSpecRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleActive = async (prod: Product) => {
    const updated = await dbService.saveProduct({
      ...prod,
      is_active: !prod.is_active,
    });
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Product "${updated.name}" is now ${updated.is_active ? 'Active' : 'Hidden'}`, 'info');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    const specifications: Record<string, string> = {};
    specRows.forEach((row) => {
      if (row.key.trim()) specifications[row.key.trim()] = row.val.trim();
    });

    const payload: Partial<Product> = {
      id: editingProduct?.id,
      name: name.trim(),
      slug: slug.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      short_description: shortDesc.trim(),
      full_description: fullDesc.trim(),
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : undefined,
      category_id: categoryId || categories[0]?.id || 'cat-1',
      stock_quantity: Number(stock),
      badge_label: badgeLabel.trim() || undefined,
      badge_color: badgeColor,
      rating: Number(rating),
      review_count: Number(reviewCount),
      is_featured: isFeatured,
      is_trending: isTrending,
      is_active: isActive,
      images: images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      ],
      specifications,
    };

    const saved = await dbService.saveProduct(payload);
    await loadData();
    setIsModalOpen(false);
    showToast(`Product "${saved.name}" successfully saved`, 'success');
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    await dbService.deleteProduct(deleteCandidate.id);
    setProducts((prev) => prev.filter((p) => p.id !== deleteCandidate.id));
    showToast(`Product "${deleteCandidate.name}" removed`, 'info');
    setDeleteCandidate(null);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Product Inventory Catalog</h2>
          <p className="text-xs text-gray-400">Add, edit, or adjust inventory quantities and pricing</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="bg-[#12121a] border border-[#2a2a3e] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1a1a2e] text-gray-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Thumbnail</th>
                <th className="py-3 px-4">Name &amp; Slug</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (PKR)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3e]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Loading product inventory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No products matched your search.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-lg bg-[#0a0a0f] border border-[#2a2a3e] overflow-hidden">
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80'}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white max-w-xs truncate">{prod.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{prod.slug}</p>
                    </td>
                    <td className="py-3 px-4 text-purple-300 font-medium">
                      {prod.category?.name || 'Smartphones'}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      PKR {prod.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${prod.stock_quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {prod.stock_quantity} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {prod.badge_label && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-950/60 text-purple-300 border border-purple-500/40">
                            {prod.badge_label}
                          </span>
                        )}
                        {prod.is_trending && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-950/60 text-amber-300 border border-amber-500/40">
                            Trending
                          </span>
                        )}
                        {prod.is_featured && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-950/60 text-blue-300 border border-blue-500/40">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                          prod.is_active ? 'bg-purple-600' : 'bg-gray-700'
                        }`}
                        title="Toggle Active Status"
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white block transition-transform ${
                            prod.is_active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(prod)}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Product?</h3>
              <p className="text-xs text-gray-400">
                Are you sure you want to remove <span className="text-white font-semibold">"{deleteCandidate.name}"</span>? This action is permanent.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="py-2.5 rounded-xl bg-[#12121a] border border-[#2a2a3e] text-xs font-semibold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-900/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl my-8 rounded-3xl bg-[#12121a] border border-[#2a2a3e] shadow-2xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a3e]">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Electronics Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Galaxy S25 Ultra"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Slug (Auto-generated) *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="galaxy-s25-ultra"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Original Price (Optional strikethrough)
                  </label>
                  <input
                    type="number"
                    value={originalPrice ?? ''}
                    onChange={(e) => setOriginalPrice(e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="e.g. 520000"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock, Rating, Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Badge Label</label>
                  <input
                    type="text"
                    value={badgeLabel}
                    onChange={(e) => setBadgeLabel(e.target.value)}
                    placeholder="BESTSELLER"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Badge Color</label>
                  <select
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value as BadgeColor)}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="green">Green (Bestseller)</option>
                    <option value="orange">Orange (Trending)</option>
                    <option value="blue">Blue (Popular)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Quick highlight specs summary"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    value={fullDesc}
                    onChange={(e) => setFullDesc(e.target.value)}
                    placeholder="Comprehensive overview of features, battery life, cameras, and connectivity"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-[#2a2a3e] bg-[#0a0a0f] text-purple-600"
                  />
                  <span>Is Featured</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="rounded border-[#2a2a3e] bg-[#0a0a0f] text-purple-600"
                  />
                  <span>Is Trending</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-[#2a2a3e] bg-[#0a0a0f] text-purple-600"
                  />
                  <span>Is Active (Visible in Store)</span>
                </label>
              </div>

              {/* Image Upload: Supabase Storage bucket 'product-images' */}
              <div className="space-y-3 pt-4 border-t border-[#2a2a3e]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">
                    Product Images (Supabase Storage: bucket "product-images")
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFilesUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl bg-[#0a0a0f] border border-[#2a2a3e] overflow-hidden group">
                      <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length === 0 && (
                    <p className="text-xs text-gray-500">No images added. Upload files or default image will be applied.</p>
                  )}
                </div>
              </div>

              {/* Specifications Key-Value rows */}
              <div className="space-y-3 pt-4 border-t border-[#2a2a3e]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">
                    Technical Specifications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {specRows.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Key (e.g. Processor)"
                        value={row.key}
                        onChange={(e) => {
                          const updated = [...specRows];
                          updated[idx].key = e.target.value;
                          setSpecRows(updated);
                        }}
                        className="w-1/3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Snapdragon 8 Elite)"
                        value={row.val}
                        onChange={(e) => {
                          const updated = [...specRows];
                          updated[idx].val = e.target.value;
                          setSpecRows(updated);
                        }}
                        className="flex-1 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="p-1.5 text-gray-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a3e]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1a1a2e] text-xs font-semibold text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-900/30"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
