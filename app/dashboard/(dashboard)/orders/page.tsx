'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, RefreshCw, Phone, MapPin, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'جديد', color: '#3B82F6', bg: '#EFF6FF' },
  { value: 'CONFIRMED', label: 'مؤكد', color: '#8B5CF6', bg: '#F5F3FF' },
  { value: 'PROCESSING', label: 'قيد التجهيز', color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'SHIPPED', label: 'تم الشحن', color: '#06B6D4', bg: '#ECFEFF' },
  { value: 'DELIVERED', label: 'تم التسليم', color: '#10B981', bg: '#ECFDF5' },
  { value: 'CANCELLED', label: 'ملغي', color: '#EF4444', bg: '#FEF2F2' },
];

function statusMeta(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      if (!res.ok) toast.error(data?.error || 'خطأ في التحميل');
    } catch { toast.error('خطأ في الاتصال'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const r = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error();
      toast.success('تم تحديث الحالة');
      load();
    } catch { toast.error('خطأ في التحديث'); }
  };

  const del = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      const r = await fetch(`/api/admin/orders/${deleteId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      toast.success('تم حذف الطلب'); setDeleteId(null); load();
    } catch { toast.error('خطأ في الحذف'); }
    finally { setDeleting(false); }
  };

  const whatsappLink = (phone: string, orderNumber: string) => {
    const num = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`مرحباً، بخصوص طلبكم رقم ${orderNumber} 📦`);
    return `https://wa.me/${num}?text=${msg}`;
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const counts: Record<string, number> = { ALL: orders.length };
  STATUS_OPTIONS.forEach(s => { counts[s.value] = orders.filter(o => o.status === s.value).length; });

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
          <p className="text-sm text-gray-500">{orders.length} طلب إجمالي</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
      </div>

      {/* فلاتر الحالة */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('ALL')}
          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
          style={{ backgroundColor: filter === 'ALL' ? '#0A2540' : '#f9fafb', color: filter === 'ALL' ? '#fff' : '#6b7280', borderColor: filter === 'ALL' ? '#0A2540' : '#e5e7eb' }}>
          الكل ({counts['ALL']})
        </button>
        {STATUS_OPTIONS.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={{ backgroundColor: filter === s.value ? s.bg : '#f9fafb', color: filter === s.value ? s.color : '#6b7280', borderColor: filter === s.value ? s.color : '#e5e7eb' }}>
            {s.label} ({counts[s.value] || 0})
          </button>
        ))}
      </div>

      {loading ? <div className="py-16 text-center text-gray-400">جاري التحميل...</div> : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const meta = statusMeta(order.status);
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                {/* رأس الطلب */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{order.orderNumber}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{order.customerName}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />{order.customerPhone}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />{order.customerAddress}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold" style={{ color: '#F5A623' }}>₪{order.totalAmount.toFixed(2)}</span>

                      {/* تغيير الحالة */}
                      <div className="relative">
                        <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                          className="text-xs py-1.5 px-2 pe-6 rounded-lg border appearance-none cursor-pointer font-medium"
                          style={{ borderColor: meta.color, color: meta.color, backgroundColor: meta.bg }}>
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute top-1.5 left-1.5 h-3 w-3 pointer-events-none" style={{ color: meta.color }} />
                      </div>

                      {/* واتساب */}
                      <a href={whatsappLink(order.customerPhone, order.orderNumber)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ backgroundColor: '#25D366' }}>
                        واتساب
                      </a>

                      {/* توسيع */}
                      <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 border"
                        style={{ borderColor: '#e5e7eb' }}>
                        {isExpanded ? '▲ إخفاء' : '▼ تفاصيل'}
                      </button>

                      {/* حذف */}
                      <button onClick={() => setDeleteId(order.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="mt-2 text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg">
                      ملاحظات: {order.notes}
                    </p>
                  )}
                </div>

                {/* تفاصيل العناصر */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0" style={{ borderTop: '1px solid #f3f4f6' }}>
                    <p className="text-xs font-semibold text-gray-500 mb-2 pt-3">عناصر الطلب:</p>
                    <div className="space-y-2">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl text-sm" style={{ backgroundColor: '#f9fafb' }}>
                          <span className="font-medium text-gray-800">{item.productNameAr}</span>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>الكمية: {item.quantity}</span>
                            <span className="font-bold" style={{ color: '#F5A623' }}>₪{(item.unitPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #e5e7eb' }}>
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">لا توجد طلبات {filter !== 'ALL' ? 'بهذه الحالة' : 'حتى الآن'}.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="حذف الطلب"
        description="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={del} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
