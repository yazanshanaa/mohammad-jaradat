import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Users, Zap, FolderOpen, Mail, TrendingUp, Clock, CheckCircle, XCircle, PhoneCall, FileCheck } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  try {
    const [totalLeads, newLeads, wonLeads, totalProjects, totalSystems, totalSubscribers, recentLeads] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count({ where: { status: 'WON' } }),
      prisma.project.count({ where: { isActive: true } }),
      prisma.solarSystem.count({ where: { isActive: true } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, name: true, phone: true, location: true, usageType: true, status: true, createdAt: true, monthlyBillIls: true },
      }),
    ]);
    return { totalLeads, newLeads, wonLeads, totalProjects, totalSystems, totalSubscribers, recentLeads };
  } catch {
    return { totalLeads: 0, newLeads: 0, wonLeads: 0, totalProjects: 0, totalSystems: 0, totalSubscribers: 0, recentLeads: [] };
  }
}

const STATUS_CONFIG = {
  NEW: { label: 'جديد', color: '#3B82F6', icon: Clock, bg: '#EFF6FF' },
  CONTACTED: { label: 'تم التواصل', color: '#F59E0B', icon: PhoneCall, bg: '#FFFBEB' },
  QUOTED: { label: 'عرض سعر', color: '#8B5CF6', icon: FileCheck, bg: '#F5F3FF' },
  WON: { label: 'مكتمل', color: '#10B981', icon: CheckCircle, bg: '#ECFDF5' },
  LOST: { label: 'خسارة', color: '#EF4444', icon: XCircle, bg: '#FEF2F2' },
};

const USAGE_LABEL: Record<string, string> = {
  RESIDENTIAL: '🏠 منزلي',
  COMMERCIAL: '🏢 تجاري',
  INDUSTRIAL: '🏭 صناعي',
  AGRICULTURAL: '🌾 زراعي',
};

export default async function DashboardPage() {
  const _session = await auth();
  const stats = await getStats();

  const cards = [
    { label: 'إجمالي العملاء', value: stats.totalLeads, sub: `${stats.newLeads} جديد`, icon: Users, color: '#3B82F6', href: '/dashboard/leads' },
    { label: 'صفقات مكتملة', value: stats.wonLeads, sub: `${stats.totalLeads ? Math.round((stats.wonLeads / stats.totalLeads) * 100) : 0}% نسبة التحويل`, icon: TrendingUp, color: '#10B981', href: '/dashboard/leads?status=WON' },
    { label: 'المشاريع النشطة', value: stats.totalProjects, sub: `${stats.totalSystems} نظام متاح`, icon: FolderOpen, color: '#8B5CF6', href: '/dashboard/projects' },
    { label: 'مشتركو النشرة', value: stats.totalSubscribers, sub: 'مشترك نشط', icon: Mail, color: '#F59E0B', href: '/dashboard/leads' },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 mt-0.5">نظرة عامة على أداء الموقع</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="font-bold text-gray-900">آخر العملاء المحتملين</h2>
          <Link href="/dashboard/leads" className="text-sm font-medium" style={{ color: '#F5A623' }}>
            عرض الكل
          </Link>
        </div>

        {stats.recentLeads.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>لا يوجد عملاء محتملون بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  {['الاسم', 'الهاتف', 'المنطقة', 'نوع الاستخدام', 'الفاتورة', 'الحالة', 'التاريخ'].map(h => (
                    <th key={h} className="px-4 py-3 text-right font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.map((lead: any) => {
                  const st = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG];
                  const StatusIcon = st?.icon || Clock;
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{lead.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.location}</td>
                      <td className="px-4 py-3">{USAGE_LABEL[lead.usageType] || lead.usageType}</td>
                      <td className="px-4 py-3 font-semibold text-gray-700">₪{lead.monthlyBillIls}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: st?.bg, color: st?.color }}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {st?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString('ar-PS')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/systems', label: 'إدارة الأنظمة الشمسية', icon: Zap, color: '#F5A623' },
          { href: '/dashboard/projects', label: 'إضافة مشروع جديد', icon: FolderOpen, color: '#8B5CF6' },
          { href: '/dashboard/calculator-config', label: 'ضبط إعدادات الحاسبة', icon: TrendingUp, color: '#10B981' },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <span className="font-medium text-gray-800 text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
