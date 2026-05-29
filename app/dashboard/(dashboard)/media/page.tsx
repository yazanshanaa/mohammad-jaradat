'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ImageIcon, Trash2, RefreshCw, Upload, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  filename: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
  folder: string;
  createdAt: string;
}

type FilterType = 'all' | 'image' | 'svg';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/admin/media').then(r => r.json());
      setItems(Array.isArray(data) ? data : []);
    } catch { toast.error('خطأ في التحميل'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('تم حذف الملف'); setDeleteId(null); load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطأ');
    } finally { setDeleting(false); }
  };

  const filtered = filter === 'all' ? items
    : filter === 'svg' ? items.filter(m => m.format === 'svg')
    : items.filter(m => m.format !== 'svg');

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مكتبة الوسائط</h1>
          <p className="text-sm text-gray-500">{items.length} ملف</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button onClick={() => setShowUpload(p => !p)} className="gap-2 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
            <Upload className="h-4 w-4" />رفع صورة
          </Button>
        </div>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
          <ImageUpload
            onUpload={(url) => { if (url) { setShowUpload(false); load(); } }}
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        {(['all', 'image', 'svg'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
            style={{
              backgroundColor: filter === f ? '#F5A623' : '#f3f4f6',
              color: filter === f ? 'white' : '#6b7280',
            }}
          >
            {f === 'all' ? 'الكل' : f === 'image' ? 'الصور' : 'SVG'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #e5e7eb' }}>
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">لا توجد ملفات. ارفع أول صورة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <div className="relative w-full aspect-square bg-gray-50">
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-700 truncate">{item.filename}</p>
                <p className="text-xs text-gray-400">{item.format.toUpperCase()} · {formatSize(item.size)}</p>
                {item.width && item.height && (
                  <p className="text-xs text-gray-300">{item.width}×{item.height}</p>
                )}
              </div>
              <button
                onClick={() => setDeleteId(item.id)}
                className="absolute top-2 left-2 bg-white/90 hover:bg-red-50 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="حذف الملف"
        description="هل أنت متأكد من حذف هذا الملف؟ سيتم حذفه من Cloudinary أيضاً."
        onConfirm={del}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
