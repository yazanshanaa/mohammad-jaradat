'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import Link from 'next/link';

const EMPTY: any = {
  slug: '', titleAr: '', titleEn: '', excerptAr: '', excerptEn: '',
  contentAr: '', contentEn: '', coverImage: '', category: 'عام',
  readingTime: '5', isPublished: false,
};

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPosts(await (await fetch('/api/admin/blog')).json()); }
    catch { toast.error('خطا في التحميل'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (p: any) => {
    setForm({ slug: p.slug, titleAr: p.titleAr, titleEn: p.titleEn || '', excerptAr: p.excerptAr || '',
      excerptEn: p.excerptEn || '', contentAr: p.contentAr || '', contentEn: p.contentEn || '',
      coverImage: p.coverImage || '', category: p.category, readingTime: String(p.readingTime), isPublished: p.isPublished });
    setEditId(p.id); setModal(true);
  };

  const save = async () => {
    if (!form.titleAr || !form.slug) { toast.error('العنوان والمعرف مطلوبان'); return; }
    setSaving(true);
    try {
      const r = await fetch(editId ? `/api/admin/blog/${editId}` : '/api/admin/blog', {
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
    await fetch(`/api/admin/blog/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !cur }),
    });
    toast.success(!cur ? 'تم النشر' : 'تم التحويل لمسودة'); load();
  };

  const del = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      await fetch(`/api/admin/blog/${deleteId}`, { method: 'DELETE' });
      toast.success('تم الحذف'); setDeleteId(null); load();
    } catch { toast.error('خطا'); }
    finally { setDeleting(false); }
  };

  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المقالات</h1>
          <p className="text-sm text-gray-500">{posts.length} مقالة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button onClick={openAdd} className="gap-2 text-white font-semibold" style={{ backgroundColor: '#3B82F6' }}>
            <Plus className="h-4 w-4" />مقالة جديدة
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        {loading ? <div className="py-16 text-center text-gray-400">جاري التحميل...</div> :
        posts.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">لا توجد مقالات بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['العنوان', 'الفئة', 'وقت القراءة', 'الحالة', 'التاريخ', 'إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50" style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.titleAr}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.excerptAr}</div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>{p.category}</span></td>
                    <td className="px-4 py-3 text-gray-500">{p.readingTime} دقيقة</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(p.id, p.isPublished)}
                        className="text-xs px-2 py-0.5 rounded-full font-medium border"
                        style={{ backgroundColor: p.isPublished ? '#ECFDF5' : '#FFFBEB', color: p.isPublished ? '#10B981' : '#D97706', borderColor: p.isPublished ? '#10B981' : '#D97706' }}>
                        {p.isPublished ? 'منشور' : 'مسودة'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString('ar')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.isPublished && <Link href={`/ar/blog/${p.slug}`} target="_blank" className="text-blue-400 hover:text-blue-600"><Eye className="h-4 w-4" /></Link>}
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <h2 className="font-bold text-gray-900">{editId ? 'تعديل المقالة' : 'مقالة جديدة'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">x</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-sm font-medium">العنوان (عربي)</Label><Input value={form.titleAr} onChange={e => f('titleAr', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">العنوان (انجليزي)</Label><Input value={form.titleEn} onChange={e => f('titleEn', e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">المعرف</Label><Input value={form.slug} onChange={e => f('slug', e.target.value)} dir="ltr" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-sm font-medium">الفئة</Label><Input value={form.category} onChange={e => f('category', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">وقت القراءة (دقيقة)</Label><Input type="number" value={form.readingTime} onChange={e => f('readingTime', e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">ملخص قصير (عربي)</Label><Input value={form.excerptAr} onChange={e => f('excerptAr', e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">ملخص قصير (انجليزي)</Label><Input value={form.excerptEn} onChange={e => f('excerptEn', e.target.value)} dir="ltr" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">المحتوى (عربي)</Label><textarea value={form.contentAr} onChange={e => f('contentAr', e.target.value)} rows={6} className="w-full px-3 py-2 text-sm rounded-md resize-none" style={{ border: '1px solid #e5e7eb' }} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">المحتوى (انجليزي)</Label><textarea value={form.contentEn} onChange={e => f('contentEn', e.target.value)} rows={6} className="w-full px-3 py-2 text-sm rounded-md resize-none" style={{ border: '1px solid #e5e7eb' }} dir="ltr" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">رابط الصورة</Label><Input value={form.coverImage} onChange={e => f('coverImage', e.target.value)} dir="ltr" /></div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.isPublished} onChange={e => f('isPublished', e.target.checked)} />
                نشر المقالة (ستظهر على الموقع)
              </label>
            </div>
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)} disabled={saving}>الغاء</Button>
              <Button onClick={save} disabled={saving} className="flex-1 text-white font-semibold" style={{ backgroundColor: '#3B82F6' }}>
                {saving ? 'جاري الحفظ...' : (editId ? 'حفظ' : 'اضافة')}
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteId} title="حذف المقالة" description="هل انت متاكد من الحذف؟" onConfirm={del} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
