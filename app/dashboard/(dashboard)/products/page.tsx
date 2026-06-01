'use client';

import { useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { ShoppingBag, Plus, Eye, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import Link from 'next/link';

const EMPTY: any = {
  slug: '', nameAr: '', descriptionAr: '', price: '', showPrice: true,
  coverImage: '', images: [], category: '', isActive: true, isFeatured: false,
  sortOrder: '0', stock: '', features: [],
};

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await (await fetch('/api/admin/products')).json()); }
    catch { toast.error('خطأ في التحميل'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ ...EMPTY, features: [], images: [] }); setEditId(null); setModal(true); setNewFeature(''); setNewImage(''); };
  const openEdit = (p: any) => {
    setForm({
      slug: p.slug, nameAr: p.nameAr, descriptionAr: p.descriptionAr || '',
      price: String(p.price), showPrice: p.showPrice,
      coverImage: p.coverImage || '', images: Array.isArray(p.images) ? p.images : [],
      category: p.category || '', isActive: p.isActive, isFeatured: p.isFeatured,
      sortOrder: String(p.sortOrder), stock: p.stock != null ? String(p.stock) : '',
      features: Array.isArray(p.features) ? p.features : [],
    });
    setEditId(p.id); setModal(true); setNewFeature(''); setNewImage('');
  };

  const save = async () => {
    if (!form.nameAr || !form.slug) { toast.error('الاسم والمعرف مطلوبان'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        sortOrder: Number(form.sortOrder) || 0,
        stock: form.stock !== '' ? Number(form.stock) : null,
      };
      const r = await fetch(editId ? `/api/admin/products/${editId}` : '/api/admin/products', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success(editId ? 'تم التحديث' : 'تمت الإضافة');
      setModal(false); load();
    } catch (e: any) { toast.error(e.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const toggle = async (id: string, cur: boolean) => {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cur }),
      });
      toast.success(!cur ? 'تم الإظهار' : 'تم الإخفاء'); load();
    } catch { toast.error('خطأ في تغيير الحالة'); }
  };

  const del = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      const r = await fetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      toast.success('تم الحذف'); setDeleteId(null); load();
    } catch { toast.error('خطأ في الحذف'); }
    finally { setDeleting(false); }
  };

  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm((p: any) => ({ ...p, features: [...p.features, newFeature.trim()] }));
    setNewFeature('');
  };

  const addImage = () => {
    if (!newImage.trim()) return;
    setForm((p: any) => ({ ...p, images: [...p.images, newImage.trim()] }));
    setNewImage('');
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
          <p className="text-sm text-gray-500">{products.length} منتج</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button onClick={openAdd} className="gap-2 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
            <Plus className="h-4 w-4" />إضافة منتج
          </Button>
        </div>
      </div>

      {loading ? <div className="py-16 text-center text-gray-400">جاري التحميل...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="h-36 relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
                {p.coverImage ? (
                  <NextImage src={p.coverImage} alt={p.nameAr} fill className="object-cover" unoptimized />
                ) : (
                  <ShoppingBag className="h-14 w-14 text-amber-200" />
                )}
                <button onClick={() => toggle(p.id, p.isActive)}
                  className="absolute top-2 end-2 text-xs px-2.5 py-1 rounded-full font-medium border z-10"
                  style={{ backgroundColor: p.isActive ? '#ECFDF5' : '#F9FAFB', color: p.isActive ? '#10B981' : '#9CA3AF', borderColor: p.isActive ? '#10B981' : '#E5E7EB' }}>
                  {p.isActive ? 'نشط' : 'مخفي'}
                </button>
                {p.isFeatured && (
                  <span className="absolute top-2 start-2 text-xs px-2 py-0.5 rounded-full font-medium z-10" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                    ⭐ مميز
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">{p.nameAr}</h3>
                {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                {p.showPrice ? (
                  <p className="text-sm font-bold" style={{ color: '#F5A623' }}>₪{p.price.toFixed(2)}</p>
                ) : (
                  <p className="text-xs text-gray-400 italic">السعر مخفي</p>
                )}
                <p className="text-xs text-gray-400">
                  {p._count?.orderItems ?? 0} طلب | {p.stock != null ? `مخزون: ${p.stock}` : 'غير محدود'}
                </p>
                <div className="flex gap-1 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <Link href={`/store/${p.slug}`} target="_blank" className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-blue-500 hover:bg-blue-50 rounded-lg">
                    <Eye className="h-3.5 w-3.5" />عرض
                  </Link>
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Pencil className="h-3.5 w-3.5" />تعديل
                  </button>
                  <button onClick={() => setDeleteId(p.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-3.5 w-3.5" />حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #e5e7eb' }}>
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">لا توجد منتجات. أضف منتجك الأول.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <h2 className="font-bold text-gray-900">{editId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '72vh' }}>
              {/* اسم المنتج */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">اسم المنتج *</Label>
                <Input value={form.nameAr} onChange={e => f('nameAr', e.target.value)} placeholder="اسم المنتج" />
              </div>

              {/* المعرف */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">المعرف في الرابط *</Label>
                <Input value={form.slug} onChange={e => f('slug', e.target.value)} placeholder="product-name" dir="ltr" />
              </div>

              {/* التصنيف */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">التصنيف</Label>
                <Input value={form.category} onChange={e => f('category', e.target.value)} placeholder="مثال: إكسسوارات، أدوات..." />
              </div>

              {/* السعر والمخزون */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">السعر (₪)</Label>
                  <Input type="number" step="0.01" min="0" value={form.price} onChange={e => f('price', e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">المخزون (اتركه فارغاً = غير محدود)</Label>
                  <Input type="number" min="0" value={form.stock} onChange={e => f('stock', e.target.value)} placeholder="غير محدود" />
                </div>
              </div>

              {/* إظهار السعر */}
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <div>
                  <p className="text-sm font-medium text-gray-900">إظهار السعر للزوار</p>
                  <p className="text-xs text-gray-500">عند الإيقاف، سيظهر "اتصل للسعر" بدل السعر</p>
                </div>
                <button type="button" onClick={() => f('showPrice', !form.showPrice)}
                  className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                  style={{ backgroundColor: form.showPrice ? '#F5A623' : '#D1D5DB' }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                    style={{ right: form.showPrice ? '4px' : '28px' }} />
                </button>
              </div>

              {/* الوصف */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">الوصف</Label>
                <textarea value={form.descriptionAr} onChange={e => f('descriptionAr', e.target.value)}
                  rows={3} className="w-full px-3 py-2 text-sm rounded-md resize-none" style={{ border: '1px solid #e5e7eb' }} />
              </div>

              {/* صورة الغلاف */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">رابط صورة الغلاف</Label>
                <Input value={form.coverImage} onChange={e => f('coverImage', e.target.value)} placeholder="https://..." dir="ltr" />
                {form.coverImage && (
                  <div className="relative h-20 w-32 mt-1 rounded-lg overflow-hidden">
                    <NextImage src={form.coverImage} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* صور إضافية */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">صور إضافية</Label>
                <div className="flex gap-2">
                  <Input value={newImage} onChange={e => setNewImage(e.target.value)}
                    placeholder="https://..." dir="ltr" className="flex-1 h-9 text-sm"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }} />
                  <Button type="button" size="sm" onClick={addImage} variant="outline">إضافة</Button>
                </div>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {form.images.map((img: string, i: number) => (
                      <div key={i} className="relative h-12 w-12 rounded-lg overflow-hidden group">
                        <NextImage src={img} alt="" fill className="object-cover" unoptimized />
                        <button type="button" onClick={() => setForm((p: any) => ({ ...p, images: p.images.filter((_: any, idx: number) => idx !== i) }))}
                          className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* المزايا */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">مزايا المنتج</Label>
                <div className="flex gap-2">
                  <Input value={newFeature} onChange={e => setNewFeature(e.target.value)}
                    placeholder="اكتب ميزة واضغط إضافة" className="flex-1 h-9 text-sm"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }} />
                  <Button type="button" size="sm" onClick={addFeature} variant="outline">إضافة</Button>
                </div>
                <div className="space-y-1">
                  {form.features.map((feat: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                      <span className="text-sm flex-1 text-gray-700">{feat}</span>
                      <button type="button" onClick={() => setForm((p: any) => ({ ...p, features: p.features.filter((_: any, idx: number) => idx !== i) }))}
                        className="text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* الخيارات */}
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} />
                  نشط في المتجر
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => f('isFeatured', e.target.checked)} />
                  منتج مميز
                </label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">ترتيب العرض</Label>
                <Input type="number" min="0" value={form.sortOrder} onChange={e => f('sortOrder', e.target.value)} className="w-24" />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)} disabled={saving}>إلغاء</Button>
              <Button onClick={save} disabled={saving} className="flex-1 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
                {saving ? 'جاري الحفظ...' : (editId ? 'حفظ التغييرات' : 'إضافة')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="حذف المنتج"
        description="هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={del} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
