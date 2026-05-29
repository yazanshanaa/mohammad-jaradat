'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface Testimonial {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  rating: number;
  avatar?: string;
  location?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

const EMPTY: Omit<Testimonial, 'id' | 'createdAt'> = {
  nameAr: '', nameEn: '', titleAr: '', titleEn: '',
  contentAr: '', contentEn: '', rating: 5,
  avatar: '', location: '', isActive: true, isFeatured: false, sortOrder: 0,
};

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/admin/testimonials').then(r => r.json());
      setItems(Array.isArray(data) ? data : []);
    } catch { toast.error('خطأ في التحميل'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm({ ...EMPTY }); setEditId(null); setModal(true); };
  const openEdit = (row: Testimonial) => {
    setForm({
      nameAr: row.nameAr, nameEn: row.nameEn,
      titleAr: row.titleAr, titleEn: row.titleEn,
      contentAr: row.contentAr, contentEn: row.contentEn,
      rating: row.rating, avatar: row.avatar || '',
      location: row.location || '', isActive: row.isActive,
      isFeatured: row.isFeatured, sortOrder: row.sortOrder,
    });
    setEditId(row.id); setModal(true);
  };

  const save = async () => {
    if (!form.nameAr) { toast.error('الاسم بالعربي مطلوب'); return; }
    setSaving(true);
    try {
      const res = await fetch(editId ? `/api/admin/testimonials/${editId}` : '/api/admin/testimonials', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editId ? 'تم التحديث' : 'تمت الإضافة');
      setModal(false); load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطأ');
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/testimonials/${deleteId}`, { method: 'DELETE' });
      toast.success('تم الحذف'); setDeleteId(null); load();
    } catch { toast.error('خطأ'); }
    finally { setDeleting(false); }
  };

  const columns: Column<Testimonial>[] = [
    { key: 'nameAr', label: 'الاسم' },
    { key: 'titleAr', label: 'المسمى' },
    {
      key: 'rating', label: 'التقييم',
      render: (row) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5" fill={i < row.rating ? '#F5A623' : 'none'} stroke={i < row.rating ? '#F5A623' : '#d1d5db'} />
          ))}
        </div>
      ),
    },
    {
      key: 'isActive', label: 'الحالة',
      render: (row) => (
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: row.isActive ? '#ECFDF5' : '#F9FAFB', color: row.isActive ? '#10B981' : '#9CA3AF' }}>
          {row.isActive ? 'نشط' : 'مخفي'}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'التاريخ',
      render: (row) => new Date(row.createdAt).toLocaleDateString('ar-PS'),
    },
  ];

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقييمات والآراء</h1>
          <p className="text-sm text-gray-500">{items.length} تقييم</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button onClick={openAdd} className="gap-2 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
            <Plus className="h-4 w-4" />إضافة تقييم
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        onEdit={openEdit}
        onDelete={(row) => setDeleteId(row.id)}
        isLoading={loading}
      />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <h2 className="font-bold text-gray-900">{editId ? 'تعديل التقييم' : 'إضافة تقييم جديد'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">الاسم (عربي) *</Label>
                  <Input value={form.nameAr} onChange={e => f('nameAr', e.target.value)} placeholder="أحمد محمد" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">الاسم (إنجليزي)</Label>
                  <Input value={form.nameEn} onChange={e => f('nameEn', e.target.value)} placeholder="Ahmad Mohammad" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">المسمى (عربي)</Label>
                  <Input value={form.titleAr} onChange={e => f('titleAr', e.target.value)} placeholder="صاحب مشروع" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">المسمى (إنجليزي)</Label>
                  <Input value={form.titleEn} onChange={e => f('titleEn', e.target.value)} placeholder="Business Owner" dir="ltr" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">المحتوى (عربي)</Label>
                <textarea
                  value={form.contentAr}
                  onChange={e => f('contentAr', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-md resize-none"
                  style={{ border: '1px solid #e5e7eb' }}
                  placeholder="رأي العميل بالعربية..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">المحتوى (إنجليزي)</Label>
                <textarea
                  value={form.contentEn}
                  onChange={e => f('contentEn', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-md resize-none"
                  style={{ border: '1px solid #e5e7eb' }}
                  dir="ltr"
                  placeholder="Customer feedback in English..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">التقييم (1–5)</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => f('rating', n)}>
                        <Star className="h-6 w-6" fill={n <= form.rating ? '#F5A623' : 'none'} stroke={n <= form.rating ? '#F5A623' : '#d1d5db'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">الموقع</Label>
                  <Input value={form.location || ''} onChange={e => f('location', e.target.value)} placeholder="رام الله" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">رابط الصورة الشخصية</Label>
                <Input value={form.avatar || ''} onChange={e => f('avatar', e.target.value)} placeholder="https://..." dir="ltr" />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} />
                  نشط على الموقع
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => f('isFeatured', e.target.checked)} />
                  مميز (الرئيسية)
                </label>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)} disabled={saving}>إلغاء</Button>
              <Button onClick={save} disabled={saving} className="flex-1 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editId ? 'حفظ التغييرات' : 'إضافة')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="حذف التقييم"
        description="هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={del}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
