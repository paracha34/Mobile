import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Edit2,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Banner, BannerType } from '../../types';
import { dbService } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export const AdminBanners: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<BannerType>('hero');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonLink, setButtonLink] = useState('/products');
  const [bannerType, setBannerType] = useState<BannerType>('hero');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Banner | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const all = await dbService.getAllBannersAdmin();
      setBanners(all);
    } catch (e) {
      console.error('Error fetching admin banners:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenCreate();
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80');
    setButtonText('Shop Flagship');
    setButtonLink('/products');
    setBannerType(activeTab);
    setDisplayOrder(banners.filter((b) => b.banner_type === activeTab).length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setDescription(b.description);
    setImageUrl(b.image_url);
    setButtonText(b.button_text);
    setButtonLink(b.button_link);
    setBannerType(b.banner_type);
    setDisplayOrder(b.display_order);
    setIsActive(b.is_active);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await dbService.uploadFile('banners', file);
      setImageUrl(publicUrl);
      showToast('Banner image uploaded successfully', 'success');
    } catch {
      showToast('Error uploading banner image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      showToast('Title and banner image are required', 'error');
      return;
    }

    const payload: Partial<Banner> = {
      id: editingBanner?.id,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim(),
      image_url: imageUrl.trim(),
      button_text: buttonText.trim() || 'Shop Now',
      button_link: buttonLink.trim() || '/products',
      banner_type: bannerType,
      display_order: Number(displayOrder),
      is_active: isActive,
    };

    const saved = await dbService.saveBanner(payload);
    await loadBanners();
    setIsModalOpen(false);
    showToast(`Banner "${saved.title}" saved successfully`, 'success');
  };

  const handleToggleActive = async (b: Banner) => {
    const updated = await dbService.saveBanner({
      ...b,
      is_active: !b.is_active,
    });
    setBanners((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    showToast(`Banner status updated to ${updated.is_active ? 'Active' : 'Inactive'}`, 'info');
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    await dbService.deleteBanner(deleteCandidate.id);
    setBanners((prev) => prev.filter((b) => b.id !== deleteCandidate.id));
    showToast(`Banner removed`, 'info');
    setDeleteCandidate(null);
  };

  const filteredBanners = banners.filter((b) => b.banner_type === activeTab);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Promotions &amp; Banners Manager</h2>
          <p className="text-xs text-gray-400">Configure homepage carousel slides and promotional flash deal banners</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2a2a3e] pb-3">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'hero'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'bg-[#12121a] text-gray-400 hover:text-white'
          }`}
        >
          Hero Carousel Slides ({banners.filter((b) => b.banner_type === 'hero').length})
        </button>
        <button
          onClick={() => setActiveTab('promo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'promo'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'bg-[#12121a] text-gray-400 hover:text-white'
          }`}
        >
          Promotional Banners ({banners.filter((b) => b.banner_type === 'promo').length})
        </button>
      </div>

      {/* Banner Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-xs text-gray-400 py-8">Loading banners...</p>
        ) : filteredBanners.length === 0 ? (
          <div className="col-span-2 rounded-2xl bg-[#12121a] border border-[#2a2a3e] p-12 text-center text-gray-400">
            No banners configured for this section. Click "Add New Banner" to create one.
          </div>
        ) : (
          filteredBanners.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] overflow-hidden flex flex-col justify-between shadow-xl"
            >
              {/* Preview image */}
              <div className="h-44 bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center p-4">
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[10px] font-bold text-purple-300">
                  Order: #{b.display_order}
                </span>
                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    b.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700/60 text-gray-400'
                  }`}
                >
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Info */}
              <div className="p-5 space-y-2">
                {b.subtitle && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    {b.subtitle}
                  </span>
                )}
                <h3 className="text-sm font-bold text-white line-clamp-1">{b.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{b.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs text-purple-300">
                  <span className="flex items-center gap-1 font-semibold">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {b.button_text} → {b.button_link}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-[#2a2a3e] bg-[#1a1a2e]/50 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    b.is_active
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {b.is_active ? 'Active on Store' : 'Inactive'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(b)}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Candidate Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Banner?</h3>
              <p className="text-xs text-gray-400">
                Are you sure you want to remove "{deleteCandidate.title}"?
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
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl my-8 rounded-3xl bg-[#12121a] border border-[#2a2a3e] shadow-2xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3e]">
              <h3 className="text-base font-bold text-white">
                {editingBanner ? 'Edit Banner' : 'Add New Promotional Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Banner Type *</label>
                <select
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value as BannerType)}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="hero">Hero Carousel Banner (Top of Homepage)</option>
                  <option value="promo">Promotional Banner (Midpage Flash Offer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Titanium Innovation: Galaxy S25 Ultra"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Subtitle / Badge</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. LIMITED TIME OFFER / OFFICIAL LAUNCH"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description *</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Engaging summary of the deal or specs"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Shop Now"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="/products?filter=trending"
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-medium text-gray-300">
                  Banner Graphic Image (Supabase Storage: bucket "banners")
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL or upload"
                    className="flex-1 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                  <label className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-[#2a2a3e] bg-[#0a0a0f] text-purple-600"
                    />
                    <span>Active in Storefront</span>
                  </label>
                </div>
              </div>

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
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
