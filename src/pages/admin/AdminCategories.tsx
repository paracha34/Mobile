import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Edit2,
  FolderTree,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Category } from '../../types';
import { dbService } from '../../lib/supabase';
import { DynamicIcon } from '../../components/common/DynamicIcon';
import { useToast } from '../../context/ToastContext';

const COMMON_ICONS = [
  'Smartphone',
  'Headphones',
  'Watch',
  'Laptop',
  'Gamepad2',
  'Cable',
  'Speaker',
  'Tv',
  'Camera',
  'Cpu',
  'HardDrive',
  'Tablet',
];

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconName, setIconName] = useState('Smartphone');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAllCategories();
      setCategories(data);
    } catch (e) {
      console.error('Error fetching categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIconName('Smartphone');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setIconName(c.icon_name);
    setDisplayOrder(c.display_order);
    setIsActive(c.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    const payload: Partial<Category> = {
      id: editingCategory?.id,
      name: name.trim(),
      slug: slug.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      icon_name: iconName.trim() || 'Smartphone',
      display_order: Number(displayOrder),
      is_active: isActive,
    };

    const saved = await dbService.saveCategory(payload);
    await loadCategories();
    setIsModalOpen(false);
    showToast(`Category "${saved.name}" saved`, 'success');
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    await dbService.deleteCategory(deleteCandidate.id);
    setCategories((prev) => prev.filter((c) => c.id !== deleteCandidate.id));
    showToast(`Category removed`, 'info');
    setDeleteCandidate(null);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Store Categories</h2>
          <p className="text-xs text-gray-400">Manage shop product departments and visual icons</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1a1a2e] text-gray-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Icon</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Display Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3e]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Loading departments...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="w-9 h-9 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                        <DynamicIcon name={c.icon_name} className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-400">
                      {c.slug}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      #{c.display_order}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(c)}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                          title="Delete Category"
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

      {/* Delete Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Category?</h3>
              <p className="text-xs text-gray-400">
                Are you sure you want to remove "{deleteCandidate.name}"?
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#12121a] border border-[#2a2a3e] shadow-2xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3e]">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Smart Watches"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="smart-watches"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              {/* Icon Name with Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-300">
                    Lucide Icon Name *
                  </label>
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
                    <span>Live Preview:</span>
                    <DynamicIcon name={iconName} className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <input
                  type="text"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="e.g. Smartphone, Headphones, Watch"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_ICONS.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setIconName(icon)}
                      className={`px-2 py-1 rounded text-[10px] border ${
                        iconName === icon
                          ? 'border-purple-500 bg-purple-950/60 text-purple-300'
                          : 'border-[#2a2a3e] bg-[#0a0a0f] text-gray-400 hover:text-white'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
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
                    <span>Active in Store</span>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
