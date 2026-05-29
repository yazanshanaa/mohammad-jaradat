'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, PhoneCall, FileCheck, CheckCircle, XCircle, Search, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_CONFIG = {
  NEW: { label: 'جديد', color: '#3B82F6', icon: Clock, bg: '#EFF6FF' },
  CONTACTED: { label: 'تم التواصل', color: '#F59E0B', icon: PhoneCall, bg: '#FFFBEB' },
  QUOTED: { label: 'عرض سعر', color: '#8B5CF6', icon: FileCheck, bg: '#F5F3FF' },
  WON: { label: 'مكتمل', color: '#10B981', icon: CheckCircle, bg: '#ECFDF5' },
  LOST: { label: 'خسارة', color: '#EF4444', icon: XCircle, bg: '#FEF2F2' },
};

const ALL_STATUSES = ['ALL', 'NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'] as const;

const USAGE_LABEL: Record<string, string> = {
  RESIDENTIAL: '🏠 منزلي',
  COMMERCIAL: '🏢 تجاري',
  INDUSTRIAL: '🏭 صناعي',
  AGRICULTURAL: '🌾 زراعي',
};

type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  usageType: string;
  monthlyBillIls: number;
  notes?: string;
  status: keyof typeof STATUS_CONFIG;
  createdAt: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input — only update debouncedSearch after 500ms of inactivity
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const fetchLeads = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status: filterStatus,
        page: String(page),
        limit: '20',
        search: debouncedSearch,
      });
      const res = await fetch(`/api/leads?${params}`);

      if (!res.ok) throw new Error('فشل في تحميل البيانات');

      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطأ غير متوقع';
      setError(message);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [filterStatus, page, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success('تم تحديث الحالة');
      fetchLeads(true);
    } catch {
      toast.error('خطأ في التحديث');
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('تم الحذف');
      fetchLeads(true);
    } catch {
      toast.error('خطأ في الحذف');
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العملاء المحتملون</h1>
          <p className="text-sm text-gray-500">{total} عميل إجمالاً</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLeads()}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 flex flex-wrap gap-3 items-center border border-gray-200">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو المنطقة..."
            className="pr-9 h-10 text-sm rounded-xl"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_STATUSES.map(s => {
            const cfg = s !== 'ALL' ? STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] : null;
            const isActive = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
              >
                {s === 'ALL' ? 'الكل' : cfg?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center space-y-3">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => fetchLeads()}>إعادة المحاولة</Button>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center">
            <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500">لا يوجد نتائج لهذا البحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['الاسم', 'الهاتف', 'المنطقة', 'النوع', 'الفاتورة', 'الحالة', 'التاريخ', 'إجراء'].map(h => (
                    <th key={h} className="px-6 py-4 text-right font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => {
                  const st = STATUS_CONFIG[lead.status];
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{lead.name}</div>
                        {lead.email && <div className="text-xs text-gray-400">{lead.email}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">{lead.phone}</td>
                      <td className="px-6 py-4 text-gray-600">{lead.location}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[11px] font-medium text-gray-600">
                          {USAGE_LABEL[lead.usageType] || lead.usageType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-700">₪{lead.monthlyBillIls}</td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                          className="text-[11px] px-3 py-1.5 rounded-full font-bold border-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition-all"
                          style={{ backgroundColor: st?.bg, color: st?.color }}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key} className="bg-white text-gray-900 font-normal">{cfg.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString('ar-PS', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && !loading && !error && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              عرض {leads.length} من أصل {total} عميل (صفحة {page} من {Math.ceil(total / 20)})
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl h-9 px-4"
                disabled={page === 1}
                onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
              >
                السابق
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl h-9 px-4"
                disabled={page * 20 >= total}
                onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
