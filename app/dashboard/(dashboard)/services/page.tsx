'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wrench, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const EMPTY: any = {
  slug: '', titleAr: '', titleEn: '', shortDescAr: '', shortDescEn: '',
  descriptionAr: '', descriptionEn: '', icon: 'Zap', isActive: true, sortOrder: '0',
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setServices(await (await fetch('/api/admin/services')).json()); }
    catch { toast.error('خطا في التحميل'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (s: any) => {
    setForm({ slug: s.slug, titleAr: s.titleAr, titleEn: s.titleEn || '', shortDescAr: s.shortDescAr || '',
      shortDescEn: s.shortDescEn || '', descriptionAr: s.descriptionAr || '', descriptionEn: s.descriptionEn || '',
      icon: s.icon || 'Zap', isActive: s.isActive, sortOrder: String(s.sortOrder) });
    setEditId(s.id); setModal(true);
  };

  const save = async () => {
    if (!form.titleAr || !form.slug) { toast.error('العنوان والمعرف مطلوبان'); return; }
    setSaving(true);
    try {
      const r = await fetch(editId ? `/api/admin/services/${editId}` : '/api/admin/services', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success(editId ? 'تم التحديث' : 'تمت الاضافة');
      setModal(false); load();
    } catch (e: any) { toast.error(e.message || 'خطا'); }
    finally { setSaving(false); }
  };

  const toggle = async (id: string, cur: boolean) => {
    await fetch(`/api/admin/services/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !cur }),
    });
    toast.success(!cur ? 'تم الاظهار' : 'تم الاخفاء'); load();
  };

  const del = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      await fetch(`/api/admin/services/${deleteId}`, { method: 'DELETE' });
      toast.success('تم الحذف'); setDeleteId(null); load();
    } catch { toast.error('خطا'); }
    finally { setDeleting(false); }
  };

  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الخدمات</h1>
          <p className="text-sm text-gray-500">{services.length} خدمة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button onClick={openAdd} className="gap-2 text-white font-semibold" style={{ backgroundColor: '#10B981' }}>
            <Plus className="h-4 w-4" />اضافة خدمة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? <div className="col-span-full py-16 text-center text-gray-400">جاري التحميل...</div> :
        services.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#FFF7ED' }}>
              <Wrench className="h-5 w-5" style={{ color: '#F5A623' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-sm">{s.titleAr}</h3>
                <button onClick={() => toggle(s.id, s.isActive)}
                  className="text-xs px-2 py-0.5 rounded-full font-medium border shrink-0"
                  style={{ backgroundColor: s.isActive ? '#ECFDF5' : '#F9FAFB', color: s.isActive ? '#10B981' : '#9CA3AF', borderColor: s.isActive ? '#10B981' : '#E5E7EB' }}>
                  {s.isActive ? 'نشط' : 'مخفي'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{s.shortDescAr}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                  <Pencil className="h-3.5 w-3.5" />تعديل
                </button>
                <button onClick={() => setDeleteId(s.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />حذف
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && services.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #e5e7eb' }}>
            <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">لا توجد خدمات.</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <h2 className="font-bold text-gray-900">{editId ? 'تعديل الخدمة' : 'اضافة خدمة جديدة'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">x</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-sm font-medium">العنوان (عربي)</Label><Input value={form.titleAr} onChange={e => f('titleAr', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">العنوان (انجليزي)</Label><Input value={form.titleEn} onChange={e => f('titleEn', e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">المعرف</Label><Input value={form.slug} onChange={e => f('slug', e.target.value)} dir="ltr" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">وصف مختصر (عربي)</Label><Input value={form.shortDescAr} onChange={e => f('shortDescAr', e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">وصف مختصر (انجليزي)</Label><Input value={form.shortDescEn} onChange={e => f('shortDescEn', e.target.value)} dir="ltr" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">الوصف الكامل (عربي)</Label><textarea value={form.descriptionAr} onChange={e => f('descriptionAr', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-md resize-none" style={{ border: '1px solid #e5e7eb' }} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">الوصف الكامل (انجليزي)</Label><textarea value={form.descriptionEn} onChange={e => f('descriptionEn', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-md resize-none" style={{ border: '1px solid #e5e7eb' }} dir="ltr" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">ايقونة (اسم Lucide)</Label><Input value={form.icon} onChange={e => f('icon', e.target.value)} placeholder="Zap" dir="ltr" /></div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} />نشط</label>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)} disabled={saving}>الغاء</Button>
              <Button onClick={save} disabled={saving} className="flex-1 text-white font-semibold" style={{ backgroundColor: '#10B981' }}>
                {saving ? 'جاري الحفظ...' : (editId ? 'حفظ' : 'اضافة')}
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteId} title="حذف الخدمة" description="هل انت متاكد من الحذف؟" onConfirm={del} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
