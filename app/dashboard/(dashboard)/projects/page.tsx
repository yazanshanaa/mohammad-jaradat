'use client';

import { useState, useEffect, useCallback } from 'react';
import { FolderOpen, Plus, Eye, Pencil, Trash2, RefreshCw, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import Link from 'next/link';

const CAT_OPTIONS = [
  { value: 'RESIDENTIAL', label: 'منزلي' },
  { value: 'COMMERCIAL', label: 'تجاري' },
  { value: 'INDUSTRIAL', label: 'صناعي' },
  { value: 'AGRICULTURAL', label: 'زراعي' },
];

const EMPTY: any = {
  slug: '', titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', category: 'RESIDENTIAL',
  location: '', powerKw: '5', panelsCount: '10', completionDate: new Date().toISOString().split('T')[0],
  annualSavingIls: '0', coverImage: '', isActive: true, isFeatured: false, clientName: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProjects(await (await fetch('/api/admin/projects')).json()); }
    catch { toast.error('خطا في التحميل'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (p: any) => {
    setForm({
      slug: p.slug, titleAr: p.titleAr, titleEn: p.titleEn || '', descriptionAr: p.descriptionAr || '',
      descriptionEn: p.descriptionEn || '', category: p.category, location: p.location, powerKw: String(p.powerKw),
      panelsCount: String(p.panelsCount), completionDate: new Date(p.completionDate).toISOString().split('T')[0],
      annualSavingIls: String(p.annualSavingIls), coverImage: p.coverImage || '',
      isActive: p.isActive, isFeatured: p.isFeatured, clientName: p.clientName || '',
    });
    setEditId(p.id); setModal(true);
  };

  const save = async () => {
    if (!form.titleAr || !form.slug || !form.location) { toast.error('العنوان والمعرف والموقع مطلوبة'); return; }
    setSaving(true);
    try {
      const r = await fetch(editId ? `/api/admin/projects/${editId}` : '/api/admin/projects', {
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
    try {
      const r = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cur }),
      });
      if (!r.ok) throw new Error();
      toast.success(!cur ? 'تم الاظهار' : 'تم الاخفاء'); load();
    } catch { toast.error('خطا في تغيير الحالة'); }
  };

  const del = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      const r = await fetch(`/api/admin/projects/${deleteId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      toast.success('تم الحذف'); setDeleteId(null); load();
    } catch { toast.error('خطا في الحذف'); }
    finally { setDeleting(false); }
  };

  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المشاريع</h1>
          <p className="text-sm text-gray-500">{projects.length} مشروع</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button onClick={openAdd} className="gap-2 text-white font-semibold" style={{ backgroundColor: '#8B5CF6' }}>
            <Plus className="h-4 w-4" />اضافة مشروع
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        {loading ? <div className="py-16 text-center text-gray-400">جاري التحميل...</div> :
        projects.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">لا توجد مشاريع بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['المشروع', 'التصنيف', 'الموقع', 'القدرة', 'الوفر السنوي', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50" style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.titleAr}</td>
                    <td className="px-4 py-3 text-xs">{CAT_OPTIONS.find(c => c.value === p.category)?.label}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-500 text-xs"><MapPin className="h-3 w-3" />{p.location}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-amber-600 font-semibold text-xs"><Zap className="h-3 w-3" />{p.powerKw} kW</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600 text-xs">RS{Number(p.annualSavingIls).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(p.id, p.isActive)}
                        className="text-xs px-2 py-0.5 rounded-full font-medium border"
                        style={{ backgroundColor: p.isActive ? '#ECFDF5' : '#F9FAFB', color: p.isActive ? '#10B981' : '#9CA3AF', borderColor: p.isActive ? '#10B981' : '#E5E7EB' }}>
                        {p.isActive ? 'نشط' : 'مخفي'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/ar/projects/${p.slug}`} target="_blank" className="text-blue-400 hover:text-blue-600"><Eye className="h-4 w-4" /></Link>
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
              <h2 className="font-bold text-gray-900">{editId ? 'تعديل المشروع' : 'اضافة مشروع جديد'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">x</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <div className="space-y-1.5"><Label className="text-sm font-medium">العنوان</Label><Input value={form.titleAr} onChange={e => f('titleAr', e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">المعرف</Label><Input value={form.slug} onChange={e => f('slug', e.target.value)} dir="ltr" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">التصنيف</Label>
                  <select value={form.category} onChange={e => f('category', e.target.value)} className="w-full h-10 px-3 text-sm rounded-md" style={{ border: '1px solid #e5e7eb' }}>
                    {CAT_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">الموقع</Label><Input value={form.location} onChange={e => f('location', e.target.value)} placeholder="رام الله" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-sm font-medium">القدرة (kW)</Label><Input type="number" step="0.5" value={form.powerKw} onChange={e => f('powerKw', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">عدد الالواح</Label><Input type="number" value={form.panelsCount} onChange={e => f('panelsCount', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">الوفر السنوي</Label><Input type="number" value={form.annualSavingIls} onChange={e => f('annualSavingIls', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-sm font-medium">تاريخ الانجاز</Label><Input type="date" value={form.completionDate} onChange={e => f('completionDate', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">اسم العميل</Label><Input value={form.clientName} onChange={e => f('clientName', e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">الوصف</Label><textarea value={form.descriptionAr} onChange={e => f('descriptionAr', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-md resize-none" style={{ border: '1px solid #e5e7eb' }} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium">رابط الصورة</Label><Input value={form.coverImage} onChange={e => f('coverImage', e.target.value)} dir="ltr" /></div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} />نشط</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => f('isFeatured', e.target.checked)} />مميز</label>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)} disabled={saving}>الغاء</Button>
              <Button onClick={save} disabled={saving} className="flex-1 text-white font-semibold" style={{ backgroundColor: '#8B5CF6' }}>
                {saving ? 'جاري الحفظ...' : (editId ? 'حفظ' : 'اضافة')}
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteId} title="حذف المشروع" description="هل انت متاكد من الحذف؟" onConfirm={del} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
