'use client';

import { useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { Zap, Plus, Eye, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import Link from 'next/link';

const TYPE_OPTIONS = [
  { value: 'ON_GRID', label: 'متصل بالشبكة' },
  { value: 'OFF_GRID', label: 'مستقل' },
  { value: 'HYBRID', label: 'هجين' },
  { value: 'AGRICULTURAL', label: 'زراعي' },
  { value: 'COMMERCIAL', label: 'تجاري' },
];

const EMPTY: any = {
  slug: '', titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
  type: 'ON_GRID', minPower: '3', maxPower: '10', pricePerWatt: '4.5',
  coverImage: '', isActive: true, isFeatured: false, sortOrder: '0',
  features: [], specs: {},
};

export default function SystemsPage() {
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setSystems(await (await fetch('/api/admin/systems')).json()); }
    catch { toast.error('خطأ في التحميل'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ ...EMPTY, features: [], specs: {} }); setEditId(null); setModal(true); };
  const openEdit = (s: any) => {
    setForm({
      slug: s.slug, titleAr: s.titleAr, titleEn: s.titleEn || '',
      descriptionAr: s.descriptionAr || '', descriptionEn: s.descriptionEn || '',
      type: s.type, minPower: String(s.minPower), maxPower: String(s.maxPower),
      pricePerWatt: String(s.pricePerWatt), coverImage: s.coverImage || '',
      isActive: s.isActive, isFeatured: s.isFeatured, sortOrder: String(s.sortOrder),
      features: Array.isArray(s.features) ? s.features : [],
      specs: (s.specs && typeof s.specs === 'object') ? s.specs : {},
    });
    setEditId(s.id); setModal(true);
  };

  const save = async () => {
    if (!form.titleAr || !form.slug) { toast.error('العنوان والمعرف مطلوبان'); return; }
    setSaving(true);
    try {
      const r = await fetch(editId ? `/api/admin/systems/${editId}` : '/api/admin/systems', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success(editId ? 'تم التحديث' : 'تمت الإضافة');
      setModal(false); load();
    } catch (e: any) { toast.error(e.message || 'خطأ'); }
    finally { setSaving(false); }
  };

  const toggle = async (id: string, cur: boolean) => {
    try {
      const r = await fetch(`/api/admin/systems/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cur }),
      });
      if (!r.ok) throw new Error();
      toast.success(!cur ? 'تم الإظهار' : 'تم الإخفاء'); load();
    } catch { toast.error('خطأ في تغيير الحالة'); }
  };

  const del = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      const r = await fetch(`/api/admin/systems/${deleteId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      toast.success('تم الحذف'); setDeleteId(null); load();
    } catch { toast.error('خطأ في الحذف'); }
    finally { setDeleting(false); }
  };

  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const addFeature = () => setForm((p: any) => ({ ...p, features: [...(p.features || []), { ar: '', en: '' }] }));
  const updateFeature = (i: number, lang: 'ar' | 'en', val: string) =>
    setForm((p: any) => {
      const features = [...(p.features || [])];
      features[i] = { ...features[i], [lang]: val };
      return { ...p, features };
    });
  const removeFeature = (i: number) =>
    setForm((p: any) => ({ ...p, features: (p.features || []).filter((_: any, idx: number) => idx !== i) }));

  const addSpec = () => setForm((p: any) => {
    const specs = { ...(p.specs || {}) };
    specs[`spec_${Date.now()}`] = '';
    return { ...p, specs };
  });
  const updateSpecKey = (oldKey: string, newKey: string) =>
    setForm((p: any) => {
      const entries = Object.entries(p.specs || {});
      const idx = entries.findIndex(([k]) => k === oldKey);
      if (idx === -1) return p;
      entries[idx] = [newKey, entries[idx][1]];
      return { ...p, specs: Object.fromEntries(entries) };
    });
  const updateSpecVal = (key: string, val: string) =>
    setForm((p: any) => ({ ...p, specs: { ...(p.specs || {}), [key]: val } }));
  const removeSpec = (key: string) =>
    setForm((p: any) => {
      const specs = { ...(p.specs || {}) };
      delete specs[key];
      return { ...p, specs };
    });

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأنظمة الشمسية</h1>
          <p className="text-sm text-gray-500">{systems.length} نظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button onClick={openAdd} className="gap-2 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
            <Plus className="h-4 w-4" />إضافة نظام
          </Button>
        </div>
      </div>

      {loading ? <div className="py-16 text-center text-gray-400">جاري التحميل...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {systems.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="h-32 relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
                {s.coverImage ? (
                  <NextImage src={s.coverImage} alt={s.titleAr} fill className="object-cover" unoptimized />
                ) : (
                  <Zap className="h-14 w-14 text-amber-200" />
                )}
                <button onClick={() => toggle(s.id, s.isActive)}
                  className="absolute top-2 end-2 text-xs px-2.5 py-1 rounded-full font-medium border z-10"
                  style={{ backgroundColor: s.isActive ? '#ECFDF5' : '#F9FAFB', color: s.isActive ? '#10B981' : '#9CA3AF', borderColor: s.isActive ? '#10B981' : '#E5E7EB' }}>
                  {s.isActive ? 'نشط' : 'مخفي'}
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">{s.titleAr}</h3>
                <p className="text-xs text-gray-400">{TYPE_OPTIONS.find(t => t.value === s.type)?.label} | {s.minPower}-{s.maxPower} kW</p>
                <p className="text-sm font-bold" style={{ color: '#F5A623' }}>₪{s.pricePerWatt}/W</p>
                {Array.isArray(s.features) && s.features.length > 0 && (
                  <p className="text-xs text-gray-400">{s.features.length} ميزة</p>
                )}
                <div className="flex gap-1 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <Link href={`/ar/systems/${s.slug}`} target="_blank" className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-blue-500 hover:bg-blue-50 rounded-lg">
                    <Eye className="h-3.5 w-3.5" />عرض
                  </Link>
                  <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Pencil className="h-3.5 w-3.5" />تعديل
                  </button>
                  <button onClick={() => setDeleteId(s.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-3.5 w-3.5" />حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
          {systems.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #e5e7eb' }}>
              <Zap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">لا توجد أنظمة. أضف نظامك الأول.</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <h2 className="font-bold text-gray-900">{editId ? 'تعديل النظام' : 'إضافة نظام جديد'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">العنوان (عربي) *</Label>
                  <Input value={form.titleAr} onChange={e => f('titleAr', e.target.value)} placeholder="نظام متصل بالشبكة" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">العنوان (إنجليزي)</Label>
                  <Input value={form.titleEn} onChange={e => f('titleEn', e.target.value)} placeholder="On-Grid System" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">المعرف في الرابط *</Label>
                <Input value={form.slug} onChange={e => f('slug', e.target.value)} placeholder="on-grid-system" dir="ltr" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">نوع النظام</Label>
                <select value={form.type} onChange={e => f('type', e.target.value)} className="w-full h-10 px-3 text-sm rounded-md" style={{ border: '1px solid #e5e7eb' }}>
                  {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-sm font-medium">أدنى قدرة (kW)</Label><Input type="number" value={form.minPower} onChange={e => f('minPower', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">أقصى قدرة (kW)</Label><Input type="number" value={form.maxPower} onChange={e => f('maxPower', e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-medium">سعر/واط (₪)</Label><Input type="number" step="0.1" value={form.pricePerWatt} onChange={e => f('pricePerWatt', e.target.value)} /></div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">الوصف (عربي)</Label>
                <textarea value={form.descriptionAr} onChange={e => f('descriptionAr', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-md resize-none" style={{ border: '1px solid #e5e7eb' }} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">الوصف (إنجليزي)</Label>
                <textarea value={form.descriptionEn} onChange={e => f('descriptionEn', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-md resize-none" style={{ border: '1px solid #e5e7eb' }} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">رابط الصورة</Label>
                <Input value={form.coverImage} onChange={e => f('coverImage', e.target.value)} placeholder="https://..." dir="ltr" />
                {form.coverImage && (
                  <div className="relative h-20 w-full mt-1 rounded-lg overflow-hidden">
                    <NextImage src={form.coverImage} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">مزايا النظام</Label>
                  <button onClick={addFeature} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium">
                    <Plus className="h-3.5 w-3.5" />إضافة ميزة
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.features || []).map((feat: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                      <Input value={feat.ar} onChange={e => updateFeature(i, 'ar', e.target.value)} placeholder="الميزة بالعربي" className="h-8 text-xs flex-1" />
                      <Input value={feat.en} onChange={e => updateFeature(i, 'en', e.target.value)} placeholder="Feature in English" className="h-8 text-xs flex-1" dir="ltr" />
                      <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600 shrink-0"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {(!form.features || form.features.length === 0) && (
                    <p className="text-xs text-gray-400 text-center py-2">لا توجد مزايا. اضغط إضافة ميزة للبدء.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">المواصفات التقنية</Label>
                  <button onClick={addSpec} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium">
                    <Plus className="h-3.5 w-3.5" />إضافة مواصفة
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(form.specs || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                      <Input defaultValue={key} onBlur={e => { if (e.target.value !== key) updateSpecKey(key, e.target.value); }} placeholder="اسم المواصفة" className="h-8 text-xs flex-1" />
                      <Input value={val as string} onChange={e => updateSpecVal(key, e.target.value)} placeholder="القيمة" className="h-8 text-xs flex-1" dir="ltr" />
                      <button onClick={() => removeSpec(key)} className="text-red-400 hover:text-red-600 shrink-0"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {Object.keys(form.specs || {}).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">لا توجد مواصفات. اضغط إضافة مواصفة للبدء.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-6 pt-1">
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
                {saving ? 'جاري الحفظ...' : (editId ? 'حفظ التغييرات' : 'إضافة')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="حذف النظام"
        description="هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={del} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
